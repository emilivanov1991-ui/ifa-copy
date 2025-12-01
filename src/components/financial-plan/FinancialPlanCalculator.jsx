import {
  EUR_BGN_RATE,
  DAYS_PER_YEAR,
  TERM_LIFE_RATES,
  EDUCATION_PLAN_COEFFICIENTS,
  UL_FEES,
  STRATEGY_RETURNS,
  PENSION_PLAN_RATES,
  CRITICAL_ILLNESS_RATES,
  HEALTH_INSURANCE_RATES,
  MODEL_COEFFICIENTS,
  bgnToEur,
  eurToBgn,
  calculateAge,
  calculateYearsToRetirement,
  calculateYearsToEducation,
  vlookup,
  getTermLifeRate,
  calculateFutureValue,
  calculateMonthlyPayment,
  calculateLaborCapital,
  calculateProtectionNeed,
  calculateReserveNeed,
  calculatePensionGap,
  calculateTermLifePremium,
  calculateULInvestment,
  calculateTaxBenefit
} from './FinancialPlanConstants';

// ============================================================
// ГЛАВЕН КАЛКУЛАТОР ЗА ФИНАНСОВ ПЛАН
// Имплементира логиката от Excel файла
// ============================================================

export const calculateFinancialPlan = (analysisData) => {
  const today = new Date();
  const validUntil = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  // ============================================================
  // 1. ЛИЧНИ ДАННИ И ВЪЗРАСТИ (Блок 1-2 от Excel)
  // ============================================================
  
  const partner1Age = calculateAge(analysisData.client_birthdate);
  const partner2Age = analysisData.include_partner ? calculateAge(analysisData.partner_birthdate) : 0;
  
  const partner1Gender = analysisData.client_gender || 'male';
  const partner2Gender = analysisData.partner_gender || 'female';
  
  const partner1IsSmoker = analysisData.client_is_smoker || false;
  const partner2IsSmoker = analysisData.partner_is_smoker || false;
  
  // Пенсионна възраст
  const retirementAgeP1 = analysisData.client_retirement_age || 
    (partner1Gender === 'male' ? 65 : 63);
  const retirementAgeP2 = analysisData.partner_retirement_age ||
    (partner2Gender === 'male' ? 65 : 63);
  
  const yearsToRetirementP1 = calculateYearsToRetirement(partner1Age, retirementAgeP1);
  const yearsToRetirementP2 = analysisData.include_partner ? 
    calculateYearsToRetirement(partner2Age, retirementAgeP2) : 0;
  
  // Деца
  const childrenData = [];
  const childrenCount = analysisData.children_count || 0;
  
  for (let i = 1; i <= childrenCount && i <= 10; i++) {
    const birthDate = analysisData[`child_${i}_birthdate`];
    if (birthDate) {
      const childAge = calculateAge(birthDate);
      const yearsToEducation = calculateYearsToEducation(birthDate, 18);
      childrenData.push({
        index: i,
        name: analysisData[`child_${i}_name`] || `Дете ${i}`,
        birthDate,
        age: childAge,
        yearsToEducation
      });
    }
  }
  
  // ============================================================
  // 2. ДОХОДИ, РАЗХОДИ, ИМУЩЕСТВО (Блок 3 от Excel)
  // ============================================================
  
  // Месечни доходи в лева
  const monthlyIncomeP1_BGN = (analysisData.client_net_income || 0);
  const monthlyIncomeP2_BGN = analysisData.include_partner ? (analysisData.partner_net_income || 0) : 0;
  const otherMonthlyIncome_BGN = (analysisData.client_other_monthly_income || 0) + 
    (analysisData.partner_other_monthly_income || 0);
  
  // Годишни доходи
  const annualBonusP1 = (analysisData.client_13th_salary || 0) + (analysisData.client_other_annual_income || 0);
  const annualBonusP2 = (analysisData.partner_13th_salary || 0) + (analysisData.partner_other_annual_income || 0);
  
  const totalMonthlyIncome_BGN = monthlyIncomeP1_BGN + monthlyIncomeP2_BGN + otherMonthlyIncome_BGN + 
    (annualBonusP1 + annualBonusP2) / 12;
  
  // Конвертиране в EUR
  const totalMonthlyIncome_EUR = bgnToEur(totalMonthlyIncome_BGN);
  const monthlyIncomeP1_EUR = bgnToEur(monthlyIncomeP1_BGN);
  const monthlyIncomeP2_EUR = bgnToEur(monthlyIncomeP2_BGN);
  
  // Месечни разходи
  const monthlyExpenses_BGN = calculateTotalMonthlyExpenses(analysisData);
  const monthlyExpenses_EUR = bgnToEur(monthlyExpenses_BGN);
  
  // Свободни средства
  const availableForInvestment_BGN = totalMonthlyIncome_BGN - monthlyExpenses_BGN;
  const availableForInvestment_EUR = bgnToEur(availableForInvestment_BGN);
  
  // Имущество
  const totalAssets_BGN = (analysisData.property_apartment_value || 0) +
    (analysisData.property_house_value || 0) +
    (analysisData.property_car_value || 0) +
    (analysisData.property_other_value || 0) +
    (analysisData.client_checking_account || 0) +
    (analysisData.client_savings_book || 0) +
    (analysisData.client_term_deposit || 0) +
    (analysisData.client_mutual_funds || 0) +
    (analysisData.client_savings_account || 0) +
    (analysisData.client_cash || 0);
  
  // Задължения
  const totalLiabilities_BGN = ((analysisData.liability_mortgage || 0) +
    (analysisData.liability_consumer_loans || 0) +
    (analysisData.liability_credit_cards || 0) +
    (analysisData.liability_leasing || 0) +
    (analysisData.liability_overdraft || 0)) * 12 * 5; // Предполагаем 5 години остатък
  
  const netWorth_BGN = totalAssets_BGN - totalLiabilities_BGN;
  
  // ============================================================
  // 3. ТРУДОВ КАПИТАЛ (Labor Capital)
  // ============================================================
  
  const laborCapitalP1 = calculateLaborCapital(
    monthlyIncomeP1_EUR, 
    yearsToRetirementP1, 
    MODEL_COEFFICIENTS.INCOME_GROWTH_RATE
  );
  
  const laborCapitalP2 = analysisData.include_partner ? 
    calculateLaborCapital(monthlyIncomeP2_EUR, yearsToRetirementP2, MODEL_COEFFICIENTS.INCOME_GROWTH_RATE) : 0;
  
  // ============================================================
  // 4. НУЖДИ ОТ ЗАЩИТА (Protection Needs)
  // ============================================================
  
  const protectionNeedP1_EUR = calculateProtectionNeed(
    monthlyIncomeP1_EUR,
    monthlyExpenses_EUR / 2, // Половината разходи са на партньор 1
    bgnToEur(totalLiabilities_BGN / 5), // Годишни задължения
    yearsToRetirementP1
  );
  
  const protectionNeedP2_EUR = analysisData.include_partner ? 
    calculateProtectionNeed(
      monthlyIncomeP2_EUR,
      monthlyExpenses_EUR / 2,
      bgnToEur(totalLiabilities_BGN / 5),
      yearsToRetirementP2
    ) : 0;
  
  // ============================================================
  // 5. НУЖДА ОТ РЕЗЕРВ (Reserve Need)
  // ============================================================
  
  const desiredReserveMonths = analysisData.desired_reserve_months || 6;
  const reserveNeed_EUR = calculateReserveNeed(monthlyExpenses_EUR, desiredReserveMonths);
  
  // Текущ резерв
  const currentReserve_EUR = bgnToEur(
    (analysisData.client_checking_account || 0) +
    (analysisData.client_savings_account || 0) +
    (analysisData.client_cash || 0)
  );
  
  const reserveGap_EUR = Math.max(0, reserveNeed_EUR - currentReserve_EUR);
  
  // ============================================================
  // 6. ПЕНСИОНЕН ДЕФИЦИТ (Pension Gap)
  // ============================================================
  
  const desiredPensionP1_EUR = bgnToEur(analysisData.client_desired_pension || monthlyIncomeP1_BGN * 0.7);
  const expectedStatePensionP1_EUR = bgnToEur(analysisData.client_expected_state_pension || monthlyIncomeP1_BGN * 0.35);
  
  const pensionGapP1_EUR = calculatePensionGap(desiredPensionP1_EUR, expectedStatePensionP1_EUR, 20);
  
  const desiredPensionP2_EUR = analysisData.include_partner ? 
    bgnToEur(analysisData.partner_desired_pension || monthlyIncomeP2_BGN * 0.7) : 0;
  const expectedStatePensionP2_EUR = analysisData.include_partner ?
    bgnToEur(analysisData.partner_expected_state_pension || monthlyIncomeP2_BGN * 0.35) : 0;
  
  const pensionGapP2_EUR = analysisData.include_partner ?
    calculatePensionGap(desiredPensionP2_EUR, expectedStatePensionP2_EUR, 20) : 0;
  
  // ============================================================
  // 7. ОБРАЗОВАТЕЛНИ НУЖДИ ЗА ДЕЦА
  // ============================================================
  
  const educationNeeds = {};
  const educationCostPerChild_EUR = bgnToEur(analysisData.children_education_costs || 20000);
  
  childrenData.forEach(child => {
    const coefficient = vlookup(Math.round(child.yearsToEducation), EDUCATION_PLAN_COEFFICIENTS) || 0.7;
    educationNeeds[`child${child.index}`] = {
      yearsToEducation: child.yearsToEducation,
      coefficient,
      totalNeed: educationCostPerChild_EUR * coefficient
    };
  });
  
  // ============================================================
  // 8. ГЕНЕРИРАНЕ НА ПРОДУКТОВИ ПРЕДЛОЖЕНИЯ
  // ============================================================
  
  const products = [];
  const priorities = getPriorities(analysisData);
  
  // --- TK1: Срочна застраховка за партньор 1 ---
  // Formula: Coverage = VLOOKUP(years_to_retirement, Partner1_Table, col19) * 1.96 * coef
  if (priorities.includes('income_protection') && protectionNeedP1_EUR > 0) {
    const termYears = Math.min(Math.round(yearsToRetirementP1), 30);
    
    // Реална защита според формулите от Excel
    const baseProtection = monthlyIncomeP1_EUR * MODEL_COEFFICIENTS.PROTECTION_MONTHS;
    const coverageNeeded = Math.ceil(baseProtection / 100) * 100; // Закръгляне нагоре до 100
    
    const premium = calculateTermLifePremium(
      coverageNeeded,
      partner1Age,
      termYears,
      partner1Gender,
      partner1IsSmoker
    );
    
    products.push({
      product_type: 'term_life',
      product_code: 'TK1',
      provider: 'MetLife',
      beneficiary: 'partner1',
      beneficiary_name: `${analysisData.client_first_name} ${analysisData.client_last_name}`,
      strategy: null,
      term_years: termYears,
      monthly_premium: Math.round(premium.monthly * 100) / 100,
      annual_premium: Math.round(premium.annual * 100) / 100,
      total_premium: Math.round(premium.total * 100) / 100,
      coverage_amount: Math.round(coverageNeeded),
      expected_value: null,
      rate_per_1000: premium.rate,
      is_active: true
    });
  }
  
  // --- TK2: Срочна застраховка за партньор 2 ---
  if (analysisData.include_partner && priorities.includes('income_protection') && protectionNeedP2_EUR > 0) {
    const termYears = Math.min(Math.round(yearsToRetirementP2), 30);
    
    const baseProtection = monthlyIncomeP2_EUR * MODEL_COEFFICIENTS.PROTECTION_MONTHS;
    const coverageNeeded = Math.ceil(baseProtection / 100) * 100;
    
    const premium = calculateTermLifePremium(
      coverageNeeded,
      partner2Age,
      termYears,
      partner2Gender,
      partner2IsSmoker
    );
    
    products.push({
      product_type: 'term_life',
      product_code: 'TK2',
      provider: 'MetLife',
      beneficiary: 'partner2',
      beneficiary_name: `${analysisData.partner_first_name} ${analysisData.partner_last_name}`,
      strategy: null,
      term_years: termYears,
      monthly_premium: Math.round(premium.monthly * 100) / 100,
      annual_premium: Math.round(premium.annual * 100) / 100,
      total_premium: Math.round(premium.total * 100) / 100,
      coverage_amount: Math.round(coverageNeeded),
      expected_value: null,
      rate_per_1000: premium.rate,
      is_active: true
    });
  }
  
  // --- UL1: Инвестиция + Защита за партньор 1 ---
  // Formula: R27 = (UL_Парт1.C10 + 15) * коеф
  // Formula: coverage = (monthlyIncome * 18) / 1.96 + 10000
  if (priorities.includes('reserve') || priorities.includes('pension') || priorities.includes('income_protection')) {
    const strategy = analysisData.risk_profile || 'balanced';
    const termYears = Math.min(Math.round(yearsToRetirementP1), 35);
    
    // Покритие според формулата от Excel
    const ulCoverage = Math.ceil(((monthlyIncomeP1_BGN * 18) / EUR_BGN_RATE + 10000) / 100) * 100;
    
    // Месечна вноска - базирана на комбинация от защита и инвестиция
    const baseMonthlyPremium = Math.max(50, availableForInvestment_EUR * 0.3);
    const monthlyPremium = Math.min(baseMonthlyPremium, 500);
    
    const ulCalc = calculateULInvestment(monthlyPremium, termYears, strategy, 0);
    
    products.push({
      product_type: 'ul_investment',
      product_code: 'UL1',
      provider: 'MetLife',
      beneficiary: 'partner1',
      beneficiary_name: `${analysisData.client_first_name} ${analysisData.client_last_name}`,
      strategy: strategy,
      term_years: termYears,
      monthly_premium: Math.round(monthlyPremium * 100) / 100,
      annual_premium: Math.round(monthlyPremium * 12 * 100) / 100,
      total_premium: Math.round(ulCalc.totalInvested * 100) / 100,
      coverage_amount: Math.round(ulCoverage),
      expected_value: ulCalc.expectedValue,
      return_percent: Math.round(ulCalc.returnPercent * 10) / 10,
      is_active: true
    });
  }
  
  // --- UL2: Инвестиция + Защита за партньор 2 ---
  if (analysisData.include_partner && (priorities.includes('reserve') || priorities.includes('pension'))) {
    const strategy = analysisData.risk_profile || 'balanced';
    const termYears = Math.min(Math.round(yearsToRetirementP2), 35);
    
    const ulCoverage = Math.ceil(((monthlyIncomeP2_BGN * 18) / EUR_BGN_RATE + 10000) / 100) * 100;
    const baseMonthlyPremium = Math.max(30, availableForInvestment_EUR * 0.2);
    const monthlyPremium = Math.min(baseMonthlyPremium, 300);
    
    const ulCalc = calculateULInvestment(monthlyPremium, termYears, strategy, 0);
    
    products.push({
      product_type: 'ul_investment',
      product_code: 'UL2',
      provider: 'MetLife',
      beneficiary: 'partner2',
      beneficiary_name: `${analysisData.partner_first_name} ${analysisData.partner_last_name}`,
      strategy: strategy,
      term_years: termYears,
      monthly_premium: Math.round(monthlyPremium * 100) / 100,
      annual_premium: Math.round(monthlyPremium * 12 * 100) / 100,
      total_premium: Math.round(ulCalc.totalInvested * 100) / 100,
      coverage_amount: Math.round(ulCoverage),
      expected_value: ulCalc.expectedValue,
      return_percent: Math.round(ulCalc.returnPercent * 10) / 10,
      is_active: true
    });
  }
  
  // --- PI1: Partners Investments за партньор 1 ---
  // Формула: AB43 = AA43 * 1.96 * CZ4
  // Формула: AE43 = (Z43 * 12 * AA43) + ((AC43 - AA43) * CZ13) * CZ4
  if (priorities.includes('pension') || priorities.includes('reserve')) {
    const strategy = analysisData.risk_profile || 'balanced';
    const termYears = Math.min(Math.round(yearsToRetirementP1), 40);
    
    // Определяме месечна вноска
    const suggestedMonthly = availableForInvestment_EUR * 0.3;
    const monthlyPremium = Math.max(50, Math.min(suggestedMonthly, 400));
    
    // Еднократна вноска (ако има)
    const oneTimeDeposit = Math.min(bgnToEur(analysisData.one_time_investment || 0), 5000);
    
    const piCalc = calculateULInvestment(monthlyPremium, termYears, strategy, oneTimeDeposit);
    
    products.push({
      product_type: 'pension_plan',
      product_code: 'PI1',
      provider: 'Partners Investments',
      beneficiary: 'partner1',
      beneficiary_name: `${analysisData.client_first_name} ${analysisData.client_last_name}`,
      strategy: strategy,
      term_years: termYears,
      monthly_premium: Math.round(monthlyPremium * 100) / 100,
      annual_premium: Math.round(monthlyPremium * 12 * 100) / 100,
      total_premium: Math.round(piCalc.totalInvested * 100) / 100,
      coverage_amount: null,
      expected_value: piCalc.expectedValue,
      one_time_deposit: Math.round(oneTimeDeposit),
      return_percent: Math.round(piCalc.returnPercent * 10) / 10,
      is_active: termYears <= 30 // Активен само ако срокът е до 30 г
    });
  }
  
  // --- PI2: Partners Investments за партньор 2 ---
  if (analysisData.include_partner && priorities.includes('pension')) {
    const strategy = analysisData.risk_profile || 'balanced';
    const termYears = Math.min(Math.round(yearsToRetirementP2), 40);
    
    const suggestedMonthly = availableForInvestment_EUR * 0.2;
    const monthlyPremium = Math.max(50, Math.min(suggestedMonthly, 300));
    
    const piCalc = calculateULInvestment(monthlyPremium, termYears, strategy, 0);
    
    products.push({
      product_type: 'pension_plan',
      product_code: 'PI2',
      provider: 'Partners Investments',
      beneficiary: 'partner2',
      beneficiary_name: `${analysisData.partner_first_name} ${analysisData.partner_last_name}`,
      strategy: strategy,
      term_years: termYears,
      monthly_premium: Math.round(monthlyPremium * 100) / 100,
      annual_premium: Math.round(monthlyPremium * 12 * 100) / 100,
      total_premium: Math.round(piCalc.totalInvested * 100) / 100,
      coverage_amount: null,
      expected_value: piCalc.expectedValue,
      return_percent: Math.round(piCalc.returnPercent * 10) / 10,
      is_active: termYears <= 30
    });
  }
  
  // --- Образователни планове за деца (UL Education) ---
  // Formula: M41 = VLOOKUP(N41, Дете1_стр2, col19) * 1.96 * EB16 * EE16
  // Formula: L41 = R29 * N41 * 1.96 * EB16
  if (priorities.includes('children')) {
    childrenData.forEach(child => {
      const eduNeed = educationNeeds[`child${child.index}`];
      if (eduNeed && child.yearsToEducation > 2 && child.yearsToEducation <= 18) {
        // VLOOKUP от коефициентната таблица
        const coefficient = vlookup(Math.round(child.yearsToEducation), EDUCATION_PLAN_COEFFICIENTS, false) || 0.7;
        
        // Месечна вноска според формулата
        const basePremium = educationCostPerChild_EUR * coefficient / (child.yearsToEducation * 12);
        const monthlyPremium = Math.max(25, basePremium);
        
        const eduCalc = calculateULInvestment(monthlyPremium, child.yearsToEducation, 'balanced', 0);
        
        // Целева сума
        const targetAmount = eduCalc.expectedValue;
        
        products.push({
          product_type: 'education_plan',
          product_code: `EDU${child.index}`,
          provider: 'MetLife',
          beneficiary: `child${child.index}`,
          beneficiary_name: child.name,
          strategy: 'balanced',
          term_years: Math.round(child.yearsToEducation),
          monthly_premium: Math.round(monthlyPremium * 100) / 100,
          annual_premium: Math.round(monthlyPremium * 12 * 100) / 100,
          total_premium: Math.round(eduCalc.totalInvested * 100) / 100,
          coverage_amount: null,
          expected_value: Math.round(targetAmount),
          return_percent: Math.round(eduCalc.returnPercent * 10) / 10,
          coefficient: coefficient,
          is_active: true
        });
      }
    });
  }
  
  // --- MLC1: Критични заболявания за партньор 1 ---
  // Formula: Y29 = MLC1.E17 * EE23
  if (priorities.includes('income_protection')) {
    const ageKey = Math.floor(partner1Age / 5) * 5;
    const mlcMonthly = vlookup(ageKey, {
      25: 24, 30: 24, 35: 26, 40: 30, 45: 38, 50: 50, 55: 68, 60: 95
    }) || 30;
    
    const coverageAmount = Math.round(protectionNeedP1_EUR * 0.5); // 50% от нуждата
    
    products.push({
      product_type: 'critical_illness',
      product_code: 'MLC1',
      provider: 'UNIQA',
      beneficiary: 'partner1',
      beneficiary_name: `${analysisData.client_first_name} ${analysisData.client_last_name}`,
      strategy: null,
      term_years: 1,
      monthly_premium: mlcMonthly,
      annual_premium: mlcMonthly * 12,
      total_premium: mlcMonthly * 12,
      coverage_amount: coverageAmount,
      expected_value: null,
      coverages: ['32 критични заболявания', 'Второ медицинско мнение', 'Телемедицина'],
      is_active: true
    });
  }
  
  // --- MLC2: Критични заболявания за партньор 2 ---
  if (analysisData.include_partner && priorities.includes('income_protection')) {
    const ageKey = Math.floor(partner2Age / 5) * 5;
    const mlcMonthly = vlookup(ageKey, {
      25: 24, 30: 24, 35: 26, 40: 30, 45: 38, 50: 50, 55: 68, 60: 95
    }) || 30;
    
    const coverageAmount = Math.round(protectionNeedP2_EUR * 0.5);
    
    products.push({
      product_type: 'critical_illness',
      product_code: 'MLC2',
      provider: 'UNIQA',
      beneficiary: 'partner2',
      beneficiary_name: `${analysisData.partner_first_name} ${analysisData.partner_last_name}`,
      strategy: null,
      term_years: 1,
      monthly_premium: mlcMonthly,
      annual_premium: mlcMonthly * 12,
      total_premium: mlcMonthly * 12,
      coverage_amount: coverageAmount,
      expected_value: null,
      coverages: ['32 критични заболявания', 'Второ медицинско мнение', 'Телемедицина'],
      is_active: true
    });
  }
  
  // --- UNIQA Здраве и Ценност (Международна здравна) ---
  if (analysisData.interest_in_better_savings || priorities.includes('income_protection')) {
    const ageKey = Math.floor(partner1Age / 5) * 5;
    const healthRate = vlookup(ageKey, HEALTH_INSURANCE_RATES.uniqa_premium) || 35;
    
    products.push({
      product_type: 'health_insurance',
      product_code: 'HEALTH1',
      provider: 'UNIQA',
      beneficiary: 'partner1',
      beneficiary_name: `${analysisData.client_first_name} ${analysisData.client_last_name}`,
      strategy: null,
      term_years: 1,
      monthly_premium: healthRate,
      annual_premium: healthRate * 12,
      total_premium: healthRate * 12,
      coverage_amount: 2240000, // EUR годишен лимит
      expected_value: null,
      coverages: ['Европейско покритие', 'Болнично лечение', 'Амбулаторно лечение', 'Телемедицина'],
      is_active: true
    });
  }
  
  // --- UNIQA Здраве и Ценност за партньор 2 ---
  if (analysisData.include_partner && analysisData.interest_in_better_savings) {
    const ageKey = Math.floor(partner2Age / 5) * 5;
    const healthRate = vlookup(ageKey, HEALTH_INSURANCE_RATES.uniqa_premium) || 35;
    
    products.push({
      product_type: 'health_insurance',
      product_code: 'HEALTH2',
      provider: 'UNIQA',
      beneficiary: 'partner2',
      beneficiary_name: `${analysisData.partner_first_name} ${analysisData.partner_last_name}`,
      strategy: null,
      term_years: 1,
      monthly_premium: healthRate,
      annual_premium: healthRate * 12,
      total_premium: healthRate * 12,
      coverage_amount: 2240000,
      expected_value: null,
      is_active: true
    });
  }
  
  // ============================================================
  // 9. СУМИРАНЕ НА РЕЗУЛТАТИ
  // ============================================================
  
  const activeProducts = products.filter(p => p.is_active);
  
  const totalMonthlyPremium = activeProducts.reduce((sum, p) => sum + (p.monthly_premium || 0), 0);
  const totalAnnualPremium = activeProducts.reduce((sum, p) => sum + (p.annual_premium || 0), 0);
  const totalCoverage = activeProducts.filter(p => p.coverage_amount).reduce((sum, p) => sum + p.coverage_amount, 0);
  const totalExpectedValue = activeProducts.filter(p => p.expected_value).reduce((sum, p) => sum + p.expected_value, 0);
  
  // Фиксирани vs Променливи вноски
  const fixedPremium = activeProducts
    .filter(p => ['term_life', 'health_insurance', 'critical_illness'].includes(p.product_type))
    .reduce((sum, p) => sum + (p.monthly_premium || 0), 0);
  
  const variablePremium = totalMonthlyPremium - fixedPremium;
  
  // Данъчно облекчение
  // Formula: Данъчна облага = 10% от вноската до max 2400 лв/год
  const pensionPremiums = activeProducts
    .filter(p => p.product_type === 'pension_plan' || p.product_code?.startsWith('UL'))
    .reduce((sum, p) => sum + (p.annual_premium || 0), 0);
  
  const taxBenefit = calculateTaxBenefit(
    eurToBgn(pensionPremiums),
    totalMonthlyIncome_BGN * 12
  );
  
  // Изчисляване на врeменна алокация (краткосрочни, средносрочни, дългосрочни)
  const shortTermProducts = activeProducts.filter(p => p.term_years <= 5);
  const mediumTermProducts = activeProducts.filter(p => p.term_years > 5 && p.term_years <= 15);
  const longTermProducts = activeProducts.filter(p => p.term_years > 15);
  
  const shortTermPremium = shortTermProducts.reduce((s, p) => s + (p.monthly_premium || 0), 0);
  const mediumTermPremium = mediumTermProducts.reduce((s, p) => s + (p.monthly_premium || 0), 0);
  const longTermPremium = longTermProducts.reduce((s, p) => s + (p.monthly_premium || 0), 0);
  
  // ============================================================
  // 10. ВРЪЩАНЕ НА РЕЗУЛТАТ
  // ============================================================
  
  return {
    // Метаданни
    valid_until: validUntil.toISOString().split('T')[0],
    currency: 'EUR',
    exchange_rate: EUR_BGN_RATE,
    
    // Лични данни
    partner1_age: Math.floor(partner1Age),
    partner2_age: Math.floor(partner2Age),
    partner1_gender: partner1Gender,
    partner2_gender: partner2Gender,
    years_to_retirement_p1: Math.floor(yearsToRetirementP1),
    years_to_retirement_p2: Math.floor(yearsToRetirementP2),
    children_count: childrenCount,
    
    // Финансово състояние
    total_monthly_income: Math.round(totalMonthlyIncome_EUR),
    total_monthly_income_bgn: Math.round(totalMonthlyIncome_BGN),
    total_monthly_expenses: Math.round(monthlyExpenses_EUR),
    total_monthly_expenses_bgn: Math.round(monthlyExpenses_BGN),
    available_for_investment: Math.round(availableForInvestment_EUR),
    available_for_investment_bgn: Math.round(availableForInvestment_BGN),
    
    // Имущество
    total_assets_bgn: Math.round(totalAssets_BGN),
    total_liabilities_bgn: Math.round(totalLiabilities_BGN),
    net_worth_bgn: Math.round(netWorth_BGN),
    
    // Трудов капитал
    labor_capital_p1: Math.round(laborCapitalP1),
    labor_capital_p2: Math.round(laborCapitalP2),
    
    // Нужди
    protection_need_p1: Math.round(protectionNeedP1_EUR),
    protection_need_p2: Math.round(protectionNeedP2_EUR),
    reserve_need: Math.round(reserveNeed_EUR),
    reserve_gap: Math.round(reserveGap_EUR),
    pension_gap_p1: Math.round(pensionGapP1_EUR),
    pension_gap_p2: Math.round(pensionGapP2_EUR),
    
    // Образователни нужди
    education_need_child1: Math.round(educationNeeds.child1?.totalNeed || 0),
    education_need_child2: Math.round(educationNeeds.child2?.totalNeed || 0),
    education_need_child3: Math.round(educationNeeds.child3?.totalNeed || 0),
    
    // Продукти
    products,
    
    // Обобщения
    total_monthly_premium: Math.round(totalMonthlyPremium * 100) / 100,
    total_annual_premium: Math.round(totalAnnualPremium * 100) / 100,
    fixed_monthly_premium: Math.round(fixedPremium * 100) / 100,
    variable_monthly_premium: Math.round(variablePremium * 100) / 100,
    total_coverage: Math.round(totalCoverage),
    total_expected_value: Math.round(totalExpectedValue),
    
    // Данъчно облекчение
    tax_benefit_annual_bgn: Math.round(taxBenefit.taxSaved),
    tax_benefit_total_bgn: Math.round(taxBenefit.taxSaved * yearsToRetirementP1),
    
    // Временна алокация
    short_term_premium: Math.round(shortTermPremium * 100) / 100,
    medium_term_premium: Math.round(mediumTermPremium * 100) / 100,
    long_term_premium: Math.round(longTermPremium * 100) / 100,
    short_term_percent: totalMonthlyPremium > 0 ? Math.round((shortTermPremium / totalMonthlyPremium) * 100) : 0,
    medium_term_percent: totalMonthlyPremium > 0 ? Math.round((mediumTermPremium / totalMonthlyPremium) * 100) : 0,
    long_term_percent: totalMonthlyPremium > 0 ? Math.round((longTermPremium / totalMonthlyPremium) * 100) : 0
  };
};

// ============================================================
// ПОМОЩНИ ФУНКЦИИ
// ============================================================

/**
 * Изчислява общи месечни разходи
 */
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

/**
 * Извлича приоритети от анализа
 */
const getPriorities = (data) => {
  const priorities = [];
  
  // По флагове от анализа
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