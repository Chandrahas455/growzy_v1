import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { HawkVecMilestone, ProjectHealth, ProjectStatus, TaskPriority, TaskStatus, InvoiceStatus, ClientStatus } from '../types/database.types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates HawkVEC Progress Percentage based strictly on completed delivery milestones.
 * Default HawkVEC milestones: Brief Approved, Pre-production, Shoot / Creation, First Cut, Client Review, Final Delivery.
 */
export function calculateHawkVecProgress(milestones: HawkVecMilestone[]): number {
  if (!milestones || milestones.length === 0) return 0;
  const completedCount = milestones.filter(m => m.completed).length;
  return Math.round((completedCount / milestones.length) * 100);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function getHealthBadgeStyle(health: ProjectHealth) {
  switch (health) {
    case 'on_track':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'at_risk':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'critical':
      return 'bg-rose-500/15 text-rose-400 border-rose-500/40 animate-pulse';
  }
}

export function getProjectStatusBadgeStyle(status: ProjectStatus) {
  switch (status) {
    case 'planned':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'in_progress':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    case 'review':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    case 'blocked':
      return 'bg-rose-500/15 text-rose-400 border-rose-500/40';
    case 'completed':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  }
}

export function getClientStatusBadgeStyle(status: ClientStatus) {
  switch (status) {
    case 'lead':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'onboarding':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    case 'active':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'paused':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'churned':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
}

export function getInvoiceStatusBadgeStyle(status: InvoiceStatus) {
  switch (status) {
    case 'draft':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    case 'sent':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'part_paid':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'paid':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'overdue':
      return 'bg-rose-500/15 text-rose-400 border-rose-500/40';
    case 'cancelled':
      return 'bg-slate-600/20 text-slate-500 border-slate-600/30';
  }
}

export function getPriorityBadgeStyle(priority: TaskPriority) {
  switch (priority) {
    case 'urgent':
      return 'bg-rose-500/20 text-rose-400 border-rose-500/40 font-semibold';
    case 'high':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'medium':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'low':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
}
