import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ArrowRight, CheckCircle, Volume2, VolumeX, Mail, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const INTRO_VIDEO_URL = '';

const STEPS_PREVIEW = [
  { icon: '📊', label: 'Финансов Планер', desc: 'Определяме вашите цели' },
  { icon: '🔍', label: 'Задълбочен Анализ', desc: 'Пълна финансова картина' },
  { icon: '📋', label: 'Персонализиран план', desc: 'Съобразен само с вас' },
];

// ── Auth Panel ────────────────────────────────────────────────────────────────
function AuthPanel({ onAuthenticated }) {
  const [view, setView]         = useState('main');   // main | email | otp
  const [email, setEmail]       = useState('');
  const [otp, setOtp]           = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [sessionId, setSessionId] = useState('');

  const NEXT_URL = window.location.origin + createPageUrl('FinancialPlanner');

  const handleGoogle = () => base44.auth.redirectToLogin(NEXT_URL, 'google');
  const handleApple  = () => base44.auth.redirectToLogin(NEXT_URL, 'apple');

  const handleSendOTP = async () => {
    setError('');
    if (!email.includes('@')) { setError('Въведете валиден имейл.'); return; }
    setLoading(true);
    try {
      const res = await base44.functions.invoke('sendOTP', { email });
      if (res.data?.success) {
        setSessionId(res.data.otp_session_id);
        setView('otp');
      } else {
        setError(res.data?.error || 'Грешка при изпращане на кода.');
      }
    } catch (e) {
      setError('Грешка при изпращане на кода.');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setError('');
    if (otp.length !== 6) { setError('Въведете 6-цифрен код.'); return; }
    setLoading(true);
    try {
      const res = await base44.functions.invoke('verifyOTP', { email, otp_code: otp });
      if (res.data?.success) {
        onAuthenticated();
      } else {
        setError(res.data?.error || 'Невалиден код.');
      }
    } catch (e) {
      setError('Грешка при проверка на кода.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      <p className="text-blue-200/70 text-sm text-center">
        Регистрирайте се безплатно, за да запазите вашия план
      </p>

      <AnimatePresence mode="wait">
        {view === 'main' && (
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="w-full flex flex-col gap-3"
          >
            {/* Google */}
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white text-slate-800 font-medium px-6 py-3.5 rounded-xl hover:bg-slate-100 transition-all shadow-lg"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Продължи с Google
            </button>

            {/* Apple */}
            <button
              onClick={handleApple}
              className="w-full flex items-center justify-center gap-3 bg-black text-white font-medium px-6 py-3.5 rounded-xl hover:bg-slate-900 transition-all shadow-lg"
            >
              <svg className="w-5 h-5 fill-white shrink-0" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Продължи с Apple
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-slate-500 text-xs">или</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Email OTP */}
            <button
              onClick={() => setView('email')}
              className="w-full flex items-center justify-center gap-2 border border-white/20 text-white font-medium px-6 py-3.5 rounded-xl hover:bg-white/10 transition-all"
            >
              <Mail className="w-4 h-4" />
              Продължи с имейл
            </button>

            <p className="text-slate-500 text-xs text-center">
              С продължаването приемате нашите условия за ползване и политика за поверителност
            </p>
          </motion.div>
        )}

        {view === 'email' && (
          <motion.div
            key="email"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="w-full flex flex-col gap-3"
          >
            <button onClick={() => { setView('main'); setError(''); }} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors self-start">
              <ChevronLeft className="w-4 h-4" /> Назад
            </button>
            <p className="text-white font-medium">Въведете вашия имейл</p>
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-400"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Изпрати код'}
            </Button>
          </motion.div>
        )}

        {view === 'otp' && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="w-full flex flex-col gap-3"
          >
            <button onClick={() => { setView('email'); setError(''); setOtp(''); }} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors self-start">
              <ChevronLeft className="w-4 h-4" /> Назад
            </button>
            <p className="text-white font-medium">Въведете кода от имейла</p>
            <p className="text-slate-400 text-sm">Изпратихме 6-цифрен код на <span className="text-blue-300">{email}</span></p>
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && handleVerifyOTP()}
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-400 text-center text-2xl tracking-widest font-mono"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button
              onClick={handleVerifyOTP}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Потвърди'}
            </Button>
            <button onClick={handleSendOTP} disabled={loading} className="text-slate-400 hover:text-white text-sm text-center transition-colors">
              Изпрати нов код
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Onboarding() {
  const [videoEnded, setVideoEnded]     = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [isMuted, setIsMuted]           = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      setIsAuthenticated(auth);
      setCheckingAuth(false);
    });
  }, []);

  const handlePlay = () => {
    if (videoRef.current) { videoRef.current.play(); setVideoStarted(true); }
  };

  const handleAuthenticated = () => {
    navigate(createPageUrl('FinancialPlanner'));
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/258cedab0_output-onlinepngtools.png"
          alt="Integrity Financial Advisors"
          className="h-14 w-auto brightness-0 invert"
        />
      </motion.div>

      {/* Heading */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-8 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Добре дошли в{' '}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">IFA</span>
        </h1>
        <p className="text-blue-200/80 text-lg font-light">Преди да започнем, вижте как работи процесът</p>
      </motion.div>

      {/* Video Player */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="w-full max-w-3xl mb-8">
        <div className="relative rounded-2xl overflow-hidden bg-slate-800 shadow-2xl shadow-blue-900/50 aspect-video">
          {INTRO_VIDEO_URL ? (
            <>
              <video ref={videoRef} src={INTRO_VIDEO_URL} className="w-full h-full object-cover" onEnded={() => setVideoEnded(true)} muted={isMuted} playsInline />
              {!videoStarted && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer" onClick={handlePlay}>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </motion.div>
                </div>
              )}
              {videoStarted && (
                <button onClick={() => setIsMuted(m => !m)} className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
              <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Play className="w-8 h-8 text-blue-400 fill-blue-400 ml-1" />
              </div>
              <p className="text-slate-400 text-center text-sm max-w-xs">Видеото ще се появи тук след като качите URL-а (INTRO_VIDEO_URL)</p>
              <Button onClick={() => setVideoEnded(true)} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                Пропусни видеото →
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Steps preview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 mb-10 w-full max-w-3xl">
        {STEPS_PREVIEW.map((step, i) => (
          <div key={i} className="flex-1 flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
            <span className="text-2xl">{step.icon}</span>
            <div>
              <p className="text-white font-medium text-sm">{step.label}</p>
              <p className="text-blue-300/70 text-xs">{step.desc}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* CTA */}
      <AnimatePresence>
        {(videoEnded || !INTRO_VIDEO_URL) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-sm">
            {isAuthenticated ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Вие сте влезли в системата</span>
                </div>
                <Button
                  onClick={() => navigate(createPageUrl('FinancialPlanner'))}
                  size="lg"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-6 text-lg rounded-full hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  Започни финансовия планер
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            ) : (
              <AuthPanel onAuthenticated={handleAuthenticated} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}