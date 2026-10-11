import React, { useState } from 'react';
import { AppState, Household, RationRecord } from '../types';
import { evaluateHouseholdMonth } from '../services/calculationEngine';
import { formatIsoToDisplay, formatMonthName, getLastNMonths } from '../services/dateHelpers';
import { formatGramsToQtyString, formatPaiseToRupeesString } from '../services/numberHelpers';
import { formatColourName, formatItemName, t } from '../services/translations';
import { createHistoryEntry } from '../services/historyLog';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Package,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Percent,
} from 'lucide-react';

interface Props {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
}

export const CitizenScreen: React.FC<Props> = ({ state, onUpdateState }) => {
  const { households, cardTypes, records, settings, history } = state;
  const lang = settings.language;

  const [activeHhId, setActiveHhId] = useState<string>(households[0]?.id || '');
  const [disputingRecordId, setDisputingRecordId] = useState<string | null>(null);
  const [disputeNoteInput, setDisputeNoteInput] = useState<string>('');

  const activeHousehold = households.find((h) => h.id === activeHhId) || households[0];
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

  // Handle citizen confirming a pending entry
  const handleConfirmRecord = async (record: RationRecord) => {
    const updatedRecords = records.map((r) => {
      if (r.id === record.id) {
        return {
          ...r,
          status: 'Confirmed' as const,
          confirmedBy: 'citizen' as const,
          confirmedAt: new Date().toISOString(),
        };
      }
      return r;
    });

    const prevHash = history.length > 0 ? history[history.length - 1].hash : 'GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000';
    const histEntry = await createHistoryEntry(
      prevHash,
      'citizen',
      'confirm_record',
      record.id,
      `Citizen confirmed received: ${formatGramsToQtyString(record.qty)} ${record.item} for card ${activeHousehold.cardNumber} (${activeHousehold.headName})`,
      {
        householdId: activeHousehold.id,
        cardNumber: activeHousehold.cardNumber,
        headName: activeHousehold.headName,
        shopName: settings.shopName,
      }
    );

    onUpdateState({
      ...state,
      records: updatedRecords,
      history: [...history, histEntry],
    });
  };

  // Handle citizen disputing a record with a short factual note
  const handleDisputeRecord = async (recordId: string) => {
    if (!disputeNoteInput.trim()) return;

    const updatedRecords = records.map((r) => {
      if (r.id === recordId) {
        return {
          ...r,
          status: 'Disputed' as const,
          disputeNote: disputeNoteInput.trim(),
        };
      }
      return r;
    });

    const prevHash = history.length > 0 ? history[history.length - 1].hash : 'GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000';
    const histEntry = await createHistoryEntry(
      prevHash,
      'citizen',
      'dispute_record',
      recordId,
      `Citizen marked record not correct with note: "${disputeNoteInput.trim()}" for card ${activeHousehold.cardNumber} (${activeHousehold.headName})`,
      {
        householdId: activeHousehold.id,
        cardNumber: activeHousehold.cardNumber,
        headName: activeHousehold.headName,
        shopName: settings.shopName,
      }
    );

    onUpdateState({
      ...state,
      records: updatedRecords,
      history: [...history, histEntry],
    });

    setDisputingRecordId(null);
    setDisputeNoteInput('');
  };

  // Toggle Health Checklist checkboxes
  const handleToggleChecklist = (key: keyof Household['healthChecklist']) => {
    if (!activeHousehold) return;
    const updatedHh: Household = {
      ...activeHousehold,
      healthChecklist: {
        ...activeHousehold.healthChecklist,
        [key]: !activeHousehold.healthChecklist[key],
      },
    };
    const updatedHouseholds = households.map((h) => (h.id === activeHousehold.id ? updatedHh : h));
    onUpdateState({
      ...state,
      households: updatedHouseholds,
    });
  };

  if (!activeHousehold || !evaluation) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-600">
        <p className="text-base font-semibold">No household profiles found.</p>
        <p className="text-sm mt-1 text-stone-500">Add a household in the Households tab or load demo data in Settings.</p>
      </div>
    );
  }

  // Pending records for this household in current month
  const pendingRecords = records.filter(
    (r) => r.householdId === activeHousehold.id && r.month === settings.selectedMonth && r.status === 'Pending'
  );

  // Last 6 months grid data
  const last6Months = getLastNMonths(settings.selectedMonth, 6);

  return (
    <div className="space-y-6">
      {/* Household Selector & Header Card */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
              {t('role.viewingAs', undefined, lang)}:
            </span>
            <select
              value={activeHhId}
              onChange={(e) => setActiveHhId(e.target.value)}
              className="text-sm font-semibold bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-500"
            >
              {households.map((hh) => (
                <option key={hh.id} value={hh.id}>
                  {hh.headName} ({hh.cardNumber})
                </option>
              ))}
            </select>
          </div>

          {activeCardType && (
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-lg text-xs font-medium">
              <span
                className="w-3.5 h-3.5 rounded-full border border-stone-300"
                style={{ backgroundColor: activeCardType.colour }}
              />
              <span className="text-stone-900 font-bold">{activeCardType.name}</span>
              <span className="text-stone-400">|</span>
              <span className="font-semibold text-stone-700">{activeCardType.category}</span>
            </div>
          )}
        </div>

        {/* Member Cutoff Info */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 text-xs">
          <div className="font-semibold text-stone-800">
            {t('households.membersCountedLabel', {
              count: evaluation.membersCounted,
              refDate: formatIsoToDisplay(evaluation.refDate),
            }, lang)}
          </div>
          <div className="text-stone-500 text-[11px]">
            {t('households.refCutoffNote', undefined, lang)}
          </div>
        </div>
      </div>

      {/* Main Entitlement Rule Cards */}
      <div className="space-y-4">
        {evaluation.items.map((it) => {
          const itemName = formatItemName(it.rule.itemKey, lang);
          const entitledQty = formatGramsToQtyString(it.entitled);
          const confirmedQty = formatGramsToQtyString(it.confirmedTotal);
          const pendingQty = formatGramsToQtyString(it.pendingTotal);
          const remainingQty = formatGramsToQtyString(Math.max(0, it.remaining));
          const unit = it.rule.unit;

          // Compute percentage progress for visual progress bar
          const confirmedPercent = it.entitled > 0 ? Math.min(100, Math.round((it.confirmedTotal / it.entitled) * 100)) : 0;
          const pendingPercent = it.entitled > 0 ? Math.min(100 - confirmedPercent, Math.round((it.pendingTotal / it.entitled) * 100)) : 0;

          // Math line formulation
          let mathLine = '';
          if (it.rule.mode === 'PER_MEMBER') {
            mathLine = t('citizen.entitlementMath', {
              members: evaluation.membersCounted,
              rate: formatGramsToQtyString(it.rule.qty),
              unit,
              total: entitledQty,
            }, lang);
          } else if (it.rule.mode === 'PER_CARD') {
            mathLine = t('citizen.entitlementPerCardMath', {
              rate: entitledQty,
              unit,
            }, lang);
          } else {
            mathLine = t('citizen.entitlementCapMath', {
              members: evaluation.membersCounted,
              rate: formatGramsToQtyString(it.rule.qty),
              cap: formatGramsToQtyString(it.rule.cap || 0),
              unit,
              total: entitledQty,
            }, lang);
          }

          return (
            <div
              key={it.rule.id}
              className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-stone-900">{itemName}</h3>
                  <p className="text-xs font-mono font-medium text-amber-800 mt-0.5">{mathLine}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-500 block">Status:</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      it.classification === 'Received in full'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : it.classification === 'Shortfall'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : it.classification === 'Awaiting confirmation'
                        ? 'bg-purple-50 text-purple-800 border-purple-300'
                        : 'bg-stone-100 text-stone-800 border-stone-300'
                    }`}
                  >
                    {it.classification}
                  </span>
                </div>
              </div>

              {/* Progress Bar (solid confirmed, striped pending) */}
              <div className="space-y-1.5">
                <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden flex border border-stone-200">
                  <div
                    style={{ width: `${confirmedPercent}%` }}
                    className="bg-emerald-600 h-full transition-all duration-300"
                    title={`Confirmed: ${confirmedQty} ${unit}`}
                  />
                  <div
                    style={{ width: `${pendingPercent}%` }}
                    className="bg-purple-400 h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.3)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0.3)_75%,transparent_75%,transparent)] bg-[length:12px_12px] transition-all duration-300"
                    title={`Pending: ${pendingQty} ${unit}`}
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-stone-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-emerald-600 rounded-xs inline-block" />
                    <span>
                      {t('citizen.confirmed', undefined, lang)}: <strong>{confirmedQty} {unit}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-purple-400 rounded-xs inline-block" />
                    <span>
                      {t('citizen.pending', undefined, lang)}: <strong>{pendingQty} {unit}</strong>
                    </span>
                  </div>

                  <div>
                    <span>
                      {t('citizen.remaining', undefined, lang)}: <strong>{remainingQty} {unit}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending Entries Awaiting Confirmation */}
      {pendingRecords.length > 0 && (
        <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-purple-950 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-700" />
              {t('citizen.pendingTitle', undefined, lang)}
            </h3>
            <span className="text-xs bg-purple-200 text-purple-900 font-bold px-2 py-0.5 rounded-full">
              {pendingRecords.length}
            </span>
          </div>

          <p className="text-xs text-purple-800">
            {t('citizen.otpInstruction', undefined, lang)}
          </p>

          <div className="space-y-3">
            {pendingRecords.map((rec) => {
              const isDisputing = disputingRecordId === rec.id;

              return (
                <div
                  key={rec.id}
                  className="bg-white rounded-xl border border-purple-200 p-4 shadow-xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-stone-900 text-sm">
                        {formatItemName(rec.item, lang)} - {formatGramsToQtyString(rec.qty)} kg
                      </span>
                      <span className="text-xs text-stone-500 block">
                        Date: {formatIsoToDisplay(rec.date)} | Recorded by: {rec.enteredByName}
                      </span>
                    </div>

                    {settings.otpEnabled && (
                      <div className="bg-amber-50 border border-amber-300 px-3 py-1 rounded-lg text-center">
                        <span className="text-[10px] text-amber-800 font-semibold block uppercase tracking-wider">
                          Demo OTP Code
                        </span>
                        <span className="text-base font-mono font-black text-amber-950 tracking-widest">
                          0000
                        </span>
                      </div>
                    )}
                  </div>

                  {isDisputing ? (
                    <div className="space-y-2 pt-2 border-t border-stone-100">
                      <label className="block text-xs font-medium text-stone-700">
                        {t('citizen.disputePrompt', undefined, lang)}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Received only 10kg instead of 15kg"
                        value={disputeNoteInput}
                        onChange={(e) => setDisputeNoteInput(e.target.value)}
                        className="w-full text-xs p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setDisputingRecordId(null)}
                          className="px-3 py-1.5 border border-stone-300 text-stone-700 rounded-lg text-xs font-semibold hover:bg-stone-50"
                        >
                          {t('btn.cancel', undefined, lang)}
                        </button>
                        <button
                          onClick={() => handleDisputeRecord(rec.id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
                        >
                          Submit Factual Note
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 justify-end pt-2 border-t border-stone-100">
                      <button
                        onClick={() => {
                          setDisputingRecordId(rec.id);
                          setDisputeNoteInput('');
                        }}
                        className="px-3 py-1.5 border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-semibold transition"
                      >
                        {t('btn.notCorrect', undefined, lang)}
                      </button>
                      <button
                        onClick={() => handleConfirmRecord(rec)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t('btn.confirm', undefined, lang)}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6-Month Grid */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <Percent className="w-4 h-4 text-stone-600" />
          {t('citizen.historyGridTitle', undefined, lang)}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="py-2 px-3 font-semibold">Item</th>
                {last6Months.map((m) => (
                  <th key={m} className="py-2 px-3 font-semibold text-center">
                    {formatMonthName(m, lang).split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {evaluation.items.map((it) => {
                const itemName = formatItemName(it.rule.itemKey, lang);

                return (
                  <tr key={it.rule.id}>
                    <td className="py-2.5 px-3 font-bold text-stone-800">{itemName}</td>
                    {last6Months.map((m) => {
                      // Evaluate this specific month
                      const mEval = evaluateHouseholdMonth(
                        activeHousehold,
                        activeCardType,
                        m,
                        records,
                        settings,
                        cardTypes
                      );
                      const mItem = mEval.items.find((x) => x.rule.id === it.rule.id);
                      const status = mItem ? mItem.classification : 'Unrecorded';

                      let badgeClass = 'bg-stone-100 text-stone-600';
                      let label = 'None';
                      if (status === 'Received in full') {
                        badgeClass = 'bg-emerald-100 text-emerald-800';
                        label = 'Full';
                      } else if (status === 'Shortfall') {
                        badgeClass = 'bg-amber-100 text-amber-800';
                        label = 'Partial';
                      } else if (status === 'Awaiting confirmation') {
                        badgeClass = 'bg-purple-100 text-purple-800';
                        label = 'Awaiting';
                      } else if (status === 'Unclear') {
                        badgeClass = 'bg-red-100 text-red-800';
                        label = 'Unclear';
                      }

                      return (
                        <td key={m} className="py-2.5 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${badgeClass}`}>
                            {label}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-stone-500 pt-2 border-t border-stone-100">
          <span className="font-semibold text-stone-700">Legend:</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Full (Received in full)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Partial (Shortfall)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Awaiting (Pending entry)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-300" /> None (Unrecorded)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Unclear (Disputed)
          </span>
        </div>
      </div>

      {/* Price Check Card */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-stone-900">
          {t('citizen.priceCardTitle', undefined, lang)}
        </h3>
        <p className="text-xs text-stone-500">
          Rounding rule: integer paise half-up rounding (pricePaise × grams + 500) / 1000. Free PMGKAY grain expects ₹0.00.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {evaluation.items.map((it) => (
            <div
              key={it.rule.id}
              className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs space-y-1.5"
            >
              <div className="flex justify-between items-center font-bold text-stone-900">
                <span>{formatItemName(it.rule.itemKey, lang)}</span>
                <span>
                  {it.rule.pricePaise !== null
                    ? `₹${formatPaiseToRupeesString(it.rule.pricePaise)} / ${it.rule.unit}`
                    : 'Free (₹0.00)'}
                </span>
              </div>
              <div className="text-stone-600 flex justify-between">
                <span>Expected: ₹{formatPaiseToRupeesString(it.priceCheck.expectedPaise)}</span>
                <span>
                  Recorded Paid:{' '}
                  {it.priceCheck.actualPaise !== null
                    ? `₹${formatPaiseToRupeesString(it.priceCheck.actualPaise)}`
                    : 'Not entered'}
                </span>
              </div>
              <div className="text-[11px] text-stone-700 italic border-t border-stone-200 pt-1">
                {it.priceCheck.message}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stock-Dependent Items (Informational) */}
      {evaluation.stockDependentItems.length > 0 && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
            <Package className="w-4 h-4 text-stone-600" />
            {t('citizen.stockTitle', undefined, lang)}
          </h3>
          <p className="text-xs text-stone-500">
            {t('citizen.stockExplanation', undefined, lang)}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {evaluation.stockDependentItems.map((s) => (
              <div
                key={s.rule.id}
                className="bg-white p-3 rounded-lg border border-stone-200 text-xs flex justify-between items-center"
              >
                <div>
                  <span className="font-bold text-stone-900">{formatItemName(s.rule.itemKey, lang)}</span>
                  <span className="text-stone-500 text-[11px] block">
                    Entitled: {formatGramsToQtyString(s.entitled)} {s.rule.unit}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-stone-800">
                    Received: {formatGramsToQtyString(s.confirmedTotal)} {s.rule.unit}
                  </span>
                  <span className="text-[10px] text-stone-400 block">Stock dependent</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card Health Checklist */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          {t('households.healthChecklistTitle', undefined, lang)}
        </h3>
        <p className="text-xs text-stone-500">
          {t('households.healthNote', undefined, lang)} Unticked items are highlighted in dispute reports.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {[
            { key: 'aadhaarLinked' as const, label: t('households.aadhaarLinked', undefined, lang) },
            { key: 'ekycDone' as const, label: t('households.ekycDone', undefined, lang) },
            { key: 'shopMapped' as const, label: t('households.shopMapped', undefined, lang) },
            { key: 'memberListCurrent' as const, label: t('households.memberListCurrent', undefined, lang) },
            { key: 'mobileRegistered' as const, label: t('households.mobileRegistered', undefined, lang) },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-stone-50 cursor-pointer border border-stone-100"
            >
              <input
                type="checkbox"
                checked={activeHousehold.healthChecklist[key]}
                onChange={() => handleToggleChecklist(key)}
                className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
              />
              <span className={activeHousehold.healthChecklist[key] ? 'text-stone-800 font-medium' : 'text-stone-500'}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
