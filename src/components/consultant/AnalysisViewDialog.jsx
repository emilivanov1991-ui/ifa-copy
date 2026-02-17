import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Edit, 
  Shield,
  User,
  Home,
  PiggyBank,
  Umbrella,
  Baby,
  Wallet,
  BarChart3,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

import ConsentStep from '../analysis/ConsentStep';
import PersonalDataStep from '../analysis/PersonalDataStep';
import HousingStep from '../analysis/HousingStep';
import ReserveStep from '../analysis/ReserveStep';
import PensionStep from '../analysis/PensionStep';
import ChildrenGoalsStep from '../analysis/ChildrenGoalsStep';
import ProtectionStep from '../analysis/ProtectionStep';
import FinancialFlowStep from '../analysis/FinancialFlowStep';
import PrioritiesStep from '../analysis/PrioritiesStep';

const steps = [
  { id: 1, title: 'Съгласие', icon: Shield },
  { id: 3, title: 'Ново жилище', icon: Home },
  { id: 4, title: 'Резерв', icon: PiggyBank },
  { id: 5, title: 'Пенсия', icon: Umbrella },
  { id: 6, title: 'Деца и Други цели', icon: Baby },
  { id: 7, title: 'Защита', icon: Wallet },
  { id: 8, title: 'Финансов поток', icon: BarChart3 },
  { id: 9, title: 'Обобщение', icon: BarChart3 },
];

export default function AnalysisViewDialog({ analysisId, open, onOpenChange }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && analysisId) {
      loadAnalysis();
    }
  }, [open, analysisId]);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.FinancialAnalysisSubmission.get(analysisId);
      setAnalysis(data);
    } catch (error) {
      toast.error('Грешка при зареждане на анализ');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      // Копираме анализа и създаваме нов
      const { id, created_date, updated_date, created_by, created_by_id, ...analysisData } = analysis;
      
      const newAnalysis = await base44.entities.FinancialAnalysisSubmission.create({
        ...analysisData,
        status: 'new'
      });
      
      toast.success('Създаден е нов анализ за редакция');
      
      // Навигираме към страницата за редакция
      navigate(createPageUrl('FinancialAnalysis') + '?edit=' + newAnalysis.id);
      onOpenChange(false);
    } catch (error) {
      toast.error('Грешка при копиране на анализ');
    }
  };

  // Validate step for progress indicator
  const validateStep = (step) => {
    // Simple validation - we'll mark steps as complete if they have any data
    switch (step) {
      case 1:
        return analysis.gdpr_consent_a && analysis.gdpr_consent_c;
      case 2:
        return !!(analysis.client_first_name && analysis.client_email);
      case 3:
        return !!analysis.current_housing;
      case 4:
        return analysis.client_monthly_net_income !== undefined;
      case 5:
        return analysis.client_gross_income_pension !== undefined;
      case 6:
        return true; // Optional step
      case 7:
        return !!analysis.income_source;
      case 8:
        return analysis.client_gross_income !== undefined;
      case 9:
        return analysis.priority_income_protection !== undefined;
      default:
        return false;
    }
  };

  const getStepStatus = (stepId) => {
    if (validateStep(stepId)) return 'complete';
    return 'future';
  };

  if (loading || !analysis) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <DialogTitle className="text-xl font-semibold text-slate-900">
                  {analysis.client_first_name} {analysis.client_last_name}
                </DialogTitle>
                <Badge variant={analysis.status === 'converted' ? 'default' : 'secondary'}>
                  {analysis.status === 'new' && 'Нов'}
                  {analysis.status === 'contacted' && 'Контактиран'}
                  {analysis.status === 'in_progress' && 'В процес'}
                  {analysis.status === 'converted' && 'Конвертиран'}
                  {analysis.status === 'closed' && 'Затворен'}
                </Badge>
              </div>
              <p className="text-sm text-slate-500">
                Създаден на {new Date(analysis.created_date).toLocaleDateString('bg-BG')}
              </p>
            </div>
            <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700 mt-1">
              <Edit className="h-4 w-4 mr-2" />
              Промени
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex justify-between items-center overflow-x-auto">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity min-w-[60px]"
                >
                  <div 
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 text-xs",
                      currentStep === step.id 
                        ? "bg-blue-600 text-white" 
                        : getStepStatus(step.id) === 'complete'
                          ? "bg-green-500 text-white"
                          : "bg-slate-300 text-white"
                    )}
                  >
                    {currentStep === step.id ? (
                      <step.icon className="h-4 w-4" />
                    ) : getStepStatus(step.id) === 'complete' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-3 w-3" />
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] mt-1 font-medium whitespace-nowrap",
                    currentStep === step.id 
                      ? "text-blue-600" 
                      : getStepStatus(step.id) === 'complete' 
                        ? "text-green-600" 
                        : "text-slate-400"
                  )}>
                    {step.title}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-1 min-w-[12px] rounded-full transition-all duration-300",
                    getStepStatus(step.id) === 'complete' ? "bg-green-500" : "bg-slate-200"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 1 && <ConsentStep data={analysis} onChange={() => {}} showErrors={false} readOnly />}
              {currentStep === 2 && <PersonalDataStep data={analysis} onChange={() => {}} showErrors={false} readOnly />}
              {currentStep === 3 && <HousingStep data={analysis} onChange={() => {}} showErrors={false} readOnly />}
              {currentStep === 4 && <ReserveStep data={analysis} onChange={() => {}} showErrors={false} readOnly />}
              {currentStep === 5 && <PensionStep data={analysis} onChange={() => {}} showErrors={false} readOnly />}
              {currentStep === 6 && <ChildrenGoalsStep data={analysis} onChange={() => {}} showErrors={false} readOnly />}
              {currentStep === 7 && <ProtectionStep data={analysis} onChange={() => {}} showErrors={false} readOnly />}
              {currentStep === 8 && <FinancialFlowStep data={analysis} onChange={() => {}} showErrors={false} readOnly />}
              {currentStep === 9 && <PrioritiesStep data={analysis} onChange={() => {}} showErrors={false} readOnly />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => {
              const idx = steps.findIndex(s => s.id === currentStep);
              if (idx > 0) setCurrentStep(steps[idx - 1].id);
            }}
            disabled={currentStep === steps[0].id}
          >
            Назад
          </Button>
          <span className="text-sm text-slate-500">
            Стъпка {steps.findIndex(s => s.id === currentStep) + 1} от {steps.length}
          </span>
          <Button
            onClick={() => {
              const idx = steps.findIndex(s => s.id === currentStep);
              if (idx < steps.length - 1) setCurrentStep(steps[idx + 1].id);
            }}
            disabled={currentStep === steps[steps.length - 1].id}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Напред
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}