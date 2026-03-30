# LifeOS — Product & System Knowledge Base

## What This Project Is

LifeOS is a personality-aware life management platform being built by Michael Schneider (solo founder). It consists of two standalone products that combine into a holistic system:

- **LifeOS Productivity** — Personality-driven project management, goal tracking, daily habits, journaling, weekly reviews
- **LifeOS Finance** — Manual-first financial tracking with insights, net worth, cash flow, debt payoff, goal tracking
- **LifeOS Complete** — Both products unified under one dashboard

The core differentiator is the **personality engine**: the system configures itself based on the user's psychometric profile (DISC, MBTI, Big Five). No other productivity or finance app does this.

---

## Michael's Personality Profile (The First User)

### DISC — Maxwell "Chancellor" (DIC)
- D=59, I=66, S=25, C=61
- Results-driven leader, outgoing, detail-aware, impulsive under pressure
- Motivated by authority, variety, recognition
- Dislikes inefficiency, indecision, micromanagement

### MBTI — INTP-T (Logician)
- Introverted 53%, Intuitive 75%, Thinking 54%, Prospecting 68%, Turbulent 51%
- Deep systems thinker, idea-driven, self-critical
- More comfortable in the world of ideas than emotional situations

### Big Five Aspects Scale
- **Neuroticism: 96th percentile** — Unusually high stress and emotional reactivity
- **Conscientiousness: 23rd percentile** — Difficulty with routine, follow-through, finishing projects
- Agreeableness ~50th, Extraversion ~47th, Openness ~49th

### Indigo Assessment
- Top motivators: Theoretical (knowledge) + Utilitarian (practical results)
- Top skills: Mentoring/Coaching, Goal Orientation, Continuous Learning
- Watch outs: Too trusting, struggles to focus on one thing, fears failure

### Self-Assessment
- Over-extends at work (family-provider mentality from grandfathers)
- Struggles to recharge, has trouble saying no
- Motivated by necessity and consequence, NOT intrinsic discipline
- Open to feedback, rarely confrontational
- Acts of service > words

### The Big Through-Line
High-energy, intellectually driven, people-oriented achiever who leads naturally and cares deeply — but carries significant internal stress and has a pattern of stretching thin and leaving things unfinished. The combination of **high Neuroticism + low Conscientiousness + high drive** is the most important design constraint.

---

## System Design Principles (Derived from Personality)

1. **30-Second Rule** — If logging something takes >30 seconds, the system is broken. Low conscientiousness = low friction or death.
2. **WIP Limit of 4** — Maximum 4 active projects. Over-commitment is the #1 productivity killer.
3. **Consequence Framing** — Every goal answers "What happens if I DON'T do this?" Not guilt-driven, consequence-driven.
4. **Energy Matching** — Tasks tagged by energy level. Don't force deep work when drained.
5. **Brain Dump First** — If overwhelmed, externalize before planning. 96th %ile neuroticism needs an outlet.
6. **Visible Wins** — D/I DISC profile needs recognition. Progress bars, streaks, celebration prompts.
7. **Burnout Detection** — Early warning system. When sleep drops below 7h for 2+ days and exercise stops, stress spikes follow within 48h.

---

## Tech Stack

### Current (Personal Use — Notion)
- **Notion** (free workspace) — LifeOS hub with databases for projects, tasks, check-ins, goals, health, finance
- Master hub page ID: `331e7ce2e2a0810a93fcf3d5cdfcce8a`

### Target (Product)
- **Frontend:** Next.js 14+ (App Router), React, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Row Level Security)
- **Hosting:** Vercel
- **Auth:** Supabase Auth or Clerk
- **Charts:** Recharts or Chart.js
- **State:** Zustand or React Context
- **Automation:** N8N (self-hosted on Hetzner VPS)
- **AI Coaching:** Claude API for personality-aware nudges
- **Design System:** Dark glassmorphic cyberpunk aesthetic

### Infrastructure
- Hetzner VPS — runs N8N, Supabase, self-hosted services
- Raspberry Pi — home lab
- Incoming Mac Mini — additional compute
- Vercel — deployment for web apps (Card Collector Pro already deployed there)

---

## Existing Notion Databases (Data Layer — mirrors future Supabase schema)

