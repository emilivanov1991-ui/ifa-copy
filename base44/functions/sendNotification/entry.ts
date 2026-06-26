import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * sendNotification
 *
 * Central notification dispatcher.
 * Called by entity automations OR directly.
 *
 * Payload:
 *   type: 'signing_reminder' | 'payment_failed' | 'provider_submission_confirmed' | 'followup_created'
 *   entity_id: id of the triggering entity
 *   journey_id: optional override
 *   lang: optional override ('bg' | 'en')
 */

// ─── Email templates ──────────────────────────────────────────────────────────

const TEMPLATES = {
  signing_reminder: {
    bg: {
      subject: 'Действие необходимо: Подпишете документите си — IFA',
      body: (name, expiresAt) => `Уважаем/а ${name},

Документите Ви за застрахователна полица са готови и чакат Вашия електронен подпис чрез Evrotrust.

${expiresAt ? `⏰ Срокът за подписване изтича на: ${new Date(expiresAt).toLocaleString('bg-BG')}` : '⏰ Моля, подпишете възможно най-скоро.'}

За да подпишете:
1. Отворете приложението Evrotrust на телефона си
2. Намерете документите от "Integrity Financial Advisors"
3. Прегледайте и подпишете

Ако имате въпроси, обадете се на: +359 89 222 2990

С уважение,
Екипът на IFA`,
    },
    en: {
      subject: 'Action required: Sign your documents — IFA',
      body: (name, expiresAt) => `Dear ${name},

Your insurance policy documents are ready and awaiting your electronic signature via Evrotrust.

${expiresAt ? `⏰ Signing deadline: ${new Date(expiresAt).toLocaleString('en-GB')}` : '⏰ Please sign as soon as possible.'}

To sign:
1. Open the Evrotrust app on your phone
2. Find documents from "Integrity Financial Advisors"
3. Review and sign

If you have questions, call: +359 89 222 2990

Best regards,
The IFA Team`,
    },
  },

  payment_failed: {
    bg: {
      subject: 'Неуспешно плащане — действие необходимо | IFA',
      body: (name, amount, currency) => `Уважаем/а ${name},

За съжаление плащането Ви${amount ? ` на ${amount} ${currency || 'EUR'}` : ''} не беше обработено успешно.

Причините могат да бъдат:
• Недостатъчни средства по картата
• Технически проблем с банката
• Изтекла карта

Моля, опитайте отново или се свържете с нас:
📞 +359 89 222 2990
📧 krassimir.stankov@ifa.bg

Консултант ще се свърже с Вас в рамките на 24 часа.

С уважение,
Екипът на IFA`,
    },
    en: {
      subject: 'Payment failed — action required | IFA',
      body: (name, amount, currency) => `Dear ${name},

Unfortunately your payment${amount ? ` of ${amount} ${currency || 'EUR'}` : ''} was not processed successfully.

Possible reasons:
• Insufficient card funds
• Technical issue with the bank
• Expired card

Please try again or contact us:
📞 +359 89 222 2990
📧 krassimir.stankov@ifa.bg

A consultant will contact you within 24 hours.

Best regards,
The IFA Team`,
    },
  },

  provider_submission_confirmed: {
    bg: {
      subject: 'Вашето заявление е изпратено успешно — IFA 🎉',
      body: (name, providerName) => `Уважаем/а ${name},

Радваме се да Ви уведомим, че Вашето заявление${providerName ? ` до ${providerName}` : ''} беше изпратено успешно!

Следващи стъпки:
• Застрахователят ще прегледа заявлението Ви
• Срок за одобрение: обикновено 3–5 работни дни
• Ще получите полицата си по имейл при одобрение

Нашият екип следи процеса и ще Ви информира при всяка промяна.

При въпроси:
📞 +359 89 222 2990
📧 krassimir.stankov@ifa.bg

С уважение,
Екипът на IFA`,
    },
    en: {
      subject: 'Your application has been submitted successfully — IFA 🎉',
      body: (name, providerName) => `Dear ${name},

We are pleased to inform you that your application${providerName ? ` to ${providerName}` : ''} has been submitted successfully!

Next steps:
• The insurer will review your application
• Approval timeline: typically 3–5 business days
• You will receive your policy by email upon approval

Our team is monitoring the process and will keep you informed of any updates.

Questions?
📞 +359 89 222 2990
📧 krassimir.stankov@ifa.bg

Best regards,
The IFA Team`,
    },
  },
};

// ─── Helper: resolve client contact from journey ──────────────────────────────

