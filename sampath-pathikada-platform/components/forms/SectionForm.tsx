"use client";

import { useEffect, useRef } from "react";
import { FormProvider, type FieldErrors, type FieldValues, type UseFormReturn } from "react-hook-form";
import { AlertTriangle, CheckCircle2, Inbox, Loader2, MessageSquareWarning, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Bilingual } from "@/components/Bilingual";
import { dictionary } from "@/lib/i18n/dictionary";
import type { Translated } from "@/lib/i18n/types";
import {
  SUBMISSION_LOCKED_ERROR,
  SECTION_LOCKED_APPROVED_ERROR,
  SECTION_LOCKED_SUBMITTED_ERROR,
  type SaveStatus,
  type SubmissionRecord,
} from "@/hooks/use-submission";
import { getSectionEditability, parseSectionReviews } from "@/lib/submission-review";
import type { SectionKey } from "@/lib/types/submission";
import { cn } from "@/lib/utils";

interface SectionFormProps<T extends FieldValues> {
  sectionNumber: number;
  title: Translated;
  description?: Translated;
  form: UseFormReturn<T>;
  saveStatus: SaveStatus;
  saveErrorMessage?: string | null;
  onSaveDraft: (values: T) => void | Promise<void>;
  /** Fires when a save attempt is blocked by validation — receives the full error set so a
   *  section can react to one specific failure (e.g. popping a dialog for a data-integrity
   *  issue that's too easy to miss as just an inline banner) without every other section having
   *  to know about it. The inline error summary above always shows regardless; this is for
   *  section-specific escalation on top of that default. */
  onInvalidSubmit?: (errors: FieldErrors<T>) => void;
  /** `null` while the submission is still loading — treated as editable so nothing flashes
   *  locked-then-unlocked; if it later turns out to genuinely be locked, the server 409s on save
   *  anyway. `getSectionEditability` here is UX only — the real security boundary is enforced
   *  server-side in `my-submission/[year]/route.ts`. */
  submission: SubmissionRecord | null;
  sectionKey: SectionKey;
  children: React.ReactNode;
}

