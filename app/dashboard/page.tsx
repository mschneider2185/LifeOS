'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { AppShell } from '@/components/nav/AppShell';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProjectsPanel } from '@/components/dashboard/ProjectsPanel';
import { CheckInPanel } from '@/components/dashboard/CheckInPanel';
import { BrainDumpPanel } from '@/components/dashboard/BrainDumpPanel';
import { GoalsPanel } from '@/components/dashboard/GoalsPanel';
import { WeeklyReviewPanel } from '@/components/dashboard/WeeklyReviewPanel';
import type {
  Project,
  PersonalityProfile,
  DailyCheckIn,
  BrainDump,
  UserGoal,
  WeeklyReview,
  SystemConfig,
  BurnoutLevel,
  CoachingTone,
} from '@/types/lifeos';

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

function computeBurnoutLevel(recentCheckins: DailyCheckIn[]): BurnoutLevel {
  if (recentCheckins.length < 2) return 'green';

  let lowSleepDays = 0;
  let noExerciseDays = 0;

  for (const c of recentCheckins) {
    if (c.sleep_hours !== null && c.sleep_hours < 7) lowSleepDays++;
    if (!c.exercise) noExerciseDays++;
  }

  if (lowSleepDays >= 3 && noExerciseDays >= 5) return 'red';
  if (lowSleepDays >= 2 && noExerciseDays >= 3) return 'orange';
  if (lowSleepDays >= 2 || noExerciseDays >= 4) return 'yellow';
  return 'green';
}

function computeStreak(checkins: DailyCheckIn[]): number {
  if (checkins.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (checkins.some((c) => c.date === dateStr)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // Data
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);
  const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckIn | null>(null);
  const [recentCheckins, setRecentCheckins] = useState<DailyCheckIn[]>([]);
  const [untriagedDumps, setUntriagedDumps] = useState<BrainDump[]>([]);
  const [untriagedCount, setUntriagedCount] = useState(0);
  const [activeGoals, setActiveGoals] = useState<UserGoal[]>([]);
  const [latestReview, setLatestReview] = useState<WeeklyReview | null>(null);

  const systemConfig = profile?.system_config ?? DEFAULT_CONFIG;
  const coachingTone: CoachingTone = systemConfig.coaching_tone;
  const wipLimit = profile?.wip_limit ?? systemConfig.wip_limit;
  const burnoutLevel = computeBurnoutLevel(recentCheckins);
  const streakDays = computeStreak(recentCheckins);

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUserId(user.id);
    setUserName(user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? null);

    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const [
      projectsRes,
      profileRes,
      todayCheckinRes,
      recentCheckinsRes,
      dumpsRes,
      dumpsCountRes,
      goalsRes,
      reviewRes,
    ] = await Promise.all([
      supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('sort_order', { ascending: true }),
      supabase
        .from('personality_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
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
      supabase
        .from('brain_dumps')
        .select('*')
        .eq('triaged', false)
        .order('created_at', { ascending: false })
        .limit(3),
      supabase
        .from('brain_dumps')
        .select('id', { count: 'exact', head: true })
        .eq('triaged', false),
      supabase
        .from('user_goals')
        .select('*')
        .eq('status', 'active')
        .order('progress_pct', { ascending: false })
        .limit(3),
      supabase
        .from('weekly_reviews')
        .select('*')
        .order('week_of', { ascending: false })
        .limit(1),
    ]);

    if (projectsRes.data) setProjects(projectsRes.data as Project[]);
    if (profileRes.data) setProfile(profileRes.data as PersonalityProfile);
    if (todayCheckinRes.data) setTodayCheckIn(todayCheckinRes.data as DailyCheckIn);
    if (recentCheckinsRes.data) setRecentCheckins(recentCheckinsRes.data as DailyCheckIn[]);
    if (dumpsRes.data) setUntriagedDumps(dumpsRes.data as BrainDump[]);
    setUntriagedCount(dumpsCountRes.count ?? 0);
    if (goalsRes.data) setActiveGoals(goalsRes.data as UserGoal[]);
    if (reviewRes.data && reviewRes.data.length > 0) {
      setLatestReview(reviewRes.data[0] as WeeklyReview);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      <div className="max-w-[1400px] mx-auto px-4 py-6 sm:px-6">
        <DashboardHeader
          userName={userName}
          coachingTone={coachingTone}
          burnoutLevel={burnoutLevel}
        />

        {/* 5-panel grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Top row: Projects, Check-in, Brain Dump (or Goals if dump hidden) */}

          {/* Mobile order: check-in first (order-1 on mobile, order-2 on desktop) */}
          <motion.div
            className="order-2 md:order-1"
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <ProjectsPanel projects={projects} wipLimit={wipLimit} />
          </motion.div>

          <motion.div
            className="order-1 md:order-2"
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <CheckInPanel
              todayCheckIn={todayCheckIn}
              streakDays={streakDays}
              coachingTone={coachingTone}
            />
          </motion.div>

          {systemConfig.brain_dump_enabled && userId ? (
            <motion.div
              className="order-3"
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <BrainDumpPanel
                untriagedDumps={untriagedDumps}
                untriagedCount={untriagedCount}
                userId={userId}
                onNewDump={fetchData}
              />
            </motion.div>
          ) : (
            // If brain dump disabled, move goals up to top row
            <motion.div
              className="order-3"
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <GoalsPanel
                goals={activeGoals}
                consequenceFraming={systemConfig.consequence_framing}
              />
            </motion.div>
          )}

          {/* Bottom row: Goals (if not already shown) + Weekly Review */}
          {systemConfig.brain_dump_enabled && (
            <motion.div
              className="order-4 md:col-span-2"
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <GoalsPanel
                goals={activeGoals}
                consequenceFraming={systemConfig.consequence_framing}
              />
            </motion.div>
          )}

          <motion.div
            className={`order-5 ${!systemConfig.brain_dump_enabled ? 'md:col-span-2' : ''}`}
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <WeeklyReviewPanel latestReview={latestReview} />
          </motion.div>
        </div>
      </div>
    </main>
    </AppShell>
  );
}
