import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, ArrowRight, Sparkles, Shield, TrendingUp, PiggyBank, Home, Baby, Plane, Heart, Briefcase, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Shared mini step tracker
function MiniTracker({ VISUAL_STEPS, currentStep, isDarkMode, isCurrent }) {
  return (
    <div className="mb-6 pb-4 border-b border-slate-100">
      <div className="flex justify-between items-start">
        {VISUAL_STEPS.map((step, index) => {
          const isActive = currentStep >= (index + 1);
          const cur = index === isCurrent;
          return (
            <div key={step.id} className={cn("flex flex-col items-center text-center flex-1 transition-all duration-300", isActive ? "opacity-100" : "opacity-40")}>
              <div className={cn("w-full h-1 mb-2 rounded-full transition-all duration-300", cur ? "bg-blue-500" : isActive ? "bg-blue-500" : isDarkMode ? "bg-slate-700" : "bg-slate-200")} />
              <span className={cn("text-[9px] font-semibold tracking-wider leading-tight uppercase", cur ? "text-slate-900" : "text-slate-400")}>{step.label}</span>
              <span className={cn("text-[9px] font-semibold tracking-wider leading-tight uppercase", cur ? "text-slate-900" : "text-slate-400")}>{step.subLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PlannerStep3({ VISUAL_STEPS, currentStep, isDarkMode, cardClasses, mutedTextClasses, primaryButtonClass, goNext, restart, familyType, clientFirstName, partnerFirstName, clientAge, partnerAge, childrenCount, childrenNames, childrenAges, setClientAge, setPartnerAge, setChildrenAges }) {
  return (
    <motion.div key="step-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid lg:grid-cols-4 gap-8 items-center h-full">
      <div className="lg:col-span-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-6"><Sparkles className="w-4 h-4" />СТЪПКА 3 ОТ 9</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Възраст</h1>
        <p className={cn("text-lg mb-6 leading-relaxed", mutedTextClasses)}>Необходимо за изчисляване на оптималния план до пенсия.</p>
      </div>
      <div className={cn("lg:col-span-3 rounded-3xl border p-8 min-h-[500px] flex flex-col", cardClasses)}>
        <MiniTracker VISUAL_STEPS={VISUAL_STEPS} currentStep={currentStep} isDarkMode={isDarkMode} isCurrent={2} />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/30">3</div><span className="text-sm font-semibold text-blue-600">ВЪЗРАСТ</span></div>
          <button onClick={restart} className="p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"><RotateCcw className="w-5 h-5" /></button>
        </div>
        <h2 className="text-3xl font-bold mb-8">Възраст</h2>
        <div className="space-y-8 mb-8 flex-1">
          <div className={cn("grid gap-8", familyType === 'family' ? "grid-cols-2" : "grid-cols-1")}>
            <div className="flex flex-col justify-center">
              <p className={cn("text-base font-medium mb-4", mutedTextClasses)}>{familyType === 'family' ? (clientFirstName || 'КЛИЕНТ') : 'ВАШАТА ВЪЗРАСТ'}</p>
              <div className="text-center mb-4">
                <input type="text" inputMode="numeric" value={clientAge} onChange={(e) => { const v = e.target.value; if (v === '') { setClientAge(''); return; } const n = parseInt(v); if (!isNaN(n)) setClientAge(n); }} onBlur={() => { if (clientAge === '' || clientAge < 18) setClientAge(18); else if (clientAge > 70) setClientAge(70); }} className="text-5xl font-bold text-blue-500 bg-transparent border-none text-center w-24 outline-none focus:ring-2 focus:ring-blue-500 rounded" />
                <span className={cn("text-xl ml-2", mutedTextClasses)}>години</span>
              </div>
              <Slider value={[typeof clientAge === 'number' ? clientAge : 35]} onValueChange={(v) => setClientAge(v[0])} min={18} max={70} step={1} className="mb-2" />
              <div className={cn("flex justify-between text-sm", mutedTextClasses)}><span>18</span><span>70</span></div>
            </div>
            {familyType === 'family' && (
              <div className="flex flex-col justify-center">
                <p className={cn("text-base font-medium mb-4", mutedTextClasses)}>{partnerFirstName || 'ПАРТНЬОР'}</p>
                <div className="text-center mb-4">
                  <input type="text" inputMode="numeric" value={partnerAge} onChange={(e) => { const v = e.target.value; if (v === '') { setPartnerAge(''); return; } const n = parseInt(v); if (!isNaN(n)) setPartnerAge(n); }} onBlur={() => { if (partnerAge === '' || partnerAge < 18) setPartnerAge(18); else if (partnerAge > 70) setPartnerAge(70); }} className="text-5xl font-bold text-blue-500 bg-transparent border-none text-center w-24 outline-none focus:ring-2 focus:ring-blue-500 rounded" />
                  <span className={cn("text-xl ml-2", mutedTextClasses)}>години</span>
                </div>
                <Slider value={[typeof partnerAge === 'number' ? partnerAge : 35]} onValueChange={(v) => setPartnerAge(v[0])} min={18} max={70} step={1} className="mb-2" />
                <div className={cn("flex justify-between text-sm", mutedTextClasses)}><span>18</span><span>70</span></div>
              </div>
            )}
          </div>
          {childrenCount > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6">
              {Array.from({ length: childrenCount }).map((_, idx) => (
                <div key={idx}>
                  <p className={cn("text-base font-medium mb-4", mutedTextClasses)}>{childrenNames[idx] || `ДЕТЕ ${idx + 1}`}</p>
                  <div className="text-center mb-4">
                    <input type="text" inputMode="numeric" value={childrenAges[idx] !== undefined ? childrenAges[idx] : ''} onChange={(e) => { const v = e.target.value; const a = [...childrenAges]; if (v === '') { a[idx] = ''; setChildrenAges(a); return; } const n = parseInt(v); if (!isNaN(n)) { a[idx] = n; setChildrenAges(a); } }} onBlur={() => { const a = [...childrenAges]; if (a[idx] === '' || a[idx] < 0) a[idx] = 0; else if (a[idx] > 18) a[idx] = 18; setChildrenAges(a); }} className="text-5xl font-bold text-blue-500 bg-transparent border-none text-center w-24 outline-none focus:ring-2 focus:ring-blue-500 rounded" />
                    <span className={cn("text-xl ml-2", mutedTextClasses)}>години</span>
                  </div>
                  <Slider value={[typeof childrenAges[idx] === 'number' ? childrenAges[idx] : 0]} onValueChange={(v) => { const a = [...childrenAges]; a[idx] = v[0]; setChildrenAges(a); }} min={0} max={18} step={1} className="mb-2" />
                  <div className={cn("flex justify-between text-sm", mutedTextClasses)}><span>0</span><span>18</span></div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
        <div className="flex justify-center"><Button onClick={goNext} className={cn(primaryButtonClass, "text-lg group")}>Следваща стъпка<ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /></Button></div>
      </div>
    </motion.div>
  );
}

export function PlannerStep4({ VISUAL_STEPS, currentStep, isDarkMode, cardClasses, mutedTextClasses, primaryButtonClass, goNext, restart, familyType, clientFirstName, partnerFirstName, monthlyIncome, partnerIncome, setMonthlyIncome, setPartnerIncome, formatNumber }) {
  const total = (typeof monthlyIncome === 'number' ? monthlyIncome : 0) + (typeof partnerIncome === 'number' ? partnerIncome : 0);
  return (
    <motion.div key="step-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid lg:grid-cols-4 gap-8 items-center h-full">
      <div className="lg:col-span-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-6"><Sparkles className="w-4 h-4" />СТЪПКА 4 ОТ 9</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Месечен Доход</h1>
        <p className={cn("text-lg mb-6 leading-relaxed", mutedTextClasses)}>{familyType === 'family' ? 'Нетните доходи след удръжки и данъци.' : 'Нетният доход след удръжки и данъци.'}</p>
      </div>
      <div className={cn("lg:col-span-3 rounded-3xl border p-8 min-h-[500px] flex flex-col", cardClasses)}>
        <MiniTracker VISUAL_STEPS={VISUAL_STEPS} currentStep={currentStep} isDarkMode={isDarkMode} isCurrent={3} />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/30">4</div><span className="text-sm font-semibold text-blue-600">МЕСЕЧЕН ДОХОД</span></div>
          <button onClick={restart} className="p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"><RotateCcw className="w-5 h-5" /></button>
        </div>
        <h2 className="text-3xl font-bold mb-8">Месечен доход</h2>
        <div className={cn("grid gap-8 mb-6 flex-1", familyType === 'family' ? "grid-cols-2" : "grid-cols-1")}>
          <div className="flex flex-col justify-center">
            <p className={cn("text-base font-medium mb-4", mutedTextClasses)}>{familyType === 'family' ? (clientFirstName || 'КЛИЕНТ') : 'ВАШИЯТ ДОХОД'}</p>
            <div className="text-center mb-4">
              <input type="text" inputMode="numeric" value={monthlyIncome} onChange={(e) => { const v = e.target.value; if (v === '') { setMonthlyIncome(''); return; } const n = parseInt(v); if (!isNaN(n)) setMonthlyIncome(n); }} onBlur={() => { if (monthlyIncome === '' || monthlyIncome < 400) setMonthlyIncome(400); else if (monthlyIncome > 15000) setMonthlyIncome(15000); }} className="text-4xl font-bold text-blue-500 bg-transparent border-none text-center w-36 outline-none focus:ring-2 focus:ring-blue-500 rounded" />
              <span className={cn("text-xl ml-2", mutedTextClasses)}>€</span>
            </div>
            <Slider value={[typeof monthlyIncome === 'number' ? monthlyIncome : 1000]} onValueChange={(v) => setMonthlyIncome(v[0])} min={400} max={15000} step={100} className="mb-2" />
            <div className={cn("flex justify-between text-sm", mutedTextClasses)}><span>400 €</span><span>15 000 €</span></div>
          </div>
          {familyType === 'family' && (
            <div className="flex flex-col justify-center">
              <p className={cn("text-base font-medium mb-4", mutedTextClasses)}>{partnerFirstName || 'ПАРТНЬОР'}</p>
              <div className="text-center mb-4">
                <input type="text" inputMode="numeric" value={partnerIncome} onChange={(e) => { const v = e.target.value; if (v === '') { setPartnerIncome(''); return; } const n = parseInt(v); if (!isNaN(n)) setPartnerIncome(n); }} onBlur={() => { if (partnerIncome === '' || partnerIncome < 400) setPartnerIncome(400); else if (partnerIncome > 15000) setPartnerIncome(15000); }} className="text-4xl font-bold text-blue-500 bg-transparent border-none text-center w-36 outline-none focus:ring-2 focus:ring-blue-500 rounded" />
                <span className={cn("text-xl ml-2", mutedTextClasses)}>€</span>
              </div>
              <Slider value={[typeof partnerIncome === 'number' ? partnerIncome : 1000]} onValueChange={(v) => setPartnerIncome(v[0])} min={400} max={15000} step={100} className="mb-2" />
              <div className={cn("flex justify-between text-sm", mutedTextClasses)}><span>400 €</span><span>15 000 €</span></div>
            </div>
          )}
        </div>
        {familyType === 'family' && (
          <motion.div className={cn("p-6 rounded-2xl mb-6 border-2 border-blue-200", isDarkMode ? "bg-slate-800" : "bg-gradient-to-r from-blue-50 to-indigo-50")} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-blue-900">Общо месечен доход:</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{formatNumber(total)} €</span>
            </div>
          </motion.div>
        )}
        <div className="flex justify-center"><Button onClick={goNext} className={cn(primaryButtonClass, "text-lg group")}>Следваща стъпка<ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /></Button></div>
      </div>
    </motion.div>
  );
}

const PRIORITIES = [
  { key: 'stability', icon: Shield, label: 'Финансова сигурност', desc: 'Резерв и защита' },
  { key: 'investments', icon: TrendingUp, label: 'Инвестиции', desc: 'Растеж на капитала' },
  { key: 'pension', icon: PiggyBank, label: 'Пенсия', desc: 'Спокойна старост' },
  { key: 'housing', icon: Home, label: 'Ново жилище', desc: 'Собствен дом' },
  { key: 'children', icon: Baby, label: 'Бъдеще на децата', desc: 'Образование и старт' },
  { key: 'travel', icon: Plane, label: 'Пътувания', desc: 'Преживявания' },
  { key: 'health', icon: Heart, label: 'Здраве', desc: 'Застраховки и грижа' },
  { key: 'business', icon: Briefcase, label: 'Бизнес', desc: 'Собствен бизнес' },
];

export function PlannerStep5({ VISUAL_STEPS, currentStep, isDarkMode, cardClasses, mutedTextClasses, primaryButtonClass, goNext, restart, selectedPriorities, togglePriority }) {
  return (
    <motion.div key="step-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid lg:grid-cols-4 gap-4 items-stretch h-[calc(100vh-48px)]">
      <div className="lg:col-span-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-4"><Sparkles className="w-4 h-4" />СТЪПКА 5 ОТ 9</div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Вашите Финансови Приоритети</h1>
        <p className={cn("text-base leading-relaxed", mutedTextClasses)}>Изберете всички области, които са важни за Вас.</p>
      </div>
      <div className={cn("lg:col-span-3 rounded-3xl border p-4 flex flex-col", cardClasses)}>
        <div className="mb-2 pb-2 border-b border-slate-100">
          <div className="flex justify-between items-start">
            {VISUAL_STEPS.map((step, index) => {
              const isActive = currentStep >= (index + 1); const isCurrent = index === 4;
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
          <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/30">5</div><span className="text-xs font-semibold text-blue-600">ПРИОРИТЕТИ</span></div>
          <button onClick={restart} className="p-1 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"><RotateCcw className="w-4 h-4" /></button>
        </div>
        <h2 className="text-xl font-bold mb-1">Вашите финансови приоритети</h2>
        <p className={cn("text-sm mb-2", mutedTextClasses)}>Изберете всички области, които са важни за Вас.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 flex-1">
          {PRIORITIES.map(({ key, icon: Icon, label, desc }) => {
            const selected = selectedPriorities.includes(key);
            return (
              <motion.button key={key} onClick={() => togglePriority(key)} whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }} className={cn("p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center h-full group relative overflow-hidden", selected ? "border-blue-500 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/50" : isDarkMode ? "border-slate-700 hover:border-blue-400 bg-slate-800/50" : "border-slate-200 hover:border-blue-400 bg-white hover:shadow-lg")}>
                {selected && <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent" />}
                <Icon className={cn("w-10 h-10 mb-2 relative z-10", selected ? "text-white" : "text-blue-600 group-hover:text-blue-700")} />
                <h3 className={cn("font-bold text-sm text-center relative z-10", !selected && "text-slate-900")}>{label}</h3>
                <p className={cn("text-xs text-center relative z-10 mt-1", selected ? "text-blue-100" : "text-slate-500")}>{desc}</p>
              </motion.button>
            );
          })}
        </div>
        {selectedPriorities.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={cn("p-3 rounded-xl mb-2 flex items-center gap-2 border-2 border-blue-200", isDarkMode ? "bg-slate-800" : "bg-gradient-to-r from-blue-50 to-indigo-50")}>
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <p className="text-sm font-semibold text-blue-700">Избрани: {selectedPriorities.length} {selectedPriorities.length === 1 ? 'приоритет' : 'приоритета'}</p>
          </motion.div>
        )}
        <div className="flex justify-center"><Button onClick={goNext} disabled={selectedPriorities.length === 0} className={cn(primaryButtonClass, "group")}>Следваща стъпка<ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /></Button></div>
      </div>
    </motion.div>
  );
}