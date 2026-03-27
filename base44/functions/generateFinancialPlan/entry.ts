import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// ============================================================
// generateFinancialPlan — v3.0
//
// Използва ТОЧНО СЪЩИТЕ тарифи и формули като ProductConfigDemo калкулаторите.
// Всички суми са в EUR (BGN е заменен с EUR от 01.01.2026).
// ============================================================

// ──────────────────────────────────────────────────────────
// ТАРИФИ — от FinancialPlanConstants (ТОЧНИ копия)
// ──────────────────────────────────────────────────────────

// TERM_LIFE_BASIC_RATES — тарифа на 1000€ покритие по възраст и срок
const TERM_LIFE_BASIC_RATES = {
  15:{5:3.65,10:3.6,15:3.69,20:3.66,25:3.85,30:4.19},
  16:{5:3.74,10:3.66,15:3.75,20:3.73,25:3.95,30:4.34},
  17:{5:3.82,10:3.73,15:3.79,20:3.8,25:4.05,30:4.5},
  18:{5:3.91,10:3.78,15:3.85,20:3.87,25:4.15,30:4.68},
  19:{5:3.96,10:3.82,15:3.9,20:3.95,25:4.27,30:4.88},
  20:{5:4,10:3.84,15:3.94,20:4.02,25:4.41,30:5.07},
  21:{5:4.04,10:3.87,15:3.99,20:4.12,25:4.57,30:5.3},
  22:{5:4.09,10:3.9,15:4.05,20:4.22,25:4.75,30:5.55},
  23:{5:4.1,10:3.94,15:4.13,20:4.33,25:4.95,30:5.82},
  24:{5:4.13,10:3.99,15:4.2,20:4.47,25:5.18,30:6.13},
  25:{5:4.14,10:4.03,15:4.29,20:4.63,25:5.4,30:6.46},
  26:{5:4.15,10:4.09,15:4.41,20:4.83,25:5.68,30:6.82},
  27:{5:4.16,10:4.16,15:4.52,20:5.04,25:5.98,30:7.22},
  28:{5:4.22,10:4.27,15:4.67,20:5.3,25:6.32,30:7.64},
  29:{5:4.3,10:4.37,15:4.84,20:5.59,25:6.69,30:8.13},
  30:{5:4.38,10:4.5,15:5.06,20:5.88,25:7.11,30:8.66},
  31:{5:4.49,10:4.67,15:5.32,20:6.23,25:7.54,30:9.22},
  32:{5:4.61,10:4.84,15:5.6,20:6.61,25:8.04,30:9.81},
  33:{5:4.77,10:5.04,15:5.93,20:7.03,25:8.56,30:10.45},
  34:{5:4.9,10:5.26,15:6.29,20:7.5,25:9.15,30:11.12},
  35:{5:5.08,10:5.56,15:6.65,20:8.01,25:9.8,30:11.86},
  36:{5:5.32,10:5.9,15:7.09,20:8.55,25:10.47,30:12.6},
  37:{5:5.55,10:6.27,15:7.56,20:9.16,25:11.18,30:13.45},
  38:{5:5.78,10:6.7,15:8.07,20:9.79,25:11.95,30:14.31},
  39:{5:6.11,10:7.18,15:8.65,20:10.52,25:12.77,30:15.26},
  40:{5:6.55,10:7.64,15:9.28,20:11.31,25:13.66,30:16.26},
  41:{5:6.97,10:8.19,15:9.92,20:12.12,25:14.55,30:17.33},
  42:{5:7.51,10:8.8,15:10.67,20:12.99,25:15.56,30:18.49},
  43:{5:8.16,10:9.47,15:11.44,20:13.94,25:16.62,30:19.73},
  44:{5:8.79,10:10.2,15:12.32,20:14.92,25:17.75,30:21.05},
  45:{5:9.3,10:10.95,15:13.24,20:15.97,25:18.92,30:22.45},
  46:{5:9.99,10:11.71,15:14.19,20:17.02,25:20.19,30:23.98},
  47:{5:10.68,10:12.6,15:15.18,20:18.21,25:21.56,30:25.52},
  48:{5:11.38,10:13.45,15:16.24,20:19.42,25:23,30:27.15},
  49:{5:12.22,10:14.48,15:17.35,20:20.74,25:24.56,30:28.9},
  50:{5:13.24,10:15.65,15:18.61,20:22.16,25:26.26,30:30.8},
  51:{5:14.1,10:16.77,15:19.81,20:23.66,25:28.08,30:null},
  52:{5:15.22,10:17.95,15:21.2,20:25.29,25:29.95,30:null},
  53:{5:16.24,10:19.24,15:22.61,20:27.04,25:31.92,30:null},
  54:{5:17.5,10:20.53,15:24.13,20:28.9,25:34.04,30:null},
  55:{5:18.86,10:21.97,15:25.73,20:30.9,25:36.32,30:null},
  56:{5:20.29,10:23.4,15:27.51,20:33.14,25:null,30:null},
  57:{5:21.57,10:25,15:29.38,20:35.36,25:null,30:null},
  58:{5:23.19,10:26.69,15:31.46,20:37.79,25:null,30:null},
  59:{5:24.55,10:28.43,15:33.6,20:40.35,25:null,30:null},
  60:{5:26.09,10:30.22,15:35.93,20:43.12,25:null,30:null},
  61:{5:27.57,10:32.28,15:38.57,20:null,25:null,30:null},
  62:{5:29.57,10:34.57,15:41.28,20:null,25:null,30:null},
  63:{5:31.39,10:37.02,15:44.16,20:null,25:null,30:null},
  64:{5:33.6,10:39.76,15:47.37,20:null,25:null,30:null},
  65:{5:35.75,10:42.71,15:50.86,20:null,25:null,30:null},
};

