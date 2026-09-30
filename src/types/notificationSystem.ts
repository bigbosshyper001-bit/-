/**
 * Centralized Notification, Deadline, Calendar and Reminder Types
 * For "กองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
 */

import type { AppRoute } from '../types.ts';

// 8 Notification Categories
export type NotificationCategory =
  | 'Approval'
  | 'Task'
  | 'Deadline'
  | 'Meeting'
  | 'Document'
  | 'KPI'
  | 'MOU'
  | 'System';

// 4 Notification Priorities
export type NotificationPriorityLevel =
  | 'Info'
  | 'Normal'
  | 'Important'
  | 'Urgent';

export interface CentralNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriorityLevel;
  relatedModule: string; // e.g. 'meetings', 'strategy', 'documents', 'collaboration', 'workflows'
  relatedRecordId?: string;
  relatedRecordCode?: string;
  relatedRecordTitle?: string;
  actionLink: AppRoute | string;
  timestamp: string; // ISO or formatted
  createdAtIso: string;
  read: boolean;
  actionRequired?: boolean;
  metadata?: Record<string, any>;
}

// Deadline Record Contract
export interface DeadlineRecord {
  id: string;
  title: string;
  description?: string;
  module: string; // 'meetings', 'strategy', 'collaboration', 'documents', 'workflows', 'courses', 'faculty'
  recordId: string;
  recordCode?: string;
  recordTitle?: string;
  startDate: string; // YYYY-MM-DD
  dueDate: string;   // YYYY-MM-DD
  responsiblePerson: string;
  responsiblePersonId?: string;
  department: string;
  status: 'pending' | 'in_progress' | 'in_review' | 'completed' | 'overdue';
  priority: NotificationPriorityLevel;
  category: NotificationCategory;
  actionLink: AppRoute | string;
  reminderRuleIds?: string[];
}

export type DeadlineUrgencyStatus =
  | 'overdue'       // เกินกำหนด X วัน
  | 'today'         // วันนี้
  | 'due_soon_1'    // เหลือ 1 วัน
  | 'due_soon_3'    // เหลือ 3 วัน
  | 'due_soon_7'    // เหลือ 7 วัน
  | 'due_soon_14'   // เหลือ 14 วัน
  | 'due_soon_30'   // เหลือ 30 วัน
  | 'normal';       // ปกติ

export interface DeadlineCalculation {
  daysDiff: number; // positive = days remaining, 0 = today, negative = overdue
  urgencyStatus: DeadlineUrgencyStatus;
  badgeLabel: string; // e.g. "เหลือ 14 วัน", "วันนี้", "เกินกำหนด 2 วัน"
  badgeClass: string;
  colorHex: string;
}

// Reminder Rules
export type ReminderOffsetType =
  | 'before_30_days'
  | 'before_14_days'
  | 'before_7_days'
  | 'before_3_days'
  | 'before_1_day'
  | 'on_due_date'
  | 'after_overdue';

export interface ReminderRule {
  id: string;
  name: string;
  description: string;
  offsetDays: number; // positive for before, 0 for on due date, negative for after overdue
  type: ReminderOffsetType | 'custom';
  enabled: boolean;
  notificationPriority: NotificationPriorityLevel;
}

// Calendar Items
export type CalendarItemType =
  | 'Meeting'
  | 'Deadline'
  | 'Approval'
  | 'KPI milestone'
  | 'MOU expiration'
  | 'Document expiration'
  | 'Task'
  | 'Course milestone';

export interface CalendarEventItem {
  id: string;
  title: string;
  description?: string;
  type: CalendarItemType;
  date: string; // YYYY-MM-DD
  timeStart?: string; // HH:mm
  timeEnd?: string;   // HH:mm
  module: string;
  recordId: string;
  recordCode?: string;
  locationOrVenue?: string;
  responsiblePerson?: string;
  department?: string;
  priority: NotificationPriorityLevel;
  status?: string;
  actionLink: AppRoute | string;
}

// User Notification Preferences (/settings/notifications)
export interface UserNotificationPreferences {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  emailDestination?: string;
  digestFrequency: 'immediate' | 'daily_digest' | 'weekly_summary';
  reminderRules: {
    ruleId: string;
    enabled: boolean;
  }[];
  enabledCategories: Record<NotificationCategory, boolean>;
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // e.g. "20:00"
  quietHoursEnd?: string;   // e.g. "07:00"
  groupDuplicates: boolean;
}
