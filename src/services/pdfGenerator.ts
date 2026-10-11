/**
 * Client-Side PDF and Print Generation Service
 * Generates valid downloadable .pdf files using jsPDF without external network calls.
 * Also provides an in-app clean printable iframe fallback for environments where window.print is restricted.
 */

import { jsPDF } from 'jspdf';
import { CardType, Household, HouseholdMonthlyEvaluation, LanguageCode, AppSettings } from '../types';
import { formatIsoToDisplay, formatMonthName } from './dateHelpers';
import { formatGramsToQtyString } from './numberHelpers';
import { formatItemName, t } from './translations';

/**
 * Generates and triggers download of a clean Grievance Letter PDF document
 */
export function downloadGrievancePdf(
  letterText: string,
  household: Household,
  refDate: string,
  lang: LanguageCode = 'en'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Title Header
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.text('PUBLIC DISTRIBUTION SYSTEM GRIEVANCE DRAFT', pageWidth / 2, 22, { align: 'center' });

  // Subtitle / Notice
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(
    'RationSaathi Decision Support Prototype • Neutral Administrative Evidence Draft',
    pageWidth / 2,
    28,
    { align: 'center' }
  );

  // Divider Line
  doc.setDrawColor(50, 50, 50);
  doc.setLineWidth(0.5);
  doc.line(margin, 32, pageWidth - margin, 32);

  // Meta box
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text(`Card Number: ${household.cardNumber}`, margin, 38);
  doc.text(`Head of Household: ${household.headName}`, margin + 60, 38);
  doc.text(`Reference Date: ${formatIsoToDisplay(refDate)}`, margin + 120, 38);

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(margin, 42, pageWidth - margin, 42);

  // Letter Body
  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);

  // Split letter text to fit within content width
  const splitLines = doc.splitTextToSize(letterText, contentWidth);
  let yPos = 50;

  for (let i = 0; i < splitLines.length; i++) {
    if (yPos > pageHeight - 25) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(splitLines[i], margin, yPos);
    yPos += 5.5;
  }

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.text(
      'Factual record for administrative clarification. Does not assert wrongdoing or fraud.',
      margin,
      pageHeight - 8
    );
    doc.text(`Page ${page} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  const filename = `Grievance_Letter_${household.cardNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  doc.save(filename);
}

/**
 * Generates and triggers download of an Entitlement & Discrepancy Report PDF
 */
export function downloadReportPdf(
  evaluation: HouseholdMonthlyEvaluation,
  household: Household,
  cardType: CardType | null,
  settings: AppSettings,
  lang: LanguageCode
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('RationSaathi — Entitlement & Distribution Report', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(220, 220, 220);
  doc.text(
    `Household: ${household.headName} | Card: ${household.cardNumber} | Month: ${formatMonthName(settings.selectedMonth, lang)}`,
    margin,
    19
  );

  let y = 34;

  // Summary Card Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('Card Category:', margin + 4, y + 6);
  doc.text('Counted Members:', margin + 60, y + 6);
  doc.text('Cut-Off Date:', margin + 120, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${cardType?.name || 'Default'} (${cardType?.category || 'None'})`, margin + 4, y + 12);
  doc.text(`${evaluation.membersCounted} active members`, margin + 60, y + 12);
  doc.text(`${formatIsoToDisplay(evaluation.refDate)}`, margin + 120, y + 12);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Factual discrepancy report comparing recorded entries against entered entitlement rules.',
    margin + 4,
    y + 19
  );

  y += 30;

  // Render each item section
  evaluation.items.forEach((it, idx) => {
    if (y > pageHeight - 50) {
      doc.addPage();
      y = 20;
    }

    // Item Header Box
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    const itemName = `${formatItemName(it.rule.itemKey, lang)} [${it.rule.mode}]`;
    doc.text(itemName, margin + 4, y + 8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    const statusText = `Status: ${it.classification}`;
    doc.text(statusText, pageWidth - margin - 4, y + 8, { align: 'right' });

    y += 16;

    // Item Stats Grid
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    const statsLine1 = `Entitled: ${formatGramsToQtyString(it.entitled)} ${it.rule.unit}  |  Confirmed: ${formatGramsToQtyString(it.confirmedTotal)} ${it.rule.unit}  |  Pending: ${formatGramsToQtyString(it.pendingTotal)} ${it.rule.unit}`;
    doc.text(statsLine1, margin + 2, y);
    y += 5;

    const statsLine2 = `Difference (Confirmed): ${formatGramsToQtyString(it.remaining)} ${it.rule.unit}  |  Diff if Pending Confirmed: ${formatGramsToQtyString(it.diffIfPendingConfirmed)} ${it.rule.unit}`;
    doc.text(statsLine2, margin + 2, y);
    y += 5;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const reasonText = doc.splitTextToSize(`Basis: ${it.classificationReason}`, contentWidth - 4);
    doc.text(reasonText, margin + 2, y);
    y += reasonText.length * 4.5 + 3;

    // Records mini-table
    if (it.records.length > 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 5.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text('Date', margin + 2, y + 4);
      doc.text('Quantity', margin + 30, y + 4);
      doc.text('Status', margin + 60, y + 4);
      doc.text('Source / Ref', margin + 95, y + 4);
      doc.text('Entered By', margin + 140, y + 4);
      y += 6.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);

      it.records.forEach((rec) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        doc.text(formatIsoToDisplay(rec.date), margin + 2, y + 3.5);
        doc.text(`${formatGramsToQtyString(rec.qty)} ${it.rule.unit}`, margin + 30, y + 3.5);
        doc.text(rec.status, margin + 60, y + 3.5);
        doc.text((rec.sourceRef || rec.sourceType).slice(0, 22), margin + 95, y + 3.5);
        doc.text((rec.enteredByName || 'Shopkeeper').slice(0, 20), margin + 140, y + 3.5);

        doc.setDrawColor(241, 245, 249);
        doc.line(margin, y + 4.5, pageWidth - margin, y + 4.5);
        y += 5;
      });
      y += 4;
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('No transaction records entered for this item in selected month.', margin + 2, y + 3);
      y += 7;
    }

    y += 4;
  });

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
    doc.text('Generated via RationSaathi • Neutral Administrative Record', margin, pageHeight - 6);
    doc.text(`Page ${page} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  const filename = `RationSaathi_Report_${household.cardNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}_${settings.selectedMonth}.pdf`;
  doc.save(filename);
}

/**
 * Triggers browser print using a hidden iframe to bypass parent sandbox restrictions
 */
export function printHtmlViaIframe(htmlContent: string): void {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.warn('Iframe print failed, falling back to window.print', e);
        window.print();
      } finally {
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1500);
      }
    }, 400);
  }
}
