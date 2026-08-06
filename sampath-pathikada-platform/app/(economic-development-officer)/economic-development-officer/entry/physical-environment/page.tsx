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
import { physicalEnvironmentSchemaPartial, HAZARD_TYPES, WATER_SOURCE_TYPES } from "@/lib/validators/sections/physical-environment";
import { z } from "zod";

const CURRENT_YEAR = 2026;

type PhysicalEnvironmentDraft = z.infer<typeof physicalEnvironmentSchemaPartial>;

const YES_NO_OPTIONS = [
  { value: "yes", label: { en: "Yes", si: "ඔව්" } },
  { value: "no", label: { en: "No", si: "නැත" } },
];

const WATER_SOURCE_TYPE_LABELS: Record<(typeof WATER_SOURCE_TYPES)[number], { en: string; si: string }> = {
  river: { en: "River", si: "ගංගාව" },
  reservoir: { en: "Reservoir", si: "ජලාශය" },
  springs: { en: "Springs", si: "උල්පත්/ බුබුලු" },
  tank: { en: "Tank", si: "වැව" },
  streams: { en: "Streams", si: "දියඇලි" },
  publicWells: { en: "Public Wells (Count)", si: "පොදු ළිං(ගණන)" },
  tubeWells: { en: "Tube Wells (Count)", si: "නල ළිං(ගණන)" },
};

const HAZARD_TYPE_LABELS: Record<(typeof HAZARD_TYPES)[number], { en: string; si: string }> = {
  flood: { en: "Flood", si: "ගංවතුර" },
  drought: { en: "Drought", si: "නියඟය" },
  landslide: { en: "Landslide", si: "නායයාම" },
  deforestation: { en: "Deforestation", si: "වන විනාශය" },
  waterSourceDepletion: { en: "Water Source Depletion", si: "ජල මූලාශ්‍ර සිඳී යාම" },
  unauthorizedLandFilling: { en: "Unauthorized Filling & Construction on Low-Lying Land", si: "අනුමවත් පහත් බිම් ගොඩ කිරීම හා ඉදිකිරීම්" },
  unauthorizedWasteDisposal: { en: "Unauthorized Waste Disposal", si: "කැලිකසළ බැහැර කිරීම(අනුමවත්)" },
  wildElephantConflict: { en: "Wild Elephant Problem", si: "වනඅලි ගැටළුව" },
  coastalErosion: { en: "Coastal Erosion", si: "වෙරළ බාදනය" },
  illegalSandMining: { en: "Illegal Sand Mining / Dumping", si: "අනවසර වැලි ගොඩදැමීම" },
};

function buildEmptyValues(lang: "en" | "si"): PhysicalEnvironmentDraft {
  return {
    waterSources: WATER_SOURCE_TYPES.map((type) => ({
      type,
      typeLabel: WATER_SOURCE_TYPE_LABELS[type][lang],
      name: "",
    })),
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
    // `type`/`typeLabel` are pinned to the freshly-seeded template, not spread from saved data:
    // older drafts (from before water sources became a fixed checklist) may carry a blank or
    // free-form `type` that no longer matches the WATER_SOURCE_TYPES enum, which would fail
    // validation and block saving. Only the officer-entered `name` carries over.
    waterSources: empty.waterSources?.map((row, i) => ({ ...row, name: saved.waterSources?.[i]?.name ?? row.name })),
    hazards: empty.hazards?.map((row, i) => ({
      ...row,
      occurred: saved.hazards?.[i]?.occurred ?? row.occurred,
      frequency: saved.hazards?.[i]?.frequency ?? row.frequency,
      mitigationProposal: saved.hazards?.[i]?.mitigationProposal ?? row.mitigationProposal,
    })),
  };
}

