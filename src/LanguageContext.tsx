import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { translations, Language } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.nl;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/fr')) return 'fr';
    return 'nl';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    const newPath = `/${lang}`;
    window.history.pushState({}, '', newPath);
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/fr')) {
        setLanguageState('fr');
      } else {
        setLanguageState('nl');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
