-- ============================================================
-- LifeOS — Combined Database Setup
-- Unified schema: mind-map-pro personality engine + LifeOS extensions
-- Run this on a FRESH Supabase project (lifeos)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- SECTION 1: PERSONALITY ENGINE (from mind-map-pro)
-- ============================================================

-- MBTI Questions
CREATE TABLE IF NOT EXISTS mbti_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text TEXT NOT NULL,
  dimension VARCHAR(2) NOT NULL CHECK (dimension IN ('EI', 'SN', 'TF', 'JP')),
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_a_type VARCHAR(1) NOT NULL,
  option_b_type VARCHAR(1) NOT NULL,
  weight INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DISC Questions
CREATE TABLE IF NOT EXISTS disc_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text TEXT NOT NULL,
  option_d TEXT NOT NULL,
  option_i TEXT NOT NULL,
  option_s TEXT NOT NULL,
  option_c TEXT NOT NULL,
  question_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Big Five Questions (NEW for LifeOS)
CREATE TABLE IF NOT EXISTS big5_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text TEXT NOT NULL,
  trait VARCHAR(20) NOT NULL CHECK (trait IN (
    'neuroticism', 'conscientiousness', 'agreeableness',
    'extraversion', 'openness'
  )),
  pole_a TEXT NOT NULL,
  pole_b TEXT NOT NULL,
  weight INTEGER DEFAULT 1,
  question_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Responses (assessment answers)
CREATE TABLE IF NOT EXISTS user_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL,
  question_type VARCHAR(10) NOT NULL CHECK (question_type IN ('mbti', 'disc', 'big5')),
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MBTI Results
CREATE TABLE IF NOT EXISTS mbti_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  personality_type VARCHAR(5) NOT NULL,
  e_score INTEGER DEFAULT 0,
  i_score INTEGER DEFAULT 0,
  s_score INTEGER DEFAULT 0,
  n_score INTEGER DEFAULT 0,
  t_score INTEGER DEFAULT 0,
  f_score INTEGER DEFAULT 0,
  j_score INTEGER DEFAULT 0,
  p_score INTEGER DEFAULT 0,
  turbulent_score INTEGER DEFAULT 0,
  assertive_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DISC Results
