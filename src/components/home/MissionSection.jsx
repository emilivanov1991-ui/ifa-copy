import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../LanguageProvider';

export default function MissionSection() {
  const { t } = useLanguage();
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <span className="text-blue-400 font-medium text-sm tracking-widest uppercase mb-4 block">
            {t('Нашата мисия', 'Our Mission')}
          </span>
          <h2 className="text-3xl md:text-5xl font-light text-white mb-8">
            {t('Нашата', 'Our')} <span className="font-semibold text-blue-400">{t('мисия', 'mission')}</span>
          </h2>
          <p className="text-xl md:text-2xl text-blue-100/80 leading-relaxed font-light">
            {t(
              'Посветени сме на осигуряването на балансиран и устойчив финансов растеж чрез интелигентни решения и персонализирани стратегии. Помагаме ви да се ориентирате в сложността на управлението на богатството, за да постигнете житейските си цели.',
              'We are dedicated to providing balanced and sustainable financial growth through intelligent solutions and personalized strategies. We help you navigate the complexity of wealth management to achieve your life goals.'
            )}
          </p>
        </motion.div>
      </div>
    </section>
  );
}