const waterSourceColumns: RepeatableColumn[] = [
  { key: "typeLabel", label: { en: "Water Source", si: "ජල මූලාශ්‍රය" }, type: "readonly" },
  { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
];

const sensitiveZoneColumns: RepeatableColumn[] = [
  { key: "zoneName", label: { en: "* Environmentally Sensitive Zone / Location", si: "* පාරිසරික වශයෙන් සංවේදී කලාප/ස්ථාන" }, type: "text" },
  { key: "significance", label: { en: "Importance of the Location / Zone", si: "ස්ථානයේ /කලාපයේ වැදගත්කම" }, type: "text" },
  { key: "managingAuthority", label: { en: "Managing Institution", si: "පාලනය කරනු ලබන ආයතනය" }, type: "text" },
];

const naturalResourceColumns: RepeatableColumn[] = [
  { key: "resource", label: { en: "* Physical Resource Identified in the Area", si: "*ප්‍රදේශයේ හඳුනා ගන්නා ලද භෞතික සම්පත්" }, type: "text" },
  {
    key: "utilizedForProduction",
    label: { en: "Used for Production / Development? (Yes/No)", si: "නිෂ්පාදනය කටයුත්තකට, සංවර්ධනයට යොදාගෙන තිබේද (ඇත/නැත)" },
    type: "select",
    options: YES_NO_OPTIONS,
  },
  { key: "notes", label: { en: "Notes", si: "සටහන්" }, type: "text" },
];

const hazardColumns: RepeatableColumn[] = [
  { key: "typeLabel", label: { en: "Environmental Problem", si: "පාරිසරික ගැටළු" }, type: "readonly" },
  {
    key: "occurred",
    label: { en: "Occurred?", si: "ඇත/නැත" },
    type: "select",
    options: YES_NO_OPTIONS,
  },
  { key: "frequency", label: { en: "If Yes, the Common Time Period", si: "ඇත්නම් බහුලව සිදුවන කාල සීමාව" }, type: "text" },
  { key: "mitigationProposal", label: { en: "Proposed Remedial Measures for the Problem", si: "ගැටළුව සඳහා ගතයුතු පිළියම් යෝජනා" }, type: "text" },
];

const safeLocationColumns: RepeatableColumn[] = [
  { key: "name", label: { en: "Name of the Safe Location", si: "ආරක්ෂිත ස්ථානයේ නම" }, type: "text" },
  { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
];

const touristSiteColumns: RepeatableColumn[] = [
  { key: "siteName", label: { en: "Name of Location with Tourist Attraction", si: "සංචාරක ආකර්ෂණය සහිත ස්ථානය නම" }, type: "text" },
  {
    key: "reasonForAttraction",
    label: { en: "Reason for Attraction / Specialty of the Location", si: "සංචාරක ආකර්ෂණය ඇතිවීමට හේතුව/ස්ථානයේ විශේෂත්වය" },
    type: "text",
  },
  { key: "maintainedBy", label: { en: "Managing Institution / Ownership", si: "පාලනය කරනු ලබන ආයතනය / අයිතිය" }, type: "text" },
  {
    key: "frequency",
    label: { en: "* Tourist Visitation", si: "*සංචාරකයන්ගේ පැමිණීම" },
    type: "select",
    options: [
      { value: "seasonal", label: { en: "Seasonal / Periodic", si: "කාලීන" } },
      { value: "year-round", label: { en: "Year-round", si: "වර්ෂය පුරා" } },
    ],
  },
];

const proposedTouristSiteColumns: RepeatableColumn[] = [
  { key: "siteName", label: { en: "Name of Proposed Suitable Location", si: "සංචාරක ආකර්ෂණය ඇතිකිරීමට සුදුසු යෝජිත ස්ථානයේ නම" }, type: "text" },
  { key: "specialFeatures", label: { en: "Specialty of the Proposed Location", si: "සංචාරක ආකර්ෂණය ඇතිකිරීමට යෝජිත ස්ථානයේ විශේෂත්වය" }, type: "text" },
  {
    key: "possibleActivities",
    label: { en: "Activities Possible at the Location", si: "සංචාරක ආකර්ෂණය ඇතිකිරීමට එම ස්ථානයේ සිදුකිරීමට හැකි ක්‍රියාකාරකම්" },
    type: "text",
  },
  { key: "currentAuthority", label: { en: "* Institution Currently Managing / Ownership", si: "*දැනට පාලනය කරනු ලබන ආයතනය / අයිතිය" }, type: "text" },
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
          fixedRows
          emptyRowFactory={() => ({
            type: WATER_SOURCE_TYPES[0],
            typeLabel: WATER_SOURCE_TYPE_LABELS[WATER_SOURCE_TYPES[0]][lang],
            name: "",
          })}
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
            label={physicalEnvironmentDict.fields.safeLocationsIdentified}
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
