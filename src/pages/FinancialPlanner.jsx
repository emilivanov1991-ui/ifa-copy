import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, Loader2, Lock, Unlock, HelpCircle, ArrowLeft, ShieldAlert, Shield, ShieldCheck, Frown, Smile, PartyPopper, Home, HomeIcon, Car, GraduationCap, BookX } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Step definitions
const STEPS = [
  { id: 1, label: 'С КОГО ПЛАНИРАМЕ?' },
  { id: 2, label: 'НАЧИН НА ОСИГУРЯВАНЕ' },
  { id: 3, label: 'ВЪЗРАСТ' },
  { id: 4, label: 'МЕСЕЧЕН ДОХОД' },
  { id: 5, label: 'ПРИОРИТЕТИ' },
  { id: 6, label: 'ФИНАНСОВА РАМКА' },
  { id: 7, label: 'СИСТЕМА НА РАБОТА' },
  { id: 8, label: 'ПРАВИЛА' },
  { id: 9, label: 'МИКРО ПЛАН' },
];

// Visual step indicators for progress bar (matching actual steps)
const VISUAL_STEPS = [
  { id: 1, label: 'С КОГО', subLabel: 'ПЛАНИРАМЕ?' },
  { id: 2, label: 'НАЧИН НА', subLabel: 'ОСИГУРЯВАНЕ' },
  { id: 3, label: 'ВЪЗРАСТ НА', subLabel: 'КЛИЕНТА' },
  { id: 4, label: 'МЕСЕЧЕН', subLabel: 'ДОХОД' },
  { id: 5, label: 'ОСНОВЕН', subLabel: 'ПРИОРИТЕТ' },
  { id: 6, label: 'FINANCIAL', subLabel: 'PLANNER' },
  { id: 7, label: 'СИСТЕМА НА', subLabel: 'РАБОТА' },
  { id: 8, label: 'ПРАВИЛА НА', subLabel: 'СЪТРУДНИЧЕСТВО' },
  { id: 9, label: 'ФИНАНСОВ', subLabel: 'АНАЛИЗ' },
];

// Financial calculation functions
const calculateFutureValue = (monthlyPayment, annualRate, years) => {
  // Future Value of an ordinary annuity (monthly payments)
  const monthlyRate = annualRate / 12;
  const months = years * 12;
  if (monthlyRate === 0) return monthlyPayment * months;
  return monthlyPayment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
};

const calculateAnnuityPayment = (principal, annualRate, years) => {
  // Calculate monthly payment that depletes principal over years with interest
  const monthlyRate = annualRate / 12;
  const months = years * 12;
  if (monthlyRate === 0) return principal / months;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
};

