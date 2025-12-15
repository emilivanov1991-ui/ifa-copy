// ============================================================
// ИНСТИНКТ "ЗАКРИЛА НА ДОМА" - ТАРИФИ И КОНСТАНТИ
// ЗД "Инстинкт" АД - Имуществена застраховка
// ============================================================

// Валутен курс EUR/BGN
export const EUR_BGN_RATE = 1.96;

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
  currency: 'EUR',
  available_packages: ['Пакет 1', 'Пакет 2', 'Пакет 3', 'Персонализиран'],
  payment_methods: ['annual', 'installments']
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
 * Изчислява премия за Инстинкт "Закрила на дома"
 * @param {number} sumInsured - Застрахователна сума в EUR
 * @param {string} packageType - Тип пакет
 * @returns {object} Премия в BGN и EUR
 */
export const calculateInstinctHomePremium = (sumInsured, packageType = 'custom') => {
  // Използваме пакетите ако са избрани
  if (packageType === 'Пакет 1') {
    return {
      eligible: true,
      sumInsured: INSTINCT_PACKAGES.package_1.sum_insured,
      annualPremiumBGN: INSTINCT_PACKAGES.package_1.premium_bgn,
      annualPremiumEUR: INSTINCT_PACKAGES.package_1.premium_eur,
      monthlyPremiumBGN: (INSTINCT_PACKAGES.package_1.premium_bgn / 12).toFixed(2),
      monthlyPremiumEUR: (INSTINCT_PACKAGES.package_1.premium_eur / 12).toFixed(2)
    };
  }
  
  if (packageType === 'Пакет 2') {
    return {
      eligible: true,
      sumInsured: INSTINCT_PACKAGES.package_2.sum_insured,
      annualPremiumBGN: INSTINCT_PACKAGES.package_2.premium_bgn,
      annualPremiumEUR: INSTINCT_PACKAGES.package_2.premium_eur,
      monthlyPremiumBGN: (INSTINCT_PACKAGES.package_2.premium_bgn / 12).toFixed(2),
      monthlyPremiumEUR: (INSTINCT_PACKAGES.package_2.premium_eur / 12).toFixed(2)
    };
  }
  
  if (packageType === 'Пакет 3') {
    return {
      eligible: true,
      sumInsured: INSTINCT_PACKAGES.package_3.sum_insured,
      annualPremiumBGN: INSTINCT_PACKAGES.package_3.premium_bgn,
      annualPremiumEUR: INSTINCT_PACKAGES.package_3.premium_eur,
      monthlyPremiumBGN: (INSTINCT_PACKAGES.package_3.premium_bgn / 12).toFixed(2),
      monthlyPremiumEUR: (INSTINCT_PACKAGES.package_3.premium_eur / 12).toFixed(2)
    };
  }

  // Персонализиран пакет - линейна интерполация
  if (sumInsured < INSTINCT_RULES.min_sum || sumInsured > INSTINCT_RULES.max_sum) {
    return {
      eligible: false,
      reason: `Застрахователната сума трябва да е между ${INSTINCT_RULES.min_sum.toLocaleString()} и ${INSTINCT_RULES.max_sum.toLocaleString()} EUR`
    };
  }

  // Намираме най-близките суми в таблицата
  const amounts = Object.keys(INSTINCT_DETAILED_TARIFFS).map(Number).sort((a, b) => a - b);
  
  // Точно съвпадение
  if (INSTINCT_DETAILED_TARIFFS[sumInsured]) {
    const tariff = INSTINCT_DETAILED_TARIFFS[sumInsured];
    return {
      eligible: true,
      sumInsured: sumInsured,
      annualPremiumBGN: tariff.bgn,
      annualPremiumEUR: tariff.eur,
      monthlyPremiumBGN: (tariff.bgn / 12).toFixed(2),
      monthlyPremiumEUR: (tariff.eur / 12).toFixed(2)
    };
  }

  // Интерполация между най-близките стойности
  let lowerAmount = amounts[0];
  let upperAmount = amounts[amounts.length - 1];
  
  for (let i = 0; i < amounts.length - 1; i++) {
    if (amounts[i] <= sumInsured && amounts[i + 1] >= sumInsured) {
      lowerAmount = amounts[i];
      upperAmount = amounts[i + 1];
      break;
    }
  }

  const lowerTariff = INSTINCT_DETAILED_TARIFFS[lowerAmount];
  const upperTariff = INSTINCT_DETAILED_TARIFFS[upperAmount];
  
  // Линейна интерполация
  const ratio = (sumInsured - lowerAmount) / (upperAmount - lowerAmount);
  const premiumBGN = lowerTariff.bgn + (upperTariff.bgn - lowerTariff.bgn) * ratio;
  const premiumEUR = lowerTariff.eur + (upperTariff.eur - lowerTariff.eur) * ratio;

  return {
    eligible: true,
    sumInsured: sumInsured,
    annualPremiumBGN: Math.round(premiumBGN * 100) / 100,
    annualPremiumEUR: Math.round(premiumEUR * 100) / 100,
    monthlyPremiumBGN: Math.round((premiumBGN / 12) * 100) / 100,
    monthlyPremiumEUR: Math.round((premiumEUR / 12) * 100) / 100
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