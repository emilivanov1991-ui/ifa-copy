import { useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const DEVICE_ID_KEY = 'ifa_device_id';
const JOURNEY_ID_KEY = 'ifa_journey_id';
const SESSION_MAX_DAYS = 14;

/**
 * Generate or retrieve a persistent device ID stored in localStorage.
 */
export function getDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

/**
 * All state transitions MUST go through the backend journeyStateMachine function.
 * Direct entity writes of journey_state are forbidden — this hook is the single gateway.
 */
export function useJourneyState() {
  const journeyRef = useRef(null);

  /**
   * Advance journey to a new state — routes through backend state machine for validation.
   * @param {string} journeyId
   * @param {string} newState — must be a valid transition from current state
   * @param {object} extraData — additional fields to persist alongside the state change
   */
  const advanceState = useCallback(async (journeyId, newState, extraData = {}) => {
    const response = await base44.functions.invoke('journeyStateMachine', {
      journey_id: journeyId,
      to_state: newState,
      extra_data: extraData,
    });

    if (!response?.data?.success) {
      const errMsg = response?.data?.error || 'Невалиден преход на Journey.';
      throw new Error(errMsg);
    }

    journeyRef.current = response.data.journey;
    return response.data.journey;
  }, []);

  /**
   * Find an existing active journey for this client or create a new one.
   * Implements the 14-day resume policy — transitions through state machine.
   */
  const createOrResumeJourney = useCallback(async (clientId, languageCode = 'bg') => {
    const deviceId = getDeviceId();

    // Look for the latest non-archived journey for this client
    const existing = await base44.entities.Journey.filter(
      { client_id: clientId, is_archived: false },
      '-created_date',
      1
    );

    if (existing.length > 0) {
      const journey = existing[0];
      const TERMINAL_STATES = ['completed', 'graceful_stop'];

      if (!TERMINAL_STATES.includes(journey.journey_state)) {
        const startedAt = new Date(journey.discovery_started_at || journey.created_date);
        const daysSinceStart = (Date.now() - startedAt.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceStart <= SESSION_MAX_DAYS) {
          // Resume: update device_id and activity timestamp (no state transition needed for same state)
          // If currently in discovery_collecting, transition to reverification
          let resumedJourney = journey;

          if (journey.journey_state === 'discovery_collecting') {
            resumedJourney = await advanceState(journey.id, 'discovery_resumed_pending_reverification', {
              device_id: deviceId,
            });
          } else {
            // Just update device_id and last_activity without a state change
            resumedJourney = await base44.entities.Journey.update(journey.id, {
              device_id: deviceId,
              last_activity_at: new Date().toISOString(),
            });
          }

          journeyRef.current = resumedJourney;
          localStorage.setItem(JOURNEY_ID_KEY, journey.id);
          return { journey: resumedJourney, isResume: true };
        } else {
          // Archive old journey — too old to resume
          await base44.entities.Journey.update(journey.id, { is_archived: true });
        }
      }
    }

    // Create new journey
    const newJourney = await base44.entities.Journey.create({
      client_id: clientId,
      device_id: getDeviceId(),
      language_code: languageCode,
      journey_state: 'discovery_not_started',
      discovery_started_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    });

    journeyRef.current = newJourney;
    localStorage.setItem(JOURNEY_ID_KEY, newJourney.id);
    return { journey: newJourney, isResume: false };
  }, [advanceState]);

  /**
   * Block the journey: transition to graceful_stop via state machine + create FollowUpTask.
   */
  const blockJourney = useCallback(async (journeyId, reason, reasonDetail, clientInfo = {}) => {
    const stoppedJourney = await advanceState(journeyId, 'graceful_stop', {
      graceful_stop_reason: reasonDetail,
    });

    const task = await base44.entities.FollowUpTask.create({
      journey_id: journeyId,
      client_id: clientInfo.client_id || null,
      client_name: clientInfo.client_name || null,
      client_email: clientInfo.client_email || null,
      client_phone: clientInfo.client_phone || null,
      reason,
      reason_detail: reasonDetail,
      priority: reason === 'health_non_automatable' ? 'high' : 'medium',
      assigned_queue: 'sales',
      status: 'open',
    });

    return { journey: stoppedJourney, task };
  }, [advanceState]);

  /**
   * Load a journey by ID.
   */
  const loadJourney = useCallback(async (journeyId) => {
    const results = await base44.entities.Journey.filter({ id: journeyId });
    if (results.length > 0) {
      journeyRef.current = results[0];
      return results[0];
    }
    return null;
  }, []);

  return {
    journey: journeyRef.current,
    createOrResumeJourney,
    advanceState,
    blockJourney,
    loadJourney,
  };
}

export default useJourneyState;