import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * AvatarFrame - The persistent visual avatar shell
 *
 * Modes:
 *   - "scripted" (Discovery): Shows static/animated avatar with pre-recorded prompts
 *   - "live" (Presentation): Shows live AI avatar (D-ID / future WebGL)
 *
 * Props:
 *   avatarState: 'talking' | 'listening' | 'thinking' | 'celebrating' | 'concerned' | 'idle'
 *   isPlaying: boolean
 *   currentText: string - caption text shown below avatar
 *   mode: 'scripted' | 'live'
 *   isMuted: boolean
 *   onMuteToggle: function
 *   className: string
 */
export default function AvatarFrame({
  avatarState = 'idle',
  isPlaying = false,
  currentText = '',
  mode = 'scripted',
  isMuted = false,
  onMuteToggle,
  className,
  compact = false,
}) {
  const stateColors = {
    talking: 'from-blue-500 to-indigo-600',
    listening: 'from-slate-400 to-slate-500',
    thinking: 'from-amber-400 to-orange-500',
    celebrating: 'from-green-400 to-emerald-500',
    concerned: 'from-red-400 to-red-500',
    idle: 'from-slate-300 to-slate-400',
  };

  const stateEmoji = {
    talking: '🎙️',
    listening: '👂',
    thinking: '🤔',
    celebrating: '🎉',
    concerned: '⚠️',
    idle: '😊',
  };

  const avatarSize = compact ? 'w-14 h-14' : 'w-20 h-20';
  const ringSize = compact ? 'w-16 h-16' : 'w-24 h-24';

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {/* Avatar Circle */}
      <div className="relative">
        {/* Pulsing ring when talking */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={cn(
                'absolute inset-0 rounded-full bg-gradient-to-br',
                stateColors[avatarState] || stateColors.talking,
                ringSize,
                '-translate-x-1 -translate-y-1'
              )}
            />
          )}
        </AnimatePresence>

        {/* Main avatar circle */}
        <motion.div
          className={cn(
            'rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg relative z-10',
            stateColors[avatarState] || stateColors.idle,
            avatarSize
          )}
          animate={
            isPlaying
              ? { scale: [1, 1.04, 1], y: [0, -2, 0] }
              : { scale: 1, y: 0 }
          }
          transition={{ duration: 0.6, repeat: isPlaying ? Infinity : 0 }}
        >
          {mode === 'live' ? (
            // Future: D-ID iframe or WebGL canvas goes here
            <span className="text-2xl">{stateEmoji[avatarState]}</span>
          ) : (
            <span className={compact ? 'text-xl' : 'text-3xl'}>
              {stateEmoji[avatarState]}
            </span>
          )}
        </motion.div>

        {/* Mode badge */}
        {mode === 'live' && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-20">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        )}
      </div>

      {/* Status indicator */}
      {!compact && (
        <div className="flex items-center gap-1.5">
          {isPlaying ? (
            <Volume2 className="w-3 h-3 text-blue-500" />
          ) : (
            <div className="w-3 h-3" />
          )}
          <span className={cn(
            'text-xs font-medium',
            avatarState === 'talking' ? 'text-blue-600' :
            avatarState === 'listening' ? 'text-slate-500' :
            avatarState === 'thinking' ? 'text-amber-600' :
            avatarState === 'celebrating' ? 'text-green-600' :
            avatarState === 'concerned' ? 'text-red-500' :
            'text-slate-400'
          )}>
            {avatarState === 'talking' && 'Говори...'}
            {avatarState === 'listening' && 'Слуша'}
            {avatarState === 'thinking' && 'Анализира...'}
            {avatarState === 'celebrating' && 'Отлично!'}
            {avatarState === 'concerned' && 'Важно'}
            {avatarState === 'idle' && 'Готов'}
          </span>
        </div>
      )}

      {/* Caption text */}
      <AnimatePresence>
        {!compact && currentText && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="max-w-[180px] text-center"
          >
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "{currentText}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mute button */}
      {onMuteToggle && (
        <button
          onClick={onMuteToggle}
          className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          title={isMuted ? 'Включи звук' : 'Изключи звук'}
        >
          {isMuted ? (
            <VolumeX className="w-3 h-3 text-slate-500" />
          ) : (
            <Volume2 className="w-3 h-3 text-slate-500" />
          )}
        </button>
      )}
    </div>
  );
}