// METLIFE_PA_CRITICAL_ILLNESS_32_RATES — тарифа на 1000€ по възраст и срок
const CI32_RATES = {
  18:{yr5:1.4,yr10:1.85},19:{yr5:1.4,yr10:1.85},20:{yr5:1.4,yr10:1.85},
  21:{yr5:1.4,yr10:1.85},22:{yr5:1.4,yr10:1.85},23:{yr5:1.4,yr10:1.85},
  24:{yr5:1.4,yr10:1.85},25:{yr5:1.4,yr10:1.85},
  26:{yr5:2.35,yr10:3.19},27:{yr5:2.35,yr10:3.19},28:{yr5:2.35,yr10:3.19},
  29:{yr5:2.35,yr10:3.19},30:{yr5:2.35,yr10:3.19},
  31:{yr5:4.63,yr10:6.23},32:{yr5:4.63,yr10:6.23},33:{yr5:4.63,yr10:6.23},
  34:{yr5:4.63,yr10:6.23},35:{yr5:4.63,yr10:6.23},
  36:{yr5:7.24,yr10:9.57},37:{yr5:7.24,yr10:9.57},38:{yr5:7.24,yr10:9.57},
  39:{yr5:7.24,yr10:9.57},40:{yr5:7.24,yr10:9.57},
  41:{yr5:12.31,yr10:16},42:{yr5:12.31,yr10:16},43:{yr5:12.31,yr10:16},
  44:{yr5:12.31,yr10:16},45:{yr5:12.31,yr10:16},
  46:{yr5:20.45,yr10:25.47},47:{yr5:20.45,yr10:25.47},48:{yr5:20.45,yr10:25.47},
  49:{yr5:20.45,yr10:25.47},50:{yr5:20.45,yr10:25.47},
  51:{yr5:31.79,yr10:38.07},52:{yr5:31.79,yr10:38.07},53:{yr5:31.79,yr10:38.07},
  54:{yr5:31.79,yr10:38.07},55:{yr5:31.79,yr10:38.07},
  56:{yr5:46.34,yr10:null},57:{yr5:46.34,yr10:null},58:{yr5:46.34,yr10:null},
  59:{yr5:46.34,yr10:null},60:{yr5:46.34,yr10:null},
};

// METLIFE_PA_SECURITY_PLUS_COEFFICIENTS — коефициент за 40 тежки заболявания
const CI40_COEFFICIENTS = {
  18:225.733634311512,19:218.818380743982,20:212.314225053079,21:206.185567010309,
  22:200.400801603206,23:194.552529182879,24:188.679245283019,25:182.815356489945,
  26:177.304964539007,27:171.232876712329,28:165.837479270315,29:160.25641025641,
  30:154.798761609907,31:149.253731343284,32:143.884892086331,33:138.504155124654,
  34:133.333333333333,35:128.040973111396,36:122.850122850123,37:117.508813160987,
  38:112.485939257593,39:107.52688172043,40:102.669404517454,41:97.9431929480901,
  42:93.3706816059757,43:88.9679715302491,44:84.7457627118644,45:80.7102502017756,
  46:76.8639508070715,47:73.2064421669107,48:69.6864111498258,49:66.35700066357,
  50:63.0914826498423,51:60.0600600600601,52:57.0776255707763,53:54.2005420054201,
  54:51.2820512820513,55:48.3325277912035,56:46.3177396943029,57:43.917435221783,
  58:41.5800415800416,59:39.1083300743058,60:36.5363536719035,61:36.0750360750361,
  62:35.5998576005696,63:34.9406009783368,64:33.2667997338656,65:31.1720698254364,
};

// METLIFE_PA_RISK_CLASSES (рисков клас 1)
const RISK_CLASS_1 = { pi: 1.5, fracturesAndBurns: 16, accidentalDeath: 1.5 };

// AV Charge от PlanRulesProductTables (точни прагове)
const AV_CHARGE_TABLE = [
  { from: 300,  to: 719,  rate: 0.0200 },
  { from: 720,  to: 959,  rate: 0.0175 },
  { from: 960,  to: 1199, rate: 0.0150 },
  { from: 1200, to: 1499, rate: 0.0125 },
  { from: 1500, to: 2399, rate: 0.0100 },
  { from: 2400, to: 3599, rate: 0.0075 },
  { from: 3600, to: null, rate: 0.0050 },
];

// Premium Bonus от PlanRulesProductTables (точни прагове)
const PREMIUM_BONUS_TABLE = [
  { from: 1200, to: 1799, bonus: 0.01 },
  { from: 1800, to: 2999, bonus: 0.02 },
  { from: 3000, to: 4199, bonus: 0.03 },
  { from: 4200, to: null, bonus: 0.04 },
];

// METLIFE_CREDIT_GUARD_BASIC_RATES — точни от FinancialPlanConstants
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
  56:{5:686,10:759},57:{5:710,10:796},58:{5:784,10:882},
  59:{5:833,10:931},60:{5:918,10:1016},
  61:{5:967},62:{5:1029},63:{5:1102},64:{5:1188},65:{5:1273},
};

// УНИКА тарифи — от UniqaHealthValueConstants (точни)
// Всичко в EUR (от 01.01.2026)
const UNIQA_EUROPA_TARIFFS = {
  '0-17':  { monthly: 6.48,  annual: 74.04  },
  '18-30': { monthly: 12.54, annual: 143.32 },
  '31-40': { monthly: 13.71, annual: 156.64 },
  '41-45': { monthly: 16.48, annual: 188.32 },
  '46-50': { monthly: 20.02, annual: 228.80 },
  '51-55': { monthly: 24.71, annual: 282.36 },
  '56-60': { monthly: 30.50, annual: 348.60 },
  '61-65': { monthly: 37.40, annual: 427.43 },
};

