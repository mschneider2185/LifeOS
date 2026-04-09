'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { AuthGuard, GlassCard, WipGauge, StatusBadge, LoadingPulse, SectionHeader } from '@/components/lifeos';
import type { Project, ProjectStatus, ProjectEnergyLevel, NotionListResponse, NotionCreateResponse } from '@/types/notion';

const WIP_LIMIT = 4;
const STATUS_OPTIONS: ProjectStatus[] = ['Active', 'Maintenance', 'Parked'];
const ENERGY_OPTIONS: ProjectEnergyLevel[] = ['Low', 'Medium', 'Deep'];
const TIER_OPTIONS = [1, 2, 3] as const;

const stagger = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35 },
  }),
};

function statusVariant(status: ProjectStatus | string): 'cyan' | 'green' | 'orange' {
  if (status === 'Active') return 'cyan';
  if (status === 'Maintenance') return 'green';
  return 'orange';
}

function energyColor(level: string): string {
  if (level === 'Deep') return '#8b5cf6';
  if (level === 'Medium') return '#f59e0b';
  return '#10b981';
}

function groupByStatus(projects: Project[]): Record<string, Project[]> {
  const groups: Record<string, Project[]> = { Active: [], Maintenance: [], Parked: [] };
  for (const p of projects) {
    const key = p.status === 'Active' ? 'Active' : p.status === 'Maintenance' ? 'Maintenance' : 'Parked';
    groups[key].push(p);
  }
  return groups;
}

// ---- Inline-editable next action ----

function EditableNextAction({
  value,
  onSave,
}: {
  value: string;
  onSave: (val: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== value) onSave(trimmed);
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-lifeos-text-secondary hover:text-lifeos-cyan truncate text-left w-full transition-colors"
        title="Click to edit next action"
      >
        {value ? `Next: ${value}` : '+ Add next action'}
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') { setDraft(value); setEditing(false); }
      }}
      className="text-xs w-full bg-white/5 border border-lifeos-border-cyan rounded px-2 py-1 text-white outline-none focus:border-lifeos-cyan"
      placeholder="Next action..."
    />
  );
}

// ---- Status dropdown ----

