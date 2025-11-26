import React from 'react';
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
  Minus
} from 'lucide-react';

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

  // Organized by house structure
  const foundation = [
    { key: 'reserve', label: 'Финансов резерв', icon: PiggyBank, status: getReserveStatus() },
    { key: 'income', label: 'Защита на доходите', icon: Wallet, status: getIncomeProtectionStatus() },
    { key: 'property', label: 'Защита на собствеността', icon: Shield, status: getPropertyProtectionStatus() },
  ];

  const middle = [
    { key: 'housing', label: 'Жилищно финансиране', icon: Home, status: getHousingStatus() },
  ];

  const upper = [
    { key: 'pension', label: 'Пенсионно осигуряване', icon: Umbrella, status: getPensionStatus() },
    { key: 'children', label: 'Подсигуряване на децата', icon: Baby, status: getChildrenStatus() },
  ];

  const roof = [
    { key: 'investment', label: 'Инвестиции', icon: TrendingUp, status: getInvestmentStatus() },
  ];

  const chimney = [
    { key: 'debt', label: 'Заем / Кредит', icon: CreditCard, status: getDebtStatus() },
  ];

  const allCategories = [...foundation, ...middle, ...upper, ...roof, ...chimney];

  const renderCategory = (cat, isSmall = false) => {
    const config = STATUS_CONFIG[cat.status];
    const Icon = cat.icon;
    
    return (
      <div 
        key={cat.key}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bgLight} border-l-4 ${cat.status === 'excellent' ? 'border-green-500' : cat.status === 'good' ? 'border-green-400' : cat.status === 'attention' ? 'border-amber-400' : cat.status === 'warning' ? 'border-orange-500' : cat.status === 'critical' ? 'border-red-500' : 'border-slate-300'}`}
      >
        <Icon className={`w-4 h-4 ${config.textColor}`} />
        <span className={`text-xs font-medium ${config.textColor}`}>{cat.label}</span>
      </div>
    );
  };

  return (
    <div className="bg-slate-50 rounded-xl p-6">
      <h3 className="font-semibold text-slate-900 text-center mb-2">ВАШЕТО ФИНАНСОВО ПОРТФОЛИО</h3>
      <p className="text-sm text-slate-500 text-center mb-4">Обобщение на финансовото Ви здраве</p>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mb-6 text-xs">
        {Object.entries(STATUS_CONFIG).filter(([key]) => key !== 'inactive').map(([key, config]) => (
          <div key={key} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
            <span className="text-slate-600">{config.label}</span>
          </div>
        ))}
      </div>

      {/* Abstract house structure */}
      <div className="max-w-md mx-auto space-y-2">
        {/* Chimney - Debt */}
        <div className="flex justify-end pr-8">
          <div className="w-32">
            {chimney.map(cat => renderCategory(cat))}
          </div>
        </div>

        {/* Roof - Investments */}
        <div className="bg-slate-200 rounded-t-xl p-3 mx-4">
          <div className="text-center text-xs text-slate-500 mb-1 font-medium">▲ ПОКРИВ</div>
          <div className="flex justify-center">
            {roof.map(cat => renderCategory(cat))}
          </div>
        </div>

        {/* Upper floor - Pension & Children */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 mx-2">
          <div className="grid grid-cols-2 gap-2">
            {upper.map(cat => renderCategory(cat))}
          </div>
        </div>

        {/* Middle - Housing */}
        <div className="bg-white border-2 border-slate-300 rounded-lg p-3">
          <div className="flex justify-center">
            {middle.map(cat => renderCategory(cat))}
          </div>
        </div>

        {/* Foundation - Reserve, Income, Property Protection */}
        <div className="bg-slate-300 rounded-b-xl p-3">
          <div className="text-center text-xs text-slate-600 mb-1 font-medium">▼ ОСНОВА</div>
          <div className="grid grid-cols-3 gap-2">
            {foundation.map(cat => renderCategory(cat))}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-2 mt-6 pt-4 border-t border-slate-200">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {allCategories.filter(c => c.status === 'excellent' || c.status === 'good').length}
          </div>
          <div className="text-xs text-slate-500">Добре</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-amber-500">
            {allCategories.filter(c => c.status === 'attention').length}
          </div>
          <div className="text-xs text-slate-500">Внимание</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-500">
            {allCategories.filter(c => c.status === 'warning' || c.status === 'critical').length}
          </div>
          <div className="text-xs text-slate-500">Критично</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-slate-400">
            {allCategories.filter(c => c.status === 'inactive').length}
          </div>
          <div className="text-xs text-slate-500">Неактивно</div>
        </div>
      </div>
    </div>
  );
}