import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * GuideAvatar — fixed circle in top-left corner that guides the client.
 * Props:
 *   state: 'idle' | 'talking' | 'thinking' | 'celebrating' | 'concerned' | 'listening'
 *   isActive: bool — pulses when true (e.g. playing audio)
 *   tooltip: string — short hint shown on hover
 *   className: string
 */

const STATE_CONFIG = {
  idle:        { gradient: 'from-slate-400 to-slate-500', emoji: '😊' },
  talking:     { gradient: 'from-blue-500 to-indigo-600', emoji: '🎙️' },
  listening:   { gradient: 'from-slate-400 to-slate-500', emoji: '👂' },
  thinking:    { gradient: 'from-amber-400 to-orange-500', emoji: '🤔' },
  celebrating: { gradient: 'from-green-400 to-emerald-500', emoji: '🎉' },
  concerned:   { gradient: 'from-red-400 to-red-500',    emoji: '⚠️' },
};

export default function GuideAvatar({ state = 'idle', isActive = false, tooltip, className }) {
  const cfg = STATE_CONFIG[state] || STATE_CONFIG.idle;

  return (
    <div className={cn('fixed top-4 left-4 z-50 group', className)}>
      <div className="relative">
        {/* Pulse ring when active */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              key="pulse"
              className={cn(
                'absolute -inset-1.5 rounded-full bg-gradient-to-br opacity-60',
                cfg.gradient,
              )}
              animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </AnimatePresence>

        {/* Avatar circle */}
        <motion.div
          className={cn(
            'w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg cursor-pointer select-none relative z-10',
            cfg.gradient,
          )}
          animate={isActive ? { scale: [1, 1.05, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }}
          transition={{ duration: 0.7, repeat: isActive ? Infinity : 0 }}
          whileHover={{ scale: 1.1 }}
        >
          <span className="text-xl leading-none">{cfg.emoji}</span>
        </motion.div>
      </div>

      {/* Tooltip on hover */}
      {tooltip && (
        <div className="absolute left-14 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          <div className="bg-slate-900/90 text-white text-xs rounded-lg px-3 py-1.5 shadow-lg">
            {tooltip}
          </div>
        </div>
      )}
    </div>
  );
}