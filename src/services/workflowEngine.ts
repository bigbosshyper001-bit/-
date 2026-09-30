/**
 * Workflow and Approval Engine
 * Provides reusable workflow lifecycle management, multi-role approvals,
 * state transitions, delegation, SLA tracking, and audit logging across 18 modules.
 * For "กองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
 */

import type { UserProfile } from '../types.ts';
import type {
  Workflow,
  WorkflowStep,
  WorkflowInstance,
  WorkflowAction,
  WorkflowState,
  ApprovalActionType,
  SupportedWorkflowModule,
  WorkflowModuleMeta,
  WorkflowEventType,
  WorkflowEventPayload,
  WorkflowDelegation,
} from '../types/workflow.ts';
import { auditLogService } from './auditLogService.ts';
import { notificationEngine } from './notificationEngine.ts';
import { rbacService } from './rbacService.ts';

const WORKFLOW_CONFIG_STORAGE_KEY = 'mcu_workflow_configs_v1';
const WORKFLOW_INSTANCES_STORAGE_KEY = 'mcu_workflow_instances_v1';

// 18 Supported Modules Metadata
export const WORKFLOW_MODULES: WorkflowModuleMeta[] = [
  {
    key: 'meeting_documents',
    labelTh: 'เอกสารการประชุมสภาวิชาการ',
    labelEn: 'Meeting Documents',
    category: 'การประชุมและมติ',
    targetRoute: '/meetings',
    descriptionTh: 'เอกสารประกอบวาระการประชุมสภาวิชาการ รายงานการประชุม และหนังสือเชิญประชุม',
    defaultDeadlineDays: 7,
  },
  {
    key: 'meeting_resolutions',
    labelTh: 'มติที่ประชุมสภาวิชาการ',
    labelEn: 'Meeting Resolutions',
    category: 'การประชุมและมติ',
    targetRoute: '/meetings',
    descriptionTh: 'มติที่ประชุมสภาวิชาการเพื่อลงนามรับรองและออกคำสั่งมหาวิทยาลัย',
    defaultDeadlineDays: 5,
  },
  {
    key: 'action_items',
    labelTh: 'งานมอบหมายตามมติ (Action Items)',
    labelEn: 'Action Items',
    category: 'การประชุมและมติ',
    targetRoute: '/meetings',
    descriptionTh: 'ภารกิจมอบหมายเจ้าหน้าที่และคณะเพื่อดำเนินการตามมติที่ประชุม',
    defaultDeadlineDays: 14,
  },
  {
    key: 'kpi',
    labelTh: 'ตัวชี้วัดผลสัมฤทธิ์ (KPI)',
    labelEn: 'KPI Metrics',
    category: 'ยุทธศาสตร์และแผน',
    targetRoute: '/strategy',
    descriptionTh: 'เกณฑ์และผลการดำเนินงานตัวชี้วัดตามแผนยุทธศาสตร์กองวิชาการ',
    defaultDeadlineDays: 10,
  },
  {
    key: 'action_plans',
    labelTh: 'แผนปฏิบัติการประจำปี (Action Plans)',
    labelEn: 'Action Plans',
    category: 'ยุทธศาสตร์และแผน',
    targetRoute: '/strategy',
    descriptionTh: 'โครงการและแผนงานประจำปีงบประมาณของกองวิชาการ',
    defaultDeadlineDays: 15,
  },
  {
    key: 'budget',
    labelTh: 'งบประมาณและการเบิกจ่าย',
    labelEn: 'Budget & Expenditure',
    category: 'ยุทธศาสตร์และแผน',
    targetRoute: '/strategy',
    descriptionTh: 'คำของบประมาณ จัดสรรงบดำเนินงาน และรายงานผลการใช้จ่าย',
    defaultDeadlineDays: 7,
  },
  {
    key: 'risk_register',
    labelTh: 'ทะเบียนและแผนบริหารความเสี่ยง',
    labelEn: 'Risk Register',
    category: 'ยุทธศาสตร์และแผน',
    targetRoute: '/strategy',
    descriptionTh: 'การระบุความเสี่ยง มาตรการจัดการความเสี่ยง และรายงานความเสี่ยงประจำไตรมาส',
    defaultDeadlineDays: 12,
  },
  {
    key: 'dual_degree',
    labelTh: 'หลักสูตรสองปริญญา (Dual Degree)',
    labelEn: 'Dual Degree Programs',
    category: 'หลักสูตรและการศึกษา',
    targetRoute: '/collaboration',
    descriptionTh: 'ข้อเสนอหลักสูตรสองปริญญาร่วมกับมหาวิทยาลัยทั้งในและต่างประเทศ',
    defaultDeadlineDays: 20,
  },
  {
    key: 'joint_degree',
    labelTh: 'หลักสูตรร่วมสถาบัน (Joint Degree)',
    labelEn: 'Joint Degree Programs',
    category: 'หลักสูตรและการศึกษา',
    targetRoute: '/collaboration',
    descriptionTh: 'โครงการจัดการศึกษาร่วมกับสถาบันพันธมิตรทางวิชาการ',
    defaultDeadlineDays: 20,
  },
  {
    key: 'curriculum_crosswalk',
    labelTh: 'ตารางเทียบเคียงหลักสูตร (Crosswalk)',
    labelEn: 'Curriculum Crosswalk',
    category: 'หลักสูตรและการศึกษา',
    targetRoute: '/collaboration',
    descriptionTh: 'การเทียบเคียงผลลัพธ์การเรียนรู้ (PLOs/CLOs) และรายวิชาสะสมหน่วยกิต',
    defaultDeadlineDays: 14,
  },
  {
    key: 'short_course',
    labelTh: 'หลักสูตรระยะสั้น (Short Course)',
    labelEn: 'Short Courses',
    category: 'หลักสูตรและการศึกษา',
    targetRoute: '/courses',
    descriptionTh: 'การอนุมัติเปิดรายวิชาอบรมระยะสั้นเพื่อการเรียนรู้ตลอดชีวิต',
    defaultDeadlineDays: 10,
  },
  {
    key: 'non_degree',
    labelTh: 'หลักสูตรประกาศนียบัตร (Non-degree)',
    labelEn: 'Non-degree Certificates',
    category: 'หลักสูตรและการศึกษา',
    targetRoute: '/courses',
    descriptionTh: 'การรับรองชุดสมรรถนะและการออกสัมฤทธิบัตร/ประกาศนียบัตร',
    defaultDeadlineDays: 10,
  },
  {
    key: 'pre_degree',
    labelTh: 'โครงการเรียนล่วงหน้า (Pre-degree)',
    labelEn: 'Pre-degree Enrollment',
    category: 'หลักสูตรและการศึกษา',
    targetRoute: '/pre-degree',
    descriptionTh: 'การขึ้นทะเบียนผู้เรียนและบันทึกผลการเรียนรายวิชาเรียนล่วงหน้า',
    defaultDeadlineDays: 7,
  },
  {
    key: 'credit_bank',
    labelTh: 'ธนาคารหน่วยกิตและการเทียบโอน',
    labelEn: 'Credit Bank Transfer',
    category: 'หลักสูตรและการศึกษา',
    targetRoute: '/credit-bank',
    descriptionTh: 'คำขอสะสมและเทียบโอนหน่วยกิตจากประสบการณ์และการศึกษานอกระบบ',
    defaultDeadlineDays: 5,
  },
  {
    key: 'faculty_competency',
    labelTh: 'บันทึกสมรรถนะอาจารย์ (MCU-TPS)',
    labelEn: 'Faculty Competency Records',
    category: 'อาจารย์และบุคลากร',
    targetRoute: '/faculty',
    descriptionTh: 'การประเมินสมรรถนะอาจารย์ตามกรอบ MCU-TPS และแผน IDP',
    defaultDeadlineDays: 14,
  },
  {
    key: 'regulatory_documents',
    labelTh: 'เอกสารระเบียบ/ข้อบังคับวิชาการ',
    labelEn: 'Regulatory & Compliance',
    category: 'มาตรฐานและเอกสาร',
    targetRoute: '/regulatory',
    descriptionTh: 'การตรวจร่างข้อบังคับมหาวิทยาลัย ประกาศ อว. และการรายงาน CHECO',
    defaultDeadlineDays: 15,
  },
  {
    key: 'mou',
    labelTh: 'บันทึกความเข้าใจ (MOU / MOA)',
    labelEn: 'MOU & MOA Agreements',
    category: 'มาตรฐานและเอกสาร',
    targetRoute: '/collaboration',
    descriptionTh: 'การกลั่นกรองและอนุมัติร่างข้อตกลงความร่วมมือทางวิชาการกับหน่วยงานภายนอก',
    defaultDeadlineDays: 14,
  },
  {
    key: 'general_documents',
    labelTh: 'เอกสารกลางและคำสั่งมหาวิทยาลัย',
    labelEn: 'General Academic Documents',
    category: 'มาตรฐานและเอกสาร',
    targetRoute: '/documents',
    descriptionTh: 'หนังสือเวียน คำสั่งแต่งตั้ง และเอกสารวิชาการกลางของมหาวิทยาลัย',
    defaultDeadlineDays: 7,
  },
];

