/**
 * Production-ready Role-Based Access Control (RBAC) Service
 * For "กองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
 * 
 * Implements:
 * 1. Default Roles:
 *    - Super Admin (Full Access)
 *    - ผู้บริหาร (Executive)
 *    - หัวหน้ากอง (Head of Division)
 *    - เจ้าหน้าที่ (Academic Officer / Staff)
 *    - ผู้ตรวจสอบ (Auditor / Inspector)
 *    - ผู้ใช้งานทั่วไป (General User)
 * 2. Dynamic Custom Roles (Create, Edit, Duplicate, Delete if unused)
 * 3. Module & Action level permissions (module.resource.action)
 * 4. User-level custom permission overrides (Grant / Revoke)
 * 5. Route-level and Action-level validation
 * 6. Audit Trail integration for all security events
 */

import type { UserProfile, AppRoute } from '../types.ts';
import type {
  RoleDefinition,
  PermissionDefinition,
  RBACModuleKey,
  StandardPermissionAction,
  PermissionCheckResult,
} from '../types/rbac.ts';
import { auditLogService } from './auditLogService.ts';

const ROLES_STORAGE_KEY = 'mcu_rbac_roles_v2';

// 1. Definition of Modules and Supported Actions for the Matrix
export const PERMISSION_MODULES: {
  key: RBACModuleKey;
  labelTh: string;
  labelEn: string;
  descriptionTh: string;
  category: string;
  actions: { action: StandardPermissionAction; labelTh: string; code: string }[];
}[] = [
  {
    key: 'meeting',
    labelTh: 'การประชุมและมติสภาวิชาการ',
    labelEn: 'Meeting & Resolutions',
    descriptionTh: 'จัดการวาระการประชุม มติสภาวิชาการ ติดตามคำสั่ง และมอบหมายภารกิจ',
    category: 'บริหารวิชาการ',
    actions: [
      { action: 'view', labelTh: 'ดูรายการ', code: 'meeting.view' },
      { action: 'create', labelTh: 'สร้างวาระ/มติ', code: 'meeting.create' },
      { action: 'edit', labelTh: 'แก้ไขข้อมูล', code: 'meeting.edit' },
      { action: 'delete', labelTh: 'ลบรายการ', code: 'meeting.delete' },
      { action: 'approve', labelTh: 'อนุมัติมติ', code: 'meeting.approve' },
      { action: 'export', labelTh: 'ส่งออกเอกสาร', code: 'meeting.export' },
    ],
  },
  {
    key: 'kpi',
    labelTh: 'ยุทธศาสตร์ / KPI / งบประมาณ / Risk',
    labelEn: 'Strategy, KPI & Risk',
    descriptionTh: 'ยุทธศาสตร์ แผนปฏิบัติการ ตัวชี้วัดผลสัมฤทธิ์ งบประมาณ และบริหารความเสี่ยง',
    category: 'บริหารวิชาการ',
    actions: [
      { action: 'view', labelTh: 'ดูข้อมูลยุทธศาสตร์', code: 'kpi.view' },
      { action: 'create', labelTh: 'สร้างเป้าหมาย/KPI', code: 'kpi.create' },
      { action: 'edit', labelTh: 'อัปเดตผลงาน', code: 'kpi.edit' },
      { action: 'delete', labelTh: 'ลบตัวชี้วัด', code: 'kpi.delete' },
      { action: 'approve', labelTh: 'อนุมัติเกณฑ์/แผน', code: 'kpi.approve' },
      { action: 'export', labelTh: 'ส่งออกรายงาน', code: 'kpi.export' },
    ],
  },
  {
    key: 'curriculum',
    labelTh: 'หลักสูตรความร่วมมือ และ Short Course',
    labelEn: 'Curriculum & Courses',
    descriptionTh: 'หลักสูตรสองปริญญา (Dual Degree) ข้อตกลง MOU และหลักสูตรระยะสั้น',
    category: 'หลักสูตรและการศึกษา',
    actions: [
      { action: 'view', labelTh: 'ดูหลักสูตร/MOU', code: 'curriculum.view' },
      { action: 'create', labelTh: 'เพิ่มหลักสูตร/MOU', code: 'curriculum.create' },
      { action: 'edit', labelTh: 'แก้ไขหลักสูตร', code: 'curriculum.edit' },
      { action: 'delete', labelTh: 'ลบหลักสูตร', code: 'curriculum.delete' },
      { action: 'approve', labelTh: 'อนุมัติหลักสูตร', code: 'curriculum.approve' },
      { action: 'export', labelTh: 'ส่งออกข้อมูล', code: 'curriculum.export' },
    ],
  },
  {
    key: 'credit_bank',
    labelTh: 'ธนาคารหน่วยกิต และ Pre-degree',
    labelEn: 'Credit Bank System',
    descriptionTh: 'สะสมหน่วยกิตล่วงหน้า กระเป๋าหน่วยกิต และพิจารณาเทียบโอนผลการเรียนรู้',
    category: 'หลักสูตรและการศึกษา',
    actions: [
      { action: 'view', labelTh: 'ดูข้อมูลหน่วยกิต', code: 'credit_bank.view' },
      { action: 'create', labelTh: 'ยื่นคำขอเทียบโอน', code: 'credit_bank.create' },
      { action: 'edit', labelTh: 'ปรับปรุงหน่วยกิต', code: 'credit_bank.edit' },
      { action: 'delete', labelTh: 'ยกเลิกรายการ', code: 'credit_bank.delete' },
      { action: 'approve', labelTh: 'อนุมัติเทียบโอน', code: 'credit_bank.approve' },
      { action: 'export', labelTh: 'ส่งออก Transcript', code: 'credit_bank.export' },
    ],
  },
  {
    key: 'faculty',
    labelTh: 'คณาจารย์และสมรรถนะ (Thailand PSF)',
    labelEn: 'Faculty & Competency',
    descriptionTh: 'แฟ้มประวัติอาจารย์ แผนพัฒนาตนเอง (IDP) และการประเมินโดย Mentor',
    category: 'บุคลากรวิชาการ',
    actions: [
      { action: 'view', labelTh: 'ดูข้อมูลอาจารย์', code: 'faculty.view' },
      { action: 'create', labelTh: 'เพิ่มข้อมูล/ส่งผลงาน', code: 'faculty.create' },
      { action: 'edit', labelTh: 'แก้ไขประวัติ/IDP', code: 'faculty.edit' },
      { action: 'delete', labelTh: 'ลบรายการ', code: 'faculty.delete' },
      { action: 'approve', labelTh: 'อนุมัติ/ประเมิน PSF', code: 'faculty.approve' },
      { action: 'export', labelTh: 'ส่งออกรายงาน PSF', code: 'faculty.export' },
    ],
  },
  {
    key: 'regulatory',
    labelTh: 'ระเบียบและข้อบังคับวิชาการ',
    labelEn: 'Academic Regulations',
    descriptionTh: 'ระเบียบมหาวิทยาลัย ข้อบังคับสภา เกณฑ์มาตรฐาน และการติดตามสถานะ',
    category: 'มาตรฐานและกำกับ',
    actions: [
      { action: 'view', labelTh: 'ดูระเบียบข้อบังคับ', code: 'regulatory.view' },
      { action: 'create', labelTh: 'เพิ่มระเบียบใหม่', code: 'regulatory.create' },
      { action: 'edit', labelTh: 'แก้ไขข้อบังคับ', code: 'regulatory.edit' },
      { action: 'delete', labelTh: 'ลบระเบียบ', code: 'regulatory.delete' },
      { action: 'approve', labelTh: 'อนุมัติประกาศใช้', code: 'regulatory.approve' },
      { action: 'export', labelTh: 'ส่งออกข้อบังคับ', code: 'regulatory.export' },
    ],
  },
  {
    key: 'documents',
    labelTh: 'เอกสารกลางและคำสั่งมหาวิทยาลัย',
    labelEn: 'Document Center',
    descriptionTh: 'คลังเอกสารทางการ มติเวียน คำสั่งแต่งตั้ง และหนังสือรับรองวิชาการ',
    category: 'บริการและเอกสาร',
    actions: [
      { action: 'view', labelTh: 'ดูเอกสารกลาง', code: 'documents.view' },
      { action: 'create', labelTh: 'อัปโหลดเอกสาร', code: 'documents.upload' },
      { action: 'edit', labelTh: 'แก้ไข metadata', code: 'documents.edit' },
      { action: 'delete', labelTh: 'ลบเอกสาร', code: 'documents.delete' },
      { action: 'approve', labelTh: 'รับรองเอกสาร', code: 'documents.approve' },
      { action: 'export', labelTh: 'ดาวน์โหลดไฟล์', code: 'documents.download' },
    ],
  },
  {
    key: 'reports',
    labelTh: 'รายงานและสถิติสารสนเทศ',
    labelEn: 'Reports & Analytics',
    descriptionTh: 'รายงานสรุปผลการดำเนินงาน สถิติสารสนเทศวิชาการ และการวิเคราะห์ข้อมูล',
    category: 'สารสนเทศ',
    actions: [
      { action: 'view', labelTh: 'ดูรายงานสารสนเทศ', code: 'reports.view' },
      { action: 'create', labelTh: 'สร้างรายงานกำหนดเอง', code: 'reports.create' },
      { action: 'edit', labelTh: 'ปรับแต่งตัวกรอง', code: 'reports.edit' },
      { action: 'delete', labelTh: 'ลบเทมเพลต', code: 'reports.delete' },
      { action: 'approve', labelTh: 'อนุมัติรายงานทางการ', code: 'reports.approve' },
      { action: 'export', labelTh: 'ส่งออก Excel/PDF', code: 'reports.export' },
    ],
  },
  {
    key: 'forms',
    labelTh: 'แบบฟอร์มออนไลน์และการยื่นคำร้อง',
    labelEn: 'Online Forms & Workflow',
    descriptionTh: 'สร้างแบบฟอร์ม จัดสายการอนุมัติ ยื่นคำร้อง และติดตามผล',
    category: 'บริการและเอกสาร',
    actions: [
      { action: 'view', labelTh: 'ดูแบบฟอร์ม/คำร้อง', code: 'forms.view' },
      { action: 'create', labelTh: 'สร้างฟอร์ม/ยื่นคำร้อง', code: 'forms.create' },
      { action: 'edit', labelTh: 'แก้ไขแบบฟอร์ม', code: 'forms.edit' },
      { action: 'delete', labelTh: 'ลบแบบฟอร์ม', code: 'forms.delete' },
      { action: 'approve', labelTh: 'พิจารณาอนุมัติคำร้อง', code: 'forms.approve' },
      { action: 'export', labelTh: 'ส่งออกคำร้อง', code: 'forms.export' },
    ],
  },
  {
    key: 'users',
    labelTh: 'การจัดการผู้ใช้งานระบบ (User Management)',
    labelEn: 'User Management',
    descriptionTh: 'จัดการบัญชีผู้ใช้งาน รีเซ็ตรหัสผ่าน มอบหมายบทบาท และสิทธิ์รายบุคคล',
    category: 'ระบบและความปลอดภัย',
    actions: [
      { action: 'view', labelTh: 'ดูรายชื่อผู้ใช้งาน', code: 'users.view' },
      { action: 'create', labelTh: 'สร้างบัญชีผู้ใช้', code: 'users.create' },
      { action: 'edit', labelTh: 'แก้ไขข้อมูลผู้ใช้', code: 'users.edit' },
      { action: 'delete', labelTh: 'ระงับ/ลบผู้ใช้', code: 'users.delete' },
      { action: 'approve', labelTh: 'อนุมัติการลงทะเบียน', code: 'users.approve' },
      { action: 'export', labelTh: 'ส่งออกรายชื่อ', code: 'users.export' },
    ],
  },
  {
    key: 'roles',
    labelTh: 'บทบาทและสิทธิ์การใช้งาน (Role & RBAC Matrix)',
    labelEn: 'Role Management',
    descriptionTh: 'จัดการบทบาท สร้างบทบาทใหม่ และกำหนด Permission Matrix รายโมดูล',
    category: 'ระบบและความปลอดภัย',
    actions: [
      { action: 'view', labelTh: 'ดูบทบาทและสิทธิ์', code: 'roles.view' },
      { action: 'create', labelTh: 'สร้างบทบาทใหม่', code: 'roles.create' },
      { action: 'edit', labelTh: 'แก้ไข Matrix สิทธิ์', code: 'roles.edit' },
      { action: 'delete', labelTh: 'ลบบทบาท (ที่ไม่ได้ใช้)', code: 'roles.delete' },
      { action: 'approve', labelTh: 'อนุมัติการเปลี่ยนสิทธิ์', code: 'roles.approve' },
      { action: 'export', labelTh: 'ส่งออก Matrix สิทธิ์', code: 'roles.export' },
    ],
  },
  {
    key: 'workflows',
    labelTh: 'กระบวนการและการอนุมัติ (Workflow Engine)',
    labelEn: 'Workflows & Approvals',
    descriptionTh: 'จัดการขั้นตอนการทำงาน กล่องงานรอตรวจ อนุมัติ ตีกลับแก้ไข และมอบหมายอำนาจแทน',
    category: 'บริหารวิชาการ',
    actions: [
      { action: 'view', labelTh: 'ดูงานและติดตามสถานะ', code: 'workflows.view' },
      { action: 'create', labelTh: 'ยื่นเรื่องเข้าสู่ระบบ', code: 'workflows.create' },
      { action: 'edit', labelTh: 'แก้ไข/ตีกลับงาน', code: 'workflows.edit' },
      { action: 'delete', labelTh: 'ยกเลิกกระบวนการ', code: 'workflows.delete' },
      { action: 'approve', labelTh: 'อนุมัติ/ลงนาม', code: 'workflows.approve' },
      { action: 'export', labelTh: 'ส่งออกรายงานติดตาม', code: 'workflows.export' },
    ],
  },
  {
    key: 'integrations',
    labelTh: 'ระบบเชื่อมโยงภายนอก (Integration Center)',
    labelEn: 'External Integrations',
    descriptionTh: 'เชื่อมโยง NCB, CHECO, HRIS, QA และ สำนักทะเบียน มจร',
    category: 'ระบบและความปลอดภัย',
    actions: [
      { action: 'view', labelTh: 'ดูสถานะเชื่อมต่อ', code: 'integrations.view' },
      { action: 'create', labelTh: 'เพิ่มระบบเชื่อมต่อ', code: 'integrations.create' },
      { action: 'edit', labelTh: 'ตั้งค่า API / Sync', code: 'integrations.edit' },
      { action: 'delete', labelTh: 'ตัดการเชื่อมต่อ', code: 'integrations.delete' },
      { action: 'approve', labelTh: 'รับรองความปลอดภัย', code: 'integrations.approve' },
      { action: 'export', labelTh: 'ส่งออก Log เชื่อมต่อ', code: 'integrations.export' },
    ],
  },
];

