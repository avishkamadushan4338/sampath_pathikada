"use client";

import { GnScopedSectionView } from "@/components/analytics/GnScopedSectionView";
import { ReadOnlyTable, type ReadOnlyColumn } from "@/components/analytics/ReadOnlyTable";
import { ReadOnlyStats } from "@/components/analytics/ReadOnlyStats";
import { Bilingual } from "@/components/Bilingual";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { physicalEnvironmentDict } from "@/lib/i18n/sections/physical-environment";
import { useAreaAnalytics } from "@/hooks/use-area-analytics";
import type { AreaProfileAggregate } from "@/lib/analytics/aggregate-sections";

const OCCURRED_OPTIONS = [
  { value: "yes", label: { en: "Yes", si: "ඔව්" } },
  { value: "no", label: { en: "No", si: "නැත" } },
];

const WATER_SOURCE_TYPE_LABELS: Record<string, { en: string; si: string }> = {
  river: { en: "River", si: "ගංගාව" },
  reservoir: { en: "Reservoir", si: "ජලාශය" },
  springs: { en: "Springs", si: "උල්පත්/ බුබුලු" },
  tank: { en: "Tank", si: "වැව" },
  streams: { en: "Streams", si: "දියඇලි" },
  publicWells: { en: "Public Wells (Count)", si: "පොදු ළිං(ගණන)" },
  tubeWells: { en: "Tube Wells (Count)", si: "නල ළිං(ගණන)" },
};

const HAZARD_TYPE_LABELS: Record<string, { en: string; si: string }> = {
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

const FREQUENCY_OPTIONS = [
  { value: "seasonal", label: { en: "Seasonal / Periodic", si: "කාලීන" } },
  { value: "year-round", label: { en: "Year-round", si: "වර්ෂය පුරා" } },
];

const GN_DIVISION_COLUMN: ReadOnlyColumn = { key: "gnName", label: { en: "GN Division", si: "ග්‍රාම නිලධාරී වසම" } };

/** Whole-division rollup: every approved GN division's Physical & Environment rows pooled
 *  together, each tagged with its source GN division so the DS can still tell them apart. */
function PhysicalEnvironmentAreaWideView({ aggregate }: { aggregate: AreaProfileAggregate }) {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-fluid-sm text-muted-foreground">
        <Bilingual
          en="Aggregated across every GN division with an approved submission in your division. Select a GN division above to see its individual data."
          si="ඔබගේ කොට්ඨාසයේ අනුමත ඉදිරිපත් කිරීමක් ඇති සියලුම ග්‍රාම නිලධාරී වසම් හරහා එකතු කර ඇත. තනි වසමක දත්ත බැලීමට ඉහත ග්‍රාම නිලධාරී වසමක් තෝරන්න."
        />
      </p>
      <ReadOnlyTable
        title={physicalEnvironmentDict.fields.waterSources}
        columns={[
          GN_DIVISION_COLUMN,
          {
            key: "type",
            label: { en: "Water Source", si: "ජල මූලාශ්‍රය" },
            options: Object.entries(WATER_SOURCE_TYPE_LABELS).map(([value, label]) => ({ value, label })),
          },
          { key: "name", label: { en: "Name", si: "නම" } },
        ]}
        rows={aggregate.waterSources.rows}
      />
      <ReadOnlyTable
        title={physicalEnvironmentDict.fields.sensitiveZones}
        columns={[
          GN_DIVISION_COLUMN,
          { key: "zoneName", label: { en: "Environmentally Sensitive Zone / Location", si: "පාරිසරික වශයෙන් සංවේදී කලාප/ස්ථාන" } },
          { key: "significance", label: { en: "Importance of the Location / Zone", si: "ස්ථානයේ /කලාපයේ වැදගත්කම" } },
          { key: "managingAuthority", label: { en: "Managing Institution", si: "පාලනය කරනු ලබන ආයතනය" } },
        ]}
        rows={aggregate.sensitiveZones.rows}
      />
      <ReadOnlyTable
        title={physicalEnvironmentDict.fields.naturalResources}
        columns={[
          GN_DIVISION_COLUMN,
          { key: "resource", label: { en: "Physical Resource Identified in the Area", si: "ප්‍රදේශයේ හඳුනා ගන්නා ලද භෞතික සම්පත්" } },
          { key: "utilizedForProduction", label: { en: "Used for Production / Development?", si: "නිෂ්පාදනය කටයුත්තකට, සංවර්ධනයට යොදාගෙන තිබේද" }, options: OCCURRED_OPTIONS },
          { key: "notes", label: { en: "Notes", si: "සටහන්" } },
        ]}
        rows={aggregate.naturalResources.rows}
      />
      <ReadOnlyTable
        title={physicalEnvironmentDict.fields.hazards}
        columns={[
          GN_DIVISION_COLUMN,
          {
            key: "type",
            label: { en: "Environmental Problem", si: "පාරිසරික ගැටළු" },
            options: Object.entries(HAZARD_TYPE_LABELS).map(([value, label]) => ({ value, label })),
          },
          { key: "occurred", label: { en: "Occurred?", si: "ඇත/නැත" }, options: OCCURRED_OPTIONS },
          { key: "frequency", label: { en: "If Yes, the Common Time Period", si: "ඇත්නම් බහුලව සිදුවන කාල සීමාව" } },
          { key: "mitigationProposal", label: { en: "Proposed Remedial Measures for the Problem", si: "ගැටළුව සඳහා ගතයුතු පිළියම් යෝජනා" } },
        ]}
        rows={aggregate.hazards.rows}
      />
      <ReadOnlyTable
        title={physicalEnvironmentDict.fields.safeLocations}
        columns={[
          GN_DIVISION_COLUMN,
          { key: "name", label: { en: "Name of the Safe Location", si: "ආරක්ෂිත ස්ථානයේ නම" } },
          { key: "address", label: { en: "Address", si: "ලිපිනය" } },
        ]}
        rows={aggregate.safeLocations.rows}
      />
      <ReadOnlyTable
        title={physicalEnvironmentDict.fields.touristSites}
        columns={[
          GN_DIVISION_COLUMN,
          { key: "siteName", label: { en: "Name of Location with Tourist Attraction", si: "සංචාරක ආකර්ෂණය සහිත ස්ථානය නම" } },
          { key: "reasonForAttraction", label: { en: "Reason for Attraction / Specialty of the Location", si: "සංචාරක ආකර්ෂණය ඇතිවීමට හේතුව/ස්ථානයේ විශේෂත්වය" } },
          { key: "maintainedBy", label: { en: "Managing Institution / Ownership", si: "පාලනය කරනු ලබන ආයතනය / අයිතිය" } },
          { key: "frequency", label: { en: "Tourist Visitation", si: "සංචාරකයන්ගේ පැමිණීම" }, options: FREQUENCY_OPTIONS },
        ]}
        rows={aggregate.existingTouristSitesFromPhysicalEnv.rows}
      />
      <ReadOnlyTable
        title={physicalEnvironmentDict.fields.proposedTouristSites}
        columns={[
          GN_DIVISION_COLUMN,
          { key: "siteName", label: { en: "Name of Proposed Suitable Location", si: "සංචාරක ආකර්ෂණය ඇතිකිරීමට සුදුසු යෝජිත ස්ථානයේ නම" } },
          { key: "specialFeatures", label: { en: "Specialty of the Proposed Location", si: "සංචාරක ආකර්ෂණය ඇතිකිරීමට යෝජිත ස්ථානයේ විශේෂත්වය" } },
          { key: "possibleActivities", label: { en: "Activities Possible at the Location", si: "සංචාරක ආකර්ෂණය ඇතිකිරීමට එම ස්ථානයේ සිදුකිරීමට හැකි ක්‍රියාකාරකම්" } },
          { key: "currentAuthority", label: { en: "Institution Currently Managing / Ownership", si: "දැනට පාලනය කරනු ලබන ආයතනය / අයිතිය" } },
        ]}
        rows={aggregate.proposedTouristSites.rows}
      />
    </div>
  );
}

