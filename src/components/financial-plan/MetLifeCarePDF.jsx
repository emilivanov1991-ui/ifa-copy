import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from 'lucide-react';

export default function MetLifeCarePDF({ data, premiumBreakdown, consultantInfo = {} }) {
  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (value, decimals = 2) => {
    if (value === undefined || value === null) return '-';
    return `${Number(value).toLocaleString('bg-BG', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} €`;
  };

  const riskClassLabel = data.riskClass === 1 ? 'I' : data.riskClass === 2 ? 'II' : 'III';

  return (
    <div className="space-y-4">
      {/* Print/Download Buttons */}
      <div className="flex gap-2 print:hidden">
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Printer className="h-4 w-4" />
          Принтирай
        </Button>
      </div>

      {/* PDF Content */}
      <div className="bg-white p-8 shadow-lg print:shadow-none print:p-0" id="mlc-offer-pdf">
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-teal-600 pb-4 mb-6">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/MetLife_logo.svg/200px-MetLife_logo.svg.png" 
            alt="MetLife" 
            className="h-12"
          />
          <h1 className="text-2xl font-bold text-slate-800">МЕТЛАЙФ ГРИЖА - ОФЕРТА</h1>
        </div>

        {/* Client Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <span className="text-slate-600">Застраховано лице:</span>
            <span className="ml-2 font-semibold">{data.clientName || '-'}</span>
          </div>
          <div className="flex gap-8">
            <div>
              <span className="text-slate-600">Възраст:</span>
              <span className="ml-2 font-semibold">{data.age} г.</span>
            </div>
            <div>
              <span className="text-slate-600">Рисков Клас:</span>
              <span className="ml-2 font-semibold">{riskClassLabel}</span>
            </div>
          </div>
        </div>

        {/* Coverages Table */}
        <div className="mb-6">
          <div className="bg-teal-600 text-white text-center py-2 font-semibold">
            ЗАСТРАХОВАТЕЛНИ ПОКРИТИЯ И ОБЕЗЩЕТЕНИЯ
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-3 py-2 text-left">Застрахователно покритие</th>
                <th className="border border-slate-300 px-3 py-2 text-right w-32">Обезщетение</th>
                <th className="border border-slate-300 px-3 py-2 text-right w-24">Цена</th>
              </tr>
            </thead>
            <tbody>
              {premiumBreakdown.coverages.disability && (
                <tr>
                  <td className="border border-slate-300 px-3 py-2">
                    Трайна загуба на работоспособност над 50% вследствие на заболяване и злополука
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right">
                    {formatCurrency(data.disabilityCoverage)}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right font-semibold">
                    {formatCurrency(premiumBreakdown.coverages.disability.premium)}
                  </td>
                </tr>
              )}
              {premiumBreakdown.coverages.ptd && (
                <tr>
                  <td className="border border-slate-300 px-3 py-2">
                    Пълна/ Частична Трайна Нетрудоспособност вследствие на злополука
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right">
                    {formatCurrency(data.ptdCoverage)}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right font-semibold">
                    {formatCurrency(premiumBreakdown.coverages.ptd.premium)}
                  </td>
                </tr>
              )}
              {premiumBreakdown.coverages.ci40 && (
                <tr>
                  <td className="border border-slate-300 px-3 py-2">
                    40 Тежки Заболявания
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right">
                    {formatCurrency(data.ci40Coverage)}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right font-semibold">
                    {formatCurrency(premiumBreakdown.coverages.ci40.premium)}
                  </td>
                </tr>
              )}
              {premiumBreakdown.coverages.cancer && (
                <tr>
                  <td className="border border-slate-300 px-3 py-2">
                    Злокачествени новобразувания - Рак
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right">
                    {formatCurrency(data.cancerCoverage)}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right font-semibold">
                    {formatCurrency(premiumBreakdown.coverages.cancer.premium)}
                  </td>
                </tr>
              )}
              {premiumBreakdown.coverages.inSitu && (
                <tr>
                  <td className="border border-slate-300 px-3 py-2">
                    Тежко Заболяване - Карцином ин ситу
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right">
                    {formatCurrency(data.inSituCoverage)}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right font-semibold">
                    {formatCurrency(premiumBreakdown.coverages.inSitu.premium)}
                  </td>
                </tr>
              )}
              {premiumBreakdown.coverages.telemedicine && (
                <tr>
                  <td className="border border-slate-300 px-3 py-2">
                    Телемедицина /Второ медицинско мнение/
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right">
                    Включено
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right font-semibold">
                    {formatCurrency(premiumBreakdown.coverages.telemedicine.premium)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pricing Section */}
        <div className="mb-6">
          <div className="bg-teal-600 text-white text-center py-2 font-semibold">
            ЦЕНА И НАЧИНИ НА ПЛАЩАНЕ
          </div>
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="border border-slate-300 px-3 py-2">
                  Обща нетна цена на застрахователните покрития
                </td>
                <td className="border border-slate-300 px-3 py-2 text-right w-32 font-semibold">
                  {formatCurrency(premiumBreakdown.netPremium)}
                </td>
                <td className="border border-slate-300 px-3 py-2 w-24 text-slate-600">
                  годишно
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-3 py-2">
                  Застрахователен данък 2%
                </td>
                <td className="border border-slate-300 px-3 py-2 text-right font-semibold">
                  {formatCurrency(premiumBreakdown.insuranceTax)}
                </td>
                <td className="border border-slate-300 px-3 py-2 text-slate-600">
                  годишно
                </td>
              </tr>
              <tr className="bg-teal-50">
                <td className="border border-slate-300 px-3 py-2 font-semibold">
                  Годишно плащане
                </td>
                <td className="border border-slate-300 px-3 py-2 text-right font-bold text-teal-700">
                  {formatCurrency(premiumBreakdown.annualPremium)}
                </td>
                <td className="border border-slate-300 px-3 py-2 text-slate-600">
                  годишно
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-3 py-2">
                  Полугодишно плащане
                </td>
                <td className="border border-slate-300 px-3 py-2 text-right font-semibold">
                  {premiumBreakdown.semiAnnualPremium >= 25 
                    ? formatCurrency(premiumBreakdown.semiAnnualPremium) 
                    : 'Не е приложимо'}
                </td>
                <td className="border border-slate-300 px-3 py-2 text-slate-600">
                  на полугодие
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notes */}
        <div className="text-sm text-slate-600 space-y-1 mb-8">
          <p>• Всички застрахователни покрития са валидни 24 часа в денонощието, 7 дни в седмицата.</p>
          <p>• Всички застрахователни покрития са валидни в цял свят.</p>
        </div>

        {/* Consultant Info */}
        {consultantInfo.name && (
          <div className="border-t pt-4 text-sm text-slate-600">
            <p className="font-semibold">{consultantInfo.name}</p>
            <p>{consultantInfo.title || 'Финансов консултант'}</p>
            <p>Партнърс Груп БГ</p>
            {consultantInfo.phone && <p>Тел: {consultantInfo.phone}</p>}
            {consultantInfo.email && <p>Email: {consultantInfo.email}</p>}
          </div>
        )}
      </div>
    </div>
  );
}