import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { email, otp_code } = await req.json();
    
    if (!email || !otp_code) {
      return Response.json({ error: 'Email and OTP code are required' }, { status: 400 });
    }
    
    // Find active OTP session for this email
    const otpSessions = await base44.entities.OtpSession.filter({
      email: email.toLowerCase(),
      is_used: false
    });
    
    if (otpSessions.length === 0) {
      return Response.json({ 
        error: 'No active OTP session found. Please request a new code.',
        error_code: 'NO_ACTIVE_SESSION'
      }, { status: 400 });
    }
    
    // Find the most recent session
    const otpSession = otpSessions[0];
    
    // Check if expired
    const now = new Date();
    const expiresAt = new Date(otpSession.expires_at);
    if (now > expiresAt) {
      return Response.json({ 
        error: 'OTP code has expired. Please request a new code.',
        error_code: 'OTP_EXPIRED'
      }, { status: 400 });
    }
    
    // Check attempt count (max 5 attempts)
    if (otpSession.attempt_count >= 5) {
      return Response.json({ 
        error: 'Too many failed attempts. Please request a new code.',
        error_code: 'MAX_ATTEMPTS_REACHED'
      }, { status: 400 });
    }
    
    // Verify OTP code
    if (otpSession.otp_code !== otp_code) {
      // Increment attempt count
      await base44.entities.OtpSession.update(otpSession.id, {
        attempt_count: (otpSession.attempt_count || 0) + 1
      });
      
      return Response.json({ 
        error: 'Invalid OTP code',
        error_code: 'INVALID_OTP',
        attempts_remaining: 5 - (otpSession.attempt_count || 1)
      }, { status: 400 });
    }
    
    // OTP is valid - mark as used
    await base44.entities.OtpSession.update(otpSession.id, {
      is_used: true,
      used_at: now.toISOString()
    });
    
    // Get client data
    const clients = await base44.entities.Client.filter({ email: email.toLowerCase() });
    if (clients.length === 0) {
      return Response.json({ error: 'Client not found' }, { status: 404 });
    }
    
    const client = clients[0];
    
    // Return client data for session creation
    return Response.json({
      success: true,
      client: {
        id: client.id,
        email: client.email,
        first_name: client.first_name,
        last_name: client.last_name,
        stage: client.stage,
        status: client.status
      }
    });
    
  } catch (error) {
    console.error('VerifyOTP error:', error);
    return Response.json({ 
      error: error.message || 'Failed to verify OTP code'
    }, { status: 500 });
  }
});