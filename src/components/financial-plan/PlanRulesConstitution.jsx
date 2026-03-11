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
     * ПРАВИЛО 1.5: Оптимизация на кредитни карти
     * Статус: ✅ ПОТВЪРДЕНО
     *
     * Три сценария по приоритет:
     *
     * 1.5.A — Само кредитни карти (без потребителски кредити), сума >= 2000 €
     *   → Рефинансиране в потребителски кредит (ако new_monthly < old_monthly)
     *   → Break-even: NONE
     *
     * 1.5.Б — Само кредитни карти (без потребителски кредити), сума < 2000 €
     *   → Препоръчва се само погасяване — НЕ се рефинансира
     *   → Действие: план за погасяване от свободния месечен остатък
     *
     * 1.5.В — Има и потребителски кредити
     *   → Кредитните карти се включват в обединяването заедно с потребителските кредити
     *   → Третират се идентично с потребителски кредит (Правило 1.3 или 1.4)
     */
    credit_cards: {
      scenario_with_consumer_loans: {
        // 1.5.В
        applies_when: "consumer_loans_count >= 1",
        action: "include_in_consumer_loan_consolidation",
        treat_as: "consumer_loan"
      },
      scenario_standalone_large: {
        // 1.5.А
        applies_when: "consumer_loans_count === 0 AND total_credit_cards_balance >= 2000",
        action: "refinance_into_consumer_loan",
        condition_formula: "new_monthly < old_monthly",
        breakeven_condition: "NONE",
        product_list: "consumer_loans"
      },
      scenario_standalone_small: {
        // 1.5.Б
        applies_when: "consumer_loans_count === 0 AND total_credit_cards_balance < 2000",
        action: "recommend_payoff_only",
        note: "Препоръчва се погасяване от свободния месечен остатък — без рефинансиране"
      }
    },

    /**
     * ПРАВИЛО 1.6: Оптимизация на лизинг
     * Статус: ✅ ПОТВЪРДЕНО
     *
     * Лизингът се игнорира — не се прави оптимизация.
     */
    leasing: {
      action: "ignore",
      note: "Лизингът не се рефинансира и не се включва в оптимизацията"
    },

    /**
     * ПРАВИЛО 1.7: Оптимизация на овърдрафт
     * Статус: ✅ ПОТВЪРДЕНО
     *
     * 1.7.В — Има потребителски кредити:
     *   → Овърдрафтът се включва в обединяването заедно с потребителските кредити
     *   → Третира се идентично с потребителски кредит
     *
     * 1.7.Б — Няма потребителски кредити:
     *   → Ако сума >= 2000 € → рефинансира се в потребителски кредит (ако new_monthly < old_monthly)
     *   → Ако сума < 2000 € → препоръчва се само погасяване от свободния месечен остатък
     */
    overdraft: {
      scenario_with_consumer_loans: {
        applies_when: "consumer_loans_count >= 1",
        action: "include_in_consumer_loan_consolidation",
        treat_as: "consumer_loan"
      },
      scenario_standalone_large: {
        applies_when: "consumer_loans_count === 0 AND overdraft_balance >= 2000",
        action: "refinance_into_consumer_loan",
        condition_formula: "new_monthly < old_monthly",
        breakeven_condition: "NONE",
        product_list: "consumer_loans"
      },
      scenario_standalone_small: {
        applies_when: "consumer_loans_count === 0 AND overdraft_balance < 2000",
        action: "recommend_payoff_only",
        note: "Препоръчва се погасяване от свободния месечен остатък — без рефинансиране"
      }
    },
  },

  // ──────────────────────────────────────────────────────────
  // СТЪПКА 2: СТРАТЕГИЧЕСКО РАЗПРЕДЕЛЕНИЕ
  // Статус: ✅ ПОТВЪРДЕНО
  // ──────────────────────────────────────────────────────────

  strategic_allocation: {

    /**
     * ТАВАНИ НА ПЛАНА (максимален месечен бюджет за нови продукти)
     *
     * Изчисляват се ДВА тавана и се взима по-СТРИКТНИЯТ (MIN).
     *
     * Таван 1 (доходен): (total_monthly_income × 1.5) / 12
     *   Пример: доход 6000 € → таван 1 = 750 €
     *
     * Таван 2 (баланс): monthly_balance_after_optimization × 0.40
     *   monthly_balance_after_optimization = месечен баланс преди оптимизация
     *     + спестявания от оптимизацията (разлика в месечните вноски)
     *   Пример: баланс преди 1000 €, спестяване 200 € → нов баланс 1200 € → таван 2 = 480 €
     *
     * max_monthly_plan_budget = MIN(ceiling_1, ceiling_2)
     *
     * ⚠️ ВАЖНО: Нови кредити НЕ се включват в тези проценти → виж Правило 6.1.4.7
     */
    plan_budget_ceilings: {
      ceiling_1_formula: "total_monthly_income * 1.5 / 12",
      ceiling_2_formula: "monthly_balance_after_optimization * 0.40",
      monthly_balance_after_optimization_formula:
        "old_monthly_balance + (old_liabilities_monthly - new_liabilities_monthly)",
      max_monthly_plan_budget: "MIN(ceiling_1, ceiling_2)",
      excludes_new_loans: true,
      reference_for_loans: "Rule 6.1.4.7"
    },

    /**
     * ЙЕРАРХИЯ НА ЦЕЛИТЕ (фиксирана, приоритет по ред)
     *
     * Бюджетът се разпределя последователно по тази наредба.
     * Ако не остава бюджет — следващите цели не се включват в плана.
     */
    priority_hierarchy: [

      /**
       * 1. ЗАЩИТА НА ДОХОДА
       * Включва:
       *   - Застраховка живот + злополука (напр. MetLife Term Life)
       *   - Критични заболявания (Uniqa Select, Best Doctors)
       *   - Здравно застраховане (Generali Health Line, Uniqa)
       *   - MetLife продукти (Credit Guard, Medica)
       */
      {
        priority: 1,
        goal: "income_protection",
        product_categories: [
          "term_life",
          "critical_illness",
          "health_insurance",
          "personal_accident",
          "metlife_credit_guard",
          "metlife_medica"
        ]
      },

      /**
       * 2. ИЗГРАЖДАНЕ НА РЕЗЕРВ
       *
       * Целева сума: 6 × коригирани_месечни_разходи
       *   коригирани_месечни_разходи = variable_expenses + new_liabilities_monthly
       *   (лихвата на новите кредити се счита за текущ разход)
       *
       * Пример: разходи 2000 + нова ипотека 900 = 2900 → резерв = 6 × 2900 = 17 400 €
       *
       * Целеви хоризонт: 3 години (36 месеца)
       * monthly_reserve_allocation = target_reserve / 36
       *
       * Ако резервът вече е изграден (клиентски спестявания >= target_reserve):
       *   → Стъпката се пропуска, но 40%-ният таван (ceiling_2) остава в сила.
       */
      {
        priority: 2,
        goal: "emergency_reserve",
        target_months: 6,
        target_expenses_basis: "variable_expenses + new_liabilities_monthly",
        target_formula: "6 × (variable_expenses + new_liabilities_monthly)",
        build_horizon_months: 36,
        monthly_allocation_formula: "target_reserve / 36",
        skip_if_already_built: true,
        skip_condition: "existing_liquid_savings >= target_reserve",
        note_when_skipped: "40%-ният таван остава в сила дори при вече изграден резерв"
      },

      /**
       * 3. НОВО ЖИЛИЩЕ
       */
      {
        priority: 3,
        goal: "housing",
        applies_when: "include_housing_in_plan === true"
      },

      /**
       * 4. ПЕНСИЯ
       */
      {
        priority: 4,
        goal: "pension",
        applies_when: "include_pension_in_plan === true"
      },

      /**
       * 5. ДЕЦА
       */
      {
        priority: 5,
        goal: "children",
        applies_when: "include_children_in_plan === true"
      },

      /**
       * 6. ЗАЩИТА НА ИМУЩЕСТВОТО
       * Имуществено застраховане (недвижимо + движимо имущество)
       */
      {
        priority: 6,
        goal: "property_protection",
        product_categories: [
          "property_insurance",
          "home_insurance",
          "car_insurance"
        ],
        applies_when: "include_property_in_plan === true"
      },

      /**
       * 7. ИНВЕСТИЦИИ
       */
      {
        priority: 7,
        goal: "investments",
        product_categories: [
          "ul_investment",
          "partners_regular",
          "partners_single"
        ]
      }
    ]
  },

  // ──────────────────────────────────────────────────────────
  // СТЪПКА 3: ФИНАНСОВИ ОГРАНИЧЕНИЯ — ПРЕДСТОИ
  // ──────────────────────────────────────────────────────────
  financial_guardrails: "PENDING",

};