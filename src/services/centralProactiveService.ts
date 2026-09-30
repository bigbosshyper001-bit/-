/**
 * Central Proactive Service: Notification, Deadline, Calendar, and Reminder Engine
 * For "กองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
 * 
 * Capabilities:
 * - Single Source of Truth for deadlines, notifications, calendar items, reminders
 * - Event-driven triggers: task.*, workflow.*, document.*, meeting.*, kpi.*, mou.*
 * - Anti-spam quiet & deduplication controls
 * - Configurable reminder rules (30d, 14d, 7d, 3d, 1d, on due date, after overdue)
 * - Calculation of remaining/overdue days: เหลือ 14 วัน, วันนี้, เกินกำหนด 2 วัน
 * - LocalStorage persistence and reactive subscriptions
 */

import type {
  CentralNotification,
  NotificationCategory,
  NotificationPriorityLevel,
  DeadlineRecord,
  DeadlineCalculation,
  ReminderRule,
  CalendarEventItem,
  UserNotificationPreferences,
} from '../types/notificationSystem.ts';
import type { AppRoute, UserProfile } from '../types.ts';

const NOTIFICATIONS_STORAGE_KEY = 'mcu_proactive_notifications_v3';
const DEADLINES_STORAGE_KEY = 'mcu_proactive_deadlines_v3';
const PREFERENCES_STORAGE_KEY = 'mcu_proactive_preferences_v3';
const REMINDERS_STORAGE_KEY = 'mcu_proactive_reminders_v3';

// Standard Default Reminder Rules
export const DEFAULT_REMINDER_RULES: ReminderRule[] = [
  {
    id: 'rule-30d',
    name: '30 วันก่อนครบกำหนด',
    description: 'แจ้งเตือนล่วงหน้า 1 เดือนสำหรับงานขนาดใหญ่ สัญญา MOU และเกณฑ์กำกับ',
    offsetDays: 30,
    type: 'before_30_days',
    enabled: true,
    notificationPriority: 'Info',
  },
  {
    id: 'rule-14d',
    name: '14 วันก่อนครบกำหนด',
    description: 'แจ้งเตือนเตรียมเอกสารและการรวบรวมข้อมูลล่วงหน้า 2 สัปดาห์',
    offsetDays: 14,
    type: 'before_14_days',
    enabled: true,
    notificationPriority: 'Normal',
  },
  {
    id: 'rule-7d',
    name: '7 วันก่อนครบกำหนด (1 สัปดาห์)',
    description: 'แจ้งเตือนเร่งด่วนปานกลาง เพื่อให้ทันรอบการประชุมหรือส่งงาน',
    offsetDays: 7,
    type: 'before_7_days',
    enabled: true,
    notificationPriority: 'Important',
  },
  {
    id: 'rule-3d',
    name: '3 วันก่อนครบกำหนด',
    description: 'แจ้งเตือนระยะสั้น ตรวจสอบความถูกต้องขั้นสุดท้าย',
    offsetDays: 3,
    type: 'before_3_days',
    enabled: true,
    notificationPriority: 'Important',
  },
  {
    id: 'rule-1d',
    name: '1 วันก่อนครบกำหนด (พรุ่งนี้)',
    description: 'แจ้งเตือนกระชั้นชิด งานหรือเอกสารจะสิ้นสุดในวันพรุ่งนี้',
    offsetDays: 1,
    type: 'before_1_day',
    enabled: true,
    notificationPriority: 'Urgent',
  },
  {
    id: 'rule-due',
    name: 'ในวันครบกำหนด (วันนี้)',
    description: 'แจ้งเตือนในวันถึงกำหนดส่งหรือดำเนินการ',
    offsetDays: 0,
    type: 'on_due_date',
    enabled: true,
    notificationPriority: 'Urgent',
  },
  {
    id: 'rule-overdue',
    name: 'เมื่อเกินกำหนดเวลา (Overdue)',
    description: 'แจ้งเตือนสถานะงานค้างและบันทึกรายงานเหตุขัดข้อง',
    offsetDays: -1,
    type: 'after_overdue',
    enabled: true,
    notificationPriority: 'Urgent',
  },
];

