import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, Sparkles, FileText, Download, Shield, TrendingUp, 
  GraduationCap, Heart, PiggyBank, AlertCircle, CheckCircle, RefreshCw
} from 'lucide-react';

const PRODUCT_ICONS = {
  term_life: Shield,
  ul_investment: TrendingUp,
  education_plan: GraduationCap,
  health_insurance: Heart,
  pension_plan: PiggyBank,
  personal_accident: AlertCircle,
  critical_illness: Heart
};

const PRODUCT_LABELS = {
  term_life: 'Срочна застраховка живот',
  ul_investment: 'UL Инвестиция',
  education_plan: 'Образователен план',
  health_insurance: 'Здравна застраховка',
  pension_plan: 'Пенсионен план',
  personal_accident: 'Лична злополука',
  critical_illness: 'Критични заболявания'
};

export default function AIProductRecommender({ analysisId, plan, onOffersGenerated }) {
  const [generating, setGenerating] = useState(false);
  const [selectedOffers, setSelectedOffers] = useState({});
  const [generatedOffers, setGeneratedOffers] = useState([]);
  const queryClient = useQueryClient();

  // Load analysis
  const { data: analysis } = useQuery({
    queryKey: ['analysis', analysisId],
    queryFn: async () => {
      const analyses = await base44.entities.FinancialAnalysisSubmission.filter({ id: analysisId });
      return analyses[0];
    },
    enabled: !!analysisId
  });

  // Load product catalog
  const { data: productCatalog = [] } = useQuery({
    queryKey: ['product-catalog'],
    queryFn: () => base44.entities.ProductCatalog.filter({ is_active: true })
  });

  // Load existing offers
  const { data: existingOffers = [] } = useQuery({
    queryKey: ['product-offers', analysisId],
    queryFn: () => base44.entities.ProductOffer.filter({ analysis_id: analysisId }),
    enabled: !!analysisId
  });

  useEffect(() => {
    if (existingOffers.length > 0) {
      setGeneratedOffers(existingOffers);
      const selected = {};
      existingOffers.forEach((o, i) => selected[i] = o.offer_status !== 'rejected');
      setSelectedOffers(selected);
    }
  }, [existingOffers]);

  const generateAIOffers = async () => {
    setGenerating(true);
    try {
      // Build context for AI
      const clientContext = buildClientContext(analysis, plan);
      
      // Call AI to generate recommendations
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Ти си експерт финансов консултант. Анализирай следния клиентски профил и препоръчай най-подходящите финансови продукти.

КЛИЕНТСКИ ПРОФИЛ:
${clientContext}

НАЛИЧНИ ПРОДУКТИ:
${JSON.stringify(productCatalog.map(p => ({
  provider: p.provider,
  product_name: p.product_name,
  product_type: p.product_type,
  min_age: p.min_age,
  max_age: p.max_age,
  min_monthly_premium: p.min_monthly_premium,
  features: p.features
})), null, 2)}

Генерирай персонализирани оферти с конкретни параметри за този клиент. За всяка оферта определи:
1. Кой продукт е най-подходящ и защо
2. Конкретен срок (в години)
3. Месечна премия, съобразена с бюджета на клиента
4. Покритие/очаквана стойност
5. За кого е (partner1, partner2, child1 и т.н.)
6. Стратегия (ако е приложимо): conservative, balanced, dynamic
7. Кратко обяснение защо препоръчваш този продукт

Вземи предвид:
- Възраст и години до пенсия
- Налични средства за инвестиране
- Рисков профил
- Приоритети на клиента
- Семейно положение и деца`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  provider: { type: "string" },
                  product_name: { type: "string" },
                  product_type: { type: "string" },
                  beneficiary: { type: "string" },
                  term_years: { type: "number" },
                  monthly_premium: { type: "number" },
                  coverage_amount: { type: "number" },
                  expected_value: { type: "number" },
                  strategy: { type: "string" },
                  recommendation_reason: { type: "string" },
                  priority: { type: "number" }
                }
              }
            },
            summary: { type: "string" }
          }
        }
      });

      // Process AI recommendations and create offers
      const offers = await processAIRecommendations(aiResponse, analysis, plan);
      setGeneratedOffers(offers);
      
      // Initialize all as selected
      const selected = {};
      offers.forEach((_, i) => selected[i] = true);
      setSelectedOffers(selected);

      if (onOffersGenerated) onOffersGenerated(offers);
    } catch (error) {
      console.error('AI generation error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const buildClientContext = (analysis, plan) => {
    const age = plan?.partner1_age || 35;
    const partnerAge = plan?.partner2_age;
    
    return `
Име: ${analysis?.client_first_name} ${analysis?.client_last_name}
Възраст: ${age} години
Пол: ${analysis?.client_gender === 'male' ? 'Мъж' : 'Жена'}
Пушач: ${analysis?.client_is_smoker ? 'Да' : 'Не'}
Семейно положение: ${analysis?.client_marital_status || 'неизвестно'}
${analysis?.include_partner ? `Партньор: ${analysis?.partner_first_name}, ${partnerAge} години` : 'Без партньор'}
Деца: ${analysis?.children_count || 0}

Финансово състояние:
- Месечен доход: ${plan?.total_monthly_income || 0} лв.
- Месечни разходи: ${plan?.total_monthly_expenses || 0} лв.
- Свободни средства: ${plan?.available_for_investment || 0} лв.
- Еднократен резерв: ${analysis?.client_checking_account || 0} лв.

Години до пенсия: ${plan?.years_to_retirement_p1 || 30}
Желана пенсия: ${analysis?.client_desired_pension || 0} лв.
Рисков профил: ${analysis?.risk_profile || 'balanced'}

Нужди:
- Защита на дохода: ${plan?.protection_need_p1 || 0} лв.
- Резерв: ${plan?.reserve_need || 0} лв.
- Пенсионен дефицит: ${plan?.pension_gap_p1 || 0} лв.

Приоритети (1-7, 1=най-важно):
- Защита на дохода: ${analysis?.priority_income_protection || '-'}
- Резерв: ${analysis?.priority_reserve || '-'}
- Пенсия: ${analysis?.priority_pension || '-'}
- Деца: ${analysis?.priority_children || '-'}
- Жилище: ${analysis?.priority_housing || '-'}
`;
  };

  const processAIRecommendations = async (aiResponse, analysis, plan) => {
    const recommendations = aiResponse.recommendations || [];
    const offers = [];
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    for (const rec of recommendations) {
      const beneficiaryName = getBeneficiaryName(rec.beneficiary, analysis);
      const beneficiaryAge = getBeneficiaryAge(rec.beneficiary, analysis, plan);

      const offer = {
        analysis_id: analysisId,
        plan_id: plan?.id,
        provider: rec.provider,
        product_name: rec.product_name,
        product_type: rec.product_type,
        beneficiary: rec.beneficiary,
        beneficiary_name: beneficiaryName,
        beneficiary_age: beneficiaryAge,
        term_years: rec.term_years,
        strategy: rec.strategy,
        monthly_premium: rec.monthly_premium,
        annual_premium: rec.monthly_premium * 12,
        coverage_amount: rec.coverage_amount || 0,
        expected_value: rec.expected_value || 0,
        risk_class: 1,
        ai_recommendation_reason: rec.recommendation_reason,
        offer_status: 'generated',
        valid_until: validUntil.toISOString().split('T')[0]
      };

      // Save to database
      const savedOffer = await base44.entities.ProductOffer.create(offer);
      offers.push({ ...offer, id: savedOffer.id });
    }

    return offers;
  };

  const getBeneficiaryName = (beneficiary, analysis) => {
    switch (beneficiary) {
      case 'partner1': return `${analysis?.client_first_name} ${analysis?.client_last_name}`;
      case 'partner2': return `${analysis?.partner_first_name} ${analysis?.partner_last_name}`;
      case 'child1': return analysis?.child_1_name || 'Дете 1';
      case 'child2': return analysis?.child_2_name || 'Дете 2';
      case 'child3': return analysis?.child_3_name || 'Дете 3';
      case 'family': return 'Семейство';
      default: return 'Неизвестен';
    }
  };

  const getBeneficiaryAge = (beneficiary, analysis, plan) => {
    switch (beneficiary) {
      case 'partner1': return plan?.partner1_age || 35;
      case 'partner2': return plan?.partner2_age || 35;
      default: return 0;
    }
  };

  const toggleOffer = (index) => {
    setSelectedOffers(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const generatePDFOffer = async (offer) => {
    // Generate PDF using the offer data
    // This would typically call a backend function or use a PDF library
    console.log('Generating PDF for offer:', offer);
  };

  const saveSelectedOffers = async () => {
    const selected = generatedOffers.filter((_, i) => selectedOffers[i]);
    for (const offer of selected) {
      if (offer.id) {
        await base44.entities.ProductOffer.update(offer.id, { offer_status: 'generated' });
      }
    }
    queryClient.invalidateQueries(['product-offers']);
  };

  const totalMonthlyPremium = generatedOffers
    .filter((_, i) => selectedOffers[i])
    .reduce((sum, o) => sum + (o.monthly_premium || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            AI Продуктови препоръки
          </h3>
          <p className="text-sm text-slate-500">
            Персонализирани оферти базирани на анализа на клиента
          </p>
        </div>
        <Button
          onClick={generateAIOffers}
          disabled={generating || !analysis}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Генериране...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              {generatedOffers.length > 0 ? 'Регенерирай' : 'Генерирай оферти'}
            </>
          )}
        </Button>
      </div>

      {/* Generated Offers */}
      {generatedOffers.length > 0 && (
        <>
          <div className="grid gap-4">
            {generatedOffers.map((offer, index) => {
              const Icon = PRODUCT_ICONS[offer.product_type] || FileText;
              const isSelected = selectedOffers[index];

              return (
                <Card 
                  key={index}
                  className={`transition-all ${isSelected ? 'border-blue-200 shadow-sm' : 'opacity-60 border-slate-200'}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-slate-100'}`}>
                          <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900">{offer.product_name}</h4>
                            <Badge variant="outline" className="text-xs">{offer.provider}</Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            {PRODUCT_LABELS[offer.product_type]} • {offer.beneficiary_name}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {offer.term_years && (
                              <Badge className="bg-slate-100 text-slate-700">{offer.term_years} години</Badge>
                            )}
                            {offer.strategy && (
                              <Badge className="bg-blue-100 text-blue-700">{offer.strategy}</Badge>
                            )}
                            {offer.coverage_amount > 0 && (
                              <Badge className="bg-green-100 text-green-700">
                                Покритие: {offer.coverage_amount.toLocaleString('bg-BG')} €
                              </Badge>
                            )}
                          </div>

                          {offer.ai_recommendation_reason && (
                            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                              <Sparkles className="w-3 h-3 inline mr-1" />
                              {offer.ai_recommendation_reason}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <Switch
                          checked={isSelected}
                          onCheckedChange={() => toggleOffer(index)}
                        />
                        <div className="text-right">
                          <p className="text-xl font-bold text-slate-900">
                            {offer.monthly_premium?.toLocaleString('bg-BG')} €
                          </p>
                          <p className="text-xs text-slate-500">на месец</p>
                          {offer.expected_value > 0 && (
                            <p className="text-sm text-green-600 mt-1">
                              Очаквано: {offer.expected_value.toLocaleString('bg-BG')} €
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generatePDFOffer(offer)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Общо месечна вноска (избрани оферти)</p>
                  <p className="text-3xl font-bold">
                    {totalMonthlyPremium.toLocaleString('bg-BG')} €
                  </p>
                  <p className="text-blue-200 text-sm mt-1">
                    {Object.values(selectedOffers).filter(Boolean).length} от {generatedOffers.length} оферти избрани
                  </p>
                </div>
                <Button 
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  onClick={saveSelectedOffers}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Запази избраните
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {generatedOffers.length === 0 && !generating && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h4 className="font-semibold text-slate-700 mb-2">Няма генерирани оферти</h4>
            <p className="text-sm text-slate-500 mb-4">
              Натиснете "Генерирай оферти" за да получите AI препоръки за продукти
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}