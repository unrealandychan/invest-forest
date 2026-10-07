import { describe, it, expect } from 'vitest';
import { simulateCompoundingGrowth, HISTORICAL_BACKTESTS } from '../src/finance/simulation';

describe('Long-Term Compounding Simulation & Backtesting', () => {
  it('correctly projects 20-year DCA compounding growth', () => {
    // $10,000 initial + $500/mo at 10% annual return for 20 years
    const res = simulateCompoundingGrowth(10000, 500, 20, 10.0, 2.5);

    expect(res.years).toBe(20);
    // Total deposited: 10,000 + 500*240 = 130,000
    expect(res.totalDeposited).toBe(130000);
    // Final nominal value should be over $350k
    expect(res.finalNominalValue).toBeGreaterThan(350000);
    expect(res.totalGain).toBeGreaterThan(200000);
    expect(res.yearlyPoints.length).toBe(20);
    expect(res.yearlyPoints[19].growthRings).toBe(20);
  });

  it('runs historical backtesting scenarios accurately', () => {
    const gfc = HISTORICAL_BACKTESTS.find((b) => b.id === 'gfc-2008');
    expect(gfc).toBeDefined();

    const outcome = gfc!.calculateOutcome(500, 5000, 15);
    expect(outcome.totalDeposited).toBe(5000 + 500 * 180);
    expect(outcome.finalValue).toBeGreaterThan(outcome.totalDeposited * 1.5);
  });
});
