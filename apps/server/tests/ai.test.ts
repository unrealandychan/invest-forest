import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';

describe('AI Forest Spirit & Multi-Provider API (/api/v1/ai)', () => {
  const dummyPortfolio = {
    totalValue: 50000,
    investedPrincipal: 45000,
    unrealizedGain: 5000,
    unrealizedGainPercent: 11.1,
    xirr: 0.08,
    compoundingMultiplier: 0.11,
    cashBalance: 1500,
    dcaStreak: 5,
    assetAllocations: [],
    maxDrawdownPercent: 0,
  };

  const dummyHoldings = [
    {
      symbol: 'VOO',
      name: 'Vanguard S&P 500 ETF',
      assetClass: 'broad_market' as const,
      shares: 100,
      costBasis: 45000,
      currentPrice: 500,
      firstPurchasedDate: '2023-01-01',
      lastPurchasedDate: '2024-01-01',
    }
  ];

  it('lists available LLM providers with heuristic fallback active', async () => {
    const res = await request(app).get('/api/v1/ai/providers');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.providers.length).toBeGreaterThanOrEqual(4);
    expect(res.body.activeProvider).toBeDefined();
  });

  it('consults the Canopy Spirit with portfolio state', async () => {
    const res = await request(app)
      .post('/api/v1/ai/consult')
      .send({
        message: 'How is my grove flourishing?',
        summary: dummyPortfolio,
        holdings: dummyHoldings,
        weather: 'sunny',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.consultation.reply).toBeDefined();
    expect(res.body.consultation.wisdomQuote).toBeDefined();
    expect(res.body.consultation.providerUsed).toBeDefined();
  });

  it('performs a deep Portfolio Ecology Audit', async () => {
    const res = await request(app)
      .post('/api/v1/ai/audit')
      .send({
        summary: dummyPortfolio,
        holdings: dummyHoldings,
        weather: 'sunny',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.audit.healthScore).toBeGreaterThan(0);
    expect(res.body.audit.biodiversityGrade).toBeDefined();
    expect(res.body.audit.actionItems.length).toBeGreaterThan(0);
  });

  it('generates botanical lore for ETF assets', async () => {
    const res = await request(app).get('/api/v1/ai/lore?symbol=VOO&assetClass=broad_market');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.lore.speciesName).toContain('Oak');
    expect(res.body.lore.botanicalLore).toBeDefined();
  });
});
