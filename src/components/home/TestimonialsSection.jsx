import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageProvider';

export default function TestimonialsSection() {
  const { t } = useLanguage();

  const testimonialsData = [
    {
      quoteBg: "Управлявам малък бизнес и наистина нямам много свободно време. Мога да се съсредоточа върху бизнеса си, докато експерти се грижат за богатството ми. Определено страхотен избор!",
      quoteEn: "I run a small business and truly don't have much free time. I can focus on my business while experts take care of my wealth. Definitely a great choice!",
      nameBg: "Мария Петрова",
      nameEn: "Maria Petrova",
      roleBg: "Собственик на бизнес",
      roleEn: "Business Owner",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
    },
    {
      quoteBg: "Имам работа на пълен работен ден и управлението на инвестициите сама не е вариант. Наличието на надеждна компания, която управлява финансите ми, е от голямо значение! Не бих могла да се надявам на по-професионален подход.",
      quoteEn: "I have a full-time job and managing investments myself is not an option. Having a reliable company managing my finances is invaluable! I couldn't hope for a more professional approach.",
      nameBg: "Георги Димитров",
      nameEn: "Georgi Dimitrov",
      roleBg: "Здравен мениджър",
      roleEn: "Healthcare Manager",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      quoteBg: "Нова съм в инвестирането и наличието на личен финансов консултант, който ми помага на всяка стъпка - търсейки най-добрите възможности - е просто фантастично. Не бих могла да съм по-доволна от резултатите!",
      quoteEn: "I'm new to investing and having a personal financial advisor who helps me at every step - seeking the best opportunities - is simply fantastic. I couldn't be happier with the results!",
      nameBg: "Елена Иванова",
      nameEn: "Elena Ivanova",
      roleBg: "Маркетинг директор",
      roleEn: "Marketing Director",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const testimonials = testimonialsData.map(td => ({ 
    quote: t(td.quoteBg, td.quoteEn), 
    name: t(td.nameBg, td.nameEn), 
    role: t(td.roleBg, td.roleEn),
    image: td.image
  }));

  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-blue-600 font-medium text-sm tracking-widest uppercase mb-4 block">
            {t('Отзиви', 'Testimonials')}
          </span>
          <h2 className="text-3xl md:text-5xl font-light text-slate-900">
            {t('Какво казват нашите', 'What our')} <span className="font-semibold text-blue-600">{t('клиенти', 'clients say')}</span>
          </h2>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-3xl p-8 md:p-12 relative"
            >
              <Quote className="absolute top-8 left-8 h-12 w-12 text-blue-200" />
              
              <div className="text-center pt-8">
                <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-light italic mb-8 max-w-3xl mx-auto">
                  "{testimonials[current].quote}"
                </p>
                
                <div className="flex flex-col items-center">
                  <img
                    src={testimonials[current].image}
                    alt={testimonials[current].name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg mb-4"
                  />
                  <h4 className="font-semibold text-slate-900">
                    {testimonials[current].name}
                  </h4>
                  <p className="text-blue-600 text-sm">
                    {testimonials[current].role}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              className="rounded-full w-12 h-12 border-slate-200 hover:bg-blue-50 hover:border-blue-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === current 
                      ? 'bg-blue-600 w-8' 
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={next}
              className="rounded-full w-12 h-12 border-slate-200 hover:bg-blue-50 hover:border-blue-200"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}