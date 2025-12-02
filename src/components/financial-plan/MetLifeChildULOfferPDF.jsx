import React from 'react';
import { Button } from "@/components/ui/button";
import { Printer } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function MetLifeChildULOfferPDF({ data, premiumBreakdown, projection = [] }) {
  const handlePrint = () => window.print();

  const formatCurrency = (value, decimals = 2) => {
    if (value === null || value === undefined) return '-';
    return Number(value).toLocaleString('bg-BG', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  // Calculate premium bonus based on annual savings
  const getPremiumBonus = (annualSavings) => {
    if (annualSavings >= 4200) return 0.04;
    if (annualSavings >= 3000) return 0.03;
    if (annualSavings >= 1800) return 0.02;
    if (annualSavings >= 1200) return 0.01;
    return 0;
  };

  const annualSavings = data?.annualSavings || 0;
  const premiumBonus = getPremiumBonus(annualSavings);

  // Coverage costs (half for PTD since PPD is % of PTD)
  const ptdCost = premiumBreakdown?.coverages?.permanentDisability?.premium || 0;
  const ppdCost = ptdCost; // PPD is same rate, % of PTD amount
  const hospitalizationCost = premiumBreakdown?.coverages?.hospitalization?.premium || 0;
  const surgicalCost = premiumBreakdown?.coverages?.surgical?.premium || 0;
  const fracturesCost = premiumBreakdown?.coverages?.fractures?.premium || 0;
  const childProtectionCost = premiumBreakdown?.coverages?.childProtection?.premium || 0;

  const totalCoveragesCost = premiumBreakdown?.totalCoveragesPremium || 0;
  const totalNetPremium = annualSavings + totalCoveragesCost;
  const adminFee = 15;

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto print:p-4 print:max-w-none">
      {/* Print Button */}
      <div className="flex justify-end mb-4 print:hidden">
        <Button onClick={handlePrint} variant="outline" size="sm">
          <Printer className="w-4 h-4 mr-2" />
          Принтирай
        </Button>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
        <div className="text-center">
          <h1 className="text-xl font-bold">Индивидуална</h1>
          <h2 className="text-2xl font-bold">застрахователна оферта</h2>
        </div>
      </div>

      {/* Policyholder & Insured Info */}
      <div className="border-x border-slate-300 p-4 bg-slate-50">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Застраховащ:</span>
            <span className="text-slate-900">{data?.policyholderName || '-'}</span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="font-semibold text-slate-700">Възраст:</span>
            <span className="text-slate-900">{data?.policyholderAge || '-'} г.</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Застраховано лице:</span>
            <span className="text-slate-900">{data?.childName || '-'}</span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="font-semibold text-slate-700">Възраст:</span>
            <span className="text-slate-900">{data?.childAge || '-'} г.</span>
          </div>
        </div>
      </div>

      {/* СПЕСТОВНА ПРОГРАМА */}
      <div className="bg-blue-600 text-white text-center py-2 font-bold border-x border-blue-600">
        СПЕСТОВНА ПРОГРАМА
      </div>

      <div className="border-x border-slate-300 p-4">
        <div className="grid grid-cols-2 gap-8">
          {/* Основни характеристики */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3 border-b pb-1">Основни характеристики</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1 text-slate-600">Годишна спестовна вноска</td>
                  <td className="py-1 text-right font-semibold">{formatCurrency(annualSavings)} €</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-600">Премиен бонус</td>
                  <td className="py-1 text-right font-semibold">{(premiumBonus * 100).toFixed(0)}%</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-600">Средна годишна доходност</td>
                  <td className="py-1 text-right font-semibold">{((data?.expectedReturn || 0) * 100).toFixed(2)}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Инвестиционни фондове */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3 border-b pb-1">Инвестиционни фондове</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1 text-slate-600">Световни акции</td>
                  <td className="py-1 text-right font-semibold">{data?.fundAllocation?.globalStocks || 0}%</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-600">Акции развиващи се пазари</td>
                  <td className="py-1 text-right font-semibold">{data?.fundAllocation?.emergingMarkets || 0}%</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-600">Световни ценни книжа</td>
                  <td className="py-1 text-right font-semibold">{data?.fundAllocation?.globalBonds || 0}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ДОПЪЛНИТЕЛНИ ЗАСТРАХОВАТЕЛНИ ПОКРИТИЯ */}
      <div className="bg-blue-600 text-white text-center py-2 font-bold border-x border-blue-600">
        ДОПЪЛНИТЕЛНИ ЗАСТРАХОВАТЕЛНИ ПОКРИТИЯ И ОБЕЗЩЕТЕНИЯ
      </div>

      <div className="border-x border-slate-300">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="py-2 px-4 text-left font-semibold text-slate-700">Застрахователно покритие</th>
              <th className="py-2 px-4 text-right font-semibold text-slate-700">Обезщетение</th>
              <th className="py-2 px-4 text-right font-semibold text-slate-700">Цена</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-200">
              <td className="py-2 px-4 text-slate-700">Пълна Трайна Нетрудоспособност<br/>вследствие на злополука</td>
              <td className="py-2 px-4 text-right font-semibold">{formatCurrency(data?.coverages?.permanentDisability || 0, 0)} €</td>
              <td className="py-2 px-4 text-right font-semibold">{formatCurrency(ptdCost / 2)} €</td>
            </tr>
            <tr className="border-t border-slate-200 bg-slate-50">
              <td className="py-2 px-4 text-slate-700">Частична Трайна Нетрудоспособност<br/>вследствие на злополука</td>
              <td className="py-2 px-4 text-right font-semibold">% от {formatCurrency(data?.coverages?.permanentDisability || 0, 0)} €</td>
              <td className="py-2 px-4 text-right font-semibold">{formatCurrency(ptdCost / 2)} €</td>
            </tr>
            <tr className="border-t border-slate-200">
              <td className="py-2 px-4 text-slate-700">Дневно обезщетение при хоспитализация</td>
              <td className="py-2 px-4 text-right font-semibold">{formatCurrency(data?.coverages?.dailyHospital || 0, 0)} € / ден</td>
              <td className="py-2 px-4 text-right font-semibold">{formatCurrency(hospitalizationCost)} €</td>
            </tr>
            <tr className="border-t border-slate-200 bg-slate-50">
              <td className="py-2 px-4 text-slate-700">Хирургическа намеса</td>
              <td className="py-2 px-4 text-right font-semibold">% от {formatCurrency(data?.coverages?.surgical || 0, 0)} €</td>
              <td className="py-2 px-4 text-right font-semibold">{formatCurrency(surgicalCost)} €</td>
            </tr>
            <tr className="border-t border-slate-200">
              <td className="py-2 px-4 text-slate-700">Фрактури и изгаряния</td>
              <td className="py-2 px-4 text-right font-semibold">% от {formatCurrency(data?.coverages?.fractures || 0, 0)} €</td>
              <td className="py-2 px-4 text-right font-semibold">{formatCurrency(fracturesCost)} €</td>
            </tr>
            <tr className="border-t border-slate-200 bg-slate-50">
              <td className="py-2 px-4 text-slate-700">Споразумение за защита на детето</td>
              <td className="py-2 px-4 text-right font-semibold">{formatCurrency(data?.coverages?.childProtection || 0, 0)} €</td>
              <td className="py-2 px-4 text-right font-semibold">{formatCurrency(childProtectionCost)} €</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ЦЕНА И НАЧИНИ НА ПЛАЩАНЕ */}
      <div className="bg-blue-600 text-white text-center py-2 font-bold border-x border-blue-600">
        ЦЕНА И НАЧИНИ НА ПЛАЩАНЕ
      </div>

      <div className="border-x border-b border-slate-300 rounded-b-lg">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-t border-slate-200">
              <td className="py-2 px-4 text-slate-700">Обща нетна сума за спестяване</td>
              <td className="py-2 px-4 text-right font-semibold">{formatCurrency(annualSavings)} €</td>
              <td className="py-2 px-4 text-slate-500">годишно</td>
            </tr>
            <tr className="border-t border-slate-200 bg-slate-50">
              <td className="py-2 px-4 text-slate-700">Обща нетна цена на допълнителни застрахователни покрития</td>
              <td className="py-2 px-4 text-right font-semibold">{formatCurrency(totalCoveragesCost)} €</td>
              <td className="py-2 px-4 text-slate-500">годишно</td>
            </tr>
            <tr className="border-t border-slate-200">
              <td className="py-2 px-4 text-slate-700">Обща нетна цена на целия спестовно застрахователен план</td>
              <td className="py-2 px-4 text-right font-semibold">{formatCurrency(totalNetPremium)} €</td>
              <td className="py-2 px-4 text-slate-500">годишно</td>
            </tr>
            <tr className="border-t border-slate-200 bg-slate-50">
              <td className="py-2 px-4 text-slate-700">Административна такса</td>
              <td className="py-2 px-4 text-right font-semibold">{formatCurrency(adminFee)} €</td>
              <td className="py-2 px-4 text-slate-500">годишно</td>
            </tr>
            <tr className="border-t-2 border-blue-300 bg-blue-50">
              <td className="py-3 px-4 font-bold text-blue-800">Годишно плащане</td>
              <td className="py-3 px-4 text-right font-bold text-blue-800 text-lg">{formatCurrency(premiumBreakdown?.totalAnnualPremium || 0)} €</td>
              <td className="py-3 px-4 text-blue-600">годишно</td>
            </tr>
            <tr className="border-t border-slate-200">
              <td className="py-2 px-4 text-slate-700">Полугодишно плащане</td>
              <td className="py-2 px-4 text-right font-semibold">{formatCurrency(premiumBreakdown?.semiAnnualPremium || 0)} €</td>
              <td className="py-2 px-4 text-slate-500">на полугодие</td>
            </tr>
            <tr className="border-t border-slate-200 bg-slate-50">
              <td className="py-2 px-4 text-slate-700">Тримесечно плащане</td>
              <td className="py-2 px-4 text-right font-semibold">{formatCurrency(premiumBreakdown?.quarterlyPremium || 0)} €</td>
              <td className="py-2 px-4 text-slate-500">на тримесечие</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Note */}
      <div className="mt-4 p-4 bg-slate-100 rounded-lg text-xs text-slate-600">
        <p>• Всички застрахователни покрития са валидни 24 часа в денонощието, 7 дни в седмицата.</p>
        <p>• Всички застрахователни покрития са валидни в цял свят.</p>
      </div>

      {/* PAGE 2 - ПРОЕКЦИЯ */}
      <div className="mt-8 page-break-before">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
          <div className="text-center">
            <h1 className="text-xl font-bold">Индивидуална</h1>
            <h2 className="text-2xl font-bold">застрахователна оферта</h2>
          </div>
        </div>

        {/* Policyholder & Insured Info */}
        <div className="border-x border-slate-300 p-4 bg-slate-50">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Застраховащ:</span>
              <span className="text-slate-900">{data?.policyholderName || '-'}</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="font-semibold text-slate-700">Възраст:</span>
              <span className="text-slate-900">{data?.policyholderAge || '-'} г.</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Застраховано лице:</span>
              <span className="text-slate-900">{data?.childName || '-'}</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="font-semibold text-slate-700">Възраст:</span>
              <span className="text-slate-900">{data?.childAge || '-'} г.</span>
            </div>
          </div>
        </div>

        {/* СПЕСТОВНА ПРОГРАМА - повторение */}
        <div className="bg-blue-600 text-white text-center py-2 font-bold border-x border-blue-600">
          СПЕСТОВНА ПРОГРАМА
        </div>

        <div className="border-x border-slate-300 p-4">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-slate-800 mb-3 border-b pb-1">Основни характеристики</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 text-slate-600">Годишна спестовна вноска</td>
                    <td className="py-1 text-right font-semibold">{formatCurrency(annualSavings)} €</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-600">Премиен бонус</td>
                    <td className="py-1 text-right font-semibold">{(premiumBonus * 100).toFixed(0)}%</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-600">Средна годишна доходност</td>
                    <td className="py-1 text-right font-semibold">{((data?.expectedReturn || 0) * 100).toFixed(2)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-3 border-b pb-1">Инвестиционни фондове</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 text-slate-600">Световни акции</td>
                    <td className="py-1 text-right font-semibold">{data?.fundAllocation?.globalStocks || 0}%</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-600">Акции развиващи се пазари</td>
                    <td className="py-1 text-right font-semibold">{data?.fundAllocation?.emergingMarkets || 0}%</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-600">Световни ценни книжа</td>
                    <td className="py-1 text-right font-semibold">{data?.fundAllocation?.globalBonds || 0}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ПРОЕКЦИЯ ЗА РАЗВИТИЕТО НА КЛИЕНТСКА СМЕТКА */}
        <div className="bg-blue-600 text-white text-center py-2 font-bold border-x border-blue-600">
          ПРОЕКЦИЯ ЗА РАЗВИТИЕТО НА КЛИЕНТСКА СМЕТКА
        </div>

        <div className="border-x border-slate-300 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100">
                <th className="py-2 px-2 text-center font-semibold text-slate-700 border-b">Година</th>
                <th className="py-2 px-2 text-center font-semibold text-slate-700 border-b">Възраст на Застр. лице</th>
                <th className="py-2 px-2 text-right font-semibold text-slate-700 border-b">Общо платена сума за спестяване</th>
                <th className="py-2 px-2 text-center font-semibold text-slate-700 border-b">Обезщетение при загуба на живот</th>
                <th className="py-2 px-2 text-right font-semibold text-slate-700 border-b">Стойност на клиентска сметка</th>
                <th className="py-2 px-2 text-right font-semibold text-slate-700 border-b">Нетна откупна стойност</th>
              </tr>
            </thead>
            <tbody>
              {projection.slice(0, 40).map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="py-1 px-2 text-center">{row.year}</td>
                  <td className="py-1 px-2 text-center">{row.age}</td>
                  <td className="py-1 px-2 text-right">{formatCurrency(row.totalPremiumsPaid, 0)} €</td>
                  <td className="py-1 px-2 text-center">-</td>
                  <td className="py-1 px-2 text-right">{formatCurrency(row.accountValue, 0)} €</td>
                  <td className="py-1 px-2 text-right">{formatCurrency(row.netSurrenderValue, 0)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ГРАФИКА */}
        <div className="bg-blue-600 text-white text-center py-2 font-bold border-x border-blue-600">
          ГРАФИКА НА ПРОЕКЦИЯ ЗА РАЗВИТИЕТО НА КЛИЕНТСКА СМЕТКА
        </div>

        <div className="border-x border-b border-slate-300 p-4 rounded-b-lg">
          {projection.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={projection} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="year" 
                  tick={{ fontSize: 10 }} 
                  label={{ value: 'Година', position: 'insideBottom', offset: -5, fontSize: 11 }}
                />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value) => [`${formatCurrency(value, 0)} €`, '']}
                  labelFormatter={(label) => `Година ${label}`}
                />
                <Legend verticalAlign="bottom" height={36} />
                <Area 
                  type="monotone" 
                  dataKey="totalPremiumsPaid" 
                  name="Общо платена сума за спестяване" 
                  stroke="#3b82f6" 
                  fill="#93c5fd" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="accountValue" 
                  name="Стойност на клиентска сметка" 
                  stroke="#22c55e" 
                  fill="#86efac" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              Няма данни за проекция
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-4 p-4 bg-slate-100 rounded-lg text-xs text-slate-600 space-y-1">
          <p>• При изготвянето на тази проекция, са калкулирани всички бонуси и разходи на база на общите условия на спестовно-инвестиционната програма.</p>
          <p>• Информацията и числата в тази проекция са базирани на допускания за бъдещ период. Те се предоставят с информационна цел и не представляват обещание или гаранция за бъдещи финансови резултати.</p>
          <p>• Всички права и задължения на МетЛайф и на застрахованото лице ще бъдат определени в разпоредбите на конкретен застрахователен договор.</p>
        </div>

        {/* Consultant Info */}
        <div className="mt-6 text-center text-sm text-slate-600">
          <p className="font-semibold">{data?.consultantName || 'Партнърс Груп БГ'}</p>
          <p>{data?.consultantEmail || ''}</p>
          <p>{data?.consultantPhone || ''}</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:p-4, .print\\:p-4 * { visibility: visible; }
          .print\\:hidden { display: none !important; }
          .page-break-before { page-break-before: always; }
          @page { margin: 1cm; }
        }
      `}</style>
    </div>
  );
}