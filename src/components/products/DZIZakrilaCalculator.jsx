import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Save, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const config = {
  "productName": "ДЗИ Закрила",
  "provider": "ДЗИ - Общо застраховане ЕАД",
  "productType": "personal_accident",
  "description": "Индивидуална застраховка злополука с покритие при смърт, инвалидност, фрактури и изгаряния",
  "ageRestrictions": {
    "minAge": 16,
    "maxAge": 69,
    "coverageEndsAt": 70
  },
  "territorialCoverage": "България и чужбина",
  "packages": {
    "silver": {
      "name": "Сребърен пакет",
      "coverages": {
        "deathAccident": 20000,
        "deathRTA": 30000,
        "disabilityAccident": 20000,
        "disabilityRTA": 30000,
        "temporaryDisability": 2000,
        "fracturesAndBurns": 8000,
        "surgicalTreatment": 1000,
        "hospitalDaily": 10
      },
      "premiums": {
        "monthly": 10,
        "quarterly": 30,
        "semiAnnual": 60,
        "annual": 120
      },
      "maxPolicies": 3
    },
    "gold": {
      "name": "Златен пакет",
      "coverages": {
        "deathAccident": 30000,
        "deathRTA": 50000,
        "disabilityAccident": 30000,
        "disabilityRTA": 50000,
        "temporaryDisability": 5000,
        "fracturesAndBurns": 10000,
        "surgicalTreatment": 3000,
        "hospitalDaily": 30
      },
      "premiums": {
        "monthly": 15,
        "quarterly": 45,
        "semiAnnual": 90,
        "annual": 180
      },
      "maxPolicies": 2
    },
    "platinum": {
      "name": "Платинен пакет",
      "coverages": {
        "deathAccident": 50000,
        "deathRTA": 75000,
        "disabilityAccident": 50000,
        "disabilityRTA": 75000,
        "temporaryDisability": 10000,
        "fracturesAndBurns": 20000,
        "surgicalTreatment": 10000,
        "hospitalDaily": 100
      },
      "premiums": {
        "monthly": 30,
        "quarterly": 90,
        "semiAnnual": 180,
        "annual": 360
      },
      "maxPolicies": 1
    }
  },
  "coverageDetails": {
    "deathAccident": {
      "name": "Смърт вследствие на злополука",
      "description": "Трудова или битова злополука"
    },
    "deathRTA": {
      "name": "Смърт вследствие на ПТП",
      "description": "Пътно-транспортно произшествие"
    },
    "disabilityAccident": {
      "name": "Инвалидност над 50% вследствие на злополука",
      "description": "Процент от застрахователната сума според ЦЗМК на ДЗИ",
      "note": "Не се акумулира с покритието за ПТП"
    },
    "disabilityRTA": {
      "name": "Инвалидност над 50% вследствие на ПТП",
      "description": "Процент от застрахователната сума според ЦЗМК на ДЗИ",
      "note": "Не се акумулира с покритието за злополука"
    },
    "temporaryDisability": {
      "name": "Временна неработоспособност вследствие на злополука",
      "description": "Процентно обезщетение според продължителност",
      "percentages": {
        "20-40days": 5,
        "40-60days": 8,
        "60-90days": 10,
        "over90days": 15
      }
    },
    "fracturesAndBurns": {
      "name": "Счупени кости и изгаряния",
      "description": "Според схемата на обезщетенията",
      "maxEvents": 2,
      "note": "Максимум 2 събития в застрахователната година"
    },
    "surgicalTreatment": {
      "name": "Суми за оперативно лечение",
      "description": "Според хирургическата таблица на ДЗИ"
    },
    "hospitalDaily": {
      "name": "Дневни пари за болничен престой",
      "maxDaysPerStay": 20,
      "maxDaysPerYear": 30,
      "description": "До 20 дни еднократен престой, не повече от 30 дни годишно"
    }
  },
  "exclusions": [
    "Самоубийство или опит за самоубийство",
    "Умишлено извършване или опит за извършване на престъпление",
    "Употреба на алкохол, наркотици, опиати, стимулатори, допинг",
    "Температурни влияния (измръзване, слънчеви изгаряния, топлинен удар)",
    "Умишлено самонараняване или излагане на опасност",
    "Остеопороза или патологична фрактура при диагностицирана преди застраховката остеопороза"
  ],
  "taxIncluded": true,
  "taxRate": 0.02,
  "currency": "BGN"
};

