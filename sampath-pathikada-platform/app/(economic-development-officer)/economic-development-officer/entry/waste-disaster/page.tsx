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
  { value: "separated", label: { en: "Separated", si: "වෙන් කළ" } },
];

const DISPOSAL_METHOD_LABELS: Record<(typeof DISPOSAL_METHODS)[number], { en: string; si: string }> = {
  burning: { en: "Burning", si: "පිලිස්සීම" },
  burying: { en: "Burying", si: "වළලීම" },
  "canal-or-drain-dumping": { en: "Dumping in Canal / Drain", si: "ඇළ මාර්ග/කාණුවලට බැහැර කිරීම" },
  "public-dumpsite": { en: "Public Dumpsite", si: "පොදු කසළ බැහැර කිරීමේ ස්ථානය" },
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
  return {
    ...empty,
    ...saved,
    disposalMethodIfNoProgram: empty.disposalMethodIfNoProgram?.map((row, i) => ({ ...row, ...saved.disposalMethodIfNoProgram?.[i] })),
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
    { key: "methodLabel", label: { en: "Method", si: "ක්‍රමය" }, type: "readonly" },
    {
      key: "present",
      label: { en: "Practiced?", si: "පිළිපදිනු ලැබේද?" },
      type: "select",
      options: [
        { value: "yes", label: { en: "Yes", si: "ඔව්" } },
        { value: "no", label: { en: "No", si: "නැත" } },
      ],
    },
  ];

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
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
        <FieldWrapper name="hasWasteProgram" label={wasteDisasterDict.fields.hasWasteProgram} required>
          {({ id, describedBy, invalid }) => (
            <Select
              value={form.watch("hasWasteProgram") ?? ""}
              onValueChange={(v) => form.setValue("hasWasteProgram", v as "yes" | "no", { shouldDirty: true })}
            >
              <SelectTrigger id={id} aria-describedby={describedBy} aria-invalid={invalid}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">{lang === "si" ? "ඔව්" : "Yes"}</SelectItem>
                <SelectItem value="no">{lang === "si" ? "නැත" : "No"}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </FieldWrapper>

        <FieldWrapper
          name="publicInformedOfSchedule"
          label={wasteDisasterDict.fields.publicInformedOfSchedule}
          required
        >
          {({ id, describedBy, invalid }) => (
            <Select
              value={form.watch("publicInformedOfSchedule") ?? ""}
              onValueChange={(v) =>
                form.setValue("publicInformedOfSchedule", v as "yes" | "no", { shouldDirty: true })
              }
            >
              <SelectTrigger id={id} aria-describedby={describedBy} aria-invalid={invalid}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">{lang === "si" ? "ඔව්" : "Yes"}</SelectItem>
                <SelectItem value="no">{lang === "si" ? "නැත" : "No"}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </FieldWrapper>

        <FieldWrapper name="collectionFrequency" label={wasteDisasterDict.fields.collectionFrequency} required>
          {({ id, describedBy, invalid }) => (
            <Select
              value={form.watch("collectionFrequency") ?? ""}
              onValueChange={(v) => form.setValue("collectionFrequency", v as (typeof COLLECTION_FREQUENCIES)[number], { shouldDirty: true })}
            >
              <SelectTrigger id={id} aria-describedby={describedBy} aria-invalid={invalid}>
                <SelectValue />
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

        <FieldWrapper name="collectionMethod" label={wasteDisasterDict.fields.collectionMethod} required>
          {({ id, describedBy, invalid }) => (
            <Select
              value={form.watch("collectionMethod") ?? ""}
              onValueChange={(v) => form.setValue("collectionMethod", v as (typeof COLLECTION_METHODS)[number], { shouldDirty: true })}
            >
              <SelectTrigger id={id} aria-describedby={describedBy} aria-invalid={invalid}>
                <SelectValue />
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
        >
          {({ id, describedBy, invalid }) => (
            <Select
              value={form.watch("hasCompostOrDisposalSite") ?? ""}
              onValueChange={(v) =>
                form.setValue("hasCompostOrDisposalSite", v as "yes" | "no", { shouldDirty: true })
              }
            >
              <SelectTrigger id={id} aria-describedby={describedBy} aria-invalid={invalid}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">{lang === "si" ? "ඔව්" : "Yes"}</SelectItem>
                <SelectItem value="no">{lang === "si" ? "නැත" : "No"}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </FieldWrapper>
      </div>

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
    </SectionForm>
  );
}
