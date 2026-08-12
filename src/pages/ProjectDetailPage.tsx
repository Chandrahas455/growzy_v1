import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Calendar, CheckSquare, AlertCircle, Clock, CheckCircle2, Receipt, ShieldAlert } from 'lucide-react';
import { Project, Task, Invoice, ProjectStatus, ProjectHealth } from '../types/database.types';
import { projectsService } from '../services/projects.service';
import { tasksService } from '../services/tasks.service';
import { financeService } from '../services/finance.service';
import { HawkVecStepper } from '../components/projects/HawkVecStepper';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { formatDate, formatCurrency } from '../lib/utils';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const loadProjectData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [pData, tData, iData] = await Promise.all([
        projectsService.getProjectById(id),
        tasksService.getTasks(id),
        financeService.getInvoices(),
      ]);
      setProject(pData);
      setTasks(tData);
      setInvoices(iData.filter((i) => i.project_id === id));
    } catch (err) {
      console.error('Error loading project details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const handleToggleMilestone = async (milestoneId: string) => {
    if (!project) return;
    try {
      const updated = await projectsService.toggleMilestone(project.id, milestoneId);
      setProject(updated);
    } catch (err) {
      console.error('Failed to toggle milestone:', err);
    }
  };

  const handleStatusShift = async (newStatus: ProjectStatus) => {
    if (!project) return;
    try {
      setProject({ ...project, status: newStatus });
      await projectsService.updateProject(project.id, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
      await loadProjectData();
    }
  };

  const handleHealthShift = async (newHealth: ProjectHealth) => {
    if (!project) return;
    try {
      setProject({ ...project, health: newHealth });
      await projectsService.updateProject(project.id, { health: newHealth });
    } catch (err) {
      console.error('Failed to update health:', err);
      await loadProjectData();
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    if (!window.confirm(`PERMANENTLY DELETE PROJECT "${project.name.toUpperCase()}"? THIS CANNOT BE UNDONE.`)) return;

    try {
      setDeleting(true);
      await projectsService.deleteProject(project.id);
      navigate('/projects');
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert('Failed to delete project.');
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

  if (!project) {
    return (
      <div className="p-12 text-center bg-[#09090B] border-2 border-[#3F3F46] space-y-4 font-mono">
        <p className="text-rose-400 font-bold uppercase text-sm">PROJECT PIPELINE RECORD NOT FOUND.</p>
        <button
          onClick={() => navigate('/projects')}
          className="px-6 py-3 bg-[#DFE104] text-black font-extrabold border-2 border-black uppercase text-xs tracking-wider"
        >
          RETURN TO PROJECTS
        </button>
      </div>
    );
  }

  const milestones = Array.isArray(project.milestones) ? project.milestones : [];
  const completedCount = milestones.filter((m) => m.completed).length;
  const progressPct = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between border-b-2 border-[#3F3F46] pb-4 font-mono">
        <Link
          to="/projects"
          className="px-4 py-2 bg-[#18181B] hover:bg-[#DFE104] hover:text-black border-2 border-[#3F3F46] font-bold text-xs uppercase flex items-center space-x-2 transition-colors text-[#FAFAFA]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO PROJECTS DIRECTORY</span>
        </Link>

        {/* Delete Action Button */}
        <button
          onClick={handleDeleteProject}
          disabled={deleting}
          className="px-4 py-2 bg-rose-950/80 hover:bg-rose-600 border-2 border-rose-600 text-rose-300 hover:text-white font-bold text-xs uppercase flex items-center space-x-2 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>{deleting ? 'DELETING PIPELINE...' : 'DELETE PROJECT PIPELINE'}</span>
        </button>
      </div>

      {/* Viewport Clamp Project Header */}
      <div className="bg-[#09090B] border-2 border-[#3F3F46] p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-[#3F3F46] pb-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#DFE104] bg-[#18181B] px-3 py-1 border border-[#3F3F46]">
              PROJECT DOSSIER /// {project.client ? project.client.name : 'GENERAL CLIENT'}
            </span>
            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black uppercase tracking-tighter leading-none font-display text-[#FAFAFA]">
              {project.name}
            </h1>
            <p className="text-xs font-mono text-[#A1A1AA] uppercase">
              {project.description || 'No project description provided.'}
            </p>
          </div>

          {/* Status & Health Inline Shifters */}
          <div className="font-mono space-y-3 bg-[#18181B] p-4 border-2 border-[#3F3F46]">
            <div className="flex items-center justify-between space-x-4">
              <span className="text-[10px] font-bold uppercase text-[#A1A1AA]">STATUS:</span>
              <select
                value={project.status}
                onChange={(e) => handleStatusShift(e.target.value as ProjectStatus)}
                className="bg-[#09090B] border-2 border-[#3F3F46] text-xs font-bold text-[#FAFAFA] uppercase px-3 py-1 focus:outline-none focus:border-[#DFE104]"
              >
                <option value="planned">PLANNED</option>
                <option value="in_progress">IN PROGRESS</option>
                <option value="review">REVIEW</option>
                <option value="blocked">BLOCKED</option>
                <option value="completed">COMPLETED</option>
              </select>
            </div>

            <div className="flex items-center justify-between space-x-4">
              <span className="text-[10px] font-bold uppercase text-[#A1A1AA]">HEALTH:</span>
              <select
                value={project.health}
                onChange={(e) => handleHealthShift(e.target.value as ProjectHealth)}
                className="bg-[#09090B] border-2 border-[#3F3F46] text-xs font-bold text-[#DFE104] uppercase px-3 py-1 focus:outline-none focus:border-[#DFE104]"
              >
                <option value="on_track">ON TRACK</option>
                <option value="at_risk">AT RISK</option>
                <option value="critical">CRITICAL</option>
              </select>
            </div>
          </div>
        </div>

        {/* Project Key Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="kinetic-card p-6 space-y-2">
            <span className="text-[#A1A1AA] font-bold uppercase">HAWKVEC PROGRESS</span>
            <div className="text-3xl font-black text-[#DFE104]">{progressPct}%</div>
            <div className="w-full bg-[#27272A] h-2 border border-[#3F3F46]">
              <div className="bg-[#DFE104] h-full" style={{ width: `${progressPct}%` }}></div>
            </div>
          </div>

          <div className="kinetic-card p-6 space-y-2">
            <span className="text-[#A1A1AA] font-bold uppercase">TIMELINE DATES</span>
            <div className="text-xs text-[#FAFAFA] space-y-1">
              <p>START: {formatDate(project.start_date)}</p>
              <p className="font-bold text-[#DFE104]">DUE: {formatDate(project.due_date)}</p>
            </div>
          </div>

          <div className="kinetic-card p-6 space-y-2">
            <span className="text-[#A1A1AA] font-bold uppercase">TEAM ASSIGNMENTS</span>
            <div className="text-xs text-[#FAFAFA] space-y-1">
              <p>OWNER: {project.owner ? project.owner.name.toUpperCase() : 'UNASSIGNED'}</p>
              <p>LEAD: {project.production_lead ? project.production_lead.name.toUpperCase() : 'UNASSIGNED'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* HawkVEC 6-Stage Milestone Stepper */}
      <HawkVecStepper milestones={milestones} onToggleMilestone={handleToggleMilestone} />

      {/* Tasks Table */}
      <div className="bg-[#09090B] border-2 border-[#3F3F46] p-8 space-y-6">
        <div className="flex items-center justify-between border-b-2 border-[#3F3F46] pb-4">
          <h2 className="text-2xl font-black uppercase tracking-tight font-display text-[#FAFAFA] flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-[#DFE104]" />
            <span>PROJECT TASKS ({tasks.length})</span>
          </h2>
          <Link
            to="/kanban"
            className="text-xs font-mono font-bold uppercase text-[#DFE104] hover:underline"
          >
            OPEN KANBAN BOARD ➔
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="p-8 text-center bg-[#18181B] border-2 border-[#3F3F46] text-xs font-mono text-[#A1A1AA] uppercase">
            NO TASKS CREATED FOR THIS PROJECT YET.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b-2 border-[#3F3F46] bg-[#18181B] text-[#A1A1AA] uppercase">
                  <th className="py-3.5 px-4 font-bold">TASK TITLE</th>
                  <th className="py-3.5 px-4 font-bold">ASSIGNEE</th>
                  <th className="py-3.5 px-4 font-bold">STATUS</th>
                  <th className="py-3.5 px-4 font-bold">PRIORITY</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#3F3F46]">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-[#18181B] transition-colors">
                    <td className="py-4 px-4 font-bold text-[#FAFAFA] uppercase">{t.title}</td>
                    <td className="py-4 px-4 text-[#A1A1AA] uppercase">{t.assignee ? t.assignee.name : 'UNASSIGNED'}</td>
                    <td className="py-4 px-4"><StatusBadge type="project" status={t.status} /></td>
                    <td className="py-4 px-4"><StatusBadge type="priority" status={t.priority} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