CREATE TABLE IF NOT EXISTS disc_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  d_score INTEGER DEFAULT 0 CHECK (d_score >= 0 AND d_score <= 100),
  i_score INTEGER DEFAULT 0 CHECK (i_score >= 0 AND i_score <= 100),
  s_score INTEGER DEFAULT 0 CHECK (s_score >= 0 AND s_score <= 100),
  c_score INTEGER DEFAULT 0 CHECK (c_score >= 0 AND c_score <= 100),
  primary_style VARCHAR(1) CHECK (primary_style IN ('D', 'I', 'S', 'C')),
  secondary_style VARCHAR(1) CHECK (secondary_style IN ('D', 'I', 'S', 'C')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Big Five Results (NEW for LifeOS)
CREATE TABLE IF NOT EXISTS big5_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  neuroticism INTEGER DEFAULT 50 CHECK (neuroticism >= 0 AND neuroticism <= 100),
  conscientiousness INTEGER DEFAULT 50 CHECK (conscientiousness >= 0 AND conscientiousness <= 100),
  agreeableness INTEGER DEFAULT 50 CHECK (agreeableness >= 0 AND agreeableness <= 100),
  extraversion INTEGER DEFAULT 50 CHECK (extraversion >= 0 AND extraversion <= 100),
  openness INTEGER DEFAULT 50 CHECK (openness >= 0 AND openness <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personality Profiles (EXTENDED for LifeOS)
-- Combines DISC + MBTI + Big Five into one unified profile
-- system_config is the auto-generated JSON that drives the entire UX
CREATE TABLE IF NOT EXISTS personality_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- DISC scores
  disc_d INTEGER DEFAULT 0 CHECK (disc_d >= 0 AND disc_d <= 100),
  disc_i INTEGER DEFAULT 0 CHECK (disc_i >= 0 AND disc_i <= 100),
  disc_s INTEGER DEFAULT 0 CHECK (disc_s >= 0 AND disc_s <= 100),
  disc_c INTEGER DEFAULT 0 CHECK (disc_c >= 0 AND disc_c <= 100),
  -- MBTI
  mbti_type VARCHAR(5),
  -- Big Five (percentiles)
  big5_neuroticism INTEGER CHECK (big5_neuroticism >= 0 AND big5_neuroticism <= 100),
  big5_conscientiousness INTEGER CHECK (big5_conscientiousness >= 0 AND big5_conscientiousness <= 100),
  big5_agreeableness INTEGER CHECK (big5_agreeableness >= 0 AND big5_agreeableness <= 100),
  big5_extraversion INTEGER CHECK (big5_extraversion >= 0 AND big5_extraversion <= 100),
  big5_openness INTEGER CHECK (big5_openness >= 0 AND big5_openness <= 100),
  -- Computed config (the magic)
  system_config JSONB DEFAULT '{}'::jsonb,
  -- Personality-derived settings
  wip_limit INTEGER DEFAULT 4 CHECK (wip_limit >= 2 AND wip_limit <= 8),
  energy_matching BOOLEAN DEFAULT true,
  consequence_framing BOOLEAN DEFAULT true,
  brain_dump_priority BOOLEAN DEFAULT true,
  coaching_tone VARCHAR(50) DEFAULT 'coach',
  -- Metadata
  assessment_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Personality Reports (PDF generation)
CREATE TABLE IF NOT EXISTS personality_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type VARCHAR(20) NOT NULL DEFAULT 'full',
  report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 2: PRODUCTIVITY (Phase 1)
-- ============================================================

-- Projects with WIP limits and energy matching
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  tier INTEGER NOT NULL DEFAULT 2 CHECK (tier IN (1, 2, 3)),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN (
    'active', 'maintenance', 'parked', 'completed', 'archived'
  )),
  energy_level VARCHAR(10) DEFAULT 'medium' CHECK (energy_level IN (
    'low', 'medium', 'high', 'deep'
  )),
  weekly_hours_cap NUMERIC(4,1),
  next_action TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  notes TEXT,
  color VARCHAR(7),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Goals (EXTENDED from mind-map-pro)
-- Now includes consequence framing, life areas, key results
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  goal_type VARCHAR(20) DEFAULT 'personal' CHECK (goal_type IN (
    'personal', 'professional', 'financial', 'health', 'relationship'
  )),
  life_area VARCHAR(30) CHECK (life_area IN (
    'career', 'finance', 'health', 'relationships', 'personal_growth',
    'creativity', 'community', 'spirituality'
  )),
  quarter VARCHAR(10),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN (
    'active', 'completed', 'paused', 'abandoned'
  )),
  consequence_text TEXT,  -- "If I DON'T do this..."
  progress_pct INTEGER DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
  key_results JSONB DEFAULT '[]'::jsonb,
  target_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Check-ins (30-second rule)
CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
  sleep_hours NUMERIC(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  exercise BOOLEAN DEFAULT false,
  brain_dump_used BOOLEAN DEFAULT false,
  top_win TEXT,
  biggest_blocker TEXT,
  mood_note TEXT,
  projects_touched UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Brain Dumps (zero-friction capture)
CREATE TABLE IF NOT EXISTS brain_dumps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category VARCHAR(30) CHECK (category IN (
    'task', 'idea', 'worry', 'note', 'project', 'someday', NULL
  )),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  triaged BOOLEAN DEFAULT false,
  triaged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly Reviews
CREATE TABLE IF NOT EXISTS weekly_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_of DATE NOT NULL,
  wip_respected BOOLEAN,
  exercise_days INTEGER CHECK (exercise_days >= 0 AND exercise_days <= 7),
  avg_sleep NUMERIC(3,1),
  tasks_completed INTEGER DEFAULT 0,
  top_win TEXT,
  biggest_blocker TEXT,
  next_priorities JSONB DEFAULT '[]'::jsonb,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  burnout_level VARCHAR(10) DEFAULT 'green' CHECK (burnout_level IN (
    'green', 'yellow', 'orange', 'red'
  )),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_of)
);

