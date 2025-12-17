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
import { useLanguage } from '../components/LanguageProvider';

export default function Services() {
  const { t } = useLanguage();

  const servicesData = [
    {
      icon: TrendingUp,
      titleBg: 'Управление на инвестиции',
      titleEn: 'Investment Management',
      descBg: 'Персонализирано управление на портфолио, проектирано да постигне вашите дългосрочни финансови цели с подходящи стратегии за риска.',
      descEn: 'Personalized portfolio management designed to achieve your long-term financial goals with appropriate risk strategies.',
      featuresBg: ['Диверсифицирани портфолиа', 'Оценка на риска', 'Редовно ребалансиране', 'Данъчно ефективно инвестиране'],
      featuresEn: ['Diversified portfolios', 'Risk assessment', 'Regular rebalancing', 'Tax-efficient investing']
    },
    {
      icon: PiggyBank,
      titleBg: 'Пенсионно планиране',
      titleEn: 'Retirement Planning',
      descBg: 'Изчерпателни пенсионни стратегии, за да се насладите на заслужения начин на живот в златните години.',
      descEn: 'Comprehensive retirement strategies to enjoy the lifestyle you deserve in your golden years.',
      featuresBg: ['Оптимизация на пенсии', 'Стратегии за спестяване', 'Планиране на доходи', 'Прогнози за бъдещето'],
      featuresEn: ['Pension optimization', 'Savings strategies', 'Income planning', 'Future projections']
    },
    {
      icon: Shield,
      titleBg: 'Защита на богатството',
      titleEn: 'Wealth Protection',
      descBg: 'Защитете активите и наследството си със сложни застрахователни и наследствени решения.',
      descEn: 'Protect your assets and legacy with sophisticated insurance and estate solutions.',
      featuresBg: ['Наследствено планиране', 'Тръстови услуги', 'Застрахователен анализ', 'Защита на активи'],
      featuresEn: ['Estate planning', 'Trust services', 'Insurance analysis', 'Asset protection']
    },
    {
      icon: Wallet,
      titleBg: 'Данъчно планиране',
      titleEn: 'Tax Planning',
      descBg: 'Стратегическо данъчно планиране за минимизиране на данъчната тежест и максимизиране на натрупването на богатство.',
      descEn: 'Strategic tax planning to minimize tax burden and maximize wealth accumulation.',
      featuresBg: ['Данъчна оптимизация', 'Данъчни облекчения', 'Благотворителни дарения', 'Бизнес данъчни стратегии'],
      featuresEn: ['Tax optimization', 'Tax relief', 'Charitable giving', 'Business tax strategies']
    },
    {
      icon: GraduationCap,
      titleBg: 'Финансиране на образование',
      titleEn: 'Education Funding',
      descBg: 'Планирайте образованието на децата си с интелигентни стратегии за спестяване и инвестиционни инструменти.',
      descEn: 'Plan your children\'s education with smart savings strategies and investment vehicles.',
      featuresBg: ['Образователни планове', 'Спестовни сметки', 'Детски фондове', 'Планиране на помощи'],
      featuresEn: ['Education plans', 'Savings accounts', 'Children\'s funds', 'Aid planning']
    },
    {
      icon: Building2,
      titleBg: 'Бизнес планиране',
      titleEn: 'Business Planning',
      descBg: 'Финансови стратегии за собственици на бизнес, включително наследствено планиране и служителски придобивки.',
      descEn: 'Financial strategies for business owners, including succession planning and employee benefits.',
      featuresBg: ['Планиране на наследство', 'Ключова застраховка', 'Служителски придобивки', 'Бизнес оценка'],
      featuresEn: ['Succession planning', 'Key person insurance', 'Employee benefits', 'Business valuation']
    },
  ];

  const services = servicesData.map(s => ({ 
    icon: s.icon, 
    title: t(s.titleBg, s.titleEn), 
    description: t(s.descBg, s.descEn),
    features: s.featuresBg.map((fb, i) => t(fb, s.featuresEn[i]))
  }));
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
              {t('Нашите услуги', 'Our Services')}
            </span>
            <h1 className="text-4xl md:text-6xl font-light text-slate-900 mb-6">
              {t('Цялостни', 'Comprehensive')} <span className="font-semibold text-blue-600">{t('финансови', 'financial')}</span> {t('решения', 'solutions')}
            </h1>
            <p className="text-lg text-slate-600 font-light leading-relaxed">
              {t(
                'От управление на инвестиции до наследствено планиране, предлагаме пълен набор от услуги, съобразени с вашата уникална финансова ситуация.',
                'From investment management to estate planning, we offer a full range of services tailored to your unique financial situation.'
              )}
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
              {t('Нашият процес', 'Our Process')}
            </span>
            <h2 className="text-3xl md:text-4xl font-light text-slate-900">
              {t('Как', 'How we')} <span className="font-semibold text-blue-600">{t('работим', 'work')}</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', titleBg: 'Проучване', titleEn: 'Discovery', descBg: 'Научаваме за вашите цели, ценности и текуща ситуация', descEn: 'We learn about your goals, values and current situation' },
              { step: '02', titleBg: 'Анализ', titleEn: 'Analysis', descBg: 'Нашият екип анализира финансите ви и идентифицира възможности', descEn: 'Our team analyzes your finances and identifies opportunities' },
              { step: '03', titleBg: 'Стратегия', titleEn: 'Strategy', descBg: 'Създаваме персонализиран план, съобразен с вашите нужди', descEn: 'We create a personalized plan tailored to your needs' },
              { step: '04', titleBg: 'Изпълнение', titleEn: 'Execution', descBg: 'Изпълняваме плана и осигуряваме текущо управление', descEn: 'We execute the plan and provide ongoing management' },
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
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{t(item.titleBg, item.titleEn)}</h3>
                <p className="text-slate-600 font-light text-sm">{t(item.descBg, item.descEn)}</p>
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
              {t('Нека изградим финансовото ви бъдеще заедно', 'Let\'s build your financial future together')}
            </h2>
            <p className="text-xl text-blue-100 mb-10 font-light">
              {t('Запазете безплатна консултация, за да обсъдим как можем да ви помогнем да постигнете целите си.', 'Schedule a free consultation to discuss how we can help you achieve your goals.')}
            </p>
            <Button 
              size="lg" 
              className="bg-white text-blue-700 hover:bg-blue-50 px-10 py-6 text-lg rounded-full"
            >
              {t('Запазете консултация', 'Book Consultation')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}