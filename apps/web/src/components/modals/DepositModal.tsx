import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { AssetClass, Holding, ASSET_CATALOG, SPECIES_CATALOG } from '@invest-forest/core';
import { addTransaction } from '../../storage/repository';
import { triggerHaptic } from '../../services/capacitorBridge';
import { ImpactStyle } from '@capacitor/haptics';
import { X, Sprout, PlusCircle, Search } from 'lucide-react';

interface DepositModalProps {
  holdings: Holding[];
  isOpen: boolean;
  onClose: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ holdings, isOpen, onClose }) => {
  const [mode, setMode] = useState<'deposit' | 'buy'>('buy');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedSymbol, setSelectedSymbol] = useState(holdings[0]?.symbol || 'VOO');
  const [amount, setAmount] = useState('500');
  const [shares, setShares] = useState('1.0');
  const [assetClass, setAssetClass] = useState<AssetClass>('broad_market');
  const [customTickerMode, setCustomTickerMode] = useState(false);
  const [customSymbol, setCustomSymbol] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const categories = ['All', 'Broad Market', 'Dividend & Yield', 'Bonds & Fixed Income', 'Cash & Treasury', 'Satellite & Speculative'];

  const filteredAssets = ASSET_CATALOG.filter((a) => {
    const matchesCategory = activeCategory === 'All' || a.category === activeCategory;
    const matchesSearch = !searchFilter ||
      a.symbol.toLowerCase().includes(searchFilter.toLowerCase()) ||
      a.name.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentEffectiveSymbol = customTickerMode ? (customSymbol.trim().toUpperCase() || 'CUSTOM') : selectedSymbol;
  const currentSpecies = SPECIES_CATALOG[assetClass] || SPECIES_CATALOG.broad_market;

  const handleSelectAsset = (asset: typeof ASSET_CATALOG[0]) => {
    setSelectedSymbol(asset.symbol);
    setAssetClass(asset.assetClass);
    setCustomTickerMode(false);
    const numAmount = parseFloat(amount) || 500;
    setShares((numAmount / asset.defaultPrice).toFixed(3));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      if (mode === 'deposit') {
        await addTransaction({
          date: today,
          type: 'deposit',
          assetClass: 'cash',
          amount: numAmount,
          note: 'Disciplined liquid reserve nourishment',
        });
      } else {
        const numShares = parseFloat(shares) || 1;
        const price = numAmount / numShares;
        await addTransaction({
          date: today,
          type: 'buy',
          symbol: currentEffectiveSymbol,
          assetClass,
          shares: numShares,
          price,
          amount: numAmount,
          note: `DCA purchase into ${currentEffectiveSymbol}`,
        });
      }

      // Celebratory low-poly foliage confetti & haptic pulse
      triggerHaptic(ImpactStyle.Medium);
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#4c8c6f', '#7ca982', '#a8d5ba', '#f4e04d', '#0077b6'],
      });

      onClose();
    } catch (err) {
      console.error('Failed to submit transaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-forest-950 border border-forest-600/50 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-forest-900 border border-forest-700/60 text-sprout">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Cultivate Forest (DCA Planting)</h2>
              <p className="text-xs text-slate-400">Choose an asset to plant or nourish the liquid stream</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-forest-900 hover:bg-forest-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-xl bg-forest-900 p-1 border border-forest-800">
          <button
            type="button"
            onClick={() => setMode('buy')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === 'buy' ? 'bg-forest-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            🌱 Plant Seedling / Buy Asset
          </button>
          <button
            type="button"
            onClick={() => setMode('deposit')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === 'deposit' ? 'bg-forest-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            💧 Add Cash Stream
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'buy' && (
            <>
              {/* Asset Categories & Search */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-slate-300 font-medium">Select Botanical Seedling</label>
                  <button
                    type="button"
                    onClick={() => setCustomTickerMode(!customTickerMode)}
                    className="text-[11px] text-sprout hover:underline font-medium"
                  >
                    {customTickerMode ? '← Back to Catalogue' : '+ Custom Ticker'}
                  </button>
                </div>

                {!customTickerMode ? (
                  <>
                    {/* Category tabs */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
                      {categories.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setActiveCategory(c)}
                          className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                            activeCategory === c
                              ? 'bg-forest-700 text-white'
                              : 'bg-forest-900/60 text-slate-400 hover:text-white'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>

                    {/* Search box */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search ETF or Stock (e.g. VOO, SCHD, TLT, SGOV)..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="w-full bg-forest-900 border border-forest-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sprout"
                      />
                    </div>

                    {/* Asset options grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                      {filteredAssets.map((asset) => (
                        <button
                          key={asset.symbol}
                          type="button"
                          onClick={() => handleSelectAsset(asset)}
                          className={`p-2 rounded-xl text-left border transition flex flex-col justify-between ${
                            selectedSymbol === asset.symbol
                              ? 'border-sprout bg-forest-800/90 text-white shadow-sm'
                              : 'border-forest-800/80 bg-forest-900/50 text-slate-300 hover:bg-forest-900'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-bold text-white text-xs">{asset.symbol}</span>
                            <span className="text-[10px] text-slate-400 font-mono">${asset.defaultPrice}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">{asset.name}</div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  /* Custom Ticker Input */
                  <div className="p-3 bg-forest-900/60 border border-forest-700/60 rounded-2xl space-y-3">
                    <div>
                      <label className="block text-slate-300 mb-1">Custom Ticker Symbol</label>
                      <input
                        type="text"
                        placeholder="e.g. NVDA, AMZN, IWM..."
                        value={customSymbol}
                        onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
                        className="w-full bg-forest-950 border border-forest-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-sprout"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">Botanical Asset Class</label>
                      <select
                        value={assetClass}
                        onChange={(e) => setAssetClass(e.target.value as AssetClass)}
                        className="w-full bg-forest-950 border border-forest-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                      >
                        <option value="broad_market">Broad Market (Ancient Oak)</option>
                        <option value="dividend">Dividend / Yield (Honey Apple)</option>
                        <option value="bond">Bonds / Stability (Silver Willow)</option>
                        <option value="cash">Cash / Liquid (Forest Creek)</option>
                        <option value="speculative">Speculative (Wild Mushroom)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Botanical Species Live Preview Card */}
              <div className="p-3 bg-forest-900/70 border border-forest-700/40 rounded-2xl flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full shrink-0 shadow"
                  style={{ backgroundColor: currentSpecies.foliageColor }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{currentSpecies.commonName}</span>
                    <span className="text-[10px] text-sprout italic">({currentSpecies.botanicalName})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{currentSpecies.description}</div>
                </div>
              </div>

              {/* Amount and Shares */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Investment Amount ($)</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      const matched = ASSET_CATALOG.find((a) => a.symbol === currentEffectiveSymbol);
                      const p = matched?.defaultPrice || 100;
                      setShares((parseFloat(e.target.value) / p).toFixed(3));
                    }}
                    className="w-full bg-forest-900 border border-forest-700/60 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sprout"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Estimated Shares</label>
                  <input
                    type="number"
                    min="0.001"
                    step="any"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    className="w-full bg-forest-900 border border-forest-700/60 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sprout"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {mode === 'deposit' && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Liquid Deposit Amount ($)</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-forest-900 border border-forest-700/60 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sprout"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Liquid cash feeds the freshwater stream that runs through your forest, providing dry powder buffer during bear market opportunities.
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-forest-500 hover:bg-forest-400 text-forest-950 font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>
                {mode === 'buy'
                  ? `Plant Seedling for ${currentEffectiveSymbol}`
                  : 'Nourish Liquid Cash Stream'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