const calculateLoanAmount = (monthlyPayment, annualRate, years) => {
  // Present Value of an ordinary annuity (what loan can we afford with this payment)
  const monthlyRate = annualRate / 12;
  const months = years * 12;
  if (monthlyRate === 0) return monthlyPayment * months;
  return monthlyPayment * ((1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate);
};

const calculateStatePension = (clientIncome, partnerIncome, clientIsEntrepreneur, partnerIsEntrepreneur, isFamily) => {
  // 60% of income, min 630 per person, max 3400 per person
  // Entrepreneurs always get minimum pension (630)
  const minPension = 630;
  const maxPension = 3400;
  
  let clientPension;
  if (clientIsEntrepreneur) {
    clientPension = minPension;
  } else {
    const calculated = clientIncome * 0.6;
    clientPension = Math.max(minPension, Math.min(maxPension, calculated));
  }
  
  let partnerPension = 0;
  if (isFamily) {
    if (partnerIsEntrepreneur) {
      partnerPension = minPension;
    } else {
      const calculated = partnerIncome * 0.6;
      partnerPension = Math.max(minPension, Math.min(maxPension, calculated));
    }
  }
  
  return Math.round((clientPension + partnerPension) / 10) * 10;
};

export default function FinancialPlanner() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showIntroAnimation, setShowIntroAnimation] = useState(true);
  const [introPhase, setIntroPhase] = useState('lines'); // 'lines' | 'text'

  // Intro animation sequence
  useEffect(() => {
    if (showIntroAnimation) {
      // Lines animation for 4 seconds, then show text
      const textTimer = setTimeout(() => {
        setIntroPhase('text');
      }, 4000);
      
      // Hide intro after 9.5 seconds total
      const hideTimer = setTimeout(() => {
        setShowIntroAnimation(false);
      }, 9500);
      
      return () => {
        clearTimeout(textTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [showIntroAnimation]);
  
  // Data states
  const [familyType, setFamilyType] = useState(null); // 'individual' | 'family'
  const [clientInsuranceType, setClientInsuranceType] = useState(null); // 'employee' | 'entrepreneur'
  const [partnerInsuranceType, setPartnerInsuranceType] = useState(null); // 'employee' | 'entrepreneur'
  const [clientAge, setClientAge] = useState(35);
  const [partnerAge, setPartnerAge] = useState(35);
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [selectedPriorities, setSelectedPriorities] = useState([]); // multi-select
  const [partnerIncome, setPartnerIncome] = useState(5000);
  
  // Percentage allocations (default: 10% reserve, 5% pension, 30% housing, 5% other = 50% total)
  const [allocations, setAllocations] = useState({
    security: 10,
    pension: 5,
    housing: 30,
    cash: 5
  });

  // Locked goals (can't be auto-adjusted)
  const [lockedGoals, setLockedGoals] = useState({
    security: false,
    pension: false,
    housing: false,
    cash: false
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [recentlyChanged, setRecentlyChanged] = useState(null);

  // Derived values
  const totalIncome = familyType === 'family' ? monthlyIncome + partnerIncome : monthlyIncome;
  const avgAge = familyType === 'family' ? (clientAge + partnerAge) / 2 : clientAge;
  const yearsToRetirement = Math.max(0, 65 - avgAge);
  const numPeople = familyType === 'family' ? 2 : 1;

  // Calculate financial values based on allocations
  const calculateGoals = useMemo(() => {
    const securityPercent = allocations.security;
    const pensionPercent = allocations.pension;
    const housingPercent = allocations.housing;
    const cashPercent = allocations.cash;

    // 1. Reserve = securityPercent% of income * 6 months (scaled by percentage)
    // At 10% allocation -> 6 months of income
    // At 50% allocation -> 30 months of income (5x)
    // At 0% allocation -> 0
    const reserveMonths = (securityPercent / 10) * 6;
    const securityValue = Math.round(totalIncome * reserveMonths / 100) * 100;

    // 2. Pension calculation
    // pensionPercent% of income invested monthly at 8% until retirement
    // Then moved to 3% fund and withdrawn over 20 years
    const monthlyPensionInvestment = totalIncome * (pensionPercent / 100);
    const pensionFundAtRetirement = calculateFutureValue(monthlyPensionInvestment, 0.08, yearsToRetirement);
    const monthlyPensionFromFund = calculateAnnuityPayment(pensionFundAtRetirement, 0.03, 20);
    const statePension = calculateStatePension(
      familyType === 'family' ? monthlyIncome : totalIncome,
      partnerIncome,
      clientInsuranceType === 'entrepreneur',
      partnerInsuranceType === 'entrepreneur',
      familyType === 'family'
    );
    const totalMonthlyPension = Math.round((monthlyPensionFromFund + statePension) / 10) * 10;

    // 3. Housing calculation
    // housingPercent% of income goes to mortgage payment
    // 3% interest, max 30 year term (adjusted if age + term > 70)
    const maxLoanTerm = Math.min(30, Math.max(5, 70 - avgAge));
    const monthlyMortgagePayment = totalIncome * (housingPercent / 100);
    const loanAmount = calculateLoanAmount(monthlyMortgagePayment, 0.03, maxLoanTerm);
    // Loan is 85% of property value, so property = loan / 0.85 = loan * 1.176
    const housingValue = Math.round(loanAmount * 1.176 / 100) * 100;

    // 4. Other goals calculation
    // cashPercent% of income invested monthly at 5% until retirement
    const monthlyOtherInvestment = totalIncome * (cashPercent / 100);
    const otherGoalsValue = Math.round(calculateFutureValue(monthlyOtherInvestment, 0.05, yearsToRetirement) / 100) * 100;

    // Total wealth = Reserve + Pension Fund at retirement + Housing Value + Other Goals
    const totalWealth = securityValue + Math.round(pensionFundAtRetirement / 100) * 100 + housingValue + otherGoalsValue;

    return {
      security: securityValue,
      pension: totalMonthlyPension, // This shows monthly pension income
      pensionFund: Math.round(pensionFundAtRetirement / 100) * 100, // For total wealth calculation
      housing: housingValue,
      cash: otherGoalsValue,
      totalWealth: totalWealth,
      statePension: statePension,
      loanTerm: maxLoanTerm
    };
  }, [allocations, totalIncome, avgAge, yearsToRetirement, numPeople, familyType, monthlyIncome, partnerIncome, clientInsuranceType, partnerInsuranceType]);

  // Tooltips for financial terms
  const tooltips = {
    security: "Финансова сигурност - резерв при непредвидени ситуации, базиран на месечните доходи.",
    pension: "Месечен пенсионен доход = държавна пенсия + доход от инвестиционен фонд.",
    housing: "Максимална стойност на жилище при текущото разпределение на бюджета.",
    cash: "Капитал за други цели натрупан до пенсия.",
    totalWealth: "Общата сума на всички финансови активи.",
    lock: "Заключете цел, за да не се променя автоматично при корекции на други цели."
  };

  // Default allocations for recalculation
  const DEFAULT_ALLOCATIONS = {
    security: 10,
    pension: 5,
    housing: 30,
    cash: 5
  };

  // Handle allocation change with redistribution
  const handleAllocationChange = (changedKey, newValue) => {
    const oldValue = allocations[changedKey];
    const difference = newValue - oldValue;

    // Auto-lock the slider being changed
    if (!lockedGoals[changedKey]) {
      setLockedGoals(prev => ({ ...prev, [changedKey]: true }));
    }

    // Get unlocked allocations (excluding the one being changed)
    const unlockedKeys = Object.keys(allocations).filter(
      key => key !== changedKey && !lockedGoals[key]
    );

    if (unlockedKeys.length === 0) {
      // No unlocked goals to redistribute to, just update the changed one if within bounds
      const totalOthers = Object.entries(allocations)
        .filter(([key]) => key !== changedKey)
        .reduce((sum, [, val]) => sum + val, 0);
      if (newValue + totalOthers <= 50) {
        setAllocations(prev => ({ ...prev, [changedKey]: newValue }));
      }
      return;
    }

    // Calculate how much the unlocked allocations currently have
    const unlockedTotal = unlockedKeys.reduce((sum, key) => sum + allocations[key], 0);

    // Check if we can redistribute
    if (difference > 0 && unlockedTotal < difference) {
      // Not enough to take from unlocked keys
      const maxPossible = oldValue + unlockedTotal;
      if (newValue > maxPossible) {
        newValue = maxPossible;
      }
    }

    const actualDifference = newValue - oldValue;
    const newAllocations = { ...allocations, [changedKey]: newValue };

    // Distribute the difference among unlocked allocations proportionally
    if (actualDifference !== 0 && unlockedTotal > 0) {
      unlockedKeys.forEach(key => {
        const proportion = allocations[key] / unlockedTotal;
        const adjustment = actualDifference * proportion;
        newAllocations[key] = Math.max(0, Math.round((allocations[key] - adjustment) * 100) / 100);
      });
    } else if (actualDifference !== 0) {
      // Distribute equally if no proportions
      const perKey = actualDifference / unlockedKeys.length;
      unlockedKeys.forEach(key => {
        newAllocations[key] = Math.max(0, allocations[key] - perKey);
      });
    }

    // Ensure total doesn't exceed 50%
    const total = Object.values(newAllocations).reduce((a, b) => a + b, 0);
    if (total <= 50) {
      setAllocations(newAllocations);
    }
    
    // Visual feedback for change
    setRecentlyChanged(changedKey);
    setTimeout(() => setRecentlyChanged(null), 600);
  };

  // Toggle lock on a goal - when unlocking, recalculate to default proportions
  const toggleLock = (key) => {
    const wasLocked = lockedGoals[key];
    
    if (wasLocked) {
      // Unlocking - recalculate all unlocked values based on locked ones
      const newLockedGoals = { ...lockedGoals, [key]: false };
      
      // Get all keys that will be unlocked after this toggle
      const unlockedKeys = Object.keys(allocations).filter(k => !newLockedGoals[k]);
      const lockedKeys = Object.keys(allocations).filter(k => newLockedGoals[k]);
      
      // Calculate total locked percentage
      const lockedTotal = lockedKeys.reduce((sum, k) => sum + allocations[k], 0);
      
      // Calculate remaining percentage for unlocked keys
      const remainingPercent = 50 - lockedTotal;
      
      if (unlockedKeys.length > 0 && remainingPercent > 0) {
        // Calculate proportional defaults for unlocked keys
        const defaultUnlockedTotal = unlockedKeys.reduce((sum, k) => sum + DEFAULT_ALLOCATIONS[k], 0);
        
        const newAllocations = { ...allocations };
        unlockedKeys.forEach(k => {
          const proportion = DEFAULT_ALLOCATIONS[k] / defaultUnlockedTotal;
          newAllocations[k] = Math.round(remainingPercent * proportion);
        });
        
        // Adjust to make sure total is exactly 50
        const newTotal = Object.values(newAllocations).reduce((a, b) => a + b, 0);
        if (newTotal !== 50 && unlockedKeys.length > 0) {
          const diff = 50 - newTotal;
          newAllocations[unlockedKeys[0]] += diff;
        }
        
        setAllocations(newAllocations);
      }
      
      setLockedGoals(newLockedGoals);
    } else {
      // Locking - just lock the current value
      setLockedGoals(prev => ({ ...prev, [key]: true }));
    }
  };

  // Initialize allocations when entering step 6
  useEffect(() => {
    if (currentStep === 6 && !isGenerating) {
      setAllocations({
        security: 10,
        pension: 5,
        housing: 30,
        cash: 5
      });
    }
  }, [currentStep, isGenerating]);

  // Format number with spaces
  const formatNumber = (num) => {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Toggle priority selection
  const togglePriority = (priority) => {
    setSelectedPriorities(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  // Navigation
  const goNext = () => {
    if (currentStep === 5) {
      // Show generating animation before financial framework
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        setCurrentStep(6);
      }, 6000);
    } else if (currentStep < 9) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const restart = () => {
    setCurrentStep(1);
    setFamilyType(null);
    setClientInsuranceType(null);
    setPartnerInsuranceType(null);
    setClientAge(35);
    setPartnerAge(33);
    setMonthlyIncome(5000);
    setPartnerIncome(3000);
    setSelectedPriorities([]);
    setAllocations({
      security: 10,
      pension: 5,
      housing: 30,
      cash: 5
    });
    setLockedGoals({
      security: false,
      pension: false,
      housing: false,
      cash: false
    });
  };

  // Theme classes
  const themeClasses = isDarkMode 
    ? 'bg-slate-950 text-white' 
    : 'bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900';

  const cardClasses = isDarkMode
    ? 'bg-slate-900/80 border-slate-800'
    : 'bg-white border-slate-200';

  const mutedTextClasses = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const accentColor = 'text-blue-400';

  // Common button styles
  const primaryButtonClass = "rounded-full px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25";
  const outlineButtonClass = cn("rounded-full px-6 font-medium transition-all duration-200", isDarkMode ? "border-slate-700 hover:bg-slate-800" : "border-slate-300 hover:bg-slate-50");

  // Hide header/footer when in Financial Planner
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';
    
    return () => {
      document.body.style.overflow = '';
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
    };
  }, []);

  return (
    <TooltipProvider>
    <div className={cn("fixed inset-0 overflow-hidden transition-colors duration-500", themeClasses, (isGenerating || showIntroAnimation) && "overflow-hidden")}>
      
      {/* Intro Animation */}
      <AnimatePresence>
        {showIntroAnimation && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden"
          >
            {/* Diagonal lines animation - train-like movement */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Lines from bottom-right to top-left */}
              {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                const widths = [8, 4, 12, 6, 10, 5, 7];
                const heights = [120, 80, 150, 100, 130, 90, 110];
                const delays = [0, 0.3, 0.1, 0.5, 0.2, 0.6, 0.4];
                const offsets = [15, 35, 5, 50, 25, 60, 45];
                return (
                  <motion.div
                    key={`br-${i}`}
                    className="absolute"
                    style={{
                      width: widths[i],
                      height: heights[i],
                      background: 'linear-gradient(to top left, transparent 0%, white 20%, white 80%, transparent 100%)',
                      clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                      rotate: '-45deg',
                    }}
                    initial={{ 
                      x: '100vw',
                      y: '100vh',
                    }}
                    animate={{ 
                      x: '-100vw',
                      y: '-100vh',
                    }}
                    transition={{ 
                      duration: 3,
                      delay: delays[i],
                      ease: "linear",
                      repeat: 1,
                    }}
                    style={{
                      position: 'absolute',
                      top: `${offsets[i]}%`,
                      left: `${offsets[i]}%`,
                      width: widths[i],
                      height: heights[i],
                      background: 'linear-gradient(to top, transparent 0%, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.6) 70%, transparent 100%)',
                      transform: 'rotate(-45deg)',
                      borderRadius: '2px 2px 50% 50%',
                    }}
                  />
                );
              })}
              
              {/* Lines from top-left to bottom-right */}
              {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                const widths = [6, 10, 4, 14, 8, 5, 9];
                const heights = [100, 140, 70, 160, 110, 85, 125];
                const delays = [0.15, 0.45, 0.05, 0.35, 0.55, 0.25, 0.65];
                const offsets = [20, 45, 10, 55, 30, 65, 40];
                return (
                  <motion.div
                    key={`tl-${i}`}
                    initial={{ 
                      x: '-100vw',
                      y: '-100vh',
                    }}
                    animate={{ 
                      x: '100vw',
                      y: '100vh',
                    }}
                    transition={{ 
                      duration: 3,
                      delay: delays[i],
                      ease: "linear",
                      repeat: 1,
                    }}
                    style={{
                      position: 'absolute',
                      top: `${offsets[i]}%`,
                      right: `${offsets[i]}%`,
                      width: widths[i],
                      height: heights[i],
                      background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.5) 70%, transparent 100%)',
                      transform: 'rotate(-45deg)',
                      borderRadius: '50% 50% 2px 2px',
                    }}
                  />
                );
              })}
            </div>

            {/* Text reveal */}
            <AnimatePresence>
              {introPhase === 'text' && (
                <div className="relative z-10 text-center px-4">
                  <motion.h1 
                    className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    Financial Planner
                  </motion.h1>
                  <motion.p 
                    className="text-xl md:text-2xl text-blue-200 font-light"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                  >
                    Да планираме Вашето финансово бъдеще заедно!
                  </motion.p>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Global Back Button */}
      {currentStep > 1 && !isGenerating && (
        <button
          onClick={goBack}
          className={cn(
            "fixed top-6 left-6 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
            isDarkMode 
              ? "bg-slate-800 hover:bg-slate-700 text-white" 
              : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
          )}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      {/* Main Content */}
      <div className="h-full overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-7xl mx-auto h-full flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Family Type */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-2 gap-8 items-start"
              >
                {/* Left side - description */}
                <div className="lg:pr-12">
                  <p className={cn("text-sm tracking-widest mb-4", accentColor)}>СТЪПКА 1</p>
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">С кого планираме?</h1>
                  <p className={cn("text-lg mb-6", mutedTextClasses)}>
                    Изберете дали работим с един клиент или с домакинство.
                  </p>
                </div>

                {/* Right side - card */}
                <div className={cn("rounded-3xl border p-6", cardClasses)}>
                  {/* Inline Step Tracker */}
                  <div className="mb-6 pb-4 border-b border-slate-100">
                    <div className="flex justify-between items-start">
                      {VISUAL_STEPS.map((step, index) => {
                        const isActive = currentStep >= (index + 1);
                        const isCurrent = index === 0;
                        return (
                          <div 
                            key={step.id}
                            className={cn(
                              "flex flex-col items-center text-center flex-1 transition-all duration-300",
                              isActive ? "opacity-100" : "opacity-40"
                            )}
                          >
                            <div className={cn(
                              "w-full h-1 mb-2 rounded-full transition-all duration-300",
                              isCurrent 
                                ? "bg-blue-500" 
                                : isActive 
                                  ? "bg-blue-500" 
                                  : isDarkMode ? "bg-slate-700" : "bg-slate-200"
                            )} />
                            <span className={cn(
                              "text-[9px] font-semibold tracking-wider leading-tight uppercase",
                              isCurrent ? "text-slate-900" : isDarkMode ? "text-slate-400" : "text-slate-400"
                            )}>
                              {step.label}
                            </span>
                            <span className={cn(
                              "text-[9px] font-semibold tracking-wider leading-tight uppercase",
                              isCurrent ? "text-slate-900" : isDarkMode ? "text-slate-400" : "text-slate-400"
                            )}>
                              {step.subLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <p className={cn("text-sm tracking-widest", mutedTextClasses)}>СТЪПКА 1</p>
                    <button onClick={restart} className={cn("p-2 rounded-full text-slate-400 hover:text-blue-500 hover:bg-slate-100 transition-colors")}>
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-2">С кого планираме?</h2>
                  <p className={cn("text-sm mb-6", mutedTextClasses)}>
                    Изберете дали работим с един клиент или с домакинство.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => setFamilyType('individual')}
                      className={cn(
                        "p-6 rounded-2xl border-2 text-left transition-all duration-300 group",
                        familyType === 'individual'
                          ? "border-blue-500 bg-blue-600 text-white"
                          : isDarkMode 
                            ? "border-slate-700 hover:border-blue-500 hover:bg-blue-600 hover:text-white" 
                            : "border-slate-200 hover:border-blue-500 hover:bg-blue-600 hover:text-white"
                      )}
                    >
                      <h3 className={cn("font-semibold mb-1", familyType !== 'individual' && "group-hover:text-white")}>Отделен индивид</h3>
                      <p className={cn("text-sm", familyType === 'individual' ? "text-blue-100" : mutedTextClasses, familyType !== 'individual' && "group-hover:text-blue-100")}>
                        Фокус върху Вашите лични цели
                      </p>
                    </button>
                    
                    <button
                      onClick={() => setFamilyType('family')}
                      className={cn(
                        "p-6 rounded-2xl border-2 text-left transition-all duration-300 group",
                        familyType === 'family'
                          ? "border-blue-500 bg-blue-600 text-white"
                          : isDarkMode 
                            ? "border-slate-700 hover:border-blue-500 hover:bg-blue-600 hover:text-white" 
                            : "border-slate-200 hover:border-blue-500 hover:bg-blue-600 hover:text-white"
                      )}
                    >
                      <h3 className={cn("font-semibold mb-1", familyType !== 'family' && "group-hover:text-white")}>Семейство</h3>
                      <p className={cn("text-sm", familyType === 'family' ? "text-blue-100" : mutedTextClasses, familyType !== 'family' && "group-hover:text-blue-100")}>
                        Да планираме Вашия общ семеен бюджет!
                      </p>
                    </button>
                  </div>

                  <Button 
                      onClick={goNext}
                      disabled={!familyType}
                      className={cn(primaryButtonClass, "w-full")}
                    >
                      СЛЕДВАЩА СТЪПКА
                    </Button>
                  </div>
                  </motion.div>
                  )}

                  {/* Step 2: Insurance Type */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-2 gap-8 items-start"
              >
                <div className="lg:pr-12">
                  <p className={cn("text-sm tracking-widest mb-4", accentColor)}>СТЪПКА 2</p>
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">Начин на осигуряване</h1>
                  <p className={cn("text-lg mb-6", mutedTextClasses)}>
                    {familyType === 'family' 
                      ? 'Изберете начина на осигуряване за клиента и партньора.'
                      : 'Изберете вашия начин на осигуряване.'
                    }
                  </p>
                </div>

                <div className={cn("rounded-3xl border p-6", cardClasses)}>
                  {/* Inline Step Tracker */}
                  <div className="mb-6 pb-4 border-b border-slate-100">
                    <div className="flex justify-between items-start">
                      {VISUAL_STEPS.map((step, index) => {
                        const isActive = currentStep >= (index + 1);
                        const isCurrent = index === 1;
                        return (
                          <div key={step.id} className={cn("flex flex-col items-center text-center flex-1 transition-all duration-300", isActive ? "opacity-100" : "opacity-40")}>
                            <div className={cn("w-full h-1 mb-2 rounded-full transition-all duration-300", isCurrent ? "bg-blue-500" : isActive ? "bg-blue-500" : isDarkMode ? "bg-slate-700" : "bg-slate-200")} />
                            <span className={cn("text-[9px] font-semibold tracking-wider leading-tight uppercase", isCurrent ? "text-slate-900" : "text-slate-400")}>{step.label}</span>
                            <span className={cn("text-[9px] font-semibold tracking-wider leading-tight uppercase", isCurrent ? "text-slate-900" : "text-slate-400")}>{step.subLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <p className={cn("text-sm tracking-widest", mutedTextClasses)}>СТЪПКА 2</p>
                    <button onClick={restart} className="p-2 rounded-full text-slate-400 hover:text-blue-500 hover:bg-slate-100 transition-colors">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-6">Начин на осигуряване</h2>

                  {/* Insurance type selection */}
                  <div className={cn("space-y-6", familyType === 'family' && "grid grid-cols-2 gap-6 space-y-0")}>
                    {/* Client Insurance */}
                    <div>
                      {familyType === 'family' && (
                        <p className={cn("text-sm font-medium mb-3", mutedTextClasses)}>КЛИЕНТ</p>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setClientInsuranceType('employee')}
                          className={cn(
                            "p-4 rounded-2xl border-2 text-left transition-all duration-300 group",
                            clientInsuranceType === 'employee'
                              ? "border-blue-500 bg-blue-600 text-white"
                              : isDarkMode 
                                ? "border-slate-700 hover:border-blue-500 hover:bg-blue-600 hover:text-white" 
                                : "border-slate-200 hover:border-blue-500 hover:bg-blue-600 hover:text-white"
                          )}
                        >
                          <h3 className={cn("font-semibold mb-1 text-sm", clientInsuranceType !== 'employee' && "group-hover:text-white")}>Служител</h3>
                          <p className={cn("text-xs", clientInsuranceType === 'employee' ? "text-blue-100" : mutedTextClasses, clientInsuranceType !== 'employee' && "group-hover:text-blue-100")}>
                            Осигуряването съответства на доходите
                          </p>
                        </button>
                        
                        <button
                          onClick={() => setClientInsuranceType('entrepreneur')}
                          className={cn(
                            "p-4 rounded-2xl border-2 text-left transition-all duration-300 group",
                            clientInsuranceType === 'entrepreneur'
                              ? "border-blue-500 bg-blue-600 text-white"
                              : isDarkMode 
                                ? "border-slate-700 hover:border-blue-500 hover:bg-blue-600 hover:text-white" 
                                : "border-slate-200 hover:border-blue-500 hover:bg-blue-600 hover:text-white"
                          )}
                        >
                          <h3 className={cn("font-semibold mb-1 text-sm", clientInsuranceType !== 'entrepreneur' && "group-hover:text-white")}>Предприемач</h3>
                          <p className={cn("text-xs", clientInsuranceType === 'entrepreneur' ? "text-blue-100" : mutedTextClasses, clientInsuranceType !== 'entrepreneur' && "group-hover:text-blue-100")}>
                            Осигуряването е по-ниско от доходите
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Partner Insurance (only for family) */}
                    {familyType === 'family' && (
                      <div>
                        <p className={cn("text-sm font-medium mb-3", mutedTextClasses)}>ПАРТНЬОР</p>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setPartnerInsuranceType('employee')}
                            className={cn(
                              "p-4 rounded-2xl border-2 text-left transition-all duration-300 group",
                              partnerInsuranceType === 'employee'
                                ? "border-blue-500 bg-blue-600 text-white"
                                : isDarkMode 
                                  ? "border-slate-700 hover:border-blue-500 hover:bg-blue-600 hover:text-white" 
                                  : "border-slate-200 hover:border-blue-500 hover:bg-blue-600 hover:text-white"
                            )}
                          >
                            <h3 className={cn("font-semibold mb-1 text-sm", partnerInsuranceType !== 'employee' && "group-hover:text-white")}>Служител</h3>
                            <p className={cn("text-xs", partnerInsuranceType === 'employee' ? "text-blue-100" : mutedTextClasses, partnerInsuranceType !== 'employee' && "group-hover:text-blue-100")}>
                              Осигуряването съответства на доходите
                            </p>
                          </button>
                          
                          <button
                            onClick={() => setPartnerInsuranceType('entrepreneur')}
                            className={cn(
                              "p-4 rounded-2xl border-2 text-left transition-all duration-300 group",
                              partnerInsuranceType === 'entrepreneur'
                                ? "border-blue-500 bg-blue-600 text-white"
                                : isDarkMode 
                                  ? "border-slate-700 hover:border-blue-500 hover:bg-blue-600 hover:text-white" 
                                  : "border-slate-200 hover:border-blue-500 hover:bg-blue-600 hover:text-white"
                            )}
                          >
                            <h3 className={cn("font-semibold mb-1 text-sm", partnerInsuranceType !== 'entrepreneur' && "group-hover:text-white")}>Предприемач</h3>
                            <p className={cn("text-xs", partnerInsuranceType === 'entrepreneur' ? "text-blue-100" : mutedTextClasses, partnerInsuranceType !== 'entrepreneur' && "group-hover:text-blue-100")}>
                              Осигуряването е по-ниско от доходите
                            </p>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={goNext}
                    disabled={!clientInsuranceType || (familyType === 'family' && !partnerInsuranceType)}
                    className={cn(primaryButtonClass, "w-full mt-6")}
                  >
                    СЛЕДВАЩА СТЪПКА
                  </Button>
                </div>
              </motion.div>
            )}

                  {/* Step 3: Age (combined) */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-2 gap-8 items-start"
              >
                <div className="lg:pr-12">
                  <p className={cn("text-sm tracking-widest mb-4", accentColor)}>СТЪПКА 3</p>
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">Възраст</h1>
                  <p className={cn("text-lg mb-6", mutedTextClasses)}>
                    {familyType === 'family' 
                      ? 'Въведете възрастта на клиента и партньора.'
                      : 'Въведете вашата възраст.'
                    }
                  </p>
                </div>

                <div className={cn("rounded-3xl border p-6", cardClasses)}>
                  {/* Inline Step Tracker */}
                  <div className="mb-6 pb-4 border-b border-slate-100">
                    <div className="flex justify-between items-start">
                      {VISUAL_STEPS.map((step, index) => {
                        const isActive = currentStep >= (index + 1);
                        const isCurrent = index === 2;
                        return (
                          <div key={step.id} className={cn("flex flex-col items-center text-center flex-1 transition-all duration-300", isActive ? "opacity-100" : "opacity-40")}>
                            <div className={cn("w-full h-1 mb-2 rounded-full transition-all duration-300", isCurrent ? "bg-blue-500" : isActive ? "bg-blue-500" : isDarkMode ? "bg-slate-700" : "bg-slate-200")} />
                            <span className={cn("text-[9px] font-semibold tracking-wider leading-tight uppercase", isCurrent ? "text-slate-900" : "text-slate-400")}>{step.label}</span>
                            <span className={cn("text-[9px] font-semibold tracking-wider leading-tight uppercase", isCurrent ? "text-slate-900" : "text-slate-400")}>{step.subLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <p className={cn("text-sm tracking-widest", mutedTextClasses)}>СТЪПКА 3</p>
                    <button onClick={restart} className="p-2 rounded-full text-slate-400 hover:text-blue-500 hover:bg-slate-100 transition-colors">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-6">Възраст</h2>

                  {/* Age inputs side by side */}
                  <div className={cn("grid gap-6 mb-6", familyType === 'family' ? "grid-cols-2" : "grid-cols-1")}>
                    {/* Client Age */}
                    <div>
                      <p className={cn("text-sm font-medium mb-3", mutedTextClasses)}>
                        {familyType === 'family' ? 'КЛИЕНТ' : 'ВАШАТА ВЪЗРАСТ'}
                      </p>
                      <div className="text-center mb-3">
                        <span className="text-4xl font-bold text-blue-500">{clientAge}</span>
                        <span className={cn("text-lg ml-2", mutedTextClasses)}>години</span>
                      </div>
                      <Slider
                        value={[clientAge]}
                        onValueChange={(v) => setClientAge(v[0])}
                        min={18}
                        max={70}
                        step={1}
                        className="mb-2"
                      />
                      <div className={cn("flex justify-between text-xs", mutedTextClasses)}>
                        <span>18</span>
                        <span>70</span>
                      </div>
                    </div>

                    {/* Partner Age (only for family) */}
                    {familyType === 'family' && (
                      <div>
                        <p className={cn("text-sm font-medium mb-3", mutedTextClasses)}>ПАРТНЬОР</p>
                        <div className="text-center mb-3">
                          <span className="text-4xl font-bold text-blue-500">{partnerAge}</span>
                          <span className={cn("text-lg ml-2", mutedTextClasses)}>години</span>
                        </div>
                        <Slider
                          value={[partnerAge]}
                          onValueChange={(v) => setPartnerAge(v[0])}
                          min={18}
                          max={70}
                          step={1}
                          className="mb-2"
                        />
                        <div className={cn("flex justify-between text-xs", mutedTextClasses)}>
                          <span>18</span>
                          <span>70</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button onClick={goNext} className={cn(primaryButtonClass, "w-full")}>
                      СЛЕДВАЩА СТЪПКА
                    </Button>
                  </div>
                  </motion.div>
                  )}

                  {/* Step 4: Monthly Income */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-2 gap-8 items-start"
              >
                <div className="lg:pr-12">
                  <p className={cn("text-sm tracking-widest mb-4", accentColor)}>СТЪПКА 4</p>
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">Месечен доход</h1>
                  <p className={cn("text-lg mb-6", mutedTextClasses)}>
                    {familyType === 'family' 
                      ? 'Въведете месечния доход на клиента и партньора.'
                      : 'Въведете вашия месечен доход.'
                    }
                  </p>
                </div>

                <div className={cn("rounded-3xl border p-6", cardClasses)}>
                  {/* Inline Step Tracker */}
                  <div className="mb-6 pb-4 border-b border-slate-100">
                    <div className="flex justify-between items-start">
                      {VISUAL_STEPS.map((step, index) => {
                        const isActive = currentStep >= (index + 1);
                        const isCurrent = index === 3;
                        return (
                          <div key={step.id} className={cn("flex flex-col items-center text-center flex-1 transition-all duration-300", isActive ? "opacity-100" : "opacity-40")}>
                            <div className={cn("w-full h-1 mb-2 rounded-full transition-all duration-300", isCurrent ? "bg-blue-500" : isActive ? "bg-blue-500" : isDarkMode ? "bg-slate-700" : "bg-slate-200")} />
                            <span className={cn("text-[9px] font-semibold tracking-wider leading-tight uppercase", isCurrent ? "text-slate-900" : "text-slate-400")}>{step.label}</span>
                            <span className={cn("text-[9px] font-semibold tracking-wider leading-tight uppercase", isCurrent ? "text-slate-900" : "text-slate-400")}>{step.subLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <p className={cn("text-sm tracking-widest", mutedTextClasses)}>СТЪПКА 4</p>
                    <button onClick={restart} className="p-2 rounded-full text-slate-400 hover:text-blue-500 hover:bg-slate-100 transition-colors">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-6">Месечен доход</h2>

                  {/* Income inputs side by side */}
                  <div className={cn("grid gap-6 mb-4", familyType === 'family' ? "grid-cols-2" : "grid-cols-1")}>
                    {/* Client Income */}
                    <div>
                      <p className={cn("text-sm font-medium mb-3", mutedTextClasses)}>
                        {familyType === 'family' ? 'КЛИЕНТ' : 'ВАШИЯТ ДОХОД'}
                      </p>
                      <div className="text-center mb-3">
                        <span className="text-3xl font-bold text-blue-500">{formatNumber(monthlyIncome)}</span>
                        <span className={cn("text-lg ml-2", mutedTextClasses)}>лв.</span>
                      </div>
                      <Slider
                        value={[monthlyIncome]}
                        onValueChange={(v) => setMonthlyIncome(v[0])}
                        min={1000}
                        max={30000}
                        step={100}
                        className="mb-2"
                      />
                      <div className={cn("flex justify-between text-xs", mutedTextClasses)}>
                        <span>1 000 лв.</span>
                        <span>30 000 лв.</span>
                      </div>
                    </div>

                    {/* Partner Income (only for family) */}
                    {familyType === 'family' && (
                      <div>
                        <p className={cn("text-sm font-medium mb-3", mutedTextClasses)}>ПАРТНЬОР</p>
                        <div className="text-center mb-3">
                          <span className="text-3xl font-bold text-blue-500">{formatNumber(partnerIncome)}</span>
                          <span className={cn("text-lg ml-2", mutedTextClasses)}>лв.</span>
                        </div>
                        <Slider
                          value={[partnerIncome]}
                          onValueChange={(v) => setPartnerIncome(v[0])}
                          min={1000}
                          max={30000}
                          step={100}
                          className="mb-2"
                        />
                        <div className={cn("flex justify-between text-xs", mutedTextClasses)}>
                          <span>1 000 лв.</span>
                          <span>30 000 лв.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Total (for family) */}
                  {familyType === 'family' && (
                    <div className={cn("p-3 rounded-xl mb-4", isDarkMode ? "bg-slate-800" : "bg-slate-100")}>
                      <div className="flex justify-between items-center">
                        <span className={mutedTextClasses}>Общо месечен доход:</span>
                        <span className="text-xl font-bold text-blue-500">{formatNumber(monthlyIncome + partnerIncome)} лв.</span>
                      </div>
                    </div>
                  )}

                  <Button onClick={goNext} className={cn(primaryButtonClass, "w-full")}>
                      СЛЕДВАЩА СТЪПКА
                    </Button>
                  </div>
                  </motion.div>
                  )}

                  {/* Step 5: Priorities (multi-select) */}
            {currentStep === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-2 gap-8 items-start"
              >
                <div className="lg:pr-12">
                  <p className={cn("text-sm tracking-widest mb-4", accentColor)}>СТЪПКА 5</p>
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">Приоритети</h1>
                  <p className={cn("text-lg mb-6", mutedTextClasses)}>
                    Изберете една или повече посоки, които резонират с Вашите мечти.
                  </p>
                </div>

                <div className={cn("rounded-3xl border p-6", cardClasses)}>
                  {/* Inline Step Tracker */}
                  <div className="mb-6 pb-4 border-b border-slate-100">
                    <div className="flex justify-between items-start">
                      {VISUAL_STEPS.map((step, index) => {
                        const isActive = currentStep >= (index + 1);
                        const isCurrent = index === 4;
                        return (
                          <div key={step.id} className={cn("flex flex-col items-center text-center flex-1 transition-all duration-300", isActive ? "opacity-100" : "opacity-40")}>
                            <div className={cn("w-full h-1 mb-2 rounded-full transition-all duration-300", isCurrent ? "bg-blue-500" : isActive ? "bg-blue-500" : isDarkMode ? "bg-slate-700" : "bg-slate-200")} />
                            <span className={cn("text-[9px] font-semibold tracking-wider leading-tight uppercase", isCurrent ? "text-slate-900" : "text-slate-400")}>{step.label}</span>
                            <span className={cn("text-[9px] font-semibold tracking-wider leading-tight uppercase", isCurrent ? "text-slate-900" : "text-slate-400")}>{step.subLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <p className={cn("text-sm tracking-widest", mutedTextClasses)}>СТЪПКА 5</p>
                    <button onClick={restart} className="p-2 rounded-full text-slate-400 hover:text-blue-500 hover:bg-slate-100 transition-colors">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-2">Основен приоритет</h2>
                  <p className={cn("text-sm mb-4", mutedTextClasses)}>
                    Изберете една или повече посоки, които резонират с Вашите мечти.
                  </p>

                  <div className="grid grid-cols-4 gap-3 mb-6">
                    <button
                      onClick={() => togglePriority('stability')}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col h-full group",
                        selectedPriorities.includes('stability')
                          ? "border-blue-500 bg-blue-600 text-white"
                          : isDarkMode ? "border-slate-700 hover:border-blue-500 hover:bg-blue-600" : "border-slate-200 hover:border-blue-500 hover:bg-blue-600"
                      )}
                    >
                      <h3 className={cn("font-semibold text-sm mb-2 text-center", !selectedPriorities.includes('stability') && "group-hover:text-white")}>Финансова стабилност</h3>
                      <p className={cn("text-xs text-center flex-1", selectedPriorities.includes('stability') ? "text-blue-100" : mutedTextClasses, !selectedPriorities.includes('stability') && "group-hover:text-blue-100")}>
                        Фонд за спокойствие и защита на дохода
                      </p>
                    </button>
                    
                    <button
                      onClick={() => togglePriority('investments')}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col h-full group",
                        selectedPriorities.includes('investments')
                          ? "border-blue-500 bg-blue-600 text-white"
                          : isDarkMode ? "border-slate-700 hover:border-blue-500 hover:bg-blue-600" : "border-slate-200 hover:border-blue-500 hover:bg-blue-600"
                      )}
                    >
                      <h3 className={cn("font-semibold text-sm mb-2 text-center", !selectedPriorities.includes('investments') && "group-hover:text-white")}>Инвестиции</h3>
                      <p className={cn("text-xs text-center flex-1", selectedPriorities.includes('investments') ? "text-blue-100" : mutedTextClasses, !selectedPriorities.includes('investments') && "group-hover:text-blue-100")}>
                        Ускорени инвестиции и възвръщаемост
                      </p>
                    </button>
                    
                    <button
                      onClick={() => togglePriority('children')}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col h-full group",
                        selectedPriorities.includes('children')
                          ? "border-blue-500 bg-blue-600 text-white"
                          : isDarkMode ? "border-slate-700 hover:border-blue-500 hover:bg-blue-600" : "border-slate-200 hover:border-blue-500 hover:bg-blue-600"
                      )}
                    >
                      <h3 className={cn("font-semibold text-sm mb-2 text-center", !selectedPriorities.includes('children') && "group-hover:text-white")}>Бъдеще на децата</h3>
                      <p className={cn("text-xs text-center flex-1", selectedPriorities.includes('children') ? "text-blue-100" : mutedTextClasses, !selectedPriorities.includes('children') && "group-hover:text-blue-100")}>
                        Капитал за бъдещето на децата
                      </p>
                    </button>
                    
                    <button
                      onClick={() => togglePriority('housing')}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col h-full group",
                        selectedPriorities.includes('housing')
                          ? "border-blue-500 bg-blue-600 text-white"
                          : isDarkMode ? "border-slate-700 hover:border-blue-500 hover:bg-blue-600" : "border-slate-200 hover:border-blue-500 hover:bg-blue-600"
                      )}
                    >
                      <h3 className={cn("font-semibold text-sm mb-2 text-center", !selectedPriorities.includes('housing') && "group-hover:text-white")}>Ново жилище</h3>
                      <p className={cn("text-xs text-center flex-1", selectedPriorities.includes('housing') ? "text-blue-100" : mutedTextClasses, !selectedPriorities.includes('housing') && "group-hover:text-blue-100")}>
                        Собственост, ремонт или ново жилище
                      </p>
                    </button>
                  </div>

                  {selectedPriorities.length > 0 && (
                    <p className={cn("text-sm mb-4", accentColor)}>
                      Избрани: {selectedPriorities.length} приоритет{selectedPriorities.length > 1 ? 'а' : ''}
                    </p>
                  )}

                  <Button 
                      onClick={goNext}
                      disabled={selectedPriorities.length === 0}
                      className={cn(primaryButtonClass, "w-full")}
                    >
                      СЛЕДВАЩА СТЪПКА
                    </Button>
                  </div>
                  </motion.div>
                  )}

                  {/* Generating Animation - Fullscreen */}
            {isGenerating && (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"
              >
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div 
                    className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  <motion.div 
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  <motion.div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
                    transition={{ duration: 8, repeat: Infinity }}
                  />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center px-4">
                  {/* Animated icon */}
                  <motion.div
                    className="mb-8 relative"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                  >
                    <motion.div
                      className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/30 flex items-center justify-center"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <motion.div
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/40 to-indigo-500/40 flex items-center justify-center"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 className="w-12 h-12 text-white" />
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </motion.div>

                  {/* Title */}
                  <motion.h2 
                    className="text-3xl md:text-4xl font-bold mb-4 text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Генериране на финансов план
                  </motion.h2>

                  {/* Subtitle */}
                  <motion.p 
                    className="text-blue-200 text-lg mb-8 max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    Анализираме вашите данни и създаваме персонализиран план
                  </motion.p>

                  {/* Progress dots */}
                  <motion.div 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.span
                        key={i}
                        className="w-3 h-3 bg-blue-400 rounded-full"
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [0.3, 1, 0.3] 
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity, 
                          delay: i * 0.2 
                        }}
                      />
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Step 6: Financial Framework - New Layout */}
            {currentStep === 6 && !isGenerating && (
              <motion.div
                key="step-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-6xl mx-auto"
              >
                {/* Inline Step Tracker */}
                <div className={cn("rounded-2xl border p-4 mb-6", cardClasses)}>
                  <div className="flex justify-between items-start">
                    {VISUAL_STEPS.map((step, index) => {
                      const isActive = currentStep >= (index + 1);
                      const isCurrent = index === 5;
                      return (
                        <div key={step.id} className={cn("flex flex-col items-center text-center flex-1 transition-all duration-300", isActive ? "opacity-100" : "opacity-40")}>
                          <div className={cn("w-full h-1 mb-2 rounded-full transition-all duration-300", isCurrent ? "bg-blue-500" : isActive ? "bg-blue-500" : isDarkMode ? "bg-slate-700" : "bg-slate-200")} />
                          <span className={cn("text-[9px] font-semibold tracking-wider leading-tight uppercase", isCurrent ? "text-slate-900" : "text-slate-400")}>{step.label}</span>
                          <span className={cn("text-[9px] font-semibold tracking-wider leading-tight uppercase", isCurrent ? "text-slate-900" : "text-slate-400")}>{step.subLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <h2 className="text-3xl font-bold mb-2 text-center">Вашият оптимален финансов план</h2>
                <p className={cn("text-center mb-6 text-sm", mutedTextClasses)}>
                  Разпределение: {allocations.security + allocations.pension + allocations.housing + allocations.cash}% от дохода
                </p>

                {/* Goals Grid - 4 columns like the image */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {/* Security */}
                  <motion.div 
                    className={cn("rounded-2xl border p-4 text-center relative transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600", cardClasses)}
                    animate={recentlyChanged === 'security' ? { scale: [1, 1.02, 1], borderColor: ['', '#3b82f6', ''] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute top-2 right-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => toggleLock('security')}
                            className={cn(
                              "p-1 rounded-lg transition-colors",
                              lockedGoals.security 
                                ? "bg-blue-100 text-blue-600 group-hover:bg-white group-hover:text-blue-600" 
                                : isDarkMode ? "hover:bg-slate-800 text-slate-500" : "hover:bg-slate-100 text-slate-400 group-hover:text-white group-hover:hover:bg-blue-500"
                            )}
                          >
                            {lockedGoals.security ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>{tooltips.lock}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className={cn("text-[10px] tracking-widest mb-2 group-hover:text-blue-100", mutedTextClasses)}>ФИНАНСОВА СИГУРНОСТ</p>
                    
                    {/* Security Icon based on percentage */}
                    <div className="flex justify-center mb-2">
                      {allocations.security <= 3 ? (
                        <ShieldAlert className={cn("w-8 h-8 text-red-400 group-hover:text-red-200")} />
                      ) : allocations.security <= 20 ? (
                        <Shield className={cn("w-8 h-8 text-emerald-500 group-hover:text-emerald-200")} />
                      ) : (
                        <ShieldCheck className={cn("w-8 h-8 text-blue-500 group-hover:text-blue-200")} />
                      )}
                    </div>
                    
                    <motion.p 
                      className="text-2xl md:text-3xl font-bold mb-1 group-hover:text-white"
                      key={calculateGoals.security}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {formatNumber(calculateGoals.security)}
                    </motion.p>
                    <p className={cn("text-xs mb-3 group-hover:text-blue-200", accentColor)}>{allocations.security}%</p>
                    <Slider
                      value={[allocations.security]}
                      onValueChange={(v) => handleAllocationChange('security', v[0])}
                      min={0}
                      max={50}
                      step={1}
                      className="mb-2"
                    />
                    <p className={cn("text-[10px] mt-1 group-hover:text-blue-100", mutedTextClasses)}>Резерв за {Math.round((allocations.security / 10) * 6)} месеца</p>
                  </motion.div>

                  {/* Pension */}
                  <motion.div 
                    className={cn("rounded-2xl border p-4 text-center relative transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600", cardClasses)}
                    animate={recentlyChanged === 'pension' ? { scale: [1, 1.02, 1], borderColor: ['', '#3b82f6', ''] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute top-2 right-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => toggleLock('pension')}
                            className={cn(
                              "p-1 rounded-lg transition-colors",
                              lockedGoals.pension 
                                ? "bg-blue-100 text-blue-600 group-hover:bg-white group-hover:text-blue-600" 
                                : isDarkMode ? "hover:bg-slate-800 text-slate-500" : "hover:bg-slate-100 text-slate-400 group-hover:text-white group-hover:hover:bg-blue-500"
                            )}
                          >
                            {lockedGoals.pension ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>{tooltips.lock}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className={cn("text-[10px] tracking-widest mb-2 group-hover:text-blue-100", mutedTextClasses)}>ПЕНСИЯ</p>
                    
                    {/* Pension Icon based on percentage */}
                    <div className="flex justify-center mb-2">
                      {allocations.pension <= 2 ? (
                        <Frown className={cn("w-8 h-8 text-red-400 group-hover:text-red-200")} />
                      ) : allocations.pension <= 10 ? (
                        <Smile className={cn("w-8 h-8 text-emerald-500 group-hover:text-emerald-200")} />
                      ) : (
                        <PartyPopper className={cn("w-8 h-8 text-amber-500 group-hover:text-amber-200")} />
                      )}
                    </div>
                    
                    <motion.p 
                      className="text-2xl md:text-3xl font-bold mb-1 group-hover:text-white"
                      key={calculateGoals.pension}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {formatNumber(calculateGoals.pension)}
                    </motion.p>
                    <p className={cn("text-xs mb-3 group-hover:text-blue-200", accentColor)}>{allocations.pension}%</p>
                    <Slider
                      value={[allocations.pension]}
                      onValueChange={(v) => handleAllocationChange('pension', v[0])}
                      min={0}
                      max={25}
                      step={1}
                      className="mb-2"
                    />
                    <p className={cn("text-[10px] mt-1 group-hover:text-blue-100", mutedTextClasses)}>лв./месец при пенсия</p>
                  </motion.div>

                  {/* Housing */}
                  <motion.div 
                    className={cn("rounded-2xl border p-4 text-center relative transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600", cardClasses)}
                    animate={recentlyChanged === 'housing' ? { scale: [1, 1.02, 1], borderColor: ['', '#3b82f6', ''] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute top-2 right-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => toggleLock('housing')}
                            className={cn(
                              "p-1 rounded-lg transition-colors",
                              lockedGoals.housing 
                                ? "bg-blue-100 text-blue-600 group-hover:bg-white group-hover:text-blue-600" 
                                : isDarkMode ? "hover:bg-slate-800 text-slate-500" : "hover:bg-slate-100 text-slate-400 group-hover:text-white group-hover:hover:bg-blue-500"
                            )}
                          >
                            {lockedGoals.housing ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>{tooltips.lock}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className={cn("text-[10px] tracking-widest mb-2 group-hover:text-blue-100", mutedTextClasses)}>ЖИЛИЩЕ</p>
                    
                    {/* Housing Icon based on value */}
                    <div className="flex justify-center mb-2">
                      {calculateGoals.housing >= 100000 ? (
                        <Home className={cn("w-8 h-8 text-emerald-500 group-hover:text-emerald-200")} />
                      ) : (
                        <HomeIcon className={cn("w-8 h-8 text-slate-400 group-hover:text-slate-200")} />
                      )}
                    </div>
                    
                    <motion.p 
                      className="text-2xl md:text-3xl font-bold mb-1 group-hover:text-white"
                      key={calculateGoals.housing}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {formatNumber(calculateGoals.housing)}
                    </motion.p>
                    <p className={cn("text-xs mb-3 group-hover:text-blue-200", accentColor)}>{allocations.housing}%</p>
                    <Slider
                      value={[allocations.housing]}
                      onValueChange={(v) => handleAllocationChange('housing', v[0])}
                      min={0}
                      max={50}
                      step={1}
                      className="mb-2"
                    />
                    <p className={cn("text-[10px] mt-1 group-hover:text-blue-100", mutedTextClasses)}>Кредит {calculateGoals.loanTerm}г. @ 3%</p>
                  </motion.div>

                  {/* Other Goals */}
                  <motion.div 
                    className={cn("rounded-2xl border p-4 text-center relative transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600", cardClasses)}
                    animate={recentlyChanged === 'cash' ? { scale: [1, 1.02, 1], borderColor: ['', '#3b82f6', ''] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute top-2 right-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => toggleLock('cash')}
                            className={cn(
                              "p-1 rounded-lg transition-colors",
                              lockedGoals.cash 
                                ? "bg-blue-100 text-blue-600 group-hover:bg-white group-hover:text-blue-600" 
                                : isDarkMode ? "hover:bg-slate-800 text-slate-500" : "hover:bg-slate-100 text-slate-400 group-hover:text-white group-hover:hover:bg-blue-500"
                            )}
                          >
                            {lockedGoals.cash ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>{tooltips.lock}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className={cn("text-[10px] tracking-widest mb-2 group-hover:text-blue-100", mutedTextClasses)}>ДРУГИ ЦЕЛИ</p>
                    
                    {/* Other Goals Icon based on percentage */}
                    <div className="flex justify-center mb-2">
                      {allocations.cash === 0 ? (
                        <Baby className={cn("w-8 h-8 text-amber-400 group-hover:text-amber-200")} />
                      ) : allocations.cash <= 2 ? (
                        <Car className={cn("w-8 h-8 text-blue-500 group-hover:text-blue-200")} />
                      ) : (
                        <GraduationCap className={cn("w-8 h-8 text-violet-500 group-hover:text-violet-200")} />
                      )}
                    </div>
                    
                    <motion.p 
                      className="text-2xl md:text-3xl font-bold mb-1 group-hover:text-white"
                      key={calculateGoals.cash}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {formatNumber(calculateGoals.cash)}
                    </motion.p>
                    <p className={cn("text-xs mb-3 group-hover:text-blue-200", accentColor)}>{allocations.cash}%</p>
                    <Slider
                      value={[allocations.cash]}
                      onValueChange={(v) => handleAllocationChange('cash', v[0])}
                      min={0}
                      max={25}
                      step={1}
                      className="mb-2"
                    />
                    <p className={cn("text-[10px] mt-1 group-hover:text-blue-100", mutedTextClasses)}>Капитал до пенсия</p>
                  </motion.div>
                </div>

                {/* Total Wealth - Bottom Center */}
                <div className={cn("rounded-2xl border p-4 text-center max-w-sm mx-auto mb-4 relative group transition-all duration-300 hover:border-blue-500 hover:bg-blue-600", cardClasses)}>
                  <p className={cn("text-[10px] tracking-widest mb-1 group-hover:text-blue-100", mutedTextClasses)}>ИМУЩЕСТВОТО ОБЩО</p>
                  <motion.p 
                    className="text-3xl md:text-4xl font-bold group-hover:text-white"
                    key={calculateGoals.totalWealth}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {formatNumber(calculateGoals.totalWealth)} BGN
                  </motion.p>
                </div>

                {/* Continue button */}
                <div className="text-center">
                  <Button 
                    onClick={goNext}
                    className={primaryButtonClass}
                  >
                    Искам да продължа
                  </Button>
                </div>
                </motion.div>
                )}

            {/* Step 7: Work System */}
            {currentStep === 7 && (
              <motion.div
                key="step-7"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto"
              >
                <div className={cn("rounded-3xl border p-6 md:p-8", cardClasses)}>
                  {/* Inline Step Tracker */}
                  <div className="mb-6 pb-4 border-b border-slate-100">
                    <div className="flex justify-between items-start">
                      {VISUAL_STEPS.map((step, index) => {
                        const isActive = currentStep >= (index + 1);
                        const isCurrent = index === 6;
                        return (
                          <div key={step.id} className={cn("flex flex-col items-center text-center flex-1 transition-all duration-300", isActive ? "opacity-100" : "opacity-40")}>
                            <div className={cn("w-full h-1 mb-2 rounded-full transition-all duration-300", isCurrent ? "bg-blue-500" : isActive ? "bg-blue-500" : isDarkMode ? "bg-slate-700" : "bg-slate-200")} />
                            <span className={cn("text-[9px] font-semibold tracking-wider leading-tight uppercase", isCurrent ? "text-slate-900" : "text-slate-400")}>{step.label}</span>
                            <span className={cn("text-[9px] font-semibold tracking-wider leading-tight uppercase", isCurrent ? "text-slate-900" : "text-slate-400")}>{step.subLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold mb-4">Система на работа</h2>
                  <p className={cn("text-sm mb-6 max-w-2xl", mutedTextClasses)}>
                    Нашият структуриран подход гарантира, че всяка стъпка от финансовото планиране 
                    е ясна, прозрачна и насочена към постигане на Вашите цели.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className={cn("rounded-2xl border p-5 transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <p className={cn("text-xs tracking-widest mb-2 group-hover:text-blue-100", mutedTextClasses)}>ФАЗА 1</p>
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-white">Анализ</h3>
                      <p className="text-blue-400 text-sm mb-2 group-hover:text-blue-200">Нужди, цели, желания</p>
                      <p className={cn("text-sm group-hover:text-blue-100", mutedTextClasses)}>
                        Анализираме целите на клиента, за да намерим най-подходящите 
                        финансови решения за неговия живот.
                      </p>
                    </div>

                    <div className={cn("rounded-2xl border p-5 transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <p className={cn("text-xs tracking-widest mb-2 group-hover:text-blue-100", mutedTextClasses)}>ФАЗА 2</p>
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-white">Оптимизация</h3>
                      <p className="text-blue-400 text-sm mb-2 group-hover:text-blue-200">Подготовка на финансовия план</p>
                      <p className={cn("text-sm group-hover:text-blue-100", mutedTextClasses)}>
                        Разглеждаме вече съществуващи финансови продукти и решения 
                        с цел оптимизация и спестяване на излишни разходи.
                      </p>
                    </div>

                    <div className={cn("rounded-2xl border p-5 transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <p className={cn("text-xs tracking-widest mb-2 group-hover:text-blue-100", mutedTextClasses)}>ФАЗА 3</p>
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-white">Представяне</h3>
                      <p className="text-blue-400 text-sm mb-2 group-hover:text-blue-200">Финансовият план и реализацията</p>
                      <p className={cn("text-sm group-hover:text-blue-100", mutedTextClasses)}>
                        Представяме финансовия план и привеждаме в действие 
                        предложените финансови решения.
                      </p>
                    </div>

                    <div className={cn("rounded-2xl border p-5 transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <p className={cn("text-xs tracking-widest mb-2 group-hover:text-blue-100", mutedTextClasses)}>ФАЗА 4</p>
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-white">Дългосрочно обслужване</h3>
                      <p className="text-blue-400 text-sm mb-2 group-hover:text-blue-200">Дългосрочно и редовно</p>
                      <p className={cn("text-sm group-hover:text-blue-100", mutedTextClasses)}>
                        Осигуряваме постоянна подкрепа чрез редовни срещи, 
                        актуализации на плана и навременни корекции при нужда.
                      </p>
                    </div>
                  </div>

                  <Button 
                    onClick={goNext}
                    className={cn(primaryButtonClass, "w-full")}
                  >
                    Напред
                  </Button>
                  </div>
                  </motion.div>
                  )}

                  {/* Step 8: Cooperation Rules */}
            {currentStep === 8 && (
              <motion.div
                key="step-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto"
              >
                <div className={cn("rounded-3xl border p-6 md:p-8", cardClasses)}>
                  {/* Inline Step Tracker */}
                  <div className="mb-6 pb-4 border-b border-slate-100">
                    <div className="flex justify-between items-start">
                      {VISUAL_STEPS.map((step, index) => {
                        const isActive = currentStep >= (index + 1);
                        const isCurrent = index === 7;
                        return (
                          <div key={step.id} className={cn("flex flex-col items-center text-center flex-1 transition-all duration-300", isActive ? "opacity-100" : "opacity-40")}>
                            <div className={cn("w-full h-1 mb-2 rounded-full transition-all duration-300", isCurrent ? "bg-blue-500" : isActive ? "bg-blue-500" : isDarkMode ? "bg-slate-700" : "bg-slate-200")} />
                            <span className={cn("text-[9px] font-semibold tracking-wider leading-tight uppercase", isCurrent ? "text-slate-900" : "text-slate-400")}>{step.label}</span>
                            <span className={cn("text-[9px] font-semibold tracking-wider leading-tight uppercase", isCurrent ? "text-slate-900" : "text-slate-400")}>{step.subLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold mb-4">Правила за сътрудничество</h2>
                  <p className={cn("text-sm mb-6 max-w-2xl", mutedTextClasses)}>
                    Нашите принципи на работа гарантират професионализъм и доверие във всяка стъпка от процеса.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className={cn("rounded-2xl border p-5 transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <p className={cn("text-xs tracking-widest mb-2 group-hover:text-blue-100", mutedTextClasses)}>ПРАВИЛО 1</p>
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-white">Дискретност</h3>
                      <p className="text-blue-400 text-sm mb-2 group-hover:text-blue-200">Пълна конфиденциалност</p>
                      <p className={cn("text-sm group-hover:text-blue-100", mutedTextClasses)}>
                        Вашите лични и финансови данни са напълно защитени. 
                        Никога не споделяме информация с трети страни без вашето изрично съгласие.
                      </p>
                    </div>

                    <div className={cn("rounded-2xl border p-5 transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <p className={cn("text-xs tracking-widest mb-2 group-hover:text-blue-100", mutedTextClasses)}>ПРАВИЛО 2</p>
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-white">Коректност</h3>
                      <p className="text-blue-400 text-sm mb-2 group-hover:text-blue-200">Честни взаимоотношения</p>
                      <p className={cn("text-sm group-hover:text-blue-100", mutedTextClasses)}>
                        Работим с ясни правила и спазваме всички договорености. 
                        Вашият интерес е винаги на първо място в нашите препоръки.
                      </p>
                    </div>

                    <div className={cn("rounded-2xl border p-5 transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <p className={cn("text-xs tracking-widest mb-2 group-hover:text-blue-100", mutedTextClasses)}>ПРАВИЛО 3</p>
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-white">Прозрачност</h3>
                      <p className="text-blue-400 text-sm mb-2 group-hover:text-blue-200">Открита комуникация</p>
                      <p className={cn("text-sm group-hover:text-blue-100", mutedTextClasses)}>
                        Обясняваме всяка стъпка и решение. Няма скрити условия или 
                        неясни такси - всичко е ясно от самото начало.
                      </p>
                    </div>

                    <div className={cn("rounded-2xl border p-5 transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <p className={cn("text-xs tracking-widest mb-2 group-hover:text-blue-100", mutedTextClasses)}>ПРАВИЛО 4</p>
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-white">Възнаграждение</h3>
                      <p className="text-blue-400 text-sm mb-2 group-hover:text-blue-200">Без директни такси от клиенти</p>
                      <p className={cn("text-sm group-hover:text-blue-100", mutedTextClasses)}>
                        Не получаваме директно заплащане от вас. Възнаграждението ни идва от 
                        финансовите институции под формата на комисионна за посредничество.
                      </p>
                    </div>
                  </div>

                  <Button 
                    onClick={goNext}
                    className={cn(primaryButtonClass, "w-full")}
                  >
                    Напред
                  </Button>
                  </div>
                  </motion.div>
                  )}

                  {/* Step 9: Final / Redirect */}
            {currentStep === 9 && (
              <motion.div
                key="step-9"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto text-center"
              >
                {/* Inline Step Tracker */}
                <div className={cn("rounded-2xl border p-4 mb-6", cardClasses)}>
                  <div className="flex justify-between items-start">
                    {VISUAL_STEPS.map((step, index) => {
                      const isActive = index <= 8;
                      const isCurrent = index === 8;
                      return (
                        <div key={step.id} className={cn("flex flex-col items-center text-center flex-1 transition-all duration-300", isActive ? "opacity-100" : "opacity-40")}>
                          <div className={cn("w-full h-1 mb-2 rounded-full transition-all duration-300", isCurrent ? "bg-blue-500" : isActive ? "bg-blue-500" : isDarkMode ? "bg-slate-700" : "bg-slate-200")} />
                          <span className={cn("text-[9px] font-semibold tracking-wider leading-tight uppercase", isCurrent ? "text-slate-900" : "text-slate-400")}>{step.label}</span>
                          <span className={cn("text-[9px] font-semibold tracking-wider leading-tight uppercase", isCurrent ? "text-slate-900" : "text-slate-400")}>{step.subLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={cn("rounded-3xl border p-12", cardClasses)}>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  <h2 className="text-3xl font-bold mb-4">Готови сте!</h2>
                  <p className={cn("text-lg mb-8", mutedTextClasses)}>
                    Вече знаете какъв е вашият финансов потенциал. Нека преминем към детайлния анализ!
                  </p>

                  <div className="space-y-4">
                    <Link to={createPageUrl('FinancialAnalysis')}>
                      <Button className="w-full rounded-full py-6 text-lg bg-blue-600 hover:bg-blue-700">
                        Към финансовия анализ
                      </Button>
                    </Link>
                    
                    <Button 
                      variant="outline" 
                      onClick={restart}
                      className={cn("w-full", outlineButtonClass)}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Започни отначало
                    </Button>
                    </div>
                    </div>
                    </motion.div>
                    )}

                    </AnimatePresence>
                    </div>
                    </div>
                    </div>
                    </TooltipProvider>
                    );
                    }