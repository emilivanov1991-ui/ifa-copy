import React from 'react';
import { motion } from 'framer-motion';

/**
 * LanguageSelectionStep
 * 
 * Fullscreen language picker shown before discovery starts,
 * if language_code is not yet set on the journey.
 * 
 * Props:
 *  - onSelect(languageCode) — called with 'bg' or 'en'
 */

export default function LanguageSelectionStep({ onSelect }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 flex items-center justify-center p-6">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative text-center max-w-sm w-full"
      >
        {/* Logo */}
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/258cedab0_output-onlinepngtools.png"
          alt="IFA"
          className="h-12 w-auto mx-auto mb-12 brightness-0 invert opacity-80"
        />

        <h2 className="text-white text-2xl font-semibold mb-2">Изберете език</h2>
        <p className="text-blue-200 text-sm mb-2">Choose your language</p>
        <div className="w-12 h-0.5 bg-blue-500/40 mx-auto mb-10" />

        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect('bg')}
            className="flex flex-col items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-2xl p-6 transition-all text-white"
          >
            <span className="text-4xl">🇧🇬</span>
            <span className="font-semibold text-lg">Български</span>
            <span className="text-blue-200 text-xs">Продължи на български</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect('en')}
            className="flex flex-col items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-2xl p-6 transition-all text-white"
          >
            <span className="text-4xl">🇬🇧</span>
            <span className="font-semibold text-lg">English</span>
            <span className="text-blue-200 text-xs">Continue in English</span>
          </motion.button>
        </div>

        <p className="text-blue-300/50 text-xs mt-8">
          Можете да смените езика по-късно от настройките.
          <br />You can change the language later in settings.
        </p>
      </motion.div>
    </div>
  );
}