import React, { useState } from 'react';
import {
  GitFork,
  ChevronDown,
  ChevronRight,
  Target,
  FolderGit2,
  ListTodo,
  CheckCircle2,
  TrendingUp,
  Building2,
  Award,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import type {
  StrategyPillar,
  ActionPlanRecord,
  KPIRecord,
} from '../../data/strategyModuleData.ts';

export interface StrategyHierarchyTreeProps {
  pillars: StrategyPillar[];
  actionPlans: ActionPlanRecord[];
  kpis: KPIRecord[];
  onSelectActionPlan?: (act: ActionPlanRecord) => void;
  onSelectKPI?: (kpi: KPIRecord) => void;
}

export const StrategyHierarchyTree: React.FC<StrategyHierarchyTreeProps> = ({
  pillars,
  actionPlans,
  kpis,
  onSelectActionPlan,
  onSelectKPI,
}) => {
  // State for expanded nodes: e.g. { 'pillar-str-01': true, 'obj-obj-01': true, 'prj-prj-01': true }
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'pillar-str-01': true,
    'obj-obj-01': true,
    'prj-prj-01': true,
    'act-act-01': true,
  });

  const toggleNode = (nodeKey: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeKey]: !prev[nodeKey],
    }));
  };

  const handleExpandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    (pillars || []).forEach((p) => {
      allExpanded[`pillar-${p.id}`] = true;
      (p.objectives || []).forEach((obj) => {
        allExpanded[`obj-${obj.id}`] = true;
        (obj.projects || []).forEach((prj) => {
          allExpanded[`prj-${prj.id}`] = true;
        });
      });
    });
    (actionPlans || []).forEach((act) => {
      allExpanded[`act-${act.id}`] = true;
    });
    setExpandedNodes(allExpanded);
  };

  const handleCollapseAll = () => {
    setExpandedNodes({});
  };

  return (
    <div className="space-y-4">
      {/* Header & Hierarchy Flow Breadcrumb Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#B83B6F]">
              <GitFork className="w-3.5 h-3.5" />
              <span>ลำดับชั้นยุทธศาสตร์วิชาการ (Strategy Cascading Hierarchy)</span>
            </div>
            {/* Visual Hierarchy Step Bar */}
            <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-semibold text-slate-600 mt-2">
              <span className="bg-pink-100 text-[#B83B6F] px-2 py-0.5 rounded font-bold">1. ยุทธศาสตร์</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">2. เป้าประสงค์</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-bold">3. โครงการ</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">4. Action Plan</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">5. KPI & ผลสัมฤทธิ์</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleExpandAll}>
              ขยายทั้งหมด
            </Button>
            <Button variant="outline" size="sm" onClick={handleCollapseAll}>
              ยุบทั้งหมด
            </Button>
          </div>
        </div>
      </div>

      {/* Cascading Tree Nodes Container */}
      <div className="space-y-3">
        {pillars.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <GitFork className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">ยังไม่มีข้อมูลยุทธศาสตร์ในระบบ</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              ท่านสามารถเพิ่มยุทธศาสตร์ เป้าประสงค์ โครงการ และแผนปฏิบัติการเพื่อเริ่มติดตามผลการดำเนินงาน
            </p>
          </div>
        ) : (
          pillars.map((pillar) => {
          const isPillarOpen = !!expandedNodes[`pillar-${pillar.id}`];

          return (
            <div
              key={pillar.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
            >
              {/* LEVEL 1: ยุทธศาสตร์ (Strategy Pillar) */}
              <div
                onClick={() => toggleNode(`pillar-${pillar.id}`)}
                className="p-4 bg-gradient-to-r from-pink-50/70 via-white to-white flex items-center justify-between cursor-pointer hover:bg-pink-50/90 transition-colors border-b border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-pink-100 text-[#B83B6F]">
                    {isPillarOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#B83B6F] bg-white border border-pink-200 px-2 py-0.5 rounded">
                        {pillar.code}
                      </span>
                      <span className="text-xs text-slate-500">ผู้กำกับ: {pillar.leader}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                      {pillar.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-400 block">งบประมาณรวม</span>
                    <span className="font-mono font-bold text-slate-800">
                      {((pillar.totalBudget || 0) / 1000000).toFixed(2)} ลบ.
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                    {(pillar.objectives || []).length} เป้าประสงค์
                  </span>
                </div>
              </div>

              {/* LEVEL 2: เป้าประสงค์ (Objectives) */}
              {isPillarOpen && (
                <div className="p-4 pl-6 sm:pl-10 space-y-4 bg-[#FCFCFD]">
                  {(pillar.objectives || []).map((obj) => {
                    const isObjOpen = !!expandedNodes[`obj-${obj.id}`];

                    return (
                      <div
                        key={obj.id}
                        className="rounded-xl border border-slate-200 bg-white overflow-hidden"
                      >
                        {/* Objective Header */}
                        <div
                          onClick={() => toggleNode(`obj-${obj.id}`)}
                          className="p-3.5 bg-blue-50/40 flex items-center justify-between cursor-pointer hover:bg-blue-50/70 transition-colors border-b border-slate-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1 rounded bg-blue-100 text-blue-700">
                              {isObjOpen ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div>
                              <span className="text-[10px] font-mono font-bold text-blue-700 bg-white border border-blue-200 px-2 py-0.5 rounded">
                                {obj.code}
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                                {obj.name}
                              </h4>
                            </div>
                          </div>
                          <span className="font-mono text-xs text-slate-500">
                            {(obj.projects || []).length} โครงการ
                          </span>
                        </div>

                        {/* LEVEL 3: โครงการ (Strategic Projects) */}
                        {isObjOpen && (
                          <div className="p-3.5 pl-6 sm:pl-8 space-y-3 bg-[#FAFAFC]">
                            {(obj.projects || []).map((prj) => {
                              const isPrjOpen = !!expandedNodes[`prj-${prj.id}`];
                              // Find Action Plans associated with this project
                              const prjActionPlans = actionPlans.filter(
                                (act) =>
                                  act.projectId === prj.id ||
                                  act.strategyId === pillar.id
                              );

                              return (
                                <div
                                  key={prj.id}
                                  className="rounded-lg border border-slate-200 bg-white overflow-hidden"
                                >
                                  {/* Project Header */}
                                  <div
                                    onClick={() => toggleNode(`prj-${prj.id}`)}
                                    className="p-3 bg-teal-50/30 flex items-center justify-between cursor-pointer hover:bg-teal-50/60 transition-colors"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <div className="p-1 rounded bg-teal-100 text-teal-800">
                                        {isPrjOpen ? (
                                          <ChevronDown className="w-3 h-3" />
                                        ) : (
                                          <ChevronRight className="w-3 h-3" />
                                        )}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-mono font-bold text-teal-800 bg-white border border-teal-200 px-1.5 py-0.2 rounded">
                                            {prj.code}
                                          </span>
                                          <span className="text-[11px] text-slate-500">
                                            {prj.department} • {prj.responsiblePerson}
                                          </span>
                                        </div>
                                        <h5 className="text-xs font-bold text-slate-900 mt-0.5">
                                          {prj.name}
                                        </h5>
                                      </div>
                                    </div>

                                    <div className="text-right text-xs">
                                      <span className="font-mono font-bold text-teal-800">
                                        {(prj.allocatedBudget / 1000000).toFixed(2)} ลบ.
                                      </span>
                                    </div>
                                  </div>

                                  {/* LEVEL 4: Action Plans & Level 5: KPIs */}
                                  {isPrjOpen && (
                                    <div className="p-3 pl-6 sm:pl-8 space-y-3 bg-[#F8F9FA] border-t border-slate-100">
                                      {prjActionPlans.length === 0 ? (
                                        <div className="text-slate-400 text-xs italic py-1">
                                          ไม่มี Action Plan ผูกกับโครงการนี้
                                        </div>
                                      ) : (
                                        prjActionPlans.map((act) => {
                                          const isActOpen =
                                            !!expandedNodes[`act-${act.id}`];
                                          // Find KPIs linked to this action plan
                                          const linkedKPIs = kpis.filter(
                                            (k) =>
                                              act.kpiIds.includes(k.id) ||
                                              k.strategyPillarId === pillar.id
                                          );

                                          return (
                                            <div
                                              key={act.id}
                                              className="rounded-lg border border-slate-200 bg-white p-3 space-y-2.5"
                                            >
                                              {/* Action Plan Info */}
                                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div className="space-y-1">
                                                  <div className="flex items-center gap-2">
                                                    <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                                                      {act.code} (Action Plan)
                                                    </span>
                                                    <span
                                                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                                        act.status === 'completed'
                                                          ? 'bg-emerald-50 text-emerald-700'
                                                          : act.status === 'delayed'
                                                          ? 'bg-rose-50 text-rose-700'
                                                          : 'bg-blue-50 text-blue-700'
                                                      }`}
                                                    >
                                                      {act.status.replace('_', ' ')}
                                                    </span>
                                                  </div>
                                                  <h6 className="text-xs font-bold text-slate-900">
                                                    {act.title}
                                                  </h6>
                                                  <p className="text-[11px] text-slate-500">
                                                    ผู้รับผิดชอบ: {act.responsiblePerson} ({act.department})
                                                  </p>
                                                </div>

                                                {/* Progress & Budget */}
                                                <div className="flex items-center gap-4 text-xs shrink-0">
                                                  <div className="text-right">
                                                    <span className="text-[10px] text-slate-400 block">งบดำเนินการ</span>
                                                    <span className="font-mono font-bold text-slate-800">
                                                      {act.budget.toLocaleString()} ฿
                                                    </span>
                                                  </div>

                                                  <div className="w-24">
                                                    <div className="flex justify-between text-[10px] font-mono font-bold mb-1">
                                                      <span className="text-slate-500">Progress</span>
                                                      <span className="text-slate-800">{act.progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                      <div
                                                        className={`h-full rounded-full ${
                                                          act.progress === 100
                                                            ? 'bg-emerald-500'
                                                            : act.status === 'delayed'
                                                            ? 'bg-rose-500'
                                                            : 'bg-purple-600'
                                                        }`}
                                                        style={{ width: `${act.progress}%` }}
                                                      />
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* LEVEL 5: KPI (Target ↓ Actual ↓ Progress) */}
                                              {linkedKPIs.length > 0 && (
                                                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                                    ตัวชี้วัดความสำเร็จที่ผูกโยง (Linked KPIs):
                                                  </span>
                                                  {linkedKPIs.map((kpi) => (
                                                    <div
                                                      key={kpi.id}
                                                      onClick={() => onSelectKPI?.(kpi)}
                                                      className="p-2.5 rounded bg-emerald-50/50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-emerald-50 transition-colors cursor-pointer"
                                                    >
                                                      <div className="space-y-0.5">
                                                        <div className="flex items-center gap-1.5">
                                                          <span className="font-mono font-bold text-[10px] text-emerald-800 bg-white border border-emerald-300 px-1.5 py-0.2 rounded">
                                                            {kpi.code}
                                                          </span>
                                                          <span className="font-bold text-slate-800 text-[11px]">
                                                            {kpi.name}
                                                          </span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-500">
                                                          ความถี่: {kpi.frequency} • เจ้าภาพ: {kpi.department}
                                                        </p>
                                                      </div>

                                                      {/* Target vs Actual vs Achievement */}
                                                      <div className="flex items-center gap-4 text-right shrink-0">
                                                        <div>
                                                          <span className="text-[9px] text-slate-400 block uppercase">Target</span>
                                                          <span className="font-mono font-bold text-slate-700">
                                                            {kpi.target} {kpi.unit}
                                                          </span>
                                                        </div>
                                                        <div>
                                                          <span className="text-[9px] text-slate-400 block uppercase">Actual</span>
                                                          <span className="font-mono font-bold text-emerald-700">
                                                            {kpi.actual} {kpi.unit}
                                                          </span>
                                                        </div>
                                                        <div className="bg-white border border-emerald-300 px-2 py-1 rounded text-center min-w-[65px]">
                                                          <span className="text-[9px] text-slate-400 block">Achievement</span>
                                                          <span className="font-mono font-extrabold text-emerald-800">
                                                            {kpi.achievementPercentage}%
                                                          </span>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
        )}
      </div>
    </div>
  );
};
