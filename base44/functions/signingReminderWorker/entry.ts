import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Signing Reminder Worker
 * Runs on schedule — finds pending SigningEvents and sends email reminders.
 * 
 * Logic:
 * - Find all SigningEvents with status 'pending' or 'sent'
 * - Skip expired sessions (valid_until in the past)
 * - Send reminder if:
 *   a) 1 hour after session started (first reminder)
 *   b) 12 hours after session started (second reminder)
 *   c) 2 hours before expiry (final reminder)
 * - Avoids duplicate sends by checking last_reminder_sent_at on the Journey
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin-only: this is a scheduled worker
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const results = { processed: 0, reminded: 0, skipped: 0, errors: [] };

    // Fetch all pending/sent signing events that haven't expired
    const pendingEvents = await base44.asServiceRole.entities.SigningEvent.filter({
      status: { $in: ['pending', 'sent'] }
    });

    console.log(`Found ${pendingEvents.length} pending/sent signing events`);

    for (const event of pendingEvents) {
      results.processed++;

      try {
        const validUntil = new Date(event.valid_until);
        const startedAt = new Date(event.started_at || event.created_date);

        // Skip already expired sessions
        if (validUntil < now) {
          console.log(`Session ${event.signing_session_id} expired, skipping`);
          results.skipped++;
          continue;
        }

        const minutesSinceStart = (now - startedAt) / 60000;
        const minutesUntilExpiry = (validUntil - now) / 60000;

        // Determine if we should send a reminder
        // Window checks (with 5 min tolerance to avoid double-sends):
        const shouldSendFirst = minutesSinceStart >= 60 && minutesSinceStart <= 70;       // ~1h after start
        const shouldSendSecond = minutesSinceStart >= 720 && minutesSinceStart <= 730;    // ~12h after start
        const shouldSendFinal = minutesUntilExpiry <= 120 && minutesUntilExpiry >= 110;   // ~2h before expiry

        if (!shouldSendFirst && !shouldSendSecond && !shouldSendFinal) {
          results.skipped++;
          continue;
        }

        // Fetch journey to get client email and name
        const journey = await base44.asServiceRole.entities.Journey.get(event.journey_id);
        if (!journey) {
          console.error(`Journey not found for event ${event.id}`);
          results.skipped++;
          continue;
        }

        // Skip if journey is no longer in signing state
        if (!['signing_in_progress'].includes(journey.journey_state)) {
          console.log(`Journey ${event.journey_id} no longer in signing state (${journey.journey_state}), skipping`);
          results.skipped++;
          continue;
        }

        // Get client email/name from FinancialAnalysisSubmission
        let clientEmail = null;
        let clientName = 'Клиент';

        if (journey.analysis_id) {
          const analysis = await base44.asServiceRole.entities.FinancialAnalysisSubmission.get(journey.analysis_id);
          if (analysis) {
            clientEmail = analysis.client_email;
            clientName = [analysis.client_first_name, analysis.client_last_name].filter(Boolean).join(' ') || 'Клиент';
          }
        }

        if (!clientEmail) {
          console.warn(`No client email for journey ${event.journey_id}, skipping`);
          results.skipped++;
          continue;
        }

        // Build reminder type label and message
        let reminderType = '';
        let urgencyNote = '';

        if (shouldSendFirst) {
          reminderType = 'first';
          urgencyNote = 'Документите Ви очакват подпис.';
        } else if (shouldSendSecond) {
          reminderType = 'second';
          urgencyNote = 'Все още не сте подписали документите си. Моля, направете го при първа възможност.';
        } else if (shouldSendFinal) {
          reminderType = 'final';
          urgencyNote = `⚠️ ВАЖНО: Сесията за подпис изтича след около 2 часа (${validUntil.toLocaleString('bg-BG', { timeZone: 'Europe/Sofia' })}). След това ще е необходимо да се генерира нова.`;
        }

        const hoursUntilExpiry = Math.round(minutesUntilExpiry / 60);
        const expiryFormatted = validUntil.toLocaleString('bg-BG', {
          timeZone: 'Europe/Sofia',
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });

        const emailBody = `
Уважаем/а ${clientName},

${urgencyNote}

Вашите документи са готови за електронен подпис чрез Evrotrust.

📋 Какво трябва да направите:
1. Отворете приложението Evrotrust на телефона си
2. Намерете заявката за подпис от Integrity Financial Advisors
3. Прегледайте и подпишете документите

⏰ Валидност на сесията: до ${expiryFormatted} (${hoursUntilExpiry} ч.)

Ако имате въпроси или затруднения, свържете се с нас:
📞 +359 89 222 2990
📧 krassimir.stankov@ifa.bg

Благодарим Ви за доверието!

С уважение,
Екипът на Integrity Financial Advisors
        `.trim();

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: clientEmail,
          from_name: 'Integrity Financial Advisors',
          subject: reminderType === 'final'
            ? `⚠️ Последен шанс: Документите Ви изтичат след 2 часа — ${clientName}`
            : `Напомняне: Документи за подпис — ${clientName}`,
          body: emailBody,
        });

        console.log(`Sent ${reminderType} reminder to ${clientEmail} for journey ${event.journey_id}`);
        results.reminded++;

      } catch (err) {
        console.error(`Error processing signing event ${event.id}:`, err.message);
        results.errors.push({ event_id: event.id, error: err.message });
      }
    }

    console.log('Signing reminder worker completed:', results);
    return Response.json({ success: true, ...results });

  } catch (error) {
    console.error('Signing reminder worker fatal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});