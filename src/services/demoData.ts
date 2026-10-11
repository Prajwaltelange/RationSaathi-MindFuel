/**
 * Sample Rules & Demo Data Generators
 * Uses only fictional names and cards. All sample rules are clearly tagged as SAMPLE.
 * Dates are calculated dynamically relative to today's date (this month & last month).
 */

import { AppState, CardType, HistoryEntry, Household, RationRecord } from '../types';
import { getCurrentMonth, getTodayIso } from './dateHelpers';
import { createHistoryEntry } from './historyLog';

export function getSampleCardTypes(): CardType[] {
  const commonSource = 'NFSA 2013 section 3(1); mahafood.gov.in/en/national-food-security-act-2013/';

  return [
    {
      id: 'sample-yellow-aay',
      name: 'Yellow (AAY)',
      colour: '#FFD400',
      category: 'AAY',
      sourceNote: commonSource,
      isSample: true,
      rules: [
        {
          id: 'rule-aay-grain',
          itemKey: 'Grain',
          mode: 'PER_CARD',
          qty: 35000,
          cap: null,
          unit: 'kg',
          period: 'monthly',
          stockDependent: false,
          pricePaise: 0,
          priceValidTill: '2028-12-31',
          splits: [
            { id: 'split-aay-rice', itemKey: 'Rice', qty: 20000 },
            { id: 'split-aay-wheat', itemKey: 'Wheat', qty: 15000 },
          ],
          note: 'SAMPLE: replace with official values. Split not verified for Maharashtra.',
        },
        {
          id: 'rule-aay-sugar',
          itemKey: 'Sugar',
          mode: 'PER_CARD',
          qty: 1000,
          cap: null,
          unit: 'kg',
          period: 'monthly',
          stockDependent: true,
          pricePaise: null,
          priceValidTill: null,
          splits: [],
          note: 'SAMPLE: unverified sample. If available in stock.',
        },
      ],
    },
    {
      id: 'sample-yellow-phh',
      name: 'Yellow (PHH)',
      colour: '#FFD400',
      category: 'PHH',
      sourceNote: commonSource,
      isSample: true,
      rules: [
        {
          id: 'rule-yellow-phh-grain',
          itemKey: 'Grain',
          mode: 'PER_MEMBER',
          qty: 5000,
          cap: null,
          unit: 'kg',
          period: 'monthly',
          stockDependent: false,
          pricePaise: 0,
          priceValidTill: '2028-12-31',
          splits: [],
          note: 'SAMPLE: replace with official values.',
        },
      ],
    },
    {
      id: 'sample-orange-phh',
      name: 'Orange / Saffron केशरी (PHH)',
      colour: '#FF9933',
      category: 'PHH',
      sourceNote: commonSource,
      isSample: true,
      rules: [
        {
          id: 'rule-orange-phh-grain',
          itemKey: 'Grain',
          mode: 'PER_MEMBER',
          qty: 5000,
          cap: null,
          unit: 'kg',
          period: 'monthly',
          stockDependent: false,
          pricePaise: 0,
          priceValidTill: '2028-12-31',
          splits: [],
          note: 'SAMPLE: replace with official values.',
        },
      ],
    },
    {
      id: 'sample-orange-nph',
      name: 'Orange / Saffron (NPH)',
      colour: '#FF9933',
      category: 'NPH',
      sourceNote: commonSource,
      isSample: true,
      rules: [], // NO rules
    },
    {
      id: 'sample-white-none',
      name: 'White (None)',
      colour: '#FFFFFF',
      category: 'None',
      sourceNote: commonSource,
      isSample: true,
      rules: [], // NO rules
    },
  ];
}

