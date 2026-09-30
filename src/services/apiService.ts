/**
 * Unified Enterprise API Gateway & RESTful Service Layer
 * MCU Academic Affairs Management Platform
 * 
 * Standardized API Contract:
 * - Uniform Response Envelope (success, statusCode, data, error, meta)
 * - Full CRUD Operations with Query Engine (Filter, Sort, Search, Pagination, Relational Expand)
 * - Automatic Constraint Validation, Foreign Key Checks, Index Maintenance & Audit Logging
 */

import { centralDatabase, type CentralDatabaseState } from './centralDatabase.ts';
import {
  dbIndexManager,
  RelationalConstraintEngine,
  INSTITUTIONAL_FOREIGN_KEYS,
  INSTITUTIONAL_UNIQUE_CONSTRAINTS,
} from './databaseEngine.ts';
import { auditLogService } from './auditLogService.ts';
import type { UserProfile } from '../types.ts';

export interface ApiErrorPayload {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export interface ApiMetaPayload {
  timestamp: string;
  durationMs: number;
  correlationId: string;
  version: 'v1.0';
  totalCount?: number;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  data?: T;
  error?: ApiErrorPayload;
  meta: ApiMetaPayload;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  searchFields?: string[];
  filter?: Record<string, any>;
  sort?: { field: string; direction: 'asc' | 'desc' };
  expand?: string[]; // e.g. ['resolutions', 'tasks', 'assignee']
}

export type SupportedResource =
  | 'meetings'
  | 'resolutions'
  | 'tasks'
  | 'strategies'
  | 'actionPlans'
  | 'kpis'
  | 'programs'
  | 'shortCourses'
  | 'partners'
  | 'facultyMembers'
  | 'regulations'
  | 'documents'
  | 'userAccounts'
  | 'creditWallets'
  | 'creditTransactions';

class UnifiedApiGateway {
  /**
   * Generates standard metadata envelope
   */
  private createMeta(startTime: number, extra?: Partial<ApiMetaPayload>): ApiMetaPayload {
    return {
      timestamp: new Date().toISOString(),
      durationMs: Number((performance.now() - startTime).toFixed(2)),
      correlationId: 'REQ-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      version: 'v1.0',
      ...extra,
    };
  }

  /**
   * GET /api/v1/:resource (List with filtering, sorting, pagination, and relational expansion)
   */
  public list<T = any>(resource: SupportedResource, options?: QueryOptions): ApiResponse<T[]> {
    const start = performance.now();
    try {
      const state = centralDatabase.getState();
      const rawCollection = state[resource as keyof CentralDatabaseState] as any[];

      if (!Array.isArray(rawCollection)) {
        return {
          success: false,
          statusCode: 404,
          error: { code: 'RESOURCE_NOT_FOUND', message: `ไม่พบทรัพยากร ${resource}` },
          meta: this.createMeta(start),
        };
      }

      let items = [...rawCollection];

      // 1. Search Query
      if (options?.search) {
        const query = options.search.toLowerCase().trim();
        items = items.filter((item) => {
          return Object.values(item).some((val) => {
            if (typeof val === 'string' || typeof val === 'number') {
              return String(val).toLowerCase().includes(query);
            }
            return false;
          });
        });
      }

      // 2. Exact Filters
      if (options?.filter) {
        Object.entries(options.filter).forEach(([key, filterVal]) => {
          if (filterVal !== undefined && filterVal !== null && filterVal !== '') {
            items = items.filter((item) => String(item[key]) === String(filterVal));
          }
        });
      }

      // 3. Sorting
      if (options?.sort) {
        const { field, direction } = options.sort;
        items.sort((a, b) => {
          const valA = a[field];
          const valB = b[field];
          if (valA === valB) return 0;
          if (valA === undefined) return 1;
          if (valB === undefined) return -1;
          const cmp = valA > valB ? 1 : -1;
          return direction === 'desc' ? -cmp : cmp;
        });
      }

      const totalCount = items.length;

      // 4. Pagination
      const page = options?.page && options.page > 0 ? options.page : 1;
      const limit = options?.limit && options.limit > 0 ? options.limit : 50;
      const startIndex = (page - 1) * limit;
      let paginated = items.slice(startIndex, startIndex + limit);

      // 5. Relational Expansion (Eager Loading via Foreign Key Indexes)
      if (options?.expand && options.expand.length > 0) {
        paginated = paginated.map((item) => {
          const expandedItem = { ...item };

          // Example: Expand meeting resolutions
          if (options.expand!.includes('resolutions') && resource === 'meetings') {
            expandedItem.resolutions = dbIndexManager.findByForeignKey(
              'fk_idx_resolutions_meetingId',
              item.id
            );
          }

          // Example: Expand resolution tasks
          if (options.expand!.includes('tasks') && resource === 'resolutions') {
            expandedItem.tasks = dbIndexManager.findByForeignKey(
              'fk_idx_tasks_resolutionId',
              item.id
            );
          }

          // Example: Expand strategy KPIs
          if (options.expand!.includes('kpis') && resource === 'strategies') {
            expandedItem.kpis = dbIndexManager.findByForeignKey(
              'fk_idx_kpis_pillarId',
              item.id
            );
          }

          return expandedItem;
        });
      }

      return {
        success: true,
        statusCode: 200,
        data: paginated as T[],
        meta: this.createMeta(start, {
          totalCount,
          page,
          limit,
        }),
      };
    } catch (err: any) {
      return {
        success: false,
        statusCode: 500,
        error: { code: 'INTERNAL_SERVER_ERROR', message: err.message },
        meta: this.createMeta(start),
      };
    }
  }

