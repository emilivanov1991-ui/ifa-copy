import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart, Cell, Treemap } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Download, X, CheckCircle, TrendingUp, Shield, Home, Wallet, DollarSign } from 'lucide-react';
import { downloadFinancialPlanPDF } from './FinancialPlanPDFGenerator';
import { toast } from 'sonner';

// Calculate wealth projection with correct formulas
const calculateWealthProjection = (planData, clientData, analysisData) => {
  const monthsToRetirement = (clientData.yearsToRetirement || 0) * 12;
  const monthlyBalance = planData.calculations?.monthlyBalance || 0;
  const totalMonthlyPremium = planData.total_monthly_premium || 0;
  const monthlyReserve = monthlyBalance - totalMonthlyPremium;
  
  // WITHOUT PLAN - just monthly savings
  const withoutPlan = monthlyBalance * monthsToRetirement;
  
  // WITH PLAN - detailed calculation
  
  // 1. УПФ accumulated (using 5% contribution, 6% return, до 65г)
  const grossIncome = (analysisData?.client_gross_income || 0) + (analysisData?.partner_gross_income || 0);
  const maxInsurableIncome = 3400; // BGN cap
  const monthlyContribution = Math.min(grossIncome, maxInsurableIncome) * 0.05;
  const yearsToRetirement = clientData.yearsToRetirement || 30;
  const upfReturn = 0.06 / 12; // 6% annual = 0.5% monthly
  const upfMonths = yearsToRetirement * 12;
  const upfValue = monthlyContribution * (((Math.pow(1 + upfReturn, upfMonths) - 1) / upfReturn) * (1 + upfReturn));
  
  // 2. 30% от надплатени лихви по ипотека
  const mortgageAmount = analysisData?.liability_mortgage || 0;
  const mortgageRate = 0.06; // 6% средно
  const mortgageTerm = 20; // средно 20 години
  let mortgageInterestSavings = 0;
  if (mortgageAmount > 0) {
    const totalInterestPaid = (mortgageAmount * mortgageRate * mortgageTerm) * 0.5; // approximate
    mortgageInterestSavings = totalInterestPaid * 0.3;
  }
  
  // 3. Стойност на имот (ако ще се закупува)
  const propertyValue = analysisData?.planning_housing_change && analysisData?.planned_housing_value 
    ? analysisData.planned_housing_value 
    : 0;
  
  // 4. Unit Linked инвестиции до 65г (8% доходност)
  const ulProducts = (planData.products || []).filter(p => 
    p.name.includes('Unit Linked') && !p.name.includes('Junior')
  );
  const ulMonthlyPremium = ulProducts.reduce((sum, p) => sum + (p.monthlyPremium || 0), 0);
  const ulReturn = 0.08 / 12; // 8% annual
  const ulValue = ulMonthlyPremium * (((Math.pow(1 + ulReturn, upfMonths) - 1) / ulReturn) * (1 + ulReturn));
  
  // 5. Unit Linked Junior до 19г
  const juniorProducts = (planData.products || []).filter(p => p.name.includes('Junior'));
  const juniorMonthlyPremium = juniorProducts.reduce((sum, p) => sum + (p.monthlyPremium || 0), 0);
  const juniorYears = Math.max(19 - 5, 0); // assume child is 5 years old
  const juniorMonths = juniorYears * 12;
  const juniorValue = juniorMonthlyPremium > 0 
    ? juniorMonthlyPremium * (((Math.pow(1 + ulReturn, juniorMonths) - 1) / ulReturn) * (1 + ulReturn))
    : 0;
  
  // 6. Резервен остатък * месеци
  const reserveAccumulation = monthlyReserve * monthsToRetirement;
  
  const withPlan = upfValue + mortgageInterestSavings + propertyValue + ulValue + juniorValue + reserveAccumulation;
  
  return { withoutPlan, withPlan, monthlyReserve };
};

