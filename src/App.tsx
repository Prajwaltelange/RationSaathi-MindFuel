/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppState, LanguageCode, UserRole } from './types';
import { loadAppState, saveAppState, clearAppState } from './services/storage';
import { generateDemoHistory } from './services/demoData';
import { t } from './services/translations';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CitizenScreen } from './components/CitizenScreen';
import { ShopkeeperScreen } from './components/ShopkeeperScreen';
import { AddFromReceiptScreen } from './components/AddFromReceiptScreen';
import { ReportScreen } from './components/ReportScreen';
import { RulesSetupScreen } from './components/RulesSetupScreen';
import { HouseholdsScreen } from './components/HouseholdsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { SelfTestsScreen } from './components/SelfTestsScreen';
import { HistoryScreen } from './components/HistoryScreen';
import {
  Wheat,
  User,
  Store,
  FileText,
  PlusSquare,
  Sliders,
  Users,
  Settings as SettingsIcon,
  CheckCircle,
  Shield,
  Calendar,
  AlertCircle,
  Globe,
} from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => {
    const { state } = loadAppState();
    return state;
  });

  const [activeTab, setActiveTab] = useState<string>('myRation');

  // Sync state changes to localStorage - guarantees all OTPs are 0000 across all participants and records
  const handleUpdateState = (newState: AppState) => {
    const normalizedState: AppState = {
      ...newState,
      records: newState.records.map((r) => ({
        ...r,
        otpCode: '0000',
      })),
    };
    setAppState(normalizedState);
    saveAppState(normalizedState);
  };

  const { settings } = appState;
  const lang = settings.language;
  const role = settings.role;

  // Ensure initial chained history is seeded for audit trail demo if empty
  useEffect(() => {
    if (appState.history.length === 0) {
      generateDemoHistory(settings.shopName).then((demoHist) => {
        if (demoHist && demoHist.length > 0) {
          handleUpdateState({
            ...appState,
            history: demoHist,
          });
        }
      });
    }
  }, []);

  // When role changes, ensure active tab is appropriate
  useEffect(() => {
    if (role === 'shopkeeper' && (activeTab === 'myRation' || activeTab === 'addReceipt')) {
      setActiveTab('counter');
    } else if (role === 'citizen' && activeTab === 'counter') {
      setActiveTab('myRation');
    }
  }, [role]);

  // Tab definitions based on active role
  const getTabs = () => {
    const tabs = [];

    if (role === 'citizen') {
      tabs.push({ id: 'myRation', label: t('tab.myRation', undefined, lang), icon: Wheat });
      tabs.push({ id: 'addReceipt', label: t('tab.addReceipt', undefined, lang), icon: PlusSquare });
      tabs.push({ id: 'report', label: t('tab.report', undefined, lang), icon: FileText });
    } else {
      tabs.push({ id: 'counter', label: t('tab.counter', undefined, lang), icon: Store });
      tabs.push({ id: 'report', label: t('tab.report', undefined, lang), icon: FileText });
    }

    // Common tabs available to both roles
    tabs.push({
      id: 'rulesSetup',
      label: t('tab.rulesSetup', undefined, lang),
      icon: Sliders,
      badge: t('tab.adminSetupLabel', undefined, lang),
    });
    tabs.push({
      id: 'households',
      label: t('tab.households', undefined, lang),
      icon: Users,
      badge: t('tab.adminSetupLabel', undefined, lang),
    });
    tabs.push({ id: 'history', label: t('tab.history', undefined, lang), icon: Shield });
    tabs.push({ id: 'selfTests', label: t('tab.selfTests', undefined, lang), icon: CheckCircle });
    tabs.push({ id: 'settings', label: t('tab.settings', undefined, lang), icon: SettingsIcon });

    return tabs;
  };

  const tabs = getTabs();

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-stone-100/70 text-stone-900 font-sans selection:bg-amber-200">
        {/* Permanent Prototype Notice Banner */}
        <aside
          role="complementary"
          aria-label="Simulation Notice"
          className="bg-stone-900 text-stone-200 px-4 py-2 text-xs text-center border-b border-stone-800"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <p className="leading-snug">
              {t('app.banner', undefined, lang)}
            </p>
          </div>
        </aside>

        {/* Main App Header */}
        <header className="bg-white border-b border-stone-200 shadow-2xs sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-xl shadow-xs">
                <Wheat className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-stone-900 flex items-center gap-2">
                  {t('app.title', undefined, lang)}
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Prototype
                  </span>
                </h1>
                <p className="text-xs text-stone-500">
                  {t('app.subtitle', undefined, lang)}
                </p>
              </div>
            </div>

            {/* Header Controls: Role Switcher, Language Toggle, Month Picker */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Role Switcher */}
              <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
                <button
                  onClick={() => handleUpdateState({
                    ...appState,
                    settings: { ...settings, role: 'citizen' },
                  })}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                    role === 'citizen'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  {t('role.citizen', undefined, lang)}
                </button>
                <button
                  onClick={() => handleUpdateState({
                    ...appState,
                    settings: { ...settings, role: 'shopkeeper' },
                  })}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                    role === 'shopkeeper'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Store className="w-3.5 h-3.5 text-amber-600" />
                  {t('role.shopkeeper', undefined, lang)}
                </button>
              </div>

              {/* Month Picker */}
              <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <input
                  type="month"
                  value={settings.selectedMonth}
                  onChange={(e) => handleUpdateState({
                    ...appState,
                    settings: { ...settings, selectedMonth: e.target.value },
                  })}
                  className="bg-transparent font-bold text-stone-800 text-xs focus:outline-hidden"
                />
              </div>

              {/* Language Toggle */}
              <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
                {(['en', 'mr', 'hi'] as LanguageCode[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => handleUpdateState({
                      ...appState,
                      settings: { ...settings, language: l },
                    })}
                    className={`px-2.5 py-1 rounded-lg font-bold transition ${
                      lang === l
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {l === 'en' ? 'EN' : l === 'mr' ? 'मराठी' : 'हिन्दी'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex space-x-1 overflow-x-auto no-scrollbar pt-1 border-t border-stone-100">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 whitespace-nowrap ${
                      isActive
                        ? 'border-amber-600 text-amber-900 bg-amber-50/50'
                        : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-stone-400'}`} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="text-[10px] bg-stone-200/80 text-stone-600 font-normal px-1.5 py-0.2 rounded">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'myRation' && (
            <CitizenScreen state={appState} onUpdateState={handleUpdateState} />
          )}

          {activeTab === 'addReceipt' && (
            <AddFromReceiptScreen
              state={appState}
              onUpdateState={handleUpdateState}
              onNavigateToMyRation={() => setActiveTab('myRation')}
            />
          )}

          {activeTab === 'report' && (
            <ReportScreen state={appState} onUpdateState={handleUpdateState} />
          )}

          {activeTab === 'counter' && (
            <ShopkeeperScreen state={appState} onUpdateState={handleUpdateState} />
          )}

          {activeTab === 'rulesSetup' && (
            <RulesSetupScreen state={appState} onUpdateState={handleUpdateState} />
          )}

          {activeTab === 'households' && (
            <HouseholdsScreen state={appState} onUpdateState={handleUpdateState} />
          )}

          {activeTab === 'history' && (
            <HistoryScreen state={appState} lang={lang} />
          )}

          {activeTab === 'selfTests' && (
            <SelfTestsScreen lang={lang} />
          )}

          {activeTab === 'settings' && (
            <SettingsScreen state={appState} onUpdateState={handleUpdateState} />
          )}
        </main>

        {/* Permanent Footer Notice */}
        <footer className="bg-white border-t border-stone-200 py-6 text-center text-xs text-stone-500">
          <div className="max-w-4xl mx-auto px-4 space-y-1">
            <p className="font-medium text-stone-600">
              {t('app.footer', undefined, lang)}
            </p>
            <p className="text-[11px] text-stone-400">
              RationSaathi — An objective decision-support prototype built for transparent public food distribution verification.
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
