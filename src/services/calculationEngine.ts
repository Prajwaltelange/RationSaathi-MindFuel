/**
 * RationSaathi Calculation Engine
 * Pure deterministic functions with exact integer base arithmetic.
 * No AI touches any number, total, status, or classification.
 */

import {
  AppSettings,
  CardType,
  EvidenceBadge,
  Household,
  HouseholdMonthlyEvaluation,
  ItemEvaluation,
  PriceCheckResult,
  PrimaryClassification,
  RationRecord,
  Rule,
} from '../types';
import { calculateRefDate, isLateEntry } from './dateHelpers';
import { computeExpectedPricePaise, formatPaiseToRupeesString } from './numberHelpers';

/**
 * Counts active members for a household as of the month's reference cut-off date.
 * A member is counted if addedOn <= refDate AND (removedOn is null/empty OR removedOn > refDate).
 */
export function countMembers(household: Household, month: string, settings: AppSettings): number {
  if (!household || !household.members || household.members.length === 0) {
    return 0;
  }
  const refDate = calculateRefDate(month, settings.refDayMode, settings.refDay);

  let count = 0;
  for (const m of household.members) {
    if (!m.addedOn) continue;
    if (m.addedOn <= refDate) {
      if (!m.removedOn || m.removedOn > refDate) {
        count += 1;
      }
    }
  }
  return count;
}

/**
 * Computes entitlement in base units (grams or ml) for a given rule and member count.
 * PER_MEMBER = qty * members
 * PER_CARD = qty
 * PER_MEMBER_CAP = min(qty * members, cap)
 */
export function computeEntitlement(rule: Rule, membersCounted: number): number {
  if (!rule) return 0;

  if (rule.mode === 'PER_MEMBER') {
    return rule.qty * Math.max(0, membersCounted);
  }

  if (rule.mode === 'PER_CARD') {
    return rule.qty;
  }

  if (rule.mode === 'PER_MEMBER_CAP') {
    const raw = rule.qty * Math.max(0, membersCounted);
    if (rule.cap !== null && rule.cap !== undefined && rule.cap >= 0) {
      return Math.min(raw, rule.cap);
    }
    return raw;
  }

  return 0;
}

/**
 * Computes entitlement for a single split line based on the parent rule mode.
 */
export function computeSplitEntitlement(
  rule: Rule,
  splitQty: number,
  membersCounted: number
): number {
  if (rule.mode === 'PER_MEMBER') {
    return splitQty * Math.max(0, membersCounted);
  }
  if (rule.mode === 'PER_CARD') {
    return splitQty;
  }
  if (rule.mode === 'PER_MEMBER_CAP') {
    // Proportional or direct member scaling
    return splitQty * Math.max(0, membersCounted);
  }
  return splitQty;
}

/**
 * Determines evidence confidence badge for a record
 */
export function getEvidenceBadge(record: RationRecord): EvidenceBadge {
  if (!record) return 'Unclear';
  if (record.sourceType === 'shop_entry') {
    return record.status === 'Confirmed' ? 'Strong' : 'Medium';
  }
  if (record.sourceType === 'receipt_reference') {
    return 'Strong';
  }
  if (record.sourceType === 'receipt_text') {
    return 'Medium';
  }
  if (record.sourceType === 'handwritten_note') {
    return 'Weak';
  }
  return 'Unclear';
}

/**
 * Evaluates price validity and compares recorded amount paid with expected amount.
 */
