'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import { AuthGuard, GlassCard } from '@/components/lifeos';
import { getDISCQuestions, saveDISCResponses, saveDISCResult } from '@/lib/supabase';

interface DISCQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  trait_a: string;
  trait_b: string;
  trait_c: string;
  trait_d: string;
  question_order: number;
}

export default function DiscTestPage() {
  return (
    <AuthGuard>
      <DiscTestContent />
    </AuthGuard>
  );
}

function DiscTestContent() {
  const router = useRouter();
  const [questions, setQuestions] = useState<DISCQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [discResult, setDiscResult] = useState({
    dominance: 0,
    influence: 0,
    steadiness: 0,
    compliance: 0,
  });
  const [primaryStyle, setPrimaryStyle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const questionsData = await getDISCQuestions();
      const mappedQuestions = questionsData.map((q: any) => ({
        id: q.id,
        question: q.question_text,
        option_a: q.option_d,
        option_b: q.option_i,
        option_c: q.option_s,
        option_d: q.option_c,
        trait_a: 'D',
        trait_b: 'I',
        trait_c: 'S',
        trait_d: 'C',
        question_order: q.question_order,
      }));
      setQuestions(mappedQuestions);
    } catch (error) {
      console.error('Error loading DISC questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateDiscProfile();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const calculateDiscProfile = async () => {
    const counts = { D: 0, I: 0, S: 0, C: 0 };
    Object.values(answers).forEach((answer) => {
      if (answer in counts) counts[answer as keyof typeof counts]++;
    });

    const result = {
      dominance: Math.round((counts.D / questions.length) * 100),
      influence: Math.round((counts.I / questions.length) * 100),
      steadiness: Math.round((counts.S / questions.length) * 100),
      compliance: Math.round((counts.C / questions.length) * 100),
    };

    const scoreList = [
      { trait: 'D', score: result.dominance },
      { trait: 'I', score: result.influence },
      { trait: 'S', score: result.steadiness },
      { trait: 'C', score: result.compliance },
    ].sort((a, b) => b.score - a.score);
    const styleDigraph = scoreList[0].trait + scoreList[1].trait;

    setDiscResult(result);
    setPrimaryStyle(styleDigraph);

    // Attempt save. Do NOT flip isCompleted until the save succeeds.
    setSaving(true);
    setSaveError(null);
    try {
      const responses = Object.entries(answers).map(([questionId, selectedTrait]) => ({
        question_id: questionId,
        selected_trait: selectedTrait,
      }));
      await saveDISCResponses({ responses });
      await saveDISCResult({
        result: {
          ...result,
          primary_style: scoreList[0].trait,
          secondary_style: scoreList[1].trait,
        },
      });
      localStorage.setItem('discResult', JSON.stringify(result));
      setIsCompleted(true);
    } catch (error: any) {
      console.error('DISC save failed:', error);
      setSaveError(error?.message || 'Unknown error while saving assessment');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = () => {
    router.push('/dashboard');
  };

  const handleRetrySave = () => {
    calculateDiscProfile();
  };

  const handleContinueAnyway = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">DISC Assessment</h1>
        <p className="text-sm text-text-secondary mb-6">Loading questions&hellip;</p>
        <GlassCard className="flex items-center justify-center py-16">
          <div className="spinner h-8 w-8" />
        </GlassCard>
      </main>
    );
  }

  if (!questions.length) {
    return (
      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">DISC Assessment</h1>
        <p className="text-sm text-text-secondary mb-6">30 questions &middot; ~5 minutes</p>
        <GlassCard className="text-center py-10">
          <p className="text-sm text-text-secondary">No questions available yet. Try again later.</p>
        </GlassCard>
      </main>
    );
  }

  if (saving) {
    return (
      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">DISC Assessment</h1>
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
          <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">DISC Assessment</h1>
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
    const traitLabels: Record<string, string> = { D: 'Dominance', I: 'Influence', S: 'Steadiness', C: 'Compliance' };
    return (
      <main className="max-w-lg mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">DISC Assessment</h1>
          <p className="text-sm text-text-secondary mb-6">Complete.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
          <GlassCard glow="cyan" className="text-center py-8 mb-4">
            <span className="text-4xl block mb-3">&#x2713;</span>
            <p className="text-sm text-text-secondary mb-1">Your DISC style</p>
            <p className="text-4xl font-semibold tracking-tight text-cyan-accent mb-2">{primaryStyle}</p>
            <p className="text-xs text-text-secondary">
              Primary: {traitLabels[primaryStyle[0]]} &middot; Secondary: {traitLabels[primaryStyle[1]]}
            </p>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <GlassCard className="mb-5">
            <div className="space-y-4">
              {Object.entries(discResult).map(([dimension, value]) => {
                const traitLetter = dimension[0].toUpperCase();
                return (
                  <div key={dimension} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-white capitalize">{dimension}</span>
                      <span className="text-cyan-accent">{Math.round(value)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-cyan-accent rounded-full transition-all duration-500"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <button onClick={handleComplete} className="btn-primary w-full text-sm !py-2.5">
            Continue to Dashboard
          </button>
        </motion.div>
      </main>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const selected = answers[currentQ.id];

  const options = [
    { text: currentQ.option_a, value: currentQ.trait_a },
    { text: currentQ.option_b, value: currentQ.trait_b },
    { text: currentQ.option_c, value: currentQ.trait_c },
    { text: currentQ.option_d, value: currentQ.trait_d },
  ];

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">DISC Assessment</h1>
        <p className="text-sm text-text-secondary mb-6">30 questions &middot; ~5 minutes</p>
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
              {currentQ.question}
            </h2>
            <p className="text-xs text-text-secondary mb-5">Select the option that best describes you.</p>

            <div className="space-y-3">
              {options.map((option, index) => (
                <OptionButton
                  key={index}
                  label={option.text}
                  selected={selected === option.value}
                  onClick={() => handleAnswer(currentQ.id, option.value)}
                />
              ))}
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