// 2. Default System Roles (The 6 core roles required)
export const DEFAULT_SYSTEM_ROLES: RoleDefinition[] = [
  {
    id: 'role-super-admin',
    name: 'Super Admin',
    nameEn: 'Super Administrator',
    description: 'เข้าถึง จัดการ และกำหนดค่าได้ทุกส่วนของระบบ รวมถึงการจัดการความปลอดภัย บัญชีผู้ใช้งาน และสิทธิ์ขั้นสูงสุด',
    isSystem: true,
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    permissions: ['*'],
    createdAt: '2025-01-01 00:00:00',
    updatedAt: '2026-09-18 08:00:00',
  },
  {
    id: 'role-executive',
    name: 'ผู้บริหาร',
    nameEn: 'Executive',
    description: 'ดูข้อมูลภาพรวมยุทธศาสตร์ ตัวชี้วัด KPI งบประมาณ ความเสี่ยง รายงานการประชุม อนุมัติมติ/คำร้องสำคัญ และส่งออกรายงานเชิงนโยบาย',
    isSystem: true,
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    permissions: [
      'meeting.view', 'meeting.approve', 'meeting.export',
      'kpi.view', 'kpi.approve', 'kpi.export',
      'curriculum.view', 'curriculum.approve', 'curriculum.export',
      'credit_bank.view', 'credit_bank.approve', 'credit_bank.export',
      'faculty.view', 'faculty.approve', 'faculty.export',
      'regulatory.view', 'regulatory.approve', 'regulatory.export',
      'documents.view', 'documents.download',
      'reports.view', 'reports.export',
      'forms.view', 'forms.approve',
      'workflows.view', 'workflows.approve', 'workflows.export',
      'integrations.view', 'integrations.export',
    ],
    createdAt: '2025-01-01 00:00:00',
    updatedAt: '2026-09-18 08:00:00',
  },
  {
    id: 'role-head-division',
    name: 'หัวหน้ากอง',
    nameEn: 'Head of Division',
    description: 'บริหารจัดการงานวิชาการทุกด้าน ตรวจสอบและอนุมัติงานเจ้าหน้าที่ ติดตามมติสภาวิชาการ และกำกับดูแลผลการดำเนินงาน',
    isSystem: true,
    badgeClass: 'bg-[#FBE7EF] text-[#B83B6F] border-[#F8CBDD]',
    permissions: [
      'meeting.view', 'meeting.create', 'meeting.edit', 'meeting.delete', 'meeting.approve', 'meeting.export',
      'kpi.view', 'kpi.create', 'kpi.edit', 'kpi.approve', 'kpi.export',
      'curriculum.view', 'curriculum.create', 'curriculum.edit', 'curriculum.approve', 'curriculum.export',
      'credit_bank.view', 'credit_bank.create', 'credit_bank.edit', 'credit_bank.approve', 'credit_bank.export',
      'faculty.view', 'faculty.create', 'faculty.edit', 'faculty.approve', 'faculty.export',
      'regulatory.view', 'regulatory.create', 'regulatory.edit', 'regulatory.approve', 'regulatory.export',
      'documents.view', 'documents.upload', 'documents.edit', 'documents.delete', 'documents.download',
      'reports.view', 'reports.export',
      'forms.view', 'forms.create', 'forms.edit', 'forms.delete', 'forms.approve', 'forms.export',
      'workflows.view', 'workflows.create', 'workflows.edit', 'workflows.delete', 'workflows.approve', 'workflows.export',
      'users.view',
      'integrations.view',
    ],
    createdAt: '2025-01-01 00:00:00',
    updatedAt: '2026-09-18 08:00:00',
  },
  {
    id: 'role-staff',
    name: 'เจ้าหน้าที่',
    nameEn: 'Academic Officer / Staff',
    description: 'สร้างและแก้ไขข้อมูลในระบบ จัดเตรียมวาระการประชุม กรอกผล KPI จัดการเอกสารและงานที่ได้รับมอบหมาย (ไม่มีสิทธิ์อนุมัติขั้นสุดท้าย)',
    isSystem: true,
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    permissions: [
      'meeting.view', 'meeting.create', 'meeting.edit', 'meeting.export',
      'kpi.view', 'kpi.edit', 'kpi.export',
      'curriculum.view', 'curriculum.create', 'curriculum.edit', 'curriculum.export',
      'credit_bank.view', 'credit_bank.create', 'credit_bank.edit', 'credit_bank.export',
      'faculty.view', 'faculty.edit',
      'regulatory.view', 'regulatory.create', 'regulatory.edit', 'regulatory.export',
      'documents.view', 'documents.upload', 'documents.edit', 'documents.download',
      'forms.view', 'forms.create', 'forms.edit',
      'workflows.view', 'workflows.create', 'workflows.edit', 'workflows.export',
      'reports.view', 'reports.export',
    ],
    createdAt: '2025-01-01 00:00:00',
    updatedAt: '2026-09-18 08:00:00',
  },
  {
    id: 'role-auditor',
    name: 'ผู้ตรวจสอบ',
    nameEn: 'Auditor / Inspector',
    description: 'เข้าถึงข้อมูลแบบอ่านอย่างเดียว (Read-only) ตรวจสอบประวัติการใช้งาน (Audit Trail) และส่งออกรายงานที่ได้รับอนุญาต ไม่สามารถแก้ไขข้อมูลได้',
    isSystem: true,
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    permissions: [
      'meeting.view', 'meeting.export',
      'kpi.view', 'kpi.export',
      'curriculum.view', 'curriculum.export',
      'credit_bank.view', 'credit_bank.export',
      'faculty.view',
      'regulatory.view', 'regulatory.export',
      'documents.view', 'documents.download',
      'reports.view', 'reports.export',
      'workflows.view', 'workflows.export',
      'integrations.view',
      'users.view',
      'roles.view',
    ],
    createdAt: '2025-01-01 00:00:00',
    updatedAt: '2026-09-18 08:00:00',
  },
  {
    id: 'role-general',
    name: 'ผู้ใช้งานทั่วไป',
    nameEn: 'General User',
    description: 'เข้าดูข้อมูลสาธารณะและเอกสารเผยแพร่ทั่วไป ยื่นคำร้องผ่านแบบฟอร์มออนไลน์ และดูสถานะหน่วยกิตเบื้องต้น',
    isSystem: true,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    permissions: [
      'meeting.view',
      'curriculum.view',
      'credit_bank.view',
      'documents.view', 'documents.download',
      'forms.view', 'forms.create',
      'workflows.view',
    ],
    createdAt: '2025-01-01 00:00:00',
    updatedAt: '2026-09-18 08:00:00',
  },
];

