"use client";

import { useEffect } from "react";
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
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { roadInfrastructureDict } from "@/lib/i18n/sections/road-infrastructure";
import {
  roadInfrastructureSchemaPartial,
  HYDROPOWER_SCALES,
  FINANCIAL_INSTITUTION_TYPES,
  ROAD_SURFACE_TYPES,
  POST_OFFICE_TYPES,
  SERVICE_CATEGORIES,
  PUBLIC_FACILITY_CATEGORIES,
} from "@/lib/validators/sections/road-infrastructure";
import { z } from "zod";
import { cn } from "@/lib/utils";

const CURRENT_YEAR = 2026;

type RoadInfrastructureDraft = z.infer<typeof roadInfrastructureSchemaPartial>;

const YES_NO_OPTIONS = [
  { value: "yes", label: { en: "Yes", si: "ඔව්" } },
  { value: "no", label: { en: "No", si: "නැත" } },
];

const HYDROPOWER_SCALE_LABELS: Record<(typeof HYDROPOWER_SCALES)[number], { en: string; si: string }> = {
  mini: { en: "Mini", si: "කුඩා" },
  major: { en: "Major", si: "විශාල" },
};

const FINANCIAL_INSTITUTION_TYPE_LABELS: Record<(typeof FINANCIAL_INSTITUTION_TYPES)[number], { en: string; si: string }> = {
  "govt-bank": { en: "Government Bank", si: "රාජ්‍ය බැංකුව" },
  "private-bank": { en: "Private Bank", si: "පෞද්ගලික බැංකුව" },
  "cooperative-rural-bank": { en: "Cooperative Rural Bank", si: "සමූපකාර ග්‍රාමීය බැංකුව" },
  "samurdhi-bank": { en: "Samurdhi Bank", si: "සමෘද්ධි බැංකුව" },
};

const ROAD_SURFACE_TYPE_LABELS: Record<(typeof ROAD_SURFACE_TYPES)[number], { en: string; si: string }> = {
  carpet: { en: "Carpet (Tar)", si: "කාපට්" },
  gravel: { en: "Gravel", si: "බාර" },
  concrete: { en: "Concrete", si: "කොන්ක්‍රීට්" },
  interlock: { en: "Interlock", si: "Interlock" },
  graded: { en: "Graded / Soil", si: "තෙරළු/පස්" },
};

const POST_OFFICE_TYPE_LABELS: Record<(typeof POST_OFFICE_TYPES)[number], { en: string; si: string }> = {
  "head-post-office": { en: "Head Post Office", si: "ප්‍රධාන තැපැල් කාර්යාලය" },
  "first-grade-sub-post-office": { en: "1st Grade Sub Post Office", si: "පළමු ශ්‍රේණියේ උප තැපැල් කාර්යාලය" },
  "second-grade-sub-post-office": { en: "2nd Grade Sub Post Office", si: "දෙවන ශ්‍රේණියේ උප තැපැල් කාර්යාලය" },
  "sub-post-office": { en: "Sub Post Office", si: "උප තැපැල් කාර්යාලය" },
  "appointed-post-office": { en: "Appointed Post Office", si: "පත්කළ තැපැල් කාර්යාලය" },
  "postal-box-and-counter": { en: "Postal Box & Counter", si: "තැපැල් කණු හා පෙට්ටිය" },
};

const SERVICE_CATEGORY_LABELS: Record<(typeof SERVICE_CATEGORIES)[number], { en: string; si: string }> = {
  grocery: { en: "Grocery", si: "කඩේ" },
  "hardware-store": { en: "Hardware Store", si: "හාඩ්වෙයාර් වෙළඳසැල" },
  "textile-shop": { en: "Textile Shop", si: "රෙදිපිළි වෙළඳසැල" },
  "meat-fish-shop": { en: "Meat / Fish Shop", si: "මස්/මාළු වෙළඳසැල" },
  "timber-depot": { en: "Timber Depot", si: "දැව සැපයුම් ස්ථානය" },
  "electrical-shop": { en: "Electrical Shop", si: "විදුලි උපකරණ වෙළඳසැල" },
  "stationery-shop": { en: "Stationery Shop", si: "පොත්පත් හා ලිපිද්‍රව්‍ය වෙළඳසැල" },
  "construction-materials-shop": { en: "Construction Materials Shop", si: "ඉදිකිරීම් ද්‍රව්‍ය වෙළඳසැල" },
  "jewelry-shop": { en: "Jewelry / Ornaments Shop", si: "ස්වර්ණාභරණ වෙළඳසැල" },
  "cosmetics-shop": { en: "Cosmetics Shop", si: "රූපලාවණ්‍ය ද්‍රව්‍ය වෙළඳසැල" },
  "motor-parts-shop": { en: "Motor Parts Shop", si: "වාහන අමතර කොටස් වෙළඳසැල" },
  "photography-studio": { en: "Photography Studio", si: "ඡායාරූප ශාලාව" },
  "vehicle-service-center": { en: "Vehicle Service Center", si: "වාහන අළුත්වැඩියා මධ්‍යස්ථානය" },
  salon: { en: "Salon", si: "රූපලාවණ්‍ය සැලුන්" },
  "welding-shop": { en: "Welding Shop", si: "වෑල්ඩින් වැඩපොළ" },
  blacksmith: { en: "Blacksmith", si: "කම්මල්කරු වැඩපොළ" },
  "tailoring-shop": { en: "Tailoring Shop", si: "මසිවිලි වැඩපොළ" },
  "courier-service": { en: "Courier Service", si: "කුරියර් සේවාව" },
  "telecom-shop": { en: "Telecom Shop", si: "දුරකථන/ටෙලිකොම් වෙළඳසැල" },
  other: { en: "Other", si: "වෙනත්" },
};

