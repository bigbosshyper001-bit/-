import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Target,
  ArrowUpRight,
  ShieldAlert,
  Wallet,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { AppRoute } from '../../types.ts';
import type {
  DashboardKPI,
  ActionPlanItem,
  RiskItem,
} from '../../data/executiveDashboardData.ts';
import { DEMO_BUDGET } from '../../data/executiveDashboardData.ts';

export interface MainVisualizationsProps {
  kpis: DashboardKPI[];
  actionPlans: ActionPlanItem[];
  risks: RiskItem[];
  onNavigate: (route: AppRoute) => void;
  onOpenKPI: (kpi: DashboardKPI) => void;
  onOpenRisk: (risk: RiskItem) => void;
  onOpenPlan: (plan: ActionPlanItem) => void;
}

export const MainVisualizations: React.FC<MainVisualizationsProps> = ({
  kpis,
  actionPlans,
  risks,
  onNavigate,
  onOpenKPI,
  onOpenRisk,
  onOpenPlan,
}) => {
  const [activePlanTab, setActivePlanTab] = useState<'all' | 'in-progress' | 'delayed'>('all');

  // Risk distribution count
  const criticalCount = risks.filter((r) => r.level === 'critical').length;
  const highCount = risks.filter((r) => r.level === 'high').length;
  const mediumCount = risks.filter((r) => r.level === 'medium').length;
  const lowCount = risks.filter((r) => r.level === 'low').length;

  const filteredPlans = actionPlans.filter((plan) => {
    if (activePlanTab === 'in-progress') return plan.status === 'in-progress';
    if (activePlanTab === 'delayed') return plan.status === 'delayed';
    return true;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN: KPI Achievement & Action Plans (Span 7) */}
      <div className="lg:col-span-7 space-y-6">
        {/* 1. KPI Achievement Matrix */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  KPI Achievement (ผลการดำเนินงานตามตัวชี้วัดยุทธศาสตร์)
                </h3>
                <p className="text-xs text-slate-500">
                  เปรียบเทียบผลงานจริงกับค่าเป้าหมาย (ทั้งหมด {kpis.length} ตัวชี้วัด)
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('/strategy')}
              className="text-xs font-semibold text-[#B83B6F] hover:text-[#912453] flex items-center gap-1 transition-colors"
            >
              ดูรายละเอียด
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Top 5 Highlighted KPIs with Progress Bar */}
          {kpis.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg">
              <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-500">ยังไม่มีข้อมูลตัวชี้วัดยุทธศาสตร์ในระบบ</p>
              <p className="text-[11px] text-slate-400 mt-0.5">สามารถสร้างและติดตามตัวชี้วัดได้ที่เมนูยุทธศาสตร์</p>
            </div>
          ) : (
            <div className="space-y-4">
              {kpis.slice(0, 5).map((kpi) => {
                const isAchieved = kpi.status === 'achieved';
                const isLagging = kpi.status === 'lagging';

                const barColor = isAchieved
                  ? 'bg-[#3A9D68]'
                  : isLagging
                  ? 'bg-[#D64545]'
                  : 'bg-[#3977C8]';

                const badgeColor = isAchieved
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isLagging
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200';

                const badgeText = isAchieved
                  ? 'บรรลุเป้า'
                  : isLagging
                  ? 'ต่ำกว่าเป้า'
                  : 'ตามแผนงาน';

                return (
                  <div
                    key={kpi.id}
                    onClick={() => onOpenKPI(kpi)}
                    className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-slate-500">
                            {kpi.code}
                          </span>
                          <span className="text-xs font-semibold text-slate-900 group-hover:text-[#B83B6F] transition-colors truncate">
                            {kpi.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">
                          {kpi.department} • {kpi.changeTrend}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}`}
                        >
                          {badgeText}
                        </span>
                        <span className="text-xs font-bold text-slate-800 font-mono">
                          {kpi.actualValue} / {kpi.targetValue} {kpi.unit}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar with percentage */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600 font-mono shrink-0">
                        {kpi.progress}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-3 text-right">
            <span className="text-[11px] text-slate-400">
              * ข้อมูลติดตามความก้าวหน้าไตรมาสที่ 3/2569
            </span>
          </div>
        </div>

        {/* 2. Action Plan Progress Table / Cards */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Action Plan Progress (ความก้าวหน้าโครงการตามแผนยุทธศาสตร์)
                </h3>
                <p className="text-xs text-slate-500">
                  ติดตามสถานะ 18 โครงการสำคัญกองวิชาการ
                </p>
              </div>
            </div>

            {/* Filter Pill */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setActivePlanTab('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activePlanTab === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ทั้งหมด ({actionPlans.length})
              </button>
              <button
                onClick={() => setActivePlanTab('in-progress')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activePlanTab === 'in-progress'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                กำลังดำเนิน ({actionPlans.filter((p) => p.status === 'in-progress').length})
              </button>
              <button
                onClick={() => setActivePlanTab('delayed')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activePlanTab === 'delayed'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ล่าช้า ({actionPlans.filter((p) => p.status === 'delayed').length})
              </button>
            </div>
          </div>

          {/* Action Plans List */}
          {filteredPlans.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg">
              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-500">ยังไม่มีแผนปฏิบัติการตามเงื่อนไขที่เลือก</p>
              <p className="text-[11px] text-slate-400 mt-0.5">สามารถสร้างโครงการและแผนงานได้ที่เมนูยุทธศาสตร์</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPlans.slice(0, 6).map((plan) => {
                const isCompleted = plan.status === 'completed';
                const isDelayed = plan.status === 'delayed';

                const statusBadge = isCompleted ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    สำเร็จ 100%
                  </span>
                ) : isDelayed ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    <Clock className="w-3 h-3" />
                    ล่าช้า ({plan.progress}%)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    <Clock className="w-3 h-3" />
                    กำลังดำเนินการ ({plan.progress}%)
                  </span>
                );

                const spent = Number(plan.budgetSpent ?? (plan as any).spentBudget ?? 0);
                const due = plan.dueDate || (plan as any).endDate || '-';
                const objective = plan.strategicObjective || (plan as any).strategyName || 'ยุทธศาสตร์วิชาการ';

                return (
                  <div
                    key={plan.id}
                    onClick={() => onOpenPlan(plan)}
                    className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-slate-500">
                            {plan.code}
                          </span>
                          <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#B83B6F] transition-colors truncate">
                            {plan.title}
                          </h4>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {objective} • {plan.department}
                        </div>
                      </div>
                      <div className="shrink-0">{statusBadge}</div>
                    </div>

                    {/* Progress & Budget */}
                    <div className="flex items-center justify-between gap-4 mt-2.5 text-xs text-slate-600">
                      <div className="flex-1">
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted
                                ? 'bg-emerald-500'
                                : isDelayed
                                ? 'bg-rose-500'
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${plan.progress ?? 0}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-500 font-mono">
                        <span>งบเบิกจ่าย: {spent.toLocaleString()} บ.</span>
                        <span>ครบกำหนด: {due}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              แสดง {filteredPlans.slice(0, 6).length} จากทั้งหมด {actionPlans.length} โครงการยุทธศาสตร์
            </span>
            <button
              onClick={() => onNavigate('/strategy')}
              className="font-semibold text-[#B83B6F] hover:underline"
            >
              เปิดดูตารางแผนปฏิบัติการทั้งหมด &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Budget Breakdown & Risk Analysis (Span 5) */}
      <div className="lg:col-span-5 space-y-6">
        {/* 1. Budget Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  สถานะงบประมาณกองวิชาการ
                </h3>
                <p className="text-xs text-slate-500">
                  Allocated, Committed, Spent & Remaining
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              ปีงบฯ 2569
            </span>
          </div>

          {/* Large Total Allocated */}
          <div className="bg-[#FAFAFC] border border-slate-100 rounded-xl p-4 mb-4">
            <div className="text-xs font-semibold text-slate-500 mb-1">
              งบประมาณจัดสรรรวมทั้งหมด (Allocated)
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              ฿{Number(DEMO_BUDGET?.totalAllocated ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              ครอบคลุมงานพัฒนาหลักสูตร, สภาวิชาการ, Credit Bank และพัฒนาอาจารย์
            </div>
          </div>

          {/* Segmented Stacked Progress Bar */}
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">สัดส่วนการใช้งบประมาณ</span>
              <span className="text-slate-900 font-mono">
                เบิกจ่ายแล้ว {DEMO_BUDGET.spentPercentage}%
              </span>
            </div>

            <div className="h-3 w-full bg-slate-100 rounded-full flex overflow-hidden">
              <div
                className="bg-[#3A9D68]"
                style={{ width: `${DEMO_BUDGET.spentPercentage}%` }}
                title={`Spent (เบิกจ่าย): ${DEMO_BUDGET.spentPercentage}%`}
              />
              <div
                className="bg-[#E59A35]"
                style={{ width: `${DEMO_BUDGET.committedPercentage}%` }}
                title={`Committed (ผูกพัน): ${DEMO_BUDGET.committedPercentage}%`}
              />
              <div
                className="bg-slate-200"
                style={{ width: `${DEMO_BUDGET.remainingPercentage}%` }}
                title={`Remaining (คงเหลือ): ${DEMO_BUDGET.remainingPercentage}%`}
              />
            </div>
          </div>

          {/* 3 Detailed Pillars */}
          <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-center">
            {/* Spent */}
            <div className="bg-[#EBF7EE] border border-[#C5E8CE] rounded-lg p-2.5">
              <div className="text-[11px] font-semibold text-emerald-800">
                Spent (เบิกจ่าย)
              </div>
              <div className="text-sm font-bold text-emerald-950 font-mono mt-0.5">
                ฿{(DEMO_BUDGET.spent / 1000000).toFixed(2)}M
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold">
                {DEMO_BUDGET.spentPercentage}%
              </div>
            </div>

            {/* Committed */}
            <div className="bg-[#FEF5E7] border border-[#FCDDB5] rounded-lg p-2.5">
              <div className="text-[11px] font-semibold text-amber-800">
                Committed (ผูกพัน)
              </div>
              <div className="text-sm font-bold text-amber-950 font-mono mt-0.5">
                ฿{(DEMO_BUDGET.committed / 1000000).toFixed(2)}M
              </div>
              <div className="text-[10px] text-amber-700 font-semibold">
                {DEMO_BUDGET.committedPercentage}%
              </div>
            </div>

            {/* Remaining */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
              <div className="text-[11px] font-semibold text-slate-700">
                Remaining (คงเหลือ)
              </div>
              <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                ฿{(DEMO_BUDGET.remaining / 1000000).toFixed(2)}M
              </div>
              <div className="text-[10px] text-slate-500 font-semibold">
                {DEMO_BUDGET.remainingPercentage}%
              </div>
            </div>
          </div>
        </div>

        {/* 2. Risk Matrix & Severity Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Risk Management (ความเสี่ยงวิชาการ)
                </h3>
                <p className="text-xs text-slate-500">
                  จำแนกตามระดับความรุนแรง (ทั้งหมด {risks.length} ความเสี่ยง)
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('/strategy')}
              className="text-xs font-semibold text-[#B83B6F] hover:underline"
            >
              Risk Register &rarr;
            </button>
          </div>

          {/* 4 Severity Badges */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-2 text-center">
              <span className="text-[11px] font-bold text-rose-700 block">
                Critical
              </span>
              <span className="text-lg font-extrabold text-rose-950 font-mono">
                {criticalCount}
              </span>
              <span className="text-[10px] text-rose-600 block">วิกฤต</span>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-center">
              <span className="text-[11px] font-bold text-orange-700 block">
                High
              </span>
              <span className="text-lg font-extrabold text-orange-950 font-mono">
                {highCount}
              </span>
              <span className="text-[10px] text-orange-600 block">สูง</span>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-center">
              <span className="text-[11px] font-bold text-amber-700 block">
                Medium
              </span>
              <span className="text-lg font-extrabold text-amber-950 font-mono">
                {mediumCount}
              </span>
              <span className="text-[10px] text-amber-600 block">ปานกลาง</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-center">
              <span className="text-[11px] font-bold text-emerald-700 block">
                Low
              </span>
              <span className="text-lg font-extrabold text-emerald-950 font-mono">
                {lowCount}
              </span>
              <span className="text-[10px] text-emerald-600 block">ต่ำ</span>
            </div>
          </div>

          {/* Top 3 Risks Quick List */}
          {risks.length === 0 ? (
            <div className="py-6 text-center border border-dashed border-slate-200 rounded-lg">
              <ShieldAlert className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
              <p className="text-xs font-medium text-slate-500">ยังไม่มีข้อมูลความเสี่ยงในระบบ</p>
              <p className="text-[11px] text-slate-400 mt-0.5">สามารถประเมินความเสี่ยงได้ที่เมนูยุทธศาสตร์</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {risks.slice(0, 3).map((risk) => {
                const isCritical = risk.level === 'critical';
                return (
                  <div
                    key={risk.id}
                    onClick={() => onOpenRisk(risk)}
                    className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isCritical
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {risk.code} • คะแนน {risk.score}/25
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {risk.department}
                      </span>
                    </div>
                    <h5 className="text-xs font-semibold text-slate-900 group-hover:text-[#B83B6F] transition-colors line-clamp-1">
                      {risk.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      แผนควบคุม: {risk.mitigationPlan}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
