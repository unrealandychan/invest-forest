import { Holding, PortfolioSummary, Transaction } from '../finance/types';
import { calculateTreeMetrics, SPECIES_CATALOG } from './species';

export interface DisciplineCardData {
  growerTitle: string;
  concentricRings: number;
  dcaStreak: number;
  oldestSpeciesName: string;
  oldestBotanicalName: string;
  speciesDiversityCount: number;
  timberProtectedCount: number; // zero panic sells
  wisdomQuote: string;
  generatedDate: string;
  theme: 'emerald' | 'amber' | 'frost';
}

export function generateDisciplineCardData(
  holdings: Holding[],
  transactions: Transaction[],
  summary: PortfolioSummary,
  theme: 'emerald' | 'amber' | 'frost' = 'emerald'
): DisciplineCardData {
  let maxRings = 1;
  let oldestHolding: Holding | null = null;

  for (const h of holdings) {
    const metrics = calculateTreeMetrics(h);
    if (metrics.growthRings >= maxRings) {
      maxRings = metrics.growthRings;
      oldestHolding = h;
    }
  }

  const oldestProfile = oldestHolding
    ? (SPECIES_CATALOG[oldestHolding.assetClass] || SPECIES_CATALOG.broad_market)
    : SPECIES_CATALOG.broad_market;

  // Title based on ring maturity
  let growerTitle = 'First Sprout Sower';
  if (maxRings >= 10) growerTitle = 'Decade Giant Redwood Custodian';
  else if (maxRings >= 5) growerTitle = '5-Year Ancient Oak Cultivator';
  else if (maxRings >= 3) growerTitle = 'Woodland Grove Steward';
  else if (maxRings >= 2) growerTitle = 'Rooted Canopy Gardener';

  const quotes = [
    '"Doing well with money has a little to do with how smart you are and a lot to do with how you behave." — Morgan Housel',
    '"Just keep buying. The biggest driver of long-term wealth is consistent accumulation." — Nick Maggiulli',
    '"Time in the market beats timing the market, every single time." — Jack Bogle',
  ];
  const wisdomQuote = quotes[Math.abs(summary.dcaStreak) % quotes.length];

  return {
    growerTitle,
    concentricRings: maxRings,
    dcaStreak: summary.dcaStreak,
    oldestSpeciesName: oldestProfile.commonName,
    oldestBotanicalName: oldestProfile.botanicalName,
    speciesDiversityCount: holdings.length,
    timberProtectedCount: 0, // 0 panic sells
    wisdomQuote,
    generatedDate: new Date().toISOString().slice(0, 10),
    theme,
  };
}

export function renderDisciplineCardSvg(data: DisciplineCardData): string {
  const bgColors: Record<string, { bg1: string; bg2: string; accent: string; ringColor: string }> = {
    emerald: { bg1: '#07130e', bg2: '#0f291e', accent: '#52b788', ringColor: '#74c69d' },
    amber: { bg1: '#18120b', bg2: '#2b1c10', accent: '#f4a261', ringColor: '#e76f51' },
    frost: { bg1: '#0b131f', bg2: '#16253b', accent: '#90e0ef', ringColor: '#caf0f8' },
  };

  const themeColors = bgColors[data.theme] || bgColors.emerald;

  // Concentric growth rings SVG elements
  const ringSvgElements = Array.from({ length: Math.min(data.concentricRings, 12) }).map((_, i) => {
    const r = 25 + (i * 12);
    return `<circle cx="480" cy="180" r="${r}" fill="none" stroke="${themeColors.ringColor}" stroke-width="2.5" stroke-dasharray="${i % 2 === 0 ? '6 3' : 'none'}" opacity="${0.4 + (i / 15) * 0.6}" />`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${themeColors.bg1}"/>
      <stop offset="100%" stop-color="${themeColors.bg2}"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" rx="36" fill="url(#bg)"/>
  <rect x="24" y="24" width="1152" height="582" rx="28" fill="none" stroke="${themeColors.accent}" stroke-width="2" stroke-opacity="0.35"/>

  <!-- Botanical Emblem & Concentric Rings Background -->
  <g transform="translate(480, 100)" opacity="0.3">
    ${ringSvgElements}
  </g>

  <!-- Header Branding -->
  <g transform="translate(80, 85)">
    <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="${themeColors.accent}" letter-spacing="4">INVEST FOREST • PROOF OF PATIENCE</text>
    <text x="0" y="48" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="#ffffff">${escapeXml(data.growerTitle)}</text>
    <text x="0" y="85" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#94a3b8">Anchor Species: ${escapeXml(data.oldestSpeciesName)} (${escapeXml(data.oldestBotanicalName)})</text>
  </g>

  <!-- Metric Badges (Zero-Knowledge: No Dollar Balances) -->
  <g transform="translate(80, 240)">
    <!-- Badge 1: Growth Rings -->
    <rect x="0" y="0" width="310" height="135" rx="20" fill="#ffffff" fill-opacity="0.04" stroke="${themeColors.accent}" stroke-width="1.5" stroke-opacity="0.4"/>
    <text x="28" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#94a3b8" letter-spacing="1">ANNUAL GROWTH RINGS</text>
    <text x="28" y="98" font-family="system-ui, -apple-system, sans-serif" font-size="46" font-weight="900" fill="#ffffff">${data.concentricRings} Years</text>
    <text x="28" y="120" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="${themeColors.accent}">Rooted in soil without panic selling</text>

    <!-- Badge 2: DCA Streak -->
    <rect x="340" y="0" width="310" height="135" rx="20" fill="#ffffff" fill-opacity="0.04" stroke="${themeColors.accent}" stroke-width="1.5" stroke-opacity="0.4"/>
    <text x="368" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#94a3b8" letter-spacing="1">DISCIPLINED DCA CADENCE</text>
    <text x="368" y="98" font-family="system-ui, -apple-system, sans-serif" font-size="46" font-weight="900" fill="${themeColors.accent}">${data.dcaStreak} Deposits</text>
    <text x="368" y="120" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94a3b8">Consistent scheduled deposits</text>

    <!-- Badge 3: Biodiversity -->
    <rect x="680" y="0" width="360" height="135" rx="20" fill="#ffffff" fill-opacity="0.04" stroke="${themeColors.accent}" stroke-width="1.5" stroke-opacity="0.4"/>
    <text x="708" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#94a3b8" letter-spacing="1">CANOPY BIODIVERSITY</text>
    <text x="708" y="98" font-family="system-ui, -apple-system, sans-serif" font-size="46" font-weight="900" fill="#ffffff">${data.speciesDiversityCount} Species</text>
    <text x="708" y="120" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="${themeColors.accent}">0 Panic Sells Executed</text>
  </g>

  <!-- Quote & Watermark Footer -->
  <g transform="translate(80, 440)">
    <rect x="0" y="0" width="1040" height="110" rx="20" fill="#ffffff" fill-opacity="0.03" stroke="#ffffff" stroke-width="1" stroke-opacity="0.1"/>
    <text x="30" y="46" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-style="italic" fill="#e2e8f0">${escapeXml(data.wisdomQuote)}</text>
    <text x="30" y="86" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#64748b">Verified by Invest Forest • Zero-Knowledge Sovereignty • Date: ${data.generatedDate}</text>
  </g>
</svg>`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
