import React, { useState } from 'react';
import {
  TreePine,
  TrendingUp,
  LayoutDashboard,
  Footprints,
  Bot,
  Sun,
  ChevronRight,
  ChevronLeft,
  X,
  Sprout,
  Compass,
  CheckCircle2,
} from 'lucide-react';

interface OnboardingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeposit: () => void;
  onOpenAiSpirit: () => void;
  onSelectBlankSoil: () => void;
  onSelectDemoSoil: () => void;
}

export const OnboardingGuideModal: React.FC<OnboardingGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenDeposit,
  onOpenAiSpirit,
  onSelectBlankSoil,
  onSelectDemoSoil,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [chosenMode, setChosenMode] = useState<'blank' | 'demo'>('blank');

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to Invest Forest 🌲',
      subtitle: 'Gamifying Patient Compounding & Long-Term Discipline',
      icon: <Compass className="w-7 h-7 text-sprout" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p className="text-sm font-semibold text-white">
            Most finance apps treat you like a gambler: flashing red sirens, casino confetti, and day-trading churn.
          </p>
          <p>
            <strong className="text-sprout">Invest Forest</strong> turns wealth accumulation into an organic 3D woodland where holding duration forms annual growth rings, and patience is rewarded with lush botanical growth.
          </p>
          <div className="p-3 bg-forest-900/70 border border-forest-700/50 rounded-2xl space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sprout block">
              Choose Your Starting Forest:
            </span>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => setChosenMode('blank')}
                className={`p-2.5 rounded-xl border transition ${
                  chosenMode === 'blank'
                    ? 'border-sprout bg-forest-800 text-white shadow-sm'
                    : 'border-forest-800 bg-forest-950/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <span>🌱 Fresh Fertile Soil</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Start from $0 clean slate. Plant your first seed yourself!
                </div>
              </button>

              <button
                type="button"
                onClick={() => setChosenMode('demo')}
                className={`p-2.5 rounded-xl border transition ${
                  chosenMode === 'demo'
                    ? 'border-sprout bg-forest-800 text-white shadow-sm'
                    : 'border-forest-800 bg-forest-950/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <span>🌲 Mature Boglehead</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Preloaded 5-year grove ($39k) to explore all mechanics.
                </div>
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Button 1: The Dual-View Switcher 🌲 ↔ 📊',
      subtitle: 'Top-Center Navbar',
      icon: <LayoutDashboard className="w-7 h-7 text-moss" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3 bg-forest-900/60 border border-forest-700/50 rounded-2xl flex items-center justify-center gap-3">
            <span className="px-3 py-1.5 rounded-xl bg-forest-600 text-white font-bold text-xs shadow flex items-center gap-1.5">
              <TreePine className="w-3.5 h-3.5" /> 3D Forest
            </span>
            <span className="text-slate-500 font-bold">↔</span>
            <span className="px-3 py-1.5 rounded-xl bg-forest-800 text-slate-300 font-bold text-xs flex items-center gap-1.5">
              <LayoutDashboard className="w-3.5 h-3.5" /> Terminal
            </span>
          </div>
          <p>
            <strong className="text-white">What it does:</strong> Toggles seamlessly between your serene 3D woodland and an institutional finance dashboard.
          </p>
          <ul className="space-y-1 text-slate-400 list-disc list-inside">
            <li><strong className="text-sprout">Forest View:</strong> Orbit, zoom, and inspect your trees and wildlife in 3D.</li>
            <li><strong className="text-moss">Terminal View:</strong> Real-time XIRR calculations, compounding multipliers, asset allocations, and transaction ledgers.</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Button 2: Plant / DCA (Add Assets) 🌱',
      subtitle: 'Top-Right Navbar',
      icon: <Sprout className="w-7 h-7 text-sprout" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3 bg-forest-900/60 border border-forest-700/50 rounded-2xl flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDeposit();
              }}
              className="px-4 py-1.5 bg-forest-500 hover:bg-forest-400 text-forest-950 font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 transition"
            >
              <Sprout className="w-4 h-4" /> Try Plant / DCA Now
            </button>
          </div>
          <p>
            <strong className="text-white">How it works:</strong> Click to invest. Choose from 18+ index ETFs (like <strong className="text-sprout">VOO</strong>, <strong className="text-sprout">QQQM</strong>, <strong className="text-sprout">SCHD</strong>, <strong className="text-sprout">BND</strong>, <strong className="text-sprout">SGOV</strong>) or type any custom ticker!
          </p>
          <p className="text-slate-400">
            Real market quotes are automatically fetched. When you execute a deposit, golden confetti showers the meadow, and a new seedling sprouts from the soil!
          </p>
        </div>
      ),
    },
    {
      title: 'Button 3: 3D Tree Rings & Lore 🪵',
      subtitle: 'Interactive Canvas Click',
      icon: <TrendingUp className="w-7 h-7 text-sunlit" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3 bg-forest-900/60 border border-forest-700/50 rounded-2xl text-center">
            <span className="text-xs font-bold text-sprout">
              🖱️ Left-Click any tree on the meadow
            </span>
          </div>
          <p>
            <strong className="text-white">Concentric Annual Rings:</strong> Old trees cannot be bought overnight. For every 365 days you hold an investment, a new concentric growth ring is etched into the tree trunk cross-section.
          </p>
          <p className="text-slate-400">
            Clicking a tree opens its botanical lore, annual growth ring cross-section, and total compounded harvest history.
          </p>
        </div>
      ),
    },
    {
      title: 'Button 4: Market Weather Simulator ❄️',
      subtitle: 'Top-Right Weather Pill',
      icon: <Sun className="w-7 h-7 text-sunlit" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3 bg-forest-900/60 border border-forest-700/50 rounded-2xl flex items-center justify-center gap-2">
            <span className="px-3 py-1 bg-forest-900 border border-forest-700 text-xs text-slate-200 rounded-xl flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-sunlit" /> Sunny Canopy
            </span>
            <span className="text-slate-500">→</span>
            <span className="px-3 py-1 bg-forest-900 border border-forest-700 text-xs text-blue-200 rounded-xl flex items-center gap-1.5">
              ❄️ Winter Snow
            </span>
          </div>
          <p>
            <strong className="text-white">Reframing Volatility:</strong> Market drawdowns (-10% to -25%) are rendered as gentle winter snow that enriches root soil.
          </p>
          <p className="text-slate-400">
            Click this button anytime to cycle between Sunny, Autumn Breeze, Soil Rain, and Winter Snow to observe how the forest weathers market seasons!
          </p>
        </div>
      ),
    },
    {
      title: 'Button 5: Canopy Spirit AI & Canopy Walk 🦉',
      subtitle: 'Navbar & Bottom HUD',
      icon: <Bot className="w-7 h-7 text-emerald-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3 bg-forest-900/60 border border-forest-700/50 rounded-2xl flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAiSpirit();
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-700 hover:from-emerald-700 hover:to-teal-600 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <span>🦉</span> Open Canopy AI
            </button>
            <span className="px-3 py-1.5 rounded-xl bg-forest-900 border border-amber-600/50 text-amber-300 font-bold text-xs flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5" /> Canopy Walk
            </span>
          </div>
          <p>
            <strong className="text-white">Behavioral Finance Guardians:</strong>
          </p>
          <ul className="space-y-1 text-slate-400 list-disc list-inside">
            <li><strong className="text-emerald-300">Canopy AI:</strong> Requests deep Ecology Audits, asks compounding questions, or explains botanical lore.</li>
            <li><strong className="text-amber-300">24-Hour Canopy Walk:</strong> Intercepts simulated panic selling with guided reflection so no trees are chopped down impulsively.</li>
          </ul>
        </div>
      ),
    },
  ];

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finalizeOnboarding();
    }
  };

  const finalizeOnboarding = () => {
    if (chosenMode === 'blank') {
      onSelectBlankSoil();
    } else {
      onSelectDemoSoil();
    }
    onClose();
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-forest-950 border border-forest-600/50 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-forest-900 border border-forest-700/60 shadow-inner">
              {step.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-forest-800 text-sprout font-bold uppercase tracking-wider">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">{step.title}</h2>
              <p className="text-xs text-slate-400">{step.subtitle}</p>
            </div>
          </div>
          <button
            onClick={finalizeOnboarding}
            className="p-1 rounded-full bg-forest-900 hover:bg-forest-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Body */}
        <div className="py-2 min-h-[170px]">{step.content}</div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStep ? 'w-6 bg-sprout' : 'w-2 bg-forest-800'
              }`}
            />
          ))}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-forest-800/80">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-20 transition flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {currentStep === steps.length - 1 ? (
              <button
                onClick={finalizeOnboarding}
                className="px-5 py-2 bg-forest-500 hover:bg-forest-400 text-forest-950 font-bold rounded-xl text-xs transition shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {chosenMode === 'blank' ? 'Start Fresh ($0 Soil) 🌱' : 'Enter Demo Forest 🌲'}
                </span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-5 py-2 bg-forest-600 hover:bg-forest-500 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
