'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

/**
 * Client-side auth guard. Checks for a valid Supabase Auth session.
 * If unauthenticated, redirects to / (sign-in page).
 * Shows a loading spinner while the session check resolves — no flash of protected content.
 *
 * IMPORTANT: This checks ONLY for an auth session. It does NOT check for
 * personality_profiles, onboarding completion, or any other user state.
 * Those are separate concerns (T18).
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'authenticated'>('loading');

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStatus('authenticated');
      } else {
        router.replace('/');
      }
    }
    check();
  }, [router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div className="w-8 h-8 rounded-full border-2 border-cyan-accent/30 border-t-cyan-accent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
