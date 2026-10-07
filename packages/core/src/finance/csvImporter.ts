import { AssetClass, Holding, Transaction, TransactionType } from './types';
import { ASSET_CATALOG } from './assets';

export type BrokerFormat = 'schwab' | 'fidelity' | 'vanguard' | 'generic';

export interface ParseResult {
  broker: BrokerFormat;
  transactions: Transaction[];
  holdings: Holding[];
  totalParsed: number;
  skippedRows: number;
  warnings: string[];
}

export function detectBrokerFormat(headerLine: string): BrokerFormat {
  const line = headerLine.toLowerCase();
  if (line.includes('run date') && line.includes('action') && line.includes('commission')) {
    return 'fidelity';
  }
  if (line.includes('settlement date') && line.includes('trade date') && line.includes('investment name')) {
    return 'vanguard';
  }
  if (line.includes('fees & comm') || (line.includes('action') && line.includes('symbol') && line.includes('description'))) {
    return 'schwab';
  }
  return 'generic';
}

export function parseBrokerageCsv(csvContent: string): ParseResult {
  const lines = csvContent.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 2) {
    return {
      broker: 'generic',
      transactions: [],
      holdings: [],
      totalParsed: 0,
      skippedRows: 0,
      warnings: ['CSV file is empty or missing headers.'],
    };
  }

  // Find header line (skipping disclaimer lines that some brokers include)
  let headerIndex = 0;
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const l = lines[i].toLowerCase();
    if (l.includes('date') || l.includes('action') || l.includes('symbol')) {
      headerIndex = i;
      break;
    }
  }

  const headerLine = lines[headerIndex];
  const broker = detectBrokerFormat(headerLine);
  const headers = parseCsvRow(headerLine).map((h) => h.toLowerCase());

  const transactions: Transaction[] = [];
  const holdingsMap = new Map<string, Holding>();
  const warnings: string[] = [];
  let skippedRows = 0;

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const row = parseCsvRow(lines[i]);
    if (row.length < 3 || row.every((c) => c === '')) {
      skippedRows++;
      continue;
    }

    try {
      const tx = parseRowByBroker(row, headers, broker, i);
      if (tx) {
        transactions.push(tx);
        updateHoldingsMap(holdingsMap, tx);
      } else {
        skippedRows++;
      }
    } catch {
      skippedRows++;
    }
  }

  // Sort transactions chronologically
  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    broker,
    transactions,
    holdings: Array.from(holdingsMap.values()),
    totalParsed: transactions.length,
    skippedRows,
    warnings,
  };
}

