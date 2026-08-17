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
    traditionalMedicineRegisteredInstitutions: 0,
    animalClinicCenters: 0,
    govtPharmacies: 0,
    privatePharmacies: 0,
  },
  govtHospitalsDirectory: [],
  primaryHealthcareUnitsDirectory: [],
  privateHospitalsDirectory: [],
  ayurvedicInstitutions: [],
  specialistServiceCentersDirectory: [],
  mohOfficesDirectory: [],
  traditionalMedicineInstitutionsDirectory: [],
  privateMedicalLabsDirectory: [],
  animalClinicsDirectory: [],
  traditionalPractitioners: [],
};

const GOVT_HOSPITAL_TYPE_LABELS: Record<(typeof GOVT_HOSPITAL_TYPES)[number], { en: string; si: string }> = {
  teaching: { en: "Teaching Hospital", si: "ශික්ෂණ රෝහල්" },
  base: { en: "Base Hospital", si: "මහරෝහල්" },
  primary: { en: "Primary Hospital", si: "මූලික රෝහල්" },
  divisional: { en: "Divisional Hospital", si: "ප්‍රාදේශිය රෝහල්" },
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
    { key: "name", label: { en: "Government Hospital Name", si: "රජයේ රෝහලේ නම" }, type: "text", required: true },
    {
      key: "type",
      label: { en: "Hospital Type", si: "රෝහල් වර්ගය" },
      type: "select",
      options: GOVT_HOSPITAL_TYPES.map((t) => ({ value: t, label: GOVT_HOSPITAL_TYPE_LABELS[t] })),
      required: true,
    },
  ];

  const nameAddressColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name of Institution", si: "ආයතනයේ නම" }, type: "text", required: true },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text", required: true },
  ];

  const privateHospitalColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Private Hospital Name", si: "පෞද්ගලික රෝහලේ නම" }, type: "text", required: true },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text", required: true },
  ];

  const primaryHealthcareUnitColumns: RepeatableColumn[] = [
    {
      key: "name",
      label: {
        en: "Primary Healthcare Unit Name (Central Dispensary - Western) / Maternity Home",
        si: "ප්‍රාථමික සෞඛ්‍ය සත්කාර ඒකකයේ නම -( මධ්‍යම බෙහෙත් ශාලා- බටහිර )/මාතෘ නිවාස)",
      },
      type: "text",
      required: true,
    },
    { key: "type", label: { en: "* Type", si: "*වර්ගය" }, type: "text" },
  ];

  const traditionalPractitionerColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Practitioner Name", si: "පාරම්පරික සිංහල වෙදකම සිදු කරන වෛද්‍යවරුන්ගේ නම" }, type: "text", required: true },
    { key: "specialty", label: { en: "Field of Practice", si: "කටයුතු කරන වෛද්‍ය ක්ෂේත්‍රය" }, type: "text", required: true },
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
      submission={submission}
      sectionKey="health"
    >
      <div className="flex flex-col gap-2">
        <h2 lang={lang} className={headingClass}>
          {healthDict.fields.institutionCounts[lang]}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="institutionCounts.govtHospitals" label={{ en: "Number of Government Hospitals", si: "රජයේ රෝහල් සංඛ්‍යාව" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.govtHospitals")} />
            )}
          </FieldWrapper>
          <FieldWrapper
            name="institutionCounts.primaryHealthcareUnits"
            label={{ en: "Primary Healthcare Units (Central Dispensary - Western) / Maternity Homes", si: "ප්‍රාථමික සෞඛ්‍ය සත්කාර ඒකක-( මධ්‍යම බෙහෙත් ශාලා- බටහිර )/මාතෘ නිවාස" }}
          >
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.primaryHealthcareUnits")} />
            )}
          </FieldWrapper>
          <FieldWrapper
            name="institutionCounts.privateHospitals"
            label={{ en: "Number of Private Hospitals (with Residential Facilities)", si: "පෞද්ගලික රෝහල් සංඛ්‍යාව (නේවාසික පහසුකම් සහිත)" }}
          >
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.privateHospitals")} />
            )}
          </FieldWrapper>
          <FieldWrapper
            name="institutionCounts.ayurvedicHospitals"
            label={{ en: "Number of Ayurvedic Hospitals / Ayurvedic Central Dispensaries", si: "ආයුර්වේද රෝහල් /ආයුර්වේද මධ්‍යම බෙහෙත් ශාලා සංඛ්‍යාව" }}
          >
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.ayurvedicHospitals")} />
            )}
          </FieldWrapper>
          <FieldWrapper
            name="institutionCounts.specialistServiceCenters"
            label={{ en: "Number of Institutions Providing Specialist Medical Services (Wellness Center)", si: "විශේෂඥ වෛද්‍ය සේවා ලබාගතහැකි ආයතන සංඛ්‍යාව (චැනලින් සෙන්ටර්)" }}
          >
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.specialistServiceCenters")} />
            )}
          </FieldWrapper>
          <FieldWrapper
            name="institutionCounts.mohOfficesOrCommunityHealthCenters"
            label={{ en: "MOH Offices / Village Health Centers", si: "සෞඛ්‍ය වෛද්‍ය නිලධාරි කාර්යාල/ ග්‍රාමෝදය සෞඛ්‍ය මධ්‍යස්ථාන" }}
          >
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.mohOfficesOrCommunityHealthCenters")} />
            )}
          </FieldWrapper>
          <FieldWrapper
            name="institutionCounts.traditionalMedicineRegisteredInstitutions"
            label={{ en: "Registered Institutions Practicing Traditional Sinhala Medicine", si: "පාරම්පරික සිංහල වෙදකම සිදු කරන ලියාපදිංචි ආයතන" }}
          >
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.traditionalMedicineRegisteredInstitutions")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="institutionCounts.privateMedicalLabs" label={{ en: "Private Medical Clinic Centers", si: "පෞද්ගලික වෛද්‍ය සායන මධ්‍යස්ථාන" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.privateMedicalLabs")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="institutionCounts.animalClinicCenters" label={{ en: "Animal Clinic Centers", si: "සත්ත්ව සායන මධ්‍යස්ථාන" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.animalClinicCenters")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="institutionCounts.govtPharmacies" label={{ en: "Government Pharmacies", si: "රාජ්‍ය ඖෂධශල" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("institutionCounts.govtPharmacies")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="institutionCounts.privatePharmacies" label={{ en: "Private Pharmacies", si: "පෞද්ගලික ෆාමසි" }}>
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
          emptyRowFactory={() => ({ name: "", type: "primary" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="primaryHealthcareUnitsDirectory"
          title={healthDict.fields.primaryHealthcareUnitsDirectory}
          columns={primaryHealthcareUnitColumns}
          emptyRowFactory={() => ({ name: "", type: "" })}
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
          columns={nameAddressColumns}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="specialistServiceCentersDirectory"
          title={healthDict.fields.specialistServiceCentersDirectory}
          columns={nameAddressColumns}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="mohOfficesDirectory"
          title={healthDict.fields.mohOfficesDirectory}
          columns={nameAddressColumns}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="traditionalMedicineInstitutionsDirectory"
          title={healthDict.fields.traditionalMedicineInstitutionsDirectory}
          columns={nameAddressColumns}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="privateMedicalLabsDirectory"
          title={healthDict.fields.privateMedicalLabsDirectory}
          columns={nameAddressColumns}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="animalClinicsDirectory"
          title={healthDict.fields.animalClinicsDirectory}
          columns={nameAddressColumns}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="traditionalPractitioners"
          title={healthDict.fields.traditionalPractitioners}
          columns={traditionalPractitionerColumns}
          emptyRowFactory={() => ({ name: "", specialty: "" })}
        />
      </div>
    </SectionForm>
  );
}
