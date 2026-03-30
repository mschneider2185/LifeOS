// types/lifeos.ts — LifeOS Database Types
// Extends the existing mind-map-pro types with productivity + finance tables

// ============================================================
// PERSONALITY ENGINE
// ============================================================

export interface PersonalityProfile {
  id: string;
  user_id: string;
  disc_d: number;
  disc_i: number;
  disc_s: number;
  disc_c: number;
  mbti_type: string | null;
  big5_neuroticism: number | null;
  big5_conscientiousness: number | null;
  big5_agreeableness: number | null;
  big5_extraversion: number | null;
  big5_openness: number | null;
  system_config: SystemConfig;
  wip_limit: number;
  energy_matching: boolean;
  consequence_framing: boolean;
  brain_dump_priority: boolean;
  coaching_tone: CoachingTone;
  assessment_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type CoachingTone =
  | 'commander'
  | 'cheerleader'
  | 'analyst'
  | 'coach'
  | 'commander_coach_analyst';

export interface SystemConfig {
  wip_limit: number;
  brain_dump_enabled: boolean;
  consequence_framing: boolean;
  energy_matching: boolean;
  burnout_detection: boolean;
  auto_archive: boolean;
  coaching_tone: CoachingTone;
  financial_check_frequency: 'weekly' | 'biweekly' | 'monthly';
  show_daily_portfolio: boolean;
  debt_framing: 'months_to_freedom' | 'total_remaining' | 'interest_saved';
  logging_mode: 'quick_totals' | 'detailed' | 'minimal';
}

export interface Big5Question {
  id: string;
  question_text: string;
  trait: Big5Trait;
  pole_a: string;
  pole_b: string;
  weight: number;
  question_order: number;
  created_at: string;
}

export type Big5Trait =
  | 'neuroticism'
  | 'conscientiousness'
  | 'agreeableness'
  | 'extraversion'
  | 'openness';

export interface Big5Results {
  id: string;
  user_id: string;
  neuroticism: number;
  conscientiousness: number;
  agreeableness: number;
  extraversion: number;
  openness: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// PRODUCTIVITY (Phase 1)
// ============================================================

export type ProjectTier = 1 | 2 | 3;
export type ProjectStatus = 'active' | 'maintenance' | 'parked' | 'completed' | 'archived';
export type EnergyLevel = 'low' | 'medium' | 'high' | 'deep';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  tier: ProjectTier;
  status: ProjectStatus;
  energy_level: EnergyLevel;
  weekly_hours_cap: number | null;
  next_action: string | null;
  progress: number;
  notes: string | null;
  color: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type GoalType = 'personal' | 'professional' | 'financial' | 'health' | 'relationship';
export type LifeArea =
  | 'career'
  | 'finance'
  | 'health'
  | 'relationships'
  | 'personal_growth'
  | 'creativity'
  | 'community'
  | 'spirituality';

export interface UserGoal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  goal_type: GoalType;
  life_area: LifeArea | null;
  quarter: string | null;
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  consequence_text: string | null;
  progress_pct: number;
  key_results: KeyResult[];
  target_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KeyResult {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
}

export interface DailyCheckIn {
  id: string;
  user_id: string;
  date: string;
  energy_level: number | null;
  stress_level: number | null;
  sleep_hours: number | null;
  exercise: boolean;
  brain_dump_used: boolean;
  top_win: string | null;
  biggest_blocker: string | null;
  mood_note: string | null;
  projects_touched: string[];
  created_at: string;
  updated_at: string;
}

export type BrainDumpCategory =
  | 'task'
  | 'idea'
  | 'worry'
  | 'note'
  | 'project'
  | 'someday'
  | null;

export interface BrainDump {
  id: string;
  user_id: string;
  content: string;
  category: BrainDumpCategory;
  project_id: string | null;
  triaged: boolean;
  triaged_at: string | null;
  created_at: string;
}

export type BurnoutLevel = 'green' | 'yellow' | 'orange' | 'red';

export interface WeeklyReview {
  id: string;
  user_id: string;
  week_of: string;
  wip_respected: boolean | null;
  exercise_days: number | null;
  avg_sleep: number | null;
  tasks_completed: number;
  top_win: string | null;
  biggest_blocker: string | null;
  next_priorities: string[];
  score: number | null;
  burnout_level: BurnoutLevel;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// FINANCE (Phase 2 — types defined now for schema alignment)
// ============================================================

export interface MonthlyCashFlow {
  id: string;
  user_id: string;
  month: string;
  w2_income: number;
  side_income: number;
  fixed_expenses: number;
  variable_expenses: number;
  debt_payments: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NetWorthSnapshot {
  id: string;
  user_id: string;
  month: string;
  checking: number;
  savings: number;
  emergency_fund: number;
  investments_401k: number;
  crypto: number;
  other_assets: number;
  total_debt: number;
  created_at: string;
  updated_at: string;
}

export type DebtStrategy = 'snowball' | 'avalanche' | 'custom';

export interface Debt {
  id: string;
  user_id: string;
  creditor: string;
  balance: number;
  interest_rate: number;
  min_payment: number;
  strategy: DebtStrategy;
  status: 'active' | 'paid_off' | 'deferred' | 'collections';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecurringExpense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual';
  category: string | null;
  essential: boolean;
  auto_pay: boolean;
  due_day: number | null;
  status: 'active' | 'paused' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type FinancialGoalType = 'save_up' | 'pay_down' | 'income_target' | 'investment';

export interface FinancialGoal {
  id: string;
  user_id: string;
  title: string;
  goal_type: FinancialGoalType;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number;
  target_date: string | null;
  priority: number;
  consequence_text: string | null;
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  created_at: string;
  updated_at: string;
}

// ============================================================
// COMPUTED / DERIVED TYPES
// ============================================================

/** Dashboard summary for the main view */
export interface DashboardData {
  profile: PersonalityProfile | null;
  activeProjects: Project[];
  todayCheckIn: DailyCheckIn | null;
  untriagedDumps: number;
  latestReview: WeeklyReview | null;
  burnoutLevel: BurnoutLevel;
  wipCount: number;
  wipLimit: number;
}

/** Net worth computed from a snapshot */
export interface ComputedNetWorth {
  totalAssets: number;
  totalDebt: number;
  netWorth: number;
  monthOverMonthChange: number | null;
}

/** Cash flow computed from a monthly entry */
export interface ComputedCashFlow {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number;
  sideIncomePercent: number;
}
