'use client';

interface ForcedChoiceSliderProps {
  poleA: string;
  poleB: string;
  value: number; // 1-7
  onChange: (value: number) => void;
}

export function ForcedChoiceSlider({ poleA, poleB, value, onChange }: ForcedChoiceSliderProps) {
  // Opacity increases as slider moves toward that pole
  const poleAOpacity = Math.max(0.4, 1 - (value - 1) / 6);
  const poleBOpacity = Math.max(0.4, (value - 1) / 6);

  return (
    <div className="space-y-6">
      {/* Poles — stack on mobile, side-by-side on desktop */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
        <button
          type="button"
          onClick={() => onChange(2)}
          className="flex-1 text-left sm:text-right p-3 rounded-lg transition-all duration-200 hover:bg-white/5"
          style={{ opacity: poleAOpacity }}
          aria-label={`Strongly ${poleA}`}
        >
          <p className="text-base font-medium text-white leading-relaxed">{poleA}</p>
        </button>
        <button
          type="button"
          onClick={() => onChange(6)}
          className="flex-1 text-left p-3 rounded-lg transition-all duration-200 hover:bg-white/5"
          style={{ opacity: poleBOpacity }}
          aria-label={`Strongly ${poleB}`}
        >
          <p className="text-base font-medium text-white leading-relaxed">{poleB}</p>
        </button>
      </div>

      {/* Slider */}
      <div className="px-3">
        <div className="relative">
          <input
            type="range"
            min={1}
            max={7}
            step={1}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="big5-slider w-full"
            aria-label="Select your position between the two options"
            aria-valuemin={1}
            aria-valuemax={7}
            aria-valuenow={value}
          />
          {/* Tick marks */}
          <div className="flex justify-between px-[2px] mt-1" aria-hidden="true">
            {[1, 2, 3, 4, 5, 6, 7].map((tick) => (
              <div
                key={tick}
                className={`w-1 h-1 rounded-full transition-colors ${
                  tick === 4
                    ? 'w-1.5 h-1.5 bg-white/40'
                    : tick === value
                      ? 'bg-cyan-accent'
                      : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Labels */}
        <div className="flex justify-between mt-2 text-xs text-text-secondary">
          <span>Strongly A</span>
          <span>Neutral</span>
          <span>Strongly B</span>
        </div>
      </div>
    </div>
  );
}
