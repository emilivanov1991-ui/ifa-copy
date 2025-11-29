import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InvestmentCalculator() {
  const [initialAmount, setInitialAmount] = useState(5000);
  const [monthlyAmount, setMonthlyAmount] = useState(100);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(8);

  const calculateFutureValue = () => {
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    
    // Future value of initial investment
    const fvInitial = initialAmount * Math.pow(1 + monthlyRate, months);
    
    // Future value of monthly contributions
    let fvMonthly = 0;
    if (monthlyRate === 0) {
      fvMonthly = monthlyAmount * months;
    } else {
      fvMonthly = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    }
    
    return fvInitial + fvMonthly;
  };

  const totalInvested = initialAmount + (monthlyAmount * years * 12);
  const futureValue = calculateFutureValue();
  const earnings = futureValue - totalInvested;
  const returnPercent = (earnings / totalInvested) * 100;

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
    </div>
  );
}