import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Home, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export default function JourneyCompletedScreen({ journeyId, plan }) {
  useEffect(() => {
    if (!journeyId) return;
    // Advance to provider_submission_in_progress then completed
    const advance = async () => {
      try {
        await base44.functions.invoke('advanceJourneyPublic', {
          journey_id: journeyId,
          to_state: 'provider_submission_in_progress',
          extra_data: { completed_at: new Date().toISOString() },
        });
        await base44.functions.invoke('advanceJourneyPublic', {
          journey_id: journeyId,
          to_state: 'completed',
          extra_data: { completed_at: new Date().toISOString() },
        });
      } catch (err) {
        console.warn('Journey completion advance failed (non-blocking):', err);
      }
    };
    advance();
  }, [journeyId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Заявлението е прието!
          </h1>
          <p className="text-slate-500 mb-6">
            Вашето заявление е подадено успешно и ще бъде обработено в рамките на 24 часа.
          </p>
        </motion.div>

        {/* Plan summary */}
        {plan && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-50 rounded-2xl p-4 mb-6"
          >
            <p className="text-sm text-slate-500 mb-1">Месечна вноска по плана</p>
            <p className="text-3xl font-bold text-blue-600">{plan.total_monthly_premium} €</p>
          </motion.div>
        )}

        {/* Next steps */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-left space-y-3 mb-8"
        >
          <p className="text-sm font-semibold text-slate-700 mb-2">Следващи стъпки:</p>
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-600">Ще получите потвърждение на имейл с детайли за полицата</p>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-600">Консултант ще се свърже с Вас при необходимост</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <Button
            onClick={() => window.location.href = createPageUrl('Home')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3"
          >
            <Home className="w-4 h-4 mr-2" />
            Върни се към началото
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}