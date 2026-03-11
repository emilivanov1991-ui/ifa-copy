/**
 * ============================================================
 *   ФИНАНСОВ ПЛАН — КОНСТИТУЦИЯ НА ПРАВИЛАТА (v0.2)
 *   Последна актуализация: 2026-03-11
 * ============================================================
 *
 * Този файл е живият документ с бизнес правилата за генериране
 * на автоматизиран финансов план. Актуализира се след всяко
 * изяснено правило.
 * ============================================================
 */

export const PLAN_CONSTITUTION = {

  // ──────────────────────────────────────────────────────────
  // СТЪПКА 1: ОПТИМИЗАЦИЯ
  // ──────────────────────────────────────────────────────────

  optimization: {

    /**
     * ПРАВИЛО 1.1: Оптимизация на ипотечни кредити
     * Статус: ✅ ПОТВЪРДЕНО (частично — 1.1.3 и 1.1.4 предстоят)
     */
    mortgage: {

      // Условие 1: Новата вноска трябва да е по-ниска от старата
      condition_lower_payment: true,

      // Условие 2: Break-even период — 2 години
      // (Стара вноска - Нова вноска) * 24 > Общи такси за рефинансиране
      breakeven_months: 24,
      breakeven_formula: "(old_monthly - new_monthly) * 24 > total_refinancing_costs",

      // Изчисляване на такси за рефинансиране
      // Формула: (остатъчна_сума * 0.002) * 1.20 + 60 + 70
      refinancing_costs: {
        bank_fee_percent: 0.002,          // 0.2% от остатъчната сума
        vat_multiplier: 1.20,             // 20% ДДС върху банковата такса
        mortgage_cancellation_fee: 60,    // лв. — заличаване на ипотека
        certificates_fee: 70,             // лв. — такси за копия и удостоверения
        formula: "(remaining_balance * 0.002) * 1.20 + 60 + 70"
      },

      // Срок на новия кредит
      // Максимална възраст в края на кредита: 70 г.
      // Ако е под 40 г. → 30 години; над 40 г. → (70 - текуща_възраст) години
      max_age_at_end: 70,
      preferred_term_years: 30,
      term_formula: "MIN(30, 70 - client_age)",

      // Винаги в различна банка от текущата
      must_change_bank: true,

      // Застраховка живот
      // Препоръчва се кредит БЕЗ банкова застраховка живот
      // + добавяне на MetLife Credit Guard върху цялата рефинансирана сума
      insurance: {
        avoid_bank_life_insurance: true,
        recommend_metlife_credit_guard: true,
        coverage_basis: "full_refinanced_amount"
      },

      // Избор на "най-подходящ" кредит — ПРЕДСТОИ ИЗЯСНЯВАНЕ (въпрос 1.1.3)
      best_product_selection_criteria: "PENDING",

      // Без оптимизация — ПРЕДСТОИ ИЗЯСНЯВАНЕ (въпрос 1.1.4)
      no_optimization_handling: "PENDING"
    },

    /**
     * ПРАВИЛО 1.2: Обединяване на ипотека + потребителски кредит/и
     * Статус: ✅ ПОТВЪРДЕНО
     *
     * ПРИОРИТЕТ: Когато клиентът има ипотека И поне 1 потребителски кредит,
     * ВИНАГИ се прилага Правило 1.2 (обединяване) — НЕ се прилагат 1.1 + 1.3/1.4 поотделно.
     *
     * Логика:
     * - Взима се сборът: остатък ипотека + остатъци всички потребителски кредити
     * - Изчислява се новата месечна вноска за общата сума
     * - Срок: до 30 г. (макс. възраст 70 г. в края)
     * - Задължително в различна банка от текущата ипотека
     * - Препоръчително: без банкова застраховка живот + MetLife Credit Guard върху цялата сума
     *
     * Break-even: NONE — при обединяване не се проверява break-even.
     * Условието е единствено: new_combined_monthly < (old_mortgage_monthly + SUM(old_consumer_loans_monthly))
     */
    mortgage_plus_consumer: {
      applies_when: "has_mortgage AND consumer_loans_count >= 1",
      priority_over_separate_rules: true, // 1.2 > (1.1 + 1.3/1.4) поотделно
      combine_all_balances: true,
      condition_formula: "new_combined_monthly < (old_mortgage_monthly + SUM(old_consumer_loans_monthly))",
      breakeven_condition: "NONE",
      max_age_at_end: 70,
      preferred_term_years: 30,
      term_formula: "MIN(30, 70 - client_age)",
      must_change_bank: true,
      insurance: {
        avoid_bank_life_insurance: true,
        recommend_metlife_credit_guard: true,
        coverage_basis: "full_combined_amount"
      }
    },

    /**
     * ПРАВИЛО 1.3: Само 1 потребителски кредит (без ипотека)
     * Статус: ✅ ПОТВЪРДЕНО
     *
     * Прилага се САМО когато: няма ипотека AND потребителски кредити === 1
     * Сравнява се с продукти от списъка с ПОТРЕБИТЕЛСКИ кредити (не ипотечни).
     * Условие: new_monthly < old_monthly (за СЪЩИЯ остатъчен срок)
     * Break-even: NONE — няма нотариални такси при рефинансиране на потребителски кредити.
     * Задължително в различна банка.
     */
    single_consumer_loan: {
      applies_when: "no_mortgage AND consumer_loans_count === 1",
      product_list: "consumer_loans", // ✅ НЕ ипотечни
      condition_formula: "new_monthly < old_monthly (same remaining term)",
      breakeven_condition: "NONE",
      reason: "no_notarial_fees_on_consumer_loan_refinancing",
      max_age_at_end: 70,
      preferred_term_years: 10,
      term_formula: "MIN(10, 70 - client_age)",
      must_change_bank: true,
      insurance: {
        avoid_bank_life_insurance: true,
        recommend_metlife_credit_guard: true,
        coverage_basis: "full_refinanced_amount"
      }
    },

    /**
     * ПРАВИЛО 1.4: Множество потребителски кредити (без ипотека)
     * Статус: ✅ ПОТВЪРДЕНО
     *
     * Прилага се когато: няма ипотека AND потребителски кредити >= 2
     * Обединяват се в 1 нов потребителски кредит.
     * Условие: new_combined_monthly < SUM(old_consumer_loans_monthly)
     * Break-even: NONE (няма нотариални такси)
     * Срок и застраховка: същите правила като Правило 1.3
     *
     * ✅ Дори ако клиентът има собствен имот — НЕ се предлага ипотечен вариант.
     * Прилага се само обединяване в потребителски кредит.
     */
    multiple_consumer_loans: {
      applies_when: "no_mortgage AND consumer_loans_count >= 2",
      action: "consolidate_into_single_consumer_loan",
      ignores_owned_property: true, // не се предлага ипотечен вариант дори при имот
      condition_formula: "new_combined_monthly < SUM(old_consumer_loans_monthly)",
      breakeven_condition: "NONE",
      reason: "no_notarial_fees_on_consumer_loan_refinancing",
      max_age_at_end: 70,
      preferred_term_years: 10,
      term_formula: "MIN(10, 70 - client_age)",
      must_change_bank: true,
      insurance: {
        avoid_bank_life_insurance: true,
        recommend_metlife_credit_guard: true,
        coverage_basis: "full_refinanced_amount"
      }
    },

    /**
     * ПРАВИЛО 1.5: Оптимизация на кредитни карти — ПРЕДСТОИ
     */
    credit_cards: "PENDING",

    /**
     * ПРАВИЛО 1.6: Оптимизация на лизинг — ПРЕДСТОИ
     */
    leasing: "PENDING",

    /**
     * ПРАВИЛО 1.7: Оптимизация на овърдрафт — ПРЕДСТОИ
     */
    overdraft: "PENDING",
  },

  // ──────────────────────────────────────────────────────────
  // СТЪПКА 2: СТРАТЕГИЧЕСКО РАЗПРЕДЕЛЕНИЕ — ПРЕДСТОИ
  // ──────────────────────────────────────────────────────────
  strategic_allocation: "PENDING",

  // ──────────────────────────────────────────────────────────
  // СТЪПКА 3: ФИНАНСОВИ ОГРАНИЧЕНИЯ — ПРЕДСТОИ
  // ──────────────────────────────────────────────────────────
  financial_guardrails: "PENDING",

};