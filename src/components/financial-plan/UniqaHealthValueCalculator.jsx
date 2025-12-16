import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Heart, CheckCircle2, Save, Globe, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { calculateUniqaHealthValue, UNIQA_HEALTH_VALUE_RULES } from './UniqaHealthValueConstants';

export default function UniqaHealthValueCalculator({ initialData = {}, onSave, analysisId, clientId }) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    clientName: initialData.clientName || '',
    age: initialData.age || 35,
    plan: initialData.plan || 'europa',
    frequency: initialData.frequency || 'annual'
  });

  // Calculate premium
  const result = useMemo(() => {
    return calculateUniqaHealthValue(formData.age, formData.plan, formData.frequency);
  }, [formData.age, formData.plan, formData.frequency]);

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
        provider: 'УНИКА',
        product_name: 'Здраве и ценност Селект',
        product_type: 'critical_illness',
        beneficiary_name: formData.clientName,
        beneficiary_age: formData.age,
        monthly_premium: result.premiums.monthly,
        annual_premium: result.premiums.annual,
        coverage_amount: result.maxCoverage,
        offer_status: 'generated',
        ai_recommendation_reason: `Здравна застраховка ${result.plan} за критични заболявания при болничен престой`
      });
      
      toast.success('Офертата е запазена успешно');
      if (onSave) onSave(formData, result);
    } catch (error) {
      toast.error('Грешка при записване: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const frequencyLabels = {
    monthly: 'Месечно',
    quarterly: 'Тримесечно',
    semiannual: 'Шестмесечно',
    annual: 'Годишно'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 overflow-hidden shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="h-7 w-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-2xl font-bold tracking-wide">УNIKA Здраве и ценност Селект</CardTitle>
              <p className="text-blue-100 text-sm font-medium">Лечение на критични заболявания при болничен престой</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Input */}
        <div className="space-y-6">
          {/* Client Data */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 py-4">
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
                <Label>Възраст</Label>
                <Input 
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                  min={UNIQA_HEALTH_VALUE_RULES.min_age}
                  max={UNIQA_HEALTH_VALUE_RULES.max_age}
                />
                <p className="text-xs text-slate-500 mt-1">
                  От {UNIQA_HEALTH_VALUE_RULES.min_age} до {UNIQA_HEALTH_VALUE_RULES.max_age} години
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Plan Selection */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 py-4">
              <CardTitle className="text-base text-cyan-800 font-semibold">План и плащане</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <Label>План на покритие</Label>
                <Select value={formData.plan} onValueChange={(v) => handleInputChange('plan', v)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="europa">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        План Европа (2.24M EUR)
                      </div>
                    </SelectItem>
                    <SelectItem value="world">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-cyan-600" />
                        План Свят (2.80M EUR)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Честота на плащане</Label>
                <Select value={formData.frequency} onValueChange={(v) => handleInputChange('frequency', v)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Годишно</SelectItem>
                    <SelectItem value="semiannual">Шестмесечно</SelectItem>
                    <SelectItem value="quarterly">Тримесечно</SelectItem>
                    <SelectItem value="monthly">Месечно</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Output */}
        <div className="space-y-6">
          {/* Premium Summary */}
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 py-4">
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
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-6 border border-blue-200">
                    <p className="text-sm text-slate-600 mb-2">{frequencyLabels[formData.frequency]} премия</p>
                    <p className="text-4xl font-bold text-blue-600">
                      {result.selectedPremium.toFixed(2)} €
                    </p>
                  </div>

                  {/* All Premiums */}
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-xs font-medium text-slate-700 mb-3">Всички опции за плащане:</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Годишно:</span>
                        <span className="font-medium">{result.premiums.annual.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Шестмесечно:</span>
                        <span className="font-medium">{result.premiums.semiannual.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Тримесечно:</span>
                        <span className="font-medium">{result.premiums.quarterly.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Месечно:</span>
                        <span className="font-medium">{result.premiums.monthly.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600">План:</span>
                      <span className="font-medium">{result.plan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Териториален обхват:</span>
                      <span className="font-medium text-xs">{result.territory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Макс. годишно покритие:</span>
                      <span className="font-medium">{result.maxCoverage.toLocaleString()} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Дневни пари (без разходи):</span>
                      <span className="font-medium">{result.dailyBenefit} €/ден</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Отлагателен период:</span>
                      <span className="font-medium">{result.waitingPeriod} месеца</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coverages List */}
          {result?.eligible && (
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 py-4">
                <CardTitle className="text-base text-green-800 font-semibold">Покрити заболявания</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {result.coverages.map((coverage, idx) => (
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
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-base font-semibold"
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
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
            <div className="space-y-1">
              <p className="font-bold text-slate-800 text-sm">ЗК "УНИКА Живот" АД</p>
              <p className="leading-relaxed">Лиценз № 27 – ЖЗ от 10.08.1998 г. и лиценз № 1034 – ЖЗ от 24.10.2012 г.</p>
              <p className="leading-relaxed">София 1000, бул. "Тодор Александров" № 18</p>
              <p className="leading-relaxed font-medium text-blue-700">Тел: 0700 111 50 | www.uniqa.bg</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}