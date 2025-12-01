// ============================================================
// ТЕХНИЧЕСКИ КОНСТАНТИ ОТ EXCEL ФАЙЛА
// ============================================================

// Валутен курс EUR/BGN
export const EUR_BGN_RATE = 1.96;

// ============================================================
// ЛОГОТА НА ЗАСТРАХОВАТЕЛИ И ФИНАНСОВИ ПАРТНЬОРИ
// ============================================================

export const PROVIDER_LOGOS = {
  // Международни застрахователи
  'MetLife': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/MetLife_logo.svg/200px-MetLife_logo.svg.png',
  'Allianz': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Allianz_logo.svg/200px-Allianz_logo.svg.png',
  'UNIQA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/UNIQA_Insurance_Group_logo.svg/200px-UNIQA_Insurance_Group_logo.svg.png',
  'Generali': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Generali_logo.svg/200px-Generali_logo.svg.png',
  'GRAWE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Grawe_logo.svg/200px-Grawe_logo.svg.png',
  
  // Български застрахователи
  'ДЗИ': 'https://www.dzi.bg/images/dzi-logo.png',
  'Армеец': 'https://www.armeec.bg/images/logo.png',
  'Булинс': 'https://bulins.bg/wp-content/uploads/2020/07/bulins-logo.png',
  'ЛЕВ ИНС': 'https://www.lev-ins.com/images/logo.png',
  'Бул Инс': 'https://www.bulins.bg/images/logo.png',
  'ЕВРОИНС': 'https://www.euroins.bg/images/euroins-logo.png',
  'EUROINS': 'https://www.euroins.bg/images/euroins-logo.png',
  'Застраховане': 'https://www.zastrahovane.bg/images/logo.png',
  'Bulgaria Insurance': 'https://www.bulgariainsurance.bg/images/logo.png',
  'Asset Insurance': 'https://www.assetinsurance.bg/images/logo.png',
  'БАЕЗ': 'https://www.baez.bg/images/logo.png',
  'Булстрад': 'https://www.bulstrad.bg/images/bulstrad-logo.png',
  
  // Пенсионни фондове
  'ОББ': 'https://www.ubb.bg/images/ubb-logo.png',
  'ОББ Пенсионно': 'https://www.ubb.bg/images/ubb-logo.png',
  'Пенсионноосигурителен институт': 'https://www.poi.bg/images/logo.png',
  'ЦКБ Сила': 'https://www.ckbsila.bg/images/logo.png',
  'Доверие': 'https://www.doverie.bg/images/logo.png',
  'Съгласие': 'https://www.saglasie.bg/images/logo.png',
  'ДСК-Родина': 'https://www.dskrodina.bg/images/logo.png',
  'Бъдеще': 'https://www.badeshte.bg/images/logo.png',
  'Топлина': 'https://www.toplina.bg/images/logo.png',
  'ДаллБогг': 'https://www.dallbogg.bg/images/logo.png',
  'DallBogg': 'https://www.dallbogg.bg/images/logo.png',
  
  // Инвестиционни компании
  'Partners Investments': 'https://www.partners.bg/images/logo.png',
  'Partners Group': 'https://www.partners.bg/images/logo.png'
};

// Списък на всички доставчици по категория
export const PROVIDERS_BY_CATEGORY = {
  international: ['MetLife', 'Allianz', 'UNIQA', 'Generali', 'GRAWE'],
  bulgarian_insurance: ['ДЗИ', 'Армеец', 'Булинс', 'ЛЕВ ИНС', 'ЕВРОИНС', 'Булстрад', 'БАЕЗ'],
  pension_funds: ['ОББ', 'Пенсионноосигурителен институт', 'ЦКБ Сила', 'Доверие', 'Съгласие', 'ДСК-Родина', 'Алианц', 'Бъдеще', 'Топлина', 'ДаллБогг'],
  investments: ['Partners Investments', 'Partners Group']
};

// Конвертиране дни в години
export const DAYS_PER_YEAR = 365.25;

// ============================================================
// ТАРИФНИ ТАБЛИЦИ - TERM LIFE (TK)
// ============================================================

