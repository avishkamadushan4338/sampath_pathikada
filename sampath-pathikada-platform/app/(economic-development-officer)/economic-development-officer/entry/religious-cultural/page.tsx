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
import { religiousCulturalSchemaPartial } from "@/lib/validators/sections/religious-cultural";
import { cn } from "@/lib/utils";
import type { z } from "zod";

const CURRENT_YEAR = 2026;

type ReligiousCulturalDraft = z.infer<typeof religiousCulturalSchemaPartial>;

const EMPTY_VALUES: ReligiousCulturalDraft = {
  religiousSiteCounts: {
    temples: { count: 0, clergyCount: 0 },
    kovils: { count: 0, clergyCount: 0 },
    mosques: { count: 0, clergyCount: 0 },
    churches: { count: 0, clergyCount: 0 },
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
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "type", label: { en: "Type", si: "වර්ගය" }, type: "text" },
    { key: "significance", label: { en: "Significance", si: "වැදගත්කම" }, type: "text" },
  ];

  const artAcademyColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "studentCount", label: { en: "Student Count", si: "සිසු සංඛ්‍යාව" }, type: "number" },
  ];

  const traditionalArtistColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "artForm", label: { en: "Art Form", si: "කලා ආකෘතිය" }, type: "text" },
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
            {lang === "si" ? "පන්සල්" : "Temples"}
          </h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            <FieldWrapper name="religiousSiteCounts.temples.count" label={{ en: "Count", si: "ගණන" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("religiousSiteCounts.temples.count")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="religiousSiteCounts.temples.clergyCount" label={{ en: "Clergy Count", si: "පූජක සංඛ්‍යාව" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("religiousSiteCounts.temples.clergyCount")} />
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
            <FieldWrapper name="religiousSiteCounts.kovils.clergyCount" label={{ en: "Clergy Count", si: "පූජක සංඛ්‍යාව" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("religiousSiteCounts.kovils.clergyCount")} />
              )}
            </FieldWrapper>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 lang={lang} className={subHeadingClass}>
            {lang === "si" ? "පල්ලි (මුස්ලිම්)" : "Mosques"}
          </h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            <FieldWrapper name="religiousSiteCounts.mosques.count" label={{ en: "Count", si: "ගණන" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("religiousSiteCounts.mosques.count")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="religiousSiteCounts.mosques.clergyCount" label={{ en: "Clergy Count", si: "පූජක සංඛ්‍යාව" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("religiousSiteCounts.mosques.clergyCount")} />
              )}
            </FieldWrapper>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 lang={lang} className={subHeadingClass}>
            {lang === "si" ? "පල්ලි (ක්‍රිස්තියානි)" : "Churches"}
          </h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            <FieldWrapper name="religiousSiteCounts.churches.count" label={{ en: "Count", si: "ගණන" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("religiousSiteCounts.churches.count")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="religiousSiteCounts.churches.clergyCount" label={{ en: "Clergy Count", si: "පූජක සංඛ්‍යාව" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("religiousSiteCounts.churches.clergyCount")} />
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
          emptyRowFactory={() => ({ name: "", type: "", significance: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="artAcademies"
          title={religiousCulturalDict.fields.artAcademies}
          columns={artAcademyColumns}
          emptyRowFactory={() => ({ name: "", studentCount: 0 })}
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
