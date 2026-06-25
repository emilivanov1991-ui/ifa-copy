import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import {
  FileText, ExternalLink, CheckCircle2, XCircle, Clock,
  Loader2, RefreshCw, AlertTriangle, Eye, ChevronDown, ChevronUp
} from 'lucide-react';

const MAX_ATTEMPTS = 3;
const VALIDITY_HOURS = 24;

// ── Document Preview Card ─────────────────────────────────────────────────────
function DocumentPreview({ plan, analysis }) {
  const [open, setOpen] = useState(false);
  const clientName = analysis
    ? `${analysis.client_first_name || ''} ${analysis.client_last_name || ''}`.trim()
    : 'Клиент';

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-5">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-slate-900">Преглед на документите</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {(plan?.products?.filter(p => p.is_active)?.length || 0) + 2} документа
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {/* Always present docs */}
              {[
                { name: 'Договор за финансово консултиране', type: 'PDF', required: true },
                { name: 'GDPR Декларация за съгласие', type: 'PDF', required: true },
              ].map((doc, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{doc.name}</p>
                      <p className="text-xs text-slate-400">{doc.type} · Задължителен</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Per-product docs */}
              {plan?.products?.filter(p => p.is_active).map((prod, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        Застрахователен договор — {prod.product_name}
                      </p>
                      <p className="text-xs text-slate-400">{prod.provider} · PDF</p>
                    </div>
                  </div>
                </div>
              ))}

              <p className="text-xs text-slate-400 pt-1">
                Подписвате като: <span className="font-medium text-slate-600">{clientName}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Signing Status Poller (inline, minimal) ───────────────────────────────────
function StatusPoller({ signingEventId, signingUrl, onSigned, onFailed }) {
  const [status, setStatus]       = useState('pending');
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!signingEventId) return;
    if (['signed_successful', 'declined', 'expired', 'error'].includes(status)) return;

    const interval = pollCount < 24 ? 5000 : 30000; // Phase1: 5s x24, Phase2: 30s x20
    if (pollCount >= 44) return;

    const timer = setInterval(async () => {
      try {
        const events = await base44.entities.SigningEvent.filter({ id: signingEventId });
        if (events.length > 0) {
          const ev = events[0];
          setStatus(ev.status);
          setPollCount(c => c + 1);
          if (ev.status === 'signed_successful') onSigned?.();
          else if (['declined', 'expired', 'error'].includes(ev.status)) onFailed?.(ev.status);
        }
      } catch (e) { console.error('Poll error:', e); }
    }, interval);

    return () => clearInterval(timer);
  }, [signingEventId, status, pollCount]);

  const isDone   = status === 'signed_successful';
  const isFailed = ['declined', 'expired', 'error'].includes(status);

  return (
    <div className="space-y-4">
      {/* Status pill */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium w-fit mx-auto ${
        isDone   ? 'bg-green-100 text-green-700' :
        isFailed ? 'bg-red-100 text-red-700' :
                   'bg-blue-100 text-blue-700'
      }`}>
        {isDone   ? <CheckCircle2 className="w-4 h-4" /> :
         isFailed ? <XCircle className="w-4 h-4" /> :
                    <Loader2 className="w-4 h-4 animate-spin" />}
        {isDone   ? 'Подписано успешно!' :
         isFailed ? (status === 'declined' ? 'Подписването е отказано' : status === 'expired' ? 'Сесията е изтекла' : 'Грешка при подписване') :
                    'Изчакване на подпис...'}
      </div>

      {/* Pulse dots while waiting */}
      {!isDone && !isFailed && (
        <div className="flex justify-center gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-400"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </div>
      )}

      {/* Open Evrotrust link */}
      {signingUrl && !isDone && (
        <a
          href={signingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Отвори Evrotrust за подписване
        </a>
      )}

      {isDone && (
        <Button onClick={() => onSigned?.()} className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full">
          <CheckCircle2 className="w-4 h-4 mr-2" /> Продължи към плащане
        </Button>
      )}

      {!isDone && !isFailed && (
        <p className="text-xs text-slate-400 text-center">
          Автоматично проверяваме статуса на всеки {pollCount < 24 ? '5' : '30'} секунди
        </p>
      )}
    </div>
  );
}

// ── Main SigningFlow Component ─────────────────────────────────────────────────
export default function SigningFlow({ journeyId, applicationId, plan, analysis, onSigned, onMaxAttempts }) {
  const [screen, setScreen]         = useState('preview'); // preview | signing | declined | expired | max_attempts
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [attempts, setAttempts]     = useState(0);
  const [signingUrl, setSigningUrl] = useState(null);
  const [signingEventId, setSigningEventId] = useState(null);
  const [validUntil, setValidUntil] = useState(null);

  const attemptsLeft = MAX_ATTEMPTS - attempts;
  const maxReached   = attempts >= MAX_ATTEMPTS;

  const signerName = analysis
    ? `${analysis.client_first_name || ''} ${analysis.client_last_name || ''}`.trim()
    : '';
  const signerEgn  = analysis?.client_egn || '';

  const handleStartSigning = async () => {
    if (maxReached) return;
    setLoading(true);
    setError(null);

    const currentAttempt = attempts + 1;
    setAttempts(currentAttempt);

    try {
      // Build document URLs (placeholder — replace with real generated PDF URLs)
      const documentUrls = [
        `${window.location.origin}/api/docs/consulting-contract/${journeyId}`,
        `${window.location.origin}/api/docs/gdpr/${journeyId}`,
      ];

      const res = await base44.functions.invoke('createEvrotrustSigningSession', {
        journey_id:     journeyId,
        application_id: applicationId,
        signer_name:    signerName,
        signer_egn:     signerEgn,
        document_urls:  documentUrls,
        attempt_number: currentAttempt,
      });

      if (res?.data?.signing_url) {
        setSigningUrl(res.data.signing_url);
        setSigningEventId(res.data.signing_event_id);
        // 24h validity
        setValidUntil(new Date(Date.now() + VALIDITY_HOURS * 60 * 60 * 1000).toISOString());
        setScreen('signing');
      } else {
        throw new Error(res?.data?.error || 'Грешка при създаване на сесия');
      }
    } catch (e) {
      console.error('Signing session error:', e);
      setError(e.message || 'Грешка при стартиране на подписването');
      if (currentAttempt >= MAX_ATTEMPTS) {
        setScreen('max_attempts');
        onMaxAttempts?.();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSigningFailed = (reason) => {
    if (reason === 'declined') {
      setScreen('declined');
    } else if (reason === 'expired') {
      setScreen('expired');
    } else {
      setScreen('declined');
    }
  };

  const handleRetry = () => {
    if (maxReached) {
      setScreen('max_attempts');
      onMaxAttempts?.();
      return;
    }
    setSigningUrl(null);
    setSigningEventId(null);
    setError(null);
    setScreen('preview');
  };

  // ── Max attempts reached ─────────────────────────────────────────────────
  if (screen === 'max_attempts') {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-5 text-white text-center">
          <XCircle className="w-10 h-10 mx-auto mb-2" />
          <h3 className="font-bold text-lg">Подписването не успя</h3>
          <p className="text-red-200 text-sm">Достигнат е лимитът от {MAX_ATTEMPTS} опита</p>
        </div>
        <div className="p-6 text-center">
          <p className="text-slate-600 mb-6">
            Консултант ще се свърже с вас до <strong>24 часа</strong>, за да завърши процеса по алтернативен начин.
          </p>
          <Button onClick={() => onMaxAttempts?.()} className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl">
            Разбрах — свържете се с мен
          </Button>
        </div>
      </motion.div>
    );
  }

  // ── Declined ─────────────────────────────────────────────────────────────
  if (screen === 'declined') {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 text-white text-center">
          <XCircle className="w-10 h-10 mx-auto mb-2" />
          <h3 className="font-bold text-lg">Подписването е отказано</h3>
        </div>
        <div className="p-6">
          <p className="text-slate-600 mb-2 text-center">Отказахте подписването на документите.</p>
          {attemptsLeft > 0 && (
            <p className="text-slate-500 text-sm text-center mb-6">
              Можете да опитате отново. Остават <strong>{attemptsLeft}</strong> опита.
            </p>
          )}
          <div className="flex flex-col gap-3">
            {attemptsLeft > 0 && (
              <Button onClick={handleRetry} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                <RefreshCw className="w-4 h-4 mr-2" /> Опитай отново ({attemptsLeft} остават)
              </Button>
            )}
            <Button onClick={() => onMaxAttempts?.('declined')} variant="outline" className="w-full border-slate-300 rounded-xl">
              Свържете се с консултант
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Expired ──────────────────────────────────────────────────────────────
  if (screen === 'expired') {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-slate-500 to-slate-600 p-5 text-white text-center">
          <Clock className="w-10 h-10 mx-auto mb-2" />
          <h3 className="font-bold text-lg">Сесията е изтекла</h3>
          <p className="text-slate-300 text-sm">Валидността на {VALIDITY_HOURS} часа изтече</p>
        </div>
        <div className="p-6">
          <p className="text-slate-600 mb-6 text-center">
            Трябва да стартирате нова сесия за подписване.
            {attemptsLeft > 0 && ` Остават ${attemptsLeft} опита.`}
          </p>
          <div className="flex flex-col gap-3">
            {attemptsLeft > 0 && (
              <Button onClick={handleRetry} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                <RefreshCw className="w-4 h-4 mr-2" /> Нова сесия за подписване
              </Button>
            )}
            {attemptsLeft === 0 && (
              <Button onClick={() => onMaxAttempts?.('expired')} className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl">
                Свържете се с консултант
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Active signing ────────────────────────────────────────────────────────
  if (screen === 'signing') {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5" />
            <h3 className="font-bold">Подписване с Evrotrust</h3>
          </div>
          <p className="text-blue-200 text-xs">
            Опит {attempts} от {MAX_ATTEMPTS} · Валидно {VALIDITY_HOURS}ч
            {validUntil && ` · до ${new Date(validUntil).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}`}
          </p>
        </div>
        <div className="p-6">
          <StatusPoller
            signingEventId={signingEventId}
            signingUrl={signingUrl}
            onSigned={onSigned}
            onFailed={handleSigningFailed}
          />
          {attempts < MAX_ATTEMPTS && (
            <button
              onClick={handleRetry}
              className="w-full mt-4 text-xs text-slate-400 hover:text-slate-600 transition-colors py-2"
            >
              Откажи и опитай отново
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // ── Preview (default) ─────────────────────────────────────────────────────
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-5 h-5" />
          <h3 className="font-bold">Подписване на документи</h3>
        </div>
        <p className="text-blue-200 text-xs">Квалифициран електронен подпис чрез Evrotrust</p>
      </div>

      <div className="p-6">
        {/* Attempt indicator (shown on retry) */}
        {attempts > 0 && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700">
              Повторен опит {attempts + 1} от {MAX_ATTEMPTS}. Остават {attemptsLeft - 1} след този.
            </p>
          </div>
        )}

        {/* Document preview */}
        <DocumentPreview plan={plan} analysis={analysis} />

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
          <ul className="text-xs text-blue-700 space-y-1.5">
            <li>• Ще получите известие в приложението Evrotrust</li>
            <li>• Прегледайте и подпишете всеки документ</li>
            <li>• Сесията е валидна {VALIDITY_HOURS} часа</li>
            <li>• Максимум {MAX_ATTEMPTS} опита за подписване</li>
          </ul>
        </div>

        {error && (
          <div className="flex items-start gap-2 mb-4 p-3 bg-red-50 rounded-xl border border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <Button
          onClick={handleStartSigning}
          disabled={loading || maxReached || !signerEgn}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-4 text-base font-semibold disabled:opacity-50"
        >
          {loading
            ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Стартиране...</>
            : <><FileText className="w-5 h-5 mr-2" />Подпиши с Evrotrust</>
          }
        </Button>

        {!signerEgn && (
          <p className="text-xs text-amber-600 text-center mt-2">
            ⚠️ Липсва ЕГН — необходимо за Evrotrust подписване
          </p>
        )}
      </div>
    </motion.div>
  );
}