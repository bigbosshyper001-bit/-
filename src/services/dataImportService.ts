/**
 * Data Import & Validation Engine Service
 * Supports: Excel (.xlsx, .xls), CSV, JSON
 * 
 * Safety & Quality Guardrails:
 * - Duplicate Detection (DB uniqueness & In-file duplicates)
 * - Column Mapping & Missing Column validation
 * - Date Format validation & Buddhist Era (พ.ศ. <-> ค.ศ.) Auto-normalization
 * - Missing required fields detection
 * - Import History & Rollback management
 */

import * as XLSX from 'xlsx';
import { centralDb } from './centralDatabase.ts';
import { auditLogService } from './auditLogService.ts';

export type SupportedImportFormat = 'xlsx' | 'xls' | 'csv' | 'json';

export type TargetDatasetType =
  | 'faculty'
  | 'programs'
  | 'resolutions'
  | 'kpis'
  | 'action_plans'
  | 'credit_wallets'
  | 'partners'
  | 'meetings';

export interface FieldDefinition {
  key: string;
  labelTh: string;
  labelEn: string;
  required: boolean;
  type: 'string' | 'number' | 'date' | 'email' | 'enum';
  enumValues?: string[];
  aliases: string[]; // Known synonyms in Thai/English for auto-mapping
  description?: string;
}

export interface DatasetSchema {
  type: TargetDatasetType;
  titleTh: string;
  titleEn: string;
  primaryKey: string;
  fields: FieldDefinition[];
  sampleRow: Record<string, any>;
}

export interface ValidationError {
  rowIndex: number; // 1-based (Excel row)
  fieldKey: string;
  fieldLabel: string;
  errorType: 'missing_required' | 'invalid_date' | 'invalid_number' | 'duplicate_in_file' | 'duplicate_in_db' | 'invalid_format';
  message: string;
  rawVal: any;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  totalRows: number;
  validRowsCount: number;
  errorRowsCount: number;
  warningRowsCount: number;
  duplicateCount: number;
  errors: ValidationError[];
  processedRows: {
    rowIndex: number;
    raw: Record<string, any>;
    normalized: Record<string, any>;
    status: 'valid' | 'warning' | 'error';
    errors: ValidationError[];
    isDuplicate: boolean;
  }[];
}

export interface ImportHistoryRecord {
  id: string;
  importedAt: string;
  importedBy: string;
  fileName: string;
  fileSize: number;
  format: SupportedImportFormat;
  datasetType: TargetDatasetType;
  datasetName: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  status: 'completed' | 'partial' | 'reverted';
  importedItemIds: string[];
  errorsSummary?: string[];
}

const IMPORT_HISTORY_STORAGE_KEY = 'mcu_import_history_records_v1';