export function SectionForm<T extends FieldValues>({
  sectionNumber,
  title,
  description,
  form,
  saveStatus,
  saveErrorMessage,
  onSaveDraft,
  onInvalidSubmit,
  submission,
  sectionKey,
  children,
}: SectionFormProps<T>) {
  const { lang } = useLanguage();
  const summaryRef = useRef<HTMLDivElement>(null);
  const errorCount = Object.keys(form.formState.errors).length;

  useEffect(() => {
    if (form.formState.submitCount > 0 && errorCount > 0) {
      summaryRef.current?.focus();
    }
  }, [form.formState.submitCount, errorCount]);

  const editability = submission
    ? getSectionEditability(submission.status, parseSectionReviews(submission.sectionReviews), sectionKey)
    : "editable";
  const locked = editability === "locked-approved" || editability === "locked-submitted";
  const review = submission?.sectionReviews?.[sectionKey];

  return (
    <FormProvider {...form}>
      <form
        // Required fields must be filled in before a save succeeds — react-hook-form's
        // handleSubmit only calls onSaveDraft when validation passes; on failure it just
        // populates formState.errors (rendered by FieldWrapper/RepeatableTable) and leaves
        // the save action a no-op, so the user sees exactly what's missing.
        onSubmit={form.handleSubmit(onSaveDraft, onInvalidSubmit)}
        noValidate
        className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8"
      >
        <header className="flex flex-col gap-2 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-fluid-sm font-semibold text-primary-foreground nums-tabular">
              {sectionNumber}
            </span>
            <h1 lang={lang} className={cn("font-display text-fluid-2xl font-semibold text-primary", lang === "si" && "font-si-heading")}>
              {lang === "si" ? title.si : title.en}
            </h1>
          </div>
          {description && (
            <p lang={lang} className={cn("text-fluid-base text-muted-foreground", lang === "si" && "font-si")}>
              {lang === "si" ? description.si : description.en}
            </p>
          )}
        </header>

        {editability === "locked-submitted" && (
          <div className="flex items-start gap-3 rounded-lg border border-[hsl(var(--status-pending))]/30 bg-[hsl(var(--status-pending))]/10 p-4">
            <Inbox className="mt-0.5 size-4 shrink-0 text-[hsl(var(--status-pending))]" aria-hidden="true" />
            <span lang={lang} className={cn("text-fluid-sm text-foreground", lang === "si" && "font-si")}>
              {dictionary.sectionAwaitingReview[lang]}
            </span>
          </div>
        )}

        {editability === "locked-approved" && (
          <div className="flex items-start gap-3 rounded-lg border border-[hsl(var(--status-approved))]/30 bg-[hsl(var(--status-approved))]/10 p-4">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[hsl(var(--status-approved))]" aria-hidden="true" />
            <span lang={lang} className={cn("text-fluid-sm text-foreground", lang === "si" && "font-si")}>
              {dictionary.sectionApprovedLocked[lang]}
            </span>
          </div>
        )}

        {editability === "revision-needed" && (
          <div className="flex items-start gap-3 rounded-lg border border-[hsl(var(--status-pending))]/30 bg-[hsl(var(--status-pending))]/10 p-4">
            <MessageSquareWarning className="mt-0.5 size-4 shrink-0 text-[hsl(var(--status-pending))]" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <span lang={lang} className={cn("text-fluid-sm font-medium text-foreground", lang === "si" && "font-si")}>
                {dictionary.sectionRevisionRequested[lang]}
              </span>
              {review?.note && <span className="text-fluid-sm text-muted-foreground">{review.note}</span>}
              <span lang={lang} className={cn("text-fluid-sm text-muted-foreground", lang === "si" && "font-si")}>
                {dictionary.sectionRevisionSaveHint[lang]}
              </span>
            </div>
          </div>
        )}

        <div
          ref={summaryRef}
          tabIndex={-1}
          aria-live="polite"
          className={cn(
            "rounded-lg border border-destructive/30 bg-destructive/5 p-4 focus:outline-none",
            errorCount === 0 && "hidden"
          )}
        >
          {errorCount > 0 && (
            <div className="flex items-start gap-2 text-fluid-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                <Bilingual
                  en={`${errorCount} required field(s) need to be filled in before this section can be saved.`}
                  si={`මෙම කොටස සුරැකීමට පෙර අනිවාර්ය ක්ෂේත්‍ර ${errorCount} ක් සම්පූර්ණ කළ යුතුය.`}
                />
              </span>
            </div>
          )}
        </div>

        <fieldset disabled={locked} className="contents">
          {children}
        </fieldset>

        {!locked && (
          <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div aria-live="polite" className="flex items-center gap-1.5 text-fluid-sm text-muted-foreground">
              {saveStatus === "saving" && (
                <>
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                  <Bilingual {...dictionary.saving} />
                </>
              )}
              {saveStatus === "saved" && <Bilingual {...dictionary.saved} />}
              {saveStatus === "error" && (
                <span className="text-destructive">
                  {saveErrorMessage === SUBMISSION_LOCKED_ERROR
                    ? dictionary.submissionLocked[lang]
                    : saveErrorMessage === SECTION_LOCKED_APPROVED_ERROR
                      ? dictionary.sectionApprovedLocked[lang]
                      : saveErrorMessage === SECTION_LOCKED_SUBMITTED_ERROR
                        ? dictionary.sectionAwaitingReview[lang]
                        : (saveErrorMessage ?? dictionary.saveError[lang])}
                </span>
              )}
            </div>
            <Button type="submit" size="lg" className="touch-target gap-2" disabled={saveStatus === "saving"}>
              {saveStatus === "saving" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="size-4" aria-hidden="true" />
              )}
              <Bilingual {...(editability === "revision-needed" ? dictionary.saveAndResubmit : dictionary.save)} />
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
