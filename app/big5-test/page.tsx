'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { generateSystemConfig, getProfileSettings } from '@/lib/personality-config';
import { GlassCard } from '@/components/ui/GlassCard';
import { Big5Quiz, type QuizResponse } from '@/components/big5/Big5Quiz';
import { Big5Results } from '@/components/big5/Big5Results';
import type { Big5Question, Big5Trait, SystemConfig } from '@/types/lifeos';
import toast from 'react-hot-toast';

type Phase = 'intro' | 'quiz' | 'processing' | 'results';

interface TraitScores {
  neuroticism: number;
  conscientiousness: number;
  agreeableness: number;
  extraversion: number;
  openness: number;
}

function scoreTrait(responses: { value: number; weight: number }[]): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const r of responses) {
    const inverted = 8 - r.value; // 1→7 (HIGH), 7→1 (LOW)
    const normalized = ((inverted - 1) / 6) * 100; // 0-100
    weightedSum += normalized * r.weight;
    totalWeight += r.weight;
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 50;
}

function computeScores(responses: QuizResponse[]): TraitScores {
  const traits: Big5Trait[] = ['neuroticism', 'conscientiousness', 'agreeableness', 'extraversion', 'openness'];
  const scores = {} as TraitScores;

  for (const trait of traits) {
    const traitResponses = responses
      .filter((r) => r.trait === trait)
      .map((r) => ({ value: r.value, weight: r.weight }));
    scores[trait] = scoreTrait(traitResponses);
  }

  return scores;
}

export default function Big5TestPage() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [questions, setQuestions] = useState<Big5Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<TraitScores | null>(null);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      const { data, error } = await supabase
        .from('big5_questions')
        .select('*')
        .order('question_order', { ascending: true });

      if (error) {
        toast.error('Failed to load questions');
      } else if (data) {
        setQuestions(data as Big5Question[]);
      }
      setLoading(false);
    }
    init();
  }, []);

  const handleQuizComplete = async (responses: QuizResponse[]) => {
    setPhase('processing');

    const computed = computeScores(responses);
    setScores(computed);

    if (!userId) {
      toast.error('Not authenticated');
      setPhase('results');
      return;
    }

    try {
      // Save individual responses
      await supabase.from('user_responses').insert(
        responses.map((r) => ({
          user_id: userId,
          question_id: r.questionId,
          test_type: 'big5',
          selected_trait: `${r.trait}:${r.value}`,
          created_at: new Date().toISOString(),
        }))
      );

      // Save computed results
      await supabase.from('big5_results').upsert(
        {
          user_id: userId,
          neuroticism: computed.neuroticism,
          conscientiousness: computed.conscientiousness,
          agreeableness: computed.agreeableness,
          extraversion: computed.extraversion,
          openness: computed.openness,
        },
        { onConflict: 'user_id' }
      );

      // Fetch existing DISC + MBTI results to combine
      const [discRes, mbtiRes] = await Promise.all([
        supabase
          .from('disc_results')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from('mbti_results')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
      ]);

      const disc = discRes.data;
      const mbti = mbtiRes.data;

      // Build profile input with defaults for missing assessments
      const profileInput = {
        disc: {
          d: disc?.dominance ?? 50,
          i: disc?.influence ?? 50,
          s: disc?.steadiness ?? 50,
          c: disc?.compliance ?? 50,
        },
        mbti: mbti?.mbti_type ?? 'INTP',
        big5: computed,
      };

      const config = generateSystemConfig(profileInput);
      const settings = getProfileSettings(profileInput);
      setSystemConfig(config);

      // Save to personality_profiles
      await supabase.from('personality_profiles').upsert(
        {
          user_id: userId,
          disc_d: profileInput.disc.d,
          disc_i: profileInput.disc.i,
          disc_s: profileInput.disc.s,
          disc_c: profileInput.disc.c,
          mbti_type: profileInput.mbti,
          big5_neuroticism: computed.neuroticism,
          big5_conscientiousness: computed.conscientiousness,
          big5_agreeableness: computed.agreeableness,
          big5_extraversion: computed.extraversion,
          big5_openness: computed.openness,
          ...settings,
          assessment_completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      // Store in localStorage for onboarding flow
      localStorage.setItem('big5Result', JSON.stringify(computed));
    } catch (err) {
      console.error('Error saving Big Five results:', err);
      toast.error('Results saved locally but failed to sync');
    }

    // Brief processing animation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setPhase('results');
  };

  const handleRetake = () => {
    setScores(null);
    setSystemConfig(null);
    setPhase('intro');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="spinner h-8 w-8" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <GlassCard className="text-center max-w-sm mx-4">
          <p className="text-white mb-2">No questions found</p>
          <p className="text-sm text-text-secondary">
            The Big Five questions haven&apos;t been seeded yet.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-dark-bg py-8">
      {/* Intro */}
      {phase === 'intro' && (
        <motion.div
          className="max-w-lg mx-auto px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <GlassCard className="text-center space-y-4">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              How does your brain work?
            </h1>
            <p className="text-text-secondary leading-relaxed">
              20 quick questions. No right answers. Your responses configure how LifeOS
              works for you &mdash; WIP limits, coaching style, burnout detection, and more.
            </p>
            <p className="text-xs text-text-secondary">&sim;3 minutes</p>
            <button
              onClick={() => setPhase('quiz')}
              className="btn-primary text-sm !py-2.5 !px-6"
            >
              Let&apos;s find out
            </button>
          </GlassCard>
        </motion.div>
      )}

      {/* Quiz */}
      {phase === 'quiz' && (
        <Big5Quiz questions={questions} onComplete={handleQuizComplete} />
      )}

      {/* Processing */}
      {phase === 'processing' && (
        <div className="flex flex-col items-center justify-center gap-4 pt-20">
          <div className="spinner h-10 w-10" />
          <p className="text-text-secondary text-sm">
            Configuring your LifeOS&hellip;
          </p>
        </div>
      )}

      {/* Results */}
      {phase === 'results' && scores && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Big5Results
            scores={scores}
            systemConfig={systemConfig ?? {
              wip_limit: 4,
              brain_dump_enabled: true,
              consequence_framing: false,
              energy_matching: false,
              burnout_detection: false,
              auto_archive: false,
              coaching_tone: 'coach',
              financial_check_frequency: 'monthly',
              show_daily_portfolio: false,
              debt_framing: 'total_remaining',
              logging_mode: 'quick_totals',
            }}
            onRetake={handleRetake}
          />
        </motion.div>
      )}
    </main>
  );
}
