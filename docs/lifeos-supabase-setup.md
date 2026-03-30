# LifeOS — Supabase Decision & Setup

## Decision (RESOLVED — March 29, 2026)

The mind-map-pro Supabase project is paused and cannot be resumed on the free plan. Free tier only allows one active Supabase project.

**Decision: Create a fresh Supabase project for LifeOS.** Leave the old one paused. The new project gets a unified schema combining mind-map-pro's personality tables with all LifeOS productivity and finance tables from day one.

## Setup Steps

1. Log into Supabase dashboard
2. Create new project named "lifeos" (or "schneider-lifeos")
3. Run the combined database-setup.sql (personality tables from mind-map-pro + LifeOS extensions)
4. Copy new project URL and anon key
5. Update .env.local in the lifeos-app repo
6. Update lib/supabase.ts connection
7. Set up Row Level Security policies
8. Configure Supabase Auth (email + optional OAuth)

## Combined Schema Overview

The new Supabase project should contain ALL tables from both sources:

### From mind-map-pro (personality engine)
- mbti_questions, disc_questions, user_responses
- mbti_results, disc_results
- personality_profiles (EXTEND with system_config jsonb + Big Five scores)
- personality_reports
- user_goals (EXTEND with consequence_text, life_area, key_results)
- products, orders (Stripe integration)

### New for LifeOS Productivity (Phase 1)
- projects (name, tier, status, energy_level, weekly_hours_cap, next_action, progress, notes)
- daily_checkins (date, energy_level, stress_level, sleep_hours, exercise, brain_dump_used, top_win, biggest_blocker, mood_note, projects_touched)
- brain_dumps (content, category, triaged_at)
- weekly_reviews (week_of, wip_respected, exercise_days, avg_sleep, tasks_completed, top_win, biggest_blocker, next_priorities, score)

### New for LifeOS Productivity — Big Five Assessment
- big5_questions (question_text, trait, pole_a, pole_b, weight)
- big5_results (user_id, neuroticism, conscientiousness, agreeableness, extraversion, openness)

### New for LifeOS Finance (Phase 2)
- monthly_cash_flow (month, w2_income, side_income, fixed_expenses, variable_expenses, debt_payments)
- net_worth_snapshots (month, checking, savings, emergency_fund, investments_401k, crypto, other_assets, total_debt)
- debts (creditor, balance, interest_rate, min_payment, strategy, status)
- recurring_expenses (name, amount, frequency, category, essential, auto_pay, due_day, status)
- financial_goals (title, type, target_amount, current_amount, monthly_contribution, target_date, priority, consequence_text, status)

All tables include: id (uuid, PK), user_id (FK → auth.users), created_at, updated_at
All tables have Row Level Security: users can only access their own data.
