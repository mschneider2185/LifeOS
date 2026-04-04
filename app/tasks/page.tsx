'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { GlassCard, StatusBadge, LoadingPulse, SectionHeader } from '@/components/lifeos';
import type { Task, TaskStatus, NotionListResponse, NotionCreateResponse } from '@/types/notion';

const STATUS_FLOW: TaskStatus[] = ['Not started', 'Doing', 'Paused', 'Done'];

function statusVariant(status: TaskStatus | null): 'cyan' | 'green' | 'orange' | 'purple' {
  switch (status) {
    case 'Doing': return 'cyan';
    case 'Done': return 'green';
    case 'Paused': return 'orange';
    default: return 'purple';
  }
}

function statusIcon(status: TaskStatus): string {
  switch (status) {
    case 'Not started': return '○';
    case 'Doing': return '◎';
    case 'Paused': return '⏸';
    case 'Done': return '✓';
  }
}

function nextStatus(current: TaskStatus | null): TaskStatus {
  const idx = STATUS_FLOW.indexOf(current ?? 'Not started');
  if (idx === -1 || idx >= STATUS_FLOW.length - 1) return 'Not started';
  return STATUS_FLOW[idx + 1];
}

function groupByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const groups: Record<TaskStatus, Task[]> = {
    'Doing': [],
    'Not started': [],
    'Paused': [],
    'Done': [],
  };
  for (const t of tasks) {
    const key = t.status ?? 'Not started';
    groups[key].push(t);
  }
  return groups;
}

function effortColor(effort: string): string {
  if (effort === 'Deep') return '#8b5cf6';
  if (effort === '60 min') return '#f59e0b';
  if (effort === '30 min') return '#00d4ff';
  return '#10b981';
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTask, setNewTask] = useState('');
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/notion/tasks');
      const json = (await res.json()) as NotionListResponse<Task>;
      if (json.error) setError(json.error);
      else setTasks(json.data);
    } catch {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleCreate = async () => {
    const text = newTask.trim();
    if (!text || creating) return;

    setCreating(true);
    setNewTask('');

    // Optimistic: add temp task at top
    const tempId = `temp-${Date.now()}`;
    const tempTask: Task = {
      id: tempId,
      task: text,
      status: 'Not started',
      dueDate: null,
      effort: [],
      timeBlock: [],
      type: [],
      projectIds: [],
    };
    setTasks((prev) => [tempTask, ...prev]);

    try {
      const res = await fetch('/api/notion/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: text }),
      });
      const json = (await res.json()) as NotionCreateResponse<Task>;

      if (json.success && json.data) {
        setTasks((prev) => prev.map((t) => (t.id === tempId ? json.data! : t)));
      } else {
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
      }
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
    } finally {
      setCreating(false);
      inputRef.current?.focus();
    }
  };

  const toggleStatus = async (task: Task) => {
    const next = nextStatus(task.status);

    // Optimistic
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: next } : t)));

    try {
      const res = await fetch(`/api/notion/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const json = (await res.json()) as NotionCreateResponse<Task>;
      if (!json.success) loadTasks();
    } catch {
      loadTasks();
    }
  };

  if (loading) return <LoadingPulse />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="max-w-sm text-center">
          <p className="text-danger text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-secondary text-sm mt-4">Retry</button>
        </GlassCard>
      </div>
    );
  }

  const groups = groupByStatus(tasks);
  const displayOrder: TaskStatus[] = ['Doing', 'Not started', 'Paused', 'Done'];

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Tasks</h1>
        <p className="text-sm text-lifeos-text-secondary mt-1">
          Click a task to advance its status. Type below to add new tasks.
        </p>
      </motion.div>

      {/* Quick-add input */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
        <GlassCard className="!p-3">
          <form
            onSubmit={(e) => { e.preventDefault(); handleCreate(); }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 text-sm bg-transparent text-white placeholder-lifeos-text-muted outline-none"
              disabled={creating}
            />
            <button
              type="submit"
              disabled={!newTask.trim() || creating}
              className="px-3 py-1 text-xs font-medium rounded-lg bg-lifeos-cyan text-lifeos-bg disabled:opacity-30 transition-opacity"
            >
              {creating ? '...' : 'Add'}
            </button>
          </form>
        </GlassCard>
      </motion.div>

      {/* Task groups */}
      {displayOrder.map((status) => {
        const items = groups[status];
        if (items.length === 0) return null;

        return (
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <SectionHeader
              icon={statusIcon(status)}
              title={status}
              subtitle={`${items.length} task${items.length !== 1 ? 's' : ''}`}
            />
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {items.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <GlassCard className="!p-3 cursor-pointer hover:!border-lifeos-cyan/20 transition-glass">
                      <div
                        className="flex items-center gap-3"
                        onClick={() => toggleStatus(task)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Toggle ${task.task} from ${task.status} to ${nextStatus(task.status)}`}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleStatus(task); }}
                      >
                        {/* Status circle */}
                        <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] transition-colors ${
                          task.status === 'Done'
                            ? 'bg-success/20 border-success text-success'
                            : task.status === 'Doing'
                            ? 'border-lifeos-cyan text-lifeos-cyan'
                            : task.status === 'Paused'
                            ? 'border-warning text-warning'
                            : 'border-lifeos-text-muted/40 text-transparent'
                        }`}>
                          {task.status === 'Done' ? '✓' : task.status === 'Doing' ? '›' : task.status === 'Paused' ? '⏸' : ''}
                        </span>

                        {/* Task name */}
                        <span className={`flex-1 text-sm ${
                          task.status === 'Done'
                            ? 'line-through text-lifeos-text-muted'
                            : 'text-white'
                        }`}>
                          {task.task}
                        </span>

                        {/* Tags */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {task.effort.map((e) => (
                            <span
                              key={e}
                              className="text-[10px] px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: effortColor(e) + '20', color: effortColor(e) }}
                            >
                              {e}
                            </span>
                          ))}
                          {task.timeBlock.map((tb) => (
                            <span key={tb} className="text-[10px] text-lifeos-text-muted">{tb}</span>
                          ))}
                          <StatusBadge label={task.status ?? 'Not started'} variant={statusVariant(task.status)} />
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}

      {tasks.length === 0 && (
        <GlassCard className="text-center py-12">
          <p className="text-lifeos-text-secondary text-sm">No tasks yet. Add your first one above.</p>
        </GlassCard>
      )}
    </main>
  );
}
