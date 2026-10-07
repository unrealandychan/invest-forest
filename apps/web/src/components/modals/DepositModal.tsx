import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AssetClass, Holding, ASSET_CATALOG, SPECIES_CATALOG } from '@invest-forest/core';
import { addTransaction } from '../../storage/repository';
import { triggerHaptic } from '../../services/capacitorBridge';
import { soundscapeService } from '../../services/soundscapeService';
import { ImpactStyle } from '@capacitor/haptics';
import { X, Sprout, PlusCircle, Search, RefreshCw, Radio } from 'lucide-react';

interface DepositModalProps {
  holdings: Holding[];
  isOpen: boolean;
  onClose: () => void;
  drawdownPercent?: number;
  weather?: string;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  holdings,
  isOpen,
  onClose,
  drawdownPercent = 0,
  weather = 'sunny',
}) => {
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

  // Live market price state
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [priceSource, setPriceSource] = useState<'live' | 'baseline'>('baseline');
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);

  const categories = [
    'All',
    'Mega-Cap Stocks',
    'Broad Market',
    'Dividend & Yield',
    'Bonds & Fixed Income',
    'Cash & Treasury',
    'Satellite & Speculative',
  ];

  const filteredAssets = ASSET_CATALOG.filter((a) => {
    const matchesCategory = activeCategory === 'All' || a.category === activeCategory;
    const matchesSearch = !searchFilter ||
      a.symbol.toLowerCase().includes(searchFilter.toLowerCase()) ||
      a.name.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentEffectiveSymbol = customTickerMode
    ? (customSymbol.trim().toUpperCase() || 'VOO')
    : (selectedSymbol || 'VOO');

  const currentSpecies = SPECIES_CATALOG[assetClass] || SPECIES_CATALOG.broad_market;

  // Live price lookup when selected symbol changes
  useEffect(() => {
    if (!isOpen || !currentEffectiveSymbol || currentEffectiveSymbol === 'CUSTOM') return;

    let isMounted = true;
    setIsFetchingPrice(true);

    fetch(`/api/v1/quotes?symbols=${currentEffectiveSymbol}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const q = data?.quotes?.[currentEffectiveSymbol];
        if (q && q.price > 0) {
          setLivePrice(q.price);
          setPriceSource(q.source === 'live_market' ? 'live' : 'baseline');
          const numAmount = parseFloat(amount) || 500;
          setShares((numAmount / q.price).toFixed(3));
        }
      })
      .catch(() => {
        // Fallback to asset catalog default
        const fallback = ASSET_CATALOG.find((a) => a.symbol === currentEffectiveSymbol)?.defaultPrice || 100;
        if (isMounted) {
          setLivePrice(fallback);
          setPriceSource('baseline');
        }
      })
      .finally(() => {
        if (isMounted) setIsFetchingPrice(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentEffectiveSymbol, amount]);

  const handleSelectAsset = (asset: typeof ASSET_CATALOG[0]) => {
    setSelectedSymbol(asset.symbol);
    setAssetClass(asset.assetClass);
    setCustomTickerMode(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Math.max(1, parseFloat(amount) || 100);
    const numShares = Math.max(0.0001, parseFloat(shares) || 1);
    const finalSymbol = customTickerMode
      ? (customSymbol.trim().toUpperCase() || 'VOO')
      : (selectedSymbol || 'VOO');
    const finalPrice = Math.max(0.01, isFinite(livePrice!) && livePrice! > 0 ? livePrice! : numAmount / numShares);

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
        const isDrawdown = drawdownPercent <= -10 || weather === 'winter_snow';
        const drawdownMag = Math.abs(drawdownPercent <= -10 ? drawdownPercent : weather === 'winter_snow' ? 18.5 : 0);

        await addTransaction({
          date: today,
          type: 'buy',
          symbol: finalSymbol,
          assetClass,
          shares: numShares,
          price: finalPrice,
          amount: numAmount,
          note: isDrawdown
            ? `Winter Bloom DCA into ${finalSymbol} (>10% discount)`
            : `DCA purchase into ${finalSymbol}`,
          isWinterBloom: isDrawdown,
          drawdownAtPurchase: isDrawdown ? drawdownMag : undefined,
        });
      }

      // Celebratory low-poly foliage confetti & haptic pulse & chime
      triggerHaptic(ImpactStyle.Medium);
      soundscapeService.playPlantingChime();
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

  if (!isOpen) return null;

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

        {/* Discount Seedling Notification Banner */}
        {(drawdownPercent <= -10 || weather === 'winter_snow') && (
          <div className="p-3 bg-cyan-950/70 border border-cyan-400/50 rounded-2xl text-xs text-cyan-200 flex items-center gap-2.5">
            <span className="text-lg">🌸</span>
            <div>
              <strong className="text-white block">Discount Seedling Season Active!</strong>
              Purchasing seedlings during this winter drawdown awards permanent Luminescent Frost Flowers and Resilience Rings on your 3D tree.
            </div>
          </div>
        )}

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
                        placeholder="Search ETF or Stock (e.g. QQQM, VOO, SCHD, SGOV)..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="w-full bg-forest-900 border border-forest-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sprout"
                      />
                    </div>

                    {/* Asset options grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
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

                      {/* Universal Ticker Shortcut when search term has no exact match */}
                      {searchFilter.trim().length > 0 && !filteredAssets.some((a) => a.symbol === searchFilter.trim().toUpperCase()) && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomSymbol(searchFilter.trim().toUpperCase());
                            setCustomTickerMode(true);
                          }}
                          className="p-2 rounded-xl text-left border border-dashed border-sprout/70 bg-forest-900/70 hover:bg-forest-800 text-sprout transition flex flex-col justify-between col-span-2"
                        >
                          <div className="font-bold text-xs flex items-center gap-1.5">
                            <span>🔍 Plant "{searchFilter.trim().toUpperCase()}"</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-forest-800 text-slate-200">Live Yahoo Quote</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Fetch real-time stock price and cultivate custom tree</div>
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  /* Custom Ticker Input */
                  <div className="p-3 bg-forest-900/60 border border-forest-700/60 rounded-2xl space-y-3">
                    <div>
                      <label className="block text-slate-300 mb-1">Custom Ticker Symbol</label>
                      <input
                        type="text"
                        placeholder="e.g. QQQM, NVDA, AMZN, IWM..."
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

              {/* Botanical Species & Live Market Price Card */}
              <div className="p-3 bg-forest-900/70 border border-forest-700/40 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow"
                      style={{ backgroundColor: currentSpecies.foliageColor }}
                    />
                    <span className="font-bold text-white text-xs">{currentSpecies.commonName}</span>
                    <span className="text-[10px] text-sprout italic">({currentSpecies.botanicalName})</span>
                  </div>

                  {/* Real Market Price Badge */}
                  <div className="flex items-center gap-1.5 text-[11px] font-mono">
                    {isFetchingPrice ? (
                      <div className="flex items-center gap-1 text-slate-400">
                        <RefreshCw className="w-3 h-3 animate-spin text-sprout" />
                        <span>Live quote...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                        <span className="text-white font-bold">${livePrice?.toFixed(2) || '100.00'}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-forest-800 text-slate-300">
                          {priceSource === 'live' ? 'Live Market' : 'Verified Cache'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400">{currentSpecies.description}</div>
              </div>

              {/* Amount, Price, and Shares */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Investment Amount ($)</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={amount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAmount(val);
                      const num = parseFloat(val);
                      const p = livePrice && livePrice > 0 ? livePrice : 100;
                      if (!isNaN(num) && num > 0) {
                        setShares((num / p).toFixed(3));
                      }
                    }}
                    className="w-full bg-forest-900 border border-forest-700/60 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sprout"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Price per Share ($)</label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    value={livePrice ? livePrice.toFixed(2) : ''}
                    placeholder="100.00"
                    onChange={(e) => {
                      const newP = parseFloat(e.target.value);
                      if (!isNaN(newP) && newP > 0) {
                        setLivePrice(newP);
                        const a = parseFloat(amount) || 500;
                        setShares((a / newP).toFixed(3));
                      }
                    }}
                    className="w-full bg-forest-900 border border-forest-700/60 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sprout"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Calculated Shares</label>
                  <input
                    type="number"
                    min="0.001"
                    step="any"
                    value={shares}
                    onChange={(e) => {
                      const val = e.target.value;
                      setShares(val);
                      const sh = parseFloat(val);
                      const p = livePrice && livePrice > 0 ? livePrice : 100;
                      if (!isNaN(sh) && sh > 0) {
                        setAmount(Math.round(sh * p).toString());
                      }
                    }}
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
