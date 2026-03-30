'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { ForcedChoiceSlider } from './ForcedChoiceSlider';
import type { Big5Question } from '@/types/lifeos';

export interface QuizResponse {
  questionId: string;
  trait: string;
  value: number;
  weight: number;
}

interface Big5QuizProps {
  questions: Big5Question[];
  onComplete: (responses: QuizResponse[]) => void;
}

export function Big5Quiz({ questions, onComplete }: Big5QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  const current = questions[currentIndex];
  const total = questions.length;
  const progress = ((currentIndex + 1) / total) * 100;
  const currentValue = responses[current.id] ?? 4; // default neutral

  const handleSliderChange = (value: number) => {
    setResponses((prev) => ({ ...prev, [current.id]: value }));
  };

  const goNext = () => {
    // Save default if user didn't touch slider
    if (responses[current.id] === undefined) {
      setResponses((prev) => ({ ...prev, [current.id]: 4 }));
    }

    if (currentIndex < total - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    } else {
      // Build final responses array
      const finalResponses: QuizResponse[] = questions.map((q) => ({
        questionId: q.id,
        trait: q.trait,
        value: responses[q.id] ?? 4,
        weight: q.weight,
      }));
      onComplete(finalResponses);
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 text-sm text-text-secondary">
          <span>Question {currentIndex + 1} of {total}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-cyan-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          <GlassCard>
            <p className="text-lg font-semibold tracking-tight text-white mb-2">
              {current.question_text}
            </p>
            <p className="text-sm text-text-secondary mb-6">
              Which describes you better? Slide toward your answer.
            </p>

            <ForcedChoiceSlider
              poleA={current.pole_a}
              poleB={current.pole_b}
              value={currentValue}
              onChange={handleSliderChange}
            />
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={goBack}
          disabled={currentIndex === 0}
          className="btn-secondary text-sm !py-2 !px-4 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous question"
        >
          Back
        </button>
        <button
          onClick={goNext}
          className="btn-primary text-sm !py-2 !px-4"
          aria-label={currentIndex === total - 1 ? 'Submit assessment' : 'Next question'}
        >
          {currentIndex === total - 1 ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  );
}
