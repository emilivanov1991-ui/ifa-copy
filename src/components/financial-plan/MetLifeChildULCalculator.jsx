import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, Baby, Save, Sparkles, Heart, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  METLIFE_PA_CHILD_COVERAGES,
  getChildProtectionCoefficient
} from './FinancialPlanConstants';

export default function MetLifeChildULCalculator({ initialData = {}, onSave, analysisId, clientId }) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    // Policyholder (parent)
    policyholderName: initialData.policyholderName || '',
    policyholderAge: initialData.policyholderAge || 35,
    
    // Insured (child)
    childName: initialData.childName || '',
    childAge: initialData.childAge || 5,
    
    // Savings
    annualSavings: initialData.annualSavings || 1200,
    
    // Fund allocation (must sum to 100%)
    fundGlobalStocks: initialData.fundGlobalStocks || 50,
    fundEmergingMarkets: initialData.fundEmergingMarkets || 50,
    fundBonds: initialData.fundBonds || 0,
    
    // Coverages
    ptdCoverage: initialData.ptdCoverage || 0,           // Min 5000
    hospitalDaily: initialData.hospitalDaily || 0,       // 20-300
    surgicalBenefit: initialData.surgicalBenefit || 0,   // 600-7500
    fracturesCoverage: initialData.fracturesCoverage || 0, // 500-750
    childProtection: initialData.childProtection !== undefined ? initialData.childProtection : true
  });

  // Calculate expected return based on fund allocation
  const expectedReturn = useMemo(() => {
    const globalStocks = 0.08;      // 8% for global stocks
    const emergingMarkets = 0.10;   // 10% for emerging markets
    const bonds = 0.04;             // 4% for bonds
    
    return (
      (formData.fundGlobalStocks / 100) * globalStocks +
      (formData.fundEmergingMarkets / 100) * emergingMarkets +
      (formData.fundBonds / 100) * bonds
    );
  }, [formData.fundGlobalStocks, formData.fundEmergingMarkets, formData.fundBonds]);

  // Premium calculation
  const premiumBreakdown = useMemo(() => {
    const breakdown = {
      coverages: {},
      warnings: [],
      errors: []
    };

    // Check fund allocation
    const totalAllocation = formData.fundGlobalStocks + formData.fundEmergingMarkets + formData.fundBonds;
    if (totalAllocation !== 100) {
      breakdown.errors.push(`Разпределението на спестяванията между фондовете е различно от 100% (текущо: ${totalAllocation}%)`);
    }

    // 1. PTD from accident (child) - min 5000 EUR
    if (formData.ptdCoverage > 0) {
      if (formData.ptdCoverage < 5000) {
        breakdown.warnings.push('Минимален размер на покритието ТН от злополука е 5 000 €');
      }
      const rate = METLIFE_PA_CHILD_COVERAGES.permanentInvalidityAccident.rate;
      breakdown.coverages.ptd = {
        name: 'Пълна/Частична Трайна Нетрудоспособност вследствие на злополука',
        coverage: formData.ptdCoverage,
        rate: rate,
        premium: (formData.ptdCoverage / 1000) * rate,
        info: 'Минимален размер на покритието 5 000 €'
      };
    }

    // 2. Hospital Daily Benefit (accident & sickness) - 20-300 EUR/day
    if (formData.hospitalDaily > 0) {
      if (formData.hospitalDaily < 20 || formData.hospitalDaily > 300) {
        breakdown.warnings.push('Допустим размер на дневното обезщетение от 20 до 300 €');
      }
      const rate = METLIFE_PA_CHILD_COVERAGES.hospitalizationAccidentSickness.rate;
      breakdown.coverages.hospitalDaily = {
        name: 'Дневно обезщетение при хоспитализация вследствие на ЗЛОПОЛУКА И ЗАБОЛЯВАНЕ',
        coverage: formData.hospitalDaily,
        rate: rate,
        premium: formData.hospitalDaily * rate,
        info: 'Допустим размер на покритието от 20 до 300 €'
      };
    }

    // 3. Surgical Benefit (accident & sickness) - 600-7500 EUR
    if (formData.surgicalBenefit > 0) {
      if (formData.surgicalBenefit < 600 || formData.surgicalBenefit > 7500) {
        breakdown.warnings.push('Допустим размер на хирургическа намеса от 600 до 7 500 €');
      }
      const rate = METLIFE_PA_CHILD_COVERAGES.surgicalAccidentSickness.rate;
      breakdown.coverages.surgical = {
        name: 'Хирургическа намеса вследствие на ЗЛОПОЛУКА И ЗАБОЛЯВАНЕ',
        coverage: formData.surgicalBenefit,
        rate: rate,
        premium: (formData.surgicalBenefit / 100) * rate,
        info: 'Допустим размер на покритието от 600 до 7 500 €'
      };
    }

    // 4. Fractures and Burns - 500-750 EUR
    if (formData.fracturesCoverage > 0) {
      if (formData.fracturesCoverage < 500 || formData.fracturesCoverage > 750) {
        breakdown.warnings.push('Допустим размер на покритието фрактури и изгаряния от 500 до 750 €');
      }
      const rate = METLIFE_PA_CHILD_COVERAGES.brokenBonesAndBurns.rate;
      breakdown.coverages.fractures = {
        name: 'Фрактури и изгаряния',
        coverage: formData.fracturesCoverage,
        rate: rate,
        premium: (formData.fracturesCoverage / 1000) * rate,
        info: 'Допустим размер на покритието от 500 до 750 €'
      };
    }

    // 5. Child Protection Agreement
    if (formData.childProtection) {
      const policyholderAge = formData.policyholderAge;
      
      if (policyholderAge > 55) {
        breakdown.errors.push('Покритието "Споразумение за защита на детето" не може да бъде предоставено на Застраховащ над 55 години');
      } else if (policyholderAge < 18) {
        breakdown.errors.push('Застраховащият трябва да е на възраст поне 18 години');
      } else if (formData.annualSavings <= 0) {
        breakdown.warnings.push('Задължително посочете размера на спестовната вноска');
      } else {
        const coefficient = getChildProtectionCoefficient(policyholderAge) || 0.044;
        
        // Sum of coverage premiums + annual savings
        const coveragesPremiumSum = Object.values(breakdown.coverages).reduce((sum, c) => sum + c.premium, 0);
        const base = coveragesPremiumSum + formData.annualSavings;
        
        breakdown.coverages.childProtection = {
          name: 'Споразумение за защита на детето',
          coverage: 'Включено',
          coefficient: coefficient,
          premium: base * coefficient,
          info: 'Допустима възраст на застраховащия при сключване 18 - 55 години'
        };
      }
    }

    // Calculate totals
    const coveragesPremium = Object.values(breakdown.coverages).reduce((sum, c) => sum + (c.premium || 0), 0);
    
    breakdown.netPremium = coveragesPremium + formData.annualSavings;
    breakdown.adminFee = 15;
    breakdown.annualPremium = breakdown.netPremium + breakdown.adminFee;
    breakdown.semiAnnualPremium = breakdown.annualPremium / 2;
    breakdown.quarterlyPremium = breakdown.annualPremium / 4;
    breakdown.savingsContribution = formData.annualSavings;
    breakdown.expectedReturn = expectedReturn;

    return breakdown;
  }, [formData, expectedReturn]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveOffer = async () => {
    if (!analysisId || premiumBreakdown.errors.length > 0) return;
    
    setSaving(true);
    try {
      await base44.entities.ProductOffer.create({
        analysis_id: analysisId,
        client_id: clientId,
        provider: 'MetLife',
        product_name: 'MetLife Детство',
        product_type: 'education_plan',
        beneficiary_name: formData.childName,
        beneficiary_age: formData.childAge,
        monthly_premium: premiumBreakdown.annualPremium / 12,
        annual_premium: premiumBreakdown.annualPremium,
        offer_status: 'generated',
        ai_recommendation_reason: `Детски UL план с очаквана доходност ${(premiumBreakdown.expectedReturn * 100).toFixed(2)}%`
      });
      
      toast.success('Офертата е запазена успешно');
      if (onSave) onSave(formData, premiumBreakdown);
    } catch (error) {
      toast.error('Грешка при записване: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 overflow-hidden shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <Baby className="h-7 w-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-2xl font-bold tracking-wide">МетЛайф Детство</CardTitle>
              <p className="text-pink-100 text-sm font-medium">Unit Linked - Детска инвестиционна застраховка</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Errors and Warnings */}
      {(premiumBreakdown.errors.length > 0 || premiumBreakdown.warnings.length > 0) && (
        <Card className="border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg">
          <CardContent className="pt-6 space-y-3">
            {premiumBreakdown.errors.map((error, idx) => (
              <div key={`err-${idx}`} className="flex items-start gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            ))}
            {premiumBreakdown.warnings.map((warning, idx) => (
              <div key={`warn-${idx}`} className="flex items-start gap-2 text-amber-700">
                <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-medium">{warning}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Input */}
        <div className="space-y-6">
          {/* Policyholder & Child Data */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 py-4">
              <CardTitle className="text-base text-purple-800 font-semibold flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Данни за кандидатите за застраховащ и застрахован
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <Label>Застраховащ /име/ (родител)</Label>
                <Input 
                  value={formData.policyholderName}
                  onChange={(e) => handleInputChange('policyholderName', e.target.value)}
                  placeholder="Име на родителя"
                />
              </div>
              <div>
                <Label>Възраст - Застраховащ (Притежател)</Label>
                <Input 
                  type="number"
                  value={formData.policyholderAge}
                  onChange={(e) => handleInputChange('policyholderAge', parseInt(e.target.value) || 0)}
                  min={18}
                  max={55}
                />
              </div>
              <div className="border-t pt-4">
                <Label>Застраховано лице /име/ (дете)</Label>
                <Input 
                  value={formData.childName}
                  onChange={(e) => handleInputChange('childName', e.target.value)}
                  placeholder="Име на детето"
                />
              </div>
              <div>
                <Label>Възраст - Застрахован (дете)</Label>
                <Input 
                  type="number"
                  value={formData.childAge}
                  onChange={(e) => handleInputChange('childAge', parseInt(e.target.value) || 0)}
                  min={0}
                  max={17}
                />
              </div>
              <div className="border-t pt-4">
                <Label>Годишна сума за спестяване (€)</Label>
                <Input 
                  type="number"
                  value={formData.annualSavings}
                  onChange={(e) => handleInputChange('annualSavings', parseFloat(e.target.value) || 0)}
                  min={300}
                />
              </div>
            </CardContent>
          </Card>

          {/* Fund Allocation */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 py-4">
              <CardTitle className="text-base text-blue-800 font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Инвестиционни фондове
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 items-center">
                <Label className="text-sm">Световни акции (%)</Label>
                <Input 
                  type="number"
                  value={formData.fundGlobalStocks}
                  onChange={(e) => handleInputChange('fundGlobalStocks', parseFloat(e.target.value) || 0)}
                  min={0}
                  max={100}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <Label className="text-sm">Акции развиващи се пазари (%)</Label>
                <Input 
                  type="number"
                  value={formData.fundEmergingMarkets}
                  onChange={(e) => handleInputChange('fundEmergingMarkets', parseFloat(e.target.value) || 0)}
                  min={0}
                  max={100}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <Label className="text-sm">Държавни Ценни Книжа (%)</Label>
                <Input 
                  type="number"
                  value={formData.fundBonds}
                  onChange={(e) => handleInputChange('fundBonds', parseFloat(e.target.value) || 0)}
                  min={0}
                  max={100}
                />
              </div>
              <div className={`bg-gradient-to-r p-4 rounded-lg border mt-4 ${formData.fundGlobalStocks + formData.fundEmergingMarkets + formData.fundBonds === 100 ? 'from-green-50 to-emerald-50 border-green-200' : 'from-red-50 to-rose-50 border-red-200'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Общо разпределение:</span>
                  <span className={`text-2xl font-bold ${formData.fundGlobalStocks + formData.fundEmergingMarkets + formData.fundBonds === 100 ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.fundGlobalStocks + formData.fundEmergingMarkets + formData.fundBonds}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-white/50 pt-2">
                  <span className="text-slate-600 font-medium">Очаквана годишна доходност:</span>
                  <span className="text-lg font-bold text-blue-700">{(expectedReturn * 100).toFixed(2)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coverages Input */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 py-4">
              <CardTitle className="text-base text-amber-800 font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Застрахователни покрития
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* PTD */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <Label className="text-sm">Пълна/Частична ТН от злополука (€)</Label>
                <Input 
                  type="number"
                  value={formData.ptdCoverage}
                  onChange={(e) => handleInputChange('ptdCoverage', parseFloat(e.target.value) || 0)}
                  min={0}
                  placeholder="мин. 5000"
                />
              </div>

              {/* Hospital Daily */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <Label className="text-sm">Дневно обезщетение хоспитализация (€/ден)</Label>
                <Input 
                  type="number"
                  value={formData.hospitalDaily}
                  onChange={(e) => handleInputChange('hospitalDaily', parseFloat(e.target.value) || 0)}
                  min={0}
                  max={300}
                  placeholder="20-300"
                />
              </div>

              {/* Surgical */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <Label className="text-sm">Хирургическа намеса (€)</Label>
                <Input 
                  type="number"
                  value={formData.surgicalBenefit}
                  onChange={(e) => handleInputChange('surgicalBenefit', parseFloat(e.target.value) || 0)}
                  min={0}
                  max={7500}
                  placeholder="600-7500"
                />
              </div>

              {/* Fractures */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <Label className="text-sm">Фрактури и изгаряния (€)</Label>
                <Input 
                  type="number"
                  value={formData.fracturesCoverage}
                  onChange={(e) => handleInputChange('fracturesCoverage', parseFloat(e.target.value) || 0)}
                  min={0}
                  max={750}
                  placeholder="500-750"
                />
              </div>

              {/* Child Protection */}
              <div className="flex items-center justify-between py-2 border-t">
                <Label className="text-sm">Споразумение за защита на детето</Label>
                <Select 
                  value={formData.childProtection ? 'included' : 'excluded'} 
                  onValueChange={(v) => handleInputChange('childProtection', v === 'included')}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="included">Включено</SelectItem>
                    <SelectItem value="excluded">Изключено</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Output */}
        <div className="space-y-6">
          {/* Coverage Summary */}
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 py-4">
              <CardTitle className="text-base text-green-800 font-semibold">Преглед на покритията и цените</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-medium border-b pb-2">
                  <span>Застрахователно покритие</span>
                  <div className="flex gap-8">
                    <span className="w-24 text-right">Размер</span>
                    <span className="w-20 text-right">Цена €</span>
                  </div>
                </div>

                {/* Annual Savings */}
                <div className="flex justify-between text-sm py-2.5 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 -mx-4 px-4 rounded-lg mb-2">
                  <span className="text-blue-800 font-semibold">Годишна сума за спестяване</span>
                  <div className="flex gap-8">
                    <span className="w-24 text-right font-semibold text-blue-700">
                      {formData.annualSavings.toLocaleString()} €
                    </span>
                    <span className="w-20 text-right font-bold text-blue-800">
                      {formData.annualSavings.toFixed(2)}
                    </span>
                  </div>
                </div>

                {Object.values(premiumBreakdown.coverages).map((coverage, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-1.5 border-b border-slate-100">
                    <span className="text-slate-700 flex-1 pr-2">{coverage.name}</span>
                    <div className="flex gap-8">
                      <span className="w-24 text-right font-medium">
                        {typeof coverage.coverage === 'number' ? `${coverage.coverage.toLocaleString()} €` : coverage.coverage}
                      </span>
                      <span className="w-20 text-right font-semibold text-green-700">
                        {coverage.premium.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}

                {Object.keys(premiumBreakdown.coverages).length === 0 && (
                  <div className="text-sm text-slate-500 text-center py-4">
                    Няма избрани допълнителни покрития
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Summary */}
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 py-4">
              <CardTitle className="text-base text-white font-bold">Обобщение на цената</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between text-sm bg-slate-50 rounded-lg p-3">
                <span className="text-slate-600 font-medium">Обща нетна цена на застрахователния план:</span>
                <span className="font-bold text-slate-900">{premiumBreakdown.netPremium.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm bg-slate-50 rounded-lg p-3">
                <span className="text-slate-600 font-medium">Админ. такса:</span>
                <span className="font-bold text-slate-900">{premiumBreakdown.adminFee} € /година</span>
              </div>
              
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-lg font-bold text-purple-700 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <span>Годишно плащане:</span>
                  <span className="text-2xl">{premiumBreakdown.annualPremium.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm bg-white rounded-lg p-3 border border-slate-200">
                  <span className="text-slate-600 font-medium">6 м. плащане:</span>
                  <span className="font-bold text-purple-600">{premiumBreakdown.semiAnnualPremium.toFixed(2)} € /полугодие</span>
                </div>
                <div className="flex justify-between text-sm bg-white rounded-lg p-3 border border-slate-200">
                  <span className="text-slate-600 font-medium">3 м. плащане:</span>
                  <span className="font-bold text-purple-600">{premiumBreakdown.quarterlyPremium.toFixed(2)} € /тримесечие</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {analysisId && (
            <Button 
              onClick={handleSaveOffer} 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-base font-semibold"
              disabled={premiumBreakdown.errors.length > 0 || saving}
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'Записване...' : 'Запази офертата'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}