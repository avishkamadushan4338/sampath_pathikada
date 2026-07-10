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
import { demographicsDict } from "@/lib/i18n/sections/demographics";
import {
  demographicsSchemaPartial,
  AGE_BANDS,
  ETHNICITIES,
  RELIGIONS,
  DISABILITY_TYPES,
} from "@/lib/validators/sections/demographics";
import { cn } from "@/lib/utils";

const CURRENT_YEAR = 2026;

type DemographicsDraft = z.infer<typeof demographicsSchemaPartial>;

const AGE_BAND_LABELS: Record<(typeof AGE_BANDS)[number], { en: string; si: string }> = {
  "0-4": { en: "0 - 4 years", si: "අවුරුදු 0 - 4" },
  "5-14": { en: "5 - 14 years", si: "අවුරුදු 5 - 14" },
  "15-59": { en: "15 - 59 years", si: "අවුරුදු 15 - 59" },
  "60-80": { en: "60 - 80 years", si: "අවුරුදු 60 - 80" },
  "80+": { en: "80+ years", si: "අවුරුදු 80ට වැඩි" },
};

const ETHNICITY_LABELS: Record<(typeof ETHNICITIES)[number], { en: string; si: string }> = {
  sinhala: { en: "Sinhala", si: "සිංහල" },
  tamil: { en: "Tamil", si: "දෙමළ" },
  muslim: { en: "Muslim", si: "මුස්ලිම්" },
  malay: { en: "Malay", si: "මලේ" },
  burgher: { en: "Burgher", si: "බර්ගර්" },
  other: { en: "Other", si: "වෙනත්" },
};

const RELIGION_LABELS: Record<(typeof RELIGIONS)[number], { en: string; si: string }> = {
  buddhist: { en: "Buddhist", si: "බෞද්ධ" },
  hindu: { en: "Hindu", si: "හින්දු" },
  islam: { en: "Islam", si: "ඉස්ලාම්" },
  catholic: { en: "Catholic / Christian", si: "කතෝලික/ක්‍රිස්තියානි" },
  other: { en: "Other", si: "වෙනත්" },
};

const DISABILITY_LABELS: Record<(typeof DISABILITY_TYPES)[number], { en: string; si: string }> = {
  mentalIllness: { en: "Mental Illness", si: "මානසික රෝග" },
  intellectualDisability: { en: "Intellectual Disability", si: "බුද්ධි ආබාධ" },
  speechImpairment: { en: "Speech Impairment", si: "කථන ආබාධ" },
  hearingImpairment: { en: "Hearing Impairment", si: "ශ්‍රවණ ආබාධ" },
  visualImpairment: { en: "Visual Impairment", si: "දෘෂ්ටි ආබාධ" },
  physicalMobility: { en: "Physical / Mobility Disability", si: "ශාරීරික/චලන ආබාධ" },
  multipleDisability: { en: "Multiple Disability", si: "බහුවිධ ආබාධ" },
};

function buildEmptyValues(lang: "en" | "si"): DemographicsDraft {
  return {
    populationByAge: AGE_BANDS.map((band) => ({
      band,
      bandLabel: AGE_BAND_LABELS[band][lang],
      female: 0,
      male: 0,
    })),
    populationByEthnicity: ETHNICITIES.map((ethnicity) => ({
      ethnicity,
      ethnicityLabel: ETHNICITY_LABELS[ethnicity][lang],
      female: 0,
      male: 0,
    })),
    populationByReligion: RELIGIONS.map((religion) => ({
      religion,
      religionLabel: RELIGION_LABELS[religion][lang],
      female: 0,
      male: 0,
    })),
    foreignNationals: { female: 0, male: 0 },
    households: { total: 0, femaleHeaded: 0, displaced: 0 },
    disabilities: DISABILITY_TYPES.map((type) => ({
      type,
      typeLabel: DISABILITY_LABELS[type][lang],
      under18: { female: 0, male: 0 },
      over18: { female: 0, male: 0 },
    })),
    registeredVoters: { female: 0, male: 0 },
  };
}

/**
 * Merges persisted section data onto the label-seeded defaults. Persisted rows
 * never carry the display-only `*Label` fields (they aren't part of the Zod
 * schema), so a naive spread would blank out the readonly cells — merge
 * row-by-row instead, keeping the seeded label and overlaying saved counts.
 */
function mergeWithSaved(empty: DemographicsDraft, saved: DemographicsDraft): DemographicsDraft {
  return {
    ...empty,
    ...saved,
    populationByAge: empty.populationByAge?.map((row, i) => ({ ...row, ...saved.populationByAge?.[i] })),
    populationByEthnicity: empty.populationByEthnicity?.map((row, i) => ({ ...row, ...saved.populationByEthnicity?.[i] })),
    populationByReligion: empty.populationByReligion?.map((row, i) => ({ ...row, ...saved.populationByReligion?.[i] })),
    disabilities: empty.disabilities?.map((row, i) => ({
      ...row,
      ...saved.disabilities?.[i],
      under18: { ...row.under18, ...saved.disabilities?.[i]?.under18 },
      over18: { ...row.over18, ...saved.disabilities?.[i]?.over18 },
    })),
  };
}