export default function DZIZakrilaCalculator({ analysisId, clientId }) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    age: 30,
    packageType: 'gold',
    paymentFrequency: 'annual'
  });

  // Calculate offer
  const result = useMemo(() => {
    const { age, packageType, paymentFrequency } = formData;
    
    // Age validation
    if (age < config.ageRestrictions.minAge || age > config.ageRestrictions.maxAge) {
      return {
        eligible: false,
        reason: `Застраховката е достъпна за лица от ${config.ageRestrictions.minAge} до ${config.ageRestrictions.maxAge} години`
      };
    }

    const packageData = config.packages[packageType];
    const premium = packageData.premiums[paymentFrequency];
    
    return {
      eligible: true,
      packageName: packageData.name,
      coverages: packageData.coverages,
      premium: premium,
      paymentFrequency: paymentFrequency,
      maxPolicies: packageData.maxPolicies,
      monthlyEquivalent: packageData.premiums.monthly
    };
  }, [formData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveOffer = async () => {
    if (!analysisId || !result?.eligible) return;
    
    setSaving(true);
    try {
      await base44.entities.ProductOffer.create({
        analysis_id: analysisId,
        client_id: clientId,
        provider: config.provider,
        product_name: config.productName,
        product_type: config.productType,
        beneficiary_name: formData.clientName,
        beneficiary_age: formData.age,
        monthly_premium: result.monthlyEquivalent,
        annual_premium: result.coverages.deathAccident > 0 ? result.premium * (formData.paymentFrequency === 'annual' ? 1 : formData.paymentFrequency === 'semiAnnual' ? 2 : formData.paymentFrequency === 'quarterly' ? 4 : 12) : 0,
        coverage_amount: result.coverages.deathAccident,
        offer_status: 'generated',
        ai_recommendation_reason: `Застраховка злополука ${result.packageName} с покритие при смърт, инвалидност, фрактури и хоспитализация`
      });
      
      toast.success('Офертата е запазена успешно');
    } catch (error) {
      toast.error('Грешка при записване: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const frequencyLabels = {
    monthly: 'Месечна',
    quarterly: 'Тримесечна',
    semiAnnual: 'Шестмесечна',
    annual: 'Годишна'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 overflow-hidden shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/2485fdb3e_image.png" 
              alt="ДЗИ" 
              className="h-12 bg-white px-4 py-2 rounded-xl shadow-lg"
            />
            <div>
              <CardTitle className="text-white text-2xl font-bold tracking-wide">{config.productName}</CardTitle>
              <p className="text-blue-100 text-sm font-medium">{config.description}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error/Warning Messages */}
      {!result?.eligible && (
        <Card className="border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm font-medium">{result?.reason}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Input */}
        <div className="space-y-6">
          {/* Client Data */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 py-4">
              <CardTitle className="text-base text-blue-800 font-semibold">Данни за застрахования</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <Label>Застраховано лице</Label>
                <Input 
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Име на клиента"
                />
              </div>
              <div>
                <Label>Възраст ({config.ageRestrictions.minAge}-{config.ageRestrictions.maxAge} години)</Label>
                <Input 
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                  min={config.ageRestrictions.minAge}
                  max={config.ageRestrictions.maxAge}
                />
              </div>
            </CardContent>
          </Card>

          {/* Package Selection */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 py-4">
              <CardTitle className="text-base text-indigo-800 font-semibold">Избор на пакет</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <Label>Пакет на покритие</Label>
                <Select value={formData.packageType} onValueChange={(v) => handleInputChange('packageType', v)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="silver">Сребърен пакет</SelectItem>
                    <SelectItem value="gold">Златен пакет</SelectItem>
                    <SelectItem value="platinum">Платинен пакет</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Честота на плащане</Label>
                <Select value={formData.paymentFrequency} onValueChange={(v) => handleInputChange('paymentFrequency', v)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Месечна</SelectItem>
                    <SelectItem value="quarterly">Тримесечна</SelectItem>
                    <SelectItem value="semiAnnual">Шестмесечна</SelectItem>
                    <SelectItem value="annual">Годишна</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Product Info */}
          <Card className="shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
            <CardHeader className="py-4">
              <CardTitle className="text-sm text-slate-700 font-semibold flex items-center gap-2">
                <Info className="h-4 w-4" />
                Информация за продукта
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-2">
              <p><strong>Териториално покритие:</strong> {config.territorialCoverage}</p>
              <p><strong>Срок на застраховката:</strong> Неопределен, до навършване на {config.ageRestrictions.coverageEndsAt} години</p>
              <p><strong>Данък:</strong> Включен {config.taxRate * 100}% данък</p>
              {result?.eligible && (
                <p className="text-amber-700 font-medium mt-3">
                  <strong>Максимален брой полици:</strong> До {result.maxPolicies} {result.maxPolicies === 1 ? 'полица' : 'полици'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Output */}
        <div className="space-y-6">
          {result?.eligible && (
            <>
              {/* Premium Summary */}
              <Card className="shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 py-4">
                  <CardTitle className="text-base text-white font-bold">Застрахователна оферта</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <p className="text-sm text-slate-600 mb-2">{frequencyLabels[result.paymentFrequency]} премия</p>
                    <p className="text-4xl font-bold text-blue-600">
                      {result.premium.toFixed(2)} лв
                    </p>
                    {result.paymentFrequency !== 'monthly' && (
                      <p className="text-sm text-slate-500 mt-2">
                        или {result.monthlyEquivalent.toFixed(2)} лв/месец
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 text-sm border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Пакет:</span>
                      <span className="font-medium">{result.packageName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Възраст:</span>
                      <span className="font-medium">{formData.age} години</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Coverages */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 py-4">
                  <CardTitle className="text-base text-green-800 font-semibold">Застрахователни покрития</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-sm p-3 bg-white rounded-lg border border-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">Смърт вследствие на злополука</div>
                        <div className="text-slate-600">{result.coverages.deathAccident.toLocaleString()} лв</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm p-3 bg-white rounded-lg border border-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">Смърт вследствие на ПТП</div>
                        <div className="text-slate-600">{result.coverages.deathRTA.toLocaleString()} лв</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm p-3 bg-white rounded-lg border border-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">Инвалидност над 50% от злополука</div>
                        <div className="text-slate-600">{result.coverages.disabilityAccident.toLocaleString()} лв</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm p-3 bg-white rounded-lg border border-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">Инвалидност над 50% от ПТП</div>
                        <div className="text-slate-600">{result.coverages.disabilityRTA.toLocaleString()} лв</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm p-3 bg-white rounded-lg border border-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">Временна неработоспособност</div>
                        <div className="text-slate-600">До {result.coverages.temporaryDisability.toLocaleString()} лв (5-15% според дни)</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm p-3 bg-white rounded-lg border border-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">Счупени кости и изгаряния</div>
                        <div className="text-slate-600">До {result.coverages.fracturesAndBurns.toLocaleString()} лв (макс. 2 събития/год.)</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm p-3 bg-white rounded-lg border border-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">Оперативно лечение</div>
                        <div className="text-slate-600">До {result.coverages.surgicalTreatment.toLocaleString()} лв</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm p-3 bg-white rounded-lg border border-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">Дневни пари за болничен престой</div>
                        <div className="text-slate-600">{result.coverages.hospitalDaily} лв/ден (макс. 30 дни/год.)</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              {analysisId && (
                <Button 
                  onClick={handleSaveOffer} 
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-base font-semibold"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {saving ? 'Записване...' : 'Запази офертата'}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Provider Info */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 shadow-md">
        <CardContent className="pt-5 pb-5 text-xs text-slate-600">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
            <div className="space-y-1">
              <p className="font-bold text-slate-800 text-sm">{config.provider}</p>
              <p className="leading-relaxed">Застраховка злополука с покритие на територията на {config.territorialCoverage}</p>
              <p className="leading-relaxed font-medium text-blue-700">Тел: 0700 16 166 | Email: clients@dzi.bg | www.dzi.bg</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}