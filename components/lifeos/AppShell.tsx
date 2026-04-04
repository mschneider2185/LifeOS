'use client';

import { ReactNode } from 'react';
import { NavSidebar } from './NavSidebar';
import { MobileNav } from './MobileNav';

interface AppShellProps {
  children: ReactNode;
}

export function LifeOSShell({ children }: AppShellProps) {
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
