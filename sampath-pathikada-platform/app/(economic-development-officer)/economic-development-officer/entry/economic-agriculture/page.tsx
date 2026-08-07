"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { SectionForm } from "@/components/forms/SectionForm";
import { FieldWrapper } from "@/components/forms/FormField";
import { RepeatableTable, type RepeatableColumn } from "@/components/forms/RepeatableTable";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bilingual } from "@/components/Bilingual";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubmission, useSaveSection } from "@/hooks/use-submission";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { economicAgricultureDict } from "@/lib/i18n/sections/economic-agriculture";
import {
  economicAgricultureSchemaPartial,
  LAND_USE_TYPES,
  FLORAL_CULTIVATION_TYPES,
  MARKETPLACES,
  AGRI_MACHINERY_TYPES,
  CROP_DAMAGE_TYPES,
  TEA_ESTATE_OWNERSHIP,
  FISH_SITE_TYPES,
  WATER_TYPES,
  INLAND_WATER_BODY_TYPES,
} from "@/lib/validators/sections/economic-agriculture";
import { cn } from "@/lib/utils";
import type { z } from "zod";

const CURRENT_YEAR = 2026;

type EconomicAgricultureDraft = z.infer<typeof economicAgricultureSchemaPartial>;

const YES_NO_OPTIONS = [
  { value: "yes", label: { en: "Yes", si: "ඔව්" } },
  { value: "no", label: { en: "No", si: "නැත" } },
];

const LAND_USE_LABELS: Record<(typeof LAND_USE_TYPES)[number], { en: string; si: string }> = {
  forest: { en: "Forest", si: "වනාන්තර" },
  "paddy-cultivation": { en: "Paddy Cultivation", si: "වී වගාව" },
  "abandoned-paddy": { en: "Abandoned Paddy Land", si: "පුරන් කුඹුරු" },
  "agri-land-tea": { en: "Agricultural Land - Tea", si: "කෘෂිකාර්මික ඉඩම් - තේ" },
  "agri-land-coconut": { en: "Agricultural Land - Coconut", si: "කෘෂිකාර්මික ඉඩම් - පොල්" },
  "agri-land-rubber": { en: "Agricultural Land - Rubber", si: "කෘෂිකාර්මික ඉඩම් - රබර්" },
  cinnamon: { en: "Cinnamon", si: "කුරුඳු" },
  pepper: { en: "Pepper", si: "ගම්මිරිස්" },
  coffee: { en: "Coffee", si: "කෝපි" },
  vegetables: { en: "Vegetables", si: "එළවළු" },
  fruits: { en: "Fruits", si: "පළතුරු" },
  "tuber-crops": { en: "Tuber Crops (Manioc / Sweet Potato / Innala / Kiri Ala)", si: "අල බෝග වගාව(මඤ්ඤොක්කා/බතල/ඉන්නල/කිරි අල)" },
  "supplementary-food-crops": {
    en: "Supplementary Food Crops (Maize / Green Gram / Cowpea / Kurakkan / Sesame / Groundnut)",
    si: "අතිරේක ආහාර බෝග(බඩඉරිඟු/මුං/කවුපි/කුරක්කන්/තල/රටකජු)",
  },
  "inland-reservoirs": { en: "Inland Reservoirs", si: "අභ්‍යන්තර ජලාශ" },
  "roads-sports-homegardens": { en: "Roads / Sports Grounds / Home Gardens", si: "මාර්ග/ක්‍රීඩා භූමි / ගෙවතු වගාව" },
  "scrub-chena-barren": {
    en: "Fertile Jungle / Chena / Barren Land / Abandoned Land",
    si: "ලදු කැලෑ / හේන්/ මුඩු බිම් / අත්හැර දමන ලද බිම්",
  },
  "ornamental-nurseries": {
    en: "Commercial Flower Nurseries / Ornamental Plant Nurseries / Other Plant Nurseries",
    si: "වාණිජ මල් තවාන් / විසිතුරු පැල තවාන් / වෙනත් පැල තවාන්",
  },
  "plantation-crop-nurseries": {
    en: "Plantation Crop Nurseries (Cinnamon / Tea / Pepper)",
    si: "වැවිලි බෝග පැල තවාන් (කුරුඳු/තේ/ගම්මිරිස්)",
  },
  "aquaculture-land": { en: "Aquaculture", si: "ජල ජීවී වගාව" },
};

