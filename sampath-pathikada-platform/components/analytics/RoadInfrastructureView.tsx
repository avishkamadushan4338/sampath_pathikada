"use client";

import { GnScopedSectionView } from "@/components/analytics/GnScopedSectionView";
import { ReadOnlyStats, type ReadOnlyStat } from "@/components/analytics/ReadOnlyStats";
import { ReadOnlyTable, type ReadOnlyColumn } from "@/components/analytics/ReadOnlyTable";
import { Bilingual } from "@/components/Bilingual";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAreaAnalytics } from "@/hooks/use-area-analytics";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { roadInfrastructureDict } from "@/lib/i18n/sections/road-infrastructure";
import type { Translated } from "@/lib/i18n/types";
import type { InfrastructureAggregate } from "@/lib/analytics/aggregate-sections";
import type { RoadInfrastructureData } from "@/lib/validators/sections/road-infrastructure";
import { SERVICE_CATEGORIES, PUBLIC_FACILITY_CATEGORIES } from "@/lib/validators/sections/road-infrastructure";

const YES_NO_OPTIONS = [
  { value: "yes", label: { en: "Yes", si: "ඔව්" } },
  { value: "no", label: { en: "No", si: "නැත" } },
];

const PUBLIC_FACILITY_OPTIONS = [
  { value: "busStand", label: { en: "Bus Stand", si: "බස් නැවතුම් පොළ" } },
  { value: "railwayStation", label: { en: "Railway Station", si: "දුම්රිය නැවතුම් පොළ" } },
  { value: "port", label: { en: "Port", si: "වරාය" } },
  { value: "airport", label: { en: "Airport", si: "ගුවන්තොටුපළ" } },
];

const ROAD_SURFACE_TYPE_OPTIONS = [
  { value: "carpet", label: { en: "Carpet (Asphalt)", si: "කාපට්" } },
  { value: "tar", label: { en: "Tar", si: "තාර" } },
  { value: "concrete", label: { en: "Concrete", si: "කොන්ක්‍රීට්" } },
  { value: "interlock", label: { en: "Interlock", si: "Interlock" } },
  { value: "gravel-soil", label: { en: "Gravel / Soil", si: "බොරළු/පස්" } },
];

const POST_OFFICE_TYPE_OPTIONS = [
  { value: "head-post-office", label: { en: "Head Post Office", si: "අධිශ්‍රේණියේ තැපැල් කාර්යාලය" } },
  { value: "first-grade-sub-post-office", label: { en: "1st Grade Sub Post Office", si: "පළමු පෙළ තැපැල් කාර්යාලය" } },
  { value: "second-grade-sub-post-office", label: { en: "2nd Grade Sub Post Office", si: "දෙවන පෙළ තැපැල් කාර්යාලය" } },
  { value: "sub-post-office", label: { en: "Sub Post Office", si: "උප තැපැල් කාර්යාලය" } },
  { value: "appointed-post-office", label: { en: "Appointed Post Office", si: "නියෝජිත තැපැල් කාර්යාලය" } },
  { value: "postal-box-and-counter", label: { en: "Postal Box & Counter", si: "තැපැල් කණු හා පෙට්ටිය" } },
];

const HYDROPOWER_SCALE_OPTIONS = [
  { value: "mini", label: { en: "Mini", si: "කුඩා" } },
  { value: "major", label: { en: "Major", si: "විශාල" } },
];

const FINANCIAL_INSTITUTION_TYPE_OPTIONS = [
  { value: "govt-bank", label: { en: "Government Bank", si: "රාජ්‍ය බැංකුව" } },
  { value: "private-bank", label: { en: "Private Bank", si: "පෞද්ගලික බැංකුව" } },
  { value: "cooperative-rural-bank", label: { en: "Cooperative Rural Bank", si: "සමූපකාර ග්‍රාමීය බැංකුව" } },
  { value: "samurdhi-bank", label: { en: "Samurdhi Bank", si: "සමෘද්ධි බැංකුව" } },
];

