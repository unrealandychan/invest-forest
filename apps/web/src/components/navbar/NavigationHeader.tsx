import React, { useState, useRef, useEffect } from 'react';
import { PortfolioSummary, WeatherCondition, getBiomeTier } from '@invest-forest/core';
import { TimeOfDay } from '../canvas/CircadianSky';
import { soundscapeService } from '../../services/soundscapeService';
import {
  TreePine,
  LayoutDashboard,
  Sprout,
  Menu,
  X,
  Volume2,
  VolumeX,
  Sun,
  Wind,
  CloudRain,
  Snowflake,
  BookOpen,
  TrendingUp,
  Award,
  Scroll,
  Cloud,
  RotateCcw,
} from 'lucide-react';

interface NavigationHeaderProps {
  viewMode: 'forest' | 'terminal';
  onChangeViewMode: (mode: 'forest' | 'terminal') => void;
  summary: PortfolioSummary;
  weather: WeatherCondition;
  onCycleWeather: () => void;
  timeOfDay: TimeOfDay;
  onCycleTimeOfDay: () => void;
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
  onOpenDeposit: () => void;
  onOpenSync: () => void;
  onOpenAiSpirit: () => void;
  onOpenGuide: () => void;
  onOpenSimulation: () => void;
  onOpenDisciplineCard: () => void;
  onOpenSanctuaryDeed: () => void;
  onOpenReset: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  viewMode,
  onChangeViewMode,
  summary,
  weather,
  onCycleWeather,
  timeOfDay,
  onCycleTimeOfDay,
  onOpenDeposit,
  onOpenSync,
  onOpenAiSpirit,
  onOpenGuide,
  onOpenSimulation,
  onOpenDisciplineCard,
  onOpenSanctuaryDeed,
  onOpenReset,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(soundscapeService.getIsPlaying());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeBiome = getBiomeTier(summary.totalValue);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleToggleSoundscape = () => {
    const active = soundscapeService.toggleSoundscape();
    setIsPlayingAudio(active);
  };

  const weatherIcons: Record<WeatherCondition, React.ReactNode> = {
    sunny: <Sun className="w-3.5 h-3.5 text-sunlit" />,
    breeze: <Wind className="w-3.5 h-3.5 text-moss" />,
    rain: <CloudRain className="w-3.5 h-3.5 text-cyan-400" />,
    winter_snow: <Snowflake className="w-3.5 h-3.5 text-blue-200" />,
  };

  const timeOfDayIcons: Record<TimeOfDay, string> = {
    dawn: '🌅 Dawn',
    day: '☀️ Day',
    dusk: '🌇 Dusk',
    night: '🌙 Night',
  };

