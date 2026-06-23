import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * createVerifiedProfile — Фаза 3 / analysis_approved hook
 *
 * Приема journey_id → fetch analysis → създава VerifiedClientProfile snapshot
 * → извиква generateFinancialPlan → advanced journey към plan_generating → plan_ready
 *
 * Може да се извика:
 *   1. От entity automation при analysis_approved
 *   2. Директно от frontend при ръчно одобрение
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // Поддържа два режима на извикване:
    // 1. Директно: { journey_id, analysis_id? }
    // 2. От entity automation: { event: { entity_id }, data: { ... } }
    let journey_id = body.journey_id;
    let directAnalysisId = body.analysis_id;

    if (!journey_id && body.event?.entity_id) {
      journey_id = body.event.entity_id;
    }
    if (!journey_id && body.data?.id) {
      journey_id = body.data.id;
    }

    if (!journey_id) return Response.json({ error: 'journey_id е задължително' }, { status: 400 });

    // ── 1. Вземи Journey ──
    const journey = await base44.asServiceRole.entities.Journey.get(journey_id);
    if (!journey) return Response.json({ error: 'Journey не е намерен' }, { status: 404 });

    const analysis_id = directAnalysisId || journey.analysis_id;
    if (!analysis_id) return Response.json({ error: 'Няма analysis_id в Journey' }, { status: 400 });

    // ── 2. Вземи FinancialAnalysisSubmission ──
    const analysisRows = await base44.asServiceRole.entities.FinancialAnalysisSubmission.filter({ id: analysis_id });
    if (!analysisRows?.length) return Response.json({ error: 'Анализът не е намерен' }, { status: 404 });
    const a = analysisRows[0];

    // ── 3. Провери дали вече има VerifiedClientProfile за този journey ──
    const existingProfiles = await base44.asServiceRole.entities.VerifiedClientProfile.filter({ journey_id });
    if (existingProfiles?.length > 0) {
      const existing = existingProfiles[0];
      // Вече съществува — не създавай дубликат, продължи директно към план
      return await triggerPlanGeneration(base44, journey_id, existing.id, analysis_id, user);
    }

    // ── 4. Изчисли производни метрики ──
    const clientNet = a.client_net_income || 0;
    const clientGross = a.client_gross_income || 0;
    const partnerNet = a.include_partner ? (a.partner_net_income || 0) : 0;
    const totalMonthly = clientNet + partnerNet
      + (a.client_other_monthly_income || 0)
      + (a.client_13th_salary || 0) / 12
      + (a.partner_other_monthly_income || 0)
      + (a.partner_13th_salary || 0) / 12;
    const monthlySavings = a.monthly_savings_amount || 0;

    const mortgageMonthly = a.liability_mortgage_monthly || 0;
    const consumerMonthly = a.liability_consumer_loans_monthly || 0;
    const totalMonthlyDebt = mortgageMonthly + consumerMonthly
      + (a.liability_credit_cards_monthly || 0)
      + (a.liability_leasing_monthly || 0)
      + (a.liability_overdraft_monthly || 0);

    const dti = totalMonthly > 0 ? totalMonthlyDebt / totalMonthly : 0;
    const liquidAssets = (a.asset_checking_account || 0) + (a.asset_short_term_savings || 0) + (a.client_cash || 0);
    const reserveMonths = variableExpenses(a) > 0 ? liquidAssets / variableExpenses(a) : 0;

    // reserve band
    let reserveBand = 'above_6_months';
    if (reserveMonths < 1) reserveBand = 'below_1_month';
    else if (reserveMonths < 3) reserveBand = 'one_to_three_months';
    else if (reserveMonths < 6) reserveBand = 'three_to_six_months';

    const autoSellEligible = dti < 0.40 && reserveMonths >= 3 && clientNet > 0;

    // ── 5. Създай VerifiedClientProfile ──
    const profileData = {
      journey_id,
      user_id: journey.user_id || user.id,
      analysis_id,
      language_code: journey.language_code || 'bg',

      demographics: {
        first_name: a.client_first_name,
        last_name: a.client_last_name,
        age: a.client_age,
        gender: a.client_gender,
        birthdate: a.client_birthdate,
      },

      family: {
        marital_status: a.client_marital_status,
        include_partner: a.include_partner || false,
        partner_name: a.include_partner ? `${a.partner_first_name || ''} ${a.partner_last_name || ''}`.trim() : null,
        children_count: a.children_count || 0,
        children_ages: a.children_ages || [],
      },

      income: {
        client_monthly_net: clientNet,
        partner_monthly_net: partnerNet,
        total_monthly: totalMonthly,
        monthly_savings: monthlySavings,
        income_source: a.income_source,
      },

      assets: {
        checking_account: a.asset_checking_account || 0,
        savings: (a.asset_short_term_savings || 0) + (a.asset_medium_term_savings || 0),
        real_estate: a.asset_real_estate || 0,
        other: a.asset_long_term_savings || 0,
      },

      liabilities: {
        mortgage_balance: a.liability_mortgage || 0,
        mortgage_monthly: mortgageMonthly,
        consumer_loans: a.liability_consumer_loans || 0,
        consumer_loans_monthly: consumerMonthly,
        total_monthly_debt: totalMonthlyDebt,
      },

      goals: {
        reserve_months_desired: a.desired_reserve_months || 6,
        planning_housing_change: a.planning_housing_change || false,
        include_pension: a.include_pension_in_plan || false,
        include_children: a.include_children_in_plan || false,
        risk_profile: a.risk_profile || 'moderate',
      },

      risk_indicators: {
        reserve_band: reserveBand,
        debt_to_income_ratio: Math.round(dti * 1000) / 1000,
        savings_to_income_ratio: totalMonthly > 0 ? Math.round((monthlySavings / totalMonthly) * 1000) / 1000 : 0,
        auto_sell_eligible: autoSellEligible,
      },

      consent_version_ref: journey.rulebook_version || '1.0',
      discovery_version_ref: journey.form_data_version || '1.0',
      approved_at: new Date().toISOString(),
    };

    const savedProfile = await base44.asServiceRole.entities.VerifiedClientProfile.create(profileData);

    // ── 6. Запиши verified_profile_id и auto_sell_eligible в Journey ──
    await base44.asServiceRole.entities.Journey.update(journey_id, {
      verified_profile_id: savedProfile.id,
      auto_sell_eligible: autoSellEligible,
      last_activity_at: new Date().toISOString(),
    });

    // ── 7. Trigger план генерация ──
    return await triggerPlanGeneration(base44, journey_id, savedProfile.id, analysis_id, user);

  } catch (error) {
    console.error('createVerifiedProfile error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ── Помощна функция за изчисление на variable expenses ──
function variableExpenses(a) {
  return (a.expense_rent||0)+(a.expense_utilities||0)+(a.expense_phone||0)+(a.expense_internet||0)+
    (a.expense_tv||0)+(a.expense_other_housing||0)+(a.expense_fuel||0)+(a.expense_car_maintenance||0)+
    (a.expense_car_other||0)+(a.expense_food||0)+(a.expense_clothing||0)+(a.expense_culture||0)+
    (a.expense_travel||0)+(a.expense_children||0)+(a.expense_cigarettes||0)+(a.expense_pets||0)+
    (a.expense_vacation||0)+(a.expense_business||0)+(a.expense_other||0);
}

// ── Trigger plan_generating → generateFinancialPlan → plan_ready ──
async function triggerPlanGeneration(base44, journey_id, verified_profile_id, analysis_id, user) {
  // Advance to plan_generating
  const smResponse = await base44.functions.invoke('journeyStateMachine', {
    journey_id,
    to_state: 'plan_generating',
    extra_data: { verified_profile_id },
  });

  if (!smResponse?.data?.success) {
    return Response.json({
      success: false,
      error: smResponse?.data?.error || 'State machine грешка при plan_generating',
      verified_profile_id,
    }, { status: 422 });
  }

  // Генерирай плана
  const planResponse = await base44.functions.invoke('generateFinancialPlan', {
    analysis_id,
    verified_profile_id,
    journey_id,
  });

  if (!planResponse?.data?.success) {
    return Response.json({
      success: false,
      error: planResponse?.data?.error || 'Грешка при генериране на план',
      verified_profile_id,
    }, { status: 500 });
  }

  const plan_id = planResponse.data.plan_id;

  // Advance to plan_ready
  await base44.functions.invoke('journeyStateMachine', {
    journey_id,
    to_state: 'plan_ready',
    extra_data: { plan_id },
  });

  return Response.json({
    success: true,
    verified_profile_id,
    plan_id,
    summary: planResponse.data.summary,
  });
}