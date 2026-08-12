import { supabase } from '../lib/supabase';
import { Project, HawkVecMilestone } from '../types/database.types';
import { calculateHawkVecProgress } from '../lib/utils';

export const DEFAULT_HAWKVEC_MILESTONES: HawkVecMilestone[] = [
  { id: 'm1', title: 'Brief Approved', completed: false, completed_at: null },
  { id: 'm2', title: 'Pre-production', completed: false, completed_at: null },
  { id: 'm3', title: 'Shoot / Creation', completed: false, completed_at: null },
  { id: 'm4', title: 'First Cut', completed: false, completed_at: null },
  { id: 'm5', title: 'Client Review', completed: false, completed_at: null },
  { id: 'm6', title: 'Final Delivery', completed: false, completed_at: null },
];

export const projectsService = {
  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:clients!client_id(*),
        owner:profiles!owner_id(*),
        production_lead:profiles!production_lead_id(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Project[]).map((p) => ({
      ...p,
      progress_percentage: calculateHawkVecProgress(p.milestones || []),
    }));
  },

  async getProjectById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:clients!client_id(*),
        owner:profiles!owner_id(*),
        production_lead:profiles!production_lead_id(*)
      `)
      .eq('id', id)
      .single();

    if (error) return null;
    const project = data as Project;
    return {
      ...project,
      progress_percentage: calculateHawkVecProgress(project.milestones || []),
    };
  },

  async createProject(projectData: Partial<Project>): Promise<Project> {
    const milestones = projectData.milestones || DEFAULT_HAWKVEC_MILESTONES;
    const { data, error } = await supabase
      .from('projects')
      .insert([{ ...projectData, milestones }])
      .select()
      .single();
    if (error) throw error;
    return data as Project;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Project;
  },

  async toggleMilestone(projectId: string, milestoneId: string): Promise<Project> {
    const project = await this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const updatedMilestones = (project.milestones || []).map((m) => {
      if (m.id === milestoneId) {
        const nextState = !m.completed;
        return {
          ...m,
          completed: nextState,
          completed_at: nextState ? new Date().toISOString() : null,
        };
      }
      return m;
    });

    return this.updateProject(projectId, { milestones: updatedMilestones });
  },

  async deleteProject(id: string): Promise<boolean> {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};
