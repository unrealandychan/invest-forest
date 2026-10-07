import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';
import { quoteService } from '../src/services/quoteService';

describe('Market Data Quote API (/api/v1/quotes)', () => {
  beforeEach(() => {
    quoteService.clearCache();
  });

  it('fetches quotes for requested symbols', async () => {
    const res = await request(app).get('/api/v1/quotes?symbols=VOO,BND');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.quotes.VOO).toBeDefined();
    expect(res.body.quotes.VOO.price).toBeGreaterThan(0);
    expect(res.body.quotes.BND).toBeDefined();
    expect(res.body.quotes.VOO.cached).toBe(false);
  });

  it('caches subsequent quote requests', async () => {
    // First call (uncached)
    await request(app).get('/api/v1/quotes?symbols=SCHD');
    // Second call (cached)
    const res2 = await request(app).get('/api/v1/quotes?symbols=SCHD');
    expect(res2.status).toBe(200);
    expect(res2.body.quotes.SCHD.cached).toBe(true);
  });
});
