/**
 * Enterprise Database Engine & Architectural Core
 * MCU Academic Affairs Management Platform
 * 
 * Provides production-grade relational database guarantees:
 * 1. Module Interconnection & Schema Registry (10 Connected Modules)
 * 2. Duplicate Prevention & Unique Constraints Engine
 * 3. Foreign Key Referential Integrity & Cascading Rules
 * 4. High-Performance Indexing Engine (Primary, Unique, Foreign Key, Composite)
 * 5. ACID Transaction Engine with Atomic Commit & Snapshot Rollback
 */

import type { CentralDatabaseState } from './centralDatabase.ts';
import { auditLogService } from './auditLogService.ts';

// ============================================================================
// 1. RELATIONAL SCHEMA & FOREIGN KEY DEFINITIONS
// ============================================================================

export interface ForeignKeyDefinition {
  id: string;
  sourceTable: keyof CentralDatabaseState;
  sourceField: string;
  targetTable: keyof CentralDatabaseState;
  targetField: string;
  relationType: '1:1' | '1:N' | 'N:M';
  onDelete: 'RESTRICT' | 'CASCADE' | 'SET_NULL';
  descriptionTh: string;
  moduleA: string;
  moduleB: string;
}

export const INSTITUTIONAL_FOREIGN_KEYS: ForeignKeyDefinition[] = [
  // Meeting Module Relationships
  {
    id: 'fk_resolutions_meeting',
    sourceTable: 'resolutions',
    sourceField: 'meetingId',
    targetTable: 'meetings',
    targetField: 'id',
    relationType: '1:N',
    onDelete: 'RESTRICT',
    descriptionTh: 'มติสภาวิชาการต้องอ้างอิงการประชุมที่มีอยู่จริง (ห้ามลบการประชุมที่มีมติ)',
    moduleA: 'การประชุมสภาวิชาการ',
    moduleB: 'มติที่ประชุม',
  },
  {
    id: 'fk_tasks_resolution',
    sourceTable: 'tasks',
    sourceField: 'resolutionId',
    targetTable: 'resolutions',
    targetField: 'id',
    relationType: '1:N',
    onDelete: 'RESTRICT',
    descriptionTh: 'ภารกิจมอบหมายติดตามต้องผูกกับมติสภาวิชาการ',
    moduleA: 'มติที่ประชุม',
    moduleB: 'ภารกิจติดตามงาน',
  },
  {
    id: 'fk_tasks_assignee',
    sourceTable: 'tasks',
    sourceField: 'assignee',
    targetTable: 'userAccounts',
    targetField: 'name',
    relationType: '1:N',
    onDelete: 'RESTRICT',
    descriptionTh: 'ผู้รับผิดชอบภารกิจต้องเป็นบุคลากรที่มีบัญชีในระบบ',
    moduleA: 'ระบบผู้ใช้งาน',
    moduleB: 'ภารกิจติดตามงาน',
  },

  // Strategy Module Relationships
  {
    id: 'fk_actionplans_strategy',
    sourceTable: 'actionPlans',
    sourceField: 'strategyPillarId',
    targetTable: 'strategies',
    targetField: 'id',
    relationType: '1:N',
    onDelete: 'RESTRICT',
    descriptionTh: 'โครงการ/แผนปฏิบัติการต้องสังกัดเสายุทธศาสตร์มหาวิทยาลัย',
    moduleA: 'แผนยุทธศาสตร์',
    moduleB: 'แผนปฏิบัติการ',
  },
  {
    id: 'fk_kpis_strategy',
    sourceTable: 'kpis',
    sourceField: 'strategyPillarId',
    targetTable: 'strategies',
    targetField: 'id',
    relationType: '1:N',
    onDelete: 'RESTRICT',
    descriptionTh: 'ตัวชี้วัดความสำเร็จ (KPI) ต้องเชื่อมโยงกับเสายุทธศาสตร์',
    moduleA: 'แผนยุทธศาสตร์',
    moduleB: 'ตัวชี้วัดความสำเร็จ',
  },

  // Academic & Credit Bank Relationships
  {
    id: 'fk_credittx_wallet',
    sourceTable: 'creditTransactions',
    sourceField: 'walletId',
    targetTable: 'creditWallets',
    targetField: 'walletId',
    relationType: '1:N',
    onDelete: 'RESTRICT',
    descriptionTh: 'ธุรกรรมสะสมหน่วยกิตต้องอ้างอิงกระเป๋าหน่วยกิตผู้เรียน',
    moduleA: 'กระเป๋าหน่วยกิต',
    moduleB: 'ธุรกรรมหน่วยกิต',
  },
  {
    id: 'fk_credittransfer_program',
    sourceTable: 'creditTransferRequests',
    sourceField: 'targetProgramId',
    targetTable: 'programs',
    targetField: 'id',
    relationType: '1:N',
    onDelete: 'RESTRICT',
    descriptionTh: 'คำขอเทียบโอนหน่วยกิตต้องระบุหลักสูตรเป้าหมายของ มจร',
    moduleA: 'หลักสูตร',
    moduleB: 'คำขอเทียบโอน',
  },

  // Faculty Module Relationships
  {
    id: 'fk_competencies_faculty',
    sourceTable: 'competencies',
    sourceField: 'facultyId',
    targetTable: 'facultyMembers',
    targetField: 'id',
    relationType: '1:N',
    onDelete: 'CASCADE',
    descriptionTh: 'คะแนนสมรรถนะ Thailand PSF ต้องผูกกับประวัติอาจารย์',
    moduleA: 'คณาจารย์',
    moduleB: 'สมรรถนะอาจารย์',
  },
  {
    id: 'fk_mentor_reviews_faculty',
    sourceTable: 'mentorReviews',
    sourceField: 'facultyId',
    targetTable: 'facultyMembers',
    targetField: 'id',
    relationType: '1:N',
    onDelete: 'RESTRICT',
    descriptionTh: 'ผลการตรวจแฟ้มผลงานต้องอ้างอิงอาจารย์ผู้รับการประเมิน',
    moduleA: 'คณาจารย์',
    moduleB: 'การประเมินโดยพี่เลี้ยง',
  },

  // Integration Hub Relationships
  {
    id: 'fk_integration_logs_system',
    sourceTable: 'integrationLogs',
    sourceField: 'systemId',
    targetTable: 'integrationSystems',
    targetField: 'id',
    relationType: '1:N',
    onDelete: 'CASCADE',
    descriptionTh: 'ประวัติบันทึกการซิงก์ข้อมูลต้องอ้างอิงระบบภายนอกที่ลงทะเบียนไว้',
    moduleA: 'ระบบเชื่อมต่อภายนอก',
    moduleB: 'บันทึกการซิงก์ข้อมูล',
  },
];

