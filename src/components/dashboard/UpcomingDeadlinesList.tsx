import React from 'react';
import { Clock, Calendar, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { AppRoute } from '../../types.ts';
import type { UpcomingDeadlineItem } from '../../data/executiveDashboardData.ts';

export interface UpcomingDeadlinesListProps {
  deadlines: UpcomingDeadlineItem[];
  onNavigate: (route: AppRoute) => void;
  onOpenDeadline: (deadline: UpcomingDeadlineItem) => void;
}

export const UpcomingDeadlinesList: React.FC<UpcomingDeadlinesListProps> = ({
  deadlines,
  onNavigate,
  onOpenDeadline,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              กำหนดการและเดดไลน์สำคัญ (Upcoming Deadlines)
            </h3>
            <p className="text-xs text-slate-500">
              ติดตามกำหนดส่งงาน หลักสูตร และมติสภาวิชาการ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/my-work')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100"
          >
            งานของฉัน
          </button>
          <button
            onClick={() => onNavigate('/calendar')}
            className="text-xs font-semibold text-[#B83B6F] hover:underline"
          >
            ปฏิทินงานทั้งหมด &rarr;
          </button>
        </div>
      </div>

      {/* Deadlines Timeline / List */}
      {deadlines.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg">
          <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-500">ไม่มีกำหนดการหรือเดดไลน์สำคัญในขณะนี้</p>
          <p className="text-[11px] text-slate-400 mt-0.5">งานและกำหนดส่งจะปรากฏเมื่อมีการมอบหมายหรือสร้างงานในระบบ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deadlines.map((item) => {
            // Semantic Colors
            let badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            let timeCol = 'text-emerald-700';

            if (item.urgencyLevel === 'red') {
              badgeStyles = 'bg-rose-50 text-rose-700 border-rose-200';
              timeCol = 'text-rose-700';
            } else if (item.urgencyLevel === 'orange') {
              badgeStyles = 'bg-amber-50 text-amber-700 border-amber-200';
              timeCol = 'text-amber-700';
            }

            return (
              <div
                key={item.id}
                onClick={() => onOpenDeadline(item)}
                className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Days Left Countdown Pill */}
                  <div
                    className={`px-2.5 py-1 rounded-md border text-center shrink-0 min-w-[75px] ${badgeStyles}`}
                  >
                    <span className="text-[10px] font-medium block">เหลือเวลา</span>
                    <span className={`text-xs font-extrabold ${timeCol} block`}>
                      {item.daysLeft} วัน
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#B83B6F] transition-colors leading-snug line-clamp-1">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        ครบกำหนด: {item.deadlineDate}
                      </span>
                      <span>•</span>
                      <span>{item.department}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 group-hover:text-slate-800 transition-colors shrink-0 self-end sm:self-center">
                  <span>จัดการงาน</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