function StatusDropdown({
  current,
  onSelect,
}: {
  current: ProjectStatus | string;
  onSelect: (status: ProjectStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // When open, lift the entire card above siblings via a parent style
  useEffect(() => {
    if (!ref.current) return;
    const card = ref.current.closest('.project-card-wrapper') as HTMLElement | null;
    if (card) card.style.zIndex = open ? '50' : '';
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="group flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border cursor-pointer transition-all duration-150 hover:brightness-125 hover:shadow-[0_0_8px_rgba(255,255,255,0.06)]"
        style={{
          background: statusVariant(current) === 'cyan' ? 'rgba(0,212,255,0.15)' :
                       statusVariant(current) === 'green' ? 'rgba(16,185,129,0.15)' :
                       'rgba(245,158,11,0.15)',
          color: statusVariant(current) === 'cyan' ? '#00d4ff' :
                 statusVariant(current) === 'green' ? '#10b981' :
                 '#f59e0b',
          borderColor: statusVariant(current) === 'cyan' ? 'rgba(0,212,255,0.3)' :
                       statusVariant(current) === 'green' ? 'rgba(16,185,129,0.3)' :
                       'rgba(245,158,11,0.3)',
        }}
        aria-label={`Change status from ${current}`}
      >
        {current}
        <span className={`text-[9px] opacity-60 group-hover:opacity-100 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 z-50 glass-card !p-1 min-w-[120px] !bg-[rgba(15,15,25,0.92)]"
          >
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { onSelect(s); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  s === current
                    ? 'text-lifeos-cyan bg-lifeos-cyan-dim'
                    : 'text-lifeos-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Save indicator ----

function SaveIndicator({ saving, saved }: { saving: boolean; saved: boolean }) {
  return (
    <AnimatePresence>
      {(saving || saved) && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`text-[10px] font-medium ${saving ? 'text-lifeos-text-muted' : 'text-lifeos-green'}`}
        >
          {saving ? 'Saving...' : '✓'}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

// ---- New project form ----

function NewProjectForm({
  activeCount,
  wipLimit,
  creating,
  error,
  onSubmit,
  onCancel,
}: {
  activeCount: number;
  wipLimit: number;
  creating: boolean;
  error: string | null;
  onSubmit: (data: {
    projectName: string;
    status: string;
    tier: number;
    weeklyTimeCap: number;
    energyLevel: string;
    nextAction: string;
  }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Active');
  const [tier, setTier] = useState<number>(2);
  const [timeCap, setTimeCap] = useState<number>(4);
  const [energy, setEnergy] = useState<ProjectEnergyLevel>('Medium');
  const [nextAction, setNextAction] = useState('');

  const atWipLimit = activeCount >= wipLimit;

  return (
    <GlassCard>
      <div className="space-y-3">
        <p className="text-sm font-medium text-white">New Project</p>

        {/* Name */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          className="w-full text-sm bg-white/5 border border-lifeos-border rounded-lg px-3 py-2 text-white placeholder-lifeos-text-muted outline-none focus:border-lifeos-cyan"
          autoFocus
        />

        {/* Row: Status, Tier, Energy, Time cap */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <label className="text-[10px] text-lifeos-text-muted block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full text-xs bg-white/5 border border-lifeos-border rounded-lg px-2 py-1.5 text-white outline-none focus:border-lifeos-cyan"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} disabled={s === 'Active' && atWipLimit}>
                  {s}{s === 'Active' && atWipLimit ? ' (WIP full)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-lifeos-text-muted block mb-1">Tier</label>
            <select
              value={tier}
              onChange={(e) => setTier(Number(e.target.value))}
              className="w-full text-xs bg-white/5 border border-lifeos-border rounded-lg px-2 py-1.5 text-white outline-none focus:border-lifeos-cyan"
            >
              {TIER_OPTIONS.map((t) => (
                <option key={t} value={t}>Tier {t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-lifeos-text-muted block mb-1">Energy</label>
            <select
              value={energy}
              onChange={(e) => setEnergy(e.target.value as ProjectEnergyLevel)}
              className="w-full text-xs bg-white/5 border border-lifeos-border rounded-lg px-2 py-1.5 text-white outline-none focus:border-lifeos-cyan"
            >
              {ENERGY_OPTIONS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-lifeos-text-muted block mb-1">Hours/wk</label>
            <input
              type="number"
              min={0}
              max={40}
              step={0.5}
              value={timeCap}
              onChange={(e) => setTimeCap(Number(e.target.value))}
              className="w-full text-xs bg-white/5 border border-lifeos-border rounded-lg px-2 py-1.5 text-white outline-none focus:border-lifeos-cyan"
            />
          </div>
        </div>

        {/* Next action */}
        <input
          value={nextAction}
          onChange={(e) => setNextAction(e.target.value)}
          placeholder="First next action (optional)"
          className="w-full text-sm bg-white/5 border border-lifeos-border rounded-lg px-3 py-2 text-white placeholder-lifeos-text-muted outline-none focus:border-lifeos-cyan"
        />

        {/* WIP warning */}
        {status === 'Active' && atWipLimit && (
          <p className="text-xs text-danger">
            WIP limit reached ({activeCount}/{wipLimit}). Change status to Maintenance or Parked, or park an existing project first.
          </p>
        )}

        {error && <p className="text-xs text-danger">{error}</p>}

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-lifeos-text-secondary hover:text-white transition-colors"
            disabled={creating}
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit({
              projectName: name.trim(),
              status,
              tier,
              weeklyTimeCap: timeCap,
              energyLevel: energy,
              nextAction: nextAction.trim(),
            })}
            disabled={!name.trim() || creating || (status === 'Active' && atWipLimit)}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-lifeos-cyan text-lifeos-bg disabled:opacity-30 transition-opacity"
          >
            {creating ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

// ---- Main page ----

export default function ProjectsPage() {
  return (
    <AuthGuard>
      <ProjectsContent />
    </AuthGuard>
  );
}

function ProjectsContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/notion/projects', { cache: 'no-store' });
        const json = (await res.json()) as NotionListResponse<Project>;
        if (json.error) setError(json.error);
        else setProjects(json.data);
      } catch {
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const patchProject = useCallback(
    async (id: string, updates: Record<string, unknown>, optimistic: Partial<Project>) => {
      // Optimistic update
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...optimistic } : p)),
      );

      // Show saving state
      setSavingIds((prev) => new Set(prev).add(id));
      setSavedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });

      try {
        const res = await fetch(`/api/notion/projects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        const json = (await res.json()) as NotionCreateResponse<Project>;

        if (!json.success) {
          // Revert — refetch
          const refetch = await fetch('/api/notion/projects');
          const refetchJson = (await refetch.json()) as NotionListResponse<Project>;
          if (refetchJson.data) setProjects(refetchJson.data);
        } else {
          // Show saved checkmark
          setSavedIds((prev) => new Set(prev).add(id));
          setTimeout(() => setSavedIds((prev) => { const n = new Set(prev); n.delete(id); return n; }), 1500);
        }
      } catch {
        // Revert on network error
        const refetch = await fetch('/api/notion/projects');
        const refetchJson = (await refetch.json()) as NotionListResponse<Project>;
        if (refetchJson.data) setProjects(refetchJson.data);
      } finally {
        setSavingIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      }
    },
    [],
  );

  const reloadProjects = useCallback(async () => {
    const res = await fetch('/api/notion/projects');
    const json = (await res.json()) as NotionListResponse<Project>;
    if (json.data) setProjects(json.data);
  }, []);

  const handleCreateProject = async (formData: {
    projectName: string;
    status: string;
    tier: number;
    weeklyTimeCap: number;
    energyLevel: string;
    nextAction: string;
  }) => {
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/notion/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = (await res.json()) as NotionCreateResponse<Project>;
      if (json.success && json.data) {
        setProjects((prev) => [...prev, json.data!]);
        setShowForm(false);
      } else {
        setCreateError(json.error || 'Failed to create project');
      }
    } catch {
      setCreateError('Network error');
    } finally {
      setCreating(false);
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

  const activeCount = projects.filter((p) => p.status === 'Active').length;
  const groups = groupByStatus(projects);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
      {/* Header + WIP Gauge */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Projects</h1>
            <p className="text-sm text-lifeos-text-secondary mt-1">
              Manage your active work. WIP limit keeps you focused.
            </p>
          </div>
          <div className="w-full sm:w-56">
            <WipGauge active={activeCount} max={WIP_LIMIT} />
          </div>
        </div>
      </motion.div>

      {/* WIP warning */}
      {activeCount > WIP_LIMIT && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <GlassCard className="!border-danger/30 !bg-danger/5">
            <p className="text-sm text-danger font-medium">
              You have {activeCount} active projects — {activeCount - WIP_LIMIT} over your WIP limit of {WIP_LIMIT}.
              Park something to regain focus.
            </p>
          </GlassCard>
        </motion.div>
      )}

      {/* New project button + form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full text-sm text-lifeos-text-secondary hover:text-lifeos-cyan border border-dashed border-lifeos-border hover:border-lifeos-cyan/30 rounded-glass py-3 transition-colors"
          >
            + New Project
          </button>
        ) : (
          <NewProjectForm
            activeCount={activeCount}
            wipLimit={WIP_LIMIT}
            creating={creating}
            error={createError}
            onSubmit={handleCreateProject}
            onCancel={() => { setShowForm(false); setCreateError(null); }}
          />
        )}
      </motion.div>

      {/* Project groups */}
      {(['Active', 'Maintenance', 'Parked'] as const).map((status, gi) => {
        const items = groups[status];
        if (items.length === 0) return null;

        return (
          <motion.div
            key={status}
            custom={gi}
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="mb-8"
          >
            <SectionHeader
              icon={status === 'Active' ? '▦' : status === 'Maintenance' ? '⚙' : '◻'}
              title={status}
              subtitle={`${items.length} project${items.length !== 1 ? 's' : ''}`}
            />
            <div className="space-y-3">
              {items.map((project, i) => (
                <motion.div key={project.id} custom={i} initial="hidden" animate="visible" variants={stagger} className="project-card-wrapper relative">
                  <GlassCard className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Name + next action */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-white truncate">{project.projectName}</p>
                        {project.tier && (
                          <StatusBadge label={`T${project.tier}`} variant="purple" />
                        )}
                        <SaveIndicator
                          saving={savingIds.has(project.id)}
                          saved={savedIds.has(project.id)}
                        />
                      </div>
                      <EditableNextAction
                        value={project.nextAction}
                        onSave={(val) =>
                          patchProject(project.id, { nextAction: val }, { nextAction: val })
                        }
                      />
                    </div>

                    {/* Meta badges */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {project.weeklyTimeCapHrs != null && (
                        <span className="text-[11px] text-lifeos-text-secondary">{project.weeklyTimeCapHrs}h/wk</span>
                      )}
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: energyColor(project.energyLevel) }}
                        title={`Energy: ${project.energyLevel}`}
                      />
                      <StatusDropdown
                        current={project.status}
                        onSelect={(s) =>
                          patchProject(project.id, { status: s }, { status: s })
                        }
                      />
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })}

      {projects.length === 0 && (
        <GlassCard className="text-center py-12">
          <p className="text-lifeos-text-secondary text-sm">No projects found in Notion.</p>
        </GlassCard>
      )}
    </main>
  );
}
