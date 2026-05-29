import { createContext, useContext, useState, type ReactNode } from 'react';
import { zh } from './zh';
import { en } from './en';

type Lang = 'zh' | 'en';
type I18nContextType = {
  lang: Lang;
  t: (key: string) => string;
  toggleLang: () => void;
};

const I18nContext = createContext<I18nContextType>({
  lang: 'zh',
  t: () => '',
  toggleLang: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('zh');

  const t = (key: string): string => {
    const dict = lang === 'zh' ? zh : en;
    return dict[key] ?? key;
  };

  const toggleLang = () => setLang(prev => prev === 'zh' ? 'en' : 'zh');

  return (
    <I18nContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
