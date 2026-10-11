/**
 * Receipt Text Extractor
 * Includes a robust, 100% offline rule-based parser handling English, Marathi, and Hindi.
 * Supports optional Gemini assistant with strict JSON validation and 8-second timeout,
 * with seamless silent fallback to local parsing.
 */

import { ParserEngine } from '../types';
import { parseQtyStringToGrams, parseRupeesStringToPaise } from './numberHelpers';

export interface ExtractedReceiptItem {
  id: string;
  itemKey: string;
  qtyStr: string; // kg or litre string
  qtyGrams: number;
  unit: 'kg' | 'litre';
  dateStr: string; // YYYY-MM-DD or empty
  amountStr: string; // Rupees or empty
  amountPaise: number | null;
  receiptRef: string;
  place: 'home_shop' | 'other_shop' | 'unknown';
  engine: ParserEngine;
  yearAssumed: boolean;
  unconfident: boolean;
}

export interface ParseReceiptResult {
  engine: ParserEngine;
  items: ExtractedReceiptItem[];
  rawText: string;
  yearAssumed: boolean;
  unconfident: boolean;
}

export const SAMPLE_RECEIPTS = [
  {
    id: 'sample-1',
    label: 'Received 8kg rice on 5 Oct',
    text: 'Received 8kg rice on 5 Oct',
  },
  {
    id: 'sample-2',
    label: 'Rice 6 kg, wheat 4 kg given on 12/10/2026, Rs 0',
    text: 'Rice 6 kg, wheat 4 kg given on 12/10/2026, Rs 0',
  },
  {
    id: 'sample-3',
    label: '५ किलो तांदूळ मिळाले दि. ८ ऑक्टोबर २०२६ (Marathi)',
    text: '५ किलो तांदूळ मिळाले दि. ८ ऑक्टोबर २०२६',
  },
  {
    id: 'sample-4',
    label: '2 किलो गेहूं और 1 किलो चीनी, 03-10-2026, रु 20 (Hindi)',
    text: '2 किलो गेहूं और 1 किलो चीनी, 03-10-2026, रु 20',
  },
  {
    id: 'sample-5',
    label: 'Ration collected - quantity not clear, signature only',
    text: 'Ration collected - quantity not clear, signature only',
  },
  {
    id: 'sample-6',
    label: 'Grain 15 kg received 2026-10-02 receipt no. R-4471',
    text: 'Grain 15 kg received 2026-10-02 receipt no. R-4471',
  },
];

/**
 * Normalises Devanagari digits (०-९) to Western Arabic digits (0-9).
 */
export function normalizeDevanagariNumerals(text: string): string {
  const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  let res = text;
  for (let i = 0; i < 10; i++) {
    res = res.replace(new RegExp(devanagariDigits[i], 'g'), i.toString());
  }
  return res;
}

/**
 * Local offline rule-based parser.
 * Works without network, AI, or API keys.
 */