// Тарифа на 1000 EUR покритие по възраст и срок (години)
// Структура: { възраст: { срок: тарифа } }
export const TERM_LIFE_RATES = {
  // Мъже - непушачи
  male_nonsmoker: {
    18: { 5: 0.45, 10: 0.52, 15: 0.65, 20: 0.82, 25: 1.05, 30: 1.35 },
    20: { 5: 0.46, 10: 0.53, 15: 0.67, 20: 0.85, 25: 1.08, 30: 1.40 },
    25: { 5: 0.50, 10: 0.58, 15: 0.73, 20: 0.95, 25: 1.22, 30: 1.58 },
    30: { 5: 0.55, 10: 0.68, 15: 0.88, 20: 1.15, 25: 1.52, 30: 2.00 },
    35: { 5: 0.65, 10: 0.85, 15: 1.12, 20: 1.50, 25: 2.02, 30: 2.70 },
    40: { 5: 0.85, 10: 1.15, 15: 1.58, 20: 2.18, 25: 3.00, 30: 4.10 },
    45: { 5: 1.15, 10: 1.65, 15: 2.35, 20: 3.30, 25: 4.60, 30: 6.40 },
    50: { 5: 1.65, 10: 2.50, 15: 3.65, 20: 5.20, 25: 7.40, 30: 10.50 },
    55: { 5: 2.50, 10: 3.95, 15: 5.90, 20: 8.50, 25: 12.20, 30: 17.50 },
    60: { 5: 3.90, 10: 6.30, 15: 9.60, 20: 14.00, 25: 20.20, 30: 29.00 },
    65: { 5: 6.20, 10: 10.20, 15: 15.80, 20: 23.20, 25: 33.50, 30: 48.00 }
  },
  // Мъже - пушачи (x1.5)
  male_smoker: {
    18: { 5: 0.68, 10: 0.78, 15: 0.98, 20: 1.23, 25: 1.58, 30: 2.03 },
    20: { 5: 0.69, 10: 0.80, 15: 1.01, 20: 1.28, 25: 1.62, 30: 2.10 },
    25: { 5: 0.75, 10: 0.87, 15: 1.10, 20: 1.43, 25: 1.83, 30: 2.37 },
    30: { 5: 0.83, 10: 1.02, 15: 1.32, 20: 1.73, 25: 2.28, 30: 3.00 },
    35: { 5: 0.98, 10: 1.28, 15: 1.68, 20: 2.25, 25: 3.03, 30: 4.05 },
    40: { 5: 1.28, 10: 1.73, 15: 2.37, 20: 3.27, 25: 4.50, 30: 6.15 },
    45: { 5: 1.73, 10: 2.48, 15: 3.53, 20: 4.95, 25: 6.90, 30: 9.60 },
    50: { 5: 2.48, 10: 3.75, 15: 5.48, 20: 7.80, 25: 11.10, 30: 15.75 },
    55: { 5: 3.75, 10: 5.93, 15: 8.85, 20: 12.75, 25: 18.30, 30: 26.25 },
    60: { 5: 5.85, 10: 9.45, 15: 14.40, 20: 21.00, 25: 30.30, 30: 43.50 },
    65: { 5: 9.30, 10: 15.30, 15: 23.70, 20: 34.80, 25: 50.25, 30: 72.00 }
  },
  // Жени - непушачи (по-ниски тарифи)
  female_nonsmoker: {
    18: { 5: 0.38, 10: 0.44, 15: 0.55, 20: 0.70, 25: 0.89, 30: 1.15 },
    20: { 5: 0.39, 10: 0.45, 15: 0.57, 20: 0.72, 25: 0.92, 30: 1.19 },
    25: { 5: 0.43, 10: 0.49, 15: 0.62, 20: 0.81, 25: 1.04, 30: 1.34 },
    30: { 5: 0.47, 10: 0.58, 15: 0.75, 20: 0.98, 25: 1.29, 30: 1.70 },
    35: { 5: 0.55, 10: 0.72, 15: 0.95, 20: 1.28, 25: 1.72, 30: 2.30 },
    40: { 5: 0.72, 10: 0.98, 15: 1.34, 20: 1.85, 25: 2.55, 30: 3.49 },
    45: { 5: 0.98, 10: 1.40, 15: 2.00, 20: 2.81, 25: 3.91, 30: 5.44 },
    50: { 5: 1.40, 10: 2.13, 15: 3.10, 20: 4.42, 25: 6.29, 30: 8.93 },
    55: { 5: 2.13, 10: 3.36, 15: 5.02, 20: 7.23, 25: 10.37, 30: 14.88 },
    60: { 5: 3.32, 10: 5.36, 15: 8.16, 20: 11.90, 25: 17.17, 30: 24.65 },
    65: { 5: 5.27, 10: 8.67, 15: 13.43, 20: 19.72, 25: 28.48, 30: 40.80 }
  },
  // Жени - пушачи (x1.5)
  female_smoker: {
    18: { 5: 0.57, 10: 0.66, 15: 0.83, 20: 1.05, 25: 1.34, 30: 1.73 },
    20: { 5: 0.59, 10: 0.68, 15: 0.86, 20: 1.08, 25: 1.38, 30: 1.79 },
    25: { 5: 0.65, 10: 0.74, 15: 0.93, 20: 1.22, 25: 1.56, 30: 2.01 },
    30: { 5: 0.71, 10: 0.87, 15: 1.13, 20: 1.47, 25: 1.94, 30: 2.55 },
    35: { 5: 0.83, 10: 1.08, 15: 1.43, 20: 1.92, 25: 2.58, 30: 3.45 },
    40: { 5: 1.08, 10: 1.47, 15: 2.01, 20: 2.78, 25: 3.83, 30: 5.24 },
    45: { 5: 1.47, 10: 2.10, 15: 3.00, 20: 4.22, 25: 5.87, 30: 8.16 },
    50: { 5: 2.10, 10: 3.20, 15: 4.65, 20: 6.63, 25: 9.44, 30: 13.40 },
    55: { 5: 3.20, 10: 5.04, 15: 7.53, 20: 10.85, 25: 15.56, 30: 22.32 },
    60: { 5: 4.98, 10: 8.04, 15: 12.24, 20: 17.85, 25: 25.76, 30: 36.98 },
    65: { 5: 7.91, 10: 13.01, 15: 20.15, 20: 29.58, 25: 42.72, 30: 61.20 }
  }
};