// Available Datasets Schema Specifications
export const DATASET_SCHEMAS: Record<TargetDatasetType, DatasetSchema> = {
  faculty: {
    type: 'faculty',
    titleTh: 'ข้อมูลคณาจารย์และบุคลากรวิชาการ',
    titleEn: 'Academic Faculty & Personnel',
    primaryKey: 'id',
    fields: [
      {
        key: 'id',
        labelTh: 'รหัสอาจารย์ / บุคลากร',
        labelEn: 'Faculty ID',
        required: true,
        type: 'string',
        aliases: ['รหัส', 'รหัสประจำตัว', 'รหัสอาจารย์', 'id', 'faculty_id', 'employee_id'],
      },
      {
        key: 'name',
        labelTh: 'ชื่อ-นามสกุล',
        labelEn: 'Full Name',
        required: true,
        type: 'string',
        aliases: ['ชื่อ', 'ชื่อ-สกุล', 'ชื่อ นามสกุล', 'ชื่อ-นามสกุล', 'name', 'full_name'],
      },
      {
        key: 'monkTitle',
        labelTh: 'สมณศักดิ์ / ฉายา (ถ้ามี)',
        labelEn: 'Monk Title / Degree',
        required: false,
        type: 'string',
        aliases: ['สมณศักดิ์', 'ฉายา', 'คำนำหน้า', 'monk_title', 'title'],
      },
      {
        key: 'academicPosition',
        labelTh: 'ตำแหน่งทางวิชาการ',
        labelEn: 'Academic Position',
        required: true,
        type: 'string',
        aliases: ['ตำแหน่งวิชาการ', 'ตำแหน่ง', 'academic_position', 'rank', 'position'],
      },
      {
        key: 'faculty',
        labelTh: 'คณะ / หน่วยงาน',
        labelEn: 'Faculty / College',
        required: true,
        type: 'string',
        aliases: ['คณะ', 'หน่วยงาน', 'faculty', 'faculty_name'],
      },
      {
        key: 'department',
        labelTh: 'ภาควิชา / สังกัดกลุ่มงาน',
        labelEn: 'Department',
        required: false,
        type: 'string',
        aliases: ['ภาควิชา', 'สาขาวิชา', 'กลุ่มงาน', 'department'],
      },
      {
        key: 'email',
        labelTh: 'อีเมลสถาบัน (@mcu.ac.th)',
        labelEn: 'Email Address',
        required: true,
        type: 'email',
        aliases: ['อีเมล', 'อีเมล์', 'email', 'e-mail', 'mail'],
      },
      {
        key: 'phone',
        labelTh: 'เบอร์โทรศัพท์ติดต่อ',
        labelEn: 'Phone Number',
        required: false,
        type: 'string',
        aliases: ['โทรศัพท์', 'เบอร์โทร', 'เบอร์โทรศัพท์', 'phone', 'tel', 'mobile'],
      },
      {
        key: 'psfLevel',
        labelTh: 'ระดับ Thailand PSF (1-4)',
        labelEn: 'Thailand PSF Level',
        required: false,
        type: 'number',
        aliases: ['psf', 'psf_level', 'ระดับ psf', 'ระดับ thailand psf', 'thailand_psf'],
      },
    ],
    sampleRow: {
      id: 'FAC-069',
      name: 'ประสิทธิ์ สุขเกษม, ดร.',
      monkTitle: '',
      academicPosition: 'ผู้ช่วยศาสตราจารย์',
      faculty: 'คณะพุทธศาสตร์',
      department: 'ภาควิชาพระพุทธศาสนา',
      email: 'prasit.s@mcu.ac.th',
      phone: '081-234-5678',
      psfLevel: 2,
    },
  },

  programs: {
    type: 'programs',
    titleTh: 'หลักสูตรปริญญาและมาตรฐาน CHECO',
    titleEn: 'Curriculum & Degree Programs',
    primaryKey: 'id',
    fields: [
      {
        key: 'id',
        labelTh: 'รหัสหลักสูตร',
        labelEn: 'Program ID / Code',
        required: true,
        type: 'string',
        aliases: ['รหัสหลักสูตร', 'รหัส', 'id', 'program_id', 'course_code'],
      },
      {
        key: 'titleTh',
        labelTh: 'ชื่อหลักสูตร (ภาษาไทย)',
        labelEn: 'Program Name (Thai)',
        required: true,
        type: 'string',
        aliases: ['ชื่อหลักสูตร', 'ชื่อหลักสูตร (ไทย)', 'ชื่อไทย', 'title_th', 'program_name_th', 'name_th'],
      },
      {
        key: 'titleEn',
        labelTh: 'ชื่อหลักสูตร (ภาษาอังกฤษ)',
        labelEn: 'Program Name (English)',
        required: false,
        type: 'string',
        aliases: ['ชื่อหลักสูตร (อังกฤษ)', 'ชื่อภาษาอังกฤษ', 'title_en', 'program_name_en', 'name_en'],
      },
      {
        key: 'mcuFaculty',
        labelTh: 'คณะเจ้าของหลักสูตร',
        labelEn: 'Faculty',
        required: true,
        type: 'string',
        aliases: ['คณะ', 'คณะเจ้าของหลักสูตร', 'mcu_faculty', 'faculty'],
      },
      {
        key: 'partnerUniversity',
        labelTh: 'สถาบันร่วม / มหาวิทยาลัย',
        labelEn: 'Partner Institution',
        required: false,
        type: 'string',
        aliases: ['สถาบันร่วม', 'มหาวิทยาลัยร่วม', 'สถาบัน', 'partner_university', 'partner'],
      },
      {
        key: 'totalCredits',
        labelTh: 'จำนวนหน่วยกิตรวม',
        labelEn: 'Total Credits',
        required: true,
        type: 'number',
        aliases: ['หน่วยกิต', 'หน่วยกิตรวม', 'จำนวนหน่วยกิต', 'total_credits', 'credits'],
      },
      {
        key: 'status',
        labelTh: 'สถานะหลักสูตร',
        labelEn: 'Program Status',
        required: false,
        type: 'string',
        aliases: ['สถานะ', 'สถานะหลักสูตร', 'status'],
      },
    ],
    sampleRow: {
      id: 'PROG-69-01',
      titleTh: 'พุทธศาสตรบัณฑิต สาขาวิชาพุทธนวัตกรรม',
      titleEn: 'Bachelor of Arts in Buddhist Innovation',
      mcuFaculty: 'คณะพุทธศาสตร์',
      partnerUniversity: 'Mahachulalongkornrajavidyalaya University',
      totalCredits: 120,
      status: 'active',
    },
  },

  resolutions: {
    type: 'resolutions',
    titleTh: 'ทะเบียนมติสภาวิชาการ',
    titleEn: 'Academic Council Resolutions',
    primaryKey: 'id',
    fields: [
      {
        key: 'id',
        labelTh: 'เลขที่มติ',
        labelEn: 'Resolution ID',
        required: true,
        type: 'string',
        aliases: ['เลขที่มติ', 'รหัสมติ', 'id', 'resolution_id', 'code'],
      },
      {
        key: 'title',
        labelTh: 'เรื่อง / มติการประชุม',
        labelEn: 'Resolution Subject',
        required: true,
        type: 'string',
        aliases: ['เรื่อง', 'ชื่อเรื่อง', 'มติ', 'มติที่ประชุม', 'title', 'subject'],
      },
      {
        key: 'meetingTitle',
        labelTh: 'การประชุมที่ออกมติ',
        labelEn: 'Meeting Reference',
        required: true,
        type: 'string',
        aliases: ['การประชุม', 'อ้างอิงการประชุม', 'meeting_title', 'meeting_ref'],
      },
      {
        key: 'agendaItemNumber',
        labelTh: 'ระเบียบวาระที่',
        labelEn: 'Agenda Item No.',
        required: false,
        type: 'string',
        aliases: ['วาระ', 'ระเบียบวาระ', 'วาระที่', 'agenda_no', 'agenda_item_number'],
      },
      {
        key: 'department',
        labelTh: 'หน่วยงานผู้รับผิดชอบ',
        labelEn: 'Responsible Department',
        required: true,
        type: 'string',
        aliases: ['หน่วยงาน', 'คณะ', 'หน่วยงานผู้รับผิดชอบ', 'department'],
      },
      {
        key: 'responsiblePerson',
        labelTh: 'ผู้รับผิดชอบ / ผู้รายงาน',
        labelEn: 'Responsible Officer',
        required: true,
        type: 'string',
        aliases: ['ผู้รับผิดชอบ', 'ผู้ประสานงาน', 'responsible_person', 'assignee'],
      },
      {
        key: 'deadline',
        labelTh: 'กำหนดส่งมอบงาน (วัน/เดือน/ปี)',
        labelEn: 'Due Date',
        required: true,
        type: 'date',
        aliases: ['กำหนดส่ง', 'กำหนดเวลา', 'วันที่ครบกำหนด', 'deadline', 'due_date'],
      },
      {
        key: 'priority',
        labelTh: 'ระดับความสำคัญ',
        labelEn: 'Priority Level',
        required: false,
        type: 'string',
        aliases: ['ความสำคัญ', 'ระดับความสำคัญ', 'priority'],
      },
    ],
    sampleRow: {
      id: 'RES-2569-09-01',
      title: 'เห็นชอบการเปิดสอนหลักสูตรประกาศนียบัตรพระพุทธศาสนากับนวัตกรรมดิจิทัล',
      meetingTitle: 'การประชุมสภาวิชาการ ครั้งที่ 9/2569',
      agendaItemNumber: '4.2',
      department: 'คณะพุทธศาสตร์',
      responsiblePerson: 'ผศ.ดร.ประสิทธิ์ สุขเกษม',
      deadline: '2026-11-30',
      priority: 'high',
    },
  },

  kpis: {
    type: 'kpis',
    titleTh: 'ตัวชี้วัดยุทธศาสตร์ (KPIs)',
    titleEn: 'Academic Strategic KPIs',
    primaryKey: 'code',
    fields: [
      {
        key: 'code',
        labelTh: 'รหัส KPI',
        labelEn: 'KPI Code',
        required: true,
        type: 'string',
        aliases: ['รหัส kpi', 'รหัส', 'code', 'kpi_code', 'id'],
      },
      {
        key: 'name',
        labelTh: 'ชื่อตัวชี้วัดความสำเร็จ',
        labelEn: 'KPI Name',
        required: true,
        type: 'string',
        aliases: ['ชื่อตัวชี้วัด', 'ตัวชี้วัด', 'ชื่อ kpi', 'name', 'kpi_name', 'title'],
      },
      {
        key: 'unit',
        labelTh: 'หน่วยนับ',
        labelEn: 'Unit of Measure',
        required: true,
        type: 'string',
        aliases: ['หน่วย', 'หน่วยนับ', 'unit'],
      },
      {
        key: 'baseline',
        labelTh: 'ค่าฐานเดิม (Baseline)',
        labelEn: 'Baseline Value',
        required: false,
        type: 'number',
        aliases: ['ค่าฐาน', 'ฐานเดิม', 'baseline'],
      },
      {
        key: 'target',
        labelTh: 'ค่าเป้าหมาย (Target)',
        labelEn: 'Target Value',
        required: true,
        type: 'number',
        aliases: ['เป้าหมาย', 'ค่าเป้าหมาย', 'target'],
      },
      {
        key: 'actual',
        labelTh: 'ผลงานที่ทำได้จริง (Actual)',
        labelEn: 'Actual Value',
        required: false,
        type: 'number',
        aliases: ['ผลงาน', 'ผลงานจริง', 'actual', 'current_value'],
      },
      {
        key: 'department',
        labelTh: 'หน่วยงานผู้กำกับ',
        labelEn: 'Department',
        required: true,
        type: 'string',
        aliases: ['หน่วยงาน', 'คณะ', 'department'],
      },
      {
        key: 'owner',
        labelTh: 'ผู้รับผิดชอบตัวชี้วัด',
        labelEn: 'KPI Owner',
        required: true,
        type: 'string',
        aliases: ['ผู้รับผิดชอบ', 'owner'],
      },
    ],
    sampleRow: {
      code: 'KPI-ACAD-09',
      name: 'จำนวนผู้เรียนในโครงการธนาคารหน่วยกิต (รูป/คน)',
      unit: 'รูป/คน',
      baseline: 200,
      target: 500,
      actual: 428,
      department: 'ศูนย์บริหารจัดการธนาคารหน่วยกิต มจร',
      owner: 'นายธีรศักดิ์ รัตนกุล',
    },
  },

  action_plans: {
    type: 'action_plans',
    titleTh: 'แผนปฏิบัติการและโครงการ (Action Plans)',
    titleEn: 'Action Plans & Projects',
    primaryKey: 'code',
    fields: [
      {
        key: 'code',
        labelTh: 'รหัสโครงการ / แผนงาน',
        labelEn: 'Plan Code',
        required: true,
        type: 'string',
        aliases: ['รหัส', 'รหัสโครงการ', 'code', 'plan_code', 'id'],
      },
      {
        key: 'title',
        labelTh: 'ชื่อโครงการ / แผนงาน',
        labelEn: 'Project Title',
        required: true,
        type: 'string',
        aliases: ['ชื่อโครงการ', 'โครงการ', 'แผนงาน', 'title', 'project_name'],
      },
      {
        key: 'strategyName',
        labelTh: 'สอดคล้องยุทธศาสตร์',
        labelEn: 'Strategic Pillar',
        required: false,
        type: 'string',
        aliases: ['ยุทธศาสตร์', 'เสาหลัก', 'strategy_name', 'strategy'],
      },
      {
        key: 'department',
        labelTh: 'หน่วยงานผู้ดำเนินโครงการ',
        labelEn: 'Department',
        required: true,
        type: 'string',
        aliases: ['หน่วยงาน', 'department'],
      },
      {
        key: 'responsiblePerson',
        labelTh: 'ผู้รับผิดชอบโครงการ',
        labelEn: 'Responsible Person',
        required: true,
        type: 'string',
        aliases: ['ผู้รับผิดชอบ', 'หัวหน้าโครงการ', 'responsible_person'],
      },
      {
        key: 'startDate',
        labelTh: 'วันเริ่มต้นโครงการ',
        labelEn: 'Start Date',
        required: true,
        type: 'date',
        aliases: ['วันเริ่มต้น', 'เริ่มโครงการ', 'start_date'],
      },
      {
        key: 'endDate',
        labelTh: 'วันสิ้นสุดโครงการ',
        labelEn: 'End Date',
        required: true,
        type: 'date',
        aliases: ['วันสิ้นสุด', 'สิ้นสุดโครงการ', 'end_date'],
      },
      {
        key: 'budget',
        labelTh: 'งบประมาณจัดสรร (บาท)',
        labelEn: 'Budget (THB)',
        required: true,
        type: 'number',
        aliases: ['งบประมาณ', 'งบประมาณจัดสรร', 'งบ', 'budget'],
      },
    ],
    sampleRow: {
      code: 'ACT-69-09',
      title: 'โครงการยกระดับการพัฒนาศักยภาพอาจารย์สู่เกณฑ์ Thailand PSF ระดับ 3',
      strategyName: 'ยุทธศาสตร์ที่ 3 การพัฒนาคณาจารย์และสมรรถนะ',
      department: 'กองวิชาการ สำนักงานอธิการบดี',
      responsiblePerson: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
      startDate: '2026-10-01',
      endDate: '2027-09-30',
      budget: 850000,
    },
  },

  credit_wallets: {
    type: 'credit_wallets',
    titleTh: 'บัญชีคลังหน่วยกิต (Credit Bank)',
    titleEn: 'Credit Bank Learner Accounts',
    primaryKey: 'studentId',
    fields: [
      {
        key: 'studentId',
        labelTh: 'รหัสผู้เรียน / รหัสประจำตัว',
        labelEn: 'Learner / Student ID',
        required: true,
        type: 'string',
        aliases: ['รหัสผู้เรียน', 'รหัสนิสิต', 'รหัสประจำตัว', 'student_id', 'learner_id', 'id'],
      },
      {
        key: 'fullName',
        labelTh: 'ชื่อ-นามสกุล ผู้เรียน',
        labelEn: 'Learner Full Name',
        required: true,
        type: 'string',
        aliases: ['ชื่อ-นามสกุล', 'ชื่อผู้เรียน', 'ชื่อ', 'full_name', 'name'],
      },
      {
        key: 'studentType',
        labelTh: 'ประเภทผู้เรียน',
        labelEn: 'Learner Type',
        required: false,
        type: 'string',
        aliases: ['ประเภท', 'ประเภทผู้เรียน', 'student_type'],
      },
      {
        key: 'degreeTargetTh',
        labelTh: 'หลักสูตรเป้าหมายเทียบโอน',
        labelEn: 'Target Degree Program',
        required: true,
        type: 'string',
        aliases: ['หลักสูตรเป้าหมาย', 'หลักสูตร', 'degree_target_th', 'target_program'],
      },
      {
        key: 'totalCreditsAccumulated',
        labelTh: 'หน่วยกิตสะสมปัจจุบัน',
        labelEn: 'Accumulated Credits',
        required: true,
        type: 'number',
        aliases: ['หน่วยกิตสะสม', 'หน่วยกิต', 'total_credits_accumulated', 'credits'],
      },
      {
        key: 'totalCreditsRequired',
        labelTh: 'หน่วยกิตที่ต้องใช้สำเร็จการศึกษา',
        labelEn: 'Total Credits Required',
        required: false,
        type: 'number',
        aliases: ['หน่วยกิตรวม', 'หน่วยกิตเป้าหมาย', 'total_credits_required'],
      },
      {
        key: 'validUntil',
        labelTh: 'วันหมดอายุการสะสม (วัน/เดือน/ปี)',
        labelEn: 'Valid Until Date',
        required: true,
        type: 'date',
        aliases: ['วันหมดอายุ', 'หมดอายุ', 'valid_until', 'expire_date'],
      },
    ],
    sampleRow: {
      studentId: 'LNR-69-105',
      fullName: 'นายวีระเกียรติ มงคลปัญโญ',
      studentType: 'external_learner',
      degreeTargetTh: 'พธ.บ. สาขาวิชาพระพุทธศาสนา',
      totalCreditsAccumulated: 24,
      totalCreditsRequired: 120,
      validUntil: '2031-09-30',
    },
  },

  partners: {
    type: 'partners',
    titleTh: 'เครือข่ายความร่วมมือทางวิชาการ (MOU)',
    titleEn: 'Academic Partnerships & MOUs',
    primaryKey: 'mouNumber',
    fields: [
      {
        key: 'mouNumber',
        labelTh: 'เลขที่ข้อตกลง MOU',
        labelEn: 'MOU Agreement Number',
        required: true,
        type: 'string',
        aliases: ['เลขที่ mou', 'รหัส mou', 'mou_number', 'mou_no', 'id'],
      },
      {
        key: 'university',
        labelTh: 'ชื่อสถาบัน / องค์กรพันธมิตร',
        labelEn: 'Institution Name',
        required: true,
        type: 'string',
        aliases: ['สถาบัน', 'ชื่อสถาบัน', 'มหาวิทยาลัย', 'university', 'partner_name'],
      },
      {
        key: 'country',
        labelTh: 'ประเทศ',
        labelEn: 'Country',
        required: true,
        type: 'string',
        aliases: ['ประเทศ', 'country'],
      },
      {
        key: 'startDate',
        labelTh: 'วันเริ่มต้นความร่วมมือ',
        labelEn: 'Start Date',
        required: true,
        type: 'date',
        aliases: ['วันเริ่มต้น', 'เริ่มลงนาม', 'start_date'],
      },
      {
        key: 'endDate',
        labelTh: 'วันสิ้นสุดความร่วมมือ',
        labelEn: 'End Date',
        required: true,
        type: 'date',
        aliases: ['วันสิ้นสุด', 'หมดอายุ', 'end_date'],
      },
      {
        key: 'scope',
        labelTh: 'ขอบเขตความร่วมมือ',
        labelEn: 'Collaboration Scope',
        required: false,
        type: 'string',
        aliases: ['ขอบเขต', 'ขอบเขตความร่วมมือ', 'scope', 'description'],
      },
    ],
    sampleRow: {
      mouNumber: 'MOU-2569/08',
      university: 'Otani University, Kyoto',
      country: 'ญี่ปุ่น (Japan)',
      startDate: '2026-04-01',
      endDate: '2031-03-31',
      scope: 'ความร่วมมือแลกเปลี่ยนคณาจารย์ นิสิต และเทียบโอนผลการเรียนรู้ Credit Bank',
    },
  },

  meetings: {
    type: 'meetings',
    titleTh: 'กำหนดการประชุมสภาวิชาการ',
    titleEn: 'Academic Council Meetings Schedule',
    primaryKey: 'code',
    fields: [
      {
        key: 'code',
        labelTh: 'รหัสการประชุม (เช่น สว.2569/09)',
        labelEn: 'Meeting Code',
        required: true,
        type: 'string',
        aliases: ['รหัสการประชุม', 'รหัส', 'code', 'meeting_code', 'id'],
      },
      {
        key: 'title',
        labelTh: 'ชื่อการประชุม',
        labelEn: 'Meeting Title',
        required: true,
        type: 'string',
        aliases: ['ชื่อการประชุม', 'การประชุม', 'title', 'meeting_name'],
      },
      {
        key: 'date',
        labelTh: 'วันที่จัดประชุม',
        labelEn: 'Meeting Date',
        required: true,
        type: 'date',
        aliases: ['วันที่', 'วันประชุม', 'date', 'meeting_date'],
      },
      {
        key: 'venue',
        labelTh: 'สถานที่จัดประชุม',
        labelEn: 'Meeting Venue',
        required: true,
        type: 'string',
        aliases: ['สถานที่', 'ห้องประชุม', 'venue', 'location', 'room'],
      },
      {
        key: 'chairperson',
        labelTh: 'ประธานในที่ประชุม',
        labelEn: 'Chairperson',
        required: false,
        type: 'string',
        aliases: ['ประธาน', 'ประธานการประชุม', 'chairperson', 'chair'],
      },
      {
        key: 'secretary',
        labelTh: 'เลขานุการการประชุม',
        labelEn: 'Secretary',
        required: false,
        type: 'string',
        aliases: ['เลขานุการ', 'เลขา', 'secretary'],
      },
    ],
    sampleRow: {
      code: 'สว.2569/10',
      title: 'การประชุมสภาวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ครั้งที่ 10/2569',
      date: '2026-10-22',
      venue: 'ห้องประชุม 401 อาคารสำนักงานอธิการบดี มจร วังน้อย',
      chairperson: 'พระพรหมบัณฑิต, ศ.ดร.',
      secretary: 'พระมหาวรเชษฐ์ สุเมโธ, ผศ.ดร.',
    },
  },
};

