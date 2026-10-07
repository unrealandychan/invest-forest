import { AssetClass } from './types';

export interface CatalogAsset {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  defaultPrice: number;
  category: 'Broad Market' | 'Dividend & Yield' | 'Bonds & Fixed Income' | 'Cash & Treasury' | 'Satellite & Speculative';
  description: string;
}

export const ASSET_CATALOG: CatalogAsset[] = [
  // Broad Market
  {
    symbol: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    assetClass: 'broad_market',
    defaultPrice: 485.50,
    category: 'Broad Market',
    description: 'Anchor of modern compounding, tracking 500 premier US enterprises.'
  },
  {
    symbol: 'QQQM',
    name: 'Invesco NASDAQ 100 ETF (Low Fee)',
    assetClass: 'broad_market',
    defaultPrice: 202.80,
    category: 'Broad Market',
    description: 'Cost-effective Nasdaq 100 growth index designed for long-term buy-and-hold investors.'
  },
  {
    symbol: 'QQQ',
    name: 'Invesco QQQ Trust (Nasdaq 100)',
    assetClass: 'broad_market',
    defaultPrice: 492.30,
    category: 'Broad Market',
    description: 'Top non-financial tech leaders driving global digital compounding.'
  },
  {
    symbol: 'VTI',
    name: 'Vanguard Total Stock Market ETF',
    assetClass: 'broad_market',
    defaultPrice: 260.20,
    category: 'Broad Market',
    description: 'Total US investable market encompassing large, mid, and small cap firms.'
  },
  {
    symbol: 'VT',
    name: 'Vanguard Total World Stock ETF',
    assetClass: 'broad_market',
    defaultPrice: 118.90,
    category: 'Broad Market',
    description: 'Pangaea index tracking thousands of global companies across 40+ nations.'
  },
  {
    symbol: 'IVV',
    name: 'iShares Core S&P 500 ETF',
    assetClass: 'broad_market',
    defaultPrice: 486.10,
    category: 'Broad Market',
    description: 'Ultra low-cost S&P 500 bedrock cornerstone for steady index accumulation.'
  },
  {
    symbol: 'SCHG',
    name: 'Schwab U.S. Large-Cap Growth ETF',
    assetClass: 'broad_market',
    defaultPrice: 94.60,
    category: 'Broad Market',
    description: 'Focused basket of high-expansion American blue-chip growth giants.'
  },
  {
    symbol: 'VXUS',
    name: 'Vanguard Total International Stock ETF',
    assetClass: 'broad_market',
    defaultPrice: 62.40,
    category: 'Broad Market',
    description: 'Ex-US diversified equity across developed and emerging market trees.'
  },
  {
    symbol: 'AVUV',
    name: 'Avantis U.S. Small Cap Value ETF',
    assetClass: 'broad_market',
    defaultPrice: 91.20,
    category: 'Broad Market',
    description: 'Fama-French small cap value tilt for historical size & value risk premiums.'
  },

  // Dividend & Yield
  {
    symbol: 'SCHD',
    name: 'Schwab US Dividend Equity ETF',
    assetClass: 'dividend',
    defaultPrice: 82.30,
    category: 'Dividend & Yield',
    description: 'High-quality cash-flow dividend payers with 10+ consecutive years of payouts.'
  },
  {
    symbol: 'VIG',
    name: 'Vanguard Dividend Appreciation ETF',
    assetClass: 'dividend',
    defaultPrice: 195.40,
    category: 'Dividend & Yield',
    description: 'Focuses on resilient companies with a track record of increasing dividends annually.'
  },
  {
    symbol: 'VYM',
    name: 'Vanguard High Dividend Yield ETF',
    assetClass: 'dividend',
    defaultPrice: 124.60,
    category: 'Dividend & Yield',
    description: 'Generous cash harvest blossoms reinvested back into the soil.'
  },
  {
    symbol: 'DGRO',
    name: 'iShares Core Dividend Growth ETF',
    assetClass: 'dividend',
    defaultPrice: 59.80,
    category: 'Dividend & Yield',
    description: 'Companies with sustained dividend growth and sustainable payout ratios.'
  },
  {
    symbol: 'O',
    name: 'Realty Income Corp (Monthly Dividend)',
    assetClass: 'dividend',
    defaultPrice: 53.70,
    category: 'Dividend & Yield',
    description: 'The monthly dividend real-estate company distributing steady tenant rent.'
  },
  {
    symbol: 'JEPI',
    name: 'JPMorgan Equity Premium Income ETF',
    assetClass: 'dividend',
    defaultPrice: 57.10,
    category: 'Dividend & Yield',
    description: 'High monthly income through defensive equity holdings and covered call options.'
  },

  // Bonds & Fixed Income
  {
    symbol: 'BND',
    name: 'Vanguard Total Bond Market ETF',
    assetClass: 'bond',
    defaultPrice: 72.40,
    category: 'Bonds & Fixed Income',
    description: 'Broad investment-grade bond shelter providing ballast against market squalls.'
  },
  {
    symbol: 'AGG',
    name: 'iShares Core U.S. Aggregate Bond ETF',
    assetClass: 'bond',
    defaultPrice: 97.80,
    category: 'Bonds & Fixed Income',
    description: 'Comprehensive US investment-grade bond market benchmark.'
  },
  {
    symbol: 'TLT',
    name: 'iShares 20+ Year Treasury Bond ETF',
    assetClass: 'bond',
    defaultPrice: 91.20,
    category: 'Bonds & Fixed Income',
    description: 'Long-term US sovereign debt offering strong anti-panic flight to safety.'
  },
  {
    symbol: 'VGIT',
    name: 'Vanguard Intermediate-Term Treasury ETF',
    assetClass: 'bond',
    defaultPrice: 59.50,
    category: 'Bonds & Fixed Income',
    description: 'Medium duration sovereign treasuries balancing yield and duration stability.'
  },
  {
    symbol: 'TIP',
    name: 'iShares TIPS Bond ETF',
    assetClass: 'bond',
    defaultPrice: 106.80,
    category: 'Bonds & Fixed Income',
    description: 'Treasury Inflation-Protected Securities shielding purchasing power.'
  },

  // Cash & Ultra-Short
  {
    symbol: 'SGOV',
    name: 'iShares 0-3 Month Treasury Bond ETF',
    assetClass: 'cash',
    defaultPrice: 100.45,
    category: 'Cash & Treasury',
    description: 'Ultra-liquid risk-free short treasury stream paying steady monthly yield.'
  },
  {
    symbol: 'BIL',
    name: 'SPDR 1-3 Month T-Bill ETF',
    assetClass: 'cash',
    defaultPrice: 91.60,
    category: 'Cash & Treasury',
    description: 'Short-term Treasury bills representing pristine cash liquidity.'
  },
  {
    symbol: 'SHY',
    name: 'iShares 1-3 Year Treasury Bond ETF',
    assetClass: 'cash',
    defaultPrice: 82.20,
    category: 'Cash & Treasury',
    description: 'Short duration government debt offering capital preservation.'
  },

  // Satellite & Speculative
  {
    symbol: 'GLD',
    name: 'SPDR Gold Shares',
    assetClass: 'speculative',
    defaultPrice: 242.00,
    category: 'Satellite & Speculative',
    description: 'Physical gold bullion preserving purchasing power over centuries.'
  },
  {
    symbol: 'SMH',
    name: 'VanEck Semiconductor ETF',
    assetClass: 'speculative',
    defaultPrice: 238.40,
    category: 'Satellite & Speculative',
    description: 'Global semiconductor infrastructure driving AI and computation hardware.'
  },
  {
    symbol: 'IBIT',
    name: 'iShares Bitcoin Trust ETF',
    assetClass: 'speculative',
    defaultPrice: 38.60,
    category: 'Satellite & Speculative',
    description: 'Spot Bitcoin institutional custody. High volatility satellite asset.'
  },
  {
    symbol: 'ARKK',
    name: 'ARK Innovation ETF',
    assetClass: 'speculative',
    defaultPrice: 47.80,
    category: 'Satellite & Speculative',
    description: 'Disruptive innovation and tech moonshots with wide volatility swings.'
  },
];
