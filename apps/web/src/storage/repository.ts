import { db } from './db';
import { DEMO_PRESETS, Holding, Transaction } from '@invest-forest/core';

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const row = await db.settings.get(key);
    if (!row || row.value === undefined || row.value === null) return defaultValue;
    return row.value as T;
  } catch {
    return defaultValue;
  }
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  try {
    await db.settings.put({ key, value });
  } catch (err) {
    console.warn('Failed to set setting:', key, err);
  }
}

export async function resetEntireDatabase(mode: 'clean' | 'demo' = 'clean'): Promise<void> {
  await db.transaction('rw', [db.holdings, db.transactions, db.settings, db.harvestMemorials], async () => {
    await db.holdings.clear();
    await db.transactions.clear();
    await db.settings.clear();
    await db.harvestMemorials.clear();

    if (mode === 'clean') {
      await db.settings.put({ key: 'cashBalance', value: 0 });
      await db.settings.put({ key: 'activePresetId', value: 'blank-soil' });
      await db.settings.put({ key: 'hasSeenGuide', value: false });
    } else {
      const preset = DEMO_PRESETS.find((p) => p.id === 'boglehead-dca') || DEMO_PRESETS[1];
      await db.holdings.bulkAdd(preset.holdings);
      await db.transactions.bulkAdd(preset.transactions);
      await db.settings.put({ key: 'cashBalance', value: preset.cashBalance });
      await db.settings.put({ key: 'activePresetId', value: preset.id });
      await db.settings.put({ key: 'hasSeenGuide', value: true });
    }
  });
}

export async function initializeDatabaseIfEmpty(): Promise<void> {
  try {
    const count = await db.holdings.count();
    const txCount = await db.transactions.count();
    if (count === 0 && txCount === 0) {
      // Default to fresh Clean Soil ($0) for a pristine launch
      await resetEntireDatabase('clean');
    }
  } catch (err) {
    console.error('Dexie initialization error, resetting database:', err);
    await resetEntireDatabase('clean');
  }
}

export async function loadPreset(presetId: string): Promise<void> {
  const preset = DEMO_PRESETS.find((p) => p.id === presetId) || DEMO_PRESETS[0];

  await db.transaction('rw', [db.holdings, db.transactions, db.settings, db.harvestMemorials], async () => {
    await db.holdings.clear();
    await db.transactions.clear();
    await db.harvestMemorials.clear();

    if (preset.holdings.length > 0) {
      await db.holdings.bulkAdd(preset.holdings);
    }
    if (preset.transactions.length > 0) {
      await db.transactions.bulkAdd(preset.transactions);
    }
    await db.settings.put({ key: 'cashBalance', value: Math.max(0, preset.cashBalance || 0) });
    await db.settings.put({ key: 'activePresetId', value: preset.id });
  });
}

export async function addTransaction(tx: Omit<Transaction, 'id'>): Promise<Transaction> {
  const id = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const sanitizedAmount = Math.max(0.01, isFinite(tx.amount) ? tx.amount : 100);
  const fullTx: Transaction = {
    ...tx,
    id,
    amount: sanitizedAmount,
  };

  await db.transaction('rw', [db.holdings, db.transactions, db.settings], async () => {
    let rawCash = await getSetting<number>('cashBalance', 0);
    let currentCash = isFinite(rawCash) && rawCash >= 0 ? rawCash : 0;

    if (fullTx.type === 'deposit') {
      currentCash += fullTx.amount;
      await db.transactions.add(fullTx);
    } else if (fullTx.type === 'withdrawal') {
      currentCash = Math.max(0, currentCash - fullTx.amount);
      await db.transactions.add(fullTx);
    } else if (fullTx.type === 'buy') {
      const cleanSymbol = (fullTx.symbol || 'VOO').trim().toUpperCase();

      // If buying with new DCA capital (cash balance < purchase amount), record funding deposit
      if (currentCash < fullTx.amount) {
        const fundingShortfall = Math.round((fullTx.amount - currentCash) * 100) / 100;
        const fundingTx: Transaction = {
          id: `dep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          date: fullTx.date,
          type: 'deposit',
          assetClass: 'cash',
          amount: fundingShortfall,
          note: `Disciplined DCA funding for ${cleanSymbol}`,
        };
        await db.transactions.add(fundingTx);
        currentCash += fundingShortfall;
      }

      currentCash = Math.max(0, Math.round((currentCash - fullTx.amount) * 100) / 100);

      // Record the buy transaction
      const buyTx: Transaction = {
        ...fullTx,
        symbol: cleanSymbol,
      };
      await db.transactions.add(buyTx);

      // Upsert holding with strictly validated numbers
      const existing = await db.holdings.get(cleanSymbol);
      const rawShares = fullTx.shares || (fullTx.amount / (fullTx.price || 100));
      const validShares = isFinite(rawShares) && rawShares > 0 ? rawShares : 1;
      const rawPrice = fullTx.price || (fullTx.amount / validShares);
      const validPrice = isFinite(rawPrice) && rawPrice > 0 ? rawPrice : 100;

      if (existing) {
        existing.shares += validShares;
        existing.costBasis += fullTx.amount;
        existing.currentPrice = validPrice;
        existing.lastPurchasedDate = fullTx.date;
        await db.holdings.put(existing);
      } else {
        const newHolding: Holding = {
          symbol: cleanSymbol,
          name: `${cleanSymbol} Holding`,
          assetClass: fullTx.assetClass || 'broad_market',
          shares: validShares,
          costBasis: fullTx.amount,
          currentPrice: validPrice,
          firstPurchasedDate: fullTx.date,
          lastPurchasedDate: fullTx.date,
        };
        await db.holdings.add(newHolding);
      }
    } else if (fullTx.type === 'dividend') {
      currentCash += fullTx.amount;
      await db.transactions.add(fullTx);
    }

    await setSetting('cashBalance', currentCash);
  });

  return fullTx;
}

export async function exportDatabaseBackup(): Promise<string> {
  const holdings = await db.holdings.toArray();
  const transactions = await db.transactions.toArray();
  const memorials = await db.harvestMemorials.toArray();
  const cashBalance = await getSetting<number>('cashBalance', 0);

  const backup = {
    app: 'invest-forest',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    cashBalance,
    holdings,
    transactions,
    memorials,
  };

  return JSON.stringify(backup, null, 2);
}

export async function importDatabaseBackup(jsonStr: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.holdings || !data.transactions) return false;

    await db.transaction('rw', [db.holdings, db.transactions, db.settings, db.harvestMemorials], async () => {
      await db.holdings.clear();
      await db.transactions.clear();
      await db.harvestMemorials.clear();
      if (data.holdings.length > 0) await db.holdings.bulkAdd(data.holdings);
      if (data.transactions.length > 0) await db.transactions.bulkAdd(data.transactions);
      if (data.memorials && data.memorials.length > 0) await db.harvestMemorials.bulkAdd(data.memorials);
      await db.settings.put({ key: 'cashBalance', value: Math.max(0, data.cashBalance || 0) });
    });

    return true;
  } catch (err) {
    console.error('Failed to import backup:', err);
    return false;
  }
}
