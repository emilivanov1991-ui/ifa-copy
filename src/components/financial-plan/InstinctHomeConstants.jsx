// ============================================================
// ИНСТИНКТ "ЗАКРИЛА НА ДОМА" - ТАРИФИ И КОНСТАНТИ
// ЗД "Инстинкт" АД - Имуществена застраховка
// ============================================================

// Валутен курс EUR/BGN
export const EUR_BGN_RATE = 1.96;

// Разпределение недвижимо/движимо имущество
export const PROPERTY_SPLIT = {
  immovable: 0.85, // 85% недвижимо
  movable: 0.15    // 15% движимо
};

// Коефициенти за изчисление на покритията (от Excel таблицата)
export const INSTINCT_COVERAGE_FORMULAS = {
  // Пожар, Мълния, Буря и др. природни бедствия
  fire_perils: {
    immovable: 0.85,
    movable: 0.15,
    mandatory: true
  },
  // Свличане и срутване на земни пластове - cap при 201000 BGN
  landslide: {
    immovable_coef: 0.0637499,
    movable_coef: 0.01125,
    cap_threshold: 201000,
    cap_immovable: 12750,
    cap_movable: 2250,
    mandatory: true
  },
  // Изтичане на вода и пара
  water_leakage: {
    immovable: 0.85,
    movable: 0.15,
    mandatory: true
  },
  // Гражданска отговорност (фиксирана)
  liability: {
    fixed: 2000,
    mandatory: true
  },
  // Земетресение
  earthquake: {
    immovable: 0.7,
    movable: 0.15,
    mandatory: true
  },
  // Злоумишлени действия, вкл. Палеж
  vandalism: {
    immovable: 0.34,
    movable: 0.06,
    mandatory: true
  },
  // Удар от пътно превозно средство
  vehicle_impact: {
    immovable: 0.85,
    movable: 0.15,
    mandatory: true
  },
  // Допълнителни разходи за разчистване
  cleanup_costs: {
    immovable: 0.0425,
    movable: 0.007499,
    mandatory: true
  },
  // Замръзване
  freezing: {
    immovable: 0.85,
    movable: 0.15,
    mandatory: true
  },
  // Тежест от естествено натрупване на сняг и лед
  snow_ice: {
    immovable: 0.85,
    movable: 0.15,
    mandatory: true
  },
  // Счупване на стъкла (фиксирано)
  glass: {
    fixed_immovable: 10000,
    fixed_movable: 10000,
    mandatory: true
  },
  // Късо съединение и токов удар
  short_circuit: {
    immovable: 0.85,
    movable: 0.15,
    mandatory: true
  },
  // Кражба чрез взлом - cap при 201000 BGN -> 15000 лимит
  theft: {
    coefficient: 0.075,
    cap_threshold: 201000,
    cap_value: 15000,
    mandatory: true
  },
  // Временно настаняване (фиксирано)
  temporary_accommodation: {
    fixed: 3000,
    mandatory: true
  },
  // Домашен любимец (фиксирано)
  pet: {
    fixed: 500,
    mandatory: true
  },
  // Хоби и спорт
  hobby_sport: {
    immovable: 0.045,
    movable: 0.03,
    mandatory: false
  },
  // Транспорт при смяна на адрес
  relocation_transport: {
    coefficient: 0.045,
    mandatory: false
  }
};

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
 * Изчислява премия за Инстинкт "Закрила на дома" според Excel таблицата
 * @param {number} sumInsured - Застрахователна сума в BGN
 * @param {string} packageType - Тип пакет
 * @param {object} options - Опции за изчисление
 * @returns {object} Премия в BGN и EUR с разбивка по покрития
 */
