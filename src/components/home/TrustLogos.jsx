import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, Building2, CheckCircle2, BadgeCheck } from 'lucide-react';

const logos = [
  { name: 'КФН лиценз', icon: Shield },
  { name: 'ISO сертификат', icon: Award },
  { name: 'CFP сертифициран', icon: BadgeCheck },
  { name: 'Доверен партньор', icon: CheckCircle2 },
  { name: 'Фидуциарен стандарт', icon: Building2 },
];

export default function TrustLogos() {
  return (
    <section className="py-12 bg-slate-50 border-y border-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-wrap justify-center items-center gap-8 md:gap-16"
        >
          {logos.map((logo, index) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors duration-300"
            >
              <logo.icon className="h-6 w-6" />
              <span className="text-sm font-medium tracking-wide">{logo.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}