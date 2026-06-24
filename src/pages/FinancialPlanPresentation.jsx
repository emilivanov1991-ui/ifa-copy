import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import {
  MessageSquare, PhoneOff, Loader2,
  CheckCircle2, BarChart3, Shield, PiggyBank, Home, Baby,
  Send, X, FileText, CreditCard, AlertTriangle, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AvatarFrame from '@/components/voice/AvatarFrame';
import GuideAvatar from '@/components/GuideAvatar';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';
import ApplicationCollectionForm from '@/components/application/ApplicationCollectionForm';
import SigningStatusPoller from '@/components/application/SigningStatusPoller';
import PaymentCheckout from '@/components/application/PaymentCheckout';
import JourneyCompletedScreen from '@/components/application/JourneyCompletedScreen';
import PlanProjectionsChart from '@/components/financial-plan/PlanProjectionsChart';

const AGENT_NAME = 'presentation_advisor';

export default function FinancialPlanPresentation() {
  const urlParams = new URLSearchParams(window.location.search);
  const journeyId = urlParams.get('journey_id');
  const planId = urlParams.get('plan_id');

  const [journey, setJourney] = useState(null);
  const [plan, setPlan] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);

  // Phase 5 state: 'presentation' | 'application' | 'signing' | 'payment'
  const [phase, setPhase] = useState('presentation');
  const [applicationId, setApplicationId] = useState(null);
  const [signingEventId, setSigningEventId] = useState(null);
  const [signingUrl, setSigningUrl] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  // Agent conversation state
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [agentAvatarState, setAgentAvatarState] = useState('idle');

  const messagesEndRef = useRef(null);
  // NOTE: advanceState removed — FinancialPlanPresentation may be accessed without auth
  // Journey state advances via backend automations on application submit

  // Load plan data + analysis
  useEffect(() => {
    if (!planId && !journeyId) { setLoading(false); return; }
    const loadData = async () => {
      try {
        if (planId) {
          const plans = await base44.entities.FinancialPlan.filter({ id: planId });
          if (plans.length > 0) {
            setPlan(plans[0]);
            const offerData = await base44.entities.ProductOffer.filter({ plan_id: planId });
            setOffers(offerData);
            // Load analysis for ApplicationCollectionForm
            if (plans[0].analysis_id) {
              const analyses = await base44.entities.FinancialAnalysisSubmission.filter({ id: plans[0].analysis_id });
              if (analyses.length > 0) setAnalysisData(analyses[0]);
            }
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

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
      // Detect avatar state from last assistant message tool calls
      const lastMsg = (data.messages || []).filter(m => m.role === 'assistant').slice(-1)[0];
      if (lastMsg?.content) setAgentAvatarState('talking');
      else setAgentAvatarState('thinking');
    });
    return () => unsubscribe();
  }, [conversation?.id]);

  // When agent stops streaming, go back to idle
  useEffect(() => {
    if (agentAvatarState === 'talking') {
      const t = setTimeout(() => setAgentAvatarState('idle'), 2000);
      return () => clearTimeout(t);
    }
  }, [messages.length]);

  const handleStartChat = async () => {
    setChatStarted(true);
    setAgentAvatarState('thinking');
    try {
      const conv = await base44.agents.createConversation({
        agent_name: AGENT_NAME,
        metadata: {
          name: `Презентация ${plan?.id || ''}`,
          description: `Journey: ${journeyId || ''} | Plan: ${planId || ''}`,
        },
      });
      setConversation(conv);

      // Advance journey state via advanceJourneyPublic (routes through state machine + audit)
      if (journeyId) {
        try {
          await base44.functions.invoke('advanceJourneyPublic', {
            journey_id: journeyId,
            to_state: 'presentation_in_progress',
            extra_data: { presentation_started_at: new Date().toISOString() },
          });
        } catch (err) {
          console.warn('Failed to update journey state (non-blocking):', err);
        }
      }

      // Send initial context message
      const planSummary = plan
        ? `Клиентът е на ${plan.partner1_age} г. Общо месечна вноска: ${plan.total_monthly_premium} €. Продукти: ${offers.map(o => o.product_name).join(', ')}.`
        : 'Финансовият план е зареден.';

      await base44.agents.addMessage(conv, {
        role: 'user',
        content: `Започни презентацията на финансовия план. Контекст: ${planSummary}`,
      });

    } catch (err) {
      console.error('Agent start error:', err);
      setAgentAvatarState('concerned');
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !conversation || isSending) return;
    const text = inputText.trim();
    setInputText('');
    setIsSending(true);
    setAgentAvatarState('thinking');
    try {
      await base44.agents.addMessage(conversation, { role: 'user', content: text });
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleEndChat = async () => {
    setAgentAvatarState('idle');
    setChatStarted(false);
    setConversation(null);
    setMessages([]);
  };

  const handleProceedToApplication = async () => {
    if (journeyId) {
      await base44.functions.invoke('advanceJourneyPublic', {
        journey_id: journeyId,
        to_state: 'application_collecting',
      }).catch(() => {});
    }
    setPhase('application');
  };

  const handleApplicationComplete = (appId) => {
    setApplicationId(appId);
    setPhase('signing');
  };

  const handleSigningComplete = () => {
    setPhase('payment');
  };

  const handleSigningFailed = () => {
    // Stay on signing screen, user can retry
  };

  const sections = [
    { id: 'overview',     label: 'Обзор',      icon: BarChart3 },
    { id: 'protection',   label: 'Защита',     icon: Shield },
    { id: 'reserve',      label: 'Резерв',     icon: PiggyBank },
    { id: 'housing',      label: 'Жилище',     icon: Home },
    { id: 'children',     label: 'Деца',       icon: Baby },
    { id: 'projections',  label: 'Проекции',   icon: TrendingUp },
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

  // Phase: completed
  if (phase === 'completed') {
    return <JourneyCompletedScreen journeyId={journeyId} plan={plan} />;
  }

  // plan_auto_sell_blocked screen
  if (journey?.journey_state === 'plan_auto_sell_blocked') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Shield className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Необходима е допълнителна консултация</h2>
          <p className="text-slate-500 text-sm mb-6">
            Вашият профил изисква индивидуален подход. Консултант ще се свърже с Вас в рамките на 24 часа за персонализирана среща.
          </p>
          <Button
            onClick={() => window.location.href = createPageUrl('Home')}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-full"
          >
            Разбирам — върни ме към началото
          </Button>
        </div>
      </div>
    );
  }

  // Phase 5 screens
  if (phase === 'application') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/258cedab0_output-onlinepngtools.png" alt="IFA" className="h-8 w-auto" />
          <div>
            <h1 className="text-sm font-bold text-slate-900">Попълване на заявление</h1>
            <p className="text-xs text-slate-500">Стъпка 1 от 3</p>
          </div>
        </div>
        <div className="flex-1 p-4 flex items-start justify-center pt-8">
          <ApplicationCollectionForm
            journeyId={journeyId}
            planId={planId}
            analysisData={analysisData}
            onComplete={handleApplicationComplete}
          />
        </div>
      </div>
    );
  }

  if (phase === 'signing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/258cedab0_output-onlinepngtools.png" alt="IFA" className="h-8 w-auto" />
          <div>
            <h1 className="text-sm font-bold text-slate-900">Електронно подписване</h1>
            <p className="text-xs text-slate-500">Стъпка 2 от 3</p>
          </div>
        </div>
        <div className="flex-1 p-4 flex items-start justify-center pt-8">
          {signingEventId ? (
            <SigningStatusPoller
              signingEventId={signingEventId}
              signingUrl={signingUrl}
              onSigned={handleSigningComplete}
              onFailed={handleSigningFailed}
            />
          ) : (
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 p-6 text-center">
              <FileText className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <h3 className="font-bold text-slate-900 mb-2">Готови за подписване</h3>
              <p className="text-sm text-slate-500 mb-5">Документите са изготвени. Консултантът ще инициира сесията за подписване чрез Evrotrust.</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full" onClick={handleSigningComplete}>
                Продължи без подписване (тест)
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'payment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/258cedab0_output-onlinepngtools.png" alt="IFA" className="h-8 w-auto" />
          <div>
            <h1 className="text-sm font-bold text-slate-900">Плащане</h1>
            <p className="text-xs text-slate-500">Стъпка 3 от 3</p>
          </div>
        </div>
        <div className="flex-1 p-4 flex items-start justify-center pt-8">
          <PaymentCheckout
            journeyId={journeyId}
            applicationId={applicationId}
            plan={plan}
            onSuccess={() => setPhase('completed')}
            onCancel={() => setPhase('presentation')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <GuideAvatar state={agentAvatarState} isActive={chatStarted} tooltip="Вашият AI финансов съветник" />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/258cedab0_output-onlinepngtools.png"
            alt="IFA" className="h-8 w-auto"
          />
          <div>
            <h1 className="text-sm font-bold text-slate-900">Вашият Финансов План</h1>
            <p className="text-xs text-slate-500">Персонализирано за Вас</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AvatarFrame
            avatarState={agentAvatarState}
            isPlaying={chatStarted}
            mode={chatStarted ? 'live' : 'scripted'}
            compact={true}
          />
          {chatStarted && (
            <div className="flex items-center gap-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium">Активен</span>
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
                currentSection === idx ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              <sec.icon className="w-3.5 h-3.5" />
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 max-w-4xl mx-auto w-full flex flex-col gap-4">

        {/* Plan Cards */}
        <AnimatePresence mode="wait">
          <motion.div key={currentSection} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            {sections[currentSection]?.id === 'projections' ? (
              <PlanProjectionsChart plan={plan} offers={offers} analysisData={analysisData} />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {offers.slice(0, 6).map((offer, idx) => (
                    <motion.div key={offer.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                      <p className="text-xs text-slate-500 mb-1">{offer.provider}</p>
                      <h3 className="text-sm font-semibold text-slate-900 mb-2 line-clamp-2">{offer.product_name}</h3>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-slate-500">Месечна премия</p>
                          <p className="text-lg font-bold text-blue-600">{offer.monthly_premium} €</p>
                        </div>
                        {offer.coverage_amount > 0 && (
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Покритие</p>
                            <p className="text-sm font-semibold text-slate-700">{(offer.coverage_amount / 1000).toFixed(0)}K €</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                {plan && (
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white">
                    <p className="text-blue-100 text-sm mb-1">Общо месечна вноска</p>
                    <p className="text-4xl font-bold">{plan.total_monthly_premium || '—'} €</p>
                    <p className="text-blue-200 text-xs mt-2">
                      Обща защита: {plan.total_coverage ? (plan.total_coverage / 1000).toFixed(0) + 'K €' : '—'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Chat Panel — visible when started */}
        <AnimatePresence>
          {chatStarted && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-lg flex flex-col"
              style={{ minHeight: 320, maxHeight: 420 }}
            >
              {/* Chat header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-slate-700">AI Финансов Съветник</span>
                </div>
                <button onClick={handleEndChat} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.length === 0 && (
                  <div className="flex items-center gap-2 text-slate-400 text-sm py-4 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Инициализиране...</span>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div key={idx} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {msg.role !== 'user' && (
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mr-2 shrink-0 mt-1">
                        <span className="text-xs text-blue-600 font-bold">AI</span>
                      </div>
                    )}
                    {msg.content && (
                      <div className={cn(
                        'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-slate-100 text-slate-800 rounded-bl-md'
                      )}>
                        {msg.role === 'user'
                          ? <p>{msg.content}</p>
                          : <ReactMarkdown className="prose prose-sm max-w-none">{msg.content}</ReactMarkdown>
                        }
                      </div>
                    )}
                    {/* Tool calls indicator */}
                    {msg.tool_calls?.some(tc => ['pending','running','in_progress'].includes(tc.status)) && (
                      <div className="flex items-center gap-1 text-slate-400 text-xs ml-2 self-end">
                        <Loader2 className="w-3 h-3 animate-spin" /> обработвам...
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex gap-2 px-4 py-3 border-t border-slate-100">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Напишете въпрос..."
                  className="flex-1 text-sm border border-slate-200 rounded-full px-4 py-2 outline-none focus:border-blue-400"
                  disabled={isSending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isSending}
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-40 hover:bg-blue-700 transition-colors"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white border-t border-slate-200 p-4 safe-area-bottom">
        {!chatStarted && (
          <div className="space-y-3">
            <Button
              onClick={handleStartChat}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-4 text-base font-semibold flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
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

        {chatStarted && (
          <div className="space-y-3">
            <Button
              onClick={handleProceedToApplication}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full py-4"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Приемам плана — продължи към заявление
            </Button>
            <Button onClick={handleEndChat} variant="outline" className="w-full rounded-full py-3 border-slate-300 text-slate-600">
              <PhoneOff className="w-4 h-4 mr-2" />
              Затвори чата
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}