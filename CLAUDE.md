# CLAUDE.md — LifeOS App

## Project Overview

LifeOS is a personality-aware life management platform. The personality assessment (MBTI, DISC, Big Five) configures the entire system — WIP limits, dashboard layout, coaching tone, financial insights — to match how the user's brain works.

**Repo:** github.com/mschneider2185/lifeos-app (forked from mind-map-pro)
**Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, Supabase, Stripe
**Deploy:** Vercel
**Design:** Dark glassmorphic cyberpunk — bg #0a0a0f, cyan #00d4ff, purple #8b5cf6

## Architecture

### Existing (from mind-map-pro — DO NOT BREAK)
- `app/mbti-test/` — MBTI assessment (working)
- `app/disc-test/` — DISC assessment (working)
- `app/results/` — Test results display (working)
- `app/onboarding/` — User onboarding flow (working)
- `app/api/` — API routes (working)
- `lib/supabase.ts` — Supabase client (working)
- `lib/ai.ts` — AI integration (working)
- Supabase Auth — fully wired
- Stripe payments — fully wired

### New (LifeOS extensions — Phase 1)
- `app/dashboard/` — REPLACE with LifeOS glassmorphic dashboard
- `app/projects/` — Project tracker with WIP limits
- `app/checkin/` — Daily 30-second check-in
- `app/brain-dump/` — Zero-friction capture zone
- `app/goals/` — Goals with consequence framing (extends existing user_goals)
- `app/weekly-review/` — Weekly review scorecard
- `app/settings/` — System config driven by personality profile

### Phase 2 (Finance — DO NOT BUILD YET)
- `app/finance/` — Cash flow, net worth, debts, goals

## Database

**Supabase project:** lifeos (fresh project, credentials in .env.local)
**Schema:** See `database-setup.sql` for full unified schema
**Key tables:** personality_profiles (has system_config JSONB), projects, daily_checkins, brain_dumps, weekly_reviews, user_goals
**RLS:** All tables have row-level security. Users can only access their own data.

## Design System

### Colors
- Background: `#0a0a0f` (near-black)
- Surface: `rgba(255, 255, 255, 0.05)` (glass)
- Border: `rgba(255, 255, 255, 0.1)`
- Cyan accent: `#00d4ff`
- Purple accent: `#8b5cf6`
- Success: `#10b981`
- Warning: `#f59e0b`
- Danger: `#ef4444`
- Text primary: `#ffffff`
- Text secondary: `rgba(255, 255, 255, 0.6)`

### Glass Card Pattern
```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}
```

### Typography
- Font: Geist (or system fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI')
- Headings: font-semibold, tracking-tight
- Body: font-normal, text-sm or text-base

## Core Design Principles

1. **30-Second Rule** — Every interaction under 30 seconds or the UX is broken
2. **WIP Limit of 4** — Hard cap on active projects. Enforce visually with gauge.
3. **Consequence Framing** — Goals answer "What happens if I DON'T do this?"
4. **Energy Matching** — Tasks/projects tagged by energy level
5. **Brain Dump First** — Overwhelmed? Dump before plan.
6. **Visible Wins** — Progress bars, streaks, celebration prompts
7. **Burnout Detection** — Auto-flag when sleep < 7h for 2+ days + no exercise

## Personality Engine

The system_config in personality_profiles drives:
- `wip_limit` (2-8, calculated from Big Five conscientiousness + neuroticism)
- `brain_dump_enabled` (true if neuroticism > 70th)
- `consequence_framing` (true if MBTI T + conscientiousness < 50th)
- `energy_matching` (true if MBTI P or conscientiousness < 50th)
- `burnout_detection` (true if neuroticism > 80th)
- `coaching_tone` (commander | cheerleader | analyst | coach)

## Development Rules

1. **Never break existing personality assessments** — MBTI and DISC flows are sacred
2. **Phase boundaries are hard** — Don't build finance features in Phase 1
3. **Mobile-first** — All new components must work on 375px width
4. **Accessibility** — All interactive elements need aria labels and keyboard nav
5. **Type everything** — No `any` types. Extend `types/supabase.ts` for new tables.
6. **Test the 30-second rule** — If a check-in or brain dump takes more than 30 seconds, redesign it

## Key Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript check
```

## File Naming Conventions

- Components: PascalCase (`ProjectCard.tsx`, `CheckInForm.tsx`)
- Pages: lowercase with hyphens (Next.js convention, `app/brain-dump/page.tsx`)
- Utils/hooks: camelCase (`usePersonalityConfig.ts`, `calculateWipLimit.ts`)
- Types: PascalCase (`Project`, `DailyCheckIn`, `PersonalityProfile`)

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=<from .env.local>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from .env.local>
STRIPE_SECRET_KEY=<existing>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<existing>
```
