'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { supabase } from '@/lib/supabase';
import type { BrainDump } from '@/types/lifeos';
import toast from 'react-hot-toast';

interface BrainDumpPanelProps {
  untriagedDumps: BrainDump[];
  untriagedCount: number;
  userId: string;
  onNewDump: () => void;
}

export function BrainDumpPanel({ untriagedDumps, untriagedCount, userId, onNewDump }: BrainDumpPanelProps) {
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    const { error } = await supabase.from('brain_dumps').insert({
      user_id: userId,
      content: text,
      triaged: false,
    });

    if (error) {
      toast.error('Failed to save');
    } else {
      setInput('');
      toast.success('Captured!');
      onNewDump();
    }
    setSubmitting(false);
  };

  return (
    <GlassCard className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold tracking-tight text-white">Brain Dump</h2>
        {untriagedCount > 0 && (
          <Link
            href="/brain-dump"
            className="text-xs text-cyan-accent hover:text-cyan-accent/80 transition-colors"
          >
            Triage all
          </Link>
        )}
      </div>

      {/* Quick capture */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Dump it here..."
          className="input-field !py-2 text-sm flex-1"
          aria-label="Quick brain dump"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting || !input.trim()}
          className="btn-primary text-sm !py-2 !px-3 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          aria-label="Save brain dump"
        >
          +
        </button>
      </form>

      {/* Untriaged count */}
      {untriagedCount > 0 && (
        <p className="text-xs text-warning">
          {untriagedCount} item{untriagedCount !== 1 ? 's' : ''} need triage
        </p>
      )}

      {/* Recent items */}
      {untriagedDumps.length > 0 ? (
        <ul className="space-y-1.5">
          {untriagedDumps.map((dump) => (
            <li key={dump.id} className="text-sm text-text-secondary truncate">
              {dump.content}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-secondary text-center py-2">
          Clear mind. Nice.
        </p>
      )}
    </GlassCard>
  );
}
