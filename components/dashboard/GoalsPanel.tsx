'use client';

import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import type { UserGoal } from '@/types/lifeos';

interface GoalsPanelProps {
  goals: UserGoal[];
  consequenceFraming: boolean;
}

export function GoalsPanel({ goals, consequenceFraming }: GoalsPanelProps) {
  if (goals.length === 0) {
    return (
      <GlassCard className="flex flex-col items-center justify-center text-center min-h-[180px] gap-3">
        <p className="text-text-secondary text-sm">What are you working toward?</p>
        <Link href="/goals" className="btn-primary text-sm !py-2 !px-4">
          + Add Goal
        </Link>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold tracking-tight text-white">Goals</h2>
        <Link href="/goals" className="text-xs text-cyan-accent hover:text-cyan-accent/80 transition-colors">
          View all
        </Link>
      </div>

      <ul className="space-y-3">
        {goals.slice(0, 3).map((goal) => (
          <li key={goal.id} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-white truncate">{goal.title}</span>
              <span className="text-xs text-text-secondary shrink-0">
                {goal.progress_pct}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-cyan-accent transition-all duration-500"
                style={{ width: `${goal.progress_pct}%` }}
              />
            </div>
            {/* Consequence text */}
            {consequenceFraming && goal.consequence_text && (
              <p className="text-xs text-warning/80 italic">
                {goal.consequence_text}
              </p>
            )}
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
