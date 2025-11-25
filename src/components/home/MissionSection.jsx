import React from 'react';
import { motion } from 'framer-motion';

export default function MissionSection() {
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
            Our Mission
          </span>
          <h2 className="text-3xl md:text-5xl font-light text-white mb-8">
            Our <span className="font-semibold text-blue-400">Mission</span>
          </h2>
          <p className="text-xl md:text-2xl text-blue-100/80 leading-relaxed font-light">
            At <span className="text-white font-medium">Apex Financial Advisors</span>, we are dedicated 
            to providing you with well-balanced and sustainable financial growth through intelligent 
            decisions and personalized strategies. We help you navigate the complexities of wealth 
            management to achieve your life goals.
          </p>
        </motion.div>
      </div>
    </section>
  );
}