export type CapabilityFlag =
  | 'founder_view'
  | 'manage_clients'
  | 'manage_projects'
  | 'manage_finance'
  | 'view_finance'
  | 'manage_team';

export type ClientStatus = 'lead' | 'onboarding' | 'active' | 'paused' | 'churned';
export type ProjectStatus = 'planned' | 'in_progress' | 'review' | 'blocked' | 'completed';
export type ProjectHealth = 'on_track' | 'at_risk' | 'critical';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type InvoiceStatus = 'draft' | 'sent' | 'part_paid' | 'paid' | 'overdue' | 'cancelled';
export type BillingModel = 'retainer' | 'fixed_fee' | 'hourly' | 'value_based';

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  title: string;
  capabilities: CapabilityFlag[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  legal_name?: string;
  industry?: string;
  status: ClientStatus;
  relationship_owner_id?: string;
  primary_contact_id?: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  start_date?: string;
  billing_model: BillingModel;
  payment_terms: string;
  contract_value: number;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Joined relationships
  relationship_owner?: Profile;
  active_projects_count?: number;
}

export interface HawkVecMilestone {
  id: string;
  title: string;
  completed: boolean;
  completed_at: string | null;
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  owner_id?: string;
  production_lead_id?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  health: ProjectHealth;
  start_date?: string;
  due_date?: string;
  milestones: HawkVecMilestone[];
  created_at: string;
  updated_at: string;

  // Joined relationships
  client?: Client;
  owner?: Profile;
  production_lead?: Profile;
  tasks_count?: number;
  progress_percentage?: number;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  blocker: boolean;
  blocker_reason?: string;
  created_at: string;
  updated_at: string;

  // Joined relationships
  project?: Project;
  assignee?: Profile;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id?: string;
  project_id?: string;
  amount: number;
  tax: number;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  paid_amount: number;
  payment_date?: string;
  follow_up_owner_id?: string;
  created_at: string;
  updated_at: string;

  // Joined relationships
  client?: Client;
  project?: Project;
  follow_up_owner?: Profile;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, any>;
  created_at: string;
  user?: Profile;
}