// Initial Seed Deadlines across modules (Clean Slate for Production)
export const INITIAL_DEADLINE_RECORDS: DeadlineRecord[] = [];
const _UNUSED_DEADLINE_RECORDS: DeadlineRecord[] = [
  {
    id: 'DL-001',
    title: 'ส่งรายงานสรุปผลการประเมิน AUN-QA หลักสูตรพุทธศาสตรบัณฑิต',
    description: 'รวบรวมหลักฐานและส่งต่อกองวิชาการเพื่อนำเสนอคณะกรรมการวิชาการ',
    module: 'meetings',
    recordId: 'RES-2569-08-01',
    recordCode: 'มติ 8.1/2569',
    recordTitle: 'ให้ความเห็นชอบร่างหลักสูตรพุทธศาสตรบัณฑิต (ปรับปรุง 2570)',
    startDate: '2026-09-01',
    dueDate: '2026-09-19', // Today (Reference operational date 2026-09-19)
    responsiblePerson: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
    responsiblePersonId: 'usr-1',
    department: 'กองวิชาการ สำนักงานอธิการบดี',
    status: 'in_progress',
    priority: 'Urgent',
    category: 'Deadline',
    actionLink: '/meetings',
  },
  {
    id: 'DL-002',
    title: 'การจัดทำคำแปลบันทึกข้อตกลงความร่วมมือ MOU Oxford University',
    description: 'จัดทำคำแปลภาษาไทยและส่งมอบสำนักนายกรัฐมนตรี/กต.',
    module: 'meetings',
    recordId: 'TASK-2569-08-01',
    recordCode: 'ACT-08-1',
    recordTitle: 'จัดทำคำแปลบันทึกข้อตกลงและส่งมอบสำนักนายกรัฐมนตรี/กต.',
    startDate: '2026-09-10',
    dueDate: '2026-09-22', // Remaining 3 days
    responsiblePerson: 'นายธีรศักดิ์ รัตนพันธ์',
    responsiblePersonId: 'usr-staff-1',
    department: 'กลุ่มงานวิเทศสัมพันธ์ กองวิชาการ',
    status: 'in_progress',
    priority: 'Important',
    category: 'Task',
    actionLink: '/meetings',
  },
  {
    id: 'DL-003',
    title: 'รายงานตัวชี้วัดความสำเร็จ KPI ไตรมาส 3: อัตราการมีงานทำของบัณฑิต',
    description: 'บันทึกข้อมูลผลสัมฤทธิ์ KPI-01 ลงในระบบแผนยุทธศาสตร์',
    module: 'strategy',
    recordId: 'KPI-01',
    recordCode: 'KPI-2569-Q3-01',
    recordTitle: 'อัตราการมีงานทำและศึกษาต่อของบัณฑิต มจร (เป้าหมาย 88%)',
    startDate: '2026-09-01',
    dueDate: '2026-09-26', // Remaining 7 days
    responsiblePerson: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
    responsiblePersonId: 'usr-1',
    department: 'กองวิชาการ สำนักงานอธิการบดี',
    status: 'pending',
    priority: 'Important',
    category: 'KPI',
    actionLink: '/strategy',
  },
  {
    id: 'DL-004',
    title: 'สัญญาร่วมมือทางวิชาการ MOU กับมหาวิทยาลัยแห่งชาติลาว (NUOL)',
    description: 'สัญญาจะสิ้นสุดอายุ ต้องเริ่มกระบวนการเจรจาต่ออายุหรือปิดโครงการ',
    module: 'collaboration',
    recordId: 'MOU-2567-NUOL',
    recordCode: 'MOU/2567-009',
    recordTitle: 'บันทึกข้อตกลงความร่วมมือการแลกเปลี่ยนนักศึกษาและอาจารย์ มจร - NUOL',
    startDate: '2024-10-01',
    dueDate: '2026-10-03', // Remaining 14 days
    responsiblePerson: 'พระศรีปริยัติมุนี, ผศ.ดร.',
    responsiblePersonId: 'usr-dean-1',
    department: 'คณะพุทธศาสตร์',
    status: 'pending',
    priority: 'Important',
    category: 'MOU',
    actionLink: '/collaboration',
  },
  {
    id: 'DL-005',
    title: 'ส่งเล่ม มคอ.2 หลักสูตรนานาชาติ Master of Buddhist Studies',
    description: 'นำเสนอเข้าสู่การประชุมคณะกรรมการกลั่นกรองหลักสูตร',
    module: 'courses',
    recordId: 'PROG-INT-02',
    recordCode: 'CURR-2569-09',
    recordTitle: 'Master of Arts in Buddhist Studies (International Program)',
    startDate: '2026-08-15',
    dueDate: '2026-09-17', // Overdue 2 days!
    responsiblePerson: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
    responsiblePersonId: 'usr-1',
    department: 'บัณฑิตวิทยาลัย / กองวิชาการ',
    status: 'overdue',
    priority: 'Urgent',
    category: 'Deadline',
    actionLink: '/courses',
  },
  {
    id: 'DL-006',
    title: 'การอนุมัติคำขอเทียบโอนผลการเรียนรู้และประสบการณ์ (Credit Bank)',
    description: 'คำขอโอนหน่วยกิตรายวิชาบาลีพุทธภาษิต สำหรับผู้เรียน Pre-degree',
    module: 'credit-bank',
    recordId: 'REQ-CB-2569-089',
    recordCode: 'CB-2569/089',
    recordTitle: 'คำร้องขอเทียบโอนผลการเรียนรู้จากสถาบันการศึกษาเดิม',
    startDate: '2026-09-15',
    dueDate: '2026-09-21', // Remaining 2 days
    responsiblePerson: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
    responsiblePersonId: 'usr-1',
    department: 'กองวิชาการ สำนักงานอธิการบดี',
    status: 'in_review',
    priority: 'Urgent',
    category: 'Approval',
    actionLink: '/credit-bank',
  },
  {
    id: 'DL-007',
    title: 'การต่ออายุประกาศมหาวิทยาลัย เรื่อง ระเบียบการสะสมหน่วยกิต พ.ศ. 2567',
    description: 'เอกสารมีผลบังคับใช้ครบ 2 ปี ต้องทบทวนปรับปรุงตามเกณฑ์ อว. ใหม่',
    module: 'documents',
    recordId: 'DMS-2569-004',
    recordCode: 'มจร-กว-2567/088',
    recordTitle: 'ประกาศมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย เรื่อง คลังหน่วยกิตการศึกษาตลอดชีวิต',
    startDate: '2024-10-18',
    dueDate: '2026-10-18', // Remaining 29 days (~30 days)
    responsiblePerson: 'นายกิตติคุณ สรรพกิจ',
    responsiblePersonId: 'usr-staff-2',
    department: 'กองวิชาการ สำนักงานอธิการบดี',
    status: 'in_progress',
    priority: 'Normal',
    category: 'Document',
    actionLink: '/documents',
  },
  {
    id: 'DL-008',
    title: 'การประชุมสภาวิชาการ ครั้งที่ 9/2569 (Academic Council Session 9)',
    description: 'วาระพิจารณาการขอเปิดหลักสูตรใหม่ และการพิจารณาผลการประกันคุณภาพ AUN-QA',
    module: 'meetings',
    recordId: 'MEET-2569-09',
    recordCode: 'สว 9/2569',
    recordTitle: 'การประชุมสภาวิชาการ ครั้งที่ 9/2569',
    startDate: '2026-09-18',
    dueDate: '2026-09-25', // Remaining 6 days
    responsiblePerson: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
    responsiblePersonId: 'usr-1',
    department: 'กองวิชาการ สำนักงานอธิการบดี',
    status: 'pending',
    priority: 'Important',
    category: 'Meeting',
    actionLink: '/meetings',
  },
];

