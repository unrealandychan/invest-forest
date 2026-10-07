import { describe, it, expect } from 'vitest';
import { encryptPayload, decryptPayload } from '../src/finance/crypto';

describe('Zero-Knowledge Client-Side Crypto Envelope', () => {
  it('encrypts and decrypts portfolio payload using passphrase', async () => {
    const rawData = JSON.stringify({
      holdings: [{ symbol: 'VOO', shares: 10, costBasis: 4500 }],
      cashBalance: 1250,
      timestamp: '2026-10-07T00:00:00Z',
    });
    const passphrase = 'my-super-secret-invest-forest-vault-passphrase';

    const envelope = await encryptPayload(rawData, passphrase);

    expect(envelope.version).toBe(1);
    expect(envelope.ciphertext).toBeDefined();
    expect(envelope.iv).toBeDefined();
    expect(envelope.salt).toBeDefined();
    expect(envelope.checksum).toBeDefined();
    // Ciphertext should not contain plaintext
    expect(envelope.ciphertext).not.toContain('VOO');

    const decrypted = await decryptPayload(envelope, passphrase);
    expect(decrypted).toBe(rawData);
  });

  it('fails decryption when wrong passphrase is provided', async () => {
    const rawData = 'test-secret-portfolio-data';
    const envelope = await encryptPayload(rawData, 'correct-passphrase');

    await expect(decryptPayload(envelope, 'wrong-passphrase')).rejects.toThrow();
  });
});
