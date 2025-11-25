import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sliders, Heart, TrendingUp, PiggyBank, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Shield,
    title: 'Сигурност',
    description: 'Вашите активи са защитени с водещи мерки за сигурност и регулаторно съответствие.',
    color: 'blue'
  },
  {
    icon: Sliders,
    title: 'Контрол',
    description: 'Пълна прозрачност и контрол върху вашите инвестиции. Достъп до портфолиото по всяко време.',
    color: 'cyan'
  },
  {
    icon: Heart,
    title: 'Грижа',
    description: 'Вашият личен консултант осигурява персонализирано обслужване и неограничена подкрепа.',
    color: 'indigo'
  }
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-blue-600 font-medium text-sm tracking-widest uppercase mb-4 block">
            Защо да изберете нас
          </span>
          <h2 className="text-3xl md:text-5xl font-light text-slate-900 mb-6">
            Независимо{' '}
            <span className="font-semibold text-blue-600">Финансово</span> консултиране
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light">
            Използвайки нашия богат опит на капиталовите пазари, заедно с иновативни стратегии 
            и персонализирано планиране, осигуряваме вашия финансов успех.
          </p>
        </motion.div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group"
            >
              <div className="bg-white border border-slate-100 rounded-2xl p-8 h-full transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-100 hover:-translate-y-2">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-slate-600 leading-relaxed font-light">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-full"
          >
            Започнете сега
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 rounded-full"
          >
            Научете повече
          </Button>
        </motion.div>
      </div>
    </section>
  );
}