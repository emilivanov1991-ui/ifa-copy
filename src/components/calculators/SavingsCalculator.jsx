import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function SavingsCalculator() {
  const [monthlyAmount, setMonthlyAmount] = useState(50);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(5);

  const calculateFutureValue = () => {
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    
    if (monthlyRate === 0) {
      return monthlyAmount * months;
    }
    
    const fv = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    return fv;
  };

  const totalInvested = monthlyAmount * years * 12;
  const futureValue = calculateFutureValue();
  const earnings = futureValue - totalInvested;

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
    </div>
  );
}