// Default Workflow Step Generators
function createStandardWorkflow(
  id: string,
  name: string,
  module: SupportedWorkflowModule,
  moduleLabel: string,
  description: string,
  deadlineDays: number
): Workflow {
  return {
    id,
    name,
    module,
    moduleLabel,
    description,
    active: true,
    defaultDeadlineDays: deadlineDays,
    steps: [
      {
        id: `${id}-step-1`,
        workflow_id: id,
        name: 'ร่างเอกสารและข้อมูล',
        order: 1,
        state: 'Draft',
        required_role: 'เจ้าหน้าที่',
        required_permission: 'edit',
        can_return: false,
        can_skip: false,
        sla_days: 3,
        description: 'จัดทำรายละเอียดข้อมูลและแนบเอกสารหลักฐาน',
      },
      {
        id: `${id}-step-2`,
        workflow_id: id,
        name: 'ส่งตรวจความถูกต้อง',
        order: 2,
        state: 'Submitted',
        required_role: 'เจ้าหน้าที่',
        required_permission: 'create',
        can_return: true,
        can_skip: false,
        sla_days: 1,
        description: 'ส่งเข้าสู่คิวการตรวจสอบของหัวหน้ากองวิชาการ',
      },
      {
        id: `${id}-step-3`,
        workflow_id: id,
        name: 'หัวหน้ากองตรวจสอบและกลั่นกรอง',
        order: 3,
        state: 'Under Review',
        required_role: 'หัวหน้ากอง',
        required_permission: 'approve',
        can_return: true,
        can_skip: false,
        sla_days: 3,
        description: 'ตรวจสอบความถูกต้องตามระเบียบและมาตรฐานวิชาการ',
        escalate_to_role: 'ผู้บริหาร',
      },
      {
        id: `${id}-step-4`,
        workflow_id: id,
        name: 'ผู้บริหารลงนามอนุมัติ',
        order: 4,
        state: 'Approved',
        required_role: 'ผู้บริหาร',
        required_permission: 'approve',
        can_return: true,
        can_skip: false,
        sla_days: 2,
        description: 'ผู้อำนวยการ/รองอธิการบดีลงนามอนุมัติอย่างเป็นทางการ',
      },
      {
        id: `${id}-step-5`,
        workflow_id: id,
        name: 'เสร็จสิ้นกระบวนการและออกเลขบันทึก',
        order: 5,
        state: 'Completed',
        required_role: 'เจ้าหน้าที่',
        required_permission: 'view',
        can_return: false,
        can_skip: false,
        sla_days: 1,
        description: 'ระบบบันทึกมติ ออกเลขสารบรรณ และเผยแพร่สู่ผู้เกี่ยวข้อง',
      },
    ],
  };
}

