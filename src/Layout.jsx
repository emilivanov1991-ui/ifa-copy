import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Menu, X, TrendingUp, LogIn, User, Briefcase, Languages } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageProvider, useLanguage } from './components/LanguageProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Pages that have dark hero sections (header should be transparent with white text initially)
const DARK_HERO_PAGES = ['Home', 'FinancialPlanner'];

function LayoutContent({ children, currentPageName }) {
  const { language, toggleLanguage, t } = useLanguage();
  
  const navLinks = [
    { name: t('Начало', 'Home'), page: 'Home' },
    { name: t('За нас', 'About'), page: 'About' },
    { name: t('Услуги', 'Services'), page: 'Services' },
    { name: t('Калкулатори', 'Calculators'), page: 'Calculators' },
    { name: t('Контакти', 'Contact'), page: 'Contact' },
  ];
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Check if page has dark hero
  const hasDarkHero = DARK_HERO_PAGES.includes(currentPageName);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Hide on ConsultantPortal and FinancialAnalysis */}
      {currentPageName !== 'ConsultantPortal' && currentPageName !== 'FinancialAnalysis' && (
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-slate-200/50 py-3' 
            : hasDarkHero 
              ? 'bg-transparent py-5' 
              : 'bg-white/95 backdrop-blur-md shadow-lg shadow-slate-200/50 py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to={createPageUrl('Home')} className="flex items-center gap-3">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/258cedab0_output-onlinepngtools.png"
              alt="Integrity Financial Advisors"
              className={`h-32 w-auto transition-all duration-300 ${!isScrolled && hasDarkHero ? 'brightness-0 invert' : ''}`}
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={createPageUrl(link.page)}
                className={`text-sm font-medium transition-colors duration-300 hover:text-blue-500 ${
                  isScrolled || !hasDarkHero ? 'text-slate-600' : 'text-white/80 hover:text-white'
                } ${currentPageName === link.page ? 'text-blue-500' : ''}`}
              >
                {link.name}
              </Link>
            ))}

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                isScrolled || !hasDarkHero 
                  ? 'border-slate-300 text-slate-700 hover:bg-slate-100' 
                  : 'border-white/30 text-white hover:bg-white/10'
              }`}
            >
              <Languages className="h-3.5 w-3.5" />
              {language === 'bg' ? 'EN' : 'BG'}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  className={`rounded-full px-6 transition-all duration-300 ${
                    isScrolled || !hasDarkHero
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30'
                  }`}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {t('Вход', 'Login')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 bg-white/95 backdrop-blur-md border-slate-200/50 shadow-xl">
                <DropdownMenuItem asChild className="cursor-pointer rounded-lg py-3 px-4 focus:bg-blue-50">
                  <Link to={createPageUrl('ClientPortal')} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{t('Вход за клиенти', 'Client Login')}</p>
                      <p className="text-xs text-slate-500">{t('Достъп до вашия портал', 'Access your portal')}</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer rounded-lg py-3 px-4 focus:bg-violet-50">
                  <Link to={createPageUrl('ConsultantPortal')} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{t('Вход за консултанти', 'Consultant Login')}</p>
                      <p className="text-xs text-slate-500">{t('Администрация и CRM', 'Admin & CRM')}</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className={`h-6 w-6 ${isScrolled || !hasDarkHero ? 'text-slate-900' : 'text-white'}`} />
            ) : (
              <Menu className={`h-6 w-6 ${isScrolled || !hasDarkHero ? 'text-slate-900' : 'text-white'}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-100 shadow-lg"
            >
              <nav className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={createPageUrl(link.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-slate-600 font-medium py-2 ${
                      currentPageName === link.page ? 'text-blue-600' : ''
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 text-slate-600 font-medium py-2 hover:text-blue-600"
                >
                  <Languages className="h-4 w-4" />
                  {language === 'bg' ? 'English' : 'Български'}
                </button>
                <div className="space-y-2 mt-2">
                  <Link to={createPageUrl('ClientPortal')} onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                      <User className="h-4 w-4 mr-2" />
                      {t('Вход за клиенти', 'Client Login')}
                    </Button>
                  </Link>
                  <Link to={createPageUrl('ConsultantPortal')} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-violet-300 text-violet-700 hover:bg-violet-50 rounded-full">
                      <Briefcase className="h-4 w-4 mr-2" />
                      {t('Вход за консултанти', 'Consultant Login')}
                    </Button>
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      )}

      {/* Main Content */}
      <main className={currentPageName === 'ConsultantPortal' || currentPageName === 'FinancialAnalysis' ? 'pt-0' : ''}>
        {children}
      </main>

      {/* Footer - Hide on ConsultantPortal and FinancialAnalysis */}
      {currentPageName !== 'ConsultantPortal' && currentPageName !== 'FinancialAnalysis' && <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="mb-4">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a960748714fa4828395a/258cedab0_output-onlinepngtools.png"
                  alt="Integrity Financial Advisors"
                  className="h-16 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-slate-400 font-light leading-relaxed max-w-md">
                „ИНТЕГРИТИ ФАЙНЕНШЪЛ АДВАЙЗЪРС" ЕООД — независими финансови консултанти,
                лицензирани от Комисията за финансов надзор с Решение №&nbsp;33–ЗБ от 27.01.2026&nbsp;г.,
                вписани в регистъра на застрахователните брокери (КФН).
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">{t('Бързи връзки', 'Quick Links')}</h4>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={createPageUrl(link.page)}
                      className="text-slate-400 hover:text-white transition-colors font-light"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">{t('Контакти', 'Contact')}</h4>
              <ul className="space-y-3 text-slate-400 font-light">
                <li>+359 89 222 2990</li>
                <li>krassimir.stankov@ifa.bg</li>
                <li>{t('ул. Поморие 20, ет. 5, ап. 1', 'Pomorie St. 20, fl. 5, apt. 1')}<br />{t('Бургас 8001', 'Burgas 8001')}</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm font-light">
              © {new Date().getFullYear()} „ИНТЕГРИТИ ФАЙНЕНШЪЛ АДВАЙЗЪРС" ЕООД · КФН Решение №&nbsp;33–ЗБ/27.01.2026 г. · Всички права запазени.
            </p>
            <div className="flex gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-white transition-colors">{t('Политика за поверителност', 'Privacy Policy')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('Условия за ползване', 'Terms of Use')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('Разкрития', 'Disclosures')}</a>
            </div>
          </div>
          </div>
          </footer>}
          </div>
  );
  }

  export default function Layout(props) {
  return (
  <LanguageProvider>
  <LayoutContent {...props} />
  </LanguageProvider>
  );
  }