  /**
   * GET /api/v1/:resource/:id (Read single item using Primary Key Index O(1))
   */
  public get<T = any>(
    resource: SupportedResource,
    id: string,
    expand?: string[]
  ): ApiResponse<T> {
    const start = performance.now();
    try {
      const state = centralDatabase.getState();
      const collection = state[resource as keyof CentralDatabaseState] as any[];

      if (!Array.isArray(collection)) {
        return {
          success: false,
          statusCode: 404,
          error: { code: 'RESOURCE_NOT_FOUND', message: `ไม่พบทรัพยากร ${resource}` },
          meta: this.createMeta(start),
        };
      }

      // Fast lookup
      const item = collection.find((r) => r.id === id || r.walletId === id);

      if (!item) {
        return {
          success: false,
          statusCode: 404,
          error: {
            code: 'RECORD_NOT_FOUND',
            message: `ไม่พบข้อมูลรหัส "${id}" ในโมดูล "${resource}"`,
          },
          meta: this.createMeta(start),
        };
      }

      let result = { ...item };

      // Optional eager load
      if (expand && expand.length > 0) {
        if (expand.includes('resolutions') && resource === 'meetings') {
          result.resolutions = dbIndexManager.findByForeignKey(
            'fk_idx_resolutions_meetingId',
            item.id
          );
        }
        if (expand.includes('tasks') && resource === 'resolutions') {
          result.tasks = dbIndexManager.findByForeignKey(
            'fk_idx_tasks_resolutionId',
            item.id
          );
        }
      }

      return {
        success: true,
        statusCode: 200,
        data: result as T,
        meta: this.createMeta(start),
      };
    } catch (err: any) {
      return {
        success: false,
        statusCode: 500,
        error: { code: 'INTERNAL_SERVER_ERROR', message: err.message },
        meta: this.createMeta(start),
      };
    }
  }

