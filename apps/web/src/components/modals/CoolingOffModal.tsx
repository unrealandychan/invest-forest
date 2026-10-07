import React, { useState } from 'react';
import { X, ShieldAlert, Footprints, Wind, CheckCircle2 } from 'lucide-react';

interface CoolingOffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoolingOffModal: React.FC<CoolingOffModalProps> = ({ isOpen, onClose }) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  if (!isOpen) return null;

  const toggleStep = (step: number) => {
    if (completedSteps.includes(step)) {
      setCompletedSteps(completedSteps.filter((s) => s !== step));
    } else {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  const allCompleted = completedSteps.length >= 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="bg-forest-950 border border-amber-600/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-600/50 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">The 24-Hour Canopy Walk</h2>
              <p className="text-xs text-amber-300">Anti-Panic Selling Behavioral Guardrail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-forest-900 hover:bg-forest-800 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Behavioral Lesson */}
        <div className="bg-forest-900/60 border border-forest-800/80 p-4 rounded-2xl text-xs space-y-2 text-slate-300">
          <p className="italic text-slate-200">
            &ldquo;Volatility is not a fine; it is the price of admission for long-term compounding.&rdquo;
          </p>
          <p className="text-slate-400">
            In traditional fintech, one-click panic sells lock in paper losses. In nature, trees do not uproot their trunks during a winter storm; they build dense annual growth rings and insulate their root soil.
          </p>
        </div>

        {/* Guided Mindfulness Checkpoints */}
        <div className="space-y-2.5 text-xs">
          <div
            onClick={() => toggleStep(1)}
            className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
              completedSteps.includes(1)
                ? 'border-emerald-600/60 bg-emerald-950/30 text-emerald-200'
                : 'border-forest-800 bg-forest-900/40 text-slate-300 hover:bg-forest-900/70'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${completedSteps.includes(1) ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>I acknowledge this drawdown is winter market weather, not permanent ruin.</span>
          </div>

          <div
            onClick={() => toggleStep(2)}
            className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
              completedSteps.includes(2)
                ? 'border-emerald-600/60 bg-emerald-950/30 text-emerald-200'
                : 'border-forest-800 bg-forest-900/40 text-slate-300 hover:bg-forest-900/70'
            }`}
          >
            <Footprints className={`w-4 h-4 ${completedSteps.includes(2) ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>I will take a 15-minute physical walk outside before executing any liquidation.</span>
          </div>

          <div
            onClick={() => toggleStep(3)}
            className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
              completedSteps.includes(3)
                ? 'border-emerald-600/60 bg-emerald-950/30 text-emerald-200'
                : 'border-forest-800 bg-forest-900/40 text-slate-300 hover:bg-forest-900/70'
            }`}
          >
            <Wind className={`w-4 h-4 ${completedSteps.includes(3) ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>I commit to sticking with my 5+ year time horizon.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-forest-600 hover:bg-forest-500 text-white font-bold rounded-xl text-xs transition shadow-lg"
          >
            Keep Trees Rooted & Deeply Compounding 🌲
          </button>
          {allCompleted && (
            <button
              onClick={() => {
                alert('Cooling-off reflection acknowledged. No timber was destroyed today!');
                onClose();
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Close Window
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
