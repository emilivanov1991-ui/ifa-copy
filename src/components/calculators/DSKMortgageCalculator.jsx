import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Home } from 'lucide-react';

export default function DSKMortgageCalculator({ analysisId, clientId }) {
  const EUR_BGN_RATE = 1.95583;
  
  const [inputs, setInputs] = useState({
    propertyValue: 100000,
    downPayment: 20,
    loanTerm: 20,
    propertyType: 'apartment',
    salaryTransfer: false,
    packageServices: false
  });

  const calculations = useMemo(() => {
    const propertyValueBGN = inputs.propertyValue * EUR_BGN_RATE;
    const loanAmount = propertyValueBGN * (1 - inputs.downPayment / 100);
    
    let interestRate = 2.89;
    
    if (inputs.downPayment > 25) interestRate -= 0.4;
    if (inputs.salaryTransfer) interestRate -= 0.5;
    if (inputs.packageServices) interestRate -= 0.4;
    if (inputs.propertyType === 'house') interestRate += 0.4;
    
    interestRate = Math.max(interestRate, 2.7);
    
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = inputs.loanTerm * 12;
    
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    // Такси ДСК
    let processingFee;
    if (loanAmount < 50000) processingFee = 150;
    else if (loanAmount < 100000) processingFee = 300;
    else if (loanAmount < 400000) processingFee = 600;
    else processingFee = 900;
    
    const propertyAppraisal = inputs.propertyType === 'apartment' ? 195 : 250;
    const monthlyManagementFee = 2.25;
    const legalFee = 40;
    const notarialFee = loanAmount * 0.003;
    
    const propertyInsuranceAnnual = loanAmount * 0.006;
    const lifeInsuranceMonthly = 30;
    
    const totalMonthlyPayment = monthlyPayment + monthlyManagementFee + lifeInsuranceMonthly + (propertyInsuranceAnnual / 12);
    
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
    const totalCost = loanAmount + totalInterest + processingFee + propertyAppraisal + legalFee + notarialFee + 
                      (monthlyManagementFee * numPayments) + (lifeInsuranceMonthly * numPayments) + 
                      (propertyInsuranceAnnual * inputs.loanTerm);
    const apr = ((totalCost / loanAmount - 1) / inputs.loanTerm) * 100;
    
    return {
      loanAmount: loanAmount / EUR_BGN_RATE,
      loanAmountBGN: loanAmount,
      monthlyPayment: monthlyPayment / EUR_BGN_RATE,
      totalMonthlyPayment: totalMonthlyPayment / EUR_BGN_RATE,
      interestRate,
      totalInterest: totalInterest / EUR_BGN_RATE,
      apr,
      fees: {
        processing: processingFee / EUR_BGN_RATE,
        appraisal: propertyAppraisal / EUR_BGN_RATE,
        monthlyManagement: monthlyManagementFee,
        legal: legalFee / EUR_BGN_RATE,
        notarial: notarialFee / EUR_BGN_RATE
      },
      insurance: {
        propertyAnnual: propertyInsuranceAnnual / EUR_BGN_RATE,
        lifeMonthly: lifeInsuranceMonthly
      },
      schedule: schedule.slice(0, 12).map(s => ({
        ...s,
        payment: s.payment / EUR_BGN_RATE,
        principal: s.principal / EUR_BGN_RATE,
        interest: s.interest / EUR_BGN_RATE,
        balance: s.balance / EUR_BGN_RATE
      }))
    };
  }, [inputs]);

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
        <CardTitle className="flex items-center gap-2">
          <Home className="w-5 h-5 text-green-600" />
          ДСК Банк - Ипотечен кредит
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
              checked={inputs.salaryTransfer}
              onChange={(e) => setInputs({...inputs, salaryTransfer: e.target.checked})}
              className="w-4 h-4"
            />
            <Label>Превод на заплата (-0.5%)</Label>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={inputs.packageServices}
              onChange={(e) => setInputs({...inputs, packageServices: e.target.checked})}
              className="w-4 h-4"
            />
            <Label>"ДСК Уют" пакет (-0.4%)</Label>
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
              <span>Такса разглеждане:</span>
              <span className="font-semibold">{calculations.fees.processing.toFixed(2)} EUR</span>
            </div>
            <div className="flex justify-between">
              <span>Оценка на имот:</span>
              <span className="font-semibold">{calculations.fees.appraisal.toFixed(2)} EUR</span>
            </div>
            <div className="flex justify-between">
              <span>Юридическо оформяне:</span>
              <span className="font-semibold">{calculations.fees.legal.toFixed(2)} EUR</span>
            </div>
            <div className="flex justify-between">
              <span>Месечно управление:</span>
              <span className="font-semibold">{calculations.fees.monthlyManagement.toFixed(2)} EUR</span>
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

        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded text-sm">
          <p className="font-semibold text-amber-900 mb-1">Важно:</p>
          <ul className="text-amber-800 space-y-1 text-xs">
            <li>• Минимален собствен принос: 20%</li>
            <li>• Безплатни такси при рефинансиране над 30,000 BGN</li>
            <li>• Период за одобрение: 7-14 работни дни</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}