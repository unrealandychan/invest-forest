import { create } from 'zustand';
import { Holding, WeatherCondition } from '@invest-forest/core';

interface ForestState {
  viewMode: 'forest' | 'terminal';
  selectedHolding: Holding | null;
  activePresetId: string;
  weather: WeatherCondition;
  isDepositModalOpen: boolean;
  isCoolingOffModalOpen: boolean;
  isSyncModalOpen: boolean;
  isAiSpiritOpen: boolean;

  setViewMode: (mode: 'forest' | 'terminal') => void;
  setSelectedHolding: (holding: Holding | null) => void;
  setActivePresetId: (id: string) => void;
  setWeather: (weather: WeatherCondition) => void;
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
  isDepositModalOpen: false,
  isCoolingOffModalOpen: false,
  isSyncModalOpen: false,
  isAiSpiritOpen: false,

  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedHolding: (holding) => set({ selectedHolding: holding }),
  setActivePresetId: (id) => set({ activePresetId: id }),
  setWeather: (weather) => set({ weather }),
  setDepositModalOpen: (open) => set({ isDepositModalOpen: open }),
  setCoolingOffModalOpen: (open) => set({ isCoolingOffModalOpen: open }),
  setSyncModalOpen: (open) => set({ isSyncModalOpen: open }),
  setAiSpiritOpen: (open) => set({ isAiSpiritOpen: open }),
}));
