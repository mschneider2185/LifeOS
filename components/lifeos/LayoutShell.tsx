'use client';

import { useEffect, useState, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { NavSidebar } from './NavSidebar';
import { MobileNav } from './MobileNav';

/** Routes that skip the LifeOS nav shell (assessment pipeline, root login) */
const BARE_ROUTES = ['/', '/onboarding', '/mbti-test', '/disc-test', '/big5-test', '/results'];

/** Routes that require authentication */
const AUTH_ROUTES = ['/dashboard', '/checkin', '/brain-dump', '/projects', '/goals', '/health', '/weekly-review', '/settings'];

interface LayoutShellProps {
  children: ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const isBareRoute = BARE_ROUTES.includes(pathname);
  const needsAuth = AUTH_ROUTES.includes(pathname);

  useEffect(() => {
    if (!needsAuth) {
      setAuthChecked(true);
      return;
    }

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setAuthenticated(true);
      } else {
        router.replace('/');
        return;
      }
      setAuthChecked(true);
    }
    checkAuth();
  }, [needsAuth, router]);

  // Bare routes (login, assessments): render children directly, no nav
  if (isBareRoute) {
    return <>{children}</>;
  }

  // Auth routes: wait for auth check before rendering
  if (needsAuth && !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-accent/30 border-t-cyan-accent animate-spin" />
      </div>
    );
  }

  // Auth routes: redirect happened, don't render
  if (needsAuth && !authenticated) {
    return null;
  }

  // LifeOS routes: render with nav shell
  return (
    <>
      <NavSidebar />
      <MobileNav />
      <div className="md:pl-[220px] pb-16 md:pb-0 min-h-screen">
        {children}
      </div>
    </>
  );
}
