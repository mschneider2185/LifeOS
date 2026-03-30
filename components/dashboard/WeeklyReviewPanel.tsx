'use client';

import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import type { WeeklyReview, BurnoutLevel } from '@/types/lifeos';

interface WeeklyReviewPanelProps {
  latestReview: WeeklyReview | null;
}

const burnoutStyle: Record<BurnoutLevel, { dot: string; label: string }> = {
  green: { dot: 'bg-success', label: 'Healthy' },
  yellow: { dot: 'bg-warning', label: 'Watch' },
  orange: { dot: 'bg-orange-500', label: 'Caution' },
  red: { dot: 'bg-danger', label: 'Burnout Risk' },
};

function daysSince(dateStr: string): number {
  const then = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

export function WeeklyReviewPanel({ latestReview }: WeeklyReviewPanelProps) {
  if (!latestReview) {
    return (
      <GlassCard className="flex flex-col items-center justify-center text-center min-h-[180px] gap-3">
        <p className="text-text-secondary text-sm">Ready for your first weekly review?</p>
        <Link href="/weekly-review" className="btn-primary text-sm !py-2 !px-4">
          Start Review
        </Link>
      </GlassCard>
    );
  }

  const burnout = burnoutStyle[latestReview.burnout_level];
  const daysAgo = daysSince(latestReview.week_of);

  return (
    <GlassCard className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold tracking-tight text-white">Weekly Review</h2>
        <Link
          href="/weekly-review"
          className="text-xs text-cyan-accent hover:text-cyan-accent/80 transition-colors"
        >
          View history
        </Link>
      </div>

      {/* Score */}
      {latestReview.score !== null && (
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-white">{latestReview.score}</span>
          <span className="text-sm text-text-secondary">/ 100</span>
        </div>
      )}

      {/* Burnout level */}
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${burnout.dot}`} />
        <span className="text-sm text-text-secondary">{burnout.label}</span>
      </div>

      {/* Top win / blocker */}
      <div className="space-y-2 text-sm">
        {latestReview.top_win && (
          <div>
            <span className="text-text-secondary">Win: </span>
            <span className="text-white">{latestReview.top_win}</span>
          </div>
        )}
        {latestReview.biggest_blocker && (
          <div>
            <span className="text-text-secondary">Blocker: </span>
            <span className="text-white">{latestReview.biggest_blocker}</span>
          </div>
        )}
      </div>

      {/* Days since */}
      <div className="pt-2 border-t border-glass-border text-xs text-text-secondary">
        {daysAgo === 0
          ? 'Reviewed today'
          : daysAgo === 1
            ? '1 day ago'
            : `${daysAgo} days ago`}
      </div>
    </GlassCard>
  );
}
