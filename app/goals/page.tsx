'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AppShell } from '@/components/nav/AppShell';
import { GoalList } from '@/components/goals/GoalList';
import { GoalModal } from '@/components/goals/GoalModal';
import type { UserGoal, LifeArea, KeyResult, SystemConfig } from '@/types/lifeos';
import toast from 'react-hot-toast';

interface GoalFormData {
  title: string;
  life_area: LifeArea | '';
  quarter: string;
  consequence_text: string;
  target_date: string;
  progress_pct: number;
}

const DEFAULT_CONFIG: SystemConfig = {
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
};

export default function GoalsPage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<UserGoal | null>(null);

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const [goalsRes, profileRes] = await Promise.all([
      supabase
        .from('user_goals')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('personality_profiles')
        .select('system_config')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
    ]);

    if (goalsRes.data) setGoals(goalsRes.data as UserGoal[]);
    if (profileRes.data?.system_config) {
      setSystemConfig(profileRes.data.system_config as SystemConfig);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (data: GoalFormData, keyResults: KeyResult[]) => {
    if (!userId) return;

    const payload = {
      user_id: userId,
      title: data.title,
      goal_type: 'personal' as const,
      life_area: (data.life_area || null) as LifeArea | null,
      quarter: data.quarter || null,
      consequence_text: data.consequence_text || null,
      target_date: data.target_date || null,
      progress_pct: data.progress_pct,
      key_results: keyResults,
      status: 'active' as const,
    };

    if (editingGoal) {
      const { error } = await supabase
        .from('user_goals')
        .update(payload)
        .eq('id', editingGoal.id);

      if (error) {
        toast.error('Failed to update goal');
        return;
      }
      toast.success('Goal updated');
    } else {
      const { error } = await supabase.from('user_goals').insert(payload);

      if (error) {
        toast.error('Failed to create goal');
        return;
      }
      toast.success('Goal created');
    }

    setModalOpen(false);
    setEditingGoal(null);
    fetchData();
  };

  const handleComplete = async (goalId: string) => {
    const { error } = await supabase
      .from('user_goals')
      .update({
        status: 'completed',
        progress_pct: 100,
        completed_at: new Date().toISOString(),
      })
      .eq('id', goalId);

    if (error) {
      toast.error('Failed to complete goal');
    } else {
      toast.success('Goal completed!');
      fetchData();
    }
  };

  if (loading) {
    return (
      <AppShell>
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="spinner h-8 w-8" />
      </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
    <main className="min-h-screen bg-dark-bg">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Goals</h1>
            <p className="text-sm text-text-secondary mt-1">
              {systemConfig.consequence_framing
                ? 'What happens if you DON\u2019T follow through?'
                : 'Track what matters to you.'}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingGoal(null);
              setModalOpen(true);
            }}
            className="btn-primary text-sm !py-2.5 !px-5 self-start"
          >
            + Add Goal
          </button>
        </div>

        <GoalList
          goals={goals}
          consequenceFraming={systemConfig.consequence_framing}
          onEdit={(goal) => {
            setEditingGoal(goal);
            setModalOpen(true);
          }}
          onComplete={handleComplete}
        />

        <GoalModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingGoal(null);
          }}
          onSubmit={handleSubmit}
          goal={editingGoal}
          consequenceFraming={systemConfig.consequence_framing}
        />
      </div>
    </main>
    </AppShell>
  );
}
