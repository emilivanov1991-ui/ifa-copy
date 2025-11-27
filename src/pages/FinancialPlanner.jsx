import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
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
  Sparkles,
  Shield,
  Heart,
  Eye,
  Award,
  CheckCircle,
  TrendingUp,
  Wallet,
  Target,
  Gem,
  Car,
  GraduationCap,
  Plane,
  Clock,
  FileSearch,
  Settings,
  Presentation,
  HeartHandshake,
  Lock,
  Scale,
  Lightbulb,
  HandCoins
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Goal images based on amount levels
const getGoalImage = (type, amount, maxAmount) => {
  const ratio = amount / maxAmount;
  
  const images = {
    reserve: {
      low: { icon: PiggyBank, color: 'from-amber-400 to-amber-500', bg: 'bg-amber-50' },
      medium: { icon: Shield, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-100' },
      high: { icon: Gem, color: 'from-amber-500 to-yellow-400', bg: 'bg-gradient-to-br from-amber-100 to-yellow-100' }
    },
    pension: {
      low: { icon: Clock, color: 'from-blue-400 to-blue-500', bg: 'bg-blue-50' },
      medium: { icon: Landmark, color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-100' },
      high: { icon: Palmtree, color: 'from-emerald-500 to-teal-500', bg: 'bg-gradient-to-br from-emerald-100 to-teal-100' }
    },
    housing: {
      low: { icon: Home, color: 'from-violet-400 to-violet-500', bg: 'bg-violet-50' },
      medium: { icon: Building2, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-100' },
      high: { icon: Sparkles, color: 'from-purple-500 to-pink-500', bg: 'bg-gradient-to-br from-purple-100 to-pink-100' }
    },
    goals: {
      low: { icon: Target, color: 'from-rose-400 to-rose-500', bg: 'bg-rose-50' },
      medium: { icon: Car, color: 'from-rose-500 to-pink-500', bg: 'bg-rose-100' },
      high: { icon: Plane, color: 'from-pink-500 to-rose-400', bg: 'bg-gradient-to-br from-pink-100 to-rose-100' }
    }
  };
  
  const level = ratio < 0.33 ? 'low' : ratio < 0.66 ? 'medium' : 'high';
  return images[type][level];
};

export default function FinancialPlanner() {
  // Step state
  const [step, setStep] = useState('intro'); // intro, questions, goals, process, values, redirect
  
  // Question answers
  const [familyType, setFamilyType] = useState('individual');
  const [employmentType, setEmploymentType] = useState('employee');
  const [age, setAge] = useState(35);
  const [income, setIncome] = useState(3000);
  
  // Goal amounts
  const [goals, setGoals] = useState({
    reserve: 0,
    pension: 0,
    housing: 0,
    other: 0
  });
  
  // Dialog states
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [showValuesDialog, setShowValuesDialog] = useState(false);
  const [showRedirectDialog, setShowRedirectDialog] = useState(false);
  const [hoveredValue, setHoveredValue] = useState(null);

  // Calculate totals based on inputs
  const calculateTotalWealth = () => {
    const yearsToRetirement = Math.max(65 - age, 0);
    const monthlyContribution = income * 0.2; // 20% savings rate
    const baseWealth = monthlyContribution * 12 * yearsToRetirement;
    const multiplier = familyType === 'family' ? 1.5 : 1;
    const employmentBonus = employmentType === 'entrepreneur' ? 1.2 : 1;
    return Math.round(baseWealth * multiplier * employmentBonus);
  };

  const totalWealth = calculateTotalWealth();
  const maxPerGoal = totalWealth * 0.6;

  // Initialize goals when moving to goals step
  useEffect(() => {
    if (step === 'goals') {
      const baseAmount = totalWealth * 0.15;
      setGoals({
        reserve: Math.round(baseAmount * 0.8),
        pension: Math.round(baseAmount * 1.2),
        housing: Math.round(baseAmount * 1.5),
        other: Math.round(baseAmount * 0.5)
      });
    }
  }, [step, totalWealth]);

  // Update other goals when one changes
  const handleGoalChange = (goalKey, newValue) => {
    const currentTotal = Object.values(goals).reduce((a, b) => a + b, 0);
    const oldValue = goals[goalKey];
    const difference = newValue - oldValue;
    
    // Calculate remaining goals and redistribute
    const otherKeys = Object.keys(goals).filter(k => k !== goalKey);
    const otherTotal = otherKeys.reduce((sum, k) => sum + goals[k], 0);
    
    if (otherTotal > 0 && difference !== 0) {
      const newGoals = { ...goals, [goalKey]: newValue };
      
      // Proportionally adjust other goals
      otherKeys.forEach(key => {
        const proportion = goals[key] / otherTotal;
        const adjustment = difference * proportion;
        newGoals[key] = Math.max(0, Math.round(goals[key] - adjustment * 0.3));
      });
      
      setGoals(newGoals);
    } else {
      setGoals({ ...goals, [goalKey]: newValue });
    }
  };

  const totalAllocated = Object.values(goals).reduce((a, b) => a + b, 0);

  // Process steps data
  const processSteps = [
    { 
      icon: FileSearch, 
      title: 'Финансов анализ', 
      description: 'Детайлен преглед на вашата текуща финансова ситуация, цели и нужди',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      icon: Settings, 
      title: 'Оптимизация', 
      description: 'Преглед и оптимизиране на съществуващи финансови продукти',
      color: 'from-violet-500 to-purple-500'
    },
    { 
      icon: Presentation, 
      title: 'Представяне и активиране', 
      description: 'Персонализиран финансов план и неговото стартиране',
      color: 'from-emerald-500 to-teal-500'
    },
    { 
      icon: HeartHandshake, 
      title: 'Дългосрочно обслужване', 
      description: 'Постоянна подкрепа и адаптиране на плана към вашия живот',
      color: 'from-rose-500 to-pink-500'
    }
  ];

  // Values data
  const values = [
    { 
      icon: Lock, 
      title: 'Дискретност', 
      description: 'Вашата информация е защитена и поверителна',
      color: 'from-slate-600 to-slate-700'
    },
    { 
      icon: Scale, 
      title: 'Коректност', 
      description: 'Честни и прозрачни взаимоотношения',
      color: 'from-blue-600 to-indigo-600'
    },
    { 
      icon: Lightbulb, 
      title: 'Прозрачност', 
      description: 'Ясни условия и открита комуникация',
      color: 'from-amber-500 to-orange-500'
    },
    { 
      icon: HandCoins, 
      title: 'Възнаграждение', 
      description: 'Справедливо ценообразуване на нашите услуги',
      color: 'from-emerald-500 to-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Sparkle effects */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 pt-24 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          
          {/* Intro Step */}
          <AnimatePresence mode="wait">
            {step === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30"
                >
                  <TrendingUp className="h-12 w-12 text-white" />
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl font-bold text-white mb-4"
                >
                  Financial <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Planner</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto"
                >
                  Открийте какво може да бъде постигнато с правилно финансово планиране
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button 
                    onClick={() => setStep('questions')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-10 py-6 text-lg rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all hover:scale-105"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Започни симулация
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {/* Questions Step */}
            {step === 'questions' && (
              <motion.div
                key="questions"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
              >
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-white mb-2">Разкажете ни за себе си</h2>
                  <p className="text-blue-200">Отговорете на 4 въпроса за персонализирана симулация</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Family Type */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="bg-white/10 backdrop-blur-xl border-white/20 overflow-hidden group hover:bg-white/15 transition-all">
                      <CardContent className="p-6">
                        <Label className="text-white text-lg mb-4 block flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-400" />
                          Семейно положение
                        </Label>
                        <RadioGroup value={familyType} onValueChange={setFamilyType} className="flex gap-4">
                          <div 
                            className={cn(
                              "flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all",
                              familyType === 'individual' 
                                ? "border-blue-500 bg-blue-500/20" 
                                : "border-white/20 hover:border-white/40"
                            )}
                            onClick={() => setFamilyType('individual')}
                          >
                            <User className={cn("h-8 w-8 mx-auto mb-2", familyType === 'individual' ? "text-blue-400" : "text-white/60")} />
                            <p className={cn("text-center font-medium", familyType === 'individual' ? "text-white" : "text-white/60")}>Индивид</p>
                          </div>
                          <div 
                            className={cn(
                              "flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all",
                              familyType === 'family' 
                                ? "border-blue-500 bg-blue-500/20" 
                                : "border-white/20 hover:border-white/40"
                            )}
                            onClick={() => setFamilyType('family')}
                          >
                            <Users className={cn("h-8 w-8 mx-auto mb-2", familyType === 'family' ? "text-blue-400" : "text-white/60")} />
                            <p className={cn("text-center font-medium", familyType === 'family' ? "text-white" : "text-white/60")}>Семейство</p>
                          </div>
                        </RadioGroup>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Employment Type */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="bg-white/10 backdrop-blur-xl border-white/20 overflow-hidden group hover:bg-white/15 transition-all">
                      <CardContent className="p-6">
                        <Label className="text-white text-lg mb-4 block flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-violet-400" />
                          Начин на осигуряване
                        </Label>
                        <RadioGroup value={employmentType} onValueChange={setEmploymentType} className="flex gap-4">
                          <div 
                            className={cn(
                              "flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all",
                              employmentType === 'employee' 
                                ? "border-violet-500 bg-violet-500/20" 
                                : "border-white/20 hover:border-white/40"
                            )}
                            onClick={() => setEmploymentType('employee')}
                          >
                            <Briefcase className={cn("h-8 w-8 mx-auto mb-2", employmentType === 'employee' ? "text-violet-400" : "text-white/60")} />
                            <p className={cn("text-center font-medium", employmentType === 'employee' ? "text-white" : "text-white/60")}>Служител</p>
                          </div>
                          <div 
                            className={cn(
                              "flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all",
                              employmentType === 'entrepreneur' 
                                ? "border-violet-500 bg-violet-500/20" 
                                : "border-white/20 hover:border-white/40"
                            )}
                            onClick={() => setEmploymentType('entrepreneur')}
                          >
                            <Building2 className={cn("h-8 w-8 mx-auto mb-2", employmentType === 'entrepreneur' ? "text-violet-400" : "text-white/60")} />
                            <p className={cn("text-center font-medium", employmentType === 'entrepreneur' ? "text-white" : "text-white/60")}>Предприемач</p>
                          </div>
                        </RadioGroup>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Age */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="bg-white/10 backdrop-blur-xl border-white/20 overflow-hidden group hover:bg-white/15 transition-all">
                      <CardContent className="p-6">
                        <Label className="text-white text-lg mb-4 block flex items-center gap-2">
                          <Clock className="h-5 w-5 text-emerald-400" />
                          Възраст
                        </Label>
                        <div className="space-y-4">
                          <div className="text-center">
                            <span className="text-4xl font-bold text-white">{age}</span>
                            <span className="text-blue-200 ml-2">години</span>
                          </div>
                          <Slider
                            value={[age]}
                            onValueChange={(v) => setAge(v[0])}
                            min={18}
                            max={65}
                            step={1}
                            className="py-4"
                          />
                          <div className="flex justify-between text-xs text-blue-300">
                            <span>18</span>
                            <span>65</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Income */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="bg-white/10 backdrop-blur-xl border-white/20 overflow-hidden group hover:bg-white/15 transition-all">
                      <CardContent className="p-6">
                        <Label className="text-white text-lg mb-4 block flex items-center gap-2">
                          <Wallet className="h-5 w-5 text-amber-400" />
                          Нетен месечен доход
                        </Label>
                        <div className="space-y-4">
                          <div className="text-center">
                            <span className="text-4xl font-bold text-white">{income.toLocaleString()}</span>
                            <span className="text-blue-200 ml-2">лв.</span>
                          </div>
                          <Slider
                            value={[income]}
                            onValueChange={(v) => setIncome(v[0])}
                            min={1000}
                            max={20000}
                            step={100}
                            className="py-4"
                          />
                          <div className="flex justify-between text-xs text-blue-300">
                            <span>1,000 лв.</span>
                            <span>20,000 лв.</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-center mt-8"
                >
                  <Button 
                    onClick={() => setStep('goals')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-10 py-6 text-lg rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all hover:scale-105"
                  >
                    Изчисли потенциала
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {/* Goals Step */}
            {step === 'goals' && (
              <motion.div
                key="goals"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Вашият финансов потенциал</h2>
                  <p className="text-blue-200">Разпределете средствата между различните цели</p>
                </div>

                {/* Total Wealth Display */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center mb-10"
                >
                  <div className="inline-block bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-xl rounded-3xl px-10 py-6 border border-white/20">
                    <p className="text-blue-200 text-sm uppercase tracking-wider mb-1">Общо имущество</p>
                    <p className="text-5xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                      {totalWealth.toLocaleString()} лв.
                    </p>
                    <p className="text-blue-300 text-sm mt-2">
                      Разпределено: {totalAllocated.toLocaleString()} лв. ({Math.round(totalAllocated / totalWealth * 100)}%)
                    </p>
                  </div>
                </motion.div>

                {/* Goals Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-10">
                  {[
                    { key: 'reserve', title: 'Резерв', subtitle: 'Финансова сигурност' },
                    { key: 'pension', title: 'Пенсия', subtitle: 'Бъдеще без притеснения' },
                    { key: 'housing', title: 'Жилище', subtitle: 'Собствен дом' },
                    { key: 'other', title: 'Други цели', subtitle: 'Мечти и пътувания' }
                  ].map((goal, index) => {
                    const imageConfig = getGoalImage(goal.key === 'other' ? 'goals' : goal.key, goals[goal.key], maxPerGoal);
                    const Icon = imageConfig.icon;
                    
                    return (
                      <motion.div
                        key={goal.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="bg-white/10 backdrop-blur-xl border-white/20 overflow-hidden hover:bg-white/15 transition-all group">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4 mb-4">
                              <motion.div 
                                className={cn(
                                  "w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg",
                                  imageConfig.color
                                )}
                                animate={{ 
                                  scale: [1, 1.05, 1],
                                }}
                                transition={{ 
                                  duration: 2,
                                  repeat: Infinity,
                                  repeatType: "reverse"
                                }}
                              >
                                <Icon className="h-8 w-8 text-white" />
                              </motion.div>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-white">{goal.title}</h3>
                                <p className="text-blue-300 text-sm">{goal.subtitle}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-white">{goals[goal.key].toLocaleString()}</p>
                                <p className="text-blue-300 text-sm">лв.</p>
                              </div>
                            </div>
                            
                            <Slider
                              value={[goals[goal.key]]}
                              onValueChange={(v) => handleGoalChange(goal.key, v[0])}
                              min={0}
                              max={maxPerGoal}
                              step={1000}
                              className="py-4"
                            />
                            
                            <div className="flex justify-between text-xs text-blue-300">
                              <span>0 лв.</span>
                              <span>{maxPerGoal.toLocaleString()} лв.</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <Button 
                    onClick={() => setShowProcessDialog(true)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-10 py-6 text-lg rounded-2xl shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all hover:scale-105"
                  >
                    Искам да продължа
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Process Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border-white/20 max-w-3xl p-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl" />
          </div>
          
          <div className="relative p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Система на работа</h2>
              <p className="text-blue-200">Нашият процес за постигане на вашите цели</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {processSteps.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-white/30 transition-all group"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br mb-3 shadow-lg group-hover:scale-110 transition-transform",
                    item.color
                  )}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-blue-200 text-sm">{item.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Button 
                onClick={() => {
                  setShowProcessDialog(false);
                  setTimeout(() => setShowValuesDialog(true), 300);
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-5 rounded-xl"
              >
                Продължи
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Values Dialog */}
      <Dialog open={showValuesDialog} onOpenChange={setShowValuesDialog}>
        <DialogContent className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border-white/20 max-w-3xl p-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl" />
          </div>
          
          <div className="relative p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Нашите ценности</h2>
              <p className="text-blue-200">Принципите, които ни водят</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onHoverStart={() => setHoveredValue(value.title)}
                  onHoverEnd={() => setHoveredValue(null)}
                  whileHover={{ scale: 1.08, y: -8 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-white/40 transition-all cursor-pointer text-center group"
                >
                  <motion.div 
                    className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br mx-auto mb-3 shadow-lg",
                      value.color
                    )}
                    animate={hoveredValue === value.title ? { 
                      rotate: [0, -10, 10, 0],
                      scale: [1, 1.1, 1.1, 1]
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <value.icon className="h-7 w-7 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-white">{value.title}</h3>
                  <AnimatePresence>
                    {hoveredValue === value.title && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-blue-200 text-xs mt-2"
                      >
                        {value.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Button 
                onClick={() => {
                  setShowValuesDialog(false);
                  setTimeout(() => setShowRedirectDialog(true), 300);
                }}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-5 rounded-xl"
              >
                Продължи
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Redirect Dialog */}
      <Dialog open={showRedirectDialog} onOpenChange={setShowRedirectDialog}>
        <DialogContent className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border-white/20 max-w-lg p-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="relative p-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30"
            >
              <CheckCircle className="h-10 w-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-white mb-4"
            >
              Добре!
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-blue-200 mb-8"
            >
              Нека сега преминем през анализа!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link to={createPageUrl('FinancialAnalysis')}>
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-10 py-6 text-lg rounded-2xl shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all hover:scale-105">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Към финансовия анализ
                </Button>
              </Link>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}