"use client";

import { GnScopedSectionView } from "@/components/analytics/GnScopedSectionView";
import { ReadOnlyStats, type ReadOnlyStat } from "@/components/analytics/ReadOnlyStats";
import { ReadOnlyTable, type ReadOnlyColumn } from "@/components/analytics/ReadOnlyTable";
import { Bilingual } from "@/components/Bilingual";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAreaAnalytics } from "@/hooks/use-area-analytics";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { economicAgricultureDict } from "@/lib/i18n/sections/economic-agriculture";
import type { Translated } from "@/lib/i18n/types";
import type { EconomicAgricultureAggregate } from "@/lib/analytics/aggregate-sections";
import type { EconomicAgricultureData } from "@/lib/validators/sections/economic-agriculture";
import {
  LAND_USE_TYPES,
  FLORAL_CULTIVATION_TYPES,
  AGRI_MACHINERY_TYPES,
  CROP_DAMAGE_TYPES,
} from "@/lib/validators/sections/economic-agriculture";

const YES_NO_OPTIONS = [
  { value: "yes", label: { en: "Yes", si: "ඔව්" } },
  { value: "no", label: { en: "No", si: "නැත" } },
];

const LAND_USE_TYPE_OPTIONS = [
  { value: "forest", label: { en: "Forest", si: "වනාන්තර" } },
  { value: "paddy-cultivation", label: { en: "Paddy Cultivation", si: "වී වගාව" } },
  { value: "abandoned-paddy", label: { en: "Abandoned Paddy Land", si: "පුරන් කුඹුරු" } },
  { value: "agri-land-tea", label: { en: "Agricultural Land - Tea", si: "කෘෂිකාර්මික ඉඩම් - තේ" } },
  { value: "agri-land-coconut", label: { en: "Agricultural Land - Coconut", si: "කෘෂිකාර්මික ඉඩම් - පොල්" } },
  { value: "agri-land-rubber", label: { en: "Agricultural Land - Rubber", si: "කෘෂිකාර්මික ඉඩම් - රබර්" } },
  { value: "cinnamon", label: { en: "Cinnamon", si: "කුරුඳු" } },
  { value: "pepper", label: { en: "Pepper", si: "ගම්මිරිස්" } },
  { value: "coffee", label: { en: "Coffee", si: "කෝපි" } },
  { value: "vegetables", label: { en: "Vegetables", si: "එළවළු" } },
  { value: "fruits", label: { en: "Fruits", si: "පලතුරු" } },
  { value: "tuber-crops", label: { en: "Tuber Crops", si: "අල බෝග වගාව" } },
  { value: "supplementary-food-crops", label: { en: "Supplementary Food Crops", si: "අතිරේක ආහාර බෝග" } },
  { value: "inland-reservoirs", label: { en: "Inland Reservoirs", si: "අභ්‍යන්තර ජලාශ" } },
  { value: "roads-sports-homegardens", label: { en: "Roads / Sports Grounds / Home Gardens", si: "මාර්ග/ක්‍රීඩා භූමි/ගෙවතු වගාව" } },
  { value: "scrub-chena-barren", label: { en: "Scrubland / Chena / Barren Land", si: "ඵලදු කැළෑ/හේන්/මුඩු බිම" } },
  { value: "ornamental-nurseries", label: { en: "Ornamental Plant Nurseries", si: "විසිතුරු පැල තවාන්" } },
  { value: "plantation-crop-nurseries", label: { en: "Plantation Crop Nurseries", si: "වැවිලි බෝග පැල තවාන්" } },
  { value: "aquaculture-land", label: { en: "Aquaculture Land", si: "ජල ජීවි වගාව" } },
];

const FLORAL_CULTIVATION_TYPE_OPTIONS = [
  { value: "floor-flower-cultivation", label: { en: "Floor Flower Cultivation", si: "බිම් මල් වගාව" } },
  { value: "greenhouse-cultivation", label: { en: "Protected Greenhouse Cultivation", si: "ආරක්ෂිත ගෘහකුළ වගාව" } },
  { value: "beekeeping", label: { en: "Beekeeping", si: "මීමැසි පාලනය" } },
];

