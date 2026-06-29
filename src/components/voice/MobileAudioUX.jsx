import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Volume2, VolumeX, WifiOff, AlertTriangle,
  MessageSquare, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Mic permission states ────────────────────────────────────────────────────
// 'unknown' | 'requesting' | 'granted' | 'denied' | 'unavailable'

export function useMicPermission() {
  const [micState, setMicState] = useState('unknown');
  const streamRef = useRef(null);

  const requestMic = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicState('unavailable');
      return false;
    }
    setMicState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicState('granted');
      return true;
    } catch (err) {
      setMicState(err.name === 'NotAllowedError' ? 'denied' : 'unavailable');
      return false;
    }
  }, []);

  const releaseMic = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  // Check existing permission on mount without prompting
  useEffect(() => {
    navigator.permissions?.query({ name: 'microphone' }).then(result => {
      if (result.state === 'granted') setMicState('granted');
      else if (result.state === 'denied') setMicState('denied');
      result.onchange = () => {
        if (result.state === 'granted') setMicState('granted');
        else if (result.state === 'denied') setMicState('denied');
        else setMicState('unknown');
      };
    }).catch(() => { /* permissions API not available */ });
  }, []);

  return { micState, requestMic, releaseMic, stream: streamRef.current };
}

// ─── Push-to-talk button ──────────────────────────────────────────────────────
export function PushToTalkButton({
  micState,
  onRequestMic,
  onStartRecording,
  onStopRecording,
  isRecording = false,
  disabled = false,
  lang = 'bg',
}) {
  const isEN = lang === 'en';
  const holdTimerRef = useRef(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const progressRef = useRef(null);

  const handlePressStart = useCallback((e) => {
    e.preventDefault();
    if (disabled) return;

    if (micState !== 'granted') {
      onRequestMic?.();
      return;
    }

    // Start hold progress animation
    let progress = 0;
    progressRef.current = setInterval(() => {
      progress += 5;
      setHoldProgress(Math.min(progress, 100));
    }, 30);

    holdTimerRef.current = setTimeout(() => {
      onStartRecording?.();
    }, 300);
  }, [micState, disabled, onRequestMic, onStartRecording]);

  const handlePressEnd = useCallback(() => {
    clearTimeout(holdTimerRef.current);
    clearInterval(progressRef.current);
    setHoldProgress(0);
    if (isRecording) onStopRecording?.();
  }, [isRecording, onStopRecording]);

  const iconColor = micState === 'denied' ? 'text-red-500'
    : micState === 'unavailable' ? 'text-slate-400'
    : isRecording ? 'text-white'
    : 'text-blue-600';

  const bgColor = isRecording
    ? 'bg-red-500 shadow-red-200 shadow-lg'
    : micState === 'denied' || micState === 'unavailable'
      ? 'bg-slate-100 border-slate-300'
      : 'bg-blue-50 border-blue-300 hover:bg-blue-100 active:bg-blue-200';

  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.button
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        disabled={disabled || micState === 'unavailable'}
        whileTap={{ scale: 0.93 }}
        className={cn(
          'relative w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-200 select-none touch-none',
          bgColor
        )}
        aria-label={isRecording
          ? (isEN ? 'Release to stop' : 'Пусни за стоп')
          : (isEN ? 'Hold to speak' : 'Задръж за говор')}
      >
        {/* Hold progress ring */}
        {holdProgress > 0 && (
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
            <circle
              cx="28" cy="28" r="26"
              fill="none" stroke="#3b82f6" strokeWidth="3"
              strokeDasharray={`${holdProgress * 1.634} 163.4`}
              strokeLinecap="round"
            />
          </svg>
        )}

        {micState === 'requesting' ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"
          />
        ) : micState === 'denied' ? (
          <MicOff className={cn('w-5 h-5', iconColor)} />
        ) : (
          <Mic className={cn('w-5 h-5', iconColor, isRecording && 'animate-pulse')} />
        )}

        {/* Live recording dot */}
        {isRecording && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping" />
        )}
      </motion.button>

      <span className="text-[10px] text-slate-500 leading-none text-center">
        {micState === 'denied'
          ? (isEN ? 'Mic denied' : 'Отказан')
          : micState === 'unavailable'
            ? (isEN ? 'No mic' : 'Няма микр.')
            : isRecording
              ? (isEN ? 'Release to stop' : 'Пусни')
              : (isEN ? 'Hold to speak' : 'Задръж')}
      </span>
    </div>
  );
}

// ─── Mic denied banner ────────────────────────────────────────────────────────
export function MicDeniedBanner({ lang = 'bg', onDismiss }) {
  const isEN = lang === 'en';
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm"
    >
      <MicOff className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium text-amber-800">
          {isEN ? 'Microphone access denied' : 'Достъпът до микрофон е отказан'}
        </p>
        <p className="text-amber-700 text-xs mt-0.5">
          {isEN
            ? 'You can still type your answers below. To enable mic, check browser site settings.'
            : 'Можете да пишете отговорите си по-долу. За да включите микрофон, проверете настройките на сайта в браузъра.'}
        </p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-amber-500 hover:text-amber-700">
          <X className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );
}

