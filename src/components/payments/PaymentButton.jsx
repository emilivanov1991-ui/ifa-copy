import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CreditCard, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/components/LanguageProvider';

/**
 * PaymentButton — Stripe Checkout Integration
 * Creates a checkout session and redirects user to Stripe
 */
export default function PaymentButton({
  journey_id,
  application_id,
  amount,
  product_name,
  product_description,
  customer_email,
  onSuccess,
  onError,
  className = '',
}) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    // Check if running in iframe (Visual Editor)
    if (window !== window.parent) {
      setError(t(
        'Плащането не работи във Visual Editor. Моля отворете приложението в нов прозорец.',
        'Checkout does not work in Visual Editor. Please open the app in a new window.'
      ));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const currentUrl = window.location.origin + window.location.pathname;
      const response = await base44.functions.invoke('createStripeCheckout', {
        journey_id,
        application_id,
        amount,
        product_name,
        product_description,
        customer_email,
        success_url: `${currentUrl}?payment=success&journey_id=${journey_id}`,
        cancel_url: `${currentUrl}?payment=cancelled&journey_id=${journey_id}`,
      });

      if (response.data?.checkout_url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.checkout_url;
      } else {
        throw new Error(response.data?.error || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || t('Грешка при плащане', 'Payment error'));
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full py-6 text-base font-semibold flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {t('Зареждане...', 'Loading...')}
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            {t('Плати сега', 'Pay Now')} — {amount} €
          </>
        )}
      </Button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 rounded-xl p-3 text-sm"
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
}

/**
 * PaymentStatus — Shows payment result after redirect from Stripe
 */
export function PaymentStatus() {
  const { t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const paymentStatus = urlParams.get('payment');
  const journey_id = urlParams.get('journey_id');

  if (!paymentStatus) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-50 max-w-md"
    >
      <Card className={
        paymentStatus === 'success' 
          ? 'border-green-200 bg-green-50' 
          : 'border-amber-200 bg-amber-50'
      }>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            {paymentStatus === 'success' ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            )}
            <div>
              <CardTitle className={
                paymentStatus === 'success' ? 'text-green-900' : 'text-amber-900'
              }>
                {paymentStatus === 'success' 
                  ? t('Плащането успешно!', 'Payment successful!')
                  : t('Плащането отменено', 'Payment cancelled')}
              </CardTitle>
              <CardDescription className={
                paymentStatus === 'success' ? 'text-green-700' : 'text-amber-700'
              }>
                {paymentStatus === 'success'
                  ? t('Заявлението ви се обработва', 'Your application is being processed')
                  : t('Можете да опитате отново', 'You can try again')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        {paymentStatus === 'success' && journey_id && (
          <CardContent>
            <p className="text-sm text-green-800 mb-3">
              {t('Ще получите потвърждение по имейл в скоро време.', 'You will receive a confirmation email shortly.')}
            </p>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}