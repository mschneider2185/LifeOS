'use client';

interface WipGaugeProps {
  active: number;
  max: number;
}

export function WipGauge({ active, max }: WipGaugeProps) {
  const ratio = max > 0 ? active / max : 0;
  const pct = Math.min(ratio * 100, 100);

  const color =
    active >= max
      ? '#ef4444'
      : active >= max - 1
        ? '#f59e0b'
        : '#10b981';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-text-secondary">Active Projects</span>
        <span className="text-sm font-semibold" style={{ color }}>
          {active} / {max}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
      {active >= max && (
        <p className="text-[11px] text-danger mt-1">WIP limit reached — park something first</p>
      )}
    </div>
  );
}
