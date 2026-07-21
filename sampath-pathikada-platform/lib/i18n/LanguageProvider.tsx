"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "en" | "si";

const STORAGE_KEY = "sp-lang";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("si");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "si") setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (next: Language) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const toggle = () => setLang(lang === "si" ? "en" : "si");

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
