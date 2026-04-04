'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { GlassCard, ProgressRing, StatusBadge, LoadingPulse, SectionHeader } from '@/components/lifeos';
import type { Goal, GoalStatus, LifeArea, NotionListResponse } from '@/types/notion';

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

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/notion/goals');
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

  const groups = groupByStatus(goals);
  const statusOrder: GoalStatus[] = ['In progress', 'Not started', 'Done'];
  const statusIcons: Record<GoalStatus, string> = {
    'In progress': '◎',
    'Not started': '○',
    'Done': '✓',
  };

  return (
    <>
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Goals</h1>
          <p className="text-sm text-text-secondary mt-1">
            What happens if you DON&apos;T follow through?
          </p>
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
                        {/* Progress ring */}
                        <ProgressRing
                          percent={goal.progressPercent ?? 0}
                          size={48}
                          strokeWidth={4}
                          color={lifeAreaColor(goal.lifeArea)}
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
                          </div>

                          {/* Consequence framing — red highlight */}
                          {goal.ifIDontDoThis && (
                            <div className="mt-2 p-2.5 rounded-lg bg-danger/10 border border-danger/20">
                              <p className="text-xs text-danger">
                                <span className="font-medium">If I don&apos;t:</span> {goal.ifIDontDoThis}
                              </p>
                            </div>
                          )}

                          {/* Key results */}
                          {(goal.keyResult1 || goal.keyResult2 || goal.keyResult3) && (
                            <div className="mt-2 space-y-1">
                              {[goal.keyResult1, goal.keyResult2, goal.keyResult3]
                                .filter(Boolean)
                                .map((kr, ki) => (
                                  <p key={ki} className="text-xs text-text-secondary flex items-start gap-1.5">
                                    <span className="text-cyan-accent mt-0.5">›</span>
                                    {kr}
                                  </p>
                                ))}
                            </div>
                          )}
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
            <p className="text-text-secondary text-sm">No goals found in Notion.</p>
          </GlassCard>
        )}
      </main>
    </>
  );
}
