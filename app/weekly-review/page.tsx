'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

import { ReviewWizard, type ReviewData } from '@/components/weekly-review/ReviewWizard';
import { ReviewHistory } from '@/components/weekly-review/ReviewHistory';
import type { WeeklyReview } from '@/types/lifeos';
import toast from 'react-hot-toast';

function getStartOfWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export default function WeeklyReviewPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<WeeklyReview[]>([]);
  const [thisWeekReview, setThisWeekReview] = useState<WeeklyReview | null>(null);
  const [wipRespected, setWipRespected] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  const weekOf = getStartOfWeek();

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const [reviewsRes, wipRes] = await Promise.all([
      supabase
        .from('weekly_reviews')
        .select('*')
        .order('week_of', { ascending: false })
        .limit(12),
      supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
    ]);

    if (reviewsRes.data) {
      const allReviews = reviewsRes.data as WeeklyReview[];
      setReviews(allReviews);
      const current = allReviews.find((r) => r.week_of === weekOf);
      if (current) setThisWeekReview(current);
    }

    // Check WIP — fetch limit from profile
    const { data: profile } = await supabase
      .from('personality_profiles')
      .select('wip_limit')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const activeCount = wipRes.count ?? 0;
    const limit = profile?.wip_limit ?? 4;
    setWipRespected(activeCount <= limit);

    setLoading(false);
  }, [weekOf]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (data: ReviewData) => {
    if (!userId) return;
    setSubmitting(true);

    const { error } = await supabase.from('weekly_reviews').upsert(
      {
        user_id: userId,
        week_of: weekOf,
        wip_respected: data.wip_respected,
        exercise_days: data.exercise_days,
        avg_sleep: data.avg_sleep,
        tasks_completed: data.tasks_completed,
        top_win: data.top_win || null,
        biggest_blocker: data.biggest_blocker || null,
        next_priorities: data.next_priorities,
        score: data.score,
        burnout_level: data.burnout_level,
      },
      { onConflict: 'user_id,week_of' }
    );

    if (error) {
      toast.error('Failed to save review');
    } else {
      toast.success('Review saved!');
      setShowWizard(false);
      fetchData();
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <>
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="spinner h-8 w-8" />
      </div>
      </>
    );
  }

  return (
    <>
    <main className="min-h-screen bg-dark-bg">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Weekly Review
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              5 minutes to reflect and plan ahead.
            </p>
          </div>
          {!showWizard && (
            <button
              onClick={() => setShowWizard(true)}
              className="btn-primary text-sm !py-2 !px-4"
            >
              {thisWeekReview ? 'Redo Review' : 'Start Review'}
            </button>
          )}
        </div>

        {showWizard ? (
          <ReviewWizard
            defaultWipRespected={wipRespected}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        ) : (
          <ReviewHistory reviews={reviews} />
        )}
      </div>
    </main>
    </>
  );
}
