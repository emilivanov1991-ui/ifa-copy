import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * GuideAvatar — Avatar with full state machine for voice-guided interactions.
 * 
 * States:
 * - idle: Default waiting state
 * - talking: Playing audio, mouth moving
 * - listening: Listening to user input
 * - thinking: Processing response
 * - celebrating: Success/completion
 * - concerned: Error/warning
 * - live_presenter: Live presentation mode
 * - idle_listening: Passive listening mode
 * - loading: Waiting for API response
 * - error: Critical error state
 * 
 * Props:
 *   state: string - current state from AVATAR_STATES
 *   isActive: bool — pulses when true
 *   tooltip: string
 *   onStateChange: function — callback for state changes
 *   size: 'small' | 'medium' | 'large'
 */

export const AVATAR_STATES = {
  IDLE: 'idle',
  TALKING: 'talking',
  LISTENING: 'listening',
  THINKING: 'thinking',
  CELEBRATING: 'celebrating',
  CONCERNED: 'concerned',
  LIVE_PRESENTER: 'live_presenter',
  IDLE_LISTENING: 'idle_listening',
  LOADING: 'loading',
  ERROR: 'error',
};

const STATE_CONFIG = {
  idle: { 
    gradient: 'from-slate-400 to-slate-500', 
    emoji: '😊',
    description: 'Ready to help',
  },
  talking: { 
    gradient: 'from-blue-500 to-indigo-600', 
    emoji: '🎙️',
    pulse: true,
    description: 'Speaking',
  },
  listening: { 
    gradient: 'from-blue-400 to-blue-500', 
    emoji: '👂',
    pulse: true,
    description: 'Listening',
  },
  thinking: { 
    gradient: 'from-amber-400 to-orange-500', 
    emoji: '🤔',
    animation: 'pulse',
    description: 'Thinking',
  },
  celebrating: { 
    gradient: 'from-green-400 to-emerald-500', 
    emoji: '🎉',
    animation: 'bounce',
    description: 'Success!',
  },
  concerned: { 
    gradient: 'from-red-400 to-red-500',    
    emoji: '⚠️',
    animation: 'shake',
    description: 'Warning',
  },
  live_presenter: { 
    gradient: 'from-violet-500 to-purple-600', 
    emoji: '🎬',
    pulse: true,
    description: 'Live mode',
  },
  idle_listening: { 
    gradient: 'from-teal-400 to-cyan-500', 
    emoji: '🎧',
    description: 'Passive listening',
  },
  loading: { 
    gradient: 'from-gray-400 to-gray-500', 
    emoji: '⏳',
    pulse: true,
    description: 'Loading...',
  },
  error: { 
    gradient: 'from-red-600 to-red-700', 
    emoji: '❌',
    animation: 'shake',
    description: 'Error',
  },
};

export default function GuideAvatar({ 
  state = 'idle', 
  isActive = false, 
  tooltip, 
  className,
  onStateChange,
  size = 'medium',
}) {
  const cfg = STATE_CONFIG[state] || STATE_CONFIG.idle;
  
  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const getAnimation = () => {
    if (isActive || cfg.pulse) {
      return { 
        scale: [1, 1.05, 1], 
        y: [0, -2, 0],
        rotate: [0, 1, -1, 0],
      };
    }
    if (cfg.animation === 'bounce') {
      return { y: [0, -4, 0] };
    }
    if (cfg.animation === 'shake') {
      return { rotate: [0, -5, 5, -5, 0] };
    }
    if (cfg.animation === 'pulse') {
      return { scale: [1, 1.08, 1] };
    }
    return { scale: 1, y: 0 };
  };

  const handleClick = () => {
    if (onStateChange) {
      const states = Object.values(AVATAR_STATES);
      const currentIndex = states.indexOf(state);
      const nextState = states[(currentIndex + 1) % states.length];
      onStateChange(nextState);
    }
  };

  return (
    <div className={cn('fixed top-4 left-4 z-50 group', className)}>
      <div className="relative">
        {/* Pulse ring when active or state has pulse */}
        <AnimatePresence>
          {(isActive || cfg.pulse) && (
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
            'rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg cursor-pointer select-none relative z-10',
            cfg.gradient,
            sizeClasses[size],
          )}
          animate={getAnimation()}
          transition={{ 
            duration: cfg.animation === 'shake' ? 0.5 : 0.7, 
            repeat: (isActive || cfg.pulse || cfg.animation) ? Infinity : 0,
          }}
          whileHover={{ scale: 1.1 }}
          onClick={handleClick}
        >
          <span className={cn('leading-none', size === 'large' ? 'text-3xl' : 'text-xl')}>
            {cfg.emoji}
          </span>
        </motion.div>

        {/* State indicator badge for error/concerned */}
        {state === 'error' || state === 'concerned' ? (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        ) : null}
      </div>

      {/* Tooltip on hover */}
      {tooltip && (
        <div className="absolute left-14 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          <div className="bg-slate-900/90 text-white text-xs rounded-lg px-3 py-1.5 shadow-lg">
            <p className="font-semibold">{cfg.description}</p>
            {tooltip && <p className="mt-1 text-slate-300">{tooltip}</p>}
          </div>
        </div>
      )}

      {/* State label (optional debug) */}
      {tooltip === 'debug' && (
        <div className="absolute left-14 bottom-0 text-xs text-slate-400 bg-white/80 px-2 py-0.5 rounded">
          {state}
        </div>
      )}
    </div>
  );
}