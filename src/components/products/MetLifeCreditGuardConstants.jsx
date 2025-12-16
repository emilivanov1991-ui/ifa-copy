// MetLife Credit Guard - Пълна тарифна таблица
// Премиите са за 100,000 EUR и се мащабират пропорционално

export const CREDIT_GUARD_TARIFF = {
  // age: { term: { basic: premium, extended: premium } }
  18: { 35: { basic: 147, extended: 172 }, 30: { basic: 147, extended: 172 }, 25: { basic: 147, extended: 172 }, 20: { basic: 147, extended: 172 }, 15: { basic: 147, extended: 172 }, 10: { basic: 147, extended: 172 }, 5: { basic: 147, extended: 172 } },
  19: { 35: { basic: 147, extended: 184 }, 30: { basic: 147, extended: 184 }, 25: { basic: 147, extended: 184 }, 20: { basic: 147, extended: 184 }, 15: { basic: 147, extended: 184 }, 10: { basic: 147, extended: 184 }, 5: { basic: 147, extended: 184 } },
  20: { 35: { basic: 147, extended: 184 }, 30: { basic: 147, extended: 184 }, 25: { basic: 147, extended: 184 }, 20: { basic: 147, extended: 184 }, 15: { basic: 147, extended: 184 }, 10: { basic: 147, extended: 184 }, 5: { basic: 147, extended: 184 } },
  21: { 35: { basic: 147, extended: 184 }, 30: { basic: 147, extended: 184 }, 25: { basic: 147, extended: 184 }, 20: { basic: 147, extended: 184 }, 15: { basic: 147, extended: 184 }, 10: { basic: 147, extended: 184 }, 5: { basic: 147, extended: 184 } },
  22: { 35: { basic: 147, extended: 184 }, 30: { basic: 147, extended: 184 }, 25: { basic: 147, extended: 184 }, 20: { basic: 147, extended: 184 }, 15: { basic: 147, extended: 184 }, 10: { basic: 147, extended: 184 }, 5: { basic: 147, extended: 184 } },
  23: { 35: { basic: 160, extended: 196 }, 30: { basic: 147, extended: 184 }, 25: { basic: 147, extended: 184 }, 20: { basic: 147, extended: 184 }, 15: { basic: 147, extended: 184 }, 10: { basic: 147, extended: 184 }, 5: { basic: 147, extended: 184 } },
  24: { 35: { basic: 160, extended: 196 }, 30: { basic: 147, extended: 184 }, 25: { basic: 147, extended: 184 }, 20: { basic: 147, extended: 184 }, 15: { basic: 147, extended: 184 }, 10: { basic: 147, extended: 184 }, 5: { basic: 147, extended: 184 } },
  25: { 35: { basic: 172, extended: 209 }, 30: { basic: 160, extended: 184 }, 25: { basic: 147, extended: 184 }, 20: { basic: 147, extended: 184 }, 15: { basic: 147, extended: 184 }, 10: { basic: 147, extended: 184 }, 5: { basic: 147, extended: 184 } },
  26: { 35: { basic: 172, extended: 221 }, 30: { basic: 160, extended: 196 }, 25: { basic: 147, extended: 184 }, 20: { basic: 147, extended: 184 }, 15: { basic: 147, extended: 184 }, 10: { basic: 147, extended: 184 }, 5: { basic: 147, extended: 184 } },
  27: { 35: { basic: 184, extended: 221 }, 30: { basic: 160, extended: 209 }, 25: { basic: 147, extended: 184 }, 20: { basic: 147, extended: 184 }, 15: { basic: 147, extended: 184 }, 10: { basic: 147, extended: 184 }, 5: { basic: 147, extended: 184 } },
  28: { 35: { basic: 184, extended: 233 }, 30: { basic: 172, extended: 209 }, 25: { basic: 160, extended: 196 }, 20: { basic: 147, extended: 184 }, 15: { basic: 147, extended: 184 }, 10: { basic: 147, extended: 184 }, 5: { basic: 147, extended: 184 } },
  29: { 35: { basic: 196, extended: 245 }, 30: { basic: 184, extended: 221 }, 25: { basic: 160, extended: 196 }, 20: { basic: 147, extended: 184 }, 15: { basic: 147, extended: 184 }, 10: { basic: 147, extended: 184 }, 5: { basic: 147, extended: 184 } },
  30: { 35: { basic: 209, extended: 270 }, 30: { basic: 184, extended: 233 }, 25: { basic: 172, extended: 209 }, 20: { basic: 160, extended: 196 }, 15: { basic: 160, extended: 184 }, 10: { basic: 160, extended: 184 }, 5: { basic: 160, extended: 184 } },
  31: { 35: { basic: 221, extended: 282 }, 30: { basic: 196, extended: 258 }, 25: { basic: 184, extended: 221 }, 20: { basic: 172, extended: 209 }, 15: { basic: 160, extended: 184 }, 10: { basic: 160, extended: 184 }, 5: { basic: 160, extended: 184 } },
  32: { 35: { basic: 233, extended: 306 }, 30: { basic: 209, extended: 270 }, 25: { basic: 196, extended: 245 }, 20: { basic: 184, extended: 221 }, 15: { basic: 172, extended: 196 }, 10: { basic: 172, extended: 196 }, 5: { basic: 172, extended: 196 } },
  33: { 35: { basic: 245, extended: 331 }, 30: { basic: 221, extended: 294 }, 25: { basic: 209, extended: 258 }, 20: { basic: 184, extended: 233 }, 15: { basic: 172, extended: 209 }, 10: { basic: 172, extended: 209 }, 5: { basic: 172, extended: 209 } },
  34: { 35: { basic: 258, extended: 355 }, 30: { basic: 233, extended: 306 }, 25: { basic: 209, extended: 270 }, 20: { basic: 196, extended: 245 }, 15: { basic: 184, extended: 233 }, 10: { basic: 184, extended: 209 }, 5: { basic: 184, extended: 209 } },
  35: { 35: { basic: 282, extended: 380 }, 30: { basic: 245, extended: 331 }, 25: { basic: 233, extended: 294 }, 20: { basic: 209, extended: 270 }, 15: { basic: 196, extended: 245 }, 10: { basic: 184, extended: 221 }, 5: { basic: 184, extended: 221 } },
  36: { 30: { basic: 270, extended: 355 }, 25: { basic: 245, extended: 319 }, 20: { basic: 221, extended: 282 }, 15: { basic: 209, extended: 258 }, 10: { basic: 196, extended: 233 }, 5: { basic: 196, extended: 233 } },
  37: { 30: { basic: 282, extended: 392 }, 25: { basic: 258, extended: 343 }, 20: { basic: 233, extended: 306 }, 15: { basic: 221, extended: 282 }, 10: { basic: 209, extended: 258 }, 5: { basic: 209, extended: 245 } },
  38: { 30: { basic: 306, extended: 417 }, 25: { basic: 282, extended: 368 }, 20: { basic: 258, extended: 331 }, 15: { basic: 233, extended: 306 }, 10: { basic: 221, extended: 282 }, 5: { basic: 221, extended: 270 } },
  39: { 30: { basic: 319, extended: 453 }, 25: { basic: 294, extended: 404 }, 20: { basic: 270, extended: 355 }, 15: { basic: 245, extended: 331 }, 10: { basic: 233, extended: 294 }, 5: { basic: 233, extended: 294 } },
  40: { 30: { basic: 343, extended: 490 }, 25: { basic: 319, extended: 429 }, 20: { basic: 294, extended: 380 }, 15: { basic: 270, extended: 355 }, 10: { basic: 245, extended: 319 }, 5: { basic: 245, extended: 306 } },
  41: { 25: { basic: 331, extended: 466 }, 20: { basic: 306, extended: 417 }, 15: { basic: 282, extended: 380 }, 10: { basic: 258, extended: 343 }, 5: { basic: 245, extended: 319 } },
  42: { 25: { basic: 368, extended: 502 }, 20: { basic: 331, extended: 453 }, 15: { basic: 306, extended: 417 }, 10: { basic: 282, extended: 368 }, 5: { basic: 270, extended: 343 } },
  43: { 25: { basic: 392, extended: 551 }, 20: { basic: 355, extended: 490 }, 15: { basic: 331, extended: 453 }, 10: { basic: 306, extended: 404 }, 5: { basic: 294, extended: 368 } },
  44: { 25: { basic: 417, extended: 600 }, 20: { basic: 392, extended: 539 }, 15: { basic: 355, extended: 490 }, 10: { basic: 331, extended: 441 }, 5: { basic: 306, extended: 404 } },
  45: { 25: { basic: 453, extended: 649 }, 20: { basic: 417, extended: 588 }, 15: { basic: 392, extended: 539 }, 10: { basic: 355, extended: 478 }, 5: { basic: 331, extended: 429 } },
  46: { 20: { basic: 453, extended: 637 }, 15: { basic: 417, extended: 588 }, 10: { basic: 380, extended: 527 }, 5: { basic: 355, extended: 466 } },
  47: { 20: { basic: 490, extended: 698 }, 15: { basic: 453, extended: 637 }, 10: { basic: 417, extended: 576 }, 5: { basic: 392, extended: 515 } },
  48: { 20: { basic: 515, extended: 747 }, 15: { basic: 490, extended: 686 }, 10: { basic: 441, extended: 625 }, 5: { basic: 417, extended: 564 } },
  49: { 20: { basic: 551, extended: 821 }, 15: { basic: 515, extended: 747 }, 10: { basic: 478, extended: 686 }, 5: { basic: 453, extended: 612 } },
  50: { 20: { basic: 588, extended: 882 }, 15: { basic: 551, extended: 808 }, 10: { basic: 502, extended: 735 }, 5: { basic: 466, extended: 661 } },
  51: { 15: { basic: 588, extended: 882 }, 10: { basic: 539, extended: 796 }, 5: { basic: 502, extended: 710 } },
  52: { 15: { basic: 637, extended: 955 }, 10: { basic: 576, extended: 857 }, 5: { basic: 539, extended: 772 } },
  53: { 15: { basic: 674, extended: 1029 }, 10: { basic: 625, extended: 931 }, 5: { basic: 576, extended: 833 } },
  54: { 15: { basic: 723, extended: 1114 }, 10: { basic: 661, extended: 1004 }, 5: { basic: 600, extended: 894 } },
  55: { 15: { basic: 772, extended: 1212 }, 10: { basic: 698, extended: 1090 }, 5: { basic: 637, extended: 955 } },
  56: { 10: { basic: 759, extended: 1176 }, 5: { basic: 686, extended: 1029 } },
  57: { 10: { basic: 796, extended: 1273 }, 5: { basic: 710, extended: 1102 } },
  58: { 10: { basic: 882, extended: 1408 }, 5: { basic: 784, extended: 1237 } },
  59: { 10: { basic: 931, extended: 1530 }, 5: { basic: 833, extended: 1335 } },
  60: { 10: { basic: 1016, extended: 1677 }, 5: { basic: 918, extended: 1469 } },
  61: { 5: { basic: 967, extended: 1579 } },
  62: { 5: { basic: 1029, extended: 1714 } },
  63: { 5: { basic: 1102, extended: 1861 } },
  64: { 5: { basic: 1188, extended: 2045 } },
  65: { 5: { basic: 1273, extended: 2228 } }
};

