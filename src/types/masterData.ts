/**
 * Central Master Data Types
 * สำหรับ "กองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
 * 
 * ครอบคลุม 12 กลุ่มข้อมูลกลางที่ทุกโมดูลใช้ร่วมกัน:
 * 1. บุคลากร (Personnel)
 * 2. สำนัก/คณะ (Faculties & Institutes)
 * 3. วิทยาเขต (Campuses & Colleges)
 * 4. หลักสูตร (Curricula & Academic Programs)
 * 5. หน่วยงาน (Departments & Divisions)
 * 6. ตำแหน่ง (Academic, Administrative & Support Positions)
 * 7. ประเภทเอกสาร (Document Types)
 * 8. ประเภทโครงการ (Project Types)
 * 9. ปีการศึกษา (Academic Years)
 * 10. ปีงบประมาณ (Fiscal Years)
 * 11. สถานะ (Master Status Enums)
 * 12. คู่ความร่วมมือ (Partner Organizations & MOUs)
 */

export type MasterDataDomainKey =
  | 'personnel'
  | 'faculties'
  | 'campuses'
  | 'programs'
  | 'departments'
  | 'positions'
  | 'document_types'
  | 'project_types'
  | 'academic_years'
  | 'fiscal_years'
  | 'statuses'
  | 'partners';

export interface MasterDomainMeta {
  key: MasterDataDomainKey;
  labelTh: string;
  labelEn: string;
  descriptionTh: string;
  iconName: string;
  badgeColor: string;
  itemCount: number;
}

// 1. บุคลากร (Personnel / Faculty & Staff)
export interface MasterPersonnel {
  id: string; // e.g. PER-001
  code: string; // MCU-P-2560-014
  titlePrefix: string; // พระพรหมบัณฑิต, พระมหาวรเชษฐ์, ผศ.ดร., รศ.ดร., นาย, นางสาว
  fullName: string;
  monkTitle?: string; // ฉายา/สมณศักดิ์
  academicPositionId: string;
  academicPositionName: string; // ศ., รศ., ผศ., อาจารย์
  adminPositionId?: string;
  adminPositionName?: string; // อธิการบดี, ผู้อำนวยการกอง, คณบดี
  facultyId: string;
  facultyName: string;
  departmentId: string;
  departmentName: string;
  campusId: string;
  campusName: string;
  email: string;
  phone: string;
  highestDegree: string; // พธ.ด., Ph.D., ป.ธ.๙
  psfLevel?: 1 | 2 | 3 | 4;
  status: 'active' | 'inactive' | 'on_leave';
  linkedModules: string[]; // ['Meeting', 'Strategy', 'Academic', 'Faculty', 'CreditBank', 'Regulatory']
  createdAt: string;
  updatedAt: string;
}

// 2. สำนัก/คณะ (Faculties & Institutes)
export interface MasterFaculty {
  id: string; // e.g. FAC-BUD
  code: string; // BUD
  nameTh: string;
  nameEn: string;
  shortName: string;
  campusId: string;
  campusName: string;
  deanName: string;
  deanEmail?: string;
  deanPhone?: string;
  officeLocation: string;
  totalDepartments: number;
  totalActivePrograms: number;
  status: 'active' | 'inactive';
  order: number;
  establishedYear?: string;
}

// 3. วิทยาเขต (Campuses & Regional Colleges)
export interface MasterCampus {
  id: string; // e.g. CMP-CENTRAL
  code: string; // CMP-01
  nameTh: string;
  nameEn: string;
  shortNameTh: string;
  region: 'ภาคกลาง' | 'ภาคเหนือ' | 'ภาคตะวันออกเฉียงเหนือ' | 'ภาคใต้';
  province: string;
  rectorOrViceRector: string; // รองอธิการบดีวิทยาเขต / ผู้อำนวยการวิทยาลัย
  phone: string;
  email: string;
  address: string;
  isMainCampus: boolean;
  activeStudentsEstimate: number;
  status: 'active' | 'inactive';
}

// 4. หลักสูตร (Curricula / Academic Programs Master)
export interface MasterProgram {
  id: string; // e.g. PRG-BUD-01
  code: string; // 25550011100014
  titleTh: string;
  titleEn: string;
  degreeTitleTh: string; // พุทธศาสตรบัณฑิต
  degreeAbbrTh: string; // พธ.บ.
  level: 'ปริญญาตรี' | 'ปริญญาโท' | 'ปริญญาเอก' | 'ประกาศนียบัตร';
  facultyId: string;
  facultyName: string;
  campusIds: string[];
  campusesOffered: string[];
  revisionYear: string; // 2565, 2568, 2570
  totalCredits: number;
  checoStatus: 'approved' | 'in_review' | 'revision';
  checoRefCode?: string;
  academicCouncilApprovedDate?: string;
  status: 'active' | 'under_revision' | 'inactive';
}

// 5. หน่วยงาน (Departments / Divisions / Offices)
export interface MasterDepartment {
  id: string; // e.g. DEPT-ACAD-01
  code: string; // ACAD-AFFAIRS
  nameTh: string;
  nameEn: string;
  parentOrgType: 'กองวิชาการ' | 'คณะ' | 'สำนัก' | 'สถาบัน' | 'วิทยาลัย' | 'สำนักงานอธิการบดี';
  facultyId?: string | null;
  facultyName?: string;
  campusId: string;
  campusName: string;
  headName: string;
  email: string;
  phone: string;
  location: string;
  status: 'active' | 'inactive';
}

