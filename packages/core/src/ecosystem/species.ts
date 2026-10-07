import { AssetClass, Holding, Transaction } from '../finance/types';

export interface TreeSpeciesProfile {
  assetClass: AssetClass;
  commonName: string;
  botanicalName: string;
  trunkColor: string;
  foliageColor: string;
  fruitColor?: string;
  growthFactor: number;
  description: string;
}

export const SPECIES_CATALOG: Record<AssetClass, TreeSpeciesProfile> = {
  broad_market: {
    assetClass: 'broad_market',
    commonName: 'Ancient Oak',
    botanicalName: 'Quercus Indexus',
    trunkColor: '#5c4033',
    foliageColor: '#2d6a4f',
    growthFactor: 1.0,
    description: 'Resilient and steady anchor of the forest canopy, embodying total market compounding.'
  },
  dividend: {
    assetClass: 'dividend',
    commonName: 'Honey Apple Tree',
    botanicalName: 'Malus Compoundia',
    trunkColor: '#6d4c41',
    foliageColor: '#40916c',
    fruitColor: '#e63946',
    growthFactor: 0.9,
    description: 'Regularly blossoms with ripe harvest fruit, reinvesting seeds back into the soil.'
  },
  bond: {
    assetClass: 'bond',
    commonName: 'Silver Willow',
    botanicalName: 'Salix Stabilitus',
    trunkColor: '#78909c',
    foliageColor: '#74c69d',
    growthFactor: 0.7,
    description: 'Bends gracefully in harsh market winds, shielding delicate seedlings with steady yield.'
  },
  cash: {
    assetClass: 'cash',
    commonName: 'Forest Creek & Moss',
    botanicalName: 'Aqua Liquida',
    trunkColor: '#0077b6',
    foliageColor: '#52b788',
    growthFactor: 0.4,
    description: 'Liquid freshwater providing essential nourishment for opportunistic dry seasons.'
  },
  speculative: {
    assetClass: 'speculative',
    commonName: 'Wild Mushroom Colony',
    botanicalName: 'Fungus Volatilis',
    trunkColor: '#7209b7',
    foliageColor: '#f72585',
    growthFactor: 1.4,
    description: 'Sprouts overnight and wilts fast. Kept disciplined under 10% of total canopy.'
  }
};

export interface BotanicalTreeMetrics {
  holding: Holding;
  species: TreeSpeciesProfile;
  holdingDurationYears: number;
  growthRings: number;
  resilienceRings: number;
  frostFlowerCount: number;
  totalRings: number;
  isWinterBloom: boolean;
  height: number;
  trunkRadius: number;
  foliageRadius: number;
  fruitCount: number;
  healthMultiplier: number;
}

export function calculateTreeMetrics(
  holding: Holding,
  asOfDateStr: string = new Date().toISOString().slice(0, 10),
  transactions?: Transaction[]
): BotanicalTreeMetrics {
  const species = SPECIES_CATALOG[holding.assetClass] || SPECIES_CATALOG.broad_market;
  const asOf = new Date(asOfDateStr).getTime();
  const firstBuy = new Date(holding.firstPurchasedDate).getTime();
  const diffDays = Math.max(1, (asOf - firstBuy) / (1000 * 60 * 60 * 24));
  const holdingDurationYears = Math.max(0.1, diffDays / 365.25);

  // Growth rings correspond to rounded holding duration in annual cycles
  const growthRings = Math.max(1, Math.round(holdingDurationYears));

  // Current holding valuation
  const holdingValue = Math.max(0, holding.shares * holding.currentPrice);
  const costBasis = Math.max(1, holding.costBasis);
  const gainMultiplier = (holdingValue - costBasis) / costBasis;

  // Trunk radius scales with invested capital log-curve
  const trunkRadius = Math.max(0.15, Math.min(0.65, 0.15 + 0.08 * Math.log10(1 + holdingValue / 500)));

  // Height scales with holding duration and gain
  const baseHeight = 1.2 + Math.min(3.0, holdingDurationYears * 0.4);
  const gainBonus = gainMultiplier > 0 ? Math.min(2.0, gainMultiplier * 1.2) : 0;
  const height = Math.max(1.0, (baseHeight + gainBonus) * species.growthFactor);

  // Foliage radius scales with tree size
  const foliageRadius = Math.max(0.6, trunkRadius * 3.5 + (height * 0.25));

  // Fruit count for dividend trees or mature trees
  let fruitCount = 0;
  if (holding.assetClass === 'dividend') {
    fruitCount = Math.min(18, Math.max(2, Math.floor(growthRings * 2.5 + holdingValue / 2000)));
  }

  // Health multiplier: 1.0 is healthy; reduced in severe unrealized loss
  const healthMultiplier = gainMultiplier < -0.3 ? 0.6 : gainMultiplier < 0 ? 0.85 : 1.1;

  // Winter Bloom & Resilience rings from >10% drawdown purchases
  const drawdownBuys = transactions
    ? transactions.filter(
        (t) =>
          t.symbol === holding.symbol &&
          (t.isWinterBloom || (t.drawdownAtPurchase !== undefined && t.drawdownAtPurchase >= 10))
      )
    : [];

  const hasDrawdownHolding = gainMultiplier <= -0.10;
  const isWinterBloom = drawdownBuys.length > 0 || hasDrawdownHolding;
  const frostFlowerCount = isWinterBloom ? Math.max(4, Math.max(1, drawdownBuys.length) * 4) : 0;
  const resilienceRings = isWinterBloom ? Math.max(1, Math.min(4, drawdownBuys.length || Math.floor(growthRings * 0.5))) : 0;
  const totalRings = growthRings + resilienceRings;

  return {
    holding,
    species,
    holdingDurationYears: Math.round(holdingDurationYears * 10) / 10,
    growthRings,
    resilienceRings,
    frostFlowerCount,
    totalRings,
    isWinterBloom,
    height: Math.round(height * 100) / 100,
    trunkRadius: Math.round(trunkRadius * 100) / 100,
    foliageRadius: Math.round(foliageRadius * 100) / 100,
    fruitCount,
    healthMultiplier,
  };
}
