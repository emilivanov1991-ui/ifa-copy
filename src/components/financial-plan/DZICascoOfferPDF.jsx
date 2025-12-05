import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, Eye } from 'lucide-react';
import { jsPDF } from 'jspdf';

// Генериране на номер на оферта
function generateOfferNumber() {
  const prefix = '25';
  const random = Math.floor(Math.random() * 900000000) + 100000000;
  return `${prefix}${random}`;
}

// Форматиране на дата
function formatDate(date, format = 'dd-mm-yyyy') {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  if (format === 'yyyy-mm-dd') return `${year}-${month}-${day}`;
  return `${day}-${month}-${year}`;
}

// Форматиране на сума
function formatCurrency(amount) {
  return amount.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Генерира PDF оферта за ДЗИ Каско+
 */
export async function generateDZICascoPDF(offerData) {
  const {
    // Данни за клиента
    clientName,
    clientBirthdate,
    
    // Данни за МПС
    regNumber = '',
    vinNumber = '',
    vehicleType = 'Лек автомобил',
    brand,
    model,
    productionYear,
    firstRegDate = '',
    purpose = 'Лично ползване',
    rightHandDrive = 'Не',
    
    // Застраховка
    clauseType = 'КЛАУЗА ПЪЛНО КАСКО',
    additionalAgreements = 'ДОВЕРЕН СЕРВИЗ',
    territorialCoverage = 'Република България, държавите-членки на Европейския съюз (ЕС) и държавите членки на Международното споразумение "Зелена карта".',
    exclusions = 'Не се покриват щети по рисковете "Кражба на цяло МПС", "Грабеж на цяло МПС", "Пожар и/или експлозия вследствие на техническа неизправност" и "Умишлен палеж или взривяване на МПС", когато събитието е настъпило на териториите на страните Русия, Украйна, Беларус, Молдова, Албания, Босна и Херцеговина, Република Косово и на територията на държавите членки на Международното споразумение "Зелена карта", които са извън Европа с изключение на Република Турция.',
    insuranceSum,
    
    // Помощ на пътя
    roadsideAssistance = 'Клаузи "Премиум и Чужбина"',
    
    // Срокове
    insuranceTerm = '12 месеца',
    startDate,
    paymentMethod = 'Еднократно',
    
    // Премии
    cascoPremium,
    roadsidePremium = 20.00,
    
    // Отстъпки
    discounts = ['Бонус-Малус стъпало', 'Валидна застраховка "ГО"', 'Еднократно плащане'],
    
    // Изготвил
    preparedBy = 'ПАРТНЪРС ГРУП БГ ООД',
    sectionNumber = '21363984',
    
    // Валидност
    validUntil
  } = offerData;

  const offerNumber = generateOfferNumber();
  const offerDate = formatDate(new Date(), 'yyyy-mm-dd');
  const totalPremium = cascoPremium + roadsidePremium;
  const dzpTax = totalPremium * 0.02;
  const totalDue = totalPremium + dzpTax;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Шрифт (използваме стандартен, тъй като кирилица изисква специален шрифт)
  doc.setFont('helvetica');

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  // === HEADER ===
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('"DZI - ОБЩО ЗАСТРАХОВАНЕ" ЕАД', margin, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Република България, гр. София, ул. "Г. Бенковски" № 3', margin, y);
  y += 3.5;
  doc.text('Главна агенция София', margin, y);
  y += 3.5;
  doc.text('Адрес: гр. София 1000', margin, y);
  y += 3.5;
  doc.text('ул. "Г.Бенковски" 3', margin, y);
  y += 3.5;
  doc.text('Тел.: (+359/02) 981 57 99', margin, y);

  // Лого/Контакт дясно
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 102, 153);
  doc.text('Национален номер 0700 16 166', pageWidth - margin - 50, margin + 4);
  doc.text('www.dzi.bg', pageWidth - margin - 50, margin + 8);
  doc.setTextColor(0, 0, 0);

  // DZI лого placeholder
  doc.setFillColor(0, 102, 153);
  doc.roundedRect(pageWidth - margin - 20, margin, 20, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DZI', pageWidth - margin - 13, margin + 7);
  doc.setTextColor(0, 0, 0);

  y += 10;

  // === ЗАГЛАВИЕ ===
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const title = `Оферта № ${offerNumber} / ${offerDate} г. "КАСКО+"`;
  doc.text(title, pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Имаме удоволствието да предоставим на Вашето внимание настоящата оферта за сключване на автомобилна застраховка "Каско+":', margin, y);
  y += 8;

  // === ТАБЛИЦА ===
  const col1 = margin;
  const col2 = 65;
  const col3 = 95;
  const rowHeight = 6;

  function drawTableRow(label1, label2, value, isHeader = false) {
    if (isHeader) {
      doc.setFillColor(240, 240, 240);
      doc.rect(col1, y - 4, contentWidth, rowHeight, 'F');
    }
    doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
    doc.setFontSize(8);
    if (label1) doc.text(label1, col1 + 2, y);
    if (label2) doc.text(label2, col2 + 2, y);
    if (value) doc.text(String(value), col3 + 2, y);
    y += rowHeight;
  }

  // Кандидат за застраховане
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  
  // Рамка на таблицата
  const tableStartY = y - 4;
  
  drawTableRow('Кандидат за застраховане', 'Име', clientName);
  drawTableRow('', 'Рождена дата:', formatDate(clientBirthdate) + ' г.');
  
  y += 2;
  
  // Данни за МПС
  drawTableRow('Данни за МПС подлежащо на', 'Регистрационен номер', regNumber);
  drawTableRow('застраховане', 'Рама №', vinNumber);
  drawTableRow('', 'Вид', vehicleType);
  drawTableRow('', 'Марка', brand);
  drawTableRow('', 'Модел', model);
  drawTableRow('', 'Година на производство', `${productionYear} г.`);
  drawTableRow('', 'Дата на първа регистрация', firstRegDate ? formatDate(firstRegDate) + ' г.' : '');
  drawTableRow('', 'Предназначение', purpose);
  drawTableRow('', 'Десен волан', rightHandDrive);

  y += 4;

  // Застраховка КАСКО+
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('ЗАСТРАХОВКА "КАСКО+"', col1, y);
  doc.text(clauseType, col2, y);
  y += rowHeight;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Допълнителни договорености', col1, y);
  doc.text(additionalAgreements, col2, y);
  y += rowHeight;

  // Териториално покритие
  doc.text('Териториално покритие', col1, y);
  const coverageLines = doc.splitTextToSize(territorialCoverage, contentWidth - col2 + margin);
  doc.text(coverageLines, col2, y);
  y += coverageLines.length * 4 + 2;

  // Изключения
  const exclusionLines = doc.splitTextToSize(exclusions, contentWidth - col2 + margin);
  doc.text(exclusionLines, col2, y);
  y += exclusionLines.length * 4 + 4;

  // Застрахователна сума
  doc.text('Застрахователна сума', col1, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatCurrency(insuranceSum)} лева`, col2, y);
  doc.setFont('helvetica', 'normal');
  y += rowHeight + 2;

  // Помощ на пътя
  doc.setFont('helvetica', 'bold');
  doc.text('ЗАСТРАХОВКА ПОМОЩ НА ПЪТЯ', col1, y);
  doc.setFont('helvetica', 'normal');
  doc.text(roadsideAssistance, col2, y);
  y += rowHeight;

  // Срок
  doc.text('Срок на застраховката', col1, y);
  doc.text(insuranceTerm, col2, y);
  y += rowHeight;

  // Начало
  doc.text('Начало на застраховката', col1, y);
  doc.text('00:00 часа на деня, посочен в полицата за начало на застраховката', col2, y);
  y += rowHeight;

  // Начин на плащане
  doc.text('Начин на плащане', col1, y);
  doc.text(paymentMethod, col2, y);
  y += rowHeight + 2;

  // Премии
  doc.text('Застрахователна премия по', col1, y);
  y += 4;
  doc.text('застраховка "Каско+"', col1, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatCurrency(cascoPremium)} лева`, col2, y);
  doc.setFont('helvetica', 'normal');
  y += rowHeight;

  doc.text('Застрахователна премия по', col1, y);
  y += 4;
  doc.text('застраховка "Помощ на пътя"', col1, y);
  doc.text(`${formatCurrency(roadsidePremium)} лева`, col2, y);
  y += rowHeight;

  doc.text('Обща дължима застрахователна', col1, y);
  y += 4;
  doc.text('премия', col1, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatCurrency(totalPremium)} лева`, col2, y);
  doc.setFont('helvetica', 'normal');
  y += rowHeight + 2;

  // ДЗП
  doc.text('ДЗП 2%:', col1, y);
  doc.text(`${formatCurrency(dzpTax)} лева`, col2, y);
  y += rowHeight;

  // Общо дължима сума
  doc.setFont('helvetica', 'bold');
  doc.text('Общо дължима сума:', col1, y);
  doc.text(`${formatCurrency(totalDue)} лева`, col2, y);
  doc.setFont('helvetica', 'normal');
  y += 4;
  doc.setFontSize(7);
  doc.text('(застрахователна премия + ДЗП 2%)', col1, y);
  y += rowHeight + 4;

  // Отстъпки
  doc.setFontSize(8);
  doc.text('Приложени отстъпки:', col1, y);
  y += 5;
  discounts.forEach((discount, index) => {
    doc.text(`• ${discount};`, col1 + (index % 3) * 55, y + Math.floor(index / 3) * 4);
  });
  y += Math.ceil(discounts.length / 3) * 4 + 8;

  // === СТРАНИЦА 2 ===
  doc.addPage();
  y = margin;

  // Забележки
  doc.setFontSize(8);
  const note1 = 'При завеждане на щета в периода между датата на издаване на офертата и сключването на полицата Застрахователят има правото да промени цената.';
  const note1Lines = doc.splitTextToSize(note1, contentWidth);
  doc.text(note1Lines, margin, y);
  y += note1Lines.length * 4 + 4;

  const note2 = 'Офертата е изготвена на база предварителни данни. При промяна на посочените параметри, както и при промени в тарифната политика на ДЗИ, е възможна промяна и на крайната цена. Неделима част от настоящата оферта са Общи условия по автомобилна застраховка "Каско+" на "ДЗИ - Общо застраховане" ЕАД.';
  const note2Lines = doc.splitTextToSize(note2, contentWidth);
  doc.text(note2Lines, margin, y);
  y += note2Lines.length * 4 + 4;

  // Валидност
  doc.setFont('helvetica', 'bold');
  doc.text(`Валидност на офертата: до ${formatDate(validUntil)} г. *`, margin, y);
  doc.setFont('helvetica', 'normal');
  y += 8;

  // Заключителен текст
  const closing = 'С удоволствие оставаме на Ваше разположение за уточняване на параметрите на застраховката, които да удовлетворят в пълна степен застрахователните Ви интереси.';
  const closingLines = doc.splitTextToSize(closing, contentWidth);
  doc.text(closingLines, margin, y);
  y += closingLines.length * 4 + 8;

  doc.text('С уважение,', margin, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('"ДЗИ - Общо застраховане" ЕАД', margin, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.text(`Изготвил офертата: ${preparedBy} ; № на участък: ${sectionNumber}`, margin, y);

  return doc;
}

/**
 * Компонент за генериране и изтегляне на PDF оферта
 */
export default function DZICascoOfferPDF({ offerData, onGenerated }) {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const doc = await generateDZICascoPDF(offerData);
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      
      if (onGenerated) {
        onGenerated(url);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `DZI_Casco_Offer_${offerData.brand}_${offerData.model}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePreview = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <div className="flex items-center gap-3">
      {!pdfUrl ? (
        <Button onClick={handleGenerate} disabled={loading} className="gap-2">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Генериране...
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4" />
              Генерирай PDF оферта
            </>
          )}
        </Button>
      ) : (
        <>
          <Button onClick={handleDownload} className="gap-2">
            <FileDown className="h-4 w-4" />
            Изтегли PDF
          </Button>
          <Button onClick={handlePreview} variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Преглед
          </Button>
        </>
      )}
    </div>
  );
}