const FLORAL_CULTIVATION_LABELS: Record<(typeof FLORAL_CULTIVATION_TYPES)[number], { en: string; si: string }> = {
  "floor-flower-cultivation": { en: "Floor Flower Cultivation", si: "බිම් මල් වගාව" },
  "greenhouse-cultivation": { en: "Protected Greenhouse Cultivation", si: "ආරක්ෂිත ගෘහතුල වගාව" },
  beekeeping: { en: "Beekeeping", si: "මීමැසි පාලනය" },
};

const MARKETPLACE_LABELS: Record<(typeof MARKETPLACES)[number], { en: string; si: string }> = {
  local: { en: "Local", si: "දේශීය" },
  national: { en: "National", si: "ජාතික" },
  international: { en: "International", si: "ජාත්‍යන්තර" },
};

const AGRI_MACHINERY_LABELS: Record<(typeof AGRI_MACHINERY_TYPES)[number], { en: string; si: string }> = {
  "two-wheel-tractor": { en: "2-Wheel Tractor", si: "රෝද දෙකේ ට්‍රැක්ටර්" },
  "two-wheel-tractor-rotavator": { en: "2-Wheel Tractor Rotavator", si: "රෝද දෙකේ ට්‍රැක්ටර් රොටවේටර්" },
  "two-wheel-tractor-mouldboard-plough": { en: "2-Wheel Tractor Mould Board Plough", si: "රෝද දෙකේ ට්‍රැක්ටර් මෝල්ඩ් බෝඩ් නගුල්" },
  "four-wheel-tractor": { en: "4-Wheel Tractor", si: "රෝද හතරේ ට්‍රැක්ටර්" },
  "four-wheel-tractor-rotavator": { en: "4-Wheel Tractor Rotavator", si: "රෝද හතරේ ට්‍රැක්ටර් රොටවේටර්" },
  "four-wheel-tractor-hook-plough": { en: "4-Wheel Tractor Hook Plough", si: "රෝදහතරේ ට්‍රැක්ටර් කොකු නගුල්" },
  "water-pump": { en: "Water Pump", si: "වතුර පොම්ප" },
  "paddy-harvesting-machine": { en: "Paddy Harvesting Machine", si: "ගොයම් කපන යන්ත්‍ර" },
  "paddy-threshing-machine": { en: "Paddy Threshing Machine", si: "ගොයම් පාගන යන්ත්‍ර" },
  "combine-harvester": { en: "Combine Harvester", si: "කම්බයින් හාවෙස්ටර්" },
  transplanter: { en: "Transplanter", si: "පැල සිටුවන යන්ත්‍ර" },
  "power-sprayer": { en: "Power Sprayer", si: "බලවේග දියර ඉසින යන්ත්‍ර" },
  "hand-sprayer": { en: "Hand Sprayer", si: "අත් ඉසින යන්ත්‍ර" },
  weeder: { en: "Weeder", si: "වල් නෙළුම් කර" },
  "food-drying-machine": { en: "Food Drying Machine", si: "ආහාර විජ්ජලන යන්ත්‍ර" },
  "floor-flower-media-filling-machine": { en: "Floor Flower Media Filling Machine", si: "බිම් මල් මාධ්‍ය පිරවුම් යන්ත්‍ර" },
  "floor-flower-media-boiling-machine": { en: "Floor Flower Media Boiling Machine", si: "බිම් මල් මාධ්‍ය මල් තම්බන යන්ත්‍ර" },
  "seedling-planting-machine": { en: "Seedling Planting Machine", si: "පැළ සිටුවන යන්ත්‍ර" },
  "paddy-reaping-machine": { en: "Paddy Reaping Machine", si: "වී වෙළන යන්ත්‍ර" },
  "oil-mill": { en: "Oil Mill", si: "තෙල් මෝල්" },
  "rubber-mill": { en: "Rubber Mill", si: "රබර් මෝල්" },
  "paddy-mill": { en: "Paddy Mill", si: "වී මෝල්" },
  other: { en: "Other", si: "වෙනත්" },
};

