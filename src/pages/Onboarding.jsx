import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ArrowRight, CheckCircle, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Placeholder video URL — replace with the actual uploaded video URL
const INTRO_VIDEO_URL = '';

const STEPS_PREVIEW = [
  { icon: '📊', label: 'Финансов Планер', desc: 'Определяме вашите цели' },
  { icon: '🔍', label: 'Задълбочен Анализ', desc: 'Пълна финансова картина' },
  { icon: '📋', label: 'Персонализиран план', desc: 'Съобразен само с вас' },
];

export default function Onboarding() {
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      setIsAuthenticated(auth);
      setCheckingAuth(false);
      // If already logged in and video ended, can go straight to planner
    });
  }, []);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setVideoStarted(true);
    }
  };

  const handleVideoEnd = () => {
    setVideoEnded(true);
  };

  const handleContinue = () => {
    if (isAuthenticated) {
      navigate(createPageUrl('FinancialPlanner'));
    } else {
      base44.auth.redirectToLogin(window.location.origin + createPageUrl('FinancialPlanner'));
    }
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/258cedab0_output-onlinepngtools.png"
          alt="Integrity Financial Advisors"
          className="h-14 w-auto brightness-0 invert"
        />
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8 max-w-2xl"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Добре дошли в{' '}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            IFA
          </span>
        </h1>
        <p className="text-blue-200/80 text-lg font-light">
          Преди да започнем, вижте как работи процесът
        </p>
      </motion.div>

      {/* Video Player */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-3xl mb-8"
      >
        <div className="relative rounded-2xl overflow-hidden bg-slate-800 shadow-2xl shadow-blue-900/50 aspect-video">
          {INTRO_VIDEO_URL ? (
            <>
              <video
                ref={videoRef}
                src={INTRO_VIDEO_URL}
                className="w-full h-full object-cover"
                onEnded={handleVideoEnd}
                muted={isMuted}
                playsInline
              />

              {/* Play overlay */}
              {!videoStarted && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
                  onClick={handlePlay}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center"
                  >
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </motion.div>
                </div>
              )}

              {/* Mute toggle */}
              {videoStarted && (
                <button
                  onClick={() => setIsMuted(m => !m)}
                  className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              )}
            </>
          ) : (
            /* Placeholder when no video URL is set */
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
              <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Play className="w-8 h-8 text-blue-400 fill-blue-400 ml-1" />
              </div>
              <p className="text-slate-400 text-center text-sm max-w-xs">
                Видеото ще се появи тук след като качите URL-а в кода (INTRO_VIDEO_URL)
              </p>
              <Button
                onClick={() => setVideoEnded(true)}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Пропусни видеото →
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Steps preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 mb-10 w-full max-w-3xl"
      >
        {STEPS_PREVIEW.map((step, i) => (
          <div
            key={i}
            className="flex-1 flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <span className="text-2xl">{step.icon}</span>
            <div>
              <p className="text-white font-medium text-sm">{step.label}</p>
              <p className="text-blue-300/70 text-xs">{step.desc}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* CTA — shown after video ends OR immediately if no video */}
      <AnimatePresence>
        {(videoEnded || !INTRO_VIDEO_URL) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            {isAuthenticated ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Вие сте влезли в системата</span>
                </div>
                <Button
                  onClick={handleContinue}
                  size="lg"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-6 text-lg rounded-full hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  Започни финансовия планер
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <p className="text-blue-200/70 text-sm">
                  Регистрирайте се безплатно, за да запазите вашия план
                </p>
                <Button
                  onClick={handleContinue}
                  size="lg"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-6 text-lg rounded-full hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  Регистрация и начало
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-slate-500 text-xs">
                  Можете да се регистрирате с Google или имейл
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}