// ============================================================
// ТАРИФНИ ТАБЛИЦИ - EDUCATION PLAN (детски UL)
// ============================================================

// Коефициенти за образователен план по години до образование
// колона 19 от Excel таблицата
export const EDUCATION_PLAN_COEFFICIENTS = {
  1: 0.98,
  2: 0.95,
  3: 0.92,
  4: 0.88,
  5: 0.85,
  6: 0.82,
  7: 0.79,
  8: 0.76,
  9: 0.73,
  10: 0.70,
  11: 0.67,
  12: 0.64,
  13: 0.61,
  14: 0.58,
  15: 0.55,
  16: 0.52,
  17: 0.49,
  18: 0.46
};

// ============================================================
// ТАРИФНИ ТАБЛИЦИ - UL INVESTMENT
// ============================================================

// Такси за UL продукти
export const UL_FEES = {
  entry_fee_percent: 3.0,        // Входна такса %
  management_fee_percent: 1.5,   // Годишна такса за управление %
  exit_fee_year_1: 5.0,          // Изходна такса година 1
  exit_fee_year_2: 4.0,
  exit_fee_year_3: 3.0,
  exit_fee_year_4: 2.0,
  exit_fee_year_5: 1.0,
  exit_fee_year_6_plus: 0.0
};

// Очаквана доходност по стратегии (годишна)
export const STRATEGY_RETURNS = {
  conservative: 0.03,   // 3%
  balanced: 0.06,       // 6%
  dynamic: 0.08,        // 8%
  aggressive: 0.10      // 10%
};

// ============================================================
// ТАРИФНИ ТАБЛИЦИ - PENSION PLAN
// ============================================================

export const PENSION_PLAN_RATES = {
  // Доходност на УПФ по доставчици
  providers: {
    'ОББ': { return_24m: 6.01, return_since_2004: 3.21, origin: 'Белгия' },
    'ДСК-Родина': { return_24m: 5.49, return_since_2004: 2.92, origin: 'Унгария' },
    'Съгласие': { return_24m: 5.20, return_since_2004: 2.80, origin: 'България' },
    'Доверие': { return_24m: 4.90, return_since_2004: 2.65, origin: 'България' },
    'Алианц': { return_24m: 4.80, return_since_2004: 2.55, origin: 'Германия' }
  },
  // Данъчно облекчение - max 10% от дохода, max 2400 лв/год
  tax_benefit_percent: 0.10,
  tax_benefit_max_bgn: 2400
};

// ============================================================
// ТАРИФНИ ТАБЛИЦИ - CRITICAL ILLNESS (MLC)
// ============================================================

export const CRITICAL_ILLNESS_RATES = {
  // Тарифа на 1000 EUR покритие по възраст
  male: {
    25: 1.20, 30: 1.50, 35: 2.00, 40: 2.80, 45: 4.00, 50: 5.80, 55: 8.50, 60: 12.50
  },
  female: {
    25: 1.00, 30: 1.25, 35: 1.65, 40: 2.30, 45: 3.30, 50: 4.80, 55: 7.00, 60: 10.30
  }
};

// ============================================================
// ТАРИФНИ ТАБЛИЦИ - HEALTH INSURANCE
// ============================================================

