/**
 * Central Database Service
 * 
 * Provides unified, reactive in-memory and persistent storage for all modules:
 * 1. Core: users, roles, permissions, organizations, faculties, departments
 * 2. Meeting: meetings, agendas, minutes, resolutions, tasks
 * 3. Strategy: strategies, objectives, projects, action_plans, kpis, kpi_targets, kpi_results, budgets, risks
 * 4. Academic: programs, curriculums, courses, course_mappings, partners, mous
 * 5. Credit: learners, credits, credit_transactions, credit_transfer_requests, credit_evidence
 * 6. Faculty: lecturers, competencies, idps, portfolios, mentors
 * 7. Regulatory: regulations, regulatory_matrix, compliance_tasks
 * 8. System: documents, forms, form_fields, form_submissions, notifications, audit_logs
 * 9. Integration: integration_systems, integration_logs
 * 
 * Enforces real domain relationships and reactive synchronization.
 */

// Initial Seed Data Imports
import {
  INITIAL_MEETINGS,
  INITIAL_RESOLUTIONS,
  INITIAL_TASKS,
  INITIAL_ORDERS,
  type MeetingRecord,
  type ResolutionRecord,
  type MeetingTask,
  type MeetingAgendaItem,
} from '../data/meetingModuleData.ts';

import {
  INITIAL_STRATEGY_PILLARS,
  INITIAL_ACTION_PLANS,
  INITIAL_KPIS,
  INITIAL_BUDGET_DATA,
  INITIAL_RISKS,
  type StrategyPillar,
  type ActionPlanRecord,
  type KPIRecord,
  type RiskRecord,
  type BudgetOverviewData,
} from '../data/strategyModuleData.ts';

import {
  INITIAL_PARTNERS,
  INITIAL_DEGREE_PROGRAMS,
  INITIAL_CROSSWALK,
  INITIAL_SHORT_COURSES,
  INITIAL_PRE_DEGREE_STUDENTS,
  INITIAL_CREDIT_WALLETS,
  INITIAL_TRANSACTIONS,
  INITIAL_TRANSFER_APPLICATIONS,
  type PartnerRecord,
  type DegreeProgramRecord,
  type CurriculumCrosswalkRecord,
  type ShortCourseRecord,
  type PreDegreeStudentRecord,
  type CreditBankWallet,
  type CreditBankTransaction,
  type CreditTransferApplication,
} from '../data/academicModuleData.ts';

import {
  INITIAL_FACULTY_LIST,
  INITIAL_COMPETENCIES,
  INITIAL_IDP_STEPS,
  INITIAL_PORTFOLIO_ITEMS,
  INITIAL_MENTOR_REVIEWS,
  type FacultyProfile,
  type CompetencyScore,
  type PortfolioItem,
  type MentorReviewRecord,
} from '../data/facultyModuleData.ts';

import {
  INITIAL_REGULATORY_RECORDS,
  type RegulatoryRecord,
} from '../data/regulatoryModuleData.ts';

import {
  INITIAL_DOCUMENTS,
  type CentralDocument,
} from '../data/documentsModuleData.ts';

import {
  INITIAL_FORM_DEFINITIONS,
  INITIAL_FORM_SUBMISSIONS,
  type FormDefinition,
  type FormSubmissionRecord,
} from '../data/formsModuleData.ts';

import type {
  AppSystemRole,
  AppSystemPermission,
  IntegrationSystemDefinition,
  SystemIntegrationLog,
} from '../types/architecture.ts';

import { auditLogService } from './auditLogService.ts';
import { notificationEngine } from './notificationEngine.ts';
import { ROLE_DEFINITIONS, DEMO_PERSONAS } from './rbacService.ts';
import { validationService } from './validationService.ts';
import { errorService } from './errorService.ts';
import { integrityService } from './integrityService.ts';
import {
  dbIndexManager,
  transactionManager,
  RelationalConstraintEngine,
  INSTITUTIONAL_FOREIGN_KEYS,
  INSTITUTIONAL_UNIQUE_CONSTRAINTS,
  type TransactionContext,
} from './databaseEngine.ts';
import type { SystemUserAccount } from '../types/rbac.ts';
import type { UserProfile } from '../types.ts';
import { masterDataService } from './masterDataService.ts';

export { masterDataService };

const DB_STORAGE_KEY = 'mcu_central_db_v3_clean';

// Seed initial integration systems
const INITIAL_INTEGRATION_SYSTEMS: IntegrationSystemDefinition[] = [
  {
    id: 'int-ncb-01',
    code: 'NCB-MHESI',
    name: 'ธนาคารหน่วยกิตแห่งชาติ (National Credit Bank)',
    nameEn: 'National Credit Bank System (MHESI)',
    agency: 'กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม (อว.)',
    category: 'national_db',
    status: 'Connected',
    description: 'เชื่อมโยงผลลัพธ์การเรียนรู้และเทียบโอนหน่วยกิตมาตรฐานแห่งชาติ รองรับการสะสมเครดิตข้ามสถาบัน',
    endpointUrl: 'https://api.ncb.mhesi.go.th/v2/credits/transfer',
    authMethod: 'OAuth2 / Bearer Token',
    supportedProtocols: ['REST API', 'JSON', 'Webhook'],
    lastSyncAt: '2026-09-17 08:30:00',
    recordsCount: 428,
    syncInterval: 'ทุก 6 ชั่วโมง',
    healthRate: 99.8,
  },
  {
    id: 'int-checo-02',
    code: 'CHECO-ONLINE',
    name: 'ระบบพิจารณาความสอดคล้องหลักสูตร (CHECO)',
    nameEn: 'Curriculum Harmonization & Compliance Online',
    agency: 'สำนักงานปลัดกระทรวงการอุดมศึกษาฯ (สป.อว.)',
    category: 'ministry',
    status: 'Connected',
    description: 'ส่งข้อมูล มคอ.2 หลักสูตรที่สภามหาวิทยาลัยอนุมัติ เพื่อรับรองมาตรฐานตามเกณฑ์มาตรฐานคุณวุฒิ',
    endpointUrl: 'https://checo.mhesi.go.th/api/v1/curriculums',
    authMethod: 'API Key & HMAC',
    supportedProtocols: ['REST API', 'JSON', 'Excel'],
    lastSyncAt: '2026-09-16 15:45:00',
    recordsCount: 164,
    syncInterval: 'ทุกวัน เวลา 02:00 น.',
    healthRate: 98.5,
  },
  {
    id: 'int-qa-03',
    code: 'QA-EDPEX',
    name: 'ระบบประกันคุณภาพและเกณฑ์ EdPEx (QA System)',
    nameEn: 'Quality Assurance & EdPEx Academic Evaluation',
    agency: 'กองแผนงานและพัฒนาคุณภาพ มจร',
    category: 'quality_assurance',
    status: 'Connected',
    description: 'ดึงข้อมูล KPI ผลลัพธ์ตัวชี้วัดความสำเร็จ เพื่อประมวลผลรายงานการประเมินตนเอง (SAR)',
    endpointUrl: 'https://qa.mcu.ac.th/gateway/kpi-sync',
    authMethod: 'API Key & HMAC',
    supportedProtocols: ['REST API', 'JSON', 'CSV'],
    lastSyncAt: '2026-09-17 06:00:00',
    recordsCount: 32,
    syncInterval: 'ทุกสัปดาห์',
    healthRate: 100.0,
  },
  {
    id: 'int-hr-04',
    code: 'MCU-HRIS',
    name: 'ระบบบริหารงานบุคคล มจร (Human Resource System)',
    nameEn: 'MCU Human Resource Information System',
    agency: 'กองการบริหารงานบุคคล สำนักงานอธิการบดี',
    category: 'institutional_hr',
    status: 'Pending',
    description: 'ซิงก์ข้อมูลคณาจารย์ ตำแหน่งทางวิชาการ ประวัติภาระงาน และการพัฒนาตนเอง Thailand PSF',
    endpointUrl: 'https://hris.mcu.ac.th/api/faculty-sync',
    authMethod: 'mTLS Certificate',
    supportedProtocols: ['REST API', 'JSON', 'CSV'],
    lastSyncAt: '2026-09-15 11:20:00',
    recordsCount: 890,
    syncInterval: 'รอบการปรับปรุงข้อมูลบุคคล',
    healthRate: 94.2,
  },
  {
    id: 'int-sis-05',
    code: 'MCU-REG',
    name: 'ระบบทะเบียนและวัดผลนักศึกษา (SIS / REG System)',
    nameEn: 'Student Information & Registration System',
    agency: 'สำนักทะเบียนและวัดผล มจร',
    category: 'student_information',
    status: 'Connected',
    description: 'เชื่อมผลการเรียน โครงสร้างหลักสูตร รหัสรายวิชา และข้อมูลนิสิตโครงการ Pre-degree',
    endpointUrl: 'https://reg.mcu.ac.th/api/v2/transcripts',
    authMethod: 'OAuth2 / Bearer Token',
    supportedProtocols: ['REST API', 'JSON', 'CSV', 'Excel'],
    lastSyncAt: '2026-09-17 07:15:00',
    recordsCount: 3450,
    syncInterval: 'Realtime Webhook',
    healthRate: 99.4,
  },
  {
    id: 'int-edoc-06',
    code: 'MCU-EDOC',
    name: 'ระบบสารบรรณอิเล็กทรอนิกส์ (Document System)',
    nameEn: 'MCU E-Document & Digital Archival System',
    agency: 'กองกลาง สำนักงานอธิการบดี',
    category: 'document_system',
    status: 'Connected',
    description: 'ส่งออกมติสภาวิชาการ คำสั่งแต่งตั้งคณะกรรมการ และหนังสือเวียนระเบียบข้อบังคับ',
    endpointUrl: 'https://edoc.mcu.ac.th/service/dispatch',
    authMethod: 'OAuth2 / Bearer Token',
    supportedProtocols: ['REST API', 'JSON', 'Webhook'],
    lastSyncAt: '2026-09-17 09:00:00',
    recordsCount: 1250,
    syncInterval: 'เมื่อมีคำสั่งอนุมัติ',
    healthRate: 99.9,
  },
];

