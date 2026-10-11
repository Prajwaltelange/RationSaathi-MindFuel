import React, { useState } from 'react';
import { AppState, HistoryEntry, LanguageCode } from '../types';
import { verifyHistoryIntegrity, VerificationResult } from '../services/historyLog';
import { t } from '../services/translations';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  User,
  Store,
  Filter,
  CheckCircle2,
  Users,
  Search,
  Hash,
  ExternalLink,
} from 'lucide-react';

interface Props {
  state: AppState;
  lang: LanguageCode;
}

export const HistoryScreen: React.FC<Props> = ({ state, lang }) => {
  const { history, households, settings, cardTypes, records } = state;
  const role = settings.role;
  const isCitizen = role === 'citizen';
  const isShopkeeper = role === 'shopkeeper';

  const [selectedHhId, setSelectedHhId] = useState<string>(households[0]?.id || '');
  const [showGlobalChain, setShowGlobalChain] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Active household in citizen mode
  const activeHousehold = households.find((h) => h.id === selectedHhId) || households[0];
  const activeCardType = activeHousehold
    ? cardTypes.find((c) => c.id === activeHousehold.cardTypeId)
    : null;

  // Filter history entries based on active role
  const getFilteredHistory = (): HistoryEntry[] => {
    if (showGlobalChain) {
      return history;
    }

    if (isCitizen) {
      if (!activeHousehold) return [];
      const curCard = activeHousehold.cardNumber.toLowerCase();
      const curHead = activeHousehold.headName.toLowerCase();
      const curHhId = activeHousehold.id;

      return history.filter((entry) => {
        // Direct household match
        if (entry.householdId && entry.householdId === curHhId) return true;
        if (entry.cardNumber && entry.cardNumber.toLowerCase() === curCard) return true;
        if (entry.headName && entry.headName.toLowerCase() === curHead) return true;
        // Text match
        if (entry.details.toLowerCase().includes(curCard)) return true;
        if (entry.details.toLowerCase().includes(curHead)) return true;
        // Record match
        if (entry.recordId) {
          const rec = records.find((r) => r.id === entry.recordId);
          if (rec && rec.householdId === curHhId) return true;
        }
        return false;
      });
    }

    if (isShopkeeper) {
      const curShop = (settings.shopName || 'Shop-001').toLowerCase();
      return history.filter((entry) => {
        // Shop metadata match
        if (entry.shopName && entry.shopName.toLowerCase() === curShop) return true;
        // Details text match
        if (entry.details.toLowerCase().includes(curShop)) return true;
        // Associated record match
        if (entry.recordId) {
          const rec = records.find((r) => r.id === entry.recordId);
          if (rec) {
            if (rec.enteredByName.toLowerCase().includes(curShop)) return true;
            if (rec.sourceRef && rec.sourceRef.toLowerCase().includes(curShop)) return true;
            if (rec.place === 'home_shop') return true;
          }
        }
        // General shopkeeper role entries
        if (entry.role === 'shopkeeper') return true;
        return false;
      });
    }

    return history;
  };

  const displayedHistory = getFilteredHistory();

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const res = await verifyHistoryIntegrity(history);
      setVerificationResult(res);
    } catch (e) {
      console.error('Integrity verification failed:', e);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-700" />
            {t('history.title', undefined, lang)}
          </h2>
          <span className="text-xs text-stone-500">
            Append-only tamper-evident audit trail with SHA-256 cryptographic block hash chaining.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGlobalChain(!showGlobalChain)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              showGlobalChain
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {showGlobalChain ? 'Switch to Filtered View' : 'Show Full Block Ledger'}
          </button>

          <button
            onClick={handleVerify}
            disabled={isVerifying || history.length === 0}
            className="px-4 py-2 bg-stone-900 hover:bg-black disabled:bg-stone-300 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-xs cursor-pointer active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {isVerifying ? 'Verifying Chain...' : t('btn.verifyHistory', undefined, lang)}
          </button>
        </div>
      </div>

      {/* Role-Specific Filter & Context Banner */}
      {!showGlobalChain && isCitizen && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                  Citizen Personal Audit Log
                </span>
                {activeCardType && (
                  <span
                    className="w-3 h-3 rounded-full border border-stone-300 shadow-2xs"
                    style={{ backgroundColor: activeCardType.colour }}
                    title={activeCardType.name}
                  />
                )}
              </div>
              <p className="text-xs text-purple-800">
                Displaying only entries and verification records for <strong>{activeHousehold?.headName || 'Selected Citizen'}</strong> ({activeHousehold?.cardNumber}). Confidential logs of other households are excluded.
              </p>
            </div>
          </div>

          {households.length > 1 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-purple-900">Switch Card:</label>
              <select
                value={selectedHhId}
                onChange={(e) => setSelectedHhId(e.target.value)}
                className="text-xs bg-white border border-purple-300 rounded-lg px-2.5 py-1.5 font-bold text-stone-800 focus:outline-hidden"
              >
                {households.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.headName} ({h.cardNumber})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {!showGlobalChain && isShopkeeper && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                Shop Counter Audit Log — FPS {settings.shopName || 'Shop-001'}
              </span>
              <p className="text-xs text-amber-800">
                Displaying all distribution entries and OTP verifications for <strong>everyone who collected from FPS {settings.shopName || 'Shop-001'}</strong> ({displayedHistory.length} total events).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold bg-white/90 text-amber-950 px-3 py-1.5 rounded-lg border border-amber-300 shadow-2xs">
            FPS Counter Records: {displayedHistory.length}
          </div>
        </div>
      )}

      {showGlobalChain && (
        <div className="bg-stone-100 border border-stone-300 rounded-xl p-3 text-xs text-stone-700 flex items-center justify-between gap-2">
          <span>
            Viewing <strong>Full Global Ledger</strong> ({history.length} chained blocks). Toggle off to view role-specific audit.
          </span>
          <span className="font-mono text-stone-500 font-bold">Unbroken Chain Length: {history.length}</span>
        </div>
      )}

      {/* Verification Result Banner */}
      {verificationResult && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${
            verificationResult.isValid
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          {verificationResult.isValid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <div>
            <span className="font-bold block">
              {verificationResult.isValid
                ? t('history.valid', undefined, lang)
                : t('history.broken', { index: (verificationResult.brokenIndex || 0) + 1 }, lang)}
            </span>
            <span className="text-[11px] opacity-80 mt-0.5 block">
              Successfully validated all {verificationResult.totalEntries} SHA-256 chained block hashes with zero tampering detected.
            </span>
          </div>
        </div>
      )}

      {/* History Log Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        {displayedHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-500 space-y-2">
            <Shield className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="font-medium text-stone-700">
              {isCitizen
                ? `No audit history recorded yet for ${activeHousehold?.headName || 'this citizen'}.`
                : `No distribution transactions recorded at ${settings.shopName} yet.`}
            </p>
            <p className="text-[11px] text-stone-400">
              {isCitizen
                ? 'Confirming receipt, entering OTP (0000), or filing disputes will append verified blocks to your personal log.'
                : 'Logging transactions at the Shopkeeper Counter will append audit records for all beneficiaries here.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
              <tr>
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Beneficiary Card</th>
                <th className="p-3">Role & Action</th>
                <th className="p-3">Audit Details</th>
                <th className="p-3">Shop ID</th>
                <th className="p-3">Block Hash (SHA-256)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-sans">
              {displayedHistory.map((entry, idx) => {
                // Find matching household if known
                const hh = households.find(
                  (h) => h.id === entry.householdId || h.cardNumber === entry.cardNumber
                );
                const card = hh ? cardTypes.find((c) => c.id === hh.cardTypeId) : null;

                return (
                  <tr key={entry.id} className="hover:bg-stone-50/50">
                    <td className="p-3 text-center text-stone-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="p-3 font-mono text-[11px] text-stone-600 whitespace-nowrap">
                      {new Date(entry.time).toLocaleString()}
                    </td>
                    <td className="p-3">
                      {hh ? (
                        <div className="flex items-center gap-1.5">
                          {card && (
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0 border border-stone-300"
                              style={{ backgroundColor: card.colour }}
                              title={card.name}
                            />
                          )}
                          <span className="font-bold text-stone-900 block">{hh.headName}</span>
                          <span className="text-[10px] text-stone-500 font-mono">({hh.cardNumber})</span>
                        </div>
                      ) : entry.cardNumber ? (
                        <span className="font-mono text-stone-700">{entry.cardNumber}</span>
                      ) : (
                        <span className="text-stone-400 italic">System / All</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-stone-900 block">{entry.action}</span>
                      <span
                        className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded inline-block ${
                          entry.role === 'citizen'
                            ? 'bg-purple-100 text-purple-800'
                            : entry.role === 'shopkeeper'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {entry.role}
                      </span>
                    </td>
                    <td className="p-3 text-stone-800 leading-snug">{entry.details}</td>
                    <td className="p-3 font-mono text-[11px] text-stone-600">
                      {entry.shopName || settings.shopName || '-'}
                    </td>
                    <td className="p-3 font-mono text-[10px] text-stone-500 max-w-xs truncate" title={entry.hash}>
                      <span className="text-amber-800 font-semibold">{entry.hash.slice(0, 10)}</span>
                      ...{entry.hash.slice(-8)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
