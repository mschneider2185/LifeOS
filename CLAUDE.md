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

## Notion Integration

### Architecture
Notion serves as a secondary data layer alongside Supabase. API routes in `app/api/notion/` handle all Notion API communication server-side. The Notion SDK (`@notionhq/client`) is used exclusively in server code — no client-side Notion calls.

### Database IDs
| Database       | ID                                 | Maps to                        |
|----------------|------------------------------------|--------------------------------|
| Check-ins      | `be279e07e4494391936c8134f0d053d4` | Daily 30-second check-ins      |
| Goals          | `17f3f35170e04ce2911fcb76182ba62f` | Goals with consequence framing |
| Projects       | `7254b157403c4640acae675505cc409d` | Project tracker with WIP limits|
| Tasks          | `2d3e7ce2e2a080329387eddaa6263ee3` | Task management                |
| Health         | `4e8edb28aaaf4486890d5245731f0db2` | Health & wellness tracking     |
| Brain Dump     | `331e7ce2e2a0814c94eef2d3a18a8a87` | Zero-friction capture (page)   |

### Setup
1. Create integration at [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Share each database/page with the integration
3. Add `NOTION_API_KEY` to `.env.local`
4. See `scripts/setup-notion.md` for the full step-by-step guide

### Parallel Development Workflow
| Role             | Owns                                                        |
|------------------|-------------------------------------------------------------|
| **Backend Dev**  | `app/api/notion/`, `lib/notion.ts` — API routes & SDK layer |
| **DevOps**       | `.env.example`, `next.config.js`, `vercel.json`, `.gitignore`, `scripts/` — config & deployment |
| **Frontend Dev** | `app/*/page.tsx`, `components/` — UI components that call the API routes |

Do NOT cross boundaries without coordinating. Backend owns the Notion SDK integration; Frontend consumes it via fetch to `/api/notion/*`.

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=<from .env.local>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from .env.local>
SUPABASE_SERVICE_ROLE_KEY=<from .env.local>

# Stripe
STRIPE_SECRET_KEY=<existing>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<existing>
STRIPE_WEBHOOK_SECRET=<existing>

# Notion (server-only — no NEXT_PUBLIC_ prefix)
NOTION_API_KEY=<from notion.so/my-integrations>
NOTION_CHECKIN_DB=be279e07e4494391936c8134f0d053d4
NOTION_GOALS_DB=17f3f35170e04ce2911fcb76182ba62f
NOTION_PROJECTS_DB=7254b157403c4640acae675505cc409d
NOTION_TASKS_DB=2d3e7ce2e2a080329387eddaa6263ee3
NOTION_HEALTH_DB=4e8edb28aaaf4486890d5245731f0db2
NOTION_BRAINDUMP_PAGE=331e7ce2e2a0814c94eef2d3a18a8a87

# App
NEXT_PUBLIC_APP_URL=<your deployed URL>
```

See `.env.example` for a copyable template with setup instructions.

## Sprint Backlog — Phase 1 MVP (Auto-Resume)

**How this works:** When starting a new session, read this backlog. Pick the first task marked 🔲 and execute it fully. When done, mark it ✅, update the completion date, commit with message "sprint: [task description]", and then pick the next 🔲 task. Continue until you run out of context or the user stops you.

**Deadline:** May 10, 2026
**Kill criteria:** If Phase 1 isn't shipped and dogfooded by May 10, kill the project.

**To start a session, the user just types:** `Continue the sprint.`

---

### Completed Tasks

✅ **T01** — Notion API routes: GET endpoints for projects, goals, checkins, health, tasks, dashboard (2026-04-04)
  - Files: `app/api/notion/*/route.ts`, `lib/notion.ts`, `types/notion.ts`

✅ **T02** — DevOps config: .env.example, vercel.json, CLAUDE.md updates, scripts/setup-notion.md (2026-04-04)
  - Files: `.env.example`, `vercel.json`, `next.config.js`, `.gitignore`, `scripts/`

✅ **T03** — Frontend pages: Dashboard, Check-in, Brain Dump, Projects, Goals, Health, Weekly Review (2026-04-04)
  - Files: `app/*/page.tsx`, `components/lifeos/*`

✅ **T04** — Design system: globals.css, tailwind.config.js, constants, hooks (2026-04-04)
  - Files: `app/globals.css`, `tailwind.config.js`, `lib/hooks/`, `lib/constants.ts`

✅ **T05** — App shell: routing, sidebar, mobile nav, auth redirects (2026-04-04)
  - Files: `app/layout.tsx`, `app/page.tsx`

✅ **T06** — Debug Notion connection: env var reading, database sharing (2026-04-04)
  - Files: `lib/notion.ts`

---

### Active Sprint — Week 2 (April 5-11)

✅ **T07** — Projects CRUD: Make projects editable from the app (2026-04-04)
  - **Backend:** Create `app/api/notion/projects/[id]/route.ts` with PATCH handler
    - Accept: `{ status, nextAction, weeklyTimeCap, tier, energyLevel, notes }`
    - Map to Notion properties: "Status (Active/Maintenance/Parked)", "Next Action", "Weekly Time Cap (hrs)", "Tier (1/2/3)", "Energy Level (Low/Medium/Deep)", "Notes"
    - Use `notion.pages.update()` with the page ID from the URL param
  - **Frontend:** Update `app/projects/page.tsx`
    - Add status dropdown on each project card (Active / Maintenance / Parked)
    - Add inline-editable "Next Action" field (click to edit, blur/Enter to save)
    - PATCH `/api/notion/projects/[id]` on change
    - Optimistic UI: update local state immediately, revert on error
    - Show brief save indicator (subtle checkmark or border flash, NOT a modal)
  - **Files:** `app/api/notion/projects/[id]/route.ts`, `app/projects/page.tsx`
  - **Test:** Change a project from Active to Parked in the app, verify it updates in Notion

✅ **T08** — Goals CRUD: Make goals editable from the app (2026-04-04)
  - **Backend:** Create `app/api/notion/goals/[id]/route.ts` with PATCH handler
    - Accept: `{ status, progressPercent, reviewNotes, keyResult1, keyResult2, keyResult3 }`
    - Map to Notion properties: "Status", "Progress %", "Review Notes", "Key Result 1", "Key Result 2", "Key Result 3"
  - **Frontend:** Update `app/goals/page.tsx`
    - Add progress adjuster (slider or +10/-10 buttons) for Progress %
    - Add status toggle: Not started → In progress → Done
    - Inline-editable key results
    - PATCH `/api/notion/goals/[id]` on change
  - **Files:** `app/api/notion/goals/[id]/route.ts`, `app/goals/page.tsx`
  - **Test:** Update goal progress to 60% in the app, verify in Notion

✅ **T09** — Tasks CRUD: Create and manage tasks from the app (2026-04-04)
  - **Backend:** Add POST to `app/api/notion/tasks/route.ts`
    - Accept: `{ task, status, effort, timeBlock, type, projectId }`
    - Create page in Tasks database with Notion properties
  - **Backend:** Create `app/api/notion/tasks/[id]/route.ts` with PATCH handler
    - Accept: `{ status }` — toggle between Not started / Doing / Paused / Done
  - **Frontend:** Create or update tasks section
    - Show tasks grouped by status
    - Quick-add input at top: type task name, Enter to create
    - Click task to toggle status forward (Not started → Doing → Done)
    - Show effort and time block tags
  - **Files:** `app/api/notion/tasks/route.ts`, `app/api/notion/tasks/[id]/route.ts`, `app/projects/page.tsx` or `app/tasks/page.tsx`
  - **Test:** Create a new task, mark it Done, verify in Notion

✅ **T10** — Create new projects from the app (2026-04-04)
  - **Backend:** Add POST to `app/api/notion/projects/route.ts`
    - Accept: `{ projectName, status, tier, weeklyTimeCap, energyLevel, nextAction, notes }`
    - Enforce WIP limit: if active count >= 4 and status is "Active", return error with message
  - **Frontend:** Add "New Project" button on projects page
    - Modal or inline form with fields for name, tier, time cap, energy level
    - WIP enforcement: disable "Active" status option if already at limit
  - **Files:** `app/api/notion/projects/route.ts`, `app/projects/page.tsx`
  - **Test:** Create a new project, verify WIP limit enforcement

✅ **T11** — Create new goals from the app (2026-04-04)
  - **Backend:** Add POST to `app/api/notion/goals/route.ts`
    - Accept: `{ goal, status, quarter, lifeArea, progressPercent, ifIDontDoThis, keyResult1, keyResult2, keyResult3, targetDate }`
  - **Frontend:** Add "New Goal" button on goals page
    - Form with: goal name, life area selector, quarter selector, consequence text, key results, target date
    - Consequence framing field is required (prompt: "What happens if you DON'T do this?")
  - **Files:** `app/api/notion/goals/route.ts`, `app/goals/page.tsx`

🔲 **T12** — Vercel deployment
  - Import `mschneider2185/LifeOS` repo in Vercel dashboard
  - Add all env vars from `.env.local` to Vercel project settings
  - Verify build succeeds and all routes work on the deployed URL
  - Update `NEXT_PUBLIC_APP_URL` in Vercel env vars
  - Test on mobile browser
  - **Files:** None (manual Vercel dashboard task — but verify `vercel.json` and `next.config.js` are correct)

🔲 **T13** — Mobile responsive polish
  - Test every page at 375px width
  - Fix any overflow, truncation, or touch target issues
  - Ensure bottom nav works correctly on mobile
  - Check-in form must be fully usable on phone (this is the #1 mobile use case)
  - Brain dump textarea must be comfortable to type in on mobile
  - **Files:** All `app/*/page.tsx` and `components/lifeos/*`

🔲 **T14** — Auth guards on all LifeOS routes
  - Wrap all productivity routes in auth check
  - Redirect to `/` (login) if not authenticated
  - Use existing Supabase auth from `lib/supabase.ts`
  - Assessment routes (/mbti-test, /disc-test, /onboarding) keep their own auth flow
  - **Files:** `app/dashboard/page.tsx`, `app/projects/page.tsx`, `app/checkin/page.tsx`, `app/brain-dump/page.tsx`, `app/goals/page.tsx`, `app/health/page.tsx`, `app/weekly-review/page.tsx` (or create a shared middleware/wrapper)

🔲 **T15** — Loading states, error handling, empty states
  - Every page: show skeleton or loading pulse while data fetches
  - Every page: show user-friendly error message if API fails (not raw error)
  - Every page: show helpful empty state if no data exists yet (e.g. "No check-ins yet. Log your first one →")
  - Check-in form: show success state after submit, then redirect to dashboard
  - Brain dump: show success animation after save
  - **Files:** All `app/*/page.tsx`

---

### Week 3 Backlog (April 12-18) — Do NOT start until Week 2 is ✅

🔲 **T16** — Burnout detection integration
  - When check-in shows sleep < 7h for 2+ consecutive days AND exercise = false, auto-flag burnout warning
  - Show warning badge on dashboard
  - Calculate from check-in history, display on health page

🔲 **T17** — Weekly review wizard
  - 6-step guided flow: Wins → Blockers → Energy patterns → Goal review → Next week plan → Burnout check
  - Pull data from that week's check-ins to pre-populate
  - Save review to Notion

🔲 **T18** — Onboarding flow update
  - Add Big Five assessment to the pipeline: MBTI → DISC → Big Five → Dashboard
  - After all assessments complete, run profile-to-config engine
  - Store system_config in personality_profiles table
  - Dashboard reads config and adjusts UI accordingly

🔲 **T19** — Settings page
  - View personality profile summary (DISC, MBTI, Big Five scores)
  - View system config (WIP limit, coaching tone, burnout detection on/off)
  - Allow manual override of WIP limit

🔲 **T20** — Clean up dead code
  - Remove old Mind Map Pro landing page components
  - Remove unused routes and components
  - Remove `database-setup.sql.sql` (double extension), `cleanup.ps1`, `gitignore-additions.txt`
  - Rename package.json name from "mind-map-pro" to "lifeos" (if not done)

🔲 **T21** — Project detail page
  - Create `app/projects/[id]/page.tsx` — detail view for a single project
  - Backend: `app/api/notion/projects/[id]/route.ts` already exists (PATCH), add GET handler that returns full project data + page content from Notion
  - Frontend: show all project properties (editable), full notes field, related tasks from Tasks database filtered by project relation, "If I DON'T finish this" consequence section
  - Link from project cards on the list page (click project name → detail page)
  - Back button to return to project list
  - Files: `app/projects/[id]/page.tsx`, `app/api/notion/projects/[id]/route.ts`

---

### Parallel Dev Rules

| Role | Owns | Does NOT Touch |
|------|------|---------------|
| Backend Dev | `app/api/notion/`, `lib/notion.ts` | `components/`, page files |
| Frontend Dev | `app/*/page.tsx`, `components/lifeos/` | `app/api/`, `lib/notion.ts` |
| DevOps | `.env*`, `vercel.json`, `next.config.js`, `scripts/` | `app/`, `lib/`, `components/` |

When two tasks touch different directories, they CAN run in parallel in separate Claude Code sessions.
When two tasks touch the same files, they MUST run sequentially.

### Anti-Scope-Creep Rules

1. NO finance UI in Phase 1. Tables exist but UI doesn't.
2. NO AI coaching. No Claude API calls for nudges. Phase 3.
3. NO mobile app. Responsive web only.
4. NO multi-user. Single user only.
5. If a feature idea comes up that isn't on this backlog → check with the user before building it.
