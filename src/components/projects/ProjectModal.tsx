import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Project, ProjectStatus, ProjectPriority, ProjectHealth, Client, Profile } from '../../types/database.types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<Project>) => Promise<void>;
  clients: Client[];
  profiles: Profile[];
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clients,
  profiles,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [ownerId, setOwnerId] = useState(profiles[0]?.id || '');
  const [productionLeadId, setProductionLeadId] = useState(profiles[2]?.id || profiles[0]?.id || '');
  const [status, setStatus] = useState<ProjectStatus>('planned');
  const [priority, setPriority] = useState<ProjectPriority>('medium');
  const [health, setHealth] = useState<ProjectHealth>('on_track');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setSubmitting(true);
      await onSave({
        name,
        description,
        client_id: clientId || clients[0]?.id,
        owner_id: ownerId || undefined,
        production_lead_id: productionLeadId || undefined,
        status,
        priority,
        health,
        start_date: startDate,
        due_date: dueDate,
      });
      onClose();
    } catch (err) {
      console.error('Error creating project:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="02. INITIALIZE AGENCY PROJECT" subtitle="SETUP PROJECT DELIVERY PIPELINE WITH HAWKVEC STAGES">
      <form onSubmit={handleSubmit} className="space-y-6 font-mono text-xs">
        <div className="space-y-1">
          <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">PROJECT NAME *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="APEX EV LAUNCH COMMERCIAL"
            className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase placeholder-zinc-600 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">CLIENT ACCOUNT *</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase font-bold focus:outline-none"
          >
            {clients.length === 0 && <option value="">NO CLIENT ACCOUNTS AVAILABLE</option>}
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">STATUS</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase font-bold focus:outline-none"
            >
              <option value="planned">PLANNED</option>
              <option value="in_progress">IN PROGRESS</option>
              <option value="review">REVIEW</option>
              <option value="blocked">BLOCKED</option>
              <option value="completed">COMPLETED</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">PRIORITY</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as ProjectPriority)}
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase font-bold focus:outline-none"
            >
              <option value="low">LOW</option>
              <option value="medium">MEDIUM</option>
              <option value="high">HIGH</option>
              <option value="urgent">URGENT</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">HEALTH</label>
            <select
              value={health}
              onChange={(e) => setHealth(e.target.value as ProjectHealth)}
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase font-bold focus:outline-none"
            >
              <option value="on_track">ON TRACK 🟢</option>
              <option value="at_risk">AT RISK 🟡</option>
              <option value="critical">CRITICAL 🔴</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">START DATE</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
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

        <div className="space-y-1">
          <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">DESCRIPTION / SCOPE</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="30S BROADCAST COMMERCIAL & 6 SOCIAL CUTS..."
            className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase placeholder-zinc-600 focus:outline-none"
          />
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
            {submitting ? 'INITIALIZING PROJECT...' : 'CREATE PROJECT PIPELINE'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
