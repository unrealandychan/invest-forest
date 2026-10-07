export type AssetClass = 'broad_market' | 'dividend' | 'bond' | 'cash' | 'speculative';

export type TransactionType = 'deposit' | 'withdrawal' | 'buy' | 'sell' | 'dividend';

export interface Transaction {
  id: string;
  date: string; // ISO YYYY-MM-DD
  type: TransactionType;
  symbol?: string;
  assetClass: AssetClass;
  shares?: number;
  price?: number;
  amount: number; // Positive magnitude of transaction
  note?: string;
  isWinterBloom?: boolean;
  drawdownAtPurchase?: number; // e.g. 15 for 15% drawdown at purchase
}

export interface Holding {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  shares: number;
  costBasis: number;
  currentPrice: number;
  firstPurchasedDate: string;
  lastPurchasedDate: string;
}

export interface AssetAllocationItem {
  assetClass: AssetClass;
  value: number;
  percentage: number; // 0 to 100
  targetPercentage: number;
}

export interface PortfolioSummary {
  totalValue: number;
  investedPrincipal: number;
  unrealizedGain: number;
  unrealizedGainPercent: number;
  xirr: number;
  compoundingMultiplier: number;
  cashBalance: number;
  dcaStreak: number;
  assetAllocations: AssetAllocationItem[];
  maxDrawdownPercent: number;
}

export interface HarvestMemorial {
  id: string;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  harvestedDate: string;
  harvestedAmount: number;
  harvestedShares: number;
  yearsInSoil: number;
  reason: string;
  position?: [number, number, number];
}

export interface PresetScenario {
  id: string;
  name: string;
  description: string;
  holdings: Holding[];
  transactions: Transaction[];
  cashBalance: number;
}
