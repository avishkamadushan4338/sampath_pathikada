"use client";

import { useEffect } from "react";
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
import { housingDict } from "@/lib/i18n/sections/housing";
import { housingSchemaPartial } from "@/lib/validators/sections/housing";
import { cn } from "@/lib/utils";

const CURRENT_YEAR = 2026;

type HousingDraft = z.infer<typeof housingSchemaPartial>;

const EMPTY_VALUES: HousingDraft = {
  housingCounts: { total: 0, permanent: 0, semiPermanent: 0, nonPermanent: 0 },
  householdsWithoutHousing: 0,
  sanitation: { total: 0, withoutSafeSanitation: 0, needingAssistance: 0 },
  drinkingWaterSource: {
    pipedNational: 0,
    pipedRural: 0,
    protectedWell: 0,
    unprotectedWell: 0,
    tubeWell: 0,
    riverCanalTank: 0,
    bottledOther: 0,
  },
  underservedAreas: [],
  electricityAccessPercent: 0,
  communityWaterProjects: [],
};

const underservedAreaColumns: RepeatableColumn[] = [
  { key: "area", label: { en: "Area Name", si: "ප්‍රදේශයේ නම" }, type: "text" },
  { key: "households", label: { en: "Households", si: "ගෘහ ඒකක" }, type: "number" },
  { key: "proposal", label: { en: "Proposal", si: "යෝජනාව" }, type: "text" },
];

const communityWaterProjectColumns: RepeatableColumn[] = [
  { key: "name", label: { en: "Project Name", si: "ව්‍යාපෘතියේ නම" }, type: "text" },
  { key: "status", label: { en: "Status", si: "තත්ත්වය" }, type: "text" },
  { key: "householdsServed", label: { en: "Households Served", si: "සේවා ලබන ගෘහ ඒකක" }, type: "number" },
  { key: "authority", label: { en: "Authority", si: "අධිකාරිය" }, type: "text" },
];

export default function HousingPage() {
  const { lang } = useLanguage();
  const { submission, isLoading } = useSubmission(CURRENT_YEAR);
  const { saveSection, status, errorMessage } = useSaveSection(CURRENT_YEAR);

  const form = useForm<HousingDraft>({
    resolver: zodResolver(housingSchemaPartial),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (submission?.data.housing) {
      form.reset({ ...EMPTY_VALUES, ...submission.data.housing });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission]);

  async function handleSave(values: HousingDraft) {
    await saveSection("housing", values);
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
      sectionNumber={4}
      title={housingDict.title}
      description={housingDict.description}
      form={form}
      saveStatus={status}
      saveErrorMessage={errorMessage}
      onSaveDraft={handleSave}
    >
      <div>
        <h2 lang={lang} className={cn("mb-3 text-fluid-lg font-semibold text-foreground", lang === "si" && "font-si-heading")}>
          {lang === "si" ? housingDict.fields.housingCounts.si : housingDict.fields.housingCounts.en}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="housingCounts.total" label={{ en: "Total Houses", si: "මුළු නිවාස ගණන" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("housingCounts.total")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="housingCounts.permanent" label={{ en: "Permanent", si: "ස්ථිර" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("housingCounts.permanent")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="housingCounts.semiPermanent" label={{ en: "Semi-Permanent", si: "අර්ධ ස්ථිර" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("housingCounts.semiPermanent")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="housingCounts.nonPermanent" label={{ en: "Non-Permanent", si: "අස්ථිර" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("housingCounts.nonPermanent")} />
            )}
          </FieldWrapper>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 border-t border-border pt-6">
        <FieldWrapper name="householdsWithoutHousing" label={housingDict.fields.householdsWithoutHousing}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("householdsWithoutHousing")} />
          )}
        </FieldWrapper>
      </div>

      <div className="border-t border-border pt-6">
        <h2 lang={lang} className={cn("mb-3 text-fluid-lg font-semibold text-foreground", lang === "si" && "font-si-heading")}>
          {lang === "si" ? housingDict.fields.sanitation.si : housingDict.fields.sanitation.en}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="sanitation.total" label={{ en: "Total Households", si: "මුළු ගෘහ ඒකක" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("sanitation.total")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="sanitation.withoutSafeSanitation" label={{ en: "Without Safe Sanitation", si: "ආරක්ෂිත සනීපාරක්ෂාව නොමැති" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("sanitation.withoutSafeSanitation")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="sanitation.needingAssistance" label={{ en: "Needing Assistance", si: "සහාය අවශ්‍ය" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("sanitation.needingAssistance")} />
            )}
          </FieldWrapper>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h2 lang={lang} className={cn("mb-3 text-fluid-lg font-semibold text-foreground", lang === "si" && "font-si-heading")}>
          {lang === "si" ? housingDict.fields.drinkingWaterSource.si : housingDict.fields.drinkingWaterSource.en}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="drinkingWaterSource.pipedNational" label={{ en: "Piped - National Water Supply", si: "නල ජලය - ජාතික" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("drinkingWaterSource.pipedNational")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="drinkingWaterSource.pipedRural" label={{ en: "Piped - Rural Water Supply", si: "නල ජලය - ග්‍රාමීය" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("drinkingWaterSource.pipedRural")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="drinkingWaterSource.protectedWell" label={{ en: "Protected Well", si: "ආරක්ෂිත ලිඳ" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("drinkingWaterSource.protectedWell")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="drinkingWaterSource.unprotectedWell" label={{ en: "Unprotected Well", si: "අනාරක්ෂිත ලිඳ" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("drinkingWaterSource.unprotectedWell")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="drinkingWaterSource.tubeWell" label={{ en: "Tube Well", si: "නළ ලිඳ" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("drinkingWaterSource.tubeWell")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="drinkingWaterSource.riverCanalTank" label={{ en: "River / Canal / Tank", si: "ගඟ/ඇළ/වැව්" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("drinkingWaterSource.riverCanalTank")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="drinkingWaterSource.bottledOther" label={{ en: "Bottled / Other", si: "බෝතල් ජලය/වෙනත්" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("drinkingWaterSource.bottledOther")} />
            )}
          </FieldWrapper>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="underservedAreas"
          title={housingDict.fields.underservedAreas}
          columns={underservedAreaColumns}
          emptyRowFactory={() => ({ area: "", households: 0, proposal: "" })}
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 border-t border-border pt-6">
        <FieldWrapper name="electricityAccessPercent" label={housingDict.fields.electricityAccessPercent}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="number"
              min={0}
              max={100}
              inputMode="numeric"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              {...form.register("electricityAccessPercent")}
            />
          )}
        </FieldWrapper>
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="communityWaterProjects"
          title={housingDict.fields.communityWaterProjects}
          columns={communityWaterProjectColumns}
          emptyRowFactory={() => ({ name: "", status: "", householdsServed: 0, authority: "" })}
        />
      </div>
    </SectionForm>
  );
}
