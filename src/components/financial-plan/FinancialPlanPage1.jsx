import React, { useMemo } from 'react';
import { EUR_BGN_RATE } from './FinancialPlanConstants';

/**
 * Финансов План - Страница 1
 * Обобщение на месечния депозит, разпределение и приоритети
 */
export default function FinancialPlanPage1({ analysis, plan, productOffers = [] }) {
  
  const calculations = useMemo(() => {
    if (!analysis) return null;

    // === МЕСЕЧЕН ДЕПОЗИТ ===
    // Месечен баланс + Разходи за заеми/кредити + Разходи за застраховане
    const monthlyBalance = (analysis.client_net_income || 0) + 
                          (analysis.partner_net_income || 0) + 
                          (analysis.client_other_monthly_income || 0) + 
                          (analysis.partner_other_monthly_income || 0);
    
    // Общи месечни разходи
    const totalExpenses = (analysis.expense_rent || 0) +
                         (analysis.expense_utilities || 0) +
                         (analysis.expense_phone || 0) +
                         (analysis.expense_internet || 0) +
                         (analysis.expense_tv || 0) +
                         (analysis.expense_other_housing || 0) +
                         (analysis.expense_fuel || 0) +
                         (analysis.expense_car_maintenance || 0) +
                         (analysis.expense_car_other || 0) +
                         (analysis.expense_food || 0) +
                         (analysis.expense_clothing || 0) +
                         (analysis.expense_culture || 0) +
                         (analysis.expense_travel || 0) +
                         (analysis.expense_children || 0) +
                         (analysis.expense_cigarettes || 0) +
                         (analysis.expense_pets || 0) +
                         (analysis.expense_vacation || 0) +
                         (analysis.expense_business || 0) +
                         (analysis.expense_other || 0);
    
    // Съществуващи разходи за заеми
    const existingLoans = (analysis.liability_mortgage || 0) +
                         (analysis.liability_consumer_loans || 0) +
                         (analysis.liability_credit_cards || 0) +
                         (analysis.liability_leasing || 0) +
                         (analysis.liability_overdraft || 0);
    
    // Съществуващи разходи за застраховки
    const existingInsurance = (analysis.insurance_life || 0) +
                             (analysis.insurance_property || 0) +
                             (analysis.insurance_household || 0) +
                             (analysis.insurance_civil || 0) +
                             (analysis.insurance_casco || 0) +
                             (analysis.insurance_other || 0);
    
    // Свободни средства = Доходи - Разходи (без заеми и застраховки, те се оптимизират)
    const freeMonthlyBalance = monthlyBalance - totalExpenses;
    
    // Месечен депозит = свободен баланс + текущи заеми + текущи застраховки (за оптимизация)
    const monthlyDeposit = freeMonthlyBalance + existingLoans + existingInsurance;

    // === ИЗЧИСЛЯВАНЕ ОТ ПРОДУКТОВИ ОФЕРТИ ===
    let propertyProtection = 0;      // Защита на собствеността
    let incomeProtection = 0;        // Защита на дохода
    let loansAndCredits = 0;         // Заеми и кредити
    let totalFixedMonthly = 0;       // Фиксиран (всички продукти)

    // Групиране по тип продукт
    productOffers.forEach(offer => {
      const monthlyPremium = (offer.monthly_premium || 0) * EUR_BGN_RATE;
      
      switch (offer.product_type) {
        case 'ul_investment':
        case 'education_plan':
        case 'term_life':
        case 'health_insurance':
        case 'critical_illness':
        case 'personal_accident':
          incomeProtection += monthlyPremium;
          break;
        case 'property':
        case 'car_insurance':
          propertyProtection += monthlyPremium;
          break;
        case 'loan':
        case 'mortgage':
          loansAndCredits += monthlyPremium;
          break;
      }
      totalFixedMonthly += monthlyPremium;
    });

    // Ако няма оферти, използваме данни от плана
    if (productOffers.length === 0 && plan) {
      totalFixedMonthly = (plan.total_monthly_premium || 0) * EUR_BGN_RATE;
      incomeProtection = totalFixedMonthly * 0.8; // Примерно разпределение
      propertyProtection = totalFixedMonthly * 0.1;
      loansAndCredits = totalFixedMonthly * 0.1;
    }

    // Фиксиран = сума на всички финансови продукти
    const fixedAmount = totalFixedMonthly;
    
    // Променлив = Месечен депозит - Фиксиран
    const variableAmount = monthlyDeposit - fixedAmount;
    
    // Създаване на активи = Месечен депозит - Защита собственост - Защита доход - Заеми
    const assetCreation = monthlyDeposit - propertyProtection - incomeProtection - loansAndCredits;

    // === ЕДНОКРАТЕН РЕЗЕРВ ===
    // Разплащателна сметка + Краткосрочни спестявания
    const oneTimeReserve = (analysis.asset_checking_account || 0) + 
                          (analysis.asset_short_term_savings || 0);

    // === ИМУЩЕСТВО И ЗАДЪЛЖЕНИЯ ===
    // Общо активи
    const totalAssets = (analysis.property_apartment_value || 0) +
                       (analysis.property_house_value || 0) +
                       (analysis.property_car_value || 0) +
                       (analysis.property_other_value || 0) +
                       (analysis.asset_checking_account || 0) +
                       (analysis.asset_long_term_savings || 0) +
                       (analysis.asset_medium_term_savings || 0) +
                       (analysis.asset_short_term_savings || 0);
    
    // Общо задължения (като стойност, не месечна вноска)
    const totalLiabilities = existingLoans * 12 * 5; // Примерна оценка на общ дълг
    
    // Нетно имущество
    const netWorth = totalAssets - totalLiabilities;

    // === ВЪЗРАСТИ ===
    const clientAge = analysis.client_age || 35;
    const partnerAge = analysis.partner_age || 32;
    const clientRetirementAge = analysis.client_retirement_age || 65;
    const partnerRetirementAge = analysis.partner_retirement_age || 65;

    // === ПРИОРИТЕТИ ===
    // Сортиране по приоритет от анализа
    const priorities = [
      { rank: analysis.priority_income_protection || 1, name: 'Защита на дохода' },
      { rank: analysis.priority_reserve || 2, name: 'Увеличаване на резервите' },
      { rank: analysis.priority_housing || 3, name: 'Ново жилище' },
      { rank: analysis.priority_pension || 4, name: 'Достойна пенсия' },
      { rank: analysis.priority_children || 5, name: 'Подсигуряване на децата' },
      { rank: analysis.priority_property_protection || 6, name: 'Защита на собствеността' }
    ].sort((a, b) => a.rank - b.rank);

    // === ДАНЪЧНО ОБЛЕКЧЕНИЕ ===
    let taxBenefit = 0;

    // Unit Linked клиент - до пенсия
    const clientYearsToRetirement = Math.max(0, clientRetirementAge - clientAge);
    const partnerYearsToRetirement = Math.max(0, partnerRetirementAge - partnerAge);

    productOffers.forEach(offer => {
      const annualPremium = (offer.annual_premium || (offer.monthly_premium || 0) * 12) * EUR_BGN_RATE;
      
      if (offer.product_type === 'ul_investment') {
        if (offer.beneficiary === 'partner1') {
          taxBenefit += annualPremium * clientYearsToRetirement * 0.10;
        } else if (offer.beneficiary === 'partner2') {
          taxBenefit += annualPremium * partnerYearsToRetirement * 0.10;
        }
      }
      
      if (offer.product_type === 'education_plan') {
        // Junior UL - до 20 години на детето
        const childAge = offer.beneficiary_age || 5;
        const yearsTo20 = Math.max(0, 20 - childAge);
        taxBenefit += annualPremium * yearsTo20 * 0.10;
      }
      
      if (offer.product_type === 'term_life') {
        if (offer.beneficiary === 'partner1') {
          taxBenefit += annualPremium * clientYearsToRetirement * 0.10;
        } else if (offer.beneficiary === 'partner2') {
          taxBenefit += annualPremium * partnerYearsToRetirement * 0.10;
        }
      }
      
      if (['health_insurance', 'critical_illness'].includes(offer.product_type)) {
        if (offer.beneficiary === 'partner1') {
          taxBenefit += annualPremium * clientYearsToRetirement * 0.10;
        } else if (offer.beneficiary === 'partner2') {
          taxBenefit += annualPremium * partnerYearsToRetirement * 0.10;
        }
      }
    });

    // Ако няма оферти, примерно изчисление от план
    if (productOffers.length === 0 && plan) {
      const avgYears = (clientYearsToRetirement + partnerYearsToRetirement) / 2;
      taxBenefit = (plan.total_monthly_premium || 0) * 12 * EUR_BGN_RATE * avgYears * 0.10;
    }

    return {
      monthlyDeposit: Math.round(monthlyDeposit),
      fixedAmount: Math.round(fixedAmount),
      variableAmount: Math.round(variableAmount),
      propertyProtection: Math.round(propertyProtection),
      incomeProtection: Math.round(incomeProtection),
      loansAndCredits: Math.round(loansAndCredits),
      assetCreation: Math.round(assetCreation),
      oneTimeReserve: Math.round(oneTimeReserve),
      totalAssets: Math.round(totalAssets),
      totalLiabilities: Math.round(totalLiabilities),
      netWorth: Math.round(netWorth),
      clientAge,
      partnerAge,
      clientRetirementAge,
      partnerRetirementAge,
      priorities,
      taxBenefit: Math.round(taxBenefit)
    };
  }, [analysis, plan, productOffers]);

  if (!calculations) {
    return <div className="p-8 text-center text-slate-500">Няма данни за анализ</div>;
  }

  const formatCurrency = (value) => {
    return value.toLocaleString('bg-BG') + ' лв.';
  };

  const advantages = [
    { key: 'flexibility', label: 'Гъвкавост', desc: 'възможност да се променят сумите, определени за отделните цели' },
    { key: 'variability', label: 'Променливост', desc: 'възможност да се добавят и променят финансовите решения' },
    { key: 'quality', label: 'Качество', desc: 'финансови решения от качествени институции' },
    { key: 'reliability', label: 'Надежност', desc: 'във всяка ситуация ще има финансов съветник, който ще се грижи за Вас' },
    { key: 'service', label: 'Обслужване', desc: 'актуализиране при промяна на финансовото състояние или на пазара' },
    { key: 'tax', label: 'Данъчно облекчение', desc: 'спестяване от данъци за целия период' }
  ];

  return (
    <div className="bg-white p-8 min-h-[800px] relative font-sans text-sm">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <span className="text-[200px] font-bold text-slate-400 rotate-[-30deg]">Страница 1</span>
      </div>

      <div className="relative z-10">
        {/* Header - Месечен депозит */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-red-700 mb-4">Месечен депозит</h2>
          
          <div className="grid grid-cols-2 gap-8">
            {/* Лява колона - Стойности */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="w-48"></span>
                <span className="font-bold text-lg">{formatCurrency(calculations.monthlyDeposit)}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="w-48 font-semibold">Фиксиран</span>
                <span className="font-medium">{formatCurrency(calculations.fixedAmount)}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="w-48 font-semibold">Променлив</span>
                <span className="font-medium">{formatCurrency(calculations.variableAmount)}</span>
              </div>

              <div className="pt-4">
                <h3 className="text-red-700 font-bold mb-2">Защита на собствеността</h3>
                <div className="pl-4">{formatCurrency(calculations.propertyProtection)}</div>
              </div>

              <div className="pt-2">
                <h3 className="text-red-700 font-bold mb-2">Защита на дохода</h3>
                <div className="pl-4">{formatCurrency(calculations.incomeProtection)}</div>
              </div>

              <div className="pt-2">
                <h3 className="text-red-700 font-bold mb-2">Заеми и кредити</h3>
                <div className="pl-4">{formatCurrency(calculations.loansAndCredits)}</div>
              </div>

              <div className="pt-2">
                <h3 className="text-red-700 font-bold mb-2">Създаване на активи</h3>
                <div className="pl-4">{formatCurrency(calculations.assetCreation)}</div>
              </div>

              <div className="pt-2">
                <h3 className="text-red-700 font-bold mb-2">Еднократен резерв</h3>
                <div className="pl-4">{formatCurrency(calculations.oneTimeReserve)}</div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-4">
                  <span className="w-48 font-semibold">Имущество</span>
                  <span>{formatCurrency(calculations.totalAssets)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-48 font-semibold">Задължения</span>
                  <span>{formatCurrency(calculations.totalLiabilities)}</span>
                </div>
                <div className="flex items-center gap-4 font-bold">
                  <span className="w-48">Общо нетно имущество</span>
                  <span>{formatCurrency(calculations.netWorth)}</span>
                </div>
              </div>
            </div>

            {/* Дясна колона - Диаграма */}
            <div className="relative">
              <div className="text-center text-sm text-slate-600 mb-2">Възвръщаемост</div>
              
              {/* Timeline diagram */}
              <div className="relative h-[400px] border-l-2 border-slate-300 ml-8">
                {/* Вертикална линия - времева ос */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-300"></div>
                
                {/* Създаване на резерв - горе в средата */}
                <div className="absolute left-16 top-8 bg-slate-100 border border-slate-300 rounded-full px-6 py-3 text-center">
                  <div className="font-medium">Създаване на резерв</div>
                  <div className="text-lg font-bold">{formatCurrency(calculations.variableAmount)}</div>
                </div>
                <div className="absolute left-32 top-20 bg-white border border-slate-300 rounded-full px-3 py-1 text-xs">
                  0%
                </div>

                {/* Създаване на активи и Защита на дохода - горе вдясно */}
                <div className="absolute right-0 top-4 bg-slate-100 border border-slate-300 rounded px-4 py-2 text-center">
                  <div className="text-xs">Създаване на активи и</div>
                  <div className="text-xs">Защита на дохода</div>
                  <div className="font-bold">{formatCurrency(calculations.fixedAmount)}</div>
                </div>
                <div className="absolute right-0 top-24 bg-red-100 border border-red-300 rounded-full px-2 py-0.5 text-xs text-red-700">
                  7-9%
                </div>

                {/* Защита на собствеността - средата вдясно */}
                <div className="absolute right-0 top-36 bg-slate-100 border border-slate-300 rounded px-4 py-2 text-center">
                  <div className="text-xs">Защита на собствеността</div>
                  <div className="font-bold">- лв.</div>
                </div>

                {/* Заеми и кредити - долу вдясно */}
                <div className="absolute right-0 bottom-24 bg-slate-100 border border-slate-300 rounded px-4 py-2 text-center">
                  <div className="text-xs">Заеми и Кредити</div>
                  <div className="font-bold">- лв.</div>
                </div>
                <div className="absolute right-16 bottom-16 text-red-600 text-xs font-bold">
                  #DIV/0!
                </div>

                {/* Линии свързващи елементите */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                  <line x1="80" y1="60" x2="200" y2="40" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="80" y1="60" x2="200" y2="140" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="80" y1="60" x2="200" y2="280" stroke="#cbd5e1" strokeWidth="1" />
                </svg>

                {/* Време - долен десен ъгъл */}
                <div className="absolute right-0 bottom-0 text-sm text-slate-600">Време</div>

                {/* Възрасти на времевата линия */}
                <div className="absolute left-[-60px] bottom-8 text-xs">
                  {calculations.clientAge}/ {calculations.partnerAge} г.
                </div>
                <div className="absolute right-0 bottom-[-20px] text-xs">
                  {calculations.clientRetirementAge}/ {calculations.partnerRetirementAge} г.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Предимства и Приоритети */}
        <div className="grid grid-cols-2 gap-8 mt-8 pt-4 border-t">
          {/* Предимства */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">ПРЕДИМСТВА</h3>
            <div className="space-y-2">
              {advantages.map((adv, idx) => (
                <div key={adv.key} className="text-sm">
                  <span className="text-red-700 font-semibold">{adv.label}</span>
                  <span className="text-slate-600"> - {adv.desc}</span>
                  {adv.key === 'tax' && (
                    <span className="ml-4 font-bold text-red-700">{formatCurrency(calculations.taxBenefit)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Приоритети */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">ПРИОРИТЕТИ</h3>
            <div className="space-y-2">
              {calculations.priorities.map((priority, idx) => (
                <div key={idx} className="flex items-center gap-4 text-sm">
                  <span className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span>{priority.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}