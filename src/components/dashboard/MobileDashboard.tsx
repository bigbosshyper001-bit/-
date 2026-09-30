import React, { useState } from 'react';
import {
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Calendar,
  FileCheck,
  ChevronRight,
  ChevronDown,
  Target,
  BarChart3,
  MapPin,
  User,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  Layers,
} from 'lucide-react';
import type { AppRoute } from '../../types.ts';
import type {
  DashboardKPI,
  ActionPlanItem,
  RiskItem,
  PendingApprovalItem,
  UpcomingDeadlineItem,
  MeetingItem,
} from '../../data/executiveDashboardData.ts';

export interface MobileDashboardProps {
  kpis: DashboardKPI[];
  actionPlans: ActionPlanItem[];
  risks: RiskItem[];
  pendingApprovals: PendingApprovalItem[];
  deadlines: UpcomingDeadlineItem[];
  meetings?: MeetingItem[];
  onNavigate: (route: AppRoute) => void;
  onOpenKPIModal: (kpi: DashboardKPI) => void;
  onOpenRiskModal: (risk: RiskItem) => void;
  onOpenApprovalModal: (app: PendingApprovalItem) => void;
  onOpenDeadlineModal: (dl: UpcomingDeadlineItem) => void;
  onApproveSuccess?: (approvalId: string) => void;
}

