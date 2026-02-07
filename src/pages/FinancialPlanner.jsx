import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RotateCcw, Loader2, Lock, Unlock, HelpCircle, ArrowLeft, ShieldAlert, Shield, ShieldCheck, Frown, Smile, PartyPopper, Home, HomeIcon, Car, GraduationCap, Wallet, TrendingUp, Briefcase, Baby, PiggyBank, Plane, Heart, Target, CheckCircle2, Calendar, Users, FileText, Info, User, XCircle, ArrowRight, Sparkles, ChevronDown, Search, Settings, Presentation, Handshake, Eye, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';
import { base44 } from '@/api/base44Client';
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
            className="grid lg:grid-cols-4 gap-8 items-center h-full"
            >
            {/* Left side - description (25%) */}
            <div className="lg:col-span-1 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-6">
                  <Sparkles className="w-4 h-4" />
                  СТЪПКА 1 ОТ 9
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Започнете Вашия Персонален Финансов План
                </h1>
                <p className={cn("text-lg mb-6 leading-relaxed", mutedTextClasses)}>
                  Попълнете няколко кратки въпроса, за да създадем индивидуален анализ за Вас. 
                  Това ще отнеме само няколко минути.
                </p>
              </motion.div>
            </div>

            {/* Right side - card (75%) */}
            <div className={cn("lg:col-span-3 rounded-3xl border p-8 min-h-[500px] flex flex-col", cardClasses)}>
              {/* Inline Step Tracker - Enhanced */}
              <div className="mb-6 pb-4 border-b border-blue-100">
                <div className="flex justify-between items-start gap-1">
                  {VISUAL_STEPS.map((step, index) => {
                    const isActive = currentStep >= (index + 1);
                    const isCurrent = index === 0;
                    const isCompleted = currentStep > (index + 1);
                    return (
                      <Tooltip key={step.id}>
                        <TooltipTrigger asChild>
                          <div 
                            className={cn(
                              "flex flex-col items-center text-center flex-1 transition-all duration-300 cursor-pointer",
                              isActive ? "opacity-100" : "opacity-40"
                            )}
                          >
                            <motion.div 
                              className={cn(
                                "w-full h-1.5 mb-2 rounded-full transition-all duration-300",
                                isCurrent 
                                  ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50" 
                                  : isCompleted
                                    ? "bg-blue-600"
                                    : isDarkMode ? "bg-slate-700" : "bg-slate-200"
                              )}
                              animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                            <span className={cn(
                              "text-[9px] font-bold tracking-wider leading-tight uppercase",
                              isCurrent ? "text-blue-600" : isCompleted ? "text-blue-500" : "text-slate-400"
                            )}>
                              {step.label}
                            </span>
                            <span className={cn(
                              "text-[9px] font-bold tracking-wider leading-tight uppercase",
                              isCurrent ? "text-blue-600" : isCompleted ? "text-blue-500" : "text-slate-400"
                            )}>
                              {step.subLabel}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Стъпка {index + 1}: {step.label} {step.subLabel}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/30">
                        1
                      </div>
                      <span className="text-sm font-semibold text-blue-600">ОСНОВНА ИНФОРМАЦИЯ</span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={restart} className="p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                          <RotateCcw className="w-5 h-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Започни отначало</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-2">С кого планираме?</h2>
                  <p className={cn("text-sm mb-8", mutedTextClasses)}>
                    Изберете дали работим с един клиент или с домакинство.
                  </p>

                  <div className="space-y-6 mb-8 flex-1">
                    <div className="grid grid-cols-2 gap-6">
                      <motion.button
                        onClick={() => setFamilyType('individual')}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "p-8 rounded-3xl border-2 transition-all duration-300 group flex flex-col items-center justify-center text-center relative overflow-hidden",
                          familyType === 'individual'
                            ? "border-blue-500 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-500/50"
                            : isDarkMode 
                              ? "border-slate-700 hover:border-blue-400 bg-slate-800/50" 
                              : "border-slate-200 hover:border-blue-400 bg-white hover:shadow-xl hover:shadow-blue-200/50"
                        )}
                      >
                        {familyType === 'individual' && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                        <User className={cn("w-16 h-16 mb-4", familyType === 'individual' ? "text-white" : "text-blue-500 group-hover:text-blue-600")} />
                        <h3 className={cn("font-bold text-xl mb-2", familyType !== 'individual' && "text-slate-900 group-hover:text-blue-700")}>Индивидуално</h3>
                        <p className={cn("text-sm", familyType === 'individual' ? "text-blue-100" : mutedTextClasses)}>
                          Фокус върху Вашите лични цели
                        </p>
                      </motion.button>
                      
                      <motion.button
                        onClick={() => setFamilyType('family')}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "p-8 rounded-3xl border-2 transition-all duration-300 group flex flex-col items-center justify-center text-center relative overflow-hidden",
                          familyType === 'family'
                            ? "border-blue-500 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-500/50"
                            : isDarkMode 
                              ? "border-slate-700 hover:border-blue-400 bg-slate-800/50" 
                              : "border-slate-200 hover:border-blue-400 bg-white hover:shadow-xl hover:shadow-blue-200/50"
                        )}
                      >
                        {familyType === 'family' && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                        <Users className={cn("w-16 h-16 mb-4", familyType === 'family' ? "text-white" : "text-blue-500 group-hover:text-blue-600")} />
                        <h3 className={cn("font-bold text-xl mb-2", familyType !== 'family' && "text-slate-900 group-hover:text-blue-700")}>Семейство</h3>
                        <p className={cn("text-sm", familyType === 'family' ? "text-blue-100" : mutedTextClasses)}>
                          Планиране на общ семеен бюджет
                        </p>
                      </motion.button>
                    </div>

                    {/* Name fields for individual */}
                    {familyType === 'individual' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.4 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                            <input
                              type="text"
                              value={clientFirstName}
                              onChange={(e) => setClientFirstName(e.target.value)}
                              placeholder=" "
                              className={cn(
                                "peer w-full px-4 pt-6 pb-2 rounded-xl border-2 transition-all duration-200 outline-none",
                                isDarkMode 
                                  ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" 
                                  : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-100/50"
                              )}
                            />
                            <label className={cn(
                              "absolute left-4 top-4 text-sm font-medium transition-all duration-200 pointer-events-none",
                              "peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600",
                              "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs",
                              mutedTextClasses
                            )}>
                              Вашето име
                            </label>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              value={clientLastName}
                              onChange={(e) => setClientLastName(e.target.value)}
                              placeholder=" "
                              className={cn(
                                "peer w-full px-4 pt-6 pb-2 rounded-xl border-2 transition-all duration-200 outline-none",
                                isDarkMode 
                                  ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" 
                                  : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-100/50"
                              )}
                            />
                            <label className={cn(
                              "absolute left-4 top-4 text-sm font-medium transition-all duration-200 pointer-events-none",
                              "peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600",
                              "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs",
                              mutedTextClasses
                            )}>
                              Вашата фамилия
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                            <input
                              type="tel"
                              value={clientPhone}
                              onChange={(e) => setClientPhone(e.target.value)}
                              placeholder=" "
                              className={cn(
                                "peer w-full px-4 pt-6 pb-2 rounded-xl border-2 transition-all duration-200 outline-none",
                                isDarkMode 
                                  ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" 
                                  : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-100/50"
                              )}
                            />
                            <label className={cn(
                              "absolute left-4 top-4 text-sm font-medium transition-all duration-200 pointer-events-none",
                              "peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600",
                              "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs",
                              mutedTextClasses
                            )}>
                              Телефонен номер
                            </label>
                          </div>
                          <div className="relative">
                            <input
                              type="email"
                              value={clientEmail}
                              onChange={(e) => setClientEmail(e.target.value)}
                              onBlur={() => setClientEmailTouched(true)}
                              placeholder=" "
                              className={cn(
                                "peer w-full px-4 pt-6 pb-2 rounded-xl border-2 transition-all duration-200 outline-none",
                                clientEmailTouched && clientEmail && !isValidEmail(clientEmail)
                                  ? "border-red-500 focus:border-red-500 bg-red-50"
                                  : isDarkMode 
                                    ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" 
                                    : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-100/50"
                              )}
                            />
                            <label className={cn(
                              "absolute left-4 top-4 text-sm font-medium transition-all duration-200 pointer-events-none",
                              "peer-focus:top-2 peer-focus:text-xs",
                              "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs",
                              clientEmailTouched && clientEmail && !isValidEmail(clientEmail) ? "text-red-500" : "peer-focus:text-blue-600",
                              mutedTextClasses
                            )}>
                              E-mail адрес
                            </label>
                            {clientEmailTouched && clientEmail && !isValidEmail(clientEmail) && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1"
                              >
                                <XCircle className="w-4 h-4 text-red-500" />
                              </motion.div>
                            )}
                            {clientEmailTouched && clientEmail && !isValidEmail(clientEmail) && (
                              <motion.p 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-xs mt-1 flex items-center gap-1"
                              >
                                <XCircle className="w-3 h-3" />
                                Моля въведете валиден имейл адрес
                              </motion.p>
                            )}
                          </div>
                        </div>

                        {/* Children count */}
                        <div>
                          <label className={cn("text-sm font-medium mb-2 block", mutedTextClasses)}>Брой деца</label>
                          <Select
                            value={childrenCount.toString()}
                            onValueChange={(value) => {
                              const count = parseInt(value);
                              setChildrenCount(count);
                              setChildrenNames(Array(count).fill(''));
                            }}
                          >
                            <SelectTrigger className={cn(
                              "w-full px-4 py-3 rounded-xl border-2",
                              isDarkMode 
                                ? "bg-slate-800 border-slate-700 text-white" 
                                : "bg-white border-slate-200 text-slate-900"
                            )}>
                              <SelectValue placeholder="Изберете" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Няма</SelectItem>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                              <SelectItem value="5">5</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Children names - Enhanced */}
                        {childrenCount > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.4 }}
                            className="space-y-3"
                          >
                            {Array.from({ length: childrenCount }).map((_, idx) => (
                              <div key={idx} className="relative">
                                <input
                                  type="text"
                                  value={childrenNames[idx] || ''}
                                  onChange={(e) => {
                                    const newNames = [...childrenNames];
                                    newNames[idx] = e.target.value;
                                    setChildrenNames(newNames);
                                  }}
                                  placeholder=" "
                                  className={cn(
                                    "peer w-full px-4 pt-6 pb-2 rounded-xl border-2 transition-all duration-200 outline-none",
                                    isDarkMode 
                                      ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" 
                                      : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-100/50"
                                  )}
                                />
                                <label className={cn(
                                  "absolute left-4 top-4 text-sm font-medium transition-all duration-200 pointer-events-none",
                                  "peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600",
                                  "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs",
                                  mutedTextClasses
                                )}>
                                  Име на дете {idx + 1}
                                </label>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </motion.div>
                    )}

                    {/* Name fields for family */}
                    {familyType === 'family' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-2 gap-6">
                          {/* Client names */}
                          <div className="space-y-4">
                            <p className={cn("text-sm font-semibold uppercase tracking-wide", mutedTextClasses)}>КЛИЕНТ</p>
                            <div className="relative">
                              <input
                                type="text"
                                value={clientFirstName}
                                onChange={(e) => setClientFirstName(e.target.value)}
                                placeholder=" "
                                className={cn(
                                  "peer w-full px-4 pt-6 pb-2 rounded-xl border-2 transition-all duration-200 outline-none",
                                  isDarkMode 
                                    ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" 
                                    : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-100/50"
                                )}
                              />
                              <label className={cn(
                                "absolute left-4 top-4 text-sm font-medium transition-all duration-200 pointer-events-none",
                                "peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600",
                                "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs",
                                mutedTextClasses
                              )}>
                                Име на клиента
                              </label>
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                value={clientLastName}
                                onChange={(e) => setClientLastName(e.target.value)}
                                placeholder=" "
                                className={cn(
                                  "peer w-full px-4 pt-6 pb-2 rounded-xl border-2 transition-all duration-200 outline-none",
                                  isDarkMode 
                                    ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" 
                                    : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-100/50"
                                )}
                              />
                              <label className={cn(
                                "absolute left-4 top-4 text-sm font-medium transition-all duration-200 pointer-events-none",
                                "peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600",
                                "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs",
                                mutedTextClasses
                              )}>
                                Фамилия на клиента
                              </label>
                            </div>
                            <div className="relative">
                              <input
                                type="tel"
                                value={clientPhone}
                                onChange={(e) => setClientPhone(e.target.value)}
                                placeholder=" "
                                className={cn(
                                  "peer w-full px-4 pt-6 pb-2 rounded-xl border-2 transition-all duration-200 outline-none",
                                  isDarkMode 
                                    ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" 
                                    : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-100/50"
                                )}
                              />
                              <label className={cn(
                                "absolute left-4 top-4 text-sm font-medium transition-all duration-200 pointer-events-none",
                                "peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600",
                                "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs",
                                mutedTextClasses
                              )}>
                                Телефон на клиента
                              </label>
                            </div>
                            <div className="relative">
                              <input
                                type="email"
                                value={clientEmail}
                                onChange={(e) => setClientEmail(e.target.value)}
                                onBlur={() => setClientEmailTouched(true)}
                                placeholder=" "
                                className={cn(
                                  "peer w-full px-4 pt-6 pb-2 rounded-xl border-2 transition-all duration-200 outline-none",
                                  clientEmailTouched && clientEmail && !isValidEmail(clientEmail)
                                    ? "border-red-500 focus:border-red-500 bg-red-50"
                                    : isDarkMode 
                                      ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" 
                                      : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-100/50"
                                )}
                              />
                              <label className={cn(
                                "absolute left-4 top-4 text-sm font-medium transition-all duration-200 pointer-events-none",
                                "peer-focus:top-2 peer-focus:text-xs",
                                "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs",
                                clientEmailTouched && clientEmail && !isValidEmail(clientEmail) ? "text-red-500" : "peer-focus:text-blue-600",
                                mutedTextClasses
                              )}>
                                Имейл на клиента
                              </label>
                              {clientEmailTouched && clientEmail && !isValidEmail(clientEmail) && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1"
                                >
                                  <XCircle className="w-4 h-4 text-red-500" />
                                </motion.div>
                              )}
                              {clientEmailTouched && clientEmail && !isValidEmail(clientEmail) && (
                                <motion.p 
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="text-red-500 text-xs mt-1 flex items-center gap-1"
                                >
                                  <XCircle className="w-3 h-3" />
                                  Моля въведете валиден имейл адрес
                                </motion.p>
                              )}
                            </div>
                          </div>

                          {/* Partner names */}
                          <div className="space-y-4">
                            <p className={cn("text-sm font-semibold uppercase tracking-wide", mutedTextClasses)}>ПАРТНЬОР</p>
                            <div className="relative">
                              <input
                                type="text"
                                value={partnerFirstName}
                                onChange={(e) => setPartnerFirstName(e.target.value)}
                                placeholder=" "
                                className={cn(
                                  "peer w-full px-4 pt-6 pb-2 rounded-xl border-2 transition-all duration-200 outline-none",
                                  isDarkMode 
                                    ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" 
                                    : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-100/50"
                                )}
                              />
                              <label className={cn(
                                "absolute left-4 top-4 text-sm font-medium transition-all duration-200 pointer-events-none",
                                "peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600",
                                "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs",
                                mutedTextClasses
                              )}>
                                Име на партньора
                              </label>
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                value={partnerLastName}
                                onChange={(e) => setPartnerLastName(e.target.value)}
                                placeholder=" "
                                className={cn(
                                  "peer w-full px-4 pt-6 pb-2 rounded-xl border-2 transition-all duration-200 outline-none",
                                  isDarkMode 
                                    ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" 
                                    : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-100/50"
                                )}
                              />
                              <label className={cn(
                                "absolute left-4 top-4 text-sm font-medium transition-all duration-200 pointer-events-none",
                                "peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600",
                                "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs",
                                mutedTextClasses
                              )}>
                                Фамилия на партньора
                              </label>
                            </div>
                            <div className="relative">
                              <input
                                type="tel"
                                value={partnerPhone}
                                onChange={(e) => setPartnerPhone(e.target.value)}
                                placeholder=" "
                                className={cn(
                                  "peer w-full px-4 pt-6 pb-2 rounded-xl border-2 transition-all duration-200 outline-none",
                                  isDarkMode 
                                    ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" 
                                    : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-100/50"
                                )}
                              />
                              <label className={cn(
                                "absolute left-4 top-4 text-sm font-medium transition-all duration-200 pointer-events-none",
                                "peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600",
                                "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs",
                                mutedTextClasses
                              )}>
                                Телефонен номер
                              </label>
                            </div>
                            <div className="relative">
                              <input
                                type="email"
                                value={partnerEmail}
                                onChange={(e) => setPartnerEmail(e.target.value)}
                                onBlur={() => setPartnerEmailTouched(true)}
                                placeholder=" "
                                className={cn(
                                  "peer w-full px-4 pt-6 pb-2 rounded-xl border-2 transition-all duration-200 outline-none",
                                  partnerEmailTouched && partnerEmail && !isValidEmail(partnerEmail)
                                    ? "border-red-500 focus:border-red-500 bg-red-50"
                                    : isDarkMode 
                                      ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" 
                                      : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-100/50"
                                )}
                              />
                              <label className={cn(
                                "absolute left-4 top-4 text-sm font-medium transition-all duration-200 pointer-events-none",
                                "peer-focus:top-2 peer-focus:text-xs",
                                "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs",
                                partnerEmailTouched && partnerEmail && !isValidEmail(partnerEmail) ? "text-red-500" : "peer-focus:text-blue-600",
                                mutedTextClasses
                              )}>
                                E-mail адрес
                              </label>
                              {partnerEmailTouched && partnerEmail && !isValidEmail(partnerEmail) && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1"
                                >
                                  <XCircle className="w-4 h-4 text-red-500" />
                                </motion.div>
                              )}
                              {partnerEmailTouched && partnerEmail && !isValidEmail(partnerEmail) && (
                                <motion.p 
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="text-red-500 text-xs mt-1 flex items-center gap-1"
                                >
                                  <XCircle className="w-3 h-3" />
                                  Моля въведете валиден имейл адрес
                                </motion.p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Children count - Outside the grid to appear below both columns */}
                        <div className="relative">
                          <label className={cn("text-sm font-medium mb-2 block", mutedTextClasses)}>Брой деца</label>
                          <Select
                            value={childrenCount.toString()}
                            onValueChange={(value) => {
                              const count = parseInt(value);
                              setChildrenCount(count);
                              setChildrenNames(Array(count).fill(''));
                            }}
                          >
                            <SelectTrigger className={cn(
                              "w-full px-4 py-3 rounded-xl border-2 transition-all focus:shadow-lg",
                              isDarkMode 
                                ? "bg-slate-800 border-slate-700 text-white" 
                                : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:shadow-blue-100/50"
                            )}>
                              <SelectValue placeholder="Изберете" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Няма деца</SelectItem>
                              <SelectItem value="1">1 дете</SelectItem>
                              <SelectItem value="2">2 деца</SelectItem>
                              <SelectItem value="3">3 деца</SelectItem>
                              <SelectItem value="4">4 деца</SelectItem>
                              <SelectItem value="5">5 деца</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Children names - Enhanced with floating labels */}
                        {childrenCount > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.4 }}
                            className="space-y-3"
                          >
                            {Array.from({ length: childrenCount }).map((_, idx) => (
                              <div key={idx} className="relative">
                                <input
                                  type="text"
                                  value={childrenNames[idx] || ''}
                                  onChange={(e) => {
                                    const newNames = [...childrenNames];
                                    newNames[idx] = e.target.value;
                                    setChildrenNames(newNames);
                                  }}
                                  placeholder=" "
                                  className={cn(
                                    "peer w-full px-4 pt-6 pb-2 rounded-xl border-2 transition-all duration-200 outline-none",
                                    isDarkMode 
                                      ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" 
                                      : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-100/50"
                                  )}
                                />
                                <label className={cn(
                                  "absolute left-4 top-4 text-sm font-medium transition-all duration-200 pointer-events-none",
                                  "peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600",
                                  "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs",
                                  mutedTextClasses
                                )}>
                                  Име на дете {idx + 1}
                                </label>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button 
                      onClick={goNext}
                      disabled={
                        !familyType || 
                        !clientFirstName.trim() || 
                        !clientLastName.trim() ||
                        !clientPhone.trim() ||
                        !clientEmail.trim() ||
                        !isValidEmail(clientEmail) ||
                        (familyType === 'family' && (!partnerFirstName.trim() || !partnerLastName.trim() || !partnerPhone.trim() || !partnerEmail.trim() || !isValidEmail(partnerEmail))) ||
                        (childrenCount > 0 && childrenNames.some(name => !name.trim()))
                      }
                      className={cn(primaryButtonClass, "text-lg group")}
                    >
                      Следваща стъпка
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
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
                className="grid lg:grid-cols-4 gap-8 items-center h-full"
              >
                <div className="lg:col-span-1 flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-6">
                      <Sparkles className="w-4 h-4" />
                      СТЪПКА 2 ОТ 9
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Начин на осигуряване
                    </h1>
                    <p className={cn("text-lg mb-6 leading-relaxed", mutedTextClasses)}>
                      {familyType === 'family' 
                        ? 'Това влияе на прогнозната ви пенсия.'
                        : 'Това влияе на прогнозната ви пенсия.'
                      }
                    </p>
                  </motion.div>
                </div>

                <div className={cn("lg:col-span-3 rounded-3xl border p-8 min-h-[500px] flex flex-col", cardClasses)}>
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
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/30">
                        2
                      </div>
                      <span className="text-sm font-semibold text-blue-600">НАЧИН НА ОСИГУРЯВАНЕ</span>
                    </div>
                    <button onClick={restart} className="p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <h2 className="text-3xl font-bold mb-8">Начин на осигуряване</h2>

                  {/* Insurance type selection */}
                  <div className={cn("space-y-8 flex-1", familyType === 'family' && "grid grid-cols-2 gap-8 space-y-0")}>
                    {/* Client Insurance */}
                    <div>
                      {familyType === 'family' && (
                        <p className={cn("text-base font-medium mb-4", mutedTextClasses)}>КЛИЕНТ</p>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <motion.button
                          onClick={() => setClientInsuranceType('employee')}
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            "p-8 rounded-3xl border-2 text-center transition-all duration-300 group relative overflow-hidden",
                            clientInsuranceType === 'employee'
                              ? "border-blue-500 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-500/50"
                              : isDarkMode 
                                ? "border-slate-700 hover:border-blue-400 bg-slate-800/50" 
                                : "border-slate-200 hover:border-blue-400 bg-white hover:shadow-xl hover:shadow-blue-200/50"
                          )}
                        >
                          {clientInsuranceType === 'employee' && (
                            <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                          )}
                          <Briefcase className={cn("w-12 h-12 mx-auto mb-3 relative z-10", clientInsuranceType === 'employee' ? "text-white" : "text-blue-600")} />
                          <h3 className={cn("font-bold mb-2 text-lg relative z-10", clientInsuranceType !== 'employee' && "text-slate-900")}>Служител</h3>
                          <p className={cn("text-sm relative z-10", clientInsuranceType === 'employee' ? "text-blue-100" : "text-slate-600")}>
                            Осигуряване съответства на доходите
                          </p>
                        </motion.button>

                        <motion.button
                          onClick={() => setClientInsuranceType('entrepreneur')}
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            "p-8 rounded-3xl border-2 text-center transition-all duration-300 group relative overflow-hidden",
                            clientInsuranceType === 'entrepreneur'
                              ? "border-blue-500 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-500/50"
                              : isDarkMode 
                                ? "border-slate-700 hover:border-blue-400 bg-slate-800/50" 
                                : "border-slate-200 hover:border-blue-400 bg-white hover:shadow-xl hover:shadow-blue-200/50"
                          )}
                        >
                          {clientInsuranceType === 'entrepreneur' && (
                            <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                          )}
                          <TrendingUp className={cn("w-12 h-12 mx-auto mb-3 relative z-10", clientInsuranceType === 'entrepreneur' ? "text-white" : "text-blue-600")} />
                          <h3 className={cn("font-bold mb-2 text-lg relative z-10", clientInsuranceType !== 'entrepreneur' && "text-slate-900")}>Предприемач</h3>
                          <p className={cn("text-sm relative z-10", clientInsuranceType === 'entrepreneur' ? "text-blue-100" : "text-slate-600")}>
                            Осигуряване по-ниско от доходите
                          </p>
                        </motion.button>
                      </div>
                    </div>

                    {/* Partner Insurance (only for family) */}
                    {familyType === 'family' && (
                      <div>
                        <p className={cn("text-base font-medium mb-4", mutedTextClasses)}>ПАРТНЬОР</p>
                        <div className="grid grid-cols-2 gap-4">
                          <motion.button
                            onClick={() => setPartnerInsuranceType('employee')}
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                              "p-8 rounded-3xl border-2 text-center transition-all duration-300 group relative overflow-hidden",
                              partnerInsuranceType === 'employee'
                                ? "border-blue-500 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-500/50"
                                : isDarkMode 
                                  ? "border-slate-700 hover:border-blue-400 bg-slate-800/50" 
                                  : "border-slate-200 hover:border-blue-400 bg-white hover:shadow-xl hover:shadow-blue-200/50"
                            )}
                          >
                            {partnerInsuranceType === 'employee' && (
                              <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                            )}
                            <Briefcase className={cn("w-12 h-12 mx-auto mb-3 relative z-10", partnerInsuranceType === 'employee' ? "text-white" : "text-blue-600")} />
                            <h3 className={cn("font-bold mb-2 text-lg relative z-10", partnerInsuranceType !== 'employee' && "text-slate-900")}>Служител</h3>
                            <p className={cn("text-sm relative z-10", partnerInsuranceType === 'employee' ? "text-blue-100" : "text-slate-600")}>
                              Осигуряване съответства на доходите
                            </p>
                          </motion.button>
                          
                          <motion.button
                            onClick={() => setPartnerInsuranceType('entrepreneur')}
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                              "p-8 rounded-3xl border-2 text-center transition-all duration-300 group relative overflow-hidden",
                              partnerInsuranceType === 'entrepreneur'
                                ? "border-blue-500 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-500/50"
                                : isDarkMode 
                                  ? "border-slate-700 hover:border-blue-400 bg-slate-800/50" 
                                  : "border-slate-200 hover:border-blue-400 bg-white hover:shadow-xl hover:shadow-blue-200/50"
                            )}
                          >
                            {partnerInsuranceType === 'entrepreneur' && (
                              <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                            )}
                            <TrendingUp className={cn("w-12 h-12 mx-auto mb-3 relative z-10", partnerInsuranceType === 'entrepreneur' ? "text-white" : "text-blue-600")} />
                            <h3 className={cn("font-bold mb-2 text-lg relative z-10", partnerInsuranceType !== 'entrepreneur' && "text-slate-900")}>Предприемач</h3>
                            <p className={cn("text-sm relative z-10", partnerInsuranceType === 'entrepreneur' ? "text-blue-100" : "text-slate-600")}>
                              Осигуряване по-ниско от доходите
                            </p>
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center mt-8">
                    <Button 
                      onClick={goNext}
                      disabled={!clientInsuranceType || (familyType === 'family' && !partnerInsuranceType)}
                      className={cn(primaryButtonClass, "text-lg group")}
                    >
                      Следваща стъпка
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
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
                className="grid lg:grid-cols-4 gap-8 items-center h-full"
              >
                <div className="lg:col-span-1 flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-6">
                      <Sparkles className="w-4 h-4" />
                      СТЪПКА 3 ОТ 9
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Възраст
                    </h1>
                    <p className={cn("text-lg mb-6 leading-relaxed", mutedTextClasses)}>
                      {familyType === 'family' 
                        ? 'Необходимо за изчисляване на оптималния план до пенсия.'
                        : 'Необходимо за изчисляване на оптималния план до пенсия.'
                      }
                    </p>
                  </motion.div>
                </div>

                <div className={cn("lg:col-span-3 rounded-3xl border p-8 min-h-[500px] flex flex-col", cardClasses)}>
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
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/30">
                        3
                      </div>
                      <span className="text-sm font-semibold text-blue-600">ВЪЗРАСТ</span>
                    </div>
                    <button onClick={restart} className="p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <h2 className="text-3xl font-bold mb-8">Възраст</h2>

                  {/* Age inputs side by side */}
                  <div className="space-y-8 mb-8 flex-1">
                    <div className={cn("grid gap-8", familyType === 'family' ? "grid-cols-2" : "grid-cols-1")}>
                      {/* Client Age */}
                      <div className="flex flex-col justify-center">
                        <p className={cn("text-base font-medium mb-4", mutedTextClasses)}>
                          {familyType === 'family' ? (clientFirstName || 'КЛИЕНТ') : 'ВАШАТА ВЪЗРАСТ'}
                        </p>
                        <div className="text-center mb-4">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={clientAge}
                            onChange={(e) => {
                              const inputVal = e.target.value;
                              if (inputVal === '') {
                                setClientAge('');
                                return;
                              }
                              const numVal = parseInt(inputVal);
                              if (!isNaN(numVal)) {
                                setClientAge(numVal);
                              }
                            }}
                            onBlur={() => {
                              if (clientAge === '' || clientAge < 18) setClientAge(18);
                              else if (clientAge > 70) setClientAge(70);
                            }}
                            className={cn("text-5xl font-bold text-blue-500 bg-transparent border-none text-center w-24 outline-none focus:ring-2 focus:ring-blue-500 rounded")}
                          />
                          <span className={cn("text-xl ml-2", mutedTextClasses)}>години</span>
                        </div>
                        <Slider
                          value={[typeof clientAge === 'number' ? clientAge : 35]}
                          onValueChange={(v) => setClientAge(v[0])}
                          min={18}
                          max={70}
                          step={1}
                          className="mb-2"
                        />
                        <div className={cn("flex justify-between text-sm", mutedTextClasses)}>
                          <span>18</span>
                          <span>70</span>
                        </div>
                      </div>

                      {/* Partner Age (only for family) */}
                      {familyType === 'family' && (
                        <div className="flex flex-col justify-center">
                          <p className={cn("text-base font-medium mb-4", mutedTextClasses)}>{partnerFirstName || 'ПАРТНЬОР'}</p>
                          <div className="text-center mb-4">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={partnerAge}
                              onChange={(e) => {
                                const inputVal = e.target.value;
                                if (inputVal === '') {
                                  setPartnerAge('');
                                  return;
                                }
                                const numVal = parseInt(inputVal);
                                if (!isNaN(numVal)) {
                                  setPartnerAge(numVal);
                                }
                              }}
                              onBlur={() => {
                                if (partnerAge === '' || partnerAge < 18) setPartnerAge(18);
                                else if (partnerAge > 70) setPartnerAge(70);
                              }}
                              className={cn("text-5xl font-bold text-blue-500 bg-transparent border-none text-center w-24 outline-none focus:ring-2 focus:ring-blue-500 rounded")}
                            />
                            <span className={cn("text-xl ml-2", mutedTextClasses)}>години</span>
                          </div>
                          <Slider
                            value={[typeof partnerAge === 'number' ? partnerAge : 35]}
                            onValueChange={(v) => setPartnerAge(v[0])}
                            min={18}
                            max={70}
                            step={1}
                            className="mb-2"
                          />
                          <div className={cn("flex justify-between text-sm", mutedTextClasses)}>
                            <span>18</span>
                            <span>70</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Children Ages */}
                    {childrenCount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-6"
                      >
                        {Array.from({ length: childrenCount }).map((_, idx) => (
                          <div key={idx}>
                            <p className={cn("text-base font-medium mb-4", mutedTextClasses)}>
                              {childrenNames[idx] || `ДЕТЕ ${idx + 1}`}
                            </p>
                            <div className="text-center mb-4">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={childrenAges[idx] !== undefined ? childrenAges[idx] : ''}
                                onChange={(e) => {
                                  const inputVal = e.target.value;
                                  const newAges = [...childrenAges];
                                  if (inputVal === '') {
                                    newAges[idx] = '';
                                    setChildrenAges(newAges);
                                    return;
                                  }
                                  const numVal = parseInt(inputVal);
                                  if (!isNaN(numVal)) {
                                    newAges[idx] = numVal;
                                    setChildrenAges(newAges);
                                  }
                                }}
                                onBlur={() => {
                                  const newAges = [...childrenAges];
                                  if (newAges[idx] === '' || newAges[idx] < 0) newAges[idx] = 0;
                                  else if (newAges[idx] > 18) newAges[idx] = 18;
                                  setChildrenAges(newAges);
                                }}
                                className={cn("text-5xl font-bold text-blue-500 bg-transparent border-none text-center w-24 outline-none focus:ring-2 focus:ring-blue-500 rounded")}
                              />
                              <span className={cn("text-xl ml-2", mutedTextClasses)}>години</span>
                            </div>
                            <Slider
                              value={[typeof childrenAges[idx] === 'number' ? childrenAges[idx] : 0]}
                              onValueChange={(v) => {
                                const newAges = [...childrenAges];
                                newAges[idx] = v[0];
                                setChildrenAges(newAges);
                              }}
                              min={0}
                              max={18}
                              step={1}
                              className="mb-2"
                            />
                            <div className={cn("flex justify-between text-sm", mutedTextClasses)}>
                              <span>0</span>
                              <span>18</span>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <Button onClick={goNext} className={cn(primaryButtonClass, "text-lg group")}>
                      Следваща стъпка
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>

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
                className="grid lg:grid-cols-4 gap-8 items-center h-full"
              >
                <div className="lg:col-span-1 flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-6">
                      <Sparkles className="w-4 h-4" />
                      СТЪПКА 4 ОТ 9
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Месечен Доход
                    </h1>
                    <p className={cn("text-lg mb-6 leading-relaxed", mutedTextClasses)}>
                      {familyType === 'family' 
                        ? 'Нетните доходи след удръжки и данъци.'
                        : 'Нетният доход след удръжки и данъци.'
                      }
                    </p>
                  </motion.div>
                </div>

                <div className={cn("lg:col-span-3 rounded-3xl border p-8 min-h-[500px] flex flex-col", cardClasses)}>
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
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/30">
                        4
                      </div>
                      <span className="text-sm font-semibold text-blue-600">МЕСЕЧЕН ДОХОД</span>
                    </div>
                    <button onClick={restart} className="p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <h2 className="text-3xl font-bold mb-8">Месечен доход</h2>

                  {/* Income inputs side by side */}
                  <div className={cn("grid gap-8 mb-6 flex-1", familyType === 'family' ? "grid-cols-2" : "grid-cols-1")}>
                    {/* Client Income */}
                    <div className="flex flex-col justify-center">
                      <p className={cn("text-base font-medium mb-4", mutedTextClasses)}>
                        {familyType === 'family' ? (clientFirstName || 'КЛИЕНТ') : 'ВАШИЯТ ДОХОД'}
                      </p>
                      <div className="text-center mb-4">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={monthlyIncome}
                          onChange={(e) => {
                            const inputVal = e.target.value;
                            if (inputVal === '') {
                              setMonthlyIncome('');
                              return;
                            }
                            const numVal = parseInt(inputVal);
                            if (!isNaN(numVal)) {
                              setMonthlyIncome(numVal);
                            }
                          }}
                          onBlur={() => {
                            if (monthlyIncome === '' || monthlyIncome < 400) setMonthlyIncome(400);
                            else if (monthlyIncome > 15000) setMonthlyIncome(15000);
                          }}
                          className={cn("text-4xl font-bold text-blue-500 bg-transparent border-none text-center w-36 outline-none focus:ring-2 focus:ring-blue-500 rounded")}
                        />
                        <span className={cn("text-xl ml-2", mutedTextClasses)}>€</span>
                      </div>
                      <Slider
                        value={[typeof monthlyIncome === 'number' ? monthlyIncome : 1000]}
                        onValueChange={(v) => setMonthlyIncome(v[0])}
                        min={400}
                        max={15000}
                        step={100}
                        className="mb-2"
                      />
                      <div className={cn("flex justify-between text-sm", mutedTextClasses)}>
                        <span>400 €</span>
                        <span>15 000 €</span>
                      </div>
                    </div>

                    {/* Partner Income (only for family) */}
                    {familyType === 'family' && (
                      <div className="flex flex-col justify-center">
                        <p className={cn("text-base font-medium mb-4", mutedTextClasses)}>{partnerFirstName || 'ПАРТНЬОР'}</p>
                        <div className="text-center mb-4">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={partnerIncome}
                            onChange={(e) => {
                              const inputVal = e.target.value;
                              if (inputVal === '') {
                                setPartnerIncome('');
                                return;
                              }
                              const numVal = parseInt(inputVal);
                              if (!isNaN(numVal)) {
                                setPartnerIncome(numVal);
                              }
                            }}
                            onBlur={() => {
                              if (partnerIncome === '' || partnerIncome < 400) setPartnerIncome(400);
                              else if (partnerIncome > 15000) setPartnerIncome(15000);
                            }}
                            className={cn("text-4xl font-bold text-blue-500 bg-transparent border-none text-center w-36 outline-none focus:ring-2 focus:ring-blue-500 rounded")}
                          />
                          <span className={cn("text-xl ml-2", mutedTextClasses)}>€</span>
                        </div>
                        <Slider
                          value={[typeof partnerIncome === 'number' ? partnerIncome : 1000]}
                          onValueChange={(v) => setPartnerIncome(v[0])}
                          min={400}
                          max={15000}
                          step={100}
                          className="mb-2"
                        />
                        <div className={cn("flex justify-between text-sm", mutedTextClasses)}>
                          <span>400 €</span>
                          <span>15 000 €</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Total (for family) - Enhanced */}
                  {familyType === 'family' && (
                    <motion.div 
                      className={cn("p-6 rounded-2xl mb-6 border-2 border-blue-200", isDarkMode ? "bg-slate-800" : "bg-gradient-to-r from-blue-50 to-indigo-50")}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-base font-semibold text-blue-900">Общо месечен доход:</span>
                        <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          {formatNumber((typeof monthlyIncome === 'number' ? monthlyIncome : 0) + (typeof partnerIncome === 'number' ? partnerIncome : 0))} €
                        </span>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex justify-center">
                    <Button onClick={goNext} className={cn(primaryButtonClass, "text-lg group")}>
                      Следваща стъпка
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Priorities (multi-select with icons) */}
            {currentStep === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-4 gap-4 items-stretch h-[calc(100vh-48px)]"
              >
                <div className="lg:col-span-1 flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-4">
                      <Sparkles className="w-4 h-4" />
                      СТЪПКА 5 ОТ 9
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Вашите Финансови Приоритети
                    </h1>
                    <p className={cn("text-base leading-relaxed", mutedTextClasses)}>
                      Изберете всички области, които са важни за Вас.
                    </p>
                  </motion.div>
                </div>

                <div className={cn("lg:col-span-3 rounded-3xl border p-4 flex flex-col", cardClasses)}>
                  {/* Inline Step Tracker */}
                  <div className="mb-2 pb-2 border-b border-slate-100">
                    <div className="flex justify-between items-start">
                      {VISUAL_STEPS.map((step, index) => {
                        const isActive = currentStep >= (index + 1);
                        const isCurrent = index === 4;
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
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/30">
                        5
                      </div>
                      <span className="text-xs font-semibold text-blue-600">ПРИОРИТЕТИ</span>
                    </div>
                    <button onClick={restart} className="p-1 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h2 className="text-xl font-bold mb-1">Вашите финансови приоритети</h2>
                  <p className={cn("text-sm mb-2", mutedTextClasses)}>
                    Изберете всички области, които са важни за Вас.
                  </p>

                  {/* Priority Grid - 4 columns, 2 rows */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 flex-1">
                    {/* Row 1 */}
                    <motion.button
                      onClick={() => togglePriority('stability')}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center h-full group relative overflow-hidden",
                        selectedPriorities.includes('stability')
                          ? "border-blue-500 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/50"
                          : isDarkMode ? "border-slate-700 hover:border-blue-400 bg-slate-800/50" : "border-slate-200 hover:border-blue-400 bg-white hover:shadow-lg"
                      )}
                    >
                      {selectedPriorities.includes('stability') && (
                        <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent" layoutId="stability-bg" />
                      )}
                      <Shield className={cn("w-10 h-10 mb-2 relative z-10", selectedPriorities.includes('stability') ? "text-white" : "text-blue-600 group-hover:text-blue-700")} />
                      <h3 className={cn("font-bold text-sm text-center relative z-10", !selectedPriorities.includes('stability') && "text-slate-900")}>Финансова сигурност</h3>
                      <p className={cn("text-xs text-center relative z-10 mt-1", selectedPriorities.includes('stability') ? "text-blue-100" : "text-slate-500")}>
                        Резерв и защита
                      </p>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => togglePriority('investments')}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center h-full group relative overflow-hidden",
                        selectedPriorities.includes('investments')
                          ? "border-blue-500 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/50"
                          : isDarkMode ? "border-slate-700 hover:border-blue-400 bg-slate-800/50" : "border-slate-200 hover:border-blue-400 bg-white hover:shadow-lg"
                      )}
                    >
                      {selectedPriorities.includes('investments') && (
                        <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent" layoutId="investments-bg" />
                      )}
                      <TrendingUp className={cn("w-10 h-10 mb-2 relative z-10", selectedPriorities.includes('investments') ? "text-white" : "text-blue-600 group-hover:text-blue-700")} />
                      <h3 className={cn("font-bold text-sm text-center relative z-10", !selectedPriorities.includes('investments') && "text-slate-900")}>Инвестиции</h3>
                      <p className={cn("text-xs text-center relative z-10 mt-1", selectedPriorities.includes('investments') ? "text-blue-100" : "text-slate-500")}>
                        Растеж на капитала
                      </p>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => togglePriority('pension')}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center h-full group relative overflow-hidden",
                        selectedPriorities.includes('pension')
                          ? "border-blue-500 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/50"
                          : isDarkMode ? "border-slate-700 hover:border-blue-400 bg-slate-800/50" : "border-slate-200 hover:border-blue-400 bg-white hover:shadow-lg"
                      )}
                    >
                      {selectedPriorities.includes('pension') && (
                        <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent" layoutId="pension-bg" />
                      )}
                      <PiggyBank className={cn("w-10 h-10 mb-2 relative z-10", selectedPriorities.includes('pension') ? "text-white" : "text-blue-600 group-hover:text-blue-700")} />
                      <h3 className={cn("font-bold text-sm text-center relative z-10", !selectedPriorities.includes('pension') && "text-slate-900")}>Пенсия</h3>
                      <p className={cn("text-xs text-center relative z-10 mt-1", selectedPriorities.includes('pension') ? "text-blue-100" : "text-slate-500")}>
                        Спокойна старост
                      </p>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => togglePriority('housing')}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center h-full group relative overflow-hidden",
                        selectedPriorities.includes('housing')
                          ? "border-blue-500 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/50"
                          : isDarkMode ? "border-slate-700 hover:border-blue-400 bg-slate-800/50" : "border-slate-200 hover:border-blue-400 bg-white hover:shadow-lg"
                      )}
                    >
                      {selectedPriorities.includes('housing') && (
                        <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent" layoutId="housing-bg" />
                      )}
                      <Home className={cn("w-10 h-10 mb-2 relative z-10", selectedPriorities.includes('housing') ? "text-white" : "text-blue-600 group-hover:text-blue-700")} />
                      <h3 className={cn("font-bold text-sm text-center relative z-10", !selectedPriorities.includes('housing') && "text-slate-900")}>Ново жилище</h3>
                      <p className={cn("text-xs text-center relative z-10 mt-1", selectedPriorities.includes('housing') ? "text-blue-100" : "text-slate-500")}>
                        Собствен дом
                      </p>
                    </motion.button>
                    
                    {/* Row 2 */}
                    <motion.button
                      onClick={() => togglePriority('children')}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center h-full group relative overflow-hidden",
                        selectedPriorities.includes('children')
                          ? "border-blue-500 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/50"
                          : isDarkMode ? "border-slate-700 hover:border-blue-400 bg-slate-800/50" : "border-slate-200 hover:border-blue-400 bg-white hover:shadow-lg"
                      )}
                    >
                      {selectedPriorities.includes('children') && (
                        <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent" layoutId="children-bg" />
                      )}
                      <Baby className={cn("w-10 h-10 mb-2 relative z-10", selectedPriorities.includes('children') ? "text-white" : "text-blue-600 group-hover:text-blue-700")} />
                      <h3 className={cn("font-bold text-sm text-center relative z-10", !selectedPriorities.includes('children') && "text-slate-900")}>Бъдеще на децата</h3>
                      <p className={cn("text-xs text-center relative z-10 mt-1", selectedPriorities.includes('children') ? "text-blue-100" : "text-slate-500")}>
                        Образование и старт
                      </p>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => togglePriority('travel')}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center h-full group relative overflow-hidden",
                        selectedPriorities.includes('travel')
                          ? "border-blue-500 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/50"
                          : isDarkMode ? "border-slate-700 hover:border-blue-400 bg-slate-800/50" : "border-slate-200 hover:border-blue-400 bg-white hover:shadow-lg"
                      )}
                    >
                      {selectedPriorities.includes('travel') && (
                        <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent" layoutId="travel-bg" />
                      )}
                      <Plane className={cn("w-10 h-10 mb-2 relative z-10", selectedPriorities.includes('travel') ? "text-white" : "text-blue-600 group-hover:text-blue-700")} />
                      <h3 className={cn("font-bold text-sm text-center relative z-10", !selectedPriorities.includes('travel') && "text-slate-900")}>Пътувания</h3>
                      <p className={cn("text-xs text-center relative z-10 mt-1", selectedPriorities.includes('travel') ? "text-blue-100" : "text-slate-500")}>
                        Преживявания
                      </p>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => togglePriority('health')}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center h-full group relative overflow-hidden",
                        selectedPriorities.includes('health')
                          ? "border-blue-500 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/50"
                          : isDarkMode ? "border-slate-700 hover:border-blue-400 bg-slate-800/50" : "border-slate-200 hover:border-blue-400 bg-white hover:shadow-lg"
                      )}
                    >
                      {selectedPriorities.includes('health') && (
                        <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent" layoutId="health-bg" />
                      )}
                      <Heart className={cn("w-10 h-10 mb-2 relative z-10", selectedPriorities.includes('health') ? "text-white" : "text-blue-600 group-hover:text-blue-700")} />
                      <h3 className={cn("font-bold text-sm text-center relative z-10", !selectedPriorities.includes('health') && "text-slate-900")}>Здраве</h3>
                      <p className={cn("text-xs text-center relative z-10 mt-1", selectedPriorities.includes('health') ? "text-blue-100" : "text-slate-500")}>
                        Застраховки и грижа
                      </p>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => togglePriority('business')}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center h-full group relative overflow-hidden",
                        selectedPriorities.includes('business')
                          ? "border-blue-500 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/50"
                          : isDarkMode ? "border-slate-700 hover:border-blue-400 bg-slate-800/50" : "border-slate-200 hover:border-blue-400 bg-white hover:shadow-lg"
                      )}
                    >
                      {selectedPriorities.includes('business') && (
                        <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent" layoutId="business-bg" />
                      )}
                      <Briefcase className={cn("w-10 h-10 mb-2 relative z-10", selectedPriorities.includes('business') ? "text-white" : "text-blue-600 group-hover:text-blue-700")} />
                      <h3 className={cn("font-bold text-sm text-center relative z-10", !selectedPriorities.includes('business') && "text-slate-900")}>Бизнес</h3>
                      <p className={cn("text-xs text-center relative z-10 mt-1", selectedPriorities.includes('business') ? "text-blue-100" : "text-slate-500")}>
                        Собствен бизнес
                      </p>
                    </motion.button>
                  </div>

                  {selectedPriorities.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("p-3 rounded-xl mb-2 flex items-center gap-2 border-2 border-blue-200", isDarkMode ? "bg-slate-800" : "bg-gradient-to-r from-blue-50 to-indigo-50")}
                    >
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      <p className="text-sm font-semibold text-blue-700">
                        Избрани: {selectedPriorities.length} {selectedPriorities.length === 1 ? 'приоритет' : 'приоритета'}
                      </p>
                    </motion.div>
                  )}

                  <div className="flex justify-center">
                    <Button 
                      onClick={goNext}
                      disabled={selectedPriorities.length === 0}
                      className={cn(primaryButtonClass, "group")}
                    >
                      Следваща стъпка
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

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
                          <motion.button 
                            onClick={() => toggleLock('security')}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={cn(
                              "p-2 rounded-lg transition-all shadow-lg",
                              lockedGoals.security 
                                ? "bg-blue-600 text-white" 
                                : "bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                            )}
                          >
                            {lockedGoals.security ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </motion.button>
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
                      className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent relative z-10"
                      key={calculateGoals.security}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {formatNumber(calculateGoals.security)} €
                    </motion.p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 mb-4 relative z-10">
                      <span className="text-sm font-bold text-blue-700">{allocations.security}%</span>
                      <span className="text-xs text-blue-600">от дохода</span>
                    </div>
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
                          <motion.button 
                            onClick={() => toggleLock('pension')}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={cn(
                              "p-2 rounded-lg transition-all shadow-lg",
                              lockedGoals.pension 
                                ? "bg-blue-600 text-white" 
                                : "bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                            )}
                          >
                            {lockedGoals.pension ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </motion.button>
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
                      className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent relative z-10"
                      key={calculateGoals.pension}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {formatNumber(calculateGoals.pension)} €
                    </motion.p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 mb-4 relative z-10">
                      <span className="text-sm font-bold text-blue-700">{allocations.pension}%</span>
                      <span className="text-xs text-blue-600">от дохода</span>
                    </div>
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
                          <motion.button 
                            onClick={() => toggleLock('housing')}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={cn(
                              "p-2 rounded-lg transition-all shadow-lg",
                              lockedGoals.housing 
                                ? "bg-blue-600 text-white" 
                                : "bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                            )}
                          >
                            {lockedGoals.housing ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </motion.button>
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
                      className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent relative z-10"
                      key={calculateGoals.housing}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {formatNumber(calculateGoals.housing)} €
                    </motion.p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 mb-4 relative z-10">
                      <span className="text-sm font-bold text-blue-700">{allocations.housing}%</span>
                      <span className="text-xs text-blue-600">от дохода</span>
                    </div>
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
                          <motion.button 
                            onClick={() => toggleLock('cash')}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={cn(
                              "p-2 rounded-lg transition-all shadow-lg",
                              lockedGoals.cash 
                                ? "bg-blue-600 text-white" 
                                : "bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                            )}
                          >
                            {lockedGoals.cash ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </motion.button>
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
                      className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent relative z-10"
                      key={calculateGoals.cash}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {formatNumber(calculateGoals.cash)} €
                    </motion.p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 mb-4 relative z-10">
                      <span className="text-sm font-bold text-blue-700">{allocations.cash}%</span>
                      <span className="text-xs text-blue-600">от дохода</span>
                    </div>
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
              <motion.div
                key="step-7"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full px-4 h-[calc(100vh-48px)] flex flex-col"
              >
                <div className={cn("rounded-2xl border p-4 flex-1 flex flex-col", cardClasses)}>
                  {/* Inline Step Tracker */}
                  <div className="mb-2 pb-2 border-b border-slate-100">
                    <div className="flex justify-between items-start">
                      {VISUAL_STEPS.map((step, index) => {
                        const isActive = currentStep >= (index + 1);
                        const isCurrent = index === 6;
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

                  <h2 className="text-4xl font-bold mb-4">Система на работа</h2>
                  <p className={cn("text-lg mb-6", mutedTextClasses)}>
                    Нашият структуриран подход гарантира ясно и прозрачно финансово планиране.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 flex-1">
                    <div className={cn("rounded-xl border-2 p-6 transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600 flex flex-col justify-center relative", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <Search className={cn("w-20 h-20 absolute top-4 right-4 transition-colors", "text-blue-600 group-hover:text-white")} />
                      <p className={cn("text-sm tracking-widest mb-2 group-hover:text-blue-100 relative z-10", mutedTextClasses)}>ФАЗА 1</p>
                      <h3 className="text-2xl font-semibold mb-2 group-hover:text-white relative z-10">Анализ</h3>
                      <p className="text-blue-500 text-lg mb-3 font-medium group-hover:text-blue-200 relative z-10">Нужди, цели, желания</p>
                      <p className={cn("text-base leading-relaxed group-hover:text-blue-100 relative z-10", mutedTextClasses)}>
                        Анализираме целите на клиента за най-подходящите финансови решения.
                      </p>
                    </div>

                    <div className={cn("rounded-xl border-2 p-6 transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600 flex flex-col justify-center relative", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <Settings className={cn("w-20 h-20 absolute top-4 right-4 transition-colors", "text-blue-600/20 group-hover:text-white/30")} />
                      <p className={cn("text-xs tracking-widest mb-2 group-hover:text-blue-100 relative z-10", mutedTextClasses)}>ФАЗА 2</p>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-white relative z-10">Оптимизация</h3>
                      <p className="text-blue-500 text-base mb-3 font-medium group-hover:text-blue-200 relative z-10">Подготовка на финансовия план</p>
                      <p className={cn("text-sm leading-relaxed group-hover:text-blue-100 relative z-10", mutedTextClasses)}>
                        Разглеждаме съществуващи продукти за оптимизация и спестяване.
                      </p>
                    </div>

                    <div className={cn("rounded-xl border-2 p-6 transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600 flex flex-col justify-center relative", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <Presentation className={cn("w-20 h-20 absolute top-4 right-4 transition-colors", "text-blue-600/20 group-hover:text-white/30")} />
                      <p className={cn("text-xs tracking-widest mb-2 group-hover:text-blue-100 relative z-10", mutedTextClasses)}>ФАЗА 3</p>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-white relative z-10">Представяне</h3>
                      <p className="text-blue-500 text-base mb-3 font-medium group-hover:text-blue-200 relative z-10">Финансовият план и реализацията</p>
                      <p className={cn("text-sm leading-relaxed group-hover:text-blue-100 relative z-10", mutedTextClasses)}>
                        Представяме плана и привеждаме в действие решенията.
                      </p>
                    </div>

                    <div className={cn("rounded-xl border-2 p-6 transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600 flex flex-col justify-center relative", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <Handshake className={cn("w-20 h-20 absolute top-4 right-4 transition-colors", "text-blue-600/20 group-hover:text-white/30")} />
                      <p className={cn("text-xs tracking-widest mb-2 group-hover:text-blue-100 relative z-10", mutedTextClasses)}>ФАЗА 4</p>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-white relative z-10">Дългосрочно обслужване</h3>
                      <p className="text-blue-500 text-base mb-3 font-medium group-hover:text-blue-200 relative z-10">Дългосрочно и редовно</p>
                      <p className={cn("text-base leading-relaxed group-hover:text-blue-100 relative z-10", mutedTextClasses)}>
                        Постоянна подкрепа с редовни срещи и актуализации.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center mt-4">
                    <Button 
                      onClick={goNext}
                      className={cn(primaryButtonClass, "group")}
                    >
                      Напред
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
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
                className="w-full px-4"
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

                  <h2 className="text-3xl font-bold mb-3">Правила за сътрудничество</h2>
                  <p className={cn("text-base mb-6 max-w-2xl", mutedTextClasses)}>
                    Нашите принципи на работа гарантират професионализъм и доверие във всяка стъпка от процеса.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 flex-1">
                    <div className={cn("rounded-xl border-2 p-6 transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600 flex flex-col justify-center relative", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <Search className={cn("w-20 h-20 absolute top-4 right-4 transition-colors", "text-blue-600/20 group-hover:text-white/30")} />
                      <p className={cn("text-xs tracking-widest mb-2 group-hover:text-blue-100 relative z-10", mutedTextClasses)}>ФАЗА 1</p>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-white relative z-10">Анализ</h3>
                      <p className="text-blue-500 text-base mb-3 font-medium group-hover:text-blue-200 relative z-10">Нужди, цели, желания</p>
                      <p className={cn("text-sm leading-relaxed group-hover:text-blue-100 relative z-10", mutedTextClasses)}>
                        Анализираме целите на клиента за най-подходящите финансови решения.
                      </p>
                    </div>

                    <div className={cn("rounded-xl border-2 p-6 transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600 flex flex-col justify-center relative", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <Settings className={cn("w-20 h-20 absolute top-4 right-4 transition-colors", "text-blue-600/20 group-hover:text-white/30")} />
                      <p className={cn("text-xs tracking-widest mb-2 group-hover:text-blue-100 relative z-10", mutedTextClasses)}>ФАЗА 2</p>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-white relative z-10">Оптимизация</h3>
                      <p className="text-blue-500 text-base mb-3 font-medium group-hover:text-blue-200 relative z-10">Подготовка на финансовия план</p>
                      <p className={cn("text-sm leading-relaxed group-hover:text-blue-100 relative z-10", mutedTextClasses)}>
                        Разглеждаме съществуващи продукти за оптимизация и спестяване.
                      </p>
                    </div>

                    <div className={cn("rounded-xl border-2 p-6 transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600 flex flex-col justify-center relative", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <Presentation className={cn("w-20 h-20 absolute top-4 right-4 transition-colors", "text-blue-600/20 group-hover:text-white/30")} />
                      <p className={cn("text-xs tracking-widest mb-2 group-hover:text-blue-100 relative z-10", mutedTextClasses)}>ФАЗА 3</p>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-white relative z-10">Представяне</h3>
                      <p className="text-blue-500 text-base mb-3 font-medium group-hover:text-blue-200 relative z-10">Финансовият план и реализацията</p>
                      <p className={cn("text-sm leading-relaxed group-hover:text-blue-100 relative z-10", mutedTextClasses)}>
                        Представяме плана и привеждаме в действие решенията.
                      </p>
                    </div>

                    <div className={cn("rounded-xl border-2 p-6 transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600 flex flex-col justify-center relative", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <Handshake className={cn("w-20 h-20 absolute top-4 right-4 transition-colors", "text-blue-600/20 group-hover:text-white/30")} />
                      <p className={cn("text-xs tracking-widest mb-2 group-hover:text-blue-100 relative z-10", mutedTextClasses)}>ФАЗА 4</p>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-white relative z-10">Дългосрочно обслужване</h3>
                      <p className="text-blue-500 text-base mb-3 font-medium group-hover:text-blue-200 relative z-10">Дългосрочно и редовно</p>
                      <p className={cn("text-sm leading-relaxed group-hover:text-blue-100 relative z-10", mutedTextClasses)}>
                        Постоянна подкрепа с редовни срещи и актуализации.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button 
                      onClick={goNext}
                      className={cn(primaryButtonClass, "group")}
                    >
                      Напред
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

                  {/* Step 9: Summary & Next Steps */}
            {currentStep === 9 && (
              <motion.div
                key="step-9"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full px-4"
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

                <div className="max-w-4xl mx-auto">
                  {/* Success Header */}
                  <motion.div 
                    className="text-center mb-8"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div 
                      className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/50"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                      onAnimationComplete={() => {
                        confetti({
                          particleCount: 100,
                          spread: 70,
                          origin: { y: 0.6 },
                          colors: ['#3b82f6', '#6366f1', '#8b5cf6', '#60a5fa']
                        });
                      }}
                    >
                      <CheckCircle2 className="w-12 h-12 text-white" />
                    </motion.div>
                    <motion.h2 
                      className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      Поздравления! Сега да преминем към анализа!
                    </motion.h2>
                    <motion.div
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Calendar className="w-4 h-4" />
                      Приблизително време: 30 минути
                    </motion.div>
                  </motion.div>

                  {/* GDPR Consents - Enhanced Cards */}
                  <motion.div 
                    className={cn("rounded-2xl border-2 border-blue-200 p-6 mb-8", isDarkMode ? "bg-slate-800" : "bg-gradient-to-r from-blue-50/50 to-indigo-50/50")}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                  >
                    <Collapsible open={gdprTextOpen} onOpenChange={setGdprTextOpen}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-blue-900">Защита на личните данни</h3>
                        </div>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-100">
                            <span className="text-xs mr-2">{gdprTextOpen ? 'Скрий текста' : 'Прочети пълния текст'}</span>
                            <ChevronDown className={cn("w-4 h-4 transition-transform", gdprTextOpen && "rotate-180")} />
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      
                      <CollapsibleContent>
                        <div className="bg-white rounded-xl p-4 mb-4 border border-blue-100 max-h-64 overflow-y-auto">
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
{`С настоящото по смисъла на Закона за личните данни и на Регламент (ЕС) 2016/679 на Европейския парламент и на Съвета от 27 април 2016 година относно защитата на физическите лица във връзка с обработването на лични данни и относно свободното движение на такива данни и за отмяна на Директива 95/46/EО (Общ регламент относно защитата на данните) (по-долу наричан само „Приложимо законодателство") Давам съгласието си на "Интегрити Файненшъл Адвайзърс" ЕООД, с ЕИК: 208597115, със седалище и адрес на управление в гр. Бургас (8001), ул.Поморие, 20, ет. 5, ап. 1 ("Компанията") да обработва личните ми данни, посочени в този анализ.

Данните включва: Име, фамилия адрес на електронна поща, телефон и друг начин за връзка, финансово-икономическо състояние, данни на низходящи (деца), брой деца, кредитна информация, доходи.

Декларирам, че съм взел предвид и съм съгласен/а, че Компанията има право, на основание на даденото с настоящото от мен изрично съгласие, да обработва личните ми данни в съответствие с Приложимото законодателство, най-вече използвайки автоматизирани и не автоматизирани средства.

Своето съгласие за обработване на личните ми данни по смисъла на Приложимото право давам за определен срок, а именно за срока, необходим за обработването на предоставените от мен лични данни, но за не повече от 2 години.

С настоящото декларирам, че съм информиран и разбирам, че Компанията има основание да обработва моите лични данни и на база сключения с мен писмен договор.

Имам право с писмена молба от Компанията да изисквам:

• удостоверение дали личните ми данни са обработени или не
• информация за състоянието на обработката на личните ми данни
• точна информация за източника, от който са били получени данните
• списък на личните ми данни, които са обработвани
• поправка или заличаване на неправилните, непълните или неактуалните ми лични данни
• заличаване на личните ми данни, които са изпълнили своята цел
• блокиране на личните ми данни поради оттегляне на съгласието ми.`}
                          </p>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                    
                    <div className="space-y-3">
                      <motion.label 
                        whileHover={{ x: 4 }}
                        className={cn(
                          "flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200",
                          gdprConsentA 
                            ? "border-blue-500 bg-white shadow-lg shadow-blue-200/50" 
                            : "border-slate-200 hover:border-blue-300 bg-white"
                        )}
                      >
                        <Checkbox
                          checked={gdprConsentA}
                          onCheckedChange={(checked) => setGdprConsentA(checked)}
                          className="mt-1"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">
                            а) Финансов анализ и посредничество <span className="text-red-500">*</span>
                          </p>
                          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                            Съгласие за анализиране на личните ми финанси, финансово посредничество, 
                            предлагане и посредничество при избора на финансови продукти.
                          </p>
                        </div>
                      </motion.label>

                      <motion.label 
                        whileHover={{ x: 4 }}
                        className={cn(
                          "flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200",
                          gdprConsentC 
                            ? "border-blue-500 bg-white shadow-lg shadow-blue-200/50" 
                            : "border-slate-200 hover:border-blue-300 bg-white"
                        )}
                      >
                        <Checkbox
                          checked={gdprConsentC}
                          onCheckedChange={(checked) => setGdprConsentC(checked)}
                          className="mt-1"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">
                            б) Предоставяне на трети лица <span className="text-red-500">*</span>
                          </p>
                          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                            Съгласие за предоставяне на личните ми данни на застраховател, кредитна институция, 
                            пенсионноосигурително дружество или инвестиционен посредник.
                          </p>
                        </div>
                      </motion.label>

                      <motion.label 
                        whileHover={{ x: 4 }}
                        className={cn(
                          "flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200",
                          gdprConsentB 
                            ? "border-blue-500 bg-white shadow-lg shadow-blue-200/50" 
                            : "border-slate-200 hover:border-blue-300 bg-white"
                        )}
                      >
                        <Checkbox
                          checked={gdprConsentB}
                          onCheckedChange={(checked) => setGdprConsentB(checked)}
                          className="mt-1"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">в) Маркетинг и информация</p>
                          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                            Съгласие за информиране относно условия по предоставяни услуги, други услуги и продукти, 
                            информация от финансовите пазари и директен маркетинг.
                          </p>
                        </div>
                      </motion.label>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div 
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    <Button 
                      className={cn(
                        "w-full sm:w-auto text-lg group shadow-2xl",
                        primaryButtonClass
                      )}
                      disabled={!gdprConsentA || !gdprConsentC}
                      onClick={async () => {
                        // Създаване/актуализиране на досие при завършване на Financial Planner
                        try {
                          const clientData = {
                            first_name: clientFirstName,
                            last_name: clientLastName,
                            email: clientEmail,
                            phone: clientPhone,
                            stage: 'financial_planner',
                            status: 'active',
                            family_type: familyType,
                            children_count: childrenCount,
                            children_names: childrenNames,
                            children_ages: childrenAges,
                            gdpr_consent_a: gdprConsentA,
                            gdpr_consent_b: gdprConsentB,
                            gdpr_consent_c: gdprConsentC,
                            gdpr_consent_date: new Date().toISOString()
                          };

                          if (familyType === 'family') {
                            clientData.partner_first_name = partnerFirstName;
                            clientData.partner_last_name = partnerLastName;
                            clientData.partner_email = partnerEmail;
                          }

                          let client;
                          if (clientId) {
                            // Update existing client
                            await base44.entities.Client.update(clientId, clientData);
                            client = { id: clientId, ...clientData };
                          } else {
                            // Create new client
                            client = await base44.entities.Client.create(clientData);
                          }

                          // Предаване на данните към анализа
                          const plannerData = {
                            client_id: client.id,
                            family_type: familyType,
                            client_first_name: clientFirstName,
                            client_last_name: clientLastName,
                            client_phone: clientPhone,
                            client_email: clientEmail,
                            partner_first_name: partnerFirstName,
                            partner_last_name: partnerLastName,
                            partner_phone: partnerPhone,
                            partner_email: partnerEmail,
                            children_count: childrenCount,
                            children_names: childrenNames,
                            children_ages: childrenAges,
                            client_insurance_type: clientInsuranceType,
                            partner_insurance_type: partnerInsuranceType,
                            client_age: clientAge,
                            partner_age: partnerAge,
                            monthly_income: monthlyIncome,
                            partner_income: partnerIncome,
                            gdpr_consent_a: gdprConsentA,
                            gdpr_consent_b: gdprConsentB,
                            gdpr_consent_c: gdprConsentC
                          };

                          // Запазване в localStorage за използване в анализа
                          localStorage.setItem('financialPlannerData', JSON.stringify(plannerData));

                          // Навигация към анализа
                          window.location.href = createPageUrl('FinancialAnalysis');
                        } catch (error) {
                          console.error('Error creating client:', error);
                        }
                      }}
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Започни Детайлния Анализ
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
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