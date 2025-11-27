import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Users, 
  User, 
  Briefcase, 
  Building2,
  PiggyBank,
  Home,
  Palmtree,
  Landmark,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Shield,
  CheckCircle,
  TrendingUp,
  Wallet,
  Target,
  Car,
  CreditCard,
  Settings,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function FinancialPlanner() {
  // Current stage (0-10 like original Life Planner)
  const [currentStage, setCurrentStage] = useState(0);
  
  // Family type: 'individual' or 'family'
  const [familyType, setFamilyType] = useState(null);
  
  // Employment types
  const [clientEmployment, setClientEmployment] = useState('employee');
  const [partnerEmployment, setPartnerEmployment] = useState('employee');
  
  // Income and age for client
  const [clientIncome, setClientIncome] = useState(2000);
  const [clientAge, setClientAge] = useState(35);
  
  // Income and age for partner (if family)
  const [partnerIncome, setPartnerIncome] = useState(1500);
  const [partnerAge, setPartnerAge] = useState(33);
  
  // Goal allocations
  const [goals, setGoals] = useState({
    reserve: 0,
    pension: 0,
    housing: 0,
    other: 0,
    credit: 0
  });
  
  // Settings panel visibility
  const [showSettings, setShowSettings] = useState(false);

  // Calculate total wealth potential
  const calculateTotalWealth = () => {
    const clientYearsToRetirement = Math.max(65 - clientAge, 0);
    const clientMonthlyContribution = clientIncome * 0.20;
    let clientWealth = clientMonthlyContribution * 12 * clientYearsToRetirement;
    
    // Apply employment multiplier
    if (clientEmployment === 'entrepreneur') {
      clientWealth *= 1.2;
    }
    
    let totalWealth = clientWealth;
    
    // Add partner wealth if family
    if (familyType === 'family') {
      const partnerYearsToRetirement = Math.max(65 - partnerAge, 0);
      const partnerMonthlyContribution = partnerIncome * 0.20;
      let partnerWealth = partnerMonthlyContribution * 12 * partnerYearsToRetirement;
      
      if (partnerEmployment === 'entrepreneur') {
        partnerWealth *= 1.2;
      }
      
      totalWealth += partnerWealth;
    }
    
    return Math.round(totalWealth);
  };

  const totalWealth = calculateTotalWealth();
  const maxPerGoal = totalWealth * 0.6;

  // Initialize goals when reaching goal stage
  useEffect(() => {
    if (currentStage === 10) {
      const baseAmount = totalWealth * 0.12;
      setGoals({
        reserve: Math.round(baseAmount * 0.8),
        pension: Math.round(baseAmount * 1.5),
        housing: Math.round(baseAmount * 1.8),
        other: Math.round(baseAmount * 0.6),
        credit: 0
      });
    }
  }, [currentStage, totalWealth]);

  // Handle goal slider change with redistribution
  const handleGoalChange = (goalKey, newValue) => {
    const newGoals = { ...goals };
    const oldValue = goals[goalKey];
    const difference = newValue - oldValue;
    
    newGoals[goalKey] = newValue;
    
    // Redistribute difference among other goals proportionally
    const otherKeys = Object.keys(goals).filter(k => k !== goalKey && goals[k] > 0);
    const otherTotal = otherKeys.reduce((sum, k) => sum + goals[k], 0);
    
    if (otherTotal > 0 && difference !== 0) {
      otherKeys.forEach(key => {
        const proportion = goals[key] / otherTotal;
        const adjustment = difference * proportion * 0.3;
        newGoals[key] = Math.max(0, Math.round(goals[key] - adjustment));
      });
    }
    
    setGoals(newGoals);
  };

  const totalAllocated = Object.values(goals).reduce((a, b) => a + b, 0);

  // Navigation handlers
  const goToNextStage = () => {
    if (currentStage < 11) {
      setCurrentStage(currentStage + 1);
    }
  };

  const goToPrevStage = () => {
    if (currentStage > 0) {
      setCurrentStage(currentStage - 1);
    }
  };

  // Format number with spaces as thousand separators
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  // Goal configurations
  const goalConfigs = [
    { 
      key: 'reserve', 
      title: 'Финансова сигурност', 
      icon: Shield,
      color: 'from-amber-500 to-orange-500',
      bgLight: 'bg-amber-50'
    },
    { 
      key: 'pension', 
      title: 'Пенсия', 
      icon: Palmtree,
      color: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-50'
    },
    { 
      key: 'housing', 
      title: 'Жилище', 
      icon: Home,
      color: 'from-violet-500 to-purple-500',
      bgLight: 'bg-violet-50'
    },
    { 
      key: 'other', 
      title: 'Други цели', 
      icon: Target,
      color: 'from-rose-500 to-pink-500',
      bgLight: 'bg-rose-50'
    },
    { 
      key: 'credit', 
      title: 'Кредит', 
      icon: CreditCard,
      color: 'from-slate-500 to-slate-600',
      bgLight: 'bg-slate-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <svg className="absolute top-0 left-0 w-full opacity-5" viewBox="0 0 1440 320">
            <path fill="#3b82f6" d="M0,192L48,176C96,160,192,128,288,133.3C384,139,480,181,576,186.7C672,192,768,160,864,154.7C960,149,1056,171,1152,165.3C1248,160,1344,128,1392,112L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
          </svg>
        </div>
      </div>

      <div className="relative z-10 pt-24 pb-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          
          <AnimatePresence mode="wait">
            
            {/* Stage 0: Initial Screen */}
            {currentStage === 0 && (
              <motion.div
                key="stage-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[70vh]"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  {/* Logo/Icon placeholder for animation */}
                  <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                    <TrendingUp className="h-16 w-16 text-white" />
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                    Financial <span className="text-blue-600">Planner</span>
                  </h1>
                  
                  <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto">
                    Открийте вашия финансов потенциал и създайте план за бъдещето си
                  </p>
                  
                  <Button 
                    onClick={() => setCurrentStage(1)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
                  >
                    Създавам финансов план
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {/* Stage 1: Family Type Selection */}
            {currentStage === 1 && (
              <motion.div
                key="stage-1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="max-w-2xl mx-auto"
              >
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">Изберете</h2>
                  <p className="text-slate-600">Планирате сами или със семейството?</p>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-10">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setFamilyType('individual');
                      setCurrentStage(3); // Skip to client employment
                    }}
                    className={cn(
                      "p-8 rounded-2xl border-2 transition-all flex flex-col items-center gap-4",
                      familyType === 'individual' 
                        ? "border-blue-500 bg-blue-50 shadow-lg" 
                        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                    )}
                  >
                    <div className={cn(
                      "w-20 h-20 rounded-2xl flex items-center justify-center",
                      familyType === 'individual' ? "bg-blue-500" : "bg-slate-100"
                    )}>
                      <User className={cn(
                        "h-10 w-10",
                        familyType === 'individual' ? "text-white" : "text-slate-400"
                      )} />
                    </div>
                    <span className={cn(
                      "text-xl font-semibold",
                      familyType === 'individual' ? "text-blue-700" : "text-slate-700"
                    )}>
                      Отделен индивид
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setFamilyType('family');
                      setCurrentStage(2); // Go to partner employment
                    }}
                    className={cn(
                      "p-8 rounded-2xl border-2 transition-all flex flex-col items-center gap-4",
                      familyType === 'family' 
                        ? "border-blue-500 bg-blue-50 shadow-lg" 
                        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                    )}
                  >
                    <div className={cn(
                      "w-20 h-20 rounded-2xl flex items-center justify-center",
                      familyType === 'family' ? "bg-blue-500" : "bg-slate-100"
                    )}>
                      <Users className={cn(
                        "h-10 w-10",
                        familyType === 'family' ? "text-white" : "text-slate-400"
                      )} />
                    </div>
                    <span className={cn(
                      "text-xl font-semibold",
                      familyType === 'family' ? "text-blue-700" : "text-slate-700"
                    )}>
                      Семейство
                    </span>
                  </motion.button>
                </div>

                <div className="flex justify-center">
                  <Button 
                    variant="ghost" 
                    onClick={goToPrevStage}
                    className="text-slate-500"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Назад
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Stage 2: Family - Both Employment Types */}
            {currentStage === 2 && familyType === 'family' && (
              <motion.div
                key="stage-2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="max-w-4xl mx-auto"
              >
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">Тип на заетост</h2>
                  <p className="text-slate-600">Изберете за всеки член на семейството</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-10">
                  {/* Client */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      Клиент
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setClientEmployment('employee')}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                          clientEmployment === 'employee'
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-blue-300"
                        )}
                      >
                        <Briefcase className={cn(
                          "h-8 w-8",
                          clientEmployment === 'employee' ? "text-blue-500" : "text-slate-400"
                        )} />
                        <span className="font-medium text-sm">Служител</span>
                      </button>
                      <button
                        onClick={() => setClientEmployment('entrepreneur')}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                          clientEmployment === 'entrepreneur'
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-blue-300"
                        )}
                      >
                        <Building2 className={cn(
                          "h-8 w-8",
                          clientEmployment === 'entrepreneur' ? "text-blue-500" : "text-slate-400"
                        )} />
                        <span className="font-medium text-sm">Предприемач</span>
                      </button>
                    </div>
                  </div>

                  {/* Partner */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-violet-500" />
                      Партньор
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setPartnerEmployment('employee')}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                          partnerEmployment === 'employee'
                            ? "border-violet-500 bg-violet-50"
                            : "border-slate-200 hover:border-violet-300"
                        )}
                      >
                        <Briefcase className={cn(
                          "h-8 w-8",
                          partnerEmployment === 'employee' ? "text-violet-500" : "text-slate-400"
                        )} />
                        <span className="font-medium text-sm">Служител</span>
                      </button>
                      <button
                        onClick={() => setPartnerEmployment('entrepreneur')}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                          partnerEmployment === 'entrepreneur'
                            ? "border-violet-500 bg-violet-50"
                            : "border-slate-200 hover:border-violet-300"
                        )}
                      >
                        <Building2 className={cn(
                          "h-8 w-8",
                          partnerEmployment === 'entrepreneur' ? "text-violet-500" : "text-slate-400"
                        )} />
                        <span className="font-medium text-sm">Предприемач</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={goToPrevStage}
                    className="text-slate-500"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Назад
                  </Button>
                  <Button 
                    onClick={() => setCurrentStage(4)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Продължи
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Stage 3: Individual - Client Employment Only */}
            {currentStage === 3 && familyType === 'individual' && (
              <motion.div
                key="stage-3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="max-w-xl mx-auto"
              >
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">Тип на заетост</h2>
                  <p className="text-slate-600">Как се осигурявате?</p>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 mb-10">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setClientEmployment('employee')}
                      className={cn(
                        "p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3",
                        clientEmployment === 'employee'
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-blue-300"
                      )}
                    >
                      <Briefcase className={cn(
                        "h-12 w-12",
                        clientEmployment === 'employee' ? "text-blue-500" : "text-slate-400"
                      )} />
                      <span className="font-semibold">Служител</span>
                    </button>
                    <button
                      onClick={() => setClientEmployment('entrepreneur')}
                      className={cn(
                        "p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3",
                        clientEmployment === 'entrepreneur'
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-blue-300"
                      )}
                    >
                      <Building2 className={cn(
                        "h-12 w-12",
                        clientEmployment === 'entrepreneur' ? "text-blue-500" : "text-slate-400"
                      )} />
                      <span className="font-semibold">Предприемач</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setCurrentStage(1)}
                    className="text-slate-500"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Назад
                  </Button>
                  <Button 
                    onClick={() => setCurrentStage(5)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Продължи
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Stage 4: Family - Income & Age for Both */}
            {currentStage === 4 && familyType === 'family' && (
              <motion.div
                key="stage-4"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="max-w-4xl mx-auto"
              >
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">Доход и възраст</h2>
                  <p className="text-slate-600">Въведете данни за всеки член на семейството</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-10">
                  {/* Client */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-700 mb-6 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      Клиент
                    </h3>
                    
                    {/* Income */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-slate-600">Доход</span>
                        <span className="text-2xl font-bold text-blue-600">{formatNumber(clientIncome)} лв.</span>
                      </div>
                      <Slider
                        value={[clientIncome]}
                        onValueChange={(v) => setClientIncome(v[0])}
                        min={500}
                        max={20000}
                        step={100}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>500</span>
                        <span>20 000</span>
                      </div>
                    </div>

                    {/* Age */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-slate-600">Възраст</span>
                        <span className="text-2xl font-bold text-blue-600">{clientAge} г.</span>
                      </div>
                      <Slider
                        value={[clientAge]}
                        onValueChange={(v) => setClientAge(v[0])}
                        min={18}
                        max={65}
                        step={1}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>18</span>
                        <span>65</span>
                      </div>
                    </div>
                  </div>

                  {/* Partner */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-700 mb-6 flex items-center gap-2">
                      <User className="h-5 w-5 text-violet-500" />
                      Партньор
                    </h3>
                    
                    {/* Income */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-slate-600">Доход</span>
                        <span className="text-2xl font-bold text-violet-600">{formatNumber(partnerIncome)} лв.</span>
                      </div>
                      <Slider
                        value={[partnerIncome]}
                        onValueChange={(v) => setPartnerIncome(v[0])}
                        min={500}
                        max={20000}
                        step={100}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>500</span>
                        <span>20 000</span>
                      </div>
                    </div>

                    {/* Age */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-slate-600">Възраст</span>
                        <span className="text-2xl font-bold text-violet-600">{partnerAge} г.</span>
                      </div>
                      <Slider
                        value={[partnerAge]}
                        onValueChange={(v) => setPartnerAge(v[0])}
                        min={18}
                        max={65}
                        step={1}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>18</span>
                        <span>65</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setCurrentStage(2)}
                    className="text-slate-500"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Назад
                  </Button>
                  <Button 
                    onClick={() => setCurrentStage(10)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Виж резултата
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Stage 5: Individual - Income & Age */}
            {currentStage === 5 && familyType === 'individual' && (
              <motion.div
                key="stage-5"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="max-w-xl mx-auto"
              >
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">Доход и възраст</h2>
                  <p className="text-slate-600">Въведете вашите данни</p>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 mb-10">
                  {/* Income */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-medium text-slate-700 flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-blue-500" />
                        Доход
                      </span>
                      <span className="text-3xl font-bold text-blue-600">{formatNumber(clientIncome)} лв.</span>
                    </div>
                    <Slider
                      value={[clientIncome]}
                      onValueChange={(v) => setClientIncome(v[0])}
                      min={500}
                      max={20000}
                      step={100}
                      className="py-2"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                      <span>500 лв.</span>
                      <span>20 000 лв.</span>
                    </div>
                  </div>

                  {/* Age */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-medium text-slate-700 flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-500" />
                        Възраст
                      </span>
                      <span className="text-3xl font-bold text-blue-600">{clientAge} години</span>
                    </div>
                    <Slider
                      value={[clientAge]}
                      onValueChange={(v) => setClientAge(v[0])}
                      min={18}
                      max={65}
                      step={1}
                      className="py-2"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                      <span>18</span>
                      <span>65</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setCurrentStage(3)}
                    className="text-slate-500"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Назад
                  </Button>
                  <Button 
                    onClick={() => setCurrentStage(10)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Виж резултата
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Stage 10: Goals Distribution */}
            {currentStage === 10 && (
              <motion.div
                key="stage-10"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                {/* Total Wealth Header */}
                <div className="text-center mb-8">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Имуществото общо</p>
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="inline-block"
                  >
                    <span className="text-5xl md:text-6xl font-bold text-blue-600">
                      {formatNumber(totalWealth)}
                    </span>
                    <span className="text-2xl text-slate-500 ml-2">BGN</span>
                  </motion.div>
                </div>

                {/* Goals Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                  {goalConfigs.map((goal, index) => {
                    const Icon = goal.icon;
                    return (
                      <motion.div
                        key={goal.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100"
                      >
                        {/* Icon placeholder for animation */}
                        <div className={cn(
                          "w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center bg-gradient-to-br",
                          goal.color
                        )}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        
                        <h4 className="text-sm font-medium text-slate-600 text-center mb-2">
                          {goal.title}
                        </h4>
                        
                        <div className="text-center mb-3">
                          <span className="text-xl font-bold text-slate-800">
                            {formatNumber(goals[goal.key])}
                          </span>
                        </div>

                        {/* Vertical slider representation */}
                        <div className="relative h-32 bg-slate-100 rounded-lg overflow-hidden mx-auto w-12">
                          <motion.div 
                            className={cn("absolute bottom-0 left-0 right-0 rounded-lg bg-gradient-to-t", goal.color)}
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.min((goals[goal.key] / maxPerGoal) * 100, 100)}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>

                        <Slider
                          value={[goals[goal.key]]}
                          onValueChange={(v) => handleGoalChange(goal.key, v[0])}
                          min={0}
                          max={maxPerGoal}
                          step={1000}
                          className="mt-3"
                          orientation="horizontal"
                        />
                      </motion.div>
                    );
                  })}
                </div>

                {/* Total Allocated */}
                <div className="text-center mb-8">
                  <div className="inline-block bg-white rounded-xl px-6 py-3 shadow-md border border-slate-100">
                    <span className="text-slate-500">Разпределено: </span>
                    <span className="text-xl font-bold text-blue-600">{formatNumber(totalAllocated)} BGN</span>
                    <span className="text-slate-400 ml-2">
                      ({Math.round((totalAllocated / totalWealth) * 100)}%)
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setCurrentStage(familyType === 'family' ? 4 : 5)}
                    className="text-slate-500"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Назад
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowSettings(!showSettings)}
                    className="border-slate-300"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Настройки
                  </Button>
                  
                  <Button 
                    onClick={() => setCurrentStage(11)}
                    className="bg-blue-600 hover:bg-blue-700 px-8"
                  >
                    Искам да продължа
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                {/* Settings Panel */}
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-slate-100"
                    >
                      <h3 className="text-lg font-semibold text-slate-700 mb-4">Промени параметрите</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm font-medium text-slate-600 mb-2 block">
                            Месечен доход (клиент)
                          </label>
                          <Slider
                            value={[clientIncome]}
                            onValueChange={(v) => setClientIncome(v[0])}
                            min={500}
                            max={20000}
                            step={100}
                          />
                          <div className="text-right text-sm text-blue-600 mt-1">{formatNumber(clientIncome)} лв.</div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600 mb-2 block">
                            Възраст (клиент)
                          </label>
                          <Slider
                            value={[clientAge]}
                            onValueChange={(v) => setClientAge(v[0])}
                            min={18}
                            max={65}
                            step={1}
                          />
                          <div className="text-right text-sm text-blue-600 mt-1">{clientAge} години</div>
                        </div>
                        {familyType === 'family' && (
                          <>
                            <div>
                              <label className="text-sm font-medium text-slate-600 mb-2 block">
                                Месечен доход (партньор)
                              </label>
                              <Slider
                                value={[partnerIncome]}
                                onValueChange={(v) => setPartnerIncome(v[0])}
                                min={500}
                                max={20000}
                                step={100}
                              />
                              <div className="text-right text-sm text-violet-600 mt-1">{formatNumber(partnerIncome)} лв.</div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600 mb-2 block">
                                Възраст (партньор)
                              </label>
                              <Slider
                                value={[partnerAge]}
                                onValueChange={(v) => setPartnerAge(v[0])}
                                min={18}
                                max={65}
                                step={1}
                              />
                              <div className="text-right text-sm text-violet-600 mt-1">{partnerAge} години</div>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Stage 11: Final / Redirect */}
            {currentStage === 11 && (
              <motion.div
                key="stage-11"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-lg mx-auto text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
                >
                  <CheckCircle className="h-12 w-12 text-white" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-slate-800 mb-4"
                >
                  Отлично!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-slate-600 mb-8"
                >
                  Вече знаете какъв е вашият финансов потенциал. Нека преминем към детайлния анализ!
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-4"
                >
                  <Link to={createPageUrl('FinancialAnalysis')}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105">
                      <Sparkles className="mr-2 h-5 w-5" />
                      Към финансовия анализ
                    </Button>
                  </Link>
                  
                  <div>
                    <Button 
                      variant="ghost" 
                      onClick={() => setCurrentStage(10)}
                      className="text-slate-500"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Върни се назад
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}