import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Session Cleanup Worker
 * - Removes expired sessions
 * - Updates device last_seen
 * - Runs every hour via scheduled automation
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date();
    console.log(`Starting session cleanup at ${now.toISOString()}`);

    // Find expired sessions
    const expiredSessions = await base44.asServiceRole.entities.Session.filter({
      is_active: true,
    });

    const trulyExpired = expiredSessions.filter(s => 
      new Date(s.expires_at) < now
    );

    console.log(`Found ${expiredSessions.length} active sessions, ${trulyExpired.length} expired`);

    // Mark expired sessions as inactive
    for (const session of trulyExpired) {
      await base44.asServiceRole.entities.Session.update(session.id, {
        is_active: false,
      });
    }

    // Clean up old devices (not seen in 90 days)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const oldDevices = await base44.asServiceRole.entities.Device.filter({
      is_active: true,
    });

    const reallyOldDevices = oldDevices.filter(d => 
      new Date(d.last_seen_at) < ninetyDaysAgo
    );

    console.log(`Found ${reallyOldDevices.length} devices older than 90 days`);

    for (const device of reallyOldDevices) {
      await base44.asServiceRole.entities.Device.update(device.id, {
        is_active: false,
      });
    }

    return Response.json({
      cleaned_sessions: trulyExpired.length,
      cleaned_devices: reallyOldDevices.length,
      timestamp: now.toISOString(),
    });

  } catch (error) {
    console.error('Session cleanup error:', error);
    return Response.json({
      error: error.message,
    }, { status: 500 });
  }
});