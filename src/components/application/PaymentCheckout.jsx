import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { CreditCard, Shield, Loader2, AlertTriangle, ExternalLink, Info, RefreshCw, XCircle } from 'lucide-react';

const MAX_ATTEMPTS = 3;

/**
 * PaymentCheckout
 * Props: journeyId, applicationId, plan, onSuccess(), onFailure()
 * Features:
 * - Iframe detection
 * - Stripe Checkout redirect
 * - Retry logic (max 3 attempts)
 * - Failure UI with retry button
 * - PaymentEvent tracking
 */
export default function PaymentCheckout({ journeyId, applicationId, plan, onSuccess, onFailure, initialAttempts = 0 }) {
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [isInIframe, setIsInIframe] = useState(false);
  const [attempts, setAttempts]     = useState(initialAttempts);
  const [lastEventId, setLastEventId] = useState(null);

  useEffect(() => {
    setIsInIframe(window.self !== window.top);
  }, []);

  const totalMonthly = plan?.total_monthly_premium || 0;
  const attemptsLeft = MAX_ATTEMPTS - attempts;
  const maxReached   = attempts >= MAX_ATTEMPTS;

  const handlePayNow = async () => {
    if (isInIframe) {
      setError('Плащането не работи в embed режим. Моля отворете приложението в нов прозорец.');
      return;
    }
    if (maxReached) return;

    setLoading(true);
    setError(null);

    const currentAttempt = attempts + 1;
    setAttempts(currentAttempt);

    try {
      const successUrl = `${window.location.origin}/ApplicationCollection/${journeyId}?payment_success=1`;
      const cancelUrl  = `${window.location.origin}/ApplicationCollection/${journeyId}?payment_cancelled=1&attempt=${currentAttempt}`;

      const res = await base44.functions.invoke('createStripeCheckout', {
        journey_id:          journeyId,
        application_id:      applicationId,
        amount:              totalMonthly,
        product_name:        'Финансов план IFA — първа вноска',
        product_description: `Месечна премия. ${plan?.products?.length || 0} продукта.`,
        success_url:         successUrl,
        cancel_url:          cancelUrl,
        customer_email:      plan?.client_email || undefined,
        attempt_number:      currentAttempt,
      });

      if (res?.data?.checkout_url) {
        if (res.data.payment_event_id) setLastEventId(res.data.payment_event_id);
        window.location.href = res.data.checkout_url;
      } else {
        throw new Error(res?.data?.error || 'Неуспешно стартиране на плащане');
      }
    } catch (e) {
      console.error('Stripe checkout error:', e);
      setError(e.message || 'Грешка при стартиране на плащането');
      // If max attempts reached after this failure, call onFailure
      if (currentAttempt >= MAX_ATTEMPTS) {
        onFailure?.('max_attempts_reached');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Max attempts reached UI ──────────────────────────────────────────────
  if (maxReached && error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-5 text-white text-center">
          <XCircle className="w-10 h-10 mx-auto mb-2" />
          <h3 className="font-bold text-lg">Плащането не успя</h3>
          <p className="text-red-200 text-sm">Достигнат е лимитът от {MAX_ATTEMPTS} опита</p>
        </div>
        <div className="p-6 text-center">
          <p className="text-slate-600 mb-6">
            След {MAX_ATTEMPTS} неуспешни опита, вашата заявка ще бъде прегледана ръчно от консултант.
            Ще се свържем с вас до 24 часа.
          </p>
          <Button
            onClick={() => onFailure?.('max_attempts_reached')}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl"
          >
            Разбрах — свържете се с мен
          </Button>
        </div>
      </motion.div>
    );
  }

  // ── Normal UI ────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
    >
      {/* Iframe warning */}
      {isInIframe && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Stripe Checkout изисква приложението да е отворено директно — не в embed/iframe.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="w-5 h-5" />
          <h3 className="font-bold">Плащане на първа вноска</h3>
        </div>
        <p className="text-blue-200 text-xs">Сигурно плащане със Stripe</p>
      </div>

      <div className="p-6">
        {/* Amount */}
        <div className="bg-slate-50 rounded-xl p-4 mb-5 text-center">
          <p className="text-xs text-slate-500 mb-1">Сума за плащане</p>
          <p className="text-4xl font-bold text-slate-900">{totalMonthly.toFixed(2)} €</p>
          <p className="text-xs text-slate-400 mt-1">Месечна премия — първо плащане</p>
        </div>

        {/* Products */}
        {plan?.products?.filter(p => p.is_active).length > 0 && (
          <div className="space-y-2 mb-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Включени продукти</p>
            {plan.products.filter(p => p.is_active).map((prod, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-900">{prod.product_name}</p>
                  <p className="text-xs text-slate-500">{prod.provider}</p>
                </div>
                <p className="text-sm font-bold text-blue-600">{prod.monthly_premium} €</p>
              </div>
            ))}
          </div>
        )}

        {/* Attempts indicator */}
        {attempts > 0 && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700">
              Опит {attempts} от {MAX_ATTEMPTS}. Остават {attemptsLeft} опита.
            </p>
          </div>
        )}

        {/* Security */}
        <div className="flex items-center gap-2 mb-5 p-3 bg-green-50 rounded-xl">
          <Shield className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-xs text-green-700">Защитено с 256-bit SSL криптиране чрез Stripe</p>
        </div>

        {/* How it works */}
        {attempts === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
            <div className="flex items-start gap-2">
              <ExternalLink className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Ще бъдете пренасочени към сигурната страница на Stripe</li>
                <li>• Въведете данните на вашата карта</li>
                <li>• След плащането ще се върнете обратно в приложението</li>
              </ul>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 mb-4 p-3 bg-red-50 rounded-xl border border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <Button
          className="w-full rounded-full py-4 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handlePayNow}
          disabled={loading || totalMonthly <= 0 || isInIframe || maxReached}
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin mr-2" />Стартиране...</>
          ) : attempts > 0 ? (
            <><RefreshCw className="w-5 h-5 mr-2" />Опитай отново ({attemptsLeft} остават)</>
          ) : (
            <><CreditCard className="w-5 h-5 mr-2" />Плати {totalMonthly.toFixed(2)} €</>
          )}
        </Button>

        <button
          onClick={() => onFailure?.('user_postponed')}
          className="w-full mt-3 text-xs text-slate-400 hover:text-slate-600 transition-colors py-2"
        >
          Отложи плащането
        </button>
      </div>
    </motion.div>
  );
}