import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// ============================================================
// generateFinancialPlan — v2.0
//
// Следва стриктно PLAN_RULES (PlanRulesConstitution + PlanRulesProductTables).
// Всички магически числа са взети от конституцията.
// ============================================================

// ──────────────────────────────────────────────────────────
// ТАБЛИЦИ (от PlanRulesProductTables)
// ──────────────────────────────────────────────────────────
const AV_CHARGE_TABLE = [
  { from: 300,  to: 719,  rate: 0.020 },
  { from: 720,  to: 959,  rate: 0.0175 },
  { from: 960,  to: 1199, rate: 0.015 },
  { from: 1200, to: 1499, rate: 0.0125 },
  { from: 1500, to: 2399, rate: 0.010 },
  { from: 2400, to: 3599, rate: 0.0075 },
  { from: 3600, to: null, rate: 0.005 },
];

const PREMIUM_BONUS_TABLE = [
  { from: 1200, to: 1799, bonus: 0.01 },
  { from: 1800, to: 2999, bonus: 0.02 },
  { from: 3000, to: 4199, bonus: 0.03 },
  { from: 4200, to: null, bonus: 0.04 },
];

// ──────────────────────────────────────────────────────────
// КОНСТАНТИ (от FinancialPlanConstants / PLAN_CONSTITUTION)
// ──────────────────────────────────────────────────────────

// ── TERM LIFE BASIC RATES (TERM_LIFE_BASIC_RATES от FinancialPlanConstants) ──
// тарифа на 1000 € покритие по възраст и срок (5 год.)
const TERM_LIFE_BASIC_RATES = {
  18:{5:3.91},19:{5:3.96},20:{5:4},21:{5:4.04},22:{5:4.09},23:{5:4.1},
  24:{5:4.13},25:{5:4.14},26:{5:4.15},27:{5:4.16},28:{5:4.22},29:{5:4.3},
  30:{5:4.38},31:{5:4.49},32:{5:4.61},33:{5:4.77},34:{5:4.9},35:{5:5.08},
  36:{5:5.32},37:{5:5.55},38:{5:5.78},39:{5:6.11},40:{5:6.55},41:{5:6.97},
  42:{5:7.51},43:{5:8.16},44:{5:8.79},45:{5:9.3},46:{5:9.99},47:{5:10.68},
  48:{5:11.38},49:{5:12.22},50:{5:13.24},51:{5:14.1},52:{5:15.22},53:{5:16.24},
  54:{5:17.5},55:{5:18.86},56:{5:20.29},57:{5:21.57},58:{5:23.19},59:{5:24.55},
  60:{5:26.09},61:{5:27.57},62:{5:29.57},63:{5:31.39},64:{5:33.6},65:{5:35.75},
};

// ── TERM LIFE 32 CI RATES (yr10 от METLIFE_PA_CRITICAL_ILLNESS_32_RATES) ──
// тарифа на 1000 € покритие при 10 г. срок
const CI32_RATES_YR10 = {
  18:1.85,19:1.85,20:1.85,21:1.85,22:1.85,23:1.85,24:1.85,25:1.85,
  26:3.19,27:3.19,28:3.19,29:3.19,30:3.19,
  31:6.23,32:6.23,33:6.23,34:6.23,35:6.23,
  36:9.57,37:9.57,38:9.57,39:9.57,40:9.57,
  41:16,42:16,43:16,44:16,45:16,
  46:25.47,47:25.47,48:25.47,49:25.47,50:25.47,
  51:38.07,52:38.07,53:38.07,54:38.07,55:38.07,
  56:46.34,57:46.34,58:46.34,59:46.34,60:46.34,
};
// 32 CI yr5 rates (за > 55 г. няма yr10)
const CI32_RATES_YR5 = {
  18:1.4,19:1.4,20:1.4,21:1.4,22:1.4,23:1.4,24:1.4,25:1.4,
  26:2.35,27:2.35,28:2.35,29:2.35,30:2.35,
  31:4.63,32:4.63,33:4.63,34:4.63,35:4.63,
  36:7.24,37:7.24,38:7.24,39:7.24,40:7.24,
  41:12.31,42:12.31,43:12.31,44:12.31,45:12.31,
  46:20.45,47:20.45,48:20.45,49:20.45,50:20.45,
  51:31.79,52:31.79,53:31.79,54:31.79,55:31.79,
  56:46.34,57:46.34,58:46.34,59:46.34,60:46.34,
};

// ── DZI ZAKRILA PLATINUM (от DZIZakrilaCalculator + FinancialPlanConstants) ──
const DZI_ZAKRILA_PLATINUM_MONTHLY = 30; // EUR (конституция: Платинен пакет)
const DZI_ZAKRILA_MIN_AGE = 16;
const DZI_ZAKRILA_MAX_AGE = 69;

// ── METLIFE CREDIT GUARD BASIC RATES (от FinancialPlanConstants) ──
// Тарифа за €100,000 покритие по [възраст][срок]
// (съкратена версия само за нужните диапазони)
const CG_BASIC_RATES = {
  18:{5:147,10:147,15:147,20:147,25:147,30:147},
  19:{5:147,10:147,15:147,20:147,25:147,30:147},
  20:{5:147,10:147,15:147,20:147,25:147,30:147},
  21:{5:147,10:147,15:147,20:147,25:147,30:147},
  22:{5:147,10:147,15:147,20:147,25:147,30:147},
  23:{5:147,10:147,15:147,20:147,25:147,30:147},
  24:{5:147,10:147,15:147,20:147,25:147,30:147},
  25:{5:147,10:147,15:147,20:147,25:147,30:160},
  26:{5:147,10:147,15:147,20:147,25:147,30:160},
  27:{5:147,10:147,15:147,20:147,25:147,30:160},
  28:{5:147,10:147,15:147,20:147,25:160,30:172},
  29:{5:147,10:147,15:147,20:147,25:160,30:184},
  30:{5:160,10:160,15:160,20:160,25:172,30:184},
  31:{5:160,10:160,15:160,20:172,25:184,30:196},
  32:{5:172,10:172,15:172,20:184,25:196,30:209},
  33:{5:172,10:172,15:172,20:184,25:209,30:221},
  34:{5:184,10:184,15:184,20:196,25:209,30:233},
  35:{5:184,10:184,15:196,20:209,25:233,30:245},
  36:{5:196,10:196,15:209,20:221,25:245,30:270},
  37:{5:209,10:209,15:221,20:233,25:258,30:282},
  38:{5:221,10:221,15:233,20:258,25:282,30:306},
  39:{5:233,10:233,15:245,20:270,25:294,30:319},
  40:{5:245,10:245,15:270,20:294,25:319,30:343},
  41:{5:245,10:258,15:282,20:306,25:331},
  42:{5:270,10:282,15:306,20:331,25:368},
  43:{5:294,10:306,15:331,20:355,25:392},
  44:{5:306,10:331,15:355,20:392,25:417},
  45:{5:331,10:355,15:392,20:417,25:453},
  46:{5:355,10:380,15:417,20:453},
  47:{5:392,10:417,15:453,20:490},
  48:{5:417,10:441,15:490,20:515},
  49:{5:453,10:478,15:515,20:551},
  50:{5:466,10:502,15:551,20:588},
  51:{5:502,10:539,15:588},
  52:{5:539,10:576,15:637},
  53:{5:576,10:625,15:674},
  54:{5:600,10:661,15:723},
  55:{5:637,10:698,15:772},
  56:{5:686,10:759},
  57:{5:710,10:796},
  58:{5:784,10:882},
  59:{5:833,10:931},
  60:{5:918,10:1016},
  61:{5:967},62:{5:1029},63:{5:1102},64:{5:1188},65:{5:1273},
};

