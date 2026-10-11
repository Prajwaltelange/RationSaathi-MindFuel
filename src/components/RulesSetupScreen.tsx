import React, { useState } from 'react';
import { AppState, CardCategory, CardType, Rule, RuleMode, RuleSplit, UnitType } from '../types';
import { getSampleCardTypes } from '../services/demoData';
import {
  formatGramsToQtyString,
  formatPaiseToRupeesString,
  parseQtyStringToGrams,
  parseRupeesStringToPaise,
} from '../services/numberHelpers';
import { formatColourName, formatItemName, t } from '../services/translations';
import { createHistoryEntry } from '../services/historyLog';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Edit2,
  Layers,
  Scale,
  Info,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface Props {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
}

export const RulesSetupScreen: React.FC<Props> = ({ state, onUpdateState }) => {
  const { cardTypes, households, settings, history } = state;
  const lang = settings.language;

  // New or Edit Card Type modal / form state
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardName, setCardName] = useState('');
  const [cardColour, setCardColour] = useState('#FFD400');
  const [cardCategory, setCardCategory] = useState<CardCategory>('PHH');
  const [cardSourceNote, setCardSourceNote] = useState('NFSA 2013 section 3(1)');

  // Rule Line form state
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleItemKey, setRuleItemKey] = useState('Grain');
  const [ruleMode, setRuleMode] = useState<RuleMode>('PER_MEMBER');
  const [ruleQtyStr, setRuleQtyStr] = useState('5');
  const [ruleCapStr, setRuleCapStr] = useState('');
  const [ruleUnit, setRuleUnit] = useState<UnitType>('kg');
  const [ruleStockDep, setRuleStockDep] = useState(false);
  const [rulePriceStr, setRulePriceStr] = useState('0');
  const [rulePriceValidTill, setRulePriceValidTill] = useState('2028-12-31');
  const [ruleNote, setRuleNote] = useState('');
  const [ruleSplits, setRuleSplits] = useState<{ id: string; itemKey: string; qtyStr: string }[]>([]);
  const [splitError, setSplitError] = useState<string | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);

  // Compare card types simulator
  const [compareMembers, setCompareMembers] = useState(4);

  // Pre-load sample card types button
  const handleLoadSampleCardTypes = async () => {
    const samples = getSampleCardTypes();
    const prevHash = history.length > 0 ? history[history.length - 1].hash : 'GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000';
    const histEntry = await createHistoryEntry(
      prevHash,
      settings.role,
      'load_sample_rules',
      'all',
      'Loaded 5 sample card types (AAY, PHH, NPH, White)'
    );

    onUpdateState({
      ...state,
      cardTypes: samples,
      history: [...history, histEntry],
    });
  };

  // Delete card type with household use validation
  const handleDeleteCardType = (cardId: string) => {
    setCardError(null);
    const usingHh = households.find((h) => h.cardTypeId === cardId);
    if (usingHh) {
      setCardError(t('rules.cannotDeleteUsed', { cardNumber: usingHh.cardNumber }, lang));
      return;
    }

    const updated = cardTypes.filter((c) => c.id !== cardId);
    onUpdateState({
      ...state,
      cardTypes: updated,
    });
  };

  // Save Card Type
  const handleSaveCardType = (e: React.FormEvent) => {
    e.preventDefault();
    setCardError(null);
    if (!cardName.trim()) {
      setCardError('Card type name is required.');
      return;
    }

    if (editingCardId) {
      const updated = cardTypes.map((c) => {
        if (c.id === editingCardId) {
          return {
            ...c,
            name: cardName.trim(),
            colour: cardColour,
            category: cardCategory,
            sourceNote: cardSourceNote.trim(),
          };
        }
        return c;
      });
      onUpdateState({ ...state, cardTypes: updated });
    } else {
      const newCard: CardType = {
        id: `ct-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: cardName.trim(),
        colour: cardColour,
        category: cardCategory,
        sourceNote: cardSourceNote.trim(),
        isSample: false,
        rules: [],
      };
      onUpdateState({ ...state, cardTypes: [...cardTypes, newCard] });
    }

    // Reset
    setEditingCardId(null);
    setCardName('');
    setCardColour('#FFD400');
    setCardCategory('PHH');
    setCardSourceNote('');
  };

  // Add a split line to rule form
  const handleAddSplitLine = () => {
    setRuleSplits([
      ...ruleSplits,
      { id: `sp-${Date.now()}-${Math.random()}`, itemKey: 'Rice', qtyStr: '0' },
    ]);
  };

  const handleRemoveSplitLine = (id: string) => {
    setRuleSplits(ruleSplits.filter((s) => s.id !== id));
  };

  // Save Rule line for a specific card
  const handleSaveRuleLine = (cardId: string) => {
    setSplitError(null);
    const parentQtyGrams = parseQtyStringToGrams(ruleQtyStr);
    if (parentQtyGrams <= 0) {
      setSplitError('Rule quantity must be greater than zero.');
      return;
    }

    // Split validation: if splits exist, sum must match rule quantity exactly
    if (ruleSplits.length > 0) {
      const splitTotal = ruleSplits.reduce((acc, s) => acc + parseQtyStringToGrams(s.qtyStr), 0);
      if (splitTotal !== parentQtyGrams) {
        setSplitError(
          t('rules.splitError', {
            splitSum: formatGramsToQtyString(splitTotal),
            ruleQty: formatGramsToQtyString(parentQtyGrams),
            unit: ruleUnit,
          }, lang)
        );
        return;
      }
    }

    const pricePaise = rulePriceStr ? parseRupeesStringToPaise(rulePriceStr) : null;
    const capGrams = ruleMode === 'PER_MEMBER_CAP' && ruleCapStr ? parseQtyStringToGrams(ruleCapStr) : null;

    const formattedSplits: RuleSplit[] = ruleSplits.map((s) => ({
      id: s.id,
      itemKey: s.itemKey,
      qty: parseQtyStringToGrams(s.qtyStr),
    }));

    const targetCard = cardTypes.find((c) => c.id === cardId);
    if (!targetCard) return;

    let updatedRules: Rule[] = [];
    if (editingRuleId) {
      updatedRules = targetCard.rules.map((r) => {
        if (r.id === editingRuleId) {
          return {
            ...r,
            itemKey: ruleItemKey,
            mode: ruleMode,
            qty: parentQtyGrams,
            cap: capGrams,
            unit: ruleUnit,
            stockDependent: ruleStockDep,
            pricePaise,
            priceValidTill: rulePriceValidTill || null,
            splits: formattedSplits,
            note: ruleNote.trim(),
          };
        }
        return r;
      });
    } else {
      const newRule: Rule = {
        id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        itemKey: ruleItemKey,
        mode: ruleMode,
        qty: parentQtyGrams,
        cap: capGrams,
        unit: ruleUnit,
        period: 'monthly',
        stockDependent: ruleStockDep,
        pricePaise,
        priceValidTill: rulePriceValidTill || null,
        splits: formattedSplits,
        note: ruleNote.trim(),
      };
      updatedRules = [...targetCard.rules, newRule];
    }

    const updatedCardTypes = cardTypes.map((c) =>
      c.id === cardId ? { ...c, rules: updatedRules } : c
    );

    onUpdateState({ ...state, cardTypes: updatedCardTypes });

    // Reset rule form
    setEditingRuleId(null);
    setRuleSplits([]);
    setRuleQtyStr('5');
    setRuleCapStr('');
    setRulePriceStr('0');
    setRuleNote('');
  };

  const handleDeleteRuleLine = (cardId: string, ruleId: string) => {
    const updatedCardTypes = cardTypes.map((c) => {
      if (c.id === cardId) {
        return { ...c, rules: c.rules.filter((r) => r.id !== ruleId) };
      }
      return c;
    });
    onUpdateState({ ...state, cardTypes: updatedCardTypes });
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">{t('rules.disclaimer', undefined, lang)}</span>
          <span className="text-[11px] text-amber-800 mt-1 block">
            {t('rules.priceNote', undefined, lang)}
          </span>
        </div>
      </div>

      {/* Card Error Banner */}
      {cardError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{cardError}</span>
          </div>
          <button
            onClick={() => setCardError(null)}
            className="text-stone-400 hover:text-stone-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header & Load Samples */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-700" />
            {t('rules.title', undefined, lang)}
          </h2>
          <span className="text-xs text-stone-500">
            Configure ration card types, categories, and per-member / per-card allocation equations.
          </span>
        </div>

        <button
          onClick={handleLoadSampleCardTypes}
          className="px-4 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
          {t('btn.loadSampleRules', undefined, lang)}
        </button>
      </div>

      {/* Card Types List */}
      <div className="space-y-6">
        {cardTypes.map((card) => {
          const isAddingRule = editingCardId === `add-rule-${card.id}`;

          return (
            <div
              key={card.id}
              className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs space-y-4 p-5"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div className="flex items-center gap-3">
                  <span
                    className="w-5 h-5 rounded-full border border-stone-300 shadow-2xs shrink-0"
                    style={{ backgroundColor: card.colour }}
                  />
                  <div>
                    <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                      {card.name}
                      {card.isSample && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-md">
                          SAMPLE
                        </span>
                      )}
                    </h3>
                    <span className="text-xs text-stone-500 block">
                      Category: <strong>{card.category}</strong> | Source: {card.sourceNote || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingCardId(`add-rule-${card.id}`);
                      setEditingRuleId(null);
                      setRuleSplits([]);
                    }}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Rule
                  </button>
                  <button
                    onClick={() => handleDeleteCardType(card.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-md transition"
                    title="Delete Card Type"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rules List */}
              {card.rules.length === 0 ? (
                <div className="text-xs text-stone-500 italic p-3 bg-stone-50 rounded-lg">
                  No entitlement rules defined for this card type (Entitlement is 0).
                </div>
              ) : (
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-lg overflow-hidden">
                  {card.rules.map((rule) => (
                    <div key={rule.id} className="p-3.5 hover:bg-stone-50/50 text-xs flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">
                            {formatItemName(rule.itemKey, lang)} - {formatGramsToQtyString(rule.qty)} {rule.unit}
                          </span>
                          <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                            {rule.mode === 'PER_MEMBER'
                              ? t('mode.PER_MEMBER', undefined, lang)
                              : rule.mode === 'PER_CARD'
                              ? t('mode.PER_CARD', undefined, lang)
                              : t('mode.PER_MEMBER_CAP', undefined, lang)}
                          </span>
                          {rule.stockDependent && (
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                              Stock dependent
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-stone-500 flex flex-wrap gap-x-4">
                          <span>
                            Price:{' '}
                            {rule.pricePaise !== null
                              ? `₹${formatPaiseToRupeesString(rule.pricePaise)} / ${rule.unit}`
                              : 'Free'}
                          </span>
                          {rule.priceValidTill && <span>Valid till: {rule.priceValidTill}</span>}
                          {rule.note && <span className="italic">{rule.note}</span>}
                        </div>

                        {/* Splits */}
                        {rule.splits.length > 0 && (
                          <div className="text-[11px] text-amber-900 font-medium pt-1">
                            Grain splits:{' '}
                            {rule.splits.map((s) => `${formatItemName(s.itemKey, lang)} ${formatGramsToQtyString(s.qty)} ${rule.unit}`).join(' + ')}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteRuleLine(card.id, rule.id)}
                        className="text-stone-400 hover:text-red-600 p-1"
                        title="Delete Rule Line"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Rule Line inline form */}
              {isAddingRule && (
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Add Entitlement Rule Line for {card.name}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Item</label>
                      <select
                        value={ruleItemKey}
                        onChange={(e) => setRuleItemKey(e.target.value)}
                        className="w-full p-2 bg-white border border-stone-300 rounded-md font-medium"
                      >
                        <option value="Grain">{formatItemName('Grain', lang)}</option>
                        <option value="Rice">{formatItemName('Rice', lang)}</option>
                        <option value="Wheat">{formatItemName('Wheat', lang)}</option>
                        <option value="Sugar">{formatItemName('Sugar', lang)}</option>
                        <option value="Dal">{formatItemName('Dal', lang)}</option>
                        <option value="Oil">{formatItemName('Oil', lang)}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Calculation Mode</label>
                      <select
                        value={ruleMode}
                        onChange={(e) => setRuleMode(e.target.value as RuleMode)}
                        className="w-full p-2 bg-white border border-stone-300 rounded-md"
                      >
                        <option value="PER_MEMBER">{t('mode.PER_MEMBER', undefined, lang)}</option>
                        <option value="PER_CARD">{t('mode.PER_CARD', undefined, lang)}</option>
                        <option value="PER_MEMBER_CAP">{t('mode.PER_MEMBER_CAP', undefined, lang)}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={ruleQtyStr}
                        onChange={(e) => setRuleQtyStr(e.target.value)}
                        className="w-full p-2 bg-white border border-stone-300 rounded-md font-bold"
                      />
                    </div>

                    {ruleMode === 'PER_MEMBER_CAP' && (
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Cap Limit</label>
                        <input
                          type="number"
                          step="0.001"
                          placeholder="e.g. 35"
                          value={ruleCapStr}
                          onChange={(e) => setRuleCapStr(e.target.value)}
                          className="w-full p-2 bg-white border border-stone-300 rounded-md"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Price per unit (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0 for free"
                        value={rulePriceStr}
                        onChange={(e) => setRulePriceStr(e.target.value)}
                        className="w-full p-2 bg-white border border-stone-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Price Valid Till</label>
                      <input
                        type="date"
                        value={rulePriceValidTill}
                        onChange={(e) => setRulePriceValidTill(e.target.value)}
                        className="w-full p-2 bg-white border border-stone-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`stock-${card.id}`}
                      checked={ruleStockDep}
                      onChange={(e) => setRuleStockDep(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-stone-300"
                    />
                    <label htmlFor={`stock-${card.id}`} className="text-xs font-semibold text-stone-700 cursor-pointer">
                      {t('rules.stockDependentLabel', undefined, lang)} ({t('rules.stockDependentDesc', undefined, lang)})
                    </label>
                  </div>

                  {/* Splits builder */}
                  <div className="space-y-2 pt-2 border-t border-stone-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-stone-800">
                        {t('rules.splits', undefined, lang)}
                      </span>
                      <button
                        type="button"
                        onClick={handleAddSplitLine}
                        className="text-xs text-amber-700 font-semibold hover:underline"
                      >
                        + Add Split Item
                      </button>
                    </div>

                    {ruleSplits.map((split, sIdx) => (
                      <div key={split.id} className="flex items-center gap-2">
                        <select
                          value={split.itemKey}
                          onChange={(e) => {
                            const updated = [...ruleSplits];
                            updated[sIdx].itemKey = e.target.value;
                            setRuleSplits(updated);
                          }}
                          className="text-xs p-1.5 bg-white border border-stone-300 rounded-md"
                        >
                          <option value="Rice">{formatItemName('Rice', lang)}</option>
                          <option value="Wheat">{formatItemName('Wheat', lang)}</option>
                          <option value="Sugar">{formatItemName('Sugar', lang)}</option>
                        </select>
                        <input
                          type="number"
                          step="0.001"
                          placeholder="Split qty"
                          value={split.qtyStr}
                          onChange={(e) => {
                            const updated = [...ruleSplits];
                            updated[sIdx].qtyStr = e.target.value;
                            setRuleSplits(updated);
                          }}
                          className="w-24 text-xs p-1.5 bg-white border border-stone-300 rounded-md font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSplitLine(split.id)}
                          className="text-stone-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {splitError && (
                      <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-md">
                        {splitError}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingCardId(null)}
                      className="px-3 py-1.5 border border-stone-300 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveRuleLine(card.id)}
                      className="px-4 py-1.5 bg-stone-900 hover:bg-black text-white rounded-lg text-xs font-semibold"
                    >
                      Save Rule
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Compare Card Types Tool */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-700" />
            Compare Card Types Entitlement Simulator
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <label className="font-semibold text-stone-600">Simulate Member Count:</label>
            <input
              type="number"
              min="1"
              max="20"
              value={compareMembers}
              onChange={(e) => setCompareMembers(parseInt(e.target.value, 10) || 1)}
              className="w-16 p-1.5 bg-stone-50 border border-stone-300 rounded-md text-center font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cardTypes.map((ct) => (
            <div key={ct.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-stone-900 border-b border-stone-200 pb-2">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-stone-300"
                  style={{ backgroundColor: ct.colour }}
                />
                <span>{ct.name}</span>
                <span className="text-[10px] text-stone-500 font-mono">({ct.category})</span>
              </div>
              <div className="space-y-1 pt-1">
                {ct.rules.length === 0 ? (
                  <span className="text-stone-400 italic">No entitlement rules</span>
                ) : (
                  ct.rules.map((r) => {
                    const entitled =
                      r.mode === 'PER_MEMBER'
                        ? r.qty * compareMembers
                        : r.mode === 'PER_MEMBER_CAP'
                        ? Math.min(r.qty * compareMembers, r.cap || Infinity)
                        : r.qty;

                    return (
                      <div key={r.id} className="flex justify-between items-center text-stone-700">
                        <span>{formatItemName(r.itemKey, lang)}</span>
                        <span className="font-bold text-stone-900">
                          {formatGramsToQtyString(entitled)} {r.unit}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
