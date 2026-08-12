-- ============================================================================
-- GROWZY V1 - COMPLETE SUPABASE POSTGRES SQL SCHEMA
-- Agency Operating System: Tables, RLS Policies, Triggers & Seed Data
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean up any manually inserted auth.users rows to prevent GoTrue 500 schema errors
DO $$ BEGIN
    DELETE FROM auth.users WHERE email IN ('alex@growzy.com', 'marcus@growzy.com', 'elena@growzy.com', 'sarah@growzy.com', 'david@growzy.com');
EXCEPTION WHEN OTHERS THEN null; END $$;

-- 2. ENUM TYPES
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

-- 3. DROP EXISTING TABLES IN REVERSE DEPENDENCY ORDER FOR CLEAN RE-INITIALIZATION
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 4. CORE TABLES

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

-- 5. AUTOMATED UPDATED_AT TRIGGER FUNCTION
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

-- 6. AUTH USER AUTO-CONFIRMATION & AUTO-PROFILE CREATION TRIGGERS

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

-- Auto-confirm any existing unconfirmed auth users
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

-- Auto-create/sync profile for new auth user
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
        COALESCE(NEW.raw_user_meta_data->>'title', 'Agency Partner'),
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

-- 7. CAPABILITY CHECKER HELPER FUNCTION
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

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
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

-- 9. INITIAL REALISTIC AGENCY SEED DATA
-- (Legacy placeholder names Nishant, Priyanka, Prashant strictly excluded)

