import { Holding, Transaction } from './types';

export interface StorageAdapter {
  name: string;
  isEncrypted: boolean;
  init(encryptionKey?: string): Promise<void>;
  getHoldings(): Promise<Holding[]>;
  saveHolding(holding: Holding): Promise<void>;
  getTransactions(): Promise<Transaction[]>;
  addTransaction(tx: Transaction): Promise<void>;
  getSetting<T>(key: string, defaultValue: T): Promise<T>;
  setSetting<T>(key: string, value: T): Promise<void>;
  clear(): Promise<void>;
}
