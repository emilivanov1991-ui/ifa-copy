import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Wallet, 
  Target, 
  CheckCircle,
  Loader2,
  FileCheck
} from 'lucide-react';
import { cn } from "@/lib/utils";

import PersonalInfoStep from '../components/analysis/PersonalInfoStep';
import FinancialInfoStep from '../components/analysis/FinancialInfoStep';
import GoalsStep from '../components/analysis/GoalsStep';
import ReviewStep from '../components/analysis/ReviewStep';

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Financials', icon: Wallet },
  { id: 3, title: 'Goals', icon: Target },
  { id: 4, title: 'Review', icon: CheckCircle },
];

export default function FinancialAnalysis() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    age: '',
    marital_status: '',
    dependents: '',
    employment_status: '',
    occupation: '',
    annual_income: '',
    monthly_expenses: '',
    total_savings: '',
    total_debt: '',
    owns_home: false,
    home_value: '',
    mortgage_balance: '',
    retirement_accounts: '',
    has_life_insurance: false,
    has_health_insurance: false,
    risk_tolerance: '',
    investment_timeline: '',
    primary_goals: [],
    additional_notes: '',
    status: 'new'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.first_name && formData.last_name && formData.email;
      case 2:
        return true; // Financial info is optional
      case 3:
        return true; // Goals are optional
      case 4:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Clean up empty values
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
              Analysis Request Submitted!
            </h2>
            <p className="text-lg text-slate-600 font-light mb-8">
              Thank you for completing your financial analysis form, {formData.first_name}. 
              One of our advisors will review your information and contact you within 24-48 hours 
              to schedule your complimentary consultation.
            </p>
            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <p className="text-blue-700 font-medium">What happens next?</p>
              <ul className="text-blue-600 text-sm mt-2 space-y-1 font-light">
                <li>✓ Your information is securely stored in our system</li>
                <li>✓ A dedicated advisor will be assigned to your case</li>
                <li>✓ You'll receive a call or email within 24-48 hours</li>
                <li>✓ We'll schedule your free consultation at your convenience</li>
              </ul>
            </div>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700 rounded-full px-8"
            >
              Return to Home
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="text-blue-600 font-medium text-sm tracking-widest uppercase mb-4 block">
            Free Financial Analysis
          </span>
          <h1 className="text-3xl md:text-4xl font-light text-slate-900 mb-4">
            Personal <span className="font-semibold text-blue-600">Financial</span> Assessment
          </h1>
          <p className="text-slate-600 font-light max-w-2xl mx-auto">
            Complete this confidential form to receive a personalized financial analysis 
            and consultation with one of our expert advisors.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-between items-center max-w-xl mx-auto">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div 
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                      currentStep >= step.id 
                        ? "bg-blue-600 text-white" 
                        : "bg-slate-200 text-slate-500"
                    )}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className={cn(
                    "text-xs mt-2 font-medium hidden sm:block",
                    currentStep >= step.id ? "text-blue-600" : "text-slate-500"
                  )}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "flex-1 h-1 mx-2 rounded-full transition-all duration-300",
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
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <PersonalInfoStep data={formData} onChange={handleChange} />
              )}
              {currentStep === 2 && (
                <FinancialInfoStep data={formData} onChange={handleChange} />
              )}
              {currentStep === 3 && (
                <GoalsStep data={formData} onChange={handleChange} />
              )}
              {currentStep === 4 && (
                <ReviewStep data={formData} />
              )}
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
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="bg-blue-600 hover:bg-blue-700 rounded-full px-6"
              >
                Next
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
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Analysis
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Privacy Notice */}
        <p className="text-center text-sm text-slate-500 mt-8 font-light">
          Your information is secure and confidential. We never share your data with third parties.
        </p>
      </div>
    </div>
  );
}