-- ==============================================================================
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
