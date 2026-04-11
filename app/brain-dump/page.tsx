'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { AuthGuard, GlassCard, LoadingPulse } from '@/components/lifeos';
import type { BrainDump, BrainDumpBody, BrainDumpCategory, NotionListResponse, NotionCreateResponse } from '@/types/notion';

const CATEGORIES: { value: BrainDumpCategory; label: string }[] = [
  { value: 'task', label: 'Task' },
  { value: 'idea', label: 'Idea' },
  { value: 'worry', label: 'Worry' },
  { value: 'note', label: 'Note' },
  { value: 'project', label: 'Project' },
  { value: 'someday', label: 'Someday' },
];

const CATEGORY_COLORS: Record<BrainDumpCategory, string> = {
  task: 'bg-cyan-accent/15 text-cyan-accent border-cyan-accent/30',
  idea: 'bg-purple-accent/15 text-purple-accent border-purple-accent/30',
  worry: 'bg-warning/15 text-warning border-warning/30',
  note: 'bg-white/10 text-text-secondary border-white/20',
  project: 'bg-success/15 text-success border-success/30',
  someday: 'bg-white/10 text-text-secondary border-white/20',
};

export default function BrainDumpPage() {
  return (
    <AuthGuard>
      <BrainDumpContent />
    </AuthGuard>
  );
}

function BrainDumpContent() {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<BrainDumpCategory | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [entries, setEntries] = useState<BrainDump[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch(`/api/notion/braindump?t=${Date.now()}`);
      const json = (await res.json()) as NotionListResponse<BrainDump>;
      if (json.error) {
        setError(json.error);
      } else {
        setEntries(json.data);
        setError(null);
      }
    } catch {
      setError('Failed to load brain dumps');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSubmit = useCallback(async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);

    try {
      const body: BrainDumpBody = { content: text.trim() };
      if (category) body.category = category;

      const res = await fetch('/api/notion/braindump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as NotionCreateResponse<BrainDump>;
      if (json.success && json.data) {
        setText('');
        setCategory(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
        // Prepend new entry to list
        setEntries((prev) => [json.data!, ...prev]);
      }
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }, [text, category, submitting]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      <main className="max-w-lg mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Brain Dump</h1>
          <p className="text-sm text-text-secondary mb-6">Type it out. Don&apos;t organize. Don&apos;t judge. Just dump.</p>
        </motion.div>

        {/* Rule callout */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <GlassCard glow="purple" className="mb-6 !py-4">
            <p className="text-sm text-purple-accent font-medium">Brain Dump First</p>
            <p className="text-xs text-text-secondary mt-1">
              Feeling overwhelmed? Dump before you plan. Get it out of your head, then triage later.
            </p>
          </GlassCard>
        </motion.div>

        {/* Textarea + category + submit */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <GlassCard noPadding>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind? Just start typing..."
              className="w-full h-48 bg-transparent text-white placeholder-text-secondary p-5 resize-none focus:outline-none text-sm leading-relaxed"
              autoFocus
              aria-label="Brain dump text"
            />
            {/* Category chips */}
            <div className="flex flex-wrap gap-2 px-5 pb-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(category === cat.value ? null : cat.value)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] border transition-all ${
                    category === cat.value
                      ? CATEGORY_COLORS[cat.value]
                      : 'bg-white/5 border-glass-border text-text-secondary hover:bg-white/10'
                  }`}
                  aria-label={`Category: ${cat.label}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-t border-glass-border">
              <span className="text-[11px] text-text-secondary">
                {typeof navigator !== 'undefined' && navigator.platform?.includes('Mac') ? '\u2318' : 'Ctrl'}+Enter to save
              </span>
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || submitting}
                className="btn-primary text-sm !py-2 !px-5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : 'Dump it'}
              </button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Success animation */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="mt-6"
            >
              <GlassCard glow="cyan" className="text-center py-8">
                <motion.span
                  className="text-4xl block mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.4 }}
                >
                  &#x2713;
                </motion.span>
                <p className="text-sm font-medium text-cyan-accent">Captured</p>
                <p className="text-xs text-text-secondary mt-1">Out of your head, into the system.</p>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent entries */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-8"
        >
          <h2 className="text-sm font-medium text-text-secondary mb-3">Recent Dumps</h2>
          {loading ? (
            <LoadingPulse />
          ) : error ? (
            <GlassCard>
              <p className="text-sm text-danger">{error}</p>
            </GlassCard>
          ) : entries.length === 0 ? (
            <GlassCard>
              <p className="text-sm text-text-secondary">No brain dumps yet. Type your first one above.</p>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <GlassCard key={entry.id} className="!py-3 !px-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white leading-relaxed">
                        {entry.content.length > 100 ? entry.content.slice(0, 100) + '...' : entry.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {entry.category && (
                          <span className={`px-2 py-0.5 rounded text-[10px] border ${CATEGORY_COLORS[entry.category]}`}>
                            {entry.category}
                          </span>
                        )}
                        <span className="text-[10px] text-text-secondary">
                          {entry.createdAt ? formatTimestamp(entry.createdAt) : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </>
  );
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;

  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
