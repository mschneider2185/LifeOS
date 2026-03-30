'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import type { WeeklyReview, BurnoutLevel } from '@/types/lifeos';

interface ReviewHistoryProps {
  reviews: WeeklyReview[];
}

const burnoutDot: Record<BurnoutLevel, string> = {
  green: 'bg-success',
  yellow: 'bg-warning',
  orange: 'bg-orange-500',
  red: 'bg-danger',
};

export function ReviewHistory({ reviews }: ReviewHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (reviews.length === 0) return null;

  // Sparkline data (last 8 weeks)
  const sparkData = reviews.slice(0, 8).reverse();
  const maxScore = 100;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
        Past reviews
      </h3>

      {/* Sparkline */}
      {sparkData.length >= 2 && (
        <GlassCard className="!p-3">
          <svg
            viewBox={`0 0 ${sparkData.length * 40} 40`}
            className="w-full h-10"
            role="img"
            aria-label="Weekly score trend"
          >
            <polyline
              points={sparkData
                .map(
                  (r, i) =>
                    `${i * 40 + 20},${40 - ((r.score ?? 0) / maxScore) * 36}`
                )
                .join(' ')}
              fill="none"
              stroke="#00d4ff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {sparkData.map((r, i) => (
              <circle
                key={r.id}
                cx={i * 40 + 20}
                cy={40 - ((r.score ?? 0) / maxScore) * 36}
                r="3"
                fill="#00d4ff"
              />
            ))}
          </svg>
        </GlassCard>
      )}

      {/* Review list */}
      <div className="space-y-2">
        {reviews.map((review) => {
          const expanded = expandedId === review.id;
          const scoreColor =
            (review.score ?? 0) >= 70
              ? 'text-success'
              : (review.score ?? 0) >= 40
                ? 'text-warning'
                : 'text-danger';

          return (
            <GlassCard
              key={review.id}
              className="!p-3 cursor-pointer"
              onClick={() => setExpandedId(expanded ? null : review.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${burnoutDot[review.burnout_level]}`} />
                  <span className="text-sm text-white">
                    Week of{' '}
                    {new Date(review.week_of + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <span className={`text-sm font-medium ${scoreColor}`}>
                  {review.score ?? '—'}
                </span>
              </div>

              {expanded && (
                <div className="mt-3 pt-3 border-t border-glass-border space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-text-secondary text-xs">WIP</span>
                      <p className="text-white">
                        {review.wip_respected ? 'Respected' : 'Exceeded'}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-secondary text-xs">Exercise</span>
                      <p className="text-white">{review.exercise_days ?? '—'} days</p>
                    </div>
                    <div>
                      <span className="text-text-secondary text-xs">Sleep</span>
                      <p className="text-white">{review.avg_sleep ?? '—'}h avg</p>
                    </div>
                    <div>
                      <span className="text-text-secondary text-xs">Tasks</span>
                      <p className="text-white">{review.tasks_completed} done</p>
                    </div>
                  </div>
                  {review.top_win && (
                    <p>
                      <span className="text-text-secondary">Win: </span>
                      <span className="text-white">{review.top_win}</span>
                    </p>
                  )}
                  {review.biggest_blocker && (
                    <p>
                      <span className="text-text-secondary">Blocker: </span>
                      <span className="text-white">{review.biggest_blocker}</span>
                    </p>
                  )}
                  {review.next_priorities && review.next_priorities.length > 0 && (
                    <div>
                      <span className="text-text-secondary">Priorities: </span>
                      <span className="text-white">
                        {review.next_priorities.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
