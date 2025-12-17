import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Award, CheckCircle, BadgeCheck } from 'lucide-react';
import { useLanguage } from '../LanguageProvider';

export default function InvestmentCTA() {
  const { t } = useLanguage();

  const badgesData = [
    { icon: Shield, labelBg: 'КФН лиценз', labelEn: 'FSC License' },
    { icon: Award, labelBg: 'CFP сертификат', labelEn: 'CFP Certificate' },
    { icon: CheckCircle, labelBg: 'Фидуциар', labelEn: 'Fiduciary' },
    { icon: BadgeCheck, labelBg: 'ISO сертификат', labelEn: 'ISO Certificate' },
  ];

  const badges = badgesData.map(b => ({ icon: b.icon, label: t(b.labelBg, b.labelEn) }));
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Decorative blurs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-5xl font-light text-white mb-6">
            <span className="font-semibold">{t('Инвестирайте', 'Invest')}</span> {t('в бъдещето си', 'in your future')}
          </h2>
          <p className="text-lg md:text-xl text-blue-100/90 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            {t(
              'В свят на финансова несигурност, ние предлагаме крайното решение. Нека ви помогнем да постигнете дългосрочните си цели и да осигурите финансовата си свобода. Грижете се за семейството си, докато ние се грижим за инвестициите ви.',
              'In a world of financial uncertainty, we offer the ultimate solution. Let us help you achieve your long-term goals and secure your financial freedom. Take care of your family while we take care of your investments.'
            )}
          </p>

          <Button 
            size="lg" 
            className="bg-white text-blue-700 hover:bg-blue-50 px-10 py-6 text-lg rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg"
          >
            {t('Запазете безплатна консултация', 'Book a Free Consultation')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-6 mt-16"
        >
          {badges.map((badge, index) => (
            <div 
              key={badge.label}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-full border border-white/20"
            >
              <badge.icon className="h-5 w-5 text-blue-200" />
              <span className="text-sm text-white font-medium">{badge.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}