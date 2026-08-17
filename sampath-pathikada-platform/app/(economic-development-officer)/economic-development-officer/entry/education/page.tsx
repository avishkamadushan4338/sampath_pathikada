"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray, useFormContext, type FieldArrayWithId } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { SectionForm } from "@/components/forms/SectionForm";
import { FieldWrapper, getErrorAtPath } from "@/components/forms/FormField";
import { RepeatableTable, type RepeatableColumn } from "@/components/forms/RepeatableTable";
import { CollapsibleFieldGroup, hasAnyNonZero, entryCountLabel } from "@/components/forms/CollapsibleFieldGroup";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Bilingual } from "@/components/Bilingual";
import { dictionary } from "@/lib/i18n/dictionary";
import { useSubmission, useSaveSection } from "@/hooks/use-submission";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { educationDict } from "@/lib/i18n/sections/education";
import {
  educationSchemaPartial,
  TERTIARY_TYPES,
  PRESCHOOL_FACILITY_TYPES,
  DHAMMA_TYPES,
} from "@/lib/validators/sections/education";
import { cn } from "@/lib/utils";
import type { z } from "zod";

const CURRENT_YEAR = 2026;

type EducationDraft = z.infer<typeof educationSchemaPartial>;

function buildEmptyValues(lang: "en" | "si"): EducationDraft {
  return {
    ...EMPTY_VALUES,
    tertiaryInstitutions: TERTIARY_TYPES.map((type) => ({
      type,
      typeLabel: TERTIARY_TYPE_LABELS[type][lang],
      exists: "no",
      name: "",
    })),
  };
}

const EMPTY_VALUES: EducationDraft = {
  institutionCounts: {
    govtSchools: 0,
    privateOrInternationalSchools: 0,
    pirivenas: 0,
    vocationalTrainingInstitutes: 0,
    registeredPreschoolsGovt: 0,
    registeredPreschoolsPrivate: 0,
    dhammaEducationInstitutions: 0,
    higherEducationInstitutions: 0,
    tuitionCenterInstitutions: 0,
  },
  schoolCountsByType: {
    nationalSchools: 0,
    type1AB: 0,
    type1C: 0,
    type2: 0,
    type3: 0,
  },
  schoolFacilities: [],
  specialAttentionSchools: [],
  closedSchools: [],
  privateInternationalSchools: [],
  pirivenas: [],
  vocationalInstitutes: [],
  preschools: [],
  dhammaEducationInstitutions: [],
  tertiaryInstitutions: [],
  tuitionCenters: [],
  outOfSchoolChildren: { female: 0, male: 0 },
  childrenInProbationOrDetention: { female: 0, male: 0 },
};

const YES_NO_OPTIONS = [
  { value: "yes", label: { en: "Yes", si: "ඔව්" } },
  { value: "no", label: { en: "No", si: "නැත" } },
];

const TERTIARY_TYPE_LABELS: Record<(typeof TERTIARY_TYPES)[number], { en: string; si: string }> = {
  "university-college": { en: "College of Education", si: "විද්‍යාපීඨ" },
  university: { en: "University", si: "විශ්ව විද්‍යාල" },
  "tech-institute": { en: "Higher Technical Institute", si: "උසස් තාක්ෂණ ආයතන" },
  "private-university": { en: "Private University", si: "පෞද්ගලික විශ්ව විද්‍යාල" },
};

const PRESCHOOL_FACILITY_TYPE_LABELS: Record<(typeof PRESCHOOL_FACILITY_TYPES)[number], { en: string; si: string }> = {
  govt: { en: "Government", si: "රාජ්‍ය" },
  private: { en: "Private", si: "පෞද්ගලික" },
};

const DHAMMA_TYPE_LABELS: Record<(typeof DHAMMA_TYPES)[number], { en: string; si: string }> = {
  buddhist: { en: "Buddhist", si: "බෞද්ධ" },
  islam: { en: "Islam", si: "ඉස්ලාම්" },
  hindu: { en: "Hindu", si: "හින්දු" },
  christian: { en: "Christian", si: "ක්‍රිස්තියානි" },
};

/** Order matches the on-screen accordion — also doubles as the field-name list for the
 *  quick-jump strip and for mapping `form.formState.errors` keys back to which section owns
 *  them (each id is exactly the top-level EducationData field name it renders). */
