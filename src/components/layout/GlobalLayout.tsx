import React, { useState, useEffect } from 'react';
import type { AppRoute, UserProfile, NotificationItem } from '../../types.ts';
import type { CentralNotification } from '../../types/notificationSystem.ts';
import { Sidebar } from './Sidebar.tsx';
import { TopNav } from './TopNav.tsx';
import { NotificationCenterDrawer } from './NotificationCenterDrawer.tsx';
import { HelpModal } from './HelpModal.tsx';
import { CommandPalette } from '../ui/CommandPalette.tsx';
import { AuditLogDrawer } from '../common/AuditLogDrawer.tsx';
import { RoleSwitcherModal } from '../common/RoleSwitcherModal.tsx';
import { MobileBottomNav } from './MobileBottomNav.tsx';
import { useToast } from '../ui/Toast.tsx';
import { centralProactiveService } from '../../services/centralProactiveService.ts';
import { Info, X } from 'lucide-react';

export interface GlobalLayoutProps {
  children: React.ReactNode;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  user: UserProfile;
  onLogout: () => void;
  onSwitchUser?: (user: UserProfile) => void;
}

export const GlobalLayout: React.FC<GlobalLayoutProps> = ({
  children,
  currentRoute,
  onNavigate,
  user,
  onLogout,
  onSwitchUser,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<CentralNotification[]>(() =>
    centralProactiveService.getNotifications()
  );

  // Subscribe to central Proactive Service
  useEffect(() => {
    const unsub = centralProactiveService.subscribe(() => {
      setNotifications(centralProactiveService.getNotifications());
    });
    return unsub;
  }, []);

  const handleMarkAllAsRead = () => {
    centralProactiveService.markAllAsRead();
    showToast('success', 'ปรับสถานะการแจ้งเตือน', 'ทำเครื่องหมายว่าอ่านแล้วทั้งหมดเรียบร้อย');
  };

  const handleMarkAsRead = (id: string) => {
    centralProactiveService.markAsRead(id);
  };

  const handleDeleteNotification = (id: string) => {
    centralProactiveService.deleteNotification(id);
    showToast('info', 'ลบการแจ้งเตือน', 'นำรายการแจ้งเตือนออกจากระบบเรียบร้อย');
  };

  const handleSelectNotification = (item: CentralNotification) => {
    centralProactiveService.markAsRead(item.id);
    setIsNotificationsOpen(false);
    if (item.actionLink) {
      onNavigate(item.actionLink as AppRoute);
    }
  };

  const handleQuickAction = (actionId: string, title: string) => {
    showToast('info', 'เรียกใช้งานคำสั่ง', `เปิดหน้าต่าง "${title}" สำหรับบันทึกข้อมูล`);
    // Depending on action, optionally route to relevant module
    if (actionId === 'create-meeting') onNavigate('/meetings');
    else if (actionId === 'create-kpi') onNavigate('/strategy');
    else if (actionId === 'create-curriculum') onNavigate('/courses');
    else if (actionId === 'create-risk') onNavigate('/strategy');
    else if (actionId === 'upload-document') onNavigate('/documents');
  };

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when mobile sidebar is open
  React.useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileSidebarOpen]);

  return (
    <div className="flex h-screen w-full bg-[#FAFAFC] overflow-hidden text-slate-800">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={onNavigate}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          user={user}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex-1 max-w-[280px] bg-white h-full z-10 shadow-lg border-r border-[#FFDCE8]">
            <Sidebar
              currentRoute={currentRoute}
              onNavigate={(route) => {
                onNavigate(route);
                setIsMobileSidebarOpen(false);
              }}
              isCollapsed={false}
              onToggleCollapse={() => setIsMobileSidebarOpen(false)}
              user={user}
            />
          </div>
        </div>
      )}

      {/* Main App Canvas */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <TopNav
          currentRoute={currentRoute}
          onNavigate={onNavigate}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
          onOpenAuditLogs={() => setIsAuditLogOpen(true)}
          onLogout={onLogout}
          user={user}
          unreadCount={notifications.filter((n) => !n.read).length}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Main Scrollable View */}
        <main className="flex-1 overflow-y-auto bg-[#FFF5F8] p-3.5 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          currentRoute={currentRoute}
          onNavigate={onNavigate}
          pendingCount={notifications.filter((n) => !n.read).length}
          onOpenQuickAction={() => setIsCommandPaletteOpen(true)}
          onOpenSearch={() => setIsCommandPaletteOpen(true)}
        />
      </div>

      {/* Global Modals & Drawers */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={onNavigate}
        onQuickAction={handleQuickAction}
      />

      <NotificationCenterDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllAsRead}
        onMarkAsRead={handleMarkAsRead}
        onDeleteNotification={handleDeleteNotification}
        onSelectNotification={handleSelectNotification}
        onNavigateToPreferences={() => onNavigate('/settings/notifications')}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <AuditLogDrawer
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
      />

      <RoleSwitcherModal
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
        currentUser={user}
        onSelectRole={(newUser) => {
          if (onSwitchUser) {
            onSwitchUser(newUser);
          }
          showToast('success', 'สลับบทบาทสำเร็จ', `เข้าสู่ระบบในฐานะ "${newUser.name}" (${newUser.role})`);
        }}
      />
    </div>
  );
};