// ─── Network / audio error state ──────────────────────────────────────────────
export function AudioErrorBanner({ error, lang = 'bg', onRetry, onDismiss }) {
  const isEN = lang === 'en';

  const messages = {
    network: {
      title: isEN ? 'No internet connection' : 'Няма интернет връзка',
      body: isEN ? 'Audio is paused. Check your connection and retry.' : 'Аудиото е спряно. Проверете връзката и опитайте отново.',
      icon: WifiOff,
      color: 'bg-slate-50 border-slate-300 text-slate-700',
      iconColor: 'text-slate-500',
    },
    audio: {
      title: isEN ? 'Audio could not play' : 'Аудиото не може да се изпълни',
      body: isEN ? 'The voice guide is unavailable. You can continue with the text.' : 'Гласовият асистент не е достъпен. Можете да продължите с текст.',
      icon: VolumeX,
      color: 'bg-orange-50 border-orange-200 text-orange-800',
      iconColor: 'text-orange-500',
    },
    tts: {
      title: isEN ? 'Voice generation failed' : 'Генерирането на глас неуспешно',
      body: isEN ? 'Using text fallback.' : 'Използва се текстов режим.',
      icon: AlertTriangle,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      iconColor: 'text-yellow-600',
    },
  };

  const cfg = messages[error] || messages.audio;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn('flex items-start gap-3 p-3 rounded-xl border text-sm', cfg.color)}
    >
      <Icon className={cn('h-4 w-4 shrink-0 mt-0.5', cfg.iconColor)} />
      <div className="flex-1">
        <p className="font-medium">{cfg.title}</p>
        <p className="text-xs mt-0.5 opacity-80">{cfg.body}</p>
      </div>
      <div className="flex gap-2 shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs font-medium underline opacity-80 hover:opacity-100"
          >
            {isEN ? 'Retry' : 'Опитай'}
          </button>
        )}
        {onDismiss && (
          <button onClick={onDismiss}>
            <X className="h-4 w-4 opacity-60 hover:opacity-100" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Text fallback input (when mic is denied) ─────────────────────────────────
export function TextFallbackInput({ lang = 'bg', onSubmit, placeholder }) {
  const isEN = lang === 'en';
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit?.(text.trim());
    setText('');
    setOpen(false);
  };

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        {isEN ? 'Type instead' : 'Напишете вместо това'}
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mt-2 flex gap-2 overflow-hidden"
          >
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={placeholder || (isEN ? 'Type your answer...' : 'Напишете отговора си...')}
              className="flex-1 text-sm rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              autoFocus
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-medium disabled:opacity-50 hover:bg-blue-700"
            >
              {isEN ? 'Send' : 'Изпрати'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Full mobile audio bar (combines everything) ──────────────────────────────
/**
 * MobileAudioBar — drop-in replacement for the VoiceBar in DiscoveryShell
 * Shows: mute toggle | caption | push-to-talk | error banners | mic denied fallback
 */
export default function MobileAudioBar({
  avatarState,
  caption,
  isMuted,
  onToggleMute,
  isLoading,
  lang = 'bg',
  // Push-to-talk props (optional — only shown if onStartRecording is provided)
  onStartRecording,
  onStopRecording,
  isRecording = false,
  // Error state: null | 'network' | 'audio' | 'tts'
  audioError = null,
  onRetryAudio,
  onDismissError,
}) {
  const isEN = lang === 'en';
  const { micState, requestMic } = useMicPermission();
  const [micBannerDismissed, setMicBannerDismissed] = useState(false);

  const showMicDenied = micState === 'denied' && !micBannerDismissed && onStartRecording;
  const showPTT = !!onStartRecording;

  return (
    <div className="space-y-2">
      {/* Mic denied banner */}
      <AnimatePresence>
        {showMicDenied && (
          <MicDeniedBanner
            lang={lang}
            onDismiss={() => setMicBannerDismissed(true)}
          />
        )}
      </AnimatePresence>

      {/* Audio error banner */}
      <AnimatePresence>
        {audioError && (
          <AudioErrorBanner
            error={audioError}
            lang={lang}
            onRetry={onRetryAudio}
            onDismiss={onDismissError}
          />
        )}
      </AnimatePresence>

      {/* Main bar */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
        {/* Mute toggle */}
        <button
          onClick={onToggleMute}
          className={cn(
            'shrink-0 w-9 h-9 rounded-full flex items-center justify-center border transition-colors',
            isMuted
              ? 'border-slate-200 bg-slate-100 hover:bg-slate-200'
              : 'border-blue-200 bg-blue-50 hover:bg-blue-100'
          )}
          title={isMuted ? (isEN ? 'Unmute' : 'Включи звук') : (isEN ? 'Mute' : 'Изключи звук')}
        >
          {isMuted
            ? <VolumeX className="h-4 w-4 text-slate-400" />
            : <Volume2 className="h-4 w-4 text-blue-600" />}
        </button>

        {/* Caption / loading */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="flex gap-1">
                {[0, 0.15, 0.3].map((delay, i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-blue-400"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay }}
                  />
                ))}
              </span>
              <span className="text-xs text-slate-500">
                {isEN ? 'Loading audio...' : 'Зарежда аудио...'}
              </span>
            </div>
          ) : isMuted ? (
            <p className="text-xs text-slate-400 italic">
              {isEN ? 'Audio muted — read the form fields' : 'Звукът е изключен — четете полетата'}
            </p>
          ) : caption ? (
            <p className="text-sm text-slate-700 leading-snug line-clamp-2">{caption}</p>
          ) : (
            <p className="text-xs text-slate-400">
              {avatarState === 'listening'
                ? (isEN ? 'Listening...' : 'Слуша...')
                : avatarState === 'thinking'
                  ? (isEN ? 'Thinking...' : 'Анализира...')
                  : isEN ? 'Ready' : 'Готов'}
            </p>
          )}
        </div>

        {/* Push-to-talk */}
        {showPTT && (
          <PushToTalkButton
            micState={micState}
            onRequestMic={requestMic}
            onStartRecording={onStartRecording}
            onStopRecording={onStopRecording}
            isRecording={isRecording}
            lang={lang}
          />
        )}
      </div>

      {/* Text fallback when mic denied */}
      {showPTT && micState === 'denied' && (
        <TextFallbackInput lang={lang} />
      )}
    </div>
  );
}