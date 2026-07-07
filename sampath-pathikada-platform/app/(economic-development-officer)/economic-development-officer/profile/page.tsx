"use client";

import { Loader2 } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { Bilingual } from "@/components/Bilingual";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DISTRICTS, DIVISIONAL_SECRETARIATS, GN_DIVISIONS } from "@/lib/registration-data";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

function lookupLabel(
  items: { id: string; en: string; si: string }[],
  id: string | null,
  lang: "en" | "si"
): string {
  const item = items.find((i) => i.id === id);
  if (!item) return "—";
  return lang === "si" ? item.si : item.en;
}

export default function ProfilePage() {
  const { user, isLoading } = useSession();
  const { lang } = useLanguage();

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  const rows: { label: { en: string; si: string }; value: string }[] = [
    { label: { en: "Full Name", si: "සම්පූර්ණ නම" }, value: user.name },
    { label: { en: "Email", si: "විද්‍යුත් තැපෑල" }, value: user.email },
    { label: { en: "District", si: "දිස්ත්‍රික්කය" }, value: lookupLabel(DISTRICTS, user.district, lang) },
    {
      label: { en: "Divisional Secretariat", si: "ප්‍රාදේශීය ලේකම් කොට්ඨාසය" },
      value: lookupLabel(DIVISIONAL_SECRETARIATS, user.dsDivision, lang),
    },
    { label: { en: "GN Division", si: "ග්‍රාම නිලධාරී වසම" }, value: lookupLabel(GN_DIVISIONS, user.gnDivision, lang) },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-display text-fluid-2xl font-semibold text-primary">
        <Bilingual en="Profile" si="පැතිකඩ" />
      </h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-fluid-lg">{user.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {rows.map((row) => (
            <div key={row.label.en} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
              <span lang={lang} className={lang === "si" ? "font-si text-fluid-sm text-muted-foreground" : "font-ui text-fluid-sm text-muted-foreground"}>
                {lang === "si" ? row.label.si : row.label.en}
              </span>
              <span className="text-fluid-sm font-medium text-foreground">{row.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
