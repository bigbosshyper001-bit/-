import React, { useState } from 'react';
import {
  Coins,
  TrendingUp,
  PieChart as PieChartIcon,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FolderKanban,
  Download,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { useToast } from '../ui/Toast.tsx';
import { ResponsiveTable } from '../ui/ResponsiveTable.tsx';
import type { TableColumn } from '../../types.ts';
import type {
  BudgetOverviewData,
  StrategyPillar,
} from '../../data/strategyModuleData.ts';

export interface BudgetManagementViewProps {
  budgetData: BudgetOverviewData;
  pillars: StrategyPillar[];
}

export const BudgetManagementView: React.FC<BudgetManagementViewProps> = ({
  budgetData,
  pillars,
}) => {
  const { showToast } = useToast();
  const [selectedPillarId, setSelectedPillarId] = useState<string>('all');

  // Calculate percentages
  const spentPct = ((budgetData.totalSpent / budgetData.totalAllocated) * 100).toFixed(1);
  const committedPct = ((budgetData.totalCommitted / budgetData.totalAllocated) * 100).toFixed(1);
  const remainingPct = ((budgetData.totalRemaining / budgetData.totalAllocated) * 100).toFixed(1);

  // Flatten all projects from pillars
  const allProjects = pillars.flatMap((p) =>
    p.objectives.flatMap((obj) =>
      obj.projects.map((prj) => ({
        ...prj,
        pillarCode: p.code,
        pillarName: p.name,
      }))
    )
  );

  const filteredProjects =
    selectedPillarId === 'all'
      ? allProjects
      : allProjects.filter((prj) => prj.pillarCode.includes(selectedPillarId));

  const handleExportBudgetReport = () => {
    showToast({
      title: 'ส่งออกรายงานงบประมาณ',
      message: 'ดาวน์โหลดรายงานการใช้จ่ายงบประมาณประจำปีงบประมาณ 2569 (XLSX) เรียบร้อยแล้ว',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. BUDGET OVERVIEW (Allocated, Committed, Spent, Remaining) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B83B6F] flex items-center gap-1.5">
              <Coins className="w-4 h-4" />
              ภาพรวมงบประมาณแผ่นดินและเงินรายได้ (Budget Overview)
            </span>
            <h3 className="text-base font-bold text-slate-900">
              ปีงบประมาณ พ.ศ. {budgetData.fiscalYear} • กองวิชาการ
            </h3>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportBudgetReport}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            ส่งออกรายงานงบประมาณ
          </Button>
        </div>

        {/* 4 Core Budget KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Allocated */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold">งบจัดสรร (Allocated)</span>
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                100%
              </span>
            </div>
            <div className="font-mono text-xl font-black text-slate-900">
              {budgetData.totalAllocated.toLocaleString()} ฿
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {(budgetData.totalAllocated / 1000000).toFixed(2)} ล้านบาท
            </div>
          </div>

          {/* 2. Committed */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold">งบผูกพัน (Committed)</span>
              <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                {committedPct}%
              </span>
            </div>
            <div className="font-mono text-xl font-black text-amber-700">
              {budgetData.totalCommitted.toLocaleString()} ฿
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {(budgetData.totalCommitted / 1000000).toFixed(2)} ล้านบาท
            </div>
          </div>

          {/* 3. Spent */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold">เบิกจ่ายจริง (Spent)</span>
              <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded">
                {spentPct}%
              </span>
            </div>
            <div className="font-mono text-xl font-black text-blue-700">
              {budgetData.totalSpent.toLocaleString()} ฿
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {(budgetData.totalSpent / 1000000).toFixed(2)} ล้านบาท
            </div>
          </div>

          {/* 4. Remaining */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold">งบคงเหลือ (Remaining)</span>
              <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
                {remainingPct}%
              </span>
            </div>
            <div className="font-mono text-xl font-black text-emerald-700">
              {budgetData.totalRemaining.toLocaleString()} ฿
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {(budgetData.totalRemaining / 1000000).toFixed(2)} ล้านบาท
            </div>
          </div>
        </div>

        {/* Stacked Proportional Burn Bar */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs mt-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>สัดส่วนการใช้งบประมาณรวม (Utilization Rate)</span>
            <span className="font-mono font-bold text-blue-700">{spentPct}% เบิกจ่ายแล้ว</span>
          </div>

          <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex">
            <div
              className="bg-blue-600 h-full transition-all"
              style={{ width: `${spentPct}%` }}
              title={`เบิกจ่ายจริง: ${spentPct}%`}
            />
            <div
              className="bg-amber-400 h-full transition-all"
              style={{ width: `${committedPct}%` }}
              title={`งบผูกพัน: ${committedPct}%`}
            />
            <div
              className="bg-emerald-500 h-full transition-all"
              style={{ width: `${remainingPct}%` }}
              title={`คงเหลือ: ${remainingPct}%`}
            />
          </div>

          <div className="flex items-center gap-6 text-[11px] text-slate-500 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>เบิกจ่ายจริง ({spentPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>ผูกพันสัญญา ({committedPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>งบคงเหลือ ({remainingPct}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BUDGET UTILIZATION BY QUARTER */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              อัตราการใช้จ่ายงบประมาณเทียบเป้าหมายไตรมาส (Budget Utilization)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              เกณฑ์การประเมินการเบิกจ่ายตามข้อตกลงและมติสภาวิชาการ
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
            รอบ 9 เดือน (สิ้นสุด Q3)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {budgetData.quarters.map((q, idx) => {
            const isExceeded = q.status === 'exceeded';
            const isOnTrack = q.status === 'on_track';

            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-[#FAFAFC] space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px] line-clamp-1">
                    {q.name}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      isExceeded
                        ? 'bg-emerald-50 text-emerald-700'
                        : isOnTrack
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {q.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-500">เป้าหมาย: {q.targetPercent}%</span>
                    <span className="font-bold text-slate-800">
                      ทำได้: {q.actualPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isExceeded
                          ? 'bg-emerald-500'
                          : isOnTrack
                          ? 'bg-blue-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(q.actualPercent, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-100 flex justify-between">
                  <span>เบิกจ่าย:</span>
                  <span className="font-semibold text-slate-800">
                    {q.spentAmount > 0 ? `${(q.spentAmount / 1000000).toFixed(2)} ลบ.` : '-'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. BUDGET BY PROJECT (โครงการยุทธศาสตร์) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-[#B83B6F]" />
            <h4 className="text-sm font-bold text-slate-900">
              งบประมาณจำแนกตามรายโครงการ (Budget by Strategic Project)
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">ยุทธศาสตร์:</span>
            <select
              value={selectedPillarId}
              onChange={(e) => setSelectedPillarId(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-[#D94F87]"
            >
              <option value="all">ทุกยุทธศาสตร์</option>
              <option value="ยุทธศาสตร์ที่ 1">ยุทธศาสตร์ที่ 1 (หลักสูตรสากล)</option>
              <option value="ยุทธศาสตร์ที่ 2">ยุทธศาสตร์ที่ 2 (เรียนรู้ตลอดชีวิต)</option>
              <option value="ยุทธศาสตร์ที่ 3">ยุทธศาสตร์ที่ 3 (องค์กรดิจิทัล)</option>
            </select>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <ResponsiveTable
            data={filteredProjects}
            keyExtractor={(prj) => prj.id}
            columns={[
              {
                key: 'name',
                title: 'รหัส / ชื่อโครงการ',
                render: (prj) => (
                  <div>
                    <span className="font-mono text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded">
                      {prj.code}
                    </span>
                    <p className="font-bold text-slate-900 leading-snug mt-1">
                      {prj.name}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {prj.pillarCode}
                    </span>
                  </div>
                ),
              },
              {
                key: 'department',
                title: 'หน่วยงาน / ผู้รับผิดชอบ',
                render: (prj) => (
                  <div>
                    <p className="font-semibold text-slate-800">{prj.department}</p>
                    <p className="text-[11px] text-slate-500">{prj.responsiblePerson}</p>
                  </div>
                ),
              },
              {
                key: 'allocatedBudget',
                title: 'จัดสรร (Allocated)',
                align: 'right',
                render: (prj) => (
                  <span className="font-mono font-bold text-slate-900">
                    {prj.allocatedBudget.toLocaleString()} ฿
                  </span>
                ),
              },
              {
                key: 'committedBudget',
                title: 'ผูกพัน (Committed)',
                align: 'right',
                render: (prj) => (
                  <span className="font-mono text-amber-700">
                    {prj.committedBudget.toLocaleString()} ฿
                  </span>
                ),
              },
              {
                key: 'spentBudget',
                title: 'เบิกจ่าย (Spent)',
                align: 'right',
                render: (prj) => (
                  <span className="font-mono font-bold text-blue-700">
                    {prj.spentBudget.toLocaleString()} ฿
                  </span>
                ),
              },
              {
                key: 'remaining',
                title: 'คงเหลือ (Remaining)',
                align: 'right',
                render: (prj) => {
                  const rem = prj.allocatedBudget - (prj.spentBudget + prj.committedBudget);
                  return (
                    <span className="font-mono text-emerald-700">
                      {rem.toLocaleString()} ฿
                    </span>
                  );
                },
              },
              {
                key: 'utilRate',
                title: 'อัตราการเบิกจ่าย %',
                align: 'center',
                render: (prj) => {
                  const utilRate = ((prj.spentBudget / prj.allocatedBudget) * 100).toFixed(1);
                  return (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-14 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${Math.min(Number(utilRate), 100)}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-800 text-[11px]">
                        {utilRate}%
                      </span>
                    </div>
                  );
                },
              },
            ]}
            renderCard={(prj) => {
              const rem = prj.allocatedBudget - (prj.spentBudget + prj.committedBudget);
              const utilRate = ((prj.spentBudget / prj.allocatedBudget) * 100).toFixed(1);
              return {
                id: prj.id,
                title: prj.name,
                subtitle: `${prj.code} • ${prj.department}`,
                statusBadge: (
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    เบิกจ่าย {utilRate}%
                  </span>
                ),
                fields: [
                  { label: 'ผู้รับผิดชอบ', value: prj.responsiblePerson },
                  { label: 'งบจัดสรร', value: `${prj.allocatedBudget.toLocaleString()} ฿` },
                  { label: 'เบิกจ่ายแล้ว', value: `${prj.spentBudget.toLocaleString()} ฿` },
                  { label: 'คงเหลือ', value: `${rem.toLocaleString()} ฿` },
                ],
              };
            }}
          />
        </div>
      </div>
    </div>
  );
};