export const CREDIT_GUARD_RULES = {
  min_age: 18,
  max_age: 65,
  min_sum: 10000,
  max_sum: 500000,
  available_terms: [5, 10, 15, 20, 25, 30, 35],
  currency: 'EUR',
  reference_sum: 100000 // Тарифите са за 100,000 EUR
};

export const CREDIT_GUARD_PACKAGES = {
  basic: {
    name: 'Основен пакет',
    coverages: [
      'Смърт',
      'Трайна загуба на работоспособност'
    ]
  },
  extended: {
    name: 'Разширен пакет',
    coverages: [
      'Смърт',
      'Трайна загуба на работоспособност',
      '40 тежки заболявания',
      'Смърт от злополука',
      'Фрактури и изгаряния'
    ]
  }
};

/**
 * Изчисляване на Credit Guard премия
 */
export function calculateCreditGuardPremium(age, sum, term, packageType = 'Основен') {
  const ageNum = parseInt(age);
  const sumNum = parseInt(sum);
  const termNum = parseInt(term);
  
  // Валидация на възраст
  if (ageNum < CREDIT_GUARD_RULES.min_age || ageNum > CREDIT_GUARD_RULES.max_age) {
    return {
      eligible: false,
      reason: `Възрастта трябва да е между ${CREDIT_GUARD_RULES.min_age} и ${CREDIT_GUARD_RULES.max_age} години`
    };
  }
  
  // Валидация на сума
  if (sumNum < CREDIT_GUARD_RULES.min_sum || sumNum > CREDIT_GUARD_RULES.max_sum) {
    return {
      eligible: false,
      reason: `Сумата трябва да е между €${CREDIT_GUARD_RULES.min_sum.toLocaleString()} и €${CREDIT_GUARD_RULES.max_sum.toLocaleString()}`
    };
  }
  
  // Проверка дали възраст + срок е допустима
  if (!CREDIT_GUARD_TARIFF[ageNum]) {
    return {
      eligible: false,
      reason: `Няма налични тарифи за възраст ${ageNum} години`
    };
  }
  
  const ageTerms = CREDIT_GUARD_TARIFF[ageNum];
  if (!ageTerms[termNum]) {
    return {
      eligible: false,
      reason: `За възраст ${ageNum} години максималният срок е ${Math.max(...Object.keys(ageTerms).map(Number))} години`
    };
  }
  
  // Проверка че възраст + срок <= 65
  if (ageNum + termNum > 65) {
    return {
      eligible: false,
      reason: `Възраст + Срок не може да надвишава 65 години (${ageNum} + ${termNum} = ${ageNum + termNum})`
    };
  }
  
  // Вземи базовата премия за 100,000 EUR
  const packageKey = packageType === 'Разширен' ? 'extended' : 'basic';
  const basePremiumFor100k = ageTerms[termNum][packageKey];
  
  // Изчисли пропорционална премия
  const scalingFactor = sumNum / CREDIT_GUARD_RULES.reference_sum;
  const annualPremium = basePremiumFor100k * scalingFactor;
  const monthlyPremium = annualPremium / 12;
  
  return {
    eligible: true,
    age: ageNum,
    term: termNum,
    coverageAmount: sumNum,
    packageType: packageType,
    annualPremium: Math.round(annualPremium * 100) / 100,
    monthlyPremium: Math.round(monthlyPremium * 100) / 100,
    basePremiumFor100k: basePremiumFor100k,
    scalingFactor: scalingFactor,
    coverages: CREDIT_GUARD_PACKAGES[packageKey].coverages
  };
}