const PUBLIC_FACILITY_CATEGORY_LABELS: Record<(typeof PUBLIC_FACILITY_CATEGORIES)[number], { en: string; si: string }> = {
  playground: { en: "Playground", si: "ක්‍රීඩා පිටිය" },
  library: { en: "Library", si: "පුස්තකාලය" },
  "cinema-hall": { en: "Cinema Hall", si: "සිනමා ශාලාව" },
  auditorium: { en: "Auditorium", si: "ශ්‍රවණාගාරය" },
  gym: { en: "Gym", si: "ව්‍යායාමශාලාව" },
  "daycare-center": { en: "Daycare Center", si: "ළදරු සුරැකුම් මධ්‍යස්ථානය" },
  "cemetery-crematorium": { en: "Cemetery / Crematorium", si: "සුසාන භූමිය / ආදාහනාගාරය" },
  "cultural-center": { en: "Cultural Center", si: "සංස්කෘතික මධ්‍යස්ථානය" },
  market: { en: "Market", si: "වෙළඳපොළ" },
  "community-hall": { en: "Community Hall", si: "ප්‍රජා ශාලාව" },
  "disabled-accessible-space": { en: "Disabled-Accessible Space", si: "ආබාධිත පහසුකම් සහිත ස්ථානය" },
  "public-restroom": { en: "Public Restroom", si: "පොදු වැසිකිලි" },
  "public-wifi-point": { en: "Public Wi-Fi Point", si: "පොදු Wi-Fi ස්ථානය" },
};

function getEmptyValues(lang: "en" | "si"): RoadInfrastructureDraft {
  return {
    publicFacilities: {
      busStand: { present: "no", name: "" },
      railwayStation: { present: "no", name: "" },
      jetty: { present: "no", name: "" },
      airport: { present: "no", name: "" },
    },
    roadDevelopmentNeeds: [],
    bridgeRepairs: [],
    newRoadBridgeNeeds: [],
    noPublicTransportAreas: [],
    railwayCrossingGaps: [],
    postOffices: [],
    electricitySubstations: [],
    fuelDistributionStations: [],
    hydropowerPlants: [],
    financialInstitutions: [],
    serviceEstablishments: SERVICE_CATEGORIES.map((category) => ({
      category,
      categoryLabel: SERVICE_CATEGORY_LABELS[category][lang],
      count: 0,
    })),
    industrialEstates: [],
    waterReservoirs: [],
    publicFacilityCategories: PUBLIC_FACILITY_CATEGORIES.map((category) => ({
      category,
      categoryLabel: PUBLIC_FACILITY_CATEGORY_LABELS[category][lang],
      present: "no" as const,
      name: "",
    })),
    licensedLiquorShopsPresent: "no",
    licensedLiquorShops: [],
  };
}

function mergeWithSaved(empty: RoadInfrastructureDraft, saved: RoadInfrastructureDraft): RoadInfrastructureDraft {
  return {
    ...empty,
    ...saved,
    serviceEstablishments: empty.serviceEstablishments?.map((row, i) => ({ ...row, ...saved.serviceEstablishments?.[i] })),
    publicFacilityCategories: empty.publicFacilityCategories?.map((row, i) => ({ ...row, ...saved.publicFacilityCategories?.[i] })),
  };
}