// Calculate allocation breakdown including reserve
const calculateAllocation = (planData, monthlyReserve) => {
  const products = planData.products || [];
  let investments = 0;
  let incomeProtection = 0;
  let propertyProtection = 0;
  let loans = 0;
  
  products.forEach(p => {
    const premium = p.monthlyPremium || 0;
    if (p.name.includes('Unit Linked') || p.name.includes('УПФ')) {
      investments += premium;
    } else if (p.name.includes('Uniqa') || p.name.includes('Generali') || p.name.includes('Срочен живот') || p.name.includes('Care')) {
      incomeProtection += premium;
    } else if (p.name.includes('Дом') || p.name.includes('Каско')) {
      propertyProtection += premium;
    } else if (p.name.includes('кредит') || p.name.includes('Ипотека')) {
      loans += premium;
    }
  });
  
  const reserve = Math.max(monthlyReserve, 0);
  const total = investments + incomeProtection + propertyProtection + loans + reserve || 1;
  
  return {
    investments: { amount: investments, percent: (investments / total) * 100 },
    incomeProtection: { amount: incomeProtection, percent: (incomeProtection / total) * 100 },
    propertyProtection: { amount: propertyProtection, percent: (propertyProtection / total) * 100 },
    loans: { amount: loans, percent: (loans / total) * 100 },
    reserve: { amount: reserve, percent: (reserve / total) * 100 }
  };
};

