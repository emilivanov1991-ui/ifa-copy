import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored === 'true') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    
    if (newValue) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  return (
    <motion.button
      onClick={toggleDarkMode}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative w-14 h-7 rounded-full p-1 transition-all duration-300"
      style={{
        background: isDark 
          ? 'linear-gradient(135deg, #1A237E 0%, #283593 100%)'
          : 'linear-gradient(135deg, #00BFA5 0%, #1DE9B6 100%)'
      }}
    >
      <motion.div
        animate={{ x: isDark ? 28 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="w-5 h-5 bg-white rounded-full shadow-lg flex items-center justify-center"
      >
        {isDark ? (
          <Moon className="h-3 w-3 text-[#1A237E]" />
        ) : (
          <Sun className="h-3 w-3 text-[#00BFA5]" />
        )}
      </motion.div>
    </motion.button>
  );
}