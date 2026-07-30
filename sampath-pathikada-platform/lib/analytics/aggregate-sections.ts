import { SELF_EMPLOYMENT_SECTORS } from "@/lib/validators/sections/employment";
import { ORGANIZATION_TYPES } from "@/lib/validators/sections/community-organizations";
import { LAND_USE_TYPES } from "@/lib/validators/sections/economic-agriculture";
import type { SubmissionData } from "@/lib/types/submission";

/* ── Shared row shapes ──────────────────────────────────────────────────── */
export interface Bilingual { en: string; si: string; }
export interface IndexedCount extends Bilingual { count: number; }
export interface IndexedPresence extends Bilingual { presentCount: number; name?: string; }
export interface LabelCount { label: string; count: number; }

/** GN-division-tagged row for directory/list tables — every row carries where it came from. */
export type TaggedRow<T> = T & { gnId: string; gnName: string };

const ROW_CAP = 500;

function tag<T>(rows: T[] | undefined, gnId: string, gnName: string): TaggedRow<T>[] {
  return (Array.isArray(rows) ? rows : []).map((r) => ({ ...r, gnId, gnName }) as TaggedRow<T>);
}

function capRows<T>(rows: T[]): { rows: T[]; truncated: boolean } {
  if (rows.length <= ROW_CAP) return { rows, truncated: false };
  return { rows: rows.slice(0, ROW_CAP), truncated: true };
}

interface SubmissionLike { data: unknown; gnDivision: string; }

function sectionData<K extends keyof SubmissionData>(row: SubmissionLike, key: K): SubmissionData[K] | undefined {
  return (row.data as SubmissionData | null)?.[key];
}

/** How many of the scoped submissions have any data at all for a given section. */
function coverage(rows: SubmissionLike[], key: keyof SubmissionData): { withData: number; total: number } {
  const withData = rows.filter((r) => {
    const v = sectionData(r, key);
    return v && Object.keys(v as object).length > 0;
  }).length;
  return { withData, total: rows.length };
}

/* ── Canonical bilingual labels for fixed-index category arrays ──────────
   These mirror the label constants declared locally inside each EDO entry-form
   page (see plan doc) — duplicated here because those files are "use client"
   pages, not meant for server-side import, and the labels are stable form
   constants rather than user data. */

const JOB_SEEKER_EDUCATION_LABELS: Bilingual[] = [
  { en: "Vocational Training", si: "වෘත්තීය පුහුණුව ලත්" },
  { en: "Below O/L", si: "සාමාන්‍ය පෙළට අඩු" },
  { en: "O/L Pass", si: "සාමාන්‍ය පෙළ සමත්" },
  { en: "A/L Pass", si: "උසස් පෙළ සමත්" },
  { en: "Degree and Above", si: "උපාධි සහ ඊට වැඩි" },
];

const SELF_EMPLOYMENT_SECTOR_LABELS: Record<string, Bilingual> = {
  "food-production": { en: "Food Production", si: "ආහාර නිෂ්පාදනය" },
  "confectionery-production": { en: "Confectionery Production", si: "රසකැවිලි නිෂ්පාදනය" },
  "spice-production": { en: "Spice Production", si: "කුළුබඩු නිෂ්පාදනය" },
  "rice-parcel-production": { en: "Rice-Parcel Production", si: "බත් පාර්සල් නිෂ්පාදනය" },
  "bakery-production": { en: "Bakery Production", si: "බේකරි නිෂ්පාදන" },
  "garment-knitwear-production": { en: "Garment / Knitwear Production", si: "ඇහළුම් නිෂ්පාදන" },
  dressmaking: { en: "Dressmaking / Sewing", si: "ඇදුම් මැසීම" },
  "cleaning-products-production": { en: "Cleaning Products Production", si: "පාහිසි නිෂ්පාදනය" },
  "beverage-soda-production": { en: "Beverage / Soda Production", si: "බීරලු/සෝඩා නිෂ්පාදනය" },
  "decorative-items-production": { en: "Decorative Items Production", si: "විසිතුරු භාණ්ඩ නිෂ්පාදනය" },
  "coconut-shell-production": { en: "Coconut-Shell Related Production", si: "පොල්කටු ආශ්‍රිත නිෂ්පාදන" },
  "masonry-work": { en: "Masonry Work", si: "පැස්සුම් වැඩ" },
  "motor-vehicle-repair": { en: "Motor Vehicle Repair", si: "මෝටර් රථ කාර්මික වැඩියාව" },
  "bicycle-repair": { en: "Bicycle Repair", si: "පාපැදි කාර්මික වැඩියාව" },
  "traditional-craft-work": { en: "Traditional Craft Work", si: "පෙදරේරු කර්මාන්තය" },
  carpentry: { en: "Carpentry", si: "වඩු කර්මාන්තය" },
  "electrical-appliance-repair": { en: "Electrical Appliance Repair", si: "විදුලිඋපකරණ කාර්මික වැඩියාව" },
  "jewelry-production": { en: "Jewelry / Ornaments Production", si: "ස්වර්ණාභරණ නිෂ්පාදනය" },
  "floriculture-production": { en: "Floriculture Production", si: "ෆ්ලෝරිකල්චර් නිෂ්පාදනය" },
  "cinnamon-peeling": { en: "Cinnamon Peeling", si: "කුරුදු තැලීම" },
  "fish-related-production": { en: "Fish-Related Production (Dried Fish / Jars)", si: "මාළු ආශ්‍රිත නිෂ්පාදන (කරවල/ජාඩි)" },
  "fishing-gear-repair": { en: "Fishing Gear / Net Repair", si: "දිවර ආම්පන්න අළුත්වැඩියාව" },
  "fish-trade": { en: "Fish Trade (Mobile Vehicle)", si: "මාළු වෙළදාම (ජංගම රථ මගින්)" },
};

