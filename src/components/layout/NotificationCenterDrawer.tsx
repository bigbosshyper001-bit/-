import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  BookOpen,
  ShieldAlert,
  Target,
  FileText,
  Handshake,
  Cpu,
  Trash2,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';
import type {
  CentralNotification,
  NotificationCategory,
  NotificationPriorityLevel,
} from '../../types/notificationSystem.ts';
import type { AppRoute } from '../../types.ts';
import { Drawer } from '../ui/Drawer.tsx';
import { Button } from '../ui/Button.tsx';

export interface NotificationCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: CentralNotification[];
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  onDeleteNotification: (id: string) => void;
  onSelectNotification: (item: CentralNotification) => void;
  onNavigateToPreferences: () => void;
}

export const NotificationCenterDrawer: React.FC<NotificationCenterDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onMarkAsRead,
  onDeleteNotification,
  onSelectNotification,
  onNavigateToPreferences,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activePriority, setActivePriority] = useState<string>('all');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);

  // Category Icon Resolver
  const getCategoryIcon = (cat: NotificationCategory) => {
    switch (cat) {
      case 'Approval':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'Task':
        return <Clock className="w-4 h-4 text-[#B83B6F]" />;
      case 'Deadline':
        return <Clock className="w-4 h-4 text-rose-600" />;
      case 'Meeting':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'Document':
        return <FileText className="w-4 h-4 text-sky-600" />;
      case 'KPI':
        return <Target className="w-4 h-4 text-amber-600" />;
      case 'MOU':
        return <Handshake className="w-4 h-4 text-teal-600" />;
      case 'System':
        return <Cpu className="w-4 h-4 text-slate-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCategoryBadge = (cat: NotificationCategory) => {
    switch (cat) {
      case 'Approval':
        return { label: 'การอนุมัติ', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'Task':
        return { label: 'งานมอบหมาย', bg: 'bg-[#FBE7EF] text-[#B83B6F] border-[#F8CBDD]' };
      case 'Deadline':
        return { label: 'เดดไลน์', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'Meeting':
        return { label: 'การประชุม', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'Document':
        return { label: 'เอกสาร', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'KPI':
        return { label: 'KPI/แผน', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'MOU':
        return { label: 'MOU', bg: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'System':
        return { label: 'ระบบ', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  // Priority Styles
  const getPriorityBadge = (pri: NotificationPriorityLevel) => {
    switch (pri) {
      case 'Urgent':
        return { label: 'ด่วนที่สุด', bg: 'bg-red-500 text-white' };
      case 'Important':
        return { label: 'สำคัญ', bg: 'bg-amber-500 text-white' };
      case 'Normal':
        return { label: 'ปกติ', bg: 'bg-blue-100 text-blue-800' };
      case 'Info':
        return { label: 'แจ้งทราบ', bg: 'bg-slate-100 text-slate-600' };
    }
  };

  const filtered = notifications.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (activePriority !== 'all' && item.priority !== activePriority) return false;
    if (unreadOnly && item.read) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const categoriesList: { key: string; label: string }[] = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'Approval', label: 'การอนุมัติ' },
    { key: 'Task', label: 'งานมอบหมาย' },
    { key: 'Deadline', label: 'เดดไลน์' },
    { key: 'Meeting', label: 'การประชุม' },
    { key: 'Document', label: 'เอกสาร' },
    { key: 'KPI', label: 'KPI' },
    { key: 'MOU', label: 'MOU' },
    { key: 'System', label: 'ระบบ' },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="ศูนย์การแจ้งเตือนงานวิชาการ (Notification Center)"
      subtitle={`${unreadCount} รายการที่ยังไม่ได้อ่าน จากทั้งหมด ${notifications.length} รายการ`}
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              disabled={unreadCount === 0}
              leftIcon={<CheckCheck className="w-4 h-4 text-slate-600" />}
            >
              อ่านแล้วทั้งหมด
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onClose();
                onNavigateToPreferences();
              }}
              leftIcon={<SlidersHorizontal className="w-4 h-4 text-slate-600" />}
            >
              ตั้งค่าแจ้งเตือน
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            ปิด
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {categoriesList.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat.key
                  ? 'bg-[#B83B6F] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Secondary Filter: Unread Toggle & Priority Filter */}
        <div className="flex items-center justify-between gap-2 text-xs py-1 px-1 border-b border-slate-100">
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded border-slate-300 text-[#B83B6F] focus:ring-[#B83B6F]"
            />
            <span>แสดงเฉพาะที่ยังไม่ได้อ่าน</span>
          </label>

          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px]">ระดับ:</span>
            <select
              value={activePriority}
              onChange={(e) => setActivePriority(e.target.value)}
              aria-label="กรองระดับความสำคัญการแจ้งเตือน"
              className="text-xs bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700"
            >
              <option value="all">ทั้งหมด</option>
              <option value="Urgent">ด่วนที่สุด (Urgent)</option>
              <option value="Important">สำคัญ (Important)</option>
              <option value="Normal">ปกติ (Normal)</option>
              <option value="Info">แจ้งทราบ (Info)</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            ไม่พบรายการแจ้งเตือนตามเงื่อนไขที่ระบุ
          </div>
        ) : (
          filtered.map((item) => {
            const catBadge = getCategoryBadge(item.category);
            const priBadge = getPriorityBadge(item.priority);

            return (
              <div
                key={item.id}
                onClick={() => onSelectNotification(item)}
                className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer relative group ${
                  item.read
                    ? 'bg-white border-slate-100 hover:border-slate-200 opacity-85'
                    : 'bg-[#FCFDFE] border-slate-200 hover:border-[#D94F87]/50 shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Category Icon */}
                  <div className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {getCategoryIcon(item.category)}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header Row: Categories & Priority */}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${catBadge.bg}`}
                        >
                          {catBadge.label}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${priBadge.bg}`}
                        >
                          {priBadge.label}
                        </span>
                        {item.relatedRecordCode && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {item.relatedRecordCode}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-[#D94F87] shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h4>

                    {/* Message Body */}
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.message}
                    </p>

                    {/* Footer Row: Action link and controls */}
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-400 font-mono text-[10px]">
                        โมดูล: {item.relatedModule}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNotification(item.id);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors"
                          title="ลบการแจ้งเตือนนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="inline-flex items-center gap-1 text-[#B83B6F] hover:underline font-semibold">
                          เปิดรายการ <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Drawer>
  );
};

export default NotificationCenterDrawer;
