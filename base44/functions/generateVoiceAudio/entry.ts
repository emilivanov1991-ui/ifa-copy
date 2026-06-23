/**
 * generateVoiceAudio — Background process that generates and stores TTS audio
 * for all VoiceRulebook entries that have text_fallback but no audio_url.
 *
 * Processes in batches to avoid timeouts. Safe to run multiple times (idempotent).
 * Can be called with { force: true } to regenerate all entries.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const force = body.force === true; // if true, regenerate even entries that already have audio_url
    const batchSize = body.batch_size || 10; // entries per run to avoid timeout
    const language = body.language || null; // null = all languages

    // Fetch entries that need audio
    const filterQuery = { is_active: true };
    if (language) filterQuery.language_code = language;

    const allEntries = await base44.asServiceRole.entities.VoiceRulebook.filter(filterQuery, 'step_id', 500);

    // Filter to only entries with text but no audio (unless force=true)
    const toProcess = allEntries.filter(e =>
      e.text_fallback && e.text_fallback.trim() &&
      (force || !e.audio_url)
    );

    if (toProcess.length === 0) {
      return Response.json({
        success: true,
        message: 'All entries already have audio',
        total: allEntries.length,
        processed: 0,
      });
    }

    // Take only a batch to avoid function timeout
    const batch = toProcess.slice(0, batchSize);

    let generated = 0;
    let failed = 0;
    const errors = [];

    for (const entry of batch) {
      try {
        const lang = entry.language_code || 'bg';
        const voice = lang === 'bg' ? 'storm' : 'river';

        const ttsResult = await base44.asServiceRole.integrations.Core.GenerateSpeech({
          text: entry.text_fallback,
          voice,
          language_code: lang,
        });

        if (ttsResult?.url) {
          await base44.asServiceRole.entities.VoiceRulebook.update(entry.id, {
            audio_url: ttsResult.url,
          });
          generated++;
          console.log(`[OK] ${entry.step_id} → ${ttsResult.url}`);
        } else {
          failed++;
          errors.push({ step_id: entry.step_id, error: 'No URL returned' });
        }
      } catch (err) {
        failed++;
        errors.push({ step_id: entry.step_id, error: err.message });
        console.error(`[FAIL] ${entry.step_id}:`, err.message);
      }
    }

    return Response.json({
      success: true,
      total_needing_audio: toProcess.length,
      batch_processed: batch.length,
      remaining: toProcess.length - batch.length,
      generated,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('generateVoiceAudio error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});