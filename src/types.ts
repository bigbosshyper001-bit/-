import type React from 'react';
import type { LucideIcon } from 'lucide-react';
import type { SemanticAccent } from './design-tokens.ts';

export type AppRoute =
  | '/login'
  | '/dashboard'
  | '/meetings'
  | '/strategy'
  | '/collaboration'
  | '/courses'
  | '/pre-degree'
  | '/credit-bank'
  | '/faculty'
  | '/regulatory'
  | '/forms'
  | '/documents'
  | '/reports'
  | '/integrations'
  | '/users'
  | '/settings/roles'
  | '/workflows'
  | '/calendar'
  | '/my-work'
  | '/settings/notifications'
  | '/admin/system-health'
  | '/data-management'
  | '/import'
  | '/master-data'
  | '/settings'
  | '/design-system';

export interface NavItem {
  id: string;
  label: string;
  path: AppRoute;
  iconName: string;
  badge?: string | number;
  badgeAccent?: SemanticAccent;
  group?: string;
  description?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  position: string;
  department: string;
  email: string;
  avatarUrl?: string;
  initials: string;
  username?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'suspended';
  createdDate?: string;
  updatedDate?: string;
  lastLogin?: string;
  customPermissions?: string[];
  deniedPermissions?: string[];
}

export interface BreadcrumbItem {
  label: string;
  path?: AppRoute;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  category: 'meeting' | 'curriculum' | 'regulatory' | 'kpi' | 'system';
  accent: SemanticAccent;
  targetPath?: AppRoute;
}

export interface CommandPaletteAction {
  id: string;
  title: string;
  subtitle?: string;
  category: 'การสร้างรายการใหม่' | 'การเข้าถึงด่วน' | 'ข้อมูลระบบ' | 'เครื่องมือ';
  shortcut?: string;
  accent?: SemanticAccent;
  iconName: string;
  onSelect: () => void;
}

export type StatusType =
  | 'approved'
  | 'pending'
  | 'overdue'
  | 'in-progress'
  | 'draft'
  | 'archived'
  | 'active'
  | 'inactive';

export interface StatusConfig {
  label: string;
  accent: SemanticAccent;
  iconName: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export * from './types/architecture.ts';
export * from './types/rbac.ts';
