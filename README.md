# LifeOS

A personality-aware life management platform. Take a 5-minute psychometric assessment → the system configures itself to match how your brain works → manage projects, goals, habits, and finances in a tool that actually understands you.

## What Makes This Different

Every productivity app assumes everyone works the same way. LifeOS doesn't.

The personality engine (DISC + MBTI + Big Five) drives everything: your WIP limit, coaching tone, dashboard layout, burnout detection thresholds, and financial display preferences are all computed from your psychometric profile.

**High neuroticism + low conscientiousness?** You get a brain dump zone, 30-second check-ins, auto-archiving, and burnout monitoring. **High conscientiousness + low neuroticism?** You get detailed logging, rigid scheduling, and blunt accountability.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Row Level Security)
- **Payments:** Stripe
- **Hosting:** Vercel
- **Design:** Dark glassmorphic cyberpunk aesthetic

## Development

```bash
npm install
npm run dev
```

Create a `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

## Architecture

```
app/
├── api/                 # API routes
├── dashboard/           # Main LifeOS dashboard
├── disc-test/           # DISC personality assessment
├── mbti-test/           # MBTI personality assessment
├── onboarding/          # User onboarding flow
├── results/             # Assessment results
├── projects/            # Project tracker (WIP limits)
├── checkin/             # Daily 30-second check-in
├── brain-dump/          # Zero-friction capture
├── goals/               # Goals with consequence framing
├── weekly-review/       # Weekly review scorecard
└── settings/            # Personality-driven config

lib/
├── supabase.ts          # Database client
├── ai.ts                # AI integration
└── personality-config.ts # Profile → system config engine

types/
├── index.ts             # Core types
├── supabase.ts          # Database types
└── lifeos.ts            # LifeOS extended types
```

## Phases

- **Phase 1 (current):** Productivity MVP — assessments, dashboard, projects, check-ins, brain dump, goals, weekly review
- **Phase 2:** Finance module — cash flow, net worth, debts, recurring expenses
- **Phase 3:** AI coaching, N8N automation, Notion/Obsidian templates
- **Phase 4:** Plaid integration, mobile app, team features

## License

Private — not open source.
