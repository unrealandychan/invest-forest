import { describe, it, expect } from 'vitest';
import { getBiomeTier, getNextBiomeTier, generateSanctuaryDeedSvg } from '../src/ecosystem/biomes';

describe('Prestige Biome Tiers & Sanctuary Deeds', () => {
  it('correctly maps net worth thresholds to the 5 biomes', () => {
    expect(getBiomeTier(500).id).toBe('glade'); // Tier 1 ($0-$10k)
    expect(getBiomeTier(15000).id).toBe('grove'); // Tier 2 ($10k-$50k)
    expect(getBiomeTier(75000).id).toBe('redwood'); // Tier 3 ($50k-$150k)
    expect(getBiomeTier(250000).id).toBe('alpine'); // Tier 4 ($150k-$500k)
    expect(getBiomeTier(1000000).id).toBe('pangaea'); // Tier 5 ($500k+)
  });

  it('calculates progress percentage towards next biome tier', () => {
    // $30,000 net worth is in Grove ($10k-$50k range = $40k width, $20k into it = 50%)
    const progress = getNextBiomeTier(30000);
    expect(progress.currentTier.id).toBe('grove');
    expect(progress.nextTier?.id).toBe('redwood');
    expect(progress.progressPercent).toBe(50);
    expect(progress.remainingDollars).toBe(20000);
  });

  it('generates a valid ceremonial Sanctuary Deed SVG', () => {
    const tier = getBiomeTier(75000);
    const svg = generateSanctuaryDeedSvg(tier, 'Boglehead Cultivator', 75000, '2026-10-07');

    expect(svg).toContain('<svg');
    expect(svg).toContain('CANOPY SANCTUARY DEED');
    expect(svg).toContain('The Ancient Redwood Sanctuary');
    expect(svg).toContain('Redwood Sanctuary Master');
    expect(svg).toContain('$75,000');
  });
});
