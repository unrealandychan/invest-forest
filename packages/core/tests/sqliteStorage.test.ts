import { describe, it, expect, beforeEach } from 'vitest';
import { SQLiteStorageAdapter } from '../src/finance/sqliteStorage';
import { Holding, Transaction } from '../src/finance/types';

describe('SQLite / SQLCipher Encrypted Storage Engine', () => {
  let adapter: SQLiteStorageAdapter;

  beforeEach(async () => {
    adapter = new SQLiteStorageAdapter();
    await adapter.init('sqlcipher-secret-passphrase-256');
  });

  it('initializes with SQLCipher encryption enabled', () => {
    expect(adapter.isEncrypted).toBe(true);
    expect(adapter.name).toContain('SQLCipher');
  });

  it('persists and retrieves holdings and transactions', async () => {
    const holding: Holding = {
      symbol: 'QQQM',
      name: 'Invesco Nasdaq 100',
      assetClass: 'broad_market',
      shares: 10,
      costBasis: 2000,
      currentPrice: 205,
      firstPurchasedDate: '2024-01-01',
      lastPurchasedDate: '2024-06-01',
    };

    await adapter.saveHolding(holding);
    const holdings = await adapter.getHoldings();
    expect(holdings.length).toBe(1);
    expect(holdings[0].symbol).toBe('QQQM');
    expect(holdings[0].shares).toBe(10);

    const tx: Transaction = {
      id: 'tx-sqlite-1',
      date: '2024-01-01',
      type: 'buy',
      symbol: 'QQQM',
      assetClass: 'broad_market',
      shares: 10,
      price: 200,
      amount: 2000,
    };

    await adapter.addTransaction(tx);
    const txs = await adapter.getTransactions();
    expect(txs.length).toBe(1);
    expect(txs[0].symbol).toBe('QQQM');
  });

  it('persists and retrieves app settings', async () => {
    await adapter.setSetting('cashBalance', 3500);
    const cash = await adapter.getSetting('cashBalance', 0);
    expect(cash).toBe(3500);
  });
});