  /**
   * POST /api/v1/:resource (Create entity with Unique & FK Validation)
   */
  public create<T = any>(
    resource: SupportedResource,
    payload: any,
    actorUser?: UserProfile
  ): ApiResponse<T> {
    const start = performance.now();
    try {
      const state = centralDatabase.getState();

      // 1. Enforce Unique Constraints
      const relevantConstraints = INSTITUTIONAL_UNIQUE_CONSTRAINTS.filter(
        (c) => c.table === resource
      );
      for (const constraint of relevantConstraints) {
        if (payload[constraint.field]) {
          RelationalConstraintEngine.verifyUniqueConstraint(
            state,
            resource as keyof CentralDatabaseState,
            constraint.field,
            payload[constraint.field]
          );
        }
      }

      // 2. Enforce Foreign Key Constraints
      const relevantFks = INSTITUTIONAL_FOREIGN_KEYS.filter(
        (fk) => fk.sourceTable === resource
      );
      for (const fk of relevantFks) {
        if (payload[fk.sourceField]) {
          RelationalConstraintEngine.verifyForeignKey(state, fk, payload[fk.sourceField]);
        }
      }

      // 3. Delegate to centralDatabase method for business hooks
      let createdRecord: any;

      if (resource === 'meetings') {
        createdRecord = centralDatabase.createMeeting(payload, actorUser);
      } else if (resource === 'resolutions') {
        createdRecord = centralDatabase.createResolution(payload, actorUser);
      } else if (resource === 'tasks') {
        createdRecord = centralDatabase.createTask(payload, actorUser);
      } else if (resource === 'kpis') {
        createdRecord = centralDatabase.createKPI(payload, actorUser);
      } else if (resource === 'userAccounts') {
        createdRecord = centralDatabase.createUserAccount(payload, actorUser);
      } else {
        // Generic fallback insertion
        const idKey = resource === 'creditWallets' ? 'walletId' : 'id';
        const newId = payload[idKey] || `${resource.slice(0, 3)}-${Date.now()}`;
        createdRecord = { ...payload, [idKey]: newId };

        const updatedState = {
          ...state,
          [resource]: [createdRecord, ...(state[resource as keyof CentralDatabaseState] as any[])],
        };
        centralDatabase.restoreDatabaseState(updatedState, actorUser);
      }

      // Update Indexes
      dbIndexManager.rebuildAll(centralDatabase.getState());

      return {
        success: true,
        statusCode: 201,
        data: createdRecord as T,
        meta: this.createMeta(start),
      };
    } catch (err: any) {
      return {
        success: false,
        statusCode: err.statusCode || (err.code === 'DUPLICATE_KEY_VIOLATION' ? 409 : 422),
        error: {
          code: err.code || 'VALIDATION_ERROR',
          message: err.message,
          field: err.field,
        },
        meta: this.createMeta(start),
      };
    }
  }

