'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: '◈' },
  { href: '/projects', label: 'Projects', icon: '▦' },
  { href: '/checkin', label: 'Check-in', icon: '✦' },
  { href: '/brain-dump', label: 'Brain Dump', icon: '⚡' },
  { href: '/goals', label: 'Goals', icon: '◎' },
  { href: '/activity-log', label: 'Activity Log', icon: '▤' },
  { href: '/health', label: 'Health', icon: '♥' },
  { href: '/weekly-review', label: 'Review', icon: '☰' },
];

export function NavSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 bottom-0 w-[220px] flex-col border-r border-glass-border z-40"
      style={{
        background: 'rgba(10, 10, 15, 0.95)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Branding */}
      <div className="px-5 py-6 border-b border-glass-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-accent/20 flex items-center justify-center">
            <span className="text-cyan-accent font-bold text-sm">L</span>
          </div>
          <div>
            <span className="font-semibold text-white text-sm tracking-tight">LifeOS</span>
            <span className="block text-[10px] text-text-secondary leading-none mt-0.5">
              configured to your brain
            </span>
          </div>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Main navigation">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-cyan-accent/10 text-cyan-accent'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom personality summary */}
      <div className="px-4 py-4 border-t border-glass-border">
        <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">Personality</p>
        <p className="text-xs text-white/80">WIP Limit: 4</p>
        <p className="text-xs text-white/80">Tone: Coach</p>
      </div>
    </aside>
  );
}
