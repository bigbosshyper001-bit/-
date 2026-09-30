import React, { useState } from 'react';
import {
  Compass,
  GitFork,
  Target,
  FolderKanban,
  ListTodo,
  TrendingUp,
  Coins,
  ShieldAlert,
  LayoutDashboard,
  Plus,
  Sparkles,
} from 'lucide-react';
import type { AppRoute } from '../types.ts';
import { Button } from '../components/ui/Button.tsx';
import { useToast } from '../components/ui/Toast.tsx';

// Sub-Components
import { StrategyHierarchyTree } from '../components/strategy/StrategyHierarchyTree.tsx';
import { ActionPlanTableView } from '../components/strategy/ActionPlanTableView.tsx';
import { KPITrackingView } from '../components/strategy/KPITrackingView.tsx';
import { BudgetManagementView } from '../components/strategy/BudgetManagementView.tsx';
import { RiskRegisterAndMatrixView } from '../components/strategy/RiskRegisterAndMatrixView.tsx';
import { StrategyOperationalDashboard } from '../components/strategy/StrategyOperationalDashboard.tsx';

// Data Store
import {
  INITIAL_STRATEGY_PILLARS,
  INITIAL_ACTION_PLANS,
  INITIAL_KPIS,
  INITIAL_BUDGET_DATA,
  INITIAL_RISKS,
  type StrategyPillar,
  type ActionPlanRecord,
  type KPIRecord,
  type RiskRecord,
  type BudgetOverviewData,
} from '../data/strategyModuleData.ts';

export type StrategySubTab =
  | 'dashboard'
  | 'hierarchy'
  | 'objectives'
  | 'projects'
  | 'action_plan'
  | 'kpi'
  | 'performance'
  | 'budget'
  | 'risk';

export interface StrategyModuleViewProps {
  onNavigate: (route: AppRoute) => void;
  initialTab?: StrategySubTab;
}

