'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function RootPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/dashboard');
      } else {
        setChecking(false);
      }
    }
    check();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Check your email to confirm, then sign in.');
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        router.replace('/dashboard');
        return;
      }
    }
    setSubmitting(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-accent/30 border-t-cyan-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-cyan-accent/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-cyan-accent font-bold text-xl">L</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">LifeOS</h1>
          <p className="text-sm text-text-secondary mt-1">Your life, configured to your brain.</p>
        </div>

        {/* Login form */}
        <div
          className="rounded-2xl border border-glass-border p-6"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-white block mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field !py-2.5 text-sm"
                required
                autoComplete="email"
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium text-white block mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field !py-2.5 text-sm"
                required
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full !py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-text-secondary hover:text-white transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        {/* Footer link to onboarding */}
        <p className="text-center text-xs text-text-secondary mt-6">
          New here?{' '}
          <a href="/onboarding" className="text-cyan-accent hover:underline">
            Start with a personality assessment
          </a>
        </p>
      </motion.div>
    </div>
  );
}
