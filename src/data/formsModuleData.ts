/**
 * Online Form Engine & Form Builder Data Model
 * 
 * Central Form Builder:
 * - Admin capabilities: Create, Edit, Reorder, Required, Validation, Permission, Approval Workflow, Publish, Close
 * - Field Types: Text, Textarea, Number, Date, Dropdown, Radio, Checkbox, File Upload, Signature Placeholder
 */

export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'dropdown'
  | 'radio'
  | 'checkbox'
  | 'file_upload'
  | 'signature_placeholder';

export interface FormFieldValidation {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  regexPattern?: string;
  allowedFileTypes?: string[];
  maxFileSizeMb?: number;
}

export interface FormFieldDefinition {
  id: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  helpText?: string;
  options?: string[]; // For dropdown, radio, checkbox
  validation: FormFieldValidation;
  order: number;
}

export interface ApprovalStep {
  stepNo: number;
  approverRole: string;
  approverUnit: string;
  autoNotifyEmail: boolean;
  requiredSignature: boolean;
}

export interface FormDefinition {
  id: string;
  code: string;
  title: string;
  description: string;
  category: 'academic_affairs' | 'faculty_development' | 'curriculum' | 'student_services';
  categoryLabelTh: string;
  status: 'draft' | 'published' | 'closed';
  allowedRoles: string[]; // Permission: All, Faculty, DepartmentHead, Dean, Admin
  fields: FormFieldDefinition[];
  approvalWorkflow: ApprovalStep[];
  submissionCount: number;
  createdAt: string;
  updatedAt: string;
  publishedDate?: string;
}

export interface FormSubmissionRecord {
  id: string;
  formId: string;
  formTitle: string;
  submissionNo: string;
  submitterName: string;
  submitterRole: string;
  submitterEmail: string;
  submissionDate: string;
  data: Record<string, any>;
  currentStepIndex: number;
  status: 'pending_review' | 'approved' | 'rejected' | 'in_workflow';
  reviewNotes?: string;
}