export const StrategyModuleView: React.FC<StrategyModuleViewProps> = ({
  onNavigate,
  initialTab = 'dashboard',
}) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<StrategySubTab>(initialTab);

  // Data States
  const [pillars, setPillars] = useState<StrategyPillar[]>(INITIAL_STRATEGY_PILLARS);
  const [actionPlans, setActionPlans] = useState<ActionPlanRecord[]>(INITIAL_ACTION_PLANS);
  const [kpis, setKPIs] = useState<KPIRecord[]>(INITIAL_KPIS);
  const [budgetData, setBudgetData] = useState<BudgetOverviewData>(INITIAL_BUDGET_DATA);
  const [risks, setRisks] = useState<RiskRecord[]>(INITIAL_RISKS);

  // Handlers for Data Mutations
  const handleUpdateActionPlan = (updated: ActionPlanRecord) => {
    setActionPlans((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const handleAddActionPlan = (newAct: ActionPlanRecord) => {
    setActionPlans((prev) => [newAct, ...prev]);
  };

  const handleUpdateKPI = (updatedKPI: KPIRecord) => {
    setKPIs((prev) =>
      prev.map((k) => (k.id === updatedKPI.id ? updatedKPI : k))
    );
  };

  const handleAddKPI = (newKPI: KPIRecord) => {
    setKPIs((prev) => [newKPI, ...prev]);
  };

  const handleUpdateRisk = (updatedRisk: RiskRecord) => {
    setRisks((prev) =>
      prev.map((r) => (r.id === updatedRisk.id ? updatedRisk : r))
    );
  };

  const handleAddRisk = (newRisk: RiskRecord) => {
    setRisks((prev) => [newRisk, ...prev]);
  };

  // Operational Drill Down router from Operational Dashboard
  const handleOperationalDrillDown = (
    target: 'kpi' | 'action_plan' | 'budget' | 'risk' | 'hierarchy'
  ) => {
    setActiveTab(target);
  };

  // Sub-Navigation Tabs definition (Strictly matching prompt menu hierarchy)
  const tabs = [
    { id: 'dashboard' as StrategySubTab, label: 'Dashboard ปฏิบัติการ', icon: LayoutDashboard },
    { id: 'hierarchy' as StrategySubTab, label: 'ยุทธศาสตร์', icon: GitFork, count: pillars.length },
    { id: 'objectives' as StrategySubTab, label: 'เป้าประสงค์', icon: Target },
    { id: 'projects' as StrategySubTab, label: 'โครงการ', icon: FolderKanban },
    { id: 'action_plan' as StrategySubTab, label: 'Action Plan', icon: ListTodo, count: actionPlans.length },
    { id: 'kpi' as StrategySubTab, label: 'KPI', icon: Target, count: kpis.length },
    { id: 'performance' as StrategySubTab, label: 'ผลการดำเนินงาน', icon: TrendingUp },
    { id: 'budget' as StrategySubTab, label: 'งบประมาณ', icon: Coins },
    { id: 'risk' as StrategySubTab, label: 'Risk Register', icon: ShieldAlert, count: risks.length },
  ];

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col">
      {/* 1. Header & Navigation Context */}
      <div className="px-4 sm:px-6 lg:px-8 pt-2 pb-4">
        {/* Breadcrumbs & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#B83B6F]">
              <span
                onClick={() => onNavigate('/dashboard')}
                className="cursor-pointer hover:underline"
              >
                หน้าแรก
              </span>
              <span>/</span>
              <span className="text-slate-700">แผนและยุทธศาสตร์</span>
              <span>/</span>
              <span className="text-slate-400 font-normal">
                {tabs.find((t) => t.id === activeTab)?.label}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              ระบบบริหารแผน ยุทธศาสตร์ KPI งบประมาณ และบริหารความเสี่ยง
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Strategic Planning, Performance Indicators, Budget & Risk Management • กองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('/dashboard')}
            >
              กลับสู่ Executive Dashboard
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveTab('action_plan')}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              สร้าง Action Plan
            </Button>
          </div>
        </div>

        {/* 2. Sub-Navigation Tabs (Menu 9 รายการตามระเบียบงานแผนและยุทธศาสตร์) */}
        <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto scrollbar-none pt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-[#B83B6F] text-[#B83B6F] bg-pink-50/40'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#B83B6F]' : 'text-slate-400'
                  }`}
                />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-[#B83B6F] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Workspace / Tab Body */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-12">
        {/* 1. Operational Dashboard */}
        {activeTab === 'dashboard' && (
          <StrategyOperationalDashboard
            kpis={kpis}
            actionPlans={actionPlans}
            budgetData={budgetData}
            risks={risks}
            pillars={pillars}
            onDrillDown={handleOperationalDrillDown}
          />
        )}

        {/* 2. Strategy Pillars / Hierarchy Tree */}
        {activeTab === 'hierarchy' && (
          <StrategyHierarchyTree
            pillars={pillars}
            actionPlans={actionPlans}
            kpis={kpis}
            onSelectActionPlan={() => setActiveTab('action_plan')}
            onSelectKPI={() => setActiveTab('kpi')}
          />
        )}

        {/* 3. Objectives Tab (Direct filter view of hierarchy) */}
        {activeTab === 'objectives' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-bold text-slate-900">
                เป้าประสงค์เชิงยุทธศาสตร์ (Strategic Objectives)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                เป้าประสงค์ 3 ข้อหลักที่ขับเคลื่อนตามยุทธศาสตร์ 3 ด้านของกองวิชาการ
              </p>
            </div>
            <StrategyHierarchyTree
              pillars={pillars}
              actionPlans={actionPlans}
              kpis={kpis}
            />
          </div>
        )}

        {/* 4. Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-bold text-slate-900">
                โครงการยุทธศาสตร์ประจำปีงบประมาณ 2569
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                โครงการพัฒนาวิชาการที่ได้รับการจัดสรรงบประมาณ
              </p>
            </div>
            <BudgetManagementView
              budgetData={budgetData}
              pillars={pillars}
            />
          </div>
        )}

        {/* 5. Action Plan Table */}
        {activeTab === 'action_plan' && (
          <ActionPlanTableView
            actionPlans={actionPlans}
            onUpdateActionPlan={handleUpdateActionPlan}
            onAddActionPlan={handleAddActionPlan}
          />
        )}

        {/* 6. KPI Tracking */}
        {activeTab === 'kpi' && (
          <KPITrackingView
            kpis={kpis}
            onUpdateKPI={handleUpdateKPI}
            onAddKPI={handleAddKPI}
          />
        )}

        {/* 7. Performance Tracking (ผลการดำเนินงาน) */}
        {activeTab === 'performance' && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-bold text-slate-900">
                ผลการดำเนินงานจริงรอบ 9 เดือน (Actual Performance & Milestone Tracking)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                เปรียบเทียบผลงานจริงกับค่าเป้าหมาย และเอกสารหลักฐานอ้างอิง
              </p>
            </div>
            <KPITrackingView
              kpis={kpis}
              onUpdateKPI={handleUpdateKPI}
              onAddKPI={handleAddKPI}
            />
          </div>
        )}

        {/* 8. Budget Management */}
        {activeTab === 'budget' && (
          <BudgetManagementView
            budgetData={budgetData}
            pillars={pillars}
          />
        )}

        {/* 9. Risk Register & Matrix */}
        {activeTab === 'risk' && (
          <RiskRegisterAndMatrixView
            risks={risks}
            onUpdateRisk={handleUpdateRisk}
            onAddRisk={handleAddRisk}
          />
        )}
      </div>
    </div>
  );
};