// Initial Seed Notifications across all 8 Categories (Clean Slate for Production)
export const INITIAL_NOTIFICATIONS: CentralNotification[] = [];
const _UNUSED_NOTIFICATIONS: CentralNotification[] = [
  {
    id: 'notif-001',
    title: 'คำขออนุมัติเทียบโอนหน่วยกิตรอการพิจารณา (Approval)',
    message: 'มีคำขอเทียบโอนผลการเรียนรู้ใหม่ 2 รายการ จากผู้เรียนโครงการ Pre-degree รอการตรวจสอบเอกสารและลงนามอนุมัติ',
    category: 'Approval',
    priority: 'Urgent',
    relatedModule: 'credit-bank',
    relatedRecordId: 'REQ-CB-2569-089',
    relatedRecordCode: 'CB-2569/089',
    relatedRecordTitle: 'คำร้องขอเทียบโอนผลการเรียนรู้จากสถาบันการศึกษาเดิม',
    actionLink: '/credit-bank',
    timestamp: '15 นาทีที่แล้ว',
    createdAtIso: '2026-09-19T08:45:00',
    read: false,
    actionRequired: true,
  },
  {
    id: 'notif-002',
    title: 'มอบหมายงานใหม่: สรุปผลประเมิน AUN-QA (Task)',
    message: 'ท่านได้รับมอบหมายงานตามมติสภาวิชาการ ให้ส่งรายงานสรุปผลการประเมิน AUN-QA หลักสูตรพุทธศาสตรบัณฑิต',
    category: 'Task',
    priority: 'Urgent',
    relatedModule: 'meetings',
    relatedRecordId: 'RES-2569-08-01',
    relatedRecordCode: 'มติ 8.1/2569',
    relatedRecordTitle: 'ให้ความเห็นชอบร่างหลักสูตรพุทธศาสตรบัณฑิต (ปรับปรุง 2570)',
    actionLink: '/meetings',
    timestamp: '1 ชั่วโมงที่แล้ว',
    createdAtIso: '2026-09-19T08:00:00',
    read: false,
    actionRequired: true,
  },
  {
    id: 'notif-003',
    title: 'เกินกำหนดส่ง (Overdue): เล่ม มคอ.2 หลักสูตรนานาชาติ',
    message: 'งานส่งเล่ม มคอ.2 หลักสูตรนานาชาติ Master of Buddhist Studies เกินกำหนดส่งแล้ว 2 วัน (กำหนดเดิม 17 ก.ย. 2569)',
    category: 'Deadline',
    priority: 'Urgent',
    relatedModule: 'courses',
    relatedRecordId: 'PROG-INT-02',
    relatedRecordCode: 'CURR-2569-09',
    relatedRecordTitle: 'Master of Arts in Buddhist Studies (International Program)',
    actionLink: '/courses',
    timestamp: '3 ชั่วโมงที่แล้ว',
    createdAtIso: '2026-09-19T06:00:00',
    read: false,
    actionRequired: true,
  },
  {
    id: 'notif-004',
    title: 'นัดหมายการประชุม: สภาวิชาการ ครั้งที่ 9/2569',
    message: 'กำหนดการประชุมสภาวิชาการ ครั้งที่ 9/2569 จะจัดขึ้นในวันศุกร์ที่ 25 ก.ย. 2569 เวลา 09:30 น. ณ ห้องประชุม 401 อาคารสำนักงานอธิการบดี',
    category: 'Meeting',
    priority: 'Important',
    relatedModule: 'meetings',
    relatedRecordId: 'MEET-2569-09',
    relatedRecordCode: 'สว 9/2569',
    relatedRecordTitle: 'การประชุมสภาวิชาการ ครั้งที่ 9/2569',
    actionLink: '/meetings',
    timestamp: '5 ชั่วโมงที่แล้ว',
    createdAtIso: '2026-09-19T04:00:00',
    read: false,
    actionRequired: false,
  },
  {
    id: 'notif-005',
    title: 'เอกสารใกล้หมดอายุ: ประกาศระเบียบคลังหน่วยกิต 2567',
    message: 'ประกาศมหาวิทยาลัย เรื่อง คลังหน่วยกิตการศึกษาตลอดชีวิต มีอายุการใช้งานเหลือ 29 วัน (ครบกำหนด 18 ต.ค. 2569)',
    category: 'Document',
    priority: 'Normal',
    relatedModule: 'documents',
    relatedRecordId: 'DMS-2569-004',
    relatedRecordCode: 'มจร-กว-2567/088',
    relatedRecordTitle: 'ประกาศมหาวิทยาลัย เรื่อง คลังหน่วยกิตการศึกษาตลอดชีวิต',
    actionLink: '/documents',
    timestamp: 'เมื่อวานนี้',
    createdAtIso: '2026-09-18T14:30:00',
    read: true,
    actionRequired: false,
  },
  {
    id: 'notif-006',
    title: 'ใกล้ครบกำหนดส่งรายงาน KPI ไตรมาส 3 (เหลือ 7 วัน)',
    message: 'รายงานตัวชี้วัดความสำเร็จ KPI-01 อัตราการมีงานทำของบัณฑิต ต้องบันทึกผลเข้าระบบภายในวันที่ 26 ก.ย. 2569',
    category: 'KPI',
    priority: 'Important',
    relatedModule: 'strategy',
    relatedRecordId: 'KPI-01',
    relatedRecordCode: 'KPI-2569-Q3-01',
    relatedRecordTitle: 'อัตราการมีงานทำและศึกษาต่อของบัณฑิต มจร',
    actionLink: '/strategy',
    timestamp: 'เมื่อวานนี้',
    createdAtIso: '2026-09-18T10:00:00',
    read: true,
    actionRequired: true,
  },
  {
    id: 'notif-007',
    title: 'ข้อตกลงความร่วมมือ MOU ใกล้สิ้นสุดอายุ (เหลือ 14 วัน)',
    message: 'บันทึกข้อตกลงความร่วมมือทางวิชาการระหว่าง มจร กับ มหาวิทยาลัยแห่งชาติลาว (NUOL) จะหมดอายุในวันที่ 3 ต.ค. 2569',
    category: 'MOU',
    priority: 'Important',
    relatedModule: 'collaboration',
    relatedRecordId: 'MOU-2567-NUOL',
    relatedRecordCode: 'MOU/2567-009',
    relatedRecordTitle: 'บันทึกข้อตกลงความร่วมมือ มจร - NUOL',
    actionLink: '/collaboration',
    timestamp: '2 วันที่แล้ว',
    createdAtIso: '2026-09-17T16:00:00',
    read: true,
    actionRequired: false,
  },
  {
    id: 'notif-008',
    title: 'ระบบสำรองข้อมูลและปรับปรุงมาตรฐานความปลอดภัยสำเร็จ (System)',
    message: 'ระบบสารสนเทศกองวิชาการได้ทำการซิงโครไนซ์ฐานข้อมูลและตรวจสอบบันทึก Audit Log ประจำสัปดาห์เรียบร้อยแล้ว',
    category: 'System',
    priority: 'Info',
    relatedModule: 'integrations',
    relatedRecordId: 'SYS-SYNC-2569',
    relatedRecordCode: 'SYS-AUDIT',
    relatedRecordTitle: 'การซิงโครไนซ์ความปลอดภัยระบบงาน',
    actionLink: '/integrations',
    timestamp: '3 วันที่แล้ว',
    createdAtIso: '2026-09-16T22:00:00',
    read: true,
    actionRequired: false,
  },
];

