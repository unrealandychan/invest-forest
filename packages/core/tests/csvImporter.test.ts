import { describe, it, expect } from 'vitest';
import { parseBrokerageCsv, detectBrokerFormat } from '../src/finance/csvImporter';

describe('Brokerage Statement CSV Importer', () => {
  it('detects Charles Schwab CSV format and parses transactions', () => {
    const schwabCsv = `"Date","Action","Symbol","Description","Quantity","Price","Fees & Comm","Amount"
"01/15/2024","Buy","VOO","Vanguard S&P 500 ETF","10","450.00","","4500.00"
"06/20/2024","Buy","SCHD","Schwab US Dividend Equity ETF","25","80.00","","2000.00"
"09/15/2024","Cash Dividend","SCHD","Schwab US Dividend Equity ETF","","","","45.00"
`;

    expect(detectBrokerFormat('"Date","Action","Symbol","Description","Quantity","Price","Fees & Comm","Amount"')).toBe('schwab');

    const result = parseBrokerageCsv(schwabCsv);
    expect(result.broker).toBe('schwab');
    expect(result.transactions.length).toBe(3);
    expect(result.holdings.length).toBe(2);
    expect(result.transactions[0].symbol).toBe('VOO');
    expect(result.transactions[0].type).toBe('buy');
    expect(result.transactions[2].type).toBe('dividend');
  });

  it('detects Fidelity CSV format and parses transactions', () => {
    const fidelityCsv = `"Run Date","Action","Symbol","Description","Type","Quantity","Price ($)","Commission ($)","Fees ($)","Accrued Interest ($)","Amount ($)","Settlement Date"
"2023-05-10","YOU BOUGHT","QQQM","INVESCO NASDAQ 100","Cash","15","160.00","0.00","0.00","0.00","-2400.00","2023-05-12"
"2023-11-01","Electronic Funds Transfer Received","","CASH DEPOSIT","Cash","","","0.00","0.00","0.00","5000.00","2023-11-01"
`;

    const result = parseBrokerageCsv(fidelityCsv);
    expect(result.broker).toBe('fidelity');
    expect(result.transactions.length).toBe(2);
    expect(result.transactions[0].symbol).toBe('QQQM');
    expect(result.transactions[1].type).toBe('deposit');
  });

  it('detects Vanguard CSV format and parses transactions', () => {
    const vanguardCsv = `"Settlement Date","Trade Date","Transaction Type","Transaction Description","Investment Name","Symbol","Shares","Share Price","Principal Amount"
"02/01/2023","01/30/2023","Buy","Purchase","Vanguard Total Bond Market","BND","50","72.50","3625.00"
`;

    const result = parseBrokerageCsv(vanguardCsv);
    expect(result.broker).toBe('vanguard');
    expect(result.transactions.length).toBe(1);
    expect(result.transactions[0].symbol).toBe('BND');
    expect(result.transactions[0].assetClass).toBe('bond');
  });
});
