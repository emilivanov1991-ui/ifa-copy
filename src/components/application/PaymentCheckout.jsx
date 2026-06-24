import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { CreditCard, Shield, Loader2, CheckCircle2, AlertTriangle, ExternalLink, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * PaymentCheckout
 * Creates a Stripe checkout session and redirects the user.
 * Props: journeyId, applicationId, plan (FinancialPlan obj), onSuccess(), onCancel()
 * 
 * Features:
 * - Iframe detection (blocks checkout if embedded)
 * - Stripe Checkout redirect (hosted payment page)
 * - Payment tracking via PaymentEvent entity
 */
export default function PaymentCheckout({ journeyId, applicationId, plan, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // Detect if running in iframe
    setIsInIframe(window.self !== window.top);
  }, []);

  const totalMonthly = plan?.total_monthly_premium || 0;
  // First payment = first month premium
  const firstPaymentAmount = totalMonthly;

  const handlePayNow = async () => {
    // Block if in iframe (Stripe Checkout doesn't work in iframes)
    if (isInIframe) {
      setError('Плащането не работи в embed/iframe режим. Моля отворете приложението в нов прозорец.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const successUrl = `${window.location.origin}/Onboarding?payment_success=1&journey_id=${journeyId}`;
      const cancelUrl = `${window.location.origin}/FinancialPlanPresentation?journey_id=${journeyId}&plan_id=${plan?.id || ''}&payment_cancelled=1`;

      const res = await base44.functions.invoke('createStripeCheckout', {
        journey_id: journeyId,
        application_id: applicationId,
        amount: firstPaymentAmount,
        product_name: 'Финансов план IFA — първа вноска',
        product_description: `Месечна премия по финансов план. ${plan?.products?.length || 0} продукта.`,
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: plan?.client_email || undefined,
      });

      if (res?.data?.checkout_url) {
        // Redirect to Stripe Checkout (hosted payment page)
        window.location.href = res.data.checkout_url;
      } else {
        throw new Error(res?.data?.error || 'Неуспешно стартиране на плащане');
      }
    } catch (e) {
      console.error('Stripe checkout error:', e);
      setError(e.message || 'Грешка при стартиране на плащането');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Iframe Warning Banner */}
      {isInIframe && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1">
                Плащането не работи в този режим
              </p>
              <p className="text-xs text-amber-700">
                Stripe Checkout изисква приложението да е отворено в нов прозорец, не в embed/iframe.
                Моля отворете приложението директно.
              </p>
            </div>
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

        {/* Products list */}
        {plan?.products && plan.products.length > 0 && (
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

        {/* Security badges */}
        <div className="flex items-center gap-2 mb-5 p-3 bg-green-50 rounded-xl">
          <Shield className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-xs text-green-700">Плащането е защитено с 256-bit SSL криптиране чрез Stripe</p>
        </div>

        {/* Payment info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
          <div className="flex items-start gap-2">
            <ExternalLink className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-blue-800 mb-1">
                Как работи плащането?
              </p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Ще бъдете пренасочени към сигурната страница на Stripe</li>
                <li>• Въведете данните на вашата дебитна/кредитна карта</li>
                <li>• След плащането ще се върнете обратно в приложението</li>
                <li>• Получавате потвърждение по имейл</li>
              </ul>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 mb-4 p-3 bg-red-50 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <Button
          className={cn(
            "w-full rounded-full py-4 text-base font-semibold transition-all",
            isInIframe 
              ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700 text-white"
          )}
          onClick={handlePayNow}
          disabled={loading || totalMonthly <= 0 || isInIframe}
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin mr-2" />Стартиране...</>
          ) : isInIframe ? (
            <><AlertTriangle className="w-5 h-5 mr-2" />Отворете в нов прозорец</>
          ) : (
            <><CreditCard className="w-5 h-5 mr-2" />Плати {totalMonthly.toFixed(2)} €</>
          )}
        </Button>

        <button
          onClick={onCancel}
          className="w-full mt-3 text-xs text-slate-400 hover:text-slate-600 transition-colors py-2"
        >
          Отложи плащането
        </button>
      </div>
    </div>
  );
}