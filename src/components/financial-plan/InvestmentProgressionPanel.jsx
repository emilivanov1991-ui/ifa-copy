import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

export default function InvestmentProgressionPanel({ productsEUR, analysisData, clientData, age, yearsToRetirement }) {
  const EUR_BGN_RATE = 1.95583;

  // Monthly investment = UL investment component + pension plans + Partners (excluding children products)
  const monthlyInvestmentAmount = productsEUR
    .filter(p => {
      const isInvestment =
        p.type === 'ul_investment' ||
        p.name?.includes('Unit Linked') ||
        p.type === 'pension_plan' ||
        p.name?.includes('УПФ') ||
        p.name?.includes('ДПФ') ||
        p.type === 'partners_regular' ||
        p.type === 'partners_single' ||
        p.name?.includes('Partners');
      const isChildProduct = p.name?.includes('Junior') || p.name?.includes('Детство');
      return isInvestment && !isChildProduct;
    })
    .reduce((sum, p) => {
      if ((p.type === 'ul_investment' || p.name?.includes('Unit Linked')) && (p.investmentPremium || 0) > 0) {
        return sum + p.investmentPremium;
      }
      return sum + (p.monthlyPremium || 0);
    }, 0);

  // Chart data to retirement (age 65)
  const chartData = Array.from({ length: yearsToRetirement + 1 }, (_, i) => {
    const currentAge = age + i;
    const months = i * 12;
    const deposit = monthlyInvestmentAmount * months;
    const monthlyReturn = 0.08 / 12;
    const accumulated = months > 0 && monthlyInvestmentAmount > 0
      ? monthlyInvestmentAmount * (((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn) * (1 + monthlyReturn))
      : 0;
    return { age: currentAge, deposit, accumulated };
  });

  // Children education
  const childrenCount = analysisData?.children_count || 0;
  const childrenProducts = productsEUR.filter(p => p.name?.includes('Junior') || p.name?.includes('Детство'));

  const childEducationData = childrenCount > 0 && childrenProducts.length > 0
    ? Array.from({ length: childrenCount }, (_, i) => {
        const childProduct = childrenProducts.find(p => p.name?.includes(`Дете ${i + 1}`)) || childrenProducts[i];
        if (!childProduct) return null;
        const childBirthdate = analysisData?.[`child_${i + 1}_birthdate`];
        const childName = analysisData?.[`child_${i + 1}_name`] || `Дете ${i + 1}`;
        const childAge = childBirthdate
          ? new Date().getFullYear() - new Date(childBirthdate).getFullYear()
          : 5;
        const yearsTo19 = Math.max(19 - childAge, 0);
        const months = yearsTo19 * 12;
        const monthlyPremium = childProduct.monthlyPremium || 0;
        const deposit = monthlyPremium * months;
        const monthlyReturn = 0.08 / 12;
        const accumulated = months > 0 && monthlyPremium > 0
          ? monthlyPremium * (((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn) * (1 + monthlyReturn))
          : 0;
        return { name: childName, deposit, accumulated, childAge, yearsTo19, monthlyPremium };
      }).filter(Boolean)
    : [];

  return (
    <div className="space-y-4">
      {/* Main investment chart */}
      <Card className="border-blue-200">
        <CardContent className="p-4">
          <h3 className="text-lg font-bold text-blue-900 mb-1">Прогресия на инвестициите</h3>
          <p className="text-xs text-slate-500 mb-3">Сбор на двамата партньори • до 65 г. възраст • доходност 8%/год.</p>
          {monthlyInvestmentAmount === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">Няма инвестиционни продукти в плана</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="invDepositGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="invAccGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="age" label={{ value: 'Възраст', position: 'insideBottom', offset: -5 }} stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}М` : `${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  labelFormatter={(v) => `Възраст: ${v}`}
                  formatter={(value, name) => [
                    value >= 1000000 ? `${(value/1000000).toFixed(2)} мил. EUR` : `${(value/1000).toFixed(1)}K EUR`,
                    name === 'deposit' ? 'Депозит (вложено)' : 'Натрупано'
                  ]}
                />
                <Legend wrapperStyle={{ paddingTop: '8px' }} formatter={(v) => v === 'deposit' ? 'Депозит (вложено)' : 'Натрупано'} />
                <Area type="monotone" dataKey="deposit" stroke="#94a3b8" strokeWidth={2} fill="url(#invDepositGrad)" name="deposit" />
                <Area type="monotone" dataKey="accumulated" stroke="#3b82f6" strokeWidth={3} fill="url(#invAccGrad)" name="accumulated" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Children education */}
      {childEducationData.length >= 2 && (
        <Card className="border-indigo-200">
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-indigo-900 mb-3">Образование на децата</h3>
            <div className="space-y-2">
              {childEducationData.map((child, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 px-3 bg-indigo-50 rounded-lg">
                  <span className="font-semibold text-indigo-800">{child.name}</span>
                  <div className="text-right text-sm">
                    <p className="text-slate-600">
                      Депозит <span className="font-bold text-slate-800">{child.deposit.toLocaleString('bg-BG', { maximumFractionDigits: 0 })} EUR</span>
                    </p>
                    <p className="text-indigo-700">
                      Натрупани <span className="font-bold">{child.accumulated.toLocaleString('bg-BG', { maximumFractionDigits: 0 })} EUR</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {childEducationData.length === 1 && (() => {
        const child = childEducationData[0];
        const childChartData = Array.from({ length: child.yearsTo19 + 1 }, (_, i) => {
          const months = i * 12;
          const deposit = child.monthlyPremium * months;
          const monthlyReturn = 0.08 / 12;
          const accumulated = months > 0 && child.monthlyPremium > 0
            ? child.monthlyPremium * (((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn) * (1 + monthlyReturn))
            : 0;
          return { age: child.childAge + i, deposit, accumulated };
        });

        return (
          <Card className="border-indigo-200">
            <CardContent className="p-4">
              <h3 className="text-lg font-bold text-indigo-900 mb-1">Образование: {child.name}</h3>
              <p className="text-xs text-slate-500 mb-3">Проекция до 19-годишна възраст</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={childChartData}>
                  <defs>
                    <linearGradient id="childDepGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="childAccGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="age" label={{ value: 'Възраст', position: 'insideBottom', offset: -5 }} stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    labelFormatter={(v) => `Възраст: ${v}`}
                    formatter={(value, name) => [
                      `${(value/1000).toFixed(1)}K EUR`,
                      name === 'deposit' ? 'Депозит (вложено)' : 'Натрупано'
                    ]}
                  />
                  <Legend wrapperStyle={{ paddingTop: '8px' }} formatter={(v) => v === 'deposit' ? 'Депозит (вложено)' : 'Натрупано'} />
                  <Area type="monotone" dataKey="deposit" stroke="#94a3b8" strokeWidth={2} fill="url(#childDepGrad)" name="deposit" />
                  <Area type="monotone" dataKey="accumulated" stroke="#6366f1" strokeWidth={3} fill="url(#childAccGrad)" name="accumulated" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}