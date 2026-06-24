import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * notifyClientOnFollowUp
 * 
 * Entity automation: fires on FollowUpTask CREATE.
 * Sends email to client explaining that a consultant will contact them.
 * Email language matches journey.language_code.
 */

const EMAIL_TEMPLATES = {
  bg: {
    plan_auto_sell_blocked: {
      subject: 'Вашият финансов план изисква допълнителен преглед — IFA',
      body: (name) => `Уважаем/а ${name},

Благодарим Ви, че се доверихте на Integrity Financial Advisors!

Вашият финансов план беше изготвен успешно, но изисква допълнителен преглед от наш консултант, преди да продължим напред.

Един от нашите финансови съветници ще се свърже с Вас в рамките на 24 часа, за да обсъди следващите стъпки.

С уважение,
Екипът на IFA`,
    },
    health_non_automatable: {
      subject: 'Вашето приложение изисква индивидуална оценка — IFA',
      body: (name) => `Уважаем/а ${name},

Благодарим Ви за попълнения финансов анализ!

Въз основа на предоставената здравна информация, Вашето приложение изисква индивидуална оценка от нашия екип.

Консултант ще се свърже с Вас в рамките на 24 часа за насочване.

С уважение,
Екипът на IFA`,
    },
    signing_declined: {
      subject: 'Проблем с подписването на документите — IFA',
      body: (name) => `Уважаем/а ${name},

Забелязахме, че подписването на документите Ви не беше завършено успешно.

Консултант ще се свърже с Вас, за да Ви помогне да завършите процеса.

С уважение,
Екипът на IFA`,
    },
    payment_failed: {
      subject: 'Проблем с плащането — IFA',
      body: (name) => `Уважаем/а ${name},

За съжаление плащането Ви не беше обработено успешно.

Моля, не се притеснявайте — консултант ще се свърже с Вас в рамките на 24 часа, за да разрешим ситуацията.

С уважение,
Екипът на IFA`,
    },
    default: {
      subject: 'Вашето запитване е получено — IFA',
      body: (name) => `Уважаем/а ${name},

Получихме Вашето запитване и го обработваме.

Консултант от Integrity Financial Advisors ще се свърже с Вас в рамките на 24 часа.

С уважение,
Екипът на IFA`,
    },
  },
  en: {
    plan_auto_sell_blocked: {
      subject: 'Your financial plan requires additional review — IFA',
      body: (name) => `Dear ${name},

Thank you for trusting Integrity Financial Advisors!

Your financial plan has been prepared successfully, but requires an additional review by one of our consultants before proceeding.

One of our financial advisors will contact you within 24 hours to discuss the next steps.

Best regards,
The IFA Team`,
    },
    health_non_automatable: {
      subject: 'Your application requires individual assessment — IFA',
      body: (name) => `Dear ${name},

Thank you for completing the financial analysis!

Based on the health information provided, your application requires individual assessment by our team.

A consultant will contact you within 24 hours for guidance.

Best regards,
The IFA Team`,
    },
    signing_declined: {
      subject: 'Issue with document signing — IFA',
      body: (name) => `Dear ${name},

We noticed that your document signing was not completed successfully.

A consultant will contact you to help you complete the process.

Best regards,
The IFA Team`,
    },
    payment_failed: {
      subject: 'Payment issue — IFA',
      body: (name) => `Dear ${name},

Unfortunately your payment was not processed successfully.

Please don't worry — a consultant will contact you within 24 hours to resolve the situation.

Best regards,
The IFA Team`,
    },
    default: {
      subject: 'Your request has been received — IFA',
      body: (name) => `Dear ${name},

We have received your request and are processing it.

A consultant from Integrity Financial Advisors will contact you within 24 hours.

Best regards,
The IFA Team`,
    },
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const { data: task } = payload;

    if (!task?.id || !task?.journey_id) {
      return Response.json({ skipped: true, reason: 'No task data' });
    }

    // Get journey for language_code and client_id
    const journeys = await base44.asServiceRole.entities.Journey.filter({ id: task.journey_id });
    if (!journeys.length) {
      return Response.json({ skipped: true, reason: 'Journey not found' });
    }
    const journey = journeys[0];
    const lang = journey.language_code || 'bg';

    // Get client email
    let clientEmail = task.client_email || '';
    let clientName = task.client_name || '';

    if (!clientEmail && journey.client_id) {
      const clients = await base44.asServiceRole.entities.Client.filter({ id: journey.client_id });
      if (clients.length) {
        clientEmail = clients[0].email || '';
        clientName = clientName || `${clients[0].first_name || ''} ${clients[0].last_name || ''}`.trim();
      }
    }

    if (!clientEmail) {
      console.log(`No client email for task ${task.id} — skipping notification`);
      return Response.json({ skipped: true, reason: 'No client email' });
    }

    const templates = EMAIL_TEMPLATES[lang] || EMAIL_TEMPLATES['bg'];
    const reasonKey = task.reason || 'default';
    const template = templates[reasonKey] || templates['default'];

    const firstName = clientName.split(' ')[0] || clientName;

    await base44.integrations.Core.SendEmail({
      to: clientEmail,
      subject: template.subject,
      body: template.body(firstName),
      from_name: 'Integrity Financial Advisors',
    });

    console.log(`Sent follow-up notification to ${clientEmail} (reason: ${reasonKey}, lang: ${lang})`);

    return Response.json({
      success: true,
      task_id: task.id,
      email_sent_to: clientEmail,
      reason: reasonKey,
      lang,
    });

  } catch (error) {
    console.error('notifyClientOnFollowUp error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});