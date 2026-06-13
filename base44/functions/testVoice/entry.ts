import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { text, voice, language_code } = await req.json();

    const result = await base44.integrations.Core.GenerateSpeech({
        text: text || "Добре дошли в Integrity Financial Advisors.",
        voice: voice || "storm",
        language_code: language_code || "bg"
    });

    return Response.json({ url: result.url });
});