/**
 * Document Classification Constants and Real Data Store
 * For "กองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
 */

import type {
  DocumentClassificationMeta,
  DocumentClassificationType,
  CentralManagedDocument,
} from '../types/documentManagement.ts';

export const DOCUMENT_CLASSIFICATIONS: DocumentClassificationMeta[] = [
  {
    key: 'official_letter',
    labelTh: 'หนังสือราชการ',
    labelEn: 'Official Letter',
    category: 'หนังสือและคำสั่ง',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    key: 'order',
    labelTh: 'คำสั่ง',
    labelEn: 'University Order',
    category: 'หนังสือและคำสั่ง',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    key: 'announcement',
    labelTh: 'ประกาศ',
    labelEn: 'Announcement',
    category: 'หนังสือและคำสั่ง',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  {
    key: 'meeting_minutes',
    labelTh: 'รายงานการประชุม',
    labelEn: 'Meeting Minutes',
    category: 'การประชุมและมติ',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    key: 'meeting_agenda',
    labelTh: 'วาระการประชุม',
    labelEn: 'Meeting Agenda',
    category: 'การประชุมและมติ',
    badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  {
    key: 'resolution_register',
    labelTh: 'ทะเบียนมติ',
    labelEn: 'Resolution Register',
    category: 'การประชุมและมติ',
    badgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
  },
  {
    key: 'mou',
    labelTh: 'MOU / ข้อตกลงความร่วมมือ',
    labelEn: 'MOU Agreement',
    category: 'หลักสูตรและวิชาการ',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    key: 'curriculum',
    labelTh: 'Curriculum (หลักสูตร/มคอ.)',
    labelEn: 'Curriculum Program',
    category: 'หลักสูตรและวิชาการ',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  {
    key: 'curriculum_crosswalk',
    labelTh: 'Curriculum Crosswalk (ตารางเทียบโอน)',
    labelEn: 'Curriculum Crosswalk',
    category: 'หลักสูตรและวิชาการ',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  {
    key: 'kpi_doc',
    labelTh: 'KPI documents (รายงานตัวชี้วัด)',
    labelEn: 'KPI Documents',
    category: 'ยุทธศาสตร์และงบประมาณ',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    key: 'budget_doc',
    labelTh: 'Budget documents (เอกสารงบประมาณ)',
    labelEn: 'Budget Documents',
    category: 'ยุทธศาสตร์และงบประมาณ',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  {
    key: 'risk_doc',
    labelTh: 'Risk documents (ทะเบียนความเสี่ยง)',
    labelEn: 'Risk Documents',
    category: 'ยุทธศาสตร์และงบประมาณ',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    key: 'short_course_doc',
    labelTh: 'Short Course documents',
    labelEn: 'Short Course Documents',
    category: 'หลักสูตรและวิชาการ',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    key: 'non_degree_doc',
    labelTh: 'Non-degree documents',
    labelEn: 'Non-degree Documents',
    category: 'หลักสูตรและวิชาการ',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  {
    key: 'pre_degree_doc',
    labelTh: 'Pre-degree documents',
    labelEn: 'Pre-degree Documents',
    category: 'หลักสูตรและวิชาการ',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  {
    key: 'credit_bank_doc',
    labelTh: 'Credit Bank documents',
    labelEn: 'Credit Bank Documents',
    category: 'หลักสูตรและวิชาการ',
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  {
    key: 'faculty_doc',
    labelTh: 'Faculty documents (สมรรถนะอาจารย์)',
    labelEn: 'Faculty Documents',
    category: 'บุคลากรและกำกับ',
    badgeColor: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  },
  {
    key: 'regulatory_doc',
    labelTh: 'Regulatory documents (ข้อบังคับ/เกณฑ์)',
    labelEn: 'Regulatory Documents',
    category: 'บุคลากรและกำกับ',
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
  },
  {
    key: 'general_doc',
    labelTh: 'General documents (เอกสารทั่วไป)',
    labelEn: 'General Documents',
    category: 'หนังสือและคำสั่ง',
    badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
  },
];

// -------------------------------------------------------------
// REAL DATABASE BACKED STORES - INITIALIZED EMPTY
// -------------------------------------------------------------
export const INITIAL_CENTRAL_DOCUMENTS: CentralManagedDocument[] = [];
