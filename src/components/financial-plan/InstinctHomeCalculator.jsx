import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Shield, CheckCircle2, Save, Grid3x3 } from 'lucide-react';
import {
  INSTINCT_PACKAGES,
  INSTINCT_PACKAGE_COVERAGES,
  INSTINCT_COVERAGES,
  INSTINCT_RULES,
  PROPERTY_SPLIT,
  calculateInstinctHomePremium,
  EUR_BGN_RATE
} from './InstinctHomeConstants';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import InstinctHomePackageComparison from './InstinctHomePackageComparison';

export default function InstinctHomeCalculator({ initialData = {}, onSave, analysisId, clientId }) {
  const [saving, setSaving] = useState(false);
  const [customSum, setCustomSum] = useState(76530); // ~150000 BGN in EUR
  const [formData, setFormData] = useState({
    clientName: initialData.clientName || '',
    address: initialData.address || '',
    packageType: initialData.packageType || 'Пакет 2',
    customSumEUR: initialData.customSumEUR || 51020, // ~100000 BGN in EUR
    includeSport: initialData.includeSport || false,
    includeRelocation: initialData.includeRelocation || false
  });
  
  const toEUR = (bgn) => Math.round(bgn / 1.96);

  // Calculate premium (custom sum stored in EUR, converted to BGN for engine)
  const result = useMemo(() => {
    const options = {
      includeSport: formData.includeSport,
      includeRelocation: formData.includeRelocation
    };
    if (formData.packageType === 'Персонализиран') {
      const bgnSum = Math.round(formData.customSumEUR * 1.96);
      return calculateInstinctHomePremium(bgnSum, 'custom', options);
    }
    return calculateInstinctHomePremium(0, formData.packageType, options);
  }, [formData.packageType, formData.customSumEUR, formData.includeSport, formData.includeRelocation]);

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
        monthly_premium: result.monthlyPremiumEUR,
        annual_premium: result.annualPremiumEUR,
        coverage_amount: toEUR(result.sumInsured),
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
      <Card className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 overflow-hidden shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <Home className="h-7 w-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-2xl font-bold tracking-wide">Инстинкт - Закрила на дома</CardTitle>
              <p className="text-purple-100 text-sm font-medium">Имуществена застраховка за жилища</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="comparison" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 bg-gradient-to-r from-purple-100 to-blue-100 p-1 rounded-lg">
          <TabsTrigger value="comparison" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300">
            <Grid3x3 className="h-4 w-4" />
            <span className="hidden sm:inline">Сравнение на пакетите</span>
            <span className="sm:hidden">Сравнение</span>
          </TabsTrigger>
          <TabsTrigger value="calculator" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300">
            <Shield className="h-4 w-4" />
            Калкулатор
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="mt-6">
          <InstinctHomePackageComparison 
            customSumEUR={customSum}
            onCustomSumEURChange={setCustomSum}
          />
        </TabsContent>

        <TabsContent value="calculator" className="mt-6">

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Input */}
        <div className="space-y-6">
          {/* Client Data */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 py-4">
              <CardTitle className="text-base text-purple-800 font-semibold">Данни за застрахования</CardTitle>
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
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 py-4">
              <CardTitle className="text-base text-blue-800 font-semibold">Пакет на покритие</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <Label>Изберете пакет</Label>
                <Select value={formData.packageType} onValueChange={(v) => handleInputChange('packageType', v)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Пакет 1">Пакет 1 (25,510 €)</SelectItem>
                    <SelectItem value="Пакет 2">Пакет 2 (51,020 €)</SelectItem>
                    <SelectItem value="Пакет 3">Пакет 3 (76,531 €)</SelectItem>
                    <SelectItem value="Персонализиран">Персонализиран</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.packageType === 'Персонализиран' && (
                <div>
                  <Label>Застрахователна сума (EUR)</Label>
                  <Input 
                    type="number"
                    value={formData.customSumEUR}
                    onChange={(e) => handleInputChange('customSumEUR', parseInt(e.target.value) || 0)}
                    min={25510}
                    max={255102}
                    step={500}
                    className="mt-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    От 25,510 до 255,102 €
                  </p>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="sport"
                    checked={formData.includeSport}
                    onChange={(e) => handleInputChange('includeSport', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="sport" className="text-sm cursor-pointer">
                    Спортна екипировка (опция)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="relocation"
                    checked={formData.includeRelocation}
                    onChange={(e) => handleInputChange('includeRelocation', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="relocation" className="text-sm cursor-pointer">
                    Транспорт при смяна на адрес (опция)
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Output */}
        <div className="space-y-6">
          {/* Premium Summary */}
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 py-4">
              <CardTitle className="text-base text-white font-semibold">Оферта</CardTitle>
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
                      {result.annualPremiumEUR.toFixed(2)} €
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                      или {result.monthlyPremiumEUR} €/месец
                    </p>
                  </div>

                  {/* Property Split */}
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
                    <p className="text-xs text-slate-600 mb-3">Разпределение на застрахователната сума:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">Недвижимо имущество</p>
                        <p className="text-lg font-bold text-blue-600">
                           {toEUR(result.immovable || 0).toLocaleString()} <span className="text-sm">€</span>
                          </p>
                          <p className="text-xs text-slate-400">85%</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg">
                          <p className="text-xs text-slate-500 mb-1">Движимо имущество</p>
                          <p className="text-lg font-bold text-purple-600">
                            {toEUR(result.movable || 0).toLocaleString()} <span className="text-sm">€</span>
                          </p>
                          <p className="text-xs text-slate-400">15%</p>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Застрахователна сума:</span>
                      <span className="font-medium">{toEUR(result.sumInsured).toLocaleString()} €</span>
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

          {/* Detailed Coverages */}
          {result?.eligible && result?.coverages && (
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 py-4">
                <CardTitle className="text-base text-green-800 font-semibold">Лимити на покритие (€)</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2 text-xs">
                  {/* Пожар */}
                  <div className="grid grid-cols-3 gap-2 py-1.5 border-b items-center">
                    <span className="text-slate-700 font-medium">Пожар:</span>
                    <span className="text-right text-blue-600">{toEUR(result.coverages.fire_immovable || 0).toLocaleString()} €</span>
                    <span className="text-right text-purple-600">{toEUR(result.coverages.fire_movable || 0).toLocaleString()} €</span>
                  </div>
                  
                  {/* Вода */}
                  <div className="grid grid-cols-3 gap-2 py-1.5 border-b items-center">
                    <span className="text-slate-700 font-medium">Вода:</span>
                    <span className="text-right text-blue-600">{toEUR(result.coverages.water_immovable || 0).toLocaleString()} €</span>
                    <span className="text-right text-purple-600">{toEUR(result.coverages.water_movable || 0).toLocaleString()} €</span>
                  </div>
                  
                  {/* Земетресение */}
                  <div className="grid grid-cols-3 gap-2 py-1.5 border-b items-center">
                    <span className="text-slate-700 font-medium">Земетресение:</span>
                    <span className="text-right text-blue-600">{toEUR(result.coverages.earthquake_immovable || 0).toLocaleString()} €</span>
                    <span className="text-right text-purple-600">{toEUR(result.coverages.earthquake_movable || 0).toLocaleString()} €</span>
                  </div>
                  
                  {/* Злоумишлени действия */}
                  <div className="grid grid-cols-3 gap-2 py-1.5 border-b items-center">
                    <span className="text-slate-700 font-medium">Вандализъм:</span>
                    <span className="text-right text-blue-600">{toEUR(result.coverages.vandalism_immovable || 0).toLocaleString()} €</span>
                    <span className="text-right text-purple-600">{toEUR(result.coverages.vandalism_movable || 0).toLocaleString()} €</span>
                  </div>
                  
                  {/* Стъкла */}
                  <div className="grid grid-cols-3 gap-2 py-1.5 border-b items-center">
                    <span className="text-slate-700 font-medium">Стъкла:</span>
                    <span className="text-right text-blue-600">{toEUR(result.coverages.glass_immovable || 0).toLocaleString()} €</span>
                    <span className="text-right text-purple-600">{toEUR(result.coverages.glass_movable || 0).toLocaleString()} €</span>
                  </div>
                  
                  {/* Кражба */}
                  <div className="grid grid-cols-3 gap-2 py-1.5 border-b items-center">
                    <span className="text-slate-700 font-medium">Кражба (общо):</span>
                    <span className="text-right font-semibold col-span-2">{toEUR(result.coverages.theft || 0).toLocaleString()} €</span>
                  </div>
                  
                  {/* Гражданска отговорност */}
                  <div className="grid grid-cols-3 gap-2 py-1.5 border-b items-center">
                    <span className="text-slate-700 font-medium">ГО:</span>
                    <span className="text-right font-semibold col-span-2">{toEUR(result.coverages.liability || 0).toLocaleString()} €</span>
                  </div>
                  
                  {/* Временно настаняване */}
                  <div className="grid grid-cols-3 gap-2 py-1.5 items-center">
                    <span className="text-slate-700 font-medium">Настаняване:</span>
                    <span className="text-right font-semibold col-span-2">{toEUR(result.coverages.temporary_accommodation || 0).toLocaleString()} €</span>
                  </div>
                  
                  {/* Legend */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t text-xs">
                    <span></span>
                    <span className="text-right text-blue-600 font-medium">Недвижимо</span>
                    <span className="text-right text-purple-600 font-medium">Движимо</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Coverages */}
          {result?.eligible && (
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 py-4">
                <CardTitle className="text-base text-slate-800 font-semibold">Всички покрития</CardTitle>
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
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-base font-semibold"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? 'Записване...' : 'Запази офертата'}
            </Button>
          )}
        </div>
      </div>

      {/* Provider Info */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 shadow-md">
        <CardContent className="pt-5 pb-5 text-xs text-slate-600">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
            <div className="space-y-1">
              <p className="font-bold text-slate-800 text-sm">ЗД "Инстинкт" АД</p>
              <p className="leading-relaxed">Разрешение за застрахователна дейност № 180-ОЗ от 09.02.2023</p>
              <p className="leading-relaxed">гр. София, бул. "Джавахарлал Неру" №28, "Силвър център", етаж 3</p>
              <p className="leading-relaxed font-medium text-purple-700">Тел: 0700 20032 | Email: office@instinct-insurance.com</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </TabsContent>
      </Tabs>
    </div>
  );
}