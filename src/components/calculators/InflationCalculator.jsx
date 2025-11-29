import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from 'lucide-react';

export default function InflationCalculator() {
  const [amount, setAmount] = useState(10000);
  const [years, setYears] = useState(10);
  const [inflationRate, setInflationRate] = useState(3);

  const calculateFutureValue = () => {
    return amount / Math.pow(1 + inflationRate / 100, years);
  };

  const futureValue = calculateFutureValue();
  const loss = amount - futureValue;
  const lossPercent = (loss / amount) * 100;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Калкулатор за инфлация</h2>
      <p className="text-sm text-slate-600">
        Изчислете как инфлацията ще повлияе на покупателната способност на вашите пари
      </p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Днешна стойност (€)</Label>
            <Input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
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
            <Label>Годишна инфлация (%)</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={inflationRate}
              onChange={(e) => setInflationRate(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-2 p-3 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900">
                Инфлацията намалява покупателната способност на парите ви
              </p>
            </div>
            
            <div>
              <p className="text-sm text-slate-600 mb-1">Днешна стойност</p>
              <p className="text-2xl font-bold text-slate-900">
                {amount.toLocaleString('bg-BG', { maximumFractionDigits: 2 })} €
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Загуба на стойност</p>
              <p className="text-2xl font-bold text-red-600">
                -{loss.toLocaleString('bg-BG', { maximumFractionDigits: 2 })} €
              </p>
              <p className="text-xs text-slate-500 mt-1">
                -{lossPercent.toLocaleString('bg-BG', { maximumFractionDigits: 1 })}%
              </p>
            </div>
            <div className="pt-3 border-t border-amber-200">
              <p className="text-sm text-slate-600 mb-1">Реална стойност след {years} години</p>
              <p className="text-3xl font-bold text-orange-600">
                {futureValue.toLocaleString('bg-BG', { maximumFractionDigits: 2 })} €
              </p>
            </div>
            <div className="pt-2 text-xs text-slate-600">
              <p>При средна годишна инфлация от {inflationRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}