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

  // In-memory TTS cache: text → audio_url (avoids re-generating same phrase)
  const ttsUrlCache = useRef({});

  /**
   * Generate TTS for a text string via evaluateInteractionLogic, cache and play it.
   */
  const playTTS = useCallback((text, avatarSt, onComplete) => {
    if (!text) { onComplete?.(); return; }

    const cacheKey = `${languageCode}:${text}`;
    const cachedUrl = ttsUrlCache.current[cacheKey];

    if (cachedUrl) {
      playUrl(cachedUrl, avatarSt || 'talking', null, onComplete);
      return;
    }

    setAvatarState('thinking');
    base44.functions.invoke('evaluateInteractionLogic', {
      flowType: 'planner',
      currentStepId: 0,
      event: 'step_enter',
      contextData: { languageCode, __tts_text: text },
    }).then(res => {
      const url = res?.data?.audio_url;
      if (url) {
        ttsUrlCache.current[cacheKey] = url;
        playUrl(url, avatarSt || 'talking', null, onComplete);
      } else {
        setIsPlaying(false);
        setAvatarState('listening');
        onComplete?.();
      }
    }).catch(() => {
      setIsPlaying(false);
      setAvatarState('listening');
      onComplete?.();
    });
  }, [languageCode, playUrl]);

  /**
   * Play a URL directly (shared logic).
   */
  const playUrl = useCallback((url, avatarSt, nextStepId, onComplete) => {
    let audio = audioCache[url];
    if (!audio) { audio = new Audio(url); audioCache[url] = audio; }
    else { audio.currentTime = 0; }
    setAvatarState(avatarSt || 'talking');
    setIsPlaying(true);
    audio.onended = () => {
      setIsPlaying(false); setAvatarState('listening');
      currentAudioRef.current = null;
      if (nextStepId) preloadStep(nextStepId);
      onComplete?.();
    };
    audio.onerror = () => {
      setIsPlaying(false); setAvatarState('listening');
      currentAudioRef.current = null; onComplete?.();
    };
    currentAudioRef.current = audio;
    audio.play().catch(() => {
      setIsPlaying(false); setAvatarState('listening'); currentAudioRef.current = null;
    });
  }, [preloadStep]);

  /**
   * Play audio for a step_id.
   * 1. If rulebook entry has audio_url → play directly.
   * 2. If rulebook entry has text_fallback → call evaluateInteractionLogic for TTS.
   * 3. If no rulebook entry at all → call evaluateInteractionLogic by step_id directly.
   */
  const playStep = useCallback((stepId, onComplete) => {
    stop();

    // Determine flowType and stepNumber from stepId (e.g. "planner_step_3" → planner, 3)
    const match = stepId.match(/^(planner|analysis)_step_(\d+)$/);
    const flowType = match ? match[1] : 'planner';
    const currentStepId = match ? parseInt(match[2]) : 0;

    const entry = rulebookRef.current?.[stepId];

    // Case 1: Pre-recorded audio in rulebook
    if (entry?.audio_url) {
      setCurrentText(entry.text_fallback || '');
      playUrl(entry.audio_url, entry.avatar_state, entry.preload_next_step_id, onComplete);
      if (entry.preload_next_step_id) preloadStep(entry.preload_next_step_id);
      return;
    }

    // Case 2 & 3: Generate via backend (handles both text_fallback TTS and full DB lookup)
    setAvatarState('thinking');
    setIsPlaying(true);
    if (entry?.text_fallback) setCurrentText(entry.text_fallback);

    base44.functions.invoke('evaluateInteractionLogic', {
      flowType,
      currentStepId,
      event: 'step_enter',
      contextData: { languageCode },
    }).then(res => {
      const data = res?.data;
      if (data?.audio_url) {
        if (data.text) setCurrentText(data.text);
        // Cache audio_url back into rulebook so next time it plays instantly
        if (entry) entry.audio_url = data.audio_url;
        playUrl(data.audio_url, data.avatar_state || 'talking', null, onComplete);
      } else if (data?.text) {
        // Got text but no audio — use playTTS
        setCurrentText(data.text);
        playTTS(data.text, data.avatar_state || 'talking', onComplete);
      } else {
        setIsPlaying(false); setAvatarState('idle'); onComplete?.();
      }
    }).catch(() => {
      setIsPlaying(false); setAvatarState('idle'); onComplete?.();
    });
  }, [stop, playUrl, preloadStep, playTTS, languageCode]);

  return { playStep, preloadStep, stop, avatarState, isPlaying, currentText };
}

export default useVoiceManager;