### Productivity Databases
- **Projects Database** — name, tier (1/2/3), status (Active/Maintenance/Parked), energy level, weekly hours cap, next action, progress, notes
- **Tasks Database** — task, status (Not started/Doing/Paused/Done), due date, effort (15min/30min/60min/Deep), time block (Evening/Friday Power/Weekend), type, project relation
- **Daily Check-In** — date, energy level (5 levels), stress level (1-5), sleep hrs, exercise, brain dump used, top win, biggest blocker, mood note, projects touched
- **Goals & Growth** — goal, quarter, life area, status, "If I DON'T do this...", progress %, key results, target date
- **Health & Wellness** — week, avg sleep, exercise days, stress trend, burnout warning (Green/Yellow/Orange/Red), what helped, what hurt, self-care actions

### Financial Databases
- **Monthly Cash Flow** — month, W2 income, side income, fixed expenses, variable expenses, debt payments. Auto-calculates: total income, total expenses, savings, savings rate %, side income %
- **Net Worth Tracker** — month, checking, savings, emergency fund, investments/401k, crypto, other assets, total debt. Auto-calculates: total assets, net worth
- **Debt Tracker** — creditor, balance, interest %, min payment, strategy (snowball/avalanche), status, next action
- **Recurring Expenses** — name, amount, frequency, category, monthly cost (formula), essential?, auto-pay, due day, status
- **Financial Goals** — goal, type (Save Up/Pay Down/Income Target/Investment), target amount, current amount, progress % (formula), monthly contribution, months to goal (formula), priority, consequence text

### Other Pages
- Brain Dump zone (zero-friction capture with triage system)
- Financial Command Center (escape velocity check, monthly ritual, personality-aware money rules)
- Weekly Review Ritual (6-step guided process)
- Personality Profile page (full assessment reference)
- Quick Capture (mobile-friendly inbox)

---

## Supabase Schema (Phase 1 — Productivity)

```sql
-- Users & Personality
users: id, email, name, personality_profile (jsonb), created_at
personality_profiles: id, user_id, disc_d, disc_i, disc_s, disc_c, mbti_type, big5_neuroticism, big5_conscientiousness, big5_agreeableness, big5_extraversion, big5_openness, wip_limit (computed), energy_matching (bool), consequence_framing (bool), brain_dump_priority (bool)

-- Productivity
projects: id, user_id, name, tier, status, energy_level, weekly_hours_cap, next_action, progress, notes, created_at
daily_checkins: id, user_id, date, energy_level, stress_level, sleep_hours, exercise (bool), brain_dump_used (bool), top_win, biggest_blocker, mood_note, projects_touched
goals: id, user_id, title, quarter, life_area, status, consequence_text, progress_pct, key_results (jsonb), target_date
brain_dumps: id, user_id, content, category (null until triaged), created_at, triaged_at
weekly_reviews: id, user_id, week_of, wip_respected (bool), exercise_days, avg_sleep, tasks_completed, top_win, biggest_blocker, next_priorities (jsonb), score
```

## Supabase Schema (Phase 2 — Finance)

```sql
monthly_cash_flow: id, user_id, month, w2_income, side_income, fixed_expenses, variable_expenses, debt_payments, notes, created_at
net_worth_snapshots: id, user_id, month, checking, savings, emergency_fund, investments_401k, crypto, other_assets, total_debt, created_at
debts: id, user_id, creditor, balance, interest_rate, min_payment, strategy, status, notes
recurring_expenses: id, user_id, name, amount, frequency, category, essential (bool), auto_pay (bool), due_day, status, notes
financial_goals: id, user_id, title, type, target_amount, current_amount, monthly_contribution, target_date, priority, consequence_text, status
```

---

## Development Phases

### Phase 1: Productivity MVP (Weeks 1-6)
- Auth, personality quiz, auto-configuring dashboard
- Projects with WIP limits, daily check-in, brain dump, goals, weekly review
- Supabase backend, Vercel deployment
- Ship to production, dogfood for 2 weeks

### Phase 2: Finance Module (Weeks 7-14)
- Monthly cash flow, net worth tracker, debt payoff, recurring expenses, financial goals
- Personality-aware financial insights
- CSV import, escape velocity calculator

### Phase 3: Integration & Growth (Weeks 15-26)
- AI coaching via Claude API
- N8N automation layer
- Notion/Obsidian template exports (premium)
- Slack bot, PWA mobile, Stripe payments

