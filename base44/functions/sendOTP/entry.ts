import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { base44 } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Parse request body
    const { email } = await req.json();
    
    if (!email || !email.includes('@')) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }
    
    // Check if client exists with this email
    const clients = await base44.entities.Client.filter({ email: email.toLowerCase() });
    
    if (clients.length === 0) {
      return Response.json({ 
        error: 'No account found with this email. Please complete the financial analysis first.',
        error_code: 'CLIENT_NOT_FOUND'
      }, { status: 404 });
    }
    
    const client = clients[0];
    
    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create OTP session record
    const otpSession = await base44.entities.OtpSession.create({
      email: email.toLowerCase(),
      client_id: client.id,
      otp_code: otpCode,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      is_used: false,
      attempt_count: 0
    });
    
    // Send email with OTP code
    const clientName = `${client.first_name} ${client.last_name}`;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Клиентски портал</h1>
          <p style="color: #bfdbfe; margin: 10px 0 0 0;">Integrity Financial Advisors</p>
        </div>
        
        <div style="padding: 30px; background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0;">Здравейте, ${clientName}!</h2>
          
          <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
            Поискахте вход в клиентския портал. Използвайте следния код за потвърждение:
          </p>
          
          <div style="background: #dbeafe; border: 2px dashed #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
            <div style="font-size: 36px; font-weight: bold; color: #1e40af; letter-spacing: 8px; font-family: monospace;">
              ${otpCode}
            </div>
            <p style="color: #64748b; font-size: 14px; margin: 10px 0 0 0;">
              Кодът е валиден 10 минути
            </p>
          </div>
          
          <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
            Ако не сте поискали този код, просто игнорирайте този имейл.
          </p>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">
              Това е автоматично съобщение от системата за клиентски портал на Integrity Financial Advisors.
            </p>
          </div>
        </div>
      </div>
    `;
    
    await base44.integrations.Core.SendEmail({
      to: email.toLowerCase(),
      subject: 'Код за вход в клиентски портал',
      body: emailBody,
      from_name: 'Integrity Financial Advisors'
    });
    
    return Response.json({ 
      success: true, 
      message: 'OTP code sent to email',
      otp_session_id: otpSession.id
    });
    
  } catch (error) {
    console.error('SendOTP error:', error);
    return Response.json({ 
      error: error.message || 'Failed to send OTP code'
    }, { status: 500 });
  }
});