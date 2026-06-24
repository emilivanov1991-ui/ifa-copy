import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RotateCcw, Briefcase, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function PlannerStep2({ 
  VISUAL_STEPS, currentStep, isDarkMode, cardClasses, mutedTextClasses, primaryButtonClass, 
  familyType, clientFirstName, partnerFirstName, clientInsuranceType, setClientInsuranceType, 
  partnerInsuranceType, setPartnerInsuranceType, goNext, restart
}) {
  return (
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
              <p className={cn("text-base font-medium mb-4", mutedTextClasses)}>{clientFirstName || 'КЛИЕНТ'}</p>
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
              <p className={cn("text-base font-medium mb-4", mutedTextClasses)}>{partnerFirstName || 'ПАРТНЬОР'}</p>
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
  );
}