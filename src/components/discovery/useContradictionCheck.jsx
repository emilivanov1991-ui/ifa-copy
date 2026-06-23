import { useState, useCallback } from 'react';

/**
 * Hardcoded contradiction rules for the discovery form.
 * Each rule: { fields, expression, message, severity }
 * - fields: which field names trigger this check
 * - expression: JS function (formData) => boolean — true = contradiction found
 * - message: shown to user
 * - severity: 'warning' | 'error'
 */
const CONTRADICTION_RULES = [
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
  {
    fields: ['desired_reserve_months'],
    expression: (d) => {
      const months = d.desired_reserve_months || 0;
      return months > 36;
    },
    message: 'Желаният резерв от над 36 месеца е необичайно висок — сигурни ли сте?',
    severity: 'warning',
  },
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