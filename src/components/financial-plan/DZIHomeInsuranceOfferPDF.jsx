import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';

// Utility functions
const formatCurrency = (value) => {
  if (!value && value !== 0) return '-';
  return new Intl.NumberFormat('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) + ' лв.';
};

const formatCurrencyNoSymbol = (value) => {
  if (!value && value !== 0) return '-';
  return new Intl.NumberFormat('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

const numberToWords = (num) => {
  // Simplified Bulgarian number to words
  const ones = ['', 'едно', 'две', 'три', 'четири', 'пет', 'шест', 'седем', 'осем', 'девет'];
  const teens = ['десет', 'единадесет', 'дванадесет', 'тринадесет', 'четиринадесет', 'петнадесет', 'шестнадесет', 'седемнадесет', 'осемнадесет', 'деветнадесет'];
  const tens = ['', '', 'двадесет', 'тридесет', 'четиридесет', 'петдесет', 'шестдесет', 'седемдесет', 'осемдесет', 'деветдесет'];
  const hundreds = ['', 'сто', 'двеста', 'триста', 'четиристотин', 'петстотин', 'шестстотин', 'седемстотин', 'осемстотин', 'деветстотин'];
  
  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);
  
  if (intPart >= 1000) {
    const thousands = Math.floor(intPart / 1000);
    const remainder = intPart % 1000;
    let result = '';
    if (thousands === 1) result = 'хиляда';
    else if (thousands === 2) result = 'две хиляди';
    else result = ones[thousands] + ' хиляди';
    
    if (remainder > 0) {
      if (remainder < 100) result += ' и ' + (remainder < 20 ? (remainder < 10 ? ones[remainder] : teens[remainder - 10]) : tens[Math.floor(remainder/10)] + (remainder%10 ? ' и ' + ones[remainder%10] : ''));
      else result += ' ' + hundreds[Math.floor(remainder/100)] + (remainder%100 ? ' и ' + (remainder%100 < 20 ? (remainder%100 < 10 ? ones[remainder%100] : teens[remainder%100-10]) : tens[Math.floor((remainder%100)/10)] + ((remainder%100)%10 ? ' и ' + ones[(remainder%100)%10] : '')) : '');
    }
    return result + ' и ' + decPart.toString().padStart(2, '0') + ' лв.';
  }
  return intPart + ' и ' + decPart.toString().padStart(2, '0') + ' лв.';
};

// Generate offer number
const generateOfferNumber = () => {
  const now = new Date();
  const random = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
  return `${random.substring(0,12)}`;
};

// Generate PDF HTML content
const generatePDFContent = (offerData) => {
  const {
    offerNumber,
    offerDate,
    clientName,
    propertyAddress,
    // Apartment data
    apartmentPackage,
    apartmentValue,
    apartmentPremium,
    // Movable property data
    movablePackage,
    movableValue,
    movablePremium,
    // Earthquake
    earthquakeRealEstateValue,
    earthquakeRealEstatePremium,
    earthquakeMovableValue,
    earthquakeMovablePremium,
    // Additional risks
    portableElectronicsLimit,
    portableElectronicsPremium,
    civilLiabilityLimit,
    civilLiabilityPremium,
    sosLimit,
    sosPremium,
    // Theft
    theftLimit,
    theftPremium,
    // Discounts
    discounts,
    // Totals
    insuranceTerm,
    paymentMethod,
    totalPremium,
    taxAmount,
    totalDue,
    validUntil,
    specialAgreements,
    preparedBy,
    branchNumber,
    branchAddress
  } = offerData;

  const formattedOfferDate = format(new Date(offerDate), 'dd-MM-yyyy');
  const formattedValidUntil = format(new Date(validUntil), 'dd-MM-yyyy');
  const totalEuro = (totalDue / 1.95583).toFixed(2);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 15mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, Helvetica, sans-serif; 
      font-size: 9pt; 
      line-height: 1.3;
      color: #000;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      border-bottom: 2px solid #003d7a;
      padding-bottom: 10px;
    }
    .header-left {
      font-size: 8pt;
      color: #333;
    }
    .header-right {
      text-align: right;
    }
    .header-right img {
      height: 40px;
    }
    .contact-info {
      font-size: 8pt;
      color: #003d7a;
      margin-top: 5px;
    }
    .title {
      text-align: center;
      margin: 20px 0;
    }
    .title h1 {
      font-size: 14pt;
      color: #003d7a;
      margin-bottom: 5px;
    }
    .title p {
      font-size: 10pt;
      color: #333;
    }
    .intro {
      margin: 15px 0;
      font-style: italic;
      text-align: center;
    }
    .client-info {
      margin: 15px 0;
    }
    .client-info p {
      margin: 3px 0;
    }
    .section-title {
      background: #003d7a;
      color: white;
      padding: 5px 10px;
      font-weight: bold;
      margin: 15px 0 10px 0;
      font-size: 10pt;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 6px 8px;
      text-align: left;
      font-size: 8pt;
    }
    th {
      background: #e8f0f7;
      font-weight: bold;
      color: #003d7a;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .highlight-row { background: #f5f9fc; }
    .subsection {
      font-weight: bold;
      color: #003d7a;
      margin: 15px 0 8px 0;
      font-size: 9pt;
    }
    .discounts {
      margin: 15px 0;
      padding: 10px;
      background: #f5f5f5;
      border-left: 3px solid #003d7a;
    }
    .discounts-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    .discounts ul {
      list-style: disc;
      margin-left: 20px;
    }
    .summary-table {
      margin: 20px 0;
    }
    .summary-table td {
      border: none;
      padding: 4px 8px;
    }
    .summary-table .label {
      font-weight: normal;
      width: 60%;
    }
    .summary-table .value {
      text-align: right;
      font-weight: bold;
    }
    .total-row {
      font-size: 10pt;
      font-weight: bold;
      background: #e8f0f7;
    }
    .total-row td {
      border-top: 2px solid #003d7a;
      padding: 8px;
    }
    .notes {
      margin: 20px 0;
      padding: 10px;
      background: #fffbf0;
      border: 1px solid #e0d5c0;
      font-size: 8pt;
    }
    .notes p {
      margin: 5px 0;
    }
    .footer {
      margin-top: 30px;
      font-size: 8pt;
    }
    .footer p {
      margin: 5px 0;
    }
    .validity {
      font-weight: bold;
      color: #003d7a;
      margin: 20px 0;
    }
    .signature-section {
      margin-top: 30px;
    }
    .page-break { page-break-before: always; }
    
    /* Page 2/3 - Coverage info */
    .coverage-header {
      text-align: center;
      margin: 20px 0;
      font-weight: bold;
      font-size: 11pt;
    }
    .package-table {
      margin: 20px 0;
    }
    .package-table th {
      background: #003d7a;
      color: white;
      text-align: center;
      vertical-align: bottom;
      padding: 10px 5px;
    }
    .package-table td {
      vertical-align: top;
      font-size: 7.5pt;
      padding: 8px 5px;
    }
    .package-col {
      width: 25%;
    }
    .additional-risks {
      margin: 20px 0;
    }
    .additional-risks ul {
      list-style: disc;
      margin-left: 20px;
      column-count: 2;
    }
    .bonus-section {
      margin: 20px 0;
    }
    .bonus-section h4 {
      color: #003d7a;
      margin-bottom: 10px;
    }
    .bonus-section ul {
      list-style: disc;
      margin-left: 20px;
    }
    .online-clause {
      text-align: center;
      font-weight: bold;
      color: #003d7a;
      margin: 15px 0;
      font-size: 9pt;
    }
  </style>
</head>
<body>

<!-- PAGE 1 -->
<div class="header">
  <div class="header-left">
    "ДЗИ - Общо застраховане" ЕАД<br>
    Република България<br>
    гр.София 1463<br>
    бул. "Витоша", 89Б<br>
    clients@dzi.bg
  </div>
  <div class="header-right">
    <div style="font-size: 24pt; font-weight: bold; color: #003d7a;">ДЗИ</div>
    <div class="contact-info">
      Национален номер 0700 16 166<br>
      www.dzi.bg
    </div>
  </div>
</div>

<div class="title">
  <h1>Оферта № ${offerNumber} / ${formattedOfferDate}</h1>
  <p>Имуществена застраховка "Комфорт за Дома"</p>
</div>

<div class="intro">
  Имаме удоволствието да предоставим на Вашето внимание настоящата оферта за сключване на имуществена застраховка "Комфорт за Дома"
</div>

<div class="client-info">
  <p><strong>Застраховащ:</strong> ${clientName}</p>
  <p><strong>Адрес на обекта за застраховане:</strong> ${propertyAddress}</p>
</div>

<div class="section-title">1. Пожар и други опасности</div>

<table>
  <thead>
    <tr>
      <th>Обект на застраховане</th>
      <th>Избран пакет</th>
      <th>Застрахователна стойност</th>
      <th class="text-right">Застр. сума</th>
      <th class="text-right">Застр. премия<br>(с 2% данък)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Апартамент</td>
      <td class="text-center">${apartmentPackage}</td>
      <td>Възстановителна стойност</td>
      <td class="text-right">${formatCurrency(apartmentValue)}</td>
      <td class="text-right">${formatCurrency(apartmentPremium)}</td>
    </tr>
    <tr>
      <td>Домашно имущество</td>
      <td class="text-center">${movablePackage}</td>
      <td>Възстановителна стойност</td>
      <td class="text-right">${formatCurrency(movableValue)}</td>
      <td class="text-right">${formatCurrency(movablePremium)}</td>
    </tr>
  </tbody>
</table>

<p style="font-size: 8pt; margin: 5px 0;">
  Застраховката включва Клауза "Онлайн сигурност" с общ лимит на отговорност за всички събития през срока 53 000 лева. Отделните покрития и лимити са посочени в Клаузата.
</p>

<div class="subsection">Земетресение</div>
<table>
  <thead>
    <tr>
      <th>Обект на застраховане</th>
      <th class="text-right">Застр. сума</th>
      <th class="text-right">Застр.премия<br>(с 2% данък)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Недвижимо имущество</td>
      <td class="text-right">${formatCurrency(earthquakeRealEstateValue)}</td>
      <td class="text-right">${formatCurrency(earthquakeRealEstatePremium)}</td>
    </tr>
    <tr>
      <td>Движимо имущество</td>
      <td class="text-right">${formatCurrency(earthquakeMovableValue)}</td>
      <td class="text-right">${formatCurrency(earthquakeMovablePremium)}</td>
    </tr>
  </tbody>
</table>

<p style="font-size: 8pt; margin: 5px 0;">
  <strong>Самоучастие - задължително:</strong> Във всяка щета по Клауза Д1 "Земетресение" - 2.0% от размера на застрахователната сума на имуществото по тази Клауза на съответния адрес, но не повече от 50% от застрахователното обезщетение по риска земетресение.
</p>

<div class="subsection">Рискове с лимити</div>
<table>
  <thead>
    <tr>
      <th>Риск</th>
      <th class="text-right">Лимит за едно събитие</th>
      <th class="text-right">Лимит за всички събития</th>
      <th class="text-right">Застрахователна премия<br>(с 2% данък)</th>
    </tr>
  </thead>
  <tbody>
    ${portableElectronicsLimit ? `
    <tr>
      <td>Преносима електронна техника</td>
      <td class="text-right">${formatCurrency(portableElectronicsLimit)}</td>
      <td class="text-right">${formatCurrency(portableElectronicsLimit)}</td>
      <td class="text-right">${formatCurrency(portableElectronicsPremium)}</td>
    </tr>
    ` : ''}
    ${civilLiabilityLimit ? `
    <tr>
      <td>Гражданска отговорност на Застрахования</td>
      <td class="text-right">-</td>
      <td class="text-right">${formatCurrency(civilLiabilityLimit)}</td>
      <td class="text-right">${formatCurrency(civilLiabilityPremium)}</td>
    </tr>
    ` : ''}
    ${sosLimit ? `
    <tr>
      <td>SOS за дома (отделните покрития и лимити са посочени в Клаузата)</td>
      <td class="text-right">-</td>
      <td class="text-right">${formatCurrency(sosLimit)}</td>
      <td class="text-right">${formatCurrency(sosPremium)}</td>
    </tr>
    ` : ''}
  </tbody>
</table>

${theftLimit ? `
<div class="section-title">2. Кражба</div>
<table>
  <thead>
    <tr>
      <th>Обект на застраховане</th>
      <th>Покрити рискове</th>
      <th class="text-right">Лимит за всички събития</th>
      <th class="text-right">Застрахователна премия<br>(с 2% данък)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Домашно имущество</td>
      <td>Кражба чрез взлом и въор. грабеж, и кражба извършена чрез използване на техническо средство или по специален начин</td>
      <td class="text-right">${formatCurrency(theftLimit)}</td>
      <td class="text-right">${formatCurrency(theftPremium)}</td>
    </tr>
  </tbody>
</table>
` : ''}

<p style="font-size: 8pt; margin: 10px 0;">
  Самоучастие на Застрахования по Клауза Д18 „Преносима електронна техника"– 15% от застрахователното обезщетение за всяка една щета по КГТ.
</p>

<p style="font-size: 8pt; margin: 5px 0;">
  Премията по Клауза SOS за дома е дължима с еднократната премия или първата разсрочена вноска.<br>
  Полицата се сключва при условие за пропорционално обезщетяване.
</p>

${discounts && discounts.length > 0 ? `
<div class="discounts">
  <div class="discounts-title">Приложени отстъпки/завишение</div>
  <ul>
    ${discounts.map(d => `<li>${d.name} ${d.value}%</li>`).join('')}
  </ul>
</div>
` : ''}

<table class="summary-table">
  <tbody>
    <tr>
      <td class="label">Срок на застраховката:</td>
      <td class="value">${insuranceTerm} месеца</td>
    </tr>
    <tr>
      <td class="label">Застрахователна премия:</td>
      <td class="value">${formatCurrency(totalPremium)}</td>
    </tr>
    <tr>
      <td class="label">2% данък (върху застр. премии):</td>
      <td class="value">${formatCurrency(taxAmount)}</td>
    </tr>
    <tr class="total-row">
      <td class="label">Общо дължима сума:<br><span style="font-size: 8pt; font-weight: normal;">(застрахователна премия + ДЗП 2%)</span></td>
      <td class="value">${formatCurrency(totalDue)} / ${totalEuro} евро<br><span style="font-size: 8pt;">словом: ${numberToWords(totalDue)} / ${numberToWords(parseFloat(totalEuro))} евро</span></td>
    </tr>
    <tr>
      <td class="label">Начин на плащане:</td>
      <td class="value">${paymentMethod}</td>
    </tr>
  </tbody>
</table>

<p style="margin: 10px 0;"><strong>Специални договорености:</strong> ${specialAgreements || 'няма'}.</p>

<div class="notes">
  <p>Офертата е изготвена на база предварителни данни. При промяна на посочените параметри е възможна промяна и на крайната цена.</p>
  <p>Можете да се запознаете подробно с покритията, които "ДЗИ - Общо застраховане" ЕАД предлага по застраховка "Комфорт за Дома", както и от Общите Условия за застраховка Имущество "Комфорт за Дома".</p>
</div>

<!-- PAGE 2 -->
<div class="page-break"></div>

<div class="header">
  <div class="header-left">
  </div>
  <div class="header-right">
    <div style="font-size: 24pt; font-weight: bold; color: #003d7a;">ДЗИ</div>
    <div class="contact-info">
      Национален номер 0700 16 166<br>
      www.dzi.bg
    </div>
  </div>
</div>

<p class="validity">Валидност на офертата ${formattedValidUntil} г.</p>

<p style="margin: 20px 0;">
  Оставаме на Ваше разположение за уточняване на параметрите на застраховката, които да удовлетворяват в пълна степен застрахователните Ви интереси.
</p>

<div class="signature-section">
  <p>С уважение,</p>
  <p>"ДЗИ - Общо Застраховане" ЕАД</p>
  <p style="margin-top: 15px;">Изготвил офертата: ${preparedBy}, № на участък: ${branchNumber}, адрес: ${branchAddress}</p>
</div>

<!-- PAGE 3 - Coverage Details -->
<div class="page-break"></div>

<div class="header">
  <div class="header-left">
  </div>
  <div class="header-right">
    <div style="font-size: 24pt; font-weight: bold; color: #003d7a;">ДЗИ</div>
    <div class="contact-info">
      Национален номер 0700 16 166<br>
      www.dzi.bg
    </div>
  </div>
</div>

<div class="coverage-header">
  Покрития, които ДЗИ предлага по застраховка "Комфорт за Дома"
</div>

<table class="package-table">
  <thead>
    <tr>
      <th class="package-col">Пакет Сигурност</th>
      <th class="package-col">Пакет Спокойствие</th>
      <th class="package-col">Пълно покритие</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        Пожар, Мълния, Експлозия, Имплозия, Сблъсък или падане на пилотирано летателно тяло/части, товар;<br><br>
        Изтичане на вода/пара, Буря, Градушка, Проливен дъжд, Наводнение, Тежест при ест. натрупване на сняг/лед, Измръзване;<br><br>
        Злоумишлени действия на трети лица, Вандализъм.
      </td>
      <td>
        Пожар, Мълния, Експлозия, Имплозия, Сблъсък или падане на пилотирано летателно тяло/части, товар;<br><br>
        Изтичане на вода/пара, Буря, Градушка, Проливен дъжд, Наводнение, Тежест при ест. натрупване на сняг/лед, Измръзване;<br><br>
        Злоумишлени действия на трети лица, Вандализъм;<br><br>
        Късо съединение/токов удар.
      </td>
      <td>
        Пожар, Мълния, Експлозия, Имплозия, Сблъсък или падане на пилотирано летателно тяло/части, товар;<br><br>
        Изтичане на вода/пара, Буря, Градушка, Проливен дъжд, Наводнение, Тежест при ест. натрупване на сняг/лед, Измръзване;<br><br>
        Злоумишлени действия на трети лица, Вандализъм;<br><br>
        Късо съединение/токов удар;<br><br>
        Удар от превозно средство/животно, Авария с товарни машини, Свличане/срутване на земна маса.
      </td>
    </tr>
  </tbody>
</table>

<div class="online-clause">Клауза Онлайн сигурност</div>

<p style="margin: 15px 0;"><strong>Пакетните покрития може да бъдат разширени с допълнителни рискове, които ДЗИ предлага.</strong></p>

<div class="additional-risks">
  <ul>
    <li>Земетресение;</li>
    <li>SOS за дома;</li>
    <li>Чупене на стъкла;</li>
    <li>Загуба на доход от наем;</li>
    <li>Ударна / звукова вълна;</li>
    <li>Действия на морски вълни;</li>
    <li>Гражданска отговорност на Застрахования;</li>
    <li>Преносима електронна техника;</li>
    <li>Злополука;</li>
    <li>Разходи за временно настаняване.</li>
  </ul>
</div>

<p style="margin: 15px 0;"><strong>За движимо имущество могат да се добавят и:</strong></p>
<ul style="margin-left: 20px;">
  <li>Кражба чрез взлом, грабеж и кражба извършена с техническо средство.</li>
</ul>

<div class="bonus-section">
  <h4>Бонус - преференциални покрития:</h4>
  <ul>
    <li>Разходи за отстраняването на последиците от гасенето на пожар, експлозия на бойлер;</li>
    <li>Разходи за вещи лица при щети;</li>
    <li>Разходи за преместване, предпазване и съхранение на застраховано имущество при щета;</li>
    <li>Административни разходи за дубликати на документи, унищожени от застрахователно събитие;</li>
    <li>Разходи за отстраняване на вредите от извършване на взломно проникване или намерение за такова;</li>
    <li>Разходи за разчистване на останки и ограничаване на вредите при настъпило събитие;</li>
    <li>Разходи за откриване и закриване на тръбни инсталации в случай на теч;</li>
    <li>Щети при буря от паднали върху застрахованото имущество части от сгради, дървета, клони и носени от бурята дървета;</li>
    <li>Вреди от измокряне от вода, изтекла от водопроводна инсталация при забравени отворени кранове на чешми.</li>
  </ul>
  <p style="margin-top: 10px;"><strong>При полица с премия над 100 лева/51.13 евро - подмяна на външни брави в случай на откраднат, загубен ключ.</strong></p>
</div>

</body>
</html>
  `;
};

// Main component
export default function DZIHomeInsuranceOfferPDF({ offerData, onPDFGenerated }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(offerData?.pdfUrl || null);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    const htmlContent = generatePDFContent(offerData);
    
    // Create blob and upload
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const file = new File([blob], `DZI_Komfort_Offer_${offerData.offerNumber || generateOfferNumber()}.html`, { type: 'text/html' });
    
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setPdfUrl(file_url);
    
    if (onPDFGenerated) {
      onPDFGenerated(file_url);
    }
    
    setIsGenerating(false);
    
    // Open in new tab for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="flex gap-2">
      <Button 
        onClick={generatePDF} 
        disabled={isGenerating}
        className="gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Генериране...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4" />
            Генерирай оферта ДЗИ
          </>
        )}
      </Button>
      
      {pdfUrl && (
        <Button variant="outline" asChild className="gap-2">
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4" />
            Изтегли
          </a>
        </Button>
      )}
    </div>
  );
}

// Export helper for external use
export { generatePDFContent, generateOfferNumber };