// METLIFE PA Security Plus Coefficients (40 CI)
const CI40_COEFF = {
  18:225.73,19:218.82,20:212.31,21:206.19,22:200.40,23:194.55,
  24:188.68,25:182.82,26:177.30,27:171.23,28:165.84,29:160.26,
  30:154.80,31:149.25,32:143.88,33:138.50,34:133.33,35:128.04,
  36:122.85,37:117.51,38:112.49,39:107.53,40:102.67,41:97.94,
  42:93.37,43:88.97,44:84.75,45:80.71,46:76.86,47:73.21,
  48:69.69,49:66.36,50:63.09,51:60.06,52:57.08,53:54.20,
  54:51.28,55:48.33,56:46.32,57:43.92,58:41.58,59:39.11,
  60:36.54,61:36.08,62:35.60,63:34.94,64:33.27,65:31.17,
};

// METLIFE PA Risk Class 1 rates (pi = PTD per 1000, fracturesAndBurns per 1000)
const RISK_CLASS_1 = { pi: 1.5, fracturesAndBurns: 16 };

// Uniqa Health Value Select — Plan Europa — monthly premiums by age group
const UNIQA_EUROPA_MONTHLY = {
  '0-17': 6.48, '18-30': 12.54, '31-40': 13.71, '41-45': 16.48,
  '46-50': 20.02, '51-55': 24.71, '56-60': 30.50, '61-64': 37.40,
};

// Generali Health Line Basic — flat rate (BGN→EUR: /1.95583)
const GENERALI_BASIC_MONTHLY_EUR = 60 / 1.95583; // ≈ 30.68 €

// UL integrated life coverage multipliers (PLAN_CONSTITUTION product_rules.metlife_unit_linked)
const UL_LIFE_MULTIPLIERS = [
  { maxAge: 25, mult: 30 },
  { maxAge: 35, mult: 20 },
  { maxAge: 45, mult: 15 },
  { maxAge: 55, mult: 10 },
  { maxAge: 65, mult: 6 },
];

// Premium bonus / AV charge thresholds for snap-to-threshold
const SNAP_THRESHOLDS = [720, 960, 1200, 1500, 1800, 2400, 3000, 3600, 4200];

// ──────────────────────────────────────────────────────────
// LOOKUP HELPERS
// ──────────────────────────────────────────────────────────
const getAVCharge = (annual) => {
  for (const row of AV_CHARGE_TABLE) if (annual >= row.from && (row.to === null || annual <= row.to)) return row.rate;
  return 0.02;
};
const getPremiumBonus = (annual) => {
  for (const row of PREMIUM_BONUS_TABLE) if (annual >= row.from && (row.to === null || annual <= row.to)) return row.bonus;
  return 0;
};
const getULLifeMultiplier = (age) => {
  for (const r of UL_LIFE_MULTIPLIERS) if (age <= r.maxAge) return r.mult;
  return 6;
};
const getUniqaMonthly = (age) => {
  if (age <= 17) return UNIQA_EUROPA_MONTHLY['0-17'];
  if (age <= 30) return UNIQA_EUROPA_MONTHLY['18-30'];
  if (age <= 40) return UNIQA_EUROPA_MONTHLY['31-40'];
  if (age <= 45) return UNIQA_EUROPA_MONTHLY['41-45'];
  if (age <= 50) return UNIQA_EUROPA_MONTHLY['46-50'];
  if (age <= 55) return UNIQA_EUROPA_MONTHLY['51-55'];
  if (age <= 60) return UNIQA_EUROPA_MONTHLY['56-60'];
  if (age <= 64) return UNIQA_EUROPA_MONTHLY['61-64'];
  return null; // 65+ → not eligible per constitution (max age 64)
};
const nextSnapThreshold = (annual) => SNAP_THRESHOLDS.find(t => t > annual) || null;

// ── TERM LIFE HELPERS ──
const getTermLifeBasicRate = (age) => {
  const clampedAge = Math.min(Math.max(Math.floor(age), 18), 65);
  // find nearest age key
  const keys = Object.keys(TERM_LIFE_BASIC_RATES).map(Number).sort((a,b)=>a-b);
  let sel = keys[0];
  for (const k of keys) { if (k <= clampedAge) sel = k; else break; }
  return TERM_LIFE_BASIC_RATES[sel]?.[5] || 5;
};
const getCI32Rate = (age) => {
  const clampedAge = Math.min(Math.max(Math.floor(age), 18), 60);
  // prefer yr10, fallback yr5 for > 55
  return (clampedAge <= 55 ? CI32_RATES_YR10[clampedAge] : CI32_RATES_YR5[clampedAge]) || CI32_RATES_YR5[60];
};

// Calculates Term Life annual premium for one person
// Constitution: basic_life = net_income*24 (if child<18 | mortgage | income_share>55%), else 3000
// PTD: same PV formula; CI32 (10yr term): (net_income - disability)*24; fractures 1500; telemedicine 15; admin 13
const buildTermLifePremium = (age, netIncome, grossIncome, hasChild, hasMortgage, hasPartner, isMainEarner) => {
  const disability = statDisabilityBenefit(grossIncome);
  const months = (65 - age) * 12;

  // Basic life coverage
  const fullCoverageCondition = hasChild || hasMortgage || (hasPartner && isMainEarner);
  const basicLifeCoverage = fullCoverageCondition ? Math.max(0, netIncome) * 24 : 3000;

  // PTD coverage
  const ptdCoverage = Math.ceil(pvAnnuity(0.04 / 12, months) * Math.max(0, netIncome - disability) * 1.2 / 100) * 100;

  // CI32 coverage
  const ci32Coverage = Math.ceil(Math.max(0, netIncome - disability) * 24 / 100) * 100;

  // Cost components
  const basicLifeRate = getTermLifeBasicRate(age);
  const ptdRate = RISK_CLASS_1.pi;
  const fracturesRate = RISK_CLASS_1.fracturesAndBurns;
  const ci32Rate = getCI32Rate(age);

  const basicLifeCost = (basicLifeCoverage / 1000) * basicLifeRate;
  const ptdCost = ptdCoverage > 0 ? (ptdCoverage / 1000) * ptdRate : 0;
  const fracturesCost = (1500 / 1000) * fracturesRate;
  const ci32Cost = ci32Coverage > 0 ? (ci32Coverage / 1000) * ci32Rate : 0;
  const telemedicineCost = 15;
  const adminFee = 13;

  const totalAnnual = basicLifeCost + ptdCost + fracturesCost + ci32Cost + telemedicineCost + adminFee;

  return {
    totalAnnual,
    basicLifeCoverage,
    ptdCoverage,
    ci32Coverage,
    fractures: 1500,
  };
};

