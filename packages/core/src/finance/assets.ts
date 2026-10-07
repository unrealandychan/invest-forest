import { AssetClass } from './types';

export interface CatalogAsset {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  defaultPrice: number;
  category: 'Broad Market' | 'Mega-Cap Stocks' | 'Dividend & Yield' | 'Bonds & Fixed Income' | 'Cash & Treasury' | 'Satellite & Speculative';
  description: string;
}

export const ASSET_CATALOG: CatalogAsset[] = [
  // Mega-Cap & Blue Chip Stocks (Accurate Real-World Benchmarks)
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    assetClass: 'broad_market',
    defaultPrice: 236.40,
    category: 'Mega-Cap Stocks',
    description: 'Global consumer ecosystem titan with immense free cash flow and stock buybacks.'
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc. (Google)',
    assetClass: 'broad_market',
    defaultPrice: 188.50,
    category: 'Mega-Cap Stocks',
    description: 'Search, cloud infrastructure, YouTube, and AI frontier leader.'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    assetClass: 'broad_market',
    defaultPrice: 435.20,
    category: 'Mega-Cap Stocks',
    description: 'Enterprise enterprise software, Azure cloud, and generative AI powerhouse.'
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    assetClass: 'broad_market',
    defaultPrice: 139.80,
    category: 'Mega-Cap Stocks',
    description: 'Global compute architecture fueling accelerated data centers and AI revolution.'
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    assetClass: 'broad_market',
    defaultPrice: 214.60,
    category: 'Mega-Cap Stocks',
    description: 'Global e-commerce marketplace and AWS cloud computing backbone.'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    assetClass: 'speculative',
    defaultPrice: 262.50,
    category: 'Mega-Cap Stocks',
    description: 'Electric mobility, autonomous driving AI, and renewable energy storage.'
  },
  {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    assetClass: 'broad_market',
    defaultPrice: 588.20,
    category: 'Mega-Cap Stocks',
    description: 'Global social communications network connecting over 3 billion active daily users.'
  },

  // Broad Market (Calibrated to Real Market Pricing)
  {
    symbol: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    assetClass: 'broad_market',
    defaultPrice: 542.80,
    category: 'Broad Market',
    description: 'Anchor of modern compounding, tracking 500 premier US enterprises.'
  },
  {
    symbol: 'QQQ',
    name: 'Invesco QQQ Trust (Nasdaq 100)',
    assetClass: 'broad_market',
    defaultPrice: 522.60,
    category: 'Broad Market',
    description: 'Top non-financial tech leaders driving global digital compounding.'
  },
  {
    symbol: 'QQQM',
    name: 'Invesco NASDAQ 100 ETF (Low Fee)',
    assetClass: 'broad_market',
    defaultPrice: 215.80, // Exactly 0.413 of QQQ
    category: 'Broad Market',
    description: 'Cost-effective Nasdaq 100 growth index designed for long-term buy-and-hold investors.'
  },
  {
    symbol: 'VTI',
    name: 'Vanguard Total Stock Market ETF',
    assetClass: 'broad_market',
    defaultPrice: 296.40,
    category: 'Broad Market',
    description: 'Total US investable market encompassing large, mid, and small cap firms.'
  },
  {
    symbol: 'VT',
    name: 'Vanguard Total World Stock ETF',
    assetClass: 'broad_market',
    defaultPrice: 119.50,
    category: 'Broad Market',
    description: 'Pangaea index tracking thousands of global companies across 40+ nations.'
  },
  {
    symbol: 'IVV',
    name: 'iShares Core S&P 500 ETF',
    assetClass: 'broad_market',
    defaultPrice: 543.20,
    category: 'Broad Market',
    description: 'Ultra low-cost S&P 500 bedrock cornerstone for steady index accumulation.'
  },
  {
    symbol: 'SCHG',
    name: 'Schwab U.S. Large-Cap Growth ETF',
    assetClass: 'broad_market',
    defaultPrice: 97.20,
    category: 'Broad Market',
    description: 'Focused basket of high-expansion American blue-chip growth giants.'
  },
  {
    symbol: 'VXUS',
    name: 'Vanguard Total International Stock ETF',
    assetClass: 'broad_market',
    defaultPrice: 63.90,
    category: 'Broad Market',
    description: 'Ex-US diversified equity across developed and emerging market trees.'
  },
  {
    symbol: 'AVUV',
    name: 'Avantis U.S. Small Cap Value ETF',
    assetClass: 'broad_market',
    defaultPrice: 92.40,
    category: 'Broad Market',
    description: 'Fama-French small cap value tilt for historical size & value risk premiums.'
  },

  // Dividend & Yield
  {
    symbol: 'SCHD',
    name: 'Schwab US Dividend Equity ETF',
    assetClass: 'dividend',
    defaultPrice: 83.10,
    category: 'Dividend & Yield',
    description: 'High-quality cash-flow dividend payers with 10+ consecutive years of payouts.'
  },
  {
    symbol: 'VIG',
    name: 'Vanguard Dividend Appreciation ETF',
    assetClass: 'dividend',
    defaultPrice: 196.80,
    category: 'Dividend & Yield',
    description: 'Focuses on resilient companies with a track record of increasing dividends annually.'
  },
  {
    symbol: 'VYM',
    name: 'Vanguard High Dividend Yield ETF',
    assetClass: 'dividend',
    defaultPrice: 125.40,
    category: 'Dividend & Yield',
    description: 'Generous cash harvest blossoms reinvested back into the soil.'
  },
  {
    symbol: 'DGRO',
    name: 'iShares Core Dividend Growth ETF',
    assetClass: 'dividend',
    defaultPrice: 60.20,
    category: 'Dividend & Yield',
    description: 'Companies with sustained dividend growth and sustainable payout ratios.'
  },
  {
    symbol: 'O',
    name: 'Realty Income Corp (Monthly Dividend)',
    assetClass: 'dividend',
    defaultPrice: 53.90,
    category: 'Dividend & Yield',
    description: 'The monthly dividend real-estate company distributing steady tenant rent.'
  },
  {
    symbol: 'JEPI',
    name: 'JPMorgan Equity Premium Income ETF',
    assetClass: 'dividend',
    defaultPrice: 57.40,
    category: 'Dividend & Yield',
    description: 'High monthly income through defensive equity holdings and covered call options.'
  },

  // Bonds & Fixed Income
  {
    symbol: 'BND',
    name: 'Vanguard Total Bond Market ETF',
    assetClass: 'bond',
    defaultPrice: 72.80,
    category: 'Bonds & Fixed Income',
    description: 'Broad investment-grade bond shelter providing ballast against market squalls.'
  },
  {
    symbol: 'AGG',
    name: 'iShares Core U.S. Aggregate Bond ETF',
    assetClass: 'bond',
    defaultPrice: 98.10,
    category: 'Bonds & Fixed Income',
    description: 'Comprehensive US investment-grade bond market benchmark.'
  },
  {
    symbol: 'TLT',
    name: 'iShares 20+ Year Treasury Bond ETF',
    assetClass: 'bond',
    defaultPrice: 91.50,
    category: 'Bonds & Fixed Income',
    description: 'Long-term US sovereign debt offering strong anti-panic flight to safety.'
  },
  {
    symbol: 'VGIT',
    name: 'Vanguard Intermediate-Term Treasury ETF',
    assetClass: 'bond',
    defaultPrice: 59.80,
    category: 'Bonds & Fixed Income',
    description: 'Medium duration sovereign treasuries balancing yield and duration stability.'
  },
  {
    symbol: 'TIP',
    name: 'iShares TIPS Bond ETF',
    assetClass: 'bond',
    defaultPrice: 107.20,
    category: 'Bonds & Fixed Income',
    description: 'Treasury Inflation-Protected Securities shielding purchasing power.'
  },

  // Cash & Ultra-Short
  {
    symbol: 'SGOV',
    name: 'iShares 0-3 Month Treasury Bond ETF',
    assetClass: 'cash',
    defaultPrice: 100.55,
    category: 'Cash & Treasury',
    description: 'Ultra-liquid risk-free short treasury stream paying steady monthly yield.'
  },
  {
    symbol: 'BIL',
    name: 'SPDR 1-3 Month T-Bill ETF',
    assetClass: 'cash',
    defaultPrice: 91.70,
    category: 'Cash & Treasury',
    description: 'Short-term Treasury bills representing pristine cash liquidity.'
  },
  {
    symbol: 'SHY',
    name: 'iShares 1-3 Year Treasury Bond ETF',
    assetClass: 'cash',
    defaultPrice: 82.40,
    category: 'Cash & Treasury',
    description: 'Short duration government debt offering capital preservation.'
  },

  // Satellite & Speculative
  {
    symbol: 'GLD',
    name: 'SPDR Gold Shares',
    assetClass: 'speculative',
    defaultPrice: 245.50,
    category: 'Satellite & Speculative',
    description: 'Physical gold bullion preserving purchasing power over centuries.'
  },
  {
    symbol: 'SMH',
    name: 'VanEck Semiconductor ETF',
    assetClass: 'speculative',
    defaultPrice: 242.00,
    category: 'Satellite & Speculative',
    description: 'Global semiconductor infrastructure driving AI and computation hardware.'
  },
  {
    symbol: 'IBIT',
    name: 'iShares Bitcoin Trust ETF',
    assetClass: 'speculative',
    defaultPrice: 39.20,
    category: 'Satellite & Speculative',
    description: 'Spot Bitcoin institutional custody. High volatility satellite asset.'
  },
  {
    symbol: 'ARKK',
    name: 'ARK Innovation ETF',
    assetClass: 'speculative',
    defaultPrice: 48.50,
    category: 'Satellite & Speculative',
    description: 'Disruptive innovation and tech moonshots with wide volatility swings.'
  },
];
