import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

/**
 * SigningStatusPoller
 * Polls SigningEvent entity for status updates after Evrotrust signing is initiated.
 * Props: signingEventId, signingUrl, onSigned(), onFailed()
 */
export default function SigningStatusPoller({ signingEventId, signingUrl, onSigned, onFailed }) {
  const [status, setStatus] = useState('pending'); // pending | sent | signed_successful | declined | expired | error
  const [attemptCount, setAttemptCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [emailFallbackSent, setEmailFallbackSent] = useState(false);
  
  // Master Prompt polling strategy:
  // Phase 1: Every 5 seconds for 2 minutes (24 polls)
  // Phase 2: Every 30 seconds for 10 minutes (20 polls)
  // Total: ~12 minutes max
  const PHASE1_POLLS = 24; // 2 minutes at 5s
  const PHASE2_POLLS = 20; // 10 minutes at 30s
  const MAX_POLLS = PHASE1_POLLS + PHASE2_POLLS;
  
  // Calculate current poll interval based on phase
  const currentInterval = attemptCount < PHASE1_POLLS ? 5000 : 30000;
  const currentPhase = attemptCount < PHASE1_POLLS ? 1 : 2;
  const isTimedOut = attemptCount >= MAX_POLLS;

  useEffect(() => {
    if (!signingEventId) return;
    if (['signed_successful', 'declined', 'expired', 'error'].includes(status)) return;
    if (isTimedOut && !emailFallbackSent) {
      // Send email fallback when timeout reached
      sendEmailFallback();
      setEmailFallbackSent(true);
      return;
    }

    const poll = async () => {
      try {
        const events = await base44.entities.SigningEvent.filter({ id: signingEventId });
        if (events.length > 0) {
          const ev = events[0];
          setStatus(ev.status);
          setAttemptCount(c => c + 1);
          setElapsedSeconds(c => c + (c < PHASE1_POLLS * 5 ? 5 : 30));

          if (ev.status === 'signed_successful') {
            onSigned?.();
          } else if (['declined', 'expired', 'error'].includes(ev.status)) {
            onFailed?.(ev.status);
          }
        }
      } catch (e) {
        console.error('Signing poll error:', e);
      }
    };

    if (attemptCount >= MAX_POLLS) return;
    const timer = setInterval(poll, currentInterval);
    poll(); // immediate first call
    return () => clearInterval(timer);
  }, [signingEventId, status, attemptCount, currentInterval, isTimedOut, emailFallbackSent]);

  const sendEmailFallback = async () => {
    try {
      // Trigger email with signing link fallback
      await base44.functions.invoke('notifyClientOnFollowUp', {
        journey_id: signingEventId, // assuming journey_id is passed or can be fetched
        reason: 'signing_timeout',
        signing_url: signingUrl,
      }).catch(err => console.error('Email fallback failed:', err));
    } catch (e) {
      console.error('Failed to send email fallback:', e);
    }
  };

  const statusConfig = {
    pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Изчакване...', desc: 'Сесията за подписване е създадена. Моля отворете линка по-долу.' },
    sent: { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Изпратено', desc: 'Документите са изпратени за подписване.' },
    signed_successful: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', label: 'Подписано успешно!', desc: 'Договорите са подписани. Преминаваме към плащане.' },
    declined: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Отказано', desc: 'Подписването беше отказано. Моля свържете се с нас.' },
    expired: { icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-50', label: 'Изтекло', desc: 'Сесията е изтекла. Моля повторете процеса.' },
    error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Грешка', desc: 'Настъпи техническа грешка. Моля свържете се с нас.' },
  };

  const cfg = statusConfig[status] || statusConfig.pending;
  const Icon = cfg.icon;
  const isSpinning = ['pending', 'sent'].includes(status);
  const isDone = status === 'signed_successful';
  const isFailed = ['declined', 'expired', 'error'].includes(status);

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
      <div className={cn("rounded-xl p-5 text-center mb-5", cfg.bg)}>
        <div className="flex justify-center mb-3">
          <Icon className={cn("w-12 h-12", cfg.color, isSpinning && "animate-spin")} />
        </div>
        <h3 className={cn("font-bold text-lg mb-1", cfg.color)}>{cfg.label}</h3>
        <p className="text-sm text-slate-600">{cfg.desc}</p>
      </div>

      {/* Pulse indicator while waiting */}
      {isSpinning && (
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-blue-400"
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
            <span className="text-xs text-slate-400 ml-1">Проверяваме статуса...</span>
          </div>
          
          {/* Progress indicator */}
          <div className="relative">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Фаза {currentPhase}</span>
              <span>{Math.round((attemptCount / MAX_POLLS) * 100)}% завършено</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${(attemptCount / MAX_POLLS) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>
                {attemptCount < PHASE1_POLLS 
                  ? `${PHASE1_POLLS - attemptCount} проверки на всеки 5с` 
                  : `${PHASE2_POLLS - (attemptCount - PHASE1_POLLS)} проверки на всеки 30с`
                }
              </span>
              <span>{elapsedSeconds}s изминало</span>
            </div>
          </div>
        </div>
      )}

      {/* Open signing URL */}
      {signingUrl && !isDone && (
        <a
          href={signingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors mb-3"
        >
          <ExternalLink className="w-4 h-4" />
          Отвори Evrotrust за подписване
        </a>
      )}

      {isDone && (
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full"
          onClick={() => onSigned?.()}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Продължи към плащане
        </Button>
      )}

      {isFailed && (
        <Button
          variant="outline"
          className="w-full rounded-full border-slate-300 text-slate-600"
          onClick={() => onFailed?.(status)}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Свържете се с консултант
        </Button>
      )}

      {isTimedOut && !emailFallbackSent && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-amber-800 font-medium mb-2">
            Времето за подписване изтече
          </p>
          <p className="text-xs text-amber-700 mb-3">
            Изпращаме Ви линк за подписване по имейл. Можете да подпишете по-късно.
          </p>
          <Button
            className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-full text-sm"
            onClick={() => {
              sendEmailFallback();
              setEmailFallbackSent(true);
            }}
          >
            Изпрати линк по имейл сега
          </Button>
        </div>
      )}

      {emailFallbackSent && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-center">
          <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-sm text-green-800 font-medium">
            Имейл с линк за подписване е изпратен!
          </p>
          <p className="text-xs text-green-700 mt-1">
            Проверете пощата си и подпишете когато можете.
          </p>
        </div>
      )}

      <p className="text-center text-xs text-slate-400 mt-3">
        {attemptCount > 0 
          ? `Последна проверка преди ${currentInterval / 1000}с · Фаза ${currentPhase}` 
          : 'Автоматично проверяваме статуса (5с за 2мин, после 30с за 10мин)'}
      </p>
    </div>
  );
}