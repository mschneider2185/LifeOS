'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import type { BrainDump, BrainDumpCategory } from '@/types/lifeos';

interface TriagedListProps {
  dumps: BrainDump[];
}

const categoryColors: Record<NonNullable<BrainDumpCategory>, string> = {
  task: 'bg-cyan-accent/20 text-cyan-accent',
  idea: 'bg-purple-accent/20 text-purple-accent',
  worry: 'bg-warning/20 text-warning',
  note: 'bg-white/10 text-text-secondary',
  project: 'bg-success/20 text-success',
  someday: 'bg-white/10 text-text-secondary',
};

export function TriagedList({ dumps }: TriagedListProps) {
  const [expanded, setExpanded] = useState(false);

  if (dumps.length === 0) return null;

  // Group by category
  const grouped = new Map<string, BrainDump[]>();
  for (const dump of dumps) {
    const key = dump.category ?? 'uncategorized';
    const list = grouped.get(key) ?? [];
    list.push(dump);
    grouped.set(key, list);
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-text-secondary hover:text-white transition-colors mb-3"
        aria-expanded={expanded}
      >
        {expanded ? '▾' : '▸'} Show triaged ({dumps.length})
      </button>

      {expanded && (
        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([category, items]) => (
            <div key={category}>
              <span
                className={`inline-block text-xs px-2 py-0.5 rounded-full mb-2 ${
                  categoryColors[category as NonNullable<BrainDumpCategory>] ??
                  'bg-white/10 text-text-secondary'
                }`}
              >
                {category} ({items.length})
              </span>
              <div className="space-y-1.5">
                {items.map((dump) => (
                  <GlassCard key={dump.id} className="!p-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-white/80">{dump.content}</p>
                      {dump.triaged_at && (
                        <span className="text-[10px] text-text-secondary shrink-0">
                          {new Date(dump.triaged_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
