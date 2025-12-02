import React from 'react';
import { Button } from "@/components/ui/button";
import { Printer } from 'lucide-react';

export default function MetLifeTermLifeCarePDF({ 
  termLifeData, 
  termLifePremium, 
  careData, 
  carePremium, 
  consultantInfo = {} 
}) {
  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (value, decimals = 2) => {
    if (value === undefined || value === null) return '-';
    return `${Number(value).toLocaleString('bg-BG', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} €`;
  };

  const riskClassLabel = (rc) => rc === 1 ? 'I' : rc === 2 ? 'II' : 'III';

  // Combined totals
  const totalNetPremium = (termLifePremium?.netPremium || 0) + (carePremium?.netPremium || 0);
  const totalAdminFee = termLifePremium?.adminFee || 0;
  const totalInsuranceTax = carePremium?.insuranceTax || 0;
  const totalAnnualPremium = (termLifePremium?.annualPremium || 0) + (carePremium?.annualPremium || 0);
  const totalSemiAnnual = totalAnnualPremium * 0.51;

  return (
    <div className="space-y-4">
      {/* Print Button */}
      <div className="flex gap-2 print:hidden">
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Printer className="h-4 w-4" />
          Принтирай
        </Button>
      </div>

      {/* PDF Content */}
      <div className="bg-white p-8 shadow-lg print:shadow-none print:p-0" id="combined-offer-pdf">
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-blue-600 pb-4 mb-6">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/MetLife_logo.svg/200px-MetLife_logo.svg.png" 
            alt="MetLife" 
            className="h-12"
          />
          <h1 className="text-2xl font-bold text-slate-800">КОМБИНИРАНА ОФЕРТА - СРОЧЕН ЖИВОТ + ГРИЖА</h1>
        </div>

        {/* Client Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
          <div>
            <span className="text-slate-600">Застраховано лице:</span>
            <span className="ml-2 font-semibold">{termLifeData?.clientName || careData?.clientName || '-'}</span>
          </div>
          <div className="flex gap-8">
            <div>
              <span className="text-slate-600">Възраст:</span>
              <span className="ml-2 font-semibold">{termLifeData?.age || careData?.age} г.</span>
            </div>
            <div>
              <span className="text-slate-600">Рисков Клас:</span>
              <span className="ml-2 font-semibold">{riskClassLabel(termLifeData?.riskClass || careData?.riskClass)}</span>
            </div>
          </div>
        </div>

        {/* SECTION 1: Term Life */}
        {termLifeData && termLifePremium && Object.keys(termLifePremium.coverages).length > 0 && (
          <div className="mb-8">
            <div className="bg-blue-600 text-white text-center py-2 font-semibold">
              СРОЧНА ЗАСТРАХОВКА ЖИВОТ
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-50">
                  <th className="border border-slate-300 px-3 py-2 text-left">Застрахователно покритие</th>
                  <th className="border border-slate-300 px-3 py-2 text-right w-32">Обезщетение</th>
                  <th className="border border-slate-300 px-3 py-2 text-right w-24">Цена</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(termLifePremium.coverages).map(([key, coverage]) => (
                  <tr key={key}>
                    <td className="border border-slate-300 px-3 py-2">{coverage.name}</td>
                    <td className="border border-slate-300 px-3 py-2 text-right">
                      {typeof coverage.coverage === 'number' 
                        ? formatCurrency(coverage.coverage) 
                        : coverage.coverage}
                    </td>
                    <td className="border border-slate-300 px-3 py-2 text-right font-semibold">
                      {formatCurrency(coverage.premium)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-blue-50">
                  <td className="border border-slate-300 px-3 py-2 font-semibold" colSpan={2}>
                    Нетна премия Срочен Живот + Админ. такса ({formatCurrency(termLifePremium.adminFee)})
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right font-bold text-blue-700">
                    {formatCurrency(termLifePremium.annualPremium)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* SECTION 2: MetLife Care */}
        {careData && carePremium && Object.keys(carePremium.coverages).length > 0 && (
          <div className="mb-8">
            <div className="bg-teal-600 text-white text-center py-2 font-semibold">
              МЕТЛАЙФ ГРИЖА
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-teal-50">
                  <th className="border border-slate-300 px-3 py-2 text-left">Застрахователно покритие</th>
                  <th className="border border-slate-300 px-3 py-2 text-right w-32">Обезщетение</th>
                  <th className="border border-slate-300 px-3 py-2 text-right w-24">Цена</th>
                </tr>
              </thead>
              <tbody>
                {carePremium.coverages.disability && (
                  <tr>
                    <td className="border border-slate-300 px-3 py-2">
                      ТЗР над 50% вследствие на заболяване и злополука
                    </td>
                    <td className="border border-slate-300 px-3 py-2 text-right">
                      {formatCurrency(careData.disabilityCoverage)}
                    </td>
                    <td className="border border-slate-300 px-3 py-2 text-right font-semibold">
                      {formatCurrency(carePremium.coverages.disability.premium)}
                    </td>
                  </tr>
                )}
                {carePremium.coverages.ptd && (
                  <tr>
                    <td className="border border-slate-300 px-3 py-2">
                      Пълна/ Частична ТН вследствие на злополука
                    </td>
                    <td className="border border-slate-300 px-3 py-2 text-right">
                      {formatCurrency(careData.ptdCoverage)}
                    </td>
                    <td className="border border-slate-300 px-3 py-2 text-right font-semibold">
                      {formatCurrency(carePremium.coverages.ptd.premium)}
                    </td>
                  </tr>
                )}
                {carePremium.coverages.ci40 && (
                  <tr>
                    <td className="border border-slate-300 px-3 py-2">40 Тежки Заболявания</td>
                    <td className="border border-slate-300 px-3 py-2 text-right">
                      {formatCurrency(careData.ci40Coverage)}
                    </td>
                    <td className="border border-slate-300 px-3 py-2 text-right font-semibold">
                      {formatCurrency(carePremium.coverages.ci40.premium)}
                    </td>
                  </tr>
                )}
                {carePremium.coverages.cancer && (
                  <tr>
                    <td className="border border-slate-300 px-3 py-2">Злокачествени новобразувания - Рак</td>
                    <td className="border border-slate-300 px-3 py-2 text-right">
                      {formatCurrency(careData.cancerCoverage)}
                    </td>
                    <td className="border border-slate-300 px-3 py-2 text-right font-semibold">
                      {formatCurrency(carePremium.coverages.cancer.premium)}
                    </td>
                  </tr>
                )}
                {carePremium.coverages.inSitu && (
                  <tr>
                    <td className="border border-slate-300 px-3 py-2">Карцином ин ситу</td>
                    <td className="border border-slate-300 px-3 py-2 text-right">
                      {formatCurrency(careData.inSituCoverage)}
                    </td>
                    <td className="border border-slate-300 px-3 py-2 text-right font-semibold">
                      {formatCurrency(carePremium.coverages.inSitu.premium)}
                    </td>
                  </tr>
                )}
                {carePremium.coverages.telemedicine && (
                  <tr>
                    <td className="border border-slate-300 px-3 py-2">Телемедицина /Второ мед. мнение/</td>
                    <td className="border border-slate-300 px-3 py-2 text-right">Включено</td>
                    <td className="border border-slate-300 px-3 py-2 text-right font-semibold">
                      {formatCurrency(carePremium.coverages.telemedicine.premium)}
                    </td>
                  </tr>
                )}
                <tr className="bg-teal-50">
                  <td className="border border-slate-300 px-3 py-2 font-semibold" colSpan={2}>
                    Нетна премия Грижа + Данък 2% ({formatCurrency(carePremium.insuranceTax)})
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right font-bold text-teal-700">
                    {formatCurrency(carePremium.annualPremium)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* COMBINED TOTAL */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white text-center py-2 font-semibold">
            ОБЩА ЦЕНА И НАЧИНИ НА ПЛАЩАНЕ
          </div>
          <table className="w-full border-collapse">
            <tbody>
              <tr className="bg-gradient-to-r from-blue-50 to-teal-50">
                <td className="border border-slate-300 px-3 py-3 font-bold text-lg">
                  ОБЩО ГОДИШНО ПЛАЩАНЕ
                </td>
                <td className="border border-slate-300 px-3 py-3 text-right font-bold text-xl text-blue-700 w-32">
                  {formatCurrency(totalAnnualPremium)}
                </td>
                <td className="border border-slate-300 px-3 py-3 w-24 text-slate-600">
                  годишно
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-3 py-2">
                  Полугодишно плащане
                </td>
                <td className="border border-slate-300 px-3 py-2 text-right font-semibold">
                  {totalSemiAnnual >= 25 ? formatCurrency(totalSemiAnnual) : 'Не е приложимо'}
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