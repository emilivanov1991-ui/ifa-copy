import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart, Cell, PieChart, Pie, Sankey, Rectangle } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ChevronLeft, ChevronRight, Download, X, CheckCircle, TrendingUp, Shield, Home, Wallet, Euro, AlertTriangle, Edit, Check } from 'lucide-react';
import { downloadFinancialPlanPDF } from './FinancialPlanPDFGenerator';
import { toast } from 'sonner';



// Calculate allocation breakdown including reserve (in EUR)
const calculateAllocation = (planData, monthlyReserve, productsEUR, eurRate) => {
  const products = productsEUR;
  let investments = 0;
  let incomeProtection = 0;
  let propertyProtection = 0;
  let loans = 0;

  console.log('=== Starting allocation calculation ===');
  console.log('Total products:', products.length);

  products.forEach((p, idx) => {
    const premium = p.monthlyPremium || 0;
    const investmentPremium = p.investmentPremium || 0;
    const insurancePremium = p.insurancePremium || 0;

    console.log(`\n[Product ${idx + 1}] ${p.name}`);
    console.log('  Type:', p.type);
    console.log('  Product Type:', p.product_type);
    console.log('  Provider:', p.provider);
    console.log('  Premium:', premium);
    console.log('  Investment Premium:', investmentPremium);
    console.log('  Insurance Premium:', insurancePremium);

    // Категоризация на продуктите

    // 1. ИНВЕСТИЦИИ
    // MetLife Unit Linked - разделяме на инвестиционна и застрахователна част
    if (
      (p.type === 'ul_investment' || (p.name && p.name.includes('Unit Linked'))) &&
      (p.provider && p.provider.includes('MetLife'))
    ) {
      if (investmentPremium > 0 || insurancePremium > 0) {
        investments += investmentPremium;
        incomeProtection += insurancePremium;
        console.log('  ✓ MetLife UL - Инвестиции:', investmentPremium, 'Застраховка:', insurancePremium);
      } else {
        const investmentPart = premium * 0.85;
        const insurancePart = premium * 0.15;
        investments += investmentPart;
        incomeProtection += insurancePart;
        console.log('  ✓ MetLife UL (85/15) - Инвестиции:', investmentPart, 'Застраховка:', insurancePart);
      }
    }
    // УПФ, Partners, чисти инвестиционни продукти
    else if (
      p.type === 'pension_plan' || 
      (p.name && (p.name.includes('УПФ') || p.name.includes('ДПФ') || p.name.includes('Partners')))
    ) {
      investments += premium;
      console.log('  ✓ ИНВЕСТИЦИИ (УПФ/Partners)');
    }

    // 2. КРЕДИТИ
    else if (
      p.type === 'mortgage_loan' || 
      p.type === 'consumer_loan' ||
      (p.name && (p.name.includes('Кредит') || p.name.includes('Ипотека')))
    ) {
      loans += premium;
      console.log('  ✓ КРЕДИТИ');
    }

    // 3. ЗАЩИТА НА ИМУЩЕСТВО
    else if (
      p.type === 'property_insurance' || 
      p.type === 'car_insurance' || 
      p.type === 'home_insurance' ||
      (p.name && (p.name.includes('Каско') || p.name.includes('ГО') || p.name.includes('Дом') || p.name.includes('Имущество'))) ||
      (p.provider && p.provider.includes('Инстинкт'))
    ) {
      propertyProtection += premium;
      console.log('  ✓ ЗАЩИТА НА ИМУЩЕСТВО');
    }

    // 4. ЗАЩИТА НА ДОХОДА (включва застраховки живот и здраве)
    else {
      incomeProtection += premium;
      console.log('  ✓ ЗАЩИТА НА ДОХОДА (здравни и други)');
    }
  });

  console.log('\n=== Final allocation totals ===');
  console.log('Investments:', investments.toFixed(2), 'EUR');
  console.log('Income Protection:', incomeProtection.toFixed(2), 'EUR');
  console.log('Property Protection:', propertyProtection.toFixed(2), 'EUR');
  console.log('Loans:', loans.toFixed(2), 'EUR');

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
  const [editingProductIndex, setEditingProductIndex] = useState(null);
  const [modifiedProducts, setModifiedProducts] = useState([]);

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
    const needsConversion = productsInBGN.some(name => product.provider && product.provider.includes(name));
    const converted = {
      ...product,
      monthlyPremium: needsConversion && product.monthlyPremium 
        ? product.monthlyPremium / EUR_BGN_RATE 
        : product.monthlyPremium,
      annualPremium: needsConversion && product.annualPremium
        ? product.annualPremium / EUR_BGN_RATE
        : product.annualPremium,
      coverage: needsConversion && product.coverage
        ? product.coverage / EUR_BGN_RATE
        : product.coverage,
      // Запазване на инвестиционна и застрахователна премия (в EUR)
      investmentPremium: product.investmentPremium,
      insurancePremium: product.insurancePremium
    };

    // Explicit запазване на критични свойства
    if (product.product_type) converted.product_type = product.product_type;
    if (product.provider) converted.provider = product.provider;
    if (product.type) converted.type = product.type;
    if (product.name) converted.name = product.name;

    console.log('Product conversion:', {
      original: { name: product.name, type: product.type, product_type: product.product_type, provider: product.provider, investmentPremium: product.investmentPremium, insurancePremium: product.insurancePremium },
      converted: { name: converted.name, type: converted.type, product_type: converted.product_type, provider: converted.provider, investmentPremium: converted.investmentPremium, insurancePremium: converted.insurancePremium }
    });

    return converted;
  };

  // Конвертираме продуктите
  const productsEUR = (planData.products || []).map(convertToEUR);
  const totalMonthlyPremiumEUR = productsEUR.reduce((sum, p) => sum + (p.monthlyPremium || 0), 0);

  // Calculate data
  const age = clientData?.age || 24;
  const retirementAge = clientData?.retirementAge || 65;
  const yearsToRetirement = clientData?.yearsToRetirement || (retirementAge - age);
  const monthsToRetirement = yearsToRetirement * 12;
  
  // Изчисляване на месечния баланс (доходи - разходи) - ВСИЧКО В BGN
  const totalIncome = (analysisData?.client_net_income || 0) + (analysisData?.partner_net_income || 0);
  const totalExpenses = (analysisData?.expense_rent || 0) + (analysisData?.expense_utilities || 0) + 
    (analysisData?.expense_food || 0) + (analysisData?.expense_phone || 0) + (analysisData?.expense_internet || 0) +
    (analysisData?.expense_tv || 0) + (analysisData?.expense_other_housing || 0) + (analysisData?.expense_fuel || 0) +
    (analysisData?.expense_car_maintenance || 0) + (analysisData?.expense_car_other || 0) +
    (analysisData?.expense_clothing || 0) + (analysisData?.expense_culture || 0) + (analysisData?.expense_travel || 0) +
    (analysisData?.expense_children || 0) + (analysisData?.expense_cigarettes || 0) + (analysisData?.expense_pets || 0) +
    (analysisData?.expense_vacation || 0) + (analysisData?.expense_business || 0) + (analysisData?.expense_other || 0);
  
  const actualMonthlyBalanceBGN = totalIncome - totalExpenses;
  
  // КОНВЕРТИРАМЕ В EUR
  const monthlyBalanceEUR = actualMonthlyBalanceBGN / EUR_BGN_RATE;
  const monthlyReserveEUR = monthlyBalanceEUR - totalMonthlyPremiumEUR;
  
  // Изчисляваме wealth от последната точка на графиката (за да сме синхронизирани)
  const calculateWealthFromChart = () => {
    const years = Math.min(yearsToRetirement, 41);
    const i = years; // последна точка
    const currentMonths = i * 12;
    
    // БЕЗ ПЛАН: просто натрупване без растеж
    const withoutPlan = monthlyBalanceEUR * currentMonths;
    
    // С ПЛАН: СЪЩОТО изчисление като financialCapital от страница 1
    const monthlyInvestment = (productsEUR || [])
      .filter(p => p.type === 'ul_investment' || p.name.includes('Unit Linked') || p.name.includes('УПФ') || p.name.includes('Partners'))
      .reduce((sum, p) => sum + (p.monthlyPremium || 0), 0);
    
    // Настоящи активи с растеж
    const liquidAssetsValue = (
      (analysisData?.client_checking_account || 0) +
      (analysisData?.client_savings_book || 0) +
      (analysisData?.client_term_deposit || 0) +
      (analysisData?.client_savings_account || 0) +
      (analysisData?.client_cash || 0) +
      (analysisData?.partner_checking_account || 0) +
      (analysisData?.partner_savings_book || 0) +
      (analysisData?.partner_term_deposit || 0) +
      (analysisData?.partner_savings_account || 0) +
      (analysisData?.partner_cash || 0)
    ) / EUR_BGN_RATE;
    
    const investmentAssetsValue = (
      (analysisData?.client_mutual_funds || 0) +
      (analysisData?.partner_mutual_funds || 0)
    ) / EUR_BGN_RATE;
    
    const realEstateValue = (
      (analysisData?.current_housing === 'owned' ? (analysisData?.current_housing_value || 0) : 0) +
      (analysisData?.property_apartment_value || 0) +
      (analysisData?.property_house_value || 0)
    ) / EUR_BGN_RATE;
    
    const vehiclesValue = (analysisData?.property_car_value || 0) / EUR_BGN_RATE;
    const liabilities = (
      (analysisData?.liability_mortgage || 0) +
      (analysisData?.liability_consumer_loans || 0) +
      (analysisData?.liability_credit_cards || 0) +
      (analysisData?.liability_leasing || 0) +
      (analysisData?.liability_overdraft || 0)
    ) / EUR_BGN_RATE;
    
    const grownLiquidAssets = liquidAssetsValue * Math.pow(1.04, i);
    const grownInvestmentAssets = investmentAssetsValue * Math.pow(1.08, i);
    const grownRealEstate = realEstateValue * Math.pow(1.05, i);
    const grownVehicles = vehiclesValue * Math.pow(0.97, i);
    
    // Кредити намаляват линейно
    const avgLoanYears = 15;
    const remainingDebt = i < avgLoanYears ? liabilities * (1 - i / avgLoanYears) : 0;
    
    const grownInitialWealth = grownLiquidAssets + grownInvestmentAssets + grownRealEstate + grownVehicles - remainingDebt;
    
    // Нови инвестиции с растеж
    const monthlyReturn = 0.08 / 12;
    const investmentGrowth = currentMonths > 0 && monthlyInvestment > 0
      ? monthlyInvestment * (((Math.pow(1 + monthlyReturn, currentMonths) - 1) / monthlyReturn) * (1 + monthlyReturn))
      : 0;
    
    const withPlan = grownInitialWealth + investmentGrowth;
    
    return { withoutPlan, withPlan, monthlyReserveEUR };
  };
  
  const wealth = calculateWealthFromChart();
  const allocation = calculateAllocation(planData, monthlyReserveEUR, productsEUR, EUR_BGN_RATE);
  
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
  // Вземаме месечните инвестиции от реалните продукти в плана
  const monthlyInvestment = (productsEUR || [])
    .filter(p => p.type === 'ul_investment' || p.name.includes('Unit Linked') || p.name.includes('УПФ') || p.name.includes('Partners'))
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

    // Начално имущество също расте с времето
    // Ликвидни активи 4%, инвестиции 8%, недвижимо 5%, коли 3% обезценка
    const liquidAssetsValue = (
      (analysisData?.client_checking_account || 0) +
      (analysisData?.client_savings_book || 0) +
      (analysisData?.client_term_deposit || 0) +
      (analysisData?.client_savings_account || 0) +
      (analysisData?.client_cash || 0) +
      (analysisData?.partner_checking_account || 0) +
      (analysisData?.partner_savings_book || 0) +
      (analysisData?.partner_term_deposit || 0) +
      (analysisData?.partner_savings_account || 0) +
      (analysisData?.partner_cash || 0)
    ) / EUR_BGN_RATE;
    
    const investmentAssetsValue = (
      (analysisData?.client_mutual_funds || 0) +
      (analysisData?.partner_mutual_funds || 0)
    ) / EUR_BGN_RATE;
    
    const realEstateValue = (
      (analysisData?.current_housing === 'owned' ? (analysisData?.current_housing_value || 0) : 0) +
      (analysisData?.property_apartment_value || 0) +
      (analysisData?.property_house_value || 0)
    ) / EUR_BGN_RATE;
    
    const vehiclesValue = (analysisData?.property_car_value || 0) / EUR_BGN_RATE;
    
    const grownLiquidAssets = liquidAssetsValue * Math.pow(1.04, i);
    const grownInvestmentAssets = investmentAssetsValue * Math.pow(1.08, i);
    const grownRealEstate = realEstateValue * Math.pow(1.05, i);
    const grownVehicles = vehiclesValue * Math.pow(0.97, i);
    
    // Кредити намаляват линейно (средно 15 години погасяване)
    const avgLoanYears = 15;
    const remainingDebt = i < avgLoanYears ? liabilities * (1 - i / avgLoanYears) : 0;
    
    const grownInitialWealth = grownLiquidAssets + grownInvestmentAssets + grownRealEstate + grownVehicles - remainingDebt;

    const financialCapital = grownInitialWealth + investmentGrowth;
    
    const laborCapitalK = laborCapital / 1000;
    const financialCapitalK = financialCapital / 1000;

    return {
      age: currentAge,
      laborCapital: laborCapitalK,
      financialCapital: financialCapitalK,
      protectionArea: laborCapitalK > financialCapitalK ? [financialCapitalK, laborCapitalK] : null
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

  // Използваме директно продуктите от финансовия план
  const planProducts = planData.products || [];
  // Разпределение от месечния план - ВИНАГИ показваме всички категории
  const allocationData = [
    { name: 'Резерв', value: allocation.reserve.amount, color: '#06b6d4', icon: '💰' },
    { name: 'Инвестиции', value: allocation.investments.amount, color: '#3b82f6', icon: '📈' },
    { name: 'Защита на дохода', value: allocation.incomeProtection.amount, color: '#10b981', icon: '🛡️' },
    { name: 'Защита на имущество', value: allocation.propertyProtection.amount, color: '#f59e0b', icon: '🏠' },
    { name: 'Заеми и кредити', value: allocation.loans.amount, color: '#8b5cf6', icon: '💳' }
  ];
  
  const products = productsEUR;

  // Изчисляване на данъчно облекчение за целия период (различен период за всеки продукт)
  let totalTaxRelief = 0;

  productsEUR.forEach(p => {
    // Проверка дали продуктът е данъчно облагаем
    const isTaxDeductible = p.type === 'ul_investment' || 
      p.type === 'pension_plan' ||
      p.type === 'health_insurance' ||
      p.name.includes('Unit Linked') ||
      p.name.includes('УПФ') ||
      p.name.includes('Здраве');

    if (!isTaxDeductible) return;

    const annualPremium = (p.monthlyPremium || 0) * 12;

    // Определяме периода според типа продукт и бенефициент
    let yearsForTax = 0;

    if (p.name.includes('Junior') || p.name.includes('Детство')) {
      // За деца - до 19 години
      const childAge = p.age || 5; // По подразбиране 5 години ако няма възраст
      yearsForTax = Math.max(0, 19 - childAge);
    } else if (p.type === 'pension_plan' || p.name.includes('УПФ') || p.name.includes('ДПФ')) {
      // За пенсионни продукти - до пенсия на бенефициента
      const beneficiaryAge = p.age || clientData.age;
      const retirementAge = 65;
      yearsForTax = Math.max(0, retirementAge - beneficiaryAge);
    } else if (p.type === 'health_insurance' || p.name.includes('Здраве')) {
      // За здравни продукти - до 65 години на бенефициента
      const beneficiaryAge = p.age || clientData.age;
      yearsForTax = Math.max(0, 65 - beneficiaryAge);
    } else {
      // За Unit Linked на възрастни - до пенсия
      const beneficiaryAge = p.age || clientData.age;
      const retirementAge = clientData.retirementAge || 65;
      yearsForTax = Math.max(0, retirementAge - beneficiaryAge);
    }

    // Данъчно облекчение = 10% от годишната премия × брой години
    totalTaxRelief += annualPremium * 0.10 * yearsForTax;
  });

  const dailyCost = (totalMonthlyPremiumEUR / 30).toFixed(2);

  const slides = [
    {
      title: 'Трудов vs Финансов капитал',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Вашата финансова стратегия</h2>
            <p className="text-slate-600">Как изграждаме вашата финансова независимост</p>
          </div>
          
          <div className="relative">
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={capitalData}>
                <defs>
                  <linearGradient id="laborGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="financialGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.15}/>
                  </linearGradient>
                  <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="8" stroke="#dc2626" strokeWidth="1.5" opacity="0.5" />
                  </pattern>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="age" 
                  label={{ value: 'Възраст', position: 'insideBottom', offset: -5 }}
                  stroke="#64748b"
                />
                <YAxis 
                  label={{ value: 'Капитал', angle: -90, position: 'insideLeft' }}
                  stroke="#64748b"
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(2)} мил.` : `${value} хил.`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  labelFormatter={(value) => `Възраст: ${value}`}
                  formatter={(value, name) => {
                    if (name === 'protectionArea') return null;
                    const formattedValue = value >= 1000 
                      ? `${(value / 1000).toFixed(2)} мил. EUR` 
                      : `${value.toFixed(0)} хил. EUR`;
                    return [
                      formattedValue, 
                      name === 'laborCapital' ? 'Трудов капитал' : 'Финансов капитал'
                    ];
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => value === 'laborCapital' ? 'Трудов капитал' : 'Финансов капитал'}
                />
                <Area 
                  type="monotone" 
                  dataKey="protectionArea" 
                  stroke="none"
                  fill="url(#diagonalHatch)" 
                  connectNulls
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
            
            {/* Warning label in the absolute center of protection zone */}
            {(() => {
              const intersectionIndex = capitalData.findIndex((point, i) => 
                i > 0 && point.financialCapital >= point.laborCapital
              );
              
              if (intersectionIndex > 0) {
                // Calculate the geometric center of the hatched zone
                const protectionZone = capitalData.slice(0, intersectionIndex);
                
                // Sum all areas for weighted center calculation
                let totalArea = 0;
                let weightedX = 0;
                let weightedY = 0;
                
                protectionZone.forEach((point, i) => {
                  if (i < protectionZone.length - 1 && point.protectionArea) {
                    const [bottom, top] = point.protectionArea;
                    const area = top - bottom;
                    totalArea += area;
                    weightedX += i * area;
                    weightedY += ((top + bottom) / 2) * area;
                  }
                });
                
                const centerIndex = totalArea > 0 ? weightedX / totalArea : Math.floor(intersectionIndex / 2);
                const centerY = totalArea > 0 ? weightedY / totalArea : 
                  (capitalData[Math.floor(intersectionIndex / 2)].laborCapital + 
                   capitalData[Math.floor(intersectionIndex / 2)].financialCapital) / 2;
                
                // Calculate position as percentage with visual adjustments
                const xPercent = (centerIndex / (capitalData.length - 1)) * 100 + 5;
                const maxY = Math.max(...capitalData.map(d => Math.max(d.laborCapital, d.financialCapital)));
                const minY = Math.min(...capitalData.map(d => Math.min(d.laborCapital, d.financialCapital)));
                const yRange = maxY - minY;
                const yPercent = ((maxY - centerY) / yRange) * 100 - 10;
                
                return (
                  <div 
                    className="absolute bg-red-600 text-white px-3 py-2 rounded-lg shadow-xl pointer-events-none"
                    style={{
                      left: `${xPercent}%`,
                      top: `${yPercent}%`,
                      transform: 'translate(-50%, -50%)',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      lineHeight: '1.3',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Нужда от защита на трудовия капитал!</span>
                    </div>
                  </div>
                );
              }
              return null;
              })()}

              {/* Investment wealth label - dynamically positioned */}
              {(() => {
                const minAge = capitalData[0].age;
                const maxAge = capitalData[capitalData.length - 1].age;
                const maxChartYValue = Math.max(...capitalData.flatMap(d => [d.laborCapital, d.financialCapital]));

                // Position at 85% through the age span
                const targetAge = Math.round(minAge + 0.85 * (maxAge - minAge));
                const targetPoint = capitalData.find(d => d.age === targetAge);

                if (targetPoint && targetPoint.financialCapital > 0) {
                  const xPercent = ((targetAge - minAge) / (maxAge - minAge)) * 100;

                  const buffer = 0.015 * maxChartYValue; // Small buffer to avoid overlapping lines

                  // Check if there's enough space above the red line for the label
                  if (targetPoint.financialCapital > targetPoint.laborCapital + (2 * buffer)) {
                    // Position at 75% height in the blue area (closer to the top blue line)
                    const idealMidValue = targetPoint.laborCapital + 0.75 * (targetPoint.financialCapital - targetPoint.laborCapital);
                    const constrainedMidValue = Math.max(idealMidValue, targetPoint.laborCapital + 2 * buffer);
                    const finalMidValue = Math.min(constrainedMidValue, targetPoint.financialCapital - 2 * buffer);

                    const yPercent = (1 - (finalMidValue / maxChartYValue)) * 100;

                    return (
                      <div
                        className="absolute bg-green-600 text-white px-3 py-2 rounded-lg shadow-xl pointer-events-none"
                        style={{
                          left: `${xPercent}%`,
                          top: `${yPercent}%`,
                          transform: 'translate(-50%, -50%)',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          lineHeight: '1.3',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" />
                          <span>Имущество генерирано чрез инвестиции</span>
                        </div>
                      </div>
                    );
                  }
                }
                return null;
              })()}


              </div>

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
                <span className="text-7xl font-bold">{totalMonthlyPremiumEUR.toFixed(0)}</span>
                <div className="text-left">
                  <p className="text-2xl font-semibold">EUR/месец</p>
                  <p className="text-lg text-blue-200">само {dailyCost} EUR/ден</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">
              Размер на имуществото
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={(() => {
                const years = Math.min(yearsToRetirement, 41);
                
                // Използваме СЪЩАТА логика като на страница 1 за финансовия капитал
                return Array.from({ length: years + 1 }, (_, i) => {
                  const year = i;
                  const currentMonths = i * 12;
                  
                  // БЕЗ ПЛАН: просто натрупване без инвестиции и растеж
                  const withoutPlanValue = monthlyBalanceEUR * currentMonths;
                  
                  // С ПЛАН: СЪЩОТО изчисление като financialCapital от страница 1
                  const monthlyNetIncome = (analysisData?.client_net_income || 0) + (analysisData?.partner_net_income || 0);
                  const monthlyNetIncomeEUR = monthlyNetIncome / EUR_BGN_RATE;
                  const monthlyInvestment = (productsEUR || [])
                    .filter(p => p.type === 'ul_investment' || p.name.includes('Unit Linked') || p.name.includes('УПФ') || p.name.includes('Partners'))
                    .reduce((sum, p) => sum + (p.monthlyPremium || 0), 0);
                  
                  // Настоящи активи с растеж
                  const liquidAssetsValue = (
                    (analysisData?.client_checking_account || 0) +
                    (analysisData?.client_savings_book || 0) +
                    (analysisData?.client_term_deposit || 0) +
                    (analysisData?.client_savings_account || 0) +
                    (analysisData?.client_cash || 0) +
                    (analysisData?.partner_checking_account || 0) +
                    (analysisData?.partner_savings_book || 0) +
                    (analysisData?.partner_term_deposit || 0) +
                    (analysisData?.partner_savings_account || 0) +
                    (analysisData?.partner_cash || 0)
                  ) / EUR_BGN_RATE;
                  
                  const investmentAssetsValue = (
                    (analysisData?.client_mutual_funds || 0) +
                    (analysisData?.partner_mutual_funds || 0)
                  ) / EUR_BGN_RATE;
                  
                  const realEstateValue = (
                    (analysisData?.current_housing === 'owned' ? (analysisData?.current_housing_value || 0) : 0) +
                    (analysisData?.property_apartment_value || 0) +
                    (analysisData?.property_house_value || 0)
                  ) / EUR_BGN_RATE;
                  
                  const vehiclesValue = (analysisData?.property_car_value || 0) / EUR_BGN_RATE;
                  const liabilities = (
                    (analysisData?.liability_mortgage || 0) +
                    (analysisData?.liability_consumer_loans || 0) +
                    (analysisData?.liability_credit_cards || 0) +
                    (analysisData?.liability_leasing || 0) +
                    (analysisData?.liability_overdraft || 0)
                  ) / EUR_BGN_RATE;
                  
                  const grownLiquidAssets = liquidAssetsValue * Math.pow(1.04, i);
                  const grownInvestmentAssets = investmentAssetsValue * Math.pow(1.08, i);
                  const grownRealEstate = realEstateValue * Math.pow(1.05, i);
                  const grownVehicles = vehiclesValue * Math.pow(0.97, i);
                  
                  // Кредити намаляват линейно
                  const avgLoanYears = 15;
                  const remainingDebt = i < avgLoanYears ? liabilities * (1 - i / avgLoanYears) : 0;
                  
                  const grownInitialWealth = grownLiquidAssets + grownInvestmentAssets + grownRealEstate + grownVehicles - remainingDebt;
                  
                  // Нови инвестиции с растеж
                  const monthlyReturn = 0.08 / 12;
                  const investmentGrowth = currentMonths > 0 && monthlyInvestment > 0
                    ? monthlyInvestment * (((Math.pow(1 + monthlyReturn, currentMonths) - 1) / monthlyReturn) * (1 + monthlyReturn))
                    : 0;
                  
                  const withPlanValue = grownInitialWealth + investmentGrowth;

                  return {
                    year,
                    withoutPlan: withoutPlanValue,
                    withPlan: withPlanValue
                  };
                });
              })()}>
                <defs>
                  <linearGradient id="withoutPlanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                  <pattern id="greenHatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="8" stroke="#22c55e" strokeWidth="1.5" opacity="0.5" />
                  </pattern>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="year" 
                  label={{ value: 'Години', position: 'insideBottom', offset: -5 }}
                  stroke="#64748b"
                />
                <YAxis 
                  stroke="#64748b"
                  tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(2)} мил. EUR` : `${(value / 1000).toFixed(0)}K EUR`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  formatter={(value, name) => [
                    value >= 1000000 ? `${(value / 1000000).toFixed(2)} мил. EUR` : `${(value / 1000).toFixed(0)}K EUR`,
                    name === 'withoutPlan' ? 'Без Финансов План' : 'С Финансов план'
                  ]}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => value === 'withoutPlan' ? 'Без Финансов План' : 'С Финансов план'}
                />
                <Area 
                  type="monotone" 
                  dataKey="withoutPlan" 
                  stroke="#dc2626" 
                  strokeWidth={3}
                  fill="url(#withoutPlanGradient)"
                  name="withoutPlan"
                />
                <Area 
                  type="monotone" 
                  dataKey="withPlan" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  fill="url(#greenHatch)"
                  name="withPlan"
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Difference label */}
            <div className="mt-4 flex items-center justify-center">
              <div className="bg-green-100 border-2 border-green-500 rounded-lg px-6 py-3">
                <p className="text-sm text-green-700 font-medium mb-1 text-center">Разлика:</p>
                <p className="text-3xl font-bold text-green-700 text-center">
                  {(wealth.withPlan - wealth.withoutPlan).toLocaleString('bg-BG', { maximumFractionDigits: 0 })} EUR
                </p>
              </div>
            </div>
            
            <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-8 h-8 text-amber-600" />
                <p className="text-3xl font-bold text-amber-900 text-center">
                  +{(() => {
                    const growthPercent = ((wealth.withPlan - wealth.withoutPlan) / wealth.withoutPlan) * 100;
                    return growthPercent.toFixed(0);
                  })()}% ръст с нашия план! 🚀
                </p>
              </div>
              <p className="text-sm text-amber-700 mt-3 text-center">
                *Проекция при {yearsToRetirement} години инвестиции до {retirementAge} г. възраст
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
                  <Euro className="w-6 h-6" />
                  Данъчно облекчение
                </h4>
                <p className="text-green-100 text-sm">Спестени данъци за {yearsToRetirement} години</p>
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold">{totalTaxRelief.toLocaleString()}</p>
                <p className="text-xl text-green-100">EUR</p>
              </div>
            </div>
            </motion.div>

            {/* Priorities Section */}
            {(() => {
              const priorityLabels = {
                priority_income_protection: 'Подсигуряване на доходите',
                priority_property_protection: 'Защита на собствеността',
                priority_reserve: 'Създаване и увеличаване стойността на резерва',
                priority_housing: 'Ново жилище',
                priority_pension: 'По-добра пенсия',
                priority_children: 'Финансово подсигуряване на децата',
                priority_other: 'Други (кола, почивка...)'
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

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Pie Chart - Разпределение от план */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 text-center">
                Разпределение от месечния план
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => {
                      const totalAllocation = allocation.investments.amount + allocation.incomeProtection.amount + 
                                              allocation.propertyProtection.amount + allocation.loans.amount + allocation.reserve.amount;
                      const percentValue = ((value / totalAllocation) * 100).toFixed(1);
                      return `${percentValue}%`;
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    formatter={(value, name) => {
                      const totalAllocation = allocation.investments.amount + allocation.incomeProtection.amount + 
                                              allocation.propertyProtection.amount + allocation.loans.amount + allocation.reserve.amount;
                      const percentValue = ((value / totalAllocation) * 100).toFixed(1);
                      return [`${value.toFixed(0)} EUR (${percentValue}%)`, name];
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={60}
                    formatter={(value, entry) => {
                      const item = allocationData.find(d => d.name === value);
                      return `${item?.icon || ''} ${value}`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Right Pie Chart - Разпределение от доход */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 text-center">
                Разпределение от месечния доход
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={(() => {
                      const monthlyIncomeEUR = ((analysisData?.client_net_income || 0) + (analysisData?.partner_net_income || 0)) / EUR_BGN_RATE;
                      const monthlyExpensesEUR = totalExpenses / EUR_BGN_RATE;

                      // Разпределение от месечния доход - ВИНАГИ показваме всички категории
                      return [
                        { name: 'Резерв', value: allocation.reserve.amount, color: '#06b6d4', icon: '💰' },
                        { name: 'Инвестиции', value: allocation.investments.amount, color: '#3b82f6', icon: '📈' },
                        { name: 'Защита на дохода', value: allocation.incomeProtection.amount, color: '#10b981', icon: '🛡️' },
                        { name: 'Защита на имущество', value: allocation.propertyProtection.amount, color: '#f59e0b', icon: '🏠' },
                        { name: 'Заеми и кредити', value: allocation.loans.amount, color: '#8b5cf6', icon: '💳' },
                        { name: 'Месечни разходи', value: monthlyExpensesEUR, color: '#64748b', icon: '💸' }
                      ];
                    })()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => {
                      const monthlyIncomeEUR = ((analysisData?.client_net_income || 0) + (analysisData?.partner_net_income || 0)) / EUR_BGN_RATE;
                      const percentValue = monthlyIncomeEUR > 0 ? ((value / monthlyIncomeEUR) * 100).toFixed(1) : 0;
                      return `${percentValue}%`;
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { color: '#06b6d4' },
                      { color: '#3b82f6' },
                      { color: '#10b981' },
                      { color: '#f59e0b' },
                      { color: '#8b5cf6' },
                      { color: '#64748b' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    formatter={(value, name) => {
                      const monthlyIncomeEUR = ((analysisData?.client_net_income || 0) + (analysisData?.partner_net_income || 0)) / EUR_BGN_RATE;
                      const percentValue = monthlyIncomeEUR > 0 ? ((value / monthlyIncomeEUR) * 100).toFixed(1) : 0;
                      return [`${value.toFixed(0)} EUR (${percentValue}% от доход)`, name];
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={60}
                    formatter={(value) => {
                      const icons = {
                        'Резерв': '💰',
                        'Инвестиции': '📈',
                        'Защита на дохода': '🛡️',
                        'Защита на имущество': '🏠',
                        'Заеми и кредити': '💳',
                        'Месечни разходи': '💸'
                      };
                      return `${icons[value] || ''} ${value}`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 mt-6">

            {/* Детайлна разбивка */}
            <div className="mt-6 pt-4 border-t-2 border-slate-300">
              <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">Детайлна разбивка на месечните спестявания</h4>
              <div className="space-y-3">
                {[
                  { name: 'Инвестиции', ...allocation.investments, color: '#3b82f6', icon: '📈' },
                  { name: 'Защита на дохода', ...allocation.incomeProtection, color: '#10b981', icon: '🛡️' },
                  { name: 'Защита на имущество', ...allocation.propertyProtection, color: '#f59e0b', icon: '🏠' },
                  { name: 'Кредити', ...allocation.loans, color: '#8b5cf6', icon: '💳' },
                  { name: 'Резерв', ...allocation.reserve, color: '#06b6d4', icon: '💰' }
                ].filter(item => item.amount > 0).sort((a, b) => b.amount - a.amount).map((item, idx) => {
                  const monthlyIncomeEUR = ((analysisData?.client_net_income || 0) + (analysisData?.partner_net_income || 0)) / EUR_BGN_RATE;
                  const percentOfIncome = monthlyIncomeEUR > 0 ? ((item.amount / monthlyIncomeEUR) * 100).toFixed(1) : 0;
                  const totalAllocation = allocation.investments.amount + allocation.incomeProtection.amount + 
                    allocation.propertyProtection.amount + allocation.loans.amount + allocation.reserve.amount;
                  
                  return (
                    <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border-l-4" style={{ borderColor: item.color }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{item.icon}</span>
                          <div>
                            <p className="font-bold text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-600">
                              {item.percent.toFixed(1)}% от спестявания • {percentOfIncome}% от доход
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold" style={{ color: item.color }}>
                            {item.amount.toFixed(0)} EUR
                          </p>
                          <p className="text-xs text-slate-500">месечно</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Total */}
              <div className="mt-4 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg p-4 border-2 border-slate-300">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900 text-lg">ОБЩО МЕСЕЧНО:</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {(allocation.investments.amount + allocation.incomeProtection.amount + 
                      allocation.propertyProtection.amount + allocation.loans.amount + allocation.reserve.amount).toFixed(0)} EUR
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Обобщение в карти */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { name: 'Инвестиции', ...allocation.investments, color: '#3b82f6', icon: '📈' },
              { name: 'Защита на дохода', ...allocation.incomeProtection, color: '#10b981', icon: '🛡️' },
              { name: 'Защита на имущество', ...allocation.propertyProtection, color: '#f59e0b', icon: '🏠' },
              { name: 'Кредити', ...allocation.loans, color: '#8b5cf6', icon: '💳' },
              { name: 'Резерв', ...allocation.reserve, color: '#06b6d4', icon: '💰' }
            ].filter(item => item.amount > 0).sort((a, b) => b.amount - a.amount).map((item, idx) => {
              const monthlyIncomeEUR = ((analysisData?.client_net_income || 0) + (analysisData?.partner_net_income || 0)) / EUR_BGN_RATE;
              const percentOfIncome = monthlyIncomeEUR > 0 ? ((item.amount / monthlyIncomeEUR) * 100).toFixed(1) : 0;
              
              return (
                <Card key={idx} className="border-2 hover:shadow-lg transition-shadow" style={{ borderColor: item.color }}>
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">{item.name}</p>
                    <p className="text-lg font-bold" style={{ color: item.color }}>
                      {item.amount.toFixed(0)} EUR
                    </p>
                    <p className="text-xs text-slate-600 font-medium">
                      {item.percent.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-slate-500">
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
      title: 'Покрития и инвестиции',
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">Застрахователни покрития и развитие на инвестициите</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left column - Labor Capital & Coverages */}
            <div className="space-y-4">
              {/* Labor Capital */}
              <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
                <CardContent className="p-4">
                  <h3 className="text-xl font-bold text-red-900 mb-2">Трудов капитал</h3>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-red-700">
                      {(() => {
                        const monthlyNetIncome = clientData.monthlyNetIncome || 0;
                        const yearsToRet = yearsToRetirement || 30;
                        const laborCapital = monthlyNetIncome * 12 * yearsToRet * Math.pow(1.03, yearsToRet / 2);
                        return `${(laborCapital / EUR_BGN_RATE).toLocaleString('bg-BG', { maximumFractionDigits: 0 })} EUR`;
                      })()}
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    При прогнозен ръст на възнагражденията от 3% годишно
                  </p>
                </CardContent>
              </Card>

              {/* Insurance Coverages */}
              <Card className="border-green-200">
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold text-green-900 mb-3">Защита на дохода</h3>
                  <div className="space-y-2 text-sm">
                    {(() => {
                      const coverages = {};
                      
                      console.log('\n=== Collecting coverages from products ===');
                      products.forEach((product, idx) => {
                        console.log(`\nProduct ${idx + 1}: ${product.name}`);
                        console.log('  Coverages:', product.coverages);
                        
                        if (product.coverages) {
                          Object.entries(product.coverages).forEach(([key, value]) => {
                            console.log(`    ${key}: ${value}`);
                            if (value && value !== 'Включено') {
                              coverages[key] = (coverages[key] || 0) + parseFloat(value);
                            } else if (value === 'Включено') {
                              coverages[key] = 'Включено';
                            }
                          });
                        }
                        
                        // Добавяме Уника здраве и ценност
                        if (product.name && product.name.includes('Здраве и ценност') && product.provider === 'УНИКА') {
                          coverages['uniqa_critical_illness'] = product.coverage || 2242300;
                        }
                        
                        // Добавяме Generali Health Line
                        if (product.name && product.name.includes('Health Line') && product.provider === 'Generali') {
                          coverages['generali_health'] = product.coverage || (10200 / EUR_BGN_RATE); // 10200 BGN = ~5215 EUR
                        }
                      });

                      console.log('\n=== Final coverages totals ===');
                      console.log(coverages);

                      const coverageLabels = {
                        'death': 'Смърт',
                        'accident_death': 'Смърт вследствие на злополука',
                        'disability': 'Тежки заболявания',
                        'permanent_disability': 'Трайна загуба на работоспособност от злополука',
                        'fractures': 'Фрактури и изгаряния',
                        'critical_illness': 'Тежки заболявания',
                        'telemedicine': 'Телемедицина',
                        'health_insurance': 'Допълнително здравно осигуряване',
                        'premium_waiver': 'Споразумение за защита на детето',
                        'uniqa_critical_illness': 'Лечение на критични заболявания',
                        'generali_health': 'Допълнително здравно'
                      };

                      return Object.entries(coverages)
                        .filter(([key]) => !key.match(/^\d+$/))
                        .map(([key, value], idx) => (
                        <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                          <span className="text-slate-700">{coverageLabels[key] || key}</span>
                          <span className="font-bold text-green-700">
                            {value === 'Включено' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              `${(typeof value === 'number' ? value : 0).toLocaleString('bg-BG', { maximumFractionDigits: 0 })} EUR`
                            )}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column - Allocation Distribution */}
            <div className="space-y-4">
              <Card className="border-blue-200">
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold text-blue-900 mb-3">Разпределение на средствата</h3>
                  <div className="space-y-2 text-sm">
                    {/* Reserve */}
                    {(() => {
                      // Изчисляване на резерв според новата логика
                      let monthlyExpensesEUR = totalExpenses / EUR_BGN_RATE;

                      // Проверка за НОВИ кредити - добавяме месечната вноска към разходите
                      const newLoanProducts = productsEUR.filter(p => 
                        (p.type === 'mortgage_loan' || p.type === 'consumer_loan') &&
                        analysisData?.planning_housing_change === true &&
                        analysisData?.loan_amount > 0
                      );

                      const monthlyNewLoanPayment = newLoanProducts.reduce((sum, p) => sum + (p.monthlyPremium || 0), 0);

                      if (monthlyNewLoanPayment > 0) {
                        monthlyExpensesEUR += monthlyNewLoanPayment;
                      }

                      // Проверка за РЕФИНАНСИРАНИ кредити - коригираме разходите със спестената сума
                      const refinancedProducts = productsEUR.filter(p => 
                        (p.type === 'mortgage_loan' || p.type === 'consumer_loan') &&
                        (!analysisData?.planning_housing_change || !analysisData?.loan_amount)
                      );

                      if (refinancedProducts.length > 0) {
                        // Изчисляваме разликата между старата и новата вноска
                        const oldMortgagePayment = (analysisData?.current_mortgage_monthly_payment || 0) / EUR_BGN_RATE;
                        const newRefinancedPayment = refinancedProducts.reduce((sum, p) => sum + (p.monthlyPremium || 0), 0);
                        const savingsFromRefinancing = oldMortgagePayment - newRefinancedPayment;

                        // Намаляваме разходите със спестената сума
                        if (savingsFromRefinancing > 0) {
                          monthlyExpensesEUR -= savingsFromRefinancing;
                        }
                      }

                      const targetReserve = monthlyExpensesEUR * 6; // 6 месеца коригирани разходи

                      // Начален резерв = Разплащателна сметка + Краткосрочни спестявания
                      const initialReserve = (
                        (analysisData?.client_checking_account || 0) +
                        (analysisData?.partner_checking_account || 0) +
                        (analysisData?.client_savings_account || 0) +
                        (analysisData?.partner_savings_account || 0)
                      ) / EUR_BGN_RATE;

                      // Месечни застраховки и инвестиции
                      const monthlyInsuranceInvestment = productsEUR
                        .filter(p => p.type !== 'mortgage_loan' && p.type !== 'consumer_loan')
                        .reduce((sum, p) => sum + (p.monthlyPremium || 0), 0);

                      // Периодичност на плащане - изчисляване на първоначално плащане
                      const paymentFrequency = planData.payment_frequency || 'annual';
                      const frequencyMultipliers = {
                        'monthly': 1,
                        'quarterly': 3,
                        'semiannual': 6,
                        'annual': 12
                      };
                      const multiplier = frequencyMultipliers[paymentFrequency] || 12;

                      // Първоначално плащане
                      const initialPayment = (monthlyInsuranceInvestment * multiplier) + (monthlyNewLoanPayment * multiplier);

                      // Резерв след първо плащане
                      const reserveAfterInitialPayment = Math.max(0, initialReserve - initialPayment);

                      // Месечно натрупване
                      const monthlyAccumulation = monthlyBalanceEUR - monthlyInsuranceInvestment - monthlyNewLoanPayment;

                      // Месеци до целеви резерв
                      const monthsToTarget = monthlyAccumulation > 0 
                        ? Math.ceil(Math.max(0, targetReserve - reserveAfterInitialPayment) / monthlyAccumulation)
                        : 0;

                      // Общ натрупан резерв
                      const totalReserveAccumulated = reserveAfterInitialPayment + (monthlyAccumulation * monthsToTarget);

                      if (monthsToTarget > 0) {
                        return (
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-700 font-medium">Резерв</span>
                            <div className="text-right">
                              <p className="font-bold text-cyan-700">{Math.min(totalReserveAccumulated, targetReserve).toFixed(0)} EUR</p>
                              <p className="text-xs text-slate-500">след {monthsToTarget} месеца</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Investments breakdown */}
                    {(() => {
                      const investmentProducts = products.filter(p => 
                        p.name.includes('Unit Linked') || p.name.includes('УПФ')
                      );
                      
                      if (investmentProducts.length === 0) return null;

                      const totalMonthlyInvestment = investmentProducts.reduce((sum, p) => sum + (p.monthlyPremium || 0), 0);
                      const periods = [];
                      
                      // Determine periods
                      if (yearsToRetirement > 20) {
                        periods.push({ years: 10, label: '10 години' });
                        periods.push({ years: 20, label: '20 години' });
                        periods.push({ years: yearsToRetirement, label: 'До пенсия' });
                      } else if (yearsToRetirement > 10) {
                        periods.push({ years: 10, label: '10 години' });
                        const midYears = Math.round((10 + yearsToRetirement) / 2);
                        periods.push({ years: midYears, label: `${midYears} години` });
                        periods.push({ years: yearsToRetirement, label: 'До пенсия' });
                      } else {
                        periods.push({ years: Math.min(10, yearsToRetirement), label: yearsToRetirement < 10 ? `${yearsToRetirement} години` : '10 години' });
                      }

                      return periods.map((period, idx) => {
                        const months = period.years * 12;
                        const returnRate = 0.08 / 12;
                        const futureValue = totalMonthlyInvestment * (((Math.pow(1 + returnRate, months) - 1) / returnRate) * (1 + returnRate));
                        
                        return (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-700">Инвестиции</span>
                            <div className="text-right">
                              <p className="font-bold text-blue-700">{futureValue.toFixed(0)} EUR</p>
                              <p className="text-xs text-slate-500">{period.label}</p>
                            </div>
                          </div>
                        );
                      });
                    })()}

                    {/* Other goals */}
                    {(() => {
                      const otherGoals = (analysisData?.other_goals_car || 0) + 
                                        (analysisData?.other_goals_vacation || 0) + 
                                        (analysisData?.other_goals_other || 0);
                      
                      if (otherGoals > 0 && analysisData?.include_other_goals_in_plan) {
                        return (
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-700">Други цели</span>
                            <div className="text-right">
                              <p className="font-bold text-purple-700">{(otherGoals / EUR_BGN_RATE).toFixed(0)} EUR</p>
                            </div>
                          </div>
                        );
                      }
                    })()}

                    {/* Down payment */}
                    {(() => {
                      if (analysisData?.planning_housing_change && 
                          analysisData?.financing_method === 'cash_and_loan' && 
                          analysisData?.available_cash) {
                        return (
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-700">Самоучастие</span>
                            <div className="text-right">
                              <p className="font-bold text-orange-700">{(analysisData.available_cash / EUR_BGN_RATE).toFixed(0)} EUR</p>
                            </div>
                          </div>
                        );
                      }
                    })()}

                    {/* Children education */}
                    {(() => {
                      const childrenCount = analysisData?.children_count || 0;
                      const childrenProducts = products.filter(p => p.name.includes('Junior'));
                      
                      if (childrenCount > 0 && childrenProducts.length > 0) {
                        return Array.from({ length: childrenCount }, (_, i) => {
                          const childProduct = childrenProducts.find(p => p.name.includes(`Дете ${i + 1}`));
                          if (!childProduct) return null;

                          const childBirthdate = analysisData?.[`child_${i + 1}_birthdate`];
                          if (!childBirthdate) return null;

                          const childAge = new Date().getFullYear() - new Date(childBirthdate).getFullYear();
                          const yearsTo19 = Math.max(19 - childAge, 0);
                          const months = yearsTo19 * 12;
                          const returnRate = 0.08 / 12;
                          const monthlyPremium = childProduct.monthlyPremium || 0;
                          const futureValue = monthlyPremium * (((Math.pow(1 + returnRate, months) - 1) / returnRate) * (1 + returnRate));

                          return (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100">
                              <span className="text-slate-700">Образование на Дете {i + 1}</span>
                              <div className="text-right">
                                <p className="font-bold text-indigo-700">{futureValue.toFixed(0)} EUR</p>
                                <p className="text-xs text-slate-500">до 19 години</p>
                              </div>
                            </div>
                          );
                        });
                      }
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom chart - Invested vs Accumulated */}
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">
                Времева алокация на средствата
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={(() => {
                  const investmentProducts = products.filter(p => 
                    p.name.includes('Unit Linked') || p.name.includes('УПФ')
                  );
                  
                  if (investmentProducts.length === 0) return [];

                  const totalMonthlyInvestment = investmentProducts.reduce((sum, p) => sum + (p.monthlyPremium || 0), 0);
                  const categories = [];

                  // Reserve
                  if (wealth.monthlyReserveEUR > 0) {
                    categories.push({
                      name: 'Резерв',
                      invested: wealth.monthlyReserveEUR,
                      accumulated: wealth.monthlyReserveEUR,
                      years: 1
                    });
                  }

                  // Other goals
                  const otherGoals = (analysisData?.other_goals_car || 0) + 
                                    (analysisData?.other_goals_vacation || 0) + 
                                    (analysisData?.other_goals_other || 0);
                  if (otherGoals > 0 && analysisData?.include_other_goals_in_plan) {
                    categories.push({
                      name: 'Други цели',
                      invested: (otherGoals / EUR_BGN_RATE) / 12,
                      accumulated: otherGoals / EUR_BGN_RATE,
                      years: 1
                    });
                  }

                  // Down payment
                  if (analysisData?.planning_housing_change && 
                      analysisData?.financing_method === 'cash_and_loan' && 
                      analysisData?.available_cash) {
                    const yearsToProperty = analysisData?.planned_housing_timeline_years || 3;
                    const downPayment = analysisData.available_cash / EUR_BGN_RATE;
                    categories.push({
                      name: 'Самоучастие',
                      invested: downPayment / (yearsToProperty * 12),
                      accumulated: downPayment,
                      years: yearsToProperty
                    });
                  }

                  // Investments
                  const periods = [];
                  if (yearsToRetirement > 20) {
                    periods.push({ years: 10, label: 'Инвестиции' });
                    periods.push({ years: 20, label: 'Инвестиции' });
                    periods.push({ years: yearsToRetirement, label: 'Инвестиции' });
                  } else if (yearsToRetirement > 10) {
                    periods.push({ years: 10, label: 'Инвестиции' });
                    const midYears = Math.round((10 + yearsToRetirement) / 2);
                    periods.push({ years: midYears, label: 'Инвестиции' });
                    periods.push({ years: yearsToRetirement, label: 'Инвестиции' });
                  } else {
                    periods.push({ years: Math.min(10, yearsToRetirement), label: 'Инвестиции' });
                  }

                  periods.forEach((period, idx) => {
                    const months = period.years * 12;
                    const returnRate = 0.08 / 12;
                    const futureValue = totalMonthlyInvestment * (((Math.pow(1 + returnRate, months) - 1) / returnRate) * (1 + returnRate));
                    
                    categories.push({
                      name: `${period.label}`,
                      invested: totalMonthlyInvestment * months,
                      accumulated: futureValue,
                      years: period.years
                    });
                  });

                  // Children education
                  const childrenCount = analysisData?.children_count || 0;
                  const childrenProducts = products.filter(p => p.name.includes('Junior'));
                  
                  if (childrenCount > 0 && childrenProducts.length > 0) {
                    Array.from({ length: childrenCount }, (_, i) => {
                      const childProduct = childrenProducts.find(p => p.name.includes(`Дете ${i + 1}`));
                      if (!childProduct) return;

                      const childBirthdate = analysisData?.[`child_${i + 1}_birthdate`];
                      if (!childBirthdate) return;

                      const childAge = new Date().getFullYear() - new Date(childBirthdate).getFullYear();
                      const yearsTo19 = Math.max(19 - childAge, 0);
                      const months = yearsTo19 * 12;
                      const returnRate = 0.08 / 12;
                      const monthlyPremium = childProduct.monthlyPremium || 0;
                      const futureValue = monthlyPremium * (((Math.pow(1 + returnRate, months) - 1) / returnRate) * (1 + returnRate));

                      categories.push({
                        name: `Образование Дете ${i + 1}`,
                        invested: monthlyPremium * months,
                        accumulated: futureValue,
                        years: yearsTo19
                      });
                    });
                  }

                  return categories;
                })()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    formatter={(value) => `${value.toFixed(0)} EUR`}
                  />
                  <Legend />
                  <Bar dataKey="invested" fill="#94a3b8" name="Инвестирани" />
                  <Bar dataKey="accumulated" fill="#dc2626" name="Натрупани" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: 'Структура на портфейла',
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-6">Структура на портфейла</h2>
          
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={500}>
                <Sankey
                  data={(() => {
                    const monthlyBalance = planData.calculations?.monthlyBalance || 0;
                    const monthlyBalanceEUR = monthlyBalance / EUR_BGN_RATE;
                    
                    // Calculate optimization savings (from pension fund change, refinancing, etc)
                    let optimizationSavings = 0;
                    
                    // Example: УПФ optimization could save around 20-30 EUR/month
                    if (analysisData?.partner_pillar_2 || analysisData?.client_pillar_2) {
                      optimizationSavings += 25; // Average savings from fund optimization
                    }
                    
                    const totalForPlan = monthlyBalanceEUR + optimizationSavings;
                    
                    // Calculate categories from allocation
                    const investmentsAmount = allocation.investments.amount;
                    const reserveAmount = allocation.reserve.amount;
                    const protectionAmount = allocation.incomeProtection.amount + allocation.propertyProtection.amount;
                    const loansAmount = allocation.loans.amount;
                    
                    const nodes = [
                      { name: 'Месечен баланс' },
                      { name: 'След оптимизация' },
                      { name: 'Общо за план' },
                      { name: 'Инвестиции' },
                      { name: 'Резерв' },
                      { name: 'Защита' },
                      { name: 'Заеми и кредити' }
                    ];
                    
                    const links = [
                      { source: 0, target: 2, value: monthlyBalanceEUR },
                      { source: 1, target: 2, value: optimizationSavings },
                      { source: 2, target: 3, value: investmentsAmount },
                      { source: 2, target: 4, value: reserveAmount },
                      { source: 2, target: 5, value: protectionAmount },
                      { source: 2, target: 6, value: loansAmount }
                    ].filter(link => link.value > 0);
                    
                    return { nodes, links };
                  })()}
                  node={<Rectangle fill="#3b82f6" fillOpacity="0.8" />}
                  link={{ stroke: '#94a3b8', strokeOpacity: 0.5 }}
                  nodePadding={50}
                  margin={{ top: 20, right: 150, bottom: 20, left: 150 }}
                >
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    formatter={(value) => `${value.toFixed(0)} EUR`}
                  />
                </Sankey>
              </ResponsiveContainer>
              
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-blue-700 font-medium mb-1">Инвестиции</p>
                    <p className="text-2xl font-bold text-blue-900">{allocation.investments.amount.toFixed(0)} EUR</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-cyan-700 font-medium mb-1">Резерв</p>
                    <p className="text-2xl font-bold text-cyan-900">{allocation.reserve.amount.toFixed(0)} EUR</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-green-700 font-medium mb-1">Защита</p>
                    <p className="text-2xl font-bold text-green-900">
                      {(allocation.incomeProtection.amount + allocation.propertyProtection.amount).toFixed(0)} EUR
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-purple-700 font-medium mb-1">Заеми и кредити</p>
                    <p className="text-2xl font-bold text-purple-900">{allocation.loans.amount.toFixed(0)} EUR</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: 'Продукти',
      content: (
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">Вашите продукти</h2>
          
          <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2">
            {products.map((product, idx) => {
              const isEditing = editingProductIndex === idx;
              const currentProduct = modifiedProducts[idx] || product;
              
              return (
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
                            {currentProduct.coverage && (
                              <p className="text-xs text-slate-500">
                                Покритие: <span className="font-semibold">{currentProduct.coverage.toLocaleString()} EUR</span>
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            {currentProduct.monthlyPremium === 0 ? 'БЕЗПЛАТНО' : `${currentProduct.monthlyPremium.toFixed(0)} EUR`}
                          </p>
                          <p className="text-xs text-slate-500">месечно</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => toast.success('Функционалността за активиране ще бъде добавена скоро')}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Активирай
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            if (isEditing) {
                              setEditingProductIndex(null);
                            } else {
                              setEditingProductIndex(idx);
                              if (!modifiedProducts[idx]) {
                                const newModified = [...modifiedProducts];
                                newModified[idx] = { ...product };
                                setModifiedProducts(newModified);
                              }
                            }
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          {isEditing ? 'Затвори' : 'Промени'}
                        </Button>
                      </div>

                      {/* Edit Panel */}
                      <AnimatePresence>
                        {isEditing && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                              {/* Monthly Premium */}
                              {currentProduct.monthlyPremium > 0 && (
                                <div>
                                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                                    Месечна премия: {currentProduct.monthlyPremium.toFixed(0)} EUR
                                  </label>
                                  <Slider
                                    value={[currentProduct.monthlyPremium]}
                                    onValueChange={([value]) => {
                                      const newModified = [...modifiedProducts];
                                      newModified[idx] = { ...currentProduct, monthlyPremium: value };
                                      setModifiedProducts(newModified);
                                    }}
                                    min={Math.max(10, product.monthlyPremium * 0.5)}
                                    max={product.monthlyPremium * 2}
                                    step={5}
                                    className="w-full"
                                  />
                                </div>
                              )}

                              {/* Coverage */}
                              {currentProduct.coverage && currentProduct.coverage > 0 && (
                                <div>
                                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                                    Покритие: {currentProduct.coverage.toLocaleString()} EUR
                                  </label>
                                  <Slider
                                    value={[currentProduct.coverage]}
                                    onValueChange={([value]) => {
                                      const newModified = [...modifiedProducts];
                                      newModified[idx] = { ...currentProduct, coverage: value };
                                      setModifiedProducts(newModified);
                                    }}
                                    min={Math.max(1000, product.coverage * 0.5)}
                                    max={product.coverage * 2}
                                    step={1000}
                                    className="w-full"
                                  />
                                </div>
                              )}

                              {/* Term Years (if applicable) */}
                              {product.termYears && (
                                <div>
                                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                                    Период: {currentProduct.termYears || product.termYears} години
                                  </label>
                                  <Slider
                                    value={[currentProduct.termYears || product.termYears]}
                                    onValueChange={([value]) => {
                                      const newModified = [...modifiedProducts];
                                      newModified[idx] = { ...currentProduct, termYears: value };
                                      setModifiedProducts(newModified);
                                    }}
                                    min={5}
                                    max={40}
                                    step={1}
                                    className="w-full"
                                  />
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
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