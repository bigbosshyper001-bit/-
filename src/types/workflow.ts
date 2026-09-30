/**
 * Workflow and Approval Engine Types
 * Configurable, multi-module organizational workflow system for:
 * "กองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
 */

import type { AppSystemRole } from './architecture.ts';

export type WorkflowState =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Returned for Revision'
  | 'Approved'
  | 'In Progress'
  | 'Completed'
  | 'Archived'
  | 'Rejected';

export type ApprovalActionType =
  | 'Submit'
  | 'Review'
  | 'Approve'
  | 'Reject'
  | 'Return'
  | 'Request Revision'
  | 'Cancel'
  | 'Complete'
  | 'Delegate'
  | 'Restart';

export type SupportedWorkflowModule =
  | 'meeting_documents'
  | 'meeting_resolutions'
  | 'action_items'
  | 'kpi'
  | 'action_plans'
  | 'budget'
  | 'risk_register'
  | 'dual_degree'
  | 'joint_degree'
  | 'curriculum_crosswalk'
  | 'short_course'
  | 'non_degree'
  | 'pre_degree'
  | 'credit_bank'
  | 'faculty_competency'
  | 'regulatory_documents'
  | 'mou'
  | 'general_documents';

export interface WorkflowModuleMeta {
  key: SupportedWorkflowModule;
  labelTh: string;
  labelEn: string;
  category: 'การประชุมและมติ' | 'ยุทธศาสตร์และแผน' | 'หลักสูตรและการศึกษา' | 'อาจารย์และบุคลากร' | 'มาตรฐานและเอกสาร';
  targetRoute: string;
  descriptionTh: string;
  defaultDeadlineDays: number;
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  name: string;
  order: number;
  state: WorkflowState;
  required_role: string; // e.g. 'เจ้าหน้าที่', 'หัวหน้ากอง', 'ผู้บริหาร', 'Super Admin'
  required_permission: string; // e.g. 'meeting.approve', 'kpi.edit', etc.
  can_return: boolean;
  can_skip: boolean;
  sla_days: number;
  description?: string;
  escalate_to_role?: string;
}

export interface Workflow {
  id: string;
  name: string;
  module: SupportedWorkflowModule;
  moduleLabel: string;
  description: string;
  active: boolean;
  steps: WorkflowStep[];
  defaultDeadlineDays: number;
  allowedReturnToStepId?: string;
}

export interface WorkflowAction {
  id: string;
  workflow_instance_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action: ApprovalActionType;
  from_status: WorkflowState;
  to_status: WorkflowState;
  comment?: string;
  reason?: string;
  attachment_name?: string;
  attachment_url?: string;
  delegated_to_user_id?: string;
  delegated_to_name?: string;
  timestamp: string;
}

export interface WorkflowHistoryEntry {
  id: string;
  timestamp: string;
  user_name: string;
  user_role: string;
  action: ApprovalActionType;
  from_status: WorkflowState;
  to_status: WorkflowState;
  comment?: string;
  reason?: string;
  attachment_name?: string;
  is_delegation?: boolean;
}

export interface WorkflowInstance {
  id: string;
  workflow_id: string;
  record_id: string;
  record_type: SupportedWorkflowModule;
  record_title: string;
  record_code?: string;
  module_key: string;
  target_route: string;
  current_step_id: string;
  current_step_name: string;
  status: WorkflowState;
  creator_id: string;
  creator_name: string;
  creator_role: string;
  assigned_role: string;
  assigned_user_id?: string;
  assigned_user_name?: string;
  delegated_to_user_id?: string;
  delegated_to_user_name?: string;
  delegation_note?: string;
  started_at: string;
  due_date: string;
  completed_at?: string;
  priority: 'Critical' | 'High' | 'Normal';
  actions: WorkflowAction[];
  history: WorkflowHistoryEntry[];
}

export interface WorkflowDelegation {
  id: string;
  instance_id: string;
  delegated_by_id: string;
  delegated_by_name: string;
  delegated_to_id: string;
  delegated_to_name: string;
  reason: string;
  created_at: string;
  expires_at?: string;
}

export type WorkflowEventType =
  | 'workflow.submitted'
  | 'workflow.review_required'
  | 'workflow.approved'
  | 'workflow.returned'
  | 'workflow.overdue'
  | 'workflow.completed'
  | 'workflow.delegated';

export interface WorkflowEventPayload {
  event: WorkflowEventType;
  instance: WorkflowInstance;
  action: WorkflowAction;
  timestamp: string;
}