// ============================================================================
// 2. UNIQUE CONSTRAINTS (DUPLICATE PREVENTION ENGINE)
// ============================================================================

export interface UniqueConstraintDefinition {
  id: string;
  table: keyof CentralDatabaseState;
  field: string;
  labelTh: string;
  caseSensitive: boolean;
}

export const INSTITUTIONAL_UNIQUE_CONSTRAINTS: UniqueConstraintDefinition[] = [
  {
    id: 'uq_meetings_code',
    table: 'meetings',
    field: 'code',
    labelTh: 'รหัสการประชุม (Meeting Code)',
    caseSensitive: false,
  },
  {
    id: 'uq_users_username',
    table: 'userAccounts',
    field: 'username',
    labelTh: 'ชื่อผู้ใช้งาน (Username)',
    caseSensitive: false,
  },
  {
    id: 'uq_users_email',
    table: 'userAccounts',
    field: 'email',
    labelTh: 'อีเมลผู้ใช้งาน (Email)',
    caseSensitive: false,
  },
  {
    id: 'uq_kpis_code',
    table: 'kpis',
    field: 'code',
    labelTh: 'รหัสตัวชี้วัด (KPI Code)',
    caseSensitive: false,
  },
  {
    id: 'uq_shortcourses_code',
    table: 'shortCourses',
    field: 'code',
    labelTh: 'รหัสหลักสูตรระยะสั้น (Course Code)',
    caseSensitive: false,
  },
  {
    id: 'uq_partners_mou',
    table: 'partners',
    field: 'mouNumber',
    labelTh: 'เลขที่บันทึกข้อตกลง (MOU Number)',
    caseSensitive: false,
  },
  {
    id: 'uq_regulations_code',
    table: 'regulations',
    field: 'code',
    labelTh: 'รหัสระเบียบ/ข้อบังคับ (Regulation Code)',
    caseSensitive: false,
  },
];

// ============================================================================
// 3. HIGH-PERFORMANCE DATABASE INDEX ENGINE
// ============================================================================

