// src/utils/exportPDF.js
// FR15 - Export daily appointment summary to PDF
// Uses jsPDF + jspdf-autotable to produce a printable summary

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export a daily appointment summary to PDF.
 *
 * @param {string} dateStr - ISO date string (YYYY-MM-DD) for the day being exported.
 * @param {Array}  rows    - Each row should have: time, patient, patientNumber,
 *                           practitioner, reason, status.
 */
export function exportDailyAppointmentsPDF(dateStr, rows) {
  const doc = new jsPDF();

 
  doc.setFontSize(16);
  doc.text('CASS - Daily Appointment Summary', 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(100);
  const generatedAt = new Date().toLocaleString();
  doc.text(`Date: ${dateStr}`, 14, 26);
  doc.text(`Generated: ${generatedAt}`, 14, 32);
  doc.text(`Total appointments: ${rows.length}`, 14, 38);

  // Table
  autoTable(doc, {
    startY: 44,
    head: [['Time', 'Patient No.', 'Patient', 'Practitioner', 'Reason', 'Status']],
    body: rows.map((r) => [
      r.time || '-',
      r.patientNumber || '-',
      r.patient || '-',
      r.practitioner || '-',
      r.reason || '-',
      r.status || '-'
    ]),
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [107, 88, 118] },  
    alternateRowStyles: { fillColor: [245, 243, 247] }
  });

  
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() - 30,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  
  doc.save(`cass-appointments-${dateStr}.pdf`);
}