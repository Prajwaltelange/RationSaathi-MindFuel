import React, { useState } from 'react';
import { AppState, Household, RationRecord, RecordPlace, Rule } from '../types';
import { evaluateHouseholdMonth } from '../services/calculationEngine';
import { formatIsoToDisplay, getTodayIso } from '../services/dateHelpers';
import {
  computeExpectedPricePaise,
  formatGramsToQtyString,
  formatPaiseToRupeesString,
  parseQtyStringToGrams,
  parseRupeesStringToPaise,
} from '../services/numberHelpers';
import { formatColourName, formatItemName, t } from '../services/translations';
import { createHistoryEntry } from '../services/historyLog';
import {
  Search,
  PlusCircle,
  AlertTriangle,
  KeyRound,
  Lock,
  CheckCircle,
  History,
  ShieldCheck,
  Building2,
} from 'lucide-react';

interface Props {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
}

export const ShopkeeperScreen: React.FC<Props> = ({ state, onUpdateState }) => {
  const { households, cardTypes, records, settings, history } = state;
  const lang = settings.language;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHhId, setSelectedHhId] = useState(households[0]?.id || '');

  // Form state
  const [selectedRuleId, setSelectedRuleId] = useState('');
  const [typedQtyStr, setTypedQtyStr] = useState('');
  const [typedAmountStr, setTypedAmountStr] = useState('0');
  const [distDate, setDistDate] = useState(getTodayIso());
  const [distPlace, setDistPlace] = useState<RecordPlace>('home_shop');
  const [sourceNote, setSourceNote] = useState('');
  const [exceedReason, setExceedReason] = useState('');

  // OTP Verification state
  const [formError, setFormError] = useState<string | null>(null);
  const [otpTargetRecordId, setOtpTargetRecordId] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);

  const filteredHouseholds = households.filter((h) =>
    h.cardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.headName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeHousehold = households.find((h) => h.id === selectedHhId) || households[0];
  const activeCardType = activeHousehold
    ? cardTypes.find((c) => c.id === activeHousehold.cardTypeId) || null
    : null;

  const evaluation = activeHousehold
    ? evaluateHouseholdMonth(
        activeHousehold,
        activeCardType,
        settings.selectedMonth,
        records,
        settings,
        cardTypes
      )
    : null;

  const activeRule = activeCardType?.rules.find((r) => r.id === selectedRuleId) || activeCardType?.rules[0];

  // Calculate remaining entitlement for selected rule
  const itemEval = evaluation?.items.find((i) => i.rule.id === activeRule?.id);
  const remainingGrams = itemEval ? Math.max(0, itemEval.remaining) : 0;
  const typedGrams = parseQtyStringToGrams(typedQtyStr);
  const isExceeding = activeRule && !activeRule.stockDependent && typedGrams > remainingGrams;

  // Expected price for typed quantity
  const expectedPaiseForTyped = activeRule
    ? computeExpectedPricePaise(activeRule.pricePaise, typedGrams)
    : 0;

  // Handle quantity input change: auto-calculate expected amount charged
  const handleQtyChange = (val: string) => {
    setTypedQtyStr(val);
    if (activeRule) {
      const g = parseQtyStringToGrams(val);
      const paise = computeExpectedPricePaise(activeRule.pricePaise, g);
      setTypedAmountStr(formatPaiseToRupeesString(paise));
    }
  };

  // Submit Distribution Record
  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!activeHousehold || !activeRule) return;

    if (typedGrams <= 0) {
      setFormError('Please enter a valid positive quantity.');
      return;
    }

    if (isExceeding && !exceedReason.trim()) {
      setFormError('A factual reason is required when distributing above remaining entitlement.');
      return;
    }

    // Fixed OTP 0000 for all records as requested
    const fixedOtp = '0000';
    const newRecordId = `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const newRecord: RationRecord = {
      id: newRecordId,
      householdId: activeHousehold.id,
      month: settings.selectedMonth,
      item: activeRule.itemKey,
      qty: typedGrams,
      date: distDate,
      sourceType: 'shop_entry',
      sourceText: sourceNote.trim() || `FPS Counter entry at ${settings.shopName}`,
      sourceRef: `FPS-${settings.shopName}-${Date.now().toString().slice(-4)}`,
      amountPaise: parseRupeesStringToPaise(typedAmountStr),
      status: 'Pending',
      origin: 'shop',
      enteredByRole: 'Shopkeeper',
      enteredByName: `Shopkeeper (${settings.shopName})`,
      enteredAt: new Date().toISOString(),
      confirmedBy: null,
      confirmedAt: null,
      disputeNote: '',
      exceedNote: isExceeding ? exceedReason.trim() : '',
      place: distPlace,
      otpCode: fixedOtp,
      otpAttempts: 0,
      parserEngine: 'none',
    };

    const prevHash = history.length > 0 ? history[history.length - 1].hash : 'GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000';
    const histEntry = await createHistoryEntry(
      prevHash,
      'shopkeeper',
      'create_record',
      newRecordId,
      `Shopkeeper logged entry: ${typedQtyStr} ${activeRule.unit} ${activeRule.itemKey} for card ${activeHousehold.cardNumber} (${activeHousehold.headName})`,
      {
        householdId: activeHousehold.id,
        cardNumber: activeHousehold.cardNumber,
        headName: activeHousehold.headName,
        shopName: settings.shopName,
      }
    );

    onUpdateState({
      ...state,
      records: [newRecord, ...records],
      history: [...history, histEntry],
    });

    // Reset form fields
    setTypedQtyStr('');
    setTypedAmountStr('0');
    setSourceNote('');
    setExceedReason('');
    setFormError(null);
  };

  // OTP Verification by shopkeeper
  const handleVerifyOtp = async (record: RationRecord) => {
    setOtpError(null);
    setOtpSuccess(null);

    // Accepts 0000 always as requested by user
    if (otpInput.trim() === '0000' || otpInput.trim() === (record.otpCode || '0000')) {
      // Success: mark Confirmed
      const updatedRecords = records.map((r) => {
        if (r.id === record.id) {
          return {
            ...r,
            status: 'Confirmed' as const,
            confirmedBy: 'otp' as const,
            confirmedAt: new Date().toISOString(),
          };
        }
        return r;
      });

      const prevHash = history.length > 0 ? history[history.length - 1].hash : 'GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000';
      const histEntry = await createHistoryEntry(
        prevHash,
        'shopkeeper',
        'confirm_otp',
        record.id,
        `Record confirmed via customer OTP verification (0000) for card ${activeHousehold?.cardNumber || record.householdId}`,
        {
          householdId: record.householdId,
          cardNumber: activeHousehold?.cardNumber,
          headName: activeHousehold?.headName,
          shopName: settings.shopName,
        }
      );

      onUpdateState({
        ...state,
        records: updatedRecords,
        history: [...history, histEntry],
      });

      setOtpSuccess(t('shopkeeper.otpSuccess', undefined, lang));
      setOtpTargetRecordId(null);
      setOtpInput('');
    } else {
      // Wrong OTP
      const newAttempts = record.otpAttempts + 1;
      const updatedRecords = records.map((r) => {
        if (r.id === record.id) {
          return {
            ...r,
            otpAttempts: newAttempts,
          };
        }
        return r;
      });

      const prevHash = history.length > 0 ? history[history.length - 1].hash : 'GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000';
      const histEntry = await createHistoryEntry(
        prevHash,
        'shopkeeper',
        'otp_failed',
        record.id,
        `OTP attempt ${newAttempts}/3 failed for record ${record.id}`
      );

      onUpdateState({
        ...state,
        records: updatedRecords,
        history: [...history, histEntry],
      });

      if (newAttempts >= 3) {
        setOtpError(t('shopkeeper.otpLocked', undefined, lang));
      } else {
        setOtpError(t('shopkeeper.otpWrong', { remaining: 3 - newAttempts }, lang));
      }
    }
  };

  const recentHouseholdRecords = records.filter(
    (r) => activeHousehold && r.householdId === activeHousehold.id
  );

  return (
    <div className="space-y-6">
      {/* Search and Select Household */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-700" />
              {t('shopkeeper.title', undefined, lang)} ({settings.shopName})
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {t('shopkeeper.selectCardPrompt', undefined, lang)}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t('shopkeeper.searchCard', undefined, lang)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Household Chips List */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100 max-h-32 overflow-y-auto">
          {filteredHouseholds.map((hh) => {
            const ct = cardTypes.find((c) => c.id === hh.cardTypeId);
            const isSelected = activeHousehold?.id === hh.id;

            return (
              <button
                key={hh.id}
                onClick={() => setSelectedHhId(hh.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 transition ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold ring-1 ring-amber-400'
                    : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {ct && (
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-stone-300 shrink-0"
                    style={{ backgroundColor: ct.colour }}
                  />
                )}
                <span>{hh.cardNumber}</span>
                <span className="text-stone-400">({hh.headName})</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeHousehold && evaluation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Household Rule Lines Summary (Left 1 col) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">{activeHousehold.headName}</h3>
                  <span className="text-xs font-mono text-stone-500">{activeHousehold.cardNumber}</span>
                </div>
                {activeCardType && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 border border-stone-200">
                    {activeCardType.category}
                  </span>
                )}
              </div>

              <div className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                {t('households.membersCountedLabel', {
                  count: evaluation.membersCounted,
                  refDate: formatIsoToDisplay(evaluation.refDate),
                }, lang)}
              </div>

              {/* Items Entitlement & Remaining Breakdown */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                  Current Month Entitlements:
                </span>
                {evaluation.items.map((it) => (
                  <div
                    key={it.rule.id}
                    onClick={() => setSelectedRuleId(it.rule.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                      activeRule?.id === it.rule.id
                        ? 'border-amber-400 bg-amber-50/50 ring-1 ring-amber-300'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex justify-between items-center font-bold text-stone-900 mb-1">
                      <span>{formatItemName(it.rule.itemKey, lang)}</span>
                      <span>
                        Rem: {formatGramsToQtyString(Math.max(0, it.remaining))} {it.rule.unit}
                      </span>
                    </div>
                    <div className="text-stone-500 flex justify-between text-[11px]">
                      <span>Entitled: {formatGramsToQtyString(it.entitled)} {it.rule.unit}</span>
                      <span>Confirmed: {formatGramsToQtyString(it.confirmedTotal)} {it.rule.unit}</span>
                    </div>
                  </div>
                ))}

                {evaluation.stockDependentItems.map((s) => (
                  <div
                    key={s.rule.id}
                    className="p-3 rounded-lg border border-stone-200 bg-stone-50/70 text-xs"
                  >
                    <div className="flex justify-between items-center font-bold text-stone-800">
                      <span>{formatItemName(s.rule.itemKey, lang)}</span>
                      <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-normal">
                        Stock dependent
                      </span>
                    </div>
                    <div className="text-stone-500 text-[11px] mt-1">
                      Entitled: {formatGramsToQtyString(s.entitled)} {s.rule.unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* New Distribution Form & Actions (Right 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <form
              onSubmit={handleCreateRecord}
              className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4"
            >
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                Issue Ration Entry (Record Distribution)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Select Rule / Item */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Commodity / Rule Line
                  </label>
                  <select
                    value={activeRule?.id || ''}
                    onChange={(e) => setSelectedRuleId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    {activeCardType?.rules.map((r) => (
                      <option key={r.id} value={r.id}>
                        {formatItemName(r.itemKey, lang)} (
                        {r.mode === 'PER_MEMBER' ? 'Per member' : 'Per card'}
                        {r.stockDependent ? ' - Stock dependent' : ''})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('shopkeeper.enterQty', { unit: activeRule?.unit || 'kg' }, lang)}
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="e.g. 5 or 20"
                    value={typedQtyStr}
                    onChange={(e) => handleQtyChange(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Amount Charged */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('shopkeeper.enterAmount', undefined, lang)}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={typedAmountStr}
                    onChange={(e) => setTypedAmountStr(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">
                    Expected price: ₹{formatPaiseToRupeesString(expectedPaiseForTyped)}
                  </span>
                </div>

                {/* Distribution Date */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('shopkeeper.enterDate', undefined, lang)}
                  </label>
                  <input
                    type="date"
                    value={distDate}
                    onChange={(e) => setDistDate(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Distribution Location */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('shopkeeper.enterPlace', undefined, lang)}
                  </label>
                  <select
                    value={distPlace}
                    onChange={(e) => setDistPlace(e.target.value as RecordPlace)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="home_shop">{t('shopkeeper.placeHome', undefined, lang)}</option>
                    <option value="other_shop">{t('shopkeeper.placeOther', undefined, lang)}</option>
                    <option value="unknown">{t('shopkeeper.placeUnknown', undefined, lang)}</option>
                  </select>
                </div>

                {/* Reference Note */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('shopkeeper.sourceNote', undefined, lang)}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PoS receipt #4421"
                    value={sourceNote}
                    onChange={(e) => setSourceNote(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Exceed Entitlement Warning & Required Reason */}
              {isExceeding && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {t('shopkeeper.exceedWarning', {
                        remaining: formatGramsToQtyString(remainingGrams),
                        unit: activeRule?.unit || 'kg',
                      }, lang)}
                    </span>
                  </div>
                  <label className="block text-xs font-semibold text-amber-950">
                    {t('shopkeeper.exceedReasonPrompt', undefined, lang)}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Special festival allowance, advance distribution"
                    value={exceedReason}
                    onChange={(e) => setExceedReason(e.target.value)}
                    required
                    className="w-full text-xs p-2 bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer active:scale-95"
                >
                  {t('btn.update', undefined, lang)}
                </button>
              </div>
            </form>

            {/* Recent entries & Demo OTP Verification */}
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-stone-600" />
                  {t('shopkeeper.recentRecords', undefined, lang)}
                </h3>
                <span className="text-xs text-stone-500">
                  {t('shopkeeper.recordCorrectionNote', undefined, lang)}
                </span>
              </div>

              {recentHouseholdRecords.length === 0 ? (
                <p className="text-xs text-stone-500 italic p-4 bg-stone-50 rounded-lg text-center">
                  No distribution entries recorded yet for this household.
                </p>
              ) : (
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-lg overflow-hidden">
                  {recentHouseholdRecords.map((r) => (
                    <div key={r.id} className="p-3.5 hover:bg-stone-50/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">
                            {formatItemName(r.item, lang)} - {formatGramsToQtyString(r.qty)} kg
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === 'Confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'Pending'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-500 block mt-0.5">
                          {formatIsoToDisplay(r.date)} | Ref: {r.sourceRef} | {r.place}
                        </span>
                      </div>

                      {/* OTP Verification Button for Pending Entries */}
                      {r.status === 'Pending' && settings.otpEnabled && (
                        <div className="flex items-center gap-2">
                          {otpTargetRecordId === r.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                maxLength={4}
                                placeholder="0000"
                                value={otpInput}
                                onChange={(e) => setOtpInput(e.target.value)}
                                className="w-24 text-center font-mono font-bold text-xs p-1.5 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500"
                              />
                              <button
                                onClick={() => handleVerifyOtp(r)}
                                className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold"
                              >
                                {t('shopkeeper.verifyOtpBtn', undefined, lang)}
                              </button>
                              <button
                                onClick={() => {
                                  setOtpTargetRecordId(null);
                                  setOtpError(null);
                                }}
                                className="px-2 py-1.5 text-stone-500 hover:text-stone-800 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setOtpTargetRecordId(r.id);
                                setOtpInput('');
                                setOtpError(null);
                              }}
                              className="px-3 py-1.5 border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              {t('shopkeeper.otpVerification', undefined, lang)}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Status messages for OTP */}
              {otpError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}
              {otpSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{otpSuccess}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
