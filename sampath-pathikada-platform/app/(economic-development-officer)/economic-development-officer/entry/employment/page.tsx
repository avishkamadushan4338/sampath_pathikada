"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { SectionForm } from "@/components/forms/SectionForm";
import { FieldWrapper } from "@/components/forms/FormField";
import { RepeatableTable, type RepeatableColumn } from "@/components/forms/RepeatableTable";
import { Input } from "@/components/ui/input";
import { useSubmission, useSaveSection } from "@/hooks/use-submission";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { employmentDict } from "@/lib/i18n/sections/employment";
import {
  employmentSchemaPartial,
  SELF_EMPLOYMENT_SECTORS,
  MARKETPLACES,
  JOB_SEEKER_EDUCATION_LEVELS,
} from "@/lib/validators/sections/employment";
import { cn } from "@/lib/utils";

const CURRENT_YEAR = 2026;

type EmploymentDraft = z.infer<typeof employmentSchemaPartial>;

const JOB_SEEKER_EDUCATION_LABELS: Record<(typeof JOB_SEEKER_EDUCATION_LEVELS)[number], { en: string; si: string }> = {
  "vocational-training": { en: "Received Vocational Training", si: "වෘත්තිය පුහුණුව ලද" },
  "below-ol": { en: "Qualifications Below G.C.E. O/L", si: "අ.පො.ස. සා/පෙළට පහළ සුදුසුකම් සහිත" },
  "ol-pass": { en: "G.C.E. O/L Pass", si: "අ.පො.ස. සා/පෙළ සමත්" },
  "al-pass": { en: "G.C.E. A/L Pass", si: "උසස්පෙළ සමත්" },
  "degree-and-above": { en: "Degree or Higher Qualifications", si: "උපාධිය හා ඊට ඉහළ සුදුසුකම් සහිත" },
};

const SELF_EMPLOYMENT_SECTOR_LABELS: Record<(typeof SELF_EMPLOYMENT_SECTORS)[number], { en: string; si: string }> = {
  "food-production": { en: "Food Production", si: "ආහාර නිෂ්පාදනය" },
  "confectionery-production": { en: "Confectionery Production", si: "රසකැවිලි නිෂ්පාදනය" },
  "spice-production": { en: "Spice Production", si: "කුළුබඩු නිෂ්පාදනය" },
  "rice-parcel-production": { en: "Rice-Parcel Production", si: "බත් පාර්සල් නිෂ්පාදනය" },
  "bakery-production": { en: "Bakery Production", si: "බේකරි නිෂ්පාදන" },
  "garment-production": { en: "Garment Production", si: "ඇඟලුම් නිෂ්පාදන" },
  dressmaking: { en: "Dressmaking / Sewing", si: "ඇදුම් මැසීම" },
  "doormat-production": { en: "Doormat Production", si: "පාපිසි නිෂ්පාදනය" },
  "beeralu-lace-production": { en: "Beeralu / Lace Production", si: "බීරළු/රේන්ද නිෂ්පාදනය" },
  "ornamental-items-production": { en: "Ornamental Items Production", si: "විසිතුරු භාණ්ඩ නිෂ්පාදනය" },
  "coconut-shell-production": { en: "Coconut-Shell Related Production", si: "පොල්කටු ආශ්‍රිත නිෂ්පාදන" },
  "welding-work": { en: "Welding Work", si: "පැස්සුම් වැඩ" },
  "motor-vehicle-repair": { en: "Motor Vehicle Repair", si: "මෝටර් රථ අළුත්වැඩියාව" },
  "bicycle-repair": { en: "Bicycle Repair", si: "පාපැදි අළුත්වැඩියාව" },
  "masonry-work": { en: "Masonry Industry", si: "පෙදරේරු කර්මාන්තය" },
  carpentry: { en: "Carpentry Industry", si: "වඩු කර්මාන්තය" },
  "electrical-appliance-repair": { en: "Electrical Equipment Repair", si: "විදුලිඋපකරණ අළුත්වැඩියාව" },
  "jewelry-production": { en: "Jewelry Production", si: "ස්වර්ණාභරණ නිෂ්පාදනය" },
  "concrete-block-production": { en: "Concrete Block Production", si: "බ්ලොක්ගල් නිෂ්පාදනය" },
  "cinnamon-peeling": { en: "Cinnamon Peeling", si: "කුරුඳු තැලීම" },
  "fish-related-production": { en: "Fish-Related Production (Dried Fish / Jaadi / ...)", si: "මාළු ආශ්‍රිත නිෂ්පාදන (කරවල/ජාඩි/...)" },
  "fishing-gear-repair": { en: "Fishing Gear Repair", si: "ධීවර ආම්පන්න අළුත්වැඩියාව" },
  "fish-trade": { en: "Fish Trade (Mobile Vehicle)", si: "මාළු වෙළදාම (ජංගම රථ මගින්)" },
};

const MARKETPLACE_LABELS: Record<(typeof MARKETPLACES)[number], { en: string; si: string }> = {
  local: { en: "Local", si: "දේශීය" },
  international: { en: "International", si: "ජාත්‍යන්තර" },
};

function sumCounts(rows: { count?: unknown }[] | undefined): number {
  if (!Array.isArray(rows)) return 0;
  let total = 0;
  for (const row of rows) total += Number(row?.count) || 0;
  return total;
}

