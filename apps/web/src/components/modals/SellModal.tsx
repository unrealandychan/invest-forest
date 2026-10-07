import React, { useState } from 'react';
import { Holding } from '@invest-forest/core';
import { db } from '../../storage/db';
import { addTransaction } from '../../storage/repository';
import { triggerHaptic } from '../../services/capacitorBridge';
import { ImpactStyle } from '@capacitor/haptics';
import { X, DollarSign, TrendingDown, CheckCircle2 } from 'lucide-react';

interface SellModalProps {
  holding: Holding | null;
  isOpen: boolean;
  onClose: () => void;
  onSellSuccess?: () => void;
}

export const SellModal: React.FC<SellModalProps> = ({
  holding,
  isOpen,
  onClose,
  onSellSuccess,
}) => {
  const [sellShares, setSellShares] = useState<string>('1.0');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !holding) return null;

  const effectivePrice = parseFloat(customPrice) || holding.currentPrice;
  const numShares = Math.min(holding.shares, Math.max(0.0001, parseFloat(sellShares) || 1));
  const totalProceeds = Math.round(numShares * effectivePrice * 100) / 100;

  const handlePercentageSelect = (pct: number) => {
    const calculated = (holding.shares * (pct / 100)).toFixed(3);
    setSellShares(calculated);
  };

  const handleExecuteSell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numShares <= 0 || totalProceeds <= 0) return;

    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().slice(0, 10);

      await db.transaction('rw', [db.holdings, db.transactions, db.settings], async () => {
        // Record sell transaction
        await addTransaction({
          date: today,
          type: 'sell',
          symbol: holding.symbol,
          assetClass: holding.assetClass,
          shares: numShares,
          price: effectivePrice,
          amount: totalProceeds,
          note: `Sold ${numShares.toFixed(3)} shares of ${holding.symbol} at $${effectivePrice.toFixed(2)}`,
        });

        // Update holding shares & cost basis
        if (numShares >= holding.shares - 0.001) {
          // Fully sold
          await db.holdings.delete(holding.symbol);
        } else {
          // Partial trim
          const remainingShares = holding.shares - numShares;
          const costRatio = remainingShares / holding.shares;
          holding.shares = Math.round(remainingShares * 1000) / 1000;
          holding.costBasis = Math.round(holding.costBasis * costRatio * 100) / 100;
          holding.currentPrice = effectivePrice;
          await db.holdings.put(holding);
        }
      });

      triggerHaptic(ImpactStyle.Medium);
      setSuccessMessage(
        `Successfully sold ${numShares.toFixed(3)} shares of ${holding.symbol}. $${totalProceeds.toLocaleString()} has been added to your liquid cash stream!`
      );
      if (onSellSuccess) onSellSuccess();
    } catch (err) {
      console.error('Failed to sell shares:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-forest-950 border border-forest-600/50 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-forest-900 border border-forest-700/60 text-amber-400">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Sell / Trim {holding.symbol}</h2>
              <p className="text-xs text-slate-400">
                You own {holding.shares.toLocaleString(undefined, { maximumFractionDigits: 3 })} shares (${(holding.shares * holding.currentPrice).toLocaleString()})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-forest-900 hover:bg-forest-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMessage ? (
          <div className="p-4 bg-forest-900/80 border border-forest-700 rounded-2xl text-center space-y-3 animate-in zoom-in-95">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-white text-sm">Order Executed</h3>
            <p className="text-xs text-slate-300">{successMessage}</p>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-forest-600 hover:bg-forest-500 text-white font-bold rounded-xl text-xs transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleExecuteSell} className="space-y-4 text-xs">
            {/* Quick Proportion Buttons */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Quick Trim Proportion</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentageSelect(pct)}
                    className="py-1.5 rounded-xl border border-forest-800 bg-forest-900/60 hover:bg-forest-800 text-slate-300 hover:text-white font-bold transition text-xs"
                  >
                    {pct === 100 ? 'All (100%)' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Shares and Custom Execution Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Shares to Sell</label>
                <input
                  type="number"
                  min="0.001"
                  max={holding.shares}
                  step="any"
                  value={sellShares}
                  onChange={(e) => setSellShares(e.target.value)}
                  className="w-full bg-forest-900 border border-forest-700/60 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Execution Price ($/sh)</label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  placeholder={`Market $${holding.currentPrice.toFixed(2)}`}
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full bg-forest-900 border border-forest-700/60 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Total Proceeds Calculation Card */}
            <div className="p-3.5 bg-forest-900/70 border border-forest-700/50 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Cash Proceeds</span>
                <div className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5">
                  +${totalProceeds.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                Deposits directly into<br />
                <span className="text-white font-semibold">Liquid Stream 💧</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || numShares <= 0}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              <span>{isSubmitting ? 'Selling Shares...' : `Sell ${numShares.toFixed(3)} ${holding.symbol} (+$${totalProceeds.toLocaleString()})`}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
