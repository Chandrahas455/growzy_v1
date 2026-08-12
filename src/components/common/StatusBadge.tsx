import React from 'react';
import { cn, getHealthBadgeStyle, getProjectStatusBadgeStyle, getClientStatusBadgeStyle, getInvoiceStatusBadgeStyle, getPriorityBadgeStyle } from '../../lib/utils';
import { ProjectHealth, ProjectStatus, ClientStatus, InvoiceStatus, TaskPriority } from '../../types/database.types';

export interface StatusBadgeProps {
  type: 'health' | 'project_status' | 'client_status' | 'invoice_status' | 'priority' | 'client' | 'project' | 'invoice';
  value?: string;
  status?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, status, className }) => {
  const actualValue = (status || value || '').toLowerCase();
  let styleClass = 'bg-[#18181B] text-[#FAFAFA] border-[#3F3F46]';
  let formattedLabel = actualValue.replace('_', ' ');

  if (type === 'health') {
    styleClass = getHealthBadgeStyle(actualValue as ProjectHealth);
  } else if (type === 'project_status' || type === 'project') {
    styleClass = getProjectStatusBadgeStyle(actualValue as ProjectStatus);
  } else if (type === 'client_status' || type === 'client') {
    styleClass = getClientStatusBadgeStyle(actualValue as ClientStatus);
  } else if (type === 'invoice_status' || type === 'invoice') {
    styleClass = getInvoiceStatusBadgeStyle(actualValue as InvoiceStatus);
  } else if (type === 'priority') {
    styleClass = getPriorityBadgeStyle(actualValue as TaskPriority);
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono font-extrabold border-2 uppercase tracking-wider',
        styleClass,
        className
      )}
    >
      {formattedLabel}
    </span>
  );
};
