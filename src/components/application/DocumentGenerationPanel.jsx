import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, RefreshCw, CheckCircle2, AlertCircle, Loader2, Eye } from 'lucide-react';

const DOC_TYPE_LABELS = {
  gdpr_consent:        { label: 'GDPR Съгласие',           required: true },
  disclosure_document: { label: 'Преддоговорна информация', required: true },
  application_form:    { label: 'Заявление за застраховка', required: true },
  plan_pdf:            { label: 'Финансов план (PDF)',      required: false },
};

/**
 * DocumentGenerationPanel
 *
 * Props:
 *   journeyId       — required
 *   applicationId   — optional
 *   plan            — FinancialPlan object (for provider list)
 *   onAllGenerated  — callback when all docs are ready
 */
export default function DocumentGenerationPanel({ journeyId, applicationId, plan, onAllGenerated }) {
  const [docs, setDocs] = useState([]); // { doc_type, provider, filename, pdf_base64, status, error }
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Load already-generated docs from DB on mount
  useEffect(() => {
    if (journeyId) loadExistingDocs();
  }, [journeyId]);

  const loadExistingDocs = async () => {
    try {
      const existing = await base44.entities.GeneratedDocument.filter({ journey_id: journeyId });
      if (existing.length > 0) {
        setDocs(existing.map(d => ({
          doc_type: d.document_type,
          provider: d.provider,
          filename: d.document_name,
          saved_id: d.id,
          status: d.generation_status,
          file_url: d.file_url,
          signing_status: d.signing_status,
        })));
        setHasGenerated(true);
      }
    } catch (e) {
      console.error('Error loading existing docs:', e);
    }
  };

  const generateAll = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateApplicationDocuments', {
        journey_id: journeyId,
        application_id: applicationId,
        document_types: 'all',
        save_to_db: true,
      });

      if (response.data?.documents) {
        const newDocs = response.data.documents.map(d => ({
          ...d,
          status: d.error ? 'error' : 'ready',
        }));
        setDocs(newDocs);
        setHasGenerated(true);

        const allReady = newDocs.every(d => d.status === 'ready');
        if (allReady && onAllGenerated) onAllGenerated(newDocs);
      }
    } catch (err) {
      console.error('Error generating documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadDoc = (doc) => {
    if (!doc.pdf_base64) return;
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${doc.pdf_base64}`;
    link.download = doc.filename || `document_${doc.doc_type}.pdf`;
    link.click();
  };

  const downloadAll = () => {
    docs.filter(d => d.status === 'ready' && d.pdf_base64).forEach((doc, i) => {
      setTimeout(() => downloadDoc(doc), i * 300);
    });
  };

  const previewDoc = (doc) => {
    if (!doc.pdf_base64) return;
    const url = `data:application/pdf;base64,${doc.pdf_base64}`;
    setPreviewUrl(url);
  };

  const readyCount = docs.filter(d => d.status === 'ready').length;
  const providers = [...new Set((plan?.products || []).map(p => p.provider).filter(Boolean))];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-white" />
          <div>
            <h3 className="text-white font-semibold text-sm">Генериране на документи</h3>
            <p className="text-slate-300 text-xs mt-0.5">
              {hasGenerated ? `${readyCount} документа готови` : 'Подготовка на заявления и декларации'}
            </p>
          </div>
        </div>
        {hasGenerated && readyCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={downloadAll}
            className="border-white/30 text-white hover:bg-white/10 text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Свали всички
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {!hasGenerated ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-600 text-sm font-medium mb-1">Документите не са генерирани</p>
            <p className="text-slate-400 text-xs mb-5">
              Ще бъдат генерирани: GDPR съгласие, преддоговорна информация
              {providers.length > 0 && ` и заявления за ${providers.join(', ')}`}.
            </p>
            <Button
              onClick={generateAll}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Генериране...</>
              ) : (
                <><RefreshCw className="w-4 h-4 mr-2" />Генерирай документи</>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.map((doc, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    doc.status === 'ready' ? 'bg-green-100' : doc.status === 'error' ? 'bg-red-100' : 'bg-slate-200'
                  }`}>
                    {doc.status === 'ready'  && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                    {doc.status === 'error'  && <AlertCircle  className="w-4 h-4 text-red-500" />}
                    {doc.status === 'generating' && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {DOC_TYPE_LABELS[doc.doc_type]?.label || doc.doc_type}
                      {doc.provider && doc.doc_type === 'application_form' && (
                        <span className="text-blue-600 ml-1">— {doc.provider}</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{doc.filename || '—'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                  {doc.signing_status === 'signed' && (
                    <Badge className="bg-green-100 text-green-700 text-xs px-2">Подписан</Badge>
                  )}
                  {doc.signing_status === 'pending' && (
                    <Badge className="bg-amber-100 text-amber-700 text-xs px-2">Чака подпис</Badge>
                  )}

                  {doc.status === 'ready' && doc.pdf_base64 && (
                    <>
                      <button
                        onClick={() => previewDoc(doc)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Преглед"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadDoc(doc)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Свали"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {doc.status === 'error' && (
                    <span className="text-xs text-red-500">Грешка</span>
                  )}
                </div>
              </div>
            ))}

            {/* Regenerate button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={generateAll}
                disabled={loading}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Регенерирай
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <span className="font-medium text-sm text-slate-800">Преглед на документ</span>
              <button
                onClick={() => setPreviewUrl(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >×</button>
            </div>
            <iframe src={previewUrl} className="flex-1 w-full" title="PDF Preview" />
          </div>
        </div>
      )}
    </div>
  );
}