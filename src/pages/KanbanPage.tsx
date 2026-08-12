import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Trello, Plus, AlertCircle, Calendar, User, Search, Filter, ShieldAlert, Trash2 } from 'lucide-react';
import { Task, TaskStatus, Project, Profile } from '../types/database.types';
import { tasksService } from '../services/tasks.service';
import { projectsService } from '../services/projects.service';
import { profilesService } from '../services/profiles.service';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { TaskModal } from '../components/kanban/TaskModal';
import { formatDate } from '../lib/utils';

const KANBAN_COLUMNS: { id: TaskStatus; title: string; label: string }[] = [
  { id: 'backlog', title: '01. BACKLOG', label: 'BACKLOG' },
  { id: 'todo', title: '02. TO DO', label: 'TO DO' },
  { id: 'in_progress', title: '03. IN PROGRESS', label: 'IN PROGRESS' },
  { id: 'review', title: '04. REVIEW & QA', label: 'REVIEW' },
  { id: 'done', title: '05. DONE & DELIVERED', label: 'DONE' },
];

export const KanbanPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColumnStatus, setSelectedColumnStatus] = useState<TaskStatus>('todo');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const [tData, pData, pfData] = await Promise.all([
        tasksService.getTasks(),
        projectsService.getProjects(),
        profilesService.getProfiles(),
      ]);
      setTasks(tData);
      setProjects(pData);
      setProfiles(pfData);
    } catch (err) {
      console.error('Failed to load Kanban tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as TaskStatus;

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
    );

    try {
      await tasksService.updateTaskStatus(draggableId, newStatus);
    } catch (err) {
      console.error('Failed to update task status in Supabase:', err);
      await loadData();
    }
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    await tasksService.createTask(taskData);
    await loadData();
  };

  const handleDeleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('PERMANENTLY DELETE THIS TASK?')) return;
    try {
      await tasksService.deleteTask(taskId);
      await loadData();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesProject = selectedProjectId === 'all' || t.project_id === selectedProjectId;
    return matchesSearch && matchesProject;
  });

  if (loading) {
    return (
      <div className="p-8 space-y-6 font-mono">
        <SkeletonLoader className="h-12 w-80 bg-[#18181B] rounded-none" />
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonLoader key={i} className="h-96 bg-[#18181B] rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Kinetic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#3F3F46] pb-8 gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#DFE104] bg-[#18181B] px-3 py-1 border border-[#3F3F46]">
            REALTIME TASK MATRIX /// {tasks.length} TOTAL TASKS
          </span>
          <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black uppercase tracking-tighter leading-none font-display text-[#FAFAFA] mt-3">
            EXECUTION KANBAN
          </h1>
        </div>

        <button
          onClick={() => {
            setSelectedColumnStatus('todo');
            setIsModalOpen(true);
          }}
          className="px-6 py-4 bg-[#DFE104] hover:bg-[#c7c902] active:scale-[0.98] text-black font-mono font-extrabold text-sm uppercase tracking-wider transition-all border-2 border-black flex items-center space-x-2 shadow-none"
        >
          <Plus className="w-5 h-5" />
          <span>+ CREATE NEW TASK</span>
        </button>
      </div>

      {/* Kinetic Filters */}
      <div className="flex flex-col sm:flex-row gap-4 font-mono text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="FILTER TASKS BY TITLE OR KEYWORD..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#18181B] border-2 border-[#3F3F46] pl-9 pr-4 py-2.5 text-xs text-[#FAFAFA] uppercase placeholder-zinc-500 focus:outline-none focus:border-[#DFE104]"
          />
        </div>

        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="bg-[#18181B] border-2 border-[#3F3F46] px-4 py-2.5 text-xs text-[#FAFAFA] uppercase font-bold focus:outline-none focus:border-[#DFE104]"
        >
          <option value="all">ALL PROJECTS</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Kinetic Kanban Drag-and-Drop Columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {KANBAN_COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className="bg-[#09090B] border-2 border-[#3F3F46] flex flex-col h-[700px] font-mono"
              >
                {/* Column Header */}
                <div className="p-4 border-b-2 border-[#3F3F46] bg-[#18181B] flex items-center justify-between">
                  <h3 className="font-extrabold text-xs text-[#FAFAFA] uppercase tracking-wider font-display">
                    {col.title}
                  </h3>
                  <span className="px-2 py-0.5 bg-[#DFE104] text-black font-extrabold text-[11px] border border-black">
                    {colTasks.length}
                  </span>
                </div>

                {/* Droppable Container */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-3 space-y-3 overflow-y-auto transition-colors ${
                        snapshot.isDraggingOver ? 'bg-[#18181B]/80' : ''
                      }`}
                    >
                      {colTasks.map((task, index) => {
                        const project = projects.find((p) => p.id === task.project_id);
                        const assignee = profiles.find((p) => p.id === task.assignee_id);

                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`kinetic-card p-4 space-y-3 border-2 transition-all group ${
                                  snapshot.isDragging ? 'rotate-1 scale-105 border-[#DFE104] bg-[#DFE104] text-black' : ''
                                } ${task.blocker ? 'border-rose-600 bg-rose-950/20' : 'border-[#3F3F46]'}`}
                              >
                                {/* Project Tag & Delete Action */}
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] truncate max-w-[120px]">
                                    {project ? project.name : 'GENERAL'}
                                  </span>
                                  <div className="flex items-center space-x-1.5">
                                    <StatusBadge type="priority" status={task.priority} />
                                    <button
                                      onClick={(e) => handleDeleteTask(task.id, e)}
                                      className="text-zinc-500 hover:text-rose-400 p-0.5 transition-colors"
                                      title="Delete Task"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Task Title */}
                                <h4 className="font-bold text-xs text-[#FAFAFA] uppercase tracking-tight line-clamp-2">
                                  {task.title}
                                </h4>

                                {/* Blocker Flag Indicator */}
                                {task.blocker && (
                                  <div className="p-2 bg-rose-950 border border-rose-600 text-rose-300 text-[10px] space-y-0.5">
                                    <div className="flex items-center space-x-1 font-bold">
                                      <ShieldAlert className="w-3 h-3 text-rose-400" />
                                      <span>BLOCKED</span>
                                    </div>
                                    <p className="line-clamp-2">{task.blocker_reason || 'Blocker reason pending.'}</p>
                                  </div>
                                )}

                                {/* Footing: Assignee & Due Date */}
                                <div className="flex items-center justify-between pt-2 border-t border-[#3F3F46] text-[10px] text-[#A1A1AA]">
                                  <span>{assignee ? assignee.name.toUpperCase() : 'UNASSIGNED'}</span>
                                  {task.due_date && (
                                    <span className="flex items-center space-x-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>{formatDate(task.due_date)}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Add Task Trigger Footing */}
                <div className="p-3 border-t-2 border-[#3F3F46] bg-[#18181B]">
                  <button
                    onClick={() => {
                      setSelectedColumnStatus(col.id);
                      setIsModalOpen(true);
                    }}
                    className="w-full py-2 bg-[#09090B] hover:bg-[#DFE104] hover:text-black border-2 border-[#3F3F46] text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ADD TASK</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateTask}
        projects={projects}
        profiles={profiles}
        defaultStatus={selectedColumnStatus}
      />
    </div>
  );
};