// Scale term life coverages proportionally to fit within budget
const scaleTermLifeToFit = (tl, budgetAnnual) => {
  // Fixed components
  const fixedCost = (1500 / 1000) * RISK_CLASS_1.fracturesAndBurns + 15 + 13; // fractures + telemedicine + admin
  const availableForScalable = Math.max(0, budgetAnnual - fixedCost);
  if (availableForScalable <= 0) return null; // cannot fit even fixed costs

  const age = tl._age || 35; // passed through
  const basicLifeRate = getTermLifeBasicRate(age);
  const ptdRate = RISK_CLASS_1.pi;
  const ci32Rate = getCI32Rate(age);

  const basicLifeCost = (tl.basicLifeCoverage / 1000) * basicLifeRate;
  const ptdCost = tl.ptdCoverage > 0 ? (tl.ptdCoverage / 1000) * ptdRate : 0;
  const ci32Cost = tl.ci32Coverage > 0 ? (tl.ci32Coverage / 1000) * ci32Rate : 0;
  const scalableCost = basicLifeCost + ptdCost + ci32Cost;

  if (scalableCost <= 0) return { ...tl, totalAnnual: fixedCost };

  const scaleFactor = Math.min(1, availableForScalable / scalableCost);
  const scaledBasicLife = Math.round(tl.basicLifeCoverage * scaleFactor / 100) * 100;
  const scaledPtd = Math.round(tl.ptdCoverage * scaleFactor / 100) * 100;
  const scaledCi32 = Math.round(tl.ci32Coverage * scaleFactor / 100) * 100;

  const newTotal = (scaledBasicLife/1000)*basicLifeRate + (scaledPtd/1000)*ptdRate + (scaledCi32/1000)*ci32Rate + fixedCost;
  return {
    ...tl,
    basicLifeCoverage: scaledBasicLife,
    ptdCoverage: scaledPtd,
    ci32Coverage: scaledCi32,
    totalAnnual: newTotal,
  };
};

// ── CREDIT GUARD HELPER ──
const calcCreditGuardMonthly = (age, loanAmount, termYears) => {
  if (!loanAmount || loanAmount <= 0 || age < 18 || age + termYears > 70) return null;
  const ageKeys = Object.keys(CG_BASIC_RATES).map(Number).sort((a,b)=>a-b);
  let selAge = null;
  for (const k of ageKeys) { if (k <= age) selAge = k; else break; }
  if (!selAge) return null;

  const termOptions = [5, 10, 15, 20, 25, 30];
  const availableTerms = termOptions.filter(t => CG_BASIC_RATES[selAge]?.[t] !== undefined && CG_BASIC_RATES[selAge]?.[t] !== null);
  if (!availableTerms.length) return null;

  // Find nearest available term
  let selTerm = availableTerms[0];
  for (const t of availableTerms) { if (t <= termYears) selTerm = t; }
  if (!selTerm || !CG_BASIC_RATES[selAge]?.[selTerm]) return null;

  const ratePerHundredK = CG_BASIC_RATES[selAge][selTerm];
  const annualPremium = (loanAmount / 100000) * ratePerHundredK;
  return Math.round((annualPremium / 12) * 100) / 100;
};

// ──────────────────────────────────────────────────────────
// FINANCIAL MATH
// ──────────────────────────────────────────────────────────
const calcMonthlyPayment = (principal, annualRatePct, years) => {
  const r = annualRatePct / 12 / 100;
  const n = years * 12;
  if (r === 0) return principal / n;
  return principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
};

// PV of annuity-due for PTD: PV(4%/12, months) * (net_income - state_disability) * 1.2
const pvAnnuity = (monthlyRate, months) => {
  if (monthlyRate === 0) return months;
  return (1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate;
};

// State disability benefit (PLAN_CONSTITUTION product_rules.state_disability_benefit)
const statDisabilityBenefit = (grossIncome) => Math.min(grossIncome * 0.50, 1055.82);

// Gross from net (PLAN_CONSTITUTION product_rules.investment_goals_algorithm state_pension)
const netToGross = (net) => {
  if (net <= 1638.60) return net * 1.28869;
  return net / 0.9 + 291;
};

// Expected state pension
const calcStatePension = (gross) => Math.min(Math.max(gross * 0.45, 347), 1739);

// ──────────────────────────────────────────────────────────
// UL PREMIUM BUILDER (PLAN_CONSTITUTION premium_calculation)
// annualSavings: known. Returns total annual premium.
// ──────────────────────────────────────────────────────────
const buildULAnnualPremium = (annualSavings, age, netIncome, grossIncome, includeWaiver = true) => {
  const disability = statDisabilityBenefit(grossIncome);
  const months = (65 - age) * 12;

  // PTD coverage
  const ptdCoverage = Math.ceil(pvAnnuity(0.04 / 12, months) * Math.max(0, netIncome - disability) * 1.2 / 100) * 100;

  // CI40 coverage
  const ci40Coverage = Math.ceil(Math.max(0, netIncome - disability) * 24 / 100) * 100;

  // Fractures 1500 fixed
  const fractures = 1500;

  // Compute coverage costs
  let coverageCost = 0;
  if (ptdCoverage > 0) coverageCost += (ptdCoverage / 1000) * RISK_CLASS_1.pi;
  coverageCost += (fractures / 1000) * RISK_CLASS_1.fracturesAndBurns;
  const coeff = CI40_COEFF[age] || CI40_COEFF[65];
  if (ci40Coverage > 0 && coeff) coverageCost += ci40Coverage / coeff;
  coverageCost += 15; // telemedicine

  // 40% rule: coverageCost / (coverageCost + annualSavings) <= 0.40
  // → max coverage cost = 0.40 * (annualSavings + coverageCost) → solve → C_max
  // With waiver: using approximation without waiver first, then apply
  // C_max = 0.40 * (budget - 15) / (1 + waiverRate) — used later in sizing
  // Here we just compute total
  let waiverCost = 0;
  if (includeWaiver && age <= 55) {
    waiverCost = (annualSavings + coverageCost) * 0.0438;
  }

  const totalAnnual = annualSavings + coverageCost + waiverCost + 15; // +15 admin fee

  return {
    totalAnnual,
    annualSavings,
    coverageCost,
    waiverCost,
    ptdCoverage,
    ci40Coverage,
    fractures,
    integratedLife: Math.min(annualSavings * getULLifeMultiplier(age), 15000),
    premiumBonus: getPremiumBonus(annualSavings),
    avCharge: getAVCharge(annualSavings),
  };
};

// ──────────────────────────────────────────────────────────
// UL PROJECTION (from annualSavings, using MetLife exact model)
// ──────────────────────────────────────────────────────────
const projectUL = (annualSavings, yearsToRetirement, assumedReturn = 0.08) => {
  const bonus = getPremiumBonus(annualSavings);
  const avCharge = getAVCharge(annualSavings);
  const effectiveContrib = annualSavings * (1 + bonus);
  const netReturn = assumedReturn - avCharge;
  let balance = 0;
  for (let y = 0; y < yearsToRetirement; y++) {
    balance = (balance + effectiveContrib) * (1 + netReturn);
  }
  return Math.round(balance);
};

// ──────────────────────────────────────────────────────────
// FV helper
// ──────────────────────────────────────────────────────────
const fvLumpSum = (pv, annualRate, years) => pv * Math.pow(1 + annualRate, years);
const fvAnnuity = (monthlyContrib, annualRate, years) => {
  const r = annualRate / 12;
  const n = years * 12;
  if (r === 0) return monthlyContrib * n;
  return monthlyContrib * (Math.pow(1 + r, n) - 1) / r;
};

// ──────────────────────────────────────────────────────────
// BINARY SEARCH for annualSavings
// ──────────────────────────────────────────────────────────
const findAnnualSavingsForTarget = (target, yearsToRetirement, budgetAnnual, minSavings = 300) => {
  if (target <= 0) return 0;
  let lo = minSavings, hi = budgetAnnual;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (projectUL(mid, yearsToRetirement) >= target) hi = mid;
    else lo = mid;
  }
  return hi > budgetAnnual ? null : hi; // null = cannot reach target within budget
};

