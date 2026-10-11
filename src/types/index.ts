/**
 * RationSaathi Data Models and Types
 * Strict typing for exact integer units, neutral evidence reporting, and multilingual settings.
 */

export type LanguageCode = 'en' | 'mr' | 'hi';
export type UserRole = 'citizen' | 'shopkeeper';
export type RefDayMode = 'first' | 'last' | 'custom';
export type CardCategory = 'AAY' | 'PHH' | 'NPH' | 'None';
export type RuleMode = 'PER_MEMBER' | 'PER_CARD' | 'PER_MEMBER_CAP';
export type UnitType = 'kg' | 'litre';
export type MemberChangeReason = 'Initial' | 'Birth' | 'Marriage' | 'Death' | 'Other';
export type RecordSourceType = 'shop_entry' | 'receipt_reference' | 'receipt_text' | 'handwritten_note' | 'none';
export type RecordStatus = 'Pending' | 'Confirmed' | 'Disputed';
export type RecordPlace = 'home_shop' | 'other_shop' | 'unknown';
export type ParserEngine = 'local' | 'gemini' | 'none';
export type EvidenceBadge = 'Strong' | 'Medium' | 'Weak' | 'Unclear';

export interface RuleSplit {
  id: string;
  itemKey: string;
  qty: number; // integer base units (grams or ml)
}

export interface Rule {
  id: string;
  itemKey: string; // 'Grain', 'Rice', 'Wheat', 'Sugar', 'Dal', 'Oil', or custom
  mode: RuleMode;
  qty: number; // integer base units (grams or ml)
  cap: number | null; // integer base units, only for PER_MEMBER_CAP
  unit: UnitType;
  period: 'monthly';
  stockDependent: boolean;
  pricePaise: number | null; // integer paise per kg/litre (e.g. 200 = Rs 2.00, 0 = free)
  priceValidTill: string | null; // YYYY-MM-DD or null
  splits: RuleSplit[];
  note: string;
}

export interface CardType {
  id: string;
  name: string;
  colour: string; // Hex color code (e.g. #FFD400)
  category: CardCategory;
  sourceNote: string;
  isSample: boolean;
  rules: Rule[];
}

export interface Member {
  id: string;
  name: string;
  addedOn: string; // YYYY-MM-DD
  removedOn: string | null; // YYYY-MM-DD or null
  reason: MemberChangeReason;
}

export interface CardHealthChecklist {
  aadhaarLinked: boolean;
  ekycDone: boolean;
  shopMapped: boolean;
  memberListCurrent: boolean;
  mobileRegistered: boolean;
}

export interface Household {
  id: string;
  cardNumber: string; // Fictional, unique
  headName: string; // Fictional
  cardTypeId: string;
  members: Member[];
  healthChecklist: CardHealthChecklist;
}

export interface RationRecord {
  id: string;
  householdId: string;
  month: string; // YYYY-MM
  item: string;
  qty: number; // integer base units (grams or ml)
  date: string; // YYYY-MM-DD
  sourceType: RecordSourceType;
  sourceText: string;
  sourceRef: string;
  amountPaise: number | null; // integer paise, or null if not recorded
  status: RecordStatus;
  origin: 'shop' | 'citizen';
  enteredByRole: string;
  enteredByName: string;
  enteredAt: string; // ISO datetime string
  confirmedBy: 'citizen' | 'otp' | null;
  confirmedAt: string | null;
  disputeNote: string;
  exceedNote: string;
  place: RecordPlace;
  otpCode: string;
  otpAttempts: number;
  parserEngine: ParserEngine;
}

export interface HistoryEntry {
  id: string;
  time: string; // ISO datetime string
  role: string;
  action: string;
  recordId: string;
  details: string;
  prevHash: string;
  hash: string;
  householdId?: string;
  cardNumber?: string;
  headName?: string;
  shopName?: string;
}

export interface AppSettings {
  language: LanguageCode;
  role: UserRole;
  selectedMonth: string; // YYYY-MM
  refDayMode: RefDayMode;
  refDay: number; // 1-28
  otpEnabled: boolean;
  geminiEnabled: boolean;
  shopName: string;
}

export interface AppState {
  settings: AppSettings;
  cardTypes: CardType[];
  households: Household[];
  records: RationRecord[];
  history: HistoryEntry[];
}

export type PrimaryClassification =
  | 'No rule entered'
  | 'Unclear'
  | 'Unrecorded'
  | 'Awaiting confirmation'
  | 'Received in full'
  | 'Recorded above rule'
  | 'Shortfall';

export interface PriceCheckResult {
  status: 'expired' | 'matches' | 'differs' | 'not_recorded' | 'free_matches' | 'no_price_rule';
  message: string;
  expectedPaise: number;
  actualPaise: number | null;
  diffPaise: number;
}

export interface ItemEvaluation {
  rule: Rule;
  entitled: number; // grams or ml
  confirmedTotal: number;
  pendingTotal: number;
  disputedTotal: number;
  remaining: number; // entitled - confirmedTotal
  diffIfPendingConfirmed: number; // entitled - (confirmedTotal + pendingTotal)
  classification: PrimaryClassification;
  classificationReason: string;
  tags: string[]; // e.g. "Late entry", "Collected at another shop"
  records: RationRecord[];
  pendingRecords: RationRecord[];
  disputedRecords: RationRecord[];
  priceCheck: PriceCheckResult;
  mismatchHint: string | null;
  splitsEvaluation?: {
    split: RuleSplit;
    entitled: number;
    confirmedTotal: number;
    pendingTotal: number;
    difference: number;
  }[];
}

export interface HouseholdMonthlyEvaluation {
  household: Household;
  cardType: CardType | null;
  month: string;
  refDate: string;
  membersCounted: number;
  items: ItemEvaluation[];
  stockDependentItems: ItemEvaluation[];
}
