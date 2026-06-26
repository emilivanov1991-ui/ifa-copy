import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { jsPDF } from 'npm:jspdf@2.5.2';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(val, fallback = '—') {
  if (val === null || val === undefined || val === '') return fallback;
  return String(val);
}

function fmtDate(val) {
  if (!val) return '—';
  try { return new Date(val).toLocaleDateString('bg-BG'); } catch { return fmt(val); }
}

function fmtCurrency(val, currency = 'EUR') {
  if (!val && val !== 0) return '—';
  return `${Number(val).toFixed(2)} ${currency}`;
}

function fmtBool(val) {
  if (val === true) return 'Да';
  if (val === false) return 'Не';
  return '—';
}

// ─── PDF Building Blocks ──────────────────────────────────────────────────────

const BLUE = [37, 99, 235];
const DARK = [30, 41, 59];
const GRAY = [100, 116, 139];
const LIGHT = [248, 250, 252];

function addPageHeader(doc, title, subtitle = '') {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, W, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.text(title, 14, 13);
  if (subtitle) {
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(subtitle, 14, 21);
  }
  doc.setTextColor(...DARK);
  return 36; // next Y
}

function addPageFooter(doc, pageNum, totalPages, footerText = '') {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  doc.setFillColor(241, 245, 249);
  doc.rect(0, H - 14, W, 14, 'F');
  doc.setFontSize(7);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...GRAY);
  if (footerText) {
    const lines = doc.splitTextToSize(footerText, W - 50);
    doc.text(lines[0], 14, H - 7);
  }
  doc.text(`Стр. ${pageNum} / ${totalPages}`, W - 14, H - 7, { align: 'right' });
}

function addSectionTitle(doc, text, y) {
  doc.setFillColor(...LIGHT);
  doc.rect(14, y - 5, doc.internal.pageSize.getWidth() - 28, 10, 'F');
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...BLUE);
  doc.text(text, 16, y + 1);
  doc.setTextColor(...DARK);
  return y + 10;
}

function addFieldRow(doc, label, value, y, col2X = 80) {
  doc.setFontSize(8.5);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...GRAY);
  doc.text(fmt(label) + ':', 16, y);
  doc.setTextColor(...DARK);
  doc.setFont(undefined, 'bold');
  const W = doc.internal.pageSize.getWidth();
  const lines = doc.splitTextToSize(fmt(value), W - col2X - 14);
  doc.text(lines, col2X, y);
  doc.setFont(undefined, 'normal');
  return y + Math.max(lines.length * 5, 6);
}

function checkPageBreak(doc, y, threshold = 265) {
  if (y > threshold) {
    doc.addPage();
    return 36;
  }
  return y;
}

// ─── Document Generators ──────────────────────────────────────────────────────