// Initial Workflows for all 18 modules
const INITIAL_WORKFLOWS: Workflow[] = WORKFLOW_MODULES.map((m) =>
  createStandardWorkflow(
    `wf-${m.key}`,
    `กระบวนการ${m.labelTh}`,
    m.key,
    m.labelTh,
    m.descriptionTh,
    m.defaultDeadlineDays
  )
);

// Real Instances - Initialized Empty
const INITIAL_INSTANCES: WorkflowInstance[] = [];

// In-memory state management with LocalStorage fallback
let inMemoryWorkflows: Workflow[] = (() => {
  try {
    const raw = localStorage.getItem(WORKFLOW_CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return [...INITIAL_WORKFLOWS];
})();

let inMemoryInstances: WorkflowInstance[] = (() => {
  try {
    const raw = localStorage.getItem(WORKFLOW_INSTANCES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return [...INITIAL_INSTANCES];
})();

const listeners = new Set<(instances: WorkflowInstance[]) => void>();

function notify() {
  try {
    localStorage.setItem(WORKFLOW_CONFIG_STORAGE_KEY, JSON.stringify(inMemoryWorkflows));
    localStorage.setItem(WORKFLOW_INSTANCES_STORAGE_KEY, JSON.stringify(inMemoryInstances));
  } catch {
    // ignore
  }
  listeners.forEach((fn) => fn([...inMemoryInstances]));
}

// Workflow Event Subscriptions
const eventListeners: ((payload: WorkflowEventPayload) => void)[] = [];

export const workflowEngine = {
  /**
   * Subscribe to instance changes
   */
  subscribe(callback: (instances: WorkflowInstance[]) => void): () => void {
    listeners.add(callback);
    callback([...inMemoryInstances]);
    return () => listeners.delete(callback);
  },

  /**
   * Subscribe to workflow events (hooks)
   */
  onEvent(callback: (payload: WorkflowEventPayload) => void): () => void {
    eventListeners.push(callback);
    return () => {
      const idx = eventListeners.indexOf(callback);
      if (idx !== -1) eventListeners.splice(idx, 1);
    };
  },

  /**
   * Internal Event Dispatcher with Notification Engine Hook
   */
  emit(event: WorkflowEventType, instance: WorkflowInstance, action: WorkflowAction) {
    const payload: WorkflowEventPayload = {
      event,
      instance,
      action,
      timestamp: new Date().toISOString(),
    };

    // Dispatch to registered event hooks
    eventListeners.forEach((fn) => {
      try {
        fn(payload);
      } catch (err) {
        console.error('Workflow event handler error:', err);
      }
    });

    // Hook to central Notification Engine
    this.dispatchSystemNotification(event, instance, action);
  },

  /**
   * Dispatches system notification based on workflow event
   */
  dispatchSystemNotification(event: WorkflowEventType, instance: WorkflowInstance, action: WorkflowAction) {
    let title = '';
    let description = '';
    let trigger: 'Approval' | 'Revision' | 'Overdue' | 'Deadline' | 'New Assignment' = 'Approval';
    let priority: 'Critical' | 'High' | 'Normal' = 'Normal';

    switch (event) {
      case 'workflow.submitted':
        title = `ส่งตรวจงานใหม่: ${instance.record_title}`;
        description = `${action.user_name} ได้ส่งงานเข้าสู่กระบวนการ รอการตรวจสอบโดย ${instance.assigned_role}`;
        trigger = 'Approval';
        priority = instance.priority;
        break;
      case 'workflow.review_required':
        title = `มีงานรอการกลั่นกรอง: ${instance.record_title}`;
        description = `ส่งมอบให้ ${instance.assigned_role} พิจารณาตรวจสอบความถูกต้อง`;
        trigger = 'Approval';
        priority = 'High';
        break;
      case 'workflow.approved':
        title = `อนุมัติเรียบร้อย: ${instance.record_title}`;
        description = `${action.user_name} (${action.user_role}) ได้ลงนามอนุมัติเอกสารแล้ว`;
        trigger = 'Approval';
        priority = 'Normal';
        break;
      case 'workflow.returned':
        title = `งานถูกตีกลับเพื่อแก้ไข: ${instance.record_title}`;
        description = `${action.user_name} ได้ตีกลับงาน: "${action.reason || action.comment || 'โปรดแก้ไขข้อมูล'}"`;
        trigger = 'Revision';
        priority = 'High';
        break;
      case 'workflow.overdue':
        title = `แจ้งเตือนงานเกินกำหนด SLA: ${instance.record_title}`;
        description = `งานครบกำหนดส่งเมื่อ ${instance.due_date} กรุณาดำเนินการทันที`;
        trigger = 'Overdue';
        priority = 'Critical';
        break;
      case 'workflow.completed':
        title = `งานเสร็จสมบูรณ์: ${instance.record_title}`;
        description = `กระบวนการทำงานเสร็จสิ้นแล้ว บันทึกประวัติและจัดเก็บข้อมูลเรียบร้อย`;
        trigger = 'Approval';
        priority = 'Normal';
        break;
      case 'workflow.delegated':
        title = `มอบหมายการพิจารณาแทน: ${instance.record_title}`;
        description = `${action.user_name} มอบหมายให้ ${action.delegated_to_name} ดำเนินการพิจารณาแทน`;
        trigger = 'New Assignment';
        priority = 'High';
        break;
    }

    notificationEngine.dispatch({
      title,
      description,
      trigger,
      priority,
      module: (instance.module_key as any) || 'general',
      targetPath: instance.target_route || '/workflows',
      targetId: instance.record_id,
      actionRequired: event === 'workflow.submitted' || event === 'workflow.returned' || event === 'workflow.review_required',
    });
  },

  // ==========================================
  // WORKFLOW CONFIGURATION CRUD
  // ==========================================
  getWorkflows(): Workflow[] {
    return [...inMemoryWorkflows];
  },

  getWorkflow(id: string): Workflow | undefined {
    return inMemoryWorkflows.find((w) => w.id === id);
  },

  getWorkflowByModule(moduleKey: SupportedWorkflowModule): Workflow | undefined {
    return inMemoryWorkflows.find((w) => w.module === moduleKey);
  },

  updateWorkflow(workflow: Workflow, actorUser?: UserProfile): boolean {
    const idx = inMemoryWorkflows.findIndex((w) => w.id === workflow.id);
    if (idx === -1) return false;

    inMemoryWorkflows[idx] = workflow;
    notify();

    auditLogService.log({
      userId: actorUser?.id || 'usr-admin',
      userName: actorUser?.name || 'ผู้ดูแลระบบ',
      userRole: actorUser?.role || 'Super Admin',
      action: 'UPDATE',
      module: 'Workflow Engine',
      recordId: workflow.id,
      recordTitle: `แก้ไขผังกระบวนการ: ${workflow.name}`,
      details: `ปรับแต่งขั้นตอนการทำงานจำนวน ${workflow.steps.length} ขั้นตอน`,
      ipAddress: '10.20.4.15',
    });

    return true;
  },

  // ==========================================
  // INSTANCES QUERY & CREATION
  // ==========================================
  getInstances(filter?: {
    module?: SupportedWorkflowModule | 'all';
    status?: WorkflowState | 'all';
    role?: string | 'all';
    search?: string;
  }): WorkflowInstance[] {
    let list = [...inMemoryInstances];

    if (filter?.module && filter.module !== 'all') {
      list = list.filter((i) => i.record_type === filter.module);
    }
    if (filter?.status && filter.status !== 'all') {
      list = list.filter((i) => i.status === filter.status);
    }
    if (filter?.role && filter.role !== 'all') {
      list = list.filter((i) => i.assigned_role === filter.role);
    }
    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (i) =>
          i.record_title.toLowerCase().includes(q) ||
          (i.record_code && i.record_code.toLowerCase().includes(q)) ||
          i.creator_name.toLowerCase().includes(q)
      );
    }

    return list;
  },

  getInstance(id: string): WorkflowInstance | undefined {
    return inMemoryInstances.find((i) => i.id === id);
  },

  getInstanceByRecord(recordId: string, recordType?: SupportedWorkflowModule): WorkflowInstance | undefined {
    return inMemoryInstances.find((i) => i.record_id === recordId && (!recordType || i.record_type === recordType));
  },

  /**
   * Get an existing instance or create a new one for a record
   */
  getOrCreateInstance(
    recordId: string,
    recordType: SupportedWorkflowModule,
    recordTitle: string,
    recordCode: string = '',
    moduleKey: string = 'academic',
    targetRoute: string = '/dashboard',
    creator: UserProfile
  ): WorkflowInstance {
    const existing = this.getInstanceByRecord(recordId, recordType);
    if (existing) return existing;

    const workflow = this.getWorkflowByModule(recordType) || inMemoryWorkflows[0];
    const initialStep = workflow.steps[0] || {
      id: 'step-init',
      name: 'ร่างเอกสารและข้อมูล',
      state: 'Draft' as WorkflowState,
      required_role: 'เจ้าหน้าที่',
      required_permission: 'edit',
      can_return: false,
      can_skip: false,
      sla_days: 7,
    };

    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (workflow.defaultDeadlineDays || 7));

    const newInstance: WorkflowInstance = {
      id: `wfi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      workflow_id: workflow.id,
      record_id: recordId,
      record_type: recordType,
      record_title: recordTitle,
      record_code: recordCode,
      module_key: moduleKey,
      target_route: targetRoute,
      current_step_id: initialStep.id,
      current_step_name: initialStep.name,
      status: 'Draft',
      creator_id: creator.id,
      creator_name: creator.name,
      creator_role: creator.role,
      assigned_role: initialStep.required_role,
      assigned_user_id: creator.id,
      assigned_user_name: creator.name,
      started_at: now.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
      due_date: dueDate.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
      priority: 'Normal',
      actions: [],
      history: [
        {
          id: `hist-${Date.now()}`,
          timestamp: now.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
          user_name: creator.name,
          user_role: creator.role,
          action: 'Submit',
          from_status: 'Draft',
          to_status: 'Draft',
          comment: 'สร้างเอกสารในระบบ',
        },
      ],
    };

    inMemoryInstances.unshift(newInstance);
    notify();

    auditLogService.log({
      userId: creator.id,
      userName: creator.name,
      userRole: creator.role,
      action: 'CREATE',
      module: 'Workflow Engine',
      recordId: newInstance.id,
      recordTitle: `เริ่มกระบวนการ: ${recordTitle}`,
      details: `สร้างคำขอในโมดูล ${recordType} สถานะเริ่มต้น Draft`,
      ipAddress: '10.20.4.15',
    });

    return newInstance;
  },

  // ==========================================
  // ACTION VALIDATION & EXECUTION
  // ==========================================
  /**
   * Validates whether a user can execute an action on an instance
   */
  canExecuteAction(
    instance: WorkflowInstance,
    action: ApprovalActionType,
    user: UserProfile
  ): { allowed: boolean; reason?: string } {
    if (!user) {
      return { allowed: false, reason: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' };
    }

    // Super Admin has master authority
    if (user.role === 'Super Admin') {
      return { allowed: true };
    }

    // Check delegation: if current step is delegated to this user
    const isDelegated =
      instance.delegated_to_user_id === user.id ||
      instance.delegated_to_user_name === user.name;

    // Check Role match
    const roleMatches =
      user.role === instance.assigned_role ||
      isDelegated ||
      rbacService.normalizeRoleName(user.role) === rbacService.normalizeRoleName(instance.assigned_role);

    // State & Action Logic
    switch (action) {
      case 'Submit':
        if (instance.status !== 'Draft' && instance.status !== 'Returned for Revision') {
          return { allowed: false, reason: `ไม่สามารถส่งตรวจได้ในสถานะ "${instance.status}"` };
        }
        return { allowed: true };

      case 'Review':
        if (instance.status !== 'Submitted') {
          return { allowed: false, reason: 'เอกสารยังไม่ได้ถูกส่งตรวจ' };
        }
        if (!roleMatches && user.role !== 'หัวหน้ากอง' && user.role !== 'ผู้บริหาร') {
          return { allowed: false, reason: `ต้องเป็นบทบาท "${instance.assigned_role}" จึงจะสามารถตรวจสอบได้` };
        }
        return { allowed: true };

      case 'Approve':
        if (instance.status !== 'Under Review' && instance.status !== 'Submitted') {
          return { allowed: false, reason: `ไม่สามารถอนุมัติได้ในสถานะ "${instance.status}"` };
        }
        if (!roleMatches && user.role !== 'หัวหน้ากอง' && user.role !== 'ผู้บริหาร') {
          return { allowed: false, reason: `เฉพาะ ${instance.assigned_role} เท่านั้นที่มีอำนาจอนุมัติ` };
        }
        return { allowed: true };

      case 'Return':
      case 'Request Revision':
        if (instance.status !== 'Under Review' && instance.status !== 'Submitted') {
          return { allowed: false, reason: 'สามารถตีกลับได้เฉพาะรายการที่กำลังตรวจสอบเท่านั้น' };
        }
        if (!roleMatches && user.role !== 'หัวหน้ากอง' && user.role !== 'ผู้บริหาร') {
          return { allowed: false, reason: 'ไม่มีสิทธิ์ตีกลับเอกสาร' };
        }
        return { allowed: true };

      case 'Reject':
      case 'Cancel':
        if (instance.status === 'Completed' || instance.status === 'Archived') {
          return { allowed: false, reason: 'รายการเสร็จสมบูรณ์แล้ว ไม่สามารถยกเลิกได้' };
        }
        return { allowed: true };

      case 'Complete':
        if (instance.status !== 'Approved' && instance.status !== 'In Progress') {
          return { allowed: false, reason: 'ต้องได้รับอนุมัติก่อนจึงจะสามารถทำรายการเสร็จสิ้นได้' };
        }
        return { allowed: true };

      case 'Delegate':
        if (instance.status === 'Completed' || instance.status === 'Archived') {
          return { allowed: false, reason: 'งานเสร็จสิ้นแล้ว ไม่สามารถมอบหมายได้' };
        }
        if (!roleMatches && user.role !== 'หัวหน้ากอง' && user.role !== 'ผู้บริหาร') {
          return { allowed: false, reason: 'เฉพาะผู้รับผิดชอบหรือผู้มีอำนาจเท่านั้นที่สามารถมอบหมายแทนได้' };
        }
        return { allowed: true };

      case 'Restart':
        if (user.role !== 'Super Admin' && user.role !== 'หัวหน้ากอง') {
          return { allowed: false, reason: 'เฉพาะหัวหน้ากองหรือ Super Admin ที่สามารถเริ่มกระบวนการใหม่ได้' };
        }
        return { allowed: true };

      default:
        return { allowed: true };
    }
  },

  /**
   * Executes a workflow transition with full validation and audit
   */
  executeAction(
    instanceId: string,
    action: ApprovalActionType,
    user: UserProfile,
    payload?: {
      comment?: string;
      reason?: string;
      attachmentName?: string;
      delegatedToUser?: UserProfile;
    }
  ): { success: boolean; message: string; instance?: WorkflowInstance } {
    const instance = this.getInstance(instanceId);
    if (!instance) {
      return { success: false, message: 'ไม่พบรายการกระบวนการงานในระบบ' };
    }

    const check = this.canExecuteAction(instance, action, user);
    if (!check.allowed) {
      return { success: false, message: check.reason || 'ไม่มีสิทธิ์ดำเนินการในขั้นตอนนี้' };
    }

    const workflow = this.getWorkflow(instance.workflow_id) || inMemoryWorkflows[0];
    const fromStatus = instance.status;
    let toStatus: WorkflowState = fromStatus;
    let nextRole = instance.assigned_role;
    let nextStepId = instance.current_step_id;
    let nextStepName = instance.current_step_name;
    let eventType: WorkflowEventType = 'workflow.submitted';

    const timestamp = new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });

    // Transition State Machine
    switch (action) {
      case 'Submit': {
        toStatus = 'Submitted';
        const reviewStep = workflow.steps.find((s) => s.state === 'Under Review') || workflow.steps[1];
        if (reviewStep) {
          nextRole = reviewStep.required_role;
          nextStepId = reviewStep.id;
          nextStepName = reviewStep.name;
        }
        eventType = 'workflow.submitted';
        break;
      }

      case 'Review': {
        toStatus = 'Under Review';
        const reviewStep = workflow.steps.find((s) => s.state === 'Under Review');
        if (reviewStep) {
          nextRole = reviewStep.required_role;
          nextStepId = reviewStep.id;
          nextStepName = reviewStep.name;
        }
        eventType = 'workflow.review_required';
        break;
      }

      case 'Approve': {
        toStatus = 'Approved';
        const approveStep = workflow.steps.find((s) => s.state === 'Approved') || workflow.steps[3];
        const nextCompleteStep = workflow.steps.find((s) => s.state === 'Completed') || workflow.steps[workflow.steps.length - 1];
        if (approveStep) {
          nextStepId = approveStep.id;
          nextStepName = approveStep.name;
        }
        if (nextCompleteStep) {
          nextRole = nextCompleteStep.required_role;
        }
        eventType = 'workflow.approved';
        break;
      }

      case 'Return':
      case 'Request Revision': {
        toStatus = 'Returned for Revision';
        nextRole = instance.creator_role || 'เจ้าหน้าที่';
        const draftStep = workflow.steps.find((s) => s.state === 'Draft') || workflow.steps[0];
        nextStepId = draftStep.id;
        nextStepName = draftStep.name;
        eventType = 'workflow.returned';
        break;
      }

      case 'Reject':
      case 'Cancel': {
        toStatus = 'Rejected';
        eventType = 'workflow.returned';
        break;
      }

      case 'Complete': {
        toStatus = 'Completed';
        instance.completed_at = timestamp;
        const completeStep = workflow.steps.find((s) => s.state === 'Completed');
        if (completeStep) {
          nextStepId = completeStep.id;
          nextStepName = completeStep.name;
        }
        eventType = 'workflow.completed';
        break;
      }

      case 'Delegate': {
        if (!payload?.delegatedToUser) {
          return { success: false, message: 'กรุณาระบุผู้รับมอบหมายอำนาจ' };
        }
        instance.delegated_to_user_id = payload.delegatedToUser.id;
        instance.delegated_to_user_name = payload.delegatedToUser.name;
        instance.delegation_note = payload.comment || 'มอบหมายการพิจารณาแทน';
        eventType = 'workflow.delegated';
        break;
      }

      case 'Restart': {
        toStatus = 'Draft';
        const draftStep = workflow.steps[0];
        nextRole = draftStep.required_role;
        nextStepId = draftStep.id;
        nextStepName = draftStep.name;
        instance.completed_at = undefined;
        eventType = 'workflow.submitted';
        break;
      }
    }

    // Record Action
    const actionRecord: WorkflowAction = {
      id: `act-${Date.now()}`,
      workflow_instance_id: instance.id,
      user_id: user.id,
      user_name: user.name,
      user_role: user.role,
      action,
      from_status: fromStatus,
      to_status: toStatus,
      comment: payload?.comment,
      reason: payload?.reason,
      attachment_name: payload?.attachmentName,
      delegated_to_user_id: payload?.delegatedToUser?.id,
      delegated_to_name: payload?.delegatedToUser?.name,
      timestamp,
    };

    // Update instance
    instance.status = toStatus;
    instance.assigned_role = nextRole;
    instance.current_step_id = nextStepId;
    instance.current_step_name = nextStepName;
    instance.actions.push(actionRecord);
    instance.history.push({
      id: `hist-${Date.now()}`,
      timestamp,
      user_name: user.name,
      user_role: user.role,
      action,
      from_status: fromStatus,
      to_status: toStatus,
      comment: payload?.comment,
      reason: payload?.reason,
      attachment_name: payload?.attachmentName,
      is_delegation: action === 'Delegate',
    });

    // Reset delegation once action is approved/completed/returned
    if (action === 'Approve' || action === 'Return' || action === 'Complete') {
      instance.delegated_to_user_id = undefined;
      instance.delegated_to_user_name = undefined;
    }

    notify();

    // Audit Logging
    let auditAction: 'APPROVE' | 'REVISE' | 'REJECT' | 'TRANSITION' = 'TRANSITION';
    if (action === 'Approve' || action === 'Complete') auditAction = 'APPROVE';
    else if (action === 'Return' || action === 'Request Revision') auditAction = 'REVISE';
    else if (action === 'Reject' || action === 'Cancel') auditAction = 'REJECT';

    auditLogService.log({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: auditAction,
      module: 'Workflow Engine',
      recordId: instance.record_id,
      recordTitle: `${action}: ${instance.record_title}`,
      oldValue: { status: fromStatus },
      newValue: { status: toStatus, step: nextStepName },
      details: payload?.reason ? `เหตุผล: ${payload.reason}` : payload?.comment || `เปลี่ยนสถานะจาก ${fromStatus} เป็น ${toStatus}`,
      ipAddress: '10.20.4.15',
    });

    // Emit Workflow Event Hook
    this.emit(eventType, instance, actionRecord);

    return {
      success: true,
      message: `ดำเนินการ "${action}" สำเร็จแล้ว`,
      instance,
    };
  },

  /**
   * Reset engine to factory demonstration data
   */
  resetToDemo(): void {
    inMemoryWorkflows = [...INITIAL_WORKFLOWS];
    inMemoryInstances = [...INITIAL_INSTANCES];
    localStorage.removeItem(WORKFLOW_CONFIG_STORAGE_KEY);
    localStorage.removeItem(WORKFLOW_INSTANCES_STORAGE_KEY);
    notify();
  },
};
