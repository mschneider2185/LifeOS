# LifeOS — Existing Codebase Reference (mind-map-pro)

## Critical Discovery

Michael's existing repo `github.com/mschneider2185/mind-map-pro` is NOT a separate product. It is the **foundation codebase for LifeOS**. The personality assessment engine — the core differentiator — is already partially built.

## What Already Exists (Reusable)

### Tech Stack (EXACT match to LifeOS plan)
- Next.js 14 (App Router)
- React 18, TypeScript
- Tailwind CSS, Framer Motion
- Supabase (PostgreSQL, Auth)
- Stripe (payment integration)
- jsPDF + html2canvas (report generation)
- Lucide React icons

### Working Features
- **MBTI Assessment** — Complete quiz with dynamic questions from database
- **DISC Assessment** — Complete quiz with scoring
- **AI-Powered Analysis** — Personality analysis integration
- **PDF Reports** — Generated reports with visualizations
- **User Authentication** — Supabase Auth fully wired
- **User Dashboard** — Profile management, progress tracking
- **Goal Setting** — Personal and professional goal management
- **Stripe Payments** — Premium features payment flow
- **Onboarding Flow** — User onboarding sequence

### Existing Database Schema (database-setup.sql)
```
mbti_questions     — MBTI test questions
disc_questions     — DISC test questions  
user_responses     — User test responses
mbti_results       — MBTI test results
disc_results       — DISC test results
personality_profiles — User personality profiles
personality_reports  — Generated reports
user_goals         — User goals
products           — Available products/services
orders             — Purchase orders
```

### Project Structure
```
mind-map-pro/
├── app/
│   ├── api/               # API routes (KEEP)
│   ├── dashboard/         # User dashboard (EXTEND)
│   ├── disc-test/         # DISC assessment (KEEP)
│   ├── mbti-test/         # MBTI assessment (KEEP)
│   ├── onboarding/        # User onboarding (EXTEND)
│   ├── results/           # Test results (KEEP)
│   └── globals.css        # Global styles (RESTYLE)
├── lib/
│   ├── supabase.ts        # Database client (KEEP)
│   └── ai.ts              # AI integration (EXTEND)
├── types/
│   ├── index.ts           # Core types (EXTEND)
│   └── supabase.ts        # Database types (EXTEND)
├── database-setup.sql     # Database init (EXTEND)
├── CLAUDE.md              # Claude Code instructions (UPDATE)
├── DISC_IMPLEMENTATION_README.md  # DISC implementation docs
└── package.json           # Dependencies (already correct)
```

### Key Files to Review First
1. `CLAUDE.md` — Contains Claude Code project instructions (update for LifeOS)
2. `DISC_IMPLEMENTATION_README.md` — Documents how DISC scoring works
3. `database-setup.sql` — Full schema, needs extension for productivity + finance tables
4. `lib/ai.ts` — AI integration point (extend for coaching nudges)
5. `app/dashboard/` — Existing dashboard (replace with LifeOS glassmorphic dashboard)

## What Needs to Be Added (LifeOS Extensions)

### New App Routes
```
app/
├── (existing personality routes stay)
├── projects/              # Project tracker with WIP limits
├── checkin/               # Daily 30-second check-in
├── brain-dump/            # Zero-friction capture
├── goals/                 # Goals with consequence framing (extend existing)
├── weekly-review/         # Weekly review scorecard
├── finance/               # Financial dashboard (Phase 2)
│   ├── cash-flow/
│   ├── net-worth/
│   ├── debts/
│   └── goals/
└── settings/              # System config based on personality
```

### New Database Tables (add to database-setup.sql)
```sql
-- Productivity (Phase 1)
projects, daily_checkins, brain_dumps, weekly_reviews
-- Extend existing: user_goals (add consequence_text, life_area, key_results)
-- Extend existing: personality_profiles (add system_config jsonb)

-- Finance (Phase 2)  
monthly_cash_flow, net_worth_snapshots, debts, recurring_expenses, financial_goals
```

### Design System Overhaul
- Current: Unknown (likely default Tailwind)
- Target: Dark glassmorphic cyberpunk aesthetic
- Colors: Dark bg (#0a0a0f), cyan accent (#00d4ff), purple (#8b5cf6)
- Typography: Geist or SF Pro Display
- Components: Glass cards with backdrop-filter, glow borders, animated counters

## Migration Plan: mind-map-pro → LifeOS

### Step 1: Fork & Rename
- Fork mind-map-pro to new repo: `lifeos-app` (or `schneider-lifeos`)
- Update package.json name, README, CLAUDE.md
- Keep all existing code — it's the personality engine

### Step 2: Extend Database
- Add productivity tables to database-setup.sql
- Add system_config column to personality_profiles
- Add profile-to-config mapping function
- Run migration on existing Supabase project

### Step 3: Add Big Five Assessment
- Current: MBTI + DISC only
- Needed: Big Five (especially Neuroticism + Conscientiousness)
- Add big5_questions table and scoring logic
- Extend personality_profiles with Big Five scores

### Step 4: Build Profile-to-Config Engine
- Takes assessment results → generates system_config JSON
- Config drives: WIP limit, dashboard layout, coaching tone, feature emphasis
- See lifeos-personality-engine.md for full mapping spec

### Step 5: Restyle Dashboard
- Replace current dashboard with LifeOS glassmorphic design
- Add: Projects panel, Check-in panel, Brain dump, WIP gauge
- Keep: Results display, goal tracking, report generation

### Step 6: Add Productivity Features
- Projects with WIP limits
- Daily check-in (30-second form)
- Brain dump zone
- Weekly review scorecard
- Goals with consequence framing

### Step 7: Deploy
- Already configured for Next.js on Vercel
- Stripe already integrated
- Supabase already connected

## Why This Changes the Timeline

**Original estimate:** 6 weeks for Phase 1 from scratch
**Revised estimate:** 3-4 weeks for Phase 1, because:
- Auth is done
- MBTI + DISC assessments are done
- Supabase connection is done
- Stripe is done
- Dashboard scaffolding exists
- User management exists
- Goal setting exists (needs extension, not rebuild)
- Onboarding flow exists

The hardest part of any app (auth + payments + database + user management) is already working. You're adding features to an existing app, not building from zero.

## What This Means for the Product

mind-map-pro was originally positioned as a standalone personality assessment tool. In the LifeOS context, the assessment becomes the **onboarding step** that configures the entire life management system. The pivot:

- **Before:** Take personality test → get PDF report → done
- **After:** Take personality test → system configures to your brain → manage your entire life in a tool that understands you

The assessment isn't the product anymore. The assessment is the *key that unlocks* the product.
