import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Users,
  FolderKanban,
  AlertTriangle,
  DollarSign,
  CheckSquare,
  RefreshCw,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
} from 'lucide-react';
import Marquee from 'react-fast-marquee';
import { Profile, Client, Project, Task, Invoice, ActivityLog } from '../types/database.types';
import { clientsService } from '../services/clients.service';
import { projectsService } from '../services/projects.service';
import { tasksService } from '../services/tasks.service';
import { financeService, FinancialMetrics } from '../services/finance.service';
import { activityService } from '../services/activity.service';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { formatCurrency, formatDate } from '../lib/utils';

export const DashboardPage: React.FC = () => {
  const { currentProfile } = useOutletContext<{ currentProfile: Profile | null }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalInvoiced: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    totalOverdue: 0,
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);
        const [cl, pr, tk, inv, met, logs] = await Promise.all([
          clientsService.getClients().catch(() => []),
          projectsService.getProjects().catch(() => []),
          tasksService.getTasks().catch(() => []),
          financeService.getInvoices().catch(() => []),
          financeService.calculateFinancialMetrics().catch(() => ({
            totalInvoiced: 0,
            totalCollected: 0,
            totalOutstanding: 0,
            totalOverdue: 0,
          })),
          activityService.getActivityLogs().catch(() => []),
        ]);

        setClients(cl);
        setProjects(pr);
        setTasks(tk);
        setInvoices(inv);
        setMetrics(met);
        setActivityLogs(logs);
      } catch (err: any) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load operational metrics from Supabase.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const activeRetainerSum = clients
    .filter((c) => c.status === 'active' && c.billing_model === 'retainer')
    .reduce((sum, c) => sum + (Number(c.contract_value) || 0), 0);

  const projectsAtRiskCount = projects.filter(
    (p) => p.health === 'at_risk' || p.health === 'critical'
  ).length;

  const activeProjects = projects.filter((p) => p.status !== 'completed');

  const totalMilestonesCount = projects.reduce(
    (sum, p) => sum + (Array.isArray(p.milestones) ? p.milestones.length : 0),
    0
  );
  const completedMilestonesCount = projects.reduce(
    (sum, p) =>
      sum +
      (Array.isArray(p.milestones) ? p.milestones.filter((m) => m.completed).length : 0),
    0
  );
  const overallMilestoneProgress =
    totalMilestonesCount > 0 ? Math.round((completedMilestonesCount / totalMilestonesCount) * 100) : 0;

  const blockedTasks = tasks.filter((t) => t.blocker);

  if (loading) {
    return (
      <div className="p-8 space-y-8 font-mono">
        <div className="space-y-2">
          <SkeletonLoader className="h-12 w-96 bg-[#18181B] rounded-none" />
          <SkeletonLoader className="h-4 w-64 bg-[#18181B] rounded-none" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SkeletonLoader className="h-40 bg-[#18181B] rounded-none" />
          <SkeletonLoader className="h-40 bg-[#18181B] rounded-none" />
          <SkeletonLoader className="h-40 bg-[#18181B] rounded-none" />
          <SkeletonLoader className="h-40 bg-[#18181B] rounded-none" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-16 font-sans">
      {/* Viewport-scaled Kinetic Hero Headline */}
      <div className="space-y-4 border-b-2 border-[#3F3F46] pb-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#DFE104] bg-[#18181B] px-3 py-1 border border-[#3F3F46]">
              FOUNDER COMMAND MATRIX /// LIVE SUPABASE DB
            </span>
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black uppercase tracking-tighter leading-none font-display text-[#FAFAFA] mt-3">
              EXECUTIVE DASHBOARD
            </h1>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="hidden md:flex items-center space-x-2 px-4 py-2 bg-[#18181B] hover:bg-[#DFE104] hover:text-black text-[#FAFAFA] border-2 border-[#3F3F46] font-mono text-xs font-bold uppercase transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>SYNC REALTIME</span>
          </button>
        </div>
      </div>

      {/* Infinite Ticker Marquee */}
      <div className="bg-[#18181B] border-2 border-[#3F3F46] py-3 text-xs font-mono font-bold tracking-widest text-[#FAFAFA]">
        <Marquee speed={65} gradient={false}>
          <span className="mx-6 text-[#DFE104] uppercase">⚡ ACTIVE RETAINERS: {formatCurrency(activeRetainerSum)}</span>
          <span className="mx-6 uppercase">★ LIVE PROJECTS: {projects.length}</span>
          <span className="mx-6 text-rose-400 uppercase">🚨 OVERDUE REVENUE: {formatCurrency(metrics.totalOverdue)}</span>
          <span className="mx-6 uppercase">★ DELIVERY HEALTH SCORE: {overallMilestoneProgress}%</span>
          <span className="mx-6 text-[#DFE104] uppercase">⚡ BLOCKED TASKS: {blockedTasks.length}</span>
        </Marquee>
      </div>

      {/* Kinetic Massive Numerical Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Active Retainers */}
        <div className="kinetic-card p-8 relative overflow-hidden group">
          <div className="text-[7rem] font-black font-mono leading-none absolute -right-4 -bottom-6 text-[#27272A] opacity-30 select-none group-hover:text-black group-hover:opacity-20 transition-colors">
            01
          </div>
          <div className="relative z-10 space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#A1A1AA]">
              MONTHLY RETAINER REVENUE
            </span>
            <div className="text-4xl font-black font-mono tracking-tight text-[#FAFAFA]">
              {formatCurrency(activeRetainerSum)}
            </div>
            <p className="text-xs font-mono text-[#A1A1AA]">
              Across {clients.filter((c) => c.status === 'active' && c.billing_model === 'retainer').length} active retainer client accounts.
            </p>
          </div>
        </div>

        {/* Card 2: Projects at Risk */}
        <div className="kinetic-card p-8 relative overflow-hidden group">
          <div className="text-[7rem] font-black font-mono leading-none absolute -right-4 -bottom-6 text-[#27272A] opacity-30 select-none group-hover:text-black group-hover:opacity-20 transition-colors">
            02
          </div>
          <div className="relative z-10 space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
              PROJECTS AT RISK / CRITICAL
            </span>
            <div className="text-4xl font-black font-mono tracking-tight text-amber-400">
              {projectsAtRiskCount} <span className="text-xl text-[#A1A1AA] font-normal">/ {projects.length}</span>
            </div>
            <p className="text-xs font-mono text-[#A1A1AA]">
              Requires immediate founder intervention or milestone push.
            </p>
          </div>
        </div>

        {/* Card 3: Overdue Revenue */}
        <div className="kinetic-card p-8 relative overflow-hidden group">
          <div className="text-[7rem] font-black font-mono leading-none absolute -right-4 -bottom-6 text-[#27272A] opacity-30 select-none group-hover:text-black group-hover:opacity-20 transition-colors">
            03
          </div>
          <div className="relative z-10 space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-400">
              OVERDUE INVOICE CASH
            </span>
            <div className="text-4xl font-black font-mono tracking-tight text-rose-400">
              {formatCurrency(metrics.totalOverdue)}
            </div>
            <p className="text-xs font-mono text-[#A1A1AA]">
              Outstanding balance past client Net 30 terms.
            </p>
          </div>
        </div>

        {/* Card 4: Overall Progress */}
        <div className="kinetic-card p-8 relative overflow-hidden group">
          <div className="text-[7rem] font-black font-mono leading-none absolute -right-4 -bottom-6 text-[#27272A] opacity-30 select-none group-hover:text-black group-hover:opacity-20 transition-colors">
            04
          </div>
          <div className="relative z-10 space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#DFE104]">
              HAWKVEC DELIVERY ENGINE
            </span>
            <div className="text-4xl font-black font-mono tracking-tight text-[#DFE104]">
              {overallMilestoneProgress}%
            </div>
            <div className="w-full bg-[#27272A] h-2 border border-[#3F3F46]">
              <div
                className="bg-[#DFE104] h-full transition-all duration-500"
                style={{ width: `${overallMilestoneProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Delivery Matrix & Blocker Triage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Delivery Health Matrix (2 cols) */}
        <div className="lg:col-span-2 bg-[#09090B] border-2 border-[#3F3F46] p-8 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-[#3F3F46] pb-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight font-display text-[#FAFAFA]">
                DELIVERY HEALTH MATRIX
              </h2>
              <p className="text-xs font-mono text-[#A1A1AA] uppercase">
                ACTIVE CREATIVE & PRODUCTION PROJECTS ({activeProjects.length})
              </p>
            </div>
            <Link
              to="/projects"
              className="text-xs font-mono font-bold uppercase text-[#DFE104] hover:underline flex items-center gap-1"
            >
              <span>VIEW ALL</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b-2 border-[#3F3F46] bg-[#18181B] text-[#A1A1AA] uppercase">
                  <th className="py-3 px-4 font-bold">PROJECT NAME</th>
                  <th className="py-3 px-4 font-bold">CLIENT</th>
                  <th className="py-3 px-4 font-bold">HEALTH</th>
                  <th className="py-3 px-4 font-bold">HAWKVEC PROGRESS</th>
                  <th className="py-3 px-4 font-bold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#3F3F46]">
                {activeProjects.slice(0, 5).map((project) => {
                  const client = clients.find((c) => c.id === project.client_id);
                  const mList = Array.isArray(project.milestones) ? project.milestones : [];
                  const compCount = mList.filter((m) => m.completed).length;
                  const pct = mList.length > 0 ? Math.round((compCount / mList.length) * 100) : 0;

                  return (
                    <tr key={project.id} className="hover:bg-[#18181B] transition-colors">
                      <td className="py-4 px-4 font-bold text-[#FAFAFA] uppercase">
                        {project.name}
                      </td>
                      <td className="py-4 px-4 text-[#A1A1AA] uppercase">
                        {client ? client.name : 'Unknown Client'}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge type="health" status={project.health} />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-[#27272A] h-2 border border-[#3F3F46]">
                            <div
                              className="bg-[#DFE104] h-full"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-[#FAFAFA]">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          to={`/projects/${project.id}`}
                          className="px-3 py-1 bg-[#18181B] hover:bg-[#DFE104] hover:text-black border-2 border-[#3F3F46] font-bold uppercase text-[11px] inline-block transition-colors"
                        >
                          OPEN
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Blocker Flag Triage Queue (1 col) */}
        <div className="bg-[#09090B] border-2 border-[#3F3F46] p-8 space-y-6">
          <div className="border-b-2 border-[#3F3F46] pb-4">
            <h2 className="text-2xl font-black uppercase tracking-tight font-display text-rose-400 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <span>BLOCKER TRIAGE</span>
            </h2>
            <p className="text-xs font-mono text-[#A1A1AA] uppercase">
              ACTIVE EXECUTION BLOCKERS ({blockedTasks.length})
            </p>
          </div>

          <div className="space-y-4">
            {blockedTasks.length === 0 ? (
              <div className="p-6 bg-[#18181B] border-2 border-[#3F3F46] text-center text-xs font-mono text-[#A1A1AA] uppercase">
                ✓ ALL EXECUTION PIPELINES CLEAR. ZERO BLOCKERS FLAGGED.
              </div>
            ) : (
              blockedTasks.map((task) => (
                <div key={task.id} className="p-4 bg-[#18181B] border-2 border-rose-600 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-300 uppercase truncate max-w-[200px]">
                      {task.title}
                    </span>
                    <span className="px-2 py-0.5 bg-rose-950 border border-rose-500 text-rose-300 text-[10px] font-bold uppercase">
                      BLOCKED
                    </span>
                  </div>
                  <p className="text-[11px] text-[#FAFAFA]">
                    <span className="text-rose-400 font-bold">REASON:</span> {task.blocker_reason || 'No detailed reason provided.'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Live Activity Stream Footing */}
      <div className="bg-[#09090B] border-2 border-[#3F3F46] p-8 space-y-6">
        <div className="flex items-center justify-between border-b-2 border-[#3F3F46] pb-4">
          <h2 className="text-2xl font-black uppercase tracking-tight font-display text-[#FAFAFA] flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#DFE104]" />
            <span>REAL-TIME AUDIT STREAM</span>
          </h2>
          <span className="text-xs font-mono text-[#A1A1AA] uppercase">
            SUPABASE AUDIT LOGS ({activityLogs.length})
          </span>
        </div>

        <div className="divide-y-2 divide-[#3F3F46] font-mono text-xs">
          {activityLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="py-3 flex items-center justify-between hover:bg-[#18181B] px-2 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-[#DFE104]"></span>
                <span className="font-bold text-[#FAFAFA] uppercase">{log.action.replace('_', ' ')}</span>
                <span className="text-[#A1A1AA] uppercase">[{log.entity_type}]</span>
              </div>
              <span className="text-[11px] text-[#A1A1AA]">{formatDate(log.created_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