export default function DemographicsPage() {
  const { lang } = useLanguage();
  const { submission, isLoading } = useSubmission(CURRENT_YEAR);
  const { saveSection, status, errorMessage } = useSaveSection(CURRENT_YEAR);

  const emptyValues = useMemo(() => buildEmptyValues(lang), [lang]);

  const form = useForm<DemographicsDraft>({
    resolver: zodResolver(demographicsSchemaPartial),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (submission?.data.demographics) {
      form.reset(mergeWithSaved(emptyValues, submission.data.demographics));
    } else {
      form.reset(emptyValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission, emptyValues]);

  async function handleSave(values: DemographicsDraft) {
    await saveSection("demographics", values);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  const ageColumns: RepeatableColumn[] = [
    { key: "bandLabel", label: { en: "Age Band", si: "වයස් කාණ්ඩය" }, type: "readonly" },
    { key: "female", label: { en: "Female", si: "ගැහැණු" }, type: "number" },
    { key: "male", label: { en: "Male", si: "පිරිමි" }, type: "number" },
  ];

  const ethnicityColumns: RepeatableColumn[] = [
    { key: "ethnicityLabel", label: { en: "Ethnicity", si: "ජාතිකත්වය" }, type: "readonly" },
    { key: "female", label: { en: "Female", si: "ගැහැණු" }, type: "number" },
    { key: "male", label: { en: "Male", si: "පිරිමි" }, type: "number" },
  ];

  const religionColumns: RepeatableColumn[] = [
    { key: "religionLabel", label: { en: "Religion", si: "ආගම" }, type: "readonly" },
    { key: "female", label: { en: "Female", si: "ගැහැණු" }, type: "number" },
    { key: "male", label: { en: "Male", si: "පිරිමි" }, type: "number" },
  ];

  const disabilityColumns: RepeatableColumn[] = [
    { key: "typeLabel", label: { en: "Disability Type", si: "ආබාධ වර්ගය" }, type: "readonly" },
    { key: "under18.female", label: { en: "Under 18 - Female", si: "අවු. 18ට අඩු - ගැහැණු" }, type: "number" },
    { key: "under18.male", label: { en: "Under 18 - Male", si: "අවු. 18ට අඩු - පිරිමි" }, type: "number" },
    { key: "over18.female", label: { en: "18 & Over - Female", si: "අවු. 18ට වැඩි - ගැහැණු" }, type: "number" },
    { key: "over18.male", label: { en: "18 & Over - Male", si: "අවු. 18ට වැඩි - පිරිමි" }, type: "number" },
  ];

  return (
    <SectionForm
      sectionNumber={4}
      title={demographicsDict.title}
      description={demographicsDict.description}
      form={form}
      saveStatus={status}
      saveErrorMessage={errorMessage}
      onSaveDraft={handleSave}
    >
      <div>
        <RepeatableTable
          name="populationByAge"
          title={demographicsDict.fields.populationByAge}
          columns={ageColumns}
          fixedRows
          emptyRowFactory={() => ({ band: "0-4", bandLabel: AGE_BAND_LABELS["0-4"][lang], female: 0, male: 0 })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="populationByEthnicity"
          title={demographicsDict.fields.populationByEthnicity}
          columns={ethnicityColumns}
          fixedRows
          emptyRowFactory={() => ({
            ethnicity: "sinhala",
            ethnicityLabel: ETHNICITY_LABELS.sinhala[lang],
            female: 0,
            male: 0,
          })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="populationByReligion"
          title={demographicsDict.fields.populationByReligion}
          columns={religionColumns}
          fixedRows
          emptyRowFactory={() => ({
            religion: "buddhist",
            religionLabel: RELIGION_LABELS.buddhist[lang],
            female: 0,
            male: 0,
          })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="disabilities"
          title={demographicsDict.fields.disabilities}
          columns={disabilityColumns}
          fixedRows
          emptyRowFactory={() => ({
            type: "mentalIllness",
            typeLabel: DISABILITY_LABELS.mentalIllness[lang],
            under18: { female: 0, male: 0 },
            over18: { female: 0, male: 0 },
          })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <h2 lang={lang} className={cn("mb-3 text-fluid-lg font-semibold text-foreground", lang === "si" && "font-si-heading")}>
          {lang === "si" ? demographicsDict.fields.foreignNationals.si : demographicsDict.fields.foreignNationals.en}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="foreignNationals.female" label={{ en: "Female", si: "ගැහැණු" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("foreignNationals.female")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="foreignNationals.male" label={{ en: "Male", si: "පිරිමි" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("foreignNationals.male")} />
            )}
          </FieldWrapper>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h2 lang={lang} className={cn("mb-3 text-fluid-lg font-semibold text-foreground", lang === "si" && "font-si-heading")}>
          {lang === "si" ? demographicsDict.fields.households.si : demographicsDict.fields.households.en}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="households.total" label={{ en: "Total Households", si: "මුළු ගෘහ ඒකක" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("households.total")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="households.femaleHeaded" label={{ en: "Female-Headed Households", si: "කාන්තා ප්‍රධාන ගෘහ ඒකක" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("households.femaleHeaded")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="households.displaced" label={{ en: "Displaced Households", si: "අවතැන් වූ ගෘහ ඒකක" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("households.displaced")} />
            )}
          </FieldWrapper>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h2 lang={lang} className={cn("mb-3 text-fluid-lg font-semibold text-foreground", lang === "si" && "font-si-heading")}>
          {lang === "si" ? demographicsDict.fields.registeredVoters.si : demographicsDict.fields.registeredVoters.en}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="registeredVoters.female" label={{ en: "Female", si: "ගැහැණු" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("registeredVoters.female")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="registeredVoters.male" label={{ en: "Male", si: "පිරිමි" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("registeredVoters.male")} />
            )}
          </FieldWrapper>
        </div>
      </div>
    </SectionForm>
  );
}
