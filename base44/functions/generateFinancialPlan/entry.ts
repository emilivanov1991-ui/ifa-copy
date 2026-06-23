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

// AV % Charge — идентична с METLIFE_UL_AV_CHARGES.regular_premium от FinancialPlanConstants
// Структура: annual premium → charge rate
// Прагове: 300(2%), 720(1.75%), 960(1.5%), 1200(1.25%), 1500(1%), 2400(0.75%), 3600(0.5%), 4800(0.5%), 6000(0.5%)
const AV_CHARGE_TABLE = [
  { from: 300,  annual: 300,  rate: 0.0200 },
  { from: 720,  annual: 720,  rate: 0.0175 },
  { from: 960,  annual: 960,  rate: 0.0150 },
  { from: 1200, annual: 1200, rate: 0.0125 },
  { from: 1500, annual: 1500, rate: 0.0100 },
  { from: 2400, annual: 2400, rate: 0.0075 },
  { from: 3600, annual: 3600, rate: 0.0050 },
  { from: 4800, annual: 4800, rate: 0.0050 },
  { from: 6000, annual: 6000, rate: 0.0050 },
];

// Premium Bonus — идентична с METLIFE_UL_PREMIUM_BONUS.regular_premium от FinancialPlanConstants
// Структура: from (inclusive), to (exclusive) → bonus rate
const PREMIUM_BONUS_TABLE = [
  { from: 0,    to: 1200,    bonus: 0 },
  { from: 1200, to: 1800,    bonus: 0.01 },
  { from: 1800, to: 3000,    bonus: 0.02 },
  { from: 3000, to: 4200,    bonus: 0.03 },
  { from: 4200, to: Infinity, bonus: 0.04 },
];

