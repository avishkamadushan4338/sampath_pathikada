"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { SectionForm } from "@/components/forms/SectionForm";
import { FieldWrapper } from "@/components/forms/FormField";
import { RepeatableTable, type RepeatableColumn } from "@/components/forms/RepeatableTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubmission, useSaveSection } from "@/hooks/use-submission";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { physicalEnvironmentDict } from "@/lib/i18n/sections/physical-environment";
import { physicalEnvironmentSchemaPartial, HAZARD_TYPES } from "@/lib/validators/sections/physical-environment";
import { z } from "zod";

const CURRENT_YEAR = 2026;

type PhysicalEnvironmentDraft = z.infer<typeof physicalEnvironmentSchemaPartial>;

const YES_NO_OPTIONS = [
  { value: "yes", label: { en: "Yes", si: "ඔව්" } },
  { value: "no", label: { en: "No", si: "නැත" } },
];

const HAZARD_TYPE_LABELS: Record<(typeof HAZARD_TYPES)[number], { en: string; si: string }> = {
  flood: { en: "Flood", si: "ගංවතුර" },
  drought: { en: "Drought", si: "නියඟය" },
  landslide: { en: "Landslide", si: "නායයෑම" },
  deforestation: { en: "Deforestation", si: "වන විනාශය" },
  waterSourceDepletion: { en: "Water Source Depletion", si: "ජල මූලාශ්‍ර සිඳී යාම" },
  unauthorizedLandFilling: { en: "Unauthorized Land-Filling / Construction", si: "අනුමැතියක් නොමැතිව බිම් ගොඩ කිරීම හා ඉදිකිරීම" },
  unauthorizedWasteDisposal: { en: "Unauthorized Waste Disposal", si: "කැළිකසළ බැහැර කිරීම (අනුමැතියක් රහිතව)" },
  wildElephantConflict: { en: "Wild Elephant Conflict", si: "වන අලි ගැටළුව" },
  coastalErosion: { en: "Coastal Erosion", si: "වෙරළ ඛාදනය" },
  illegalSandMining: { en: "Illegal Sand Mining / Dumping", si: "අනවසර වැලි ගොඩදැමීම" },
};

function buildEmptyValues(lang: "en" | "si"): PhysicalEnvironmentDraft {
  return {
    waterSources: [],
    sensitiveZones: [],
    naturalResources: [],
    hazards: HAZARD_TYPES.map((type) => ({
      type,
      typeLabel: HAZARD_TYPE_LABELS[type][lang],
      occurred: "no",
      frequency: "",
      mitigationProposal: "",
    })),
    safeLocationsIdentified: "no",
    safeLocations: [],
    touristSites: [],
    proposedTouristSites: [],
  };
}

function mergeWithSaved(empty: PhysicalEnvironmentDraft, saved: PhysicalEnvironmentDraft): PhysicalEnvironmentDraft {
  return {
    ...empty,
    ...saved,
    hazards: empty.hazards?.map((row, i) => ({ ...row, ...saved.hazards?.[i] })),
  };
}

