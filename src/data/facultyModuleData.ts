/**
 * Faculty Competency & Development Data Model
 * กองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (Clean Slate for Production)
 */

export interface FacultyProfile {
  id: string;
  name: string;
  monkTitle?: string;
  academicPosition: string; // ศ., รศ., ผศ., อาจารย์
  faculty: string;
  department: string;
  email: string;
  phone: string;
  expertise: string[];
  psfLevel: 1 | 2 | 3 | 4;
  psfCertifiedDate?: string;
  mentorName?: string;
  avatarUrl?: string;
  idpStatus: 'draft' | 'submitted' | 'mentor_approved' | 'in_progress' | 'completed';
  totalPublications: number;
  activeResearchCount: number;
}

export interface CompetencyScore {
  domain: 'teaching' | 'research' | 'academic_service' | 'professional_dev';
  domainNameTh: string;
  currentLevel: number; // 1 to 5
  targetLevel: number; // 1 to 5
  description: string;
  keyStrengths: string[];
  areasForGrowth: string[];
}

export interface ThailandPsfDimension {
  id: string;
  domain: 'knowledge' | 'competencies' | 'values';
  domainNameTh: string;
  dimensionNo: number;
  dimensionNameTh: string;
  dimensionNameEn: string;
  description: string;
  facultyScore: number; // 1-4 scale
  requiredLevelForPsf: number;
  status: 'passed' | 'needs_improvement' | 'in_progress';
}

export interface IdpWorkflowStep {
  stepIndex: number;
  stepKey: 'self_assessment' | 'gap_analysis' | 'goal_setting' | 'idp_draft' | 'mentor_review' | 'development' | 'evidence_collection' | 'evaluation';
  titleTh: string;
  status: 'completed' | 'in_progress' | 'pending';
  completedDate?: string;
  assignee: string;
  notes?: string;
}

export interface IdpGoalItem {
  id: string;
  competencyDomain: 'teaching' | 'research' | 'academic_service' | 'professional_dev';
  goalTitle: string;
  actionPlan: string;
  targetDate: string;
  budgetRequested: number;
  status: 'planning' | 'in_action' | 'verified';
  evidenceAttached?: string;
  mentorFeedback?: string;
}

export interface PortfolioItem {
  id: string;
  facultyId: string;
  title: string;
  category: 'academic_work' | 'research' | 'teaching' | 'service' | 'certificate' | 'training' | 'evidence';
  categoryLabelTh: string;
  year: string;
  description: string;
  fileUrl: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'jpg' | 'png';
  fileSize: string;
  uploadDate: string;
  verifiedByMentor: boolean;
  relatedPsfDimension?: string;
}

export interface MentorReviewRecord {
  id: string;
  facultyId: string;
  facultyName: string;
  mentorName: string;
  mentorPosition: string;
  reviewDate: string;
  overallRating: 'excellent' | 'good' | 'needs_revision';
  comments: string;
  recommendedActions: string[];
  status: 'approved' | 'action_required';
}

// -------------------------------------------------------------
// PRODUCTION-READY DATA STORES (CLEAN SLATE - READY FOR REAL DATA)
// -------------------------------------------------------------

export const INITIAL_FACULTY_LIST: FacultyProfile[] = [];
export const INITIAL_COMPETENCIES: CompetencyScore[] = [];
export const INITIAL_IDP_GOALS: IdpGoalItem[] = [];
export const INITIAL_PORTFOLIO_ITEMS: PortfolioItem[] = [];
export const INITIAL_MENTOR_REVIEWS: MentorReviewRecord[] = [];

