'use client';

interface WipGaugeProps {
  activeCount: number;
  wipLimit: number;
}

export function WipGauge({ activeCount, wipLimit }: WipGaugeProps) {
  const ratio = wipLimit > 0 ? activeCount / wipLimit : 0;
  const percentage = Math.min(ratio * 100, 100);

  // Color based on proximity to limit
  const getColor = () => {
    if (activeCount >= wipLimit) return '#ef4444'; // danger red
    if (activeCount >= wipLimit - 1) return '#f59e0b'; // warning yellow
    return '#10b981'; // success green
  };

  const color = getColor();
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // semicircle
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size / 2 + strokeWidth}
        viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
        aria-label={`${activeCount} of ${wipLimit} active projects`}
        role="img"
      >
        {/* Background arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
        />
        {/* Count text */}
        <text
          x={size / 2}
          y={size / 2 - 4}
          textAnchor="middle"
          fill="white"
          fontSize="24"
          fontWeight="600"
        >
          {activeCount}/{wipLimit}
        </text>
      </svg>
      <span className="text-sm text-text-secondary">active projects</span>
    </div>
  );
}