/** Generic Application Form — used as baseline for all provider forms */
function buildApplicationFormPDF(analysis, application, plan, client, templateConfig = {}) {
  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();

  const providerName = templateConfig.provider || 'Застраховател';
  const documentTitle = templateConfig.title || 'ЗАЯВЛЕНИЕ ЗА ЗАСТРАХОВКА';

  // PAGE 1: Personal Data
  let y = addPageHeader(doc, documentTitle, providerName);

  // Date + reference
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(`Дата: ${new Date().toLocaleDateString('bg-BG')}`, W - 14, y, { align: 'right' });
  y += 8;

  y = addSectionTitle(doc, '1. ДАННИ ЗА ЗАСТРАХОВАНИЯ', y);

  y = addFieldRow(doc, 'Три имена', `${fmt(analysis.client_first_name)} ${fmt(analysis.client_middle_name || '')} ${fmt(analysis.client_last_name)}`, y);
  y = addFieldRow(doc, 'ЕГН', fmt(analysis.client_egn), y);
  y = addFieldRow(doc, 'Дата на раждане', fmtDate(analysis.client_birthdate), y);
  y = addFieldRow(doc, 'Място на раждане', fmt(analysis.client_birthplace), y);
  y = addFieldRow(doc, 'Пол', analysis.client_gender === 'male' ? 'Мъж' : analysis.client_gender === 'female' ? 'Жена' : '—', y);
  y = addFieldRow(doc, 'Гражданство', analysis.client_nationality === 'bulgarian' ? 'Български' : fmt(analysis.client_nationality), y);
  y = addFieldRow(doc, 'Адрес', fmt(analysis.client_address), y);
  y = addFieldRow(doc, 'Телефон', fmt(analysis.client_phone), y);
  y = addFieldRow(doc, 'Email', fmt(analysis.client_email), y);
  y = addFieldRow(doc, 'ЛК номер', fmt(analysis.client_id_number), y);
  y = addFieldRow(doc, 'ЛК валидна до', fmtDate(analysis.client_id_valid_until), y);
  y = addFieldRow(doc, 'Политически свързано лице (PEP)', fmtBool(analysis.client_is_pep), y);
  y += 4;

  y = addSectionTitle(doc, '2. ТРУДОВА ЗАЕТОСТ И ДОХОДИ', y);
  y = addFieldRow(doc, 'Заето лице', fmtBool(analysis.client_is_employed), y);
  y = addFieldRow(doc, 'Длъжност', fmt(analysis.client_job_description), y);
  y = addFieldRow(doc, 'Работодател', fmt(analysis.client_employer_name), y);
  y = addFieldRow(doc, 'Вид договор', analysis.client_contract_type === 'labor' ? 'Трудов' : 'Граждански', y);
  y = addFieldRow(doc, 'Вид заетост', analysis.client_contract_term === 'permanent' ? 'Безсрочна' : 'Срочна', y);
  y = addFieldRow(doc, 'Нетен месечен доход', fmtCurrency(analysis.client_net_income), y);
  y += 4;

  y = addSectionTitle(doc, '3. ЗДРАВЕН СТАТУС', y);
  y = addFieldRow(doc, 'Добро здравословно състояние', fmtBool(analysis.client_is_good_health), y);
  if (!analysis.client_is_good_health && analysis.client_health_explanation) {
    y = addFieldRow(doc, 'Обяснение', fmt(analysis.client_health_explanation), y);
  }
  y = addFieldRow(doc, 'Пушач', fmtBool(analysis.client_is_smoker), y);
  y = addFieldRow(doc, 'Височина (cm)', fmt(analysis.client_height_cm), y);
  y = addFieldRow(doc, 'Тегло (kg)', fmt(analysis.client_weight_kg), y);

  // PAGE 2: Products & Beneficiaries
  doc.addPage();
  y = addPageHeader(doc, documentTitle, `${providerName} — Продукти и бенефициенти`);

  y = addSectionTitle(doc, '4. ИЗБРАНИ ПРОДУКТИ', y);

  const products = application?.selected_products || [];
  if (products.length === 0) {
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY);
    doc.text('Няма избрани продукти', 16, y);
    y += 8;
  } else {
    products.forEach((prod, i) => {
      y = checkPageBreak(doc, y);
      doc.setFontSize(8.5);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(...BLUE);
      doc.text(`${i + 1}. ${fmt(prod.product_name)} — ${fmt(prod.provider)}`, 16, y);
      doc.setTextColor(...DARK);
      y += 5;
      doc.setFont(undefined, 'normal');
      y = addFieldRow(doc, 'Месечна премия', fmtCurrency(prod.monthly_premium), y);
      y = addFieldRow(doc, 'Застрахована сума', fmtCurrency(prod.coverage_amount), y);
      y = addFieldRow(doc, 'Периодичност', fmt(prod.payment_frequency), y);
      y += 3;
    });
  }

  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, '5. БЕНЕФИЦИЕНТИ', y);

  const primBen = application?.beneficiary_data?.primary_beneficiaries || [];
  if (primBen.length === 0) {
    doc.setFontSize(8.5); doc.setTextColor(...GRAY);
    doc.text('Не са посочени бенефициенти', 16, y); y += 8;
  } else {
    primBen.forEach((b, i) => {
      y = checkPageBreak(doc, y);
      doc.setFontSize(8.5); doc.setFont(undefined, 'bold'); doc.setTextColor(...DARK);
      doc.text(`Бенефициент ${i + 1}:`, 16, y); y += 5; doc.setFont(undefined, 'normal');
      y = addFieldRow(doc, 'Три имена', fmt(b.full_name), y);
      y = addFieldRow(doc, 'ЕГН', fmt(b.egn), y);
      y = addFieldRow(doc, 'Родство', fmt(b.relationship), y);
      y = addFieldRow(doc, 'Дял (%)', fmt(b.percentage), y);
      y += 3;
    });
  }

  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, '6. БАНКОВА СМЕТКА ЗА ИЗПЛАЩАНИЯ', y);
  const bank = application?.bank_account || {};
  y = addFieldRow(doc, 'Титуляр', fmt(bank.account_holder), y);
  y = addFieldRow(doc, 'IBAN', fmt(bank.iban), y);
  y = addFieldRow(doc, 'Банка', fmt(bank.bank_name), y);
  y = addFieldRow(doc, 'SWIFT', fmt(bank.swift), y);

  // PAGE 3: Declarations & Signatures
  doc.addPage();
  y = addPageHeader(doc, documentTitle, `${providerName} — Декларации и подписи`);

  y = addSectionTitle(doc, '7. ДЕКЛАРАЦИИ', y);

  const declarations = [
    'Декларирам, че всички посочени данни са верни и пълни.',
    'Декларирам, че не укривам обстоятелства, съществени за преценката на риска.',
    'Запознат/а съм с Общите условия на застраховането.',
    'Съгласен/на съм с обработката на личните ми данни съгласно GDPR.',
    'Уведомен/а съм за правото ми на отказ в 14-дневен срок.',
  ];

  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  declarations.forEach(decl => {
    y = checkPageBreak(doc, y);
    doc.text(`☐  ${decl}`, 16, y);
    y += 7;
  });

  y += 10;
  y = addSectionTitle(doc, '8. ПОДПИСИ', y);

  y += 5;
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  const dateLabel = `Дата: ${new Date().toLocaleDateString('bg-BG')}`;
  doc.text(dateLabel, 16, y);
  y += 12;

  // Signature line — client
  doc.setDrawColor(...GRAY);
  doc.line(16, y, 95, y);
  doc.setFontSize(7.5);
  doc.text('Подпис на застрахования', 16, y + 5);

  // Signature line — advisor
  doc.line(110, y, 190, y);
  doc.text('Подпис на консултанта', 110, y + 5);

  if (templateConfig.footer_text) {
    y += 20;
    y = checkPageBreak(doc, y, 250);
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    const footerLines = doc.splitTextToSize(templateConfig.footer_text, W - 28);
    doc.text(footerLines, 14, y);
  }

  // Add footers to all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addPageFooter(doc, i, totalPages, 'Документът е генериран автоматично от ИНТЕГРИТИ ФАЙНЕНШЪЛ АДВАЙЗЪРС ЕООД · КФН Решение №33-ЗБ/27.01.2026');
  }

  return doc;
}

