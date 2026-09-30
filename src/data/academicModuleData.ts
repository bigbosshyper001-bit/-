/**
 * Academic Management Data Model & Store
 * University-level Management Platform for Mahachulalongkornrajavidyalaya University (MCU)
 */

export interface PartnerRecord {
  id: string;
  university: string;
  country: string;
  countryCode: string;
  contact: string;
  email: string;
  phone: string;
  mouNumber: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'expiring' | 'inactive';
  collaborationType: ('dual_degree' | 'joint_degree' | 'mou_exchange' | 'credit_transfer')[];
  programs: string[];
  scope: string;
  signedDocument: string;
  activeStudents: number;
}

export interface DegreeProgramRecord {
  id: string;
  type: 'dual_degree' | 'joint_degree';
  titleTh: string;
  titleEn: string;
  partnerUniversity: string;
  partnerCountry: string;
  mcuFaculty: string;
  studyModel: string; // e.g., "2 + 2 ปี", "1 + 1 ปี"
  degreesAwardedTh: string[];
  degreesAwardedEn: string[];
  totalCredits: number;
  mcuCredits: number;
  partnerCredits: number;
  status: 'active' | 'draft' | 'under_review' | 'inactive';
  enrolledStudents: number;
  quotaPerYear: number;
  mouNumber: string;
}

export interface McuCourse {
  id: string;
  courseCode: string;
  titleTh: string;
  titleEn: string;
  credits: string; // "3(3-0-6)"
  creditNum: number;
  faculty: string;
  department: string;
  level: 'undergraduate' | 'master' | 'doctorate';
  clos: string[];
  descriptionTh: string;
}

export interface PartnerCourse {
  id: string;
  partnerId: string;
  university: string;
  courseCode: string;
  titleEn: string;
  credits: string; // "3 ECTS" or "3 Credits"
  creditNum: number;
  syllabus: string;
  learningOutcomes: string[];
}

export type CrosswalkMappingStatus = 'matched' | 'partial' | 'not_matched' | 'pending_review';

export interface CurriculumCrosswalkRecord {
  id: string;
  partnerId: string;
  partnerUniversity: string;
  mcuCourse: McuCourse;
  partnerCourse: PartnerCourse;
  status: CrosswalkMappingStatus;
  similarityScore: number; // 0 - 100%
  equivalenceType: 'direct_credit' | 'elective_credit' | 'supplementary_required' | 'rejected';
  supplementaryNote?: string;
  evaluatedBy: string;
  evaluatedDate: string;
  approvalStatus: 'approved' | 'pending_committee' | 'rejected';
}

export interface ShortCourseRecord {
  id: string;
  code: string;
  titleTh: string;
  titleEn: string;
  category: 'พุทธนวัตกรรม' | 'สันติวิธีและไกล่เกลี่ย' | 'สมาธิและสุขภาพ' | 'ทักษะดิจิทัล' | 'ภาษาบาลี-สันสกฤต' | 'การศึกษาทั่วไป';
  deliveryMode: 'online' | 'onsite' | 'hybrid';
  hours: number;
  creditBankEquiv: number; // e.g., 2 or 3 credits
  fee: number; // THB (0 for free)
  capacity: number;
  enrolled: number;
  targetAudience: string;
  competencyOutcome: string;
  facultyOwner: string;
  workflowStatus: 'draft' | 'department_endorsed' | 'academic_affairs_screened' | 'senate_approved' | 'active_enrollment';
  instructors: string[];
  startDate: string;
  endDate: string;
}

export interface DemandSurveyRecord {
  id: string;
  topic: string;
  category: string;
  interestedCount: number;
  preferredMode: 'online' | 'onsite' | 'hybrid';
  targetGroup: 'พระภิกษุสามเณร' | 'ครู/อาจารย์' | 'บุคลากรภาครัฐ/เอกชน' | 'ประชาชนทั่วไป';
  averageWillingnessToPay: number; // THB
  trendScore: number; // 0 - 100
  urgencyLevel: 'high' | 'medium' | 'normal';
}

