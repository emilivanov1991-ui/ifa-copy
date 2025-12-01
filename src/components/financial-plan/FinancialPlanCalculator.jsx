import {
  CONSTANTS,
  DEFAULT_PRODUCT_RATES,
  calculateAge,
  calculateYearsToRetirement,
  calculateYearsToEducation,
  vlookup,
  calculateFutureValue,
  calculateMonthlyPayment,
  calculateTermLifePremium
} from './FinancialPlanConstants';

// Главен калкулатор за финансов план
export const calculateFinancialPlan = (analysisData) => {
  const today = new Date();
  const validUntil = new Date(today.getTime() + CONSTANTS.PLAN_VALIDITY_DAYS * 24 * 60 * 60 * 1000);
  
  // 1. Изчисляване на възрасти
  const partner1Age = calculateAge(analysisData.client_birthdate);
  const partner2Age = analysisData.include_partner ? calculateAge(analysisData.partner_birthdate) : 0;
  
  // 2. Години до пенсия
  const retirementAgeP1 = analysisData.client_retirement_age || 
    (analysisData.client_gender === 'male' ? CONSTANTS.DEFAULT_RETIREMENT_AGE_MALE : CONSTANTS.DEFAULT_RETIREMENT_AGE_FEMALE);
  const retirementAgeP2 = analysisData.partner_retirement_age ||
    (analysisData.partner_gender === 'male' ? CONSTANTS.DEFAULT_RETIREMENT_AGE_MALE : CONSTANTS.DEFAULT_RETIREMENT_AGE_FEMALE);
  
  const yearsToRetirementP1 = calculateYearsToRetirement(partner1Age, retirementAgeP1);
  const yearsToRetirementP2 = analysisData.include_partner ? calculateYearsToRetirement(partner2Age, retirementAgeP2) : 0;
  
  // 3. Изчисляване на доходи и разходи
  const totalMonthlyIncome = calculateTotalMonthlyIncome(analysisData);
  const totalMonthlyExpenses = calculateTotalMonthlyExpenses(analysisData);
  const availableForInvestment = totalMonthlyIncome - totalMonthlyExpenses;
  
  // 4. Изчисляване на нужди
  const protectionNeedP1 = calculateProtectionNeed(analysisData, 'partner1');
  const protectionNeedP2 = analysisData.include_partner ? calculateProtectionNeed(analysisData, 'partner2') : 0;
  const reserveNeed = calculateReserveNeed(analysisData);
  const pensionGapP1 = calculatePensionGap(analysisData, 'partner1');
  const pensionGapP2 = analysisData.include_partner ? calculatePensionGap(analysisData, 'partner2') : 0;
  
  // Образователни нужди за деца
  const educationNeeds = calculateEducationNeeds(analysisData);
  
  // 5. Генериране на продуктови предложения
  const products = generateProductRecommendations(analysisData, {
    protectionNeedP1,
    protectionNeedP2,
    reserveNeed,
    pensionGapP1,
    pensionGapP2,
    educationNeeds,
    availableForInvestment,
    yearsToRetirementP1,
    yearsToRetirementP2
  });
  
  // 6. Сумиране на резултати
  const totalMonthlyPremium = products
    .filter(p => p.is_active)
    .reduce((sum, p) => sum + (p.monthly_premium || 0), 0);
  
  const totalCoverage = products
    .filter(p => p.is_active && p.coverage_amount)
    .reduce((sum, p) => sum + p.coverage_amount, 0);
  
  const totalExpectedValue = products
    .filter(p => p.is_active && p.expected_value)
    .reduce((sum, p) => sum + p.expected_value, 0);
  
  return {
    valid_until: validUntil.toISOString().split('T')[0],
    partner1_age: Math.floor(partner1Age),
    partner2_age: Math.floor(partner2Age),
    years_to_retirement_p1: Math.floor(yearsToRetirementP1),
    years_to_retirement_p2: Math.floor(yearsToRetirementP2),
    total_monthly_income: totalMonthlyIncome,
    total_monthly_expenses: totalMonthlyExpenses,
    available_for_investment: availableForInvestment,
    protection_need_p1: protectionNeedP1,
    protection_need_p2: protectionNeedP2,
    reserve_need: reserveNeed,
    pension_gap_p1: pensionGapP1,
    pension_gap_p2: pensionGapP2,
    education_need_child1: educationNeeds.child1 || 0,
    education_need_child2: educationNeeds.child2 || 0,
    education_need_child3: educationNeeds.child3 || 0,
    products,
    total_monthly_premium: totalMonthlyPremium,
    total_coverage: totalCoverage,
    total_expected_value: totalExpectedValue
  };
};

