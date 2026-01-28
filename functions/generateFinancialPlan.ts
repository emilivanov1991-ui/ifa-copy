import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const EUR_BGN_RATE = 1.95583;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { analysis_id } = payload;

    if (!analysis_id) {
      return Response.json({ error: 'analysis_id is required' }, { status: 400 });
    }

    // 1. Извличане на данни от анализа
    const analysisData = await base44.asServiceRole.entities.FinancialAnalysisSubmission.get(analysis_id);
    if (!analysisData) {
      return Response.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // 2. Извличане на активните правила
    const rulesData = await base44.asServiceRole.entities.FinancialPlanRules.filter({ is_active: true });
    const rules = rulesData.length > 0 ? rulesData[0] : null;
    
    if (!rules) {
      return Response.json({ error: 'No active financial plan rules found' }, { status: 404 });
    }

    // 3. Основни изчисления
    const calculations = await calculateFinancialMetrics(analysisData, rules);
    
    // 4. Оптимизация на съществуващи продукти
    const optimizations = await optimizeExistingProducts(analysisData, rules, calculations);
    
    // 5. Изчисляване на нужди от защита
    const protectionNeeds = await calculateProtectionNeeds(analysisData, rules, calculations);
    
    // 6. Препоръчване на продукти
    const recommendedProducts = await recommendProducts(
      analysisData, 
      rules, 
      calculations, 
      protectionNeeds,
      base44
    );
    
    // 7. Прилагане на лимити и валидация
    const validatedProducts = await applyPlanLimits(
      recommendedProducts, 
      calculations, 
      rules
    );
    
    // 8. Прилагане на ценова психология
    const finalProducts = applyPricingPsychology(validatedProducts, rules);
    
    // 9. Изчисляване на крайни показатели
    const finalCalculations = await calculateFinalMetrics(
      calculations, 
      finalProducts, 
      analysisData, 
      rules
    );
    
    // 10. Създаване на финансов план
    const planData = {
      analysis_id: analysis_id,
      client_id: analysisData.client_id,
      plan_status: 'calculated',
      valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 дни
      
      // Възрасти и години до пенсия
      partner1_age: analysisData.client_age,
      partner2_age: analysisData.include_partner ? analysisData.partner_age : null,
      years_to_retirement_p1: calculations.yearsToRetirement_p1,
      years_to_retirement_p2: calculations.yearsToRetirement_p2,
      
      // Финансови показатели
      total_monthly_income: finalCalculations.totalMonthlyIncome,
      total_monthly_expenses: finalCalculations.totalMonthlyExpenses,
      available_for_investment: finalCalculations.availableForInvestment,
      
      // Нужди от защита
      protection_need_p1: protectionNeeds.partner1_total,
      protection_need_p2: protectionNeeds.partner2_total,
      reserve_need: finalCalculations.reserveNeed,
      pension_gap_p1: finalCalculations.pensionGap_p1,
      pension_gap_p2: finalCalculations.pensionGap_p2,
      
      // Продукти
      products: finalProducts,
      
      // Обобщения
      total_monthly_premium: finalCalculations.totalMonthlyPremium,
      total_coverage: finalCalculations.totalCoverage,
      total_expected_value: finalCalculations.totalExpectedValue,
      
      // Оптимизации
      notes: JSON.stringify({
        optimizations: optimizations,
        calculations: finalCalculations,
        protectionNeeds: protectionNeeds
      })
    };
    
    // 11. Записване на плана
    const savedPlan = await base44.asServiceRole.entities.FinancialPlan.create(planData);
    
    // 12. Извикване на AI агент за финална оптимизация
    try {
      await base44.asServiceRole.functions.invoke('optimizeFinancialPlanWithAI', {
        plan_id: savedPlan.id
      });
    } catch (aiError) {
      console.warn('AI optimization failed:', aiError.message);
    }
    
    return Response.json({
      success: true,
      plan_id: savedPlan.id,
      plan: savedPlan
    });
    
  } catch (error) {
    console.error('Error generating financial plan:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});

// ============================================================================
// ПОМОЩНИ ФУНКЦИИ
// ============================================================================

async function calculateFinancialMetrics(analysisData, rules) {
  const eurRate = EUR_BGN_RATE;
  
  // Месечни доходи
  const clientNetIncome = (analysisData.client_net_income || 0) / eurRate;
  const partnerNetIncome = analysisData.include_partner ? (analysisData.partner_net_income || 0) / eurRate : 0;
  const clientOtherIncome = (analysisData.client_other_monthly_income || 0) / eurRate;
  const partnerOtherIncome = analysisData.include_partner ? (analysisData.partner_other_monthly_income || 0) / eurRate : 0;
  
  const totalMonthlyIncome = clientNetIncome + partnerNetIncome + clientOtherIncome + partnerOtherIncome;
  
  // Променливи разходи (всички expense_ полета)
  const variableExpenses = (
    (analysisData.expense_rent || 0) +
    (analysisData.expense_utilities || 0) +
    (analysisData.expense_phone || 0) +
    (analysisData.expense_internet || 0) +
    (analysisData.expense_tv || 0) +
    (analysisData.expense_other_housing || 0) +
    (analysisData.expense_fuel || 0) +
    (analysisData.expense_car_maintenance || 0) +
    (analysisData.expense_car_other || 0) +
    (analysisData.expense_food || 0) +
    (analysisData.expense_clothing || 0) +
    (analysisData.expense_culture || 0) +
    (analysisData.expense_travel || 0) +
    (analysisData.expense_children || 0) +
    (analysisData.expense_cigarettes || 0) +
    (analysisData.expense_pets || 0) +
    (analysisData.expense_vacation || 0) +
    (analysisData.expense_business || 0) +
    (analysisData.expense_other || 0)
  ) / eurRate;
  
  const totalMonthlyExpenses = variableExpenses;
  const monthlyBalance = totalMonthlyIncome - totalMonthlyExpenses;
  
  // Години до пенсия
  const yearsToRetirement_p1 = (analysisData.client_retirement_age || 65) - (analysisData.client_age || 30);
  const yearsToRetirement_p2 = analysisData.include_partner 
    ? (analysisData.partner_retirement_age || 65) - (analysisData.partner_age || 30)
    : 0;
  
  // Трудов капитал (с 3% годишен растеж)
  const laborCapital_p1 = calculateLaborCapital(clientNetIncome, yearsToRetirement_p1);
  const laborCapital_p2 = analysisData.include_partner 
    ? calculateLaborCapital(partnerNetIncome, yearsToRetirement_p2) 
    : 0;
  
  return {
    totalMonthlyIncome,
    totalMonthlyExpenses,
    monthlyBalance,
    variableExpenses,
    yearsToRetirement_p1,
    yearsToRetirement_p2,
    laborCapital_p1,
    laborCapital_p2,
    clientNetIncome,
    partnerNetIncome
  };
}

function calculateLaborCapital(monthlyNetIncome, yearsToRetirement) {
  const annualSalaryGrowth = 0.03;
  let total = 0;
  
  for (let year = 0; year < yearsToRetirement; year++) {
    const yearlyIncome = monthlyNetIncome * 12 * Math.pow(1 + annualSalaryGrowth, year);
    total += yearlyIncome;
  }
  
  return total;
}

async function optimizeExistingProducts(analysisData, rules, calculations) {
  const optimizations = [];
  const eurRate = EUR_BGN_RATE;
  
  // 1. Ипотечен кредит - рефинансиране
  if (analysisData.liability_mortgage && analysisData.liability_mortgage > 0) {
    const mortgageAmount = analysisData.liability_mortgage / eurRate;
    const currentRate = 0.06; // Предполагаем средна лихва
    const newRate = 0.04; // По-добра лихва
    const remainingYears = 20; // Предполагаем остатъчен срок
    
    const currentPayment = calculateMonthlyPayment(mortgageAmount, currentRate, remainingYears);
    const newPayment = calculateMonthlyPayment(mortgageAmount, newRate, remainingYears);
    
    // Такси рефинансиране
    const refinanceFees = (mortgageAmount * 0.002) + (mortgageAmount * 0.002 * 0.2) + (60 / eurRate) + (70 / eurRate);
    const savingsPerMonth = currentPayment - newPayment;
    const savings2Years = savingsPerMonth * 24;
    
    if (newPayment < currentPayment && savings2Years >= refinanceFees) {
      optimizations.push({
        type: 'mortgage_refinance',
        currentPayment: currentPayment,
        newPayment: newPayment,
        monthlySavings: savingsPerMonth,
        fees: refinanceFees,
        recommendation: 'Препоръчва се рефинансиране с MetLife Credit Guard'
      });
    }
  }
  
  // 2. Пенсионен фонд - винаги оптимизирай към ОББ УПФ
  if (analysisData.client_pillar_2 || analysisData.partner_pillar_2) {
    optimizations.push({
      type: 'pension_fund',
      recommendation: 'Промяна към ОББ УПФ (0 лв месечна цена)',
      monthlySavings: 25 // Приблизителна средна спестявания
    });
  }
  
  // 3. Застраховка дом
  if (analysisData.property_apartment_value > 0 || analysisData.property_house_value > 0) {
    const propertyValue = (analysisData.property_apartment_value || 0) + (analysisData.property_house_value || 0);
    
    if (!analysisData.has_property_insurance || propertyValue > 500000) {
      optimizations.push({
        type: 'home_insurance',
        propertyValue: propertyValue,
        recommendation: propertyValue <= 500000 ? 'Инстинкт' : 'ДЗИ Защита за дома'
      });
    }
  }
  
  // 4. Каско/ГО
  if (analysisData.property_car_value > 8000 && !analysisData.insurance_casco) {
    optimizations.push({
      type: 'car_insurance',
      recommendation: 'ДЗИ Каско/ГО',
      carValue: analysisData.property_car_value
    });
  }
  
  return optimizations;
}

function calculateMonthlyPayment(principal, annualRate, years) {
  const monthlyRate = annualRate / 12;
  const numPayments = years * 12;
  
  if (monthlyRate === 0) return principal / numPayments;
  
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
         (Math.pow(1 + monthlyRate, numPayments) - 1);
}

async function calculateProtectionNeeds(analysisData, rules, calculations) {
  const eurRate = EUR_BGN_RATE;
  const variableExpenses = calculations.variableExpenses;
  
  const needs = {
    partner1_disability: 0,
    partner1_criticalIllness: 0,
    partner1_death: 0,
    partner2_disability: 0,
    partner2_criticalIllness: 0,
    partner2_death: 0,
    partner1_total: 0,
    partner2_total: 0
  };
  
  // Изчисляване на социална издръжка за различни рискове
  // (Това трябва да съответства на логиката от ProtectionStep.jsx)
  
  // Partner 1 - Disability
  if (analysisData.risk_disability) {
    const age = analysisData.client_age || 30;
    const socialSupport = calculateDisabilitySupport(analysisData, true);
    const coverage = 0.8 * (variableExpenses - socialSupport) * (80 - age) * 12;
    needs.partner1_disability = Math.max(0, Math.round(coverage / 100) * 100);
  }
  
  // Partner 1 - Critical Illness
  if (analysisData.risk_disability || analysisData.risk_sick_leave) {
    const socialSupport = calculateSickLeaveSupport(analysisData, true);
    const coverage = (variableExpenses - socialSupport) * 3 * 12;
    needs.partner1_criticalIllness = Math.max(0, Math.round(coverage / 100) * 100);
  }
  
  // Partner 1 - Death
  if (analysisData.risk_death) {
    const socialSupport = calculateDeathSupport(analysisData, true);
    const yearsToRetirement = calculations.yearsToRetirement_p1;
    const coverage = (variableExpenses - socialSupport) * yearsToRetirement * 12;
    needs.partner1_death = Math.max(0, Math.round(coverage / 100) * 100);
  }
  
  // Partner 2 (ако има)
  if (analysisData.include_partner) {
    if (analysisData.risk_disability) {
      const age = analysisData.partner_age || 30;
      const socialSupport = calculateDisabilitySupport(analysisData, false);
      const coverage = 0.8 * (variableExpenses - socialSupport) * (80 - age) * 12;
      needs.partner2_disability = Math.max(0, Math.round(coverage / 100) * 100);
    }
    
    if (analysisData.risk_disability || analysisData.risk_sick_leave) {
      const socialSupport = calculateSickLeaveSupport(analysisData, false);
      const coverage = (variableExpenses - socialSupport) * 3 * 12;
      needs.partner2_criticalIllness = Math.max(0, Math.round(coverage / 100) * 100);
    }
    
    if (analysisData.risk_death) {
      const socialSupport = calculateDeathSupport(analysisData, false);
      const yearsToRetirement = calculations.yearsToRetirement_p2;
      const coverage = (variableExpenses - socialSupport) * yearsToRetirement * 12;
      needs.partner2_death = Math.max(0, Math.round(coverage / 100) * 100);
    }
  }
  
  // Общи нужди
  needs.partner1_total = Math.max(
    needs.partner1_disability,
    needs.partner1_criticalIllness,
    needs.partner1_death
  );
  
  needs.partner2_total = Math.max(
    needs.partner2_disability,
    needs.partner2_criticalIllness,
    needs.partner2_death
  );
  
  return needs;
}

// Симулация на изчисления от ProtectionStep.jsx
function calculateDisabilitySupport(analysisData, isClient) {
  const grossIncome = isClient 
    ? (analysisData.client_gross_income || 0)
    : (analysisData.partner_gross_income || 0);
  
  // Приблизително 80% от брутна заплата за инвалидност
  return (grossIncome * 0.8) / EUR_BGN_RATE;
}

function calculateSickLeaveSupport(analysisData, isClient) {
  const grossIncome = isClient 
    ? (analysisData.client_gross_income || 0)
    : (analysisData.partner_gross_income || 0);
  
  // Приблизително 80% от брутна заплата за болнични
  return (grossIncome * 0.8) / EUR_BGN_RATE;
}

function calculateDeathSupport(analysisData, isClient) {
  const netIncome = isClient 
    ? (analysisData.client_net_income || 0)
    : (analysisData.partner_net_income || 0);
  
  // При смърт - само социална подкрепа за деца (ако има)
  if (analysisData.children_count > 0) {
    return (netIncome * 0.3) / EUR_BGN_RATE; // 30% от доход като детска помощ
  }
  
  return 0;
}

async function recommendProducts(analysisData, rules, calculations, protectionNeeds, base44) {
  const products = [];
  const standardPlan = rules.standard_plan_structure || {};
  const availableBudget = calculations.monthlyBalance * 0.4; // 40% лимит
  let usedBudget = 0;
  
  // 1. Задължително: ОББ УПФ (0 лв)
  if (analysisData.client_pillar_2 || analysisData.partner_pillar_2) {
    products.push({
      name: 'ОББ УПФ - Оптимизация',
      provider: 'ОББ',
      product_type: 'pension_plan',
      beneficiary: 'family',
      monthlyPremium: 0,
      annualPremium: 0,
      coverage: 0,
      expectedValue: 0,
      termYears: calculations.yearsToRetirement_p1,
      benefit: 'Промяна на пенсионен фонд за по-добра доходност'
    });
  }
  
  // 2. Основен продукт: MetLife Unit Linked
  const ulPremium = Math.min(availableBudget * 0.5, 300); // Започваме с 50% от бюджета, макс 300 EUR
  
  if (ulPremium >= 25) { // Минимална премия за UL
    const annualPremium = ulPremium * 12;
    const termYears = calculations.yearsToRetirement_p1;
    
    // Премиен бонус
    const bonusPercent = getMetLifeBonus(annualPremium, rules);
    
    // Такса управление
    const managementFee = getMetLifeManagementFee(annualPremium, rules);
    
    // Покритие живот
    const lifeCoverage = getMetLifeLifeCoverage(
      annualPremium, 
      analysisData.client_age || 30,
      analysisData.include_partner,
      analysisData.children_count > 0,
      rules
    );
    
    // Очаквана стойност (8% годишна доходност)
    const expectedReturn = 0.08;
    const monthlyReturn = expectedReturn / 12;
    const months = termYears * 12;
    const futureValue = ulPremium * (((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn) * (1 + monthlyReturn));
    
    products.push({
      name: 'MetLife Unit Linked',
      provider: 'MetLife',
      product_type: 'ul_investment',
      beneficiary: 'partner1',
      strategy: analysisData.risk_profile || 'balanced',
      termYears: termYears,
      monthlyPremium: ulPremium,
      annualPremium: annualPremium,
      coverage: lifeCoverage,
      expectedValue: Math.round(futureValue),
      benefit: `Инвестиция с покритие живот ${lifeCoverage} EUR и очаквана стойност ${Math.round(futureValue)} EUR`,
      coverages: {
        death: lifeCoverage,
        critical_illness: protectionNeeds.partner1_criticalIllness,
        disability: protectionNeeds.partner1_disability,
        fractures: 1500,
        telemedicine: 'Включено',
        premium_waiver: analysisData.children_count > 0 ? 'Включено' : null
      }
    });
    
    usedBudget += ulPremium;
  }
  
  // 3. При допълнителен бюджет
  const remainingBudget = availableBudget - usedBudget;
  
  // 3.1. Uniqa Здраве и ценност - План Европа (винаги, ако има бюджет)
  if (remainingBudget >= 30) {
    const uniqaPremium = 35; // Приблизителна цена за План Европа
    
    products.push({
      name: 'Uniqa Здраве и ценност - План Европа',
      provider: 'Uniqa',
      product_type: 'health_insurance',
      beneficiary: 'family',
      monthlyPremium: uniqaPremium,
      annualPremium: uniqaPremium * 12,
      coverage: 50000,
      expectedValue: 0,
      benefit: 'Здравна застраховка с покритие в Европа',
      coverages: {
        health_insurance: 50000,
        telemedicine: 'Включено'
      }
    });
    
    usedBudget += uniqaPremium;
  }
  
  // 3.2. Generali базов пакет (ако няма от фирма)
  if (remainingBudget - (usedBudget - availableBudget + usedBudget) >= 15 && !analysisData.client_job_description?.includes('здравна')) {
    const generaliPremium = 15;
    
    products.push({
      name: 'Generali Health Line Базов',
      provider: 'Generali',
      product_type: 'health_insurance',
      beneficiary: 'family',
      monthlyPremium: generaliPremium,
      annualPremium: generaliPremium * 12,
      coverage: 20000,
      expectedValue: 0,
      benefit: 'Базова здравна застраховка',
      coverages: {
        health_insurance: 20000
      }
    });
    
    usedBudget += generaliPremium;
  }
  
  // 3.3. Детски Unit Linked (ако има деца)
  if (analysisData.children_count > 0 && remainingBudget - (usedBudget - availableBudget + usedBudget) >= 25) {
    for (let i = 1; i <= Math.min(analysisData.children_count, 3); i++) {
      const childBirthdate = analysisData[`child_${i}_birthdate`];
      if (childBirthdate) {
        const childAge = new Date().getFullYear() - new Date(childBirthdate).getFullYear();
        const yearsTo19 = Math.max(19 - childAge, 0);
        
        if (yearsTo19 > 0) {
          const childULPremium = 30;
          const annualPremium = childULPremium * 12;
          const months = yearsTo19 * 12;
          const monthlyReturn = 0.08 / 12;
          const futureValue = childULPremium * (((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn) * (1 + monthlyReturn));
          
          products.push({
            name: `MetLife Unit Linked Junior - Дете ${i}`,
            provider: 'MetLife',
            product_type: 'education_plan',
            beneficiary: `child${i}`,
            strategy: 'balanced',
            termYears: yearsTo19,
            monthlyPremium: childULPremium,
            annualPremium: annualPremium,
            coverage: 0,
            expectedValue: Math.round(futureValue),
            benefit: `Образование за дете ${i} с очаквана стойност ${Math.round(futureValue)} EUR`,
            coverages: {
              premium_waiver: 'Включено'
            }
          });
          
          usedBudget += childULPremium;
        }
      }
    }
  }
  
  // 3.4. ДЗИ Закрила Gold (ако има бюджет)
  if (remainingBudget - (usedBudget - availableBudget + usedBudget) >= 7.67) {
    const dziPremium = 15 / EUR_BGN_RATE; // 15 BGN в EUR
    
    products.push({
      name: 'ДЗИ Закрила Gold',
      provider: 'ДЗИ',
      product_type: 'personal_accident',
      beneficiary: 'family',
      monthlyPremium: dziPremium,
      annualPremium: dziPremium * 12,
      coverage: 15000,
      expectedValue: 0,
      benefit: 'Застраховка Злополука',
      coverages: {
        accident_death: 15000,
        permanent_disability: 15000
      }
    });
    
    usedBudget += dziPremium;
  }
  
  return products;
}

function getMetLifeBonus(annualPremium, rules) {
  const bonusTable = rules.metlife_ul_premium_bonus || [];
  
  for (const tier of bonusTable) {
    if (annualPremium >= tier.min_amount && annualPremium <= tier.max_amount) {
      return tier.bonus_percent;
    }
  }
  
  return 0;
}

function getMetLifeManagementFee(annualPremium, rules) {
  const feeTable = rules.metlife_ul_management_fee || [];
  
  for (const tier of feeTable) {
    if (annualPremium >= tier.min_amount && annualPremium <= tier.max_amount) {
      return tier.fee_percent;
    }
  }
  
  return 2.0; // По подразбиране
}

function getMetLifeLifeCoverage(annualPremium, age, hasPartner, hasChildren, rules) {
  const multipliers = rules.metlife_ul_life_coverage_multipliers || [];
  const defaultCoverage = rules.metlife_ul_life_coverage_default || 2500;
  
  // Ако няма партньор или деца
  if (!hasPartner && !hasChildren) {
    return defaultCoverage;
  }
  
  // Намираме мултипликатора за възрастта
  for (const tier of multipliers) {
    if (age >= tier.age_from && age <= tier.age_to) {
      return annualPremium * tier.multiplier;
    }
  }
  
  return annualPremium * 6; // По подразбиране x6
}

async function applyPlanLimits(products, calculations, rules) {
  const limits = rules.plan_limits || {};
  const totalMonthlyIncome = calculations.totalMonthlyIncome;
  const monthlyBalance = calculations.monthlyBalance;
  
  // Изчисляване на общи стойности
  let totalMonthlyPremium = products.reduce((sum, p) => sum + (p.monthlyPremium || 0), 0);
  let totalAnnualPremium = totalMonthlyPremium * 12;
  let annualIncome = totalMonthlyIncome * 12;
  
  // Проверка на лимити
  const maxAnnualPlan = annualIncome * (limits.max_annual_plan_vs_income || 1.5);
  const maxMonthlyPlan = monthlyBalance * (limits.max_monthly_plan_vs_balance || 0.4);
  
  // Ако надвишаваме лимитите, намаляваме премиите пропорционално
  if (totalAnnualPremium > maxAnnualPlan) {
    const reductionFactor = maxAnnualPlan / totalAnnualPremium;
    products = products.map(p => ({
      ...p,
      monthlyPremium: p.monthlyPremium * reductionFactor,
      annualPremium: p.annualPremium * reductionFactor
    }));
    
    totalMonthlyPremium = products.reduce((sum, p) => sum + (p.monthlyPremium || 0), 0);
  }
  
  if (totalMonthlyPremium > maxMonthlyPlan) {
    const reductionFactor = maxMonthlyPlan / totalMonthlyPremium;
    products = products.map(p => ({
      ...p,
      monthlyPremium: p.monthlyPremium * reductionFactor,
      annualPremium: p.annualPremium * reductionFactor
    }));
  }
  
  // Проверка за минимална инвестиция
  const investmentProducts = products.filter(p => 
    p.product_type === 'ul_investment' || 
    p.product_type === 'education_plan'
  );
  
  const totalInvestments = investmentProducts.reduce((sum, p) => sum + (p.monthlyPremium || 0), 0);
  const minInvestment = (limits.min_monthly_investment || 50) / EUR_BGN_RATE;
  
  if (totalInvestments < minInvestment) {
    console.warn('Investment below minimum threshold');
  }
  
  return products;
}

function applyPricingPsychology(products, rules) {
  const psychology = rules.pricing_psychology || {};
  
  if (!psychology.round_premiums_down) {
    return products;
  }
  
  return products.map(product => {
    let premium = product.monthlyPremium;
    
    // Закръгляне надолу до психологически прагове
    if (premium > 100) {
      premium = Math.floor(premium / 10) * 10 - 1; // 103 -> 99
    } else if (premium > 50) {
      premium = Math.floor(premium / 5) * 5 - 1; // 52 -> 49
    }
    
    // Закръгляне на покрития визуално
    let coverage = product.coverage;
    if (psychology.round_coverages_visually && coverage > 0) {
      if (coverage > 10000) {
        coverage = Math.round(coverage / 10000) * 10000;
      } else if (coverage > 1000) {
        coverage = Math.round(coverage / 1000) * 1000;
      }
    }
    
    return {
      ...product,
      monthlyPremium: premium,
      annualPremium: premium * 12,
      coverage: coverage
    };
  });
}

async function calculateFinalMetrics(calculations, products, analysisData, rules) {
  const totalMonthlyPremium = products.reduce((sum, p) => sum + (p.monthlyPremium || 0), 0);
  const totalAnnualPremium = totalMonthlyPremium * 12;
  const totalCoverage = products.reduce((sum, p) => sum + (p.coverage || 0), 0);
  const totalExpectedValue = products.reduce((sum, p) => sum + (p.expectedValue || 0), 0);
  
  const availableForInvestment = calculations.monthlyBalance - totalMonthlyPremium;
  
  // Резервна нужда
  const desiredReserveMonths = analysisData.desired_reserve_months || 6;
  const reserveNeed = calculations.totalMonthlyExpenses * desiredReserveMonths;
  
  // Пенсионен дефицит
  const clientDesiredPension = (analysisData.client_desired_pension || 0) / EUR_BGN_RATE;
  const clientExpectedPension = (analysisData.client_expected_state_pension || 0) / EUR_BGN_RATE;
  const pensionGap_p1 = Math.max(0, clientDesiredPension - clientExpectedPension);
  
  const partnerDesiredPension = analysisData.include_partner ? (analysisData.partner_desired_pension || 0) / EUR_BGN_RATE : 0;
  const partnerExpectedPension = analysisData.include_partner ? (analysisData.partner_expected_state_pension || 0) / EUR_BGN_RATE : 0;
  const pensionGap_p2 = Math.max(0, partnerDesiredPension - partnerExpectedPension);
  
  // Данъчно облекчение (10% от приложими премии)
  const taxReliefProducts = products.filter(p => 
    p.product_type === 'ul_investment' ||
    p.product_type === 'education_plan' ||
    p.product_type === 'term_life' ||
    p.product_type === 'health_insurance' ||
    p.product_type === 'pension_plan'
  );
  
  const totalTaxRelief = taxReliefProducts.reduce((sum, p) => sum + (p.annualPremium || 0), 0) * 0.1;
  
  return {
    totalMonthlyIncome: calculations.totalMonthlyIncome,
    totalMonthlyExpenses: calculations.totalMonthlyExpenses,
    availableForInvestment: availableForInvestment,
    totalMonthlyPremium: totalMonthlyPremium,
    totalAnnualPremium: totalAnnualPremium,
    totalCoverage: totalCoverage,
    totalExpectedValue: totalExpectedValue,
    reserveNeed: reserveNeed,
    pensionGap_p1: pensionGap_p1,
    pensionGap_p2: pensionGap_p2,
    totalTaxRelief: totalTaxRelief
  };
}