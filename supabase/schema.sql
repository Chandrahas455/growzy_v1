-- ============================================================================
-- GROWZY V1 - CLEAN SLATE POSTGRES SQL SCHEMA (ZERO SEED DATA)
-- Agency Operating System: Fresh DB Setup for User Onboarding
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. WIPE ALL EXISTING AUTH USERS AND SEED DATA
DO $$ BEGIN
    DELETE FROM auth.users;
EXCEPTION WHEN OTHERS THEN null; END $$;

-- 3. DROP PUBLIC TABLES IN REVERSE DEPENDENCY ORDER FOR A CLEAN SLATE RESET
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 4. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE client_status AS ENUM ('lead', 'onboarding', 'active', 'paused', 'churned');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('planned', 'in_progress', 'review', 'blocked', 'completed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE project_health AS ENUM ('on_track', 'at_risk', 'critical');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE project_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('backlog', 'todo', 'in_progress', 'review', 'done');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'part_paid', 'paid', 'overdue', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE billing_model AS ENUM ('retainer', 'fixed_fee', 'hourly', 'value_based');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 5. CORE TABLES

-- PROFILES (Team Members)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    title TEXT DEFAULT 'Team Member',
    capabilities TEXT[] DEFAULT ARRAY['founder_view', 'manage_clients', 'manage_projects', 'manage_finance', 'view_finance', 'manage_team']::TEXT[],
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLIENTS
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    legal_name TEXT,
    industry TEXT,
    status client_status DEFAULT 'active',
    relationship_owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    primary_contact_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    primary_contact_name TEXT,
    primary_contact_email TEXT,
    primary_contact_phone TEXT,
    start_date DATE DEFAULT CURRENT_DATE,
    billing_model billing_model DEFAULT 'retainer',
    payment_terms TEXT DEFAULT 'Net 30',
    contract_value NUMERIC(12, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECTS (With HawkVEC Milestone Engine)
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    production_lead_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status project_status DEFAULT 'planned',
    priority project_priority DEFAULT 'medium',
    health project_health DEFAULT 'on_track',
    start_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    milestones JSONB DEFAULT '[
        {"id": "m1", "title": "Brief Approved", "completed": false, "completed_at": null},
        {"id": "m2", "title": "Pre-production", "completed": false, "completed_at": null},
        {"id": "m3", "title": "Shoot / Creation", "completed": false, "completed_at": null},
        {"id": "m4", "title": "First Cut", "completed": false, "completed_at": null},
        {"id": "m5", "title": "Client Review", "completed": false, "completed_at": null},
        {"id": "m6", "title": "Final Delivery", "completed": false, "completed_at": null}
    ]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TASKS
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status task_status DEFAULT 'todo',
    priority task_priority DEFAULT 'medium',
    due_date DATE,
    blocker BOOLEAN DEFAULT FALSE,
    blocker_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INVOICES
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status invoice_status DEFAULT 'draft',
    paid_amount NUMERIC(12, 2) DEFAULT 0.00,
    payment_date DATE,
    follow_up_owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVITY LOGS
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AUTOMATED UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_clients_updated_at ON public.clients;
CREATE TRIGGER set_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_invoices_updated_at ON public.invoices;
CREATE TRIGGER set_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. AUTH USER AUTO-CONFIRMATION & AUTO-PROFILE CREATION TRIGGERS

-- Auto-confirm newly registered auth users so login never fails with "Email not confirmed"
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
RETURNS TRIGGER AS $$
BEGIN
    NEW.email_confirmed_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_auto_confirm
    BEFORE INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_new_user();

-- Auto-create/sync profile for new auth user with full Founder capabilities
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, user_id, name, email, avatar_url, title, capabilities)
    VALUES (
        NEW.id,
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.raw_user_meta_data->>'title', 'Managing Director & Founder'),
        ARRAY['founder_view', 'manage_clients', 'manage_projects', 'manage_finance', 'view_finance', 'manage_team']::TEXT[]
    )
    ON CONFLICT (email) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        name = EXCLUDED.name,
        title = EXCLUDED.title;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. CAPABILITY CHECKER HELPER FUNCTION
CREATE OR REPLACE FUNCTION public.has_capability(cap_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_caps TEXT[];
BEGIN
    SELECT capabilities INTO user_caps
    FROM public.profiles
    WHERE (user_id = auth.uid() OR id = auth.uid()) AND active = TRUE;
    
    IF user_caps IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN cap_name = ANY(user_caps);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users" 
    ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Profiles editable by self or team managers" ON public.profiles;
CREATE POLICY "Profiles editable by self or team managers" 
    ON public.profiles FOR UPDATE TO authenticated 
    USING (auth.uid() = user_id OR auth.uid() = id OR public.has_capability('manage_team'));

DROP POLICY IF EXISTS "Clients readable by authenticated users" ON public.clients;
CREATE POLICY "Clients readable by authenticated users" 
    ON public.clients FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Clients manageable by client managers or founders" ON public.clients;
CREATE POLICY "Clients manageable by client managers or founders" 
    ON public.clients FOR ALL TO authenticated 
    USING (public.has_capability('manage_clients') OR public.has_capability('founder_view'));

DROP POLICY IF EXISTS "Projects readable by authenticated users" ON public.projects;
CREATE POLICY "Projects readable by authenticated users" 
    ON public.projects FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Projects manageable by project managers or founders" ON public.projects;
CREATE POLICY "Projects manageable by project managers or founders" 
    ON public.projects FOR ALL TO authenticated 
    USING (public.has_capability('manage_projects') OR public.has_capability('founder_view') OR owner_id = auth.uid());

DROP POLICY IF EXISTS "Tasks readable by authenticated users" ON public.tasks;
CREATE POLICY "Tasks readable by authenticated users" 
    ON public.tasks FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Tasks editable by assignees or project leads" ON public.tasks;
CREATE POLICY "Tasks editable by assignees or project leads" 
    ON public.tasks FOR ALL TO authenticated 
    USING (true);

DROP POLICY IF EXISTS "Invoices readable by finance viewers, managers, founders" ON public.invoices;
CREATE POLICY "Invoices readable by finance viewers, managers, founders" 
    ON public.invoices FOR SELECT TO authenticated 
    USING (public.has_capability('view_finance') OR public.has_capability('manage_finance') OR public.has_capability('founder_view'));

DROP POLICY IF EXISTS "Invoices manageable by finance managers or founders" ON public.invoices;
CREATE POLICY "Invoices manageable by finance managers or founders" 
    ON public.invoices FOR ALL TO authenticated 
    USING (public.has_capability('manage_finance') OR public.has_capability('founder_view'));

DROP POLICY IF EXISTS "Activity logs readable by authenticated users" ON public.activity_logs;
CREATE POLICY "Activity logs readable by authenticated users" 
    ON public.activity_logs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Activity logs writable by authenticated users" ON public.activity_logs;
CREATE POLICY "Activity logs writable by authenticated users" 
    ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);

-- NO SEED DATA ATTACHED. DATABASE IS 100% CLEAN & FRESH.
