'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: '◈' },
  { href: '/projects', label: 'Projects', icon: '▦' },
  { href: '/checkin', label: 'Check-in', icon: '✦' },
  { href: '/goals', label: 'Goals', icon: '◎' },
  { href: '/health', label: 'Health', icon: '♥' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-glass-border"
      style={{
        background: 'rgba(10, 10, 15, 0.95)',
        backdropFilter: 'blur(20px)',
      }}
      aria-label="Main navigation"
    >
      <div className="flex justify-around px-1 py-1.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-2 min-w-0 rounded-lg transition-colors ${
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
  );
}
