import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import {
  Mic, MicOff, PhoneOff, PhoneCall, Loader2,
  ChevronRight, ChevronLeft, CheckCircle2,
  BarChart3, Shield, PiggyBank, Home, Baby,
  AlertTriangle, X, Volume2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AvatarFrame from '@/components/voice/AvatarFrame';
import { useJourneyState } from '@/components/voice/JourneyStateManager.jsx';
import GuideAvatar from '@/components/GuideAvatar';
import { createPageUrl } from '@/utils';

const RETELL_API_KEY_SET = true; // Set to false until Retell key is configured

export default function FinancialPlanPresentation() {
  const urlParams = new URLSearchParams(window.location.search);
  const journeyId = urlParams.get('journey_id');
  const planId = urlParams.get('plan_id');

  const [journey, setJourney] = useState(null);
  const [plan, setPlan] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [callStatus, setCallStatus] = useState('idle'); // idle | connecting | connected | ended | error
  const [isMuted, setIsMuted] = useState(false);
  const [avatarState, setAvatarState] = useState('idle');
  const [showGracefulStop, setShowGracefulStop] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const callTimerRef = useRef(null);
  const { advanceState, blockJourney } = useJourneyState();

  // Load plan data
  useEffect(() => {
    if (!planId && !journeyId) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        if (planId) {
          const plans = await base44.entities.FinancialPlan.filter({ id: planId });
          if (plans.length > 0) {
            setPlan(plans[0]);
            const offerData = await base44.entities.ProductOffer.filter({ plan_id: planId });
            setOffers(offerData);
          }
        }
        if (journeyId) {
          const journeys = await base44.entities.Journey.filter({ id: journeyId });
          if (journeys.length > 0) setJourney(journeys[0]);
        }
      } catch (e) {
        console.error('Error loading plan data:', e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [planId, journeyId]);

  // Timer for call duration
  useEffect(() => {
    if (callStatus === 'connected') {
      callTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      clearInterval(callTimerRef.current);
    }
    return () => clearInterval(callTimerRef.current);
  }, [callStatus]);

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartCall = async () => {
    if (!RETELL_API_KEY_SET) {
      alert('Retell API key not configured. Please set RETELL_API_KEY in backend secrets.');
      return;
    }

    setCallStatus('connecting');
    setAvatarState('thinking');

    try {
      // Get a short-lived Retell access token from our secure backend proxy
      const response = await base44.functions.invoke('createRetellWebCall', {
        journey_id: journeyId,
        plan_id: planId,
        language_code: journey?.language_code || 'bg',
      });

      if (response.data?.access_token) {
        // TODO: Initialize Retell Web SDK with the access token
        // retellClient.startCall({ accessToken: response.data.access_token })
        setCallStatus('connected');
        setAvatarState('talking');

        if (journeyId) {
          // Route through backend state machine — validates transition
          await advanceState(journeyId, 'presentation_in_progress', {
            presentation_started_at: new Date().toISOString(),
            retell_call_id: response.data.call_id,
          });
        }
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('Call start error:', error);
      setCallStatus('error');
      setAvatarState('concerned');
    }
  };

  const handleEndCall = async () => {
    setCallStatus('ended');
    setAvatarState('idle');
    setCallDuration(0);
    // TODO: retellClient.stopCall()
  };

  const handleProceedToApplication = async () => {
    if (journeyId) {
      await advanceState(journeyId, 'application_collecting');
    }
    window.location.href = createPageUrl('FinancialAnalysis') + `?journey_id=${journeyId}&mode=application`;
  };

  const sections = [
    { id: 'overview', label: 'Обзор', icon: BarChart3 },
    { id: 'protection', label: 'Защита', icon: Shield },
    { id: 'reserve', label: 'Резерв', icon: PiggyBank },
    { id: 'housing', label: 'Жилище', icon: Home },
    { id: 'children', label: 'Деца', icon: Baby },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-xl">Зареждане на финансовия план...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <GuideAvatar
        state={callStatus === 'connected' ? 'talking' : callStatus === 'connecting' ? 'thinking' : 'idle'}
        isActive={callStatus === 'connected'}
        tooltip="Вашият AI финансов съветник"
      />
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/258cedab0_output-onlinepngtools.png"
            alt="IFA"
            className="h-8 w-auto"
          />
          <div>
            <h1 className="text-sm font-bold text-slate-900">Вашият Финансов План</h1>
            <p className="text-xs text-slate-500">Персонализирано за Вас</p>
          </div>
        </div>

        {/* Avatar + Call Status */}
        <div className="flex items-center gap-3">
          <AvatarFrame
            avatarState={avatarState}
            isPlaying={callStatus === 'connected'}
            mode={callStatus === 'connected' ? 'live' : 'scripted'}
            compact={true}
          />
          {/* GuideAvatar in top-left */}
          {callStatus === 'connected' && (
            <div className="flex items-center gap-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium">{formatDuration(callDuration)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Section Nav */}
      <div className="bg-white border-b border-slate-100 px-4 overflow-x-auto">
        <div className="flex gap-1 py-2 min-w-max">
          {sections.map((sec, idx) => (
            <button
              key={sec.id}
              onClick={() => setCurrentSection(idx)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                currentSection === idx
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              <sec.icon className="w-3.5 h-3.5" />
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Plan Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {offers.slice(0, 6).map((offer, idx) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm"
                >
                  <p className="text-xs text-slate-500 mb-1">{offer.provider}</p>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">{offer.product_name}</h3>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-slate-500">Месечна премия</p>
                      <p className="text-lg font-bold text-blue-600">{offer.monthly_premium} €</p>
                    </div>
                    {offer.coverage_amount > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Покритие</p>
                        <p className="text-sm font-semibold text-slate-700">
                          {(offer.coverage_amount / 1000).toFixed(0)}K €
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Total */}
            {plan && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white">
                <p className="text-blue-100 text-sm mb-1">Общо месечна вноска</p>
                <p className="text-4xl font-bold">{plan.total_monthly_premium || '—'} €</p>
                <p className="text-blue-200 text-xs mt-2">
                  Обща защита: {plan.total_coverage ? (plan.total_coverage / 1000).toFixed(0) + 'K €' : '—'}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white border-t border-slate-200 p-4 safe-area-bottom">
        {callStatus === 'idle' && (
          <div className="space-y-3">
            <Button
              onClick={handleStartCall}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-4 text-base font-semibold flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-5 h-5" />
              Говорете с Вашия AI Съветник
            </Button>
            <Button
              onClick={handleProceedToApplication}
              variant="outline"
              className="w-full rounded-full py-3 border-green-400 text-green-700 hover:bg-green-50"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Приемам плана — продължи към заявление
            </Button>
          </div>
        )}

        {callStatus === 'connecting' && (
          <Button disabled className="w-full rounded-full py-4">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Свързване с AI съветник...
          </Button>
        )}

        {callStatus === 'connected' && (
          <div className="flex gap-3">
            <Button
              onClick={() => setIsMuted(!isMuted)}
              variant="outline"
              className={cn('flex-1 rounded-full py-4', isMuted && 'bg-red-50 border-red-300 text-red-600')}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            <Button
              onClick={handleEndCall}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-full py-4"
            >
              <PhoneOff className="w-5 h-5 mr-2" />
              Край на разговора
            </Button>
          </div>
        )}

        {callStatus === 'ended' && (
          <div className="space-y-3">
            <p className="text-center text-sm text-slate-600">Разговорът приключи. Готови ли сте да продължите?</p>
            <Button
              onClick={handleProceedToApplication}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full py-4"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Да — продължи към заявление
            </Button>
            <Button onClick={handleStartCall} variant="outline" className="w-full rounded-full py-3">
              Нов разговор
            </Button>
          </div>
        )}

        {callStatus === 'error' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">Неуспешна връзка. Моля опитайте отново.</p>
            </div>
            <Button onClick={handleStartCall} className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white py-3">
              Опитай отново
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}