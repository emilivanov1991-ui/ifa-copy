import React from 'react';
import { motion } from 'framer-motion';
import {
  Phone, Mail, Calendar, AlertTriangle, Heart, FileX,
  CreditCard, PenLine, ShieldAlert, UserX, Clock, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Scenario config ──────────────────────────────────────────────────────────
const SCENARIOS = {
  mandatory_field_refused: {
    icon: UserX,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    barColor: 'bg-amber-500',
    titleBg: 'Не можем да продължим',
    titleEn: 'We Cannot Continue',
    subtitleBg: 'Задължителна информация е отказана',
    subtitleEn: 'Mandatory information was declined',
    messageBg: 'За да изготвим персонален финансов план, се нуждаем от определена основна информация. Разбираме, че може да имате притеснения — нашият консултант може да обясни защо тази информация е необходима и как е защитена.',
    messageEn: 'To create a personalized financial plan, we need certain basic information. We understand you may have concerns — our consultant can explain why this information is needed and how it is protected.',
    ctaBg: 'Свържете се с консултант',
    ctaEn: 'Contact a Consultant',
    nextStepsBg: ['Консултантът ще ви се обади в рамките на 24 часа', 'Ще обясним защо информацията е необходима', 'Ще намерим подход, удобен за вас'],
    nextStepsEn: ['A consultant will call you within 24 hours', 'We will explain why the information is needed', 'We will find an approach that works for you'],
  },
  discovery_blocked: {
    icon: ShieldAlert,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    barColor: 'bg-red-500',
    titleBg: 'Анализът е блокиран',
    titleEn: 'Analysis Blocked',
    subtitleBg: 'Необходима е допълнителна проверка',
    subtitleEn: 'Additional review required',
    messageBg: 'Вашият профил изисква допълнителна проверка от наш специалист преди да продължим. Това е стандартна процедура и не означава, че не можете да получите финансов план.',
    messageEn: 'Your profile requires additional review from one of our specialists before we can proceed. This is a standard procedure and does not mean you cannot receive a financial plan.',
    ctaBg: 'Запазете час с консултант',
    ctaEn: 'Schedule with a Consultant',
    nextStepsBg: ['Специалист ще прегледа вашия случай', 'Ще ви се обадим за уточнение', 'Ще изготвим план, подходящ за вас'],
    nextStepsEn: ['A specialist will review your case', 'We will call you for clarification', 'We will create a plan suitable for you'],
  },
  plan_auto_sell_blocked: {
    icon: AlertTriangle,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    barColor: 'bg-orange-500',
    titleBg: 'Планът изисква лична среща',
    titleEn: 'Plan Requires Personal Meeting',
    subtitleBg: 'Вашият финансов план е готов — но е сложен',
    subtitleEn: 'Your financial plan is ready — but it is complex',
    messageBg: 'Изготвихме вашия персонален финансов план. Поради неговата сложност и размер, препоръчваме лична среща с консултант, за да го представим и обясним подробно.',
    messageEn: 'We have prepared your personalized financial plan. Due to its complexity and scope, we recommend a personal meeting with a consultant to present and explain it in detail.',
    ctaBg: 'Запазете среща',
    ctaEn: 'Schedule a Meeting',
    nextStepsBg: ['Вашият план е готов и изчаква', 'Консултантът ще го представи лично', 'Ще отговорим на всички въпроси'],
    nextStepsEn: ['Your plan is ready and waiting', 'A consultant will present it in person', 'We will answer all your questions'],
    highlight: true,
  },
  user_rejected_plan: {
    icon: FileX,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    barColor: 'bg-slate-500',
    titleBg: 'Разбираме вашето решение',
    titleEn: 'We Understand Your Decision',
    subtitleBg: 'Планът беше отхвърлен',
    subtitleEn: 'The plan was declined',
    messageBg: 'Вашето решение е напълно разбираемо. Ако имате въпроси, искате промени или желаете да разгледате алтернативи, консултантът ни е на ваше разположение.',
    messageEn: 'Your decision is completely understandable. If you have questions, want changes, or would like to explore alternatives, our consultant is at your disposal.',
    ctaBg: 'Обсъдете с консултант',
    ctaEn: 'Discuss with Consultant',
    nextStepsBg: ['Можем да адаптираме плана', 'Ще разгледаме алтернативни варианти', 'Никакви задължения — само разговор'],
    nextStepsEn: ['We can adapt the plan', 'We will explore alternative options', 'No obligations — just a conversation'],
  },
  application_incomplete: {
    icon: FileX,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-700',
    barColor: 'bg-yellow-500',
    titleBg: 'Заявлението е непълно',
    titleEn: 'Application Incomplete',
    subtitleBg: 'Необходими са допълнителни данни',
    subtitleEn: 'Additional data is required',
    messageBg: 'Вашето заявление е почти готово, но липсват някои данни. Консултантът ни ще ви помогне да го довършите бързо и лесно.',
    messageEn: 'Your application is almost complete, but some data is missing. Our consultant will help you finish it quickly and easily.',
    ctaBg: 'Свържете се за помощ',
    ctaEn: 'Contact for Help',
    nextStepsBg: ['Консултантът ще ви се обади', 'Ще попълним заявлението заедно', 'Процесът ще продължи веднага след това'],
    nextStepsEn: ['A consultant will call you', 'We will complete the application together', 'The process will continue immediately after'],
  },
  health_non_automatable: {
    icon: Heart,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    barColor: 'bg-rose-500',
    titleBg: 'Здравният профил изисква специалист',
    titleEn: 'Health Profile Requires a Specialist',
    subtitleBg: 'Автоматичното обработване не е възможно',
    subtitleEn: 'Automatic processing is not possible',
    messageBg: 'Вашите здравни данни изискват индивидуална оценка от застрахователен специалист. Това е стандартна процедура при по-сложни здравни профили. Ще направим всичко възможно за намиране на подходящо решение.',
    messageEn: 'Your health data requires an individual assessment from an insurance specialist. This is a standard procedure for more complex health profiles. We will do our best to find a suitable solution.',
    ctaBg: 'Свържете се с нас',
    ctaEn: 'Contact Us',
    nextStepsBg: ['Здравен специалист ще прегледа случая', 'Ще предложим персонализирани условия', 'Вашите данни са напълно защитени'],
    nextStepsEn: ['A health specialist will review the case', 'We will offer personalized terms', 'Your data is fully protected'],
    priority: 'urgent',
  },
  signing_failed: {
    icon: PenLine,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    barColor: 'bg-red-500',
    titleBg: 'Подписването е неуспешно',
    titleEn: 'Signing Failed',
    subtitleBg: 'Не успяхме да завършим електронното подписване',
    subtitleEn: 'We could not complete the electronic signing',
    messageBg: 'Процесът на електронно подписване не беше завършен. Можем да опитаме отново или да намерим алтернативен начин за подписване на документите.',
    messageEn: 'The electronic signing process was not completed. We can try again or find an alternative way to sign the documents.',
    ctaBg: 'Свържете се с консултант',
    ctaEn: 'Contact a Consultant',
    nextStepsBg: ['Ще опитаме подписването отново', 'Алтернативно — подписване на хартия', 'Договорът остава валиден'],
    nextStepsEn: ['We will try the signing again', 'Alternatively — signing on paper', 'The agreement remains valid'],
  },
  payment_failed: {
    icon: CreditCard,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    barColor: 'bg-red-500',
    titleBg: 'Плащането е неуспешно',
    titleEn: 'Payment Failed',
    subtitleBg: 'Транзакцията не можа да бъде завършена',
    subtitleEn: 'The transaction could not be completed',
    messageBg: 'Плащането не беше успешно. Вашият план и всички документи са запазени. Ще ви помогнем да завършите плащането и да активираме вашите продукти.',
    messageEn: 'The payment was not successful. Your plan and all documents are saved. We will help you complete the payment and activate your products.',
    ctaBg: 'Опитайте отново или се свържете',
    ctaEn: 'Try Again or Contact Us',
    nextStepsBg: ['Проверете данните на картата', 'Опитайте с друга карта или банков превод', 'Консултантът ще ви помогне'],
    nextStepsEn: ['Check your card details', 'Try with another card or bank transfer', 'A consultant will assist you'],
  },
};

// ─── Contact info ─────────────────────────────────────────────────────────────
const CONTACT = {
  phone: '+359 89 222 2990',
  email: 'krassimir.stankov@ifa.bg',
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function GracefulStopScreen({
  reason = 'discovery_blocked',
  reasonDetail = null,
  lang = 'bg',
  onRetry = null,
  journeyId = null,
  clientName = null,
}) {
  const isEN = lang === 'en';
  const scenario = SCENARIOS[reason] || SCENARIOS['discovery_blocked'];
  const Icon = scenario.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-lg">
        {/* Top bar accent */}
        <div className={`h-1.5 w-full rounded-t-2xl ${scenario.barColor}`} />

        <div className="bg-white rounded-b-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center border-b border-slate-100">
            <div className={`w-20 h-20 rounded-full ${scenario.iconBg} flex items-center justify-center mx-auto mb-5`}>
              <Icon className={`h-10 w-10 ${scenario.iconColor}`} />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              {isEN ? scenario.titleEn : scenario.titleBg}
            </h1>
            <p className={`text-sm font-medium ${scenario.iconColor}`}>
              {isEN ? scenario.subtitleEn : scenario.subtitleBg}
            </p>

            {clientName && (
              <p className="mt-3 text-slate-500 text-sm">
                {isEN ? `Hello, ${clientName}` : `Здравейте, ${clientName}`}
              </p>
            )}
          </div>

          {/* Message */}
          <div className="px-8 py-6">
            <p className="text-slate-600 leading-relaxed text-center">
              {isEN ? scenario.messageEn : scenario.messageBg}
            </p>

            {/* Reason detail */}
            {reasonDetail && (
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-500 text-center">
                {reasonDetail}
              </div>
            )}

            {/* Next steps */}
            <div className="mt-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 text-center">
                {isEN ? 'What happens next' : 'Следващи стъпки'}
              </p>
              <div className="space-y-2">
                {(isEN ? scenario.nextStepsEn : scenario.nextStepsBg).map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-blue-600" />
                    </div>
                    <p className="text-sm text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact actions */}
          <div className="px-8 pb-8 space-y-3">
            <a href={`tel:${CONTACT.phone}`} className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-12 text-base font-medium gap-2">
                <Phone className="h-5 w-5" />
                {isEN ? scenario.ctaEn : scenario.ctaBg}
              </Button>
            </a>

            <div className="grid grid-cols-2 gap-3">
              <a href={`mailto:${CONTACT.email}`} className="block">
                <Button variant="outline" className="w-full rounded-xl h-11 gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  {isEN ? 'Email us' : 'Имейл'}
                </Button>
              </a>
              {onRetry ? (
                <Button
                  variant="outline"
                  onClick={onRetry}
                  className="w-full rounded-xl h-11 gap-2 text-sm"
                >
                  <Clock className="h-4 w-4" />
                  {isEN ? 'Try again' : 'Опитайте пак'}
                </Button>
              ) : (
                <a href={`https://calendly.com`} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="outline" className="w-full rounded-xl h-11 gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    {isEN ? 'Schedule' : 'Запазете час'}
                  </Button>
                </a>
              )}
            </div>

            {/* Contact details */}
            <div className="pt-2 flex items-center justify-center gap-6 text-xs text-slate-400">
              <span>{CONTACT.phone}</span>
              <span>·</span>
              <span>{CONTACT.email}</span>
            </div>
          </div>
        </div>

        {/* IFA branding */}
        <div className="text-center mt-6">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/258cedab0_output-onlinepngtools.png"
            alt="Integrity Financial Advisors"
            className="h-10 w-auto mx-auto opacity-40"
          />
          <p className="text-xs text-slate-400 mt-2">
            Integrity Financial Advisors · КФН Решение №&nbsp;33–ЗБ/2026
          </p>
        </div>
      </div>
    </motion.div>
  );
}