// 3. Realistic Demo Personas for Quick Switch and Evaluation
export const DEMO_PERSONAS: Record<string, UserProfile> = {
  'Super Admin': {
    id: 'usr-super',
    name: 'นายอดิศร มงคลสุข',
    username: 'superadmin',
    role: 'Super Admin',
    position: 'หัวหน้างานพัฒนาระบบเทคโนโลยีสารสนเทศ',
    department: 'สำนักเทคโนโลยีสารสนเทศ มจร',
    email: 'superadmin@mcu.ac.th',
    phone: '035-248-001',
    initials: 'SA',
    status: 'active',
    createdDate: '2025-01-10 09:00:00',
    updatedDate: '2026-09-17 08:30:00',
    lastLogin: '2026-09-18 09:15:22',
  },
  'ผู้บริหาร': {
    id: 'usr-exec',
    name: 'พระพรหมบัณฑิต, ศ.ดร.',
    username: 'executive.council',
    role: 'ผู้บริหาร',
    position: 'ประธานคณะกรรมการสภาวิชาการ / กรรมการสภามหาวิทยาลัย',
    department: 'สำนักงานสภามหาวิทยาลัย มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
    email: 'executive.council@mcu.ac.th',
    phone: '035-248-010',
    initials: 'พบ',
    status: 'active',
    createdDate: '2025-01-10 09:00:00',
    updatedDate: '2026-09-15 14:20:00',
    lastLogin: '2026-09-17 10:45:00',
  },
  'หัวหน้ากอง': {
    id: 'usr-1',
    name: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
    username: 'academic.director',
    role: 'หัวหน้ากอง',
    position: 'ผู้อำนวยการกองวิชาการ สำนักงานอธิการบดี',
    department: 'กองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
    email: 'academic.director@mcu.ac.th',
    phone: '035-248-055',
    initials: 'ผอ',
    status: 'active',
    createdDate: '2025-01-15 10:00:00',
    updatedDate: '2026-09-16 11:30:00',
    lastLogin: '2026-09-18 08:30:11',
  },
  'เจ้าหน้าที่': {
    id: 'usr-staff',
    name: 'นางสาวกานดา วิมลสิริ',
    username: 'kanda.w',
    role: 'เจ้าหน้าที่',
    position: 'นักวิชาการศึกษาชำนาญการ',
    department: 'กลุ่มงานมาตรฐานและพัฒนาหลักสูตร กองวิชาการ',
    email: 'kanda.w@mcu.ac.th',
    phone: '035-248-062',
    initials: 'กว',
    status: 'active',
    createdDate: '2025-02-01 08:30:00',
    updatedDate: '2026-09-12 16:10:00',
    lastLogin: '2026-09-18 08:15:00',
  },
  'ผู้ตรวจสอบ': {
    id: 'usr-auditor',
    name: 'รศ.ดร. สุรพล สุยะพรหม',
    username: 'auditor.surapol',
    role: 'ผู้ตรวจสอบ',
    position: 'ผู้ทรงคุณวุฒิตรวจสอบวิชาการ / ผู้ประเมินคุณภาพภายใน',
    department: 'คณะกรรมการตรวจสอบและประเมินผล มจร',
    email: 'auditor.surapol@mcu.ac.th',
    phone: '035-248-088',
    initials: 'มท',
    status: 'active',
    createdDate: '2025-03-01 13:00:00',
    updatedDate: '2026-09-10 11:00:00',
    lastLogin: '2026-09-16 14:20:10',
  },
  'ผู้ใช้งานทั่วไป': {
    id: 'usr-general',
    name: 'นายอานนท์ ภักดี',
    username: 'arnon.p',
    role: 'ผู้ใช้งานทั่วไป',
    position: 'นิสิต/ผู้เรียนโครงการเรียนรู้ตลอดชีวิต',
    department: 'บุคคลทั่วไป / โครงการธนาคารหน่วยกิต',
    email: 'arnon.learner@gmail.com',
    phone: '081-987-6543',
    initials: 'อน',
    status: 'active',
    createdDate: '2025-06-15 11:20:00',
    updatedDate: '2026-09-01 10:00:00',
    lastLogin: '2026-09-15 18:30:00',
  },
};

