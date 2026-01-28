import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';

export const exportToPDF = (schedule, loanDetails) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Амортизационна таблица', 20, 20);
  
  doc.setFontSize(11);
  doc.text(`Кредит: ${loanDetails.amount.toLocaleString()} EUR`, 20, 30);
  doc.text(`Лихва: ${loanDetails.interestRate}%`, 20, 37);
  doc.text(`Срок: ${loanDetails.term} месеца`, 20, 44);
  doc.text(`Месечна вноска: ${loanDetails.monthlyPayment.toFixed(2)} EUR`, 20, 51);
  
  doc.setFontSize(9);
  let y = 65;
  const pageHeight = 280;
  
  // Заглавия
  doc.text('Месец', 20, y);
  doc.text('Вноска', 55, y);
  doc.text('Главница', 85, y);
  doc.text('Лихва', 120, y);
  doc.text('Остатък', 150, y);
  y += 7;
  
  schedule.forEach((row, idx) => {
    if (y > pageHeight) {
      doc.addPage();
      y = 20;
      doc.text('Месец', 20, y);
      doc.text('Вноска', 55, y);
      doc.text('Главница', 85, y);
      doc.text('Лихва', 120, y);
      doc.text('Остатък', 150, y);
      y += 7;
    }
    
    doc.text(row.month.toString(), 20, y);
    doc.text(row.payment.toFixed(2), 55, y);
    doc.text(row.principal.toFixed(2), 85, y);
    doc.text(row.interest.toFixed(2), 120, y);
    doc.text(row.balance.toFixed(2), 150, y);
    y += 5;
  });
  
  doc.save('amortization-schedule.pdf');
};

export const exportToCSV = (schedule) => {
  const headers = ['Месец', 'Вноска (EUR)', 'Главница (EUR)', 'Лихва (EUR)', 'Остатък (EUR)'];
  const rows = schedule.map(row => [
    row.month,
    row.payment.toFixed(2),
    row.principal.toFixed(2),
    row.interest.toFixed(2),
    row.balance.toFixed(2)
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'amortization-schedule.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function AmortizationExport({ schedule, loanDetails }) {
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => exportToPDF(schedule, loanDetails)}
        className="text-xs"
      >
        <Download className="w-3 h-3 mr-1" />
        PDF
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => exportToCSV(schedule)}
        className="text-xs"
      >
        <FileSpreadsheet className="w-3 h-3 mr-1" />
        Excel
      </Button>
    </div>
  );
}