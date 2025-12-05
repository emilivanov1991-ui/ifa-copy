import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

// Генериране на уникален номер на оферта
function generateOfferNumber() {
  const timestamp = Date.now().toString().slice(-10);
  return timestamp;
}

// Форматиране на дата
function formatDate(date, format = 'dmy') {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  if (format === 'ymd') return `${year}-${month}-${day}`;
  if (format === 'dmy-dot') return `${day}-${month}-${year}`;
  return `${day}.${month}.${year}`;
}

// Форматиране на сума
function formatCurrency(amount) {
  return new Intl.NumberFormat('bg-BG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Генерира PDF оферта за ДЗИ Каско+
 */
export function generateDZICascoPDF(offerData) {
  const {
    // Данни за кандидата
    clientName = '',
    clientBirthDate = '',
    
    // Данни за МПС
    regNumber = '',
    vin = '',
    vehicleType = 'Лек автомобил',
    brand = '',
    model = '',
    year = '',
    firstRegDate = '',
    purpose = 'Лично ползване',
    rightHandDrive = 'Не',
    
    // Застраховка
    insuranceClause = 'КЛАУЗА ПЪЛНО КАСКО',
    additionalAgreements = 'ОФИЦИАЛЕН СЕРВИЗ',
    insuranceSum = 0,
    roadsideAssistance = 'Клаузи "Премиум и Чужбина"',
    term = '12 месеца',
    startDate = null,
    paymentMethod = 'Еднократно',
    
    // Премии
    cascoPremium = 0,
    roadsidePremium = 20.00,
    
    // Отстъпки
    discounts = [],
    
    // Офис данни
    agencyName = 'ПАРТНЪРС ГРУП БГ ООД',
    agencyCode = '21363984',
    
    // Валидност
    validUntil = null
  } = offerData;

  const offerNumber = generateOfferNumber();
  const offerDate = formatDate(new Date(), 'ymd');
  const totalPremium = cascoPremium + roadsidePremium;
  const dzp = totalPremium * 0.02;
  const totalDue = totalPremium + dzp;
  
  // Валидност - 30 дни от днес
  const validUntilDate = validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Създаване на PDF
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  // Хедър
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('"ДЗИ - ОБЩО ЗАСТРАХОВАНЕ" ЕАД', margin, y);
  y += 4;
  doc.text('Република България, гр. София, ул. "Г. Бенковски" № 3', margin, y);
  y += 4;
  doc.text('Главна агенция София', margin, y);
  y += 4;
  doc.text('Адрес: гр. София 1000', margin, y);
  y += 4;
  doc.text('ул. "Г.Бенковски" 3', margin, y);
  y += 4;
  doc.text('Тел.: (+359/02) 981 57 99', margin, y);

  // Лого текст (дясно)
  doc.setFontSize(8);
  doc.setTextColor(0, 128, 128);
  doc.text('Национален номер 0700 16 166', pageWidth - margin - 45, 15);
  doc.text('www.dzi.bg', pageWidth - margin - 45, 19);
  
  // ДЗИ лого placeholder
  doc.setFillColor(0, 128, 128);
  doc.rect(pageWidth - margin - 15, 10, 15, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('ДЗИ', pageWidth - margin - 13, 18);

  // Заглавие на офертата
  y = 45;
  doc.setTextColor(0, 100, 150);
  doc.setFontSize(14);
  doc.text(`Оферта № ${offerNumber} / ${offerDate} г. "КАСКО+"`, pageWidth / 2, y, { align: 'center' });

  // Подзаглавие
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('Имаме удоволствието да предоставим на Вашето внимание настоящата оферта за сключване на автомобилна застраховка "Каско+":', margin, y);

  // Таблица с данни
  y += 10;
  const col1 = margin;
  const col2 = 65;
  const col3 = 105;
  const rowHeight = 6;

  // Функция за рисуване на ред
  const drawRow = (label1, label2, value, isHeader = false) => {
    if (isHeader) {
      doc.setFillColor(240, 240, 240);
      doc.rect(col1, y - 4, pageWidth - 2 * margin, rowHeight, 'F');
    }
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(label1, col1, y);
    if (label2) {
      doc.text(label2, col2, y);
    }
    doc.setTextColor(0, 0, 0);
    doc.text(String(value), col3, y);
    y += rowHeight;
  };

  // Кандидат за застраховане
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text('Кандидат за застраховане', col1, y);
  doc.text('Име', col2, y);
  doc.setTextColor(0, 0, 0);
  doc.text(clientName, col3, y);
  y += rowHeight;

  doc.setTextColor(80, 80, 80);
  doc.text('', col1, y);
  doc.text('Рождена дата:', col2, y);
  doc.setTextColor(0, 0, 0);
  doc.text(clientBirthDate ? formatDate(clientBirthDate, 'dmy-dot') + ' г.' : '', col3, y);
  y += rowHeight;

  // Данни за МПС
  doc.setTextColor(80, 80, 80);
  doc.text('Данни за МПС подлежащо на', col1, y);
  doc.text('Регистрационен номер', col2, y);
  doc.setTextColor(0, 0, 0);
  doc.text(regNumber, col3, y);
  y += rowHeight;

  doc.setTextColor(80, 80, 80);
  doc.text('застраховане', col1, y);
  doc.text('Рама №', col2, y);
  doc.setTextColor(0, 0, 0);
  doc.text(vin, col3, y);
  y += rowHeight;

  doc.setTextColor(80, 80, 80);
  doc.text('', col1, y);
  doc.text('Вид', col2, y);
  doc.setTextColor(0, 0, 0);
  doc.text(vehicleType, col3, y);
  y += rowHeight;

  doc.setTextColor(80, 80, 80);
  doc.text('', col1, y);
  doc.text('Марка', col2, y);
  doc.setTextColor(0, 0, 0);
  doc.text(brand.toUpperCase(), col3, y);
  y += rowHeight;

  doc.setTextColor(80, 80, 80);
  doc.text('', col1, y);
  doc.text('Модел', col2, y);
  doc.setTextColor(0, 0, 0);
  doc.text(model.toUpperCase(), col3, y);
  y += rowHeight;

  doc.setTextColor(80, 80, 80);
  doc.text('', col1, y);
  doc.text('Година на производство', col2, y);
  doc.setTextColor(0, 0, 0);
  doc.text(`${year} г.`, col3, y);
  y += rowHeight;

  doc.setTextColor(80, 80, 80);
  doc.text('', col1, y);
  doc.text('Дата на първа регистрация', col2, y);
  doc.setTextColor(0, 0, 0);
  doc.text(firstRegDate ? formatDate(firstRegDate, 'dmy-dot') + ' г.' : '', col3, y);
  y += rowHeight;

  doc.setTextColor(80, 80, 80);
  doc.text('', col1, y);
  doc.text('Предназначение', col2, y);
  doc.setTextColor(0, 0, 0);
  doc.text(purpose, col3, y);
  y += rowHeight;

  doc.setTextColor(80, 80, 80);
  doc.text('', col1, y);
  doc.text('Десен волан', col2, y);
  doc.setTextColor(0, 0, 0);
  doc.text(rightHandDrive, col3, y);
  y += rowHeight + 3;

  // Линия
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // Застраховка Каско+
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text('ЗАСТРАХОВКА "КАСКО+"', col1, y);
  doc.setTextColor(0, 0, 0);
  doc.text(insuranceClause, col3, y);
  y += rowHeight;

  doc.setTextColor(80, 80, 80);
  doc.text('Допълнителни договорености', col1, y);
  doc.setTextColor(0, 0, 0);
  doc.text(additionalAgreements, col3, y);
  y += rowHeight;

  // Териториално покритие
  doc.setTextColor(80, 80, 80);
  doc.text('Териториално покритие', col1, y);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(7);
  const territory = 'Република България, държавите-членки на Европейския съюз (ЕС) и държавите членки на';
  const territory2 = 'Международното споразумение "Зелена карта".';
  doc.text(territory, col3, y);
  y += 4;
  doc.text(territory2, col3, y);
  y += 4;
  
  // Изключения
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  const exclusion1 = 'Не се покриват щети по рисковете "Кражба на цяло МПС", "Грабеж на цяло МПС", "Пожар и/или експлозия вследствие на';
  const exclusion2 = 'техническа неизправност" и "Умишлен палеж или взривяване на МПС", когато събитието е настъпило на териториите на';
  const exclusion3 = 'страните Русия, Украйна, Беларус, Молдова, Албания, Босна и Херцеговина, Република Косово и на територията на';
  const exclusion4 = 'държавите членки на Международното споразумение "Зелена карта", които са извън Европа с изключение на Република';
  const exclusion5 = 'Турция.';
  doc.text(exclusion1, col3, y);
  y += 3;
  doc.text(exclusion2, col3, y);
  y += 3;
  doc.text(exclusion3, col3, y);
  y += 3;
  doc.text(exclusion4, col3, y);
  y += 3;
  doc.text(exclusion5, col3, y);
  y += 6;

  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text('Застрахователна сума', col1, y);
  doc.setTextColor(0, 0, 0);
  doc.text(`${formatCurrency(insuranceSum)} лева`, col3, y);
  y += rowHeight + 3;

  // Помощ на пътя
  doc.setTextColor(80, 80, 80);
  doc.text('ЗАСТРАХОВКА ПОМОЩ НА', col1, y);
  doc.setTextColor(0, 0, 0);
  doc.text(roadsideAssistance, col3, y);
  y += rowHeight;
  doc.setTextColor(80, 80, 80);
  doc.text('ПЪТЯ', col1, y);
  y += rowHeight;

  doc.setTextColor(80, 80, 80);
  doc.text('Срок на застраховката', col1, y);
  doc.setTextColor(0, 0, 0);
  doc.text(term, col3, y);
  y += rowHeight;

  doc.setTextColor(80, 80, 80);
  doc.text('Начало на застраховката', col1, y);
  doc.setTextColor(0, 0, 0);
  doc.text('00:00 часа на деня, посочен в полицата за начало на застраховката', col3, y);
  y += rowHeight;

  doc.setTextColor(80, 80, 80);
  doc.text('Начин на плащане', col1, y);
  doc.setTextColor(0, 0, 0);
  doc.text(paymentMethod, col3, y);
  y += rowHeight;

  // Премии
  doc.setTextColor(80, 80, 80);
  doc.text('Застрахователна премия по', col1, y);
  doc.setTextColor(0, 0, 0);
  doc.text(`${formatCurrency(cascoPremium)} лева`, col3, y);
  y += rowHeight;
  doc.setTextColor(80, 80, 80);
  doc.text('застраховка "Каско+"', col1, y);
  y += rowHeight;

  doc.setTextColor(80, 80, 80);
  doc.text('Застрахователна премия по', col1, y);
  doc.setTextColor(0, 0, 0);
  doc.text(`${formatCurrency(roadsidePremium)} лева`, col3, y);
  y += rowHeight;
  doc.setTextColor(80, 80, 80);
  doc.text('застраховка "Помощ на пътя"', col1, y);
  y += rowHeight;

  doc.setTextColor(80, 80, 80);
  doc.text('Обща дължима застрахователна', col1, y);
  doc.setTextColor(0, 0, 0);
  doc.text(`${formatCurrency(totalPremium)} лева`, col3, y);
  y += rowHeight;
  doc.setTextColor(80, 80, 80);
  doc.text('премия', col1, y);
  y += rowHeight + 2;

  // ДЗП и общо
  doc.setTextColor(80, 80, 80);
  doc.text('ДЗП 2%:', col1, y);
  doc.setTextColor(0, 0, 0);
  doc.text(`${formatCurrency(dzp)} лева`, col3, y);
  y += rowHeight;

  doc.setFillColor(240, 248, 255);
  doc.rect(col1, y - 4, pageWidth - 2 * margin, rowHeight + 2, 'F');
  doc.setTextColor(80, 80, 80);
  doc.text('Общо дължима сума:', col1, y);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.text(`${formatCurrency(totalDue)} лева`, col3, y);
  y += rowHeight;
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text('(застрахователна премия + ДЗП 2%)', col1, y);
  y += rowHeight + 5;

  // Приложени отстъпки
  if (discounts.length > 0) {
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text('Приложени отстъпки:', col1, y);
    y += 4;
    doc.setFontSize(7);
    
    const discountText = discounts.map(d => `• ${d}`).join(';  ');
    const lines = doc.splitTextToSize(discountText, pageWidth - 2 * margin);
    lines.forEach(line => {
      doc.text(line, col1, y);
      y += 3;
    });
  }

  // Страница 2
  doc.addPage();
  y = margin;

  // Допълнителен текст
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  
  const disclaimerTexts = [
    'При завеждане на щета в периода между датата на издаване на офертата и сключването на полицата Застрахователят има правото да',
    'промени цената.',
    '',
    'Офертата е изготвена на база предварителни данни. При промяна на посочените параметри, както и при промени в тарифната политика на',
    'ДЗИ, е възможна промяна и на крайната цена. Неделима част от настоящата оферта са Общи условия по автомобилна застраховка',
    '"Каско+" на "ДЗИ - Общо застраховане" ЕАД.',
    '',
    `Валидност на офертата: до ${formatDate(validUntilDate, 'dmy-dot')} г. *`,
    '',
    'С удоволствие оставаме на Ваше разположение за уточняване на параметрите на застраховката, които да удовлетворят в пълна степен',
    'застрахователните Ви интереси.',
    '',
    'С уважение,',
    '"ДЗИ - Общо застраховане" ЕАД',
    '',
    `Изготвил офертата: ${agencyName} ; № на участък: ${agencyCode}`
  ];

  disclaimerTexts.forEach(text => {
    doc.text(text, margin, y);
    y += 5;
  });

  return doc;
}

/**
 * Компонент за генериране и изтегляне на PDF оферта
 */
export default function DZICascoOfferPDF({ offerData, onGenerated }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const doc = generateDZICascoPDF(offerData);
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      
      if (onGenerated) {
        onGenerated(url);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `DZI_Casco_Offer_${offerData.brand}_${offerData.model}_${offerData.year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        variant="outline"
        className="gap-2"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        Генерирай PDF оферта
      </Button>
      
      {pdfUrl && (
        <Button onClick={handleDownload} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4" />
          Изтегли PDF
        </Button>
      )}
    </div>
  );
}