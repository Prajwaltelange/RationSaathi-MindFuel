import React, { useState } from 'react';
import { AppState } from '../types';
import { evaluateHouseholdMonth } from '../services/calculationEngine';
import { formatIsoToDisplay, formatMonthName } from '../services/dateHelpers';
import { formatGramsToQtyString, formatPaiseToRupeesString } from '../services/numberHelpers';
import { formatColourName, formatItemName, t } from '../services/translations';
import { GrievanceLetterModal } from './GrievanceLetterModal';
import { downloadReportPdf, printHtmlViaIframe } from '../services/pdfGenerator';
import {
  FileText,
  Download,
  Printer,
  FileDown,
  HelpCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  Split,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
}

export const ReportScreen: React.FC<Props> = ({ state }) => {
  const { households, cardTypes, records, settings } = state;
  const lang = settings.language;

  // Selected household in report
  const [selectedHhId, setSelectedHhId] = useState<string>(households[0]?.id || '');
  const [showLetterModal, setShowLetterModal] = useState<boolean>(false);

  const activeHousehold = households.find((h) => h.id === selectedHhId) || households[0];
  const activeCardType = activeHousehold
    ? cardTypes.find((c) => c.id === activeHousehold.cardTypeId) || null
    : null;

  const evaluation = activeHousehold
    ? evaluateHouseholdMonth(
        activeHousehold,
        activeCardType,
        settings.selectedMonth,
        records,
        settings,
        cardTypes
      )
    : null;

  // Download CSV handler
  const handleDownloadCsv = () => {
    if (!evaluation || !activeHousehold) return;

    const headers = [
      'Household Head',
      'Card Number',
      'Category',
      'Month',
      'Members Counted',
      'Item',
      'Rule Mode',
      'Entitled (kg/l)',
      'Confirmed Received (kg/l)',
      'Pending (kg/l)',
      'Difference (kg/l)',
      'Diff If Pending Confirmed (kg/l)',
      'Classification',
      'Classification Reason',
      'Tags',
      'Expected Price (Rs)',
      'Amount Recorded Paid (Rs)',
      'Price Check Status',
    ];

    const rows = evaluation.items.map((it) => {
      const entitledStr = formatGramsToQtyString(it.entitled);
      const confStr = formatGramsToQtyString(it.confirmedTotal);
      const pendStr = formatGramsToQtyString(it.pendingTotal);
      const diffStr = formatGramsToQtyString(it.remaining);
      const diffIfPendStr = formatGramsToQtyString(it.diffIfPendingConfirmed);
      const expectedRs = formatPaiseToRupeesString(it.priceCheck.expectedPaise);
      const actualRs = it.priceCheck.actualPaise !== null ? formatPaiseToRupeesString(it.priceCheck.actualPaise) : 'N/A';

      return [
        `"${activeHousehold.headName}"`,
        `"${activeHousehold.cardNumber}"`,
        `"${activeCardType?.category || 'None'}"`,
        `"${settings.selectedMonth}"`,
        evaluation.membersCounted,
        `"${it.rule.itemKey}"`,
        `"${it.rule.mode}"`,
        entitledStr,
        confStr,
        pendStr,
        diffStr,
        diffIfPendStr,
        `"${it.classification}"`,
        `"${it.classificationReason}"`,
        `"${it.tags.join('; ')}"`,
        expectedRs,
        actualRs,
        `"${it.priceCheck.status}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RationSaathi_${activeHousehold.cardNumber}_${settings.selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save as true .pdf using jsPDF
  const handleSavePdf = () => {
    if (!evaluation || !activeHousehold) return;
    try {
      downloadReportPdf(evaluation, activeHousehold, activeCardType, settings, lang);
    } catch (err) {
      console.error('PDF generation error, downloading printable HTML instead:', err);
      handleDownloadHtml();
    }
  };

  // Build clean standalone printable report HTML string
  const getPrintableReportHtml = (): string => {
    if (!evaluation || !activeHousehold) return '';

    const itemsHtml = evaluation.items.map((it) => {
      const recordsHtml = it.records
        .map(
          (r) =>
            `<tr>
              <td>${formatIsoToDisplay(r.date)}</td>
              <td>${r.item}</td>
              <td><strong>${formatGramsToQtyString(r.qty)} ${it.rule.unit}</strong></td>
              <td>${r.sourceRef || r.sourceType}</td>
              <td>${r.status}</td>
              <td>${r.enteredByName}</td>
            </tr>`
        )
        .join('');

      return `
      <div style="border: 1px solid #ccc; border-radius: 8px; padding: 16px; margin-bottom: 20px; page-break-inside: avoid;">
        <h3 style="margin-top: 0; color: #111; display: flex; justify-content: space-between;">
          <span>${formatItemName(it.rule.itemKey, lang)} &bull; ${it.rule.mode}</span>
          <span style="font-size: 10pt; background: #eee; padding: 2px 8px; border-radius: 4px;">Status: ${it.classification}</span>
        </h3>
        <p style="font-size: 10pt; color: #444;">
          <strong>Entitled:</strong> ${formatGramsToQtyString(it.entitled)} ${it.rule.unit} |
          <strong>Confirmed Received:</strong> ${formatGramsToQtyString(it.confirmedTotal)} ${it.rule.unit} |
          <strong>Pending:</strong> ${formatGramsToQtyString(it.pendingTotal)} ${it.rule.unit} |
          <strong>Difference (Confirmed):</strong> ${formatGramsToQtyString(it.remaining)} ${it.rule.unit} |
          <strong>Diff if Pending Confirmed:</strong> ${formatGramsToQtyString(it.diffIfPendingConfirmed)} ${it.rule.unit}
        </p>
        <p style="font-size: 9pt; color: #555; background: #fafafa; padding: 6px; border-radius: 4px;">
          <strong>Basis:</strong> ${it.classificationReason}
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 10px;">
          <thead>
            <tr style="background: #f0f0f0; border-bottom: 1px solid #ccc; text-align: left;">
              <th style="padding: 6px;">Date</th>
              <th style="padding: 6px;">Item</th>
              <th style="padding: 6px;">Qty</th>
              <th style="padding: 6px;">Source/Ref</th>
              <th style="padding: 6px;">Status</th>
              <th style="padding: 6px;">Entered By</th>
            </tr>
          </thead>
          <tbody>
            ${recordsHtml || '<tr><td colspan="6" style="padding: 8px; text-align: center; color: #888;">No entries recorded</td></tr>'}
          </tbody>
        </table>
      </div>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>RationSaathi_Report_${activeHousehold.cardNumber}_${settings.selectedMonth}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 30px; color: #222; line-height: 1.5; }
    h1 { font-size: 18pt; margin-bottom: 4px; color: #111; }
    h2 { font-size: 13pt; margin-top: 0; color: #555; }
    .header-box { border-bottom: 2px solid #222; padding-bottom: 12px; margin-bottom: 20px; }
    .disclaimer { background: #fff8e1; border: 1px solid #ffe082; padding: 12px; font-size: 9.5pt; color: #6d4c41; border-radius: 6px; margin-bottom: 20px; }
    table, th, td { border: 1px solid #ddd; }
    th, td { padding: 6px 8px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header-box">
    <h1>RationSaathi — Entitlement & Distribution Report</h1>
    <h2>Household: ${activeHousehold.headName} | Card No: ${activeHousehold.cardNumber} | Month: ${formatMonthName(settings.selectedMonth, lang)}</h2>
    <p style="font-size: 10pt; color: #444; margin: 4px 0 0 0;">
      Category: <strong>${activeCardType?.name || ''} (${activeCardType?.category || 'None'})</strong> |
      Counted Members: <strong>${evaluation.membersCounted}</strong> (as of cut-off date ${formatIsoToDisplay(evaluation.refDate)})
    </p>
  </div>

  <div class="disclaimer">
    <strong>Notice:</strong> ${t('report.disclaimerTop', undefined, lang)}
  </div>

  ${itemsHtml}

  <div style="margin-top: 30px; font-size: 9pt; color: #777; border-top: 1px solid #ccc; padding-top: 10px; text-align: center;">
    ${t('report.disclaimerBottom', undefined, lang)}
  </div>
</body>
</html>`;
  };

  // Safe Print with iframe fallback
  const handlePrint = () => {
    try {
      printHtmlViaIframe(getPrintableReportHtml());
    } catch (err) {
      console.warn('Iframe print error, attempting window.print:', err);
      window.print();
    }
  };

  // Download standalone printable report HTML document
  const handleDownloadHtml = () => {
    if (!evaluation || !activeHousehold) return;
    const htmlContent = getPrintableReportHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RationSaathi_Report_${activeHousehold.cardNumber}_${settings.selectedMonth}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!activeHousehold || !evaluation) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-600">
        <p className="text-base font-semibold">No households available for report.</p>
        <p className="text-sm mt-1 text-stone-500">Add a household in the Households tab or load demo data in Settings.</p>
      </div>
    );
  }

  // Unticked checklist items
  const untickedChecklist: string[] = [];
  if (!activeHousehold.healthChecklist.aadhaarLinked) untickedChecklist.push(t('households.aadhaarLinked', undefined, lang));
  if (!activeHousehold.healthChecklist.ekycDone) untickedChecklist.push(t('households.ekycDone', undefined, lang));
  if (!activeHousehold.healthChecklist.shopMapped) untickedChecklist.push(t('households.shopMapped', undefined, lang));
  if (!activeHousehold.healthChecklist.memberListCurrent) untickedChecklist.push(t('households.memberListCurrent', undefined, lang));
  if (!activeHousehold.healthChecklist.mobileRegistered) untickedChecklist.push(t('households.mobileRegistered', undefined, lang));

  // Check if any item has shortfall or unclear or awaiting
  const needsQuestions = evaluation.items.some(
    (it) => ['Shortfall', 'Unrecorded', 'Awaiting confirmation', 'Unclear'].includes(it.classification)
  );

  return (
    <div className="space-y-6">
      {/* Top Controls & Household Selector */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
            Select Household:
          </label>
          <select
            value={selectedHhId}
            onChange={(e) => setSelectedHhId(e.target.value)}
            className="text-sm font-medium bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-500"
          >
            {households.map((hh) => (
              <option key={hh.id} value={hh.id}>
                {hh.cardNumber} - {hh.headName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowLetterModal(true)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <FileText className="w-3.5 h-3.5" />
            {t('btn.generateLetter', undefined, lang)}
          </button>
          <button
            onClick={handleSavePdf}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer active:scale-95"
            title="Download formatted .pdf report directly"
          >
            <FileDown className="w-3.5 h-3.5" />
            Save as PDF (.pdf)
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            title="Print report directly"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
          <button
            onClick={handleDownloadCsv}
            className="px-3 py-1.5 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            title="Download CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
          <button
            onClick={handleDownloadHtml}
            className="px-3 py-1.5 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            title="Download standalone HTML document"
          >
            <Download className="w-3.5 h-3.5" />
            HTML
          </button>
        </div>
      </div>

      {/* Mandatory Top Disclaimer */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          {t('report.disclaimerTop', undefined, lang)}
        </p>
      </div>

      {/* Report Header Card */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <span className="text-xs font-semibold text-amber-700 tracking-wider uppercase">
              {t('report.title', undefined, lang)}
            </span>
            <h2 className="text-xl font-bold text-stone-900 mt-0.5">
              {activeHousehold.headName}
            </h2>
            <p className="text-xs text-stone-500 font-mono mt-0.5">
              Card No: {activeHousehold.cardNumber}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeCardType && (
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-lg text-xs font-medium">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-stone-300 shrink-0"
                  style={{ backgroundColor: activeCardType.colour }}
                />
                <span>{activeCardType.name}</span>
                <span className="text-stone-400">|</span>
                <span className="font-semibold text-stone-700">{activeCardType.category}</span>
              </div>
            )}
            <div className="bg-stone-100 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700">
              {formatMonthName(settings.selectedMonth, lang)}
            </div>
            <div className="bg-stone-100 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700">
              Language: {lang.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Member cut-off notice & Applied Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
            <span className="font-bold text-stone-800">
              {t('households.membersCountedLabel', {
                count: evaluation.membersCounted,
                refDate: formatIsoToDisplay(evaluation.refDate),
              }, lang)}
            </span>
            <p className="text-stone-500 text-[11px] mt-0.5">
              {t('households.refCutoffNote', undefined, lang)}
            </p>
          </div>

          <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
            <span className="font-bold text-stone-800">Applied Rule Baseline:</span>
            <div className="mt-1 space-y-1">
              {evaluation.items.map((it) => (
                <div key={it.rule.id} className="text-stone-600">
                  {t('report.appliedRule', {
                    cardName: activeCardType?.name || '',
                    category: activeCardType?.category || '',
                    item: formatItemName(it.rule.itemKey, lang),
                    qtyDesc: `${formatGramsToQtyString(it.rule.qty)} ${it.rule.unit} ${it.rule.mode === 'PER_MEMBER' ? 'per member' : 'per card'}`,
                    entitled: formatGramsToQtyString(it.entitled),
                    unit: it.rule.unit,
                  }, lang)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Items Evaluation & Tables */}
      <div className="space-y-6">
        {evaluation.items.map((itemEval) => {
          const itemName = formatItemName(itemEval.rule.itemKey, lang);
          const unit = itemEval.rule.unit;

          return (
            <div
              key={itemEval.rule.id}
              className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs"
            >
              {/* Item Banner */}
              <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-stone-900">{itemName}</h3>
                  <span className="text-xs bg-stone-200 text-stone-800 font-medium px-2 py-0.5 rounded">
                    {itemEval.rule.mode === 'PER_MEMBER'
                      ? t('mode.PER_MEMBER', undefined, lang)
                      : t('mode.PER_CARD', undefined, lang)}
                  </span>
                  {/* Primary classification badge */}
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                      itemEval.classification === 'Received in full'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : itemEval.classification === 'Shortfall'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : itemEval.classification === 'Recorded above rule'
                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                        : itemEval.classification === 'Awaiting confirmation'
                        ? 'bg-purple-50 text-purple-800 border-purple-300'
                        : 'bg-stone-100 text-stone-800 border-stone-300'
                    }`}
                  >
                    {itemEval.classification}
                  </span>

                  {/* Extra tags */}
                  {itemEval.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="text-right text-xs">
                  <span className="text-stone-500">Entitled: </span>
                  <span className="font-bold text-stone-900">
                    {formatGramsToQtyString(itemEval.entitled)} {unit}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Math Breakdown & The Two Numbers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                    <span className="text-[11px] text-stone-500 block">Confirmed Received</span>
                    <span className="text-lg font-bold text-stone-900">
                      {formatGramsToQtyString(itemEval.confirmedTotal)} {unit}
                    </span>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                    <span className="text-[11px] text-stone-500 block">Pending Confirmation</span>
                    <span className="text-lg font-bold text-stone-700">
                      {formatGramsToQtyString(itemEval.pendingTotal)} {unit}
                    </span>
                  </div>

                  <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                    <span className="text-[11px] text-amber-800 block font-medium">Difference (Confirmed only)</span>
                    <span className="text-lg font-bold text-amber-900">
                      {formatGramsToQtyString(itemEval.remaining)} {unit}
                    </span>
                  </div>

                  <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200">
                    <span className="text-[11px] text-purple-800 block font-medium">Diff if Pending Confirmed</span>
                    <span className="text-lg font-bold text-purple-900">
                      {formatGramsToQtyString(itemEval.diffIfPendingConfirmed)} {unit}
                    </span>
                  </div>
                </div>

                {/* Classification Rule-based Reason */}
                <div className="text-xs bg-stone-50 border border-stone-200 p-3 rounded-lg text-stone-700">
                  <span className="font-semibold text-stone-900">Classification Basis: </span>
                  {itemEval.classificationReason}
                </div>

                {/* Price check card */}
                <div className="text-xs border border-stone-200 p-3 rounded-lg flex items-center justify-between bg-stone-50/50">
                  <div>
                    <span className="font-semibold text-stone-800">Price Check: </span>
                    <span>{itemEval.priceCheck.message}</span>
                  </div>
                  <div className="text-stone-500 font-mono">
                    Expected: ₹{formatPaiseToRupeesString(itemEval.priceCheck.expectedPaise)} | Paid:{' '}
                    {itemEval.priceCheck.actualPaise !== null
                      ? `₹${formatPaiseToRupeesString(itemEval.priceCheck.actualPaise)}`
                      : 'N/A'}
                  </div>
                </div>

                {/* Card-Colour / Category Mismatch Hint */}
                {itemEval.mismatchHint && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Neutral Observation: </span>
                      {itemEval.mismatchHint}
                    </div>
                  </div>
                )}

                {/* Split lines breakdown if present */}
                {itemEval.splitsEvaluation && itemEval.splitsEvaluation.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                      <Split className="w-3.5 h-3.5 text-stone-500" />
                      Grain Split Breakdown (Informational; split may vary with stock):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {itemEval.splitsEvaluation.map((se) => (
                        <div
                          key={se.split.id}
                          className="bg-stone-50 border border-stone-200 p-2.5 rounded-lg text-xs flex justify-between items-center"
                        >
                          <div>
                            <span className="font-semibold text-stone-800">
                              {formatItemName(se.split.itemKey, lang)}
                            </span>
                            <span className="text-stone-500 text-[11px] block">
                              Entitled: {formatGramsToQtyString(se.entitled)} {unit}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-stone-900">
                              Received: {formatGramsToQtyString(se.confirmedTotal)} {unit}
                            </span>
                            <span className="text-stone-500 text-[11px] block">
                              Diff: {formatGramsToQtyString(se.difference)} {unit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirmed Records Table */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-stone-800">
                    Confirmed Distribution Entries ({itemEval.records.filter((r) => r.status === 'Confirmed').length})
                  </span>
                  {itemEval.records.filter((r) => r.status === 'Confirmed').length === 0 ? (
                    <div className="text-xs text-stone-500 italic p-3 bg-stone-50 rounded-lg border border-dashed border-stone-200">
                      No confirmed entries found for this item in {settings.selectedMonth}.
                    </div>
                  ) : (
                    <div className="border border-stone-200 rounded-lg overflow-x-auto">
                      <table className="w-full text-left text-xs text-stone-700">
                        <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                          <tr>
                            <th className="p-2.5">Date</th>
                            <th className="p-2.5">Item</th>
                            <th className="p-2.5">Qty</th>
                            <th className="p-2.5">Source & Ref</th>
                            <th className="p-2.5">Confidence</th>
                            <th className="p-2.5">Entered By</th>
                            <th className="p-2.5">Location</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {itemEval.records
                            .filter((r) => r.status === 'Confirmed')
                            .map((r) => (
                              <tr key={r.id} className="hover:bg-stone-50/50">
                                <td className="p-2.5 font-mono">{formatIsoToDisplay(r.date)}</td>
                                <td className="p-2.5 font-medium text-stone-900">{formatItemName(r.item, lang)}</td>
                                <td className="p-2.5 font-bold text-stone-900">
                                  {formatGramsToQtyString(r.qty)} {unit}
                                </td>
                                <td className="p-2.5">
                                  <span className="font-mono text-stone-600">{r.sourceRef || r.sourceType}</span>
                                  {r.sourceText && (
                                    <span className="block text-[10px] text-stone-400 truncate max-w-xs">
                                      {r.sourceText}
                                    </span>
                                  )}
                                </td>
                                <td className="p-2.5">
                                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                    Strong
                                  </span>
                                </td>
                                <td className="p-2.5 text-stone-600">{r.enteredByName || r.enteredByRole}</td>
                                <td className="p-2.5">
                                  {r.place === 'home_shop' ? 'Home shop' : r.place === 'other_shop' ? 'Another shop' : 'Unknown'}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Pending Records Table */}
                {itemEval.pendingRecords.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-700" />
                      Pending Entries (Awaiting Citizen/OTP Confirmation) ({itemEval.pendingRecords.length})
                    </span>
                    <div className="border border-purple-200 bg-purple-50/30 rounded-lg overflow-x-auto">
                      <table className="w-full text-left text-xs text-stone-700">
                        <thead className="bg-purple-100/60 text-purple-900 font-semibold border-b border-purple-200">
                          <tr>
                            <th className="p-2.5">Date</th>
                            <th className="p-2.5">Item</th>
                            <th className="p-2.5">Qty</th>
                            <th className="p-2.5">Entered By</th>
                            <th className="p-2.5">OTP Code</th>
                            <th className="p-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-100">
                          {itemEval.pendingRecords.map((r) => (
                            <tr key={r.id}>
                              <td className="p-2.5 font-mono">{formatIsoToDisplay(r.date)}</td>
                              <td className="p-2.5 font-medium">{formatItemName(r.item, lang)}</td>
                              <td className="p-2.5 font-bold text-purple-950">
                                {formatGramsToQtyString(r.qty)} {unit}
                              </td>
                              <td className="p-2.5 text-stone-600">{r.enteredByName}</td>
                              <td className="p-2.5 font-mono font-bold text-stone-900">{r.otpCode || '-'}</td>
                              <td className="p-2.5 text-purple-700 font-medium">Pending</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Disputed Records Table */}
                {itemEval.disputedRecords.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      Disputed Entries (Under Query) ({itemEval.disputedRecords.length})
                    </span>
                    <div className="border border-red-200 bg-red-50/30 rounded-lg overflow-x-auto">
                      <table className="w-full text-left text-xs text-stone-700">
                        <thead className="bg-red-100/60 text-red-900 font-semibold border-b border-red-200">
                          <tr>
                            <th className="p-2.5">Date</th>
                            <th className="p-2.5">Item</th>
                            <th className="p-2.5">Qty</th>
                            <th className="p-2.5">Source</th>
                            <th className="p-2.5">Factual Dispute Note</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-red-100">
                          {itemEval.disputedRecords.map((r) => (
                            <tr key={r.id}>
                              <td className="p-2.5 font-mono">{formatIsoToDisplay(r.date)}</td>
                              <td className="p-2.5 font-medium">{formatItemName(r.item, lang)}</td>
                              <td className="p-2.5 font-bold text-red-950">
                                {formatGramsToQtyString(r.qty)} {unit}
                              </td>
                              <td className="p-2.5">{r.sourceRef || r.sourceType}</td>
                              <td className="p-2.5 text-red-800 italic">{r.disputeNote || 'Disputed'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Questions that may help clarify (Presented as questions only) */}
      {needsQuestions && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-stone-800 font-bold text-sm">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>{t('report.questionsHeader', undefined, lang)}</span>
          </div>
          <ul className="text-xs text-stone-600 space-y-2 list-disc pl-5">
            <li>{t('report.q1', undefined, lang)}</li>
            <li>{t('report.q2', undefined, lang)}</li>
            <li>{t('report.q3', undefined, lang)}</li>
            <li>{t('report.q4', undefined, lang)}</li>
            <li>{t('report.q5', undefined, lang)}</li>
            <li>{t('report.q6', undefined, lang)}</li>
            <li>{t('report.q7', undefined, lang)}</li>
          </ul>
        </div>
      )}

      {/* Items to verify from health checklist */}
      {untickedChecklist.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            <span>Items to Verify (from Card Health Checklist)</span>
          </div>
          <p className="text-xs text-stone-600">
            The following administrative verifications are currently unticked on this household:
          </p>
          <ul className="text-xs text-amber-950 space-y-1 list-disc pl-5 font-medium">
            {untickedChecklist.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Compare Card Types Panel (for this household's membersCounted) */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
        <h4 className="text-sm font-bold text-stone-900">
          {t('report.compareHeader', { members: evaluation.membersCounted }, lang)}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cardTypes.map((ct) => {
            const grainRule = ct.rules.find((r) => r.itemKey.toLowerCase() === 'grain');
            const grainEntitled = grainRule
              ? formatGramsToQtyString(
                  grainRule.mode === 'PER_MEMBER'
                    ? grainRule.qty * evaluation.membersCounted
                    : grainRule.qty
                )
              : '0';

            return (
              <div
                key={ct.id}
                className={`p-3.5 rounded-lg border text-xs ${
                  ct.id === activeCardType?.id
                    ? 'border-amber-400 bg-amber-50/40 ring-1 ring-amber-300'
                    : 'border-stone-200 bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-stone-300"
                      style={{ backgroundColor: ct.colour }}
                    />
                    <span className="font-bold text-stone-900">{ct.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-stone-500 font-semibold">{ct.category}</span>
                </div>
                <div className="text-stone-700 space-y-1">
                  <div>
                    Grain: <span className="font-bold">{grainEntitled} kg</span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {ct.rules.length > 0 ? `${ct.rules.length} rule line(s)` : 'No entitlement rules entered'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mandatory Bottom Disclaimer */}
      <div className="bg-stone-100 border border-stone-300 rounded-xl p-4 text-xs text-stone-600 text-center shadow-inner">
        {t('report.disclaimerBottom', undefined, lang)}
      </div>

      {/* Grievance Letter Modal */}
      {showLetterModal && activeHousehold && (
        <GrievanceLetterModal
          evaluation={evaluation}
          cardType={activeCardType}
          household={activeHousehold}
          month={settings.selectedMonth}
          lang={lang}
          onClose={() => setShowLetterModal(false)}
        />
      )}
    </div>
  );
};
