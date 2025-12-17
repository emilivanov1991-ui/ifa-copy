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
import { useLanguage } from '../components/LanguageProvider';

export default function Contact() {
  const { t } = useLanguage();

const contactInfoData = [
  {
    icon: MapPin,
    titleBg: 'Посетете ни',
    titleEn: 'Visit Us',
    detailsBg: ['бул. Витоша 100', 'София 1000'],
    detailsEn: ['Vitosha Blvd 100', 'Sofia 1000']
  },
  {
    icon: Phone,
    titleBg: 'Обадете ни се',
    titleEn: 'Call Us',
    detailsBg: ['+359 2 123 4567', '+359 888 123 456'],
    detailsEn: ['+359 2 123 4567', '+359 888 123 456']
  },
  {
    icon: Mail,
    titleBg: 'Пишете ни',
    titleEn: 'Email Us',
    detailsBg: ['info@example.bg', 'support@example.bg'],
    detailsEn: ['info@example.bg', 'support@example.bg']
  },
  {
    icon: Clock,
    titleBg: 'Работно време',
    titleEn: 'Working Hours',
    detailsBg: ['Пон - Пет: 9:00 - 18:00', 'Съб: 10:00 - 14:00'],
    detailsEn: ['Mon - Fri: 9:00 - 18:00', 'Sat: 10:00 - 14:00']
  },
];

const contactInfo = contactInfoData.map(c => ({ 
  icon: c.icon, 
  title: t(c.titleBg, c.titleEn), 
  details: c.detailsBg.map((db, i) => t(db, c.detailsEn[i]))
}));
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
              {t('Свържете се с нас', 'Contact Us')}
            </span>
            <h1 className="text-4xl md:text-6xl font-light text-slate-900 mb-6">
              {t('Нека започнем', 'Let\'s start a')} <span className="font-semibold text-blue-600">{t('разговор', 'conversation')}</span>
            </h1>
            <p className="text-lg text-slate-600 font-light leading-relaxed">
              {t(
                'Готови ли сте да поемете контрол над финансовото си бъдеще? Ние сме тук да помогнем. Свържете се днес за безплатна консултация.',
                'Ready to take control of your financial future? We\'re here to help. Contact us today for a free consultation.'
              )}
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
                {t('Изпратете ни', 'Send us a')} <span className="font-semibold">{t('съобщение', 'message')}</span>
              </h2>
              <p className="text-slate-600 font-light mb-8">
                {t('Попълнете формуляра по-долу и ние ще се свържем с вас в рамките на 24 часа.', 'Fill out the form below and we\'ll get back to you within 24 hours.')}
              </p>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 rounded-xl p-8 text-center"
                >
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {t('Съобщението е изпратено успешно!', 'Message sent successfully!')}
                  </h3>
                  <p className="text-slate-600 font-light">
                    {t('Благодарим ви, че се свързахте. Един от нашите консултанти ще се свърже с вас скоро.', 'Thank you for reaching out. One of our advisors will contact you soon.')}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('Име', 'First Name')}</Label>
                      <Input
                        id="firstName"
                        placeholder={t('Иван', 'John')}
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        required
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t('Фамилия', 'Last Name')}</Label>
                      <Input
                        id="lastName"
                        placeholder={t('Петров', 'Smith')}
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        required
                        className="rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('Имейл', 'Email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('ivan@example.com', 'john@example.com')}
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('Телефон', 'Phone')}</Label>
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
                    <Label htmlFor="service">{t('Интересувам се от', 'I am interested in')}</Label>
                    <Select 
                      value={formData.service} 
                      onValueChange={(value) => setFormData({...formData, service: value})}
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder={t('Изберете услуга', 'Select a service')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="investment">{t('Управление на инвестиции', 'Investment Management')}</SelectItem>
                        <SelectItem value="retirement">{t('Пенсионно планиране', 'Retirement Planning')}</SelectItem>
                        <SelectItem value="wealth">{t('Защита на богатството', 'Wealth Protection')}</SelectItem>
                        <SelectItem value="tax">{t('Данъчно планиране', 'Tax Planning')}</SelectItem>
                        <SelectItem value="education">{t('Финансиране на образование', 'Education Funding')}</SelectItem>
                        <SelectItem value="business">{t('Бизнес планиране', 'Business Planning')}</SelectItem>
                        <SelectItem value="other">{t('Друго', 'Other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t('Съобщение', 'Message')}</Label>
                    <Textarea
                      id="message"
                      placeholder={t('Разкажете ни за вашите финансови цели...', 'Tell us about your financial goals...')}
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
                    {t('Изпрати съобщение', 'Send Message')}
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
                  <h3 className="text-2xl font-semibold mb-2">{t('Посетете офиса ни', 'Visit Our Office')}</h3>
                  <p className="text-blue-100 font-light">
                    {t('бул. Витоша 100, София 1000', 'Vitosha Blvd 100, Sofia 1000')}
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