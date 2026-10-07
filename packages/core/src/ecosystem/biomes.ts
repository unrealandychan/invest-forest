export type BiomeTierId = 'glade' | 'grove' | 'redwood' | 'alpine' | 'pangaea';

export interface BiomeTier {
  id: BiomeTierId;
  tierNumber: number;
  name: string;
  minNetWorth: number;
  custodianTitle: string;
  description: string;
  features: string[];
  islandRadius: number;
  hasBridge: boolean;
  hasWaterfall: boolean;
  hasMountains: boolean;
  hasAuroraPermanently: boolean;
  groundBaseColor: string;
}

export const BIOME_TIERS: BiomeTier[] = [
  {
    id: 'glade',
    tierNumber: 1,
    name: 'The Verdant Glade',
    minNetWorth: 0,
    custodianTitle: 'Seedling Cultivator',
    description: 'A modest, peaceful grassy meadow where fresh seeds first take root beside a gentle stream.',
    features: ['Young Sprout Meadow', 'Quiet Freshwater Stream', 'Fertile Soil'],
    islandRadius: 8.5,
    hasBridge: false,
    hasWaterfall: false,
    hasMountains: false,
    hasAuroraPermanently: false,
    groundBaseColor: '#3a5a40',
  },
  {
    id: 'grove',
    tierNumber: 2,
    name: 'The High Canopy Grove',
    minNetWorth: 10000,
    custodianTitle: 'Grove Warden',
    description: 'The island expands outward with wooden footbridges crossing the river, blooming wildflowers, and dense middle canopy.',
    features: ['Arched Wooden Footbridge', 'Wildflower Meadow Expansion', 'Songbird Perches'],
    islandRadius: 11.0,
    hasBridge: true,
    hasWaterfall: false,
    hasMountains: false,
    hasAuroraPermanently: false,
    groundBaseColor: '#344e41',
  },
  {
    id: 'redwood',
    tierNumber: 3,
    name: 'The Ancient Redwood Sanctuary',
    minNetWorth: 50000,
    custodianTitle: 'Redwood Sanctuary Master',
    description: 'Towering ancient redwoods pierce the morning fog, fed by a cascading rocky waterfall.',
    features: ['Cascading Rock Waterfall', 'Deep Redwood Root Insulations', 'Misty Forest Ravine'],
    islandRadius: 14.5,
    hasBridge: true,
    hasWaterfall: true,
    hasMountains: false,
    hasAuroraPermanently: false,
    groundBaseColor: '#2d4739',
  },
  {
    id: 'alpine',
    tierNumber: 4,
    name: 'The Alpine Horizon Valley',
    minNetWorth: 150000,
    custodianTitle: 'Alpine Horizon Sovereign',
    description: 'A vast mountain valley with snowcapped horizon peaks, ancient stone shrines, and golden hour lighting.',
    features: ['Snowcapped Horizon Peaks', 'Ancient Stone Hermitage', 'Alpine Shrines'],
    islandRadius: 18.0,
    hasBridge: true,
    hasWaterfall: true,
    hasMountains: true,
    hasAuroraPermanently: false,
    groundBaseColor: '#283618',
  },
  {
    id: 'pangaea',
    tierNumber: 5,
    name: 'The Immortal Pangaea Forest',
    minNetWorth: 500000,
    custodianTitle: 'Immortal Pangaea Monarch',
    description: 'A legendary celestial biome. Shimmering aurora borealis curtains wave perpetually over monarch redwood giants.',
    features: ['Perpetual Aurora Borealis', 'Glacial Crystal Streams', 'Ancient Redwood Monarchs'],
    islandRadius: 22.0,
    hasBridge: true,
    hasWaterfall: true,
    hasMountains: true,
    hasAuroraPermanently: true,
    groundBaseColor: '#1f362b',
  },
];

export function getBiomeTier(netWorth: number): BiomeTier {
  const amount = Math.max(0, netWorth);
  for (let i = BIOME_TIERS.length - 1; i >= 0; i--) {
    if (amount >= BIOME_TIERS[i].minNetWorth) {
      return BIOME_TIERS[i];
    }
  }
  return BIOME_TIERS[0];
}

export function getNextBiomeTier(netWorth: number): {
  currentTier: BiomeTier;
  nextTier: BiomeTier | null;
  progressPercent: number;
  remainingDollars: number;
} {
  const currentTier = getBiomeTier(netWorth);
  const nextIdx = currentTier.tierNumber; // 0-indexed next is tierNumber
  if (nextIdx >= BIOME_TIERS.length) {
    return {
      currentTier,
      nextTier: null,
      progressPercent: 100,
      remainingDollars: 0,
    };
  }

  const nextTier = BIOME_TIERS[nextIdx];
  const range = nextTier.minNetWorth - currentTier.minNetWorth;
  const currentProgress = Math.max(0, netWorth - currentTier.minNetWorth);
  const progressPercent = Math.min(100, Math.round((currentProgress / range) * 100));
  const remainingDollars = Math.max(0, nextTier.minNetWorth - netWorth);

  return {
    currentTier,
    nextTier,
    progressPercent,
    remainingDollars,
  };
}

