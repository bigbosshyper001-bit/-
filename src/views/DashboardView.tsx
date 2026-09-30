import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Target,
  BookOpen,
  GraduationCap,
  CalendarCheck,
  FileCheck,
  ShieldAlert,
  Wallet,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { AppRoute } from '../types.ts';
import { KPICard } from '../components/ui/KPICard.tsx';
import { StatusBadge } from '../components/ui/StatusBadge.tsx';
import { Button } from '../components/ui/Button.tsx';
import { ChartCard } from '../components/ui/ChartCard.tsx';
import { useToast } from '../components/ui/Toast.tsx';

// Executive Dashboard Modules
import { ExecutiveHeader } from '../components/dashboard/ExecutiveHeader.tsx';
import { MobileDashboard } from '../components/dashboard/MobileDashboard.tsx';
import { TopSummaryKPI } from '../components/dashboard/TopSummaryKPI.tsx';
import { AttentionSection } from '../components/dashboard/AttentionSection.tsx';
import { MainVisualizations } from '../components/dashboard/MainVisualizations.tsx';
import { UpcomingDeadlinesList } from '../components/dashboard/UpcomingDeadlinesList.tsx';
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed.tsx';
import { QuickActionModal, type QuickActionType } from '../components/dashboard/QuickActionModal.tsx';
import { KPIDetailModal } from '../components/dashboard/KPIDetailModal.tsx';
import { RiskDetailModal } from '../components/dashboard/RiskDetailModal.tsx';
import { ApprovalDetailModal } from '../components/dashboard/ApprovalDetailModal.tsx';
import { DeadlineDetailModal } from '../components/dashboard/DeadlineDetailModal.tsx';
import { centralProactiveService } from '../services/centralProactiveService.ts';
import { apiClient } from '../services/apiClient.ts';

// Demo Data Store
import {
  DEMO_KPIS,
  DEMO_ACTION_PLANS,
  DEMO_RISKS,
  DEMO_MEETINGS,
  DEMO_PENDING_APPROVALS,
  DEMO_UPCOMING_DEADLINES,
  DEMO_RECENT_ACTIVITIES,
  DEMO_BUDGET,
  type DashboardKPI,
  type ActionPlanItem,
  type RiskItem,
  type PendingApprovalItem,
  type UpcomingDeadlineItem,
  type RecentActivityItem,
  type MeetingItem,
} from '../data/executiveDashboardData.ts';

export interface DashboardViewProps {
  onNavigate: (route: AppRoute) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { showToast } = useToast();

  // Filters State
  const [fiscalYear, setFiscalYear] = useState('2569');
  const [department, setDepartment] = useState('all');
  const [period, setPeriod] = useState('q3');

  // Dynamic lists from database (initialized empty / zero state)
  const [kpis, setKpis] = useState<DashboardKPI[]>(DEMO_KPIS);
  const [actionPlans, setActionPlans] = useState<ActionPlanItem[]>(DEMO_ACTION_PLANS);
  const [risks, setRisks] = useState<RiskItem[]>(DEMO_RISKS);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApprovalItem[]>(DEMO_PENDING_APPROVALS);
  const [meetings, setMeetings] = useState<MeetingItem[]>(DEMO_MEETINGS);
  const [budget, setBudget] = useState(DEMO_BUDGET);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real persistent data on mount
  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [kpisRes, actionPlansRes, risksRes, meetingsRes, budgetRes] = await Promise.all([
          apiClient.getCollection<DashboardKPI>('kpis'),
          apiClient.getCollection<ActionPlanItem>('action_plans'),
          apiClient.getCollection<RiskItem>('risks'),
          apiClient.getCollection<MeetingItem>('meetings'),
          apiClient.getCollection<any>('budgets'),
        ]);

        if (!isMounted) return;

