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
    
    // Определяме колко можем да инвестираме месечно
    // Започваме с максималния план минус минимум за инвестиции
    const targetULMonthly = Math.max(25, maxMonthlyPlan * 0.55); // 55% от плана за UL
    const ulAnnualSavings = Math.max(300, Math.min(targetULMonthly * 12, maxAnnualPlan * 0.5));
    
    // Определяме интегрирано покритие живот
    let integratedLifeCoverage;
    if (hasPartnerOrChildren) {
      const multiplier = getLifeCoverageMultiplier(clientAge);
      integratedLifeCoverage = Math.min(ulAnnualSavings * multiplier, 14999); // Макс 14999 за избягване на здравен въпросник
      // Закръгляне визуално
      integratedLifeCoverage = roundCoverageUp(integratedLifeCoverage);
    } else {
      // По подразбиране 2500 EUR без партньор/деца
      integratedLifeCoverage = 2500;
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
      product_name: 'Универсален Пенсионен Фонд (Втори стълб)',
      beneficiary: 'partner1',
      beneficiary_name: `${analysis.client_first_name || ''} ${analysis.client_last_name || ''}`.trim(),
      beneficiary_age: clientAge,
      monthly_premium: 0,
      total_premium: 0,
      is_active: true,
      details: {
        note: 'Смяна на пенсионен фонд към ОББ - без допълнителни разходи',
        expected_return: 6.01, // % последни 24 месеца
        contribution_rate: 5, // % от БОД
        tax_benefit: 'Данъчно облекчение приложимо'
      }
    });
    
    // Ако има партньор, добавяме и за партньора
    if (includePartner && partnerAge > 0) {
      planProducts.push({
        product_type: 'pension_plan',
        provider: 'ОББ УПФ',
        product_name: 'Универсален Пенсионен Фонд (Втори стълб)',
        beneficiary: 'partner2',
        beneficiary_name: `${analysis.partner_first_name || ''} ${analysis.partner_last_name || ''}`.trim(),
        beneficiary_age: partnerAge,
        monthly_premium: 0,
        total_premium: 0,
        is_active: true,
        details: {
          note: 'Смяна на пенсионен фонд към ОББ - без допълнителни разходи',
          expected_return: 6.01,
          contribution_rate: 5,
          tax_benefit: 'Данъчно облекчение приложимо'
        }
      });
      
      // Ако партньорът има доход, добавяме и партньор UL
      if (partnerNetIncome > 0 && currentBudget > 100) {
        const partnerTargetULMonthly = Math.max(25, currentBudget * 0.4);
        const partnerULAnnualSavings = Math.max(300, Math.min(partnerTargetULMonthly * 12, currentBudget * 12 * 0.3));
        
        // Определяме интегрирано покритие за партньора
        const partnerMultiplier = getLifeCoverageMultiplier(partnerAge);
        const partnerIntegratedLife = Math.min(partnerULAnnualSavings * partnerMultiplier, 14999);
        
        const partnerSocialSupport2 = calculateSocialSupport(partnerGrossIncome, 'disability');
        const partnerDisability = variableExpenses > partnerSocialSupport2 ?
          roundCoverageUp(0.80 * (variableExpenses - partnerSocialSupport2) * (80 - partnerAge) * 12) : 0;
        
        const partnerCriticalIllness = variableExpenses > partnerSocialSupport2 ?
          roundCoverageUp((variableExpenses - partnerSocialSupport2) * 3 * 12) : 0;
        
        const partnerULCoverages = {
          integratedLifeCoverage: roundCoverageUp(partnerIntegratedLife),
          ptdCoverage: roundCoverageUp(partnerDisability),
          fracturesCoverage: 1500,
          criticalIllness40Coverage: roundCoverageUp(partnerCriticalIllness),
          telemedicine: partnerAge < 65,
          premiumWaiver: partnerAge <= 55
        };
        
        // Изчисляване на премия за партньор
        let partnerCoveragesPremium = 0;
        if (partnerULCoverages.ptdCoverage > 0) {
          partnerCoveragesPremium += (partnerULCoverages.ptdCoverage / 1000) * 1.5;
        }
        if (partnerULCoverages.fracturesCoverage > 0) {
          partnerCoveragesPremium += (partnerULCoverages.fracturesCoverage / 1000) * 16;
        }
        if (partnerULCoverages.criticalIllness40Coverage > 0) {
          const coefficient = METLIFE_PA_SECURITY_PLUS_COEFFICIENTS[partnerAge] || 50;
          partnerCoveragesPremium += partnerULCoverages.criticalIllness40Coverage / coefficient;
        }
        if (partnerULCoverages.telemedicine) {
          partnerCoveragesPremium += 15;
        }
        if (partnerULCoverages.premiumWaiver) {
          const waiverRate = 0.0438;
          const basePremium = partnerULAnnualSavings + partnerCoveragesPremium;
          partnerCoveragesPremium += basePremium * waiverRate;
        }
        
        const partnerTotalULAnnual = partnerULAnnualSavings + partnerCoveragesPremium + 15;
        const partnerULMonthly = roundPremiumDown(partnerTotalULAnnual / 12);
        
        if (currentBudget >= partnerULMonthly) {
          planProducts.push({
            product_type: 'ul_investment',
            provider: 'MetLife',
            product_name: 'MetLife Предимство',
            beneficiary: 'partner2',
            beneficiary_name: `${analysis.partner_first_name || ''} ${analysis.partner_last_name || ''}`.trim(),
            beneficiary_age: partnerAge,
            term_years: Math.min(80 - partnerAge, 49),
            strategy: 'balanced',
            monthly_premium: partnerULMonthly,
            total_premium: partnerULMonthly * 12,
            coverage_amount: partnerULCoverages.integratedLifeCoverage,
            expected_value: 0,
            is_active: true,
            details: {
              annual_savings: partnerULAnnualSavings,
              coverages: partnerULCoverages,
              premium_bonus: getPremiumBonus(partnerULAnnualSavings),
              management_fee: getAVCharge(partnerULAnnualSavings),
              daily_cost: (partnerULMonthly / 30).toFixed(2)
            }
          });
          
          totalMonthlyPremium += partnerULMonthly;
          totalMonthlyInvestments += partnerULAnnualSavings / 12;
          totalMonthlyInsurance += partnerCoveragesPremium / 12;
          currentBudget -= partnerULMonthly;
        }
      }
    }

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
      const uniqaMonthlyRounded = roundPremiumDown(uniqaMonthlyPremium);
      
      if (currentBudget >= uniqaMonthlyRounded) {
        planProducts.push({
          product_type: 'health_insurance',
          provider: 'УНИКА',
          product_name: 'Здраве и ценност - План Европа',
          beneficiary: 'partner1',
          beneficiary_name: `${analysis.client_first_name || ''} ${analysis.client_last_name || ''}`.trim(),
          beneficiary_age: clientAge,
          monthly_premium: uniqaMonthlyRounded,
          total_premium: uniqaMonthlyRounded * 12,
          coverage_amount: 2242300, // EUR макс покритие
          is_active: true,
          details: {
            plan: 'План Европа',
            territory: 'Европа',
            daily_benefit: 135,
            daily_cost: (uniqaMonthlyRounded / 30).toFixed(2),
            coverages: [
              'Лечение злокачествени новообразувания',
              'Операции за отстраняване на тумори',
              'Лечение на доброкачествени тумори на главата',
              'Операции на сънната артерия',
              'Байпас операции на коронарни артерии',
              'Трансплантация на органи'
            ]
          }
        });
        
        totalMonthlyPremium += uniqaMonthlyRounded;
        totalMonthlyInsurance += uniqaMonthlyRounded;
        currentBudget -= uniqaMonthlyRounded;
      }
    }

    // Приоритет 2: Generali базов пакет (ако няма от фирма)
    const hasEmployerHealth = analysis.has_employer_health_insurance || false;
    if (!hasEmployerHealth && currentBudget > 30) {
      // Generali Health Line Basic - примерни тарифи
      const generaliMonthly = clientAge < 40 ? 25 : clientAge < 50 ? 35 : 45;
      
      if (currentBudget >= generaliMonthly) {
        planProducts.push({
          product_type: 'health_insurance',
          provider: 'Generali',
          product_name: 'Health Line Basic',
          beneficiary: 'partner1',
          beneficiary_name: `${analysis.client_first_name || ''} ${analysis.client_last_name || ''}`.trim(),
          beneficiary_age: clientAge,
          monthly_premium: generaliMonthly,
          total_premium: generaliMonthly * 12,
          coverage_amount: 50000,
          is_active: true,
          details: {
            plan: 'Basic',
            annual_limit: 50000,
            daily_cost: (generaliMonthly / 30).toFixed(2),
            coverages: [
              'Амбулаторни прегледи',
              'Лабораторни изследвания',
              'Болнично лечение',
              'Спешна помощ'
            ]
          }
        });
        
        totalMonthlyPremium += generaliMonthly;
        totalMonthlyInsurance += generaliMonthly;
        currentBudget -= generaliMonthly;
      }
    }
    
    // Приоритет 3: Детски Unit Linked (ако има деца)
    const childrenCount = analysis.children_count || 0;
    if (childrenCount > 0 && currentBudget > 100) {
      // Обработваме до 3 деца
      const maxChildren = Math.min(childrenCount, 3);
      
      for (let i = 1; i <= maxChildren; i++) {
        const childBirthdate = analysis[`child_${i}_birthdate`];
        if (!childBirthdate) continue;
        
        const childAge = Math.floor((new Date() - new Date(childBirthdate)) / (365.25 * 24 * 60 * 60 * 1000));
        if (childAge >= 19) continue; // Прескачаме ако детето е над 19
        
        const childName = analysis[`child_${i}_name`] || `Дете ${i}`;
        
        // Целева годишна инвестиция за дете (намалява с всяко следващо дете)
        const budgetPerChild = currentBudget / (maxChildren - i + 1);
        const targetChildULAnnual = Math.max(1200, Math.min(budgetPerChild * 12, 3000));
        
        // Детски покрития
        const childPTD = 5000;
        const childHospitalDaily = 50;
        const childSurgical = 1500;
        const childFractures = 500;
        
        // Изчисляване на премия за покритията
        let childCoveragesPremium = 0;
        childCoveragesPremium += (childPTD / 1000) * 1.5;
        childCoveragesPremium += childHospitalDaily * 4.25;
        childCoveragesPremium += (childSurgical / 100) * 8.32;
        childCoveragesPremium += (childFractures / 1000) * 33;
        
        // Child Protection Agreement
        const childProtectionCoef = clientAge >= 18 && clientAge <= 55 ? 0.0438 : 0;
        const childBasePremium = targetChildULAnnual + childCoveragesPremium;
        const childProtectionPremium = childBasePremium * childProtectionCoef;
        childCoveragesPremium += childProtectionPremium;
        
        const totalChildULAnnual = targetChildULAnnual + childCoveragesPremium + 15;
        const childULMonthlyTotal = roundPremiumDown(totalChildULAnnual / 12);
        
        if (currentBudget >= childULMonthlyTotal) {
          planProducts.push({
            product_type: 'ul_investment',
            provider: 'MetLife',
            product_name: 'MetLife Детство (Junior UL)',
            beneficiary: `child${i}`,
            beneficiary_name: childName,
            beneficiary_age: childAge,
            term_years: Math.max(1, 19 - childAge),
            monthly_premium: childULMonthlyTotal,
            total_premium: childULMonthlyTotal * 12,
            expected_value: 0,
            is_active: true,
            details: {
              annual_savings: targetChildULAnnual,
              child_protection: true,
              child_protection_premium: childProtectionPremium,
              coverages: {
                ptd: childPTD,
                hospital_daily: childHospitalDaily,
                surgical: childSurgical,
                fractures: childFractures,
                child_protection_agreement: true
              },
              daily_cost: (childULMonthlyTotal / 30).toFixed(2)
            }
          });
          
          totalMonthlyPremium += childULMonthlyTotal;
          totalMonthlyInvestments += targetChildULAnnual / 12;
          totalMonthlyInsurance += childCoveragesPremium / 12;
          currentBudget -= childULMonthlyTotal;
        }
      }
    }

    // Приоритет 4: Нов ипотечен/потребителски кредит с Credit Guard
    const planningHousingChange = analysis.planning_housing_change || false;
    const financingMethod = analysis.financing_method;
    
    if (planningHousingChange && (financingMethod === 'loan' || financingMethod === 'cash_and_loan') && currentBudget > 50) {
      const plannedValue = analysis.planned_housing_value || 0;
      const extraCosts = analysis.planned_housing_extra_costs || 0;
      const availableCash = analysis.available_cash || 0;
      const loanAmount = plannedValue + extraCosts - availableCash;
      const loanYears = Math.min(30, analysis.loan_term_years || 20, 70 - clientAge);
      
      if (loanAmount > 0 && loanYears > 0) {
        const estimatedRate = 4.5; // Средна лихва за нов кредит
        const monthlyPayment = calculateMonthlyLoanPayment(loanAmount, estimatedRate, loanYears);
        
        // Проверка на лимити
        const maxPaymentBNB = (clientNetIncome + partnerNetIncome) * 0.5;
        const maxPaymentBalance = monthlyBalance * 0.9;
        
        if (monthlyPayment <= Math.min(maxPaymentBNB, maxPaymentBalance)) {
          // Credit Guard застраховка - 4% от вноската
          const creditGuardMonthly = monthlyPayment * 0.04;
          
          if (currentBudget >= creditGuardMonthly) {
            planProducts.push({
              product_type: 'insurance',
              provider: 'MetLife',
              product_name: 'Credit Guard',
              beneficiary: 'partner1',
              beneficiary_name: `${analysis.client_first_name || ''} ${analysis.client_last_name || ''}`.trim(),
              beneficiary_age: clientAge,
              term_years: loanYears,
              monthly_premium: roundPremiumDown(creditGuardMonthly),
              total_premium: creditGuardMonthly * 12,
              coverage_amount: loanAmount,
              is_active: true,
              details: {
                loan_amount: loanAmount,
                loan_monthly_payment: monthlyPayment.toFixed(2),
                loan_rate: estimatedRate,
                coverage: 'Смърт, Трайна Нетрудоспособност, Критични Заболявания',
                daily_cost: (creditGuardMonthly / 30).toFixed(2),
                note: 'Защита на кредита при непредвидени обстоятелства'
              }
            });
            
            totalMonthlyPremium += creditGuardMonthly;
            totalMonthlyInsurance += creditGuardMonthly;
            currentBudget -= creditGuardMonthly;
          }
        } else {
          // Намаляване на вноската до 86%
          const reducedPayment = monthlyBalance * 0.86;
          const creditGuardMonthly = reducedPayment * 0.04;
          
          if (currentBudget >= creditGuardMonthly) {
            planProducts.push({
              product_type: 'insurance',
              provider: 'MetLife',
              product_name: 'Credit Guard',
              beneficiary: 'partner1',
              beneficiary_name: `${analysis.client_first_name || ''} ${analysis.client_last_name || ''}`.trim(),
              beneficiary_age: clientAge,
              term_years: loanYears,
              monthly_premium: roundPremiumDown(creditGuardMonthly),
              total_premium: creditGuardMonthly * 12,
              coverage_amount: loanAmount,
              is_active: true,
              details: {
                loan_amount: loanAmount,
                loan_monthly_payment: reducedPayment.toFixed(2),
                loan_rate: estimatedRate,
                coverage: 'Смърт, Трайна Нетрудоспособност, Критични Заболявания',
                daily_cost: (creditGuardMonthly / 30).toFixed(2),
                note: 'Вноската е намалена до 86% от баланса за спазване на БНБ лимити'
              }
            });
            
            totalMonthlyPremium += creditGuardMonthly;
            totalMonthlyInsurance += creditGuardMonthly;
            currentBudget -= creditGuardMonthly;
          }
        }
      }
    }

    // Приоритет 5: Застраховка за дома
    const ownsProperty = analysis.current_housing === 'owned' || planningHousingChange;
    const hasHomeInsurance = analysis.has_property_insurance || false;
    const propertyValue = analysis.current_housing_value || analysis.planned_housing_value || 0;
    
    if (ownsProperty && !hasHomeInsurance && propertyValue > 0 && currentBudget > 20) {
      const propertyValueBGN = propertyValue * EUR_BGN_RATE;
      let homeProvider, homeProductName, homeMonthly;
      
      if (propertyValueBGN <= 500000) {
        // Инстинкт - до 500K BGN
        homeProvider = 'Инстинкт';
        homeProductName = 'Закрила на дома - Пакет 2';
        homeMonthly = 126.66 / EUR_BGN_RATE / 12; // ~5.4 EUR/месец
      } else {
        // ДЗИ - над 500K BGN
        homeProvider = 'ДЗИ';
        homeProductName = 'Защита за дома';
        homeMonthly = propertyValue * 0.0006 / 12; // 0.06% годишно
      }
      
      if (currentBudget >= homeMonthly) {
        planProducts.push({
          product_type: 'property_insurance',
          provider: homeProvider,
          product_name: homeProductName,
          beneficiary: 'family',
          beneficiary_name: 'Семейство',
          monthly_premium: roundPremiumDown(homeMonthly),
          total_premium: homeMonthly * 12,
          coverage_amount: propertyValue,
          is_active: true,
          details: {
            property_value: propertyValue,
            coverage: 'Имот, Домакинско обзавеждане, Гражданска отговорност',
            all_risks: true,
            daily_cost: (homeMonthly / 30).toFixed(2)
          }
        });
        
        totalMonthlyPremium += homeMonthly;
        totalMonthlyInsurance += homeMonthly;
        currentBudget -= homeMonthly;
      }
    }

    // Приоритет 6: Каско/ГО
    const carValue = (analysis.property_car_value || 0); // Вече е в EUR
    const carValueBGN = carValue * EUR_BGN_RATE;
    const hasCasco = analysis.has_casco_insurance || false;
    
    if (carValue > 0 && carValueBGN > 8000 && !hasCasco && currentBudget > 30) {
      // ДЗИ Каско - примерно 4% от стойността годишно
      const cascoAnnual = carValue * 0.04;
      const cascoMonthly = cascoAnnual / 12;
      
      if (currentBudget >= cascoMonthly) {
        planProducts.push({
          product_type: 'car_insurance',
          provider: 'ДЗИ',
          product_name: 'Каско + ГО',
          beneficiary: 'family',
          beneficiary_name: 'Семейство',
          monthly_premium: roundPremiumDown(cascoMonthly),
          total_premium: cascoMonthly * 12,
          coverage_amount: carValue,
          is_active: true,
          details: {
            car_value: carValue,
            coverage: 'Пълно Каско, Гражданска отговорност',
            daily_cost: (cascoMonthly / 30).toFixed(2)
          }
        });
        
        totalMonthlyPremium += cascoMonthly;
        totalMonthlyInsurance += cascoMonthly;
        currentBudget -= cascoMonthly;
      }
    }

    // Fallback продукти ако няма достатъчно бюджет за MetLife UL
    if (maxMonthlyPlan < 100 && planProducts.filter(p => p.product_type === 'ul_investment' && p.beneficiary === 'partner1').length === 0) {
      // MetLife Срочен живот или ДЗИ Закрила 15 лв/месечно
      const fallbackMonthly = 15;
      
      planProducts.push({
        product_type: 'term_life',
        provider: 'ДЗИ',
        product_name: 'ДЗИ Закрила Gold',
        beneficiary: 'partner1',
        beneficiary_name: `${analysis.client_first_name || ''} ${analysis.client_last_name || ''}`.trim(),
        beneficiary_age: clientAge,
        monthly_premium: fallbackMonthly,
        total_premium: fallbackMonthly * 12,
        coverage_amount: 10000,
        is_active: true,
        details: {
          note: 'Минимален застрахователен план при ограничен бюджет',
          coverages: 'Смърт, Трайна нетрудоспособност'
        }
      });
      
      totalMonthlyPremium += fallbackMonthly;
      totalMonthlyInsurance += fallbackMonthly;
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

    // Резерви след план (приспадаме годишна премия)
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
    
    // Приспадаме годишна премия на плана
    const annualPlanCost = totalMonthlyPremium * 12;
    const reservesAfterPlan = Math.max(0, totalReserves - annualPlanCost);
    const reserveMonthsAfterPlan = variableExpenses > 0 ? reservesAfterPlan / variableExpenses : 999;
    
    let recommendedFrequency = 'annual'; // Базова
    let frequencyNote = 'Годишна периодика осигурява най-ниска цена';
    
    if (reserveMonthsAfterPlan < 4) {
      recommendedFrequency = 'semiannual';
      frequencyNote = 'Полугодишна периодика поради ограничен резерв';
    }
    if (reserveMonthsAfterPlan < 3) {
      recommendedFrequency = 'quarterly';
      frequencyNote = 'Тримесечна периодика поради ограничен резерв';
    }
    if (reserveMonthsAfterPlan < 2) {
      recommendedFrequency = 'monthly';
      frequencyNote = 'Месечна периодика поради много ограничен резерв';
    }
    
    // Минимален резерв след план: 1 месечен доход
    const minReserveNeeded = variableExpenses * 1;
    const reserveDeficit = Math.max(0, minReserveNeeded - reservesAfterPlan);
    
    if (reserveDeficit > 0) {
      optimizations.push({
        type: 'reserve_warning',
        description: 'Недостатъчен резерв след план',
        current_reserve: reservesAfterPlan,
        needed_reserve: minReserveNeeded,
        deficit: reserveDeficit,
        recommendation: 'Препоръчва се натрупване на резерв преди стартиране на плана'
      });
    }



    // ============================================================
    // СТЪПКА 6: ИНВЕСТИЦИОННИ ПРОЕКЦИИ
    // ============================================================
    
    // 6.1 Проекция за MetLife UL на клиента
    const clientULProduct = planProducts.find(p => p.product_type === 'ul_investment' && p.beneficiary === 'partner1');
    if (clientULProduct) {
      const annualSavings = clientULProduct.details.annual_savings || 0;
      const termYears = clientULProduct.term_years || 0;
      const premiumBonus = clientULProduct.details.premium_bonus || 0;
      const managementFee = clientULProduct.details.management_fee || 0;
      
      // Балансирана проекция (6%)
      const balancedReturn = 0.06;
      let balancedValue = 0;
      for (let year = 1; year <= termYears; year++) {
        const annualContribution = annualSavings * (1 + premiumBonus);
        balancedValue = (balancedValue + annualContribution) * (1 + balancedReturn - managementFee);
      }
      
      clientULProduct.expected_value = Math.round(balancedValue);
      clientULProduct.details.total_invested = Math.round(annualSavings * termYears);
      extraGeneratedWealth.ul_investments_at_65 = Math.round(balancedValue);
    }
    
    // 6.2 Проекция за Детски UL (за всички деца)
    const childULProducts = planProducts.filter(p => p.product_type === 'ul_investment' && p.beneficiary.startsWith('child'));
    let totalChildULValue = 0;
    
    childULProducts.forEach(childULProduct => {
      const annualSavings = childULProduct.details.annual_savings || 0;
      const termYears = childULProduct.term_years || 0;
      const balancedReturn = 0.06;
      const managementFee = 0.005;
      
      let childValue = 0;
      for (let year = 1; year <= termYears; year++) {
        childValue = (childValue + annualSavings) * (1 + balancedReturn - managementFee);
      }
      
      childULProduct.expected_value = Math.round(childValue);
      childULProduct.details.total_invested = Math.round(annualSavings * termYears);
      totalChildULValue += childValue;
    });
    
    extraGeneratedWealth.child_ul_at_19 = Math.round(totalChildULValue);
    
    // 6.2b Проекция за партньор UL
    const partnerULProduct = planProducts.find(p => p.product_type === 'ul_investment' && p.beneficiary === 'partner2');
    if (partnerULProduct) {
      const annualSavings = partnerULProduct.details.annual_savings || 0;
      const termYears = partnerULProduct.term_years || 0;
      const premiumBonus = partnerULProduct.details.premium_bonus || 0;
      const managementFee = partnerULProduct.details.management_fee || 0;
      
      const balancedReturn = 0.06;
      let partnerValue = 0;
      for (let year = 1; year <= termYears; year++) {
        const annualContribution = annualSavings * (1 + premiumBonus);
        partnerValue = (partnerValue + annualContribution) * (1 + balancedReturn - managementFee);
      }
      
      partnerULProduct.expected_value = Math.round(partnerValue);
      partnerULProduct.details.total_invested = Math.round(annualSavings * termYears);
      extraGeneratedWealth.ul_investments_at_65 += Math.round(partnerValue);
    }
    
    // 6.3 Проекция за УПФ (Универсален Пенсионен Фонд - Втори стълб)
    const upfProducts = planProducts.filter(p => p.product_type === 'pension_plan');
    if (upfProducts.length > 0) {
      // Изчисление на натрупана сума в УПФ към пенсия
      // 5% от БОД (брутен осигурителен доход) отиват в УПФ
      const contributionRate = 0.05;
      const expectedReturn = 0.0601; // 6.01% годишна доходност
      
      // За клиента
      const clientGrossAnnual = clientGrossIncome * 12;
      let clientUPFValue = 0;
      let currentGross = clientGrossAnnual;
      
      for (let year = 1; year <= clientYearsToRetirement; year++) {
        const annualContribution = currentGross * contributionRate;
        clientUPFValue = (clientUPFValue + annualContribution) * (1 + expectedReturn);
        currentGross *= 1.03; // 3% годишен ръст на дохода
      }
      
      // За партньора (ако има)
      let partnerUPFValue = 0;
      if (includePartner && partnerGrossIncome > 0) {
        const partnerGrossAnnual = partnerGrossIncome * 12;
        let currentPartnerGross = partnerGrossAnnual;
        
        for (let year = 1; year <= partnerYearsToRetirement; year++) {
          const annualContribution = currentPartnerGross * contributionRate;
          partnerUPFValue = (partnerUPFValue + annualContribution) * (1 + expectedReturn);
          currentPartnerGross *= 1.03;
        }
      }
      
      extraGeneratedWealth.pension_fund_at_65 = Math.round(clientUPFValue + partnerUPFValue);
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
Автоматично генериран финансов план (v${rules.rule_version})

══════════════════════════════════════
ОБОБЩЕНИЕ:
══════════════════════════════════════
• Месечна премия: ${totalMonthlyPremium.toFixed(2)} EUR
• Месечни инвестиции: ${totalMonthlyInvestments.toFixed(2)} EUR
• Месечни застраховки: ${totalMonthlyInsurance.toFixed(2)} EUR
• Периодичност: ${recommendedFrequency} (${frequencyNote})
• Резерв след план: ${reserveMonthsAfterPlan.toFixed(1)} месечни разхода

══════════════════════════════════════
ОПТИМИЗАЦИИ (${optimizations.length}):
══════════════════════════════════════
${optimizations.map((o, i) => `${i + 1}. ${o.description}
   ${Object.entries(o).filter(([k]) => k !== 'description' && k !== 'type').map(([k, v]) => `   ${k}: ${typeof v === 'number' ? v.toFixed(2) : v}`).join('\n')}`).join('\n\n')}

══════════════════════════════════════
ЛИМИТИ НА ПЛАНА:
══════════════════════════════════════
• Макс годишен план: ${maxAnnualPlan.toFixed(2)} EUR (${(maxAnnualPlanVsIncome * 100).toFixed(0)}% от годишен доход)
• Макс месечен план: ${maxMonthlyPlan.toFixed(2)} EUR (${(maxMonthlyPlanVsBalance * 100).toFixed(0)}% от месечен баланс)
• Макс застраховки живот: ${maxMonthlyInsurance.toFixed(2)} EUR (${(maxInsuranceVsPlan * 100).toFixed(0)}% от план ИЛИ ${(maxInsuranceVsNetIncome * 100).toFixed(0)}% от доход)
• Мин инвестиции: ${minMonthlyInvestments.toFixed(2)} EUR (${(minInvestmentsVsPlan * 100).toFixed(0)}% от план)
• Мин месечна инвестиция: ${minMonthlyInvestment.toFixed(2)} EUR

══════════════════════════════════════
ИЗЧИСЛЕНИЯ ЗА КЛИЕНТА:
══════════════════════════════════════
• Трудов капитал клиент: ${Math.round(clientLaborCapital).toLocaleString()} EUR (до ${clientRetirementAge} г.)
${includePartner ? `• Трудов капитал партньор: ${Math.round(partnerLaborCapital).toLocaleString()} EUR (до ${partnerRetirementAge} г.)` : ''}
• Общ трудов капитал: ${Math.round(clientLaborCapital + partnerLaborCapital).toLocaleString()} EUR
• Данъчно облекчение: ${taxRelief.toFixed(2)} EUR годишно (10%)
• Променливи разходи: ${variableExpenses.toFixed(2)} EUR месечно

══════════════════════════════════════
СОЦИАЛНА ИЗДРЪЖКА (компенсации):
══════════════════════════════════════
• Клиент - Инвалидност: ${clientSocialSupport.toFixed(2)} EUR
${includePartner ? `• Партньор - Инвалидност: ${partnerSocialSupport.toFixed(2)} EUR` : ''}

══════════════════════════════════════
ДОПЪЛНИТЕЛНО ГЕНЕРИРАНО БОГАТСТВО:
══════════════════════════════════════
${extraGeneratedWealth.saved_mortgage_interest > 0 ? `• Спестени лихви по кредит (30%): ${(extraGeneratedWealth.saved_mortgage_interest * 0.3).toFixed(2)} EUR` : ''}
${extraGeneratedWealth.property_value_growth > 0 ? `• Стойност на имот при пенсия (5% ръст): ${Math.round(extraGeneratedWealth.property_value_growth).toLocaleString()} EUR` : ''}
${extraGeneratedWealth.pension_fund_at_65 > 0 ? `• УПФ натрупана сума към ${clientRetirementAge} г.: ${Math.round(extraGeneratedWealth.pension_fund_at_65).toLocaleString()} EUR` : ''}
${extraGeneratedWealth.ul_investments_at_65 > 0 ? `• UL инвестиции към ${clientRetirementAge} г.: ${Math.round(extraGeneratedWealth.ul_investments_at_65).toLocaleString()} EUR` : ''}
${extraGeneratedWealth.child_ul_at_19 > 0 ? `• Детски UL към 19 г.: ${Math.round(extraGeneratedWealth.child_ul_at_19).toLocaleString()} EUR` : ''}

• Общо допълнително богатство: ${Math.round(
  (extraGeneratedWealth.saved_mortgage_interest * 0.3) +
  extraGeneratedWealth.property_value_growth +
  extraGeneratedWealth.pension_fund_at_65 +
  extraGeneratedWealth.ul_investments_at_65 +
  extraGeneratedWealth.child_ul_at_19
).toLocaleString()} EUR
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