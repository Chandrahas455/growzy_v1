import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Invoice, InvoiceStatus, Client, Project, Profile } from '../../types/database.types';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoiceData: Partial<Invoice>) => Promise<void>;
  clients: Client[];
  projects: Project[];
  profiles: Profile[];
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clients,
  projects,
  profiles,
}) => {
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [amount, setAmount] = useState(35000);
  const [tax, setTax] = useState(3500);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<InvoiceStatus>('sent');
  const [followUpOwnerId, setFollowUpOwnerId] = useState(profiles[3]?.id || profiles[0]?.id || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onSave({
        client_id: clientId || clients[0]?.id,
        project_id: projectId || projects[0]?.id,
        amount: Number(amount),
        tax: Number(tax),
        issue_date: issueDate,
        due_date: dueDate,
        status,
        follow_up_owner_id: followUpOwnerId || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Error creating invoice:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="05. ISSUE AGENCY INVOICE" subtitle="GENERATE REVENUE LEDGER RECORD">
      <form onSubmit={handleSubmit} className="space-y-6 font-mono text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">CLIENT ACCOUNT *</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase font-bold focus:outline-none"
            >
              {clients.length === 0 && <option value="">NO CLIENT ACCOUNTS</option>}
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">PROJECT PIPELINE</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase font-bold focus:outline-none"
            >
              <option value="">GENERAL ACCOUNT INVOICE</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">INVOICE AMOUNT (₹ RUPEES) *</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="35000"
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#DFE104] font-bold uppercase placeholder-zinc-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">TAX / GST AMOUNT (₹ RUPEES)</label>
            <input
              type="number"
              value={tax}
              onChange={(e) => setTax(Number(e.target.value))}
              placeholder="3500"
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] font-bold uppercase placeholder-zinc-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">ISSUE DATE</label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] font-bold focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">DUE DATE</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] font-bold focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">INITIAL STATUS</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase font-bold focus:outline-none"
            >
              <option value="draft">DRAFT</option>
              <option value="sent">SENT</option>
              <option value="part_paid">PART PAID</option>
              <option value="paid">PAID</option>
              <option value="overdue">OVERDUE</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">FOLLOW-UP OWNER</label>
            <select
              value={followUpOwnerId}
              onChange={(e) => setFollowUpOwnerId(e.target.value)}
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase font-bold focus:outline-none"
            >
              <option value="">UNASSIGNED</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name.toUpperCase()} ({p.title.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t-2 border-[#3F3F46]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-[#18181B] hover:bg-[#3F3F46] border-2 border-[#3F3F46] text-[#FAFAFA] font-bold uppercase tracking-wider"
          >
            CANCEL
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-[#DFE104] hover:bg-[#c7c902] active:scale-[0.98] text-black font-extrabold border-2 border-black uppercase tracking-wider"
          >
            {submitting ? 'GENERATING INVOICE...' : 'GENERATE INVOICE'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
