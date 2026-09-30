import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Target,
  FileSignature,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import type { AppRoute } from '../../types.ts';

export interface TopSummaryKPIProps {
  totalTasks: number;
  completedTasks: number;
  dueSoonTasks: number;
  overdueTasks: number;
  kpiAchievement: number;
  totalKPIs: number;
  achievedKPIs: number;
  budgetUtilization: number;
  budgetSpentFormatted: string;
  totalBudgetFormatted: string;
  criticalRisks: number;
  pendingApprovals: number;
  onNavigate: (route: AppRoute) => void;
  onSelectMetricFilter?: (filterType: string) => void;
  onOpenKPIModal: () => void;
  onOpenRiskModal: () => void;
  onOpenApprovalModal: () => void;
}

export const TopSummaryKPI: React.FC<TopSummaryKPIProps> = ({
  totalTasks,
  completedTasks,
  dueSoonTasks,
  overdueTasks,
  kpiAchievement,
  totalKPIs,
  achievedKPIs,
  budgetUtilization,
  budgetSpentFormatted,
  totalBudgetFormatted,
  criticalRisks,
  pendingApprovals,
  onNavigate,
  onSelectMetricFilter,
  onOpenKPIModal,
  onOpenRiskModal,
  onOpenApprovalModal,
}) => {
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const completedWidth = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const dueSoonWidth = totalTasks > 0 ? (dueSoonTasks / totalTasks) * 100 : 0;
  const overdueWidth = totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
      {/* 1. HERO CARD: Operational Execution Status (Span 5 on XL) */}
      <div className="xl:col-span-5 bg-white rounded-2xl border border-[#FFDCE8] p-5 shadow-2xs flex flex-col justify-between relative overflow-hidden">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E11463]" />
              <span className="text-xs font-semibold text-slate-800 tracking-wide">
                สถานะการขับเคลื่อนงานและแผนปฏิบัติการ
              </span>
            </div>
            <button
              onClick={() => onNavigate('/strategy')}
              className="text-[11px] font-medium text-slate-500 hover:text-[#E11463] flex items-center gap-1 transition-colors cursor-pointer"
            >
              ดูแผนงานทั้งหมด
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Main Total Number */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalTasks}
            </span>
            <span className="text-xs font-medium text-slate-500">
              งานและโครงการตามแผน (สำเร็จ {completionRate}%)
            </span>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-3 gap-2">
            {/* งานสำเร็จ */}
            <div
              onClick={() => onSelectMetricFilter?.('completed')}
              className="bg-[#EBF7EE] border border-[#C5E8CE] rounded-lg p-2.5 cursor-pointer hover:bg-[#DEF0E2] transition-colors"
            >
              <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-medium mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>งานสำเร็จ</span>
              </div>
              <div className="text-lg font-bold text-emerald-900 leading-none">
                {completedTasks}
              </div>
              <div className="text-[10px] text-emerald-700 mt-1">
                {completionRate}% ของแผน
              </div>
            </div>

            {/* งานใกล้ครบกำหนด */}
            <div
              onClick={() => onSelectMetricFilter?.('due-soon')}
              className="bg-[#FEF5E7] border border-[#FCDDB5] rounded-lg p-2.5 cursor-pointer hover:bg-[#FDEED5] transition-colors"
            >
              <div className="flex items-center gap-1.5 text-amber-700 text-[11px] font-medium mb-1">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>ใกล้กำหนด</span>
              </div>
              <div className="text-lg font-bold text-amber-900 leading-none">
                {dueSoonTasks}
              </div>
              <div className="text-[10px] text-amber-700 mt-1">
                ภายใน 7 วัน
              </div>
            </div>

            {/* งานล่าช้า */}
            <div
              onClick={() => onSelectMetricFilter?.('overdue')}
              className="bg-[#FBEBEB] border border-[#F4C5C5] rounded-lg p-2.5 cursor-pointer hover:bg-[#F9DDDD] transition-colors"
            >
              <div className="flex items-center gap-1.5 text-rose-700 text-[11px] font-medium mb-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>งานล่าช้า</span>
              </div>
              <div className="text-lg font-bold text-rose-900 leading-none">
                {overdueTasks}
              </div>
              <div className="text-[10px] text-rose-700 mt-1 font-semibold">
                ต้องติดตามด่วน
              </div>
            </div>
          </div>
        </div>

        {/* Proportional Segmented Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="h-2 w-full bg-slate-100 rounded-full flex overflow-hidden">
            <div
              className="bg-[#3A9D68] transition-all duration-500"
              style={{ width: `${completedWidth}%` }}
              title={`สำเร็จ: ${completedTasks} งาน`}
            />
            <div
              className="bg-[#E59A35] transition-all duration-500"
              style={{ width: `${dueSoonWidth}%` }}
              title={`ใกล้ครบกำหนด: ${dueSoonTasks} งาน`}
            />
            <div
              className="bg-[#D64545] transition-all duration-500"
              style={{ width: `${overdueWidth}%` }}
              title={`ล่าช้า: ${overdueTasks} งาน`}
            />
          </div>
        </div>
      </div>

      {/* 2. STRATEGIC KPI ACHIEVEMENT (Span 3 on XL) */}
      <div
        onClick={onOpenKPIModal}
        className="xl:col-span-3 bg-white rounded-2xl border border-[#FFDCE8] p-5 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-[#FFD0E2] transition-all group"
      >
        <div>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFF0F5] border border-[#FFD0E2] flex items-center justify-center text-[#E11463]">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  KPI Achievement
                </span>
                <span className="text-[11px] text-slate-400">ตัวชี้วัดยุทธศาสตร์</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <TrendingUp className="w-3 h-3" />
              84.5%
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {kpiAchievement}%
              </span>
              <span className="text-xs text-slate-500">
                ผ่านเกณฑ์ {achievedKPIs}/{totalKPIs} ตัวชี้วัด
              </span>
            </div>

            {/* Mini Progress */}
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-[#E11463] h-full rounded-full transition-all duration-500"
                style={{ width: `${kpiAchievement}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>แตะเพื่อดูรายละเอียดทั้ง 12 ตัวชี้วัด</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E11463] transition-colors" />
        </div>
      </div>

      {/* 3. BUDGET UTILIZATION (Span 2 on XL) */}
      <div className="xl:col-span-2 bg-white rounded-2xl border border-[#FFDCE8] p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-800 block">
                Budget
              </span>
              <span className="text-[11px] text-slate-400">การเบิกจ่ายงบ</span>
            </div>
          </div>

          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {budgetUtilization}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
              เบิกจ่าย {budgetSpentFormatted}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              จาก {totalBudgetFormatted}
            </div>
          </div>
        </div>

        {/* Mini progress */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-teal-600 h-full rounded-full"
              style={{ width: `${budgetUtilization}%` }}
            />
          </div>
          <span className="text-[10px] text-teal-700 font-medium block mt-1">
            ผูกพันงบฯ แล้ว 28.3%
          </span>
        </div>
      </div>

      {/* 4. ATTENTION RADAR: Pending Approvals & Critical Risks (Span 2 on XL) */}
      <div className="xl:col-span-2 grid grid-rows-2 gap-2">
        {/* Pending Approvals */}
        <div
          onClick={onOpenApprovalModal}
          className="bg-white rounded-2xl border border-amber-200/90 p-3 shadow-2xs cursor-pointer hover:border-amber-300 hover:bg-amber-50/20 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <FileSignature className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-600 block leading-tight">
                รออนุมัติ / ลงนาม
              </span>
              <span className="text-[10px] text-amber-700 font-semibold">
                Pending Approval
              </span>
            </div>
          </div>
          <div className="text-lg font-black text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-full">
            {pendingApprovals}
          </div>
        </div>

        {/* High/Critical Risks */}
        <div
          onClick={onOpenRiskModal}
          className="bg-white rounded-2xl border border-[#FFD0E2] p-3 shadow-2xs cursor-pointer hover:border-[#E11463]/40 hover:bg-[#FFF0F5]/50 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#FFF0F5] border border-[#FFD0E2] flex items-center justify-center text-[#E11463] shrink-0">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-600 block leading-tight">
                ความเสี่ยงระดับสูง
              </span>
              <span className="text-[10px] text-[#E11463] font-semibold">
                Critical / High Risk
              </span>
            </div>
          </div>
          <div className="text-lg font-black text-[#E11463] bg-[#FFE4EE] px-2 py-0.5 rounded-full">
            {criticalRisks}
          </div>
        </div>
      </div>
    </div>
  );
};
