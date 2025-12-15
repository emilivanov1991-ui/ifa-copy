import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Info, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  TERM_LIFE_RIDER_RATES,
  TERM_LIFE_BASIC_RATES,
  METLIFE_PA_RISK_CLASSES,
  METLIFE_PA_CRITICAL_ILLNESS_32_RATES,
  METLIFE_PA_SECURITY_PLUS_COEFFICIENTS
} from './FinancialPlanConstants';

export default function MetLifeTermLifeCalculator({ initialData = {}, onSave, analysisId, clientId }) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    clientName: initialData.clientName || '',
    age: initialData.age || 35,
    riskClass: initialData.riskClass || 1,
    
    // Main Term Life coverage
    termLifeCoverage: initialData.termLifeCoverage || 3000,
    termLifeYears: initialData.termLifeYears || 5,
    
    // Additional coverages
    accidentalDeathCoverage: initialData.accidentalDeathCoverage || 0,
    ptdCoverage: initialData.ptdCoverage || 0,
    hospitalDailyBenefit: initialData.hospitalDailyBenefit || 0,
    surgicalBenefit: initialData.surgicalBenefit || 0,
    fracturesCoverage: initialData.fracturesCoverage || 1500,
    criticalIllness32Coverage: initialData.criticalIllness32Coverage || 0,
    criticalIllness32Years: initialData.criticalIllness32Years || 10,
    criticalIllness40Coverage: initialData.criticalIllness40Coverage || 0,
    telemedicine: initialData.telemedicine || false
  });

  // Calculate premium breakdown
  const premiumBreakdown = useMemo(() => {
    const breakdown = {
      coverages: {},
      warnings: [],
      errors: []
    };
    const age = formData.age;
    const riskClass = formData.riskClass;

    // 1. Main Term Life Coverage
    if (formData.termLifeCoverage > 0) {
      const termRates = TERM_LIFE_BASIC_RATES[age];
      if (termRates) {
        const rate = termRates[formData.termLifeYears] || 0;
        breakdown.coverages.termLife = {
          name: `Основно покритие срочен Живот (${formData.termLifeYears} год.)`,
          coverage: formData.termLifeCoverage,
          rate: rate,
          premium: (formData.termLifeCoverage / 1000) * rate,
          info: 'Минималният размер на застрахователната сума по покритието е 3 000 €'
        };
      }
      if (formData.termLifeCoverage < 3000) {
        breakdown.errors.push('Минималният размер на покритието срочен Живот е 3 000 €');
      }
    }

    // 2. Accidental Death
    if (formData.accidentalDeathCoverage > 0) {
      const riskData = METLIFE_PA_RISK_CLASSES[riskClass];
      breakdown.coverages.accidentalDeath = {
        name: 'Смърт вследствие на злополука',
        coverage: formData.accidentalDeathCoverage,
        rate: riskData.accidentalDeath,
        premium: (formData.accidentalDeathCoverage / 1000) * riskData.accidentalDeath,
        info: 'Минималният размер на застрахователната сума по покритието е 3 000 €'
      };
      if (formData.accidentalDeathCoverage < 3000) {
        breakdown.warnings.push('Минималният размер на покритието Смърт от злополука е 3 000 €');
      }
    }

    // 3. PTD (requires Accidental Death)
    if (formData.ptdCoverage > 0) {
      if (formData.accidentalDeathCoverage === 0) {
        breakdown.errors.push('Покритието ПТН изисква покритие Смърт вследствие на злополука');
      } else {
        const riskData = METLIFE_PA_RISK_CLASSES[riskClass];
        breakdown.coverages.ptd = {
          name: 'Пълна/Частична Трайна Нетрудоспособност от злополука',
          coverage: formData.ptdCoverage,
          rate: riskData.pi,
          premium: (formData.ptdCoverage / 1000) * riskData.pi,
          info: 'Това покритие не може да се предостави без покритието Смърт вследствие на злополука'
        };
      }
    }

    // 4. Hospital Daily Benefit (age 18-69)
    if (formData.hospitalDailyBenefit > 0) {
      if (age < 18 || age > 69) {
        breakdown.errors.push('Дневно обезщетение при хоспитализация е достъпно за възраст 18-69 години');
      } else if (formData.hospitalDailyBenefit < 5 || formData.hospitalDailyBenefit > 300) {
        breakdown.warnings.push('Допустим размер на покритието от 5 до 300 €');
      } else {
        breakdown.coverages.hospitalDaily = {
          name: 'Дневно обезщетение при хоспитализация (злополука и заболяване)',
          coverage: formData.hospitalDailyBenefit,
          rate: 4.25,
          premium: formData.hospitalDailyBenefit * 4.25,
          info: 'Допустим размер на покритието от 5 до 300 €. Допустима възраст 18-69 години'
        };
      }
    }

    // 5. Surgical Benefit (age 18-69)
    if (formData.surgicalBenefit > 0) {
      if (age < 18 || age > 69) {
        breakdown.errors.push('Хирургическа намеса е достъпно за възраст 18-69 години');
      } else if (formData.surgicalBenefit < 150 || formData.surgicalBenefit > 5000) {
        breakdown.warnings.push('Допустим размер на покритието от 150 до 5 000 €');
      } else {
        breakdown.coverages.surgical = {
          name: 'Хирургическа намеса (злополука и заболяване)',
          coverage: formData.surgicalBenefit,
          rate: 8.32,
          premium: (formData.surgicalBenefit / 100) * 8.32,
          info: 'Допустим размер на покритието от 150 до 5 000 €. Допустима възраст 18-69 години'
        };
      }
    }

    // 6. Fractures and Burns (age 18-64)
    if (formData.fracturesCoverage > 0) {
      if (age < 18 || age > 64) {
        breakdown.errors.push('Фрактури и изгаряния е достъпно за възраст 18-64 години');
      } else if (formData.fracturesCoverage < 500 || formData.fracturesCoverage > 1500) {
        breakdown.warnings.push('Допустим размер на покритието от 500 до 1 500 €');
      } else {
        const riskData = METLIFE_PA_RISK_CLASSES[riskClass];
        breakdown.coverages.fractures = {
          name: 'Фрактури и изгаряния',
          coverage: formData.fracturesCoverage,
          rate: riskData.fracturesAndBurns,
          premium: (formData.fracturesCoverage / 1000) * riskData.fracturesAndBurns,
          info: 'Допустим размер на покритието от 500 до 1 500 €. Допустима възраст 18-64 години'
        };
      }
    }

    // 7. 32 Critical Illnesses (age 18-55/60)
    if (formData.criticalIllness32Coverage > 0) {
      const ci32Rates = METLIFE_PA_CRITICAL_ILLNESS_32_RATES[age];
      if (age >= 60) {
        breakdown.errors.push('32 Тежки заболявания не може да бъде предоставено на клиент над 60 години');
      } else if (age >= 50 && formData.criticalIllness32Years === 10) {
        breakdown.errors.push('32 Тежки заболявания със срок 10 години не може за клиент над 50 години');
      } else if (ci32Rates) {
        const rate = formData.criticalIllness32Years === 5 ? ci32Rates.yr5 : ci32Rates.yr10;
        if (rate) {
          breakdown.coverages.criticalIllness32 = {
            name: `32 Тежки Заболявания (${formData.criticalIllness32Years} год.)`,
            coverage: formData.criticalIllness32Coverage,
            rate: rate,
            premium: (formData.criticalIllness32Coverage / 1000) * rate,
            info: 'Допустим размер от 1 000 до 200 000 €. Допустима възраст 18-55/60 години'
          };
        }
      }
    }

    // 8. 40 Critical Illnesses (age 18-65)
    if (formData.criticalIllness40Coverage > 0) {
      if (age < 18 || age >= 65) {
        breakdown.errors.push('40 Тежки заболявания не може да бъде предоставено на клиент под 18 или над 65 години');
      } else {
        const coefficient = METLIFE_PA_SECURITY_PLUS_COEFFICIENTS[age] || 50;
        breakdown.coverages.criticalIllness40 = {
          name: '40 Тежки Заболявания',
          coverage: formData.criticalIllness40Coverage,
          coefficient: coefficient,
          premium: formData.criticalIllness40Coverage / coefficient,
          info: 'Допустим размер от 5 000 до 500 000 €. Допустима възраст 18-65 години'
        };
      }
    }

    // 9. Telemedicine (age < 65)
    if (formData.telemedicine) {
      if (age >= 65) {
        breakdown.warnings.push('Телемедицина не може да бъде предоставено на клиент над 65 години');
      } else {
        breakdown.coverages.telemedicine = {
          name: 'Телемедицина / Второ медицинско мнение',
          coverage: 'Включено',
          premium: 15,
          info: 'Допустима възраст при сключване 18-64 години'
        };
      }
    }

    // Calculate totals
    const totalCoverages = Object.values(breakdown.coverages).reduce((sum, c) => sum + (c.premium || 0), 0);
    breakdown.netPremium = totalCoverages;
    breakdown.adminFee = 13;
    breakdown.annualPremium = totalCoverages + 13;
    breakdown.semiAnnualPremium = breakdown.annualPremium * 0.51;
    breakdown.quarterlyPremium = breakdown.annualPremium * 0.26;

    // Minimum premium check
    if (breakdown.annualPremium < 50) {
      breakdown.warnings.push('Минималната годишна премия е 50€');
    }
    if (breakdown.semiAnnualPremium < 25) {
      breakdown.warnings.push('Полугодишно плащане не е приложимо при тази премия');
    }
    if (breakdown.quarterlyPremium < 25) {
      breakdown.warnings.push('Тримесечно плащане не е приложимо при тази премия');
    }

    return breakdown;
  }, [formData]);

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
        product_name: 'MetLife Срочен живот',
        product_type: 'term_life',
        beneficiary_name: formData.clientName,
        beneficiary_age: formData.age,
        term_years: formData.termLifeYears,
        monthly_premium: premiumBreakdown.annualPremium / 12,
        annual_premium: premiumBreakdown.annualPremium,
        coverage_amount: formData.termLifeCoverage,
        risk_class: formData.riskClass,
        offer_status: 'generated',
        ai_recommendation_reason: `Срочна застраховка живот ${formData.termLifeYears} години`
      });
      
      toast.success('Офертата е запазена успешно');
      if (onSave) onSave(formData, premiumBreakdown);
    } catch (error) {
      toast.error('Грешка при записване: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const riskClassLabel = formData.riskClass === 1 ? 'I рисков клас' : formData.riskClass === 2 ? 'II рисков клас' : 'III рисков клас';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/MetLife_logo.svg/200px-MetLife_logo.svg.png" alt="MetLife" className="h-8 bg-white rounded px-2 py-1" />
            <div>
              <CardTitle className="text-white">Калкулатор за изчисляване на цена на Срочна застраховка Живот</CardTitle>
              <p className="text-blue-100 text-sm">и допълнителни застрахователни договори към нея</p>
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
          {/* Client Data */}
          <Card>
            <CardHeader className="bg-blue-50 py-3">
              <CardTitle className="text-base text-blue-800">Данни за кандидата за застраховане</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <Label>Застраховано лице /име/</Label>
                <Input 
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Име на клиента"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Възраст</Label>
                  <Input 
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                    min={15}
                    max={65}
                  />
                </div>
                <div>
                  <Label>Рисков клас</Label>
                  <Select value={formData.riskClass.toString()} onValueChange={(v) => handleInputChange('riskClass', parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">I рисков клас</SelectItem>
                      <SelectItem value="2">II рисков клас</SelectItem>
                      <SelectItem value="3">III рисков клас</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="text-sm text-slate-500">Валута: ЕВРО</div>
            </CardContent>
          </Card>

          {/* Coverages Input */}
          <Card>
            <CardHeader className="bg-amber-50 py-3">
              <CardTitle className="text-base text-amber-800">Застрахователни покрития</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Main Term Life */}
              <div className="p-3 bg-blue-50 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <Label className="font-semibold text-blue-800">Основно покритие срочен Живот</Label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select value={formData.termLifeYears.toString()} onValueChange={(v) => handleInputChange('termLifeYears', parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 год.</SelectItem>
                      <SelectItem value="10">10 год.</SelectItem>
                      <SelectItem value="15">15 год.</SelectItem>
                      <SelectItem value="20">20 год.</SelectItem>
                      <SelectItem value="25">25 год.</SelectItem>
                      <SelectItem value="30">30 год.</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number"
                      value={formData.termLifeCoverage}
                      onChange={(e) => handleInputChange('termLifeCoverage', parseFloat(e.target.value) || 0)}
                      min={3000}
                    />
                    <span className="text-sm text-slate-600">€</span>
                  </div>
                </div>
              </div>

              {/* Accidental Death */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <Label className="text-sm">Смърт вследствие на злополука</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    value={formData.accidentalDeathCoverage}
                    onChange={(e) => handleInputChange('accidentalDeathCoverage', parseFloat(e.target.value) || 0)}
                    min={0}
                  />
                  <span className="text-sm text-slate-600">€</span>
                </div>
              </div>

              {/* PTD */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <Label className="text-sm">Пълна/Частична ТН от злополука</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    value={formData.ptdCoverage}
                    onChange={(e) => handleInputChange('ptdCoverage', parseFloat(e.target.value) || 0)}
                    min={0}
                  />
                  <span className="text-sm text-slate-600">€</span>
                </div>
              </div>

              {/* Hospital Daily */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <Label className="text-sm">Дневно обезщетение при хоспитализация</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    value={formData.hospitalDailyBenefit}
                    onChange={(e) => handleInputChange('hospitalDailyBenefit', parseFloat(e.target.value) || 0)}
                    min={0}
                    max={300}
                    placeholder="5-300"
                  />
                  <span className="text-sm text-slate-600">€</span>
                </div>
              </div>

              {/* Surgical */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <Label className="text-sm">Хирургическа намеса</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    value={formData.surgicalBenefit}
                    onChange={(e) => handleInputChange('surgicalBenefit', parseFloat(e.target.value) || 0)}
                    min={0}
                    max={5000}
                    placeholder="150-5000"
                  />
                  <span className="text-sm text-slate-600">€</span>
                </div>
              </div>

              {/* Fractures */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <Label className="text-sm">Фрактури и изгаряния</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    value={formData.fracturesCoverage}
                    onChange={(e) => handleInputChange('fracturesCoverage', parseFloat(e.target.value) || 0)}
                    min={0}
                    max={1500}
                    placeholder="500-1500"
                  />
                  <span className="text-sm text-slate-600">€</span>
                </div>
              </div>

              {/* 32 Critical Illnesses */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">32 Тежки Заболявания</Label>
                  <Select value={formData.criticalIllness32Years.toString()} onValueChange={(v) => handleInputChange('criticalIllness32Years', parseInt(v))}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 год.</SelectItem>
                      <SelectItem value="10">10 год.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    value={formData.criticalIllness32Coverage}
                    onChange={(e) => handleInputChange('criticalIllness32Coverage', parseFloat(e.target.value) || 0)}
                    min={0}
                  />
                  <span className="text-sm text-slate-600">€</span>
                </div>
              </div>

              {/* 40 Critical Illnesses */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <Label className="text-sm">40 Тежки Заболявания</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    value={formData.criticalIllness40Coverage}
                    onChange={(e) => handleInputChange('criticalIllness40Coverage', parseFloat(e.target.value) || 0)}
                    min={0}
                  />
                  <span className="text-sm text-slate-600">€</span>
                </div>
              </div>

              {/* Telemedicine */}
              <div className="flex items-center justify-between py-2">
                <Label className="text-sm">Телемедицина / Второ мед. мнение</Label>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={formData.telemedicine}
                    onCheckedChange={(checked) => handleInputChange('telemedicine', checked)}
                    disabled={formData.age >= 65}
                  />
                  <span className="text-sm">{formData.telemedicine ? 'Включено' : 'Не'}</span>
                </div>
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
                    Няма избрани покрития
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Summary */}
          <Card>
            <CardHeader className="bg-blue-600 py-3">
              <CardTitle className="text-base text-white">Обобщение на цената</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Обща нетна цена на застрахователния план:</span>
                <span className="font-semibold">{premiumBreakdown.netPremium.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Админ. Такса:</span>
                <span className="font-semibold">{premiumBreakdown.adminFee.toFixed(2)} € /година</span>
              </div>
              
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-lg font-bold text-blue-700">
                  <span>Годишно плащане:</span>
                  <span>{premiumBreakdown.annualPremium.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">6 м. плащане:</span>
                  <span className={`font-semibold ${premiumBreakdown.semiAnnualPremium < 25 ? 'text-red-500' : ''}`}>
                    {premiumBreakdown.semiAnnualPremium < 25 ? 'Не е приложимо' : `${premiumBreakdown.semiAnnualPremium.toFixed(2)} €`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">3 м. плащане:</span>
                  <span className={`font-semibold ${premiumBreakdown.quarterlyPremium < 25 ? 'text-red-500' : ''}`}>
                    {premiumBreakdown.quarterlyPremium < 25 ? 'Не е приложимо' : `${premiumBreakdown.quarterlyPremium.toFixed(2)} €`}
                  </span>
                </div>
              </div>

              {premiumBreakdown.annualPremium < 50 && (
                <div className="mt-3 p-2 bg-red-50 rounded text-red-700 text-sm">
                  Минималната годишна премия е 50€
                </div>
              )}
            </CardContent>
          </Card>

          {analysisId && (
            <Button 
              onClick={handleSaveOffer} 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={premiumBreakdown.errors.length > 0 || saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Записване...' : 'Запази офертата'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}