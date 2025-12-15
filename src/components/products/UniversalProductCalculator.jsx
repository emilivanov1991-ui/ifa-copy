import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Shield, Calculator, CheckCircle2, AlertTriangle } from 'lucide-react';
import { calculateProductOffer, loadProductConfig } from './ProductConfigEngine';

/**
 * Universal Product Calculator Component
 * Dynamically renders inputs and calculates based on product config
 */
export default function UniversalProductCalculator({ productId, initialInputs = {}, analysisId, clientId }) {
  const [config, setConfig] = useState(null);
  const [inputs, setInputs] = useState(initialInputs);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load config on mount
  useEffect(() => {
    async function loadConfig() {
      const cfg = await loadProductConfig(productId);
      setConfig(cfg);
      setLoading(false);
    }
    loadConfig();
  }, [productId]);

  // Calculate on input change
  useEffect(() => {
    if (config && inputs.age && inputs.sum && inputs.term) {
      const offer = calculateProductOffer(config, inputs);
      setResult(offer);
    }
  }, [config, inputs]);

  if (loading) {
    return <div className="p-4">Зареждане...</div>;
  }

  if (!config) {
    return <div className="p-4 text-red-600">Продуктът не е намерен</div>;
  }

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!result?.eligible || !analysisId) return;
    
    setSaving(true);
    try {
      await base44.entities.ProductOffer.create({
        analysis_id: analysisId,
        client_id: clientId,
        provider: config.provider,
        product_name: config.name,
        product_type: config.type,
        beneficiary_age: parseInt(inputs.age),
        term_years: parseInt(inputs.term),
        monthly_premium: result.monthlyPremium,
        annual_premium: result.annualPremium,
        coverage_amount: parseInt(inputs.sum),
        offer_status: 'generated',
        ai_recommendation_reason: config.description
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
      {/* Product Header */}
      <Card className="border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6" />
            <div>
              <CardTitle>{config.provider} {config.product_name}</CardTitle>
              <p className="text-sm text-blue-100">{config.description}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Параметри
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Age */}
            <div>
              <Label>Възраст</Label>
              <Input
                type="number"
                value={inputs.age || ''}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                placeholder={`${config.rules.min_age} - ${config.rules.max_age}`}
              />
              <p className="text-xs text-slate-500 mt-1">
                От {config.rules.min_age} до {config.rules.max_age} години
              </p>
            </div>

            {/* Gender */}
            <div>
              <Label>Пол</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={inputs.gender === 'male' ? 'default' : 'outline'}
                  onClick={() => handleInputChange('gender', 'male')}
                  className="flex-1"
                >
                  Мъж
                </Button>
                <Button
                  variant={inputs.gender === 'female' ? 'default' : 'outline'}
                  onClick={() => handleInputChange('gender', 'female')}
                  className="flex-1"
                >
                  Жена
                </Button>
              </div>
            </div>

            {/* Sum */}
            <div>
              <Label>Застрахователна сума ({config.rules.currency})</Label>
              <Input
                type="number"
                value={inputs.sum || ''}
                onChange={(e) => handleInputChange('sum', parseInt(e.target.value))}
                placeholder={`${config.rules.min_sum} - ${config.rules.max_sum}`}
              />
              <p className="text-xs text-slate-500 mt-1">
                От {config.rules.min_sum.toLocaleString()} до {config.rules.max_sum.toLocaleString()} {config.rules.currency}
              </p>
            </div>

            {/* Term */}
            <div>
              <Label>Срок (години)</Label>
              <Input
                type="number"
                value={inputs.term || ''}
                onChange={(e) => handleInputChange('term', parseInt(e.target.value))}
                placeholder={`${config.rules.min_term} - ${config.rules.max_term}`}
              />
              <p className="text-xs text-slate-500 mt-1">
                От {config.rules.min_term} до {config.rules.max_term} години
              </p>
            </div>

            {/* Smoker */}
            {config.rules.smoker_multiplier && (
              <div className="flex items-center justify-between">
                <Label>Пушач</Label>
                <Switch
                  checked={inputs.isSmoker || false}
                  onCheckedChange={(checked) => handleInputChange('isSmoker', checked)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Резултат</CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <p className="text-slate-500 text-sm">Попълнете всички параметри за изчисление</p>
            ) : !result.eligible ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-700 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Неподходящ</span>
                </div>
                <p className="text-sm text-amber-600">{result.reason}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Premium */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Годишна премия</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {result.annualPremium.toLocaleString('bg-BG')} {result.currency}
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    или {result.monthlyPremium.toLocaleString('bg-BG')} {result.currency}/месец
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Застрахователна сума:</span>
                    <span className="font-medium">{result.coverageAmount?.toLocaleString('bg-BG')} {result.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Срок:</span>
                    <span className="font-medium">{result.term} години</span>
                  </div>
                  {result.rate && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Тарифа на 1000 {result.currency}:</span>
                      <span className="font-medium">{result.rate.toFixed(2)} {result.currency}</span>
                    </div>
                  )}
                  {result.tariffBracket && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Възрастова група:</span>
                      <span className="font-medium">{result.tariffBracket} години</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                {config.features && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-slate-700 mb-2">Включени покрития:</p>
                    <div className="space-y-1">
                      {config.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Optional Coverages */}
      {config.optional_coverages && result?.eligible && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Допълнителни покрития (опционални)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {config.optional_coverages.map((coverage) => (
                <div key={coverage.code} className="border rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-1">{coverage.name}</h4>
                  <p className="text-xs text-slate-600 mb-2">{coverage.description}</p>
                  {coverage.rate_multiplier && (
                    <Badge variant="outline">
                      +{(result.annualPremium * coverage.rate_multiplier).toFixed(0)} {result.currency}/год.
                    </Badge>
                  )}
                  {coverage.flat_rate && (
                    <Badge variant="outline">
                      +{coverage.flat_rate} {result.currency}/год.
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}