import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import ApplicationCollectionForm from '@/components/application/ApplicationCollectionForm';
import JourneyCompletedScreen from '@/components/application/JourneyCompletedScreen';
import PaymentCheckout from '@/components/application/PaymentCheckout';
import SigningFlow from '@/components/application/SigningFlow';

export default function ApplicationCollection() {
  const { journeyId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading]         = useState(true);
  const [journey, setJourney]         = useState(null);
  const [plan, setPlan]               = useState(null);
  const [analysis, setAnalysis]       = useState(null);
  const [applicationId, setApplicationId] = useState(null);

  // Screen: 'form' | 'signing' | 'signing_failed' | 'payment' | 'payment_success' | 'payment_failed' | 'completed'
  const [screen, setScreen] = useState('form');

  // Read URL params set by Stripe redirect
  const paymentSuccess   = searchParams.get('payment_success') === '1';
  const paymentCancelled = searchParams.get('payment_cancelled') === '1';
  const cancelledAttempt = parseInt(searchParams.get('attempt') || '0', 10);

  useEffect(() => {
    loadData();
  }, [journeyId]);

  // After Stripe redirects back, set the correct screen
  useEffect(() => {
    if (!loading) {
      if (paymentSuccess) {
        setScreen('payment_success');
      } else if (paymentCancelled) {
        // Came back from cancelled Stripe checkout — go back to payment with attempt count restored
        setScreen('payment');
      }
    }
  }, [loading, paymentSuccess, paymentCancelled]);

  const loadData = async () => {
    try {
      const [journeyData] = await base44.entities.Journey.filter({ id: journeyId });
      if (!journeyData) { navigate('/'); return; }
      setJourney(journeyData);

      // Restore screen from journey state
      if (journeyData.journey_state === 'payment_in_progress' || journeyData.journey_state === 'payment_failed') {
        setScreen('payment');
      } else if (journeyData.journey_state === 'completed') {
        setScreen('completed');
      }

      if (journeyData.plan_id) {
        const [planData] = await base44.entities.FinancialPlan.filter({ id: journeyData.plan_id });
        setPlan(planData);
      }
      if (journeyData.analysis_id) {
        const [analysisData] = await base44.entities.FinancialAnalysisSubmission.filter({ id: journeyData.analysis_id });
        setAnalysis(analysisData);
      }
    } catch (error) {
      console.error('Error loading application data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Called when ApplicationCollectionForm is done — move to signing first
  const handleFormComplete = (appId) => {
    setApplicationId(appId);
    setScreen('signing');
  };

  // Called when signing succeeds — move to payment
  const handleSigningComplete = () => {
    setScreen('payment');
  };

  // Called when signing fails (max attempts / decline / expire)
  const handleSigningMaxAttempts = async (reason) => {
    setScreen('signing_failed');
    base44.functions.invoke('createFollowUpTask', {
      journey_id: journeyId,
      reason: 'signing_max_attempts',
      reason_detail: `Signing failed: ${reason || 'max_attempts'}`,
    }).catch(console.error);
  };

  // Called when payment fails (max attempts or user postpones)
  const handlePaymentFailure = async (reason) => {
    if (reason === 'max_attempts_reached') {
      setScreen('payment_failed');
      // Create follow-up task
      base44.functions.invoke('createFollowUpTask', {
        journey_id: journeyId,
        reason: 'payment_failed',
        reason_detail: `Payment failed after ${3} attempts`,
      }).catch(console.error);
    } else {
      // user postponed — just show form again or stay
      setScreen('payment');
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // ── Payment Success ──────────────────────────────────────────────────────
  if (screen === 'payment_success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Плащането е успешно!</h2>
          <p className="text-slate-500 mb-6">
            Вашата заявка е потвърдена. Ще получите имейл с подробности и следващи стъпки.
          </p>
          <Button
            onClick={() => setScreen('completed')}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3"
          >
            Продължи
          </Button>
        </motion.div>
      </div>
    );
  }

  // ── Payment Failed (max attempts) ────────────────────────────────────────
  if (screen === 'payment_failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-9 h-9 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Плащането не успя</h2>
          <p className="text-slate-500 mb-2">
            Достигнат е лимитът от 3 неуспешни опита.
          </p>
          <p className="text-slate-500 mb-6">
            Консултант ще се свърже с вас до <strong>24 часа</strong>, за да завърши процеса.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => { setScreen('payment'); }}
              variant="outline"
              className="w-full border-slate-300 rounded-xl"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Опитай отново
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl"
            >
              Към началото
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Completed ────────────────────────────────────────────────────────────
  if (screen === 'completed') {
    return <JourneyCompletedScreen applicationId={applicationId} journeyId={journeyId} />;
  }

  // ── Signing Screen ───────────────────────────────────────────────────────
  if (screen === 'signing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Подписване на документи</h1>
            <p className="text-slate-500">Стъпка 2 от 3 — Електронен подпис</p>
          </div>
          <SigningFlow
            journeyId={journeyId}
            applicationId={applicationId || journey?.application_id}
            plan={plan}
            analysis={analysis}
            onSigned={handleSigningComplete}
            onMaxAttempts={handleSigningMaxAttempts}
          />
        </div>
      </div>
    );
  }

  // ── Signing Failed ────────────────────────────────────────────────────────
  if (screen === 'signing_failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-9 h-9 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Подписването не беше завършено</h2>
          <p className="text-slate-500 mb-6">
            Консултант ще се свърже с вас до <strong>24 часа</strong>, за да завърши процеса.
          </p>
          <Button onClick={() => navigate('/')} className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl">
            Към началото
          </Button>
        </motion.div>
      </div>
    );
  }

  // ── Payment Screen ───────────────────────────────────────────────────────
  if (screen === 'payment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Плащане</h1>
            <p className="text-slate-500">Последна стъпка — активирайте вашия финансов план</p>
          </div>
          <PaymentCheckout
            journeyId={journeyId}
            applicationId={applicationId || journey?.application_id}
            plan={plan}
            initialAttempts={paymentCancelled ? cancelledAttempt : 0}
            onSuccess={() => setScreen('payment_success')}
            onFailure={handlePaymentFailure}
          />
        </div>
      </div>
    );
  }

  // ── Application Form ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Завършване на кандидатурата</h1>
          <p className="text-slate-600">Попълнете необходимата информация за вашите застрахователни продукти</p>
        </div>
        <ApplicationCollectionForm
          journeyId={journeyId}
          planId={plan?.id}
          analysisData={analysis}
          onComplete={handleFormComplete}
        />
      </div>
    </div>
  );
}