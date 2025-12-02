import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { 
  EUR_BGN_RATE, 
  generateMetLifeULProjection, 
  calculatePartnersInvestmentValue, 
  calculateFutureValue, 
  calculateMonthlyPayment,
  PARTNERS_INVESTMENTS_RETURNS,
  getPartnersInvestmentFee
} from './FinancialPlanConstants';
import { Check } from 'lucide-react';

/**
 * Финансов План - Страница 2
 * Трудов капитал, Защита на дохода, Разпределение на средствата
 */
export default function FinancialPlanPage2({ analysis, plan, productOffers = [] }) {
  
  const calculations = useMemo(() => {
    if (!analysis) return null;

    // === ВЪЗРАСТИ И ГОДИНИ ДО ПЕНСИЯ ===
    const clientAge = analysis.client_age || 35;
    const partnerAge = analysis.partner_age || 32;
    const clientRetirementAge = analysis.client_retirement_age || 65;
    const partnerRetirementAge = analysis.partner_retirement_age || 65;
    const clientYearsToRetirement = Math.max(0, clientRetirementAge - clientAge);
    const partnerYearsToRetirement = Math.max(0, partnerRetirementAge - partnerAge);
    const avgYearsToRetirement = Math.round((clientYearsToRetirement + partnerYearsToRetirement) / 2);

    // === ТРУДОВ КАПИТАЛ ===
    const salaryGrowthRate = 0.03;
    const clientAnnualIncome = (analysis.client_net_income || 0) * 12;
    const partnerAnnualIncome = (analysis.partner_net_income || 0) * 12;
    
    let clientLaborCapital = 0;
    let currentClientIncome = clientAnnualIncome;
    for (let year = 0; year < clientYearsToRetirement; year++) {
      clientLaborCapital += currentClientIncome;
      currentClientIncome *= (1 + salaryGrowthRate);
    }

    let partnerLaborCapital = 0;
    let currentPartnerIncome = partnerAnnualIncome;
    for (let year = 0; year < partnerYearsToRetirement; year++) {
      partnerLaborCapital += currentPartnerIncome;
      currentPartnerIncome *= (1 + salaryGrowthRate);
    }

    const totalLaborCapital = Math.round((clientLaborCapital + partnerLaborCapital) * EUR_BGN_RATE);

    // === ЗАЩИТА НА ДОХОДА - ПОКРИТИЯ ===
    const coverages = {
      death: { current: 0, client: 0, partner: 0 },
      accidentalDeath: { current: 0, client: 0, partner: 0 },
      criticalIllness40: { current: 0, client: 0, partner: 0 },
      permanentDisability: { current: 0, client: 0, partner: 0 },
      fractures: { current: 0, client: 0, partner: 0 },
      criticalIllnessTreatment: { current: 0, client: 0, partner: 0 },
      telemedicine: { current: false, client: false, partner: false },
      healthInsurance: { current: false, client: false, partner: false },
      childProtection: { current: false, client: false, partner: false }
    };

    // Попълване от оферти
    productOffers.forEach(offer => {
      const coverageAmount = (offer.coverage_amount || 0) * EUR_BGN_RATE;
      const isClient = offer.beneficiary === 'partner1' || offer.beneficiary === 'family';
      const isPartner = offer.beneficiary === 'partner2' || (offer.beneficiary === 'family' && analysis.include_partner);
      
      if (offer.product_type === 'term_life' || offer.product_type === 'ul_investment') {
        if (isClient) {
          coverages.death.client += coverageAmount;
          coverages.accidentalDeath.client += coverageAmount;
        }
        if (isPartner && analysis.include_partner) {
          coverages.death.partner += coverageAmount;
          coverages.accidentalDeath.partner += coverageAmount;
        }
      }

      if (offer.selected_coverages) {
        offer.selected_coverages.forEach(cov => {
          const covAmount = (cov.coverage_amount || 0) * EUR_BGN_RATE;
          const covName = cov.name || '';
          if (covName.includes('40') || covName.includes('критични')) {
            if (isClient) coverages.criticalIllness40.client += covAmount;
            if (isPartner && analysis.include_partner) coverages.criticalIllness40.partner += covAmount;
            if (offer.product_type === 'critical_illness') {
              if (isClient) coverages.criticalIllnessTreatment.client += covAmount;
              if (isPartner && analysis.include_partner) coverages.criticalIllnessTreatment.partner += covAmount;
            }
          }
          if (covName.includes('нетрудоспособност') || covName.includes('PTD')) {
            if (isClient) coverages.permanentDisability.client += covAmount;
            if (isPartner && analysis.include_partner) coverages.permanentDisability.partner += covAmount;
          }
          if (covName.includes('фрактур')) {
            if (isClient) coverages.fractures.client += covAmount;
            if (isPartner && analysis.include_partner) coverages.fractures.partner += covAmount;
          }
        });
      }

      if ((offer.product_type === 'ul_telemedicine' || offer.selected_coverages?.some(c => c.name?.includes('Телемедицина'))) && offer.monthly_premium > 0) {
        if (isClient) coverages.telemedicine.client = true;
        if (isPartner && analysis.include_partner) coverages.telemedicine.partner = true;
      }
      if (offer.product_type === 'health_insurance' && offer.monthly_premium > 0) {
        if (isClient) coverages.healthInsurance.client = true;
        if (isPartner && analysis.include_partner) coverages.healthInsurance.partner = true;
      }
      if (offer.product_type === 'ul_child_protection' && offer.monthly_premium > 0) {
        coverages.childProtection.client = true; 
        if (analysis.include_partner) coverages.childProtection.partner = true;
      }
    });

    // Примерни стойности ако няма оферти
    if (productOffers.length === 0) {
      const baseClientCoverage = clientAnnualIncome * 5 * EUR_BGN_RATE;
      const basePartnerCoverage = partnerAnnualIncome * 5 * EUR_BGN_RATE;
      
      coverages.death.client = Math.round(baseClientCoverage * 0.1);
      coverages.death.partner = Math.round(basePartnerCoverage * 0.1);
      coverages.accidentalDeath.client = Math.round(baseClientCoverage * 0.1);
      coverages.accidentalDeath.partner = Math.round(basePartnerCoverage * 0.1);
      coverages.criticalIllness40.client = Math.round(baseClientCoverage);
      coverages.criticalIllness40.partner = Math.round(basePartnerCoverage);
      coverages.permanentDisability.client = Math.round(baseClientCoverage * 10);
      coverages.permanentDisability.partner = Math.round(basePartnerCoverage * 6);
      coverages.fractures.client = 2940;
      coverages.fractures.partner = 2940;
      coverages.criticalIllnessTreatment.client = Math.round(baseClientCoverage * 40);
      coverages.criticalIllnessTreatment.partner = Math.round(basePartnerCoverage * 40);
      coverages.telemedicine.client = true;
      coverages.telemedicine.partner = true;
      coverages.healthInsurance.client = true;
      coverages.healthInsurance.partner = true;
      coverages.childProtection.client = true;
      coverages.childProtection.partner = true;
    }

    // === РАЗПРЕДЕЛЕНИЕ НА СРЕДСТВАТА ===
    const monthlyBalance = (analysis.client_net_income || 0) + (analysis.partner_net_income || 0);
    const totalExpenses = (analysis.expense_rent || 0) + (analysis.expense_utilities || 0) +
                         (analysis.expense_food || 0) + (analysis.expense_fuel || 0) +
                         (analysis.expense_other || 0);
    const freeMonthly = monthlyBalance - totalExpenses;
    
    const oneTimeReserve = (analysis.asset_checking_account || 0) + (analysis.asset_short_term_savings || 0);
    const desiredMonths = analysis.desired_reserve_months || 6;
    const reserveTarget = freeMonthly * desiredMonths + oneTimeReserve * EUR_BGN_RATE;
    const reserveYears = 3;

    const otherGoalsTarget = (analysis.other_goals_car || 0) + (analysis.other_goals_vacation || 0) + (analysis.other_goals_other || 0);
    const otherGoalsDeposit = otherGoalsTarget > 0 ? otherGoalsTarget * EUR_BGN_RATE : Math.round(reserveTarget * 0.25);
    const otherGoalsYears = 1;

    const downPayment = (analysis.available_cash || 0) * EUR_BGN_RATE;
    const downPaymentYears = reserveYears;

    // === ИНВЕСТИЦИИ - извличане от оферти ===
    let totalMonthlyFromUL = 0;
    let totalMonthlyFromPartners = 0;
    let totalOneTimeFromPartners = 0;
    let totalOneTimeFromUL = 0;

    // UL Investment offers (клиент и партньор)
    const ulOffers = productOffers.filter(p => p.product_type === 'ul_investment');
    ulOffers.forEach(offer => {
      totalMonthlyFromUL += (offer.monthly_premium || 0);
      // Ако има еднократна вноска в UL
      if (offer.one_time_deposit || offer.initial_value) {
        totalOneTimeFromUL += (offer.one_time_deposit || offer.initial_value || 0);
      }
    });

    // Partners Investments offers - регулярни (месечни)
    const partnersRegularOffers = productOffers.filter(p => 
      p.product_type === 'partners_regular' || 
      (p.product_type === 'partners_investments' && p.investment_type === 'regular')
    );
    partnersRegularOffers.forEach(offer => {
      totalMonthlyFromPartners += (offer.monthly_premium || offer.monthly_contribution || 0);
    });

    // Partners Investments offers - еднократни
    const partnersSingleOffers = productOffers.filter(p => 
      p.product_type === 'partners_single' || 
      (p.product_type === 'partners_investments' && p.investment_type === 'single')
    );
    partnersSingleOffers.forEach(offer => {
      totalOneTimeFromPartners += (offer.one_time_investment || offer.initial_value || offer.coverage_amount || 0);
    });

    // Общо месечно + потребителски месечни инвестиции
    const totalMonthlyInvestment = totalMonthlyFromUL + totalMonthlyFromPartners + (analysis.monthly_investments || 0);
    const totalMonthlyInvestmentBGN = totalMonthlyInvestment * EUR_BGN_RATE;
    
    // Общо еднократни инвестиции (Partners + UL)
    const totalOneTimeInvestment = totalOneTimeFromPartners + totalOneTimeFromUL;
    const totalOneTimeInvestmentBGN = totalOneTimeInvestment * EUR_BGN_RATE;

    // Средна очаквана доходност (7% общо)
    const generalInvestmentReturn = 0.07;

    // Изчисляване на комбинирана FV (месечни вноски + еднократен капитал)
    const calculateCombinedFV = (monthlyEUR, oneTimeEUR, years, annualReturn) => {
      const monthlyBGN = monthlyEUR * EUR_BGN_RATE;
      const oneTimeBGN = oneTimeEUR * EUR_BGN_RATE;
      const fvRegular = calculateFutureValue(monthlyBGN, years, annualReturn);
      const fvOneTime = oneTimeBGN * Math.pow(1 + annualReturn, years);
      return fvRegular + fvOneTime;
    };

    const inv10Years = {
      deposit: Math.round((totalMonthlyInvestmentBGN * 12 * 10) + totalOneTimeInvestmentBGN),
      value: Math.round(calculateCombinedFV(totalMonthlyInvestment, totalOneTimeInvestment, 10, generalInvestmentReturn)),
      years: 10
    };

    const inv20Years = {
      deposit: Math.round((totalMonthlyInvestmentBGN * 12 * 20) + totalOneTimeInvestmentBGN),
      value: Math.round(calculateCombinedFV(totalMonthlyInvestment, totalOneTimeInvestment, 20, generalInvestmentReturn)),
      years: 20
    };

    const invRetirement = {
      deposit: Math.round((totalMonthlyInvestmentBGN * 12 * avgYearsToRetirement) + totalOneTimeInvestmentBGN),
      value: Math.round(calculateCombinedFV(totalMonthlyInvestment, totalOneTimeInvestment, avgYearsToRetirement, generalInvestmentReturn)),
      years: avgYearsToRetirement
    };

    // === ОБРАЗОВАНИЕ НА ДЕЦА ===
    const childrenCount = analysis.children_count || 0;
    const childEducationGoals = [];

    for (let i = 1; i <= Math.min(childrenCount, 3); i++) {
      const childBirthdate = analysis[`child_${i}_birthdate`];
      const childName = analysis[`child_${i}_name`] || `Дете ${i}`;
      let childAge = 0;
      if (childBirthdate) {
        childAge = new Date().getFullYear() - new Date(childBirthdate).getFullYear();
      }
      
      const educationYearsTarget = 20;
      const yearsToEducation = Math.max(1, educationYearsTarget - childAge);
      
      let annualChildContributionEUR = 0;
      let childExpectedValueBGN = 0;
      
      // Търсене на детска оферта (education_plan или ul_child_protection)
      const childOffer = productOffers.find(
        p => (p.product_type === 'education_plan' || p.product_type === 'ul_child_protection') && 
             (p.beneficiary_name === childName || p.beneficiary === `child${i}`)
      );

      if (childOffer && childOffer.expected_value) {
        annualChildContributionEUR = (childOffer.annual_premium || (childOffer.monthly_premium || 0) * 12);
        childExpectedValueBGN = childOffer.expected_value * EUR_BGN_RATE;
      } else {
        // Fallback изчисление
        const targetEducationCost = (analysis.children_education_costs || 10000) / (childrenCount || 1);
        const monthlyNeeded = calculateMonthlyPayment(targetEducationCost, yearsToEducation, 0.06);
        annualChildContributionEUR = monthlyNeeded * 12;
        childExpectedValueBGN = calculateFutureValue(monthlyNeeded, yearsToEducation, 0.06) * EUR_BGN_RATE;
      }

      childEducationGoals.push({
        name: childName,
        deposit: Math.round(annualChildContributionEUR * yearsToEducation * EUR_BGN_RATE),
        value: Math.round(childExpectedValueBGN),
        years: yearsToEducation
      });
    }

    // === PIE CHART ДАННИ ===
    const totalMonthlyPremiumsFromOffers = productOffers.reduce((sum, offer) => sum + (offer.monthly_premium || 0), 0);
    const fixedAmountForPie = totalMonthlyPremiumsFromOffers * EUR_BGN_RATE;
    const variableAmountForPie = (analysis.monthly_investments || 0) * EUR_BGN_RATE;

    const longTermAmount = fixedAmountForPie + variableAmountForPie;
    const mediumTermAmount = 0;
    const shortTermAmount = 0;

    const pieData = [
      { name: 'Дългосрочни', value: Math.round(longTermAmount), color: '#6b7280' },
      { name: 'Средносрочни', value: Math.round(mediumTermAmount), color: '#d97706' },
      { name: 'Краткосрочни', value: Math.round(shortTermAmount), color: '#dc2626' }
    ];

    // === BAR CHART ДАННИ ===
    const barData = [
      { 
        name: 'Резерв', 
        deposit: Math.round(reserveTarget), 
        value: Math.round(reserveTarget), 
        years: reserveYears 
      },
      { 
        name: 'Други цели', 
        deposit: Math.round(otherGoalsDeposit), 
        value: Math.round(otherGoalsDeposit), 
        years: otherGoalsYears 
      },
      { 
        name: 'Самоучастие', 
        deposit: Math.round(downPayment), 
        value: Math.round(downPayment), 
        years: downPaymentYears 
      },
      { 
        name: 'Инвестиции', 
        deposit: inv10Years.deposit, 
        value: inv10Years.value, 
        years: inv10Years.years 
      },
      { 
        name: 'Инвестиции', 
        deposit: inv20Years.deposit, 
        value: inv20Years.value, 
        years: inv20Years.years 
      },
      { 
        name: 'Инвестиции', 
        deposit: invRetirement.deposit, 
        value: invRetirement.value, 
        years: invRetirement.years 
      }
    ];

    childEducationGoals.forEach(goal => {
      barData.push({
        name: `Образование на ${goal.name}`,
        deposit: goal.deposit,
        value: goal.value,
        years: goal.years
      });
    });

    return {
      laborCapital: totalLaborCapital,
      salaryGrowthRate: salaryGrowthRate * 100,
      clientName: analysis.client_first_name || 'Клиент',
      partnerName: analysis.partner_first_name || 'Партньор',
      coverages,
      distribution: {
        reserve: { deposit: Math.round(reserveTarget), value: Math.round(reserveTarget), years: reserveYears },
        otherGoals: { deposit: Math.round(otherGoalsDeposit), value: Math.round(otherGoalsDeposit), years: otherGoalsYears },
        downPayment: { deposit: Math.round(downPayment), value: Math.round(downPayment), years: downPaymentYears },
        investment10: inv10Years,
        investment20: inv20Years,
        investmentRetirement: invRetirement,
        childEducation: childEducationGoals
      },
      pieData,
      barData,
      fixedAmount: Math.round(fixedAmountForPie),
      variableAmount: Math.round(variableAmountForPie)
    };
  }, [analysis, plan, productOffers]);

  if (!calculations) {
    return <div className="p-8 text-center text-slate-500">Няма данни за анализ</div>;
  }

  const formatCurrency = (value) => {
    return value.toLocaleString('bg-BG') + ' лв.';
  };

  const coverageRows = [
    { key: 'death', label: 'Смърт' },
    { key: 'accidentalDeath', label: 'Смърт вследствие на злополука' },
    { key: 'criticalIllness40', label: 'Тежки заболявания (40)' },
    { key: 'permanentDisability', label: 'Трайна загуба на работоспособност от злополука' },
    { key: 'fractures', label: 'Фрактури и изгаряния' },
    { key: 'criticalIllnessTreatment', label: 'Лечение на критични заболявания' },
    { key: 'telemedicine', label: 'Телемедицина', isBoolean: true },
    { key: 'healthInsurance', label: 'Допълнително здравно осигуряване', isBoolean: true },
    { key: 'childProtection', label: 'Споразумение за защита на детето', isBoolean: true }
  ];

  return (
    <div className="bg-white p-6 min-h-[900px] relative font-sans text-sm">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <span className="text-[180px] font-bold text-slate-400 rotate-[-30deg]">Страница 2</span>
      </div>

      <div className="relative z-10">
        {/* Header - Трудов капитал */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-4 mb-1">
              <span className="text-red-700 font-bold text-lg">Трудов капитал:</span>
              <span className="text-red-700 font-bold text-xl">{formatCurrency(calculations.laborCapital)}</span>
            </div>
            <p className="text-xs text-slate-500">
              При прогнозен ръст на възнагражденията от {calculations.salaryGrowthRate}% годишно
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Лява колона - Защита на дохода */}
          <div>
            <h3 className="text-red-700 font-bold mb-3">Защита на дохода</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="text-left py-1 pr-2"></th>
                  <th className="text-right py-1 px-2 w-16">Текущо</th>
                  <th className="text-right py-1 px-2 w-24">{calculations.clientName}</th>
                  <th className="text-right py-1 px-2 w-24">{calculations.partnerName}</th>
                </tr>
              </thead>
              <tbody>
                {coverageRows.map((row, idx) => {
                  const coverage = calculations.coverages[row.key];
                  return (
                    <tr key={row.key} className={idx % 2 === 0 ? 'bg-slate-50' : ''}>
                      <td className="py-1.5 pr-2 text-red-700 font-medium">{row.label}</td>
                      <td className="text-right py-1.5 px-2">
                        {row.isBoolean ? (coverage.current ? <Check className="w-4 h-4 text-green-600 inline" /> : '-') : formatCurrency(coverage.current)}
                      </td>
                      <td className="text-right py-1.5 px-2 font-medium">
                        {row.isBoolean ? (coverage.client ? <Check className="w-4 h-4 text-green-600 inline" /> : '-') : formatCurrency(coverage.client)}
                      </td>
                      <td className="text-right py-1.5 px-2 font-medium">
                        {row.isBoolean ? (coverage.partner ? <Check className="w-4 h-4 text-green-600 inline" /> : '-') : formatCurrency(coverage.partner)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Дясна колона - Разпределение на средствата */}
          <div>
            <h3 className="text-red-700 font-bold mb-3">РАЗПРЕДЕЛЕНИЕ НА СРЕДСТВАТА</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="text-left py-1">Цел</th>
                  <th className="text-right py-1 px-2">Депозит</th>
                  <th className="text-right py-1 px-2">Стойност</th>
                  <th className="text-right py-1 px-1 w-12">Години</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-slate-50">
                  <td className="py-1.5 text-red-700 font-medium">Резерв</td>
                  <td className="text-right py-1.5 px-2">{formatCurrency(calculations.distribution.reserve.deposit)}</td>
                  <td className="text-right py-1.5 px-2 font-semibold">{formatCurrency(calculations.distribution.reserve.value)}</td>
                  <td className="text-right py-1.5 px-1">{calculations.distribution.reserve.years}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-red-700 font-medium">Други цели</td>
                  <td className="text-right py-1.5 px-2">{formatCurrency(calculations.distribution.otherGoals.deposit)}</td>
                  <td className="text-right py-1.5 px-2 font-semibold">{formatCurrency(calculations.distribution.otherGoals.value)}</td>
                  <td className="text-right py-1.5 px-1">{calculations.distribution.otherGoals.years}</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="py-1.5 text-red-700 font-medium">Самоучастие</td>
                  <td className="text-right py-1.5 px-2">{formatCurrency(calculations.distribution.downPayment.deposit)}</td>
                  <td className="text-right py-1.5 px-2 font-semibold">{formatCurrency(calculations.distribution.downPayment.value)}</td>
                  <td className="text-right py-1.5 px-1">{calculations.distribution.downPayment.years}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-red-700 font-medium">Инвестиции</td>
                  <td className="text-right py-1.5 px-2">{formatCurrency(calculations.distribution.investment10.deposit)}</td>
                  <td className="text-right py-1.5 px-2 font-semibold">{formatCurrency(calculations.distribution.investment10.value)}</td>
                  <td className="text-right py-1.5 px-1">{calculations.distribution.investment10.years}</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="py-1.5 text-red-700 font-medium">Инвестиции</td>
                  <td className="text-right py-1.5 px-2">{formatCurrency(calculations.distribution.investment20.deposit)}</td>
                  <td className="text-right py-1.5 px-2 font-semibold">{formatCurrency(calculations.distribution.investment20.value)}</td>
                  <td className="text-right py-1.5 px-1">{calculations.distribution.investment20.years}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-red-700 font-medium">Инвестиции</td>
                  <td className="text-right py-1.5 px-2">{formatCurrency(calculations.distribution.investmentRetirement.deposit)}</td>
                  <td className="text-right py-1.5 px-2 font-semibold">{formatCurrency(calculations.distribution.investmentRetirement.value)}</td>
                  <td className="text-right py-1.5 px-1">{calculations.distribution.investmentRetirement.years}</td>
                </tr>
                {calculations.distribution.childEducation.map((child, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50' : ''}>
                    <td className="py-1.5 text-red-700 font-medium">Образование на {child.name}</td>
                    <td className="text-right py-1.5 px-2">{formatCurrency(child.deposit)}</td>
                    <td className="text-right py-1.5 px-2 font-semibold">{formatCurrency(child.value)}</td>
                    <td className="text-right py-1.5 px-1">{child.years}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          {/* Pie Chart - Времева алокация */}
          <div>
            <h3 className="text-slate-700 font-semibold mb-2 text-center">Времева алокация на средствата</h3>
            <div className="flex items-center">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie
                    data={calculations.pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value, percent }) => `${formatCurrency(value)}; ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {calculations.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 text-xs">
                {calculations.pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar Chart - Стойности */}
          <div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={calculations.barData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="deposit" fill="#9ca3af" name="Депозит" stackId="a">
                  <LabelList dataKey="deposit" position="bottom" formatter={(v) => formatCurrency(v)} style={{ fontSize: 8 }} />
                </Bar>
                <Bar dataKey="value" fill="#dc2626" name="Стойност" stackId="b">
                  <LabelList dataKey="years" position="top" style={{ fontSize: 10, fontWeight: 'bold' }} />
                  <LabelList dataKey="value" position="inside" formatter={(v) => formatCurrency(v)} style={{ fontSize: 8, fill: 'white' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}