// Дженерали Basic — фиксирана тарифа в EUR (от 01.01.2026, преди: 60 BGN/месец)
const GENERALI_BASIC_MONTHLY_EUR = 60; // EUR (беше BGN, вече EUR)
const GENERALI_BASIC_ANNUAL_EUR = 720;

// ДЗИ Закрила — Платинен пакет (EUR, беше BGN)
const DZI_ZAKRILA_PLATINUM = {
  monthly: 30,  // EUR (беше 30 BGN)
  annual: 360,
  coverages: {
    deathAccident: 50000, deathRTA: 75000,
    disabilityAccident: 50000, disabilityRTA: 75000,
    fracturesAndBurns: 20000, hospitalDaily: 100
  }
};

// METLIFE_PA_CHILD_COVERAGES — фрактури за Junior
const CHILD_FRACTURES_RATE = 33; // per 1000 EUR (от METLIFE_PA_CHILD_COVERAGES.brokenBonesAndBurns)
const CHILD_FRACTURES_AMOUNT = 750; // EUR (конституция: по-висока от двете опции)

// ──────────────────────────────────────────────────────────
// LOOKUP HELPERS (точни — съответстват на FinancialPlanConstants)
// ──────────────────────────────────────────────────────────

const getAVCharge = (annualPremium) => {
  for (const row of AV_CHARGE_TABLE) {
    if (annualPremium >= row.from && (row.to === null || annualPremium <= row.to)) return row.rate;
  }
  return 0.02;
};

