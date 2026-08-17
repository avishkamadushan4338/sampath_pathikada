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
import { housingSchemaPartial, COMMUNITY_WATER_AUTHORITIES } from "@/lib/validators/sections/housing";
import { cn } from "@/lib/utils";

const CURRENT_YEAR = 2026;

type HousingDraft = z.infer<typeof housingSchemaPartial>;

const YES_NO_OPTIONS = [
  { value: "yes", label: { en: "Yes", si: "ඔව්" } },
  { value: "no", label: { en: "No", si: "නැත" } },
];

const COMMUNITY_WATER_AUTHORITY_LABELS: Record<(typeof COMMUNITY_WATER_AUTHORITIES)[number], { en: string; si: string }> = {
  "main-ministry": { en: "Main Ministry", si: "ප්‍රධාන අමාත්‍යාංශය" },
  "agri-ministry": { en: "Agriculture Ministry", si: "කෘෂිකර්ම අමාත්‍යාංශය" },
  private: { en: "Private", si: "පුද්ගලික අංශය" },
};

// Every count here starts blank (not 0) so the officer must explicitly type a value — even
// "0" — for each one; a pre-filled 0 would never trigger the "required" validation, since 0 is
// already a legitimate answer. `as never` mirrors the same cast used in demographics/page.tsx —
// the runtime shape is a string here, not the post-parse `number` the Zod-inferred HousingDraft
// type declares for these fields.
const EMPTY_VALUES: HousingDraft = {
  housingCounts: { total: "", permanent: "", semiPermanent: "", nonPermanent: "" },
  householdsWithoutHousing: "",
  sanitation: { total: "", withoutSafeSanitation: "", needingAssistance: "" },
  drinkingWaterSource: {
    well: "",
    tubeWell: "",
    spring: "",
    pipedNational: "",
    pipedLocalGovt: "",
    pipedCommunity: "",
    tankRiverCanalOther: "",
    bottled: "",
    treated: "",
    bowser: "",
    other: "",
  },
  underservedAreas: [],
  electricityAccess: { total: "", withElectricity: "", withSolar: "", withoutElectricity: "", needingAssistance: "" },
  communityWaterProjects: [],
} as never as HousingDraft;

const underservedAreaColumns: RepeatableColumn[] = [
  { key: "area", label: { en: "Area with Difficulty", si: "දුෂ්කරතා සහිත ප්‍රදේශ" }, type: "text", required: true },
  { key: "difficultyDescription", label: { en: "The Difficulty", si: "දුෂ්කරතාවය" }, type: "text", required: true },
  { key: "households", label: { en: "Number of Families", si: "පවුල් සංඛ්‍යාව" }, type: "number", required: true },
  { key: "proposal", label: { en: "Proposed Remedy", si: "දුෂ්කරතාවයට යෝජනා කරන පිළියම" }, type: "text", required: true },
];