const MARKETPLACE_OPTIONS = [
  { value: "local", label: { en: "Local", si: "දේශීය" } },
  { value: "national", label: { en: "National", si: "ජාතික" } },
  { value: "international", label: { en: "International", si: "ජාත්‍යන්තර" } },
];

const AGRI_MACHINERY_TYPE_OPTIONS = [
  { value: "two-wheel-tractor", label: { en: "2-Wheel Tractor", si: "රෝද දෙකේ ට්‍රැක්ටර්" } },
  { value: "two-wheel-tractor-rotavator", label: { en: "2-Wheel Tractor + Rotavator", si: "රෝද දෙකේ ට්‍රැක්ටර් රොටවේටර්" } },
  { value: "two-wheel-tractor-mouldboard-plough", label: { en: "2-Wheel Tractor + Mould Board Plough", si: "රෝද දෙකේ ට්‍රැක්ටර් මෝල්ඩ් බෝඩ් නගුල" } },
  { value: "four-wheel-tractor", label: { en: "4-Wheel Tractor", si: "රෝද හතරේ ට්‍රැක්ටර්" } },
  { value: "four-wheel-tractor-rotavator", label: { en: "4-Wheel Tractor + Rotavator", si: "රෝද හතරේ ට්‍රැක්ටර් රොටවේටර්" } },
  { value: "four-wheel-tractor-disc-plough", label: { en: "4-Wheel Tractor + Disc Plough", si: "රෝද හතරේ ට්‍රැක්ටර් ඩිස්ක් නගුල" } },
  { value: "water-pump", label: { en: "Water Pump", si: "වතුර පොම්ප" } },
  { value: "transplanter", label: { en: "Transplanter", si: "නෙළුම් සිටුවන යන්ත්‍ර" } },
  { value: "weeder", label: { en: "Weeder", si: "වල් නෙළීම් කර" } },
  { value: "harvester", label: { en: "Harvester", si: "අස්වනු නෙළන යන්ත්‍ර" } },
  { value: "power-sprayer", label: { en: "Power Sprayer", si: "බලවේග දියර ඉසින යන්ත්‍ර" } },
  { value: "sprinkler-irrigation", label: { en: "Sprinkler Irrigation Equipment", si: "වර්ෂණ ජලාපවහන යන්ත්‍ර" } },
  { value: "water-spraying-equipment", label: { en: "Water Spraying Equipment", si: "ජල විජලන යන්ත්‍ර" } },
  { value: "grass-cutter", label: { en: "Grass Cutter", si: "තෘණ නෙළන යන්ත්‍ර" } },
  { value: "food-processing-equipment", label: { en: "Food Processing Equipment", si: "ආහාර විජලන යන්ත්‍ර" } },
  { value: "paddy-dryer-parboiling", label: { en: "Paddy Dryer / Parboiling Equipment", si: "බිම් මට්ටමේ මාධ්‍ය හිරවුම් යන්ත්‍ර" } },
  { value: "paddy-miller", label: { en: "Paddy Miller", si: "බිම් මට්ටමේ මාධ්‍ය මාළු ම යන්ත්‍ර" } },
  { value: "chena-planting-equipment", label: { en: "Chena Planting Equipment", si: "පෑළ සිටුවන යන්ත්‍ර" } },
  { value: "paddy-winnower", label: { en: "Paddy Winnower", si: "වී වේළන යන්ත්‍ර" } },
  { value: "oil-mill", label: { en: "Oil Mill", si: "තෙල් මෝල්" } },
  { value: "rubber-mill", label: { en: "Rubber Mill", si: "රබර් මෝල්" } },
  { value: "paddy-mill", label: { en: "Paddy Mill", si: "වී මෝල්" } },
  { value: "other", label: { en: "Other", si: "වෙනත්" } },
];

