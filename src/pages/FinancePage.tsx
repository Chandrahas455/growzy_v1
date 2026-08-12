import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Receipt, Plus, DollarSign, Clock, CheckCircle2, AlertTriangle, ArrowUpRight, Trash2 } from 'lucide-react';
import { Invoice, Client, Project, Profile } from '../types/database.types';
import { financeService, FinancialMetrics } from '../services/finance.service';
import { clientsService } from '../services/clients.service';
import { projectsService } from '../services/projects.service';
import { profilesService } from '../services/profiles.service';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { InvoiceModal } from '../components/finance/InvoiceModal';
import { formatCurrency, formatDate } from '../lib/utils';
import { hasCapability } from '../lib/capabilities';

export const FinancePage: React.FC = () => {
  const { currentProfile } = useOutletContext<{ currentProfile: Profile | null }>();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalInvoiced: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    totalOverdue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const canManageFinance = hasCapability(currentProfile, 'manage_finance');
  const canViewFinance = hasCapability(currentProfile, 'view_finance');

  const loadData = async () => {
    try {
      setLoading(true);
      const [invData, metData, clData, prData, pfData] = await Promise.all([
        financeService.getInvoices(),
        financeService.calculateFinancialMetrics(),
        clientsService.getClients(),
        projectsService.getProjects(),
        profilesService.getProfiles(),
      ]);
      setInvoices(invData);
      setMetrics(metData);
      setClients(clData);
      setProjects(prData);
      setProfiles(pfData);
    } catch (err) {
      console.error('Failed to load finance ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (invoiceId: string, newStatus: any) => {
    try {
      await financeService.updateInvoiceStatus(invoiceId, newStatus);
      await loadData();
    } catch (err) {
      console.error('Failed to update invoice status:', err);
    }
  };

  const handleCreateInvoice = async (invoiceData: Partial<Invoice>) => {
    await financeService.createInvoice(invoiceData);
    await loadData();
  };

  const handleDeleteInvoice = async (invoice: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`PERMANENTLY DELETE INVOICE RECORD "${invoice.invoice_number.toUpperCase()}"? THIS CANNOT BE UNDONE.`)) return;
    try {
      await financeService.deleteInvoice(invoice.id);
      await loadData();
    } catch (err) {
      console.error('Failed to delete invoice:', err);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus === 'all') return true;
    return inv.status === filterStatus;
  });

  const columns: Column<Invoice>[] = [
    {
      key: 'invoice_number',
      header: 'INVOICE REF',
      sortable: true,
      render: (inv) => (
        <span className="font-mono font-bold text-[#FAFAFA] text-sm uppercase">
          {inv.invoice_number}
        </span>
      ),
    },
    {
      key: 'client_id',
      header: 'CLIENT ACCOUNT',
      render: (inv) => {
        const client = clients.find((c) => c.id === inv.client_id);
        return (
          <span className="font-mono text-xs text-[#FAFAFA] font-bold uppercase">
            {client ? client.name : 'Unknown Client'}
          </span>
        );
      },
    },
    {
      key: 'amount',
      header: 'AMOUNT (EXCL TAX)',
      sortable: true,
      render: (inv) => (
        <span className="font-mono text-sm font-bold text-[#FAFAFA]">
          {formatCurrency(Number(inv.amount) || 0)}
        </span>
      ),
    },
    {
      key: 'issue_date',
      header: 'DATES (ISSUE / DUE)',
      render: (inv) => (
        <div className="font-mono text-xs text-[#A1A1AA]">
          <div>ISSUE: {formatDate(inv.issue_date)}</div>
          <div className="font-bold text-[#FAFAFA]">DUE: {formatDate(inv.due_date)}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'STATUS & SHIFT',
      sortable: true,
      render: (inv) => (
        <div className="flex items-center space-x-2">
          <StatusBadge type="invoice" status={inv.status} />
          {canManageFinance && (
            <select
              value={inv.status}
              onChange={(e) => handleStatusChange(inv.id, e.target.value as any)}
              className="bg-[#18181B] border-2 border-[#3F3F46] text-[10px] font-mono font-bold text-[#FAFAFA] uppercase px-2 py-1 focus:outline-none focus:border-[#DFE104]"
            >
              <option value="draft">DRAFT</option>
              <option value="sent">SENT</option>
              <option value="part_paid">PART PAID</option>
              <option value="paid">PAID</option>
              <option value="overdue">OVERDUE</option>
              <option value="cancelled">CANCELLED</option>
            </select>
          )}
        </div>
      ),
    },
    {
      key: 'follow_up_owner_id',
      header: 'FOLLOW-UP OWNER',
      render: (inv) => {
        const owner = profiles.find((p) => p.id === inv.follow_up_owner_id);
        return (
          <span className="font-mono text-xs text-[#A1A1AA] uppercase font-bold">
            {owner ? owner.name : 'Unassigned'}
          </span>
        );
      },
    },
    {
      key: 'id',
      header: 'ACTIONS',
      align: 'right',
      render: (inv) => (
        <div className="flex items-center justify-end">
          {canManageFinance && (
            <button
              onClick={(e) => handleDeleteInvoice(inv, e)}
              className="p-1.5 bg-rose-950/80 hover:bg-rose-600 border-2 border-rose-600 text-rose-300 hover:text-white transition-colors"
              title="Delete Invoice Record"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-8 space-y-6 font-mono">
        <SkeletonLoader className="h-12 w-80 bg-[#18181B] rounded-none" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonLoader key={i} className="h-32 bg-[#18181B] rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  const invoiceStatuses = ['all', 'draft', 'sent', 'part_paid', 'paid', 'overdue', 'cancelled'];

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Kinetic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#3F3F46] pb-8 gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#DFE104] bg-[#18181B] px-3 py-1 border border-[#3F3F46]">
            FINANCIAL LEDGER /// CASH & REVENUE MATRIX
          </span>
          <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black uppercase tracking-tighter leading-none font-display text-[#FAFAFA] mt-3">
            FINANCE LEDGER
          </h1>
        </div>

        {canManageFinance && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-4 bg-[#DFE104] hover:bg-[#c7c902] active:scale-[0.98] text-black font-mono font-extrabold text-sm uppercase tracking-wider transition-all border-2 border-black flex items-center space-x-2 shadow-none"
          >
            <Plus className="w-5 h-5" />
            <span>+ CREATE INVOICE</span>
          </button>
        )}
      </div>

      {/* Kinetic Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
        <div className="kinetic-card p-6 space-y-2">
          <span className="text-xs font-bold uppercase text-[#A1A1AA]">TOTAL INVOICED</span>
          <div className="text-3xl font-black text-[#FAFAFA]">
            {formatCurrency(metrics.totalInvoiced)}
          </div>
        </div>

        <div className="kinetic-card p-6 space-y-2">
          <span className="text-xs font-bold uppercase text-[#DFE104]">COLLECTED CASH</span>
          <div className="text-3xl font-black text-[#DFE104]">
            {formatCurrency(metrics.totalCollected)}
          </div>
        </div>

        <div className="kinetic-card p-6 space-y-2">
          <span className="text-xs font-bold uppercase text-amber-400">OUTSTANDING CASH</span>
          <div className="text-3xl font-black text-amber-400">
            {formatCurrency(metrics.totalOutstanding)}
          </div>
        </div>

        <div className="kinetic-card p-6 space-y-2">
          <span className="text-xs font-bold uppercase text-rose-400">OVERDUE BALANCE</span>
          <div className="text-3xl font-black text-rose-400">
            {formatCurrency(metrics.totalOverdue)}
          </div>
        </div>
      </div>

      {/* Kinetic Status Filters */}
      <div className="flex flex-wrap gap-2 font-mono text-xs font-bold uppercase border-b-2 border-[#3F3F46] pb-4">
        {invoiceStatuses.map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 border-2 transition-all ${
              filterStatus === st
                ? 'bg-[#DFE104] text-black border-black font-extrabold'
                : 'bg-[#18181B] text-[#FAFAFA] border-[#3F3F46] hover:border-[#DFE104] hover:text-[#DFE104]'
            }`}
          >
            {st === 'all' ? 'ALL INVOICES' : st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Main Kinetic Data Table */}
      <div className="bg-[#09090B] border-2 border-[#3F3F46]">
        <DataTable data={filteredInvoices} columns={columns} searchPlaceholder="FILTER INVOICES BY REF OR CLIENT..." />
      </div>

      {/* Create Invoice Modal */}
      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateInvoice}
        clients={clients}
        projects={projects}
        profiles={profiles}
      />
    </div>
  );
};
