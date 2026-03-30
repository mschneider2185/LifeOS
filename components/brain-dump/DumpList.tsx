'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import type { BrainDump, BrainDumpCategory } from '@/types/lifeos';

interface DumpListProps {
  dumps: BrainDump[];
  onTriage: (id: string, category: NonNullable<BrainDumpCategory>) => Promise<void>;
}

const categories: { value: NonNullable<BrainDumpCategory>; label: string }[] = [
  { value: 'task', label: 'Task' },
  { value: 'idea', label: 'Idea' },
  { value: 'worry', label: 'Worry' },
  { value: 'note', label: 'Note' },
  { value: 'project', label: 'Project' },
  { value: 'someday', label: 'Someday' },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function DumpList({ dumps, onTriage }: DumpListProps) {
  const [triagingId, setTriagingId] = useState<string | null>(null);

  if (dumps.length === 0) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <p className="text-lg mb-1">Mind is clear</p>
        <p className="text-sm">Type above to dump something.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-warning mb-3">
        {dumps.length} item{dumps.length !== 1 ? 's' : ''} need triage
      </p>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {dumps.map((dump) => (
            <motion.div
              key={dump.id}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.2 }}
            >
              <GlassCard className="!p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white">{dump.content}</p>
                    <p className="text-xs text-text-secondary mt-1">
                      {timeAgo(dump.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setTriagingId(triagingId === dump.id ? null : dump.id)
                    }
                    className="text-xs text-cyan-accent hover:text-cyan-accent/80 transition-colors shrink-0 px-2 py-1 rounded hover:bg-white/5"
                    aria-label={`Triage "${dump.content.slice(0, 30)}"`}
                  >
                    Triage
                  </button>
                </div>

                {/* Category selector */}
                {triagingId === dump.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-glass-border"
                  >
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => {
                          setTriagingId(null);
                          onTriage(dump.id, cat.value);
                        }}
                        className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-glass-border text-text-secondary hover:text-white hover:border-cyan-accent/40 transition-colors"
                      >
                        {cat.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
