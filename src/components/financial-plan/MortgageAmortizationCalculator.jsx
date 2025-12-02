import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Calculator, FileText, Printer, Download } from 'lucide-react';

// ОББ Ипотечен кредит константи
const OBB_MORTGAGE_PARAMS = {
  interestRate: 0.0228,           // 2.28% годишна лихва
  aprWithInsurance: 0.0245,       // 2.45% ГПР с имуществена застраховка
  apr: 0.0231,                    // 2.31% ГПР без застраховки
  aprWithMonthlyFee: 0.0232,      // 2.32% ГПР с месечна такса
  
  // Такси
  applicationFee: 0,              // Такса за кандидатстване
  appraisalFee: 300,              // Такса за оценка
  creditAssessmentFee: 250,       // Такса за кредитна оценка
  accountOpeningFee: 0,           // Такса за откриване на сметка
  monthlyFee: 5.87,               // Месечна такса
  mortgageCancellationFee: 60,    // Такса за заличаване на ипотека
  
  // Застраховка имущество - коефициент спрямо остатъка (годишно / 12)
  // Базиран на PDF: ~89.91 BGN при 860000 остатък = 0.001254 годишно / 12
  propertyInsuranceRate: 0.001254 / 12,
  
  // Застраховка Живот - коефициенти по години (намалява с времето)
  // Изчислени от PDF данните - rate per 1000 BGN остатък, годишно
  lifeInsuranceRates: {
    1: 0.0043,    // Години 1-12: ~308 при 860000 = 0.00358 * 12 месеца корекция
    2: 0.0042,    // Години 13-24
    3: 0.0041,    // Години 25-36
    4: 0.0040,    // и т.н. намалява
    5: 0.0039,
    6: 0.0038,
    7: 0.0037,
    8: 0.0036,
    9: 0.0035,
    10: 0.0034,
    11: 0.0033,
    12: 0.0032,
    13: 0.0031,
    14: 0.0030,
    15: 0.0029,
    16: 0.0028,
    17: 0.0027,
    18: 0.0026,
    19: 0.0025,
    20: 0.0024,
    21: 0.0023,
    22: 0.0022,
    23: 0.0021,
    24: 0.0020,
    25: 0.0019,
    26: 0.0018,
    27: 0.0017,
    28: 0.0016,
    29: 0.0015,
    30: 0.0014
  }
};

// Изчисляване на месечна вноска (анюитетна формула)
const calculateMonthlyPayment = (principal, annualRate, months) => {
  const monthlyRate = annualRate / 12;
  if (monthlyRate === 0) return principal / months;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
         (Math.pow(1 + monthlyRate, months) - 1);
};

