'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserGoal, LifeArea, KeyResult } from '@/types/lifeos';

interface GoalFormData {
  title: string;
  life_area: LifeArea | '';
  quarter: string;
  consequence_text: string;
  target_date: string;
  progress_pct: number;
}

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GoalFormData, keyResults: KeyResult[]) => void;
  goal?: UserGoal | null;
  consequenceFraming: boolean;
}

const lifeAreas: { value: LifeArea; label: string }[] = [
  { value: 'career', label: 'Career' },
  { value: 'finance', label: 'Finance' },
  { value: 'health', label: 'Health' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'personal_growth', label: 'Personal Growth' },
  { value: 'creativity', label: 'Creativity' },
  { value: 'community', label: 'Community' },
  { value: 'spirituality', label: 'Spirituality' },
];

function newKeyResult(): KeyResult {
  return {
    id: crypto.randomUUID(),
    title: '',
    target: 0,
    current: 0,
    unit: '',
  };
}

export function GoalModal({
  isOpen,
  onClose,
  onSubmit,
  goal,
  consequenceFraming,
}: GoalModalProps) {
  const isEditing = !!goal;
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<GoalFormData>({
    defaultValues: {
      title: '',
      life_area: '',
      quarter: '',
      consequence_text: '',
      target_date: '',
      progress_pct: 0,
    },
  });

  useEffect(() => {
    if (goal) {
      reset({
        title: goal.title,
        life_area: goal.life_area ?? '',
        quarter: goal.quarter ?? '',
        consequence_text: goal.consequence_text ?? '',
        target_date: goal.target_date ?? '',
        progress_pct: goal.progress_pct,
      });
      setKeyResults(goal.key_results ?? []);
    } else {
      reset({
        title: '',
        life_area: '',
        quarter: '',
        consequence_text: '',
        target_date: '',
        progress_pct: 0,
      });
      setKeyResults([]);
    }
  }, [goal, reset]);

  const updateKeyResult = (id: string, field: keyof KeyResult, value: string | number) => {
    setKeyResults((prev) =>
      prev.map((kr) => (kr.id === id ? { ...kr, [field]: value } : kr))
    );
  };

  const removeKeyResult = (id: string) => {
    setKeyResults((prev) => prev.filter((kr) => kr.id !== id));
  };

  // Auto-calculate progress from key results
  const autoProgress = keyResults.length > 0
    ? Math.round(
        keyResults.reduce((sum, kr) => {
          const pct = kr.target > 0 ? kr.current / kr.target : 0;
          return sum + Math.min(pct, 1);
        }, 0) / keyResults.length * 100
      )
    : undefined;

  const handleFormSubmit = (data: GoalFormData) => {
    const finalData = {
      ...data,
      progress_pct: autoProgress ?? data.progress_pct,
    };
    onSubmit(finalData, keyResults.filter((kr) => kr.title.trim()));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto glass-card custom-scrollbar"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label={isEditing ? `Edit ${goal?.title}` : 'Create goal'}
          >
            <h2 className="text-lg font-semibold tracking-tight text-white mb-4">
              {isEditing ? 'Edit Goal' : 'New Goal'}
            </h2>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="goal-title" className="block text-sm text-text-secondary mb-1">
                  Title <span className="text-danger">*</span>
                </label>
                <input
                  id="goal-title"
                  {...register('title', { required: 'Title is required' })}
                  className="input-field"
                  placeholder="What are you working toward?"
                />
                {errors.title && (
                  <p className="text-danger text-xs mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Life area + Quarter */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="goal-area" className="block text-sm text-text-secondary mb-1">
                    Life area
                  </label>
                  <select id="goal-area" {...register('life_area')} className="input-field">
                    <option value="">Select...</option>
                    {lifeAreas.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="goal-quarter" className="block text-sm text-text-secondary mb-1">
                    Quarter
                  </label>
                  <input
                    id="goal-quarter"
                    {...register('quarter')}
                    className="input-field"
                    placeholder="Q2 2026"
                  />
                </div>
              </div>

              {/* Consequence text */}
              {consequenceFraming && (
                <div>
                  <label htmlFor="goal-consequence" className="block text-sm text-text-secondary mb-1">
                    If I DON&apos;T do this...
                  </label>
                  <textarea
                    id="goal-consequence"
                    {...register('consequence_text')}
                    className="input-field resize-none"
                    rows={2}
                    placeholder="What happens if you don't follow through?"
                  />
                </div>
              )}

              {/* Target date */}
              <div>
                <label htmlFor="goal-target-date" className="block text-sm text-text-secondary mb-1">
                  Target date
                </label>
                <input
                  id="goal-target-date"
                  type="date"
                  {...register('target_date')}
                  className="input-field"
                />
              </div>

              {/* Key results */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-text-secondary">Key results</label>
                  <button
                    type="button"
                    onClick={() => setKeyResults((prev) => [...prev, newKeyResult()])}
                    className="text-xs text-cyan-accent hover:text-cyan-accent/80 transition-colors"
                  >
                    + Add
                  </button>
                </div>
                {keyResults.map((kr) => (
                  <div key={kr.id} className="flex gap-2 mb-2 items-start">
                    <input
                      type="text"
                      value={kr.title}
                      onChange={(e) => updateKeyResult(kr.id, 'title', e.target.value)}
                      className="input-field !py-1.5 text-sm flex-1"
                      placeholder="Key result"
                    />
                    <input
                      type="number"
                      value={kr.current}
                      onChange={(e) => updateKeyResult(kr.id, 'current', Number(e.target.value))}
                      className="input-field !py-1.5 text-sm w-16 text-center"
                      placeholder="Now"
                    />
                    <span className="text-text-secondary self-center text-sm">/</span>
                    <input
                      type="number"
                      value={kr.target}
                      onChange={(e) => updateKeyResult(kr.id, 'target', Number(e.target.value))}
                      className="input-field !py-1.5 text-sm w-16 text-center"
                      placeholder="Goal"
                    />
                    <input
                      type="text"
                      value={kr.unit}
                      onChange={(e) => updateKeyResult(kr.id, 'unit', e.target.value)}
                      className="input-field !py-1.5 text-sm w-16"
                      placeholder="unit"
                    />
                    <button
                      type="button"
                      onClick={() => removeKeyResult(kr.id)}
                      className="text-danger/60 hover:text-danger text-sm px-1 shrink-0"
                      aria-label="Remove key result"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Progress (manual if no key results) */}
              {keyResults.length === 0 && (
                <div>
                  <label className="block text-sm text-text-secondary mb-1">
                    Progress: {watch('progress_pct')}%
                  </label>
                  <input
                    type="range"
                    {...register('progress_pct', { valueAsNumber: true })}
                    className="w-full accent-cyan-accent"
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
              )}

              {autoProgress !== undefined && (
                <p className="text-xs text-text-secondary">
                  Auto-calculated progress: {autoProgress}%
                </p>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary text-sm !py-2 !px-4">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-sm !py-2 !px-4">
                  {isEditing ? 'Save' : 'Create Goal'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
