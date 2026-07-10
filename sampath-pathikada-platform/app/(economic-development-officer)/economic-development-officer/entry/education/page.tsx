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
import { educationDict } from "@/lib/i18n/sections/education";
import {
  educationSchemaPartial,
  TERTIARY_TYPES,
  PRESCHOOL_FACILITY_TYPES,
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
  privateInternationalSchools: [],
  pirivenas: [],
  vocationalInstitutes: [],
  preschools: [],
  dhammaEducation: {
    buddhist: { schools: 0, students: 0 },
    islam: { schools: 0, students: 0 },
    hindu: { schools: 0, students: 0 },
    christian: { schools: 0, students: 0 },
  },
  tertiaryInstitutions: [],
  tuitionCenters: [],
  outOfSchoolChildrenCount: 0,
  marriedOrCohabitingMinorsCount: 0,
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

export default function EducationPage() {
  const { lang } = useLanguage();
  const { submission, isLoading } = useSubmission(CURRENT_YEAR);
  const { saveSection, status, errorMessage } = useSaveSection(CURRENT_YEAR);

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

  const schoolFacilityColumns: RepeatableColumn[] = [
    { key: "schoolName", label: { en: "School Name", si: "පාසලේ නම" }, type: "text" },
    {
      key: "accommodationAvailable",
      label: { en: "Accommodation Available", si: "නවාතැන් පහසුකම් ඇත" },
      type: "select",
      options: YES_NO_OPTIONS,
    },
    { key: "teacherCount", label: { en: "Teacher Count", si: "ගුරු සංඛ්‍යාව" }, type: "number" },
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
      label: { en: "Sanitation Facility", si: "සනීපාරක්ෂක පහසුකම්" },
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
    { key: "reason", label: { en: "Reason", si: "හේතුව" }, type: "text" },
  ];

  const privateInternationalSchoolColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "teacherCount", label: { en: "Teacher Count", si: "ගුරු සංඛ්‍යාව" }, type: "number" },
    { key: "studentCount", label: { en: "Student Count", si: "සිසු සංඛ්‍යාව" }, type: "number" },
  ];

  const pirivenaColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "type", label: { en: "Type", si: "වර්ගය" }, type: "text" },
    { key: "studentCount", label: { en: "Student Count", si: "සිසු සංඛ්‍යාව" }, type: "number" },
  ];

  const vocationalInstituteColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
  ];

  const preschoolColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    {
      key: "facilityType",
      label: { en: "Facility Type", si: "පහසුකම් වර්ගය" },
      type: "select",
      options: PRESCHOOL_FACILITY_TYPES.map((t) => ({ value: t, label: PRESCHOOL_FACILITY_TYPE_LABELS[t] })),
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
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
  ];

  const headingClass = cn("text-fluid-lg font-semibold text-foreground", lang === "si" && "font-si-heading");

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
      <div className="flex flex-col gap-2">
        <h2 lang={lang} className={headingClass}>
          {educationDict.fields.institutionCounts[lang]}
        </h2>
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
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-6">
        <h2 lang={lang} className={headingClass}>
          {educationDict.fields.schoolCountsByType[lang]}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="schoolCountsByType.nationalSchools" label={{ en: "National Schools", si: "ජාතික පාසල්" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("schoolCountsByType.nationalSchools")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="schoolCountsByType.type1AB" label={{ en: "Type 1AB", si: "වර්ගය 1AB" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("schoolCountsByType.type1AB")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="schoolCountsByType.type1C" label={{ en: "Type 1C", si: "වර්ගය 1C" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("schoolCountsByType.type1C")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="schoolCountsByType.type2" label={{ en: "Type 2", si: "වර්ගය 2" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("schoolCountsByType.type2")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="schoolCountsByType.type3" label={{ en: "Type 3", si: "වර්ගය 3" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("schoolCountsByType.type3")} />
            )}
          </FieldWrapper>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="schoolFacilities"
          title={educationDict.fields.schoolFacilities}
          columns={schoolFacilityColumns}
          emptyRowFactory={() => ({
            schoolName: "",
            accommodationAvailable: "no",
            teacherCount: 0,
            studentsFemale: 0,
            studentsMale: 0,
            waterFacility: "no",
            sanitationFacility: "no",
            sportsGround: "no",
          })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="specialAttentionSchools"
          title={educationDict.fields.specialAttentionSchools}
          columns={specialAttentionSchoolColumns}
          emptyRowFactory={() => ({ schoolName: "", reason: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="privateInternationalSchools"
          title={educationDict.fields.privateInternationalSchools}
          columns={privateInternationalSchoolColumns}
          emptyRowFactory={() => ({ name: "", teacherCount: 0, studentCount: 0 })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="pirivenas"
          title={educationDict.fields.pirivenas}
          columns={pirivenaColumns}
          emptyRowFactory={() => ({ name: "", type: "", studentCount: 0 })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="vocationalInstitutes"
          title={educationDict.fields.vocationalInstitutes}
          columns={vocationalInstituteColumns}
          emptyRowFactory={() => ({ name: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="preschools"
          title={educationDict.fields.preschools}
          columns={preschoolColumns}
          emptyRowFactory={() => ({ name: "", facilityType: "govt", teacherCount: 0, studentCount: 0 })}
        />
      </div>

      <div className="flex flex-col gap-4 border-t border-border pt-6">
        <h2 lang={lang} className={headingClass}>
          {educationDict.fields.dhammaEducation[lang]}
        </h2>

        <div className="flex flex-col gap-2">
          <h3 lang={lang} className={cn("text-fluid-base font-medium text-foreground", lang === "si" && "font-si")}>
            {lang === "si" ? "බුද්ධාගම" : "Buddhist"}
          </h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            <FieldWrapper name="dhammaEducation.buddhist.schools" label={{ en: "Schools", si: "පාසල් සංඛ්‍යාව" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("dhammaEducation.buddhist.schools")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="dhammaEducation.buddhist.students" label={{ en: "Students", si: "සිසුන් සංඛ්‍යාව" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("dhammaEducation.buddhist.students")} />
              )}
            </FieldWrapper>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 lang={lang} className={cn("text-fluid-base font-medium text-foreground", lang === "si" && "font-si")}>
            {lang === "si" ? "ඉස්ලාම්" : "Islam"}
          </h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            <FieldWrapper name="dhammaEducation.islam.schools" label={{ en: "Schools", si: "පාසල් සංඛ්‍යාව" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("dhammaEducation.islam.schools")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="dhammaEducation.islam.students" label={{ en: "Students", si: "සිසුන් සංඛ්‍යාව" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("dhammaEducation.islam.students")} />
              )}
            </FieldWrapper>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 lang={lang} className={cn("text-fluid-base font-medium text-foreground", lang === "si" && "font-si")}>
            {lang === "si" ? "හින්දු" : "Hindu"}
          </h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            <FieldWrapper name="dhammaEducation.hindu.schools" label={{ en: "Schools", si: "පාසල් සංඛ්‍යාව" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("dhammaEducation.hindu.schools")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="dhammaEducation.hindu.students" label={{ en: "Students", si: "සිසුන් සංඛ්‍යාව" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("dhammaEducation.hindu.students")} />
              )}
            </FieldWrapper>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 lang={lang} className={cn("text-fluid-base font-medium text-foreground", lang === "si" && "font-si")}>
            {lang === "si" ? "ක්‍රිස්තියානි" : "Christian"}
          </h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            <FieldWrapper name="dhammaEducation.christian.schools" label={{ en: "Schools", si: "පාසල් සංඛ්‍යාව" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("dhammaEducation.christian.schools")} />
              )}
            </FieldWrapper>
            <FieldWrapper name="dhammaEducation.christian.students" label={{ en: "Students", si: "සිසුන් සංඛ්‍යාව" }}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("dhammaEducation.christian.students")} />
              )}
            </FieldWrapper>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="tertiaryInstitutions"
          title={educationDict.fields.tertiaryInstitutions}
          columns={tertiaryInstitutionColumns}
          emptyRowFactory={() => ({ name: "", type: "university" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="tuitionCenters"
          title={educationDict.fields.tuitionCenters}
          columns={tuitionCenterColumns}
          emptyRowFactory={() => ({ name: "" })}
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 border-t border-border pt-6">
        <FieldWrapper name="outOfSchoolChildrenCount" label={educationDict.fields.outOfSchoolChildrenCount}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("outOfSchoolChildrenCount")} />
          )}
        </FieldWrapper>
        <FieldWrapper name="marriedOrCohabitingMinorsCount" label={educationDict.fields.marriedOrCohabitingMinorsCount}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("marriedOrCohabitingMinorsCount")} />
          )}
        </FieldWrapper>
      </div>
    </SectionForm>
  );
}
