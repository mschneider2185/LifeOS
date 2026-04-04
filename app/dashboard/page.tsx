'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { GlassCard, WipGauge, ProgressRing, StatusBadge, LoadingPulse, SectionHeader } from '@/components/lifeos';
import type { DashboardData, NotionListResponse, BurnoutWarning } from '@/types/notion';

const stagger = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: 'easeOut' },
  }),
};

const WIP_LIMIT = 4;

const quickActions = [
  { href: '/brain-dump', label: 'Brain Dump', icon: '⚡', desc: 'Dump before you plan' },
  { href: '/checkin', label: 'Check-in', icon: '✦', desc: '30 seconds. Go.' },
  { href: '/goals', label: 'Goals', icon: '◎', desc: 'What matters now' },
  { href: '/health', label: 'Health', icon: '♥', desc: 'Burnout radar' },
];

function burnoutColor(warning: BurnoutWarning | null): string {
  if (!warning) return '#10b981';
  if (warning.startsWith('Red')) return '#ef4444';
  if (warning.startsWith('Orange')) return '#f59e0b';
  if (warning.startsWith('Yellow')) return '#f59e0b';
  return '#10b981';
}

function burnoutVariant(warning: BurnoutWarning | null): 'green' | 'orange' | 'red' {
  if (!warning) return 'green';
  if (warning.startsWith('Red')) return 'red';
  if (warning.startsWith('Orange') || warning.startsWith('Yellow')) return 'orange';
  return 'green';
}

function energyEmoji(level: string | null): string {
  if (!level) return '—';
  if (level.includes('Crashed')) return '🔴';
  if (level.includes('Low')) return '🟠';
  if (level.includes('Okay')) return '🟡';
  if (level.includes('Good')) return '🟢';
  if (level.includes('Peak')) return '🔵';
  return '—';
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/notion/dashboard');
        const json = (await res.json()) as NotionListResponse<DashboardData>;
        if (json.error) {
          setError(json.error);
        } else if (json.data.length > 0) {
          setData(json.data[0]);
        }
      } catch {
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <>
        <LoadingPulse />
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[60vh]">
          <GlassCard glow="none" className="max-w-sm text-center">
            <p className="text-danger text-sm">{error ?? 'No data available'}</p>
            <button onClick={() => window.location.reload()} className="btn-secondary text-sm mt-4">
              Retry
            </button>
          </GlassCard>
        </div>
      </>
    );
  }

  const { activeProjectsCount, latestCheckIn, latestHealth, inProgressGoals } = data;

  return (
    <>
      <main className="max-w-[1200px] mx-auto px-4 py-6 sm:px-6">
        {/* Header */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={stagger} className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Command Center</h1>
          <p className="text-sm text-text-secondary mt-1">Your LifeOS at a glance.</p>
        </motion.div>

        {/* WIP Gauge + Burnout Warning row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <motion.div custom={1} initial="hidden" animate="visible" variants={stagger}>
            <GlassCard>
              <WipGauge active={activeProjectsCount} max={WIP_LIMIT} />
            </GlassCard>
          </motion.div>

          <motion.div custom={2} initial="hidden" animate="visible" variants={stagger}>
            <GlassCard glow={latestHealth?.burnoutWarning?.startsWith('Red') ? 'none' : 'none'}>
              <SectionHeader icon="♥" title="Burnout Radar" />
              {latestHealth ? (
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: burnoutColor(latestHealth.burnoutWarning) }}
                  />
                  <StatusBadge
                    label={latestHealth.burnoutWarning ?? 'Unknown'}
                    variant={burnoutVariant(latestHealth.burnoutWarning)}
                  />
                  {latestHealth.stressTrend && (
                    <span className="text-xs text-text-secondary ml-auto">
                      Trend: {latestHealth.stressTrend}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-text-secondary">No health data yet</p>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div custom={3} initial="hidden" animate="visible" variants={stagger} className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <GlassCard glow="cyan" className="text-center py-5 h-full">
                  <span className="text-2xl block mb-2">{action.icon}</span>
                  <span className="text-sm font-medium text-white block">{action.label}</span>
                  <span className="text-[11px] text-text-secondary block mt-0.5">{action.desc}</span>
                </GlassCard>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Today's Check-in Snapshot */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={stagger} className="mb-6">
          <GlassCard>
            <SectionHeader
              icon="✦"
              title="Today's Check-in"
              action={
                !latestCheckIn ? (
                  <Link href="/checkin" className="text-xs text-cyan-accent hover:underline">
                    Check in now
                  </Link>
                ) : null
              }
            />
            {latestCheckIn ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                <div>
                  <p className="text-2xl">{energyEmoji(latestCheckIn.energyLevel)}</p>
                  <p className="text-[11px] text-text-secondary mt-1">Energy</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{latestCheckIn.stressLevel?.split(' - ')[1] ?? '—'}</p>
                  <p className="text-[11px] text-text-secondary mt-1">Stress</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{latestCheckIn.sleepHours ?? '—'}h</p>
                  <p className="text-[11px] text-text-secondary mt-1">Sleep</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{latestCheckIn.exercise ? '✓' : '✗'}</p>
                  <p className="text-[11px] text-text-secondary mt-1">Exercise</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-white truncate">{latestCheckIn.topWin || '—'}</p>
                  <p className="text-[11px] text-text-secondary mt-1">Top Win</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">No check-in today. <Link href="/checkin" className="text-cyan-accent hover:underline">Do it now</Link> — takes 30 seconds.</p>
            )}
          </GlassCard>
        </motion.div>

        {/* Active Goals */}
        <motion.div custom={5} initial="hidden" animate="visible" variants={stagger}>
          <GlassCard>
            <SectionHeader
              icon="◎"
              title="Active Goals"
              subtitle={`${inProgressGoals.length} in progress`}
              action={
                <Link href="/goals" className="text-xs text-cyan-accent hover:underline">
                  View all
                </Link>
              }
            />
            {inProgressGoals.length > 0 ? (
              <div className="space-y-3">
                {inProgressGoals.map((goal, i) => (
                  <motion.div
                    key={goal.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                    className="flex items-center gap-4 py-2 border-b border-glass-border last:border-0"
                  >
                    <ProgressRing percent={goal.progressPercent ?? 0} size={40} strokeWidth={3} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{goal.goal}</p>
                      {goal.ifIDontDoThis && (
                        <p className="text-[11px] text-danger/80 truncate mt-0.5">
                          If I don't: {goal.ifIDontDoThis}
                        </p>
                      )}
                    </div>
                    {goal.lifeArea && (
                      <StatusBadge
                        label={goal.lifeArea}
                        variant={
                          goal.lifeArea === 'Career/Projects' ? 'cyan'
                            : goal.lifeArea === 'Health' ? 'green'
                            : goal.lifeArea === 'Finance' ? 'orange'
                            : goal.lifeArea === 'Family' ? 'red'
                            : 'purple'
                        }
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-secondary">No goals in progress. <Link href="/goals" className="text-cyan-accent hover:underline">Set one</Link>.</p>
            )}
          </GlassCard>
        </motion.div>
      </main>
    </>
  );
}
