'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import type { DailyCheckIn } from '@/types/lifeos';

interface CheckInHistoryProps {
  recentCheckins: DailyCheckIn[];
}

function getLast7Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function computeStreak(checkins: DailyCheckIn[]): number {
  const dates = new Set(checkins.map((c) => c.date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (dates.has(d.toISOString().split('T')[0])) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CheckInHistory({ recentCheckins }: CheckInHistoryProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const days = getLast7Days();
  const checkinMap = new Map(recentCheckins.map((c) => [c.date, c]));
  const streak = computeStreak(recentCheckins);

  const selected = selectedDate ? checkinMap.get(selectedDate) : null;

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-text-secondary">Last 7 days</h3>
          <span className="text-sm text-white font-medium">
            {streak > 0 ? `${streak}-day streak` : 'No streak yet'}
          </span>
        </div>

        <div className="flex justify-between gap-1">
          {days.map((date) => {
            const hasCheckin = checkinMap.has(date);
            const d = new Date(date + 'T00:00:00');
            const isToday = date === days[days.length - 1];
            const isSelected = selectedDate === date;

            return (
              <button
                key={date}
                onClick={() => setSelectedDate(isSelected ? null : date)}
                className="flex flex-col items-center gap-1"
                aria-label={`${dayLabels[d.getDay()]} ${date}${hasCheckin ? ' - checked in' : ''}`}
              >
                <span className="text-[10px] text-text-secondary">
                  {dayLabels[d.getDay()]}
                </span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all text-xs ${
                    isSelected
                      ? 'ring-2 ring-cyan-accent'
                      : ''
                  } ${
                    hasCheckin
                      ? 'bg-cyan-accent/20 border border-cyan-accent/40 text-cyan-accent'
                      : isToday
                        ? 'bg-white/10 border border-glass-border-hover text-text-secondary'
                        : 'bg-white/5 border border-glass-border text-text-secondary/40'
                  }`}
                >
                  {hasCheckin ? '✓' : d.getDate()}
                </div>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Selected day detail */}
      {selected && (
        <GlassCard>
          <h4 className="text-sm font-medium text-white mb-3">
            {new Date(selected.date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-text-secondary text-xs">Energy</span>
              <p className="text-white">{selected.energy_level ?? '—'}/5</p>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-text-secondary text-xs">Stress</span>
              <p className="text-white">{selected.stress_level ?? '—'}/5</p>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-text-secondary text-xs">Sleep</span>
              <p className="text-white">{selected.sleep_hours ?? '—'}h</p>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-text-secondary text-xs">Exercise</span>
              <p className="text-white">{selected.exercise ? '✓ Yes' : '✗ No'}</p>
            </div>
          </div>
          {selected.top_win && (
            <p className="text-sm mt-3">
              <span className="text-text-secondary">Win: </span>
              <span className="text-white">{selected.top_win}</span>
            </p>
          )}
          {selected.biggest_blocker && (
            <p className="text-sm mt-1">
              <span className="text-text-secondary">Blocker: </span>
              <span className="text-white">{selected.biggest_blocker}</span>
            </p>
          )}
        </GlassCard>
      )}
    </div>
  );
}
