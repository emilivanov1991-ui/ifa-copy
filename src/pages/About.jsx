import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Users, Target, TrendingUp, CheckCircle } from 'lucide-react';

const stats = [
  { value: '25+', label: 'Years Experience' },
  { value: '$2B+', label: 'Assets Managed' },
  { value: '5,000+', label: 'Happy Clients' },
  { value: '98%', label: 'Client Retention' },
];

const values = [
  {
    icon: Target,
    title: 'Client-First Approach',
    description: 'Your goals are our priority. We build strategies around your unique needs.'
  },
  {
    icon: Award,
    title: 'Fiduciary Standard',
    description: 'We are legally bound to act in your best interest at all times.'
  },
  {
    icon: Users,
    title: 'Independent Advice',
    description: 'No conflicts of interest. We recommend what works best for you.'
  },
  {
    icon: TrendingUp,
    title: 'Proven Results',
    description: 'Decades of experience delivering consistent, reliable returns.'
  },
];

export default function About() {
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
              About Us
            </span>
            <h1 className="text-4xl md:text-6xl font-light text-slate-900 mb-6">
              Your Trusted <span className="font-semibold text-blue-600">Financial</span> Partner
            </h1>
            <p className="text-lg text-slate-600 font-light leading-relaxed">
              For over two decades, Apex Financial has been helping individuals and families 
              achieve their financial dreams through personalized, independent advice.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-600 font-light">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-blue-600 font-medium text-sm tracking-widest uppercase mb-4 block">
                Our Story
              </span>
              <h2 className="text-3xl md:text-4xl font-light text-slate-900 mb-6">
                Built on <span className="font-semibold">Trust</span> & <span className="font-semibold">Integrity</span>
              </h2>
              <div className="space-y-4 text-slate-600 font-light leading-relaxed">
                <p>
                  Founded in 1998, Apex Financial Advisors was born from a simple belief: 
                  everyone deserves access to honest, unbiased financial advice.
                </p>
                <p>
                  Our founders, former Wall Street executives, witnessed firsthand how 
                  conflicts of interest often led advisors to prioritize commissions over 
                  client outcomes. They decided to build something different.
                </p>
                <p>
                  Today, we remain fiercely independent, serving as true fiduciaries who 
                  are legally obligated to put your interests first. No proprietary products, 
                  no hidden fees—just transparent, client-centered advice.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/10">
                <img 
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80" 
                  alt="Team meeting"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-6 rounded-xl shadow-xl">
                <div className="text-3xl font-bold">25+</div>
                <div className="text-blue-100 text-sm">Years of Excellence</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
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
              Our Values
            </span>
            <h2 className="text-3xl md:text-4xl font-light text-slate-900">
              What We <span className="font-semibold text-blue-600">Stand For</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-shadow"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6">
                  <value.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600 font-light leading-relaxed">{value.description}</p>
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
              Ready to start your journey?
            </h2>
            <p className="text-xl text-blue-100 mb-10 font-light">
              Schedule a complimentary consultation with one of our advisors today.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-blue-700 hover:bg-blue-50 px-10 py-6 text-lg rounded-full"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}