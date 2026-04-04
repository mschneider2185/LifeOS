# LifeOS — Phase 1 Sprint Plan

## Phase 1 Goal
Ship the Productivity MVP. Dogfood it for 2 weeks. Then decide if it's worth building Phase 2 (Finance).

**Deadline:** 6 weeks from start (May 10, 2026)
**Kill criteria:** If Phase 1 isn't shipped and dogfooded by May 10, kill the project. No indefinite building.

---

## Week 1 (March 29 – April 4): Foundation

### Completed ✅
- Fork mind-map-pro → lifeos-app repo
- Fresh Supabase project with unified 21-table schema
- 7 migrations applied (personality engine + productivity + finance stubs + indexes + RLS + triggers + helper functions + Big Five seed data)
- Design system overhaul (globals.css + tailwind.config.js)
- GlassCard, WipGauge reusable components
- Projects page with CRUD + WIP enforcement
- Big Five assessment quiz (20 questions, forced-choice slider, scoring, profile-to-config engine)
- personality-config.ts (profile → system_config engine)
- TypeScript types for all tables (types/lifeos.ts)
- Updated CLAUDE.md, README.md, database-setup.sql

### In Progress
- Dashboard layout (5 panels, personality-driven)
- Landing page replacement (kill Mind Map Pro branding)

### Remaining This Week
- Daily check-in form
- Brain dump capture + triage

---

## Week 2 (April 5 – 11): Core Features

### Goals
- Goals page with consequence framing + key results
- Weekly review wizard (guided 6-step ritual)
- Navigation/sidebar with all routes
- Onboarding flow updated: MBTI → DISC → Big Five → Dashboard
- Settings page (view/edit personality config)

### Acceptance Criteria
- All 7 productivity routes functional: dashboard, projects, checkin, brain-dump, goals, weekly-review, settings
- Full assessment pipeline works end-to-end: sign up → assessments → system configures → dashboard shows personality-driven UI
- Can create account, take assessments, create projects, do a check-in, dump a brain item, set a goal, complete a weekly review

---

## Week 3 (April 12 – 18): Polish & Integration

### Goals
- Fix bugs from Week 1-2 builds
- Test all flows on mobile (375px)
- Ensure auth redirects work correctly
- Add loading states, error handling, empty states everywhere
- Burnout detection integration (check-in data → burnout badge on dashboard)
- Deploy to Vercel (staging)

### Acceptance Criteria
- Staging URL works end-to-end
- No broken routes or missing auth guards
- Mobile experience is usable (not just "doesn't crash")

---

## Week 4 (April 19 – 25): Dogfooding Begins

### Goals
- Deploy to production on Vercel
- Michael uses LifeOS daily for real project/goal/check-in tracking
- Log all bugs, friction points, and missing features
- First build-in-public post with real screenshots
- Migrate personal data from Notion to LifeOS (at least projects + active goals)

### Key Questions to Answer
- Does the 30-second check-in actually take 30 seconds?
- Is the WIP gauge motivating or annoying?
- Does consequence framing on goals change behavior?
- Is the weekly review worth doing every week?
- Does the burnout detection catch real patterns?

---

## Week 5 (April 26 – May 2): Iterate from Dogfooding

### Goals
- Fix top 5 friction points from dogfooding
- Improve whatever feels broken in daily use
- Add any missing "obvious" features (but check with Reality Checker first)
- Second build-in-public post
- Stripe integration check — does the existing payment flow still work?

---

## Week 6 (May 3 – 9): Ship Decision

### Goals
- Final bug fixes
- Prepare for soft launch: landing page polish, Stripe tiers active
- Write launch post for LinkedIn/X
- Decision: build Phase 2 (Finance) or pivot/kill?

### Decision Criteria for Phase 2 Go/No-Go
- Am I actually using LifeOS daily? (If not → kill)
- Has it replaced my Notion productivity setup? (If not → why?)
- Would I pay $9/mo for this as a user? (Honest answer)
- Do I have at least 3 people interested in trying it? (From build-in-public)

---

## Phase 1 Feature Inventory

| Feature | Status | Owner | Depends On |
|---------|--------|-------|------------|
| Design system (globals.css, tailwind) | ✅ Done | Claude Code | — |
| Projects page + WIP enforcement | ✅ Done | Claude Code | Design system |
| Big Five assessment | ✅ Done | Claude Code | Supabase seed data |
| Dashboard (5 panels) | 🔄 Building | Claude Code | Design system, GlassCard |
| Landing page (replace MMP) | 📋 Ready | Claude Code | Design system |
| Daily check-in | 📋 Ready | Claude Code | Design system |
| Brain dump | 📋 Ready | Claude Code | Design system |
| Goals page | 📋 Ready | Claude Code | Design system |
| Weekly review | 📋 Ready | Claude Code | Design system, check-in data |
| Navigation/sidebar | 📋 Pending | Claude Code | All routes |
| Settings page | 📋 Pending | Claude Code | personality_profiles |
| Onboarding update (add Big Five) | 📋 Pending | Claude Code | Big Five quiz |
| Vercel deployment | 📋 Pending | Claude Code / Manual | All routes |
| Stripe verification | 📋 Pending | Manual | Existing integration |

---

## WIP Check ⚠️

Current active projects (from product knowledge):
1. OpenClaw — Tier 1, Active
2. Card Collector Pro — Tier 1, Active
3. LinkedIn/X Content — Tier 1, Active
4. FleetSync/SMS — Tier 2, Active
5. N8N Pipelines — Tier 2, Active
6. Lawsuit/Legal — Tier 2, Active
7. LifeOS — Tier 2, Active

**7 active vs 4 WIP limit.** Must park at least 3 to respect the system you're building. Candidates to park: FleetSync, N8N Pipelines, OpenClaw (unless it directly supports LifeOS).

---

## Anti-Scope-Creep Rules

1. NO finance features in Phase 1. Tables exist but UI doesn't.
2. NO AI coaching. No Claude API calls for nudges. Phase 3.
3. NO Notion integration. Manual data entry only.
4. NO mobile app. PWA or responsive web only.
5. NO user management beyond single user. Multi-tenant is Phase 4.
6. If a feature idea comes up that isn't on this list → Reality Checker reviews it before any work starts.
