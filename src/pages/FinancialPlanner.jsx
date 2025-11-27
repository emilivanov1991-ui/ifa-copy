import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Step definitions
const STEPS = [
  { id: 1, label: 'С КОГО ПЛАНИРАМЕ?' },
  { id: 2, label: 'ВЪЗРАСТ' },
  { id: 3, label: 'МЕСЕЧЕН ДОХОД' },
  { id: 4, label: 'ПРИОРИТЕТИ' },
  { id: 5, label: 'ФИНАНСОВА РАМКА' },
  { id: 6, label: 'СИСТЕМА НА РАБОТА' },
  { id: 7, label: 'ПРАВИЛА ЗА СЪТРУДНИЧЕСТВО' },
  { id: 8, label: 'МИКРО ПЛАН' },
];

export default function FinancialPlanner() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Data states
  const [familyType, setFamilyType] = useState(null); // 'individual' | 'family'
  const [clientAge, setClientAge] = useState(35);
  const [partnerAge, setPartnerAge] = useState(35);
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [selectedPriorities, setSelectedPriorities] = useState([]); // multi-select
  const [partnerIncome, setPartnerIncome] = useState(5000);
  
  // Financial framework values
  const [goals, setGoals] = useState({
    security: 65000,
    pension: 180000,
    housing: 220000,
    cash: 45000
  });
  
  const [isGenerating, setIsGenerating] = useState(false);

  // Calculate total wealth
  const totalWealth = Object.values(goals).reduce((a, b) => a + b, 0);

  // Format number with spaces
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
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
    if (currentStep === 4) {
      // Show generating animation before financial framework
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        setCurrentStep(5);
      }, 3000);
    } else if (currentStep < 8) {
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
    setClientAge(35);
    setPartnerAge(33);
    setMonthlyIncome(5000);
    setPartnerIncome(3000);
    setSelectedPriorities([]);
  };

  const visibleSteps = STEPS;

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
                </div>

                {/* Right side - card */}
                <div className={cn("rounded-3xl border p-6", cardClasses)}>
                  <div className="flex items-center justify-between mb-4">
                    <p className={cn("text-sm tracking-widest", mutedTextClasses)}>СТЪПКА 1</p>
                    <button onClick={restart} className={cn("p-2 rounded-lg transition-colors", isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100")}>
                      <RotateCcw className={cn("w-4 h-4", mutedTextClasses, "hover:text-blue-400")} />
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

            {/* Step 2: Age (combined) */}
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
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">Възраст</h1>
                  <p className={cn("text-lg mb-6", mutedTextClasses)}>
                    {familyType === 'family' 
                      ? 'Въведете възрастта на клиента и партньора.'
                      : 'Въведете вашата възраст.'
                    }
                  </p>
                </div>

                <div className={cn("rounded-3xl border p-6", cardClasses)}>
                  <div className="flex items-center justify-between mb-4">
                    <p className={cn("text-sm tracking-widest", mutedTextClasses)}>СТЪПКА 2</p>
                    <button onClick={restart} className={cn("p-2 rounded-lg transition-colors", isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100")}>
                      <RotateCcw className={cn("w-4 h-4", mutedTextClasses, "hover:text-blue-400")} />
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

                  <div className="flex gap-3">
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

            {/* Step 3: Monthly Income */}
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
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">Месечен доход</h1>
                  <p className={cn("text-lg mb-6", mutedTextClasses)}>
                    {familyType === 'family' 
                      ? 'Въведете месечния доход на клиента и партньора.'
                      : 'Въведете вашия месечен доход.'
                    }
                  </p>
                </div>

                <div className={cn("rounded-3xl border p-6", cardClasses)}>
                  <div className="flex items-center justify-between mb-4">
                    <p className={cn("text-sm tracking-widest", mutedTextClasses)}>СТЪПКА 3</p>
                    <button onClick={restart} className={cn("p-2 rounded-lg transition-colors", isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100")}>
                      <RotateCcw className={cn("w-4 h-4", mutedTextClasses, "hover:text-blue-400")} />
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

                  <div className="flex gap-3">
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

            {/* Step 4: Priorities (multi-select) */}
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
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">Приоритети</h1>
                  <p className={cn("text-lg mb-6", mutedTextClasses)}>
                    Изберете една или повече посоки, които резонират с вашите мечти.
                  </p>
                </div>

                <div className={cn("rounded-3xl border p-6", cardClasses)}>
                  <div className="flex items-center justify-between mb-4">
                    <p className={cn("text-sm tracking-widest", mutedTextClasses)}>СТЪПКА 4</p>
                    <button onClick={restart} className={cn("p-2 rounded-lg transition-colors", isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100")}>
                      <RotateCcw className={cn("w-4 h-4", mutedTextClasses, "hover:text-blue-400")} />
                    </button>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-2">Приоритети</h2>
                  <p className={cn("text-sm mb-4", mutedTextClasses)}>
                    Изберете една или повече посоки, които резонират с вашите мечти.
                  </p>

                  <div className="grid grid-cols-4 gap-3 mb-6">
                    <button
                      onClick={() => togglePriority('stability')}
                      className={cn(
                        "p-4 rounded-2xl border-2 text-left transition-all",
                        selectedPriorities.includes('stability')
                          ? "border-blue-500 bg-blue-500/10"
                          : isDarkMode ? "border-slate-700 hover:border-slate-600" : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <h3 className="font-semibold text-sm mb-1">Финансова стабилност</h3>
                      <p className={cn("text-xs", mutedTextClasses)}>
                        Фонд за спокойствие и защита на дохода.
                      </p>
                    </button>
                    
                    <button
                      onClick={() => togglePriority('investments')}
                      className={cn(
                        "p-4 rounded-2xl border-2 text-left transition-all",
                        selectedPriorities.includes('investments')
                          ? "border-blue-500 bg-blue-500/10"
                          : isDarkMode ? "border-slate-700 hover:border-slate-600" : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <h3 className="font-semibold text-sm mb-1">Инвестиции</h3>
                      <p className={cn("text-xs", mutedTextClasses)}>
                        Ускорени инвестиции и възвръщаемост.
                      </p>
                    </button>
                    
                    <button
                      onClick={() => togglePriority('children')}
                      className={cn(
                        "p-4 rounded-2xl border-2 text-left transition-all",
                        selectedPriorities.includes('children')
                          ? "border-blue-500 bg-blue-500/10"
                          : isDarkMode ? "border-slate-700 hover:border-slate-600" : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <h3 className="font-semibold text-sm mb-1">Подсигуряване на деца</h3>
                      <p className={cn("text-xs", mutedTextClasses)}>
                        Капитал за бъдещето на децата.
                      </p>
                    </button>
                    
                    <button
                      onClick={() => togglePriority('housing')}
                      className={cn(
                        "p-4 rounded-2xl border-2 text-left transition-all",
                        selectedPriorities.includes('housing')
                          ? "border-blue-500 bg-blue-500/10"
                          : isDarkMode ? "border-slate-700 hover:border-slate-600" : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <h3 className="font-semibold text-sm mb-1">Ново жилище</h3>
                      <p className={cn("text-xs", mutedTextClasses)}>
                        Собственост, ремонт или ново жилище.
                      </p>
                    </button>
                  </div>

                  {selectedPriorities.length > 0 && (
                    <p className={cn("text-sm mb-4", accentColor)}>
                      Избрани: {selectedPriorities.length} приоритет{selectedPriorities.length > 1 ? 'а' : ''}
                    </p>
                  )}

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
                      disabled={selectedPriorities.length === 0}
                      className="rounded-full px-6 bg-blue-600 hover:bg-blue-700"
                    >
                      СЛЕДВАЩА СТЪПКА
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Generating Animation */}
            {isGenerating && (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[60vh]"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mb-8"
                >
                  <Loader2 className="w-16 h-16 text-blue-500" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-4">Генериране на финансов план</h2>
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 5: Financial Framework - New Layout */}
            {currentStep === 5 && !isGenerating && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-6xl mx-auto"
              >
                <h2 className="text-3xl font-bold mb-8 text-center">Вашият оптимален финансов план</h2>

                {/* Goals Grid - 4 columns like the image */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  {/* Security */}
                  <div className={cn("rounded-2xl border p-6 text-center", cardClasses)}>
                    <p className={cn("text-xs tracking-widest mb-4", mutedTextClasses)}>ФИНАНСОВА СИГУРНОСТ</p>
                    <p className="text-4xl font-bold mb-4">{formatNumber(goals.security)}</p>
                    <Slider
                      value={[goals.security]}
                      onValueChange={(v) => setGoals({...goals, security: v[0]})}
                      min={10000}
                      max={200000}
                      step={1000}
                      className="mb-2"
                    />
                  </div>

                  {/* Pension */}
                  <div className={cn("rounded-2xl border p-6 text-center", cardClasses)}>
                    <p className={cn("text-xs tracking-widest mb-4", mutedTextClasses)}>ПЕНСИЯ</p>
                    <p className="text-4xl font-bold mb-4">{formatNumber(goals.pension)}</p>
                    <Slider
                      value={[goals.pension]}
                      onValueChange={(v) => setGoals({...goals, pension: v[0]})}
                      min={20000}
                      max={400000}
                      step={5000}
                      className="mb-2"
                    />
                  </div>

                  {/* Housing */}
                  <div className={cn("rounded-2xl border p-6 text-center", cardClasses)}>
                    <p className={cn("text-xs tracking-widest mb-4", mutedTextClasses)}>ЖИЛИЩЕ</p>
                    <p className="text-4xl font-bold mb-4">{formatNumber(goals.housing)}</p>
                    <Slider
                      value={[goals.housing]}
                      onValueChange={(v) => setGoals({...goals, housing: v[0]})}
                      min={30000}
                      max={500000}
                      step={5000}
                      className="mb-2"
                    />
                  </div>

                  {/* Other Goals */}
                  <div className={cn("rounded-2xl border p-6 text-center", cardClasses)}>
                    <p className={cn("text-xs tracking-widest mb-4", mutedTextClasses)}>ДРУГИ ЦЕЛИ</p>
                    <p className="text-4xl font-bold mb-4">{formatNumber(goals.cash)}</p>
                    <Slider
                      value={[goals.cash]}
                      onValueChange={(v) => setGoals({...goals, cash: v[0]})}
                      min={5000}
                      max={150000}
                      step={1000}
                      className="mb-2"
                    />
                  </div>
                </div>

                {/* Total Wealth - Bottom Center */}
                <div className={cn("rounded-2xl border p-6 text-center max-w-md mx-auto mb-8", cardClasses)}>
                  <p className={cn("text-xs tracking-widest mb-2", mutedTextClasses)}>ИМУЩЕСТВОТО ОБЩО</p>
                  <p className="text-5xl font-bold mb-4">{formatNumber(totalWealth)} BGN</p>
                  <Button 
                    onClick={goNext}
                    className="rounded-full px-8 bg-blue-600 hover:bg-blue-700"
                  >
                    Искам да продължа
                  </Button>
                </div>

                {/* Back button */}
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={goBack}
                    className={cn("rounded-full px-6", isDarkMode ? "border-slate-700 hover:bg-slate-800" : "")}
                  >
                    Назад
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 6: Work System */}
            {currentStep === 6 && (
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

            {/* Step 7: Cooperation Rules */}
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
                    <span className={cn("text-xs tracking-widest", mutedTextClasses)}>ДИСКРЕТНОСТ</span>
                    <span className={cn("text-xs", mutedTextClasses)}>•</span>
                    <span className={cn("text-xs tracking-widest", mutedTextClasses)}>КОРЕКТНОСТ</span>
                    <span className={cn("text-xs", mutedTextClasses)}>•</span>
                    <span className={cn("text-xs tracking-widest", mutedTextClasses)}>ПРОЗРАЧНОСТ</span>
                    <span className={cn("text-xs", mutedTextClasses)}>•</span>
                    <span className={cn("text-xs tracking-widest", mutedTextClasses)}>ВЪЗНАГРАЖДЕНИЕ</span>
                  </div>

                  <h2 className="text-3xl font-bold mb-4">Правила за сътрудничество</h2>
                  <p className={cn("text-sm mb-8 max-w-2xl", mutedTextClasses)}>
                    Нашите принципи на работа гарантират професионализъм и доверие във всяка стъпка от процеса.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className={cn("rounded-2xl border p-6", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <p className={cn("text-xs tracking-widest mb-2", mutedTextClasses)}>ПРАВИЛО 1</p>
                      <h3 className="text-xl font-semibold mb-1">Дискретност</h3>
                      <p className="text-blue-400 text-sm mb-3">Пълна конфиденциалност</p>
                      <p className={cn("text-sm", mutedTextClasses)}>
                        Вашите лични и финансови данни са напълно защитени. 
                        Никога не споделяме информация с трети страни без вашето изрично съгласие.
                      </p>
                    </div>

                    <div className={cn("rounded-2xl border p-6", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <p className={cn("text-xs tracking-widest mb-2", mutedTextClasses)}>ПРАВИЛО 2</p>
                      <h3 className="text-xl font-semibold mb-1">Коректност</h3>
                      <p className="text-blue-400 text-sm mb-3">Честни взаимоотношения</p>
                      <p className={cn("text-sm", mutedTextClasses)}>
                        Работим с ясни правила и спазваме всички договорености. 
                        Вашият интерес е винаги на първо място в нашите препоръки.
                      </p>
                    </div>

                    <div className={cn("rounded-2xl border p-6", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <p className={cn("text-xs tracking-widest mb-2", mutedTextClasses)}>ПРАВИЛО 3</p>
                      <h3 className="text-xl font-semibold mb-1">Прозрачност</h3>
                      <p className="text-blue-400 text-sm mb-3">Открита комуникация</p>
                      <p className={cn("text-sm", mutedTextClasses)}>
                        Обясняваме всяка стъпка и решение. Няма скрити условия или 
                        неясни такси - всичко е ясно от самото начало.
                      </p>
                    </div>

                    <div className={cn("rounded-2xl border p-6", isDarkMode ? "border-slate-800" : "border-slate-200")}>
                      <p className={cn("text-xs tracking-widest mb-2", mutedTextClasses)}>ПРАВИЛО 4</p>
                      <h3 className="text-xl font-semibold mb-1">Възнаграждение</h3>
                      <p className="text-blue-400 text-sm mb-3">Без директни такси от клиенти</p>
                      <p className={cn("text-sm", mutedTextClasses)}>
                        Не получаваме директно заплащане от вас. Възнаграждението ни идва от 
                        финансовите институции под формата на комисионна за посредничество.
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