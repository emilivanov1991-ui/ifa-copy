import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ============================================================
// КОНСТАНТИ И ПРАВИЛА (от FinancialPlanConstants.jsx)
// ============================================================

const EUR_BGN_RATE = 1.95583;

// Social compensation formulas from ProtectionStep.jsx
const calculateSocialSupport = (grossIncome, riskType) => {
  if (!grossIncome) return 0;
  
  switch(riskType) {
    case 'layoff':
      return Math.max(320, Math.min(1730, Math.round(grossIncome * 0.60)));
    case 'sick_leave':
      return Math.max(320, Math.min(1730, Math.round(grossIncome * 0.60)));
    case 'maternity_year1':
      return Math.max(476, Math.min(1540, Math.round(grossIncome * 0.77)));
    case 'maternity_year2':
      return 398;
    case 'death':
      return Math.max(153, Math.min(511, Math.round(grossIncome * 0.22)));
    case 'disability':
      return Math.max(343, Math.min(1730, Math.round(grossIncome * 0.49)));
    default:
      return 0;
  }
};

// MetLife UL Premium Bonus
const getPremiumBonus = (annualPremium) => {
  if (annualPremium >= 4200) return 0.04;
  if (annualPremium >= 3000) return 0.03;
  if (annualPremium >= 1800) return 0.02;
  if (annualPremium >= 1200) return 0.01;
  return 0;
};

// MetLife UL Management Fee
const getAVCharge = (annualPremium) => {
  if (annualPremium >= 3600) return 0.005;
  if (annualPremium >= 2400) return 0.0075;
  if (annualPremium >= 1500) return 0.01;
  if (annualPremium >= 1200) return 0.0125;
  if (annualPremium >= 960) return 0.015;
  if (annualPremium >= 720) return 0.0175;
  return 0.02;
};

// MetLife UL Life Coverage Multipliers
const getLifeCoverageMultiplier = (age) => {
  if (age >= 15 && age <= 30) return 30;
  if (age >= 31 && age <= 35) return 20;
  if (age >= 36 && age <= 45) return 15;
  if (age >= 46 && age <= 55) return 10;
  if (age >= 56 && age <= 65) return 6;
  return 10; // default
};

// METLIFE PA Security Plus Coefficients (40 Critical Illnesses)
const METLIFE_PA_SECURITY_PLUS_COEFFICIENTS = {
  18: 225.73, 19: 218.82, 20: 212.31, 21: 206.19, 22: 200.40, 23: 194.55,
  24: 188.68, 25: 182.82, 26: 177.30, 27: 171.23, 28: 165.84, 29: 160.26,
  30: 154.80, 31: 149.25, 32: 143.88, 33: 138.50, 34: 133.33, 35: 128.04,
  36: 122.85, 37: 117.51, 38: 112.49, 39: 107.53, 40: 102.67, 41: 97.94,
  42: 93.37, 43: 88.97, 44: 84.75, 45: 80.71, 46: 76.86, 47: 73.21,
  48: 69.69, 49: 66.36, 50: 63.09, 51: 60.06, 52: 57.08, 53: 54.20,
  54: 51.28, 55: 48.33, 56: 46.32, 57: 43.92, 58: 41.58, 59: 39.11,
  60: 36.54, 61: 36.08, 62: 35.60, 63: 34.94, 64: 33.27, 65: 31.17
};

// METLIFE PA Risk Classes (for other coverages)
const METLIFE_PA_RISK_CLASSES = {
  1: { accidentalDeath: 1.5, pi: 1.5, fracturesAndBurns: 16 },
  2: { accidentalDeath: 2.5, pi: 2.5, fracturesAndBurns: 20 },
  3: { accidentalDeath: 4.0, pi: 4.0, fracturesAndBurns: 27 }
};

// Помощна функция за закръгляне на премии надолу
const roundPremiumDown = (amount) => {
  // Примери: 103 -> 99, 412 -> 399
  if (amount > 100 && amount < 500) {
    // Закръгли до 99, 199, 299, 399, 499
    const hundreds = Math.floor(amount / 100);
    return hundreds * 100 - 1;
  }
  return Math.floor(amount);
};

// Помощна функция за закръгляне на покрития нагоре
const roundCoverageUp = (amount) => {
  // Примери: 98000 -> 100000, 107000 -> 110000
  // Закръгли до кратни на 100 EUR
  return Math.ceil(amount / 100) * 100;
};