export function generateFullDemoData(): {
  cardTypes: CardType[];
  households: Household[];
  records: RationRecord[];
} {
  const cardTypes = getSampleCardTypes();

  const thisMonth = getCurrentMonth();
  const [thisY, thisM] = thisMonth.split('-').map(Number);
  let lastM = thisM - 1;
  let lastY = thisY;
  if (lastM < 1) {
    lastM = 12;
    lastY -= 1;
  }
  const lastMonth = `${lastY}-${String(lastM).padStart(2, '0')}`;
  const today = getTodayIso();

  // Households
  const households: Household[] = [
    {
      id: 'demo-hh-a',
      cardNumber: 'MH-RAT-0012-AAY',
      headName: 'Rameshwar Patil (Fictional)',
      cardTypeId: 'sample-yellow-aay',
      members: [
        { id: 'm-a1', name: 'Rameshwar Patil', addedOn: '2020-01-01', removedOn: null, reason: 'Initial' },
        { id: 'm-a2', name: 'Sunita Patil', addedOn: '2020-01-01', removedOn: null, reason: 'Initial' },
        { id: 'm-a3', name: 'Ajay Patil', addedOn: '2020-01-01', removedOn: null, reason: 'Initial' },
        { id: 'm-a4', name: 'Pooja Patil', addedOn: '2020-01-01', removedOn: null, reason: 'Initial' },
        { id: 'm-a5', name: 'Kavita Patil', addedOn: '2022-04-10', removedOn: null, reason: 'Marriage' },
        { id: 'm-a6', name: 'Aarav Patil', addedOn: '2024-06-15', removedOn: null, reason: 'Birth' },
      ],
      healthChecklist: {
        aadhaarLinked: true,
        ekycDone: true,
        shopMapped: true,
        memberListCurrent: true,
        mobileRegistered: true,
      },
    },
    {
      id: 'demo-hh-b',
      cardNumber: 'MH-RAT-0045-PHH',
      headName: 'Fatima Shaikh (Fictional)',
      cardTypeId: 'sample-yellow-phh',
      members: [
        { id: 'm-b1', name: 'Fatima Shaikh', addedOn: '2021-02-01', removedOn: null, reason: 'Initial' },
        { id: 'm-b2', name: 'Imran Shaikh', addedOn: '2021-02-01', removedOn: null, reason: 'Initial' },
        { id: 'm-b3', name: 'Zoya Shaikh', addedOn: '2021-02-01', removedOn: null, reason: 'Initial' },
        { id: 'm-b4', name: 'Rehan Shaikh', addedOn: '2023-01-15', removedOn: null, reason: 'Birth' },
      ],
      healthChecklist: {
        aadhaarLinked: true,
        ekycDone: true,
        shopMapped: false, // Unticked to show in "Items to verify"
        memberListCurrent: true,
        mobileRegistered: true,
      },
    },
    {
      id: 'demo-hh-c',
      cardNumber: 'MH-RAT-0078-PHH',
      headName: 'Santosh Kamble (Fictional)',
      cardTypeId: 'sample-orange-phh',
      members: [
        { id: 'm-c1', name: 'Santosh Kamble', addedOn: '2019-05-01', removedOn: null, reason: 'Initial' },
        { id: 'm-c2', name: 'Meena Kamble', addedOn: '2019-05-01', removedOn: null, reason: 'Initial' },
        { id: 'm-c3', name: 'Deepak Kamble', addedOn: '2019-05-01', removedOn: null, reason: 'Initial' },
      ],
      healthChecklist: {
        aadhaarLinked: true,
        ekycDone: true,
        shopMapped: true,
        memberListCurrent: true,
        mobileRegistered: true,
      },
    },
    {
      id: 'demo-hh-d',
      cardNumber: 'MH-RAT-0099-PHH',
      headName: 'Anand Shinde (Fictional)',
      cardTypeId: 'sample-orange-phh',
      members: [
        { id: 'm-d1', name: 'Anand Shinde', addedOn: '2020-03-01', removedOn: null, reason: 'Initial' },
        { id: 'm-d2', name: 'Varsha Shinde', addedOn: '2020-03-01', removedOn: null, reason: 'Initial' },
        { id: 'm-d3', name: 'Ganesh Shinde', addedOn: '2020-03-01', removedOn: null, reason: 'Initial' },
        { id: 'm-d4', name: 'Lata Shinde', addedOn: '2020-03-01', removedOn: `${thisMonth}-10`, reason: 'Marriage' },
      ],
      healthChecklist: {
        aadhaarLinked: true,
        ekycDone: true,
        shopMapped: true,
        memberListCurrent: true,
        mobileRegistered: true,
      },
    },
  ];

  // Records
  const records: RationRecord[] = [
    // Family A (This Month): Rice 20 kg + Wheat 10 kg confirmed = 30 kg vs 35 kg entitled -> Shortfall 5 kg
    {
      id: 'rec-a-1',
      householdId: 'demo-hh-a',
      month: thisMonth,
      item: 'Rice',
      qty: 20000,
      date: `${thisMonth}-04`,
      sourceType: 'shop_entry',
      sourceText: 'POS terminal entry #8821',
      sourceRef: 'POS-8821',
      amountPaise: 0,
      status: 'Confirmed',
      origin: 'shop',
      enteredByRole: 'Shopkeeper',
      enteredByName: 'FPS Shop-001',
      enteredAt: `${thisMonth}-04T10:30:00Z`,
      confirmedBy: 'citizen',
      confirmedAt: `${thisMonth}-04T11:00:00Z`,
      disputeNote: '',
      exceedNote: '',
      place: 'home_shop',
      otpCode: '0000',
      otpAttempts: 0,
      parserEngine: 'none',
    },
    {
      id: 'rec-a-2',
      householdId: 'demo-hh-a',
      month: thisMonth,
      item: 'Wheat',
      qty: 10000,
      date: `${thisMonth}-04`,
      sourceType: 'shop_entry',
      sourceText: 'POS terminal entry #8822',
      sourceRef: 'POS-8822',
      amountPaise: 0,
      status: 'Confirmed',
      origin: 'shop',
      enteredByRole: 'Shopkeeper',
      enteredByName: 'FPS Shop-001',
      enteredAt: `${thisMonth}-04T10:32:00Z`,
      confirmedBy: 'citizen',
      confirmedAt: `${thisMonth}-04T11:00:00Z`,
      disputeNote: '',
      exceedNote: '',
      place: 'home_shop',
      otpCode: '0000',
      otpAttempts: 0,
      parserEngine: 'none',
    },
    // Family A (Last Month): One disputed record with note (shows Unclear)
    {
      id: 'rec-a-last',
      householdId: 'demo-hh-a',
      month: lastMonth,
      item: 'Grain',
      qty: 35000,
      date: `${lastMonth}-12`,
      sourceType: 'handwritten_note',
      sourceText: 'Register entry shows 35kg signed by third party',
      sourceRef: 'REG-PG4',
      amountPaise: 0,
      status: 'Disputed',
      origin: 'shop',
      enteredByRole: 'Shopkeeper',
      enteredByName: 'FPS Shop-001',
      enteredAt: `${lastMonth}-12T09:00:00Z`,
      confirmedBy: null,
      confirmedAt: null,
      disputeNote: 'Card holder states family was traveling and did not receive grain on this date.',
      exceedNote: '',
      place: 'home_shop',
      otpCode: '0000',
      otpAttempts: 0,
      parserEngine: 'local',
    },

    // Family B: Last month confirmed 20 kg (full). This month NO records -> Unrecorded.
    {
      id: 'rec-b-last',
      householdId: 'demo-hh-b',
      month: lastMonth,
      item: 'Grain',
      qty: 20000,
      date: `${lastMonth}-08`,
      sourceType: 'receipt_reference',
      sourceText: 'Cash memo with reference R-9901',
      sourceRef: 'R-9901',
      amountPaise: 0,
      status: 'Confirmed',
      origin: 'citizen',
      enteredByRole: 'Citizen',
      enteredByName: 'Fatima Shaikh',
      enteredAt: `${lastMonth}-08T15:00:00Z`,
      confirmedBy: 'citizen',
      confirmedAt: `${lastMonth}-08T15:00:00Z`,
      disputeNote: '',
      exceedNote: '',
      place: 'home_shop',
      otpCode: '0000',
      otpAttempts: 0,
      parserEngine: 'none',
    },

    // Family C: 3 members. Entitled: 15 kg.
    // This month: Grain 9 kg Confirmed + Grain 6 kg Pending with OTP code.
    // Confirmed-only diff: 6 kg. Diff if pending confirmed: 0 kg.
    {
      id: 'rec-c-1',
      householdId: 'demo-hh-c',
      month: thisMonth,
      item: 'Grain',
      qty: 9000,
      date: `${thisMonth}-03`,
      sourceType: 'shop_entry',
      sourceText: 'Biometric transaction ID #7712',
      sourceRef: 'TX-7712',
      amountPaise: 0,
      status: 'Confirmed',
      origin: 'shop',
      enteredByRole: 'Shopkeeper',
      enteredByName: 'FPS Shop-001',
      enteredAt: `${thisMonth}-03T11:20:00Z`,
      confirmedBy: 'otp',
      confirmedAt: `${thisMonth}-03T11:21:00Z`,
      disputeNote: '',
      exceedNote: '',
      place: 'home_shop',
      otpCode: '0000',
      otpAttempts: 1,
      parserEngine: 'none',
    },
    {
      id: 'rec-c-2',
      householdId: 'demo-hh-c',
      month: thisMonth,
      item: 'Grain',
      qty: 6000,
      date: `${thisMonth}-05`,
      sourceType: 'shop_entry',
      sourceText: 'Second distribution batch entry',
      sourceRef: 'POS-8902',
      amountPaise: 0,
      status: 'Pending',
      origin: 'shop',
      enteredByRole: 'Shopkeeper',
      enteredByName: 'FPS Shop-001',
      enteredAt: `${thisMonth}-05T14:10:00Z`,
      confirmedBy: null,
      confirmedAt: null,
      disputeNote: '',
      exceedNote: '',
      place: 'home_shop',
      otpCode: '0000',
      otpAttempts: 0,
      parserEngine: 'none',
    },

    // Family D: 4 members PHH (entitled 20 kg). Confirmed 35 kg -> "Recorded above rule"
    // Also matches the Yellow AAY rule (35 kg) -> triggers card mismatch hint!
    // One record has place "other_shop" -> triggers "Collected at another shop" tag!
    {
      id: 'rec-d-1',
      householdId: 'demo-hh-d',
      month: thisMonth,
      item: 'Grain',
      qty: 35000,
      date: `${thisMonth}-06`,
      sourceType: 'receipt_text',
      sourceText: 'Grain 35 kg received 2026-10-06 receipt no. R-4471',
      sourceRef: 'R-4471',
      amountPaise: 0,
      status: 'Confirmed',
      origin: 'citizen',
      enteredByRole: 'Citizen',
      enteredByName: 'Anand Shinde',
      enteredAt: `${thisMonth}-06T16:00:00Z`,
      confirmedBy: 'citizen',
      confirmedAt: `${thisMonth}-06T16:00:00Z`,
      disputeNote: '',
      exceedNote: 'Collected during festival portability period at ward depot',
      place: 'other_shop',
      otpCode: '0000',
      otpAttempts: 0,
      parserEngine: 'local',
    },
  ];

  return { cardTypes, households, records };
}