const INITIAL_INTEGRATION_LOGS: SystemIntegrationLog[] = [
  {
    id: 'LOG-INT-001',
    systemId: 'int-ncb-01',
    systemName: 'National Credit Bank (อว.)',
    timestamp: '2026-09-17 08:30:12',
    protocol: 'REST API',
    action: 'SYNC_CREDIT_TRANSFERS',
    recordsCount: 14,
    status: 'success',
    details: 'ส่งมอบข้อมูลการสะสมหน่วยกิตนิสิตโครงการพุทธศาสตรบัณฑิตเข้าระบบกลางสำเร็จ',
    durationMs: 342,
    statusCode: 200,
  },
  {
    id: 'LOG-INT-002',
    systemId: 'int-checo-02',
    systemName: 'CHECO-ONLINE',
    timestamp: '2026-09-16 15:45:00',
    protocol: 'JSON',
    action: 'POST_CURRICULUM_MKO2',
    recordsCount: 2,
    status: 'success',
    details: 'ยื่นร่างหลักสูตรปรับปรุง พ.ศ. 2570 ผ่าน CHECO API เรียบร้อย ได้รับรหัสรับเรื่อง',
    durationMs: 512,
    statusCode: 201,
  },
  {
    id: 'LOG-INT-003',
    systemId: 'int-sis-05',
    systemName: 'MCU-REG (สำนักทะเบียน)',
    timestamp: '2026-09-17 07:15:22',
    protocol: 'Webhook',
    action: 'WEBHOOK_GRADE_EVENT',
    recordsCount: 38,
    status: 'success',
    details: 'รับข้อมูลผลการศึกษาผู้เรียน Pre-degree เพื่อปรับปรุงกระเป๋าหน่วยกิต',
    durationMs: 120,
    statusCode: 200,
  },
  {
    id: 'LOG-INT-004',
    systemId: 'int-hr-04',
    systemName: 'MCU-HRIS',
    timestamp: '2026-09-15 11:20:10',
    protocol: 'REST API',
    action: 'FACULTY_PORTFOLIO_QUERY',
    recordsCount: 0,
    status: 'warning',
    details: 'ระบบตอบรับช้าเนื่องจากมีการสำรองฐานข้อมูลประจำสัปดาห์ (Pending retry)',
    durationMs: 4200,
    statusCode: 504,
  },
];

// Core Institutional Organizations & Faculties
const INITIAL_FACULTIES = [
  { id: 'fac-1', code: 'FAC-BUD', nameTh: 'คณะพุทธศาสตร์', nameEn: 'Faculty of Buddhism', campus: 'วังน้อย พระนครศรีอยุธยา' },
  { id: 'fac-2', code: 'FAC-EDU', nameTh: 'คณะครุศาสตร์', nameEn: 'Faculty of Education', campus: 'วังน้อย พระนครศรีอยุธยา' },
  { id: 'fac-3', code: 'FAC-HUM', nameTh: 'คณะมนุษยศาสตร์', nameEn: 'Faculty of Humanities', campus: 'วังน้อย พระนครศรีอยุธยา' },
  { id: 'fac-4', code: 'FAC-SOC', nameTh: 'คณะสังคมศาสตร์', nameEn: 'Faculty of Social Sciences', campus: 'วังน้อย พระนครศรีอยุธยา' },
  { id: 'fac-5', code: 'FAC-GRAD', nameTh: 'บัณฑิตวิทยาลัย', nameEn: 'Graduate School', campus: 'วังน้อย พระนครศรีอยุธยา' },
  { id: 'fac-6', code: 'FAC-IPS', nameTh: 'สถาบันภาษาและวิทยาลัยนานาชาติ', nameEn: 'Language Institute & International College', campus: 'วังน้อย' },
];

const INITIAL_DEPARTMENTS = [
  { id: 'dep-1', code: 'ACAD-AFFAIRS', name: 'กองวิชาการ สำนักงานอธิการบดี', facultyId: null },
  { id: 'dep-2', code: 'CURR-DEV', name: 'กลุ่มงานมาตรฐานและพัฒนาหลักสูตร', facultyId: 'fac-1' },
  { id: 'dep-3', code: 'CREDIT-BANK', name: 'ศูนย์บริหารจัดการธนาคารหน่วยกิต มจร', facultyId: null },
  { id: 'dep-4', code: 'REGISTRAR', name: 'สำนักทะเบียนและวัดผล', facultyId: null },
  { id: 'dep-5', code: 'FAC-DEV', name: 'ศูนย์พัฒนาอาจารย์และ Thailand PSF', facultyId: null },
];

