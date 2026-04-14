'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { AuthGuard, GlassCard, LoadingPulse, SectionHeader, StatusBadge } from '@/components/lifeos';
import type {
  CheckIn,
  EnergyLevel,
  StressLevel,
  CreateCheckInBody,
  NotionListResponse,
  NotionCreateResponse,
} from '@/types/notion';

const ENERGY_OPTIONS: { value: EnergyLevel; emoji: string; label: string; color: string }[] = [
  { value: '🔴 Crashed', emoji: '🔴', label: 'Crashed', color: '#ef4444' },
  { value: '🟠 Low', emoji: '🟠', label: 'Low', color: '#f97316' },
  { value: '🟡 Okay', emoji: '🟡', label: 'Okay', color: '#eab308' },
  { value: '🟢 Good', emoji: '🟢', label: 'Good', color: '#22c55e' },
  { value: '🔵 Peak', emoji: '🔵', label: 'Peak', color: '#3b82f6' },
];

const STRESS_OPTIONS: { value: StressLevel; label: string }[] = [
  { value: '1 - Calm', label: 'Calm' },
  { value: '2 - Manageable', label: 'Manageable' },
  { value: '3 - Elevated', label: 'Elevated' },
  { value: '4 - High', label: 'High' },
  { value: '5 - Overwhelmed', label: 'Overwhelmed' },
];

const stagger = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35 },
  }),
};

export default function CheckInPage() {
  return (
    <AuthGuard>
      <CheckInContent />
    </AuthGuard>
  );
}

