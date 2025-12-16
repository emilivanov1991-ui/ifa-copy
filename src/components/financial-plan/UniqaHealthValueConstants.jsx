// УНИКА "Здраве и ценност Селект"
// Тарифа 16 - Лечение на критични заболявания при болничен престой

export const UNIQA_HEALTH_VALUE_PLANS = {
  europa: {
    name: 'План Европа',
    code: 'europa',
    territory: 'Европа (включително България)',
    maxCoverage: 2242300, // EUR
    dailyBenefit: 135, // EUR при болничен престой без разходи
    tariffs: {
      // age_group: { monthly, quarterly, semiannual, annual }
      '0-17': { monthly: 6.48, quarterly: 19.06, semiannual: 37.76, annual: 74.04 },
      '18-30': { monthly: 12.54, quarterly: 36.91, semiannual: 73.10, annual: 143.32 },
      '31-40': { monthly: 13.71, quarterly: 40.34, semiannual: 79.88, annual: 156.64 },
      '41-45': { monthly: 16.48, quarterly: 48.49, semiannual: 96.04, annual: 188.32 },
      '46-50': { monthly: 20.02, quarterly: 58.92, semiannual: 116.69, annual: 228.80 },
      '51-55': { monthly: 24.71, quarterly: 72.71, semiannual: 144.00, annual: 282.36 },
      '56-60': { monthly: 30.50, quarterly: 89.76, semiannual: 177.78, annual: 348.60 },
      '61-65': { monthly: 37.40, quarterly: 110.07, semiannual: 217.99, annual: 427.43 }
    }
  },
  world: {
    name: 'План Свят',
    code: 'world',
    territory: 'Световно покритие',
    maxCoverage: 2802630, // EUR
    dailyBenefit: 168, // EUR при болничен престой без разходи
    tariffs: {
      '0-17': { monthly: 12.96, quarterly: 38.13, semiannual: 75.53, annual: 148.08 },
      '18-30': { monthly: 25.08, quarterly: 73.81, semiannual: 146.19, annual: 286.64 },
      '31-40': { monthly: 27.41, quarterly: 80.67, semiannual: 159.76, annual: 313.28 },
      '41-45': { monthly: 32.96, quarterly: 96.98, semiannual: 192.08, annual: 376.64 },
      '46-50': { monthly: 40.04, quarterly: 117.83, semiannual: 233.38, annual: 457.60 },
      '51-55': { monthly: 49.41, quarterly: 145.42, semiannual: 288.00, annual: 564.72 },
      '56-60': { monthly: 61.01, quarterly: 179.52, semiannual: 355.56, annual: 697.20 },
      '61-65': { monthly: 74.80, quarterly: 220.13, semiannual: 435.97, annual: 854.85 }
    }
  }
};

export const UNIQA_HEALTH_VALUE_COVERAGES = [
  'Лечение злокачествени новообразувания (карцином)',
  'Отворени и лапароскопски операции за отстраняване на тумори',
  'Лечение на доброкачествени тумори на главата',
  'Операции на сънната артерия',
  'Байпас операции на коронарни артерии',
  'Операции на сърдечна клапа',
  'Интракардиална/транскардинална катетеризация',
  'Стент имплантация в коронарните съдове',
  'Операции на аортата',
  'Трансплантация на сърце, бял дроб, черен дроб, костен мозък, бъбреци'
];

export const UNIQA_HEALTH_VALUE_RULES = {
  min_age: 0,
  max_age: 64, // до 64 години към датата на сключване
  waiting_period: 2, // 2 месеца общ отлагателен период
  currency: 'EUR',
  payment_frequencies: ['monthly', 'quarterly', 'semiannual', 'annual']
};

// Помощна функция за определяне на възрастова група
export function getAgeGroup(age) {
  if (age <= 17) return '0-17';
  if (age <= 30) return '18-30';
  if (age <= 40) return '31-40';
  if (age <= 45) return '41-45';
  if (age <= 50) return '46-50';
  if (age <= 55) return '51-55';
  if (age <= 60) return '56-60';
  if (age <= 65) return '61-65';
  return null;
}

// Изчислява премия за Уника Здраве и ценност Селект
export function calculateUniqaHealthValue(age, plan = 'europa', frequency = 'annual') {
  const ageNum = parseInt(age);
  
  // Валидация на възраст
  if (ageNum < UNIQA_HEALTH_VALUE_RULES.min_age || ageNum > UNIQA_HEALTH_VALUE_RULES.max_age) {
    return {
      eligible: false,
      reason: `Продуктът е достъпен за възраст от ${UNIQA_HEALTH_VALUE_RULES.min_age} до ${UNIQA_HEALTH_VALUE_RULES.max_age} години`
    };
  }
  
  const ageGroup = getAgeGroup(ageNum);
  if (!ageGroup) {
    return {
      eligible: false,
      reason: 'Невалидна възрастова група'
    };
  }
  
  const selectedPlan = UNIQA_HEALTH_VALUE_PLANS[plan];
  if (!selectedPlan) {
    return {
      eligible: false,
      reason: 'Невалиден план'
    };
  }
  
  const tariff = selectedPlan.tariffs[ageGroup];
  if (!tariff) {
    return {
      eligible: false,
      reason: 'Няма налична тарифа за тази възраст'
    };
  }
  
  return {
    eligible: true,
    age: ageNum,
    ageGroup,
    plan: selectedPlan.name,
    planCode: plan,
    territory: selectedPlan.territory,
    maxCoverage: selectedPlan.maxCoverage,
    dailyBenefit: selectedPlan.dailyBenefit,
    premiums: {
      monthly: tariff.monthly,
      quarterly: tariff.quarterly,
      semiannual: tariff.semiannual,
      annual: tariff.annual
    },
    selectedPremium: tariff[frequency],
    frequency,
    coverages: UNIQA_HEALTH_VALUE_COVERAGES,
    waitingPeriod: UNIQA_HEALTH_VALUE_RULES.waiting_period
  };
}