// 6. ตำแหน่ง (Academic, Administrative & Support Positions)
export interface MasterPosition {
  id: string; // e.g. POS-ACAD-01
  code: string; // POS-PROF
  titleTh: string;
  titleEn: string;
  category: 'academic' | 'administrative' | 'support';
  categoryLabel: 'ตำแหน่งวิชาการ' | 'ตำแหน่งบริหาร' | 'ตำแหน่งสายสนับสนุน';
  levelRank: number; // 1 to 5
  standardQualification: string;
  status: 'active' | 'inactive';
  description?: string;
}

// 7. ประเภทเอกสาร (Document Types)
export interface MasterDocumentType {
  id: string; // e.g. DOCTYPE-01
  code: string; // DOC-MEMO
  nameTh: string;
  nameEn: string;
  category: 'หนังสือและคำสั่ง' | 'การประชุมและมติ' | 'ระเบียบและข้อบังคับ' | 'หลักสูตรและวิชาการ' | 'แบบฟอร์มคำขอ';
  retentionPeriodYears: number | 'ถาวร';
  confidentialityDefault: 'ปกติ' | 'ปกปิด' | 'ลับ' | 'ลับมาก';
  primaryModule: string; // 'meetings' | 'documents' | 'regulatory' | 'forms' | 'strategy'
  badgeColor: string;
  status: 'active' | 'inactive';
}

// 8. ประเภทโครงการ (Project Types)
export interface MasterProjectType {
  id: string; // e.g. PRJTYPE-01
  code: string; // PRJ-STRAT
  nameTh: string;
  nameEn: string;
  defaultStrategicPillar: string; // เช่น ยุทธศาสตร์ที่ 1, ยุทธศาสตร์ที่ 2
  defaultStrategicPillarId: string; // STRAT-01
  fundingSource: 'งบประมาณแผ่นดิน' | 'งบประมาณเงินรายได้' | 'กองทุนวิจัย' | 'แหล่งทุนภายนอก/ร่วมทุน';
  kpiAlignmentGuide: string;
  status: 'active' | 'inactive';
}

// 9. ปีการศึกษา (Academic Years)
export interface MasterAcademicYear {
  id: string; // e.g. AY-2569
  year: string; // 2567, 2568, 2569, 2570, 2571
  yearEn: string; // 2024, 2025, 2026, 2027, 2028
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isCurrent: boolean;
  currentSemester: 'ภาคการศึกษาที่ 1' | 'ภาคการศึกษาที่ 2' | 'ภาคฤดูร้อน';
  status: 'active' | 'closed' | 'planned';
  description: string;
}

// 10. ปีงบประมาณ (Fiscal Years)
export interface MasterFiscalYear {
  id: string; // e.g. FY-2569
  year: string; // 2567, 2568, 2569, 2570, 2571
  startDate: string; // 2025-10-01
  endDate: string; // 2026-09-30
  isCurrent: boolean;
  currentQuarter: 'Q1 (ต.ค.-ธ.ค.)' | 'Q2 (ม.ค.-มี.ค.)' | 'Q3 (เม.ย.-มิ.ย.)' | 'Q4 (ก.ค.-ก.ย.)';
  totalBudgetMillion: number;
  status: 'active' | 'closed' | 'planning';
  notes?: string;
}

// 11. สถานะ (Master Status Enums / System Workflow Statuses)
export interface MasterStatusItem {
  id: string; // e.g. STS-DRAFT
  code: string; // 'draft' | 'submitted' | 'in_progress' | 'approved' | 'revision_required' | 'rejected' | 'promulgated' | 'completed' | 'cancelled'
  labelTh: string;
  labelEn: string;
  domain: 'all' | 'meetings' | 'curriculum' | 'regulatory' | 'strategy' | 'faculty' | 'forms';
  domainLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
  isTerminal: boolean; // เป็นสถานะสิ้นสุดของกระบวนการหรือไม่
  stepOrder: number;
}

// 12. คู่ความร่วมมือ (Partner Organizations & MOUs)
export interface MasterPartner {
  id: string; // e.g. PTN-01
  code: string; // MOU-2026-01
  nameTh: string;
  nameEn: string;
  type: 'international_university' | 'domestic_university' | 'buddhist_org' | 'government_agency';
  typeLabel: 'สถาบันการศึกษาต่างประเทศ' | 'มหาวิทยาลัยในประเทศ' | 'องค์กรพุทธศาสนาสากล' | 'หน่วยงานภาครัฐ';
  country: string;
  countryCode: string;
  city: string;
  mouNumber: string;
  startDate: string;
  endDate: string;
  cooperationScopes: string[];
  activeProgramsCount: number;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  status: 'active' | 'expiring' | 'renewed' | 'inactive';
}

// Master Cross-Module Reference Result
export interface MasterUsageReference {
  moduleKey: string;
  moduleNameTh: string;
  count: number;
  sampleItems: { id: string; title: string; fieldName: string }[];
}
