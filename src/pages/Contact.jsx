import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  CheckCircle
} from 'lucide-react';

const contactInfo = [
  {
    icon: MapPin,
    title: 'Посетете ни',
    details: ['бул. Витоша 100', 'София 1000']
  },
  {
    icon: Phone,
    title: 'Обадете ни се',
    details: ['+359 2 123 4567', '+359 888 123 456']
  },
  {
    icon: Mail,
    title: 'Пишете ни',
    details: ['info@apexfinancial.bg', 'support@apexfinancial.bg']
  },
  {
    icon: Clock,
    title: 'Работно време',
    details: ['Пон - Пет: 9:00 - 18:00', 'Съб: 10:00 - 14:00']
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
  };

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
              Свържете се с нас
            </span>
            <h1 className="text-4xl md:text-6xl font-light text-slate-900 mb-6">
              Нека започнем <span className="font-semibold text-blue-600">разговор</span>
            </h1>
            <p className="text-lg text-slate-600 font-light leading-relaxed">
              Готови ли сте да поемете контрол над финансовото си бъдеще? Ние сме тук да помогнем. 
              Свържете се днес за безплатна консултация.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-slate-50 rounded-xl p-6 text-center hover:bg-blue-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <info.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{info.title}</h3>
                {info.details.map((detail, i) => (
                  <p key={i} className="text-slate-600 text-sm font-light">{detail}</p>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-light text-slate-900 mb-2">
                Изпратете ни <span className="font-semibold">съобщение</span>
              </h2>
              <p className="text-slate-600 font-light mb-8">
                Попълнете формуляра по-долу и ние ще се свържем с вас в рамките на 24 часа.
              </p>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 rounded-xl p-8 text-center"
                >
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Съобщението е изпратено успешно!
                  </h3>
                  <p className="text-slate-600 font-light">
                    Благодарим ви, че се свързахте. Един от нашите консултанти ще се свърже с вас скоро.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Име</Label>
                      <Input
                        id="firstName"
                        placeholder="Иван"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        required
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Фамилия</Label>
                      <Input
                        id="lastName"
                        placeholder="Петров"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        required
                        className="rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Имейл</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ivan@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Телефон</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+359 888 123 456"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service">Интересувам се от</Label>
                    <Select 
                      value={formData.service} 
                      onValueChange={(value) => setFormData({...formData, service: value})}
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Изберете услуга" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="investment">Управление на инвестиции</SelectItem>
                        <SelectItem value="retirement">Пенсионно планиране</SelectItem>
                        <SelectItem value="wealth">Защита на богатството</SelectItem>
                        <SelectItem value="tax">Данъчно планиране</SelectItem>
                        <SelectItem value="education">Финансиране на образование</SelectItem>
                        <SelectItem value="business">Бизнес планиране</SelectItem>
                        <SelectItem value="other">Друго</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Съобщение</Label>
                    <Textarea
                      id="message"
                      placeholder="Разкажете ни за вашите финансови цели..."
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      rows={5}
                      className="rounded-lg resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-blue-600 hover:bg-blue-700 rounded-full"
                  >
                    Изпрати съобщение
                    <Send className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              )}
            </motion.div>

            {/* Map / Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/10 sticky top-32">
                <img 
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
                  alt="Office"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h3 className="text-2xl font-semibold mb-2">Посетете офиса ни</h3>
                  <p className="text-blue-100 font-light">
                    бул. Витоша 100, София 1000
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}