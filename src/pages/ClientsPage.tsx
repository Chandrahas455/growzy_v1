import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, Users, Edit, Trash2 } from 'lucide-react';
import { Client, ClientStatus, Profile } from '../types/database.types';
import { clientsService } from '../services/clients.service';
import { profilesService } from '../services/profiles.service';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { ClientModal } from '../components/clients/ClientModal';
import { formatCurrency } from '../lib/utils';
import { hasCapability } from '../lib/capabilities';

export const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentProfile } = useOutletContext<{ currentProfile: Profile | null }>();

  const [clients, setClients] = useState<Client[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const canManageClients = hasCapability(currentProfile, 'manage_clients');

  const loadData = async () => {
    try {
      setLoading(true);
      const [cData, pData] = await Promise.all([
        clientsService.getClients(),
        profilesService.getProfiles(),
      ]);
      setClients(cData);
      setProfiles(pData);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveClient = async (clientData: Partial<Client>) => {
    if (clientData.id) {
      await clientsService.updateClient(clientData.id, clientData);
    } else {
      await clientsService.createClient(clientData);
    }
    await loadData();
  };

  const handleStatusChange = async (clientId: string, newStatus: ClientStatus) => {
    try {
      await clientsService.updateClient(clientId, { status: newStatus });
      await loadData();
    } catch (err) {
      console.error('Failed to update client status:', err);
    }
  };

  const handleDeleteClient = async (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`PERMANENTLY DELETE CLIENT ACCOUNT "${client.name.toUpperCase()}"? THIS CANNOT BE UNDONE.`)) return;
    try {
      await clientsService.deleteClient(client.id);
      await loadData();
    } catch (err) {
      console.error('Failed to delete client:', err);
    }
  };

  const handleOpenEditModal = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const filteredClients = clients.filter((c) => {
    if (filterStatus === 'all') return true;
    return c.status === filterStatus;
  });

  const columns: Column<Client>[] = [
    {
      key: 'name',
      header: 'CLIENT / BRAND',
      sortable: true,
      render: (client) => (
        <div className="font-mono">
          <span
            onClick={() => navigate(`/clients/${client.id}`)}
            className="font-bold text-[#FAFAFA] text-sm uppercase block hover:text-[#DFE104] cursor-pointer transition-colors"
          >
            {client.name}
          </span>
          <span className="text-[11px] text-[#A1A1AA] uppercase">
            {client.industry || 'General Agency Client'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'LIFECYCLE STATUS & SHIFT',
      sortable: true,
      render: (client) => (
        <div className="flex items-center space-x-2">
          <StatusBadge type="client" status={client.status} />
          {canManageClients && (
            <select
              value={client.status}
              onChange={(e) => handleStatusChange(client.id, e.target.value as ClientStatus)}
              className="bg-[#18181B] border-2 border-[#3F3F46] text-[10px] font-mono font-bold text-[#DFE104] uppercase px-2 py-1 focus:outline-none focus:border-[#DFE104]"
            >
              <option value="lead">LEAD</option>
              <option value="onboarding">ONBOARDING</option>
              <option value="active">ACTIVE</option>
              <option value="paused">PAUSED</option>
              <option value="churned">CHURNED</option>
            </select>
          )}
        </div>
      ),
    },
    {
      key: 'billing_model',
      header: 'BILLING & TERMS',
      render: (client) => (
        <div className="font-mono text-xs text-[#FAFAFA] uppercase">
          <span className="px-2 py-0.5 bg-[#18181B] border border-[#3F3F46] inline-block font-bold">
            {client.billing_model?.replace('_', ' ') || 'Retainer'}
          </span>
          <div className="text-[11px] text-[#A1A1AA] mt-1">{client.payment_terms || 'Net 30'}</div>
        </div>
      ),
    },
    {
      key: 'contract_value',
      header: 'CONTRACT VALUE',
      sortable: true,
      render: (client) => (
        <span className="font-mono text-sm font-bold text-[#DFE104]">
          {formatCurrency(Number(client.contract_value) || 0)}
        </span>
      ),
    },
    {
      key: 'primary_contact_name',
      header: 'PRIMARY CONTACT',
      render: (client) => (
        <div className="font-mono text-xs uppercase">
          <div className="font-bold text-[#FAFAFA]">{client.primary_contact_name || 'NOT SPECIFIED'}</div>
          <div className="text-[10px] text-[#A1A1AA]">{client.primary_contact_email || 'NO EMAIL'}</div>
        </div>
      ),
    },
    {
      key: 'id',
      header: 'ACTIONS',
      align: 'right',
      render: (client) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => navigate(`/clients/${client.id}`)}
            className="px-3 py-1 bg-[#18181B] hover:bg-[#DFE104] hover:text-black border-2 border-[#3F3F46] font-mono text-xs font-bold uppercase transition-colors"
          >
            INSPECT
          </button>
          {canManageClients && (
            <>
              <button
                onClick={(e) => handleOpenEditModal(client, e)}
                className="p-1.5 bg-[#18181B] hover:bg-[#DFE104] hover:text-black border-2 border-[#3F3F46] text-[#FAFAFA] transition-colors"
                title="Edit Client Account"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => handleDeleteClient(client, e)}
                className="p-1.5 bg-rose-950/80 hover:bg-rose-600 border-2 border-rose-600 text-rose-300 hover:text-white transition-colors"
                title="Delete Client Account"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-8 space-y-6 font-mono">
        <SkeletonLoader className="h-12 w-80 bg-[#18181B] rounded-none" />
        <SkeletonLoader className="h-64 w-full bg-[#18181B] rounded-none" />
      </div>
    );
  }

  const statuses = ['all', 'lead', 'onboarding', 'active', 'paused', 'churned'];

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Kinetic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#3F3F46] pb-8 gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#DFE104] bg-[#18181B] px-3 py-1 border border-[#3F3F46]">
            CLIENT DIRECTORY /// {clients.length} ACCOUNTS
          </span>
          <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black uppercase tracking-tighter leading-none font-display text-[#FAFAFA] mt-3">
            CLIENT ACCOUNTS
          </h1>
        </div>

        {canManageClients && (
          <button
            onClick={() => {
              setEditingClient(null);
              setIsModalOpen(true);
            }}
            className="px-6 py-4 bg-[#DFE104] hover:bg-[#c7c902] active:scale-[0.98] text-black font-mono font-extrabold text-sm uppercase tracking-wider transition-all border-2 border-black flex items-center space-x-2 shadow-none"
          >
            <Plus className="w-5 h-5" />
            <span>+ ONBOARD CLIENT</span>
          </button>
        )}
      </div>

      {/* Kinetic Lifecycle Filter Tabs */}
      <div className="flex flex-wrap gap-2 font-mono text-xs font-bold uppercase border-b-2 border-[#3F3F46] pb-4">
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 border-2 transition-all ${
              filterStatus === st
                ? 'bg-[#DFE104] text-black border-black font-extrabold'
                : 'bg-[#18181B] text-[#FAFAFA] border-[#3F3F46] hover:border-[#DFE104] hover:text-[#DFE104]'
            }`}
          >
            {st === 'all' ? 'ALL ACCOUNTS' : st}
          </button>
        ))}
      </div>

      {/* Main Kinetic Data Table */}
      <div className="bg-[#09090B] border-2 border-[#3F3F46]">
        <DataTable data={filteredClients} columns={columns} searchPlaceholder="FILTER CLIENT ACCOUNTS..." />
      </div>

      {/* Client Onboarding / Edit Modal */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
        profiles={profiles}
        initialClient={editingClient}
      />
    </div>
  );
};
