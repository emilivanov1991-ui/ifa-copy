import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Target, TrendingUp, Sparkles } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Запазете консултация',
    description: 'Резервирайте безплатна консултация с нашите експерти',
    icon: UserPlus
  },
  {
    number: '02',
    title: 'Определете целите си',
    description: 'Създаваме персонализирана финансова пътна карта',
    icon: Target
  },
  {
    number: '03',
    title: 'Инвестирайте разумно',
    description: 'Прилагаме вашата инвестиционна стратегия',
    icon: TrendingUp
  },
  {
    number: '04',
    title: 'Постигнете успех',
    description: 'Наблюдавайте растежа на богатството си с постоянни насоки',
    icon: Sparkles
  }
];

export default function ProcessSteps() {
  return (
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
            Как работи
          </span>
          <h2 className="text-3xl md:text-5xl font-light text-slate-900">
            Започването е наистина{' '}
            <span className="font-semibold text-blue-600">лесно!</span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 -translate-y-1/2 z-0" />
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative z-10"
              >
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
                    <step.icon className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-5xl font-bold bg-gradient-to-br from-blue-100 to-slate-100 bg-clip-text text-transparent">
                    {step.number}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 font-light text-sm">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}