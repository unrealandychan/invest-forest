import Dexie, { Table } from 'dexie';
import { Holding, Transaction } from '@invest-forest/core';

export interface AppSetting {
  key: string;
  value: any;
}

export class InvestForestDatabase extends Dexie {
  holdings!: Table<Holding, string>;
  transactions!: Table<Transaction, string>;
  settings!: Table<AppSetting, string>;

  constructor() {
    super('InvestForestDB');
    this.version(1).stores({
      holdings: '&symbol, assetClass, firstPurchasedDate',
      transactions: '&id, date, type, symbol, assetClass',
      settings: '&key'
    });
  }
}

export const db = new InvestForestDatabase();
