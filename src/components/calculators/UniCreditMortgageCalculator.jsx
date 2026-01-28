import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calculator, Home, TrendingDown, Save, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import AmortizationExport from './AmortizationExport';

export default function UniCreditMortgageCalculator({ analysisId, clientId }) {
  const EUR_BGN_RATE = 1.95583;
  const [isSaving, setIsSaving] = useState(false);
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  
  const [inputs, setInputs] = useState({
    propertyValue: 100000,
    downPayment: 20,
    loanTerm: 20,
    propertyType: 'apartment',
    ownContribution: 20,
    salaryTransfer: false,
    youngFamily: false
  });
  
  // Валидации
  const validation = useMemo(() => {
    const errors = [];
    const loanAmountEUR = inputs.propertyValue * (1 - inputs.downPayment / 100);
    const loanAmountBGN = loanAmountEUR * EUR_BGN_RATE;
    
    if (loanAmountBGN < 10000) errors.push('Минимална сума: 10,000 BGN');
    if (loanAmountBGN > 1000000) errors.push('Максимална сума: 1,000,000 BGN');
    if (inputs.loanTerm < 5) errors.push('Минимален срок: 5 години');
    if (inputs.loanTerm > 30) errors.push('Максимален срок: 30 години');
    if (inputs.downPayment < 15) errors.push('Минимален собствен принос: 15%');
    
    return { isValid: errors.length === 0, errors };
  }, [inputs]);

  const calculations = useMemo(() => {
    const propertyValueBGN = inputs.propertyValue * EUR_BGN_RATE;
    const loanAmount = propertyValueBGN * (1 - inputs.downPayment / 100);
    
    // Лихва според условия
    let interestRate = 2.89; // Базова фиксирана за 5 години
    
    // Корекции по собствен принос
    if (inputs.ownContribution > 20) {
      interestRate -= 0.3;
    }
    
    // Промоционални отстъпки
    if (inputs.salaryTransfer) interestRate -= 0.5;
    if (inputs.youngFamily) interestRate -= 1.0;
    
    // Тип имот
    if (inputs.propertyType === 'house') interestRate += 0.3;
    
    interestRate = Math.max(interestRate, 2.5); // Минимум
    
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = inputs.loanTerm * 12;
    
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    // Такси
    const processingFee = Math.min(Math.max(loanAmount * 0.0095, 100), 2000);
    const propertyAppraisal = inputs.propertyType === 'apartment' ? 150 : 225;
    const monthlyManagementFee = 2.27;
    const notarialFee = loanAmount * 0.003;
    
    // Застраховки
    const propertyInsuranceAnnual = loanAmount * 0.0055;
    const lifeInsuranceMonthly = 31.50;
    
    const totalMonthlyPayment = monthlyPayment + monthlyManagementFee + lifeInsuranceMonthly + (propertyInsuranceAnnual / 12);
    
    // Амортизационна таблица - ПЪЛНА
    let balance = loanAmount;
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
    const totalPaid = loanAmount + totalInterest;
    
    // ГПР (приблизителен)
    const totalCost = totalPaid + processingFee + propertyAppraisal + notarialFee + 
                      (monthlyManagementFee * numPayments) + 
                      (lifeInsuranceMonthly * numPayments) + 
                      (propertyInsuranceAnnual * inputs.loanTerm);
    const apr = ((totalCost / loanAmount - 1) / inputs.loanTerm) * 100;
    
    return {
      loanAmount: loanAmount / EUR_BGN_RATE,
      loanAmountBGN: loanAmount,
      monthlyPayment: monthlyPayment / EUR_BGN_RATE,
      totalMonthlyPayment: totalMonthlyPayment / EUR_BGN_RATE,
      interestRate,
      totalInterest: totalInterest / EUR_BGN_RATE,
      totalPaid: totalPaid / EUR_BGN_RATE,
      apr,
      fees: {
        processing: processingFee / EUR_BGN_RATE,
        appraisal: propertyAppraisal / EUR_BGN_RATE,
        monthlyManagement: monthlyManagementFee,
        notarial: notarialFee / EUR_BGN_RATE
      },
      insurance: {
        propertyAnnual: propertyInsuranceAnnual / EUR_BGN_RATE,
        lifeMonthly: lifeInsuranceMonthly
      },
      schedulePreview: schedule.slice(0, 12).map(s => ({
        ...s,
        payment: s.payment / EUR_BGN_RATE,
        principal: s.principal / EUR_BGN_RATE,
        interest: s.interest / EUR_BGN_RATE,
        balance: s.balance / EUR_BGN_RATE
      })),
      scheduleFull: schedule.map(s => ({
        ...s,
        payment: s.payment / EUR_BGN_RATE,
        principal: s.principal / EUR_BGN_RATE,
        interest: s.interest / EUR_BGN_RATE,
        balance: s.balance / EUR_BGN_RATE
      }))
    };
  }, [inputs]);
  
  const handleSaveOffer = async () => {
    if (!analysisId) {
      toast.error('Моля въведете Analysis ID');
      return;
    }
    
    setIsSaving(true);
    try {
      await base44.entities.ProductOffer.create({
        analysis_id: analysisId,
        client_id: clientId,
        provider: 'UniCredit Булбанк',
        product_name: 'Ипотечен кредит "Моят нов дом"',
        product_type: 'mortgage',
        monthly_premium: calculations.totalMonthlyPayment,
        annual_premium: calculations.totalMonthlyPayment * 12,
        coverage_amount: calculations.loanAmount,
        term_years: inputs.loanTerm,
        offer_status: 'generated',
        ai_recommendation_reason: `Лихва ${calculations.interestRate.toFixed(2)}%, ГПР ${calculations.apr.toFixed(2)}%, обща цена ${(calculations.loanAmount + calculations.totalInterest).toLocaleString()} EUR`,
        notes: JSON.stringify({
          inputs,
          calculations,
          schedule: calculations.scheduleFull
        })
      });
      toast.success('✓ Офертата е запазена успешно');
    } catch (error) {
      toast.error('Грешка: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
        <CardTitle className="flex items-center gap-2">
          <Home className="w-5 h-5 text-red-600" />
          UniCredit Булбанк - Ипотечен кредит "Моят нов дом"
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Валидации */}
        {!validation.isValid && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 text-sm">Грешки във валидацията:</p>
                <ul className="text-xs text-red-800 mt-1 space-y-1">
                  {validation.errors.map((err, idx) => <li key={idx}>• {err}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Входни данни */}
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
              checked={inputs.youngFamily}
              onChange={(e) => setInputs({...inputs, youngFamily: e.target.checked})}
              className="w-4 h-4"
            />
            <Label>Младо семейство до 35г (-1.0%)</Label>
          </div>
        </div>

        <Separator />

        {/* Резултати */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-slate-600">Сума на кредита</p>
              <p className="text-2xl font-bold text-blue-700">{calculations.loanAmount.toLocaleString()} EUR</p>
              <p className="text-xs text-slate-500">{calculations.loanAmountBGN.toLocaleString()} BGN</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Месечна вноска</p>
              <p className="text-2xl font-bold text-green-700">{calculations.monthlyPayment.toFixed(2)} EUR</p>
              <p className="text-xs text-slate-500">Основна вноска</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Обща месечна вноска</p>
              <p className="text-2xl font-bold text-red-700">{calculations.totalMonthlyPayment.toFixed(2)} EUR</p>
              <p className="text-xs text-slate-500">С управление и застраховки</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-600">Лихвен процент</p>
              <p className="text-xl font-bold text-slate-900">{calculations.interestRate.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">ГПР (приблизителен)</p>
              <p className="text-xl font-bold text-slate-900">{calculations.apr.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Общо лихви</p>
              <p className="text-xl font-bold text-red-600">{calculations.totalInterest.toLocaleString()} EUR</p>
            </div>
          </div>
        </div>

        {/* Такси */}
        <div>
          <h4 className="font-semibold mb-2">Такси и разходи</h4>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span>Такса разглеждане (0.95%):</span>
              <span className="font-semibold">{calculations.fees.processing.toFixed(2)} EUR</span>
            </div>
            <div className="flex justify-between">
              <span>Оценка на имот:</span>
              <span className="font-semibold">{calculations.fees.appraisal.toFixed(2)} EUR</span>
            </div>
            <div className="flex justify-between">
              <span>Месечно управление:</span>
              <span className="font-semibold">{calculations.fees.monthlyManagement.toFixed(2)} EUR</span>
            </div>
            <div className="flex justify-between">
              <span>Нотариални разноски:</span>
              <span className="font-semibold">{calculations.fees.notarial.toFixed(2)} EUR</span>
            </div>
          </div>
        </div>

        {/* Застраховки */}
        <div>
          <h4 className="font-semibold mb-2">Задължителни застраховки</h4>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span>Застраховка имот (годишна):</span>
              <span className="font-semibold">{calculations.insurance.propertyAnnual.toFixed(2)} EUR</span>
            </div>
            <div className="flex justify-between">
              <span>Застраховка живот (месечна):</span>
              <span className="font-semibold">{calculations.insurance.lifeMonthly.toFixed(2)} EUR</span>
            </div>
          </div>
        </div>

        {/* Амортизационна таблица */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">
              Амортизационна таблица {showFullSchedule ? `(всички ${calculations.scheduleFull.length} месеца)` : '(първи 12 месеца)'}
            </h4>
            <div className="flex items-center gap-2">
              <AmortizationExport 
                schedule={calculations.scheduleFull}
                loanDetails={{
                  amount: calculations.loanAmount,
                  interestRate: calculations.interestRate,
                  term: inputs.loanTerm * 12,
                  monthlyPayment: calculations.monthlyPayment
                }}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFullSchedule(!showFullSchedule)}
                className="text-xs"
              >
                {showFullSchedule ? 'Скрий' : 'Покажи всички'}
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 sticky top-0">
                <tr>
                  <th className="p-2 text-left">Месец</th>
                  <th className="p-2 text-right">Вноска (EUR)</th>
                  <th className="p-2 text-right">Главница (EUR)</th>
                  <th className="p-2 text-right">Лихва (EUR)</th>
                  <th className="p-2 text-right">Остатък (EUR)</th>
                </tr>
              </thead>
              <tbody>
                {(showFullSchedule ? calculations.scheduleFull : calculations.schedulePreview).map((row) => (
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
        
        {/* Бутон за запазване */}
        <Button 
          onClick={handleSaveOffer}
          disabled={isSaving || !validation.isValid}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Запазва се...' : 'Запази оферта'}
        </Button>

        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded text-sm">
          <p className="font-semibold text-amber-900 mb-1">Важно:</p>
          <ul className="text-amber-800 space-y-1 text-xs">
            <li>• Фиксирана лихва 2.89% за първи 5 години, след което преминава към плаваща</li>
            <li>• Максимален LTV: 85% за апартамент, 80% за къща</li>
            <li>• Такса предсрочно погасяване: 1% за първи 12 месеца, след това безплатно</li>
            <li>• Период за одобрение: 7-10 работни дни</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}