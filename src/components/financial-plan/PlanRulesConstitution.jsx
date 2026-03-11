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
  // СТЪПКА 3: ФИНАНСОВИ ОГРАНИЧЕНИЯ
  // ──────────────────────────────────────────────────────────

  financial_guardrails: {

    /**
     * ПРАВИЛО 6.1.4.7 — Нови кредити (ипотека / потребителски)
     * Статус: ✅ ПОТВЪРДЕНО
     *
     * Нови кредити, препоръчани в плана (напр. ипотека за ново жилище),
     * НЕ се включват в бюджетния таван за финансови продукти (750 € / 40%).
     *
     * Таванът важи САМО за: застраховки, инвестиции, пенсионни продукти.
     *
     * Месечното разпределение на клиента изглежда така:
     *   [нова ипотечна вноска] + [план (застраховки/инвестиции)] + [резерв] = месечен баланс
     *
     * Пример:
     *   Доход: 6000 €, Спестявания: 2000 €, Оптимизация: няма
     *   Нова ипотека (от "Ново жилище" → "Начин на финансиране: Пари в брой + заем"):
     *     → Размер на заема + Срок → изчислена вноска: 900 €
     *   Таван на плана: MIN(6000×1.5/12, 2000×0.40) = MIN(750, 800) = 750 €
     *   Резерв (остатък): 2000 - 900 - 750 = 350 €/месец
     *   Общо към финансовия пазар: 1650 € (900 ипотека + 750 план)
     *
     * Откъде идва вноската по новата ипотека:
     *   → from: analysis.planned_housing → financing_method === "cash_and_loan"
     *   → loan_amount + loan_term_years → изчислява се през ипотечен калкулатор
     *   → резултатът е: expected_monthly_payment
     */
    rule_6_1_4_7_new_loans: {
      excluded_from_plan_ceiling: true,
      loan_types: ["mortgage", "consumer_loan"],
      ceiling_applies_to: ["insurance", "investment", "pension"],
      monthly_split_formula:
        "monthly_balance = new_loan_payment + plan_products_budget + reserve_allocation",
      mortgage_source: {
        field_financing_method: "cash_and_loan",
        input_fields: ["loan_amount", "loan_term_years"],
        output_field: "expected_monthly_payment",
        calculator: "mortgage_calculator"
      }
    }

  },

  // ──────────────────────────────────────────────────────────
  // СТЪПКА 3б: ИЗЧИСЛЯВАНЕ НА ПРЕМИИ
  // ──────────────────────────────────────────────────────────

  premium_calculation: {

    /**
     * МЕТЛАЙФ СРОЧЕН ЖИВОТ — формула за премия
     * Статус: ✅ ПОТВЪРДЕНО (от MetLifeTermLifeCalculator)
     *
     * Ключови константи (от FinancialPlanConstants):
     *   - TERM_LIFE_BASIC_RATES[age][termYears]       → тарифа на 1000 € покритие
     *   - METLIFE_PA_RISK_CLASSES[riskClass].pi       → тарифа ПТН на 1000 €
     *   - METLIFE_PA_RISK_CLASSES[riskClass].fracturesAndBurns → тарифа фрактури
     *   - METLIFE_PA_CRITICAL_ILLNESS_32_RATES[age].yr5 / .yr10 → тарифа 32 заболявания
     *   - Телемедицина: фиксирано 15 € / год
     *   - Административна такса: 13 € / год (фиксирана)
     *
     * Формули:
     *   net_premium  = SUM(coverage_i / 1000 * rate_i)
     *   annual       = net_premium + 13
     *   semi_annual  = annual * 0.51
     *   quarterly    = annual * 0.26
     *   monthly      = annual / 12  (≈ за информация — не е стандарт)
     *
     * Минимум: годишна премия >= 50 €
     */
    term_life_premium: {
      source_file: "components/financial-plan/MetLifeTermLifeCalculator",
      constants_file: "components/financial-plan/FinancialPlanConstants",
      admin_fee_annual: 13,
      frequency_multipliers: {
        annual: 1,
        semi_annual: 0.51,
        quarterly: 0.26
      },
      min_annual_premium: 50,
      telemedicine_flat: 15
    },

    /**
     * МЕТЛАЙФ UNIT LINKED — формула за премия
     * Статус: ✅ ПОТВЪРДЕНО (от MetLifeULCalculator)
     *
     * Ключови константи (от FinancialPlanConstants):
     *   - METLIFE_PA_SECURITY_PLUS_COEFFICIENTS[age]  → коефициент за 40 заболявания
     *     (premium_40ci = coverage / coefficient)
     *   - METLIFE_PA_RISK_CLASSES[riskClass].pi       → тарифа ПТН
     *   - METLIFE_PA_RISK_CLASSES[riskClass].fracturesAndBurns → тарифа фрактури
     *   - Телемедицина: фиксирано 15 € / год
     *   - Отказ от премия: (annualSavings + totalCoverages) * waiverRate
     *     waiverRate: рисков клас 1 → 4.38%, клас 2 → 5.25%, клас 3 → 7%
     *   - Административна такса: 15 € / год (фиксирана)
     *
     * Формули:
     *   total_annual  = annualSavings + totalCoverages + 15
     *   monthly       = total_annual / 12
     *   quarterly     = total_annual / 4
     *   semi_annual   = total_annual / 2
     */
    ul_premium: {
      source_file: "components/financial-plan/MetLifeULCalculator",
      constants_file: "components/financial-plan/FinancialPlanConstants",
      admin_fee_annual: 15,
      premium_waiver_rates: {
        risk_class_1: 0.0438,
        risk_class_2: 0.0525,
        risk_class_3: 0.07
      },
      telemedicine_flat: 15
    },

    /**
     * УНИКА Здраве и Ценност Селект — формула за премия
     * Статус: ✅ ПОТВЪРДЕНО (от UniqaHealthValueConstants)
     *
     * Тарифа по възрастова група и план (europa / world):
     *   UNIQA_HEALTH_VALUE_PLANS[plan].tariffs[ageGroup][frequency]
     * Функция: calculateUniqaHealthValue(age, plan, frequency)
     */
    uniqa_health_value_premium: {
      source_file: "components/financial-plan/UniqaHealthValueConstants",
      plans: ["europa", "world"],
      plan_for_standard_plan: "europa",
      function: "calculateUniqaHealthValue(age, 'europa', 'annual')"
    },

    /**
     * ДЖЕНЕРАЛИ Health Line Basic — премия
     * Статус: ✅ ПОТВЪРДЕНО (от GeneraliHealthLineBasic)
     *
     * Фиксирана тарифа — не зависи от възрастта:
     *   monthly = 60 BGN, annual = 720 BGN
     */
    generali_health_basic_premium: {
      source_file: "components/financial-plan/GeneraliHealthLineBasic",
      flat_rate: true,
      monthly_bgn: 60,
      annual_bgn: 720,
      currency: "BGN"
    }
  },

  // ──────────────────────────────────────────────────────────
  // СТЪПКА 4: ПРАВИЛА ЗА ПРОДУКТИ — ЗАЩИТА НА ДОХОДА
  // Статус: ✅ ПОТВЪРДЕНО
  // ──────────────────────────────────────────────────────────

  product_rules: {

    /**
     * ДЪРЖАВНО ОБЕЗЩЕТЕНИЕ ПРИ ИНВАЛИДНОСТ
     * Статус: ✅ ПОТВЪРДЕНО
     *
     * До 2111.64 € бруто → 50% от брутното
     * Над 2111.64 € бруто → фиксирано 1055.82 € (таванът не расте)
     */
    state_disability_benefit: {
      threshold_gross: 2111.64,
      max_benefit: 1055.82,
      formula: "MIN(gross_income * 0.50, 1055.82)"
    },

    /**
     * ИЗБОР НА МЕТЛАЙФ ПРОДУКТ
     * Статус: ✅ ПОТВЪРДЕНО
     *
     * Приоритет: UL > Срочен живот > ДЗИ Закрила (заместител)
     *
     * UL = когато остава поне 25 € месечно за инвестиции (мин. 300 € год.)
     * Срочен живот = когато инвестиционният бюджет е < 25 € месечно
     * ДЗИ Закрила (Платинен) = заместващ когато бюджетът е изчерпан за MetLife
     */
    metlife_product_selection: {
      unit_linked: {
        condition: "monthly_investment_budget >= 25",
        min_annual_investment: 300
      },
      term_life: {
        condition: "monthly_investment_budget < 25"
      },
      dzi_zakrila_substitute: {
        condition: "budget_exhausted_no_metlife_possible",
        package: "platinum",
        for_whom: "both_client_and_partner"
      }
    },

    /**
     * МЕТЛАЙФ UNIT LINKED — ПОКРИТИЯ
     * Статус: ✅ ПОТВЪРДЕНО
     *
     * Базата за мултипликатора е САМО инвестиционната компонента (без цената на покритията)
     */
    metlife_unit_linked: {
      integrated_life_coverage: {
        include: true,
        basis: "annual_investment_component_only",
        multiplier_by_age: {
          "up_to_30":  30,
          "31_to_35":  20,
          "36_to_45":  15,
          "46_to_55":  10,
          "56_to_65":   6
        },
        formula: "annual_investment_component * age_multiplier"
      },
      additional_life_coverage: {
        include: false,
        note: "Допълнително покритие срочен живот — НЕ се включва в плана"
      },
      death_from_accident: {
        include: false,
        shown_in_presentation: true,
        presentation_note: "Визуализира се сумата на интегрираното покритие живот"
      },
      permanent_disability_from_accident: {
        include: true,
        // PV на анюитет — пропуснат доход до пенсия при 4% доходност (ниско-рискови активи)
        formula: "CEILING( PV(4%/12, (65 - age) * 12) * (net_income - state_disability_benefit) * 1.2, 100 )",
        multiplier: 1.2,
        multiplier_rationale: "Дефинирана бизнес логика — 20% буфер за допълнителни разходи при инвалидност",
        note: "Изчислява се индивидуално за всеки от клиентите"
      },
      daily_hospitalization: { include: false },
      surgery: { include: false },
      fractures_and_burns: {
        include: true,
        amount: 1500,
        note: "Винаги 1500 € — избира се най-голямата от трите опции"
      },
      critical_illnesses_40: {
        include: true,
        term_years: null,
        formula: "(net_income - state_disability_benefit) * 24",
        note: "40 тежки заболявания — специфично за UL (не 32). Срокът е вграден в UL договора — не се задава отделно."
      },
      telemedicine: { include: true },
      premium_waiver: { include: true }
    },

    /**
     * МЕТЛАЙФ СРОЧЕН ЖИВОТ — ПОКРИТИЯ
     * Статус: ✅ ПОТВЪРДЕНО
     */
    metlife_term_life: {
      basic_life_coverage: {
        include: true,
        term_years: 5,
        // Условия за пълно покритие (достатъчно е поне ЕДНО):
        // ⚠️ income_share > 55% важи САМО при двойка — при единичен клиент не се прилага
        condition_for_full_coverage:
          "child_under_18 OR has_mortgage OR (has_partner AND income_share_in_household > 55%)",
        full_coverage_formula: "net_income * 24",
        minimum_if_no_conditions: 3000,
        note: "Ако нито едно условие не е изпълнено → минимум 3000 €. При единичен клиент: само деца < 18г. и ипотека се проверяват."
      },
      death_from_accident: {
        include: false,
        shown_in_presentation: true,
        presentation_note: "Визуализира се сумата на основното покритие живот"
      },
      permanent_disability_from_accident: {
        include: true,
        term_years: null,
        term_note: "До прекратяване на полицата — няма отделен срок в калкулатора",
        formula: "CEILING( PV(4%/12, (65 - age) * 12) * (net_income - state_disability_benefit) * 1.2, 100 )",
        multiplier: 1.2,
        multiplier_rationale: "Дефинирана бизнес логика — 20% буфер за допълнителни разходи при инвалидност",
        note: "Същата формула като при UL — индивидуално за всеки"
      },
      daily_hospitalization: { include: false },
      surgery: { include: false },
      fractures_and_burns: {
        include: true,
        amount: 1500,
        term_years: null,
        term_note: "До прекратяване на полицата — няма отделен срок в калкулатора",
        note: "Винаги 1500 € — най-голямата опция"
      },
      critical_illnesses_32: {
        include: true,
        term_years: 10,
        formula: "(net_income - state_disability_benefit) * 24",
        note: "⚠️ 32 тежки заболявания — НЕ 40 (важно разграничение от UL). Срок: 10 години."
      },
      telemedicine: { include: true },
      premium_waiver: { include: false }
    },

    /**
     * МЕТЛАЙФ ДЖУНИЪР — ПОКРИТИЯ
     * Статус: ✅ ПОТВЪРДЕНО
     *
     * Включва се само за деца на възраст ≤ 11 години.
     * По една отделна полица за всяко отговарящо дете.
     */
    metlife_junior: {
      condition: "child_age <= 11",
      one_policy_per_child: true,
      fractures_and_burns: {
        include: true,
        amount: 750,
        note: "Винаги 750 € — по-високата от двете опции"
      },
      child_protection_agreement: {
        include: true
      }
    },

    /**
     * КРЕДИТ ГАРД — ПРАВИЛА
     * Статус: ✅ ПОТВЪРДЕНО
     *
     * Отделна полица за ВСЕКИ кредит (различни суми и срокове).
     * Цел: (вноска без банкова застраховка живот + Credit Guard) < (вноска с банкова застраховка)
     * Важи при нови кредити, рефинансиране и съществуващи кредити.
     */
    credit_guard: {
      one_policy_per_loan: true,
      coverage_amount: "outstanding_balance_per_loan",
      term: "remaining_months_per_loan",
      package: "extended",
      applies_to: ["new_mortgage", "refinanced_loans", "existing_loans"],
      optimization_check:
        "payment_without_bank_insurance + credit_guard_premium < payment_with_bank_insurance"
    },

    /**
     * ПАКЕТНИ ПРОДУКТИ
     * Статус: ✅ ПОТВЪРДЕНО
     */
    /**
     * РЕД НА ВКЛЮЧВАНЕ НА ПАКЕТНИТЕ ПРОДУКТИ
     * Статус: ✅ ПОТВЪРДЕНО
     *
     * 1. Всички MetLife покрития (за клиента и партньора) — живот, трайна нетрудоспособност,
     *    тежки заболявания, фрактури и изгаряния, телемедицина, waiver of premium
     * 2. Уника Здраве и Ценност (клиент + партньор + деца)
     * 3. Дженерали Basic (клиент + партньор)
     *
     * Ако бюджетът се изчерпи на стъпка 1 → MetLife се заменя с ДЗИ Закрила (Платинен)
     * и Уника / Дженерали не се включват.
     * Ако бюджетът се изчерпи на стъпка 2 → Дженерали не се включва.
     */
    package_products_order: [
      { step: 1, product: "metlife_ul_or_term_life", for_whom: "client_and_partner" },
      { step: 1, product: "metlife_junior", for_whom: "children_age_lte_11", note: "Заедно с другите MetLife покрития — Стъпка 1" },
      { step: 2, product: "uniqa_zdrave_i_tsennost", for_whom: "client_partner_and_children" },
      { step: 3, product: "generali_health_basic", for_whom: "client_and_partner" }
    ],

    package_products: {

      // Заместващ продукт на MetLife при изчерпан бюджет
      dzi_zakrila: {
        package: "platinum",
        for_whom: "both_client_and_partner",
        role: "metlife_substitute",
        include_when: "budget_exhausted_for_metlife"
      },

      // Следваща по приоритет след животозастраховането — включва се винаги при бюджет
      uniqa_zdrave_i_tsennost: {
        package: "europa",
        for_whom: "client, partner, AND all_children",
        min_age: 0,
        max_age_at_signup: 64,
        note: "По една отделна полица за клиента, партньора и всяко дете. Достъпно за възраст 0–64 г. към датата на сключване.",
        include_when: "budget_available",
        priority_note: "Следва веднага след животозастраховането по приоритет"
      },

      // Включва се винаги (ще се обнови когато анализът добие индикатор за здравно от работодател)
      generali_health_basic: {
        package: "basic",
        product_name: "HEALTH Line - Basic",
        for_whom: "client_and_partner_only",
        min_age: 18,
        max_age_at_signup: 70,
        currency: "BGN",
        flat_rate: true,
        monthly_premium_bgn: 60,
        annual_premium_bgn: 720,
        note: "По една отделна полица за клиента и партньора (не за деца). Фиксирана тарифа — не зависи от възрастта.",
        include_when: "always_currently",
        pending_change: "Добавяне на индикатор 'employer_health_insurance' в анализа"
      },

      // Нишови продукти — само upsale, не в стандартните планове
      metlife_grija:    { include_in_plans: false, role: "niche_upsale_only" },
      metlife_medica:   { include_in_plans: false, role: "niche_upsale_only" },
      dzi_best_doctors: { include_in_plans: false, role: "niche_upsale_only" }
    }

  }

};