'use client';

import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import type { Big5Trait, SystemConfig } from '@/types/lifeos';

interface TraitScores {
  neuroticism: number;
  conscientiousness: number;
  agreeableness: number;
  extraversion: number;
  openness: number;
}

interface Big5ResultsProps {
  scores: TraitScores;
  systemConfig: SystemConfig;
  onRetake: () => void;
}

const traitMeta: {
  key: Big5Trait;
  label: string;
  high: string;
  low: string;
}[] = [
  {
    key: 'neuroticism',
    label: 'Neuroticism',
    high: 'You carry more internal stress than you show. LifeOS enables brain dump, burnout monitoring, and gentler coaching.',
    low: 'You handle pressure well. LifeOS gives you direct, no-nonsense accountability.',
  },
  {
    key: 'conscientiousness',
    label: 'Conscientiousness',
    high: 'You thrive with systems and follow-through. LifeOS gives you detailed tracking and higher WIP limits.',
    low: 'You need low friction or you\'ll abandon the system. LifeOS enforces the 30-second rule and keeps things simple.',
  },
  {
    key: 'agreeableness',
    label: 'Agreeableness',
    high: 'You may over-commit to help others. LifeOS helps you protect your boundaries.',
    low: 'You\'re comfortable saying no. LifeOS won\'t nag \u2014 it respects your autonomy.',
  },
  {
    key: 'extraversion',
    label: 'Extraversion',
    high: 'You\'re energized by people. LifeOS supports social accountability and shared progress.',
    low: 'You prefer solo work. LifeOS keeps tracking private and distraction-free.',
  },
  {
    key: 'openness',
    label: 'Openness',
    high: 'You love exploring ideas. LifeOS gives you an idea capture zone and big-picture dashboards.',
    low: 'You prefer proven methods. LifeOS keeps guidance concrete and step-by-step.',
  },
];

function RadarChart({ scores }: { scores: TraitScores }) {
  const traits = traitMeta.map((t) => t.key);
  const size = 240;
  const center = size / 2;
  const maxRadius = 90;
  const levels = [25, 50, 75, 100];

  const angleStep = (2 * Math.PI) / traits.length;
  const startAngle = -Math.PI / 2; // top

  const getPoint = (index: number, value: number) => {
    const angle = startAngle + index * angleStep;
    const r = (value / 100) * maxRadius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Build the filled polygon
  const dataPoints = traits.map((trait, i) => getPoint(i, scores[trait]));
  const polygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full max-w-[280px] mx-auto"
      role="img"
      aria-label="Big Five personality radar chart"
    >
      {/* Grid rings */}
      {levels.map((level) => {
        const points = traits
          .map((_, i) => getPoint(i, level))
          .map((p) => `${p.x},${p.y}`)
          .join(' ');
        return (
          <polygon
            key={level}
            points={points}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        );
      })}

      {/* Axis lines */}
      {traits.map((_, i) => {
        const p = getPoint(i, 100);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={polygon}
        fill="rgba(139, 92, 246, 0.25)"
        stroke="#00d4ff"
        strokeWidth="2"
      />

      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#00d4ff" />
      ))}

      {/* Labels */}
      {traits.map((trait, i) => {
        const labelPoint = getPoint(i, 125);
        const meta = traitMeta[i];
        return (
          <text
            key={trait}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.6)"
            fontSize="11"
            fontWeight="500"
          >
            {meta.label.slice(0, 4).toUpperCase()}
          </text>
        );
      })}
    </svg>
  );
}

export function Big5Results({ scores, systemConfig, onRetake }: Big5ResultsProps) {
  const configImpacts = [
    { label: 'WIP limit', value: `${systemConfig.wip_limit} active projects` },
    { label: 'Brain dump', value: systemConfig.brain_dump_enabled ? 'Enabled' : 'Off' },
    { label: 'Burnout detection', value: systemConfig.burnout_detection ? 'Active' : 'Off' },
    { label: 'Coaching style', value: systemConfig.coaching_tone.replace('_', ' ') },
    { label: 'Consequence framing', value: systemConfig.consequence_framing ? 'On' : 'Off' },
    { label: 'Energy matching', value: systemConfig.energy_matching ? 'On' : 'Off' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 space-y-6">
      {/* Radar chart */}
      <GlassCard className="text-center">
        <h2 className="text-xl font-semibold tracking-tight text-white mb-4">
          Your Big Five Profile
        </h2>
        <RadarChart scores={scores} />
      </GlassCard>

      {/* Trait interpretations */}
      <GlassCard>
        <h3 className="font-semibold tracking-tight text-white mb-4">What this means</h3>
        <div className="space-y-4">
          {traitMeta.map((trait) => {
            const score = scores[trait.key];
            const isHigh = score >= 50;
            return (
              <div key={trait.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{trait.label}</span>
                  <span className="text-sm text-cyan-accent">{score}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-cyan-accent transition-all duration-500"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <p className="text-xs text-text-secondary">
                  {isHigh ? trait.high : trait.low}
                </p>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Config impact */}
      <GlassCard>
        <h3 className="font-semibold tracking-tight text-white mb-4">
          How this configures your LifeOS
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {configImpacts.map((item) => (
            <div key={item.label} className="p-3 rounded-lg bg-white/5">
              <p className="text-xs text-text-secondary mb-0.5">{item.label}</p>
              <p className="text-sm text-white capitalize">{item.value}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 pb-8">
        <Link href="/dashboard" className="btn-primary text-sm !py-2.5 !px-6 w-full sm:w-auto text-center">
          Go to Dashboard
        </Link>
        <button
          onClick={onRetake}
          className="btn-secondary text-sm !py-2.5 !px-6 w-full sm:w-auto"
        >
          Retake Assessment
        </button>
      </div>
    </div>
  );
}
