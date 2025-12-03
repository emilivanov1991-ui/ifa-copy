import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Sparkles, TrendingUp, Shield, Heart, GraduationCap, Home, Wallet, ChevronRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { EUR_BGN_RATE } from './FinancialPlanConstants';

const CATEGORY_ICONS = {
  protection: Shield,
  investment: TrendingUp,
  health: Heart,
  pension: Wallet,
  children: GraduationCap,
  property: Home
};

const CATEGORY_COLORS = {
  protection: 'text-red-600 bg-red-50',
  investment: 'text-green-600 bg-green-50',
  health: 'text-blue-600 bg-blue-50',
  pension: 'text-purple-600 bg-purple-50',
  children: 'text-pink-600 bg-pink-50',
  property: 'text-amber-600 bg-amber-50'
};

/**
 * AI-базиран двигател за препоръки
 * Анализира клиентски данни и предлага оптимална комбинация от продукти
 */
export default function AIRecommendationEngine({ analysis, onRecommendationsGenerated }) {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState({});

  const { data: productCatalog = [] } = useQuery({
    queryKey: ['productCatalog'],
    queryFn: () => base44.entities.ProductCatalog.list()
  });

  const activeProducts = useMemo(() => 
    productCatalog.filter(p => p.is_active), 
    [productCatalog]
  );

  // Анализ на клиентския профил
  const clientProfile = useMemo(() => {
    if (!analysis) return null;

    const clientAge = analysis.client_age || 35;
    const partnerAge = analysis.partner_age || 0;
    const hasPartner = analysis.include_partner;
    const childrenCount = analysis.children_count || 0;
    
    const monthlyIncome = (analysis.client_net_income || 0) + (analysis.partner_net_income || 0);
    const monthlyExpenses = (analysis.expense_rent || 0) + (analysis.expense_utilities || 0) + 
                            (analysis.expense_food || 0) + (analysis.expense_fuel || 0) + 
                            (analysis.expense_other || 0);
    const availableForInvestment = monthlyIncome - monthlyExpenses;
    
    const riskProfile = analysis.risk_profile || 'moderate';
    const hasHealthInsurance = analysis.has_property_insurance;
    const hasLifeInsurance = analysis.insurance_life > 0;
    
    // Определяне на профилен тип
    const profiles = [];
    if (hasPartner) profiles.push('families');
    if (!hasPartner) profiles.push('singles');
    if (childrenCount > 0) profiles.push('parents');
    if (clientAge > 50) profiles.push('pre_retirees');
    if (monthlyIncome > 5000) profiles.push('high_income');
    if (analysis.include_pension_in_plan) profiles.push('pension_focused');

    // Приоритети
    const priorities = [];
    if (analysis.priority_income_protection) priorities.push({ type: 'protection', score: analysis.priority_income_protection });
    if (analysis.priority_reserve) priorities.push({ type: 'reserve', score: analysis.priority_reserve });
    if (analysis.priority_pension) priorities.push({ type: 'pension', score: analysis.priority_pension });
    if (analysis.priority_children) priorities.push({ type: 'children', score: analysis.priority_children });
    if (analysis.priority_property_protection) priorities.push({ type: 'property', score: analysis.priority_property_protection });
    priorities.sort((a, b) => b.score - a.score);

    return {
      clientAge,
      partnerAge,
      hasPartner,
      childrenCount,
      monthlyIncome,
      monthlyExpenses,
      availableForInvestment,
      riskProfile,
      hasHealthInsurance,
      hasLifeInsurance,
      profiles,
      priorities,
      yearsToRetirement: Math.max(0, (analysis.client_retirement_age || 65) - clientAge)
    };
  }, [analysis]);

  // Генериране на AI препоръки
  const generateRecommendations = async () => {
    if (!clientProfile || activeProducts.length === 0) {
      toast.error('Няма достатъчно данни за генериране на препоръки');
      return;
    }

    setIsGenerating(true);

    try {
      // Изграждане на контекст за AI
      const context = `
Клиентски профил:
- Възраст: ${clientProfile.clientAge} години
- ${clientProfile.hasPartner ? `Партньор: ${clientProfile.partnerAge} години` : 'Без партньор'}
- Деца: ${clientProfile.childrenCount}
- Месечен доход: ${clientProfile.monthlyIncome} лв.
- Месечни разходи: ${clientProfile.monthlyExpenses} лв.
- Налични за инвестиции: ${clientProfile.availableForInvestment} лв./месец
- Рисков профил: ${clientProfile.riskProfile}
- Години до пенсия: ${clientProfile.yearsToRetirement}
- Приоритети: ${clientProfile.priorities.map(p => p.type).join(', ')}
- Профили: ${clientProfile.profiles.join(', ')}
- Има застраховка живот: ${clientProfile.hasLifeInsurance ? 'Да' : 'Не'}
- Има здравна застраховка: ${clientProfile.hasHealthInsurance ? 'Да' : 'Не'}

Налични продукти:
${activeProducts.map(p => `- ${p.product_name} (${p.provider}): ${p.product_type}, категория ${p.category}, продаваемост ${p.sellability_score}/10`).join('\n')}

Задача: Препоръчай най-подходящата комбинация от продукти (максимум 5-6), която:
1. Покрива основните нужди на клиента
2. Е "продаваема" - балансирана и лесна за разбиране
3. Приоритизира продукти с висока продаваемост
4. Не надвишава ${Math.round(clientProfile.availableForInvestment * 0.6)} лв./месец общо
5. Включва възможности за upsell

За всеки продукт посочи: ID, защо е подходящ, препоръчителна месечна премия, покритие.
`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: context,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product_id: { type: "string" },
                  product_name: { type: "string" },
                  provider: { type: "string" },
                  category: { type: "string" },
                  reason: { type: "string" },
                  monthly_premium: { type: "number" },
                  coverage_amount: { type: "number" },
                  priority: { type: "number" },
                  is_upsell: { type: "boolean" },
                  upsell_from: { type: "string" }
                }
              }
            },
            total_monthly: { type: "number" },
            summary: { type: "string" },
            gaps_identified: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      // Обогатяване на препоръките с данни от каталога
      const enrichedRecs = response.recommendations.map(rec => {
        const catalogProduct = activeProducts.find(p => 
          p.product_name.toLowerCase().includes(rec.product_name.toLowerCase()) ||
          rec.product_name.toLowerCase().includes(p.product_name.toLowerCase()) ||
          p.id === rec.product_id
        );
        
        return {
          ...rec,
          catalog_product: catalogProduct,
          sellability_score: catalogProduct?.sellability_score || 5
        };
      }).sort((a, b) => a.priority - b.priority);

      setRecommendations({
        products: enrichedRecs,
        total_monthly: response.total_monthly,
        summary: response.summary,
        gaps: response.gaps_identified || []
      });

      // Автоматично избиране на основните препоръки (не upsell)
      const initialSelected = {};
      enrichedRecs.filter(r => !r.is_upsell).forEach(r => {
        initialSelected[r.product_name] = true;
      });
      setSelectedProducts(initialSelected);

    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Грешка при генериране на препоръки');
    } finally {
      setIsGenerating(false);
    }
  };

  // Изчисляване на общата месечна премия
  const totalSelectedPremium = useMemo(() => {
    if (!recommendations) return 0;
    return recommendations.products
      .filter(p => selectedProducts[p.product_name])
      .reduce((sum, p) => sum + (p.monthly_premium || 0), 0);
  }, [recommendations, selectedProducts]);

  // Потвърждаване на избора
  const confirmSelection = () => {
    if (!recommendations) return;
    
    const selected = recommendations.products.filter(p => selectedProducts[p.product_name]);
    if (onRecommendationsGenerated) {
      onRecommendationsGenerated(selected);
    }
    toast.success(`Избрани ${selected.length} продукта`);
  };

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-slate-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
          <p>Изберете финансов анализ за генериране на препоръки</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>AI Препоръки за Продукти</CardTitle>
                <p className="text-sm text-slate-500">Интелигентен анализ и персонализирани препоръки</p>
              </div>
            </div>
            <Button 
              onClick={generateRecommendations} 
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Анализиране...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Генерирай Препоръки
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        {clientProfile && (
          <CardContent className="border-t pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Наличен бюджет:</span>
                <p className="font-semibold text-lg text-green-600">
                  {Math.round(clientProfile.availableForInvestment)} лв./мес
                </p>
              </div>
              <div>
                <span className="text-slate-500">Рисков профил:</span>
                <p className="font-semibold capitalize">{clientProfile.riskProfile}</p>
              </div>
              <div>
                <span className="text-slate-500">Години до пенсия:</span>
                <p className="font-semibold">{clientProfile.yearsToRetirement}</p>
              </div>
              <div>
                <span className="text-slate-500">Профил:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {clientProfile.profiles.slice(0, 2).map(p => (
                    <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recommendations */}
      {recommendations && (
        <>
          {/* Summary */}
          <Card className="border-violet-200 bg-violet-50/50">
            <CardContent className="p-4">
              <p className="text-slate-700">{recommendations.summary}</p>
              {recommendations.gaps.length > 0 && (
                <div className="mt-3 pt-3 border-t border-violet-200">
                  <p className="text-sm font-medium text-amber-700 mb-1">Идентифицирани пропуски:</p>
                  <ul className="text-sm text-amber-600 space-y-1">
                    {recommendations.gaps.map((gap, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" />
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products Grid */}
          <div className="grid gap-4">
            {recommendations.products.map((rec, index) => {
              const Icon = CATEGORY_ICONS[rec.category] || Shield;
              const colorClass = CATEGORY_COLORS[rec.category] || CATEGORY_COLORS.protection;
              const isSelected = selectedProducts[rec.product_name];

              return (
                <Card 
                  key={index} 
                  className={`transition-all ${isSelected ? 'ring-2 ring-violet-500 bg-violet-50/30' : ''} ${rec.is_upsell ? 'border-dashed border-amber-300' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{rec.product_name}</h3>
                              {rec.is_upsell && (
                                <Badge className="bg-amber-100 text-amber-800">Upsell</Badge>
                              )}
                              {rec.sellability_score >= 8 && (
                                <Badge className="bg-green-100 text-green-800">Топ продаван</Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-500">{rec.provider}</p>
                          </div>
                          <Switch 
                            checked={isSelected}
                            onCheckedChange={(v) => setSelectedProducts({...selectedProducts, [rec.product_name]: v})}
                          />
                        </div>
                        
                        <p className="text-sm text-slate-600 mt-2">{rec.reason}</p>
                        
                        <div className="flex items-center gap-6 mt-3 text-sm">
                          <div>
                            <span className="text-slate-500">Премия:</span>
                            <span className="ml-1 font-semibold text-violet-700">{rec.monthly_premium} лв./мес</span>
                          </div>
                          {rec.coverage_amount > 0 && (
                            <div>
                              <span className="text-slate-500">Покритие:</span>
                              <span className="ml-1 font-semibold">{rec.coverage_amount.toLocaleString()} €</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">Продаваемост:</span>
                            <Progress value={rec.sellability_score * 10} className="w-16 h-2" />
                            <span className="text-xs">{rec.sellability_score}/10</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Total & Confirm */}
          <Card className="sticky bottom-4 shadow-lg border-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Общо избрани продукти</p>
                  <p className="text-2xl font-bold text-violet-700">
                    {Math.round(totalSelectedPremium)} лв./месец
                  </p>
                  <p className="text-xs text-slate-400">
                    {Math.round((totalSelectedPremium / clientProfile.availableForInvestment) * 100)}% от наличния бюджет
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-sm">
                    <p className="text-slate-500">Избрани:</p>
                    <p className="font-semibold">
                      {Object.values(selectedProducts).filter(Boolean).length} / {recommendations.products.length}
                    </p>
                  </div>
                  <Button onClick={confirmSelection} size="lg" className="gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Потвърди Избора
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}