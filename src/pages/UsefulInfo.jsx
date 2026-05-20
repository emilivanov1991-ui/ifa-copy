import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, ExternalLink, ShieldCheck, Award } from 'lucide-react';

const documents = [
  {
    title: 'Общи условия',
    description: 'Общи условия за ползване на уебсайт и предоставяне на услуги по застрахователно посредничество от разстояние.',
    url: 'https://media.base44.com/files/public/6925a960748714fa4828395a/be56e5c48_IFABG_OBSHTI_USLOVIA_01-05-2026_OK.pdf',
    date: '01.05.2026',
  },
  {
    title: 'Политика за защита на личните данни (GDPR)',
    description: 'Информация относно обработването, съхранението и защитата на личните ви данни съгласно Регламент (ЕС) 2016/679.',
    url: 'https://media.base44.com/files/public/6925a960748714fa4828395a/64e16b01d_IFABG_GDPR_01-05-2026_OK.pdf',
    date: '01.05.2026',
  },
  {
    title: 'Политика за използване на бисквитки',
    description: 'Информация за използваните бисквитки на сайта, техните цели и как можете да ги управлявате.',
    url: 'https://media.base44.com/files/public/6925a960748714fa4828395a/799760853_IFABG_COOKIES_01-05-2026_OK.pdf',
    date: '01.05.2026',
  },
  {
    title: 'Правилник за жалби и алтернативно решаване на спорове',
    description: 'Процедури и срокове за подаване на жалби, права на ползвателите и начини за алтернативно решаване на спорове.',
    url: 'https://media.base44.com/files/public/6925a960748714fa4828395a/62896672f_IFABG_COMPLAINTS_01-05-2026_OK.pdf',
    date: '01.05.2026',
  },
  {
    title: 'Договор за възлагане на посредничество',
    description: 'Стандартен договор, уреждащ взаимоотношенията между клиента и застрахователния брокер при сключване на застраховки.',
    url: 'https://media.base44.com/files/public/6925a960748714fa4828395a/f602d9e94_IFA_VDOG_2026_OK.pdf',
    date: '01.05.2026',
  },
];

const certifications = [
  {
    icon: ShieldCheck,
    title: 'Лицензирани от КФН',
    subtitle: 'Решение № 33–ЗБ от 27.01.2026 г.',
    description: 'Integrity Financial Advisors е лицензиран застрахователен брокер, вписан в публичния електронен регистър на застрахователните брокери, воден от Комисията за финансов надзор на Република България.',
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    badge: 'КФН',
    link: { url: 'https://www.fsc.bg/wp-content/uploads/2026/01/33.pdf', label: 'Провери в регистъра на КФН' },
  },
  {
    icon: Award,
    title: 'ISO Сертификати',
    subtitle: 'Международни стандарти за качество',
    description: 'Дружеството работи при спазване на международни стандарти за качество на управление и защита на данните. Сертификатите ще бъдат публикувани след финализиране.',
    color: 'bg-slate-50 border-slate-200',
    iconColor: 'text-slate-600',
    badge: 'ISO',
    link: null,
  },
];

export default function UsefulInfo() {
  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14"
        >
          <span className="text-blue-600 font-medium text-sm tracking-widest uppercase mb-3 block">
            Прозрачност и доверие
          </span>
          <h1 className="text-3xl md:text-4xl font-light text-slate-900">
            Полезна <span className="font-semibold text-blue-600">информация</span>
          </h1>
          <p className="text-slate-500 mt-3 max-w-xl">
            Всички документи, регулаторна информация и сертификати на Integrity Financial Advisors.
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-5 gap-10">

          {/* LEFT — Documents */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-5">
              Документи
            </h3>
            <div className="space-y-3">
              {documents.map((doc, index) => (
                <motion.a
                  key={doc.title}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.07 }}
                  className="flex items-start gap-4 bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-900 text-sm leading-tight">{doc.title}</p>
                      <Download className="h-4 w-4 text-slate-400 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
                    </div>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">{doc.description}</p>
                    <p className="text-slate-400 text-xs mt-1.5">в сила от {doc.date}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>

          {/* RIGHT — Certifications */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-5">
              Регулация и сертификати
            </h3>
            <div className="space-y-5">
              {certifications.map((cert, index) => (
                <motion.div
                  key={cert.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-xl p-5 border ${cert.color}`}
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                      <cert.icon className={`h-6 w-6 ${cert.iconColor}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">{cert.title}</p>
                        <span className="text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                          {cert.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{cert.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{cert.description}</p>

                  {cert.link && (
                    <a
                      href={cert.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium mt-3"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {cert.link.label}
                    </a>
                  )}

                  {cert.badge === 'ISO' && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {['ISO 9001', 'ISO 27001'].map((iso) => (
                        <div key={iso} className="bg-white rounded-lg border border-slate-200 p-3 text-center">
                          <div className="text-slate-400 text-xs mb-1">Предстои</div>
                          <div className="font-bold text-slate-700 text-sm">{iso}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}

              <div className="bg-white rounded-xl border border-slate-200 p-4 text-sm text-slate-600">
                <p className="font-medium text-slate-800 mb-1">Въпроси относно документите?</p>
                <p>Свържете се с нас на <a href="mailto:krassimir.stankov@ifa.bg" className="text-blue-600 hover:underline">krassimir.stankov@ifa.bg</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}