/** GDPR Consent Document */
function buildGDPRConsentPDF(analysis, application) {
  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();

  let y = addPageHeader(doc, 'ДЕКЛАРАЦИЯ ЗА ЗАЩИТА НА ЛИЧНИТЕ ДАННИ', 'GDPR — Регламент (ЕС) 2016/679');

  y += 4;
  doc.setFontSize(9);
  doc.setTextColor(...DARK);

  const introText = `Долуподписаният/та ${fmt(analysis.client_first_name)} ${fmt(analysis.client_last_name)}, ЕГН ${fmt(analysis.client_egn)}, давам следните съгласия за обработка на личните ми данни от „ИНТЕГРИТИ ФАЙНЕНШЪЛ АДВАЙЗЪРС" ЕООД:`;
  const introLines = doc.splitTextToSize(introText, W - 28);
  doc.text(introLines, 14, y);
  y += introLines.length * 5 + 8;

  const consentItems = [
    { key: 'gdpr_consent_a', label: 'Съгласие A — Обработка на лични данни за целите на финансовия анализ, подготовката на финансов план и посредническа дейност по застраховане.' },
    { key: 'gdpr_consent_b', label: 'Съгласие Б — Получаване на маркетингови съобщения, информационни бюлетини и персонализирани оферти.' },
    { key: 'gdpr_consent_c', label: 'Съгласие В — Предоставяне на данни на трети лица (застрахователи, пенсионни фондове, банки) за целите на сключване на договори.' },
  ];

  consentItems.forEach(item => {
    y = checkPageBreak(doc, y);
    const checked = analysis[item.key] ? '☑' : '☐';
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK);
    const lines = doc.splitTextToSize(`${checked}  ${item.label}`, W - 28);
    doc.text(lines, 14, y);
    y += lines.length * 5 + 6;
  });

  y += 6;
  y = addSectionTitle(doc, 'ПРАВА НА СУБЕКТА НА ДАННИ', y);
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  const rights = 'Имате право на достъп, коригиране, изтриване, ограничаване на обработката, преносимост и възражение. Можете да оттеглите съгласието си по всяко време, като се свържете с нас на: krassimir.stankov@ifa.bg';
  const rightLines = doc.splitTextToSize(rights, W - 28);
  doc.text(rightLines, 14, y);
  y += rightLines.length * 5 + 10;

  y = addFieldRow(doc, 'Дата на подписване', new Date().toLocaleDateString('bg-BG'), y);
  y = addFieldRow(doc, 'Три имена', `${fmt(analysis.client_first_name)} ${fmt(analysis.client_middle_name || '')} ${fmt(analysis.client_last_name)}`, y);
  y = addFieldRow(doc, 'ЕГН', fmt(analysis.client_egn), y);

  y += 15;
  doc.setDrawColor(...GRAY);
  doc.line(14, y, 90, y);
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text('Подпис', 14, y + 5);

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addPageFooter(doc, i, totalPages, 'ИНТЕГРИТИ ФАЙНЕНШЪЛ АДВАЙЗЪРС ЕООД · ЕИК: · Регистриран застрахователен брокер · КФН №33-ЗБ/27.01.2026');
  }

  return doc;
}

