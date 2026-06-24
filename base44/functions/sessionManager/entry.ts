import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Session Manager
 * - Creates new sessions
 * - Updates last activity
 * - Cleans up expired sessions
 * - Handles session timeout logic
 * 
 * Session timeout: 24 hours from last activity
 */

const SESSION_TIMEOUT_HOURS = 24;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, session_id, user_id, device_id, journey_id, metadata } = await req.json();

    // Validate action
    if (!action) {
      return Response.json({ error: 'Action required' }, { status: 400 });
    }

    // Create session
    if (action === 'create') {
      const sessionId = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + SESSION_TIMEOUT_HOURS * 60 * 60 * 1000);

      const session = await base44.entities.Session.create({
        session_id: sessionId,
        user_id: user_id || null,
        device_id,
        journey_id,
        ip_address: req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
        started_at: now.toISOString(),
        last_activity_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        is_active: true,
        session_type: user_id ? 'authenticated' : 'anonymous',
        metadata: metadata || {},
      });

      return Response.json({
        session_id: sessionId,
        expires_at: expiresAt.toISOString(),
      });
    }

    // Update session activity
    if (action === 'update') {
      if (!session_id) {
        return Response.json({ error: 'session_id required' }, { status: 400 });
      }

      const sessions = await base44.entities.Session.filter({ session_id });
      if (sessions.length === 0) {
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }

      const session = sessions[0];
      
      // Check if session is expired
      const now = new Date();
      if (new Date(session.expires_at) < now) {
        // Session expired - mark as inactive
        await base44.entities.Session.update(session.id, {
          is_active: false,
        });
        return Response.json({
          expired: true,
          message: 'Session expired',
        });
      }

      // Update last activity and extend expiration
      const newExpiresAt = new Date(now.getTime() + SESSION_TIMEOUT_HOURS * 60 * 60 * 1000);
      await base44.entities.Session.update(session.id, {
        last_activity_at: now.toISOString(),
        expires_at: newExpiresAt.toISOString(),
        journey_id: journey_id || session.journey_id,
      });

      return Response.json({
        session_id,
        expires_at: newExpiresAt.toISOString(),
        is_active: true,
      });
    }

    // End session
    if (action === 'end') {
      if (!session_id) {
        return Response.json({ error: 'session_id required' }, { status: 400 });
      }

      const sessions = await base44.entities.Session.filter({ session_id });
      if (sessions.length === 0) {
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }

      const session = sessions[0];
      await base44.entities.Session.update(session.id, {
        is_active: false,
      });

      return Response.json({ success: true });
    }

    // Get active session
    if (action === 'get') {
      if (!session_id) {
        return Response.json({ error: 'session_id required' }, { status: 400 });
      }

      const sessions = await base44.entities.Session.filter({ session_id });
      if (sessions.length === 0) {
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }

      const session = sessions[0];
      const now = new Date();
      const isExpired = new Date(session.expires_at) < now;

      return Response.json({
        session_id: session.session_id,
        is_active: session.is_active && !isExpired,
        is_expired: isExpired,
        expires_at: session.expires_at,
        journey_id: session.journey_id,
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Session manager error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});