import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CheckCircle2, Calendar, Shield, FileText, ArrowRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

const GDPR_TEXT = `С настоящото по смисъла на Закона за личните данни и на Регламент (ЕС) 2016/679 на Европейския парламент и на Съвета от 27 април 2016 година относно защитата на физическите лица във връзка с обработването на лични данни и относно свободното движение на такива данни и за отмяна на Директива 95/46/EО (Общ регламент относно защитата на данните) (по-долу наричан само „Приложимо законодателство") Давам съгласието си на "Интегрити Файненшъл Адвайзърс" ЕООД, с ЕИК: 208597115, със седалище и адрес на управление в гр. Бургас (8001), ул.Поморие, 20, ет. 5, ап. 1 ("Компанията") да обработва личните ми данни, посочени в този анализ.

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
• блокиране на личните ми данни поради оттегляне на съгласието ми.`;

export default function PlannerStep9({
  VISUAL_STEPS, isDarkMode, cardClasses, mutedTextClasses, primaryButtonClass,
  gdprConsentA, gdprConsentB, gdprConsentC, gdprTextOpen,
  setGdprConsentA, setGdprConsentB, setGdprConsentC, setGdprTextOpen,
  onSubmit,
}) {
  return (
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
        <motion.div className="text-center mb-8" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <motion.div
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/50"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            onAnimationComplete={() => {
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#3b82f6', '#6366f1', '#8b5cf6', '#60a5fa'] });
            }}
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </motion.div>
          <motion.h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            Поздравления! Сега да преминем към анализа!
          </motion.h2>
          <motion.div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <Calendar className="w-4 h-4" />
            Приблизително време: 30 минути
          </motion.div>
        </motion.div>

        {/* GDPR */}
        <motion.div className={cn("rounded-2xl border-2 border-blue-200 p-6 mb-8", isDarkMode ? "bg-slate-800" : "bg-gradient-to-r from-blue-50/50 to-indigo-50/50")} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
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
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{GDPR_TEXT}</p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="space-y-3">
            {[
              { key: 'a', checked: gdprConsentA, onChange: setGdprConsentA, required: true, title: 'а) Финансов анализ и посредничество', desc: 'Съгласие за анализиране на личните ми финанси, финансово посредничество, предлагане и посредничество при избора на финансови продукти.' },
              { key: 'c', checked: gdprConsentC, onChange: setGdprConsentC, required: true, title: 'б) Предоставяне на трети лица', desc: 'Съгласие за предоставяне на личните ми данни на застраховател, кредитна институция, пенсионноосигурително дружество или инвестиционен посредник.' },
              { key: 'b', checked: gdprConsentB, onChange: setGdprConsentB, required: false, title: 'в) Маркетинг и информация', desc: 'Съгласие за информиране относно условия по предоставяни услуги, други услуги и продукти, информация от финансовите пазари и директен маркетинг.' },
            ].map(item => (
              <motion.label key={item.key} whileHover={{ x: 4 }} className={cn("flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200", item.checked ? "border-blue-500 bg-white shadow-lg shadow-blue-200/50" : "border-slate-200 hover:border-blue-300 bg-white")}>
                <Checkbox checked={item.checked} onCheckedChange={item.onChange} className="mt-1" />
                <div>
                  <p className="font-semibold text-slate-900">{item.title} {item.required && <span className="text-red-500">*</span>}</p>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.desc}</p>
                </div>
              </motion.label>
            ))}
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
          <Button
            className={cn("w-full sm:w-auto text-lg group shadow-2xl", primaryButtonClass)}
            disabled={!gdprConsentA || !gdprConsentC}
            onClick={onSubmit}
          >
            <FileText className="w-5 h-5 mr-2" />
            Започни Детайлния Анализ
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}