export const HEALTH_INSURANCE_RATES = {
  // UNIQA Здраве и Ценност - месечна премия по възраст
  uniqa_premium: {
    0: 35, 5: 32, 10: 30, 15: 28, 20: 26, 25: 28, 30: 32, 
    35: 38, 40: 48, 45: 62, 50: 82, 55: 110, 60: 150, 65: 200
  },
  // Generali Health Line
  generali_basic: {
    0: 25, 10: 22, 20: 20, 30: 24, 40: 35, 50: 55, 60: 90
  },
  generali_plus: {
    0: 45, 10: 40, 20: 38, 30: 45, 40: 65, 50: 100, 60: 160
  }
};

// ============================================================
// МОДЕЛ КОЕФИЦИЕНТИ (CZ4, CZ13 от Excel)
// ============================================================

export const MODEL_COEFFICIENTS = {
  CZ4: 1.0,    // Корекционен коефициент за вноски
  CZ13: 1.0,   // Корекционен коефициент за доп. вноски
  
  // Коефициенти за трудов капитал
  INCOME_GROWTH_RATE: 0.03,  // 3% годишен ръст на дохода
  
  // Коефициент за нужда от защита
  PROTECTION_MONTHS: 60,     // 60 месеца = 5 години заместване на дохода
  
  // Коефициент за резерв
  RESERVE_MONTHS_DEFAULT: 6  // 6 месечни разхода
};

// ============================================================
// ПОМОЩНИ ФУНКЦИИ
// ============================================================

/**
 * Конвертира BGN в EUR
 */
export const bgnToEur = (bgn) => bgn / EUR_BGN_RATE;

/**
 * Конвертира EUR в BGN
 */
export const eurToBgn = (eur) => eur * EUR_BGN_RATE;

/**
 * Изчислява възраст от дата на раждане
 */
export const calculateAge = (birthDate, referenceDate = new Date()) => {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const ref = new Date(referenceDate);
  return (ref - birth) / (DAYS_PER_YEAR * 24 * 60 * 60 * 1000);
};

/**
 * Изчислява години до пенсия
 */
export const calculateYearsToRetirement = (currentAge, retirementAge = 65) => {
  return Math.max(0, retirementAge - currentAge);
};

/**
 * Изчислява години до образование на дете
 */
export const calculateYearsToEducation = (childBirthDate, educationAge = 18) => {
  const childAge = calculateAge(childBirthDate);
  return Math.max(0, educationAge - childAge);
};

/**
 * VLOOKUP емулация - търси в таблица
 */
export const vlookup = (searchValue, table, exactMatch = false) => {
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  
  if (exactMatch) {
    return table[searchValue] ?? null;
  }
  
  // Намираме най-близката по-малка или равна стойност
  let result = null;
  for (const key of keys) {
    if (key <= searchValue) {
      result = table[key];
    } else {
      break;
    }
  }
  return result;
};

/**
 * Изчислява тарифа за срочна застраховка
 */
export const getTermLifeRate = (age, term, gender, isSmoker) => {
  const tableKey = `${gender}_${isSmoker ? 'smoker' : 'nonsmoker'}`;
  const ageTable = TERM_LIFE_RATES[tableKey];
  
  if (!ageTable) return 0;
  
  // Намираме най-близката възраст
  const ages = Object.keys(ageTable).map(Number).sort((a, b) => a - b);
  let selectedAge = ages[0];
  for (const a of ages) {
    if (a <= age) selectedAge = a;
    else break;
  }
  
  const termTable = ageTable[selectedAge];
  if (!termTable) return 0;
  
  // Намираме най-близкия срок
  const terms = Object.keys(termTable).map(Number).sort((a, b) => a - b);
  let selectedTerm = terms[0];
  for (const t of terms) {
    if (t <= term) selectedTerm = t;
    else break;
  }
  
  return termTable[selectedTerm] || 0;
};

/**
 * Изчислява бъдеща стойност на редовни вноски (FV)
 */
export const calculateFutureValue = (monthlyPayment, years, annualReturn) => {
  const monthlyRate = annualReturn / 12;
  const months = years * 12;
  
  if (monthlyRate === 0) {
    return monthlyPayment * months;
  }
  
  return monthlyPayment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
};

/**
 * Изчислява необходима месечна вноска за достигане на цел (PMT)
 */
export const calculateMonthlyPayment = (targetValue, years, annualReturn) => {
  const monthlyRate = annualReturn / 12;
  const months = years * 12;
  
  if (monthlyRate === 0) {
    return targetValue / months;
  }
  
  return targetValue * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
};

