import React, { useState } from 'react';
import {
  simulateCompoundingGrowth,
  HISTORICAL_BACKTESTS,
  HistoricalBacktest,
} from '@invest-forest/core';
import {
  TrendingUp,
  X,
  History,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNetWorth?: number;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({
  isOpen,
  onClose,
  currentNetWorth = 5000,
}) => {
  const [tab, setTab] = useState<'future' | 'backtest'>('future');
  const [initialPrincipal, setInitialPrincipal] = useState<number>(Math.max(1000, Math.round(currentNetWorth)));
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [years, setYears] = useState<number>(20);
  const [returnRate, setReturnRate] = useState<number>(9.8);
  const [selectedBacktest, setSelectedBacktest] = useState<HistoricalBacktest>(HISTORICAL_BACKTESTS[0]);

  if (!isOpen) return null;

  const simResult = simulateCompoundingGrowth(
    initialPrincipal,
    monthlyContribution,
    years,
    returnRate,
    2.5
  );

  const backtestOutcome = selectedBacktest.calculateOutcome(
    monthlyContribution,
    initialPrincipal,
    years
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-forest-950 border border-forest-600/50 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative flex flex-col space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-forest-900 border border-forest-700/60 text-sprout">
              <TrendingUp className="w-5 h-5 text-sunlit" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Canopy Time Machine & Backtest</h2>
              <p className="text-xs text-slate-400">Project future exponential compounding or simulate historic crashes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-forest-900 hover:bg-forest-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-forest-900 p-1 border border-forest-800">
          <button
            onClick={() => setTab('future')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
              tab === 'future' ? 'bg-forest-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sunlit" />
            <span>Future Compounding Simulator</span>
          </button>
          <button
            onClick={() => setTab('backtest')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
              tab === 'backtest' ? 'bg-forest-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5 text-moss" />
            <span>Historical Crisis Backtesting</span>
          </button>
        </div>

        {tab === 'future' ? (
          <div className="space-y-4 text-xs">
            {/* Input Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-forest-900/50 border border-forest-800/80 rounded-2xl">
              <div>
                <div className="flex justify-between text-slate-300 font-medium mb-1">
                  <span>Initial Principal:</span>
                  <span className="text-white font-mono font-bold">${initialPrincipal.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="500"
                  value={initialPrincipal}
                  onChange={(e) => setInitialPrincipal(parseFloat(e.target.value))}
                  className="w-full accent-sprout cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-medium mb-1">
                  <span>Monthly DCA Nourishment:</span>
                  <span className="text-white font-mono font-bold">${monthlyContribution.toLocaleString()}/mo</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="3000"
                  step="50"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(parseFloat(e.target.value))}
                  className="w-full accent-sprout cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-medium mb-1">
                  <span>Time in Soil (Horizon):</span>
                  <span className="text-sprout font-bold">{years} Years ({years} Annual Rings)</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={years}
                  onChange={(e) => setYears(parseInt(e.target.value))}
                  className="w-full accent-sprout cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-medium mb-1">
                  <span>Expected Annual Return:</span>
                  <span className="text-white font-mono font-bold">{returnRate}%</span>
                </div>
                <div className="flex gap-1.5 mt-1">
                  {[
                    { label: 'S&P 500 (10.2%)', val: 10.2 },
                    { label: 'Balanced (8.5%)', val: 8.5 },
                    { label: 'Dividend (9.0%)', val: 9.0 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setReturnRate(preset.val)}
                      className={`px-2 py-0.5 rounded text-[10px] border transition ${
                        returnRate === preset.val
                          ? 'border-sprout bg-forest-800 text-white'
                          : 'border-forest-800 bg-forest-950/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Projection Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-forest-900/60 border border-forest-700/50 rounded-2xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Future Valuation</span>
                <div className="text-xl font-extrabold text-white mt-0.5">
                  ${simResult.finalNominalValue.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400">Nominal Wealth</span>
              </div>

              <div className="p-3 bg-forest-900/60 border border-forest-700/50 rounded-2xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Total Deposited</span>
                <div className="text-xl font-extrabold text-slate-300 mt-0.5">
                  ${simResult.totalDeposited.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400">Out-of-Pocket Cash</span>
              </div>

              <div className="p-3 bg-forest-900/60 border border-forest-700/50 rounded-2xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Compounded Gain</span>
                <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
                  +${simResult.totalGain.toLocaleString()}
                </div>
                <span className="text-[10px] text-emerald-300 font-bold">
                  +{simResult.compoundingMultiplier.toFixed(1)}x Growth Factor
                </span>
              </div>

              <div className="p-3 bg-forest-900/60 border border-forest-700/50 rounded-2xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Botanical Canopy</span>
                <div className="text-xl font-extrabold text-sprout mt-0.5">
                  {simResult.yearlyPoints[simResult.yearlyPoints.length - 1].treeHeightMeters}m
                </div>
                <span className="text-[10px] text-slate-300">{years} Dense Growth Rings</span>
              </div>
            </div>

            {/* Compounding Visual Breakdown Bar */}
            <div className="p-4 bg-forest-900/60 border border-forest-700/50 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">The Power of Compounding:</span>
                <span className="text-slate-400 text-[11px]">
                  Deposits (${simResult.totalDeposited.toLocaleString()}) vs Free Market Returns (${simResult.totalGain.toLocaleString()})
                </span>
              </div>
              <div className="w-full h-5 bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${(simResult.totalDeposited / simResult.finalNominalValue) * 100}%` }}
                  className="bg-forest-600 transition-all duration-300"
                  title="Your Out of Pocket Deposits"
                />
                <div
                  style={{ width: `${(simResult.totalGain / simResult.finalNominalValue) * 100}%` }}
                  className="bg-emerald-500 transition-all duration-300"
                  title="Free Compounded Growth"
                />
              </div>
              <div className="flex justify-between text-[11px] pt-0.5">
                <span className="text-forest-400 font-medium">
                  Deposited Capital: {((simResult.totalDeposited / simResult.finalNominalValue) * 100).toFixed(0)}%
                </span>
                <span className="text-emerald-400 font-bold">
                  Pure Compounded Windfall: {((simResult.totalGain / simResult.finalNominalValue) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Historical Backtesting Scenarios */
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-forest-900/60 border border-forest-700/50 rounded-2xl space-y-2">
              <span className="text-slate-300 font-medium block">Select Historical Bear Market Stress Test:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {HISTORICAL_BACKTESTS.map((test) => (
                  <button
                    key={test.id}
                    onClick={() => setSelectedBacktest(test)}
                    className={`p-2.5 rounded-xl text-left border transition ${
                      selectedBacktest.id === test.id
                        ? 'border-sprout bg-forest-800 text-white shadow-sm'
                        : 'border-forest-800 bg-forest-950/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">{test.name}</div>
                    <div className="text-[10px] text-sprout mt-0.5">{test.period}</div>
                    <div className="text-[10px] text-amber-400 mt-0.5">Max Drop: -{test.maxDrawdownPercent}%</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Backtest Outcome Showcase */}
            <div className="p-4 bg-forest-900/70 border border-forest-700/60 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{selectedBacktest.name}</h3>
                  <p className="text-[11px] text-slate-400">{selectedBacktest.description}</p>
                </div>
                <span className="px-2.5 py-1 bg-amber-950/60 border border-amber-600/40 text-amber-300 font-mono font-bold rounded-lg text-xs">
                  -{(selectedBacktest.maxDrawdownPercent).toFixed(1)}% Peak Crash
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-forest-950/80 rounded-xl border border-forest-800">
                  <span className="text-[10px] text-slate-400 uppercase">Total Cash Invested</span>
                  <div className="text-lg font-bold text-white font-mono mt-0.5">
                    ${backtestOutcome.totalDeposited.toLocaleString()}
                  </div>
                </div>

                <div className="p-3 bg-forest-950/80 rounded-xl border border-forest-800">
                  <span className="text-[10px] text-slate-400 uppercase">Final Portfolio Value</span>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                    ${backtestOutcome.finalValue.toLocaleString()}
                  </div>
                </div>

                <div className="p-3 bg-forest-950/80 rounded-xl border border-forest-800">
                  <span className="text-[10px] text-slate-400 uppercase">Annualized Return</span>
                  <div className="text-lg font-bold text-sprout font-mono mt-0.5">
                    +{(selectedBacktest.annualizedReturn * 100).toFixed(1)}%/yr
                  </div>
                </div>
              </div>

              <div className="p-3 bg-forest-950/90 border border-emerald-700/40 rounded-xl text-[11px] text-emerald-200 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Behavioral Reality Check:</strong>
                  {selectedBacktest.keyLesson}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-forest-800/80">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-forest-600 hover:bg-forest-500 text-white font-bold rounded-xl text-xs transition shadow-md"
          >
            Close Time Machine
          </button>
        </div>
      </div>
    </div>
  );
};