const SECTION_IDS = [
  "institutionCounts",
  "schoolCountsByType",
  "schoolFacilities",
  "specialAttentionSchools",
  "closedSchools",
  "privateInternationalSchools",
  "pirivenas",
  "vocationalInstitutes",
  "preschools",
  "dhammaEducationInstitutions",
  "tertiaryInstitutions",
  "tuitionCenters",
  "outOfSchoolChildren",
  "childrenInProbationOrDetention",
] as const;

function listMeta(rows: unknown[] | undefined) {
  const count = rows?.length ?? 0;
  return { status: (count > 0 ? "filled" : "empty") as "filled" | "empty", countLabel: entryCountLabel(count) };
}

export default function EducationPage() {
  const { lang } = useLanguage();
  const { submission, isLoading } = useSubmission(CURRENT_YEAR);
  const { saveSection, status, errorMessage } = useSaveSection(CURRENT_YEAR);
  const [openItems, setOpenItems] = useState<string[]>(() => [...SECTION_IDS]);

  const emptyValues = useMemo(() => buildEmptyValues(lang), [lang]);

  const form = useForm<EducationDraft>({
    resolver: zodResolver(educationSchemaPartial),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (submission?.data.education) {
      const saved = submission.data.education;
      // `tertiaryInstitutions` is a fixed 4-category checklist, but a GN division can have more
      // than one institution of the same type (e.g. two university branches), added as extra
      // rows sharing that `type` — so a saved draft's array may be longer than the freshly-seeded
      // template and can't be zipped by index. Trust the saved array's own rows wholesale
      // (falling back to the template only when nothing's been saved yet), just refreshing
      // `typeLabel` for the active language since that's display-only, not persisted.
      const tertiaryInstitutions = (
        saved.tertiaryInstitutions?.length ? saved.tertiaryInstitutions : emptyValues.tertiaryInstitutions
      )?.map((row) => ({
        ...row,
        typeLabel: TERTIARY_TYPE_LABELS[row.type as (typeof TERTIARY_TYPES)[number]]?.[lang] ?? (row as Record<string, unknown>).typeLabel,
      }));
      form.reset({ ...emptyValues, ...saved, tertiaryInstitutions });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission, emptyValues]);

  // A validation error in a collapsed section would otherwise be invisible — force those
  // sections open whenever a submit attempt surfaces errors in them.
  useEffect(() => {
    if (form.formState.submitCount === 0) return;
    const errorKeys = Object.keys(form.formState.errors);
    if (errorKeys.length === 0) return;
    setOpenItems((prev) => Array.from(new Set([...prev, ...errorKeys])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.formState.submitCount]);

  async function handleSave(values: EducationDraft) {
    await saveSection("education", values);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  function jumpTo(id: string) {
    setOpenItems((prev) => (prev.includes(id) ? prev : [...prev, id]));
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const watched = form.watch();

  const schoolFacilityColumns: RepeatableColumn[] = [
    { key: "schoolName", label: { en: "School Name", si: "පාසලේ නම" }, type: "text", required: true },
    {
      key: "accommodationAvailable",
      label: { en: "Boarding Facilities", si: "නේවාසික පහසුකම්" },
      type: "select",
      options: YES_NO_OPTIONS,
      required: true,
    },
    { key: "teachersFemale", label: { en: "Teachers (Female)", si: "ගුරුවරු ගණන - ස්ත්‍රී" }, type: "number" },
    { key: "teachersMale", label: { en: "Teachers (Male)", si: "ගුරුවරු ගණන - පුරුෂ" }, type: "number" },
    { key: "studentsFemale", label: { en: "Students (Female)", si: "සිසුන් ගණන - ස්ත්‍රී" }, type: "number" },
    { key: "studentsMale", label: { en: "Students (Male)", si: "සිසුන් ගණන - පුරුෂ" }, type: "number" },
    {
      key: "waterFacility",
      label: { en: "Water Facilities", si: "ජල පහසුකම්" },
      type: "select",
      options: YES_NO_OPTIONS,
      required: true,
    },
    {
      key: "sanitationFacility",
      label: { en: "Toilet Facilities", si: "වැසිකිලි පහසුකම්" },
      type: "select",
      options: YES_NO_OPTIONS,
      required: true,
    },
    {
      key: "sportsGround",
      label: { en: "Playground", si: "ක්‍රීඩාපිටි" },
      type: "select",
      options: YES_NO_OPTIONS,
      required: true,
    },
  ];

  const specialAttentionSchoolColumns: RepeatableColumn[] = [
    { key: "schoolName", label: { en: "School Name", si: "පාසලේ නම" }, type: "text", required: true },
    { key: "teachersFemale", label: { en: "Teachers (Female)", si: "ගුරුවරු ගණන - ස්ත්‍රී" }, type: "number" },
    { key: "teachersMale", label: { en: "Teachers (Male)", si: "ගුරුවරු ගණන - පුරුෂ" }, type: "number" },
    { key: "studentsFemale", label: { en: "Students (Female)", si: "සිසුන් ගණන - ස්ත්‍රී" }, type: "number" },
    { key: "studentsMale", label: { en: "Students (Male)", si: "සිසුන් ගණන - පුරුෂ" }, type: "number" },
    { key: "developmentNeeds", label: { en: "Development Needs", si: "සංවර්ධන අවශ්‍යතා" }, type: "text", required: true },
  ];

  const closedSchoolColumns: RepeatableColumn[] = [
    { key: "schoolName", label: { en: "School Name", si: "පාසලේ නම" }, type: "text", required: true },
    { key: "yearClosed", label: { en: "Year Closed", si: "වැසීගිය වර්ෂය" }, type: "number" },
    { key: "buildingCount", label: { en: "Existing Buildings", si: "පවතින ගොඩනැගිලි සංඛ්‍යාව" }, type: "number" },
    {
      key: "buildingsUsable",
      label: { en: "Whether Buildings Can Currently Be Used", si: "ගොඩනැගිලි දැනට භාවිතා කලහැකි බව/නොහැකි බව" },
      type: "select",
      options: YES_NO_OPTIONS,
      required: true,
    },
  ];

  const privateInternationalSchoolColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "School Name", si: "පාසලේ නම" }, type: "text", required: true },
    { key: "teacherCount", label: { en: "Number of Teachers", si: "ගුරුවරු ගණන" }, type: "number" },
    { key: "studentCount", label: { en: "Number of Students", si: "සිසුන් ගණන" }, type: "number" },
  ];

  const pirivenaColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Pirivena Name", si: "පිරිවෙනේ නම" }, type: "text", required: true },
    { key: "type", label: { en: "Pirivena Type", si: "පිරිවෙනේ වර්ගය" }, type: "text", required: true },
    {
      key: "boardingFacility",
      label: { en: "Boarding Facilities", si: "නේවාසික පහසුකම්" },
      type: "select",
      options: YES_NO_OPTIONS,
      required: true,
    },
    { key: "teachersFemale", label: { en: "Teachers (Female)", si: "ගුරුවරු ගණන - ස්ත්‍රී" }, type: "number" },
    { key: "teachersMale", label: { en: "Teachers (Male)", si: "ගුරුවරු ගණන - පුරුෂ" }, type: "number" },
    { key: "studentsFemale", label: { en: "Students (Female)", si: "සිසුන් ගණන - ස්ත්‍රී" }, type: "number" },
    { key: "studentsMale", label: { en: "Students (Male)", si: "සිසුන් ගණන - පුරුෂ" }, type: "number" },
    {
      key: "waterFacility",
      label: { en: "Water Facilities", si: "ජල පහසුකම්" },
      type: "select",
      options: YES_NO_OPTIONS,
      required: true,
    },
    {
      key: "sanitationFacility",
      label: { en: "Toilet Facilities", si: "වැසිකිලි පහසුකම්" },
      type: "select",
      options: YES_NO_OPTIONS,
      required: true,
    },
    {
      key: "sportsGround",
      label: { en: "Playground", si: "ක්‍රීඩාපිටි" },
      type: "select",
      options: YES_NO_OPTIONS,
      required: true,
    },
  ];

  const vocationalInstituteColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Technical and Vocational Training Institution", si: "කාර්මික හා වෘත්තීය පුහුණු ආයතන" }, type: "text", required: true },
  ];

  const preschoolColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Preschool Name", si: "පෙර පාසලේ නම" }, type: "text", required: true },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text", required: true },
    {
      key: "facilityType",
      label: { en: "Private / Government", si: "පුද්ගලික/ රජයේ" },
      type: "select",
      options: PRESCHOOL_FACILITY_TYPES.map((t) => ({ value: t, label: PRESCHOOL_FACILITY_TYPE_LABELS[t] })),
      required: true,
    },
    { key: "studentCount", label: { en: "Number of Students", si: "සිසුන් ගණන" }, type: "number" },
    { key: "teacherCount", label: { en: "Number of Teachers", si: "ගුරුවරු ගණන" }, type: "number" },
  ];

  const dhammaEducationInstitutionColumns: RepeatableColumn[] = [
    { key: "institutionName", label: { en: "Name of Dhamma Education Institution", si: "දහම් අධ්‍යාපනය ලබාදෙන ආයතනයේ නම" }, type: "text", required: true },
    {
      key: "type",
      label: { en: "Dhamma Education Institution Type", si: "දහම් අධ්‍යාපනය ලබාදෙන ආයතන වර්ගය" },
      type: "select",
      options: DHAMMA_TYPES.map((t) => ({ value: t, label: DHAMMA_TYPE_LABELS[t] })),
      required: true,
    },
    { key: "teacherCount", label: { en: "Number of Teachers", si: "ගුරුවරු ගණන" }, type: "number" },
    { key: "studentCount", label: { en: "Number of Students", si: "සිසුන් ගණන" }, type: "number" },
  ];

  const tuitionCenterColumns: RepeatableColumn[] = [
    { key: "registrationNumber", label: { en: "Registration Number", si: "ලියාපදිංචි අංකය" }, type: "text", required: true },
    {
      key: "nameAndAddress",
      label: { en: "Name and Address of Tuition Class Institution", si: "උපකාරක පන්ති ආයතනයන්හි නම හා ලිපිනය" },
      type: "text",
      required: true,
    },
  ];

  const schoolFacilitiesMeta = listMeta(watched.schoolFacilities);
  const specialAttentionSchoolsMeta = listMeta(watched.specialAttentionSchools);
  const closedSchoolsMeta = listMeta(watched.closedSchools);
  const privateInternationalSchoolsMeta = listMeta(watched.privateInternationalSchools);
  const pirivenasMeta = listMeta(watched.pirivenas);
  const vocationalInstitutesMeta = listMeta(watched.vocationalInstitutes);
  const preschoolsMeta = listMeta(watched.preschools);
  const dhammaEducationInstitutionsMeta = listMeta(watched.dhammaEducationInstitutions);
  // Counts named institutions/branches, not checklist rows — a category with two branches
  // entered should read as 2 entries, same as any other repeatable list in this section.
  const tertiaryInstitutionsPresentCount = watched.tertiaryInstitutions?.filter((r) => r?.name?.trim()).length ?? 0;
  const tertiaryInstitutionsMeta = {
    status: (tertiaryInstitutionsPresentCount > 0 ? "filled" : "empty") as "filled" | "empty",
    countLabel: entryCountLabel(tertiaryInstitutionsPresentCount),
  };
  const tuitionCentersMeta = listMeta(watched.tuitionCenters);

  return (
    <SectionForm
      sectionNumber={7}
      title={educationDict.title}
      description={educationDict.description}
      form={form}
      saveStatus={status}
      saveErrorMessage={errorMessage}
      onSaveDraft={handleSave}
      submission={submission}
      sectionKey="education"
    >
      {/* Quick-jump strip: 14 subsections is too many to scroll through blind — this lets an
          officer land directly on (and auto-open) whichever one they came here to fill in. */}
      <div className="-mx-1 flex flex-nowrap gap-2 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:overflow-x-visible">
        {SECTION_IDS.map((id) => (
          <Button
            key={id}
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 rounded-full"
            data-section-id={id}
            onClick={() => jumpTo(id)}
          >
            {lang === "si" ? educationDict.fields[id].si : educationDict.fields[id].en}
          </Button>
        ))}
      </div>

      <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="flex flex-col">
        <CollapsibleFieldGroup value="institutionCounts" title={educationDict.fields.institutionCounts} status={hasAnyNonZero(watched.institutionCounts) ? "filled" : "empty"}>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            <FieldWrapper name="institutionCounts.govtSchools" label={{ en: "Schools (Government)", si: "පාසල් (රජයේ)" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.govtSchools")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="institutionCounts.privateOrInternationalSchools" label={{ en: "Private Schools / International Schools", si: "පෞද්ගලික පාසල් /ජාත්‍යන්තර පාසල්" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.privateOrInternationalSchools")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="institutionCounts.pirivenas" label={{ en: "Pirivenas", si: "පිරිවෙන්" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.pirivenas")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="institutionCounts.vocationalTrainingInstitutes" label={{ en: "Technical and Vocational Training Institutions", si: "කාර්මික හා වෘත්තීය පුහුණු ආයතන" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.vocationalTrainingInstitutes")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="institutionCounts.registeredPreschoolsGovt" label={{ en: "Registered Preschools - Government", si: "ලියාපදිංචි පෙර පාසල්- රජයේ" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.registeredPreschoolsGovt")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="institutionCounts.registeredPreschoolsPrivate" label={{ en: "Registered Preschools - Private", si: "ලියාපදිංචි පෙර පාසල් - පෞද්ගලික" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.registeredPreschoolsPrivate")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="institutionCounts.dhammaEducationInstitutions" label={{ en: "Dhamma Education Institutions", si: "දහම් අධ්‍යාපනය ලබාදෙන ආයතන" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.dhammaEducationInstitutions")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="institutionCounts.higherEducationInstitutions" label={{ en: "Higher Education Institutions", si: "උසස් අධ්‍යාපන ආයතන" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.higherEducationInstitutions")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="institutionCounts.tuitionCenterInstitutions" label={{ en: "Tuition Class Institutions", si: "උපකාරක පන්ති පවත්වන ආයතන" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.tuitionCenterInstitutions")} />
              )}
            </FieldWrapper>
          </div>
        </CollapsibleFieldGroup>

        <CollapsibleFieldGroup value="schoolCountsByType" title={educationDict.fields.schoolCountsByType} status={hasAnyNonZero(watched.schoolCountsByType) ? "filled" : "empty"}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
              <FieldWrapper
                name="schoolCountsByType.nationalSchools"
                label={{ en: "National Schools", si: "ජාතික පාසල් සංඛ්‍යාව" }}
              >
                {({ id, describedBy, invalid }) => (
                  <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("schoolCountsByType.nationalSchools")} />
                )}
              </FieldWrapper>
            </div>

            <div className="rounded-lg border border-border/60 p-4">
              <p lang={lang} className={cn("mb-3 text-fluid-sm font-medium text-muted-foreground", lang === "si" && "font-si")}>
                {lang === "si" ? "පළාත් සභා පාසල්" : "Provincial Council Schools"}
              </p>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
                <FieldWrapper
                  name="schoolCountsByType.type1AB"
                  label={{
                    en: "Type 1 AB — Schools with A/L Science Subjects",
                    si: "වර්ගය 1 AB - උසස් පෙළ විද්‍යා විෂයයන් ඇති පාසල්",
                  }}
                >
                  {({ id, describedBy, invalid }) => (
                    <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("schoolCountsByType.type1AB")} />
                  )}
                </FieldWrapper>
                <FieldWrapper
                  name="schoolCountsByType.type1C"
                  label={{
                    en: "Type 1 C — Schools with A/L Arts / Commerce Subjects",
                    si: "වර්ගය 1 C - උසස් පෙළ කලා/වාණිජ විෂයයන් ඇති පාසල්",
                  }}
                >
                  {({ id, describedBy, invalid }) => (
                    <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("schoolCountsByType.type1C")} />
                  )}
                </FieldWrapper>
                <FieldWrapper
                  name="schoolCountsByType.type2"
                  label={{
                    en: "Type 2 — Schools With Classes up to Grade 1–11",
                    si: "වර්ගය 2 - 1-11 ශ්‍රේණිය දක්වා පන්ති පවතින පාසල්",
                  }}
                >
                  {({ id, describedBy, invalid }) => (
                    <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("schoolCountsByType.type2")} />
                  )}
                </FieldWrapper>
                <FieldWrapper
                  name="schoolCountsByType.type3"
                  label={{ en: "Type 3 — Primary Schools", si: "වර්ගය 3 - ප්‍රාථමික පාසල්" }}
                >
                  {({ id, describedBy, invalid }) => (
                    <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("schoolCountsByType.type3")} />
                  )}
                </FieldWrapper>
              </div>
            </div>

            <p lang={lang} className={cn("text-fluid-sm text-muted-foreground", lang === "si" && "font-si")}>
              <Bilingual en="Total School Count: " si="මුළු පාසල් සංඛ්‍යාව: " />
              <span className="font-semibold nums-tabular text-foreground">
                {(watched.schoolCountsByType?.nationalSchools ?? 0) +
                  (watched.schoolCountsByType?.type1AB ?? 0) +
                  (watched.schoolCountsByType?.type1C ?? 0) +
                  (watched.schoolCountsByType?.type2 ?? 0) +
                  (watched.schoolCountsByType?.type3 ?? 0)}
              </span>
            </p>
          </div>
        </CollapsibleFieldGroup>

        <CollapsibleFieldGroup value="schoolFacilities" title={educationDict.fields.schoolFacilities} status={schoolFacilitiesMeta.status} countLabel={schoolFacilitiesMeta.countLabel}>
          <RepeatableTable
            name="schoolFacilities"
            columns={schoolFacilityColumns}
            emptyRowFactory={() => ({
              schoolName: "",
              accommodationAvailable: "no",
              teachersFemale: 0,
              teachersMale: 0,
              studentsFemale: 0,
              studentsMale: 0,
              waterFacility: "no",
              sanitationFacility: "no",
              sportsGround: "no",
            })}
          />
          {educationDict.fields.schoolFacilities.helpEn && (
            <Bilingual
              as="p"
              en={educationDict.fields.schoolFacilities.helpEn}
              si={educationDict.fields.schoolFacilities.helpSi!}
              className="text-fluid-xs text-muted-foreground"
            />
          )}
        </CollapsibleFieldGroup>

        <CollapsibleFieldGroup value="specialAttentionSchools" title={educationDict.fields.specialAttentionSchools} status={specialAttentionSchoolsMeta.status} countLabel={specialAttentionSchoolsMeta.countLabel}>
          <RepeatableTable
            name="specialAttentionSchools"
            columns={specialAttentionSchoolColumns}
            emptyRowFactory={() => ({
              schoolName: "",
              teachersFemale: 0,
              teachersMale: 0,
              studentsFemale: 0,
              studentsMale: 0,
              developmentNeeds: "",
            })}
          />
        </CollapsibleFieldGroup>

        <CollapsibleFieldGroup value="closedSchools" title={educationDict.fields.closedSchools} status={closedSchoolsMeta.status} countLabel={closedSchoolsMeta.countLabel}>
          <RepeatableTable
            name="closedSchools"
            columns={closedSchoolColumns}
            emptyRowFactory={() => ({ schoolName: "", yearClosed: 0, buildingCount: 0, buildingsUsable: "no" })}
          />
        </CollapsibleFieldGroup>

        <CollapsibleFieldGroup value="privateInternationalSchools" title={educationDict.fields.privateInternationalSchools} status={privateInternationalSchoolsMeta.status} countLabel={privateInternationalSchoolsMeta.countLabel}>
          <RepeatableTable
            name="privateInternationalSchools"
            columns={privateInternationalSchoolColumns}
            emptyRowFactory={() => ({ name: "", teacherCount: 0, studentCount: 0 })}
          />
        </CollapsibleFieldGroup>

        <CollapsibleFieldGroup value="pirivenas" title={educationDict.fields.pirivenas} status={pirivenasMeta.status} countLabel={pirivenasMeta.countLabel}>
          <RepeatableTable
            name="pirivenas"
            columns={pirivenaColumns}
            emptyRowFactory={() => ({
              name: "",
              type: "",
              boardingFacility: "no",
              teachersFemale: 0,
              teachersMale: 0,
              studentsFemale: 0,
              studentsMale: 0,
              waterFacility: "no",
              sanitationFacility: "no",
              sportsGround: "no",
            })}
          />
          {educationDict.fields.pirivenas.helpEn && (
            <Bilingual
              as="p"
              en={educationDict.fields.pirivenas.helpEn}
              si={educationDict.fields.pirivenas.helpSi!}
              className="text-fluid-xs text-muted-foreground"
            />
          )}
        </CollapsibleFieldGroup>

        <CollapsibleFieldGroup value="vocationalInstitutes" title={educationDict.fields.vocationalInstitutes} status={vocationalInstitutesMeta.status} countLabel={vocationalInstitutesMeta.countLabel}>
          <RepeatableTable
            name="vocationalInstitutes"
            columns={vocationalInstituteColumns}
            emptyRowFactory={() => ({ name: "" })}
          />
        </CollapsibleFieldGroup>

        <CollapsibleFieldGroup value="preschools" title={educationDict.fields.preschools} status={preschoolsMeta.status} countLabel={preschoolsMeta.countLabel}>
          <RepeatableTable
            name="preschools"
            columns={preschoolColumns}
            emptyRowFactory={() => ({ name: "", address: "", facilityType: "govt", studentCount: 0, teacherCount: 0 })}
          />
        </CollapsibleFieldGroup>

        <CollapsibleFieldGroup value="dhammaEducationInstitutions" title={educationDict.fields.dhammaEducationInstitutions} status={dhammaEducationInstitutionsMeta.status} countLabel={dhammaEducationInstitutionsMeta.countLabel}>
          <RepeatableTable
            name="dhammaEducationInstitutions"
            columns={dhammaEducationInstitutionColumns}
            emptyRowFactory={() => ({ institutionName: "", type: "buddhist", teacherCount: 0, studentCount: 0 })}
          />
          {educationDict.fields.dhammaEducationInstitutions.helpEn && (
            <Bilingual
              as="p"
              en={educationDict.fields.dhammaEducationInstitutions.helpEn}
              si={educationDict.fields.dhammaEducationInstitutions.helpSi!}
              className="text-fluid-xs text-muted-foreground"
            />
          )}
        </CollapsibleFieldGroup>

        <CollapsibleFieldGroup value="tertiaryInstitutions" title={educationDict.fields.tertiaryInstitutions} status={tertiaryInstitutionsMeta.status} countLabel={tertiaryInstitutionsMeta.countLabel}>
          <TertiaryInstitutionsTable lang={lang} />
        </CollapsibleFieldGroup>

        <CollapsibleFieldGroup value="tuitionCenters" title={educationDict.fields.tuitionCenters} status={tuitionCentersMeta.status} countLabel={tuitionCentersMeta.countLabel}>
          <RepeatableTable
            name="tuitionCenters"
            columns={tuitionCenterColumns}
            emptyRowFactory={() => ({ registrationNumber: "", nameAndAddress: "" })}
          />
        </CollapsibleFieldGroup>

        <CollapsibleFieldGroup value="outOfSchoolChildren" title={educationDict.fields.outOfSchoolChildren} status={hasAnyNonZero(watched.outOfSchoolChildren) ? "filled" : "empty"}>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            <FieldWrapper name="outOfSchoolChildren.male" label={{ en: "Male", si: "පිරිමි" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("outOfSchoolChildren.male")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="outOfSchoolChildren.female" label={{ en: "Female", si: "ගැහැණු" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("outOfSchoolChildren.female")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="outOfSchoolChildrenTotal" label={{ en: "Total", si: "එකතුව" }}>
              {({ id }) => (
                <Input
                  id={id}
                  readOnly
                  disabled
                  value={(Number(form.watch("outOfSchoolChildren.male")) || 0) + (Number(form.watch("outOfSchoolChildren.female")) || 0)}
                  className="nums-tabular"
                />
              )}
            </FieldWrapper>
          </div>
        </CollapsibleFieldGroup>

        <CollapsibleFieldGroup value="childrenInProbationOrDetention" title={educationDict.fields.childrenInProbationOrDetention} status={hasAnyNonZero(watched.childrenInProbationOrDetention) ? "filled" : "empty"}>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            <FieldWrapper name="childrenInProbationOrDetention.male" label={{ en: "Male", si: "පිරිමි" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("childrenInProbationOrDetention.male")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="childrenInProbationOrDetention.female" label={{ en: "Female", si: "ගැහැණු" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("childrenInProbationOrDetention.female")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="childrenInProbationOrDetentionTotal" label={{ en: "Total", si: "එකතුව" }}>
              {({ id }) => (
                <Input
                  id={id}
                  readOnly
                  disabled
                  value={(Number(form.watch("childrenInProbationOrDetention.male")) || 0) + (Number(form.watch("childrenInProbationOrDetention.female")) || 0)}
                  className="nums-tabular"
                />
              )}
            </FieldWrapper>
          </div>
        </CollapsibleFieldGroup>
      </Accordion>
    </SectionForm>
  );
}

type TertiaryInstitutionRow = {
  type: (typeof TERTIARY_TYPES)[number];
  typeLabel: string;
  exists: "yes" | "no";
  name?: string;
};

/** Tertiary institutions are a fixed 4-category checklist (university, tech institute, ...), but
 *  a GN division can have more than one institution of a given category (e.g. two university
 *  branches) — same per-category insert/anchor pattern as WaterSourcesTable in the
 *  physical-environment section: the first row of each type is the checklist anchor and can't be
 *  removed, "+" inserts an extra row for that same category right after it, and extras can be
 *  deleted again. Unlike water sources, a name is only collectible once the category is marked as
 *  existing — the "Exists?" select lives only on the anchor row (extras are only ever created
 *  once that's already "yes", so they don't need their own copy of the question), and the name
 *  input plus "+" only appear while exists is "yes". */
function TertiaryInstitutionsTable({ lang }: { lang: "en" | "si" }) {
  const { control, register, watch, setValue, formState } = useFormContext<EducationDraft>();
  const { fields, insert, remove } = useFieldArray({ control, name: "tertiaryInstitutions" });
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);

  const seenTypes = new Set<string>();
  const isAnchor = fields.map((field) => {
    const row = field as FieldArrayWithId<EducationDraft, "tertiaryInstitutions"> & TertiaryInstitutionRow;
    const first = !seenTypes.has(row.type);
    seenTypes.add(row.type);
    return first;
  });

  function addAnother(index: number) {
    const row = fields[index] as FieldArrayWithId<EducationDraft, "tertiaryInstitutions"> & TertiaryInstitutionRow;
    insert(index + 1, { type: row.type, typeLabel: row.typeLabel, exists: "yes", name: "" } as never);
  }

  function requestRemove(index: number) {
    const row = fields[index] as FieldArrayWithId<EducationDraft, "tertiaryInstitutions"> & TertiaryInstitutionRow;
    if (row.name) setPendingDeleteIndex(index);
    else remove(index);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
        {fields.map((field, index) => {
          const row = field as FieldArrayWithId<EducationDraft, "tertiaryInstitutions"> & TertiaryInstitutionRow;
          const exists = watch(`tertiaryInstitutions.${index}.exists`) ?? "no";
          const showNameInput = isAnchor[index] ? exists === "yes" : true;
          const nameError = isAnchor[index]
            ? getErrorAtPath(formState.errors as Record<string, unknown>, `tertiaryInstitutions.${index}.name`)
            : undefined;
          return (
            <div key={field.id} className="flex flex-wrap items-start gap-3">
              <div className="flex w-full items-center gap-3 sm:w-auto">
                <span lang={lang} className={cn("w-44 shrink-0 text-fluid-sm font-medium text-foreground", lang === "si" && "font-si")}>
                  {isAnchor[index] ? row.typeLabel : ""}
                </span>
                {isAnchor[index] && (
                  <Select
                    value={exists}
                    onValueChange={(v) => setValue(`tertiaryInstitutions.${index}.exists`, v as "yes" | "no", { shouldDirty: true })}
                  >
                    <SelectTrigger className="w-32 shrink-0" aria-label={`${row.typeLabel} — ${lang === "si" ? "ඇත/නැත" : "Exists?"}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {YES_NO_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {lang === "si" ? o.label.si : o.label.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {showNameInput && (
                <div className="flex min-w-48 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Input
                      className="flex-1"
                      placeholder={lang === "si" ? "ආයතනයේ නම (ශාඛා ද සඳහන් කරන්න)" : "Institution Name (Indicate Branches Too)"}
                      aria-invalid={!!nameError}
                      {...register(`tertiaryInstitutions.${index}.name`)}
                    />
                    {isAnchor[index] ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="touch-target shrink-0"
                        onClick={() => addAnother(index)}
                        aria-label={dictionary.add[lang]}
                      >
                        <Plus className="size-4" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="touch-target shrink-0 text-destructive hover:text-destructive"
                        onClick={() => requestRemove(index)}
                        aria-label={dictionary.delete[lang]}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                  {nameError?.message && <p className="text-fluid-xs text-destructive">{String(nameError.message)}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AlertDialog open={pendingDeleteIndex !== null} onOpenChange={(open) => !open && setPendingDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Bilingual {...dictionary.deleteConfirm} />
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Bilingual {...dictionary.cancel} />
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDeleteIndex !== null) remove(pendingDeleteIndex);
                setPendingDeleteIndex(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Bilingual {...dictionary.delete} />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