const CROP_DAMAGE_LABELS: Record<(typeof CROP_DAMAGE_TYPES)[number], { en: string; si: string }> = {
  "elephant-conflict": { en: "Elephant Village Raids / Human-Elephant Conflict", si: "අලි ගම්වැදීම/ අලි මිනිස් ගැටුම" },
  "wildlife-damage": { en: "Damage by Monkeys / Porcupines / Wild Boar", si: "රිලව් /වදුරන්/ දඬුලේනා/ඌරා මගින් වන හානි" },
  "peacock-damage": { en: "Peacock Damage", si: "මොනර හානි" },
  "flood-damage": { en: "Flood Conditions", si: "ගං වතුර තත්ත්ව" },
  drought: { en: "Drought", si: "නියඟය" },
  "pest-disease": { en: "Pest & Disease Conditions", si: "කෘමි උවදුරු හා රෝග තත්ත්ව" },
  other: { en: "Other", si: "වෙනත්" },
};

const TEA_ESTATE_OWNERSHIP_LABELS: Record<(typeof TEA_ESTATE_OWNERSHIP)[number], { en: string; si: string }> = {
  govt: { en: "Government-Owned", si: "රජයට අයත්" },
  "private-company": { en: "Jointly-Owned Private Company", si: "පුද්ගලික වතු සමාගම්" },
  private: { en: "Private", si: "පුද්ගලික" },
};

const FISH_SITE_TYPE_LABELS: Record<(typeof FISH_SITE_TYPES)[number], { en: string; si: string }> = {
  "landing-site": { en: "Fish Landing Site", si: "ධීවර තොටුපොළ" },
  harbor: { en: "Fish Harbor", si: "ධීවර වරාය" },
};

const WATER_TYPE_LABELS: Record<(typeof WATER_TYPES)[number], { en: string; si: string }> = {
  marine: { en: "Marine", si: "කරදිය" },
  inland: { en: "Inland / Freshwater", si: "මිරිදිය" },
};

const INLAND_WATER_BODY_TYPE_LABELS: Record<(typeof INLAND_WATER_BODY_TYPES)[number], { en: string; si: string }> = {
  perennial: { en: "Perennial", si: "නිතය" },
  seasonal: { en: "Seasonal", si: "කාලීන" },
};

function buildEmptyValues(lang: "en" | "si"): EconomicAgricultureDraft {
  return {
    landUse: LAND_USE_TYPES.map((type) => ({ landType: type, landTypeLabel: LAND_USE_LABELS[type][lang], extentHectares: 0 })),
    animalHusbandryCounts: FLORAL_CULTIVATION_TYPES.map((type) => ({
      type,
      typeLabel: FLORAL_CULTIVATION_LABELS[type][lang],
      count: 0,
    })),
    animalHusbandryDirectory: [],
    specialEconomicActivities: [],
    abandonedPaddyLand: { extentAcres: 0, canBeReactivatedExtent: 0, reason: "", actionPlan: "" },
    agriMachinery: AGRI_MACHINERY_TYPES.map((type) => ({ type, typeLabel: AGRI_MACHINERY_LABELS[type][lang], count: 0 })),
    forestDamage: CROP_DAMAGE_TYPES.map((type) => ({ type, typeLabel: CROP_DAMAGE_LABELS[type][lang], present: "no" })),
    livestockFarms: [],
    industryCounts: { householdIndustry: 0, under5Employees: 0, over5Employees: 0 },
    industries: [],
    marineFisheries: { householdCount: 0, fishingPopulation: 0, activeFishermenCount: 0, societyCount: 0 },
    marineFisheriesSocieties: [],
    inlandFisheries: { householdCount: 0, fishingPopulation: 0, activeFishermenCount: 0, societyCount: 0 },
    inlandFisheriesSocieties: [],
    inlandWaterBodies: [],
    aquacultureDirectory: [],
    ornamentalFishDirectory: [],
    fishLandingSitePresent: "no",
    fishLandingSites: [],
    iceProductionPresent: "no",
    iceProductionDirectory: [],
    teaEstates: [],
  };
}