const ORGANIZATION_TYPE_LABELS: Record<string, Bilingual> = {
  "village-development-society": { en: "Village Development Society", si: "ග්‍රාම සංවර්ධන සමිතිය" },
  "youth-society": { en: "Youth Society", si: "යුවජන සමිතිය" },
  "sports-club": { en: "Sports Club", si: "ක්‍රීඩා සමාජය" },
  "funeral-aid-society": { en: "Funeral Aid Society", si: "අවමංගල්‍ය සහන සමිතිය" },
  "womens-society": { en: "Women's Society", si: "කාන්තා සමිතිය" },
  "elders-society": { en: "Elders' Society", si: "වැඩිහිටි සමිතිය" },
  "childrens-society": { en: "Children's Society", si: "ළමා සමිතිය" },
  "samurdhi-society": { en: "Samurdhi Society", si: "සමෘද්ධි සමිතිය" },
  "friend-organization": { en: "Friend Organization / Association", si: "මිතුරු සංවිධාන/මිතුරු හවුල්" },
  "ngo-committee": { en: "Non-Governmental Organization Committee", si: "රාජ්‍ය නොවන සංවිධාන සමිති" },
  "farmer-society": { en: "Farmer Society", si: "ගොවි සංවිධානය" },
  "religious-society": { en: "Religious Society", si: "ආගමික සමිතිය" },
  "sanasa-society": { en: "SANASA Society", si: "සණස සමිතිය" },
  "civil-defense-committee": { en: "Civil Defense Committee", si: "සිවිල් ආරක්ෂක කමිටුව" },
  "prajashakthi-society": { en: "Prajashakthi Society", si: "ප්‍රජාශක්ති සමිතිය" },
};

