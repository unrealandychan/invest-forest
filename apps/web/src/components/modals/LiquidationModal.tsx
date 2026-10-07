import React, { useState } from 'react';
import { Holding, HarvestMemorial, calculateTreeMetrics } from '@invest-forest/core';
import { db } from '../../storage/db';
import { addTransaction } from '../../storage/repository';
import { triggerHaptic } from '../../services/capacitorBridge';
import { ImpactStyle } from '@capacitor/haptics';
import {
  X,
  Footprints,
  HeartHandshake,
  Droplet,
  ArrowRight,
  TreePine
} from 'lucide-react';

interface LiquidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  holdings: Holding[];
  cashBalance: number;
  onOpenCanopyWalk: () => void;
  onHarvestSuccess?: () => void;
}

export const LiquidationModal: React.FC<LiquidationModalProps> = ({
  isOpen,
  onClose,
  holdings,
  cashBalance,
  onOpenCanopyWalk,
  onHarvestSuccess,
}) => {
  const [selectedDoor, setSelectedDoor] = useState<'door1' | 'door2' | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState(holdings[0]?.symbol || '');
  const [harvestPercent, setHarvestPercent] = useState<number>(100);
  const [harvestReason, setHarvestReason] = useState<string>('Down payment on home / property');
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [completedBlessing, setCompletedBlessing] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetHolding = holdings.find((h) => h.symbol === selectedSymbol) || holdings[0];
  const targetValuation = targetHolding ? targetHolding.shares * targetHolding.currentPrice : 0;
  const harvestDollars = Math.round((targetValuation * (harvestPercent / 100)) * 100) / 100;
  const harvestShares = targetHolding ? Math.round((targetHolding.shares * (harvestPercent / 100)) * 1000) / 1000 : 0;

  const handleExecuteHarvest = async () => {
    if (!targetHolding || harvestDollars <= 0) return;

    setIsHarvesting(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const metrics = calculateTreeMetrics(targetHolding);

      await db.transaction('rw', [db.holdings, db.transactions, db.harvestMemorials], async () => {
        // Record sell/harvest transaction
        await addTransaction({
          date: today,
          type: 'sell',
          symbol: targetHolding.symbol,
          assetClass: targetHolding.assetClass,
          shares: harvestShares,
          price: targetHolding.currentPrice,
          amount: harvestDollars,
          note: `Real-life harvest: ${harvestReason}`,
        });

        // If full harvest, leave memorial stump
        if (harvestPercent >= 99 || targetHolding.shares <= harvestShares) {
          const memorial: HarvestMemorial = {
            id: `memorial-${Date.now()}`,
            symbol: targetHolding.symbol,
            name: targetHolding.name,
            assetClass: targetHolding.assetClass,
            harvestedDate: today,
            harvestedAmount: harvestDollars,
            harvestedShares: harvestShares,
            yearsInSoil: metrics.holdingDurationYears,
            reason: harvestReason,
          };
          await db.harvestMemorials.add(memorial);
          await db.holdings.delete(targetHolding.symbol);
        } else {
          // Partial harvest: reduce shares & cost basis
          targetHolding.shares = Math.max(0, targetHolding.shares - harvestShares);
          targetHolding.costBasis = Math.max(0, targetHolding.costBasis - (targetHolding.costBasis * (harvestPercent / 100)));
          await db.holdings.put(targetHolding);
        }
      });

      triggerHaptic(ImpactStyle.Heavy);
      setCompletedBlessing(
        `Your ${targetHolding.symbol} timber was harvested with honor to fulfill: "${harvestReason}". A dignified memorial stump with fresh regenerating saplings now commemorates this milestone on your meadow.`
      );
      if (onHarvestSuccess) onHarvestSuccess();
    } catch (err) {
      console.error('Failed to execute harvest:', err);
    } finally {
      setIsHarvesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-forest-950 border border-forest-600/50 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative flex flex-col space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">The Crossroads of Capital</h2>
            <p className="text-xs text-slate-400">Two clear doors: honoring real-world life needs vs soothing temporary market fear</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-forest-900 hover:bg-forest-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cash Exemption Notice */}
        <div className="p-3 bg-blue-950/50 border border-blue-600/40 rounded-2xl text-xs text-blue-200 flex items-start gap-2.5">
          <Droplet className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block">Cash Stream Liquidity Exemption</strong>
            Your liquid freshwater stream holds <strong>${cashBalance.toLocaleString()}</strong>. Cash reserves are 100% exempt from cooling-off periods and can be withdrawn immediately anytime.
          </div>
        </div>

        {completedBlessing ? (
          <div className="p-5 bg-forest-900/80 border border-forest-600/50 rounded-2xl space-y-3 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-forest-800 border border-sprout mx-auto flex items-center justify-center text-sprout text-2xl">
              🪵
            </div>
            <h3 className="text-base font-bold text-white">Harvest Consecrated</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{completedBlessing}</p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-forest-600 hover:bg-forest-500 text-white font-bold rounded-xl text-xs transition shadow-md"
              >
                Return to Forest Meadow
              </button>
            </div>
          </div>
        ) : selectedDoor === 'door1' ? (
          /* Door 1: Real-Life Harvest Execution Form */
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="p-3.5 bg-forest-900/60 border border-forest-700/50 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-sprout" />
                  <span>Real-Life Harvest Details</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedDoor(null)}
                  className="text-[11px] text-slate-400 hover:text-white underline"
                >
                  ← Back to Doors
                </button>
              </div>

              {/* Select Asset */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Timber Asset to Harvest</label>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="w-full bg-forest-950 border border-forest-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                >
                  {holdings.map((h) => (
                    <option key={h.symbol} value={h.symbol}>
                      {h.symbol} (${(h.shares * h.currentPrice).toLocaleString()} • {h.shares.toFixed(2)} shares)
                    </option>
                  ))}
                </select>
              </div>

              {/* Life Reason */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Life Milestone Purpose</label>
                <select
                  value={harvestReason}
                  onChange={(e) => setHarvestReason(e.target.value)}
                  className="w-full bg-forest-950 border border-forest-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                >
                  <option value="Down payment on home / property">🏡 Down payment on home / property</option>
                  <option value="Emergency medical / family care">🩺 Emergency medical / family care</option>
                  <option value="Life milestone celebration">💍 Life milestone celebration</option>
                  <option value="Education / tuition nourishment">🎓 Education / tuition nourishment</option>
                  <option value="Business investment / career pivot">💼 Business investment / career pivot</option>
                  <option value="Essential debt liberation">🛡️ Essential debt liberation</option>
                </select>
              </div>

              {/* Harvest Proportion */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Harvest Amount:</span>
                  <span className="text-white font-bold font-mono">
                    ${harvestDollars.toLocaleString()} ({harvestPercent}% of position)
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={harvestPercent}
                  onChange={(e) => setHarvestPercent(parseInt(e.target.value))}
                  className="w-full accent-sprout cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>Partial Pruning (10%)</span>
                  <span>Half Timber (50%)</span>
                  <span>Full Harvest (Memorial Stump)</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleExecuteHarvest}
              disabled={isHarvesting}
              className="w-full py-2.5 bg-forest-500 hover:bg-forest-400 text-forest-950 font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2"
            >
              <TreePine className="w-4 h-4" />
              <span>
                {isHarvesting
                  ? 'Consecrating Timber Harvest...'
                  : `Execute Real-Life Harvest ($${harvestDollars.toLocaleString()})`}
              </span>
            </button>
          </div>
        ) : (
          /* The Two Doors Selector */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Door 1: Real-Life Harvest */}
            <div
              onClick={() => setSelectedDoor('door1')}
              className="p-4 bg-forest-900/60 hover:bg-forest-800/90 border border-forest-700/60 hover:border-sprout rounded-2xl cursor-pointer transition flex flex-col justify-between space-y-3 group shadow-md"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🚪</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-forest-800 text-sprout border border-forest-600/40">
                    Door 1
                  </span>
                </div>
                <h3 className="font-bold text-white text-sm group-hover:text-sprout transition">
                  Real-Life Harvest
                </h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  I genuinely need this capital for an offline life milestone: a home down payment, family medical care, or major life event.
                </p>
              </div>

              <div className="pt-2 border-t border-forest-800 flex items-center justify-between text-[11px] text-sprout font-semibold">
                <span>Consecrate Harvest</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Door 2: Market Weather Anxiety */}
            <div
              onClick={() => {
                onClose();
                onOpenCanopyWalk();
              }}
              className="p-4 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-700/50 hover:border-amber-500 rounded-2xl cursor-pointer transition flex flex-col justify-between space-y-3 group shadow-md"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🚪</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-600/40">
                    Door 2
                  </span>
                </div>
                <h3 className="font-bold text-white text-sm group-hover:text-amber-300 transition">
                  Market Weather Anxiety
                </h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  I am feeling nervous about market drawdowns, scary headlines, or temporary price drops and want to sell to stop the pain.
                </p>
              </div>

              <div className="pt-2 border-t border-amber-900/60 flex items-center justify-between text-[11px] text-amber-300 font-semibold">
                <span>Enter 24h Canopy Walk</span>
                <Footprints className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
