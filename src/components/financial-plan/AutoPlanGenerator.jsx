import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { 
  CoverPage, 
  FinancialPlanMainPage, 
  IncomeProtectionPage, 
  PortfolioStructurePage, 
  SummaryPage 
} from './FinancialPlanPDF';

export default function AutoPlanGenerator({ analysisId, analysisData, onComplete }) {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showPresentation, setShowPresentation] = useState(false);

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

  // Подготовка на данни за презентацията
  const clientData = analysisData ? {
    age: analysisData.client_age || 35,
    monthlyNetIncome: (analysisData.client_net_income || 0) + (analysisData.partner_net_income || 0),
    retirementAge: analysisData.client_retirement_age || 65,
    yearsToRetirement: (analysisData.client_retirement_age || 65) - (analysisData.client_age || 35)
  } : null;

  // Конвертиране на планови данни за презентацията
  const planDataForPresentation = result ? {
    total_monthly_premium: result.summary.total_monthly_premium,
    products: result.products.map(p => ({
      name: p.product_name,
      monthlyPremium: p.monthly_premium,
      annualPremium: p.monthly_premium * 12,
      benefit: p.product_type,
      type: p.product_type,
      coverage: p.coverage_amount,
      termYears: p.term_years,
      coverages: p.selected_coverages || {}
    })),
    calculations: {
      monthlyBalance: (analysisData?.client_net_income || 0) + (analysisData?.partner_net_income || 0) - 
        ((analysisData?.expense_rent || 0) + (analysisData?.expense_utilities || 0) + (analysisData?.expense_food || 0)),
      laborCapital: result.summary.labor_capital_total,
      totalTaxRelief: result.summary.tax_relief_annual * clientData?.yearsToRetirement || 1,
      projectedValue: result.products.reduce((sum, p) => sum + (p.expected_value || 0), 0)
    }
  } : null;

  return (
    <>
      {showPresentation && result && analysisData && (
        <FinancialPlanPresentation
          planData={planDataForPresentation}
          clientData={clientData}
          analysisData={analysisData}
          onClose={() => setShowPresentation(false)}
        />
      )}
      
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

          {/* Presentation Button */}
          <Card>
            <CardContent className="p-8 text-center">
              <Sparkles className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Прегледайте вашия финансов план
              </h3>
              <p className="text-slate-600 mb-6">
                Вижте визуализация на 7 страници с графики, анализи и детайлна разбивка
              </p>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg px-8"
                onClick={() => setShowPresentation(true)}
              >
                <FileText className="w-5 h-5 mr-2" />
                Отвори презентация на плана
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>



          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => {
                setResult(null);
                setProgress(0);
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