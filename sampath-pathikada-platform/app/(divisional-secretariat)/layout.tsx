"use client";

import { RoleGuard } from "@/components/layout/RoleGuard";
import { DsSidebar } from "@/components/layout/DsSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { dictionary } from "@/lib/i18n/dictionary";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { lang } = useLanguage();

  return (
    <RoleGuard allow={["DIVISIONAL_SECRETARIAT"]}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-(--z-toast) focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {lang === "si" ? dictionary.skipToContent.si : dictionary.skipToContent.en}
      </a>
      <div className="flex min-h-dvh flex-col lg:flex-row">
        <DsSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main id="main-content" className="min-w-0 flex-1 bg-background">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