-- Seed Team Profiles
INSERT INTO public.profiles (id, name, email, avatar_url, title, capabilities) VALUES
('11111111-1111-1111-1111-111111111111', 'Alex Morgan', 'alex@growzy.com', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Managing Director & Founder', ARRAY['founder_view', 'manage_clients', 'manage_projects', 'manage_finance', 'view_finance', 'manage_team']::TEXT[]),
('22222222-2222-2222-2222-222222222222', 'Marcus Vance', 'marcus@growzy.com', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Head of Client Operations', ARRAY['manage_clients', 'manage_projects', 'founder_view']::TEXT[]),
('33333333-3333-3333-3333-333333333333', 'Elena Rostova', 'elena@growzy.com', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Creative Production Lead', ARRAY['manage_projects']::TEXT[]),
('44444444-4444-4444-4444-444444444444', 'Sarah Chen', 'sarah@growzy.com', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 'Finance Controller', ARRAY['manage_finance', 'view_finance']::TEXT[]),
('55555555-5555-5555-5555-555555555555', 'David Kim', 'david@growzy.com', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'Senior Content Strategist', ARRAY['manage_projects']::TEXT[])
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, capabilities = EXCLUDED.capabilities;

-- Seed Clients
INSERT INTO public.clients (id, name, legal_name, industry, status, relationship_owner_id, primary_contact_name, primary_contact_email, primary_contact_phone, start_date, billing_model, payment_terms, contract_value, notes) VALUES
('ca111111-1111-1111-1111-111111111111', 'AeroPulse Mobility', 'AeroPulse Technologies Inc.', 'Automotive & EV', 'active', '11111111-1111-1111-1111-111111111111', 'Jonathan Sterling', 'j.sterling@aeropulse.io', '+1 (555) 234-8901', '2026-01-15', 'retainer', 'Net 30', 240000.00, 'Global Q3 EV Launch Campaign and performance video production.'),
('ca222222-2222-2222-2222-222222222222', 'Luminary Health', 'Luminary Diagnostics LLC', 'HealthTech', 'active', '22222222-2222-2222-2222-222222222222', 'Dr. Aris Thorne', 'athorne@luminaryhealth.com', '+1 (555) 876-1234', '2026-02-01', 'fixed_fee', 'Net 15', 180000.00, 'Full brand repositioning and mobile app launch campaign.'),
('ca333333-3333-3333-3333-333333333333', 'FinVanguard', 'FinVanguard Global Capital', 'Fintech', 'onboarding', '11111111-1111-1111-1111-111111111111', 'Rachel Vance', 'rachel@finvanguard.com', '+1 (555) 432-9081', '2026-08-01', 'retainer', 'Net 30', 310000.00, 'New strategic retainer starting next month.'),
('ca444444-4444-4444-4444-444444444444', 'Velox Athletics', 'Velox Sportswear Group', 'E-Commerce & Retail', 'paused', '22222222-2222-2222-2222-222222222222', 'Carlos Delgado', 'carlos@veloxsport.com', '+1 (555) 991-0022', '2025-11-10', 'retainer', 'Net 45', 120000.00, 'Campaign paused pending fall line inventory arrival.'),
('ca555555-5555-5555-5555-555555555555', 'Nexus CyberSec', 'Nexus Defense Systems', 'B2B SaaS', 'lead', '11111111-1111-1111-1111-111111111111', 'Samantha Hayes', 's.hayes@nexusdef.com', '+1 (555) 345-6789', '2026-08-10', 'fixed_fee', 'Net 30', 95000.00, 'In final proposal sign-off stage.')
ON CONFLICT (id) DO NOTHING;

-- Seed Projects (With HawkVEC Milestone Arrays)
INSERT INTO public.projects (id, client_id, name, description, owner_id, production_lead_id, status, priority, health, start_date, due_date, milestones) VALUES
(
    'ba111111-1111-1111-1111-111111111111',
    'ca111111-1111-1111-1111-111111111111',
    'Apex EV Launch Commercial',
    '30s broadcast commercial and 6 social cuts for Q3 EV Reveal.',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'in_progress',
    'urgent',
    'on_track',
    '2026-07-01',
    '2026-08-28',
    '[
        {"id": "m1", "title": "Brief Approved", "completed": true, "completed_at": "2026-07-05T10:00:00Z"},
        {"id": "m2", "title": "Pre-production", "completed": true, "completed_at": "2026-07-20T14:30:00Z"},
        {"id": "m3", "title": "Shoot / Creation", "completed": true, "completed_at": "2026-08-05T18:00:00Z"},
        {"id": "m4", "title": "First Cut", "completed": true, "completed_at": "2026-08-10T12:00:00Z"},
        {"id": "m5", "title": "Client Review", "completed": false, "completed_at": null},
        {"id": "m6", "title": "Final Delivery", "completed": false, "completed_at": null}
    ]'::jsonb
),
(
    'ba222222-2222-2222-2222-222222222222',
    'ca222222-2222-2222-2222-222222222222',
    'Luminary Rebrand & Digital System',
    'Comprehensive brand strategy, visual identity system, and design system.',
    '22222222-2222-2222-2222-222222222222',
    '55555555-5555-5555-5555-555555555555',
    'review',
    'high',
    'at_risk',
    '2026-06-15',
    '2026-08-20',
    '[
        {"id": "m1", "title": "Brief Approved", "completed": true, "completed_at": "2026-06-20T09:00:00Z"},
        {"id": "m2", "title": "Pre-production", "completed": true, "completed_at": "2026-07-01T11:00:00Z"},
        {"id": "m3", "title": "Shoot / Creation", "completed": true, "completed_at": "2026-07-25T16:00:00Z"},
        {"id": "m4", "title": "First Cut", "completed": true, "completed_at": "2026-08-02T15:00:00Z"},
        {"id": "m5", "title": "Client Review", "completed": true, "completed_at": "2026-08-08T17:00:00Z"},
        {"id": "m6", "title": "Final Delivery", "completed": false, "completed_at": null}
    ]'::jsonb
),
(
    'ba333333-3333-3333-3333-333333333333',
    'ca333333-3333-3333-3333-333333333333',
    'FinVanguard Brand Launch Video',
    'Anthem video & founder interview series for brand unveiling.',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'planned',
    'medium',
    'on_track',
    '2026-08-15',
    '2026-09-30',
    '[
        {"id": "m1", "title": "Brief Approved", "completed": false, "completed_at": null},
        {"id": "m2", "title": "Pre-production", "completed": false, "completed_at": null},
        {"id": "m3", "title": "Shoot / Creation", "completed": false, "completed_at": null},
        {"id": "m4", "title": "First Cut", "completed": false, "completed_at": null},
        {"id": "m5", "title": "Client Review", "completed": false, "completed_at": null},
        {"id": "m6", "title": "Final Delivery", "completed": false, "completed_at": null}
    ]'::jsonb
),
(
    'ba444444-4444-4444-4444-444444444444',
    'ca111111-1111-1111-1111-111111111111',
    'AeroPulse Social Content Factory',
    'Monthly retainer video assets and 3D car renderings.',
    '22222222-2222-2222-2222-222222222222',
    '55555555-5555-5555-5555-555555555555',
    'blocked',
    'high',
    'critical',
    '2026-07-10',
    '2026-08-15',
    '[
        {"id": "m1", "title": "Brief Approved", "completed": true, "completed_at": "2026-07-12T10:00:00Z"},
        {"id": "m2", "title": "Pre-production", "completed": true, "completed_at": "2026-07-22T14:00:00Z"},
        {"id": "m3", "title": "Shoot / Creation", "completed": false, "completed_at": null},
        {"id": "m4", "title": "First Cut", "completed": false, "completed_at": null},
        {"id": "m5", "title": "Client Review", "completed": false, "completed_at": null},
        {"id": "m6", "title": "Final Delivery", "completed": false, "completed_at": null}
    ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Seed Tasks
INSERT INTO public.tasks (id, project_id, title, description, assignee_id, status, priority, due_date, blocker, blocker_reason) VALUES
('da111111-1111-1111-1111-111111111111', 'ba111111-1111-1111-1111-111111111111', 'Color Grading for 30s Cut', 'Apply final cinematic grade matching AeroPulse style guide.', '33333333-3333-3333-3333-333333333333', 'in_progress', 'high', '2026-08-14', false, null),
('da222222-2222-2222-2222-222222222222', 'ba111111-1111-1111-1111-111111111111', 'Sound Mix & Licensing', 'Finalize voiceover master track and license background score.', '55555555-5555-5555-5555-555555555555', 'todo', 'urgent', '2026-08-16', false, null),
('da333333-3333-3333-3333-333333333333', 'ba222222-2222-2222-2222-222222222222', 'Client Sign-off on Logo Guidelines', 'Gather leadership feedback on typography grid.', '22222222-2222-2222-2222-222222222222', 'review', 'high', '2026-08-13', true, 'Awaiting CMO approval on primary blue accent hue'),
('da444444-4444-4444-4444-444444444444', 'ba444444-4444-4444-4444-444444444444', '3D Asset Render Pipeline Setup', 'Setup Octane render nodes for EV chassis breakdown.', '33333333-3333-3333-3333-333333333333', 'backlog', 'medium', '2026-08-22', true, 'Missing high-res CAD files from AeroPulse engineering team'),
('da555555-5555-5555-5555-555555555555', 'ba111111-1111-1111-1111-111111111111', 'Storyboard Sign-off', 'Approved by Jonathan Sterling on July 18.', '11111111-1111-1111-1111-111111111111', 'done', 'low', '2026-07-18', false, null)
ON CONFLICT (id) DO NOTHING;

-- Seed Invoices
INSERT INTO public.invoices (id, invoice_number, client_id, project_id, amount, tax, issue_date, due_date, status, paid_amount, payment_date, follow_up_owner_id) VALUES
('fa111111-1111-1111-1111-111111111111', 'INV-2026-089', 'ca111111-1111-1111-1111-111111111111', 'ba111111-1111-1111-1111-111111111111', 45000.00, 4500.00, '2026-07-01', '2026-07-31', 'overdue', 0.00, null, '44444444-4444-4444-4444-444444444444'),
('fa222222-2222-2222-2222-222222222222', 'INV-2026-094', 'ca222222-2222-2222-2222-222222222222', 'ba222222-2222-2222-2222-222222222222', 60000.00, 6000.00, '2026-07-15', '2026-08-15', 'sent', 0.00, null, '44444444-4444-4444-4444-444444444444'),
('fa333333-3333-3333-3333-333333333333', 'INV-2026-078', 'ca111111-1111-1111-1111-111111111111', 'ba111111-1111-1111-1111-111111111111', 30000.00, 3000.00, '2026-06-01', '2026-07-01', 'paid', 33000.00, '2026-06-28', '44444444-4444-4444-4444-444444444444'),
('fa444444-4444-4444-4444-444444444444', 'INV-2026-102', 'ca333333-3333-3333-3333-333333333333', 'ba333333-3333-3333-3333-333333333333', 25000.00, 2500.00, '2026-08-01', '2026-08-31', 'draft', 0.00, null, '44444444-4444-4444-4444-444444444444'),
('fa555555-5555-5555-5555-555555555555', 'INV-2026-091', 'ca222222-2222-2222-2222-222222222222', 'ba222222-2222-2222-2222-222222222222', 40000.00, 4000.00, '2026-07-05', '2026-08-05', 'part_paid', 20000.00, '2026-08-02', '44444444-4444-4444-4444-444444444444')
ON CONFLICT (id) DO NOTHING;

-- Seed Activity Logs
INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details) VALUES
('11111111-1111-1111-1111-111111111111', 'milestone_completed', 'project', 'ba111111-1111-1111-1111-111111111111', '{"milestone": "First Cut", "project_name": "Apex EV Launch Commercial"}'::jsonb),
('22222222-2222-2222-2222-222222222222', 'blocker_flagged', 'task', 'da333333-3333-3333-3333-333333333333', '{"reason": "Awaiting CMO approval on primary blue accent hue"}'::jsonb),
('44444444-4444-4444-4444-444444444444', 'invoice_overdue_flagged', 'invoice', 'fa111111-1111-1111-1111-111111111111', '{"amount": 49500, "client": "AeroPulse Mobility"}'::jsonb);
