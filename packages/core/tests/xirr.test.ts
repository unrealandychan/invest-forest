import { describe, it, expect } from 'vitest';
import { calculateXIRR } from '../src/finance/xirr';
import { Transaction } from '../src/finance/types';

describe('Newton-Raphson XIRR Solver with Fallbacks', () => {
  it('returns 0 when fewer than 2 valid cash flows exist', () => {
    const txs: Transaction[] = [
      { id: '1', date: '2023-01-01', type: 'deposit', assetClass: 'cash', amount: 1000 }
    ];
    // With 0 terminal value and only 1 deposit -> not enough flows
    expect(calculateXIRR(txs, 0, '2023-01-01')).toBe(0);
  });

  it('calculates accurate ~10% annual return for a 1-year holding', () => {
    const txs: Transaction[] = [
      { id: '1', date: '2023-01-01', type: 'deposit', assetClass: 'cash', amount: 1000 }
    ];
    // 1000 invested on 2023-01-01, worth 1100 on 2024-01-01 (exact 10% return)
    const rate = calculateXIRR(txs, 1100, '2024-01-01');
    expect(rate).toBeCloseTo(0.10, 2);
  });

  it('calculates multi-year compounded return accurately', () => {
    const txs: Transaction[] = [
      { id: '1', date: '2020-01-01', type: 'deposit', assetClass: 'cash', amount: 10000 }
    ];
    // Doubled in ~3 years: (1 + r)^3 = 2 -> r approx 25.99%
    const rate = calculateXIRR(txs, 20000, '2023-01-01');
    expect(rate).toBeCloseTo(0.26, 2);
  });

  it('handles negative returns (bear market drawdown) without crashing', () => {
    const txs: Transaction[] = [
      { id: '1', date: '2022-01-01', type: 'deposit', assetClass: 'cash', amount: 10000 }
    ];
    // 30% drawdown over 1 year: 10,000 -> 7,000
    const rate = calculateXIRR(txs, 7000, '2023-01-01');
    expect(rate).toBeCloseTo(-0.30, 2);
  });

  it('converges properly with disciplined regular monthly DCA schedule', () => {
    const txs: Transaction[] = [
      { id: '1', date: '2023-01-01', type: 'deposit', assetClass: 'cash', amount: 500 },
      { id: '2', date: '2023-02-01', type: 'deposit', assetClass: 'cash', amount: 500 },
      { id: '3', date: '2023-03-01', type: 'deposit', assetClass: 'cash', amount: 500 },
      { id: '4', date: '2023-04-01', type: 'deposit', assetClass: 'cash', amount: 500 },
      { id: '5', date: '2023-05-01', type: 'deposit', assetClass: 'cash', amount: 500 },
      { id: '6', date: '2023-06-01', type: 'deposit', assetClass: 'cash', amount: 500 },
    ];
    // Total deposits: 3000. Terminal value on 2023-07-01: 3200
    const rate = calculateXIRR(txs, 3200, '2023-07-01');
    expect(rate).toBeGreaterThan(0.1);
    expect(rate).toBeLessThan(0.4);
  });

  it('handles extreme edge case where initial guess might oscillate or diverge', () => {
    // Large outflow early followed by smaller recovery
    const txs: Transaction[] = [
      { id: '1', date: '2021-01-01', type: 'deposit', assetClass: 'cash', amount: 50000 },
      { id: '2', date: '2021-06-01', type: 'withdrawal', assetClass: 'cash', amount: 48000 },
      { id: '3', date: '2022-01-01', type: 'deposit', assetClass: 'cash', amount: 1000 },
    ];
    const rate = calculateXIRR(txs, 4000, '2023-01-01');
    expect(typeof rate).toBe('number');
    expect(isNaN(rate)).toBe(false);
  });
});
