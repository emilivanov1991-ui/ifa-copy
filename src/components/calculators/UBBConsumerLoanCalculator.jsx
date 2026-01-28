import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Save, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import AmortizationExport from './AmortizationExport';

export default function UBBConsumerLoanCalculator({ analysisId, clientId }) {
  const EUR_BGN_RATE = 1.95583;
  const [isSaving, setIsSaving] = useState(false);
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  
  const [inputs, setInputs] = useState({
    loanAmount: 10000,
    loanTerm: 48,
    salaryPackage: false
  });
  
  const validation = useMemo(() => {
    const errors = [];
    const amountBGN = inputs.loanAmount * EUR_BGN_RATE;
    
    if (amountBGN < 1000) errors.push('Минимална сума: 1,000 BGN (511 EUR)');
    if (amountBGN > 300000) errors.push('Максимална сума: 300,000 BGN (153,391 EUR)');
    if (inputs.loanTerm < 12) errors.push('Минимален срок: 12 месеца');
    if (inputs.loanTerm > 84 && amountBGN <= 75000) errors.push('Максимален срок: 84 месеца (120 за >75K BGN)');
    if (inputs.loanTerm > 120) errors.push('Максимален срок: 120 месеца');
    
    return { isValid: errors.length === 0, errors };
  }, [inputs]);

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
      schedulePreview: schedule.slice(0, 12),
      scheduleFull: schedule
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
        provider: 'ОББ',
        product_name: 'Потребителски кредит',
        product_type: 'consumer_loan',
        monthly_premium: calculations.totalMonthlyPayment,
        annual_premium: calculations.totalMonthlyPayment * 12,
        coverage_amount: inputs.loanAmount,
        term_years: inputs.loanTerm / 12,
        offer_status: 'generated',
        ai_recommendation_reason: `Лихва ${calculations.interestRate.toFixed(2)}%, ГПР ${calculations.apr.toFixed(2)}%`,
        notes: JSON.stringify({ inputs, calculations, schedule: calculations.scheduleFull })
      });
      toast.success('✓ Офертата е запазена');
    } catch (error) {
      toast.error('Грешка: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-orange-600" />
          ОББ - Потребителски кредит
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {!validation.isValid && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 text-sm">Грешки:</p>
                <ul className="text-xs text-red-800 mt-1 space-y-1">
                  {validation.errors.map((err, idx) => <li key={idx}>• {err}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}
        
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
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">
              Амортизационна таблица {showFullSchedule ? `(всички ${calculations.scheduleFull.length} месеца)` : '(първи 12 месеца)'}
            </h4>
            <div className="flex items-center gap-2">
              <AmortizationExport 
                schedule={calculations.scheduleFull}
                loanDetails={{
                  amount: inputs.loanAmount,
                  interestRate: calculations.interestRate,
                  term: inputs.loanTerm,
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
        
        <Button 
          onClick={handleSaveOffer}
          disabled={isSaving || !validation.isValid}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Запазва се...' : 'Запази оферта'}
        </Button>

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