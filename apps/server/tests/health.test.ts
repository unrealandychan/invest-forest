import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';

describe('Health Check Probe (/healthz)', () => {
  it('returns healthy status code 200 with uptime and service name', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('invest-forest-server');
    expect(typeof res.body.uptimeSeconds).toBe('number');
  });

  it('returns 404 on nonexistent route', async () => {
    const res = await request(app).get('/invalid-route-xyz');
    expect(res.status).toBe(404);
  });
});
