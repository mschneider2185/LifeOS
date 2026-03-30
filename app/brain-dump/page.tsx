'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AppShell } from '@/components/nav/AppShell';
import { DumpInput } from '@/components/brain-dump/DumpInput';
import { DumpList } from '@/components/brain-dump/DumpList';
import { TriagedList } from '@/components/brain-dump/TriagedList';
import type { BrainDump, BrainDumpCategory } from '@/types/lifeos';
import toast from 'react-hot-toast';

export default function BrainDumpPage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [untriaged, setUntriaged] = useState<BrainDump[]>([]);
  const [triaged, setTriaged] = useState<BrainDump[]>([]);

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const [untriagedRes, triagedRes] = await Promise.all([
      supabase
        .from('brain_dumps')
        .select('*')
        .eq('triaged', false)
        .order('created_at', { ascending: false }),
      supabase
        .from('brain_dumps')
        .select('*')
        .eq('triaged', true)
        .order('triaged_at', { ascending: false })
        .limit(50),
    ]);

    if (untriagedRes.data) setUntriaged(untriagedRes.data as BrainDump[]);
    if (triagedRes.data) setTriaged(triagedRes.data as BrainDump[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCapture = async (content: string) => {
    if (!userId) return;

    const { error } = await supabase.from('brain_dumps').insert({
      user_id: userId,
      content,
      triaged: false,
    });

    if (error) {
      toast.error('Failed to save');
    } else {
      toast.success('Captured!');
      fetchData();
    }
  };

  const handleTriage = async (id: string, category: NonNullable<BrainDumpCategory>) => {
    const { error } = await supabase
      .from('brain_dumps')
      .update({
        category,
        triaged: true,
        triaged_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      toast.error('Failed to triage');
    } else {
      fetchData();
    }
  };

  if (loading) {
    return (
      <AppShell>
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="spinner h-8 w-8" />
      </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
    <main className="min-h-screen bg-dark-bg">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Brain Dump</h1>
          <p className="text-sm text-text-secondary mt-1">
            Type it out. Triage later.
          </p>
        </div>

        <div className="space-y-6">
          <DumpInput onSubmit={handleCapture} />
          <DumpList dumps={untriaged} onTriage={handleTriage} />
          <TriagedList dumps={triaged} />
        </div>
      </div>
    </main>
    </AppShell>
  );
}
