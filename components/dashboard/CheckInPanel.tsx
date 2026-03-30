'use client';

import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import type { DailyCheckIn, CoachingTone } from '@/types/lifeos';

interface CheckInPanelProps {
  todayCheckIn: DailyCheckIn | null;
  streakDays: number;
  coachingTone: CoachingTone;
}

export function CheckInPanel({ todayCheckIn, streakDays, coachingTone }: CheckInPanelProps) {
  const isHighNeuroticism = coachingTone === 'coach' || coachingTone === 'cheerleader';
  const ctaText = isHighNeuroticism ? 'When you\'re ready' : 'Check in now';

  // Not checked in yet
  if (!todayCheckIn) {
    return (
      <GlassCard className="flex flex-col items-center justify-center text-center min-h-[200px] gap-3">
        <p className="text-text-secondary text-sm">Your first check-in takes 30 seconds</p>
        <Link href="/checkin" className="btn-primary text-sm !py-2.5 !px-5">
          {ctaText}
        </Link>
        {streakDays > 0 && (
          <p className="text-xs text-text-secondary">
            {streakDays}-day streak — keep it going!
          </p>
        )}
      </GlassCard>
    );
  }

  // Already checked in — show stats
  return (
    <GlassCard className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold tracking-tight text-white">Today</h2>
        <span className="text-xs text-success">Checked in</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Energy */}
        <Stat
          label="Energy"
          value={
            todayCheckIn.energy_level !== null
              ? renderDots(todayCheckIn.energy_level, 5)
              : '—'
          }
        />
        {/* Stress */}
        <Stat
          label="Stress"
          value={
            todayCheckIn.stress_level !== null
              ? renderDots(todayCheckIn.stress_level, 5)
              : '—'
          }
        />
        {/* Sleep */}
        <Stat
          label="Sleep"
          value={
            todayCheckIn.sleep_hours !== null
              ? `${todayCheckIn.sleep_hours}h`
              : '—'
          }
        />
        {/* Exercise */}
        <Stat
          label="Exercise"
          value={todayCheckIn.exercise ? '\u2705' : '\u274C'}
        />
      </div>

      {/* Streak */}
      <div className="flex items-center justify-between pt-2 border-t border-glass-border">
        <span className="text-xs text-text-secondary">Streak</span>
        <span className="text-sm font-medium text-white">{streakDays} days</span>
      </div>
    </GlassCard>
  );
}

function Stat({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="p-2 rounded-lg bg-white/5">
      <p className="text-xs text-text-secondary mb-0.5">{label}</p>
      <p className="text-sm text-white">{value}</p>
    </div>
  );
}

function renderDots(level: number, max: number): string {
  const filled = Math.min(Math.max(Math.round(level), 0), max);
  return '\u25CF'.repeat(filled) + '\u25CB'.repeat(max - filled);
}