const getPremiumBonus = (annualPremium) => {
  for (const row of PREMIUM_BONUS_TABLE) {
    if (annualPremium >= row.from && (row.to === null || annualPremium <= row.to)) return row.bonus;
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
  if (!rates) return CI32_RATES[60].yr5;
  if (termYears >= 10 && rates.yr10) return rates.yr10;
  return rates.yr5;
};

const getCI40Coefficient = (age) => {
  return CI40_COEFFICIENTS[Math.min(Math.max(Math.floor(age), 18), 65)] || 50;
};

const getUniqaMonthly = (age) => {
  if (age > 64) return null;
  if (age <= 17) return UNIQA_EUROPA_TARIFFS['0-17'].monthly;
  if (age <= 30) return UNIQA_EUROPA_TARIFFS['18-30'].monthly;
  if (age <= 40) return UNIQA_EUROPA_TARIFFS['31-40'].monthly;
  if (age <= 45) return UNIQA_EUROPA_TARIFFS['41-45'].monthly;
  if (age <= 50) return UNIQA_EUROPA_TARIFFS['46-50'].monthly;
  if (age <= 55) return UNIQA_EUROPA_TARIFFS['51-55'].monthly;
  if (age <= 60) return UNIQA_EUROPA_TARIFFS['56-60'].monthly;
  if (age <= 65) return UNIQA_EUROPA_TARIFFS['61-65'].monthly;
  return null;
};

const getULLifeMultiplier = (age) => {
  if (age <= 30) return 30;
  if (age <= 35) return 20;
  if (age <= 45) return 15;
  if (age <= 55) return 10;
  return 6;
};

const getCreditGuardMonthly = (age, loanAmount, termYears) => {
  if (!loanAmount || loanAmount <= 0 || age < 18 || age + termYears > 70) return null;
  const ageKeys = Object.keys(CG_BASIC_RATES).map(Number).sort((a,b)=>a-b);
  let selAge = null;
  for (const k of ageKeys) { if (k <= age) selAge = k; else break; }
  if (!selAge) return null;
  const termOptions = [5,10,15,20,25,30].filter(t => CG_BASIC_RATES[selAge]?.[t] !== undefined && CG_BASIC_RATES[selAge]?.[t] !== null);
  if (!termOptions.length) return null;
  let selTerm = termOptions[0];
  for (const t of termOptions) { if (t <= termYears) selTerm = t; }
  const ratePerHundredK = CG_BASIC_RATES[selAge][selTerm];
  if (!ratePerHundredK) return null;
  return Math.round((loanAmount / 100000) * ratePerHundredK / 12 * 100) / 100;
};

const SNAP_THRESHOLDS = [720, 960, 1200, 1500, 1800, 2400, 3000, 3600, 4200];
const nextSnapThreshold = (annual) => SNAP_THRESHOLDS.find(t => t > annual) || null;

// ──────────────────────────────────────────────────────────
// ФИНАНСОВА МАТЕМАТИКА
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
// MORTALITY TABLE — от FinancialPlanConstants (blended 80% male / 20% female)
// ──────────────────────────────────────────────────────────

const MORTALITY_QX = {
  0:{m:10.4667,f:8.3265},1:{m:0.8631,f:0.8105},15:{m:0.4320,f:0.2681},
  16:{m:0.5632,f:0.3168},17:{m:0.6590,f:0.3991},18:{m:0.7820,f:0.4778},
  19:{m:0.9968,f:0.3351},20:{m:0.9754,f:0.3689},21:{m:0.9902,f:0.3905},
  22:{m:1.1783,f:0.3851},23:{m:1.1208,f:0.3416},24:{m:1.2253,f:0.3714},
  25:{m:1.1798,f:0.4777},26:{m:1.2803,f:0.5026},27:{m:1.2603,f:0.2587},
  28:{m:1.2194,f:0.5889},29:{m:1.2426,f:0.5133},30:{m:1.2442,f:0.6015},
  31:{m:1.3015,f:0.6550},32:{m:1.5494,f:0.5586},33:{m:1.6410,f:0.7463},
  34:{m:1.6169,f:0.9297},35:{m:1.8178,f:0.8255},36:{m:1.9444,f:1.0409},
  37:{m:2.3805,f:1.0218},38:{m:2.2935,f:1.2077},39:{m:2.5608,f:1.2746},
  40:{m:3.1639,f:1.2941},41:{m:3.2109,f:1.3436},42:{m:3.6103,f:1.5150},
  43:{m:4.1226,f:1.8807},44:{m:4.9154,f:2.1087},45:{m:5.4322,f:2.4594},
  46:{m:6.0691,f:2.6197},47:{m:7.0983,f:2.9067},48:{m:7.5943,f:2.9493},
  49:{m:7.5754,f:3.4800},50:{m:9.2432,f:3.4757},51:{m:9.8708,f:3.8075},
  52:{m:11.0132,f:4.1138},53:{m:12.1581,f:4.7100},54:{m:13.1207,f:5.4055},
  55:{m:13.7477,f:5.8224},56:{m:16.0129,f:5.8155},57:{m:16.4340,f:6.5164},
  58:{m:19.0146,f:7.2625},59:{m:20.7628,f:7.4624},60:{m:21.6724,f:7.7226},
  61:{m:22.9264,f:8.5540},62:{m:25.2898,f:9.3900},63:{m:26.2972,f:10.5458},
  64:{m:28.9558,f:11.5530},65:{m:29.2752,f:12.1736},66:{m:33.3520,f:14.5268},
  67:{m:34.5356,f:15.8754},68:{m:37.8817,f:17.1907},69:{m:39.6470,f:20.2289},
  70:{m:43.5827,f:22.0645},75:{m:67.1646,f:40.3518},80:{m:99.7261,f:75.4640},
};

const getMonthlyMortality = (age) => {
  const a = Math.min(Math.max(Math.floor(age), 0), 80);
  // Find nearest age in table
  let closest = 0;
  for (const k of Object.keys(MORTALITY_QX).map(Number).sort((a,b)=>a-b)) {
    if (k <= a) closest = k;
  }
  const q = MORTALITY_QX[closest] || MORTALITY_QX[0];
  return (q.m * 0.8 + q.f * 0.2) / 1000 / 12;
};

// ──────────────────────────────────────────────────────────
// UL ПРОЕКЦИЯ — точна месечна симулация (идентична с MetLifeULCalculator)
// Включва: investible premium rate, premium bonus, AV charge, COI, policy fee
// ──────────────────────────────────────────────────────────

const projectUL = (annualSavings, yearsToRetirement, assumedReturn = 0.08, faceAmount = 20000) => {
  if (yearsToRetirement <= 0 || annualSavings <= 0) return 0;

  const premiumBonus = getPremiumBonus(annualSavings);
  const avChargeRate = getAVCharge(annualSavings);
  const monthlyReturn = assumedReturn / 12;
  const policyFeeMonthly = 15 / 12;

  let accountValue = 0;

  for (let year = 1; year <= yearsToRetirement; year++) {
    const currentAge = 33 + year - 1; // placeholder — будем подавать начальный возраст ниже
    const investibleRate = year === 1 ? 0.30 : year === 2 ? 0.60 : 1.00;
    const monthlyPremium = annualSavings / 12;

    for (let month = 1; month <= 12; month++) {
      let investible = monthlyPremium * investibleRate;
      // Bonus only on first payment (month 1, year 1)
      if (year === 1 && month === 1) {
        investible += annualSavings * premiumBonus;
      }
      accountValue += investible;
      accountValue *= (1 + monthlyReturn);
      const avCharge = accountValue * (avChargeRate / 12);
      const coi = accountValue * getMonthlyMortality(currentAge) * (faceAmount / 1000);
      accountValue -= (avCharge + coi + policyFeeMonthly);
      accountValue = Math.max(0, accountValue);
    }
  }
  return Math.round(accountValue);
};

// Версия с правилно начална възраст
const projectULFull = (annualSavings, startAge, yearsToRetirement, assumedReturn = 0.08, faceAmount = 2500) => {
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
      const coi = accountValue * getMonthlyMortality(currentAge) * (faceAmount / 1000);
      accountValue -= (avCharge + coi + policyFeeMonthly);
      accountValue = Math.max(0, accountValue);
    }
  }
  return Math.round(accountValue);
};

// Бинарно търсене за годишна вноска която постига target
const findAnnualSavingsForTarget = (target, startAge, yearsToRetirement, maxBudget, minSavings = 300, faceAmount = 2500) => {
  if (target <= 0) return 0;
  if (yearsToRetirement <= 0) return null;
  let lo = minSavings, hi = maxBudget;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (projectULFull(mid, startAge, yearsToRetirement, 0.08, faceAmount) >= target) hi = mid;
    else lo = mid;
  }
  return hi > maxBudget ? null : Math.max(minSavings, hi);
};

// ──────────────────────────────────────────────────────────
// ИЗЧИСЛЯВАНЕ НА UL ПОКРИТИЯ (от MetLifeULCalculator + конституция)
// ──────────────────────────────────────────────────────────

const calcULCoverages = (age, netIncome, grossIncome) => {
  const disability = statDisabilityBenefit(grossIncome > 0 ? grossIncome : netToGross(netIncome));
  const months = (65 - age) * 12;
  const ptdCoverage = Math.ceil(pvAnnuity(0.04 / 12, months) * Math.max(0, netIncome - disability) * 1.2 / 100) * 100;
  const ci40Coverage = Math.ceil(Math.max(0, netIncome - disability) * 24 / 100) * 100;

  const ptdCost = ptdCoverage > 0 ? (ptdCoverage / 1000) * RISK_CLASS_1.pi : 0;
  const fracturesCost = (1500 / 1000) * RISK_CLASS_1.fracturesAndBurns; // 1500 * 16/1000 = 24€
  const ci40Coef = getCI40Coefficient(age);
  const ci40Cost = ci40Coverage > 0 && ci40Coef > 0 ? ci40Coverage / ci40Coef : 0;
  const telemedicineCost = 15;

  return {
    ptdCoverage, ptdCost,
    fractures: 1500, fracturesCost,
    ci40Coverage, ci40Cost,
    telemedicineCost,
    totalCoveragesCost: ptdCost + fracturesCost + ci40Cost + telemedicineCost,
  };
};

