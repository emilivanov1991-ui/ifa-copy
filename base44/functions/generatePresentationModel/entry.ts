import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * generatePresentationModel
 *
 * Transforms raw FinancialPlan + ProductOffer + FinancialAnalysisSubmission data
 * into a clean PRESENTATION_RENDER_MODEL that the presentation_advisor agent reads.
 *
 * This decouples the agent from raw entity schemas — the agent never reads
 * FinancialPlan directly; it reads PresentationModel instead.
 *
 * Called non-blocking from PlanLoadingScreen after generateFinancialPlan completes.
 */

const EUR_TO_BGN = 1.95583;

function fv(pmt, annualRate, years) {
  if (years <= 0 || pmt <= 0) return 0;
  if (annualRate === 0) return pmt * years * 12;
  const r = annualRate / 12;
  const n = years * 12;
  return Math.round(pmt * ((Math.pow(1 + r, n) - 1) / r));
}

function formatEur(v) {
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M €';
  if (v >= 1000) return (v / 1000).toFixed(0) + 'K €';
  return v.toFixed(0) + ' €';
}

function dailyCostBGN(monthlyEur) {
  return ((monthlyEur * EUR_TO_BGN) / 30).toFixed(2);
}

const PRODUCT_TYPE_LABELS = {
  bg: {
    ul_investment:    'Инвестиции',
    term_life:        'Живот',
    health_insurance: 'Здраве',
    critical_illness: 'Критична болест',
    pension_plan:     'Пенсия',
    education_plan:   'Образование',
    personal_accident:'Злополука',
  },
  en: {
    ul_investment:    'Investments',
    term_life:        'Life',
    health_insurance: 'Health',
    critical_illness: 'Critical illness',
    pension_plan:     'Pension',
    education_plan:   'Education',
    personal_accident:'Personal accident',
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { plan_id, language_code = 'bg' } = await req.json();

    if (!plan_id) {
      return Response.json({ error: 'plan_id is required' }, { status: 400 });
    }

    const isBG = language_code === 'bg';
    const typeLabels = PRODUCT_TYPE_LABELS[language_code] || PRODUCT_TYPE_LABELS.bg;

    // ─── Load raw data ───────────────────────────────────────────────────────
    const plans = await base44.asServiceRole.entities.FinancialPlan.filter({ id: plan_id });
    if (!plans.length) {
      return Response.json({ error: 'Plan not found' }, { status: 404 });
    }
    const plan = plans[0];

    const [offers, analyses] = await Promise.all([
      base44.asServiceRole.entities.ProductOffer.filter({ plan_id }),
      plan.analysis_id
        ? base44.asServiceRole.entities.FinancialAnalysisSubmission.filter({ id: plan.analysis_id })
        : Promise.resolve([]),
    ]);
    const a = analyses[0] || {};

    // ─── Client block ─────────────────────────────────────────────────────────
    const clientFirstName = a.client_first_name || plan.client_first_name || (isBG ? 'Клиент' : 'Client');
    const clientLastName  = a.client_last_name  || '';
    const clientAge       = a.client_age        || plan.partner1_age || 0;
    const partnerAge      = a.partner_age       || plan.partner2_age || null;
    const includePartner  = !!(a.include_partner || (partnerAge && partnerAge > 0));
    const partnerFirstName = includePartner ? (a.partner_first_name || (isBG ? 'Партньор' : 'Partner')) : null;
    const childrenCount   = a.children_count    || 0;

    const clientNetIncome    = a.client_net_income    || a.client_monthly_net_income    || 0;
    const partnerNetIncome   = includePartner ? (a.partner_net_income || a.partner_monthly_net_income || 0) : 0;
    const totalMonthlyIncome = clientNetIncome + partnerNetIncome;

    const clientRetirementAge  = a.client_retirement_age  || 65;
    const partnerRetirementAge = includePartner ? (a.partner_retirement_age || 65) : null;
    const avgRetirementAge     = includePartner && partnerAge
      ? Math.round((clientRetirementAge + partnerRetirementAge) / 2)
      : clientRetirementAge;
    const yearsToRetirement    = Math.max(5, avgRetirementAge - Math.max(clientAge, 1));

    const clientBlock = {
      first_name:          clientFirstName,
      last_name:           clientLastName,
      full_name:           [clientFirstName, clientLastName].filter(Boolean).join(' '),
      age:                 clientAge,
      include_partner:     includePartner,
      partner_first_name:  partnerFirstName,
      partner_age:         partnerAge,
      children_count:      childrenCount,
      monthly_net_income:  totalMonthlyIncome,
      retirement_age:      clientRetirementAge,
      years_to_retirement: yearsToRetirement,
      language:            language_code,
    };

    // ─── Products block ───────────────────────────────────────────────────────
    const activeOffers = (offers || []).filter(o => (o.monthly_premium || 0) > 0);

    const productsBlock = activeOffers.map(o => {
      const daily   = dailyCostBGN(o.monthly_premium || 0);
      const typeLabel = typeLabels[o.product_type] || o.product_type || (isBG ? 'Продукт' : 'Product');
      const coverageStr = o.coverage_amount > 0 ? formatEur(o.coverage_amount) : null;

      return {
        offer_id:          o.id,
        product_type:      o.product_type,
        product_type_label: typeLabel,
        product_name:      o.product_name,
        provider:          o.provider,
        beneficiary:       o.beneficiary_name || o.beneficiary,
        monthly_premium:   o.monthly_premium,
        daily_cost_bgn:    parseFloat(daily),
        daily_cost_str:    isBG ? `${daily} лв./ден` : `${daily} BGN/day`,
        coverage_amount:   o.coverage_amount || 0,
        coverage_str:      coverageStr,
        term_years:        o.term_years || null,
        expected_value:    o.expected_value || null,
        // Presentation hook: "Less than X" analogy
        less_than:         isBG
          ? `По-малко от цената на ${o.monthly_premium < 50 ? 'хапване навън' : 'месечна абонаментна карта'} на ден`
          : `Less than the cost of ${o.monthly_premium < 50 ? 'eating out' : 'a monthly pass'} per day`,
      };
    });

    // ─── Summary block ────────────────────────────────────────────────────────
    const totalMonthlyPremium = plan.total_monthly_premium
      || activeOffers.reduce((s, o) => s + (o.monthly_premium || 0), 0);
    const totalCoverage       = plan.total_coverage
      || activeOffers.reduce((s, o) => s + (o.coverage_amount || 0), 0);
    const totalExpectedValue  = plan.total_expected_value
      || activeOffers.reduce((s, o) => s + (o.expected_value || 0), 0);

    const summaryBlock = {
      total_monthly_premium:  totalMonthlyPremium,
      total_monthly_bgn:      Math.round(totalMonthlyPremium * EUR_TO_BGN),
      total_daily_bgn:        parseFloat(dailyCostBGN(totalMonthlyPremium)),
      total_coverage:         totalCoverage,
      total_coverage_str:     formatEur(totalCoverage),
      total_expected_value:   totalExpectedValue,
      product_count:          productsBlock.length,
      premium_vs_income_pct:  totalMonthlyIncome > 0
        ? parseFloat(((totalMonthlyPremium / totalMonthlyIncome) * 100).toFixed(1))
        : null,
    };

    // ─── Financial context block ──────────────────────────────────────────────
    const reserveNeed       = plan.reserve_need        || Math.round(totalMonthlyIncome * 6);
    const pensionGapP1      = plan.pension_gap_p1      || 0;
    const pensionGapP2      = plan.pension_gap_p2      || 0;
    const availableForInv   = plan.available_for_investment || 0;

    const financialContext = {
      total_monthly_income:   totalMonthlyIncome,
      reserve_need:           reserveNeed,
      reserve_need_str:       formatEur(reserveNeed),
      pension_gap_p1:         pensionGapP1,
      pension_gap_p2:         pensionGapP2,
      total_pension_gap:      pensionGapP1 + pensionGapP2,
      total_pension_gap_str:  formatEur(pensionGapP1 + pensionGapP2),
      available_for_investment: availableForInv,
      monthly_balance_after_plan: totalMonthlyIncome > 0
        ? Math.round(totalMonthlyIncome - totalMonthlyPremium)
        : null,
    };

    // ─── Projections block ────────────────────────────────────────────────────
    const investmentTypes    = ['ul_investment', 'education_plan', 'pension_plan'];
    const monthlyInvestment  = activeOffers
      .filter(o => investmentTypes.includes(o.product_type))
      .reduce((s, o) => s + (o.monthly_premium || 0), 0) || availableForInv;

    const projectionsBlock = {
      monthly_investment:   monthlyInvestment,
      years_horizon:        yearsToRetirement,
      at_4pct:  fv(monthlyInvestment, 0.04, yearsToRetirement),
      at_7pct:  fv(monthlyInvestment, 0.07, yearsToRetirement),
      at_10pct: fv(monthlyInvestment, 0.10, yearsToRetirement),
      at_4pct_str:  formatEur(fv(monthlyInvestment, 0.04, yearsToRetirement)),
      at_7pct_str:  formatEur(fv(monthlyInvestment, 0.07, yearsToRetirement)),
      at_10pct_str: formatEur(fv(monthlyInvestment, 0.10, yearsToRetirement)),
    };

    // ─── Objection anchors ────────────────────────────────────────────────────
    const dailyTotal = parseFloat(dailyCostBGN(totalMonthlyPremium));
    const objectionAnchors = isBG ? [
      {
        objection:    'Скъпо е',
        category:     'price',
        response:     `Разбирам. Нека го разгледаме реалистично — говорим за ${dailyTotal} лв. на ден, или ${totalMonthlyPremium} € месечно. Срещу тях получавате ${summaryBlock.total_coverage_str} застрахователно покритие за цялото семейство. Харчите ли повече за едно хапване навън?`,
      },
      {
        objection:    'Ще помисля',
        category:     'timing',
        response:     `Напълно разбирам. Важно е да знаете обаче — застрахователните премии нарастват с възрастта. На ${clientAge} г. Вашата такса е значително по-ниска, отколкото след дори 1 година. Всеки отложен месец буквално Ви струва пари.`,
      },
      {
        objection:    'Имам застраховка от работодателя',
        category:     'product_fit',
        response:     `Работодателската застраховка е добра добавка, но принадлежи на работодателя Ви. Ако смените работата — губите я. Личният Ви план е ВАШ — за цял живот, независимо от трудовия договор.`,
      },
      {
        objection:    'Не вярвам на застрахователните компании',
        category:     'trust',
        response:     `Скептицизмът е разбираем. Именно затова IFA работи само с MetLife (топ 5 световен застраховател, 150+ г. история), УНИКА (Виена Иншурънс Груп) и Generali (топ европейска група). Имам реален пример за изплатено обезщетение, ако желаете.`,
      },
    ] : [
      {
        objection:    "It's too expensive",
        category:     'price',
        response:     `I understand. Let's look at it realistically — we're talking about ${dailyTotal} BGN per day, or ${totalMonthlyPremium} € per month. In return you get ${summaryBlock.total_coverage_str} of coverage for your whole family. Do you spend more on a single restaurant visit?`,
      },
      {
        objection:    "I need to think about it",
        category:     'timing',
        response:     `Completely understandable. However, it's important to know that insurance premiums increase with age. At ${clientAge} your rate is significantly lower than it would be even one year from now. Every month you wait literally costs you money.`,
      },
      {
        objection:    "I have employer insurance",
        category:     'product_fit',
        response:     `Employer insurance is a great extra benefit, but it belongs to your employer. If you change jobs — you lose it. Your personal plan is YOURS — for life, independent of any employment contract.`,
      },
      {
        objection:    "I don't trust insurance companies",
        category:     'trust',
        response:     `Your scepticism is understandable. That's precisely why IFA works exclusively with MetLife (top-5 global insurer, 150+ years), UNIQA (Vienna Insurance Group) and Generali (top European group). I have a real claims example if you'd like to see one.`,
      },
    ];

    // ─── Overview narrative (quick deterministic text, no LLM needed here) ───
    const productNames = productsBlock.map(p => p.product_name).join(', ');
    const overviewNarrative = isBG
      ? `${clientFirstName}, изготвихме персонализиран финансов план специално за Вас. Той включва ${productsBlock.length} продукта (${productNames}) с обща месечна вноска ${totalMonthlyPremium} € — или само ${dailyTotal} лв. на ден. Планът осигурява ${summaryBlock.total_coverage_str} защита и инвестиционен потенциал за ${yearsToRetirement} години напред.`
      : `${clientFirstName}, we have prepared a personalised financial plan just for you. It includes ${productsBlock.length} products (${productNames}) with a total monthly premium of ${totalMonthlyPremium} € — just ${dailyTotal} BGN per day. The plan provides ${summaryBlock.total_coverage_str} of coverage and investment potential over ${yearsToRetirement} years.`;

    const ctaWording = isBG
      ? `Готови ли сте да защитите финансовото бъдеще на семейството си? Нека преминем към следващата стъпка заедно.`
      : `Are you ready to secure your family's financial future? Let's take the next step together.`;

    // ─── Assemble final model ─────────────────────────────────────────────────
    const model = {
      plan_id,
      journey_id:         plan.journey_id || null,
      analysis_id:        plan.analysis_id || null,
      language_code,
      generated_at:       new Date().toISOString(),
      client:             clientBlock,
      summary:            summaryBlock,
      products:           productsBlock,
      financial_context:  financialContext,
      projections:        projectionsBlock,
      objection_anchors:  objectionAnchors,
      overview_narrative: overviewNarrative,
      cta_wording:        ctaWording,
    };

    // ─── Upsert PresentationModel ─────────────────────────────────────────────
    const existing = await base44.asServiceRole.entities.PresentationModel.filter({ plan_id });
    let saved;
    if (existing.length > 0) {
      saved = await base44.asServiceRole.entities.PresentationModel.update(existing[0].id, model);
    } else {
      saved = await base44.asServiceRole.entities.PresentationModel.create(model);
    }

    console.log(`[generatePresentationModel] Generated model for plan ${plan_id}, id=${saved.id}`);

    return Response.json({
      success: true,
      presentation_model_id: saved.id,
      plan_id,
      summary: summaryBlock,
    });

  } catch (error) {
    console.error('[generatePresentationModel] error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});