// ============================================================
// METLIFE CREDIT GUARD — пълна тарифна таблица
// Идентична с MetLifeCreditGuardConstants.js (CREDIT_GUARD_TARIFF)
// Структура: age → term → { basic, extended } — премия за 100,000 EUR покритие
// Правила: min_age=18, max_age=65, age+term<=65, min_sum=10000, max_sum=500000
// Налични срокове: 5, 10, 15, 20, 25, 30, 35 (по наличност за дадена възраст)
// ============================================================
const CG_TARIFF = {
  18: { 35:{basic:147,extended:172}, 30:{basic:147,extended:172}, 25:{basic:147,extended:172}, 20:{basic:147,extended:172}, 15:{basic:147,extended:172}, 10:{basic:147,extended:172}, 5:{basic:147,extended:172} },
  19: { 35:{basic:147,extended:184}, 30:{basic:147,extended:184}, 25:{basic:147,extended:184}, 20:{basic:147,extended:184}, 15:{basic:147,extended:184}, 10:{basic:147,extended:184}, 5:{basic:147,extended:184} },
  20: { 35:{basic:147,extended:184}, 30:{basic:147,extended:184}, 25:{basic:147,extended:184}, 20:{basic:147,extended:184}, 15:{basic:147,extended:184}, 10:{basic:147,extended:184}, 5:{basic:147,extended:184} },
  21: { 35:{basic:147,extended:184}, 30:{basic:147,extended:184}, 25:{basic:147,extended:184}, 20:{basic:147,extended:184}, 15:{basic:147,extended:184}, 10:{basic:147,extended:184}, 5:{basic:147,extended:184} },
  22: { 35:{basic:147,extended:184}, 30:{basic:147,extended:184}, 25:{basic:147,extended:184}, 20:{basic:147,extended:184}, 15:{basic:147,extended:184}, 10:{basic:147,extended:184}, 5:{basic:147,extended:184} },
  23: { 35:{basic:160,extended:196}, 30:{basic:147,extended:184}, 25:{basic:147,extended:184}, 20:{basic:147,extended:184}, 15:{basic:147,extended:184}, 10:{basic:147,extended:184}, 5:{basic:147,extended:184} },
  24: { 35:{basic:160,extended:196}, 30:{basic:147,extended:184}, 25:{basic:147,extended:184}, 20:{basic:147,extended:184}, 15:{basic:147,extended:184}, 10:{basic:147,extended:184}, 5:{basic:147,extended:184} },
  25: { 35:{basic:172,extended:209}, 30:{basic:160,extended:184}, 25:{basic:147,extended:184}, 20:{basic:147,extended:184}, 15:{basic:147,extended:184}, 10:{basic:147,extended:184}, 5:{basic:147,extended:184} },
  26: { 35:{basic:172,extended:221}, 30:{basic:160,extended:196}, 25:{basic:147,extended:184}, 20:{basic:147,extended:184}, 15:{basic:147,extended:184}, 10:{basic:147,extended:184}, 5:{basic:147,extended:184} },
  27: { 35:{basic:184,extended:221}, 30:{basic:160,extended:209}, 25:{basic:147,extended:184}, 20:{basic:147,extended:184}, 15:{basic:147,extended:184}, 10:{basic:147,extended:184}, 5:{basic:147,extended:184} },
  28: { 35:{basic:184,extended:233}, 30:{basic:172,extended:209}, 25:{basic:160,extended:196}, 20:{basic:147,extended:184}, 15:{basic:147,extended:184}, 10:{basic:147,extended:184}, 5:{basic:147,extended:184} },
  29: { 35:{basic:196,extended:245}, 30:{basic:184,extended:221}, 25:{basic:160,extended:196}, 20:{basic:147,extended:184}, 15:{basic:147,extended:184}, 10:{basic:147,extended:184}, 5:{basic:147,extended:184} },
  30: { 35:{basic:209,extended:270}, 30:{basic:184,extended:233}, 25:{basic:172,extended:209}, 20:{basic:160,extended:196}, 15:{basic:160,extended:184}, 10:{basic:160,extended:184}, 5:{basic:160,extended:184} },
  31: { 35:{basic:221,extended:282}, 30:{basic:196,extended:258}, 25:{basic:184,extended:221}, 20:{basic:172,extended:209}, 15:{basic:160,extended:184}, 10:{basic:160,extended:184}, 5:{basic:160,extended:184} },
  32: { 35:{basic:233,extended:306}, 30:{basic:209,extended:270}, 25:{basic:196,extended:245}, 20:{basic:184,extended:221}, 15:{basic:172,extended:196}, 10:{basic:172,extended:196}, 5:{basic:172,extended:196} },
  33: { 35:{basic:245,extended:331}, 30:{basic:221,extended:294}, 25:{basic:209,extended:258}, 20:{basic:184,extended:233}, 15:{basic:172,extended:209}, 10:{basic:172,extended:209}, 5:{basic:172,extended:209} },
  34: { 35:{basic:258,extended:355}, 30:{basic:233,extended:306}, 25:{basic:209,extended:270}, 20:{basic:196,extended:245}, 15:{basic:184,extended:233}, 10:{basic:184,extended:209}, 5:{basic:184,extended:209} },
  35: { 35:{basic:282,extended:380}, 30:{basic:245,extended:331}, 25:{basic:233,extended:294}, 20:{basic:209,extended:270}, 15:{basic:196,extended:245}, 10:{basic:184,extended:221}, 5:{basic:184,extended:221} },
  36: { 30:{basic:270,extended:355}, 25:{basic:245,extended:319}, 20:{basic:221,extended:282}, 15:{basic:209,extended:258}, 10:{basic:196,extended:233}, 5:{basic:196,extended:233} },
  37: { 30:{basic:282,extended:392}, 25:{basic:258,extended:343}, 20:{basic:233,extended:306}, 15:{basic:221,extended:282}, 10:{basic:209,extended:258}, 5:{basic:209,extended:245} },
  38: { 30:{basic:306,extended:417}, 25:{basic:282,extended:368}, 20:{basic:258,extended:331}, 15:{basic:233,extended:306}, 10:{basic:221,extended:282}, 5:{basic:221,extended:270} },
  39: { 30:{basic:319,extended:453}, 25:{basic:294,extended:404}, 20:{basic:270,extended:355}, 15:{basic:245,extended:331}, 10:{basic:233,extended:294}, 5:{basic:233,extended:294} },
  40: { 30:{basic:343,extended:490}, 25:{basic:319,extended:429}, 20:{basic:294,extended:380}, 15:{basic:270,extended:355}, 10:{basic:245,extended:319}, 5:{basic:245,extended:306} },
  41: { 25:{basic:331,extended:466}, 20:{basic:306,extended:417}, 15:{basic:282,extended:380}, 10:{basic:258,extended:343}, 5:{basic:245,extended:319} },
  42: { 25:{basic:368,extended:502}, 20:{basic:331,extended:453}, 15:{basic:306,extended:417}, 10:{basic:282,extended:368}, 5:{basic:270,extended:343} },
  43: { 25:{basic:392,extended:551}, 20:{basic:355,extended:490}, 15:{basic:331,extended:453}, 10:{basic:306,extended:404}, 5:{basic:294,extended:368} },
  44: { 25:{basic:417,extended:600}, 20:{basic:392,extended:539}, 15:{basic:355,extended:490}, 10:{basic:331,extended:441}, 5:{basic:306,extended:404} },
  45: { 25:{basic:453,extended:649}, 20:{basic:417,extended:588}, 15:{basic:392,extended:539}, 10:{basic:355,extended:478}, 5:{basic:331,extended:429} },
  46: { 20:{basic:453,extended:637}, 15:{basic:417,extended:588}, 10:{basic:380,extended:527}, 5:{basic:355,extended:466} },
  47: { 20:{basic:490,extended:698}, 15:{basic:453,extended:637}, 10:{basic:417,extended:576}, 5:{basic:392,extended:515} },
  48: { 20:{basic:515,extended:747}, 15:{basic:490,extended:686}, 10:{basic:441,extended:625}, 5:{basic:417,extended:564} },
  49: { 20:{basic:551,extended:821}, 15:{basic:515,extended:747}, 10:{basic:478,extended:686}, 5:{basic:453,extended:612} },
  50: { 20:{basic:588,extended:882}, 15:{basic:551,extended:808}, 10:{basic:502,extended:735}, 5:{basic:466,extended:661} },
  51: { 15:{basic:588,extended:882}, 10:{basic:539,extended:796}, 5:{basic:502,extended:710} },
  52: { 15:{basic:637,extended:955}, 10:{basic:576,extended:857}, 5:{basic:539,extended:772} },
  53: { 15:{basic:674,extended:1029}, 10:{basic:625,extended:931}, 5:{basic:576,extended:833} },
  54: { 15:{basic:723,extended:1114}, 10:{basic:661,extended:1004}, 5:{basic:600,extended:894} },
  55: { 15:{basic:772,extended:1212}, 10:{basic:698,extended:1090}, 5:{basic:637,extended:955} },
  56: { 10:{basic:759,extended:1176}, 5:{basic:686,extended:1029} },
  57: { 10:{basic:796,extended:1273}, 5:{basic:710,extended:1102} },
  58: { 10:{basic:882,extended:1408}, 5:{basic:784,extended:1237} },
  59: { 10:{basic:931,extended:1530}, 5:{basic:833,extended:1335} },
  60: { 10:{basic:1016,extended:1677}, 5:{basic:918,extended:1469} },
  61: { 5:{basic:967,extended:1579} },
  62: { 5:{basic:1029,extended:1714} },
  63: { 5:{basic:1102,extended:1861} },
  64: { 5:{basic:1188,extended:2045} },
  65: { 5:{basic:1273,extended:2228} },
};

