"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { SectionForm } from "@/components/forms/SectionForm";
import { FieldWrapper } from "@/components/forms/FormField";
import { RepeatableTable, type RepeatableColumn } from "@/components/forms/RepeatableTable";
import { Input } from "@/components/ui/input";
import { useSubmission, useSaveSection } from "@/hooks/use-submission";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { religiousCulturalDict } from "@/lib/i18n/sections/religious-cultural";
import { religiousCulturalSchemaPartial, HERITAGE_SITE_TYPES } from "@/lib/validators/sections/religious-cultural";
import { cn } from "@/lib/utils";
import type { z } from "zod";

const CURRENT_YEAR = 2026;

type ReligiousCulturalDraft = z.infer<typeof religiousCulturalSchemaPartial>;

const YES_NO_OPTIONS = [
  { value: "yes", label: { en: "Yes", si: "ඔව්" } },
  { value: "no", label: { en: "No", si: "නැත" } },
];

const HERITAGE_SITE_TYPE_LABELS: Record<(typeof HERITAGE_SITE_TYPES)[number], { en: string; si: string }> = {
  "temple-vihara": { en: "Temple / Vihara", si: "පන්සල්/විහාරස්ථාන" },
  "forest-hermitage": { en: "Forest Hermitage", si: "අරණ්‍ය සේනාසන" },
  asapuwa: { en: "Asapuwa", si: "අසපුව" },
  "meditation-center": { en: "Meditation Center", si: "භාවනා මධ්‍යස්ථාන" },
  "nuns-hermitage": { en: "Nun's Hermitage", si: "මෙහෙනි ආරාම" },
  mosque: { en: "Mosque", si: "ඉස්ලාම් පල්ලි" },
  "catholic-church": { en: "Catholic Church", si: "කතෝලික පල්ලි" },
  kovil: { en: "Kovil", si: "කෝවිල්" },
  devalaya: { en: "Devalaya", si: "දේවාල" },
};

const EMPTY_VALUES: ReligiousCulturalDraft = {
  religiousSiteCounts: {
    temples: { count: 0, clergyCount: 0 },
    meheniArama: { count: 0, clergyCount: 0 },
    kovils: { count: 0, clergyCount: 0 },
    mosques: { count: 0, clergyCount: 0 },
    churches: { count: 0, priestsCount: 0, nunsCount: 0 },
  },
  heritageSites: [],
  artAcademies: [],
  traditionalArtists: [],
};

