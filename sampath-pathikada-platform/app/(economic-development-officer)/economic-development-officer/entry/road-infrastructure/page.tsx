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
  carpet: { en: "Carpet (Asphalt)", si: "කාපට්" },
  tar: { en: "Tar", si: "තාර" },
  concrete: { en: "Concrete", si: "කොන්ක්‍රීට්" },
  interlock: { en: "Interlock", si: "Interlock" },
  "gravel-soil": { en: "Gravel / Soil", si: "බොරළු/පස්" },
};

const POST_OFFICE_TYPE_LABELS: Record<(typeof POST_OFFICE_TYPES)[number], { en: string; si: string }> = {
  "head-post-office": { en: "Head Post Office", si: "අධිශ්‍රේණියේ තැපැල් කාර්යාලය" },
  "first-grade-sub-post-office": { en: "1st Grade Sub Post Office", si: "පළමු පෙළ තැපැල් කාර්යාලය" },
  "second-grade-sub-post-office": { en: "2nd Grade Sub Post Office", si: "දෙවන පෙළ තැපැල් කාර්යාලය" },
  "sub-post-office": { en: "Sub Post Office", si: "උප තැපැල් කාර්යාලය" },
  "appointed-post-office": { en: "Appointed Post Office", si: "නියෝජිත තැපැල් කාර්යාලය" },
  "postal-box-and-counter": { en: "Postal Box & Counter", si: "තැපැල් කණු හා පෙට්ටිය" },
};

const SERVICE_CATEGORY_LABELS: Record<(typeof SERVICE_CATEGORIES)[number], { en: string; si: string }> = {
  "retail-shop": { en: "Retail / Grocery Shop", si: "සිල්ලර කඩ" },
  "eating-house-tea-shop": { en: "Eating House & Tea Shop", si: "ආපන ශාලා හා තේ කඩ" },
  "shoes-textiles": { en: "Shoes & Textiles", si: "සපත්තු හා රෙදිපිළි" },
  "meat-fish-shop": { en: "Meat / Fish Shop", si: "මස්, මාළු අලෙවිසැල්" },
  "hardware-household-goods": { en: "Timber & Iron Household Goods", si: "ලී හා යකඩ ගෘහ භාණ්ඩ" },
  "electrical-equipment": { en: "Electrical Equipment", si: "විදුලි උපකරණ" },
  "general-goods-shop": { en: "General Goods Shop", si: "සාප්පු බඩු" },
  "construction-materials": { en: "Construction Materials", si: "ගොඩනැගිලි ද්‍රව්‍ය" },
  jewelry: { en: "Jewelry / Ornaments", si: "ස්වර්ණාභරණ" },
  "books-stationery": { en: "Books & Stationery", si: "පොත්පත් හා ලිපිද්‍රව්‍ය" },
  "motor-spare-parts": { en: "Motor Vehicle Spare Parts", si: "මෝටර් රථ අමතර කොටස්" },
  "beauty-salon": { en: "Beauty Salon", si: "රූපලාවණ්‍යාගාරය" },
  "vehicle-service-center": { en: "Vehicle Service Center", si: "වාහන සර්විස් සෙන්ටර්" },
  salon: { en: "Salon", si: "සැලුන්" },
  "vehicle-repair": { en: "Vehicle Repair Place", si: "වාහන අළුත්වැඩියා කරන ස්ථාන" },
  "umbrella-bag-shoe-repair": { en: "Umbrella / Bag / Shoe Repair Place", si: "කුඩ, බෑග්, සපත්තු අළුත්වැඩියා කරන ස්ථාන" },
  "tailoring-shop": { en: "Tailoring Shop", si: "මැහුම් සාප්පු" },
  "funeral-service": { en: "Funeral Service Place", si: "අවමංගල සේවා ස්ථාන" },
  "mobile-phone-shop": { en: "Mobile Phone Shop", si: "ජංගම දුරකථන හල" },
  "vegetable-shop": { en: "Vegetable Shop", si: "එළවළු අලෙවිසැල්" },
};