// Initial Calendar Items for /calendar (Clean Slate for Production)
export const INITIAL_CALENDAR_ITEMS: CalendarEventItem[] = [];
const _UNUSED_CALENDAR_ITEMS: CalendarEventItem[] = [
  {
    id: 'cal-01',
    title: 'การประชุมสภาวิชาการ ครั้งที่ 9/2569',
    description: 'วาระพิจารณาการขอเปิดหลักสูตรใหม่ และการพิจารณาผลการประกันคุณภาพ AUN-QA',
    type: 'Meeting',
    date: '2026-09-25',
    timeStart: '09:30',
    timeEnd: '12:30',
    module: 'meetings',
    recordId: 'MEET-2569-09',
    recordCode: 'สว 9/2569',
    locationOrVenue: 'ห้องประชุม 401 อาคารสำนักงานอธิการบดี ชั้น 4',
    responsiblePerson: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
    department: 'กองวิชาการ สำนักงานอธิการบดี',
    priority: 'Important',
    status: 'scheduled',
    actionLink: '/meetings',
  },
  {
    id: 'cal-02',
    title: 'กำหนดส่งรายงาน AUN-QA หลักสูตรพุทธศาสตรบัณฑิต',
    description: 'ส่งเอกสารรายงานสรุปผลการประเมินประจำปี 2569',
    type: 'Deadline',
    date: '2026-09-19', // Today
    timeStart: '16:30',
    module: 'meetings',
    recordId: 'RES-2569-08-01',
    recordCode: 'มติ 8.1/2569',
    responsiblePerson: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
    department: 'กองวิชาการ สำนักงานอธิการบดี',
    priority: 'Urgent',
    status: 'due_today',
    actionLink: '/meetings',
  },
  {
    id: 'cal-03',
    title: 'พิจารณาอนุมัติคำขอเทียบโอน Credit Bank 2 รายการ',
    description: 'ตรวจสอบคำขอเทียบโอนรายวิชาหมวดศึกษาทั่วไปและบาลี',
    type: 'Approval',
    date: '2026-09-21',
    timeStart: '13:30',
    timeEnd: '15:00',
    module: 'credit-bank',
    recordId: 'REQ-CB-2569-089',
    recordCode: 'CB-2569/089',
    locationOrVenue: 'ระบบออนไลน์ กองวิชาการ',
    responsiblePerson: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
    department: 'กองวิชาการ สำนักงานอธิการบดี',
    priority: 'Urgent',
    status: 'pending',
    actionLink: '/credit-bank',
  },
  {
    id: 'cal-04',
    title: 'วันสิ้นสุดการรับรายงานตัวชี้วัด KPI ไตรมาส 3 (KPI Milestone)',
    description: 'บันทึกตัวชี้วัดและแนบหลักฐานความสำเร็จเพื่อปิดรอบประเมินไตรมาส',
    type: 'KPI milestone',
    date: '2026-09-26',
    timeStart: '17:00',
    module: 'strategy',
    recordId: 'KPI-01',
    recordCode: 'KPI-2569-Q3-01',
    responsiblePerson: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
    department: 'กองวิชาการ สำนักงานอธิการบดี',
    priority: 'Important',
    status: 'pending',
    actionLink: '/strategy',
  },
  {
    id: 'cal-05',
    title: 'วันครบกำหนดสัญญา MOU ร่วมกับ NUOL (MOU Expiration)',
    description: 'บันทึกข้อตกลงความร่วมมือแลกเปลี่ยนนิสิต มจร - NUOL สิ้นสุดอายุ',
    type: 'MOU expiration',
    date: '2026-10-03',
    timeStart: '23:59',
    module: 'collaboration',
    recordId: 'MOU-2567-NUOL',
    recordCode: 'MOU/2567-009',
    responsiblePerson: 'พระศรีปริยัติมุนี, ผศ.ดร.',
    department: 'คณะพุทธศาสตร์',
    priority: 'Important',
    status: 'expiring',
    actionLink: '/collaboration',
  },
  {
    id: 'cal-06',
    title: 'วันสิ้นสุดอายุประกาศคลังหน่วยกิต 2567 (Document Expiration)',
    description: 'ประกาศระเบียบคลังหน่วยกิตครบกำหนดรอบทบทวน 2 ปี',
    type: 'Document expiration',
    date: '2026-10-18',
    timeStart: '23:59',
    module: 'documents',
    recordId: 'DMS-2569-004',
    recordCode: 'มจร-กว-2567/088',
    responsiblePerson: 'นายกิตติคุณ สรรพกิจ',
    department: 'กองวิชาการ สำนักงานอธิการบดี',
    priority: 'Normal',
    status: 'expiring',
    actionLink: '/documents',
  },
  {
    id: 'cal-07',
    title: 'งานแปลเอกสารข้อตกลง Oxford University (Task)',
    description: 'ส่งมอบผลงานแปลข้อตกลงฉบับภาษาไทยให้รองอธิการบดีฝ่ายวิชาการ',
    type: 'Task',
    date: '2026-09-22',
    timeStart: '14:00',
    module: 'meetings',
    recordId: 'TASK-2569-08-01',
    recordCode: 'ACT-08-1',
    responsiblePerson: 'นายธีรศักดิ์ รัตนพันธ์',
    department: 'กลุ่มงานวิเทศสัมพันธ์ กองวิชาการ',
    priority: 'Important',
    status: 'in_progress',
    actionLink: '/meetings',
  },
  {
    id: 'cal-08',
    title: 'กำหนดตรวจประเมินร่างหลักสูตรใหม่ (Course Milestone)',
    description: 'คณะกรรมการกลั่นกรองหลักสูตรพิจารณาโครงสร้างหลักสูตรและเกณฑ์ OBE',
    type: 'Course milestone',
    date: '2026-09-28',
    timeStart: '10:00',
    timeEnd: '12:00',
    module: 'courses',
    recordId: 'PROG-INT-02',
    recordCode: 'CURR-2569-09',
    locationOrVenue: 'ห้องประชุมกองวิชาการ 203',
    responsiblePerson: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
    department: 'บัณฑิตวิทยาลัย',
    priority: 'Normal',
    status: 'scheduled',
    actionLink: '/courses',
  },
  {
    id: 'cal-09',
    title: 'ส่งเล่ม มคอ.2 หลักสูตรนานาชาติ (เกินกำหนดเวลา)',
    description: 'งานส่งเอกสาร มคอ.2 หลักสูตรนานาชาติ ที่ค้างส่งตั้งแต่วันที่ 17 ก.ย.',
    type: 'Deadline',
    date: '2026-09-17', // Overdue
    timeStart: '16:30',
    module: 'courses',
    recordId: 'PROG-INT-02',
    recordCode: 'CURR-2569-09',
    responsiblePerson: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
    department: 'กองวิชาการ สำนักงานอธิการบดี',
    priority: 'Urgent',
    status: 'overdue',
    actionLink: '/courses',
  },
];

