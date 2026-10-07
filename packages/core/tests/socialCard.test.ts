import { describe, it, expect } from 'vitest';
import { generateDisciplineCardData, renderDisciplineCardSvg } from '../src/ecosystem/socialCard';
import { Holding, PortfolioSummary } from '../src/finance/types';

describe('Zero-Knowledge Social Discipline Card', () => {
  const dummyHoldings: Holding[] = [
    {
      symbol: 'VOO',
      name: 'Vanguard S&P 500 ETF',
      assetClass: 'broad_market',
      shares: 50,
      costBasis: 20000,
      currentPrice: 480,
      firstPurchasedDate: '2020-01-01',
      lastPurchasedDate: '2024-01-01',
    },
  ];

  const dummySummary: PortfolioSummary = {
    totalValue: 24000,
    investedPrincipal: 20000,
    unrealizedGain: 4000,
    unrealizedGainPercent: 20,
    xirr: 0.12,
    compoundingMultiplier: 0.2,
    cashBalance: 1000,
    dcaStreak: 12,
    assetAllocations: [],
    maxDrawdownPercent: 0,
  };

  it('generates zero-knowledge discipline card data without dollar balances', () => {
    const data = generateDisciplineCardData(dummyHoldings, [], dummySummary, 'emerald');

    expect(data.concentricRings).toBeGreaterThanOrEqual(4);
    expect(data.dcaStreak).toBe(12);
    expect(data.oldestSpeciesName).toBe('Ancient Oak');
    expect(data.growerTitle).toContain('Oak Cultivator');
  });

  it('renders valid SVG containing rings and title without leaking sensitive balances', () => {
    const data = generateDisciplineCardData(dummyHoldings, [], dummySummary, 'emerald');
    const svg = renderDisciplineCardSvg(data);

    expect(svg).toContain('<svg');
    expect(svg).toContain('INVEST FOREST • PROOF OF PATIENCE');
    expect(svg).toContain('ANNUAL GROWTH RINGS');
    expect(svg).toContain('DISCIPLINED DCA CADENCE');
    // Ensure no raw dollar amounts are rendered in the card
    expect(svg).not.toContain('$24,000');
    expect(svg).not.toContain('$20,000');
  });
});