// ============================================================
// ОСНОВНА ФУНКЦИЯ ЗА ГЕНЕРИРАНЕ НА ФИНАНСОВ ПЛАН
// ============================================================

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { analysis_id } = await req.json();

    if (!analysis_id) {
      return Response.json({ error: 'analysis_id е задължително' }, { status: 400 });
    }

    // 1. Fetch analysis submission
    const analysisData = await base44.entities.FinancialAnalysisSubmission.filter({ id: analysis_id });
    if (!analysisData || analysisData.length === 0) {
      return Response.json({ error: 'Анализът не е намерен' }, { status: 404 });
    }
    const analysis = analysisData[0];

    // 2. Fetch active rules
    const rulesData = await base44.entities.FinancialPlanRules.filter({ is_active: true });
    if (!rulesData || rulesData.length === 0) {
      return Response.json({ error: 'Няма активни правила за финансов план' }, { status: 404 });
    }
    const rules = rulesData[0];

    // ============================================================
    // СТЪПКА 1: СЪБИРАНЕ И ИЗЧИСЛЯВАНЕ НА ОСНОВНИ ДАННИ
    // ============================================================

    const includePartner = analysis.include_partner || false;
    
    // Доходи
    const clientGrossIncome = analysis.client_gross_income || 0;
    const clientNetIncome = analysis.client_net_income || 0;
    const clientOtherMonthly = analysis.client_other_monthly_income || 0;
    const client13thSalary = (analysis.client_13th_salary || 0) / 12;
    const clientOtherAnnual = (analysis.client_other_annual_income || 0) / 12;
    
    const partnerGrossIncome = includePartner ? (analysis.partner_gross_income || 0) : 0;
    const partnerNetIncome = includePartner ? (analysis.partner_net_income || 0) : 0;
    const partnerOtherMonthly = includePartner ? (analysis.partner_other_monthly_income || 0) : 0;
    const partner13thSalary = includePartner ? ((analysis.partner_13th_salary || 0) / 12) : 0;
    const partnerOtherAnnual = includePartner ? ((analysis.partner_other_annual_income || 0) / 12) : 0;
    
    const totalMonthlyIncome = clientNetIncome + clientOtherMonthly + client13thSalary + clientOtherAnnual +
                                partnerNetIncome + partnerOtherMonthly + partner13thSalary + partnerOtherAnnual;
    
    // Разходи (променливи разходи)
    const variableExpenses = (analysis.expense_rent || 0) +
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
    
    // Месечен баланс (ПРЕДИ оптимизация)
    let monthlyBalance = totalMonthlyIncome - variableExpenses;
    
    // Възраст
    const clientAge = analysis.client_age || 0;
    const partnerAge = includePartner ? (analysis.partner_age || 0) : 0;
    
    const clientRetirementAge = analysis.client_retirement_age || 65;
    const partnerRetirementAge = includePartner ? (analysis.partner_retirement_age || 65) : 65;
    
    const clientYearsToRetirement = Math.max(0, clientRetirementAge - clientAge);
    const partnerYearsToRetirement = includePartner ? Math.max(0, partnerRetirementAge - partnerAge) : 0;

    // ============================================================
    // СТЪПКА 2: ОПТИМИЗАЦИЯ НА СЪЩЕСТВУВАЩИ ПРОДУКТИ
    // ============================================================

    const optimizations = [];

    // 2.1 Оптимизация на ипотечен кредит
    if (analysis.current_housing === 'owned' && analysis.current_housing_has_mortgage) {
      const currentMortgageRemaining = analysis.current_mortgage_remaining || 0;
      const currentInterestRate = analysis.current_mortgage_interest_rate || 0;
      const currentRemainingYears = analysis.current_mortgage_remaining_years || 0;
      const currentMonthlyPayment = analysis.current_mortgage_monthly_payment || 0;
      
      if (currentMortgageRemaining > 0 && currentRemainingYears > 0) {
        // Нова лихва (примерна - в реалност се взима от банкова оферта)
        const newInterestRate = 2.2; // Приемаме 2.2% за рефинансиране
        const newTermYears = Math.min(30, currentRemainingYears); // Макс 30 години
        const maxAge = Math.max(clientAge, partnerAge);
        const finalAge = maxAge + newTermYears;
        
        // Проверка за възрастта
        if (finalAge <= 70) {
          // Изчисляване на нова месечна вноска
          const newMonthlyPayment = calculateMonthlyLoanPayment(currentMortgageRemaining, newInterestRate, newTermYears);
          
          // Такси за рефинансиране
          const refinanceFees = (currentMortgageRemaining * 0.002) + // 0.2%
                                (currentMortgageRemaining * 0.002 * 0.20) + // 20% ДДС
                                60 + 70; // Фиксирани такси
          
          // Спестено за 2 години
          const monthlySavings = currentMonthlyPayment - newMonthlyPayment;
          const savings24months = monthlySavings * 24;
          
          // Препоръка за рефинансиране
          if (newMonthlyPayment < currentMonthlyPayment && savings24months > refinanceFees) {
            optimizations.push({
              type: 'mortgage_refinance',
              description: 'Рефинансиране на ипотечен кредит',
              current_monthly: currentMonthlyPayment,
              new_monthly: newMonthlyPayment,
              monthly_savings: monthlySavings,
              total_savings_24m: savings24months,
              refinance_fees: refinanceFees,
              recommended_bank: 'Друга банка (не ' + analysis.current_mortgage_bank + ')',
              recommended_insurance: 'MetLife Credit Guard'
            });
            
            // Добави спестенията към месечния баланс
            monthlyBalance += monthlySavings;
          }
        }
      }
    }

    // 2.2 Оптимизация на потребителски кредит
    const consumerLoansTotal = (analysis.liability_consumer_loans || 0);
    if (consumerLoansTotal > 0) {
      // Тук може да се добави логика за рефинансиране, ако имаме детайли
      // Засега просто отбелязваме като възможност
      optimizations.push({
        type: 'consumer_loan_optimization',
        description: 'Възможност за рефинансиране на потребителски кредити',
        current_balance: consumerLoansTotal,
        note: 'Макс срок 10 години, макс възраст 70, препоръка за MetLife Credit Guard'
      });
    }

    // 2.3 Оптимизация на застраховка дом
    const hasProperty = analysis.has_property_1 || false;
    if (hasProperty && !analysis.property_1_has_insurance) {
      const propertyValue = analysis.property_1_value || 0;
      const provider = propertyValue <= 255663 ? 'Инстинкт' : 'ДЗИ Защита за дома'; // 500k BGN = ~255k EUR
      
      optimizations.push({
        type: 'property_insurance',
        description: 'Застраховка на недвижимо имущество',
        property_value: propertyValue,
        recommended_provider: provider
      });
    }

    // 2.4 Пенсионен фонд - винаги към ОББ УПФ
    optimizations.push({
      type: 'pension_fund_change',
      description: 'Смяна на пенсионен фонд към ОББ УПФ',
      monthly_cost: 0, // Няма разходи
      note: 'Работи с нетни доходи - няма допълнителни разходи'
    });

    // ============================================================
    // СТЪПКА 3: ИЗЧИСЛЯВАНЕ НА ЛИМИТИ НА ПЛАНА
    // ============================================================

    const planLimits = rules.plan_limits || {};
    const maxAnnualPlanVsIncome = planLimits.max_annual_plan_vs_income || 1.5;
    const maxMonthlyPlanVsBalance = planLimits.max_monthly_plan_vs_balance || 0.4;
    const maxInsuranceVsPlan = planLimits.max_insurance_vs_plan || 0.33;
    const maxInsuranceVsNetIncome = planLimits.max_insurance_vs_net_income || 0.04;
    const minInvestmentsVsPlan = planLimits.min_investments_vs_plan || 0.45;
    const minMonthlyInvestment = (planLimits.min_monthly_investment || 50) / EUR_BGN_RATE; // Конвертираме от лв в EUR
    
    const maxAnnualPlan = totalMonthlyIncome * 12 * maxAnnualPlanVsIncome;
    const maxMonthlyPlan = monthlyBalance * maxMonthlyPlanVsBalance;
    const maxInsuranceFromPlan = maxMonthlyPlan * maxInsuranceVsPlan;
    const maxInsuranceFromIncome = (clientNetIncome + partnerNetIncome) * maxInsuranceVsNetIncome;
    const maxMonthlyInsurance = Math.min(maxInsuranceFromPlan, maxInsuranceFromIncome);
    const minMonthlyInvestments = maxMonthlyPlan * minInvestmentsVsPlan;

    // ============================================================
    // СТЪПКА 4: СТРУКТУРИРАНЕ НА НОВИЯ ПЛАН
    // ============================================================

    const planProducts = [];
    let totalMonthlyPremium = 0;
    let totalMonthlyInvestments = 0;
    let totalMonthlyInsurance = 0;

    // 4.1 Основен продукт: MetLife Unit Linked
    const hasPartnerOrChildren = includePartner || (analysis.children_count || 0) > 0;
    let integratedLifeCoverage = hasPartnerOrChildren ? 
      getLifeCoverageMultiplier(clientAge) * 1000 : // Умножи по годишна премия (ще се коригира)
      2500; // По подразбиране 2500 EUR

    // Калкулиране на налични средства за UL
    let availableForUL = maxMonthlyPlan;
    
    // Резервираме минимум за инвестиции
    const ulAnnualSavings = Math.max(300, Math.min(availableForUL * 12 * 0.5, maxAnnualPlan * 0.5));
    
    // Коригираме интегрираното покритие според премията
    if (hasPartnerOrChildren) {
      const multiplier = getLifeCoverageMultiplier(clientAge);
      integratedLifeCoverage = Math.min(ulAnnualSavings * multiplier, 14999); // Макс 14999 за избягване на здравен въпросник
    }

    // Социална издръжка за disability (за изчисляване на покритията)
    const clientSocialSupport = calculateSocialSupport(clientGrossIncome, 'disability');
    const partnerSocialSupport = includePartner ? calculateSocialSupport(partnerGrossIncome, 'disability') : 0;

    // Изчисляване на нужда от покритие нетрудоспособност
    // Формула: 80% × (променливи разходи - социална издръжка) × (80 - възраст) × 12
    const clientDisabilityCoverage = variableExpenses > clientSocialSupport ?
      roundCoverageUp(0.80 * (variableExpenses - clientSocialSupport) * (80 - clientAge) * 12) :
      0;
    
    const partnerDisabilityCoverage = includePartner && variableExpenses > partnerSocialSupport ?
      roundCoverageUp(0.80 * (variableExpenses - partnerSocialSupport) * (80 - partnerAge) * 12) :
      0;

    // Фрактури и изгаряния - стандартно 1500 EUR
    const fracturesCoverage = 1500;

    // Тежки заболявания (40)
    // Формула: (променливи разходи - социална издръжка) × 3 × 12
    const criticalIllnessCoverage = variableExpenses > clientSocialSupport ?
      roundCoverageUp((variableExpenses - clientSocialSupport) * 3 * 12) :
      0;

    // Изчисляване на покрития за UL
    const ulCoverages = {
      integratedLifeCoverage: roundCoverageUp(integratedLifeCoverage),
      ptdCoverage: roundCoverageUp(clientDisabilityCoverage),
      fracturesCoverage: fracturesCoverage,
      criticalIllness40Coverage: roundCoverageUp(criticalIllnessCoverage),
      telemedicine: clientAge < 65,
      premiumWaiver: clientAge <= 55
    };

    // Изчисляване на премия за покритията
    let coveragesPremium = 0;
    
    // PTD (Пълна/Частична Трайна Нетрудоспособност)
    if (ulCoverages.ptdCoverage > 0) {
      const riskData = METLIFE_PA_RISK_CLASSES[1]; // Приемаме рисков клас 1
      coveragesPremium += (ulCoverages.ptdCoverage / 1000) * riskData.pi;
    }
    
    // Fractures and Burns
    if (ulCoverages.fracturesCoverage > 0) {
      const riskData = METLIFE_PA_RISK_CLASSES[1];
      coveragesPremium += (ulCoverages.fracturesCoverage / 1000) * riskData.fracturesAndBurns;
    }
    
    // Critical Illness 40
    if (ulCoverages.criticalIllness40Coverage > 0) {
      const coefficient = METLIFE_PA_SECURITY_PLUS_COEFFICIENTS[clientAge] || 50;
      coveragesPremium += ulCoverages.criticalIllness40Coverage / coefficient;
    }
    
    // Telemedicine / Second Medical Opinion
    if (ulCoverages.telemedicine) {
      coveragesPremium += 15;
    }
    
    // Premium Waiver (Отказ от премия)
    if (ulCoverages.premiumWaiver) {
      const waiverRate = 0.0438; // Рисков клас 1
      const basePremium = ulAnnualSavings + coveragesPremium;
      coveragesPremium += basePremium * waiverRate;
    }
    
    const totalULAnnualPremium = ulAnnualSavings + coveragesPremium + 15; // +15 admin fee
    const ulMonthlyPremium = totalULAnnualPremium / 12;
    
    // Прилагаме ценова психология - закръгляме премията надолу
    const ulMonthlyPremiumRounded = roundPremiumDown(ulMonthlyPremium);
    const ulAnnualPremiumRounded = ulMonthlyPremiumRounded * 12;
    
    planProducts.push({
      product_type: 'ul_investment',
      provider: 'MetLife',
      product_name: 'MetLife Предимство',
      beneficiary: 'partner1',
      beneficiary_name: `${analysis.client_first_name || ''} ${analysis.client_last_name || ''}`.trim(),
      beneficiary_age: clientAge,
      term_years: Math.min(80 - clientAge, 49),
      strategy: 'balanced',
      monthly_premium: ulMonthlyPremiumRounded,
      total_premium: ulAnnualPremiumRounded,
      coverage_amount: ulCoverages.integratedLifeCoverage,
      expected_value: 0, // Ще се изчисли по-късно с проекция
      is_active: true,
      details: {
        annual_savings: ulAnnualSavings,
        coverages: ulCoverages,
        premium_bonus: getPremiumBonus(ulAnnualSavings),
        management_fee: getAVCharge(ulAnnualSavings),
        daily_cost: (ulMonthlyPremiumRounded / 30).toFixed(2) // Дневна цена
      }
    });
    
    totalMonthlyPremium += ulMonthlyPremiumRounded;
    totalMonthlyInvestments += ulAnnualSavings / 12;
    totalMonthlyInsurance += coveragesPremium / 12;

    // 4.2 Задължителна смяна на пенсионен фонд
    planProducts.push({
      product_type: 'pension_plan',
      provider: 'ОББ УПФ',
      product_name: 'Универсален Пенсионен Фонд',
      beneficiary: 'partner1',
      beneficiary_name: `${analysis.client_first_name || ''} ${analysis.client_last_name || ''}`.trim(),
      beneficiary_age: clientAge,
      monthly_premium: 0,
      total_premium: 0,
      is_active: true,
      details: {
        note: 'Смяна на пенсионен фонд - без допълнителни разходи'
      }
    });

    // 4.3 Допълнителни продукти при наличие на бюджет
    let currentBudget = maxMonthlyPlan - totalMonthlyPremium;

    // Приоритет 1: Uniqa Здраве и ценност - План Европа (ВИНАГИ)
    {
      // Определяне на възрастова група
      let ageGroup = '31-40';
      if (clientAge <= 17) ageGroup = '0-17';
      else if (clientAge <= 30) ageGroup = '18-30';
      else if (clientAge <= 40) ageGroup = '31-40';
      else if (clientAge <= 45) ageGroup = '41-45';
      else if (clientAge <= 50) ageGroup = '46-50';
      else if (clientAge <= 55) ageGroup = '51-55';
      else if (clientAge <= 60) ageGroup = '56-60';
      else ageGroup = '61-65';
      
      // Тарифи за Уника Здраве и ценност План Европа (месечни)
      const uniqaTariffs = {
        '0-17': 6.48, '18-30': 12.54, '31-40': 13.71, '41-45': 16.48,
        '46-50': 20.02, '51-55': 24.71, '56-60': 30.50, '61-65': 37.40
      };
      
      const uniqaMonthlyPremium = uniqaTariffs[ageGroup] || 13.71;
      
      if (currentBudget >= uniqaMonthlyPremium) {
        planProducts.push({
          product_type: 'health_insurance',
          provider: 'УНИКА',
          product_name: 'Здраве и ценност - План Европа',
          beneficiary: 'partner1',
          beneficiary_name: `${analysis.client_first_name || ''} ${analysis.client_last_name || ''}`.trim(),
          beneficiary_age: clientAge,
          monthly_premium: uniqaMonthlyPremium,
          total_premium: uniqaMonthlyPremium * 12,
          coverage_amount: 2242300, // EUR макс покритие
          is_active: true,
          details: {
            plan: 'План Европа',
            territory: 'Европа',
            daily_benefit: 135
          }
        });
        
        totalMonthlyPremium += uniqaMonthlyPremium;
        totalMonthlyInsurance += uniqaMonthlyPremium;
        currentBudget -= uniqaMonthlyPremium;
      }
    }

    // Приоритет 2: Generali базов пакет (ако няма от фирма)
    // TODO: Трябва да проверим дали клиентът има здравно от фирма
    // Засега пропускаме
    
    // Приоритет 3: Детски Unit Linked (ако има деца)
    const childrenCount = analysis.children_count || 0;
    if (childrenCount > 0 && currentBudget > 100) {
      // Детски UL с минимум 1200 EUR годишно
      const targetChildULAnnual = 1200;
      const childULMonthly = targetChildULAnnual / 12;
      
      if (currentBudget >= childULMonthly && targetChildULAnnual >= 300) {
        const child1Age = analysis.child_1_birthdate ? 
          Math.floor((new Date() - new Date(analysis.child_1_birthdate)) / (365.25 * 24 * 60 * 60 * 1000)) : 5;
        
        // Детски покрития
        const childPTD = 5000; // Минимум
        const childHospitalDaily = 50; // EUR/ден
        const childSurgical = 1500; // EUR
        const childFractures = 500; // EUR
        
        // Изчисляване на покрития премия
        let childCoveragesPremium = 0;
        childCoveragesPremium += (childPTD / 1000) * 1.5; // PTD
        childCoveragesPremium += childHospitalDaily * 4.25; // Hospital Daily
        childCoveragesPremium += (childSurgical / 100) * 8.32; // Surgical
        childCoveragesPremium += (childFractures / 1000) * 33; // Fractures
        
        // Child Protection Agreement
        const childProtectionCoef = clientAge >= 18 && clientAge <= 55 ? 0.0438 : 0;
        const childBasePremium = targetChildULAnnual + childCoveragesPremium;
        childCoveragesPremium += childBasePremium * childProtectionCoef;
        
        const totalChildULAnnual = targetChildULAnnual + childCoveragesPremium + 15;
        const childULMonthlyTotal = totalChildULAnnual / 12;
        
        if (currentBudget >= childULMonthlyTotal) {
          planProducts.push({
            product_type: 'ul_investment',
            provider: 'MetLife',
            product_name: 'MetLife Детство',
            beneficiary: 'child1',
            beneficiary_name: analysis.child_1_name || 'Дете',
            beneficiary_age: child1Age,
            monthly_premium: childULMonthlyTotal,
            total_premium: totalChildULAnnual,
            is_active: true,
            details: {
              annual_savings: targetChildULAnnual,
              child_protection: true,
              coverages: {
                ptd: childPTD,
                hospital_daily: childHospitalDaily,
                surgical: childSurgical,
                fractures: childFractures
              }
            }
          });
          
          totalMonthlyPremium += childULMonthlyTotal;
          totalMonthlyInvestments += targetChildULAnnual / 12;
          totalMonthlyInsurance += childCoveragesPremium / 12;
          currentBudget -= childULMonthlyTotal;
        }
      }
    }

    // Приоритет 4: Нов ипотечен/потребителски кредит (ако ще закупува жилище)
    if (analysis.planning_housing_change && analysis.financing_method === 'cash_and_loan') {
      const plannedValue = analysis.planned_housing_value || 0;
      const extraCosts = analysis.planned_housing_extra_costs || 0;
      const availableCash = analysis.available_cash || 0;
      const loanAmount = Math.max(0, plannedValue + extraCosts - availableCash);
      const loanYears = analysis.loan_term_years || 20;
      const interestRate = analysis.loan_interest_rate || 3;
      
      if (loanAmount > 0) {
        const monthlyPayment = calculateMonthlyLoanPayment(loanAmount, interestRate, loanYears);
        
        // Проверка на лимити
        const maxPaymentFromBalance = monthlyBalance * 0.9; // 90% от баланс
        const maxPaymentBNB = (clientNetIncome + partnerNetIncome) * 0.5; // 50% БНБ лимит
        
        let recommendedMonthly = monthlyPayment;
        let needsInsurance = false;
        
        if (monthlyPayment > maxPaymentFromBalance || monthlyPayment > maxPaymentBNB) {
          // Намаляване до 86% и 4% за застраховане
          recommendedMonthly = monthlyBalance * 0.86;
          needsInsurance = true;
          const insuranceAllocation = monthlyBalance * 0.04;
          
          planProducts.push({
            product_type: 'mortgage_loan',
            provider: 'Препоръчана банка',
            product_name: 'Ипотечен кредит',
            beneficiary: 'family',
            monthly_premium: recommendedMonthly,
            total_premium: recommendedMonthly * loanYears * 12,
            coverage_amount: loanAmount,
            term_years: loanYears,
            is_active: true,
            details: {
              interest_rate: interestRate,
              insurance_allocation: insuranceAllocation,
              note: 'Месечната вноска е намалена за спазване на лимитите',
              recommended_metlife_credit_guard: true
            }
          });
        } else {
          planProducts.push({
            product_type: 'mortgage_loan',
            provider: 'Препоръчана банка',
            product_name: 'Ипотечен кредит',
            beneficiary: 'family',
            monthly_premium: monthlyPayment,
            total_premium: monthlyPayment * loanYears * 12,
            coverage_amount: loanAmount,
            term_years: loanYears,
            is_active: true,
            details: {
              interest_rate: interestRate,
              recommended_metlife_credit_guard: true
            }
          });
        }
      }
    }

    // Приоритет 5: Застраховка за дома (ако има жилище без застраховка)
    if (hasProperty && !analysis.property_1_has_insurance && currentBudget > 0) {
      const propertyValue = analysis.property_1_value || 0;
      const propertyValueBGN = propertyValue * EUR_BGN_RATE;
      
      // Определяне на доставчик
      let provider, productName, monthlyPremiumEUR;
      
      if (propertyValueBGN <= 500000) {
        // Инстинкт - използваме Пакет 2 (100,000 EUR ~ 195,583 BGN)
        provider = 'Инстинкт';
        productName = 'Закрила на дома - Пакет 2';
        monthlyPremiumEUR = 126.66 / EUR_BGN_RATE / 12; // ~5.4 EUR/месец
      } else {
        // ДЗИ Защита за дома
        provider = 'ДЗИ';
        productName = 'Защита за дома';
        monthlyPremiumEUR = 8; // Примерна цена
      }
      
      if (currentBudget >= monthlyPremiumEUR) {
        planProducts.push({
          product_type: 'property_insurance',
          provider: provider,
          product_name: productName,
          beneficiary: 'family',
          monthly_premium: monthlyPremiumEUR,
          total_premium: monthlyPremiumEUR * 12,
          coverage_amount: propertyValue,
          is_active: true,
          details: {
            property_address: analysis.property_1_address || 'Н/П',
            all_risks_coverage: true
          }
        });
        
        totalMonthlyPremium += monthlyPremiumEUR;
        totalMonthlyInsurance += monthlyPremiumEUR;
        currentBudget -= monthlyPremiumEUR;
      }
    }

    // Приоритет 6: Каско/ГО (ако има кола над 8000 лв без Каско)
    const car1Value = analysis.car_1_value || 0;
    const car1ValueBGN = car1Value * EUR_BGN_RATE;
    const hasCar = analysis.has_car_1 || false;
    const hasCasco = analysis.car_1_has_casco || false;
    
    if (hasCar && !hasCasco && car1ValueBGN > 8000 && currentBudget > 0) {
      // Примерна премия за Каско (зависи от стойността на колата)
      const cascoMonthlyPremium = Math.max(30, car1Value * 0.003); // ~0.3% от стойността месечно
      
      if (currentBudget >= cascoMonthlyPremium) {
        planProducts.push({
          product_type: 'car_insurance',
          provider: 'ДЗИ',
          product_name: 'Каско+',
          beneficiary: 'family',
          monthly_premium: cascoMonthlyPremium,
          total_premium: cascoMonthlyPremium * 12,
          coverage_amount: car1Value,
          is_active: true,
          details: {
            car_brand: analysis.car_1_brand || 'Н/П',
            car_model: analysis.car_1_model || 'Н/П',
            car_year: analysis.car_1_year || 0
          }
        });
        
        totalMonthlyPremium += cascoMonthlyPremium;
        totalMonthlyInsurance += cascoMonthlyPremium;
        currentBudget -= cascoMonthlyPremium;
      }
    }

    // ============================================================
    // СТЪПКА 5: ИЗЧИСЛЕНИЯ ЗА КЛИЕНТА
    // ============================================================

    // Трудов капитал
    let clientLaborCapital = 0;
    let currentIncome = (clientNetIncome || 0) * 12;
    for (let i = 0; i < clientYearsToRetirement; i++) {
      clientLaborCapital += currentIncome;
      currentIncome *= 1.03; // 3% годишен ръст
    }
    
    let partnerLaborCapital = 0;
    if (includePartner) {
      currentIncome = (partnerNetIncome || 0) * 12;
      for (let i = 0; i < partnerYearsToRetirement; i++) {
        partnerLaborCapital += currentIncome;
        currentIncome *= 1.03;
      }
    }

    // Данъчно облекчение (10%)
    const taxReliefProducts = planProducts.filter(p => 
      p.product_type === 'ul_investment' || 
      p.product_type === 'pension_plan' ||
      p.product_type === 'health_insurance'
    );
    const annualTaxReliefBase = taxReliefProducts.reduce((sum, p) => sum + (p.total_premium || 0), 0);
    const taxRelief = annualTaxReliefBase * 0.10;

    // Допълнително генерирано богатство
    const extraGeneratedWealth = {
      pension_fund_at_65: 0, // Ще се изчисли от УПФ проекция
      saved_mortgage_interest: optimizations.find(o => o.type === 'mortgage_refinance')?.total_savings_24m || 0,
      property_value_growth: 0, // Ще се изчисли от стойността на имота с 5% ръст
      ul_investments_at_65: 0, // Ще се изчисли от UL проекция
      child_ul_at_19: 0 // Ще се изчисли от детски UL проекция
    };

    // Стойност на имот с 5% годишен ръст
    if (hasProperty) {
      const propertyValue = analysis.property_1_value || 0;
      const yearsToRetirement = clientYearsToRetirement;
      extraGeneratedWealth.property_value_growth = propertyValue * Math.pow(1.05, yearsToRetirement);
    }

    // ============================================================
    // СТЪПКА 6: ОПРЕДЕЛЯНЕ НА ПЕРИОДИЧНОСТ НА ПЛАЩАНЕ
    // ============================================================

    // Резерви след план
    const totalReserves = (analysis.client_checking_account || 0) +
      (analysis.client_savings_book || 0) +
      (analysis.client_term_deposit || 0) +
      (analysis.client_savings_account || 0) +
      (analysis.client_cash || 0) +
      (includePartner ? (analysis.partner_checking_account || 0) : 0) +
      (includePartner ? (analysis.partner_savings_book || 0) : 0) +
      (includePartner ? (analysis.partner_term_deposit || 0) : 0) +
      (includePartner ? (analysis.partner_savings_account || 0) : 0) +
      (includePartner ? (analysis.partner_cash || 0) : 0);
    
    const reserveMonthsAfterPlan = totalReserves / variableExpenses;
    
    let recommendedFrequency = 'annual'; // Базова
    if (reserveMonthsAfterPlan < 4) {
      recommendedFrequency = 'semiannual';
    }
    if (reserveMonthsAfterPlan < 3) {
      recommendedFrequency = 'quarterly';
    }
    if (reserveMonthsAfterPlan < 2) {
      recommendedFrequency = 'monthly';
    }

    // ============================================================
    // СТЪПКА 7: СЪЗДАВАНЕ НА ФИНАНСОВ ПЛАН
    // ============================================================

    const financialPlan = {
      analysis_id: analysis_id,
      client_id: analysis.client_id,
      plan_status: 'calculated',
      valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 дни
      partner1_age: clientAge,
      partner2_age: partnerAge,
      years_to_retirement_p1: clientYearsToRetirement,
      years_to_retirement_p2: partnerYearsToRetirement,
      total_monthly_income: totalMonthlyIncome,
      total_monthly_expenses: variableExpenses,
      available_for_investment: monthlyBalance,
      protection_need_p1: Math.round(clientLaborCapital * 0.5), // 50% от труд. капитал
      protection_need_p2: includePartner ? Math.round(partnerLaborCapital * 0.5) : 0,
      reserve_need: variableExpenses * (analysis.desired_reserve_months || 6),
      products: planProducts,
      total_monthly_premium: totalMonthlyPremium,
      total_coverage: planProducts.reduce((sum, p) => sum + (p.coverage_amount || 0), 0),
      notes: `
Автоматично генериран финансов план.

ОПТИМИЗАЦИИ:
${optimizations.map(o => `- ${o.description}: ${JSON.stringify(o, null, 2)}`).join('\n')}

ЛИМИТИ:
- Макс годишен план: ${maxAnnualPlan.toFixed(2)} EUR (150% от годишен доход)
- Макс месечен план: ${maxMonthlyPlan.toFixed(2)} EUR (40% от месечен баланс)
- Макс застраховки: ${maxMonthlyInsurance.toFixed(2)} EUR
- Мин инвестиции: ${minMonthlyInvestments.toFixed(2)} EUR

ИЗЧИСЛЕНИЯ:
- Трудов капитал клиент: ${Math.round(clientLaborCapital).toLocaleString()} EUR
${includePartner ? `- Трудов капитал партньор: ${Math.round(partnerLaborCapital).toLocaleString()} EUR` : ''}
- Данъчно облекчение: ${taxRelief.toFixed(2)} EUR годишно

ПРЕПОРЪЧИТЕЛНА ПЕРИОДИЧНОСТ: ${recommendedFrequency}
Резерв след план: ${reserveMonthsAfterPlan.toFixed(1)} месечни дохода
      `.trim()
    };

    // Запазване на финансовия план
    const savedPlan = await base44.asServiceRole.entities.FinancialPlan.create(financialPlan);

    // Запазване на индивидуалните продуктови оферти
    for (const product of planProducts) {
      await base44.asServiceRole.entities.ProductOffer.create({
        plan_id: savedPlan.id,
        analysis_id: analysis_id,
        catalog_product_id: null,
        provider: product.provider,
        product_name: product.product_name,
        product_type: product.product_type,
        beneficiary: product.beneficiary,
        beneficiary_name: product.beneficiary_name,
        beneficiary_age: product.beneficiary_age,
        term_years: product.term_years,
        strategy: product.strategy,
        monthly_premium: product.monthly_premium,
        annual_premium: product.total_premium,
        coverage_amount: product.coverage_amount,
        expected_value: product.expected_value,
        offer_status: 'generated',
        ai_recommendation_reason: `Автоматично генериран от правилата v${rules.rule_version}`
      });
    }

    return Response.json({
      success: true,
      plan_id: savedPlan.id,
      summary: {
        total_monthly_premium: totalMonthlyPremium,
        total_products: planProducts.length,
        optimizations: optimizations.length,
        recommended_frequency: recommendedFrequency,
        labor_capital_total: clientLaborCapital + partnerLaborCapital,
        tax_relief_annual: taxRelief
      },
      products: planProducts,
      optimizations: optimizations
    });

  } catch (error) {
    console.error('Error generating financial plan:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});

// ============================================================
// ПОМОЩНИ ФУНКЦИИ
// ============================================================

function calculateMonthlyLoanPayment(principal, annualRate, years) {
  const monthlyRate = annualRate / 12 / 100;
  const numberOfPayments = years * 12;
  
  if (monthlyRate === 0) return principal / numberOfPayments;
  
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
         (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
}