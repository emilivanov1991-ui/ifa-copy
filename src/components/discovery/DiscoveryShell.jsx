import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, Loader2,
  Mic, MicOff, Volume2, VolumeX, RefreshCw, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AvatarFrame from '@/components/voice/AvatarFrame';
import { useJourneyState } from '@/components/voice/JourneyStateManager';
import { useContradictionCheck } from '@/components/discovery/useContradictionCheck';
import { useVoiceManager } from '@/components/voice/VoiceManager';

// ─── Journey state helpers ───────────────────────────────────────────────────
const DISCOVERY_STATES_ORDER = [
  'discovery_not_started',
  'discovery_intro_in_progress',
  'discovery_collecting',
  'discovery_resumed_pending_reverification',
  'discovery_ready_for_review',
];

function isDiscoveryActive(state) {
  return DISCOVERY_STATES_ORDER.includes(state) || state === 'discovery_blocked';
}

// ─── Step definitions (mirrors FinancialAnalysis but with voice metadata) ────
const DISCOVERY_STEPS = [
  { id: 1,  section_id: 'consent',     title: 'Съгласие',          icon: ShieldCheck },
  { id: 3,  section_id: 'housing',     title: 'Жилище',             icon: null },
  { id: 4,  section_id: 'reserve',     title: 'Резерв',             icon: null },
  { id: 5,  section_id: 'pension',     title: 'Пенсия',             icon: null },
  { id: 6,  section_id: 'children',    title: 'Деца и цели',        icon: null },
  { id: 7,  section_id: 'protection',  title: 'Защита',             icon: null },
  { id: 8,  section_id: 'cashflow',    title: 'Финансов поток',     icon: null },
  { id: 9,  section_id: 'priorities',  title: 'Приоритети',         icon: null },
];