// Изчисляване на UL годишна премия от annualSavings
const buildULAnnualPremium = (annualSavings, age, netIncome, grossIncome, includeWaiver = true) => {
  const cov = calcULCoverages(age, netIncome, grossIncome);
  let totalCoveragesCost = cov.totalCoveragesCost;

  let waiverCost = 0;
  if (includeWaiver && age <= 55) {
    // waiverRate = 0.0438 за рисков клас 1 (от METLIFE_PA_PREMIUM_WAIVER)
    waiverCost = (annualSavings + totalCoveragesCost) * 0.0438;
  }

  const totalAnnual = annualSavings + totalCoveragesCost + waiverCost + 15; // 15€ admin fee
  const integratedLife = 2500; // Стандартно интегрирано покритие — идентично с MetLifeULCalculator

  return {
    totalAnnual,
    annualSavings,
    coveragesCost: totalCoveragesCost,
    waiverCost,
    ptdCoverage: cov.ptdCoverage,
    ci40Coverage: cov.ci40Coverage,
    fractures: cov.fractures,
    integratedLife,
    premiumBonus: getPremiumBonus(annualSavings),
    avCharge: getAVCharge(annualSavings),
  };
};

// ──────────────────────────────────────────────────────────
// ИЗЧИСЛЯВАНЕ НА TERM LIFE ПОКРИТИЯ (от MetLifeTermLifeCalculator + конституция)
// Admin fee = 13€ (НЕ 15€ — различно от UL!)
// ──────────────────────────────────────────────────────────

const buildTermLifePremium = (age, netIncome, grossIncome, hasChildUnder18, hasMortgage, hasPartner, isMainEarner) => {
  const disability = statDisabilityBenefit(grossIncome > 0 ? grossIncome : netToGross(netIncome));
  const months = (65 - age) * 12;

  // Основно покритие живот (5г.)
  const fullCoverageCondition = hasChildUnder18 || hasMortgage || (hasPartner && isMainEarner);
  const basicLifeCoverage = fullCoverageCondition ? Math.max(0, netIncome) * 24 : 3000;

  // ПТН от злополука
  const ptdCoverage = Math.ceil(pvAnnuity(0.04 / 12, months) * Math.max(0, netIncome - disability) * 1.2 / 100) * 100;

  // 32 тежки заболявания (10г.) — НЕ 40!
  const ci32Coverage = Math.ceil(Math.max(0, netIncome - disability) * 24 / 100) * 100;

  // Цени на покритията
  const basicLifeRate = getTermLifeBasicRate(age, 5);
  const basicLifeCost = (basicLifeCoverage / 1000) * basicLifeRate;
  const ptdCost = ptdCoverage > 0 ? (ptdCoverage / 1000) * RISK_CLASS_1.pi : 0;
  const ci32Rate = age < 60 ? getCI32Rate(age, 10) : getCI32Rate(age, 5);
  const ci32Cost = ci32Coverage > 0 && age < 60 ? (ci32Coverage / 1000) * ci32Rate : 0;
  const fracturesCost = (1500 / 1000) * RISK_CLASS_1.fracturesAndBurns; // rate=16, amount=1500
  const telemedicineCost = 15;
  const adminFee = 13; // ⚠️ Term Life = 13€, UL = 15€

  const totalAnnual = basicLifeCost + ptdCost + ci32Cost + fracturesCost + telemedicineCost + adminFee;

  return {
    totalAnnual,
    basicLifeCoverage, basicLifeCost,
    ptdCoverage, ptdCost,
    ci32Coverage, ci32Cost,
    fractures: 1500, fracturesCost,
  };
};

