import React from 'react';
import { Holding, calculateTreeMetrics } from '@invest-forest/core';
import { X, Award } from 'lucide-react';

interface TreeInspectModalProps {
  holding: Holding | null;
  onClose: () => void;
}

export const TreeInspectModal: React.FC<TreeInspectModalProps> = ({ holding, onClose }) => {
  if (!holding) return null;

  const metrics = calculateTreeMetrics(holding);
  const { species, growthRings, holdingDurationYears, height, trunkRadius, fruitCount } = metrics;
  const valuation = holding.shares * holding.currentPrice;
  const gain = valuation - holding.costBasis;
  const gainPct = holding.costBasis > 0 ? (gain / holding.costBasis) * 100 : 0;
  const isPositive = gain >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-forest-950 border border-forest-600/40 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative overflow-hidden space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-forest-800 border border-forest-600/50 text-sprout font-bold uppercase tracking-wide">
                {species.botanicalName}
              </span>
              <span className="text-xs text-slate-400">Class: {holding.assetClass}</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              {holding.symbol} • {species.commonName}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{species.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-forest-900 hover:bg-forest-800 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tree Cross-Section (Growth Rings SVG) */}
        <div className="bg-forest-900/60 border border-forest-700/40 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-sprout" />
            <span>Botanical Cross-Section: {growthRings} Annual Growth Rings</span>
          </div>

          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
              {/* Outer bark boundary */}
              <circle cx="100" cy="100" r="92" fill="#362a23" stroke="#5c4033" strokeWidth="4" />
              <circle cx="100" cy="100" r="88" fill="#5c4033" stroke="#785949" strokeWidth="2" />

              {/* Concentric Annual Rings */}
              {Array.from({ length: Math.min(growthRings, 10) }).map((_, i) => {
                const radius = 20 + ((i + 1) / Math.min(growthRings, 10)) * 62;
                return (
                  <circle
                    key={i}
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke="#c4dfd0"
                    strokeWidth="1.8"
                    strokeDasharray={i % 2 === 0 ? '4 2' : 'none'}
                    opacity={0.65 + (i / 10) * 0.35}
                  />
                );
              })}

              {/* Heartwood Pith (Center) */}
              <circle cx="100" cy="100" r="14" fill="#a8d5ba" stroke="#2d6a4f" strokeWidth="2" />
            </svg>
            <div className="absolute text-[11px] font-bold text-forest-950 font-mono">
              Y0
            </div>
          </div>
          <div className="text-[11px] text-slate-400 text-center max-w-sm">
            Old growth cannot be rushed or simulated. Each concentric band represents 365 days of patient market compounding.
          </div>
        </div>

        {/* Financial & Biological Vital Signs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-forest-900/40 border border-forest-800/40 p-3 rounded-xl">
            <div className="text-slate-400">Current Valuation</div>
            <div className="text-base font-bold text-white font-mono mt-0.5">
              ${valuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-forest-900/40 border border-forest-800/40 p-3 rounded-xl">
            <div className="text-slate-400">Total Return</div>
            <div className={`text-base font-bold font-mono mt-0.5 ${isPositive ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isPositive ? '+' : ''}${gain.toFixed(2)} ({gainPct.toFixed(1)}%)
            </div>
          </div>

          <div className="bg-forest-900/40 border border-forest-800/40 p-3 rounded-xl">
            <div className="text-slate-400">Time In Soil</div>
            <div className="text-base font-bold text-sprout mt-0.5">
              {holdingDurationYears} Years
            </div>
          </div>

          <div className="bg-forest-900/40 border border-forest-800/40 p-3 rounded-xl">
            <div className="text-slate-400">Trunk Diameter</div>
            <div className="text-sm font-semibold text-slate-200 mt-0.5">
              {(trunkRadius * 2).toFixed(2)}m
            </div>
          </div>

          <div className="bg-forest-900/40 border border-forest-800/40 p-3 rounded-xl">
            <div className="text-slate-400">Canopy Height</div>
            <div className="text-sm font-semibold text-slate-200 mt-0.5">
              {height.toFixed(1)}m
            </div>
          </div>

          <div className="bg-forest-900/40 border border-forest-800/40 p-3 rounded-xl">
            <div className="text-slate-400">Harvest Yield</div>
            <div className="text-sm font-semibold text-amber-300 mt-0.5">
              {fruitCount > 0 ? `${fruitCount} Blossom Fruits` : 'Solid Timber'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-forest-600 hover:bg-forest-500 text-white font-medium text-xs rounded-xl transition"
          >
            Return to Forest Canopy
          </button>
        </div>
      </div>
    </div>
  );
};
