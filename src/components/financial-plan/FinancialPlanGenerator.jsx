import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Calculator, FileText, CheckCircle, AlertCircle, TrendingUp, Shield, GraduationCap, Home, PiggyBank, Heart } from 'lucide-react';
import { calculateFinancialPlan } from './FinancialPlanCalculator';
import { CONSTANTS } from './FinancialPlanConstants';

const PRODUCT_ICONS = {
  term_life: Shield,
  ul_investment: TrendingUp,
  education_plan: GraduationCap,
  mlc_health: Heart,
  pension_plan: PiggyBank,
  personal_accident: AlertCircle
};

const PRODUCT_LABELS = {
  term_life: 'Срочна застраховка живот',
  ul_investment: 'UL Инвестиция',
  education_plan: 'Образователен план',
  mlc_health: 'Здравна застраховка',
  pension_plan: 'Пенсионен план',
  personal_accident: 'Лична злополука'
};

const BENEFICIARY_LABELS = {
  partner1: 'Партньор 1',
  partner2: 'Партньор 2',
  child1: 'Дете 1',
  child2: 'Дете 2',
  child3: 'Дете 3',
  family: 'Семейство'
};

export default function FinancialPlanGenerator({ analysisId, onPlanGenerated }) {
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [activeProducts, setActiveProducts] = useState({});
  const queryClient = useQueryClient();

  // Зареждане на анализа
  const { data: analysis, isLoading: loadingAnalysis } = useQuery({
    queryKey: ['analysis', analysisId],
    queryFn: async () => {
      const analyses = await base44.entities.FinancialAnalysisSubmission.filter({ id: analysisId });
      return analyses[0];
    },
    enabled: !!analysisId
  });

  // Мутация за запазване на плана
  const savePlanMutation = useMutation({
    mutationFn: async (planData) => {
      return await base44.entities.FinancialPlan.create({
        analysis_id: analysisId,
        plan_status: 'calculated',
        ...planData
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['financial-plans']);
      if (onPlanGenerated) onPlanGenerated(data);
    }
  });

  // Генериране на план при зареждане на анализа
  useEffect(() => {
    if (analysis) {
      const plan = calculateFinancialPlan(analysis);
      setGeneratedPlan(plan);
      
      // Инициализиране на активните продукти
      const active = {};
      plan.products.forEach((p, idx) => {
        active[idx] = p.is_active;
      });
      setActiveProducts(active);
    }
  }, [analysis]);

  const toggleProduct = (index) => {
    setActiveProducts(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getActiveProducts = () => {
    if (!generatedPlan) return [];
    return generatedPlan.products.map((p, idx) => ({
      ...p,
      is_active: activeProducts[idx] ?? p.is_active
    }));
  };

  const getTotalMonthlyPremium = () => {
    return getActiveProducts()
      .filter(p => p.is_active)
      .reduce((sum, p) => sum + (p.monthly_premium || 0), 0);
  };

  const handleSavePlan = () => {
    const planToSave = {
      ...generatedPlan,
      products: getActiveProducts(),
      total_monthly_premium: getTotalMonthlyPremium()
    };
    savePlanMutation.mutate(planToSave);
  };

  if (loadingAnalysis) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600">Зареждане на анализа...</span>
      </div>
    );
  }

  if (!analysis) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <span className="text-red-700">Анализът не е намерен</span>
        </CardContent>
      </Card>
    );
  }

  if (!generatedPlan) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600">Изчисляване на финансов план...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Финансов план</h2>
          <p className="text-slate-600">
            За: {analysis.client_first_name} {analysis.client_last_name}
            {analysis.include_partner && ` и ${analysis.partner_first_name} ${analysis.partner_last_name}`}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Валиден до: {generatedPlan.valid_until}
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <p className="text-xs text-blue-600 font-medium">Месечен доход</p>
            <p className="text-2xl font-bold text-blue-900">
              {generatedPlan.total_monthly_income.toLocaleString('bg-BG')} €
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <p className="text-xs text-amber-600 font-medium">Месечни разходи</p>
            <p className="text-2xl font-bold text-amber-900">
              {generatedPlan.total_monthly_expenses.toLocaleString('bg-BG')} €
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <p className="text-xs text-green-600 font-medium">Свободни средства</p>
            <p className="text-2xl font-bold text-green-900">
              {generatedPlan.available_for_investment.toLocaleString('bg-BG')} €
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <p className="text-xs text-purple-600 font-medium">Месечна вноска по план</p>
            <p className="text-2xl font-bold text-purple-900">
              {getTotalMonthlyPremium().toLocaleString('bg-BG', { maximumFractionDigits: 2 })} €
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Needs Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            Анализ на нуждите
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedPlan.protection_need_p1 > 0 && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-slate-700">Защита П1</span>
                </div>
                <p className="text-xl font-bold text-slate-900">
                  {generatedPlan.protection_need_p1.toLocaleString('bg-BG', { maximumFractionDigits: 0 })} €
                </p>
              </div>
            )}
            
            {generatedPlan.protection_need_p2 > 0 && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-slate-700">Защита П2</span>
                </div>
                <p className="text-xl font-bold text-slate-900">
                  {generatedPlan.protection_need_p2.toLocaleString('bg-BG', { maximumFractionDigits: 0 })} €
                </p>
              </div>
            )}
            
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank className="w-4 h-4 text-green-600" />
                <span className="font-medium text-slate-700">Резерв</span>
              </div>
              <p className="text-xl font-bold text-slate-900">
                {generatedPlan.reserve_need.toLocaleString('bg-BG', { maximumFractionDigits: 0 })} €
              </p>
            </div>
            
            {generatedPlan.pension_gap_p1 > 0 && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-slate-700">Пенсионен дефицит П1</span>
                </div>
                <p className="text-xl font-bold text-slate-900">
                  {generatedPlan.pension_gap_p1.toLocaleString('bg-BG', { maximumFractionDigits: 0 })} €
                </p>
                <p className="text-xs text-slate-500">{generatedPlan.years_to_retirement_p1} г. до пенсия</p>
              </div>
            )}
            
            {generatedPlan.education_need_child1 > 0 && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-slate-700">Образование Дете 1</span>
                </div>
                <p className="text-xl font-bold text-slate-900">
                  {generatedPlan.education_need_child1.toLocaleString('bg-BG', { maximumFractionDigits: 0 })} €
                </p>
              </div>
            )}
            
            {generatedPlan.education_need_child2 > 0 && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-slate-700">Образование Дете 2</span>
                </div>
                <p className="text-xl font-bold text-slate-900">
                  {generatedPlan.education_need_child2.toLocaleString('bg-BG', { maximumFractionDigits: 0 })} €
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Препоръчани продукти
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {generatedPlan.products.map((product, index) => {
              const Icon = PRODUCT_ICONS[product.product_type] || FileText;
              const isActive = activeProducts[index] ?? product.is_active;
              
              return (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border transition-all ${
                    isActive 
                      ? 'bg-white border-blue-200 shadow-sm' 
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-100' : 'bg-slate-200'}`}>
                        <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          {PRODUCT_LABELS[product.product_type]}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {product.provider} • {BENEFICIARY_LABELS[product.beneficiary]}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {product.strategy && (
                            <Badge variant="outline" className="text-xs">
                              {product.strategy}
                            </Badge>
                          )}
                          {product.term_years && (
                            <Badge variant="outline" className="text-xs">
                              {product.term_years} години
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">
                          {product.monthly_premium?.toLocaleString('bg-BG', { maximumFractionDigits: 2 })} €/мес.
                        </p>
                        {product.coverage_amount && (
                          <p className="text-xs text-slate-500">
                            Покритие: {product.coverage_amount.toLocaleString('bg-BG')} €
                          </p>
                        )}
                        {product.expected_value && (
                          <p className="text-xs text-green-600">
                            Очаквана стойност: {product.expected_value.toLocaleString('bg-BG')} €
                          </p>
                        )}
                      </div>
                      <Switch
                        checked={isActive}
                        onCheckedChange={() => toggleProduct(index)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary & Actions */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Обща месечна вноска</p>
              <p className="text-3xl font-bold">
                {getTotalMonthlyPremium().toLocaleString('bg-BG', { maximumFractionDigits: 2 })} €
              </p>
              <p className="text-blue-200 text-sm mt-1">
                {((getTotalMonthlyPremium() / generatedPlan.available_for_investment) * 100).toFixed(1)}% от свободните средства
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => window.print()}
              >
                <FileText className="w-4 h-4 mr-2" />
                Принтирай
              </Button>
              <Button 
                className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={handleSavePlan}
                disabled={savePlanMutation.isPending}
              >
                {savePlanMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Запази плана
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}