const CROP_DAMAGE_TYPE_OPTIONS = [
  { value: "elephant-conflict", label: { en: "Wild Elephant Conflict", si: "අලි ගැටළුව/අලි මිනිස් ගැටුම" } },
  { value: "wildlife-damage", label: { en: "Monkey / Porcupine / Wild Boar Damage", si: "රිලව්/වඳුරන්/දඬුලේණා/ඌරා ආදී වන හානි" } },
  { value: "peacock-damage", label: { en: "Peacock Damage", si: "මොණර හානිය" } },
  { value: "flood-damage", label: { en: "Flood Damage", si: "ගංවතුර හානිය" } },
  { value: "drought", label: { en: "Drought", si: "නියඟය" } },
  { value: "pest-disease", label: { en: "Pest & Disease Conditions", si: "කෘමි උවදුරු හා රෝග තත්ත්ව" } },
  { value: "other", label: { en: "Other", si: "වෙනත්" } },
];

const TEA_ESTATE_OWNERSHIP_OPTIONS = [
  { value: "govt", label: { en: "Government-Owned", si: "රජයට අයත්" } },
  { value: "private-company", label: { en: "Jointly-Owned Private Company", si: "පුද්ගලික වතු සමාගම්" } },
  { value: "private", label: { en: "Private", si: "පුද්ගලික" } },
];

const FISH_SITE_TYPE_OPTIONS = [
  { value: "landing-site", label: { en: "Fish Landing Site", si: "ධීවර තොටුපොළ" } },
  { value: "harbor", label: { en: "Fish Harbor", si: "ධීවර වරාය" } },
];

const WATER_TYPE_OPTIONS = [
  { value: "marine", label: { en: "Marine", si: "මුහුදු" } },
  { value: "inland", label: { en: "Inland", si: "අභ්‍යන්තර" } },
];

const INLAND_WATER_BODY_TYPE_OPTIONS = [
  { value: "perennial", label: { en: "Perennial", si: "නිත්‍ය" } },
  { value: "seasonal", label: { en: "Seasonal", si: "කාලීන" } },
];

const GN_DIVISION_COLUMN: ReadOnlyColumn = { key: "gnName", label: { en: "GN Division", si: "ග්‍රාම නිලධාරී වසම" } };

const LAND_USE_COLUMNS: ReadOnlyColumn[] = [
  { key: "landType", label: { en: "Land Type", si: "ඉඩම් වර්ගය" }, options: LAND_USE_TYPE_OPTIONS },
  { key: "extentHectares", label: { en: "Extent (Hectares)", si: "ප්‍රමාණය (හෙක්ටයාර)" } },
];

const ANIMAL_HUSBANDRY_COUNT_COLUMNS: ReadOnlyColumn[] = [
  { key: "type", label: { en: "Cultivation Type", si: "වගා වර්ගය" }, options: FLORAL_CULTIVATION_TYPE_OPTIONS },
  { key: "count", label: { en: "Count", si: "ගණන" } },
];

const ANIMAL_HUSBANDRY_DIRECTORY_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Name", si: "නම" } },
  { key: "address", label: { en: "Address", si: "ලිපිනය" } },
  { key: "phone", label: { en: "Phone", si: "දුරකථන අංකය" } },
  { key: "type", label: { en: "Type", si: "වර්ගය" }, options: FLORAL_CULTIVATION_TYPE_OPTIONS },
  { key: "marketplace", label: { en: "Marketplace", si: "වෙළඳපොල" }, options: MARKETPLACE_OPTIONS },
];

const SPECIAL_ECONOMIC_ACTIVITY_COLUMNS: ReadOnlyColumn[] = [
  { key: "activity", label: { en: "Activity", si: "ආර්ථික කටයුත්ත" } },
  { key: "natureOfActivity", label: { en: "Nature / Scope", si: "ආර්ථික කටයුත්තේ ස්වභාවය" } },
  { key: "resourceOrProductUsed", label: { en: "Resource / Product Used", si: "යොදාගන්නා ස්වභාවික සම්පත්/නිෂ්පාදනය" } },
];

const AGRI_MACHINERY_COLUMNS: ReadOnlyColumn[] = [
  { key: "type", label: { en: "Equipment", si: "යන්ත්‍රෝපකරණය" }, options: AGRI_MACHINERY_TYPE_OPTIONS },
  { key: "count", label: { en: "Count", si: "ගණන" } },
];