// ─── Reverification screen ────────────────────────────────────────────────────
function ReverificationScreen({ journey, sections, onConfirm, onDeny }) {
  const [flags, setFlags] = useState({});

  const pendingSections = sections.filter(s => {
    const rev = journey.reverification_flags || {};
    return rev[s.section_id] === false || rev[s.section_id] === undefined;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto text-center py-10 px-6"
    >
      <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
        <RefreshCw className="h-8 w-8 text-amber-600" />
      </div>
      <h2 className="text-2xl font-semibold text-slate-900 mb-3">Добре дошли обратно!</h2>
      <p className="text-slate-600 mb-8">
        Продължавате прекъснат анализ. Преди да продължим, моля потвърдете дали данните от тези секции са все още актуални:
      </p>

      <div className="space-y-3 text-left mb-8">
        {pendingSections.map(sec => (
          <div key={sec.section_id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
            <span className="font-medium text-slate-800">{sec.title}</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={flags[sec.section_id] === true ? 'default' : 'outline'}
                className={cn('rounded-full px-4', flags[sec.section_id] === true && 'bg-green-600 hover:bg-green-700')}
                onClick={() => setFlags(f => ({ ...f, [sec.section_id]: true }))}
              >
                Да, актуално
              </Button>
              <Button
                size="sm"
                variant={flags[sec.section_id] === false ? 'destructive' : 'outline'}
                className="rounded-full px-4"
                onClick={() => setFlags(f => ({ ...f, [sec.section_id]: false }))}
              >
                Не
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        <Button
          variant="outline"
          className="rounded-full px-6"
          onClick={() => onDeny(flags)}
        >
          Нещо се е променило
        </Button>
        <Button
          className="bg-blue-600 hover:bg-blue-700 rounded-full px-6"
          disabled={pendingSections.some(s => flags[s.section_id] === undefined)}
          onClick={() => onConfirm(flags)}
        >
          Продължи <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Step progress bar ────────────────────────────────────────────────────────
function StepProgress({ steps, currentStepId, completedStepIds }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {steps.map((step, idx) => {
        const isActive = step.id === currentStepId;
        const isDone = completedStepIds.includes(step.id);
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center min-w-[52px]">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
                isActive && 'bg-blue-600 text-white ring-2 ring-blue-300',
                isDone && !isActive && 'bg-green-500 text-white',
                !isActive && !isDone && 'bg-slate-200 text-slate-500',
              )}>
                {isDone && !isActive ? <CheckCircle className="h-4 w-4" /> : idx + 1}
              </div>
              <span className={cn(
                'text-[10px] mt-0.5 text-center leading-tight',
                isActive ? 'text-blue-600 font-medium' : isDone ? 'text-green-600' : 'text-slate-400',
              )}>
                {step.title}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 min-w-[8px] rounded-full mt-[-10px]',
                isDone ? 'bg-green-400' : 'bg-slate-200',
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Voice bar ────────────────────────────────────────────────────────────────
function VoiceBar({ avatarState, caption, isMuted, onToggleMute, isLoading }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
      <AvatarFrame
        state={avatarState}
        size="sm"
        caption={null}
        showControls={false}
      />
      <div className="flex-1 min-w-0">
        {isLoading ? (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Генерирам глас...</span>
          </div>
        ) : (
          <p className="text-sm text-slate-700 leading-snug line-clamp-2">{caption || '…'}</p>
        )}
      </div>
      <button
        onClick={onToggleMute}
        className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 hover:bg-slate-100 transition-colors"
      >
        {isMuted ? <VolumeX className="h-4 w-4 text-slate-500" /> : <Volume2 className="h-4 w-4 text-blue-600" />}
      </button>
    </div>
  );
}

// ─── Main DiscoveryShell ──────────────────────────────────────────────────────
export default function DiscoveryShell({
  // NOTE: all journey_state changes go through the backend journeyStateMachine.
  // Never call base44.entities.Journey.update({ journey_state: ... }) directly.
  journey,
  onJourneyUpdate,
  formData,
  onFormChange,
  plannerData,
  stepComponents,      // { [stepId]: ReactComponent } — injected from parent
  validateStep,        // (stepId, formData) => boolean
  canSubmit,
  onSubmit,
  isSubmitting,
  incompleteSteps = [],
  languageCode = 'bg',
}) {
  const [currentStep, setCurrentStep] = useState(() => {
    if (journey?.last_section_id) {
      const found = DISCOVERY_STEPS.find(s => s.section_id === journey.last_section_id);
      return found?.id ?? 1;
    }
    return 1;
  });

  const [completedSteps, setCompletedSteps] = useState([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showReverification, setShowReverification] = useState(false);
  const { advanceState } = useJourneyState();
  const { contradictions, checkContradictions, clearContradictions } = useContradictionCheck();

  // ── Voice engine — local-first from VoiceRulebook, TTS fallback via evaluateInteractionLogic ──
  const { playStep, preloadStep, stop: stopVoice, avatarState, isPlaying, currentText } = useVoiceManager(languageCode);

  // ── On mount: advance from discovery_not_started → intro, fire voice ─────
  useEffect(() => {
    if (!journey?.id) return;

    if (journey.journey_state === 'discovery_not_started') {
      advanceState(journey.id, 'discovery_intro_in_progress')
        .then(updated => {
          onJourneyUpdate?.(updated);
          fireVoice(currentStep, 'step_enter');
        })
        .catch(() => fireVoice(currentStep, 'step_enter'));
    } else if (journey.journey_state === 'discovery_resumed_pending_reverification') {
      setShowReverification(true);
    } else {
      // Already in progress — fire voice for current step
      fireVoice(currentStep, 'step_enter');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey?.id]);

  // ── Mark step done when valid ──────────────────────────────────────────────
  useEffect(() => {
    if (validateStep && validateStep(currentStep, formData)) {
      setCompletedSteps(prev => prev.includes(currentStep) ? prev : [...prev, currentStep]);
    }
  }, [formData, currentStep]);

  // ── Fire voice on step enter — uses VoiceRulebook (pre-recorded/TTS) ──────
  const fireVoice = useCallback((stepId) => {
    if (isMuted) return;
    const step = DISCOVERY_STEPS.find(s => s.id === stepId);
    if (!step) return;
    // VoiceManager maps step_id → audio_url from VoiceRulebook entity
    // Convention: analysis_step_<numeric_id> (e.g. analysis_step_3 for housing)
    const voiceStepId = `analysis_step_${step.id}`;
    playStep(voiceStepId);

    // Preload the next step's audio in background
    const nextIdx = DISCOVERY_STEPS.findIndex(s => s.id === stepId) + 1;
    if (nextIdx < DISCOVERY_STEPS.length) {
      const nextStep = DISCOVERY_STEPS[nextIdx];
      preloadStep(`analysis_step_${nextStep.id}`);
    }
  }, [isMuted, playStep, preloadStep]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const currentIndex = DISCOVERY_STEPS.findIndex(s => s.id === currentStep);

  const goToStep = useCallback(async (stepId) => {
    setShowValidationErrors(false);
    clearContradictions();
    const step = DISCOVERY_STEPS.find(s => s.id === stepId);
    setCurrentStep(stepId);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update journey last_section_id + ensure state is discovery_collecting
    if (journey?.id) {
      try {
        const targetState = 'discovery_collecting';
        const needsTransition = journey.journey_state !== targetState;
        let updated;
        if (needsTransition) {
          // Route through backend state machine for the state change
          updated = await advanceState(journey.id, targetState, {
            last_section_id: step?.section_id,
          });
        } else {
          // State is already correct — just update last_section_id (non-state field)
          updated = await base44.entities.Journey.update(journey.id, {
            last_section_id: step?.section_id,
            last_activity_at: new Date().toISOString(),
          });
        }
        onJourneyUpdate?.(updated);
      } catch { /* non-critical — voice/progress is enhancement, not blocker */ }
    }

    fireVoice(stepId, 'step_enter');
  }, [journey, onJourneyUpdate, fireVoice]);

  const nextStep = useCallback(() => {
    if (validateStep && !validateStep(currentStep, formData)) {
      setShowValidationErrors(true);
      setTimeout(() => {
        const invalid = document.querySelector('[data-invalid="true"]');
        invalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }
    setCompletedSteps(prev => prev.includes(currentStep) ? prev : [...prev, currentStep]);
    const nextIdx = currentIndex + 1;
    if (nextIdx < DISCOVERY_STEPS.length) {
      goToStep(DISCOVERY_STEPS[nextIdx].id);
    }
  }, [currentStep, currentIndex, validateStep, formData, goToStep]);

  const prevStep = useCallback(() => {
    if (currentIndex > 0) {
      goToStep(DISCOVERY_STEPS[currentIndex - 1].id);
    }
  }, [currentIndex, goToStep]);

  // ── Reverification confirm ─────────────────────────────────────────────────
  const handleReverificationConfirm = async (flags) => {
    setShowReverification(false);
    if (journey?.id) {
      // Transition discovery_resumed_pending_reverification → discovery_collecting
      const updated = await advanceState(journey.id, 'discovery_collecting', {
        reverification_flags: flags,
        reverification_completed: true,
      });
      onJourneyUpdate?.(updated);
    }
    fireVoice(currentStep, 'step_enter');
  };

  const handleReverificationDeny = async (flags) => {
    // Find first denied section and navigate there
    const firstDenied = DISCOVERY_STEPS.find(s => flags[s.section_id] === false);
    setShowReverification(false);
    if (journey?.id) {
      // Transition to discovery_collecting, mark reverification_pending
      const updated = await advanceState(journey.id, 'discovery_collecting', {
        reverification_flags: flags,
        reverification_pending: true,
      });
      onJourneyUpdate?.(updated);
    }
    if (firstDenied) {
      goToStep(firstDenied.id);
    }
  };

  // ── Mute toggle ────────────────────────────────────────────────────────────
  const handleToggleMute = () => {
    setIsMuted(m => {
      if (!m) stopVoice();
      return !m;
    });
  };

  // ── Contradiction-aware onChange wrapper ───────────────────────────────────
  // Step components call onChange(field, value) — forward to parent and check contradictions
  const handleFormChange = useCallback((field, value) => {
    onFormChange?.({ [field]: value });
    // Non-blocking contradiction check against merged data
    const merged = { ...formData, [field]: value };
    checkContradictions(field, merged);
  }, [onFormChange, formData, checkContradictions]);

  const StepComponent = stepComponents?.[currentStep];
  const isLastStep = currentIndex === DISCOVERY_STEPS.length - 1;
  const isFirstStep = currentIndex === 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Step progress */}
      <StepProgress
        steps={DISCOVERY_STEPS}
        currentStepId={currentStep}
        completedStepIds={completedSteps}
      />

      {/* Voice bar */}
      <VoiceBar
        avatarState={avatarState}
        caption={currentText}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isLoading={isPlaying && !currentText}
      />

      {/* Reverification overlay */}
      <AnimatePresence>
        {showReverification && (
          <motion.div
            key="reverification"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 md:p-10"
          >
            <ReverificationScreen
              journey={journey}
              sections={DISCOVERY_STEPS}
              onConfirm={handleReverificationConfirm}
              onDeny={handleReverificationDeny}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main step card */}
      {!showReverification && (
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-6 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Contradiction warnings */}
              {contradictions.length > 0 && (
                <div className="mb-4 space-y-2">
                  {contradictions.map((c, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex items-start gap-2 p-3 rounded-xl text-sm',
                        c.severity === 'error'
                          ? 'bg-red-50 border border-red-200 text-red-700'
                          : 'bg-amber-50 border border-amber-200 text-amber-800'
                      )}
                    >
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{c.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {StepComponent ? (
                <StepComponent
                  data={formData}
                  onChange={handleFormChange}
                  showErrors={showValidationErrors}
                  plannerData={plannerData}
                />
              ) : (
                <div className="py-10 text-center text-slate-400">
                  Компонентът за тази стъпка не е зареден.
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isFirstStep}
              className="rounded-full px-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>

            {!isLastStep ? (
              <Button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 rounded-full px-6"
              >
                Напред
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <div className="flex flex-col items-end gap-2">
                <Button
                  onClick={() => {
                    if (canSubmit) {
                      onSubmit?.();
                    } else {
                      setShowValidationErrors(true);
                    }
                  }}
                  disabled={isSubmitting || !canSubmit}
                  className="bg-green-600 hover:bg-green-700 rounded-full px-8 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Изпращане...</>
                  ) : !canSubmit ? (
                    <><AlertTriangle className="mr-2 h-4 w-4" /> Попълнете всички полета</>
                  ) : (
                    <><CheckCircle className="mr-2 h-4 w-4" /> Завърши анализа</>
                  )}
                </Button>
                {!canSubmit && incompleteSteps.length > 0 && (
                  <p className="text-xs text-red-500">
                    Непопълнени: {incompleteSteps.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Context builder (shared helper) ─────────────────────────────────────────
export function buildContext(formData = {}, plannerData = {}, languageCode = 'bg') {
  return {
    languageCode,
    clientFirstName: formData.client_first_name || plannerData?.client_first_name || '',
    clientLastName: formData.client_last_name || plannerData?.client_last_name || '',
    clientMonthlyNetIncome: formData.client_monthly_net_income ?? plannerData?.monthly_income ?? null,
    partnerMonthlyNetIncome: formData.partner_monthly_net_income ?? plannerData?.partner_income ?? null,
    totalMonthlyIncome: formData.total_monthly_income ?? null,
    monthlySavingsAmount: formData.monthly_savings_amount ?? null,
    familyType: plannerData?.family_type ?? 'individual',
    includePartner: formData.include_partner ?? false,
    partnerFirstName: formData.partner_first_name || plannerData?.partner_first_name || '',
    childrenCount: formData.children_count ?? plannerData?.children_count ?? 0,
    currentHousing: formData.current_housing ?? null,
    desiredReserveMonths: formData.desired_reserve_months ?? null,
    riskProfile: formData.risk_profile ?? null,
    clientRetirementAge: formData.client_retirement_age ?? null,
    planningHousingChange: formData.planning_housing_change ?? null,
  };
}