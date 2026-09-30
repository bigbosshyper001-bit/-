import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Sanitize Supabase Project URL
 * Automatically strips trailing slashes, /rest/v1/, /rest/v1, /graphql, etc.
 * Ensures clean root URL format: https://[project-ref].supabase.co
 */
export function sanitizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let cleaned = rawUrl.trim();
  // Strip trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');
  // Strip REST or API prefixes if pasted accidentally
  cleaned = cleaned.replace(/\/rest\/v1\/?$/i, '');
  cleaned = cleaned.replace(/\/auth\/v1\/?$/i, '');
  cleaned = cleaned.replace(/\/storage\/v1\/?$/i, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
}

// Fallback default credentials provided by user if environment variables are not yet loaded
const DEFAULT_SUPABASE_URL = 'https://geazyjmbxwhwrlwtofvu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlYXp5am1ieHdod3Jsd3RvZnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MzE3OTYsImV4cCI6MjEwNjMwNzc5Nn0.IXMp6rMu5d_PtBV26hN9ntvS8U-GWuhaVL8hvc2pF9Y';

// Resolve configuration from Vite import.meta.env or Node process.env or fallback defaults
const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
const nodeEnv = typeof process !== 'undefined' ? process.env : undefined;

const resolvedRawUrl =
  metaEnv?.VITE_SUPABASE_URL ||
  nodeEnv?.VITE_SUPABASE_URL ||
  DEFAULT_SUPABASE_URL;

const resolvedAnonKey =
  metaEnv?.VITE_SUPABASE_ANON_KEY ||
  nodeEnv?.VITE_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;

export const SUPABASE_URL = sanitizeSupabaseUrl(resolvedRawUrl);
export const SUPABASE_ANON_KEY = (resolvedAnonKey || '').trim();

/**
 * Singleton Supabase Client Instance with auto-reconnect and offline handling
 */
let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }
  if (!clientInstance) {
    try {
      clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
    } catch (err) {
      console.warn('[Supabase] Failed to initialize client, fallback will be used:', err);
      clientInstance = null;
    }
  }
  return clientInstance;
}

/**
 * LocalStorage Fallback Cache Key Prefix
 */
const LS_PREFIX = 'mcu_supabase_fallback_';