// Saved data may predate a schema change (e.g. animalHusbandryCounts used to be stored as a
// plain object, not an array of typed rows) — coerce to an array so a stale shape degrades to
// "no match found" instead of crashing the whole page on `.filter`.
function asRows(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

function mergeWithSaved(empty: EconomicAgricultureDraft, saved: EconomicAgricultureDraft): EconomicAgricultureDraft {
  const savedLandUseByType = new Map(asRows(saved.landUse).filter((r) => r?.landType).map((r) => [r.landType, r]));
  const savedAnimalHusbandryByType = new Map(asRows(saved.animalHusbandryCounts).filter((r) => r?.type).map((r) => [r.type, r]));
  const savedAgriMachineryByType = new Map(asRows(saved.agriMachinery).filter((r) => r?.type).map((r) => [r.type, r]));
  const savedForestDamageByType = new Map(asRows(saved.forestDamage).filter((r) => r?.type).map((r) => [r.type, r]));

  return {
    ...empty,
    ...saved,
    landUse: empty.landUse?.map((row) => ({ ...row, ...savedLandUseByType.get(row.landType) })),
    animalHusbandryCounts: empty.animalHusbandryCounts?.map((row) => ({ ...row, ...savedAnimalHusbandryByType.get(row.type) })),
    agriMachinery: empty.agriMachinery?.map((row) => ({ ...row, ...savedAgriMachineryByType.get(row.type) })),
    forestDamage: empty.forestDamage?.map((row) => ({ ...row, ...savedForestDamageByType.get(row.type) })),
  };
}

export default function EconomicAgriculturePage() {
  const { lang } = useLanguage();
  const { submission, isLoading } = useSubmission(CURRENT_YEAR);
  const { saveSection, status, errorMessage } = useSaveSection(CURRENT_YEAR);

  const emptyValues = useMemo(() => buildEmptyValues(lang), [lang]);

  const form = useForm<EconomicAgricultureDraft>({
    resolver: zodResolver(economicAgricultureSchemaPartial),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (submission?.data.economicAgriculture) {
      form.reset(mergeWithSaved(emptyValues, submission.data.economicAgriculture));
    } else {
      form.reset(emptyValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission, emptyValues]);

  async function handleSave(values: EconomicAgricultureDraft) {
    await saveSection("economicAgriculture", values);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  const landUseColumns: RepeatableColumn[] = [
    { key: "landTypeLabel", label: { en: "Land Type", si: "ඉඩම් වර්ගය" }, type: "readonly" },
    { key: "extentHectares", label: { en: "Extent (Hectares)", si: "ප්‍රමාණය (හෙක්ටයාර)" }, type: "number" },
  ];

  const animalHusbandryCountColumns: RepeatableColumn[] = [
    { key: "typeLabel", label: { en: "Cultivation Type", si: "වගා වර්ගය" }, type: "readonly" },
    { key: "count", label: { en: "Count", si: "ගණන" }, type: "number" },
  ];

  const animalHusbandryDirectoryColumns: RepeatableColumn[] = [
    {
      key: "type",
      label: { en: "* Cultivation Type (1/2/3)", si: "*වගා වර්ගය(1/2/3)" },
      type: "select",
      options: FLORAL_CULTIVATION_TYPES.map((t) => ({ value: t, label: FLORAL_CULTIVATION_LABELS[t] })),
    },
    { key: "name", label: { en: "Person's Name", si: "පුද්ගල නම" }, type: "text" },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
    { key: "phone", label: { en: "Phone Number", si: "දුරකථන අංකය" }, type: "text" },
    {
      key: "marketplace",
      label: { en: "** Marketplace", si: "**වෙළඳපොළ" },
      type: "select",
      options: MARKETPLACES.map((m) => ({ value: m, label: MARKETPLACE_LABELS[m] })),
    },
  ];

  const specialEconomicActivityColumns: RepeatableColumn[] = [
    { key: "activity", label: { en: "Area-Specific / Special Economic Activity", si: "ආවේණික / විශේෂිත ආර්ථික කටයුතු" }, type: "text" },
    { key: "natureOfActivity", label: { en: "Nature of the Economic Activity", si: "ආර්ථික කටයුත්තේ ස්වභාවය" }, type: "text" },
    { key: "resourceOrProductUsed", label: { en: "Natural Resource / Raw Material Used", si: "යොදාගන්නා ස්වභාවික සම්පත්/අමුද්‍රව්‍ය" }, type: "text" },
  ];

  const agriMachineryColumns: RepeatableColumn[] = [
    { key: "typeLabel", label: { en: "Equipment", si: "යන්ත්‍රෝපකරණය" }, type: "readonly" },
    { key: "count", label: { en: "Count", si: "ගණන" }, type: "number" },
  ];

  const forestDamageColumns: RepeatableColumn[] = [
    { key: "typeLabel", label: { en: "Type of Damage", si: "හානියේ ස්වභාවය" }, type: "readonly" },
    { key: "present", label: { en: "Present", si: "ඇත/නැත" }, type: "select", options: YES_NO_OPTIONS },
  ];

  const livestockFarmColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
    { key: "phone", label: { en: "Phone", si: "දුරකථන අංකය" }, type: "text" },
    { key: "cattle", label: { en: "Cattle", si: "ගවයන්" }, type: "number" },
    { key: "layerChickens", label: { en: "Layer Chickens", si: "බිත්තර සඳහා කුකුළන්" }, type: "number" },
    { key: "broilerChickens", label: { en: "Broiler Chickens", si: "මස් සඳහා කුකුළන්" }, type: "number" },
    { key: "goats", label: { en: "Goats", si: "එළුවන්" }, type: "number" },
    { key: "pigs", label: { en: "Pigs", si: "ඌරන්" }, type: "number" },
    { key: "peacock", label: { en: "Turkeys", si: "තාරාවන්" }, type: "number" },
    { key: "other", label: { en: "Other", si: "වෙනත්" }, type: "number" },
  ];

  const industryColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Industry Name", si: "කර්මාන්තයේ නම" }, type: "text" },
    { key: "productionType", label: { en: "Production Type", si: "නිෂ්පාදන වර්ග" }, type: "text" },
    { key: "employeeCount", label: { en: "Employee Count", si: "සේවක ගණන" }, type: "number" },
    { key: "phone", label: { en: "Phone Number", si: "දුරකථන අංකය" }, type: "text" },
    {
      key: "marketplace",
      label: { en: "* Marketplace", si: "*වෙළඳපොළ" },
      type: "select",
      options: MARKETPLACES.map((m) => ({ value: m, label: MARKETPLACE_LABELS[m] })),
    },
  ];

  const fisheriesSocietyColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Fisheries Society Name", si: "ධීවර සමිතියේ නම" }, type: "text" },
    { key: "address", label: { en: "Fisheries Society Address", si: "ධීවර සමිතියේ ලිපිනය" }, type: "text" },
    { key: "memberCount", label: { en: "Member Count", si: "සාමාජික ගණන" }, type: "number" },
  ];

  const inlandWaterBodyColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name of Tank / Reservoir (Perennial / Seasonal)", si: "වැව්/ජලාශ නම (නිතය/කාලීන)" }, type: "text" },
    {
      key: "type",
      label: { en: "* Type", si: "*වර්ගය" },
      type: "select",
      options: INLAND_WATER_BODY_TYPES.map((t) => ({ value: t, label: INLAND_WATER_BODY_TYPE_LABELS[t] })),
    },
  ];

  const namePhoneColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Name", si: "නම" }, type: "text" },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
    { key: "phone", label: { en: "Phone", si: "දුරකථන අංකය" }, type: "text" },
  ];

  const fishLandingSiteColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Fish Harbor / Fish Landing Site Name", si: "ධීවර වරාය/ධීවර තොටුපොළ නම" }, type: "text" },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
    {
      key: "siteType",
      label: { en: "* Type", si: "*වර්ගය" },
      type: "select",
      options: FISH_SITE_TYPES.map((t) => ({ value: t, label: FISH_SITE_TYPE_LABELS[t] })),
    },
    {
      key: "waterType",
      label: { en: "** Whether the Site is Marine or Inland (Freshwater)", si: "**තොටුපොළ /වරාය කරදිය හෝ මිරිදියද යන්න" },
      type: "select",
      options: WATER_TYPES.map((t) => ({ value: t, label: WATER_TYPE_LABELS[t] })),
    },
  ];

  const nameAddressColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Ice Factory Name", si: "අයිස් නිෂ්පාදනාගාරයන්හි නම" }, type: "text" },
    { key: "address", label: { en: "Address", si: "ලිපිනය" }, type: "text" },
  ];

  const teaEstateColumns: RepeatableColumn[] = [
    { key: "name", label: { en: "Tea Estate Name", si: "තේ වත්තේ නම" }, type: "text" },
    {
      key: "ownership",
      label: { en: "* Ownership", si: "*අයිතිය" },
      type: "select",
      options: TEA_ESTATE_OWNERSHIP.map((o) => ({ value: o, label: TEA_ESTATE_OWNERSHIP_LABELS[o] })),
    },
    { key: "extentAcres", label: { en: "Extent - Acres", si: "භූමි ප්‍රමාණය - අක්." }, type: "number" },
    { key: "extentRoods", label: { en: "Extent - Roods", si: "භූමි ප්‍රමාණය - රුඩ්." }, type: "number" },
    { key: "extentPerches", label: { en: "Extent - Perches", si: "භූමි ප්‍රමාණය - පර්." }, type: "number" },
    { key: "employeesFemale", label: { en: "Employees - Female", si: "සේවකයින් ගණන - ස්ත්‍රී" }, type: "number" },
    { key: "employeesMale", label: { en: "Employees - Male", si: "සේවකයින් ගණන - පුරුෂ" }, type: "number" },
  ];

  const headingClass = cn("text-fluid-lg font-semibold text-foreground", lang === "si" && "font-si-heading");

  return (
    <SectionForm
      sectionNumber={10}
      title={economicAgricultureDict.title}
      description={economicAgricultureDict.description}
      form={form}
      saveStatus={status}
      saveErrorMessage={errorMessage}
      onSaveDraft={handleSave}
    >
      <div className="border-t-0 pt-0">
        <RepeatableTable
          name="landUse"
          title={economicAgricultureDict.fields.landUse}
          columns={landUseColumns}
          fixedRows
          emptyRowFactory={() => ({ landType: LAND_USE_TYPES[0], landTypeLabel: LAND_USE_LABELS[LAND_USE_TYPES[0]][lang], extentHectares: 0 })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="animalHusbandryCounts"
          title={economicAgricultureDict.fields.animalHusbandryCounts}
          columns={animalHusbandryCountColumns}
          fixedRows
          emptyRowFactory={() => ({
            type: FLORAL_CULTIVATION_TYPES[0],
            typeLabel: FLORAL_CULTIVATION_LABELS[FLORAL_CULTIVATION_TYPES[0]][lang],
            count: 0,
          })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="animalHusbandryDirectory"
          title={economicAgricultureDict.fields.animalHusbandryDirectory}
          columns={animalHusbandryDirectoryColumns}
          emptyRowFactory={() => ({ name: "", address: "", phone: "", type: FLORAL_CULTIVATION_TYPES[0], marketplace: "local" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="specialEconomicActivities"
          title={economicAgricultureDict.fields.specialEconomicActivities}
          columns={specialEconomicActivityColumns}
          emptyRowFactory={() => ({ activity: "", natureOfActivity: "", resourceOrProductUsed: "" })}
        />
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-6">
        <h2 lang={lang} className={headingClass}>
          {economicAgricultureDict.fields.abandonedPaddyLand[lang]}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper
            name="abandonedPaddyLand.extentAcres"
            label={{ en: "Abandoned Paddy Land Extent (Acres)", si: "පුරන් කුඹුරු බිම් ප්‍රමාණය (අක්.)" }}
          >
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("abandonedPaddyLand.extentAcres")} />
            )}
          </FieldWrapper>
          <FieldWrapper
            name="abandonedPaddyLand.canBeReactivatedExtent"
            label={{ en: "Extent of Abandoned Paddy Land That Can Be Recultivated", si: "නැවත වගාකල හැකි පුරන් කුඹුරු බිම් ප්‍රමාණය" }}
          >
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("abandonedPaddyLand.canBeReactivatedExtent")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="abandonedPaddyLand.reason" label={{ en: "Reason for Being Abandoned", si: "පුරන් වීමට හේතු" }} className="sm:col-span-2">
            {({ id, describedBy, invalid }) => (
              <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} {...form.register("abandonedPaddyLand.reason")} />
            )}
          </FieldWrapper>
          <FieldWrapper
            name="abandonedPaddyLand.actionPlan"
            label={{
              en: "Alternative Action to Take for Recultivation, or If Not Recultivating",
              si: "නැවත වගාව සඳහා හෝ නැතිනම් එසේ නොමැතිනම් ගතයුතු විකල්ප ක්‍රියා මාර්ග",
            }}
            className="sm:col-span-2"
          >
            {({ id, describedBy, invalid }) => (
              <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} {...form.register("abandonedPaddyLand.actionPlan")} />
            )}
          </FieldWrapper>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="agriMachinery"
          title={economicAgricultureDict.fields.agriMachinery}
          columns={agriMachineryColumns}
          fixedRows
          emptyRowFactory={() => ({ type: AGRI_MACHINERY_TYPES[0], typeLabel: AGRI_MACHINERY_LABELS[AGRI_MACHINERY_TYPES[0]][lang], count: 0 })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="forestDamage"
          title={economicAgricultureDict.fields.forestDamage}
          columns={forestDamageColumns}
          fixedRows
          emptyRowFactory={() => ({
            type: CROP_DAMAGE_TYPES[0],
            typeLabel: CROP_DAMAGE_LABELS[CROP_DAMAGE_TYPES[0]][lang],
            present: "no",
          })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="livestockFarms"
          title={economicAgricultureDict.fields.livestockFarms}
          columns={livestockFarmColumns}
          emptyRowFactory={() => ({ name: "", address: "", phone: "", cattle: 0, layerChickens: 0, broilerChickens: 0, goats: 0, pigs: 0, peacock: 0, other: 0 })}
        />
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-6">
        <h2 lang={lang} className={headingClass}>
          {economicAgricultureDict.fields.industryCounts[lang]}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="industryCounts.householdIndustry" label={{ en: "* Household Industry Count", si: "*ගෘහස්ථ කර්මාන්ත ගණන" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("industryCounts.householdIndustry")} />
            )}
          </FieldWrapper>
          <FieldWrapper
            name="industryCounts.under5Employees"
            label={{ en: "** Factories with Under 5 Employees", si: "**සේවක සංඛ්‍යාව 5ට අඩු කර්මාන්තශාලා ගණන" }}
          >
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("industryCounts.under5Employees")} />
            )}
          </FieldWrapper>
          <FieldWrapper
            name="industryCounts.over5Employees"
            label={{ en: "*** Factories with 5+ Employees", si: "***සේවක සංඛ්‍යාව 5ට වැඩි කර්මාන්තශාලා ගණන" }}
          >
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("industryCounts.over5Employees")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="industryCountsTotal" label={{ en: "Total Factory Count", si: "මුළු කර්මාන්තශාලා ගණන" }}>
            {({ id }) => (
              <Input
                id={id}
                readOnly
                disabled
                value={
                  (Number(form.watch("industryCounts.householdIndustry")) || 0) +
                  (Number(form.watch("industryCounts.under5Employees")) || 0) +
                  (Number(form.watch("industryCounts.over5Employees")) || 0)
                }
                className="nums-tabular"
              />
            )}
          </FieldWrapper>
        </div>
        <p className="whitespace-pre-line text-fluid-xs text-muted-foreground">
          <Bilingual
            as="span"
            en={
              "* Industries carried out with the participation of household members only.\n" +
              "** Factories in the division with fewer than 5 employees (excluding household industries).\n" +
              "*** Factories in the division with 5 or more employees.\n" +
              "Industrial parks and investment promotion zones should be excluded; all other industries should be included here."
            }
            si={
              "*ගෘහ ඒකකයක සමාජිකයන් පමණක් සහභාගී වීමෙන් සිදු කරන කර්මාන්ත\n" +
              "**කොට්ඨාසයේ පවතින කර්මාන්තශාලා සේවක සංඛ්‍යාව 5ට අඩු - (ගෘහ කර්මාන්ත හැර)\n" +
              "***කොට්ඨාසයේ පවතින කර්මාන්තශාලා සේවක සංඛ්‍යාව 5ට වැඩි\n" +
              "කර්මාන්ත පුර හා ආයෝජන ප්‍රවර්ධන කලාප හැර අනෙකුත් කර්මාන්ත මෙහිදී ගත යුතුය."
            }
          />
        </p>
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="industries"
          title={economicAgricultureDict.fields.industries}
          columns={industryColumns}
          emptyRowFactory={() => ({ name: "", productionType: "", employeeCount: 0, phone: "", marketplace: "local" })}
        />
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-6">
        <h2 lang={lang} className={headingClass}>
          {economicAgricultureDict.fields.marineFisheries[lang]}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="marineFisheries.householdCount" label={{ en: "* Fishing Household Count", si: "*ධීවර පවුල් ගණන" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("marineFisheries.householdCount")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="marineFisheries.fishingPopulation" label={{ en: "Fishing Population", si: "ධීවර ජනගහනය" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("marineFisheries.fishingPopulation")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="marineFisheries.activeFishermenCount" label={{ en: "Number of Active Fishermen", si: "සක්‍රිය ධීවරයින් සංඛ්‍යාව" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("marineFisheries.activeFishermenCount")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="marineFisheries.societyCount" label={{ en: "Number of Fisheries Societies", si: "ධීවර සමිති ගණන" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("marineFisheries.societyCount")} />
            )}
          </FieldWrapper>
        </div>
        <Bilingual
          as="p"
          en="* Main source of income being the marine fishing industry."
          si="*ප්‍රධාන ආදායම් මාර්ගය ධීවර කර්මාන්තය වීම"
          className="text-fluid-xs text-muted-foreground"
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="marineFisheriesSocieties"
          title={economicAgricultureDict.fields.marineFisheriesSocieties}
          columns={fisheriesSocietyColumns}
          emptyRowFactory={() => ({ name: "", address: "", memberCount: 0 })}
        />
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-6">
        <h2 lang={lang} className={headingClass}>
          {economicAgricultureDict.fields.inlandFisheries[lang]}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FieldWrapper name="inlandFisheries.householdCount" label={{ en: "Fishing Household Count", si: "ධීවර පවුල් ගණන" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("inlandFisheries.householdCount")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="inlandFisheries.fishingPopulation" label={{ en: "Fishing Population", si: "ධීවර ජනගහනය" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("inlandFisheries.fishingPopulation")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="inlandFisheries.activeFishermenCount" label={{ en: "Number of Active Fishermen", si: "සක්‍රිය ධීවරයින් සංඛ්‍යාව" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("inlandFisheries.activeFishermenCount")} />
            )}
          </FieldWrapper>
          <FieldWrapper name="inlandFisheries.societyCount" label={{ en: "Number of Fisheries Societies", si: "ධීවර සමිති ගණන" }}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} {...form.register("inlandFisheries.societyCount")} />
            )}
          </FieldWrapper>
        </div>
        <Bilingual
          as="p"
          en="* Main source of income being the inland (freshwater) fishing industry."
          si="*ප්‍රධාන ආදායම් මාර්ගය මිරිදිය ධීවර කර්මාන්තය වීම"
          className="text-fluid-xs text-muted-foreground"
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="inlandFisheriesSocieties"
          title={economicAgricultureDict.fields.inlandFisheriesSocieties}
          columns={fisheriesSocietyColumns}
          emptyRowFactory={() => ({ name: "", address: "", memberCount: 0 })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="inlandWaterBodies"
          title={economicAgricultureDict.fields.inlandWaterBodies}
          columns={inlandWaterBodyColumns}
          emptyRowFactory={() => ({ name: "", type: "perennial" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="aquacultureDirectory"
          title={economicAgricultureDict.fields.aquacultureDirectory}
          columns={namePhoneColumns}
          emptyRowFactory={() => ({ name: "", address: "", phone: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="ornamentalFishDirectory"
          title={economicAgricultureDict.fields.ornamentalFishDirectory}
          columns={namePhoneColumns}
          emptyRowFactory={() => ({ name: "", address: "", phone: "" })}
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 border-t border-border pt-6">
        <FieldWrapper name="fishLandingSitePresent" label={economicAgricultureDict.fields.fishLandingSitePresent}>
          {({ id, describedBy, invalid }) => (
            <Select
              value={form.watch("fishLandingSitePresent") ?? ""}
              onValueChange={(v) => form.setValue("fishLandingSitePresent", v as "yes" | "no", { shouldDirty: true })}
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
          name="fishLandingSites"
          title={economicAgricultureDict.fields.fishLandingSites}
          columns={fishLandingSiteColumns}
          emptyRowFactory={() => ({ name: "", address: "", siteType: "landing-site", waterType: "marine" })}
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 border-t border-border pt-6">
        <FieldWrapper name="iceProductionPresent" label={economicAgricultureDict.fields.iceProductionPresent}>
          {({ id, describedBy, invalid }) => (
            <Select
              value={form.watch("iceProductionPresent") ?? ""}
              onValueChange={(v) => form.setValue("iceProductionPresent", v as "yes" | "no", { shouldDirty: true })}
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
          name="iceProductionDirectory"
          title={economicAgricultureDict.fields.iceProductionDirectory}
          columns={nameAddressColumns}
          emptyRowFactory={() => ({ name: "", address: "" })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <RepeatableTable
          name="teaEstates"
          title={economicAgricultureDict.fields.teaEstates}
          columns={teaEstateColumns}
          emptyRowFactory={() => ({
            name: "",
            ownership: "govt",
            extentAcres: 0,
            extentRoods: 0,
            extentPerches: 0,
            employeesFemale: 0,
            employeesMale: 0,
          })}
        />
      </div>
    </SectionForm>
  );
}
