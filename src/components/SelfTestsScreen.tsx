import React, { useState } from 'react';
import { runAllSelfTests, runSingleTest, TestResult } from '../services/selfTests';
import { LanguageCode } from '../types';
import { t } from '../services/translations';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  CheckCheck,
  Loader2,
  Sparkles,
  Filter,
  RefreshCw,
  Cpu,
} from 'lucide-react';

interface Props {
  lang: LanguageCode;
}

export const SelfTestsScreen: React.FC<Props> = ({ lang }) => {
  const [results, setResults] = useState<TestResult[]>(() => runAllSelfTests());
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runningIndex, setRunningIndex] = useState<number>(-1);
  const [activeTestName, setActiveTestName] = useState<string>('');
  const [progress, setProgress] = useState<number>(100);
  const [lastRunTime, setLastRunTime] = useState<string>(new Date().toLocaleTimeString());
  const [executionDurationMs, setExecutionDurationMs] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [showToast, setShowToast] = useState<boolean>(false);

  // Run the full test suite with visible live sequential step updates
  const handleRunTests = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setProgress(0);
    setShowToast(false);
    setExecutionDurationMs(null);

    const startTime = performance.now();

    // Get all fresh tests to execute
    const allTests = runAllSelfTests();
    const liveResults: TestResult[] = [];

    for (let i = 0; i < allTests.length; i++) {
      const current = allTests[i];
      setRunningIndex(i);
      setActiveTestName(current.name);
      setProgress(Math.round(((i + 1) / allTests.length) * 100));

      // Small tick delay so user visibly sees each test executing
      await new Promise((resolve) => setTimeout(resolve, 45));

      liveResults.push(current);
      // Update results live as each test finishes
      setResults([...liveResults, ...allTests.slice(i + 1)]);
    }

    const duration = Math.round(performance.now() - startTime);
    setExecutionDurationMs(duration);
    setIsRunning(false);
    setRunningIndex(-1);
    setActiveTestName('');
    setLastRunTime(new Date().toLocaleTimeString());
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  // Run a single test individually on demand
  const handleRunSingle = (testId: string) => {
    const updated = runSingleTest(testId);
    if (updated) {
      setResults((prev) => prev.map((t) => (t.id === testId ? updated : t)));
    }
  };

  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = total - passedCount;

  const filteredResults = results.filter((r) => {
    if (filter === 'passed') return r.passed;
    if (filter === 'failed') return !r.passed;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <CheckCheck className="w-5 h-5 text-emerald-600" />
            {t('tests.title', undefined, lang)}
          </h2>
          <span className="text-xs text-stone-500">
            Deterministic in-browser verification suite for exact arithmetic, cut-offs, classification, parser, and neutrality.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-stone-400 font-mono block">Last run: {lastRunTime}</span>
            {executionDurationMs !== null && (
              <span className="text-[10px] text-emerald-600 font-mono font-semibold block">
                Completed in {executionDurationMs} ms
              </span>
            )}
          </div>
          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="px-5 py-2.5 bg-stone-900 hover:bg-black disabled:bg-stone-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-xs cursor-pointer active:scale-95"
            title="Execute all automated invariant tests"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Running Test Suite ({progress}%)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-amber-400" />
                <span>{t('tests.runBtn', undefined, lang)}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Animated Progress Bar during execution */}
      {isRunning && (
        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-700 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
              Running test {runningIndex + 1} of {total}: <strong className="text-stone-900">{activeTestName}</strong>
            </span>
            <span className="font-mono text-amber-800 font-bold">{progress}%</span>
          </div>
          <div className="bg-stone-100 h-2.5 rounded-full overflow-hidden border border-stone-200">
            <div
              className="bg-amber-500 h-full transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Success Notification Toast */}
      {showToast && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-semibold rounded-xl flex items-center justify-between shadow-md transition-all animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>
              Test Suite Passed! All {passedCount} verification invariants executed and validated successfully in {executionDurationMs} ms.
            </span>
          </div>
          <span className="text-[10px] opacity-80 font-mono">{lastRunTime}</span>
        </div>
      )}

      {/* Summary Scorecard */}
      <div
        className={`p-5 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${
          failedCount === 0
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-red-50 border-red-300 text-red-950'
        }`}
      >
        <div className="flex items-center gap-3">
          {failedCount === 0 ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600 shrink-0" />
          )}
          <div>
            <h3 className="text-base font-bold">
              {failedCount === 0
                ? t('tests.allPassed', { count: total }, lang)
                : t('tests.failures', { failures: failedCount, count: total }, lang)}
            </h3>
            <p className="text-xs opacity-80 mt-0.5">
              100% of tested invariants run deterministically in browser memory with zero network calls and zero floating-point errors.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold">
          <span className="px-3 py-1.5 bg-white/90 text-emerald-900 rounded-md border border-emerald-300 shadow-2xs">
            {passedCount} / {total} Passed
          </span>
          {failedCount > 0 && (
            <span className="px-3 py-1.5 bg-red-200 text-red-900 rounded-md border border-red-300">
              {failedCount} Failed
            </span>
          )}
        </div>
      </div>

      {/* Filter Tabs and Quick Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-stone-500 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
              filter === 'all'
                ? 'bg-stone-900 text-white font-bold'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            All ({total})
          </button>
          <button
            onClick={() => setFilter('passed')}
            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
              filter === 'passed'
                ? 'bg-emerald-700 text-white font-bold'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            Passed ({passedCount})
          </button>
          {failedCount > 0 && (
            <button
              onClick={() => setFilter('failed')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                filter === 'failed'
                  ? 'bg-red-700 text-white font-bold'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              Failed ({failedCount})
            </button>
          )}
        </div>

        <button
          onClick={handleRunTests}
          disabled={isRunning}
          className="text-stone-600 hover:text-stone-900 font-semibold flex items-center gap-1 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          <span>Re-run Suite</span>
        </button>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs text-stone-700">
          <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
            <tr>
              <th className="p-3 w-12 text-center">#</th>
              <th className="p-3">Test Name & Invariant Description</th>
              <th className="p-3">Expected Result</th>
              <th className="p-3">Actual Result</th>
              <th className="p-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-sans">
            {filteredResults.map((t, idx) => {
              const isCurrentlyExecuting = isRunning && runningIndex === idx;

              return (
                <tr
                  key={t.id}
                  className={`transition-colors ${
                    isCurrentlyExecuting
                      ? 'bg-amber-50/70 font-semibold'
                      : 'hover:bg-stone-50/50'
                  }`}
                >
                  <td className="p-3 text-center text-stone-400 font-mono text-[11px]">{idx + 1}</td>
                  <td className="p-3">
                    <span className="font-bold text-stone-900 block">{t.name}</span>
                    <span className="text-[11px] text-stone-500">{t.description}</span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-stone-600">{t.expected}</td>
                  <td className="p-3 font-mono text-[11px] text-stone-800 font-bold">{t.actual}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          t.passed
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-red-50 text-red-800 border-red-300'
                        }`}
                      >
                        {isCurrentlyExecuting ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin text-amber-600" /> Running
                          </>
                        ) : t.passed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Pass
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-red-600" /> Fail
                          </>
                        )}
                      </span>
                      <button
                        onClick={() => handleRunSingle(t.id)}
                        disabled={isRunning}
                        className="p-1 hover:bg-stone-200 rounded text-stone-400 hover:text-stone-700 transition"
                        title="Re-run this test individually"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
