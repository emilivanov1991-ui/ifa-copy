import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Get Secure Log Signed URL
 * Generates a time-limited signed URL for accessing an encrypted log file.
 * 
 * Validates:
 * - User authentication
 * - User has required role (admin, senior, consultant)
 * - Log retention period has not expired
 * - File exists in storage
 * 
 * Payload:
 * - log_id: string (SecureLogReference ID)
 * - expires_in: number (seconds, default 3600 = 1 hour)
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { log_id, expires_in = 3600 } = payload;

    if (!log_id) {
      return Response.json({ error: 'Missing log_id' }, { status: 400 });
    }

    console.log(`Getting signed URL for log ${log_id}, user ${user.id}`);

    // Get log reference
    const logs = await base44.asServiceRole.entities.SecureLogReference.filter({ id: log_id });
    if (logs.length === 0) {
      return Response.json({ error: 'Log not found' }, { status: 404 });
    }

    const logRef = logs[0];

    // Check retention period
    const now = new Date();
    const retentionUntil = new Date(logRef.retention_until);
    if (now > retentionUntil) {
      return Response.json({ 
        error: 'Log has expired and been deleted per retention policy' 
      }, { status: 410 });
    }

    // Check user role
    const userRole = user.role || 'user';
    const allowedRoles = logRef.access_roles || ['admin', 'senior', 'consultant'];
    if (!allowedRoles.includes(userRole)) {
      console.warn(`User ${user.id} with role ${userRole} denied access to log ${log_id}`);
      return Response.json({ 
        error: 'Access denied - insufficient permissions' 
      }, { status: 403 });
    }

    // Generate signed URL
    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
      file_uri: logRef.encrypted_object_key,
      expires_in,
    });

    console.log(`Generated signed URL for log ${log_id}, expires in ${expires_in}s`);

    return Response.json({
      success: true,
      signed_url,
      expires_in,
      log_type: logRef.log_type,
      content_hash: logRef.content_hash,
    });

  } catch (error) {
    console.error('Get secure log URL error:', error);
    return Response.json({
      error: error.message,
    }, { status: 500 });
  }
});