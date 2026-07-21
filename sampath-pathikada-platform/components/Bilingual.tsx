"use client";

import type { ElementType } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

interface BilingualProps {
  en: string;
  si: string;
  as?: ElementType;
  className?: string;
}

/** Renders text in whichever language is currently active, with correct font/lang attributes. */
export function Bilingual({ en, si, as: As = "span", className }: BilingualProps) {
  const { lang } = useLanguage();
  const text = lang === "si" ? si : en;
  return (
    <As lang={lang} className={cn(lang === "si" ? "font-si" : "font-ui", className)}>
      {text}
    </As>
  );
}
