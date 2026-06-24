import { useState, useCallback, useEffect } from 'react';
import { AVATAR_STATES } from '@/components/GuideAvatar';

/**
 * Avatar State Machine Hook
 * 
 * Manages avatar state transitions with smooth animations and timing.
 * 
 * Usage:
 * const { state, setState, transitionTo, isTransitioning } = useAvatarStateMachine();
 * 
 * // Simple state change
 * setState('talking');
 * 
 * // Smooth transition with callback
 * await transitionTo('celebrating', 2000); // Show for 2 seconds, then return to idle
 * 
 * // State machine with conditions
 * if (isListening) {
 *   transitionTo('listening');
 * } else if (isProcessing) {
 *   transitionTo('thinking');
 * }
 */

export function useAvatarStateMachine(initialState = AVATAR_STATES.IDLE) {
  const [state, setState] = useState(initialState);
  const [previousState, setPreviousState] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionStartTime, setTransitionStartTime] = useState(null);

  // State transition rules (which states can transition to which)
  const TRANSITION_RULES = {
    [AVATAR_STATES.IDLE]: [
      AVATAR_STATES.TALKING,
      AVATAR_STATES.LISTENING,
      AVATAR_STATES.IDLE_LISTENING,
      AVATAR_STATES.LOADING,
    ],
    [AVATAR_STATES.TALKING]: [
      AVATAR_STATES.IDLE,
      AVATAR_STATES.LISTENING,
      AVATAR_STATES.THINKING,
      AVATAR_STATES.CELEBRATING,
      AVATAR_STATES.CONCERNED,
    ],
    [AVATAR_STATES.LISTENING]: [
      AVATAR_STATES.THINKING,
      AVATAR_STATES.TALKING,
      AVATAR_STATES.IDLE,
    ],
    [AVATAR_STATES.THINKING]: [
      AVATAR_STATES.TALKING,
      AVATAR_STATES.CELEBRATING,
      AVATAR_STATES.CONCERNED,
      AVATAR_STATES.ERROR,
    ],
    [AVATAR_STATES.CELEBRATING]: [
      AVATAR_STATES.IDLE,
      AVATAR_STATES.TALKING,
    ],
    [AVATAR_STATES.CONCERNED]: [
      AVATAR_STATES.IDLE,
      AVATAR_STATES.THINKING,
      AVATAR_STATES.TALKING,
    ],
    [AVATAR_STATES.LIVE_PRESENTER]: [
      AVATAR_STATES.TALKING,
      AVATAR_STATES.IDLE,
      AVATAR_STATES.CONCERNED,
    ],
    [AVATAR_STATES.IDLE_LISTENING]: [
      AVATAR_STATES.LISTENING,
      AVATAR_STATES.TALKING,
      AVATAR_STATES.IDLE,
    ],
    [AVATAR_STATES.LOADING]: [
      AVATAR_STATES.TALKING,
      AVATAR_STATES.CELEBRATING,
      AVATAR_STATES.CONCERNED,
      AVATAR_STATES.ERROR,
    ],
    [AVATAR_STATES.ERROR]: [
      AVATAR_STATES.IDLE,
      AVATAR_STATES.THINKING,
      AVATAR_STATES.CONCERNED,
    ],
  };

  // Check if transition is valid
  const canTransition = useCallback((from, to) => {
    if (!TRANSITION_RULES[from]) return true; // Allow all if no rules
    return TRANSITION_RULES[from].includes(to);
  }, []);

  // Transition to a new state with optional timeout
  const transitionTo = useCallback(async (newState, duration = null) => {
    if (state === newState) return;

    if (!canTransition(state, newState)) {
      console.warn(`Invalid transition: ${state} -> ${newState}`);
      // Force transition anyway for critical states
      if (newState !== AVATAR_STATES.ERROR && newState !== AVATAR_STATES.CONCERNED) {
        return;
      }
    }

    setPreviousState(state);
    setIsTransitioning(true);
    setTransitionStartTime(Date.now());
    
    setState(newState);

    // If duration specified, auto-return to idle or previous state
    if (duration) {
      await new Promise(resolve => setTimeout(resolve, duration));
      setState(previousState || AVATAR_STATES.IDLE);
      setIsTransitioning(false);
    } else {
      setIsTransitioning(false);
    }
  }, [state, previousState, canTransition]);

  // Quick state changes for common scenarios
  const startTalking = useCallback(() => transitionTo(AVATAR_STATES.TALKING), [transitionTo]);
  const startListening = useCallback(() => transitionTo(AVATAR_STATES.LISTENING), [transitionTo]);
  const startThinking = useCallback(() => transitionTo(AVATAR_STATES.THINKING), [transitionTo]);
  const celebrate = useCallback(() => transitionTo(AVATAR_STATES.CELEBRATING, 2000), [transitionTo]);
  const showError = useCallback(() => transitionTo(AVATAR_STATES.ERROR, 3000), [transitionTo]);
  const showConcern = useCallback(() => transitionTo(AVATAR_STATES.CONCERNED), [transitionTo]);
  const startLoading = useCallback(() => transitionTo(AVATAR_STATES.LOADING), [transitionTo]);
  const resetToIdle = useCallback(() => transitionTo(AVATAR_STATES.IDLE), [transitionTo]);

  // Get transition progress (0-1) for animations
  const getTransitionProgress = useCallback(() => {
    if (!transitionStartTime || !isTransitioning) return 0;
    const elapsed = Date.now() - transitionStartTime;
    return Math.min(elapsed / 1000, 1); // Assume 1 second transitions
  }, [transitionStartTime, isTransitioning]);

  return {
    state,
    setState,
    previousState,
    isTransitioning,
    transitionTo,
    canTransition,
    getTransitionProgress,
    // Convenience methods
    startTalking,
    startListening,
    startThinking,
    celebrate,
    showError,
    showConcern,
    startLoading,
    resetToIdle,
  };
}