import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { 
  ArrowRight, 
  ArrowLeft, 
  Shield,
  User,
  Home,
  PiggyBank,
  Umbrella,
  Baby,
  Wallet,
  BarChart3,
  ListOrdered,
  CheckCircle,
  Loader2,
  FileCheck
} from 'lucide-react';
import { cn } from "@/lib/utils";

import ConsentStep from '../components/analysis/ConsentStep';
import PersonalDataStep from '../components/analysis/PersonalDataStep';
import HousingStep from '../components/analysis/HousingStep';
import ReserveStep from '../components/analysis/ReserveStep';
import PensionStep from '../components/analysis/PensionStep';
import ChildrenGoalsStep from '../components/analysis/ChildrenGoalsStep';
import ProtectionStep from '../components/analysis/ProtectionStep';
import FinancialFlowStep from '../components/analysis/FinancialFlowStep';
import PrioritiesStep from '../components/analysis/PrioritiesStep';

const steps = [
  { id: 1, title: 'Съгласие', icon: Shield },
  { id: 2, title: 'Лични данни', icon: User },
  { id: 3, title: 'Ново жилище', icon: Home },
  { id: 4, title: 'Резерв', icon: PiggyBank },
  { id: 5, title: 'Пенсия', icon: Umbrella },
  { id: 6, title: 'Деца и цели', icon: Baby },
  { id: 7, title: 'Защита', icon: Wallet },
  { id: 8, title: 'Финансов поток', icon: BarChart3 },
  { id: 9, title: 'Приоритети', icon: ListOrdered },
];

export default function FinancialAnalysis() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    gdpr_consent_a: false,
    gdpr_consent_b: false,
    gdpr_consent_c: false,
    status: 'new'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.gdpr_consent_a;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 9) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const cleanData = { ...formData };
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === '' || cleanData[key] === null) {
        delete cleanData[key];
      }
    });

    await base44.entities.FinancialAnalysisSubmission.create(cleanData);
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-2xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <FileCheck className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-semibold text-slate-900 mb-4">
              Анализът е изпратен успешно!
            </h2>
            <p className="text-lg text-slate-600 font-light mb-8">
              Благодарим Ви за попълването на персоналния финансов анализ. 
              Един от нашите консултанти ще прегледа информацията и ще се свърже с Вас 
              в рамките на 24-48 часа, за да насрочим Вашата безплатна консултация.
            </p>
            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <p className="text-blue-700 font-medium">Какво следва?</p>
              <ul className="text-blue-600 text-sm mt-2 space-y-1 font-light text-left">
                <li>✓ Вашата информация е защитена и съхранена сигурно</li>
                <li>✓ Персонален консултант ще бъде назначен към Вашия случай</li>
                <li>✓ Ще получите обаждане или имейл в рамките на 24-48 часа</li>
                <li>✓ Ще насрочим безплатна консултация по Ваше удобство</li>
              </ul>
            </div>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700 rounded-full px-8"
            >
              Към началната страница
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <span className="text-blue-600 font-medium text-sm tracking-widest uppercase mb-4 block">
            Персонален финансов анализ
          </span>
          <h1 className="text-3xl md:text-4xl font-light text-slate-900 mb-4">
            Персонален <span className="font-semibold text-blue-600">Финансов</span> Анализ
          </h1>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex justify-between items-center min-w-max px-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                  disabled={currentStep < step.id}
                  className="flex flex-col items-center"
                >
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                      currentStep >= step.id 
                        ? "bg-blue-600 text-white" 
                        : "bg-slate-200 text-slate-500"
                    )}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs mt-1 font-medium whitespace-nowrap",
                    currentStep >= step.id ? "text-blue-600" : "text-slate-500"
                  )}>
                    {step.title}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-1 min-w-[20px] rounded-full transition-all duration-300",
                    currentStep > step.id ? "bg-blue-600" : "bg-slate-200"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-10"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && <ConsentStep data={formData} onChange={handleChange} />}
              {currentStep === 2 && <PersonalDataStep data={formData} onChange={handleChange} />}
              {currentStep === 3 && <HousingStep data={formData} onChange={handleChange} />}
              {currentStep === 4 && <ReserveStep data={formData} onChange={handleChange} />}
              {currentStep === 5 && <PensionStep data={formData} onChange={handleChange} />}
              {currentStep === 6 && <ChildrenGoalsStep data={formData} onChange={handleChange} />}
              {currentStep === 7 && <ProtectionStep data={formData} onChange={handleChange} />}
              {currentStep === 8 && <FinancialFlowStep data={formData} onChange={handleChange} />}
              {currentStep === 9 && <PrioritiesStep data={formData} onChange={handleChange} />}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="rounded-full px-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>

            {currentStep < 9 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="bg-blue-600 hover:bg-blue-700 rounded-full px-6"
              >
                Напред
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 rounded-full px-8"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Изпращане...
                  </>
                ) : (
                  <>
                    Изпрати анализа
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Privacy Notice */}
        <p className="text-center text-sm text-slate-500 mt-6 font-light">
          Вашата информация е защитена и поверителна. Никога не споделяме данните Ви с трети страни без Вашето съгласие.
        </p>
      </div>
    </div>
  );
}