const SERVICE_CATEGORY_LABELS: Bilingual[] = [
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

const PUBLIC_FACILITY_CATEGORY_LABELS: Bilingual[] = [
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

const DISPOSAL_METHOD_LABELS: Bilingual[] = [
  { en: "Burning", si: "පිලිස්සීම" },
  { en: "Burying", si: "වළලීම" },
  { en: "Dumping in Canal / Drain", si: "ඇළ මාර්ග/කාණුවලට බැහැර කිරීම" },
  { en: "Public Dumpsite", si: "පොදු කසළ බැහැර කිරීමේ ස්ථානය" },
  { en: "Other", si: "වෙනත්" },
];

const LAND_USE_LABELS_LIST: Bilingual[] = [
  { en: "Forest", si: "වනාන්තර" },
  { en: "Paddy Cultivation", si: "වී වගාව" },
  { en: "Abandoned Paddy Land", si: "පුරන් කුඹුරු" },
  { en: "Agricultural Land - Tea", si: "කෘෂිකාර්මික ඉඩම් - තේ" },
  { en: "Agricultural Land - Coconut", si: "කෘෂිකාර්මික ඉඩම් - පොල්" },
  { en: "Agricultural Land - Rubber", si: "කෘෂිකාර්මික ඉඩම් - රබර්" },
  { en: "Cinnamon", si: "කුරුඳු" },
  { en: "Pepper", si: "ගම්මිරිස්" },
  { en: "Coffee", si: "කෝපි" },
  { en: "Vegetables", si: "එළවළු" },
  { en: "Fruits", si: "පලතුරු" },
  { en: "Tuber Crops", si: "අල බෝග වගාව" },
  { en: "Supplementary Food Crops", si: "අතිරේක ආහාර බෝග" },
  { en: "Inland Reservoirs", si: "අභ්‍යන්තර ජලාශ" },
  { en: "Roads / Sports Grounds / Home Gardens", si: "මාර්ග/ක්‍රීඩා භූමි/ගෙවතු වගාව" },
  { en: "Scrubland / Chena / Barren Land", si: "ඵලදු කැළෑ/හේන්/මුඩු බිම" },
  { en: "Ornamental Plant Nurseries", si: "විසිතුරු පැල තවාන්" },
  { en: "Plantation Crop Nurseries", si: "වැවිලි බෝග පැල තවාන්" },
  { en: "Aquaculture Land", si: "ජල ජීවි වගාව" },
];

const FLORAL_CULTIVATION_LABELS_LIST: Bilingual[] = [
  { en: "Floor Flower Cultivation", si: "බිම් මල් වගාව" },
  { en: "Protected Greenhouse Cultivation", si: "ආරක්ෂිත ගෘහකුළ වගාව" },
  { en: "Beekeeping", si: "මීමැසි පාලනය" },
];

const AGRI_MACHINERY_LABELS_LIST: Bilingual[] = [
  { en: "2-Wheel Tractor", si: "රෝද දෙකේ ට්‍රැක්ටර්" },
  { en: "2-Wheel Tractor + Rotavator", si: "රෝද දෙකේ ට්‍රැක්ටර් රොටවේටර්" },
  { en: "2-Wheel Tractor + Mould Board Plough", si: "රෝද දෙකේ ට්‍රැක්ටර් මෝල්ඩ් බෝඩ් නගුල" },
  { en: "4-Wheel Tractor", si: "රෝද හතරේ ට්‍රැක්ටර්" },
  { en: "4-Wheel Tractor + Rotavator", si: "රෝද හතරේ ට්‍රැක්ටර් රොටවේටර්" },
  { en: "4-Wheel Tractor + Disc Plough", si: "රෝද හතරේ ට්‍රැක්ටර් ඩිස්ක් නගුල" },
  { en: "Water Pump", si: "වතුර පොම්ප" },
  { en: "Transplanter", si: "නෙළුම් සිටුවන යන්ත්‍ර" },
  { en: "Weeder", si: "වල් නෙළීම් කර" },
  { en: "Harvester", si: "අස්වනු නෙළන යන්ත්‍ර" },
  { en: "Power Sprayer", si: "බලවේග දියර ඉසින යන්ත්‍ර" },
  { en: "Sprinkler Irrigation Equipment", si: "වර්ෂණ ජලාපවහන යන්ත්‍ර" },
  { en: "Water Spraying Equipment", si: "ජල විජලන යන්ත්‍ර" },
  { en: "Grass Cutter", si: "තෘණ නෙළන යන්ත්‍ර" },
  { en: "Food Processing Equipment", si: "ආහාර විජලන යන්ත්‍ර" },
  { en: "Paddy Dryer / Parboiling Equipment", si: "බිම් මට්ටමේ මාධ්‍ය හිරවුම් යන්ත්‍ර" },
  { en: "Paddy Miller", si: "බිම් මට්ටමේ මාධ්‍ය මාළු ම යන්ත්‍ර" },
  { en: "Chena Planting Equipment", si: "පෑළ සිටුවන යන්ත්‍ර" },
  { en: "Paddy Winnower", si: "වී වේළන යන්ත්‍ර" },
  { en: "Oil Mill", si: "තෙල් මෝල්" },
  { en: "Rubber Mill", si: "රබර් මෝල්" },
  { en: "Paddy Mill", si: "වී මෝල්" },
  { en: "Other", si: "වෙනත්" },
];

const CROP_DAMAGE_LABELS_LIST: Bilingual[] = [
  { en: "Wild Elephant Conflict", si: "අලි ගැටළුව/අලි මිනිස් ගැටුම" },
  { en: "Monkey / Porcupine / Wild Boar Damage", si: "රිලව්/වඳුරන්/දඬුලේණා/ඌරා ආදී වන හානි" },
  { en: "Peacock Damage", si: "මොණර හානිය" },
  { en: "Flood Damage", si: "ගංවතුර හානිය" },
  { en: "Drought", si: "නියඟය" },
  { en: "Pest & Disease Conditions", si: "කෘමි උවදුරු හා රෝග තත්ත්ව" },
  { en: "Other", si: "වෙනත්" },
];

/* ── Generic aggregation helpers ─────────────────────────────────────────── */

/** Sum a fixed-length label/count array by index position (see plan doc for why index, not label string). */
function sumIndexedCounts(
  rows: SubmissionLike[],
  key: keyof SubmissionData,
  arrayKey: string,
  labels: Bilingual[]
): IndexedCount[] {
  const totals = labels.map((l) => ({ ...l, count: 0 }));
  for (const row of rows) {
    const section = sectionData(row, key) as Record<string, unknown> | undefined;
    const arr = section?.[arrayKey] as { count?: number }[] | undefined;
    if (!Array.isArray(arr)) continue;
    arr.forEach((r, i) => { if (totals[i]) totals[i].count += r.count ?? 0; });
  }
  return totals;
}

/** Sum a fixed-length label/presence(yesNo) array by index position, counting "yes" occurrences. */
function sumIndexedPresence(
  rows: SubmissionLike[],
  key: keyof SubmissionData,
  arrayKey: string,
  labels: Bilingual[]
): IndexedPresence[] {
  const totals: IndexedPresence[] = labels.map((l) => ({ ...l, presentCount: 0 }));
  for (const row of rows) {
    const section = sectionData(row, key) as Record<string, unknown> | undefined;
    const arr = section?.[arrayKey] as { present?: string; name?: string }[] | undefined;
    if (!Array.isArray(arr)) continue;
    arr.forEach((r, i) => {
      if (!totals[i]) return;
      if (r.present === "yes") totals[i].presentCount++;
      if (r.name) totals[i].name = r.name;
    });
  }
  return totals;
}

/** Sum a free-form label/count array, grouped by the trimmed label string itself. */
function sumFreeformCounts(
  rows: SubmissionLike[],
  key: keyof SubmissionData,
  arrayKey: string
): LabelCount[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const section = sectionData(row, key) as Record<string, unknown> | undefined;
    const arr = section?.[arrayKey] as { label?: string; count?: number }[] | undefined;
    if (!Array.isArray(arr)) continue;
    for (const r of arr) {
      const label = (r.label ?? "").trim();
      if (!label) continue;
      map.set(label, (map.get(label) ?? 0) + (r.count ?? 0));
    }
  }
  return [...map.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

/** Count "yes" occurrences of a free-form label/present(yesNo) array, grouped by label string. */
function sumFreeformPresence(
  rows: SubmissionLike[],
  key: keyof SubmissionData,
  arrayKey: string
): LabelCount[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const section = sectionData(row, key) as Record<string, unknown> | undefined;
    const arr = section?.[arrayKey] as { label?: string; present?: string }[] | undefined;
    if (!Array.isArray(arr)) continue;
    for (const r of arr) {
      const label = (r.label ?? "").trim();
      if (!label || r.present !== "yes") continue;
      map.set(label, (map.get(label) ?? 0) + 1);
    }
  }
  return [...map.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

/** Infers the exact row element type straight from `SubmissionData[K][ArrKey]`, so callers
 *  never need to pass an explicit type argument (and can't silently fall back to `unknown`). */
type ArrayElement<T> = T extends (infer U)[] ? U : never;
type SectionArrayElement<K extends keyof SubmissionData, ArrKey extends string> =
  ArrayElement<NonNullable<NonNullable<SubmissionData[K]>[ArrKey & keyof NonNullable<SubmissionData[K]>]>>;

function flattenRows<K extends keyof SubmissionData, ArrKey extends string>(
  rows: SubmissionLike[], gnLabel: (id: string) => string, key: K, arrayKey: ArrKey
): TaggedRow<SectionArrayElement<K, ArrKey>>[] {
  const out: TaggedRow<SectionArrayElement<K, ArrKey>>[] = [];
  for (const row of rows) {
    const section = sectionData(row, key) as Record<string, unknown> | undefined;
    const arr = section?.[arrayKey] as SectionArrayElement<K, ArrKey>[] | undefined;
    out.push(...tag(arr, row.gnDivision, gnLabel(row.gnDivision)));
  }
  return out;
}

/* ── Housing ──────────────────────────────────────────────────────────────── */
export function aggregateHousing(rows: SubmissionLike[], gnLabel: (id: string) => string) {
  const totals = { total: 0, permanent: 0, semiPermanent: 0, nonPermanent: 0 };
  let householdsWithoutHousing = 0;
  const sanitation = { total: 0, withoutSafeSanitation: 0, needingAssistance: 0 };
  const water = {
    well: 0,
    tubeWell: 0,
    spring: 0,
    pipedNational: 0,
    pipedLocalGovt: 0,
    pipedCommunity: 0,
    tankRiverCanalOther: 0,
    bottled: 0,
    treated: 0,
    other: 0,
  };
  const electricityAccess = { total: 0, withElectricity: 0, withSolar: 0, withoutElectricity: 0, needingAssistance: 0 };

  for (const row of rows) {
    const h = sectionData(row, "housing");
    if (!h) continue;
    if (h.housingCounts) {
      totals.total += h.housingCounts.total ?? 0;
      totals.permanent += h.housingCounts.permanent ?? 0;
      totals.semiPermanent += h.housingCounts.semiPermanent ?? 0;
      totals.nonPermanent += h.housingCounts.nonPermanent ?? 0;
    }
    householdsWithoutHousing += h.householdsWithoutHousing ?? 0;
    if (h.sanitation) {
      sanitation.total += h.sanitation.total ?? 0;
      sanitation.withoutSafeSanitation += h.sanitation.withoutSafeSanitation ?? 0;
      sanitation.needingAssistance += h.sanitation.needingAssistance ?? 0;
    }
    if (h.drinkingWaterSource) {
      water.well += h.drinkingWaterSource.well ?? 0;
      water.tubeWell += h.drinkingWaterSource.tubeWell ?? 0;
      water.spring += h.drinkingWaterSource.spring ?? 0;
      water.pipedNational += h.drinkingWaterSource.pipedNational ?? 0;
      water.pipedLocalGovt += h.drinkingWaterSource.pipedLocalGovt ?? 0;
      water.pipedCommunity += h.drinkingWaterSource.pipedCommunity ?? 0;
      water.tankRiverCanalOther += h.drinkingWaterSource.tankRiverCanalOther ?? 0;
      water.bottled += h.drinkingWaterSource.bottled ?? 0;
      water.treated += h.drinkingWaterSource.treated ?? 0;
      water.other += h.drinkingWaterSource.other ?? 0;
    }
    if (h.electricityAccess) {
      electricityAccess.total += h.electricityAccess.total ?? 0;
      electricityAccess.withElectricity += h.electricityAccess.withElectricity ?? 0;
      electricityAccess.withSolar += h.electricityAccess.withSolar ?? 0;
      electricityAccess.withoutElectricity += h.electricityAccess.withoutElectricity ?? 0;
      electricityAccess.needingAssistance += h.electricityAccess.needingAssistance ?? 0;
    }
  }

  const underservedAreas = capRows(flattenRows(rows, gnLabel, "housing", "underservedAreas"));
  const communityWaterProjects = capRows(flattenRows(rows, gnLabel, "housing", "communityWaterProjects"));

  return {
    coverage: coverage(rows, "housing"),
    housingCounts: totals,
    householdsWithoutHousing,
    sanitation,
    drinkingWaterSource: water,
    electricityAccess,
    underservedAreas,
    communityWaterProjects,
  };
}

/* ── Employment ───────────────────────────────────────────────────────────── */
export function aggregateEmployment(rows: SubmissionLike[], gnLabel: (id: string) => string) {
  const jobSeekersByEducation = sumIndexedCounts(rows, "employment", "jobSeekersByEducation", JOB_SEEKER_EDUCATION_LABELS);
  const sectorLabels = SELF_EMPLOYMENT_SECTORS.map((s) => SELF_EMPLOYMENT_SECTOR_LABELS[s]);
  const selfEmploymentSectors = sumIndexedCounts(rows, "employment", "selfEmploymentSectors", sectorLabels);
  let vocationalTrainingOpportunityGap = 0;
  for (const row of rows) {
    const e = sectionData(row, "employment");
    vocationalTrainingOpportunityGap += e?.vocationalTrainingOpportunityGapCount ?? 0;
  }
  const selfEmployedPersons = capRows(flattenRows(rows, gnLabel, "employment", "selfEmployedPersons"));

  return {
    coverage: coverage(rows, "employment"),
    jobSeekersByEducation,
    totalJobSeekers: jobSeekersByEducation.reduce((s, r) => s + r.count, 0),
    vocationalTrainingOpportunityGapCount: vocationalTrainingOpportunityGap,
    selfEmploymentSectors: selfEmploymentSectors.sort((a, b) => b.count - a.count),
    selfEmployedPersons,
  };
}

/* ── Education ────────────────────────────────────────────────────────────── */
export function aggregateEducation(rows: SubmissionLike[], gnLabel: (id: string) => string) {
  const institutionCounts = {
    govtSchools: 0, privateOrInternationalSchools: 0, pirivenas: 0,
    vocationalTrainingInstitutes: 0, registeredPreschoolsGovt: 0, registeredPreschoolsPrivate: 0,
    dhammaEducationInstitutions: 0, higherEducationInstitutions: 0, tuitionCenterInstitutions: 0,
  };
  const schoolCountsByType = { nationalSchools: 0, type1AB: 0, type1C: 0, type2: 0, type3: 0 };
  const outOfSchoolChildren = { female: 0, male: 0 };
  const childrenInProbationOrDetention = { female: 0, male: 0 };
  let teachersFemaleTotal = 0, teachersMaleTotal = 0, studentFemaleTotal = 0, studentMaleTotal = 0;

  for (const row of rows) {
    const e = sectionData(row, "education");
    if (!e) continue;
    if (e.institutionCounts) {
      institutionCounts.govtSchools += e.institutionCounts.govtSchools ?? 0;
      institutionCounts.privateOrInternationalSchools += e.institutionCounts.privateOrInternationalSchools ?? 0;
      institutionCounts.pirivenas += e.institutionCounts.pirivenas ?? 0;
      institutionCounts.vocationalTrainingInstitutes += e.institutionCounts.vocationalTrainingInstitutes ?? 0;
      institutionCounts.registeredPreschoolsGovt += e.institutionCounts.registeredPreschoolsGovt ?? 0;
      institutionCounts.registeredPreschoolsPrivate += e.institutionCounts.registeredPreschoolsPrivate ?? 0;
      institutionCounts.dhammaEducationInstitutions += e.institutionCounts.dhammaEducationInstitutions ?? 0;
      institutionCounts.higherEducationInstitutions += e.institutionCounts.higherEducationInstitutions ?? 0;
      institutionCounts.tuitionCenterInstitutions += e.institutionCounts.tuitionCenterInstitutions ?? 0;
    }
    if (e.schoolCountsByType) {
      schoolCountsByType.nationalSchools += e.schoolCountsByType.nationalSchools ?? 0;
      schoolCountsByType.type1AB += e.schoolCountsByType.type1AB ?? 0;
      schoolCountsByType.type1C += e.schoolCountsByType.type1C ?? 0;
      schoolCountsByType.type2 += e.schoolCountsByType.type2 ?? 0;
      schoolCountsByType.type3 += e.schoolCountsByType.type3 ?? 0;
    }
    outOfSchoolChildren.female += e.outOfSchoolChildren?.female ?? 0;
    outOfSchoolChildren.male += e.outOfSchoolChildren?.male ?? 0;
    childrenInProbationOrDetention.female += e.childrenInProbationOrDetention?.female ?? 0;
    childrenInProbationOrDetention.male += e.childrenInProbationOrDetention?.male ?? 0;
    for (const sf of Array.isArray(e.schoolFacilities) ? e.schoolFacilities : []) {
      teachersFemaleTotal += sf.teachersFemale ?? 0;
      teachersMaleTotal += sf.teachersMale ?? 0;
      studentFemaleTotal += sf.studentsFemale ?? 0;
      studentMaleTotal += sf.studentsMale ?? 0;
    }
  }

  return {
    coverage: coverage(rows, "education"),
    institutionCounts,
    schoolCountsByType,
    outOfSchoolChildren: { ...outOfSchoolChildren, total: outOfSchoolChildren.female + outOfSchoolChildren.male },
    childrenInProbationOrDetention: {
      ...childrenInProbationOrDetention,
      total: childrenInProbationOrDetention.female + childrenInProbationOrDetention.male,
    },
    schoolStaffAndStudents: {
      teachersFemale: teachersFemaleTotal,
      teachersMale: teachersMaleTotal,
      studentsFemale: studentFemaleTotal,
      studentsMale: studentMaleTotal,
    },
    schoolFacilities: capRows(flattenRows(rows, gnLabel, "education", "schoolFacilities")),
    specialAttentionSchools: capRows(flattenRows(rows, gnLabel, "education", "specialAttentionSchools")),
    closedSchools: capRows(flattenRows(rows, gnLabel, "education", "closedSchools")),
    privateInternationalSchools: capRows(flattenRows(rows, gnLabel, "education", "privateInternationalSchools")),
    pirivenas: capRows(flattenRows(rows, gnLabel, "education", "pirivenas")),
    vocationalInstitutes: capRows(flattenRows(rows, gnLabel, "education", "vocationalInstitutes")),
    preschools: capRows(flattenRows(rows, gnLabel, "education", "preschools")),
    dhammaEducationInstitutions: capRows(flattenRows(rows, gnLabel, "education", "dhammaEducationInstitutions")),
    tertiaryInstitutions: capRows(flattenRows(rows, gnLabel, "education", "tertiaryInstitutions")),
    tuitionCenters: capRows(flattenRows(rows, gnLabel, "education", "tuitionCenters")),
  };
}

/* ── Health ───────────────────────────────────────────────────────────────── */
export function aggregateHealth(rows: SubmissionLike[], gnLabel: (id: string) => string) {
  const institutionCounts = {
    govtHospitals: 0, primaryHealthcareUnits: 0, privateHospitals: 0, ayurvedicHospitals: 0,
    specialistServiceCenters: 0, mohOfficesOrCommunityHealthCenters: 0, privateMedicalLabs: 0,
    traditionalMedicineRegisteredInstitutions: 0, animalClinicCenters: 0, govtPharmacies: 0, privatePharmacies: 0,
  };
  for (const row of rows) {
    const h = sectionData(row, "health");
    if (!h?.institutionCounts) continue;
    for (const k of Object.keys(institutionCounts) as (keyof typeof institutionCounts)[]) {
      institutionCounts[k] += h.institutionCounts[k] ?? 0;
    }
  }
  return {
    coverage: coverage(rows, "health"),
    institutionCounts,
    govtHospitalsDirectory: capRows(flattenRows(rows, gnLabel, "health", "govtHospitalsDirectory")),
    primaryHealthcareUnitsDirectory: capRows(flattenRows(rows, gnLabel, "health", "primaryHealthcareUnitsDirectory")),
    privateHospitalsDirectory: capRows(flattenRows(rows, gnLabel, "health", "privateHospitalsDirectory")),
    ayurvedicInstitutions: capRows(flattenRows(rows, gnLabel, "health", "ayurvedicInstitutions")),
    specialistServiceCentersDirectory: capRows(flattenRows(rows, gnLabel, "health", "specialistServiceCentersDirectory")),
    mohOfficesDirectory: capRows(flattenRows(rows, gnLabel, "health", "mohOfficesDirectory")),
    traditionalMedicineInstitutionsDirectory: capRows(flattenRows(rows, gnLabel, "health", "traditionalMedicineInstitutionsDirectory")),
    privateMedicalLabsDirectory: capRows(flattenRows(rows, gnLabel, "health", "privateMedicalLabsDirectory")),
    animalClinicsDirectory: capRows(flattenRows(rows, gnLabel, "health", "animalClinicsDirectory")),
    traditionalPractitioners: capRows(flattenRows(rows, gnLabel, "health", "traditionalPractitioners")),
  };
}

/* ── Agriculture & Economy (economicAgriculture) ─────────────────────────── */
export function aggregateEconomicAgriculture(rows: SubmissionLike[], gnLabel: (id: string) => string) {
  const landUse = LAND_USE_LABELS_LIST.map((l) => ({ ...l, extentHectares: 0 }));
  const animalHusbandryCounts = sumIndexedCounts(rows, "economicAgriculture", "animalHusbandryCounts", FLORAL_CULTIVATION_LABELS_LIST);
  const agriMachinery = sumIndexedCounts(rows, "economicAgriculture", "agriMachinery", AGRI_MACHINERY_LABELS_LIST);
  const forestDamage = sumIndexedPresence(rows, "economicAgriculture", "forestDamage", CROP_DAMAGE_LABELS_LIST);

  const abandonedPaddyLand = { extentAcres: 0, canBeReactivatedExtent: 0 };
  const industryCounts = { householdIndustry: 0, under5Employees: 0, over5Employees: 0 };
  const marineFisheries = { householdCount: 0, fishingPopulation: 0, activeFishermenCount: 0, societyCount: 0 };
  const inlandFisheries = { householdCount: 0, fishingPopulation: 0, activeFishermenCount: 0, societyCount: 0 };
  let fishLandingSiteYes = 0, iceProductionYes = 0;

  for (const row of rows) {
    const a = sectionData(row, "economicAgriculture");
    if (!a) continue;
    for (const lu of Array.isArray(a.landUse) ? a.landUse : []) {
      const i = LAND_USE_TYPES.indexOf(lu.landType as (typeof LAND_USE_TYPES)[number]);
      if (i >= 0 && landUse[i]) landUse[i].extentHectares += lu.extentHectares ?? 0;
    }
    if (a.abandonedPaddyLand) {
      abandonedPaddyLand.extentAcres += a.abandonedPaddyLand.extentAcres ?? 0;
      abandonedPaddyLand.canBeReactivatedExtent += a.abandonedPaddyLand.canBeReactivatedExtent ?? 0;
    }
    if (a.industryCounts) {
      industryCounts.householdIndustry += a.industryCounts.householdIndustry ?? 0;
      industryCounts.under5Employees += a.industryCounts.under5Employees ?? 0;
      industryCounts.over5Employees += a.industryCounts.over5Employees ?? 0;
    }
    if (a.marineFisheries) {
      marineFisheries.householdCount += a.marineFisheries.householdCount ?? 0;
      marineFisheries.fishingPopulation += a.marineFisheries.fishingPopulation ?? 0;
      marineFisheries.activeFishermenCount += a.marineFisheries.activeFishermenCount ?? 0;
      marineFisheries.societyCount += a.marineFisheries.societyCount ?? 0;
    }
    if (a.inlandFisheries) {
      inlandFisheries.householdCount += a.inlandFisheries.householdCount ?? 0;
      inlandFisheries.fishingPopulation += a.inlandFisheries.fishingPopulation ?? 0;
      inlandFisheries.activeFishermenCount += a.inlandFisheries.activeFishermenCount ?? 0;
      inlandFisheries.societyCount += a.inlandFisheries.societyCount ?? 0;
    }
    if (a.fishLandingSitePresent === "yes") fishLandingSiteYes++;
    if (a.iceProductionPresent === "yes") iceProductionYes++;
  }

  return {
    coverage: coverage(rows, "economicAgriculture"),
    landUse,
    animalHusbandryCounts,
    abandonedPaddyLand,
    marineFisheries,
    inlandFisheries,
    fishLandingSiteDivisionsCount: fishLandingSiteYes,
    iceProductionDivisionsCount: iceProductionYes,
    industryCounts,
    agriMachinery,
    forestDamage,
    animalHusbandryDirectory: capRows(flattenRows(rows, gnLabel, "economicAgriculture", "animalHusbandryDirectory")),
    specialEconomicActivities: capRows(flattenRows(rows, gnLabel, "economicAgriculture", "specialEconomicActivities")),
    livestockFarms: capRows(flattenRows(rows, gnLabel, "economicAgriculture", "livestockFarms")),
    industries: capRows(flattenRows(rows, gnLabel, "economicAgriculture", "industries")),
    marineFisheriesSocieties: capRows(flattenRows(rows, gnLabel, "economicAgriculture", "marineFisheriesSocieties")),
    inlandFisheriesSocieties: capRows(flattenRows(rows, gnLabel, "economicAgriculture", "inlandFisheriesSocieties")),
    inlandWaterBodies: capRows(flattenRows(rows, gnLabel, "economicAgriculture", "inlandWaterBodies")),
    aquacultureDirectory: capRows(flattenRows(rows, gnLabel, "economicAgriculture", "aquacultureDirectory")),
    ornamentalFishDirectory: capRows(flattenRows(rows, gnLabel, "economicAgriculture", "ornamentalFishDirectory")),
    fishLandingSites: capRows(flattenRows(rows, gnLabel, "economicAgriculture", "fishLandingSites")),
    iceProductionDirectory: capRows(flattenRows(rows, gnLabel, "economicAgriculture", "iceProductionDirectory")),
    teaEstates: capRows(flattenRows(rows, gnLabel, "economicAgriculture", "teaEstates")),
  };
}

/* ── Community Organizations + Social Welfare ─────────────────────────────── */
export function aggregateCommunityWelfare(rows: SubmissionLike[], gnLabel: (id: string) => string) {
  const orgLabels = ORGANIZATION_TYPES.map((t) => ORGANIZATION_TYPE_LABELS[t]);
  const organizationCounts = sumIndexedCounts(rows, "communityOrganizations", "organizationCounts", orgLabels);

  const welfarePaymentHouseholdCounts = { rs2500: 0, rs5000: 0, rs8500: 0, rs15000: 0, totalAswesumaRecipients: 0 };
  const allowanceRecipientCounts = {
    disabilityAllowance: 0, elderlyAllowance: 0, nutritionAllowance: 0, publicAssistance: 0,
    diseaseAidWheelchair: 0, diseaseAidCancer: 0, diseaseAidThalassemia: 0, diseaseAidDiabetes: 0, other: 0,
  };

  for (const row of rows) {
    const s = sectionData(row, "socialWelfare");
    if (!s) continue;
    if (s.welfarePaymentHouseholdCounts) {
      for (const k of Object.keys(welfarePaymentHouseholdCounts) as (keyof typeof welfarePaymentHouseholdCounts)[]) {
        welfarePaymentHouseholdCounts[k] += s.welfarePaymentHouseholdCounts[k] ?? 0;
      }
    }
    if (s.allowanceRecipientCounts) {
      for (const k of Object.keys(allowanceRecipientCounts) as (keyof typeof allowanceRecipientCounts)[]) {
        allowanceRecipientCounts[k] += s.allowanceRecipientCounts[k] ?? 0;
      }
    }
  }

  return {
    coverage: {
      communityOrganizations: coverage(rows, "communityOrganizations"),
      socialWelfare: coverage(rows, "socialWelfare"),
    },
    organizationCounts: organizationCounts.sort((a, b) => b.count - a.count),
    organizationDirectory: capRows(flattenRows(rows, gnLabel, "communityOrganizations", "organizationDirectory")),
    cooperativeSocieties: capRows(flattenRows(rows, gnLabel, "communityOrganizations", "cooperativeSocieties")),
    welfarePaymentHouseholdCounts,
    allowanceRecipientCounts,
    eldersHomes: capRows(flattenRows(rows, gnLabel, "socialWelfare", "eldersHomes")),
    childrensHomes: capRows(flattenRows(rows, gnLabel, "socialWelfare", "childrensHomes")),
  };
}

/* ── Infrastructure (roadInfrastructure) ─────────────────────────────────── */
export function aggregateInfrastructure(rows: SubmissionLike[], gnLabel: (id: string) => string) {
  const serviceEstablishments = sumIndexedCounts(rows, "roadInfrastructure", "serviceEstablishments", SERVICE_CATEGORY_LABELS);
  const publicFacilityCategories = sumIndexedPresence(rows, "roadInfrastructure", "publicFacilityCategories", PUBLIC_FACILITY_CATEGORY_LABELS);

  const publicFacilities = {
    busStand: 0, railwayStation: 0, jetty: 0, airport: 0,
  };
  let totalRoadLength = 0;

  for (const row of rows) {
    const r = sectionData(row, "roadInfrastructure");
    if (!r) continue;
    if (r.publicFacilities?.busStand?.present === "yes") publicFacilities.busStand++;
    if (r.publicFacilities?.railwayStation?.present === "yes") publicFacilities.railwayStation++;
    if (r.publicFacilities?.jetty?.present === "yes") publicFacilities.jetty++;
    if (r.publicFacilities?.airport?.present === "yes") publicFacilities.airport++;
    for (const road of Array.isArray(r.roadDevelopmentNeeds) ? r.roadDevelopmentNeeds : []) totalRoadLength += road.lengthMeters ?? 0;
  }

  return {
    coverage: coverage(rows, "roadInfrastructure"),
    publicFacilities,
    serviceEstablishments: serviceEstablishments.sort((a, b) => b.count - a.count),
    publicFacilityCategories,
    totalRoadDevelopmentLengthMeters: totalRoadLength,
    roadDevelopmentNeeds: capRows(flattenRows(rows, gnLabel, "roadInfrastructure", "roadDevelopmentNeeds")),
    bridgeRepairs: capRows(flattenRows(rows, gnLabel, "roadInfrastructure", "bridgeRepairs")),
    newRoadBridgeNeeds: capRows(flattenRows(rows, gnLabel, "roadInfrastructure", "newRoadBridgeNeeds")),
    noPublicTransportAreas: capRows(flattenRows(rows, gnLabel, "roadInfrastructure", "noPublicTransportAreas")),
    railwayCrossingGaps: capRows(flattenRows(rows, gnLabel, "roadInfrastructure", "railwayCrossingGaps")),
    postOffices: capRows(flattenRows(rows, gnLabel, "roadInfrastructure", "postOffices")),
    electricitySubstations: capRows(flattenRows(rows, gnLabel, "roadInfrastructure", "electricitySubstations")),
    fuelDistributionStations: capRows(flattenRows(rows, gnLabel, "roadInfrastructure", "fuelDistributionStations")),
    hydropowerPlants: capRows(flattenRows(rows, gnLabel, "roadInfrastructure", "hydropowerPlants")),
    financialInstitutions: capRows(flattenRows(rows, gnLabel, "roadInfrastructure", "financialInstitutions")),
    industrialEstates: capRows(flattenRows(rows, gnLabel, "roadInfrastructure", "industrialEstates")),
    waterReservoirs: capRows(flattenRows(rows, gnLabel, "roadInfrastructure", "waterReservoirs")),
    licensedLiquorShops: capRows(flattenRows(rows, gnLabel, "roadInfrastructure", "licensedLiquorShops")),
  };
}

/* ── Area Profile: physicalEnvironment + religiousCultural + tourism + wasteDisaster + stateInstitutionsLand ── */
export function aggregateAreaProfile(rows: SubmissionLike[], gnLabel: (id: string) => string) {
  const religiousSiteCounts = {
    temples: { count: 0, clergyCount: 0 }, meheniArama: { count: 0, clergyCount: 0 }, kovils: { count: 0, clergyCount: 0 },
    mosques: { count: 0, clergyCount: 0 }, churches: { count: 0, priestsCount: 0, nunsCount: 0 },
  };
  let hasWasteProgramYes = 0, hasCompostSiteYes = 0;

  for (const row of rows) {
    const rc = sectionData(row, "religiousCultural");
    if (rc?.religiousSiteCounts) {
      for (const k of ["temples", "meheniArama", "kovils", "mosques"] as const) {
        religiousSiteCounts[k].count += rc.religiousSiteCounts[k]?.count ?? 0;
        religiousSiteCounts[k].clergyCount += rc.religiousSiteCounts[k]?.clergyCount ?? 0;
      }
      religiousSiteCounts.churches.count += rc.religiousSiteCounts.churches?.count ?? 0;
      religiousSiteCounts.churches.priestsCount += rc.religiousSiteCounts.churches?.priestsCount ?? 0;
      religiousSiteCounts.churches.nunsCount += rc.religiousSiteCounts.churches?.nunsCount ?? 0;
    }
    const wd = sectionData(row, "wasteDisaster");
    if (wd?.hasWasteProgram === "yes") hasWasteProgramYes++;
    if (wd?.hasCompostOrDisposalSite === "yes") hasCompostSiteYes++;
  }

  const disposalMethodIfNoProgram = sumIndexedPresence(rows, "wasteDisaster", "disposalMethodIfNoProgram", DISPOSAL_METHOD_LABELS);

  return {
    coverage: {
      physicalEnvironment: coverage(rows, "physicalEnvironment"),
      religiousCultural: coverage(rows, "religiousCultural"),
      tourism: coverage(rows, "tourism"),
      wasteDisaster: coverage(rows, "wasteDisaster"),
      identification: coverage(rows, "identification"),
      stateInstitutionsLand: coverage(rows, "stateInstitutionsLand"),
    },
    religiousSiteCounts,
    wasteManagement: {
      divisionsWithProgram: hasWasteProgramYes,
      divisionsWithCompostSite: hasCompostSiteYes,
      disposalMethodIfNoProgram,
    },
    // physicalEnvironment — list-only
    waterSources: capRows(flattenRows(rows, gnLabel, "physicalEnvironment", "waterSources")),
    sensitiveZones: capRows(flattenRows(rows, gnLabel, "physicalEnvironment", "sensitiveZones")),
    naturalResources: capRows(flattenRows(rows, gnLabel, "physicalEnvironment", "naturalResources")),
    hazards: capRows(flattenRows(rows, gnLabel, "physicalEnvironment", "hazards")),
    safeLocations: capRows(flattenRows(rows, gnLabel, "physicalEnvironment", "safeLocations")),
    existingTouristSitesFromPhysicalEnv: capRows(flattenRows(rows, gnLabel, "physicalEnvironment", "touristSites")),
    proposedTouristSites: capRows(flattenRows(rows, gnLabel, "physicalEnvironment", "proposedTouristSites")),
    // religiousCultural — list-only
    heritageSites: capRows(flattenRows(rows, gnLabel, "religiousCultural", "heritageSites")),
    artAcademies: capRows(flattenRows(rows, gnLabel, "religiousCultural", "artAcademies")),
    traditionalArtists: capRows(flattenRows(rows, gnLabel, "religiousCultural", "traditionalArtists")),
    // tourism — list-only
    hotelInventory: capRows(flattenRows(rows, gnLabel, "tourism", "hotelInventory")),
    guestAccommodations: capRows(flattenRows(rows, gnLabel, "tourism", "guestAccommodations")),
    otherAccommodations: capRows(flattenRows(rows, gnLabel, "tourism", "otherAccommodations")),
    // stateInstitutionsLand — list-only
    stateInstitutions: capRows(flattenRows(rows, gnLabel, "stateInstitutionsLand", "stateInstitutions")),
    illegalStructures: capRows(flattenRows(rows, gnLabel, "stateInstitutionsLand", "illegalStructures")),
    developmentProjects: capRows(flattenRows(rows, gnLabel, "stateInstitutionsLand", "developmentProjects")),
  };
}

export type HousingAggregate = ReturnType<typeof aggregateHousing>;
export type EmploymentAggregate = ReturnType<typeof aggregateEmployment>;
export type EducationAggregate = ReturnType<typeof aggregateEducation>;
export type HealthAggregate = ReturnType<typeof aggregateHealth>;
export type EconomicAgricultureAggregate = ReturnType<typeof aggregateEconomicAgriculture>;
export type CommunityWelfareAggregate = ReturnType<typeof aggregateCommunityWelfare>;
export type InfrastructureAggregate = ReturnType<typeof aggregateInfrastructure>;
export type AreaProfileAggregate = ReturnType<typeof aggregateAreaProfile>;
