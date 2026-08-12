# 🎨 MASTER LOVABLE.DEV PROMPT - GROWZY OS V1 (AGENCY OPERATING SYSTEM)

Copy and paste the entire prompt below directly into **Lovable.dev** to generate a modern, high-contrast, world-class UI for Growzy OS:

```text
Act as a Principal UX/UI Designer and Senior Frontend Engineer specializing in high-density enterprise SaaS operating systems (inspired by Linear, Vercel, Stripe Dashboard, and Raycast).

Design and build a complete, ultra-premium React + TypeScript + Tailwind CSS Web Application for "Growzy OS" — an elite internal operating system for creative production agencies and marketing firms.

### DESIGN SYSTEM & VISUAL STYLE:
1. Palette & Atmosphere: Deep ultra-dark aesthetic (Background: #0C0E12, Surface Card: #161A23, Border: #252B3B, Accent Brand: Emerald #10B981 and Violet #8B5CF6).
2. Contrast & Density: Crisp, high-contrast typography scale (Inter/JetBrains Mono font family). 8px grid alignment, compact padding, micro-animations, glassmorphism overlays, and restrained ambient glow shadows.
3. Component Style: Sticky headers on data tables, sleek side-drawer inspection panels for complex records, status badges with subtle colored LED dots, and inline quick-edit triggers.

### PAGES & CORE COMPONENTS TO GENERATE:

1. TOP HEADER & SIDEBAR NAVIGATION:
   - Sidebar with logo "Growzy OS", navigation tabs: Dashboard, Clients, Projects, Execution Board, Finance.
   - Top Header showing current workspace status, search trigger (Cmd + K aesthetic), active user profile badge (Name, Title, Avatar), and Sign Out trigger.

2. FOUNDER'S EXECUTIVE DASHBOARD (/dashboard):
   - Metric KPI Cards (Active Retainers, Projects at Risk, Overdue Revenue, Delivery Progress % with mini ring gauge).
   - Delivery Health Matrix Table (Columns: Client, Project, Owner, Health Badge [On Track/At Risk/Critical], HawkVEC Progress Bar %, Milestone Stage).
   - Client Attention Queue (Compact triage list highlighting accounts requiring sign-off).
   - Cash Snapshot & Live Activity Feed (Timeline stream of milestone changes, blocker alerts, and invoice updates).

3. CLIENT MANAGEMENT MODULE (/clients):
   - Client Lifecycle Filter Tabs (All, Lead, Onboarding, Active, Paused, Churned).
   - Dense Data Table (Columns: Client Name, Industry, Status Badge, Billing Model [Retainer/Fixed Fee], Contract Value $, Relationship Owner, Actions).
   - "+ Onboard Client" Slide-over Modal with clean form inputs.
   - Interactive Client Detail Drawer showing assigned projects, billing terms, and primary contacts.

4. PROJECTS & HAWKVEC MILESTONE ENGINE (/projects & /projects/:id):
   - Project List with Search, Filter by Status, Health, and Priority (Low, Medium, High, Urgent).
   - HawkVEC 6-Stage Stepper Component: Visual 6-stage milestone tracker (1. Brief Approved -> 2. Pre-production -> 3. Shoot/Creation -> 4. First Cut -> 5. Client Review -> 6. Final Delivery). Clicking a stage toggles completion and dynamically recalculates project completion %.
   - Deliverables list and owner assignments.

5. KANBAN TASK EXECUTION BOARD (/kanban):
   - 5 Workflow Columns: Backlog, To Do, In Progress, Review, Done.
   - Task Cards displaying Project Name, Task Title, Assignee Avatar, Due Date, Priority Tag.
   - Blocker Indicator: Red highlighted border and blocker badge ("Awaiting CMO Sign-off") with one-click blocker resolution toggle.
   - Drag and drop interaction simulation.

6. FINANCE & INVOICE LEDGER (/finance):
   - Financial Summary Strip (Total Invoiced, Paid Revenue, Outstanding Balance, Overdue Cash).
   - Invoice Ledger Table (Columns: Invoice #, Client Name, Project, Issue Date, Due Date, Amount $, Tax $, Status Badge [Draft/Sent/Part Paid/Paid/Overdue/Cancelled], Follow-up Owner).
   - Status Shift Selector dropdown directly in table rows.
   - "+ Create Invoice" modal with automatic tax calculation.

### TECHNICAL COMPONENT EXPORTS:
Ensure all components are modularly split into reusable React components using Lucide icons (`lucide-react`) and standard Tailwind utility classes so the UI codebase can be easily wired to `@supabase/supabase-js` database hooks.
```
