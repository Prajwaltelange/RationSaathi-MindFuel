import React, { useState, useEffect } from 'react';
import { CardType, Household, HouseholdMonthlyEvaluation, LanguageCode } from '../types';
import { formatIsoToDisplay, formatMonthName, getTodayIso } from '../services/dateHelpers';
import { formatGramsToQtyString } from '../services/numberHelpers';
import { formatColourName, formatItemName, t } from '../services/translations';
import { sanitizeNeutrality } from '../services/neutralityGuard';
import { downloadGrievancePdf, printHtmlViaIframe } from '../services/pdfGenerator';
import { Copy, Printer, Check, X, ShieldCheck, AlertCircle, FileDown, Download } from 'lucide-react';

interface Props {
  evaluation: HouseholdMonthlyEvaluation;
  cardType: CardType | null;
  household: Household;
  month: string;
  lang: LanguageCode;
  onClose: () => void;
}

export const GrievanceLetterModal: React.FC<Props> = ({
  evaluation,
  cardType,
  household,
  month,
  lang,
  onClose,
}) => {
  const [authorityName, setAuthorityName] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [helplineNumber, setHelplineNumber] = useState('');
  const [userRemarks, setUserRemarks] = useState('');
  const [copied, setCopied] = useState(false);

  const todayStr = formatIsoToDisplay(getTodayIso());
  const formattedMonth = formatMonthName(month, lang);
  const colourName = formatColourName(cardType?.colour || 'Yellow', lang);
  const categoryCode = cardType?.category || 'None';

  // Build items summary text
  const itemsSummary = evaluation.items.map((it) => {
    const itemName = formatItemName(it.rule.itemKey, lang);
    const entitledStr = formatGramsToQtyString(it.entitled);
    const confirmedStr = formatGramsToQtyString(it.confirmedTotal);
    const pendingStr = formatGramsToQtyString(it.pendingTotal);
    const diffStr = formatGramsToQtyString(Math.abs(it.remaining));
    const unit = it.rule.unit;

    return `• ${itemName}: Entitled ${entitledStr} ${unit} | Confirmed ${confirmedStr} ${unit} | Pending ${pendingStr} ${unit} | Difference: ${diffStr} ${unit}`;
  }).join('\n');

  // Build draft letter text using templates
  const appliedRuleText = evaluation.items.map((it) => {
    return `${formatItemName(it.rule.itemKey, lang)} (${it.rule.mode === 'PER_MEMBER' ? t('mode.PER_MEMBER', undefined, lang) : t('mode.PER_CARD', undefined, lang)})`;
  }).join(', ');

  const primaryItem = evaluation.items[0];
  const primaryEntitled = primaryItem ? formatGramsToQtyString(primaryItem.entitled) : '0';
  const primaryConfirmed = primaryItem ? formatGramsToQtyString(primaryItem.confirmedTotal) : '0';
  const primaryPending = primaryItem ? formatGramsToQtyString(primaryItem.pendingTotal) : '0';
  const primaryDiff = primaryItem ? formatGramsToQtyString(Math.abs(primaryItem.remaining)) : '0';
  const primaryUnit = primaryItem ? primaryItem.rule.unit : 'kg';

  // Evidence list
  const evidenceList = evaluation.items.flatMap((it) => it.records).map((r, i) => {
    return `  [${i + 1}] Date: ${formatIsoToDisplay(r.date)} | Qty: ${formatGramsToQtyString(r.qty)} | Ref: ${r.sourceRef || r.sourceType} | Status: ${r.status}`;
  }).join('\n');

  // Compose body
  const baseLetterBody = [
    authorityName ? `To: ${authorityName}` : t('letter.authorityPlaceholder', undefined, lang),
    officeAddress ? `Office: ${officeAddress}` : t('letter.officeAddressPlaceholder', undefined, lang),
    helplineNumber ? `Ref/Helpline: ${helplineNumber}` : t('letter.helplinePlaceholder', undefined, lang),
    `Date: ${todayStr}\n`,
    t('letter.subject', { cardNumber: household.cardNumber }, lang),
    `\n${t('letter.bodyGreeting', undefined, lang)}\n`,
    t('letter.bodyP1', {
      cardNumber: household.cardNumber,
      headName: household.headName,
      category: categoryCode,
      colour: colourName,
    }, lang),
    '\n' + t('letter.bodyP2', {
      month: formattedMonth,
      members: evaluation.membersCounted,
      appliedRule: appliedRuleText || 'Standard Entitlement',
      entitled: primaryEntitled,
      unit: primaryUnit,
    }, lang),
    '\n' + t('letter.bodyP3', {
      confirmed: primaryConfirmed,
      unit: primaryUnit,
      diff: primaryDiff,
      pending: primaryPending,
    }, lang),
    '\n' + t('report.disclaimerTop', undefined, lang),
    '\nItem-wise Breakdown:\n' + itemsSummary,
    evidenceList ? `\nAvailable Distribution Evidence:\n${evidenceList}` : '',
    userRemarks ? `\nAdditional Notes:\n${userRemarks}` : '',
    '\n' + t('letter.bodyP4', undefined, lang),
    '\n' + t('letter.bodySign', {
      headName: household.headName,
      cardNumber: household.cardNumber,
      date: todayStr,
    }, lang),
  ].filter(Boolean).join('\n');

  // Pass through Neutrality Guard
  const neutralityResult = sanitizeNeutrality(baseLetterBody);

  const handleCopy = () => {
    navigator.clipboard.writeText(neutralityResult.sanitizedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Download actual .pdf file using jsPDF
  const handleSavePdf = () => {
    try {
      downloadGrievancePdf(neutralityResult.sanitizedText, household, evaluation.refDate, lang);
    } catch (err) {
      console.error('PDF generation failed, falling back to printable HTML document:', err);
      handleDownloadHtml();
    }
  };

  // Build clean standalone printable HTML content
  const getPrintableHtml = () => {
    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>Grievance_Letter_${household.cardNumber}</title>
  <style>
    body { font-family: "Georgia", "Times New Roman", serif; padding: 40px; color: #111; line-height: 1.6; max-width: 800px; margin: auto; }
    h1 { font-size: 18pt; text-align: center; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 20px; }
    .letter-body { white-space: pre-wrap; font-size: 11pt; }
    .footer-note { margin-top: 40px; font-size: 9pt; color: #666; border-top: 1px solid #ccc; padding-top: 10px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>PUBLIC DISTRIBUTION SYSTEM GRIEVANCE DRAFT</h1>
  <div class="letter-body">${neutralityResult.sanitizedText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
  <div class="footer-note">
    Generated via RationSaathi Decision Support Prototype • Neutral Administrative Evidence Draft
  </div>
</body>
</html>`;
  };

  // Safe Print utilizing iframe injection to bypass sandbox restrictions
  const handlePrint = () => {
    try {
      printHtmlViaIframe(getPrintableHtml());
    } catch (err) {
      console.warn('Iframe print failed, attempting direct window.print:', err);
      window.print();
    }
  };

  // Download standalone printable document
  const handleDownloadHtml = () => {
    const htmlContent = getPrintableHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Grievance_Letter_${household.cardNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download plain text file
  const handleDownloadTxt = () => {
    const blob = new Blob([neutralityResult.sanitizedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Grievance_Letter_${household.cardNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto modal-backdrop-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-3xl w-full my-8 flex flex-col max-h-[90vh] modal-container-print">
        {/* Modal Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              {t('letter.title', undefined, lang)}
            </h2>
            <p className="text-xs text-amber-700 font-medium mt-1">
              {t('letter.draftNotice', undefined, lang)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Neutrality Guard Status Badge */}
          <div className="flex items-center justify-between p-3 rounded-lg border text-xs font-medium bg-emerald-50 border-emerald-200 text-emerald-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                {neutralityResult.maskedCount === 0
                  ? t('guard.passed', undefined, lang)
                  : t('guard.masked', { count: neutralityResult.maskedCount }, lang)}
              </span>
            </div>
            <span className="text-[11px] text-stone-500">
              Rule-based objective verification
            </span>
          </div>

          {/* User-editable placeholder fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Authority Name / Post
              </label>
              <input
                type="text"
                placeholder="e.g. The Tahsildar / DSO"
                value={authorityName}
                onChange={(e) => setAuthorityName(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Office / Tehsil Address
              </label>
              <input
                type="text"
                placeholder="e.g. Taluka Office, Ward 4"
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Local Helpline / Ref Code
              </label>
              <input
                type="text"
                placeholder="e.g. 1967 or Local desk"
                value={helplineNumber}
                onChange={(e) => setHelplineNumber(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Additional factual remarks */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Additional factual notes from card holder (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Card holder visited shop on 5th and 12th of the month"
              value={userRemarks}
              onChange={(e) => setUserRemarks(e.target.value)}
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Live Letter Preview */}
          <div className="border border-stone-300 rounded-xl p-5 bg-stone-50 font-serif text-sm text-stone-800 leading-relaxed whitespace-pre-wrap shadow-inner max-h-72 overflow-y-auto print-area">
            {neutralityResult.sanitizedText}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 rounded-b-2xl flex flex-wrap items-center justify-between gap-3 no-print">
          <span className="text-xs text-stone-500">
            Factual draft for administrative review.
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSavePdf}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
              title="Download clean .pdf document"
            >
              <FileDown className="w-3.5 h-3.5" />
              Save as PDF (.pdf)
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 border border-stone-300 bg-white hover:bg-stone-100 rounded-lg text-xs font-semibold text-stone-700 flex items-center gap-1.5 transition cursor-pointer"
              title="Print letter directly"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={handleDownloadHtml}
              className="px-3 py-2 border border-stone-300 bg-white hover:bg-stone-100 rounded-lg text-xs font-semibold text-stone-700 flex items-center gap-1.5 transition cursor-pointer"
              title="Download HTML file"
            >
              <Download className="w-3.5 h-3.5" />
              HTML
            </button>
            <button
              onClick={handleDownloadTxt}
              className="px-3 py-2 border border-stone-300 bg-white hover:bg-stone-100 rounded-lg text-xs font-semibold text-stone-700 flex items-center gap-1.5 transition cursor-pointer"
              title="Download plain text file"
            >
              TXT
            </button>
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-stone-900 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t('letter.copied', undefined, lang) : t('btn.copyLetter', undefined, lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
