import { supabase } from '../lib/supabase';
import { Client } from '../types/database.types';

export const clientsService = {
  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        relationship_owner:profiles!relationship_owner_id(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Client[];
  },

  async getClientById(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        relationship_owner:profiles!relationship_owner_id(*)
      `)
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Client;
  },

  async createClient(clientData: Partial<Client>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single();
    if (error) throw error;
    return data as Client;
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Client;
  },

  async deleteClient(id: string): Promise<boolean> {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};
