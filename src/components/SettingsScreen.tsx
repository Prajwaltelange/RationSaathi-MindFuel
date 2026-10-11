import React, { useState } from 'react';
import { AppSettings, AppState, LanguageCode, RefDayMode, UserRole } from '../types';
import { clearAppState, getDefaultState, saveAppState } from '../services/storage';
import { generateFullDemoData, generateDemoHistory, getSampleCardTypes } from '../services/demoData';
import { createHistoryEntry } from '../services/historyLog';
import { t } from '../services/translations';
import {
  Settings,
  Globe,
  UserCheck,
  Calendar,
  KeyRound,
  Sparkles,
  Store,
  RotateCcw,
  Trash2,
  Database,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface Props {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
}

export const SettingsScreen: React.FC<Props> = ({ state, onUpdateState }) => {
  const { settings, history } = state;
  const lang = settings.language;
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const updateSettings = (partial: Partial<AppSettings>) => {
    const updated = {
      ...state,
      settings: {
        ...state.settings,
        ...partial,
      },
    };
    onUpdateState(updated);
  };

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
    showToast('Sample card types loaded successfully.');
  };

  const handleLoadFullDemo = async () => {
    const demo = generateFullDemoData();
    const demoHistory = await generateDemoHistory(settings.shopName);

    onUpdateState({
      ...state,
      cardTypes: demo.cardTypes,
      households: demo.households,
      records: demo.records.map((r) => ({ ...r, otpCode: '0000' })),
      history: demoHistory,
    });
    showToast('Full demo dataset and audit trail loaded successfully.');
  };

  const handleResetAllData = () => {
    clearAppState();
    const freshState = getDefaultState();
    saveAppState(freshState);
    onUpdateState(freshState);
    setShowResetConfirm(false);
    showToast('All data has been reset to defaults.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <Settings className="w-4 h-4 text-amber-700" />
          {t('settings.title', undefined, lang)}
        </h2>
        <span className="text-xs text-stone-500">
          Configure language preferences, simulation role, calculation cut-offs, and demo options.
        </span>
      </div>

      {/* Notification Toast */}
      {toastMessage && (
        <div className="p-3 bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Language, Role & Month */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Language Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              {t('settings.language', undefined, lang)}
            </label>
            <select
              value={settings.language}
              onChange={(e) => updateSettings({ language: e.target.value as LanguageCode })}
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium"
            >
              <option value="en">English</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>

          {/* Role Switcher */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-stone-500" />
              {t('settings.role', undefined, lang)}
            </label>
            <select
              value={settings.role}
              onChange={(e) => updateSettings({ role: e.target.value as UserRole })}
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium"
            >
              <option value="citizen">{t('role.citizen', undefined, lang)}</option>
              <option value="shopkeeper">{t('role.shopkeeper', undefined, lang)}</option>
            </select>
          </div>

          {/* Selected Month */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              {t('settings.month', undefined, lang)}
            </label>
            <input
              type="month"
              value={settings.selectedMonth}
              onChange={(e) => updateSettings({ selectedMonth: e.target.value })}
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-mono font-medium"
            />
          </div>
        </div>

        {/* Member Count Cut-off Reference Day */}
        <div className="pt-4 border-t border-stone-100 space-y-3">
          <label className="block text-xs font-bold text-stone-800">
            {t('settings.refDay', undefined, lang)}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <label className="flex items-center gap-2 p-3 bg-stone-50 border border-stone-200 rounded-lg cursor-pointer hover:bg-stone-100">
              <input
                type="radio"
                name="refDayMode"
                checked={settings.refDayMode === 'first'}
                onChange={() => updateSettings({ refDayMode: 'first' })}
                className="w-4 h-4 text-amber-600 focus:ring-amber-500"
              />
              <span className="font-medium text-stone-800">{t('settings.refFirst', undefined, lang)}</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-stone-50 border border-stone-200 rounded-lg cursor-pointer hover:bg-stone-100">
              <input
                type="radio"
                name="refDayMode"
                checked={settings.refDayMode === 'last'}
                onChange={() => updateSettings({ refDayMode: 'last' })}
                className="w-4 h-4 text-amber-600 focus:ring-amber-500"
              />
              <span className="font-medium text-stone-800">{t('settings.refLast', undefined, lang)}</span>
            </label>

            <div className="flex items-center gap-2 p-2.5 bg-stone-50 border border-stone-200 rounded-lg">
              <input
                type="radio"
                name="refDayMode"
                checked={settings.refDayMode === 'custom'}
                onChange={() => updateSettings({ refDayMode: 'custom' })}
                className="w-4 h-4 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-xs font-medium text-stone-800">Custom Day (1-28):</span>
              <input
                type="number"
                min="1"
                max="28"
                value={settings.refDay}
                onChange={(e) => updateSettings({ refDayMode: 'custom', refDay: parseInt(e.target.value, 10) || 1 })}
                className="w-14 p-1 bg-white border border-stone-300 rounded text-center text-xs font-bold"
              />
            </div>
          </div>
        </div>

        {/* Shop Name */}
        <div className="pt-4 border-t border-stone-100">
          <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-stone-500" />
            {t('settings.shopName', undefined, lang)}
          </label>
          <input
            type="text"
            value={settings.shopName}
            onChange={(e) => updateSettings({ shopName: e.target.value })}
            className="w-full sm:w-72 text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
          Feature Verification Toggles
        </h3>

        <div className="space-y-4">
          <label className="flex items-start gap-3 p-3.5 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-100/70">
            <input
              type="checkbox"
              checked={settings.otpEnabled}
              onChange={(e) => updateSettings({ otpEnabled: e.target.checked })}
              className="w-4 h-4 mt-0.5 text-amber-600 rounded border-stone-300"
            />
            <div>
              <span className="text-xs font-bold text-stone-900 block flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                {t('settings.otpToggle', undefined, lang)}
              </span>
              <span className="text-[11px] text-stone-500 block mt-0.5">
                Generates a simulated 4-digit code on the citizen screen to verify shop counter distribution entries.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-100/70">
            <input
              type="checkbox"
              checked={settings.geminiEnabled}
              onChange={(e) => updateSettings({ geminiEnabled: e.target.checked })}
              className="w-4 h-4 mt-0.5 text-purple-600 rounded border-stone-300"
            />
            <div>
              <span className="text-xs font-bold text-stone-900 block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                {t('settings.geminiToggle', undefined, lang)}
              </span>
              <span className="text-[11px] text-stone-500 block mt-0.5">
                {t('settings.geminiNote', undefined, lang)}
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Data Management Actions */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
          Data Management & Demo Utilities
        </h3>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleLoadSampleCardTypes}
            className="px-4 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            {t('btn.loadSampleRules', undefined, lang)}
          </button>

          <button
            onClick={handleLoadFullDemo}
            className="px-4 py-2 bg-stone-900 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            {t('btn.loadFullDemo', undefined, lang)}
          </button>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t('btn.resetAllData', undefined, lang)}
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-red-50 border border-red-300 p-2 rounded-lg">
              <span className="text-xs text-red-900 font-medium">Are you sure? This erases all localStorage state.</span>
              <button
                onClick={handleResetAllData}
                className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 cursor-pointer"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1 bg-white border border-stone-300 text-stone-700 rounded text-xs font-medium hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
