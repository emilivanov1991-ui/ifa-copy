import { useState, useCallback } from 'react';

/**
 * Hardcoded contradiction rules for the discovery form.
 * Each rule: { fields, expression, message, severity }
 * - fields: which field names trigger this check
 * - expression: JS function (formData) => boolean — true = contradiction found
 * - message: shown to user
 * - severity: 'warning' | 'error'
 */
// Helper: compute age from ISO date string
const ageFromDate = (dateStr) => {
  if (!dateStr) return null;
  const birth = new Date(dateStr);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const CONTRADICTION_RULES = [
  // ── Savings vs income ──────────────────────────────────────────────────────
  {
    fields: ['monthly_savings_amount', 'total_monthly_income', 'client_monthly_net_income'],
    expression: (d) => {
      const savings = d.monthly_savings_amount || 0;
      const income = d.total_monthly_income || d.client_monthly_net_income || 0;
      return income > 0 && savings > income;
    },
    message: 'Спестяванията надвишават общия доход — моля проверете сумите.',
    severity: 'error',
  },
  // ── Reserve months unusually high ─────────────────────────────────────────
  {
    fields: ['desired_reserve_months'],
    expression: (d) => (d.desired_reserve_months || 0) > 36,
    message: 'Желаният резерв от над 36 месеца е необичайно висок — сигурни ли сте?',
    severity: 'warning',
  },
  // ── Net > Gross (client) ───────────────────────────────────────────────────
  {
    fields: ['client_monthly_net_income', 'client_gross_income'],
    expression: (d) => {
      const net = d.client_monthly_net_income || 0;
      const gross = d.client_gross_income || 0;
      return gross > 0 && net > gross;
    },
    message: 'Нетният доход не може да е по-висок от брутния.',
    severity: 'error',
  },
  // ── Net > Gross (partner) ──────────────────────────────────────────────────
  {
    fields: ['partner_monthly_net_income', 'partner_gross_income'],
    expression: (d) => {
      const net = d.partner_monthly_net_income || 0;
      const gross = d.partner_gross_income || 0;
      return gross > 0 && net > gross;
    },
    message: 'Нетният доход на партньора не може да е по-висок от брутния.',
    severity: 'error',
  },
  // ── Age vs birthdate mismatch (client) ────────────────────────────────────
  {
    fields: ['client_age', 'client_birthdate'],
    expression: (d) => {
      if (!d.client_birthdate || !d.client_age) return false;
      const computed = ageFromDate(d.client_birthdate);
      return computed !== null && Math.abs(d.client_age - computed) > 1;
    },
    message: 'Въведената възраст не съответства на датата на раждане на клиента.',
    severity: 'error',
  },
  // ── Age vs birthdate mismatch (partner) ───────────────────────────────────
  {
    fields: ['partner_age', 'partner_birthdate'],
    expression: (d) => {
      if (!d.partner_birthdate || !d.partner_age) return false;
      const computed = ageFromDate(d.partner_birthdate);
      return computed !== null && Math.abs(d.partner_age - computed) > 1;
    },
    message: 'Въведената възраст не съответства на датата на раждане на партньора.',
    severity: 'error',
  },
  // ── Mortgage monthly payment > 50% of income ──────────────────────────────
  {
    fields: ['current_mortgage_monthly_payment', 'client_monthly_net_income', 'total_monthly_income'],
    expression: (d) => {
      const payment = d.current_mortgage_monthly_payment || d.liability_mortgage_monthly || 0;
      const income = d.total_monthly_income || d.client_monthly_net_income || 0;
      return income > 0 && payment > income * 0.6;
    },
    message: 'Ипотечната вноска надвишава 60% от дохода — необичайно високо натоварване.',
    severity: 'warning',
  },
  // ── Mortgage remaining > property value ───────────────────────────────────
  {
    fields: ['current_mortgage_remaining', 'current_housing_value'],
    expression: (d) => {
      const remaining = d.current_mortgage_remaining || d.liability_mortgage_remaining || 0;
      const value = d.current_housing_value || 0;
      return value > 0 && remaining > value * 1.1;
    },
    message: 'Остатъкът по ипотеката надвишава стойността на имота — проверете данните.',
    severity: 'warning',
  },
  // ── Total liabilities monthly > income ────────────────────────────────────
  {
    fields: ['liability_mortgage_monthly', 'liability_consumer_loans_monthly', 'liability_credit_cards_monthly', 'total_monthly_income', 'client_monthly_net_income'],
    expression: (d) => {
      const total = (d.liability_mortgage_monthly || 0) + (d.liability_consumer_loans_monthly || 0) + (d.liability_credit_cards_monthly || 0) + (d.liability_leasing_monthly || 0);
      const income = d.total_monthly_income || d.client_monthly_net_income || 0;
      return income > 0 && total > income;
    },
    message: 'Общите месечни вноски по задълженията надвишават дохода.',
    severity: 'error',
  },
  // ── Client retirement age before current age ──────────────────────────────
  {
    fields: ['client_retirement_age', 'client_age', 'client_birthdate'],
    expression: (d) => {
      const retirementAge = d.client_retirement_age || 0;
      const currentAge = d.client_age || ageFromDate(d.client_birthdate) || 0;
      return retirementAge > 0 && currentAge > 0 && retirementAge <= currentAge;
    },
    message: 'Пенсионната възраст трябва да е след текущата възраст на клиента.',
    severity: 'error',
  },
  // ── Partner retirement age before current age ─────────────────────────────
  {
    fields: ['partner_retirement_age', 'partner_age', 'partner_birthdate'],
    expression: (d) => {
      const retirementAge = d.partner_retirement_age || 0;
      const currentAge = d.partner_age || ageFromDate(d.partner_birthdate) || 0;
      return retirementAge > 0 && currentAge > 0 && retirementAge <= currentAge;
    },
    message: 'Пенсионната възраст трябва да е след текущата възраст на партньора.',
    severity: 'error',
  },
  // ── Desired pension > current income (unrealistic) ────────────────────────
  {
    fields: ['client_desired_pension', 'client_monthly_net_income', 'total_monthly_income'],
    expression: (d) => {
      const pension = d.client_desired_pension || 0;
      const income = d.total_monthly_income || d.client_monthly_net_income || 0;
      return income > 0 && pension > income * 1.5;
    },
    message: 'Желаната пенсия надвишава 150% от текущия доход — проверете очакванията.',
    severity: 'warning',
  },
  // ── Car value implausibly high ────────────────────────────────────────────
  {
    fields: ['car_1_value'],
    expression: (d) => (d.car_1_value || 0) > 500000,
    message: 'Стойността на автомобила изглежда необичайно висока — проверете валутата (EUR).',
    severity: 'warning',
  },
  {
    fields: ['car_2_value'],
    expression: (d) => (d.car_2_value || 0) > 500000,
    message: 'Стойността на втория автомобил изглежда необичайно висока — проверете валутата (EUR).',
    severity: 'warning',
  },
  // ── Children count vs names/ages consistency ──────────────────────────────
  {
    fields: ['children_count', 'child_1_age', 'child_2_age', 'child_3_age'],
    expression: (d) => {
      const count = d.children_count || 0;
      if (count === 0) return false;
      // If count >= 1 but first child age is 0 or missing, flag
      if (count >= 1 && d.child_1_age !== undefined && d.child_1_age < 0) return true;
      if (count >= 2 && d.child_2_age !== undefined && d.child_2_age < 0) return true;
      if (count >= 3 && d.child_3_age !== undefined && d.child_3_age < 0) return true;
      return false;
    },
    message: 'Възрастта на дете не може да е отрицателна.',
    severity: 'error',
  },
  // ── Child older than parent ───────────────────────────────────────────────
  {
    fields: ['child_1_age', 'client_age', 'client_birthdate'],
    expression: (d) => {
      const childAge = d.child_1_age || 0;
      const parentAge = d.client_age || ageFromDate(d.client_birthdate) || 0;
      return childAge > 0 && parentAge > 0 && childAge >= parentAge;
    },
    message: 'Детето не може да е по-старо или на същата възраст като родителя.',
    severity: 'error',
  },
  // ── Savings account > total income * 120 months (implausibly large) ───────
  {
    fields: ['client_savings_account', 'client_monthly_net_income', 'total_monthly_income'],
    expression: (d) => {
      const savings = (d.client_savings_account || 0) + (d.client_term_deposit || 0) + (d.client_checking_account || 0);
      const income = d.total_monthly_income || d.client_monthly_net_income || 0;
      return income > 0 && savings > income * 240; // > 20 years of income
    },
    message: 'Общите спестявания са необичайно високи спрямо дохода — проверете сумите.',
    severity: 'warning',
  },
  // ── Housing value implausibly high ────────────────────────────────────────
  {
    fields: ['current_housing_value'],
    expression: (d) => (d.current_housing_value || 0) > 5000000,
    message: 'Стойността на жилището изглежда необичайно висока — проверете валутата (EUR).',
    severity: 'warning',
  },
  // ── Income 0 but expenses > 0 ─────────────────────────────────────────────
  {
    fields: ['client_monthly_net_income', 'total_monthly_income', 'expense_rent', 'expense_food'],
    expression: (d) => {
      const income = d.total_monthly_income || d.client_monthly_net_income || 0;
      const expenses = (d.expense_rent || 0) + (d.expense_food || 0) + (d.expense_utilities || 0);
      return income === 0 && expenses > 500;
    },
    message: 'Имате значителни разходи, но нулев доход — проверете данните.',
    severity: 'warning',
  },
];

export function useContradictionCheck() {
  const [contradictions, setContradictions] = useState([]);

  const checkContradictions = useCallback((fieldName, formData) => {
    const active = CONTRADICTION_RULES
      .filter(rule => rule.fields.includes(fieldName))
      .filter(rule => {
        try { return rule.expression(formData); } catch { return false; }
      })
      .map(rule => ({ message: rule.message, severity: rule.severity }));

    setContradictions(active);
    return active;
  }, []);

  const clearContradictions = useCallback(() => setContradictions([]), []);

  return { contradictions, checkContradictions, clearContradictions };
}