// Мащабиране на Term Life в рамките на бюджет (пропорционално за scalable, fixed остава)
const scaleTermLifeToFit = (tl, age, budgetAnnual) => {
  const adminFee = 13;
  const fixedCost = (1500 / 1000) * RISK_CLASS_1.fracturesAndBurns + 15 + adminFee;
  const availableForScalable = Math.max(0, budgetAnnual - fixedCost);
  if (availableForScalable <= 0) return null;

  const basicRate = getTermLifeBasicRate(age, 5);
  const ci32Rate = age < 60 ? getCI32Rate(age, 10) : getCI32Rate(age, 5);

  const basicCost = (tl.basicLifeCoverage / 1000) * basicRate;
  const ptdCost = tl.ptdCoverage > 0 ? (tl.ptdCoverage / 1000) * RISK_CLASS_1.pi : 0;
  const ci32Cost = tl.ci32Coverage > 0 ? (tl.ci32Coverage / 1000) * ci32Rate : 0;
  const scalableCost = basicCost + ptdCost + ci32Cost;

  if (scalableCost <= 0) return { ...tl, totalAnnual: fixedCost };

  const scaleFactor = Math.min(1, availableForScalable / scalableCost);
  const scaledBasicLife = Math.round(tl.basicLifeCoverage * scaleFactor / 100) * 100;
  const scaledPtd = Math.round(tl.ptdCoverage * scaleFactor / 100) * 100;
  const scaledCi32 = Math.round(tl.ci32Coverage * scaleFactor / 100) * 100;

  const newTotal = (scaledBasicLife/1000)*basicRate + (scaledPtd/1000)*RISK_CLASS_1.pi +
                   (scaledCi32/1000)*ci32Rate + fixedCost;

  return { ...tl, basicLifeCoverage: scaledBasicLife, ptdCoverage: scaledPtd, ci32Coverage: scaledCi32, totalAnnual: newTotal };
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
      + (a.client_other_monthly_income || 0)
      + (a.client_13th_salary || 0) / 12
      + (a.client_other_annual_income || 0) / 12
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

    // ── МЕСЕЧЕН БАЛАНС (стар) ──
    const oldMonthlyBalance = totalIncome - variableExpenses - monthlyInvestments - currentLiabilitiesMonthly - currentInsuranceMonthly;
    const monthlyBalanceAfterOpt = oldMonthlyBalance;

    // ── РЕЗЕРВ ──
    const existingLiquid =
      (a.asset_checking_account||0)+(a.asset_short_term_savings||0)+(a.asset_medium_term_savings||0)+
      (includePartner?(a.partner_checking_account||0):0)+(includePartner?(a.partner_savings_book||0):0)+
      (includePartner?(a.partner_term_deposit||0):0)+
      (a.client_cash||0)+(includePartner?(a.partner_cash||0):0);

    const targetReserve = 6 * (variableExpenses + currentLiabilitiesMonthly);
    const reserveAlreadyBuilt = existingLiquid >= targetReserve;

    // ── ТАВАНИ (РЕЖИМ А/Б) ──
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

    // ── ВЪЗРАСТИ И ХОРИЗОНТИ ──
    const cAge = Math.floor(a.client_age || 35);
    const pAge = includePartner ? Math.floor(a.partner_age || 35) : 0;
    const cRetAge = Math.min(a.client_retirement_age || 65, 65);
    const pRetAge = includePartner ? Math.min(a.partner_retirement_age || 65, 65) : 65;
    const cYears = Math.max(0, cRetAge - cAge);
    const pYears = includePartner ? Math.max(0, pRetAge - pAge) : 0;

    // ── СЪЩЕСТВУВАЩИ АКТИВИ — ПРИСПАДАНЕ ОТ КОРПУС ──
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

    // ── ПЕНСИОНЕН КОРПУС ──
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

    // ── НАМИРАНЕ НА UL ВНОСКИ ──
    const UL_FACE_AMOUNT = 2500; // Стандартно интегрирано покритие — идентично с MetLifeULCalculator
    let cAnnualSavings = 300;
    if (cYears > 0 && budgetAnnual >= 300) {
      const t = findAnnualSavingsForTarget(targetPerPerson, cAge, cYears, budgetAnnual, 300, UL_FACE_AMOUNT);
      if (t !== null) cAnnualSavings = t;
    }
    let pAnnualSavings = null;
    if (includePartner && pYears > 0 && partnerNet > 0) {
      pAnnualSavings = 300;
      const t = findAnnualSavingsForTarget(targetPerPerson, pAge, pYears, budgetAnnual, 300, UL_FACE_AMOUNT);
      if (t !== null) pAnnualSavings = t;
    }

    // ── ДЕЦА — Junior (≤ 11 г.) ──
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
          if (projectUL(mid, horizon) >= target) hi = mid;
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

    // ── SNAP-TO-THRESHOLD (всичко или нищо) ──
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
        // Apply all snaps
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

    // ── БЮДЖЕТНО РАЗПРЕДЕЛЕНИЕ ──
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

    // Оставащ бюджет за защита (след инвестиции)
    const protectionBudgetMonthly = maxMonthlyBudget - ((juniorBudgetAllocated + ulBudgetAllocated) / 12);

    // ── ПОМОЩНИ ДАННИ ──
    const hasChildUnder18 = childrenAges.some(age => Math.floor(age) < 18);
    const hasMortgage = (a.liability_mortgage_monthly || 0) > 0;
    const totalHouseholdIncome = totalIncome;
    const clientIncomeShare = totalHouseholdIncome > 0 ? clientNet / totalHouseholdIncome : 1;
    const partnerIncomeShare = totalHouseholdIncome > 0 ? partnerNet / totalHouseholdIncome : 0;

    // UL условие: annualSavings/12 >= 25€
    const clientUsesUL  = cAnnualSavings && cAnnualSavings / 12 >= 25;
    const partnerUsesUL = pAnnualSavings && pAnnualSavings / 12 >= 25;

    const planProducts = [];
    let totalMonthlyPremium = 0;
    let remainingMonthlyBudget = protectionBudgetMonthly;

    const addProduct = (product) => {
      planProducts.push(product);
      totalMonthlyPremium += product.monthly_premium || 0;
      remainingMonthlyBudget -= product.monthly_premium || 0;
    };

    // ── СТЪПКА 1A: MetLife UL за клиент ──
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
        expected_value: projectULFull(cAnnualSavings, cAge, cYears, 0.08, UL_FACE_AMOUNT),
        is_active: true,
        details: {
          annual_savings: Math.round(cAnnualSavings),
          coverages: {
            integratedLifeCoverage: ul.integratedLife,
            ptdCoverage: ul.ptdCoverage,
            fracturesCoverage: ul.fractures,
            criticalIllness40Coverage: ul.ci40Coverage,
            telemedicine: true,
            premiumWaiver: cAge <= 55,
          },
          premium_bonus_pct: Math.round(ul.premiumBonus * 100),
          av_charge_pct: Math.round(ul.avCharge * 10000) / 100,
          target_corpus: Math.round(targetPerPerson),
          projected_value_at_retirement: projectULFull(cAnnualSavings, cAge, cYears, 0.08, UL_FACE_AMOUNT),
        },
      });
    }

    // ── СТЪПКА 1B: MetLife UL за партньор ──
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
        expected_value: projectULFull(pAnnualSavings, pAge, pYears, 0.08, UL_FACE_AMOUNT),
        is_active: true,
        details: {
          annual_savings: Math.round(pAnnualSavings),
          coverages: {
            integratedLifeCoverage: ulP.integratedLife,
            ptdCoverage: ulP.ptdCoverage,
            fracturesCoverage: ulP.fractures,
            criticalIllness40Coverage: ulP.ci40Coverage,
            telemedicine: true,
            premiumWaiver: pAge <= 55,
          },
          premium_bonus_pct: Math.round(ulP.premiumBonus * 100),
          av_charge_pct: Math.round(ulP.avCharge * 10000) / 100,
          target_corpus: Math.round(targetPerPerson),
          projected_value_at_retirement: projectULFull(pAnnualSavings, pAge, pYears, 0.08, UL_FACE_AMOUNT),
        },
      });
    }

    // ── СТЪПКА 1C: MetLife Junior (деца ≤ 11) ──
    if (juniorSavingsByChild.length > 0) {
      const juniorTotalNeeded = juniorSavingsByChild.reduce((s, j) => s + j.juniorSavings, 0);
      const scale = juniorBudgetAllocated > 0 && juniorTotalNeeded > 0 ? juniorBudgetAllocated / juniorTotalNeeded : 1;

      for (const child of juniorSavingsByChild) {
        const scaledSavings = Math.max(300, Math.round(child.juniorSavings * scale));

        // Junior покрития: фрактури 750€ по ТАРИФА 33/1000 (METLIFE_PA_CHILD_COVERAGES)
        const jFracturesCost = (CHILD_FRACTURES_AMOUNT / 1000) * CHILD_FRACTURES_RATE; // 750/1000*33 = 24.75€
        // Child Protection Agreement: (savings + coverages) * coefficient_of_policyholder_age
        const policyholderAge = Math.min(cAge, 55);
        const childProtectionCoeff = policyholderAge <= 55 ? 0.0438 : 0; // METLIFE_CHILD_PROTECTION_COEFFICIENTS
        const jProtectionBase = scaledSavings + jFracturesCost;
        const jProtectionCost = jProtectionBase * childProtectionCoeff;
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
            expected_value: projectULFull(scaledSavings, child.childAge, child.horizon, 0.08, 5000),
            is_active: true,
            details: {
              annual_savings: scaledSavings,
              target_education_gap: Math.round(child.gapForThisChild),
              coverages: {
                fractures: CHILD_FRACTURES_AMOUNT,
                fractures_rate_per_1000: CHILD_FRACTURES_RATE,
                child_protection_agreement: policyholderAge <= 55,
                child_protection_coefficient: childProtectionCoeff,
              },
              premium_bonus_pct: Math.round(getPremiumBonus(scaledSavings) * 100),
              av_charge_pct: Math.round(getAVCharge(scaledSavings) * 10000) / 100,
            },
          });
        }
      }
    }

    // ── СТЪПКА 2: Term Life (ако UL не е избран за клиент) ──
    if (cAge < 65 && !clientUsesUL) {
      const tl = buildTermLifePremium(cAge, clientNet, clientGross, hasChildUnder18, hasMortgage, includePartner, clientIncomeShare > 0.55);
      const tlBudget = remainingMonthlyBudget * 12;

      let tlFinal = tl;
      if (tl.totalAnnual > tlBudget) {
        tlFinal = scaleTermLifeToFit(tl, cAge, tlBudget);
      }

      if (tlFinal && tlFinal.totalAnnual <= tlBudget + 0.01 && tlFinal.totalAnnual > 0) {
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
            admin_fee: 13,
            coverages: {
              basicLifeCoverage: tlFinal.basicLifeCoverage,
              ptdCoverage: tlFinal.ptdCoverage,
              ci32Coverage: tlFinal.ci32Coverage,
              ci32TermYears: 10,
              fracturesCoverage: 1500,
              fractures_rate_per_1000: RISK_CLASS_1.fracturesAndBurns,
              telemedicine: true,
            },
          },
        });
      } else if (cAge >= 16 && cAge <= 69 && remainingMonthlyBudget >= DZI_ZAKRILA_PLATINUM.monthly) {
        // ── СТЪПКА 3: ДЗИ Закрила Платинен fallback ──
        addProduct({
          product_type: 'personal_accident',
          provider: 'ДЗИ',
          product_name: 'ДЗИ Закрила — Платинен пакет',
          beneficiary: 'partner1',
          beneficiary_name: `${a.client_first_name||''} ${a.client_last_name||''}`.trim(),
          beneficiary_age: cAge,
          monthly_premium: DZI_ZAKRILA_PLATINUM.monthly,
          total_premium: DZI_ZAKRILA_PLATINUM.annual,
          coverage_amount: DZI_ZAKRILA_PLATINUM.coverages.deathAccident,
          is_active: true,
          details: { plan: 'Platinum', currency: 'EUR', coverages: DZI_ZAKRILA_PLATINUM.coverages },
        });
      }
    }

    // ── СТЪПКА 2: Term Life за партньор (ако UL не е избран) ──
    if (includePartner && pAge < 65 && !partnerUsesUL) {
      const tlP = buildTermLifePremium(pAge, partnerNet, partnerGross, hasChildUnder18, hasMortgage, true, partnerIncomeShare > 0.55);
      const tlBudgetP = remainingMonthlyBudget * 12;

      let tlPFinal = tlP;
      if (tlP.totalAnnual > tlBudgetP) {
        tlPFinal = scaleTermLifeToFit(tlP, pAge, tlBudgetP);
      }

      if (tlPFinal && tlPFinal.totalAnnual <= tlBudgetP + 0.01 && tlPFinal.totalAnnual > 0) {
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
            admin_fee: 13,
            coverages: {
              basicLifeCoverage: tlPFinal.basicLifeCoverage,
              ptdCoverage: tlPFinal.ptdCoverage,
              ci32Coverage: tlPFinal.ci32Coverage,
              ci32TermYears: 10,
              fracturesCoverage: 1500,
              fractures_rate_per_1000: RISK_CLASS_1.fracturesAndBurns,
              telemedicine: true,
            },
          },
        });
      } else if (pAge >= 16 && pAge <= 69 && remainingMonthlyBudget >= DZI_ZAKRILA_PLATINUM.monthly) {
        addProduct({
          product_type: 'personal_accident',
          provider: 'ДЗИ',
          product_name: 'ДЗИ Закрила — Платинен пакет',
          beneficiary: 'partner2',
          beneficiary_name: `${a.partner_first_name||''} ${a.partner_last_name||''}`.trim(),
          beneficiary_age: pAge,
          monthly_premium: DZI_ZAKRILA_PLATINUM.monthly,
          total_premium: DZI_ZAKRILA_PLATINUM.annual,
          coverage_amount: DZI_ZAKRILA_PLATINUM.coverages.deathAccident,
          is_active: true,
          details: { plan: 'Platinum', currency: 'EUR', coverages: DZI_ZAKRILA_PLATINUM.coverages },
        });
      }
    }

    // ── MetLife Credit Guard (при ипотека) ──
    const mortgageBalance = a.liability_mortgage_remaining || 0;
    const mortgageTermYears = a.liability_mortgage_remaining_months ? Math.ceil(a.liability_mortgage_remaining_months / 12) : 20;
    if (mortgageBalance >= 10000 && hasMortgage && cAge < 65) {
      const cgTerm = Math.min(mortgageTermYears, 70 - cAge, 30);
      const cgMonthly = getCreditGuardMonthly(cAge, mortgageBalance, cgTerm);
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
            loan_balance: mortgageBalance,
            loan_term_years: cgTerm,
            package: 'Основен',
            rate_per_100k: CG_BASIC_RATES[Math.min(cAge, 65)]?.[Math.min(cgTerm, 30)] || null,
          },
        });
      }
    }

    // ── СТЪПКА 2: УНИКА Здраве и ценност Селект — клиент ──
    // Точни тарифи от UniqaHealthValueConstants (EUR от 01.01.2026)
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
        details: { plan: 'Europa', currency: 'EUR', daily_benefit_eur: 135 },
      });
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
          details: { plan: 'Europa', currency: 'EUR', daily_benefit_eur: 135 },
        });
      }
    }

    // ── УНИКА за деца — всичко или нищо ──
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

    // ── СТЪПКА 3: Дженерали Basic — само за лица БЕЗ работодателска застраховка ──
    // Фиксирана тарифа 60€/месец (EUR от 01.01.2026, беше 60 BGN)
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
          total_premium: GENERALI_BASIC_ANNUAL_EUR,
          is_active: true,
          details: { plan: 'Basic', currency: 'EUR', flat_rate: true },
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
          total_premium: GENERALI_BASIC_ANNUAL_EUR,
          is_active: true,
          details: { plan: 'Basic', currency: 'EUR', flat_rate: true },
        });
      }
    }

    // ── II СТЪЛБ: СМЯНА КЪМ ОББ УПФ ──
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
        details: {
          from_fund: a.client_pension_fund,
          note: 'Еднократна административна процедура — без допълнителни разходи',
        },
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
        details: {
          from_fund: a.partner_pension_fund,
          note: 'Еднократна административна процедура — без допълнителни разходи',
        },
      });
    }

    // ── ОБОБЩЕНИЕ ──
    const taxReliefAnnual = planProducts.filter(p => (p.monthly_premium || 0) > 0)
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
      protection_need_p1: Math.round(corpusClient * 0.5),
      protection_need_p2: includePartner ? Math.round(corpusPartner * 0.5) : 0,
      reserve_need: targetReserve,
      pension_gap_p1: Math.round(targetPerPerson),
      pension_gap_p2: includePartner ? Math.round(targetPerPerson) : 0,
      products: planProducts,
      total_monthly_premium: totalMonthlyPremium,
      total_coverage: planProducts.reduce((s, p) => s + (p.coverage_amount || 0), 0),
      total_expected_value: planProducts.reduce((s, p) => s + (p.expected_value || 0), 0),
      notes: JSON.stringify({
        version: '3.0',
        constitution_based: true,
        tariffs_source: 'FinancialPlanConstants + UniqaHealthValueConstants (exact match)',
        currency: 'EUR (all products, BGN replaced from 01.01.2026)',
        ceilings: { ceiling1: Math.round(ceiling1), ceiling2: Math.round(ceiling2), maxMonthlyBudget: Math.round(maxMonthlyBudget) },
        reserve_mode: reserveAlreadyBuilt ? 'B' : 'A',
        total_corpus: Math.round(totalCorpus),
        corpus_net: Math.round(corpusNet),
        target_per_person: Math.round(targetPerPerson),
        fv_assets: Math.round(fvFinancialAssets + fvProperties + fvVolPension),
        generali_monthly_eur: GENERALI_BASIC_MONTHLY_EUR,
        dzi_zakrila_platinum_monthly_eur: DZI_ZAKRILA_PLATINUM.monthly,
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
        ai_recommendation_reason: 'Генериран по PLAN_RULES v3.0 — точни тарифи от ProductConfigDemo калкулатори',
      });
    }

    return Response.json({
      success: true,
      plan_id: savedPlan.id,
      version: '3.0',
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