const PUBLIC_FACILITY_CATEGORY_LABELS: Record<(typeof PUBLIC_FACILITY_CATEGORIES)[number], { en: string; si: string }> = {
  "childrens-park": { en: "Children's Park / Garden", si: "ළමා උයන් / ළමා උද්‍යානය" },
  "library-reading-room": { en: "Library / Reading Room", si: "පුස්තකාල / කියවීම් ශාලා" },
  "cinema-hall": { en: "Cinema Hall", si: "සිනමාශාලා" },
  auditorium: { en: "Auditorium / Dance Hall", si: "නර්තනාගාර" },
  "public-playground": { en: "Public Playground", si: "පොදු ක්‍රීඩා පිටි" },
  gym: { en: "Gym", si: "කායවර්ධන මධ්‍යස්ථාන" },
  "daycare-center": { en: "Daycare Center", si: "දිවා සුරැකුම් මධ්‍යස්ථාන" },
  "cemetery-crematorium": { en: "Crematorium / Public Cemetery", si: "ආදහනාගාරය / පොදු සුසාන භූමිය" },
  "cultural-center": { en: "Cultural Center", si: "සංස්කෘතික මධ්‍යස්ථාන" },
  "weekly-fair-market": { en: "Weekly Fair / Market", si: "සතිපොළ / කඩමණ්ඩිය / වෙළඳපොළ" },
  "community-hall": { en: "Community Hall", si: "ප්‍රජා ශාලාව" },
  "vidatha-center": { en: "Vidatha Resource Center", si: "විදාතා නැණසල මධ්‍යස්ථානය" },
  "registered-three-wheeler-park": { en: "Registered Three-Wheeler Park", si: "ලියාපදිංචි ත්‍රිරෝද රථගාල" },
};

function getEmptyValues(lang: "en" | "si"): RoadInfrastructureDraft {
  return {
    publicFacilities: {
      busStand: { present: "no", name: "" },
      railwayStation: { present: "no", name: "" },
      port: { present: "no", name: "" },
      airport: { present: "no", name: "" },
    },
    roadDevelopmentNeeds: [],
    bridgeRepairs: [],
    newRoadBridgeNeeds: [],
    noPublicTransportAreas: [],
    railwayCrossingGaps: [],
    postOffices: [],
    fuelDistributionStations: [],
    solarPowerPlants: [],
    windPowerPlants: [],
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
      count: 0,
      distanceToNearestIfOutsideDivision: "",
    })),
    licensedLiquorShopsPresent: "no",
    licensedLiquorShops: [],
  };
}

