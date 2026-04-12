'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import { AuthGuard, GlassCard } from '@/components/lifeos';
import { getMBTIQuestions, saveMBTIResponses, saveMBTIResult } from '@/lib/supabase';

export default function MbtiTestPage() {
  return (
    <AuthGuard>
      <MbtiTestContent />
    </AuthGuard>
  );
}

function MbtiTestContent() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [mbtiResult, setMbtiResult] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      try {
        const data = await getMBTIQuestions();
        setQuestions(data ?? []);
      } catch (error) {
        console.error('Failed to load MBTI questions:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateMbtiType();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const calculateMbtiType = async () => {
    // Route each answer through its dimension so 'T' in TF (Thinking)
    // doesn't collide with 'T' in TA (Turbulent).
    const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0, Turbulent: 0, Assertive: 0 };
    for (const q of questions) {
      const answer = answers[q.id];
      if (!answer) continue;
      switch (q.dimension) {
        case 'EI': answer === 'E' ? counts.E++ : counts.I++; break;
        case 'SN': answer === 'S' ? counts.S++ : counts.N++; break;
        case 'TF': answer === 'T' ? counts.T++ : counts.F++; break;
        case 'JP': answer === 'J' ? counts.J++ : counts.P++; break;
        case 'TA': answer === 'T' ? counts.Turbulent++ : counts.Assertive++; break;
      }
    }
    const core = [
      counts.E >= counts.I ? 'E' : 'I',
      counts.S >= counts.N ? 'S' : 'N',
      counts.T >= counts.F ? 'T' : 'F',
      counts.J >= counts.P ? 'J' : 'P',
    ].join('');
    const ta = counts.Turbulent + counts.Assertive > 0
      ? (counts.Turbulent >= counts.Assertive ? '-T' : '-A')
      : '';
    const type = core + ta;
    setMbtiResult(type);

    // Attempt save. Do NOT flip isCompleted until the save succeeds.
    setSaving(true);
    setSaveError(null);
    try {
      await saveMBTIResponses({
        responses: questions
          .filter((q) => answers[q.id])
          .map((q) => ({ question_id: q.id, selected_trait: answers[q.id] })),
      });
      await saveMBTIResult({
        result: {
          e: counts.E, i: counts.I, s: counts.S, n: counts.N,
          t: counts.T, f: counts.F, j: counts.J, p: counts.P,
          turbulent: counts.Turbulent, assertive: counts.Assertive,
          mbti_type: type,
        },
      });
      setIsCompleted(true);
    } catch (error: any) {
      console.error('MBTI save failed:', error);
      setSaveError(error?.message || 'Unknown error while saving assessment');
    } finally {
      setSaving(false);
    }
  };

  const handleRetrySave = () => {
    calculateMbtiType();
  };

  const handleContinueAnyway = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <main className="max-w-lg mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">MBTI Assessment</h1>
          <p className="text-sm text-text-secondary mb-6">Loading questions&hellip;</p>
          <GlassCard className="flex items-center justify-center py-16">
            <div className="spinner h-8 w-8" />
          </GlassCard>
        </motion.div>
      </main>
    );
  }

  if (!questions.length) {
    return (
      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">MBTI Assessment</h1>
        <p className="text-sm text-text-secondary mb-6">73 questions &middot; ~10 minutes</p>
        <GlassCard className="text-center py-10">
          <p className="text-sm text-text-secondary">No questions available yet. Try again later.</p>
        </GlassCard>
      </main>
    );
  }

  if (saving) {
    return (
      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">MBTI Assessment</h1>
        <p className="text-sm text-text-secondary mb-6">Saving your results&hellip;</p>
        <GlassCard className="flex items-center justify-center py-16">
          <div className="spinner h-8 w-8" />
        </GlassCard>
      </main>
    );
  }

  if (saveError) {
    return (
      <main className="max-w-lg mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">MBTI Assessment</h1>
          <p className="text-sm text-text-secondary mb-6">Save failed.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
          <GlassCard className="border-danger/40 py-8">
            <p className="text-sm font-semibold text-danger mb-2">Couldn&apos;t save your assessment</p>
            <p className="text-xs text-text-secondary mb-4 break-words">{saveError}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleRetrySave} className="btn-primary text-sm !py-2.5 !px-5 flex-1">
                Try Again
              </button>
              <button onClick={handleContinueAnyway} className="btn-secondary text-sm !py-2.5 !px-5 flex-1">
                Continue Anyway
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </main>
    );
  }

  if (isCompleted) {
    return (
      <main className="max-w-lg mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">MBTI Assessment</h1>
          <p className="text-sm text-text-secondary mb-6">Complete.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
          <GlassCard glow="cyan" className="text-center py-10">
            <span className="text-4xl block mb-3">&#x2713;</span>
            <p className="text-sm text-text-secondary mb-1">Your MBTI type</p>
            <p className="text-4xl font-semibold tracking-tight text-cyan-accent mb-6">{mbtiResult}</p>
            <p className="text-xs text-text-secondary mb-6">
              Saved to your profile. Your LifeOS configuration will adapt accordingly.
            </p>
            <button onClick={() => router.push('/dashboard')} className="btn-primary text-sm !py-2.5 !px-6">
              Continue to Dashboard
            </button>
          </GlassCard>
        </motion.div>
      </main>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const selected = answers[currentQ.id];

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">MBTI Assessment</h1>
        <p className="text-sm text-text-secondary mb-6">73 questions &middot; ~10 minutes</p>
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-5"
      >
        <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div
          className="h-1.5 rounded-full bg-white/10 overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-cyan-accent rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </motion.div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <GlassCard>
            <h2 className="text-lg font-semibold tracking-tight text-white mb-1">
              {currentQ.question_text}
            </h2>
            <p className="text-xs text-text-secondary mb-5">Select the option that best describes you.</p>

            <div className="space-y-3">
              <OptionButton
                label={currentQ.option_a}
                selected={selected === currentQ.option_a_type}
                onClick={() => handleAnswer(currentQ.id, currentQ.option_a_type)}
              />
              <OptionButton
                label={currentQ.option_b}
                selected={selected === currentQ.option_b_type}
                onClick={() => handleAnswer(currentQ.id, currentQ.option_b_type)}
              />
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      {/* Nav buttons */}
      <div className="flex items-center justify-between gap-3 mt-5">
        <button
          onClick={handleBack}
          disabled={currentQuestion === 0}
          className="btn-secondary text-sm !py-2.5 !px-5 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!selected}
          className="btn-primary text-sm !py-2.5 !px-5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </main>
  );
}

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full text-left px-4 py-4 rounded-xl border transition-all min-h-[56px] ${
        selected
          ? 'border-cyan-accent/60 bg-cyan-accent/15 text-cyan-accent shadow-[0_0_20px_rgba(0,212,255,0.15)]'
          : 'border-glass-border bg-white/5 text-white hover:bg-white/8 hover:border-glass-border-hover'
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
            selected ? 'border-cyan-accent bg-cyan-accent' : 'border-white/30'
          }`}
        >
          {selected && <span className="w-1.5 h-1.5 rounded-full bg-dark-bg" />}
        </span>
        <span className="text-sm leading-relaxed">{label}</span>
      </div>
    </button>
  );
}
