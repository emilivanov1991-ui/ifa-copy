import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Home, TrendingDown } from 'lucide-react';

export default function UBBMortgageCalculator({ analysisId, clientId }) {
  const EUR_BGN_RATE = 1.95583;
  
  const [inputs, setInputs] = useState({
    propertyValue: 100000,
    downPayment: 15,
    loanTerm: 20,
    propertyType: 'apartment',
    salaryPackage: false
  });

  const calculations = useMemo(() => {
    const loanAmount = inputs.propertyValue * (1 - inputs.downPayment / 100);
    
    // ОББ лихва според сума
    let interestRate = loanAmount > 100000 ? 2.28 : 2.80;
    
    if (inputs.downPayment > 20) interestRate -= 0.25;
    if (inputs.salaryPackage) interestRate -= 0.4;
    if (inputs.propertyType === 'house') interestRate += 0.28;
    
    interestRate = Math.max(interestRate, 2.15);
    
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = inputs.loanTerm * 12;
    
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    // Такси ОББ
    const processingFee = 127.82; // EUR
    const propertyAppraisal = 200;
    const monthlyManagementFee = 1.28;
    const monthlyAccountFee = 2.25;
    const notarialFee = loanAmount * 0.0015;
    const mortgageCancellationFee = 30.68;
    
    const propertyInsuranceAnnual = loanAmount * 0.0058;
    
    const totalMonthlyPayment = monthlyPayment + monthlyManagementFee + monthlyAccountFee + (propertyInsuranceAnnual / 12);
    
    let balance = loanAmount;
    const schedule = [];
    
    for (let i = 1; i <= Math.min(numPayments, 360); i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      
      schedule.push({
        month: i,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(balance, 0)
      });
    }
    
    const totalInterest = schedule.reduce((sum, p) => sum + p.interest, 0);
    const totalCost = loanAmount + totalInterest + processingFee + propertyAppraisal + notarialFee + 
                      mortgageCancellationFee + (monthlyManagementFee * numPayments) + 
                      (monthlyAccountFee * numPayments) + (propertyInsuranceAnnual * inputs.loanTerm);
    const apr = ((totalCost / loanAmount - 1) / inputs.loanTerm) * 100;
    
    return {
      loanAmount,
      monthlyPayment,
      totalMonthlyPayment,
      interestRate,
      totalInterest,
      apr,
      fees: {
        processing: processingFee,
        appraisal: propertyAppraisal,
        monthlyManagement: monthlyManagementFee,
        monthlyAccount: monthlyAccountFee,
        notarial: notarialFee,
        mortgageCancellation: mortgageCancellationFee
      },
      insurance: {
        propertyAnnual: propertyInsuranceAnnual
      },
      schedule: schedule.slice(0, 12)
    };
  }, [inputs]);

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-orange-600" />
          ОББ - Ипотечен кредит за недвижим имот
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Стойност на имота (EUR)</Label>
            <Input
              type="number"
              value={inputs.propertyValue}
              onChange={(e) => setInputs({...inputs, propertyValue: parseFloat(e.target.value) || 0})}
            />
          </div>
          
          <div>
            <Label>Собствен принос (%)</Label>
            <Input
              type="number"
              value={inputs.downPayment}
              onChange={(e) => setInputs({...inputs, downPayment: parseFloat(e.target.value) || 0})}
            />
          </div>
          
          <div>
            <Label>Срок (години)</Label>
            <Input
              type="number"
              value={inputs.loanTerm}
              onChange={(e) => setInputs({...inputs, loanTerm: parseInt(e.target.value) || 0})}
            />
          </div>
          
          <div>
            <Label>Тип имот</Label>
            <Select value={inputs.propertyType} onValueChange={(v) => setInputs({...inputs, propertyType: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">Апартамент</SelectItem>
                <SelectItem value="house">Къща</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={inputs.salaryPackage}
              onChange={(e) => setInputs({...inputs, salaryPackage: e.target.checked})}
              className="w-4 h-4"
            />
            <Label>"За заплата" пакет (-0.4%)</Label>
          </div>
        </div>

        <Separator />

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-slate-600">Сума на кредита</p>
              <p className="text-2xl font-bold text-blue-700">{calculations.loanAmount.toLocaleString()} EUR</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Месечна вноска</p>
              <p className="text-2xl font-bold text-green-700">{calculations.monthlyPayment.toFixed(2)} EUR</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Обща вноска</p>
              <p className="text-2xl font-bold text-red-700">{calculations.totalMonthlyPayment.toFixed(2)} EUR</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-600">Лихвен процент</p>
              <p className="text-xl font-bold text-slate-900">{calculations.interestRate.toFixed(2)}%</p>
              {calculations.loanAmount > 100000 && (
                <p className="text-xs text-green-600">✓ Преференциална лихва >100K EUR</p>
              )}
            </div>
            <div>
              <p className="text-sm text-slate-600">ГПР</p>
              <p className="text-xl font-bold text-slate-900">{calculations.apr.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Общо лихви</p>
              <p className="text-xl font-bold text-red-600">{calculations.totalInterest.toLocaleString()} EUR</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Такси и разходи</h4>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span>Документален анализ:</span>
              <span className="font-semibold">{calculations.fees.processing.toFixed(2)} EUR</span>
            </div>
            <div className="flex justify-between">
              <span>Оценка на имот:</span>
              <span className="font-semibold">{calculations.fees.appraisal.toFixed(2)} EUR</span>
            </div>
            <div className="flex justify-between">
              <span>Месечно упр. кредит:</span>
              <span className="font-semibold">{calculations.fees.monthlyManagement.toFixed(2)} EUR</span>
            </div>
            <div className="flex justify-between">
              <span>Месечно упр. сметка:</span>
              <span className="font-semibold">{calculations.fees.monthlyAccount.toFixed(2)} EUR</span>
            </div>
            <div className="flex justify-between">
              <span>Заличаване ипотека:</span>
              <span className="font-semibold">{calculations.fees.mortgageCancellation.toFixed(2)} EUR</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Амортизационна таблица (първи 12 месеца)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-2 text-left">Месец</th>
                  <th className="p-2 text-right">Вноска (EUR)</th>
                  <th className="p-2 text-right">Главница (EUR)</th>
                  <th className="p-2 text-right">Лихва (EUR)</th>
                  <th className="p-2 text-right">Остатък (EUR)</th>
                </tr>
              </thead>
              <tbody>
                {calculations.schedule.map((row) => (
                  <tr key={row.month} className="border-b">
                    <td className="p-2">{row.month}</td>
                    <td className="p-2 text-right">{row.payment.toFixed(2)}</td>
                    <td className="p-2 text-right">{row.principal.toFixed(2)}</td>
                    <td className="p-2 text-right">{row.interest.toFixed(2)}</td>
                    <td className="p-2 text-right">{row.balance.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded text-sm">
          <p className="font-semibold text-green-900 mb-1">Предимства:</p>
          <ul className="text-green-800 space-y-1 text-xs">
            <li>✓ Най-ниска лихва от 2.28% за суми >100K EUR</li>
            <li>✓ Flexi опции за гъвкави вноски</li>
            <li>✓ Безплатно рефинансиране в ОББ</li>
            <li>✓ Застраховка живот е опционална</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}