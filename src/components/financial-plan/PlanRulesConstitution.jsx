/**
 * ============================================================
 *   ФИНАНСОВ ПЛАН — КОНСТИТУЦИЯ НА ПРАВИЛАТА (v0.4)
 *
 * ⚠️ ВАЛУТА: ВСИЧКИ СУМИ В ПЛАНА, АНАЛИЗА И ФИНАНСОВИЯ ПЛАН СА В ЕВРО (€).
 *    От 01.01.2026 българският лев е заменен с евро.
 *    Не се прилага конвертиране BGN→EUR. Всички полета се третират директно като EUR.
 *   Последна актуализация: 2026-03-26
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

      // Избор на "най-подходящ" кредит — ПРАВИЛО 1.1.3
      // Критерий: най-ниска месечна вноска (независимо от лихвения процент)
      // Предпочитание: оферта БЕЗ банкова застраховка живот (за да може да се добави Credit Guard)
      // Ако всички оферти включват банкова застраховка → избира се пак най-ниската вноска
      best_product_selection_criteria: "lowest_monthly_payment_prefer_no_bank_life_insurance",

      // Правило 1.1.4: Оптимизацията НЕ е изгодна
      // Показва се пълен анализ с числата:
      //   - Стара месечна вноска
      //   - Нова месечна вноска (най-добрата намерена оферта)
      //   - Спестяване на месец
      //   - Такси за рефинансиране (изчислени по формулата)
      //   - Break-even период в месеци
      //   - Заключение: "Оптимизацията не е препоръчителна в момента"
      //
      // ✅ ПОТВЪРДЕНО: Показва се отделен слайд с таблица (всички числа) + заключение.
      //    Слайдът НЕ се пропуска — анализът е ценен за клиента дори при отрицателен резултат.
      //
      // ⏳ PENDING — ДИЗАЙН ЗАДАЧА:
      //    Трябва да се изготви и одобри дизайнът на слайда за сценария "не е изгодно":
      //    - Layout на таблицата (стара vs нова вноска, спестяване, такси, break-even)
      //    - Визуален стил на заключителното съобщение
      //    - Интеграция в FinancialPlanPresentation компонента
      no_optimization_handling: "show_full_analysis_with_not_beneficial_conclusion"
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

    /**
     * ПРАВИЛО 1.8: Оптимизация на застраховки за МПС (ГО и КАСКО)
     * Статус: ✅ ПОТВЪРДЕНО
     *
     * Прилага се за всеки автомобил (car_1, car_2, car_3) поотделно.
     * Изчислява се месечната вноска по ДЗИ тарифите и се сравнява с текущата.
     * Нетният ефект (insurance_delta) коригира monthly_balance_after_optimization.
     *
     * ─────────────────────────────────────────
     * 1.8.А — ГРАЖДАНСКА ОТГОВОРНОСТ (ГО)
     * ─────────────────────────────────────────
     * Калкулатор: DZIGOCalculator (components/products/DZIGOCalculator)
     * Полета от анализа: car_X_go_monthly (текуща месечна сума по ГО)
     *
     * Сценарии:
     *   1. Клиентът ИМА ГО, плаща ПОВЕЧЕ от ДЗИ:
     *      → delta = car_X_go_monthly - dzi_go_monthly (положителна)
     *      → Действие: +delta към monthly_balance_after_optimization
     *      → Извод: „Спестявате X €/месец при преминаване към ДЗИ ГО"
     *
     *   2. Клиентът ИМА ГО, плаща РАВНО или по-малко от ДЗИ:
     *      → delta = 0 (нищо не се променя)
     *      → Не се предлага смяна — ДЗИ не е по-изгодна
     *
     *   3. Клиентът НЯМА ГО (car_X_go_monthly = 0 или null):
     *      → delta = -dzi_go_monthly (отрицателна)
     *      → Действие: -dzi_go_monthly от monthly_balance_after_optimization
     *      → Извод: „Задължително — добавя се ГО застраховка X €/месец"
     *
     * ─────────────────────────────────────────
     * 1.8.Б — КАСКО
     * ─────────────────────────────────────────
     * Калкулатор: DZICascoCalculator → calculateDZICascoOffer()
     * Полета от анализа: car_X_value (EUR), car_X_year, car_X_casco_monthly
     * Праг за препоръка: car_X_value > 5,000 € (под прага — КАСКО не се препоръчва)
     *
     * Сценарии:
     *   0. car_X_value <= 5,000 €:
     *      → Пропуска се изцяло — каско не е препоръчително за евтини коли
     *
     *   1. car_X_value > 5,000 € AND клиентът ИМА КАСКО, плаща ПОВЕЧЕ от ДЗИ:
     *      → delta = car_X_casco_monthly - dzi_casco_monthly (положителна)
     *      → Действие: +delta към monthly_balance_after_optimization
     *
     *   2. car_X_value > 5,000 € AND клиентът ИМА КАСКО, плаща РАВНО или по-малко:
     *      → delta = 0
     *
     *   3. car_X_value > 5,000 € AND клиентът НЯМА КАСКО:
     *      → delta = -dzi_casco_monthly (отрицателна)
     *      → Действие: -dzi_casco_monthly от monthly_balance_after_optimization
     *      → Извод: „Препоръчваме КАСКО — добавя X €/месец към разходите"
     *
     * ─────────────────────────────────────────
     * ОБОБЩЕНА ФОРМУЛА ЗА МПС:
     * ─────────────────────────────────────────
     *   car_insurance_delta = SUM(go_delta_car_1..3) + SUM(casco_delta_car_1..3)
     *   monthly_balance_after_optimization += car_insurance_delta
     */
    car_insurance_optimization: {
      applies_to: ["car_1", "car_2", "car_3"],
      applies_when: "has_car_X === true",

      go: {
        calculator: "DZIGOCalculator",
        source_field_current_monthly: "car_X_go_monthly",
        scenario_has_go_cheaper: {
          condition: "car_X_go_monthly > 0 AND car_X_go_monthly > dzi_go_monthly",
          delta_formula: "car_X_go_monthly - dzi_go_monthly",
          effect: "positive — added to monthly_balance_after_optimization"
        },
        scenario_has_go_same_or_more_expensive: {
          condition: "car_X_go_monthly > 0 AND car_X_go_monthly <= dzi_go_monthly",
          delta_formula: "0",
          effect: "no change"
        },
        scenario_no_go: {
          condition: "car_X_go_monthly === 0 OR car_X_go_monthly === null",
          delta_formula: "-dzi_go_monthly",
          effect: "negative — deducted from monthly_balance_after_optimization",
          note: "ГО е задължителна — добавя се като нов разход"
        }
      },

      casco: {
        calculator: "DZICascoCalculator → calculateDZICascoOffer()",
        casco_threshold_eur: 5000,
        source_field_current_monthly: "car_X_casco_monthly",
        scenario_below_threshold: {
          condition: "car_X_value <= 5000",
          action: "skip — каско не се препоръчва за автомобили под 5 000 €",
          delta_formula: "0"
        },
        scenario_has_casco_cheaper: {
          condition: "car_X_value > 5000 AND car_X_casco_monthly > 0 AND car_X_casco_monthly > dzi_casco_monthly",
          delta_formula: "car_X_casco_monthly - dzi_casco_monthly",
          effect: "positive — added to monthly_balance_after_optimization"
        },
        scenario_has_casco_same_or_more_expensive: {
          condition: "car_X_value > 5000 AND car_X_casco_monthly > 0 AND car_X_casco_monthly <= dzi_casco_monthly",
          delta_formula: "0",
          effect: "no change"
        },
        scenario_no_casco: {
          condition: "car_X_value > 5000 AND (car_X_casco_monthly === 0 OR car_X_casco_monthly === null)",
          delta_formula: "-dzi_casco_monthly",
          effect: "negative — deducted from monthly_balance_after_optimization",
          note: "Препоръчваме КАСКО — добавя се като нов разход"
        }
      },

      net_delta_formula: "car_insurance_delta = SUM(go_delta + casco_delta) for all cars"
    },

    /**
     * ПРАВИЛО 1.9: Оптимизация на имотно застраховане
     * Статус: ✅ ПОТВЪРДЕНО
     *
     * Прилага се за:
     *   А) Текущото жилище (current_housing)
     *   Б) Допълнителни имоти (property_1, property_2, property_3)
     *
     * ─────────────────────────────────────────
     * 1.9.А — ТЕКУЩО ЖИЛИЩЕ (current_housing)
     * ─────────────────────────────────────────
     * Калкулатор: InstinctHomeCalculator (Instinct Home, ДЗИ)
     * Входни данни: current_housing_value (EUR), current_housing_movable_value (EUR)
     *
     * ИЗКЛЮЧЕНИЯ (пропуска се изцяло):
     *   - current_housing = "rented" → наем — не предлагаме имотна застраховка
     *   - current_housing = "subrented" → пак наем
     *   - current_housing = "with_parents" → не е собствен имот
     *   - current_housing = "owned" AND current_housing_has_mortgage = true
     *     → Банката изисква задължително имотно застраховане — ние не се намесваме.
     *       Вместо това се прилага Правило 1.1 (ипотечна оптимизация) с Credit Guard.
     *
     * Активни сценарии (само при current_housing = "owned" AND has_mortgage = false):
     *   1. Има застраховка, плаща ПОВЕЧЕ от Instinct Home:
     *      → delta = current_housing_insurance_monthly - instinct_home_monthly (положителна)
     *      → Действие: +delta към monthly_balance_after_optimization
     *
     *   2. Има застраховка, плаща РАВНО или по-малко:
     *      → delta = 0
     *
     *   3. НЯМА застраховка:
     *      → delta = -instinct_home_monthly (отрицателна)
     *      → Добавя се оферта + цена като нов разход
     *
     * Полета от анализа:
     *   - current_housing_value           → стойност на имота (EUR)
     *   - current_housing_movable_value   → движимо имущество (EUR)
     *   - has_property_insurance          → boolean (има ли застраховка)
     *   - insurance_property              → текуща месечна сума (от Финансов поток → Застраховки)
     *
     * ─────────────────────────────────────────
     * 1.9.Б — ДОПЪЛНИТЕЛНИ ИМОТИ (property_1..3)
     * ─────────────────────────────────────────
     * Същата логика като 1.9.А, но без изключения за ипотека/наем.
     * Тези имоти са собственост — ВСИЧКИ се проверяват.
     *
     * Полета от анализа (за property_X):
     *   - property_X_value               → стойност на имота (EUR)
     *   - property_X_movable_value        → движимо имущество (EUR)
     *   - property_X_has_insurance        → boolean
     *   - property_X_insurance_monthly   → текуща месечна сума (EUR)
     *
     * Сценарии (идентични с 1.9.А):
     *   1. Има застраховка, плаща ПОВЕЧЕ → +delta
     *   2. Има застраховка, РАВНО/по-малко → 0
     *   3. НЯМА застраховка → -instinct_home_monthly
     *
     * ─────────────────────────────────────────
     * ОБОБЩЕНА ФОРМУЛА ЗА ИМОТИ:
     * ─────────────────────────────────────────
     *   property_insurance_delta = delta_current_housing + SUM(delta_property_1..3)
     *   monthly_balance_after_optimization += property_insurance_delta
     */
    property_insurance_optimization: {
      calculator: "InstinctHomeCalculator",
      source_file: "components/financial-plan/InstinctHomeCalculator",

      current_housing: {
        skip_conditions: [
          "current_housing === 'rented'",
          "current_housing === 'subrented'",
          "current_housing === 'with_parents'",
          "current_housing === 'owned' AND current_housing_has_mortgage === true"
        ],
        mortgage_note: "При ипотека — банката задължително изисква имотна застраховка. Не се намесваме в нея. Прилага се само Правило 1.1 с Credit Guard.",
        active_when: "current_housing === 'owned' AND current_housing_has_mortgage === false",
        source_fields: {
          property_value: "current_housing_value",
          movable_value: "current_housing_movable_value",
          has_insurance: "has_property_insurance",
          current_monthly: "insurance_property"
        },
        scenario_has_insurance_cheaper: {
          condition: "has_property_insurance === true AND insurance_property > instinct_home_monthly",
          delta_formula: "insurance_property - instinct_home_monthly",
          effect: "positive"
        },
        scenario_has_insurance_same_or_expensive: {
          condition: "has_property_insurance === true AND insurance_property <= instinct_home_monthly",
          delta_formula: "0"
        },
        scenario_no_insurance: {
          condition: "has_property_insurance === false OR has_property_insurance === null",
          delta_formula: "-instinct_home_monthly",
          effect: "negative — added as new cost"
        }
      },

      additional_properties: {
        applies_to: ["property_1", "property_2", "property_3"],
        applies_when: "has_property_X === true",
        no_mortgage_exception: true,
        note: "Допълнителните имоти са собственост — нямат изключения за ипотека/наем.",
        source_fields: {
          property_value: "property_X_value",
          movable_value: "property_X_movable_value",
          has_insurance: "property_X_has_insurance",
          current_monthly: "property_X_insurance_monthly"
        },
        scenario_has_insurance_cheaper: {
          condition: "property_X_has_insurance === true AND property_X_insurance_monthly > instinct_home_monthly",
          delta_formula: "property_X_insurance_monthly - instinct_home_monthly",
          effect: "positive"
        },
        scenario_has_insurance_same_or_expensive: {
          condition: "property_X_has_insurance === true AND property_X_insurance_monthly <= instinct_home_monthly",
          delta_formula: "0"
        },
        scenario_no_insurance: {
          condition: "property_X_has_insurance === false OR property_X_has_insurance === null",
          delta_formula: "-instinct_home_monthly",
          effect: "negative — added as new cost"
        }
      },

      net_delta_formula: "property_insurance_delta = delta_current_housing + SUM(delta_property_1..3)"
    },

    /**
     * ОБОБЩЕНА ФОРМУЛА — ЗАСТРАХОВАТЕЛНА ОПТИМИЗАЦИЯ
     * Статус: ✅ ПОТВЪРДЕНО
     *
     * Нетният ефект от Правила 1.8 и 1.9 заедно:
     *   total_insurance_optimization_delta = car_insurance_delta + property_insurance_delta
     *
     * Крайна формула за monthly_balance_after_optimization:
     *   monthly_balance_after_optimization =
     *     old_monthly_balance
     *     + (old_liabilities_monthly - new_liabilities_monthly)   ← кредитна оптимизация (1.1–1.7)
     *     + total_insurance_optimization_delta                     ← застрахователна оптимизация (1.8–1.9)
     *
     * ⚠️ ВАЖНО: Делтата може да е ОТРИЦАТЕЛНА (добавяме нова застраховка) или
     * ПОЛОЖИТЕЛНА (клиентът спестява при преминаване към ДЗИ/Instinct Home).
     * В двата случая влиза директно в monthly_balance_after_optimization.
     */
    insurance_optimization_summary: {
      total_delta_formula: "total_insurance_optimization_delta = car_insurance_delta + property_insurance_delta",
      monthly_balance_formula:
        "monthly_balance_after_optimization = old_monthly_balance + (old_liabilities_monthly - new_liabilities_monthly) + total_insurance_optimization_delta",
      note: "Делтата се прилага ПРЕДИ изчисляване на таваните на плана (ceiling_1 и ceiling_2)"
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
      /**
       * ВАЖНО: Формулите са ИДЕНТИЧНИ за единичен клиент и за двойка.
       * При двойка: total_monthly_income = client_income + partner_income
       * При двойка: monthly_balance_after_optimization = общ баланс на домакинството
       * Не се прилага различен коефициент при двойка.
       */

      /**
       * ДВА РЕЖИМА — зависи дали резервът е вече изграден
       *
       * РЕЖИМ А (резервът НЕ е изграден):
       *   Ceiling 1: total_monthly_income * 1.5 / 12
       *   Ceiling 2: monthly_balance_after_optimization * 0.40
       *   max_monthly_plan_budget = MIN(ceiling_1, ceiling_2)
       *
       * РЕЖИМ Б (резервът е вече изграден — existing_liquid_savings >= target_reserve):
       *   Ceiling 1: total_monthly_income * 2.0 / 12
       *   Ceiling 2: monthly_balance_after_optimization * 0.66
       *   max_monthly_plan_budget = MIN(ceiling_1, ceiling_2)
       *
       * Условие за Режим Б: existing_liquid_savings >= 6 * (variable_expenses + new_liabilities_monthly)
       */
      mode_a_reserve_not_built: {
        condition: "existing_liquid_savings < target_reserve",
        ceiling_1_formula: "total_monthly_income * 1.5 / 12",
        ceiling_2_formula: "monthly_balance_after_optimization * 0.40",
        max_monthly_plan_budget: "MIN(ceiling_1, ceiling_2)"
      },
      // ДЕФИНИЦИЯ НА existing_liquid_savings:
      // При ЕДИНИЧЕН клиент:
      //   = client_checking_account + client_savings_account + client_term_deposit + client_cash
      // При ДВОЙКА (include_partner = true):
      //   = (client + partner)_(checking_account + savings_account + term_deposit + cash)
      // Полета в FinancialAnalysisSubmission:
      //   Клиент: asset_checking_account, asset_short_term_savings, asset_medium_term_savings, client_cash
      //   Партньор: partner_checking_account, partner_savings_book, partner_term_deposit, partner_cash
      // НЕ включва: asset_long_term_savings, mutual_funds, crypto, gold (на нито един от двамата)
      // Логика: резервът е общ — разходите и кредитите са общи за домакинството
      existing_liquid_savings_definition: "SUM(client + partner): checking_account + short_term_savings + medium_term_savings + cash",

      mode_b_reserve_already_built: {
        condition: "existing_liquid_savings >= target_reserve",
        ceiling_1_formula: "total_monthly_income * 2.0 / 12",
        ceiling_2_formula: "monthly_balance_after_optimization * 0.66",
        max_monthly_plan_budget: "MIN(ceiling_1, ceiling_2)",
        note: "По-висок таван при вече изграден резерв — клиентът може да поеме по-голям ангажимент"
      },
      // ДЕФИНИЦИЯ НА old_monthly_balance (преди оптимизация):
      // = total_monthly_income
      //   - SUM(expense_* полета)              → разходи за живот (храна, наем, гориво и т.н.)
      //   - monthly_investments                → текущи редовни инвестиции на клиента
      //   - SUM(liability_*_monthly полета)    → текущи кредитни вноски
      //   - SUM(insurance_* полета)            → текущи застрахователни премии
      //
      // ВАЖНО: SUM(insurance_*) включва ВСИЧКИ полета:
      //   insurance_life, insurance_property, insurance_movable,
      //   insurance_civil, insurance_casco, insurance_other
      //
      // Тези полета са AUTO-POPULATED от Финансовия поток (FinancialFlowStep):
      //   insurance_civil    = SUM(car_X_go_monthly)           ← от "Защита на собствеността"
      //   insurance_casco    = SUM(car_X_casco_monthly)        ← от "Защита на собствеността"
      //   insurance_property = SUM(property_X_insurance_monthly) ← от "Защита на собствеността"
      //
      // Следователно: car_X_go_monthly ≡ insurance_civil (агрегирано)
      //               car_X_casco_monthly ≡ insurance_casco (агрегирано)
      //               property_X_insurance_monthly ≡ insurance_property (агрегирано)
      //
      // За Правила 1.8 и 1.9: сравнението се прави на ниво car_X / property_X поотделно
      // (защото ДЗИ офертата е различна за всяко МПС/имот), но общият ефект (delta)
      // коригира insurance_civil, insurance_casco и insurance_property в old_monthly_balance.
      //
      // Визуално (от схемата):
      //   Доход
      //   − Храна, наем, сметки и тн.   (expense_*)
      //   − Инвестиции                  (monthly_investments)
      //   − Заеми/Кредити               (liability_*_monthly)
      //   − Застраховки                 (insurance_*)
      //   ─────────────────────────────
      //   = OLD MONTHLY BALANCE
      //
      // ⚠️ monthly_savings_amount НЕ се приспада отделно —
      //    то е вторичен показател, не самостоятелна категория в схемата.
      //
      // Пример: доход 4 000 € − разходи 2 000 € − инвестиции 200 € − кредит 500 € − застраховки 100 € = 1 200 € баланс
      //
      // СЛЕД ОПТИМИЗАЦИЯ (кредит 500→450, застраховки 100→80):
      // monthly_balance_after_optimization = 1 200 + 50 + 20 = 1 270 €
      // Таван на плана (Режим А): 1 270 × 40% = 508 €
      old_monthly_balance_formula:
        "total_monthly_income - SUM(expense_*) - monthly_investments - SUM(liability_*_monthly) - SUM(insurance_*)",
      monthly_balance_after_optimization_formula:
        "old_monthly_balance + (old_liabilities_monthly - new_liabilities_monthly) + (old_insurance_monthly - new_insurance_monthly)",
      excludes_new_loans: true,
      reference_for_loans: "Rule 6.1.4.7"
    },

    /**
     * ПРАВИЛО 6.1.4.8 — available_cash при жилищна цел
     * Статус: ✅ ПОТВЪРДЕНО
     *
     * Когато planning_housing_change = true AND include_housing_in_plan = true
     * AND financing_method = "cash" OR "cash_and_loan":
     *
     * → available_cash се счита за ВЕЧЕ АНГАЖИРАН за жилищното самоучастие
     *   (ще бъде използван в рамките на 2–3 години)
     * → НЕ се добавя към investment_budget
     * → НЕ се приспада от required_corpus (не е дългосрочен инвестиционен актив)
     * → Просто не участва в никакви изчисления на плана
     */
    rule_6_1_4_8_available_cash_housing: {
      condition: "planning_housing_change === true AND include_housing_in_plan === true",
      available_cash_treatment: "excluded",
      add_to_investment_budget: false,
      deduct_from_corpus: false,
      rationale: "Средствата ще се използват за самоучастие в рамките на 2–3 години — не са свободен инвестиционен ресурс"
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
        // ДЕФИНИЦИЯ НА variable_expenses:
        // = SUM на всички разходи от секция "Разходи" в анализа (expense_* полета)
        //   БЕЗ да се включват:
        //     - месечни спестявания (monthly_savings_amount)
        //     - месечни инвестиции (monthly_investments)
        //     - месечни вноски по кредити (liability_*_monthly полета)
        //     - месечни разходи по застраховки (insurance_* полета)
        // Тези четири категории се третират отделно в плана.
        variable_expenses_definition: "SUM(expense_*) excluding savings, investments, loan_payments, insurance_premiums",
        // ДЕФИНИЦИЯ НА new_liabilities_monthly:
        // = SUM на ВСИЧКИ активни месечни кредитни вноски на клиента СЛЕД изпълнението на плана
        // Включва:
        //   - оптимизираните стари кредити (след рефинансиране)
        //   - новите кредити препоръчани в плана (напр. ипотека за ново жилище)
        // Пример: стара ипотека+потребителски след оптимизация 750 € + нова ипотека 900 € = 1 650 €
        // Логика: резервът се изгражда спрямо РЕАЛНИЯ месечен разход на клиента СЛЕД плана — не преди него
        new_liabilities_monthly_definition: "SUM(all active monthly loan payments AFTER plan execution: optimized_old_loans + new_plan_loans)",
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
     * РИСКОВ КЛАС ПРИ АВТОМАТИЧНО ГЕНЕРИРАНЕ
     * Статус: ✅ ПОТВЪРДЕНО
     *
     * Винаги I рисков клас при генериране на плана.
     *
     * Обосновка: Здравният въпросник НЕ е част от анализа — анализът не събира
     * лични здравни данни. Въпросникът се попълва СЛЕД като клиентът приеме
     * продуктите, директно при застрахователя.
     *
     * ⏳ PENDING — след приемане на продуктите:
     *   Ако здравният въпросник индикира по-висок рисков клас (II или III),
     *   планът трябва да се преизчисли с новия клас и актуализираните премии.
     *   Тази функционалност предстои да се имплементира.
     */
    default_risk_class: 1,
    risk_class_recalculation: "PENDING — преизчисляване след приемане на продуктите и попълване на здравен въпросник при застрахователя",

    /**
     * ОПРЕДЕЛЯНЕ НА annualSavings ПРИ UL (автоматичен план)
     * Статус: ✅ ПОТВЪРДЕНО
     *
     * Логика: Генераторът ПЪРВО изчислява всички покрития по мярка,
     * след което насочва ОСТАТЪКА от бюджетния таван към инвестицията.
     *
     * Структура на UL годишна премия (от MetLifeULCalculator):
     *   total_annual = annualSavings + totalCoverages + adminFee(15) + premiumWaiver
     *   premiumWaiver = (annualSavings + totalCoverages) * waiverRate
     *   waiverRate при I рисков клас = 0.0438 (4.38%)
     *
     * Искаме: total_annual = budget_ceiling_annual (= max_monthly_plan_budget × 12)
     *
     * Алгебрично решение (кръгова зависимост при Отказ от премия):
     *   (annualSavings + totalCoverages) × (1 + waiverRate) + 15 = budget_ceiling_annual
     *   annualSavings = (budget_ceiling_annual - 15) / (1 + waiverRate) - totalCoverages
     *
     * ⚠️ Ако Отказ от премия НЕ е включен (напр. над 55 г.):
     *   annualSavings = budget_ceiling_annual - 15 - totalCoverages
     *
     * ⚠️ Премиен бонус (getPremiumBonus):
     *   Бонусът НЕ влияе на платената годишна премия — той се добавя
     *   ДОПЪЛНИТЕЛНО към инвестиционната сметка. Не се включва в горната формула.
     *
     * ⚠️ AV Charge (такса управление, getAVCharge):
     *   Удържа се вътрешно от сметката на клиента (не е видима в премията).
     *   Не се включва в формулата за annualSavings — включена е в проекцията.
     *
     * Минимум: annualSavings >= 300 € / год (= 25 € / месец)
     * Ако остатъкът е < 300 € → НЕ се добавя UL, избира се Срочен живот.
     * (Вж. metlife_product_selection.unit_linked.condition)
     */
    ul_annual_savings_formula: {
      with_premium_waiver:
        "annualSavings = (budget_ceiling_annual - 15) / (1 + waiverRate) - totalCoverages",
      without_premium_waiver:
        "annualSavings = budget_ceiling_annual - 15 - totalCoverages",
      waiver_rate_class_1: 0.0438,
      admin_fee: 15,
      premium_bonus_note: "Не влияе на платената премия — само бонус към сметката",
      av_charge_note: "Вътрешна такса — само в проекцията",
      min_annual_savings: 300,
      fallback_if_below_min: "term_life"
    },

    /**
     * ИЗЧИСЛЯВАНЕ НА ПОКРИТИЯ ПТН И 40 ЗАБОЛЯВАНИЯ ПРИ UL
     * Статус: ✅ ПОТВЪРДЕНО
     *
     * Стъпка 1 — Изчисляване по формула:
     *   PTN = CEILING( PV(4%/12, (65-age)*12) × (net_income - state_disability) × 1.2, 100 )
     *   CI40 = (net_income - state_disability) × 24
     *
     * Стъпка 2 — Проверка дали цената на покритията се побира в бюджета:
     *   totalCoverages = cost(PTN) + cost(CI40) + cost(fractures_1500) + cost(telemedicine)
     *   Ако totalCoverages > budget_ceiling_annual → намаляване пропорционално:
     *     scale_factor = available_for_coverages / totalCoverages
     *     всяко покритие *= scale_factor
     *
     * Стъпка 3 — ПРАВИЛО 40%: Застраховките не трябва да надвишават 40% от (застраховки + инвестиция).
     *   Проверка: totalCoverages / (totalCoverages + annualSavings) ≤ 0.40
     *
     *   Тъй като annualSavings = f(totalCoverages) (вж. ul_annual_savings_formula),
     *   максималното допустимо покритие се изчислява алгебрично:
     *
     *   С "Отказ от премия" (waiver включен):
     *     C_max = 0.40 × (budget_ceiling_annual - 15) / (1 + waiverRate)
     *     При I рисков клас: C_max = 0.40 × (budget_ceiling_annual - 15) / 1.0438
     *
     *   Без "Отказ от премия":
     *     C_max = 0.40 × (budget_ceiling_annual - 15)
     *
     *   Ако totalCoverages > C_max → намаляване пропорционално:
     *     scale_factor = C_max / totalCoverages
     *     PTN *= scale_factor, CI40 *= scale_factor (закръглени до 100 €)
     *     fractures и telemedicine са фиксирани — не се намаляват
     *
     * Следствие: annualSavings винаги ≥ 60% от инвестируемата база.
     */
    ul_coverage_sizing: {
      ptn_formula: "CEILING( PV(4%/12, (65-age)*12) * (net_income - state_disability_benefit) * 1.2, 100 )",
      ci40_formula: "(net_income - state_disability_benefit) * 24",
      step2_budget_check: "scale proportionally if totalCoverages > budget",
      step3_40pct_rule: {
        condition: "totalCoverages / (totalCoverages + annualSavings) > 0.40",
        c_max_with_waiver:
          "0.40 * (budget_ceiling_annual - 15) / (1 + waiverRate)",
        c_max_without_waiver:
          "0.40 * (budget_ceiling_annual - 15)",
        action: "scale PTN and CI40 proportionally to C_max; fractures and telemedicine are fixed",
        rounding: "round to nearest 100 EUR"
      }
    },

    /**
     * ИНТЕГРИРАНО ПОКРИТИЕ ЖИВОТ ПРИ UL (автоматичен план)
     * Статус: ✅ ПОТВЪРДЕНО
     *
     * Формула: integratedLifeCoverage = annualSavings × age_multiplier
     *
     * age_multiplier (от MetLifeULCalculator):
     *   възраст ≤ 25 г.  → ×30
     *   26–35 г.         → ×20
     *   36–45 г.         → ×15
     *   46–55 г.         → ×10
     *   56–65 г.         → ×6
     *
     * ⚠️ Горен праг от калкулатора: 15 000 € — под него няма нужда от здравен въпросник.
     * Ако формулата дава > 15 000 € → CEILING на 15 000 €.
     *
     * Пример: annualSavings = 1200 €, възраст 38 г. → multiplier = 15
     *   integratedLifeCoverage = 1200 × 15 = 18 000 € → CEILING → 15 000 €
     *
     * Пример: annualSavings = 600 €, възраст 38 г. → multiplier = 15
     *   integratedLifeCoverage = 600 × 15 = 9 000 € (без ограничение)
     */
    ul_integrated_life_coverage: {
      formula: "annualSavings * age_multiplier",
      age_multipliers: {
        "up_to_25":  30,
        "26_to_35":  20,
        "36_to_45":  15,
        "46_to_55":  10,
        "56_to_65":   6
      },
      max_without_health_questionnaire: 15000,
      ceiling_formula: "MIN(annualSavings * age_multiplier, 15000)"
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
     * ИЗБОР НА МЕТЛАЙФ ПРОДУКТ — АЛГОРИТЪМ
     * Статус: ✅ ПОТВЪРДЕНО
     *
     * Приоритет: UL → Term Life → ДЗИ Закрила (заместител)
     *
     * ⚠️ ВАЖНО: Изборът не може да стане без изчисление, защото
     * цената на покритията е РАЗЛИЧНА при UL (40 CI) vs Term Life (32 CI).
     * Затова се следва строга последователност:
     *
     * СТЪПКА 1 — Опитай UL:
     *   а) Изчисли покритията с UL тарифи (PTN, 40 CI, фрактури 1500, телемедицина)
     *   б) Приложи 40%-то правило за покрития (ul_coverage_sizing)
     *   в) annualSavings = (budget_ceiling_annual - 15) / (1 + waiverRate) - totalCoverages_UL
     *   г) Ако annualSavings / 12 ≥ 25 € → ИЗБЕРИ UL ✅ — край
     *
     * СТЪПКА 2 — Опитай Term Life (ако UL не се получи):
     *   а) Преизчисли покритията с Term Life тарифи:
     *        - Основно Живот (5 г.): net_income × 24 или мин. 3000 €
     *        - ПТН: същата PV формула
     *        - 32 CI (10 г.): (net_income - state_disability) × 24
     *        - Фрактури 1500 €, Телемедицина 15 €, Адм. такса 13 €
     *   б) Ако total_term_life_annual ≤ budget_ceiling_annual → ИЗБЕРИ Term Life ✅ — край
     *      (При Term Life покритията се намаляват пропорционално ако надвишат бюджета,
     *       НЕ се прилага 40%-то правило — Term Life е чисто застраховане без инвестиция)
     *
     * СТЪПКА 3 — ДЗИ Закрила (ако Term Life не се побира):
     *   → ИЗБЕРИ ДЗИ Закрила Платинен за клиента и партньора ✅
     *   → Уника и Дженерали НЕ се включват при тази стъпка
     */
    metlife_product_selection: {
      algorithm: "sequential: UL → Term Life → DZI Zakrila",
      step1_ul: {
        coverages_tariff: "UL (40 CI via METLIFE_PA_SECURITY_PLUS_COEFFICIENTS)",
        condition_to_pass: "annualSavings / 12 >= 25",
        min_annual_savings: 300,
        apply_40pct_rule: true
      },
      step2_term_life: {
        coverages_tariff: "Term Life (32 CI via METLIFE_PA_CRITICAL_ILLNESS_32_RATES yr10)",
        condition_to_pass: "total_term_life_annual <= budget_ceiling_annual",
        scale_if_over_budget: {
          scalable: ["basic_life", "PTN", "CI32"],
          fixed: ["fractures_1500", "telemedicine_15"],
          formula: "scale_factor = (budget_ceiling_annual - 13 - 15 - cost(fractures) - cost(telemedicine)) / (cost(life) + cost(PTN) + cost(CI32))",
          note: "Фрактурите и телемедицината се извадят от бюджета, остатъкът се разпределя пропорционално"
        },
        apply_40pct_rule: false,
        note: "Term Life е чисто застраховане — няма инвестиционна компонента за 40% правило"
      },
      step3_dzi_zakrila: {
        condition: "term_life does not fit in budget",
        package: "platinum",
        for_whom: "both_client_and_partner",
        uniqa_and_generali: "NOT included at this step"
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
      },
      budget_integration: {
        insurance_coverages: "calculated_together_with_ul_or_term_life_in_step1",
        investment_component: "combined_with_ul_annual_savings_for_optimization",
        note: "Инвестиционната вноска за Junior се разглежда заедно с UL инвестицията на клиент/партньор за целите на премийния бонус и таксата управление",
        premium_bonus_applies: true,
        av_charge_applies: true
      }
    },

    /**
     * ══════════════════════════════════════════════════════════════
     * ИНВЕСТИЦИОННИ ЦЕЛИ — АЛГОРИТМИ ЗА КАЛКУЛАЦИЯ
     * Статус: ✅ ПОТВЪРДЕНО
     * ══════════════════════════════════════════════════════════════
     *
     * ─────────────────────────────────────────
     * ЦЕЛ 1: ОБРАЗОВАНИЕ НА ДЕЦА (MetLife Junior)
     * ─────────────────────────────────────────
     * ВАЖНО: ⚠️ Целта е детето да има сумата когато навърши 20 г. (НЕ 19!)
     *
     * СТЪПКА 1 — Изчисли нуждата на дете:
     *   gap_per_child = (education_goal_total - existing_education_savings) / children_count
     *   horizon_years = 20 - child_age
     *
     * СТЪПКА 2 — Намери годишната вноска за Junior итеративно:
     *   За всяка кандидат-вноска P:
     *     - Определи premium_bonus% от premium_bonus_table (по P)
     *     - Определи av_charge% от av_charge_table (по P)
     *     - effective_annual_contribution = P × (1 + premium_bonus / 100)
     *     - net_annual_return = 0.08 - av_charge / 100
     *     - Симулирай година по година:
     *         balance[0] = 0
     *         balance[y] = (balance[y-1] + effective_annual_contribution) × (1 + net_annual_return)
     *     - Провери: balance[horizon_years] >= gap_per_child
     *
     * СТЪПКА 3 — Snap to nearest premium bonus threshold:
     *   Ако изчисленото P е между 1 800 и 2 999 → провери дали P ≥ 1 800 (bonus 2%)
     *   Ако изчисленото P е близо до 3 000 (разлика < ~10%) → вдигни до 3 000 (bonus 3%)
     *   Пример: Георги (4 г.) → изчислено 2 950 € → snap до 3 000 € за 3% бонус
     *
     * ─────────────────────────────────────────
     * ЦЕЛ 2: ПЕНСИЯ (MetLife Unit Linked)
     * ─────────────────────────────────────────
     * ПАРАМЕТРИ (фиксирани):
     *   retirement_age = 65
     *   inflation_rate = 3% годишно (0.03/12 месечно = g)
     *   post_retirement_return = 4% годишно (0.04/12 месечно = r)
     *   withdrawal_count = 240 месеца (20 години след пенсия)
     *
     * СТЪПКА 1 — Нужна консумация към днешна дата:
     *   monthly_consumption = total_monthly_income - financial_market_monthly
     *
     *   financial_market_monthly = SUM(liability_*_monthly) + monthly_investments + SUM(insurance_*)
     *   (т.е. всичко което НЕ е разход за живот: кредити + инвестиции + застраховки)
     *   Остават само разходите за живот (expense_* полета) — именно те трябва да се покрият при пенсия.
     *
     *   ⚠️ При ДВОЙКА: финансовият поток е ОБЩ за домакинството — полетата НЕ са разделени на двама.
     *   → total_monthly_income = client_net_income + partner_net_income
     *   → financial_market_monthly = общите liability_*_monthly + monthly_investments + insurance_* (домакинството)
     *   → monthly_consumption = разходите за живот на цялото домакинство (expense_* полета)
     *
     * СТЪПКА 2 — Оставащи години до пенсия:
     *   При ЕДИНИЧЕН клиент: years_to_retirement = 65 - client_age
     *   При ДВОЙКА: years_to_retirement = 65 - AVERAGE(client_age, partner_age)
     *
     * СТЪПКА 3 — Очаквана държавна пенсия (ДНЕШНА стойност — НЕ се коригира инфлационно):
     *   При ЕДИНИЧЕН клиент: state_pension_today = client_expected_state_pension
     *   При ДВОЙКА: state_pension_today = client_expected_state_pension + partner_expected_state_pension
     *
     *   ⚠️ Държавната пенсия НЕ се проектира инфлационно — тя е законодателно установена
     *   и не е ясно дали ще се увеличава. Използва се директно в днешни стойности.
     *
     *   ИЗЧИСЛЕНИЕ НА client_expected_state_pension (автоматично от анализа):
     *   Стъпка 1 — Брутен доход от нетен (netToBruto):
     *     Ако нето ≤ 1638.60 € → бруто = нето × 1.28869
     *     Ако нето > 1638.60 € → бруто = нето / 0.9 + 291
     *     При предприемач (entrepreneur) → бруто = 620 € (фиксирано)
     *
     *   Стъпка 2 — Очаквана пенсия:
     *     state_pension = MIN( MAX( gross_income × 0.45, 347 ), 1739 )
     *     Мин. 347 € (социална пенсия), Макс. 1739 €
     *     Ако пенсионната възраст < минималната за категорията → социална пенсия 67 €
     *       (Трета категория → мин. 65 г.; Втора → 60 г.; Първа → 55 г.)
     *
     * СТЪПКА 4 — Първо теглене (само нуждата се проектира инфлационно):
     *   future_consumption = monthly_consumption × (1 + 0.03/12)^(years_to_retirement * 12)
     *   pension_gap = future_consumption - state_pension_today
     *
     *   // Пенсионният gap = бъдещата инфлационно коригирана нужда МИНУС днешната държавна пенсия
     *
     * СТЪПКА 5 — Нужен корпус при пенсиониране (growing annuity PV):
     *   r = 0.04 / 12   // месечна доходност след пенсия
     *   g = 0.03 / 12   // месечна инфлация
     *   required_corpus = pension_gap / (r - g) × [1 - ((1 + g) / (1 + r))^240]
     *
     *   ✅ Верификация: monthly_consumption=6000€, years=32, state_pension_today=3478€
     *   → future_consumption = 6000×(1.0025)^384 ≈ 15 594 €
     *   → pension_gap = 15 594 - 3 478 = 12 116 €/месец
     *   → corpus = 12116 / 0.000833 × [1 - (1.0025/1.003333)^240] ≈ 2 627 000 €
     *
     * СТЪПКА 6 — Намери годишната UL вноска итеративно:
     *   За клиент и партньор (всеки поотделно): target = required_corpus / 2
     *   ✅ Разпределението е ПОРАВНО — независимо от дохода на всеки.
     *   За всяка кандидат-вноска P:
     *     - Определи premium_bonus% и av_charge% от таблиците
     *     - Симулирай UL проекция до 65 г.:
     *         effective = P × (1 + premium_bonus / 100)
     *         net_return = assumed_return - av_charge / 100  // assumed_return = 8%
     *         balance[y] = (balance[y-1] + effective) × (1 + net_return)
     *     - Провери: balance[years_to_retirement] >= target
     *   Ако е невъзможно в рамките на бюджета → доближи максимално и отбележи shortfall
     *
     * ─────────────────────────────────────────
     * ОПТИМИЗАЦИЯ НА ИНВЕСТИЦИОННОТО РАЗПРЕДЕЛЕНИЕ
     * ─────────────────────────────────────────
     * ЛОГИКА:
     *   1. Изчисли нужните вноски за пенсия (клиент + партньор) и образование (всяко дете)
     *   2. Сумирай: total_investment_needed = ul_client + ul_partner + Σ(junior_per_child)
     *   3. Ако total_investment_needed <= investment_budget_remaining:
     *      → Използвай точно нужните суми (не е нужно да се достига таванът)
     *   4. Ако total_investment_needed > investment_budget_remaining:
     *      → Намали пропорционално или по приоритет:
     *        a) Junior (образование) — намали от по-далечните хоризонти първо
     *        b) UL (пенсия) — намали и двамата пропорционално
     *        c) Отбележи shortfall в плана
     *
     * SNAP-TO-THRESHOLD ПРАВИЛО (при оптимизация нагоре):
     *   Ако има оставащ бюджет и добавянето на разлика до следващия праг < 5% от бюджета
     *   → Snap до следващия праг за по-добър bonus/av_charge:
     *     Прагове за Premium Bonus: 1800, 3000, 4200 €/год.
     *     Прагове за AV Charge: 720, 960, 1200, 1500, 2400, 3600 €/год.
     *
     * ASSUMED RETURN ЗА ПРОЕКЦИИ: 8% годишно (стандартен за MetLife)
     */
    investment_goals_algorithm: {
      junior_target_age: 20,  // ⚠️ 20 г., НЕ 19!
      pension_retirement_age: 65,
      pension_inflation_rate: 0.03,
      pension_post_retirement_return: 0.04,
      pension_withdrawal_count: 240,
      ul_assumed_return: 0.08,  // 8% — стандартен за всички проекции (UL, Junior)
      // ВАЖНО: 8% НЕ е груб линеен процент — използва се директно чрез MetLifeULCalculator.projection,
      // която симулира реалните такси: AV charge (getAVCharge), COI (getMonthlyMortalityRate),
      // investible premium rate (getInvestiblePremiumRate), premium bonus (getPremiumBonus).
      // За намиране на нужната годишна вноска се използва БИНАРНО ТЪРСЕНЕ:
      //   low = 300 (минимум), high = budget_ceiling_annual
      //   ~20 итерации докато |accountValue[age=65] - target| < 1 €
      // Причина: compound interest прави връзката P→corpus нелинейна — линейна апроксимация
      // дава грешки до 10-20% при дълги хоризонти (млади клиенти).
      // След пенсия парите се преместват в нискорискови активи (облигации) → post_retirement_return = 4%.
      ul_fund_allocation: {
        "Световни акции (развити пазари)": "50%",
        "Акции развиващи се пазари": "50%",
        "Световни ценни книжа (облигации)": "0%"
      },
      /**
       * ОПРЕДЕЛЯНЕ НА ХОРИЗОНТА (за всеки партньор поотделно)
       * Статус: ✅ ПОТВЪРДЕНО
       *
       * Алгоритъмът се прилага ИНДИВИДУАЛНО за клиента и партньора.
       * При двойка единият може да ползва желаната си възраст, другият да падне на 65.
       *
       * СЦЕНАРИЙ А — Желана пенсионна възраст (desired_retirement_age < 65):
       *   horizon_years    = desired_retirement_age - current_age   // по-кратък хоризонт
       *   withdrawal_years = 85 - desired_retirement_age            // по-дълъг период за харчене
       *   state_pension    = 67 € (социална — преди 65 г. няма право на редовна пенсия)
       *   → Изчисли required_corpus_A с тези параметри
       *   → Провери дали UL вноската за corpus_A / 2 се побира в бюджета
       *
       * СЦЕНАРИЙ Б — Fallback към 65 г.:
       *   horizon_years    = 65 - current_age
       *   withdrawal_years = 85 - 65 = 20 г. (240 месеца)
       *   state_pension    = MIN(MAX(gross × 0.45, 347), 1739)   // нормална формула
       *   → required_corpus_B (винаги по-благоприятен от A)
       *
       * ИЗБОР:
       *   Ако corpus_A може да се финансира в рамките на бюджета → Сценарий А ✅
       *   Иначе → Сценарий Б (65 г.) ✅
       *
       * ⚠️ При desired_retirement_age === 65 → директно Сценарий Б (без проверка на А)
       */
      years_to_retirement_algorithm: "per_person: try desired_retirement_age first, fallback to 65",
      years_to_retirement_couple: "applied per person individually — not averaged",
      years_to_retirement_single: "same algorithm: try client_retirement_age, fallback to 65",

      /**
       * СЪЩЕСТВУВАЩИ АКТИВИ — ПРИСПАДАНЕ ОТ ПЕНСИОННИЯ КОРПУС
       * Статус: ✅ ПОТВЪРДЕНО
       *
       * Приспадат се само ликвидни/инвестиционни активи (БЕЗ основен дом, коли).
       * Проектират се до 65 г. при съответната доходност и се изваждат от required_corpus.
       *
       * АКТИВ 1 — Финансови инвестиции (от "Финансов поток" → Активи):
       *   Включва: asset_medium_term_savings + asset_long_term_savings
       *   Доходност: 5% годишно
       *   Формула: FV(5%, years_to_retirement, 0, -current_value)
       *   Приспада се от required_corpus: corpus_net = required_corpus - FV_investments
       *
       * АКТИВ 2 — Втори и трети имот (от "Защита на собствеността" → Недвижимо имущество):
       *   Включва: property_2_value + property_3_value (ако съществуват)
       *   НЕ включва: основния дом (current_housing) — приема се за ползване, не продажба
       *   Доходност: 3% годишен ръст (инфлация на имотите)
       *   Формула: FV(3%, years_to_retirement, 0, -property_value)
       *   Приспада се от required_corpus след финансовите активи
       *
       * КРАЙНА ФОРМУЛА:
       *   fv_investments = (asset_medium_term_savings + asset_long_term_savings) × (1.05)^years
       *   fv_properties  = (property_2_value + property_3_value) × (1.03)^years
       *   corpus_net = MAX(0, required_corpus - fv_investments - fv_properties)
       *
       * Полетата в FinancialAnalysisSubmission:
       *   → asset_medium_term_savings, asset_long_term_savings
       *   → property_2_value (has_property_2 = true), property_3_value (has_property_3 = true)
       */
      existing_assets_deduction: {
        financial_investments: {
          fields: ["asset_medium_term_savings", "asset_long_term_savings"],
          annual_return: 0.05,
          formula: "FV = value × (1.05)^years_to_retirement"
        },
        secondary_properties: {
          fields: ["property_2_value", "property_3_value"],
          condition: ["has_property_2 === true", "has_property_3 === true"],
          annual_growth: 0.03,
          formula: "FV = value × (1.03)^years_to_retirement",
          excludes: "current_housing (основен дом — не се продава)"
        },
        corpus_net_formula: "MAX(0, required_corpus - fv_investments - fv_properties)"
      },

      /**
       * ДОБРОВОЛНА ПЕНСИЯ — 3-ТИ СТЪЛБ
       * Статус: ✅ ПОТВЪРДЕНО
       *
       * Проектира се до 65 г. и се приспада от required_corpus.
       * Доходност: 3% годишно
       *
       * Полета от FinancialAnalysisSubmission (секция "Пенсия"):
       *   Клиент:
       *     - client_voluntary_pension_monthly  → месечна вноска (€)
       *     - client_voluntary_pension_total    → обща стойност на партидата (€) = начален баланс
       *   Партньор:
       *     - partner_voluntary_pension_monthly → месечна вноска (€)
       *     - partner_voluntary_pension_total   → обща стойност на партидата (€) = начален баланс
       *
       * Условие за включване: client_voluntary_pension === true / partner_voluntary_pension === true
       *
       * ФОРМУЛА (FV на анюитет + начален баланс):
       *   fv_voluntary = FV(3%/12, years*12, -monthly_contribution, -current_balance)
       *   // т.е. расте при 3% годишно, с редовни месечни вноски
       *
       * Приспада се от corpus_net:
       *   corpus_final = MAX(0, corpus_net - fv_voluntary_client - fv_voluntary_partner)
       */
      voluntary_pension_deduction: {
        annual_return: 0.03,
        client_fields: {
          monthly: "client_voluntary_pension_monthly",
          balance: "client_voluntary_pension_total",
          condition: "client_voluntary_pension === true"
        },
        partner_fields: {
          monthly: "partner_voluntary_pension_monthly",
          balance: "partner_voluntary_pension_total",
          condition: "partner_voluntary_pension === true"
        },
        formula: "FV(3%/12, years*12, -monthly, -current_balance)",
        deduction_order: "after existing_assets_deduction"
      },

      /**
       * СМЪРТ НА ПАРТНЬОР — ТРЕТИРАНЕ В ПЛАНА
       * Статус: ✅ ПОТВЪРДЕНО
       *
       * Пенсионният план НЕ моделира изрично смъртта на единия партньор.
       * Всеки планира своите 50% от корпуса независимо.
       * Рискът "смърт преди пенсия" е покрит от животозастраховането (Term Life / UL),
       * чието покритие е net_income × 24 — отделен механизъм извън пенсионния план.
       */
      death_of_partner_during_accumulation: {
        modeled_in_pension_plan: false,
        covered_by: "life_insurance (term_life or ul_integrated_life)",
        note: "Всеки партньор планира своите 50% от корпуса независимо"
      },

      /**
       * ПРИОРИТЕТ ПРИ НЕДОСТАТЪЧЕН ИНВЕСТИЦИОНЕН БЮДЖЕТ
       * Статус: ✅ ПОТВЪРДЕНО
       *
       * Когато investment_budget_remaining < (ul_pension_needed + junior_education_needed):
       *
       * ПРИОРИТЕТ: Образование (Junior) > Пенсия (UL)
       *
       * Логика:
       *   1. Първо се финансира образованието на децата — хоризонтът е по-кратък
       *      и отлагането е по-вредно (детето порасва и прозорецът се затваря)
       *   2. Остатъкът от бюджета отива към UL пенсия (клиент + партньор)
       *   3. Ако остатъкът не стига дори за образованието → Junior се намалява
       *      пропорционално между децата, и пенсията не се включва
       *   4. Shortfall се отбелязва в плана
       *
       * Алгоритъм:
       *   budget_for_education = MIN(investment_budget_remaining, junior_education_needed)
       *   budget_for_pension   = MAX(0, investment_budget_remaining - budget_for_education)
       */
      investment_priority_on_shortfall: {
        /**
         * СЦЕНАРИЙ 1 — Бюджетът не стига за пълно изпълнение на всички цели:
         *   → Пропорционално намаляване на ВСИЧКИ цели (Junior + UL пенсия)
         *   → И двете се включват в плана, но с по-малки вноски
         *   → scale_factor = investment_budget_remaining / total_investment_needed
         *   → junior_scaled = junior_needed * scale_factor (за всяко дете)
         *   → ul_scaled = ul_needed * scale_factor (за клиент и партньор)
         *
         * СЦЕНАРИЙ 2 — Бюджетът е толкова малък, че не може да се направи
         *   дори минимална вноска и за децата, и за клиентите (min = 300 €/год.):
         *   → Приоритет: Образование (Junior) > Пенсия (UL)
         *   → Junior се финансира първо (децата имат по-кратък хоризонт)
         *   → UL пенсия не се включва, shortfall се отбелязва
         *
         * Минимална вноска за включване: 300 €/год. (25 €/месец) за всеки договор
         */
        scenario_1_proportional: {
          condition: "investment_budget_remaining < total_investment_needed AND investment_budget_remaining >= min_viable_for_both",
          action: "scale all goals proportionally",
          formula: "scale_factor = investment_budget_remaining / total_investment_needed"
        },
        scenario_2_priority: {
          condition: "investment_budget_remaining < min_viable_for_both",
          action: "education first, then pension with remainder",
          order: ["education_junior", "pension_ul"],
          rationale: "При екстремно нисък бюджет — по-кратният хоризонт на децата е критичен"
        },
        min_annual_per_contract: 300
      },

      /**
       * SNAP-TO-THRESHOLD ПРАВИЛО (автоматична оптимизация нагоре)
       * Статус: ✅ ПОТВЪРДЕНО
       *
       * След като нужните вноски за пенсия и образование са изчислени,
       * ако остане свободен бюджет — проверява се дали snap до следващ праг е изгоден.
       *
       * УСЛОВИЕ ЗА SNAP:
       *   gap_to_next_threshold = next_threshold - current_annual_premium
       *   Ако gap_to_next_threshold ≤ 0.05 × investment_budget_remaining → snap автоматично
       *
       * Прагове за Premium Bonus: 1800, 3000, 4200 €/год.
       * Прагове за AV Charge:     720, 960, 1200, 1500, 2400, 3600 €/год.
       *
       * Snap се прилага на всеки договор поотделно (клиент, партньор, всяко дете).
       * След snap — бюджетът се преизчислява и се проверява следващият праг.
       *
       * Пример:
       *   Изчислена вноска Junior: 2 950 €/год., следващ праг: 3 000 €
       *   gap = 50 €; investment_budget_remaining = 1 500 €
       *   50 ≤ 0.05 × 1500 = 75 → ✅ snap до 3 000 € (бонус 3% вместо 2%)
       */
      snap_to_threshold: {
        applies: true,
        /**
         * АЛГОРИТЪМ (Вариант В — ✅ ПОТВЪРДЕНО 2026-03-26):
         *
         * СТЪПКА A — Per-contract (за всеки договор поотделно):
         *   1. Намери P с бинарно търсене (~20 итерации)
         *   2. Намери следващия праг над P (от premium_bonus_thresholds + av_charge_thresholds)
         *   3. Изчисли gap = next_threshold - P
         *   4. Ако gap <= 0.05 × investment_budget_remaining → маркирай договора за snap
         *
         * СТЪПКА B — Финална проверка на общия бюджет:
         *   5. Сумирай всички маркирани snap-ове: total_snap = SUM(gap_per_contract)
         *   6. Ако total_snap <= investment_budget_remaining → ВСИЧКИ snap-ват ✅
         *      Ако total_snap > investment_budget_remaining → НИКОЙ не snap-ва ❌
         *      (не се избира частично — всичко или нищо)
         *
         * Защо "всичко или нищо":
         *   - Избягва субективност при избор кой snap-ва
         *   - 5%-ният филтър в Стъпка A вече гарантира, че само "близки" прагове влизат
         *   - На практика edge cases са редки
         */
        condition_per_contract: "gap_to_next_threshold <= 0.05 * investment_budget_remaining",
        premium_bonus_thresholds: [1800, 3000, 4200],
        av_charge_thresholds: [720, 960, 1200, 1500, 2400, 3600],
        applies_per_contract: true,
        application_order: "simultaneous — all or nothing",
        simultaneous_constraint: "SUM(all_snaps) <= investment_budget_remaining",
        recheck_after_snap: true
      },

      /**
       * PARTNERS INVESTMENTS
       * Статус: ✅ ПОТВЪРДЕНО — НЕ СЕ ПРЕДЛАГА
       *
       * Partners Investments НЕ се включва в никакъв автоматично генериран план.
       * Продуктът се третира като несъществуващ за целите на плановия генератор.
       */
      partners_investments: {
        include_in_plans: false,
        role: "excluded — not offered under any circumstances"
      }
    },

    /**
     * ТАБЛИЦА Б: АДМИНИСТРАТИВНА ТАКСА ЗА УПРАВЛЕНИЕ (AV Charge)
     * Статус: ✅ ПОТВЪРДЕНО (от документ MetLife УЖ Общи условия, в сила от 02.12.2024)
     *
     * Изчислява се като % от стойността на инвестиционната сметка (годишно)
     * Прилага се ПО ДОГОВОР (клиент, партньор и junior — всеки поотделно)
     *
     * Годишна премия (€)  →  AV Charge (% годишно от сметката)
     *   300  – 719   →  2.00%
     *   720  – 959   →  1.75%
     *   960  – 1199  →  1.50%
     *   1200 – 1499  →  1.25%
     *   1500 – 2399  →  1.00%
     *   2400 – 3599  →  0.75%
     *   3600+        →  0.50%
     */
    av_charge_table: [
      { annual_premium_from: 300,  annual_premium_to: 719,  rate_pct: 2.00 },
      { annual_premium_from: 720,  annual_premium_to: 959,  rate_pct: 1.75 },
      { annual_premium_from: 960,  annual_premium_to: 1199, rate_pct: 1.50 },
      { annual_premium_from: 1200, annual_premium_to: 1499, rate_pct: 1.25 },
      { annual_premium_from: 1500, annual_premium_to: 2399, rate_pct: 1.00 },
      { annual_premium_from: 2400, annual_premium_to: 3599, rate_pct: 0.75 },
      { annual_premium_from: 3600, annual_premium_to: null, rate_pct: 0.50 }
    ],

    /**
     * ТАБЛИЦА В: ПРЕМИЕН БОНУС
     * Статус: ✅ ПОТВЪРДЕНО (от документ MetLife УЖ Общи условия, в сила от 02.12.2024)
     *
     * % от премията/вноската по основния договор, с който MetLife увеличава инвестиционната сметка
     * Прилага се ПО ДОГОВОР (клиент, партньор и junior — всеки поотделно)
     *
     * Годишна премия (€)  →  Премиен бонус (% от годишната вноска)
     *   1200 – 1799  →  1%
     *   1800 – 2999  →  2%
     *   3000 – 4199  →  3%
     *   4200+        →  4%
     *   (под 1200 €  →  0% — без бонус)
     */
    premium_bonus_table: [
      { annual_premium_from: 1200, annual_premium_to: 1799, bonus_pct: 1 },
      { annual_premium_from: 1800, annual_premium_to: 2999, bonus_pct: 2 },
      { annual_premium_from: 3000, annual_premium_to: 4199, bonus_pct: 3 },
      { annual_premium_from: 4200, annual_premium_to: null, bonus_pct: 4 }
    ],

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

      // Следваща по приоритет след животозастраховането — включва се ако остатъкът от бюджета стига
      uniqa_zdrave_i_tsennost: {
        package: "europa",
        for_whom: "client, partner, AND all_children",
        min_age: 0,
        max_age_at_signup: 64,
        note: "По една отделна полица за клиента, партньора и всяко дете. Достъпно за възраст 0–64 г. към датата на сключване.",
        // ✅ ПОТВЪРДЕНО (В81+В82, 2026-03-26):
        // remaining_budget = budget_ceiling_annual - ul_client_total - ul_partner_total - SUM(junior_per_child)
        // Всички MetLife договори от Стъпка 1 се приспадат изцяло (пълна премия на всеки договор).
        // ul_total = annualSavings + totalCoverages + adminFee(15) + premiumWaiver (за всеки договор поотделно)
        // При Term Life: remaining_budget = budget_ceiling_annual - term_life_client - term_life_partner - SUM(junior_per_child)
        budget_check: "remaining_budget = budget_ceiling_annual - SUM(all_metlife_step1_premiums)",
        // ✅ ПОТВЪРДЕНО (В83, 2026-03-26):
        // Уника се включва ПОРЕДНО: клиент → партньор → деца (по ред на възраст)
        // Всяка полица се проверява поотделно дали се побира в оставащия бюджет.
        // Ако за клиента стига, но за партньора не → клиентът получава Уника, партньорът не.
        // Ако за клиент и партньор стига, но само за 1 дете → само то получава Уника.
        include_order: ["client", "partner", "child_1", "child_2", "child_3", "child_4", "child_5"],
        include_when: "remaining_budget >= uniqa_premium_for_this_person (checked per person sequentially)",
        on_insufficient_budget: "skip remaining persons — не се намалява, не се заменя",
        skip_if_employer_health_insurance: false,
        skip_rationale: "Уника Здраве и Ценност Селект НЕ е допълнително здравно застраховане — покрива критични заболявания и здравна ценност. Работодателската здравна застраховка НЕ е причина да се пропуска. Включва се ВИНАГИ за клиент, партньор и деца."
      },

      // Включва се ако остатъкът от бюджета стига след Уника
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
        include_when: "remaining_budget >= total_generali_premium (after Uniqa deducted)",
        budget_check: "remaining_budget = budget_ceiling_annual - metlife_annual_premium - uniqa_annual_premium",
        on_insufficient_budget: "skip — не се включва",
        skip_per_person: {
          client: "has_employer_health_insurance === true",
          partner: "partner_has_employer_health_insurance === true"
        },
        skip_rationale: "Правилото е строго индивидуално: Дженерали Basic се включва само за лицата БЕЗ работодателска здравна застраховка. Примери: единичен клиент с работодателска → не се включва; двойка, двамата имат → не се включва за никого; двойка, само единият има → включва се само за другия; двойка, никой няма → включва се за двамата. Не се предлага за деца.",
        source_fields: {
          client: "FinancialAnalysisSubmission.has_employer_health_insurance",
          partner: "FinancialAnalysisSubmission.partner_has_employer_health_insurance"
        }
      },

      // Нишови продукти — само upsale, не в стандартните планове
      metlife_grija:    { include_in_plans: false, role: "niche_upsale_only" },
      metlife_medica:   { include_in_plans: false, role: "niche_upsale_only" },
      dzi_best_doctors: { include_in_plans: false, role: "niche_upsale_only" }
    }

  }

};