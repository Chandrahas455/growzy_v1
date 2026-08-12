import { supabase } from '../lib/supabase';
import { ActivityLog } from '../types/database.types';

export const activityService = {
  async getActivityLogs(): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        user:profiles!user_id(*)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data as ActivityLog[];
  },

  async logActivity(action: string, entityType: string, entityId?: string, details?: Record<string, any>): Promise<void> {
    const { error } = await supabase.from('activity_logs').insert([
      {
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
      },
    ]);
    if (error) console.error('Failed to write activity log:', error);
  }
};
