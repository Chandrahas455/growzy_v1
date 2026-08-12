import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Edit, Mail, Phone, Calendar, FolderKanban, Receipt, ExternalLink, ShieldAlert } from 'lucide-react';
import { Client, Project, Invoice, ClientStatus, Profile } from '../types/database.types';
import { clientsService } from '../services/clients.service';
import { projectsService } from '../services/projects.service';
import { financeService } from '../services/finance.service';
import { profilesService } from '../services/profiles.service';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { ClientModal } from '../components/clients/ClientModal';
import { formatCurrency, formatDate } from '../lib/utils';

export const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadClientData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [cData, prData, invData, pfData] = await Promise.all([
        clientsService.getClientById(id),
        projectsService.getProjects(),
        financeService.getInvoices(),
        profilesService.getProfiles(),
      ]);
      setClient(cData);
      setProjects(prData.filter((p) => p.client_id === id));
      setInvoices(invData.filter((i) => i.client_id === id));
      setProfiles(pfData);
    } catch (err) {
      console.error('Failed to load client details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientData();
  }, [id]);

  const handleStatusShift = async (newStatus: ClientStatus) => {
    if (!client) return;
    try {
      setClient({ ...client, status: newStatus });
      await clientsService.updateClient(client.id, { status: newStatus });
    } catch (err) {
      console.error('Failed to update client status:', err);
      await loadClientData();
    }
  };

  const handleSaveClient = async (clientData: Partial<Client>) => {
    if (!client) return;
    await clientsService.updateClient(client.id, clientData);
    await loadClientData();
  };

  const handleDeleteClient = async () => {
    if (!client) return;
    if (!window.confirm(`ARE YOU SURE YOU WANT TO PERMANENTLY DELETE CLIENT ACCOUNT "${client.name.toUpperCase()}"? THIS CANNOT BE UNDONE.`)) return;

    try {
      setDeleting(true);
      await clientsService.deleteClient(client.id);
      navigate('/clients');
    } catch (err) {
      console.error('Failed to delete client:', err);
      alert('Failed to delete client account.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 font-mono">
        <SkeletonLoader className="h-12 w-80 bg-[#18181B] rounded-none" />
        <SkeletonLoader className="h-64 w-full bg-[#18181B] rounded-none" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-12 text-center bg-[#09090B] border-2 border-[#3F3F46] space-y-4 font-mono">
        <p className="text-rose-400 font-bold uppercase text-sm">CLIENT ACCOUNT NOT FOUND.</p>
        <button
          onClick={() => navigate('/clients')}
          className="px-6 py-3 bg-[#DFE104] text-black font-extrabold border-2 border-black uppercase text-xs tracking-wider"
        >
          RETURN TO DIRECTORY
        </button>
      </div>
    );
  }

  const totalInvoicedSum = invoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Back Navigation & Action Bar */}
      <div className="flex items-center justify-between border-b-2 border-[#3F3F46] pb-4 font-mono">
        <Link
          to="/clients"
          className="px-4 py-2 bg-[#18181B] hover:bg-[#DFE104] hover:text-black border-2 border-[#3F3F46] font-bold text-xs uppercase flex items-center space-x-2 transition-colors text-[#FAFAFA]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO CLIENT DIRECTORY</span>
        </Link>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 bg-[#DFE104] hover:bg-[#c7c902] text-black font-extrabold border-2 border-black text-xs uppercase flex items-center space-x-2 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>EDIT CLIENT DOSSIER</span>
          </button>

          <button
            onClick={handleDeleteClient}
            disabled={deleting}
            className="px-4 py-2 bg-rose-950/80 hover:bg-rose-600 border-2 border-rose-600 text-rose-300 hover:text-white font-bold text-xs uppercase flex items-center space-x-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>{deleting ? 'DELETING ACCOUNT...' : 'DELETE CLIENT ACCOUNT'}</span>
          </button>
        </div>
      </div>

      {/* Viewport Clamp Client Header */}
      <div className="bg-[#09090B] border-2 border-[#3F3F46] p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-[#3F3F46] pb-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#DFE104] bg-[#18181B] px-3 py-1 border border-[#3F3F46]">
              CLIENT DOSSIER /// {client.industry || 'GENERAL AGENT'}
            </span>
            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black uppercase tracking-tighter leading-none font-display text-[#FAFAFA]">
              {client.name}
            </h1>
            <p className="text-xs font-mono text-[#A1A1AA] uppercase">
              LEGAL ENTITY: {client.legal_name || client.name}
            </p>
          </div>

          {/* Inline Status Shifter */}
          <div className="font-mono space-y-2 bg-[#18181B] p-4 border-2 border-[#3F3F46]">
            <span className="text-[10px] font-bold uppercase text-[#A1A1AA] block">SHIFT LIFECYCLE STATUS</span>
            <div className="flex items-center space-x-3">
              <StatusBadge type="client" status={client.status} />
              <select
                value={client.status}
                onChange={(e) => handleStatusShift(e.target.value as ClientStatus)}
                className="bg-[#09090B] border-2 border-[#3F3F46] text-xs font-bold text-[#DFE104] uppercase px-3 py-1 focus:outline-none focus:border-[#DFE104]"
              >
                <option value="lead">LEAD</option>
                <option value="onboarding">ONBOARDING</option>
                <option value="active">ACTIVE</option>
                <option value="paused">PAUSED</option>
                <option value="churned">CHURNED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Financial & Contract Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
          <div className="kinetic-card p-6 space-y-2">
            <span className="text-xs font-bold uppercase text-[#A1A1AA]">CONTRACT VALUE</span>
            <div className="text-3xl font-black text-[#DFE104]">
              {formatCurrency(Number(client.contract_value) || 0)}
            </div>
            <p className="text-[11px] text-[#A1A1AA] uppercase">BILLING MODEL: {client.billing_model?.toUpperCase() || 'RETAINER'}</p>
          </div>

          <div className="kinetic-card p-6 space-y-2">
            <span className="text-xs font-bold uppercase text-[#FAFAFA]">TOTAL INVOICED REVENUE</span>
            <div className="text-3xl font-black text-[#FAFAFA]">
              {formatCurrency(totalInvoicedSum)}
            </div>
            <p className="text-[11px] text-[#DFE104] font-bold uppercase">PAYMENT TERMS: {client.payment_terms || 'NET 30'}</p>
          </div>

          <div className="kinetic-card p-6 space-y-2">
            <span className="text-xs font-bold uppercase text-[#FAFAFA]">PRIMARY CONTACT</span>
            <div className="text-lg font-black text-[#FAFAFA] truncate uppercase">
              {client.primary_contact_name || 'NOT SPECIFIED'}
            </div>
            <div className="text-[11px] text-[#A1A1AA] space-y-0.5">
              <p>EMAIL: <span className="text-[#FAFAFA]">{client.primary_contact_email || 'N/A'}</span></p>
              <p>PHONE: <span className="text-[#FAFAFA]">{client.primary_contact_phone || 'N/A'}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Projects Matrix */}
      <div className="bg-[#09090B] border-2 border-[#3F3F46] p-8 space-y-6">
        <div className="flex items-center justify-between border-b-2 border-[#3F3F46] pb-4">
          <h2 className="text-2xl font-black uppercase tracking-tight font-display text-[#FAFAFA] flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-[#DFE104]" />
            <span>LINKED PROJECT PIPELINES ({projects.length})</span>
          </h2>
          <Link
            to="/projects"
            className="text-xs font-mono font-bold uppercase text-[#DFE104] hover:underline flex items-center gap-1"
          >
            <span>+ NEW PROJECT</span>
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="p-8 text-center bg-[#18181B] border-2 border-[#3F3F46] text-xs font-mono text-[#A1A1AA] uppercase">
            NO ACTIVE PROJECTS LINKED TO THIS CLIENT ACCOUNT.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b-2 border-[#3F3F46] bg-[#18181B] text-[#A1A1AA] uppercase">
                  <th className="py-3.5 px-4 font-bold">PROJECT TITLE</th>
                  <th className="py-3.5 px-4 font-bold">HEALTH</th>
                  <th className="py-3.5 px-4 font-bold">STATUS</th>
                  <th className="py-3.5 px-4 font-bold">HAWKVEC PROGRESS</th>
                  <th className="py-3.5 px-4 font-bold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#3F3F46]">
                {projects.map((pr) => {
                  const mList = Array.isArray(pr.milestones) ? pr.milestones : [];
                  const compCount = mList.filter((m) => m.completed).length;
                  const pct = mList.length > 0 ? Math.round((compCount / mList.length) * 100) : 0;

                  return (
                    <tr key={pr.id} className="hover:bg-[#18181B] transition-colors">
                      <td className="py-4 px-4 font-bold text-[#FAFAFA] uppercase">{pr.name}</td>
                      <td className="py-4 px-4"><StatusBadge type="health" status={pr.health} /></td>
                      <td className="py-4 px-4"><StatusBadge type="project" status={pr.status} /></td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-[#27272A] h-2 border border-[#3F3F46]">
                            <div className="bg-[#DFE104] h-full" style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className="font-bold text-[#FAFAFA]">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          to={`/projects/${pr.id}`}
                          className="px-3 py-1 bg-[#18181B] hover:bg-[#DFE104] hover:text-black border-2 border-[#3F3F46] font-bold uppercase text-[11px] inline-block transition-colors"
                        >
                          INSPECT
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Linked Invoices Ledger */}
      <div className="bg-[#09090B] border-2 border-[#3F3F46] p-8 space-y-6">
        <div className="flex items-center justify-between border-b-2 border-[#3F3F46] pb-4">
          <h2 className="text-2xl font-black uppercase tracking-tight font-display text-[#FAFAFA] flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#DFE104]" />
            <span>ACCOUNT INVOICES ({invoices.length})</span>
          </h2>
        </div>

        {invoices.length === 0 ? (
          <div className="p-8 text-center bg-[#18181B] border-2 border-[#3F3F46] text-xs font-mono text-[#A1A1AA] uppercase">
            NO INVOICES ISSUED FOR THIS CLIENT ACCOUNT YET.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b-2 border-[#3F3F46] bg-[#18181B] text-[#A1A1AA] uppercase">
                  <th className="py-3.5 px-4 font-bold">INVOICE REF</th>
                  <th className="py-3.5 px-4 font-bold">AMOUNT</th>
                  <th className="py-3.5 px-4 font-bold">DUE DATE</th>
                  <th className="py-3.5 px-4 font-bold">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#3F3F46]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#18181B] transition-colors">
                    <td className="py-4 px-4 font-bold text-[#FAFAFA] uppercase">{inv.invoice_number}</td>
                    <td className="py-4 px-4 font-bold text-[#DFE104]">{formatCurrency(Number(inv.amount) || 0)}</td>
                    <td className="py-4 px-4 text-[#FAFAFA]">{formatDate(inv.due_date)}</td>
                    <td className="py-4 px-4"><StatusBadge type="invoice" status={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Client Modal */}
      <ClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveClient}
        profiles={profiles}
        initialClient={client}
      />
    </div>
  );
};
