import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Award } from 'lucide-react';

export default function ConsumerLoanComparison() {
  const EUR_BGN_RATE = 1.95583;
  
  const [inputs, setInputs] = useState({
    loanAmount: 10000,
    loanTerm: 36
  });

  const comparisons = useMemo(() => {
    const results = [];
    const amountBGN = inputs.loanAmount * EUR_BGN_RATE;
    
    // UniCredit
    let ucRate = 5.50;
    if (amountBGN >= 20000 && amountBGN <= 100000) ucRate = 4.50;
    else if (amountBGN > 100000) ucRate = 3.90;
    if (inputs.loanTerm >= 36 && inputs.loanTerm <= 60) ucRate = 4.90;
    else if (inputs.loanTerm > 60) ucRate = 3.90;
    
    const ucMonthlyRate = ucRate / 100 / 12;
    const ucMonthlyPayment = inputs.loanAmount * (ucMonthlyRate * Math.pow(1 + ucMonthlyRate, inputs.loanTerm)) / 
                             (Math.pow(1 + ucMonthlyRate, inputs.loanTerm) - 1);
    const ucTotalInterest = (ucMonthlyPayment * inputs.loanTerm) - inputs.loanAmount;
    const ucFees = Math.min(Math.max(inputs.loanAmount * 0.01, 20/EUR_BGN_RATE), 500/EUR_BGN_RATE) + (2.00 * inputs.loanTerm);
    const ucAPR = ((inputs.loanAmount + ucTotalInterest + ucFees) / inputs.loanAmount - 1) / (inputs.loanTerm / 12) * 100;
    
    results.push({
      bank: 'UniCredit Булбанк',
      rate: ucRate,
      monthlyPayment: ucMonthlyPayment,
      totalInterest: ucTotalInterest,
      apr: ucAPR,
      totalCost: inputs.loanAmount + ucTotalInterest + ucFees
    });
    
    // ОББ
    let ubbRate = 5.95;
    if (amountBGN >= 30000 && amountBGN <= 100000) ubbRate = 5.20;
    else if (amountBGN > 100000) ubbRate = 4.50;
    if (inputs.loanTerm >= 36 && inputs.loanTerm <= 60) ubbRate = 5.50;
    else if (inputs.loanTerm > 60) ubbRate = 4.50;
    
    const ubbMonthlyRate = ubbRate / 100 / 12;
    const ubbMonthlyPayment = inputs.loanAmount * (ubbMonthlyRate * Math.pow(1 + ubbMonthlyRate, inputs.loanTerm)) / 
                              (Math.pow(1 + ubbMonthlyRate, inputs.loanTerm) - 1);
    const ubbTotalInterest = (ubbMonthlyPayment * inputs.loanTerm) - inputs.loanAmount;
    const ubbFees = Math.min(Math.max(inputs.loanAmount * 0.01, 30/EUR_BGN_RATE), 600/EUR_BGN_RATE) + (2.50 * inputs.loanTerm);
    const ubbAPR = ((inputs.loanAmount + ubbTotalInterest + ubbFees) / inputs.loanAmount - 1) / (inputs.loanTerm / 12) * 100;
    
    results.push({
      bank: 'ОББ',
      rate: ubbRate,
      monthlyPayment: ubbMonthlyPayment,
      totalInterest: ubbTotalInterest,
      apr: ubbAPR,
      totalCost: inputs.loanAmount + ubbTotalInterest + ubbFees
    });
    
    return results.sort((a, b) => a.totalCost - b.totalCost);
  }, [inputs]);

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-100">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-indigo-600" />
          Сравнение на потребителски кредити
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
          </div>
          <div>
            <Label>Срок (месеци)</Label>
            <Input
              type="number"
              value={inputs.loanTerm}
              onChange={(e) => setInputs({...inputs, loanTerm: parseInt(e.target.value) || 0})}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">Банка</th>
                <th className="p-3 text-right">Лихва</th>
                <th className="p-3 text-right">Мес. вноска</th>
                <th className="p-3 text-right">Общо лихви</th>
                <th className="p-3 text-right">ГПР</th>
                <th className="p-3 text-right">Обща цена</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((item, idx) => (
                <tr key={idx} className={`border-b ${idx === 0 ? 'bg-green-50' : ''}`}>
                  <td className="p-3 font-semibold">
                    {idx === 0 && <Award className="w-4 h-4 text-green-600 inline mr-2" />}
                    {item.bank}
                  </td>
                  <td className="p-3 text-right">{item.rate.toFixed(2)}%</td>
                  <td className="p-3 text-right font-semibold">{item.monthlyPayment.toFixed(2)} EUR</td>
                  <td className="p-3 text-right text-red-600">{item.totalInterest.toLocaleString()} EUR</td>
                  <td className="p-3 text-right">{item.apr.toFixed(2)}%</td>
                  <td className="p-3 text-right font-bold">{item.totalCost.toLocaleString()} EUR</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <p className="text-sm font-semibold text-green-900">
            ✓ Най-изгодна оферта: {comparisons[0]?.bank}
          </p>
          <p className="text-xs text-green-800 mt-1">
            Спестявате {(comparisons[1]?.totalCost - comparisons[0]?.totalCost).toFixed(2)} EUR спрямо другата оферта
          </p>
        </div>
      </CardContent>
    </Card>
  );
}