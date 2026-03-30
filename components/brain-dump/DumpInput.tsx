'use client';

import { useState } from 'react';

interface DumpInputProps {
  onSubmit: (content: string) => Promise<void>;
}

export function DumpInput({ onSubmit }: DumpInputProps) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    await onSubmit(trimmed);
    setText('');
    setSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What's on your mind?"
        className="input-field !py-3 text-base flex-1"
        aria-label="Brain dump input"
        disabled={submitting}
        autoFocus
      />
      {/* Mobile submit button */}
      <button
        type="submit"
        disabled={submitting || !text.trim()}
        className="btn-primary !py-3 !px-4 text-lg sm:hidden disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        aria-label="Save"
      >
        +
      </button>
    </form>
  );
}
