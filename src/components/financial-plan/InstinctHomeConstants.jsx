// ============================================================
// ИНСТИНКТ "ЗАКРИЛА НА ДОМА" - ТАРИФИ И КОНСТАНТИ
// ЗД "Инстинкт" АД - Имуществена застраховка
// ============================================================

// Валутен курс EUR/BGN
export const EUR_BGN_RATE = 1.96;

// Коефициенти и капове за покритията (от Excel модела)
export const INSTINCT_COVERAGE_COEFFICIENTS = {
  FIRE: { coefficient: 1.0, cap: null, mandatory: true, name: 'Пожар и природни бедствия' },
  WATER: { coefficient: 0.085, cap: 15000, mandatory: true, name: 'Изтичане на вода' },
  THEFT: { coefficient: 0.03, cap: 15000, mandatory: true, name: 'Кражба чрез взлом' },
  SPORT: { coefficient: 0.024, cap: 12000, mandatory: false, name: 'Спортна екипировка' }
};

// Данък върху застраховката
export const INSURANCE_TAX = 0.02;

// Основни пакети (от тарифната таблица)
export const INSTINCT_PACKAGES = {
  package_1: {
    name: 'Пакет 1',
    sum_insured: 50000,
    premium_bgn: 65.33,
    premium_eur: 33.40
  },
  package_2: {
    name: 'Пакет 2',
    sum_insured: 100000,
    premium_bgn: 126.66,
    premium_eur: 64.76
  },
  package_3: {
    name: 'Пакет 3',
    sum_insured: 150000,
    premium_bgn: 180.00,
    premium_eur: 92.03
  }
};

// Детайлна тарифна таблица (извадка от файла)
// Пълна таблица с премии от 151000 до 500000 EUR
export const INSTINCT_DETAILED_TARIFFS = {
  150000: { bgn: 180.00, eur: 92.03 },
  151000: { bgn: 197.80, eur: 101.13 },
  160000: { bgn: 207.10, eur: 105.89 },
  170000: { bgn: 217.42, eur: 111.17 },
  180000: { bgn: 227.78, eur: 116.46 },
  190000: { bgn: 238.14, eur: 121.76 },
  200000: { bgn: 248.52, eur: 127.07 },
  210000: { bgn: 256.46, eur: 131.13 },
  220000: { bgn: 264.36, eur: 135.17 },
  230000: { bgn: 272.20, eur: 139.17 },
  240000: { bgn: 280.12, eur: 143.22 },
  250000: { bgn: 288.03, eur: 147.27 },
  260000: { bgn: 295.92, eur: 151.30 },
  270000: { bgn: 303.77, eur: 155.32 },
  280000: { bgn: 311.39, eur: 159.21 },
  290000: { bgn: 319.02, eur: 163.11 },
  300000: { bgn: 326.63, eur: 167.00 },
  310000: { bgn: 334.29, eur: 170.92 },
  320000: { bgn: 341.88, eur: 174.80 },
  330000: { bgn: 349.55, eur: 178.72 },
  340000: { bgn: 357.23, eur: 182.65 },
  350000: { bgn: 364.86, eur: 186.55 },
  360000: { bgn: 372.44, eur: 190.43 },
  370000: { bgn: 380.09, eur: 194.34 },
  380000: { bgn: 387.75, eur: 198.25 },
  390000: { bgn: 395.36, eur: 202.14 },
  400000: { bgn: 403.01, eur: 206.06 },
  410000: { bgn: 410.64, eur: 209.96 },
  420000: { bgn: 418.31, eur: 213.88 },
  430000: { bgn: 425.90, eur: 217.76 },
  440000: { bgn: 433.53, eur: 221.66 },
  450000: { bgn: 441.20, eur: 225.58 },
  460000: { bgn: 448.85, eur: 229.49 },
  470000: { bgn: 456.49, eur: 233.40 },
  480000: { bgn: 464.14, eur: 237.31 },
  490000: { bgn: 471.77, eur: 241.21 },
  500000: { bgn: 479.41, eur: 245.12 }
};

