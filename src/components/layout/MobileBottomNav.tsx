import React from 'react';
import type { AppRoute } from '../../types.ts';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Layers,
  Sparkles,
  Search,
  Plus,
} from 'lucide-react';

export interface MobileBottomNavProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  pendingCount?: number;
  onOpenQuickAction?: () => void;
  onOpenSearch?: () => void;
}

interface NavItemConfig {
  id: string;
  label: string;
  route: AppRoute;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentRoute,
  onNavigate,
  pendingCount = 0,
  onOpenQuickAction,
  onOpenSearch,
}) => {
  const navItems: NavItemConfig[] = [
    {
      id: 'dashboard',
      label: 'แดชบอร์ด',
      route: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'my-work',
      label: 'งานของฉัน',
      route: '/my-work',
      icon: CheckSquare,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      id: 'calendar',
      label: 'ปฏิทินงาน',
      route: '/calendar',
      icon: Calendar,
    },
    {
      id: 'workflows',
      label: 'อนุมัติงาน',
      route: '/workflows',
      icon: Layers,
    },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="เมนูหลักด้านล่างสำหรับมือถือ"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 pb-[max(env(safe-area-inset-bottom,0px),8px)] pt-1.5 transition-all"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.route;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.route)}
              className={`flex flex-col items-center justify-center min-w-[60px] min-h-[48px] py-1 px-2 rounded-xl transition-all relative ${
                isActive
                  ? 'text-[#B83B6F]'
                  : 'text-slate-500 hover:text-slate-800 active:scale-95'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative flex items-center justify-center w-7 h-7">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-[#B83B6F] stroke-[2.2]' : 'stroke-[1.8]'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#D94F87] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${
                  isActive ? 'font-bold text-[#B83B6F]' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-[#B83B6F]" />
              )}
            </button>
          );
        })}

        {/* Quick Action FAB on Mobile */}
        {onOpenQuickAction && (
          <button
            type="button"
            onClick={onOpenQuickAction}
            className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-1.5 rounded-xl text-slate-500 hover:text-[#B83B6F] active:scale-95 transition-all"
            aria-label="สร้างรายการใหม่"
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#FBE7EF] text-[#B83B6F] border border-[#F8CBDD] shadow-2xs">
              <Plus className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-0.5 whitespace-nowrap">
              สร้างงาน
            </span>
          </button>
        )}
      </div>
    </nav>
  );
};
