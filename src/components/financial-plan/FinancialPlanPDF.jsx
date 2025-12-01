import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

// Cover Page Component
export function CoverPage({ plan, analysis, consultant }) {
  return (
    <div className="bg-white min-h-[1100px] p-8 relative">
      {/* Header Image with Text */}
      <div className="bg-gradient-to-br from-[#8B1538] to-[#6B1028] rounded-lg p-12 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="text-white/30 text-2xl font-bold leading-relaxed">
            <div className="ml-4">PENSION</div>
            <div className="ml-12">INVESTMENTS</div>
            <div className="ml-8">INSURANCE</div>
            <div className="ml-16">HOUSING</div>
            <div className="ml-20">PENSION</div>
            <div className="ml-12">INVESTMENTS</div>
          </div>
        </div>
        <h1 className="text-6xl font-bold text-white text-center relative z-10 my-8">
          FINANCIAL PLAN
        </h1>
        <div className="absolute inset-0 opacity-20">
          <div className="text-white/30 text-2xl font-bold leading-relaxed text-right pr-4 pt-32">
            <div>INSURANCE</div>
            <div>HOUSING</div>
            <div>PENSION</div>
            <div>INVESTMENTS</div>
            <div>INSURANCE</div>
            <div>HOUSING</div>
          </div>
        </div>
      </div>

      {/* Contact Info Grid */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Consultant */}
        <div>
          <p className="text-slate-500 text-sm mb-1">Финансов консултант</p>
          <p className="text-[#8B1538] font-semibold text-lg">{consultant?.name || 'Консултант'}</p>
          <p className="text-slate-600 text-sm">Личен Финансов Консултант</p>
          <div className="mt-3">
            <p className="text-slate-500 text-sm">КОНТАКТ</p>
            <p className="text-[#8B1538] text-sm">{consultant?.email || 'consultant@pgbg.bg'}</p>
            <p className="text-slate-600 text-sm">{consultant?.phone || ''}</p>
          </div>
        </div>
        
        {/* Client */}
        <div>
          <p className="text-slate-500 text-sm mb-1">Клиент</p>
          <p className="text-[#8B1538] font-semibold text-lg">
            {analysis?.client_first_name} {analysis?.client_last_name}
          </p>
          <div className="mt-3">
            <p className="text-slate-500 text-sm">КОНТАКТ</p>
            <p className="text-[#8B1538] text-sm">{analysis?.client_email}</p>
            <p className="text-slate-600 text-sm">{analysis?.client_phone}</p>
          </div>
        </div>
      </div>

      {/* Valid Until */}
      <div className="mb-8">
        <p className="text-slate-500 text-sm">ВАЛИДЕН ДО</p>
        <p className="text-slate-700">{plan?.valid_until}</p>
      </div>

      {/* Manager & Company Info */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <p className="text-slate-500 text-sm mb-1">Пряк мениджър</p>
          <p className="text-[#8B1538] font-semibold">Емил Иванов</p>
          <p className="text-[#8B1538] text-sm">emil.ivanov@pgbg.bg</p>
          <p className="text-slate-600 text-sm">0883 390 070</p>
        </div>
        <div className="text-right">
          <p className="text-[#8B1538] text-sm">info@pgbg.bg</p>
          <p className="text-slate-600 text-sm">+359 2 907 2190</p>
          <p className="text-[#8B1538] text-sm">https://partnersgroup.bg/</p>
        </div>
      </div>

      {/* Logo */}
      <div className="absolute bottom-8 left-8">
        <div className="text-3xl font-bold">
          <span className="text-[#8B1538]">P</span>
          <span className="text-slate-400">ARTNERS</span>
        </div>
      </div>
    </div>
  );
}

// Main Financial Plan Page
export function FinancialPlanMainPage({ plan, analysis }) {
  const monthlyDeposit = plan?.total_monthly_premium || 0;
  const fixedMonthly = plan?.products?.filter(p => p.product_type === 'term_life' || p.product_type === 'mlc_health')
    .reduce((sum, p) => sum + (p.monthly_premium || 0), 0) || 0;
  const variableMonthly = monthlyDeposit - fixedMonthly;
  
  const propertyProtection = 0;
  const incomeProtection = plan?.products?.filter(p => p.product_type === 'term_life')
    .reduce((sum, p) => sum + (p.monthly_premium || 0), 0) || 0;
  const loans = 0;
  const assetCreation = plan?.products?.filter(p => ['ul_investment', 'pension_plan', 'education_plan'].includes(p.product_type))
    .reduce((sum, p) => sum + (p.monthly_premium || 0), 0) || 0;
  const oneTimeReserve = analysis?.client_checking_account || 0;

  const netWorth = (analysis?.property_apartment_value || 0) + 
                   (analysis?.property_house_value || 0) + 
                   (analysis?.property_car_value || 0);
  const liabilities = (analysis?.liability_mortgage || 0) + 
                      (analysis?.liability_consumer_loans || 0);

  const priorities = [
    { num: 1, text: 'Увеличаване на резервите' },
    { num: 2, text: 'Достойна пенсия' },
    { num: 3, text: 'Защита на дохода' },
    { num: 4, text: 'Други цели' },
    { num: 5, text: 'Ново жилище' },
  ];

  const advantages = [
    { title: 'Гъвкавост', desc: 'възможност да се променят сумите, определени за отделните цели' },
    { title: 'Променливост', desc: 'възможност да се добавят и променят финансовите решения' },
    { title: 'Качество', desc: 'финансови решения от качествени институции' },
    { title: 'Надежност', desc: 'във всяка ситуация ще има финансов съветник, който ще се грижи за Вас' },
    { title: 'Обслужване', desc: 'актуализиране при промяна на финансовото състояние или на пазара' },
  ];

  const taxBenefit = Math.round(monthlyDeposit * 12 * (plan?.years_to_retirement_p1 || 20) * 0.1);

  return (
    <div className="bg-white min-h-[1100px] p-8">
      <h1 className="text-3xl font-bold text-[#8B1538] mb-6">ФИНАНСОВ ПЛАН</h1>

      <div className="grid grid-cols-2 gap-8">
        {/* Left Column - Monthly Deposit */}
        <div>
          <h2 className="text-[#8B1538] font-semibold mb-4">Месечен депозит</h2>
          
          <div className="space-y-2 mb-6">
            <div className="flex justify-end">
              <span className="text-2xl font-bold text-slate-800">
                {monthlyDeposit.toLocaleString('bg-BG')} лв.
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#8B1538]">Фиксиран</span>
              <span className="font-semibold">{fixedMonthly.toLocaleString('bg-BG')} лв.</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#8B1538]">Променлив</span>
              <span className="font-semibold">{variableMonthly.toLocaleString('bg-BG')} лв.</span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-[#8B1538]">Защита на собствеността</span>
              <div className="font-semibold">{propertyProtection.toLocaleString('bg-BG')} лв.</div>
            </div>
            <div>
              <span className="text-[#8B1538]">Защита на дохода</span>
              <div className="font-semibold">{incomeProtection.toLocaleString('bg-BG')} лв.</div>
            </div>
            <div>
              <span className="text-slate-700">Заеми и кредити</span>
              <div className="font-semibold">{loans.toLocaleString('bg-BG')} лв.</div>
            </div>
            <div>
              <span className="text-slate-700">Създаване на активи</span>
              <div className="font-semibold">{assetCreation.toLocaleString('bg-BG')} лв.</div>
            </div>
            <div>
              <span className="text-slate-700">Еднократен резерв</span>
              <div className="font-semibold">{oneTimeReserve.toLocaleString('bg-BG')} лв.</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#8B1538]">Имущество</span>
              <span className="font-semibold">{netWorth.toLocaleString('bg-BG')} лв.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Задължения</span>
              <span className="font-semibold">{liabilities.toLocaleString('bg-BG')} лв.</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Общо нетно имущество</span>
              <span>{(netWorth - liabilities).toLocaleString('bg-BG')} лв.</span>
            </div>
          </div>
        </div>

        {/* Right Column - Chart */}
        <div>
          <p className="text-sm text-slate-600 mb-2">Възвръщаемост</p>
          <div className="relative h-48 bg-slate-50 rounded-lg border-2 border-slate-200 p-4">
            {/* Simplified chart representation */}
            <div className="flex h-full items-end justify-between gap-2">
              <div className="flex-1 bg-slate-300 rounded-t" style={{ height: '40%' }}>
                <div className="text-xs text-center pt-2 text-slate-600">Създаване на резерв</div>
                <div className="text-xs text-center text-slate-500">{variableMonthly.toLocaleString('bg-BG')} лв.</div>
                <div className="absolute top-1/2 left-1/4 bg-[#8B1538] text-white text-xs px-2 py-1 rounded">0%</div>
              </div>
              <div className="flex-1 bg-[#8B1538] rounded-t" style={{ height: '80%' }}>
                <div className="text-xs text-center pt-2 text-white">Създаване на активи и Защита на дохода</div>
                <div className="text-xs text-center text-white">{fixedMonthly.toLocaleString('bg-BG')} лв.</div>
                <div className="absolute top-4 right-4 bg-white text-[#8B1538] text-xs px-2 py-1 rounded font-bold">7-9%</div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>{plan?.partner1_age || 30} г.</span>
              <span className="text-right">Време</span>
              <span>{analysis?.client_retirement_age || 65} г.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advantages & Priorities */}
      <div className="grid grid-cols-2 gap-8 mt-8">
        <div>
          <h3 className="text-[#8B1538] font-bold mb-3">ПРЕДИМСТВА</h3>
          <div className="space-y-2 text-sm">
            {advantages.map((adv, i) => (
              <p key={i}>
                <span className="text-[#8B1538] font-semibold">{adv.title}</span>
                <span className="text-slate-600"> - {adv.desc}</span>
              </p>
            ))}
            <p className="mt-4">
              <span className="text-[#8B1538] font-semibold">Данъчно облекчение</span>
              <span className="text-slate-600"> - спестяване от данъци за целия период </span>
              <span className="font-bold text-[#8B1538]">{taxBenefit.toLocaleString('bg-BG')} лв.</span>
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-[#8B1538] font-bold mb-3">ПРИОРИТЕТИ</h3>
          <div className="space-y-2">
            {priorities.map((p) => (
              <div key={p.num} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-[#8B1538] text-white text-sm flex items-center justify-center font-bold">
                  {p.num}
                </span>
                <span className="text-slate-700 text-sm">{p.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Income Protection & Fund Allocation Page
export function IncomeProtectionPage({ plan, analysis }) {
  const laborCapital = (analysis?.client_net_income || 0) * 12 * (plan?.years_to_retirement_p1 || 30) * 1.03;
  
  const protectionItems = [
    { name: 'Смърт', current: 0, recommended: plan?.protection_need_p1 || 0 },
    { name: 'Смърт вследствие на злополука', current: 0, recommended: plan?.protection_need_p1 || 0 },
    { name: 'Трайна загуба на работоспособност от злополука', current: 0, recommended: (plan?.protection_need_p1 || 0) * 2 },
    { name: 'Тежки заболявания (32)', current: 0, recommended: (analysis?.client_net_income || 0) * 24 },
    { name: 'Лечение на критични заболявания', current: 0, recommended: 2240000 },
    { name: 'Телемедицина', current: 0, hasCheck: true },
  ];

  const fundAllocations = plan?.products?.filter(p => ['ul_investment', 'pension_plan', 'education_plan'].includes(p.product_type))
    .map(p => ({
      goal: p.product_type === 'pension_plan' ? 'Инвестиции' : 
            p.product_type === 'education_plan' ? 'Образование' : 'Резерв',
      deposit: p.monthly_premium * 12 * (p.term_years || 10),
      value: p.expected_value || 0,
      years: p.term_years || 10
    })) || [];

  const fixedMonthly = plan?.products?.filter(p => p.product_type === 'term_life' || p.product_type === 'mlc_health')
    .reduce((sum, p) => sum + (p.monthly_premium || 0), 0) || 0;
  const variableMonthly = (plan?.total_monthly_premium || 0) - fixedMonthly;

  const pieData = [
    { name: 'Фиксирани', value: fixedMonthly, color: '#8B1538' },
    { name: 'Променливи', value: variableMonthly, color: '#CBD5E1' },
  ];

  return (
    <div className="bg-white min-h-[1100px] p-8">
      <h1 className="text-3xl font-bold text-[#8B1538] mb-6">ФИНАНСОВ ПЛАН</h1>

      <div className="grid grid-cols-2 gap-8">
        {/* Left - Income Protection */}
        <div>
          <div className="flex items-baseline gap-4 mb-4">
            <h2 className="text-xl font-bold text-slate-800">Трудов капитал:</h2>
            <span className="text-2xl font-bold text-[#8B1538]">
              {laborCapital.toLocaleString('bg-BG', { maximumFractionDigits: 0 })} лв.
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">При прогнозен ръст на възнагражденията от 3% годишно</p>
          
          <h3 className="text-[#8B1538] font-bold mb-3">Защита на дохода</h3>
          
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="text-left py-1"></th>
                <th className="text-right py-1">Текущо</th>
                <th className="text-right py-1">{analysis?.client_first_name}</th>
              </tr>
            </thead>
            <tbody>
              {protectionItems.map((item, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 text-[#8B1538]">{item.name}</td>
                  <td className="py-2 text-right">{item.current.toLocaleString('bg-BG')} лв.</td>
                  <td className="py-2 text-right">
                    {item.hasCheck ? '☑' : `${item.recommended.toLocaleString('bg-BG')} лв.`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right - Fund Allocation */}
        <div>
          <h2 className="text-xl font-bold text-[#8B1538] mb-4">РАЗПРЕДЕЛЕНИЕ НА СРЕДСТВАТА</h2>
          
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 border-b">
                <th className="text-left py-2">Цел</th>
                <th className="text-right py-2">Депозит</th>
                <th className="text-right py-2">Стойност</th>
                <th className="text-right py-2">Години</th>
              </tr>
            </thead>
            <tbody>
              {fundAllocations.map((item, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 text-[#8B1538] font-medium">{item.goal}</td>
                  <td className="py-2 text-right">{item.deposit.toLocaleString('bg-BG')} лв.</td>
                  <td className="py-2 text-right">{item.value.toLocaleString('bg-BG')} лв.</td>
                  <td className="py-2 text-right">{item.years}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Time Allocation Section */}
      <div className="mt-8">
        <h3 className="text-[#8B1538] font-bold mb-4">Времева алокация на средствата</h3>
        
        <div className="grid grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="flex items-center gap-4">
            <div className="w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, value, percent }) => `${value.toLocaleString('bg-BG')} лв.; ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#8B1538]"></div>
                <span>Дългосрочни</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-300"></div>
                <span>Средносрочни</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-500"></div>
                <span>Краткосрочни</span>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fundAllocations}>
                <XAxis dataKey="goal" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => `${v.toLocaleString('bg-BG')} лв.`} />
                <Bar dataKey="deposit" stackId="a" fill="#CBD5E1" name="Депозит" />
                <Bar dataKey="value" stackId="a" fill="#8B1538" name="Стойност" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// Portfolio Structure Page
export function PortfolioStructurePage({ plan, analysis }) {
  const shortTermGoals = plan?.products?.filter(p => (p.term_years || 0) <= 5)
    .reduce((sum, p) => sum + (p.monthly_premium || 0) * 12, 0) || 0;
  const reserve = analysis?.client_checking_account || 0;
  const otherGoals = 10000;
  const monthlyDeposit = plan?.total_monthly_premium || 0;

  return (
    <div className="bg-white min-h-[1100px] p-8">
      <h1 className="text-3xl font-bold text-[#8B1538] mb-2">ФИНАНСОВ ПЛАН</h1>
      <h2 className="text-xl font-bold text-[#8B1538] mb-6">СТРУКТУРА НА ПОРТФЕЙЛА</h2>

      {/* Flow Diagram */}
      <div className="relative">
        {/* Left Side - Current State */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-4">
            <div className="bg-slate-100 p-3 rounded border-l-4 border-[#8B1538]">
              <p className="text-xs text-slate-500">Резерв</p>
              <p className="font-bold text-slate-800">{reserve.toLocaleString('bg-BG')} лв.</p>
            </div>
            <div className="bg-slate-100 p-3 rounded border-l-4 border-[#8B1538]">
              <p className="text-xs text-slate-500">Други цели</p>
              <p className="font-bold text-slate-800">{otherGoals.toLocaleString('bg-BG')} лв.</p>
            </div>
            
            <div className="mt-8 p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-2">ЛЕГЕНДА</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-3 bg-slate-300 rounded"></div>
                  <span className="text-xs text-slate-600">СЕГА</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-3 bg-[#8B1538] rounded"></div>
                  <span className="text-xs text-slate-600">БЪДЕЩ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Monthly Flow */}
          <div className="flex flex-col items-center justify-center">
            <div className="bg-[#8B1538] text-white p-4 rounded-lg text-center mb-4">
              <p className="text-xs opacity-80">месечно</p>
              <p className="text-2xl font-bold">{monthlyDeposit.toLocaleString('bg-BG')} лв.</p>
              <p className="text-xs opacity-80">Ежемесечно спестяване</p>
              <p className="text-sm font-semibold">{(monthlyDeposit * 12).toLocaleString('bg-BG')} лв. на година</p>
            </div>

            <div className="bg-slate-200 p-3 rounded text-center">
              <p className="text-xs text-slate-500">Краткосрочни цели</p>
              <p className="font-bold">{shortTermGoals.toLocaleString('bg-BG')} лв.</p>
              <p className="text-xs text-slate-500">({(shortTermGoals * 12).toLocaleString('bg-BG')} лв. на година)</p>
            </div>
          </div>

          {/* Right - Products */}
          <div className="space-y-4">
            {plan?.products?.slice(0, 3).map((product, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-[#8B1538] rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {product.product_type === 'pension_plan' ? 'П' : 
                       product.product_type === 'ul_investment' ? 'И' : 'З'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Годишно</p>
                    <p className="text-xs font-semibold text-[#8B1538]">
                      {analysis?.client_first_name}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  {product.product_type === 'pension_plan' ? 'Достойна пенсия и Подсигуряване на дохода' :
                   product.product_type === 'ul_investment' ? 'Инвестиции' : 'Защита'}
                </p>
                <p className="font-bold text-[#8B1538]">
                  {(product.monthly_premium || 0).toLocaleString('bg-BG')} лв. на месец
                </p>
                <p className="text-xs text-slate-500">
                  ({((product.monthly_premium || 0) * 12).toLocaleString('bg-BG')} лв. на година)
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Provider Logos Section */}
      <div className="mt-8 pt-6 border-t">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded">
            <p className="text-sm font-bold text-green-700">ДСК-Родина</p>
            <p className="text-xs text-slate-500">Пенсионен фонд</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded">
            <p className="text-sm font-bold text-blue-700">ОББ</p>
            <p className="text-xs text-slate-500">Пенсионно осигуряване</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded">
            <p className="text-sm font-bold text-green-600">MetLife</p>
            <p className="text-xs text-slate-500">Застраховки</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded">
            <p className="text-sm font-bold text-blue-600">UNIQA</p>
            <p className="text-xs text-slate-500">Здравни застраховки</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FinancialPlanPDF({ plan, analysis, consultant }) {
  return (
    <div className="space-y-8 print:space-y-0">
      <CoverPage plan={plan} analysis={analysis} consultant={consultant} />
      <div className="page-break"></div>
      <FinancialPlanMainPage plan={plan} analysis={analysis} />
      <div className="page-break"></div>
      <IncomeProtectionPage plan={plan} analysis={analysis} />
      <div className="page-break"></div>
      <PortfolioStructurePage plan={plan} analysis={analysis} />
      
      <style>{`
        @media print {
          .page-break {
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
}