// Генериране на пълен погасителен план
const generateAmortizationSchedule = (loanAmount, termMonths, propertyValue) => {
  const monthlyRate = OBB_MORTGAGE_PARAMS.interestRate / 12;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, OBB_MORTGAGE_PARAMS.interestRate, termMonths);
  
  const schedule = [];
  let balance = loanAmount;
  let totalInterest = 0;
  let totalPrincipal = 0;
  let totalPropertyInsurance = 0;
  let totalLifeInsurance = 0;
  let totalMonthlyFees = 0;
  
  for (let month = 1; month <= termMonths; month++) {
    const year = Math.ceil(month / 12);
    
    // Лихва за месеца
    const interest = balance * monthlyRate;
    
    // Главница за месеца
    const principal = monthlyPayment - interest;
    
    // Нов остатък
    const newBalance = Math.max(0, balance - principal);
    
    // Застраховка имущество (месечна, базирана на стойност на имота)
    const propertyInsurance = propertyValue * OBB_MORTGAGE_PARAMS.propertyInsuranceRate;
    
    // Застраховка Живот (месечна, базирана на остатъка, намалява по години)
    const lifeInsuranceRate = OBB_MORTGAGE_PARAMS.lifeInsuranceRates[year] || 0.0014;
    const lifeInsurance = balance * lifeInsuranceRate / 12;
    
    // Месечна такса
    const monthlyFee = OBB_MORTGAGE_PARAMS.monthlyFee;
    
    // Обща вноска с всички застраховки и такси
    const totalMonthlyPayment = monthlyPayment + propertyInsurance + lifeInsurance + monthlyFee;
    
    totalInterest += interest;
    totalPrincipal += principal;
    totalPropertyInsurance += propertyInsurance;
    totalLifeInsurance += lifeInsurance;
    totalMonthlyFees += monthlyFee;
    
    schedule.push({
      month,
      year,
      balance: newBalance,
      interest: Math.round(interest * 100) / 100,
      principal: Math.round(principal * 100) / 100,
      payment: Math.round(monthlyPayment * 100) / 100,
      propertyInsurance: Math.round(propertyInsurance * 100) / 100,
      lifeInsurance: Math.round(lifeInsurance * 100) / 100,
      monthlyFee,
      totalPayment: Math.round(totalMonthlyPayment * 100) / 100
    });
    
    balance = newBalance;
  }
  
  // Първоначални разходи
  const initialCosts = OBB_MORTGAGE_PARAMS.applicationFee + 
                       OBB_MORTGAGE_PARAMS.appraisalFee + 
                       OBB_MORTGAGE_PARAMS.creditAssessmentFee +
                       OBB_MORTGAGE_PARAMS.accountOpeningFee;
  
  return {
    schedule,
    summary: {
      loanAmount,
      propertyValue,
      termMonths,
      termYears: termMonths / 12,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalPrincipal: Math.round(totalPrincipal * 100) / 100,
      totalPaid: Math.round((totalPrincipal + totalInterest) * 100) / 100,
      totalWithFees: Math.round((totalPrincipal + totalInterest + totalMonthlyFees) * 100) / 100,
      totalWithInsurance: Math.round((totalPrincipal + totalInterest + totalMonthlyFees + totalPropertyInsurance + totalLifeInsurance) * 100) / 100,
      totalPropertyInsurance: Math.round(totalPropertyInsurance * 100) / 100,
      totalLifeInsurance: Math.round(totalLifeInsurance * 100) / 100,
      totalMonthlyFees: Math.round(totalMonthlyFees * 100) / 100,
      initialCosts,
      interestRate: OBB_MORTGAGE_PARAMS.interestRate * 100,
      apr: OBB_MORTGAGE_PARAMS.apr * 100,
      aprWithFees: OBB_MORTGAGE_PARAMS.aprWithMonthlyFee * 100,
      aprWithInsurance: OBB_MORTGAGE_PARAMS.aprWithInsurance * 100
    }
  };
};

