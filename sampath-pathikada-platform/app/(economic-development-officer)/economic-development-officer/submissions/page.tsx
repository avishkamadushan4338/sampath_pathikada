"use client";

import Link from "next/link";
import { Loader2, Eye } from "lucide-react";
import { useSubmission } from "@/hooks/use-submission";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Bilingual } from "@/components/Bilingual";
import { dictionary } from "@/lib/i18n/dictionary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCompletionSummary } from "@/lib/submission-progress";
import { parseSectionReviews } from "@/lib/submission-review";
import { SECTION_META } from "@/lib/i18n/section-meta";
import { SECTION_KEYS } from "@/lib/types/submission";

const YEARS = [2026];

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  SUBMITTED: "default",
  APPROVED: "default",
  REJECTED: "destructive",
  REVISION_NEEDED: "outline",
};

const STATUS_LABEL: Record<string, { en: string; si: string }> = {
  DRAFT: dictionary.statusDraft,
  SUBMITTED: dictionary.statusSubmitted,
  APPROVED: dictionary.statusApproved,
  REJECTED: dictionary.statusRejected,
  REVISION_NEEDED: dictionary.statusRevisionNeeded,
};

function YearCard({ year }: { year: number }) {
  const { lang } = useLanguage();
  const { submission, isLoading } = useSubmission(year);

  if (isLoading || !submission) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
        </CardContent>
      </Card>
    );
  }

  const summary = getCompletionSummary(submission.data);
  const reviews = parseSectionReviews(submission.sectionReviews);
  const revisionSections = SECTION_KEYS.filter((key) => reviews[key]?.status === "REVISION_NEEDED");

  return (
    <Card className="card-lift">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-fluid-lg">{year}/{(year + 1) % 100}</CardTitle>
        <Badge variant={STATUS_VARIANT[submission.status] ?? "secondary"}>
          {STATUS_LABEL[submission.status]?.[lang] ?? submission.status}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-fluid-sm text-muted-foreground">
          <Bilingual
            en={`${summary.complete} of ${SECTION_KEYS.length} sections complete`}
            si={`කොටස් ${SECTION_KEYS.length} න් ${summary.complete} සම්පූර්ණයි`}
          />
        </p>
        {submission.rejectionNote && (
          <p className="rounded-md bg-destructive/10 p-2 text-fluid-sm text-destructive">{submission.rejectionNote}</p>
        )}
        {revisionSections.length > 0 && (
          <div className="rounded-md border border-[hsl(var(--status-pending))]/30 bg-[hsl(var(--status-pending))]/5 p-2">
            <p className="text-fluid-sm font-medium text-foreground">
              <Bilingual
                en={`${revisionSections.length} section(s) need revision`}
                si={`කොටස් ${revisionSections.length} ක් සංශෝධනය කළ යුතුය`}
              />
            </p>
            <ul className="mt-1 flex flex-col gap-1">
              {revisionSections.map((key) => (
                <li key={key}>
                  <details className="text-fluid-sm text-muted-foreground">
                    <summary className="cursor-pointer text-foreground">
                      {lang === "si" ? SECTION_META[key].title.si : SECTION_META[key].title.en}
                    </summary>
                    {reviews[key]?.note && <p className="mt-1 pl-4">{reviews[key]!.note}</p>}
                  </details>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button asChild variant="outline" size="sm" className="touch-target w-fit gap-1.5">
          <Link href="/economic-development-officer/dashboard">
            <Eye className="size-4" />
            <Bilingual en="View" si="බලන්න" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function SubmissionsHistoryPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-display text-fluid-2xl font-semibold text-primary">
        <Bilingual en="My Submissions" si="මගේ ඉදිරිපත් කිරීම්" />
      </h1>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
        {YEARS.map((year) => (
          <YearCard key={year} year={year} />
        ))}
      </div>
    </div>
  );
}
