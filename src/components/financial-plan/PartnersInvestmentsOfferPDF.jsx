import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

/**
 * Partners Investments - Инвестиционна оферта (PDF визуализация)
 * Поддържа както регуларни (месечни), така и еднократни инвестиции
 */
export default function PartnersInvestmentsOfferPDF({ data, consultant }) {
  
  const projection = useMemo(() => {
    if (!data) return [];

    const isRegular = data.investmentType === 'regular'; // true за месечни, false за еднократни
    const monthlyContribution = isRegular ? (data.monthlyContribution || 0) : 0;
    const oneTimeInvestment = !isRegular ? (data.oneTimeInvestment || 0) : 0;
    const years = data.investmentHorizon || 30;
    const age = data.investorAge || 35;

    // Доходности по сценарии
    const pessimisticReturn = data.pessimisticReturn || 0.03; // 3%
    const realisticReturn = data.realisticReturn || 0.06;     // 6%
    const optimisticReturn = data.optimisticReturn || 0.09;   // 9%

    const yearlyProjection = [];

    for (let year = 1; year <= years; year++) {
      const currentAge = age + year;

      // За регулярни инвестиции - натрупваме месечни вноски
      if (isRegular) {
        const annualContribution = monthlyContribution * 12;
        const totalInvested = annualContribution * year;

        // Изчисляване на FV с месечно компаундиране
        const calculateFV = (monthlyRate, yearNum) => {
          const months = yearNum * 12;
          let value = 0;
          
          for (let month = 1; month <= months; month++) {
            value = value * (1 + monthlyRate) + monthlyContribution;
          }
          
          return Math.round(value);
        };

        yearlyProjection.push({
          year,
          age: currentAge,
          totalInvested,
          pessimistic: calculateFV(pessimisticReturn / 12, year),
          realistic: calculateFV(realisticReturn / 12, year),
          optimistic: calculateFV(optimisticReturn / 12, year)
        });
      } else {
        // За еднократни инвестиции - просто компаундираме годишно
        const totalInvested = oneTimeInvestment; // Еднократна сума не се променя

        yearlyProjection.push({
          year,
          age: currentAge,
          totalInvested,
          pessimistic: Math.round(oneTimeInvestment * Math.pow(1 + pessimisticReturn, year)),
          realistic: Math.round(oneTimeInvestment * Math.pow(1 + realisticReturn, year)),
          optimistic: Math.round(oneTimeInvestment * Math.pow(1 + optimisticReturn, year))
        });
      }
    }

    return yearlyProjection;
  }, [data]);

  const formatCurrency = (value) => {
    return `${Math.round(value).toLocaleString('bg-BG')} €`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (!data) {
    return <div className="p-8 text-center text-slate-500">Няма данни за оферта</div>;
  }

  const isRegular = data.investmentType === 'regular';

  const strategyLabels = {
    'conservative': 'Консервативна',
    'balanced': 'Балансирана',
    'dynamic': 'Динамична',
    'real_estate': 'Недвижими имоти'
  };

  return (
    <div className="bg-white print-area">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Print Button */}
      <div className="no-print mb-4">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="w-4 h-4 mr-2" />
          Принтирай офертата
        </Button>
      </div>

      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <img 
              src="https://www.partners.bg/images/logo.png" 
              alt="Partners Investments" 
              className="h-12 mb-2"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h1 className="text-2xl font-bold text-red-700">Инвестиционна оферта</h1>
          </div>
        </div>

        {/* Investor Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <span className="font-semibold">Инвеститор:</span>
            <span className="ml-2">{data.investorName || 'Клиент'}</span>
          </div>
          <div>
            <span className="font-semibold">Възраст:</span>
            <span className="ml-2">{data.investorAge || 0} г.</span>
          </div>
        </div>

        {/* Investment Program */}
        <div className="bg-red-700 text-white p-4 mb-4">
          <h2 className="font-bold text-center">ИНВЕСТИЦИОННА ПРОГРАМА</h2>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Основни характеристики */}
          <div>
            <h3 className="font-semibold mb-3 text-slate-700">Основни характеристики</h3>
            <div className="space-y-2 text-sm">
              {isRegular ? (
                <>
                  <div className="flex justify-between">
                    <span>Месечна инвестиционна вноска</span>
                    <span className="font-semibold">{formatCurrency(data.monthlyContribution || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Годишна инвестиционна вноска</span>
                    <span className="font-semibold">{formatCurrency((data.monthlyContribution || 0) * 12)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Инвестиционен хоризонт</span>
                    <span className="font-semibold">{data.investmentHorizon || 0} години</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Целева сума</span>
                    <span className="font-semibold">{formatCurrency(data.targetValue || 0)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>Еднократна инвестиция</span>
                    <span className="font-semibold">{formatCurrency(data.oneTimeInvestment || 0)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Инвестиционна стратегия */}
          <div>
            <h3 className="font-semibold mb-3 text-slate-700">Инвестиционна стратегия</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Стратегия</span>
                <span className="font-semibold">{strategyLabels[data.strategy] || data.strategy}</span>
              </div>
              <div className="flex justify-between">
                <span>Първоначална такса</span>
                <span className="font-semibold">{((data.entryFee || 0) * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Средна годишна доходност</span>
                <span className="font-semibold">{((data.realisticReturn || 0) * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Projection Table */}
        <div className="mb-6">
          <div className="bg-red-700 text-white p-2 text-center font-semibold text-sm mb-2">
            ПРОЕКЦИЯ ЗА РАЗВИТИЕТО НА КЛИЕНТСКА СМЕТКА
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border border-slate-300 px-2 py-1 text-left">Година</th>
                  <th className="border border-slate-300 px-2 py-1 text-center">Възраст на клиента</th>
                  <th className="border border-slate-300 px-2 py-1 text-right">Общо инвестирана сума</th>
                  <th className="border border-slate-300 px-2 py-1 text-right">Песимистичен сценарий</th>
                  <th className="border border-slate-300 px-2 py-1 text-right">Реалистичен сценарий</th>
                  <th className="border border-slate-300 px-2 py-1 text-right">Оптимистичен сценарий</th>
                </tr>
              </thead>
              <tbody>
                {projection.slice(0, 49).map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="border border-slate-200 px-2 py-1 text-center">{row.year}</td>
                    <td className="border border-slate-200 px-2 py-1 text-center">{row.age}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right">{formatCurrency(row.totalInvested)}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right">{formatCurrency(row.pessimistic)}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right font-semibold">{formatCurrency(row.realistic)}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right">{formatCurrency(row.optimistic)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-6">
          <h3 className="font-semibold text-center mb-3 text-red-700">
            ГРАФИКА НА ПРОЕКЦИЯ ЗА РАЗВИТИЕТО НА КЛИЕНТСКА СМЕТКА
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={projection} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 10 }} 
                label={{ value: 'Години', position: 'insideBottom', offset: -5, fontSize: 11 }}
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Area 
                type="monotone" 
                dataKey="totalInvested" 
                stackId="1" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.6}
                name="Общо инвестирана сума"
              />
              <Area 
                type="monotone" 
                dataKey="pessimistic" 
                stackId="2" 
                stroke="#ef4444" 
                fill="#ef4444" 
                fillOpacity={0.4}
                name="Песимистичен сценарий"
              />
              <Area 
                type="monotone" 
                dataKey="realistic" 
                stackId="3" 
                stroke="#000000" 
                fill="#000000" 
                fillOpacity={0.3}
                name="Реалистичен сценарий"
              />
              <Area 
                type="monotone" 
                dataKey="optimistic" 
                stackId="4" 
                stroke="#22c55e" 
                fill="#22c55e" 
                fillOpacity={0.4}
                name="Оптимистичен сценарий"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Disclaimer */}
        <div className="bg-slate-50 p-4 text-xs text-slate-600 mb-6 border-l-4 border-red-700">
          <p className="mb-2">
            • При изготвянето на тази проекция, са калкулирани всички бонуси и разходи на база на общите условия на спестовно-инвестиционната програма.
          </p>
          <p>
            • Информацията и числата в тази проекция са базирани на допускания за бъдещ период. Те се предоставят с информационна цел и не представляват обещание или гаранция за бъдещи финансови резултати.
          </p>
        </div>

        {/* Consultant Info */}
        {consultant && (
          <div className="text-center text-sm border-t pt-6 space-y-1">
            <p className="font-semibold text-slate-800">{consultant.name || 'Личен Финансов Консултант'}</p>
            <p className="text-slate-600">Личен Финансов Консултант</p>
            {consultant.phone && <p className="text-slate-600">{consultant.phone}</p>}
            <p className="font-semibold text-red-700">Партнърс Груп БГ</p>
            {consultant.email && <p className="text-slate-600">{consultant.email}</p>}
          </div>
        )}
      </div>
    </div>
  );
}