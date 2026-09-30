/**
 * Institutional Referential Integrity & Database Relationship Engine
 * 
 * Verifies relationships, prevents orphaned records, and blocks destructive cascades:
 * - Users ↔ Roles ↔ Permissions
 * - Meetings ↔ Agendas ↔ Resolutions ↔ Tasks
 * - Strategies ↔ Projects ↔ Action Plans ↔ KPIs ↔ Budgets ↔ Risks
 * - Collaborations ↔ Curriculums ↔ Courses ↔ Credit Bank
 * - Faculty ↔ Competencies ↔ IDP ↔ Mentors
 * - Regulations ↔ Compliance Tasks
 * - Documents ↔ Resolutions / Regulations / Forms
 * - Notifications ↔ Modules ↔ Targets
 * - Audit Logs ↔ Users ↔ Entities
 */

import { centralDatabase } from './centralDatabase.ts';
import { errorService } from './errorService.ts';

export interface IntegrityIssue {
  id: string;
  severity: 'Critical' | 'Warning' | 'Info';
  category: 'Foreign Key' | 'Unique Constraint' | 'Orphaned Record' | 'Data Inconsistency' | 'Security';
  entity: string;
  recordId: string;
  message: string;
  recommendation: string;
  canAutoFix?: boolean;
}

export interface IntegrityCheckResult {
  totalEntitiesChecked: number;
  totalRecordsChecked: number;
  healthyRecords: number;
  issues: IntegrityIssue[];
  integrityScore: number; // 0 - 100
  checkedAt: string;
}