export function generateSanctuaryDeedSvg(
  tier: BiomeTier,
  custodianName: string = 'Honored Cultivator',
  netWorth: number = 0,
  dateStr: string = new Date().toISOString().slice(0, 10)
): string {
  const formattedVal = Math.round(netWorth).toLocaleString();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="deedBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#07130e"/>
      <stop offset="50%" stop-color="#0c231a"/>
      <stop offset="100%" stop-color="#143628"/>
    </linearGradient>
    <linearGradient id="goldText" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f4e04d"/>
      <stop offset="50%" stop-color="#f39c12"/>
      <stop offset="100%" stop-color="#e67e22"/>
    </linearGradient>
  </defs>

  <!-- Parchment & Gold Borders -->
  <rect width="1200" height="800" rx="32" fill="url(#deedBg)"/>
  <rect x="24" y="24" width="1152" height="752" rx="24" fill="none" stroke="#f4e04d" stroke-width="2" stroke-opacity="0.4"/>
  <rect x="36" y="36" width="1128" height="728" rx="20" fill="none" stroke="#52b788" stroke-width="1.5" stroke-dasharray="6 4" stroke-opacity="0.5"/>

  <!-- Botanical Insignia Header -->
  <g transform="translate(600, 100)" text-anchor="middle">
    <text y="0" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#a8d5ba" letter-spacing="5">THE KINGDOM OF COMPOUNDING • SACRED BOTANICAL REGISTRY</text>
    <text y="42" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" fill="url(#goldText)" letter-spacing="2">CANOPY SANCTUARY DEED</text>
    <text y="70" font-family="system-ui, -apple-system, sans-serif" font-size="15" fill="#94a3b8">Tier ${tier.tierNumber} Consecration: ${escapeXml(tier.name)}</text>
  </g>

  <!-- Seal / Emblem -->
  <g transform="translate(600, 260)">
    <circle cx="0" cy="0" r="54" fill="#0b1b14" stroke="#f4e04d" stroke-width="3"/>
    <circle cx="0" cy="0" r="46" fill="none" stroke="#52b788" stroke-width="1.5" stroke-dasharray="4 2"/>
    <text x="0" y="8" text-anchor="middle" font-size="28">🌲</text>
  </g>

  <!-- Pronouncement Body -->
  <g transform="translate(600, 370)" text-anchor="middle">
    <text y="0" font-family="system-ui, -apple-system, sans-serif" font-size="15" fill="#cbd5e1">Be it recorded across the soil that through unwavering patience and disciplined Dollar-Cost Averaging,</text>
    <text y="38" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" fill="#ffffff">${escapeXml(custodianName)}</text>
    <text y="72" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="#52b788">Has ascended to the exalted rank of ${escapeXml(tier.custodianTitle)}</text>
    <text y="105" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#94a3b8" max-width="800">${escapeXml(tier.description)}</text>
  </g>

  <!-- Deed Attributes Grid -->
  <g transform="translate(140, 520)">
    <rect x="0" y="0" width="280" height="110" rx="16" fill="#ffffff" fill-opacity="0.04" stroke="#52b788" stroke-width="1" stroke-opacity="0.4"/>
    <text x="24" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#94a3b8">SANCTUARY BIOME</text>
    <text x="24" y="68" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">${escapeXml(tier.name)}</text>
    <text x="24" y="92" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#52b788">Tier ${tier.tierNumber} Realm</text>

    <rect x="320" y="0" width="280" height="110" rx="16" fill="#ffffff" fill-opacity="0.04" stroke="#52b788" stroke-width="1" stroke-opacity="0.4"/>
    <text x="344" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#94a3b8">CONSECRATED WEALTH</text>
    <text x="344" y="68" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#f4e04d">$${formattedVal}</text>
    <text x="344" y="92" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94a3b8">Compounded Principal</text>

    <rect x="640" y="0" width="280" height="110" rx="16" fill="#ffffff" fill-opacity="0.04" stroke="#52b788" stroke-width="1" stroke-opacity="0.4"/>
    <text x="664" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#94a3b8">BIOME ATTRIBUTES</text>
    <text x="664" y="66" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#ffffff">${escapeXml(tier.features[0] || 'Natural Woodland')}</text>
    <text x="664" y="92" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#52b788">${escapeXml(tier.features[1] || 'Living Stream')}</text>
  </g>

  <!-- Attestation Footer -->
  <g transform="translate(600, 715)" text-anchor="middle">
    <text y="0" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-style="italic" fill="#64748b">"Time in the market beats timing the market." — Attested by the Canopy Spirit on ${dateStr}</text>
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
