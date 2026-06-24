import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { FileText, Download, CheckCircle, Loader2, Eye, PenLine, AlertTriangle } from 'lucide-react';

/**
 * PDFPreviewSigning
 * Shows the generated plan PDF for client review before initiating Evrotrust signing.
 *
 * Props:
 *  - planId: string
 *  - journeyId: string
 *  - applicationId: string
 *  - analysisData: object (for signer info)
 *  - onProceedToSigning(): called when client confirms and signing session is initiated
 *  - onFallback(): called if user wants to sign later
 */
export default function PDFPreviewSigning({ planId, journeyId, applicationId, analysisData, onProceedToSigning, onFallback }) {
  const [pdfDataUrl, setPdfDataUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [initiating, setInitiating] = useState(false);

  useEffect(() => {
    if (!planId) { setLoading(false); return; }

    const fetchPDF = async () => {
      try {
        const res = await base44.functions.invoke('generatePlanPDF', { plan_id: planId });
        const data = res?.data;
        if (data?.pdf_base64) {
          setPdfDataUrl(`data:application/pdf;base64,${data.pdf_base64}`);
        } else {
          throw new Error(data?.error || 'PDF не може да бъде генериран.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPDF();
  }, [planId]);

  const handleDownload = () => {
    if (!pdfDataUrl) return;
    const a = document.createElement('a');
    a.href = pdfDataUrl;
    a.download = `financial_plan_${planId}.pdf`;
    a.click();
  };

  const handleProceed = async () => {
    setInitiating(true);
    try {
      // If analysisData + journeyId present, try to initiate signing via Evrotrust
      if (analysisData?.client_egn && analysisData?.client_first_name && journeyId) {
        const signerName = `${analysisData.client_first_name} ${analysisData.client_last_name || ''}`.trim();
        const res = await base44.functions.invoke('createEvrotrustSigningSession', {
          journey_id: journeyId,
          application_id: applicationId || undefined,
          signer_name: signerName,
          signer_egn: analysisData.client_egn,
          document_urls: pdfDataUrl ? [] : [], // Documents uploaded separately
        }).catch(() => null);

        if (res?.data?.signing_event_id) {
          onProceedToSigning?.({
            signingEventId: res.data.signing_event_id,
            signingUrl: res.data.signing_url,
          });
          return;
        }
      }
      // Fallback: proceed without evrotrust session (test/mock)
      onProceedToSigning?.({ signingEventId: null, signingUrl: null });
    } finally {
      setInitiating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Преглед на финансовия план</h3>
            <p className="text-xs text-slate-500">Прочетете документа преди подписване</p>
          </div>
        </div>
      </div>

      {/* PDF viewer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-slate-500">Генерираме PDF документа...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
            <p className="text-sm text-slate-600 text-center px-6">{error}</p>
            <p className="text-xs text-slate-400">Можете да продължите без преглед на документа.</p>
          </div>
        )}

        {pdfDataUrl && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* PDF iframe */}
            <iframe
              src={pdfDataUrl}
              title="Финансов план"
              className="w-full"
              style={{ height: 480, border: 'none' }}
            />
            {/* Download bar */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Eye className="w-3.5 h-3.5" />
                Прочетете внимателно преди подписване
              </div>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                Изтегли PDF
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Confirmation checkbox */}
      <div className={`rounded-2xl border p-4 transition-colors ${confirmed ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white'}`}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-blue-600"
          />
          <span className="text-sm text-slate-700">
            Прочетох финансовия план и съм съгласен/съгласна с условията. Желая да подпиша документите електронно.
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button
          onClick={handleProceed}
          disabled={!confirmed || initiating || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-4 font-semibold"
        >
          {initiating ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Инициализиране на подписване...</>
          ) : (
            <><PenLine className="w-4 h-4 mr-2" />Подпиши с Evrotrust</>
          )}
        </Button>

        <Button
          variant="ghost"
          onClick={onFallback}
          className="w-full text-slate-500 hover:text-slate-700 text-sm"
        >
          Подпиши по-късно
        </Button>
      </div>
    </div>
  );
}