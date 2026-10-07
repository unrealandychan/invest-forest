import React, { useState } from 'react';
import { resetEntireDatabase } from '../../storage/repository';
import { X, RotateCcw, Sprout, TreePine, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetComplete?: (mode: 'clean' | 'demo') => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onResetComplete,
}) => {
  const [selectedMode, setSelectedMode] = useState<'clean' | 'demo'>('clean');
  const [isWiping, setIsWiping] = useState(false);

  if (!isOpen) return null;

  const handleExecuteReset = async () => {
    setIsWiping(true);
    try {
      await resetEntireDatabase(selectedMode);
      if (onResetComplete) {
        onResetComplete(selectedMode);
      }
      onClose();
    } catch (err) {
      console.error('Failed to reset database:', err);
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-forest-950 border border-forest-600/50 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-600/50 text-amber-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Reset Forest & Wipe Data</h2>
              <p className="text-xs text-slate-400">Clear existing test data for a pristine fresh start</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-forest-900 hover:bg-forest-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Badge */}
        <div className="p-3 bg-amber-950/40 border border-amber-700/50 rounded-2xl text-xs text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            This will wipe your current local browser state (holdings, transactions, and memorial stumps) so you can experience Invest Forest as a brand-new user.
          </span>
        </div>

        {/* Starting Mode Choice */}
        <div className="space-y-2 text-xs">
          <label className="text-slate-300 font-medium block">Choose Starting Forest State:</label>

          <div
            onClick={() => setSelectedMode('clean')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
              selectedMode === 'clean'
                ? 'border-sprout bg-forest-900/90 text-white shadow-sm'
                : 'border-forest-800 bg-forest-950/60 text-slate-400 hover:bg-forest-900/40'
            }`}
          >
            <Sprout className={`w-5 h-5 shrink-0 mt-0.5 ${selectedMode === 'clean' ? 'text-sprout' : 'text-slate-500'}`} />
            <div className="space-y-0.5">
              <strong className="text-white block">Fresh Fertile Soil ($0 Blank Canvas) 🌱</strong>
              <p className="text-[11px] text-slate-300">
                Pristine empty meadow with $0 balance. Starts from absolute scratch so you can plant your very first seedling!
              </p>
            </div>
          </div>

          <div
            onClick={() => setSelectedMode('demo')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
              selectedMode === 'demo'
                ? 'border-sprout bg-forest-900/90 text-white shadow-sm'
                : 'border-forest-800 bg-forest-950/60 text-slate-400 hover:bg-forest-900/40'
            }`}
          >
            <TreePine className={`w-5 h-5 shrink-0 mt-0.5 ${selectedMode === 'demo' ? 'text-moss' : 'text-slate-500'}`} />
            <div className="space-y-0.5">
              <strong className="text-white block">Mature Boglehead Grove ($39,000 Demo) 🌲</strong>
              <p className="text-[11px] text-slate-300">
                A flourishing reference grove with Oak, Apple, and Bond trees with 5 years of annual growth rings.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-2 border-t border-forest-800">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-forest-900 hover:bg-forest-800 text-slate-300 font-semibold rounded-xl text-xs transition"
          >
            Cancel
          </button>

          <button
            onClick={handleExecuteReset}
            disabled={isWiping}
            className="flex-1 py-2.5 bg-forest-500 hover:bg-forest-400 text-forest-950 font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isWiping ? 'Wiping Data...' : 'Wipe & Launch Fresh'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
