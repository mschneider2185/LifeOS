'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { AuthGuard, GlassCard, ProgressRing, StatusBadge, LoadingPulse, SectionHeader } from '@/components/lifeos';
import type { Goal, GoalStatus, LifeArea, Quarter, NotionListResponse, NotionCreateResponse } from '@/types/notion';

const STATUS_FLOW: GoalStatus[] = ['Not started', 'In progress', 'Done'];
const LIFE_AREAS: LifeArea[] = ['Career/Projects', 'Health', 'Finance', 'Family', 'Personal Growth'];
const QUARTERS: Quarter[] = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'];

const stagger = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35 },
  }),
};

function lifeAreaVariant(area: LifeArea | null): 'cyan' | 'green' | 'orange' | 'red' | 'purple' {
  switch (area) {
    case 'Career/Projects': return 'cyan';
    case 'Health': return 'green';
    case 'Finance': return 'orange';
    case 'Family': return 'red';
    case 'Personal Growth': return 'purple';
    default: return 'cyan';
  }
}

function lifeAreaColor(area: LifeArea | null): string {
  switch (area) {
    case 'Career/Projects': return '#00d4ff';
    case 'Health': return '#10b981';
    case 'Finance': return '#f59e0b';
    case 'Family': return '#ef4444';
    case 'Personal Growth': return '#8b5cf6';
    default: return '#00d4ff';
  }
}

function groupByStatus(goals: Goal[]): Record<string, Goal[]> {
  const groups: Record<string, Goal[]> = { 'In progress': [], 'Not started': [], 'Done': [] };
  for (const g of goals) {
    const key = g.status ?? 'Not started';
    if (groups[key]) groups[key].push(g);
    else groups['Not started'].push(g);
  }
  return groups;
}

// ---- Editable key result ----

function EditableKeyResult({
  value,
  index,
  onSave,
}: {
  value: string;
  index: number;
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
        className="text-xs text-lifeos-text-secondary hover:text-lifeos-cyan flex items-start gap-1.5 text-left w-full transition-colors"
        title="Click to edit"
      >
        <span className="text-lifeos-cyan mt-0.5">›</span>
        {value || `Key result ${index + 1}`}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-lifeos-cyan text-xs">›</span>
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setDraft(value); setEditing(false); }
        }}
        className="text-xs flex-1 bg-white/5 border border-lifeos-border-cyan rounded px-2 py-1 text-white outline-none focus:border-lifeos-cyan"
        placeholder={`Key result ${index + 1}...`}
      />
    </div>
  );
}

// ---- Progress adjuster ----

function ProgressAdjuster({
  percent,
  onChange,
  color,
}: {
  percent: number;
  onChange: (val: number) => void;
  color: string;
}) {
  const adjust = (delta: number) => {
    const next = Math.max(0, Math.min(100, percent + delta));
    if (next !== percent) onChange(next);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <ProgressRing percent={percent} size={48} strokeWidth={4} color={color} />
      <div className="flex items-center gap-1">
        <button
          onClick={() => adjust(-5)}
          className="w-6 h-6 rounded text-[11px] font-medium bg-white/5 text-lifeos-text-secondary hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Decrease progress by 5%"
        >
          −
        </button>
        <span className="text-[10px] text-lifeos-text-muted w-8 text-center">{percent}%</span>
        <button
          onClick={() => adjust(5)}
          className="w-6 h-6 rounded text-[11px] font-medium bg-white/5 text-lifeos-text-secondary hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Increase progress by 5%"
        >
          +
        </button>
      </div>
    </div>
  );
}

// ---- Status toggle ----

