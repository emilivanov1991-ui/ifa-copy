import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock, Unlock, ShieldAlert, Shield, ShieldCheck, Frown, Smile, PartyPopper, Home, HomeIcon, Car, Wallet, Info, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function PlannerStep6({ 
  VISUAL_STEPS, currentStep, isDarkMode, cardClasses, mutedTextClasses, primaryButtonClass, 
  allocations, setAllocations, lockedGoals, totalIncome, avgAge, yearsToRetirement, 
  calculateGoals, handleAllocationChange, toggleLock, recentlyChanged, goNext 
}) {
  return (
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

      {/* Goals Grid - 4 columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 flex-1">
        {/* Security */}
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
          <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
                    lockedGoals.security ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
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
          <p className={cn("text-xs tracking-widest mb-3 font-bold relative z-10", "text-blue-600")}>ФИНАНСОВА СИГУРНОСТ</p>
          
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

        {/* Pension */}
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
          <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
                    lockedGoals.pension ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
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
          <p className={cn("text-xs tracking-widest mb-3 font-bold relative z-10", "text-blue-600")}>ПЕНСИЯ</p>
          
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

        {/* Housing */}
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
          <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
                    lockedGoals.housing ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
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
          <p className={cn("text-xs tracking-widest mb-3 font-bold relative z-10", "text-blue-600")}>ЖИЛИЩЕ</p>
          
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

        {/* Other Goals */}
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
          <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
                    lockedGoals.cash ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
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
          <p className={cn("text-xs tracking-widest mb-3 font-bold relative z-10", "text-blue-600")}>ДРУГИ ЦЕЛИ</p>
          
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

      {/* Detailed Info Section */}
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

      {/* Total Wealth - Bottom Center */}
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
  );
}

// Helper function
const formatNumber = (num) => {
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};