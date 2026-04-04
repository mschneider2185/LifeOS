'use client';

import { clsx } from 'clsx';

type BadgeVariant = 'cyan' | 'purple' | 'red' | 'orange' | 'green';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  cyan: 'bg-cyan-accent/15 text-cyan-accent border-cyan-accent/30',
  purple: 'bg-purple-accent/15 text-purple-accent border-purple-accent/30',
  red: 'bg-danger/15 text-danger border-danger/30',
  orange: 'bg-warning/15 text-warning border-warning/30',
  green: 'bg-success/15 text-success border-success/30',
};

export function StatusBadge({ label, variant = 'cyan', className }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border',
        variantClasses[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