export default function RoadInfrastructurePage() {
  const { lang } = useLanguage();
  const { submission, isLoading } = useSubmission(CURRENT_YEAR);
  const { saveSection, status, errorMessage } = useSaveSection(CURRENT_YEAR);

  const form = useForm<RoadInfrastructureDraft>({
    resolver: zodResolver(roadInfrastructureSchemaPartial),
    defaultValues: getEmptyValues(lang),
  });

  useEffect(() => {
    if (submission?.data.roadInfrastructure) {
      form.reset(mergeWithSaved(getEmptyValues(lang), submission.data.roadInfrastructure));
    } else {
      form.reset(getEmptyValues(lang));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission, lang]);

  async function handleSave(values: RoadInfrastructureDraft) {
    await saveSection("roadInfrastructure", values);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  const roadDevelopmentNeedColumns: RepeatableColumn[] = [
    { key: "roadName", label: { en: "Road Name", si: "පාරේ නම" }, type: "text" },
    { key: "roadNumber", label: { en: "Road Number", si: "පාර අංකය" }, type: "text" },
    { key: "lengthMeters", label: { en: "Length (m)", si: "දිග (මීටර්)" }, type: "number" },
    {
      key: "surfaceType",
      label: { en: "Surface Type", si: "මාර්ගයේ ස්වභාවය" },
      type: "select",
      options: ROAD_SURFACE_TYPES.map((t) => ({ value: t, label: ROAD_SURFACE_TYPE_LABELS[t] })),
    },
    { key: "maintainingAuthority", label: { en: "Maintaining Authority", si: "නඩත්තු කරනු ලබන ආයතනය" }, type: "text" },
    { key: "priorityRank", label: { en: "Priority Rank", si: "ප්‍රමුඛතා අනුපිළිවෙල" }, type: "number" },
  ];

  const bridgeRepairColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "roadNumber", label: { en: "Road Number", si: "පාර අංකය" }, type: "text" },
    { key: "condition", label: { en: "Condition", si: "තත්ත්වය" }, type: "text" },
    { key: "maintainingAuthority", label: { en: "Maintaining Authority", si: "නඩත්තු කරනු ලබන ආයතනය" }, type: "text" },
  ];

  const newRoadBridgeNeedColumns: RepeatableColumn[] = [
    { key: "location", label: { en: "Location", si: "ස්ථානය" }, type: "text" },
    { key: "roadNumber", label: { en: "Road Number", si: "පාර අංකය" }, type: "text" },
    { key: "justification", label: { en: "Justification", si: "අවශ්‍යතාවය විස්තර කරන්න" }, type: "text" },
  ];

  const noPublicTransportAreaColumns: RepeatableColumn[] = [
    { key: "roadName", label: { en: "Road Name", si: "පාරේ නම" }, type: "text" },
    { key: "roadNumber", label: { en: "Road Number", si: "පාර අංකය" }, type: "text" },
    { key: "startPoint", label: { en: "Start Point", si: "ආරම්භක ස්ථානය" }, type: "text" },
    { key: "endPoint", label: { en: "End Point", si: "අවසන් ස්ථානය" }, type: "text" },
    { key: "distanceKm", label: { en: "Distance (km)", si: "දුර ප්‍රමාණය" }, type: "number" },
    { key: "requiredServiceFrequency", label: { en: "Required Service Frequency", si: "සේවාව අවශ්‍ය ප්‍රතිලාභී ගණන" }, type: "text" },
  ];

  const railwayCrossingGapColumns: RepeatableColumn[] = [
    { key: "location", label: { en: "Location", si: "ස්ථානය" }, type: "text" },
    { key: "roadName", label: { en: "Road Name", si: "පාරේ නම" }, type: "text" },
  ];

  const postOfficeColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    {
      key: "type",
      label: { en: "Type", si: "වර්ගය" },
      type: "select",
      options: POST_OFFICE_TYPES.map((t) => ({ value: t, label: POST_OFFICE_TYPE_LABELS[t] })),
    },
  ];

  const namedFacilityColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
  ];

  const hydropowerPlantColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    {
      key: "scale",
      label: { en: "Scale", si: "ධාරිතාව" },
      type: "select",
      options: HYDROPOWER_SCALES.map((v) => ({ value: v, label: HYDROPOWER_SCALE_LABELS[v] })),
    },
  ];

  const financialInstitutionColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    {
      key: "type",
      label: { en: "Type", si: "වර්ගය" },
      type: "select",
      options: FINANCIAL_INSTITUTION_TYPES.map((v) => ({ value: v, label: FINANCIAL_INSTITUTION_TYPE_LABELS[v] })),
    },
  ];

  const serviceEstablishmentColumns: RepeatableColumn[] = [
    { key: "categoryLabel", label: { en: "Category", si: "වර්ගය" }, type: "readonly" },
    { key: "count", label: { en: "Count", si: "සංඛ්‍යාව" }, type: "number" },
  ];

  const industrialEstateColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "location", label: { en: "Location", si: "ස්ථානය" }, type: "text" },
  ];

  const waterReservoirColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
  ];

  const publicFacilityCategoryColumns: RepeatableColumn[] = [
    { key: "categoryLabel", label: { en: "Facility", si: "පහසුකම" }, type: "readonly" },
    { key: "present", label: { en: "Present", si: "පවතී ද" }, type: "select", options: YES_NO_OPTIONS },
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
  ];

  const licensedLiquorShopColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
  ];

  return (
    <SectionForm
      sectionNumber={11}
      title={roadInfrastructureDict.title}
      description={roadInfrastructureDict.description}
      form={form}
      saveStatus={status}
      saveErrorMessage={errorMessage}
      onSaveDraft={handleSave}
    >
      <div>
        <h2 lang={lang} className={cn("text-fluid-lg font-semibold text-foreground", lang === "si" && "font-si-heading")}>
          {lang === "si" ? roadInfrastructureDict.fields.publicFacilities.si : roadInfrastructureDict.fields.publicFacilities.en}
        </h2>
        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="publicFacilities.busStand.present" label={{ en: "Bus Stand Present", si: "බස් නැවතුම්පොළ පවතී ද" }}>
            {({ id, describedBy, invalid }) => (
              <Select
                value={form.watch("publicFacilities.busStand.present") ?? ""}
                onValueChange={(v) => form.setValue("publicFacilities.busStand.present", v as "yes" | "no", { shouldDirty: true })}
              >
                <SelectTrigger id={id} aria-describedby={describedBy} aria-invalid={invalid}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YES_NO_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {lang === "si" ? opt.label.si : opt.label.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FieldWrapper>
          <FieldWrapper name="publicFacilities.busStand.name" label={{ en: "Bus Stand Name", si: "බස් නැවතුම්පොළේ නම" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} {...form.register("publicFacilities.busStand.name")} />
            )}
          </FieldWrapper>

          <FieldWrapper name="publicFacilities.railwayStation.present" label={{ en: "Railway Station Present", si: "දුම්රිය ස්ථානය පවතී ද" }}>
            {({ id, describedBy, invalid }) => (
              <Select
                value={form.watch("publicFacilities.railwayStation.present") ?? ""}
                onValueChange={(v) => form.setValue("publicFacilities.railwayStation.present", v as "yes" | "no", { shouldDirty: true })}
              >
                <SelectTrigger id={id} aria-describedby={describedBy} aria-invalid={invalid}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YES_NO_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {lang === "si" ? opt.label.si : opt.label.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FieldWrapper>
          <FieldWrapper name="publicFacilities.railwayStation.name" label={{ en: "Railway Station Name", si: "දුම්රිය ස්ථානයේ නම" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} {...form.register("publicFacilities.railwayStation.name")} />
            )}
          </FieldWrapper>

          <FieldWrapper name="publicFacilities.jetty.present" label={{ en: "Jetty Present", si: "පොකුණුතොට පවතී ද" }}>
            {({ id, describedBy, invalid }) => (
              <Select
                value={form.watch("publicFacilities.jetty.present") ?? ""}
                onValueChange={(v) => form.setValue("publicFacilities.jetty.present", v as "yes" | "no", { shouldDirty: true })}
              >
                <SelectTrigger id={id} aria-describedby={describedBy} aria-invalid={invalid}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YES_NO_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {lang === "si" ? opt.label.si : opt.label.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FieldWrapper>
          <FieldWrapper name="publicFacilities.jetty.name" label={{ en: "Jetty Name", si: "පොකුණුතොටේ නම" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} {...form.register("publicFacilities.jetty.name")} />
            )}
          </FieldWrapper>

          <FieldWrapper name="publicFacilities.airport.present" label={{ en: "Airport Present", si: "ගුවන්තොටුපොළ පවතී ද" }}>
            {({ id, describedBy, invalid }) => (
              <Select
                value={form.watch("publicFacilities.airport.present") ?? ""}
                onValueChange={(v) => form.setValue("publicFacilities.airport.present", v as "yes" | "no", { shouldDirty: true })}
              >
                <SelectTrigger id={id} aria-describedby={describedBy} aria-invalid={invalid}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YES_NO_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {lang === "si" ? opt.label.si : opt.label.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FieldWrapper>
          <FieldWrapper name="publicFacilities.airport.name" label={{ en: "Airport Name", si: "ගුවන්තොටුපොළේ නම" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} {...form.register("publicFacilities.airport.name")} />
            )}
          </FieldWrapper>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="roadDevelopmentNeeds"
          title={roadInfrastructureDict.fields.roadDevelopmentNeeds}
          columns={roadDevelopmentNeedColumns}
          emptyRowFactory={() => ({ roadName: "", roadNumber: "", lengthMeters: 0, surfaceType: ROAD_SURFACE_TYPES[0], maintainingAuthority: "", priorityRank: 0 })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="bridgeRepairs"
          title={roadInfrastructureDict.fields.bridgeRepairs}
          columns={bridgeRepairColumns}
          emptyRowFactory={() => ({ name: "", roadNumber: "", condition: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="newRoadBridgeNeeds"
          title={roadInfrastructureDict.fields.newRoadBridgeNeeds}
          columns={newRoadBridgeNeedColumns}
          emptyRowFactory={() => ({ location: "", roadNumber: "", justification: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="noPublicTransportAreas"
          title={roadInfrastructureDict.fields.noPublicTransportAreas}
          columns={noPublicTransportAreaColumns}
          emptyRowFactory={() => ({ roadName: "", roadNumber: "", startPoint: "", endPoint: "", distanceKm: 0, requiredServiceFrequency: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="railwayCrossingGaps"
          title={roadInfrastructureDict.fields.railwayCrossingGaps}
          columns={railwayCrossingGapColumns}
          emptyRowFactory={() => ({ location: "", roadName: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="postOffices"
          title={roadInfrastructureDict.fields.postOffices}
          columns={postOfficeColumns}
          emptyRowFactory={() => ({ name: "", type: POST_OFFICE_TYPES[0] })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="electricitySubstations"
          title={roadInfrastructureDict.fields.electricitySubstations}
          columns={namedFacilityColumns}
          emptyRowFactory={() => ({ name: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="fuelDistributionStations"
          title={roadInfrastructureDict.fields.fuelDistributionStations}
          columns={namedFacilityColumns}
          emptyRowFactory={() => ({ name: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="hydropowerPlants"
          title={roadInfrastructureDict.fields.hydropowerPlants}
          columns={hydropowerPlantColumns}
          emptyRowFactory={() => ({ name: "", scale: HYDROPOWER_SCALES[0] })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="financialInstitutions"
          title={roadInfrastructureDict.fields.financialInstitutions}
          columns={financialInstitutionColumns}
          emptyRowFactory={() => ({ name: "", type: FINANCIAL_INSTITUTION_TYPES[0] })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="serviceEstablishments"
          title={roadInfrastructureDict.fields.serviceEstablishments}
          columns={serviceEstablishmentColumns}
          fixedRows
          emptyRowFactory={() => ({
            category: SERVICE_CATEGORIES[0],
            categoryLabel: SERVICE_CATEGORY_LABELS[SERVICE_CATEGORIES[0]][lang],
            count: 0,
          })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="industrialEstates"
          title={roadInfrastructureDict.fields.industrialEstates}
          columns={industrialEstateColumns}
          emptyRowFactory={() => ({ name: "", location: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="waterReservoirs"
          title={roadInfrastructureDict.fields.waterReservoirs}
          columns={waterReservoirColumns}
          emptyRowFactory={() => ({ name: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="publicFacilityCategories"
          title={roadInfrastructureDict.fields.publicFacilityCategories}
          columns={publicFacilityCategoryColumns}
          fixedRows
          emptyRowFactory={() => ({
            category: PUBLIC_FACILITY_CATEGORIES[0],
            categoryLabel: PUBLIC_FACILITY_CATEGORY_LABELS[PUBLIC_FACILITY_CATEGORIES[0]][lang],
            present: "no",
            name: "",
          })}
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 border-t border-border pt-6">
        <FieldWrapper name="licensedLiquorShopsPresent" label={roadInfrastructureDict.fields.licensedLiquorShopsPresent}>
          {({ id, describedBy, invalid }) => (
            <Select
              value={form.watch("licensedLiquorShopsPresent") ?? ""}
              onValueChange={(v) => form.setValue("licensedLiquorShopsPresent", v as "yes" | "no", { shouldDirty: true })}
            >
              <SelectTrigger id={id} aria-describedby={describedBy} aria-invalid={invalid}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YES_NO_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {lang === "si" ? opt.label.si : opt.label.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FieldWrapper>
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="licensedLiquorShops"
          title={roadInfrastructureDict.fields.licensedLiquorShops}
          columns={licensedLiquorShopColumns}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>
    </SectionForm>
  );
}
