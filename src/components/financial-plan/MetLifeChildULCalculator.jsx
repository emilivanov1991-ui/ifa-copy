import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, Baby } from 'lucide-react';
import {
  METLIFE_PA_RISK_CLASSES,
  METLIFE_PA_CHILD_COVERAGES
} from './FinancialPlanConstants';

// Child Protection Agreement coefficients by policyholder age (from Ind. PA Rates A55:B97)
const CHILD_PROTECTION_COEFFICIENTS = {
  18: 0.0438, 19: 0.0438, 20: 0.0438, 21: 0.0438, 22: 0.0438,
  23: 0.0438, 24: 0.0438, 25: 0.0438, 26: 0.0438, 27: 0.0438,
  28: 0.0438, 29: 0.0438, 30: 0.0438, 31: 0.044, 32: 0.044,
  33: 0.044, 34: 0.044, 35: 0.044, 36: 0.045, 37: 0.045,
  38: 0.045, 39: 0.045, 40: 0.045, 41: 0.048, 42: 0.048,
  43: 0.048, 44: 0.048, 45: 0.048, 46: 0.052, 47: 0.052,
  48: 0.052, 49: 0.052, 50: 0.052, 51: 0.058, 52: 0.058,
  53: 0.058, 54: 0.058, 55: 0.058
};

export default function MetLifeChildULCalculator({ initialData = {}, onSave }) {
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
        const coefficient = CHILD_PROTECTION_COEFFICIENTS[policyholderAge] || 0.044;
        
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-pink-600 to-purple-600">
        <CardHeader>
          <div className="flex items-center gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/MetLife_logo.svg/200px-MetLife_logo.svg.png" alt="MetLife" className="h-8 bg-white rounded px-2 py-1" />
            <div>
              <CardTitle className="text-white">Калкулатор "МетЛайф Детство Акции и Облигации"</CardTitle>
              <p className="text-pink-100 text-sm">MetLife UL Junior - Детски Unit Linked</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Errors and Warnings */}
      {(premiumBreakdown.errors.length > 0 || premiumBreakdown.warnings.length > 0) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 space-y-2">
            {premiumBreakdown.errors.map((error, idx) => (
              <div key={`err-${idx}`} className="flex items-start gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            ))}
            {premiumBreakdown.warnings.map((warning, idx) => (
              <div key={`warn-${idx}`} className="flex items-start gap-2 text-amber-700">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{warning}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Input */}
        <div className="space-y-6">
          {/* Policyholder & Child Data */}
          <Card>
            <CardHeader className="bg-purple-50 py-3">
              <CardTitle className="text-base text-purple-800">Данни за кандидатите за застраховащ и застрахован</CardTitle>
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
          <Card>
            <CardHeader className="bg-blue-50 py-3">
              <CardTitle className="text-base text-blue-800">Инвестиционни фондове</CardTitle>
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
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-medium">Общо:</span>
                <span className={`font-bold ${formData.fundGlobalStocks + formData.fundEmergingMarkets + formData.fundBonds === 100 ? 'text-green-600' : 'text-red-600'}`}>
                  {formData.fundGlobalStocks + formData.fundEmergingMarkets + formData.fundBonds}%
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-600">
                <span>Средна годишна доходност:</span>
                <span className="font-semibold text-blue-700">{(expectedReturn * 100).toFixed(2)}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Coverages Input */}
          <Card>
            <CardHeader className="bg-amber-50 py-3">
              <CardTitle className="text-base text-amber-800">Застрахователни покрития</CardTitle>
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
          <Card>
            <CardHeader className="bg-green-50 py-3">
              <CardTitle className="text-base text-green-800">Преглед на покритията и цените</CardTitle>
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
                <div className="flex justify-between text-sm py-1.5 border-b border-slate-100 bg-blue-50 -mx-4 px-4">
                  <span className="text-blue-700 font-medium">Годишна сума за спестяване</span>
                  <div className="flex gap-8">
                    <span className="w-24 text-right font-medium text-blue-700">
                      {formData.annualSavings.toLocaleString()} €
                    </span>
                    <span className="w-20 text-right font-semibold text-blue-700">
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
          <Card>
            <CardHeader className="bg-purple-600 py-3">
              <CardTitle className="text-base text-white">Обобщение на цената</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Обща нетна цена на застрахователния план:</span>
                <span className="font-semibold">{premiumBreakdown.netPremium.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Админ. такса:</span>
                <span className="font-semibold">{premiumBreakdown.adminFee} € /година</span>
              </div>
              
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-lg font-bold text-purple-700">
                  <span>Годишно плащане:</span>
                  <span>{premiumBreakdown.annualPremium.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">6 м. плащане:</span>
                  <span className="font-semibold">{premiumBreakdown.semiAnnualPremium.toFixed(2)} € /полугодие</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">3 м. плащане:</span>
                  <span className="font-semibold">{premiumBreakdown.quarterlyPremium.toFixed(2)} € /тримесечие</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {onSave && (
            <Button 
              onClick={() => onSave(formData, premiumBreakdown)} 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={premiumBreakdown.errors.length > 0}
            >
              <Baby className="w-4 h-4 mr-2" />
              Запази офертата
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}