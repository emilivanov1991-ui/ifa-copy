import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Eye, FileText, ShieldCheck, Coins, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PlannerStep8({ VISUAL_STEPS, currentStep, isDarkMode, cardClasses, mutedTextClasses, primaryButtonClass, goNext }) {
  return (
    <motion.div
      key="step-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full px-4"
    >
      <div className={cn("rounded-3xl border p-6 md:p-8", cardClasses)}>
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
            <Eye className={cn("w-20 h-20 absolute top-4 right-4 transition-colors", "text-blue-500 group-hover:text-white")} />
            <h3 className="text-2xl font-semibold mb-2 group-hover:text-white transition-colors relative z-10">Дискретност</h3>
            <p className={cn("text-base leading-relaxed group-hover:text-blue-100 transition-colors relative z-10", mutedTextClasses)}>
              Вашите данни и финансова информация са строго поверителни.
            </p>
          </div>

          <div className={cn("rounded-xl border-2 p-6 transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600 flex flex-col justify-center relative", isDarkMode ? "border-slate-800" : "border-slate-200")}>
            <FileText className={cn("w-20 h-20 absolute top-4 right-4 transition-colors", "text-blue-500 group-hover:text-white")} />
            <h3 className="text-2xl font-semibold mb-2 group-hover:text-white transition-colors relative z-10">Прозрачност</h3>
            <p className={cn("text-base leading-relaxed group-hover:text-blue-100 transition-colors relative z-10", mutedTextClasses)}>
              Пълна яснота относно условията, таксите и процесите.
            </p>
          </div>

          <div className={cn("rounded-xl border-2 p-6 transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600 flex flex-col justify-center relative", isDarkMode ? "border-slate-800" : "border-slate-200")}>
            <ShieldCheck className={cn("w-20 h-20 absolute top-4 right-4 transition-colors", "text-blue-500 group-hover:text-white")} />
            <h3 className="text-2xl font-semibold mb-2 group-hover:text-white transition-colors relative z-10">Коректност</h3>
            <p className={cn("text-base leading-relaxed group-hover:text-blue-100 transition-colors relative z-10", mutedTextClasses)}>
              Честен и етичен подход при всяка препоръка и решение.
            </p>
          </div>

          <div className={cn("rounded-xl border-2 p-6 transition-all duration-300 group hover:border-blue-500 hover:bg-blue-600 flex flex-col justify-center relative", isDarkMode ? "border-slate-800" : "border-slate-200")}>
            <Coins className={cn("w-20 h-20 absolute top-4 right-4 transition-colors", "text-blue-500 group-hover:text-white")} />
            <h3 className="text-2xl font-semibold mb-2 group-hover:text-white transition-colors relative z-10">Възнаграждение</h3>
            <p className={cn("text-base leading-relaxed group-hover:text-blue-100 transition-colors relative z-10", mutedTextClasses)}>
              Работим срещу комисионна от финансовите институции.
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <Button onClick={goNext} className={cn(primaryButtonClass, "group")}>
            Напред
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}