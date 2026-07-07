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
  SERVICE_CATEGORIES_COUNT,
  PUBLIC_FACILITY_CATEGORIES_COUNT,
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
  govt: { en: "Government", si: "රාජ්‍ය" },
  private: { en: "Private", si: "පෞද්ගලික" },
};

const SERVICE_CATEGORY_LABELS: { en: string; si: string }[] = [
  { en: "Grocery", si: "කඩේ" },
  { en: "Hardware Store", si: "හාඩ්වෙයාර් වෙළඳසැල" },
  { en: "Textile Shop", si: "රෙදිපිළි වෙළඳසැල" },
  { en: "Meat / Fish Shop", si: "මස්/මාළු වෙළඳසැල" },
  { en: "Timber Depot", si: "දැව සැපයුම් ස්ථානය" },
  { en: "Electrical Shop", si: "විදුලි උපකරණ වෙළඳසැල" },
  { en: "Stationery Shop", si: "පොත්පත් හා ලිපිද්‍රව්‍ය වෙළඳසැල" },
  { en: "Construction Materials Shop", si: "ඉදිකිරීම් ද්‍රව්‍ය වෙළඳසැල" },
  { en: "Jewelry / Ornaments Shop", si: "ස්වර්ණාභරණ වෙළඳසැල" },
  { en: "Cosmetics Shop", si: "රූපලාවණ්‍ය ද්‍රව්‍ය වෙළඳසැල" },
  { en: "Motor Parts Shop", si: "වාහන අමතර කොටස් වෙළඳසැල" },
  { en: "Photography Studio", si: "ඡායාරූප ශාලාව" },
  { en: "Vehicle Service Center", si: "වාහන අළුත්වැඩියා මධ්‍යස්ථානය" },
  { en: "Salon", si: "රූපලාවණ්‍ය සැලුන්" },
  { en: "Welding Shop", si: "වෑල්ඩින් වැඩපොළ" },
  { en: "Blacksmith", si: "කම්මල්කරු වැඩපොළ" },
  { en: "Tailoring Shop", si: "මසිවිලි වැඩපොළ" },
  { en: "Courier Service", si: "කුරියර් සේවාව" },
  { en: "Telecom Shop", si: "දුරකථන/ටෙලිකොම් වෙළඳසැල" },
  { en: "Other", si: "වෙනත්" },
];

const PUBLIC_FACILITY_CATEGORY_LABELS: { en: string; si: string }[] = [
  { en: "Playground", si: "ක්‍රීඩා පිටිය" },
  { en: "Library", si: "පුස්තකාලය" },
  { en: "Cinema Hall", si: "සිනමා ශාලාව" },
  { en: "Auditorium", si: "ශ්‍රවණාගාරය" },
  { en: "Gym", si: "ව්‍යායාමශාලාව" },
  { en: "Daycare Center", si: "ළදරු සුරැකුම් මධ්‍යස්ථානය" },
  { en: "Cemetery / Crematorium", si: "සුසාන භූමිය / ආදාහනාගාරය" },
  { en: "Cultural Center", si: "සංස්කෘතික මධ්‍යස්ථානය" },
  { en: "Market", si: "වෙළඳපොළ" },
  { en: "Community Hall", si: "ප්‍රජා ශාලාව" },
  { en: "Disabled-Accessible Space", si: "ආබාධිත පහසුකම් සහිත ස්ථානය" },
  { en: "Public Restroom", si: "පොදු වැසිකිලි" },
  { en: "Public Wi-Fi Point", si: "පොදු Wi-Fi ස්ථානය" },
];

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
    electricitySubstations: [],
    fuelDistributionStations: [],
    hydropowerPlants: [],
    financialInstitutions: [],
    serviceEstablishments: Array.from({ length: SERVICE_CATEGORIES_COUNT }, (_, i) => ({
      label: lang === "si" ? SERVICE_CATEGORY_LABELS[i].si : SERVICE_CATEGORY_LABELS[i].en,
      count: 0,
    })),
    industrialEstates: [],
    waterReservoirs: [],
    publicFacilityCategories: Array.from({ length: PUBLIC_FACILITY_CATEGORIES_COUNT }, (_, i) => ({
      label: lang === "si" ? PUBLIC_FACILITY_CATEGORY_LABELS[i].si : PUBLIC_FACILITY_CATEGORY_LABELS[i].en,
      present: "no" as const,
      name: "",
    })),
    notableClubsAndBars: [],
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
      form.reset({ ...getEmptyValues(lang), ...submission.data.roadInfrastructure });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission]);

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
    { key: "currentCondition", label: { en: "Current Condition", si: "වර්තමාන තත්ත්වය" }, type: "text" },
    { key: "priorityRank", label: { en: "Priority Rank", si: "ප්‍රමුඛතා අනුපිළිවෙල" }, type: "number" },
  ];

  const bridgeRepairColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "roadNumber", label: { en: "Road Number", si: "පාර අංකය" }, type: "text" },
    { key: "condition", label: { en: "Condition", si: "තත්ත්වය" }, type: "text" },
  ];

  const newRoadBridgeNeedColumns: RepeatableColumn[] = [
    { key: "location", label: { en: "Location", si: "ස්ථානය" }, type: "text" },
    { key: "justification", label: { en: "Justification", si: "හේතුව" }, type: "text" },
  ];

  const noPublicTransportAreaColumns: RepeatableColumn[] = [
    { key: "area", label: { en: "Area", si: "ප්‍රදේශය" }, type: "text" },
    { key: "nearestRoute", label: { en: "Nearest Route", si: "ආසන්නතම මාර්ගය" }, type: "text" },
    { key: "distanceKm", label: { en: "Distance (km)", si: "දුර (කි.මී.)" }, type: "number" },
  ];

  const railwayCrossingGapColumns: RepeatableColumn[] = [
    { key: "location", label: { en: "Location", si: "ස්ථානය" }, type: "text" },
    { key: "roadName", label: { en: "Road Name", si: "පාරේ නම" }, type: "text" },
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
    { key: "label", label: { en: "Category", si: "වර්ගය" }, type: "readonly" },
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
    { key: "label", label: { en: "Facility", si: "පහසුකම" }, type: "readonly" },
    { key: "present", label: { en: "Present", si: "පවතී ද" }, type: "select", options: YES_NO_OPTIONS },
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
  ];

  const notableClubBarColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "type", label: { en: "Type", si: "වර්ගය" }, type: "text" },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
  ];

  return (
    <SectionForm
      sectionNumber={10}
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
          emptyRowFactory={() => ({ roadName: "", roadNumber: "", lengthMeters: 0, currentCondition: "", priorityRank: 0 })}
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
          emptyRowFactory={() => ({ location: "", justification: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="noPublicTransportAreas"
          title={roadInfrastructureDict.fields.noPublicTransportAreas}
          columns={noPublicTransportAreaColumns}
          emptyRowFactory={() => ({ area: "", nearestRoute: "", distanceKm: 0 })}
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
          emptyRowFactory={() => ({ label: "", count: 0 })}
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
          emptyRowFactory={() => ({ label: "", present: "no", name: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="notableClubsAndBars"
          title={roadInfrastructureDict.fields.notableClubsAndBars}
          columns={notableClubBarColumns}
          emptyRowFactory={() => ({ name: "", type: "", address: "" })}
        />
      </div>
    </SectionForm>
  );
}
