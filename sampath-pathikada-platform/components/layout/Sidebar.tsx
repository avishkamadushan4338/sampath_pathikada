"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, Circle, CircleDot, LayoutDashboard, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Bilingual } from "@/components/Bilingual";
import { dictionary } from "@/lib/i18n/dictionary";
import { SECTION_KEYS, SECTION_ROUTES } from "@/lib/types/submission";
import { SECTION_META } from "@/lib/i18n/section-meta";
import type { SectionStatus } from "@/lib/submission-progress";
import { Button } from "@/components/ui/button";

const ENTRY_BASE = "/economic-development-officer/entry";

function StatusIcon({ status }: { status: SectionStatus }) {
  if (status === "complete") {
    return <CheckCircle2 className="size-4 shrink-0 text-[hsl(var(--status-approved))]" aria-hidden="true" />;
  }
  if (status === "partial") {
    return <CircleDot className="size-4 shrink-0 text-[hsl(var(--status-pending))]" aria-hidden="true" />;
  }
  return <Circle className="size-4 shrink-0 text-muted-foreground/40" aria-hidden="true" />;
}

interface SidebarProps {
  statuses?: Record<string, SectionStatus>;
}

export function Sidebar({ statuses }: SidebarProps) {
  const { lang } = useLanguage();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <nav aria-label="Form sections" className="flex h-full flex-col gap-1 overflow-y-auto p-3">
      <Link
        href="/economic-development-officer/dashboard"
        className={cn(
          "flex touch-target items-center gap-3 rounded-lg px-3 py-2.5 text-fluid-sm font-medium transition-colors",
          pathname?.endsWith("/dashboard")
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-muted"
        )}
      >
        <LayoutDashboard className="size-5 shrink-0" aria-hidden="true" />
        <Bilingual {...dictionary.dashboard} />
      </Link>

      <div className="my-2 border-t border-border" />

      {SECTION_KEYS.map((key) => {
        const meta = SECTION_META[key];
        const Icon = meta.icon;
        const href = `${ENTRY_BASE}/${SECTION_ROUTES[key]}`;
        const active = pathname === href;
        const status = statuses?.[key] ?? "empty";

        return (
          <Link
            key={key}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex touch-target items-center gap-3 rounded-lg px-3 py-2.5 text-fluid-sm transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
            )}
            aria-current={active ? "page" : undefined}
          >
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold nums-tabular",
                active ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"
              )}
            >
              {meta.number}
            </span>
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span lang={lang} className={cn("flex-1 truncate", lang === "si" ? "font-si" : "font-ui")}>
              {lang === "si" ? meta.title.si : meta.title.en}
            </span>
            <StatusIcon status={status} />
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
          aria-label="Open section navigation"
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
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-[clamp(260px,80vw,320px)] bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-fluid-base font-semibold font-display text-primary">
                <Bilingual {...dictionary.sections} />
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="touch-target"
                onClick={() => setMobileOpen(false)}
                aria-label="Close section navigation"
              >
                <X className="size-5" />
              </Button>
            </div>
            {nav}
          </div>
        </div>
      )}

      {/* Persistent rail on large screens */}
      <aside className="hidden w-[clamp(240px,20vw,300px)] shrink-0 border-r border-border bg-card lg:block">
        {nav}
      </aside>
    </>
  );
}
