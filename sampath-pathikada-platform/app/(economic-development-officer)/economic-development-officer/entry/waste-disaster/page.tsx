"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { SectionForm } from "@/components/forms/SectionForm";
import { FieldWrapper } from "@/components/forms/FormField";
import { RepeatableTable, type RepeatableColumn } from "@/components/forms/RepeatableTable";
import { Input } from "@/components/ui/input";
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
import { wasteDisasterSchemaPartial } from "@/lib/validators/sections/waste-disaster";
import { z } from "zod";

const CURRENT_YEAR = 2026;

type WasteDisasterDraft = z.infer<typeof wasteDisasterSchemaPartial>;

const DISPOSAL_METHODS = [
  { key: "burning", label: { en: "Burning", si: "පිලිස්සීම" } },
  { key: "burying", label: { en: "Burying", si: "වළලීම" } },
  { key: "canal-or-drain-dumping", label: { en: "Dumping in Canal / Drain", si: "ඇළ මාර්ග/කාණුවලට බැහැර කිරීම" } },
  { key: "public-dumpsite", label: { en: "Public Dumpsite", si: "පොදු කසළ බැහැර කිරීමේ ස්ථානය" } },
  { key: "other", label: { en: "Other", si: "වෙනත්" } },
];

function getEmptyValues(lang: "en" | "si"): WasteDisasterDraft {
  return {
    hasWasteProgram: undefined,
    publicInformedOfSchedule: undefined,
    collectionFrequency: "",
    collectionMethod: "",
    disposalMethodIfNoProgram: DISPOSAL_METHODS.map((m) => ({
      label: lang === "si" ? m.label.si : m.label.en,
      present: "no" as const,
    })),
    hasCompostOrDisposalSite: undefined,
    proposedSolutionIfNoProgram: "",
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
      form.reset({ ...getEmptyValues(lang), ...submission.data.wasteDisaster });
    } else {
      form.reset(getEmptyValues(lang));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission]);

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
    { key: "label", label: { en: "Method", si: "ක්‍රමය" }, type: "readonly" },
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
            <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} {...form.register("collectionFrequency")} />
          )}
        </FieldWrapper>

        <FieldWrapper name="collectionMethod" label={wasteDisasterDict.fields.collectionMethod} required>
          {({ id, describedBy, invalid }) => (
            <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} {...form.register("collectionMethod")} />
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
          emptyRowFactory={() => ({ label: "", present: "no" })}
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
