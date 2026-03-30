'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { ReviewScore, computeScore, computeBurnout } from './ReviewScore';
import type { BurnoutLevel } from '@/types/lifeos';

interface ReviewWizardProps {
  defaultWipRespected: boolean;
  onSubmit: (data: ReviewData) => void;
  submitting: boolean;
}

export interface ReviewData {
  wip_respected: boolean;
  exercise_days: number;
  avg_sleep: number;
  tasks_completed: number;
  top_win: string;
  biggest_blocker: string;
  next_priorities: string[];
  score: number;
  burnout_level: BurnoutLevel;
}

const TOTAL_STEPS = 6;

export function ReviewWizard({ defaultWipRespected, onSubmit, submitting }: ReviewWizardProps) {
  const [step, setStep] = useState(0);

  // Form state
  const [wipRespected, setWipRespected] = useState(defaultWipRespected);
  const [exerciseDays, setExerciseDays] = useState(3);
  const [avgSleep, setAvgSleep] = useState(7);
  const [stressTrend, setStressTrend] = useState<'better' | 'same' | 'worse'>('same');
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [topWin, setTopWin] = useState('');
  const [blocker, setBlocker] = useState('');
  const [priorities, setPriorities] = useState<string[]>(['', '', '']);

  const score = computeScore({
    wipRespected,
    exerciseDays,
    avgSleep,
    tasksCompleted,
    topWin,
    nextPriorities: priorities,
  });

  const burnoutLevel = computeBurnout(exerciseDays, avgSleep);

  const updatePriority = (index: number, value: string) => {
    setPriorities((prev) => prev.map((p, i) => (i === index ? value : p)));
  };

  const addPriority = () => {
    if (priorities.length < 5) setPriorities((prev) => [...prev, '']);
  };

  const handleSubmit = () => {
    onSubmit({
      wip_respected: wipRespected,
      exercise_days: exerciseDays,
      avg_sleep: avgSleep,
      tasks_completed: tasksCompleted,
      top_win: topWin,
      biggest_blocker: blocker,
      next_priorities: priorities.filter((p) => p.trim()),
      score,
      burnout_level: burnoutLevel,
    });
  };

  const slideVariants = {
    enter: { x: 60, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -60, opacity: 0 },
  };

  const steps = [
    // Step 1: WIP
    <GlassCard key="wip">
      <h3 className="text-lg font-semibold text-white mb-4">How was your week?</h3>
      <div>
        <p className="text-sm text-text-secondary mb-3">
          Did you respect your WIP limit?
        </p>
        <div className="flex gap-3">
          {[true, false].map((val) => (
            <button
              key={String(val)}
              type="button"
              onClick={() => setWipRespected(val)}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                wipRespected === val
                  ? val
                    ? 'bg-success/20 border border-success/40 text-success'
                    : 'bg-danger/20 border border-danger/40 text-danger'
                  : 'bg-white/5 border border-glass-border text-text-secondary hover:bg-white/10'
              }`}
            >
              {val ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
      </div>
    </GlassCard>,

    // Step 2: Health
    <GlassCard key="health">
      <h3 className="text-lg font-semibold text-white mb-4">Health check</h3>
      <div className="space-y-5">
        <div>
          <label className="block text-sm text-text-secondary mb-2">
            Exercise days this week
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExerciseDays(Math.max(0, exerciseDays - 1))}
              className="w-9 h-9 rounded-lg bg-white/5 border border-glass-border text-white hover:bg-white/10 transition-colors text-lg"
            >
              −
            </button>
            <span className="text-white text-lg font-medium w-8 text-center">{exerciseDays}</span>
            <button
              type="button"
              onClick={() => setExerciseDays(Math.min(7, exerciseDays + 1))}
              className="w-9 h-9 rounded-lg bg-white/5 border border-glass-border text-white hover:bg-white/10 transition-colors text-lg"
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="avg-sleep" className="block text-sm text-text-secondary mb-2">
            Average sleep (hours)
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAvgSleep(Math.max(0, avgSleep - 0.5))}
              className="w-9 h-9 rounded-lg bg-white/5 border border-glass-border text-white hover:bg-white/10 transition-colors text-lg"
            >
              −
            </button>
            <input
              id="avg-sleep"
              type="number"
              value={avgSleep}
              onChange={(e) => setAvgSleep(Number(e.target.value))}
              step={0.5}
              min={0}
              max={14}
              className="input-field !py-2 text-center w-20"
            />
            <button
              type="button"
              onClick={() => setAvgSleep(Math.min(14, avgSleep + 0.5))}
              className="w-9 h-9 rounded-lg bg-white/5 border border-glass-border text-white hover:bg-white/10 transition-colors text-lg"
            >
              +
            </button>
          </div>
        </div>
        <div>
          <p className="text-sm text-text-secondary mb-2">Stress trend</p>
          <div className="flex gap-2">
            {(['better', 'same', 'worse'] as const).map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setStressTrend(val)}
                className={`flex-1 py-2 rounded-lg text-sm capitalize transition-all ${
                  stressTrend === val
                    ? 'bg-cyan-accent/20 border border-cyan-accent/40 text-cyan-accent'
                    : 'bg-white/5 border border-glass-border text-text-secondary hover:bg-white/10'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>,

    // Step 3: Wins
    <GlassCard key="wins">
      <h3 className="text-lg font-semibold text-white mb-4">Wins</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="top-win" className="block text-sm text-text-secondary mb-1">
            Top win this week
          </label>
          <input
            id="top-win"
            type="text"
            value={topWin}
            onChange={(e) => setTopWin(e.target.value)}
            className="input-field"
            placeholder="What went well?"
          />
        </div>
        <div>
          <label htmlFor="tasks-done" className="block text-sm text-text-secondary mb-2">
            Tasks completed
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTasksCompleted(Math.max(0, tasksCompleted - 1))}
              className="w-9 h-9 rounded-lg bg-white/5 border border-glass-border text-white hover:bg-white/10 transition-colors text-lg"
            >
              −
            </button>
            <input
              id="tasks-done"
              type="number"
              value={tasksCompleted}
              onChange={(e) => setTasksCompleted(Number(e.target.value))}
              min={0}
              className="input-field !py-2 text-center w-20"
            />
            <button
              type="button"
              onClick={() => setTasksCompleted(tasksCompleted + 1)}
              className="w-9 h-9 rounded-lg bg-white/5 border border-glass-border text-white hover:bg-white/10 transition-colors text-lg"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </GlassCard>,

    // Step 4: Blockers
    <GlassCard key="blockers">
      <h3 className="text-lg font-semibold text-white mb-4">Blockers</h3>
      <div>
        <label htmlFor="blocker" className="block text-sm text-text-secondary mb-1">
          Biggest blocker this week
        </label>
        <input
          id="blocker"
          type="text"
          value={blocker}
          onChange={(e) => setBlocker(e.target.value)}
          className="input-field"
          placeholder="What got in the way?"
        />
      </div>
    </GlassCard>,

    // Step 5: Next week
    <GlassCard key="next">
      <h3 className="text-lg font-semibold text-white mb-4">Next week</h3>
      <div className="space-y-2">
        <label className="block text-sm text-text-secondary mb-1">
          Top priorities (up to 5)
        </label>
        {priorities.map((p, i) => (
          <input
            key={i}
            type="text"
            value={p}
            onChange={(e) => updatePriority(i, e.target.value)}
            className="input-field !py-2 text-sm"
            placeholder={`Priority ${i + 1}`}
          />
        ))}
        {priorities.length < 5 && (
          <button
            type="button"
            onClick={addPriority}
            className="text-xs text-cyan-accent hover:text-cyan-accent/80 transition-colors"
          >
            + Add another
          </button>
        )}
      </div>
    </GlassCard>,

    // Step 6: Summary
    <GlassCard key="summary">
      <h3 className="text-lg font-semibold text-white mb-4">Your week in review</h3>
      <div className="space-y-4">
        <ReviewScore score={score} burnoutLevel={burnoutLevel} />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-2.5 rounded-lg bg-white/5">
            <span className="text-text-secondary text-xs">WIP respected</span>
            <p className="text-white">{wipRespected ? 'Yes' : 'No'}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white/5">
            <span className="text-text-secondary text-xs">Exercise</span>
            <p className="text-white">{exerciseDays} days</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white/5">
            <span className="text-text-secondary text-xs">Avg sleep</span>
            <p className="text-white">{avgSleep}h</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white/5">
            <span className="text-text-secondary text-xs">Tasks done</span>
            <p className="text-white">{tasksCompleted}</p>
          </div>
        </div>

        {topWin && (
          <p className="text-sm">
            <span className="text-text-secondary">Win: </span>
            <span className="text-white">{topWin}</span>
          </p>
        )}
        {blocker && (
          <p className="text-sm">
            <span className="text-text-secondary">Blocker: </span>
            <span className="text-white">{blocker}</span>
          </p>
        )}
        {priorities.filter((p) => p.trim()).length > 0 && (
          <div>
            <p className="text-sm text-text-secondary mb-1">Next priorities:</p>
            <ul className="space-y-1">
              {priorities
                .filter((p) => p.trim())
                .map((p, i) => (
                  <li key={i} className="text-sm text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-accent shrink-0" />
                    {p}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </GlassCard>,
  ];

  return (
    <div>
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-6">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === step
                ? 'bg-cyan-accent'
                : i < step
                  ? 'bg-cyan-accent/40'
                  : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          {steps[step]}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="btn-secondary text-sm !py-2 !px-4 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Back
        </button>

        {step < TOTAL_STEPS - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="btn-primary text-sm !py-2 !px-4"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary text-sm !py-2 !px-4 disabled:opacity-40"
          >
            {submitting ? 'Saving...' : 'Submit Review'}
          </button>
        )}
      </div>
    </div>
  );
}
