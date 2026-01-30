import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  AlertTriangle,
  TrendingUp,
  Shield,
  FileText,
  ArrowRight,
  Euro,
  Calendar
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import PlanPDFExport from './PlanPDFExport';

export default function AutoPlanGenerator({ analysisId, analysisData, onComplete }) {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setProgress(10);
    setError(null);
    
    try {
      setProgress(30);
      
      // Извикване на backend функцията
      const response = await base44.functions.invoke('generateFinancialPlan', {
        analysis_id: analysisId
      });
      
      setProgress(80);
      
      if (response.data.success) {
        setResult(response.data);
        setProgress(100);
        toast.success('Финансовият план е генериран успешно!');
        
        if (onComplete) {
          setTimeout(() => onComplete(response.data), 1000);
        }
      } else {
        throw new Error(response.data.error || 'Грешка при генериране');
      }
      
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Възникна грешка при генериране на плана');
      toast.error('Грешка: ' + (err.message || 'Неуспешно генериране'));
      setProgress(0);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-2xl font-bold tracking-wide">
                Автоматично генериране на финансов план
              </CardTitle>
              <p className="text-blue-100 text-sm font-medium">
                Базирано на правилата от FinancialPlanRules v1.0
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Analysis Summary */}
      {analysisData && (
        <Card>
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 py-4">
            <CardTitle className="text-base text-slate-800">Преглед на анализа</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs">Клиент</p>
                <p className="font-semibold text-slate-900">
                  {analysisData.client_first_name} {analysisData.client_last_name}
                </p>
                <p className="text-slate-600">{analysisData.client_age} години</p>
              </div>
              {analysisData.include_partner && (
                <div>
                  <p className="text-slate-500 text-xs">Партньор</p>
                  <p className="font-semibold text-slate-900">
                    {analysisData.partner_first_name} {analysisData.partner_last_name}
                  </p>
                  <p className="text-slate-600">{analysisData.partner_age} години</p>
                </div>
              )}
              <div>
                <p className="text-slate-500 text-xs">Общ месечен доход</p>
                <p className="font-semibold text-blue-600">
                  {((analysisData.client_net_income || 0) + (analysisData.partner_net_income || 0)).toLocaleString()} €
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Button */}
      {!result && !generating && (
        <Card>
          <CardContent className="p-8 text-center">
            <Sparkles className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Готови ли сте да генерирате финансовия план?
            </h3>
            <p className="text-slate-600 mb-6">
              Системата ще създаде персонализиран финансов план базиран на анализа и правилата
            </p>
            <Button 
              onClick={handleGenerate}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 px-8"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Генерирай финансов план
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      {generating && (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">
                  Генериране на план...
                </h3>
                <p className="text-sm text-slate-600">
                  Моля изчакайте, докато системата анализира данните и създаде плана
                </p>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-slate-500 mt-2 text-center">{progress}%</p>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Грешка при генериране</h3>
                <p className="text-sm text-red-700">{error}</p>
                <Button 
                  onClick={handleGenerate}
                  variant="outline"
                  size="sm"
                  className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
                >
                  Опитай отново
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Result */}
      {result && result.success && (
        <div className="space-y-4">
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-900 mb-1">
                    Планът е генериран успешно!
                  </h3>
                  <p className="text-sm text-green-700">
                    Финансовият план съдържа {result.summary.total_products} продукта с обща месечна премия {result.summary.total_monthly_premium.toFixed(2)} EUR
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Общ месечен план</p>
                    <p className="text-lg font-bold text-slate-900">
                      {result.summary.total_monthly_premium.toFixed(2)} €
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Брой продукти</p>
                    <p className="text-lg font-bold text-slate-900">
                      {result.summary.total_products}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Оптимизации</p>
                    <p className="text-lg font-bold text-slate-900">
                      {result.summary.optimizations}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products List - Grouped by Type */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 py-4">
              <CardTitle className="text-base text-indigo-800">Продукти в плана ({result.products.length})</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-6">
                {/* Инвестиции */}
                {result.products.filter(p => p.product_type === 'ul_investment').length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Инвестиции и спестявания
                    </h3>
                    <div className="space-y-2">
                      {result.products.filter(p => p.product_type === 'ul_investment').map((product, idx) => (
                        <div 
                          key={idx}
                          className="flex items-start justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-slate-900">{product.product_name}</h4>
                              <Badge variant="outline" className="text-xs">{product.provider}</Badge>
                            </div>
                            <p className="text-sm text-slate-600">
                              {product.beneficiary_name} • {product.beneficiary_age} г. • {product.term_years} години
                            </p>
                            {product.expected_value > 0 && (
                              <p className="text-xs text-green-600 font-medium mt-1">
                                Прогноза: {product.expected_value.toLocaleString()} EUR
                              </p>
                            )}
                            {product.details?.daily_cost && (
                              <p className="text-xs text-slate-500 mt-1">
                                Дневна цена: {product.details.daily_cost} EUR
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Месечно</p>
                            <p className="text-xl font-bold text-blue-600">
                              {product.monthly_premium.toFixed(0)} €
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Здравни застраховки */}
                {result.products.filter(p => p.product_type === 'health_insurance').length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Здравни застраховки
                    </h3>
                    <div className="space-y-2">
                      {result.products.filter(p => p.product_type === 'health_insurance').map((product, idx) => (
                        <div 
                          key={idx}
                          className="flex items-start justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-slate-900">{product.product_name}</h4>
                              <Badge variant="outline" className="text-xs">{product.provider}</Badge>
                            </div>
                            <p className="text-sm text-slate-600">{product.beneficiary_name}</p>
                            {product.coverage_amount > 0 && (
                              <p className="text-xs text-slate-500 mt-1">
                                Лимит: {product.coverage_amount.toLocaleString()} EUR
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Месечно</p>
                            <p className="text-xl font-bold text-green-600">
                              {product.monthly_premium.toFixed(0)} €
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Пенсионни */}
                {result.products.filter(p => p.product_type === 'pension_plan').length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Пенсионно осигуряване
                    </h3>
                    <div className="space-y-2">
                      {result.products.filter(p => p.product_type === 'pension_plan').map((product, idx) => (
                        <div 
                          key={idx}
                          className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900">{product.product_name}</h4>
                            <Badge className="text-xs bg-green-600">БЕЗ РАЗХОДИ</Badge>
                          </div>
                          <p className="text-sm text-slate-600">{product.beneficiary_name}</p>
                          <p className="text-xs text-slate-500 mt-1">{product.details?.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Други застраховки */}
                {result.products.filter(p => ['insurance', 'property_insurance', 'car_insurance', 'term_life'].includes(p.product_type)).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Допълнителни застраховки
                    </h3>
                    <div className="space-y-2">
                      {result.products.filter(p => ['insurance', 'property_insurance', 'car_insurance', 'term_life'].includes(p.product_type)).map((product, idx) => (
                        <div 
                          key={idx}
                          className="flex items-start justify-between p-4 bg-white rounded-lg border border-slate-200"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-slate-900">{product.product_name}</h4>
                              <Badge variant="outline" className="text-xs">{product.provider}</Badge>
                            </div>
                            {product.beneficiary_name && (
                              <p className="text-sm text-slate-600">{product.beneficiary_name}</p>
                            )}
                            {product.coverage_amount > 0 && (
                              <p className="text-xs text-slate-500 mt-1">
                                Покритие: {product.coverage_amount.toLocaleString()} EUR
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Месечно</p>
                            <p className="text-lg font-bold text-slate-900">
                              {product.monthly_premium.toFixed(0)} €
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Optimizations */}
          {result.optimizations && result.optimizations.length > 0 && (
            <Card>
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                <CardTitle className="text-base text-amber-800">Препоръки за оптимизация</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {result.optimizations.map((opt, idx) => (
                    <div 
                      key={idx}
                      className="p-4 bg-white rounded-lg border border-amber-200"
                    >
                      <h4 className="font-semibold text-amber-900 mb-2">{opt.description}</h4>
                      <div className="text-sm text-slate-600">
                        <pre className="text-xs bg-slate-50 p-2 rounded mt-2 overflow-auto">
                          {JSON.stringify(opt, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 py-4">
                <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                  <Euro className="w-4 h-4" />
                  Финансови показатели
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-slate-600">Трудов капитал (общо):</span>
                  <span className="font-bold text-blue-600">
                    {result.summary.labor_capital_total.toLocaleString()} €
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-slate-600">Данъчно облекчение (год.):</span>
                  <span className="font-bold text-green-600">
                    {result.summary.tax_relief_annual.toFixed(2)} €
                  </span>
                </div>
                {result.products.find(p => p.expected_value > 0) && (
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-slate-600">Прогнозна стойност при пенсия:</span>
                    <span className="font-bold text-purple-600">
                      {result.products
                        .filter(p => p.expected_value > 0)
                        .reduce((sum, p) => sum + p.expected_value, 0)
                        .toLocaleString()} €
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 py-4">
                <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Препоръки за плащане
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-sm">
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <p className="text-xs text-slate-600 mb-1">Препоръчителна периодичност</p>
                  <p className="text-lg font-bold text-indigo-600">
                    {result.summary.recommended_frequency === 'annual' ? 'Годишно' :
                     result.summary.recommended_frequency === 'semiannual' ? 'Полугодишно' :
                     result.summary.recommended_frequency === 'quarterly' ? 'Тримесечно' : 'Месечно'}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    {result.summary.recommended_frequency === 'annual' && 'Най-изгодна цена с годишно плащане'}
                    {result.summary.recommended_frequency === 'semiannual' && 'По-гъвкаво плащане на 6 месеца'}
                    {result.summary.recommended_frequency === 'quarterly' && 'Тримесечни вноски за по-лесно управление'}
                    {result.summary.recommended_frequency === 'monthly' && 'Месечни вноски при ограничен резерв'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-slate-500">Годишно</p>
                    <p className="font-semibold">{(result.summary.total_monthly_premium * 12).toFixed(0)} €</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-slate-500">Месечно</p>
                    <p className="font-semibold">{result.summary.total_monthly_premium.toFixed(0)} €</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>



          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => {
                setResult(null);
                setProgress(0);
                setAiAnalysis(null);
              }}
            >
              Генерирай отново
            </Button>
            <PlanPDFExport planId={result.plan_id} planData={result} />
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={() => {
                if (onComplete) onComplete(result);
              }}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Завърши
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}