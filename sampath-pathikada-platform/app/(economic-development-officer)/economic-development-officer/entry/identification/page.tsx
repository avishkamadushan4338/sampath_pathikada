"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { SectionForm } from "@/components/forms/SectionForm";
import { FieldWrapper } from "@/components/forms/FormField";
import { RepeatableTable, type RepeatableColumn } from "@/components/forms/RepeatableTable";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubmission, useSaveSection } from "@/hooks/use-submission";
import { useSession } from "@/hooks/use-session";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { identificationDict } from "@/lib/i18n/sections/identification";
import {
  identificationSchemaPartial,
  type IdentificationDraft,
} from "@/lib/validators/sections/identification";
import {
  DISTRICTS,
  DIVISIONAL_SECRETARIATS,
  GN_DIVISIONS,
  LOCAL_GOVT_BODIES,
  ELECTORAL_CONSTITUENCIES,
  FARMERS_SERVICE_CENTERS,
  EDUCATION_ZONES,
  EDUCATION_DIVISIONS,
  MAHAWELI_DIVISIONS,
} from "@/lib/registration-data";

const CURRENT_YEAR = 2026;

const EMPTY_VALUES: IdentificationDraft = {
  gnDivisionName: "",
  gnDivisionNumber: "",
  officerName: "",
  officerDesignation: "",
  officerPhone: "",
  district: "",
  dsDivision: "",
  gnDivision: "",
  localGovt: "",
  electoral: "",
  farmers: "",
  eduZone: "",
  eduDiv: "",
  mahaweli: "",
  stateInstitutions: [],
  illegalStructures: [],
  developmentProjects: [],
};

