import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, Save, TrendingUp, PiggyBank } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// ОББ Трети стълб - ДДПО (Допълнително доброволно пенсионно осигуряване)
export default function OBBPillar3Calculator({ analysisId, clientId }) {
  const [inputs, setInputs] = useState({
    age: 35,
    retirementAge: 65,
    monthlyContribution: 100, // BGN
    monthlyGrossSalary: 2000, // BGN за данъчно облекчение
    fundType: 'universal', // universal / balanced / dynamic
    expectedReturn: 6.0, // % годишна доходност
    useTaxRelief: true // данъчно облекчение
  });

  const result = useMemo(() => {
    const yearsToRetirement = inputs.retirementAge - inputs.age;
    const monthlyContribution = inputs.monthlyContribution;
    
    // Данъчно облекчение (10% от БОД, максимум 60 лв/месец)
    let taxRelief = 0;
    if (inputs.useTaxRelief) {
      const maxDeductible = Math.min(inputs.monthlyGrossSalary * 0.10, 60);
      const deductibleAmount = Math.min(monthlyContribution, maxDeductible);
      taxRelief = deductibleAmount * 0.10; // 10% данък върху приспадната сума
    }
    
    // Такси за управление (годишни)
    const managementFee = inputs.fundType === 'universal' ? 1.5 : 
                          inputs.fundType === 'balanced' ? 1.8 : 2.0; // % от активи
    
    // Прогноза на натрупана сума с реинвестиране
    let balance = 0;
    const yearlyData = [];
    
    for (let year = 1; year <= yearsToRetirement; year++) {
      const annualContribution = monthlyContribution * 12;
      const annualTaxRelief = taxRelief * 12;
      balance += annualContribution;
      
      // Приход от инвестиции (след такси)
      const netReturn = inputs.expectedReturn - managementFee;
      const investmentGain = balance * (netReturn / 100);
      balance += investmentGain;
      
      if (year % 5 === 0 || year === 1 || year === yearsToRetirement) {
        yearlyData.push({
          year,
          age: inputs.age + year,
          totalContributions: annualContribution * year,
          totalTaxRelief: annualTaxRelief * year,
          balance: balance,
          investmentGain: balance - (annualContribution * year)
        });
      }
    }
    
    const totalContributions = monthlyContribution * 12 * yearsToRetirement;
    const totalTaxRelief = taxRelief * 12 * yearsToRetirement;
    const investmentGains = balance - totalContributions;
    
    // Месечна пенсия (ориентировъчна, при 20 години изплащане)
    const monthlyPension = balance / (20 * 12);
    
    return {
      monthlyContribution: monthlyContribution.toFixed(2),
      monthlyTaxRelief: taxRelief.toFixed(2),
      netMonthlyCost: (monthlyContribution - taxRelief).toFixed(2),
      annualContribution: (monthlyContribution * 12).toFixed(2),
      totalContributions: totalContributions.toFixed(2),
      totalTaxRelief: totalTaxRelief.toFixed(2),
      investmentGains: investmentGains.toFixed(2),
      finalBalance: balance.toFixed(2),
      monthlyPension: monthlyPension.toFixed(2),
      yearsToRetirement,
      yearlyData
    };
  }, [inputs]);

  const handleSaveOffer = async () => {
    if (!analysisId) {
      toast.error('Моля въведете Analysis ID');
      return;
    }

    const offerData = {
      analysis_id: analysisId,
      client_id: clientId || null,
      provider: 'ОББ Пенсионно осигуряване',
      product_name: 'Трети стълб - ДДПО',
      product_type: 'pension_plan',
      beneficiary: 'client',
      beneficiary_name: 'Осигурен',
      monthly_premium: parseFloat(result.monthlyContribution),
      annual_premium: parseFloat(result.annualContribution),
      coverage_amount: parseFloat(result.finalBalance),
      offer_status: 'generated',
      ai_recommendation_reason: `ОББ ДДПО (Трети стълб): Месечна вноска ${result.monthlyContribution} BGN (нетна цена ${result.netMonthlyCost} BGN след данъчно облекчение). Очаквана сума при пенсиониране: ${result.finalBalance} BGN. Прогнозна месечна пенсия: ${result.monthlyPension} BGN.`
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
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="flex items-center gap-3">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/838db6bfd_image.png" 
            alt="ОББ Пенсионно" 
            className="h-10 bg-white p-1 rounded"
          />
          <div>
            <CardTitle className="text-xl">ОББ - Трети стълб (ДДПО)</CardTitle>
            <p className="text-xs text-purple-100 mt-1">Допълнително доброволно пенсионно осигуряване</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-xs text-purple-800">
            <strong>Предимство:</strong> Третият стълб е доброволен и дава данъчно облекчение до 60 лв/месец. 
            Можете да избирате месечната вноска и да теглите средства при необходимост.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label>Възраст</Label>
            <Input
              type="number"
              value={inputs.age}
              onChange={(e) => setInputs({...inputs, age: parseInt(e.target.value) || 0})}
              min="18"
              max="70"
            />
          </div>

          <div>
            <Label>Пенсионна възраст</Label>
            <Input
              type="number"
              value={inputs.retirementAge}
              onChange={(e) => setInputs({...inputs, retirementAge: parseInt(e.target.value) || 0})}
              min="55"
              max="75"
            />
          </div>

          <div>
            <Label>Месечна вноска (BGN)</Label>
            <Input
              type="number"
              value={inputs.monthlyContribution}
              onChange={(e) => setInputs({...inputs, monthlyContribution: parseInt(e.target.value) || 0})}
              min="10"
              step="10"
            />
            <p className="text-xs text-slate-500 mt-1">Минимум 10 BGN</p>
          </div>

          <div>
            <Label>Месечна брутна заплата (за данъци)</Label>
            <Input
              type="number"
              value={inputs.monthlyGrossSalary}
              onChange={(e) => setInputs({...inputs, monthlyGrossSalary: parseInt(e.target.value) || 0})}
              min="500"
              step="100"
            />
            <p className="text-xs text-slate-500 mt-1">За изчисление на данъчно облекчение</p>
          </div>

          <div>
            <Label>Тип фонд</Label>
            <Select value={inputs.fundType} onValueChange={(v) => setInputs({...inputs, fundType: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="universal">Универсален (такса 1.5%, консервативен)</SelectItem>
                <SelectItem value="balanced">Балансиран (такса 1.8%, умерен риск)</SelectItem>
                <SelectItem value="dynamic">Динамичен (такса 2.0%, висок риск)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Очаквана годишна доходност (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={inputs.expectedReturn}
              onChange={(e) => setInputs({...inputs, expectedReturn: parseFloat(e.target.value) || 0})}
              min="0"
              max="20"
            />
            <p className="text-xs text-slate-500 mt-1">Универсален: 4-6%, Балансиран: 5-8%, Динамичен: 7-12%</p>
          </div>

          <div className="flex items-center space-x-2 col-span-2">
            <Checkbox
              checked={inputs.useTaxRelief}
              onCheckedChange={(checked) => setInputs({...inputs, useTaxRelief: checked})}
              id="tax-relief"
            />
            <label htmlFor="tax-relief" className="text-sm font-medium cursor-pointer">
              Използвай данъчно облекчение (10% от БОД, макс 60 лв/месец)
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => {}} className="flex-1 bg-purple-600 hover:bg-purple-700">
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
            <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-2 mb-4">
                <PiggyBank className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-slate-900">Прогноза за пенсиониране</h4>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Месечна вноска:</span>
                  <span className="font-semibold">{result.monthlyContribution} BGN</span>
                </div>
                {inputs.useTaxRelief && parseFloat(result.monthlyTaxRelief) > 0 && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Данъчно облекчение:</span>
                      <span className="font-semibold">-{result.monthlyTaxRelief} BGN</span>
                    </div>
                    <div className="flex justify-between bg-green-50 p-2 rounded">
                      <span className="text-green-800">Нетна месечна цена:</span>
                      <span className="font-semibold text-green-800">{result.netMonthlyCost} BGN</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">Години до пенсия:</span>
                  <span className="font-semibold">{result.yearsToRetirement} години</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between">
                  <span className="text-slate-600">Общо внесени средства:</span>
                  <span className="font-semibold">{result.totalContributions} BGN</span>
                </div>
                {inputs.useTaxRelief && (
                  <div className="flex justify-between text-green-600">
                    <span>Обща данъчна икономия:</span>
                    <span className="font-semibold">-{result.totalTaxRelief} BGN</span>
                  </div>
                )}
                <div className="flex justify-between text-green-600">
                  <span>Инвестиционен доход:</span>
                  <span className="font-semibold">+{result.investmentGains} BGN</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between text-lg">
                  <span className="font-bold text-slate-900">Натрупана сума при пенсия:</span>
                  <span className="font-bold text-purple-600">{result.finalBalance} BGN</span>
                </div>
                <div className="flex justify-between text-sm text-indigo-600 bg-indigo-50 p-2 rounded mt-2">
                  <span>Прогнозна месечна пенсия (20 г):</span>
                  <span className="font-semibold">{result.monthlyPension} BGN</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-900">Прогноза по години</h4>
                <TrendingUp className="w-4 h-4 text-slate-400" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-2 text-left">Година</th>
                      <th className="p-2 text-left">Възраст</th>
                      <th className="p-2 text-right">Внесено</th>
                      <th className="p-2 text-right">Данъци</th>
                      <th className="p-2 text-right">Доход</th>
                      <th className="p-2 text-right">Общо</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.yearlyData.map((row, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{row.year}</td>
                        <td className="p-2">{row.age} г</td>
                        <td className="p-2 text-right">{row.totalContributions.toFixed(0)}</td>
                        <td className="p-2 text-right text-green-600">-{row.totalTaxRelief.toFixed(0)}</td>
                        <td className="p-2 text-right text-green-600">+{row.investmentGain.toFixed(0)}</td>
                        <td className="p-2 text-right font-medium">{row.balance.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 text-xs">
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="font-semibold text-slate-900 mb-2">💡 Предимства:</p>
                <ul className="text-slate-600 space-y-1 ml-3">
                  <li>• Данъчно облекчение до 60 лв/месец</li>
                  <li>• Гъвкава месечна вноска</li>
                  <li>• Професионално управление</li>
                  <li>• Избор на инвестиционен профил</li>
                  <li>• Възможност за предсрочно теглене</li>
                </ul>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="font-semibold text-slate-900 mb-2">⚠️ Важно:</p>
                <ul className="text-slate-600 space-y-1 ml-3">
                  <li>• Доброволно участие</li>
                  <li>• Такси за управление ежегодно</li>
                  <li>• Доходността не е гарантирана</li>
                  <li>• Данъчно облекчение само за БОД</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}