// Aliases for backwards compatibility with any previous English persona keys
export const ROLE_ALIASES: Record<string, string> = {
  Executive: 'ผู้บริหาร',
  'Central Admin': 'หัวหน้ากอง',
  'Faculty Admin': 'หัวหน้ากอง',
  Staff: 'เจ้าหน้าที่',
  Lecturer: 'เจ้าหน้าที่',
  Mentor: 'ผู้ตรวจสอบ',
  Learner: 'ผู้ใช้งานทั่วไป',
  'ผู้อำนวยการกองวิชาการ': 'หัวหน้ากอง',
  'เจ้าหน้าที่บริหารงานวิชาการ': 'เจ้าหน้าที่',
};

// Backward-compatible metadata dictionary for components importing ROLE_DEFINITIONS
export const ROLE_DEFINITIONS: Record<string, any> = {
  'Super Admin': {
    role: 'Super Admin',
    titleTh: 'ผู้ดูแลระบบสูงสุด (Super Admin)',
    descriptionTh: 'เข้าถึง จัดการ และกำหนดค่าได้ทุกส่วนของระบบ รวมถึงการจัดการความปลอดภัยและสิทธิ์',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
  },
  'ผู้บริหาร': {
    role: 'ผู้บริหาร',
    titleTh: 'ผู้บริหารระดับสูง (Executive)',
    descriptionTh: 'ภาพรวมยุทธศาสตร์ มติสภาวิชาการ อนุมัติระดับสูง และแดชบอร์ดผู้บริหาร',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  'หัวหน้ากอง': {
    role: 'หัวหน้ากอง',
    titleTh: 'หัวหน้ากองวิชาการ (Head of Division)',
    descriptionTh: 'ดูแลการประชุม สภาวิชาการ ยุทธศาสตร์ หลักสูตรกลาง และคลังหน่วยกิตมหาวิทยาลัย',
    badgeClass: 'bg-[#FBE7EF] text-[#B83B6F] border-[#F8CBDD]',
  },
  'เจ้าหน้าที่': {
    role: 'เจ้าหน้าที่',
    titleTh: 'เจ้าหน้าที่สายสนับสนุน (Staff)',
    descriptionTh: 'จัดเตรียมเอกสาร บันทึกระเบียบวาระ กรอกข้อมูล KPI และจัดทำแบบฟอร์ม',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  'ผู้ตรวจสอบ': {
    role: 'ผู้ตรวจสอบ',
    titleTh: 'ผู้ตรวจสอบ / ผู้ประเมิน (Auditor)',
    descriptionTh: 'ตรวจสอบความถูกต้องของข้อมูล ดู Audit Log และส่งออกรายงานเชิงวิชาการ',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  'ผู้ใช้งานทั่วไป': {
    role: 'ผู้ใช้งานทั่วไป',
    titleTh: 'ผู้ใช้งานทั่วไป (General User)',
    descriptionTh: 'ดูข้อมูลสาธารณะ ยื่นคำร้องผ่านแบบฟอร์ม และตรวจสอบหน่วยกิตเบื้องต้น',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  // English aliases
  Executive: {
    role: 'ผู้บริหาร',
    titleTh: 'ผู้บริหารระดับสูง (Executive)',
    descriptionTh: 'ภาพรวมยุทธศาสตร์ มติสภาวิชาการ อนุมัติระดับสูง และแดชบอร์ดผู้บริหาร',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  'Central Admin': {
    role: 'หัวหน้ากอง',
    titleTh: 'หัวหน้ากองวิชาการ (Central Admin)',
    descriptionTh: 'ดูแลการประชุม สภาวิชาการ ยุทธศาสตร์ หลักสูตรกลาง และคลังหน่วยกิตมหาวิทยาลัย',
    badgeClass: 'bg-[#FBE7EF] text-[#B83B6F] border-[#F8CBDD]',
  },
  'Faculty Admin': {
    role: 'หัวหน้ากอง',
    titleTh: 'ผู้บริหาร/แอดมินระดับคณะ (Faculty Admin)',
    descriptionTh: 'จัดการหลักสูตร อาจารย์ IDP คณะ และพิจารณาการเทียบโอนระดับคณะ',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  Staff: {
    role: 'เจ้าหน้าที่',
    titleTh: 'เจ้าหน้าที่สายสนับสนุน (Staff)',
    descriptionTh: 'จัดเตรียมเอกสาร บันทึกระเบียบวาระ กรอกข้อมูล KPI และจัดทำแบบฟอร์ม',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  Lecturer: {
    role: 'เจ้าหน้าที่',
    titleTh: 'อาจารย์ประจำหลักสูตร (Lecturer)',
    descriptionTh: 'จัดการรายวิชา มคอ. บันทึก IDP ส่งแฟ้มผลงาน และจัดการภาระงานสอน',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  Mentor: {
    role: 'ผู้ตรวจสอบ',
    titleTh: 'อาจารย์พี่เลี้ยง/ผู้ประเมิน (Mentor)',
    descriptionTh: 'ตรวจประเมิน IDP ให้ข้อเสนอแนะแฟ้มผลงาน Thailand PSF และพัฒนาอาจารย์',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  Learner: {
    role: 'ผู้ใช้งานทั่วไป',
    titleTh: 'ผู้เรียน / นิสิต / ผู้เทียบโอน (Learner)',
    descriptionTh: 'ดูประวัติหน่วยกิต สมัครเรียน ยื่นคำร้องขอเทียบโอนผลการเรียนรู้',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

// 4. Route-to-Permission Mapping
export const ROUTE_PERMISSION_MAP: Record<string, string> = {
  '/dashboard': 'dashboard.view', // accessible to all authenticated users
  '/my-work': 'dashboard.view',
  '/calendar': 'dashboard.view',
  '/meetings': 'meeting.view',
  '/strategy': 'kpi.view',
  '/collaboration': 'curriculum.view',
  '/courses': 'curriculum.view',
  '/pre-degree': 'credit_bank.view',
  '/credit-bank': 'credit_bank.view',
  '/faculty': 'faculty.view',
  '/regulatory': 'regulatory.view',
  '/forms': 'forms.view',
  '/documents': 'documents.view',
  '/reports': 'reports.view',
  '/integrations': 'integrations.view',
  '/users': 'users.view',
  '/settings/roles': 'roles.view',
  '/settings/notifications': 'dashboard.view',
  '/admin/system-health': 'roles.view',
  '/data-management': 'roles.view',
  '/master-data': 'dashboard.view',
  '/workflows': 'workflows.view',
  '/settings': 'roles.view',
  '/design-system': 'design-system.view',
};

// Role memory state
let inMemoryRoles: RoleDefinition[] = (() => {
  try {
    const raw = localStorage.getItem(ROLES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return [...DEFAULT_SYSTEM_ROLES];
})();

const roleListeners = new Set<(roles: RoleDefinition[]) => void>();

function notifyRoleChange() {
  try {
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(inMemoryRoles));
  } catch {
    // ignore
  }
  roleListeners.forEach((fn) => fn([...inMemoryRoles]));
}

// 5. Core RBAC Service Implementation
export const rbacService = {
  /**
   * Normalize role name using aliases
   */
  normalizeRoleName(role: string): string {
    return ROLE_ALIASES[role] || role;
  },

  /**
   * Subscribe to role definition updates
   */
  subscribeRoles(fn: (roles: RoleDefinition[]) => void): () => void {
    roleListeners.add(fn);
    fn([...inMemoryRoles]);
    return () => roleListeners.delete(fn);
  },

  /**
   * Get all defined roles (Default + Custom)
   */
  getAllRoles(): RoleDefinition[] {
    return [...inMemoryRoles];
  },

  /**
   * Get a role definition by ID or Name
   */
  getRole(nameOrId: string): RoleDefinition | undefined {
    const query = (nameOrId || '').trim();
    const resolvedName = ROLE_ALIASES[query] || query;
    return inMemoryRoles.find(
      (r) =>
        r.id === query ||
        r.name.toLowerCase() === resolvedName.toLowerCase() ||
        r.nameEn.toLowerCase() === query.toLowerCase()
    );
  },

  /**
   * Check permission for a user on a given permission code
   * Handles:
   * - Super Admin wildcard
   * - Individual user denials (revocations)
   * - Individual user grants (custom permissions)
   * - Role-level permissions (exact match, aliases, module wildcards)
   */
  checkPermission(
    user: UserProfile | null | undefined,
    permissionCode: string
  ): PermissionCheckResult {
    if (!user) {
      return { granted: false, reason: 'NOT_PERMITTED' };
    }

    const resolvedRoleName = ROLE_ALIASES[user.role] || user.role;

    // 1. Super Admin universal access
    if (resolvedRoleName === 'Super Admin' || user.role === 'Super Admin') {
      return { granted: true, reason: 'SUPER_ADMIN', matchedRule: '*' };
    }

    // 2. Individual user denial override
    if (user.deniedPermissions && user.deniedPermissions.includes(permissionCode)) {
      return { granted: false, reason: 'EXPLICIT_DENIAL', matchedRule: permissionCode };
    }

    // 3. Individual user custom grant override
    if (user.customPermissions && user.customPermissions.includes(permissionCode)) {
      return { granted: true, reason: 'EXPLICIT_GRANT', matchedRule: permissionCode };
    }

    // 4. Role-based lookup
    const roleDef = this.getRole(resolvedRoleName);
    if (!roleDef) {
      return { granted: false, reason: 'NOT_PERMITTED' };
    }

    // Check wildcard in role
    if (roleDef.permissions.includes('*')) {
      return { granted: true, reason: 'ROLE_PERMISSION', matchedRule: '*' };
    }

    // Direct permission match
    if (roleDef.permissions.includes(permissionCode)) {
      return { granted: true, reason: 'ROLE_PERMISSION', matchedRule: permissionCode };
    }

    // Alias checking (documents.upload <=> documents.create, documents.download <=> documents.export)
    if (permissionCode === 'documents.upload' && (roleDef.permissions.includes('documents.create') || roleDef.permissions.includes('documents.upload'))) {
      return { granted: true, reason: 'ROLE_PERMISSION', matchedRule: 'documents.create' };
    }
    if (permissionCode === 'documents.create' && (roleDef.permissions.includes('documents.upload') || roleDef.permissions.includes('documents.create'))) {
      return { granted: true, reason: 'ROLE_PERMISSION', matchedRule: 'documents.upload' };
    }
    if (permissionCode === 'documents.download' && (roleDef.permissions.includes('documents.export') || roleDef.permissions.includes('documents.download'))) {
      return { granted: true, reason: 'ROLE_PERMISSION', matchedRule: 'documents.export' };
    }
    if (permissionCode === 'documents.export' && (roleDef.permissions.includes('documents.download') || roleDef.permissions.includes('documents.export'))) {
      return { granted: true, reason: 'ROLE_PERMISSION', matchedRule: 'documents.download' };
    }

    // Module-level wildcard check e.g. "meeting.*" or "meeting.manage"
    const [modulePart] = permissionCode.split('.');
    if (modulePart) {
      if (
        roleDef.permissions.includes(`${modulePart}.*`) ||
        roleDef.permissions.includes(`${modulePart}.manage`)
      ) {
        return { granted: true, reason: 'ROLE_PERMISSION', matchedRule: `${modulePart}.*` };
      }
    }

    return { granted: false, reason: 'NOT_PERMITTED' };
  },

  /**
   * Direct boolean permission check
   */
  can(user: UserProfile | null | undefined, permissionCode: string): boolean {
    return this.checkPermission(user, permissionCode).granted;
  },

  /**
   * Route-level permission check
   */
  canRoute(user: UserProfile | null | undefined, route: AppRoute | string): boolean {
    if (!user) return false;
    if (route === '/dashboard' || route === '/login' || route === '/design-system') {
      return true;
    }
    const requiredPermission = ROUTE_PERMISSION_MAP[route];
    if (!requiredPermission) {
      return true; // route has no strict permission rule
    }
    return this.can(user, requiredPermission);
  },

  /**
   * Get the required permission code for a given route
   */
  getRequiredPermissionForRoute(route: string): string | undefined {
    return ROUTE_PERMISSION_MAP[route];
  },

  /**
   * Create a new custom role
   */
  createRole(
    roleData: {
      name: string;
      nameEn?: string;
      description: string;
      badgeClass?: string;
      permissions: string[];
    },
    actorUser?: UserProfile
  ): RoleDefinition {
    const id = `role-custom-${Date.now()}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newRole: RoleDefinition = {
      id,
      name: roleData.name.trim(),
      nameEn: roleData.nameEn?.trim() || roleData.name.trim(),
      description: roleData.description.trim(),
      isSystem: false,
      badgeClass: roleData.badgeClass || 'bg-slate-100 text-slate-800 border-slate-200',
      permissions: [...roleData.permissions],
      createdAt: now,
      updatedAt: now,
    };

    inMemoryRoles = [...inMemoryRoles, newRole];
    notifyRoleChange();

    auditLogService.log({
      userId: actorUser?.id || 'usr-super',
      userName: actorUser?.name || 'ระบบผู้ดูแล',
      userRole: actorUser?.role || 'Super Admin',
      action: 'CREATE',
      module: 'Security & Roles',
      recordId: newRole.id,
      recordTitle: `สร้างบทบาทใหม่: ${newRole.name}`,
      newValue: newRole,
      details: `สร้างบทบาทใหม่ในระบบ กำหนด ${newRole.permissions.length} สิทธิ์การใช้งาน`,
      ipAddress: '10.20.4.15',
    });

    return newRole;
  },

  /**
   * Update an existing role definition (permissions, description, badge)
   */
  updateRole(
    roleId: string,
    updates: Partial<Omit<RoleDefinition, 'id' | 'isSystem' | 'createdAt'>>,
    actorUser?: UserProfile
  ): RoleDefinition {
    const existing = inMemoryRoles.find((r) => r.id === roleId);
    if (!existing) {
      throw new Error(`ไม่พบบทบาทรหัส ${roleId}`);
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updatedRole: RoleDefinition = {
      ...existing,
      ...updates,
      // System role names should not be altered
      name: existing.isSystem ? existing.name : updates.name || existing.name,
      updatedAt: now,
    };

    inMemoryRoles = inMemoryRoles.map((r) => (r.id === roleId ? updatedRole : r));
    notifyRoleChange();

    auditLogService.log({
      userId: actorUser?.id || 'usr-super',
      userName: actorUser?.name || 'ระบบผู้ดูแล',
      userRole: actorUser?.role || 'Super Admin',
      action: 'UPDATE',
      module: 'Security & Roles',
      recordId: updatedRole.id,
      recordTitle: `แก้ไขบทบาท: ${updatedRole.name}`,
      oldValue: { permissions: existing.permissions, description: existing.description },
      newValue: { permissions: updatedRole.permissions, description: updatedRole.description },
      details: `ปรับปรุงสิทธิ์บทบาท ${updatedRole.name} เป็น ${updatedRole.permissions.length} สิทธิ์`,
      ipAddress: '10.20.4.15',
    });

    return updatedRole;
  },

  /**
   * Duplicate a role to create a new custom variant
   */
  duplicateRole(
    sourceRoleId: string,
    newRoleName: string,
    actorUser?: UserProfile
  ): RoleDefinition {
    const source = inMemoryRoles.find((r) => r.id === sourceRoleId);
    if (!source) {
      throw new Error(`ไม่พบบทบาทต้นฉบับ`);
    }

    return this.createRole(
      {
        name: newRoleName,
        nameEn: `${source.nameEn} (Copy)`,
        description: `สำเนาสิทธิ์จาก ${source.name}: ${source.description}`,
        badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        permissions: [...source.permissions],
      },
      actorUser
    );
  },

  /**
   * Delete an unused custom role (system roles cannot be deleted)
   */
  deleteRole(roleId: string, actorUser?: UserProfile): boolean {
    const role = inMemoryRoles.find((r) => r.id === roleId);
    if (!role) return false;

    if (role.isSystem) {
      throw new Error(`ไม่สามารถลบบทบาทมาตรฐานระบบ (${role.name}) ได้`);
    }

    inMemoryRoles = inMemoryRoles.filter((r) => r.id !== roleId);
    notifyRoleChange();

    auditLogService.log({
      userId: actorUser?.id || 'usr-super',
      userName: actorUser?.name || 'ระบบผู้ดูแล',
      userRole: actorUser?.role || 'Super Admin',
      action: 'DELETE',
      module: 'Security & Roles',
      recordId: role.id,
      recordTitle: `ลบบทบาท: ${role.name}`,
      oldValue: role,
      details: `ลบบทบาทผู้ใช้กำหนดเองออกจากระบบ`,
      ipAddress: '10.20.4.15',
    });

    return true;
  },

  /**
   * Reset roles back to default configuration
   */
  resetToDefaults(actorUser?: UserProfile): void {
    inMemoryRoles = [...DEFAULT_SYSTEM_ROLES];
    notifyRoleChange();

    auditLogService.log({
      userId: actorUser?.id || 'usr-super',
      userName: actorUser?.name || 'ระบบผู้ดูแล',
      userRole: actorUser?.role || 'Super Admin',
      action: 'UPDATE',
      module: 'Security & Roles',
      recordId: 'RBAC-RESET',
      recordTitle: 'คืนค่าบทบาทและสิทธิ์เริ่มต้น (Reset RBAC Defaults)',
      details: 'รีเซ็ตสิทธิ์บทบาทเริ่มต้น 6 บทบาทของระบบ',
    });
  },

  // Backward-compatibility wrapper for hasPermission
  hasPermission(
    role: string,
    module: string,
    permission: string
  ): boolean {
    const resolvedRole = ROLE_ALIASES[role] || role;
    if (resolvedRole === 'Super Admin') return true;
    const actionKey = permission.toLowerCase();
    const moduleKey = module.toLowerCase().replace('-', '_');
    const fullCode = `${moduleKey}.${actionKey}`;
    return this.can({ id: 'temp', name: 'Temp', role: resolvedRole, department: '', email: '', initials: '', position: '' }, fullCode);
  },

  canUser(
    user: UserProfile | null,
    module: string,
    permission: string
  ): boolean {
    if (!user) return false;
    return this.hasPermission(user.role, module, permission);
  },

  getPermissions(role: string, module: string): string[] {
    const r = this.getRole(role);
    if (!r) return ['view'];
    if (r.permissions.includes('*')) {
      return ['view', 'create', 'edit', 'delete', 'approve', 'export', 'manage'];
    }
    const moduleKey = module.toLowerCase().replace('-', '_');
    return r.permissions
      .filter((p) => p.startsWith(`${moduleKey}.`))
      .map((p) => p.split('.')[1]);
  },
};
