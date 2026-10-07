import React, { useState } from 'react';
import {
  generateDisciplineCardData,
  renderDisciplineCardSvg,
  Holding,
  PortfolioSummary,
  Transaction,
} from '@invest-forest/core';
import { X, Award, Download, Copy, Check, Share2, Palette } from 'lucide-react';

interface DisciplineCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  holdings: Holding[];
  transactions: Transaction[];
  summary: PortfolioSummary;
}

export const DisciplineCardModal: React.FC<DisciplineCardModalProps> = ({
  isOpen,
  onClose,
  holdings,
  transactions,
  summary,
}) => {
  const [theme, setTheme] = useState<'emerald' | 'amber' | 'frost'>('emerald');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cardData = generateDisciplineCardData(holdings, transactions, summary, theme);
  const svgString = renderDisciplineCardSvg(cardData);
  const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;

  const handleDownloadSvg = () => {
    const a = document.createElement('a');
    a.href = svgDataUrl;
    a.download = `invest-forest-discipline-card-${cardData.concentricRings}yr.svg`;
    a.click();
  };

  const handleDownloadPng = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `invest-forest-discipline-card-${cardData.concentricRings}yr.png`;
        a.click();
      }
    };
    img.src = svgDataUrl;
  };

  const handleCopyShareText = () => {
    const text = `🌲 I just generated my Proof of Patience on Invest Forest!
• Title: ${cardData.growerTitle}
• Annual Growth Rings: ${cardData.concentricRings} Years
• DCA Cadence: ${cardData.dcaStreak} Disciplined Deposits
• Panic Sells: 0
Time in the market beats timing the market! 🌳 #InvestForest #DCA`;
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
              <h2 className="text-xl font-bold text-white">Proof of Patience (Discipline Card)</h2>
              <p className="text-xs text-slate-400">Zero-knowledge shareable card: showcases holding time and rings with 0 dollar leaks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-forest-900 hover:bg-forest-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Picker */}
        <div className="flex items-center justify-between text-xs bg-forest-900/60 p-2 rounded-2xl border border-forest-800">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium pl-2">
            <Palette className="w-3.5 h-3.5 text-sprout" />
            <span>Card Theme:</span>
          </div>
          <div className="flex gap-1.5">
            {[
              { id: 'emerald', label: 'Deep Emerald', color: '#52b788' },
              { id: 'amber', label: 'Golden Amber', color: '#f4a261' },
              { id: 'frost', label: 'Winter Frost', color: '#90e0ef' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id as any)}
                className={`px-3 py-1 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                  theme === t.id ? 'bg-forest-800 text-white border border-forest-600/60' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SVG Card Live Render */}
        <div className="w-full rounded-2xl overflow-hidden border border-forest-700/60 shadow-xl bg-forest-950">
          <img
            src={svgDataUrl}
            alt="Invest Forest Discipline Card"
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
            <span>Download PNG (1200x630)</span>
          </button>

          <button
            onClick={handleDownloadSvg}
            className="py-2.5 px-3 bg-forest-800 hover:bg-forest-700 text-slate-200 border border-forest-600/50 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-4 h-4 text-sprout" />
            <span>Download Vector SVG</span>
          </button>

          <button
            onClick={handleCopyShareText}
            className="py-2.5 px-3 bg-forest-900 hover:bg-forest-800 border border-forest-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied Share Text!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy Social Text</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