export default function ReligiousCulturalPage() {
  const { lang } = useLanguage();
  const { submission, isLoading } = useSubmission(CURRENT_YEAR);
  const { saveSection, status, errorMessage } = useSaveSection(CURRENT_YEAR);

  const form = useForm<ReligiousCulturalDraft>({
    resolver: zodResolver(religiousCulturalSchemaPartial),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (submission?.data.religiousCultural) {
      form.reset({ ...EMPTY_VALUES, ...submission.data.religiousCultural });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission]);

  async function handleSave(values: ReligiousCulturalDraft) {
    await saveSection("religiousCultural", values);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  const heritageSiteColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name of Religious Site / Sacred Site", si: "ආගමික ස්ථානයන්හි /පූජනීය ස්ථානයේ නම" }, type: "text" },
    {
      key: "type",
      label: { en: "* Type", si: "*වර්ගය" },
      type: "select",
      options: HERITAGE_SITE_TYPES.map((t) => ({ value: t, label: HERITAGE_SITE_TYPE_LABELS[t] })),
    },
    { key: "significance", label: { en: "Reason for Being Special", si: "සුවිශේෂී වීමට හේතු" }, type: "text" },
    {
      key: "usedForDhammaOrGovtPurpose",
      label: { en: "Used for Dhamma School / Pirivena / Govt Purpose?", si: "දහම් පාසල්/පිරිවෙන් හෝ රජයේ කාර්යන් සඳහා භාවිතා කරනවාද" },
      type: "select",
      options: YES_NO_OPTIONS,
    },
    { key: "taskDescription", label: { en: "Describe the Task", si: "එම කටයුත්ත විස්තර කරන්න" }, type: "text" },
  ];

  const artAcademyColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name of Art Institution", si: "කලායතනයේ නම" }, type: "text" },
    { key: "registrationNumber", label: { en: "Registration No.", si: "ලියාපදිංචි අංකය" }, type: "text" },
    { key: "studentCount", label: { en: "Student Count", si: "සිසුන් ගණන" }, type: "number" },
  ];

  const traditionalArtistColumns: RepeatableColumn[] = [
    { key: "artForm", label: { en: "* Famous Art Field", si: "*ප්‍රසිද්ධ කලා ක්ෂේත්‍රය" }, type: "text" },
    { key: "name", label: { en: "Artists Produced", si: "බිහිවූ කලාකරුවන්" }, type: "text" },
    { key: "description", label: { en: "Description", si: "විස්තරය" }, type: "text" },
  ];

  const headingClass = cn("text-fluid-lg font-semibold text-foreground", lang === "si" && "font-si-heading");
  const subHeadingClass = cn("text-fluid-base font-medium text-foreground", lang === "si" && "font-si");

  return (
    <SectionForm
      sectionNumber={8}
      title={religiousCulturalDict.title}
      description={religiousCulturalDict.description}
      form={form}
      saveStatus={status}
      saveErrorMessage={errorMessage}
      onSaveDraft={handleSave}
    >
      <div className="flex flex-col gap-4">
        <h2 lang={lang} className={headingClass}>
          {religiousCulturalDict.fields.religiousSiteCounts[lang]}
        </h2>

        <div className="flex flex-col gap-2">
          <h3 lang={lang} className={subHeadingClass}>
            {lang === "si" ? "පන්සල්/ආරණ්‍ය විහාරස්ථාන/අසපුව" : "Temple / Forest Hermitage / Asapuwa"}
          </h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            <FieldWrapper name="religiousSiteCounts.temples.count" label={{ en: "Count", si: "ගණන" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("religiousSiteCounts.temples.count")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="religiousSiteCounts.temples.clergyCount" label={{ en: "Monks", si: "භික්ෂූන් වහන්සේලා" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("religiousSiteCounts.temples.clergyCount")} />
              )}
            </FieldWrapper>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 lang={lang} className={subHeadingClass}>
            {lang === "si" ? "මෙහෙනි ආරාම" : "Nun Hermitages"}
          </h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            <FieldWrapper name="religiousSiteCounts.meheniArama.count" label={{ en: "Count", si: "ගණන" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("religiousSiteCounts.meheniArama.count")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="religiousSiteCounts.meheniArama.clergyCount" label={{ en: "Nuns", si: "මෙහෙනීන් වහන්සේලා" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("religiousSiteCounts.meheniArama.clergyCount")} />
              )}
            </FieldWrapper>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 lang={lang} className={subHeadingClass}>
            {lang === "si" ? "කෝවිල්" : "Kovils"}
          </h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            <FieldWrapper name="religiousSiteCounts.kovils.count" label={{ en: "Count", si: "ගණන" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("religiousSiteCounts.kovils.count")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="religiousSiteCounts.kovils.clergyCount" label={{ en: "Poojaris", si: "පූජකතුමන්ලා /පූසාරි" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("religiousSiteCounts.kovils.clergyCount")} />
              )}
            </FieldWrapper>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 lang={lang} className={subHeadingClass}>
            {lang === "si" ? "ඉස්ලාම් පල්ලි" : "Mosques"}
          </h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            <FieldWrapper name="religiousSiteCounts.mosques.count" label={{ en: "Count", si: "ගණන" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("religiousSiteCounts.mosques.count")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="religiousSiteCounts.mosques.clergyCount" label={{ en: "Moulavis", si: "මවුලවිතුමන්ලා" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("religiousSiteCounts.mosques.clergyCount")} />
              )}
            </FieldWrapper>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 lang={lang} className={subHeadingClass}>
            {lang === "si" ? "කතෝලික පල්ලි" : "Catholic Church"}
          </h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            <FieldWrapper name="religiousSiteCounts.churches.count" label={{ en: "Count", si: "ගණන" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("religiousSiteCounts.churches.count")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="religiousSiteCounts.churches.priestsCount" label={{ en: "Priests", si: "පියතුමන්ලා" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("religiousSiteCounts.churches.priestsCount")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="religiousSiteCounts.churches.nunsCount" label={{ en: "Nuns / Sisters", si: "කන්‍යා සොයුරියන්" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("religiousSiteCounts.churches.nunsCount")} />
              )}
            </FieldWrapper>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="heritageSites"
          title={religiousCulturalDict.fields.heritageSites}
          columns={heritageSiteColumns}
          emptyRowFactory={() => ({
            name: "",
            type: HERITAGE_SITE_TYPES[0],
            significance: "",
            usedForDhammaOrGovtPurpose: "no",
            taskDescription: "",
          })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="artAcademies"
          title={religiousCulturalDict.fields.artAcademies}
          columns={artAcademyColumns}
          emptyRowFactory={() => ({ name: "", registrationNumber: "", studentCount: 0 })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="traditionalArtists"
          title={religiousCulturalDict.fields.traditionalArtists}
          columns={traditionalArtistColumns}
          emptyRowFactory={() => ({ name: "", artForm: "", description: "" })}
        />
      </div>
    </SectionForm>
  );
}
