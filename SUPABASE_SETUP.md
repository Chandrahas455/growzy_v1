# Growzy V1 — Complete Production Supabase Setup Guide

Follow these exact steps to connect your Supabase Postgres database and authentication to Growzy V1.

---

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and log in or create a free account.
2. Click **"New Project"**.
3. Set your project name to `Growzy` (or any preferred name), set a secure database password, and select your preferred region.
4. Click **"Create new project"** and wait ~2 minutes for provision completion.

---

## Step 2: Execute SQL Schema & Seed Data

1. In your Supabase Dashboard, click on the **SQL Editor** icon in the left sidebar.
2. Click **"New query"**.
3. Open the generated SQL schema file from your Growzy project:
   - File location: `growzy_v1/supabase/schema.sql`
4. Copy the entire contents of `schema.sql` and paste them into the Supabase SQL Editor.
5. Click **"Run"** (or press Ctrl+Enter / Cmd+Enter).

> **What this does**:
> - Creates enum types (`client_status`, `project_status`, `project_health`, `project_priority`, `task_status`, `invoice_status`, `billing_model`).
> - Creates Postgres tables (`profiles`, `clients`, `projects`, `tasks`, `invoices`, `activity_logs`).
> - Installs automated triggers for `updated_at` timestamps and auto-profile generation on sign up (`on_auth_user_created`).
> - Configures Row Level Security (RLS) and capability checkers (`has_capability`).
> - Seeds initial client, project, task, and invoice data into your Postgres database.

---

## Step 3: Configure Environment Credentials in Growzy

1. In your Supabase Dashboard, go to **Project Settings** (gear icon) -> **API**.
2. Locate the following two values:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **Project API Keys -> anon public key** (e.g., `eyJhbGciOiJKV1QiLC...`)
3. Inside your `growzy_v1` directory, create a file named `.env.local`:
   ```bash
   touch .env.local
   ```
4. Paste your keys into `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

---

## Step 4: Run Growzy & Authenticate

1. Start your local development server:
   ```bash
   cd growzy_v1
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser.
3. You will be greeted by the **Growzy Auth Screen**.
4. Click **"Register Partner"**, enter your name, email, title, and password, then click **"Create Agency Account"**.
5. Supabase Auth will register your user, and the Postgres database trigger will automatically assign full capability flags (`founder_view`, `manage_clients`, `manage_projects`, `manage_finance`, `view_finance`, `manage_team`) to your profile!

---

## Verification Checklist

- [x] All database operations (`Clients`, `Projects`, `HawkVEC Milestones`, `Kanban Tasks`, `Invoices`) read and mutate Supabase tables directly.
- [x] No local mock arrays or mock UI fallbacks exist.
- [x] Auth context guards all routes and listens to real Supabase session state.
- [x] Row Level Security (RLS) policies enforce capabilities at the database level.
