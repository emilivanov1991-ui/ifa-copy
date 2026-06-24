import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle, TrendingUp, Shield, PiggyBank, Sparkles } from 'lucide-react';

const STEPS_MESSAGES = {
  bg: [
    { icon: Shield,      text: 'Анализираме нуждата от защита...', duration: 2800 },
    { icon: PiggyBank,   text: 'Изчисляваме пенсионния дефицит...', duration: 2400 },
    { icon: TrendingUp,  text: 'Определяме инвестиционен бюджет...', duration: 2200 },
    { icon: Sparkles,    text: 'Подбираме оптимални продукти...', duration: 2600 },
    { icon: CheckCircle, text: 'Финализираме Вашия план...', duration: 2000 },
  ],
  en: [
    { icon: Shield,      text: 'Analysing protection needs...', duration: 2800 },
    { icon: PiggyBank,   text: 'Calculating pension deficit...', duration: 2400 },
    { icon: TrendingUp,  text: 'Determining investment budget...', duration: 2200 },
    { icon: Sparkles,    text: 'Selecting optimal products...', duration: 2600 },
    { icon: CheckCircle, text: 'Finalising your plan...', duration: 2000 },
  ],
};

/**
 * PlanLoadingScreen
 * Shows animated loading while generateFinancialPlan runs.
 * Auto-triggers plan generation if journey is in 'plan_generating' state.
 *
 * Props:
 *  - journeyId
 *  - analysisId
 *  - onPlanReady(planId) — called when plan is ready
 *  - onBlocked() — called if auto_sell blocked
 *  - onError(msg) — called on hard error
 */
export default function PlanLoadingScreen({ journeyId, analysisId, languageCode = 'bg', onPlanReady, onBlocked, onError }) {
  const msgs = STEPS_MESSAGES[languageCode] || STEPS_MESSAGES.bg;
  const [messageIdx, setMessageIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const triggered = useRef(false);

  // Cycle through loading messages
  useEffect(() => {
    if (done || error) return;
    const total = msgs.reduce((s, m) => s + m.duration, 0);
    let elapsed = 0;
    const timers = msgs.map((m, idx) => {
      const t = setTimeout(() => setMessageIdx(idx), elapsed);
      elapsed += m.duration;
      return t;
    });
    return () => timers.forEach(clearTimeout);
  }, [done, error, msgs]);

  // Trigger plan generation once
  useEffect(() => {
    if (triggered.current || !analysisId) return;
    triggered.current = true;

    const run = async () => {
      try {
        const res = await base44.functions.invoke('generateFinancialPlan', {
          analysis_id: analysisId,
          journey_id: journeyId || undefined,
        });

        const data = res?.data;
        if (!data?.plan_id) throw new Error(data?.error || 'Планът не беше генериран.');

        // Generate plan explanation for AI presentation agent (non-blocking)
        base44.functions.invoke('generatePlanExplanation', {
          plan_id: data.plan_id,
          language_code: languageCode,
        }).catch(e => console.warn('generatePlanExplanation failed (non-critical):', e.message));

        // Generate PRESENTATION_RENDER_MODEL — decouples agent from raw FinancialPlan schema (non-blocking)
        base44.functions.invoke('generatePresentationModel', {
          plan_id: data.plan_id,
          language_code: languageCode,
        }).catch(e => console.warn('generatePresentationModel failed (non-critical):', e.message));

        // Small delay so last message shows
        setTimeout(() => {
          setDone(true);
          if (data.summary?.auto_sell_eligible === false) {
            onBlocked?.();
          } else {
            onPlanReady?.(data.plan_id);
          }
        }, 1200);

      } catch (err) {
        setError(err.message || 'Грешка при генериране на плана.');
        onError?.(err.message);
      }
    };

    run();
  }, [analysisId, journeyId]);

  const currentMsg = msgs[messageIdx];
  const Icon = currentMsg?.icon || Loader2;
  const doneText = languageCode === 'en' ? 'Plan ready!' : 'Планът е готов!';
  const generatingText = languageCode === 'en' ? 'Generating your plan' : 'Генерираме Вашия план';
  const waitText = languageCode === 'en' ? 'Please wait — analysing your financial situation' : 'Моля изчакайте — анализираме Вашата финансова ситуация';
  const redirectText = languageCode === 'en' ? 'You will be redirected automatically...' : 'Ще бъдете пренасочени автоматично...';

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Грешка</h3>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 flex items-center justify-center p-6">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center max-w-sm w-full">
        {/* Logo */}
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/258cedab0_output-onlinepngtools.png"
          alt="IFA"
          className="h-12 w-auto mx-auto mb-10 brightness-0 invert opacity-80"
        />

        {/* Animated icon ring */}
        <div className="relative w-28 h-28 mx-auto mb-8">
          {/* Outer pulse */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-blue-400"
          />
          {/* Inner circle */}
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
            <AnimatePresence mode="wait">
              {done ? (
                <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key={messageIdx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon className="w-10 h-10 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-white text-2xl font-bold mb-2">
          {done ? doneText : generatingText}
        </h2>
        <p className="text-blue-200 text-sm mb-8">
          {done ? redirectText : waitText}
        </p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {msgs.map((_, idx) => (
            <motion.div
              key={idx}
              animate={{
                width: idx === messageIdx ? 24 : 8,
                backgroundColor: idx < messageIdx || done ? '#4ade80' : idx === messageIdx ? '#60a5fa' : '#1e3a5f',
              }}
              transition={{ duration: 0.3 }}
              className="h-2 rounded-full"
            />
          ))}
        </div>

        {/* Current step message */}
        <AnimatePresence mode="wait">
          {!done && (
            <motion.p
              key={messageIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-blue-300 text-sm"
            >
              {currentMsg?.text}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}