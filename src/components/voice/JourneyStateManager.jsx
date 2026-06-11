import { useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const DEVICE_ID_KEY = 'ifa_device_id';
const JOURNEY_ID_KEY = 'ifa_journey_id';
const SESSION_MAX_DAYS = 14;

/**
 * Generate or retrieve a persistent device ID
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
 * Hook to manage Journey state transitions
 * Provides:
 *   - currentJourney: the active Journey record
 *   - advanceState(newState): transition to a new state
 *   - createOrResumeJourney(clientId): find or create a Journey for this client
 *   - blockJourney(reason): set journey to graceful_stop and create FollowUpTask
 */
export function useJourneyState() {
  const journeyRef = useRef(null);

  const loadJourney = useCallback(async (journeyId) => {
    const results = await base44.entities.Journey.filter({ id: journeyId });
    if (results.length > 0) {
      journeyRef.current = results[0];
      return results[0];
    }
    return null;
  }, []);

  /**
   * Find an existing active journey for this client or create a new one.
   * Implements the 14-day resume policy.
   */
  const createOrResumeJourney = useCallback(async (clientId, languageCode = 'bg') => {
    const deviceId = getDeviceId();

    // Look for existing non-expired journey for this client
    const existing = await base44.entities.Journey.filter(
      { client_id: clientId },
      '-created_date',
      1
    );

    if (existing.length > 0) {
      const journey = existing[0];
      const startedAt = new Date(journey.discovery_started_at || journey.created_date);
      const daysSinceStart = (Date.now() - startedAt.getTime()) / (1000 * 60 * 60 * 24);

      if (journey.journey_state !== 'completed' && journey.journey_state !== 'expired') {
        if (daysSinceStart <= SESSION_MAX_DAYS) {
          // Resume: set to pending reverification
          const updated = await base44.entities.Journey.update(journey.id, {
            journey_state: 'discovery_resumed_pending_reverification',
            is_resumed: true,
            session_age_days: Math.round(daysSinceStart),
            last_activity_at: new Date().toISOString(),
            device_id: deviceId,
          });
          journeyRef.current = updated;
          localStorage.setItem(JOURNEY_ID_KEY, journey.id);
          return { journey: updated, isResume: true };
        } else {
          // Expire old journey
          await base44.entities.Journey.update(journey.id, { journey_state: 'expired' });
        }
      }
    }

    // Create new journey
    const newJourney = await base44.entities.Journey.create({
      client_id: clientId,
      device_id: deviceId,
      language_code: languageCode,
      journey_state: 'discovery_not_started',
      discovery_started_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    });

    journeyRef.current = newJourney;
    localStorage.setItem(JOURNEY_ID_KEY, newJourney.id);
    return { journey: newJourney, isResume: false };
  }, []);

  /**
   * Advance journey to a new state with validation
   */
  const advanceState = useCallback(async (journeyId, newState, extraData = {}) => {
    const journey = await loadJourney(journeyId);
    if (!journey) return null;

    const updated = await base44.entities.Journey.update(journeyId, {
      previous_state: journey.journey_state,
      journey_state: newState,
      state_changed_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
      ...extraData,
    });

    journeyRef.current = updated;
    return updated;
  }, [loadJourney]);

  /**
   * Block the journey and create a FollowUpTask
   */
  const blockJourney = useCallback(async (journeyId, reason, reasonDetail, clientInfo = {}) => {
    await advanceState(journeyId, 'graceful_stop', {
      graceful_stop_reason: reasonDetail,
    });

    // Create follow-up task for the consultant team
    const task = await base44.entities.FollowUpTask.create({
      journey_id: journeyId,
      client_id: clientInfo.client_id,
      client_name: clientInfo.client_name,
      client_email: clientInfo.client_email,
      client_phone: clientInfo.client_phone,
      reason,
      reason_detail: reasonDetail,
      priority: reason === 'health_non_automatable' ? 'high' : 'medium',
      assigned_queue: 'sales',
      status: 'open',
    });

    return task;
  }, [advanceState]);

  return {
    journey: journeyRef.current,
    createOrResumeJourney,
    advanceState,
    blockJourney,
    loadJourney,
  };
}