export default function MortgageAmortizationCalculator({ initialData = {}, onSave }) {
  const [formData, setFormData] = useState({
    loanAmount: initialData.loanAmount || 200000,
    propertyValue: initialData.propertyValue || 250000,
    termYears: initialData.termYears || 25,
    loanPurpose: initialData.loanPurpose || 'purchase'
  });

  const [activeTab, setActiveTab] = useState('calculator');

  const amortization = useMemo(() => {
    return generateAmortizationSchedule(
      formData.loanAmount,
      formData.termYears * 12,
      formData.propertyValue
    );
  }, [formData.loanAmount, formData.termYears, formData.propertyValue]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value) => {
    return value.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handlePrint = () => window.print();

  const loanPurposes = [
    { value: 'purchase', label: 'ИК за покупка на собствено жилище' },
    { value: 'investment', label: 'Инвестиционен ИК' },
    { value: 'refinance_purchase', label: 'Рефинансиране на ИК (покупка на имот)' },
    { value: 'refinance_investment', label: 'Рефинансиране на ИК (инвестиционна цел)' },
    { value: 'refinance_needs', label: 'Рефинансиране на ИК (текущи нужди/ремонт)' },
    { value: 'multipurpose', label: 'ИК за текущи нужди (многоцелеви)' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <span className="text-orange-600 font-bold text-lg">ОББ</span>
              </div>
              <div>
                <CardTitle className="text-white">Калкулатор за ипотечен кредит</CardTitle>
                <p className="text-orange-100 text-sm">ОББ - Погасителен план с лихва 2,28% и ГПР 2,45%</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handlePrint} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <Printer className="w-4 h-4 mr-2" />
              Принтирай
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Калкулатор
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Погасителен план
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Обобщение
          </TabsTrigger>
        </TabsList>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input */}
            <Card>
              <CardHeader className="bg-orange-50 py-3">
                <CardTitle className="text-base text-orange-800">Параметри на кредита</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <Label>Цел на кредита</Label>
                  <Select value={formData.loanPurpose} onValueChange={(v) => handleInputChange('loanPurpose', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {loanPurposes.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Стойност на имота (BGN)</Label>
                  <Input
                    type="number"
                    value={formData.propertyValue}
                    onChange={(e) => handleInputChange('propertyValue', parseFloat(e.target.value) || 0)}
                    min={50000}
                    step={10000}
                  />
                </div>

                <div>
                  <Label>Размер на кредита (BGN)</Label>
                  <Input
                    type="number"
                    value={formData.loanAmount}
                    onChange={(e) => handleInputChange('loanAmount', parseFloat(e.target.value) || 0)}
                    min={10000}
                    step={10000}
                  />
                </div>

                <div>
                  <Label>Срок (години)</Label>
                  <Select value={formData.termYears.toString()} onValueChange={(v) => handleInputChange('termYears', parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 15, 20, 25, 30].map(y => (
                        <SelectItem key={y} value={y.toString()}>{y} години ({y * 12} месеца)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Осреднена лихва:</span>
                    <span className="font-semibold">{(OBB_MORTGAGE_PARAMS.interestRate * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">ГПР:</span>
                    <span className="font-semibold">{(OBB_MORTGAGE_PARAMS.apr * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">ГПР вкл. месечна такса:</span>
                    <span className="font-semibold">{(OBB_MORTGAGE_PARAMS.aprWithMonthlyFee * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">ГПР вкл. застраховка имущество:</span>
                    <span className="font-semibold text-orange-600">{(OBB_MORTGAGE_PARAMS.aprWithInsurance * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Output */}
            <Card>
              <CardHeader className="bg-green-50 py-3">
                <CardTitle className="text-base text-green-800">Резултати</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-orange-600 mb-1">Месечна вноска (главница + лихва)</p>
                  <p className="text-3xl font-bold text-orange-700">{formatCurrency(amortization.summary.monthlyPayment)} BGN</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-slate-600">Първоначални разходи:</span>
                    <span className="font-semibold">{formatCurrency(amortization.summary.initialCosts)} BGN</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-slate-600">Такса за оценка:</span>
                    <span>{formatCurrency(OBB_MORTGAGE_PARAMS.appraisalFee)} BGN</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-slate-600">Такса за кредитна оценка:</span>
                    <span>{formatCurrency(OBB_MORTGAGE_PARAMS.creditAssessmentFee)} BGN</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-slate-600">Месечна такса обслужване:</span>
                    <span>{formatCurrency(OBB_MORTGAGE_PARAMS.monthlyFee)} BGN</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-slate-600">Такса заличаване ипотека:</span>
                    <span>{formatCurrency(OBB_MORTGAGE_PARAMS.mortgageCancellationFee)} BGN</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Общо изплатени (вкл. месечна такса):</span>
                    <span className="font-semibold">{formatCurrency(amortization.summary.totalWithFees)} BGN</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Общо застраховка имущество:</span>
                    <span className="font-semibold">{formatCurrency(amortization.summary.totalPropertyInsurance)} BGN</span>
                  </div>
                  <div className="flex justify-between font-bold text-orange-700">
                    <span>Общо изплатени (вкл. застраховки):</span>
                    <span>{formatCurrency(amortization.summary.totalWithInsurance)} BGN</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="mt-6">
          <Card>
            <CardHeader className="bg-slate-50 py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Погасителен план - {amortization.summary.termMonths} месеца</CardTitle>
              <span className="text-sm text-slate-500">Показани първите 60 и последните 12 месеца</span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 sticky top-0">
                    <tr>
                      <th className="py-2 px-2 text-center font-semibold">№</th>
                      <th className="py-2 px-2 text-right font-semibold">Остатък</th>
                      <th className="py-2 px-2 text-right font-semibold">Лихва</th>
                      <th className="py-2 px-2 text-right font-semibold">Главница</th>
                      <th className="py-2 px-2 text-right font-semibold">Вноска</th>
                      <th className="py-2 px-2 text-right font-semibold">Застр. Имущество</th>
                      <th className="py-2 px-2 text-right font-semibold">Застр. Живот</th>
                      <th className="py-2 px-2 text-right font-semibold">Такса</th>
                      <th className="py-2 px-2 text-right font-semibold text-orange-700">Общо</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Първите 60 месеца */}
                    {amortization.schedule.slice(0, 60).map((row, idx) => (
                      <tr key={row.month} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="py-1 px-2 text-center">{row.month}</td>
                        <td className="py-1 px-2 text-right">{formatCurrency(row.balance)}</td>
                        <td className="py-1 px-2 text-right">{formatCurrency(row.interest)}</td>
                        <td className="py-1 px-2 text-right">{formatCurrency(row.principal)}</td>
                        <td className="py-1 px-2 text-right font-medium">{formatCurrency(row.payment)}</td>
                        <td className="py-1 px-2 text-right">{formatCurrency(row.propertyInsurance)}</td>
                        <td className="py-1 px-2 text-right">{formatCurrency(row.lifeInsurance)}</td>
                        <td className="py-1 px-2 text-right">{formatCurrency(row.monthlyFee)}</td>
                        <td className="py-1 px-2 text-right font-semibold text-orange-700">{formatCurrency(row.totalPayment)}</td>
                      </tr>
                    ))}
                    
                    {/* Разделител ако има повече от 72 месеца */}
                    {amortization.schedule.length > 72 && (
                      <tr className="bg-orange-100">
                        <td colSpan={9} className="py-2 px-4 text-center text-orange-700 font-medium">
                          ... още {amortization.schedule.length - 72} месеца ...
                        </td>
                      </tr>
                    )}
                    
                    {/* Последните 12 месеца */}
                    {amortization.schedule.length > 60 && amortization.schedule.slice(-12).map((row, idx) => (
                      <tr key={row.month} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="py-1 px-2 text-center">{row.month}</td>
                        <td className="py-1 px-2 text-right">{formatCurrency(row.balance)}</td>
                        <td className="py-1 px-2 text-right">{formatCurrency(row.interest)}</td>
                        <td className="py-1 px-2 text-right">{formatCurrency(row.principal)}</td>
                        <td className="py-1 px-2 text-right font-medium">{formatCurrency(row.payment)}</td>
                        <td className="py-1 px-2 text-right">{formatCurrency(row.propertyInsurance)}</td>
                        <td className="py-1 px-2 text-right">{formatCurrency(row.lifeInsurance)}</td>
                        <td className="py-1 px-2 text-right">{formatCurrency(row.monthlyFee)}</td>
                        <td className="py-1 px-2 text-right font-semibold text-orange-700">{formatCurrency(row.totalPayment)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-orange-50 py-3">
                <CardTitle className="text-base text-orange-800">Параметри на кредита</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-slate-600">Стойност на имота:</span>
                  <span className="font-semibold">{formatCurrency(formData.propertyValue)} BGN</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-slate-600">Размер на кредита:</span>
                  <span className="font-semibold">{formatCurrency(formData.loanAmount)} BGN</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-slate-600">LTV (Loan-to-Value):</span>
                  <span className="font-semibold">{((formData.loanAmount / formData.propertyValue) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-slate-600">Срок:</span>
                  <span className="font-semibold">{formData.termYears} години ({formData.termYears * 12} месеца)</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-slate-600">Осреднена лихва:</span>
                  <span className="font-semibold">{(OBB_MORTGAGE_PARAMS.interestRate * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">ГПР (вкл. застраховка имущество):</span>
                  <span className="font-semibold text-orange-600">{(OBB_MORTGAGE_PARAMS.aprWithInsurance * 100).toFixed(2)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-green-50 py-3">
                <CardTitle className="text-base text-green-800">Финансово обобщение</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-slate-600">Месечна вноска:</span>
                  <span className="font-semibold">{formatCurrency(amortization.summary.monthlyPayment)} BGN</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-slate-600">Първоначални разходи:</span>
                  <span className="font-semibold">{formatCurrency(amortization.summary.initialCosts)} BGN</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-slate-600">Общо платена лихва:</span>
                  <span className="font-semibold">{formatCurrency(amortization.summary.totalInterest)} BGN</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-slate-600">Общо изплатени (вкл. такси):</span>
                  <span className="font-semibold">{formatCurrency(amortization.summary.totalWithFees)} BGN</span>
                </div>
                <div className="flex justify-between py-1 border-b bg-orange-50 -mx-4 px-4">
                  <span className="text-orange-700 font-medium">Общо изплатени (вкл. застраховки):</span>
                  <span className="font-bold text-orange-700">{formatCurrency(amortization.summary.totalWithInsurance)} BGN</span>
                </div>
              </CardContent>
            </Card>

            {/* Забележка */}
            <Card className="md:col-span-2">
              <CardContent className="p-4 bg-slate-50 text-xs text-slate-600">
                <p className="font-semibold mb-2">Забележка:</p>
                <p>В ГПР не са включени разходите за застраховка „Живот", ако Кредитополучателят е избрал възможността да сключи и поддържа за своя сметка застраховка "Живот".</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {onSave && (
        <Button 
          onClick={() => onSave(formData, amortization)} 
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Запази погасителния план
        </Button>
      )}
    </div>
  );
}

// Export helper for use in financial plan
export { generateAmortizationSchedule, OBB_MORTGAGE_PARAMS };