export const dataImportService = {
  /**
   * Parse uploaded file into raw tabular rows
   */
  async parseFile(file: File): Promise<{
    format: SupportedImportFormat;
    headers: string[];
    rows: Record<string, any>[];
  }> {
    const extension = file.name.split('.').pop()?.toLowerCase() as SupportedImportFormat;

    if (extension === 'json') {
      const text = await file.text();
      let parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        if (typeof parsed === 'object' && parsed !== null) {
          // Find first array property
          const arrayProp = Object.values(parsed).find((val) => Array.isArray(val));
          if (arrayProp) {
            parsed = arrayProp;
          } else {
            parsed = [parsed];
          }
        } else {
          throw new Error('โครงสร้างไฟล์ JSON ไม่ถูกต้อง (ต้องเป็น Array ของข้อมูล)');
        }
      }
      const headers: string[] = Array.from(
        new Set(parsed.flatMap((item: any) => Object.keys(item || {})))
      ) as string[];
      return { format: 'json', headers, rows: parsed };
    }

    if (extension === 'csv' || extension === 'xlsx' || extension === 'xls') {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, {
        type: 'array',
        cellDates: true,
        dateNF: 'yyyy-mm-dd',
      });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
        defval: '',
        raw: false,
      });

      if (jsonRows.length === 0) {
        throw new Error('ไฟล์ที่อัปโหลดไม่มีข้อมูล (แถวว่าง)');
      }

      const headers = Object.keys(jsonRows[0] || {});
      return {
        format: extension,
        headers,
        rows: jsonRows,
      };
    }

    throw new Error('ไม่รองรับประเภทไฟล์นี้ รองรับเฉพาะ .xlsx, .xls, .csv, และ .json เท่านั้น');
  },

  /**
   * Auto-guess mapping between uploaded headers and target schema fields
   */
  autoSuggestMapping(
    uploadedHeaders: string[],
    schema: DatasetSchema
  ): Record<string, string> {
    const mapping: Record<string, string> = {};

    schema.fields.forEach((field) => {
      // 1. Exact match on field.key or field.labelTh
      const exact = uploadedHeaders.find(
        (h) =>
          h.trim().toLowerCase() === field.key.toLowerCase() ||
          h.trim().toLowerCase() === field.labelTh.toLowerCase() ||
          h.trim().toLowerCase() === field.labelEn.toLowerCase()
      );

      if (exact) {
        mapping[field.key] = exact;
        return;
      }

      // 2. Synonyms / aliases check
      const matchedAlias = uploadedHeaders.find((h) => {
        const cleanHeader = h.trim().toLowerCase();
        return field.aliases.some((alias) =>
          cleanHeader === alias.toLowerCase() || cleanHeader.includes(alias.toLowerCase())
        );
      });

      if (matchedAlias) {
        mapping[field.key] = matchedAlias;
      }
    });

    return mapping;
  },

  /**
   * Date parser & normalizer
   * Supports:
   * - YYYY-MM-DD
   * - DD/MM/YYYY
   * - DD-MM-YYYY
   * - Buddhist Era year conversion: 25xx -> 20xx
   */
  normalizeDate(input: any): { dateString: string; isValid: boolean; convertedFromBe: boolean } {
    if (!input) return { dateString: '', isValid: false, convertedFromBe: false };
    const str = String(input).trim();

    // Case 1: Standard YYYY-MM-DD
    const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (isoMatch) {
      let year = parseInt(isoMatch[1], 10);
      let converted = false;
      if (year > 2400) {
        year -= 543;
        converted = true;
      }
      const month = String(parseInt(isoMatch[2], 10)).padStart(2, '0');
      const day = String(parseInt(isoMatch[3], 10)).padStart(2, '0');
      const d = new Date(`${year}-${month}-${day}`);
      const isValid = !isNaN(d.getTime()) && parseInt(month, 10) <= 12 && parseInt(day, 10) <= 31;
      return { dateString: `${year}-${month}-${day}`, isValid, convertedFromBe: converted };
    }

    // Case 2: DD/MM/YYYY or DD-MM-YYYY (Thai / UK)
    const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (dmyMatch) {
      const day = String(parseInt(dmyMatch[1], 10)).padStart(2, '0');
      const month = String(parseInt(dmyMatch[2], 10)).padStart(2, '0');
      let year = parseInt(dmyMatch[3], 10);
      let converted = false;
      if (year > 2400) {
        year -= 543;
        converted = true;
      }
      const d = new Date(`${year}-${month}-${day}`);
      const isValid = !isNaN(d.getTime()) && parseInt(month, 10) <= 12 && parseInt(day, 10) <= 31;
      return { dateString: `${year}-${month}-${day}`, isValid, convertedFromBe: converted };
    }

    // Case 3: native JS date parse attempt
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      let year = parsed.getFullYear();
      let converted = false;
      if (year > 2400) {
        year -= 543;
        converted = true;
      }
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const day = String(parsed.getDate()).padStart(2, '0');
      return { dateString: `${year}-${month}-${day}`, isValid: true, convertedFromBe: converted };
    }

    return { dateString: str, isValid: false, convertedFromBe: false };
  },

  /**
   * Run full validation with quality guardrails:
   * 1. Duplicate detection (in DB and within file)
   * 2. Missing columns & Missing required fields
   * 3. Invalid date format & Buddhist era adjustment
   * 4. Numeric value formatting
   */
  validateRows(
    rows: Record<string, any>[],
    schema: DatasetSchema,
    columnMapping: Record<string, string>
  ): ValidationResult {
    const existingDbKeys = this.getExistingPrimaryKeys(schema.type, schema.primaryKey);
    const seenFileKeys = new Set<string>();

    const allErrors: ValidationError[] = [];
    const processedRows: ValidationResult['processedRows'] = [];

    let validCount = 0;
    let errorCount = 0;
    let warningCount = 0;
    let dupCount = 0;

    rows.forEach((row, idx) => {
      const rowIndex = idx + 1; // 1-based index
      const rowErrors: ValidationError[] = [];
      const normalizedRow: Record<string, any> = {};

      // 1. Process mapped fields
      schema.fields.forEach((field) => {
        const sourceHeader = columnMapping[field.key];
        const rawVal = sourceHeader ? row[sourceHeader] : undefined;

        // Check required
        if (field.required && (rawVal === undefined || rawVal === null || String(rawVal).trim() === '')) {
          rowErrors.push({
            rowIndex,
            fieldKey: field.key,
            fieldLabel: field.labelTh,
            errorType: 'missing_required',
            message: `ข้อมูลไม่ครบ: ฟิลด์ '${field.labelTh}' เป็นฟิลด์จำเป็น แต่ไม่มีข้อมูลในแถวนี้`,
            rawVal,
            severity: 'error',
          });
          normalizedRow[field.key] = '';
          return;
        }

        if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') {
          normalizedRow[field.key] = field.type === 'number' ? 0 : '';
          return;
        }

        // Validate by type
        if (field.type === 'date') {
          const { dateString, isValid, convertedFromBe } = this.normalizeDate(rawVal);
          if (!isValid) {
            rowErrors.push({
              rowIndex,
              fieldKey: field.key,
              fieldLabel: field.labelTh,
              errorType: 'invalid_date',
              message: `รูปแบบวันที่ผิด: '${rawVal}' ไม่ถูกต้องตามมาตรฐาน (รองรับ วว/ดด/ปปปป หรือ ปปปป-ดด-วว)`,
              rawVal,
              severity: 'error',
            });
            normalizedRow[field.key] = rawVal;
          } else {
            normalizedRow[field.key] = dateString;
            if (convertedFromBe) {
              rowErrors.push({
                rowIndex,
                fieldKey: field.key,
                fieldLabel: field.labelTh,
                errorType: 'invalid_format',
                message: `ปรับปี พ.ศ. (${rawVal}) เป็น ค.ศ. (${dateString}) อัตโนมัติ`,
                rawVal,
                severity: 'warning',
              });
            }
          }
        } else if (field.type === 'number') {
          const cleaned = String(rawVal).replace(/,/g, '').trim();
          const num = Number(cleaned);
          if (isNaN(num)) {
            rowErrors.push({
              rowIndex,
              fieldKey: field.key,
              fieldLabel: field.labelTh,
              errorType: 'invalid_number',
              message: `รูปแบบตัวเลขไม่ถูกต้อง: '${rawVal}' ไม่ใช่ค่าตัวเลข`,
              rawVal,
              severity: 'error',
            });
            normalizedRow[field.key] = 0;
          } else {
            normalizedRow[field.key] = num;
          }
        } else if (field.type === 'email') {
          const emailStr = String(rawVal).trim();
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(emailStr)) {
            rowErrors.push({
              rowIndex,
              fieldKey: field.key,
              fieldLabel: field.labelTh,
              errorType: 'invalid_format',
              message: `รูปแบบอีเมลไม่ถูกต้อง: '${rawVal}'`,
              rawVal,
              severity: 'warning',
            });
          }
          normalizedRow[field.key] = emailStr;
        } else {
          normalizedRow[field.key] = String(rawVal).trim();
        }
      });

      // 2. Primary Key / Duplicate Check
      const pkVal = String(normalizedRow[schema.primaryKey] || '').trim();
      let isDuplicate = false;

      if (pkVal) {
        // In-file duplicate check
        if (seenFileKeys.has(pkVal.toLowerCase())) {
          isDuplicate = true;
          dupCount++;
          rowErrors.push({
            rowIndex,
            fieldKey: schema.primaryKey,
            fieldLabel: schema.fields.find((f) => f.key === schema.primaryKey)?.labelTh || schema.primaryKey,
            errorType: 'duplicate_in_file',
            message: `ข้อมูลซ้ำซ้อนในไฟล์เดียวกัน: คีย์ '${pkVal}' ปรากฏซ้ำในไฟล์ที่อัปโหลด`,
            rawVal: pkVal,
            severity: 'error',
          });
        } else {
          seenFileKeys.add(pkVal.toLowerCase());
        }

        // Existing in DB check
        if (existingDbKeys.has(pkVal.toLowerCase())) {
          isDuplicate = true;
          dupCount++;
          rowErrors.push({
            rowIndex,
            fieldKey: schema.primaryKey,
            fieldLabel: schema.fields.find((f) => f.key === schema.primaryKey)?.labelTh || schema.primaryKey,
            errorType: 'duplicate_in_db',
            message: `ข้อมูลซ้ำกับฐานข้อมูล: รหัส '${pkVal}' มีอยู่ในระบบแล้ว (จะดำเนินการอัปเดตแทนหรือข้าม)`,
            rawVal: pkVal,
            severity: 'warning',
          });
        }
      }

      // Determine Row Status
      const hasErrors = rowErrors.some((e) => e.severity === 'error');
      const hasWarnings = rowErrors.some((e) => e.severity === 'warning');
      const status: 'valid' | 'warning' | 'error' = hasErrors ? 'error' : hasWarnings ? 'warning' : 'valid';

      if (status === 'error') {
        errorCount++;
      } else if (status === 'warning') {
        warningCount++;
        validCount++; // warnings are still importable
      } else {
        validCount++;
      }

      allErrors.push(...rowErrors);
      processedRows.push({
        rowIndex,
        raw: row,
        normalized: normalizedRow,
        status,
        errors: rowErrors,
        isDuplicate,
      });
    });

    return {
      totalRows: rows.length,
      validRowsCount: validCount,
      errorRowsCount: errorCount,
      warningRowsCount: warningCount,
      duplicateCount: dupCount,
      errors: allErrors,
      processedRows,
    };
  },

  /**
   * Helper to retrieve existing primary keys from centralDb
   */
  getExistingPrimaryKeys(type: TargetDatasetType, pkField: string): Set<string> {
    const keys = new Set<string>();
    const state = centralDb.getState();

    let items: any[] = [];
    switch (type) {
      case 'faculty':
        items = state.facultyMembers || [];
        break;
      case 'programs':
        items = state.programs || [];
        break;
      case 'resolutions':
        items = state.resolutions || [];
        break;
      case 'kpis':
        items = state.kpis || [];
        break;
      case 'action_plans':
        items = state.actionPlans || [];
        break;
      case 'credit_wallets':
        items = state.creditWallets || [];
        break;
      case 'partners':
        items = state.partners || [];
        break;
      case 'meetings':
        items = state.meetings || [];
        break;
    }

    items.forEach((item) => {
      const val = item[pkField];
      if (val) keys.add(String(val).trim().toLowerCase());
    });

    return keys;
  },

  /**
   * Commit and insert valid rows into centralDatabase
   */
  commitImport(
    datasetType: TargetDatasetType,
    rowsToImport: Record<string, any>[],
    duplicateAction: 'skip' | 'overwrite',
    operatorName: string,
    fileName: string,
    fileSize: number,
    format: SupportedImportFormat
  ): ImportHistoryRecord {
    const schema = DATASET_SCHEMAS[datasetType];
    const pk = schema.primaryKey;
    const importedIds: string[] = [];
    let successCount = 0;
    let skippedCount = 0;

    // Use transaction to commit changes
    centralDb.runTransaction(
      `นำเข้าข้อมูลภายนอก (${format.toUpperCase()}) จำนวน ${rowsToImport.length} แถว สู่ ${schema.titleTh}`,
      (tx) => {
        const state = tx.state;
        let collection: any[] = [];
        switch (datasetType) {
          case 'faculty':
            collection = state.facultyMembers;
            break;
          case 'programs':
            collection = state.programs;
            break;
          case 'resolutions':
            collection = state.resolutions;
            break;
          case 'kpis':
            collection = state.kpis;
            break;
          case 'action_plans':
            collection = state.actionPlans;
            break;
          case 'credit_wallets':
            collection = state.creditWallets;
            break;
          case 'partners':
            collection = state.partners;
            break;
          case 'meetings':
            collection = state.meetings;
            break;
        }

        rowsToImport.forEach((row) => {
          const rowPk = String(row[pk]).trim();
          const existingIdx = collection.findIndex((item) => String(item[pk]).trim().toLowerCase() === rowPk.toLowerCase());

          if (existingIdx !== -1) {
            if (duplicateAction === 'overwrite') {
              collection[existingIdx] = { ...collection[existingIdx], ...row, updatedAt: new Date().toISOString() };
              importedIds.push(rowPk);
              successCount++;
            } else {
              skippedCount++;
            }
          } else {
            collection.push({ ...row, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
            importedIds.push(rowPk);
            successCount++;
          }
        });
      }
    );

    // Record in Import History
    const historyRecord: ImportHistoryRecord = {
      id: `IMP-${Date.now()}`,
      importedAt: new Date().toISOString(),
      importedBy: operatorName,
      fileName,
      fileSize,
      format,
      datasetType,
      datasetName: schema.titleTh,
      totalRows: rowsToImport.length,
      successCount,
      errorCount: 0,
      skippedCount,
      status: skippedCount > 0 && successCount === 0 ? 'partial' : 'completed',
      importedItemIds: importedIds,
    };

    this.saveHistoryRecord(historyRecord);

    // Also write audit log
    auditLogService.log({
      userId: operatorName || 'usr-staff',
      userName: operatorName || 'เจ้าหน้าที่ กองวิชาการ',
      userRole: 'เจ้าหน้าที่',
      action: 'CREATE',
      module: 'Data Management',
      recordId: historyRecord.id,
      recordTitle: `นำเข้าข้อมูล ${schema.titleTh} จากไฟล์ ${fileName}`,
      details: `นำเข้าข้อมูลสำเร็จ ${successCount} รายการ, ข้าม ${skippedCount} รายการ (${format.toUpperCase()})`,
      ipAddress: '10.20.4.15',
    });

    return historyRecord;
  },

  /**
   * Get all Import History records
   */
  getHistory(): ImportHistoryRecord[] {
    try {
      const stored = localStorage.getItem(IMPORT_HISTORY_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    // Default Seed History for realistic evaluation
    const initialHistory: ImportHistoryRecord[] = [
      {
        id: 'IMP-20260918-01',
        importedAt: '2026-09-18 10:15:30',
        importedBy: 'นายธีรศักดิ์ รัตนกุล (เจ้าหน้าที่)',
        fileName: 'mcu_faculty_psf_batch1.xlsx',
        fileSize: 45280,
        format: 'xlsx',
        datasetType: 'faculty',
        datasetName: 'ข้อมูลคณาจารย์และบุคลากรวิชาการ',
        totalRows: 24,
        successCount: 24,
        errorCount: 0,
        skippedCount: 0,
        status: 'completed',
        importedItemIds: ['FAC-001', 'FAC-002', 'FAC-003'],
      },
      {
        id: 'IMP-20260916-02',
        importedAt: '2026-09-16 14:22:10',
        importedBy: 'นางวราภรณ์ จิตต์อารี (นักวิชาการศึกษา)',
        fileName: 'academic_council_resolutions_round8.csv',
        fileSize: 18450,
        format: 'csv',
        datasetType: 'resolutions',
        datasetName: 'ทะเบียนมติสภาวิชาการ',
        totalRows: 12,
        successCount: 12,
        errorCount: 0,
        skippedCount: 0,
        status: 'completed',
        importedItemIds: ['RES-2569-08-01', 'RES-2569-08-02'],
      },
      {
        id: 'IMP-20260912-03',
        importedAt: '2026-09-12 09:30:00',
        importedBy: 'นายอดิศร มงคลสุข (Super Admin)',
        fileName: 'national_credit_bank_learners_sync.json',
        fileSize: 84200,
        format: 'json',
        datasetType: 'credit_wallets',
        datasetName: 'บัญชีคลังหน่วยกิต (Credit Bank)',
        totalRows: 50,
        successCount: 48,
        errorCount: 2,
        skippedCount: 2,
        status: 'partial',
        importedItemIds: ['LNR-69-001', 'LNR-69-002'],
        errorsSummary: ['รหัส LNR-69-049 ข้อมูลวันหมดอายุผิดรูปแบบ', 'รหัส LNR-69-050 รหัสผู้เรียนซ้ำ'],
      },
    ];

    localStorage.setItem(IMPORT_HISTORY_STORAGE_KEY, JSON.stringify(initialHistory));
    return initialHistory;
  },

  /**
   * Save new history record
   */
  saveHistoryRecord(record: ImportHistoryRecord): void {
    const history = this.getHistory();
    const updated = [record, ...history];
    localStorage.setItem(IMPORT_HISTORY_STORAGE_KEY, JSON.stringify(updated));
  },

  /**
   * Rollback / Revert an import batch
   */
  rollbackImport(recordId: string, operatorName: string): boolean {
    const history = this.getHistory();
    const target = history.find((h) => h.id === recordId);
    if (!target) return false;

    const schema = DATASET_SCHEMAS[target.datasetType];
    const pk = schema.primaryKey;
    const targetIds = new Set(target.importedItemIds.map((id) => id.toLowerCase()));

    // Run delete transaction
    centralDb.runTransaction(
      `ทำการยกเลิก (Rollback) ข้อมูลจากการนำเข้า ${target.id} (${target.fileName})`,
      (tx) => {
        const state = tx.state;
        switch (target.datasetType) {
          case 'faculty':
            state.facultyMembers = state.facultyMembers.filter(
              (item) => !targetIds.has(String(item[pk]).toLowerCase())
            );
            break;
          case 'programs':
            state.programs = state.programs.filter(
              (item) => !targetIds.has(String(item[pk]).toLowerCase())
            );
            break;
          case 'resolutions':
            state.resolutions = state.resolutions.filter(
              (item) => !targetIds.has(String(item[pk]).toLowerCase())
            );
            break;
          case 'kpis':
            state.kpis = state.kpis.filter(
              (item) => !targetIds.has(String(item[pk]).toLowerCase())
            );
            break;
          case 'action_plans':
            state.actionPlans = state.actionPlans.filter(
              (item) => !targetIds.has(String(item[pk]).toLowerCase())
            );
            break;
          case 'credit_wallets':
            state.creditWallets = state.creditWallets.filter(
              (item) => !targetIds.has(String(item[pk]).toLowerCase())
            );
            break;
          case 'partners':
            state.partners = state.partners.filter(
              (item) => !targetIds.has(String(item[pk]).toLowerCase())
            );
            break;
          case 'meetings':
            state.meetings = state.meetings.filter(
              (item) => !targetIds.has(String(item[pk]).toLowerCase())
            );
            break;
        }
      }
    );

    // Update status in history
    target.status = 'reverted';
    localStorage.setItem(IMPORT_HISTORY_STORAGE_KEY, JSON.stringify(history));

    auditLogService.log({
      userId: operatorName || 'usr-staff',
      userName: operatorName || 'เจ้าหน้าที่ กองวิชาการ',
      userRole: 'เจ้าหน้าที่',
      action: 'DELETE',
      module: 'Data Management',
      recordId: recordId,
      recordTitle: `Rollback ข้อมูล ${target.datasetName} จากไฟล์ ${target.fileName}`,
      details: `ทำการยกเลิกข้อมูลที่นำเข้า ${target.importedItemIds.length} รายการ`,
      ipAddress: '10.20.4.15',
    });

    return true;
  },

  /**
   * Generate & download sample template file (Excel / CSV / JSON)
   */
  downloadSampleTemplate(datasetType: TargetDatasetType, format: 'xlsx' | 'csv' | 'json'): void {
    const schema = DATASET_SCHEMAS[datasetType];
    const headers = schema.fields.map((f) => f.labelTh);
    const sampleRowObj: Record<string, any> = {};

    schema.fields.forEach((f) => {
      sampleRowObj[f.labelTh] = schema.sampleRow[f.key] ?? '';
    });

    const filename = `MCU_Template_${datasetType}_${format.toUpperCase()}.${format}`;

    if (format === 'json') {
      const blob = new Blob([JSON.stringify([sampleRowObj], null, 2)], {
        type: 'application/json;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const ws = XLSX.utils.json_to_sheet([sampleRowObj], { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    if (format === 'csv') {
      const csvOutput = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob(['\uFEFF' + csvOutput], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      XLSX.writeFile(wb, filename);
    }
  },
};
