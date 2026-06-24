/**
 * generateFinancialPlan — v3.0 (Entity-based)
 * 
 * Чете тарифите от JsonRulebookVersion и TariffTableVersion entities.
 * Всички суми са в EUR (BGN е заменен с EUR от 01.01.2026).
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ──────────────────────────────────────────────────────────
// FINANCIAL MATHEMATICS HELPERS
// ──────────────────────────────────────────────────────────

const pvAnnuity = (monthlyRate, months) => {
  if (monthlyRate === 0) return months;
  return (1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate;
};

const statDisabilityBenefit = (grossIncome) => Math.min(grossIncome * 0.50, 1055.82);

const netToGross = (net) => {
  if (net <= 1638.60) return net * 1.28869;
  return net / 0.9 + 291;
};

const calcStatePension = (gross) => Math.min(Math.max(gross * 0.45, 347), 1739);

const fvLumpSum = (pv, annualRate, years) => pv * Math.pow(1 + annualRate, years);
const fvAnnuity = (monthlyContrib, annualRate, years) => {
  const r = annualRate / 12;
  const n = years * 12;
  if (r === 0) return monthlyContrib * n;
  return monthlyContrib * (Math.pow(1 + r, n) - 1) / r;
};

// ──────────────────────────────────────────────────────────
// UL PROJECTION
// ──────────────────────────────────────────────────────────

const JUNIOR_FACE_AMOUNT = 0;

const projectULFull = (annualSavings, startAge, yearsToRetirement, assumedReturn = 0.08, faceAmount = 2500, getMonthlyMortalityFn) => {
  if (yearsToRetirement <= 0 || annualSavings <= 0) return 0;

  const premiumBonus = getPremiumBonus(annualSavings);
  const avChargeRate = getAVCharge(annualSavings);
  const monthlyReturn = assumedReturn / 12;
  const policyFeeMonthly = 15 / 12;

  let accountValue = 0;

  for (let year = 1; year <= yearsToRetirement; year++) {
    const currentAge = startAge + year - 1;
    const investibleRate = year === 1 ? 0.30 : year === 2 ? 0.60 : 1.00;
    const monthlyPremium = annualSavings / 12;

    for (let month = 1; month <= 12; month++) {
      let investible = monthlyPremium * investibleRate;
      if (year === 1 && month === 1) {
        investible += annualSavings * premiumBonus;
      }
      accountValue += investible;
      accountValue *= (1 + monthlyReturn);
      const avCharge = accountValue * (avChargeRate / 12);
      const coi = accountValue * getMonthlyMortalityFn(currentAge) * (faceAmount / 1000);
      accountValue -= (avCharge + coi + policyFeeMonthly);
      accountValue = Math.max(0, accountValue);
    }
  }
  return Math.round(accountValue);
};

const findAnnualSavingsForTarget = (target, startAge, yearsToRetirement, maxBudget, minSavings = 300, faceAmount = 2500, getMonthlyMortalityFn) => {
  if (target <= 0) return 0;
  if (yearsToRetirement <= 0) return null;
  let lo = minSavings, hi = maxBudget;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (projectULFull(mid, startAge, yearsToRetirement, 0.08, faceAmount, getMonthlyMortalityFn) >= target) hi = mid;
    else lo = mid;
  }
  return hi > maxBudget ? null : Math.max(minSavings, hi);
};

// ──────────────────────────────────────────────────────────
// MAIN HANDLER
// ──────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { analysis_id, verified_profile_id, journey_id } = await req.json();
    if (!analysis_id) return Response.json({ error: 'analysis_id е задължително' }, { status: 400 });

    // ──────────────────────────────────────────────────────────
    // LOAD TARIFFS FROM ENTITIES
    // ──────────────────────────────────────────────────────────

    const activeRulebooks = await base44.asServiceRole.entities.JsonRulebookVersion.filter({ is_active: true });
    if (!activeRulebooks || activeRulebooks.length === 0) {
      return Response.json({ error: 'Няма активен JsonRulebookVersion. Изпълнете seedRulebookData първо.' }, { status: 503 });
    }
    const rulebook = activeRulebooks[0];
    const tariffs = rulebook.rulebook_json.tariffs || {};

    // Extract tariffs from entity
    const TERM_LIFE_BASIC_RATES = tariffs.TERM_LIFE_BASIC_RATES || {};
    const CI32_RATES = tariffs.CI32_RATES || {};
    const CI40_COEFFICIENTS = tariffs.CI40_COEFFICIENTS || {};
    const RISK_CLASS_1 = tariffs.RISK_CLASS_1 || { pi: 1.5, fracturesAndBurns: 16, accidentalDeath: 1.5 };
    const AV_CHARGE_TABLE = tariffs.AV_CHARGE_TABLE || [];
    const PREMIUM_BONUS_TABLE = tariffs.PREMIUM_BONUS_TABLE || [];
    const UNIQA_EUROPA_TARIFFS = tariffs.UNIQA_EUROPA_TARIFFS || {};
    const GENERALI_BASIC_MONTHLY_EUR = tariffs.GENERALI_BASIC_MONTHLY_EUR || 60;
    const DZI_ZAKRILA_PLATINUM = tariffs.DZI_ZAKRILA_PLATINUM || { monthly: 30, annual: 360, coverages: {} };
    const CHILD_FRACTURES_RATE = tariffs.CHILD_FRACTURES_RATE || 33;
    const CHILD_FRACTURES_AMOUNT = tariffs.CHILD_FRACTURES_AMOUNT || 750;
    const CHILD_PROTECTION_COEFFICIENTS = tariffs.CHILD_PROTECTION_COEFFICIENTS || {};
    const METLIFE_CARE_AGE_RATES = tariffs.METLIFE_CARE_AGE_RATES || {};
    const ML_CARE_PACKAGES = tariffs.ML_CARE_PACKAGES || {};
    const ML_CARE_RULES = tariffs.ML_CARE_RULES || {};
    const MORTALITY_QX = tariffs.MORTALITY_QX || {};
    const CG_RULES = tariffs.CG_RULES || {};

    // Load Credit Guard tariff from TariffTableVersion
    const cgTariffs = await base44.asServiceRole.entities.TariffTableVersion.filter({
      provider: 'MetLife',
      product_type: 'credit_guard',
      is_active: true,
    });
    const CG_TARIFF = cgTariffs.length > 0 ? cgTariffs[0].table_json : {};

    const rulebookVersion = rulebook.version || '3.0';

    // ──────────────────────────────────────────────────────────
    // LOOKUP HELPERS (using entity-loaded tariffs)
    // ──────────────────────────────────────────────────────────

    const getAVCharge = (annualPremium) => {
      let rate = AV_CHARGE_TABLE[0]?.rate || 0.02;
      for (const row of AV_CHARGE_TABLE) {
        if (annualPremium >= row.from) rate = row.rate;
        else break;
      }
      return rate;
    };

    const getPremiumBonus = (annualPremium) => {
      for (const row of PREMIUM_BONUS_TABLE) {
        if (annualPremium >= row.from && annualPremium < row.to) return row.bonus;
      }
      return 0;
    };

    const getTermLifeBasicRate = (age, termYears = 5) => {
      const ageKeys = Object.keys(TERM_LIFE_BASIC_RATES).map(Number).sort((a,b)=>a-b);
      let selAge = ageKeys[0];
      for (const k of ageKeys) { if (k <= age) selAge = k; else break; }
      return TERM_LIFE_BASIC_RATES[selAge]?.[termYears] || TERM_LIFE_BASIC_RATES[selAge]?.[5] || 5;
    };

    const getCI32Rate = (age, termYears = 10) => {
      const clampedAge = Math.min(Math.max(Math.floor(age), 18), 60);
      const rates = CI32_RATES[clampedAge];
      if (!rates) return CI32_RATES[60]?.yr5 || 46.34;
      if (termYears >= 10 && rates.yr10) return rates.yr10;
      return rates.yr5;
    };

    const getCI40Coefficient = (age) => {
      return CI40_COEFFICIENTS[Math.min(Math.max(Math.floor(age), 18), 65)] || 50;
    };

    const getUniqaMonthly = (age) => {
      if (age > 64) return null;
      if (age <= 17) return UNIQA_EUROPA_TARIFFS['0-17']?.monthly || 6.48;
      if (age <= 30) return UNIQA_EUROPA_TARIFFS['18-30']?.monthly || 12.54;
      if (age <= 40) return UNIQA_EUROPA_TARIFFS['31-40']?.monthly || 13.71;
      if (age <= 45) return UNIQA_EUROPA_TARIFFS['41-45']?.monthly || 16.48;
      if (age <= 50) return UNIQA_EUROPA_TARIFFS['46-50']?.monthly || 20.02;
      if (age <= 55) return UNIQA_EUROPA_TARIFFS['51-55']?.monthly || 24.71;
      if (age <= 60) return UNIQA_EUROPA_TARIFFS['56-60']?.monthly || 30.50;
      if (age <= 65) return UNIQA_EUROPA_TARIFFS['61-65']?.monthly || 37.40;
      return null;
    };

    const getCreditGuardMonthly = (age, loanAmount, termYears, packageType = 'basic') => {
      if (!loanAmount || loanAmount <= 0) return null;
      if (age < CG_RULES.min_age || age > CG_RULES.max_age) return null;
      if (loanAmount < CG_RULES.min_sum || loanAmount > CG_RULES.max_sum) return null;
      if (age + termYears > CG_RULES.max_age) return null;

      const ageData = CG_TARIFF[age];
      if (!ageData) return null;

      const availableTerms = CG_RULES.available_terms
        .filter(t => ageData[t] !== undefined && t <= termYears)
        .sort((a, b) => b - a);
      if (!availableTerms.length) return null;

      const selTerm = availableTerms[0];
      const ratePerHundredK = ageData[selTerm][packageType];
      if (!ratePerHundredK) return null;

      const annualPremium = (loanAmount / CG_RULES.reference_sum) * ratePerHundredK;
      return Math.round(annualPremium / 12 * 100) / 100;
    };

    const SNAP_THRESHOLDS = [720, 960, 1200, 1500, 1800, 2400, 3000, 3600, 4200];
    const nextSnapThreshold = (annual) => SNAP_THRESHOLDS.find(t => t > annual) || null;

    const getMonthlyMortality = (age) => {
      const a = Math.min(Math.max(Math.floor(age), 0), 101);
      const q = MORTALITY_QX[a] || MORTALITY_QX[101];
      return (q.m * 0.8 + q.f * 0.2) / 1000 / 12;
    };

    const getChildProtectionCoefficient = (policyholderAge) => {
      if (policyholderAge < 18 || policyholderAge > 55) return null;
      return CHILD_PROTECTION_COEFFICIENTS[policyholderAge] || 0.044;
    };

    const calcMLCarePremium = (age, coverages, includeTelemedicine = true, riskClass = 1) => {
      const ageRates = METLIFE_CARE_AGE_RATES[Math.min(Math.max(Math.floor(age), 18), 65)];
      let netPremium = 0;
      const breakdown = {};

      const piRates = { 1: 1.5, 2: 2.5, 3: 4.0 };
      const ptdRate = piRates[riskClass] || 1.5;

      if (coverages.disability > 0 && age <= ML_CARE_RULES.max_age_disability) {
        const prem = (coverages.disability / 1000) * (ageRates?.disability || 0);
        breakdown.disability = { coverage: coverages.disability, rate: ageRates?.disability || 0, premium: prem };
        netPremium += prem;
      }
      if (coverages.ptd > 0 && age <= ML_CARE_RULES.max_age_ptd) {
        const prem = (coverages.ptd / 1000) * ptdRate;
        breakdown.ptd = { coverage: coverages.ptd, rate: ptdRate, premium: prem };
        netPremium += prem;
      }
      if (coverages.ci40 > 0 && age >= 18 && age <= ML_CARE_RULES.max_age_ci40) {
        const prem = (coverages.ci40 / 1000) * (ageRates?.ci40 || 0);
        breakdown.ci40 = { coverage: coverages.ci40, rate: ageRates?.ci40 || 0, premium: prem };
        netPremium += prem;
      }
      if (coverages.cancer > 0 && age >= 18 && age <= ML_CARE_RULES.max_age_cancer) {
        const prem = (coverages.cancer / 1000) * (ageRates?.cancer || 0);
        breakdown.cancer = { coverage: coverages.cancer, rate: ageRates?.cancer || 0, premium: prem };
        netPremium += prem;
      }
      if (coverages.inSitu > 0 && age >= 18 && age <= ML_CARE_RULES.max_age_inSitu) {
        const prem = (coverages.inSitu / 1000) * (ageRates?.inSitu || 0);
        breakdown.inSitu = { coverage: coverages.inSitu, rate: ageRates?.inSitu || 0, premium: prem };
        netPremium += prem;
      }
      if (includeTelemedicine && age <= ML_CARE_RULES.max_age_telemedicine) {
        breakdown.telemedicine = { coverage: 'Включено', premium: 15 };
        netPremium += 15;
      }

      const insuranceTax = netPremium * (ML_CARE_RULES.insurance_tax || 0.02);
      const annualPremium = netPremium + insuranceTax;

      return {
        annualPremium: Math.round(annualPremium * 100) / 100,
        monthlyPremium: Math.round((annualPremium / 12) * 100) / 100,
        semiAnnualPremium: Math.round(annualPremium * (ML_CARE_RULES.semi_annual_factor || 0.51) * 100) / 100,
        quarterlyPremium: Math.round(annualPremium * (ML_CARE_RULES.quarterly_factor || 0.26) * 100) / 100,
        netPremium: Math.round(netPremium * 100) / 100,
        insuranceTax: Math.round(insuranceTax * 100) / 100,
        breakdown,
        eligible: annualPremium >= (ML_CARE_RULES.min_annual_premium || 50),
      };
    };

    // ──────────────────────────────────────────────────────────
    // LOAD ANALYSIS DATA
    // ──────────────────────────────────────────────────────────

    const analysisRows = await base44.asServiceRole.entities.FinancialAnalysisSubmission.filter({ id: analysis_id });
    if (!analysisRows?.length) return Response.json({ error: 'Анализът не е намерен' }, { status: 404 });
    const a = analysisRows[0];

    const includePartner = a.include_partner || false;

    // ── INCOME ──
    const clientNet   = a.client_net_income || 0;
    const clientGross = a.client_gross_income || 0;
    const partnerNet  = includePartner ? (a.partner_net_income || 0) : 0;
    const partnerGross= includePartner ? (a.partner_gross_income || 0) : 0;
    const totalIncome = clientNet + partnerNet
      + (a.client_other_monthly_income || 0)
      + (a.client_13th_salary || 0) / 12
      + (a.client_other_annual_income || 0) / 12
      + (includePartner ? (a.partner_other_monthly_income || 0) : 0)
      + (includePartner ? (a.partner_13th_salary || 0) / 12 : 0)
      + (includePartner ? (a.partner_other_annual_income || 0) / 12 : 0);

    // ── EXPENSES ──
    const variableExpenses =
      (a.expense_rent||0)+(a.expense_utilities||0)+(a.expense_phone||0)+(a.expense_internet||0)+
      (a.expense_tv||0)+(a.expense_other_housing||0)+(a.expense_fuel||0)+(a.expense_car_maintenance||0)+
      (a.expense_car_other||0)+(a.expense_food||0)+(a.expense_clothing||0)+(a.expense_culture||0)+
      (a.expense_travel||0)+(a.expense_children||0)+(a.expense_cigarettes||0)+(a.expense_pets||0)+
      (a.expense_vacation||0)+(a.expense_business||0)+(a.expense_other||0);

    const currentLiabilitiesMonthly =
      (a.liability_mortgage_monthly||0)+(a.liability_consumer_loans_monthly||0)+
      (a.liability_credit_cards_monthly||0)+(a.liability_leasing_monthly||0)+(a.liability_overdraft_monthly||0);

    const currentInsuranceMonthly =
      (a.insurance_life||0)+(a.insurance_property||0)+(a.insurance_movable||0)+
      (a.insurance_household||0)+(a.insurance_civil||0)+(a.insurance_casco||0)+(a.insurance_other||0);

    const monthlyInvestments = a.monthly_investments || 0;
    const oldMonthlyBalance = totalIncome - variableExpenses - monthlyInvestments - currentLiabilitiesMonthly - currentInsuranceMonthly;
    const monthlyBalanceAfterOpt = oldMonthlyBalance;

    // ── RESERVE ──
    const existingLiquid =
      (a.asset_checking_account||0)+(a.asset_short_term_savings||0)+(a.asset_medium_term_savings||0)+
      (includePartner?(a.partner_checking_account||0):0)+(includePartner?(a.partner_savings_book||0):0)+
      (includePartner?(a.partner_term_deposit||0):0)+
      (a.client_cash||0)+(includePartner?(a.partner_cash||0):0);

    const targetReserve = 6 * (variableExpenses + currentLiabilitiesMonthly);
    const reserveAlreadyBuilt = existingLiquid >= targetReserve;

    // ── CEILINGS ──
    let ceiling1, ceiling2;
    if (reserveAlreadyBuilt) {
      ceiling1 = totalIncome * 2.0 / 12;
      ceiling2 = monthlyBalanceAfterOpt * 0.66;
    } else {
      ceiling1 = totalIncome * 1.5 / 12;
      ceiling2 = monthlyBalanceAfterOpt * 0.40;
    }
    const maxMonthlyBudget = Math.min(ceiling1, ceiling2);
    const budgetAnnual = maxMonthlyBudget * 12;

    // ── AGES & HORIZONS ──
    const cAge = Math.floor(a.client_age || 35);
    const pAge = includePartner ? Math.floor(a.partner_age || 35) : 0;
    const cRetAge = Math.min(a.client_retirement_age || 65, 65);
    const pRetAge = includePartner ? Math.min(a.partner_retirement_age || 65, 65) : 65;
    const cYears = Math.max(0, cRetAge - cAge);
    const pYears = includePartner ? Math.max(0, pRetAge - pAge) : 0;

    // ── EXISTING ASSETS ──
    const avgYears = includePartner ? (cYears + pYears) / 2 : cYears;
    const fvFinancialAssets = fvLumpSum(
      (a.asset_medium_term_savings||0) + (a.asset_long_term_savings||0), 0.05, avgYears
    );
    const fvProperties = fvLumpSum(
      ((a.has_property_2 ? a.property_2_value || 0 : 0) + (a.has_property_3 ? a.property_3_value || 0 : 0)),
      0.03, avgYears
    );
    const cVolPensionMonthly = (a.client_voluntary_pension && a.client_voluntary_pension_monthly) ? a.client_voluntary_pension_monthly : 0;
    const cVolPensionBalance = (a.client_voluntary_pension && a.client_voluntary_pension_total) ? a.client_voluntary_pension_total : 0;
    const pVolPensionMonthly = (includePartner && a.partner_voluntary_pension && a.partner_voluntary_pension_monthly) ? a.partner_voluntary_pension_monthly : 0;
    const pVolPensionBalance = (includePartner && a.partner_voluntary_pension && a.partner_voluntary_pension_total) ? a.partner_voluntary_pension_total : 0;
    const fvVolPension =
      fvAnnuity(cVolPensionMonthly, 0.03, cYears) + fvLumpSum(cVolPensionBalance, 0.03, cYears) +
      fvAnnuity(pVolPensionMonthly, 0.03, pYears) + fvLumpSum(pVolPensionBalance, 0.03, pYears);

    // ── PENSION CORPUS ──
    const calcCorpus = (netInc, grossInc, yearsToRet, desiredRetAge) => {
      const g = 0.03 / 12;
      const r = 0.04 / 12;
      const stPension = desiredRetAge < 65 ? 67 : calcStatePension(grossInc > 0 ? grossInc : netToGross(netInc));
      const futureConsumption = variableExpenses * Math.pow(1 + g, yearsToRet * 12);
      const pensionGap = Math.max(0, futureConsumption - stPension);
      if (pensionGap <= 0) return 0;
      const corpus = pensionGap / (r - g) * (1 - Math.pow((1 + g) / (1 + r), 240));
      return Math.max(0, corpus);
    };

    const corpusClient  = calcCorpus(clientNet, clientGross, cYears, cRetAge);
    const corpusPartner = includePartner ? calcCorpus(partnerNet, partnerGross, pYears, pRetAge) : 0;
    const totalCorpus = corpusClient + corpusPartner;
    const corpusNet = Math.max(0, totalCorpus - fvFinancialAssets - fvProperties - fvVolPension);
    const targetPerPerson = includePartner ? corpusNet / 2 : corpusNet;

    // ── FIND UL CONTRIBUTIONS ──
    const UL_FACE_AMOUNT = 2500;
    let cAnnualSavings = 300;
    if (cYears > 0 && budgetAnnual >= 300) {
      const t = findAnnualSavingsForTarget(targetPerPerson, cAge, cYears, budgetAnnual, 300, UL_FACE_AMOUNT, getMonthlyMortality);
      if (t !== null) cAnnualSavings = t;
    }
    let pAnnualSavings = null;
    if (includePartner && pYears > 0 && partnerNet > 0) {
      pAnnualSavings = 300;
      const t = findAnnualSavingsForTarget(targetPerPerson, pAge, pYears, budgetAnnual, 300, UL_FACE_AMOUNT, getMonthlyMortality);
      if (t !== null) pAnnualSavings = t;
    }

    // ── CHILDREN — Junior (≤ 11) ──
    const childrenCount = a.children_count || 0;
    const childrenAges = a.children_ages || [];
    const childrenNames = a.children_names || [];
    const totalEdGoal = (a.children_education_costs||0)+(a.children_start_life_costs||0)+(a.children_wedding_costs||0);
    const existingEdSavings = a.children_current_savings || 0;
    const educationGap = Math.max(0, totalEdGoal - existingEdSavings);

    const juniorSavingsByChild = [];
    const eligibleChildrenForHorizon = childrenAges.filter(age => Math.floor(age) <= 11 && (20 - Math.floor(age)) >= 1);
    const totalHorizonSum = eligibleChildrenForHorizon.reduce((s, age) => s + (20 - Math.floor(age)), 0);

    for (let i = 0; i < childrenAges.length; i++) {
      const childAge = Math.floor(childrenAges[i]);
      if (childAge > 11) continue;
      const horizon = 20 - childAge;
      if (horizon < 1) continue;

      const horizonShare = totalHorizonSum > 0 ? horizon / totalHorizonSum : 1;
      const gapForThisChild = educationGap * horizonShare;

      const findJuniorSavings = (target, budg) => {
        if (target <= 0) return 300;
        let lo = 300, hi = budg;
        for (let iter = 0; iter < 40; iter++) {
          const mid = (lo + hi) / 2;
          if (projectULFull(mid, childAge, horizon, 0.08, JUNIOR_FACE_AMOUNT, getMonthlyMortality) >= target) hi = mid;
          else lo = mid;
        }
        return Math.max(300, hi);
      };

      juniorSavingsByChild.push({
        childIdx: i, childAge,
        childName: childrenNames[i] || `Дете ${i + 1}`,
        horizon, gapForThisChild,
        juniorSavings: findJuniorSavings(gapForThisChild, budgetAnnual),
      });
    }

    // ── SNAP-TO-THRESHOLD ──
    const trySnap = (cSav, pSav, jSavArr, budg) => {
      const snaps = [];
      const checkSnap = (sav) => {
        const next = nextSnapThreshold(sav);
        if (next && next - sav <= 0.05 * budg) return next - sav;
        return null;
      };
      if (cSav) { const s = checkSnap(cSav); if (s) snaps.push({ type: 'c', gap: s }); }
      if (pSav) { const s = checkSnap(pSav); if (s) snaps.push({ type: 'p', gap: s }); }
      jSavArr.forEach((js, idx) => { const s = checkSnap(js); if (s) snaps.push({ type: 'j', idx, gap: s }); });

      const totalGap = snaps.reduce((a, b) => a + b.gap, 0);
      if (totalGap <= budg) {
        snaps.forEach(snap => {
          if (snap.type === 'c') cSav = nextSnapThreshold(cSav) || cSav;
          if (snap.type === 'p') pSav = nextSnapThreshold(pSav) || pSav;
          if (snap.type === 'j') jSavArr[snap.idx] = nextSnapThreshold(jSavArr[snap.idx]) || jSavArr[snap.idx];
        });
      }
      return { cSav, pSav, jSavArr };
    };

    const jSavArray = juniorSavingsByChild.map(j => j.juniorSavings);
    const snapResult = trySnap(cAnnualSavings, pAnnualSavings, jSavArray, budgetAnnual);
    cAnnualSavings = snapResult.cSav;
    pAnnualSavings = snapResult.pSav;
    juniorSavingsByChild.forEach((j, i) => { j.juniorSavings = snapResult.jSavArr[i]; });

    // ── BUDGET ALLOCATION ──
    let investmentBudgetRemaining = budgetAnnual;
    const ulNeededTotal = (cAnnualSavings || 0) + (pAnnualSavings || 0);
    const juniorNeededTotal = juniorSavingsByChild.reduce((s, j) => s + j.juniorSavings, 0);
    const totalInvestmentNeeded = ulNeededTotal + juniorNeededTotal;
    const minJuniorBudgetAnnual = 300 * Math.max(1, juniorSavingsByChild.length);
    const canAffordMinJunior = juniorSavingsByChild.length === 0 || investmentBudgetRemaining >= minJuniorBudgetAnnual;

    let juniorBudgetAllocated = 0;
    let ulBudgetAllocated = 0;

    if (juniorSavingsByChild.length === 0) {
      ulBudgetAllocated = investmentBudgetRemaining;
    } else if (!canAffordMinJunior) {
      ulBudgetAllocated = investmentBudgetRemaining;
    } else if (totalInvestmentNeeded <= investmentBudgetRemaining) {
      juniorBudgetAllocated = juniorNeededTotal;
      ulBudgetAllocated = ulNeededTotal;
    } else {
      juniorBudgetAllocated = investmentBudgetRemaining * 0.70;
      ulBudgetAllocated = investmentBudgetRemaining * 0.30;
      if (juniorNeededTotal > 0) {
        const scale = juniorBudgetAllocated / juniorNeededTotal;
        juniorSavingsByChild.forEach(j => { j.juniorSavings = Math.max(300, Math.round(j.juniorSavings * scale)); });
      }
      if (ulNeededTotal > 0 && ulBudgetAllocated > 0) {
        const scale = ulBudgetAllocated / ulNeededTotal;
        if (cAnnualSavings) cAnnualSavings *= scale;
        if (pAnnualSavings) pAnnualSavings *= scale;
      } else {
        cAnnualSavings = 0;
        pAnnualSavings = null;
      }
    }

    const protectionBudgetMonthly = maxMonthlyBudget - ((juniorBudgetAllocated + ulBudgetAllocated) / 12);

    // ── HELPERS ──
    const hasChildUnder18 = childrenAges.some(age => Math.floor(age) < 18);
    const hasMortgage = (a.liability_mortgage_monthly || 0) > 0;
    const totalHouseholdIncome = totalIncome;
    const clientIncomeShare = totalHouseholdIncome > 0 ? clientNet / totalHouseholdIncome : 1;
    const partnerIncomeShare = totalHouseholdIncome > 0 ? partnerNet / totalHouseholdIncome : 0;

    const clientUsesUL  = cAnnualSavings && cAnnualSavings / 12 >= 25;
    const partnerUsesUL = pAnnualSavings && pAnnualSavings / 12 >= 25;

    const planProducts = [];
    let totalMonthlyPremium = 0;
    let remainingMonthlyBudget = protectionBudgetMonthly;

    const addProduct = (product, ruleKey) => {
      planProducts.push(product);
      totalMonthlyPremium += product.monthly_premium || 0;
      remainingMonthlyBudget -= product.monthly_premium || 0;
      if (ruleKey) rulesFired.push(ruleKey);
    };

    // ── RULES FIRED LOG ──
    const rulesFired = [];

    // ── STEP 1A: MetLife UL for client ──
    if (cAge < 65 && clientUsesUL && cAnnualSavings >= 300) {
      const premiumBonus = getPremiumBonus(cAnnualSavings);
      const avChargeRate = getAVCharge(cAnnualSavings);
      const waiverCost = cAge <= 55 ? (cAnnualSavings + 0) * 0.043799 : 0;
      const totalAnnual = cAnnualSavings + 0 + waiverCost + 15;
      const monthly = Math.round((totalAnnual / 12) * 100) / 100;

      addProduct({
        product_type: 'ul_investment',
        provider: 'MetLife',
        product_name: 'MetLife Предимство',
        beneficiary: 'partner1',
        beneficiary_name: `${a.client_first_name||''} ${a.client_last_name||''}`.trim(),
        beneficiary_age: cAge,
        term_years: Math.min(80 - cAge, 49),
        strategy: 'dynamic',
        monthly_premium: monthly,
        total_premium: monthly * 12,
        coverage_amount: 2500,
        expected_value: projectULFull(cAnnualSavings, cAge, cYears, 0.08, UL_FACE_AMOUNT, getMonthlyMortality),
        is_active: true,
        details: {
          annual_savings: Math.round(cAnnualSavings),
          premium_bonus_pct: Math.round(premiumBonus * 100),
          av_charge_pct: Math.round(avChargeRate * 10000) / 100,
          target_corpus: Math.round(targetPerPerson),
          projected_value_at_retirement: projectULFull(cAnnualSavings, cAge, cYears, 0.08, UL_FACE_AMOUNT, getMonthlyMortality),
        },
      }, 'UL_CLIENT');
    }

    // ── STEP 1B: MetLife UL for partner ──
    if (includePartner && pAge < 65 && partnerUsesUL && pAnnualSavings >= 300) {
      const premiumBonus = getPremiumBonus(pAnnualSavings);
      const avChargeRate = getAVCharge(pAnnualSavings);
      const waiverCost = pAge <= 55 ? (pAnnualSavings + 0) * 0.043799 : 0;
      const totalAnnual = pAnnualSavings + 0 + waiverCost + 15;
      const monthly = Math.round((totalAnnual / 12) * 100) / 100;

      addProduct({
        product_type: 'ul_investment',
        provider: 'MetLife',
        product_name: 'MetLife Предимство',
        beneficiary: 'partner2',
        beneficiary_name: `${a.partner_first_name||''} ${a.partner_last_name||''}`.trim(),
        beneficiary_age: pAge,
        term_years: Math.min(80 - pAge, 49),
        strategy: 'dynamic',
        monthly_premium: monthly,
        total_premium: monthly * 12,
        coverage_amount: 2500,
        expected_value: projectULFull(pAnnualSavings, pAge, pYears, 0.08, UL_FACE_AMOUNT, getMonthlyMortality),
        is_active: true,
        details: {
          annual_savings: Math.round(pAnnualSavings),
          premium_bonus_pct: Math.round(premiumBonus * 100),
          av_charge_pct: Math.round(avChargeRate * 10000) / 100,
          target_corpus: Math.round(targetPerPerson),
          projected_value_at_retirement: projectULFull(pAnnualSavings, pAge, pYears, 0.08, UL_FACE_AMOUNT, getMonthlyMortality),
        },
      }, 'UL_PARTNER');
    }

    // ── STEP 1C: MetLife Junior (children ≤ 11) ──
    if (juniorSavingsByChild.length > 0) {
      const juniorTotalNeeded = juniorSavingsByChild.reduce((s, j) => s + j.juniorSavings, 0);
      const scale = juniorBudgetAllocated > 0 && juniorTotalNeeded > 0 ? juniorBudgetAllocated / juniorTotalNeeded : 1;

      for (const child of juniorSavingsByChild) {
        const scaledSavings = Math.max(300, Math.round(child.juniorSavings * scale));
        const jFracturesCost = (CHILD_FRACTURES_AMOUNT / 1000) * CHILD_FRACTURES_RATE;
        const childProtectionCoeff = getChildProtectionCoefficient(cAge) || 0;
        const jProtectionCost = (scaledSavings + jFracturesCost) * childProtectionCoeff;
        const jAdminFee = 15;
        const jTotalAnnual = scaledSavings + jFracturesCost + jProtectionCost + jAdminFee;
        const jMonthly = Math.round((jTotalAnnual / 12) * 100) / 100;

        if (jMonthly > 0) {
          addProduct({
            product_type: 'ul_investment',
            provider: 'MetLife',
            product_name: 'MetLife Джуниър',
            beneficiary: `child${child.childIdx + 1}`,
            beneficiary_name: child.childName,
            beneficiary_age: child.childAge,
            term_years: child.horizon,
            strategy: 'dynamic',
            monthly_premium: jMonthly,
            total_premium: jMonthly * 12,
            expected_value: projectULFull(scaledSavings, child.childAge, child.horizon, 0.08, JUNIOR_FACE_AMOUNT, getMonthlyMortality),
            is_active: true,
            details: {
              annual_savings: scaledSavings,
              target_education_gap: Math.round(child.gapForThisChild),
              coverages: {
                fractures: CHILD_FRACTURES_AMOUNT,
                child_protection_agreement: childProtectionCoeff > 0,
              },
              premium_bonus_pct: Math.round(getPremiumBonus(scaledSavings) * 100),
              av_charge_pct: Math.round(getAVCharge(scaledSavings) * 10000) / 100,
            },
          });
        }
      }
    }

    // ── STEP 2: Term Life fallback ──
    if (cAge < 65 && !clientUsesUL && remainingMonthlyBudget >= DZI_ZAKRILA_PLATINUM.monthly) {
      addProduct({
        product_type: 'personal_accident',

        provider: 'ДЗИ',
        product_name: 'ДЗИ Закрила — Платинен пакет',
        beneficiary: 'partner1',
        beneficiary_name: `${a.client_first_name||''} ${a.client_last_name||''}`.trim(),
        beneficiary_age: cAge,
        monthly_premium: DZI_ZAKRILA_PLATINUM.monthly,
        total_premium: DZI_ZAKRILA_PLATINUM.annual,
        coverage_amount: DZI_ZAKRILA_PLATINUM.coverages.deathAccident || 50000,
        is_active: true,
        details: { plan: 'Platinum', currency: 'EUR' },
      }, 'DZI_ZAKRILA_FALLBACK');
    }

    // ── MetLife Credit Guard (при ипотека) ──
    const mortgageBalance = a.liability_mortgage_remaining || 0;
    const mortgageTermMonths = a.liability_mortgage_remaining_months || 0;
    const mortgageTermYears = mortgageTermMonths > 0 ? Math.ceil(mortgageTermMonths / 12) : 20;
    if (
      mortgageBalance >= CG_RULES.min_sum &&
      mortgageBalance <= CG_RULES.max_sum &&
      hasMortgage &&
      cAge >= CG_RULES.min_age &&
      cAge <= CG_RULES.max_age
    ) {
      const maxAllowedTerm = CG_RULES.max_age - cAge;
      const cgTerm = Math.min(mortgageTermYears, maxAllowedTerm);
      if (cgTerm >= 5) {
        const cgMonthly = getCreditGuardMonthly(cAge, mortgageBalance, cgTerm, 'basic');
        if (cgMonthly && cgMonthly > 0 && remainingMonthlyBudget >= cgMonthly) {
          const ageData = CG_TARIFF[cAge] || {};
          const chosenTerm = CG_RULES.available_terms
            .filter(t => ageData[t] !== undefined && t <= cgTerm)
            .sort((a, b) => b - a)[0];
          addProduct({
            product_type: 'term_life',
            provider: 'MetLife',
            product_name: 'MetLife Credit Guard — Основен пакет',
            beneficiary: 'partner1',
            beneficiary_name: `${a.client_first_name||''} ${a.client_last_name||''}`.trim(),
            beneficiary_age: cAge,
            term_years: chosenTerm || cgTerm,
            monthly_premium: cgMonthly,
            total_premium: cgMonthly * 12,
            coverage_amount: mortgageBalance,
            is_active: true,
            details: {
              loan_balance: mortgageBalance,
              loan_term_years: chosenTerm || cgTerm,
              package: 'Основен',
            },
          }, 'CG_MORTGAGE_MATCH');
        }
      }
    }

    // ── УНИКА Здраве и ценност — клиент ──
    const uniqaMonthlyClient = getUniqaMonthly(cAge);
    if (uniqaMonthlyClient !== null && cAge <= 64 && remainingMonthlyBudget >= uniqaMonthlyClient) {
      addProduct({
        product_type: 'critical_illness',
        provider: 'УНИКА',
        product_name: 'Здраве и Ценност Селект — План Европа',
        beneficiary: 'partner1',
        beneficiary_name: `${a.client_first_name||''} ${a.client_last_name||''}`.trim(),
        beneficiary_age: cAge,
        monthly_premium: uniqaMonthlyClient,
        total_premium: uniqaMonthlyClient * 12,
        coverage_amount: 2242300,
        is_active: true,
        details: { plan: 'Europa', currency: 'EUR' },
      }, 'UNIQA_CLIENT');
    }

    // ── УНИКА за партньор ──
    if (includePartner) {
      const uniqaMonthlyPartner = getUniqaMonthly(pAge);
      if (uniqaMonthlyPartner !== null && pAge <= 64 && remainingMonthlyBudget >= uniqaMonthlyPartner) {
        addProduct({
          product_type: 'critical_illness',
          provider: 'УНИКА',
          product_name: 'Здраве и Ценност Селект — План Европа',
          beneficiary: 'partner2',
          beneficiary_name: `${a.partner_first_name||''} ${a.partner_last_name||''}`.trim(),
          beneficiary_age: pAge,
          monthly_premium: uniqaMonthlyPartner,
          total_premium: uniqaMonthlyPartner * 12,
          coverage_amount: 2242300,
          is_active: true,
          details: { plan: 'Europa', currency: 'EUR' },
        }, 'UNIQA_PARTNER');
      }
    }

    // ── УНИКА за деца ──
    const childrenUniqaCosts = [];
    for (let i = 0; i < childrenAges.length; i++) {
      const childAge = Math.floor(childrenAges[i]);
      if (childAge > 64) continue;
      const uniqaChild = getUniqaMonthly(childAge);
      if (uniqaChild !== null) {
        childrenUniqaCosts.push({ childIdx: i, childAge, uniqaChild, childName: childrenNames[i] || `Дете ${i + 1}` });
      }
    }
    const totalChildrenUniqaCost = childrenUniqaCosts.reduce((s, c) => s + c.uniqaChild, 0);
    if (totalChildrenUniqaCost > 0 && remainingMonthlyBudget >= totalChildrenUniqaCost) {
      for (const child of childrenUniqaCosts) {
        addProduct({
          product_type: 'critical_illness',
          provider: 'УНИКА',
          product_name: 'Здраве и Ценност Селект — План Европа',
          beneficiary: `child${child.childIdx + 1}`,
          beneficiary_name: child.childName,
          beneficiary_age: child.childAge,
          monthly_premium: child.uniqaChild,
          total_premium: child.uniqaChild * 12,
          coverage_amount: 2242300,
          is_active: true,
          details: { plan: 'Europa', currency: 'EUR' },
        });
      }
    }

    // ── MetLife Грижа — Сребърен пакет ──
    const mlCarePkg = ML_CARE_PACKAGES['Сребърен'] || { disability: 25000, ptd: 25000, ci40: 25000, cancer: 25000, inSitu: 12500 };

    if (cAge >= 18 && cAge <= 65) {
      const mlCareClient = calcMLCarePremium(
        cAge,
        { disability: mlCarePkg.disability, ptd: mlCarePkg.ptd, ci40: mlCarePkg.ci40, cancer: mlCarePkg.cancer, inSitu: mlCarePkg.inSitu },
        cAge <= 64,
        1
      );
      if (mlCareClient.eligible && remainingMonthlyBudget >= mlCareClient.monthlyPremium) {
        addProduct({
          product_type: 'health_insurance',
          provider: 'MetLife',
          product_name: 'MetLife Грижа — Сребърен пакет',
          beneficiary: 'partner1',
          beneficiary_name: `${a.client_first_name||''} ${a.client_last_name||''}`.trim(),
          beneficiary_age: cAge,
          monthly_premium: mlCareClient.monthlyPremium,
          total_premium: mlCareClient.annualPremium,
          coverage_amount: mlCarePkg.disability,
          is_active: true,
          details: {
            package: 'Сребърен',
            risk_class: 1,
            currency: 'EUR',
            coverages: mlCarePkg,
          },
        });
      }
    }

    if (includePartner && pAge >= 18 && pAge <= 65) {
      const mlCarePartner = calcMLCarePremium(
        pAge,
        { disability: mlCarePkg.disability, ptd: mlCarePkg.ptd, ci40: mlCarePkg.ci40, cancer: mlCarePkg.cancer, inSitu: mlCarePkg.inSitu },
        pAge <= 64,
        1
      );
      if (mlCarePartner.eligible && remainingMonthlyBudget >= mlCarePartner.monthlyPremium) {
        addProduct({
          product_type: 'health_insurance',
          provider: 'MetLife',
          product_name: 'MetLife Грижа — Сребърен пакет',
          beneficiary: 'partner2',
          beneficiary_name: `${a.partner_first_name||''} ${a.partner_last_name||''}`.trim(),
          beneficiary_age: pAge,
          monthly_premium: mlCarePartner.monthlyPremium,
          total_premium: mlCarePartner.annualPremium,
          coverage_amount: mlCarePkg.disability,
          is_active: true,
          details: {
            package: 'Сребърен',
            risk_class: 1,
            currency: 'EUR',
            coverages: mlCarePkg,
          },
        });
      }
    }

    // ── Дженерали Basic ──
    const clientNeedsGenerali = !a.has_employer_health_insurance && cAge >= 18 && cAge <= 70;
    const partnerNeedsGenerali = includePartner && !a.partner_has_employer_health_insurance && pAge >= 18 && pAge <= 70;
    const generaliTotal = (clientNeedsGenerali ? GENERALI_BASIC_MONTHLY_EUR : 0) + (partnerNeedsGenerali ? GENERALI_BASIC_MONTHLY_EUR : 0);

    if (generaliTotal > 0 && remainingMonthlyBudget >= generaliTotal) {
      if (clientNeedsGenerali) {
        addProduct({
          product_type: 'health_insurance',
          provider: 'Generali',
          product_name: 'HEALTH Line Basic',
          beneficiary: 'partner1',
          beneficiary_name: `${a.client_first_name||''} ${a.client_last_name||''}`.trim(),
          beneficiary_age: cAge,
          monthly_premium: GENERALI_BASIC_MONTHLY_EUR,
          total_premium: GENERALI_BASIC_MONTHLY_EUR * 12,
          is_active: true,
          details: { plan: 'Basic', currency: 'EUR' },
        });
      }
      if (partnerNeedsGenerali) {
        addProduct({
          product_type: 'health_insurance',
          provider: 'Generali',
          product_name: 'HEALTH Line Basic',
          beneficiary: 'partner2',
          beneficiary_name: `${a.partner_first_name||''} ${a.partner_last_name||''}`.trim(),
          beneficiary_age: pAge,
          monthly_premium: GENERALI_BASIC_MONTHLY_EUR,
          total_premium: GENERALI_BASIC_MONTHLY_EUR * 12,
          is_active: true,
          details: { plan: 'Basic', currency: 'EUR' },
        });
      }
    }

    // ── II СТЪЛБ: Смяна към ОББ УПФ ──
    const OBB_FUND = 'УПФ „ОББ" ЕАД';
    if (a.client_pillar_2 && a.client_pension_fund !== OBB_FUND) {
      addProduct({
        product_type: 'pension_plan',
        provider: 'ОББ УПФ',
        product_name: 'Универсален Пенсионен Фонд ОББ — смяна на фонд',
        beneficiary: 'partner1',
        beneficiary_name: `${a.client_first_name||''} ${a.client_last_name||''}`.trim(),
        beneficiary_age: cAge,
        monthly_premium: 0,
        total_premium: 0,
        is_active: true,
        details: { from_fund: a.client_pension_fund },
      });
    }
    if (includePartner && a.partner_pillar_2 && a.partner_pension_fund !== OBB_FUND) {
      addProduct({
        product_type: 'pension_plan',
        provider: 'ОББ УПФ',
        product_name: 'Универсален Пенсионен Фонд ОББ — смяна на фонд',
        beneficiary: 'partner2',
        beneficiary_name: `${a.partner_first_name||''} ${a.partner_last_name||''}`.trim(),
        beneficiary_age: pAge,
        monthly_premium: 0,
        total_premium: 0,
        is_active: true,
        details: { from_fund: a.partner_pension_fund },
      });
    }

    // ── AUTO-SELL ELIGIBILITY ──
    const blockReasons = [];
    if (totalIncome <= 0)            blockReasons.push('NO_INCOME');
    if (maxMonthlyBudget <= 0)       blockReasons.push('NO_BUDGET');
    if (cAge > 65)                   blockReasons.push('CLIENT_OVER_65');
    if (planProducts.length === 0)   blockReasons.push('NO_PRODUCTS_GENERATED');
    if (totalMonthlyPremium > maxMonthlyBudget * 2) blockReasons.push('BUDGET_EXCEEDED');
    const auto_sell_eligible = blockReasons.length === 0;

    // ── SUMMARY ──
    const taxReliefAnnual = planProducts.filter(p => (p.monthly_premium || 0) > 0)
      .reduce((s, p) => s + (p.total_premium || 0), 0) * 0.10;

    // ── CALCULATE RULESET HASH ──
    const rulebookPayload = `v${rulebookVersion}|${cAge}|${totalIncome}|${budgetAnnual}`;
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rulebookPayload));
    const ruleset_hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('');

    // ── SAVE FINANCIAL PLAN ──
    const financialPlan = {
      analysis_id,
      client_id: a.client_id,
      plan_status: 'calculated',
      valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      partner1_age: cAge,
      partner2_age: pAge,
      years_to_retirement_p1: cYears,
      years_to_retirement_p2: pYears,
      total_monthly_income: totalIncome,
      total_monthly_expenses: variableExpenses,
      available_for_investment: monthlyBalanceAfterOpt,
      protection_need_p1: Math.round(corpusClient * 0.5),
      protection_need_p2: includePartner ? Math.round(corpusPartner * 0.5) : 0,
      reserve_need: targetReserve,
      pension_gap_p1: Math.round(targetPerPerson),
      pension_gap_p2: includePartner ? Math.round(targetPerPerson) : 0,
      products: planProducts,
      total_monthly_premium: totalMonthlyPremium,
      total_coverage: planProducts.reduce((s, p) => s + (p.coverage_amount || 0), 0),
      total_expected_value: planProducts.reduce((s, p) => s + (p.expected_value || 0), 0),
      auto_sell_eligible,
      notes: JSON.stringify({
        version: rulebookVersion,
        constitution_based: true,
        tariffs_source: 'JsonRulebookVersion entity',
        currency: 'EUR',
        ceilings: { ceiling1: Math.round(ceiling1), ceiling2: Math.round(ceiling2), maxMonthlyBudget: Math.round(maxMonthlyBudget) },
        reserve_mode: reserveAlreadyBuilt ? 'B' : 'A',
        total_corpus: Math.round(totalCorpus),
        corpus_net: Math.round(corpusNet),
        target_per_person: Math.round(targetPerPerson),
        auto_sell_eligible,
        block_reasons: blockReasons,
        list_of_rules_fired: rulesFired,
      }),
    };

    if (verified_profile_id) financialPlan.verified_profile_id = verified_profile_id;
    if (journey_id) financialPlan.journey_id = journey_id;
    financialPlan.rulebook_version = rulebookVersion;
    financialPlan.ruleset_hash = ruleset_hash;

    const savedPlan = await base44.asServiceRole.entities.FinancialPlan.create(financialPlan);

    if (journey_id) {
      await base44.asServiceRole.entities.Journey.update(journey_id, {
        plan_id: savedPlan.id,
        ruleset_hash,
        rulebook_version: rulebookVersion,
        auto_sell_eligible,
        last_activity_at: new Date().toISOString(),
      });

      // Advance journey state based on eligibility
      const targetState = auto_sell_eligible ? 'plan_ready' : 'plan_auto_sell_blocked';
      try {
        const smRes = await base44.functions.invoke('journeyStateMachine', {
          journey_id,
          to_state: targetState,
          extra_data: {
            auto_sell_eligible,
            ...(blockReasons.length > 0 && { graceful_stop_reason: blockReasons.join(', ') }),
          },
        });
        console.log(`Journey advanced to ${targetState}:`, smRes);
      } catch (smErr) {
        console.warn('journeyStateMachine advance failed (non-blocking):', smErr.message);
      }

      // If blocked, create a follow-up task
      if (!auto_sell_eligible) {
        try {
          await base44.functions.invoke('createFollowUpTask', {
            journey_id,
            reason: 'plan_auto_sell_blocked',
            notes: `Block reasons: ${blockReasons.join(', ')}`,
          });
        } catch (ftErr) {
          console.warn('createFollowUpTask failed:', ftErr.message);
        }
      }
    }

    for (const product of planProducts) {
      await base44.asServiceRole.entities.ProductOffer.create({
        plan_id: savedPlan.id,
        analysis_id,
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
        ai_recommendation_reason: `Генериран по PLAN_RULES v${rulebookVersion} — тарифи от JsonRulebookVersion entity`,
      });
    }

    return Response.json({
      success: true,
      plan_id: savedPlan.id,
      version: rulebookVersion,
      summary: {
        total_monthly_premium: Math.round(totalMonthlyPremium * 100) / 100,
        total_products: planProducts.length,
        corpus_net: Math.round(corpusNet),
        target_per_person: Math.round(targetPerPerson),
        reserve_mode: reserveAlreadyBuilt ? 'B' : 'A',
        budget_ceiling_monthly: Math.round(maxMonthlyBudget),
        tax_relief_annual: Math.round(taxReliefAnnual),
      },
      products: planProducts,
    });

  } catch (error) {
    console.error('generateFinancialPlan v3.0 error:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});