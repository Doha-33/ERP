import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ThemeContextType {
  lang: 'en' | 'ar';
  toggleLang: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const { i18n } = useTranslation();

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    root.setAttribute('lang', lang);
    i18n.changeLanguage(lang);
  }, [lang, i18n]);

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  return (
    <ThemeContext.Provider value={{lang, toggleLang }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};