const FOREST_DAMAGE_COLUMNS: ReadOnlyColumn[] = [
  { key: "type", label: { en: "Type of Damage", si: "හානියේ ස්වභාවය" }, options: CROP_DAMAGE_TYPE_OPTIONS },
  { key: "present", label: { en: "Present", si: "ඇත/නැත" }, options: YES_NO_OPTIONS },
];

const FOREST_DAMAGE_AREA_COLUMNS: ReadOnlyColumn[] = [
  { key: "type", label: { en: "Type of Damage", si: "හානියේ ස්වභාවය" }, options: CROP_DAMAGE_TYPE_OPTIONS },
  { key: "presentCount", label: { en: "GN Divisions Affected", si: "බලපෑමට ලක් වූ ග්‍රාම නිලධාරී වසම් ගණන" } },
];

const LIVESTOCK_FARM_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Name", si: "නම" } },
  { key: "address", label: { en: "Address", si: "ලිපිනය" } },
  { key: "phone", label: { en: "Phone", si: "දුරකථන අංකය" } },
  { key: "cattle", label: { en: "Cattle", si: "ගවයන්" } },
  { key: "layerChickens", label: { en: "Layer Chickens", si: "බිත්තර සඳහා කුකුළන්" } },
  { key: "broilerChickens", label: { en: "Broiler Chickens", si: "මස් සඳහා කුකුළන්" } },
  { key: "goats", label: { en: "Goats", si: "එළුවන්" } },
  { key: "pigs", label: { en: "Pigs", si: "ඌරන්" } },
  { key: "peacock", label: { en: "Peacock / Turkey", si: "තුරාවන්" } },
  { key: "other", label: { en: "Other", si: "වෙනත්" } },
];

const INDUSTRY_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Name", si: "නම" } },
  { key: "productionType", label: { en: "Production Type", si: "නිෂ්පාදන වර්ගය" } },
  { key: "employeeCount", label: { en: "Employee Count", si: "සේවක සංඛ්‍යාව" } },
  { key: "phone", label: { en: "Phone", si: "දුරකථන අංකය" } },
  { key: "marketplace", label: { en: "Marketplace", si: "වෙළඳපොල" }, options: MARKETPLACE_OPTIONS },
];

const FISHERIES_SOCIETY_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Society Name", si: "සමිතියේ නම" } },
  { key: "address", label: { en: "Address", si: "ලිපිනය" } },
  { key: "memberCount", label: { en: "Member Count", si: "සාමාජික ගණන" } },
];

const INLAND_WATER_BODY_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Name of Tank / Reservoir", si: "වැව/ජලාශයේ නම" } },
  { key: "type", label: { en: "Type", si: "වර්ගය" }, options: INLAND_WATER_BODY_TYPE_OPTIONS },
];

const NAME_ADDRESS_PHONE_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Name", si: "නම" } },
  { key: "address", label: { en: "Address", si: "ලිපිනය" } },
  { key: "phone", label: { en: "Phone", si: "දුරකථන අංකය" } },
];

const FISH_LANDING_SITE_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Name", si: "නම" } },
  { key: "address", label: { en: "Address", si: "ලිපිනය" } },
  { key: "siteType", label: { en: "Site Type", si: "වර්ගය" }, options: FISH_SITE_TYPE_OPTIONS },
  { key: "waterType", label: { en: "Marine / Inland", si: "මුහුදු/අභ්‍යන්තර" }, options: WATER_TYPE_OPTIONS },
];

const NAME_ADDRESS_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Name", si: "නම" } },
  { key: "address", label: { en: "Address", si: "ලිපිනය" } },
];

const TEA_ESTATE_COLUMNS: ReadOnlyColumn[] = [
  { key: "name", label: { en: "Name", si: "නම" } },
  { key: "ownership", label: { en: "Ownership", si: "හිමිකාරිත්වය" }, options: TEA_ESTATE_OWNERSHIP_OPTIONS },
  { key: "extentAcres", label: { en: "Extent (Acres)", si: "ප්‍රමාණය (අක්කර)" } },
  { key: "employeesFemale", label: { en: "Employees - Female", si: "සේවකයන් - ස්ත්‍රී" } },
  { key: "employeesMale", label: { en: "Employees - Male", si: "සේවකයන් - පුරුෂ" } },
];

