import { CapabilityFlag, Profile } from '../types/database.types';

export const CAPABILITY_LABELS: Record<CapabilityFlag, { title: string; description: string }> = {
  founder_view: {
    title: "Founder Overview Access",
    description: "Access executive operational metrics, client health queue, and cash snapshots.",
  },
  manage_clients: {
    title: "Manage Clients",
    description: "Create, update, onboard, and edit client relationship profiles.",
  },
  manage_projects: {
    title: "Manage Projects & Delivery",
    description: "Create projects, assign leads, adjust milestones, and manage tasks.",
  },
  manage_finance: {
    title: "Manage Finance & Invoices",
    description: "Issue invoices, record payments, set payment terms, and manage revenue records.",
  },
  view_finance: {
    title: "View Financial Reports",
    description: "Read-only access to invoice statuses, billing totals, and financial snapshots.",
  },
  manage_team: {
    title: "Manage Team & Roles",
    description: "Invite team members, assign capabilities, and configure active states.",
  },
};

/**
 * Checks if a profile has a required capability flag.
 */
export function hasCapability(profile: Profile | null, requiredCapability: CapabilityFlag): boolean {
  if (!profile || !profile.active) return false;
  if (!profile.capabilities || !Array.isArray(profile.capabilities)) return false;
  
  // Founders naturally have full access across all modules
  if (profile.capabilities.includes('founder_view')) return true;
  
  return profile.capabilities.includes(requiredCapability);
}
