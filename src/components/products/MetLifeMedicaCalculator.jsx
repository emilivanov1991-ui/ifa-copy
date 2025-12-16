import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Heart, Activity, CheckCircle2, AlertCircle, Globe, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * MetLife Medica Calculator
 * Calculates premiums for critical illness + accident coverage
 */
export default function MetLifeMedicaCalculator({ initialInputs = {}, analysisId, clientId }) {
  const [inputs, setInputs] = useState({
    age: initialInputs.age || 35,
    coverageType: initialInputs.coverageType || '32_critical_illnesses',
    plan: initialInputs.plan || '100000',
    riskClass: initialInputs.riskClass || '1',
    paymentFrequency: initialInputs.paymentFrequency || 'annual',
    ...initialInputs
  });

  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  // Configuration
  const config = {
    plans: {
      '50000': { label: 'Бронзов', amount: 50000 },
      '100000': { label: 'Сребърен', amount: 100000 },
      '150000': { label: 'Златен', amount: 150000 }
    },
    coverageTypes: {
      'cancer_only': 'Основен Пакет - Рак',
      '32_critical_illnesses': 'Разширен Пакет - 32 Тежки Заболявания'
    },
    riskClasses: {
      '1': { label: 'Клас I (Офис)', premium: 75 },
      '2': { label: 'Клас II (Среден)', premium: 125 },
      '3': { label: 'Клас III (Висок)', premium: 200 }
    },
    paymentFrequency: {
      'annual': { label: 'Годишно', multiplier: 1.00 },
      'semiannual': { label: 'Полугодишно', multiplier: 1.02 },
      'quarterly': { label: 'Тримесечно', multiplier: 1.04 }
    }
  };

  // Tariff tables (from documents - in EUR)
  const tariffs = {
    cancer_only: {
      '18-25': { '50000': 34, '100000': 68, '150000': 102 },
      '26-30': { '50000': 56, '100000': 112, '150000': 168 },
      '31-35': { '50000': 107, '100000': 213, '150000': 320 },
      '36-40': { '50000': 166, '100000': 332, '150000': 498 },
      '41-45': { '50000': 279, '100000': 558, '150000': 837 },
      '46-50': { '50000': 453, '100000': 905, '150000': 1358 },
      '51-55': { '50000': 698, '100000': 1395, '150000': 2093 },
      '56-60': { '50000': 988, '100000': 1976, '150000': 2964 },
      '61-64': { '50000': 1259, '100000': 2518, '150000': 3777 }
    },
    '32_critical_illnesses': {
      '18-25': { '50000': 57, '100000': 114, '150000': 171 },
      '26-30': { '50000': 96, '100000': 191, '150000': 287 },
      '31-35': { '50000': 182, '100000': 364, '150000': 546 },
      '36-40': { '50000': 290, '100000': 579, '150000': 869 },
      '41-45': { '50000': 500, '100000': 1000, '150000': 1500 },
      '46-50': { '50000': 835, '100000': 1670, '150000': 2505 },
      '51-55': { '50000': 1350, '100000': 2699, '150000': 4049 },
      '56-60': { '50000': 1979, '100000': 3958, '150000': 5937 },
      '61-64': { '50000': 2700, '100000': 5400, '150000': 8100 }
    }
  };

  const telemedicineFee = 15; // Fixed annual fee

  // Calculate premium
  useEffect(() => {
    const { age, coverageType, plan, riskClass, paymentFrequency } = inputs;

    if (!age || age < 18 || age > 64) {
      setResult({ eligible: false, reason: 'Възрастта трябва да бъде между 18 и 64 години' });
      return;
    }

    // Find age bracket
    let ageBracket = null;
    if (age >= 18 && age <= 25) ageBracket = '18-25';
    else if (age >= 26 && age <= 30) ageBracket = '26-30';
    else if (age >= 31 && age <= 35) ageBracket = '31-35';
    else if (age >= 36 && age <= 40) ageBracket = '36-40';
    else if (age >= 41 && age <= 45) ageBracket = '41-45';
    else if (age >= 46 && age <= 50) ageBracket = '46-50';
    else if (age >= 51 && age <= 55) ageBracket = '51-55';
    else if (age >= 56 && age <= 60) ageBracket = '56-60';
    else if (age >= 61 && age <= 64) ageBracket = '61-64';

    if (!ageBracket) {
      setResult({ eligible: false, reason: 'Няма тарифа за тази възраст' });
      return;
    }

    // Get critical illness premium
    const criticalIllnessPremium = tariffs[coverageType][ageBracket][plan];

    // Get accident coverage premiums
    const accidentDeathPremium = config.riskClasses[riskClass].premium;
    const accidentDisabilityPremium = config.riskClasses[riskClass].premium;

    // Base annual premium
    const baseAnnualPremium = criticalIllnessPremium + accidentDeathPremium + accidentDisabilityPremium + telemedicineFee;

    // Apply payment frequency multiplier
    const frequencyMultiplier = config.paymentFrequency[paymentFrequency].multiplier;
    const adjustedAnnualPremium = baseAnnualPremium * frequencyMultiplier;

    // Calculate payment per period
    let premiumPerPeriod = adjustedAnnualPremium;
    let periodsPerYear = 1;

    if (paymentFrequency === 'semiannual') {
      premiumPerPeriod = adjustedAnnualPremium / 2;
      periodsPerYear = 2;
    } else if (paymentFrequency === 'quarterly') {
      premiumPerPeriod = adjustedAnnualPremium / 4;
      periodsPerYear = 4;
    }

    setResult({
      eligible: true,
      coverageAmount: parseInt(plan),
      criticalIllnessPremium: Math.round(criticalIllnessPremium * 100) / 100,
      accidentDeathPremium: Math.round(accidentDeathPremium * 100) / 100,
      accidentDisabilityPremium: Math.round(accidentDisabilityPremium * 100) / 100,
      telemedicinePremium: telemedicineFee,
      baseAnnualPremium: Math.round(baseAnnualPremium * 100) / 100,
      annualPremium: Math.round(adjustedAnnualPremium * 100) / 100,
      premiumPerPeriod: Math.round(premiumPerPeriod * 100) / 100,
      periodsPerYear,
      currency: 'EUR',
      ageBracket,
      coverageTypeName: config.coverageTypes[coverageType],
      planName: config.plans[plan].label,
      riskClassName: config.riskClasses[riskClass].label,
      paymentFrequencyName: config.paymentFrequency[paymentFrequency].label
    });
  }, [inputs]);

  const handleSaveOffer = async () => {
    if (!analysisId || !result?.eligible) return;
    
    setSaving(true);
    try {
      await base44.entities.ProductOffer.create({
        analysis_id: analysisId,
        client_id: clientId,
        provider: 'MetLife',
        product_name: 'MetLife Медика',
        product_type: 'health_insurance',
        beneficiary_age: inputs.age,
        monthly_premium: result.annualPremium / 12,
        annual_premium: result.annualPremium,
        coverage_amount: result.coverageAmount,
        offer_status: 'generated',
        ai_recommendation_reason: `${result.coverageTypeName} - ${result.planName} план, ${result.riskClassName}`
      });
      
      toast.success('Офертата е запазена успешно');
    } catch (error) {
      toast.error('Грешка при записване: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/d26d48d16_image.png" 
              alt="MetLife" 
              className="h-10 bg-white rounded-lg px-3 py-1"
            />
            <div>
              <CardTitle className="text-xl">МетЛайф Медика</CardTitle>
              <p className="text-sm text-blue-100">Застраховка при тежки заболявания + WorldCare</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Параметри
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Age */}
            <div>
              <Label>Възраст</Label>
              <Input
                type="number"
                value={inputs.age}
                onChange={(e) => setInputs({ ...inputs, age: parseInt(e.target.value) })}
                placeholder="18 - 64"
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">От 18 до 64 години</p>
            </div>

            {/* Coverage Type */}
            <div>
              <Label>Тип покритие</Label>
              <RadioGroup
                value={inputs.coverageType}
                onValueChange={(value) => setInputs({ ...inputs, coverageType: value })}
                className="mt-2 space-y-2"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-slate-50 cursor-pointer">
                  <RadioGroupItem value="cancer_only" id="cancer" />
                  <Label htmlFor="cancer" className="cursor-pointer flex-1">
                    <div className="font-medium">Основен Пакет - Рак</div>
                    <div className="text-xs text-slate-500">Покритие само при диагностициран рак</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-slate-50 cursor-pointer border-blue-300 bg-blue-50">
                  <RadioGroupItem value="32_critical_illnesses" id="32ci" />
                  <Label htmlFor="32ci" className="cursor-pointer flex-1">
                    <div className="font-medium">Разширен Пакет - 32 Тежки Заболявания</div>
                    <div className="text-xs text-slate-500">Пълно покритие включително рак, инфаркт, инсулт и др.</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Plan */}
            <div>
              <Label>План (Застрахователна сума)</Label>
              <Select value={inputs.plan} onValueChange={(value) => setInputs({ ...inputs, plan: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(config.plans).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      {val.label} - {val.amount.toLocaleString()} EUR
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Risk Class */}
            <div>
              <Label>Рисков клас (Злополука)</Label>
              <Select value={inputs.riskClass} onValueChange={(value) => setInputs({ ...inputs, riskClass: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(config.riskClasses).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">I - офис работа, II - умерен риск, III - висок риск</p>
            </div>

            {/* Payment Frequency */}
            <div>
              <Label>Периодичност на плащане</Label>
              <Select value={inputs.paymentFrequency} onValueChange={(value) => setInputs({ ...inputs, paymentFrequency: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(config.paymentFrequency).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Оферта</CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <p className="text-slate-500 text-sm">Попълнете всички параметри</p>
            ) : !result.eligible ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-700 mb-2">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Неподходящ</span>
                </div>
                <p className="text-sm text-amber-600">{result.reason}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Main Premium */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <p className="text-sm text-slate-600 mb-2">Премия на {result.paymentFrequencyName.toLowerCase()}</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {result.premiumPerPeriod.toLocaleString('bg-BG', { minimumFractionDigits: 2 })} €
                  </p>
                  {result.paymentFrequencyName !== 'Годишно' && (
                    <p className="text-sm text-slate-500 mt-2">
                      × {result.periodsPerYear} = {result.annualPremium.toLocaleString('bg-BG')} € годишно
                    </p>
                  )}
                </div>

                {/* Breakdown */}
                <div className="space-y-2 text-sm border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">{result.coverageTypeName}:</span>
                    <span className="font-medium">{result.criticalIllnessPremium.toLocaleString('bg-BG')} €</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Смърт при злополука:</span>
                    <span className="font-medium">{result.accidentDeathPremium.toLocaleString('bg-BG')} €</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Трайна нетрудоспособност:</span>
                    <span className="font-medium">{result.accidentDisabilityPremium.toLocaleString('bg-BG')} €</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Телемедицина:</span>
                    <span className="font-medium">{result.telemedicinePremium} €</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t font-semibold">
                    <span>Годишна премия (основна):</span>
                    <span className="text-blue-600">{result.baseAnnualPremium.toLocaleString('bg-BG')} €</span>
                  </div>
                  {result.paymentFrequencyName !== 'Годишно' && (
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Надценка {result.paymentFrequencyName.toLowerCase()}:</span>
                      <span>+{((config.paymentFrequency[inputs.paymentFrequency].multiplier - 1) * 100).toFixed(0)}%</span>
                    </div>
                  )}
                </div>

                {/* Coverage Details */}
                <div className="bg-slate-50 rounded-lg p-4 border">
                  <p className="font-medium text-slate-900 mb-3">Покритие:</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Тежки заболявания:</span>
                      <span className="font-semibold">{result.coverageAmount.toLocaleString('bg-BG')} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Смърт злополука:</span>
                      <span className="font-semibold">{result.coverageAmount.toLocaleString('bg-BG')} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">ПТН злополука:</span>
                      <span className="font-semibold">{result.coverageAmount.toLocaleString('bg-BG')} €</span>
                    </div>
                  </div>
                </div>

                {/* WorldCare Badge */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-indigo-900 text-sm">WorldCare Телемедицина</p>
                      <p className="text-xs text-indigo-600 mt-1">
                        Второ медицинско мнение от топ специалисти в САЩ + асистиране за лечение в Германия
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Info */}
                <div className="space-y-2 text-xs text-slate-500 pt-2 border-t">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Чакателен период: 3 месеца</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Изплащане при преживяване на 30 дни след диагноза</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Световно покритие 24/7/365</span>
                  </div>
                </div>

                {/* Save Button */}
                {analysisId && (
                  <Button 
                    onClick={handleSaveOffer} 
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-base font-semibold mt-6"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {saving ? 'Записване...' : 'Запази офертата'}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Critical Illnesses List */}
      {result?.eligible && inputs.coverageType === '32_critical_illnesses' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">32 Покрити Тежки Заболявания</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              {[
                "Рак", "Сърдечен инфаркт", "Мозъчен инсулт", "Коронарна артерия - байпас",
                "Бъбречна недостатъчност", "Апластична анемия", "Слепота", "Белодробна недостатъчност",
                "Чернодробна недостатъчност", "Кома", "Глухота", "Кардиохирургия",
                "Загуба на говора", "Тежки изгаряния", "Трансплантация", "Множествена склероза",
                "Парализа", "Болест на Паркинсон", "Хирургия на аорта", "Болест на Алцхаймер",
                "Скоротечен хепатит", "Белодробна хипертония", "Терминално заболяване", "Мозъчен тумор",
                "Енцефалит", "Полиомиелит", "Бактериален менингит", "Травма на главата",
                "Апаличен синдром", "Коронарни заболявания", "Склеродермия", "Лупус еритематодес"
              ].map((illness, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{illness}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}