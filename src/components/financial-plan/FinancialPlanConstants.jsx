// Ключови коефициенти от Excel файла
export const CONSTANTS = {
  // Основен коефициент за капитализация/надуване на суми
  CAPITAL_MULTIPLIER: 1.96,
  
  // Конвертиране дни в години
  DAYS_PER_YEAR: 365.25,
  
  // Пенсионни възрасти по подразбиране
  DEFAULT_RETIREMENT_AGE_MALE: 65,
  DEFAULT_RETIREMENT_AGE_FEMALE: 63,
  
  // Коефициенти за инвестиции (CZ4, CZ13 от Excel)
  INVESTMENT_COEFFICIENT_CZ4: 1.0,
  INVESTMENT_COEFFICIENT_CZ13: 1.0,
  
  // Очаквана доходност по стратегии
  STRATEGY_RETURNS: {
    conservative: 0.03,
    balanced: 0.05,
    dynamic: 0.07,
    aggressive: 0.09
  },
  
  // Такси по стратегии
  STRATEGY_FEES: {
    conservative: 0.01,
    balanced: 0.015,
    dynamic: 0.02,
    aggressive: 0.025
  },
  
  // Социални осигуровки - държавна пенсия като % от дохода
  STATE_PENSION_REPLACEMENT_RATE: 0.35,
  
  // Минимална препоръчителна защита (месечен доход x месеци)
  PROTECTION_MONTHS_MULTIPLIER: 60,
  
  // Валидност на плана в дни
  PLAN_VALIDITY_DAYS: 30
};

// Продуктови тарифи по подразбиране (докато не се заредят от базата)
export const DEFAULT_PRODUCT_RATES = {
  term_life: {
    // Тарифа на 1000 EUR за срочна застраховка живот
    // Възраст → тарифа годишно
    rates: {
      25: 0.8, 30: 1.0, 35: 1.3, 40: 1.8, 45: 2.5, 50: 3.5, 55: 5.0, 60: 7.5
    },
    smoker_multiplier: 1.5,
    min_term: 5,
    max_term: 30
  },
  
  ul_investment: {
    // Коефициенти за UL инвестиции
    min_monthly: 30,
    entry_fee: 0.03,
    management_fee: 0.015,
    strategies: ['conservative', 'balanced', 'dynamic', 'aggressive']
  },
  
  education_plan: {
    // Таблица за образователни планове
    // Години до образование → коефициент
    coefficients: {
      5: 0.85, 6: 0.82, 7: 0.79, 8: 0.76, 9: 0.73, 10: 0.70,
      11: 0.67, 12: 0.64, 13: 0.61, 14: 0.58, 15: 0.55,
      16: 0.52, 17: 0.49, 18: 0.46
    },
    min_monthly: 25
  },
  
  mlc_health: {
    // ML Care тарифи по възраст
    rates: {
      25: 15, 30: 18, 35: 22, 40: 28, 45: 35, 50: 45, 55: 60, 60: 80
    }
  },
  
  pension_plan: {
    // Пенсионни планове
    min_monthly: 50,
    max_tax_benefit: 2400, // годишен данъчен облек
    expected_return: 0.05
  },
  
  personal_accident: {
    // Лична злополука
    rate_per_10000: 2.5
  }
};

// Помощни функции за изчисления
export const calculateAge = (birthDate, referenceDate = new Date()) => {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const ref = new Date(referenceDate);
  return (ref - birth) / (CONSTANTS.DAYS_PER_YEAR * 24 * 60 * 60 * 1000);
};

export const calculateYearsToRetirement = (currentAge, retirementAge) => {
  return Math.max(0, retirementAge - currentAge);
};

export const calculateYearsToEducation = (childBirthDate, educationAge = 18) => {
  const childAge = calculateAge(childBirthDate);
  return Math.max(0, educationAge - childAge);
};

// VLOOKUP емулация - търси стойност в таблица
export const vlookup = (searchValue, table, roundDown = true) => {
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  
  if (roundDown) {
    // Намира най-близката по-малка или равна стойност
    let result = table[keys[0]];
    for (const key of keys) {
      if (key <= searchValue) {
        result = table[key];
      } else {
        break;
      }
    }
    return result;
  } else {
    // Намира точна стойност или най-близка
    const exactMatch = table[searchValue];
    if (exactMatch !== undefined) return exactMatch;
    
    // Интерполация
    let lowerKey = keys[0];
    let upperKey = keys[keys.length - 1];
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (keys[i] <= searchValue && keys[i + 1] > searchValue) {
        lowerKey = keys[i];
        upperKey = keys[i + 1];
        break;
      }
    }
    
    const lowerVal = table[lowerKey];
    const upperVal = table[upperKey];
    const ratio = (searchValue - lowerKey) / (upperKey - lowerKey);
    
    return lowerVal + (upperVal - lowerVal) * ratio;
  }
};

// Изчисление на бъдеща стойност на редовни вноски
export const calculateFutureValue = (monthlyPayment, years, annualReturn) => {
  const monthlyRate = annualReturn / 12;
  const months = years * 12;
  
  if (monthlyRate === 0) {
    return monthlyPayment * months;
  }
  
  return monthlyPayment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
};

// Изчисление на необходима месечна вноска за достигане на цел
export const calculateMonthlyPayment = (targetValue, years, annualReturn) => {
  const monthlyRate = annualReturn / 12;
  const months = years * 12;
  
  if (monthlyRate === 0) {
    return targetValue / months;
  }
  
  return targetValue * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
};

// Изчисление на премия за срочна застраховка
export const calculateTermLifePremium = (coverageAmount, age, termYears, isSmoker = false, gender = 'male') => {
  const baseRate = vlookup(Math.floor(age), DEFAULT_PRODUCT_RATES.term_life.rates);
  let rate = baseRate;
  
  if (isSmoker) {
    rate *= DEFAULT_PRODUCT_RATES.term_life.smoker_multiplier;
  }
  
  // Годишна премия на 1000 EUR покритие
  const annualPremium = (coverageAmount / 1000) * rate;
  
  return {
    monthly: annualPremium / 12,
    annual: annualPremium,
    total: annualPremium * termYears
  };
};