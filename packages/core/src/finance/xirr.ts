import { Transaction } from './types';

export interface CashFlow {
  date: Date;
  amount: number; // Inflows (deposits) are negative; terminal value & outflows are positive
}

/**
 * Calculates Internal Rate of Return (XIRR) using Newton-Raphson with Bisection / Brent fallback.
 * Follows standard financial convention:
 * - Deposits/investments = negative cash flows (cash outgoing from investor)
 * - Withdrawals/dividends taken out = positive cash flows (cash incoming to investor)
 * - Current portfolio terminal value = positive cash flow at evaluation date
 */
export function calculateXIRR(
  transactions: Transaction[],
  terminalValue: number,
  asOfDateStr: string = new Date().toISOString().slice(0, 10)
): number {
  const asOfDate = new Date(asOfDateStr);
  const flows: CashFlow[] = [];

  const hasDeposits = transactions.some((t) => t.type === 'deposit');

  for (const tx of transactions) {
    const txDate = new Date(tx.date);
    if (isNaN(txDate.getTime()) || txDate > asOfDate) continue;

    if (tx.type === 'deposit') {
      // Inflow into portfolio -> negative from investor's perspective
      flows.push({ date: txDate, amount: -Math.abs(tx.amount) });
    } else if (tx.type === 'buy' && !hasDeposits) {
      // Direct asset purchase without separate deposit record
      flows.push({ date: txDate, amount: -Math.abs(tx.amount) });
    } else if (tx.type === 'withdrawal') {
      // Outflow to investor -> positive
      flows.push({ date: txDate, amount: Math.abs(tx.amount) });
    }
  }

  // Add terminal value at evaluation date if positive
  if (terminalValue > 0) {
    flows.push({ date: asOfDate, amount: terminalValue });
  }

  if (flows.length < 2) {
    return 0;
  }

  // Sort cash flows chronologically
  flows.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Check if there is at least one positive and one negative cash flow
  let hasPositive = false;
  let hasNegative = false;
  for (const f of flows) {
    if (f.amount > 0) hasPositive = true;
    if (f.amount < 0) hasNegative = true;
  }
  if (!hasPositive || !hasNegative) {
    return 0;
  }

  const d0 = flows[0].date.getTime();
  const dayFractions: { years: number; amount: number }[] = flows.map(f => ({
    years: (f.date.getTime() - d0) / (365.25 * 24 * 60 * 60 * 1000),
    amount: f.amount
  }));

  const totalYears = dayFractions[dayFractions.length - 1].years;
  if (totalYears < 0.001) {
    // Under ~8 hours, annualized rate is not meaningful
    return 0;
  }

  // Function f(r) = sum( C_i * (1 + r)^(-t_i) )
  const f = (r: number): number => {
    let sum = 0;
    const base = 1 + r;
    if (base <= 0) return Number.NaN;
    for (const item of dayFractions) {
      sum += item.amount * Math.pow(base, -item.years);
    }
    return sum;
  };

  // Derivative f'(r) = sum( -t_i * C_i * (1 + r)^(-t_i - 1) )
  const fPrime = (r: number): number => {
    let sum = 0;
    const base = 1 + r;
    if (base <= 0) return Number.NaN;
    for (const item of dayFractions) {
      sum += -item.years * item.amount * Math.pow(base, -item.years - 1);
    }
    return sum;
  };

  // Primary Solver: Newton-Raphson
  let r = 0.10; // 10% initial guess
  const MAX_ITER = 100;
  const TOLERANCE = 1e-7;

  for (let i = 0; i < MAX_ITER; i++) {
    const y = f(r);
    const dy = fPrime(r);

    if (isNaN(y) || isNaN(dy) || Math.abs(dy) < 1e-12) {
      break; // Switch to bisection fallback
    }

    const nextR = r - y / dy;

    if (Math.abs(nextR - r) < TOLERANCE) {
      if (nextR > -0.999 && nextR < 100.0) {
        return Math.round(nextR * 10000) / 10000;
      }
      break;
    }

    r = nextR;
    // If divergent or out of realistic bounds, break to fallback
    if (r <= -0.99 || r > 50) {
      break;
    }
  }

  // Fallback: Robust Bisection Method bounded within [-0.95, 10.0]
  let low = -0.95;
  let high = 10.0;
  let fLow = f(low);
  let fHigh = f(high);

  if (!isNaN(fLow) && !isNaN(fHigh) && fLow * fHigh <= 0) {
    for (let j = 0; j < 120; j++) {
      const mid = (low + high) / 2;
      const fMid = f(mid);

      if (Math.abs(fMid) < TOLERANCE || (high - low) / 2 < TOLERANCE) {
        return Math.round(mid * 10000) / 10000;
      }

      if (fLow * fMid <= 0) {
        high = mid;
        fHigh = fMid;
      } else {
        low = mid;
        fLow = fMid;
      }
    }
    return Math.round(((low + high) / 2) * 10000) / 10000;
  }

  // If roots cannot bracket (e.g. extreme multi-irr), return simple CAGR approximation
  let totalDeposited = 0;
  for (const f of flows) {
    if (f.amount < 0) totalDeposited += -f.amount;
  }
  if (totalDeposited > 0 && totalYears > 0.05) {
    const cagr = Math.pow(terminalValue / totalDeposited, 1 / totalYears) - 1;
    if (!isNaN(cagr) && isFinite(cagr)) {
      return Math.round(Math.max(-0.99, Math.min(10, cagr)) * 10000) / 10000;
    }
  }

  return 0;
}