// Standard Thailand PSF Framework Rubric Constants
export const INITIAL_PSF_DIMENSIONS: ThailandPsfDimension[] = [
  {
    id: 'psf-d1',
    domain: 'knowledge',
    domainNameTh: 'องค์ประกอบที่ 1: ความรู้ (Knowledge)',
    dimensionNo: 1,
    dimensionNameTh: 'มิติที่ 1 ความรู้ในศาสตร์สาขาวิชาที่สอน',
    dimensionNameEn: 'Knowledge of Subject Matter',
    description: 'มีความรอบรู้ลึกซึ้งในเนื้อหาหลักสูตร หลักพุทธธรรม และทันต่อความก้าวหน้าทางวิชาการร่วมสมัย',
    facultyScore: 0,
    requiredLevelForPsf: 3,
    status: 'in_progress',
  },
  {
    id: 'psf-d2',
    domain: 'knowledge',
    domainNameTh: 'องค์ประกอบที่ 1: ความรู้ (Knowledge)',
    dimensionNo: 2,
    dimensionNameTh: 'มิติที่ 2 ความรู้ด้านวิชาชีพครูและการสอนในระดับอุดมศึกษา',
    dimensionNameEn: 'Knowledge of Higher Education Pedagogy',
    description: 'รอบรู้ทฤษฎีการเรียนรู้ จิตวิทยาการศึกษา และวิธีการสอนที่เหมาะสมกับผู้เรียนหลากหลาย',
    facultyScore: 0,
    requiredLevelForPsf: 3,
    status: 'in_progress',
  },
  {
    id: 'psf-d3',
    domain: 'competencies',
    domainNameTh: 'องค์ประกอบที่ 2: สมรรถนะ (Competencies)',
    dimensionNo: 3,
    dimensionNameTh: 'มิติที่ 3 การออกแบบและวางแผนการจัดการเรียนรู้',
    dimensionNameEn: 'Designing and Planning Learning Activities',
    description: 'สามารถจัดทำประมวลรายวิชา (มคอ.3) ที่สอดคล้องกับ PLOs และ CLOs เน้นผู้เรียนเป็นสำคัญ',
    facultyScore: 0,
    requiredLevelForPsf: 3,
    status: 'in_progress',
  },
  {
    id: 'psf-d4',
    domain: 'competencies',
    domainNameTh: 'องค์ประกอบที่ 2: สมรรถนะ (Competencies)',
    dimensionNo: 4,
    dimensionNameTh: 'มิติที่ 4 การจัดบรรยากาศการเรียนรู้และการสื่อสารอย่างมีประสิทธิภาพ',
    dimensionNameEn: 'Facilitating Learning and Communication',
    description: 'สร้างบรรยากาศแห่งการแลกเปลี่ยนเรียนรู้ เมตตาธรรม และการใช้เทคโนโลยีดิจิทัลเกื้อหนุน',
    facultyScore: 0,
    requiredLevelForPsf: 3,
    status: 'in_progress',
  },
  {
    id: 'psf-d5',
    domain: 'competencies',
    domainNameTh: 'องค์ประกอบที่ 2: สมรรถนะ (Competencies)',
    dimensionNo: 5,
    dimensionNameTh: 'มิติที่ 5 การวัดและประเมินผลการเรียนรู้ของผู้เรียน',
    dimensionNameEn: 'Assessment and Feedback',
    description: 'ประเมินผลตามสภาพจริง ใช้รูบริก และให้ข้อมูลป้อนกลับเชิงสร้างสรรค์เพื่อพัฒนาผู้เรียน',
    facultyScore: 0,
    requiredLevelForPsf: 3,
    status: 'in_progress',
  },
  {
    id: 'psf-d6',
    domain: 'competencies',
    domainNameTh: 'องค์ประกอบที่ 2: สมรรถนะ (Competencies)',
    dimensionNo: 6,
    dimensionNameTh: 'มิติที่ 6 การวิจัยเพื่อพัฒนาการจัดการเรียนรู้ (SoTL)',
    dimensionNameEn: 'Scholarship of Teaching and Learning',
    description: 'ทำวิจัยในชั้นเรียน พัฒนานวัตกรรมการสอน และเผยแพร่เพื่อพัฒนาคุณภาพการจัดการศึกษา',
    facultyScore: 0,
    requiredLevelForPsf: 3,
    status: 'in_progress',
  },
  {
    id: 'psf-d7',
    domain: 'values',
    domainNameTh: 'องค์ประกอบที่ 3: ค่านิยมและจริยธรรม (Values)',
    dimensionNo: 7,
    dimensionNameTh: 'มิติที่ 7 การเคารพและเข้าใจในความหลากหลายของผู้เรียน',
    dimensionNameEn: 'Respect and Inclusivity',
    description: 'ปฏิบัติต่อบรรพชิตและคฤหัสถ์ด้วยความเสมอภาค เคารพวัฒนธรรมและความแตกต่างทางความคิด',
    facultyScore: 0,
    requiredLevelForPsf: 3,
    status: 'in_progress',
  },
  {
    id: 'psf-d8',
    domain: 'values',
    domainNameTh: 'องค์ประกอบที่ 3: ค่านิยมและจริยธรรม (Values)',
    dimensionNo: 8,
    dimensionNameTh: 'มิติที่ 8 การพัฒนาตนเองอย่างต่อเนื่องและยึดมั่นในจรรยาบรรณวิชาชีพ',
    dimensionNameEn: 'Continuous Professional Development and Ethics',
    description: 'เป็นแบบอย่างที่ดีในการประพฤติตนตามหลักพระธรรมวินัยและจรรยาบรรณทางวิชาการ',
    facultyScore: 0,
    requiredLevelForPsf: 3,
    status: 'in_progress',
  },
];

export const INITIAL_IDP_STEPS: IdpWorkflowStep[] = [
  { stepIndex: 1, stepKey: 'self_assessment', titleTh: '1. ประเมินตนเอง (Self Assessment)', status: 'pending', assignee: 'อาจารย์ผู้ขอรับการประเมิน' },
  { stepIndex: 2, stepKey: 'gap_analysis', titleTh: '2. วิเคราะห์ช่องว่างสมรรถนะ (Gap Analysis)', status: 'pending', assignee: 'อาจารย์ร่วมกับระบบอัจฉริยะ' },
  { stepIndex: 3, stepKey: 'goal_setting', titleTh: '3. กำหนดเป้าหมายการพัฒนา (Development Goal)', status: 'pending', assignee: 'อาจารย์ผู้ขอรับการประเมิน' },
  { stepIndex: 4, stepKey: 'idp_draft', titleTh: '4. จัดทำแผนพัฒนาตนเอง (IDP Drafting)', status: 'pending', assignee: 'อาจารย์ผู้ขอรับการประเมิน' },
  { stepIndex: 5, stepKey: 'mentor_review', titleTh: '5. อาจารย์พี่เลี้ยงตรวจสอบ (Mentor Review)', status: 'pending', assignee: 'อาจารย์พี่เลี้ยง (Mentor)' },
  { stepIndex: 6, stepKey: 'development', titleTh: '6. ดำเนินการตามแผนพัฒนา (Development in Action)', status: 'pending', assignee: 'อาจารย์ผู้ขอรับการประเมิน' },
  { stepIndex: 7, stepKey: 'evidence_collection', titleTh: '7. รวบรวมหลักฐานและแฟ้มสะสมงาน (Evidence Collection)', status: 'pending', assignee: 'อาจารย์ผู้ขอรับการประเมิน' },
  { stepIndex: 8, stepKey: 'evaluation', titleTh: '8. ประเมินผลสัมฤทธิ์และรับรอง (Evaluation & Certification)', status: 'pending', assignee: 'คณะกรรมการพัฒนาคณาจารย์ มจร' },
];
