import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, FolderKanban, ExternalLink, Trash2 } from 'lucide-react';
import { Project, ProjectStatus, ProjectHealth, Client, Profile } from '../types/database.types';
import { projectsService } from '../services/projects.service';
import { clientsService } from '../services/clients.service';
import { profilesService } from '../services/profiles.service';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { ProjectModal } from '../components/projects/ProjectModal';
import { formatDate } from '../lib/utils';
import { hasCapability } from '../lib/capabilities';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentProfile } = useOutletContext<{ currentProfile: Profile | null }>();

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterHealth, setFilterHealth] = useState<string>('all');

  const canManageProjects = hasCapability(currentProfile, 'manage_projects');

  const loadData = async () => {
    try {
      setLoading(true);
      const [prData, clData, pfData] = await Promise.all([
        projectsService.getProjects(),
        clientsService.getClients(),
        profilesService.getProfiles(),
      ]);
      setProjects(prData);
      setClients(clData);
      setProfiles(pfData);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProject = async (projectData: Partial<Project>) => {
    await projectsService.createProject(projectData);
    await loadData();
  };

  const handleStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      await projectsService.updateProject(projectId, { status: newStatus });
      await loadData();
    } catch (err) {
      console.error('Failed to update project status:', err);
    }
  };

  const handleHealthChange = async (projectId: string, newHealth: ProjectHealth) => {
    try {
      await projectsService.updateProject(projectId, { health: newHealth });
      await loadData();
    } catch (err) {
      console.error('Failed to update project health:', err);
    }
  };

  const handleDeleteProject = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`PERMANENTLY DELETE PROJECT "${project.name.toUpperCase()}"? THIS CANNOT BE UNDONE.`)) return;
    try {
      await projectsService.deleteProject(project.id);
      await loadData();
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (filterHealth === 'all') return true;
    return p.health === filterHealth;
  });

  const columns: Column<Project>[] = [
    {
      key: 'name',
      header: 'PROJECT TITLE',
      sortable: true,
      render: (project) => (
        <div className="font-mono">
          <span
            onClick={() => navigate(`/projects/${project.id}`)}
            className="font-bold text-[#FAFAFA] text-sm uppercase block hover:text-[#DFE104] cursor-pointer transition-colors"
          >
            {project.name}
          </span>
          <span className="text-[11px] text-[#A1A1AA] uppercase line-clamp-1">
            {project.description || 'No project description.'}
          </span>
        </div>
      ),
    },
    {
      key: 'client_id',
      header: 'CLIENT ACCOUNT',
      render: (project) => {
        const client = clients.find((c) => c.id === project.client_id);
        return (
          <span className="font-mono text-xs text-[#FAFAFA] font-bold uppercase">
            {client ? client.name : 'Unknown Client'}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'STATUS & SHIFT',
      render: (project) => (
        <div className="flex items-center space-x-2">
          <StatusBadge type="project" status={project.status} />
          {canManageProjects && (
            <select
              value={project.status}
              onChange={(e) => handleStatusChange(project.id, e.target.value as ProjectStatus)}
              className="bg-[#18181B] border-2 border-[#3F3F46] text-[10px] font-mono font-bold text-[#FAFAFA] uppercase px-2 py-1 focus:outline-none focus:border-[#DFE104]"
            >
              <option value="planned">PLANNED</option>
              <option value="in_progress">IN PROGRESS</option>
              <option value="review">REVIEW</option>
              <option value="blocked">BLOCKED</option>
              <option value="completed">COMPLETED</option>
            </select>
          )}
        </div>
      ),
    },
    {
      key: 'health',
      header: 'DELIVERY HEALTH',
      sortable: true,
      render: (project) => (
        <div className="flex items-center space-x-2">
          <StatusBadge type="health" status={project.health} />
          {canManageProjects && (
            <select
              value={project.health}
              onChange={(e) => handleHealthChange(project.id, e.target.value as ProjectHealth)}
              className="bg-[#18181B] border-2 border-[#3F3F46] text-[10px] font-mono font-bold text-[#DFE104] uppercase px-2 py-1 focus:outline-none focus:border-[#DFE104]"
            >
              <option value="on_track">ON TRACK</option>
              <option value="at_risk">AT RISK</option>
              <option value="critical">CRITICAL</option>
            </select>
          )}
        </div>
      ),
    },
    {
      key: 'milestones',
      header: 'HAWKVEC PROGRESS',
      render: (project) => {
        const mList = Array.isArray(project.milestones) ? project.milestones : [];
        const compCount = mList.filter((m) => m.completed).length;
        const pct = mList.length > 0 ? Math.round((compCount / mList.length) * 100) : 0;

        return (
          <div className="flex items-center space-x-3 font-mono">
            <div className="w-24 bg-[#27272A] h-2 border border-[#3F3F46]">
              <div className="bg-[#DFE104] h-full" style={{ width: `${pct}%` }}></div>
            </div>
            <span className="font-bold text-xs text-[#FAFAFA]">{pct}%</span>
          </div>
        );
      },
    },
    {
      key: 'id',
      header: 'ACTIONS',
      align: 'right',
      render: (project) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => navigate(`/projects/${project.id}`)}
            className="px-3 py-1 bg-[#18181B] hover:bg-[#DFE104] hover:text-black border-2 border-[#3F3F46] font-mono text-xs font-bold uppercase transition-colors"
          >
            INSPECT PIPELINE
          </button>
          {canManageProjects && (
            <button
              onClick={(e) => handleDeleteProject(project, e)}
              className="p-1.5 bg-rose-950/80 hover:bg-rose-600 border-2 border-rose-600 text-rose-300 hover:text-white transition-colors"
              title="Delete Project Pipeline"
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
        <SkeletonLoader className="h-64 w-full bg-[#18181B] rounded-none" />
      </div>
    );
  }

  const healthOptions = ['all', 'on_track', 'at_risk', 'critical'];

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Kinetic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#3F3F46] pb-8 gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#DFE104] bg-[#18181B] px-3 py-1 border border-[#3F3F46]">
            HAWKVEC ENGINE /// {projects.length} PROJECTS ACTIVE
          </span>
          <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black uppercase tracking-tighter leading-none font-display text-[#FAFAFA] mt-3">
            PROJECTS & PIPELINES
          </h1>
        </div>

        {canManageProjects && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-4 bg-[#DFE104] hover:bg-[#c7c902] active:scale-[0.98] text-black font-mono font-extrabold text-sm uppercase tracking-wider transition-all border-2 border-black flex items-center space-x-2 shadow-none"
          >
            <Plus className="w-5 h-5" />
            <span>+ NEW PROJECT</span>
          </button>
        )}
      </div>

      {/* Kinetic Health Filters */}
      <div className="flex flex-wrap gap-2 font-mono text-xs font-bold uppercase border-b-2 border-[#3F3F46] pb-4">
        {healthOptions.map((h) => (
          <button
            key={h}
            onClick={() => setFilterHealth(h)}
            className={`px-4 py-2 border-2 transition-all ${
              filterHealth === h
                ? 'bg-[#DFE104] text-black border-black font-extrabold'
                : 'bg-[#18181B] text-[#FAFAFA] border-[#3F3F46] hover:border-[#DFE104] hover:text-[#DFE104]'
            }`}
          >
            {h === 'all' ? 'ALL HEALTH STATES' : h.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Main Kinetic Data Table */}
      <div className="bg-[#09090B] border-2 border-[#3F3F46]">
        <DataTable data={filteredProjects} columns={columns} searchPlaceholder="FILTER PROJECTS BY NAME OR DESCRIPTION..." />
      </div>

      {/* Create Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
        clients={clients}
        profiles={profiles}
      />
    </div>
  );
};
