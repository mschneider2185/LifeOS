'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import type { UserGoal, LifeArea } from '@/types/lifeos';

interface GoalCardProps {
  goal: UserGoal;
  consequenceFraming: boolean;
  onEdit: (goal: UserGoal) => void;
  onComplete: (goalId: string) => void;
}

const areaColors: Record<LifeArea, string> = {
  career: 'bg-cyan-accent/20 text-cyan-accent',
  finance: 'bg-success/20 text-success',
  health: 'bg-success/20 text-success',
  relationships: 'bg-purple-accent/20 text-purple-accent',
  personal_growth: 'bg-purple-accent/20 text-purple-accent',
  creativity: 'bg-warning/20 text-warning',
  community: 'bg-cyan-accent/20 text-cyan-accent',
  spirituality: 'bg-purple-accent/20 text-purple-accent',
};

function daysUntil(dateStr: string): number {
  return Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

export function GoalCard({ goal, consequenceFraming, onEdit, onComplete }: GoalCardProps) {
  const area = goal.life_area;
  const remaining = goal.target_date ? daysUntil(goal.target_date) : null;

  return (
    <GlassCard className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold tracking-tight text-white flex-1">{goal.title}</h3>
        {area && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full shrink-0 capitalize ${
              areaColors[area] ?? 'bg-white/10 text-text-secondary'
            }`}
          >
            {area.replace('_', ' ')}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-text-secondary">
          <span>Progress</span>
          <span>{goal.progress_pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-cyan-accent transition-all duration-500"
            style={{ width: `${goal.progress_pct}%` }}
          />
        </div>
      </div>

      {/* Consequence text */}
      {consequenceFraming && goal.consequence_text && (
        <p className="text-xs text-warning/80 italic leading-relaxed">
          If I don&apos;t: {goal.consequence_text}
        </p>
      )}

      {/* Target date */}
      {remaining !== null && (
        <p className="text-xs text-text-secondary">
          {remaining > 0
            ? `${remaining} day${remaining !== 1 ? 's' : ''} remaining`
            : remaining === 0
              ? 'Due today'
              : `${Math.abs(remaining)} days overdue`}
        </p>
      )}

      {/* Key results */}
      {goal.key_results && goal.key_results.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {goal.key_results.map((kr) => {
            const pct = kr.target > 0 ? Math.round((kr.current / kr.target) * 100) : 0;
            return (
              <div key={kr.id} className="flex items-center gap-2 text-xs">
                <span className="text-text-secondary truncate flex-1">{kr.title}</span>
                <div className="w-16 h-1 rounded-full bg-white/10 overflow-hidden shrink-0">
                  <div
                    className="h-full rounded-full bg-purple-accent"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <span className="text-text-secondary w-16 text-right shrink-0">
                  {kr.current}/{kr.target} {kr.unit}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-glass-border mt-auto">
        <button
          onClick={() => onEdit(goal)}
          className="text-xs text-cyan-accent hover:text-cyan-accent/80 transition-colors px-2 py-1 rounded hover:bg-white/5"
          aria-label={`Edit ${goal.title}`}
        >
          Edit
        </button>
        {goal.status === 'active' && (
          <button
            onClick={() => onComplete(goal.id)}
            className="text-xs text-success hover:text-success/80 transition-colors px-2 py-1 rounded hover:bg-white/5"
            aria-label={`Complete ${goal.title}`}
          >
            Complete
          </button>
        )}
      </div>
    </GlassCard>
  );
}
