import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function InvestmentCalculator() {
  const [initialAmount, setInitialAmount] = useState(5000);
  const [monthlyAmount, setMonthlyAmount] = useState(100);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(8);

  const calculateFutureValue = (months) => {
    const monthlyRate = rate / 100 / 12;
    
    // Future value of initial investment
    const fvInitial = initialAmount * Math.pow(1 + monthlyRate, months);
    
    // Future value of monthly contributions
    let fvMonthly = 0;
    if (monthlyRate === 0) {
      fvMonthly = monthlyAmount * months;
    } else {
      fvMonthly = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    }
    
    return { total: fvInitial + fvMonthly, fromInitial: fvInitial, fromMonthly: fvMonthly };
  };

  const totalInvested = initialAmount + (monthlyAmount * years * 12);
  const { total: futureValue } = calculateFutureValue(years * 12);
  const earnings = futureValue - totalInvested;
  const returnPercent = (earnings / totalInvested) * 100;

  // Generate chart data
  const chartData = useMemo(() => {
    const data = [];
    for (let year = 0; year <= years; year++) {
      const months = year * 12;
      const invested = initialAmount + (monthlyAmount * months);
      const { total } = calculateFutureValue(months);
      data.push({
        year,
        'Инвестирано': invested,
        'Обща стойност': total,
        'Печалба': total - invested
      });
    }
    return data;
  }, [initialAmount, monthlyAmount, years, rate]);

  // Pie chart data
  const pieData = [
    { name: 'Начална сума', value: initialAmount, color: '#6366f1' },
    { name: 'Месечни вноски', value: monthlyAmount * years * 12, color: '#8b5cf6' },
    { name: 'Печалба', value: earnings, color: '#10b981' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Инвестиционен калкулатор</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Начална сума (€)</Label>
            <Input
              type="number"
              min="0"
              value={initialAmount}
              onChange={(e) => setInitialAmount(parseFloat(e.target.value) || 0)}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>Месечна инвестиция (€)</Label>
            <Input
              type="number"
              min="0"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label>Инвестиционен период (години)</Label>
            <Input
              type="number"
              min="1"
              max="50"
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="space-y-2">
            <Label>Очаквана годишна доходност (%)</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Общо инвестирано</p>
              <p className="text-2xl font-bold text-slate-900">
                {totalInvested.toLocaleString('bg-BG', { maximumFractionDigits: 2 })} €
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Печалба от инвестицията</p>
              <p className="text-2xl font-bold text-green-600">
                +{earnings.toLocaleString('bg-BG', { maximumFractionDigits: 2 })} €
              </p>
              <p className="text-xs text-slate-500 mt-1">
                +{returnPercent.toLocaleString('bg-BG', { maximumFractionDigits: 1 })}%
              </p>
            </div>
            <div className="pt-3 border-t border-purple-200">
              <p className="text-sm text-slate-600 mb-1">Крайна стойност на портфейла</p>
              <p className="text-3xl font-bold text-purple-600">
                {futureValue.toLocaleString('bg-BG', { maximumFractionDigits: 2 })} €
              </p>
            </div>
            <div className="pt-2 text-xs text-slate-600">
              <p>При {rate}% годишна доходност за период от {years} години</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Chart */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4 text-slate-900">Растеж на портфейла</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" label={{ value: 'Години', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Сума (€)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value) => value.toLocaleString('bg-BG', { maximumFractionDigits: 2 }) + ' €'}
                labelFormatter={(label) => `Година ${label}`}
              />
              <Legend />
              <Area type="monotone" dataKey="Инвестирано" stackId="1" stroke="#8b5cf6" fill="#c4b5fd" />
              <Area type="monotone" dataKey="Печалба" stackId="1" stroke="#10b981" fill="#86efac" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Composition Pie */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4 text-slate-900">Разпределение на крайния капитал</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString('bg-BG', { maximumFractionDigits: 2 }) + ' €'} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}