/**
 * Notification Engine
 * Supports:
 * - Triggers: Deadline, Overdue, Approval, Revision, New Assignment, Risk, Meeting, KPI
 * - Priorities: Critical, High, Normal
 * - Reactive subscription and target path resolution
 */

import type { SystemNotification, NotificationTriggerType, NotificationPriority, AppSystemRole } from '../types/architecture.ts';

const NOTIFICATION_STORAGE_KEY = 'mcu_system_notifications_v1';

// Real Notifications Store - Initialized Empty (No Mock Notifications)
const INITIAL_NOTIFICATIONS: SystemNotification[] = [];

let inMemoryNotifications: SystemNotification[] = (() => {
  try {
    const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return [...INITIAL_NOTIFICATIONS];
})();

const listeners = new Set<(notifs: SystemNotification[]) => void>();

function notify() {
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(inMemoryNotifications));
  } catch {
    // ignore
  }
  listeners.forEach((fn) => fn([...inMemoryNotifications]));
}

export const notificationEngine = {
  /**
   * Dispatch a new notification into the platform
   */
  dispatch(item: {
    title: string;
    description: string;
    trigger: NotificationTriggerType;
    priority?: NotificationPriority;
    module?: string;
    targetPath?: string;
    targetId?: string;
    recipientRoles?: AppSystemRole[];
    recipientUserId?: string;
    actionRequired?: boolean;
  }): SystemNotification {
    const newNotif: SystemNotification = {
      id: 'ntf-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      title: item.title,
      description: item.description,
      trigger: item.trigger,
      priority: item.priority || 'Normal',
      timestamp: 'เมื่อสักครู่',
      read: false,
      module: (item.module as any) || 'general',
      targetPath: item.targetPath,
      targetId: item.targetId,
      recipientRoles: item.recipientRoles,
      recipientUserId: item.recipientUserId,
      actionRequired: item.actionRequired ?? false,
    };

    inMemoryNotifications = [newNotif, ...inMemoryNotifications];
    notify();
    return newNotif;
  },

  /**
   * Get current notifications
   */
  getAll(): SystemNotification[] {
    return [...inMemoryNotifications];
  },

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return inMemoryNotifications.filter((n) => !n.read).length;
  },

  /**
   * Mark single notification as read
   */
  markAsRead(id: string): void {
    inMemoryNotifications = inMemoryNotifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    notify();
  },

  /**
   * Mark all as read
   */
  markAllAsRead(): void {
    inMemoryNotifications = inMemoryNotifications.map((n) => ({ ...n, read: true }));
    notify();
  },

  /**
   * Subscribe to notification updates
   */
  subscribe(callback: (notifications: SystemNotification[]) => void): () => void {
    listeners.add(callback);
    callback([...inMemoryNotifications]);
    return () => listeners.delete(callback);
  },

  /**
   * Reset to initial state
   */
  resetToDemo(): void {
    inMemoryNotifications = [...INITIAL_NOTIFICATIONS];
    notify();
  },
};
