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
    title: 'Investment Management',
    description: 'Personalized portfolio management designed to achieve your long-term financial goals with risk-appropriate strategies.',
    features: ['Diversified portfolios', 'Risk assessment', 'Regular rebalancing', 'Tax-efficient investing']
  },
  {
    icon: PiggyBank,
    title: 'Retirement Planning',
    description: 'Comprehensive retirement strategies to ensure you can enjoy the lifestyle you deserve in your golden years.',
    features: ['401(k) optimization', 'IRA strategies', 'Social Security planning', 'Income projections']
  },
  {
    icon: Shield,
    title: 'Wealth Protection',
    description: 'Safeguard your assets and legacy with sophisticated insurance and estate planning solutions.',
    features: ['Estate planning', 'Trust services', 'Insurance analysis', 'Asset protection']
  },
  {
    icon: Wallet,
    title: 'Tax Planning',
    description: 'Strategic tax planning to minimize your tax burden and maximize your wealth accumulation.',
    features: ['Tax-loss harvesting', 'Roth conversions', 'Charitable giving', 'Business tax strategies']
  },
  {
    icon: GraduationCap,
    title: 'Education Funding',
    description: 'Plan for your children\'s education with smart savings strategies and investment vehicles.',
    features: ['529 plans', 'Coverdell accounts', 'UGMA/UTMA', 'Financial aid planning']
  },
  {
    icon: Building2,
    title: 'Business Planning',
    description: 'Financial strategies for business owners including succession planning and employee benefits.',
    features: ['Succession planning', 'Key person insurance', 'Employee benefits', 'Business valuation']
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
              Our Services
            </span>
            <h1 className="text-4xl md:text-6xl font-light text-slate-900 mb-6">
              Comprehensive <span className="font-semibold text-blue-600">Financial</span> Solutions
            </h1>
            <p className="text-lg text-slate-600 font-light leading-relaxed">
              From investment management to estate planning, we offer a full suite of 
              services tailored to your unique financial situation.
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
              Our Process
            </span>
            <h2 className="text-3xl md:text-4xl font-light text-slate-900">
              How We <span className="font-semibold text-blue-600">Work</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Discovery', desc: 'We learn about your goals, values, and current situation' },
              { step: '02', title: 'Analysis', desc: 'Our team analyzes your finances and identifies opportunities' },
              { step: '03', title: 'Strategy', desc: 'We create a customized plan tailored to your needs' },
              { step: '04', title: 'Implementation', desc: 'We execute the plan and provide ongoing management' },
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
              Let's build your financial future together
            </h2>
            <p className="text-xl text-blue-100 mb-10 font-light">
              Schedule a free consultation to discuss how we can help you achieve your goals.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-blue-700 hover:bg-blue-50 px-10 py-6 text-lg rounded-full"
            >
              Schedule Consultation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}