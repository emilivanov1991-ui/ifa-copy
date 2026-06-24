import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// Cached feedback to avoid re-fetching same context
const feedbackCache = new Map();

// Metric definitions: which fields to watch and what context to send
const BAND_METRICS = [
  {
    metricId: 'reserve_adequacy',
    watchFields: ['client_monthly_net_income', 'partner_monthly_net_income', 'desired_reserve_amount', 'desired_reserve_months'],
    buildContext: (data) => {
      const income = (data.client_monthly_net_income || 0) + (data.partner_monthly_net_income || 0);
      const reserve = data.desired_reserve_amount || 0;
      return income > 0
        ? { reserve_months: income > 0 ? reserve / income : 0, total_income: income }
        : null;
    },
    stepId: 'analysis_step_4',
    event: 'response_band',
  },
  {
    metricId: 'debt_ratio',
    watchFields: ['client_monthly_net_income', 'partner_monthly_net_income', 'liability_mortgage_monthly', 'liability_consumer_loans_monthly', 'liability_credit_cards_monthly'],
    buildContext: (data) => {
      const income = (data.client_monthly_net_income || 0) + (data.partner_monthly_net_income || 0);
      const debt = (data.liability_mortgage_monthly || 0) + (data.liability_consumer_loans_monthly || 0) + (data.liability_credit_cards_monthly || 0);
      return income > 0 ? { debt_to_income: debt / income, total_income: income } : null;
    },
    stepId: 'analysis_step_8',
    event: 'response_band',
  },
  {
    metricId: 'pension_gap',
    watchFields: ['client_desired_pension', 'client_expected_state_pension', 'client_gross_income_pension'],
    buildContext: (data) => {
      const desired = data.client_desired_pension || 0;
      const state = data.client_expected_state_pension || 0;
      return desired > 0 ? { pension_gap_ratio: state > 0 ? (desired - state) / desired : 1 } : null;
    },
    stepId: 'analysis_step_5',
    event: 'response_band',
  },
];

// Map band_severity / matched_band_id to UI variant
function getBandVariant(result) {
  const id = (result.matched_band_id || '').toLowerCase();
  if (result.band_severity === 'critical' || id.includes('critical') || id.includes('danger')) return 'danger';
  if (result.band_severity === 'warning' || id.includes('warning') || id.includes('low') || id.includes('below')) return 'warning';
  if (id.includes('good') || id.includes('six_plus') || id.includes('adequate')) return 'success';
  return 'info';
}

const VARIANT_STYLES = {
  danger:  { bg: 'bg-red-50 border-red-200',    icon: TrendingDown, iconColor: 'text-red-500',   text: 'text-red-800' },
  warning: { bg: 'bg-amber-50 border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-500', text: 'text-amber-800' },
  success: { bg: 'bg-green-50 border-green-200', icon: TrendingUp,    iconColor: 'text-green-500', text: 'text-green-800' },
  info:    { bg: 'bg-blue-50 border-blue-100',   icon: Info,          iconColor: 'text-blue-500',  text: 'text-blue-800' },
};

/**
 * ResponseBandFeedback
 * Watches specific formData fields and shows personalized response band feedback
 * when relevant fields change.
 *
 * Props:
 *  - formData: current form state
 *  - currentStepId: number (1-9), used to pick relevant metrics for this step
 *  - languageCode: 'bg' | 'en'
 */
export default function ResponseBandFeedback({ formData, currentStepId, languageCode = 'bg' }) {
  const [feedbacks, setFeedbacks] = useState([]);

  const fetchBandFeedback = useCallback(async (metric) => {
    const ctx = metric.buildContext(formData);
    if (!ctx) return;

    const cacheKey = `${metric.metricId}:${JSON.stringify(ctx)}`;
    if (feedbackCache.has(cacheKey)) {
      const cached = feedbackCache.get(cacheKey);
      setFeedbacks(prev => {
        const without = prev.filter(f => f.metricId !== metric.metricId);
        return cached ? [...without, { ...cached, metricId: metric.metricId }] : without;
      });
      return;
    }

    try {
      const res = await base44.functions.invoke('evaluateInteractionLogic', {
        flowType: 'analysis',
        currentStepId: String(currentStepId),
        event: metric.event,
        contextData: { ...ctx, languageCode },
      });
      const result = res?.data;
      if (result?.text) {
        feedbackCache.set(cacheKey, result);
        setFeedbacks(prev => {
          const without = prev.filter(f => f.metricId !== metric.metricId);
          return [...without, { ...result, metricId: metric.metricId }];
        });
      }
    } catch {
      // silent — feedback is non-blocking
    }
  }, [formData, currentStepId, languageCode]);

  // Debounced effect: re-evaluate when relevant fields change
  useEffect(() => {
    const relevantMetrics = BAND_METRICS.filter(m => {
      // Only evaluate metrics that belong to this step or adjacent steps
      const metricStep = parseInt(m.stepId.replace('analysis_step_', ''));
      return Math.abs(metricStep - currentStepId) <= 1;
    });

    if (relevantMetrics.length === 0) return;

    const timer = setTimeout(() => {
      relevantMetrics.forEach(metric => {
        const hasData = metric.watchFields.some(f => formData[f] !== undefined && formData[f] !== null && formData[f] !== '');
        if (hasData) fetchBandFeedback(metric);
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [
    formData.client_monthly_net_income, formData.partner_monthly_net_income,
    formData.desired_reserve_amount, formData.desired_reserve_months,
    formData.liability_mortgage_monthly, formData.liability_consumer_loans_monthly,
    formData.client_desired_pension, formData.client_expected_state_pension,
    currentStepId,
  ]);

  if (feedbacks.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      <AnimatePresence mode="popLayout">
        {feedbacks.map(fb => {
          const variant = getBandVariant(fb);
          const { bg, icon: Icon, iconColor, text } = VARIANT_STYLES[variant];
          return (
            <motion.div
              key={fb.metricId}
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={cn('flex items-start gap-3 p-3 rounded-xl border text-sm', bg)}
            >
              <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', iconColor)} />
              <p className={cn('leading-snug', text)}>{fb.text}</p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}