'use client';

import { motion } from 'framer-motion';

interface LoadingPulseProps {
  message?: string;
}

export function LoadingPulse({ message = 'Syncing with Notion...' }: LoadingPulseProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <motion.div
        className="w-10 h-10 rounded-full border-2 border-cyan-accent/30 border-t-cyan-accent"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <p className="text-sm text-text-secondary">{message}</p>
    </div>
  );
}
