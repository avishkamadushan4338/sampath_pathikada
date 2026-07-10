"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { SectionForm } from "@/components/forms/SectionForm";
import { FieldWrapper } from "@/components/forms/FormField";
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
      // Pre-fill from the details the officer already submitted at registration —
      // they remain free to edit any of these before saving.
      const gn = GN_DIVISIONS.find((g) => g.id === user.gnDivision);
      form.reset({
        ...EMPTY_VALUES,
        gnDivisionName: gn ? (lang === "si" ? gn.si : gn.en) : "",
        gnDivisionNumber: user.gnDivision ?? "",
        officerName: user.name ?? "",
        officerPhone: user.phone ?? "",
        district: user.district ?? "",
        dsDivision: user.dsDivision ?? "",
        gnDivision: user.gnDivision ?? "",
        localGovt: user.localGovt ?? "",
        electoral: user.electoral ?? "",
        farmers: user.farmers ?? "",
        eduZone: user.eduZone ?? "",
        eduDiv: user.eduDiv ?? "",
        mahaweli: user.mahaweli ?? "",
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
            <Input id={id} disabled aria-describedby={describedBy} aria-invalid={invalid} {...form.register("gnDivisionName")} />
          )}
        </FieldWrapper>

        <FieldWrapper name="gnDivisionNumber" label={identificationDict.fields.gnDivisionNumber} required>
          {({ id, describedBy, invalid }) => (
            <Input id={id} disabled aria-describedby={describedBy} aria-invalid={invalid} {...form.register("gnDivisionNumber")} />
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

      <p className="text-fluid-xs text-muted-foreground">
        {lang === "si"
          ? "මෙම විස්තර ලියාපදිංචි වීමේදී ලබා දී ඇති අතර, ඒවා වෙනස් කළ හැක්කේ පරිපාලකවරයෙකු විසින් පමණි."
          : "These details were provided at registration and can only be changed by an administrator."}
      </p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 border-t border-border pt-6">
        <FieldWrapper name="district" label={identificationDict.fields.district} required>
          {({ id, describedBy, invalid }) => (
            <Select value={form.watch("district") ?? ""} onValueChange={() => {}} disabled>
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
            <Select value={form.watch("dsDivision") ?? ""} onValueChange={() => {}} disabled>
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
            <Select value={form.watch("gnDivision") ?? ""} onValueChange={() => {}} disabled>
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

        <FieldWrapper name="localGovt" label={identificationDict.fields.localGovt} required>
          {({ id, describedBy, invalid }) => (
            <Input id={id} disabled aria-describedby={describedBy} aria-invalid={invalid} {...form.register("localGovt")} />
          )}
        </FieldWrapper>

        <FieldWrapper name="electoral" label={identificationDict.fields.electoral} required>
          {({ id, describedBy, invalid }) => (
            <Input id={id} disabled aria-describedby={describedBy} aria-invalid={invalid} {...form.register("electoral")} />
          )}
        </FieldWrapper>

        <FieldWrapper name="farmers" label={identificationDict.fields.farmers} required>
          {({ id, describedBy, invalid }) => (
            <Input id={id} disabled aria-describedby={describedBy} aria-invalid={invalid} {...form.register("farmers")} />
          )}
        </FieldWrapper>

        <FieldWrapper name="eduZone" label={identificationDict.fields.eduZone} required>
          {({ id, describedBy, invalid }) => (
            <Input id={id} disabled aria-describedby={describedBy} aria-invalid={invalid} {...form.register("eduZone")} />
          )}
        </FieldWrapper>

        <FieldWrapper name="eduDiv" label={identificationDict.fields.eduDiv} required>
          {({ id, describedBy, invalid }) => (
            <Input id={id} disabled aria-describedby={describedBy} aria-invalid={invalid} {...form.register("eduDiv")} />
          )}
        </FieldWrapper>

        {selectedDistrict === "hambantota" && (
          <LookupField
            name="mahaweli"
            label={identificationDict.fields.mahaweli}
            items={MAHAWELI_DIVISIONS}
            form={form}
            lang={lang}
          />
        )}
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
}: {
  name: "mahaweli";
  label: { en: string; si: string };
  items: { id: string; en: string; si: string }[];
  form: ReturnType<typeof useForm<IdentificationDraft>>;
  lang: "en" | "si";
}) {
  return (
    <FieldWrapper name={name} label={label}>
      {({ id, describedBy, invalid }) => (
        <Select value={form.watch(name) ?? ""} onValueChange={() => {}} disabled>
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