export const calculateInstinctHomePremium = (sumInsured, packageType = 'custom', options = {}) => {
  const { includeSport = false, includeRelocation = false } = options;

  // Валидация
  if (sumInsured < INSTINCT_RULES.min_sum || sumInsured > INSTINCT_RULES.max_sum) {
    return {
      eligible: false,
      reason: `Застрахователната сума трябва да е між ${INSTINCT_RULES.min_sum.toLocaleString()} и ${INSTINCT_RULES.max_sum.toLocaleString()} BGN`
    };
  }

  // Използваме директно тарифната таблица за фиксираните пакети
  if (packageType === 'Пакет 1') {
    const pkg = INSTINCT_PACKAGES.package_1;
    const coverages = INSTINCT_PACKAGE_COVERAGES.package_1;
    return {
      eligible: true,
      sumInsured: pkg.sum_insured,
      immovable: pkg.sum_insured * PROPERTY_SPLIT.immovable,
      movable: pkg.sum_insured * PROPERTY_SPLIT.movable,
      annualPremiumBGN: pkg.premium_bgn,
      annualPremiumEUR: pkg.premium_eur,
      monthlyPremiumBGN: (pkg.premium_bgn / 12).toFixed(2),
      monthlyPremiumEUR: (pkg.premium_eur / 12).toFixed(2),
      coverages: coverages
    };
  }
  
  if (packageType === 'Пакет 2') {
    const pkg = INSTINCT_PACKAGES.package_2;
    const coverages = INSTINCT_PACKAGE_COVERAGES.package_2;
    return {
      eligible: true,
      sumInsured: pkg.sum_insured,
      immovable: pkg.sum_insured * PROPERTY_SPLIT.immovable,
      movable: pkg.sum_insured * PROPERTY_SPLIT.movable,
      annualPremiumBGN: pkg.premium_bgn,
      annualPremiumEUR: pkg.premium_eur,
      monthlyPremiumBGN: (pkg.premium_bgn / 12).toFixed(2),
      monthlyPremiumEUR: (pkg.premium_eur / 12).toFixed(2),
      coverages: coverages
    };
  }
  
  if (packageType === 'Пакет 3') {
    const pkg = INSTINCT_PACKAGES.package_3;
    const coverages = INSTINCT_PACKAGE_COVERAGES.package_3;
    return {
      eligible: true,
      sumInsured: pkg.sum_insured,
      immovable: pkg.sum_insured * PROPERTY_SPLIT.immovable,
      movable: pkg.sum_insured * PROPERTY_SPLIT.movable,
      annualPremiumBGN: pkg.premium_bgn,
      annualPremiumEUR: pkg.premium_eur,
      monthlyPremiumBGN: (pkg.premium_bgn / 12).toFixed(2),
      monthlyPremiumEUR: (pkg.premium_eur / 12).toFixed(2),
      coverages: coverages
    };
  }

  // Персонализиран пакет - използваме формулите от Excel за суми >= 151000
  const immovable = sumInsured * PROPERTY_SPLIT.immovable;
  const movable = sumInsured * PROPERTY_SPLIT.movable;
  
  const coverages = {};
  
  // Пожар и свързани природни бедствия
  coverages.fire_immovable = immovable;
  coverages.fire_movable = movable;
  
  // Свличане и срутване - с cap при 201000 BGN
  if (sumInsured >= INSTINCT_COVERAGE_FORMULAS.landslide.cap_threshold) {
    coverages.landslide_immovable = INSTINCT_COVERAGE_FORMULAS.landslide.cap_immovable;
    coverages.landslide_movable = INSTINCT_COVERAGE_FORMULAS.landslide.cap_movable;
  } else {
    coverages.landslide_immovable = sumInsured * INSTINCT_COVERAGE_FORMULAS.landslide.immovable_coef;
    coverages.landslide_movable = sumInsured * INSTINCT_COVERAGE_FORMULAS.landslide.movable_coef;
  }
  
  // Изтичане на вода
  coverages.water_immovable = immovable;
  coverages.water_movable = movable;
  
  // Гражданска отговорност (фиксирано)
  coverages.liability = INSTINCT_COVERAGE_FORMULAS.liability.fixed;
  
  // Земетресение
  coverages.earthquake_immovable = sumInsured * INSTINCT_COVERAGE_FORMULAS.earthquake.immovable;
  coverages.earthquake_movable = sumInsured * INSTINCT_COVERAGE_FORMULAS.earthquake.movable;
  
  // Злоумишлени действия
  coverages.vandalism_immovable = sumInsured * INSTINCT_COVERAGE_FORMULAS.vandalism.immovable;
  coverages.vandalism_movable = sumInsured * INSTINCT_COVERAGE_FORMULAS.vandalism.movable;
  
  // Удар от ПТС
  coverages.vehicle_immovable = immovable;
  coverages.vehicle_movable = movable;
  
  // Разчистване
  coverages.cleanup_immovable = sumInsured * INSTINCT_COVERAGE_FORMULAS.cleanup_costs.immovable;
  coverages.cleanup_movable = sumInsured * INSTINCT_COVERAGE_FORMULAS.cleanup_costs.movable;
  
  // Замръзване
  coverages.freezing_immovable = immovable;
  coverages.freezing_movable = movable;
  
  // Сняг и лед
  coverages.snow_immovable = immovable;
  coverages.snow_movable = movable;
  
  // Счупване на стъкла (фиксирано)
  coverages.glass_immovable = INSTINCT_COVERAGE_FORMULAS.glass.fixed_immovable;
  coverages.glass_movable = INSTINCT_COVERAGE_FORMULAS.glass.fixed_movable;
  
  // Късо съединение
  coverages.short_circuit_immovable = immovable;
  coverages.short_circuit_movable = movable;
  
  // Кражба - с cap при 201000 BGN -> 15000 лимит
  if (sumInsured >= INSTINCT_COVERAGE_FORMULAS.theft.cap_threshold) {
    coverages.theft = INSTINCT_COVERAGE_FORMULAS.theft.cap_value;
  } else {
    coverages.theft = sumInsured * INSTINCT_COVERAGE_FORMULAS.theft.coefficient;
  }
  
  // Временно настаняване
  coverages.temporary_accommodation = INSTINCT_COVERAGE_FORMULAS.temporary_accommodation.fixed;
  
  // Домашен любимец
  coverages.pet = INSTINCT_COVERAGE_FORMULAS.pet.fixed;
  
  // Хоби и спорт (опционално)
  if (includeSport) {
    coverages.hobby_sport_immovable = sumInsured * INSTINCT_COVERAGE_FORMULAS.hobby_sport.immovable;
    coverages.hobby_sport_movable = sumInsured * INSTINCT_COVERAGE_FORMULAS.hobby_sport.movable;
  }
  
  // Транспорт при смяна на адрес (опционално)
  if (includeRelocation) {
    coverages.relocation_transport = sumInsured * INSTINCT_COVERAGE_FORMULAS.relocation_transport.coefficient;
  }

  // Изчисляване на премията чрез линейна интерполация от тарифната таблица
  const amounts = Object.keys(INSTINCT_DETAILED_TARIFFS).map(Number).sort((a, b) => a - b);
  
  let premiumBGN;
  
  if (INSTINCT_DETAILED_TARIFFS[sumInsured]) {
    premiumBGN = INSTINCT_DETAILED_TARIFFS[sumInsured].bgn;
  } else {
    // Интерполация
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
    const ratio = (sumInsured - lowerAmount) / (upperAmount - lowerAmount);
    premiumBGN = lowerTariff.bgn + (upperTariff.bgn - lowerTariff.bgn) * ratio;
  }
  
  premiumBGN = Math.ceil(premiumBGN * 100) / 100;
  const premiumEUR = Math.ceil((premiumBGN / EUR_BGN_RATE) * 100) / 100;

  return {
    eligible: true,
    sumInsured: sumInsured,
    immovable: Math.round(immovable),
    movable: Math.round(movable),
    annualPremiumBGN: premiumBGN,
    annualPremiumEUR: premiumEUR,
    monthlyPremiumBGN: Math.round((premiumBGN / 12) * 100) / 100,
    monthlyPremiumEUR: Math.round((premiumEUR / 12) * 100) / 100,
    coverages: coverages
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