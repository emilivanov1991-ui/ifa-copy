import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SavingsCalculator() {
  const [monthlyAmount, setMonthlyAmount] = useState(50);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(5);

  const calculateFutureValue = (months, rate) => {
    const monthlyRate = rate / 100 / 12;
    
    if (monthlyRate === 0) {
      return monthlyAmount * months;
    }
    
    const fv = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    return fv;
  };

  const totalInvested = monthlyAmount * years * 12;
  const futureValue = calculateFutureValue(years * 12, rate);
  const earnings = futureValue - totalInvested;

  // Generate chart data
  const chartData = useMemo(() => {
    const data = [];
    for (let year = 0; year <= years; year++) {
      const months = year * 12;
      const invested = monthlyAmount * months;
      const value = calculateFutureValue(months, rate);
      data.push({
        year,
        'Инвестирано': invested,
        'Обща стойност': value,
        'Печалба': value - invested
      });
    }
    return data;
  }, [monthlyAmount, years, rate]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Калкулатор за спестявания</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Месечна сума (€)</Label>
            <Input
              type="number"
              min="1"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(parseFloat(e.target.value) || 0)}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>Период (години)</Label>
            <Input
              type="number"
              min="1"
              max="50"
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="space-y-2">
            <Label>Годишна доходност (%)</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Общо инвестирано</p>
              <p className="text-2xl font-bold text-slate-900">
                {totalInvested.toLocaleString('bg-BG', { maximumFractionDigits: 2 })} €
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Печалба</p>
              <p className="text-2xl font-bold text-green-600">
                +{earnings.toLocaleString('bg-BG', { maximumFractionDigits: 2 })} €
              </p>
            </div>
            <div className="pt-3 border-t border-green-200">
              <p className="text-sm text-slate-600 mb-1">Крайна стойност</p>
              <p className="text-3xl font-bold text-emerald-600">
                {futureValue.toLocaleString('bg-BG', { maximumFractionDigits: 2 })} €
              </p>
            </div>
            <div className="pt-2 text-xs text-slate-600">
              <p>При месечна инвестиция от {monthlyAmount} € в продължение на {years} години</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4 text-slate-900">Растеж на инвестицията във времето</h3>
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
              <Area type="monotone" dataKey="Инвестирано" stackId="1" stroke="#94a3b8" fill="#cbd5e1" />
              <Area type="monotone" dataKey="Печалба" stackId="1" stroke="#10b981" fill="#86efac" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}