function parseRowByBroker(
  row: string[],
  headers: string[],
  broker: BrokerFormat,
  index: number
): Transaction | null {
  const getCol = (names: string[]): string => {
    for (const name of names) {
      const idx = headers.indexOf(name);
      if (idx !== -1 && row[idx]) return row[idx].trim();
    }
    return '';
  };

  let dateRaw = '';
  let actionRaw = '';
  let symbolRaw = '';
  let sharesRaw = '';
  let priceRaw = '';
  let amountRaw = '';

  if (broker === 'fidelity') {
    dateRaw = getCol(['run date', 'date']);
    actionRaw = getCol(['action']);
    symbolRaw = getCol(['symbol']);
    sharesRaw = getCol(['quantity', 'shares']);
    priceRaw = getCol(['price ($)', 'price']);
    amountRaw = getCol(['amount ($)', 'amount']);
  } else if (broker === 'vanguard') {
    dateRaw = getCol(['trade date', 'settlement date', 'date']);
    actionRaw = getCol(['transaction type', 'action']);
    symbolRaw = getCol(['symbol']);
    sharesRaw = getCol(['shares', 'quantity']);
    priceRaw = getCol(['share price', 'price']);
    amountRaw = getCol(['principal amount', 'net amount', 'amount']);
  } else if (broker === 'schwab') {
    dateRaw = getCol(['date']);
    actionRaw = getCol(['action']);
    symbolRaw = getCol(['symbol']);
    sharesRaw = getCol(['quantity']);
    priceRaw = getCol(['price']);
    amountRaw = getCol(['amount']);
  } else {
    // Generic
    dateRaw = getCol(['date']);
    actionRaw = getCol(['type', 'action']);
    symbolRaw = getCol(['symbol']);
    sharesRaw = getCol(['shares', 'quantity']);
    priceRaw = getCol(['price']);
    amountRaw = getCol(['amount']);
  }

  const date = parseDate(dateRaw);
  if (!date) return null;

  const actionLower = actionRaw.toLowerCase();
  let type: TransactionType = 'buy';
  if (actionLower.includes('sell') || actionLower.includes('sold')) {
    type = 'sell';
  } else if (actionLower.includes('div') || actionLower.includes('dividend') || actionLower.includes('reinvest')) {
    type = 'dividend';
  } else if (actionLower.includes('deposit') || actionLower.includes('transfer') || actionLower.includes('electronic fund')) {
    type = 'deposit';
  } else if (actionLower.includes('withdrawal') || actionLower.includes('fee')) {
    type = 'withdrawal';
  }

  const cleanSymbol = symbolRaw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const shares = parseFloat(sharesRaw.replace(/[^0-9.-]/g, '')) || (type === 'buy' || type === 'sell' ? 1 : undefined);
  const price = parseFloat(priceRaw.replace(/[^0-9.-]/g, '')) || undefined;
  let amount = Math.abs(parseFloat(amountRaw.replace(/[^0-9.-]/g, '')) || 0);

  if (amount === 0 && shares && price) {
    amount = Math.round(shares * price * 100) / 100;
  }
  if (amount === 0) return null;

  // Determine asset class
  let assetClass: AssetClass = 'broad_market';
  if (cleanSymbol) {
    const catalogItem = ASSET_CATALOG.find((a) => a.symbol === cleanSymbol);
    if (catalogItem) {
      assetClass = catalogItem.assetClass;
    } else if (cleanSymbol.includes('BND') || cleanSymbol.includes('BOND') || cleanSymbol.includes('TLT') || cleanSymbol.includes('AGG')) {
      assetClass = 'bond';
    } else if (cleanSymbol.includes('DIV') || cleanSymbol.includes('SCHD') || cleanSymbol.includes('VYM') || cleanSymbol === 'O') {
      assetClass = 'dividend';
    } else if (cleanSymbol.includes('BTC') || cleanSymbol.includes('ETH') || cleanSymbol.includes('COIN')) {
      assetClass = 'speculative';
    }
  } else if (type === 'deposit' || type === 'withdrawal') {
    assetClass = 'cash';
  }

  return {
    id: `csv-${index}-${Date.now()}`,
    date,
    type,
    symbol: cleanSymbol || undefined,
    assetClass,
    shares,
    price,
    amount,
    note: `Imported from ${broker.toUpperCase()}: ${actionRaw}`,
  };
}

function updateHoldingsMap(map: Map<string, Holding>, tx: Transaction): void {
  if (!tx.symbol || (tx.type !== 'buy' && tx.type !== 'sell')) return;

  const sym = tx.symbol;
  const existing = map.get(sym);
  const shares = tx.shares || 1;
  const price = tx.price || (tx.amount / shares);

  if (!existing) {
    if (tx.type === 'buy') {
      map.set(sym, {
        symbol: sym,
        name: `${sym} Holding`,
        assetClass: tx.assetClass,
        shares,
        costBasis: tx.amount,
        currentPrice: price,
        firstPurchasedDate: tx.date,
        lastPurchasedDate: tx.date,
      });
    }
  } else {
    if (tx.type === 'buy') {
      existing.shares += shares;
      existing.costBasis += tx.amount;
      existing.currentPrice = price;
      existing.lastPurchasedDate = tx.date;
    } else if (tx.type === 'sell') {
      existing.shares = Math.max(0, existing.shares - shares);
      existing.costBasis = Math.max(0, existing.costBasis - tx.amount);
      existing.currentPrice = price;
    }
  }
}

function parseCsvRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseDate(raw: string): string | null {
  if (!raw) return null;
  // Handle MM/DD/YYYY or YYYY-MM-DD
  const parts = raw.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      const y = parts[0];
      const m = parts[1].padStart(2, '0');
      const d = parts[2].padStart(2, '0');
      return `${y}-${m}-${d}`;
    } else {
      // MM/DD/YYYY
      const m = parts[0].padStart(2, '0');
      const d = parts[1].padStart(2, '0');
      const y = parts[2];
      return `${y}-${m}-${d}`;
    }
  }
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return null;
}
