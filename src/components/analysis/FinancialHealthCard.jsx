import React, { useState, useEffect } from 'react';
import { 
  Home, 
  PiggyBank, 
  Umbrella, 
  Baby, 
  Shield, 
  Wallet, 
  TrendingUp,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Minus,
  Clock,
  HelpCircle,
  Loader2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function FinancialHealthCard({ data, prioritiesWarning, prioritiesSection }) {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Calculate helper values
  const clientNetIncome = data.client_net_income || data.client_monthly_net_income || 0;
  const partnerNetIncome = data.include_partner ? (data.partner_net_income || data.partner_monthly_net_income || 0) : 0;
  const totalMonthlyIncome = clientNetIncome + partnerNetIncome;
  const sixMonthIncome = totalMonthlyIncome * 6;
  
  const checkingAccount = (data.asset_checking_account || 0);
  const shortTermSavings = (data.asset_short_term_savings || 0);
  const liquidSavings = checkingAccount + shortTermSavings;
  
  const planningHousingChange = data.planning_housing_change !== false;
  
  // Total assets calculation
  const totalAssets = (data.asset_checking_account || 0) + (data.asset_short_term_savings || 0) + 
    (data.asset_medium_term_savings || 0) + (data.asset_long_term_savings || 0) + 
    (data.asset_real_estate || 0) + (data.asset_movable_property || 0);
  const realEstateValue = data.asset_real_estate || 0;
  const realEstatePercent = totalAssets > 0 ? Math.round((realEstateValue / totalAssets) * 100) : 0;
  
  // Monthly debt payments
  const monthlyDebtPayments = (data.liability_mortgage_monthly || 0) + (data.liability_consumer_loans_monthly || 0) +
    (data.liability_credit_cards_monthly || 0) + (data.liability_leasing_monthly || 0) + 
    (data.liability_overdraft_monthly || 0);
  const totalDebtRemaining = (data.liability_mortgage_remaining || 0) + (data.liability_consumer_loans_remaining || 0) +
    (data.liability_credit_cards_remaining || 0) + (data.liability_leasing_remaining || 0) + 
    (data.liability_overdraft_remaining || 0);
  const debtToIncomeRatio = totalMonthlyIncome > 0 ? (monthlyDebtPayments / totalMonthlyIncome) * 100 : 0;
  
  // Savings rate calculation
  const totalMonthlyExpenses = (data.expense_rent || 0) + (data.expense_utilities || 0) + (data.expense_phone || 0) +
    (data.expense_internet || 0) + (data.expense_tv || 0) + (data.expense_other_housing || 0) +
    (data.expense_fuel || 0) + (data.expense_car_maintenance || 0) + (data.expense_car_other || 0) +
    (data.expense_food || 0) + (data.expense_clothing || 0) + (data.expense_culture || 0) +
    (data.expense_travel || 0) + (data.expense_children || 0) + (data.expense_cigarettes || 0) +
    (data.expense_pets || 0) + (data.expense_vacation || 0) + (data.expense_business || 0) +
    (data.expense_other || 0) + (data.expense_education || 0) + (data.expense_health || 0) +
    (data.expense_cosmetics || 0) + (data.expense_hobbies || 0) + (data.expense_electronics || 0) +
    (data.expense_taxes || 0) + monthlyDebtPayments;
  const monthlySavings = totalMonthlyIncome - totalMonthlyExpenses;
  const savingsRate = totalMonthlyIncome > 0 ? (monthlySavings / totalMonthlyIncome) * 100 : 0;
  
  // Pension gap
  const clientDesiredPension = data.client_desired_pension || 0;
  const clientExpectedPension = data.client_expected_state_pension || 0;
  const pensionGap = Math.max(0, clientDesiredPension - clientExpectedPension);
  
  // Children costs
  const totalChildrenCosts = (data.children_birth_costs || 0) + (data.children_education_costs || 0) + 
    (data.children_start_life_costs || 0) + (data.children_sport_costs || 0) + (data.children_wedding_costs || 0) +
    (data.children_other_costs || 0);
  const childrenCurrentSavings = data.children_current_savings || 0;
  const childrenGap = totalChildrenCosts - childrenCurrentSavings;

  // =============== STATUS CALCULATIONS ===============
  
  // 1. RESERVE STATUS
  const getReserveStatus = () => {
    if (sixMonthIncome === 0) return { status: 'inactive', icon: '-', message: 'Няма достатъчно данни за изчисление.' };
    
    const ratio = liquidSavings / sixMonthIncome;
    const difference = liquidSavings - sixMonthIncome;
    const inflationLoss = Math.abs(difference) * 0.05;
    
    if (planningHousingChange) {
      // Planning housing change scenarios
      if (ratio > 1.2) {
        return { 
          status: 'yellow', 
          icon: '!',
          message: `Сумата на спестяванията надвишава необходимия резерв. Тази година ще загубите ${Math.round(inflationLoss).toLocaleString()}€. Предвид това, че средствата ще послужат за закупуване на жилище/ремонт е разумно да предприемете инвестиции в нискорискови, ликвидни инструменти, за да се предпазите от инфлацията до закупуване на имота/ремонта!`
        };
      } else if (ratio < 0.8) {
        return { 
          status: 'red', 
          icon: '!',
          message: `Сумата на спестяванията не отговаря на необходимия резерв. Предвид това, че средствата ще послужат за закупуване на жилище/ремонт е разумно да предприемете действия по по-агресивно спестяване и инвестиции в нискорискови, ликвидни инструменти, за да натрупате достатъчно средства до закупуване на имота/ремонта!`
        };
      } else {
        return { 
          status: 'yellow', 
          icon: '!',
          message: `Сумата на спестяванията ви е адекватна! Но предвид това, че средствата ще послужат за закупуване на жилище/ремонт е разумно да предприемете действия по по-агресивно спестяване и инвестиции в нискорискови, ликвидни инструменти, за да натрупате достатъчно средства до закупуване на имота/ремонта!`
        };
      }
    } else {
      // Not planning housing change scenarios
      if (ratio > 1.2) {
        return { 
          status: 'yellow', 
          icon: '!',
          message: `Сумата на спестяванията надвишава необходимия резерв. Тази година ще загубите ${Math.round(inflationLoss).toLocaleString()}€. Необходимо е да предприемете инвестиции, за да се предпазите от инфлацията!`
        };
      } else if (ratio < 0.8) {
        return { 
          status: 'red', 
          icon: '!',
          message: `Сумата на спестяванията не отговаря на необходимия резерв. Необходимо е да предприемете действия за увеличаване на своя резерв!`
        };
      } else {
        return { 
          status: 'green', 
          icon: 'OK!',
          message: `Сумата на спестяванията ви е адекватна! При продължително допълнително спестяване ще е необходимо е да предприемете инвестиции, за да се предпазите от инфлацията!`
        };
      }
    }
  };

  // 2. INCOME PROTECTION STATUS
  const getIncomeProtectionStatus = () => {
    const hasDisabilityRisk = data.client_risk_disability || (data.include_partner && data.partner_risk_disability);
    const hasDeathRisk = data.client_risk_death || (data.include_partner && data.partner_risk_death);
    const hasCriticalRisk = hasDisabilityRisk || hasDeathRisk;
    
    const clientProtected = data.client_has_income_protection;
    const partnerProtected = data.include_partner ? data.partner_has_income_protection : true;
    const isProtected = clientProtected && partnerProtected;
    
    if (!hasCriticalRisk) {
      return { 
        status: 'green', 
        icon: 'OK!',
        message: `Спрямо посоченото в анализа нямате рискове, които да имат нужда от подсигуряване!`
      };
    }
    
    if (hasCriticalRisk && !isProtected) {
      return { 
        status: 'red', 
        icon: '!',
        message: `Вашите доходи и финансовата стабилност на Вашето домакинство не са подсигурени за непредвидени негативни обстоятелства като Заболявания, Инвалидност или Смърт.`
      };
    }
    
    if (hasCriticalRisk && isProtected) {
      return { 
        status: 'yellow', 
        icon: '?',
        message: `Вашите доходи и финансовата стабилност на Вашето домакинство са подсигурени със съществуваща застраховка, но над 42% от направените застраховки живот не са адекватни*! Съветваме Ви Вашата застраховка да бъде разгледана!\n*Source: https://www.bankrate.com/insurance/life-insurance/life-insurance-statistics/`
      };
    }
    
    return { status: 'green', icon: 'OK!', message: '' };
  };

  // 3. PROPERTY PROTECTION STATUS
  const getPropertyProtectionStatus = () => {
    const hasProperty1 = data.has_property_1;
    const hasProperty2 = data.has_property_2;
    const hasProperty3 = data.has_property_3;
    const hasAnyProperty = hasProperty1 || hasProperty2 || hasProperty3;
    
    const hasCar1 = data.has_car_1;
    const hasCar2 = data.has_car_2;
    const hasCar3 = data.has_car_3;
    const hasAnyCar = hasCar1 || hasCar2 || hasCar3;
    
    if (!hasAnyProperty && !hasAnyCar) {
      return { 
        status: 'gray', 
        icon: '-',
        message: `Нямате имущество, което да бъде е под риск. Настоящото не е тема на финансово планиране.`
      };
    }
    
    // Check property insurance
    const allPropertiesInsured = (!hasProperty1 || data.property_1_has_insurance) && 
                                  (!hasProperty2 || data.property_2_has_insurance) && 
                                  (!hasProperty3 || data.property_3_has_insurance);
    const anyPropertyNotInsured = (hasProperty1 && !data.property_1_has_insurance) || 
                                   (hasProperty2 && !data.property_2_has_insurance) || 
                                   (hasProperty3 && !data.property_3_has_insurance);
    
    // Check car casco
    const allCarsInsured = (!hasCar1 || data.car_1_has_casco) && 
                           (!hasCar2 || data.car_2_has_casco) && 
                           (!hasCar3 || data.car_3_has_casco);
    const anyCarNotInsured = (hasCar1 && !data.car_1_has_casco) || 
                              (hasCar2 && !data.car_2_has_casco) || 
                              (hasCar3 && !data.car_3_has_casco);
    
    // Priority: Property over Car
    if (hasAnyProperty && anyPropertyNotInsured) {
      return { 
        status: 'red', 
        icon: '!',
        message: `Вашето недвижимо имущество не е защитено. То представлява ${realEstatePercent}% от всички Ваши активи! Съветваме Ви да обмислите неговото подсигуряване!`
      };
    }
    
    if (hasAnyProperty && allPropertiesInsured) {
      return { 
        status: 'yellow', 
        icon: '?',
        message: `Вашето недвижимо имущество е защитено, но много често защитата не е адекватно изготвена. Вашето жилище представлява ${realEstatePercent}% от всички Ваши активи! Предлагаме Ви да разгледаме адекватността на Вашата полица!`
      };
    }
    
    if (hasAnyCar && anyCarNotInsured) {
      return { 
        status: 'yellow', 
        icon: '!',
        message: `Вашият автомобил не е защитен. Съветваме Ви да обмислите неговото подсигуряване!`
      };
    }
    
    if (hasAnyCar && allCarsInsured) {
      return { 
        status: 'yellow', 
        icon: '?',
        message: `Вашият автомобил е защитен, но много често защитата не е адекватна или е много скъпа! Можем да Ви помогнем с оптимизация на Вашето Каско!`
      };
    }
    
    return { status: 'green', icon: 'OK!', message: '' };
  };

  // 4. HOUSING FINANCING STATUS
  const getHousingStatus = () => {
    if (data.planning_housing_change === false) {
      return { 
        status: 'gray', 
        icon: '-',
        message: `Тъй като не планирате промяна в жилищен аспект, настоящото не е тема на финансово планиране.`
      };
    }
    
    const financingMethod = data.financing_method;
    const timelineYears = data.planned_housing_timeline_years || 10;
    
    if (financingMethod === 'cash') {
      return { 
        status: 'yellow', 
        icon: '!',
        message: `Предстои Ви закупуване и финансиране на жилище в собствени средства! Това не винаги е най-правилното решение във финансов аспект! Съветваме Ви да потърсите съвет, за възможно най-доброто планиране на Вашата покупка.`
      };
    }
    
    if (financingMethod === 'cash_and_loan') {
      if (timelineYears <= 2) {
        return { 
          status: 'red', 
          icon: '!',
          message: `Предстои Ви закупуване и финансиране на жилище! Съветваме Ви да потърсите съвет, за възможно най-доброто планиране на Вашия кредит!`
        };
      } else if (timelineYears <= 5) {
        return { 
          status: 'yellow', 
          icon: '!',
          message: `Предстои Ви закупуване и финансиране на жилище в средносрочен аспект! Съветваме Ви да потърсите съвет, за възможно най-доброто планиране на Вашия кредит отрано!`
        };
      }
    }
    
    return { status: 'green', icon: 'OK!', message: 'Жилищната Ви ситуация е стабилна.' };
  };

  // 5. PENSION STATUS
  const getPensionStatus = () => {
    if (pensionGap < 100) {
      return { 
        status: 'green', 
        icon: 'OK!',
        message: `Желаната от Вас пенсия ще бъде осигурена от държавата! Съветваме Ви все пак да предприемете действия за дългосрочно инвестиране, за да предпазите своя стандарт на живот!`
      };
    } else if (pensionGap <= 350) {
      return { 
        status: 'yellow', 
        icon: '!',
        message: `Желаната от Вас пенсия е по-висока от това, което държавата ще Ви осигури! Съветваме Ви да предприемете действия по целенасочено дългосрочно инвестиране, за да осигурите липсата и не намалите своя стандарт на живот!`
      };
    } else {
      return { 
        status: 'red', 
        icon: '!',
        message: `Желаната от Вас пенсия е значително по-висока от това, което държавата ще Ви осигури! Съветваме Ви да предприемете действия по целенасочено дългосрочно инвестиране, за да осигурите липсата и не намалите своя стандарт на живот!`
      };
    }
  };

  // 6. CHILDREN STATUS
  const getChildrenStatus = () => {
    if (data.skip_children_section || (data.children_count || 0) === 0) {
      return { 
        status: 'gray', 
        icon: '-',
        message: `В анализа е отбелязано, че финансовото осигуряване на деца не е тема за Вас. В този ред на мисли настоящото не е тема на финансово планиране.`
      };
    }
    
    if (childrenGap < 2000) {
      return { 
        status: 'green', 
        icon: 'OK!',
        message: `Желаната от Вас сума за подсигуряване бъдещето на Вашите деца е подсигурена от Ваша страна! Поздравления!`
      };
    } else if (childrenGap <= 10000) {
      return { 
        status: 'yellow', 
        icon: '!',
        message: `Желаната от Вас сума за подсигуряване бъдещето на Вашите деца е по-висока от това, което имате заделено към момента! Съветваме Ви да предприемете действия, за да осигурите желаното бъдеще за своите деца!`
      };
    } else {
      return { 
        status: 'red', 
        icon: '!',
        message: `Желаната от Вас сума за подсигуряване бъдещето на Вашите деца е значително по-висока от това, което имате заделено към момента! Съветваме Ви да предприемете действия, за да осигурите желаното бъдеще за своите деца!`
      };
    }
  };

  // 7. INVESTMENTS STATUS
  const getInvestmentStatus = () => {
    const savingsRatioToSixMonth = sixMonthIncome > 0 ? (liquidSavings / sixMonthIncome) : 0;
    
    if (savingsRate >= 30) {
      return { 
        status: 'red', 
        icon: '!',
        message: `Изглежда, че спестявате много висока част от Вашите доходи! Съветваме Ви да предприемете действия, за да осигурите доходност на Вашите спеставяния!`
      };
    }
    
    if (savingsRate >= 15) {
      return { 
        status: 'yellow', 
        icon: '!',
        message: `Изглежда, че спестявате разумна част от Вашите доходи! Съветваме Ви да предприемете действия, за да осигурите доходност на Вашите спеставяния!`
      };
    }
    
    if (savingsRate >= 5 && savingsRate < 15) {
      if (savingsRatioToSixMonth < 0.5) {
        return { 
          status: 'green', 
          icon: 'Неприложимо',
          message: `Изглежда, че нямате изграден адекватен резерв и не спестявате достатъчно! Съветваме Ви да предприемете действия по увеличаване на Вашите спестявания и подсигуряване на предходните теми преди да се обърнете към инвестирането!`
        };
      } else if (savingsRatioToSixMonth > 1.2) {
        return { 
          status: 'red', 
          icon: '!',
          message: `Изглежда, че спестявате част от Вашите доходи и имате изграден адекватен резерв! Голяма част от средствата Ви биват "изядени" от инфлацията! Съветваме Ви да предприемете действия, за да осигурите доходност на Вашите спеставяния!`
        };
      } else {
        return { 
          status: 'yellow', 
          icon: '!',
          message: `Изглежда, че спестявате част от Вашите доходи и имате изграден адекватен резерв! Съветваме Ви да предприемете действия, за да осигурите доходност на Вашите спеставяния!`
        };
      }
    }
    
    // savingsRate < 5
    if (savingsRatioToSixMonth < 0.7) {
      return { 
        status: 'green', 
        icon: 'Неприложимо',
        message: `Изглежда, че нямате изграден адекватен резерв и не спестявате достатъчно! Съветваме Ви да предприемете действия по увеличаване на Вашите спестявания и подсигуряване на предходните теми преди да се обърнете към инвестирането!`
      };
    } else if (savingsRatioToSixMonth > 1.3) {
      return { 
        status: 'yellow', 
        icon: '!',
        message: `Изглежда, че не спестявате достатъчно от Вашите доходи, но изграден адекватен резерв! Голяма част от средствата Ви биват "изядени" от инфлацията! Съветваме Ви да предприемете действия, за да осигурите доходност на Вашите спеставяния, но и да се насочите към по-агресивно спеставяне!`
      };
    } else {
      return { 
        status: 'yellow', 
        icon: '!',
        message: `Изглежда, че спестявате малка част от Вашите доходи и имате изграден адекватен резерв! Съветваме Ви да предприемете действия, за да осигурите доходност на Вашите спеставяния, но и да се насочите към по-агресивно спеставяне!`
      };
    }
  };

  // 8. DEBT STATUS
  const getDebtStatus = () => {
    if (totalDebtRemaining === 0) {
      return { 
        status: 'gray', 
        icon: '-',
        message: `Изглежда, че нямате кредити! Ако в бъдеще предприемате действия по теглене на такива Ви съветваме да направим първоначална консултация с цел оптимизация и олекотяване на семейния бюджет!`
      };
    }
    
    if (debtToIncomeRatio > 30) {
      return { 
        status: 'red', 
        icon: '!',
        message: `Изглежда, че кредитната Ви тежест е прекалено висока! Съветваме Ви да разгледаме Вашите кредити с цел оптимизация и олекотяване на семейния бюджет!`
      };
    } else if (debtToIncomeRatio > 15) {
      return { 
        status: 'yellow', 
        icon: '!',
        message: `Изглежда, че кредитната Ви тежест е висока! Съветваме Ви да разгледаме Вашите кредити с цел оптимизация и олекотяване на семейния бюджет!`
      };
    } else if (debtToIncomeRatio > 10) {
      return { 
        status: 'yellow', 
        icon: '!',
        message: `Изглежда, че кредитната Ви тежест не е висока, но търпи оптимизация! Съветваме Ви да разгледаме Вашите кредити с цел оптимизация и олекотяване на семейния бюджет!`
      };
    } else {
      return { 
        status: 'green', 
        icon: '!',
        message: `Изглежда, че кредитната Ви тежест не е висока и нейната оптимизация не е критична! Можем все пак да разгледаме Вашите кредити с цел оптимизация и олекотяване на семейния бюджет!`
      };
    }
  };

  // Get all statuses
  const reserveInfo = getReserveStatus();
  const incomeInfo = getIncomeProtectionStatus();
  const propertyInfo = getPropertyProtectionStatus();
  const housingInfo = getHousingStatus();
  const pensionInfo = getPensionStatus();
  const childrenInfo = getChildrenStatus();
  const investmentInfo = getInvestmentStatus();
  const debtInfo = getDebtStatus();

  // Helper to get background color
  const getBoxBg = (status) => {
    switch(status) {
      case 'green': return 'bg-green-100 border-green-400';
      case 'yellow': return 'bg-amber-100 border-amber-400';
      case 'red': return 'bg-red-100 border-red-400';
      case 'gray': return 'bg-slate-100 border-slate-400';
      default: return 'bg-white border-blue-400';
    }
  };

  // Box component with tooltip
  const StatusBox = ({ label, info, className = '' }) => (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`border-2 p-3 cursor-help transition-all hover:shadow-md ${getBoxBg(info.status)} ${className}`}>
            <div className="flex flex-col items-center justify-center h-full">
              <span className="text-xs sm:text-sm font-medium text-blue-900 text-center leading-tight">{label}</span>
              <span className={`mt-1 text-xs font-bold ${info.status === 'red' ? 'text-red-600' : info.status === 'yellow' ? 'text-amber-600' : info.status === 'green' ? 'text-green-600' : 'text-slate-500'}`}>
                {info.icon}
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm bg-slate-900 text-white p-3 text-sm">
          <p className="whitespace-pre-line">{info.message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Generate AI analysis
  const generateAnalysis = async () => {
    setIsLoading(true);
    
    const analysisContext = {
      clientAge: data.client_age,
      partnerAge: data.include_partner ? data.partner_age : null,
      childrenCount: data.children_count || 0,
      currentHousing: data.current_housing,
      planningHousingChange: data.planning_housing_change,
      financingMethod: data.financing_method,
      hasMortgage: data.current_housing_has_mortgage,
      clientNetIncome,
      partnerNetIncome,
      totalSavings: liquidSavings,
      desiredReserve: data.desired_reserve_amount,
      clientRetirementAge: data.client_retirement_age,
      clientDesiredPension,
      clientExpectedPension,
      hasVoluntaryPension: data.client_pillar_3,
      hasProperty: data.has_property_1 || data.has_property_2 || data.has_property_3,
      hasCar: data.has_car_1 || data.has_car_2 || data.has_car_3,
      propertyInsured: data.property_1_has_insurance || data.property_2_has_insurance || data.property_3_has_insurance,
      carInsured: data.car_1_has_casco || data.car_2_has_casco || data.car_3_has_casco,
      hasIncomeProtection: data.client_has_income_protection,
      incomeRisks: {
        disability: data.client_risk_disability,
        death: data.client_risk_death
      },
      childrenEducationCosts: data.children_education_costs,
      skipChildrenSection: data.skip_children_section,
      totalDebt: totalDebtRemaining,
      monthlyDebtPayments,
      savingsRate,
      pensionGap,
      childrenGap
    };

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Ти си опитен финансов консултант в България. Анализирай следните данни за клиент и дай ТОЧНО 7 препоръки, разделени в 3 категории.

ДАННИ ЗА КЛИЕНТА:
${JSON.stringify(analysisContext, null, 2)}

ВАЖНО: Бъди много sales-ориентиран! Използвай тактики като:
- Sense of urgency (спешност) - "всеки изгубен месец струва X лева"
- Fear of missing out - "87% от успешните хора вече правят това"
- Social proof - "клиенти като Вас обикновено..."
- Loss aversion - фокусирай се на загубите, не на печалбите
- Емоционални trigger-и за семейство и сигурност

АКЦЕНТИ (ако са приложими):
1. ЗАСТРАХОВАНЕ - подчертай рисковете от липса на защита
2. ПЕНСИОННО ОСИГУРЯВАНЕ - покажи разликата между желана и очаквана пенсия
3. ПОДСИГУРЯВАНЕ НА ДЕЦА - емоционален апел за бъдещето им
4. ИПОТЕЧНО КРЕДИТИРАНЕ - важността на правилна подготовка

Отговори САМО с JSON в следния формат:
{
  "positives": [
    {"title": "кратко заглавие", "text": "похвала и насърчение, max 2 изречения"}
  ],
  "attention": [
    {"title": "заглавие", "text": "какво трябва да се обмисли, без да е критично, max 2 изречения"}
  ],
  "critical": [
    {"title": "СПЕШНО заглавие", "text": "силен sales message с urgency, max 3 изречения", "potential_loss": число в евро ако е приложимо}
  ],
  "pension_gap_yearly": число (разлика между желана и очаквана пенсия годишно),
  "years_to_retirement": число,
  "missed_savings_10_years": число (пропуснати спестявания за 10 години ако не се действа)
}

Дай точно 2 positive, 2 attention, 3 critical точки. Бъди конкретен с числа и проценти.`,
        response_json_schema: {
          type: "object",
          properties: {
            positives: { type: "array", items: { type: "object", properties: { title: { type: "string" }, text: { type: "string" } } } },
            attention: { type: "array", items: { type: "object", properties: { title: { type: "string" }, text: { type: "string" } } } },
            critical: { type: "array", items: { type: "object", properties: { title: { type: "string" }, text: { type: "string" }, potential_loss: { type: "number" } } } },
            pension_gap_yearly: { type: "number" },
            years_to_retirement: { type: "number" },
            missed_savings_10_years: { type: "number" }
          }
        }
      });
      
      setAiAnalysis(result);
      setHasGenerated(true);
    } catch (error) {
      console.error('AI Analysis error:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!hasGenerated) {
      generateAnalysis();
    }
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="font-semibold text-blue-800 text-center mb-6 text-lg tracking-wide">ВАШЕТО НАСТОЯЩО ПОРТФОЛИО</h3>
      
      {/* House visualization - exact match to image */}
      <div className="max-w-lg mx-auto">
        {/* Chimney - Debt */}
        <div className="flex justify-start ml-8 mb-0">
          <StatusBox 
            label="Заеми Кредити" 
            info={debtInfo} 
            className="w-24 h-16 rounded-t"
          />
        </div>

        {/* Roof with Investment */}
        <div className="relative">
          {/* Roof triangle shape */}
          <svg viewBox="0 0 400 80" className="w-full" preserveAspectRatio="none">
            <polygon points="200,0 400,80 0,80" fill="none" stroke="#3b82f6" strokeWidth="3"/>
          </svg>
          {/* Investment box in roof */}
          <div className="absolute inset-0 flex items-center justify-center pt-6">
            <StatusBox 
              label="Инвестиции" 
              info={investmentInfo} 
              className="w-40 h-10 rounded"
            />
          </div>
        </div>

        {/* House body */}
        <div className="border-l-2 border-r-2 border-blue-500">
          {/* Upper floor - Pension & Children */}
          <div className="grid grid-cols-2 gap-4 p-4 border-b-2 border-blue-500">
            <StatusBox 
              label="Пенсионно осигуряване" 
              info={pensionInfo} 
              className="h-20 rounded"
            />
            <StatusBox 
              label="Подсигуряване на децата" 
              info={childrenInfo} 
              className="h-20 rounded"
            />
          </div>

          {/* Middle - Housing */}
          <div className="p-4 border-b-2 border-blue-500">
            <StatusBox 
              label="Жилищно финансиране" 
              info={housingInfo} 
              className="h-16 rounded"
            />
          </div>

          {/* Foundation - Property, Income, Reserve */}
          <div className="grid grid-cols-3 gap-3 p-4">
            <StatusBox 
              label="Защита на собствеността" 
              info={propertyInfo} 
              className="h-20 rounded"
            />
            <StatusBox 
              label="Защита на дохода" 
              info={incomeInfo} 
              className="h-20 rounded"
            />
            <StatusBox 
              label="Спестявания" 
              info={reserveInfo} 
              className="h-20 rounded"
            />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-6 pt-4 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-400"></div>
          <span className="text-slate-600">OK / Добре</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-amber-100 border-2 border-amber-400"></div>
          <span className="text-slate-600">Внимание / Преглед</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-400"></div>
          <span className="text-slate-600">Критично</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-slate-100 border-2 border-slate-400"></div>
          <span className="text-slate-600">Неприложимо</span>
        </div>
      </div>

      {/* Priorities Warning + Priorities Section - shown before AI analysis */}
      {prioritiesWarning && (
        <div className="mt-6 flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-lg p-4">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 font-medium">
            Всички останали Ваши цели зависят от възможността Ви да генерирате средства. Подсигуряването на доходите Ви следва да е приоритет.
          </p>
        </div>
      )}

      {/* Priorities Section - before AI analysis */}
      {prioritiesSection && (
        <div className="mt-6">
          {prioritiesSection}
        </div>
      )}

      {/* AI Analysis Section */}
      <div className="mt-8 pt-6 border-t-2 border-slate-200">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-lg">ПЕРСОНАЛИЗИРАН ФИНАНСОВ АНАЛИЗ</h3>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-slate-500 text-sm">Анализираме Вашите данни...</p>
          </div>
        ) : aiAnalysis ? (
          <div className="space-y-6">
            {/* Positive Points */}
            {aiAnalysis.positives?.length > 0 && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Поздравления! Правите нещата правилно:</h4>
                </div>
                <div className="space-y-3">
                  {aiAnalysis.positives.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 border border-green-100">
                      <p className="font-medium text-green-700">{item.title}</p>
                      <p className="text-sm text-green-600 mt-1">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attention Points */}
            {aiAnalysis.attention?.length > 0 && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h4 className="font-semibold text-amber-800">Области за подобрение:</h4>
                </div>
                <div className="space-y-3">
                  {aiAnalysis.attention.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 border border-amber-100">
                      <p className="font-medium text-amber-700">{item.title}</p>
                      <p className="text-sm text-amber-600 mt-1">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Critical Points - Sales focused */}
            {aiAnalysis.critical?.length > 0 && (
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border-2 border-red-300 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-6 h-6 text-red-600 animate-pulse" />
                  <h4 className="font-bold text-red-800 text-lg">⚠️ ИЗИСКВА НЕЗАБАВНО ВНИМАНИЕ:</h4>
                </div>
                <div className="space-y-4">
                  {aiAnalysis.critical.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 border-l-4 border-red-500 shadow">
                      <p className="font-bold text-red-700 text-lg">{item.title}</p>
                      <p className="text-red-600 mt-2">{item.text}</p>
                      {item.potential_loss > 0 && (
                        <div className="mt-3 bg-red-100 rounded-lg p-2 inline-block">
                          <span className="text-red-800 font-bold">
                            Потенциална загуба: €{item.potential_loss.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visualization Charts */}
            {aiAnalysis.missed_savings_10_years > 0 && (
              <div className="mt-6">
                {/* Savings Growth Comparison - Line Chart */}
                {aiAnalysis.missed_savings_10_years > 0 && (() => {
                  // Calculate years to retirement based on client/partner ages
                  const clientAge = data.client_age || 35;
                  const partnerAge = data.include_partner ? (data.partner_age || 35) : clientAge;
                  const avgAge = data.include_partner ? Math.round((clientAge + partnerAge) / 2) : clientAge;
                  
                  const clientRetirementAge = data.client_retirement_age || 65;
                  const partnerRetirementAge = data.include_partner ? (data.partner_retirement_age || 65) : clientRetirementAge;
                  const avgRetirementAge = data.include_partner ? Math.round((clientRetirementAge + partnerRetirementAge) / 2) : clientRetirementAge;
                  
                  const yearsToRetirement = Math.max(5, avgRetirementAge - avgAge);
                  
                  // Calculate monthly savings
                  const monthlySavingsAmount = monthlySavings > 0 ? monthlySavings : 500;
                  
                  // Generate data for each year
                  const chartData = Array.from({ length: yearsToRetirement + 1 }, (_, i) => {
                    const year = i;
                    // Without plan: linear growth (just savings, no returns)
                    const withoutPlan = monthlySavingsAmount * 12 * year;
                    // With plan: compound growth at 8% annual return
                    const annualContribution = monthlySavingsAmount * 12;
                    let withPlan = 0;
                    for (let y = 0; y < year; y++) {
                      withPlan = (withPlan + annualContribution) * 1.08;
                    }
                    
                    return {
                      year: `${year}`,
                      withoutPlan: Math.round(withoutPlan),
                      withPlan: Math.round(withPlan)
                    };
                  });
                  
                  const finalWithPlan = chartData[chartData.length - 1]?.withPlan || 0;
                  const finalWithoutPlan = chartData[chartData.length - 1]?.withoutPlan || 0;
                  const difference = finalWithPlan - finalWithoutPlan;
                  
                  return (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <h5 className="font-semibold text-slate-700 mb-2 text-sm">Сценарий: С план vs. Без план (до пенсия - {yearsToRetirement} години)</h5>
                      <p className="text-xs text-slate-500 mb-3">Средна възраст: {avgAge} г. → Пенсия: {avgRetirementAge} г.</p>
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={chartData}>
                          <XAxis 
                            dataKey="year" 
                            tick={{ fontSize: 10 }} 
                            interval={Math.floor(yearsToRetirement / 6)}
                            label={{ value: 'Години', position: 'bottom', fontSize: 10, offset: -5 }}
                          />
                          <YAxis 
                            tick={{ fontSize: 10 }} 
                            tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} 
                          />
                          <RechartsTooltip 
                            formatter={(v, name) => [
                              `€${v.toLocaleString()}`, 
                              name === 'withPlan' ? 'С финансов план' : 'Без план'
                            ]} 
                            labelFormatter={(label) => `Година ${label}`}
                          />
                          <Legend 
                            formatter={(value) => value === 'withPlan' ? 'С финансов план' : 'Без план'}
                            wrapperStyle={{ fontSize: '11px' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="withoutPlan" 
                            stroke="#f87171" 
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="withPlan" 
                            stroke="#22c55e" 
                            strokeWidth={3}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-center text-sm">
                        <div className="bg-red-100 rounded-lg p-2">
                          <p className="text-red-600 font-medium">Без план</p>
                          <p className="text-red-700 font-bold">€{finalWithoutPlan.toLocaleString()}</p>
                        </div>
                        <div className="bg-green-100 rounded-lg p-2">
                          <p className="text-green-600 font-medium">С план</p>
                          <p className="text-green-700 font-bold">€{finalWithPlan.toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-center text-blue-600 font-bold mt-2">
                        Разлика: €{difference.toLocaleString()} повече с правилно управление!
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Urgency CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white text-center">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <h4 className="font-bold text-xl mb-2">Времето работи срещу Вас!</h4>
              <p className="text-blue-100 mb-4">
                Всеки месец без финансов план означава пропуснати възможности. 
                <br/>
                <span className="font-semibold">93% от нашите клиенти</span> започват да виждат резултати още през първата година.
              </p>
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Средна доходност: 7-12% годишно</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <button
              onClick={generateAnalysis}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              Генерирай персонализиран анализ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}