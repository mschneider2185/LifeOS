'use client';

import { useState } from 'react';
import { GoalCard } from './GoalCard';
import type { UserGoal } from '@/types/lifeos';

interface GoalListProps {
  goals: UserGoal[];
  consequenceFraming: boolean;
  onEdit: (goal: UserGoal) => void;
  onComplete: (goalId: string) => void;
}

export function GoalList({ goals, consequenceFraming, onEdit, onComplete }: GoalListProps) {
  const [showCompleted, setShowCompleted] = useState(false);
  const [showPaused, setShowPaused] = useState(false);

  const active = goals
    .filter((g) => g.status === 'active')
    .sort((a, b) => {
      if (!a.target_date) return 1;
      if (!b.target_date) return -1;
      return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
    });

  const completed = goals.filter((g) => g.status === 'completed');
  const paused = goals.filter((g) => g.status === 'paused' || g.status === 'abandoned');

  if (goals.length === 0) {
    return (
      <div className="text-center py-16 text-text-secondary">
        <p className="text-lg mb-2">No goals yet</p>
        <p className="text-sm">Set your first goal to start tracking progress.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Active */}
      {active.length > 0 && (
        <section aria-label="Active goals">
          <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-3">
            Active ({active.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                consequenceFraming={consequenceFraming}
                onEdit={onEdit}
                onComplete={onComplete}
              />
            ))}
          </div>
        </section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <section aria-label="Completed goals">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-sm text-text-secondary hover:text-white transition-colors mb-3"
            aria-expanded={showCompleted}
          >
            {showCompleted ? '▾' : '▸'} Completed ({completed.length})
          </button>
          {showCompleted && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70">
              {completed.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  consequenceFraming={false}
                  onEdit={onEdit}
                  onComplete={onComplete}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Paused / Abandoned */}
      {paused.length > 0 && (
        <section aria-label="Paused goals">
          <button
            onClick={() => setShowPaused(!showPaused)}
            className="text-sm text-text-secondary hover:text-white transition-colors mb-3"
            aria-expanded={showPaused}
          >
            {showPaused ? '▾' : '▸'} Paused / Abandoned ({paused.length})
          </button>
          {showPaused && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50">
              {paused.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  consequenceFraming={false}
                  onEdit={onEdit}
                  onComplete={onComplete}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