function mergeWithSaved(empty: RoadInfrastructureDraft, saved: RoadInfrastructureDraft): RoadInfrastructureDraft {
  return {
    ...empty,
    ...saved,
    solarPowerPlants: Array.isArray(saved.solarPowerPlants) ? saved.solarPowerPlants : empty.solarPowerPlants,
    windPowerPlants: Array.isArray(saved.windPowerPlants) ? saved.windPowerPlants : empty.windPowerPlants,
    hydropowerPlants: Array.isArray(saved.hydropowerPlants) ? saved.hydropowerPlants : empty.hydropowerPlants,
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
    { key: "roadName", label: { en: "Road Name", si: "මාර්ගයේ නම" }, type: "text", required: true },
    { key: "roadNumber", label: { en: "Road Number (if any)", si: "මාර්ග අංකය (තිබෙනම්)" }, type: "text" },
    { key: "lengthMeters", label: { en: "Length (m)", si: "දිග ප්‍රමාණය (m)" }, type: "number" },
    {
      key: "surfaceType",
      label: { en: "* Current Road Surface", si: "*දැනට මාර්ගයේ ස්වභාවය" },
      type: "select",
      options: ROAD_SURFACE_TYPES.map((t) => ({ value: t, label: ROAD_SURFACE_TYPE_LABELS[t] })),
    },
    { key: "maintainingAuthority", label: { en: "** Maintaining Authority", si: "**නඩත්තු කරනු ලබන ආයතනය" }, type: "text" },
  ];

  const bridgeRepairColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Bridge / Culvert / Footpath", si: "පාලම/බෝක්කුව/පැතිබැම්" }, type: "text", required: true },
    { key: "roadNumber", label: { en: "Road Number", si: "මාර්ග අංකය" }, type: "text" },
    { key: "location", label: { en: "Location (Describe)", si: "පිහිටීම (විස්තර කරන්න)" }, type: "text", required: true },
    { key: "maintainingAuthority", label: { en: "** Maintaining Authority", si: "**නඩත්තු කරනු ලබන ආයතනය" }, type: "text" },
  ];

  const newRoadBridgeNeedColumns: RepeatableColumn[] = [
    { key: "location", label: { en: "Required Location", si: "අවශ්‍ය ස්ථානය" }, type: "text", required: true },
    { key: "roadNumber", label: { en: "Road Number", si: "මාර්ග අංකය" }, type: "text" },
    { key: "justification", label: { en: "Describe the Need", si: "අවශ්‍යතාවය විස්තර කරන්න" }, type: "text", required: true },
  ];

  const noPublicTransportAreaColumns: RepeatableColumn[] = [
    { key: "roadName", label: { en: "Road Name", si: "මාර්ගයේ නම" }, type: "text", required: true },
    { key: "roadNumber", label: { en: "Road Number", si: "මාර්ග අංකය" }, type: "text" },
    { key: "startPoint", label: { en: "Start Point", si: "ආරම්භක ස්ථානය" }, type: "text" },
    { key: "endPoint", label: { en: "End Point", si: "අවසන් ස්ථානය" }, type: "text" },
    { key: "distanceKm", label: { en: "Distance", si: "දුර ප්‍රමාණය" }, type: "number" },
    { key: "requiredBeneficiaryCount", label: { en: "Beneficiaries Needing Service", si: "සේවාව අවශ්‍ය ප්‍රතිලාභීසංඛ්‍යාව" }, type: "number" },
  ];

  const railwayCrossingGapColumns: RepeatableColumn[] = [
    { key: "roadName", label: { en: "Road Name at the Railway Crossing", si: "දුම්රිය මාර්ගය හරස්ව පිහිටි මාර්ගයේ නම" }, type: "text" },
    { key: "roadNumber", label: { en: "Road Number", si: "මාර්ග අංකය" }, type: "text" },
    { key: "location", label: { en: "Location", si: "ස්ථානය" }, type: "text", required: true },
  ];

  const postOfficeColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text", required: true },
    {
      key: "type",
      label: { en: "Type", si: "වර්ගය" },
      type: "select",
      options: POST_OFFICE_TYPES.map((t) => ({ value: t, label: POST_OFFICE_TYPE_LABELS[t] })),
      required: true,
    },
  ];

  const namedFacilityColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Filling Station Name", si: "පිරවුම්හලේ නම" }, type: "text", required: true },
  ];

  const hydropowerPlantColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text", required: true },
    {
      key: "scale",
      label: { en: "Scale", si: "ධාරිතාව" },
      type: "select",
      options: HYDROPOWER_SCALES.map((v) => ({ value: v, label: HYDROPOWER_SCALE_LABELS[v] })),
      required: true,
    },
  ];

  const financialInstitutionColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Bank / Financial Institution / Insurance Institution Name", si: "බැංකුවේ/ මූල්‍ය ආයතනයේ /රක්ෂණ ආයතනයේ නම" }, type: "text", required: true },
    {
      key: "type",
      label: { en: "Government / Private", si: "රාජ්‍ය/ පෞද්ගලික" },
      type: "select",
      options: FINANCIAL_INSTITUTION_TYPES.map((v) => ({ value: v, label: FINANCIAL_INSTITUTION_TYPE_LABELS[v] })),
      required: true,
    },
  ];

  const serviceEstablishmentColumns: RepeatableColumn[] = [
    { key: "categoryLabel", label: { en: "Category", si: "වර්ගය" }, type: "readonly" },
    { key: "count", label: { en: "Number of Trade Institutions", si: "වෙළඳ ආයතන සංඛ්‍යාව" }, type: "number" },
  ];

  const industrialEstateColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text", required: true },
    { key: "location", label: { en: "Location", si: "ස්ථානය" }, type: "text", required: true },
  ];

  const waterReservoirColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text", required: true },
  ];

  const publicFacilityCategoryColumns: RepeatableColumn[] = [
    { key: "categoryLabel", label: { en: "Type", si: "වර්ගය" }, type: "readonly" },
    { key: "present", label: { en: "Present", si: "ඇත/නැත" }, type: "select", options: YES_NO_OPTIONS, required: true },
    { key: "count", label: { en: "Count", si: "සංඛ්‍යාව" }, type: "number" },
    {
      key: "distanceToNearestIfOutsideDivision",
      label: { en: "Distance to Nearest (if not located within the division)", si: "වසම තුල පිහිටා නැත නම් ආසන්නතම ස්ථානයන්ට ඇති දුර" },
      type: "text",
    },
  ];

  const licensedLiquorShopColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Licensed Tavern / Bar Name", si: "බලපත්‍රලාභී තැබෑරුම් /බාර් නම" }, type: "text", required: true },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text", required: true },
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
          <FieldWrapper name="publicFacilities.busStand.present" label={{ en: "Bus Stand - Present?", si: "බස් නැවතුම් පොළ - ඇත/ නැත" }} required>
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
          <FieldWrapper name="publicFacilities.busStand.name" label={{ en: "Bus Stand - Location Name", si: "බස් නැවතුම් පොළ - ස්ථානයේ නම" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} {...form.register("publicFacilities.busStand.name")} />
            )}
          </FieldWrapper>

          <FieldWrapper name="publicFacilities.railwayStation.present" label={{ en: "Railway Station - Present?", si: "දුම්රිය නැවතුම් පොළ - ඇත/ නැත" }} required>
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
          <FieldWrapper name="publicFacilities.railwayStation.name" label={{ en: "Railway Station - Location Name", si: "දුම්රිය නැවතුම් පොළ - ස්ථානයේ නම" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} {...form.register("publicFacilities.railwayStation.name")} />
            )}
          </FieldWrapper>

          <FieldWrapper name="publicFacilities.port.present" label={{ en: "Port - Present?", si: "වරාය - ඇත/ නැත" }} required>
            {({ id, describedBy, invalid }) => (
              <Select
                value={form.watch("publicFacilities.port.present") ?? ""}
                onValueChange={(v) => form.setValue("publicFacilities.port.present", v as "yes" | "no", { shouldDirty: true })}
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
          <FieldWrapper name="publicFacilities.port.name" label={{ en: "Port - Location Name", si: "වරාය - ස්ථානයේ නම" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} {...form.register("publicFacilities.port.name")} />
            )}
          </FieldWrapper>

          <FieldWrapper name="publicFacilities.airport.present" label={{ en: "Airport - Present?", si: "ගුවන්තොටුපළ - ඇත/ නැත" }} required>
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
          <FieldWrapper name="publicFacilities.airport.name" label={{ en: "Airport - Location Name", si: "ගුවන්තොටුපළ - ස්ථානයේ නම" }}>
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
          emptyRowFactory={() => ({ roadName: "", roadNumber: "", lengthMeters: 0, surfaceType: ROAD_SURFACE_TYPES[0], maintainingAuthority: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="bridgeRepairs"
          title={roadInfrastructureDict.fields.bridgeRepairs}
          columns={bridgeRepairColumns}
          emptyRowFactory={() => ({ name: "", roadNumber: "", location: "" })}
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
          emptyRowFactory={() => ({ roadName: "", roadNumber: "", startPoint: "", endPoint: "", distanceKm: 0, requiredBeneficiaryCount: 0 })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="railwayCrossingGaps"
          title={roadInfrastructureDict.fields.railwayCrossingGaps}
          columns={railwayCrossingGapColumns}
          emptyRowFactory={() => ({ roadName: "", roadNumber: "", location: "" })}
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
          name="fuelDistributionStations"
          title={roadInfrastructureDict.fields.fuelDistributionStations}
          columns={namedFacilityColumns}
          emptyRowFactory={() => ({ name: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="solarPowerPlants"
          title={roadInfrastructureDict.fields.solarPowerPlants}
          columns={hydropowerPlantColumns}
          emptyRowFactory={() => ({ name: "", scale: HYDROPOWER_SCALES[0] })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="windPowerPlants"
          title={roadInfrastructureDict.fields.windPowerPlants}
          columns={hydropowerPlantColumns}
          emptyRowFactory={() => ({ name: "", scale: HYDROPOWER_SCALES[0] })}
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
            count: 0,
            distanceToNearestIfOutsideDivision: "",
          })}
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 border-t border-border pt-6">
        <FieldWrapper name="licensedLiquorShopsPresent" label={roadInfrastructureDict.fields.licensedLiquorShopsPresent} required>
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
