import { useEffect, useRef, useCallback, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Cache for loaded audio objects to avoid re-fetching
const audioCache = {};
// Cache for rulebook entries to avoid re-querying the DB
const rulebookCache = {};

/**
 * VoiceManager - The "Local-First" Voice Engine
 *
 * How to use:
 *   const { playStep, preloadStep, avatarState, isPlaying } = useVoiceManager('bg');
 *   // When entering a new step:
 *   playStep('planner_step_1');
 *   // To preload the next step in background:
 *   preloadStep('planner_step_2');
 */
export function useVoiceManager(languageCode = 'bg') {
  const [avatarState, setAvatarState] = useState('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const currentAudioRef = useRef(null);
  const rulebookRef = useRef(null);

  // Load entire rulebook for this language once on mount
  useEffect(() => {
    const cacheKey = `rulebook_${languageCode}`;
    if (rulebookCache[cacheKey]) {
      rulebookRef.current = rulebookCache[cacheKey];
      return;
    }
    base44.entities.VoiceRulebook.filter({ language_code: languageCode, is_active: true }, 'step_id', 200)
      .then(entries => {
        const map = {};
        entries.forEach(e => { map[e.step_id] = e; });
        rulebookCache[cacheKey] = map;
        rulebookRef.current = map;
      })
      .catch(() => {
        // Silently fail - voice is enhancement, not critical path
        rulebookRef.current = {};
      });
  }, [languageCode]);

  const stop = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    setIsPlaying(false);
    setAvatarState('idle');
    setCurrentText('');
  }, []);

  /**
   * Preload audio for a step_id into browser cache without playing.
   * Call this when user enters a step to get the NEXT step ready.
   */
  const preloadStep = useCallback((stepId) => {
    if (!rulebookRef.current) return;
    const entry = rulebookRef.current[stepId];
    if (!entry?.audio_url || audioCache[entry.audio_url]) return;
    const audio = new Audio(entry.audio_url);
    audio.preload = 'auto';
    audioCache[entry.audio_url] = audio;
  }, []);

  /**
   * Play audio for a step_id. Falls back to text display if no audio.
   * @param {string} stepId - The step_id key in VoiceRulebook
   * @param {function} onComplete - Optional callback when audio finishes
   */
  const playStep = useCallback((stepId, onComplete) => {
    if (!rulebookRef.current) return;
    const entry = rulebookRef.current[stepId];
    if (!entry) return;

    // Stop any currently playing audio
    stop();

    // Set avatar to talking state
    setAvatarState(entry.avatar_state || 'talking');
    setCurrentText(entry.text_fallback || '');
    setIsPlaying(true);

    if (!entry.audio_url) {
      // Text-only fallback: show text, call onComplete after estimated reading time
      const readingTime = (entry.duration_seconds || 3) * 1000;
      const timeout = setTimeout(() => {
        setIsPlaying(false);
        setAvatarState('listening');
        onComplete?.();
      }, readingTime);
      currentAudioRef.current = { pause: () => clearTimeout(timeout), currentTime: 0 };
      return;
    }

    // Use cached audio or create new
    let audio = audioCache[entry.audio_url];
    if (!audio) {
      audio = new Audio(entry.audio_url);
      audioCache[entry.audio_url] = audio;
    } else {
      audio.currentTime = 0;
    }

    audio.onended = () => {
      setIsPlaying(false);
      setAvatarState('listening');
      currentAudioRef.current = null;
      // Preload next step in background
      if (entry.preload_next_step_id) {
        preloadStep(entry.preload_next_step_id);
      }
      onComplete?.();
    };

    audio.onerror = () => {
      setIsPlaying(false);
      setAvatarState('listening');
      currentAudioRef.current = null;
      onComplete?.();
    };

    currentAudioRef.current = audio;
    audio.play().catch(() => {
      // Autoplay blocked by browser - show text only
      setIsPlaying(false);
      setAvatarState('listening');
      currentAudioRef.current = null;
    });

    // Preload the next step while this one plays
    if (entry.preload_next_step_id) {
      preloadStep(entry.preload_next_step_id);
    }
  }, [stop, preloadStep]);

  return { playStep, preloadStep, stop, avatarState, isPlaying, currentText };
}

export default useVoiceManager;