-- ============================================================
-- SECTION 3: STRIPE / COMMERCE (from mind-map-pro)
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  stripe_price_id VARCHAR(100),
  product_type VARCHAR(20) DEFAULT 'subscription' CHECK (product_type IN (
    'subscription', 'one_time', 'template'
  )),
  tier VARCHAR(20) CHECK (tier IN ('free', 'pro', 'complete', 'template')),
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  stripe_session_id VARCHAR(200),
  stripe_payment_intent VARCHAR(200),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'completed', 'failed', 'refunded'
  )),
  amount_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 4: FINANCE (Phase 2 — tables created now, populated later)
-- ============================================================

CREATE TABLE IF NOT EXISTS monthly_cash_flow (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  w2_income NUMERIC(12,2) DEFAULT 0,
  side_income NUMERIC(12,2) DEFAULT 0,
  fixed_expenses NUMERIC(12,2) DEFAULT 0,
  variable_expenses NUMERIC(12,2) DEFAULT 0,
  debt_payments NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

CREATE TABLE IF NOT EXISTS net_worth_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  checking NUMERIC(12,2) DEFAULT 0,
  savings NUMERIC(12,2) DEFAULT 0,
  emergency_fund NUMERIC(12,2) DEFAULT 0,
  investments_401k NUMERIC(12,2) DEFAULT 0,
  crypto NUMERIC(12,2) DEFAULT 0,
  other_assets NUMERIC(12,2) DEFAULT 0,
  total_debt NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creditor VARCHAR(200) NOT NULL,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  interest_rate NUMERIC(5,2) DEFAULT 0,
  min_payment NUMERIC(10,2) DEFAULT 0,
  strategy VARCHAR(20) DEFAULT 'avalanche' CHECK (strategy IN (
    'snowball', 'avalanche', 'custom'
  )),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN (
    'active', 'paid_off', 'deferred', 'collections'
  )),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recurring_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  frequency VARCHAR(20) DEFAULT 'monthly' CHECK (frequency IN (
    'weekly', 'biweekly', 'monthly', 'quarterly', 'annual'
  )),
  category VARCHAR(30),
  essential BOOLEAN DEFAULT false,
  auto_pay BOOLEAN DEFAULT false,
  due_day INTEGER CHECK (due_day >= 1 AND due_day <= 31),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN (
    'active', 'paused', 'cancelled'
  )),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  goal_type VARCHAR(20) NOT NULL CHECK (goal_type IN (
    'save_up', 'pay_down', 'income_target', 'investment'
  )),
  target_amount NUMERIC(12,2) NOT NULL,
  current_amount NUMERIC(12,2) DEFAULT 0,
  monthly_contribution NUMERIC(10,2) DEFAULT 0,
  target_date DATE,
  priority INTEGER DEFAULT 2 CHECK (priority >= 1 AND priority <= 5),
  consequence_text TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN (
    'active', 'completed', 'paused', 'abandoned'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 5: INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_responses_user ON user_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_mbti_results_user ON mbti_results(user_id);
CREATE INDEX IF NOT EXISTS idx_disc_results_user ON disc_results(user_id);
CREATE INDEX IF NOT EXISTS idx_big5_results_user ON big5_results(user_id);
CREATE INDEX IF NOT EXISTS idx_personality_profiles_user ON personality_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_status ON projects(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_goals_user ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON daily_checkins(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_brain_dumps_user_triaged ON brain_dumps(user_id, triaged);
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_user_week ON weekly_reviews(user_id, week_of DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_cash_flow_user ON monthly_cash_flow(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_user ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user ON financial_goals(user_id);

-- ============================================================
-- SECTION 6: ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all user-facing tables
ALTER TABLE user_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE mbti_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE disc_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE big5_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE personality_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personality_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE brain_dumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_cash_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE net_worth_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only CRUD their own data
-- Pattern: SELECT/INSERT/UPDATE/DELETE where user_id = auth.uid()

-- Helper: Create standard CRUD policies for a table
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'user_responses', 'mbti_results', 'disc_results', 'big5_results',
    'personality_profiles', 'personality_reports',
    'projects', 'user_goals', 'daily_checkins', 'brain_dumps', 'weekly_reviews',
    'orders',
    'monthly_cash_flow', 'net_worth_snapshots', 'debts',
    'recurring_expenses', 'financial_goals'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    -- SELECT
    EXECUTE format(
      'CREATE POLICY "Users can view own %1$s" ON %1$s FOR SELECT USING (auth.uid() = user_id)',
      tbl
    );
    -- INSERT
    EXECUTE format(
      'CREATE POLICY "Users can insert own %1$s" ON %1$s FOR INSERT WITH CHECK (auth.uid() = user_id)',
      tbl
    );
    -- UPDATE
    EXECUTE format(
      'CREATE POLICY "Users can update own %1$s" ON %1$s FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)',
      tbl
    );
    -- DELETE
    EXECUTE format(
      'CREATE POLICY "Users can delete own %1$s" ON %1$s FOR DELETE USING (auth.uid() = user_id)',
      tbl
    );
  END LOOP;
END
$$;

-- Public read for questions and products (no user_id column)
ALTER TABLE mbti_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disc_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE big5_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read MBTI questions" ON mbti_questions FOR SELECT USING (true);
CREATE POLICY "Anyone can read DISC questions" ON disc_questions FOR SELECT USING (true);
CREATE POLICY "Anyone can read Big Five questions" ON big5_questions FOR SELECT USING (true);
CREATE POLICY "Anyone can read products" ON products FOR SELECT USING (true);

-- ============================================================
-- SECTION 7: UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables that have it
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'mbti_results', 'disc_results', 'big5_results',
    'personality_profiles', 'projects', 'user_goals',
    'daily_checkins', 'weekly_reviews', 'orders',
    'monthly_cash_flow', 'net_worth_snapshots', 'debts',
    'recurring_expenses', 'financial_goals'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      tbl
    );
  END LOOP;
END
$$;

-- ============================================================
-- SECTION 8: HELPER FUNCTIONS
-- ============================================================

-- Count active projects for WIP enforcement
CREATE OR REPLACE FUNCTION get_active_project_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM projects
  WHERE user_id = p_user_id
    AND status = 'active';
$$ LANGUAGE sql SECURITY DEFINER;

-- Get user's WIP limit from their personality profile
CREATE OR REPLACE FUNCTION get_user_wip_limit(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(wip_limit, 4)
  FROM personality_profiles
  WHERE user_id = p_user_id
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Burnout detection: check if sleep + exercise patterns indicate risk
CREATE OR REPLACE FUNCTION check_burnout_risk(p_user_id UUID)
RETURNS VARCHAR(10) AS $$
DECLARE
  avg_sleep NUMERIC;
  exercise_count INTEGER;
  avg_stress NUMERIC;
BEGIN
  -- Look at last 7 days
  SELECT
    AVG(sleep_hours),
    COUNT(*) FILTER (WHERE exercise = true),
    AVG(stress_level)
  INTO avg_sleep, exercise_count, avg_stress
  FROM daily_checkins
  WHERE user_id = p_user_id
    AND date >= CURRENT_DATE - INTERVAL '7 days';

  -- Risk assessment
  IF avg_sleep IS NULL THEN RETURN 'green'; END IF;

  IF avg_sleep < 6 AND exercise_count <= 1 AND avg_stress > 3.5 THEN
    RETURN 'red';
  ELSIF avg_sleep < 6.5 AND exercise_count <= 2 AND avg_stress > 3 THEN
    RETURN 'orange';
  ELSIF avg_sleep < 7 AND avg_stress > 2.5 THEN
    RETURN 'yellow';
  ELSE
    RETURN 'green';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- DONE. Schema ready for LifeOS Phase 1 + Phase 2 tables.
-- ============================================================
