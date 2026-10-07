import React from 'react';
import {
  PortfolioSummary,
  Holding,
  Transaction,
  SPECIES_CATALOG,
  calculateTreeMetrics
} from '@invest-forest/core';
import {
  TrendingUp,
  Wallet,
  Coins,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  TreePine,
  Flame
} from 'lucide-react';

interface PortfolioTerminalProps {
  summary: PortfolioSummary;
  holdings: Holding[];
  transactions: Transaction[];
  onSelectHolding: (holding: Holding) => void;
  onOpenDeposit: () => void;
  onOpenPanicSell?: () => void;
  onOpenLiquidation?: () => void;
  onOpenAiSpirit?: () => void;
  onOpenSimulation?: () => void;
  onOpenDisciplineCard?: () => void;
  onOpenBrokerageImport?: () => void;
  onOpenSanctuaryDeed?: () => void;
  onOpenReset?: () => void;
  onOpenSell?: (holding: Holding) => void;
}

export const PortfolioTerminal: React.FC<PortfolioTerminalProps> = ({
  summary,
  holdings,
  transactions,
  onSelectHolding,
  onOpenDeposit,
  onOpenPanicSell,
  onOpenLiquidation,
  onOpenAiSpirit,
  onOpenSimulation,
  onOpenDisciplineCard,
  onOpenBrokerageImport,
  onOpenSanctuaryDeed,
  onOpenReset,
  onOpenSell,
}) => {
  const isPositive = summary.unrealizedGain >= 0;

  return (
    <div className="w-full h-full overflow-y-auto px-4 py-6 md:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Value */}
        <div className="bg-forest-900/60 border border-forest-600/30 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-medium tracking-wider">Total Net Worth</span>
            <Wallet className="w-4 h-4 text-sprout" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-white">
            ${summary.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Cash: ${summary.cashBalance.toLocaleString()}
          </div>
        </div>

        {/* Principal & Gain */}
        <div className="bg-forest-900/60 border border-forest-600/30 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-medium tracking-wider">Net Growth</span>
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div className={`text-2xl md:text-3xl font-extrabold ${isPositive ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isPositive ? '+' : ''}${summary.unrealizedGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-300 mt-1">
            {isPositive ? '+' : ''}{summary.unrealizedGainPercent.toFixed(2)}% on ${summary.investedPrincipal.toLocaleString()} principal
          </div>
        </div>

        {/* XIRR True Dollar-Weighted Return */}
        <div className="bg-forest-900/60 border border-forest-600/30 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-medium tracking-wider">Annualized XIRR</span>
            <TrendingUp className="w-4 h-4 text-moss" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-white">
            {(summary.xirr * 100).toFixed(2)}%
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-moss" />
            <span>Newton-Raphson Verified</span>
          </div>
        </div>

        {/* Compounding Multiplier & DCA Streak */}
        <div className="bg-forest-900/60 border border-forest-600/30 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-medium tracking-wider">Compounding Power</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-orange-300">
            {summary.compoundingMultiplier >= 0 ? '+' : ''}{summary.compoundingMultiplier.toFixed(2)}x
          </div>
          <div className="text-xs text-slate-300 mt-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-sunlit" />
            <span>{summary.dcaStreak} Disciplined Deposits</span>
          </div>
        </div>
      </div>

      {/* Asset Allocation & Rebalancing Bar */}
      <div className="bg-forest-900/60 border border-forest-600/30 rounded-2xl p-5 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Ecosystem Biodiversity (Asset Allocation)
          </h2>
          <span className="text-xs text-slate-400">Target Balanced Canopy</span>
        </div>

        {/* Progress Bar Stack */}
        <div className="w-full h-4 bg-slate-900/80 rounded-full overflow-hidden flex shadow-inner">
          {summary.assetAllocations.map((alloc) => {
            if (alloc.percentage <= 0) return null;
            const colors: Record<string, string> = {
              broad_market: 'bg-emerald-600',
              dividend: 'bg-teal-500',
              bond: 'bg-cyan-600',
              cash: 'bg-blue-500',
              speculative: 'bg-purple-500',
            };
            return (
              <div
                key={alloc.assetClass}
                style={{ width: `${alloc.percentage}%` }}
                className={`${colors[alloc.assetClass] || 'bg-slate-500'} transition-all duration-500`}
                title={`${alloc.assetClass}: ${alloc.percentage}%`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 pt-1 text-xs">
          {summary.assetAllocations.map((alloc) => {
            const spec = SPECIES_CATALOG[alloc.assetClass];
            return (
              <div key={alloc.assetClass} className="flex items-center gap-1.5 text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: spec?.foliageColor || '#4c8c6f' }}
                />
                <span className="font-medium">{spec?.commonName || alloc.assetClass}:</span>
                <span className="text-white font-semibold">{alloc.percentage}%</span>
                <span className="text-slate-500">(${alloc.value.toLocaleString()})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Holdings Flora Grid */}
      <div className="bg-forest-900/60 border border-forest-600/30 rounded-2xl p-5 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TreePine className="w-5 h-5 text-sprout" />
            <h2 className="text-lg font-bold text-white">Botanical Holdings Ledger</h2>
          </div>
          <div className="flex items-center gap-2">
            {onOpenDisciplineCard && (
              <button
                onClick={onOpenDisciplineCard}
                className="px-3 py-1.5 bg-forest-800 hover:bg-forest-700 text-amber-300 border border-amber-600/30 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
              >
                <span>🏆</span>
                <span>Discipline Card</span>
              </button>
            )}
            {onOpenSimulation && (
              <button
                onClick={onOpenSimulation}
                className="px-3 py-1.5 bg-forest-800 hover:bg-forest-700 text-sprout border border-forest-600/40 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
              >
                <span>⏳</span>
                <span>Time Machine</span>
              </button>
            )}
            {onOpenAiSpirit && (
              <button
                onClick={onOpenAiSpirit}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-800 to-teal-700 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl text-xs font-semibold transition shadow-md flex items-center gap-1.5 border border-emerald-500/30"
              >
                <span>🦉</span>
                <span>AI Ecology Audit</span>
              </button>
            )}
            {onOpenSanctuaryDeed && (
              <button
                onClick={onOpenSanctuaryDeed}
                className="px-3 py-1.5 bg-forest-800 hover:bg-forest-700 text-yellow-300 border border-yellow-600/40 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
              >
                <span>📜</span>
                <span>Sanctuary Deed</span>
              </button>
            )}
            {onOpenBrokerageImport && (
              <button
                onClick={onOpenBrokerageImport}
                className="px-3 py-1.5 bg-forest-800 hover:bg-forest-700 text-slate-200 border border-forest-600/40 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
              >
                <span>📥</span>
                <span>Import Statement</span>
              </button>
            )}
            {onOpenReset && (
              <button
                onClick={onOpenReset}
                className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-700/30 rounded-xl text-xs font-semibold transition flex items-center gap-1"
                title="Wipe and start fresh"
              >
                <span>🧹</span>
                <span className="hidden xl:inline">Wipe Data</span>
              </button>
            )}
            <button
              onClick={onOpenDeposit}
              className="px-3.5 py-1.5 bg-forest-600 hover:bg-forest-500 text-white rounded-xl text-xs font-semibold transition shadow-md flex items-center gap-1.5"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Plant / DCA</span>
            </button>
            <button
              onClick={onOpenLiquidation || onOpenPanicSell}
              className="px-3 py-1.5 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-700/50 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <span>🚪</span>
              <span>Harvest / Liquidate</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-forest-700/50 text-xs uppercase text-slate-400">
                <th className="pb-3 font-medium">Asset & Species</th>
                <th className="pb-3 font-medium">Shares</th>
                <th className="pb-3 font-medium">Current Price</th>
                <th className="pb-3 font-medium">Total Value</th>
                <th className="pb-3 font-medium">Total Gain</th>
                <th className="pb-3 font-medium">Growth Rings (Age)</th>
                <th className="pb-3 font-medium text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-800/40">
              {holdings.map((h) => {
                const metrics = calculateTreeMetrics(h);
                const val = h.shares * h.currentPrice;
                const gain = val - h.costBasis;
                const gainPct = h.costBasis > 0 ? (gain / h.costBasis) * 100 : 0;
                const gainPositive = gain >= 0;

                return (
                  <tr
                    key={h.symbol}
                    className="hover:bg-forest-800/30 transition cursor-pointer group"
                    onClick={() => onSelectHolding(h)}
                  >
                    <td className="py-3.5">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{h.symbol}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-forest-800 border border-forest-600/40 text-sprout">
                          {metrics.species.commonName}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">{h.name}</div>
                    </td>
                    <td className="py-3.5 text-slate-200 font-mono">
                      {h.shares.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                    </td>
                    <td className="py-3.5 text-slate-200 font-mono">
                      ${h.currentPrice.toFixed(2)}
                    </td>
                    <td className="py-3.5 font-bold text-white font-mono">
                      ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 font-mono">
                      <span className={`font-semibold ${gainPositive ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {gainPositive ? '+' : ''}${gain.toFixed(2)} ({gainPositive ? '+' : ''}{gainPct.toFixed(1)}%)
                      </span>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <span className="w-5 h-5 rounded-full bg-forest-800 border border-forest-500/60 flex items-center justify-center font-bold text-sprout">
                          {metrics.growthRings}
                        </span>
                        <span>{metrics.holdingDurationYears} yrs in soil</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onOpenSell && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenSell(h);
                            }}
                            className="px-2.5 py-1 text-xs bg-amber-950/60 hover:bg-amber-900 text-amber-300 rounded-lg border border-amber-700/50 transition font-bold"
                          >
                            Sell
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectHolding(h);
                          }}
                          className="px-2.5 py-1 text-xs bg-forest-800/80 hover:bg-forest-700 text-slate-200 rounded-lg border border-forest-600/40 group-hover:border-sprout transition"
                        >
                          Examine 🌲
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Disciplined Activity Ledger */}
      <div className="bg-forest-900/60 border border-forest-600/30 rounded-2xl p-5 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sprout" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Cultivation Ledger (Recent Transactions)
            </h2>
          </div>
          <span className="text-xs text-slate-400">{transactions.length} Total Records</span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {transactions.slice(-8).reverse().map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between bg-forest-950/50 border border-forest-800/40 px-3.5 py-2.5 rounded-xl text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                  tx.type === 'deposit'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                    : tx.type === 'buy'
                    ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                    : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                }`}>
                  {tx.type}
                </span>
                <span className="text-slate-300 font-medium">
                  {tx.symbol ? `${tx.symbol} (${tx.shares || ''} shares)` : tx.note || 'Cash flow'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-400 font-mono">{tx.date}</span>
                <span className="font-bold font-mono text-white">
                  ${tx.amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
