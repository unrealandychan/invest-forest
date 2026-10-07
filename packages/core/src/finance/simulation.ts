export interface SimulationYearPoint {
  year: number;
  totalDeposited: number;
  nominalValue: number;
  realValue: number;
  totalGain: number;
  compoundingMultiplier: number;
  treeHeightMeters: number;
  growthRings: number;
}

export interface SimulationResult {
  initialPrincipal: number;
  monthlyContribution: number;
  years: number;
  annualReturnPercent: number;
  inflationPercent: number;
  finalNominalValue: number;
  finalRealValue: number;
  totalDeposited: number;
  totalGain: number;
  compoundingMultiplier: number;
  yearlyPoints: SimulationYearPoint[];
}

export interface HistoricalBacktest {
  id: string;
  name: string;
  period: string;
  description: string;
  annualizedReturn: number; // e.g. 0.104 for 10.4%
  maxDrawdownPercent: number;
  keyLesson: string;
  calculateOutcome: (monthlyDCA: number, initialPrincipal: number, years: number) => {
    totalDeposited: number;
    finalValue: number;
    multiplier: number;
  };
}

export function simulateCompoundingGrowth(
  initialPrincipal: number,
  monthlyContribution: number,
  years: number = 20,
  annualReturnPercent: number = 9.5,
  inflationPercent: number = 2.5
): SimulationResult {
  const r = annualReturnPercent / 100;
  const i = inflationPercent / 100;
  const monthlyRate = Math.pow(1 + r, 1 / 12) - 1;
  const monthlyInflation = Math.pow(1 + i, 1 / 12) - 1;

  const points: SimulationYearPoint[] = [];
  let currentValue = Math.max(0, initialPrincipal);
  let cumulativeDeposits = Math.max(0, initialPrincipal);

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      currentValue = (currentValue + monthlyContribution) * (1 + monthlyRate);
      cumulativeDeposits += monthlyContribution;
    }

    const realDiscountFactor = Math.pow(1 + monthlyInflation, y * 12);
    const realValue = currentValue / realDiscountFactor;
    const totalGain = currentValue - cumulativeDeposits;
    const multiplier = cumulativeDeposits > 0 ? totalGain / cumulativeDeposits : 0;
    const treeHeightMeters = Math.min(18.0, 1.5 + y * 0.45 + multiplier * 0.8);

    points.push({
      year: y,
      totalDeposited: Math.round(cumulativeDeposits),
      nominalValue: Math.round(currentValue),
      realValue: Math.round(realValue),
      totalGain: Math.round(totalGain),
      compoundingMultiplier: Math.round(multiplier * 100) / 100,
      treeHeightMeters: Math.round(treeHeightMeters * 10) / 10,
      growthRings: y,
    });
  }

  const finalPoint = points[points.length - 1];

  return {
    initialPrincipal,
    monthlyContribution,
    years,
    annualReturnPercent,
    inflationPercent,
    finalNominalValue: finalPoint.nominalValue,
    finalRealValue: finalPoint.realValue,
    totalDeposited: finalPoint.totalDeposited,
    totalGain: finalPoint.totalGain,
    compoundingMultiplier: finalPoint.compoundingMultiplier,
    yearlyPoints: points,
  };
}

export const HISTORICAL_BACKTESTS: HistoricalBacktest[] = [
  {
    id: 'gfc-2008',
    name: '2008 Global Financial Crisis (The Great Recession)',
    period: '2007 – 2022 (15 Years)',
    description: 'Starting DCA right into the worst crash since 1929. The S&P 500 plunged -50.8%, yet continuous DCA bought the absolute market bottom.',
    annualizedReturn: 0.102,
    maxDrawdownPercent: 50.8,
    keyLesson: 'Investors who continued buying through 2008-2009 accumulated shares at historical generational lows, producing a 4.2x compounding windfall.',
    calculateOutcome: (monthly, initial, years = 15) => {
      const res = simulateCompoundingGrowth(initial, monthly, Math.min(years, 15), 10.2);
      return {
        totalDeposited: res.totalDeposited,
        finalValue: res.finalNominalValue,
        multiplier: res.compoundingMultiplier,
      };
    },
  },
  {
    id: 'dotcom-2000',
    name: '2000 Dot-Com Bust & The "Lost Decade"',
    period: '2000 – 2020 (20 Years)',
    description: 'Nasdaq cratered -78% and the S&P went nowhere for 10 years (2000-2010). But DCA dividends and low-cost accumulation still flourished.',
    annualizedReturn: 0.076,
    maxDrawdownPercent: 49.1,
    keyLesson: 'Even during the so-called "Lost Decade", continuous dollar-cost averagers made substantial real profits because they bought after the crash.',
    calculateOutcome: (monthly, initial, years = 20) => {
      const res = simulateCompoundingGrowth(initial, monthly, Math.min(years, 20), 7.6);
      return {
        totalDeposited: res.totalDeposited,
        finalValue: res.finalNominalValue,
        multiplier: res.compoundingMultiplier,
      };
    },
  },
  {
    id: 'covid-2020',
    name: '2020 COVID Crash to AI Era (Modern Fast Cycle)',
    period: '2020 – 2025 (5 Years)',
    description: 'The fastest -34% bear market in financial history, followed by an unprecedented monetary recovery and the modern tech expansion.',
    annualizedReturn: 0.145,
    maxDrawdownPercent: 33.9,
    keyLesson: 'Speed of recovery punished anyone who tried to exit into cash; staying fully invested generated record 14.5% annualized returns.',
    calculateOutcome: (monthly, initial, years = 5) => {
      const res = simulateCompoundingGrowth(initial, monthly, Math.min(years, 5), 14.5);
      return {
        totalDeposited: res.totalDeposited,
        finalValue: res.finalNominalValue,
        multiplier: res.compoundingMultiplier,
      };
    },
  },
];
