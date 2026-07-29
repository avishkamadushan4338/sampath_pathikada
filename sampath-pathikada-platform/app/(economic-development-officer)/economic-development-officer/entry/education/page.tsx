"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { SectionForm } from "@/components/forms/SectionForm";
import { FieldWrapper } from "@/components/forms/FormField";
import { RepeatableTable, type RepeatableColumn } from "@/components/forms/RepeatableTable";
import { CollapsibleFieldGroup, hasAnyNonZero, entryCountLabel } from "@/components/forms/CollapsibleFieldGroup";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bilingual } from "@/components/Bilingual";
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
  "university-college": { en: "University College", si: "විශ්වවිද්‍යාල විද්‍යාලය" },
  university: { en: "University", si: "විශ්වවිද්‍යාලය" },
  "tech-institute": { en: "Technical Institute", si: "තාක්ෂණික ආයතනය" },
  "private-university": { en: "Private University", si: "පෞද්ගලික විශ්වවිද්‍යාලය" },
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

  const form = useForm<EducationDraft>({
    resolver: zodResolver(educationSchemaPartial),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (submission?.data.education) {
      form.reset({ ...EMPTY_VALUES, ...submission.data.education });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission]);

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
    { key: "schoolName", label: { en: "School Name", si: "පාසලේ නම" }, type: "text" },
    {
      key: "accommodationAvailable",
      label: { en: "Accommodation Available", si: "නවාතැන් පහසුකම් ඇත" },
      type: "select",
      options: YES_NO_OPTIONS,
    },
    { key: "teachersFemale", label: { en: "Teachers (Female)", si: "ගුරුවරු (ස්ත්‍රී)" }, type: "number" },
    { key: "teachersMale", label: { en: "Teachers (Male)", si: "ගුරුවරු (පුරුෂ)" }, type: "number" },
    { key: "studentsFemale", label: { en: "Students (Female)", si: "සිසුන් (ගැහැණු)" }, type: "number" },
    { key: "studentsMale", label: { en: "Students (Male)", si: "සිසුන් (පිරිමි)" }, type: "number" },
    {
      key: "waterFacility",
      label: { en: "Water Facility", si: "ජල පහසුකම්" },
      type: "select",
      options: YES_NO_OPTIONS,
    },
    {
      key: "sanitationFacility",
      label: { en: "Sanitation Facility", si: "වැසිකිලි පහසුකම්" },
      type: "select",
      options: YES_NO_OPTIONS,
    },
    {
      key: "sportsGround",
      label: { en: "Sports Ground", si: "ක්‍රීඩා පිටිය" },
      type: "select",
      options: YES_NO_OPTIONS,
    },
  ];

  const specialAttentionSchoolColumns: RepeatableColumn[] = [
    { key: "schoolName", label: { en: "School Name", si: "පාසලේ නම" }, type: "text" },
    { key: "teachersFemale", label: { en: "Teachers (Female)", si: "ගුරුවරු (ස්ත්‍රී)" }, type: "number" },
    { key: "teachersMale", label: { en: "Teachers (Male)", si: "ගුරුවරු (පුරුෂ)" }, type: "number" },
    { key: "studentsFemale", label: { en: "Students (Female)", si: "සිසුන් (ගැහැණු)" }, type: "number" },
    { key: "studentsMale", label: { en: "Students (Male)", si: "සිසුන් (පිරිමි)" }, type: "number" },
    { key: "developmentNeeds", label: { en: "Development Needs", si: "සංවර්ධන අවශ්‍යතා" }, type: "text" },
  ];

  const closedSchoolColumns: RepeatableColumn[] = [
    { key: "schoolName", label: { en: "School Name", si: "පාසලේ නම" }, type: "text" },
    { key: "yearClosed", label: { en: "Year Closed", si: "වැසීගිය වර්ෂය" }, type: "number" },
    { key: "buildingCount", label: { en: "Existing Buildings", si: "පවතින ගොඩනැගිලි සංඛ්‍යාව" }, type: "number" },
    {
      key: "buildingsUsable",
      label: { en: "Buildings Currently Usable", si: "ගොඩනැගිලි දැනට භාවිත කළ හැකිද" },
      type: "select",
      options: YES_NO_OPTIONS,
    },
  ];

  const privateInternationalSchoolColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "teacherCount", label: { en: "Teacher Count", si: "ගුරු සංඛ්‍යාව" }, type: "number" },
    { key: "studentCount", label: { en: "Student Count", si: "සිසු සංඛ්‍යාව" }, type: "number" },
  ];

  const pirivenaColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "type", label: { en: "Type", si: "වර්ගය" }, type: "text" },
    {
      key: "boardingFacility",
      label: { en: "Boarding Facility", si: "නේවාසික පහසුකම්" },
      type: "select",
      options: YES_NO_OPTIONS,
    },
    { key: "teachersFemale", label: { en: "Teachers (Female)", si: "ගුරුවරු (ස්ත්‍රී)" }, type: "number" },
    { key: "teachersMale", label: { en: "Teachers (Male)", si: "ගුරුවරු (පුරුෂ)" }, type: "number" },
    { key: "studentsFemale", label: { en: "Students (Female)", si: "සිසුන් (ගැහැණු)" }, type: "number" },
    { key: "studentsMale", label: { en: "Students (Male)", si: "සිසුන් (පිරිමි)" }, type: "number" },
    {
      key: "waterFacility",
      label: { en: "Water Facility", si: "ජල පහසුකම්" },
      type: "select",
      options: YES_NO_OPTIONS,
    },
    {
      key: "sanitationFacility",
      label: { en: "Sanitation Facility", si: "වැසිකිලි පහසුකම්" },
      type: "select",
      options: YES_NO_OPTIONS,
    },
    {
      key: "sportsGround",
      label: { en: "Sports Ground", si: "ක්‍රීඩා පිටිය" },
      type: "select",
      options: YES_NO_OPTIONS,
    },
  ];

  const vocationalInstituteColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
  ];

  const preschoolColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
    {
      key: "facilityType",
      label: { en: "Facility Type", si: "පහසුකම් වර්ගය" },
      type: "select",
      options: PRESCHOOL_FACILITY_TYPES.map((t) => ({ value: t, label: PRESCHOOL_FACILITY_TYPE_LABELS[t] })),
    },
    { key: "teacherCount", label: { en: "Teacher Count", si: "ගුරු සංඛ්‍යාව" }, type: "number" },
    { key: "studentCount", label: { en: "Student Count", si: "සිසු සංඛ්‍යාව" }, type: "number" },
  ];

  const dhammaEducationInstitutionColumns: RepeatableColumn[] = [
    { key: "institutionName", label: { en: "Institution Name", si: "ආයතනයේ නම" }, type: "text" },
    {
      key: "type",
      label: { en: "Type", si: "වර්ගය" },
      type: "select",
      options: DHAMMA_TYPES.map((t) => ({ value: t, label: DHAMMA_TYPE_LABELS[t] })),
    },
    { key: "teacherCount", label: { en: "Teacher Count", si: "ගුරු සංඛ්‍යාව" }, type: "number" },
    { key: "studentCount", label: { en: "Student Count", si: "සිසු සංඛ්‍යාව" }, type: "number" },
  ];

  const tertiaryInstitutionColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    {
      key: "type",
      label: { en: "Type", si: "වර්ගය" },
      type: "select",
      options: TERTIARY_TYPES.map((t) => ({ value: t, label: TERTIARY_TYPE_LABELS[t] })),
    },
  ];

  const tuitionCenterColumns: RepeatableColumn[] = [
    { key: "registrationNumber", label: { en: "Registration Number", si: "ලියාපදිංචි අංකය" }, type: "text" },
    { key: "nameAndAddress", label: { en: "Name and Address", si: "නම හා ලිපිනය" }, type: "text" },
  ];

  const schoolFacilitiesMeta = listMeta(watched.schoolFacilities);
  const specialAttentionSchoolsMeta = listMeta(watched.specialAttentionSchools);
  const closedSchoolsMeta = listMeta(watched.closedSchools);
  const privateInternationalSchoolsMeta = listMeta(watched.privateInternationalSchools);
  const pirivenasMeta = listMeta(watched.pirivenas);
  const vocationalInstitutesMeta = listMeta(watched.vocationalInstitutes);
  const preschoolsMeta = listMeta(watched.preschools);
  const dhammaEducationInstitutionsMeta = listMeta(watched.dhammaEducationInstitutions);
  const tertiaryInstitutionsMeta = listMeta(watched.tertiaryInstitutions);
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
            <FieldWrapper name="institutionCounts.govtSchools" label={{ en: "Government Schools", si: "රාජ්‍ය පාසල්" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.govtSchools")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="institutionCounts.privateOrInternationalSchools" label={{ en: "Private / International Schools", si: "පෞද්ගලික / ජාත්‍යන්තර පාසල්" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.privateOrInternationalSchools")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="institutionCounts.pirivenas" label={{ en: "Pirivenas", si: "පිරිවෙන්" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.pirivenas")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="institutionCounts.vocationalTrainingInstitutes" label={{ en: "Vocational Training Institutes", si: "වෘත්තීය පුහුණු ආයතන" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.vocationalTrainingInstitutes")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="institutionCounts.registeredPreschoolsGovt" label={{ en: "Registered Preschools (Govt)", si: "ලියාපදිංචි පෙර පාසල් (රාජ්‍ය)" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.registeredPreschoolsGovt")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="institutionCounts.registeredPreschoolsPrivate" label={{ en: "Registered Preschools (Private)", si: "ලියාපදිංචි පෙර පාසල් (පෞද්ගලික)" }}>
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
            emptyRowFactory={() => ({ name: "", address: "", facilityType: "govt", teacherCount: 0, studentCount: 0 })}
          />
        </CollapsibleFieldGroup>

        <CollapsibleFieldGroup value="dhammaEducationInstitutions" title={educationDict.fields.dhammaEducationInstitutions} status={dhammaEducationInstitutionsMeta.status} countLabel={dhammaEducationInstitutionsMeta.countLabel}>
          <RepeatableTable
            name="dhammaEducationInstitutions"
            columns={dhammaEducationInstitutionColumns}
            emptyRowFactory={() => ({ institutionName: "", type: "buddhist", teacherCount: 0, studentCount: 0 })}
          />
        </CollapsibleFieldGroup>

        <CollapsibleFieldGroup value="tertiaryInstitutions" title={educationDict.fields.tertiaryInstitutions} status={tertiaryInstitutionsMeta.status} countLabel={tertiaryInstitutionsMeta.countLabel}>
          <RepeatableTable
            name="tertiaryInstitutions"
            columns={tertiaryInstitutionColumns}
            emptyRowFactory={() => ({ name: "", type: "university" })}
          />
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
            <FieldWrapper name="outOfSchoolChildren.female" label={{ en: "Female", si: "ගැහැණු" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("outOfSchoolChildren.female")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="outOfSchoolChildren.male" label={{ en: "Male", si: "පිරිමි" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("outOfSchoolChildren.male")} />
              )}
            </FieldWrapper>
          </div>
        </CollapsibleFieldGroup>

        <CollapsibleFieldGroup value="childrenInProbationOrDetention" title={educationDict.fields.childrenInProbationOrDetention} status={hasAnyNonZero(watched.childrenInProbationOrDetention) ? "filled" : "empty"}>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            <FieldWrapper name="childrenInProbationOrDetention.female" label={{ en: "Female", si: "ගැහැණු" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("childrenInProbationOrDetention.female")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="childrenInProbationOrDetention.male" label={{ en: "Male", si: "පිරිමි" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("childrenInProbationOrDetention.male")} />
              )}
            </FieldWrapper>
          </div>
        </CollapsibleFieldGroup>
      </Accordion>
    </SectionForm>
  );
}
