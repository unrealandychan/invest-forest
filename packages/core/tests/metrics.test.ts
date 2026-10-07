import { describe, it, expect } from 'vitest';
import { calculatePortfolioSummary } from '../src/finance/metrics';
import { Holding, Transaction } from '../src/finance/types';

describe('Portfolio Metrics & Compounding Calculator', () => {
  it('correctly calculates total value, invested principal, and compounding multiplier', () => {
    const holdings: Holding[] = [
      {
        symbol: 'VOO',
        name: 'Vanguard S&P 500 ETF',
        assetClass: 'broad_market',
        shares: 10,
        costBasis: 4000,
        currentPrice: 500,
        firstPurchasedDate: '2023-01-01',
        lastPurchasedDate: '2023-01-01',
      },
      {
        symbol: 'BND',
        name: 'Vanguard Total Bond ETF',
        assetClass: 'bond',
        shares: 20,
        costBasis: 1500,
        currentPrice: 75,
        firstPurchasedDate: '2023-01-01',
        lastPurchasedDate: '2023-01-01',
      },
    ];
    const cash = 500;
    const transactions: Transaction[] = [
      { id: '1', date: '2023-01-01', type: 'deposit', assetClass: 'cash', amount: 6000 }
    ];

    const summary = calculatePortfolioSummary(holdings, cash, transactions, '2024-01-01');

    // Total value = 10*500 + 20*75 + 500 = 5000 + 1500 + 500 = 7000
    expect(summary.totalValue).toBe(7000);
    expect(summary.investedPrincipal).toBe(6000);
    expect(summary.unrealizedGain).toBe(1000);
    expect(summary.unrealizedGainPercent).toBeCloseTo(16.67, 1);
    expect(summary.compoundingMultiplier).toBeCloseTo(0.167, 2);
    expect(summary.dcaStreak).toBe(1);

    // Verify asset allocations
    const broadMarketAlloc = summary.assetAllocations.find(a => a.assetClass === 'broad_market');
    expect(broadMarketAlloc?.percentage).toBeCloseTo(71.4, 1); // 5000 / 7000
  });

  it('safely handles zero deposits or empty portfolio without NaN or division by zero', () => {
    const summary = calculatePortfolioSummary([], 0, []);
    expect(summary.totalValue).toBe(0);
    expect(summary.investedPrincipal).toBe(0);
    expect(summary.unrealizedGain).toBe(0);
    expect(summary.unrealizedGainPercent).toBe(0);
    expect(summary.compoundingMultiplier).toBe(0);
    expect(isNaN(summary.xirr)).toBe(false);
  });
});
