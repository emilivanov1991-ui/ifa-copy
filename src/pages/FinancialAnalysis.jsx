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
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  { id: 6, title: 'Деца и Други цели', icon: Baby },
  { id: 7, title: 'Защита', icon: Wallet },
  { id: 8, title: 'Финансов поток', icon: BarChart3 },
  { id: 9, title: 'Приоритети', icon: ListOrdered },
];

export default function FinancialAnalysis() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [showSavingsDiscrepancyModal, setShowSavingsDiscrepancyModal] = useState(false);
  const [formData, setFormData] = useState({
    gdpr_consent_a: false,
    gdpr_consent_b: false,
    gdpr_consent_c: false,
    status: 'new'
  });

  // Calculate if savings discrepancy exists
  const checkSavingsDiscrepancy = () => {
    // Calculate months since contract start
    const calculateMonthsSinceStart = (startDate) => {
      if (!startDate) return 0;
      const start = new Date(startDate);
      const now = new Date();
      const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
      return Math.max(0, months);
    };

    const clientMonthsWorking = calculateMonthsSinceStart(formData.client_contract_start_date);
    const partnerMonthsWorking = formData.include_partner ? calculateMonthsSinceStart(formData.partner_contract_start_date) : 0;

    // Get incomes
    const clientNetIncome = formData.client_net_income || 0;
    const partnerNetIncome = formData.include_partner ? (formData.partner_net_income || 0) : 0;
    const totalMonthlyIncome = clientNetIncome + partnerNetIncome;

    // Calculate monthly balance (income - expenses)
    const totalExpenses = (formData.expense_rent || 0) + (formData.expense_utilities || 0) + 
      (formData.expense_phone || 0) + (formData.expense_internet || 0) + (formData.expense_tv || 0) + 
      (formData.expense_other_housing || 0) + (formData.expense_fuel || 0) + (formData.expense_car_maintenance || 0) + 
      (formData.expense_car_other || 0) + (formData.expense_food || 0) + (formData.expense_clothing || 0) + 
      (formData.expense_culture || 0) + (formData.expense_travel || 0) + (formData.expense_children || 0) + 
      (formData.expense_cigarettes || 0) + (formData.expense_pets || 0) + (formData.expense_vacation || 0) + 
      (formData.expense_business || 0) + (formData.expense_other || 0) + (formData.expense_education || 0) + 
      (formData.expense_health || 0) + (formData.expense_cosmetics || 0) + (formData.expense_hobbies || 0) + 
      (formData.expense_electronics || 0) + (formData.expense_taxes || 0);

    const monthlyDebtPayments = (formData.liability_mortgage_monthly || 0) + (formData.liability_consumer_loans_monthly || 0) +
      (formData.liability_credit_cards_monthly || 0) + (formData.liability_leasing_monthly || 0) + 
      (formData.liability_overdraft_monthly || 0);

    const monthlyBalance = totalMonthlyIncome - totalExpenses - monthlyDebtPayments;

    // Calculate expected savings
    let expectedSavings = 0;
    if (formData.include_partner && totalMonthlyIncome > 0) {
      // Each person saves their proportion based on savings rate
      const savingsRate = monthlyBalance / totalMonthlyIncome;
      expectedSavings = (clientNetIncome * savingsRate * clientMonthsWorking) + 
                        (partnerNetIncome * savingsRate * partnerMonthsWorking);
    } else {
      expectedSavings = monthlyBalance * clientMonthsWorking;
    }

    // Get actual savings
    const actualSavings = (formData.asset_checking_account || 0) + (formData.asset_short_term_savings || 0) + 
      (formData.asset_medium_term_savings || 0) + (formData.asset_long_term_savings || 0);

    // Check if expected is 20% or more higher than actual
    if (expectedSavings > 0 && actualSavings > 0) {
      const discrepancyRatio = (expectedSavings - actualSavings) / actualSavings;
      return discrepancyRatio >= 0.2;
    }

    return false;
  };

  // Check if discrepancy reason is valid
  const isSavingsDiscrepancyReasonValid = () => {
    if (!checkSavingsDiscrepancy()) return true;
    
    const hasAnyReason = formData.savings_discrepancy_reason_1 || 
                         formData.savings_discrepancy_reason_2 || 
                         formData.savings_discrepancy_reason_3 || 
                         formData.savings_discrepancy_reason_4;
    
    if (formData.savings_discrepancy_reason_4 && !formData.savings_discrepancy_reason_other) {
      return false;
    }
    
    return hasAnyReason;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation errors when user starts filling
    if (showValidationErrors) {
      setShowValidationErrors(false);
    }
  };

  // Scroll to first invalid field and highlight it
  const scrollToFirstInvalidField = () => {
    setShowValidationErrors(true);
    
    // Wait for DOM to update with error styles
    setTimeout(() => {
      const invalidField = document.querySelector('[data-invalid="true"]');
      if (invalidField) {
        invalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        invalidField.focus?.();
      }
    }, 100);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.gdpr_consent_a && formData.gdpr_consent_c;
      case 2:
        // Client required fields
        const clientValid = !!(
          formData.client_first_name &&
          formData.client_middle_name &&
          formData.client_last_name &&
          formData.client_birthdate &&
          formData.client_gender &&
          formData.client_birthplace &&
          formData.client_egn &&
          formData.client_id_number &&
          formData.client_id_valid_until &&
          formData.client_address &&
          formData.client_phone &&
          formData.client_email &&
          formData.client_marital_status &&
          formData.client_nationality
        );
        
        // Employment validation
        let clientEmploymentValid = true;
        if (formData.client_is_employed ?? true) {
          clientEmploymentValid = !!(
            formData.client_job_description &&
            formData.client_employer_name &&
            formData.client_contract_type &&
            formData.client_contract_term &&
            formData.client_contract_start_date
          );
        } else {
          clientEmploymentValid = !!(
            formData.client_income_source &&
            formData.client_activity
          );
        }
        
        // Health validation (if not in good health)
        let clientHealthValid = true;
        if (formData.client_is_good_health === false) {
          clientHealthValid = !!(
            formData.client_health_explanation &&
            formData.client_height_cm &&
            formData.client_weight_kg
          );
        }
        
        // Children validation
        let childrenValid = formData.children_count !== undefined;
        if ((formData.children_count || 0) > 0) {
          for (let i = 1; i <= formData.children_count; i++) {
            if (!formData[`child_${i}_name`] || !formData[`child_${i}_birthdate`]) {
              childrenValid = false;
              break;
            }
          }
        }
        
        // Partner validation (only if included)
        let partnerValid = true;
        if (formData.include_partner) {
          partnerValid = !!(
            formData.partner_first_name &&
            formData.partner_middle_name &&
            formData.partner_last_name &&
            formData.partner_birthdate &&
            formData.partner_gender &&
            formData.partner_birthplace &&
            formData.partner_egn &&
            formData.partner_id_number &&
            formData.partner_id_valid_until &&
            formData.partner_address &&
            formData.partner_phone &&
            formData.partner_email &&
            formData.partner_marital_status &&
            formData.partner_nationality
          );
          
          // Partner employment validation
          if (formData.partner_is_employed ?? true) {
            partnerValid = partnerValid && !!(
              formData.partner_job_description &&
              formData.partner_employer_name &&
              formData.partner_contract_type &&
              formData.partner_contract_term &&
              formData.partner_contract_start_date
            );
          } else {
            partnerValid = partnerValid && !!(
              formData.partner_income_source &&
              formData.partner_activity
            );
          }
          
          // Partner health validation
          if (formData.partner_is_good_health === false) {
            partnerValid = partnerValid && !!(
              formData.partner_health_explanation &&
              formData.partner_height_cm &&
              formData.partner_weight_kg
            );
          }
        }
        
        return clientValid && clientEmploymentValid && clientHealthValid && childrenValid && partnerValid;
      
      case 3: // Housing
        // Current housing is required
        if (!formData.current_housing) return false;
        
        // Location/Address based on type
        if ((formData.current_housing === 'rented' || formData.current_housing === 'with_parents') && !formData.current_housing_location) return false;
        if (formData.current_housing === 'owned' && !formData.current_housing_address) return false;
        
        // Basic fields
        if (!formData.current_housing_rooms || !formData.current_housing_area) return false;
        
        // Owned housing fields
        if (formData.current_housing === 'owned') {
          if (!formData.current_housing_value || !formData.current_housing_movable_value) return false;
          
          // Mortgage fields if has mortgage
          if (formData.current_housing_has_mortgage) {
            if (!formData.current_mortgage_remaining || !formData.current_mortgage_interest_rate || 
                !formData.current_mortgage_bank || !formData.current_mortgage_remaining_years || 
                !formData.current_mortgage_monthly_payment) return false;
          }
        }
        
        // Planning change validation
        if (formData.planning_housing_change ?? true) {
          if (!formData.planned_housing_type) return false;
          
          if (formData.planned_housing_type === 'apartment' || formData.planned_housing_type === 'house') {
            if (!formData.planned_housing_rooms || !formData.planned_housing_area || 
                !formData.planned_housing_value || !formData.planned_housing_timeline_years || 
                !formData.planned_housing_extra_costs) return false;
          } else if (formData.planned_housing_type === 'reconstruction') {
            if (!formData.planned_housing_timeline_years || !formData.planned_housing_extra_costs) return false;
          }
          
          // Financing method
          if (!formData.financing_method) return false;
          if (formData.financing_method === 'cash' && !formData.available_cash) return false;
          if (formData.financing_method === 'cash_and_loan' && (!formData.available_cash || !formData.loan_term_years)) return false;
        }
        
        return true;
      
      case 4: // Reserve
        // Client monthly net income required
        if (formData.client_monthly_net_income === undefined || formData.client_monthly_net_income === '') return false;

        // Partner monthly net income required if partner included
        if (formData.include_partner && (formData.partner_monthly_net_income === undefined || formData.partner_monthly_net_income === '')) return false;

        // Savings method required
        if (!formData.savings_method) return false;

        // If savings method requires amount
        if ((formData.savings_method === 'leftover' || formData.savings_method === 'fixed') && 
            (formData.monthly_savings_amount === undefined || formData.monthly_savings_amount === '')) return false;

        // Required savings fields - client
        if (formData.client_checking_account === undefined || formData.client_checking_account === '') return false;
        if (formData.client_cash === undefined || formData.client_cash === '') return false;

        // Required savings fields - partner (if included)
        if (formData.include_partner) {
          if (formData.partner_checking_account === undefined || formData.partner_checking_account === '') return false;
          if (formData.partner_cash === undefined || formData.partner_cash === '') return false;
        }

        // Desired reserve amount required
        if (formData.desired_reserve_amount === undefined || formData.desired_reserve_amount === '') return false;

        // Risk profile percentages required (allow 0)
        if (formData.conservative_percent === undefined || formData.conservative_percent === '') return false;
        if (formData.moderate_percent === undefined || formData.moderate_percent === '') return false;
        if (formData.dynamic_percent === undefined || formData.dynamic_percent === '') return false;
        if (formData.aggressive_percent === undefined || formData.aggressive_percent === '') return false;

        // Check percentages sum to 100
        const cons = parseInt(formData.conservative_percent) || 0;
        const mod = parseInt(formData.moderate_percent) || 0;
        const dyn = parseInt(formData.dynamic_percent) || 0;
        const agg = parseInt(formData.aggressive_percent) || 0;
        if (cons + mod + dyn + agg !== 100) return false;

        // Investment questions required
        if (!formData.investment_horizon) return false;
        if (!formData.investment_experience) return false;
        if (!formData.reaction_to_10_percent_drop) return false;
        if (!formData.reaction_to_20_percent_gain) return false;

        return true;
      
      case 5: // Pension
        // Client required fields
        if (formData.client_gross_income_pension === undefined || formData.client_gross_income_pension === '') return false;
        if (!formData.client_retirement_age) return false;
        if (formData.client_desired_pension === undefined || formData.client_desired_pension === '') return false;
        
        // II. Pillar fund required if enabled
        if (formData.client_pillar_2 ?? true) {
          if (!formData.client_pension_fund) return false;
        }
        
        // III. Pillar fields if enabled
        if (formData.client_pillar_3) {
          if (!formData.client_voluntary_pension_fund) return false;
          if (formData.client_voluntary_pension_monthly === undefined || formData.client_voluntary_pension_monthly === '') return false;
          if (formData.client_voluntary_pension_total === undefined || formData.client_voluntary_pension_total === '') return false;
        }
        
        // Partner required fields (if included)
        if (formData.include_partner) {
          if (formData.partner_gross_income_pension === undefined || formData.partner_gross_income_pension === '') return false;
          if (!formData.partner_retirement_age) return false;
          if (formData.partner_desired_pension === undefined || formData.partner_desired_pension === '') return false;
          
          // Partner II. Pillar fund required if enabled
          if (formData.partner_pillar_2 ?? true) {
            if (!formData.partner_pension_fund) return false;
          }
          
          // Partner III. Pillar fields if enabled
          if (formData.partner_pillar_3) {
            if (!formData.partner_voluntary_pension_fund) return false;
            if (formData.partner_voluntary_pension_monthly === undefined || formData.partner_voluntary_pension_monthly === '') return false;
            if (formData.partner_voluntary_pension_total === undefined || formData.partner_voluntary_pension_total === '') return false;
          }
        }
        
        return true;
      
      case 6: // Children & Goals
        // If children section is not skipped, education is required (allow 0)
        if (!formData.skip_children_section) {
          if (formData.children_education_costs === undefined || formData.children_education_costs === '') return false;
        }
        // Other goals section has no required fields (can be skipped)
        return true;
      
      case 7: // Protection
        // Income source is required
        if (!formData.income_source) return false;

        // Property 1 validation - if has property, all fields are required
        if (formData.has_property_1) {
          if (!formData.property_1_address || 
              formData.property_1_rooms === undefined || formData.property_1_rooms === '' ||
              formData.property_1_area === undefined || formData.property_1_area === '' ||
              formData.property_1_value === undefined || formData.property_1_value === '' ||
              formData.property_1_movable_value === undefined || formData.property_1_movable_value === '') return false;

          // If property has insurance, insurer and expiry are required
          if (formData.property_1_has_insurance) {
            if (!formData.property_1_insurer || !formData.property_1_insurance_expiry) return false;
          }
        }

        // Car 1 validation - if has car, all fields are required
        if (formData.has_car_1) {
          if (!formData.car_1_brand || !formData.car_1_model ||
              formData.car_1_year === undefined || formData.car_1_year === '' ||
              formData.car_1_value === undefined || formData.car_1_value === '' ||
              !formData.car_1_go_insurer) return false;

          // If car has casco, insurer and expiry are required
          if (formData.car_1_has_casco) {
            if (!formData.car_1_casco_insurer || !formData.car_1_casco_expiry) return false;
          }
        }

        // If client has income protection, insurer and date are required
        if (formData.client_has_income_protection) {
          if (!formData.client_income_protection_insurer || !formData.client_income_protection_date) return false;
        }

        // If partner included and has income protection, insurer and date are required
        if (formData.include_partner && formData.partner_has_income_protection) {
          if (!formData.partner_income_protection_insurer || !formData.partner_income_protection_date) return false;
        }

        return true;
      
      case 8: // Financial Flow - all fields required
        // Client income fields
        if (formData.client_gross_income === undefined || formData.client_gross_income === '') return false;
        if (formData.client_net_income === undefined || formData.client_net_income === '') return false;
        if (formData.client_annual_bonus === undefined || formData.client_annual_bonus === '') return false;
        if (formData.client_other_monthly_income === undefined || formData.client_other_monthly_income === '') return false;
        
        // Partner income fields (if included)
        if (formData.include_partner) {
          if (formData.partner_gross_income === undefined || formData.partner_gross_income === '') return false;
          if (formData.partner_net_income === undefined || formData.partner_net_income === '') return false;
          if (formData.partner_annual_bonus === undefined || formData.partner_annual_bonus === '') return false;
          if (formData.partner_other_monthly_income === undefined || formData.partner_other_monthly_income === '') return false;
        }
        
        // Housing expenses
        const housingFields = ['expense_rent', 'expense_utilities', 'expense_phone', 'expense_internet', 'expense_tv', 'expense_other_housing'];
        for (const field of housingFields) {
          if (formData[field] === undefined || formData[field] === '') return false;
        }
        
        // Car expenses
        const carFields = ['expense_fuel', 'expense_car_maintenance', 'expense_car_other'];
        for (const field of carFields) {
          if (formData[field] === undefined || formData[field] === '') return false;
        }
        
        // Variable expenses
        const variableFields = ['expense_food', 'expense_clothing', 'expense_culture', 'expense_travel', 'expense_children', 
          'expense_cigarettes', 'expense_pets', 'expense_vacation', 'expense_business', 'expense_other',
          'expense_education', 'expense_health', 'expense_cosmetics', 'expense_hobbies', 'expense_electronics', 'expense_taxes'];
        for (const field of variableFields) {
          if (formData[field] === undefined || formData[field] === '') return false;
        }
        
        // Assets
        const assetFields = ['asset_checking_account', 'asset_short_term_savings', 'asset_medium_term_savings', 'asset_long_term_savings', 'asset_real_estate', 'asset_movable_property'];
        for (const field of assetFields) {
          if (formData[field] === undefined || formData[field] === '') return false;
        }
        
        // Liabilities
        const liabilityFields = ['liability_mortgage_monthly', 'liability_mortgage_remaining', 
          'liability_consumer_loans_monthly', 'liability_consumer_loans_remaining',
          'liability_credit_cards_monthly', 'liability_credit_cards_remaining',
          'liability_leasing_monthly', 'liability_leasing_remaining',
          'liability_overdraft_monthly', 'liability_overdraft_remaining'];
        for (const field of liabilityFields) {
          if (formData[field] === undefined || formData[field] === '') return false;
        }
        
        // Insurance
        const insuranceFields = ['insurance_life', 'insurance_property', 'insurance_movable', 'insurance_civil', 'insurance_casco', 'insurance_other'];
        for (const field of insuranceFields) {
          if (formData[field] === undefined || formData[field] === '') return false;
        }
        
        return true;
      
      case 9: // Priorities - all priority fields required based on active priorities
        // Check which priorities should be active
        const activePriorityKeys = [];

        // Always include these
        activePriorityKeys.push('priority_income_protection');
        activePriorityKeys.push('priority_reserve');
        activePriorityKeys.push('priority_pension');

        // Conditional priorities
        if (!formData.skip_other_goals_section) {
          activePriorityKeys.push('priority_other');
        }
        if (!formData.skip_children_section) {
          activePriorityKeys.push('priority_children');
        }
        // Housing: only if planning change OR has mortgage
        if (formData.planning_housing_change !== false || formData.current_housing_has_mortgage) {
          activePriorityKeys.push('priority_housing');
        }
        // Property protection: only if has property or car
        if (formData.has_property_1 || formData.has_property_2 || formData.has_property_3 || 
            formData.has_car_1 || formData.has_car_2 || formData.has_car_3) {
          activePriorityKeys.push('priority_property_protection');
        }

        // Check all active priorities are filled
        for (const key of activePriorityKeys) {
          if (formData[key] === undefined || formData[key] === null || formData[key] === '') {
            return false;
          }
        }
        return true;
      
      default:
        return true;
    }
  };

  // Check if a step has been started (at least one required field filled)
  const isStepStarted = (step) => {
    switch (step) {
      case 1:
        return formData.gdpr_consent_a || formData.gdpr_consent_c;
      case 2:
        return !!(formData.client_first_name || formData.client_middle_name || formData.client_last_name);
      case 3:
        return !!formData.current_housing;
      case 4:
        return formData.client_monthly_net_income !== undefined && formData.client_monthly_net_income !== '';
      case 5:
        return formData.client_gross_income_pension !== undefined && formData.client_gross_income_pension !== '';
      case 6:
        return formData.children_education_costs !== undefined || formData.children_birth_costs !== undefined || formData.other_goals_car !== undefined;
      case 7:
        return formData.properties?.length > 0 || formData.vehicles?.length > 0;
      case 8:
        return formData.client_gross_income !== undefined;
      case 9:
        return formData.priority_income_protection !== undefined;
      default:
        return false;
    }
  };

  // Get step status: 'complete', 'started', 'future'
  const getStepStatus = (stepId) => {
    if (validateStep(stepId)) return 'complete';
    if (stepId > currentStep && !isStepStarted(stepId)) return 'future';
    return 'started';
  };

  // Check which steps are incomplete
  const getIncompleteSteps = () => {
    const incomplete = [];
    for (let i = 1; i <= 9; i++) {
      if (!validateStep(i)) {
        incomplete.push(i);
      }
    }
    return incomplete;
  };

  const incompleteSteps = getIncompleteSteps();
  const canSubmit = incompleteSteps.length === 0;

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 9) {
      // Check for savings discrepancy when leaving step 8 (Financial Flow)
      if (currentStep === 8 && checkSavingsDiscrepancy() && !isSavingsDiscrepancyReasonValid()) {
        setShowSavingsDiscrepancyModal(true);
        return;
      }
      setShowValidationErrors(false);
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (!validateStep(currentStep)) {
      scrollToFirstInvalidField();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setShowValidationErrors(false);
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
                  onClick={() => {
                    setShowValidationErrors(false);
                    setCurrentStep(step.id);
                  }}
                  className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                      currentStep === step.id 
                        ? "bg-blue-600 text-white" 
                        : getStepStatus(step.id) === 'complete'
                          ? "bg-green-500 text-white"
                          : getStepStatus(step.id) === 'future'
                            ? "bg-blue-400 text-white"
                            : "bg-amber-400 text-white"
                    )}
                  >
                    {currentStep === step.id ? (
                      <step.icon className="h-4 w-4" />
                    ) : getStepStatus(step.id) === 'complete' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : getStepStatus(step.id) === 'future' ? (
                      <step.icon className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs mt-1 font-medium whitespace-nowrap",
                    currentStep === step.id 
                      ? "text-blue-600" 
                      : getStepStatus(step.id) === 'complete' 
                        ? "text-green-600" 
                        : getStepStatus(step.id) === 'future'
                          ? "text-blue-400"
                          : "text-amber-500"
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
              {currentStep === 1 && <ConsentStep data={formData} onChange={handleChange} showErrors={showValidationErrors} />}
              {currentStep === 2 && <PersonalDataStep data={formData} onChange={handleChange} showErrors={showValidationErrors} />}
              {currentStep === 3 && <HousingStep data={formData} onChange={handleChange} showErrors={showValidationErrors} />}
              {currentStep === 4 && <ReserveStep data={formData} onChange={handleChange} showErrors={showValidationErrors} />}
              {currentStep === 5 && <PensionStep data={formData} onChange={handleChange} showErrors={showValidationErrors} />}
              {currentStep === 6 && <ChildrenGoalsStep data={formData} onChange={handleChange} showErrors={showValidationErrors} />}
              {currentStep === 7 && <ProtectionStep data={formData} onChange={handleChange} showErrors={showValidationErrors} />}
              {currentStep === 8 && <FinancialFlowStep data={formData} onChange={handleChange} showErrors={showValidationErrors} />}
              {currentStep === 9 && <PrioritiesStep data={formData} onChange={handleChange} showErrors={showValidationErrors} />}
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
                className="bg-blue-600 hover:bg-blue-700 rounded-full px-6"
              >
                Напред
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !canSubmit}
                className="bg-green-600 hover:bg-green-700 rounded-full px-8 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Изпращане...
                  </>
                ) : !canSubmit ? (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Попълнете всички полета
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

      {/* Savings Discrepancy Modal */}
      <Dialog open={showSavingsDiscrepancyModal} onOpenChange={setShowSavingsDiscrepancyModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-amber-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Несъответствие в спестяванията
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-slate-700">
              Спрямо срока на Вашия договор би следвало да сте събрали по-високо ниво на спестявания. 
              Каква е причината за несъответствието?
            </p>
            <p className="text-sm text-slate-500 italic">
              (Изберете поне една причина)
            </p>
            
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <Checkbox
                  checked={formData.savings_discrepancy_reason_1 || false}
                  onCheckedChange={(checked) => handleChange('savings_discrepancy_reason_1', checked)}
                  className="mt-0.5"
                />
                <span className="text-sm text-slate-700">
                  Разчетът на разходите не е акуратен. Не успявам да спестявам толкова на месечна база. 
                  <span className="text-amber-600 block text-xs mt-1">
                    (Моля преди отбелязване, променете разходите, за да отразяват реалното състояние)
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <Checkbox
                  checked={formData.savings_discrepancy_reason_2 || false}
                  onCheckedChange={(checked) => handleChange('savings_discrepancy_reason_2', checked)}
                  className="mt-0.5"
                />
                <span className="text-sm text-slate-700">
                  Имал съм по-големи еднократни покупки в последните няколко години.
                </span>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <Checkbox
                  checked={formData.savings_discrepancy_reason_3 || false}
                  onCheckedChange={(checked) => handleChange('savings_discrepancy_reason_3', checked)}
                  className="mt-0.5"
                />
                <span className="text-sm text-slate-700">
                  Имах увеличение в дохода си и отскоро мога да спестявам подобна сума.
                </span>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <Checkbox
                  checked={formData.savings_discrepancy_reason_4 || false}
                  onCheckedChange={(checked) => handleChange('savings_discrepancy_reason_4', checked)}
                  className="mt-0.5"
                />
                <span className="text-sm text-slate-700">
                  Друго. Моля опишете:
                </span>
              </label>

              {formData.savings_discrepancy_reason_4 && (
                <div className="ml-8">
                  <Textarea
                    placeholder="Опишете причината..."
                    value={formData.savings_discrepancy_reason_other || ''}
                    onChange={(e) => handleChange('savings_discrepancy_reason_other', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowSavingsDiscrepancyModal(false)}
              >
                Назад към редакция
              </Button>
              <Button
                onClick={() => {
                  if (isSavingsDiscrepancyReasonValid()) {
                    setShowSavingsDiscrepancyModal(false);
                    setShowValidationErrors(false);
                    setCurrentStep(prev => prev + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                disabled={!isSavingsDiscrepancyReasonValid()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Продължи напред
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}