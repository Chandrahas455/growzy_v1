import { supabase } from '../lib/supabase';
import { Profile } from '../types/database.types';

export const profilesService = {
  async getProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');
    if (error) throw error;
    return data as Profile[];
  },

  async getProfileById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as Profile;
  },

  async updateProfileCapabilities(id: string, capabilities: Profile['capabilities']): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ capabilities })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  }
};
