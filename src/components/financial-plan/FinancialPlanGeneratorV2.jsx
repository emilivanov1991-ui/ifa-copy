import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  Shield, 
  Calendar, 
  Phone, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Clock,
  Users,
  DollarSign,
  AlertCircle,
  Download,
  FileText
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function FinancialPlanGeneratorV2({ analysisId, analysisData }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  // Извличане на данни от анализа
  const clientData = useMemo(() => {
    if (!analysisData) return null;

    const age = analysisData.client_age || 35;
    const monthlyNetIncome = (analysisData.client_net_income || 0) + (analysisData.partner_net_income || 0);
    const monthlyExpenses = 
      (analysisData.expense_rent || 0) +
      (analysisData.expense_utilities || 0) +
      (analysisData.expense_food || 0) +
      (analysisData.expense_fuel || 0) +
      (analysisData.expense_other || 0);
    
    const monthlyBalance = monthlyNetIncome - monthlyExpenses;
    const currentSavings = 
      (analysisData.client_checking_account || 0) +
      (analysisData.client_savings_book || 0) +
      (analysisData.client_term_deposit || 0) +
      (analysisData.partner_checking_account || 0) +
      (analysisData.partner_savings_book || 0);

    const retirementAge = analysisData.client_retirement_age || 65;
    const yearsToRetirement = retirementAge - age;

    return {
      age,
      monthlyNetIncome,
      monthlyExpenses,
      monthlyBalance,
      currentSavings,
      retirementAge,
      yearsToRetirement,
      hasChildren: (analysisData.children_count || 0) > 0,
      hasProperty: analysisData.current_housing === 'owned',
      hasMortgage: (analysisData.liability_mortgage || 0) > 0
    };
  }, [analysisData]);

  // Изчисление на финансов план според правилата
  const calculatePlan = async () => {
    setIsGenerating(true);
    
    try {
      // Извличаме правилата от базата
      const rulesResponse = await base44.entities.FinancialPlanRules.filter({ is_active: true });
      const rules = rulesResponse[0]?.data || {};

      // Основна логика за план
      const maxMonthlyPlan = clientData.monthlyBalance * (rules.plan_limits?.max_monthly_plan_vs_balance || 0.4);
      
      // Препоръчителни продукти
      let monthlyPremium = 0;
      let products = [];

      // 1. MetLife Unit Linked (основен продукт)
      const ulMonthly = Math.min(maxMonthlyPlan * 0.5, clientData.monthlyBalance * 0.25);
      monthlyPremium += ulMonthly;
      products.push({
        name: 'MetLife Unit Linked',
        type: 'investment',
        monthlyPremium: ulMonthly,
        annualPremium: ulMonthly * 12,
        coverage: ulMonthly * 12 * 20, // мултипликатор
        benefit: 'Инвестиции + Защита'
      });

      // 2. ОББ УПФ (безплатно)
      products.push({
        name: 'ОББ Пенсионен фонд - оптимизация',
        type: 'pension',
        monthlyPremium: 0,
        annualPremium: 0,
        benefit: 'По-висока доходност'
      });

      // 3. Uniqa Здраве и ценност (ако има бюджет)
      if (monthlyPremium < maxMonthlyPlan * 0.8) {
        const healthMonthly = 45; // План Европа
        monthlyPremium += healthMonthly;
        products.push({
          name: 'Uniqa Здраве и ценност - План Европа',
          type: 'health',
          monthlyPremium: healthMonthly,
          annualPremium: healthMonthly * 12,
          benefit: 'Здравно покритие'
        });
      }

      // 4. Детски UL (ако има деца)
      if (clientData.hasChildren && monthlyPremium < maxMonthlyPlan * 0.9) {
        const childUL = Math.min(100, maxMonthlyPlan - monthlyPremium);
        monthlyPremium += childUL;
        products.push({
          name: 'MetLife Junior Unit Linked',
          type: 'education',
          monthlyPremium: childUL,
          annualPremium: childUL * 12,
          benefit: 'Образование + Защита на детето'
        });
      }

      // Определяне на периодичност според резерва
      const annualPlanCost = monthlyPremium * 12;
      const reserveAfterAnnualPlan = clientData.currentSavings - annualPlanCost;
      const reserveInMonths = reserveAfterAnnualPlan / clientData.monthlyNetIncome;

      let paymentFrequency = 'annual';
      if (reserveInMonths < 4) paymentFrequency = 'semiannual';
      if (reserveInMonths < 3) paymentFrequency = 'quarterly';
      if (reserveInMonths < 2) paymentFrequency = 'monthly';

      // Изчисления за презентация
      const laborCapital = clientData.monthlyNetIncome * 12 * clientData.yearsToRetirement * 1.03; // 3% растеж
      const totalTaxRelief = monthlyPremium * 12 * 0.10 * clientData.yearsToRetirement;
      const projectedValue = monthlyPremium * 12 * clientData.yearsToRetirement * 1.08; // 8% доходност
      const dailyCostInsurance = (monthlyPremium * 12 / 365).toFixed(2);

      // Създаваме записа за плана
      const plan = {
        analysis_id: analysisId,
        plan_status: 'calculated',
        total_monthly_premium: monthlyPremium,
        payment_frequency: paymentFrequency,
        products: products,
        calculations: {
          laborCapital,
          totalTaxRelief,
          projectedValue,
          dailyCostInsurance,
          reserveAfterPlan: reserveAfterAnnualPlan,
          reserveMonths: reserveInMonths
        }
      };

      // Запазване в базата
      const savedPlan = await base44.entities.FinancialPlan.create({
        analysis_id: analysisId,
        plan_status: 'calculated',
        total_monthly_premium: monthlyPremium,
        partner1_age: clientData.age,
        total_monthly_income: clientData.monthlyNetIncome,
        total_monthly_expenses: clientData.monthlyExpenses,
        available_for_investment: clientData.monthlyBalance,
        notes: JSON.stringify(plan)
      });

      setGeneratedPlan(plan);
      toast.success('✓ Финансовият план е създаден успешно!');
    } catch (error) {
      console.error(error);
      toast.error('Грешка при създаване на плана: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!clientData) {
    return (
      <Card className="bg-white shadow-lg">
        <CardContent className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-slate-600">Няма достатъчно данни от анализа за създаване на план</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section - Value Proposition */}
      <Card className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white shadow-2xl border-0 overflow-hidden">
        <CardContent className="p-8 md:p-12 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full -ml-48 -mb-48 blur-3xl" />
          
          <div className="relative z-10">
            <Badge className="bg-white/20 text-white border-white/30 mb-4 px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              Персонализиран финансов план
            </Badge>
            
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Вашият път към<br />
              <span className="text-yellow-300">финансова свобода</span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-8 max-w-2xl">
              Изцяло персонализирано решение, базирано на вашата уникална ситуация. 
              Защитете семейството си, инвестирайте в бъдещето и спестете данъци.
            </p>

            {!generatedPlan && (
              <Button 
                onClick={calculatePlan}
                disabled={isGenerating}
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50 shadow-xl text-lg px-8 py-6 rounded-xl font-semibold"
              >
                {isGenerating ? (
                  <>
                    <Clock className="w-5 h-5 mr-2 animate-spin" />
                    Генерира се...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Генерирай моя план
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {generatedPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* The Offer - Alex Hormozi Style Value Stack */}
          <Card className="bg-white shadow-xl border-2 border-blue-100">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-blue-100">
              <CardTitle className="text-2xl flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-blue-600" />
                Вашата оферта
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {/* Main Price */}
              <div className="text-center mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
                <p className="text-slate-600 text-sm mb-2">Инвестиция от само</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-5xl font-bold text-blue-700">
                    {generatedPlan.total_monthly_premium.toFixed(0)}
                  </span>
                  <div className="text-left">
                    <p className="text-xl font-semibold text-slate-900">лв/месец</p>
                    <p className="text-sm text-slate-500">или {generatedPlan.calculations.dailyCostInsurance} лв/ден</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Badge className="bg-green-100 text-green-800 border-green-300 px-4 py-2 text-sm">
                    Периодичност: {
                      generatedPlan.payment_frequency === 'annual' ? 'Годишна' :
                      generatedPlan.payment_frequency === 'semiannual' ? 'Полугодишна' :
                      generatedPlan.payment_frequency === 'quarterly' ? 'Тримесечна' : 'Месечна'
                    }
                  </Badge>
                </div>
              </div>

              {/* Value Stack */}
              <div className="space-y-4 mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Какво получавате:</h3>
                
                {generatedPlan.products.map((product, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{product.name}</p>
                      <p className="text-sm text-slate-600">{product.benefit}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-700">
                        {product.monthlyPremium === 0 ? 'БЕЗПЛАТНО' : `${product.monthlyPremium.toFixed(0)} лв/мес`}
                      </p>
                      {product.coverage && (
                        <p className="text-xs text-slate-500">Покритие: {product.coverage.toLocaleString()} лв</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              {/* The Numbers That Matter */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <p className="text-sm font-medium text-slate-700">Защитен трудов капитал</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">
                    {(generatedPlan.calculations.laborCapital / 1000000).toFixed(1)}M лв
                  </p>
                  <p className="text-xs text-slate-600 mt-1">Вашият бъдещ доход защитен</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-medium text-slate-700">Данъчно облекчение</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {generatedPlan.calculations.totalTaxRelief.toLocaleString()} лв
                  </p>
                  <p className="text-xs text-slate-600 mt-1">Спестени данъци за {clientData.yearsToRetirement} години</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <p className="text-sm font-medium text-slate-700">Прогнозна стойност</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">
                    {(generatedPlan.calculations.projectedValue / 1000000).toFixed(1)}M лв
                  </p>
                  <p className="text-xs text-slate-600 mt-1">При пенсиониране ({clientData.retirementAge} години)</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                    <p className="text-sm font-medium text-slate-700">Резерв след план</p>
                  </div>
                  <p className="text-2xl font-bold text-amber-700">
                    {generatedPlan.calculations.reserveMonths.toFixed(1)} мес
                  </p>
                  <p className="text-xs text-slate-600 mt-1">{generatedPlan.calculations.reserveAfterPlan.toLocaleString()} лв наличност</p>
                </div>
              </div>

              {/* Guarantees - Risk Reversal */}
              <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  Вашите гаранции
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="font-semibold">20 дни за канселиране</p>
                      <p className="text-sm text-slate-300">Пълно възстановяване без въпроси</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="font-semibold">Данъчно облекчение</p>
                      <p className="text-sm text-slate-300">До 10% годишно спестяване</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="font-semibold">24/7 Customer Support</p>
                      <p className="text-sm text-slate-300">Винаги на линия за вас</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="font-semibold">Личен консултант</p>
                      <p className="text-sm text-slate-300">Среща в рамките на 3 работни дни</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl text-lg py-6"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Запази среща с консултант
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="flex-1 border-2 border-blue-600 text-blue-700 hover:bg-blue-50 text-lg py-6"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Изтегли плана (PDF)
                </Button>
              </div>

              {/* Urgency/Scarcity */}
              <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900">Този план важи 30 дни</p>
                    <p className="text-sm text-amber-700">
                      Пазарните условия се променят. Запазете вашите условия днес.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Proof / Trust */}
          <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-700">500+</p>
                  <p className="text-sm text-slate-600">Доволни клиенти</p>
                </div>
                <Separator orientation="vertical" className="h-12 hidden md:block" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-700">15+ год</p>
                  <p className="text-sm text-slate-600">Опит в бранша</p>
                </div>
                <Separator orientation="vertical" className="h-12 hidden md:block" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-700">98%</p>
                  <p className="text-sm text-slate-600">Препоръки</p>
                </div>
                <Separator orientation="vertical" className="h-12 hidden md:block" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-700">50M+ лв</p>
                  <p className="text-sm text-slate-600">Защитен капитал</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}