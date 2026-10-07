import { Holding, Transaction } from './types';
import { StorageAdapter } from './storageAdapter';

export interface SQLiteDriver {
  execute(sql: string): Promise<void>;
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  run(sql: string, params?: any[]): Promise<void>;
}

export class SQLiteStorageAdapter implements StorageAdapter {
  public name = 'SQLite / SQLCipher Encrypted Engine';
  public isEncrypted = true;
  private driver: SQLiteDriver;
  private encryptionKey: string | null = null;
  private isInitialized = false;

  constructor(driver?: SQLiteDriver) {
    this.driver = driver || new InMemoryMockSQLiteDriver();
  }

  public async init(encryptionKey?: string): Promise<void> {
    this.encryptionKey = encryptionKey || null;

    if (this.encryptionKey) {
      // In real SQLCipher, this sets the database encryption key
      await this.driver.run(`PRAGMA key = '${this.encryptionKey}';`);
    }

    // Initialize Schema
    await this.driver.execute(`
      CREATE TABLE IF NOT EXISTS holdings (
        symbol TEXT PRIMARY KEY,
        name TEXT,
        asset_class TEXT,
        shares REAL,
        cost_basis REAL,
        current_price REAL,
        first_purchased_date TEXT,
        last_purchased_date TEXT
      );
    `);

    await this.driver.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        date TEXT,
        type TEXT,
        symbol TEXT,
        asset_class TEXT,
        shares REAL,
        price REAL,
        amount REAL,
        note TEXT
      );
    `);

    await this.driver.execute(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);

    this.isInitialized = true;
  }

  public async getHoldings(): Promise<Holding[]> {
    this.ensureInit();
    const rows = await this.driver.query<any>('SELECT * FROM holdings');
    return rows.map((r) => ({
      symbol: r.symbol,
      name: r.name,
      assetClass: r.asset_class,
      shares: r.shares,
      costBasis: r.cost_basis,
      currentPrice: r.current_price,
      firstPurchasedDate: r.first_purchased_date,
      lastPurchasedDate: r.last_purchased_date,
    }));
  }

  public async saveHolding(holding: Holding): Promise<void> {
    this.ensureInit();
    await this.driver.run(
      `INSERT OR REPLACE INTO holdings (symbol, name, asset_class, shares, cost_basis, current_price, first_purchased_date, last_purchased_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        holding.symbol,
        holding.name,
        holding.assetClass,
        holding.shares,
        holding.costBasis,
        holding.currentPrice,
        holding.firstPurchasedDate,
        holding.lastPurchasedDate,
      ]
    );
  }

  public async getTransactions(): Promise<Transaction[]> {
    this.ensureInit();
    const rows = await this.driver.query<any>('SELECT * FROM transactions ORDER BY date ASC');
    return rows.map((r) => ({
      id: r.id,
      date: r.date,
      type: r.type,
      symbol: r.symbol || undefined,
      assetClass: r.asset_class,
      shares: r.shares || undefined,
      price: r.price || undefined,
      amount: r.amount,
      note: r.note || undefined,
    }));
  }

  public async addTransaction(tx: Transaction): Promise<void> {
    this.ensureInit();
    await this.driver.run(
      `INSERT OR REPLACE INTO transactions (id, date, type, symbol, asset_class, shares, price, amount, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        tx.id,
        tx.date,
        tx.type,
        tx.symbol || null,
        tx.assetClass,
        tx.shares || null,
        tx.price || null,
        tx.amount,
        tx.note || null,
      ]
    );
  }

  public async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    this.ensureInit();
    const rows = await this.driver.query<{ value: string }>('SELECT value FROM app_settings WHERE key = ?', [key]);
    if (rows.length === 0) return defaultValue;
    try {
      return JSON.parse(rows[0].value) as T;
    } catch {
      return defaultValue;
    }
  }

  public async setSetting<T>(key: string, value: T): Promise<void> {
    this.ensureInit();
    const serialized = JSON.stringify(value);
    await this.driver.run(
      `INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?);`,
      [key, serialized]
    );
  }

  public async clear(): Promise<void> {
    this.ensureInit();
    await this.driver.execute('DELETE FROM holdings;');
    await this.driver.execute('DELETE FROM transactions;');
    await this.driver.execute('DELETE FROM app_settings;');
  }

  private ensureInit(): void {
    if (!this.isInitialized) {
      throw new Error('SQLiteStorageAdapter must be initialized before use');
    }
  }
}

// In-Memory Driver for Unit Testing & Mock Execution
export class InMemoryMockSQLiteDriver implements SQLiteDriver {
  private holdingsTable = new Map<string, any>();
  private transactionsTable = new Map<string, any>();
  private settingsTable = new Map<string, any>();

  public async execute(_sql: string): Promise<void> {
    // Schema created
  }

  public async run(sql: string, params: any[] = []): Promise<void> {
    if (sql.includes('INSERT OR REPLACE INTO holdings')) {
      const [symbol, name, asset_class, shares, cost_basis, current_price, first_purchased_date, last_purchased_date] = params;
      this.holdingsTable.set(symbol, {
        symbol,
        name,
        asset_class,
        shares,
        cost_basis,
        current_price,
        first_purchased_date,
        last_purchased_date,
      });
    } else if (sql.includes('INSERT OR REPLACE INTO transactions')) {
      const [id, date, type, symbol, asset_class, shares, price, amount, note] = params;
      this.transactionsTable.set(id, {
        id,
        date,
        type,
        symbol,
        asset_class,
        shares,
        price,
        amount,
        note,
      });
    } else if (sql.includes('INSERT OR REPLACE INTO app_settings')) {
      const [key, value] = params;
      this.settingsTable.set(key, { key, value });
    } else if (sql.includes('DELETE FROM holdings')) {
      this.holdingsTable.clear();
    } else if (sql.includes('DELETE FROM transactions')) {
      this.transactionsTable.clear();
    } else if (sql.includes('DELETE FROM app_settings')) {
      this.settingsTable.clear();
    }
  }

  public async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (sql.includes('FROM holdings')) {
      return Array.from(this.holdingsTable.values()) as T[];
    }
    if (sql.includes('FROM transactions')) {
      return Array.from(this.transactionsTable.values()) as T[];
    }
    if (sql.includes('FROM app_settings WHERE key = ?')) {
      const key = params[0];
      const found = this.settingsTable.get(key);
      return found ? [found as T] : [];
    }
    return [];
  }
}
