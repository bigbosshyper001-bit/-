import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Target,
  Handshake,
  Award,
  BookOpenCheck,
  GraduationCap,
  Users,
  ShieldCheck,
  FileSpreadsheet,
  FolderArchive,
  BarChart3,
  Network,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserCog,
  Shield,
  Key,
  GitPullRequest,
  Calendar,
  Layers,
  Bell,
  Activity,
  Database,
  HardDrive,
  Upload,
  Plus,
} from 'lucide-react';
import type { AppRoute, NavItem, UserProfile } from '../../types.ts';
import { McuLogo } from '../common/McuLogo.tsx';
import { Tooltip } from '../ui/Tooltip.tsx';
import { rbacService } from '../../services/rbacService.ts';

export interface SidebarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  user?: UserProfile;
  className?: string;
}

export const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    iconName: 'dashboard',
    group: 'หลัก',
  },
  {
    id: 'my-work',
    label: 'งานของฉัน',
    path: '/my-work',
    iconName: 'my-work',
    group: 'หลัก',
  },
  {
    id: 'calendar',
    label: 'ปฏิทินงานวิชาการ',
    path: '/calendar',
    iconName: 'calendar',
    group: 'หลัก',
  },
  {
    id: 'meetings',
    label: 'การประชุมและมติ',
    path: '/meetings',
    iconName: 'meetings',
    badge: 3,
    badgeAccent: 'orange',
    group: 'บริหารวิชาการ',
  },
  {
    id: 'strategy',
    label: 'แผน / KPI / งบประมาณ / Risk',
    path: '/strategy',
    iconName: 'strategy',
    group: 'บริหารวิชาการ',
  },
  {
    id: 'workflows',
    label: 'กระบวนการและอนุมัติ',
    path: '/workflows',
    iconName: 'workflows',
    badge: 'ระบบงาน',
    badgeAccent: 'pink',
    group: 'บริหารวิชาการ',
  },
  {
    id: 'collaboration',
    label: 'หลักสูตรความร่วมมือ',
    path: '/collaboration',
    iconName: 'collaboration',
    group: 'หลักสูตรและการศึกษา',
  },
  {
    id: 'courses',
    label: 'Short Course / Non-degree',
    path: '/courses',
    iconName: 'courses',
    group: 'หลักสูตรและการศึกษา',
  },
  {
    id: 'pre-degree',
    label: 'Pre-degree',
    path: '/pre-degree',
    iconName: 'pre-degree',
    group: 'หลักสูตรและการศึกษา',
  },
  {
    id: 'credit-bank',
    label: 'Credit Bank',
    path: '/credit-bank',
    iconName: 'credit-bank',
    badge: 'ใหม่',
    badgeAccent: 'teal',
    group: 'หลักสูตรและการศึกษา',
  },
  {
    id: 'faculty',
    label: 'อาจารย์และสมรรถนะ',
    path: '/faculty',
    iconName: 'faculty',
    group: 'บุคลากรวิชาการ',
  },
  {
    id: 'regulatory',
    label: 'Regulatory',
    path: '/regulatory',
    iconName: 'regulatory',
    group: 'มาตรฐานและกำกับ',
  },
  {
    id: 'forms',
    label: 'แบบฟอร์มออนไลน์',
    path: '/forms',
    iconName: 'forms',
    group: 'บริการและเอกสาร',
  },
  {
    id: 'documents',
    label: 'เอกสารกลาง',
    path: '/documents',
    iconName: 'documents',
    group: 'บริการและเอกสาร',
  },
  {
    id: 'reports',
    label: 'รายงาน',
    path: '/reports',
    iconName: 'reports',
    group: 'สารสนเทศ',
  },
  {
    id: 'users',
    label: 'จัดการผู้ใช้งาน',
    path: '/users',
    iconName: 'users-management',
    group: 'ความปลอดภัยและสิทธิ์',
  },
  {
    id: 'settings-roles',
    label: 'บทบาทและสิทธิ์ (RBAC)',
    path: '/settings/roles',
    iconName: 'roles-matrix',
    group: 'ความปลอดภัยและสิทธิ์',
  },
  {
    id: 'integrations',
    label: 'Integration',
    path: '/integrations',
    iconName: 'integrations',
    group: 'ระบบ',
  },
  {
    id: 'master-data',
    label: 'ศูนย์ข้อมูลกลาง',
    path: '/master-data',
    iconName: 'master-data',
    group: 'ระบบ',
  },
  {
    id: 'data-import',
    label: 'นำเข้าข้อมูลเดิม',
    path: '/import',
    iconName: 'data-import',
    badge: 'Excel/CSV',
    badgeAccent: 'pink',
    group: 'ระบบ',
  },
  {
    id: 'data-management',
    label: 'จัดการข้อมูลและถังขยะ',
    path: '/data-management',
    iconName: 'data-persistence',
    group: 'ระบบ',
  },
  {
    id: 'system-health',
    label: 'สถานะระบบ (Health)',
    path: '/admin/system-health',
    iconName: 'system-health',
    group: 'ระบบ',
  },
  {
    id: 'settings',
    label: 'ตั้งค่าระบบ',
    path: '/settings',
    iconName: 'settings',
    group: 'ระบบ',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  user,
  className = '',
}) => {
  const filteredNavItems = navItems.filter((item) => {
    if (!user) return true;
    return rbacService.canRoute(user, item.path);
  });

  const renderNavIcon = (name: string, isActive: boolean) => {
    const iconClass = `w-4.5 h-4.5 shrink-0 transition-colors duration-150 ${
      isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#E11463]'
    }`;

    switch (name) {
      case 'dashboard':
        return <LayoutDashboard className={iconClass} />;
      case 'my-work':
        return <Layers className={iconClass} />;
      case 'calendar':
        return <Calendar className={iconClass} />;
      case 'meetings':
        return <CalendarCheck className={iconClass} />;
      case 'strategy':
        return <Target className={iconClass} />;
      case 'workflows':
        return <GitPullRequest className={iconClass} />;
      case 'collaboration':
        return <Handshake className={iconClass} />;
      case 'courses':
        return <Award className={iconClass} />;
      case 'pre-degree':
        return <BookOpenCheck className={iconClass} />;
      case 'credit-bank':
        return <GraduationCap className={iconClass} />;
      case 'faculty':
        return <Users className={iconClass} />;
      case 'regulatory':
        return <ShieldCheck className={iconClass} />;
      case 'forms':
        return <FileSpreadsheet className={iconClass} />;
      case 'documents':
        return <FolderArchive className={iconClass} />;
      case 'reports':
        return <BarChart3 className={iconClass} />;
      case 'users-management':
        return <UserCog className={iconClass} />;
      case 'roles-matrix':
        return <Shield className={iconClass} />;
      case 'integrations':
        return <Network className={iconClass} />;
      case 'system-health':
        return <Activity className={iconClass} />;
      case 'data-persistence':
        return <HardDrive className={iconClass} />;
      case 'data-import':
        return <Upload className={iconClass} />;
      case 'master-data':
        return <Database className={iconClass} />;
      case 'settings':
        return <Settings className={iconClass} />;
      default:
        return <LayoutDashboard className={iconClass} />;
    }
  };

  return (
    <aside
      id="main-sidebar"
      className={`relative flex flex-col bg-white border-r border-[#FFDCE8] h-screen transition-all duration-200 z-30 select-none shrink-0 ${
        isCollapsed ? 'w-[72px]' : 'w-[268px]'
      } ${className}`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#FFF0F5] bg-white">
        <div className="flex items-center overflow-hidden">
          <McuLogo size="md" showText={!isCollapsed} />
        </div>

        {!isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#FFF0F5] transition-colors"
            title="ย่อแถบเมนู (Collapse)"
            aria-label="ย่อแถบเมนู"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 no-scrollbar">
        {filteredNavItems.map((item, index) => {
          const isActive = currentRoute === item.path;
          const prevItem = index > 0 ? filteredNavItems[index - 1] : null;
          const isNewGroup = !prevItem || prevItem.group !== item.group;

          const buttonContent = (
            <button
              type="button"
              onClick={() => onNavigate(item.path)}
              className={`group relative w-full flex items-center rounded-xl transition-all duration-150 text-xs font-medium cursor-pointer ${
                isCollapsed ? 'justify-center p-2.5 h-10' : 'px-3 py-2.5 gap-3'
              } ${
                isActive
                  ? 'bg-[#E11463] text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-[#FFF0F5] hover:text-[#E11463]'
              }`}
            >
              {renderNavIcon(item.iconName, isActive)}

              {!isCollapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {!isCollapsed && item.badge !== undefined && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.badgeAccent === 'orange'
                      ? 'bg-[#FEF5EA] text-[#A36817] border border-[#F9DCB4]'
                      : item.badgeAccent === 'teal'
                      ? 'bg-[#E6F6F6] text-[#0E6A6A] border border-[#BFE7E7]'
                      : 'bg-[#FFE4EE] text-[#E11463]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );

          return (
            <React.Fragment key={item.id}>
              {isNewGroup && index > 0 && (
                isCollapsed ? (
                  <div className="my-2 border-t border-slate-100" />
                ) : (
                  <div className="pt-3 pb-1 px-3 text-[10px] font-semibold text-slate-400 select-none">
                    {item.group}
                  </div>
                )
              )}

              {isCollapsed ? (
                <Tooltip content={item.label} position="right">
                  {buttonContent}
                </Tooltip>
              ) : (
                buttonContent
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Design System Quick Access Link */}
      <div className="p-2 border-t border-[#FFDCE8] bg-white">
        {isCollapsed ? (
          <Tooltip content="Design System & Component Library" position="right">
            <button
              type="button"
              onClick={() => onNavigate('/design-system')}
              className={`w-full flex items-center justify-center p-2 rounded-xl text-slate-500 hover:bg-[#FFF0F5] hover:text-[#E11463] transition-colors ${
                currentRoute === '/design-system' ? 'bg-[#FFE4EE] text-[#E11463]' : ''
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#E11463]" />
            </button>
          </Tooltip>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate('/design-system')}
            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
              currentRoute === '/design-system'
                ? 'bg-[#FFE4EE] text-[#E11463] border-[#FFD0E2]'
                : 'bg-white text-slate-500 border-slate-100 hover:bg-[#FFF0F5] hover:text-[#E11463]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E11463] shrink-0" />
            <span className="truncate">Design System Showcase</span>
          </button>
        )}
      </div>

      {/* Bottom Action Area (Matching Screenshot's prominent pink action button) */}
      <div className="p-3 border-t border-[#FFDCE8] bg-white">
        {isCollapsed ? (
          <Tooltip content="เพิ่มรายการใหม่" position="right">
            <button
              type="button"
              onClick={() => onNavigate('/meetings')}
              className="w-full h-10 rounded-xl bg-[#E11463] hover:bg-[#C80C54] text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-5 h-5" />
            </button>
          </Tooltip>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate('/meetings')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#E11463] hover:bg-[#C80C54] text-white font-medium text-xs shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>+ เพิ่มรายการใหม่</span>
          </button>
        )}
      </div>

      {/* Collapsed Expand Toggle at bottom */}
      {isCollapsed && (
        <div className="p-2 border-t border-[#FFDCE8] flex justify-center bg-white">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-[#FFF0F5] transition-colors"
            title="ขยายแถบเมนู (Expand)"
            aria-label="ขยายแถบเมนู"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
};
