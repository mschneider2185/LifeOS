'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { CoachingTone, BurnoutLevel } from '@/types/lifeos';

interface DashboardHeaderProps {
  userName: string | null;
  coachingTone: CoachingTone;
  burnoutLevel: BurnoutLevel;
}

const greetings: Record<CoachingTone, string> = {
  commander: "Let's get after it.",
  cheerleader: 'Great to see you!',
  analyst: "Here's your data.",
  coach: 'Take a breath. Let\'s see where you are.',
  commander_coach_analyst: "Let's get after it.",
};

const burnoutConfig: Record<BurnoutLevel, { color: string; label: string }> = {
  green: { color: 'bg-success', label: 'Good' },
  yellow: { color: 'bg-warning', label: 'Watch' },
  orange: { color: 'bg-orange-500', label: 'Caution' },
  red: { color: 'bg-danger', label: 'Burnout Risk' },
};

export function DashboardHeader({ userName, coachingTone, burnoutLevel }: DashboardHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const burnout = burnoutConfig[burnoutLevel];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <header className="flex items-center justify-between gap-4 mb-6">
      {/* Left: brand + greeting */}
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-white">LifeOS</h1>
        <p className="text-sm text-text-secondary mt-0.5 truncate">
          {userName ? `${userName} — ` : ''}
          {greetings[coachingTone]}
        </p>
      </div>

      {/* Right: burnout badge + user menu */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Burnout indicator */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-glass-border text-xs"
          aria-label={`Burnout level: ${burnout.label}`}
        >
          <span className={`w-2 h-2 rounded-full ${burnout.color}`} />
          <span className="text-text-secondary">{burnout.label}</span>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 rounded-full bg-purple-accent/20 border border-purple-accent/30 flex items-center justify-center text-sm font-medium text-purple-accent hover:bg-purple-accent/30 transition-colors"
            aria-label="User menu"
            aria-expanded={menuOpen}
          >
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-40 glass-card !p-2 z-50 text-sm">
                <Link
                  href="/settings"
                  className="block px-3 py-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 rounded-lg text-text-secondary hover:text-danger hover:bg-white/5 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
