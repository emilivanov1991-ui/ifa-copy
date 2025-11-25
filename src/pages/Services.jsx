import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  PiggyBank, 
  TrendingUp, 
  Shield, 
  Home, 
  GraduationCap, 
  Heart,
  CheckCircle,
  Building2,
  Wallet
} from 'lucide-react';

const services = [
  {
    icon: TrendingUp,
    title: 'Управление на инвестиции',
    description: 'Персонализирано управление на портфолио, проектирано да постигне вашите дългосрочни финансови цели с подходящи стратегии за риска.',
    features: ['Диверсифицирани портфолиа', 'Оценка на риска', 'Редовно ребалансиране', 'Данъчно ефективно инвестиране']
  },
  {
    icon: PiggyBank,
    title: 'Пенсионно планиране',
    description: 'Изчерпателни пенсионни стратегии, за да се насладите на заслужения начин на живот в златните години.',
    features: ['Оптимизация на пенсии', 'Стратегии за спестяване', 'Планиране на доходи', 'Прогнози за бъдещето']
  },
  {
    icon: Shield,
    title: 'Защита на богатството',
    description: 'Защитете активите и наследството си със сложни застрахователни и наследствени решения.',
    features: ['Наследствено планиране', 'Тръстови услуги', 'Застрахователен анализ', 'Защита на активи']
  },
  {
    icon: Wallet,
    title: 'Данъчно планиране',
    description: 'Стратегическо данъчно планиране за минимизиране на данъчната тежест и максимизиране на натрупването на богатство.',
    features: ['Данъчна оптимизация', 'Данъчни облекчения', 'Благотворителни дарения', 'Бизнес данъчни стратегии']
  },
  {
    icon: GraduationCap,
    title: 'Финансиране на образование',
    description: 'Планирайте образованието на децата си с интелигентни стратегии за спестяване и инвестиционни инструменти.',
    features: ['Образователни планове', 'Спестовни сметки', 'Детски фондове', 'Планиране на помощи']
  },
  {
    icon: Building2,
    title: 'Бизнес планиране',
    description: 'Финансови стратегии за собственици на бизнес, включително наследствено планиране и служителски придобивки.',
    features: ['Планиране на наследство', 'Ключова застраховка', 'Служителски придобивки', 'Бизнес оценка']
  },
];

export default function Services() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-blue-600 font-medium text-sm tracking-widest uppercase mb-4 block">
              Нашите услуги
            </span>
            <h1 className="text-4xl md:text-6xl font-light text-slate-900 mb-6">
              Цялостни <span className="font-semibold text-blue-600">финансови</span> решения
            </h1>
            <p className="text-lg text-slate-600 font-light leading-relaxed">
              От управление на инвестиции до наследствено планиране, предлагаме пълен набор от 
              услуги, съобразени с вашата уникална финансова ситуация.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white border border-slate-100 rounded-2xl p-8 h-full transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-100 hover:-translate-y-2">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="h-7 w-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 font-light leading-relaxed mb-6">
                    {service.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-blue-600 font-medium text-sm tracking-widest uppercase mb-4 block">
              Нашият процес
            </span>
            <h2 className="text-3xl md:text-4xl font-light text-slate-900">
              Как <span className="font-semibold text-blue-600">работим</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Проучване', desc: 'Научаваме за вашите цели, ценности и текуща ситуация' },
              { step: '02', title: 'Анализ', desc: 'Нашият екип анализира финансите ви и идентифицира възможности' },
              { step: '03', title: 'Стратегия', desc: 'Създаваме персонализиран план, съобразен с вашите нужди' },
              { step: '04', title: 'Изпълнение', desc: 'Изпълняваме плана и осигуряваме текущо управление' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-6xl font-bold text-blue-100 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 font-light text-sm">{item.desc}</p>
              </motion.div>
            ))}
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
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
              Нека изградим финансовото ви бъдеще заедно
            </h2>
            <p className="text-xl text-blue-100 mb-10 font-light">
              Запазете безплатна консултация, за да обсъдим как можем да ви помогнем да постигнете целите си.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-blue-700 hover:bg-blue-50 px-10 py-6 text-lg rounded-full"
            >
              Запазете консултация
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}