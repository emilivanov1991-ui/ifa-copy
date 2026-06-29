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
  const prefetchStepRef = useRef(null);

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
        // Eagerly prefetch step 1 for both flows so first interaction is instant
        setTimeout(() => {
          prefetchStepRef.current?.('planner_step_1');
          prefetchStepRef.current?.('analysis_step_1');
        }, 500);
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
    audio.onerror = (e) => {
      setIsPlaying(false); setAvatarState('listening');
      currentAudioRef.current = null;
      // Surface error type for consumers — 'network' if offline, else 'audio'
      const errorType = navigator.onLine ? 'audio' : 'network';
      onComplete?.(errorType);
    };
    currentAudioRef.current = audio;
    audio.play().catch(() => {
      setIsPlaying(false); setAvatarState('listening'); currentAudioRef.current = null;
    });
  }, [preloadStep]);

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

  // Keep ref in sync so the rulebook useEffect can call prefetchStep
  useEffect(() => { prefetchStepRef.current = prefetchStep; });

  // Cache for pre-fetched TTS per stepId (stepId → audio_url)
  const stepAudioCache = useRef({});

  /**
   * Prefetch TTS audio for a stepId in the background without playing.
   * Call this while user is on the CURRENT step to prepare the NEXT step.
   */
  const prefetchStep = useCallback((stepId) => {
    if (!stepId) return;
    if (stepAudioCache.current[stepId]) return; // already cached

    const match = stepId.match(/^(planner|analysis)_step_(\d+)$/);
    const flowType = match ? match[1] : 'planner';
    const currentStepId = match ? parseInt(match[2]) : 0;

    const entry = rulebookRef.current?.[stepId];

    // If pre-recorded audio exists, just preload the audio file
    if (entry?.audio_url) {
      stepAudioCache.current[stepId] = { audio_url: entry.audio_url, text: entry.text_fallback || '', avatar_state: entry.avatar_state };
      if (!audioCache[entry.audio_url]) {
        const audio = new Audio(entry.audio_url);
        audio.preload = 'auto';
        audioCache[entry.audio_url] = audio;
      }
      return;
    }

    // No pre-recorded audio — generate TTS in background
    base44.functions.invoke('evaluateInteractionLogic', {
      flowType,
      currentStepId,
      event: 'step_enter',
      contextData: { languageCode },
    }).then(res => {
      const data = res?.data;
      if (data?.audio_url) {
        stepAudioCache.current[stepId] = { audio_url: data.audio_url, text: data.text || '', avatar_state: data.avatar_state || 'talking' };
        // Also update rulebook entry for future use
        if (entry) entry.audio_url = data.audio_url;
        // Preload into browser audio cache
        if (!audioCache[data.audio_url]) {
          const audio = new Audio(data.audio_url);
          audio.preload = 'auto';
          audioCache[data.audio_url] = audio;
        }
      }
    }).catch(() => { /* silent - prefetch is best-effort */ });
  }, [languageCode]);

  /**
   * Play audio for a step_id.
   * 1. If stepAudioCache has it → play instantly (no network call).
   * 2. If rulebook entry has audio_url → play directly.
   * 3. Otherwise → call evaluateInteractionLogic for TTS.
   */
  const playStep = useCallback((stepId, onComplete) => {
    stop();

    const match = stepId.match(/^(planner|analysis)_step_(\d+)$/);
    const flowType = match ? match[1] : 'planner';
    const currentStepId = match ? parseInt(match[2]) : 0;

    const entry = rulebookRef.current?.[stepId];

    // Case 0: Already prefetched — play instantly
    const prefetched = stepAudioCache.current[stepId];
    if (prefetched?.audio_url) {
      if (prefetched.text) setCurrentText(prefetched.text);
      playUrl(prefetched.audio_url, prefetched.avatar_state || 'talking', null, onComplete);
      // Prefetch next step
      const nextMatch = stepId.match(/^(planner|analysis)_step_(\d+)$/);
      if (nextMatch) prefetchStep(`${nextMatch[1]}_step_${parseInt(nextMatch[2]) + 1}`);
      return;
    }

    // Case 1: Pre-recorded audio in rulebook
    if (entry?.audio_url) {
      setCurrentText(entry.text_fallback || '');
      playUrl(entry.audio_url, entry.avatar_state, entry.preload_next_step_id, onComplete);
      if (entry.preload_next_step_id) preloadStep(entry.preload_next_step_id);
      return;
    }

    // Case 2: Generate via backend
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
        // Cache for next time
        stepAudioCache.current[stepId] = { audio_url: data.audio_url, text: data.text || '', avatar_state: data.avatar_state || 'talking' };
        if (entry) entry.audio_url = data.audio_url;
        playUrl(data.audio_url, data.avatar_state || 'talking', null, onComplete);
        // Prefetch next step
        if (nextMatch) prefetchStep(`${nextMatch[1]}_step_${parseInt(nextMatch[2]) + 1}`);
      } else if (data?.text) {
        setCurrentText(data.text);
        playTTS(data.text, data.avatar_state || 'talking', onComplete);
      } else {
        setIsPlaying(false); setAvatarState('idle'); onComplete?.();
      }
    }).catch(() => {
      setIsPlaying(false); setAvatarState('idle'); onComplete?.();
    });

    const nextMatch = match;
  }, [stop, playUrl, preloadStep, prefetchStep, playTTS, languageCode]);

  return { playStep, preloadStep, prefetchStep, stop, avatarState, isPlaying, currentText };
}

export default useVoiceManager;