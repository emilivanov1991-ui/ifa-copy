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
        prompt: `Ти си експерт финансов консултант от Partners Group BG. Анализирай клиентския профил и създай персонализирани продуктови оферти.

${clientContext}

═══════════════════════
НАЛИЧНИ ПРОДУКТИ В КАТАЛОГА
═══════════════════════
${JSON.stringify(productCatalog.map(p => ({
  provider: p.provider,
  product_name: p.product_name,
  product_type: p.product_type,
  min_age: p.min_age,
  max_age: p.max_age,
  min_monthly_premium: p.min_monthly_premium,
  max_monthly_premium: p.max_monthly_premium,
  min_coverage: p.min_coverage,
  max_coverage: p.max_coverage,
  base_rate_per_1000: p.base_rate_per_1000,
  expected_return_conservative: p.expected_return_conservative,
  expected_return_balanced: p.expected_return_balanced,
  expected_return_dynamic: p.expected_return_dynamic,
  features: p.features,
  description: p.description
})), null, 2)}

═══════════════════════
ЗАДАЧА
═══════════════════════
Генерирай 4-7 конкретни продуктови предложения базирани на:

1. ПРИОРИТЕТИТЕ на клиента (сортирани от 1 до 7)
2. НАЛИЧНИТЕ СРЕДСТВА за инвестиране
3. РЕАЛНИТЕ НУЖДИ от калкулациите
4. ВЪЗРАСТТА и СРОКА до пенсия/образование

ПРАВИЛА ЗА ПРЕПОРЪКИ:

A) ЗАЩИТА НА ДОХОДА (Term Life + Critical Illness):
   - Ако приоритет 1-2: задължително включи TK (срочна застраховка)
   - Покритие = нужда от защита в ЛЕВОВЕ
   - Месечна премия = (покритие / 1000) * тарифа / 12
   - Добави UNIQA MLC (критични заболявания) ако възраст < 55
   
B) ИНВЕСТИЦИИ И ПЕНСИЯ (UL Investment, PI):
   - MetLife UL: balanced/dynamic стратегия, 50-200 EUR/месец
   - Partners Investments: за агресивни профили, ETF базирани
   - Срок = години до пенсия (max 40 години)
   - Очаквана стойност при 6-8% годишна доходност
   
C) ОБРАЗОВАНИЕ НА ДЕЦА:
   - За всяко дете < 18 години
   - MetLife Education Plan
   - Срок = 18 - възраст на детето
   - Целева сума = 20,000-30,000 EUR
   - Месечна вноска = цел / (срок * 12 * коефициент на натрупване)
   
D) ЗДРАВНА ЗАСТРАХОВКА:
   - UNIQA "Здраве и Ценност" - международно покритие
   - Generali Health Line - национално покритие
   - Месечна премия според възраст: 20-50 EUR

E) УПФ (Универсален Пенсионен Фонд):
   - ОББ (Белгия) - 6.01% доходност, препоръчай за консервативни
   - Алианц (Германия) - 5.6% доходност
   - ДСК-Родина (Унгария) - 5.49% доходност
   - Минимум 50-100 лв/месец
   - ДАНЪЧНА ОБЛАГА: 10% от вноската до max 2400 лв/година

ВАЖНО:
- Месечните премии в ЛЕВОВЕ, конвертирай в EUR с /1.96
- Общата месечна вноска НЕ трябва да надвишава свободните средства
- Приоритизирай според зададените приоритети 1-7
- Дай кратко и ясно обяснение (1-2 изречения) защо препоръчваш продукта`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  provider: { type: "string", description: "MetLife, UNIQA, Partners Investments, и т.н." },
                  product_name: { type: "string" },
                  product_type: { 
                    type: "string",
                    enum: ["term_life", "ul_investment", "education_plan", "health_insurance", "pension_plan", "personal_accident", "critical_illness"]
                  },
                  beneficiary: { 
                    type: "string",
                    enum: ["partner1", "partner2", "child1", "child2", "child3", "family"]
                  },
                  term_years: { type: "number", description: "Срок в години" },
                  monthly_premium: { type: "number", description: "Месечна премия в EUR" },
                  annual_premium: { type: "number", description: "Годишна премия в EUR" },
                  coverage_amount: { type: "number", description: "Застрахователна сума в EUR (0 ако няма)" },
                  expected_value: { type: "number", description: "Очаквана стойност в EUR (0 ако няма)" },
                  strategy: { 
                    type: "string",
                    description: "Стратегия ако е инвестиция: conservative, balanced, dynamic"
                  },
                  recommendation_reason: { type: "string", description: "Кратко обяснение 1-2 изречения" },
                  priority: { type: "number", description: "1-7, 1=най-важен" }
                },
                required: ["provider", "product_name", "product_type", "beneficiary", "term_years", "monthly_premium", "recommendation_reason"]
              }
            },
            summary: { type: "string", description: "Общо резюме на препоръките" }
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
    const childrenInfo = [];
    
    for (let i = 1; i <= (analysis?.children_count || 0); i++) {
      if (analysis[`child_${i}_name`]) {
        childrenInfo.push(`- ${analysis[`child_${i}_name`]}, ${analysis[`child_${i}_birthdate`] || 'неизв. възраст'}`);
      }
    }
    
    return `
КЛИЕНТСКИ ПРОФИЛ:

═══════════════════════
ЛИЧНИ ДАННИ
═══════════════════════
Име: ${analysis?.client_first_name} ${analysis?.client_last_name}
Възраст: ${age} години (пенсионна възраст: ${analysis?.client_retirement_age || 65})
Години до пенсия: ${plan?.years_to_retirement_p1 || 30}
Пол: ${analysis?.client_gender === 'male' ? 'Мъж' : 'Жена'}
Пушач: ${analysis?.client_is_smoker ? 'Да' : 'Не'}
${analysis?.include_partner ? `
Партньор: ${analysis?.partner_first_name} ${analysis?.partner_last_name}
Партньор възраст: ${partnerAge} години
Партньор пенсионна възраст: ${analysis?.partner_retirement_age || 63}
Партньор години до пенсия: ${plan?.years_to_retirement_p2 || 0}
` : 'Семейство: Единичен клиент'}

Деца: ${analysis?.children_count || 0}
${childrenInfo.join('\n')}

═══════════════════════
ФИНАНСОВО СЪСТОЯНИЕ
═══════════════════════
Месечен доход клиент: ${analysis?.client_net_income || 0} лв (${Math.round((analysis?.client_net_income || 0) / 1.96)} EUR)
${analysis?.include_partner ? `Месечен доход партньор: ${analysis?.partner_net_income || 0} лв` : ''}
ОБЩО месечен доход: ${plan?.total_monthly_income_bgn || 0} лв (${plan?.total_monthly_income || 0} EUR)

Месечни разходи: ${plan?.total_monthly_expenses_bgn || 0} лв (${plan?.total_monthly_expenses || 0} EUR)
СВОБОДНИ средства: ${plan?.available_for_investment_bgn || 0} лв (${plan?.available_for_investment || 0} EUR/месец)

Налични спестявания:
- Разплащателна сметка: ${analysis?.client_checking_account || 0} лв
- Брой: ${analysis?.client_cash || 0} лв
- Депозити: ${analysis?.client_term_deposit || 0} лв
- Общо ликвидни: ${(analysis?.client_checking_account || 0) + (analysis?.client_cash || 0)} лв

Имущество:
- Недвижими имоти: ${analysis?.property_apartment_value || 0} лв
- Автомобили: ${analysis?.property_car_value || 0} лв
- ОБЩО активи: ${plan?.total_assets_bgn || 0} лв

Задължения: ${plan?.total_liabilities_bgn || 0} лв
Нетно богатство: ${plan?.net_worth_bgn || 0} лв

═══════════════════════
ТРУДОВ КАПИТАЛ И НУЖДИ
═══════════════════════
Трудов капитал клиент: ${Math.round((plan?.labor_capital_p1 || 0) * 1.96)} лв
${analysis?.include_partner ? `Трудов капитал партньор: ${Math.round((plan?.labor_capital_p2 || 0) * 1.96)} лв` : ''}

НУЖДИ ОТ ЗАЩИТА:
Защита при смърт клиент: ${Math.round((plan?.protection_need_p1 || 0) * 1.96)} лв
${analysis?.include_partner ? `Защита при смърт партньор: ${Math.round((plan?.protection_need_p2 || 0) * 1.96)} лв` : ''}

Резерв (${analysis?.desired_reserve_months || 6} месеца): ${Math.round((plan?.reserve_need || 0) * 1.96)} лв
Дефицит резерв: ${Math.round((plan?.reserve_gap || 0) * 1.96)} лв

Пенсионен дефицит клиент: ${Math.round((plan?.pension_gap_p1 || 0) * 1.96)} лв
${analysis?.include_partner ? `Пенсионен дефицит партньор: ${Math.round((plan?.pension_gap_p2 || 0) * 1.96)} лв` : ''}

${analysis?.children_count > 0 ? `
ОБРАЗОВАТЕЛНИ НУЖДИ:
${childrenInfo.map((child, i) => `Дете ${i+1}: ${Math.round((plan?.[`education_need_child${i+1}`] || 0) * 1.96)} лв`).join('\n')}
` : ''}

═══════════════════════
РИСКОВ ПРОФИЛ
═══════════════════════
Рисков профил: ${analysis?.risk_profile || 'moderate'}
Инвестиционен опит: ${analysis?.investment_experience || 'basic'}
Реакция при спад 10%: ${analysis?.reaction_to_10_percent_drop || 'hold'}
Реакция при ръст 20%: ${analysis?.reaction_to_20_percent_gain || 'hold'}

═══════════════════════
ПРИОРИТЕТИ (1=най-важен, 7=най-малко важен)
═══════════════════════
1. Защита на дохода: приоритет ${analysis?.priority_income_protection || '-'}
2. Защита на собственост: приоритет ${analysis?.priority_property_protection || '-'}
3. Резерв: приоритет ${analysis?.priority_reserve || '-'}
4. Жилище: приоритет ${analysis?.priority_housing || '-'}
5. Пенсия: приоритет ${analysis?.priority_pension || '-'}
6. Деца: приоритет ${analysis?.priority_children || '-'}
7. Други цели: приоритет ${analysis?.priority_other || '-'}

═══════════════════════
ИНВЕСТИЦИОНЕН КАПАЦИТЕТ
═══════════════════════
Месечно фиксирани вноски: ${analysis?.monthly_fixed_investment || 0} лв
Месечно променливи вноски: ${analysis?.monthly_variable_investment || 0} лв
Еднократни средства: ${analysis?.one_time_investment || 0} лв
`;
  };

  const processAIRecommendations = async (aiResponse, analysis, plan) => {
    const recommendations = aiResponse.recommendations || [];
    const offers = [];
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    // Сортираме по приоритет
    recommendations.sort((a, b) => (a.priority || 99) - (b.priority || 99));

    for (const rec of recommendations) {
      const beneficiaryName = getBeneficiaryName(rec.beneficiary, analysis);
      const beneficiaryAge = getBeneficiaryAge(rec.beneficiary, analysis, plan);

      const offer = {
        analysis_id: analysisId,
        plan_id: plan?.id,
        catalog_product_id: findCatalogProduct(rec, productCatalog),
        provider: rec.provider,
        product_name: rec.product_name,
        product_type: rec.product_type,
        beneficiary: rec.beneficiary,
        beneficiary_name: beneficiaryName,
        beneficiary_age: beneficiaryAge,
        term_years: Math.round(rec.term_years || 10),
        strategy: rec.strategy || null,
        monthly_premium: Math.round(rec.monthly_premium * 100) / 100,
        annual_premium: Math.round((rec.annual_premium || rec.monthly_premium * 12) * 100) / 100,
        coverage_amount: Math.round(rec.coverage_amount || 0),
        expected_value: Math.round(rec.expected_value || 0),
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

  const findCatalogProduct = (recommendation, catalog) => {
    const match = catalog.find(p => 
      p.provider === recommendation.provider && 
      p.product_type === recommendation.product_type
    );
    return match?.id || null;
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
      case 'child1': 
        return analysis?.child_1_birthdate ? 
          Math.floor((new Date() - new Date(analysis.child_1_birthdate)) / (365.25 * 24 * 60 * 60 * 1000)) : 0;
      case 'child2':
        return analysis?.child_2_birthdate ?
          Math.floor((new Date() - new Date(analysis.child_2_birthdate)) / (365.25 * 24 * 60 * 60 * 1000)) : 0;
      case 'child3':
        return analysis?.child_3_birthdate ?
          Math.floor((new Date() - new Date(analysis.child_3_birthdate)) / (365.25 * 24 * 60 * 60 * 1000)) : 0;
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