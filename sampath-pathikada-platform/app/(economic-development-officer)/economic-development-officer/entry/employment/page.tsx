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
import { employmentSchemaPartial, SELF_EMPLOYMENT_SECTORS } from "@/lib/validators/sections/employment";

const CURRENT_YEAR = 2026;

type EmploymentDraft = z.infer<typeof employmentSchemaPartial>;

const JOB_SEEKER_EDUCATION_LABELS: { en: string; si: string }[] = [
  { en: "Vocational Training", si: "වෘත්තීය පුහුණුව ලත්" },
  { en: "Below O/L", si: "සාමාන්‍ය පෙළට අඩු" },
  { en: "O/L Pass", si: "සාමාන්‍ය පෙළ සමත්" },
  { en: "A/L Pass", si: "උසස් පෙළ සමත්" },
  { en: "Degree and Above", si: "උපාධි සහ ඊට වැඩි" },
];

const SELF_EMPLOYMENT_SECTOR_LABELS: Record<(typeof SELF_EMPLOYMENT_SECTORS)[number], { en: string; si: string }> = {
  "food-production": { en: "Food Production", si: "ආහාර නිෂ්පාදනය" },
  confectionery: { en: "Confectionery", si: "රසකැවිලි නිෂ්පාදනය" },
  "furniture-production": { en: "Furniture Production", si: "ගෘහ භාණ්ඩ නිෂ්පාදනය" },
  "textile-production": { en: "Textile Production", si: "රෙදිපිළි නිෂ්පාදනය" },
  "bakery-production": { en: "Bakery Production", si: "බේකරි නිෂ්පාදනය" },
  knitting: { en: "Knitting", si: "රෙදි වියන කර්මාන්තය" },
  "garment-sewing": { en: "Garment Sewing", si: "ඇඟලුම් මැසීම" },
  "cleaning-products": { en: "Cleaning Products", si: "සුද්ධිකාරක නිෂ්පාදන" },
  "beverage-juice": { en: "Beverages / Juice Production", si: "පාන වර්ග/යුෂ නිෂ්පාදනය" },
  "decorative-items": { en: "Decorative Items", si: "අලංකාර ද්‍රව්‍ය නිෂ්පාදනය" },
  "coconut-shell-crafts": { en: "Coconut Shell Crafts", si: "පොල් කටු අත්කම්" },
  "masonry-work": { en: "Masonry Work", si: "ගෙතුම් කර්මාන්තය" },
  "auto-mechanic": { en: "Auto Mechanic", si: "මෝටර් රථ අලුත්වැඩියා" },
  "footwear-repair": { en: "Footwear Repair", si: "පාවහන් අලුත්වැඩියා" },
  "welding-shop": { en: "Welding Shop", si: "වෙල්ඩින් කර්මාන්තය" },
  carpentry: { en: "Carpentry", si: "වඩු කර්මාන්තය" },
  "electrical-appliance-repair": { en: "Electrical Appliance Repair", si: "විදුලි උපකරණ අලුත්වැඩියා" },
  "cosmetics-production": { en: "Cosmetics Production", si: "සුරූපිතා (කොස්මෙටික්) නිෂ්පාදනය" },
  floriculture: { en: "Floriculture", si: "මල් වගාව" },
  "brick-making": { en: "Brick Making", si: "ගඩොල් නිෂ්පාදනය" },
  "seafood-processing": { en: "Seafood Processing", si: "මුහුදු ආහාර සැකසීම" },
  "traditional-boat-building": { en: "Traditional Boat Building", si: "සම්ප්‍රදායික බෝට්ටු නිෂ්පාදනය" },
  "fish-transport-other": { en: "Fish Transport / Other", si: "මාළු ප්‍රවාහනය/වෙනත්" },
};

function buildEmptyValues(lang: "en" | "si"): EmploymentDraft {
  return {
    jobSeekersByEducation: JOB_SEEKER_EDUCATION_LABELS.map((labelObj) => ({
      label: labelObj[lang],
      count: 0,
    })),
    jobSeekersUnwillingBelowQualificationCount: 0,
    selfEmploymentSectors: SELF_EMPLOYMENT_SECTORS.map((sector) => ({
      label: SELF_EMPLOYMENT_SECTOR_LABELS[sector][lang],
      count: 0,
    })),
    selfEmployedPersons: [],
  };
}

const selfEmployedPersonColumns: RepeatableColumn[] = [
  { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
  { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
  { key: "phone", label: { en: "Phone", si: "දුරකථන අංකය" }, type: "text" },
  { key: "sector", label: { en: "Sector / Field", si: "ක්ෂේත්‍රය" }, type: "text" },
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
      form.reset({ ...emptyValues, ...submission.data.employment });
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
    { key: "label", label: { en: "Education Level", si: "අධ්‍යාපන මට්ටම" }, type: "readonly" },
    { key: "count", label: { en: "Count", si: "සංඛ්‍යාව" }, type: "number" },
  ];

  const selfEmploymentSectorColumns: RepeatableColumn[] = [
    { key: "label", label: { en: "Sector", si: "ක්ෂේත්‍රය" }, type: "readonly" },
    { key: "count", label: { en: "Count", si: "සංඛ්‍යාව" }, type: "number" },
  ];

  return (
    <SectionForm
      sectionNumber={5}
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
          emptyRowFactory={() => ({ label: JOB_SEEKER_EDUCATION_LABELS[0][lang], count: 0 })}
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 border-t border-border pt-6">
        <FieldWrapper
          name="jobSeekersUnwillingBelowQualificationCount"
          label={employmentDict.fields.jobSeekersUnwillingBelowQualificationCount}
        >
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="number"
              inputMode="numeric"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              {...form.register("jobSeekersUnwillingBelowQualificationCount")}
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
          emptyRowFactory={() => ({ label: SELF_EMPLOYMENT_SECTOR_LABELS[SELF_EMPLOYMENT_SECTORS[0]][lang], count: 0 })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="selfEmployedPersons"
          title={employmentDict.fields.selfEmployedPersons}
          columns={selfEmployedPersonColumns}
          emptyRowFactory={() => ({ name: "", address: "", phone: "", sector: "" })}
        />
      </div>
    </SectionForm>
  );
}
