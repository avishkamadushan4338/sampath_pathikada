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

const CURRENT_YEAR = 2026;

type EmploymentDraft = z.infer<typeof employmentSchemaPartial>;

const JOB_SEEKER_EDUCATION_LABELS: Record<(typeof JOB_SEEKER_EDUCATION_LEVELS)[number], { en: string; si: string }> = {
  "vocational-training": { en: "Vocational Training", si: "වෘත්තීය පුහුණුව ලත්" },
  "below-ol": { en: "Below O/L", si: "සාමාන්‍ය පෙළට අඩු" },
  "ol-pass": { en: "O/L Pass", si: "සාමාන්‍ය පෙළ සමත්" },
  "al-pass": { en: "A/L Pass", si: "උසස් පෙළ සමත්" },
  "degree-and-above": { en: "Degree and Above", si: "උපාධි සහ ඊට වැඩි" },
};

const SELF_EMPLOYMENT_SECTOR_LABELS: Record<(typeof SELF_EMPLOYMENT_SECTORS)[number], { en: string; si: string }> = {
  "food-production": { en: "Food Production", si: "ආහාර නිෂ්පාදනය" },
  "confectionery-production": { en: "Confectionery Production", si: "රසකැවිලි නිෂ්පාදනය" },
  "spice-production": { en: "Spice Production", si: "කුළුබඩු නිෂ්පාදනය" },
  "rice-parcel-production": { en: "Rice-Parcel Production", si: "බත් පාර්සල් නිෂ්පාදනය" },
  "bakery-production": { en: "Bakery Production", si: "බේකරි නිෂ්පාදන" },
  "garment-knitwear-production": { en: "Garment / Knitwear Production", si: "ඇහළුම් නිෂ්පාදන" },
  dressmaking: { en: "Dressmaking / Sewing", si: "ඇදුම් මැසීම" },
  "cleaning-products-production": { en: "Cleaning Products Production", si: "පාහිසි නිෂ්පාදනය" },
  "beverage-soda-production": { en: "Beverage / Soda Production", si: "බීරලු/සෝඩා නිෂ්පාදනය" },
  "decorative-items-production": { en: "Decorative Items Production", si: "විසිතුරු භාණ්ඩ නිෂ්පාදනය" },
  "coconut-shell-production": { en: "Coconut-Shell Related Production", si: "පොල්කටු ආශ්‍රිත නිෂ්පාදන" },
  "masonry-work": { en: "Masonry Work", si: "පැස්සුම් වැඩ" },
  "motor-vehicle-repair": { en: "Motor Vehicle Repair", si: "මෝටර් රථ කාර්මික වැඩියාව" },
  "bicycle-repair": { en: "Bicycle Repair", si: "පාපැදි කාර්මික වැඩියාව" },
  "traditional-craft-work": { en: "Traditional Craft Work", si: "පෙදරේරු කර්මාන්තය" },
  carpentry: { en: "Carpentry", si: "වඩු කර්මාන්තය" },
  "electrical-appliance-repair": { en: "Electrical Appliance Repair", si: "විදුලිඋපකරණ කාර්මික වැඩියාව" },
  "jewelry-production": { en: "Jewelry / Ornaments Production", si: "ස්වර්ණාභරණ නිෂ්පාදනය" },
  "floriculture-production": { en: "Floriculture Production", si: "ෆ්ලෝරිකල්චර් නිෂ්පාදනය" },
  "cinnamon-peeling": { en: "Cinnamon Peeling", si: "කුරුදු තැලීම" },
  "fish-related-production": { en: "Fish-Related Production (Dried Fish / Jars)", si: "මාළු ආශ්‍රිත නිෂ්පාදන (කරවල/ජාඩි)" },
  "fishing-gear-repair": { en: "Fishing Gear / Net Repair", si: "දිවර ආම්පන්න අළුත්වැඩියාව" },
  "fish-trade": { en: "Fish Trade (Mobile Vehicle)", si: "මාළු වෙළදාම (ජංගම රථ මගින්)" },
};

const MARKETPLACE_LABELS: Record<(typeof MARKETPLACES)[number], { en: string; si: string }> = {
  local: { en: "Local", si: "දේශීය" },
  national: { en: "National", si: "ජාතික" },
  international: { en: "International", si: "ජාත්‍යන්තර" },
};

function buildEmptyValues(lang: "en" | "si"): EmploymentDraft {
  return {
    jobSeekersByEducation: JOB_SEEKER_EDUCATION_LEVELS.map((level) => ({
      level,
      levelLabel: JOB_SEEKER_EDUCATION_LABELS[level][lang],
      count: 0,
    })),
    vocationalTrainingOpportunityGapCount: 0,
    selfEmploymentSectors: SELF_EMPLOYMENT_SECTORS.map((sector) => ({
      sector,
      sectorLabel: SELF_EMPLOYMENT_SECTOR_LABELS[sector][lang],
      count: 0,
    })),
    selfEmployedPersons: [],
  };
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
  { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
  { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
  { key: "phone", label: { en: "Phone", si: "දුරකථන අංකය" }, type: "text" },
  { key: "sector", label: { en: "Sector / Field", si: "ක්ෂේත්‍රය" }, type: "text" },
  {
    key: "marketplace",
    label: { en: "Marketplace", si: "වෙළඳපොල" },
    type: "select",
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
    { key: "count", label: { en: "Count", si: "සංඛ්‍යාව" }, type: "number" },
  ];

  const selfEmploymentSectorColumns: RepeatableColumn[] = [
    { key: "sectorLabel", label: { en: "Sector", si: "ක්ෂේත්‍රය" }, type: "readonly" },
    { key: "count", label: { en: "Count", si: "සංඛ්‍යාව" }, type: "number" },
  ];

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
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 border-t border-border pt-6">
        <FieldWrapper
          name="vocationalTrainingOpportunityGapCount"
          label={employmentDict.fields.vocationalTrainingOpportunityGapCount}
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
          emptyRowFactory={() => ({ name: "", address: "", phone: "", sector: "", marketplace: "local" })}
        />
      </div>
    </SectionForm>
  );
}