        if (kpisRes.success && Array.isArray(kpisRes.data)) {
          setKpis(kpisRes.data);
        } else {
          setKpis([]);
        }
        if (actionPlansRes.success && Array.isArray(actionPlansRes.data)) {
          const normalizedPlans: ActionPlanItem[] = actionPlansRes.data.map((p: any) => ({
            id: p.id,
            code: p.code || 'AP',
            title: p.title || 'โครงการยุทธศาสตร์',
            strategicObjective: p.strategicObjective || p.strategyName || 'ยุทธศาสตร์วิชาการ มจร',
            department: p.department || 'กองวิชาการ',
            budgetAllocated: Number(p.budgetAllocated ?? p.budget ?? 0),
            budgetSpent: Number(p.budgetSpent ?? p.spentBudget ?? 0),
            progress: Number(p.progress ?? 0),
            status: p.status || 'in-progress',
            dueDate: p.dueDate || p.endDate || '2026-09-30',
            responsiblePerson: p.responsiblePerson || '',
          }));
          setActionPlans(normalizedPlans);
        } else {
          setActionPlans([]);
        }
        if (risksRes.success && Array.isArray(risksRes.data)) {
          setRisks(risksRes.data);
        } else {
          setRisks([]);
        }
        if (meetingsRes.success && Array.isArray(meetingsRes.data)) {
          setMeetings(meetingsRes.data);
        } else {
          setMeetings([]);
        }
        if (budgetRes.success && Array.isArray(budgetRes.data) && budgetRes.data.length > 0) {
          const b = budgetRes.data[0];
          setBudget({
            totalAllocated: b.totalAllocated || 0,
            committed: b.committed || 0,
            spent: b.spent || 0,
            remaining: b.remaining || (b.totalAllocated - b.spent),
            spentPercentage: b.totalAllocated > 0 ? Math.round((b.spent / b.totalAllocated) * 100) : 0,
            committedPercentage: b.totalAllocated > 0 ? Math.round((b.committed / b.totalAllocated) * 100) : 0,
            remainingPercentage: b.totalAllocated > 0 ? Math.round(((b.totalAllocated - b.spent) / b.totalAllocated) * 100) : 0,
            facultyAllocations: b.facultyAllocations || [],
            monthlyTrend: b.monthlyTrend || [],
          });
        } else {
          setBudget(DEMO_BUDGET);
        }
      } catch (err) {
        console.error('[DashboardView] Failed to load persistent data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync with centralProactiveService deadlines
  const getProactiveDeadlines = (): UpcomingDeadlineItem[] => {
    const raw = centralProactiveService.getDeadlines();
    if (raw.length === 0) return [];

    return raw.slice(0, 6).map((r) => {
      const calc = centralProactiveService.calculateDeadline(r.dueDate);
      let urgency: 'red' | 'orange' | 'green' = 'green';
      if (calc.urgencyStatus === 'overdue' || calc.urgencyStatus === 'today' || calc.urgencyStatus === 'due_soon_1') {
        urgency = 'red';
      } else if (calc.urgencyStatus === 'due_soon_3' || calc.urgencyStatus === 'due_soon_7') {
        urgency = 'orange';
      }

      let category: 'curriculum' | 'mou' | 'meeting' | 'report' | 'kpi' = 'curriculum';
      if (r.module === 'meetings') category = 'meeting';
      else if (r.module === 'collaboration' || r.category === 'MOU') category = 'mou';
      else if (r.module === 'strategy' || r.category === 'KPI') category = 'kpi';
      else if (r.module === 'documents') category = 'report';

      return {
        id: r.id,
        title: r.title,
        category,
        daysLeft: Math.max(0, calc.daysDiff),
        deadlineDate: r.dueDate,
        department: r.department || 'กองวิชาการ',
        urgencyLevel: urgency,
        targetRoute: r.actionLink || '/meetings',
      };
    });
  };

  const [deadlines, setDeadlines] = useState<UpcomingDeadlineItem[]>(() => getProactiveDeadlines());
  const [activities, setActivities] = useState<RecentActivityItem[]>(DEMO_RECENT_ACTIVITIES);

  // React to proactive service changes
  React.useEffect(() => {
    return centralProactiveService.subscribe(() => {
      setDeadlines(getProactiveDeadlines());
    });
  }, []);

  // Modals State
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<DashboardKPI | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<PendingApprovalItem | null>(null);
  const [selectedDeadline, setSelectedDeadline] = useState<UpcomingDeadlineItem | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<ActionPlanItem | null>(null);

  // Derived Metrics (Calculated dynamically from live datasets)
  const totalTasksCount = actionPlans.length;
  const completedTasksCount = actionPlans.filter((p) => p.status === 'completed').length;
  const dueSoonTasksCount = actionPlans.filter((p) => p.status === 'in-progress').length;
  const overdueTasksCount = actionPlans.filter((p) => p.status === 'delayed').length;

  const totalKPIsCount = kpis.length;
  const achievedKPIsCount = kpis.filter((k) => k.status === 'achieved').length;
  const laggingKPIs = kpis.filter((k) => k.status === 'lagging');
  const kpiAchievement = totalKPIsCount > 0 ? Math.round((achievedKPIsCount / totalKPIsCount) * 100) : 0;

  const criticalAndHighRisks = risks.filter((r) => r.level === 'critical' || r.level === 'high');
  const overdueActionPlans = actionPlans.filter((p) => p.status === 'delayed');

  // Handle Quick Action Creation
  const handleItemCreated = (type: QuickActionType, title: string) => {
    // Add to activity feed
    const newActivity: RecentActivityItem = {
      id: `act-${Date.now()}`,
      user: 'ผู้บริหารกองวิชาการ',
      userRole: 'ผู้บริหารระบบ',
      action: `สร้าง${type === 'meeting' ? 'การประชุม' : type === 'kpi' ? 'KPI' : 'รายการใหม่'}`,
      target: title,
      timeAgo: 'เมื่อสักครู่',
      category: type === 'kpi' ? 'kpi' : type === 'risk' ? 'risk' : 'document',
    };
    setActivities([newActivity, ...activities]);
  };

  // Handle Approval Action
  const handleApprovalSuccess = (approvalId: string) => {
    setPendingApprovals((prev) => prev.filter((item) => item.id !== approvalId));
    // Add to activities
    const targetItem = pendingApprovals.find((i) => i.id === approvalId);
    if (targetItem) {
      const newActivity: RecentActivityItem = {
        id: `act-${Date.now()}`,
        user: 'พระมหาวรเชษฐ์ สุเมโธ',
        userRole: 'ผอ.กองวิชาการ',
        action: 'อนุมัติ / ลงนามเอกสาร',
        target: targetItem.title,
        timeAgo: 'เมื่อสักครู่',
        category: 'resolution',
      };
      setActivities([newActivity, ...activities]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. EXECUTIVE HEADER (Title, Dates, Fiscal Year, Dimension Filters, Quick Action Button) */}
      <ExecutiveHeader
        fiscalYear={fiscalYear}
        onFiscalYearChange={setFiscalYear}
        department={department}
        onDepartmentChange={setDepartment}
        period={period}
        onPeriodChange={setPeriod}
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
      />

      {/* MOBILE DASHBOARD VIEW (Task-oriented, prioritized, touch-optimized) */}
      <div className="block md:hidden">
        <MobileDashboard
          kpis={kpis}
          actionPlans={actionPlans}
          risks={risks}
          pendingApprovals={pendingApprovals}
          deadlines={deadlines}
          meetings={meetings}
          onNavigate={onNavigate}
          onOpenKPIModal={(kpi) => setSelectedKPI(kpi)}
          onOpenRiskModal={(risk) => setSelectedRisk(risk)}
          onOpenApprovalModal={(app) => setSelectedApproval(app)}
          onOpenDeadlineModal={(dl) => setSelectedDeadline(dl)}
          onApproveSuccess={handleApprovalSuccess}
        />
      </div>

      {/* DESKTOP DASHBOARD VIEW (Information-dense workspace - PRESERVED) */}
      <div className="hidden md:block space-y-6">
        {/* 2. TOP KPI SUMMARY (Visual hierarchy: Operational Execution, KPI Achievement, Budget, Attention Radar) */}
      <div className="px-4 sm:px-6 lg:px-8">
        <TopSummaryKPI
          totalTasks={totalTasksCount}
          completedTasks={completedTasksCount}
          dueSoonTasks={dueSoonTasksCount}
          overdueTasks={overdueTasksCount}
          kpiAchievement={kpiAchievement}
          totalKPIs={totalKPIsCount}
          achievedKPIs={achievedKPIsCount}
          budgetUtilization={budget.spentPercentage}
          budgetSpentFormatted={`${(budget.spent / 1000000).toFixed(2)} ล้านบาท`}
          totalBudgetFormatted={`${(budget.totalAllocated / 1000000).toFixed(2)} ล้านบาท`}
          criticalRisks={criticalAndHighRisks.length}
          pendingApprovals={pendingApprovals.length}
          onNavigate={onNavigate}
          onOpenKPIModal={() => { if (kpis.length > 0) setSelectedKPI(kpis[0]); }}
          onOpenRiskModal={() => { if (risks.length > 0) setSelectedRisk(risks[0]); }}
          onOpenApprovalModal={() => { if (pendingApprovals.length > 0) setSelectedApproval(pendingApprovals[0]); }}
        />
      </div>

      {/* 3. ATTENTION AREA ("สิ่งที่ต้องดำเนินการ" - Overdue, Deadlines, Pending Approvals, Lagging KPIs, High Risks) */}
      <div className="px-4 sm:px-6 lg:px-8">
        <AttentionSection
          pendingApprovals={pendingApprovals}
          highRisks={criticalAndHighRisks}
          laggingKPIs={laggingKPIs}
          overdueTasks={overdueActionPlans}
          upcomingDeadlines={deadlines}
          onNavigate={onNavigate}
          onOpenApproval={(app) => setSelectedApproval(app)}
          onOpenRisk={(risk) => setSelectedRisk(risk)}
          onOpenKPI={(kpi) => setSelectedKPI(kpi)}
          onOpenDeadline={(dl) => setSelectedDeadline(dl)}
        />
      </div>

      {/* 4. MAIN VISUALIZATION (KPI Achievement, Action Plan Progress, Budget 4-Pillars, Risk Matrix) */}
      <div className="px-4 sm:px-6 lg:px-8">
        <MainVisualizations
          kpis={kpis}
          actionPlans={actionPlans}
          risks={risks}
          onNavigate={onNavigate}
          onOpenKPI={(kpi) => setSelectedKPI(kpi)}
          onOpenRisk={(risk) => setSelectedRisk(risk)}
          onOpenPlan={(plan) => {
            // Can open plan detail or navigate to strategy
            onNavigate('/strategy');
          }}
        />
      </div>

      {/* 5. BOTTOM 2-COLUMN GRID: Upcoming Deadlines & Recent Activities */}
      <div className="px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upcoming Deadlines Timeline (Span 7) */}
        <div className="lg:col-span-7">
          <UpcomingDeadlinesList
            deadlines={deadlines}
            onNavigate={onNavigate}
            onOpenDeadline={(dl) => setSelectedDeadline(dl)}
          />
        </div>

        {/* Recent Activities Live Feed (Span 5) */}
        <div className="lg:col-span-5">
          <RecentActivityFeed activities={activities} />
        </div>
      </div>

      {/* 6. Quick Academic Service Shortcuts (Navigation Hub) */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-bold text-slate-900">
              ทางลัดโมดูลบริการวิชาการ (Academic Affairs Hub)
            </h3>
            <span className="text-xs text-slate-500">
              เข้าถึง 14 ระบบงานหลักของกองวิชาการ มจร
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
            <button
              onClick={() => onNavigate('/meetings')}
              className="p-3 rounded-lg border border-slate-200 hover:border-[#3977C8] hover:bg-blue-50/40 text-left transition-all group"
            >
              <CalendarCheck className="w-4 h-4 text-[#3977C8] mb-1.5" />
              <span className="font-semibold text-slate-800 block group-hover:text-[#255494]">
                สภาวิชาการ
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                การประชุม & มติ
              </span>
            </button>

            <button
              onClick={() => onNavigate('/courses')}
              className="p-3 rounded-lg border border-slate-200 hover:border-[#7357B8] hover:bg-purple-50/40 text-left transition-all group"
            >
              <BookOpen className="w-4 h-4 text-[#7357B8] mb-1.5" />
              <span className="font-semibold text-slate-800 block group-hover:text-[#583D99]">
                หลักสูตร
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                ปรับปรุงรอบ 5 ปี
              </span>
            </button>

            <button
              onClick={() => onNavigate('/credit-bank')}
              className="p-3 rounded-lg border border-slate-200 hover:border-[#168C8C] hover:bg-teal-50/40 text-left transition-all group"
            >
              <GraduationCap className="w-4 h-4 text-[#168C8C] mb-1.5" />
              <span className="font-semibold text-slate-800 block group-hover:text-[#0D6262]">
                Credit Bank
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                ธนาคารหน่วยกิต
              </span>
            </button>

            <button
              onClick={() => onNavigate('/strategy')}
              className="p-3 rounded-lg border border-slate-200 hover:border-[#D94F87] hover:bg-pink-50/40 text-left transition-all group"
            >
              <Target className="w-4 h-4 text-[#D94F87] mb-1.5" />
              <span className="font-semibold text-slate-800 block group-hover:text-[#A72B60]">
                แผนยุทธศาสตร์
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                KPI & Risk
              </span>
            </button>

            <button
              onClick={() => onNavigate('/forms')}
              className="p-3 rounded-lg border border-slate-200 hover:border-[#E59A35] hover:bg-amber-50/40 text-left transition-all group"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#E59A35] mb-1.5" />
              <span className="font-semibold text-slate-800 block group-hover:text-[#B87417]">
                คำร้อง E-Form
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                14 แบบฟอร์ม
              </span>
            </button>

            <button
              onClick={() => onNavigate('/faculty')}
              className="p-3 rounded-lg border border-slate-200 hover:border-[#3A9D68] hover:bg-emerald-50/40 text-left transition-all group"
            >
              <Sparkles className="w-4 h-4 text-[#3A9D68] mb-1.5" />
              <span className="font-semibold text-slate-800 block group-hover:text-[#237046]">
                Thailand PSF
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                สมรรถนะอาจารย์
              </span>
            </button>

            <button
              onClick={() => onNavigate('/regulatory')}
              className="p-3 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-left transition-all group"
            >
              <FileCheck className="w-4 h-4 text-slate-600 mb-1.5" />
              <span className="font-semibold text-slate-800 block group-hover:text-slate-900">
                เกณฑ์ อว.
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                มาตรฐานวิชาการ
              </span>
            </button>

            <button
              onClick={() => onNavigate('/documents')}
              className="p-3 rounded-lg border border-slate-200 hover:border-[#B83B6F] hover:bg-pink-50/40 text-left transition-all group"
            >
              <Layers className="w-4 h-4 text-[#B83B6F] mb-1.5" />
              <span className="font-semibold text-slate-800 block group-hover:text-[#942854]">
                คลังเอกสารกลาง
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Library & Version
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* INTERACTIVE MODALS */}
      {/* 1. Quick Action Modal (+ สร้างรายการ) */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onSuccessCreated={handleItemCreated}
      />

      {/* 2. KPI Detail Modal */}
      <KPIDetailModal
        kpi={selectedKPI}
        isOpen={!!selectedKPI}
        onClose={() => setSelectedKPI(null)}
        onNavigate={onNavigate}
      />

      {/* 3. Risk Detail Modal */}
      <RiskDetailModal
        risk={selectedRisk}
        isOpen={!!selectedRisk}
        onClose={() => setSelectedRisk(null)}
        onNavigate={onNavigate}
      />

      {/* 4. Approval Detail Modal */}
      <ApprovalDetailModal
        item={selectedApproval}
        isOpen={!!selectedApproval}
        onClose={() => setSelectedApproval(null)}
        onNavigate={onNavigate}
        onApproved={handleApprovalSuccess}
      />

      {/* 5. Deadline Detail Modal */}
      <DeadlineDetailModal
        item={selectedDeadline}
        isOpen={!!selectedDeadline}
        onClose={() => setSelectedDeadline(null)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
