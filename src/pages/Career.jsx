import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Clock, GraduationCap, Building2, TrendingUp, Users, Shield,
  CheckCircle, ArrowRight, Star, Briefcase, Target, Laptop
} from 'lucide-react';

const careerSteps = [
  {
    step: '01',
    title: 'Кандидатстване',
    description: 'Изпращаш CV и кратко мотивационно писмо. Провеждаме неформален разговор, за да се опознаем.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    step: '02',
    title: 'Обучение',
    description: 'Получаваш достъп до пълната ни учебна програма — продукти, законодателство, финансово планиране и умения за разговор с клиенти.',
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    step: '03',
    title: 'Лицензиране',
    description: 'Подкрепяме те при полагане на изпитите пред КФН и придобиване на лиценз за застрахователен брокер.',
    color: 'from-violet-500 to-violet-600',
  },
  {
    step: '04',
    title: 'Първи клиенти',
    description: 'Работиш под менторството на опитен консултант, изграждаш портфолиото си и получаваш реална обратна връзка.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    step: '05',
    title: 'Самостоятелна практика',
    description: 'Разполагаш с пълна автономия — сам управляваш времето, клиентите и доходите си. Екипът е винаги зад гърба ти.',
    color: 'from-pink-500 to-rose-500',
  },
];

const benefits = [
  {
    icon: Clock,
    title: 'Гъвкаво работно време',
    description: 'Сам определяш кога и колко работиш. Без фиксирани смени — приоритет са резултатите, не часовете.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: GraduationCap,
    title: 'Безплатни обучения',
    description: 'Пълен достъп до вътрешната ни академия, включително подготовка за изпити, продуктови обучения и умения за продажби.',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: Building2,
    title: 'Помощ за отваряне на офис',
    description: 'Икономическа подкрепа при стартиране — покриваме начални разходи за офис пространство и оборудване за новите консултанти.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: TrendingUp,
    title: 'Неограничен доход',
    description: 'Твоят доход зависи изцяло от теб. Без тавани — колкото повече клиенти помагаш, толкова повече печелиш.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Users,
    title: 'Менторска програма',
    description: 'Всеки нов консултант получава опитен ментор, с когото работи рамо до рамо в първите месеци.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Shield,
    title: 'Правна и регулаторна подкрепа',
    description: 'Работиш под лиценза на IFA — покриваме регулаторните изисквания и осигуряваме правна защита.',
    color: 'bg-slate-100 text-slate-600',
  },
  {
    icon: Laptop,
    title: 'Дигитални инструменти',
    description: 'Достъп до нашата CRM платформа, финансови калкулатори и системата за генериране на финансови планове.',
    color: 'bg-cyan-50 text-cyan-600',
  },
  {
    icon: Target,
    title: 'Маркетингова подкрепа',
    description: 'Брандирани материали, дигитално присъствие и маркетингови кампании, които ти помагат да достигнеш до повече клиенти.',
    color: 'bg-rose-50 text-rose-600',
  },
];

const profiles = [
  'Имаш опит в продажбите или работата с хора',
  'Интересуваш се от лични финанси и финансово планиране',
  'Искаш да работиш самостоятелно, но не сам',
  'Търсиш дългосрочна кариера с реален потенциал за доходи',
  'Готов/а си да инвестираш в собственото си развитие',
];

export default function Career() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.15),transparent_60%)]" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-blue-400 font-medium text-sm tracking-widest uppercase mb-4 block">
              Кариера в IFA
            </span>
            <h1 className="text-4xl md:text-6xl font-light text-white mb-6">
              Изгради кариера с{' '}
              <span className="font-semibold text-blue-400">смисъл</span>{' '}
              и{' '}
              <span className="font-semibold text-cyan-400">свобода</span>
            </h1>
            <p className="text-lg text-slate-300 font-light leading-relaxed mb-10">
              Стани независим финансов консултант към Integrity Financial Advisors.
              Работи гъвкаво, помагай на хора да постигат финансовите си цели и изграждай
              собствен устойчив бизнес с пълна подкрепа зад гърба си.
            </p>
            <a href="mailto:krassimir.stankov@ifa.bg?subject=Кандидатура за финансов консултант">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-400 text-white px-10 py-6 text-lg rounded-full">
                Кандидатствай сега
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-slate-100 py-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '100%', label: 'Гъвкав график' },
              { value: '€0', label: 'Такса за обучение' },
              { value: '6+', label: 'Месеца менторство' },
              { value: 'Без таван', label: 'На доходите' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-3xl font-bold text-blue-600 mb-1">{s.value}</div>
                <div className="text-slate-500 text-sm">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Path */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-blue-600 font-medium text-sm tracking-widest uppercase mb-4 block">
              Кариерен път
            </span>
            <h2 className="text-3xl md:text-4xl font-light text-slate-900">
              От начало до <span className="font-semibold text-blue-600">самостоятелна практика</span>
            </h2>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
              Структуриран процес на въвеждане — знаеш точно какво те очаква на всяка стъпка.
            </p>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-violet-200 to-rose-200 z-0" style={{ top: '2.5rem' }} />

            <div className="grid md:grid-cols-5 gap-8 relative z-10">
              {careerSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 shadow-lg`}>
                    <span className="text-white font-bold text-xl">{step.step}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-blue-600 font-medium text-sm tracking-widest uppercase mb-4 block">
              Бенефити
            </span>
            <h2 className="text-3xl md:text-4xl font-light text-slate-900">
              Всичко, което получаваш като{' '}
              <span className="font-semibold text-blue-600">партньор на IFA</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                className="bg-slate-50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl ${benefit.color} flex items-center justify-center mb-4`}>
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">{benefit.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ideal profile */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-blue-600 font-medium text-sm tracking-widest uppercase mb-4 block">
                Подходящ ли си?
              </span>
              <h2 className="text-3xl md:text-4xl font-light text-slate-900 mb-6">
                Търсим <span className="font-semibold">хора</span>, не само{' '}
                <span className="font-semibold">автобиографии</span>
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Не е нужно да имаш финансово образование. Важното е да искаш да помагаш
                на хора и да си готов/а да учиш и растеш.
              </p>
              <ul className="space-y-3">
                {profiles.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/10">
                <img
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80"
                  alt="Team collaboration"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-5 rounded-xl shadow-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">Топ консултанти</div>
                    <div className="text-slate-500 text-xs">€4 000+/месец средно</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Briefcase className="h-14 w-14 text-white/60 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
              Готов/а да направиш следващата стъпка?
            </h2>
            <p className="text-xl text-blue-100 mb-10 font-light">
              Изпрати ни съобщение и ще се свържем с теб в рамките на 24 часа.
            </p>
            <a href="mailto:krassimir.stankov@ifa.bg?subject=Кандидатура за финансов консултант">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 px-10 py-6 text-lg rounded-full mr-4">
                Изпрати CV
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}