/** GN-division-scoped view of the "Physical & Environment" section (§3): water sources,
 *  environmentally sensitive zones, natural resources, hazards, safe/evacuation locations, and
 *  existing/proposed tourist sites for whichever GN division the DS searches or selects. Before a
 *  division is picked, falls back to the whole-division aggregate (every approved GN division's
 *  rows pooled together) rather than an empty prompt. */
export function PhysicalEnvironmentView() {
  const { lang } = useLanguage();
  const { data: area, isLoading: areaLoading, isError: areaError } = useAreaAnalytics();

  return (
    <GnScopedSectionView
      prompt={{
        en: "Search or select a GN division above to view its Physical & Environment data.",
        si: "එහි භෞතික හා පාරිසරික දත්ත බැලීමට ඉහත ග්‍රාම නිලධාරී වසමක් සොයන්න හෝ තෝරන්න.",
      }}
      unselectedContent={
        areaLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        ) : areaError || !area ? (
          <Card>
            <CardContent className="text-fluid-sm text-muted-foreground">
              <Bilingual
                en="Unable to load whole-division Physical & Environment data right now. Please try again shortly."
                si="සම්පූර්ණ කොට්ඨාසයේ භෞතික හා පාරිසරික තොරතුරු මෙම මොහොතේ පූරණය කළ නොහැක. ටික වේලාවකින් නැවත උත්සාහ කරන්න."
              />
            </CardContent>
          </Card>
        ) : (
          <PhysicalEnvironmentAreaWideView aggregate={area.sections.areaProfile} />
        )
      }
    >
      {(profile) => {
        const section = profile.data.physicalEnvironment;
        return (
          <div className="flex flex-col gap-8">
            <ReadOnlyTable
              title={physicalEnvironmentDict.fields.waterSources}
              columns={[
                {
                  key: "type",
                  label: { en: "Water Source", si: "ජල මූලාශ්‍රය" },
                  options: Object.entries(WATER_SOURCE_TYPE_LABELS).map(([value, label]) => ({ value, label })),
                },
                { key: "name", label: { en: "Name", si: "නම" } },
              ]}
              rows={section?.waterSources ?? []}
            />
            <ReadOnlyTable
              title={physicalEnvironmentDict.fields.sensitiveZones}
              columns={[
                { key: "zoneName", label: { en: "Environmentally Sensitive Zone / Location", si: "පාරිසරික වශයෙන් සංවේදී කලාප/ස්ථාන" } },
                { key: "significance", label: { en: "Importance of the Location / Zone", si: "ස්ථානයේ /කලාපයේ වැදගත්කම" } },
                { key: "managingAuthority", label: { en: "Managing Institution", si: "පාලනය කරනු ලබන ආයතනය" } },
              ]}
              rows={section?.sensitiveZones ?? []}
            />
            <ReadOnlyTable
              title={physicalEnvironmentDict.fields.naturalResources}
              columns={[
                { key: "resource", label: { en: "Physical Resource Identified in the Area", si: "ප්‍රදේශයේ හඳුනා ගන්නා ලද භෞතික සම්පත්" } },
                { key: "utilizedForProduction", label: { en: "Used for Production / Development?", si: "නිෂ්පාදනය කටයුත්තකට, සංවර්ධනයට යොදාගෙන තිබේද" }, options: OCCURRED_OPTIONS },
                { key: "notes", label: { en: "Notes", si: "සටහන්" } },
              ]}
              rows={section?.naturalResources ?? []}
            />
            <ReadOnlyTable
              title={physicalEnvironmentDict.fields.hazards}
              columns={[
                {
                  key: "type",
                  label: { en: "Environmental Problem", si: "පාරිසරික ගැටළු" },
                  options: Object.entries(HAZARD_TYPE_LABELS).map(([value, label]) => ({ value, label })),
                },
                { key: "occurred", label: { en: "Occurred?", si: "ඇත/නැත" }, options: OCCURRED_OPTIONS },
                { key: "frequency", label: { en: "If Yes, the Common Time Period", si: "ඇත්නම් බහුලව සිදුවන කාල සීමාව" } },
                { key: "mitigationProposal", label: { en: "Proposed Remedial Measures for the Problem", si: "ගැටළුව සඳහා ගතයුතු පිළියම් යෝජනා" } },
              ]}
              rows={section?.hazards ?? []}
            />
            <ReadOnlyStats
              title={physicalEnvironmentDict.fields.safeLocationsIdentified}
              stats={[
                {
                  key: "value",
                  label: { en: "Identified?", si: "හඳුනාගෙන තිබේද" },
                  value: section?.safeLocationsIdentified
                    ? OCCURRED_OPTIONS.find((o) => o.value === section.safeLocationsIdentified)?.label[lang]
                    : undefined,
                },
              ]}
            />
            <ReadOnlyTable
              title={physicalEnvironmentDict.fields.safeLocations}
              columns={[
                { key: "name", label: { en: "Name of the Safe Location", si: "ආරක්ෂිත ස්ථානයේ නම" } },
                { key: "address", label: { en: "Address", si: "ලිපිනය" } },
              ]}
              rows={section?.safeLocations ?? []}
            />
            <ReadOnlyTable
              title={physicalEnvironmentDict.fields.touristSites}
              columns={[
                { key: "siteName", label: { en: "Name of Location with Tourist Attraction", si: "සංචාරක ආකර්ෂණය සහිත ස්ථානය නම" } },
                { key: "reasonForAttraction", label: { en: "Reason for Attraction / Specialty of the Location", si: "සංචාරක ආකර්ෂණය ඇතිවීමට හේතුව/ස්ථානයේ විශේෂත්වය" } },
                { key: "maintainedBy", label: { en: "Managing Institution / Ownership", si: "පාලනය කරනු ලබන ආයතනය / අයිතිය" } },
                { key: "frequency", label: { en: "Tourist Visitation", si: "සංචාරකයන්ගේ පැමිණීම" }, options: FREQUENCY_OPTIONS },
              ]}
              rows={section?.touristSites ?? []}
            />
            <ReadOnlyTable
              title={physicalEnvironmentDict.fields.proposedTouristSites}
              columns={[
                { key: "siteName", label: { en: "Name of Proposed Suitable Location", si: "සංචාරක ආකර්ෂණය ඇතිකිරීමට සුදුසු යෝජිත ස්ථානයේ නම" } },
                { key: "specialFeatures", label: { en: "Specialty of the Proposed Location", si: "සංචාරක ආකර්ෂණය ඇතිකිරීමට යෝජිත ස්ථානයේ විශේෂත්වය" } },
                { key: "possibleActivities", label: { en: "Activities Possible at the Location", si: "සංචාරක ආකර්ෂණය ඇතිකිරීමට එම ස්ථානයේ සිදුකිරීමට හැකි ක්‍රියාකාරකම්" } },
                { key: "currentAuthority", label: { en: "Institution Currently Managing / Ownership", si: "දැනට පාලනය කරනු ලබන ආයතනය / අයිතිය" } },
              ]}
              rows={section?.proposedTouristSites ?? []}
            />
          </div>
        );
      }}
    </GnScopedSectionView>
  );
}
