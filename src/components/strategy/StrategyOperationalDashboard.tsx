import React from 'react';
import {
  Target,
  ListTodo,
  Coins,
  ShieldAlert,
  ArrowRight,
  AlertTriangle,
  Clock,
  TrendingUp,
  Building2,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  Flame,
  Sparkles,
} from 'lucide-react';
import type {
  KPIRecord,
  ActionPlanRecord,
  BudgetOverviewData,
  RiskRecord,
  StrategyPillar,
} from '../../data/strategyModuleData.ts';

export interface StrategyOperationalDashboardProps {
  kpis: KPIRecord[];
  actionPlans: ActionPlanRecord[];
  budgetData: BudgetOverviewData;
  risks: RiskRecord[];
  pillars: StrategyPillar[];
  onDrillDown: (
    targetTab: 'kpi' | 'action_plan' | 'budget' | 'risk' | 'hierarchy'
  ) => void;
}

export const StrategyOperationalDashboard: React.FC<StrategyOperationalDashboardProps> = ({
  kpis,
  actionPlans,
  budgetData,
  risks,
  pillars,
  onDrillDown,
}) => {
  // 1. KPI Metrics
  const achievedKPIs = kpis.filter((k) => k.status === 'achieved');
  const onTrackKPIs = kpis.filter((k) => k.status === 'on_track');
  const laggingKPIs = kpis.filter((k) => k.status === 'lagging');
  const avgKPIAchieve = (
    kpis.reduce((acc, k) => acc + k.achievementPercentage, 0) / (kpis.length || 1)
  ).toFixed(1);

  // 2. Action Plan Metrics
  const completedPlans = actionPlans.filter((p) => p.status === 'completed');
  const delayedPlans = actionPlans.filter((p) => p.status === 'delayed');
  const inProgressPlans = actionPlans.filter((p) => p.status === 'in_progress');
  const planCompletionRate = (
    (completedPlans.length / (actionPlans.length || 1)) *
    100
  ).toFixed(1);

  // 3. Budget Metrics
  const budgetSpentRate = (
    (budgetData.totalSpent / budgetData.totalAllocated) *
    100
  ).toFixed(1);

  // 4. Risk Metrics
  const criticalRisks = risks.filter((r) => r.level === 'critical');
  const highRisks = risks.filter((r) => r.level === 'high');
  const activeRisks = risks.filter((r) => r.status === 'active' || r.status === 'mitigating');

  return (
    <div className="space-y-6">
      {/* Top Banner Notice: Operational Focus */}
      <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold">
              Operational Command Center • กองวิชาการ มจร
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold mt-1">
            ศูนย์กำกับติดตามผลการปฏิบัติงานตามแผนยุทธศาสตร์และตัวชี้วัด (Operational Hub)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            แผงควบคุมระดับปฏิบัติการสำหรับหัวหน้างานและเจ้าหน้าที่ผู้รับผิดชอบ • รอบไตรมาสที่ 3-4 ปีงบประมาณ 2569
          </p>
        </div>

        <button
          onClick={() => onDrillDown('hierarchy')}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shrink-0 text-white"
        >
          <span>ดูลำดับชั้นยุทธศาสตร์ (Hierarchy Tree)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 DRILL-DOWN SUMMARY CARDS (Required by User Prompt) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: KPI Achievement */}
        <div
          onClick={() => onDrillDown('kpi')}
          className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:border-[#B83B6F] hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold flex items-center gap-1.5 text-slate-700">
                <Target className="w-4 h-4 text-emerald-600" />
                KPI Achievement
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#B83B6F] transition-colors" />
            </div>
            <div className="font-mono text-2xl font-black text-slate-900 mt-1">
              {avgKPIAchieve}%
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              ค่าเฉลี่ยความสำเร็จจาก {kpis.length} ตัวชี้วัด
            </p>
          </div>

          <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              {achievedKPIs.length} บรรลุแล้ว
            </span>
            <span className="text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
              {onTrackKPIs.length} ตามแผน
            </span>
            <span className="text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
              {laggingKPIs.length} ต่ำเกณฑ์
            </span>
          </div>
        </div>

        {/* Card 2: Action Plan Completion */}
        <div
          onClick={() => onDrillDown('action_plan')}
          className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:border-[#B83B6F] hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold flex items-center gap-1.5 text-slate-700">
                <ListTodo className="w-4 h-4 text-purple-600" />
                Action Plan Completion
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#B83B6F] transition-colors" />
            </div>
            <div className="font-mono text-2xl font-black text-slate-900 mt-1">
              {planCompletionRate}%
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              เสร็จแล้ว {completedPlans.length} จาก {actionPlans.length} แผนงาน
            </p>
          </div>

          <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
            <span className="text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
              {inProgressPlans.length} กำลังทำ
            </span>
            <span className="text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {delayedPlans.length} ล่าช้า
            </span>
          </div>
        </div>

        {/* Card 3: Budget Utilization */}
        <div
          onClick={() => onDrillDown('budget')}
          className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:border-[#B83B6F] hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold flex items-center gap-1.5 text-slate-700">
                <Coins className="w-4 h-4 text-blue-600" />
                Budget Utilization
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#B83B6F] transition-colors" />
            </div>
            <div className="font-mono text-2xl font-black text-slate-900 mt-1">
              {budgetSpentRate}%
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              เบิกจ่าย {(budgetData.totalSpent / 1000000).toFixed(2)} จาก{' '}
              {(budgetData.totalAllocated / 1000000).toFixed(2)} ลบ.
            </p>
          </div>

          <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
            <span className="text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
              ผูกพัน {(budgetData.totalCommitted / 1000000).toFixed(2)}M
            </span>
            <span className="text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              คงเหลือ {(budgetData.totalRemaining / 1000000).toFixed(2)}M
            </span>
          </div>
        </div>

        {/* Card 4: Risk Exposure */}
        <div
          onClick={() => onDrillDown('risk')}
          className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:border-[#B83B6F] hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold flex items-center gap-1.5 text-slate-700">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Risk Exposure
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#B83B6F] transition-colors" />
            </div>
            <div className="font-mono text-2xl font-black text-rose-600 mt-1">
              {criticalRisks.length + highRisks.length} รายการ
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              ความเสี่ยงระดับวิกฤตและสูงที่ต้องเร่งควบคุม
            </p>
          </div>

          <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
            <span className="text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
              {criticalRisks.length} Critical
            </span>
            <span className="text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
              {highRisks.length} High
            </span>
            <span className="text-slate-600 font-semibold">
              ทั้งหมด {risks.length} ข้อ
            </span>
          </div>
        </div>
      </div>

      {/* OPERATIONAL WORKLIST & ACTIONABLE DRILL-DOWN BLOCKS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Operational Block 1: Delayed Action Plans needing fast-track */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  แผนปฏิบัติการที่ล่าช้ากว่ากำหนด (Delayed Action Plans)
                </h4>
                <p className="text-[11px] text-slate-500">
                  ต้องการการสนับสนุนและเร่งรัดจากผู้บริหารส่วนงาน
                </p>
              </div>
            </div>

            <button
              onClick={() => onDrillDown('action_plan')}
              className="text-xs font-semibold text-[#B83B6F] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>ดูทั้งหมด</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {delayedPlans.map((dp) => (
              <div
                key={dp.id}
                onClick={() => onDrillDown('action_plan')}
                className="p-3 rounded-lg border border-rose-200/80 bg-rose-50/30 hover:bg-rose-50/60 transition-colors cursor-pointer space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-rose-700 bg-white border border-rose-300 px-1.5 py-0.2 rounded">
                    {dp.code}
                  </span>
                  <span className="font-mono text-[11px] text-rose-700 font-bold">
                    สิ้นสุด {dp.endDate}
                  </span>
                </div>
                <h5 className="font-bold text-slate-900 leading-snug">
                  {dp.title}
                </h5>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>ผู้รับผิดชอบ: {dp.responsiblePerson}</span>
                  <span className="font-bold text-slate-700">
                    ความคืบหน้า {dp.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Block 2: Critical Risks needing immediate mitigation review */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  ความเสี่ยงระดับสูงที่ต้องติดตามมาตรการ (Urgent Risk Mitigations)
                </h4>
                <p className="text-[11px] text-slate-500">
                  ตรวจมาตรการควบคุมและกำหนดส่งรายงานความก้าวหน้า
                </p>
              </div>
            </div>

            <button
              onClick={() => onDrillDown('risk')}
              className="text-xs font-semibold text-[#B83B6F] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>เปิด Matrix</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {risks
              .filter((r) => r.level === 'critical' || r.level === 'high')
              .slice(0, 2)
              .map((r) => (
                <div
                  key={r.id}
                  onClick={() => onDrillDown('risk')}
                  className="p-3 rounded-lg border border-slate-200 bg-[#FAFAFC] hover:border-slate-300 transition-colors cursor-pointer space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-slate-700 bg-white border border-slate-200 px-1.5 py-0.2 rounded">
                      {r.id} (Score: {r.score})
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        r.level === 'critical'
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-400 text-slate-900'
                      }`}
                    >
                      {r.level}
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 leading-snug">
                    {r.name}
                  </h5>
                  <p className="text-[11px] text-slate-600 line-clamp-1">
                    มาตรการ: {r.mitigation}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
