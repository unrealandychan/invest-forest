import { create } from 'zustand';
import { Holding, WeatherCondition } from '@invest-forest/core';

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

interface ForestState {
  viewMode: 'forest' | 'terminal';
  selectedHolding: Holding | null;
  activePresetId: string;
  weather: WeatherCondition;
  timeOfDay: TimeOfDay;
  timeTravelYears: number;
  timeTravelMonthlyDCA: number;
  isDepositModalOpen: boolean;
  isCoolingOffModalOpen: boolean;
  isSyncModalOpen: boolean;
  isAiSpiritOpen: boolean;

  setViewMode: (mode: 'forest' | 'terminal') => void;
  setSelectedHolding: (holding: Holding | null) => void;
  setActivePresetId: (id: string) => void;
  setWeather: (weather: WeatherCondition) => void;
  setTimeOfDay: (time: TimeOfDay) => void;
  setTimeTravelYears: (years: number) => void;
  setTimeTravelMonthlyDCA: (amount: number) => void;
  setDepositModalOpen: (open: boolean) => void;
  setCoolingOffModalOpen: (open: boolean) => void;
  setSyncModalOpen: (open: boolean) => void;
  setAiSpiritOpen: (open: boolean) => void;
}

export const useForestStore = create<ForestState>((set) => ({
  viewMode: 'forest',
  selectedHolding: null,
  activePresetId: 'boglehead-dca',
  weather: 'sunny',
  timeOfDay: 'day',
  timeTravelYears: 0,
  timeTravelMonthlyDCA: 500,
  isDepositModalOpen: false,
  isCoolingOffModalOpen: false,
  isSyncModalOpen: false,
  isAiSpiritOpen: false,

  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedHolding: (holding) => set({ selectedHolding: holding }),
  setActivePresetId: (id) => set({ activePresetId: id }),
  setWeather: (weather) => set({ weather }),
  setTimeOfDay: (time) => set({ timeOfDay: time }),
  setTimeTravelYears: (years) => set({ timeTravelYears: years }),
  setTimeTravelMonthlyDCA: (amount) => set({ timeTravelMonthlyDCA: amount }),
  setDepositModalOpen: (open) => set({ isDepositModalOpen: open }),
  setCoolingOffModalOpen: (open) => set({ isCoolingOffModalOpen: open }),
  setSyncModalOpen: (open) => set({ isSyncModalOpen: open }),
  setAiSpiritOpen: (open) => set({ isAiSpiritOpen: open }),
}));
