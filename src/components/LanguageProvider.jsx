import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('bg'); // 'bg' or 'en'

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'bg' ? 'en' : 'bg');
  };

  const t = (bgText, enText) => {
    return language === 'bg' ? bgText : enText;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};