// Strategic Planning, KPI, Budget, and Risk Register Data
// กองวิชาการ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (MCU) - Clean Slate for Production

export interface StrategyPillar {
  id: string;
  code: string;
  name: string;
  description: string;
  leader: string;
  totalBudget: number;
  spentBudget: number;
  kpiCount: number;
  objectives: StrategicObjective[];
}

export interface StrategicObjective {
  id: string;
  code: string;
  name: string;
  pillarId: string;
  projects: StrategicProject[];
}

export interface StrategicProject {
  id: string;
  code: string;
  name: string;
  objectiveId: string;
  department: string;
  responsiblePerson: string;
  allocatedBudget: number;
  committedBudget: number;
  spentBudget: number;
  actionPlans: ActionPlanRecord[];
}

export interface ActionPlanRecord {
  id: string;
  code: string;
  title: string;
  description: string;
  strategyId: string;
  strategyName: string;
  projectId: string;
  projectName: string;
  department: string;
  responsiblePerson: string;
  startDate: string;
  endDate: string;
  budget: number;
  spentBudget: number;
  kpiIds: string[];
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
  progress: number;
  deliverables?: string;
}

export interface KPIRecord {
  id: string;
  code: string;
  name: string;
  description: string;
  unit: string;
  baseline: number;
  target: number;
  actual: number;
  owner: string;
  department: string;
  frequency: 'รายเดือน' | 'รายไตรมาส' | 'รายภาคเรียน' | 'รายปี';
  evidence?: {
    name: string;
    submittedDate: string;
    verified: boolean;
  };
  status: 'achieved' | 'on_track' | 'lagging';
  achievementPercentage: number;
  strategyPillarId?: string;
  quarterlyActuals?: {
    q1?: number;
    q2?: number;
    q3?: number;
    q4?: number;
  };
}

export interface RiskRecord {
  id: string;
  name: string;
  description: string;
  cause: string;
  impact: number; // 1 to 5
  likelihood: number; // 1 to 5
  score: number; // impact * likelihood (1 to 25)
  level: 'low' | 'medium' | 'high' | 'critical';
  owner: string;
  department: string;
  mitigation: string;
  dueDate: string;
  status: 'active' | 'mitigating' | 'resolved' | 'monitored';
  strategyReference?: string;
}

export interface BudgetOverviewData {
  fiscalYear: number;
  totalAllocated: number;
  totalCommitted: number;
  totalSpent: number;
  totalRemaining: number;
  utilizationRate: number; // spent / allocated * 100
  quarters: {
    name: string;
    targetPercent: number;
    actualPercent: number;
    spentAmount: number;
    status: 'on_track' | 'lagging' | 'exceeded';
  }[];
}

// -------------------------------------------------------------------------
// PRODUCTION-READY DATA STORES (CLEAN SLATE - READY FOR REAL DATA)
// -------------------------------------------------------------------------

export const INITIAL_STRATEGY_PILLARS: StrategyPillar[] = [];
export const INITIAL_KPIS: KPIRecord[] = [];
export const INITIAL_ACTION_PLANS: ActionPlanRecord[] = [];
export const INITIAL_RISKS: RiskRecord[] = [];

export const INITIAL_BUDGET_DATA: BudgetOverviewData = {
  fiscalYear: 2569,
  totalAllocated: 0,
  totalCommitted: 0,
  totalSpent: 0,
  totalRemaining: 0,
  utilizationRate: 0,
  quarters: [
    { name: 'ไตรมาส 1 (ต.ค. - ธ.ค.)', targetPercent: 25, actualPercent: 0, spentAmount: 0, status: 'on_track' },
    { name: 'ไตรมาส 2 (ม.ค. - มี.ค.)', targetPercent: 50, actualPercent: 0, spentAmount: 0, status: 'on_track' },
    { name: 'ไตรมาส 3 (เม.ย. - มิ.ย.)', targetPercent: 75, actualPercent: 0, spentAmount: 0, status: 'on_track' },
    { name: 'ไตรมาส 4 (ก.ค. - ก.ย.)', targetPercent: 100, actualPercent: 0, spentAmount: 0, status: 'on_track' },
  ],
};
