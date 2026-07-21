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
import { healthDict } from "@/lib/i18n/sections/health";
import { healthSchemaPartial, GOVT_HOSPITAL_TYPES } from "@/lib/validators/sections/health";
import { cn } from "@/lib/utils";
import type { z } from "zod";

const CURRENT_YEAR = 2026;

type HealthDraft = z.infer<typeof healthSchemaPartial>;

const EMPTY_VALUES: HealthDraft = {
  institutionCounts: {
    govtHospitals: 0,
    primaryHealthcareUnits: 0,
    privateHospitals: 0,
    ayurvedicHospitals: 0,
    specialistServiceCenters: 0,
    mohOfficesOrCommunityHealthCenters: 0,
    privateMedicalLabs: 0,
    otherLabs: 0,
    govtPharmacies: 0,
    privatePharmacies: 0,
  },
  govtHospitalsDirectory: [],
  privateHospitalsDirectory: [],
  ayurvedicInstitutions: [],
  traditionalPractitioners: [],
};

const GOVT_HOSPITAL_TYPE_LABELS: Record<(typeof GOVT_HOSPITAL_TYPES)[number], { en: string; si: string }> = {
  teaching: { en: "Teaching Hospital", si: "ශික්ෂණ රෝහල" },
  base: { en: "Base Hospital", si: "පදනම් රෝහල" },
  divisional: { en: "Divisional Hospital", si: "කොට්ඨාස රෝහල" },
  primary: { en: "Primary Medical Care Unit", si: "ප්‍රාථමික සෞඛ්‍ය සේවා ඒකකය" },
};

export default function HealthPage() {
  const { lang } = useLanguage();
  const { submission, isLoading } = useSubmission(CURRENT_YEAR);
  const { saveSection, status, errorMessage } = useSaveSection(CURRENT_YEAR);

  const form = useForm<HealthDraft>({
    resolver: zodResolver(healthSchemaPartial),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (submission?.data.health) {
      form.reset({ ...EMPTY_VALUES, ...submission.data.health });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission]);

  async function handleSave(values: HealthDraft) {
    await saveSection("health", values);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  const govtHospitalColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
    {
      key: "type",
      label: { en: "Type", si: "වර්ගය" },
      type: "select",
      options: GOVT_HOSPITAL_TYPES.map((t) => ({ value: t, label: GOVT_HOSPITAL_TYPE_LABELS[t] })),
    },
  ];

  const privateHospitalColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
  ];

  const ayurvedicInstitutionColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
  ];

  const traditionalPractitionerColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "specialty", label: { en: "Specialty", si: "විශේෂඥතාව" }, type: "text" },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
  ];

  const headingClass = cn("text-fluid-lg font-semibold text-foreground", lang === "si" && "font-si-heading");

  return (
    <SectionForm
      sectionNumber={9}
      title={healthDict.title}
      description={healthDict.description}
      form={form}
      saveStatus={status}
      saveErrorMessage={errorMessage}
      onSaveDraft={handleSave}
    >
      <div className="flex flex-col gap-2">
        <h2 lang={lang} className={headingClass}>
          {healthDict.fields.institutionCounts[lang]}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="institutionCounts.govtHospitals" label={{ en: "Government Hospitals", si: "රාජ්‍ය රෝහල්" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.govtHospitals")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="institutionCounts.primaryHealthcareUnits" label={{ en: "Primary Healthcare Units", si: "ප්‍රාථමික සෞඛ්‍ය සේවා ඒකක" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.primaryHealthcareUnits")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="institutionCounts.privateHospitals" label={{ en: "Private Hospitals", si: "පෞද්ගලික රෝහල්" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.privateHospitals")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="institutionCounts.ayurvedicHospitals" label={{ en: "Ayurvedic Hospitals", si: "ආයුර්වේද රෝහල්" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.ayurvedicHospitals")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="institutionCounts.specialistServiceCenters" label={{ en: "Specialist Service Centers", si: "විශේෂඥ සේවා මධ්‍යස්ථාන" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.specialistServiceCenters")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="institutionCounts.mohOfficesOrCommunityHealthCenters" label={{ en: "MOH Offices / Community Health Centers", si: "ප්‍රාදේශීය සෞඛ්‍ය සේවා කාර්යාල / ප්‍රජා සෞඛ්‍ය මධ්‍යස්ථාන" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.mohOfficesOrCommunityHealthCenters")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="institutionCounts.privateMedicalLabs" label={{ en: "Private Medical Labs", si: "පෞද්ගලික වෛද්‍ය රසායනාගාර" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.privateMedicalLabs")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="institutionCounts.otherLabs" label={{ en: "Other Labs", si: "වෙනත් රසායනාගාර" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.otherLabs")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="institutionCounts.govtPharmacies" label={{ en: "Government Pharmacies", si: "රාජ්‍ය ඖෂධශාලා" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.govtPharmacies")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="institutionCounts.privatePharmacies" label={{ en: "Private Pharmacies", si: "පෞද්ගලික ඖෂධශාලා" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.privatePharmacies")} />
            )}
          </FieldWrapper>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="govtHospitalsDirectory"
          title={healthDict.fields.govtHospitalsDirectory}
          columns={govtHospitalColumns}
          emptyRowFactory={() => ({ name: "", address: "", type: "primary" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="privateHospitalsDirectory"
          title={healthDict.fields.privateHospitalsDirectory}
          columns={privateHospitalColumns}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="ayurvedicInstitutions"
          title={healthDict.fields.ayurvedicInstitutions}
          columns={ayurvedicInstitutionColumns}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="traditionalPractitioners"
          title={healthDict.fields.traditionalPractitioners}
          columns={traditionalPractitionerColumns}
          emptyRowFactory={() => ({ name: "", specialty: "", address: "" })}
        />
      </div>
    </SectionForm>
  );
}
