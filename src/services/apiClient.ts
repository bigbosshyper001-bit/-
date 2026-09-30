import type { UserProfile } from '../types.ts';
import { supabaseService } from './supabase.ts';

export interface ApiClientResponse<T = any> {
  success: boolean;
  data?: T;
  count?: number;
  error?: string;
  message?: string;
}

export interface RecycleBinItem {
  id: string;
  code?: string;
  title?: string;
  _collection: string;
  deleted_at: string;
  deleted_by: string;
  delete_reason: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface AuditLogItem {
  id: string;
  user_id: string;
  user_name: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'PERMANENT_DELETE' | 'RESET';
  module: string;
  record_id: string;
  timestamp: string;
  ip: string;
  details: string;
}

export interface DashboardSummaryData {
  meetings: { total: number; upcoming: number; completed: number };
  tasks: { total: number; pending: number; completed: number };
  actionPlans: { total: number; inProgress: number; completed: number };
  kpis: { total: number; onTrack: number };
  risks: { total: number; high: number };
  documents: { total: number };
  programs: { total: number };
  faculty: { total: number };
  regulations: { total: number };
}

class ApiClientService {
  private baseUrl = '/api/v1';

  public async getCollection<T = any>(
    collection: string,
    options?: { search?: string; status?: string; includeDeleted?: boolean }
  ): Promise<ApiClientResponse<T[]>> {
    try {
      const params = new URLSearchParams();
      if (options?.search) params.append('search', options.search);
      if (options?.status) params.append('status', options.status);
      if (options?.includeDeleted) params.append('includeDeleted', 'true');

      const url = `${this.baseUrl}/${collection}?${params.toString()}`;
      const res = await fetch(url);
      const json = await res.json();
      return json;
    } catch (err: any) {
      console.error(`[ApiClient] Failed to fetch collection ${collection}:`, err);
      return { success: false, data: [], error: err.message };
    }
  }

  public async getRecord<T = any>(collection: string, id: string): Promise<ApiClientResponse<T>> {
    try {
      const res = await fetch(`${this.baseUrl}/${collection}/${id}`);
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async createRecord<T = any>(
    collection: string,
    payload: any,
    actorUser?: UserProfile | null
  ): Promise<ApiClientResponse<T>> {
    // Replicate to Supabase asynchronously in background
    supabaseService.insertRecord(collection, payload).catch((e) => {
      console.warn('[ApiClient -> Supabase] Background replication note:', e);
    });

    try {
      const res = await fetch(`${this.baseUrl}/${collection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          _actorUser: actorUser
            ? { id: actorUser.id, name: actorUser.name, role: actorUser.role }
            : undefined,
        }),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async updateRecord<T = any>(
    collection: string,
    id: string,
    payload: any,
    actorUser?: UserProfile | null
  ): Promise<ApiClientResponse<T>> {
    // Replicate to Supabase asynchronously in background
    supabaseService.updateRecord(collection, id, payload).catch((e) => {
      console.warn('[ApiClient -> Supabase] Background update note:', e);
    });

    try {
      const res = await fetch(`${this.baseUrl}/${collection}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          _actorUser: actorUser
            ? { id: actorUser.id, name: actorUser.name, role: actorUser.role }
            : undefined,
        }),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async deleteRecord(
    collection: string,
    id: string,
    reason: string = 'Deleted by user action',
    actorUser?: UserProfile | null
  ): Promise<ApiClientResponse> {
    // Replicate deletion to Supabase asynchronously in background
    supabaseService.deleteRecord(collection, id).catch((e) => {
      console.warn('[ApiClient -> Supabase] Background delete note:', e);
    });

    try {
      const res = await fetch(`${this.baseUrl}/${collection}/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason,
          _actorUser: actorUser
            ? { id: actorUser.id, name: actorUser.name, role: actorUser.role }
            : undefined,
        }),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async getRecycleBin(): Promise<ApiClientResponse<RecycleBinItem[]>> {
    try {
      const res = await fetch(`${this.baseUrl}/recycle-bin`);
      return await res.json();
    } catch (err: any) {
      return { success: false, data: [], error: err.message };
    }
  }

  public async restoreFromRecycleBin(
    collection: string,
    id: string,
    actorUser?: UserProfile | null
  ): Promise<ApiClientResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/recycle-bin/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection,
          id,
          userId: actorUser?.id,
          userName: actorUser?.name,
        }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async permanentDelete(
    collection: string,
    id: string,
    actorUser?: UserProfile | null
  ): Promise<ApiClientResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/recycle-bin/permanent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection,
          id,
          userId: actorUser?.id,
          userName: actorUser?.name,
          userRole: actorUser?.role,
        }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async getAuditLogs(): Promise<ApiClientResponse<AuditLogItem[]>> {
    try {
      const res = await fetch(`${this.baseUrl}/audit-logs`);
      return await res.json();
    } catch (err: any) {
      return { success: false, data: [], error: err.message };
    }
  }

  public async getDashboardSummary(): Promise<ApiClientResponse<DashboardSummaryData>> {
    try {
      const res = await fetch(`${this.baseUrl}/dashboard/summary`);
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async getSystemStats(): Promise<ApiClientResponse<any>> {
    try {
      const res = await fetch(`${this.baseUrl}/system/stats`);
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async backupDatabase(actorUser?: UserProfile | null): Promise<any> {
    const res = await fetch(`${this.baseUrl}/system/backup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: actorUser?.id,
        userName: actorUser?.name,
      }),
    });
    return await res.json();
  }

  public async restoreDatabase(backupPayload: any, actorUser?: UserProfile | null): Promise<any> {
    const res = await fetch(`${this.baseUrl}/system/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: backupPayload,
        userId: actorUser?.id,
        userName: actorUser?.name,
        userRole: actorUser?.role,
      }),
    });
    return await res.json();
  }

  public async resetDatabase(actorUser?: UserProfile | null): Promise<any> {
    const res = await fetch(`${this.baseUrl}/system/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: actorUser?.id,
        userName: actorUser?.name,
        userRole: actorUser?.role || 'Super Admin',
      }),
    });
    return await res.json();
  }
}

export const apiClient = new ApiClientService();
