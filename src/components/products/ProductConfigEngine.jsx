/**
 * Universal Product Configuration Engine
 * 
 * Reads JSON product configurations and calculates premiums/rates
 * based on tariff tables, formulas, or custom logic.
 */

/**
 * Calculate product offer based on JSON configuration
 * 
 * @param {Object} config - Product configuration JSON
 * @param {Object} inputs - User inputs (age, sum, term, etc.)
 * @returns {Object} - Calculated offer with premium, details, etc.
 */
export function calculateProductOffer(config, inputs) {
  const { calculation_method, tariff_data, rules } = config;

  // Validate inputs against rules
  const validation = validateInputs(inputs, rules);
  if (!validation.valid) {
    return {
      eligible: false,
      reason: validation.reason
    };
  }

  // Calculate based on method
  let result;
  switch (calculation_method) {
    case 'tariff_table':
      result = calculateFromTariffTable(tariff_data, inputs, rules);
      break;
    case 'formula':
      result = calculateFromFormula(tariff_data, inputs, rules);
      break;
    case 'rate_per_1000':
      result = calculateRatePer1000(tariff_data, inputs, rules);
      break;
    default:
      return { eligible: false, reason: 'Unknown calculation method' };
  }

  return {
    eligible: true,
    ...result,
    provider: config.provider,
    productName: config.product_name,
    productType: config.product_type
  };
}

/**
 * Validate inputs against rules
 */
function validateInputs(inputs, rules) {
  if (!rules) return { valid: true };

  // Age validation
  if (rules.min_age && inputs.age < rules.min_age) {
    return { valid: false, reason: `Минимална възраст: ${rules.min_age} години` };
  }
  if (rules.max_age && inputs.age > rules.max_age) {
    return { valid: false, reason: `Максимална възраст: ${rules.max_age} години` };
  }

  // Sum validation
  if (rules.min_sum && inputs.sum < rules.min_sum) {
    return { valid: false, reason: `Минимална сума: ${rules.min_sum} ${rules.currency || 'EUR'}` };
  }
  if (rules.max_sum && inputs.sum > rules.max_sum) {
    return { valid: false, reason: `Максимална сума: ${rules.max_sum} ${rules.currency || 'EUR'}` };
  }

  // Term validation
  if (rules.min_term && inputs.term < rules.min_term) {
    return { valid: false, reason: `Минимален срок: ${rules.min_term} години` };
  }
  if (rules.max_term && inputs.term > rules.max_term) {
    return { valid: false, reason: `Максимален срок: ${rules.max_term} години` };
  }

  return { valid: true };
}

/**
 * Calculate from tariff table (age brackets)
 */
function calculateFromTariffTable(tariff_data, inputs, rules) {
  const { age, sum, term, isSmoker = false, gender = 'male' } = inputs;

  // Find applicable tariff
  let applicableTariff = null;
  
  for (const bracket of tariff_data.age_brackets) {
    if (age >= bracket.age_from && age <= bracket.age_to) {
      // Check gender if specified
      if (bracket.gender && bracket.gender !== gender && bracket.gender !== 'any') {
        continue;
      }
      applicableTariff = bracket;
      break;
    }
  }

  if (!applicableTariff) {
    return { eligible: false, reason: 'Няма приложима тарифа за тази възраст' };
  }

  // Base rate
  let rate = applicableTariff.rate_per_1000;

  // Apply smoker multiplier
  if (isSmoker && rules.smoker_multiplier) {
    rate *= rules.smoker_multiplier;
  }

  // Calculate premium
  const basePremium = (sum / 1000) * rate;
  
  // Apply term multiplier if exists
  let termMultiplier = 1;
  if (applicableTariff.term_multipliers && term) {
    const termKey = Object.keys(applicableTariff.term_multipliers).find(key => {
      const [min, max] = key.split('-').map(Number);
      return term >= min && term <= max;
    });
    if (termKey) {
      termMultiplier = applicableTariff.term_multipliers[termKey];
    }
  }

  const annualPremium = basePremium * termMultiplier;

  return {
    basePremium: Math.round(basePremium * 100) / 100,
    annualPremium: Math.round(annualPremium * 100) / 100,
    monthlyPremium: Math.round((annualPremium / 12) * 100) / 100,
    rate: rate,
    term: term,
    coverageAmount: sum,
    currency: rules.currency || 'EUR',
    tariffBracket: `${applicableTariff.age_from}-${applicableTariff.age_to}`,
    details: {
      isSmoker,
      gender,
      termMultiplier
    }
  };
}

/**
 * Calculate from formula
 */
function calculateFromFormula(tariff_data, inputs, rules) {
  const { formula, variables } = tariff_data;
  
  // Build context for formula evaluation
  const context = { ...inputs };
  
  // Add variables from config
  if (variables) {
    Object.keys(variables).forEach(key => {
      context[key] = variables[key];
    });
  }

  // Evaluate formula (simple version - can be extended)
  try {
    const result = evaluateFormula(formula, context);
    
    return {
      annualPremium: Math.round(result * 100) / 100,
      monthlyPremium: Math.round((result / 12) * 100) / 100,
      formula: formula,
      currency: rules.currency || 'EUR'
    };
  } catch (error) {
    return { eligible: false, reason: 'Грешка при изчисление' };
  }
}

/**
 * Calculate using rate per 1000
 */
function calculateRatePer1000(tariff_data, inputs, rules) {
  const { sum, term } = inputs;
  const { base_rate, adjustments = {} } = tariff_data;

  let rate = base_rate;

  // Apply adjustments
  if (adjustments.term && term) {
    const termAdj = adjustments.term[term] || adjustments.term.default || 1;
    rate *= termAdj;
  }

  const annualPremium = (sum / 1000) * rate;

  return {
    annualPremium: Math.round(annualPremium * 100) / 100,
    monthlyPremium: Math.round((annualPremium / 12) * 100) / 100,
    rate: rate,
    coverageAmount: sum,
    term: term,
    currency: rules.currency || 'EUR'
  };
}

/**
 * Simple formula evaluator
 * Supports basic arithmetic and variables
 */
function evaluateFormula(formula, context) {
  // Replace variables in formula
  let expr = formula;
  Object.keys(context).forEach(key => {
    const regex = new RegExp(`\\b${key}\\b`, 'g');
    expr = expr.replace(regex, context[key]);
  });

  // Evaluate (Note: In production, use a safe eval library)
  return Function(`"use strict"; return (${expr})`)();
}

/**
 * Get all available product configs
 */
export function getAvailableProducts() {
  // This will be populated as we add configs
  return [
    'dzi-zakrila',
    // Add more as configs are created
  ];
}

/**
 * Load product config by ID
 */
export async function loadProductConfig(productId) {
  try {
    const config = await import(`./configs/${productId}.json`);
    return config.default || config;
  } catch (error) {
    console.error(`Failed to load config for ${productId}:`, error);
    return null;
  }
}