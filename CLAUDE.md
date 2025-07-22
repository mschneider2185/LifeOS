# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development**: `npm run dev` - Start Next.js development server
- **Build**: `npm run build` - Build for production
- **Start**: `npm start` - Start production server
- **Lint**: `npm run lint` - Run ESLint
- **Type Check**: `npm run type-check` - Run TypeScript type checking

## Architecture Overview

This is a **Next.js 14** personality assessment and growth platform called **Mind Map Pro**. The application helps users take personality tests (MBTI, DISC) and generates personalized reports and growth strategies.

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion for animations
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe integration
- **PDF Generation**: jsPDF + html2canvas
- **UI Components**: Lucide React icons, React Hot Toast

### Key Directories

- `app/` - Next.js App Router pages and API routes
  - `onboarding/` - User onboarding flow
  - `disc-test/` - DISC personality assessment
  - `mbti-test/` - MBTI personality assessment 
  - `dashboard/` - User dashboard
  - `results/` - Test results and reports
  - `api/reports/` - API for report generation
- `lib/` - Core utilities and database functions
  - `supabase.ts` - Database client and helper functions
  - `ai.ts` - AI integration utilities
- `types/` - TypeScript type definitions
  - `index.ts` - Core application types
  - `supabase.ts` - Database schema types

### Database Architecture

The application uses **Supabase** with these key tables:
- `mbti_questions` - MBTI test questions
- `disc_questions` - DISC test questions  
- `user_responses` - User test responses
- `mbti_results` - MBTI test results
- `disc_results` - DISC test results
- `personality_profiles` - User personality profiles
- `personality_reports` - Generated reports
- `user_goals` - User personal/professional goals
- `products` - Available products/services
- `orders` - Purchase orders

### Environment Setup

Required environment variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

### Database Setup

Run the SQL script in `database-setup.sql` to initialize:
- All required tables with proper relationships
- Sample MBTI and DISC questions
- Row Level Security policies
- Database constraints and indexes

### Key Features

1. **Personality Testing Flow**:
   - Users take MBTI or DISC assessments
   - Questions loaded dynamically from database
   - Responses saved with scoring logic
   - Results calculated and stored

2. **Report Generation**:
   - AI-powered personality analysis
   - PDF report generation with visualizations
   - Personalized growth recommendations

3. **User Onboarding**:
   - Multi-step personality assessment
   - Goal setting (personal/professional)
   - Profile completion

### Code Patterns

- Use the `db` object from `lib/supabase.ts` for database operations
- TypeScript types are defined in `types/` directory
- Component styling uses Tailwind CSS classes
- Toast notifications via `react-hot-toast`
- All personality test data flows through Supabase

### Important Notes

- Questions have fallback to hardcoded data if database connection fails
- Both MBTI and DISC tests follow similar patterns for consistency
- Results are stored in both database and localStorage for reliability
- Path aliases configured: `@/*` maps to project root