export function evaluatePriceCheck(
  rule: Rule,
  confirmedRecords: RationRecord[]
): PriceCheckResult {
  if (rule.pricePaise === null || rule.pricePaise === undefined) {
    return {
      status: 'no_price_rule',
      message: 'Price rule not entered.',
      expectedPaise: 0,
      actualPaise: null,
      diffPaise: 0,
    };
  }

  // Check if any record is dated after priceValidTill
  if (rule.priceValidTill) {
    const expiredRecord = confirmedRecords.find(
      (r) => r.date && r.date > rule.priceValidTill!
    );
    if (expiredRecord) {
      return {
        status: 'expired',
        message: 'Price rule expired, please update.',
        expectedPaise: 0,
        actualPaise: null,
        diffPaise: 0,
      };
    }
  }

  // Sum total confirmed grams
  const totalGrams = confirmedRecords.reduce((sum, r) => sum + (r.qty || 0), 0);
  const expectedPaise = computeExpectedPricePaise(rule.pricePaise, totalGrams);

  // If no recorded amounts paid exist in records
  const recordsWithAmount = confirmedRecords.filter(
    (r) => r.amountPaise !== null && r.amountPaise !== undefined
  );
  if (recordsWithAmount.length === 0) {
    if (expectedPaise === 0) {
      return {
        status: 'free_matches',
        message: 'Free item expects ₹0.00.',
        expectedPaise: 0,
        actualPaise: 0,
        diffPaise: 0,
      };
    }
    return {
      status: 'not_recorded',
      message: 'Amount not recorded.',
      expectedPaise,
      actualPaise: null,
      diffPaise: expectedPaise,
    };
  }

  const actualPaise = recordsWithAmount.reduce((sum, r) => sum + (r.amountPaise || 0), 0);
  const diffPaise = actualPaise - expectedPaise;

  if (diffPaise === 0) {
    return {
      status: 'matches',
      message: `Matches expected amount (₹${formatPaiseToRupeesString(expectedPaise)}).`,
      expectedPaise,
      actualPaise,
      diffPaise: 0,
    };
  }

  const diffRupees = formatPaiseToRupeesString(Math.abs(diffPaise));
  return {
    status: 'differs',
    message: `Amount recorded as paid differs from the expected amount by ₹${diffRupees} (cause not determined).`,
    expectedPaise,
    actualPaise,
    diffPaise,
  };
}

/**
 * Checks if recorded total matches entitlement of another card type
 */
export function findCardMismatchHint(
  currentCard: CardType,
  rule: Rule,
  confirmedTotal: number,
  membersCounted: number,
  allCardTypes: CardType[]
): string | null {
  if (confirmedTotal <= 0) return null;
  const currentEntitled = computeEntitlement(rule, membersCounted);
  if (confirmedTotal === currentEntitled) return null;

  for (const otherCard of allCardTypes) {
    if (otherCard.id === currentCard.id) continue;
    const matchRule = otherCard.rules.find((r) => r.itemKey.toLowerCase() === rule.itemKey.toLowerCase());
    if (matchRule) {
      const otherEntitled = computeEntitlement(matchRule, membersCounted);
      if (otherEntitled === confirmedTotal) {
        return `Recorded quantity is consistent with the ${otherCard.name} rule rather than the ${currentCard.name} rule. Please verify the card colour/category on record.`;
      }
    }
  }

  return null;
}

/**
 * Evaluates all items for a household in a specific month
 */