// ──────────────────────────────────────────────────────────
// MAIN HANDLER
// ──────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { analysis_id } = await req.json();
    if (!analysis_id) return Response.json({ error: 'analysis_id е задължително' }, { status: 400 });

    const analysisRows = await base44.asServiceRole.entities.FinancialAnalysisSubmission.filter({ id: analysis_id });
    if (!analysisRows?.length) return Response.json({ error: 'Анализът не е намерен' }, { status: 404 });
    const a = analysisRows[0];

    const includePartner = a.include_partner || false;

    // ── ДОХОДИ ──
    const clientNet   = a.client_net_income || 0;
    const clientGross = a.client_gross_income || 0;
    const partnerNet  = includePartner ? (a.partner_net_income || 0) : 0;
    const partnerGross= includePartner ? (a.partner_gross_income || 0) : 0;
    const totalIncome = clientNet + partnerNet
      + (a.client_other_monthly_income || 0) + (a.client_13th_salary || 0) / 12 + (a.client_other_annual_income || 0) / 12
      + (includePartner ? (a.partner_other_monthly_income || 0) : 0)
      + (includePartner ? (a.partner_13th_salary || 0) / 12 : 0)
      + (includePartner ? (a.partner_other_annual_income || 0) / 12 : 0);

    // ── РАЗХОДИ ──
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

    // ── OLD MONTHLY BALANCE (PLAN_CONSTITUTION strategic_allocation.plan_budget_ceilings) ──
    const oldMonthlyBalance = totalIncome - variableExpenses - monthlyInvestments - currentLiabilitiesMonthly - currentInsuranceMonthly;

    // ── ОПТИМИЗАЦИЯ (simplified — кредити и застраховки) ──
    // За целите на таваните: предполагаме оптимизация = 0 промяна (консервативен подход)
    // Пълната оптимизация е в отделния слайд на презентацията
    const monthlyBalanceAfterOpt = oldMonthlyBalance;

    // ── РЕЗЕРВ ──
    const existingLiquid =
      (a.asset_checking_account||0)+(a.asset_short_term_savings||0)+(a.asset_medium_term_savings||0)+
      (includePartner?(a.partner_checking_account||0):0)+(includePartner?(a.partner_savings_book||0):0)+
      (includePartner?(a.partner_term_deposit||0):0)+
      (a.client_cash||0)+(includePartner?(a.partner_cash||0):0);

    const targetReserve = 6 * (variableExpenses + currentLiabilitiesMonthly);
    const reserveAlreadyBuilt = existingLiquid >= targetReserve;

    // ── ТАВАНИ НА ПЛАНА (PLAN_CONSTITUTION plan_budget_ceilings) ──
    let ceiling1, ceiling2;
    if (reserveAlreadyBuilt) {
      // Режим Б
      ceiling1 = totalIncome * 2.0 / 12;
      ceiling2 = monthlyBalanceAfterOpt * 0.66;
    } else {
      // Режим А
      ceiling1 = totalIncome * 1.5 / 12;
      ceiling2 = monthlyBalanceAfterOpt * 0.40;
    }
    const maxMonthlyBudget = Math.min(ceiling1, ceiling2);
    const budgetAnnual = maxMonthlyBudget * 12;

    // ── ВЪЗРАСТИ И ХОРИЗОНТИ ──
    const cAge = a.client_age || 35;
    const pAge = includePartner ? (a.partner_age || 35) : 0;
    const cRetAge = a.client_retirement_age || 65;
    const pRetAge = includePartner ? (a.partner_retirement_age || 65) : 65;
    const cYears = Math.max(0, Math.min(cRetAge, 65) - cAge);
    const pYears = includePartner ? Math.max(0, Math.min(pRetAge, 65) - pAge) : 0;

    // ── АКТИВИ ЗА ПРИСПАДАНЕ ОТ КОРПУС (PLAN_CONSTITUTION existing_assets_deduction) ──
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

    // ── ПЕНСИОНЕН КОРПУС (PLAN_CONSTITUTION investment_goals_algorithm pension) ──
    const calcCorpus = (netInc, grossInc, yearsToRet, desiredRetAge) => {
      const monthlyConsumption = variableExpenses; // домакинство — само веднъж
      const g = 0.03 / 12;
      const r = 0.04 / 12;
      const stPension = desiredRetAge < 65 ? 67 : calcStatePension(grossInc > 0 ? grossInc : netToGross(netInc));
      const futureConsumption = monthlyConsumption * Math.pow(1 + g, yearsToRet * 12);
      const pensionGap = Math.max(0, futureConsumption - stPension);
      const corpus = pensionGap / (r - g) * (1 - Math.pow((1 + g) / (1 + r), 240));
      return Math.max(0, corpus);
    };

    // При двойка: corpus се изчислява поотделно, сумира се, после се приспадат активи, после 50/50
    const corpusClient  = calcCorpus(clientNet,  clientGross,  cYears, cRetAge);
    const corpusPartner = includePartner ? calcCorpus(partnerNet, partnerGross, pYears, pRetAge) : 0;
    const totalCorpus = corpusClient + corpusPartner;
    const corpusNet = Math.max(0, totalCorpus - fvFinancialAssets - fvProperties - fvVolPension);
    const targetPerPerson = includePartner ? corpusNet / 2 : corpusNet;

    // ── НАМИРАНЕ НА UL ВНОСКИ (binary search) ──
    // client UL
    let cAnnualSavings = null;
    if (cYears > 0 && budgetAnnual >= 300) {
      cAnnualSavings = findAnnualSavingsForTarget(targetPerPerson, cYears, budgetAnnual);
      if (cAnnualSavings === null) cAnnualSavings = budgetAnnual; // shortfall — use max
    }
    // partner UL (allocated from remaining budget after client)
    let pAnnualSavings = null;
    if (includePartner && pYears > 0 && partnerNet > 0) {
      // Client and partner each get their own policy; budget split equally
      const pBudget = budgetAnnual; // each person gets full budget ceiling (they're separate contracts)
      pAnnualSavings = findAnnualSavingsForTarget(targetPerPerson, pYears, pBudget);
      if (pAnnualSavings === null) pAnnualSavings = pBudget;
    }

    // ── SNAP-TO-THRESHOLD (PLAN_CONSTITUTION snap_to_threshold) ──
    // Алгоритъм В: per-contract snap, всичко или нищо
    const trySnapToThreshold = (cSav, pSav, jSavings, investBudgetAnnual) => {
      const snaps = [];

      // Per-contract snap check
      if (cSav) {
        const next = nextSnapThreshold(cSav);
        if (next && next - cSav <= 0.05 * investBudgetAnnual) snaps.push(next - cSav);
      }
      if (pSav) {
        const next = nextSnapThreshold(pSav);
        if (next && next - pSav <= 0.05 * investBudgetAnnual) snaps.push(next - pSav);
      }
      // Junior per-child snap
      for (const js of jSavings) {
        const next = nextSnapThreshold(js);
        if (next && next - js <= 0.05 * investBudgetAnnual) snaps.push(next - js);
      }

      const totalSnapNeeded = snaps.reduce((a, b) => a + b, 0);
      if (totalSnapNeeded <= investBudgetAnnual) {
        // All or nothing — apply all snaps
        if (cSav) cSav = nextSnapThreshold(cSav) || cSav;
        if (pSav) pSav = nextSnapThreshold(pSav) || pSav;
        jSavings = jSavings.map(js => nextSnapThreshold(js) || js);
      }
      return { cSav, pSav, jSavings };
    };

    // Calculate children needs FIRST (для snap calculation)
    const juniorSavingsByChild = [];
    for (let i = 1; i <= childrenCount; i++) {
      const childBirthdate = a[`child_${i}_birthdate`];
      if (!childBirthdate) continue;
      const childAge = Math.floor((Date.now() - new Date(childBirthdate)) / (365.25 * 24 * 60 * 60 * 1000));
      if (childAge > 11) continue;
      const horizon = 20 - childAge;
      if (horizon <= 0) continue;
      const totalEdGoal = (a.children_education_costs||0) + (a.children_start_life_costs||0) + (a.children_wedding_costs||0);
      const existingEdSavings = a.children_current_savings || 0;
      const gapPerChild = Math.max(0, (totalEdGoal - existingEdSavings) / Math.max(1, childrenCount));

      const findJuniorSavings = (target, budgAnnual) => {
        if (target <= 0) return 1200;
        let lo = 300, hi = budgAnnual;
        for (let iter = 0; iter < 40; iter++) {
          const mid = (lo + hi) / 2;
          const val = projectUL(mid, horizon);
          if (val >= target) hi = mid;
          else lo = mid;
        }
        return Math.max(300, hi);
      };
      const jSav = findJuniorSavings(gapPerChild, budgetAnnual);
      juniorSavingsByChild.push({ childAge, horizon, gapPerChild, juniorSavings: jSav });
    }

    // Apply snap-to-threshold BEFORE allocating budget
    const snapResult = trySnapToThreshold(cAnnualSavings, pAnnualSavings, juniorSavingsByChild.map(j => j.juniorSavings), budgetAnnual);
    cAnnualSavings = snapResult.cSav;
    pAnnualSavings = snapResult.pSav;
    for (let i = 0; i < juniorSavingsByChild.length; i++) {
      juniorSavingsByChild[i].juniorSavings = snapResult.jSavings[i];
    }

    // ── РАЗПРЕДЕЛЕНИЕ НА БЮДЖЕТ: ПРИОРИТЕТ Junior ПЪРВО (PLAN_CONSTITUTION investment_priority_on_shortfall) ──
    let investmentBudgetRemaining = budgetAnnual;
    let juniorBudgetAllocated = 0;
    let ulBudgetAllocated = 0;

    // Стъпка 1: изчисли нужните вноски за ALL целите
    const juniorNeededTotal = juniorSavingsByChild.reduce((s, j) => s + j.juniorSavings, 0);
    const ulNeededTotal = (cAnnualSavings || 0) + (pAnnualSavings || 0);
    const totalInvestmentNeeded = juniorNeededTotal + ulNeededTotal;

    // Стъпка 2: приоритет Junior
    if (totalInvestmentNeeded > investmentBudgetRemaining) {
      // Недостатъчен бюджет — разпределяй пропорционално
      const scaleFactor = investmentBudgetRemaining / totalInvestmentNeeded;
      juniorBudgetAllocated = juniorNeededTotal * scaleFactor;
      ulBudgetAllocated = ulNeededTotal * scaleFactor;

      // Намали Junior и UL пропорционално
      for (let i = 0; i < juniorSavingsByChild.length; i++) {
        juniorSavingsByChild[i].juniorSavings *= scaleFactor;
      }
      if (cAnnualSavings) cAnnualSavings *= scaleFactor;
      if (pAnnualSavings) pAnnualSavings *= scaleFactor;
    } else {
      // Достатъчен бюджет — алокирай точно нужното
      juniorBudgetAllocated = juniorNeededTotal;
      ulBudgetAllocated = ulNeededTotal;
    }
    investmentBudgetRemaining -= (juniorBudgetAllocated + ulBudgetAllocated);

    // ── ПОМОЩНИ ДАННИ ЗА PRODUCT SELECTION ──
    const hasChildUnder18 = (() => {
      for (let i = 1; i <= (a.children_count || 0); i++) {
        const bd = a[`child_${i}_birthdate`];
        if (!bd) continue;
        const childAge = Math.floor((Date.now() - new Date(bd)) / (365.25 * 24 * 60 * 60 * 1000));
        if (childAge < 18) return true;
      }
      return false;
    })();
    const hasMortgage = (a.liability_mortgage_monthly || 0) > 0;
    const totalHouseholdIncome = totalIncome;
    const clientIncomeShare = totalHouseholdIncome > 0 ? clientNet / totalHouseholdIncome : 1;
    const partnerIncomeShare = totalHouseholdIncome > 0 ? partnerNet / totalHouseholdIncome : 0;

    // ── СТЪПКА 1/2/3: UL vs TERM LIFE vs DZI ZAKRILA SELECTION ──
    // Конституция: Step 1 → UL (annualSavings/12 >= 25), Step 2 → Term Life, Step 3 → DZI Zakrila
    const clientUsesUL  = cAnnualSavings && cAnnualSavings / 12 >= 25;
    const partnerUsesUL = pAnnualSavings && pAnnualSavings / 12 >= 25;

    const planProducts = [];
    let totalMonthlyPremium = 0;
    let remainingMonthlyBudget = maxMonthlyBudget;

    const addProduct = (product) => {
      planProducts.push(product);
      totalMonthlyPremium += product.monthly_premium || 0;
      remainingMonthlyBudget -= product.monthly_premium || 0;
    };

    // ── CLIENT MetLife UL ──
    if (cAge < 65 && clientUsesUL && cAnnualSavings >= 300) {
      const ul = buildULAnnualPremium(cAnnualSavings, cAge, clientNet, clientGross, cAge <= 55);
      const monthly = Math.round((ul.totalAnnual / 12) * 100) / 100;
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
        coverage_amount: ul.integratedLife,
        expected_value: projectUL(cAnnualSavings, cYears),
        is_active: true,
        details: {
          annual_savings: cAnnualSavings,
          coverages: {
            integratedLifeCoverage: ul.integratedLife,
            ptdCoverage: ul.ptdCoverage,
            fracturesCoverage: ul.fractures,
            criticalIllness40Coverage: ul.ci40Coverage,
            telemedicine: true,
            premiumWaiver: cAge <= 55,
          },
          premium_bonus: ul.premiumBonus,
          management_fee: ul.avCharge,
          total_invested: Math.round(cAnnualSavings * cYears),
          target_corpus: Math.round(targetPerPerson),
        },
      });
    }

    // ── PARTNER MetLife UL ──
    if (includePartner && pAge < 65 && partnerUsesUL && pAnnualSavings >= 300) {
      const ulP = buildULAnnualPremium(pAnnualSavings, pAge, partnerNet, partnerGross, pAge <= 55);
      const monthlyP = Math.round((ulP.totalAnnual / 12) * 100) / 100;
      addProduct({
        product_type: 'ul_investment',
        provider: 'MetLife',
        product_name: 'MetLife Предимство',
        beneficiary: 'partner2',
        beneficiary_name: `${a.partner_first_name||''} ${a.partner_last_name||''}`.trim(),
        beneficiary_age: pAge,
        term_years: Math.min(80 - pAge, 49),
        strategy: 'dynamic',
        monthly_premium: monthlyP,
        total_premium: monthlyP * 12,
        coverage_amount: ulP.integratedLife,
        expected_value: projectUL(pAnnualSavings, pYears),
        is_active: true,
        details: {
          annual_savings: pAnnualSavings,
          coverages: {
            integratedLifeCoverage: ulP.integratedLife,
            ptdCoverage: ulP.ptdCoverage,
            fracturesCoverage: ulP.fractures,
            criticalIllness40Coverage: ulP.ci40Coverage,
            telemedicine: true,
            premiumWaiver: pAge <= 55,
          },
          premium_bonus: ulP.premiumBonus,
          management_fee: ulP.avCharge,
          total_invested: Math.round(pAnnualSavings * pYears),
          target_corpus: Math.round(targetPerPerson),
        },
      });
    }

    // ── MetLife JUNIOR (деца ≤ 11) — СТЪПКА 1, пропорционално разделяне по нужда ──
    const childrenCount = a.children_count || 0;
    const totalEdGoal = (a.children_education_costs||0) + (a.children_start_life_costs||0) + (a.children_wedding_costs||0);
    const existingEdSavings = a.children_current_savings || 0;

    // Изчисли пропорционално разделяне на Junior по възраст (хоризонт)
    let juniorTotalNeeded = 0;
    const juniorByChild = [];

    for (let i = 1; i <= childrenCount; i++) {
      const childBirthdate = a[`child_${i}_birthdate`];
      if (!childBirthdate) continue;
      const childAge = Math.floor((Date.now() - new Date(childBirthdate)) / (365.25 * 24 * 60 * 60 * 1000));
      if (childAge > 11) continue;
      const horizon = 20 - childAge;
      if (horizon <= 0) continue;

      const childName = a[`child_${i}_name`] || `Дете ${i}`;

      // Всяко дете има различна нужда по възраст (по-малко дете = по-дълъг хоризонт = по-малка вноска)
      // Индивидуална целева сума (не разделена на всички)
      const targetPerChild = (totalEdGoal - existingEdSavings) / Math.max(1, childrenCount);

      const findJuniorSavings = (target, budgAnnual) => {
        if (target <= 0) return 300; // min
        let lo = 300, hi = budgAnnual;
        for (let iter = 0; iter < 40; iter++) {
          const mid = (lo + hi) / 2;
          const val = projectUL(mid, horizon);
          if (val >= target) hi = mid;
          else lo = mid;
        }
        return Math.max(300, hi);
      };

      const jSav = findJuniorSavings(targetPerChild, budgetAnnual);
      juniorByChild.push({ childIdx: i, childAge, childName, horizon, targetPerChild, juniorSavings: jSav });
      juniorTotalNeeded += jSav;
    }

    // Разпредели Junior бюджет (вече определен преди от primoritet)
    if (juniorByChild.length > 0) {
      const scale = juniorBudgetAllocated > 0 ? juniorBudgetAllocated / juniorTotalNeeded : 0;

      for (const child of juniorByChild) {
        let scaledJuniorSavings = Math.max(300, Math.round(child.juniorSavings * scale));

        // Junior coverages (fixed per constitution)
        const jFractures = 750;
        const jProtectionCoef = cAge <= 55 ? 0.0438 : 0;
        const jCoveragesCost = (jFractures / 1000) * RISK_CLASS_1.fracturesAndBurns;
        const jProtection = (scaledJuniorSavings + jCoveragesCost) * jProtectionCoef;
        const jTotalAnnual = scaledJuniorSavings + jCoveragesCost + jProtection + 15;
        const jMonthly = Math.round((jTotalAnnual / 12) * 100) / 100;

        if (jMonthly > 0) {
          addProduct({
            product_type: 'ul_investment',
            provider: 'MetLife',
            product_name: 'MetLife Джуниър',
            beneficiary: `child${child.childIdx}`,
            beneficiary_name: child.childName,
            beneficiary_age: child.childAge,
            term_years: child.horizon,
            strategy: 'dynamic',
            monthly_premium: jMonthly,
            total_premium: jMonthly * 12,
            expected_value: projectUL(scaledJuniorSavings, child.horizon),
            is_active: true,
            details: {
              annual_savings: scaledJuniorSavings,
              target_education_gap: Math.round(child.targetPerChild),
              coverage_scalefactor: scale,
              coverages: {
                fractures: jFractures,
                child_protection_agreement: true,
              },
              premium_bonus: getPremiumBonus(scaledJuniorSavings),
              management_fee: getAVCharge(scaledJuniorSavings),
            },
          });
        }
      }
    }

    // ── СТЪПКА 2: TERM LIFE — за клиент (ако UL не е избран) ──
    if (cAge < 65 && !clientUsesUL) {
      const tlClient = buildTermLifePremium(cAge, clientNet, clientGross, hasChildUnder18, hasMortgage, includePartner, clientIncomeShare > 0.55);
      tlClient._age = cAge;
      const tlClientBudget = remainingMonthlyBudget * 12;

      let tlFinal = tlClient;
      if (tlClient.totalAnnual > tlClientBudget) {
        tlFinal = scaleTermLifeToFit(tlClient, tlClientBudget);
      }

      if (tlFinal && tlFinal.totalAnnual <= tlClientBudget && tlFinal.totalAnnual > 0) {
        const monthly = Math.round((tlFinal.totalAnnual / 12) * 100) / 100;
        addProduct({
          product_type: 'term_life',
          provider: 'MetLife',
          product_name: 'MetLife Срочен Живот',
          beneficiary: 'partner1',
          beneficiary_name: `${a.client_first_name||''} ${a.client_last_name||''}`.trim(),
          beneficiary_age: cAge,
          term_years: 5,
          monthly_premium: monthly,
          total_premium: monthly * 12,
          coverage_amount: tlFinal.basicLifeCoverage,
          is_active: true,
          details: {
            coverages: {
              basicLifeCoverage: tlFinal.basicLifeCoverage,
              ptdCoverage: tlFinal.ptdCoverage,
              ci32Coverage: tlFinal.ci32Coverage,
              fracturesCoverage: 1500,
              telemedicine: true,
            },
          },
        });
      } else if (cAge >= DZI_ZAKRILA_MIN_AGE && cAge <= DZI_ZAKRILA_MAX_AGE && remainingMonthlyBudget >= DZI_ZAKRILA_PLATINUM_MONTHLY) {
        // ── СТЪПКА 3: DZI ZAKRILA PLATINUM fallback ──
        addProduct({
          product_type: 'personal_accident',
          provider: 'ДЗИ',
          product_name: 'ДЗИ Закрила — Платинен пакет',
          beneficiary: 'partner1',
          beneficiary_name: `${a.client_first_name||''} ${a.client_last_name||''}`.trim(),
          beneficiary_age: cAge,
          monthly_premium: DZI_ZAKRILA_PLATINUM_MONTHLY,
          total_premium: DZI_ZAKRILA_PLATINUM_MONTHLY * 12,
          coverage_amount: 50000,
          is_active: true,
          details: {
            plan: 'Platinum',
            note: 'Резервен продукт — бюджетът не позволява MetLife',
            coverages: {
              death_accident: 50000, death_rta: 75000,
              disability_accident: 50000, disability_rta: 75000,
              fractures_burns: 20000, hospital_daily: 100,
            },
          },
        });
      }
    }

    // ── СТЪПКА 2: TERM LIFE — за партньор (ако UL не е избран) ──
    if (includePartner && pAge < 65 && !partnerUsesUL) {
      const tlPartner = buildTermLifePremium(pAge, partnerNet, partnerGross, hasChildUnder18, hasMortgage, true, partnerIncomeShare > 0.55);
      tlPartner._age = pAge;
      const tlPartnerBudget = remainingMonthlyBudget * 12;

      let tlPFinal = tlPartner;
      if (tlPartner.totalAnnual > tlPartnerBudget) {
        tlPFinal = scaleTermLifeToFit(tlPartner, tlPartnerBudget);
      }

      if (tlPFinal && tlPFinal.totalAnnual <= tlPartnerBudget && tlPFinal.totalAnnual > 0) {
        const monthlyP = Math.round((tlPFinal.totalAnnual / 12) * 100) / 100;
        addProduct({
          product_type: 'term_life',
          provider: 'MetLife',
          product_name: 'MetLife Срочен Живот',
          beneficiary: 'partner2',
          beneficiary_name: `${a.partner_first_name||''} ${a.partner_last_name||''}`.trim(),
          beneficiary_age: pAge,
          term_years: 5,
          monthly_premium: monthlyP,
          total_premium: monthlyP * 12,
          coverage_amount: tlPFinal.basicLifeCoverage,
          is_active: true,
          details: {
            coverages: {
              basicLifeCoverage: tlPFinal.basicLifeCoverage,
              ptdCoverage: tlPFinal.ptdCoverage,
              ci32Coverage: tlPFinal.ci32Coverage,
              fracturesCoverage: 1500,
              telemedicine: true,
            },
          },
        });
      } else if (pAge >= DZI_ZAKRILA_MIN_AGE && pAge <= DZI_ZAKRILA_MAX_AGE && remainingMonthlyBudget >= DZI_ZAKRILA_PLATINUM_MONTHLY) {
        // ── СТЪПКА 3: DZI ZAKRILA PLATINUM fallback за партньор ──
        addProduct({
          product_type: 'personal_accident',
          provider: 'ДЗИ',
          product_name: 'ДЗИ Закрила — Платинен пакет',
          beneficiary: 'partner2',
          beneficiary_name: `${a.partner_first_name||''} ${a.partner_last_name||''}`.trim(),
          beneficiary_age: pAge,
          monthly_premium: DZI_ZAKRILA_PLATINUM_MONTHLY,
          total_premium: DZI_ZAKRILA_PLATINUM_MONTHLY * 12,
          coverage_amount: 50000,
          is_active: true,
          details: {
            plan: 'Platinum',
            note: 'Резервен продукт — бюджетът не позволява MetLife',
            coverages: {
              death_accident: 50000, death_rta: 75000,
              disability_accident: 50000, disability_rta: 75000,
              fractures_burns: 20000, hospital_daily: 100,
            },
          },
        });
      }
    }

    // ── МЕТЛАЙФ CREDIT GUARD — при ипотека/рефинансирани кредити ──
    // Конституция правило 1.1: при оптимизация на ипотека → Credit Guard върху рефинансираната сума
    // Тъй като оптимизацията се прави в презентацията (не тук), добавяме Credit Guard върху съществуващата ипотека
    const mortgageBalance = a.liability_mortgage_remaining || 0;
    const mortgageTermYears = a.liability_mortgage_remaining_months ? Math.ceil(a.liability_mortgage_remaining_months / 12) : 20;
    if (mortgageBalance >= 10000 && hasMortgage && cAge < 65) {
      const cgTerm = Math.min(mortgageTermYears, 70 - cAge, 30);
      const cgMonthly = calcCreditGuardMonthly(cAge, mortgageBalance, cgTerm);
      if (cgMonthly && cgMonthly > 0 && remainingMonthlyBudget >= cgMonthly) {
        addProduct({
          product_type: 'term_life',
          provider: 'MetLife',
          product_name: 'MetLife Credit Guard — Основен пакет',
          beneficiary: 'partner1',
          beneficiary_name: `${a.client_first_name||''} ${a.client_last_name||''}`.trim(),
          beneficiary_age: cAge,
          term_years: cgTerm,
          monthly_premium: cgMonthly,
          total_premium: cgMonthly * 12,
          coverage_amount: mortgageBalance,
          is_active: true,
          details: {
            note: 'Защита на ипотечния кредит',
            loan_balance: mortgageBalance,
            loan_term_years: cgTerm,
            package: 'Основен',
          },
        });
      }
    }

    // ── СТЪПКА 2: УНИКА (constitution package_products.uniqa_zdrave_i_tsennost) ──
    // Client (max age 64)
    const uniqaMonthlyClient = getUniqaMonthly(cAge);
    if (uniqaMonthlyClient !== null && cAge <= 64 && remainingMonthlyBudget >= uniqaMonthlyClient) {
      addProduct({
        product_type: 'health_insurance',
        provider: 'УНИКА',
        product_name: 'Здраве и Ценност Селект — План Европа',
        beneficiary: 'partner1',
        beneficiary_name: `${a.client_first_name||''} ${a.client_last_name||''}`.trim(),
        beneficiary_age: cAge,
        monthly_premium: uniqaMonthlyClient,
        total_premium: uniqaMonthlyClient * 12,
        coverage_amount: 2242300,
        is_active: true,
        details: { plan: 'Europa', note: 'Критични заболявания — не замества от работодателска застраховка' },
      });
    }

    // Partner Uniqa (if present and ≤ 64)
    if (includePartner) {
      const uniqaMonthlyPartner = getUniqaMonthly(pAge);
      if (uniqaMonthlyPartner !== null && pAge <= 64 && remainingMonthlyBudget >= uniqaMonthlyPartner) {
        addProduct({
          product_type: 'health_insurance',
          provider: 'УНИКА',
          product_name: 'Здраве и Ценност Селект — План Европа',
          beneficiary: 'partner2',
          beneficiary_name: `${a.partner_first_name||''} ${a.partner_last_name||''}`.trim(),
          beneficiary_age: pAge,
          monthly_premium: uniqaMonthlyPartner,
          total_premium: uniqaMonthlyPartner * 12,
          coverage_amount: 2242300,
          is_active: true,
          details: { plan: 'Europa', note: 'Критични заболявания' },
        });
      }
    }

    // Children Uniqa — ВСИЧКО ИЛИ НИЩО (PLAN_CONSTITUTION rule_v96 uniqa_dzenali_inclusion)
    const childrenUniqaCosts = [];
    for (let i = 1; i <= childrenCount; i++) {
      const childBirthdate = a[`child_${i}_birthdate`];
      if (!childBirthdate) continue;
      const childAge = Math.floor((Date.now() - new Date(childBirthdate)) / (365.25 * 24 * 60 * 60 * 1000));
      if (childAge > 64) continue;
      const uniqaChild = getUniqaMonthly(childAge);
      if (uniqaChild !== null) childrenUniqaCosts.push({ childIdx: i, childAge, uniqaChild, childName: a[`child_${i}_name`] || `Дете ${i}` });
    }
    const totalChildrenUniqaCost = childrenUniqaCosts.reduce((s, c) => s + c.uniqaChild, 0);

    if (totalChildrenUniqaCost > 0 && remainingMonthlyBudget >= totalChildrenUniqaCost) {
      // Достатъчен бюджет за ВСИЧКИ деца → добавя ВСИЧКИ
      for (const child of childrenUniqaCosts) {
        addProduct({
          product_type: 'health_insurance',
          provider: 'УНИКА',
          product_name: 'Здраве и Ценност Селект — План Европа',
          beneficiary: `child${child.childIdx}`,
          beneficiary_name: child.childName,
          beneficiary_age: child.childAge,
          monthly_premium: child.uniqaChild,
          total_premium: child.uniqaChild * 12,
          is_active: true,
          details: { plan: 'Europa' },
        });
      }
    }
    // Ако няма достатъчно за ВСИЧКИ → НИТО ЕДИН не се добавя

    // ── СТЪПКА 3: ДЖЕНЕРАЛИ BASIC (constitution package_products.generali_health_basic) ──
    // Only for persons WITHOUT employer health insurance; flat rate; all or nothing
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
          details: { plan: 'Basic', note: 'Без работодателска здравна застраховка' },
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
          details: { plan: 'Basic', note: 'Без работодателска здравна застраховка' },
        });
      }
    }

    // ── II СТЪЛБ: СМЯНА КЪМ ОББ УПФ (constitution pillar_2_fund_switch) ──
    const OBB_FUND = 'УПФ „ОББ" ЕАД';
    const clientNeedsPillar2Switch = a.client_pillar_2 && a.client_pension_fund !== OBB_FUND;
    const partnerNeedsPillar2Switch = includePartner && a.partner_pillar_2 && a.partner_pension_fund !== OBB_FUND;

    if (clientNeedsPillar2Switch) {
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
        details: {
          note: 'Еднократна административна процедура — без допълнителни разходи',
          from_fund: a.client_pension_fund,
          needs_verification: a.client_pension_fund === 'Да се провери допълнително',
        },
      });
    }
    if (partnerNeedsPillar2Switch) {
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
        details: {
          note: 'Еднократна административна процедура — без допълнителни разходи',
          from_fund: a.partner_pension_fund,
          needs_verification: a.partner_pension_fund === 'Да се провери допълнително',
        },
      });
    }

    // ── ОБОБЩЕНИЕ ──
    const clientLaborCapital = (() => {
      let lc = 0, inc = clientNet * 12;
      for (let y = 0; y < cYears; y++) { lc += inc; inc *= 1.03; }
      return lc;
    })();
    const partnerLaborCapital = (() => {
      if (!includePartner) return 0;
      let lc = 0, inc = partnerNet * 12;
      for (let y = 0; y < pYears; y++) { lc += inc; inc *= 1.03; }
      return lc;
    })();
    const taxReliefAnnual = planProducts.filter(p => p.monthly_premium > 0)
      .reduce((s, p) => s + (p.total_premium || 0), 0) * 0.10;

    // ── ЗАПИС В БД ──
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
      protection_need_p1: Math.round(clientLaborCapital * 0.5),
      protection_need_p2: includePartner ? Math.round(partnerLaborCapital * 0.5) : 0,
      reserve_need: targetReserve,
      pension_gap_p1: Math.round(targetPerPerson),
      pension_gap_p2: includePartner ? Math.round(targetPerPerson) : 0,
      products: planProducts,
      total_monthly_premium: totalMonthlyPremium,
      total_coverage: planProducts.reduce((s, p) => s + (p.coverage_amount || 0), 0),
      total_expected_value: planProducts.reduce((s, p) => s + (p.expected_value || 0), 0),
      notes: JSON.stringify({
        version: '2.0',
        constitution_based: true,
        ceilings: { ceiling1: Math.round(ceiling1), ceiling2: Math.round(ceiling2), maxMonthlyBudget: Math.round(maxMonthlyBudget) },
        reserve_mode: reserveAlreadyBuilt ? 'B' : 'A',
        total_corpus: Math.round(totalCorpus),
        corpus_net: Math.round(corpusNet),
        target_per_person: Math.round(targetPerPerson),
        fv_assets: Math.round(fvFinancialAssets + fvProperties + fvVolPension),
      }),
    };

    const savedPlan = await base44.asServiceRole.entities.FinancialPlan.create(financialPlan);

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
        ai_recommendation_reason: 'Генериран по PLAN_RULES v2.0 (PlanRulesConstitution)',
      });
    }

    return Response.json({
      success: true,
      plan_id: savedPlan.id,
      summary: {
        total_monthly_premium: totalMonthlyPremium,
        total_products: planProducts.length,
        recommended_frequency: 'annual',
        labor_capital_total: Math.round(clientLaborCapital + partnerLaborCapital),
        tax_relief_annual: Math.round(taxReliefAnnual),
        corpus_net: Math.round(corpusNet),
        target_per_person: Math.round(targetPerPerson),
        reserve_mode: reserveAlreadyBuilt ? 'B' : 'A',
        budget_ceiling_monthly: Math.round(maxMonthlyBudget),
      },
      products: planProducts,
      optimizations: [],
    });

  } catch (error) {
    console.error('generateFinancialPlan error:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});