'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AppShell } from '@/components/nav/AppShell';
import { CheckInForm, type CheckInFormData } from '@/components/checkin/CheckInForm';
import { CheckInHistory } from '@/components/checkin/CheckInHistory';
import type { DailyCheckIn } from '@/types/lifeos';
import toast from 'react-hot-toast';

export default function CheckInPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckIn | null>(null);
  const [recentCheckins, setRecentCheckins] = useState<DailyCheckIn[]>([]);

  const today = new Date().toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const [todayRes, recentRes] = await Promise.all([
      supabase
        .from('daily_checkins')
        .select('*')
        .eq('date', today)
        .maybeSingle(),
      supabase
        .from('daily_checkins')
        .select('*')
        .gte('date', sevenDaysAgo)
        .order('date', { ascending: false }),
    ]);

    if (todayRes.data) setTodayCheckIn(todayRes.data as DailyCheckIn);
    if (recentRes.data) setRecentCheckins(recentRes.data as DailyCheckIn[]);
    setLoading(false);
  }, [today]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (data: CheckInFormData) => {
    if (!userId) return;
    setSubmitting(true);

    const { error } = await supabase.from('daily_checkins').upsert(
      {
        user_id: userId,
        date: today,
        energy_level: data.energy_level,
        stress_level: data.stress_level,
        sleep_hours: data.sleep_hours,
        exercise: data.exercise,
        top_win: data.top_win || null,
        biggest_blocker: data.biggest_blocker || null,
        mood_note: data.mood_note || null,
        brain_dump_used: false,
        projects_touched: [],
      },
      { onConflict: 'user_id,date' }
    );

    if (error) {
      toast.error('Failed to save check-in');
    } else {
      toast.success(todayCheckIn ? 'Check-in updated' : 'Checked in!');
      fetchData();
    }
    setSubmitting(false);
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
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            {todayCheckIn ? 'Today\u2019s Check-in' : 'Daily Check-in'}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {todayCheckIn ? 'Update your entry for today.' : '30 seconds. How are you doing?'}
          </p>
        </div>

        <div className="space-y-6">
          <CheckInForm
            existing={todayCheckIn}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
          <CheckInHistory recentCheckins={recentCheckins} />
        </div>
      </div>
    </main>
    </AppShell>
  );
}