// Изчисляване на общ месечен доход
const calculateTotalMonthlyIncome = (data) => {
  let total = 0;
  
  // Партньор 1
  total += data.client_net_income || 0;
  total += data.client_other_monthly_income || 0;
  total += (data.client_13th_salary || 0) / 12;
  total += (data.client_other_annual_income || 0) / 12;
  
  // Партньор 2
  if (data.include_partner) {
    total += data.partner_net_income || 0;
    total += data.partner_other_monthly_income || 0;
    total += (data.partner_13th_salary || 0) / 12;
    total += (data.partner_other_annual_income || 0) / 12;
  }
  
  return total;
};

// Изчисляване на общи месечни разходи
const calculateTotalMonthlyExpenses = (data) => {
  let total = 0;
  
  // Жилищни разходи
  total += data.expense_rent || 0;
  total += data.expense_utilities || 0;
  total += data.expense_phone || 0;
  total += data.expense_internet || 0;
  total += data.expense_tv || 0;
  total += data.expense_other_housing || 0;
  
  // Транспортни разходи
  total += data.expense_fuel || 0;
  total += data.expense_car_maintenance || 0;
  total += data.expense_car_other || 0;
  
  // Битови разходи
  total += data.expense_food || 0;
  total += data.expense_clothing || 0;
  total += data.expense_culture || 0;
  total += data.expense_travel || 0;
  total += data.expense_children || 0;
  total += data.expense_cigarettes || 0;
  total += data.expense_pets || 0;
  total += data.expense_vacation || 0;
  total += data.expense_business || 0;
  total += data.expense_other || 0;
  
  // Кредити
  total += data.liability_mortgage || 0;
  total += data.liability_consumer_loans || 0;
  total += data.liability_credit_cards || 0;
  total += data.liability_leasing || 0;
  total += data.liability_overdraft || 0;
  
  // Застраховки
  total += data.insurance_life || 0;
  total += data.insurance_property || 0;
  total += data.insurance_household || 0;
  total += data.insurance_civil || 0;
  total += data.insurance_casco || 0;
  total += data.insurance_other || 0;
  
  return total;
};

// Изчисляване на нужда от защита (при загуба на доход)
const calculateProtectionNeed = (data, partner) => {
  const isP1 = partner === 'partner1';
  
  // Месечен доход на партньора
  const monthlyIncome = isP1 ? 
    (data.client_net_income || 0) : 
    (data.partner_net_income || 0);
  
  // Нужда = месечен доход * брой месеци * коефициент 1.96
  const baseNeed = monthlyIncome * CONSTANTS.PROTECTION_MONTHS_MULTIPLIER;
  
  // Добавяме задължения (кредити)
  const liabilities = (data.liability_mortgage || 0) * 12 * 10 + // предполагаем 10 години остатък
    (data.liability_consumer_loans || 0) * 12 * 3;
  
  return (baseNeed + liabilities) * CONSTANTS.CAPITAL_MULTIPLIER;
};

// Изчисляване на нужда от резерв
const calculateReserveNeed = (data) => {
  const monthlyExpenses = calculateTotalMonthlyExpenses(data);
  const desiredMonths = data.desired_reserve_months || 6;
  
  return monthlyExpenses * desiredMonths * CONSTANTS.CAPITAL_MULTIPLIER;
};