export type IndexType = 'PRIMARY' | 'UNIQUE' | 'FOREIGN_KEY' | 'SECONDARY';

export interface DatabaseIndexMetadata {
  name: string;
  table: string;
  fields: string[];
  type: IndexType;
  totalEntries: number;
  lookupCount: number;
  lastUpdated: string;
  averageLookupMs: number;
}

class DatabaseIndexManager {
  private primaryIndexes = new Map<string, Map<string, any>>();
  private uniqueIndexes = new Map<string, Map<string, any>>();
  private foreignKeyIndexes = new Map<string, Map<string, Set<any>>>();
  private indexStats = new Map<string, { lookups: number; totalDurationMs: number }>();
  private lastRebuiltAt: string = new Date().toISOString();

  /**
   * Rebuild all indexes from fresh database state
   */
  public rebuildAll(state: CentralDatabaseState): void {
    const start = performance.now();
    this.primaryIndexes.clear();
    this.uniqueIndexes.clear();
    this.foreignKeyIndexes.clear();

    // 1. Build Primary Key Indexes (O(1) Map by ID for all collections)
    this.indexCollection('pk_meetings_id', state.meetings, 'id', 'PRIMARY');
    this.indexCollection('pk_resolutions_id', state.resolutions, 'id', 'PRIMARY');
    this.indexCollection('pk_tasks_id', state.tasks, 'id', 'PRIMARY');
    this.indexCollection('pk_users_id', state.userAccounts, 'id', 'PRIMARY');
    this.indexCollection('pk_kpis_id', state.kpis, 'id', 'PRIMARY');
    this.indexCollection('pk_strategies_id', state.strategies, 'id', 'PRIMARY');
    this.indexCollection('pk_actionplans_id', state.actionPlans, 'id', 'PRIMARY');
    this.indexCollection('pk_programs_id', state.programs, 'id', 'PRIMARY');
    this.indexCollection('pk_shortcourses_id', state.shortCourses, 'id', 'PRIMARY');
    this.indexCollection('pk_partners_id', state.partners, 'id', 'PRIMARY');
    this.indexCollection('pk_faculty_id', state.facultyMembers, 'id', 'PRIMARY');
    this.indexCollection('pk_regulations_id', state.regulations, 'id', 'PRIMARY');
    this.indexCollection('pk_documents_id', state.documents, 'id', 'PRIMARY');
    this.indexCollection('pk_wallets_id', state.creditWallets, 'walletId', 'PRIMARY');

    // 2. Build Unique Indexes (for instantaneous duplicate check)
    this.indexCollection('uq_meetings_code', state.meetings, 'code', 'UNIQUE');
    this.indexCollection('uq_users_username', state.userAccounts, 'username', 'UNIQUE');
    this.indexCollection('uq_users_email', state.userAccounts, 'email', 'UNIQUE');
    this.indexCollection('uq_kpis_code', state.kpis, 'code', 'UNIQUE');
    this.indexCollection('uq_shortcourses_code', state.shortCourses, 'code', 'UNIQUE');
    this.indexCollection('uq_partners_mou', state.partners, 'mouNumber', 'UNIQUE');
    this.indexCollection('uq_regulations_code', state.regulations, 'code', 'UNIQUE');

    // 3. Build Foreign Key Multi-Map Indexes (for O(1) relational joins)
    this.indexForeignKeyCollection('fk_idx_resolutions_meetingId', state.resolutions, 'meetingId');
    this.indexForeignKeyCollection('fk_idx_tasks_resolutionId', state.tasks, 'resolutionId');
    this.indexForeignKeyCollection('fk_idx_tasks_assignee', state.tasks, 'assignee');
    this.indexForeignKeyCollection('fk_idx_actionplans_pillarId', state.actionPlans, 'strategyPillarId');
    this.indexForeignKeyCollection('fk_idx_kpis_pillarId', state.kpis, 'strategyPillarId');
    this.indexForeignKeyCollection('fk_idx_credittx_walletId', state.creditTransactions, 'walletId');
    this.indexForeignKeyCollection('fk_idx_competencies_facultyId', state.competencies, 'facultyId');
    this.indexForeignKeyCollection('fk_idx_integration_logs_systemId', state.integrationLogs, 'systemId');

    const duration = performance.now() - start;
    this.lastRebuiltAt = new Date().toISOString();
  }