export function evaluateHouseholdMonth(
  household: Household,
  cardType: CardType | null,
  month: string,
  records: RationRecord[],
  settings: AppSettings,
  allCardTypes: CardType[]
): HouseholdMonthlyEvaluation {
  const refDate = calculateRefDate(month, settings.refDayMode, settings.refDay);
  const membersCounted = countMembers(household, month, settings);

  const householdRecords = records.filter(
    (r) => r.householdId === household.id && r.month === month
  );

  const items: ItemEvaluation[] = [];
  const stockDependentItems: ItemEvaluation[] = [];

  if (!cardType || cardType.rules.length === 0) {
    return {
      household,
      cardType,
      month,
      refDate,
      membersCounted,
      items: [],
      stockDependentItems: [],
    };
  }

  for (const rule of cardType.rules) {
    const entitled = computeEntitlement(rule, membersCounted);

    // Collect split item keys
    const matchKeys = [rule.itemKey.toLowerCase(), ...rule.splits.map((s) => s.itemKey.toLowerCase())];

    // Relevant records for this rule or any of its split items
    const relevantRecords = householdRecords.filter((r) =>
      matchKeys.includes((r.item || '').toLowerCase())
    );

    const confirmedRecords = relevantRecords.filter((r) => r.status === 'Confirmed');
    const pendingRecords = relevantRecords.filter((r) => r.status === 'Pending');
    const disputedRecords = relevantRecords.filter((r) => r.status === 'Disputed');

    const confirmedTotal = confirmedRecords.reduce((s, r) => s + (r.qty || 0), 0);
    const pendingTotal = pendingRecords.reduce((s, r) => s + (r.qty || 0), 0);
    const disputedTotal = disputedRecords.reduce((s, r) => s + (r.qty || 0), 0);

    const remaining = entitled - confirmedTotal;
    const diffIfPendingConfirmed = entitled - (confirmedTotal + pendingTotal);

    // Extra tags
    const tags: string[] = [];
    if (relevantRecords.some((r) => isLateEntry(r.date, month))) {
      tags.push('Late entry');
    }
    if (relevantRecords.some((r) => r.place === 'other_shop')) {
      tags.push('Collected at another shop');
    }

    // Classification (strictly in order 1 to 8)
    let classification: PrimaryClassification = 'Shortfall';
    let classificationReason = '';

    if (!cardType || cardType.rules.length === 0) {
      classification = 'No rule entered';
      classificationReason = 'No entitlement rules defined for this card category.';
    } else if (entitled === 0 || membersCounted === 0) {
      classification = 'Unclear';
      classificationReason = 'No members counted or no entitlement under entered rule.';
    } else if (
      disputedRecords.length > 0 ||
      relevantRecords.some((r) => !r.qty || !r.date || r.sourceType === 'none')
    ) {
      classification = 'Unclear';
      classificationReason = 'Contains disputed entries or unverified source records.';
    } else if (relevantRecords.length === 0) {
      classification = 'Unrecorded';
      classificationReason = 'No distribution entries recorded for this item.';
    } else if (confirmedTotal === 0 && pendingTotal > 0) {
      classification = 'Awaiting confirmation';
      classificationReason = 'Entries recorded but awaiting citizen or OTP confirmation.';
    } else if (confirmedTotal === entitled) {
      classification = 'Received in full';
      classificationReason = 'Recorded confirmed quantity exactly matches entitlement.';
    } else if (confirmedTotal > entitled) {
      classification = 'Recorded above rule';
      classificationReason = 'Recorded confirmed quantity exceeds rule entitlement (cause not determined).';
    } else {
      classification = 'Shortfall';
      classificationReason = 'Recorded quantity is below the entitlement under the entered rule.';
    }

    // Split evaluation
    const splitsEvaluation = rule.splits.map((split) => {
      const splitEntitled = computeSplitEntitlement(rule, split.qty, membersCounted);
      const splitConfirmed = confirmedRecords
        .filter((r) => (r.item || '').toLowerCase() === split.itemKey.toLowerCase())
        .reduce((sum, r) => sum + (r.qty || 0), 0);
      const splitPending = pendingRecords
        .filter((r) => (r.item || '').toLowerCase() === split.itemKey.toLowerCase())
        .reduce((sum, r) => sum + (r.qty || 0), 0);
      return {
        split,
        entitled: splitEntitled,
        confirmedTotal: splitConfirmed,
        pendingTotal: splitPending,
        difference: splitEntitled - splitConfirmed,
      };
    });

    const priceCheck = evaluatePriceCheck(rule, confirmedRecords);
    const mismatchHint = findCardMismatchHint(cardType, rule, confirmedTotal, membersCounted, allCardTypes);

    const itemEval: ItemEvaluation = {
      rule,
      entitled,
      confirmedTotal,
      pendingTotal,
      disputedTotal,
      remaining,
      diffIfPendingConfirmed,
      classification,
      classificationReason,
      tags,
      records: relevantRecords,
      pendingRecords,
      disputedRecords,
      priceCheck,
      mismatchHint,
      splitsEvaluation,
    };

    if (rule.stockDependent) {
      stockDependentItems.push(itemEval);
    } else {
      items.push(itemEval);
    }
  }

  return {
    household,
    cardType,
    month,
    refDate,
    membersCounted,
    items,
    stockDependentItems,
  };
}