/** Disclosure Document (pre-contractual info) */
function buildDisclosurePDF(analysis, plan) {
  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();

  let y = addPageHeader(doc, 'ПРЕДДОГОВОРНА ИНФОРМАЦИЯ', 'Застрахователно посредничество — Задължително разкриване');

  y += 4;
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);

  const sections = [
    {
      title: 'За посредника',
      text: '„ИНТЕГРИТИ ФАЙНЕНШЪЛ АДВАЙЗЪРС" ЕООД е регистриран застрахователен брокер с Решение на КФН №33-ЗБ от 27.01.2026 г. Дружеството действа като независим посредник и не е обвързан изключително с конкретен застраховател.'
    },
    {
      title: 'Базис на препоръката',
      text: 'Препоръките се основават на обективен анализ на пазара и личния финансов профил на клиента, изготвен съгласно изискванията на Директива (ЕС) 2016/97 (IDD) и Наредба №49.'
    },
    {
      title: 'Конфликт на интереси',
      text: 'Дружеството получава комисиона от застрахователите при сключване на договор. Размерът на комисионата не влияе на обективността на съветите. При поискване може да бъде предоставена допълнителна информация.'
    },
    {
      title: 'Право на жалба',
      text: 'Имате право да подадете жалба до КФН (www.fsc.bg) или до дружеството на: krassimir.stankov@ifa.bg. Жалбата се разглежда в 30-дневен срок.'
    },
    {
      title: 'Приложимо право',
      text: 'Договорните отношения се уреждат от Кодекса за застраховането (КЗ), Кодекса на МКП и Bulgarian law. Компетентен съд — Районен съд, гр. София.'
    },
  ];

  sections.forEach(section => {
    y = checkPageBreak(doc, y);
    y = addSectionTitle(doc, section.title.toUpperCase(), y);
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK);
    const lines = doc.splitTextToSize(section.text, W - 28);
    doc.text(lines, 14, y);
    y += lines.length * 5 + 6;
  });

  // Products summary
  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, 'ПРЕПОРЪЧАНИ ПРОДУКТИ', y);
  (plan?.products || []).forEach((p, i) => {
    y = checkPageBreak(doc, y);
    doc.setFontSize(8.5);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...DARK);
    doc.text(`${i + 1}. ${fmt(p.product_name)} — ${fmt(p.provider)}`, 16, y);
    doc.setFont(undefined, 'normal');
    y += 5;
    doc.setTextColor(...GRAY);
    doc.text(`   Месечна премия: ${fmtCurrency(p.monthly_premium)} | Покритие: ${fmtCurrency(p.coverage_amount)}`, 16, y);
    y += 7;
  });

  // Confirmation
  y = checkPageBreak(doc, y, 230);
  y += 8;
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  doc.text('☐  Потвърждавам, че съм получил/а и прочел/а настоящата преддоговорна информация.', 14, y);
  y += 14;
  doc.setDrawColor(...GRAY);
  doc.line(14, y, 90, y);
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text('Подпис на клиента', 14, y + 5);
  doc.text(`Дата: ${new Date().toLocaleDateString('bg-BG')}`, 110, y + 5);

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addPageFooter(doc, i, totalPages, 'ИНТЕГРИТИ ФАЙНЕНШЪЛ АДВАЙЗЪРС ЕООД · КФН Решение №33-ЗБ/27.01.2026 · Задължителен документ по КЗ чл. 324');
  }

  return doc;
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const {
      journey_id,
      application_id,
      document_types, // array: ['application_form', 'gdpr_consent', 'disclosure_document'] — or 'all'
      provider,       // optional: filter to specific provider
      save_to_db,     // boolean — save GeneratedDocument records
    } = await req.json();

    if (!journey_id) {
      return Response.json({ error: 'journey_id е задължително' }, { status: 400 });
    }

    // Load all required data in parallel
    const [journeys, applications, plans, analyses] = await Promise.all([
      base44.asServiceRole.entities.Journey.filter({ id: journey_id }),
      application_id
        ? base44.asServiceRole.entities.ApplicationData.filter({ id: application_id })
        : base44.asServiceRole.entities.ApplicationData.filter({ journey_id }),
      null, // loaded after we have plan_id
      null,
    ]);

    const journey = journeys[0];
    if (!journey) return Response.json({ error: 'Journey не е намерен' }, { status: 404 });

    const application = applications[0] || null;

    const [planArr, analysisArr] = await Promise.all([
      journey.plan_id ? base44.asServiceRole.entities.FinancialPlan.filter({ id: journey.plan_id }) : [],
      journey.analysis_id ? base44.asServiceRole.entities.FinancialAnalysisSubmission.filter({ id: journey.analysis_id }) : [],
    ]);

    const plan = planArr[0] || null;
    const analysis = analysisArr[0] || {};

    // Determine which document types to generate
    const allTypes = ['gdpr_consent', 'disclosure_document', 'application_form'];
    const requestedTypes = document_types === 'all' ? allTypes : (document_types || allTypes);

    const generated = [];

    for (const docType of requestedTypes) {
      let doc = null;
      let docName = '';

      try {
        if (docType === 'gdpr_consent') {
          doc = buildGDPRConsentPDF(analysis, application);
          docName = `GDPR_Съгласие_${analysis.client_last_name || 'Клиент'}_${new Date().toISOString().slice(0, 10)}.pdf`;
        } else if (docType === 'disclosure_document') {
          doc = buildDisclosurePDF(analysis, plan);
          docName = `Преддоговорна_информация_${analysis.client_last_name || 'Клиент'}_${new Date().toISOString().slice(0, 10)}.pdf`;
        } else if (docType === 'application_form') {
          // Generate one application form per provider in the plan
          const providers = provider
            ? [provider]
            : [...new Set((plan?.products || []).map(p => p.provider).filter(Boolean))];

          if (providers.length === 0) {
            // Generic application form
            doc = buildApplicationFormPDF(analysis, application, plan, null, { provider: 'Застраховател', title: 'ЗАЯВЛЕНИЕ ЗА ЗАСТРАХОВКА' });
            docName = `Заявление_${analysis.client_last_name || 'Клиент'}_${new Date().toISOString().slice(0, 10)}.pdf`;

            const pdfBase64 = doc.output('dataurlstring').split(',')[1];
            generated.push({ doc_type: docType, provider: 'generic', filename: docName, pdf_base64: pdfBase64 });
            continue;
          }

          for (const prov of providers) {
            const provDoc = buildApplicationFormPDF(analysis, application, plan, null, {
              provider: prov,
              title: `ЗАЯВЛЕНИЕ ЗА ЗАСТРАХОВКА — ${prov.toUpperCase()}`,
            });
            const provName = `Заявление_${prov}_${analysis.client_last_name || 'Клиент'}_${new Date().toISOString().slice(0, 10)}.pdf`;
            const pdfBase64 = provDoc.output('dataurlstring').split(',')[1];

            let savedId = null;
            if (save_to_db) {
              const saved = await base44.asServiceRole.entities.GeneratedDocument.create({
                journey_id,
                application_id: application?.id,
                plan_id: journey.plan_id,
                document_name: provName,
                document_type: 'application_form',
                provider: prov,
                generation_status: 'ready',
                generated_at: new Date().toISOString(),
                signing_status: 'pending',
              });
              savedId = saved?.id;
            }

            generated.push({ doc_type: 'application_form', provider: prov, filename: provName, pdf_base64: pdfBase64, saved_id: savedId });
          }
          continue;
        }

        if (doc) {
          const pdfBase64 = doc.output('dataurlstring').split(',')[1];

          let savedId = null;
          if (save_to_db) {
            const saved = await base44.asServiceRole.entities.GeneratedDocument.create({
              journey_id,
              application_id: application?.id,
              plan_id: journey.plan_id,
              document_name: docName,
              document_type: docType,
              generation_status: 'ready',
              generated_at: new Date().toISOString(),
              signing_status: docType === 'gdpr_consent' ? 'pending' : 'not_required',
            });
            savedId = saved?.id;
          }

          generated.push({ doc_type: docType, filename: docName, pdf_base64: pdfBase64, saved_id: savedId });
        }
      } catch (docErr) {
        console.error(`Error generating ${docType}:`, docErr.message);
        generated.push({ doc_type: docType, error: docErr.message });
      }
    }

    return Response.json({ success: true, documents: generated, count: generated.length });

  } catch (error) {
    console.error('generateApplicationDocuments error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});