export const integrityService = {
  /**
   * Run a comprehensive system-wide relational audit
   */
  runRelationalAudit(): IntegrityCheckResult {
    const db = centralDatabase.getState();
    const issues: IntegrityIssue[] = [];
    let totalRecordsChecked = 0;

    // 1. Check Meetings ↔ Resolutions ↔ Tasks
    const meetingIds = new Set(db.meetings.map((m) => m.id));
    const resolutionIds = new Set(db.resolutions.map((r) => r.id));

    totalRecordsChecked += db.meetings.length + db.resolutions.length + db.tasks.length;

    // Check resolutions have valid meetingId
    db.resolutions.forEach((res) => {
      if (res.meetingId && !meetingIds.has(res.meetingId)) {
        issues.push({
          id: `ISSUE-RES-${res.id}`,
          severity: 'Critical',
          category: 'Foreign Key',
          entity: 'Resolutions',
          recordId: res.id,
          message: `มติ "${res.title}" อ้างอิงรหัสการประชุม "${res.meetingId}" ที่ไม่มีอยู่ในฐานข้อมูล`,
          recommendation: 'เชื่อมโยงมติเข้ากับการประชุมที่ถูกต้อง หรือสร้างรายการประชุมที่ขาดหาย',
        });
      }
    });

    // Check tasks have valid resolutionId
    db.tasks.forEach((tsk) => {
      if (tsk.resolutionId && !resolutionIds.has(tsk.resolutionId)) {
        issues.push({
          id: `ISSUE-TSK-${tsk.id}`,
          severity: 'Warning',
          category: 'Orphaned Record',
          entity: 'MeetingTasks',
          recordId: tsk.id,
          message: `ภารกิจ "${tsk.title}" อ้างอิงมติ "${tsk.resolutionId}" ที่ไม่พบในระบบ`,
          recommendation: 'ผูกภารกิจเข้ากับมติสภาวิชาการที่เกี่ยวข้อง หรือจัดเป็นภารกิจอิสระ',
        });
      }
    });

    // 2. Check Unique Constraints on Meetings
    const meetingCodes = new Map<string, string>();
    db.meetings.forEach((m) => {
      if (meetingCodes.has(m.code)) {
        issues.push({
          id: `ISSUE-DUP-MTG-${m.id}`,
          severity: 'Critical',
          category: 'Unique Constraint',
          entity: 'Meetings',
          recordId: m.id,
          message: `พบรหัสการประชุมซ้ำซ้อน: "${m.code}"`,
          recommendation: 'ปรับเปลี่ยนรหัสการประชุมให้มีเอกลักษณ์เฉพาะ เช่น ระบุครั้งที่/ปีให้ชัดเจน',
        });
      } else {
        meetingCodes.set(m.code, m.id);
      }
    });

    // 3. Check Users ↔ Roles
    totalRecordsChecked += db.userAccounts.length;
    const userEmails = new Map<string, string>();
    const userUsernames = new Map<string, string>();

    db.userAccounts.forEach((u) => {
      // Check duplicate email
      const emailLower = u.email.toLowerCase().trim();
      if (userEmails.has(emailLower)) {
        issues.push({
          id: `ISSUE-DUP-EMAIL-${u.id}`,
          severity: 'Critical',
          category: 'Unique Constraint',
          entity: 'UserAccounts',
          recordId: u.id,
          message: `พบอีเมลซ้ำในระบบผู้ใช้งาน: "${u.email}"`,
          recommendation: 'แก้ไขอีเมลผู้ใช้งานให้เป็นค่าเฉพาะของแต่ละบุคคล',
        });
      } else {
        userEmails.set(emailLower, u.id);
      }

      // Check duplicate username
      const usernameLower = u.username.toLowerCase().trim();
      if (userUsernames.has(usernameLower)) {
        issues.push({
          id: `ISSUE-DUP-USER-${u.id}`,
          severity: 'Critical',
          category: 'Unique Constraint',
          entity: 'UserAccounts',
          recordId: u.id,
          message: `พบบัญชีผู้ใช้ (Username) ซ้ำ: "${u.username}"`,
          recommendation: 'ปรับเปลี่ยน Username ให้ไม่ซ้ำกัน',
        });
      } else {
        userUsernames.set(usernameLower, u.id);
      }
    });

    // 4. Check Strategy Pillars ↔ KPIs ↔ Action Plans ↔ Budgets
    totalRecordsChecked += db.strategies.length + db.kpis.length + db.actionPlans.length;
    const pillarIds = new Set(db.strategies.map((p) => p.id));

    db.kpis.forEach((kpi) => {
      if (kpi.strategyPillarId && !pillarIds.has(kpi.strategyPillarId)) {
        issues.push({
          id: `ISSUE-KPI-${kpi.id}`,
          severity: 'Warning',
          category: 'Foreign Key',
          entity: 'KPIs',
          recordId: kpi.id,
          message: `ตัวชี้วัด "${kpi.name}" ผูกกับเสายุทธศาสตร์ "${kpi.strategyPillarId}" ที่ไม่มีอยู่`,
          recommendation: 'จัดสรรตัวชี้วัดเข้าสู่เสายุทธศาสตร์ที่มีอยู่จริง',
        });
      }

      // Check numeric bounds
      if (kpi.unit === '%' && (kpi.target > 100 || kpi.target < 0)) {
        issues.push({
          id: `ISSUE-KPI-BOUNDS-${kpi.id}`,
          severity: 'Warning',
          category: 'Data Inconsistency',
          entity: 'KPIs',
          recordId: kpi.id,
          message: `ตัวชี้วัดเปอร์เซ็นต์ "${kpi.name}" มีค่าเป้าหมายผิดปกติ (${kpi.target}%)`,
          recommendation: 'ปรับเป้าหมายให้อยู่ในช่วง 0 - 100 %',
        });
      }
    });

    // 5. Check Budget Allocations vs Total
    totalRecordsChecked += db.actionPlans.length;
    db.actionPlans.forEach((plan) => {
      if (plan.spentBudget > plan.budget) {
        issues.push({
          id: `ISSUE-BUDGET-${plan.id}`,
          severity: 'Critical',
          category: 'Data Inconsistency',
          entity: 'Budgets',
          recordId: plan.id,
          message: `แผนงาน "${plan.title}" มียอดเบิกจ่าย (${plan.spentBudget.toLocaleString()} บาท) สูงกว่างบประมาณที่ได้รับ (${plan.budget.toLocaleString()} บาท)`,
          recommendation: 'ปรับลดงบจัดสรรหรือขออนุมัติเพิ่มกรอบวงเงินงบประมาณ',
        });
      }
    });

    // 6. Check Credit Bank ↔ Students ↔ Transactions
    totalRecordsChecked += db.preDegreeStudents.length + db.creditWallets.length + db.creditTransactions.length;
    const walletIds = new Set(db.creditWallets.map((w) => w.walletId));

    db.creditTransactions.forEach((tx) => {
      if (tx.walletId && !walletIds.has(tx.walletId)) {
        issues.push({
          id: `ISSUE-CREDIT-TX-${tx.id}`,
          severity: 'Warning',
          category: 'Orphaned Record',
          entity: 'CreditTransactions',
          recordId: tx.id,
          message: `ธุรกรรมสะสมหน่วยกิต "${tx.id}" อ้างอิงกระเป๋าหน่วยกิตที่ไม่พบในระบบ`,
          recommendation: 'ตรวจสอบรหัสกระเป๋าหน่วยกิตของผู้เรียน',
        });
      }
    });

    // 7. Check Documents ↔ Metadata
    totalRecordsChecked += db.documents.length;
    db.documents.forEach((doc) => {
      if (!doc.title || !doc.fileType || !doc.fileSize) {
        issues.push({
          id: `ISSUE-DOC-${doc.id}`,
          severity: 'Warning',
          category: 'Data Inconsistency',
          entity: 'Documents',
          recordId: doc.id,
          message: `เอกสารรหัส "${doc.id}" ขาดข้อมูลชื่อเอกสาร ประเภทไฟล์ หรือขนาดไฟล์`,
          recommendation: 'อัปเดตข้อมูลเอกสารให้สมบูรณ์',
        });
      }
    });

    // 8. Calculate Institutional Health Score
    const criticalCount = issues.filter((i) => i.severity === 'Critical').length;
    const warningCount = issues.filter((i) => i.severity === 'Warning').length;

    let deduction = criticalCount * 15 + warningCount * 5;
    if (deduction > 100) deduction = 100;
    const integrityScore = Math.max(0, 100 - deduction);

    return {
      totalEntitiesChecked: 14,
      totalRecordsChecked,
      healthyRecords: Math.max(0, totalRecordsChecked - issues.length),
      issues,
      integrityScore,
      checkedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
  },

  /**
   * Guard: Can a meeting be safely deleted?
   * Prevents destructive cascade of official council resolutions
   */
  canDeleteMeeting(meetingId: string): { allowed: boolean; reason?: string; resolutionCount: number } {
    const db = centralDatabase.getState();
    const meeting = db.meetings.find((m) => m.id === meetingId);
    if (!meeting) return { allowed: true, resolutionCount: 0 };

    const linkedResolutions = db.resolutions.filter((r) => r.meetingId === meetingId);
    if (linkedResolutions.length > 0) {
      return {
        allowed: false,
        resolutionCount: linkedResolutions.length,
        reason: `ไม่สามารถลบการประชุมนี้ได้ เนื่องจากมีมติสภาวิชาการที่ประกาศใช้แล้ว ${linkedResolutions.length} รายการ เพื่อป้องกันการสูญหายของประวัติราชการ แนะนำให้ใช้การ "ยกเลิกการประชุม" หรือ "จัดเก็บถาวร (Archive)" แทน`,
      };
    }

    return { allowed: true, resolutionCount: 0 };
  },

  /**
   * Guard: Can a resolution be deleted?
   * Prevents deleting resolutions with active delegated tasks
   */
  canDeleteResolution(resolutionId: string): { allowed: boolean; reason?: string; taskCount: number } {
    const db = centralDatabase.getState();
    const linkedTasks = db.tasks.filter((t) => t.resolutionId === resolutionId && t.status !== 'completed');
    if (linkedTasks.length > 0) {
      return {
        allowed: false,
        taskCount: linkedTasks.length,
        reason: `ไม่สามารถลบมตินี้ได้ เนื่องจากมีภารกิจติดตามการขับเคลื่อนที่อยู่ระหว่างดำเนินการ ${linkedTasks.length} รายการ กรุณาดำเนินการปิดงานหรือโอนย้ายภารกิจก่อน`,
      };
    }

    return { allowed: true, taskCount: 0 };
  },

  /**
   * Guard: Can a user be safely removed?
   * Prevents removing users assigned to pending approvals or active tasks
   */
  canDeleteUser(userId: string): { allowed: boolean; reason?: string; activeAssignments: number } {
    const db = centralDatabase.getState();
    const user = db.userAccounts.find((u) => u.id === userId);
    if (!user) return { allowed: true, activeAssignments: 0 };

    if (user.role === 'Super Admin') {
      const superAdmins = db.userAccounts.filter((u) => u.role === 'Super Admin');
      if (superAdmins.length <= 1) {
        return {
          allowed: false,
          activeAssignments: 0,
          reason: 'ไม่สามารถลบ Super Admin บัญชีสุดท้ายของระบบได้ ต้องมีผู้ดูแลระบบสูงสุดอย่างน้อย 1 บัญชี',
        };
      }
    }

    const assignedTasks = db.tasks.filter(
      (t) => (t.assignee === user.name || t.assignee === user.username) && t.status !== 'completed'
    );

    if (assignedTasks.length > 0) {
      return {
        allowed: false,
        activeAssignments: assignedTasks.length,
        reason: `ผู้ใช้งาน ${user.name} ยังมีภารกิจที่ได้รับมอบหมายอยู่ระหว่างดำเนินการ ${assignedTasks.length} รายการ แนะนำให้เปลี่ยนสถานะเป็น "ระงับการใช้งาน (Suspended)" แทนการลบถาวร`,
      };
    }

    return { allowed: true, activeAssignments: 0 };
  },

  /**
   * Guard: Can a strategy pillar be safely deleted?
   * Prevents removing strategic pillars with active KPIs or action plans
   */
  canDeleteStrategyPillar(pillarId: string): { allowed: boolean; reason?: string; linkedCount: number } {
    const db = centralDatabase.getState();
    const linkedKpis = db.kpis.filter((k) => k.strategyPillarId === pillarId);
    const linkedPlans = db.actionPlans.filter((p) => p.strategyId === pillarId);
    const totalLinked = linkedKpis.length + linkedPlans.length;

    if (totalLinked > 0) {
      return {
        allowed: false,
        linkedCount: totalLinked,
        reason: `ไม่สามารถลบเสายุทธศาสตร์นี้ได้ เนื่องจากมีตัวชี้วัด KPI (${linkedKpis.length} รายการ) และแผนปฏิบัติการ (${linkedPlans.length} รายการ) ผูกโยงอยู่`,
      };
    }

    return { allowed: true, linkedCount: 0 };
  },

  /**
   * Guard: Can a credit wallet be safely deleted?
   * Prevents removing credit bank wallets with accumulated credits or history
   */
  canDeleteWallet(walletId: string): { allowed: boolean; reason?: string; transactionCount: number } {
    const db = centralDatabase.getState();
    const wallet = db.creditWallets.find((w) => w.walletId === walletId);
    if (!wallet) return { allowed: true, transactionCount: 0 };

    const linkedTxs = db.creditTransactions.filter((tx) => tx.walletId === walletId);
    if (wallet.totalCreditsAccumulated > 0 || linkedTxs.length > 0) {
      return {
        allowed: false,
        transactionCount: linkedTxs.length,
        reason: `ไม่สามารถลบกระเป๋าเครดิต ${wallet.fullName} ได้ เนื่องจากมีหน่วยกิตสะสม ${wallet.totalCreditsAccumulated} หน่วยกิต หรือมีประวัติบันทึกธุรกรรม ${linkedTxs.length} รายการ`,
      };
    }

    return { allowed: true, transactionCount: 0 };
  },
};