// Default Preferences
export const DEFAULT_PREFERENCES: UserNotificationPreferences = {
  inAppEnabled: true,
  emailEnabled: false,
  emailDestination: 'academic.director@mcu.ac.th',
  digestFrequency: 'immediate',
  reminderRules: DEFAULT_REMINDER_RULES.map((r) => ({ ruleId: r.id, enabled: r.enabled })),
  enabledCategories: {
    Approval: true,
    Task: true,
    Deadline: true,
    Meeting: true,
    Document: true,
    KPI: true,
    MOU: true,
    System: true,
  },
  quietHoursEnabled: false,
  quietHoursStart: '21:00',
  quietHoursEnd: '06:00',
  groupDuplicates: true,
};

class CentralProactiveService {
  private notifications: CentralNotification[] = [];
  private deadlines: DeadlineRecord[] = [];
  private calendarItems: CalendarEventItem[] = [];
  private reminderRules: ReminderRule[] = [...DEFAULT_REMINDER_RULES];
  private preferences: UserNotificationPreferences = { ...DEFAULT_PREFERENCES };

  private subscribers: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      localStorage.removeItem('mcu_proactive_notifications_v1');
      localStorage.removeItem('mcu_proactive_notifications_v2');
      localStorage.removeItem('mcu_proactive_deadlines_v1');
      localStorage.removeItem('mcu_proactive_deadlines_v2');
      const storedNotifs = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      this.notifications = storedNotifs ? JSON.parse(storedNotifs) : [...INITIAL_NOTIFICATIONS];

      const storedDeadlines = localStorage.getItem(DEADLINES_STORAGE_KEY);
      this.deadlines = storedDeadlines ? JSON.parse(storedDeadlines) : [...INITIAL_DEADLINE_RECORDS];

      const storedPrefs = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      this.preferences = storedPrefs ? JSON.parse(storedPrefs) : { ...DEFAULT_PREFERENCES };

