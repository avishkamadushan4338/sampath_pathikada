"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Circle, CircleDot, Loader2, Send } from "lucide-react";
import { useSubmission } from "@/hooks/use-submission";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Bilingual } from "@/components/Bilingual";
import { dictionary } from "@/lib/i18n/dictionary";
import { SECTION_KEYS, SECTION_ROUTES } from "@/lib/types/submission";
import { SECTION_META } from "@/lib/i18n/section-meta";
import { getAllSectionStatuses, getIncompleteSections, type SectionStatus } from "@/lib/submission-progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const CURRENT_YEAR = 2026;
const ENTRY_BASE = "/economic-development-officer/entry";

const STATUS_STYLES: Record<SectionStatus, string> = {
  complete: "border-[hsl(var(--status-approved))]/30 bg-[hsl(var(--status-approved))]/5",
  partial: "border-[hsl(var(--status-pending))]/30 bg-[hsl(var(--status-pending))]/5",
  empty: "border-border bg-card",
};

function StatusIcon({ status }: { status: SectionStatus }) {
  if (status === "complete") return <CheckCircle2 className="size-5 text-[hsl(var(--status-approved))]" aria-hidden="true" />;
  if (status === "partial") return <CircleDot className="size-5 text-[hsl(var(--status-pending))]" aria-hidden="true" />;
  return <Circle className="size-5 text-muted-foreground/40" aria-hidden="true" />;
}

export default function DashboardPage() {
  const { lang } = useLanguage();
  const { submission, isLoading, mutate } = useSubmission(CURRENT_YEAR);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const statuses = useMemo(
    () => (submission ? getAllSectionStatuses(submission.data) : null),
    [submission]
  );
  const incomplete = useMemo(
    () => (submission ? getIncompleteSections(submission.data) : []),
    [submission]
  );
  const completeCount = statuses ? Object.values(statuses).filter((s) => s === "complete").length : 0;
  const touchedCount = statuses ? Object.values(statuses).filter((s) => s !== "empty").length : 0;
  const missingCount = SECTION_KEYS.length - touchedCount;

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/my-submission/${CURRENT_YEAR}/submit`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        toast.error(json.message ?? "Could not submit.");
        return;
      }
      toast.success(lang === "si" ? "වාර්ෂික වාර්තාව ඉදිරිපත් කරන ලදී" : "Annual report submitted");
      setDialogOpen(false);
      mutate();
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading || !submission || !statuses) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-fluid-3xl font-semibold text-primary">
            <Bilingual
              en={`${CURRENT_YEAR}/${(CURRENT_YEAR + 1) % 100} Socio-Economic Profile`}
              si={`${CURRENT_YEAR}/${(CURRENT_YEAR + 1) % 100} සමාජ ආර්ථික පැතිකඩ`}
              as="span"
            />
          </h1>
          <p className="mt-2 text-fluid-base text-muted-foreground">
            <Bilingual
              en={`${completeCount} of ${SECTION_KEYS.length} sections complete · ${touchedCount} saved`}
              si={`කොටස් ${SECTION_KEYS.length} න් ${completeCount} සම්පූර්ණයි · ${touchedCount} ක් සුරකින ලදී`}
            />
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="touch-target gap-2" disabled={submission.status !== "DRAFT" && submission.status !== "REVISION_NEEDED"}>
              <Send className="size-4" aria-hidden="true" />
              <Bilingual {...dictionary.submit} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <Bilingual {...dictionary.submitConfirmTitle} />
              </DialogTitle>
            </DialogHeader>
            {missingCount > 0 && (
              <p className="text-fluid-sm text-destructive">
                <Bilingual
                  en={`${missingCount} section(s) have not been saved yet. Please save every section at least once before submitting.`}
                  si={`කොටස් ${missingCount} ක් තවම සුරකා නොමැත. ඉදිරිපත් කිරීමට පෙර සෑම කොටසක්ම අවම වශයෙන් වරක් සුරකින්න.`}
                />
              </p>
            )}
            {missingCount === 0 && incomplete.length > 0 && (
              <div className="rounded-lg border border-[hsl(var(--status-pending))]/30 bg-[hsl(var(--status-pending))]/5 p-3">
                <p className="mb-2 text-fluid-sm font-medium">
                  <Bilingual {...dictionary.submitIncompleteWarning} />
                </p>
                <ul className="list-inside list-disc text-fluid-sm text-muted-foreground">
                  {incomplete.map((key) => (
                    <li key={key}>
                      {lang === "si" ? SECTION_META[key].title.si : SECTION_META[key].title.en}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                <Bilingual {...dictionary.cancel} />
              </Button>
              <Button onClick={handleSubmit} disabled={missingCount > 0 || submitting} className="gap-2">
                {submitting && <Loader2 className="size-4 animate-spin" />}
                <Bilingual {...dictionary.confirm} />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(clamp(240px,30vw,320px),1fr))] gap-4">
        {SECTION_KEYS.map((key) => {
          const meta = SECTION_META[key];
          const Icon = meta.icon;
          const status = statuses[key];
          return (
            <Link key={key} href={`${ENTRY_BASE}/${SECTION_ROUTES[key]}`} className="group block focus-visible:outline-none">
              <Card className={`h-full transition-shadow card-lift ${STATUS_STYLES[status]}`}>
                <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-fluid-sm font-semibold nums-tabular text-muted-foreground">
                      {meta.number}
                    </span>
                    <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />
                  </div>
                  <StatusIcon status={status} />
                </CardHeader>
                <CardContent>
                  <CardTitle lang={lang} className={lang === "si" ? "font-si text-fluid-base" : "font-ui text-fluid-base"}>
                    {lang === "si" ? meta.title.si : meta.title.en}
                  </CardTitle>
                  <div className="mt-3 flex items-center gap-1 text-fluid-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    <span>
                      {status === "complete"
                        ? dictionary.completionComplete[lang]
                        : status === "partial"
                          ? dictionary.completionPartial[lang]
                          : dictionary.completionEmpty[lang]}
                    </span>
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
