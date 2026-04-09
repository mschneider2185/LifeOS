'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { AuthGuard, GlassCard, StatusBadge, LoadingPulse, SectionHeader } from '@/components/lifeos';
import type { HealthEntry, BurnoutWarning, StressTrend, NotionListResponse } from '@/types/notion';

const stagger = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35 },
  }),
};

function burnoutVariant(w: BurnoutWarning | null): 'green' | 'orange' | 'red' {
  if (!w) return 'green';
  if (w.startsWith('Red')) return 'red';
  if (w.startsWith('Orange') || w.startsWith('Yellow')) return 'orange';
  return 'green';
}

function burnoutColor(w: BurnoutWarning | null): string {
  if (!w) return '#10b981';
  if (w.startsWith('Red')) return '#ef4444';
  if (w.startsWith('Orange')) return '#f59e0b';
  if (w.startsWith('Yellow')) return '#eab308';
  return '#10b981';
}

function trendIcon(trend: StressTrend | null): string {
  switch (trend) {
    case 'Improving': return '↓';
    case 'Stable': return '→';
    case 'Worsening': return '↑';
    case 'Crisis': return '⚠';
    default: return '—';
  }
}

function trendVariant(trend: StressTrend | null): 'green' | 'cyan' | 'orange' | 'red' {
  switch (trend) {
    case 'Improving': return 'green';
    case 'Stable': return 'cyan';
    case 'Worsening': return 'orange';
    case 'Crisis': return 'red';
    default: return 'cyan';
  }
}

export default function HealthPage() {
  return (
    <AuthGuard>
      <HealthContent />
    </AuthGuard>
  );
}

function HealthContent() {
  const [entries, setEntries] = useState<HealthEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/notion/health', { cache: 'no-store' });
        const json = (await res.json()) as NotionListResponse<HealthEntry>;
        if (json.error) setError(json.error);
        else setEntries(json.data);
      } catch {
        setError('Failed to load health data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <><LoadingPulse /></>;

  if (error) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[60vh]">
          <GlassCard className="max-w-sm text-center">
            <p className="text-danger text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-secondary text-sm mt-4">Retry</button>
          </GlassCard>
        </div>
      </>
    );
  }

  const latest = entries[0] ?? null;
  const history = entries.slice(1);

  return (
    <>
      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Health &amp; Burnout Radar</h1>
          <p className="text-sm text-text-secondary mt-1">Early warning system for your wellbeing.</p>
        </motion.div>

        {latest ? (
          <>
            {/* Current Week Summary */}
            <motion.div custom={0} initial="hidden" animate="visible" variants={stagger} className="mb-6">
              <GlassCard>
                <SectionHeader icon="♥" title={`Week of ${latest.weekOf}`} subtitle="Current snapshot" />

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                  {/* Burnout Warning */}
                  <div className="text-center">
                    <div
                      className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                      style={{
                        backgroundColor: `${burnoutColor(latest.burnoutWarning)}20`,
                        border: `2px solid ${burnoutColor(latest.burnoutWarning)}`,
                        boxShadow: `0 0 12px ${burnoutColor(latest.burnoutWarning)}30`,
                      }}
                    >
                      <span className="text-lg" style={{ color: burnoutColor(latest.burnoutWarning) }}>
                        {latest.burnoutWarning?.startsWith('Red') ? '!' : latest.burnoutWarning?.startsWith('Green') ? '✓' : '~'}
                      </span>
                    </div>
                    <StatusBadge
                      label={latest.burnoutWarning ?? 'Unknown'}
                      variant={burnoutVariant(latest.burnoutWarning)}
                    />
                  </div>

                  {/* Avg Sleep */}
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-white">{latest.avgSleepHrs ?? '—'}</p>
                    <p className="text-[11px] text-text-secondary mt-1">Avg Sleep (hrs)</p>
                  </div>

                  {/* Exercise Days */}
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-white">{latest.exerciseDays ?? '—'}</p>
                    <p className="text-[11px] text-text-secondary mt-1">Exercise Days</p>
                  </div>

                  {/* Stress Trend */}
                  <div className="text-center">
                    <p className="text-2xl font-semibold">{trendIcon(latest.stressTrend)}</p>
                    {latest.stressTrend && (
                      <StatusBadge label={latest.stressTrend} variant={trendVariant(latest.stressTrend)} />
                    )}
                    <p className="text-[11px] text-text-secondary mt-1">Stress Trend</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* What Helped / What Hurt */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <motion.div custom={1} initial="hidden" animate="visible" variants={stagger}>
                <GlassCard className="h-full">
                  <SectionHeader icon="✓" title="What Helped" />
                  {latest.whatHelped ? (
                    <p className="text-sm text-success/90 leading-relaxed">{latest.whatHelped}</p>
                  ) : (
                    <p className="text-xs text-text-secondary">Nothing logged</p>
                  )}
                </GlassCard>
              </motion.div>
              <motion.div custom={2} initial="hidden" animate="visible" variants={stagger}>
                <GlassCard className="h-full">
                  <SectionHeader icon="✗" title="What Hurt" />
                  {latest.whatHurt ? (
                    <p className="text-sm text-danger/90 leading-relaxed">{latest.whatHurt}</p>
                  ) : (
                    <p className="text-xs text-text-secondary">Nothing logged</p>
                  )}
                </GlassCard>
              </motion.div>
            </div>

            {/* Self-care actions */}
            {latest.selfCareActions.length > 0 && (
              <motion.div custom={3} initial="hidden" animate="visible" variants={stagger} className="mb-6">
                <GlassCard>
                  <SectionHeader icon="⚡" title="Self-Care Actions" />
                  <div className="flex flex-wrap gap-2">
                    {latest.selfCareActions.map((action, i) => (
                      <StatusBadge key={i} label={action} variant="purple" />
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </>
        ) : (
          <GlassCard className="text-center py-12">
            <p className="text-text-secondary text-sm">No health entries found in Notion.</p>
          </GlassCard>
        )}

        {/* History */}
        {history.length > 0 && (
          <motion.div custom={4} initial="hidden" animate="visible" variants={stagger}>
            <GlassCard>
              <SectionHeader icon="☰" title="Past Weeks" subtitle={`${history.length} entries`} />
              <div className="space-y-3">
                {history.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 py-2.5 border-b border-glass-border last:border-0">
                    <span className="text-xs text-text-secondary w-24 shrink-0">{entry.weekOf}</span>
                    <StatusBadge
                      label={entry.burnoutWarning ?? 'Unknown'}
                      variant={burnoutVariant(entry.burnoutWarning)}
                    />
                    <span className="text-xs text-text-secondary ml-auto">
                      {entry.avgSleepHrs ?? '—'}h sleep · {entry.exerciseDays ?? '—'}d exercise
                    </span>
                    {entry.stressTrend && (
                      <span className="text-sm">{trendIcon(entry.stressTrend)}</span>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </main>
    </>
  );
}
