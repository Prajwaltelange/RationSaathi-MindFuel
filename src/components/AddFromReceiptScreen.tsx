import React, { useState } from 'react';
import { AppState, ParserEngine, RationRecord, RecordPlace } from '../types';
import {
  ExtractedReceiptItem,
  ParseReceiptResult,
  SAMPLE_RECEIPTS,
  parseReceiptWithFallback,
} from '../services/receiptParser';
import { formatIsoToDisplay, getTodayIso } from '../services/dateHelpers';
import { formatColourName, formatItemName, t } from '../services/translations';
import { parseQtyStringToGrams, parseRupeesStringToPaise } from '../services/numberHelpers';
import { createHistoryEntry } from '../services/historyLog';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  onNavigateToMyRation?: () => void;
}

export const AddFromReceiptScreen: React.FC<Props> = ({ state, onUpdateState, onNavigateToMyRation }) => {
  const { households, settings, records, history } = state;
  const lang = settings.language;

  const [selectedHhId, setSelectedHhId] = useState(households[0]?.id || '');
  const [inputText, setInputText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedResult, setExtractedResult] = useState<ParseReceiptResult | null>(null);
  const [itemsToSave, setItemsToSave] = useState<ExtractedReceiptItem[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeHousehold = households.find((h) => h.id === selectedHhId) || households[0];

  const handleSelectSample = (text: string) => {
    setInputText(text);
    setExtractedResult(null);
    setItemsToSave([]);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleExtract = async () => {
    if (!inputText.trim()) return;
    setIsExtracting(true);
    setSuccessMessage(null);

    try {
      const res = await parseReceiptWithFallback(inputText.trim(), settings.geminiEnabled);
      setExtractedResult(res);
      setItemsToSave(res.items);
    } catch (err) {
      console.error('Error during extraction:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUpdateItem = (id: string, field: keyof ExtractedReceiptItem, val: any) => {
    setItemsToSave((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: val };
        }
        return item;
      })
    );
  };

  // Citizen confirms suggestion and saves to records as Confirmed
  const handleSaveConfirmedRecords = async () => {
    if (!activeHousehold || itemsToSave.length === 0) return;

    const newRecords: RationRecord[] = [];
    const prevHash = history.length > 0 ? history[history.length - 1].hash : 'GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000';
    let currentHash = prevHash;
    const newHistEntries = [];

    for (const item of itemsToSave) {
      const qtyGrams = parseQtyStringToGrams(item.qtyStr);
      if (qtyGrams <= 0) continue;

      const recDate = item.dateStr || getTodayIso();
      const recMonth = recDate.slice(0, 7);
      const recId = `rec-rcpt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      const record: RationRecord = {
        id: recId,
        householdId: activeHousehold.id,
        month: recMonth,
        item: item.itemKey,
        qty: qtyGrams,
        date: recDate,
        sourceType: item.receiptRef ? 'receipt_reference' : 'receipt_text',
        sourceText: inputText.trim(),
        sourceRef: item.receiptRef || `RCPT-${Date.now().toString().slice(-4)}`,
        amountPaise: item.amountStr ? parseRupeesStringToPaise(item.amountStr) : null,
        status: 'Confirmed',
        origin: 'citizen',
        enteredByRole: 'Citizen',
        enteredByName: activeHousehold.headName,
        enteredAt: new Date().toISOString(),
        confirmedBy: 'citizen',
        confirmedAt: new Date().toISOString(),
        disputeNote: '',
        exceedNote: '',
        place: item.place,
        otpCode: '0000',
        otpAttempts: 0,
        parserEngine: item.engine,
      };

      newRecords.push(record);

      const histEntry = await createHistoryEntry(
        currentHash,
        'citizen',
        'receipt_extracted_record',
        recId,
        `Extracted & saved receipt: ${item.qtyStr} ${item.unit} ${item.itemKey} for card ${activeHousehold.cardNumber} (${activeHousehold.headName})`,
        {
          householdId: activeHousehold.id,
          cardNumber: activeHousehold.cardNumber,
          headName: activeHousehold.headName,
          shopName: settings.shopName,
        }
      );
      currentHash = histEntry.hash;
      newHistEntries.push(histEntry);
    }

    if (newRecords.length === 0) {
      setErrorMessage('Please ensure at least one item has a valid quantity specified.');
      return;
    }

    onUpdateState({
      ...state,
      records: [...newRecords, ...records],
      history: [...history, ...newHistEntries],
    });

    setSuccessMessage(t('receipt.savedSuccess', undefined, lang));
    setErrorMessage(null);
    setExtractedResult(null);
    setItemsToSave([]);
    setInputText('');
  };

  return (
    <div className="space-y-6">
      {/* Error Message Banner */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center justify-between shadow-xs">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-stone-400 hover:text-stone-700 font-bold">✕</button>
        </div>
      )}
      {/* Target Household Selector */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-700" />
            {t('receipt.title', undefined, lang)}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Extract distribution quantities from physical slips or text messages. Offline-ready.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
            Assign to Household:
          </label>
          <select
            value={selectedHhId}
            onChange={(e) => setSelectedHhId(e.target.value)}
            className="text-xs font-semibold bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-500"
          >
            {households.map((hh) => (
              <option key={hh.id} value={hh.id}>
                {hh.headName} ({hh.cardNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Try a Sample Buttons */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 shadow-xs space-y-2">
        <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
          {t('btn.trySample', undefined, lang)}:
        </span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_RECEIPTS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelectSample(s.text)}
              className="px-3 py-1.5 bg-white border border-stone-300 hover:border-amber-400 hover:bg-amber-50/50 text-stone-700 rounded-lg text-xs font-medium transition shadow-2xs text-left"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
        <label className="block text-xs font-bold text-stone-700">
          {t('receipt.pastePrompt', undefined, lang)}
        </label>
        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g. Received 8kg rice on 5 Oct, receipt no. 9042"
          className="w-full text-xs p-3 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-sans"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span
              className={`w-2 h-2 rounded-full ${
                settings.geminiEnabled ? 'bg-purple-500' : 'bg-emerald-500'
              }`}
            />
            <span>
              Engine:{' '}
              <strong>
                {settings.geminiEnabled ? 'Gemini (AI with local fallback)' : 'Local offline parser'}
              </strong>
            </span>
          </div>

          <button
            onClick={handleExtract}
            disabled={isExtracting || !inputText.trim()}
            className="px-5 py-2 bg-stone-900 hover:bg-black disabled:bg-stone-300 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {isExtracting ? 'Extracting...' : t('btn.extract', undefined, lang)}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          {onNavigateToMyRation && (
            <button
              onClick={onNavigateToMyRation}
              className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              View in My Ration <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Parser Suggestion Form (Editable) */}
      {extractedResult && itemsToSave.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-5">
          <div className="border-b border-stone-100 pb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                {t('receipt.suggestionHeader', undefined, lang)}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {t('receipt.suggestionNote', undefined, lang)}
              </p>
            </div>

            <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-md border border-stone-200">
              {extractedResult.engine === 'gemini'
                ? t('receipt.engineGemini', undefined, lang)
                : t('receipt.engineLocal', undefined, lang)}
            </span>
          </div>

          {/* Warning Flags */}
          {extractedResult.yearAssumed && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t('receipt.flagYear', undefined, lang)}</span>
            </div>
          )}
          {extractedResult.unconfident && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t('receipt.flagUnconfident', undefined, lang)}</span>
            </div>
          )}

          {/* Editable Rows */}
          <div className="space-y-4">
            {itemsToSave.map((item, index) => (
              <div
                key={item.id}
                className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Item #{index + 1}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    Source: {item.receiptRef ? 'Reference verified' : 'Pasted text'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                  {/* Item Key */}
                  <div className="lg:col-span-1">
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Item</label>
                    <select
                      value={item.itemKey}
                      onChange={(e) => handleUpdateItem(item.id, 'itemKey', e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 font-medium"
                    >
                      <option value="Grain">{formatItemName('Grain', lang)}</option>
                      <option value="Rice">{formatItemName('Rice', lang)}</option>
                      <option value="Wheat">{formatItemName('Wheat', lang)}</option>
                      <option value="Sugar">{formatItemName('Sugar', lang)}</option>
                      <option value="Dal">{formatItemName('Dal', lang)}</option>
                      <option value="Oil">{formatItemName('Oil', lang)}</option>
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="lg:col-span-1">
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Qty</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="e.g. 8"
                      value={item.qtyStr}
                      onChange={(e) => handleUpdateItem(item.id, 'qtyStr', e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 font-bold"
                    />
                  </div>

                  {/* Unit */}
                  <div className="lg:col-span-1">
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Unit</label>
                    <select
                      value={item.unit}
                      onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="kg">kg</option>
                      <option value="litre">litre</option>
                    </select>
                  </div>

                  {/* Date */}
                  <div className="lg:col-span-1">
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Date</label>
                    <input
                      type="date"
                      value={item.dateStr}
                      onChange={(e) => handleUpdateItem(item.id, 'dateStr', e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>

                  {/* Amount Paid */}
                  <div className="lg:col-span-1">
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Paid (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={item.amountStr}
                      onChange={(e) => handleUpdateItem(item.id, 'amountStr', e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>

                  {/* Receipt Reference */}
                  <div className="lg:col-span-1">
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Ref Code</label>
                    <input
                      type="text"
                      placeholder="e.g. R-4471"
                      value={item.receiptRef}
                      onChange={(e) => handleUpdateItem(item.id, 'receiptRef', e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={handleSaveConfirmedRecords}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm & Save to Distribution Records
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