async function resolveClientContact(base44, journeyId) {
  const journeys = await base44.asServiceRole.entities.Journey.filter({ id: journeyId });
  if (!journeys.length) return { email: null, name: null, lang: 'bg' };
  const journey = journeys[0];
  const lang = journey.language_code || 'bg';

  let email = null, name = null;

  if (journey.client_id) {
    const clients = await base44.asServiceRole.entities.Client.filter({ id: journey.client_id });
    if (clients.length) {
      email = clients[0].email;
      name = `${clients[0].first_name || ''} ${clients[0].last_name || ''}`.trim();
    }
  }

  if (!email && journey.analysis_id) {
    const analyses = await base44.asServiceRole.entities.FinancialAnalysisSubmission.filter({ id: journey.analysis_id });
    if (analyses.length) {
      email = analyses[0].client_email;
      name = name || `${analyses[0].client_first_name || ''} ${analyses[0].client_last_name || ''}`.trim();
    }
  }

  return { email, name: name || 'Клиент', lang };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // Support both direct calls and entity automation payloads
    const { type, entity_id, journey_id: payloadJourneyId, lang: payloadLang } = payload;
    // Entity automation sends: { event, data, old_data }
    const entityData = payload.data || null;

    let emailTo = null, emailSubject = null, emailBody = null;
    let resolvedJourneyId = payloadJourneyId;

    // ── 1. Signing reminder ──────────────────────────────────────────────────
    if (type === 'signing_reminder') {
      const signingId = entity_id || entityData?.id;
      let signing = entityData;
      if (!signing && signingId) {
        try {
          const found = await base44.asServiceRole.entities.SigningEvent.filter({ id: signingId });
          signing = found[0] || null;
        } catch (_) { signing = null; }
      }

      if (!signing) return Response.json({ skipped: true, reason: 'No signing event' });

      // Only send reminder for 'sent' status (pending signature)
      if (signing.status !== 'sent') {
        return Response.json({ skipped: true, reason: `Status is ${signing.status}, not sent` });
      }

      resolvedJourneyId = resolvedJourneyId || signing.journey_id;
      const { email, name, lang } = await resolveClientContact(base44, resolvedJourneyId);
      if (!email) return Response.json({ skipped: true, reason: 'No client email' });

      const useLang = payloadLang || lang;
      const tmpl = TEMPLATES.signing_reminder[useLang] || TEMPLATES.signing_reminder.bg;
      emailTo = email;
      emailSubject = tmpl.subject;
      emailBody = tmpl.body(name.split(' ')[0], signing.valid_until);
    }

    // ── 2. Payment failed ────────────────────────────────────────────────────
    else if (type === 'payment_failed') {
      const paymentId = entity_id || entityData?.id;
      let payment = entityData;
      if (!payment && paymentId) {
        try {
          const found = await base44.asServiceRole.entities.PaymentEvent.filter({ id: paymentId });
          payment = found[0] || null;
        } catch (_) { payment = null; }
      }

      if (!payment) return Response.json({ skipped: true, reason: 'No payment event' });
      if (payment.status !== 'failed') {
        return Response.json({ skipped: true, reason: `Status is ${payment.status}, not failed` });
      }

      resolvedJourneyId = resolvedJourneyId || payment.journey_id;
      const { email, name, lang } = await resolveClientContact(base44, resolvedJourneyId);
      if (!email) return Response.json({ skipped: true, reason: 'No client email' });

      const useLang = payloadLang || lang;
      const tmpl = TEMPLATES.payment_failed[useLang] || TEMPLATES.payment_failed.bg;
      emailTo = email;
      emailSubject = tmpl.subject;
      emailBody = tmpl.body(name.split(' ')[0], payment.amount, payment.currency);
    }

    // ── 3. Provider submission confirmed ────────────────────────────────────
    else if (type === 'provider_submission_confirmed') {
      const submissionId = entity_id || entityData?.id;
      let submission = entityData;
      if (!submission && submissionId) {
        try {
          const found = await base44.asServiceRole.entities.ProviderSubmission.filter({ id: submissionId });
          submission = found[0] || null;
        } catch (_) { submission = null; }
      }

      if (!submission) return Response.json({ skipped: true, reason: 'No submission' });
      if (submission.status !== 'success') {
        return Response.json({ skipped: true, reason: `Status is ${submission.status}, not success` });
      }

      resolvedJourneyId = resolvedJourneyId || submission.journey_id;
      const { email, name, lang } = await resolveClientContact(base44, resolvedJourneyId);
      if (!email) return Response.json({ skipped: true, reason: 'No client email' });

      const useLang = payloadLang || lang;
      const tmpl = TEMPLATES.provider_submission_confirmed[useLang] || TEMPLATES.provider_submission_confirmed.bg;
      emailTo = email;
      emailSubject = tmpl.subject;
      emailBody = tmpl.body(name.split(' ')[0], submission.provider_name);
    }

    else {
      return Response.json({ error: 'Unknown notification type' }, { status: 400 });
    }

    // ── Send ─────────────────────────────────────────────────────────────────
    await base44.integrations.Core.SendEmail({
      to: emailTo,
      subject: emailSubject,
      body: emailBody,
      from_name: 'Integrity Financial Advisors',
    });

    console.log(`[sendNotification] type=${type} → ${emailTo} ✓`);
    return Response.json({ success: true, type, email: emailTo });

  } catch (error) {
    console.error('[sendNotification] error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});