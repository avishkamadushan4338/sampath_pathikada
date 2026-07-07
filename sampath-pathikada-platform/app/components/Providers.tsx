"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <LanguageProvider>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </LanguageProvider>
    </ThemeProvider>
  );
}