export interface PreDegreeCohortRecord {
  id: string;
  cohortCode: string; // e.g. "PRE-69-01"
  name: string;
  partnerSchool: string;
  schoolType: 'โรงเรียนพระปริยัติธรรม แผนกสามัญ' | 'โรงเรียนบาลีสาธิตศึกษา' | 'โรงเรียนมัธยมศึกษาเครือข่าย สพฐ.';
  studentsCount: number;
  avgCreditsAccumulated: number;
  academicYear: string;
  targetFaculty: string;
  status: 'active' | 'graduating' | 'transferred_to_mcu';
}

export interface PreDegreeStudentCourse {
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string;
  semester: string;
  creditBankTransferred: boolean;
}

export interface PreDegreeStudentRecord {
  id: string;
  studentId: string;
  nationalIdMasked: string;
  fullName: string;
  schoolName: string;
  level: string; // "ม.4", "ม.5", "ม.6"
  cohortId: string;
  courses: PreDegreeStudentCourse[];
  totalCredits: number;
  gpa: number;
  pathwayIntended: string; // e.g., "คณะพุทธศาสตร์ สาขาวิชาพระพุทธศาสนา"
  readyToTransfer: boolean;
}

export interface CreditBankWallet {
  walletId: string;
  studentId: string;
  fullName: string;
  studentType: 'student' | 'external_learner' | 'pre_degree' | 'monk';
  facultyAffiliation: string;
  degreeTargetTh: string;
  totalCreditsAccumulated: number;
  totalCreditsRequired: number;
  validUntil: string;
  status: 'active' | 'graduated' | 'suspended';
  lastActivity: string;
}

export interface CreditBankTransaction {
  id: string;
  walletId: string;
  studentName: string;
  date: string;
  sourceType: 'short_course' | 'pre_degree' | 'prior_learning_rpl' | 'external_university';
  sourceTitle: string;
  courseEquivalenceCode: string;
  courseEquivalenceName: string;
  credits: number;
  gradeOrResult: string;
  assessor: string;
  status: 'approved' | 'under_evaluation' | 'supplementary_needed';
  documentEvidence: string;
}

export interface CreditTransferApplication {
  id: string;
  applicationNo: string;
  applicantName: string;
  applicantType: string;
  targetProgram: string;
  requestedCredits: number;
  approvedCredits: number;
  submissionDate: string;
  committeeMeetingNo: string;
  committeeDecisionDate?: string;
  status: 'pending_screening' | 'committee_review' | 'senate_approval' | 'completed' | 'rejected';
  rubricScore: number; // percentage
  documentsCount: number;
  notes: string;
}

export interface ExternalAdapterSyncLog {
  id: string;
  timestamp: string;
  sourceName: string;
  sourceType: 'api' | 'json_payload' | 'csv_file' | 'excel_file';
  recordType: 'partners' | 'curriculum' | 'students' | 'credits';
  recordsProcessed: number;
  successCount: number;
  errorCount: number;
  status: 'success' | 'warning' | 'failed';
  details: string;
}

// ==========================================
// REAL DATABASE BACKED STORES - INITIALIZED EMPTY
// ==========================================

export const INITIAL_PARTNERS: PartnerRecord[] = [];
export const INITIAL_DEGREE_PROGRAMS: DegreeProgramRecord[] = [];
export const INITIAL_CROSSWALK: CurriculumCrosswalkRecord[] = [];
export const INITIAL_SHORT_COURSES: ShortCourseRecord[] = [];
export const INITIAL_DEMAND_SURVEYS: DemandSurveyRecord[] = [];
export const INITIAL_PRE_DEGREE_COHORTS: PreDegreeCohortRecord[] = [];
export const INITIAL_PRE_DEGREE_STUDENTS: PreDegreeStudentRecord[] = [];
export const INITIAL_CREDIT_WALLETS: CreditBankWallet[] = [];
export const INITIAL_TRANSACTIONS: CreditBankTransaction[] = [];
export const INITIAL_TRANSFER_APPLICATIONS: CreditTransferApplication[] = [];
