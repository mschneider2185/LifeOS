'use client';

import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
  noPadding?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className,
  as: Tag = 'div',
  noPadding = false,
  onClick,
}: GlassCardProps) {
  return (
    <Tag
      className={clsx(
        'glass-card transition-colors duration-200',
        noPadding && '!p-0',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </Tag>
  );
}
