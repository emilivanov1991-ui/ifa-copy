import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RotateCcw, User, Users, ArrowRight, Sparkles, XCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function PlannerStep1({ 
  VISUAL_STEPS, currentStep, isDarkMode, cardClasses, mutedTextClasses, primaryButtonClass, 
  familyType, setFamilyType, clientFirstName, setClientFirstName, clientLastName, setClientLastName, 
  clientPhone, setClientPhone, clientEmail, setClientEmail, partnerFirstName, setPartnerFirstName, 
  partnerLastName, setPartnerLastName, partnerPhone, setPartnerPhone, partnerEmail, setPartnerEmail, 
  childrenCount, setChildrenCount, childrenNames, setChildrenNames, goNext, restart, 
  clientEmailTouched, setClientEmailTouched, partnerEmailTouched, setPartnerEmailTouched, isValidEmail
}) {
  return (
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
                          "w-full h-1.5 mb-1 rounded-full transition-all duration-300",
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
    )
}