const ABANDONED_PADDY_LAND_FIELDS: { key: string; label: Translated }[] = [
  { key: "extentAcres", label: { en: "Extent (Acres)", si: "ප්‍රමාණය (අක්කර)" } },
  { key: "canBeReactivatedExtent", label: { en: "Extent That Can Be Reactivated", si: "යළි වගා කළ හැකි ප්‍රමාණය" } },
];

const INDUSTRY_COUNT_FIELDS: { key: string; label: Translated }[] = [
  { key: "householdIndustry", label: { en: "Household Industries", si: "ගෘහස්ථ කර්මාන්ත" } },
  { key: "under5Employees", label: { en: "Industries with <5 Employees", si: "සේවක සංඛ්‍යාව 5ට අඩු කර්මාන්ත" } },
  { key: "over5Employees", label: { en: "Industries with 5+ Employees", si: "සේවක සංඛ්‍යාව 5ට වැඩි කර්මාන්ත" } },
];

const FISHERIES_STAT_FIELDS: { key: string; label: Translated }[] = [
  { key: "householdCount", label: { en: "Household Count", si: "ගෘහ ඒකක සංඛ්‍යාව" } },
  { key: "fishingPopulation", label: { en: "Fishing Population", si: "ධීවර ජනගහනය" } },
  { key: "activeFishermenCount", label: { en: "Active Fishermen Count", si: "ක්‍රියාකාරී ධීවරයන් සංඛ්‍යාව" } },
  { key: "societyCount", label: { en: "Society Count", si: "සංගම් සංඛ්‍යාව" } },
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

/** GN-division-scoped view of the "Economic — Agriculture / Industry" section (§10): land use,
 *  commercial cultivation, machinery, forest/crop damage, livestock, industries, marine and
 *  inland fisheries, fish landing sites, ice production, and tea estates for whichever GN
 *  division the DS searches or selects — or, before any division is picked, the whole-division
 *  aggregate across every approved GN division. */
export function EconomicAgricultureView() {
  const { data: area, isLoading: areaLoading, isError: areaError } = useAreaAnalytics();

  return (
    <GnScopedSectionView
      prompt={{
        en: "Search or select a GN division above to view its Economic — Agriculture / Industry data.",
        si: "එහි ආර්ථික — කෘෂිකාර්මික/කාර්මික තොරතුරු බැලීමට ඉහත ග්‍රාම නිලධාරී වසමක් සොයන්න හෝ තෝරන්න.",
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
                en="Unable to load whole-division Economic — Agriculture / Industry data right now. Please try again shortly."
                si="සම්පූර්ණ කොට්ඨාසයේ ආර්ථික — කෘෂිකාර්මික/කාර්මික තොරතුරු මෙම මොහොතේ පූරණය කළ නොහැක. ටික වේලාවකින් නැවත උත්සාහ කරන්න."
              />
            </CardContent>
          </Card>
        ) : (
          <EconomicAgricultureAreaWideView aggregate={area.sections.economicAgriculture} />
        )
      }
    >
      {(profile) => {
        const section = profile.data.economicAgriculture;

        if (!section) {
          return (
            <Card>
              <CardContent className="text-fluid-sm text-muted-foreground">
                <Bilingual
                  en="This GN division's approved submission doesn't include Economic — Agriculture / Industry data yet."
                  si="මෙම ග්‍රාම නිලධාරී වසමේ අනුමත ඉදිරිපත් කිරීමේ ආර්ථික — කෘෂිකාර්මික/කාර්මික තොරතුරු තවම ඇතුළත් නොවේ."
                />
              </CardContent>
            </Card>
          );
        }

        return <EconomicAgricultureSectionContent section={section} />;
      }}
    </GnScopedSectionView>
  );
}

function EconomicAgricultureSectionContent({ section }: { section: EconomicAgricultureData }) {
  const { lang } = useLanguage();

  return (
    <div className="flex flex-col gap-8">
      <ReadOnlyTable title={economicAgricultureDict.fields.landUse} columns={LAND_USE_COLUMNS} rows={toRows(section.landUse)} />
      <ReadOnlyTable title={economicAgricultureDict.fields.animalHusbandryCounts} columns={ANIMAL_HUSBANDRY_COUNT_COLUMNS} rows={toRows(section.animalHusbandryCounts)} />
      <ReadOnlyTable title={economicAgricultureDict.fields.animalHusbandryDirectory} columns={ANIMAL_HUSBANDRY_DIRECTORY_COLUMNS} rows={toRows(section.animalHusbandryDirectory)} />
      <ReadOnlyTable title={economicAgricultureDict.fields.specialEconomicActivities} columns={SPECIAL_ECONOMIC_ACTIVITY_COLUMNS} rows={toRows(section.specialEconomicActivities)} />

      <div className="flex flex-col gap-3">
        <ReadOnlyStats
          title={economicAgricultureDict.fields.abandonedPaddyLand}
          stats={toStats(ABANDONED_PADDY_LAND_FIELDS, {
            extentAcres: section.abandonedPaddyLand.extentAcres,
            canBeReactivatedExtent: section.abandonedPaddyLand.canBeReactivatedExtent,
          })}
        />
        {(section.abandonedPaddyLand.reason || section.abandonedPaddyLand.actionPlan) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {section.abandonedPaddyLand.reason && (
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-fluid-sm font-medium text-foreground">
                  <Bilingual en="Reason" si="හේතුව" />
                </p>
                <p className="mt-1 text-fluid-sm text-muted-foreground">{section.abandonedPaddyLand.reason}</p>
              </div>
            )}
            {section.abandonedPaddyLand.actionPlan && (
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-fluid-sm font-medium text-foreground">
                  <Bilingual en="Action Plan" si="ක්‍රියාකාරී සැලැස්ම" />
                </p>
                <p className="mt-1 text-fluid-sm text-muted-foreground">{section.abandonedPaddyLand.actionPlan}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <ReadOnlyTable title={economicAgricultureDict.fields.agriMachinery} columns={AGRI_MACHINERY_COLUMNS} rows={toRows(section.agriMachinery)} />
      <ReadOnlyTable title={economicAgricultureDict.fields.forestDamage} columns={FOREST_DAMAGE_COLUMNS} rows={toRows(section.forestDamage)} />
      <ReadOnlyTable title={economicAgricultureDict.fields.livestockFarms} columns={LIVESTOCK_FARM_COLUMNS} rows={toRows(section.livestockFarms)} />

      <ReadOnlyStats title={economicAgricultureDict.fields.industryCounts} stats={toStats(INDUSTRY_COUNT_FIELDS, section.industryCounts)} />
      <ReadOnlyTable title={economicAgricultureDict.fields.industries} columns={INDUSTRY_COLUMNS} rows={toRows(section.industries)} />

      <ReadOnlyStats title={economicAgricultureDict.fields.marineFisheries} stats={toStats(FISHERIES_STAT_FIELDS, section.marineFisheries)} />
      <ReadOnlyTable title={economicAgricultureDict.fields.marineFisheriesSocieties} columns={FISHERIES_SOCIETY_COLUMNS} rows={toRows(section.marineFisheriesSocieties)} />

      <ReadOnlyStats title={economicAgricultureDict.fields.inlandFisheries} stats={toStats(FISHERIES_STAT_FIELDS, section.inlandFisheries)} />
      <ReadOnlyTable title={economicAgricultureDict.fields.inlandFisheriesSocieties} columns={FISHERIES_SOCIETY_COLUMNS} rows={toRows(section.inlandFisheriesSocieties)} />
      <ReadOnlyTable title={economicAgricultureDict.fields.inlandWaterBodies} columns={INLAND_WATER_BODY_COLUMNS} rows={toRows(section.inlandWaterBodies)} />

      <ReadOnlyTable title={economicAgricultureDict.fields.aquacultureDirectory} columns={NAME_ADDRESS_PHONE_COLUMNS} rows={toRows(section.aquacultureDirectory)} />
      <ReadOnlyTable title={economicAgricultureDict.fields.ornamentalFishDirectory} columns={NAME_ADDRESS_PHONE_COLUMNS} rows={toRows(section.ornamentalFishDirectory)} />

      <ReadOnlyStats
        title={economicAgricultureDict.fields.fishLandingSitePresent}
        stats={[{ key: "fishLandingSitePresent", label: { en: "Status", si: "තත්ත්වය" }, value: yesNoLabel(section.fishLandingSitePresent, lang) }]}
      />
      <ReadOnlyTable title={economicAgricultureDict.fields.fishLandingSites} columns={FISH_LANDING_SITE_COLUMNS} rows={toRows(section.fishLandingSites)} />

      <ReadOnlyStats
        title={economicAgricultureDict.fields.iceProductionPresent}
        stats={[{ key: "iceProductionPresent", label: { en: "Status", si: "තත්ත්වය" }, value: yesNoLabel(section.iceProductionPresent, lang) }]}
      />
      <ReadOnlyTable title={economicAgricultureDict.fields.iceProductionDirectory} columns={NAME_ADDRESS_COLUMNS} rows={toRows(section.iceProductionDirectory)} />

      <ReadOnlyTable title={economicAgricultureDict.fields.teaEstates} columns={TEA_ESTATE_COLUMNS} rows={toRows(section.teaEstates)} />
    </div>
  );
}

/** Whole-division rollup of every approved GN division's Economic — Agriculture / Industry data:
 *  fixed-category groups (land use, cultivation, machinery, damage) are summed by category, and
 *  every directory is pooled with a GN Division column added — same shape `aggregateEconomicAgriculture`
 *  already produces. */
function EconomicAgricultureAreaWideView({ aggregate }: { aggregate: EconomicAgricultureAggregate }) {
  const landUseRows = LAND_USE_TYPES.map((type, i) => ({ landType: type, extentHectares: aggregate.landUse[i]?.extentHectares ?? 0 }));
  const animalHusbandryCountRows = FLORAL_CULTIVATION_TYPES.map((type, i) => ({ type, count: aggregate.animalHusbandryCounts[i]?.count ?? 0 }));
  const agriMachineryRows = AGRI_MACHINERY_TYPES.map((type, i) => ({ type, count: aggregate.agriMachinery[i]?.count ?? 0 }));
  const forestDamageRows = CROP_DAMAGE_TYPES.map((type, i) => ({ type, presentCount: aggregate.forestDamage[i]?.presentCount ?? 0 }));

  return (
    <div className="flex flex-col gap-8">
      <p className="text-fluid-sm text-muted-foreground">
        <Bilingual
          en="Aggregated across every GN division with an approved submission in your division. Select a GN division above to see its individual data."
          si="ඔබගේ කොට්ඨාසයේ අනුමත ඉදිරිපත් කිරීමක් ඇති සියලුම ග්‍රාම නිලධාරී වසම් හරහා එකතු කර ඇත. තනි වසමක දත්ත බැලීමට ඉහත ග්‍රාම නිලධාරී වසමක් තෝරන්න."
        />
      </p>

      <ReadOnlyTable title={economicAgricultureDict.fields.landUse} columns={LAND_USE_COLUMNS} rows={toRows(landUseRows)} />
      <ReadOnlyTable title={economicAgricultureDict.fields.animalHusbandryCounts} columns={ANIMAL_HUSBANDRY_COUNT_COLUMNS} rows={toRows(animalHusbandryCountRows)} />
      <ReadOnlyTable title={economicAgricultureDict.fields.animalHusbandryDirectory} columns={[GN_DIVISION_COLUMN, ...ANIMAL_HUSBANDRY_DIRECTORY_COLUMNS]} rows={toRows(aggregate.animalHusbandryDirectory.rows)} />
      <ReadOnlyTable title={economicAgricultureDict.fields.specialEconomicActivities} columns={[GN_DIVISION_COLUMN, ...SPECIAL_ECONOMIC_ACTIVITY_COLUMNS]} rows={toRows(aggregate.specialEconomicActivities.rows)} />

      <ReadOnlyStats title={economicAgricultureDict.fields.abandonedPaddyLand} stats={toStats(ABANDONED_PADDY_LAND_FIELDS, aggregate.abandonedPaddyLand)} />

      <ReadOnlyTable title={economicAgricultureDict.fields.agriMachinery} columns={AGRI_MACHINERY_COLUMNS} rows={toRows(agriMachineryRows)} />
      <ReadOnlyTable title={economicAgricultureDict.fields.forestDamage} columns={FOREST_DAMAGE_AREA_COLUMNS} rows={toRows(forestDamageRows)} />
      <ReadOnlyTable title={economicAgricultureDict.fields.livestockFarms} columns={[GN_DIVISION_COLUMN, ...LIVESTOCK_FARM_COLUMNS]} rows={toRows(aggregate.livestockFarms.rows)} />

      <ReadOnlyStats title={economicAgricultureDict.fields.industryCounts} stats={toStats(INDUSTRY_COUNT_FIELDS, aggregate.industryCounts)} />
      <ReadOnlyTable title={economicAgricultureDict.fields.industries} columns={[GN_DIVISION_COLUMN, ...INDUSTRY_COLUMNS]} rows={toRows(aggregate.industries.rows)} />

      <ReadOnlyStats title={economicAgricultureDict.fields.marineFisheries} stats={toStats(FISHERIES_STAT_FIELDS, aggregate.marineFisheries)} />
      <ReadOnlyTable title={economicAgricultureDict.fields.marineFisheriesSocieties} columns={[GN_DIVISION_COLUMN, ...FISHERIES_SOCIETY_COLUMNS]} rows={toRows(aggregate.marineFisheriesSocieties.rows)} />

      <ReadOnlyStats title={economicAgricultureDict.fields.inlandFisheries} stats={toStats(FISHERIES_STAT_FIELDS, aggregate.inlandFisheries)} />
      <ReadOnlyTable title={economicAgricultureDict.fields.inlandFisheriesSocieties} columns={[GN_DIVISION_COLUMN, ...FISHERIES_SOCIETY_COLUMNS]} rows={toRows(aggregate.inlandFisheriesSocieties.rows)} />
      <ReadOnlyTable title={economicAgricultureDict.fields.inlandWaterBodies} columns={[GN_DIVISION_COLUMN, ...INLAND_WATER_BODY_COLUMNS]} rows={toRows(aggregate.inlandWaterBodies.rows)} />

      <ReadOnlyTable title={economicAgricultureDict.fields.aquacultureDirectory} columns={[GN_DIVISION_COLUMN, ...NAME_ADDRESS_PHONE_COLUMNS]} rows={toRows(aggregate.aquacultureDirectory.rows)} />
      <ReadOnlyTable title={economicAgricultureDict.fields.ornamentalFishDirectory} columns={[GN_DIVISION_COLUMN, ...NAME_ADDRESS_PHONE_COLUMNS]} rows={toRows(aggregate.ornamentalFishDirectory.rows)} />

      <ReadOnlyStats
        title={economicAgricultureDict.fields.fishLandingSitePresent}
        stats={[{ key: "fishLandingSiteDivisionsCount", label: { en: "GN Divisions", si: "ග්‍රාම නිලධාරී වසම් ගණන" }, value: aggregate.fishLandingSiteDivisionsCount.toString() }]}
      />
      <ReadOnlyTable title={economicAgricultureDict.fields.fishLandingSites} columns={[GN_DIVISION_COLUMN, ...FISH_LANDING_SITE_COLUMNS]} rows={toRows(aggregate.fishLandingSites.rows)} />

      <ReadOnlyStats
        title={economicAgricultureDict.fields.iceProductionPresent}
        stats={[{ key: "iceProductionDivisionsCount", label: { en: "GN Divisions", si: "ග්‍රාම නිලධාරී වසම් ගණන" }, value: aggregate.iceProductionDivisionsCount.toString() }]}
      />
      <ReadOnlyTable title={economicAgricultureDict.fields.iceProductionDirectory} columns={[GN_DIVISION_COLUMN, ...NAME_ADDRESS_COLUMNS]} rows={toRows(aggregate.iceProductionDirectory.rows)} />

      <ReadOnlyTable title={economicAgricultureDict.fields.teaEstates} columns={[GN_DIVISION_COLUMN, ...TEA_ESTATE_COLUMNS]} rows={toRows(aggregate.teaEstates.rows)} />
    </div>
  );
}
