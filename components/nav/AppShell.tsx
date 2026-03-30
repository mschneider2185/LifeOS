'use client';

import { ReactNode } from 'react';
import { AppNav } from './AppNav';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <AppNav />
      {/* Content area: offset for side nav on desktop, bottom nav on mobile */}
      <div className="md:pl-16 pb-16 md:pb-0">
        {children}
      </div>
    </>
  );
}
