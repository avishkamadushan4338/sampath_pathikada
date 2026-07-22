"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { LayoutDashboard, ClipboardList, BarChart3, LineChart, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Bilingual } from "@/components/Bilingual";
import { dictionary } from "@/lib/i18n/dictionary";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BASE = "/divisional-secretariat";

const pendingFetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) return 0;
  return json.total as number;
};

interface NavItem {
  href: string;
  label: { en: string; si: string };
  icon: typeof LayoutDashboard;
  showPendingBadge?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: `${BASE}/dashboard`, label: { en: "My Division Information", si: "මාගේ වසම් තොරතුරු" }, icon: LayoutDashboard },
  { href: `${BASE}/review`, label: { en: "Review Queue", si: "සමාලෝචන පෝලිම" }, icon: ClipboardList, showPendingBadge: true },
  { href: `${BASE}/summary`, label: { en: "Summary", si: "සාරාංශය" }, icon: BarChart3 },
  { href: `${BASE}/graphs`, label: { en: "Graphs", si: "ප්‍රස්ථාර" }, icon: LineChart },
];

export function DsSidebar() {
  const { lang } = useLanguage();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: pendingCount } = useSWR(`/api/submissions?status=SUBMITTED&limit=1`, pendingFetcher, {
    refreshInterval: 60_000,
  });

  const nav = (
    <nav aria-label="Divisional Secretariat navigation" className="flex h-full flex-col gap-1 overflow-y-auto p-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname?.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex touch-target items-center gap-3 rounded-lg px-3 py-2.5 text-fluid-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            <span lang={lang} className={cn("flex-1 truncate", lang === "si" ? "font-si" : "font-ui")}>
              {lang === "si" ? item.label.si : item.label.en}
            </span>
            {item.showPendingBadge && !!pendingCount && (
              <Badge
                variant="outline"
                className={cn(
                  "h-5 min-w-5 justify-center px-1.5 text-[11px] nums-tabular",
                  active
                    ? "border-primary-foreground/30 bg-primary-foreground/15 text-primary-foreground"
                    : "border-[hsl(var(--status-pending))]/30 bg-[hsl(var(--status-pending))]/15 text-[hsl(var(--status-pending))]"
                )}
              >
                {pendingCount}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar trigger */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          className="touch-target"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </Button>
        <span className="text-fluid-base font-semibold font-display text-primary">
          <Bilingual {...dictionary.appName} />
        </span>
        <span className="size-9" aria-hidden="true" />
      </div>

      {/* Off-canvas drawer for mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-(--z-overlay) lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-[clamp(240px,75vw,300px)] bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-fluid-base font-semibold font-display text-primary">
                <Bilingual {...dictionary.appName} />
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="touch-target"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
              >
                <X className="size-5" />
              </Button>
            </div>
            {nav}
          </div>
        </div>
      )}

      {/* Persistent rail on large screens */}
      <aside className="hidden w-[clamp(220px,18vw,260px)] shrink-0 border-r border-border bg-card lg:block">
        {nav}
      </aside>
    </>
  );
}