// Правила за продукта
export const INSTINCT_RULES = {
  min_sum: 50000,
  max_sum: 500000,
  currency: 'BGN',
  available_packages: ['Пакет 1', 'Пакет 2', 'Пакет 3', 'Персонализиран'],
  payment_methods: ['annual', 'installments'],
  contract_term_months: 12,
  building_requirements: [
    'Въведена в експлоатация',
    'Масивна конструкция (тухли/стоманобетон)',
    'Обитавана постоянно',
    'Не оставена без надзор над 60 дни'
  ]
};

// Покрития включени в "Закрила на дома"
export const INSTINCT_COVERAGES = [
  'Пожар, Мълния, Буря',
  'Пороен дъжд, Градушка',
  'Наводнение вследствие на природни бедствия',
  'Експлозия, Имплозия',
  'Падане на летателен апарат',
  'Свличане и срутване на земни пластове',
  'Изтичане на вода и пара',
  'Гражданска отговорност към трети лица',
  'Земетресение',
  'Злоумишлени действия, вкл. Палеж',
  'Удар от пътно превозно средство',
  'Допълнителни разходи за разчистване',
  'Замръзване',
  'Тежест от сняг и лед',
  'Счупване на стъкла',
  'Късо съединение и токов удар',
  'Кражба чрез взлом, техническо средство или грабеж',
  'Разходи за временно настаняване',
  'Медицински преглед или обезщетение при смърт на домашен любимец',
  'Съоръжения и екипировка за хобита и спортове',
  'Щети на движимо имущество при транспорт',
  'Щети на движимо имущество на два адреса (14 дни)'
];

/**
 * Изчислява премия за Инстинкт "Закрила на дома" по правилната формула
 * Формула: BasePremium = SUM(min(tariff * coefficient, cap))
 * Tax = BasePremium * 2%
 * FinalPremium = ceil((BasePremium + Tax)*100)/100
 * 
 * @param {number} sumInsured - Застрахователна сума в BGN
 * @param {string} packageType - Тип пакет
 * @param {boolean} includeSport - Включва ли спортна екипировка
 * @returns {object} Премия в BGN и EUR с разбивка по покрития
 */
