import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Home, Shield, CheckCircle2, Save } from 'lucide-react';
import {
  INSTINCT_PACKAGES,
  INSTINCT_PACKAGE_COVERAGES,
  INSTINCT_COVERAGES,
  INSTINCT_RULES,
  INSTINCT_COVERAGE_COEFFICIENTS,
  calculateInstinctHomePremium,
  EUR_BGN_RATE
} from './InstinctHomeConstants';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function InstinctHomeCalculator({ initialData = {}, onSave, analysisId, clientId }) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    clientName: initialData.clientName || '',
    address: initialData.address || '',
    packageType: initialData.packageType || 'Пакет 2',
    customSum: initialData.customSum || 100000,
    currency: initialData.currency || 'BGN',
    includeSport: initialData.includeSport || false
  });

  // Calculate premium
  const result = useMemo(() => {
    if (formData.packageType === 'Персонализиран') {
      return calculateInstinctHomePremium(formData.customSum, 'custom', formData.includeSport);
    }
    return calculateInstinctHomePremium(0, formData.packageType, formData.includeSport);
  }, [formData.packageType, formData.customSum, formData.includeSport]);

  // Get coverage details
  const coverageDetails = useMemo(() => {
    if (formData.packageType === 'Пакет 1') return INSTINCT_PACKAGE_COVERAGES.package_1;
    if (formData.packageType === 'Пакет 2') return INSTINCT_PACKAGE_COVERAGES.package_2;
    if (formData.packageType === 'Пакет 3') return INSTINCT_PACKAGE_COVERAGES.package_3;
    return null;
  }, [formData.packageType]);

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
        provider: 'Инстинкт',
        product_name: 'Закрила на дома',
        product_type: 'property_insurance',
        beneficiary_name: formData.clientName,
        monthly_premium: formData.currency === 'EUR' ? result.monthlyPremiumEUR : result.monthlyPremiumBGN,
        annual_premium: formData.currency === 'EUR' ? result.annualPremiumEUR : result.annualPremiumBGN,
        coverage_amount: result.sumInsured,
        offer_status: 'generated',
        ai_recommendation_reason: `Имуществена застраховка ${formData.packageType} - всички рискове`
      });
      
      toast.success('Офертата е запазена успешно');
      if (onSave) onSave(formData, result);
    } catch (error) {
      toast.error('Грешка при записване: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-purple-700 overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">Инстинкт - Закрила на дома</CardTitle>
              <p className="text-purple-100 text-sm">Имуществена застраховка за жилища</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Input */}
        <div className="space-y-6">
          {/* Client Data */}
          <Card>
            <CardHeader className="bg-purple-50 py-3">
              <CardTitle className="text-base text-purple-800">Данни за застрахования</CardTitle>
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
                <Label>Адрес на имота</Label>
                <Input 
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Адрес"
                />
              </div>
            </CardContent>
          </Card>

          {/* Package Selection */}
          <Card>
            <CardHeader className="bg-blue-50 py-3">
              <CardTitle className="text-base text-blue-800">Пакет на покритие</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <Label>Изберете пакет</Label>
                <Select value={formData.packageType} onValueChange={(v) => handleInputChange('packageType', v)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Пакет 1">Пакет 1 (50,000 EUR)</SelectItem>
                    <SelectItem value="Пакет 2">Пакет 2 (100,000 EUR)</SelectItem>
                    <SelectItem value="Пакет 3">Пакет 3 (150,000 EUR)</SelectItem>
                    <SelectItem value="Персонализиран">Персонализиран</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.packageType === 'Персонализиран' && (
                <div>
                  <Label>Застрахователна сума (BGN)</Label>
                  <Input 
                    type="number"
                    value={formData.customSum}
                    onChange={(e) => handleInputChange('customSum', parseInt(e.target.value) || 0)}
                    min={50000}
                    max={500000}
                    step={1000}
                    className="mt-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    От 50,000 до 500,000 BGN (≈ 25,500 до 255,000 EUR)
                  </p>
                </div>
              )}

              <div>
                <Label>Валута за показване</Label>
                <Select value={formData.currency} onValueChange={(v) => handleInputChange('currency', v)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BGN">BGN (Лева)</SelectItem>
                    <SelectItem value="EUR">EUR (Евро)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox"
                  id="sport"
                  checked={formData.includeSport}
                  onChange={(e) => handleInputChange('includeSport', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="sport" className="text-sm cursor-pointer">
                  Включи спортна екипировка (опция)
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Output */}
        <div className="space-y-6">
          {/* Premium Summary */}
          <Card>
            <CardHeader className="bg-purple-600 py-3">
              <CardTitle className="text-base text-white">Оферта</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {!result?.eligible ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-700">{result?.reason}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Main Premium */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <p className="text-sm text-slate-600 mb-2">Годишна премия</p>
                    <p className="text-4xl font-bold text-purple-600">
                      {formData.currency === 'EUR' 
                        ? `${result.annualPremiumEUR.toFixed(2)} €`
                        : `${result.annualPremiumBGN.toFixed(2)} лв`
                      }
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                      или {formData.currency === 'EUR' 
                        ? `${result.monthlyPremiumEUR} €/месец`
                        : `${result.monthlyPremiumBGN} лв/месец`
                      }
                    </p>
                  </div>

                  {/* Premium Breakdown */}
                  {result.breakdown && (
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                      <p className="font-medium text-slate-800 mb-2">Разбивка на премията (BGN):</p>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Пожар и природни бедствия:</span>
                        <span className="font-medium">{result.breakdown.fire.toFixed(2)} лв</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Изтичане на вода:</span>
                        <span className="font-medium">{result.breakdown.water.toFixed(2)} лв</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Кражба:</span>
                        <span className="font-medium">{result.breakdown.theft.toFixed(2)} лв</span>
                      </div>
                      {result.breakdown.sport && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Спортна екипировка:</span>
                          <span className="font-medium">{result.breakdown.sport.toFixed(2)} лв</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-slate-600">Основна премия:</span>
                        <span className="font-semibold">{result.basePremium.toFixed(2)} лв</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Данък 2%:</span>
                        <span className="font-medium">{result.tax.toFixed(2)} лв</span>
                      </div>
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-2 text-sm border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Застрахователна сума:</span>
                      <span className="font-medium">
                        {result.sumInsured.toLocaleString()} BGN
                        <span className="text-xs text-slate-400 ml-1">
                          (≈ {Math.round(result.sumInsured / EUR_BGN_RATE).toLocaleString()} EUR)
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Пакет:</span>
                      <span className="font-medium">{formData.packageType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Срок:</span>
                      <span className="font-medium">12 месеца</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coverages */}
          {result?.eligible && coverageDetails && (
            <Card>
              <CardHeader className="bg-green-50 py-3">
                <CardTitle className="text-base text-green-800">Основни лимити на покритие</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1.5 border-b">
                    <span className="text-slate-700">Пожар - Недвижимо:</span>
                    <span className="font-semibold">{coverageDetails.property_fire.toLocaleString()} EUR</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b">
                    <span className="text-slate-700">Пожар - Движимо:</span>
                    <span className="font-semibold">{coverageDetails.contents_fire.toLocaleString()} EUR</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b">
                    <span className="text-slate-700">Гражданска отговорност:</span>
                    <span className="font-semibold">{coverageDetails.liability.toLocaleString()} EUR</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b">
                    <span className="text-slate-700">Земетресение - Недвижимо:</span>
                    <span className="font-semibold">{coverageDetails.earthquake_property.toLocaleString()} EUR</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b">
                    <span className="text-slate-700">Кражба (лимит):</span>
                    <span className="font-semibold">{coverageDetails.theft_limit.toLocaleString()} EUR</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-700">Временно настаняване:</span>
                    <span className="font-semibold">{coverageDetails.temporary_accommodation.toLocaleString()} EUR</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Coverages */}
          {result?.eligible && (
            <Card>
              <CardHeader className="bg-slate-50 py-3">
                <CardTitle className="text-base text-slate-800">Всички покрития</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 gap-2">
                  {INSTINCT_COVERAGES.map((coverage, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{coverage}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          {analysisId && result?.eligible && (
            <Button 
              onClick={handleSaveOffer} 
              disabled={saving}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Записване...' : 'Запази офертата'}
            </Button>
          )}
        </div>
      </div>

      {/* Provider Info */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-4 text-xs text-slate-600">
          <p className="font-medium text-slate-800 mb-2">ЗД "Инстинкт" АД</p>
          <p>Разрешение за застрахователна дейност № 180-ОЗ от 09.02.2023</p>
          <p>гр. София, бул. "Джавахарлал Неру" №28, "Силвър център", етаж 3</p>
          <p>Тел: 0700 20032 | Email: office@instinct-insurance.com</p>
        </CardContent>
      </Card>
    </div>
  );
}