export const INITIAL_USER_ACCOUNTS: SystemUserAccount[] = [
  {
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
  {
    id: 'usr-exec',
    name: 'พระพรหมบัณฑิต, ศ.ดร.',
    username: 'executive.council',
    role: 'ผู้บริหาร',
    position: 'ประธานคณะกรรมการสภาวิชาการ / กรรมการสภามหาวิทยาลัย',
    department: 'สำนักงานสภามหาวิทยาลัย มจร',
    email: 'executive.council@mcu.ac.th',
    phone: '035-248-010',
    initials: 'พบ',
    status: 'active',
    createdDate: '2025-01-10 09:00:00',
    updatedDate: '2026-09-15 14:20:00',
    lastLogin: '2026-09-17 10:45:00',
  },
  {
    id: 'usr-1',
    name: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
    username: 'academic.director',
    role: 'หัวหน้ากอง',
    position: 'ผู้อำนวยการกองวิชาการ สำนักงานอธิการบดี',
    department: 'กองวิชาการ สำนักงานอธิการบดี',
    email: 'academic.director@mcu.ac.th',
    phone: '035-248-055',
    initials: 'ผอ',
    status: 'active',
    createdDate: '2025-01-15 10:00:00',
    updatedDate: '2026-09-16 11:30:00',
    lastLogin: '2026-09-18 08:30:11',
  },
  {
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
  {
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
  {
    id: 'usr-general',
    name: 'นายอานนท์ ภักดี',
    username: 'arnon.p',
    role: 'ผู้ใช้งานทั่วไป',
    position: 'นิสิต/ผู้เรียนโครงการเรียนรู้ตลอดชีวิต',
    department: 'บุคคลภายนอก / ผู้เรียนสะสมหน่วยกิต',
    email: 'arnon.learner@gmail.com',
    phone: '081-987-6543',
    initials: 'อน',
    status: 'active',
    createdDate: '2025-06-15 11:20:00',
    updatedDate: '2026-09-01 10:00:00',
    lastLogin: '2026-09-15 18:30:00',
  },
  {
    id: 'usr-staff-2',
    name: 'นายธีรศักดิ์ รัตนกุล',
    username: 'teerasak.r',
    role: 'เจ้าหน้าที่',
    position: 'เจ้าหน้าที่บริหารงานทั่วไป',
    department: 'ศูนย์บริหารจัดการธนาคารหน่วยกิต มจร',
    email: 'teerasak.r@mcu.ac.th',
    phone: '035-248-064',
    initials: 'ธร',
    status: 'active',
    createdDate: '2025-04-10 09:15:00',
    updatedDate: '2026-09-14 15:30:00',
    lastLogin: '2026-09-17 11:10:00',
  },
  {
    id: 'usr-staff-3',
    name: 'นางวราภรณ์ จิตต์อารี',
    username: 'waraporn.j',
    role: 'เจ้าหน้าที่',
    position: 'นักวิชาการศึกษา',
    department: 'กลุ่มงานส่งเสริมและพัฒนาวิชาการ กองวิชาการ',
    email: 'waraporn.j@mcu.ac.th',
    phone: '035-248-065',
    initials: 'วร',
    status: 'active',
    createdDate: '2025-05-12 10:30:00',
    updatedDate: '2026-09-11 14:00:00',
    lastLogin: '2026-09-18 07:55:00',
  },
  {
    id: 'usr-inactive',
    name: 'นายสมชาย มั่นคง',
    username: 'somchai.m',
    role: 'ผู้ใช้งานทั่วไป',
    position: 'อดีตเจ้าหน้าที่ประสานงาน (ระงับสิทธิ์ชั่วคราว)',
    department: 'กองวิชาการ สำนักงานอธิการบดี',
    email: 'somchai.m@mcu.ac.th',
    phone: '035-248-070',
    initials: 'สม',
    status: 'inactive',
    createdDate: '2024-11-01 09:00:00',
    updatedDate: '2026-08-15 10:00:00',
    lastLogin: '2026-08-14 16:50:00',
  },
];

// Central Database Schema State
export interface CentralDatabaseState {
  // Core
  users: typeof DEMO_PERSONAS;
  userAccounts: SystemUserAccount[];
  faculties: typeof INITIAL_FACULTIES;
  departments: typeof INITIAL_DEPARTMENTS;

  // Meeting
  meetings: MeetingRecord[];
  resolutions: ResolutionRecord[];
  tasks: MeetingTask[];
  orders: typeof INITIAL_ORDERS;

  // Strategy
  strategies: StrategyPillar[];
  actionPlans: ActionPlanRecord[];
  kpis: KPIRecord[];
  budgets: BudgetOverviewData;
  risks: RiskRecord[];

  // Academic
  programs: DegreeProgramRecord[];
  crosswalks: CurriculumCrosswalkRecord[];
  shortCourses: ShortCourseRecord[];
  partners: PartnerRecord[];

  // Credit
  preDegreeStudents: PreDegreeStudentRecord[];
  creditWallets: CreditBankWallet[];
  creditTransactions: CreditBankTransaction[];
  creditTransferRequests: CreditTransferApplication[];

  // Faculty
  facultyMembers: FacultyProfile[];
  competencies: CompetencyScore[];
  idpSteps: typeof INITIAL_IDP_STEPS;
  portfolios: PortfolioItem[];
  mentorReviews: MentorReviewRecord[];

  // Regulatory
  regulations: RegulatoryRecord[];

  // System
  documents: CentralDocument[];
  forms: FormDefinition[];
  formSubmissions: FormSubmissionRecord[];

  // Integration
  integrationSystems: IntegrationSystemDefinition[];
  integrationLogs: SystemIntegrationLog[];
}

// Initial state constructor
function buildInitialState(): CentralDatabaseState {
  return {
    users: { ...DEMO_PERSONAS },
    userAccounts: [...INITIAL_USER_ACCOUNTS],
    faculties: [...INITIAL_FACULTIES],
    departments: [...INITIAL_DEPARTMENTS],

    meetings: [...INITIAL_MEETINGS],
    resolutions: [...INITIAL_RESOLUTIONS],
    tasks: [...INITIAL_TASKS],
    orders: [...INITIAL_ORDERS],

    strategies: [...INITIAL_STRATEGY_PILLARS],
    actionPlans: [...INITIAL_ACTION_PLANS],
    kpis: [...INITIAL_KPIS],
    budgets: { ...INITIAL_BUDGET_DATA },
    risks: [...INITIAL_RISKS],

    programs: [...INITIAL_DEGREE_PROGRAMS],
    crosswalks: [...INITIAL_CROSSWALK],
    shortCourses: [...INITIAL_SHORT_COURSES],
    partners: [...INITIAL_PARTNERS],

    preDegreeStudents: [...INITIAL_PRE_DEGREE_STUDENTS],
    creditWallets: [...INITIAL_CREDIT_WALLETS],
    creditTransactions: [...INITIAL_TRANSACTIONS],
    creditTransferRequests: [...INITIAL_TRANSFER_APPLICATIONS],

    facultyMembers: [...INITIAL_FACULTY_LIST],
    competencies: [...INITIAL_COMPETENCIES],
    idpSteps: [...INITIAL_IDP_STEPS],
    portfolios: [...INITIAL_PORTFOLIO_ITEMS],
    mentorReviews: [...INITIAL_MENTOR_REVIEWS],

    regulations: [...INITIAL_REGULATORY_RECORDS],

    documents: [...INITIAL_DOCUMENTS],
    forms: [...INITIAL_FORM_DEFINITIONS],
    formSubmissions: [...INITIAL_FORM_SUBMISSIONS],

    integrationSystems: [...INITIAL_INTEGRATION_SYSTEMS],
    integrationLogs: [...INITIAL_INTEGRATION_LOGS],
  };
}

let dbState: CentralDatabaseState = (() => {
  try {
    localStorage.removeItem('mcu_central_db_v1');
    localStorage.removeItem('mcu_central_db_v2_real');
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.meetings && parsed.kpis && parsed.integrationSystems) {
        const hasLegacyMock =
          (Array.isArray(parsed.meetings) && parsed.meetings.some((m: any) => m.id?.includes('mtg-2569'))) ||
          (Array.isArray(parsed.kpis) && parsed.kpis.some((k: any) => k.id?.includes('kpi-1') || k.code === 'KPI-01')) ||
          (Array.isArray(parsed.actionPlans) && parsed.actionPlans.some((p: any) => p.id?.includes('act-')));
        if (hasLegacyMock) {
          localStorage.removeItem(DB_STORAGE_KEY);
          return buildInitialState();
        }
        if (!parsed.userAccounts || !Array.isArray(parsed.userAccounts) || parsed.userAccounts.length === 0) {
          parsed.userAccounts = [...INITIAL_USER_ACCOUNTS];
        }
        if (!parsed.facultyMembers || !Array.isArray(parsed.facultyMembers) || parsed.facultyMembers.length === 0) {
          parsed.facultyMembers = [...INITIAL_FACULTY_LIST];
        }
        if (!parsed.competencies || !Array.isArray(parsed.competencies) || parsed.competencies.length === 0) {
          parsed.competencies = [...INITIAL_COMPETENCIES];
        }
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return buildInitialState();
})();

// Initialize database indexes immediately upon boot
dbIndexManager.rebuildAll(dbState);

const dbListeners = new Set<(state: CentralDatabaseState) => void>();

function notifyDb() {
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(dbState));
  } catch {
    // ignore
  }
  dbIndexManager.rebuildAll(dbState);
  dbListeners.forEach((fn) => fn({ ...dbState }));
}

export const centralDb = {
  /**
   * Subscribe to all database changes
   */
  subscribe(callback: (state: CentralDatabaseState) => void): () => void {
    dbListeners.add(callback);
    callback({ ...dbState });
    return () => dbListeners.delete(callback);
  },

  /**
   * Get raw snapshot
   */
  getState(): CentralDatabaseState {
    return { ...dbState };
  },

  /**
   * Execute multi-table ACID transaction with snapshot rollback on failure
   */
  runTransaction<T>(
    description: string,
    operation: (tx: TransactionContext) => T
  ) {
    return transactionManager.execute(
      () => dbState,
      (newState) => {
        dbState = newState;
        notifyDb();
      },
      description,
      operation
    );
  },

  /**
   * Get full audit history of executed ACID transactions
   */
  getTransactionHistory() {
    return transactionManager.getHistory();
  },

  /**
   * Database Index Engine Statistics & Lookup
   */
  getIndexStats() {
    return dbIndexManager.getAllIndexStats();
  },

  rebuildIndexes() {
    dbIndexManager.rebuildAll(dbState);
    return dbIndexManager.getAllIndexStats();
  },

  lookupByIndex<T = any>(indexName: string, key: string): T | undefined {
    return dbIndexManager.findByPk<T>(indexName, key) || dbIndexManager.findByUnique<T>(indexName, key);
  },

  lookupByForeignKey<T = any>(indexName: string, foreignKeyValue: string): T[] {
    return dbIndexManager.findByForeignKey<T>(indexName, foreignKeyValue);
  },

  /**
   * Institutional Common / Master Data Service (ข้อมูลกลาง)
   */
  masterData: masterDataService,

  /**
   * Unique constraint & Foreign Key validation helper
   */
  verifyUniqueConstraint(table: keyof CentralDatabaseState, field: string, value: any, currentId?: string) {
    RelationalConstraintEngine.verifyUniqueConstraint(dbState, table, field, value, currentId);
  },

  // ==========================================
  // 1. CORE OPERATIONS
  // ==========================================
  getUsers() {
    return Object.values(dbState.users);
  },

  getUserById(id: string) {
    return Object.values(dbState.users).find((u) => u.id === id);
  },

  getFaculties() {
    return dbState.faculties;
  },

  getDepartments() {
    return dbState.departments;
  },

  // ==========================================
  // 2. MEETING & RELATIONSHIP OPERATIONS
  // Meeting -> Resolution -> Task -> Deadline -> Notification -> Dashboard
  // ==========================================
  getMeetings(): MeetingRecord[] {
    return dbState.meetings;
  },

  getMeetingById(id: string): MeetingRecord | undefined {
    return dbState.meetings.find((m) => m.id === id);
  },

  createMeeting(meeting: Omit<MeetingRecord, 'id'>, currentUser?: any): MeetingRecord {
    // 1. Dual-layer validation (service layer)
    const validation = validationService.validate(meeting, [
      { field: 'title', label: 'ชื่อการประชุม', required: true, min: 5 },
      { field: 'code', label: 'รหัสการประชุม', required: true },
      { field: 'date', label: 'วันที่ประชุม', required: true, type: 'date' },
      { field: 'venue', label: 'สถานที่ประชุม', required: true },
    ]);

    if (!validation.isValid) {
      throw errorService.validationError(validation.errorList[0].message, validation.errors);
    }

    // 2. Duplicate code check
    if (validationService.isDuplicate(dbState.meetings, 'code', meeting.code)) {
      throw errorService.validationError(`รหัสการประชุม "${meeting.code}" มีอยู่ในระบบแล้ว กรุณาใช้รหัสอื่น`);
    }

    const newMeeting: MeetingRecord = {
      ...meeting,
      id: 'MTG-2569-' + String(dbState.meetings.length + 1).padStart(2, '0'),
    };
    dbState.meetings = [newMeeting, ...dbState.meetings];

    auditLogService.log({
      userId: currentUser?.id || 'usr-system',
      userName: currentUser?.name || 'ระบบส่วนกลาง',
      userRole: currentUser?.role || 'Staff',
      action: 'CREATE',
      module: 'Meeting',
      recordId: newMeeting.id,
      recordTitle: newMeeting.title,
      newValue: { code: newMeeting.code, date: newMeeting.date },
      details: `สร้างการประชุมวิชาการรหัส ${newMeeting.code} วันที่ ${newMeeting.date}`,
    });

    notificationEngine.dispatch({
      title: `สร้างการประชุมวิชาการใหม่: ${newMeeting.title}`,
      description: `กำหนดจัดประชุมวันที่ ${newMeeting.date} เวลา ${newMeeting.timeStart} น. ณ ${newMeeting.venue}`,
      trigger: 'Meeting',
      priority: 'Normal',
      module: 'meetings',
      targetPath: '/meetings',
      targetId: newMeeting.id,
    });

    notifyDb();
    return newMeeting;
  },

  deleteMeeting(id: string, actorUser?: UserProfile): boolean {
    const meeting = dbState.meetings.find((m) => m.id === id);
    if (!meeting) return false;

    // Referential integrity guard
    const check = integrityService.canDeleteMeeting(id);
    if (!check.allowed) {
      throw errorService.integrityError(
        'ไม่อนุญาตให้ลบการประชุมที่มีมติสภาวิชาการผูกอยู่',
        check.reason || 'มีการอ้างอิงข้อมูลมติสภาวิชาการ',
        'กรุณาตรวจสอบมติที่เกี่ยวข้อง หรือเลือกใช้การยกเลิก/จัดเก็บประวัติแทนการลบถาวร'
      );
    }

    dbState.meetings = dbState.meetings.filter((m) => m.id !== id);
    notifyDb();

    auditLogService.log({
      userId: actorUser?.id || 'usr-super',
      userName: actorUser?.name || 'ผู้ดูแลระบบ',
      userRole: actorUser?.role || 'Super Admin',
      action: 'DELETE',
      module: 'Meeting',
      recordId: id,
      recordTitle: meeting.title,
      oldValue: meeting,
      details: `ลบรายการประชุมวิชาการ ${meeting.code}: ${meeting.title}`,
    });

    return true;
  },

  getResolutions(meetingId?: string): ResolutionRecord[] {
    if (meetingId) {
      return dbState.resolutions.filter((r) => r.meetingId === meetingId);
    }
    return dbState.resolutions;
  },

  createResolution(resolution: Omit<ResolutionRecord, 'id'>, currentUser?: any): ResolutionRecord {
    // 1. Validation
    const validation = validationService.validate(resolution, [
      { field: 'title', label: 'ชื่อมติ', required: true, min: 5 },
      { field: 'code', label: 'เลขที่มติ', required: true },
      { field: 'meetingId', label: 'การประชุมอ้างอิง', required: true },
    ]);

    if (!validation.isValid) {
      throw errorService.validationError(validation.errorList[0].message, validation.errors);
    }

    // 2. Referential integrity check
    const meetingExists = dbState.meetings.some((m) => m.id === resolution.meetingId);
    if (!meetingExists) {
      throw errorService.notFound('การประชุม', resolution.meetingId);
    }

    const newResolution: ResolutionRecord = {
      ...resolution,
      id: 'RES-2569-' + Math.floor(Math.random() * 900 + 100),
    };
    dbState.resolutions = [newResolution, ...dbState.resolutions];

    // Update meeting resolution count
    dbState.meetings = dbState.meetings.map((m) =>
      m.id === resolution.meetingId
        ? { ...m, totalResolutions: m.totalResolutions + 1 }
        : m
    );

    auditLogService.log({
      userId: currentUser?.id || 'usr-system',
      userName: currentUser?.name || 'ระบบส่วนกลาง',
      userRole: currentUser?.role || 'Staff',
      action: 'CREATE',
      module: 'Meeting',
      recordId: newResolution.id,
      recordTitle: newResolution.title,
      newValue: newResolution,
      details: `บันทึกมติที่ประชุมสภาวิชาการ: ${newResolution.title}`,
    });

    notifyDb();
    return newResolution;
  },

  deleteResolution(id: string, actorUser?: UserProfile): boolean {
    const resolution = dbState.resolutions.find((r) => r.id === id);
    if (!resolution) return false;

    // Referential integrity guard
    const check = integrityService.canDeleteResolution(id);
    if (!check.allowed) {
      throw errorService.integrityError(
        'ไม่อนุญาตให้ลบมติที่มีภารกิจดำเนินงานอยู่',
        check.reason || 'มีภารกิจค้างส่งมอบ',
        'กรุณาปิดภารกิจหรือโอนย้ายความรับผิดชอบก่อนทำการลบ'
      );
    }

    dbState.resolutions = dbState.resolutions.filter((r) => r.id !== id);
    // Decrease meeting resolution count
    if (resolution.meetingId) {
      dbState.meetings = dbState.meetings.map((m) =>
        m.id === resolution.meetingId && m.totalResolutions > 0
          ? { ...m, totalResolutions: m.totalResolutions - 1 }
          : m
      );
    }

    notifyDb();

    auditLogService.log({
      userId: actorUser?.id || 'usr-super',
      userName: actorUser?.name || 'ผู้ดูแลระบบ',
      userRole: actorUser?.role || 'Super Admin',
      action: 'DELETE',
      module: 'Meeting',
      recordId: id,
      recordTitle: resolution.title,
      oldValue: resolution,
      details: `ลบมติสภาวิชาการ: ${resolution.title}`,
    });

    return true;
  },

  getTasks(): MeetingTask[] {
    return dbState.tasks;
  },

  createTaskFromResolution(
    resolutionId: string,
    taskData: {
      title: string;
      assignee: string;
      department: string;
      deadline: string;
      priority: 'critical' | 'high' | 'medium' | 'low';
    },
    currentUser?: any
  ): MeetingTask {
    // 1. Validation
    const validation = validationService.validate(taskData, [
      { field: 'title', label: 'ชื่องานที่มอบหมาย', required: true, min: 3 },
      { field: 'assignee', label: 'ผู้รับผิดชอบ', required: true },
      { field: 'deadline', label: 'กำหนดส่ง', required: true, type: 'date' },
    ]);

    if (!validation.isValid) {
      throw errorService.validationError(validation.errorList[0].message, validation.errors);
    }

    const resolution = dbState.resolutions.find((r) => r.id === resolutionId);
    if (!resolution) {
      throw errorService.notFound('มติสภาวิชาการ', resolutionId);
    }
    const meetingTitle = resolution.meetingTitle || 'สภาวิชาการ มจร';

    const newTask: MeetingTask = {
      id: 'TSK-2569-' + String(dbState.tasks.length + 1).padStart(3, '0'),
      resolutionId,
      title: taskData.title,
      assignee: taskData.assignee,
      department: taskData.department,
      deadline: taskData.deadline,
      priority: taskData.priority,
      status: 'pending',
      progress: 0,
      meetingReference: meetingTitle,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    dbState.tasks = [newTask, ...dbState.tasks];

    // Audit Log
    auditLogService.log({
      userId: currentUser?.id || 'usr-system',
      userName: currentUser?.name || 'ระบบส่วนกลาง',
      userRole: currentUser?.role || 'Staff',
      action: 'CREATE',
      module: 'Meeting',
      recordId: newTask.id,
      recordTitle: newTask.title,
      newValue: { assignee: newTask.assignee, deadline: newTask.deadline },
      details: `มอบหมายงานจากมติที่ประชุม: ${newTask.title} มอบหมายให้ ${newTask.assignee} กำหนดส่ง ${newTask.deadline}`,
    });

    // Notification Trigger (Relationship: Resolution -> Task -> Deadline Notification -> Dashboard)
    notificationEngine.dispatch({
      title: `มอบหมายงานใหม่: ${newTask.title}`,
      description: `ผู้รับผิดชอบ: ${newTask.assignee} (${newTask.department}) กำหนดส่งภายใน ${newTask.deadline}`,
      trigger: 'New Assignment',
      priority: newTask.priority === 'critical' ? 'Critical' : 'High',
      module: 'meetings',
      targetPath: '/meetings',
      targetId: newTask.id,
      actionRequired: true,
    });

    notifyDb();
    return newTask;
  },

  updateMeeting(id: string, updates: Partial<MeetingRecord>, actorUser?: any): MeetingRecord {
    const existing = dbState.meetings.find((m) => m.id === id);
    if (!existing) {
      throw errorService.notFound('การประชุม', id);
    }
    if (updates.code && updates.code !== existing.code) {
      RelationalConstraintEngine.verifyUniqueConstraint(dbState, 'meetings', 'code', updates.code, id);
    }
    const updated = { ...existing, ...updates };
    dbState.meetings = dbState.meetings.map((m) => (m.id === id ? updated : m));
    auditLogService.log({
      userId: actorUser?.id || 'usr-system',
      userName: actorUser?.name || 'ระบบส่วนกลาง',
      userRole: actorUser?.role || 'Staff',
      action: 'UPDATE',
      module: 'Meeting',
      recordId: id,
      recordTitle: updated.title,
      oldValue: existing,
      newValue: updated,
      details: `แก้ไขข้อมูลการประชุม ${updated.code}: ${updated.title}`,
    });
    notifyDb();
    return updated;
  },

  updateResolution(id: string, updates: Partial<ResolutionRecord>, actorUser?: any): ResolutionRecord {
    const existing = dbState.resolutions.find((r) => r.id === id);
    if (!existing) {
      throw errorService.notFound('มติสภาวิชาการ', id);
    }
    const updated = { ...existing, ...updates };
    dbState.resolutions = dbState.resolutions.map((r) => (r.id === id ? updated : r));
    auditLogService.log({
      userId: actorUser?.id || 'usr-system',
      userName: actorUser?.name || 'ระบบส่วนกลาง',
      userRole: actorUser?.role || 'Staff',
      action: 'UPDATE',
      module: 'Meeting',
      recordId: id,
      recordTitle: updated.title,
      oldValue: existing,
      newValue: updated,
      details: `แก้ไขข้อมูลมติสภาวิชาการ: ${updated.title}`,
    });
    notifyDb();
    return updated;
  },

  createTask(taskData: Partial<MeetingTask> & { resolutionId: string; title: string }, actorUser?: any): MeetingTask {
    const resolution = dbState.resolutions.find((r) => r.id === taskData.resolutionId);
    if (!resolution) {
      throw errorService.notFound('มติสภาวิชาการ', taskData.resolutionId);
    }
    const newTask: MeetingTask = {
      id: taskData.id || 'TSK-2569-' + String(dbState.tasks.length + 1).padStart(3, '0'),
      resolutionId: taskData.resolutionId,
      title: taskData.title,
      department: taskData.department || 'กองวิชาการ',
      assignee: taskData.assignee || 'เจ้าหน้าที่ผู้รับผิดชอบ',
      deadline: taskData.deadline || new Date().toISOString().substring(0, 10),
      priority: taskData.priority || 'medium',
      status: taskData.status || 'pending',
      progress: taskData.progress || 0,
      meetingReference: taskData.meetingReference || resolution.meetingTitle || 'สภาวิชาการ มจร',
      updatedAt: new Date().toISOString().substring(0, 10),
    };
    dbState.tasks = [newTask, ...dbState.tasks];
    auditLogService.log({
      userId: actorUser?.id || 'usr-system',
      userName: actorUser?.name || 'ระบบส่วนกลาง',
      userRole: actorUser?.role || 'Staff',
      action: 'CREATE',
      module: 'Meeting',
      recordId: newTask.id,
      recordTitle: newTask.title,
      newValue: newTask,
      details: `สร้างภารกิจติดตามมติ: ${newTask.title}`,
    });
    notifyDb();
    return newTask;
  },

  updateTask(id: string, updates: Partial<MeetingTask>, actorUser?: any): MeetingTask {
    const existing = dbState.tasks.find((t) => t.id === id);
    if (!existing) {
      throw errorService.notFound('ภารกิจ', id);
    }
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString().substring(0, 10),
    };
    dbState.tasks = dbState.tasks.map((t) => (t.id === id ? updated : t));
    auditLogService.log({
      userId: actorUser?.id || 'usr-system',
      userName: actorUser?.name || 'ระบบส่วนกลาง',
      userRole: actorUser?.role || 'Staff',
      action: 'UPDATE',
      module: 'Meeting',
      recordId: id,
      recordTitle: updated.title,
      oldValue: existing,
      newValue: updated,
      details: `ปรับปรุงสถานะภารกิจ: ${updated.title} (สถานะ: ${updated.status}, ความคืบหน้า: ${updated.progress}%)`,
    });
    notifyDb();
    return updated;
  },

  deleteTask(id: string, actorUser?: any): boolean {
    const existing = dbState.tasks.find((t) => t.id === id);
    if (!existing) return false;
    dbState.tasks = dbState.tasks.filter((t) => t.id !== id);
    auditLogService.log({
      userId: actorUser?.id || 'usr-super',
      userName: actorUser?.name || 'ผู้ดูแลระบบ',
      userRole: actorUser?.role || 'Super Admin',
      action: 'DELETE',
      module: 'Meeting',
      recordId: id,
      recordTitle: existing.title,
      oldValue: existing,
      details: `ลบภารกิจติดตามมติ: ${existing.title}`,
    });
    notifyDb();
    return true;
  },

  // ==========================================
  // 3. STRATEGY, KPI, BUDGET & RISK OPERATIONS
  // Strategy -> Project -> KPI -> Budget -> Risk -> Dashboard
  // ==========================================
  getStrategies(): StrategyPillar[] {
    return dbState.strategies;
  },

  getKPIs(): KPIRecord[] {
    return dbState.kpis;
  },

  getKPIById(id: string): KPIRecord | undefined {
    return dbState.kpis.find((k) => k.id === id);
  },

  updateKPI(
    id: string,
    updates: Partial<KPIRecord>,
    currentUser?: any
  ): KPIRecord | null {
    const existing = dbState.kpis.find((k) => k.id === id);
    if (!existing) return null;

    // Validate bounds
    if (updates.target !== undefined) {
      if (typeof updates.target !== 'number' || updates.target < 0) {
        throw errorService.validationError('ค่าเป้าหมาย KPI ต้องเป็นตัวเลขและไม่ติดลบ');
      }
      if (existing.unit === '%' && updates.target > 100) {
        throw errorService.validationError('ค่าเป้าหมายร้อยละ (%) ต้องมีค่าไม่เกิน 100');
      }
    }
    if (updates.actual !== undefined) {
      if (typeof updates.actual !== 'number' || updates.actual < 0) {
        throw errorService.validationError('ผลการดำเนินงานจริงต้องเป็นตัวเลขและไม่ติดลบ');
      }
    }

    const oldTarget = existing.target;
    const oldActual = existing.actual;

    const updated: KPIRecord = {
      ...existing,
      ...updates,
    };

    dbState.kpis = dbState.kpis.map((k) => (k.id === id ? updated : k));

    // Audit Log: User A แก้ไข KPI Target 80 -> 90 วันที่/เวลา
    auditLogService.log({
      userId: currentUser?.id || 'usr-1',
      userName: currentUser?.name || 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
      userRole: currentUser?.role || 'Central Admin',
      action: 'UPDATE',
      module: 'Strategy',
      recordId: updated.id,
      recordTitle: updated.name,
      oldValue: { target: oldTarget, actual: oldActual },
      newValue: { target: updated.target, actual: updated.actual },
      details: `แก้ไขค่าเป้าหมาย/ผลลัพธ์ KPI: Target ${oldTarget} → ${updated.target}, Actual ${oldActual} → ${updated.actual} (${updated.unit})`,
    });

    // Notification
    notificationEngine.dispatch({
      title: `อัปเดตค่าตัวชี้วัด KPI: ${updated.name}`,
      description: `ค่าเป้าหมายปรับเป็น ${updated.target} ${updated.unit} (ผลการดำเนินงานปัจจุบัน ${updated.actual} ${updated.unit})`,
      trigger: 'KPI',
      priority: 'Normal',
      module: 'strategy',
      targetPath: '/strategy',
      targetId: updated.id,
    });

    notifyDb();
    return updated;
  },

  createKPI(kpiData: Omit<KPIRecord, 'id'>, currentUser?: any): KPIRecord {
    RelationalConstraintEngine.verifyUniqueConstraint(dbState, 'kpis', 'code', kpiData.code);
    const newKPI: KPIRecord = {
      ...kpiData,
      id: 'KPI-2569-' + String(dbState.kpis.length + 1).padStart(2, '0'),
    };
    dbState.kpis = [...dbState.kpis, newKPI];
    auditLogService.log({
      userId: currentUser?.id || 'usr-system',
      userName: currentUser?.name || 'ระบบส่วนกลาง',
      userRole: currentUser?.role || 'Staff',
      action: 'CREATE',
      module: 'Strategy',
      recordId: newKPI.id,
      recordTitle: newKPI.name,
      newValue: newKPI,
      details: `เพิ่มตัวชี้วัดยุทธศาสตร์ใหม่: ${newKPI.code} - ${newKPI.name}`,
    });
    notifyDb();
    return newKPI;
  },

  getActionPlans(): ActionPlanRecord[] {
    return dbState.actionPlans;
  },

  getBudgetData(): BudgetOverviewData {
    return dbState.budgets;
  },

  getRisks(): RiskRecord[] {
    return dbState.risks;
  },

  // ==========================================
  // 4. ACADEMIC & CREDIT BANK RELATIONSHIPS
  // Course -> Curriculum -> Credit -> Pre-degree -> Credit Bank
  // ==========================================
  getPrograms(): DegreeProgramRecord[] {
    return dbState.programs;
  },

  getCurriculumCrosswalks(): CurriculumCrosswalkRecord[] {
    return dbState.crosswalks;
  },

  getShortCourses(): ShortCourseRecord[] {
    return dbState.shortCourses;
  },

  getPartners(): PartnerRecord[] {
    return dbState.partners;
  },

  getPreDegreeStudents(): PreDegreeStudentRecord[] {
    return dbState.preDegreeStudents;
  },

  getCreditWallets(): CreditBankWallet[] {
    return dbState.creditWallets;
  },

  getCreditTransferRequests(): CreditTransferApplication[] {
    return dbState.creditTransferRequests;
  },

  approveCreditTransfer(
    applicationId: string,
    approvedCredits: number,
    currentUser?: any
  ): boolean {
    const app = dbState.creditTransferRequests.find((a) => a.id === applicationId);
    if (!app) return false;

    dbState.creditTransferRequests = dbState.creditTransferRequests.map((a) =>
      a.id === applicationId
        ? {
            ...a,
            status: 'completed' as const,
            approvedCredits,
            committeeDecisionDate: new Date().toISOString().split('T')[0],
            notes: `${a.notes} | อนุมัติโดย ${currentUser?.name || 'คณะกรรมการเทียบโอน'}`,
          }
        : a
    );

    // Update Learner Wallet credits
    dbState.creditWallets = dbState.creditWallets.map((w) =>
      w.fullName === app.applicantName
        ? {
            ...w,
            totalCreditsAccumulated: w.totalCreditsAccumulated + approvedCredits,
          }
        : w
    );

    // Audit Log
    auditLogService.log({
      userId: currentUser?.id || 'usr-system',
      userName: currentUser?.name || 'คณะกรรมการเทียบโอน',
      userRole: currentUser?.role || 'Faculty Admin',
      action: 'APPROVE',
      module: 'Credit',
      recordId: applicationId,
      recordTitle: `คำร้องเทียบโอน: ${app.applicantName}`,
      oldValue: { status: 'pending' },
      newValue: { status: 'approved', approvedCredits },
      details: `อนุมัติเทียบโอนผลการเรียนรู้จำนวน ${approvedCredits} หน่วยกิต`,
    });

    // Notification
    notificationEngine.dispatch({
      title: `อนุมัติการเทียบโอนหน่วยกิตสำเร็จ: ${app.applicantName}`,
      description: `ได้รับอนุมัติเทียบโอนผลการเรียนรู้จำนวน ${approvedCredits} หน่วยกิต เข้าสู่ระบบธนาคารหน่วยกิต มจร`,
      trigger: 'Approval',
      priority: 'High',
      module: 'credit-bank',
      targetPath: '/credit-bank',
      targetId: applicationId,
    });

    notifyDb();
    return true;
  },

  // ==========================================
  // 5. FACULTY, COMPETENCY, IDP & MENTOR RELATIONSHIPS
  // Faculty -> Competency -> IDP -> Portfolio -> Mentor
  // ==========================================
  getFacultyMembers(): FacultyProfile[] {
    return dbState.facultyMembers;
  },

  getCompetencies(): CompetencyScore[] {
    return dbState.competencies;
  },

  getPortfolios(): PortfolioItem[] {
    return dbState.portfolios;
  },

  getMentorReviews(): MentorReviewRecord[] {
    return dbState.mentorReviews;
  },

  updateIdpGoalStatus(
    goalId: string,
    newStatus: 'completed' | 'in-progress' | 'planned',
    currentUser?: any
  ): boolean {
    auditLogService.log({
      userId: currentUser?.id || 'usr-lecturer',
      userName: currentUser?.name || 'อาจารย์ประจำหลักสูตร',
      userRole: currentUser?.role || 'Lecturer',
      action: 'UPDATE',
      module: 'Faculty',
      recordId: goalId,
      recordTitle: `เป้าหมายการพัฒนาตนเอง (IDP Goal)`,
      newValue: { status: newStatus },
      details: `ปรับปรุงสถานะเป้าหมาย IDP เป็น "${newStatus}"`,
    });

    notifyDb();
    return true;
  },

  submitMentorReview(
    review: Omit<MentorReviewRecord, 'id'>,
    currentUser?: any
  ): MentorReviewRecord {
    const newReview: MentorReviewRecord = {
      ...review,
      id: 'REV-2569-' + Math.floor(Math.random() * 900 + 100),
    };

    dbState.mentorReviews = [newReview, ...dbState.mentorReviews];

    auditLogService.log({
      userId: currentUser?.id || 'usr-mentor',
      userName: currentUser?.name || 'อาจารย์พี่เลี้ยง Thailand PSF',
      userRole: currentUser?.role || 'Mentor',
      action: 'APPROVE',
      module: 'Faculty',
      recordId: newReview.id,
      recordTitle: `ผลการประเมิน Thailand PSF แฟ้มผลงานอาจารย์`,
      newValue: newReview,
      details: `บันทึกผลการประเมินแฟ้มผลงาน Thailand PSF ระดับผลประเมิน ${newReview.overallRating}`,
    });

    notificationEngine.dispatch({
      title: `อาจารย์พี่เลี้ยงตรวจประเมินผลงานเรียบร้อยแล้ว`,
      description: `มีข้อเสนอแนะในการพัฒนาการจัดการเรียนรู้และการวิจัยในชั้นเรียน`,
      trigger: 'Approval',
      priority: 'Normal',
      module: 'faculty',
      targetPath: '/faculty',
      targetId: newReview.id,
    });

    notifyDb();
    return newReview;
  },

  // ==========================================
  // 6. REGULATION & COMPLIANCE RELATIONSHIPS
  // Regulation -> Compliance Task -> Responsible Person -> Deadline -> Notification
  // ==========================================
  getRegulations(): RegulatoryRecord[] {
    return dbState.regulations;
  },

  updateRegulationTaskStatus(
    regulationId: string,
    checklistId: string,
    done: boolean,
    currentUser?: any
  ): boolean {
    const reg = dbState.regulations.find((r) => r.id === regulationId);
    if (!reg) return false;

    reg.actionChecklist = reg.actionChecklist.map((c) =>
      c.id === checklistId ? { ...c, done } : c
    );

    const allDone = reg.actionChecklist.every((c) => c.done);
    if (allDone) {
      reg.status = 'compliant';
    }

    auditLogService.log({
      userId: currentUser?.id || 'usr-system',
      userName: currentUser?.name || 'ผู้รับผิดชอบงานกำกับมาตรฐาน',
      userRole: currentUser?.role || 'Staff',
      action: 'UPDATE',
      module: 'Regulatory',
      recordId: regulationId,
      recordTitle: reg.regulationTitle,
      newValue: { checklistId, done, overallStatus: reg.status },
      details: `ปรับปรุงรายการตรวจสอบการปฏิบัติตามกฎระเบียบ: ${done ? 'เสร็จสิ้น' : 'ยังไม่เสร็จ'}`,
    });

    if (allDone) {
      notificationEngine.dispatch({
        title: `การปฏิบัติตามกฎระเบียบครบถ้วนสมบูรณ์`,
        description: `${reg.code}: ${reg.regulationTitle} ดำเนินการครบทุกขั้นตอนแล้ว`,
        trigger: 'Approval',
        priority: 'Normal',
        module: 'regulatory',
        targetPath: '/regulatory',
        targetId: regulationId,
      });
    }

    notifyDb();
    return true;
  },

  // ==========================================
  // 7. SYSTEM: DOCUMENTS & FORMS
  // ==========================================
  getDocuments(): CentralDocument[] {
    return dbState.documents;
  },

  getForms(): FormDefinition[] {
    return dbState.forms;
  },

  getFormSubmissions(): FormSubmissionRecord[] {
    return dbState.formSubmissions;
  },

  // ==========================================
  // 8. INTEGRATION CENTER
  // ==========================================
  getIntegrationSystems(): IntegrationSystemDefinition[] {
    return dbState.integrationSystems;
  },

  getIntegrationSystemById(id: string): IntegrationSystemDefinition | undefined {
    return dbState.integrationSystems.find((s) => s.id === id);
  },

  getIntegrationLogs(systemId?: string): SystemIntegrationLog[] {
    if (systemId) {
      return dbState.integrationLogs.filter((l) => l.systemId === systemId);
    }
    return dbState.integrationLogs;
  },

  triggerIntegrationSync(
    systemId: string,
    protocol: any,
    currentUser?: any
  ): SystemIntegrationLog {
    const sys = dbState.integrationSystems.find((s) => s.id === systemId);
    const now = new Date();
    const timeStr =
      now.getFullYear() +
      '-' +
      String(now.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(now.getDate()).padStart(2, '0') +
      ' ' +
      String(now.getHours()).padStart(2, '0') +
      ':' +
      String(now.getMinutes()).padStart(2, '0') +
      ':' +
      String(now.getSeconds()).padStart(2, '0');

    const processedCount = Math.floor(Math.random() * 25) + 5;
    const isSuccess = Math.random() > 0.1;

    const newLog: SystemIntegrationLog = {
      id: 'LOG-' + Date.now().toString().slice(-6),
      systemId,
      systemName: sys?.name || 'ระบบภายนอก',
      timestamp: timeStr,
      protocol: protocol || 'REST API',
      action: 'MANUAL_SYNC_TRIGGER',
      recordsCount: isSuccess ? processedCount : 0,
      status: isSuccess ? 'success' : 'error',
      details: isSuccess
        ? `ซิงก์ข้อมูลสองทางสำเร็จ จำนวน ${processedCount} รายการ ประมวลผลสมบูรณ์`
        : 'การเชื่อมต่อหมดเวลา (Connection timeout) หรือ Token หมดอายุ กรุณาตรวจสอบสถานะเครือข่าย',
      durationMs: Math.floor(Math.random() * 400) + 120,
      statusCode: isSuccess ? 200 : 504,
    };

    dbState.integrationLogs = [newLog, ...dbState.integrationLogs];

    // Update system last sync
    if (sys && isSuccess) {
      sys.lastSyncAt = timeStr;
      sys.recordsCount += processedCount;
      sys.status = 'Connected';
    } else if (sys && !isSuccess) {
      sys.status = 'Error';
    }

    auditLogService.log({
      userId: currentUser?.id || 'usr-system',
      userName: currentUser?.name || 'ผู้ดูแลระบบบูรณาการ',
      userRole: currentUser?.role || 'Super Admin',
      action: 'CREATE',
      module: 'Integration',
      recordId: systemId,
      recordTitle: sys?.name || 'ระบบภายนอก',
      newValue: { status: isSuccess ? 'success' : 'error', count: processedCount },
      details: `เรียกซิงก์ข้อมูลระบบ "${sys?.name}" ด้วยโปรโตคอล ${protocol}: สถานะ ${newLog.status}`,
    });

    notifyDb();
    return newLog;
  },

  // ==========================================
  // 9. GLOBAL SEARCH ACROSS ALL MODULES
  // Searches: Name, Code, Curriculum, KPI, Faculty, Document, MOU, Regulation, Credit, Meeting
  // ==========================================
  globalSearch(query: string): {
    id: string;
    code?: string;
    title: string;
    subtitle: string;
    category: string;
    targetPath: string;
    accent: 'pink' | 'blue' | 'teal' | 'emerald' | 'amber' | 'purple' | 'red';
  }[] {
    const q = (query || '').trim().toLowerCase();
    if (!q) return [];

    const results: any[] = [];

    // 1. Meetings
    dbState.meetings.forEach((m) => {
      if (m.title.toLowerCase().includes(q) || m.code.toLowerCase().includes(q) || m.venue.toLowerCase().includes(q)) {
        results.push({
          id: m.id,
          code: m.code,
          title: m.title,
          subtitle: `การประชุม วันที่ ${m.date} | มติ ${m.totalResolutions} รายการ`,
          category: 'การประชุม (Meeting)',
          targetPath: '/meetings',
          accent: 'pink',
        });
      }
    });

    // 2. Resolutions
    dbState.resolutions.forEach((r) => {
      if (r.title.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.details.toLowerCase().includes(q)) {
        results.push({
          id: r.id,
          code: r.id,
          title: r.title,
          subtitle: `มติสภาวิชาการ | ผู้รับผิดชอบ: ${r.responsiblePerson}`,
          category: 'มติที่ประชุม (Resolution)',
          targetPath: '/meetings',
          accent: 'pink',
        });
      }
    });

    // 3. KPIs & Strategies
    dbState.kpis.forEach((k) => {
      if (k.name.toLowerCase().includes(q) || k.id.toLowerCase().includes(q) || k.code.toLowerCase().includes(q) || k.description.toLowerCase().includes(q)) {
        results.push({
          id: k.id,
          code: k.code,
          title: k.name,
          subtitle: `ตัวชี้วัดความสำเร็จ (${k.code}) | เป้าหมาย: ${k.target} ${k.unit} (ปัจจุบัน: ${k.actual})`,
          category: 'ตัวชี้วัด (KPI)',
          targetPath: '/strategy',
          accent: 'blue',
        });
      }
    });

    // 4. Programs & Curriculums
    dbState.programs.forEach((p) => {
      if (p.titleTh.toLowerCase().includes(q) || p.titleEn.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.partnerUniversity.toLowerCase().includes(q)) {
        results.push({
          id: p.id,
          code: p.id,
          title: p.titleTh,
          subtitle: `หลักสูตร ${p.type === 'dual_degree' ? 'Dual Degree' : 'Joint Degree'} | ${p.partnerUniversity}`,
          category: 'หลักสูตร (Curriculum)',
          targetPath: '/courses',
          accent: 'teal',
        });
      }
    });

    // 5. Short Courses
    dbState.shortCourses.forEach((c) => {
      if (c.titleTh.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)) {
        results.push({
          id: c.id,
          code: c.code,
          title: c.titleTh,
          subtitle: `หลักสูตรระยะสั้น | เทียบโอน ${c.creditBankEquiv} หน่วยกิต (${c.hours} ชม.)`,
          category: 'รายวิชา/หลักสูตรระยะสั้น (Course)',
          targetPath: '/courses',
          accent: 'teal',
        });
      }
    });

    // 6. Partners & MOUs
    dbState.partners.forEach((m) => {
      if (m.university.toLowerCase().includes(q) || m.country.toLowerCase().includes(q) || m.mouNumber.toLowerCase().includes(q)) {
        results.push({
          id: m.id,
          code: m.mouNumber,
          title: m.university,
          subtitle: `ความร่วมมือทางวิชาการ MOU (${m.mouNumber}) | ${m.country}`,
          category: 'ความร่วมมือ / MOU',
          targetPath: '/collaboration',
          accent: 'emerald',
        });
      }
    });

    // 7. Faculty & Lecturers
    dbState.facultyMembers.forEach((f) => {
      if (f.name.toLowerCase().includes(q) || f.department.toLowerCase().includes(q) || f.academicPosition.toLowerCase().includes(q)) {
        results.push({
          id: f.id,
          title: f.name,
          subtitle: `${f.academicPosition} | ${f.department}`,
          category: 'อาจารย์/บุคลากร (Faculty)',
          targetPath: '/faculty',
          accent: 'purple',
        });
      }
    });

    // 8. Regulations & Compliance
    dbState.regulations.forEach((r) => {
      if (r.regulationTitle.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.requiredAction.toLowerCase().includes(q)) {
        results.push({
          id: r.id,
          code: r.code,
          title: r.regulationTitle,
          subtitle: `กฎหมาย/ข้อบังคับ (${r.type}) | กำหนดส่ง: ${r.deadline}`,
          category: 'ระเบียบ/ข้อบังคับ (Regulation)',
          targetPath: '/regulatory',
          accent: 'amber',
        });
      }
    });

    // 9. Credit Bank
    dbState.preDegreeStudents.forEach((s) => {
      if (s.fullName.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q)) {
        results.push({
          id: s.id,
          code: s.studentId,
          title: s.fullName,
          subtitle: `ผู้เรียน Pre-degree (${s.schoolName}) | สะสม ${s.totalCredits} หน่วยกิต`,
          category: 'ธนาคารหน่วยกิต (Credit Bank)',
          targetPath: '/credit-bank',
          accent: 'amber',
        });
      }
    });

    // 10. Documents
    dbState.documents.forEach((d) => {
      if (d.title.toLowerCase().includes(q) || d.documentNo?.toLowerCase().includes(q)) {
        results.push({
          id: d.id,
          code: d.documentNo,
          title: d.title,
          subtitle: `เอกสาร ${d.fileType.toUpperCase()} | ${d.fileSize}`,
          category: 'คลังเอกสาร (Document)',
          targetPath: '/documents',
          accent: 'pink',
        });
      }
    });

    return results.slice(0, 20); // Cap at top 20 relevant results
  },

  // ==========================================
  // 10. DYNAMIC EXECUTIVE DASHBOARD AGGREGATES
  // ==========================================
  getExecutiveDashboardData() {
    const totalMeetings = dbState.meetings.length;
    const completedResolutions = dbState.resolutions.filter((r) => r.status === 'completed').length;
    const totalResolutions = dbState.resolutions.length;
    const totalKpis = dbState.kpis.length;
    const achievedKpis = dbState.kpis.filter((k) => k.actual >= k.target).length;
    const activeTasks = dbState.tasks.filter((t) => t.status !== 'completed');
    const overdueTasks = dbState.tasks.filter((t) => t.status === 'overdue');
    const highRisks = dbState.risks.filter((r) => r.level === 'high' || r.level === 'critical');
    const pendingTransfers = dbState.creditTransferRequests.filter((c) => c.status === 'committee_review' || c.status === 'senate_approval' || c.status === 'pending_screening');

    return {
      totalMeetings,
      totalResolutions,
      completedResolutions,
      totalKpis,
      achievedKpis,
      kpiPercentage: totalKpis > 0 ? Math.round((achievedKpis / totalKpis) * 100) : 0,
      activeTasksCount: activeTasks.length,
      overdueTasksCount: overdueTasks.length,
      highRisksCount: highRisks.length,
      pendingTransfersCount: pendingTransfers.length,
    };
  },

  // ==========================================
  // 11. USER MANAGEMENT (RBAC Accounts)
  // ==========================================
  getUserAccounts(): SystemUserAccount[] {
    return [...dbState.userAccounts];
  },

  getUserAccountById(id: string): SystemUserAccount | undefined {
    return dbState.userAccounts.find((u) => u.id === id);
  },

  createUserAccount(
    userData: {
      name: string;
      username: string;
      email: string;
      phone: string;
      position: string;
      department: string;
      role: string;
      status?: 'active' | 'inactive' | 'suspended';
      customPermissions?: string[];
      deniedPermissions?: string[];
    },
    actorUser?: UserProfile
  ): SystemUserAccount {
    // 1. Validation
    const validation = validationService.validate(userData, [
      { field: 'name', label: 'ชื่อ-นามสกุล', required: true, min: 3 },
      { field: 'username', label: 'ชื่อผู้ใช้งาน (Username)', required: true, min: 3 },
      { field: 'email', label: 'อีเมล', required: true, type: 'email' },
      { field: 'phone', label: 'เบอร์โทรศัพท์', required: true, type: 'phone' },
      { field: 'role', label: 'บทบาทระบบ', required: true },
    ]);

    if (!validation.isValid) {
      throw errorService.validationError(validation.errorList[0].message, validation.errors);
    }

    // 2. Duplicate checks
    if (validationService.isDuplicate(dbState.userAccounts, 'username', userData.username)) {
      throw errorService.validationError(`ชื่อผู้ใช้ (Username) "${userData.username}" มีอยู่ในระบบแล้ว`);
    }

    if (validationService.isDuplicate(dbState.userAccounts, 'email', userData.email)) {
      throw errorService.validationError(`อีเมล "${userData.email}" มีอยู่ในระบบแล้ว`);
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const initials = userData.name
      .split(' ')
      .map((w) => w.charAt(0))
      .join('')
      .slice(0, 2) || 'ผู้';

    const newUser: SystemUserAccount = {
      id: `usr-${Date.now()}`,
      name: userData.name.trim(),
      username: userData.username.trim().toLowerCase(),
      email: userData.email.trim().toLowerCase(),
      phone: userData.phone.trim(),
      position: userData.position.trim(),
      department: userData.department.trim(),
      role: userData.role,
      status: userData.status || 'active',
      initials,
      createdDate: now,
      updatedDate: now,
      lastLogin: '-',
      customPermissions: userData.customPermissions || [],
      deniedPermissions: userData.deniedPermissions || [],
    };

    dbState.userAccounts = [newUser, ...dbState.userAccounts];
    notifyDb();

    auditLogService.log({
      userId: actorUser?.id || 'usr-super',
      userName: actorUser?.name || 'ผู้ดูแลระบบ',
      userRole: actorUser?.role || 'Super Admin',
      action: 'CREATE',
      module: 'User Management',
      recordId: newUser.id,
      recordTitle: `สร้างผู้ใช้งาน: ${newUser.name} (${newUser.username})`,
      newValue: newUser,
      details: `สร้างบัญชีผู้ใช้งานใหม่ กำหนดบทบาท "${newUser.role}" สังกัด ${newUser.department}`,
      ipAddress: '10.20.4.15',
    });

    return newUser;
  },

  updateUserAccount(
    id: string,
    updates: Partial<Omit<SystemUserAccount, 'id' | 'createdDate'>>,
    actorUser?: UserProfile
  ): SystemUserAccount {
    const existing = dbState.userAccounts.find((u) => u.id === id);
    if (!existing) {
      throw new Error(`ไม่พบบัญชีผู้ใช้งานรหัส ${id}`);
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updated: SystemUserAccount = {
      ...existing,
      ...updates,
      updatedDate: now,
    };

    dbState.userAccounts = dbState.userAccounts.map((u) => (u.id === id ? updated : u));
    notifyDb();

    auditLogService.log({
      userId: actorUser?.id || 'usr-super',
      userName: actorUser?.name || 'ผู้ดูแลระบบ',
      userRole: actorUser?.role || 'Super Admin',
      action: 'UPDATE',
      module: 'User Management',
      recordId: updated.id,
      recordTitle: `ปรับปรุงข้อมูลผู้ใช้: ${updated.name}`,
      oldValue: existing,
      newValue: updated,
      details: `ปรับปรุงข้อมูลบัญชีผู้ใช้งาน สังกัด: ${updated.department}, บทบาท: ${updated.role}`,
      ipAddress: '10.20.4.15',
    });

    return updated;
  },

  setUserStatus(
    id: string,
    status: 'active' | 'inactive' | 'suspended',
    actorUser?: UserProfile
  ): SystemUserAccount {
    const user = dbState.userAccounts.find((u) => u.id === id);
    if (!user) throw new Error(`ไม่พบผู้ใช้งาน ${id}`);

    const prevStatus = user.status;
    const updated = this.updateUserAccount(id, { status }, actorUser);

    auditLogService.log({
      userId: actorUser?.id || 'usr-super',
      userName: actorUser?.name || 'ผู้ดูแลระบบ',
      userRole: actorUser?.role || 'Super Admin',
      action: 'TRANSITION',
      module: 'User Management',
      recordId: id,
      recordTitle: `เปลี่ยนสถานะบัญชี: ${user.name}`,
      oldValue: { status: prevStatus },
      newValue: { status },
      details: `เปลี่ยนสถานะบัญชีจาก "${prevStatus}" เป็น "${status}"`,
      ipAddress: '10.20.4.15',
    });

    return updated;
  },

  resetUserPassword(
    id: string,
    actorUser?: UserProfile
  ): { tempPassword: string; message: string } {
    const user = dbState.userAccounts.find((u) => u.id === id);
    if (!user) throw new Error(`ไม่พบผู้ใช้งาน ${id}`);

    const randomPin = Math.floor(1000 + Math.random() * 9000);
    const tempPassword = `McuPass#${randomPin}`;

    this.updateUserAccount(id, {}, actorUser);

    auditLogService.log({
      userId: actorUser?.id || 'usr-super',
      userName: actorUser?.name || 'ผู้ดูแลระบบ',
      userRole: actorUser?.role || 'Super Admin',
      action: 'UPDATE',
      module: 'User Management',
      recordId: id,
      recordTitle: `รีเซ็ตรหัสผ่าน: ${user.name} (${user.username})`,
      details: `สร้างรหัสผ่านชั่วคราวและส่งการแจ้งเตือนไปยังอีเมล ${user.email}`,
      ipAddress: '10.20.4.15',
    });

    notificationEngine.dispatch({
      title: 'รีเซ็ตรหัสผ่านชั่วคราว',
      description: `ระบบได้ทำการสร้างรหัสผ่านชั่วคราวให้ผู้ใช้ ${user.name} เรียบร้อยแล้ว`,
      trigger: 'New Assignment',
      priority: 'Normal',
      module: 'system',
      targetPath: '/users',
    });

    return {
      tempPassword,
      message: `รีเซ็ตรหัสผ่านสำหรับ ${user.name} สำเร็จ ระบบได้ส่งคำแนะนำไปยัง ${user.email}`,
    };
  },

  updateUserPermissions(
    id: string,
    customPermissions: string[],
    deniedPermissions: string[],
    actorUser?: UserProfile
  ): SystemUserAccount {
    const user = dbState.userAccounts.find((u) => u.id === id);
    if (!user) throw new Error(`ไม่พบผู้ใช้งาน ${id}`);

    const updated = this.updateUserAccount(
      id,
      { customPermissions, deniedPermissions },
      actorUser
    );

    auditLogService.log({
      userId: actorUser?.id || 'usr-super',
      userName: actorUser?.name || 'ผู้ดูแลระบบ',
      userRole: actorUser?.role || 'Super Admin',
      action: 'UPDATE',
      module: 'User Management',
      recordId: id,
      recordTitle: `กำหนดสิทธิ์เฉพาะบุคคล: ${user.name}`,
      newValue: { customPermissions, deniedPermissions },
      details: `มอบสิทธิ์เพิ่ม ${customPermissions.length} รายการ, ยกเว้นสิทธิ์ ${deniedPermissions.length} รายการ`,
      ipAddress: '10.20.4.15',
    });

    return updated;
  },

  deleteUserAccount(id: string, actorUser?: UserProfile): boolean {
    const user = dbState.userAccounts.find((u) => u.id === id);
    if (!user) return false;

    // Referential integrity check
    const check = integrityService.canDeleteUser(id);
    if (!check.allowed) {
      throw errorService.integrityError(
        'ไม่อนุญาตให้ลบบัญชีผู้ใช้งานที่มีภารกิจค้างอยู่',
        check.reason || 'มีภารกิจหรือสิทธิ์ผู้ดูแลที่จำเป็น',
        'กรุณาเปลี่ยนสถานะเป็น "ระงับการใช้งาน (Suspended)" หรือโอนย้ายภารกิจก่อน'
      );
    }

    dbState.userAccounts = dbState.userAccounts.filter((u) => u.id !== id);
    notifyDb();

    auditLogService.log({
      userId: actorUser?.id || 'usr-super',
      userName: actorUser?.name || 'ผู้ดูแลระบบ',
      userRole: actorUser?.role || 'Super Admin',
      action: 'DELETE',
      module: 'User Management',
      recordId: user.id,
      recordTitle: `ลบบัญชีผู้ใช้งาน: ${user.name}`,
      oldValue: user,
      details: `ลบบัญชีผู้ใช้ ${user.username} ออกจากระบบกองวิชาการ`,
      ipAddress: '10.20.4.15',
    });

    return true;
  },

  /**
   * Restore full database state from verified snapshot
   */
  restoreDatabaseState(newState: CentralDatabaseState, actorUser?: UserProfile): boolean {
    if (!newState || !Array.isArray(newState.meetings) || !Array.isArray(newState.userAccounts)) {
      throw errorService.validationError('ข้อมูลโครงสร้าง State สำรองไม่ถูกต้อง');
    }

    const previousState = dbState;
    dbState = { ...newState };
    notifyDb();

    auditLogService.log({
      userId: actorUser?.id || 'usr-super',
      userName: actorUser?.name || 'ผู้ดูแลระบบ',
      userRole: actorUser?.role || 'Super Admin',
      action: 'UPDATE',
      module: 'Security',
      recordId: 'DB-RESTORE-' + Date.now(),
      recordTitle: 'กู้คืนฐานข้อมูลจากไฟล์สำรอง (System Snapshot Restoration)',
      oldValue: { meetings: previousState.meetings.length, users: previousState.userAccounts.length },
      newValue: { meetings: newState.meetings.length, users: newState.userAccounts.length },
      details: 'กู้คืนข้อมูลระบบวิชาการจากไฟล์สำรองฉุกเฉินสำเร็จ',
      ipAddress: '10.20.4.15',
    });

    return true;
  },

  /**
   * Reset database to factory demo state
   */
  resetToFactoryDemo(): void {
    dbState = buildInitialState();
    localStorage.removeItem(DB_STORAGE_KEY);
    notifyDb();
  },
};

export const centralDatabase = centralDb;
export default centralDb;