export const calculateInstinctHomePremium = (sumInsured, packageType = 'custom', includeSport = false) => {
  // Валидация
  if (sumInsured < INSTINCT_RULES.min_sum || sumInsured > INSTINCT_RULES.max_sum) {
    return {
      eligible: false,
      reason: `Застрахователната сума трябва да е между ${INSTINCT_RULES.min_sum.toLocaleString()} и ${INSTINCT_RULES.max_sum.toLocaleString()} BGN`
    };
  }

  // Използваме директно тарифната таблица за пакетите
  if (packageType === 'Пакет 1') {
    return {
      eligible: true,
      sumInsured: INSTINCT_PACKAGES.package_1.sum_insured,
      basePremium: INSTINCT_PACKAGES.package_1.premium_bgn / 1.02,
      annualPremiumBGN: INSTINCT_PACKAGES.package_1.premium_bgn,
      annualPremiumEUR: INSTINCT_PACKAGES.package_1.premium_eur,
      monthlyPremiumBGN: (INSTINCT_PACKAGES.package_1.premium_bgn / 12).toFixed(2),
      monthlyPremiumEUR: (INSTINCT_PACKAGES.package_1.premium_eur / 12).toFixed(2),
      breakdown: null
    };
  }
  
  if (packageType === 'Пакет 2') {
    return {
      eligible: true,
      sumInsured: INSTINCT_PACKAGES.package_2.sum_insured,
      basePremium: INSTINCT_PACKAGES.package_2.premium_bgn / 1.02,
      annualPremiumBGN: INSTINCT_PACKAGES.package_2.premium_bgn,
      annualPremiumEUR: INSTINCT_PACKAGES.package_2.premium_eur,
      monthlyPremiumBGN: (INSTINCT_PACKAGES.package_2.premium_bgn / 12).toFixed(2),
      monthlyPremiumEUR: (INSTINCT_PACKAGES.package_2.premium_eur / 12).toFixed(2),
      breakdown: null
    };
  }
  
  if (packageType === 'Пакет 3') {
    return {
      eligible: true,
      sumInsured: INSTINCT_PACKAGES.package_3.sum_insured,
      basePremium: INSTINCT_PACKAGES.package_3.premium_bgn / 1.02,
      annualPremiumBGN: INSTINCT_PACKAGES.package_3.premium_bgn,
      annualPremiumEUR: INSTINCT_PACKAGES.package_3.premium_eur,
      monthlyPremiumBGN: (INSTINCT_PACKAGES.package_3.premium_bgn / 12).toFixed(2),
      monthlyPremiumEUR: (INSTINCT_PACKAGES.package_3.premium_eur / 12).toFixed(2),
      breakdown: null
    };
  }

  // Персонализиран - използваме формулата от модела
  // BasePremium = SUM(min(tariff * coefficient, cap))
  const breakdown = {};
  let basePremium = 0;

  // FIRE - без cap, коефициент 1.0
  const firePremium = sumInsured * INSTINCT_COVERAGE_COEFFICIENTS.FIRE.coefficient;
  breakdown.fire = firePremium;
  basePremium += firePremium;

  // WATER - cap 15000, коефициент 0.085
  const waterBase = sumInsured * INSTINCT_COVERAGE_COEFFICIENTS.WATER.coefficient;
  const waterPremium = Math.min(waterBase, INSTINCT_COVERAGE_COEFFICIENTS.WATER.cap);
  breakdown.water = waterPremium;
  basePremium += waterPremium;

  // THEFT - cap 15000, коефициент 0.03
  const theftBase = sumInsured * INSTINCT_COVERAGE_COEFFICIENTS.THEFT.coefficient;
  const theftPremium = Math.min(theftBase, INSTINCT_COVERAGE_COEFFICIENTS.THEFT.cap);
  breakdown.theft = theftPremium;
  basePremium += theftPremium;

  // SPORT - опционално, cap 12000, коефициент 0.024
  if (includeSport) {
    const sportBase = sumInsured * INSTINCT_COVERAGE_COEFFICIENTS.SPORT.coefficient;
    const sportPremium = Math.min(sportBase, INSTINCT_COVERAGE_COEFFICIENTS.SPORT.cap);
    breakdown.sport = sportPremium;
    basePremium += sportPremium;
  }

  // Добавяме данък 2%
  const tax = basePremium * INSURANCE_TAX;
  
  // Final Premium = ceil((BasePremium + Tax)*100)/100
  const finalPremiumBGN = Math.ceil((basePremium + tax) * 100) / 100;
  const finalPremiumEUR = Math.ceil((finalPremiumBGN / EUR_BGN_RATE) * 100) / 100;

  return {
    eligible: true,
    sumInsured: sumInsured,
    basePremium: Math.round(basePremium * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    annualPremiumBGN: finalPremiumBGN,
    annualPremiumEUR: finalPremiumEUR,
    monthlyPremiumBGN: Math.round((finalPremiumBGN / 12) * 100) / 100,
    monthlyPremiumEUR: Math.round((finalPremiumEUR / 12) * 100) / 100,
    breakdown: breakdown
  };
};

// Покрития по пакет (от таблицата)
export const INSTINCT_PACKAGE_COVERAGES = {
  package_1: {
    property_fire: 42500,
    contents_fire: 7500,
    water_damage_property: 42500,
    water_damage_contents: 7500,
    liability: 2000,
    earthquake_property: 35000,
    earthquake_contents: 7500,
    vandalism_property: 42500,
    vandalism_contents: 7500,
    theft_limit: 4000,
    temporary_accommodation: 3000
  },
  package_2: {
    property_fire: 85000,
    contents_fire: 15000,
    water_damage_property: 85000,
    water_damage_contents: 15000,
    liability: 2000,
    earthquake_property: 70000,
    earthquake_contents: 15000,
    vandalism_property: 85000,
    vandalism_contents: 15000,
    theft_limit: 7000,
    temporary_accommodation: 3000
  },
  package_3: {
    property_fire: 127500,
    contents_fire: 22500,
    water_damage_property: 127500,
    water_damage_contents: 22500,
    liability: 2000,
    earthquake_property: 105000,
    earthquake_contents: 22500,
    vandalism_property: 127500,
    vandalism_contents: 22500,
    theft_limit: 7000,
    temporary_accommodation: 3000
  }
};