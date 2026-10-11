/**
 * LocalStorage Service with Versioning and Corruption Safety
 * Stores entire app state under a single versioned key 'rationsaathi_v1'.
 */

import { AppSettings, AppState, HistoryEntry } from '../types';
import { getCurrentMonth } from './dateHelpers';
import { generateFullDemoData, getSampleCardTypes } from './demoData';
import { createHistoryEntry } from './historyLog';

export const STORAGE_KEY = 'rationsaathi_v1';

export function getDefaultSettings(): AppSettings {
  return {
    language: 'en',
    role: 'citizen',
    selectedMonth: getCurrentMonth(),
    refDayMode: 'first',
    refDay: 1,
    otpEnabled: true,
    geminiEnabled: false,
    shopName: 'Shop-001',
  };
}

export function getDefaultState(): AppState {
  // By default, initialize with sample card types so the user has immediate rules
  const sampleCardTypes = getSampleCardTypes();
  return {
    settings: getDefaultSettings(),
    cardTypes: sampleCardTypes,
    households: [],
    records: [],
    history: [],
  };
}

/**
 * Loads application state from localStorage safely
 */
export function loadAppState(): { state: AppState; corrupted: boolean } {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { state: getDefaultState(), corrupted: false };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First run: load full demo data so app is immediately rich and testable
      const demo = generateFullDemoData();
      const initialState: AppState = {
        settings: getDefaultSettings(),
        cardTypes: demo.cardTypes,
        households: demo.households,
        records: demo.records,
        history: [],
      };
      saveAppState(initialState);
      return { state: initialState, corrupted: false };
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Stored data is not a valid JSON object');
    }

    // Ensure shape and default fallbacks
    const rawRecords = Array.isArray(parsed.records) ? parsed.records : [];
    const normalizedRecords = rawRecords.map((r: any) => ({
      ...r,
      otpCode: '0000',
    }));

    const state: AppState = {
      settings: {
        ...getDefaultSettings(),
        ...(parsed.settings || {}),
      },
      cardTypes: Array.isArray(parsed.cardTypes) ? parsed.cardTypes : getSampleCardTypes(),
      households: Array.isArray(parsed.households) ? parsed.households : [],
      records: normalizedRecords,
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };

    return { state, corrupted: false };
  } catch (err) {
    console.error('Failed to parse localStorage data:', err);
    return { state: getDefaultState(), corrupted: true };
  }
}

/**
 * Saves application state to localStorage safely
 */
export function saveAppState(state: AppState): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    const cleanState: AppState = {
      ...state,
      records: (state.records || []).map((r) => ({
        ...r,
        otpCode: '0000',
      })),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanState));
    return true;
  } catch (err) {
    console.error('Failed to write to localStorage:', err);
    return false;
  }
}

/**
 * Clears all stored data
 */
export function clearAppState(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.error('Failed to clear localStorage:', err);
    return false;
  }
}
