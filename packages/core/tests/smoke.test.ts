import { describe, it, expect } from 'vitest';
import { calculatePortfolioSummary, SPECIES_CATALOG } from '../src';

describe('Core Domain Smoke Test', () => {
  it('loads species catalog correctly', () => {
    expect(SPECIES_CATALOG.broad_market.commonName).toBe('Ancient Oak');
    expect(SPECIES_CATALOG.dividend.fruitColor).toBe('#e63946');
  });

  it('computes basic portfolio summary', () => {
    const summary = calculatePortfolioSummary(
      [
        {
          symbol: 'VOO',
          name: 'Vanguard S&P 500 ETF',
          assetClass: 'broad_market',
          shares: 10,
          costBasis: 4000,
          currentPrice: 480,
          firstPurchasedDate: '2023-01-01',
          lastPurchasedDate: '2023-01-01',
        }
      ],
      500,
      [{ id: '1', date: '2023-01-01', type: 'deposit', assetClass: 'cash', amount: 4500 }]
    );
    expect(summary.totalValue).toBe(5300);
    expect(summary.investedPrincipal).toBe(4500);
    expect(summary.unrealizedGain).toBe(800);
  });
});