const communityWaterProjectColumns: RepeatableColumn[] = [
  { key: "name", label: { en: "Name of the Water Project", si: "ජල ව්‍යාපෘතියේ නම" }, type: "text", required: true },
  {
    key: "functional",
    label: { en: "Is It Operational? (Yes/No)", si: "ක්‍රියාත්මක තත්ත්වයේ ඇත/නැත" },
    type: "select",
    options: YES_NO_OPTIONS,
    required: true,
  },
  { key: "householdsServed", label: { en: "Number of Families Benefiting", si: "පහසුකම් ලබාගන්නා පවුල් සංඛ්‍යාව" }, type: "number", required: true },
  {
    key: "authority",
    label: { en: "Ownership", si: "අයිතිය" },
    type: "select",
    required: true,
    options: COMMUNITY_WATER_AUTHORITIES.map((a) => ({ value: a, label: COMMUNITY_WATER_AUTHORITY_LABELS[a] })),
  },
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
      sectionNumber={5}
      title={housingDict.title}
      description={housingDict.description}
      form={form}
      saveStatus={status}
      saveErrorMessage={errorMessage}
      onSaveDraft={handleSave}
      submission={submission}
      sectionKey="housing"
    >
      <div>
        <h2 lang={lang} className={cn("mb-3 text-fluid-lg font-semibold text-foreground", lang === "si" && "font-si-heading")}>
          {lang === "si" ? housingDict.fields.housingCounts.si : housingDict.fields.housingCounts.en}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="housingCounts.total" label={{ en: "Total Housing Count", si: "මුළු නිවාස සංඛ්‍යාව" }} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("housingCounts.total")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="housingCounts.permanent" label={{ en: "Permanent Housing Count", si: "ස්ථීර නිවාස සංඛ්‍යාව" }} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("housingCounts.permanent")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="housingCounts.semiPermanent" label={{ en: "Semi-Permanent Housing Count", si: "අර්ධ ස්ථීර නිවාස සංඛ්‍යාව" }} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("housingCounts.semiPermanent")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="housingCounts.nonPermanent" label={{ en: "Non-Permanent Housing Count", si: "අස්ථීර නිවාස සංඛ්‍යාව" }} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("housingCounts.nonPermanent")} />
            )}
          </FieldWrapper>
        </div>
        {(lang === "si" ? housingDict.fields.housingCounts.helpSi : housingDict.fields.housingCounts.helpEn) && (
          <p lang={lang} className={cn("mt-3 whitespace-pre-line text-fluid-xs text-muted-foreground", lang === "si" && "font-si")}>
            {lang === "si" ? housingDict.fields.housingCounts.helpSi : housingDict.fields.housingCounts.helpEn}
          </p>
        )}
      </div>

      <div className="border-t border-border pt-6">
        <h2 lang={lang} className={cn("mb-3 text-fluid-lg font-semibold text-foreground", lang === "si" && "font-si-heading")}>
          {lang === "si" ? housingDict.fields.householdsWithoutHousing.si : housingDict.fields.householdsWithoutHousing.en}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="housingCounts.totalRef" label={{ en: "Total Housing Count", si: "මුළු නිවාස සංඛ්‍යාව" }}>
            {({ id }) => <Input id={id} readOnly disabled value={Number(form.watch("housingCounts.total")) || 0} className="nums-tabular" />}
          </FieldWrapper>
          <FieldWrapper name="householdsWithoutHousing" label={{ en: "Count", si: "ගණන" }} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("householdsWithoutHousing")} />
            )}
          </FieldWrapper>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h2 lang={lang} className={cn("mb-3 text-fluid-lg font-semibold text-foreground", lang === "si" && "font-si-heading")}>
          {lang === "si" ? housingDict.fields.sanitation.si : housingDict.fields.sanitation.en}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="sanitation.total" label={{ en: "Total Housing Count", si: "මුළු නිවාස සංඛ්‍යාව" }} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("sanitation.total")} />
            )}
          </FieldWrapper>
          <FieldWrapper
            name="sanitation.withoutSafeSanitation"
            label={{ en: "Houses Without Hygienic Toilet Facilities", si: "සෞඛ්‍යාරක්ෂිත වැසිකිලි පහසුකම් නොමැති නිවාස සංඛ්‍යාව" }}
            required
          >
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("sanitation.withoutSafeSanitation")} />
            )}
          </FieldWrapper>
          <FieldWrapper
            name="sanitation.needingAssistance"
            label={{ en: "Houses That Should Be Given Toilet Assistance", si: "වැසිකිලි ආධාර ලබාදිය යුතු නිවාස සංඛ්‍යාව" }}
            required
          >
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

        <p lang={lang} className={cn("mb-2 text-fluid-sm font-medium text-muted-foreground", lang === "si" && "font-si")}>
          {lang === "si" ? "*භූගත ජලය" : "* Groundwater"}
        </p>
        <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="drinkingWaterSource.well" label={{ en: "Well", si: "ළිඳ" }} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("drinkingWaterSource.well")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="drinkingWaterSource.tubeWell" label={{ en: "Tube Well", si: "නල ළිඳ" }} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("drinkingWaterSource.tubeWell")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="drinkingWaterSource.spring" label={{ en: "Bubble / Spring", si: "බුබුළු/උල්පත" }} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("drinkingWaterSource.spring")} />
            )}
          </FieldWrapper>
        </div>

        <p lang={lang} className={cn("mb-2 text-fluid-sm font-medium text-muted-foreground", lang === "si" && "font-si")}>
          {lang === "si" ? "**නල ජලය" : "** Piped Water"}
        </p>
        <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="drinkingWaterSource.pipedNational" label={{ en: "National Water Supply Board", si: "ජාතික ජල සම්පාදන මණ්ඩලය" }} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("drinkingWaterSource.pipedNational")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="drinkingWaterSource.pipedLocalGovt" label={{ en: "Provincial Water Board Institutions", si: "පළාත් ජල පාලන ආයතන" }} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("drinkingWaterSource.pipedLocalGovt")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="drinkingWaterSource.pipedCommunity" label={{ en: "Community-Based Organizations", si: "ප්‍රජාමූල සංවිධාන" }} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("drinkingWaterSource.pipedCommunity")} />
            )}
          </FieldWrapper>
        </div>

        <p lang={lang} className={cn("mb-2 text-fluid-sm font-medium text-muted-foreground", lang === "si" && "font-si")}>
          {lang === "si" ? "***අනෙකුත්" : "*** Other"}
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="drinkingWaterSource.tankRiverCanalOther" label={{ en: "Tank / River / Canal / Stream / Other", si: "වැව්/ගංගා/ඇල/දොළ/වෙනත්" }} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("drinkingWaterSource.tankRiverCanalOther")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="drinkingWaterSource.bottled" label={{ en: "Bottled Water", si: "බෝතල් කළ ජලය" }} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("drinkingWaterSource.bottled")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="drinkingWaterSource.treated" label={{ en: "Associated / Treated Water", si: "ප්‍රති ආශ්‍රිත ජලය" }} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("drinkingWaterSource.treated")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="drinkingWaterSource.bowser" label={{ en: "Bowser", si: "බවුසර්" }} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("drinkingWaterSource.bowser")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="drinkingWaterSource.other" label={{ en: "Other", si: "වෙනත්" }} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("drinkingWaterSource.other")} />
            )}
          </FieldWrapper>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="underservedAreas"
          title={housingDict.fields.underservedAreas}
          columns={underservedAreaColumns}
          emptyRowFactory={() => ({ area: "", difficultyDescription: "", households: "", proposal: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <h2 lang={lang} className={cn("mb-3 text-fluid-lg font-semibold text-foreground", lang === "si" && "font-si-heading")}>
          {lang === "si" ? housingDict.fields.electricityAccess.si : housingDict.fields.electricityAccess.en}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="electricityAccess.total" label={{ en: "Total Housing Count", si: "මුළු නිවාස සංඛ්‍යාව" }} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("electricityAccess.total")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="electricityAccess.withElectricity" label={{ en: "With Electricity Facility", si: "විදුලිබල පහසුකම් සහිත" }} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("electricityAccess.withElectricity")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="electricityAccess.withSolar" label={{ en: "With Solar Power", si: "සූර්ය බල ශක්තිය සහිත" }} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("electricityAccess.withSolar")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="electricityAccess.withoutElectricity" label={{ en: "Without Electricity Facility", si: "විදුලිබල පහසුකම් නොමැති" }} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("electricityAccess.withoutElectricity")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="electricityAccess.needingAssistance" label={{ en: "Should Be Given Electricity Assistance", si: "විදුලි ආධාර ලබාදිය යුතු" }} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("electricityAccess.needingAssistance")} />
            )}
          </FieldWrapper>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="communityWaterProjects"
          title={housingDict.fields.communityWaterProjects}
          columns={communityWaterProjectColumns}
          emptyRowFactory={() => ({ name: "", functional: "yes", householdsServed: "", authority: "main-ministry" })}
        />
      </div>
    </SectionForm>
  );
}