  /**
   * PUT /api/v1/:resource/:id (Update entity with constraints)
   */
  public update<T = any>(
    resource: SupportedResource,
    id: string,
    payload: any,
    actorUser?: UserProfile
  ): ApiResponse<T> {
    const start = performance.now();
    try {
      const state = centralDatabase.getState();

      // Check item exists
      const collection = state[resource as keyof CentralDatabaseState] as any[];
      const existing = collection.find((r) => r.id === id || r.walletId === id);
      if (!existing) {
        return {
          success: false,
          statusCode: 404,
          error: { code: 'NOT_FOUND', message: `ไม่พบข้อมูลรหัส "${id}"` },
          meta: this.createMeta(start),
        };
      }

      // 1. Enforce Unique Constraints (excluding current ID)
      const relevantConstraints = INSTITUTIONAL_UNIQUE_CONSTRAINTS.filter(
        (c) => c.table === resource
      );
      for (const constraint of relevantConstraints) {
        if (payload[constraint.field]) {
          RelationalConstraintEngine.verifyUniqueConstraint(
            state,
            resource as keyof CentralDatabaseState,
            constraint.field,
            payload[constraint.field],
            id
          );
        }
      }

      // 2. Enforce Foreign Keys
      const relevantFks = INSTITUTIONAL_FOREIGN_KEYS.filter(
        (fk) => fk.sourceTable === resource
      );
      for (const fk of relevantFks) {
        if (payload[fk.sourceField]) {
          RelationalConstraintEngine.verifyForeignKey(state, fk, payload[fk.sourceField]);
        }
      }

      let updatedRecord: any;
      if (resource === 'meetings') {
        updatedRecord = centralDatabase.updateMeeting(id, payload, actorUser);
      } else if (resource === 'resolutions') {
        updatedRecord = centralDatabase.updateResolution(id, payload, actorUser);
      } else if (resource === 'tasks') {
        updatedRecord = centralDatabase.updateTask(id, payload, actorUser);
      } else if (resource === 'kpis') {
        updatedRecord = centralDatabase.updateKPI(id, payload, actorUser);
      } else if (resource === 'userAccounts') {
        updatedRecord = centralDatabase.updateUserAccount(id, payload, actorUser);
      } else {
        const idKey = resource === 'creditWallets' ? 'walletId' : 'id';
        updatedRecord = { ...existing, ...payload };
        const updatedList = collection.map((r) => (r[idKey] === id ? updatedRecord : r));
        const updatedState = { ...state, [resource]: updatedList };
        centralDatabase.restoreDatabaseState(updatedState, actorUser);
      }

      // Update Indexes
      dbIndexManager.rebuildAll(centralDatabase.getState());

      return {
        success: true,
        statusCode: 200,
        data: updatedRecord as T,
        meta: this.createMeta(start),
      };
    } catch (err: any) {
      return {
        success: false,
        statusCode: err.statusCode || 400,
        error: { code: err.code || 'UPDATE_ERROR', message: err.message, field: err.field },
        meta: this.createMeta(start),
      };
    }
  }

  /**
   * DELETE /api/v1/:resource/:id (Delete entity with Foreign Key Restriction)
   */
  public delete(
    resource: SupportedResource,
    id: string,
    actorUser?: UserProfile
  ): ApiResponse<{ deleted: boolean; id: string }> {
    const start = performance.now();
    try {
      const state = centralDatabase.getState();

      // 1. Enforce Referential Integrity Deletion Restriction
      const check = RelationalConstraintEngine.verifyDeleteAllowed(
        state,
        resource as keyof CentralDatabaseState,
        id
      );

      if (!check.allowed) {
        return {
          success: false,
          statusCode: 409,
          error: {
            code: 'REFERENTIAL_INTEGRITY_VIOLATION',
            message: check.violationReason || 'ไม่อนุญาตให้ลบข้อมูลที่มีรายการขึ้นตรงผูกพันอยู่',
            details: { dependentCount: check.dependentCount },
          },
          meta: this.createMeta(start),
        };
      }

      // 2. Delegate to appropriate delete hook
      let deleted = false;
      if (resource === 'meetings') {
        deleted = centralDatabase.deleteMeeting(id, actorUser);
      } else if (resource === 'resolutions') {
        deleted = centralDatabase.deleteResolution(id, actorUser);
      } else if (resource === 'tasks') {
        deleted = centralDatabase.deleteTask(id, actorUser);
      } else if (resource === 'userAccounts') {
        deleted = centralDatabase.deleteUserAccount(id, actorUser);
      } else {
        const idKey = resource === 'creditWallets' ? 'walletId' : 'id';
        const collection = state[resource as keyof CentralDatabaseState] as any[];
        const filtered = collection.filter((r) => r[idKey] !== id);
        deleted = filtered.length < collection.length;
        const updatedState = { ...state, [resource]: filtered };
        centralDatabase.restoreDatabaseState(updatedState, actorUser);
      }

      // Update Indexes
      dbIndexManager.rebuildAll(centralDatabase.getState());

      return {
        success: true,
        statusCode: 200,
        data: { deleted, id },
        meta: this.createMeta(start),
      };
    } catch (err: any) {
      return {
        success: false,
        statusCode: err.statusCode || 500,
        error: { code: err.code || 'DELETE_ERROR', message: err.message },
        meta: this.createMeta(start),
      };
    }
  }
}

export const apiGateway = new UnifiedApiGateway();
export default apiGateway;