export function parseReceiptLocal(rawText: string): ParseReceiptResult {
  const normalized = normalizeDevanagariNumerals(rawText);
  let yearAssumed = false;
  let unconfident = false;

  // 1. Extract Receipt Reference Number
  let receiptRef = '';
  const refRegex = /(?:receipt\s*(?:no\.?|#)|ref(?:\.?|no\.?)|पावती\s*क्र\.?|रसीद\s*(?:सं\.?|नं\.?))\s*[:#-]?\s*([A-Za-z0-9_-]+)/i;
  const refMatch = refRegex.exec(normalized);
  if (refMatch && refMatch[1]) {
    receiptRef = refMatch[1].trim();
  }

  // 2. Extract Rupee Amount
  let amountStr = '';
  let amountPaise: number | null = null;
  const priceRegex = /(?:rs\.?|₹|रु\.?|inr)\s*([0-9]+(?:\.[0-9]{1,2})?)|([0-9]+(?:\.[0-9]{1,2})?)\s*(?:rs|rupees|रुपये)/i;
  const priceMatch = priceRegex.exec(normalized);
  if (priceMatch) {
    const val = priceMatch[1] || priceMatch[2];
    amountStr = val;
    amountPaise = parseRupeesStringToPaise(val);
  }

  // 3. Extract Date
  let dateStr = '';
  const currentYear = new Date().getFullYear();

  // Pattern A: YYYY-MM-DD
  const isoMatch = /\b(20\d{2})-(0[1-9]|1[0-2])-([0-2][0-9]|3[01])\b/.exec(normalized);
  if (isoMatch) {
    dateStr = `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  // Pattern B: DD/MM/YYYY or DD-MM-YYYY
  if (!dateStr) {
    const dmyMatch = /\b([0-2]?[0-9]|3[01])[\/\.-](0?[1-9]|1[0-2])[\/\.-](20\d{2})\b/.exec(normalized);
    if (dmyMatch) {
      const d = String(dmyMatch[1]).padStart(2, '0');
      const m = String(dmyMatch[2]).padStart(2, '0');
      const y = dmyMatch[3];
      dateStr = `${y}-${m}-${d}`;
    }
  }

  // Pattern C: Named Month (e.g., 5 Oct, 5 October 2026, ८ ऑक्टोबर २०२६)
  if (!dateStr) {
    const monthPatterns: { monthNum: string; names: string[] }[] = [
      { monthNum: '01', names: ['january', 'jan', 'जानेवारी', 'जनवरी'] },
      { monthNum: '02', names: ['february', 'feb', 'फेब्रुवारी', 'फरवरी'] },
      { monthNum: '03', names: ['march', 'mar', 'मार्च'] },
      { monthNum: '04', names: ['april', 'apr', 'एप्रिल', 'अप्रैल'] },
      { monthNum: '05', names: ['may', 'मे', 'मई'] },
      { monthNum: '06', names: ['june', 'jun', 'जून'] },
      { monthNum: '07', names: ['july', 'jul', 'जुलै', 'जुलाई'] },
      { monthNum: '08', names: ['august', 'aug', 'ऑगस्ट', 'अगस्त'] },
      { monthNum: '09', names: ['september', 'sep', 'sept', 'सप्टेंबर', 'सितंबर'] },
      { monthNum: '10', names: ['october', 'oct', 'ऑक्टोबर', 'अक्टूबर'] },
      { monthNum: '11', names: ['november', 'nov', 'नोव्हेंबर', 'नवंबर'] },
      { monthNum: '12', names: ['december', 'dec', 'डिसेंबर', 'दिसंबर'] },
    ];

    for (const mp of monthPatterns) {
      for (const mName of mp.names) {
        // e.g. "5 Oct 2026" or "5 Oct"
        const regexWithYear = new RegExp(`\\b([0-2]?[0-9]|3[01])\\s*(?:st|nd|rd|th)?\\s*${mName}\\s*(20\\d{2})?\\b`, 'i');
        const match = regexWithYear.exec(normalized);
        if (match) {
          const day = String(match[1]).padStart(2, '0');
          const year = match[2] || currentYear.toString();
          if (!match[2]) {
            yearAssumed = true;
          }
          dateStr = `${year}-${mp.monthNum}-${day}`;
          break;
        }
      }
      if (dateStr) break;
    }
  }

  if (!dateStr) {
    unconfident = true;
  }

  // 4. Extract Items and Quantities
  interface ItemDef {
    key: string;
    keywords: string[];
    defaultUnit: 'kg' | 'litre';
  }

  const knownItems: ItemDef[] = [
    { key: 'Rice', keywords: ['rice', 'तांदूळ', 'चावल'], defaultUnit: 'kg' },
    { key: 'Wheat', keywords: ['wheat', 'गहू', 'गेहूं'], defaultUnit: 'kg' },
    { key: 'Sugar', keywords: ['sugar', 'साखर', 'चीनी'], defaultUnit: 'kg' },
    { key: 'Grain', keywords: ['grain', 'धान्य', 'अनाज'], defaultUnit: 'kg' },
    { key: 'Dal', keywords: ['dal', 'daal', 'डाळ', 'दाल'], defaultUnit: 'kg' },
    { key: 'Oil', keywords: ['oil', 'तेल'], defaultUnit: 'litre' },
  ];

  const extractedItems: ExtractedReceiptItem[] = [];

  for (const itemDef of knownItems) {
    for (const kw of itemDef.keywords) {
      // Look for: "<qty> <unit> <kw>" OR "<kw> <qty> <unit>"
      // Unit matches: kg, kilo, किलो, किग्रा, g, gm, ग्राम, l, litre, लिटर
      const unitPattern = '(?:kg|kilo|किलो|किग्रा|g|gm|ग्राम|l|litre|लिटर)';
      const regex1 = new RegExp(`([0-9]+(?:\\.[0-9]{1,3})?)\\s*(${unitPattern})?\\s*(?:of\\s*)?${kw}`, 'i');
      const regex2 = new RegExp(`${kw}\\s*([0-9]+(?:\\.[0-9]{1,3})?)\\s*(${unitPattern})?`, 'i');

      let qtyStr = '';
      let unit: 'kg' | 'litre' = itemDef.defaultUnit;

      const m1 = regex1.exec(normalized);
      const m2 = regex2.exec(normalized);
      const match = m1 || m2;

      if (match) {
        qtyStr = match[1];
        const rawUnit = (match[2] || '').toLowerCase();
        if (rawUnit === 'g' || rawUnit === 'gm' || rawUnit === 'ग्राम') {
          // Grams: convert e.g. 500g -> 0.5 kg
          const gVal = parseInt(qtyStr, 10);
          qtyStr = (gVal / 1000).toString();
          unit = 'kg';
        } else if (rawUnit === 'l' || rawUnit === 'litre' || rawUnit === 'लिटर') {
          unit = 'litre';
        } else {
          unit = 'kg';
        }

        const qtyGrams = parseQtyStringToGrams(qtyStr);

        extractedItems.push({
          id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          itemKey: itemDef.key,
          qtyStr,
          qtyGrams,
          unit,
          dateStr: dateStr || '',
          amountStr,
          amountPaise,
          receiptRef,
          place: 'home_shop',
          engine: 'local',
          yearAssumed,
          unconfident: false,
        });
        break; // matched this itemKey
      }
    }
  }

  // If no items matched with quantities, check if keywords existed without clear quantities
  if (extractedItems.length === 0) {
    unconfident = true;
    let foundKey = 'Grain';
    for (const itemDef of knownItems) {
      if (itemDef.keywords.some((k) => normalized.toLowerCase().includes(k))) {
        foundKey = itemDef.key;
        break;
      }
    }

    extractedItems.push({
      id: `item-${Date.now()}-unconf`,
      itemKey: foundKey,
      qtyStr: '',
      qtyGrams: 0,
      unit: 'kg',
      dateStr: dateStr || '',
      amountStr,
      amountPaise,
      receiptRef,
      place: 'home_shop',
      engine: 'local',
      yearAssumed,
      unconfident: true,
    });
  }

  return {
    engine: 'local',
    items: extractedItems,
    rawText,
    yearAssumed,
    unconfident,
  };
}

/**
 * Extracts receipt data via Gemini endpoint with an 8s timeout,
 * falling back seamlessly to local parser if anything fails.
 */
export async function parseReceiptWithFallback(
  rawText: string,
  geminiEnabled: boolean
): Promise<ParseReceiptResult> {
  if (!geminiEnabled) {
    return parseReceiptLocal(rawText);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch('/api/gemini/extract-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiptText: rawText }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('Gemini returned empty or invalid structure');
    }

    const parsedItems: ExtractedReceiptItem[] = data.items.map((it: any) => {
      const qtyStr = it.qtyKg !== undefined && it.qtyKg !== null ? it.qtyKg.toString() : '';
      const qtyGrams = parseQtyStringToGrams(qtyStr);
      const amountPaise =
        it.amountRupees !== undefined && it.amountRupees !== null
          ? parseRupeesStringToPaise(it.amountRupees.toString())
          : null;

      return {
        id: `gemini-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        itemKey: it.itemKey || 'Grain',
        qtyStr,
        qtyGrams,
        unit: it.unit === 'litre' ? 'litre' : 'kg',
        dateStr: it.date || '',
        amountStr: it.amountRupees !== null && it.amountRupees !== undefined ? it.amountRupees.toString() : '',
        amountPaise,
        receiptRef: it.receiptRef || '',
        place: it.place === 'other_shop' ? 'other_shop' : it.place === 'unknown' ? 'unknown' : 'home_shop',
        engine: 'gemini' as ParserEngine,
        yearAssumed: false,
        unconfident: !qtyStr || !it.date,
      };
    });

    return {
      engine: 'gemini',
      items: parsedItems,
      rawText,
      yearAssumed: false,
      unconfident: parsedItems.some((i) => i.unconfident),
    };
  } catch (err) {
    console.warn('Gemini parser failed or timed out, falling back to local offline parser:', err);
    const localResult = parseReceiptLocal(rawText);
    return {
      ...localResult,
      engine: 'local',
    };
  }
}
