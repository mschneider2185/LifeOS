'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { AuthGuard, GlassCard } from '@/components/lifeos';
import type { BrainDumpBody, NotionCreateResponse } from '@/types/notion';

export default function BrainDumpPage() {
  return (
    <AuthGuard>
      <BrainDumpContent />
    </AuthGuard>
  );
}

function BrainDumpContent() {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);

    try {
      const body: BrainDumpBody = { text: text.trim() };
      const res = await fetch('/api/notion/braindump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as NotionCreateResponse<{ appended: boolean }>;
      if (json.success) {
        setText('');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
      }
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }, [text, submitting]);

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
            <p className="text-sm text-purple-accent font-medium">⚡ Brain Dump First</p>
            <p className="text-xs text-text-secondary mt-1">
              Feeling overwhelmed? Dump before you plan. Get it out of your head, then triage later.
            </p>
          </GlassCard>
        </motion.div>

        {/* Textarea */}
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
            <div className="flex items-center justify-between px-5 py-3 border-t border-glass-border">
              <span className="text-[11px] text-text-secondary">
                {navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}+Enter to save
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
                  ✓
                </motion.span>
                <p className="text-sm font-medium text-cyan-accent">Captured in Notion</p>
                <p className="text-xs text-text-secondary mt-1">Out of your head, into the system.</p>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