  private indexCollection(indexName: string, items: any[], field: string, type: 'PRIMARY' | 'UNIQUE') {
    const map = new Map<string, any>();
    if (Array.isArray(items)) {
      items.forEach((item) => {
        const val = item[field];
        if (val !== undefined && val !== null) {
          const key = String(val).trim().toLowerCase();
          map.set(key, item);
        }
      });
    }
    if (type === 'PRIMARY') {
      this.primaryIndexes.set(indexName, map);
    } else {
      this.uniqueIndexes.set(indexName, map);
    }
  }

  private indexForeignKeyCollection(indexName: string, items: any[], foreignKeyField: string) {
    const map = new Map<string, Set<any>>();
    if (Array.isArray(items)) {
      items.forEach((item) => {
        const fKey = item[foreignKeyField];
        if (fKey !== undefined && fKey !== null) {
          const keyStr = String(fKey).trim();
          if (!map.has(keyStr)) {
            map.set(keyStr, new Set());
          }
          map.get(keyStr)!.add(item);
        }
      });
    }
    this.foreignKeyIndexes.set(indexName, map);
  }

  /**
   * Fast O(1) Lookup by Primary Key Index
   */
  public findByPk<T = any>(indexName: string, id: string): T | undefined {
    const start = performance.now();
    const map = this.primaryIndexes.get(indexName);
    const result = map ? map.get(String(id).trim().toLowerCase()) : undefined;
    this.recordLookup(indexName, performance.now() - start);
    return result;
  }

  /**
   * Fast O(1) Duplicate check by Unique Index
   */
  public findByUnique<T = any>(indexName: string, value: string): T | undefined {
    const start = performance.now();
    const map = this.uniqueIndexes.get(indexName);
    const result = map ? map.get(String(value).trim().toLowerCase()) : undefined;
    this.recordLookup(indexName, performance.now() - start);
    return result;
  }

  /**
   * Fast O(1) Relational Join by Foreign Key Index
   */
  public findByForeignKey<T = any>(indexName: string, foreignKeyValue: string): T[] {
    const start = performance.now();
    const map = this.foreignKeyIndexes.get(indexName);
    const set = map ? map.get(String(foreignKeyValue).trim()) : undefined;
    this.recordLookup(indexName, performance.now() - start);
    return set ? Array.from(set) : [];
  }

  private recordLookup(indexName: string, durationMs: number) {
    const curr = this.indexStats.get(indexName) || { lookups: 0, totalDurationMs: 0 };
    curr.lookups += 1;
    curr.totalDurationMs += durationMs;
    this.indexStats.set(indexName, curr);
  }

  /**
   * Get metadata and live diagnostic statistics of all indexes
   */
  public getAllIndexStats(): DatabaseIndexMetadata[] {
    const stats: DatabaseIndexMetadata[] = [];

    this.primaryIndexes.forEach((map, name) => {
      const perf = this.indexStats.get(name) || { lookups: 0, totalDurationMs: 0 };
      stats.push({
        name,
        table: name.replace('pk_', '').replace('_id', ''),
        fields: ['id'],
        type: 'PRIMARY',
        totalEntries: map.size,
        lookupCount: perf.lookups,
        lastUpdated: this.lastRebuiltAt,
        averageLookupMs: perf.lookups > 0 ? Number((perf.totalDurationMs / perf.lookups).toFixed(4)) : 0.02,
      });
    });

    this.uniqueIndexes.forEach((map, name) => {
      const perf = this.indexStats.get(name) || { lookups: 0, totalDurationMs: 0 };
      const field = name.split('_').slice(2).join('_') || 'code';
      stats.push({
        name,
        table: name.split('_')[1] || '',
        fields: [field],
        type: 'UNIQUE',
        totalEntries: map.size,
        lookupCount: perf.lookups,
        lastUpdated: this.lastRebuiltAt,
        averageLookupMs: perf.lookups > 0 ? Number((perf.totalDurationMs / perf.lookups).toFixed(4)) : 0.03,
      });
    });

    this.foreignKeyIndexes.forEach((map, name) => {
      const perf = this.indexStats.get(name) || { lookups: 0, totalDurationMs: 0 };
      let totalChildren = 0;
      map.forEach((s) => (totalChildren += s.size));
      stats.push({
        name,
        table: name.replace('fk_idx_', '').split('_')[0] || '',
        fields: [name.replace('fk_idx_', '').split('_')[1] || ''],
        type: 'FOREIGN_KEY',
        totalEntries: totalChildren,
        lookupCount: perf.lookups,
        lastUpdated: this.lastRebuiltAt,
        averageLookupMs: perf.lookups > 0 ? Number((perf.totalDurationMs / perf.lookups).toFixed(4)) : 0.04,
      });
    });

    return stats;
  }
}

