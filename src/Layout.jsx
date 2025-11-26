import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Menu, X, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { name: 'Начало', page: 'Home' },
  { name: 'За нас', page: 'About' },
  { name: 'Услуги', page: 'Services' },
  { name: 'Безплатен анализ', page: 'FinancialAnalysis' },
  { name: 'Контакти', page: 'Contact' },
  { name: 'Клиентски портал', page: 'ClientPortal' },
];

export default function Layout({ children, currentPageName }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Hide on ConsultantPortal */}
      {currentPageName !== 'ConsultantPortal' && (
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-slate-200/50 py-3' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to={createPageUrl('Home')} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
              isScrolled ? 'bg-blue-600' : 'bg-white/20 backdrop-blur-sm'
            }`}>
              <TrendingUp className={`h-5 w-5 ${isScrolled ? 'text-white' : 'text-white'}`} />
            </div>
            <div>
              <span className={`font-semibold text-lg tracking-tight transition-colors duration-300 ${
                isScrolled ? 'text-slate-900' : 'text-white'
              }`}>
                APEX
              </span>
              <span className={`hidden sm:inline ml-1 font-light transition-colors duration-300 ${
                isScrolled ? 'text-slate-600' : 'text-blue-100'
              }`}>
                Financial
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={createPageUrl(link.page)}
                className={`text-sm font-medium transition-colors duration-300 hover:text-blue-500 ${
                  isScrolled ? 'text-slate-600' : 'text-white/80 hover:text-white'
                } ${currentPageName === link.page ? 'text-blue-500' : ''}`}
              >
                {link.name}
              </Link>
            ))}
            <Button 
              className={`rounded-full px-6 transition-all duration-300 ${
                isScrolled 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30'
              }`}
            >
              Започнете сега
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className={`h-6 w-6 ${isScrolled ? 'text-slate-900' : 'text-white'}`} />
            ) : (
              <Menu className={`h-6 w-6 ${isScrolled ? 'text-slate-900' : 'text-white'}`} />
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
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full mt-2">
                  Започнете сега
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      )}

      {/* Main Content */}
      <main className={currentPageName === 'ConsultantPortal' ? 'pt-0' : ''}>
        {children}
      </main>

      {/* Footer - Hide on ConsultantPortal */}
      {currentPageName !== 'ConsultantPortal' && <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-xl">APEX Financial</span>
              </div>
              <p className="text-slate-400 font-light leading-relaxed max-w-md">
                Независими финансови консултанти, посветени на постигането на вашите 
                финансови цели с персонализирани стратегии и експертни насоки.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Бързи връзки</h4>
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
              <h4 className="font-semibold mb-4">Контакти</h4>
              <ul className="space-y-3 text-slate-400 font-light">
                <li>+359 2 123 4567</li>
                <li>info@apexfinancial.bg</li>
                <li>бул. Витоша 100<br />София 1000</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm font-light">
              © {new Date().getFullYear()} Apex Financial Advisors. Всички права запазени.
            </p>
            <div className="flex gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Политика за поверителност</a>
              <a href="#" className="hover:text-white transition-colors">Условия за ползване</a>
              <a href="#" className="hover:text-white transition-colors">Разкрития</a>
            </div>
          </div>
          </div>
          </footer>}
          </div>
  );
}