/**
 * System Architecture Types
 * Core definitions for Central Database, RBAC, Workflow, Audit Log, Notifications, and Integration Center
 */

export type AppSystemRole =
  | 'Super Admin'
  | 'Executive'
  | 'Central Admin'
  | 'Faculty Admin'
  | 'Staff'
  | 'Lecturer'
  | 'Mentor'
  | 'Learner';

export type AppSystemPermission =
  | 'View'
  | 'Create'
  | 'Edit'
  | 'Delete'
  | 'Approve'
  | 'Export'
  | 'Manage';

export type SystemModuleKey =
  | 'core'
  | 'meetings'
  | 'strategy'
  | 'academic'
  | 'courses'
  | 'collaboration'
  | 'pre-degree'
  | 'credit-bank'
  | 'faculty'
  | 'regulatory'
  | 'forms'
  | 'documents'
  | 'reports'
  | 'integrations'
  | 'settings';

export type WorkflowState =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'revision_required'
  | 'approved'
  | 'rejected'
  | 'completed';

export interface WorkflowTransition {
  from: WorkflowState;
  to: WorkflowState;
  label: string;
  allowedRoles: AppSystemRole[];
  requireNote?: boolean;
}

export type NotificationTriggerType =
  | 'Deadline'
  | 'Overdue'
  | 'Approval'
  | 'Revision'
  | 'New Assignment'
  | 'Risk'
  | 'Meeting'
  | 'KPI';

export type NotificationPriority = 'Critical' | 'High' | 'Normal';

export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  trigger: NotificationTriggerType;
  priority: NotificationPriority;
  timestamp: string;
  read: boolean;
  module: SystemModuleKey | 'general';
  targetPath?: string;
  targetId?: string;
  recipientRoles?: AppSystemRole[];
  recipientUserId?: string;
  actionRequired?: boolean;
}

export interface SoftDeleteRecord {
  deleted_at?: string | null;
  deleted_by?: string | null;
  delete_reason?: string | null;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: AppSystemRole | string;
  action:
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'RESTORE'
    | 'PERMANENT_DELETE'
    | 'APPROVE'
    | 'REVISE'
    | 'REJECT'
    | 'TRANSITION'
    | 'EXPORT'
    | 'LOGIN'
    | 'LOGOUT';
  module: string;
  recordId: string;
  recordTitle: string;
  timestamp: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  details?: string;
}

export type IntegrationSystemStatus = 'Connected' | 'Pending' | 'Not Available' | 'Error';

export type IntegrationProtocol = 'REST API' | 'JSON' | 'CSV' | 'Excel' | 'Webhook';

export interface IntegrationSystemDefinition {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  agency: string;
  category: 'national_db' | 'quality_assurance' | 'ministry' | 'institutional_hr' | 'student_information' | 'document_system';
  status: IntegrationSystemStatus;
  description: string;
  endpointUrl?: string;
  authMethod: 'OAuth2 / Bearer Token' | 'API Key & HMAC' | 'mTLS Certificate' | 'Scheduled Batch SFTP';
  supportedProtocols: IntegrationProtocol[];
  lastSyncAt: string;
  recordsCount: number;
  syncInterval: string;
  healthRate: number; // percentage e.g. 99.8
}

export interface SystemIntegrationLog {
  id: string;
  systemId: string;
  systemName: string;
  timestamp: string;
  protocol: IntegrationProtocol;
  action: string;
  recordsCount: number;
  status: 'success' | 'warning' | 'error' | 'pending';
  details: string;
  durationMs: number;
  statusCode?: number;
}

export type ExportFormat = 'excel' | 'csv' | 'pdf' | 'word';

export interface ExportOptions {
  filename: string;
  title: string;
  subject?: string;
  columns: { key: string; title: string; width?: number }[];
  data: Record<string, any>[];
  department?: string;
  generatedBy?: string;
}

export interface OfficialDocTemplate {
  id: string;
  code: string;
  name: string;
  category: 'memo' | 'meeting_agenda' | 'meeting_minutes' | 'resolution_notice' | 'appointment_order' | 'action_plan_report';
  description: string;
  fields: {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'date' | 'select' | 'number';
    defaultValue: string;
    options?: string[];
  }[];
  defaultBodyHtml: string;
}
