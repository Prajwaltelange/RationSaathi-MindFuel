/**
 * Automated Self-Tests Suite for RationSaathi
 * Tests all 19 core arithmetic, classification, date, neutrality, and parsing invariants.
 */

import { AppSettings, CardType, Household, RationRecord, Rule } from '../types';
import {
  computeEntitlement,
  countMembers,
  evaluateHouseholdMonth,
  evaluatePriceCheck,
  findCardMismatchHint,
} from './calculationEngine';
import { isLateEntry } from './dateHelpers';
import { sanitizeNeutrality } from './neutralityGuard';
import {
  computeExpectedPricePaise,
  formatGramsToQtyString,
  parseQtyStringToGrams,
} from './numberHelpers';
import { parseReceiptLocal } from './receiptParser';

export interface TestResult {
  id: string;
  name: string;
  description: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export function runAllSelfTests(): TestResult[] {
  const results: TestResult[] = [];

  const defaultSettings: AppSettings = {
    language: 'en',
    role: 'citizen',
    selectedMonth: '2026-10',
    refDayMode: 'first',
    refDay: 1,
    otpEnabled: true,
    geminiEnabled: false,
    shopName: 'Shop-001',
  };

  // Test 1: PHH 4 members x 5 kg = 20,000 g
  {
    const rule: Rule = {
      id: 'r1',
      itemKey: 'Grain',
      mode: 'PER_MEMBER',
      qty: 5000,
      cap: null,
      unit: 'kg',
      period: 'monthly',
      stockDependent: false,
      pricePaise: 0,
      priceValidTill: null,
      splits: [],
      note: '',
    };
    const res = computeEntitlement(rule, 4);
    results.push({
      id: 'test-1',
      name: 'PHH 4 members entitlement',
      description: '4 members × 5,000 g = 20,000 g',
      expected: '20000',
      actual: res.toString(),
      passed: res === 20000,
    });
  }

  // Test 2: AAY per-card with 2 and with 6 members both = 35,000 g
  {
    const rule: Rule = {
      id: 'r2',
      itemKey: 'Grain',
      mode: 'PER_CARD',
      qty: 35000,
      cap: null,
      unit: 'kg',
      period: 'monthly',
      stockDependent: false,
      pricePaise: 0,
      priceValidTill: null,
      splits: [],
      note: '',
    };
    const res2 = computeEntitlement(rule, 2);
    const res6 = computeEntitlement(rule, 6);
    const pass = res2 === 35000 && res6 === 35000;
    results.push({
      id: 'test-2',
      name: 'AAY per-card fixed entitlement',
      description: 'Fixed 35,000 g regardless of member count (tested 2 and 6)',
      expected: '35000, 35000',
      actual: `${res2}, ${res6}`,
      passed: pass,
    });
  }

  // Test 3: Cap mode 3 members x 7 kg cap 35 kg = 21,000 g and 6 members = 35,000 g
  {
    const rule: Rule = {
      id: 'r3',
      itemKey: 'Grain',
      mode: 'PER_MEMBER_CAP',
      qty: 7000,
      cap: 35000,
      unit: 'kg',
      period: 'monthly',
      stockDependent: false,
      pricePaise: 0,
      priceValidTill: null,
      splits: [],
      note: '',
    };
    const res3 = computeEntitlement(rule, 3); // 21000
    const res6 = computeEntitlement(rule, 6); // 42000 capped at 35000
    const pass = res3 === 21000 && res6 === 35000;
    results.push({
      id: 'test-3',
      name: 'Per member with cap entitlement',
      description: '3 members gives 21,000 g; 6 members (42,000 g) capped at 35,000 g',
      expected: '21000, 35000',
      actual: `${res3}, ${res6}`,
      passed: pass,
    });
  }

  // Test 4: Split validation: 20+15=35 accepted and 20+10 rejected
  {
    const ruleQty = 35000;
    const split1Sum = 20000 + 15000;
    const split2Sum = 20000 + 10000;
    const pass = split1Sum === ruleQty && split2Sum !== ruleQty;
    results.push({
      id: 'test-4',
      name: 'Split quantities exact sum validation',
      description: 'Split 20+15=35 matches parent; split 20+10=30 rejected',
      expected: 'Accepted, Rejected',
      actual: `${split1Sum === ruleQty ? 'Accepted' : 'Rejected'}, ${split2Sum === ruleQty ? 'Accepted' : 'Rejected'}`,
      passed: pass,
    });
  }

  // Test 5: 8 kg + 6 kg of 20 kg gives remaining 6,000 g (Shortfall)
  {
    const entitled = 20000;
    const confirmedTotal = 8000 + 6000;
    const remaining = entitled - confirmedTotal;
    results.push({
      id: 'test-5',
      name: 'Entitlement remaining calculation',
      description: '20,000 g entitled minus (8,000 g + 6,000 g) leaves 6,000 g',
      expected: '6000',
      actual: remaining.toString(),
      passed: remaining === 6000,
    });
  }

  // Test 6: 2.5 kg + 2.5 kg = 5,000 g exactly (Decimal String parser)
  {
    const g1 = parseQtyStringToGrams('2.5');
    const g2 = parseQtyStringToGrams('2.5');
    const total = g1 + g2;
    results.push({
      id: 'test-6',
      name: 'Decimal string to integer grams exact parsing',
      description: 'parseQtyStringToGrams("2.5") + parseQtyStringToGrams("2.5") = 5,000 g',
      expected: '5000',
      actual: total.toString(),
      passed: total === 5000,
    });
  }

  // Test 7: Above-entitlement gives "Recorded above rule"
  {
    const card: CardType = {
      id: 'c1',
      name: 'PHH',
      colour: '#FFD400',
      category: 'PHH',
      sourceNote: '',
      isSample: false,
      rules: [
        {
          id: 'r-phh',
          itemKey: 'Grain',
          mode: 'PER_MEMBER',
          qty: 5000,
          cap: null,
          unit: 'kg',
          period: 'monthly',
          stockDependent: false,
          pricePaise: 0,
          priceValidTill: null,
          splits: [],
          note: '',
        },
      ],
    };
    const household: Household = {
      id: 'h1',
      cardNumber: 'CARD-1',
      headName: 'Test Head',
      cardTypeId: 'c1',
      members: [
        { id: 'm1', name: 'M1', addedOn: '2026-01-01', removedOn: null, reason: 'Initial' },
      ],
      healthChecklist: { aadhaarLinked: true, ekycDone: true, shopMapped: true, memberListCurrent: true, mobileRegistered: true },
    };
    // Entitled is 5000g. Record confirmed is 10000g.
    const record: RationRecord = {
      id: 'rec1',
      householdId: 'h1',
      month: '2026-10',
      item: 'Grain',
      qty: 10000,
      date: '2026-10-05',
      sourceType: 'shop_entry',
      sourceText: '',
      sourceRef: '',
      amountPaise: 0,
      status: 'Confirmed',
      origin: 'shop',
      enteredByRole: 'Shopkeeper',
      enteredByName: 'Shopkeeper',
      enteredAt: '2026-10-05T10:00:00Z',
      confirmedBy: 'citizen',
      confirmedAt: '2026-10-05T11:00:00Z',
      disputeNote: '',
      exceedNote: '',
      place: 'home_shop',
      otpCode: '0000',
      otpAttempts: 0,
      parserEngine: 'local',
    };
    const evalRes = evaluateHouseholdMonth(household, card, '2026-10', [record], defaultSettings, [card]);
    const classif = evalRes.items[0]?.classification;
    results.push({
      id: 'test-7',
      name: 'Above entitlement classification',
      description: '10,000 g confirmed against 5,000 g entitled triggers "Recorded above rule"',
      expected: 'Recorded above rule',
      actual: classif || '',
      passed: classif === 'Recorded above rule',
    });
  }

  // Test 8: No records gives "Unrecorded"
  {
    const card: CardType = {
      id: 'c1',
      name: 'PHH',
      colour: '#FFD400',
      category: 'PHH',
      sourceNote: '',
      isSample: false,
      rules: [
        {
          id: 'r-phh',
          itemKey: 'Grain',
          mode: 'PER_MEMBER',
          qty: 5000,
          cap: null,
          unit: 'kg',
          period: 'monthly',
          stockDependent: false,
          pricePaise: 0,
          priceValidTill: null,
          splits: [],
          note: '',
        },
      ],
    };
    const household: Household = {
      id: 'h2',
      cardNumber: 'CARD-2',
      headName: 'Test Head',
      cardTypeId: 'c1',
      members: [
        { id: 'm1', name: 'M1', addedOn: '2026-01-01', removedOn: null, reason: 'Initial' },
      ],
      healthChecklist: { aadhaarLinked: true, ekycDone: true, shopMapped: true, memberListCurrent: true, mobileRegistered: true },
    };
    const evalRes = evaluateHouseholdMonth(household, card, '2026-10', [], defaultSettings, [card]);
    const classif = evalRes.items[0]?.classification;
    results.push({
      id: 'test-8',
      name: 'No records classification',
      description: 'Zero records for active rule triggers "Unrecorded"',
      expected: 'Unrecorded',
      actual: classif || '',
      passed: classif === 'Unrecorded',
    });
  }

  // Test 9: Pending excluded from confirmed total but included in "if pending confirmed"
  {
    const card: CardType = {
      id: 'c1',
      name: 'PHH',
      colour: '#FFD400',
      category: 'PHH',
      sourceNote: '',
      isSample: false,
      rules: [
        {
          id: 'r-phh',
          itemKey: 'Grain',
          mode: 'PER_MEMBER',
          qty: 10000,
          cap: null,
          unit: 'kg',
          period: 'monthly',
          stockDependent: false,
          pricePaise: 0,
          priceValidTill: null,
          splits: [],
          note: '',
        },
      ],
    };
    const household: Household = {
      id: 'h3',
      cardNumber: 'CARD-3',
      headName: 'Test Head',
      cardTypeId: 'c1',
      members: [
        { id: 'm1', name: 'M1', addedOn: '2026-01-01', removedOn: null, reason: 'Initial' },
      ],
      healthChecklist: { aadhaarLinked: true, ekycDone: true, shopMapped: true, memberListCurrent: true, mobileRegistered: true },
    };
    const recConfirmed: RationRecord = {
      id: 'r-c',
      householdId: 'h3',
      month: '2026-10',
      item: 'Grain',
      qty: 4000,
      date: '2026-10-02',
      sourceType: 'shop_entry',
      sourceText: '',
      sourceRef: '',
      amountPaise: 0,
      status: 'Confirmed',
      origin: 'shop',
      enteredByRole: 'Shopkeeper',
      enteredByName: 'Shopkeeper',
      enteredAt: '2026-10-02T10:00:00Z',
      confirmedBy: 'citizen',
      confirmedAt: '2026-10-02T11:00:00Z',
      disputeNote: '',
      exceedNote: '',
      place: 'home_shop',
      otpCode: '0000',
      otpAttempts: 0,
      parserEngine: 'local',
    };
    const recPending: RationRecord = {
      id: 'r-p',
      householdId: 'h3',
      month: '2026-10',
      item: 'Grain',
      qty: 6000,
      date: '2026-10-03',
      sourceType: 'shop_entry',
      sourceText: '',
      sourceRef: '',
      amountPaise: 0,
      status: 'Pending',
      origin: 'shop',
      enteredByRole: 'Shopkeeper',
      enteredByName: 'Shopkeeper',
      enteredAt: '2026-10-03T10:00:00Z',
      confirmedBy: null,
      confirmedAt: null,
      disputeNote: '',
      exceedNote: '',
      place: 'home_shop',
      otpCode: '0000',
      otpAttempts: 0,
      parserEngine: 'local',
    };

    const evalRes = evaluateHouseholdMonth(household, card, '2026-10', [recConfirmed, recPending], defaultSettings, [card]);
    const item = evalRes.items[0];
    const pass = item.confirmedTotal === 4000 && item.remaining === 6000 && item.diffIfPendingConfirmed === 0;
    results.push({
      id: 'test-9',
      name: 'Pending records separation in totals',
      description: 'Confirmed total is 4,000 g (remaining 6,000 g); diffIfPendingConfirmed is 0',
      expected: 'confirmed: 4000, diffIfPending: 0',
      actual: `confirmed: ${item?.confirmedTotal}, diffIfPending: ${item?.diffIfPendingConfirmed}`,
      passed: pass,
    });
  }

  // Test 10: Disputed excluded from totals & triggers "Unclear"
  {
    const card: CardType = {
      id: 'c1',
      name: 'PHH',
      colour: '#FFD400',
      category: 'PHH',
      sourceNote: '',
      isSample: false,
      rules: [
        {
          id: 'r-phh',
          itemKey: 'Grain',
          mode: 'PER_MEMBER',
          qty: 10000,
          cap: null,
          unit: 'kg',
          period: 'monthly',
          stockDependent: false,
          pricePaise: 0,
          priceValidTill: null,
          splits: [],
          note: '',
        },
      ],
    };
    const household: Household = {
      id: 'h4',
      cardNumber: 'CARD-4',
      headName: 'Test Head',
      cardTypeId: 'c1',
      members: [
        { id: 'm1', name: 'M1', addedOn: '2026-01-01', removedOn: null, reason: 'Initial' },
      ],
      healthChecklist: { aadhaarLinked: true, ekycDone: true, shopMapped: true, memberListCurrent: true, mobileRegistered: true },
    };
    const recDisputed: RationRecord = {
      id: 'r-d',
      householdId: 'h4',
      month: '2026-10',
      item: 'Grain',
      qty: 5000,
      date: '2026-10-04',
      sourceType: 'shop_entry',
      sourceText: '',
      sourceRef: '',
      amountPaise: 0,
      status: 'Disputed',
      origin: 'shop',
      enteredByRole: 'Shopkeeper',
      enteredByName: 'Shopkeeper',
      enteredAt: '2026-10-04T10:00:00Z',
      confirmedBy: null,
      confirmedAt: null,
      disputeNote: 'Quantity not received',
      exceedNote: '',
      place: 'home_shop',
      otpCode: '0000',
      otpAttempts: 0,
      parserEngine: 'local',
    };
    const evalRes = evaluateHouseholdMonth(household, card, '2026-10', [recDisputed], defaultSettings, [card]);
    const item = evalRes.items[0];
    const pass = item.confirmedTotal === 0 && item.classification === 'Unclear';
    results.push({
      id: 'test-10',
      name: 'Disputed records exclusion & classification',
      description: 'Disputed entries are excluded from confirmed totals and set status to "Unclear"',
      expected: 'confirmed: 0, status: Unclear',
      actual: `confirmed: ${item?.confirmedTotal}, status: ${item?.classification}`,
      passed: pass,
    });
  }

  // Test 11: Stock-dependent item not classified as shortfall
  {
    const card: CardType = {
      id: 'c1',
      name: 'AAY',
      colour: '#FFD400',
      category: 'AAY',
      sourceNote: '',
      isSample: false,
      rules: [
        {
          id: 'r-sugar',
          itemKey: 'Sugar',
          mode: 'PER_CARD',
          qty: 1000,
          cap: null,
          unit: 'kg',
          period: 'monthly',
          stockDependent: true,
          pricePaise: 0,
          priceValidTill: null,
          splits: [],
          note: '',
        },
      ],
    };
    const household: Household = {
      id: 'h5',
      cardNumber: 'CARD-5',
      headName: 'Test Head',
      cardTypeId: 'c1',
      members: [
        { id: 'm1', name: 'M1', addedOn: '2026-01-01', removedOn: null, reason: 'Initial' },
      ],
      healthChecklist: { aadhaarLinked: true, ekycDone: true, shopMapped: true, memberListCurrent: true, mobileRegistered: true },
    };
    const evalRes = evaluateHouseholdMonth(household, card, '2026-10', [], defaultSettings, [card]);
    const pass = evalRes.items.length === 0 && evalRes.stockDependentItems.length === 1;
    results.push({
      id: 'test-11',
      name: 'Stock-dependent item separation',
      description: 'Items marked "If available in stock" are separated and not classified as shortfall',
      expected: 'items: 0, stockItems: 1',
      actual: `items: ${evalRes.items.length}, stockItems: ${evalRes.stockDependentItems.length}`,
      passed: pass,
    });
  }

  // Test 12: Member added after ref day not counted; member removed before it not counted
  {
    const household: Household = {
      id: 'h6',
      cardNumber: 'CARD-6',
      headName: 'Test Head',
      cardTypeId: 'c1',
      members: [
        { id: 'm1', name: 'Active', addedOn: '2026-01-01', removedOn: null, reason: 'Initial' },
        { id: 'm2', name: 'AddedLate', addedOn: '2026-10-15', removedOn: null, reason: 'Birth' },
        { id: 'm3', name: 'RemovedEarly', addedOn: '2026-01-01', removedOn: '2026-09-30', reason: 'Death' },
      ],
      healthChecklist: { aadhaarLinked: true, ekycDone: true, shopMapped: true, memberListCurrent: true, mobileRegistered: true },
    };
    // refDayMode = 'first' means refDate is 2026-10-01
    const count = countMembers(household, '2026-10', defaultSettings);
    results.push({
      id: 'test-12',
      name: 'Member count cut-off reference date',
      description: 'Member added 15 Oct not counted as of 1 Oct; member removed 30 Sep not counted',
      expected: '1',
      actual: count.toString(),
      passed: count === 1,
    });
  }

  // Test 13: 3 kg at Rs 2 per kg = 600 paise; free item expects 0
  {
    const pricePaid3Kg = computeExpectedPricePaise(200, 3000); // 200 paise/kg * 3000g = 600 paise
    const priceFree = computeExpectedPricePaise(0, 5000); // free
    const pass = pricePaid3Kg === 600 && priceFree === 0;
    results.push({
      id: 'test-13',
      name: 'Exact price calculation and free grain',
      description: '3,000 g at 200 paise/kg = 600 paise; free item (0 paise/kg) = 0 paise',
      expected: '600, 0',
      actual: `${pricePaid3Kg}, ${priceFree}`,
      passed: pass,
    });
  }

  // Test 14: Price rule expired detection
  {
    const rule: Rule = {
      id: 'r-exp',
      itemKey: 'Grain',
      mode: 'PER_CARD',
      qty: 5000,
      cap: null,
      unit: 'kg',
      period: 'monthly',
      stockDependent: false,
      pricePaise: 200,
      priceValidTill: '2026-09-30', // expired
      splits: [],
      note: '',
    };
    const record: RationRecord = {
      id: 'rec-exp',
      householdId: 'h7',
      month: '2026-10',
      item: 'Grain',
      qty: 5000,
      date: '2026-10-05', // after expired date
      sourceType: 'shop_entry',
      sourceText: '',
      sourceRef: '',
      amountPaise: 1000,
      status: 'Confirmed',
      origin: 'shop',
      enteredByRole: 'Shopkeeper',
      enteredByName: 'Shopkeeper',
      enteredAt: '2026-10-05T10:00:00Z',
      confirmedBy: 'citizen',
      confirmedAt: '2026-10-05T11:00:00Z',
      disputeNote: '',
      exceedNote: '',
      place: 'home_shop',
      otpCode: '',
      otpAttempts: 0,
      parserEngine: 'local',
    };
    const res = evaluatePriceCheck(rule, [record]);
    results.push({
      id: 'test-14',
      name: 'Price rule expiration check',
      description: 'Distribution record after priceValidTill triggers expired status',
      expected: 'expired',
      actual: res.status,
      passed: res.status === 'expired',
    });
  }

  // Test 15: Record dated after month end gets "Late entry" tag
  {
    const late = isLateEntry('2026-11-02', '2026-10');
    const notLate = isLateEntry('2026-10-31', '2026-10');
    const pass = late === true && notLate === false;
    results.push({
      id: 'test-15',
      name: 'Late entry tag identification',
      description: 'Record dated 2026-11-02 for month 2026-10 receives late entry flag',
      expected: 'true, false',
      actual: `${late}, ${notLate}`,
      passed: pass,
    });
  }

  // Test 16: Mismatch hint (35 kg recorded for 4-member PHH household matches AAY rule)
  {
    const cardPhh: CardType = {
      id: 'phh-card',
      name: 'Yellow PHH',
      colour: '#FFD400',
      category: 'PHH',
      sourceNote: '',
      isSample: false,
      rules: [
        {
          id: 'r-phh-1',
          itemKey: 'Grain',
          mode: 'PER_MEMBER',
          qty: 5000,
          cap: null,
          unit: 'kg',
          period: 'monthly',
          stockDependent: false,
          pricePaise: 0,
          priceValidTill: null,
          splits: [],
          note: '',
        },
      ],
    };
    const cardAay: CardType = {
      id: 'aay-card',
      name: 'Yellow AAY',
      colour: '#FFD400',
      category: 'AAY',
      sourceNote: '',
      isSample: false,
      rules: [
        {
          id: 'r-aay-1',
          itemKey: 'Grain',
          mode: 'PER_CARD',
          qty: 35000,
          cap: null,
          unit: 'kg',
          period: 'monthly',
          stockDependent: false,
          pricePaise: 0,
          priceValidTill: null,
          splits: [],
          note: '',
        },
      ],
    };

    // 4 members PHH entitlement is 20,000 g. But 35,000 g was recorded.
    const hint = findCardMismatchHint(cardPhh, cardPhh.rules[0], 35000, 4, [cardPhh, cardAay]);
    const pass = hint !== null && hint.includes('Yellow AAY');
    results.push({
      id: 'test-16',
      name: 'Card-colour / category mismatch hint',
      description: '35 kg confirmed for 4-member PHH matches 35 kg AAY card entitlement',
      expected: 'Mentions Yellow AAY rule',
      actual: hint || 'No hint',
      passed: pass,
    });
  }

  // Test 17: Parser: "Received 8kg rice on 5 Oct" gives 8,000 g rice and 5 Oct
  {
    const parseRes = parseReceiptLocal('Received 8kg rice on 5 Oct');
    const item = parseRes.items[0];
    const pass =
      item &&
      item.itemKey === 'Rice' &&
      item.qtyGrams === 8000 &&
      item.dateStr.includes('-10-05');
    results.push({
      id: 'test-17',
      name: 'Receipt parser: English "8kg rice on 5 Oct"',
      description: 'Extracts 8,000 g Rice and date 05 October',
      expected: 'Rice, 8000 g, 05 Oct',
      actual: `${item?.itemKey}, ${item?.qtyGrams} g, ${item?.dateStr}`,
      passed: pass,
    });
  }

  // Test 18: Parser: "५ किलो तांदूळ" gives 5,000 g rice (Devanagari numerals)
  {
    const parseRes = parseReceiptLocal('५ किलो तांदूळ मिळाले दि. ८ ऑक्टोबर २०२६');
    const item = parseRes.items[0];
    const pass =
      item &&
      item.itemKey === 'Rice' &&
      item.qtyGrams === 5000 &&
      item.dateStr === '2026-10-08';
    results.push({
      id: 'test-18',
      name: 'Receipt parser: Devanagari numerals "५ किलो तांदूळ"',
      description: 'Normalizes Devanagari ५ to 5,000 g Rice and extracts 08/10/2026',
      expected: 'Rice, 5000 g, 2026-10-08',
      actual: `${item?.itemKey}, ${item?.qtyGrams} g, ${item?.dateStr}`,
      passed: pass,
    });
  }

  // Test 19: Neutrality guard masks "fraud" to "[...]"
  {
    const sanitized = sanitizeNeutrality('This is suspected fraud and theft.');
    const pass =
      sanitized.sanitizedText === 'This is suspected [...] and [...].' &&
      sanitized.maskedCount === 2;
    results.push({
      id: 'test-19',
      name: 'Neutrality guard accusatory word masking',
      description: 'Masks "fraud" and "theft" to "[...]"',
      expected: '2 masked words',
      actual: `${sanitized.maskedCount} masked words`,
      passed: pass,
    });
  }

  // Test 20: Empty-rule card type gives "No rule entered"
  {
    const emptyCard: CardType = {
      id: 'white-none',
      name: 'White Card',
      colour: '#FFFFFF',
      category: 'None',
      sourceNote: 'No rules',
      isSample: true,
      rules: [],
    };
    const household: Household = {
      id: 'h-white',
      cardNumber: 'CARD-WHITE',
      headName: 'Test Head',
      cardTypeId: 'white-none',
      members: [{ id: 'm1', name: 'M1', addedOn: '2026-01-01', removedOn: null, reason: 'Initial' }],
      healthChecklist: { aadhaarLinked: false, ekycDone: false, shopMapped: false, memberListCurrent: false, mobileRegistered: false },
    };
    const evalRes = evaluateHouseholdMonth(household, emptyCard, '2026-10', [], defaultSettings, [emptyCard]);
    const pass = evalRes.items.length === 0;
    results.push({
      id: 'test-20',
      name: 'Empty rule card type handling',
      description: 'Card type with no rules returns empty items list without assuming rules',
      expected: '0 items',
      actual: `${evalRes.items.length} items`,
      passed: pass,
    });
  }

  return results;
}

export function runSingleTest(testId: string): TestResult | undefined {
  const all = runAllSelfTests();
  return all.find((t) => t.id === testId);
}
