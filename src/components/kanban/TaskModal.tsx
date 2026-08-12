import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Task, TaskStatus, TaskPriority, Project, Profile } from '../../types/database.types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  projects: Project[];
  profiles: Profile[];
  initialStatus?: TaskStatus;
  defaultStatus?: TaskStatus;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projects,
  profiles,
  initialStatus,
  defaultStatus = 'todo',
}) => {
  const effectiveInitialStatus = initialStatus || defaultStatus;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [assigneeId, setAssigneeId] = useState(profiles[0]?.id || '');
  const [status, setStatus] = useState<TaskStatus>(effectiveInitialStatus);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [blocker, setBlocker] = useState(false);
  const [blockerReason, setBlockerReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setSubmitting(true);
      await onSave({
        title,
        description,
        project_id: projectId || projects[0]?.id,
        assignee_id: assigneeId || undefined,
        status,
        priority,
        due_date: dueDate,
        blocker,
        blocker_reason: blocker ? blockerReason : '',
      });
      onClose();
    } catch (err) {
      console.error('Error creating task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="04. CREATE EXECUTION TASK" subtitle="ASSIGN DELIVERABLE WORK ITEM TO PROJECT">
      <form onSubmit={handleSubmit} className="space-y-6 font-mono text-xs">
        <div className="space-y-1">
          <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">TASK TITLE *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="COLOR GRADING FOR 30S CUT"
            className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase placeholder-zinc-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">PROJECT PIPELINE *</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase font-bold focus:outline-none"
            >
              {projects.length === 0 && <option value="">NO PROJECTS AVAILABLE</option>}
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">ASSIGNEE / TEAM LEAD</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
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
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">COLUMN STATUS</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase font-bold focus:outline-none"
            >
              <option value="backlog">BACKLOG</option>
              <option value="todo">TO DO</option>
              <option value="in_progress">IN PROGRESS</option>
              <option value="review">REVIEW</option>
              <option value="done">DONE</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[#A1A1AA] font-bold uppercase tracking-wider">PRIORITY LEVEL</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] p-3 text-xs text-[#FAFAFA] uppercase font-bold focus:outline-none"
            >
              <option value="low">LOW</option>
              <option value="medium">MEDIUM</option>
              <option value="high">HIGH</option>
              <option value="urgent">URGENT</option>
            </select>
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

        {/* Blocker Flag Toggle */}
        <div className="p-4 bg-[#18181B] border-2 border-[#3F3F46] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs uppercase text-rose-400">FLAG AS EXECUTION BLOCKER?</span>
            <input
              type="checkbox"
              checked={blocker}
              onChange={(e) => setBlocker(e.target.checked)}
              className="w-4 h-4 accent-[#DFE104] cursor-pointer"
            />
          </div>
          {blocker && (
            <input
              type="text"
              required={blocker}
              value={blockerReason}
              onChange={(e) => setBlockerReason(e.target.value)}
              placeholder="REASON FOR BLOCKER (E.G. AWAITING CMO SIGN-OFF)"
              className="w-full bg-[#09090B] border-b-2 border-rose-600 p-2 text-xs text-rose-300 uppercase placeholder-rose-700 focus:outline-none"
            />
          )}
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
            {submitting ? 'DISPATCHING TASK...' : 'CREATE KANBAN TASK'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