/**
 * Изчислява трудов капитал (Labor Capital)
 */
export const calculateLaborCapital = (monthlyIncome, yearsToRetirement, growthRate = 0.03) => {
  // Сума от бъдещи доходи с ръст
  let total = 0;
  let currentIncome = monthlyIncome * 12; // годишен доход
  
  for (let year = 0; year < yearsToRetirement; year++) {
    total += currentIncome;
    currentIncome *= (1 + growthRate);
  }
  
  return total;
};

/**
 * Изчислява нужда от защита на дохода
 */
export const calculateProtectionNeed = (monthlyIncome, monthlyExpenses, liabilities, yearsToRetirement) => {
  // Базова нужда = месечен доход * 60 месеца (5 години)
  const baseNeed = monthlyIncome * MODEL_COEFFICIENTS.PROTECTION_MONTHS;
  
  // Добавяме задължения
  const totalLiabilities = liabilities || 0;
  
  // Коефициент за години до пенсия (повече години = повече нужда)
  const yearsFactor = Math.min(yearsToRetirement / 30, 1.5);
  
  return (baseNeed + totalLiabilities) * yearsFactor;
};

/**
 * Изчислява нужда от резерв
 */
export const calculateReserveNeed = (monthlyExpenses, desiredMonths = 6) => {
  return monthlyExpenses * desiredMonths;
};

/**
 * Изчислява пенсионен дефицит
 */
export const calculatePensionGap = (desiredPension, expectedStatePension, yearsInRetirement = 20) => {
  const monthlyGap = Math.max(0, desiredPension - expectedStatePension);
  return monthlyGap * 12 * yearsInRetirement;
};

/**
 * Изчислява премия за срочна застраховка
 */
export const calculateTermLifePremium = (coverageAmount, age, termYears, gender, isSmoker) => {
  const rate = getTermLifeRate(Math.floor(age), termYears, gender, isSmoker);
  
  // Премия = (покритие / 1000) * тарифа
  const annualPremium = (coverageAmount / 1000) * rate;
  
  return {
    monthly: annualPremium / 12,
    annual: annualPremium,
    total: annualPremium * termYears,
    rate: rate
  };
};

/**
 * Изчислява UL инвестиция с такси (според Excel формули)
 */
export const calculateULInvestment = (monthlyPremium, years, strategy, oneTimeDeposit = 0) => {
  const annualReturn = STRATEGY_RETURNS[strategy] || STRATEGY_RETURNS.balanced;
  const entryFee = UL_FEES.entry_fee_percent / 100;
  const managementFee = UL_FEES.management_fee_percent / 100;
  
  // Нетна вноска след входна такса (3%)
  const netMonthly = monthlyPremium * (1 - entryFee);
  const netOneTime = oneTimeDeposit * (1 - entryFee);
  
  // Ефективна годишна доходност след такса за управление (1.5%)
  const effectiveReturn = annualReturn - managementFee;
  const monthlyRate = effectiveReturn / 12;
  
  // FV формула от Excel: -FV(rate, nper, pmt, pv, 0)
  const months = years * 12;
  let fvMonthly = 0;
  
  if (monthlyRate === 0) {
    fvMonthly = netMonthly * months;
  } else {
    // Excel FV формула за редовни вноски
    fvMonthly = netMonthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  }
  
  // Еднократен депозит
  const fvOneTime = netOneTime * Math.pow(1 + monthlyRate, months);
  
  const totalInvested = (monthlyPremium * 12 * years) + oneTimeDeposit;
  const expectedValue = fvMonthly + fvOneTime;
  const totalReturn = expectedValue - totalInvested;
  
  return {
    totalInvested,
    expectedValue: Math.round(expectedValue),
    totalReturn: Math.round(totalReturn),
    returnPercent: totalInvested > 0 ? ((expectedValue / totalInvested) - 1) * 100 : 0,
    effectiveReturn: effectiveReturn * 100,
    monthlyRate: monthlyRate * 100
  };
};

/**
 * Изчислява данъчно облекчение за пенсионни вноски
 */
export const calculateTaxBenefit = (annualPremium, annualIncome) => {
  const maxDeductible = Math.min(
    annualPremium,
    annualIncome * PENSION_PLAN_RATES.tax_benefit_percent,
    PENSION_PLAN_RATES.tax_benefit_max_bgn
  );
  
  // Данъчна ставка 10%
  const taxSaved = maxDeductible * 0.10;
  
  return {
    deductibleAmount: maxDeductible,
    taxSaved: taxSaved,
    effectiveRate: (taxSaved / annualPremium) * 100
  };
};