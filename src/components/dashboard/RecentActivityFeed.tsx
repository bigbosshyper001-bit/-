import React from 'react';
import {
  Activity,
  FileCheck,
  BookOpen,
  Target,
  FileText,
  ShieldAlert,
  Send,
  Clock,
  User,
} from 'lucide-react';
import type { RecentActivityItem } from '../../data/executiveDashboardData.ts';

export interface RecentActivityFeedProps {
  activities: RecentActivityItem[];
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities,
}) => {
  const getCategoryIcon = (category: RecentActivityItem['category']) => {
    switch (category) {
      case 'resolution':
        return <FileCheck className="w-3.5 h-3.5 text-blue-600" />;
      case 'risk':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />;
      case 'document':
        return <FileText className="w-3.5 h-3.5 text-teal-600" />;
      case 'kpi':
        return <Target className="w-3.5 h-3.5 text-purple-600" />;
      case 'curriculum':
        return <BookOpen className="w-3.5 h-3.5 text-emerald-600" />;
      case 'request':
        return <Send className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getCategoryBg = (category: RecentActivityItem['category']) => {
    switch (category) {
      case 'resolution':
        return 'bg-blue-50 border-blue-200';
      case 'risk':
        return 'bg-rose-50 border-rose-200';
      case 'document':
        return 'bg-teal-50 border-teal-200';
      case 'kpi':
        return 'bg-purple-50 border-purple-200';
      case 'curriculum':
        return 'bg-emerald-50 border-emerald-200';
      case 'request':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              ความเคลื่อนไหวล่าสุด (Recent Activities)
            </h3>
            <p className="text-xs text-slate-500">
              บันทึกกิจกรรมและเหตุการณ์สำคัญในระบบกองวิชาการ
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          ถ่ายทอดสด
        </span>
      </div>

      {activities.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg">
          <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-500">ยังไม่มีบันทึกกิจกรรมล่าสุดในระบบ</p>
          <p className="text-[11px] text-slate-400 mt-0.5">กิจกรรมจะแสดงเมื่อมีการดำเนินการต่างๆ ภายในระบบ</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {activities.map((act) => (
            <div key={act.id} className="relative group">
              {/* Timeline icon node */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center bg-white ${getCategoryBg(
                  act.category
                )}`}
              >
                {getCategoryIcon(act.category)}
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-slate-400" />
                    {act.user}
                    <span className="text-[11px] font-normal text-slate-400">
                      ({act.userRole})
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {act.timeAgo}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1">
                  <span className="font-semibold text-slate-800">{act.action}</span>
                  <span className="text-slate-400 mx-1">•</span>
                  <span className="text-slate-700">{act.target}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
