'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Brain, Settings, LayoutDashboard } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'Personality assessment',
    description: 'MBTI + DISC + Big Five in under 5 minutes. No long surveys.',
  },
  {
    icon: Settings,
    title: 'Auto-configuring system',
    description: 'Your results set WIP limits, coaching tone, burnout thresholds, and dashboard layout.',
  },
  {
    icon: LayoutDashboard,
    title: 'Manage everything',
    description: 'Projects, goals, daily check-ins, brain dumps, weekly reviews. All personality-aware.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-5">
        <div className="max-w-[800px] mx-auto flex items-center justify-between">
          <span className="text-xl font-semibold tracking-tight text-white">LifeOS</span>
          <Link
            href="/auth/login"
            className="text-sm font-medium text-purple-accent hover:text-purple-accent/80 transition-colors"
            aria-label="Sign in to your account"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col justify-center px-6 py-16">
        <div className="max-w-[800px] mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6">
              Your life, configured to your brain.
            </h1>
            <p className="text-base md:text-lg text-text-secondary max-w-xl mx-auto leading-relaxed mb-10">
              Take a 5-minute personality assessment. LifeOS configures itself to match how you actually
              work — WIP limits, coaching style, burnout detection, and more.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/onboarding"
                className="btn-primary text-base px-8 py-3"
                aria-label="Get started with LifeOS"
              >
                Get Started
              </Link>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-purple-accent hover:text-purple-accent/80 transition-colors"
                aria-label="Sign in to your account"
              >
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* Feature cards */}
          <div className="mb-16">
            <p className="text-center text-xs uppercase tracking-widest text-text-secondary mb-8">
              What makes this different
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  className="glass-card text-center"
                >
                  <feature.icon className="h-8 w-8 text-cyan-accent mx-auto mb-4" aria-hidden="true" />
                  <h2 className="text-sm font-semibold text-white mb-2">{feature.title}</h2>
                  <p className="text-xs text-text-secondary leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6">
        <div className="max-w-[800px] mx-auto text-center">
          <p className="text-xs text-text-secondary">
            Built by{' '}
            <a
              href="https://www.linkedin.com/in/michael-schneider-a14035108/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-white transition-colors underline underline-offset-2"
            >
              Michael Schneider
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
