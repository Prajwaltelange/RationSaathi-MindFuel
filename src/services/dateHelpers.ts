/**
 * Date and Month Handling Utilities
 * Stores dates in ISO (YYYY-MM-DD) format.
 * Formats dates as DD/MM/YYYY for user display.
 * Calculates month reference days (first, last, custom 1-28).
 */

import { RefDayMode } from '../types';

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns current month formatted as YYYY-MM
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Validates ISO date string YYYY-MM-DD
 */
export function isValidIsoDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return false;
  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const d = parseInt(match[3], 10);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/**
 * Formats ISO YYYY-MM-DD string to DD/MM/YYYY
 */
export function formatIsoToDisplay(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Gets the number of days in a given YYYY-MM month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Calculates the reference cut-off date (ISO YYYY-MM-DD) for a given month and settings
 */
export function calculateRefDate(monthStr: string, mode: RefDayMode, customDay: number = 1): string {
  if (!monthStr || !monthStr.includes('-')) {
    monthStr = getCurrentMonth();
  }
  const [yStr, mStr] = monthStr.split('-');
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10);
  const totalDays = getDaysInMonth(y, m);

  let targetDay = 1;
  if (mode === 'first') {
    targetDay = 1;
  } else if (mode === 'last') {
    targetDay = totalDays;
  } else {
    targetDay = Math.min(Math.max(1, customDay), Math.min(28, totalDays));
  }

  return `${yStr}-${mStr}-${String(targetDay).padStart(2, '0')}`;
}

/**
 * Checks if a record date is after the last day of its month (e.g. for "Late entry" tag)
 */
export function isLateEntry(recordDate: string, monthStr: string): boolean {
  if (!isValidIsoDate(recordDate)) return false;
  const [yStr, mStr] = monthStr.split('-');
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10);
  const lastDay = getDaysInMonth(y, m);
  const lastDateIso = `${yStr}-${mStr}-${String(lastDay).padStart(2, '0')}`;
  return recordDate > lastDateIso;
}

/**
 * Formats YYYY-MM into localized human month string (e.g. "October 2026")
 */
export function formatMonthName(monthStr: string, lang: 'en' | 'mr' | 'hi' = 'en'): string {
  if (!monthStr || !monthStr.includes('-')) return monthStr;
  const [yStr, mStr] = monthStr.split('-');
  const m = parseInt(mStr, 10);

  const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthsMr = ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'];
  const monthsHi = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];

  const list = lang === 'mr' ? monthsMr : lang === 'hi' ? monthsHi : monthsEn;
  const monthName = list[m - 1] || mStr;
  return `${monthName} ${yStr}`;
}

/**
 * Generates an array of the last N months in YYYY-MM format ending at endMonth
 */
export function getLastNMonths(endMonth: string, n: number = 6): string[] {
  const result: string[] = [];
  const [yStr, mStr] = endMonth.split('-');
  let curY = parseInt(yStr, 10);
  let curM = parseInt(mStr, 10);

  for (let i = 0; i < n; i++) {
    result.unshift(`${curY}-${String(curM).padStart(2, '0')}`);
    curM -= 1;
    if (curM < 1) {
      curM = 12;
      curY -= 1;
    }
  }
  return result;
}
