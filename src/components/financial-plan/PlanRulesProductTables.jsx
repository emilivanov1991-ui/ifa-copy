/**
 * ============================================================
 *   ФИНАНСОВ ПЛАН — ТАБЛИЦИ И ПАКЕТНИ ПРОДУКТИ (v0.4)
 *
 *   Извлечено от PlanRulesConstitution за управление на размера.
 *   Последна актуализация: 2026-03-26
 * ============================================================
 */

export const PLAN_PRODUCT_TABLES = {

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
      // ✅ ПОТВЪРДЕНО (В88, 2026-03-26):
      // Максимална възраст при сключване: 64 г. (включително).
      // При 65+ г. → лицето е НЕДОПУСТИМО и Уника се пропуска само за него.
      // Логика: ако клиентът е 65+, но партньорът е 60 → партньорът получава Уника.
      // Ако и двамата са 65+ → Уника не се включва изобщо.
      age_eligibility_check: "age <= 64 — skip person if age > 64",
      note: "По една отделна полица за клиента, партньора и всяко дете. Достъпно за възраст 0–64 г. към датата на сключване.",
      // ✅ ПОТВЪРДЕНО (В81+В82): remaining_budget = budget_ceiling_annual - SUM(all_metlife_step1_premiums)
      budget_check: "remaining_budget = budget_ceiling_annual - SUM(all_metlife_step1_premiums)",
      // ✅ ПОТВЪРДЕНО (В83+В84): ред клиент → партньор → деца (група)
      include_order: ["client", "partner", "children_as_group"],
      include_when_adults: "remaining_budget >= uniqa_premium_for_this_person (per person)",
      include_when_children: "remaining_budget >= SUM(uniqa_per_child for ALL children)",
      on_insufficient_budget_adults: "skip this person, continue to next",
      on_insufficient_budget_children: "skip ALL children — не се включва частично за някои деца",
      skip_if_employer_health_insurance: false,
      // ✅ ПОТВЪРДЕНО (В87): Уника покрива критични заболявания — не е заместима от работодателска застраховка
      skip_rationale: "Уника Здраве и Ценност Селект покрива критични заболявания и здравна ценност — не е заместима от работодателска здравна застраховка. Включва се ВИНАГИ."
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
      // ✅ ПОТВЪРДЕНО (В85+В86): "всичко или нищо" само за допустимите лица (без работодателска застраховка)
      include_when: "remaining_budget >= SUM(generali_premiums_for_eligible_persons)",
      budget_check: "remaining_budget = budget_ceiling_annual - metlife_annual_premium - uniqa_annual_premium",
      on_insufficient_budget: "skip ALL eligible persons — не се включва частично",
      skip_per_person: {
        client: "has_employer_health_insurance === true",
        partner: "partner_has_employer_health_insurance === true"
      },
      skip_rationale: "Дженерали Basic се включва само за лицата БЕЗ работодателска здравна застраховка.",
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

};