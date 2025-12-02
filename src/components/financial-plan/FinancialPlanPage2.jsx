import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { EUR_BGN_RATE } from './FinancialPlanConstants';
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
    // Сбор от бъдещи доходи до пенсия с 3% годишен ръст
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
    // Извличане от продуктови оферти или план
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
      const isClient = offer.beneficiary === 'partner1';
      const isPartner = offer.beneficiary === 'partner2';

      if (offer.product_type === 'term_life' || offer.product_type === 'ul_investment') {
        if (isClient) {
          coverages.death.client += coverageAmount;
          coverages.accidentalDeath.client += coverageAmount;
        }
        if (isPartner) {
          coverages.death.partner += coverageAmount;
          coverages.accidentalDeath.partner += coverageAmount;
        }
      }

      // Допълнителни покрития от selected_coverages
      if (offer.selected_coverages) {
        offer.selected_coverages.forEach(cov => {
          const covAmount = (cov.coverage_amount || 0) * EUR_BGN_RATE;
          if (cov.name?.includes('40') || cov.name?.includes('критични')) {
            if (isClient) coverages.criticalIllness40.client += covAmount;
            if (isPartner) coverages.criticalIllness40.partner += covAmount;
          }
          if (cov.name?.includes('нетрудоспособност') || cov.name?.includes('PTD')) {
            if (isClient) coverages.permanentDisability.client += covAmount;
            if (isPartner) coverages.permanentDisability.partner += covAmount;
          }
          if (cov.name?.includes('фрактур')) {
            if (isClient) coverages.fractures.client += covAmount;
            if (isPartner) coverages.fractures.partner += covAmount;
          }
        });
      }

      // Телемедицина, здравно, защита на детето
      if (offer.product_type === 'health_insurance') {
        if (isClient) coverages.healthInsurance.client = true;
        if (isPartner) coverages.healthInsurance.partner = true;
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
    
    // Еднократен резерв
    const oneTimeReserve = (analysis.asset_checking_account || 0) + (analysis.asset_short_term_savings || 0);

    // Резерв: 3 години (желани месеци резерв * 12 + еднократен)
    const desiredMonths = analysis.desired_reserve_months || 6;
    const reserveTarget = freeMonthly * desiredMonths + oneTimeReserve * EUR_BGN_RATE;
    const reserveYears = 3;

    // Други цели: 25% от резерва за 1 година
    const otherGoalsTarget = (analysis.other_goals_car || 0) + (analysis.other_goals_vacation || 0) + (analysis.other_goals_other || 0);
    const otherGoalsDeposit = otherGoalsTarget > 0 ? otherGoalsTarget * EUR_BGN_RATE : Math.round(reserveTarget * 0.25);
    const otherGoalsYears = 1;

    // Самоучастие: от "Наличност в брой към момента на Закупуването" в Ново жилище
    const downPayment = (analysis.available_cash || 0) * EUR_BGN_RATE;
    const downPaymentYears = reserveYears;

    // Инвестиции - 3 периода
    const monthlyInvestment = (analysis.monthly_investments || 0) + (plan?.total_monthly_premium || 0);
    const annualInvestment = monthlyInvestment * 12 * EUR_BGN_RATE;
    
    // Примерна доходност
    const investmentReturn = 0.07; // 7% годишно

    const calculateFV = (annual, years, rate) => {
      if (rate === 0) return annual * years;
      return annual * ((Math.pow(1 + rate, years) - 1) / rate) * (1 + rate);
    };

    const investment10Years = {
      deposit: Math.round(annualInvestment * 10),
      value: Math.round(calculateFV(annualInvestment, 10, investmentReturn)),
      years: 10
    };

    const investment20Years = {
      deposit: Math.round(annualInvestment * 20),
      value: Math.round(calculateFV(annualInvestment, 20, investmentReturn)),
      years: 20
    };

    const investmentRetirement = {
      deposit: Math.round(annualInvestment * avgYearsToRetirement),
      value: Math.round(calculateFV(annualInvestment, avgYearsToRetirement, investmentReturn)),
      years: avgYearsToRetirement
    };

    // Образование на деца
    const childrenCount = analysis.children_count || 0;
    const childEducationGoals = [];

    for (let i = 1; i <= Math.min(childrenCount, 3); i++) {
      const childBirthdate = analysis[`child_${i}_birthdate`];
      const childName = analysis[`child_${i}_name`] || `Дете ${i}`;
      let childAge = 5;
      
      if (childBirthdate) {
        const birthYear = new Date(childBirthdate).getFullYear();
        childAge = new Date().getFullYear() - birthYear;
      }
      
      const yearsToEducation = Math.max(0, 20 - childAge);
      const annualChildSavings = (analysis.children_education_costs || 10000) / (childrenCount || 1) * EUR_BGN_RATE / yearsToEducation;
      
      childEducationGoals.push({
        name: childName,
        deposit: Math.round(annualChildSavings * yearsToEducation),
        value: Math.round(calculateFV(annualChildSavings, yearsToEducation, 0.06)),
        years: yearsToEducation
      });
    }

    // === PIE CHART ДАННИ ===
    // Дългосрочни vs Краткосрочни от страница 1
    const fixedAmount = (plan?.total_monthly_premium || 500) * EUR_BGN_RATE;
    const variableAmount = freeMonthly * EUR_BGN_RATE - fixedAmount;
    const shortTermAmount = 0; // Краткосрочни = 0 по подразбиране

    const pieData = [
      { name: 'Дългосрочни', value: Math.round(fixedAmount), color: '#6b7280' },
      { name: 'Средносрочни', value: Math.round(variableAmount), color: '#d97706' },
      { name: 'Краткосрочни', value: shortTermAmount, color: '#dc2626' }
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
        deposit: investment10Years.deposit, 
        value: investment10Years.value, 
        years: investment10Years.years 
      },
      { 
        name: 'Инвестиции', 
        deposit: investment20Years.deposit, 
        value: investment20Years.value, 
        years: investment20Years.years 
      },
      { 
        name: 'Инвестиции', 
        deposit: investmentRetirement.deposit, 
        value: investmentRetirement.value, 
        years: investmentRetirement.years 
      }
    ];

    // Добавяне на образование за деца
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
        investment10: investment10Years,
        investment20: investment20Years,
        investmentRetirement: investmentRetirement,
        childEducation: childEducationGoals
      },
      pieData,
      barData,
      fixedAmount: Math.round(fixedAmount),
      variableAmount: Math.round(variableAmount)
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

  const COLORS = ['#6b7280', '#d97706', '#dc2626'];

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