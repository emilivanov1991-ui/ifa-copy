import React, { useState, useEffect } from 'react';
import { 
  Home, 
  PiggyBank, 
  Umbrella, 
  Baby, 
  Shield, 
  Wallet, 
  TrendingUp,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Minus,
  Clock,
  TrendingDown,
  Loader2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

// Status colors and icons
const STATUS_CONFIG = {
  excellent: { color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50', label: 'Отлично', icon: CheckCircle },
  good: { color: 'bg-green-400', textColor: 'text-green-600', bgLight: 'bg-green-50', label: 'Добре', icon: CheckCircle },
  attention: { color: 'bg-amber-400', textColor: 'text-amber-700', bgLight: 'bg-amber-50', label: 'Внимание', icon: AlertTriangle },
  warning: { color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50', label: 'Препоръчително', icon: AlertTriangle },
  critical: { color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50', label: 'Критично', icon: XCircle },
  inactive: { color: 'bg-slate-300', textColor: 'text-slate-500', bgLight: 'bg-slate-50', label: 'Неактивно', icon: Minus },
};

export default function FinancialHealthCard({ data }) {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Generate AI analysis
  const generateAnalysis = async () => {
    setIsLoading(true);
    
    const analysisContext = {
      clientAge: data.client_age,
      partnerAge: data.include_partner ? data.partner_age : null,
      childrenCount: data.children_count || 0,
      currentHousing: data.current_housing,
      planningHousingChange: data.planning_housing_change,
      financingMethod: data.financing_method,
      hasMortgage: data.current_housing_has_mortgage,
      clientNetIncome: data.client_net_income || data.client_monthly_net_income,
      partnerNetIncome: data.include_partner ? (data.partner_net_income || data.partner_monthly_net_income) : 0,
      totalSavings: (data.client_checking_account || 0) + (data.client_cash || 0) + (data.client_savings_account || 0) + 
        (data.include_partner ? ((data.partner_checking_account || 0) + (data.partner_cash || 0)) : 0),
      desiredReserve: data.desired_reserve_amount,
      clientRetirementAge: data.client_retirement_age,
      clientDesiredPension: data.client_desired_pension,
      clientExpectedPension: data.client_expected_state_pension,
      hasVoluntaryPension: data.client_pillar_3,
      hasProperty: data.has_property_1 || data.has_property_2 || data.has_property_3,
      hasCar: data.has_car_1 || data.has_car_2 || data.has_car_3,
      propertyInsured: data.property_1_has_insurance || data.property_2_has_insurance || data.property_3_has_insurance,
      carInsured: data.car_1_has_casco || data.car_2_has_casco || data.car_3_has_casco,
      hasIncomeProtection: data.client_has_income_protection,
      incomeRisks: {
        layoff: data.client_risk_layoff,
        maternity: data.client_risk_maternity,
        sickLeave: data.client_risk_sick_leave,
        disability: data.client_risk_disability,
        death: data.client_risk_death
      },
      childrenEducationCosts: data.children_education_costs,
      skipChildrenSection: data.skip_children_section,
      totalDebt: (data.liability_mortgage_remaining || 0) + (data.liability_consumer_loans_remaining || 0) + 
        (data.liability_credit_cards_remaining || 0),
      monthlyDebtPayments: (data.liability_mortgage_monthly || 0) + (data.liability_consumer_loans_monthly || 0)
    };

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Ти си опитен финансов консултант в България. Анализирай следните данни за клиент и дай ТОЧНО 7 препоръки, разделени в 3 категории.

ДАННИ ЗА КЛИЕНТА:
${JSON.stringify(analysisContext, null, 2)}

ВАЖНО: Бъди много sales-ориентиран! Използвай тактики като:
- Sense of urgency (спешност) - "всеки изгубен месец струва X лева"
- Fear of missing out - "87% от успешните хора вече правят това"
- Social proof - "клиенти като Вас обикновено..."
- Loss aversion - фокусирай се на загубите, не на печалбите
- Емоционални trigger-и за семейство и сигурност

АКЦЕНТИ (ако са приложими):
1. ЗАСТРАХОВАНЕ - подчертай рисковете от липса на защита
2. ПЕНСИОННО ОСИГУРЯВАНЕ - покажи разликата между желана и очаквана пенсия
3. ПОДСИГУРЯВАНЕ НА ДЕЦА - емоционален апел за бъдещето им
4. ИПОТЕЧНО КРЕДИТИРАНЕ - важността на правилна подготовка

Отговори САМО с JSON в следния формат:
{
  "positives": [
    {"title": "кратко заглавие", "text": "похвала и насърчение, max 2 изречения"}
  ],
  "attention": [
    {"title": "заглавие", "text": "какво трябва да се обмисли, без да е критично, max 2 изречения"}
  ],
  "critical": [
    {"title": "СПЕШНО заглавие", "text": "силен sales message с urgency, max 3 изречения", "potential_loss": число в евро ако е приложимо}
  ],
  "pension_gap_yearly": число (разлика между желана и очаквана пенсия годишно),
  "years_to_retirement": число,
  "missed_savings_10_years": число (пропуснати спестявания за 10 години ако не се действа)
}

Дай точно 2 positive, 2 attention, 3 critical точки. Бъди конкретен с числа и проценти.`,
        response_json_schema: {
          type: "object",
          properties: {
            positives: { type: "array", items: { type: "object", properties: { title: { type: "string" }, text: { type: "string" } } } },
            attention: { type: "array", items: { type: "object", properties: { title: { type: "string" }, text: { type: "string" } } } },
            critical: { type: "array", items: { type: "object", properties: { title: { type: "string" }, text: { type: "string" }, potential_loss: { type: "number" } } } },
            pension_gap_yearly: { type: "number" },
            years_to_retirement: { type: "number" },
            missed_savings_10_years: { type: "number" }
          }
        }
      });
      
      setAiAnalysis(result);
      setHasGenerated(true);
    } catch (error) {
      console.error('AI Analysis error:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!hasGenerated) {
      generateAnalysis();
    }
  }, []);
  // Calculate status for each category
  const getHousingStatus = () => {
    if (data.planning_housing_change === false && !data.current_housing_has_mortgage) {
      if (data.current_housing === 'owned') return 'excellent';
      return 'inactive';
    }
    if (data.current_housing === 'owned' && !data.current_housing_has_mortgage) return 'excellent';
    if (data.current_housing === 'owned' && data.current_housing_has_mortgage) return 'good';
    if (data.planning_housing_change && data.financing_method === 'cash') return 'good';
    if (data.planning_housing_change && data.financing_method === 'cash_and_loan') return 'attention';
    if (data.planning_housing_change && data.financing_method === 'loan') return 'warning';
    return 'attention';
  };

  const getReserveStatus = () => {
    const clientReserve = (data.client_checking_account || 0) + (data.client_cash || 0) + 
      (data.client_savings_account || 0) + (data.client_term_deposit || 0);
    const partnerReserve = data.include_partner ? 
      ((data.partner_checking_account || 0) + (data.partner_cash || 0) + 
       (data.partner_savings_account || 0) + (data.partner_term_deposit || 0)) : 0;
    const totalReserve = clientReserve + partnerReserve;
    const desiredReserve = data.desired_reserve_amount || 0;
    
    if (desiredReserve === 0) return 'attention';
    const ratio = totalReserve / desiredReserve;
    if (ratio >= 1) return 'excellent';
    if (ratio >= 0.7) return 'good';
    if (ratio >= 0.4) return 'attention';
    if (ratio >= 0.2) return 'warning';
    return 'critical';
  };

  const getPensionStatus = () => {
    const clientDesired = data.client_desired_pension || 0;
    const clientExpected = data.client_expected_state_pension || 0;
    const clientHasVoluntary = data.client_pillar_3;
    
    if (clientDesired === 0) return 'attention';
    
    const gap = clientDesired - clientExpected;
    if (gap <= 0) return 'excellent';
    if (clientHasVoluntary && gap < clientDesired * 0.3) return 'good';
    if (clientHasVoluntary) return 'attention';
    if (gap < clientDesired * 0.5) return 'warning';
    return 'critical';
  };

  const getChildrenStatus = () => {
    if (data.skip_children_section) return 'inactive';
    const childrenCount = data.children_count || 0;
    if (childrenCount === 0) return 'inactive';
    
    const totalNeeded = (data.children_education_costs || 0) + (data.children_birth_costs || 0) + 
      (data.children_start_life_costs || 0);
    const currentSavings = data.children_current_savings || 0;
    
    if (totalNeeded === 0) return 'attention';
    const ratio = currentSavings / totalNeeded;
    if (ratio >= 0.8) return 'excellent';
    if (ratio >= 0.5) return 'good';
    if (ratio >= 0.2) return 'attention';
    return 'warning';
  };

  const getPropertyProtectionStatus = () => {
    const hasProperty = data.has_property_1 || data.has_property_2 || data.has_property_3;
    const hasCar = data.has_car_1 || data.has_car_2 || data.has_car_3;
    
    if (!hasProperty && !hasCar) return 'inactive';
    
    let insuredCount = 0;
    let totalCount = 0;
    
    if (data.has_property_1) { totalCount++; if (data.property_1_has_insurance) insuredCount++; }
    if (data.has_property_2) { totalCount++; if (data.property_2_has_insurance) insuredCount++; }
    if (data.has_property_3) { totalCount++; if (data.property_3_has_insurance) insuredCount++; }
    if (data.has_car_1) { totalCount++; if (data.car_1_has_casco) insuredCount++; }
    if (data.has_car_2) { totalCount++; if (data.car_2_has_casco) insuredCount++; }
    if (data.has_car_3) { totalCount++; if (data.car_3_has_casco) insuredCount++; }
    
    if (totalCount === 0) return 'inactive';
    const ratio = insuredCount / totalCount;
    if (ratio >= 1) return 'excellent';
    if (ratio >= 0.7) return 'good';
    if (ratio >= 0.4) return 'attention';
    return 'warning';
  };

  const getIncomeProtectionStatus = () => {
    const clientHasProtection = data.client_has_income_protection;
    const partnerHasProtection = data.include_partner ? data.partner_has_income_protection : true;
    
    const clientHasRisks = data.client_risk_layoff || data.client_risk_maternity || 
      data.client_risk_sick_leave || data.client_risk_disability || data.client_risk_death;
    const partnerHasRisks = data.include_partner ? 
      (data.partner_risk_layoff || data.partner_risk_maternity || 
       data.partner_risk_sick_leave || data.partner_risk_disability || data.partner_risk_death) : false;
    
    if (!clientHasRisks && !partnerHasRisks) return 'good';
    
    if (clientHasProtection && partnerHasProtection) return 'excellent';
    if (clientHasProtection || partnerHasProtection) return 'attention';
    if (clientHasRisks || partnerHasRisks) return 'warning';
    return 'critical';
  };

  const getInvestmentStatus = () => {
    const mediumTerm = (data.client_mutual_funds || 0) + (data.client_crypto || 0) + (data.client_gold || 0);
    const partnerMedium = data.include_partner ? 
      ((data.partner_mutual_funds || 0) + (data.partner_crypto || 0) + (data.partner_gold || 0)) : 0;
    const total = mediumTerm + partnerMedium;
    
    const monthlyIncome = (data.client_net_income || 0) + 
      (data.include_partner ? (data.partner_net_income || 0) : 0);
    
    if (monthlyIncome === 0) return 'attention';
    const ratio = total / (monthlyIncome * 12);
    if (ratio >= 1) return 'excellent';
    if (ratio >= 0.5) return 'good';
    if (ratio >= 0.2) return 'attention';
    if (ratio > 0) return 'warning';
    return 'critical';
  };

  const getDebtStatus = () => {
    const totalDebt = (data.liability_mortgage_remaining || 0) + (data.liability_consumer_loans_remaining || 0) +
      (data.liability_credit_cards_remaining || 0) + (data.liability_leasing_remaining || 0) + 
      (data.liability_overdraft_remaining || 0);
    
    const monthlyPayments = (data.liability_mortgage_monthly || 0) + (data.liability_consumer_loans_monthly || 0) +
      (data.liability_credit_cards_monthly || 0) + (data.liability_leasing_monthly || 0) + 
      (data.liability_overdraft_monthly || 0);
    
    const monthlyIncome = (data.client_net_income || 0) + 
      (data.include_partner ? (data.partner_net_income || 0) : 0);
    
    if (totalDebt === 0) return 'excellent';
    if (monthlyIncome === 0) return 'attention';
    
    const debtToIncomeRatio = monthlyPayments / monthlyIncome;
    if (debtToIncomeRatio <= 0.2) return 'good';
    if (debtToIncomeRatio <= 0.35) return 'attention';
    if (debtToIncomeRatio <= 0.5) return 'warning';
    return 'critical';
  };

  // Categories organized by house structure
  const debtStatus = getDebtStatus();
  const investmentStatus = getInvestmentStatus();
  const pensionStatus = getPensionStatus();
  const childrenStatus = getChildrenStatus();
  const housingStatus = getHousingStatus();
  const propertyStatus = getPropertyProtectionStatus();
  const incomeStatus = getIncomeProtectionStatus();
  const reserveStatus = getReserveStatus();

  const getStatusColor = (status) => {
    switch(status) {
      case 'excellent': return 'bg-green-200 border-green-400';
      case 'good': return 'bg-green-100 border-green-300';
      case 'attention': return 'bg-amber-100 border-amber-300';
      case 'warning': return 'bg-orange-100 border-orange-300';
      case 'critical': return 'bg-red-100 border-red-300';
      default: return 'bg-slate-100 border-slate-300';
    }
  };

  const getBarColor = (status) => {
    switch(status) {
      case 'excellent': return 'bg-green-300';
      case 'good': return 'bg-green-200';
      case 'attention': return 'bg-amber-200';
      case 'warning': return 'bg-orange-200';
      case 'critical': return 'bg-red-200';
      default: return 'bg-slate-200';
    }
  };

  const allStatuses = [debtStatus, investmentStatus, pensionStatus, childrenStatus, housingStatus, propertyStatus, incomeStatus, reserveStatus];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="font-semibold text-rose-700 text-center mb-6 text-lg tracking-wide">ВАШЕТО НАСТОЯЩО ПОРТФОЛИО</h3>
      
      {/* House visualization */}
      <div className="relative max-w-lg mx-auto">
        {/* Background horizontal lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-0.5 bg-blue-100 w-full"></div>
          ))}
        </div>

        <div className="relative">
          {/* Chimney with smoke - Debt */}
          <div className="absolute left-16 -top-8 z-10">
            {/* Smoke */}
            <div className="absolute -top-6 left-2">
              <div className={`w-8 h-4 ${getBarColor(debtStatus)} rounded-full opacity-60 mb-1`}></div>
              <div className={`w-6 h-3 ${getBarColor(debtStatus)} rounded-full opacity-40 ml-1`}></div>
            </div>
            {/* Chimney */}
            <div className={`w-12 h-16 ${getStatusColor(debtStatus)} border-2 rounded-t flex items-center justify-center`}>
              <span className="text-xs text-slate-600 font-medium text-center leading-tight">Заем/<br/>Кредит</span>
            </div>
          </div>

          {/* Roof section */}
          <div className="relative pt-8">
            {/* Roof shape */}
            <div className="relative mx-8">
              {/* Left roof slope */}
              <div className="absolute left-0 top-0 w-1/2 h-16 bg-rose-300 origin-bottom-left transform -skew-y-6 rounded-tl-lg"></div>
              {/* Right roof slope */}
              <div className="absolute right-0 top-0 w-1/2 h-16 bg-rose-400 origin-bottom-right transform skew-y-6 rounded-tr-lg"></div>
              
              {/* Roof content - Investments */}
              <div className="relative z-10 pt-4 pb-2 px-4">
                <div className={`${getStatusColor(investmentStatus)} border-2 rounded-lg px-4 py-2 mx-auto max-w-xs text-center`}>
                  <span className="text-sm text-slate-700 font-medium">Инвестиции</span>
                </div>
              </div>
            </div>

            {/* House body */}
            <div className="bg-rose-50 border-l-4 border-r-4 border-rose-300 mx-4 relative">
              {/* Upper floor - Pension & Children */}
              <div className="grid grid-cols-2 gap-3 p-4 border-b border-rose-200">
                <div className={`${getStatusColor(pensionStatus)} border-2 rounded-lg px-3 py-3 text-center`}>
                  <span className="text-xs text-slate-700 font-medium">Пенсионно<br/>осигуряване</span>
                </div>
                <div className={`${getStatusColor(childrenStatus)} border-2 rounded-lg px-3 py-3 text-center`}>
                  <span className="text-xs text-slate-700 font-medium">Подсигуряване<br/>на децата</span>
                </div>
              </div>

              {/* Middle - Housing */}
              <div className="p-4 border-b border-rose-200">
                <div className={`${getStatusColor(housingStatus)} border-2 rounded-lg px-4 py-3 text-center mx-auto max-w-xs`}>
                  <span className="text-sm text-slate-700 font-medium">Жилищно<br/>финансиране</span>
                </div>
              </div>
            </div>

            {/* Foundation */}
            <div className="bg-slate-200 mx-2 p-4 rounded-b-lg border-b-4 border-slate-400">
              <div className="grid grid-cols-3 gap-2">
                <div className={`${getStatusColor(propertyStatus)} border-2 rounded-lg px-2 py-3 text-center`}>
                  <span className="text-xs text-slate-700 font-medium leading-tight">Защита на собствеността</span>
                </div>
                <div className={`${getStatusColor(incomeStatus)} border-2 rounded-lg px-2 py-3 text-center`}>
                  <span className="text-xs text-slate-700 font-medium leading-tight">Защита на доходите</span>
                </div>
                <div className={`${getStatusColor(reserveStatus)} border-2 rounded-lg px-2 py-3 text-center`}>
                  <span className="text-xs text-slate-700 font-medium leading-tight">Създаване на финансов резерв</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-6 pt-4 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-300 border border-green-400"></div>
          <span className="text-slate-600">Отлично/Добре</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-200 border border-amber-300"></div>
          <span className="text-slate-600">Внимание</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-200 border border-orange-300"></div>
          <span className="text-slate-600">Препоръчително</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-200 border border-red-300"></div>
          <span className="text-slate-600">Критично</span>
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="mt-8 pt-6 border-t-2 border-slate-200">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-lg">ПЕРСОНАЛИЗИРАН ФИНАНСОВ АНАЛИЗ</h3>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-slate-500 text-sm">Анализираме Вашите данни...</p>
          </div>
        ) : aiAnalysis ? (
          <div className="space-y-6">
            {/* Positive Points */}
            {aiAnalysis.positives?.length > 0 && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Поздравления! Правите нещата правилно:</h4>
                </div>
                <div className="space-y-3">
                  {aiAnalysis.positives.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 border border-green-100">
                      <p className="font-medium text-green-700">{item.title}</p>
                      <p className="text-sm text-green-600 mt-1">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attention Points */}
            {aiAnalysis.attention?.length > 0 && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h4 className="font-semibold text-amber-800">Области за подобрение:</h4>
                </div>
                <div className="space-y-3">
                  {aiAnalysis.attention.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 border border-amber-100">
                      <p className="font-medium text-amber-700">{item.title}</p>
                      <p className="text-sm text-amber-600 mt-1">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Critical Points - Sales focused */}
            {aiAnalysis.critical?.length > 0 && (
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border-2 border-red-300 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-6 h-6 text-red-600 animate-pulse" />
                  <h4 className="font-bold text-red-800 text-lg">⚠️ ИЗИСКВА НЕЗАБАВНО ВНИМАНИЕ:</h4>
                </div>
                <div className="space-y-4">
                  {aiAnalysis.critical.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 border-l-4 border-red-500 shadow">
                      <p className="font-bold text-red-700 text-lg">{item.title}</p>
                      <p className="text-red-600 mt-2">{item.text}</p>
                      {item.potential_loss > 0 && (
                        <div className="mt-3 bg-red-100 rounded-lg p-2 inline-block">
                          <span className="text-red-800 font-bold">
                            Потенциална загуба: €{item.potential_loss.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visualization Charts */}
            {(aiAnalysis.pension_gap_yearly > 0 || aiAnalysis.missed_savings_10_years > 0) && (
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                {/* Pension Gap Chart */}
                {aiAnalysis.pension_gap_yearly > 0 && aiAnalysis.years_to_retirement > 0 && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h5 className="font-semibold text-slate-700 mb-2 text-sm">📉 Пенсионен дефицит през годините</h5>
                    <p className="text-xs text-slate-500 mb-3">Ако НЕ предприемете действия сега:</p>
                    <ResponsiveContainer width="100%" height={150}>
                      <AreaChart data={Array.from({ length: Math.min(aiAnalysis.years_to_retirement, 30) }, (_, i) => ({
                        year: `Год ${i + 1}`,
                        loss: aiAnalysis.pension_gap_yearly * (i + 1)
                      }))}>
                        <XAxis dataKey="year" tick={{ fontSize: 10 }} interval={4} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v) => [`€${v.toLocaleString()}`, 'Натрупана загуба']} />
                        <Area type="monotone" dataKey="loss" stroke="#ef4444" fill="#fecaca" />
                      </AreaChart>
                    </ResponsiveContainer>
                    <p className="text-center text-red-600 font-bold mt-2">
                      Общо: €{(aiAnalysis.pension_gap_yearly * aiAnalysis.years_to_retirement).toLocaleString()} пропуснати!
                    </p>
                  </div>
                )}

                {/* Missed Savings Comparison */}
                {aiAnalysis.missed_savings_10_years > 0 && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h5 className="font-semibold text-slate-700 mb-2 text-sm">💰 Сценарий: С план vs. Без план (10 години)</h5>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={[
                        { name: 'Без план', value: 0, fill: '#fca5a5' },
                        { name: 'С план', value: aiAnalysis.missed_savings_10_years, fill: '#86efac' }
                      ]}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v) => [`€${v.toLocaleString()}`, 'Стойност']} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {[
                            { name: 'Без план', value: 0, fill: '#fca5a5' },
                            { name: 'С план', value: aiAnalysis.missed_savings_10_years, fill: '#86efac' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-center text-green-600 font-bold mt-2">
                      Разлика: €{aiAnalysis.missed_savings_10_years.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Urgency CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white text-center">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <h4 className="font-bold text-xl mb-2">Времето работи срещу Вас!</h4>
              <p className="text-blue-100 mb-4">
                Всеки месец без финансов план означава пропуснати възможности. 
                <br/>
                <span className="font-semibold">93% от нашите клиенти</span> започват да виждат резултати още през първата година.
              </p>
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Средна доходност: 7-12% годишно</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <button
              onClick={generateAnalysis}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              Генерирай персонализиран анализ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}