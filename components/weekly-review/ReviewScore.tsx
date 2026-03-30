'use client';

import type { BurnoutLevel } from '@/types/lifeos';

interface ReviewScoreProps {
  score: number;
  burnoutLevel: BurnoutLevel;
}

const burnoutStyle: Record<BurnoutLevel, { color: string; label: string }> = {
  green: { color: 'text-success', label: 'Healthy' },
  yellow: { color: 'text-warning', label: 'Watch' },
  orange: { color: 'text-orange-500', label: 'Caution' },
  red: { color: 'text-danger', label: 'Burnout Risk' },
};

export function computeScore(data: {
  wipRespected: boolean;
  exerciseDays: number;
  avgSleep: number;
  tasksCompleted: number;
  topWin: string;
  nextPriorities: string[];
}): number {
  let score = 0;
  if (data.wipRespected) score += 20;
  score += Math.min(data.exerciseDays * 5, 25);
  if (data.avgSleep >= 7) score += 20;
  else if (data.avgSleep >= 6) score += 10;
  score += Math.min(data.tasksCompleted * 3, 20);
  if (data.topWin.trim()) score += 10;
  if (data.nextPriorities.filter((p) => p.trim()).length >= 3) score += 5;
  return score;
}

export function computeBurnout(exerciseDays: number, avgSleep: number): BurnoutLevel {
  if (avgSleep < 6 && exerciseDays <= 1) return 'red';
  if (avgSleep < 7 && exerciseDays <= 2) return 'orange';
  if (avgSleep < 7 || exerciseDays <= 2) return 'yellow';
  return 'green';
}

export function ReviewScore({ score, burnoutLevel }: ReviewScoreProps) {
  const burnout = burnoutStyle[burnoutLevel];
  const scoreColor =
    score >= 70 ? 'text-success' : score >= 40 ? 'text-warning' : 'text-danger';

  return (
    <div className="flex items-center gap-6">
      <div className="text-center">
        <p className={`text-4xl font-semibold ${scoreColor}`}>{score}</p>
        <p className="text-xs text-text-secondary">/100</p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            burnoutLevel === 'green'
              ? 'bg-success'
              : burnoutLevel === 'yellow'
                ? 'bg-warning'
                : burnoutLevel === 'orange'
                  ? 'bg-orange-500'
                  : 'bg-danger'
          }`}
        />
        <span className={`text-sm ${burnout.color}`}>{burnout.label}</span>
      </div>
    </div>
  );
}
