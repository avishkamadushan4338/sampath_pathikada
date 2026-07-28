"use client";

import type { ReactNode } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Bilingual } from "@/components/Bilingual";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import type { Translated } from "@/lib/i18n/types";

interface CollapsibleFieldGroupProps {
  /** Also used as the DOM id on the item root, so the quick-jump strip can scroll to it directly
   *  regardless of open/closed state (the trigger header's position doesn't move when the
   *  content below it expands or collapses). */
  value: string;
  title: Translated;
  status: "empty" | "filled";
  /** e.g. "3 entries" for a repeatable list — replaces the generic Started/Not started label. */
  countLabel?: Translated;
  children: ReactNode;
}

/** One collapsible subsection of a long entry form: a titled accordion item with a status badge
 *  (entry count for repeatable lists, started/not-started for count groups) so an officer can
 *  see at a glance what's been filled in without opening every section. Purely presentational —
 *  callers own their own field logic and just decide what `status`/`countLabel` to pass. */
export function CollapsibleFieldGroup({ value, title, status, countLabel, children }: CollapsibleFieldGroupProps) {
  const { lang } = useLanguage();

  return (
    <AccordionItem value={value} id={`section-${value}`} className="border-t border-border py-0 first:border-t-0">
      <AccordionTrigger className="py-4 hover:no-underline">
        <span className="flex flex-1 items-center justify-between gap-3">
          <span lang={lang} className={cn("text-fluid-lg font-semibold text-foreground", lang === "si" && "font-si-heading")}>
            {lang === "si" ? title.si : title.en}
          </span>
          <Badge variant={status === "filled" ? "secondary" : "outline"} className="shrink-0 gap-1 nums-tabular">
            {status === "filled" ? (
              <CheckCircle2 className="size-3.5 text-[hsl(var(--status-approved))]" aria-hidden="true" />
            ) : (
              <Circle className="size-3.5 text-muted-foreground/50" aria-hidden="true" />
            )}
            {countLabel ? (
              lang === "si" ? countLabel.si : countLabel.en
            ) : status === "filled" ? (
              <Bilingual en="Started" si="ආරම්භ කර ඇත" />
            ) : (
              <Bilingual en="Not started" si="ආරම්භ කර නැත" />
            )}
          </Badge>
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-6">
        <div className="flex flex-col gap-4">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

/** True if any field in a scalar count group (e.g. institutionCounts) has been given a
 *  non-zero value — the "started" signal for groups where every field is independently
 *  optional (a division can legitimately have zero pirivenas, zero dhamma schools, etc.), so
 *  there's no meaningful "partial vs complete" distinction, only "touched vs not". */
export function hasAnyNonZero(values: Record<string, number | undefined> | undefined): boolean {
  if (!values) return false;
  return Object.values(values).some((v) => typeof v === "number" && v > 0);
}

/** Bilingual "N entries" label for a repeatable list's status badge. */
export function entryCountLabel(count: number): Translated {
  return {
    en: `${count} ${count === 1 ? "entry" : "entries"}`,
    si: `සටහන් ${count}`,
  };
}
