# 🚀 GROWZY OS V1 - COMPREHENSIVE OPERATIONAL MANUAL & USER GUIDE

Welcome to **Growzy OS**, the internal operating system designed specifically for modern creative agencies, production studios, and marketing firms. This manual provides a complete walkthrough of all features, workflows, and operations built into your system.

---

## 📋 Table of Contents
1. [Getting Started & Authentication](#1-getting-started--authentication)
2. [Founder's Command Dashboard](#2-founders-command-dashboard)
3. [Client Management & Lifecycle](#3-client-management--lifecycle)
4. [Projects & The HawkVEC Milestone Engine](#4-projects--the-hawkvec-milestone-engine)
5. [Kanban Task Execution Board](#5-kanban-task-execution-board)
6. [Finance & Invoice Ledger](#6-finance--invoice-ledger)
7. [Database Architecture & Capabilities](#7-database-architecture--capabilities)

---

## 1. Getting Started & Authentication

### Signing In & Registering
- **URL**: [http://localhost:3000/login](http://localhost:3000/login)
- **Sign In**: Enter your credentials to access the agency system.
- **Register Partner**: If adding a new team partner, click **"Register Partner"**, enter their Name, Email, Title, and Password, and click **"Create Agency Account"**.
- **Automated Capability Provisioning**: All newly registered accounts are automatically confirmed in Supabase Auth and assigned full Founder-level capability flags (`founder_view`, `manage_clients`, `manage_projects`, `manage_finance`, `view_finance`, `manage_team`).

---

## 2. Founder's Command Dashboard

The Dashboard provides executive-level operational control across client relationships, project delivery health, cash snapshots, and team activities.

### Key Components:
- **Executive Metric Strip (KPIs)**:
  - **Active Retainers**: Total monthly contract value across active retainer clients.
  - **Projects at Risk**: Live counter of projects flagged as `At Risk` or `Critical`.
  - **Overdue Invoices**: Total outstanding balance past due dates.
  - **Delivery Progress**: Agency-wide weighted milestone completion percentage.
- **Delivery Health Matrix**: Sticky-header table tracking all live projects with health status badges (`On Track` 🟢, `At Risk` 🟡, `Critical` 🔴) and progress bars.
- **Client Attention Queue**: Real-time triage list highlighting accounts requiring founder intervention or onboarding sign-offs.
- **Cash Snapshot Widget**: Monthly invoice breakdown (`Paid`, `Pending`, `Overdue`).
- **Live Activity Stream**: Real-time log of team actions (milestone completions, blocker flags, invoice status updates).

---

## 3. Client Management & Lifecycle

Manage client accounts from lead intake through active delivery and retainer renewal.

### Lifecycle Statuses:
1. `Lead`: Pitch phase or initial proposal stage.
2. `Onboarding`: Contract signed; setting up brief and initial assets.
3. `Active`: Full operational execution and retainer/project billing.
4. `Paused`: Temporarily inactive (e.g., inventory delay, seasonal hiatus).
5. `Churned`: Ended relationship.

### Key Actions:
- **Add New Client**: Click **"+ Onboard Client"** to open the modal. Fill in Legal Name, Industry, Billing Model (`Retainer`, `Fixed Fee`, `Hourly`, `Value Based`), Contract Value, and Primary Contact details.
- **Client Account Inspection**: Click any client row to view their project history, primary contacts, and billing terms.

---

## 4. Projects & The HawkVEC Milestone Engine

Projects organize creative production work and track deliverable progress through the proprietary **HawkVEC 6-Stage Delivery Pipeline**.

### The HawkVEC 6-Stage Pipeline:
1. **Stage 1: Brief Approved** – Concept sign-off and scope lockdown.
2. **Stage 2: Pre-production** – Storyboards, casting, location scouting, script locking.
3. **Stage 3: Shoot / Creation** – Principal photography, 3D render asset generation, design production.
4. **Stage 4: First Cut** – Rough assembly, color pass 1, initial internal review.
5. **Stage 5: Client Review** – Deliverable sent to client for feedback and revisions.
6. **Stage 6: Final Delivery** – Master assets delivered, project marked complete.

### Project Operations:
- **Create Project**: Click **"+ New Project"**, select the client, assign an **Owner** and **Production Lead**, set start/due dates, and select priority (`Low`, `Medium`, `High`, `Urgent`).
- **Interactive Milestone Stepper**: In the Project Detail view, click any milestone to toggle its completion state. Progress percentage updates automatically across the entire OS.

---

## 5. Kanban Task Execution Board

The Kanban board provides real-time task execution tracking with drag-and-drop workflow columns.

### Workflow Columns:
- **Backlog**: Unscheduled backlog tasks.
- **To Do**: Ready for active sprint execution.
- **In Progress**: Currently being worked on by assigned team member.
- **Review**: Awaiting internal lead review or client sign-off.
- **Done**: Task completed.

### Blocker Flagging:
- **Flag Blocker**: Toggle the blocker switch on any task and input a **Blocker Reason** (e.g., *"Awaiting CMO approval on primary blue accent hue"*).
- **Visual Alert**: Blockers display prominent red outline badges across the Kanban board and Founder Dashboard.

---

## 6. Finance & Invoice Ledger

Track agency cash flow, issue invoices, and manage payment collections.

### Invoice Lifecycle:
1. `Draft`: Prepared invoice awaiting issue.
2. `Sent`: Issued to client with Net 15/30/45 payment terms.
3. `Part Paid`: Partial payment received.
4. `Paid`: Full payment settled.
5. `Overdue`: Past payment due date.
6. `Cancelled`: Voided invoice.

### Key Actions:
- **Create Invoice**: Click **"+ Create Invoice"**, select Client and Project, input Amount and Tax, set Due Date, and assign a **Follow-up Owner**.
- **Status Shift**: Update invoice status directly from the ledger row.

---

## 7. Database Architecture & Capabilities

- **Database Engine**: 100% Real Supabase PostgreSQL (Project Ref: `kfsqqmyemavcjghmkcmv`).
- **Row Level Security (RLS)**: Enforced across `profiles`, `clients`, `projects`, `tasks`, `invoices`, and `activity_logs`.
- **Capability-Based Permissions**:
  - `founder_view`: Full executive access to financial KPIs and agency-wide metrics.
  - `manage_clients`: Create and edit client accounts.
  - `manage_projects`: Create projects and advance HawkVEC milestones.
  - `manage_finance` / `view_finance`: Create, edit, and view financial invoices.
  - `manage_team`: Manage team member profiles and capabilities.

---

*Growzy OS V1 — Built for speed, precision, and executive clarity.*
