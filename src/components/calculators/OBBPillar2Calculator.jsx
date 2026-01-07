import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Save, TrendingUp, PiggyBank } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// ОББ Втори стълб - ДЗПО (Допълнително задължително пенсионно осигуряване)
export default function OBBPillar2Calculator({ analysisId, clientId }) {
  const [inputs, setInputs] = useState({
    age: 35,
    retirementAge: 65,
    monthlyGrossSalary: 2000, // BGN
    contributionRate: 5, // % от БОД
    fundType: 'universal', // universal / professional
    expectedReturn: 5.5 // % годишна доходност
  });

  const result = useMemo(() => {
    const yearsToRetirement = inputs.retirementAge - inputs.age;
    const monthlyContribution = inputs.monthlyGrossSalary * (inputs.contributionRate / 100);
    
    // Такси за управление (годишни)
    const managementFee = inputs.fundType === 'universal' ? 0.95 : 1.05; // % от активи
    
    // Прогноза на натрупана сума с реинвестиране
    let balance = 0;
    const yearlyData = [];
    
    for (let year = 1; year <= yearsToRetirement; year++) {
      const annualContribution = monthlyContribution * 12;
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
          balance: balance,
          investmentGain: balance - (annualContribution * year)
        });
      }
    }
    
    const totalContributions = monthlyContribution * 12 * yearsToRetirement;
    const investmentGains = balance - totalContributions;
    
    // Месечна пенсия (ориентировъчна, при 20 години изплащане)
    const monthlyPension = balance / (20 * 12);
    
    return {
      monthlyContribution: monthlyContribution.toFixed(2),
      annualContribution: (monthlyContribution * 12).toFixed(2),
      totalContributions: totalContributions.toFixed(2),
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
      product_name: 'Втори стълб - ДЗПО',
      product_type: 'pension_plan',
      beneficiary: 'client',
      beneficiary_name: 'Осигурен',
      monthly_premium: parseFloat(result.monthlyContribution),
      annual_premium: parseFloat(result.annualContribution),
      coverage_amount: parseFloat(result.finalBalance),
      offer_status: 'generated',
      ai_recommendation_reason: `ОББ ДЗПО (Втори стълб): Месечна вноска ${result.monthlyContribution} BGN (${inputs.contributionRate}% от ${inputs.monthlyGrossSalary} BGN). Очаквана сума при пенсиониране: ${result.finalBalance} BGN. Прогнозна месечна пенсия: ${result.monthlyPension} BGN.`
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
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="flex items-center gap-3">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/838db6bfd_image.png" 
            alt="ОББ Пенсионно" 
            className="h-10 bg-white p-1 rounded"
          />
          <div>
            <CardTitle className="text-xl">ОББ - Втори стълб (ДЗПО)</CardTitle>
            <p className="text-xs text-blue-100 mt-1">Допълнително задължително пенсионно осигуряване</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-800">
            <strong>Важно:</strong> Вторият стълб е задължителен за лица родени след 1959 година. 
            Вноската е 5% от БОД (брутното осигурително доход) и се удържа от работодателя.
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
              max="64"
            />
          </div>

          <div>
            <Label>Пенсионна възраст</Label>
            <Input
              type="number"
              value={inputs.retirementAge}
              onChange={(e) => setInputs({...inputs, retirementAge: parseInt(e.target.value) || 0})}
              min="60"
              max="70"
            />
          </div>

          <div>
            <Label>Месечна брутна заплата (BGN)</Label>
            <Input
              type="number"
              value={inputs.monthlyGrossSalary}
              onChange={(e) => setInputs({...inputs, monthlyGrossSalary: parseInt(e.target.value) || 0})}
              min="500"
              step="100"
            />
          </div>

          <div>
            <Label>Процент вноска от БОД</Label>
            <Select value={inputs.contributionRate.toString()} onValueChange={(v) => setInputs({...inputs, contributionRate: parseFloat(v)})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5% (стандарт)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">Законово определено</p>
          </div>

          <div>
            <Label>Тип фонд</Label>
            <Select value={inputs.fundType} onValueChange={(v) => setInputs({...inputs, fundType: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="universal">Универсален (такса 0.95%)</SelectItem>
                <SelectItem value="professional">Професионален (такса 1.05%)</SelectItem>
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
              max="15"
            />
            <p className="text-xs text-slate-500 mt-1">Историческа средна: 5-7%</p>
          </div>
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
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <PiggyBank className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-slate-900">Прогноза за пенсиониране</h4>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Месечна вноска:</span>
                  <span className="font-semibold">{result.monthlyContribution} BGN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Годишна вноска:</span>
                  <span className="font-semibold">{result.annualContribution} BGN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Години до пенсия:</span>
                  <span className="font-semibold">{result.yearsToRetirement} години</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between">
                  <span className="text-slate-600">Общо внесени средства:</span>
                  <span className="font-semibold">{result.totalContributions} BGN</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Инвестиционен доход:</span>
                  <span className="font-semibold">+{result.investmentGains} BGN</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between text-lg">
                  <span className="font-bold text-slate-900">Натрупана сума при пенсия:</span>
                  <span className="font-bold text-blue-600">{result.finalBalance} BGN</span>
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
                  <li>• Задължителна социална защита</li>
                  <li>• Данъчни облекчения</li>
                  <li>• Професионално управление</li>
                  <li>• Гарантирана минимална доходност</li>
                  <li>• Прехвърляне между фондове</li>
                </ul>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="font-semibold text-slate-900 mb-2">⚠️ Важно:</p>
                <ul className="text-slate-600 space-y-1 ml-3">
                  <li>• Изплаща се само при пенсиониране</li>
                  <li>• Не може да се тегли предсрочно</li>
                  <li>• Такси за управление ежегодно</li>
                  <li>• Доходността не е гарантирана</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}