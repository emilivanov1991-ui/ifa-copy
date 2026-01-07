import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Save, TrendingDown, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// Универсален ипотечен калкулатор
export default function MortgageCalculator({ 
  provider, 
  logoUrl,
  minAmount,
  maxAmount,
  minTerm,
  maxTerm,
  interestRates, // { min, max, description }
  fees, // { processing, appraisal, management, earlyRepayment }
  insurance, // { property, life }
  analysisId,
  clientId
}) {
  const [inputs, setInputs] = useState({
    amount: 100000, // EUR
    term: 20, // години
    interestRate: interestRates.min,
    ownContribution: 20, // %
    includeInsurance: true
  });

  const calculateMonthlyPayment = (principal, annualRate, months) => {
    const monthlyRate = annualRate / 12 / 100;
    if (monthlyRate === 0) return principal / months;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
           (Math.pow(1 + monthlyRate, months) - 1);
  };

  const result = useMemo(() => {
    const loanAmount = inputs.amount;
    const months = inputs.term * 12;
    const monthlyPayment = calculateMonthlyPayment(loanAmount, inputs.interestRate, months);
    
    // Амортизационен график
    let balance = loanAmount;
    const schedule = [];
    let totalInterest = 0;
    
    for (let month = 1; month <= months; month++) {
      const interestPayment = balance * (inputs.interestRate / 12 / 100);
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      totalInterest += interestPayment;
      
      // Запазваме само първи 12 месеца и последни 12 месеца за показване
      if (month <= 12 || month > months - 12) {
        schedule.push({
          month,
          payment: monthlyPayment,
          principal: principalPayment,
          interest: interestPayment,
          balance: Math.max(0, balance)
        });
      } else if (month === 13) {
        schedule.push({ separator: true, months: months - 24 });
      }
    }
    
    // Такси
    const processingFee = loanAmount * (fees.processing / 100);
    const appraisalFee = fees.appraisal;
    const monthlyManagementFee = fees.management / 12;
    
    // Застраховки
    const monthlyInsurance = inputs.includeInsurance ? 
      (loanAmount * insurance.property / 100 / 12) + (loanAmount * insurance.life / 100 / 12) : 0;
    
    const totalMonthlyPayment = monthlyPayment + monthlyManagementFee + monthlyInsurance;
    const totalCost = (totalMonthlyPayment * months) + processingFee + appraisalFee;
    
    return {
      monthlyPayment: monthlyPayment.toFixed(2),
      totalMonthlyPayment: totalMonthlyPayment.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      totalCost: totalCost.toFixed(2),
      processingFee: processingFee.toFixed(2),
      appraisalFee: appraisalFee.toFixed(2),
      monthlyManagementFee: monthlyManagementFee.toFixed(2),
      monthlyInsurance: monthlyInsurance.toFixed(2),
      schedule
    };
  }, [inputs, fees, insurance]);

  const handleSaveOffer = async () => {
    if (!analysisId) {
      toast.error('Моля въведете Analysis ID');
      return;
    }

    const offerData = {
      analysis_id: analysisId,
      client_id: clientId || null,
      provider: provider,
      product_name: 'Ипотечен кредит',
      product_type: 'mortgage_loan',
      beneficiary: 'client',
      beneficiary_name: 'Кредитополучател',
      monthly_premium: parseFloat(result.totalMonthlyPayment),
      annual_premium: parseFloat(result.totalMonthlyPayment) * 12,
      coverage_amount: inputs.amount,
      offer_status: 'generated',
      ai_recommendation_reason: `Ипотечен кредит ${provider}: ${inputs.amount.toLocaleString()} EUR за ${inputs.term} години при лихва ${inputs.interestRate}%. Месечна вноска: ${result.totalMonthlyPayment} EUR.`
    };

    try {
      await base44.entities.ProductOffer.create(offerData);
      toast.success('✓ Офертата е запазена успешно');
    } catch (error) {
      toast.error('Грешка при запазване: ' + error.message);
    }
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center gap-3">
          {logoUrl && <img src={logoUrl} alt={provider} className="h-10 bg-white p-1 rounded" />}
          <div>
            <CardTitle className="text-xl">{provider} - Ипотечен кредит</CardTitle>
            <p className="text-xs text-blue-100 mt-1">Калкулатор с амортизационен график</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label>Сума на кредита (EUR)</Label>
            <Input
              type="number"
              value={inputs.amount}
              onChange={(e) => setInputs({...inputs, amount: parseInt(e.target.value) || 0})}
              min={minAmount}
              max={maxAmount}
              step="1000"
            />
            <p className="text-xs text-slate-500 mt-1">{minAmount.toLocaleString()} - {maxAmount.toLocaleString()} EUR</p>
          </div>

          <div>
            <Label>Срок (години)</Label>
            <Input
              type="number"
              value={inputs.term}
              onChange={(e) => setInputs({...inputs, term: parseInt(e.target.value) || 0})}
              min={minTerm}
              max={maxTerm}
            />
            <p className="text-xs text-slate-500 mt-1">{minTerm} - {maxTerm} години</p>
          </div>

          <div>
            <Label>Лихвен процент (%)</Label>
            <Input
              type="number"
              step="0.01"
              value={inputs.interestRate}
              onChange={(e) => setInputs({...inputs, interestRate: parseFloat(e.target.value) || 0})}
              min={interestRates.min}
              max={interestRates.max}
            />
            <p className="text-xs text-slate-500 mt-1">{interestRates.description}</p>
          </div>

          <div>
            <Label>Собствен принос (%)</Label>
            <Input
              type="number"
              value={inputs.ownContribution}
              onChange={(e) => setInputs({...inputs, ownContribution: parseInt(e.target.value) || 0})}
              min="15"
              max="50"
            />
            <p className="text-xs text-slate-500 mt-1">Минимум 15%</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={inputs.includeInsurance}
            onChange={(e) => setInputs({...inputs, includeInsurance: e.target.checked})}
            id="insurance"
            className="w-4 h-4"
          />
          <label htmlFor="insurance" className="text-sm font-medium cursor-pointer">
            Включи задължителни застраховки (Имот + Живот)
          </label>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => {}} className="flex-1 bg-blue-600 hover:bg-blue-700">
            <Calculator className="w-4 h-4 mr-2" />
            Изчислено автоматично
          </Button>
          {analysisId && (
            <Button onClick={handleSaveOffer} variant="outline" className="border-violet-300 text-violet-700 hover:bg-violet-50">
              <Save className="w-4 h-4 mr-2" />
              Запази оферта
            </Button>
          )}
        </div>

        {result && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-slate-900">Месечни плащания</h4>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Главница + Лихва:</span>
                  <span className="font-semibold">{result.monthlyPayment} EUR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Такса управление:</span>
                  <span className="font-semibold">{result.monthlyManagementFee} EUR</span>
                </div>
                {inputs.includeInsurance && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Застраховки:</span>
                    <span className="font-semibold">{result.monthlyInsurance} EUR</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2 flex justify-between text-lg">
                  <span className="font-bold text-slate-900">Обща месечна вноска:</span>
                  <span className="font-bold text-blue-600">{result.totalMonthlyPayment} EUR</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-3">Обща стойност на кредита</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Обща сума на кредита:</span>
                  <span>{inputs.amount.toLocaleString()} EUR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Общи лихви:</span>
                  <span>{result.totalInterest} EUR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Такса разглеждане:</span>
                  <span>{result.processingFee} EUR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Оценка на имот:</span>
                  <span>{result.appraisalFee} EUR</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Обща стойност:</span>
                  <span className="text-blue-600">{result.totalCost} EUR</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-900">Амортизационен график</h4>
                <FileText className="w-4 h-4 text-slate-400" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-2 text-left">Месец</th>
                      <th className="p-2 text-right">Вноска</th>
                      <th className="p-2 text-right">Главница</th>
                      <th className="p-2 text-right">Лихва</th>
                      <th className="p-2 text-right">Остатък</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.map((row, idx) => (
                      row.separator ? (
                        <tr key={idx}>
                          <td colSpan="5" className="p-2 text-center text-slate-400">
                            ... {row.months} месеца ...
                          </td>
                        </tr>
                      ) : (
                        <tr key={idx} className="border-t">
                          <td className="p-2">{row.month}</td>
                          <td className="p-2 text-right">{row.payment.toFixed(2)}</td>
                          <td className="p-2 text-right text-green-600">{row.principal.toFixed(2)}</td>
                          <td className="p-2 text-right text-orange-600">{row.interest.toFixed(2)}</td>
                          <td className="p-2 text-right font-medium">{row.balance.toFixed(2)}</td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}