function StatusToggle({
  current,
  onToggle,
}: {
  current: GoalStatus | null;
  onToggle: (next: GoalStatus) => void;
}) {
  const idx = STATUS_FLOW.indexOf(current ?? 'Not started');

  const statusColors: Record<GoalStatus, string> = {
    'Not started': 'text-lifeos-text-muted border-lifeos-text-muted/30 bg-white/5',
    'In progress': 'text-lifeos-cyan border-lifeos-cyan/30 bg-lifeos-cyan-dim',
    'Done': 'text-lifeos-green border-lifeos-green/30 bg-success/15',
  };

  return (
    <div className="flex gap-1">
      {STATUS_FLOW.map((s, i) => (
        <button
          key={s}
          onClick={() => onToggle(s)}
          className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${
            i === idx ? statusColors[s] : 'text-lifeos-text-muted/50 border-transparent hover:border-white/10'
          }`}
          aria-label={`Set status to ${s}`}
        >
          {s}
        </button>
      ))}
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

// ---- New goal form ----

function NewGoalForm({
  creating,
  error,
  onSubmit,
  onCancel,
}: {
  creating: boolean;
  error: string | null;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const [goal, setGoal] = useState('');
  const [lifeArea, setLifeArea] = useState<LifeArea>('Career/Projects');
  const [quarter, setQuarter] = useState<Quarter>('Q2 2026');
  const [consequence, setConsequence] = useState('');
  const [kr1, setKr1] = useState('');
  const [kr2, setKr2] = useState('');
  const [kr3, setKr3] = useState('');
  const [targetDate, setTargetDate] = useState('');

  return (
    <GlassCard>
      <div className="space-y-3">
        <p className="text-sm font-medium text-white">New Goal</p>

        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="What do you want to achieve?"
          className="w-full text-sm bg-white/5 border border-lifeos-border rounded-lg px-3 py-2 text-white placeholder-lifeos-text-muted outline-none focus:border-lifeos-cyan"
          autoFocus
        />

        {/* Consequence framing — required */}
        <div>
          <label className="text-[10px] text-danger block mb-1">
            What happens if you DON&apos;T do this? *
          </label>
          <textarea
            value={consequence}
            onChange={(e) => setConsequence(e.target.value)}
            placeholder="Be honest with yourself..."
            rows={2}
            className="w-full text-sm bg-danger/5 border border-danger/20 rounded-lg px-3 py-2 text-white placeholder-lifeos-text-muted outline-none focus:border-danger/50 resize-none"
          />
        </div>

        {/* Life area + Quarter + Target date */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] text-lifeos-text-muted block mb-1">Life Area</label>
            <select
              value={lifeArea}
              onChange={(e) => setLifeArea(e.target.value as LifeArea)}
              className="w-full text-xs bg-white/5 border border-lifeos-border rounded-lg px-2 py-1.5 text-white outline-none focus:border-lifeos-cyan"
            >
              {LIFE_AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-lifeos-text-muted block mb-1">Quarter</label>
            <select
              value={quarter}
              onChange={(e) => setQuarter(e.target.value as Quarter)}
              className="w-full text-xs bg-white/5 border border-lifeos-border rounded-lg px-2 py-1.5 text-white outline-none focus:border-lifeos-cyan"
            >
              {QUARTERS.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[10px] text-lifeos-text-muted block mb-1">Target Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full text-xs bg-white/5 border border-lifeos-border rounded-lg px-2 py-1.5 text-white outline-none focus:border-lifeos-cyan"
            />
          </div>
        </div>

        {/* Key results */}
        <div className="space-y-2">
          <label className="text-[10px] text-lifeos-text-muted block">Key Results (optional)</label>
          {[
            { val: kr1, set: setKr1, ph: 'Key result 1' },
            { val: kr2, set: setKr2, ph: 'Key result 2' },
            { val: kr3, set: setKr3, ph: 'Key result 3' },
          ].map((kr, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-lifeos-cyan text-xs">›</span>
              <input
                value={kr.val}
                onChange={(e) => kr.set(e.target.value)}
                placeholder={kr.ph}
                className="flex-1 text-xs bg-white/5 border border-lifeos-border rounded px-2 py-1 text-white placeholder-lifeos-text-muted outline-none focus:border-lifeos-cyan"
              />
            </div>
          ))}
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

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
              goal: goal.trim(),
              status: 'Not started',
              quarter,
              lifeArea,
              ifIDontDoThis: consequence.trim(),
              keyResult1: kr1.trim() || undefined,
              keyResult2: kr2.trim() || undefined,
              keyResult3: kr3.trim() || undefined,
              targetDate: targetDate || undefined,
            })}
            disabled={!goal.trim() || !consequence.trim() || creating}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-lifeos-cyan text-lifeos-bg disabled:opacity-30 transition-opacity"
          >
            {creating ? 'Creating...' : 'Create Goal'}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

// ---- Main page ----

export default function GoalsPage() {
  return (
    <AuthGuard>
      <GoalsContent />
    </AuthGuard>
  );
}

function GoalsContent() {
  const [goals, setGoals] = useState<Goal[]>([]);
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
        const res = await fetch('/api/notion/goals', { cache: 'no-store' });
        const json = (await res.json()) as NotionListResponse<Goal>;
        if (json.error) setError(json.error);
        else setGoals(json.data);
      } catch {
        setError('Failed to load goals');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const patchGoal = useCallback(
    async (id: string, updates: Record<string, unknown>, optimistic: Partial<Goal>) => {
      setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...optimistic } : g)));

      setSavingIds((prev) => new Set(prev).add(id));
      setSavedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });

      try {
        const res = await fetch(`/api/notion/goals/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        const json = (await res.json()) as NotionCreateResponse<Goal>;

        if (!json.success) {
          const refetch = await fetch('/api/notion/goals');
          const refetchJson = (await refetch.json()) as NotionListResponse<Goal>;
          if (refetchJson.data) setGoals(refetchJson.data);
        } else {
          setSavedIds((prev) => new Set(prev).add(id));
          setTimeout(() => setSavedIds((prev) => { const n = new Set(prev); n.delete(id); return n; }), 1500);
        }
      } catch {
        const refetch = await fetch('/api/notion/goals');
        const refetchJson = (await refetch.json()) as NotionListResponse<Goal>;
        if (refetchJson.data) setGoals(refetchJson.data);
      } finally {
        setSavingIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      }
    },
    [],
  );

  const handleCreateGoal = async (formData: Record<string, unknown>) => {
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/notion/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = (await res.json()) as NotionCreateResponse<Goal>;
      if (json.success && json.data) {
        setGoals((prev) => [...prev, json.data!]);
        setShowForm(false);
      } else {
        setCreateError(json.error || 'Failed to create goal');
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

  const groups = groupByStatus(goals);
  const statusOrder: GoalStatus[] = ['In progress', 'Not started', 'Done'];
  const statusIcons: Record<GoalStatus, string> = {
    'In progress': '◎',
    'Not started': '○',
    'Done': '✓',
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Goals</h1>
        <p className="text-sm text-lifeos-text-secondary mt-1">
          What happens if you DON&apos;T follow through?
        </p>
      </motion.div>

      {/* New goal button + form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full text-sm text-lifeos-text-secondary hover:text-lifeos-cyan border border-dashed border-lifeos-border hover:border-lifeos-cyan/30 rounded-glass py-3 transition-colors"
          >
            + New Goal
          </button>
        ) : (
          <NewGoalForm
            creating={creating}
            error={createError}
            onSubmit={handleCreateGoal}
            onCancel={() => { setShowForm(false); setCreateError(null); }}
          />
        )}
      </motion.div>

      {statusOrder.map((status, gi) => {
        const items = groups[status];
        if (items.length === 0) return null;

        return (
          <motion.div key={status} custom={gi} initial="hidden" animate="visible" variants={stagger} className="mb-8">
            <SectionHeader
              icon={statusIcons[status]}
              title={status}
              subtitle={`${items.length} goal${items.length !== 1 ? 's' : ''}`}
            />
            <div className="space-y-3">
              {items.map((goal, i) => (
                <motion.div key={goal.id} custom={i} initial="hidden" animate="visible" variants={stagger}>
                  <GlassCard>
                    <div className="flex items-start gap-4">
                      {/* Progress adjuster */}
                      <ProgressAdjuster
                        percent={goal.progressPercent ?? 0}
                        color={lifeAreaColor(goal.lifeArea)}
                        onChange={(val) =>
                          patchGoal(goal.id, { progressPercent: val }, { progressPercent: val })
                        }
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-sm font-medium text-white">{goal.goal}</p>
                          {goal.lifeArea && (
                            <StatusBadge label={goal.lifeArea} variant={lifeAreaVariant(goal.lifeArea)} />
                          )}
                          {goal.quarter && (
                            <StatusBadge label={goal.quarter} variant="purple" />
                          )}
                          <SaveIndicator
                            saving={savingIds.has(goal.id)}
                            saved={savedIds.has(goal.id)}
                          />
                        </div>

                        {/* Status toggle */}
                        <div className="mb-2">
                          <StatusToggle
                            current={goal.status}
                            onToggle={(s) =>
                              patchGoal(goal.id, { status: s }, { status: s })
                            }
                          />
                        </div>

                        {/* Consequence framing */}
                        {goal.ifIDontDoThis && (
                          <div className="mt-2 p-2.5 rounded-lg bg-danger/10 border border-danger/20">
                            <p className="text-xs text-danger">
                              <span className="font-medium">If I don&apos;t:</span> {goal.ifIDontDoThis}
                            </p>
                          </div>
                        )}

                        {/* Editable key results */}
                        <div className="mt-2 space-y-1">
                          {([
                            { key: 'keyResult1' as const, value: goal.keyResult1 },
                            { key: 'keyResult2' as const, value: goal.keyResult2 },
                            { key: 'keyResult3' as const, value: goal.keyResult3 },
                          ]).map((kr, ki) => (
                            (kr.value || goal.status !== 'Done') && (
                              <EditableKeyResult
                                key={kr.key}
                                value={kr.value}
                                index={ki}
                                onSave={(val) =>
                                  patchGoal(goal.id, { [kr.key]: val }, { [kr.key]: val })
                                }
                              />
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })}

      {goals.length === 0 && (
        <GlassCard className="text-center py-12">
          <p className="text-lifeos-text-secondary text-sm">No goals found in Notion.</p>
        </GlassCard>
      )}
    </main>
  );
}
