'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  requiresConfig?: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: '◈' },
  { href: '/projects', label: 'Projects', icon: '▦' },
  { href: '/checkin', label: 'Check-in', icon: '✦' },
  { href: '/brain-dump', label: 'Brain Dump', icon: '⚡', requiresConfig: 'brain_dump_enabled' },
  { href: '/goals', label: 'Goals', icon: '◎' },
  { href: '/weekly-review', label: 'Review', icon: '☰' },
];

export function AppNav() {
  const pathname = usePathname();
  const [brainDumpEnabled, setBrainDumpEnabled] = useState(true);

  useEffect(() => {
    async function checkConfig() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('personality_profiles')
        .select('system_config')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data?.system_config) {
        const config = data.system_config as Record<string, unknown>;
        if (typeof config.brain_dump_enabled === 'boolean') {
          setBrainDumpEnabled(config.brain_dump_enabled);
        }
      }
    }
    checkConfig();
  }, []);

  const visibleItems = navItems.filter((item) => {
    if (item.requiresConfig === 'brain_dump_enabled' && !brainDumpEnabled) return false;
    return true;
  });

  return (
    <>
      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-dark-bg/90 backdrop-blur-lg border-t border-glass-border"
        aria-label="Main navigation"
      >
        <div className="flex justify-around px-2 py-1">
          {visibleItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2 px-1 min-w-0 transition-colors ${
                  active ? 'text-cyan-accent' : 'text-text-secondary hover:text-white'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <span className="text-base">{item.icon}</span>
                <span className="text-[10px] truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop side nav */}
      <nav
        className="hidden md:flex fixed left-0 top-0 bottom-0 w-16 flex-col items-center py-6 gap-1 bg-dark-bg/80 backdrop-blur-lg border-r border-glass-border z-40"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="text-cyan-accent font-semibold text-sm mb-6">L</div>

        {visibleItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors text-base ${
                active
                  ? 'bg-cyan-accent/10 text-cyan-accent'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
            >
              {item.icon}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