const SERVICE_CATEGORY_LABELS: Record<(typeof SERVICE_CATEGORIES)[number], Translated> = {
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

const PUBLIC_FACILITY_CATEGORY_LABELS: Record<(typeof PUBLIC_FACILITY_CATEGORIES)[number], Translated> = {
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

const SERVICE_CATEGORY_OPTIONS = SERVICE_CATEGORIES.map((value) => ({ value, label: SERVICE_CATEGORY_LABELS[value] }));
const PUBLIC_FACILITY_CATEGORY_OPTIONS = PUBLIC_FACILITY_CATEGORIES.map((value) => ({ value, label: PUBLIC_FACILITY_CATEGORY_LABELS[value] }));

const GN_DIVISION_COLUMN: ReadOnlyColumn = { key: "gnName", label: { en: "GN Division", si: "ග්‍රාම නිලධාරී වසම" } };

const PUBLIC_FACILITIES_COLUMNS: ReadOnlyColumn[] = [
  { key: "facility", label: { en: "Facility", si: "පහසුකම" }, options: PUBLIC_FACILITY_OPTIONS },
  { key: "present", label: { en: "Present", si: "ඇත/ නැත" }, options: YES_NO_OPTIONS },
  { key: "name", label: { en: "Name of the Location", si: "ස්ථානයේ නම" } },
];

const PUBLIC_FACILITY_COUNT_FIELDS: { key: string; label: Translated }[] = PUBLIC_FACILITY_OPTIONS.map((o) => ({ key: o.value, label: o.label }));

const ROAD_DEVELOPMENT_NEED_COLUMNS: ReadOnlyColumn[] = [
  { key: "roadName", label: { en: "Road Name", si: "මාර්ගයේ නම" } },
  { key: "roadNumber", label: { en: "Road Number (if any)", si: "මාර්ග අංකය (තිබෙනම්)" } },
  { key: "lengthMeters", label: { en: "Length (m)", si: "දිග ප්‍රමාණය (m)" } },
  { key: "surfaceType", label: { en: "* Current Road Surface", si: "*දැනට මාර්ගයේ ස්වභාවය" }, options: ROAD_SURFACE_TYPE_OPTIONS },
  { key: "maintainingAuthority", label: { en: "** Maintaining Authority", si: "**නඩත්තු කරනු ලබන ආයතනය" } },
];

const BRIDGE_REPAIR_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Bridge / Culvert / Footpath", si: "පාලම/බෝක්කුව/පැතිබැම්" } },
  { key: "roadNumber", label: { en: "Road Number", si: "මාර්ග අංකය" } },
  { key: "location", label: { en: "Location (Describe)", si: "පිහිටීම (විස්තර කරන්න)" } },
  { key: "maintainingAuthority", label: { en: "** Maintaining Authority", si: "**නඩත්තු කරනු ලබන ආයතනය" } },
];

const NEW_ROAD_BRIDGE_NEED_COLUMNS: ReadOnlyColumn[] = [
  { key: "location", label: { en: "Required Location", si: "අවශ්‍ය ස්ථානය" } },
  { key: "roadNumber", label: { en: "Road Number", si: "මාර්ග අංකය" } },
  { key: "justification", label: { en: "Describe the Need", si: "අවශ්‍යතාවය විස්තර කරන්න" } },
];

const NO_PUBLIC_TRANSPORT_AREA_COLUMNS: ReadOnlyColumn[] = [
  { key: "roadName", label: { en: "* Road Name", si: "*මාර්ගයේ නම" } },
  { key: "roadNumber", label: { en: "Road Number", si: "මාර්ග අංකය" } },
  { key: "startPoint", label: { en: "Start Point", si: "ආරම්භක ස්ථානය" } },
  { key: "endPoint", label: { en: "End Point", si: "අවසන් ස්ථානය" } },
  { key: "distanceKm", label: { en: "Distance", si: "දුර ප්‍රමාණය" } },
  { key: "requiredBeneficiaryCount", label: { en: "Beneficiaries Needing Service", si: "සේවාව අවශ්‍ය ප්‍රතිලාභීසංඛ්‍යාව" } },
];

const RAILWAY_CROSSING_GAP_COLUMNS: ReadOnlyColumn[] = [
  { key: "roadName", label: { en: "Road Name at the Railway Crossing", si: "දුම්රිය මාර්ගය හරස්ව පිහිටි මාර්ගයේ නම" } },
  { key: "roadNumber", label: { en: "Road Number", si: "මාර්ග අංකය" } },
  { key: "location", label: { en: "Location", si: "ස්ථානය" } },
];

const POST_OFFICE_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Name", si: "නම" } },
  { key: "type", label: { en: "* Type", si: "*වර්ගය" }, options: POST_OFFICE_TYPE_OPTIONS },
];

