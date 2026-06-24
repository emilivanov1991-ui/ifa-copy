import { useEffect, useRef, useCallback } from 'react';
import { getOrCreateDeviceId, syncDeviceWithBackend } from '@/lib/deviceId';
import { base44 } from '@/api/base44Client';

const SESSION_KEY = 'ifa_current_session';
const SESSION_TIMEOUT_WARNING_MINUTES = 30;

export function useSessionManager(userId = null, journeyId = null) {
  const sessionRef = useRef(null);
  const activityTimerRef = useRef(null);
  const warningShownRef = useRef(false);

  // Create or restore session
  const createSession = useCallback(async (deviceId) => {
    try {
      // Check for existing session in localStorage
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Verify session is still valid
        const session = await base44.entities.Session.filter({ session_id: parsed.session_id });
        if (session.length > 0 && session[0].is_active) {
          console.log('Restored existing session');
          sessionRef.current = session[0];
          return session[0];
        }
      }

      // Create new session
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

      const newSession = await base44.entities.Session.create({
        session_id: 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9),
        user_id: userId || null,
        device_id: deviceId,
        journey_id: journeyId || null,
        ip_address: '',
        user_agent: navigator.userAgent,
        started_at: now.toISOString(),
        last_activity_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        is_active: true,
        session_type: userId ? 'authenticated' : 'anonymous',
        metadata: {
          entry_point: window.location.pathname,
          referrer: document.referrer || 'direct',
        },
      });

      localStorage.setItem(SESSION_KEY, JSON.stringify({
        session_id: newSession.session_id,
        expires_at: newSession.expires_at,
      }));

      sessionRef.current = newSession;
      console.log('Created new session');
      return newSession;
    } catch (error) {
      console.error('Failed to create session:', error);
      return null;
    }
  }, [userId, journeyId]);

  // Update session activity
  const updateActivity = useCallback(async () => {
    if (!sessionRef.current) return;

    try {
      const sessions = await base44.entities.Session.filter({ 
        session_id: sessionRef.current.session_id 
      });

      if (sessions.length === 0 || !sessions[0].is_active) {
        // Session expired or deleted
        sessionRef.current = null;
        localStorage.removeItem(SESSION_KEY);
        console.log('Session expired');
        return null;
      }

      const session = sessions[0];
      
      // Check if session is about to expire (within 30 minutes)
      const expiresAt = new Date(session.expires_at);
      const now = new Date();
      const minutesUntilExpiry = (expiresAt - now.getTime()) / (1000 * 60);

      if (minutesUntilExpiry < SESSION_TIMEOUT_WARNING_MINUTES && !warningShownRef.current) {
        console.warn(`Session expires in ${Math.round(minutesUntilExpiry)} minutes`);
        warningShownRef.current = true;
        // Could trigger a toast notification here
      }

      // Extend session by updating last_activity
      const newExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      await base44.entities.Session.update(session.id, {
        last_activity_at: now.toISOString(),
        expires_at: newExpiresAt.toISOString(),
        journey_id: journeyId || session.journey_id,
      });

      sessionRef.current = { ...session, expires_at: newExpiresAt.toISOString() };
      
      // Update localStorage
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        session_id: session.session_id,
        expires_at: newExpiresAt.toISOString(),
      }));

      return sessionRef.current;
    } catch (error) {
      console.error('Failed to update session:', error);
      return null;
    }
  }, [journeyId]);

  // End session
  const endSession = useCallback(async () => {
    if (!sessionRef.current) return;

    try {
      const sessions = await base44.entities.Session.filter({ 
        session_id: sessionRef.current.session_id 
      });

      if (sessions.length > 0) {
        await base44.entities.Session.update(sessions[0].id, {
          is_active: false,
        });
      }

      sessionRef.current = null;
      localStorage.removeItem(SESSION_KEY);
      console.log('Session ended');
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }, []);

  // Initialize session on mount
  useEffect(() => {
    const deviceId = getOrCreateDeviceId();
    createSession(deviceId);
    syncDeviceWithBackend(deviceId, userId);

    // Set up activity tracking
    const handleActivity = () => {
      updateActivity();
    };

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Periodic activity update (every 5 minutes)
    activityTimerRef.current = setInterval(() => {
      updateActivity();
    }, 5 * 60 * 1000);

    // Cleanup on unmount
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (activityTimerRef.current) {
        clearInterval(activityTimerRef.current);
      }
      // Don't end session on unmount - keep it alive for browser close
    };
  }, [createSession, updateActivity, userId]);

  return {
    session: sessionRef.current,
    updateActivity,
    endSession,
    isSessionExpired: !sessionRef.current,
  };
}