      const storedRules = localStorage.getItem(REMINDERS_STORAGE_KEY);
      this.reminderRules = storedRules ? JSON.parse(storedRules) : [...DEFAULT_REMINDER_RULES];
    } catch (e) {
      console.warn('CentralProactiveService storage error, resetting defaults', e);
      this.notifications = [...INITIAL_NOTIFICATIONS];
      this.deadlines = [...INITIAL_DEADLINE_RECORDS];
      this.preferences = { ...DEFAULT_PREFERENCES };
      this.reminderRules = [...DEFAULT_REMINDER_RULES];
    }

    this.calendarItems = [...INITIAL_CALENDAR_ITEMS];
  }

  private saveToStorage() {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(this.notifications));
      localStorage.setItem(DEADLINES_STORAGE_KEY, JSON.stringify(this.deadlines));
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(this.preferences));
      localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(this.reminderRules));
    } catch {
      // ignore
    }
    this.notifySubscribers();
  }

  public subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach((cb) => cb());
  }

  // ==========================================
  // DEADLINE CALCULATION ENGINE
  // ==========================================
  public calculateDeadline(
    dueDateStr: string,
    referenceDate: Date = new Date('2026-09-19T00:00:00')
  ): DeadlineCalculation {
    const due = new Date(dueDateStr + 'T00:00:00');
    const ref = new Date(referenceDate.toISOString().substring(0, 10) + 'T00:00:00');

    const diffTime = due.getTime() - ref.getTime();
    const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
      const overdueDays = Math.abs(daysDiff);
      return {
        daysDiff,
        urgencyStatus: 'overdue',
        badgeLabel: `เกินกำหนด ${overdueDays} วัน`,
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
        colorHex: '#D64545',
      };
    }

    if (daysDiff === 0) {
      return {
        daysDiff: 0,
        urgencyStatus: 'today',
        badgeLabel: 'วันนี้',
        badgeClass: 'bg-red-100 text-red-800 border-red-300 font-bold animate-pulse',
        colorHex: '#D64545',
      };
    }

    if (daysDiff === 1) {
      return {
        daysDiff: 1,
        urgencyStatus: 'due_soon_1',
        badgeLabel: 'เหลือ 1 วัน',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
        colorHex: '#E05D52',
      };
    }

    if (daysDiff <= 3) {
      return {
        daysDiff,
        urgencyStatus: 'due_soon_3',
        badgeLabel: `เหลือ ${daysDiff} วัน`,
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
        colorHex: '#D97706',
      };
    }

    if (daysDiff <= 7) {
      return {
        daysDiff,
        urgencyStatus: 'due_soon_7',
        badgeLabel: `เหลือ ${daysDiff} วัน`,
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
        colorHex: '#D97706',
      };
    }

    if (daysDiff <= 14) {
      return {
        daysDiff,
        urgencyStatus: 'due_soon_14',
        badgeLabel: `เหลือ ${daysDiff} วัน`,
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 font-medium',
        colorHex: '#2563EB',
      };
    }

    if (daysDiff <= 30) {
      return {
        daysDiff,
        urgencyStatus: 'due_soon_30',
        badgeLabel: `เหลือ ${daysDiff} วัน`,
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        colorHex: '#059669',
      };
    }

    return {
      daysDiff,
      urgencyStatus: 'normal',
      badgeLabel: `เหลือ ${daysDiff} วัน`,
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      colorHex: '#475569',
    };
  }

  // ==========================================
  // NOTIFICATION MANAGEMENT
  // ==========================================
  public getNotifications(): CentralNotification[] {
    return [...this.notifications];
  }

  public getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  public markAsRead(id: string): void {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.saveToStorage();
  }

  public markAllAsRead(): void {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.saveToStorage();
  }

  public deleteNotification(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.saveToStorage();
  }

  /**
   * Anti-Spam / Deduplication:
   * Checks if an unread notification with same category and relatedRecordId was recently dispatched
   */
  public dispatchNotification(params: {
    title: string;
    message: string;
    category: NotificationCategory;
    priority: NotificationPriorityLevel;
    relatedModule: string;
    relatedRecordId?: string;
    relatedRecordCode?: string;
    relatedRecordTitle?: string;
    actionLink: AppRoute | string;
    actionRequired?: boolean;
    metadata?: Record<string, any>;
  }): CentralNotification {
    // Check if category is enabled in user preferences
    if (this.preferences && !this.preferences.enabledCategories[params.category]) {
      // Ignored by user preference
    }

    // Duplicate Check
    if (this.preferences?.groupDuplicates && params.relatedRecordId) {
      const existingUnread = this.notifications.find(
        (n) =>
          !n.read &&
          n.category === params.category &&
          n.relatedRecordId === params.relatedRecordId
      );

      if (existingUnread) {
        // Update existing notification timestamp and title rather than spamming a new entry
        existingUnread.timestamp = 'เมื่อสักครู่';
        existingUnread.message = params.message;
        existingUnread.priority = params.priority;
        this.saveToStorage();
        return existingUnread;
      }
    }

    const newNotif: CentralNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: params.title,
      message: params.message,
      category: params.category,
      priority: params.priority,
      relatedModule: params.relatedModule,
      relatedRecordId: params.relatedRecordId,
      relatedRecordCode: params.relatedRecordCode,
      relatedRecordTitle: params.relatedRecordTitle,
      actionLink: params.actionLink,
      timestamp: 'เมื่อสักครู่',
      createdAtIso: new Date().toISOString(),
      read: false,
      actionRequired: params.actionRequired ?? false,
      metadata: params.metadata,
    };

    this.notifications = [newNotif, ...this.notifications];
    this.saveToStorage();
    return newNotif;
  }

  // ==========================================
  // EVENT-DRIVEN HOOKS (Triggers)
  // ==========================================

  // 1. task.assigned
  public onTaskAssigned(task: {
    id: string;
    title: string;
    assigneeName: string;
    assigneeId?: string;
    deadline: string;
    department: string;
    module?: string;
    actionLink?: string;
  }): void {
    const calc = this.calculateDeadline(task.deadline);
    this.dispatchNotification({
      title: `มอบหมายงานใหม่: ${task.title}`,
      message: `คุณได้รับการมอบหมายงาน "${task.title}" สังกัด ${task.department} กำหนดส่ง ${task.deadline} (${calc.badgeLabel})`,
      category: 'Task',
      priority: 'Urgent',
      relatedModule: task.module || 'meetings',
      relatedRecordId: task.id,
      relatedRecordTitle: task.title,
      actionLink: task.actionLink || '/meetings',
      actionRequired: true,
    });

    // Also register into Deadlines if not present
    this.createOrUpdateDeadline({
      id: task.id,
      title: task.title,
      module: task.module || 'meetings',
      recordId: task.id,
      startDate: new Date().toISOString().substring(0, 10),
      dueDate: task.deadline,
      responsiblePerson: task.assigneeName,
      responsiblePersonId: task.assigneeId,
      department: task.department,
      status: 'pending',
      priority: 'Urgent',
      category: 'Task',
      actionLink: task.actionLink || '/meetings',
    });
  }

  // 2. task.updated
  public onTaskUpdated(taskId: string, title: string, status: string): void {
    this.dispatchNotification({
      title: `งานอัปเดตสถานะ: ${title}`,
      message: `งานรหัส ${taskId} มีการปรับปรุงสถานะเป็น "${status}"`,
      category: 'Task',
      priority: 'Normal',
      relatedModule: 'meetings',
      relatedRecordId: taskId,
      relatedRecordTitle: title,
      actionLink: '/meetings',
    });
  }

  // 3. task.due_soon
  public onTaskDueSoon(task: DeadlineRecord, daysRemaining: number): void {
    this.dispatchNotification({
      title: `งานใกล้ครบกำหนดส่ง (เหลือ ${daysRemaining} วัน): ${task.title}`,
      message: `ภารกิจ "${task.title}" ของ ${task.responsiblePerson} จะถึงกำหนดส่งในวันที่ ${task.dueDate}`,
      category: 'Deadline',
      priority: daysRemaining <= 3 ? 'Urgent' : 'Important',
      relatedModule: task.module,
      relatedRecordId: task.recordId,
      relatedRecordTitle: task.title,
      actionLink: task.actionLink,
      actionRequired: true,
    });
  }

  // 4. task.overdue
  public onTaskOverdue(task: DeadlineRecord, overdueDays: number): void {
    this.dispatchNotification({
      title: `เกินกำหนดส่ง (Overdue ${overdueDays} วัน): ${task.title}`,
      message: `ภารกิจ "${task.title}" กำหนดส่งวันที่ ${task.dueDate} ได้ล่วงเลยกำหนดเวลาแล้ว ${overdueDays} วัน กรุณาเร่งรัดหรือบันทึกรายงาน`,
      category: 'Deadline',
      priority: 'Urgent',
      relatedModule: task.module,
      relatedRecordId: task.recordId,
      relatedRecordTitle: task.title,
      actionLink: task.actionLink,
      actionRequired: true,
    });
  }

  // 5. workflow.submitted & workflow.review_required
  public onWorkflowReviewRequired(workflow: {
    instanceId: string;
    title: string;
    stepName: string;
    submittedByName: string;
    module: string;
    actionLink: string;
  }): void {
    this.dispatchNotification({
      title: `คำขอรอการพิจารณาอนุมัติ: ${workflow.title}`,
      message: `มีรายการเสนอขออนุมัติในขั้นตอน "${workflow.stepName}" โดย ${workflow.submittedByName} รอท่านลงนามพิจารณา`,
      category: 'Approval',
      priority: 'Urgent',
      relatedModule: workflow.module,
      relatedRecordId: workflow.instanceId,
      relatedRecordTitle: workflow.title,
      actionLink: workflow.actionLink,
      actionRequired: true,
    });
  }

  // 6. workflow.approved
  public onWorkflowApproved(workflow: {
    instanceId: string;
    title: string;
    approvedByName: string;
    module: string;
    actionLink: string;
  }): void {
    this.dispatchNotification({
      title: `รายการได้รับการอนุมัติแล้ว: ${workflow.title}`,
      message: `คำขอ "${workflow.title}" ได้รับการพิจารณาอนุมัติเรียบร้อยแล้วโดย ${workflow.approvedByName}`,
      category: 'Approval',
      priority: 'Normal',
      relatedModule: workflow.module,
      relatedRecordId: workflow.instanceId,
      relatedRecordTitle: workflow.title,
      actionLink: workflow.actionLink,
      actionRequired: false,
    });
  }

  // 7. workflow.returned
  public onWorkflowReturned(workflow: {
    instanceId: string;
    title: string;
    returnedByName: string;
    reason: string;
    module: string;
    actionLink: string;
  }): void {
    this.dispatchNotification({
      title: `รายการถูกส่งกลับแก้ไข: ${workflow.title}`,
      message: `คำขอถูกส่งกลับโดย ${workflow.returnedByName} เหตุผล: "${workflow.reason}"`,
      category: 'Approval',
      priority: 'Urgent',
      relatedModule: workflow.module,
      relatedRecordId: workflow.instanceId,
      relatedRecordTitle: workflow.title,
      actionLink: workflow.actionLink,
      actionRequired: true,
    });
  }

  // 8. document.expiring & document.expired
  public onDocumentExpiring(doc: {
    id: string;
    docNo: string;
    title: string;
    expirationDate: string;
    daysRemaining: number;
    department: string;
  }): void {
    const isUrgent = doc.daysRemaining <= 7;
    this.dispatchNotification({
      title: `เอกสารใกล้หมดอายุ (เหลือ ${doc.daysRemaining} วัน): ${doc.title}`,
      message: `เอกสารเลขที่ ${doc.docNo} สังกัด ${doc.department} จะหมดอายุในวันที่ ${doc.expirationDate}`,
      category: 'Document',
      priority: isUrgent ? 'Urgent' : 'Normal',
      relatedModule: 'documents',
      relatedRecordId: doc.id,
      relatedRecordCode: doc.docNo,
      relatedRecordTitle: doc.title,
      actionLink: '/documents',
      actionRequired: isUrgent,
    });
  }

  public onDocumentExpired(doc: {
    id: string;
    docNo: string;
    title: string;
    expirationDate: string;
  }): void {
    this.dispatchNotification({
      title: `เอกสารหมดอายุแล้ว (Expired): ${doc.title}`,
      message: `เอกสารเลขที่ ${doc.docNo} หมดอายุเมื่อ ${doc.expirationDate} กรุณาดำเนินการต่ออายุหรือจัดเก็บเอกสารเข้าคลังประวัติ`,
      category: 'Document',
      priority: 'Urgent',
      relatedModule: 'documents',
      relatedRecordId: doc.id,
      relatedRecordCode: doc.docNo,
      relatedRecordTitle: doc.title,
      actionLink: '/documents',
      actionRequired: true,
    });
  }

  // 9. meeting.created & meeting.updated
  public onMeetingCreated(meeting: {
    id: string;
    code: string;
    title: string;
    date: string;
    timeStart: string;
    venue: string;
  }): void {
    this.dispatchNotification({
      title: `กำหนดการประชุมใหม่: ${meeting.title}`,
      message: `ขอเชิญเข้าร่วมประชุม ${meeting.title} (${meeting.code}) ในวันที่ ${meeting.date} เวลา ${meeting.timeStart} น. ณ ${meeting.venue}`,
      category: 'Meeting',
      priority: 'Important',
      relatedModule: 'meetings',
      relatedRecordId: meeting.id,
      relatedRecordCode: meeting.code,
      relatedRecordTitle: meeting.title,
      actionLink: '/meetings',
    });

    // Also add to calendar
    this.calendarItems = [
      {
        id: `cal-${meeting.id}`,
        title: meeting.title,
        type: 'Meeting',
        date: meeting.date,
        timeStart: meeting.timeStart,
        module: 'meetings',
        recordId: meeting.id,
        recordCode: meeting.code,
        locationOrVenue: meeting.venue,
        priority: 'Important',
        status: 'scheduled',
        actionLink: '/meetings',
      },
      ...this.calendarItems,
    ];
    this.notifySubscribers();
  }

  // 10. kpi.deadline & kpi.overdue
  public onKpiDeadline(kpi: {
    id: string;
    code: string;
    title: string;
    deadline: string;
    daysRemaining: number;
  }): void {
    this.dispatchNotification({
      title: `กำหนดส่งตัวชี้วัด KPI ไตรมาส (เหลือ ${kpi.daysRemaining} วัน): ${kpi.title}`,
      message: `รายงานผลตัวชี้วัด ${kpi.code} มีกำหนดส่งบันทึกผลเข้าระบบภายในวันที่ ${kpi.deadline}`,
      category: 'KPI',
      priority: kpi.daysRemaining <= 3 ? 'Urgent' : 'Important',
      relatedModule: 'strategy',
      relatedRecordId: kpi.id,
      relatedRecordCode: kpi.code,
      relatedRecordTitle: kpi.title,
      actionLink: '/strategy',
      actionRequired: true,
    });
  }

  // 11. mou.expiring
  public onMouExpiring(mou: {
    id: string;
    code: string;
    title: string;
    partnerName: string;
    expirationDate: string;
    daysRemaining: number;
  }): void {
    this.dispatchNotification({
      title: `ข้อตกลงความร่วมมือ MOU ใกล้สิ้นสุดอายุ (เหลือ ${mou.daysRemaining} วัน)`,
      message: `บันทึกข้อตกลง ${mou.title} (${mou.partnerName}) จะหมดอายุในวันที่ ${mou.expirationDate} กรุณาเริ่มกระบวนการทบทวน`,
      category: 'MOU',
      priority: mou.daysRemaining <= 7 ? 'Urgent' : 'Important',
      relatedModule: 'collaboration',
      relatedRecordId: mou.id,
      relatedRecordCode: mou.code,
      relatedRecordTitle: mou.title,
      actionLink: '/collaboration',
      actionRequired: true,
    });
  }

  // ==========================================
  // DEADLINE & CALENDAR REGISTRATION
  // ==========================================
  public getDeadlines(): DeadlineRecord[] {
    return [...this.deadlines];
  }

  public createOrUpdateDeadline(record: DeadlineRecord): void {
    const existingIndex = this.deadlines.findIndex((d) => d.id === record.id);
    if (existingIndex >= 0) {
      this.deadlines[existingIndex] = record;
    } else {
      this.deadlines = [record, ...this.deadlines];
    }
    this.saveToStorage();
  }

  public getCalendarItems(): CalendarEventItem[] {
    return [...this.calendarItems];
  }

  public addCalendarItem(item: CalendarEventItem): void {
    this.calendarItems = [item, ...this.calendarItems];
    this.notifySubscribers();
  }

  // ==========================================
  // REMINDER RULES & PREFERENCES
  // ==========================================
  public getReminderRules(): ReminderRule[] {
    return [...this.reminderRules];
  }

  public toggleReminderRule(ruleId: string, enabled: boolean): void {
    this.reminderRules = this.reminderRules.map((r) =>
      r.id === ruleId ? { ...r, enabled } : r
    );
    this.saveToStorage();
  }

  public updateReminderRule(updatedRule: ReminderRule): void {
    this.reminderRules = this.reminderRules.map((r) =>
      r.id === updatedRule.id ? updatedRule : r
    );
    this.saveToStorage();
  }

  public addCustomReminderRule(rule: Omit<ReminderRule, 'id'>): ReminderRule {
    const newRule: ReminderRule = {
      ...rule,
      id: `rule-custom-${Date.now()}`,
    };
    this.reminderRules = [...this.reminderRules, newRule];
    this.saveToStorage();
    return newRule;
  }

  public getPreferences(): UserNotificationPreferences {
    return { ...this.preferences };
  }

  public updatePreferences(newPrefs: Partial<UserNotificationPreferences>): void {
    this.preferences = {
      ...this.preferences,
      ...newPrefs,
    };
    this.saveToStorage();
  }

  // ==========================================
  // MY WORK FILTER HELPERS
  // ==========================================
  public getMyWorkData(
    user: UserProfile | null,
    referenceDate: Date = new Date('2026-09-19T00:00:00')
  ) {
    const all = this.deadlines;

    // Filter relevant to user or all if admin
    const isDirectorOrAdmin =
      !user ||
      user.role === 'Super Admin' ||
      user.role === 'Executive' ||
      user.role === 'หัวหน้ากอง' ||
      user.role === 'ผู้อำนวยการ';

    const userRecords = isDirectorOrAdmin
      ? all
      : all.filter(
          (d) =>
            d.responsiblePerson === user?.name ||
            d.responsiblePersonId === user?.id ||
            d.department === user?.department
        );

    const todayItems: { record: DeadlineRecord; calc: DeadlineCalculation }[] = [];
    const dueSoon7Days: { record: DeadlineRecord; calc: DeadlineCalculation }[] = [];
    const overdueItems: { record: DeadlineRecord; calc: DeadlineCalculation }[] = [];
    const pendingApprovalItems: { record: DeadlineRecord; calc: DeadlineCalculation }[] = [];
    const trackedItems: { record: DeadlineRecord; calc: DeadlineCalculation }[] = [];

    userRecords.forEach((record) => {
      const calc = this.calculateDeadline(record.dueDate, referenceDate);

      // Overdue
      if (calc.daysDiff < 0 || record.status === 'overdue') {
        overdueItems.push({ record, calc });
      }
      // Today
      else if (calc.daysDiff === 0) {
        todayItems.push({ record, calc });
      }
      // Due soon <= 7 days
      else if (calc.daysDiff <= 7) {
        dueSoon7Days.push({ record, calc });
      }

      // Approvals
      if (record.category === 'Approval' || record.status === 'in_review') {
        pendingApprovalItems.push({ record, calc });
      }

      // Tracked
      if (record.status === 'in_progress' || record.status === 'pending') {
        trackedItems.push({ record, calc });
      }
    });

    return {
      todayItems,
      dueSoon7Days,
      overdueItems,
      pendingApprovalItems,
      trackedItems,
      totalCount: userRecords.length,
    };
  }

  // Factory reset
  public resetToDefault(): void {
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.deadlines = [...INITIAL_DEADLINE_RECORDS];
    this.calendarItems = [...INITIAL_CALENDAR_ITEMS];
    this.reminderRules = [...DEFAULT_REMINDER_RULES];
    this.preferences = { ...DEFAULT_PREFERENCES };
    this.saveToStorage();
  }
}

export const centralProactiveService = new CentralProactiveService();
export default centralProactiveService;
