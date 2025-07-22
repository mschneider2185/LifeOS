# Mind Map Pro

A comprehensive personality assessment and growth platform built with Next.js 14, featuring MBTI and DISC personality testing with AI-powered analysis and personalized growth strategies.

## 🚀 Features

- **Personality Assessments**: Complete MBTI and DISC personality tests
- **AI-Powered Analysis**: Intelligent personality analysis and insights
- **Personalized Reports**: Detailed PDF reports with visualizations
- **Growth Strategies**: Tailored recommendations for personal and professional development
- **User Dashboard**: Comprehensive user management and progress tracking
- **Secure Authentication**: Supabase-powered user authentication
- **Payment Integration**: Stripe payment processing for premium features

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **PDF Generation**: jsPDF + html2canvas
- **UI Components**: Lucide React, React Hot Toast

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account (for payments)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd mind-map-pro
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 4. Database Setup

Run the SQL script in `database-setup.sql` in your Supabase SQL editor to initialize:
- All required tables with proper relationships
- Sample MBTI and DISC questions
- Row Level Security policies
- Database constraints and indexes

### 5. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
mind-map-pro/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   ├── disc-test/         # DISC assessment
│   ├── mbti-test/         # MBTI assessment
│   ├── onboarding/        # User onboarding
│   ├── results/           # Test results
│   └── globals.css        # Global styles
├── lib/                   # Core utilities
│   ├── supabase.ts        # Database client
│   └── ai.ts             # AI integration
├── types/                 # TypeScript definitions
│   ├── index.ts          # Core types
│   └── supabase.ts       # Database types
├── database-setup.sql     # Database initialization
└── package.json          # Dependencies
```

## 🧪 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🔧 Key Features

### Personality Testing
- **MBTI Assessment**: Complete Myers-Briggs Type Indicator test
- **DISC Assessment**: DISC personality profile assessment
- **Dynamic Questions**: Questions loaded from database with fallback
- **Real-time Scoring**: Immediate scoring and result calculation

### Report Generation
- **AI Analysis**: Intelligent personality analysis using AI
- **PDF Reports**: Professional PDF reports with visualizations
- **Growth Recommendations**: Personalized development strategies
- **Visual Charts**: Interactive charts and graphs

### User Management
- **Secure Authentication**: Supabase-powered user authentication
- **Profile Management**: Complete user profile system
- **Progress Tracking**: Track assessment history and growth
- **Goal Setting**: Personal and professional goal management

## 🗄️ Database Schema

Key tables include:
- `mbti_questions` - MBTI test questions
- `disc_questions` - DISC test questions
- `user_responses` - User test responses
- `mbti_results` - MBTI test results
- `disc_results` - DISC test results
- `personality_profiles` - User personality profiles
- `personality_reports` - Generated reports
- `user_goals` - User goals
- `products` - Available products/services
- `orders` - Purchase orders

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@mindmappro.com or create an issue in this repository.

## 🔮 Roadmap

- [ ] Advanced analytics dashboard
- [ ] Team assessment features
- [ ] Mobile app development
- [ ] Integration with HR platforms
- [ ] Advanced AI insights
- [ ] Multi-language support 