export const MobileDashboard: React.FC<MobileDashboardProps> = ({
  kpis,
  actionPlans,
  risks,
  pendingApprovals,
  deadlines,
  meetings = [],
  onNavigate,
  onOpenKPIModal,
  onOpenRiskModal,
  onOpenApprovalModal,
  onOpenDeadlineModal,
  onApproveSuccess,
}) => {
  const [showAllAnalytics, setShowAllAnalytics] = useState(false);

  // Group deadlines into urgency
  const overdueTasks = deadlines.filter((d) => d.urgencyLevel === 'red' && d.daysLeft <= 0);
  const todayTasks = deadlines.filter((d) => d.daysLeft === 0 || d.deadlineDate.includes('วันนี้'));
  const dueSoonTasks = deadlines.filter((d) => d.daysLeft > 0 && d.daysLeft <= 7);

  const activeOverdue = overdueTasks.length > 0 ? overdueTasks : actionPlans.filter((p) => p.status === 'delayed');
  const activeToday = todayTasks;
  const activeDueSoon = dueSoonTasks;

  const upcomingMeetings = meetings.filter((m) => m.status === 'upcoming').slice(0, 3);
  const topKPIs = kpis.slice(0, 3);

  const achievedKpis = kpis.filter((k) => k.status === 'achieved').length;
  const kpiPercent = kpis.length > 0 ? Math.round((achievedKpis / kpis.length) * 100) : 0;

  return (
    <div className="space-y-4 px-3 sm:px-4 pb-12">
      {/* 1. Quick Task Counter Grid (Touch-friendly 4-card metric strip) */}
      <div className="grid grid-cols-2 gap-2.5">
        <div
          onClick={() => onNavigate('/my-work')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs active:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500">งานวันนี้</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">{activeToday.length}</div>
          <div className="text-[11px] text-blue-600 font-medium mt-0.5 flex items-center gap-0.5">
            ต้องส่งวันนี้ <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('/my-work')}
          className="bg-white p-3.5 rounded-xl border border-rose-200/90 bg-rose-50/20 shadow-2xs active:bg-rose-50/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-rose-700">เกินกำหนด</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-700">{activeOverdue.length}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-0.5 flex items-center gap-0.5">
            ด่วนมาก <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('/workflows')}
          className="bg-white p-3.5 rounded-xl border border-amber-200/90 bg-amber-50/20 shadow-2xs active:bg-amber-50/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-amber-800">รออนุมัติ</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-900">{pendingApprovals.length}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5 flex items-center gap-0.5">
            รอลงนาม/ตรวจ <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('/strategy')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs active:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500">เป้าหมาย KPI</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">{kpiPercent}%</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-0.5">
            บรรลุ {achievedKpis}/{kpis.length} ตัวชี้วัด
          </div>
        </div>
      </div>

      {/* 2. งานที่ต้องทำวันนี้ (Tasks Due Today) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900">งานที่ต้องทำวันนี้</h3>
          </div>
          <button
            onClick={() => onNavigate('/my-work')}
            className="text-xs text-[#B83B6F] font-semibold hover:underline flex items-center min-h-[40px] px-2"
          >
            ดูทั้งหมด ({activeToday.length})
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        {activeToday.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            ไม่มีงานที่ต้องส่งวันนี้
          </div>
        ) : (
          <div className="space-y-2">
            {activeToday.map((task: any) => (
              <div
                key={task.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-800 line-clamp-2">
                    {task.title}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded shrink-0">
                    วันนี้
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <span className="truncate max-w-[180px]">
                    {task.department || 'กองวิชาการ'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (task.daysLeft !== undefined) onOpenDeadlineModal(task);
                      else onNavigate(task.targetRoute || '/my-work');
                    }}
                    className="text-[#B83B6F] font-semibold min-h-[36px] flex items-center px-1"
                  >
                    เปิดดูงาน →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. งานเกินกำหนด (Overdue Items - High Priority Alert) */}
      {activeOverdue.length > 0 && (
        <div className="bg-rose-50/50 rounded-xl border border-rose-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-rose-900">งานเกินกำหนดส่ง</h3>
            </div>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
              {activeOverdue.length} รายการ
            </span>
          </div>

          <div className="space-y-2">
            {activeOverdue.map((item: any) => (
              <div
                key={item.id}
                className="p-3 bg-white rounded-lg border border-rose-200/70 shadow-2xs flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-800 line-clamp-2">
                    {item.title}
                  </span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 shrink-0">
                    เกินกำหนด
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>ผู้รับผิดชอบ: {item.responsiblePerson || item.owner || 'กองวิชาการ'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (item.targetRoute) onNavigate(item.targetRoute);
                      else onNavigate('/strategy');
                    }}
                    className="text-rose-700 font-semibold min-h-[36px] flex items-center px-1"
                  >
                    ติดตามด่วน →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. รออนุมัติ (Pending Approvals with Immediate Actions) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FBE7EF] text-[#B83B6F] flex items-center justify-center font-bold text-xs">
              {pendingApprovals.length}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">รออนุมัติ / ลงนาม</h3>
              <p className="text-[11px] text-slate-500">เอกสารและมติที่ต้องดำเนินการ</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/workflows')}
            className="text-xs text-[#B83B6F] font-semibold hover:underline flex items-center min-h-[40px] px-2"
          >
            ทั้งหมด
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            ไม่มีรายการรออนุมัติในขณะนี้
          </div>
        ) : (
          <div className="space-y-2.5">
            {pendingApprovals.slice(0, 3).map((app) => (
              <div
                key={app.id}
                className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900 line-clamp-2">
                    {app.title}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded shrink-0">
                    {app.type}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  เสนอโดย: {app.submitter} ({app.department})
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onOpenApprovalModal(app)}
                    className="flex-1 min-h-[40px] px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors flex items-center justify-center"
                  >
                    ดูรายละเอียด
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onApproveSuccess) onApproveSuccess(app.id);
                      else onOpenApprovalModal(app);
                    }}
                    className="flex-1 min-h-[40px] px-3 py-1.5 text-xs font-medium text-white bg-[#D94F87] hover:bg-[#B83B6F] active:bg-[#9B2C5B] rounded-lg transition-colors flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    อนุมัติ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. งานใกล้ครบกำหนด (Due Soon Deadlines) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">กำหนดส่งสัปดาห์นี้</h3>
          </div>
          <button
            onClick={() => onNavigate('/calendar')}
            className="text-xs text-[#B83B6F] font-semibold hover:underline flex items-center min-h-[40px] px-2"
          >
            ปฏิทิน
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        {activeDueSoon.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            ไม่มีกำหนดส่งในสัปดาห์นี้
          </div>
        ) : (
          <div className="space-y-2">
            {activeDueSoon.map((dl) => (
              <div
                key={dl.id}
                onClick={() => onOpenDeadlineModal(dl)}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-100/80 active:bg-slate-200/60 transition-colors cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 truncate">{dl.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    กำหนดส่ง: {dl.deadlineDate} • {dl.department}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    อีก {dl.daysLeft} วัน
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Upcoming Meetings (Compact Card List) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D94F87]" />
            <h3 className="text-sm font-bold text-slate-900">การประชุมที่จะมาถึง</h3>
          </div>
          <button
            onClick={() => onNavigate('/meetings')}
            className="text-xs text-[#B83B6F] font-semibold hover:underline flex items-center min-h-[40px] px-2"
          >
            ดูทั้งหมด ({meetings.length})
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        {upcomingMeetings.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            ไม่มีการประชุมที่จะมาถึงในขณะนี้
          </div>
        ) : (
          <div className="space-y-2.5">
            {upcomingMeetings.map((mtg) => (
              <div
                key={mtg.id}
                onClick={() => onNavigate('/meetings')}
                className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 active:bg-slate-50 transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900 line-clamp-2">
                    {mtg.title}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded shrink-0">
                    {mtg.date}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{mtg.venue}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-600 truncate max-w-[200px]">
                    ประธาน: {mtg.chairperson}
                  </span>
                  <span className="text-[#B83B6F] font-semibold shrink-0">
                    {mtg.totalAgendas} วาระ →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. KPI Progress Highlights */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">สรุปความก้าวหน้า KPI</h3>
          </div>
          <button
            onClick={() => onNavigate('/strategy')}
            className="text-xs text-[#B83B6F] font-semibold hover:underline flex items-center min-h-[40px] px-2"
          >
            ดูยุทธศาสตร์
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        {topKPIs.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            ยังไม่มีข้อมูลตัวชี้วัด
          </div>
        ) : (
          <div className="space-y-3">
            {topKPIs.map((kpi) => (
              <div
                key={kpi.id}
                onClick={() => onOpenKPIModal(kpi)}
                className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-100/60 active:bg-slate-200/60 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 line-clamp-1">{kpi.title}</span>
                  <span className="font-bold text-slate-900 shrink-0 ml-2">{kpi.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      kpi.progress >= 80 ? 'bg-emerald-500' : kpi.progress >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, kpi.progress)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{kpi.department}</span>
                  <span className="text-[#B83B6F] font-medium">ดูรายละเอียด →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 8. Deep Analytics Toggle Button ("ดูทั้งหมด") */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowAllAnalytics(!showAllAnalytics)}
          className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 shadow-2xs transition-all"
        >
          <BarChart3 className="w-4 h-4 text-[#D94F87]" />
          <span>{showAllAnalytics ? 'ซ่อนการวิเคราะห์และกราฟเชิงลึก' : 'ดูการวิเคราะห์และกราฟเชิงลึกทั้งหมด'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAllAnalytics ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Deep Analytics Content (Opened when tapped) */}
      {showAllAnalytics && (
        <div className="space-y-4 pt-2 animate-fadeIn">
          {/* Risk Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h4 className="text-xs font-bold text-slate-900">ทะเบียนความเสี่ยงวิชาการ</h4>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">{risks.length} รายการ</span>
            </div>
            {risks.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                ยังไม่มีข้อมูลความเสี่ยง
              </div>
            ) : (
              <div className="space-y-2">
                {risks.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => onOpenRiskModal(r)}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-800 truncate">{r.title}</p>
                      <p className="text-[10px] text-slate-500">{r.mitigationPlan}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                        r.level === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : r.level === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {r.level === 'critical' ? 'วิกฤต' : r.level === 'high' ? 'สูง' : 'ปานกลาง'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
