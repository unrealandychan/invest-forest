import { db } from './db';
import { DEMO_PRESETS, Holding, Transaction } from '@invest-forest/core';

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const row = await db.settings.get(key);
  if (!row) return defaultValue;
  return row.value as T;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  await db.settings.put({ key, value });
}

export async function initializeDatabaseIfEmpty(): Promise<void> {
  const count = await db.holdings.count();
  if (count === 0) {
    await loadPreset('boglehead-dca');
  }
}

export async function loadPreset(presetId: string): Promise<void> {
  const preset = DEMO_PRESETS.find((p) => p.id === presetId) || DEMO_PRESETS[0];

  await db.transaction('rw', [db.holdings, db.transactions, db.settings], async () => {
    await db.holdings.clear();
    await db.transactions.clear();

    await db.holdings.bulkAdd(preset.holdings);
    await db.transactions.bulkAdd(preset.transactions);
    await db.settings.put({ key: 'cashBalance', value: preset.cashBalance });
    await db.settings.put({ key: 'activePresetId', value: preset.id });
  });
}

export async function addTransaction(tx: Omit<Transaction, 'id'>): Promise<Transaction> {
  const id = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const fullTx: Transaction = { ...tx, id };

  await db.transaction('rw', [db.holdings, db.transactions, db.settings], async () => {
    await db.transactions.add(fullTx);

    let currentCash = await getSetting<number>('cashBalance', 0);

    if (fullTx.type === 'deposit') {
      currentCash += fullTx.amount;
    } else if (fullTx.type === 'withdrawal') {
      currentCash = Math.max(0, currentCash - fullTx.amount);
    } else if (fullTx.type === 'buy') {
      currentCash = Math.max(0, currentCash - fullTx.amount);
      if (fullTx.symbol) {
        const existing = await db.holdings.get(fullTx.symbol);
        const shares = fullTx.shares || 1;
        const price = fullTx.price || fullTx.amount / shares;
        if (existing) {
          existing.shares += shares;
          existing.costBasis += fullTx.amount;
          existing.currentPrice = price;
          existing.lastPurchasedDate = fullTx.date;
          await db.holdings.put(existing);
        } else {
          const newHolding: Holding = {
            symbol: fullTx.symbol,
            name: `${fullTx.symbol} Holding`,
            assetClass: fullTx.assetClass,
            shares,
            costBasis: fullTx.amount,
            currentPrice: price,
            firstPurchasedDate: fullTx.date,
            lastPurchasedDate: fullTx.date,
          };
          await db.holdings.add(newHolding);
        }
      }
    } else if (fullTx.type === 'dividend') {
      currentCash += fullTx.amount;
    }

    await setSetting('cashBalance', currentCash);
  });

  return fullTx;
}

export async function exportDatabaseBackup(): Promise<string> {
  const holdings = await db.holdings.toArray();
  const transactions = await db.transactions.toArray();
  const cashBalance = await getSetting<number>('cashBalance', 0);

  const backup = {
    app: 'invest-forest',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    cashBalance,
    holdings,
    transactions,
  };

  return JSON.stringify(backup, null, 2);
}

export async function importDatabaseBackup(jsonStr: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.holdings || !data.transactions) return false;

    await db.transaction('rw', [db.holdings, db.transactions, db.settings], async () => {
      await db.holdings.clear();
      await db.transactions.clear();
      await db.holdings.bulkAdd(data.holdings);
      await db.transactions.bulkAdd(data.transactions);
      await db.settings.put({ key: 'cashBalance', value: data.cashBalance || 0 });
    });

    return true;
  } catch (err) {
    console.error('Failed to import backup:', err);
    return false;
  }
}