// Изчисляване на пенсионен дефицит
const calculatePensionGap = (data, partner) => {
  const isP1 = partner === 'partner1';
  
  const currentIncome = isP1 ? (data.client_net_income || 0) : (data.partner_net_income || 0);
  const desiredPension = isP1 ? (data.client_desired_pension || currentIncome * 0.7) : (data.partner_desired_pension || currentIncome * 0.7);
  const expectedStatePension = isP1 ? 
    (data.client_expected_state_pension || currentIncome * CONSTANTS.STATE_PENSION_REPLACEMENT_RATE) :
    (data.partner_expected_state_pension || currentIncome * CONSTANTS.STATE_PENSION_REPLACEMENT_RATE);
  
  const monthlyGap = Math.max(0, desiredPension - expectedStatePension);
  
  // Пенсионен дефицит = месечен дефицит * 12 месеца * очаквани години пенсия (20)
  return monthlyGap * 12 * 20 * CONSTANTS.CAPITAL_MULTIPLIER;
};

// Изчисляване на образователни нужди
const calculateEducationNeeds = (data) => {
  const needs = {};
  const childrenCount = data.children_count || 0;
  
  const childBirthDates = [
    data.child_1_birthdate,
    data.child_2_birthdate,
    data.child_3_birthdate
  ];
  
  const educationCosts = [
    data.children_education_costs || 20000,
    data.children_education_costs || 20000,
    data.children_education_costs || 20000
  ];
  
  for (let i = 0; i < Math.min(childrenCount, 3); i++) {
    if (childBirthDates[i]) {
      const yearsToEducation = calculateYearsToEducation(childBirthDates[i]);
      const coefficient = vlookup(yearsToEducation, DEFAULT_PRODUCT_RATES.education_plan.coefficients);
      
      needs[`child${i + 1}`] = educationCosts[i] * coefficient * CONSTANTS.CAPITAL_MULTIPLIER;
    }
  }
  
  return needs;
};

