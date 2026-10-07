import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';
import { syncService } from '../src/services/syncService';

describe('Encrypted Snapshot Sync API (/api/v1/sync)', () => {
  beforeEach(() => {
    syncService.clear();
  });

  it('rejects push request when mandatory fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/sync/push')
      .send({ version: 1 });
    expect(res.status).toBe(400);
  });

  it('stores and retrieves encrypted vault snapshot', async () => {
    const payload = {
      syncId: 'test-vault-user-42',
      version: 1,
      encryptedBlob: 'dGhpcyBpcyBhbiBlbmNyeXB0ZWQgcG9ydGZvbGlv',
      iv: 'dGVzdC1pdi0xMg==',
      salt: 'dGVzdC1zYWx0LTE2',
      checksum: 'sha256-abcdef123456',
    };

    const pushRes = await request(app)
      .post('/api/v1/sync/push')
      .send(payload);

    expect(pushRes.status).toBe(200);
    expect(pushRes.body.success).toBe(true);
    expect(pushRes.body.snapshot.syncId).toBe('test-vault-user-42');

    // Retrieve via pull
    const pullRes = await request(app)
      .get('/api/v1/sync/pull?syncId=test-vault-user-42');

    expect(pullRes.status).toBe(200);
    expect(pullRes.body.snapshot.encryptedBlob).toBe(payload.encryptedBlob);
    expect(pullRes.body.snapshot.checksum).toBe(payload.checksum);
  });

  it('returns 404 for nonexistent syncId', async () => {
    const res = await request(app).get('/api/v1/sync/pull?syncId=unknown-id');
    expect(res.status).toBe(404);
  });
});
