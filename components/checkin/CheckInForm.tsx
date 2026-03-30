'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import type { DailyCheckIn } from '@/types/lifeos';

interface CheckInFormProps {
  existing: DailyCheckIn | null;
  onSubmit: (data: CheckInFormData) => void;
  submitting: boolean;
}

export interface CheckInFormData {
  energy_level: number;
  stress_level: number;
  sleep_hours: number;
  exercise: boolean;
  top_win: string;
  biggest_blocker: string;
  mood_note: string;
}

const energyEmojis = ['😴', '😐', '🙂', '😊', '⚡'];
const stressEmojis = ['😌', '🙂', '😐', '😰', '🤯'];

function EmojiRow({
  label,
  emojis,
  value,
  onChange,
}: {
  label: string;
  emojis: string[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-text-secondary mb-2">{label}</label>
      <div className="flex gap-2" role="radiogroup" aria-label={label}>
        {emojis.map((emoji, i) => {
          const level = i + 1;
          const selected = value === level;
          return (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${label} ${level} of 5`}
              onClick={() => onChange(level)}
              className={`w-10 h-10 rounded-lg text-lg flex items-center justify-center transition-all ${
                selected
                  ? 'bg-cyan-accent/20 border border-cyan-accent/50 scale-110'
                  : 'bg-white/5 border border-glass-border hover:bg-white/10'
              }`}
            >
              {emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CheckInForm({ existing, onSubmit, submitting }: CheckInFormProps) {
  const [energy, setEnergy] = useState(existing?.energy_level ?? 3);
  const [stress, setStress] = useState(existing?.stress_level ?? 2);
  const [sleep, setSleep] = useState(existing?.sleep_hours ?? 7);
  const [exercise, setExercise] = useState(existing?.exercise ?? false);
  const [topWin, setTopWin] = useState(existing?.top_win ?? '');
  const [blocker, setBlocker] = useState(existing?.biggest_blocker ?? '');
  const [mood, setMood] = useState(existing?.mood_note ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      energy_level: energy,
      stress_level: stress,
      sleep_hours: sleep,
      exercise,
      top_win: topWin,
      biggest_blocker: blocker,
      mood_note: mood,
    });
  };

  return (
    <GlassCard>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Energy + Stress row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <EmojiRow label="Energy" emojis={energyEmojis} value={energy} onChange={setEnergy} />
          <EmojiRow label="Stress" emojis={stressEmojis} value={stress} onChange={setStress} />
        </div>

        {/* Sleep + Exercise row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="sleep" className="block text-sm text-text-secondary mb-2">
              Sleep (hours)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSleep(Math.max(0, sleep - 0.5))}
                className="w-9 h-9 rounded-lg bg-white/5 border border-glass-border text-white hover:bg-white/10 transition-colors text-lg"
                aria-label="Decrease sleep"
              >
                −
              </button>
              <input
                id="sleep"
                type="number"
                value={sleep}
                onChange={(e) => setSleep(Number(e.target.value))}
                step={0.5}
                min={0}
                max={16}
                className="input-field !py-2 text-center w-20"
              />
              <button
                type="button"
                onClick={() => setSleep(Math.min(16, sleep + 0.5))}
                className="w-9 h-9 rounded-lg bg-white/5 border border-glass-border text-white hover:bg-white/10 transition-colors text-lg"
                aria-label="Increase sleep"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Exercise</label>
            <button
              type="button"
              onClick={() => setExercise(!exercise)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                exercise
                  ? 'bg-success/20 border border-success/40 text-success'
                  : 'bg-white/5 border border-glass-border text-text-secondary hover:bg-white/10'
              }`}
              role="switch"
              aria-checked={exercise}
              aria-label="Exercise today"
            >
              {exercise ? '✓ Yes' : 'No'}
            </button>
          </div>
        </div>

        {/* Text fields */}
        <div>
          <label htmlFor="top-win" className="block text-sm text-text-secondary mb-1">
            Top win
          </label>
          <input
            id="top-win"
            type="text"
            value={topWin}
            onChange={(e) => setTopWin(e.target.value)}
            className="input-field !py-2 text-sm"
            placeholder="Best thing today..."
          />
        </div>

        <div>
          <label htmlFor="blocker" className="block text-sm text-text-secondary mb-1">
            Biggest blocker
          </label>
          <input
            id="blocker"
            type="text"
            value={blocker}
            onChange={(e) => setBlocker(e.target.value)}
            className="input-field !py-2 text-sm"
            placeholder="What's in the way?"
          />
        </div>

        <div>
          <label htmlFor="mood" className="block text-sm text-text-secondary mb-1">
            Mood note <span className="text-text-secondary/60">(optional)</span>
          </label>
          <input
            id="mood"
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="input-field !py-2 text-sm"
            placeholder="Anything else?"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full text-sm !py-2.5 disabled:opacity-40"
        >
          {submitting ? 'Saving...' : existing ? 'Update Check-in' : 'Check in'}
        </button>
      </form>
    </GlassCard>
  );
}