function CheckInContent() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState<CheckIn[]>([]);

  // Form state
  const [energy, setEnergy] = useState<EnergyLevel | null>(null);
  const [stress, setStress] = useState<StressLevel | null>(null);
  const [sleepHours, setSleepHours] = useState<string>('7');
  const [exercise, setExercise] = useState(false);
  const [brainDumpUsed, setBrainDumpUsed] = useState(false);
  const [topWin, setTopWin] = useState('');
  const [biggestBlocker, setBiggestBlocker] = useState('');
  const [moodNote, setMoodNote] = useState('');
  const [projectsTouched, setProjectsTouched] = useState<string>('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/notion/checkins', { cache: 'no-store' });
        const json = (await res.json()) as NotionListResponse<CheckIn>;
        if (json.data) setHistory(json.data);
      } catch {
        // silently fail for history
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Disable mobile pull-to-refresh on this page only — it was triggering
  // accidental blank submissions. Restore original behavior on unmount so
  // other pages keep their default scroll feel.
  useEffect(() => {
    const prevBody = document.body.style.overscrollBehaviorY;
    const prevHtml = document.documentElement.style.overscrollBehaviorY;
    document.body.style.overscrollBehaviorY = 'none';
    document.documentElement.style.overscrollBehaviorY = 'none';
    return () => {
      document.body.style.overscrollBehaviorY = prevBody;
      document.documentElement.style.overscrollBehaviorY = prevHtml;
    };
  }, []);

  const handleSubmit = async () => {
    if (submitting) return;
    // Empty-state guard: energy + stress are required, and at least one
    // signal must be present so a triggered submit can't create a ghost entry.
    if (!energy || !stress) return;
    const hasAnyContent =
      !!energy ||
      !!stress ||
      exercise ||
      brainDumpUsed ||
      topWin.trim() !== '' ||
      biggestBlocker.trim() !== '' ||
      moodNote.trim() !== '' ||
      projectsTouched.trim() !== '' ||
      (sleepHours.trim() !== '' && parseFloat(sleepHours) > 0);
    if (!hasAnyContent) return;
    setSubmitting(true);

    const body: CreateCheckInBody = {
      date: new Date().toISOString().split('T')[0],
      energyLevel: energy,
      stressLevel: stress,
      sleepHours: sleepHours === '' ? 0 : parseFloat(sleepHours),
      exercise,
      topWin: topWin || undefined,
      biggestBlocker: biggestBlocker || undefined,
      moodNote: moodNote || undefined,
      projectsTouched: projectsTouched === '' ? undefined : parseInt(projectsTouched, 10),
      brainDumpUsed,
    };

    try {
      const res = await fetch('/api/notion/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as NotionCreateResponse<CheckIn>;
      if (json.success) {
        setSubmitted(true);
        // Refresh history
        const histRes = await fetch('/api/notion/checkins', { cache: 'no-store' });
        const histJson = (await histRes.json()) as NotionListResponse<CheckIn>;
        if (histJson.data) setHistory(histJson.data);
      }
    } catch {
      // show inline error
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <><LoadingPulse /></>;
  }

  return (
    <>
      <main className="max-w-lg mx-auto px-4 py-8" style={{ overscrollBehaviorY: 'none' }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Daily Check-in</h1>
          <p className="text-sm text-text-secondary mb-6">30 seconds. How are you doing?</p>
        </motion.div>

        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <GlassCard glow="cyan" className="text-center py-10">
              <span className="text-4xl block mb-3">✓</span>
              <p className="text-lg font-semibold text-white">Checked in!</p>
              <p className="text-sm text-text-secondary mt-1">See you tomorrow.</p>
              <button onClick={() => setSubmitted(false)} className="btn-secondary text-sm mt-4">
                Edit today&apos;s entry
              </button>
            </GlassCard>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {/* Energy Level */}
            <motion.div custom={0} initial="hidden" animate="visible" variants={stagger}>
              <GlassCard>
                <label className="text-sm font-medium text-white block mb-3">Energy Level</label>
                <div className="flex gap-2">
                  {ENERGY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setEnergy(opt.value)}
                      className={`flex-1 py-2.5 rounded-lg text-center transition-all border ${
                        energy === opt.value
                          ? 'border-white/30 bg-white/10'
                          : 'border-transparent bg-white/5 hover:bg-white/8'
                      }`}
                      aria-label={opt.label}
                      aria-pressed={energy === opt.value}
                    >
                      <span className="text-lg block">{opt.emoji}</span>
                      <span className="text-[10px] text-text-secondary block mt-0.5">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Stress Level */}
            <motion.div custom={1} initial="hidden" animate="visible" variants={stagger}>
              <GlassCard>
                <label className="text-sm font-medium text-white block mb-3">Stress Level</label>
                <div className="flex gap-2">
                  {STRESS_OPTIONS.map((opt, idx) => {
                    const colors = ['#10b981', '#22c55e', '#eab308', '#f97316', '#ef4444'];
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setStress(opt.value)}
                        className={`flex-1 py-2.5 rounded-lg text-center transition-all border ${
                          stress === opt.value
                            ? 'border-white/30 bg-white/10'
                            : 'border-transparent bg-white/5 hover:bg-white/8'
                        }`}
                        aria-label={opt.label}
                        aria-pressed={stress === opt.value}
                      >
                        <span className="text-lg block" style={{ color: colors[idx] }}>●</span>
                        <span className="text-[10px] text-text-secondary block mt-0.5">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>

            {/* Sleep + toggles */}
            <motion.div custom={2} initial="hidden" animate="visible" variants={stagger}>
              <GlassCard>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-white block mb-2">Sleep (hrs)</label>
                    <input
                      type="number"
                      min={0}
                      max={24}
                      step={0.5}
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                      className="input-field text-center !py-2"
                      aria-label="Hours of sleep"
                    />
                  </div>
                  <div className="flex flex-col items-center justify-end">
                    <label className="text-[11px] text-text-secondary mb-2">Exercise</label>
                    <button
                      onClick={() => setExercise(!exercise)}
                      className={`w-10 h-10 rounded-lg border transition-all flex items-center justify-center ${
                        exercise ? 'bg-success/20 border-success/40 text-success' : 'bg-white/5 border-glass-border text-text-secondary'
                      }`}
                      aria-label="Exercise done"
                      aria-pressed={exercise}
                    >
                      {exercise ? '✓' : '✗'}
                    </button>
                  </div>
                  <div className="flex flex-col items-center justify-end">
                    <label className="text-[11px] text-text-secondary mb-2">Brain Dump</label>
                    <button
                      onClick={() => setBrainDumpUsed(!brainDumpUsed)}
                      className={`w-10 h-10 rounded-lg border transition-all flex items-center justify-center ${
                        brainDumpUsed ? 'bg-cyan-accent/20 border-cyan-accent/40 text-cyan-accent' : 'bg-white/5 border-glass-border text-text-secondary'
                      }`}
                      aria-label="Brain dump used"
                      aria-pressed={brainDumpUsed}
                    >
                      {brainDumpUsed ? '✓' : '✗'}
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Text inputs */}
            <motion.div custom={3} initial="hidden" animate="visible" variants={stagger}>
              <GlassCard>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-white block mb-1.5">Top Win</label>
                    <input
                      type="text"
                      value={topWin}
                      onChange={(e) => setTopWin(e.target.value)}
                      placeholder="What went well today?"
                      className="input-field !py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white block mb-1.5">Biggest Blocker</label>
                    <input
                      type="text"
                      value={biggestBlocker}
                      onChange={(e) => setBiggestBlocker(e.target.value)}
                      placeholder="What's in the way?"
                      className="input-field !py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white block mb-1.5">Mood Note</label>
                    <input
                      type="text"
                      value={moodNote}
                      onChange={(e) => setMoodNote(e.target.value)}
                      placeholder="One line on how you feel"
                      className="input-field !py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white block mb-1.5">Projects Touched</label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={projectsTouched}
                      onChange={(e) => setProjectsTouched(e.target.value)}
                      className="input-field !py-2 text-sm w-20"
                      aria-label="Number of projects touched"
                    />
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Submit */}
            <motion.div custom={4} initial="hidden" animate="visible" variants={stagger}>
              <button
                onClick={handleSubmit}
                disabled={!energy || !stress || submitting}
                className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : 'Submit Check-in'}
              </button>
            </motion.div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <motion.div custom={5} initial="hidden" animate="visible" variants={stagger} className="mt-8">
            <GlassCard>
              <SectionHeader icon="☰" title="Recent Check-ins" />
              <div className="space-y-3">
                {history.map((ci) => (
                  <div key={ci.id} className="flex items-center gap-3 py-2 border-b border-glass-border last:border-0">
                    <span className="text-xs text-text-secondary w-20 shrink-0">{ci.date}</span>
                    <span className="text-sm">{ci.energyLevel?.split(' ')[0] ?? '—'}</span>
                    <span className="text-xs text-text-secondary">{ci.stressLevel?.split(' - ')[1] ?? '—'}</span>
                    <span className="text-xs text-text-secondary ml-auto">{ci.sleepHours ?? '—'}h</span>
                    {ci.exercise && <StatusBadge label="Exercise" variant="green" />}
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </main>
    </>
  );
}
