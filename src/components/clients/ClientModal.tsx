import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Client, ClientStatus, BillingModel, Profile } from '../../types/database.types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Partial<Client>) => Promise<void>;
  profiles: Profile[];
  initialClient?: Client | null;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  profiles,
  initialClient,
}) => {
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [industry, setIndustry] = useState('');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [relationshipOwnerId, setRelationshipOwnerId] = useState('');
  const [primaryContactName, setPrimaryContactName] = useState('');
  const [primaryContactEmail, setPrimaryContactEmail] = useState('');
  const [primaryContactPhone, setPrimaryContactPhone] = useState('');
  const [billingModel, setBillingModel] = useState<BillingModel>('retainer');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [contractValue, setContractValue] = useState<number | string>(120000);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialClient) {
      setName(initialClient.name || '');
      setLegalName(initialClient.legal_name || '');
      setIndustry(initialClient.industry || '');
      setStatus(initialClient.status || 'active');
      setRelationshipOwnerId(initialClient.relationship_owner_id || profiles[0]?.id || '');
      setPrimaryContactName(initialClient.primary_contact_name || '');
      setPrimaryContactEmail(initialClient.primary_contact_email || '');
      setPrimaryContactPhone(initialClient.primary_contact_phone || '');
      setBillingModel(initialClient.billing_model || 'retainer');
      setPaymentTerms(initialClient.payment_terms || 'Net 30');
      setContractValue(initialClient.contract_value ?? 120000);
      setNotes(initialClient.notes || '');
    } else {
      setName('');
      setLegalName('');
      setIndustry('');
      setStatus('active');
      setRelationshipOwnerId(profiles[0]?.id || '');
      setPrimaryContactName('');
      setPrimaryContactEmail('');
      setPrimaryContactPhone('');
      setBillingModel('retainer');
      setPaymentTerms('Net 30');
      setContractValue(120000);
      setNotes('');
    }
  }, [initialClient, isOpen, profiles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setSubmitting(true);
      await onSave({
        ...(initialClient ? { id: initialClient.id } : {}),
        name: name.trim(),
        legal_name: legalName.trim(),
        industry: industry.trim(),
        status,
        relationship_owner_id: relationshipOwnerId || undefined,
        primary_contact_name: primaryContactName.trim(),
        primary_contact_email: primaryContactEmail.trim(),
        primary_contact_phone: primaryContactPhone.trim(),
        billing_model: billingModel,
        payment_terms: paymentTerms.trim(),
        contract_value: Number(contractValue) || 0,
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      console.error('Error saving client:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = Boolean(initialClient);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? '01. EDIT CLIENT DOSSIER' : '01. ONBOARD CLIENT ACCOUNT'}
      subtitle={isEditing ? `UPDATE PARAMETERS FOR ${initialClient?.name.toUpperCase()}` : 'REGISTER A NEW BRAND OR ENTERPRISE CLIENT'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 font-mono text-xs">
        {/* Brand Name & Legal Entity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">BRAND NAME *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="AEROPULSE MOBILITY"
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase placeholder-zinc-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">LEGAL ENTITY NAME</label>
            <input
              type="text"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="AEROPULSE TECHNOLOGIES INC."
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase placeholder-zinc-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Industry & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">INDUSTRY / SECTOR</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="AUTOMOTIVE & EV"
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase placeholder-zinc-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">LIFECYCLE STATUS</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ClientStatus)}
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase font-bold focus:outline-none"
            >
              <option value="lead">LEAD</option>
              <option value="onboarding">ONBOARDING</option>
              <option value="active">ACTIVE</option>
              <option value="paused">PAUSED</option>
              <option value="churned">CHURNED</option>
            </select>
          </div>
        </div>

        {/* Billing Model, Payment Terms & Contract Value */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">BILLING MODEL</label>
            <select
              value={billingModel}
              onChange={(e) => setBillingModel(e.target.value as BillingModel)}
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase font-bold focus:outline-none"
            >
              <option value="retainer">RETAINER</option>
              <option value="fixed_fee">FIXED FEE</option>
              <option value="hourly">HOURLY</option>
              <option value="value_based">VALUE BASED</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">PAYMENT TERMS *</label>
            <input
              type="text"
              required
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="NET 30 / DUE ON RECEIPT"
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase placeholder-zinc-600 focus:outline-none font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">CONTRACT VALUE (₹)</label>
            <input
              type="number"
              value={contractValue}
              onChange={(e) => setContractValue(e.target.value)}
              placeholder="120000"
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#DFE104] font-bold uppercase placeholder-zinc-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Primary Contact Name, Email & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">PRIMARY CONTACT NAME</label>
            <input
              type="text"
              value={primaryContactName}
              onChange={(e) => setPrimaryContactName(e.target.value)}
              placeholder="SUMATHI CHANDER"
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase placeholder-zinc-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">CONTACT EMAIL</label>
            <input
              type="email"
              value={primaryContactEmail}
              onChange={(e) => setPrimaryContactEmail(e.target.value)}
              placeholder="SUMATHI@BRAND.COM"
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase placeholder-zinc-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">CONTACT PHONE</label>
            <input
              type="text"
              value={primaryContactPhone}
              onChange={(e) => setPrimaryContactPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase placeholder-zinc-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Relationship Owner */}
        <div className="space-y-1">
          <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">AGENCY RELATIONSHIP OWNER</label>
          <select
            value={relationshipOwnerId}
            onChange={(e) => setRelationshipOwnerId(e.target.value)}
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

        {/* Notes / Scope Summary */}
        <div className="space-y-1">
          <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">NOTES / ACCOUNT SCOPE</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="SPECIAL BILLING ARRANGEMENTS, BRAND GUIDELINES, OR SCOPE NOTES..."
            className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase placeholder-zinc-600 focus:outline-none"
          />
        </div>

        {/* Action Triggers */}
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
            {submitting ? (isEditing ? 'SAVING CHANGES...' : 'SAVING CLIENT...') : (isEditing ? 'UPDATE CLIENT DOSSIER' : 'SAVE CLIENT ACCOUNT')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
