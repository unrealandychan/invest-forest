import React from 'react';
import { DEMO_PRESETS, PortfolioSummary, WeatherCondition } from '@invest-forest/core';
import {
  TreePine,
  LayoutDashboard,
  Sun,
  Wind,
  CloudRain,
  Snowflake,
  Sprout,
  Cloud,
  ChevronDown
} from 'lucide-react';

interface NavigationHeaderProps {
  viewMode: 'forest' | 'terminal';
  onChangeViewMode: (mode: 'forest' | 'terminal') => void;
  summary: PortfolioSummary;
  weather: WeatherCondition;
  onCycleWeather: () => void;
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
  onOpenDeposit: () => void;
  onOpenSync: () => void;
  onOpenAiSpirit: () => void;
  onOpenGuide: () => void;
  onOpenSimulation: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  viewMode,
  onChangeViewMode,
  summary,
  weather,
  onCycleWeather,
  activePresetId,
  onSelectPreset,
  onOpenDeposit,
  onOpenSync,
  onOpenAiSpirit,
  onOpenGuide,
  onOpenSimulation,
}) => {
  const weatherIcons: Record<WeatherCondition, React.ReactNode> = {
    sunny: <Sun className="w-3.5 h-3.5 text-sunlit" />,
    breeze: <Wind className="w-3.5 h-3.5 text-moss" />,
    rain: <CloudRain className="w-3.5 h-3.5 text-cyan-400" />,
    winter_snow: <Snowflake className="w-3.5 h-3.5 text-blue-200" />,
  };

  const weatherLabels: Record<WeatherCondition, string> = {
    sunny: 'Sunny Canopy',
    breeze: 'Autumn Breeze',
    rain: 'Soil Rain',
    winter_snow: 'Winter Snow (Bear Market)',
  };

  return (
    <header className="h-16 px-4 md:px-6 bg-forest-950/85 backdrop-blur-md border-b border-forest-800/60 flex items-center justify-between shrink-0 select-none z-40">
      {/* Brand & Net Worth */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-forest-800 border border-forest-600/50 flex items-center justify-center text-sprout shadow-sm">
            <TreePine className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
              <span>Invest Forest</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-forest-800 text-sprout border border-forest-600/30">
                MVP
              </span>
            </div>
            <div className="text-[10px] text-slate-400 hidden sm:block">
              Gamified Patient Compounding
            </div>
          </div>
        </div>

        {/* Net Worth Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-forest-900/60 border border-forest-700/40 text-xs">
          <span className="text-slate-400">Canopy:</span>
          <span className="font-bold text-white font-mono">
            ${summary.totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
          <span className={`text-[11px] font-semibold ${summary.unrealizedGain >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            ({summary.unrealizedGain >= 0 ? '+' : ''}{summary.unrealizedGainPercent.toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Center Dual-View Switcher */}
      <div className="flex items-center bg-forest-900 p-1 rounded-2xl border border-forest-800 shadow-inner">
        <button
          onClick={() => onChangeViewMode('forest')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            viewMode === 'forest'
              ? 'bg-forest-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TreePine className="w-3.5 h-3.5" />
          <span>3D Forest</span>
        </button>

        <button
          onClick={() => onChangeViewMode('terminal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            viewMode === 'terminal'
              ? 'bg-forest-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Terminal</span>
        </button>
      </div>

      {/* Right Controls: Weather Cycle, Scenario Switcher, Plant & Sync */}
      <div className="flex items-center gap-2">
        {/* Weather Simulator Button */}
        <button
          onClick={onCycleWeather}
          title="Cycle Simulated Market Weather"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-forest-900/60 hover:bg-forest-800 border border-forest-700/40 text-xs text-slate-300 transition"
        >
          {weatherIcons[weather]}
          <span className="hidden xl:inline text-[11px] font-medium">{weatherLabels[weather]}</span>
        </button>

        {/* Preset Scenarios Dropdown */}
        <div className="relative hidden md:block">
          <select
            value={activePresetId}
            onChange={(e) => onSelectPreset(e.target.value)}
            className="appearance-none bg-forest-900/60 hover:bg-forest-800 border border-forest-700/40 text-xs text-slate-200 rounded-xl px-2.5 py-1.5 pr-7 font-medium focus:outline-none cursor-pointer"
          >
            {DEMO_PRESETS.map((p) => (
              <option key={p.id} value={p.id} className="bg-forest-950 text-white">
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
        </div>

        {/* Guide / Tutorial Button */}
        <button
          onClick={onOpenGuide}
          title="Onboarding Guide & Tutorial"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-forest-900/60 hover:bg-forest-800 border border-forest-700/40 text-xs text-slate-300 hover:text-white transition"
        >
          <span>📖</span>
          <span className="hidden md:inline font-medium">Guide</span>
        </button>

        {/* Long-Term Compounding Simulator Button */}
        <button
          onClick={onOpenSimulation}
          title="Long-Term Compounding Simulation & Backtesting"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-forest-900/60 hover:bg-forest-800 border border-forest-700/40 text-xs text-slate-300 hover:text-white transition"
        >
          <span>⏳</span>
          <span className="hidden md:inline font-medium">Simulator</span>
        </button>

        {/* AI Forest Spirit CTA */}
        <button
          onClick={onOpenAiSpirit}
          title="Consult AI Forest Spirit"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition shadow-md border border-emerald-400/30"
        >
          <span className="text-sm">🦉</span>
          <span className="hidden sm:inline">Canopy AI</span>
        </button>

        {/* Deposit / Plant CTA */}
        <button
          onClick={onOpenDeposit}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-forest-500 hover:bg-forest-400 text-forest-950 rounded-xl text-xs font-bold transition shadow-md"
        >
          <Sprout className="w-3.5 h-3.5" />
          <span>Plant / DCA</span>
        </button>

        {/* Cloud Sync Drawer Button */}
        <button
          onClick={onOpenSync}
          title="Hybrid Cloud Sync & Backups"
          className="p-1.5 rounded-xl bg-forest-900/60 hover:bg-forest-800 border border-forest-700/40 text-slate-300 transition"
        >
          <Cloud className="w-4 h-4 text-sprout" />
        </button>
      </div>
    </header>
  );
};
