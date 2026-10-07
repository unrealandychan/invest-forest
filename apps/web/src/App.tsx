import React, { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './storage/db';
import {
  initializeDatabaseIfEmpty,
  loadPreset,
  getSetting,
  setSetting,
} from './storage/repository';
import {
  calculatePortfolioSummary,
  calculateForestWeather,
  WeatherCondition,
  Holding,
} from '@invest-forest/core';
import { useForestStore } from './store/useForestStore';
import { ForestScene } from './components/canvas/ForestScene';
import { PortfolioTerminal } from './components/dashboard/PortfolioTerminal';
import { NavigationHeader } from './components/navbar/NavigationHeader';
import { TreeInspectModal } from './components/modals/TreeInspectModal';
import { DepositModal } from './components/modals/DepositModal';
import { CoolingOffModal } from './components/modals/CoolingOffModal';
import { CloudSyncModal } from './components/modals/CloudSyncModal';
import { ForestSpiritChat } from './components/ai/ForestSpiritChat';
import { OnboardingGuideModal } from './components/modals/OnboardingGuideModal';
import { SimulationModal } from './components/modals/SimulationModal';
import { DisciplineCardModal } from './components/modals/DisciplineCardModal';
import { BrokerageImportModal } from './components/modals/BrokerageImportModal';
import { TimeOfDay } from './components/canvas/CircadianSky';
import { TimeMachineScrubber } from './components/canvas/TimeMachineScrubber';
import { Sparkles, Footprints, Shield, Bot } from 'lucide-react';
import { triggerHaptic, setupNativeLifecycle } from './services/capacitorBridge';

export const App: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    selectedHolding,
    setSelectedHolding,
    activePresetId,
    setActivePresetId,
    weather,
    setWeather,
    timeOfDay,
    setTimeOfDay,
    timeTravelYears,
    setTimeTravelYears,
    timeTravelMonthlyDCA,
    setTimeTravelMonthlyDCA,
    isDepositModalOpen,
    setDepositModalOpen,
    isCoolingOffModalOpen,
    setCoolingOffModalOpen,
    isSyncModalOpen,
    setSyncModalOpen,
    isAiSpiritOpen,
    setAiSpiritOpen,
  } = useForestStore();

  const [isGuideOpen, setIsGuideOpen] = React.useState(false);
  const [isSimulationOpen, setIsSimulationOpen] = React.useState(false);
  const [isDisciplineCardOpen, setIsDisciplineCardOpen] = React.useState(false);
  const [isBrokerageImportOpen, setIsBrokerageImportOpen] = React.useState(false);

  // Initialize IndexedDB on first run and wire native lifecycle
  useEffect(() => {
    initializeDatabaseIfEmpty().then(async () => {
      const seen = await getSetting<boolean>('hasSeenGuide', false);
      if (!seen) {
        setIsGuideOpen(true);
      }
    });
    const cleanup = setupNativeLifecycle();
    return cleanup;
  }, []);

  // Live queries from Dexie.js (reactive updates across all tabs and components)
  const holdings = useLiveQuery(() => db.holdings.toArray(), []) || [];
  const transactions = useLiveQuery(() => db.transactions.toArray(), []) || [];
  const cashBalance = useLiveQuery(async () => getSetting<number>('cashBalance', 1250), []) ?? 1250;

  // Calculate live portfolio metrics using pure TypeScript domain core
  const summary = calculatePortfolioSummary(holdings, cashBalance, transactions);

  // Automatically update weather based on portfolio drawdown unless manually toggled
  useEffect(() => {
    if (summary.totalValue > 0) {
      const autoWeather = calculateForestWeather(summary.unrealizedGainPercent);
      setWeather(autoWeather);
    }
  }, [summary.unrealizedGainPercent, summary.totalValue, setWeather]);

  const handleCycleWeather = () => {
    const cycle: WeatherCondition[] = ['sunny', 'breeze', 'rain', 'winter_snow'];
    const nextIdx = (cycle.indexOf(weather) + 1) % cycle.length;
    setWeather(cycle[nextIdx]);
  };

  const handleCycleTimeOfDay = () => {
    const cycle: TimeOfDay[] = ['dawn', 'day', 'dusk', 'night'];
    const nextIdx = (cycle.indexOf(timeOfDay) + 1) % cycle.length;
    setTimeOfDay(cycle[nextIdx]);
  };

  const handleSelectPreset = async (presetId: string) => {
    setActivePresetId(presetId);
    await loadPreset(presetId);
    setSelectedHolding(null);
  };

  const handleSelectBlankSoil = async () => {
    setActivePresetId('blank-soil');
    await loadPreset('blank-soil');
    setSelectedHolding(null);
  };

  const handleSelectDemoSoil = async () => {
    setActivePresetId('boglehead-dca');
    await loadPreset('boglehead-dca');
    setSelectedHolding(null);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-forest-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Navbar */}
      <NavigationHeader
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        summary={summary}
        weather={weather}
        onCycleWeather={handleCycleWeather}
        timeOfDay={timeOfDay}
        onCycleTimeOfDay={handleCycleTimeOfDay}
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        onOpenDeposit={() => setDepositModalOpen(true)}
        onOpenSync={() => setSyncModalOpen(true)}
        onOpenAiSpirit={() => setAiSpiritOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenSimulation={() => setIsSimulationOpen(true)}
        onOpenDisciplineCard={() => setIsDisciplineCardOpen(true)}
      />

      {/* Main Dual-View Content Area */}
      <main className="flex-1 relative w-full h-[calc(100vh-4rem)] overflow-hidden">
        {viewMode === 'forest' ? (
          <div className="relative w-full h-full">
            <ForestScene
              holdings={holdings}
              cashBalance={cashBalance}
              weather={weather}
              timeOfDay={timeOfDay}
              timeTravelYears={timeTravelYears}
              selectedHolding={selectedHolding}
              onSelectHolding={(h) => {
                if (h) triggerHaptic();
                setSelectedHolding(h);
              }}
              totalValue={summary.totalValue}
              dcaStreak={summary.dcaStreak}
            />

            {/* Time Machine Scrubber HUD (when scrubbing future years) */}
            {timeTravelYears > 0 && (
              <TimeMachineScrubber
                timeTravelYears={timeTravelYears}
                onChangeYears={setTimeTravelYears}
                monthlyDCA={timeTravelMonthlyDCA}
                onChangeMonthlyDCA={setTimeTravelMonthlyDCA}
                currentNetWorth={summary.totalValue}
                onReset={() => setTimeTravelYears(0)}
              />
            )}

            {/* Bottom Floating Forest HUD Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-forest-950/80 backdrop-blur-md border border-forest-700/50 px-4 py-2 rounded-2xl shadow-2xl z-30">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 pr-2 border-r border-forest-800">
                <Sparkles className="w-3.5 h-3.5 text-sunlit" />
                <span className="font-semibold">{summary.dcaStreak} Deposits</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-300 pr-2 border-r border-forest-800">
                <Shield className="w-3.5 h-3.5 text-moss" />
                <span>XIRR: {(summary.xirr * 100).toFixed(1)}%</span>
              </div>

              <button
                onClick={() => setCoolingOffModalOpen(true)}
                className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 transition font-medium"
              >
                <Footprints className="w-3.5 h-3.5 text-amber-400" />
                <span>Canopy Walk</span>
              </button>

              <button
                onClick={() => setAiSpiritOpen(true)}
                className="flex items-center gap-1.5 text-xs text-emerald-300 hover:text-emerald-200 transition font-medium pl-2 border-l border-forest-800"
              >
                <Bot className="w-3.5 h-3.5 text-sprout" />
                <span>Ask Spirit</span>
              </button>
            </div>

            {/* Helper Hint */}
            <div className="absolute top-4 left-4 bg-forest-950/70 backdrop-blur-md border border-forest-800/40 px-3 py-1.5 rounded-xl text-[11px] text-slate-400 pointer-events-none">
              🖱️ Drag to rotate canopy • Scroll to zoom • Click any tree to inspect rings
            </div>
          </div>
        ) : (
          <PortfolioTerminal
            summary={summary}
            holdings={holdings}
            transactions={transactions}
            onSelectHolding={(h: Holding) => setSelectedHolding(h)}
            onOpenDeposit={() => setDepositModalOpen(true)}
            onOpenPanicSell={() => setCoolingOffModalOpen(true)}
            onOpenAiSpirit={() => setAiSpiritOpen(true)}
            onOpenSimulation={() => setIsSimulationOpen(true)}
            onOpenDisciplineCard={() => setIsDisciplineCardOpen(true)}
            onOpenBrokerageImport={() => setIsBrokerageImportOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <TreeInspectModal
        holding={selectedHolding}
        onClose={() => setSelectedHolding(null)}
      />

      <DepositModal
        holdings={holdings}
        isOpen={isDepositModalOpen}
        onClose={() => setDepositModalOpen(false)}
      />

      <CoolingOffModal
        isOpen={isCoolingOffModalOpen}
        onClose={() => setCoolingOffModalOpen(false)}
      />

      <CloudSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setSyncModalOpen(false)}
      />

      <ForestSpiritChat
        summary={summary}
        holdings={holdings}
        weather={weather}
        isOpen={isAiSpiritOpen}
        onClose={() => setAiSpiritOpen(false)}
        onOpenDeposit={() => {
          setAiSpiritOpen(false);
          setDepositModalOpen(true);
        }}
        onOpenCoolingOff={() => {
          setAiSpiritOpen(false);
          setCoolingOffModalOpen(true);
        }}
      />

      <OnboardingGuideModal
        isOpen={isGuideOpen}
        onClose={() => {
          setIsGuideOpen(false);
          setSetting('hasSeenGuide', true);
        }}
        onOpenDeposit={() => {
          setIsGuideOpen(false);
          setSetting('hasSeenGuide', true);
          setDepositModalOpen(true);
        }}
        onOpenAiSpirit={() => {
          setIsGuideOpen(false);
          setSetting('hasSeenGuide', true);
          setAiSpiritOpen(true);
        }}
        onSelectBlankSoil={handleSelectBlankSoil}
        onSelectDemoSoil={handleSelectDemoSoil}
      />

      <SimulationModal
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        currentNetWorth={summary.totalValue}
        onStartTimeTravel={(years, monthlyDCA) => {
          setTimeTravelYears(years);
          setTimeTravelMonthlyDCA(monthlyDCA);
          setViewMode('forest');
        }}
      />

      <DisciplineCardModal
        isOpen={isDisciplineCardOpen}
        onClose={() => setIsDisciplineCardOpen(false)}
        holdings={holdings}
        transactions={transactions}
        summary={summary}
      />

      <BrokerageImportModal
        isOpen={isBrokerageImportOpen}
        onClose={() => setIsBrokerageImportOpen(false)}
      />
    </div>
  );
};
