import React from 'react';
import { RotateCcw, FastForward, Clock } from 'lucide-react';

interface TimeMachineScrubberProps {
  timeTravelYears: number;
  onChangeYears: (years: number) => void;
  monthlyDCA: number;
  onChangeMonthlyDCA: (amount: number) => void;
  currentNetWorth: number;
  onReset: () => void;
}

export const TimeMachineScrubber: React.FC<TimeMachineScrubberProps> = ({
  timeTravelYears,
  onChangeYears,
  monthlyDCA,
  onChangeMonthlyDCA,
  currentNetWorth,
  onReset,
}) => {
  const futureYear = new Date().getFullYear() + timeTravelYears;
  const projectedNetWorth = Math.round(
    currentNetWorth * Math.pow(1.095, timeTravelYears) +
    (monthlyDCA * 12 * ((Math.pow(1.095, timeTravelYears) - 1) / 0.095))
  );

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-40 select-none animate-in slide-in-from-top-4">
      <div className="bg-forest-950/90 backdrop-blur-md border border-sunlit/50 rounded-2xl p-3.5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-950/80 border border-sunlit/50 text-sunlit">
              <FastForward className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Canopy Time Machine: Year {futureYear}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-900/60 text-amber-300 font-mono">
                  +{timeTravelYears} {timeTravelYears === 1 ? 'Year' : 'Years'}
                </span>
              </div>
              <div className="text-[10px] text-slate-300">
                Watching 3D trees and growth rings expand with compounding
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-black text-emerald-400 font-mono">
                ${projectedNetWorth.toLocaleString()}
              </div>
              <div className="text-[9px] text-slate-400">Projected Canopy</div>
            </div>

            <button
              onClick={onReset}
              title="Return to Present Day (Year 0)"
              className="p-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-slate-300 hover:text-white border border-forest-700/60 transition flex items-center gap-1 text-[11px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Present</span>
            </button>
          </div>
        </div>

        {/* Time Scrubber Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span className={timeTravelYears === 0 ? 'text-sprout font-bold' : ''}>Now (Year 0)</span>
            <span className={timeTravelYears === 5 ? 'text-sprout font-bold' : ''}>+5y</span>
            <span className={timeTravelYears === 10 ? 'text-sprout font-bold' : ''}>+10y</span>
            <span className={timeTravelYears === 20 ? 'text-sprout font-bold' : ''}>+20y</span>
            <span className={timeTravelYears === 30 ? 'text-sprout font-bold' : ''}>+30y Ancient</span>
          </div>

          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={timeTravelYears}
            onChange={(e) => onChangeYears(parseInt(e.target.value))}
            className="w-full accent-sunlit cursor-pointer h-2 bg-forest-900 rounded-lg"
          />
        </div>

        {/* Quick DCA Cadence Adjustment */}
        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-forest-800/80">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-sprout" />
            <span>Monthly DCA:</span>
            <span className="font-bold text-white font-mono">${monthlyDCA}/mo</span>
          </div>
          <div className="flex gap-1.5">
            {[250, 500, 1000, 2000].map((amt) => (
              <button
                key={amt}
                onClick={() => onChangeMonthlyDCA(amt)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                  monthlyDCA === amt
                    ? 'bg-forest-700 text-white font-bold border border-forest-500'
                    : 'bg-forest-900/60 text-slate-400 hover:text-white'
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
