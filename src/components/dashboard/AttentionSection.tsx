import React, { useState } from 'react';
import {
  AlertCircle,
  Clock,
  FileCheck,
  ShieldAlert,
  Target,
  ArrowRight,
  Filter,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import type { AppRoute } from '../../types.ts';
import type {
  PendingApprovalItem,
  RiskItem,
  DashboardKPI,
  UpcomingDeadlineItem,
  ActionPlanItem,
} from '../../data/executiveDashboardData.ts';

export interface AttentionSectionProps {
  pendingApprovals: PendingApprovalItem[];
  highRisks: RiskItem[];
  laggingKPIs: DashboardKPI[];
  overdueTasks: ActionPlanItem[];
  upcomingDeadlines: UpcomingDeadlineItem[];
  onNavigate: (route: AppRoute) => void;
  onOpenApproval: (item: PendingApprovalItem) => void;
  onOpenRisk: (item: RiskItem) => void;
  onOpenKPI: (item: DashboardKPI) => void;
  onOpenDeadline: (item: UpcomingDeadlineItem) => void;
}

type AttentionTab = 'all' | 'overdue' | 'approvals' | 'risks' | 'kpis';

export const AttentionSection: React.FC<AttentionSectionProps> = ({
  pendingApprovals,
  highRisks,
  laggingKPIs,
  overdueTasks,
  upcomingDeadlines,
  onNavigate,
  onOpenApproval,
  onOpenRisk,
  onOpenKPI,
  onOpenDeadline,
}) => {
  const [activeTab, setActiveTab] = useState<AttentionTab>('all');

  // Prepare unified priority list
  interface PriorityItem {
    id: string;
    type: 'overdue' | 'approval' | 'risk' | 'kpi' | 'deadline';
    priorityScore: number; // 1 (highest) to 5
    priorityBadge: { text: string; bg: string; textCol: string; border: string };
    title: string;
    subtitle: string;
    department: string;
    timeOrMetric: string;
    actionLabel: string;
    originalItem: any;
  }

  const priorityList: PriorityItem[] = [];

  // 1. Overdue tasks
  overdueTasks.forEach((task) => {
    priorityList.push({
      id: `task-${task.id}`,
      type: 'overdue',
      priorityScore: 1,
      priorityBadge: {
        text: 'งานล่าช้ากว่ากำหนด',
        bg: 'bg-rose-50',
        textCol: 'text-rose-700',
        border: 'border-rose-200',
      },
      title: task.title,
      subtitle: `${task.code} • ผู้รับผิดชอบ: ${task.responsiblePerson}`,
      department: task.department,
      timeOrMetric: `ครบกำหนด: ${task.dueDate} (ความคืบหน้า ${task.progress}%)`,
      actionLabel: 'ติดตามงาน',
      originalItem: task,
    });
  });

  // 2. Critical / High Risks
  highRisks.forEach((risk) => {
    const isCritical = risk.level === 'critical';
    priorityList.push({
      id: `risk-${risk.id}`,
      type: 'risk',
      priorityScore: isCritical ? 1 : 2,
      priorityBadge: {
        text: isCritical ? 'ความเสี่ยงระดับวิกฤต' : 'ความเสี่ยงระดับสูง',
        bg: isCritical ? 'bg-rose-50' : 'bg-amber-50',
        textCol: isCritical ? 'text-rose-700' : 'text-amber-700',
        border: isCritical ? 'border-rose-200' : 'border-amber-200',
      },
      title: risk.title,
      subtitle: `มาตรการ: ${risk.mitigationPlan}`,
      department: risk.department,
      timeOrMetric: `คะแนนความเสี่ยง: ${risk.score}/25 • ผู้ดูแล: ${risk.owner}`,
      actionLabel: 'ตรวจมาตรการ',
      originalItem: risk,
    });
  });

  // 3. Urgent Pending Approvals (daysRemaining <= 3)
  pendingApprovals
    .filter((a) => a.daysRemaining <= 4)
    .forEach((app) => {
      priorityList.push({
        id: `app-${app.id}`,
        type: 'approval',
        priorityScore: app.urgency === 'critical' ? 1 : 2,
        priorityBadge: {
          text: app.urgency === 'critical' ? 'รอลงนามด่วนที่สุด' : 'รอพิจารณาอนุมัติ',
          bg: app.urgency === 'critical' ? 'bg-rose-50' : 'bg-amber-50',
          textCol: app.urgency === 'critical' ? 'text-rose-700' : 'text-amber-700',
          border: app.urgency === 'critical' ? 'border-rose-200' : 'border-amber-200',
        },
        title: app.title,
        subtitle: `ประเภท: ${app.type} • ผู้เสนอ: ${app.submitter}`,
        department: app.department,
        timeOrMetric: `เหลือเวลา: ${app.daysRemaining} วัน (ยื่น ${app.submittedDate})`,
        actionLabel: 'พิจารณาลงนาม',
        originalItem: app,
      });
    });

  // 4. Lagging KPIs
  laggingKPIs.forEach((kpi) => {
    priorityList.push({
      id: `kpi-${kpi.id}`,
      type: 'kpi',
      priorityScore: 3,
      priorityBadge: {
        text: 'KPI ต่ำกว่าเกณฑ์เป้าหมาย',
        bg: 'bg-orange-50',
        textCol: 'text-orange-700',
        border: 'border-orange-200',
      },
      title: kpi.title,
      subtitle: `${kpi.code} • ผู้รับผิดชอบ: ${kpi.owner}`,
      department: kpi.department,
      timeOrMetric: `ผลงานจริง: ${kpi.actualValue}${kpi.unit} / เป้าหมาย ${kpi.targetValue}${kpi.unit} (${kpi.progress}%)`,
      actionLabel: 'ดูตัวชี้วัด',
      originalItem: kpi,
    });
  });

  // 5. Critical upcoming deadlines (within 3 days)
  upcomingDeadlines
    .filter((d) => d.urgencyLevel === 'red')
    .forEach((dl) => {
      priorityList.push({
        id: `dl-${dl.id}`,
        type: 'deadline',
        priorityScore: 2,
        priorityBadge: {
          text: `เดดไลน์อีก ${dl.daysLeft} วัน`,
          bg: 'bg-rose-50',
          textCol: 'text-rose-700',
          border: 'border-rose-200',
        },
        title: dl.title,
        subtitle: `ส่วนงาน: ${dl.department}`,
        department: dl.department,
        timeOrMetric: `กำหนดส่ง: ${dl.deadlineDate}`,
        actionLabel: 'ดูรายการ',
        originalItem: dl,
      });
    });

  // Sort by priorityScore asc
  const sortedList = priorityList.sort((a, b) => a.priorityScore - b.priorityScore);

  // Filter based on tab
  const filteredList = sortedList.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'overdue') return item.type === 'overdue' || item.type === 'deadline';
    if (activeTab === 'approvals') return item.type === 'approval';
    if (activeTab === 'risks') return item.type === 'risk';
    if (activeTab === 'kpis') return item.type === 'kpi';
    return true;
  });

  const handleActionClick = (item: PriorityItem) => {
    if (item.type === 'approval') {
      onOpenApproval(item.originalItem);
    } else if (item.type === 'risk') {
      onOpenRisk(item.originalItem);
    } else if (item.type === 'kpi') {
      onOpenKPI(item.originalItem);
    } else if (item.type === 'deadline') {
      onOpenDeadline(item.originalItem);
    } else {
      onNavigate('/strategy');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#FAFAFC]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                สิ่งที่ต้องดำเนินการ (Attention Needed)
              </h2>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                {sortedList.length} รายการเร่งด่วน
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              รวมงานล่าช้า เอกสารรออนุมัติ ความเสี่ยงวิกฤต และตัวชี้วัดที่ต้องกำกับดูแลด่วน
            </p>
          </div>
        </div>

        {/* Tabs Filter */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ทั้งหมด ({sortedList.length})
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'overdue'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            งานล่าช้า/เดดไลน์ ({overdueTasks.length + upcomingDeadlines.filter(d => d.urgencyLevel === 'red').length})
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'approvals'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            รออนุมัติ ({pendingApprovals.filter(a => a.daysRemaining <= 4).length})
          </button>
          <button
            onClick={() => setActiveTab('risks')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'risks'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ความเสี่ยงสูง ({highRisks.length})
          </button>
          <button
            onClick={() => setActiveTab('kpis')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'kpis'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            KPI ต่ำกว่าเป้า ({laggingKPIs.length})
          </button>
        </div>
      </div>

      {/* Priority List */}
      <div className="divide-y divide-slate-100">
        {filteredList.length === 0 ? (
          <div className="py-12 text-center px-4 bg-white">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold text-slate-800">ไม่มีรายการเร่งด่วนที่ต้องดำเนินการในขณะนี้</p>
            <p className="text-xs text-slate-500 mt-1">
              ระบบพร้อมใช้งาน ข้อมูลจะแสดงเมื่อมีการสร้างงาน มติการประชุม หรือตัวชี้วัดในระบบ
            </p>
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:px-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3.5 group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded border ${item.priorityBadge.bg} ${item.priorityBadge.textCol} ${item.priorityBadge.border}`}
                  >
                    {item.priorityBadge.text}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {item.department}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {item.timeOrMetric}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#B83B6F] transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {item.subtitle}
                </p>
              </div>

              {/* Quick Action Button */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => handleActionClick(item)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 hover:border-slate-300 text-slate-800 transition-all shadow-2xs"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
