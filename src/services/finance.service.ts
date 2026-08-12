import { supabase } from '../lib/supabase';
import { Invoice } from '../types/database.types';

export interface FinancialMetrics {
  totalInvoiced: number;
  totalCollected: number;
  totalOutstanding: number;
  totalOverdue: number;
}

export const financeService = {
  async getInvoices(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients!client_id(*),
        project:projects!project_id(*),
        follow_up_owner:profiles!follow_up_owner_id(*)
      `)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data as Invoice[];
  },

  async createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {
    const nextInvoiceNum = `INV-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    const payload = {
      ...invoiceData,
      invoice_number: invoiceData.invoice_number || nextInvoiceNum,
    };
    const { data, error } = await supabase
      .from('invoices')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data as Invoice;
  },

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Invoice;
  },

  async updateInvoiceStatus(id: string, status: any): Promise<Invoice> {
    return this.updateInvoice(id, { status });
  },

  async calculateFinancialMetrics(): Promise<FinancialMetrics> {
    const invoices = await this.getInvoices();
    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let totalOverdue = 0;

    invoices.forEach((inv) => {
      const grossAmount = inv.amount + inv.tax;
      if (inv.status !== 'cancelled') {
        totalInvoiced += grossAmount;
        totalCollected += inv.paid_amount || 0;

        const remaining = grossAmount - (inv.paid_amount || 0);
        if (remaining > 0) {
          totalOutstanding += remaining;
          if (inv.status === 'overdue' || new Date(inv.due_date) < new Date()) {
            totalOverdue += remaining;
          }
        }
      }
    });

    return {
      totalInvoiced,
      totalCollected,
      totalOutstanding,
      totalOverdue,
    };
  },

  async deleteInvoice(id: string): Promise<boolean> {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};