const waterSourceColumns: RepeatableColumn[] = [
  { key: "type", label: { en: "Type", si: "වර්ගය" }, type: "text" },
  { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
];

const sensitiveZoneColumns: RepeatableColumn[] = [
  { key: "zoneName", label: { en: "Zone / Area Name", si: "කලාපයේ/ප්‍රදේශයේ නම" }, type: "text" },
  { key: "significance", label: { en: "Significance", si: "වැදගත්කම" }, type: "text" },
  { key: "managingAuthority", label: { en: "Managing Authority", si: "කළමනාකරණ අධිකාරිය" }, type: "text" },
];

const naturalResourceColumns: RepeatableColumn[] = [
  { key: "resource", label: { en: "Resource", si: "සම්පත" }, type: "text" },
  {
    key: "utilizedForProduction",
    label: { en: "Used for Production/Development?", si: "නිෂ්පාදනයට/සංවර්ධනයට යොදාගෙන තිබේද" },
    type: "select",
    options: YES_NO_OPTIONS,
  },
  { key: "notes", label: { en: "Notes", si: "සටහන්" }, type: "text" },
];

const hazardColumns: RepeatableColumn[] = [
  { key: "typeLabel", label: { en: "Hazard Type", si: "ආපදා වර්ගය" }, type: "readonly" },
  {
    key: "occurred",
    label: { en: "Occurred?", si: "ඇත/නැත" },
    type: "select",
    options: YES_NO_OPTIONS,
  },
  { key: "frequency", label: { en: "Frequency / Period", si: "බහුලව සිදුවන කාල සීමාව" }, type: "text" },
  { key: "mitigationProposal", label: { en: "Proposed Remedy", si: "ගතයුතු පිළියම් යෝජනා" }, type: "text" },
];

const safeLocationColumns: RepeatableColumn[] = [
  { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
  { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
];

const touristSiteColumns: RepeatableColumn[] = [
  { key: "siteName", label: { en: "Site Name", si: "ස්ථානයේ නම" }, type: "text" },
  { key: "reasonForAttraction", label: { en: "Reason for Attraction", si: "ආකර්ෂණයට හේතුව" }, type: "text" },
  { key: "maintainedBy", label: { en: "Maintained By", si: "නඩත්තු කරන්නා" }, type: "text" },
  {
    key: "frequency",
    label: { en: "Frequency", si: "සංඛ්‍යාතය" },
    type: "select",
    options: [
      { value: "seasonal", label: { en: "Seasonal", si: "සෘතුමය" } },
      { value: "year-round", label: { en: "Year-round", si: "වර්ෂය පුරා" } },
    ],
  },
];

const proposedTouristSiteColumns: RepeatableColumn[] = [
  { key: "siteName", label: { en: "Site Name", si: "ස්ථානයේ නම" }, type: "text" },
  { key: "specialFeatures", label: { en: "Special Features", si: "විශේෂ ලක්ෂණ" }, type: "text" },
  { key: "possibleActivities", label: { en: "Possible Activities", si: "කළ හැකි ක්‍රියාකාරකම්" }, type: "text" },
  { key: "currentAuthority", label: { en: "Current Authority", si: "වත්මන් අධිකාරිය" }, type: "text" },
];

export default function PhysicalEnvironmentPage() {
  const { lang } = useLanguage();
  const { submission, isLoading } = useSubmission(CURRENT_YEAR);
  const { saveSection, status, errorMessage } = useSaveSection(CURRENT_YEAR);

  const emptyValues = useMemo(() => buildEmptyValues(lang), [lang]);

  const form = useForm<PhysicalEnvironmentDraft>({
    resolver: zodResolver(physicalEnvironmentSchemaPartial),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (submission?.data.physicalEnvironment) {
      form.reset(mergeWithSaved(emptyValues, submission.data.physicalEnvironment));
    } else {
      form.reset(emptyValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission, emptyValues]);

  async function handleSave(values: PhysicalEnvironmentDraft) {
    await saveSection("physicalEnvironment", values);
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
      sectionNumber={3}
      title={physicalEnvironmentDict.title}
      description={physicalEnvironmentDict.description}
      form={form}
      saveStatus={status}
      saveErrorMessage={errorMessage}
      onSaveDraft={handleSave}
    >
      <div>
        <RepeatableTable
          name="waterSources"
          title={physicalEnvironmentDict.fields.waterSources}
          columns={waterSourceColumns}
          emptyRowFactory={() => ({ type: "", name: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="sensitiveZones"
          title={physicalEnvironmentDict.fields.sensitiveZones}
          columns={sensitiveZoneColumns}
          emptyRowFactory={() => ({ zoneName: "", significance: "", managingAuthority: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="naturalResources"
          title={physicalEnvironmentDict.fields.naturalResources}
          columns={naturalResourceColumns}
          emptyRowFactory={() => ({ resource: "", utilizedForProduction: "no", notes: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="hazards"
          title={physicalEnvironmentDict.fields.hazards}
          columns={hazardColumns}
          fixedRows
          emptyRowFactory={() => ({
            type: HAZARD_TYPES[0],
            typeLabel: HAZARD_TYPE_LABELS[HAZARD_TYPES[0]][lang],
            occurred: "no",
            frequency: "",
            mitigationProposal: "",
          })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <div className="mb-3 max-w-xs">
          <FieldWrapper
            name="safeLocationsIdentified"
            label={{ en: "Have safe/evacuation locations been identified?", si: "ආරක්ෂිත ස්ථාන හෝ සුරක්ෂිත මධ්‍යස්ථාන හඳුනාගෙන තිබේද?" }}
          >
            {({ id, describedBy, invalid }) => (
              <Select
                value={form.watch("safeLocationsIdentified") ?? "no"}
                onValueChange={(v) => form.setValue("safeLocationsIdentified", v as "yes" | "no", { shouldDirty: true })}
              >
                <SelectTrigger id={id} aria-describedby={describedBy} aria-invalid={invalid}>
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
          </FieldWrapper>
        </div>
        <RepeatableTable
          name="safeLocations"
          title={physicalEnvironmentDict.fields.safeLocations}
          columns={safeLocationColumns}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="touristSites"
          title={physicalEnvironmentDict.fields.touristSites}
          columns={touristSiteColumns}
          emptyRowFactory={() => ({ siteName: "", reasonForAttraction: "", maintainedBy: "", frequency: "seasonal" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="proposedTouristSites"
          title={physicalEnvironmentDict.fields.proposedTouristSites}
          columns={proposedTouristSiteColumns}
          emptyRowFactory={() => ({ siteName: "", specialFeatures: "", possibleActivities: "", currentAuthority: "" })}
        />
      </div>
    </SectionForm>
  );
}