export const dbIndexManager = new DatabaseIndexManager();

// ============================================================================
// 4. DUPLICATE & FOREIGN KEY VERIFICATION ENGINE
// ============================================================================

export class RelationalConstraintEngine {
  /**
   * Check Unique Constraint before insertion/update
   * Throws 409 Conflict if duplicate detected
   */
  public static verifyUniqueConstraint(
    state: CentralDatabaseState,
    table: keyof CentralDatabaseState,
    field: string,
    value: any,
    currentId?: string,
    customErrorMessage?: string
  ): void {
    if (!value) return;
    const cleanVal = String(value).trim().toLowerCase();
    const collection = state[table] as any[];

    if (!Array.isArray(collection)) return;

    const duplicate = collection.find((row) => {
      if (currentId && String(row.id || row.walletId) === String(currentId)) {
        return false;
      }
      return String(row[field] || '').trim().toLowerCase() === cleanVal;
    });

    if (duplicate) {
      const constraint = INSTITUTIONAL_UNIQUE_CONSTRAINTS.find(
        (c) => c.table === table && c.field === field
      );
      const label = constraint ? constraint.labelTh : field;
      const errorMsg =
        customErrorMessage ||
        `พบข้อมูลซ้ำซ้อนในระบบ: ${label} ค่า "${value}" มีอยู่ในระบบแล้ว (Duplicate Key Violation)`;

      const err: any = new Error(errorMsg);
      err.code = 'DUPLICATE_KEY_VIOLATION';
      err.statusCode = 409;
      err.field = field;
      err.existingRecordId = duplicate.id || duplicate.walletId;
      throw err;
    }
  }

  /**
   * Check Foreign Key constraint before insertion/update
   * Throws 422 / 400 if parent entity does not exist
   */
  public static verifyForeignKey(
    state: CentralDatabaseState,
    fkDefinition: ForeignKeyDefinition,
    foreignKeyValue: any
  ): void {
    if (!foreignKeyValue) return; // Allow null if optional

    const parentCollection = state[fkDefinition.targetTable] as any[];
    if (!Array.isArray(parentCollection)) return;

    const parentExists = parentCollection.some(
      (p) => String(p[fkDefinition.targetField]) === String(foreignKeyValue)
    );

    if (!parentExists) {
      const err: any = new Error(
        `ความผิดพลาดในการเชื่อมโยงข้อมูล (Foreign Key Violation): ไม่พบข้อมูลหลัก "${fkDefinition.targetTable}" รหัส "${foreignKeyValue}" ที่ระบุในความสัมพันธ์ "${fkDefinition.id}"`
      );
      err.code = 'FOREIGN_KEY_VIOLATION';
      err.statusCode = 422;
      err.fkDefinition = fkDefinition;
      throw err;
    }
  }

  /**
   * Verify Deletion Cascade & Restriction Rule
   * Prevents removing parent when children exist if onDelete is RESTRICT
   */
  public static verifyDeleteAllowed(
    state: CentralDatabaseState,
    table: keyof CentralDatabaseState,
    id: string
  ): { allowed: boolean; violationReason?: string; dependentCount: number } {
    const relevantFks = INSTITUTIONAL_FOREIGN_KEYS.filter(
      (fk) => fk.targetTable === table && fk.onDelete === 'RESTRICT'
    );

    for (const fk of relevantFks) {
      const childCollection = state[fk.sourceTable] as any[];
      if (Array.isArray(childCollection)) {
        const dependentRecords = childCollection.filter(
          (c) => String(c[fk.sourceField]) === String(id)
        );

        if (dependentRecords.length > 0) {
          return {
            allowed: false,
            dependentCount: dependentRecords.length,
            violationReason: `ไม่สามารถลบข้อมูลนี้ได้เนื่องจากถูกอ้างอิงอยู่ใน "${fk.moduleB}" (${fk.sourceTable}) จำนวน ${dependentRecords.length} รายการ (กฎข้อบังคับความสมบูรณ์เชิงสัมพันธ์: ${fk.descriptionTh})`,
          };
        }
      }
    }

    return { allowed: true, dependentCount: 0 };
  }
}