const FUEL_STATION_COLUMNS: ReadOnlyColumn[] = [{ key: "name", label: { en: "Filling Station Name", si: "පිරවුම්හලේ නම" } }];

const NAMED_FACILITY_COLUMNS: ReadOnlyColumn[] = [{ key: "name", label: { en: "Name", si: "නම" } }];

const HYDROPOWER_PLANT_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Name", si: "නම" } },
  { key: "scale", label: { en: "Scale", si: "ධාරිතාව" }, options: HYDROPOWER_SCALE_OPTIONS },
];

const FINANCIAL_INSTITUTION_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "* Bank / Financial Institution / Insurance Institution Name", si: "*බැංකුවේ/ මූල්‍ය ආයතනයේ /රක්ෂණ ආයතනයේ නම" } },
  { key: "type", label: { en: "Government / Private", si: "රාජ්‍ය/ පෞද්ගලික" }, options: FINANCIAL_INSTITUTION_TYPE_OPTIONS },
];

const SERVICE_ESTABLISHMENT_COLUMNS: ReadOnlyColumn[] = [
  { key: "category", label: { en: "Category", si: "වර්ගය" }, options: SERVICE_CATEGORY_OPTIONS },
  { key: "count", label: { en: "Number of Trade Institutions", si: "වෙළඳ ආයතන සංඛ්‍යාව" } },
];

const INDUSTRIAL_ESTATE_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Name", si: "නම" } },
  { key: "location", label: { en: "Location", si: "ස්ථානය" } },
];

const PUBLIC_FACILITY_CATEGORY_COLUMNS_GN: ReadOnlyColumn[] = [
  { key: "category", label: { en: "Type", si: "වර්ගය" }, options: PUBLIC_FACILITY_CATEGORY_OPTIONS },
  { key: "present", label: { en: "Present", si: "ඇත/නැත" }, options: YES_NO_OPTIONS },
  { key: "count", label: { en: "Count", si: "සංඛ්‍යාව" } },
  {
    key: "distanceToNearestIfOutsideDivision",
    label: { en: "Distance to Nearest (if not located within the division)", si: "වසම තුල පිහිටා නැත නම් ආසන්නතම ස්ථානයන්ට ඇති දුර" },
  },
];

const PUBLIC_FACILITY_CATEGORY_COLUMNS_AREA: ReadOnlyColumn[] = [
  { key: "category", label: { en: "Type", si: "වර්ගය" }, options: PUBLIC_FACILITY_CATEGORY_OPTIONS },
  { key: "presentCount", label: { en: "GN Divisions With It", si: "පවතින ග්‍රාම නිලධාරී වසම් ගණන" } },
  { key: "totalCount", label: { en: "Total Count", si: "මුළු සංඛ්‍යාව" } },
];

const LICENSED_LIQUOR_SHOP_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Licensed Tavern / Bar Name", si: "බලපත්‍රලාභී තැබෑරුම් /බාර් නම" } },
  { key: "address", label: { en: "Address", si: "ලිපිනය" } },
];

/** Builds the {key, label, value} triples ReadOnlyStats needs from a fixed field list plus
 *  whatever numeric object holds the actual figures — shared by the per-GN and area-wide
 *  renderings so both stay in sync with the same field set. */
function toStats(fields: { key: string; label: Translated }[], values: Record<string, number | undefined>): ReadOnlyStat[] {
  return fields.map((f) => ({ key: f.key, label: f.label, value: values[f.key]?.toString() }));
}

