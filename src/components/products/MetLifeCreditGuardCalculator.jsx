import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, AlertCircle, CheckCircle2, Save, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { calculateCreditGuardPremium, CREDIT_GUARD_RULES } from './MetLifeCreditGuardConstants';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function MetLifeCreditGuardCalculator({ initialInputs = {}, onSave, analysisId, clientId }) {
  const [inputs, setInputs] = useState({
    age: initialInputs.age || 34,
    sum: initialInputs.sum || 100000,
    term: initialInputs.term || 30,
    packageType: initialInputs.packageType || 'Основен'
  });

  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const offer = calculateCreditGuardPremium(
      parseInt(inputs.age),
      parseInt(inputs.sum),
      parseInt(inputs.term),
      inputs.packageType
    );
    setResult(offer);
  }, [inputs]);

  const handleSave = async () => {
    if (!result?.eligible || !analysisId) return;
    
    setSaving(true);
    try {
      await base44.entities.ProductOffer.create({
        analysis_id: analysisId,
        client_id: clientId,
        provider: 'MetLife',
        product_name: 'MetLife Credit Guard',
        product_type: 'term_life',
        beneficiary_age: parseInt(inputs.age),
        term_years: parseInt(inputs.term),
        monthly_premium: result.monthlyPremium,
        annual_premium: result.annualPremium,
        coverage_amount: parseInt(inputs.sum),
        offer_status: 'generated',
        ai_recommendation_reason: `Ипотечна застраховка ${inputs.packageType} пакет за ${inputs.term} години`
      });
      
      toast.success('Офертата е запазена успешно');
      if (onSave) onSave(result);
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
              className="h-10 bg-white px-3 py-1 rounded-lg"
            />
            <div>
              <CardTitle className="text-xl">MetLife Credit Guard</CardTitle>
              <p className="text-sm text-blue-100">Ипотечна застраховка</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Параметри</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Age */}
            <div>
              <Label>Възраст</Label>
              <Input
                type="number"
                value={inputs.age}
                onChange={(e) => setInputs({ ...inputs, age: e.target.value })}
                placeholder={`${CREDIT_GUARD_RULES.min_age} - ${CREDIT_GUARD_RULES.max_age}`}
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                От {CREDIT_GUARD_RULES.min_age} години, Възраст + Срок ≤ {CREDIT_GUARD_RULES.max_age}
              </p>
            </div>

            {/* Sum */}
            <div>
              <Label>Застрахователна сума (EUR)</Label>
              <Input
                type="number"
                value={inputs.sum}
                onChange={(e) => setInputs({ ...inputs, sum: e.target.value })}
                placeholder={`${CREDIT_GUARD_RULES.min_sum} - ${CREDIT_GUARD_RULES.max_sum}`}
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                От €{CREDIT_GUARD_RULES.min_sum.toLocaleString()} до €{CREDIT_GUARD_RULES.max_sum.toLocaleString()}
              </p>
            </div>

            {/* Term */}
            <div>
              <Label>Срок (години)</Label>
              <Select value={inputs.term.toString()} onValueChange={(value) => setInputs({ ...inputs, term: parseInt(value) })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CREDIT_GUARD_RULES.available_terms.map(term => (
                    <SelectItem key={term} value={term.toString()}>{term} години</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Package Type */}
            <div>
              <Label>Пакет</Label>
              <Select value={inputs.packageType} onValueChange={(value) => setInputs({ ...inputs, packageType: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Основен">Основен</SelectItem>
                  <SelectItem value="Разширен">Разширен</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                {inputs.packageType === 'Разширен' 
                  ? 'Включва допълнителни покрития: 40 тежки заболявания, смърт от злополука, фрактури'
                  : 'Основни покрития: смърт и трайна загуба на работоспособност'}
              </p>
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
                  <p className="text-sm text-slate-600 mb-2">Годишна премия</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {result.annualPremium.toLocaleString('bg-BG', { minimumFractionDigits: 2 })} €
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    или {result.monthlyPremium.toLocaleString('bg-BG', { minimumFractionDigits: 2 })} €/месец
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Пакет:</span>
                    <span className="font-medium">{result.packageType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Застрахователна сума:</span>
                    <span className="font-medium">{result.coverageAmount.toLocaleString('bg-BG')} €</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Срок:</span>
                    <span className="font-medium">{result.term} години</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Възраст:</span>
                    <span className="font-medium">{result.age} години</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Крайна възраст:</span>
                    <span className="font-medium">{result.age + result.term} години</span>
                  </div>
                </div>

                {/* Coverage Info */}
                <div className="bg-slate-50 rounded-lg p-4 border">
                  <p className="font-medium text-slate-900 mb-3 text-sm">Включени покрития:</p>
                  <div className="space-y-2 text-xs">
                    {result.coverages?.map((coverage, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{coverage}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formula Info */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-700">
                      <p className="font-medium mb-1">Формула за изчисление:</p>
                      <p>Премия = (Сума / €100,000) × {result.basePremiumFor100k}€</p>
                      <p className="text-blue-600 mt-1">= ({result.coverageAmount.toLocaleString()}€ / 100,000) × {result.basePremiumFor100k}€ = {result.annualPremium}€</p>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                {analysisId && (
                  <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg h-11 text-base font-semibold"
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
    </div>
  );
}