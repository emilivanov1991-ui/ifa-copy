import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const hash = await hashPassword('Test1234');

    const account = await base44.asServiceRole.entities.ConsultantAccount.create({
      username: 'consultant1',
      password_hash: hash,
      full_name: 'Тест Консултант',
      role: 'consultant',
      is_active: true
    });

    return Response.json({ success: true, username: 'consultant1', password: 'Test1234', hash, account });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});