/** Converts a repeatable-row object into the string-valued record ReadOnlyTable expects,
 *  stringifying numbers and passing strings through untouched. */
function toRows(rows: Record<string, unknown>[]): Record<string, string | undefined>[] {
  return rows.map((row) => {
    const out: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(row)) {
      out[key] = value === undefined || value === null ? undefined : String(value);
    }
    return out;
  });
}

function yesNoLabel(value: "yes" | "no" | undefined, lang: "en" | "si"): string {
  if (value === "yes") return lang === "si" ? "ඔව්" : "Yes";
  if (value === "no") return lang === "si" ? "නැත" : "No";
  return "—";
}

/** GN-division-scoped view of the "Transport & Infrastructure" section (§11): common public
 *  facilities (bus stand/railway/port/airport), road & bridge needs, post offices, utilities,
 *  financial institutions, service establishments, industrial estates, and licensed liquor shops
 *  for whichever GN division the DS searches or selects — or, before any division is picked, the
 *  whole-division aggregate across every approved GN division. Field list/order/categories match
 *  the official "10. යටිතල පහසුකම්" paper form exactly. */
export function RoadInfrastructureView() {
  const { data: area, isLoading: areaLoading, isError: areaError } = useAreaAnalytics();

  return (
    <GnScopedSectionView
      prompt={{
        en: "Search or select a GN division above to view its Transport & Infrastructure data.",
        si: "එහි ප්‍රවාහන හා යටිතල පහසුකම් තොරතුරු බැලීමට ඉහත ග්‍රාම නිලධාරී වසමක් සොයන්න හෝ තෝරන්න.",
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
                en="Unable to load whole-division Transport & Infrastructure data right now. Please try again shortly."
                si="සම්පූර්ණ කොට්ඨාසයේ ප්‍රවාහන හා යටිතල පහසුකම් තොරතුරු මෙම මොහොතේ පූරණය කළ නොහැක. ටික වේලාවකින් නැවත උත්සාහ කරන්න."
              />
            </CardContent>
          </Card>
        ) : (
          <RoadInfrastructureAreaWideView aggregate={area.sections.infrastructure} />
        )
      }
    >
      {(profile) => {
        const section = profile.data.roadInfrastructure;

        if (!section) {
          return (
            <Card>
              <CardContent className="text-fluid-sm text-muted-foreground">
                <Bilingual
                  en="This GN division's approved submission doesn't include Transport & Infrastructure data yet."
                  si="මෙම ග්‍රාම නිලධාරී වසමේ අනුමත ඉදිරිපත් කිරීමේ ප්‍රවාහන හා යටිතල පහසුකම් තොරතුරු තවම ඇතුළත් නොවේ."
                />
              </CardContent>
            </Card>
          );
        }

        return <RoadInfrastructureSectionContent section={section} />;
      }}
    </GnScopedSectionView>
  );
}