// Counts start blank (not 0) so the officer must explicitly type a value — even "0" — for each
// one; a pre-filled 0 would never trigger the "required" validation, since 0 is already a
// legitimate answer. `as never` mirrors the same cast used in demographics/page.tsx — the
// runtime shape is a string here, not the post-parse `number` the Zod-inferred type declares.
function buildEmptyValues(lang: "en" | "si"): EmploymentDraft {
  return {
    jobSeekersByEducation: JOB_SEEKER_EDUCATION_LEVELS.map((level) => ({
      level,
      levelLabel: JOB_SEEKER_EDUCATION_LABELS[level][lang],
      count: "",
    })),
    vocationalTrainingOpportunityGapCount: "",
    selfEmploymentSectors: SELF_EMPLOYMENT_SECTORS.map((sector) => ({
      sector,
      sectorLabel: SELF_EMPLOYMENT_SECTOR_LABELS[sector][lang],
      count: "",
    })),
    selfEmployedPersons: [],
  } as never as EmploymentDraft;
}

function mergeWithSaved(empty: EmploymentDraft, saved: EmploymentDraft): EmploymentDraft {
  return {
    ...empty,
    ...saved,
    jobSeekersByEducation: empty.jobSeekersByEducation?.map((row, i) => ({ ...row, ...saved.jobSeekersByEducation?.[i] })),
    selfEmploymentSectors: empty.selfEmploymentSectors?.map((row, i) => ({ ...row, ...saved.selfEmploymentSectors?.[i] })),
  };
}

const selfEmployedPersonColumns: RepeatableColumn[] = [
  { key: "sector", label: { en: "Self-Employment Field", si: "ස්වයං රැකියා ක්ෂේත්‍රය" }, type: "text", required: true },
  { key: "name", label: { en: "Person's Name", si: "පුද්ගල නම" }, type: "text", required: true },
  { key: "phone", label: { en: "Telephone Number", si: "දුරකථන අංකය" }, type: "text", required: true },
  {
    key: "marketplace",
    label: { en: "Market", si: "වෙළදපොළ" },
    type: "select",
    required: true,
    options: MARKETPLACES.map((m) => ({ value: m, label: MARKETPLACE_LABELS[m] })),
  },
];

export default function EmploymentPage() {
  const { lang } = useLanguage();
  const { submission, isLoading } = useSubmission(CURRENT_YEAR);
  const { saveSection, status, errorMessage } = useSaveSection(CURRENT_YEAR);

  const emptyValues = useMemo(() => buildEmptyValues(lang), [lang]);

  const form = useForm<EmploymentDraft>({
    resolver: zodResolver(employmentSchemaPartial),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (submission?.data.employment) {
      form.reset(mergeWithSaved(emptyValues, submission.data.employment));
    } else {
      form.reset(emptyValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission, emptyValues]);

  async function handleSave(values: EmploymentDraft) {
    await saveSection("employment", values);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  const jobSeekerColumns: RepeatableColumn[] = [
    { key: "levelLabel", label: { en: "Education Level", si: "අධ්‍යාපන මට්ටම" }, type: "readonly" },
    { key: "count", label: { en: "Number of Persons", si: "පුද්ගල ගණන" }, type: "number", required: true },
  ];

  const selfEmploymentSectorColumns: RepeatableColumn[] = [
    { key: "sectorLabel", label: { en: "Field", si: "ක්ෂේත්‍රය" }, type: "readonly" },
    { key: "count", label: { en: "Number of Persons", si: "පුද්ගලයින් ගණන" }, type: "number", required: true },
  ];

  const totalJobSeekers = sumCounts(form.watch("jobSeekersByEducation"));

  return (
    <SectionForm
      sectionNumber={6}
      title={employmentDict.title}
      description={employmentDict.description}
      form={form}
      saveStatus={status}
      saveErrorMessage={errorMessage}
      onSaveDraft={handleSave}
    >
      <div>
        <RepeatableTable
          name="jobSeekersByEducation"
          title={employmentDict.fields.jobSeekersByEducation}
          columns={jobSeekerColumns}
          fixedRows
          emptyRowFactory={() => ({
            level: JOB_SEEKER_EDUCATION_LEVELS[0],
            levelLabel: JOB_SEEKER_EDUCATION_LABELS[JOB_SEEKER_EDUCATION_LEVELS[0]][lang],
            count: 0,
          })}
        />
        <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
          <span lang={lang} className={cn("text-fluid-sm font-medium text-foreground", lang === "si" && "font-si")}>
            {lang === "si" ? "රැකියා අපේක්ෂිත මුළු පුද්ගලයන් ගණන" : "Total Number of Job-Seeking Persons"}
          </span>
          <span className="text-fluid-lg font-semibold nums-tabular text-foreground">{totalJobSeekers}</span>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 border-t border-border pt-6">
        <FieldWrapper
          name="vocationalTrainingOpportunityGapCount"
          label={employmentDict.fields.vocationalTrainingOpportunityGapCount}
          required
        >
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="number"
              inputMode="numeric"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              {...form.register("vocationalTrainingOpportunityGapCount")}
            />
          )}
        </FieldWrapper>
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="selfEmploymentSectors"
          title={employmentDict.fields.selfEmploymentSectors}
          columns={selfEmploymentSectorColumns}
          fixedRows
          emptyRowFactory={() => ({
            sector: SELF_EMPLOYMENT_SECTORS[0],
            sectorLabel: SELF_EMPLOYMENT_SECTOR_LABELS[SELF_EMPLOYMENT_SECTORS[0]][lang],
            count: 0,
          })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="selfEmployedPersons"
          title={employmentDict.fields.selfEmployedPersons}
          columns={selfEmployedPersonColumns}
          emptyRowFactory={() => ({ sector: "", name: "", phone: "", marketplace: "local" })}
        />
      </div>
    </SectionForm>
  );
}
