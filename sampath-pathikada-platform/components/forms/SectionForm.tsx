"use client";

import { useEffect, useRef } from "react";
import { FormProvider, type FieldErrors, type FieldValues, type UseFormReturn } from "react-hook-form";
import { AlertTriangle, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Bilingual } from "@/components/Bilingual";
import { dictionary } from "@/lib/i18n/dictionary";
import type { Translated } from "@/lib/i18n/types";
import { SUBMISSION_LOCKED_ERROR, type SaveStatus } from "@/hooks/use-submission";
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

        {children}

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
                  : saveErrorMessage ?? dictionary.saveError[lang]}
              </span>
            )}
          </div>
          <Button type="submit" size="lg" className="touch-target gap-2" disabled={saveStatus === "saving"}>
            {saveStatus === "saving" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            <Bilingual {...dictionary.save} />
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
