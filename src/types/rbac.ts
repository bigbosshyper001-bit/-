/**
 * Role-Based Access Control (RBAC) Types
 * Defined for "กองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
 */

import type { UserProfile } from '../types.ts';

export type StandardPermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'export'
  | 'manage';

export type RBACModuleKey =
  | 'meeting'
  | 'kpi'
  | 'curriculum'
  | 'credit_bank'
  | 'faculty'
  | 'regulatory'
  | 'documents'
  | 'reports'
  | 'forms'
  | 'users'
  | 'roles'
  | 'workflows'
  | 'integrations'
  | 'settings';

export interface PermissionDefinition {
  id: string; // e.g. 'meeting.view', 'documents.upload'
  module: RBACModuleKey;
  action: StandardPermissionAction | 'upload' | 'download';
  labelTh: string;
  descriptionTh: string;
}

export interface ModulePermissionMatrixRow {
  moduleKey: RBACModuleKey;
  moduleLabelTh: string;
  moduleLabelEn: string;
  category: string;
  actions: {
    view?: string;
    create?: string;
    edit?: string;
    delete?: string;
    approve?: string;
    export?: string;
  };
}

export interface RoleDefinition {
  id: string; // e.g. 'role-super-admin', 'role-executive'
  name: string; // 'Super Admin', 'ผู้บริหาร', 'หัวหน้ากอง', 'เจ้าหน้าที่', 'ผู้ตรวจสอบ', 'ผู้ใช้งานทั่วไป'
  nameEn: string;
  description: string;
  isSystem: boolean; // Cannot delete default 6 roles
  badgeClass: string;
  permissions: string[];
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SystemUserAccount extends UserProfile {
  username: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  createdDate: string;
  updatedDate: string;
  lastLogin: string;
  customPermissions?: string[]; // Extra permissions granted explicitly
  deniedPermissions?: string[]; // Permissions revoked explicitly
}

export interface PermissionCheckResult {
  granted: boolean;
  reason: 'SUPER_ADMIN' | 'EXPLICIT_GRANT' | 'EXPLICIT_DENIAL' | 'ROLE_PERMISSION' | 'NOT_PERMITTED';
  matchedRule?: string;
}