function RoadInfrastructureSectionContent({ section }: { section: RoadInfrastructureData }) {
  const { lang } = useLanguage();

  // publicFacilities is a checklist array now (a division can list more than one row per
  // category, e.g. two bus stands), so this maps straight over the saved rows instead of
  // looking up one fixed field per category.
  const publicFacilitiesRows = section.publicFacilities.map((facility) => ({
    facility: facility.type,
    present: facility.present,
    name: facility.name,
  }));

  const totalRoadLength = section.roadDevelopmentNeeds.reduce((sum, r) => sum + (r.lengthMeters ?? 0), 0);

  return (
    <div className="flex flex-col gap-8">
      <ReadOnlyTable title={roadInfrastructureDict.fields.publicFacilities} columns={PUBLIC_FACILITIES_COLUMNS} rows={toRows(publicFacilitiesRows)} />

      <ReadOnlyStats
        title={{ en: "Total Road Development Length", si: "මුළු පාර සංවර්ධන දිග" }}
        stats={[{ key: "totalRoadLength", label: { en: "Length (Meters)", si: "දිග (මීටර්)" }, value: totalRoadLength.toString() }]}
      />
      <ReadOnlyTable title={roadInfrastructureDict.fields.roadDevelopmentNeeds} columns={ROAD_DEVELOPMENT_NEED_COLUMNS} rows={toRows(section.roadDevelopmentNeeds)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.bridgeRepairs} columns={BRIDGE_REPAIR_COLUMNS} rows={toRows(section.bridgeRepairs)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.newRoadBridgeNeeds} columns={NEW_ROAD_BRIDGE_NEED_COLUMNS} rows={toRows(section.newRoadBridgeNeeds)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.noPublicTransportAreas} columns={NO_PUBLIC_TRANSPORT_AREA_COLUMNS} rows={toRows(section.noPublicTransportAreas)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.railwayCrossingGaps} columns={RAILWAY_CROSSING_GAP_COLUMNS} rows={toRows(section.railwayCrossingGaps)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.postOffices} columns={POST_OFFICE_COLUMNS} rows={toRows(section.postOffices)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.fuelDistributionStations} columns={FUEL_STATION_COLUMNS} rows={toRows(section.fuelDistributionStations)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.solarPowerPlants} columns={HYDROPOWER_PLANT_COLUMNS} rows={toRows(section.solarPowerPlants)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.windPowerPlants} columns={HYDROPOWER_PLANT_COLUMNS} rows={toRows(section.windPowerPlants)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.hydropowerPlants} columns={HYDROPOWER_PLANT_COLUMNS} rows={toRows(section.hydropowerPlants)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.financialInstitutions} columns={FINANCIAL_INSTITUTION_COLUMNS} rows={toRows(section.financialInstitutions)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.serviceEstablishments} columns={SERVICE_ESTABLISHMENT_COLUMNS} rows={toRows(section.serviceEstablishments)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.industrialEstates} columns={INDUSTRIAL_ESTATE_COLUMNS} rows={toRows(section.industrialEstates)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.waterReservoirs} columns={NAMED_FACILITY_COLUMNS} rows={toRows(section.waterReservoirs)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.publicFacilityCategories} columns={PUBLIC_FACILITY_CATEGORY_COLUMNS_GN} rows={toRows(section.publicFacilityCategories)} />

      <ReadOnlyStats
        title={roadInfrastructureDict.fields.licensedLiquorShopsPresent}
        stats={[{ key: "licensedLiquorShopsPresent", label: { en: "Status", si: "තත්ත්වය" }, value: yesNoLabel(section.licensedLiquorShopsPresent, lang) }]}
      />
      <ReadOnlyTable title={roadInfrastructureDict.fields.licensedLiquorShops} columns={LICENSED_LIQUOR_SHOP_COLUMNS} rows={toRows(section.licensedLiquorShops)} />
    </div>
  );
}

/** Whole-division rollup of every approved GN division's Transport & Infrastructure data: public
 *  facility presence and fixed-category groups are summed by category (service establishments
 *  stay sorted most-common-first, exactly as `aggregateInfrastructure` already orders them), and
 *  every directory is pooled with a GN Division column added — same shape `aggregateInfrastructure`
 *  already produces. */
