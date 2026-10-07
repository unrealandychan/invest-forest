import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';

describe('Server Smoke Tests', () => {
  it('responds with healthy status on /healthz', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('returns quotes on /api/v1/quotes', async () => {
    const res = await request(app).get('/api/v1/quotes?symbols=VOO,BND');
    expect(res.status).toBe(200);
    expect(res.body.quotes).toBeDefined();
    expect(res.body.quotes.VOO.price).toBeGreaterThan(0);
  });
});
