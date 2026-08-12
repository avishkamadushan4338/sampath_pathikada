"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { SectionForm } from "@/components/forms/SectionForm";
import { FieldWrapper } from "@/components/forms/FormField";
import { RepeatableTable, type RepeatableColumn } from "@/components/forms/RepeatableTable";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubmission, useSaveSection } from "@/hooks/use-submission";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { wasteDisasterDict } from "@/lib/i18n/sections/waste-disaster";
import {
  wasteDisasterSchemaPartial,
  COLLECTION_FREQUENCIES,
  COLLECTION_METHODS,
  DISPOSAL_METHODS,
} from "@/lib/validators/sections/waste-disaster";
import { z } from "zod";
import { cn } from "@/lib/utils";

const SELECT_PLACEHOLDER = { en: "Select", si: "තෝරන්න" };

const CURRENT_YEAR = 2026;

type WasteDisasterDraft = z.infer<typeof wasteDisasterSchemaPartial>;

const COLLECTION_FREQUENCY_OPTIONS: { value: (typeof COLLECTION_FREQUENCIES)[number]; label: { en: string; si: string } }[] = [
  { value: "daily", label: { en: "Daily", si: "දිනපතා" } },
  { value: "every-other-day", label: { en: "Every Other Day", si: "දිනයක් හැර දිනයක්" } },
  { value: "weekly", label: { en: "Weekly", si: "සතිපතා" } },
  { value: "other", label: { en: "Other", si: "වෙනත්" } },
];

const COLLECTION_METHOD_OPTIONS: { value: (typeof COLLECTION_METHODS)[number]; label: { en: string; si: string } }[] = [
  { value: "mixed", label: { en: "Mixed", si: "මිශ්‍ර" } },
  { value: "separated", label: { en: "Separated", si: "වෙන්කල" } },
];

const DISPOSAL_METHOD_LABELS: Record<(typeof DISPOSAL_METHODS)[number], { en: string; si: string }> = {
  burning: { en: "Burning", si: "පිළිස්සීම" },
  burying: { en: "Burying (Dumping in a Pit)", si: "වළදැමීම" },
  "canal-or-drain-dumping": { en: "Disposal into Drainage Systems / Canal Routes", si: "කාණු පද්ධති/ඇළ මාර්ග වලට බැහැර කිරීම" },
  "public-dumpsite": { en: "Disposal at a Public Place", si: "පොදු ස්ථානයකට බැහැර කිරීම" },
  other: { en: "Other", si: "වෙනත්" },
};

function getEmptyValues(lang: "en" | "si"): WasteDisasterDraft {
  return {
    hasWasteProgram: undefined,
    publicInformedOfSchedule: undefined,
    collectionFrequency: undefined,
    collectionMethod: undefined,
    disposalMethodIfNoProgram: DISPOSAL_METHODS.map((method) => ({
      method,
      methodLabel: DISPOSAL_METHOD_LABELS[method][lang],
      present: "no" as const,
    })),
    hasCompostOrDisposalSite: undefined,
    proposedSolutionIfNoProgram: "",
  };
}

function mergeWithSaved(empty: WasteDisasterDraft, saved: WasteDisasterDraft): WasteDisasterDraft {
  const savedByMethod = new Map((saved.disposalMethodIfNoProgram ?? []).filter((r) => r?.method).map((r) => [r!.method, r]));

  return {
    ...empty,
    ...saved,
    disposalMethodIfNoProgram: empty.disposalMethodIfNoProgram?.map((row) => ({ ...row, ...savedByMethod.get(row.method) })),
  };
}

