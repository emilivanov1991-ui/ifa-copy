import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { RotateCcw, Loader2, Lock, Unlock, HelpCircle, ArrowLeft, ShieldAlert, Shield, ShieldCheck, Frown, Smile, PartyPopper, Home, HomeIcon, Car, GraduationCap, Wallet, TrendingUp, Briefcase, Baby, PiggyBank, Plane, Heart, Target, CheckCircle2, Calendar, Users, FileText, Info, User, XCircle, ArrowRight, Sparkles, ChevronDown, Search, Settings, Presentation, Handshake, Eye, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';
import GuideAvatar from '@/components/GuideAvatar';
import { useVoiceManager } from '@/components/voice/VoiceManager';
import PlannerStep1 from '@/components/planner/PlannerStep1';
import PlannerStep2 from '@/components/planner/PlannerStep2';
import { PlannerStep3, PlannerStep4, PlannerStep5 } from '@/components/planner/PlannerSteps345';
import PlannerStep7 from '@/components/planner/PlannerStep7';
import PlannerStep8 from '@/components/planner/PlannerStep8';
import PlannerStep9 from '@/components/planner/PlannerStep9';
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

// All calculations now in EUR directly (no BGN conversion needed)
// State pension: 60% of income, min 320€, max 1740€ per person
const calculateStatePension = (clientIncome, partnerIncome, clientIsEntrepreneur, partnerIsEntrepreneur, isFamily) => {
  const minPension = 320; // EUR
  const maxPension = 1740; // EUR
  
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
  
  // Round to 10
  return Math.round((clientPension + partnerPension) / 10) * 10;
};

// Round to nearest 100
const roundTo100 = (value) => Math.round(value / 100) * 100;

// Round to nearest 10
const roundTo10 = (value) => Math.round(value / 10) * 10;

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
      
      // Hide intro after 13.5 seconds total (4 + 2 + 2 + 5.5)
      const hideTimer = setTimeout(() => {
        setShowIntroAnimation(false);
      }, 13500);
      
      return () => {
        clearTimeout(textTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [showIntroAnimation]);
  
  // Data states
  const [familyType, setFamilyType] = useState(null); // 'individual' | 'family'
  const [clientFirstName, setClientFirstName] = useState('');
  const [clientLastName, setClientLastName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [partnerFirstName, setPartnerFirstName] = useState('');
  const [partnerLastName, setPartnerLastName] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [childrenCount, setChildrenCount] = useState(0);
  const [childrenNames, setChildrenNames] = useState([]);
  const [clientInsuranceType, setClientInsuranceType] = useState(null); // 'employee' | 'entrepreneur'
  const [partnerInsuranceType, setPartnerInsuranceType] = useState(null); // 'employee' | 'entrepreneur'
  const [clientAge, setClientAge] = useState(35);
  const [partnerAge, setPartnerAge] = useState(35);
  const [childrenAges, setChildrenAges] = useState([]);
  const [monthlyIncome, setMonthlyIncome] = useState(1000); // EUR
  const [selectedPriorities, setSelectedPriorities] = useState([]); // multi-select
  const [partnerIncome, setPartnerIncome] = useState(1000); // EUR
  
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

  const { playStep, stop, avatarState, isPlaying, currentText } = useVoiceManager('bg');

  const [isGenerating, setIsGenerating] = useState(false);
  const [recentlyChanged, setRecentlyChanged] = useState(null);
  
  // Consent states for step 9
  const [gdprConsentA, setGdprConsentA] = useState(false);
  const [gdprConsentB, setGdprConsentB] = useState(false);
  const [gdprConsentC, setGdprConsentC] = useState(false);
  
  // Client ID for resuming
  const [clientId, setClientId] = useState(null);
  
  // Email validation and touched state
  const [clientEmailTouched, setClientEmailTouched] = useState(false);
  const [partnerEmailTouched, setPartnerEmailTouched] = useState(false);
  
  // GDPR text open state
  const [gdprTextOpen, setGdprTextOpen] = useState(false);
  
  const isValidEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Derived values (handle empty string values)
  const clientIncomeNum = typeof monthlyIncome === 'number' ? monthlyIncome : 400;
  const partnerIncomeNum = typeof partnerIncome === 'number' ? partnerIncome : 400;
  const clientAgeNum = typeof clientAge === 'number' ? clientAge : 35;
  const partnerAgeNum = typeof partnerAge === 'number' ? partnerAge : 35;
  
  const totalIncome = familyType === 'family' ? clientIncomeNum + partnerIncomeNum : clientIncomeNum;
  const avgAge = familyType === 'family' ? (clientAgeNum + partnerAgeNum) / 2 : clientAgeNum;
  const yearsToRetirement = Math.max(0, 65 - avgAge);
  const numPeople = familyType === 'family' ? 2 : 1;

  // Calculate financial values based on allocations (all in EUR)
  const calculateGoals = useMemo(() => {
    const securityPercent = allocations.security;
    const pensionPercent = allocations.pension;
    const housingPercent = allocations.housing;
    const cashPercent = allocations.cash;

    // 1. Reserve = 6 months of total income (scaled by percentage)
    // At 10% allocation -> 6 months of income
    // At 50% allocation -> 30 months of income (5x)
    // At 0% allocation -> 0
    const reserveMonths = (securityPercent / 10) * 6;
    const securityValue = roundTo100(totalIncome * reserveMonths);

    // 2. Pension calculation (all in EUR)
    // pensionPercent% of income invested monthly at 8% until retirement
    // Then moved to 3% fund and withdrawn over 20 years
    const monthlyPensionInvestment = totalIncome * (pensionPercent / 100);
    const pensionFundAtRetirement = calculateFutureValue(monthlyPensionInvestment, 0.08, yearsToRetirement);
    const monthlyPensionFromFund = calculateAnnuityPayment(pensionFundAtRetirement, 0.03, 20);
    const statePension = calculateStatePension(
      familyType === 'family' ? clientIncomeNum : totalIncome,
      partnerIncomeNum,
      clientInsuranceType === 'entrepreneur',
      partnerInsuranceType === 'entrepreneur',
      familyType === 'family'
    );
    // Both values now in EUR
    const totalMonthlyPension = roundTo10(monthlyPensionFromFund + statePension);

    // 3. Housing calculation (all in EUR)
    // housingPercent% of income goes to mortgage payment
    // 3% interest, max 30 year term (adjusted if age + term > 70)
    const maxLoanTerm = Math.min(30, Math.max(5, 70 - avgAge));
    const monthlyMortgagePayment = totalIncome * (housingPercent / 100);
    const loanAmount = calculateLoanAmount(monthlyMortgagePayment, 0.03, maxLoanTerm);
    // Loan is 85% of property value, so property = loan / 0.85 = loan * 1.176
    const housingValue = roundTo100(loanAmount * 1.176);

    // 4. Other goals calculation (all in EUR)
    // cashPercent% of income invested monthly at 5% until retirement
    const monthlyOtherInvestment = totalIncome * (cashPercent / 100);
    const otherGoalsValue = roundTo100(calculateFutureValue(monthlyOtherInvestment, 0.05, yearsToRetirement));

    // Total wealth = Reserve + Pension Fund at retirement + Housing Value + Other Goals (all in EUR)
    const pensionFundRounded = roundTo100(pensionFundAtRetirement);
    const totalWealth = securityValue + pensionFundRounded + housingValue + otherGoalsValue;

    return {
      security: securityValue,
      pension: totalMonthlyPension, // This shows monthly pension income in EUR
      pensionFund: pensionFundRounded, // For total wealth calculation
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

  // Play voice for current step
  useEffect(() => {
    if (!showIntroAnimation && !isGenerating) {
      playStep(`planner_step_${currentStep}`);
    }
  }, [currentStep, showIntroAnimation, isGenerating]);

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
    setClientFirstName('');
    setClientLastName('');
    setClientPhone('');
    setClientEmail('');
    setPartnerFirstName('');
    setPartnerLastName('');
    setPartnerPhone('');
    setPartnerEmail('');
    setChildrenCount(0);
    setChildrenNames([]);
    setChildrenAges([]);
    setClientInsuranceType(null);
    setPartnerInsuranceType(null);
    setClientAge(35);
    setPartnerAge(35);
    setMonthlyIncome(1000);
    setPartnerIncome(1000);
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

  // Theme classes - Enhanced blue palette
  const themeClasses = isDarkMode 
    ? 'bg-slate-950 text-white' 
    : 'bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 text-slate-900';

  const cardClasses = isDarkMode
    ? 'bg-slate-900/80 border-slate-800'
    : 'bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-xl shadow-blue-100/50';

  const mutedTextClasses = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const accentColor = 'text-blue-600';

  // Common button styles - Enhanced
  const primaryButtonClass = "rounded-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95";
  const outlineButtonClass = cn("rounded-full px-6 font-medium transition-all duration-200 border-2", isDarkMode ? "border-slate-700 hover:bg-slate-800" : "border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300");

  // Load from URL params if resuming
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resumeClientId = urlParams.get('client_id');
    
    if (resumeClientId) {
      // Load client data and jump to step 9
      base44.entities.Client.filter({ id: resumeClientId }).then(clients => {
        if (clients.length > 0) {
          const client = clients[0];
          setClientId(client.id);
          setFamilyType(client.family_type);
          setClientFirstName(client.first_name);
          setClientLastName(client.last_name);
          setClientPhone(client.phone || '');
          setClientEmail(client.email || '');
          setPartnerFirstName(client.partner_first_name || '');
          setPartnerLastName(client.partner_last_name || '');
          setPartnerEmail(client.partner_email || '');
          setChildrenCount(client.children_count || 0);
          setChildrenNames(client.children_names || []);
          setChildrenAges(client.children_ages || []);
          setCurrentStep(9);
        }
      });
    }
  }, []);

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
            {/* Diagonal lines animation - Many lines across entire screen */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Wave 1: Before text (0-4s) - Bottom right to top left */}
              {Array.from({ length: 12 }).map((_, i) => {
                const strokeWidth = 4 + Math.random() * 10;
                const length = 200 + Math.random() * 200;
                const delay = Math.random() * 0.5;
                const topPos = Math.random() * 100;
                const leftPos = Math.random() * 100;
                return (
                  <motion.svg
                    key={`w1-br-${i}`}
                    className="absolute"
                    width={length}
                    height={length}
                    viewBox={`0 0 ${length} ${length}`}
                    initial={{ x: '120vw', y: '120vh' }}
                    animate={{ x: '-120vw', y: '-120vh' }}
                    transition={{ duration: 3 + Math.random() * 2, delay: delay, ease: "linear" }}
                    style={{ position: 'absolute', top: `${topPos}%`, left: `${leftPos}%` }}
                  >
                    <line x1={length} y1={length} x2={length * 0.1} y2={length * 0.1} stroke="white" strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.3 + Math.random() * 0.5} />
                    <polygon points={`${length * 0.1},${length * 0.1} ${length * 0.05},${length * 0.15} ${length * 0.15},${length * 0.05}`} fill="white" opacity={0.3 + Math.random() * 0.5} />
                  </motion.svg>
                );
              })}
              {/* Wave 1: Top left to bottom right */}
              {Array.from({ length: 12 }).map((_, i) => {
                const strokeWidth = 4 + Math.random() * 10;
                const length = 200 + Math.random() * 200;
                const delay = Math.random() * 0.5;
                const topPos = Math.random() * 100;
                const rightPos = Math.random() * 100;
                return (
                  <motion.svg
                    key={`w1-tl-${i}`}
                    className="absolute"
                    width={length}
                    height={length}
                    viewBox={`0 0 ${length} ${length}`}
                    initial={{ x: '-120vw', y: '-120vh' }}
                    animate={{ x: '120vw', y: '120vh' }}
                    transition={{ duration: 3 + Math.random() * 2, delay: delay, ease: "linear" }}
                    style={{ position: 'absolute', top: `${topPos}%`, right: `${rightPos}%` }}
                  >
                    <line x1={0} y1={0} x2={length * 0.9} y2={length * 0.9} stroke="white" strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.3 + Math.random() * 0.4} />
                    <polygon points={`${length * 0.9},${length * 0.9} ${length * 0.85},${length * 0.95} ${length * 0.95},${length * 0.85}`} fill="white" opacity={0.3 + Math.random() * 0.4} />
                  </motion.svg>
                );
              })}

              {/* Wave 2: Behind text (4-8s) */}
              {Array.from({ length: 12 }).map((_, i) => {
                const strokeWidth = 4 + Math.random() * 10;
                const length = 200 + Math.random() * 200;
                const delay = 4 + Math.random() * 0.5;
                const topPos = Math.random() * 100;
                const leftPos = Math.random() * 100;
                return (
                  <motion.svg
                    key={`w2-br-${i}`}
                    className="absolute"
                    width={length}
                    height={length}
                    viewBox={`0 0 ${length} ${length}`}
                    initial={{ x: '120vw', y: '120vh' }}
                    animate={{ x: '-120vw', y: '-120vh' }}
                    transition={{ duration: 3 + Math.random() * 2, delay: delay, ease: "linear" }}
                    style={{ position: 'absolute', top: `${topPos}%`, left: `${leftPos}%` }}
                  >
                    <line x1={length} y1={length} x2={length * 0.1} y2={length * 0.1} stroke="white" strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.2 + Math.random() * 0.4} />
                    <polygon points={`${length * 0.1},${length * 0.1} ${length * 0.05},${length * 0.15} ${length * 0.15},${length * 0.05}`} fill="white" opacity={0.2 + Math.random() * 0.4} />
                  </motion.svg>
                );
              })}
              {Array.from({ length: 12 }).map((_, i) => {
                const strokeWidth = 4 + Math.random() * 10;
                const length = 200 + Math.random() * 200;
                const delay = 4 + Math.random() * 0.5;
                const topPos = Math.random() * 100;
                const rightPos = Math.random() * 100;
                return (
                  <motion.svg
                    key={`w2-tl-${i}`}
                    className="absolute"
                    width={length}
                    height={length}
                    viewBox={`0 0 ${length} ${length}`}
                    initial={{ x: '-120vw', y: '-120vh' }}
                    animate={{ x: '120vw', y: '120vh' }}
                    transition={{ duration: 3 + Math.random() * 2, delay: delay, ease: "linear" }}
                    style={{ position: 'absolute', top: `${topPos}%`, right: `${rightPos}%` }}
                  >
                    <line x1={0} y1={0} x2={length * 0.9} y2={length * 0.9} stroke="white" strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.2 + Math.random() * 0.3} />
                    <polygon points={`${length * 0.9},${length * 0.9} ${length * 0.85},${length * 0.95} ${length * 0.95},${length * 0.85}`} fill="white" opacity={0.2 + Math.random() * 0.3} />
                  </motion.svg>
                );
              })}

              {/* Wave 3: Behind text (8-12s) */}
              {Array.from({ length: 12 }).map((_, i) => {
                const strokeWidth = 4 + Math.random() * 10;
                const length = 200 + Math.random() * 200;
                const delay = 8 + Math.random() * 0.5;
                const topPos = Math.random() * 100;
                const leftPos = Math.random() * 100;
                return (
                  <motion.svg
                    key={`w3-br-${i}`}
                    className="absolute"
                    width={length}
                    height={length}
                    viewBox={`0 0 ${length} ${length}`}
                    initial={{ x: '120vw', y: '120vh' }}
                    animate={{ x: '-120vw', y: '-120vh' }}
                    transition={{ duration: 3 + Math.random() * 2, delay: delay, ease: "linear" }}
                    style={{ position: 'absolute', top: `${topPos}%`, left: `${leftPos}%` }}
                  >
                    <line x1={length} y1={length} x2={length * 0.1} y2={length * 0.1} stroke="white" strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.2 + Math.random() * 0.35} />
                    <polygon points={`${length * 0.1},${length * 0.1} ${length * 0.05},${length * 0.15} ${length * 0.15},${length * 0.05}`} fill="white" opacity={0.2 + Math.random() * 0.35} />
                  </motion.svg>
                );
              })}
              {Array.from({ length: 12 }).map((_, i) => {
                const strokeWidth = 4 + Math.random() * 10;
                const length = 200 + Math.random() * 200;
                const delay = 8 + Math.random() * 0.5;
                const topPos = Math.random() * 100;
                const rightPos = Math.random() * 100;
                return (
                  <motion.svg
                    key={`w3-tl-${i}`}
                    className="absolute"
                    width={length}
                    height={length}
                    viewBox={`0 0 ${length} ${length}`}
                    initial={{ x: '-120vw', y: '-120vh' }}
                    animate={{ x: '120vw', y: '120vh' }}
                    transition={{ duration: 3 + Math.random() * 2, delay: delay, ease: "linear" }}
                    style={{ position: 'absolute', top: `${topPos}%`, right: `${rightPos}%` }}
                  >
                    <line x1={0} y1={0} x2={length * 0.9} y2={length * 0.9} stroke="white" strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.2 + Math.random() * 0.25} />
                    <polygon points={`${length * 0.9},${length * 0.9} ${length * 0.85},${length * 0.95} ${length * 0.95},${length * 0.85}`} fill="white" opacity={0.2 + Math.random() * 0.25} />
                  </motion.svg>
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
                    transition={{ duration: 0.6, delay: 2.3, ease: "easeOut" }}
                  >
                    Да планираме Вашето финансово бъдеще заедно!
                  </motion.p>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Guide Avatar — top-left, follows current step */}
      {!showIntroAnimation && !isGenerating && (
        <GuideAvatar
          state={avatarState}
          isActive={isPlaying}
          tooltip={currentText || (currentStep <= 5 ? 'Вашият финансов водач' : 'Анализираме данните ви')}
        />
      )}

      {/* Global Back Button - Enhanced */}
      {currentStep > 1 && !isGenerating && (
        <motion.button
          onClick={goBack}
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "fixed top-6 left-6 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl group",
            isDarkMode 
              ? "bg-slate-800 hover:bg-slate-700 text-white shadow-slate-900/50" 
              : "bg-white hover:bg-blue-50 text-slate-700 border-2 border-slate-200 hover:border-blue-400 shadow-blue-200/50"
          )}
        >
          <ArrowLeft className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
        </motion.button>
      )}

      {/* Return to Consultant Portal Button */}
      <motion.button
        onClick={() => window.location.href = createPageUrl('ConsultantPortal')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "fixed top-6 right-6 z-50 px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 shadow-xl group",
          isDarkMode 
            ? "bg-slate-800 hover:bg-slate-700 text-white shadow-slate-900/50" 
            : "bg-white hover:bg-blue-50 text-slate-700 border-2 border-slate-200 hover:border-blue-400 shadow-blue-200/50"
        )}
      >
        <Briefcase className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
        <span className="text-sm font-medium group-hover:text-blue-600 transition-colors">Консултантски портал</span>
      </motion.button>

      {/* Main Content */}
      <div className="h-full overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-7xl mx-auto h-full flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <PlannerStep1 
                VISUAL_STEPS={VISUAL_STEPS} 
                currentStep={currentStep} 
                isDarkMode={isDarkMode} 
                cardClasses={cardClasses} 
                mutedTextClasses={mutedTextClasses} 
                primaryButtonClass={primaryButtonClass} 
                familyType={familyType} 
                setFamilyType={setFamilyType} 
                clientFirstName={clientFirstName} 
                setClientFirstName={setClientFirstName} 
                clientLastName={clientLastName} 
                setClientLastName={setClientLastName} 
                clientPhone={clientPhone} 
                setClientPhone={setClientPhone} 
                clientEmail={clientEmail} 
                setClientEmail={setClientEmail} 
                partnerFirstName={partnerFirstName} 
                setPartnerFirstName={setPartnerFirstName} 
                partnerLastName={partnerLastName} 
                setPartnerLastName={setPartnerLastName} 
                partnerPhone={partnerPhone} 
                setPartnerPhone={setPartnerPhone} 
                partnerEmail={partnerEmail} 
                setPartnerEmail={setPartnerEmail} 
                childrenCount={childrenCount} 
                setChildrenCount={setChildrenCount} 
                childrenNames={childrenNames} 
                setChildrenNames={setChildrenNames} 
                goNext={goNext} 
                restart={restart} 
                clientEmailTouched={clientEmailTouched}
                setClientEmailTouched={setClientEmailTouched}
                partnerEmailTouched={partnerEmailTouched}
                setPartnerEmailTouched={setPartnerEmailTouched}
                isValidEmail={isValidEmail}
              />
            )}
            {currentStep === 2 && (
              <PlannerStep2 
                VISUAL_STEPS={VISUAL_STEPS} 
                currentStep={currentStep} 
                isDarkMode={isDarkMode} 
                cardClasses={cardClasses} 
                mutedTextClasses={mutedTextClasses} 
                primaryButtonClass={primaryButtonClass} 
                familyType={familyType} 
                clientFirstName={clientFirstName} 
                partnerFirstName={partnerFirstName} 
                clientInsuranceType={clientInsuranceType} 
                setClientInsuranceType={setClientInsuranceType} 
                partnerInsuranceType={partnerInsuranceType} 
                setPartnerInsuranceType={setPartnerInsuranceType} 
                goNext={goNext} 
                restart={restart} 
              />
            )}
            {currentStep === 3 && (<PlannerStep3 VISUAL_STEPS={VISUAL_STEPS} currentStep={currentStep} isDarkMode={isDarkMode} cardClasses={cardClasses} mutedTextClasses={mutedTextClasses} primaryButtonClass={primaryButtonClass} goNext={goNext} restart={restart} familyType={familyType} clientFirstName={clientFirstName} partnerFirstName={partnerFirstName} clientAge={clientAge} partnerAge={partnerAge} childrenCount={childrenCount} childrenNames={childrenNames} childrenAges={childrenAges} setClientAge={setClientAge} setPartnerAge={setPartnerAge} setChildrenAges={setChildrenAges} />)}
            {currentStep === 4 && (<PlannerStep4 VISUAL_STEPS={VISUAL_STEPS} currentStep={currentStep} isDarkMode={isDarkMode} cardClasses={cardClasses} mutedTextClasses={mutedTextClasses} primaryButtonClass={primaryButtonClass} goNext={goNext} restart={restart} familyType={familyType} clientFirstName={clientFirstName} partnerFirstName={partnerFirstName} monthlyIncome={monthlyIncome} partnerIncome={partnerIncome} setMonthlyIncome={setMonthlyIncome} setPartnerIncome={setPartnerIncome} formatNumber={formatNumber} />)}
            {currentStep === 5 && (<PlannerStep5 VISUAL_STEPS={VISUAL_STEPS} currentStep={currentStep} isDarkMode={isDarkMode} cardClasses={cardClasses} mutedTextClasses={mutedTextClasses} primaryButtonClass={primaryButtonClass} goNext={goNext} restart={restart} selectedPriorities={selectedPriorities} togglePriority={togglePriority} />)}

                  {/* Generating Animation - Enhanced with blue theme */}
            {isGenerating && (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-950"
              >
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div 
                    className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  <motion.div 
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl"
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.6, 0.3, 0.6] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  <motion.div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/15 rounded-full blur-3xl"
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
                      className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500/40 to-indigo-500/40 flex items-center justify-center shadow-2xl shadow-blue-500/50"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <motion.div
                        className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400/50 to-indigo-400/50 flex items-center justify-center"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                      >
                        <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                          <Sparkles className="w-10 h-10 text-white" />
                        </div>
                      </motion.div>
                    </motion.div>
                  </motion.div>

                  {/* Title */}
                  <motion.h2 
                    className="text-3xl md:text-5xl font-bold mb-4 text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Генериране на Вашия План
                  </motion.h2>

                  {/* Subtitle */}
                  <motion.p 
                    className="text-blue-200 text-lg mb-8 max-w-md font-light leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    Анализираме Вашите данни и създаваме персонализиран финансов план
                  </motion.p>

                  {/* Progress dots */}
                  <motion.div 
                    className="flex items-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 rounded-full bg-blue-400"
                        animate={{ 
                          scale: [1, 1.8, 1],
                          opacity: [0.4, 1, 0.4] 
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

            {/* Step 6: Financial Framework - Full Screen Layout */}
            {currentStep === 6 && !isGenerating && (
              <motion.div
                key="step-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full px-4 h-[calc(100vh-48px)] flex flex-col"
              >
                {/* Inline Step Tracker */}
                <div className={cn("rounded-xl border p-2 mb-2", cardClasses)}>
                  <div className="flex justify-between items-start">
                    {VISUAL_STEPS.map((step, index) => {
                      const isActive = currentStep >= (index + 1);
                      const isCurrent = index === 5;
                      return (
                        <div key={step.id} className={cn("flex flex-col items-center text-center flex-1 transition-all duration-300", isActive ? "opacity-100" : "opacity-40")}>
                          <div className={cn("w-full h-1 mb-1 rounded-full transition-all duration-300", isCurrent ? "bg-blue-500" : isActive ? "bg-blue-500" : isDarkMode ? "bg-slate-700" : "bg-slate-200")} />
                          <span className={cn("text-[8px] font-semibold tracking-wider leading-tight uppercase", isCurrent ? "text-slate-900" : "text-slate-400")}>{step.label}</span>
                          <span className={cn("text-[8px] font-semibold tracking-wider leading-tight uppercase", isCurrent ? "text-slate-900" : "text-slate-400")}>{step.subLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <motion.div 
                  className="text-center mb-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-semibold mb-4">
                    <Sparkles className="w-4 h-4" />
                    ПЕРСОНАЛИЗИРАН ЗА ВАС
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Вашият Оптимален Финансов План
                  </h2>
                  <p className={cn("text-sm mt-2", mutedTextClasses)}>
                    Регулирайте разпределението според Вашите приоритети
                  </p>
                </motion.div>

                {/* Goals Grid - 4 columns like the image */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 flex-1">
                  {/* Security - Enhanced */}
                  <motion.div 
                    className={cn(
                      "rounded-3xl border-2 p-6 text-center relative transition-all duration-300 group overflow-hidden",
                      cardClasses,
                      "hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-200/50"
                    )}
                    animate={recentlyChanged === 'security' ? { scale: [1, 1.03, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -4 }}
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute top-3 right-3 z-10">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLock('security');
                            }}
                            className={cn(
                              "p-3 rounded-lg transition-all shadow-lg hover:scale-110 active:scale-95",
                              lockedGoals.security 
                                ? "bg-blue-600 text-white" 
                                : "bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                            )}
                          >
                            {lockedGoals.security ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-slate-900 text-white">
                          <p>{lockedGoals.security ? 'Отключи за авто-корекция' : 'Заключи текущата стойност'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className={cn("text-xs tracking-widest mb-3 font-bold relative z-10", accentColor)}>ФИНАНСОВА СИГУРНОСТ</p>
                    
                    <div className="flex justify-center mb-4 relative z-10">
                      {allocations.security <= 3 ? (
                        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                          <ShieldAlert className="w-10 h-10 text-red-600" />
                        </div>
                      ) : allocations.security <= 20 ? (
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                          <Shield className="w-10 h-10 text-blue-600" />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <motion.p 
                      className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent relative z-10"
                      key={calculateGoals.security}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {formatNumber(calculateGoals.security)} €
                    </motion.p>
                    <Slider
                      value={[allocations.security]}
                      onValueChange={(v) => handleAllocationChange('security', v[0])}
                      min={0}
                      max={50}
                      step={1}
                      className="mb-3 relative z-10"
                    />
                    <p className={cn("text-xs mt-2 font-medium relative z-10", mutedTextClasses)}>
                      Резерв за {Math.round((allocations.security / 10) * 6)} месеца разходи
                    </p>
                  </motion.div>

                  {/* Pension - Enhanced */}
                  <motion.div 
                    className={cn(
                      "rounded-3xl border-2 p-6 text-center relative transition-all duration-300 group overflow-hidden",
                      cardClasses,
                      "hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-200/50"
                    )}
                    animate={recentlyChanged === 'pension' ? { scale: [1, 1.03, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -4 }}
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute top-3 right-3 z-10">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLock('pension');
                            }}
                            className={cn(
                              "p-3 rounded-lg transition-all shadow-lg hover:scale-110 active:scale-95",
                              lockedGoals.pension 
                                ? "bg-blue-600 text-white" 
                                : "bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                            )}
                          >
                            {lockedGoals.pension ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-slate-900 text-white">
                          <p>{lockedGoals.pension ? 'Отключи за авто-корекция' : 'Заключи текущата стойност'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className={cn("text-xs tracking-widest mb-3 font-bold relative z-10", accentColor)}>ПЕНСИЯ</p>
                    
                    <div className="flex justify-center mb-4 relative z-10">
                      {allocations.pension <= 2 ? (
                        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                          <Frown className="w-10 h-10 text-red-600" />
                        </div>
                      ) : allocations.pension <= 10 ? (
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                          <Smile className="w-10 h-10 text-blue-600" />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <PartyPopper className="w-10 h-10 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <motion.p 
                      className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent relative z-10"
                      key={calculateGoals.pension}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {formatNumber(calculateGoals.pension)} €
                    </motion.p>
                    <Slider
                      value={[allocations.pension]}
                      onValueChange={(v) => handleAllocationChange('pension', v[0])}
                      min={0}
                      max={25}
                      step={1}
                      className="mb-3 relative z-10"
                    />
                    <p className={cn("text-xs mt-2 font-medium relative z-10", mutedTextClasses)}>
                      Месечна пенсия (държавна + лична)
                    </p>
                  </motion.div>

                  {/* Housing - Enhanced */}
                  <motion.div 
                    className={cn(
                      "rounded-3xl border-2 p-6 text-center relative transition-all duration-300 group overflow-hidden",
                      cardClasses,
                      "hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-200/50"
                    )}
                    animate={recentlyChanged === 'housing' ? { scale: [1, 1.03, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -4 }}
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute top-3 right-3 z-10">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLock('housing');
                            }}
                            className={cn(
                              "p-3 rounded-lg transition-all shadow-lg hover:scale-110 active:scale-95",
                              lockedGoals.housing 
                                ? "bg-blue-600 text-white" 
                                : "bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                            )}
                          >
                            {lockedGoals.housing ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-slate-900 text-white">
                          <p>{lockedGoals.housing ? 'Отключи за авто-корекция' : 'Заключи текущата стойност'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className={cn("text-xs tracking-widest mb-3 font-bold relative z-10", accentColor)}>ЖИЛИЩЕ</p>
                    
                    <div className="flex justify-center mb-4 relative z-10">
                      {allocations.housing === 0 ? (
                        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center relative">
                          <Home className="w-10 h-10 text-red-600" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-0.5 bg-red-600 rotate-45"></div>
                          </div>
                        </div>
                      ) : calculateGoals.housing >= 100000 ? (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <Home className="w-10 h-10 text-white" />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                          <HomeIcon className="w-10 h-10 text-blue-600" />
                        </div>
                      )}
                    </div>
                    
                    <motion.p 
                      className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent relative z-10"
                      key={calculateGoals.housing}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {formatNumber(calculateGoals.housing)} €
                    </motion.p>
                    <Slider
                      value={[allocations.housing]}
                      onValueChange={(v) => handleAllocationChange('housing', v[0])}
                      min={0}
                      max={50}
                      step={1}
                      className="mb-3 relative z-10"
                    />
                    <p className={cn("text-xs mt-2 font-medium relative z-10", mutedTextClasses)}>
                      Ипотека {calculateGoals.loanTerm} год. при 3% лихва
                    </p>
                  </motion.div>

                  {/* Other Goals - Enhanced */}
                  <motion.div 
                    className={cn(
                      "rounded-3xl border-2 p-6 text-center relative transition-all duration-300 group overflow-hidden",
                      cardClasses,
                      "hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-200/50"
                    )}
                    animate={recentlyChanged === 'cash' ? { scale: [1, 1.03, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -4 }}
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute top-3 right-3 z-10">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLock('cash');
                            }}
                            className={cn(
                              "p-3 rounded-lg transition-all shadow-lg hover:scale-110 active:scale-95",
                              lockedGoals.cash 
                                ? "bg-blue-600 text-white" 
                                : "bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                            )}
                          >
                            {lockedGoals.cash ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-slate-900 text-white">
                          <p>{lockedGoals.cash ? 'Отключи за авто-корекция' : 'Заключи текущата стойност'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className={cn("text-xs tracking-widest mb-3 font-bold relative z-10", accentColor)}>ДРУГИ ЦЕЛИ</p>
                    
                    <div className="flex justify-center mb-4 relative z-10">
                      {allocations.cash === 0 ? (
                        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center relative">
                          <Car className="w-10 h-10 text-red-600" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-0.5 bg-red-600 rotate-45"></div>
                          </div>
                        </div>
                      ) : allocations.cash <= 2 ? (
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                          <Car className="w-10 h-10 text-blue-600" />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <Wallet className="w-10 h-10 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <motion.p 
                      className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent relative z-10"
                      key={calculateGoals.cash}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {formatNumber(calculateGoals.cash)} €
                    </motion.p>
                    <Slider
                      value={[allocations.cash]}
                      onValueChange={(v) => handleAllocationChange('cash', v[0])}
                      min={0}
                      max={25}
                      step={1}
                      className="mb-3 relative z-10"
                    />
                    <p className={cn("text-xs mt-2 font-medium relative z-10", mutedTextClasses)}>
                      Автомобил, пътувания и др.
                    </p>
                  </motion.div>
                </div>

                {/* Detailed Info Section - Enhanced */}
                <motion.div 
                  className={cn("rounded-2xl border-2 border-blue-200 p-4 mb-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50")}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="grid md:grid-cols-4 gap-3 text-xs">
                    <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/80 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info className="w-3 h-3 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-blue-900">Финансова сигурност</p>
                        <p className="text-slate-600 leading-relaxed">Резерв от {Math.round((allocations.security / 10) * 6)} месеца разходи</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/80 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info className="w-3 h-3 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-blue-900">Пенсия</p>
                        <p className="text-slate-600 leading-relaxed">Държавна + инвестиции при 8% доходност</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/80 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info className="w-3 h-3 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-blue-900">Жилище</p>
                        <p className="text-slate-600 leading-relaxed">Кредит {calculateGoals.loanTerm}г. при 3% лихва</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/80 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info className="w-3 h-3 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-blue-900">Други цели</p>
                        <p className="text-slate-600 leading-relaxed">Автомобил, образование и др.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Total Wealth - Bottom Center - Enhanced */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    "rounded-2xl border-2 p-6 text-center max-w-lg mx-auto mb-2 relative overflow-hidden",
                    "bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-500 shadow-2xl shadow-blue-500/50"
                  )}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <p className="text-xs tracking-widest mb-2 text-blue-100 font-semibold relative z-10">ОБЩО ПРОГНОЗНО ИМУЩЕСТВО</p>
                  <motion.p 
                    className="text-4xl md:text-5xl font-bold text-white relative z-10"
                    key={calculateGoals.totalWealth}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {formatNumber(calculateGoals.totalWealth)} €
                  </motion.p>
                  <p className="text-xs text-blue-200 mt-2 relative z-10">при пенсиониране на {Math.round(avgAge)} + {yearsToRetirement} = {Math.round(avgAge) + yearsToRetirement} години</p>
                </motion.div>

                {/* Continue button */}
                <div className="text-center">
                  <Button 
                    onClick={goNext}
                    className={cn(primaryButtonClass, "group")}
                  >
                    Продължи към следващата стъпка
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 7: Work System */}
            {currentStep === 7 && (
              <PlannerStep7
                VISUAL_STEPS={VISUAL_STEPS}
                currentStep={currentStep}
                isDarkMode={isDarkMode}
                cardClasses={cardClasses}
                mutedTextClasses={mutedTextClasses}
                primaryButtonClass={primaryButtonClass}
                goNext={goNext}
              />
            )}

            {/* Step 8: Cooperation Rules */}
            {currentStep === 8 && (
              <PlannerStep8
                VISUAL_STEPS={VISUAL_STEPS}
                currentStep={currentStep}
                isDarkMode={isDarkMode}
                cardClasses={cardClasses}
                mutedTextClasses={mutedTextClasses}
                primaryButtonClass={primaryButtonClass}
                goNext={goNext}
              />
            )}

            {/* Step 9: Summary & GDPR */}
            {currentStep === 9 && (
              <PlannerStep9
                VISUAL_STEPS={VISUAL_STEPS}
                isDarkMode={isDarkMode}
                cardClasses={cardClasses}
                mutedTextClasses={mutedTextClasses}
                primaryButtonClass={primaryButtonClass}
                gdprConsentA={gdprConsentA}
                gdprConsentB={gdprConsentB}
                gdprConsentC={gdprConsentC}
                gdprTextOpen={gdprTextOpen}
                setGdprConsentA={setGdprConsentA}
                setGdprConsentB={setGdprConsentB}
                setGdprConsentC={setGdprConsentC}
                setGdprTextOpen={setGdprTextOpen}
                onSubmit={async () => {
                  try {
                    const clientData = {
                      first_name: clientFirstName, last_name: clientLastName,
                      email: clientEmail, phone: clientPhone,
                      stage: 'financial_planner', status: 'active', family_type: familyType,
                      children_count: childrenCount, children_names: childrenNames, children_ages: childrenAges,
                      gdpr_consent_a: gdprConsentA, gdpr_consent_b: gdprConsentB, gdpr_consent_c: gdprConsentC,
                      gdpr_consent_date: new Date().toISOString(),
                      ...(familyType === 'family' && { partner_first_name: partnerFirstName, partner_last_name: partnerLastName, partner_email: partnerEmail }),
                    };
                    let client;
                    if (clientId) { await base44.entities.Client.update(clientId, clientData); client = { id: clientId, ...clientData }; }
                    else { client = await base44.entities.Client.create(clientData); }

                    // --- Journey init via state machine ---
                    const deviceId = localStorage.getItem('device_id') || `dev_${Date.now()}`;
                    localStorage.setItem('device_id', deviceId);

                    const { data: journeyData } = await base44.functions.invoke('journeyStateMachine', {
                        action: 'CREATE_AND_ADVANCE',
                        payload: {
                            client_id: client.id,
                            device_id: deviceId,
                            language_code: 'bg',
                            to_state: 'discovery_collecting',
                            extra_data: { discovery_started_at: new Date().toISOString() }
                        }
                    });
                    const journeyId = journeyData.journey_id;
                    localStorage.setItem('active_journey_id', journeyId);
                    // --------------------------------------

                    const plannerData = {
                      client_id: client.id, journey_id: journeyId, family_type: familyType,
                      client_first_name: clientFirstName, client_last_name: clientLastName,
                      client_phone: clientPhone, client_email: clientEmail,
                      partner_first_name: partnerFirstName, partner_last_name: partnerLastName,
                      partner_phone: partnerPhone, partner_email: partnerEmail,
                      children_count: childrenCount, children_names: childrenNames, children_ages: childrenAges,
                      client_insurance_type: clientInsuranceType, partner_insurance_type: partnerInsuranceType,
                      client_age: clientAge, partner_age: partnerAge,
                      monthly_income: monthlyIncome, partner_income: partnerIncome,
                      gdpr_consent_a: gdprConsentA, gdpr_consent_b: gdprConsentB, gdpr_consent_c: gdprConsentC,
                    };
                    localStorage.setItem('financialPlannerData', JSON.stringify(plannerData));
                    window.location.href = createPageUrl('FinancialAnalysis');
                  } catch (error) { console.error('Error creating client:', error); }
                }}
              />
            )}

    </AnimatePresence>
    </div>
    </div>
    </div>
    </TooltipProvider>
  );
}