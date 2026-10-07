import { AssetAllocationItem, AssetClass, Holding, PortfolioSummary, Transaction } from './types';
import { calculateXIRR } from './xirr';

const DEFAULT_TARGETS: Record<AssetClass, number> = {
  broad_market: 60,
  dividend: 15,
  bond: 15,
  cash: 10,
  speculative: 0,
};

export function calculatePortfolioSummary(
  holdings: Holding[],
  cashBalance: number,
  transactions: Transaction[],
  asOfDate: string = new Date().toISOString().slice(0, 10)
): PortfolioSummary {
  // 1. Calculate holding values and asset class breakdowns
  const classValues: Record<AssetClass, number> = {
    broad_market: 0,
    dividend: 0,
    bond: 0,
    cash: Math.max(0, cashBalance),
    speculative: 0,
  };

  let totalHoldingsValue = 0;
  for (const h of holdings) {
    const value = Math.max(0, h.shares * h.currentPrice);
    totalHoldingsValue += value;
    if (classValues[h.assetClass] !== undefined) {
      classValues[h.assetClass] += value;
    } else {
      classValues.broad_market += value;
    }
  }

  const totalValue = totalHoldingsValue + Math.max(0, cashBalance);

  // 2. Net invested principal from deposits, purchases, and withdrawals
  const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const depositDates = new Set<string>();

  let totalDeposited = 0;
  let totalWithdrawn = 0;
  let totalDirectBuys = 0;

  for (const tx of sortedTx) {
    if (tx.type === 'deposit') {
      totalDeposited += tx.amount;
      depositDates.add(tx.date);
    } else if (tx.type === 'withdrawal') {
      totalWithdrawn += tx.amount;
    } else if (tx.type === 'buy') {
      totalDirectBuys += tx.amount;
      depositDates.add(tx.date);
    }
  }

  // Total invested principal accounts for deposits and direct buys
  const netInvested = Math.max(totalDeposited - totalWithdrawn, totalDirectBuys);
  const investedPrincipal = Math.max(netInvested, 0);

  const unrealizedGain = totalValue - investedPrincipal;
  const denominator = investedPrincipal > 0 ? investedPrincipal : 1;
  const unrealizedGainPercent = investedPrincipal > 0 ? (unrealizedGain / denominator) * 100 : 0;
  const compoundingMultiplier = investedPrincipal > 0 ? unrealizedGain / denominator : 0;

  // 3. XIRR
  const xirr = calculateXIRR(sortedTx, totalValue, asOfDate);

  // 4. Asset Allocations
  const assetAllocations: AssetAllocationItem[] = (
    ['broad_market', 'dividend', 'bond', 'cash', 'speculative'] as AssetClass[]
  ).map((ac) => {
    const val = classValues[ac] || 0;
    const pct = totalValue > 0 ? (val / totalValue) * 100 : 0;
    return {
      assetClass: ac,
      value: Math.round(val * 100) / 100,
      percentage: Math.round(pct * 10) / 10,
      targetPercentage: DEFAULT_TARGETS[ac] || 0,
    };
  });

  // 5. DCA Streak (count distinct disciplined deposit / buy milestones)
  const dcaStreak = depositDates.size;

  // 6. Drawdown estimate (if gain is negative)
  const maxDrawdownPercent = unrealizedGainPercent < 0 ? Math.abs(unrealizedGainPercent) : 0;

  return {
    totalValue: Math.round(totalValue * 100) / 100,
    investedPrincipal: Math.round(investedPrincipal * 100) / 100,
    unrealizedGain: Math.round(unrealizedGain * 100) / 100,
    unrealizedGainPercent: Math.round(unrealizedGainPercent * 100) / 100,
    xirr: Math.round(xirr * 10000) / 10000,
    compoundingMultiplier: Math.round(compoundingMultiplier * 1000) / 1000,
    cashBalance: Math.round(cashBalance * 100) / 100,
    dcaStreak,
    assetAllocations,
    maxDrawdownPercent: Math.round(maxDrawdownPercent * 10) / 10,
  };
}