export default function WasteDisasterPage() {
  const { lang } = useLanguage();
  const { submission, isLoading } = useSubmission(CURRENT_YEAR);
  const { saveSection, status, errorMessage } = useSaveSection(CURRENT_YEAR);

  const form = useForm<WasteDisasterDraft>({
    resolver: zodResolver(wasteDisasterSchemaPartial),
    defaultValues: getEmptyValues(lang),
  });

  useEffect(() => {
    if (submission?.data.wasteDisaster) {
      form.reset(mergeWithSaved(getEmptyValues(lang), submission.data.wasteDisaster));
    } else {
      form.reset(getEmptyValues(lang));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission, lang]);

  async function handleSave(values: WasteDisasterDraft) {
    await saveSection("wasteDisaster", values);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  const disposalMethodColumns: RepeatableColumn[] = [
    { key: "methodLabel", label: { en: "Waste Disposal Method", si: "කසළ හා ඝන අපද්‍රව්‍ය ක්‍රමවත්ව ඉවත් කිරීම" }, type: "readonly" },
    {
      key: "present",
      label: { en: "Present", si: "ඇත/නැත" },
      type: "select",
      required: true,
      options: [
        { value: "yes", label: { en: "Yes", si: "ඔව්" } },
        { value: "no", label: { en: "No", si: "නැත" } },
      ],
    },
  ];

  const hasWasteProgram = form.watch("hasWasteProgram");

  return (
    <SectionForm
      sectionNumber={15}
      title={wasteDisasterDict.title}
      description={wasteDisasterDict.description}
      form={form}
      saveStatus={status}
      saveErrorMessage={errorMessage}
      onSaveDraft={handleSave}
    >
      {/* Each question here is a full paper-form sentence, not a short field name — left in a
          plain grid, the wrapped label towers over a dropdown that shrinks to fit its own
          content (Select's default width is fit-to-content, not fit-to-container), leaving the
          control looking like an orphaned afterthought below a wall of text. Containing each
          question in its own card (with the dropdown stretched to the card's width) gives every
          question a clear boundary and keeps the control visually anchored to its label. */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
        <FieldWrapper
          name="hasWasteProgram"
          label={wasteDisasterDict.fields.hasWasteProgram}
          required
          className="rounded-lg border border-border bg-card p-4"
        >
          {({ id, describedBy, invalid }) => (
            <Select
              value={hasWasteProgram ?? ""}
              onValueChange={(v) => form.setValue("hasWasteProgram", v as "yes" | "no", { shouldDirty: true })}
            >
              <SelectTrigger id={id} className="w-full" aria-describedby={describedBy} aria-invalid={invalid}>
                <SelectValue placeholder={lang === "si" ? SELECT_PLACEHOLDER.si : SELECT_PLACEHOLDER.en} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">{lang === "si" ? "ඔව්" : "Yes"}</SelectItem>
                <SelectItem value="no">{lang === "si" ? "නැත" : "No"}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </FieldWrapper>

        {/* Only meaningful once hasWasteProgram is "yes" — the label literally says "If Yes,
            ..." — so it stays out of the way until that's actually the answer, rather than
            sitting there asking a question that doesn't apply yet. */}
        {hasWasteProgram === "yes" && (
          <FieldWrapper
            name="publicInformedOfSchedule"
            label={wasteDisasterDict.fields.publicInformedOfSchedule}
            required
            className="rounded-lg border border-border bg-card p-4"
          >
            {({ id, describedBy, invalid }) => (
              <Select
                value={form.watch("publicInformedOfSchedule") ?? ""}
                onValueChange={(v) =>
                  form.setValue("publicInformedOfSchedule", v as "yes" | "no", { shouldDirty: true })
                }
              >
                <SelectTrigger id={id} className="w-full" aria-describedby={describedBy} aria-invalid={invalid}>
                  <SelectValue placeholder={lang === "si" ? SELECT_PLACEHOLDER.si : SELECT_PLACEHOLDER.en} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">{lang === "si" ? "ඔව්" : "Yes"}</SelectItem>
                  <SelectItem value="no">{lang === "si" ? "නැත" : "No"}</SelectItem>
                </SelectContent>
              </Select>
            )}
          </FieldWrapper>
        )}

        <FieldWrapper
          name="collectionFrequency"
          label={wasteDisasterDict.fields.collectionFrequency}
          required
          className="rounded-lg border border-border bg-card p-4"
        >
          {({ id, describedBy, invalid }) => (
            <Select
              value={form.watch("collectionFrequency") ?? ""}
              onValueChange={(v) => form.setValue("collectionFrequency", v as (typeof COLLECTION_FREQUENCIES)[number], { shouldDirty: true })}
            >
              <SelectTrigger id={id} className="w-full" aria-describedby={describedBy} aria-invalid={invalid}>
                <SelectValue placeholder={lang === "si" ? SELECT_PLACEHOLDER.si : SELECT_PLACEHOLDER.en} />
              </SelectTrigger>
              <SelectContent>
                {COLLECTION_FREQUENCY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {lang === "si" ? opt.label.si : opt.label.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FieldWrapper>

        <FieldWrapper
          name="collectionMethod"
          label={wasteDisasterDict.fields.collectionMethod}
          required
          className="rounded-lg border border-border bg-card p-4"
        >
          {({ id, describedBy, invalid }) => (
            <Select
              value={form.watch("collectionMethod") ?? ""}
              onValueChange={(v) => form.setValue("collectionMethod", v as (typeof COLLECTION_METHODS)[number], { shouldDirty: true })}
            >
              <SelectTrigger id={id} className="w-full" aria-describedby={describedBy} aria-invalid={invalid}>
                <SelectValue placeholder={lang === "si" ? SELECT_PLACEHOLDER.si : SELECT_PLACEHOLDER.en} />
              </SelectTrigger>
              <SelectContent>
                {COLLECTION_METHOD_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {lang === "si" ? opt.label.si : opt.label.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FieldWrapper>

        <FieldWrapper
          name="hasCompostOrDisposalSite"
          label={wasteDisasterDict.fields.hasCompostOrDisposalSite}
          required
          className="rounded-lg border border-border bg-card p-4"
        >
          {({ id, describedBy, invalid }) => (
            <Select
              value={form.watch("hasCompostOrDisposalSite") ?? ""}
              onValueChange={(v) =>
                form.setValue("hasCompostOrDisposalSite", v as "yes" | "no", { shouldDirty: true })
              }
            >
              <SelectTrigger id={id} className="w-full" aria-describedby={describedBy} aria-invalid={invalid}>
                <SelectValue placeholder={lang === "si" ? SELECT_PLACEHOLDER.si : SELECT_PLACEHOLDER.en} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">{lang === "si" ? "ඔව්" : "Yes"}</SelectItem>
                <SelectItem value="no">{lang === "si" ? "නැත" : "No"}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </FieldWrapper>
      </div>

      {/* Both of these only apply once hasWasteProgram is "no" — the labels literally say "If
          There Is No Systematic Arrangement, ..." — so they're grouped into one conditional
          block instead of two separately-hidden fields. */}
      {hasWasteProgram === "no" ? (
        <>
          <div className="border-t border-border pt-6">
            <RepeatableTable
              name="disposalMethodIfNoProgram"
              title={wasteDisasterDict.fields.disposalMethodIfNoProgram}
              columns={disposalMethodColumns}
              fixedRows
              emptyRowFactory={() => ({
                method: DISPOSAL_METHODS[0],
                methodLabel: DISPOSAL_METHOD_LABELS[DISPOSAL_METHODS[0]][lang],
                present: "no",
              })}
            />
          </div>

          <div className="border-t border-border pt-6">
            <FieldWrapper
              name="proposedSolutionIfNoProgram"
              label={wasteDisasterDict.fields.proposedSolutionIfNoProgram}
              required
            >
              {({ id, describedBy, invalid }) => (
                <Textarea
                  id={id}
                  rows={4}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  {...form.register("proposedSolutionIfNoProgram")}
                />
              )}
            </FieldWrapper>
          </div>
        </>
      ) : (
        <div className="border-t border-border pt-6">
          <p lang={lang} className={cn("text-fluid-sm text-muted-foreground", lang === "si" && "font-si")}>
            {lang === "si"
              ? "වර්තමාන කසළ බැහැර කිරීමේ ක්‍රමය හා යෝජිත විසඳුම ඇතුළත් කිරීමට ඉහත පළමු ප්‍රශ්නය නැත ලෙස සකසන්න."
              : "Set the first question above to No to describe the current disposal method and propose a solution."}
          </p>
        </div>
      )}
    </SectionForm>
  );
}
