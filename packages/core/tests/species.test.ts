import { describe, it, expect } from 'vitest';
import { calculateTreeMetrics, SPECIES_CATALOG } from '../src/ecosystem/species';
import { Holding } from '../src/finance/types';

describe('Botanical Species Mapping & Tree Metrics', () => {
  it('correctly maps Broad Market to Ancient Oak with annual growth rings', () => {
    const holding: Holding = {
      symbol: 'VOO',
      name: 'Vanguard S&P 500 ETF',
      assetClass: 'broad_market',
      shares: 20,
      costBasis: 6000,
      currentPrice: 480,
      firstPurchasedDate: '2021-01-01',
      lastPurchasedDate: '2023-01-01',
    };

    const metrics = calculateTreeMetrics(holding, '2024-01-01');

    expect(metrics.species.commonName).toBe('Ancient Oak');
    expect(metrics.holdingDurationYears).toBeCloseTo(3.0, 1);
    expect(metrics.growthRings).toBe(3);
    expect(metrics.height).toBeGreaterThan(1.5);
    expect(metrics.trunkRadius).toBeGreaterThan(0.2);
  });

  it('generates fruit blossoms for dividend trees', () => {
    const holding: Holding = {
      symbol: 'SCHD',
      name: 'Schwab US Dividend Equity ETF',
      assetClass: 'dividend',
      shares: 50,
      costBasis: 3500,
      currentPrice: 80,
      firstPurchasedDate: '2022-01-01',
      lastPurchasedDate: '2023-01-01',
    };

    const metrics = calculateTreeMetrics(holding, '2024-01-01');

    expect(metrics.species.commonName).toBe('Honey Apple Tree');
    expect(metrics.fruitCount).toBeGreaterThan(0);
  });
});
