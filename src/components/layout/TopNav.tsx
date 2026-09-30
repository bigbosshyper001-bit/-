import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  HelpCircle,
  ChevronRight,
  User,
  LogOut,
  Settings,
  Shield,
  Menu,
  CheckCircle2,
  ExternalLink,
  Keyboard,
  UserCog,
} from 'lucide-react';
import type { AppRoute, BreadcrumbItem, UserProfile } from '../../types.ts';
import { Tooltip } from '../ui/Tooltip.tsx';
import { navItems } from './Sidebar.tsx';
import { rbacService } from '../../services/rbacService.ts';

export interface TopNavProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  onOpenCommandPalette: () => void;
  onOpenNotifications: () => void;
  onOpenHelp: () => void;
  onOpenRoleSwitcher?: () => void;
  onOpenAuditLogs?: () => void;
  onLogout: () => void;
  user: UserProfile;
  unreadCount?: number;
  onToggleMobileSidebar?: () => void;
  className?: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentRoute,
  onNavigate,
  onOpenCommandPalette,
  onOpenNotifications,
  onOpenHelp,
  onOpenRoleSwitcher,
  onOpenAuditLogs,
  onLogout,
  user,
  unreadCount = 3,
  onToggleMobileSidebar,
  className = '',
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute Breadcrumb from currentRoute
  const getBreadcrumb = (): BreadcrumbItem[] => {
    const matched = navItems.find((item) => item.path === currentRoute);
    if (currentRoute === '/dashboard') {
      return [{ label: 'กองวิชาการ', path: '/dashboard' }, { label: 'Dashboard' }];
    }
    if (currentRoute === '/design-system') {
      return [{ label: 'กองวิชาการ', path: '/dashboard' }, { label: 'Design System Showcase' }];
    }
    if (matched) {
      return [
        { label: 'กองวิชาการ', path: '/dashboard' },
        ...(matched.group ? [{ label: matched.group }] : []),
        { label: matched.label },
      ];
    }
    return [{ label: 'กองวิชาการ', path: '/dashboard' }];
  };

  const breadcrumbs = getBreadcrumb();

  return (
    <header
      id="main-top-navigation"
      className={`h-16 bg-white border-b border-[#FFDCE8] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 select-none ${className}`}
    >
      {/* Left side: Mobile burger & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-[#FFF0F5] hover:text-[#E11463] transition-colors"
            aria-label="เปิดเมนู"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Institutional Breadcrumb */}
        <nav className="flex items-center space-x-1.5 text-xs text-slate-500 truncate" aria-label="Breadcrumb">
          {/* Mobile view: show only current page title */}
          <span className="sm:hidden font-semibold text-slate-900 truncate max-w-[150px]">
            {breadcrumbs[breadcrumbs.length - 1]?.label || 'กองวิชาการ'}
          </span>

          {/* Tablet & Desktop view: show full breadcrumb chain */}
          <div className="hidden sm:flex items-center space-x-1.5 truncate">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                  {isLast ? (
                    <span className="font-semibold text-slate-900 truncate">
                      {crumb.label}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => crumb.path && onNavigate(crumb.path)}
                      className="hover:text-[#E11463] hover:underline transition-colors truncate"
                    >
                      {crumb.label}
                    </button>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Middle/Right: Global Search */}
      <div className="flex-1 max-w-md mx-2 hidden md:block">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs bg-[#FFF5F8] hover:bg-[#FFF0F5] text-slate-500 rounded-xl border border-[#FFDCE8] hover:border-[#E11463]/40 transition-all duration-150 cursor-pointer shadow-2xs group"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E11463] transition-colors" />
            <span className="truncate">ค้นหาการประชุม, KPI, หลักสูตร, อาจารย์, เอกสาร...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono text-slate-400 bg-white border border-[#FFDCE8] rounded px-1.5 py-0.5 shadow-2xs shrink-0">
            <span>⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right Action Icons: Notification, Help, Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile search icon */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-[#FFF0F5] hover:text-[#E11463] transition-colors"
          title="ค้นหา"
        >
          <Search className="w-4.5 h-4.5" />
        </button>

        {/* Notification button */}
        <Tooltip content="การแจ้งเตือนงานวิชาการ" position="bottom">
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-500 hover:text-[#E11463] hover:bg-[#FFF0F5] transition-colors cursor-pointer"
            aria-label="การแจ้งเตือน"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E11463] ring-2 ring-white" />
            )}
          </button>
        </Tooltip>

        {/* Help button */}
        <Tooltip content="คู่มือและการช่วยเหลือ" position="bottom">
          <button
            type="button"
            onClick={onOpenHelp}
            className="p-2 rounded-xl text-slate-500 hover:text-[#E11463] hover:bg-[#FFF0F5] transition-colors cursor-pointer"
            aria-label="คู่มือและการช่วยเหลือ"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </button>
        </Tooltip>

        <div className="h-5 w-px bg-[#FFDCE8] mx-1 hidden sm:block" />

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#FFF0F5] transition-colors cursor-pointer"
            aria-expanded={isProfileMenuOpen}
          >
            <div className="w-8 h-8 rounded-full bg-[#FFE4EE] text-[#E11463] border border-[#FFD0E2] flex items-center justify-center text-xs font-bold shrink-0">
              {user.initials}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 truncate max-w-[130px] leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-500 truncate max-w-[130px]">
                {user.position}
              </span>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100">
              <div className="px-4 py-3 bg-[#FAFAFC]">
                <p className="text-xs font-semibold text-slate-900 leading-tight">{user.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{user.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FBE7EF] text-[#B83B6F] rounded text-[10px] font-medium border border-[#F8CBDD]">
                  <Shield className="w-3 h-3 text-[#D94F87]" />
                  <span>{user.role}</span>
                </div>
              </div>

              <div className="py-1">
                {onOpenRoleSwitcher && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenRoleSwitcher();
                    }}
                    className="w-full px-4 py-2 text-xs text-[#B83B6F] hover:bg-[#FBE7EF]/50 flex items-center gap-2.5 transition-colors font-medium"
                  >
                    <Shield className="w-4 h-4 text-[#D94F87]" />
                    <span>สลับบทบาทผู้ใช้ (RBAC 8 บทบาท)</span>
                  </button>
                )}
                {onOpenAuditLogs && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenAuditLogs();
                    }}
                    className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>ประวัติแก้ไขระบบ (Audit Trail)</span>
                  </button>
                )}
                {rbacService.can(user, 'users.view') && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('/users');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                  >
                    <UserCog className="w-4 h-4 text-[#D94F87]" />
                    <span>การจัดการผู้ใช้งาน (Users)</span>
                  </button>
                )}
                {rbacService.can(user, 'roles.view') && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('/settings/roles');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-[#D94F87]" />
                    <span>บทบาทและสิทธิ์ (Permission Matrix)</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('/settings/notifications');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                >
                  <Bell className="w-4 h-4 text-[#D94F87]" />
                  <span>ตั้งค่าการแจ้งเตือน (Notifications)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('/settings');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>ตั้งค่าโปรไฟล์และระบบ</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenCommandPalette();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                >
                  <Keyboard className="w-4 h-4 text-slate-400" />
                  <span>Command Palette (⌘K)</span>
                </button>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-2 text-xs text-[#A32828] hover:bg-[#FDEDED]/40 flex items-center gap-2.5 transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4 text-[#D64545]" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
