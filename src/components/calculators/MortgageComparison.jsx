import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TrendingDown, Award } from 'lucide-react';

export default function MortgageComparison() {
  const EUR_BGN_RATE = 1.95583;
  
  const [inputs, setInputs] = useState({
    propertyValue: 100000,
    downPayment: 20,
    loanTerm: 20
  });

  const comparisons = useMemo(() => {
    const loanAmount = inputs.propertyValue * (1 - inputs.downPayment / 100);
    const results = [];
    
    // UniCredit
    const ucRate = 2.89;
    const ucMonthlyRate = ucRate / 100 / 12;
    const ucNumPayments = inputs.loanTerm * 12;
    const ucMonthlyPayment = loanAmount * (ucMonthlyRate * Math.pow(1 + ucMonthlyRate, ucNumPayments)) / 
                             (Math.pow(1 + ucMonthlyRate, ucNumPayments) - 1);
    const ucTotalInterest = (ucMonthlyPayment * ucNumPayments) - loanAmount;
    const ucFees = (loanAmount * EUR_BGN_RATE * 0.0095 / EUR_BGN_RATE) + 150/EUR_BGN_RATE + (2.27 * ucNumPayments);
    const ucAPR = ((loanAmount + ucTotalInterest + ucFees) / loanAmount - 1) / inputs.loanTerm * 100;
    
    results.push({
      bank: 'UniCredit Булбанк',
      rate: ucRate,
      monthlyPayment: ucMonthlyPayment,
      totalInterest: ucTotalInterest,
      apr: ucAPR,
      totalCost: loanAmount + ucTotalInterest + ucFees,
      color: 'red'
    });
    
    // ДСК
    const dskRate = 2.89;
    const dskMonthlyRate = dskRate / 100 / 12;
    const dskMonthlyPayment = loanAmount * (dskMonthlyRate * Math.pow(1 + dskMonthlyRate, ucNumPayments)) / 
                              (Math.pow(1 + dskMonthlyRate, ucNumPayments) - 1);
    const dskTotalInterest = (dskMonthlyPayment * ucNumPayments) - loanAmount;
    const dskFees = 300/EUR_BGN_RATE + 195/EUR_BGN_RATE + (2.25 * ucNumPayments);
    const dskAPR = ((loanAmount + dskTotalInterest + dskFees) / loanAmount - 1) / inputs.loanTerm * 100;
    
    results.push({
      bank: 'ДСК Банк',
      rate: dskRate,
      monthlyPayment: dskMonthlyPayment,
      totalInterest: dskTotalInterest,
      apr: dskAPR,
      totalCost: loanAmount + dskTotalInterest + dskFees,
      color: 'green'
    });
    
    // PostBank
    const pbRate = 2.70;
    const pbMonthlyRate = pbRate / 100 / 12;
    const pbMonthlyPayment = loanAmount * (pbMonthlyRate * Math.pow(1 + pbMonthlyRate, ucNumPayments)) / 
                             (Math.pow(1 + pbMonthlyRate, ucNumPayments) - 1);
    const pbTotalInterest = (pbMonthlyPayment * ucNumPayments) - loanAmount;
    const pbFees = 230 + 123 + (1.53 * ucNumPayments);
    const pbAPR = ((loanAmount + pbTotalInterest + pbFees) / loanAmount - 1) / inputs.loanTerm * 100;
    
    results.push({
      bank: 'PostBank',
      rate: pbRate,
      monthlyPayment: pbMonthlyPayment,
      totalInterest: pbTotalInterest,
      apr: pbAPR,
      totalCost: loanAmount + pbTotalInterest + pbFees,
      color: 'purple'
    });
    
    // ОББ
    const ubbRate = loanAmount > 100000 ? 2.28 : 2.80;
    const ubbMonthlyRate = ubbRate / 100 / 12;
    const ubbMonthlyPayment = loanAmount * (ubbMonthlyRate * Math.pow(1 + ubbMonthlyRate, ucNumPayments)) / 
                              (Math.pow(1 + ubbMonthlyRate, ucNumPayments) - 1);
    const ubbTotalInterest = (ubbMonthlyPayment * ucNumPayments) - loanAmount;
    const ubbFees = 127.82 + 200 + (1.28 * ucNumPayments) + 30.68;
    const ubbAPR = ((loanAmount + ubbTotalInterest + ubbFees) / loanAmount - 1) / inputs.loanTerm * 100;
    
    results.push({
      bank: 'ОББ',
      rate: ubbRate,
      monthlyPayment: ubbMonthlyPayment,
      totalInterest: ubbTotalInterest,
      apr: ubbAPR,
      totalCost: loanAmount + ubbTotalInterest + ubbFees,
      color: 'orange'
    });
    
    return results.sort((a, b) => a.totalCost - b.totalCost);
  }, [inputs]);

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-100">
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-blue-600" />
          Сравнение на ипотечни кредити
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
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
            Спестявате {(comparisons[comparisons.length - 1]?.totalCost - comparisons[0]?.totalCost).toLocaleString()} EUR спрямо най-скъпата оферта
          </p>
        </div>
      </CardContent>
    </Card>
  );
}