import React, { useState } from 'react';
import {
  TreePine,
  TrendingUp,
  LayoutDashboard,
  Footprints,
  Bot,
  ChevronRight,
  ChevronLeft,
  X,
  Sprout
} from 'lucide-react';

interface OnboardingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeposit: () => void;
  onOpenAiSpirit: () => void;
}

export const OnboardingGuideModal: React.FC<OnboardingGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenDeposit,
  onOpenAiSpirit,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to Invest Forest 🌲',
      subtitle: 'Gamifying Patient Compounding & Long-Term Discipline',
      icon: <TreePine className="w-8 h-8 text-sprout" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p className="text-sm font-semibold text-white">
            Most financial apps treat you like a gambler in a casino: flashing sirens, red panic alarms, and lottery tickets.
          </p>
          <p>
            <strong className="text-sprout">Invest Forest</strong> is different. We reframe your wealth accumulation from anxiety into a living, organic woodland.
          </p>
          <div className="p-3 bg-forest-900/60 border border-forest-700/50 rounded-2xl italic text-[11px] text-amber-200">
            &ldquo;Old trees cannot be bought overnight. The single biggest driver of long-term wealth is buying income-producing assets consistently.&rdquo; — Nick Maggiulli
          </div>
        </div>
      ),
    },
    {
      title: 'The Dual-View Magic 🌲 ↔ 📊',
      subtitle: 'Tranquil 3D Forest + Institutional Terminal',
      icon: <LayoutDashboard className="w-8 h-8 text-moss" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>You have two synchronized ways to experience your portfolio:</p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-3 bg-forest-900/60 border border-forest-700/50 rounded-xl space-y-1">
              <strong className="text-sprout block">🌲 3D Forest Canvas</strong>
              <span>Interactive low-poly woodland where every asset is an organic species that grows taller and denser over time.</span>
            </div>
            <div className="p-3 bg-forest-900/60 border border-forest-700/50 rounded-xl space-y-1">
              <strong className="text-moss block">📊 Portfolio Terminal</strong>
              <span>Institutional metrics: True Newton-Raphson XIRR, compounding multipliers, and asset allocation breakdown.</span>
            </div>
          </div>
          <p className="text-slate-400">
            Toggle effortlessly between emotional calm and financial precision using the top center switcher!
          </p>
        </div>
      ),
    },
    {
      title: 'Concentric Annual Growth Rings 🪵',
      subtitle: 'Time in the Market > Timing the Market',
      icon: <TrendingUp className="w-8 h-8 text-sunlit" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Click on any tree to open the <strong className="text-white">Botanical Cross-Section Inspector</strong>.
          </p>
          <p>
            Trees don&apos;t just scale by dollar value. For every 365 days an asset remains rooted in your portfolio, a new <strong className="text-sprout">concentric growth ring</strong> is etched into the tree trunk.
          </p>
          <div className="p-3 bg-forest-900/60 border border-forest-700/50 rounded-2xl text-[11px] text-slate-300">
            A 5-year Broad Market Oak possesses deep timber density that speculative traders can never replicate.
          </div>
        </div>
      ),
    },
    {
      title: 'Market Weather & The Canopy Walk ❄️',
      subtitle: 'Anti-Panic Selling Behavioral Guardrails',
      icon: <Footprints className="w-8 h-8 text-amber-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            When the stock market drops 15% to 25%, Invest Forest doesn&apos;t flash alarming red sirens. Instead, gentle <strong className="text-blue-300">winter snowfall</strong> blankets the meadow.
          </p>
          <p>
            Winter snow signals <strong className="text-white">&ldquo;Discount Seedlings&rdquo;</strong>—the most lucrative moment for disciplined Dollar-Cost Averaging.
          </p>
          <div className="p-3 bg-amber-950/40 border border-amber-700/50 rounded-2xl text-[11px] text-amber-200">
            If you ever feel tempted to panic sell, the <strong className="text-white">24-Hour Canopy Walk</strong> guardrail prompts calm mindfulness before a single tree is chopped down.
          </div>
        </div>
      ),
    },
    {
      title: 'Meet the Canopy Spirit (AI Guide) 🦉',
      subtitle: 'Behavioral Financial Intelligence On Demand',
      icon: <Bot className="w-8 h-8 text-emerald-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            The <strong className="text-sprout">Canopy Spirit</strong> is your AI mentor, powered by the corpus of Morgan Housel (*The Psychology of Money*) and Jack Bogle.
          </p>
          <p>
            Ask it to audit your forest ecology, advise on asset allocation, interpret market squalls, or explain botanical lore for any ETF.
          </p>
          <p className="text-slate-400">
            It works 100% locally with zero-knowledge privacy—your financial balances never leave your machine unencrypted.
          </p>
          <div className="pt-1">
            <button
              onClick={() => {
                onClose();
                onOpenAiSpirit();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-sprout border border-forest-600/50 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Bot className="w-3.5 h-3.5 text-sunlit" />
              <span>Talk to Canopy Spirit Now 🦉</span>
            </button>
          </div>
        </div>
      ),
    },
  ];

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-forest-950 border border-forest-600/50 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative flex flex-col space-y-5">
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
            onClick={onClose}
            className="p-1 rounded-full bg-forest-900 hover:bg-forest-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Body */}
        <div className="py-2 min-h-[160px]">{step.content}</div>

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
                onClick={() => {
                  onClose();
                  onOpenDeposit();
                }}
                className="px-5 py-2 bg-forest-500 hover:bg-forest-400 text-forest-950 font-bold rounded-xl text-xs transition shadow-md flex items-center gap-1.5"
              >
                <Sprout className="w-4 h-4" />
                <span>Plant First Seedling 🌱</span>
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