// Генериране на продуктови препоръки
const generateProductRecommendations = (data, needs) => {
  const products = [];
  const priorities = getPriorities(data);
  
  // 1. Защита на доходите - срочна застраховка живот
  if (priorities.includes('income_protection') && needs.protectionNeedP1 > 0) {
    const termYears = Math.min(needs.yearsToRetirementP1, 30);
    const premium = calculateTermLifePremium(
      needs.protectionNeedP1,
      calculateAge(data.client_birthdate),
      termYears,
      data.client_is_smoker,
      data.client_gender
    );
    
    products.push({
      product_type: 'term_life',
      provider: 'MetLife',
      beneficiary: 'partner1',
      strategy: null,
      term_years: termYears,
      monthly_premium: Math.round(premium.monthly * 100) / 100,
      total_premium: Math.round(premium.total * 100) / 100,
      coverage_amount: Math.round(needs.protectionNeedP1),
      expected_value: null,
      is_active: true
    });
  }
  
  // 2. Партньор 2 - защита
  if (data.include_partner && priorities.includes('income_protection') && needs.protectionNeedP2 > 0) {
    const termYears = Math.min(needs.yearsToRetirementP2, 30);
    const premium = calculateTermLifePremium(
      needs.protectionNeedP2,
      calculateAge(data.partner_birthdate),
      termYears,
      data.partner_is_smoker,
      data.partner_gender
    );
    
    products.push({
      product_type: 'term_life',
      provider: 'MetLife',
      beneficiary: 'partner2',
      strategy: null,
      term_years: termYears,
      monthly_premium: Math.round(premium.monthly * 100) / 100,
      total_premium: Math.round(premium.total * 100) / 100,
      coverage_amount: Math.round(needs.protectionNeedP2),
      expected_value: null,
      is_active: true
    });
  }
  
  // 3. Резерв - UL инвестиция за резерв
  if (priorities.includes('reserve') && needs.reserveNeed > 0) {
    const termYears = 5;
    const strategy = data.risk_profile || 'balanced';
    const expectedReturn = CONSTANTS.STRATEGY_RETURNS[strategy];
    const monthlyPayment = calculateMonthlyPayment(needs.reserveNeed, termYears, expectedReturn);
    const expectedValue = calculateFutureValue(monthlyPayment, termYears, expectedReturn);
    
    products.push({
      product_type: 'ul_investment',
      provider: 'MetLife',
      beneficiary: 'family',
      strategy: strategy,
      term_years: termYears,
      monthly_premium: Math.round(Math.max(monthlyPayment, DEFAULT_PRODUCT_RATES.ul_investment.min_monthly) * 100) / 100,
      total_premium: Math.round(monthlyPayment * 12 * termYears * 100) / 100,
      coverage_amount: null,
      expected_value: Math.round(expectedValue * 100) / 100,
      is_active: true
    });
  }
  
  // 4. Пенсионни планове
  if (priorities.includes('pension') && needs.pensionGapP1 > 0) {
    const termYears = needs.yearsToRetirementP1;
    const strategy = data.risk_profile || 'balanced';
    const expectedReturn = CONSTANTS.STRATEGY_RETURNS[strategy];
    const monthlyPayment = calculateMonthlyPayment(needs.pensionGapP1, termYears, expectedReturn);
    const expectedValue = calculateFutureValue(monthlyPayment, termYears, expectedReturn);
    
    products.push({
      product_type: 'pension_plan',
      provider: 'Partners Investments',
      beneficiary: 'partner1',
      strategy: strategy,
      term_years: Math.round(termYears),
      monthly_premium: Math.round(Math.max(monthlyPayment, DEFAULT_PRODUCT_RATES.pension_plan.min_monthly) * 100) / 100,
      total_premium: Math.round(monthlyPayment * 12 * termYears * 100) / 100,
      coverage_amount: null,
      expected_value: Math.round(expectedValue * 100) / 100,
      is_active: true
    });
  }
  
  // 5. Образователни планове за деца
  const childrenCount = data.children_count || 0;
  if (priorities.includes('children') && childrenCount > 0) {
    for (let i = 1; i <= Math.min(childrenCount, 3); i++) {
      const educationNeed = needs.educationNeeds[`child${i}`];
      if (educationNeed > 0) {
        const childBirthDate = data[`child_${i}_birthdate`];
        const yearsToEducation = calculateYearsToEducation(childBirthDate);
        const strategy = 'balanced';
        const expectedReturn = CONSTANTS.STRATEGY_RETURNS[strategy];
        const monthlyPayment = calculateMonthlyPayment(educationNeed, yearsToEducation, expectedReturn);
        const expectedValue = calculateFutureValue(monthlyPayment, yearsToEducation, expectedReturn);
        
        products.push({
          product_type: 'education_plan',
          provider: 'MetLife UL',
          beneficiary: `child${i}`,
          strategy: strategy,
          term_years: Math.round(yearsToEducation),
          monthly_premium: Math.round(Math.max(monthlyPayment, DEFAULT_PRODUCT_RATES.education_plan.min_monthly) * 100) / 100,
          total_premium: Math.round(monthlyPayment * 12 * yearsToEducation * 100) / 100,
          coverage_amount: null,
          expected_value: Math.round(expectedValue * 100) / 100,
          is_active: true
        });
      }
    }
  }
  
  // 6. Здравна застраховка MLC
  if (data.interest_in_better_savings) {
    const age = calculateAge(data.client_birthdate);
    const rate = vlookup(Math.floor(age), DEFAULT_PRODUCT_RATES.mlc_health.rates);
    
    products.push({
      product_type: 'mlc_health',
      provider: 'MetLife',
      beneficiary: 'partner1',
      strategy: null,
      term_years: 10,
      monthly_premium: rate,
      total_premium: rate * 12 * 10,
      coverage_amount: 50000,
      expected_value: null,
      is_active: true
    });
  }
  
  return products;
};

// Извличане на приоритети от анализа
const getPriorities = (data) => {
  const priorities = [];
  
  if (data.include_income_protection_in_plan || data.priority_income_protection > 0) {
    priorities.push('income_protection');
  }
  if (data.include_reserve_in_plan || data.priority_reserve > 0) {
    priorities.push('reserve');
  }
  if (data.include_pension_in_plan || data.priority_pension > 0) {
    priorities.push('pension');
  }
  if (data.include_children_in_plan || data.priority_children > 0) {
    priorities.push('children');
  }
  if (data.include_housing_in_plan || data.priority_housing > 0) {
    priorities.push('housing');
  }
  if (data.include_property_in_plan || data.priority_property_protection > 0) {
    priorities.push('property');
  }
  if (data.include_other_goals_in_plan || data.priority_other > 0) {
    priorities.push('other');
  }
  
  // Ако няма избрани приоритети, добавяме основните
  if (priorities.length === 0) {
    return ['income_protection', 'reserve', 'pension'];
  }
  
  return priorities;
};

export default calculateFinancialPlan;