  return (
    <header className="h-16 px-4 md:px-6 bg-forest-950/90 backdrop-blur-md border-b border-forest-800/60 flex items-center justify-between shrink-0 select-none z-40 relative">
      {/* Left: Brand & Net Worth Pill */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-forest-800 border border-forest-600/50 flex items-center justify-center text-sprout shadow-sm">
            <TreePine className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>Invest Forest</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Patient Compounding
            </div>
          </div>
        </div>

        {/* Compact Net Worth & Biome Tier Pill */}
        <button
          onClick={onOpenSanctuaryDeed}
          title="Click to view Biome Sanctuary Deed"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-forest-900/60 hover:bg-forest-800 border border-forest-700/50 text-xs transition cursor-pointer"
        >
          <span className="text-sprout font-bold">
            T{activeBiome.tierNumber}: {activeBiome.name.replace('The ', '')}
          </span>
          <span className="text-slate-600">•</span>
          <span className="font-bold text-white font-mono">
            ${summary.totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
          <span className={`text-[11px] font-semibold ${summary.unrealizedGain >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            ({summary.unrealizedGain >= 0 ? '+' : ''}{summary.unrealizedGainPercent.toFixed(1)}%)
          </span>
        </button>
      </div>

      {/* Center: Clean Dual-View Switcher */}
      <div className="flex items-center bg-forest-900/90 p-1 rounded-2xl border border-forest-800/80 shadow-inner">
        <button
          onClick={() => onChangeViewMode('forest')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            viewMode === 'forest'
              ? 'bg-forest-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TreePine className="w-3.5 h-3.5" />
          <span>Forest</span>
        </button>

        <button
          onClick={() => onChangeViewMode('terminal')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            viewMode === 'terminal'
              ? 'bg-forest-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Terminal</span>
        </button>
      </div>

      {/* Right: Primary CTAs + Clean Tools Menu */}
      <div className="flex items-center gap-2.5">
        {/* Primary CTA: Plant / DCA */}
        <button
          onClick={onOpenDeposit}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-forest-500 hover:bg-forest-400 text-forest-950 rounded-xl text-xs font-bold transition shadow-md"
        >
          <Sprout className="w-4 h-4" />
          <span>Plant / DCA</span>
        </button>

        {/* AI Guide CTA */}
        <button
          onClick={onOpenAiSpirit}
          title="Consult Canopy Spirit Voice AI"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-800 to-teal-700 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl text-xs font-bold transition shadow-sm border border-emerald-500/30"
        >
          <span>🦉</span>
          <span className="hidden sm:inline">Canopy AI</span>
        </button>

        {/* Clean Tools & Settings Menu Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="Tools & Settings Menu"
            className={`p-2 rounded-xl border text-xs transition flex items-center justify-center ${
              isMenuOpen
                ? 'bg-forest-800 border-forest-600 text-white'
                : 'bg-forest-900/60 hover:bg-forest-800 border-forest-700/40 text-slate-300 hover:text-white'
            }`}
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Dropdown Popover */}
          {isMenuOpen && (
            <div className="absolute right-0 top-12 w-64 bg-forest-950/95 border border-forest-700/60 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 space-y-1 text-xs">
              {/* Category 1: Tools & Features */}
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Ecosystem Tools
              </div>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenGuide();
                }}
                className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-forest-900 text-slate-200 flex items-center gap-2.5 transition"
              >
                <BookOpen className="w-4 h-4 text-sprout" />
                <span>Onboarding Guide & Tutorial</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenSimulation();
                }}
                className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-forest-900 text-slate-200 flex items-center gap-2.5 transition"
              >
                <TrendingUp className="w-4 h-4 text-sunlit" />
                <span>Compounding Time Machine</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenDisciplineCard();
                }}
                className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-forest-900 text-slate-200 flex items-center gap-2.5 transition"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>Proof of Patience Card</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenSanctuaryDeed();
                }}
                className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-forest-900 text-slate-200 flex items-center gap-2.5 transition"
              >
                <Scroll className="w-4 h-4 text-yellow-300" />
                <span>Canopy Sanctuary Deed</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenSync();
                }}
                className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-forest-900 text-slate-200 flex items-center gap-2.5 transition"
              >
                <Cloud className="w-4 h-4 text-cyan-300" />
                <span>Cloud Sync & Backup</span>
              </button>

              {/* Category 2: Ambient Atmosphere Controls */}
              <div className="pt-1 border-t border-forest-800/80 mt-1">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Ambient Atmosphere
                </div>

                <div className="flex items-center justify-between px-2.5 py-1.5 hover:bg-forest-900 rounded-xl transition">
                  <div className="flex items-center gap-2 text-slate-300">
                    {isPlayingAudio ? <Volume2 className="w-3.5 h-3.5 text-sprout" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                    <span>Nature Audio:</span>
                  </div>
                  <button
                    onClick={handleToggleSoundscape}
                    className="text-[11px] font-semibold text-sprout hover:underline"
                  >
                    {isPlayingAudio ? 'Playing' : 'Muted'}
                  </button>
                </div>

                <div className="flex items-center justify-between px-2.5 py-1.5 hover:bg-forest-900 rounded-xl transition">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span>🌅</span>
                    <span>Time of Day:</span>
                  </div>
                  <button
                    onClick={onCycleTimeOfDay}
                    className="text-[11px] font-semibold text-slate-200 hover:text-white capitalize"
                  >
                    {timeOfDayIcons[timeOfDay]}
                  </button>
                </div>

                <div className="flex items-center justify-between px-2.5 py-1.5 hover:bg-forest-900 rounded-xl transition">
                  <div className="flex items-center gap-2 text-slate-300">
                    {weatherIcons[weather]}
                    <span>Market Weather:</span>
                  </div>
                  <button
                    onClick={onCycleWeather}
                    className="text-[11px] font-semibold text-slate-200 hover:text-white capitalize"
                  >
                    {weather.replace('_', ' ')}
                  </button>
                </div>
              </div>

              {/* Category 3: Data Management */}
              <div className="pt-1 border-t border-forest-800/80 mt-1">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenReset();
                  }}
                  className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-red-950/60 text-red-300 flex items-center gap-2.5 transition"
                >
                  <RotateCcw className="w-4 h-4 text-red-400" />
                  <span>Wipe Data & Reset Forest</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
