'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

import { GlassCard, LoadingPulse, SectionHeader } from '@/components/lifeos';
import type {
  ActivityLog,
  Project,
  NotionListResponse,
  NotionCreateResponse,
} from '@/types/notion';

function formatDateTitle(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

const stagger = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35 },
  }),
};

export default function ActivityLogPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Today's entry
  const [entryId, setEntryId] = useState<string | null>(null);
  const [whatGotDone, setWhatGotDone] = useState('');
  const [keyDecisions, setKeyDecisions] = useState('');
  const [openItems, setOpenItems] = useState('');
  const [spend, setSpend] = useState<number | undefined>(undefined);
  const [tomorrowPriorities, setTomorrowPriorities] = useState('');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  // Reference data
  const [projects, setProjects] = useState<Project[]>([]);
  const [history, setHistory] = useState<ActivityLog[]>([]);

  const today = new Date();
  const todayISO = toISODate(today);
  const todayTitle = formatDateTitle(today);

  const loadData = useCallback(async () => {
    try {
      const [logRes, projRes, histRes] = await Promise.all([
        fetch(`/api/notion/activity-log?date=${todayISO}`, { cache: 'no-store' }),
        fetch('/api/notion/projects', { cache: 'no-store' }),
        fetch('/api/notion/activity-log', { cache: 'no-store' }),
      ]);

      const logJson = (await logRes.json()) as NotionListResponse<ActivityLog>;
      const projJson = (await projRes.json()) as NotionListResponse<Project>;
      const histJson = (await histRes.json()) as NotionListResponse<ActivityLog>;

      if (projJson.data) setProjects(projJson.data);
      if (histJson.data) setHistory(histJson.data);

      // Pre-fill form if today's entry exists
      if (logJson.data && logJson.data.length > 0) {
        const entry = logJson.data[0];
        setEntryId(entry.id);
        setWhatGotDone(entry.whatGotDone);
        setKeyDecisions(entry.keyDecisions);
        setOpenItems(entry.openItems);
        setSpend(entry.spend ?? undefined);
        setTomorrowPriorities(entry.tomorrowPriorities);
        setSelectedProjectIds(entry.projectsTouched);
      }
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [todayISO]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const payload = {
        whatGotDone,
        keyDecisions,
        openItems,
        spend: spend ?? undefined,
        tomorrowPriorities,
        projectsTouched: selectedProjectIds,
      };

      let res: Response;

      if (entryId) {
        // Update existing
        res = await fetch(`/api/notion/activity-log/${entryId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new
        res = await fetch('/api/notion/activity-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: todayTitle,
            logDate: todayISO,
            ...payload,
          }),
        });
      }

      const json = (await res.json()) as NotionCreateResponse<ActivityLog>;

      if (json.success && json.data) {
        setEntryId(json.data.id);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        // Refresh history
        const histRes = await fetch('/api/notion/activity-log', { cache: 'no-store' });
        const histJson = (await histRes.json()) as NotionListResponse<ActivityLog>;
        if (histJson.data) setHistory(histJson.data);
      } else {
        setError(json.error || 'Save failed');
      }
    } catch {
      setError('Network error — could not save');
    } finally {
      setSaving(false);
    }
  };

  const toggleProject = (id: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  // Build a project name lookup from the projects list
  const projectNameMap = new Map(projects.map((p) => [p.id, p.projectName]));

  if (loading) {
    return <LoadingPulse />;
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Activity Log</h1>
        <p className="text-sm text-text-secondary mb-6">
          {todayTitle} {entryId ? '— editing existing entry' : '— new entry'}
        </p>
      </motion.div>

      {error && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Projects Touched */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={stagger}>
          <GlassCard>
            <label className="text-sm font-medium text-white block mb-3">Projects Touched</label>
            <div className="flex flex-wrap gap-2">
              {projects.map((proj) => {
                const selected = selectedProjectIds.includes(proj.id);
                return (
                  <button
                    key={proj.id}
                    onClick={() => toggleProject(proj.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                      selected
                        ? 'border-cyan-accent/40 bg-cyan-accent/15 text-cyan-accent'
                        : 'border-glass-border bg-white/5 text-text-secondary hover:text-white hover:bg-white/8'
                    }`}
                    aria-pressed={selected}
                  >
                    {proj.projectName}
                  </button>
                );
              })}
              {projects.length === 0 && (
                <span className="text-xs text-text-secondary">No projects found</span>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* What Got Done */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={stagger}>
          <GlassCard>
            <label className="text-sm font-medium text-white block mb-2">What Got Done</label>
            <textarea
              value={whatGotDone}
              onChange={(e) => setWhatGotDone(e.target.value)}
              placeholder="Shipped the activity log feature, fixed auth bug..."
              rows={3}
              className="input-field text-sm resize-none"
              aria-label="What got done"
            />
          </GlassCard>
        </motion.div>

        {/* Key Decisions */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={stagger}>
          <GlassCard>
            <label className="text-sm font-medium text-white block mb-2">Key Decisions</label>
            <textarea
              value={keyDecisions}
              onChange={(e) => setKeyDecisions(e.target.value)}
              placeholder="Decided to use Notion relations for project linking..."
              rows={2}
              className="input-field text-sm resize-none"
              aria-label="Key decisions"
            />
          </GlassCard>
        </motion.div>

        {/* Open Items */}
        <motion.div custom={3} initial="hidden" animate="visible" variants={stagger}>
          <GlassCard>
            <label className="text-sm font-medium text-white block mb-2">Open Items</label>
            <textarea
              value={openItems}
              onChange={(e) => setOpenItems(e.target.value)}
              placeholder="Still need to wire up mobile nav, auth guards pending..."
              rows={2}
              className="input-field text-sm resize-none"
              aria-label="Open items"
            />
          </GlassCard>
        </motion.div>

        {/* Spend + Tomorrow Priorities */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={stagger}>
          <GlassCard>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-white block mb-2">Spend ($)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={spend ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSpend(v === '' ? undefined : parseFloat(v));
                  }}
                  placeholder="0.00"
                  className="input-field !py-2 text-sm w-32"
                  aria-label="Amount spent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white block mb-2">Tomorrow Priorities</label>
                <textarea
                  value={tomorrowPriorities}
                  onChange={(e) => setTomorrowPriorities(e.target.value)}
                  placeholder="Deploy to Vercel, mobile responsive polish..."
                  rows={2}
                  className="input-field text-sm resize-none"
                  aria-label="Tomorrow priorities"
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Save Button */}
        <motion.div custom={5} initial="hidden" animate="visible" variants={stagger}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : entryId ? 'Update Entry' : 'Save Entry'}
          </button>
        </motion.div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <motion.div custom={6} initial="hidden" animate="visible" variants={stagger} className="mt-10">
          <GlassCard>
            <SectionHeader icon="☰" title="Recent Activity (Last 7 Days)" />
            <div className="space-y-4">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className={`py-3 border-b border-glass-border last:border-0 ${
                    entry.id === entryId ? 'pl-3 border-l-2 border-l-cyan-accent' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-white">{entry.date}</span>
                    <div className="flex items-center gap-2">
                      {entry.spend !== null && entry.spend > 0 && (
                        <span className="text-xs text-warning">${entry.spend.toFixed(2)}</span>
                      )}
                      {entry.projectsTouched.length > 0 && (
                        <span className="text-xs text-text-secondary">
                          {entry.projectsTouched.length} project{entry.projectsTouched.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  {entry.whatGotDone && (
                    <p className="text-xs text-text-secondary line-clamp-2">{entry.whatGotDone}</p>
                  )}
                  {entry.projectsTouched.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {entry.projectsTouched.map((pid) => (
                        <span
                          key={pid}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-accent/10 text-cyan-accent/80"
                        >
                          {projectNameMap.get(pid) || pid.slice(0, 8)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </main>
  );
}