export default function IdentificationPage() {
  const { lang } = useLanguage();
  const { user } = useSession();
  const { submission, isLoading } = useSubmission(CURRENT_YEAR);
  const { saveSection, status, errorMessage } = useSaveSection(CURRENT_YEAR);

  const form = useForm<IdentificationDraft>({
    resolver: zodResolver(identificationSchemaPartial),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (submission?.data.identification) {
      form.reset({ ...EMPTY_VALUES, ...submission.data.identification });
    } else if (user) {
      form.reset({
        ...EMPTY_VALUES,
        district: user.district ?? "",
        dsDivision: user.dsDivision ?? "",
        gnDivision: user.gnDivision ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission, user]);

  const selectedDistrict = form.watch("district");
  const selectedDs = form.watch("dsDivision");

  const filteredDs = useMemo(
    () => DIVISIONAL_SECRETARIATS.filter((d) => d.districtId === selectedDistrict),
    [selectedDistrict]
  );
  const filteredGns = useMemo(
    () => GN_DIVISIONS.filter((g) => g.dsId === selectedDs),
    [selectedDs]
  );

  async function handleSave(values: IdentificationDraft) {
    await saveSection("identification", values);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  const stateInstitutionColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Institution Name", si: "ආයතනයේ නම" }, type: "text" },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
  ];

  const illegalStructureColumns: RepeatableColumn[] = [
    { key: "description", label: { en: "Description", si: "විස්තරය" }, type: "text" },
    { key: "location", label: { en: "Location", si: "ස්ථානය" }, type: "text" },
  ];

  const developmentProjectColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Project Name", si: "ව්‍යාපෘතියේ නම" }, type: "text" },
    {
      key: "status",
      label: { en: "Status", si: "තත්ත්වය" },
      type: "select",
      options: [
        { value: "ongoing", label: { en: "Ongoing", si: "ක්‍රියාත්මක" } },
        { value: "new", label: { en: "New", si: "නව" } },
      ],
    },
    { key: "location", label: { en: "Location", si: "ස්ථානය" }, type: "text" },
  ];

  return (
    <SectionForm
      sectionNumber={1}
      title={identificationDict.title}
      description={identificationDict.description}
      form={form}
      saveStatus={status}
      saveErrorMessage={errorMessage}
      onSaveDraft={handleSave}
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
        <FieldWrapper name="gnDivisionName" label={identificationDict.fields.gnDivisionName} required>
          {({ id, describedBy, invalid }) => (
            <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} {...form.register("gnDivisionName")} />
          )}
        </FieldWrapper>

        <FieldWrapper name="gnDivisionNumber" label={identificationDict.fields.gnDivisionNumber} required>
          {({ id, describedBy, invalid }) => (
            <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} {...form.register("gnDivisionNumber")} />
          )}
        </FieldWrapper>

        <FieldWrapper name="officerName" label={identificationDict.fields.officerName} required>
          {({ id, describedBy, invalid }) => (
            <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} {...form.register("officerName")} />
          )}
        </FieldWrapper>

        <FieldWrapper name="officerDesignation" label={identificationDict.fields.officerDesignation} required>
          {({ id, describedBy, invalid }) => (
            <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} {...form.register("officerDesignation")} />
          )}
        </FieldWrapper>

        <FieldWrapper name="officerPhone" label={identificationDict.fields.officerPhone} required>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="tel"
              inputMode="tel"
              placeholder="0771234567"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              {...form.register("officerPhone")}
            />
          )}
        </FieldWrapper>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 border-t border-border pt-6">
        <FieldWrapper name="district" label={identificationDict.fields.district} required>
          {({ id, describedBy, invalid }) => (
            <Select
              value={form.watch("district") ?? ""}
              onValueChange={(v) => {
                form.setValue("district", v, { shouldDirty: true });
                form.setValue("dsDivision", "");
                form.setValue("gnDivision", "");
              }}
            >
              <SelectTrigger id={id} aria-describedby={describedBy} aria-invalid={invalid}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISTRICTS.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {lang === "si" ? d.si : d.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FieldWrapper>

        <FieldWrapper name="dsDivision" label={identificationDict.fields.dsDivision} required>
          {({ id, describedBy, invalid }) => (
            <Select
              value={form.watch("dsDivision") ?? ""}
              onValueChange={(v) => {
                form.setValue("dsDivision", v, { shouldDirty: true });
                form.setValue("gnDivision", "");
              }}
              disabled={!selectedDistrict}
            >
              <SelectTrigger id={id} aria-describedby={describedBy} aria-invalid={invalid}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filteredDs.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {lang === "si" ? d.si : d.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FieldWrapper>

        <FieldWrapper name="gnDivision" label={identificationDict.fields.gnDivision} required>
          {({ id, describedBy, invalid }) => (
            <Select
              value={form.watch("gnDivision") ?? ""}
              onValueChange={(v) => form.setValue("gnDivision", v, { shouldDirty: true })}
              disabled={!selectedDs}
            >
              <SelectTrigger id={id} aria-describedby={describedBy} aria-invalid={invalid}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filteredGns.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {lang === "si" ? g.si : g.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FieldWrapper>

        <LookupField
          name="localGovt"
          label={identificationDict.fields.localGovt}
          items={LOCAL_GOVT_BODIES}
          form={form}
          lang={lang}
          required
        />
        <LookupField
          name="electoral"
          label={identificationDict.fields.electoral}
          items={ELECTORAL_CONSTITUENCIES}
          form={form}
          lang={lang}
          required
        />
        <LookupField
          name="farmers"
          label={identificationDict.fields.farmers}
          items={FARMERS_SERVICE_CENTERS}
          form={form}
          lang={lang}
          required
        />
        <LookupField
          name="eduZone"
          label={identificationDict.fields.eduZone}
          items={EDUCATION_ZONES}
          form={form}
          lang={lang}
          required
        />
        <LookupField
          name="eduDiv"
          label={identificationDict.fields.eduDiv}
          items={EDUCATION_DIVISIONS}
          form={form}
          lang={lang}
          required
        />
        <LookupField
          name="mahaweli"
          label={identificationDict.fields.mahaweli}
          items={MAHAWELI_DIVISIONS}
          form={form}
          lang={lang}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="stateInstitutions"
          title={identificationDict.fields.stateInstitutions}
          columns={stateInstitutionColumns}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="illegalStructures"
          title={identificationDict.fields.illegalStructures}
          columns={illegalStructureColumns}
          emptyRowFactory={() => ({ description: "", location: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="developmentProjects"
          title={identificationDict.fields.developmentProjects}
          columns={developmentProjectColumns}
          emptyRowFactory={() => ({ name: "", status: "ongoing", location: "" })}
        />
      </div>
    </SectionForm>
  );
}

function LookupField({
  name,
  label,
  items,
  form,
  lang,
  required,
}: {
  name: "localGovt" | "electoral" | "farmers" | "eduZone" | "eduDiv" | "mahaweli";
  label: { en: string; si: string };
  items: { id: string; en: string; si: string }[];
  form: ReturnType<typeof useForm<IdentificationDraft>>;
  lang: "en" | "si";
  required?: boolean;
}) {
  return (
    <FieldWrapper name={name} label={label} required={required}>
      {({ id, describedBy, invalid }) => (
        <Select
          value={form.watch(name) ?? ""}
          onValueChange={(v) => form.setValue(name, v, { shouldDirty: true })}
        >
          <SelectTrigger id={id} aria-describedby={describedBy} aria-invalid={invalid}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {lang === "si" ? item.si : item.en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FieldWrapper>
  );
}
