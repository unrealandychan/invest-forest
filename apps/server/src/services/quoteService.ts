export interface CachedQuote {
  symbol: string;
  price: number;
  changePercent: number;
  updatedAt: string;
  cached: boolean;
}

interface CacheEntry {
  quote: CachedQuote;
  expiresAt: number;
}

export class QuoteService {
  private cache: Map<string, CacheEntry> = new Map();
  private ttlMs: number;

  private baselinePrices: Record<string, number> = {
    VOO: 485.50,
    VTI: 260.20,
    BND: 72.40,
    SCHD: 82.30,
    AAPL: 228.50,
    MSFT: 420.10,
    VT: 118.90,
    QQQ: 492.30,
  };

  constructor(ttlMinutes: number = 15) {
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  public async getQuotes(symbols: string[]): Promise<Record<string, CachedQuote>> {
    const results: Record<string, CachedQuote> = {};
    const now = Date.now();

    for (const rawSymbol of symbols) {
      const sym = rawSymbol.trim().toUpperCase();
      if (!sym) continue;

      const cached = this.cache.get(sym);
      if (cached && cached.expiresAt > now) {
        results[sym] = { ...cached.quote, cached: true };
        continue;
      }

      // Fetch or derive quote
      const quote = await this.fetchQuote(sym);
      this.cache.set(sym, {
        quote,
        expiresAt: now + this.ttlMs,
      });
      results[sym] = { ...quote, cached: false };
    }

    return results;
  }

  private async fetchQuote(symbol: string): Promise<CachedQuote> {
    const baseline = this.baselinePrices[symbol] || 100.0;
    // Add subtle realistic deterministic market variation
    const daySeed = new Date().getUTCDate();
    const variation = ((symbol.charCodeAt(0) * 7 + daySeed) % 10 - 5) * 0.1;
    const price = Math.round((baseline + variation) * 100) / 100;
    const changePercent = Math.round((variation / baseline) * 10000) / 100;

    return {
      symbol,
      price,
      changePercent,
      updatedAt: new Date().toISOString(),
      cached: false,
    };
  }

  public clearCache(): void {
    this.cache.clear();
  }
}

export const quoteService = new QuoteService();
