import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard } from 'lucide-react';

export default function UBBConsumerLoanCalculator({ analysisId, clientId }) {
  const EUR_BGN_RATE = 1.95583;
  
  const [inputs, setInputs] = useState({
    loanAmount: 10000,
    loanTerm: 48,
    salaryPackage: false
  });

  const calculations = useMemo(() => {
    const amountBGN = inputs.loanAmount * EUR_BGN_RATE;
    
    // Лихва според сума и срок
    let interestRate = 5.95;
    
    if (amountBGN >= 30000 && amountBGN <= 100000) interestRate = 5.20;
    else if (amountBGN > 100000) interestRate = 4.50;
    
    if (inputs.loanTerm >= 36 && inputs.loanTerm <= 60) interestRate = 5.50;
    else if (inputs.loanTerm > 60) interestRate = 4.50;
    
    if (inputs.salaryPackage) interestRate -= 0.5;
    
    interestRate = Math.max(interestRate, 4.0);
    
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = inputs.loanTerm;
    
    const monthlyPayment = inputs.loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    // Такси ОББ
    const processingFeePercent = 0.01; // 1%
    const processingFee = Math.min(Math.max(inputs.loanAmount * processingFeePercent, 30 / EUR_BGN_RATE), 600 / EUR_BGN_RATE);
    const monthlyManagementFee = 2.50;
    
    const totalMonthlyPayment = monthlyPayment + monthlyManagementFee;
    
    let balance = inputs.loanAmount;
    const schedule = [];
    
    for (let i = 1; i <= numPayments; i++) {
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
    const totalCost = inputs.loanAmount + totalInterest + processingFee + (monthlyManagementFee * numPayments);
    const apr = ((totalCost / inputs.loanAmount - 1) / (inputs.loanTerm / 12)) * 100;
    
    return {
      monthlyPayment,
      totalMonthlyPayment,
      interestRate,
      totalInterest,
      totalPaid: inputs.loanAmount + totalInterest,
      apr,
      fees: {
        processing: processingFee,
        monthlyManagement: monthlyManagementFee
      },
      schedule: schedule.slice(0, 12)
    };
  }, [inputs]);

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-orange-600" />
          ОББ - Потребителски кредит
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Сума на кредита (EUR)</Label>
            <Input
              type="number"
              value={inputs.loanAmount}
              onChange={(e) => setInputs({...inputs, loanAmount: parseFloat(e.target.value) || 0})}
            />
            <p className="text-xs text-slate-500 mt-1">Минимум: 511 EUR | Максимум: 153,391 EUR</p>
          </div>
          
          <div>
            <Label>Срок (месеци)</Label>
            <Input
              type="number"
              value={inputs.loanTerm}
              onChange={(e) => setInputs({...inputs, loanTerm: parseInt(e.target.value) || 0})}
            />
            <p className="text-xs text-slate-500 mt-1">Минимум: 12 | Максимум: 84 (до 120 за >75K)</p>
          </div>
          
          <div className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              checked={inputs.salaryPackage}
              onChange={(e) => setInputs({...inputs, salaryPackage: e.target.checked})}
              className="w-4 h-4"
            />
            <Label>"За заплата" пакет (-0.5%)</Label>
          </div>
        </div>

        <Separator />

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-slate-600">Месечна вноска</p>
              <p className="text-2xl font-bold text-blue-700">{calculations.monthlyPayment.toFixed(2)} EUR</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Обща вноска</p>
              <p className="text-2xl font-bold text-red-700">{calculations.totalMonthlyPayment.toFixed(2)} EUR</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Общо за връщане</p>
              <p className="text-2xl font-bold text-slate-900">{calculations.totalPaid.toLocaleString()} EUR</p>
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
          <h4 className="font-semibold mb-2">Такси</h4>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span>Такса издаване (1%):</span>
              <span className="font-semibold">{calculations.fees.processing.toFixed(2)} EUR</span>
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

        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded text-sm">
          <p className="font-semibold text-green-900 mb-1">Предимства:</p>
          <ul className="text-green-800 space-y-1 text-xs">
            <li>✓ По-висок максимум: 300,000 BGN</li>
            <li>✓ По-дълги срокове: до 120 месеца за големи суми</li>
            <li>✓ Безплатно предсрочно погасяване</li>
            <li>✓ Одобрение за 24-48 часа</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}