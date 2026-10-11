/**
 * Exact Number and Unit Arithmetic Helpers
 * Quantities are stored as exact integer grams/ml.
 * Monies are stored as exact integer paise.
 * All decimal conversions are performed via String manipulation to prevent IEEE-754 floating-point errors.
 */

/**
 * Parses user-typed kg or litre decimal string into integer base units (grams or millilitres).
 * Example: "5" -> 5000, "5.2" -> 5200, "5.25" -> 5250, "0.5" -> 500, "2.5" -> 2500
 */
export function parseQtyStringToGrams(valStr: string): number {
  if (!valStr || typeof valStr !== 'string') return 0;
  const clean = valStr.trim();
  if (!clean || clean === '-') return 0;

  const parts = clean.split('.');
  const intStr = parts[0] || '0';
  const fracStr = (parts[1] || '').slice(0, 3).padEnd(3, '0');

  const intPart = parseInt(intStr, 10);
  if (isNaN(intPart)) return 0;

  const fracPart = parseInt(fracStr, 10);
  if (isNaN(fracPart)) return 0;

  return intPart * 1000 + fracPart;
}

/**
 * Formats integer base units (grams or ml) into kg/litre string with up to 3 decimals.
 * Trims trailing zeros.
 * Example: 5000 -> "5", 5250 -> "5.25", 5005 -> "5.005", 250 -> "0.25"
 */
export function formatGramsToQtyString(grams: number): string {
  if (grams === null || grams === undefined || isNaN(grams)) return '0';
  const isNeg = grams < 0;
  const absGrams = Math.abs(grams);

  const whole = Math.floor(absGrams / 1000);
  const rem = absGrams % 1000;

  let result = whole.toString();
  if (rem > 0) {
    const remStr = rem.toString().padStart(3, '0').replace(/0+$/, '');
    result = `${whole}.${remStr}`;
  }

  return isNeg ? `-${result}` : result;
}

/**
 * Parses user-typed Rupees string into integer paise.
 * Example: "2" -> 200, "2.50" -> 250, "0" -> 0
 */
export function parseRupeesStringToPaise(valStr: string): number {
  if (!valStr || typeof valStr !== 'string') return 0;
  const clean = valStr.trim();
  if (!clean) return 0;

  const parts = clean.split('.');
  const intStr = parts[0] || '0';
  const fracStr = (parts[1] || '').slice(0, 2).padEnd(2, '0');

  const intPart = parseInt(intStr, 10);
  if (isNaN(intPart)) return 0;

  const fracPart = parseInt(fracStr, 10);
  if (isNaN(fracPart)) return 0;

  return intPart * 100 + fracPart;
}

/**
 * Formats integer paise into Rupees string with exactly 2 decimal places.
 * Example: 200 -> "2.00", 250 -> "2.50", 0 -> "0.00"
 */
export function formatPaiseToRupeesString(paise: number | null): string {
  if (paise === null || paise === undefined || isNaN(paise)) return '0.00';
  const isNeg = paise < 0;
  const absPaise = Math.abs(paise);

  const whole = Math.floor(absPaise / 100);
  const rem = (absPaise % 100).toString().padStart(2, '0');

  const res = `${whole}.${rem}`;
  return isNeg ? `-${res}` : res;
}

/**
 * Calculates expected price in paise using exact integer half-up rounding:
 * Formula: (pricePaise * grams + 500) / 1000
 * Free grain rules (pricePaise = 0) always return 0 paise.
 */
export function computeExpectedPricePaise(pricePaise: number | null, grams: number): number {
  if (pricePaise === null || pricePaise === undefined || pricePaise <= 0 || grams <= 0) {
    return 0;
  }
  return Math.floor((pricePaise * grams + 500) / 1000);
}
