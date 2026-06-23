import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Search, Settings, Presentation, Handshake, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PlannerStep7({ VISUAL_STEPS, currentStep, isDarkMode, cardClasses, mutedTextClasses, primaryButtonClass, goNext }) {
  return (
    <motion.div
      key="step-7"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full px-4 h-[calc(100vh-48px)] flex flex-col"
    >
      <div className={cn("rounded-2xl border p-4 flex-1 flex flex-col", cardClasses)}>
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
            <Search className={cn("w-20 h-20 absolute top-4 right-4 transition-colors", "text-blue-500 group-hover:text-white")} />
            <p className={cn("text-sm tracking-widest mb-2 group-hover:text-blue-100 relative z-10", mutedTextClasses)}>ФАЗА 1</p>
            <h3 className="text-2xl font-semibold mb-2 group-hover:text-white relative z-10">Анализ</h3>
            <p className="text-blue-500 text-lg mb-3 font-medium group-hover:text-blue-200 relative z-10">Нужди, цели, желания</p>
            <p className={cn("text-base leading-relaxed group-hover:text-blue-100 relative z-10", mutedTextClasses)}>
              Анализираме целите на клиента за най-подходящите финансови решения.
            </p>
          </div>

          <div className={cn("rounded-xl border-2 p-6 transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600 flex flex-col justify-center relative", isDarkMode ? "border-slate-800" : "border-slate-200")}>
            <Settings className={cn("w-20 h-20 absolute top-4 right-4 transition-colors", "text-blue-500 group-hover:text-white")} />
            <p className={cn("text-sm tracking-widest mb-2 group-hover:text-blue-100 relative z-10", mutedTextClasses)}>ФАЗА 2</p>
            <h3 className="text-2xl font-semibold mb-2 group-hover:text-white relative z-10">Оптимизация</h3>
            <p className="text-blue-500 text-lg mb-3 font-medium group-hover:text-blue-200 relative z-10">Подготовка на финансовия план</p>
            <p className={cn("text-base leading-relaxed group-hover:text-blue-100 relative z-10", mutedTextClasses)}>
              Разглеждаме съществуващи продукти за оптимизация и спестяване.
            </p>
          </div>

          <div className={cn("rounded-xl border-2 p-6 transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600 flex flex-col justify-center relative", isDarkMode ? "border-slate-800" : "border-slate-200")}>
            <Presentation className={cn("w-20 h-20 absolute top-4 right-4 transition-colors", "text-blue-600 group-hover:text-white")} />
            <p className={cn("text-sm tracking-widest mb-2 group-hover:text-blue-100 relative z-10", mutedTextClasses)}>ФАЗА 3</p>
            <h3 className="text-2xl font-semibold mb-2 group-hover:text-white relative z-10">Представяне</h3>
            <p className="text-blue-500 text-lg mb-3 font-medium group-hover:text-blue-200 relative z-10">Финансовият план и реализацията</p>
            <p className={cn("text-base leading-relaxed group-hover:text-blue-100 relative z-10", mutedTextClasses)}>
              Представяме плана и привеждаме в действие решенията.
            </p>
          </div>

          <div className={cn("rounded-xl border-2 p-6 transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600 flex flex-col justify-center relative", isDarkMode ? "border-slate-800" : "border-slate-200")}>
            <Handshake className={cn("w-20 h-20 absolute top-4 right-4 transition-colors", "text-blue-600 group-hover:text-white")} />
            <p className={cn("text-sm tracking-widest mb-2 group-hover:text-blue-100 relative z-10", mutedTextClasses)}>ФАЗА 4</p>
            <h3 className="text-2xl font-semibold mb-2 group-hover:text-white relative z-10">Дългосрочно обслужване</h3>
            <p className="text-blue-500 text-base mb-3 font-medium group-hover:text-blue-200 relative z-10">Дългосрочно и редовно</p>
            <p className={cn("text-base leading-relaxed group-hover:text-blue-100 relative z-10", mutedTextClasses)}>
              Постоянна подкрепа с редовни срещи и актуализации.
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <Button onClick={goNext} className={cn(primaryButtonClass, "group")}>
            Напред
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}