const CG_RULES = {
  min_age: 18,
  max_age: 70, // age + term <= 70 (от METLIFE_CREDIT_GUARD_RULES)
  min_sum: 10000,
  max_sum: 2000000, // от METLIFE_CREDIT_GUARD_RULES.max_sum
  reference_sum: 100000,
  available_terms: [5, 10, 15, 20, 25, 30, 35],
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

// METLIFE_PA_CHILD_COVERAGES — фрактури за Junior (от FinancialPlanConstants)
// brokenBonesAndBurns: { per: 1000, rate: 33 }
const CHILD_FRACTURES_RATE = 33; // per 1000 EUR
const CHILD_FRACTURES_AMOUNT = 750; // EUR

// Child Protection Agreement коефициенти по възраст на застраховащия
// Идентични с METLIFE_CHILD_PROTECTION_COEFFICIENTS от FinancialPlanConstants
// Валидни за застраховащи на възраст 18-55 г.
const CHILD_PROTECTION_COEFFICIENTS = {
  18:0.0438, 19:0.0438, 20:0.0438, 21:0.0438, 22:0.0438,
  23:0.0438, 24:0.0438, 25:0.0438, 26:0.0438, 27:0.0438,
  28:0.0438, 29:0.0438, 30:0.0438,
  31:0.044,  32:0.044,  33:0.044,  34:0.044,  35:0.044,
  36:0.045,  37:0.045,  38:0.045,  39:0.045,  40:0.045,
  41:0.048,  42:0.048,  43:0.048,  44:0.048,  45:0.048,
  46:0.052,  47:0.052,  48:0.052,  49:0.052,  50:0.052,
  51:0.058,  52:0.058,  53:0.058,  54:0.058,  55:0.058,
};

// Идентично с getChildProtectionCoefficient от FinancialPlanConstants
const getChildProtectionCoefficient = (policyholderAge) => {
  if (policyholderAge < 18 || policyholderAge > 55) return null;
  return CHILD_PROTECTION_COEFFICIENTS[policyholderAge] || 0.044;
};

// ──────────────────────────────────────────────────────────
// LOOKUP HELPERS (точни — съответстват на FinancialPlanConstants)
// ──────────────────────────────────────────────────────────

// Идентично с getAVCharge(annualPremium, false) от FinancialPlanConstants
// Итерира отзад напред — взима последния ред, чийто праг е <= annualPremium
const getAVCharge = (annualPremium) => {
  let rate = AV_CHARGE_TABLE[0].rate;
  for (const row of AV_CHARGE_TABLE) {
    if (annualPremium >= row.from) rate = row.rate;
    else break;
  }
  return rate;
};

// Идентично с getPremiumBonus(annualPremium, false) от FinancialPlanConstants
// Прага е "from <= premium < to" (to е exclusive) — точно като frontend логиката
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

// Изчислява месечна премия Credit Guard (Основен пакет) по пълната тарифа
// Логика: намери точна възраст (без interpolation), после най-дълъг наличен срок <= termYears
// age+term не трябва да надвишава CG_RULES.max_age (65)
const getCreditGuardMonthly = (age, loanAmount, termYears, packageType = 'basic') => {
  if (!loanAmount || loanAmount <= 0) return null;
  if (age < CG_RULES.min_age || age > CG_RULES.max_age) return null;
  if (loanAmount < CG_RULES.min_sum || loanAmount > CG_RULES.max_sum) return null;
  if (age + termYears > CG_RULES.max_age) return null;

  const ageData = CG_TARIFF[age];
  if (!ageData) return null;

  // Намираме най-дългия наличен срок, който е <= termYears
  const availableTerms = CG_RULES.available_terms
    .filter(t => ageData[t] !== undefined && t <= termYears)
    .sort((a, b) => b - a); // низходящо — искаме най-дългия
  if (!availableTerms.length) return null;

  const selTerm = availableTerms[0];
  const ratePerHundredK = ageData[selTerm][packageType];
  if (!ratePerHundredK) return null;

  const annualPremium = (loanAmount / CG_RULES.reference_sum) * ratePerHundredK;
  return Math.round(annualPremium / 12 * 100) / 100;
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
// СМЪРТНОСТНА ТАБЛИЦА — Bulgarian 2008-2010 (qx per 1000)
// Идентична с FinancialPlanConstants.METLIFE_MORTALITY_TABLES
// Пълна таблица от cal! — всички възрасти 0-101
// Тегла: male_weight=0.8, female_weight=0.2
// ──────────────────────────────────────────────────────────

const MORTALITY_QX = {
  0:   {m:10.4667,  f:8.3265},
  1:   {m:0.8631,   f:0.8105},
  2:   {m:0.2755,   f:0.4431},
  3:   {m:0.4692,   f:0.2624},
  4:   {m:0.3255,   f:0.1807},
  5:   {m:0.4914,   f:0.1928},
  6:   {m:0.3448,   f:0.2442},
  7:   {m:0.2900,   f:0.2166},
  8:   {m:0.2470,   f:0.1696},
  9:   {m:0.3493,   f:0.2300},
  10:  {m:0.1934,   f:0.2031},
  11:  {m:0.3457,   f:0.1327},
  12:  {m:0.3490,   f:0.3376},
  13:  {m:0.3329,   f:0.2078},
  14:  {m:0.3901,   f:0.2413},
  15:  {m:0.4320,   f:0.2681},
  16:  {m:0.5632,   f:0.3168},
  17:  {m:0.6590,   f:0.3991},
  18:  {m:0.7820,   f:0.4778},
  19:  {m:0.9968,   f:0.3351},
  20:  {m:0.9754,   f:0.3689},
  21:  {m:0.9902,   f:0.3905},
  22:  {m:1.1783,   f:0.3851},
  23:  {m:1.1208,   f:0.3416},
  24:  {m:1.2253,   f:0.3714},
  25:  {m:1.1798,   f:0.4777},
  26:  {m:1.2803,   f:0.5026},
  27:  {m:1.2603,   f:0.2587},
  28:  {m:1.2194,   f:0.5889},
  29:  {m:1.2426,   f:0.5133},
  30:  {m:1.2442,   f:0.6015},
  31:  {m:1.3015,   f:0.6550},
  32:  {m:1.5494,   f:0.5586},
  33:  {m:1.6410,   f:0.7463},
  34:  {m:1.6169,   f:0.9297},
  35:  {m:1.8178,   f:0.8255},
  36:  {m:1.9444,   f:1.0409},
  37:  {m:2.3805,   f:1.0218},
  38:  {m:2.2935,   f:1.2077},
  39:  {m:2.5608,   f:1.2746},
  40:  {m:3.1639,   f:1.2941},
  41:  {m:3.2109,   f:1.3436},
  42:  {m:3.6103,   f:1.5150},
  43:  {m:4.1226,   f:1.8807},
  44:  {m:4.9154,   f:2.1087},
  45:  {m:5.4322,   f:2.4594},
  46:  {m:6.0691,   f:2.6197},
  47:  {m:7.0983,   f:2.9067},
  48:  {m:7.5943,   f:2.9493},
  49:  {m:7.5754,   f:3.4800},
  50:  {m:9.2432,   f:3.4757},
  51:  {m:9.8708,   f:3.8075},
  52:  {m:11.0132,  f:4.1138},
  53:  {m:12.1581,  f:4.7100},
  54:  {m:13.1207,  f:5.4055},
  55:  {m:13.7477,  f:5.8224},
  56:  {m:16.0129,  f:5.8155},
  57:  {m:16.4340,  f:6.5164},
  58:  {m:19.0146,  f:7.2625},
  59:  {m:20.7628,  f:7.4624},
  60:  {m:21.6724,  f:7.7226},
  61:  {m:22.9264,  f:8.5540},
  62:  {m:25.2898,  f:9.3900},
  63:  {m:26.2972,  f:10.5458},
  64:  {m:28.9558,  f:11.5530},
  65:  {m:29.2752,  f:12.1736},
  66:  {m:33.3520,  f:14.5268},
  67:  {m:34.5356,  f:15.8754},
  68:  {m:37.8817,  f:17.1907},
  69:  {m:39.6470,  f:20.2289},
  70:  {m:43.5827,  f:22.0645},
  71:  {m:47.3724,  f:24.4109},
  72:  {m:51.2416,  f:28.5485},
  73:  {m:55.1131,  f:32.7378},
  74:  {m:59.9414,  f:37.0256},
  75:  {m:67.1646,  f:40.3518},
  76:  {m:68.0905,  f:45.7826},
  77:  {m:73.6347,  f:50.4993},
  78:  {m:80.2822,  f:59.1184},
  79:  {m:88.9190,  f:66.9391},
  80:  {m:99.7261,  f:75.4640},
  81:  {m:106.2297, f:85.9931},
  82:  {m:122.5261, f:99.5399},
  83:  {m:136.4101, f:109.8312},
  84:  {m:143.9972, f:121.1751},
  85:  {m:159.6668, f:132.4886},
  86:  {m:160.8118, f:148.9731},
  87:  {m:178.4595, f:165.2472},
  88:  {m:192.4168, f:177.0625},
  89:  {m:208.5408, f:185.4915},
  90:  {m:211.2843, f:187.2073},
  91:  {m:203.0417, f:192.2067},
  92:  {m:232.0867, f:240.8233},
  93:  {m:314.4137, f:318.7339},
  94:  {m:323.8744, f:316.9338},
  95:  {m:294.3396, f:290.9826},
  96:  {m:317.1806, f:304.2045},
  97:  {m:382.6087, f:344.0736},
  98:  {m:401.3722, f:396.0067},
  99:  {m:455.3314, f:411.6788},
  100: {m:434.0278, f:457.0384},
  101: {m:1000,     f:1000},
};

// Идентично с getBlendedMortalityRate + getMonthlyMortalityRate от FinancialPlanConstants
// Тегла: 0.8 мъже / 0.2 жени — точно като METLIFE_MORTALITY_TABLES.male_weight/female_weight
const getMonthlyMortality = (age) => {
  const a = Math.min(Math.max(Math.floor(age), 0), 101);
  const q = MORTALITY_QX[a] || MORTALITY_QX[101];
  return (q.m * 0.8 + q.f * 0.2) / 1000 / 12;
};

// ──────────────────────────────────────────────────────────
// UL ПРОЕКЦИЯ — точна месечна симулация (идентична с MetLifeULCalculator)
// Включва: investible premium rate, premium bonus, AV charge, COI, policy fee
// ──────────────────────────────────────────────────────────

// MetLife Детство няма интегрирано покритие Живот — face amount = 0 → COI = 0 (без смъртностна такса)
const JUNIOR_FACE_AMOUNT = 0;

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
    // Коефициент 0.043799 от METLIFE_PA_PREMIUM_WAIVER[1].coefficient (рисков клас 1)
    // Идентично с MetLifeULCalculator: waiverRate = riskClass === 1 ? 0.0438 : ...
    waiverCost = (annualSavings + totalCoveragesCost) * 0.043799;
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

// ============================================================
// METLIFE ГРИЖА (MetLife Care) — пълни константи и логика
// Идентични с MetLifeCareCalculator.jsx + FinancialPlanConstants
// ============================================================

// Пакети покрития — идентични с ML_CARE_PACKAGES в MetLifeCareCalculator
const ML_CARE_PACKAGES = {
  'Бронзов':      { disability: 10000,  ptd: 10000,  ci40: 10000,  cancer: 10000,  inSitu: 5000  },
  'Сребърен':     { disability: 25000,  ptd: 25000,  ci40: 25000,  cancer: 25000,  inSitu: 12500 },
  'Златен':       { disability: 50000,  ptd: 50000,  ci40: 50000,  cancer: 50000,  inSitu: 25000 },
  'Платинен':     { disability: 100000, ptd: 100000, ci40: 100000, cancer: 100000, inSitu: 50000 },
};

// Тарифи по възраст — идентични с METLIFE_CARE_AGE_RATES от FinancialPlanConstants (rate per 1000 EUR)
const METLIFE_CARE_AGE_RATES = {
  18: { disability: 2.82,  ci40: 4.43,  cancer: 3.84,  inSitu: 4.55328  },
  19: { disability: 2.94,  ci40: 4.57,  cancer: 3.97,  inSitu: 4.61448  },
  20: { disability: 2.94,  ci40: 4.71,  cancer: 4.09,  inSitu: 4.70016  },
  21: { disability: 3.06,  ci40: 4.85,  cancer: 4.21,  inSitu: 4.77360  },
  22: { disability: 3.06,  ci40: 4.99,  cancer: 4.33,  inSitu: 4.87152  },
  23: { disability: 3.18,  ci40: 5.14,  cancer: 4.46,  inSitu: 4.98168  },
  24: { disability: 3.18,  ci40: 5.30,  cancer: 4.60,  inSitu: 5.09184  },
  25: { disability: 3.30,  ci40: 5.47,  cancer: 4.74,  inSitu: 5.21424  },
  26: { disability: 3.30,  ci40: 5.64,  cancer: 4.90,  inSitu: 5.33664  },
  27: { disability: 3.43,  ci40: 5.84,  cancer: 5.06,  inSitu: 5.47128  },
  28: { disability: 3.55,  ci40: 6.03,  cancer: 5.23,  inSitu: 5.63040  },
  29: { disability: 3.67,  ci40: 6.24,  cancer: 5.40,  inSitu: 5.78952  },
  30: { disability: 3.79,  ci40: 6.46,  cancer: 5.59,  inSitu: 5.94864  },
  31: { disability: 3.92,  ci40: 6.70,  cancer: 5.79,  inSitu: 6.12000  },
  32: { disability: 4.04,  ci40: 6.95,  cancer: 6.01,  inSitu: 6.30360  },
  33: { disability: 4.16,  ci40: 7.22,  cancer: 6.24,  inSitu: 6.49944  },
  34: { disability: 4.41,  ci40: 7.50,  cancer: 6.49,  inSitu: 6.71976  },
  35: { disability: 4.53,  ci40: 7.81,  cancer: 6.74,  inSitu: 6.95232  },
  36: { disability: 4.77,  ci40: 8.14,  cancer: 7.04,  inSitu: 7.18488  },
  37: { disability: 5.02,  ci40: 8.51,  cancer: 7.34,  inSitu: 7.45416  },
  38: { disability: 5.26,  ci40: 8.89,  cancer: 7.67,  inSitu: 7.73568  },
  39: { disability: 5.51,  ci40: 9.30,  cancer: 8.03,  inSitu: 8.04168  },
  40: { disability: 5.75,  ci40: 9.74,  cancer: 8.41,  inSitu: 8.34768  },
  41: { disability: 6.00,  ci40: 10.21, cancer: 8.81,  inSitu: 8.65368  },
  42: { disability: 6.24,  ci40: 10.71, cancer: 9.23,  inSitu: 8.95968  },
  43: { disability: 6.61,  ci40: 11.24, cancer: 9.68,  inSitu: 9.25344  },
  44: { disability: 6.98,  ci40: 11.80, cancer: 10.17, inSitu: 9.54720  },
  45: { disability: 7.34,  ci40: 12.39, cancer: 10.67, inSitu: 9.86544  },
  46: { disability: 7.71,  ci40: 13.01, cancer: 11.20, inSitu: 10.24488 },
  47: { disability: 8.20,  ci40: 13.66, cancer: 11.76, inSitu: 10.66104 },
  48: { disability: 8.57,  ci40: 14.35, cancer: 12.34, inSitu: 11.11392 },
  49: { disability: 9.18,  ci40: 15.07, cancer: 12.96, inSitu: 11.60352 },
  50: { disability: 9.67,  ci40: 15.85, cancer: 13.62, inSitu: 12.15432 },
  51: { disability: 10.28, ci40: 16.65, cancer: 14.31, inSitu: 12.77856 },
  52: { disability: 10.89, ci40: 17.52, cancer: 15.06, inSitu: 13.43952 },
  53: { disability: 11.51, ci40: 18.45, cancer: 15.85, inSitu: 14.14944 },
  54: { disability: 12.12, ci40: 19.50, cancer: 16.73, inSitu: 14.89608 },
  55: { disability: 12.85, ci40: 20.69, cancer: 17.74, inSitu: 15.83856 },
  56: { disability: 13.71, ci40: 21.59, cancer: 18.53, inSitu: 16.70760 },
  57: { disability: 14.57, ci40: 22.77, cancer: 19.54, inSitu: 17.79696 },
  58: { disability: 15.67, ci40: 24.05, cancer: 20.59, inSitu: 19.00872 },
  59: { disability: 16.65, ci40: 25.57, cancer: 21.89, inSitu: 20.51424 },
  60: { disability: 18.12, ci40: 27.37, cancer: 23.43, inSitu: 22.31352 },
  61: { disability: 18.60, ci40: 27.72, cancer: 23.72, inSitu: 22.90104 },
  62: { disability: 19.34, ci40: 28.09, cancer: 24.03, inSitu: 23.47632 },
  63: { disability: 20.20, ci40: 28.62, cancer: 24.53, inSitu: 24.21072 },
  64: { disability: 21.42, ci40: 30.06, cancer: 25.70, inSitu: 25.52040 },
  65: { disability: 23.75, ci40: 32.08, cancer: 27.42, inSitu: 27.52776 },
};

// PI (PTD) rate за рисков клас 1 — от METLIFE_PA_RISK_CLASSES[1].pi = 1.5
const ML_CARE_PTD_RATE_CLASS1 = 1.5;

// Правила за допустимост — от MetLifeCareCalculator (age constraints per coverage)
const ML_CARE_RULES = {
  min_age: 18,
  max_age_disability: 65,    // ТЗР >50%
  max_age_ptd: 65,           // ПТН от злополука (имплицитно свързано)
  max_age_ci40: 65,          // 40 тежки заболявания
  max_age_cancer: 69,        // Злокачествени новообразувания
  max_age_inSitu: 64,        // Карцином ин ситу
  max_age_telemedicine: 64,  // Телемедицина
  min_annual_premium: 50,    // Минимална годишна премия €
  min_disability_coverage: 3000,
  insurance_tax: 0.02,       // 2% данък върху застрахователната премия
  semi_annual_factor: 0.51,  // 51% от годишната за 6-месечно плащане
  quarterly_factor: 0.26,    // 26% от годишната за 3-месечно плащане
};

/**
 * Изчислява MetLife Грижа годишна премия (с данък 2%)
 * Идентична логика с MetLifeCareCalculator.jsx
 * @param {number} age
 * @param {object} coverages — { disability, ptd, ci40, cancer, inSitu }
 * @param {boolean} includeTelemedicine
 * @param {number} riskClass — 1, 2 или 3
 * @returns {{ annualPremium, monthlyPremium, netPremium, insuranceTax, breakdown }}
 */
const calcMLCarePremium = (age, coverages, includeTelemedicine = true, riskClass = 1) => {
  const ageRates = METLIFE_CARE_AGE_RATES[Math.min(Math.max(Math.floor(age), 18), 65)];
  let netPremium = 0;
  const breakdown = {};

  // ТЗР над 50% (заболяване и злополука) — rate per 1000, мин. 3000 €
  if (coverages.disability > 0 && age <= ML_CARE_RULES.max_age_disability) {
    const prem = (coverages.disability / 1000) * ageRates.disability;
    breakdown.disability = { coverage: coverages.disability, rate: ageRates.disability, premium: prem };
    netPremium += prem;
  }

  // Пълна/Частична ТН от злополука — PI rate по рисков клас
  // Рисков клас 1: 1.5, 2: 2.5, 3: 4.0 (от METLIFE_PA_RISK_CLASSES)
  const piRates = { 1: 1.5, 2: 2.5, 3: 4.0 };
  const ptdRate = piRates[riskClass] || 1.5;
  if (coverages.ptd > 0 && age <= ML_CARE_RULES.max_age_ptd) {
    const prem = (coverages.ptd / 1000) * ptdRate;
    breakdown.ptd = { coverage: coverages.ptd, rate: ptdRate, premium: prem };
    netPremium += prem;
  }

  // 40 Тежки Заболявания — допустима 18-65
  if (coverages.ci40 > 0 && age >= 18 && age <= ML_CARE_RULES.max_age_ci40) {
    const prem = (coverages.ci40 / 1000) * ageRates.ci40;
    breakdown.ci40 = { coverage: coverages.ci40, rate: ageRates.ci40, premium: prem };
    netPremium += prem;
  }

  // Злокачествени новообразувания — допустима 18-69
  if (coverages.cancer > 0 && age >= 18 && age <= ML_CARE_RULES.max_age_cancer) {
    const prem = (coverages.cancer / 1000) * ageRates.cancer;
    breakdown.cancer = { coverage: coverages.cancer, rate: ageRates.cancer, premium: prem };
    netPremium += prem;
  }

  // Карцином ин ситу — допустима 18-64
  if (coverages.inSitu > 0 && age >= 18 && age <= ML_CARE_RULES.max_age_inSitu) {
    const prem = (coverages.inSitu / 1000) * ageRates.inSitu;
    breakdown.inSitu = { coverage: coverages.inSitu, rate: ageRates.inSitu, premium: prem };
    netPremium += prem;
  }

  // Телемедицина — 15 €, допустима до 64 г.
  if (includeTelemedicine && age <= ML_CARE_RULES.max_age_telemedicine) {
    breakdown.telemedicine = { coverage: 'Включено', premium: 15 };
    netPremium += 15;
  }

  // 2% застрахователен данък
  const insuranceTax = netPremium * ML_CARE_RULES.insurance_tax;
  const annualPremium = netPremium + insuranceTax;

  return {
    annualPremium: Math.round(annualPremium * 100) / 100,
    monthlyPremium: Math.round((annualPremium / 12) * 100) / 100,
    semiAnnualPremium: Math.round(annualPremium * ML_CARE_RULES.semi_annual_factor * 100) / 100,
    quarterlyPremium: Math.round(annualPremium * ML_CARE_RULES.quarterly_factor * 100) / 100,
    netPremium: Math.round(netPremium * 100) / 100,
    insuranceTax: Math.round(insuranceTax * 100) / 100,
    breakdown,
    eligible: annualPremium >= ML_CARE_RULES.min_annual_premium,
  };
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

      // Бинарно търсене за Junior — с правилна детска начална възраст и JUNIOR_FACE_AMOUNT
      const findJuniorSavings = (target, budg) => {
        if (target <= 0) return 300;
        let lo = 300, hi = budg;
        for (let iter = 0; iter < 40; iter++) {
          const mid = (lo + hi) / 2;
          if (projectULFull(mid, childAge, horizon, 0.08, JUNIOR_FACE_AMOUNT) >= target) hi = mid;
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
        // Коефициентите са по точна таблица CHILD_PROTECTION_COEFFICIENTS (18-55г.)
        const childProtectionCoeff = getChildProtectionCoefficient(cAge) || 0;
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
            expected_value: projectULFull(scaledSavings, child.childAge, child.horizon, 0.08, JUNIOR_FACE_AMOUNT),
            is_active: true,
            details: {
            annual_savings: scaledSavings,
            target_education_gap: Math.round(child.gapForThisChild),
            coverages: {
              fractures: CHILD_FRACTURES_AMOUNT,
              fractures_rate_per_1000: CHILD_FRACTURES_RATE,
              child_protection_agreement: childProtectionCoeff > 0,
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
    // ── MetLife Credit Guard (при ипотека) ──
    // Правила: age 18–65, age+term <= 65, sum 10k–500k, пакет Основен по подразбиране
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
      // Максималният допустим срок: age+term <= 65 И срокът на кредита
      const maxAllowedTerm = CG_RULES.max_age - cAge;
      const cgTerm = Math.min(mortgageTermYears, maxAllowedTerm);
      if (cgTerm >= 5) { // минимум 5 години срок
        const cgMonthly = getCreditGuardMonthly(cAge, mortgageBalance, cgTerm, 'basic');
        if (cgMonthly && cgMonthly > 0 && remainingMonthlyBudget >= cgMonthly) {
          // Открий кой точно срок бе избран за детайлите
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
              coverages: ['Смърт', 'Трайна загуба на работоспособност'],
              rate_per_100k: ageData[chosenTerm]?.basic || null,
              reference_sum: CG_RULES.reference_sum,
            },
          });
        }
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

    // ── СТЪПКА 2.5: MetLife Грижа — Сребърен пакет по подразбиране ──
    // Правила: клиент 18-65, отделно за партньор ако е включен
    // Пакет: Сребърен { disability:25000, ptd:25000, ci40:25000, cancer:25000, inSitu:12500 }
    // Включва Телемедицина ако < 65 г.
    const mlCarePkg = ML_CARE_PACKAGES['Сребърен'];

    if (cAge >= 18 && cAge <= 65) {
      const mlCareClient = calcMLCarePremium(
        cAge,
        { disability: mlCarePkg.disability, ptd: mlCarePkg.ptd, ci40: mlCarePkg.ci40, cancer: mlCarePkg.cancer, inSitu: mlCarePkg.inSitu },
        cAge <= 64, // telemedicine
        1           // рисков клас 1 по подразбиране
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
            insurance_tax_2pct: true,
            net_premium: mlCareClient.netPremium,
            coverages: {
              disability_over_50pct: mlCarePkg.disability,
              ptd_accident: mlCarePkg.ptd,
              critical_illness_40: mlCarePkg.ci40,
              cancer: mlCarePkg.cancer,
              carcinoma_in_situ: cAge <= 64 ? mlCarePkg.inSitu : 0,
              telemedicine: cAge <= 64,
            },
            semi_annual: mlCareClient.semiAnnualPremium,
            quarterly: mlCareClient.quarterlyPremium,
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
            insurance_tax_2pct: true,
            net_premium: mlCarePartner.netPremium,
            coverages: {
              disability_over_50pct: mlCarePkg.disability,
              ptd_accident: mlCarePkg.ptd,
              critical_illness_40: mlCarePkg.ci40,
              cancer: mlCarePkg.cancer,
              carcinoma_in_situ: pAge <= 64 ? mlCarePkg.inSitu : 0,
              telemedicine: pAge <= 64,
            },
            semi_annual: mlCarePartner.semiAnnualPremium,
            quarterly: mlCarePartner.quarterlyPremium,
          },
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

    // ruleset_hash — SHA256 на версия + тарифа (детерминистичен fingerprint)
    const rulebookVersion = '3.0';
    const rulebookPayload = `v${rulebookVersion}|${cAge}|${totalIncome}|${budgetAnnual}`;
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rulebookPayload));
    const ruleset_hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('');

    // ── ЗАПИС НА JsonRulebookVersion ЗА COMPLIANCE AUDIT ──
    // Това е "конституцията" на правилата използвани при генерирането
    const rulebookJson = {
      version: rulebookVersion,
      generated_at: new Date().toISOString(),
      tariffs: {
        TERM_LIFE_BASIC_RATES,
        CI32_RATES,
        CI40_COEFFICIENTS,
        RISK_CLASS_1,
        AV_CHARGE_TABLE,
        PREMIUM_BONUS_TABLE,
        CG_TARIFF,
        CG_RULES,
        UNIQA_EUROPA_TARIFFS,
        GENERALI_BASIC_MONTHLY_EUR,
        DZI_ZAKRILA_PLATINUM,
        CHILD_FRACTURES_RATE,
        CHILD_FRACTURES_AMOUNT,
        CHILD_PROTECTION_COEFFICIENTS,
        METLIFE_CARE_AGE_RATES,
        ML_CARE_PACKAGES,
        ML_CARE_RULES,
        MORTALITY_QX,
      },
      optimization_rules: {
        mortgage: { breakeven_months: 24, refinancing_costs_formula: "(remaining * 0.002) * 1.20 + 60 + 70" },
        ceilings_mode_a: { ceiling_1: "income * 1.5 / 12", ceiling_2: "balance * 0.40" },
        ceilings_mode_b: { ceiling_1: "income * 2.0 / 12", ceiling_2: "balance * 0.66" },
      },
      product_selection_hierarchy: ["ul_investment", "term_life", "dzi_zakrila"],
      investment_goals: {
        junior_target_age: 20,
        pension_retirement_age: 65,
        assumed_return: 0.08,
        post_retirement_return: 0.04,
      }
    };

    await base44.asServiceRole.entities.JsonRulebookVersion.create({
      version: rulebookVersion,
      ruleset_hash,
      valid_from: new Date().toISOString().split('T')[0],
      rulebook_json: rulebookJson,
      changelog: 'v3.0 — Пълна тарифна интеграция (MetLife, Uniqa, Generali, DZI)',
      is_active: true,
      created_by: user.email || 'system',
      approved_by: 'auto-approved',
      approved_at: new Date().toISOString(),
    }).catch(err => {
      console.warn('JsonRulebookVersion запис неуспешен (non-blocking):', err.message);
    });
    // ───────────────────────────────────────────────────────

    // Допълни план с references
    if (verified_profile_id) financialPlan.verified_profile_id = verified_profile_id;
    if (journey_id) financialPlan.journey_id = journey_id;
    financialPlan.rulebook_version = rulebookVersion;
    financialPlan.ruleset_hash = ruleset_hash;

    const savedPlan = await base44.asServiceRole.entities.FinancialPlan.create(financialPlan);

    // Запиши plan_id и ruleset_hash в Journey ако е подаден journey_id
    if (journey_id) {
      await base44.asServiceRole.entities.Journey.update(journey_id, {
        plan_id: savedPlan.id,
        ruleset_hash,
        rulebook_version: rulebookVersion,
        last_activity_at: new Date().toISOString(),
      });
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