### Phase 4: Scale (Months 7-12)
- Plaid integration (ONLY if traction justifies)
- React Native mobile, team/couples view, API, white-label

---

## Business Model

| Tier | Price | Includes |
|------|-------|----------|
| Free | $0 | Personality assessment + limited dashboard |
| LifeOS Pro | $9/mo or $79/yr | Full productivity suite |
| LifeOS Complete | $15/mo or $129/yr | Productivity + finance + AI coaching |
| Template Packs | $29 one-time | Notion or Obsidian templates |

Escape velocity math: $15/mo avg × 400 users = $6,000/mo recurring

---

## Agency-Agents Development Model

Reference: github.com/mschneider2185/agency-agents

Using specialized AI agents as virtual team members during development:

- **Frontend Developer** — React/Next.js, dark glassmorphic UI
- **Backend Developer** — Supabase, API routes, auth
- **DevOps** — Vercel, CI/CD, Hetzner
- **UI/UX Designer** — Cyberpunk-clean aesthetic, design system
- **Product Manager** — Scope control, WIP enforcement
- **Reality Checker** — Anti-scope-creep guardrail
- **Content Strategist** — Build-in-public narrative
- **Personality Engine Architect** — Assessment design, profile-to-config mapping
- **Financial Systems Analyst** — Cash flow modeling, debt strategy

Activate via Claude Code: "Activate Frontend Developer and build the check-in form component"

---

## Current Active Projects (as of March 2026)

1. OpenClaw — AI agent framework (Tier 1, Active)
2. Card Collector Pro — Next.js/Vercel sports card app (Tier 1, Active)
3. LinkedIn/X Content Strategy — Building in public (Tier 1, Active)
4. FleetSync/SMS — Fleet management (Tier 2, Active)
5. N8N Automation Pipelines — Self-hosted workflows (Tier 2, Active)
6. Lawsuit/Legal — Ongoing matter (Tier 2, Active)
7. LifeOS System — This project (Tier 2, Active → Maintenance)
8. Wilder World — Crypto/metaverse (Tier 3, Maintenance)
9. Infrastructure — Hetzner/Pi/Mac Mini (Tier 3, Maintenance)

**⚠️ WIP WARNING: 6 active projects vs 4 limit. Must park 2 before Phase 1 build begins.**

---

## Prior Art & Lessons

- **mind-map-pro** (github.com/mschneider2185/mind-map-pro) — Earlier attempt at visual life management. Stalled due to scope creep. Lesson: ship the thin slice first.
- **Existing Financial Dashboard** — HTML file at `C:\Users\masch\OneDrive\Documents\About Me\Finance\Financial_Escape_Velocity_Dashboard.html`. Dark glassmorphic aesthetic that the web app should match.
- **React Dashboard Prototype** — `SchneiderLifeOS_Dashboard.jsx` artifact already built. Five panels (Projects/WIP, Check-In/Habits, Finance, Health/Burnout, Weekly Review). Mock data structured to mirror Notion/Supabase schemas.

---

## Competitive Positioning

| Competitor | Strengths | Gap LifeOS Fills |
|-----------|-----------|-----------------|
| Monarch ($14.99/mo) | Bank integrations, clean UI, AI assistant | No personality awareness, finance-only |
| YNAB ($14.99/mo) | Zero-based budgeting | Steep learning curve, no personality |
| Todoist ($5/mo) | Clean task management | No personality, no finance, no wellness |
| Notion (free-$10/mo) | Flexible databases | Too manual, no personality engine |

**The intersection of productivity + finance + personality awareness is unclaimed.**

---

## Build-in-Public Content Strategy

Brand voice: Raw, honest, cyberpunk edge, approachable, technically credible. NOT arrogant.
"Still figuring it out. But I'm figuring it out in public."

Platforms: LinkedIn (~1,000+ followers), X (@Thanatos2185)
Angle: "When worlds collide" — Navy/oilfield/SCADA background meets AI agent architecture

---

## Risk Mitigations

- **Scope creep** → WIP limit enforced, phases are hard boundaries, Reality Checker agent
- **Burnout** → Weekly review includes burnout check, hard cap on hours
- **Stalling** → Ship Phase 1 in 6 weeks or kill it. No indefinite building.
- **Competing with Monarch** → Don't. Manual-first, personality-aware. Plaid only Phase 4.
- **No users** → Build-in-public starts Week 1, not after launch