function RoadInfrastructureAreaWideView({ aggregate }: { aggregate: InfrastructureAggregate }) {
  const serviceCategoryByEnLabel = new Map(SERVICE_CATEGORIES.map((c) => [SERVICE_CATEGORY_LABELS[c].en, c]));
  const serviceEstablishmentRows = aggregate.serviceEstablishments.map((r) => ({
    category: serviceCategoryByEnLabel.get(r.en) ?? SERVICE_CATEGORIES[0],
    count: r.count,
  }));
  const publicFacilityCategoryRows = PUBLIC_FACILITY_CATEGORIES.map((category, i) => ({
    category,
    presentCount: aggregate.publicFacilityCategories[i]?.presentCount ?? 0,
    totalCount: aggregate.publicFacilityCategories[i]?.totalCount ?? 0,
  }));

  return (
    <div className="flex flex-col gap-8">
      <p className="text-fluid-sm text-muted-foreground">
        <Bilingual
          en="Aggregated across every GN division with an approved submission in your division. Select a GN division above to see its individual data."
          si="ඔබගේ කොට්ඨාසයේ අනුමත ඉදිරිපත් කිරීමක් ඇති සියලුම ග්‍රාම නිලධාරී වසම් හරහා එකතු කර ඇත. තනි වසමක දත්ත බැලීමට ඉහත ග්‍රාම නිලධාරී වසමක් තෝරන්න."
        />
      </p>

      <ReadOnlyStats title={roadInfrastructureDict.fields.publicFacilities} stats={toStats(PUBLIC_FACILITY_COUNT_FIELDS, { ...aggregate.publicFacilities })} />

      <ReadOnlyStats
        title={{ en: "Total Road Development Length", si: "මුළු පාර සංවර්ධන දිග" }}
        stats={[{ key: "totalRoadLength", label: { en: "Length (Meters)", si: "දිග (මීටර්)" }, value: aggregate.totalRoadDevelopmentLengthMeters.toString() }]}
      />
      <ReadOnlyTable title={roadInfrastructureDict.fields.roadDevelopmentNeeds} columns={[GN_DIVISION_COLUMN, ...ROAD_DEVELOPMENT_NEED_COLUMNS]} rows={toRows(aggregate.roadDevelopmentNeeds.rows)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.bridgeRepairs} columns={[GN_DIVISION_COLUMN, ...BRIDGE_REPAIR_COLUMNS]} rows={toRows(aggregate.bridgeRepairs.rows)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.newRoadBridgeNeeds} columns={[GN_DIVISION_COLUMN, ...NEW_ROAD_BRIDGE_NEED_COLUMNS]} rows={toRows(aggregate.newRoadBridgeNeeds.rows)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.noPublicTransportAreas} columns={[GN_DIVISION_COLUMN, ...NO_PUBLIC_TRANSPORT_AREA_COLUMNS]} rows={toRows(aggregate.noPublicTransportAreas.rows)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.railwayCrossingGaps} columns={[GN_DIVISION_COLUMN, ...RAILWAY_CROSSING_GAP_COLUMNS]} rows={toRows(aggregate.railwayCrossingGaps.rows)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.postOffices} columns={[GN_DIVISION_COLUMN, ...POST_OFFICE_COLUMNS]} rows={toRows(aggregate.postOffices.rows)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.fuelDistributionStations} columns={[GN_DIVISION_COLUMN, ...FUEL_STATION_COLUMNS]} rows={toRows(aggregate.fuelDistributionStations.rows)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.solarPowerPlants} columns={[GN_DIVISION_COLUMN, ...HYDROPOWER_PLANT_COLUMNS]} rows={toRows(aggregate.solarPowerPlants.rows)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.windPowerPlants} columns={[GN_DIVISION_COLUMN, ...HYDROPOWER_PLANT_COLUMNS]} rows={toRows(aggregate.windPowerPlants.rows)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.hydropowerPlants} columns={[GN_DIVISION_COLUMN, ...HYDROPOWER_PLANT_COLUMNS]} rows={toRows(aggregate.hydropowerPlants.rows)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.financialInstitutions} columns={[GN_DIVISION_COLUMN, ...FINANCIAL_INSTITUTION_COLUMNS]} rows={toRows(aggregate.financialInstitutions.rows)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.serviceEstablishments} columns={SERVICE_ESTABLISHMENT_COLUMNS} rows={toRows(serviceEstablishmentRows)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.industrialEstates} columns={[GN_DIVISION_COLUMN, ...INDUSTRIAL_ESTATE_COLUMNS]} rows={toRows(aggregate.industrialEstates.rows)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.waterReservoirs} columns={[GN_DIVISION_COLUMN, ...NAMED_FACILITY_COLUMNS]} rows={toRows(aggregate.waterReservoirs.rows)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.publicFacilityCategories} columns={PUBLIC_FACILITY_CATEGORY_COLUMNS_AREA} rows={toRows(publicFacilityCategoryRows)} />
      <ReadOnlyTable title={roadInfrastructureDict.fields.licensedLiquorShops} columns={[GN_DIVISION_COLUMN, ...LICENSED_LIQUOR_SHOP_COLUMNS]} rows={toRows(aggregate.licensedLiquorShops.rows)} />
    </div>
  );
}
