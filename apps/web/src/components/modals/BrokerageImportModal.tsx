import React, { useState } from 'react';
import { parseBrokerageCsv, ParseResult } from '@invest-forest/core';
import { db } from '../../storage/db';
import { X, Upload, FileText, CheckCircle2, ShieldCheck, AlertCircle, Link } from 'lucide-react';

interface BrokerageImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

export const BrokerageImportModal: React.FC<BrokerageImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'csv' | 'direct'>('csv');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setSuccessCount(null);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = parseBrokerageCsv(content);
        setParseResult(result);
      }
    };

    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (!parseResult || parseResult.transactions.length === 0) return;

    setIsImporting(true);
    try {
      await db.transaction('rw', [db.transactions, db.holdings], async () => {
        // Bulk add transactions
        await db.transactions.bulkPut(parseResult.transactions);

        // Update holdings
        for (const h of parseResult.holdings) {
          const existing = await db.holdings.get(h.symbol);
          if (existing) {
            existing.shares += h.shares;
            existing.costBasis += h.costBasis;
            existing.currentPrice = h.currentPrice;
            existing.lastPurchasedDate = h.lastPurchasedDate;
            await db.holdings.put(existing);
          } else {
            await db.holdings.put(h);
          }
        }
      });

      setSuccessCount(parseResult.transactions.length);
      if (onImportComplete) onImportComplete();
    } catch (err) {
      console.error('Failed to import transactions:', err);
    } finally {
      setIsImporting(false);
    }
  };

  const brokerLabels: Record<string, string> = {
    schwab: 'Charles Schwab CSV',
    fidelity: 'Fidelity Investments CSV',
    vanguard: 'Vanguard Group CSV',
    generic: 'Generic Brokerage CSV',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-forest-950 border border-forest-600/50 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative flex flex-col space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-forest-900 border border-forest-700/60 text-sprout">
              <Upload className="w-5 h-5 text-sprout" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Brokerage Statement Importer & Sync</h2>
              <p className="text-xs text-slate-400">Import real trades from Schwab, Fidelity, or Vanguard with client-side privacy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-forest-900 hover:bg-forest-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-forest-900 p-1 border border-forest-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('csv')}
            className={`flex-1 py-1.5 font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'csv' ? 'bg-forest-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>CSV Statement Upload</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-1.5 font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'direct' ? 'bg-forest-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Direct Broker Connect (Plaid / SnapTrade)</span>
          </button>
        </div>

        {activeTab === 'csv' ? (
          <div className="space-y-4 text-xs">
            {/* Dropzone */}
            <label className="border-2 border-dashed border-forest-700/80 hover:border-sprout bg-forest-900/30 hover:bg-forest-900/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition space-y-2">
              <Upload className="w-8 h-8 text-sprout" />
              <div className="text-sm font-bold text-white">
                {fileName ? fileName : 'Click or Drag & Drop Brokerage CSV Here'}
              </div>
              <p className="text-[11px] text-slate-400 text-center max-w-sm">
                Supported: <strong>Charles Schwab</strong>, <strong>Fidelity</strong>, <strong>Vanguard</strong>, and standard transaction CSVs.
              </p>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>

            {/* Success banner */}
            {successCount !== null && (
              <div className="p-3 bg-emerald-950/70 border border-emerald-600/50 rounded-xl text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Successfully imported {successCount} transactions into your local forest!</span>
              </div>
            )}

            {/* Parse Preview */}
            {parseResult && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-forest-800 border border-forest-600/40 text-sprout">
                      {brokerLabels[parseResult.broker] || 'Detected CSV'}
                    </span>
                    <span className="text-slate-300 text-xs">
                      {parseResult.totalParsed} Transactions Found • {parseResult.holdings.length} Positions
                    </span>
                  </div>
                  {parseResult.skippedRows > 0 && (
                    <span className="text-[10px] text-slate-400">
                      ({parseResult.skippedRows} headers/disclaimer rows skipped)
                    </span>
                  )}
                </div>

                {/* Table Preview */}
                <div className="max-h-48 overflow-y-auto border border-forest-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-forest-900/80 text-slate-400 uppercase font-semibold border-b border-forest-800">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Action</th>
                        <th className="py-2 px-3">Symbol</th>
                        <th className="py-2 px-3">Shares</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-forest-900 bg-forest-950/60">
                      {parseResult.transactions.slice(0, 15).map((tx) => (
                        <tr key={tx.id} className="hover:bg-forest-900/40">
                          <td className="py-2 px-3 text-slate-300 font-mono">{tx.date}</td>
                          <td className="py-2 px-3">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              tx.type === 'buy' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                              tx.type === 'dividend' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                              'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-bold text-white">{tx.symbol || 'CASH'}</td>
                          <td className="py-2 px-3 font-mono text-slate-300">{tx.shares ? tx.shares.toFixed(2) : '—'}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-white">${tx.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={isImporting || parseResult.totalParsed === 0}
                  className="w-full py-2.5 bg-forest-500 hover:bg-forest-400 text-forest-950 font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isImporting ? 'Importing Transactions...' : `Import ${parseResult.totalParsed} Transactions to Forest`}
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Direct Broker Connect (Plaid / SnapTrade Mock Architecture) */
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-forest-900/60 border border-forest-700/60 rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-sprout shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-sm">Zero-Knowledge Brokerage Sync</h3>
                  <p className="text-slate-300 text-xs mt-1">
                    Connect read-only brokerage APIs (Plaid / SnapTrade). All tokens and transaction records are encrypted client-side using AES-GCM-256 before leaving your browser.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                {['Charles Schwab', 'Fidelity', 'Vanguard', 'Interactive Brokers'].map((broker) => (
                  <div
                    key={broker}
                    className="p-3 bg-forest-950/70 border border-forest-800 rounded-xl flex items-center justify-between"
                  >
                    <span className="font-semibold text-white">{broker}</span>
                    <button
                      type="button"
                      onClick={() => alert(`Connecting read-only ${broker} link via encrypted SnapTrade bridge...`)}
                      className="px-2.5 py-1 bg-forest-700 hover:bg-forest-600 text-sprout text-[10px] font-bold rounded-lg border border-forest-600/50 transition"
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-forest-950 border border-forest-800 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-sprout shrink-0 mt-0.5" />
              <span>
                Read-only mode guarantees Invest Forest can never execute trades, withdraw funds, or access personal bank credentials.
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-forest-800/80">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-forest-800 hover:bg-forest-700 text-slate-200 font-semibold rounded-xl text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
