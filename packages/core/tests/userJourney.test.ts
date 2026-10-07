import { describe, it, expect } from 'vitest';
import {
  calculatePortfolioSummary,
  calculateTreeMetrics,
  simulateCompoundingGrowth,
  getBiomeTier,
  generateDisciplineCardData,
  generateSanctuaryDeedSvg,
  Holding,
  Transaction,
} from '../src';

describe('End-to-End User Journey Verification', () => {
  it('simulates the complete user lifecycle from Clean Soil to Ancient Pangaea', () => {
    // 1. Step 1: User starts with Clean Soil ($0)
    let holdings: Holding[] = [];
    let transactions: Transaction[] = [];
    let cashBalance = 0;

    let summary = calculatePortfolioSummary(holdings, cashBalance, transactions);
    expect(summary.totalValue).toBe(0);
    expect(summary.investedPrincipal).toBe(0);
    expect(summary.dcaStreak).toBe(0);
    expect(getBiomeTier(summary.totalValue).id).toBe('glade'); // Tier 1

    // 2. Step 2: First disciplined DCA buy into VOO ($500)
    const tx1: Transaction = {
      id: 'tx-1',
      date: '2023-01-01',
      type: 'buy',
      symbol: 'VOO',
      assetClass: 'broad_market',
      shares: 1.0,
      price: 500,
      amount: 500,
    };
    transactions.push(tx1);
    holdings.push({
      symbol: 'VOO',
      name: 'Vanguard S&P 500 ETF',
      assetClass: 'broad_market',
      shares: 1.0,
      costBasis: 500,
      currentPrice: 500,
      firstPurchasedDate: '2023-01-01',
      lastPurchasedDate: '2023-01-01',
    });

    summary = calculatePortfolioSummary(holdings, cashBalance, transactions, '2023-01-01');
    expect(summary.totalValue).toBe(500);
    expect(summary.investedPrincipal).toBe(500);
    expect(summary.dcaStreak).toBe(1);

    // 3. Step 3: Winter bloodbath (-20% drawdown) and opportunistic discount seedling purchase
    holdings[0].currentPrice = 400; // temporary market drop
    const txDiscount: Transaction = {
      id: 'tx-discount',
      date: '2023-06-15',
      type: 'buy',
      symbol: 'VOO',
      assetClass: 'broad_market',
      shares: 1.25,
      price: 400,
      amount: 500,
      isWinterBloom: true,
      drawdownAtPurchase: 20,
    };
    transactions.push(txDiscount);
    holdings[0].shares += 1.25;
    holdings[0].costBasis += 500;
    holdings[0].lastPurchasedDate = '2023-06-15';

    const treeMetrics = calculateTreeMetrics(holdings[0], '2024-01-01', transactions);
    expect(treeMetrics.isWinterBloom).toBe(true);
    expect(treeMetrics.frostFlowerCount).toBeGreaterThanOrEqual(4);
    expect(treeMetrics.resilienceRings).toBeGreaterThanOrEqual(1);

    // 4. Step 4: Compounding recovery through Year 2026
    holdings[0].currentPrice = 550; // Total value = 2.25 * 550 = 1237.5
    summary = calculatePortfolioSummary(holdings, cashBalance, transactions, '2026-01-01');
    expect(summary.totalValue).toBe(1237.5);
    expect(summary.investedPrincipal).toBe(1000);
    expect(summary.unrealizedGain).toBe(237.5);
    expect(summary.unrealizedGainPercent).toBeCloseTo(23.75, 1);
    expect(summary.xirr).toBeGreaterThan(0.05);

    // 5. Step 5: Proof of Patience Discipline Card generation
    const cardData = generateDisciplineCardData(holdings, transactions, summary);
    expect(cardData.concentricRings).toBeGreaterThanOrEqual(3);
    expect(cardData.dcaStreak).toBe(2);
    expect(cardData.oldestSpeciesName).toBe('Ancient Oak');

    // 6. Step 6: Future Canopy Time Machine projection (+20 Years)
    const sim = simulateCompoundingGrowth(summary.totalValue, 500, 20, 10.0);
    expect(sim.finalNominalValue).toBeGreaterThan(300000);
    expect(sim.yearlyPoints[19].growthRings).toBe(20);

    // 7. Step 7: Ascension to Tier 3 Sanctuary and Deed generation
    const tier3 = getBiomeTier(65000);
    expect(tier3.id).toBe('redwood');
    expect(tier3.hasWaterfall).toBe(true);
    const deedSvg = generateSanctuaryDeedSvg(tier3, 'Disciplined Cultivator', 65000);
    expect(deedSvg).toContain('CANOPY SANCTUARY DEED');
    expect(deedSvg).toContain('The Ancient Redwood Sanctuary');
  });
});
