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
  METLIFE_CARE_AGE_RATES,
  METLIFE_PA_RISK_CLASSES
} from './FinancialPlanConstants';

// ML Care Package definitions - coverage amounts by package
const ML_CARE_PACKAGES = {
  'Бронзов': { disability: 10000, ptd: 10000, ci40: 10000, cancer: 10000, inSitu: 5000 },
  'Сребърен': { disability: 25000, ptd: 25000, ci40: 25000, cancer: 25000, inSitu: 12500 },
  'Златен': { disability: 50000, ptd: 50000, ci40: 50000, cancer: 50000, inSitu: 25000 },
  'Платинен': { disability: 100000, ptd: 100000, ci40: 100000, cancer: 100000, inSitu: 50000 },
  'Персонализиран': { disability: 0, ptd: 0, ci40: 0, cancer: 0, inSitu: 0 }
};

export default function MetLifeCareCalculator({ initialData = {}, onSave, analysisId, clientId }) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    clientName: initialData.clientName || '',
    age: initialData.age || 35,
    riskClass: initialData.riskClass || 1,
    package: initialData.package || 'Сребърен',
    
    // Coverages (auto-filled by package or custom)
    disabilityCoverage: initialData.disabilityCoverage || 25000,
    ptdCoverage: initialData.ptdCoverage || 25000,
    ci40Coverage: initialData.ci40Coverage || 25000,
    cancerCoverage: initialData.cancerCoverage || 25000,
    inSituCoverage: initialData.inSituCoverage || 12500,
    telemedicine: initialData.telemedicine !== undefined ? initialData.telemedicine : true
  });

  // Update coverages when package changes
  const handlePackageChange = (pkg) => {
    const packageData = ML_CARE_PACKAGES[pkg];
    if (pkg !== 'Персонализиран') {
      setFormData(prev => ({
        ...prev,
        package: pkg,
        disabilityCoverage: packageData.disability,
        ptdCoverage: packageData.ptd,
        ci40Coverage: packageData.ci40,
        cancerCoverage: packageData.cancer,
        inSituCoverage: packageData.inSitu
      }));
    } else {
      setFormData(prev => ({ ...prev, package: pkg }));
    }
  };

  // Calculate premium breakdown
  const premiumBreakdown = useMemo(() => {
    const breakdown = {
      coverages: {},
      warnings: [],
      errors: []
    };
    const age = formData.age;
    const riskClass = formData.riskClass;
    const ageRates = METLIFE_CARE_AGE_RATES[age] || METLIFE_CARE_AGE_RATES[65];

    // 1. Disability (over 50% from illness AND accident)
    if (formData.disabilityCoverage > 0) {
      if (formData.disabilityCoverage < 3000) {
        breakdown.warnings.push('Минималният размер на покритието ТЗР над 50% е 3 000 €');
      }
      breakdown.coverages.disability = {
        name: 'Трайна загуба на работоспособност над 50% (заболяване и злополука)',
        coverage: formData.disabilityCoverage,
        rate: ageRates.disability,
        premium: (formData.disabilityCoverage / 1000) * ageRates.disability,
        info: 'Минималният размер на застрахователната сума по покритието е 3 000 €'
      };
    }

    // 2. PTD from accident (requires accidental death coverage - in this context it's linked)
    if (formData.ptdCoverage > 0) {
      const riskData = METLIFE_PA_RISK_CLASSES[riskClass];
      breakdown.coverages.ptd = {
        name: 'Пълна/Частична Трайна Нетрудоспособност от злополука',
        coverage: formData.ptdCoverage,
        rate: riskData.pi,
        premium: (formData.ptdCoverage / 1000) * riskData.pi,
        info: 'Това покритие не може да се предостави без покритието Смърт вследствие на злополука'
      };
    }

    // 3. 40 Critical Illnesses
    if (formData.ci40Coverage > 0) {
      if (age < 18 || age > 65) {
        breakdown.errors.push('40 Тежки заболявания: допустима възраст 18-65 години');
      } else {
        breakdown.coverages.ci40 = {
          name: '40 Тежки Заболявания',
          coverage: formData.ci40Coverage,
          rate: ageRates.ci40,
          premium: (formData.ci40Coverage / 1000) * ageRates.ci40,
          info: 'Допустима възраст при сключване 18-65 години'
        };
      }
    }

    // 4. Cancer
    if (formData.cancerCoverage > 0) {
      if (age < 18 || age > 69) {
        breakdown.errors.push('Злокачествени новообразувания - Рак: допустима възраст 18-69 години');
      } else {
        breakdown.coverages.cancer = {
          name: 'Злокачествени новообразувания - Рак',
          coverage: formData.cancerCoverage,
          rate: ageRates.cancer,
          premium: (formData.cancerCoverage / 1000) * ageRates.cancer,
          info: 'Допустима възраст при сключване 18-69 години'
        };
      }
    }

    // 5. Carcinoma in Situ
    if (formData.inSituCoverage > 0) {
      if (age < 18 || age > 64) {
        breakdown.errors.push('Карцином ин ситу: допустима възраст 18-64 години');
      } else {
        breakdown.coverages.inSitu = {
          name: 'Тежко Заболяване - Карцином ин ситу',
          coverage: formData.inSituCoverage,
          rate: ageRates.inSitu,
          premium: (formData.inSituCoverage / 1000) * ageRates.inSitu,
          info: 'Допустима възраст при сключване 18-64 години'
        };
      }
    }

    // 6. Telemedicine (age < 65)
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
    const netPremium = Object.values(breakdown.coverages).reduce((sum, c) => sum + (c.premium || 0), 0);
    const insuranceTax = netPremium * 0.02; // 2% insurance tax
    
    breakdown.netPremium = netPremium;
    breakdown.insuranceTax = insuranceTax;
    breakdown.annualPremium = netPremium + insuranceTax;
    breakdown.semiAnnualPremium = breakdown.annualPremium * 0.51;
    breakdown.quarterlyPremium = breakdown.annualPremium * 0.26;

    // Minimum premium check
    if (breakdown.annualPremium > 0 && breakdown.annualPremium < 50) {
      breakdown.warnings.push('Минималната годишна премия е 50€');
    }
    if (breakdown.semiAnnualPremium > 0 && breakdown.semiAnnualPremium < 25) {
      breakdown.warnings.push('Полугодишно плащане не е приложимо при тази премия');
    }
    if (breakdown.quarterlyPremium > 0 && breakdown.quarterlyPremium < 25) {
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
        product_name: 'MetLife Грижа',
        product_type: 'health_insurance',
        beneficiary_name: formData.clientName,
        beneficiary_age: formData.age,
        monthly_premium: premiumBreakdown.annualPremium / 12,
        annual_premium: premiumBreakdown.annualPremium,
        coverage_amount: formData.disabilityCoverage,
        risk_class: formData.riskClass,
        offer_status: 'generated',
        ai_recommendation_reason: `Здравна застраховка пакет ${formData.package}`
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
      <Card className="bg-gradient-to-r from-teal-600 to-teal-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/d26d48d16_image.png" 
              alt="MetLife" 
              className="h-10 bg-white rounded-lg px-3 py-1"
            />
            <div>
              <CardTitle className="text-white">Калкулатор за изчисляване на цена на Метлайф Грижа</CardTitle>
              <p className="text-teal-100 text-sm">MetLife Care - Здравна застраховка</p>
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
            <CardHeader className="bg-teal-50 py-3">
              <CardTitle className="text-base text-teal-800">Данни за кандидата за застраховане</CardTitle>
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
                    min={18}
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
              <div>
                <Label>Пакет</Label>
                <Select value={formData.package} onValueChange={handlePackageChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Бронзов">Бронзов</SelectItem>
                    <SelectItem value="Сребърен">Сребърен</SelectItem>
                    <SelectItem value="Златен">Златен</SelectItem>
                    <SelectItem value="Платинен">Платинен</SelectItem>
                    <SelectItem value="Персонализиран">Персонализиран</SelectItem>
                  </SelectContent>
                </Select>
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
              {/* Disability */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <Label className="text-sm">ТЗР над 50% (заболяване и злополука)</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    value={formData.disabilityCoverage}
                    onChange={(e) => handleInputChange('disabilityCoverage', parseFloat(e.target.value) || 0)}
                    min={0}
                    disabled={formData.package !== 'Персонализиран'}
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
                    disabled={formData.package !== 'Персонализиран'}
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
                    value={formData.ci40Coverage}
                    onChange={(e) => handleInputChange('ci40Coverage', parseFloat(e.target.value) || 0)}
                    min={0}
                    disabled={formData.package !== 'Персонализиран'}
                  />
                  <span className="text-sm text-slate-600">€</span>
                </div>
              </div>

              {/* Cancer */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <Label className="text-sm">Злокачествени новообразувания - Рак</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    value={formData.cancerCoverage}
                    onChange={(e) => handleInputChange('cancerCoverage', parseFloat(e.target.value) || 0)}
                    min={0}
                    disabled={formData.package !== 'Персонализиран'}
                  />
                  <span className="text-sm text-slate-600">€</span>
                </div>
              </div>

              {/* Carcinoma in Situ */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <Label className="text-sm">Карцином ин ситу</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    value={formData.inSituCoverage}
                    onChange={(e) => handleInputChange('inSituCoverage', parseFloat(e.target.value) || 0)}
                    min={0}
                    disabled={formData.package !== 'Персонализиран'}
                  />
                  <span className="text-sm text-slate-600">€</span>
                </div>
              </div>

              {/* Telemedicine */}
              <div className="flex items-center justify-between py-2 border-t">
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
            <CardHeader className="bg-teal-600 py-3">
              <CardTitle className="text-base text-white">Обобщение на цената</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Обща нетна цена на застрахователния план:</span>
                <span className="font-semibold">{premiumBreakdown.netPremium.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Застр. Данък 2%:</span>
                <span className="font-semibold">{premiumBreakdown.insuranceTax.toFixed(2)} € /година</span>
              </div>
              
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-lg font-bold text-teal-700">
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

              {premiumBreakdown.annualPremium > 0 && premiumBreakdown.annualPremium < 50 && (
                <div className="mt-3 p-2 bg-red-50 rounded text-red-700 text-sm">
                  Минималната годишна премия е 50€
                </div>
              )}
            </CardContent>
          </Card>

          {analysisId && (
            <Button 
              onClick={handleSaveOffer} 
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={premiumBreakdown.errors.length > 0 || saving}
            >
              <Save className="w-4 w-4 mr-2" />
              {saving ? 'Записване...' : 'Запази офертата'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}