/**
 * Executive Dashboard Data Store
 * กองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
 * ฐานข้อมูลสถิติและตัวชี้วัดกองวิชาการ มจร - Real Database Backed (Clean Slate for Production)
 */

export interface DashboardKPI {
  id: string;
  code: string;
  title: string;
  category: 'academic' | 'curriculum' | 'faculty' | 'credit-bank' | 'international';
  targetValue: number;
  actualValue: number;
  unit: string;
  progress: number;
  status: 'achieved' | 'on-track' | 'lagging';
  department: string;
  period: string;
  owner: string;
  changeTrend: string;
}

export interface ActionPlanItem {
  id: string;
  code: string;
  title: string;
  strategicObjective: string;
  department: string;
  budgetAllocated: number;
  budgetSpent: number;
  progress: number;
  status: 'completed' | 'in-progress' | 'delayed' | 'pending';
  dueDate: string;
  responsiblePerson: string;
}

export interface RiskItem {
  id: string;
  code: string;
  title: string;
  category: 'หลักสูตร' | 'มาตรฐานวิชาการ' | 'บุคลากร' | 'งบประมาณ' | 'ความร่วมมือ';
  level: 'critical' | 'high' | 'medium' | 'low';
  score: number; // 1-25
  mitigationPlan: string;
  owner: string;
  department: string;
  status: 'active' | 'mitigating' | 'resolved';
}

export interface MeetingItem {
  id: string;
  title: string;
  date: string;
  venue: string;
  totalAgendas: number;
  resolutionsCount: number;
  pendingExecution: number;
  status: 'completed' | 'in-progress' | 'upcoming';
  chairperson: string;
}

export interface PendingApprovalItem {
  id: string;
  title: string;
  type: 'หลักสูตร' | 'มติการประชุม' | 'MOU' | 'งบประมาณ' | 'Credit Bank' | 'ตำแหน่งวิชาการ';
  submitter: string;
  department: string;
  submittedDate: string;
  daysRemaining: number;
  urgency: 'critical' | 'urgent' | 'normal';
  targetRoute: string;
}

export interface UpcomingDeadlineItem {
  id: string;
  title: string;
  category: 'curriculum' | 'mou' | 'meeting' | 'report' | 'kpi';
  daysLeft: number;
  deadlineDate: string;
  department: string;
  urgencyLevel: 'red' | 'orange' | 'green';
  targetRoute: string;
}

export interface RecentActivityItem {
  id: string;
  user: string;
  userRole: string;
  action: string;
  target: string;
  timeAgo: string;
  category: 'kpi' | 'document' | 'curriculum' | 'resolution' | 'request' | 'risk';
}

// -------------------------------------------------------------
// PRODUCTION-READY DATA STORES (CLEAN SLATE - READY FOR REAL DATA)
// -------------------------------------------------------------

export const DEMO_KPIS: DashboardKPI[] = [];
export const DEMO_ACTION_PLANS: ActionPlanItem[] = [];
export const DEMO_RISKS: RiskItem[] = [];
export const DEMO_MEETINGS: MeetingItem[] = [];
export const DEMO_PENDING_APPROVALS: PendingApprovalItem[] = [];
export const DEMO_UPCOMING_DEADLINES: UpcomingDeadlineItem[] = [];
export const DEMO_RECENT_ACTIVITIES: RecentActivityItem[] = [];

export const DEMO_BUDGET = {
  totalAllocated: 0,
  committed: 0,
  spent: 0,
  remaining: 0,
  spentPercentage: 0,
  committedPercentage: 0,
  remainingPercentage: 0,
  facultyAllocations: [] as { faculty: string; allocated: number; spent: number; percentage: number }[],
  monthlyTrend: [] as { month: string; spent: number; budget: number }[],
};