/**
 * Generates an initial chained audit history log with valid SHA-256 block hashes
 * for Shop-001 and all demo families.
 */
export async function generateDemoHistory(shopName: string = 'Shop-001'): Promise<HistoryEntry[]> {
  let prevHash = 'GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000';
  const history: HistoryEntry[] = [];

  // Genesis block
  const h0 = await createHistoryEntry(
    prevHash,
    'system',
    'genesis_init',
    'system-init',
    `RationSaathi cryptographic audit ledger initialized for ${shopName}`
  );
  history.push(h0);
  prevHash = h0.hash;

  // 1. Family A: Shopkeeper logged POS-8821 (20 kg Rice)
  const h1 = await createHistoryEntry(
    prevHash,
    'shopkeeper',
    'create_record',
    'rec-a-1',
    `Shopkeeper logged distribution: 20 kg Rice for card CARD-1001 (Ramesh Patil)`,
    {
      householdId: 'demo-hh-a',
      cardNumber: 'CARD-1001',
      headName: 'Ramesh Patil',
      shopName,
    }
  );
  history.push(h1);
  prevHash = h1.hash;

  // 2. Family A: Citizen confirmed with OTP 0000
  const h2 = await createHistoryEntry(
    prevHash,
    'citizen',
    'confirm_record',
    'rec-a-1',
    `Citizen confirmed receipt: 20 kg Rice for card CARD-1001 (Ramesh Patil) with OTP 0000`,
    {
      householdId: 'demo-hh-a',
      cardNumber: 'CARD-1001',
      headName: 'Ramesh Patil',
      shopName,
    }
  );
  history.push(h2);
  prevHash = h2.hash;

  // 3. Family A: Shopkeeper logged POS-8822 (10 kg Wheat)
  const h3 = await createHistoryEntry(
    prevHash,
    'shopkeeper',
    'create_record',
    'rec-a-2',
    `Shopkeeper logged distribution: 10 kg Wheat for card CARD-1001 (Ramesh Patil)`,
    {
      householdId: 'demo-hh-a',
      cardNumber: 'CARD-1001',
      headName: 'Ramesh Patil',
      shopName,
    }
  );
  history.push(h3);
  prevHash = h3.hash;

  // 4. Family A: Citizen confirmed with OTP 0000
  const h4 = await createHistoryEntry(
    prevHash,
    'citizen',
    'confirm_record',
    'rec-a-2',
    `Citizen confirmed receipt: 10 kg Wheat for card CARD-1001 (Ramesh Patil) with OTP 0000`,
    {
      householdId: 'demo-hh-a',
      cardNumber: 'CARD-1001',
      headName: 'Ramesh Patil',
      shopName,
    }
  );
  history.push(h4);
  prevHash = h4.hash;

  // 5. Family A: Dispute recorded for last month
  const h5 = await createHistoryEntry(
    prevHash,
    'citizen',
    'dispute_record',
    'rec-a-last',
    `Citizen filed factual dispute note: "Only 10kg grain received instead of 15kg" for card CARD-1001 (Ramesh Patil)`,
    {
      householdId: 'demo-hh-a',
      cardNumber: 'CARD-1001',
      headName: 'Ramesh Patil',
      shopName,
    }
  );
  history.push(h5);
  prevHash = h5.hash;

  // 6. Family C: Shopkeeper logged POS-8841 (10 kg Rice)
  const h6 = await createHistoryEntry(
    prevHash,
    'shopkeeper',
    'create_record',
    'rec-c-1',
    `Shopkeeper logged distribution: 10 kg Rice for card CARD-1003 (Sunita Gaikwad)`,
    {
      householdId: 'demo-hh-c',
      cardNumber: 'CARD-1003',
      headName: 'Sunita Gaikwad',
      shopName,
    }
  );
  history.push(h6);
  prevHash = h6.hash;

  // 7. Family C: Citizen confirmed with OTP 0000
  const h7 = await createHistoryEntry(
    prevHash,
    'citizen',
    'confirm_record',
    'rec-c-1',
    `Citizen confirmed receipt: 10 kg Rice for card CARD-1003 (Sunita Gaikwad) with OTP 0000`,
    {
      householdId: 'demo-hh-c',
      cardNumber: 'CARD-1003',
      headName: 'Sunita Gaikwad',
      shopName,
    }
  );
  history.push(h7);
  prevHash = h7.hash;

  // 8. Family C: Shopkeeper logged POS-8842 (10 kg Wheat) - Pending OTP verification
  const h8 = await createHistoryEntry(
    prevHash,
    'shopkeeper',
    'create_record',
    'rec-c-2',
    `Shopkeeper logged pending entry: 10 kg Wheat for card CARD-1003 (Sunita Gaikwad) - awaiting citizen OTP (0000)`,
    {
      householdId: 'demo-hh-c',
      cardNumber: 'CARD-1003',
      headName: 'Sunita Gaikwad',
      shopName,
    }
  );
  history.push(h8);
  prevHash = h8.hash;

  // 9. Family D: Portability depot record
  const h9 = await createHistoryEntry(
    prevHash,
    'citizen',
    'receipt_extracted_record',
    'rec-d-1',
    `Portability distribution recorded: 35 kg Grain for card CARD-1004 (Anand Shinde) at ward depot`,
    {
      householdId: 'demo-hh-d',
      cardNumber: 'CARD-1004',
      headName: 'Anand Shinde',
      shopName: 'Ward-Depot-04',
    }
  );
  history.push(h9);
  prevHash = h9.hash;

  return history;
}

