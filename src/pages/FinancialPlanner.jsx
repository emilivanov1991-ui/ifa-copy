import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Moon, Sun, RotateCcw } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Step definitions
const STEPS = [
  { id: 1, label: 'С КОГО ПЛАНИРАМЕ?' },
  { id: 2, label: 'ВЪЗРАСТ НА КЛИЕНТА' },
  { id: 3, label: 'ВЪЗРАСТ НА ПАРТНЬОРА' },
  { id: 4, label: 'МЕСЕЧЕН ДОХОД' },
  { id: 5, label: 'ОСНОВЕН ПРИОРИТЕТ' },
  { id: 6, label: 'ФИНАНСОВА РАМКА' },
  { id: 7, label: 'СИСТЕМА НА РАБОТА' },
  { id: 8, label: 'МИКРО ПЛАН' },
];

export default function FinancialPlanner() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Data states
  const [familyType, setFamilyType] = useState(null); // 'individual' | 'family'
  const [clientAge, setClientAge] = useState(35);
  const [partnerAge, setPartnerAge] = useState(33);
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [mainPriority, setMainPriority] = useState(null); // 'security' | 'growth' | 'legacy'
  
  // Financial framework values
  const [goals, setGoals] = useState({
    security: 65000,
    pension: 180000,
    housing: 220000,
    cash: 45000
  });

  // Calculate total wealth
  const totalWealth = Object.values(goals).reduce((a, b) => a + b, 0);

  // Format number with spaces
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Navigation
  const goNext = () => {
    if (currentStep === 1 && familyType === 'individual') {
      setCurrentStep(2); // Skip to client age, will skip partner age
    } else if (currentStep === 2 && familyType === 'individual') {
      setCurrentStep(4); // Skip partner age for individual
    } else if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep === 4 && familyType === 'individual') {
      setCurrentStep(2); // Skip back over partner age
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const restart = () => {
    setCurrentStep(1);
    setFamilyType(null);
    setClientAge(35);
    setPartnerAge(33);
    setMonthlyIncome(5000);
    setMainPriority(null);
  };

  // Get visible steps for progress bar
  const getVisibleSteps = () => {
    if (familyType === 'individual') {
      return STEPS.filter(s => s.id !== 3); // Hide partner age step
    }
    return STEPS;
  };

  const visibleSteps = getVisibleSteps();

  // Theme classes
  const themeClasses = isDarkMode 
    ? 'bg-slate-950 text-white' 
    : 'bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900';

  const cardClasses = isDarkMode
    ? 'bg-slate-900/80 border-slate-800'
    : 'bg-white border-slate-200';

  const mutedTextClasses = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const accentColor = 'text-blue-400';

  return (
    <div className={cn("min-h-screen transition-colors duration-500", themeClasses)}>
      {/* Top Navigation Bar */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
        <div className={cn(
          "flex items-center gap-4 px-6 py-3 rounded-full border backdrop-blur-xl",
          isDarkMode ? "bg-slate-900/90 border-slate-700" : "bg-white/90 border-slate-200 shadow-lg"
        )}>
          <button 
            onClick={goBack}
            disabled={currentStep === 1}
            className={cn(
              "text-sm font-medium tracking-widest transition-opacity",
              currentStep === 1 ? "opacity-30 cursor-not-allowed" : "opacity-100 hover:opacity-70"
            )}
          >
            НАЗАД
          </button>
          
          <div className="flex items-center gap-2">
            {visibleSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  currentStep === step.id 
                    ? "bg-blue-500 ring-4 ring-blue-500/30" 
                    : isDarkMode 
                      ? "bg-slate-700 hover:bg-slate-600" 
                      : "bg-slate-300 hover:bg-slate-400"
                )}
              />
            ))}
          </div>
          
          <button 
            onClick={goNext}
            disabled={currentStep === 8}
            className={cn(
              "text-sm font-medium tracking-widest transition-opacity",
              currentStep === 8 ? "opacity-30 cursor-not-allowed" : "opacity-100 hover:opacity-70"
            )}
          >
            НАПРЕД
          </button>
          
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              isDarkMode 
                ? "bg-slate-800 text-amber-400" 
                : "bg-slate-100 text-slate-700"
            )}
          >
            {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            {isDarkMode ? 'НОЩ' : 'ДЕН'}
          </button>
        </div>
        
        {/* Current step label */}
        <div className="text-center mt-3">
          <span className={cn("text-xs tracking-widest", mutedTextClasses)}>
            {STEPS.find(s => s.id === currentStep)?.label}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-44 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
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
                  <p className={cn("text-sm mb-8", mutedTextClasses)}>
                    Стъпките от оригиналния LifePlanner се представят като самостоятелни сцени. 
                    Изборите ви се запазват през целия поток.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={goBack}
                      disabled={currentStep === 1}
                      className={cn(
                        "rounded-full px-6",
                        isDarkMode ? "border-slate-700 hover:bg-slate-800" : ""
                      )}
                    >
                      Назад
                    </Button>
                    <Button 
                      onClick={goNext}
                      disabled={!familyType}
                      className="rounded-full px-6 bg-blue-600 hover:bg-blue-700"
                    >
                      Напред
                    </Button>
                  </div>
                </div>

                {/* Right side - card */}
                <div className={cn("rounded-3xl border p-8", cardClasses)}>
                  <div className="flex items-center justify-between mb-6">
                    <p className={cn("text-sm tracking-widest", mutedTextClasses)}>СТЪПКА 1</p>
                    <button onClick={restart} className={cn("text-sm", mutedTextClasses, "hover:text-blue-400")}>
                      рестарт
                    </button>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-2">С кого планираме?</h2>
                  <p className={cn("text-sm mb-8", mutedTextClasses)}>
                    Изберете дали работим с един клиент или с домакинство.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                      onClick={() => setFamilyType('individual')}
                      className={cn(
                        "p-6 rounded-2xl border-2 text-left transition-all",
                        familyType === 'individual'
                          ? "border-blue-500 bg-blue-500/10"
                          : isDarkMode 
                            ? "border-slate-700 hover:border-slate-600" 
                            : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <h3 className="font-semibold mb-1">Индивид</h3>
                      <p className={cn("text-sm", mutedTextClasses)}>
                        Един човек, фокус върху лични цели.
                      </p>
                    </button>
                    
                    <button
                      onClick={() => setFamilyType('family')}
                      className={cn(
                        "p-6 rounded-2xl border-2 text-left transition-all",
                        familyType === 'family'
                          ? "border-blue-500 bg-blue-500/10"
                          : isDarkMode 
                            ? "border-slate-700 hover:border-slate-600" 
                            : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <h3 className="font-semibold mb-1">Семейство</h3>
                      <p className={cn("text-sm", mutedTextClasses)}>
                        Партньорски план и защитени бюджети.
                      </p>
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={goBack}
                      className={cn(
                        "rounded-full px-6",
                        isDarkMode ? "border-slate-700 hover:bg-slate-800" : ""
                      )}
                    >
                      Назад
                    </Button>
                    <Button 
                      onClick={goNext}
                      disabled={!familyType}
                      className="rounded-full px-6 bg-blue-600 hover:bg-blue-700"
                    >
                      СЛЕДВАЩА СТЪПКА
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Client Age */}
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
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">Възраст на клиента</h1>
                  <p className={cn("text-lg mb-6", mutedTextClasses)}>
                    Въведете възрастта на основния клиент.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={goBack}
                      className={cn("rounded-full px-6", isDarkMode ? "border-slate-700 hover:bg-slate-800" : "")}
                    >
                      Назад
                    </Button>
                    <Button onClick={goNext} className="rounded-full px-6 bg-blue-600 hover:bg-blue-700">
                      Напред
                    </Button>
                  </div>
                </div>

                <div className={cn("rounded-3xl border p-8", cardClasses)}>
                  <div className="flex items-center justify-between mb-6">
                    <p className={cn("text-sm tracking-widest", mutedTextClasses)}>СТЪПКА 2</p>
                    <button onClick={restart} className={cn("text-sm", mutedTextClasses, "hover:text-blue-400")}>
                      рестарт
                    </button>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-8">Възраст на клиента</h2>

                  <div className="text-center mb-8">
                    <span className="text-6xl font-bold text-blue-500">{clientAge}</span>
                    <span className={cn("text-2xl ml-2", mutedTextClasses)}>години</span>
                  </div>

                  <Slider
                    value={[clientAge]}
                    onValueChange={(v) => setClientAge(v[0])}
                    min={18}
                    max={70}
                    step={1}
                    className="mb-4"
                  />
                  <div className={cn("flex justify-between text-sm", mutedTextClasses)}>
                    <span>18</span>
                    <span>70</span>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <Button 
                      variant="outline" 
                      onClick={goBack}
                      className={cn("rounded-full px-6", isDarkMode ? "border-slate-700 hover:bg-slate-800" : "")}
                    >
                      Назад
                    </Button>
                    <Button onClick={goNext} className="rounded-full px-6 bg-blue-600 hover:bg-blue-700">
                      СЛЕДВАЩА СТЪПКА
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Partner Age (only for family) */}
            {currentStep === 3 && familyType === 'family' && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-2 gap-8 items-start"
              >
                <div className="lg:pr-12">
                  <p className={cn("text-sm tracking-widest mb-4", accentColor)}>СТЪПКА 3</p>
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">Възраст на партньора</h1>
                  <p className={cn("text-lg mb-6", mutedTextClasses)}>
                    Въведете възрастта на партньора.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={goBack}
                      className={cn("rounded-full px-6", isDarkMode ? "border-slate-700 hover:bg-slate-800" : "")}
                    >
                      Назад
                    </Button>
                    <Button onClick={goNext} className="rounded-full px-6 bg-blue-600 hover:bg-blue-700">
                      Напред
                    </Button>
                  </div>
                </div>

                <div className={cn("rounded-3xl border p-8", cardClasses)}>
                  <div className="flex items-center justify-between mb-6">
                    <p className={cn("text-sm tracking-widest", mutedTextClasses)}>СТЪПКА 3</p>
                    <button onClick={restart} className={cn("text-sm", mutedTextClasses, "hover:text-blue-400")}>
                      рестарт
                    </button>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-8">Възраст на партньора</h2>

                  <div className="text-center mb-8">
                    <span className="text-6xl font-bold text-blue-500">{partnerAge}</span>
                    <span className={cn("text-2xl ml-2", mutedTextClasses)}>години</span>
                  </div>

                  <Slider
                    value={[partnerAge]}
                    onValueChange={(v) => setPartnerAge(v[0])}
                    min={18}
                    max={70}
                    step={1}
                    className="mb-4"
                  />
                  <div className={cn("flex justify-between text-sm", mutedTextClasses)}>
                    <span>18</span>
                    <span>70</span>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <Button 
                      variant="outline" 
                      onClick={goBack}
                      className={cn("rounded-full px-6", isDarkMode ? "border-slate-700 hover:bg-slate-800" : "")}
                    >
                      Назад
                    </Button>
                    <Button onClick={goNext} className="rounded-full px-6 bg-blue-600 hover:bg-blue-700">
                      СЛЕДВАЩА СТЪПКА
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
                className="grid lg:grid-cols-2 gap-8 items-start"
              >
                <div className="lg:pr-12">
                  <p className={cn("text-sm tracking-widest mb-4", accentColor)}>СТЪПКА 4</p>
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">Месечен доход</h1>
                  <p className={cn("text-lg mb-6", mutedTextClasses)}>
                    Въведете общия месечен доход на домакинството.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={goBack}
                      className={cn("rounded-full px-6", isDarkMode ? "border-slate-700 hover:bg-slate-800" : "")}
                    >
                      Назад
                    </Button>
                    <Button onClick={goNext} className="rounded-full px-6 bg-blue-600 hover:bg-blue-700">
                      Напред
                    </Button>
                  </div>
                </div>

                <div className={cn("rounded-3xl border p-8", cardClasses)}>
                  <div className="flex items-center justify-between mb-6">
                    <p className={cn("text-sm tracking-widest", mutedTextClasses)}>СТЪПКА 4</p>
                    <button onClick={restart} className={cn("text-sm", mutedTextClasses, "hover:text-blue-400")}>
                      рестарт
                    </button>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-8">Месечен доход</h2>

                  <div className="text-center mb-8">
                    <span className="text-5xl font-bold text-blue-500">{formatNumber(monthlyIncome)}</span>
                    <span className={cn("text-2xl ml-2", mutedTextClasses)}>лв.</span>
                  </div>

                  <Slider
                    value={[monthlyIncome]}
                    onValueChange={(v) => setMonthlyIncome(v[0])}
                    min={1000}
                    max={30000}
                    step={100}
                    className="mb-4"
                  />
                  <div className={cn("flex justify-between text-sm", mutedTextClasses)}>
                    <span>1 000 лв.</span>
                    <span>30 000 лв.</span>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <Button 
                      variant="outline" 
                      onClick={goBack}
                      className={cn("rounded-full px-6", isDarkMode ? "border-slate-700 hover:bg-slate-800" : "")}
                    >
                      Назад
                    </Button>
                    <Button onClick={goNext} className="rounded-full px-6 bg-blue-600 hover:bg-blue-700">
                      СЛЕДВАЩА СТЪПКА
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Main Priority */}
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
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">Основен приоритет</h1>
                  <p className={cn("text-lg mb-6", mutedTextClasses)}>
                    Изберете посока, която резонира с вашите мечти.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={goBack}
                      className={cn("rounded-full px-6", isDarkMode ? "border-slate-700 hover:bg-slate-800" : "")}
                    >
                      Назад
                    </Button>
                    <Button 
                      onClick={goNext}
                      disabled={!mainPriority}
                      className="rounded-full px-6 bg-blue-600 hover:bg-blue-700"
                    >
                      Напред
                    </Button>
                  </div>
                </div>

                <div className={cn("rounded-3xl border p-8", cardClasses)}>
                  <div className="flex items-center justify-between mb-6">
                    <p className={cn("text-sm tracking-widest", mutedTextClasses)}>СТЪПКА 5</p>
                    <button onClick={restart} className={cn("text-sm", mutedTextClasses, "hover:text-blue-400")}>
                      рестарт
                    </button>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-2">Основен приоритет</h2>
                  <p className={cn("text-sm mb-8", mutedTextClasses)}>
                    Изберете посока, която резонира с вашите мечти.
                  </p>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <button
                      onClick={() => setMainPriority('security')}
                      className={cn(
                        "p-6 rounded-2xl border-2 text-left transition-all",
                        mainPriority === 'security'
                          ? "border-blue-500 bg-blue-500/10"
                          : isDarkMode ? "border-slate-700 hover:border-slate-600" : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <h3 className="font-semibold mb-2">Сигурност</h3>
                      <p className={cn("text-xs", mutedTextClasses)}>
                        Фонд за спокойствие и защита на доход.
                      </p>
                    </button>
                    
                    <button
                      onClick={() => setMainPriority('growth')}
                      className={cn(
                        "p-6 rounded-2xl border-2 text-left transition-all",
                        mainPriority === 'growth'
                          ? "border-blue-500 bg-blue-500/10"
                          : isDarkMode ? "border-slate-700 hover:border-slate-600" : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <h3 className="font-semibold mb-2">Растеж</h3>
                      <p className={cn("text-xs", mutedTextClasses)}>
                        Ускорени инвестиции и възвръщаемост.
                      </p>
                    </button>
                    
                    <button
                      onClick={() => setMainPriority('legacy')}
                      className={cn(
                        "p-6 rounded-2xl border-2 text-left transition-all",
                        mainPriority === 'legacy'
                          ? "border-blue-500 bg-blue-500/10"
                          : isDarkMode ? "border-slate-700 hover:border-slate-600" : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <h3 className="font-semibold mb-2">Наследство</h3>
                      <p className={cn("text-xs", mutedTextClasses)}>
                        Капитал за следващите поколения.
                      </p>
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={goBack}
                      className={cn("rounded-full px-6", isDarkMode ? "border-slate-700 hover:bg-slate-800" : "")}
                    >
                      Назад
                    </Button>
                    <Button 
                      onClick={goNext}
                      disabled={!mainPriority}
                      className="rounded-full px-6 bg-blue-600 hover:bg-blue-700"
                    >
                      СЛЕДВАЩА СТЪПКА
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 6: Financial Framework */}
            {currentStep === 6 && (
              <motion.div
                key="step-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-3 gap-8"
              >
                {/* Main content - 2 columns */}
                <div className="lg:col-span-2">
                  <div className={cn("rounded-3xl border p-8", cardClasses)}>
                    <div className="flex items-center gap-3 mb-6">
                      <span className={cn("text-xs tracking-widest", mutedTextClasses)}>СИГУРНОСТ</span>
                      <span className={cn("text-xs", mutedTextClasses)}>•</span>
                      <span className={cn("text-xs tracking-widest", mutedTextClasses)}>ПЕНСИЯ</span>
                      <span className={cn("text-xs", mutedTextClasses)}>•</span>
                      <span className={cn("text-xs tracking-widest", mutedTextClasses)}>ЖИЛИЩЕ</span>
                      <span className={cn("text-xs", mutedTextClasses)}>•</span>
                      <span className={cn("text-xs tracking-widest", mutedTextClasses)}>РЕЗЕРВ</span>
                    </div>

                    <h2 className="text-3xl font-bold mb-4">Финансова рамка</h2>
                    <p className={cn("text-sm mb-8 max-w-2xl", mutedTextClasses)}>
                      Пресъздадохме слайд 10 от LifePlanner като интерактивна карта на активите. 
                      Регулирайте всяка категория, за да покажем как решенията влияят върху общото имущество.
                    </p>

                    {/* Goal sliders */}
                    <div className="space-y-8">
                      {/* Security */}
                      <div className={cn("rounded-2xl border p-6", isDarkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-50")}>
                        <p className={cn("text-xs tracking-widest mb-2", mutedTextClasses)}>КАТЕГОРИЯ</p>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold">Финансова сигурност</h3>
                            <p className={cn("text-sm", mutedTextClasses)}>Фонд за минимум 12 месеца защита на дохода и извънредни случай.</p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-blue-500">{formatNumber(goals.security)} лв.</span>
                          </div>
                        </div>
                        <Slider
                          value={[goals.security]}
                          onValueChange={(v) => setGoals({...goals, security: v[0]})}
                          min={10000}
                          max={200000}
                          step={1000}
                          className="mb-2"
                        />
                        <div className={cn("flex justify-between text-xs", mutedTextClasses)}>
                          <span>10 000 лв.</span>
                          <span>200 000 лв.</span>
                        </div>
                      </div>

                      {/* Pension */}
                      <div className={cn("rounded-2xl border p-6", isDarkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-50")}>
                        <p className={cn("text-xs tracking-widest mb-2", mutedTextClasses)}>КАТЕГОРИЯ</p>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold">Пенсия</h3>
                            <p className={cn("text-sm", mutedTextClasses)}>Капитал за пасивен доход след 55+ години.</p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-blue-500">{formatNumber(goals.pension)} лв.</span>
                          </div>
                        </div>
                        <Slider
                          value={[goals.pension]}
                          onValueChange={(v) => setGoals({...goals, pension: v[0]})}
                          min={20000}
                          max={400000}
                          step={5000}
                          className="mb-2"
                        />
                        <div className={cn("flex justify-between text-xs", mutedTextClasses)}>
                          <span>20 000 лв.</span>
                          <span>400 000 лв.</span>
                        </div>
                      </div>

                      {/* Housing */}
                      <div className={cn("rounded-2xl border p-6", isDarkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-50")}>
                        <p className={cn("text-xs tracking-widest mb-2", mutedTextClasses)}>КАТЕГОРИЯ</p>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold">Жилище</h3>
                            <p className={cn("text-sm", mutedTextClasses)}>Собственост, ремонт и модернизация на основния дом.</p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-blue-500">{formatNumber(goals.housing)} лв.</span>
                          </div>
                        </div>
                        <Slider
                          value={[goals.housing]}
                          onValueChange={(v) => setGoals({...goals, housing: v[0]})}
                          min={30000}
                          max={500000}
                          step={5000}
                          className="mb-2"
                        />
                        <div className={cn("flex justify-between text-xs", mutedTextClasses)}>
                          <span>30 000 лв.</span>
                          <span>500 000 лв.</span>
                        </div>
                      </div>

                      {/* Cash / Other */}
                      <div className={cn("rounded-2xl border p-6", isDarkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-50")}>
                        <p className={cn("text-xs tracking-widest mb-2", mutedTextClasses)}>КАТЕГОРИЯ</p>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold">Пари в брой / друго</h3>
                            <p className={cn("text-sm", mutedTextClasses)}>Ликвидни активи и алтернативни инвестиции.</p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-blue-500">{formatNumber(goals.cash)} лв.</span>
                          </div>
                        </div>
                        <Slider
                          value={[goals.cash]}
                          onValueChange={(v) => setGoals({...goals, cash: v[0]})}
                          min={5000}
                          max={150000}
                          step={1000}
                          className="mb-2"
                        />
                        <div className={cn("flex justify-between text-xs", mutedTextClasses)}>
                          <span>5000 лв.</span>
                          <span>150 000 лв.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right sidebar */}
                <div className="space-y-6">
                  {/* Total wealth card */}
                  <div className={cn("rounded-3xl border p-6", cardClasses)}>
                    <p className={cn("text-xs tracking-widest mb-4", mutedTextClasses)}>ОБЩО ИМУЩЕСТВО</p>
                    <p className="text-4xl font-bold text-blue-500 mb-4">{formatNumber(totalWealth)} лв.</p>
                    <p className={cn("text-sm", mutedTextClasses)}>
                      Сумата се обновява автоматично. В презентация можем да запишем стойностите 
                      и да ги прехвърлим към PDF, CRM или LivePlan.
                    </p>
                  </div>

                  {/* Next actions card */}
                  <div className={cn("rounded-3xl border p-6", cardClasses)}>
                    <p className={cn("text-xs tracking-widest mb-4", mutedTextClasses)}>СЛЕДВАЩИ ДЕЙСТВИЯ</p>
                    <ul className={cn("text-sm space-y-2", mutedTextClasses)}>
                      <li>• Маркираме категориите с най-голяма промяна.</li>
                      <li>• Готови сме да преминем към системата на работа.</li>
                    </ul>
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={goBack}
                      className={cn("flex-1 rounded-full", isDarkMode ? "border-slate-700 hover:bg-slate-800" : "")}
                    >
                      Назад
                    </Button>
                    <Button 
                      onClick={goNext}
                      className="flex-1 rounded-full bg-blue-600 hover:bg-blue-700"
                    >
                      Напред
                    </Button>
                  </div>
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
                <div className={cn("rounded-3xl border p-8", cardClasses)}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className={cn("text-xs tracking-widest", mutedTextClasses)}>АНАЛИЗ</span>
                    <span className={cn("text-xs", mutedTextClasses)}>•</span>
                    <span className={cn("text-xs tracking-widest", mutedTextClasses)}>ОПТИМИЗАЦИЯ</span>
                    <span className={cn("text-xs", mutedTextClasses)}>•</span>
                    <span className={cn("text-xs tracking-widest", mutedTextClasses)}>ПРЕДСТАВЯНЕ</span>
                    <span className={cn("text-xs", mutedTextClasses)}>•</span>
                    <span className={cn("text-xs tracking-widest", mutedTextClasses)}>СЕРВИЗ</span>
                  </div>

                  <h2 className="text-3xl font-bold mb-4">Съвременна система на работа</h2>
                  <p className={cn("text-sm mb-8 max-w-2xl", mutedTextClasses)}>
                    Обновихме последния етап на LifePlanner, за да покаже ясно как комбинираме 
                    консултантски подход, дигитална среда и личен сервиз.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className={cn("rounded-2xl border p-6", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <p className={cn("text-xs tracking-widest mb-2", mutedTextClasses)}>ФАЗА 1</p>
                      <h3 className="text-xl font-semibold mb-1">Анализ</h3>
                      <p className="text-blue-400 text-sm mb-3">Нужди, цели, желания</p>
                      <p className={cn("text-sm", mutedTextClasses)}>
                        Събираме детайлите за житейската ситуация и бизнес контекста, 
                        за да построим правилните рамки.
                      </p>
                    </div>

                    <div className={cn("rounded-2xl border p-6", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <p className={cn("text-xs tracking-widest mb-2", mutedTextClasses)}>ФАЗА 2</p>
                      <h3 className="text-xl font-semibold mb-1">Оптимизация</h3>
                      <p className="text-blue-400 text-sm mb-3">Подготовка на финансовия план</p>
                      <p className={cn("text-sm", mutedTextClasses)}>
                        Комбинираме анализите и моделите в реалистични сценарии, 
                        които дават поле за избор и финализация.
                      </p>
                    </div>

                    <div className={cn("rounded-2xl border p-6", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <p className={cn("text-xs tracking-widest mb-2", mutedTextClasses)}>ФАЗА 3</p>
                      <h3 className="text-xl font-semibold mb-1">Представяне</h3>
                      <p className="text-blue-400 text-sm mb-3">Финансовият план и реализацията</p>
                      <p className={cn("text-sm", mutedTextClasses)}>
                        Превръщаме данните в визуална история с ясни стъпки, KPI и 
                        ролеви отговорности.
                      </p>
                    </div>

                    <div className={cn("rounded-2xl border p-6", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <p className={cn("text-xs tracking-widest mb-2", mutedTextClasses)}>ФАЗА 4</p>
                      <h3 className="text-xl font-semibold mb-1">Сервиз</h3>
                      <p className="text-blue-400 text-sm mb-3">Дългосрочен и редовен</p>
                      <p className={cn("text-sm", mutedTextClasses)}>
                        Проследяваме изпълнението чрез прозрачен цикъл на срещи, 
                        актуализации и навременни действия.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={goBack}
                      className={cn("rounded-full px-6", isDarkMode ? "border-slate-700 hover:bg-slate-800" : "")}
                    >
                      Назад
                    </Button>
                    <Button 
                      onClick={goNext}
                      className="rounded-full px-6 bg-blue-600 hover:bg-blue-700"
                    >
                      Напред
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 8: Final / Redirect */}
            {currentStep === 8 && (
              <motion.div
                key="step-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto text-center"
              >
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
                      className={cn("w-full rounded-full", isDarkMode ? "border-slate-700 hover:bg-slate-800" : "")}
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
  );
}