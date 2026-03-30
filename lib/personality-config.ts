// lib/personality-config.ts
// Profile-to-Configuration Engine
// Takes DISC + MBTI + Big Five scores → generates system_config JSON
// This is the core differentiator of LifeOS

import type { CoachingTone, SystemConfig } from '@/types/lifeos';

interface ProfileInput {
  disc: { d: number; i: number; s: number; c: number };
  mbti: string; // e.g. "INTP-T"
  big5: {
    neuroticism: number; // percentile 0-100
    conscientiousness: number;
    agreeableness: number;
    extraversion: number;
    openness: number;
  };
}

/**
 * Calculate WIP limit from Big Five scores
 *
 * Base: 4
 * High conscientiousness → can handle more
 * High neuroticism → needs fewer to avoid overwhelm
 * Clamped to [2, 8]
 */
function calculateWipLimit(big5: ProfileInput['big5']): number {
  let wip = 4;

  if (big5.conscientiousness > 85) wip += 2;
  else if (big5.conscientiousness > 70) wip += 1;

  if (big5.conscientiousness < 30) wip -= 1;
  if (big5.neuroticism > 80) wip -= 1;

  return Math.max(2, Math.min(8, wip));
}

/**
 * Determine coaching tone from DISC + Big Five
 */
function determineCoachingTone(
  disc: ProfileInput['disc'],
  big5: ProfileInput['big5']
): CoachingTone {
  const tones: CoachingTone[] = [];

  // Commander: High D, Low S — wants direct, results-focused language
  if (disc.d > 50 && disc.s < 40) tones.push('commander');

  // Cheerleader: High I, High Agreeableness — wants celebration
  if (disc.i > 50 && big5.agreeableness > 60) tones.push('cheerleader');

  // Analyst: High C, High Openness — wants data and correlations
  if (disc.c > 50 && big5.openness > 40) tones.push('analyst');

  // Coach: Balanced or High Neuroticism — wants calm grounding
  if (big5.neuroticism > 70) tones.push('coach');

  // If multiple, combine the top ones
  if (tones.length === 0) return 'coach'; // safe default
  if (tones.length === 1) return tones[0];

  // For multi-tone, return the dominant one
  // Priority: commander > analyst > coach > cheerleader
  if (tones.includes('commander')) return 'commander';
  if (tones.includes('analyst')) return 'analyst';
  if (tones.includes('coach')) return 'coach';
  return 'cheerleader';
}

/**
 * Parse MBTI string to get individual preferences
 */
function parseMbti(mbti: string): {
  e: boolean; i: boolean;
  s: boolean; n: boolean;
  t: boolean; f: boolean;
  j: boolean; p: boolean;
  turbulent: boolean;
} {
  const upper = mbti.toUpperCase();
  return {
    e: upper.includes('E'),
    i: upper.includes('I') && !upper.startsWith('I') ? false : upper.charAt(0) === 'I',
    s: upper.charAt(1) === 'S',
    n: upper.charAt(1) === 'N',
    t: upper.charAt(2) === 'T',
    f: upper.charAt(2) === 'F',
    j: upper.charAt(3) === 'J',
    p: upper.charAt(3) === 'P',
    turbulent: upper.includes('-T'),
  };
}

/**
 * Main: Generate the complete system configuration from a personality profile
 */
export function generateSystemConfig(input: ProfileInput): SystemConfig {
  const { disc, mbti, big5 } = input;
  const mbtiParsed = parseMbti(mbti);
  const wipLimit = calculateWipLimit(big5);
  const coachingTone = determineCoachingTone(disc, big5);

  return {
    wip_limit: wipLimit,

    // Brain dump: essential for high neuroticism
    brain_dump_enabled: big5.neuroticism > 70,

    // Consequence framing: for thinkers with low follow-through
    consequence_framing: mbtiParsed.t && big5.conscientiousness < 50,

    // Energy matching: for perceivers or low conscientiousness
    energy_matching: mbtiParsed.p || big5.conscientiousness < 50,

    // Burnout detection: for high neuroticism
    burnout_detection: big5.neuroticism > 80,

    // Auto-archive: for low conscientiousness (reduce clutter)
    auto_archive: big5.conscientiousness < 40,

    coaching_tone: coachingTone,

    // Financial settings
    financial_check_frequency:
      big5.neuroticism > 80 ? 'monthly' :
      big5.conscientiousness > 70 ? 'weekly' :
      'biweekly',

    show_daily_portfolio: big5.neuroticism < 50,

    debt_framing:
      disc.d > 50 ? 'months_to_freedom' :
      disc.c > 50 ? 'interest_saved' :
      'total_remaining',

    logging_mode:
      big5.conscientiousness > 70 ? 'detailed' :
      big5.conscientiousness < 30 ? 'minimal' :
      'quick_totals',
  };
}

/**
 * Get derived personality settings for the profile table
 */
export function getProfileSettings(input: ProfileInput) {
  const config = generateSystemConfig(input);

  return {
    wip_limit: config.wip_limit,
    energy_matching: config.energy_matching,
    consequence_framing: config.consequence_framing,
    brain_dump_priority: config.brain_dump_enabled,
    coaching_tone: config.coaching_tone,
    system_config: config,
  };
}

/**
 * Feature toggle checker — used by components to show/hide features
 */
export function isFeatureEnabled(
  config: SystemConfig,
  feature: keyof Pick<
    SystemConfig,
    'brain_dump_enabled' | 'consequence_framing' | 'energy_matching' |
    'burnout_detection' | 'auto_archive'
  >
): boolean {
  return config[feature];
}