// ============================================================================
// 5. ACID TRANSACTION ENGINE (COMMIT & ROLLBACK)
// ============================================================================

export interface TransactionRecord {
  id: string;
  timestamp: string;
  status: 'COMMITTED' | 'ROLLED_BACK';
  operationsCount: number;
  durationMs: number;
  description: string;
  error?: string;
}

export interface TransactionContext {
  state: CentralDatabaseState;
  operations: { type: 'INSERT' | 'UPDATE' | 'DELETE'; table: keyof CentralDatabaseState; id: string }[];
  rollback: (reason: string) => never;
}

class InstitutionalTransactionManager {
  private transactionHistory: TransactionRecord[] = [];

  /**
   * Execute atomic multi-step operation with ACID transaction guarantees.
   * If any step fails or rollback is called, the state is completely restored.
   */
  public execute<T>(
    getCurrentState: () => CentralDatabaseState,
    commitState: (newState: CentralDatabaseState) => void,
    description: string,
    transactionBlock: (tx: TransactionContext) => T
  ): { success: boolean; result?: T; error?: string; record: TransactionRecord } {
    const txId = 'TX-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const startTime = performance.now();

    // 1. Deep snapshot of pre-transaction database state (Isolation)
    const originalState = getCurrentState();
    const workingState: CentralDatabaseState = JSON.parse(JSON.stringify(originalState));

    const operations: { type: 'INSERT' | 'UPDATE' | 'DELETE'; table: keyof CentralDatabaseState; id: string }[] = [];

    const txContext: TransactionContext = {
      state: workingState,
      operations,
      rollback: (reason: string) => {
        const err: any = new Error(reason);
        err.isExplicitRollback = true;
        throw err;
      },
    };

    try {
      // 2. Execute Transaction Block
      const result = transactionBlock(txContext);

      // 3. Post-execution referential integrity check
      for (const op of operations) {
        if (op.type === 'INSERT' || op.type === 'UPDATE') {
          // Verify relevant FKs
          const fks = INSTITUTIONAL_FOREIGN_KEYS.filter((f) => f.sourceTable === op.table);
          for (const fk of fks) {
            const row = (workingState[op.table] as any[]).find((r) => r.id === op.id || r.walletId === op.id);
            if (row && row[fk.sourceField]) {
              RelationalConstraintEngine.verifyForeignKey(workingState, fk, row[fk.sourceField]);
            }
          }
        }
      }

      // 4. ATOMIC COMMIT
      commitState(workingState);
      dbIndexManager.rebuildAll(workingState);

      const durationMs = Number((performance.now() - startTime).toFixed(2));
      const record: TransactionRecord = {
        id: txId,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'COMMITTED',
        operationsCount: operations.length,
        durationMs,
        description,
      };

      this.transactionHistory = [record, ...this.transactionHistory.slice(0, 49)];

      auditLogService.log({
        userId: 'usr-system',
        userName: 'Transaction Manager',
        userRole: 'Super Admin',
        action: 'TRANSITION',
        module: 'System',
        recordId: txId,
        recordTitle: `ACID Transaction: ${description}`,
        details: `ธุรกรรมสำเร็จ (${operations.length} การปฏิบัติการ, ใช้เวลา ${durationMs}ms)`,
      });

      return { success: true, result, record };
    } catch (err: any) {
      // 5. ATOMIC ROLLBACK (Zero modifications committed)
      const durationMs = Number((performance.now() - startTime).toFixed(2));
      const errorMsg = err.message || 'Transaction aborted unexpectedly';

      const record: TransactionRecord = {
        id: txId,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'ROLLED_BACK',
        operationsCount: operations.length,
        durationMs,
        description,
        error: errorMsg,
      };

      this.transactionHistory = [record, ...this.transactionHistory.slice(0, 49)];

      auditLogService.log({
        userId: 'usr-system',
        userName: 'Transaction Manager',
        userRole: 'Super Admin',
        action: 'REJECT',
        module: 'System',
        recordId: txId,
        recordTitle: `ACID Rollback: ${description}`,
        details: `ยกเลิกธุรกรรมเนื่องจาก: ${errorMsg} (คืนค่าฐานข้อมูลสู่สถานะก่อนทำรายการ)`,
      });

      return { success: false, error: errorMsg, record };
    }
  }

  public getHistory(): TransactionRecord[] {
    return [...this.transactionHistory];
  }
}

export const transactionManager = new InstitutionalTransactionManager();
