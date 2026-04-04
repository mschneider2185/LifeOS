'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

type GlowColor = 'cyan' | 'purple' | 'none';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: GlowColor;
  onClick?: () => void;
  noPadding?: boolean;
}

const glowBorders: Record<GlowColor, string> = {
  cyan: 'border-cyan-accent/30 hover:border-cyan-accent/60 hover:shadow-[0_0_20px_rgba(0,212,255,0.15)]',
  purple: 'border-purple-accent/30 hover:border-purple-accent/60 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]',
  none: 'border-glass-border hover:border-glass-border-hover',
};

export function GlassCard({
  children,
  className,
  glow = 'none',
  onClick,
  noPadding = false,
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.01 : 1 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        'rounded-2xl border transition-all duration-200',
        glowBorders[glow],
        noPadding ? '' : 'p-6',
        onClick && 'cursor-pointer',
        className,
      )}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
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
    </motion.div>
  );
}