// -------------------------------------------------------------
// REAL DATABASE BACKED STORES - INITIALIZED WITH MCU FORMS
// -------------------------------------------------------------
export const INITIAL_FORM_DEFINITIONS: FormDefinition[] = [
  {
    id: 'form-cb-01',
    code: 'MCU-CB-01',
    title: 'แบบคำร้องขอเทียบโอนผลการเรียนรู้และสะสมหน่วยกิต (MCU Credit Bank)',
    description: 'สำหรับนิสิตและผู้เรียนสะสมหน่วยกิตล่วงหน้า ที่ต้องการขอเทียบโอนผลการเรียนรู้เข้าสู่หลักสูตรปริญญาตรี',
    category: 'student_services',
    categoryLabelTh: 'บริการการศึกษาและคลังหน่วยกิต',
    status: 'published',
    allowedRoles: ['นิสิต', 'ผู้เรียนตลอดชีวิต', 'เจ้าหน้าที่', 'อาจารย์'],
    submissionCount: 0,
    createdAt: '2026-01-10',
    updatedAt: '2026-08-15',
    publishedDate: '2026-01-15',
    fields: [
      {
        id: 'f-1',
        label: 'ชื่อ-ฉายา / นามสกุล ผู้ยื่นคำร้อง',
        type: 'text',
        placeholder: 'เช่น พระมหาสมบูรณ์ ชุตินฺธโร หรือ นายอานนท์ ภักดี',
        helpText: 'ระบุชื่อตามบัตรประชาชนหรือหนังสือสุทธิ',
        validation: { required: true, minLength: 3 },
        order: 1,
      },
      {
        id: 'f-2',
        label: 'รหัสประจำตัวนิสิต / รหัสผู้เรียน Credit Bank',
        type: 'text',
        placeholder: 'เช่น 69010012 หรือ CBW-69001',
        validation: { required: true },
        order: 2,
      },
      {
        id: 'f-3',
        label: 'คณะ / วิทยาลัย / วิทยาเขต สังกัด',
        type: 'dropdown',
        options: ['คณะพุทธศาสตร์', 'คณะครุศาสตร์', 'คณะมนุษยศาสตร์', 'คณะสังคมศาสตร์', 'วิทยาลัยพระธรรมทูต', 'วิทยาลัยสงฆ์นครสวรรค์'],
        validation: { required: true },
        order: 3,
      },
      {
        id: 'f-4',
        label: 'ประเภทการเทียบโอนผลการเรียนรู้',
        type: 'radio',
        options: ['เทียบโอนจากหลักสูตรระยะสั้น (Short Course)', 'เทียบโอนจากการเรียนล่วงหน้า (Pre-Degree)', 'เทียบโอนจากประสบการณ์ทำงานและวิชาชีพ'],
        validation: { required: true },
        order: 4,
      },
      {
        id: 'f-5',
        label: 'รายวิชาในหลักสูตรที่ประสงค์ขอเทียบโอน',
        type: 'text',
        placeholder: 'เช่น 000 139 พุทธปรัชญาและสมาธิ',
        validation: { required: true },
        order: 5,
      },
      {
        id: 'f-6',
        label: 'จำนวนหน่วยกิตที่ขอเทียบโอน',
        type: 'number',
        placeholder: '3',
        validation: { required: true, min: 1, max: 45 },
        order: 6,
      },
      {
        id: 'f-7',
        label: 'แนบหลักฐานผลการเรียนรู้ / วุฒิบัตร / ใบรับรอง',
        type: 'file_upload',
        helpText: 'รองรับไฟล์ PDF, JPG, PNG ขนาดไม่เกิน 10MB',
        validation: { required: true, maxFileSizeMb: 10, allowedFileTypes: ['.pdf', '.jpg', '.png'] },
        order: 7,
      },
      {
        id: 'f-8',
        label: 'ลงลายมือชื่อผู้ยื่นคำร้อง',
        type: 'signature_placeholder',
        validation: { required: true },
        order: 8,
      },
    ],
    approvalWorkflow: [
      {
        stepNo: 1,
        approverRole: 'เจ้าหน้าที่คลังหน่วยกิต',
        approverUnit: 'กลุ่มงานคลังหน่วยกิต กองวิชาการ',
        autoNotifyEmail: true,
        requiredSignature: true,
      },
      {
        stepNo: 2,
        approverRole: 'คณะกรรมการเทียบโอนประจำคณะ',
        approverUnit: 'คณะต้นสังกัด',
        autoNotifyEmail: true,
        requiredSignature: true,
      },
      {
        stepNo: 3,
        approverRole: 'ผู้อำนวยการกองวิชาการ',
        approverUnit: 'กองวิชาการ สำนักงานอธิการบดี',
        autoNotifyEmail: true,
        requiredSignature: true,
      },
    ],
  },
  {
    id: 'form-curr-02',
    code: 'MCU-CURR-02',
    title: 'แบบเสนอขอเปิด / ปรับปรุงหลักสูตรวิชาการ (มคอ.2)',
    description: 'สำหรับภาควิชาและคณะที่ต้องการเสนอขอเปิดหลักสูตรใหม่ หรือปรับปรุงหลักสูตรตามรอบ 5 ปี เสนอต่อสภาวิชาการ',
    category: 'curriculum',
    categoryLabelTh: 'พัฒนาหลักสูตรและมาตรฐาน',
    status: 'published',
    allowedRoles: ['อาจารย์', 'หัวหน้าภาควิชา', 'คณบดี', 'เจ้าหน้าที่'],
    submissionCount: 0,
    createdAt: '2026-02-01',
    updatedAt: '2026-09-01',
    publishedDate: '2026-02-15',
    fields: [
      {
        id: 'fc-1',
        label: 'ชื่อหลักสูตร (ภาษาไทย)',
        type: 'text',
        placeholder: 'เช่น หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาพุทธนวัตกรรมการสื่อสาร',
        validation: { required: true },
        order: 1,
      },
      {
        id: 'fc-2',
        label: 'ชื่อหลักสูตร (ภาษาอังกฤษ)',
        type: 'text',
        placeholder: 'e.g. Bachelor of Arts in Buddhist Innovative Communication',
        validation: { required: true },
        order: 2,
      },
      {
        id: 'fc-3',
        label: 'ระดับการศึกษา',
        type: 'dropdown',
        options: ['ระดับปริญญาตรี', 'ระดับประกาศนียบัตรบัณฑิต', 'ระดับปริญญาโท', 'ระดับปริญญาเอก'],
        validation: { required: true },
        order: 3,
      },
      {
        id: 'fc-4',
        label: 'คณะเจ้าของหลักสูตร',
        type: 'dropdown',
        options: ['คณะพุทธศาสตร์', 'คณะครุศาสตร์', 'คณะมนุษยศาสตร์', 'คณะสังคมศาสตร์', 'วิทยาลัยพระธรรมทูต'],
        validation: { required: true },
        order: 4,
      },
      {
        id: 'fc-5',
        label: 'แนบไฟล์เอกสารรายละเอียดหลักสูตร (มคอ.2)',
        type: 'file_upload',
        helpText: 'แนบไฟล์ฉบับสมบูรณ์รูปแบบ PDF',
        validation: { required: true, maxFileSizeMb: 25 },
        order: 5,
      },
    ],
    approvalWorkflow: [
      {
        stepNo: 1,
        approverRole: 'คณะกรรมการกลั่นกรองหลักสูตร',
        approverUnit: 'กองวิชาการ',
        autoNotifyEmail: true,
        requiredSignature: true,
      },
      {
        stepNo: 2,
        approverRole: 'ประธานสภาวิชาการ',
        approverUnit: 'สภาวิชาการ มจร',
        autoNotifyEmail: true,
        requiredSignature: true,
      },
    ],
  },
  {
    id: 'form-psf-03',
    code: 'MCU-PSF-03',
    title: 'แบบเสนอขอรับการประเมินสมรรถนะอาจารย์ตามกรอบ Thailand PSF',
    description: 'สำหรับอาจารย์ประจำที่ประสงค์ขอรับการประเมินและรับรองสมรรถนะวิชาชีพอาจารย์ในระดับที่ 1, 2 หรือ 3',
    category: 'faculty_development',
    categoryLabelTh: 'พัฒนาอาจารย์และบุคลากรวิชาการ',
    status: 'published',
    allowedRoles: ['อาจารย์', 'นักวิชาการศึกษา'],
    submissionCount: 0,
    createdAt: '2026-03-01',
    updatedAt: '2026-08-20',
    publishedDate: '2026-03-10',
    fields: [
      {
        id: 'fpsf-1',
        label: 'ชื่ออาจารย์ผู้ขอรับการประเมิน',
        type: 'text',
        placeholder: 'เช่น ผศ.ดร. เมธา บรรจง',
        validation: { required: true },
        order: 1,
      },
      {
        id: 'fpsf-2',
        label: 'ระดับสมรรถนะที่เสนอขอประเมิน',
        type: 'radio',
        options: ['ระดับที่ 1: ผู้เริ่มต้นการสอน (Fellowship)', 'ระดับที่ 2: อาจารย์มืออาชีพ (Senior Fellowship)', 'ระดับที่ 3: ผู้เชี่ยวชาญการสอนและการนำ (Principal)'],
        validation: { required: true },
        order: 2,
      },
      {
        id: 'fpsf-3',
        label: 'แนบแฟ้มสะสมผลงานการสอน (Teaching Portfolio)',
        type: 'file_upload',
        validation: { required: true, maxFileSizeMb: 20 },
        order: 3,
      },
    ],
    approvalWorkflow: [
      {
        stepNo: 1,
        approverRole: 'คณะกรรมการผู้ประเมิน Thailand PSF',
        approverUnit: 'กลุ่มงานพัฒนาอาจารย์',
        autoNotifyEmail: true,
        requiredSignature: true,
      },
    ],
  },
];

export const INITIAL_FORM_SUBMISSIONS: FormSubmissionRecord[] = [];
