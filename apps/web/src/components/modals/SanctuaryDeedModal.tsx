import React, { useState } from 'react';
import {
  getBiomeTier,
  getNextBiomeTier,
  generateSanctuaryDeedSvg,
  BIOME_TIERS,
  BiomeTier,
} from '@invest-forest/core';
import { X, Award, Download, Share2, Check } from 'lucide-react';

interface SanctuaryDeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  netWorth: number;
}

export const SanctuaryDeedModal: React.FC<SanctuaryDeedModalProps> = ({
  isOpen,
  onClose,
  netWorth,
}) => {
  const currentTier = getBiomeTier(netWorth);
  const nextInfo = getNextBiomeTier(netWorth);
  const [selectedTier, setSelectedTier] = useState<BiomeTier>(currentTier);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const deedSvg = generateSanctuaryDeedSvg(selectedTier, 'Honored Cultivator', netWorth);
  const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(deedSvg)}`;

  const handleDownloadSvg = () => {
    const a = document.createElement('a');
    a.href = svgDataUrl;
    a.download = `invest-forest-sanctuary-deed-tier${selectedTier.tierNumber}.svg`;
    a.click();
  };

  const handleDownloadPng = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `invest-forest-sanctuary-deed-tier${selectedTier.tierNumber}.png`;
        a.click();
      }
    };
    img.src = svgDataUrl;
  };

  const handleCopyShare = () => {
    const text = `📜 I hold the Sacred Canopy Sanctuary Deed for "${currentTier.name}" on Invest Forest!
• Custodian Title: ${currentTier.custodianTitle}
• Biome Tier: ${currentTier.tierNumber} of 5
• Physical Features: ${currentTier.features.join(' • ')}
Patient compounding builds permanent empires! 🌲 #InvestForest #Bogleheads`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-forest-950 border border-forest-600/50 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative flex flex-col space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-forest-900 border border-forest-700/60 text-sprout">
              <Award className="w-5 h-5 text-sunlit" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Canopy Sanctuary Deed</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-forest-800 border border-forest-600/50 text-sprout font-bold">
                  Tier {currentTier.tierNumber} Active
                </span>
              </div>
              <p className="text-xs text-slate-400">Ceremonial certificate consecrated by your patient wealth compounding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-forest-900 hover:bg-forest-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tier Milestones Ribbon */}
        <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-forest-900/60 rounded-2xl border border-forest-800">
          {BIOME_TIERS.map((tier) => {
            const isUnlocked = netWorth >= tier.minNetWorth;
            const isSelected = selectedTier.id === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setSelectedTier(tier)}
                className={`py-2 px-1 rounded-xl text-center transition flex flex-col items-center justify-between ${
                  isSelected
                    ? 'bg-forest-800 border border-sprout text-white shadow-sm'
                    : isUnlocked
                    ? 'bg-forest-950/60 border border-forest-700/40 text-slate-300 hover:bg-forest-900'
                    : 'bg-forest-950/30 border border-forest-900 text-slate-600 hover:text-slate-400'
                }`}
              >
                <span className="text-[10px] font-bold">T{tier.tierNumber}</span>
                <span className="text-[9px] truncate w-full font-medium mt-0.5">
                  {tier.name.replace('The ', '')}
                </span>
                <span className="text-[8px] font-mono opacity-80 mt-0.5">
                  ${(tier.minNetWorth / 1000).toFixed(0)}k
                </span>
              </button>
            );
          })}
        </div>

        {/* Progress towards Next Biome */}
        {nextInfo.nextTier && (
          <div className="p-3 bg-forest-900/40 border border-forest-800 rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">
                Ascension to <strong className="text-white">{nextInfo.nextTier.name}</strong> (${(nextInfo.nextTier.minNetWorth / 1000).toFixed(0)}k)
              </span>
              <span className="text-sprout font-bold">{nextInfo.progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
              <div
                style={{ width: `${nextInfo.progressPercent}%` }}
                className="h-full bg-gradient-to-r from-forest-600 to-sprout transition-all duration-500"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Current Canopy: ${Math.round(netWorth).toLocaleString()}</span>
              <span>${Math.round(nextInfo.remainingDollars).toLocaleString()} remaining to unlock Tier {nextInfo.nextTier.tierNumber} landmarks</span>
            </div>
          </div>
        )}

        {/* Deed Preview Canvas */}
        <div className="w-full rounded-2xl overflow-hidden border border-forest-700/60 shadow-xl bg-forest-950">
          <img
            src={svgDataUrl}
            alt="Invest Forest Canopy Sanctuary Deed"
            className="w-full h-auto object-contain block"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
          <button
            onClick={handleDownloadPng}
            className="py-2.5 px-3 bg-forest-600 hover:bg-forest-500 text-white font-bold rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG (1200x800)</span>
          </button>

          <button
            onClick={handleDownloadSvg}
            className="py-2.5 px-3 bg-forest-800 hover:bg-forest-700 text-slate-200 border border-forest-600/50 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-4 h-4 text-sprout" />
            <span>Download Vector SVG</span>
          </button>

          <button
            onClick={handleCopyShare}
            className="py-2.5 px-3 bg-forest-900 hover:bg-forest-800 border border-forest-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied Share Text!</span>
              </>
            ) : (
              <span>Copy Biome Lore</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