export default function FinancialPlanPresentation({ planData, clientData, analysisData, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Курс BGN към EUR
  const EUR_BGN_RATE = 1.95583;

  // Продукти в лева, които трябва да се конвертират
  const productsInBGN = [
    'ДЗИ Закрила',
    'ДЗИ Каско',
    'ДЗИ ГО',
    'Uniqa У дома',
    'Generali Health Line',
    'Инстинкт',
    'ОББ'
  ];

  // Функция за конвертиране на премия към EUR ако е нужно
  const convertToEUR = (product) => {
    const needsConversion = productsInBGN.some(name => product.name.includes(name));
    return {
      ...product,
      monthlyPremium: needsConversion && product.monthlyPremium 
        ? product.monthlyPremium / EUR_BGN_RATE 
        : product.monthlyPremium,
      annualPremium: needsConversion && product.annualPremium
        ? product.annualPremium / EUR_BGN_RATE
        : product.annualPremium,
      coverage: needsConversion && product.coverage
        ? product.coverage / EUR_BGN_RATE
        : product.coverage
    };
  };

  // Конвертираме продуктите
  const productsEUR = (planData.products || []).map(convertToEUR);
  const totalMonthlyPremiumEUR = productsEUR.reduce((sum, p) => sum + (p.monthlyPremium || 0), 0);

  // Calculate data
  const age = clientData?.age || 24;
  const retirementAge = clientData?.retirementAge || 65;
  const yearsToRetirement = clientData?.yearsToRetirement || (retirementAge - age);
  const monthsToRetirement = yearsToRetirement * 12;
  
  // Wealth projection with correct formulas
  const wealth = calculateWealthProjection(planData, clientData, analysisData);
  const allocation = calculateAllocation(planData, wealth.monthlyReserve);
  
  // Курс BGN към EUR
  const EUR_BGN_RATE = 1.95583;

  // Нетно имущество от анализа (в лева, конвертираме към евро)
  const assets = (
    (analysisData?.client_checking_account || 0) +
    (analysisData?.client_savings_book || 0) +
    (analysisData?.client_term_deposit || 0) +
    (analysisData?.client_mutual_funds || 0) +
    (analysisData?.client_savings_account || 0) +
    (analysisData?.client_cash || 0) +
    (analysisData?.partner_checking_account || 0) +
    (analysisData?.partner_savings_book || 0) +
    (analysisData?.partner_term_deposit || 0) +
    (analysisData?.partner_mutual_funds || 0) +
    (analysisData?.partner_savings_account || 0) +
    (analysisData?.partner_cash || 0)
  ) / EUR_BGN_RATE;

  const liabilities = (
    (analysisData?.liability_mortgage || 0) +
    (analysisData?.liability_consumer_loans || 0) +
    (analysisData?.liability_credit_cards || 0) +
    (analysisData?.liability_leasing || 0) +
    (analysisData?.liability_overdraft || 0)
  ) / EUR_BGN_RATE;

  const initialNetWorth = assets - liabilities;

  // Capital chart data - real values in EUR
  const monthlyInvestment = (planData.products || [])
    .filter(p => p.name.includes('Unit Linked') || p.name.includes('УПФ'))
    .reduce((sum, p) => sum + (p.monthlyPremium || 0), 0);

  const annualSalaryGrowth = 0.03; // 3% годишен растеж на заплатата
  const investmentReturn = 0.08; // 8% годишна доходност на инвестициите

  const capitalData = Array.from({ length: Math.min(yearsToRetirement + 1, 42) }, (_, i) => {
    const currentAge = age + i;
    const yearsLeft = yearsToRetirement - i;

    // Трудов капитал = бъдещи доходи до пенсия (намалява с времето) - в евро
    const avgYearsLeft = yearsLeft / 2;
    const monthlyNetIncomeEUR = clientData.monthlyNetIncome / EUR_BGN_RATE;
    const laborCapital = yearsLeft > 0 
      ? (monthlyNetIncomeEUR * 12 * yearsLeft * Math.pow(1 + annualSalaryGrowth, avgYearsLeft))
      : 0;

    // Финансов капитал = начално имущество + натрупани инвестиции до момента (в евро)
    const monthlyReturn = investmentReturn / 12;
    const monthsInvested = i * 12;
    const investmentGrowth = monthsInvested > 0 && monthlyInvestment > 0
      ? monthlyInvestment * (((Math.pow(1 + monthlyReturn, monthsInvested) - 1) / monthlyReturn) * (1 + monthlyReturn))
      : 0;

    // Начално имущество също расте с времето (предполагаме 4% доходност)
    const wealthGrowthRate = 0.04;
    const grownInitialWealth = initialNetWorth * Math.pow(1 + wealthGrowthRate, i);

    const financialCapital = grownInitialWealth + investmentGrowth;

    return {
      age: currentAge,
      laborCapital: laborCapital / 1000, // в хиляди евро
      financialCapital: financialCapital / 1000, // в хиляди евро
    };
  });

  const wealthComparisonData = [
    {
      name: 'БЕЗ план',
      value: wealth.withoutPlan,
      fill: '#94a3b8'
    },
    {
      name: 'С НАШИЯ план',
      value: wealth.withPlan,
      fill: '#22c55e'
    }
  ];

  const allocationData = [
    { name: 'Инвестиции', value: allocation.investments.amount, color: '#3b82f6', icon: '📈' },
    { name: 'Защита на дохода', value: allocation.incomeProtection.amount, color: '#10b981', icon: '🛡️' },
    { name: 'Защита на имущество', value: allocation.propertyProtection.amount, color: '#f59e0b', icon: '🏠' },
    { name: 'Кредити', value: allocation.loans.amount, color: '#8b5cf6', icon: '💳' },
    { name: 'Резерв', value: allocation.reserve.amount, color: '#06b6d4', icon: '💰' }
  ].filter(item => item.value > 0);
  
  const products = planData.products || [];

  const totalTaxRelief = planData.calculations?.totalTaxRelief || 0;
  const dailyCost = ((planData.total_monthly_premium || 0) / 30).toFixed(2);

  const slides = [
    {
      title: 'Трудов vs Финансов капитал',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Вашата финансова стратегия</h2>
            <p className="text-slate-600">Как изграждаме вашата финансова независимост</p>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={capitalData}>
              <defs>
                <linearGradient id="laborGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="financialGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="age" 
                label={{ value: 'Възраст', position: 'insideBottom', offset: -5 }}
                stroke="#64748b"
              />
              <YAxis 
                label={{ value: 'Капитал (хил. EUR)', angle: -90, position: 'insideLeft' }}
                stroke="#64748b"
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                labelFormatter={(value) => `Възраст: ${value}`}
                formatter={(value, name) => [
                  `${value.toFixed(0)} хил. EUR`, 
                  name === 'laborCapital' ? 'Трудов капитал' : 'Финансов капитал'
                ]}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => value === 'laborCapital' ? 'Трудов капитал' : 'Финансов капитал'}
              />
              <Area 
                type="monotone" 
                dataKey="laborCapital" 
                stroke="#dc2626" 
                strokeWidth={3}
                fill="url(#laborGradient)" 
                name="laborCapital"
              />
              <Area 
                type="monotone" 
                dataKey="financialCapital" 
                stroke="#2563eb" 
                strokeWidth={3}
                fill="url(#financialGradient)" 
                name="financialCapital"
              />
            </AreaChart>
          </ResponsiveContainer>

          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Стратегия за успех</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Докато вашият <strong className="text-red-600">трудов капитал</strong> постепенно намалява с приближаването на пенсионната възраст, 
                    ние изграждаме вашия <strong className="text-blue-600">финансов капитал</strong> чрез инвестиции. 
                    През целия период осигуряваме <strong className="text-red-600">защита</strong> на дохода ви, 
                    за да гарантираме плавния преход към финансова независимост.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: 'Вашата инвестиция',
      content: (
        <div className="space-y-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Месечна инвестиция</h2>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl p-8 shadow-2xl">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-4"
              >
                <span className="text-7xl font-bold">{planData.total_monthly_premium?.toFixed(0) || '0'}</span>
                <div className="text-left">
                  <p className="text-2xl font-semibold">лв/месец</p>
                  <p className="text-lg text-blue-200">само {dailyCost} лв/ден</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">
              Растеж на имуществото до пенсиониране
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={wealthComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis 
                  stroke="#64748b"
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  formatter={(value) => [`${(value / 1000).toFixed(0)}K лв`, 'Стойност']}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {wealthComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <p className="text-sm font-semibold text-amber-900">
                  +{(((wealth.withPlan - wealth.withoutPlan) / wealth.withoutPlan) * 100).toFixed(0)}% ръст с нашия план! 🚀
                </p>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                *Проекция при {yearsToRetirement} години инвестиции до {retirementAge} г. възраст
              </p>
              <p className="text-xs text-amber-600 mt-2 font-semibold">
                Месечен резерв: {wealth.monthlyReserve.toFixed(0)} лв (спестявания извън плана)
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Предимства',
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-6">Предимства на плана</h2>
          
          {/* Priorities Section */}
          {(() => {
            const priorityLabels = {
              priority_income_protection: 'Защита на дохода',
              priority_reserve: 'Увеличаване на резервите',
              priority_housing: 'Ново жилище',
              priority_pension: 'Достойна пенсия',
              priority_children: 'Подсигуряване на децата',
              priority_property_protection: 'Защита на собствеността',
              priority_other: 'Други'
            };
            
            const priorities = Object.keys(priorityLabels)
              .map(key => ({
                label: priorityLabels[key],
                value: analysisData?.[key] || 0
              }))
              .filter(p => p.value > 0)
              .sort((a, b) => a.value - b.value);
            
            return priorities.length > 0 && (
              <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-red-900 mb-4 text-center">ПРИОРИТЕТИ</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {priorities.map((priority, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <p className="text-slate-700 font-medium">{priority.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })()}
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Гъвкавост', desc: 'възможност да се променят сумите, определени за отделните цели', color: 'blue', icon: '🔄' },
              { title: 'Променливост', desc: 'възможност да се добавят и променят финансовите решения', color: 'purple', icon: '⚡' },
              { title: 'Качество', desc: 'финансови решения от качествени институции', color: 'pink', icon: '⭐' },
              { title: 'Надежност', desc: 'във всяка ситуация ще има финансов съветник, който ще се грижи за Вас', color: 'amber', icon: '🤝' },
              { title: 'Обслужване', desc: 'актуализиране при промяна на финансовото състояние или на пазара', color: 'cyan', icon: '🔧' },
              { title: 'Данъчно облекчение', desc: 'спестяване от данъци за целия период', color: 'green', icon: '💰' }
            ].map((adv, idx) => (
              <motion.div
                key={idx}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`border-l-4 border-${adv.color}-500 hover:shadow-lg transition-shadow`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{adv.icon}</span>
                      <div>
                        <h4 className={`font-bold text-${adv.color}-700 mb-1`}>{adv.title}</h4>
                        <p className="text-sm text-slate-600">{adv.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold mb-1 flex items-center gap-2">
                  <DollarSign className="w-6 h-6" />
                  Данъчно облекчение
                </h4>
                <p className="text-green-100 text-sm">Спестени данъци за {yearsToRetirement} години</p>
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold">{totalTaxRelief.toLocaleString()}</p>
                <p className="text-xl text-green-100">лв</p>
              </div>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      title: 'Разпределение',
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            Разпределение на вашите спестявания
          </h2>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
            <ResponsiveContainer width="100%" height={400}>
              <Treemap
                data={allocationData}
                dataKey="value"
                aspectRatio={4/3}
                stroke="#fff"
                fill="#8884d8"
                content={({ x, y, width, height, index, name, value, color, icon }) => {
                  const totalAllocation = allocation.investments.amount + allocation.incomeProtection.amount + 
                                          allocation.propertyProtection.amount + allocation.loans.amount + allocation.reserve.amount;
                  const monthlyIncome = (analysisData?.client_net_income || 0) + (analysisData?.partner_net_income || 0);
                  const percent = ((value / totalAllocation) * 100).toFixed(1);
                  const percentOfIncome = monthlyIncome > 0 ? ((value / monthlyIncome) * 100).toFixed(1) : 0;

                  return (
                    <g>
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        style={{
                          fill: color,
                          stroke: '#fff',
                          strokeWidth: 2,
                        }}
                      />
                      {width > 60 && height > 60 && (
                        <>
                          <text
                            x={x + width / 2}
                            y={y + height / 2 - 35}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize={32}
                            fontWeight="bold"
                          >
                            {percent}%
                          </text>
                          <text
                            x={x + width / 2}
                            y={y + height / 2 - 5}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize={14}
                          >
                            {name}
                          </text>
                          <text
                            x={x + width / 2}
                            y={y + height / 2 + 18}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize={16}
                            fontWeight="bold"
                          >
                            {value.toFixed(0)} лв
                          </text>
                          <text
                            x={x + width / 2}
                            y={y + height / 2 + 38}
                            textAnchor="middle"
                            fill="rgba(255,255,255,0.9)"
                            fontSize={11}
                          >
                            {percent}% от спестявания
                          </text>
                          <text
                            x={x + width / 2}
                            y={y + height / 2 + 53}
                            textAnchor="middle"
                            fill="rgba(255,255,255,0.8)"
                            fontSize={11}
                          >
                            {percentOfIncome}% от доход
                          </text>
                        </>
                      )}
                      {width > 30 && width <= 60 && height > 30 && (
                        <>
                          <text
                            x={x + width / 2}
                            y={y + height / 2 - 20}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize={20}
                            fontWeight="bold"
                          >
                            {percent}%
                          </text>
                          <text
                            x={x + width / 2}
                            y={y + height / 2}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize={11}
                          >
                            {name}
                          </text>
                          <text
                            x={x + width / 2}
                            y={y + height / 2 + 16}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize={12}
                            fontWeight="bold"
                          >
                            {value.toFixed(0)} лв
                          </text>
                          <text
                            x={x + width / 2}
                            y={y + height / 2 + 30}
                            textAnchor="middle"
                            fill="rgba(255,255,255,0.9)"
                            fontSize={9}
                          >
                            {percent}% от спестявания
                          </text>
                          <text
                            x={x + width / 2}
                            y={y + height / 2 + 42}
                            textAnchor="middle"
                            fill="rgba(255,255,255,0.8)"
                            fontSize={9}
                          >
                            {percentOfIncome}% от доход
                          </text>
                        </>
                      )}
                    </g>
                  );
                }}
              />
            </ResponsiveContainer>

            {/* Легенда за всички категории */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 mb-2 font-medium">Пълна разбивка:</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[
                  { name: 'Инвестиции', ...allocation.investments, color: '#3b82f6', icon: '📈' },
                  { name: 'Защита на дохода', ...allocation.incomeProtection, color: '#10b981', icon: '🛡️' },
                  { name: 'Защита на имущество', ...allocation.propertyProtection, color: '#f59e0b', icon: '🏠' },
                  { name: 'Кредити', ...allocation.loans, color: '#8b5cf6', icon: '💳' },
                  { name: 'Резерв', ...allocation.reserve, color: '#06b6d4', icon: '💰' }
                ].filter(item => item.amount > 0).map((item, idx) => {
                  const monthlyIncome = (analysisData?.client_net_income || 0) + (analysisData?.partner_net_income || 0);
                  const percentOfIncome = monthlyIncome > 0 ? ((item.amount / monthlyIncome) * 100).toFixed(1) : 0;
                  return (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                      <div 
                        className="w-3 h-3 rounded-sm flex-shrink-0" 
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{item.name}</p>
                        <p className="text-xs text-slate-900 font-bold">{item.amount.toFixed(0)} лв</p>
                        <p className="text-[10px] text-slate-500">
                          {item.percent.toFixed(1)}% от спестявания • {percentOfIncome}% от доход
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {allocationData.map((item, idx) => {
              const totalSavings = allocation.investments.amount + allocation.incomeProtection.amount + 
                allocation.propertyProtection.amount + allocation.loans.amount + allocation.reserve.amount;
              const monthlyIncome = (analysisData?.client_net_income || 0) + (analysisData?.partner_net_income || 0);
              const percentOfSavings = ((item.value / totalSavings) * 100).toFixed(1);
              const percentOfIncome = monthlyIncome > 0 ? ((item.value / monthlyIncome) * 100).toFixed(1) : 0;
              
              return (
                <Card key={idx} className="border-2" style={{ borderColor: item.color }}>
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">{item.name}</p>
                    <p className="text-lg font-bold" style={{ color: item.color }}>
                      {item.value.toFixed(0)} лв
                    </p>
                    <p className="text-xs text-slate-600 font-medium">
                      {percentOfSavings}% от спестявания
                    </p>
                    <p className="text-xs text-slate-500">
                      {percentOfIncome}% от доход
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )
    },
    {
      title: 'Продукти',
      content: (
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">Вашите продукти</h2>
          
          <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2">
            {products.map((product, idx) => (
              <motion.div
                key={idx}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all border-l-4 border-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 mb-1">{product.name}</h4>
                          <p className="text-sm text-slate-600 mb-2">{product.benefit}</p>
                          {product.coverage && (
                            <p className="text-xs text-slate-500">
                              Покритие: <span className="font-semibold">{product.coverage.toLocaleString()} лв</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {product.monthlyPremium === 0 ? 'БЕЗПЛАТНО' : `${product.monthlyPremium.toFixed(0)} лв`}
                        </p>
                        <p className="text-xs text-slate-500">месечно</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )
    }
  ];

  const handleDownloadPDF = () => {
    const clientInfo = {
      name: `${analysisData?.client_first_name || ''} ${analysisData?.client_last_name || ''}`.trim(),
      age: clientData?.age,
      retirementAge: clientData?.retirementAge,
      yearsToRetirement: clientData?.yearsToRetirement
    };
    downloadFinancialPlanPDF(planData, clientInfo);
    toast.success('✓ PDF файлът се изтегля');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-50 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Персонализиран финансов план</h1>
              <p className="text-blue-100">
                {analysisData?.client_first_name} {analysisData?.client_last_name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleDownloadPDF}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Изтегли PDF
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white border-b border-slate-200 px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                {slides[currentSlide].title}
              </span>
              <span className="text-sm text-slate-500">
                {currentSlide + 1} / {slides.length}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {slides[currentSlide].content}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white border-t border-slate-200 p-6 shadow-xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              className="min-w-[120px]"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>

            <div className="flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentSlide 
                      ? 'bg-blue-600 w-8' 
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={() => {
                if (currentSlide < slides.length - 1) {
                  setCurrentSlide(currentSlide + 1);
                } else {
                  onClose();
                }
              }}
              className="min-w-[120px] bg-blue-600 hover:bg-blue-700"
            >
              {currentSlide < slides.length - 1 ? (
                <>
                  Напред
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                'Завърши'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}