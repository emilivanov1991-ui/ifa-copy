import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function TermDepositCalculator() {
  const [amount, setAmount] = useState(10000);
  const [term, setTerm] = useState(12);
  const [rate, setRate] = useState(3);

  const calculateInterest = () => {
    const interest = (amount * rate * term) / (12 * 100);
    return interest;
  };

  const totalAmount = amount + calculateInterest();

  // Comparison data for different rates
  const comparisonData = useMemo(() => {
    return [1, 2, 3, 4, 5, 6].map(r => {
      const interest = (amount * r * term) / (12 * 100);
      return {
        rate: `${r}%`,
        'Лихва': interest,
        'Обща сума': amount + interest
      };
    });
  }, [amount, term]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Калкулатор за срочен депозит</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Сума на депозита (€)</Label>
            <Input
              type="number"
              min="100"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>Срок (месеци)</Label>
            <Input
              type="number"
              min="1"
              max="120"
              value={term}
              onChange={(e) => setTerm(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="space-y-2">
            <Label>Годишна лихва (%)</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Начална сума</p>
              <p className="text-2xl font-bold text-slate-900">
                {amount.toLocaleString('bg-BG', { maximumFractionDigits: 2 })} €
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Лихва</p>
              <p className="text-2xl font-bold text-green-600">
                +{calculateInterest().toLocaleString('bg-BG', { maximumFractionDigits: 2 })} €
              </p>
            </div>
            <div className="pt-3 border-t border-blue-200">
              <p className="text-sm text-slate-600 mb-1">Крайна сума</p>
              <p className="text-3xl font-bold text-blue-600">
                {totalAmount.toLocaleString('bg-BG', { maximumFractionDigits: 2 })} €
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Chart */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4 text-slate-900">Сравнение при различни лихви</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="rate" />
              <YAxis label={{ value: 'Сума (€)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value) => value.toLocaleString('bg-BG', { maximumFractionDigits: 2 }) + ' €'}
              />
              <Legend />
              <Bar dataKey="Лихва" stackId="a" fill="#10b981">
                {comparisonData.map((entry, index) => (
                  <Cell key={index} fill={entry.rate === `${rate}%` ? '#059669' : '#86efac'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-500 mt-3 text-center">
            Тъмнозеленият стълб показва избраната от вас лихва
          </p>
        </CardContent>
      </Card>
    </div>
  );
}