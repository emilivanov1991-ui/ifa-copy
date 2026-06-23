import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/components/LanguageProvider';

/**
 * ReverificationDialog — "Is this still correct?" UI
 * Shows when user resumes a journey after 14+ days
 * Displays sections marked as potentially outdated for confirmation
 */
export default function ReverificationDialog({
  journey,
  open,
  onConfirm,
  onReject
}) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [confirmedSections, setConfirmedSections] = useState({});

  // Section labels for display
  const sectionLabels = {
    personal_data: t('Лични данни', 'Personal Data'),
    family: t('Семейство', 'Family'),
    housing: t('Жилище', 'Housing'),
    income: t('Доходи', 'Income'),
    expenses: t('Разходи', 'Expenses'),
    assets: t('Активи', 'Assets'),
    liabilities: t('Пасиви', 'Liabilities'),
    protection: t('Защита', 'Protection'),
    reserve: t('Резерв', 'Reserve'),
    pension: t('Пенсия', 'Pension'),
    children: t('Деца', 'Children'),
    goals: t('Цели', 'Goals'),
  };

  // Get sections that need reverification
  const sectionsToVerify = Object.entries(journey?.reverification_flags || {})
    .filter(([_, isConfirmed]) => !isConfirmed)
    .map(([sectionId]) => sectionId);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Mark all displayed sections as confirmed
      const updatedFlags = { ...journey.reverification_flags };
      sectionsToVerify.forEach(sectionId => {
        updatedFlags[sectionId] = true;
      });

      // Update journey with confirmed flags
      await base44.entities.Journey.update(journey.id, {
        reverification_flags: updatedFlags,
        reverification_completed: true,
        reverification_performed: true,
      });

      onConfirm();
    } catch (error) {
      console.error('Reverification confirm error:', error);
      alert(t('Грешка при потвърждение', 'Confirmation error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSection = async (sectionId) => {
    // User says this section is NOT correct — will need to re-fill
    const updatedFlags = { ...journey.reverification_flags };
    updatedFlags[sectionId] = false; // Keep as unconfirmed

    await base44.entities.Journey.update(journey.id, {
      reverification_flags: updatedFlags,
      reverification_pending: true, // Keep pending until all resolved
    });

    // Remove from local confirmed state
    setConfirmedSections(prev => {
      const next = { ...prev };
      delete next[sectionId];
      return next;
    });
  };

  if (!open || !journey) return null;

  const allConfirmed = sectionsToVerify.length === 0 || 
    sectionsToVerify.every(sec => confirmedSections[sec]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-2 border-blue-200 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-blue-900">
                    {t('Актуализация на данните', 'Data Update')}
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    {t('Минали са 14+ дни. Моля потвърдете, че данните са актуални.', 
                       '14+ days have passed. Please confirm your data is still accurate.')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {sectionsToVerify.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-slate-900">
                    {t('Всички секции са потвърдени', 'All sections confirmed')}
                  </p>
                  <p className="text-slate-600 mt-2">
                    {t('Можете да продължите напред', 'You can continue')}
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {sectionsToVerify.map((sectionId) => (
                      <div
                        key={sectionId}
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={confirmedSections[sectionId]}
                            onCheckedChange={(checked) => {
                              setConfirmedSections(prev => ({
                                ...prev,
                                [sectionId]: checked
                              }));
                            }}
                            id={sectionId}
                            className="data-[state=checked]:bg-blue-600"
                          />
                          <Label
                            htmlFor={sectionId}
                            className="font-medium text-slate-900 cursor-pointer"
                          >
                            {sectionLabels[sectionId] || sectionId}
                          </Label>
                        </div>
                        {confirmedSections[sectionId] && (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <p className="font-semibold mb-1">
                          {t('Някои данни не са актуални?', 'Some data not accurate?')}
                        </p>
                        <p>
                          {t('Ако някоя секция не е вярна, просто я отметнете и ще ви върнем към нея за редакция.',
                             'If a section is not accurate, uncheck it and we\'ll take you back to edit it.')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleConfirm}
                      disabled={!allConfirmed || loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {t('Запазване...', 'Saving...')}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          {t('Потвърждавам — продължи', 'Confirm & Continue')}
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}