/**
 * Append-Only History Audit Log with SHA-256 Cryptographic Hash Chaining
 * Each entry is chained to the previous hash using Web Crypto API.
 */

import { HistoryEntry } from '../types';

/**
 * Computes SHA-256 hash of a string using Web Crypto API
 */
export async function computeSha256(message: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('Web Crypto subtle digest failed, using fallback', e);
  }

  // Fallback lightweight hash generator if Web Crypto is unavailable
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

/**
 * Formats a message block string to be hashed
 */
export function formatBlockString(
  prevHash: string,
  time: string,
  role: string,
  action: string,
  recordId: string,
  details: string
): string {
  return `${prevHash}|${time}|${role}|${action}|${recordId}|${details}`;
}

/**
 * Creates a new chained HistoryEntry
 */
export async function createHistoryEntry(
  prevHash: string,
  role: string,
  action: string,
  recordId: string,
  details: string,
  meta?: {
    householdId?: string;
    cardNumber?: string;
    headName?: string;
    shopName?: string;
  }
): Promise<HistoryEntry> {
  const time = new Date().toISOString();
  const id = `hist-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const block = formatBlockString(prevHash, time, role, action, recordId, details);
  const hash = await computeSha256(block);

  return {
    id,
    time,
    role,
    action,
    recordId,
    details,
    prevHash,
    hash,
    householdId: meta?.householdId,
    cardNumber: meta?.cardNumber,
    headName: meta?.headName,
    shopName: meta?.shopName,
  };
}

export interface VerificationResult {
  isValid: boolean;
  brokenIndex: number | null;
  totalEntries: number;
}

/**
 * Recomputes the entire cryptographic hash chain and verifies tamper-free continuity
 */
export async function verifyHistoryIntegrity(history: HistoryEntry[]): Promise<VerificationResult> {
  if (!history || history.length === 0) {
    return { isValid: true, brokenIndex: null, totalEntries: 0 };
  }

  let expectedPrevHash = 'GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000';

  for (let i = 0; i < history.length; i++) {
    const entry = history[i];
    if (i === 0) {
      expectedPrevHash = entry.prevHash;
    } else {
      if (entry.prevHash !== history[i - 1].hash) {
        return { isValid: false, brokenIndex: i, totalEntries: history.length };
      }
    }

    const block = formatBlockString(
      entry.prevHash,
      entry.time,
      entry.role,
      entry.action,
      entry.recordId,
      entry.details
    );
    const calculatedHash = await computeSha256(block);
    if (calculatedHash !== entry.hash) {
      return { isValid: false, brokenIndex: i, totalEntries: history.length };
    }
  }

  return { isValid: true, brokenIndex: null, totalEntries: history.length };
}