function getLocalStorageItems<T>(table: string): T[] {
  try {
    const raw = localStorage.getItem(`${LS_PREFIX}${table}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setLocalStorageItems<T>(table: string, items: T[]): void {
  try {
    localStorage.setItem(`${LS_PREFIX}${table}`, JSON.stringify(items));
  } catch (e) {
    console.warn('[Supabase LocalStorage] Quota exceeded or storage unavailable', e);
  }
}

/**
 * Error Codes representing uncreated tables or schema issues in Supabase
 * PGRST205: relation does not exist
 * 42P01: undefined_table in PostgreSQL
 */
export function isTableMissingError(error: any): boolean {
  if (!error) return false;
  const code = String(error.code || error.error_code || '');
  const message = String(error.message || '').toLowerCase();
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    message.includes('relation') ||
    message.includes('does not exist') ||
    message.includes('not found')
  );
}

export interface SupabaseHealthStatus {
  connected: boolean;
  status: 'connected' | 'offline' | 'schema_needed' | 'error';
  latencyMs?: number;
  message: string;
  projectUrl: string;
  missingTables?: string[];
}

/**
 * Test Supabase Live Connectivity
 */
export async function testSupabaseConnection(): Promise<SupabaseHealthStatus> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      status: 'offline',
      message: 'ไม่ได้กำหนดค่า Supabase URL หรือ Anon Key',
      projectUrl: SUPABASE_URL || 'N/A',
    };
  }

  const start = performance.now();
  try {
    // Attempt query on a standard table or auth check
    const { error } = await client.from('system_health').select('count', { count: 'exact', head: true });
    const latencyMs = Math.round(performance.now() - start);

    if (error) {
      if (isTableMissingError(error)) {
        return {
          connected: true,
          status: 'schema_needed',
          latencyMs,
          message: 'เชื่อมต่อ Supabase ได้แล้ว แต่ยังไม่ได้รันคำสั่ง SQL สร้างตาราง',
          projectUrl: SUPABASE_URL,
        };
      }
      return {
        connected: false,
        status: 'error',
        latencyMs,
        message: `เกิดข้อผิดพลาด: ${error.message}`,
        projectUrl: SUPABASE_URL,
      };
    }

    return {
      connected: true,
      status: 'connected',
      latencyMs,
      message: 'เชื่อมต่อ Supabase สำเร็จ (Real-time พร้อมใช้งาน)',
      projectUrl: SUPABASE_URL,
    };
  } catch (err: any) {
    return {
      connected: false,
      status: 'offline',
      message: err?.message || 'เครือข่ายขัดข้อง กำลังใช้โหมดสำรอง (Local Storage)',
      projectUrl: SUPABASE_URL,
    };
  }
}

/**
 * Universal Data Access Service with Automatic Local Storage Fallback & Offline Resilience
 */
export const supabaseService = {
  client: getSupabaseClient(),

  /**
   * Fetch collection from Supabase, or seamlessly fall back to LocalStorage
   */
  async getCollection<T = any>(table: string): Promise<{ data: T[]; fromFallback: boolean; error?: any }> {
    const client = getSupabaseClient();
    if (!client) {
      return { data: getLocalStorageItems<T>(table), fromFallback: true };
    }

    try {
      const { data, error } = await client.from(table).select('*').order('created_at', { ascending: false });

      if (error) {
        if (isTableMissingError(error)) {
          console.warn(`[Supabase] Table "${table}" does not exist in Supabase yet. Using local fallback.`);
        } else {
          console.warn(`[Supabase] Error reading "${table}":`, error.message);
        }
        return { data: getLocalStorageItems<T>(table), fromFallback: true, error };
      }

      if (data && Array.isArray(data)) {
        // Cache to LocalStorage for offline persistence
        setLocalStorageItems(table, data);
        return { data: data as T[], fromFallback: false };
      }

      return { data: getLocalStorageItems<T>(table), fromFallback: true };
    } catch (err) {
      return { data: getLocalStorageItems<T>(table), fromFallback: true, error: err };
    }
  },

  /**
   * Insert record into Supabase with LocalStorage fallback
   */
  async insertRecord<T = any>(table: string, payload: any): Promise<{ data: T | null; fromFallback: boolean; error?: any }> {
    const client = getSupabaseClient();
    const enriched = {
      ...payload,
      id: payload.id || `rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      created_at: payload.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save locally first for instant optimistic response
    const currentLocal = getLocalStorageItems<any>(table);
    setLocalStorageItems(table, [enriched, ...currentLocal]);

    if (!client) {
      return { data: enriched as T, fromFallback: true };
    }

    try {
      const { data, error } = await client.from(table).insert([enriched]).select().single();
      if (error) {
        console.warn(`[Supabase] Insert into "${table}" had error, saved to local cache:`, error.message);
        return { data: enriched as T, fromFallback: true, error };
      }
      return { data: (data || enriched) as T, fromFallback: false };
    } catch (err) {
      return { data: enriched as T, fromFallback: true, error: err };
    }
  },

  /**
   * Update record in Supabase with LocalStorage fallback
   */
  async updateRecord<T = any>(table: string, id: string, payload: any): Promise<{ data: T | null; fromFallback: boolean; error?: any }> {
    const client = getSupabaseClient();
    const updatedPayload = { ...payload, updated_at: new Date().toISOString() };

    // Update local cache
    const currentLocal = getLocalStorageItems<any>(table);
    const updatedLocal = currentLocal.map((item) => (item.id === id ? { ...item, ...updatedPayload } : item));
    setLocalStorageItems(table, updatedLocal);

    if (!client) {
      const found = updatedLocal.find((i) => i.id === id);
      return { data: (found || updatedPayload) as T, fromFallback: true };
    }

    try {
      const { data, error } = await client.from(table).update(updatedPayload).eq('id', id).select().single();
      if (error) {
        return { data: updatedPayload as T, fromFallback: true, error };
      }
      return { data: (data || updatedPayload) as T, fromFallback: false };
    } catch (err) {
      return { data: updatedPayload as T, fromFallback: true, error: err };
    }
  },

  /**
   * Delete record from Supabase with LocalStorage fallback
   */
  async deleteRecord(table: string, id: string): Promise<{ success: boolean; fromFallback: boolean; error?: any }> {
    const client = getSupabaseClient();
    // Delete from local cache
    const currentLocal = getLocalStorageItems<any>(table);
    setLocalStorageItems(table, currentLocal.filter((item) => item.id !== id));

    if (!client) {
      return { success: true, fromFallback: true };
    }

    try {
      const { error } = await client.from(table).delete().eq('id', id);
      if (error) {
        return { success: false, fromFallback: true, error };
      }
      return { success: true, fromFallback: false };
    } catch (err) {
      return { success: false, fromFallback: true, error: err };
    }
  },

  /**
   * Subscribe to real-time changes on a specific Supabase table
   */
  subscribeToTable(table: string, onEvent: (payload: any) => void): () => void {
    const client = getSupabaseClient();
    if (!client) return () => {};

    try {
      const channel = client
        .channel(`realtime_${table}_${Date.now()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (payload) => {
            onEvent(payload);
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    } catch (err) {
      console.warn(`[Supabase Realtime] Could not subscribe to "${table}":`, err);
      return () => {};
    }
  },
};

/**
 * Complete PostgreSQL / Supabase SQL Schema for MCU Academic Affairs Platform
 */
export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- MCU ACADEMIC AFFAIRS PLATFORM - COMPLETE SUPABASE DATABASE SCHEMA
-- มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (กองวิชาการ)
-- ==============================================================================
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Create Core Tables
CREATE TABLE IF NOT EXISTS public.kpis (
    id TEXT PRIMARY KEY,
    code TEXT,
    title TEXT NOT NULL,
    pillar TEXT,
    target NUMERIC,
    current_value NUMERIC,
    unit TEXT,
    fiscal_year TEXT,
    status TEXT,
    department TEXT,
    responsible_person TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meetings (
    id TEXT PRIMARY KEY,
    meeting_number TEXT NOT NULL,
    title TEXT NOT NULL,
    date TIMESTAMPTZ,
    location TEXT,
    status TEXT,
    room TEXT,
    is_hybrid BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.resolutions (
    id TEXT PRIMARY KEY,
    resolution_number TEXT NOT NULL,
    title TEXT NOT NULL,
    meeting_id TEXT,
    status TEXT,
    responsible_unit TEXT,
    followup_status TEXT,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.action_plans (
    id TEXT PRIMARY KEY,
    code TEXT,
    title TEXT NOT NULL,
    pillar TEXT,
    department TEXT,
    responsible_person TEXT,
    status TEXT,
    progress NUMERIC DEFAULT 0,
    budget_allocated NUMERIC DEFAULT 0,
    budget_spent NUMERIC DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.risks (
    id TEXT PRIMARY KEY,
    code TEXT,
    title TEXT NOT NULL,
    category TEXT,
    level TEXT,
    likelihood NUMERIC,
    impact NUMERIC,
    mitigation_plan TEXT,
    responsible_person TEXT,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.budgets (
    id TEXT PRIMARY KEY,
    fiscal_year TEXT NOT NULL,
    total_allocated NUMERIC DEFAULT 0,
    spent NUMERIC DEFAULT 0,
    committed NUMERIC DEFAULT 0,
    spent_percentage NUMERIC DEFAULT 0,
    departments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_accounts (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT,
    status TEXT DEFAULT 'active',
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_name TEXT,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    record_id TEXT,
    details TEXT,
    ip TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.system_health (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    service TEXT NOT NULL,
    latency_ms NUMERIC,
    last_checked TIMESTAMPTZ DEFAULT now(),
    details JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.curriculums (
    id TEXT PRIMARY KEY,
    code TEXT,
    name_th TEXT NOT NULL,
    name_en TEXT,
    degree_level TEXT,
    faculty TEXT,
    status TEXT,
    credits NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.online_forms (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    code TEXT,
    category TEXT,
    description TEXT,
    status TEXT DEFAULT 'published',
    submissions_count NUMERIC DEFAULT 0,
    fields JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.online_forms ENABLE ROW LEVEL SECURITY;

-- 3. Create Open Access Policies for Web Application
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN ('kpis', 'meetings', 'resolutions', 'action_plans', 'risks', 'budgets', 'user_accounts', 'audit_logs', 'system_health', 'curriculums', 'online_forms')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public select policy" ON public.%I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Public modify policy" ON public.%I', tbl);
        EXECUTE format('CREATE POLICY "Public select policy" ON public.%I FOR SELECT USING (true)', tbl);
        EXECUTE format('CREATE POLICY "Public modify policy" ON public.%I FOR ALL USING (true)', tbl);
    END LOOP;
END $$;

-- 4. Enable Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE
    public.kpis,
    public.meetings,
    public.resolutions,
    public.action_plans,
    public.risks,
    public.budgets,
    public.audit_logs,
    public.system_health;

-- 5. Seed Initial Institutional Health Record
INSERT INTO public.system_health (id, status, service, latency_ms)
VALUES ('health_primary', 'healthy', 'MCU Academic Platform', 15)
ON CONFLICT (id) DO UPDATE SET last_checked = now();
`;
