import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';
import type { MeetingNotification } from '../../data/meetingModuleData.ts';

export interface MeetingNotificationBannerProps {
  notifications: MeetingNotification[];
  onSelectNotification?: (notif: MeetingNotification) => void;
}

export const MeetingNotificationBanner: React.FC<MeetingNotificationBannerProps> = ({
  notifications,
  onSelectNotification,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (isDismissed || notifications.length === 0) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const primaryNotif = notifications[0];

  return (
    <div className="bg-white rounded-xl border border-amber-200/90 shadow-2xs overflow-hidden mb-5">
      <div className="p-3 sm:px-4 bg-amber-50/70 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
            <Bell className="w-3.5 h-3.5" />
          </span>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-amber-950">
                แจ้งเตือนงานและการประชุม ({unreadCount} รายการใหม่)
              </span>
              <span className="text-[10px] font-semibold bg-white border border-amber-200 text-amber-800 px-1.5 py-0.5 rounded">
                {primaryNotif.timestamp}
              </span>
            </div>
            <p className="text-slate-700 truncate mt-0.5">
              <span className="font-semibold text-amber-900">{primaryNotif.title}:</span>{' '}
              {primaryNotif.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-semibold text-amber-900 hover:text-amber-950 bg-white/80 hover:bg-white border border-amber-200 px-2.5 py-1 rounded-md transition-colors"
          >
            {expanded ? 'ย่อแจ้งเตือน' : 'ดูทั้งหมด'}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
            title="ปิดแถบแจ้งเตือน"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-3 sm:p-4 divide-y divide-slate-100 bg-white border-t border-amber-100 text-xs">
          {notifications.map((notif) => {
            const isOverdue = notif.type === 'overdue';
            const isSoon = notif.type === 'deadline_soon';

            return (
              <div
                key={notif.id}
                onClick={() => onSelectNotification?.(notif)}
                className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:bg-slate-50 rounded px-2 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isOverdue
                        ? 'bg-rose-500'
                        : isSoon
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 leading-snug">
                      {notif.title}
                    </p>
                    <p className="text-slate-600 text-[11px] truncate">
                      {notif.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {notif.timestamp}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
