import { SELF_EMPLOYMENT_SECTORS } from "@/lib/validators/sections/employment";
import { ORGANIZATION_TYPES } from "@/lib/validators/sections/community-organizations";
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
  return (rows ?? []).map((r) => ({ ...r, gnId, gnName }) as TaggedRow<T>);
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
  confectionery: { en: "Confectionery", si: "රසකැවිලි නිෂ්පාදනය" },
  "furniture-production": { en: "Furniture Production", si: "ගෘහ භාණ්ඩ නිෂ්පාදනය" },
  "textile-production": { en: "Textile Production", si: "රෙදිපිළි නිෂ්පාදනය" },
  "bakery-production": { en: "Bakery Production", si: "බේකරි නිෂ්පාදනය" },
  knitting: { en: "Knitting", si: "රෙදි වියන කර්මාන්තය" },
  "garment-sewing": { en: "Garment Sewing", si: "ඇඟලුම් මැසීම" },
  "cleaning-products": { en: "Cleaning Products", si: "සුද්ධිකාරක නිෂ්පාදන" },
  "beverage-juice": { en: "Beverages / Juice Production", si: "පාන වර්ග/යුෂ නිෂ්පාදනය" },
  "decorative-items": { en: "Decorative Items", si: "අලංකාර ද්‍රව්‍ය නිෂ්පාදනය" },
  "coconut-shell-crafts": { en: "Coconut Shell Crafts", si: "පොල් කටු අත්කම්" },
  "masonry-work": { en: "Masonry Work", si: "ගෙතුම් කර්මාන්තය" },
  "auto-mechanic": { en: "Auto Mechanic", si: "මෝටර් රථ අලුත්වැඩියා" },
  "footwear-repair": { en: "Footwear Repair", si: "පාවහන් අලුත්වැඩියා" },
  "welding-shop": { en: "Welding Shop", si: "වෙල්ඩින් කර්මාන්තය" },
  carpentry: { en: "Carpentry", si: "වඩු කර්මාන්තය" },
  "electrical-appliance-repair": { en: "Electrical Appliance Repair", si: "විදුලි උපකරණ අලුත්වැඩියා" },
  "cosmetics-production": { en: "Cosmetics Production", si: "සුරූපිතා (කොස්මෙටික්) නිෂ්පාදනය" },
  floriculture: { en: "Floriculture", si: "මල් වගාව" },
  "brick-making": { en: "Brick Making", si: "ගඩොල් නිෂ්පාදනය" },
  "seafood-processing": { en: "Seafood Processing", si: "මුහුදු ආහාර සැකසීම" },
  "traditional-boat-building": { en: "Traditional Boat Building", si: "සම්ප්‍රදායික බෝට්ටු නිෂ්පාදනය" },
  "fish-transport-other": { en: "Fish Transport / Other", si: "මාළු ප්‍රවාහනය/වෙනත්" },
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
  "friendly-society-or-burial-fund": { en: "Friendly Society / Burial Fund", si: "මිත්‍ර සමිතිය / අවමංගල්‍ය අරමුදල" },
  "govt-non-departmental-org": { en: "Government Non-Departmental Organization", si: "රාජ්‍ය අදෙපාර්තමේන්තු ආයතන" },
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
    if (!arr) continue;
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
    if (!arr) continue;
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
    if (!arr) continue;
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
    if (!arr) continue;
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
  const water = { pipedNational: 0, pipedRural: 0, protectedWell: 0, unprotectedWell: 0, tubeWell: 0, riverCanalTank: 0, bottledOther: 0 };
  let electricitySum = 0;
  let electricityCount = 0;

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
      water.pipedNational += h.drinkingWaterSource.pipedNational ?? 0;
      water.pipedRural += h.drinkingWaterSource.pipedRural ?? 0;
      water.protectedWell += h.drinkingWaterSource.protectedWell ?? 0;
      water.unprotectedWell += h.drinkingWaterSource.unprotectedWell ?? 0;
      water.tubeWell += h.drinkingWaterSource.tubeWell ?? 0;
      water.riverCanalTank += h.drinkingWaterSource.riverCanalTank ?? 0;
      water.bottledOther += h.drinkingWaterSource.bottledOther ?? 0;
    }
    if (typeof h.electricityAccessPercent === "number") {
      electricitySum += h.electricityAccessPercent;
      electricityCount++;
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
    avgElectricityAccessPercent: electricityCount > 0 ? Math.round((electricitySum / electricityCount) * 10) / 10 : null,
    underservedAreas,
    communityWaterProjects,
  };
}

/* ── Employment ───────────────────────────────────────────────────────────── */
export function aggregateEmployment(rows: SubmissionLike[], gnLabel: (id: string) => string) {
  const jobSeekersByEducation = sumIndexedCounts(rows, "employment", "jobSeekersByEducation", JOB_SEEKER_EDUCATION_LABELS);
  const sectorLabels = SELF_EMPLOYMENT_SECTORS.map((s) => SELF_EMPLOYMENT_SECTOR_LABELS[s]);
  const selfEmploymentSectors = sumIndexedCounts(rows, "employment", "selfEmploymentSectors", sectorLabels);
  let jobSeekersUnwilling = 0;
  for (const row of rows) {
    const e = sectionData(row, "employment");
    jobSeekersUnwilling += e?.jobSeekersUnwillingBelowQualificationCount ?? 0;
  }
  const selfEmployedPersons = capRows(flattenRows(rows, gnLabel, "employment", "selfEmployedPersons"));

  return {
    coverage: coverage(rows, "employment"),
    jobSeekersByEducation,
    totalJobSeekers: jobSeekersByEducation.reduce((s, r) => s + r.count, 0),
    jobSeekersUnwillingBelowQualificationCount: jobSeekersUnwilling,
    selfEmploymentSectors: selfEmploymentSectors.sort((a, b) => b.count - a.count),
    selfEmployedPersons,
  };
}

/* ── Education ────────────────────────────────────────────────────────────── */
export function aggregateEducation(rows: SubmissionLike[], gnLabel: (id: string) => string) {
  const institutionCounts = {
    govtSchools: 0, privateOrInternationalSchools: 0, pirivenas: 0,
    vocationalTrainingInstitutes: 0, registeredPreschoolsGovt: 0, registeredPreschoolsPrivate: 0,
  };
  const schoolCountsByType = { nationalSchools: 0, type1AB: 0, type1C: 0, type2: 0, type3: 0 };
  const dhamma = {
    buddhist: { schools: 0, students: 0 }, islam: { schools: 0, students: 0 },
    hindu: { schools: 0, students: 0 }, christian: { schools: 0, students: 0 },
  };
  let outOfSchoolChildren = 0;
  let marriedMinors = 0;
  let teacherTotal = 0, studentFemaleTotal = 0, studentMaleTotal = 0;

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
    }
    if (e.schoolCountsByType) {
      schoolCountsByType.nationalSchools += e.schoolCountsByType.nationalSchools ?? 0;
      schoolCountsByType.type1AB += e.schoolCountsByType.type1AB ?? 0;
      schoolCountsByType.type1C += e.schoolCountsByType.type1C ?? 0;
      schoolCountsByType.type2 += e.schoolCountsByType.type2 ?? 0;
      schoolCountsByType.type3 += e.schoolCountsByType.type3 ?? 0;
    }
    if (e.dhammaEducation) {
      for (const rel of ["buddhist", "islam", "hindu", "christian"] as const) {
        dhamma[rel].schools += e.dhammaEducation[rel]?.schools ?? 0;
        dhamma[rel].students += e.dhammaEducation[rel]?.students ?? 0;
      }
    }
    outOfSchoolChildren += e.outOfSchoolChildrenCount ?? 0;
    marriedMinors += e.marriedOrCohabitingMinorsCount ?? 0;
    for (const sf of e.schoolFacilities ?? []) {
      teacherTotal += sf.teacherCount ?? 0;
      studentFemaleTotal += sf.studentsFemale ?? 0;
      studentMaleTotal += sf.studentsMale ?? 0;
    }
  }

  return {
    coverage: coverage(rows, "education"),
    institutionCounts,
    schoolCountsByType,
    dhammaEducation: dhamma,
    outOfSchoolChildrenCount: outOfSchoolChildren,
    marriedOrCohabitingMinorsCount: marriedMinors,
    schoolStaffAndStudents: { teachers: teacherTotal, studentsFemale: studentFemaleTotal, studentsMale: studentMaleTotal },
    schoolFacilities: capRows(flattenRows(rows, gnLabel, "education", "schoolFacilities")),
    specialAttentionSchools: capRows(flattenRows(rows, gnLabel, "education", "specialAttentionSchools")),
    privateInternationalSchools: capRows(flattenRows(rows, gnLabel, "education", "privateInternationalSchools")),
    pirivenas: capRows(flattenRows(rows, gnLabel, "education", "pirivenas")),
    vocationalInstitutes: capRows(flattenRows(rows, gnLabel, "education", "vocationalInstitutes")),
    preschools: capRows(flattenRows(rows, gnLabel, "education", "preschools")),
    tertiaryInstitutions: capRows(flattenRows(rows, gnLabel, "education", "tertiaryInstitutions")),
    tuitionCenters: capRows(flattenRows(rows, gnLabel, "education", "tuitionCenters")),
  };
}

/* ── Health ───────────────────────────────────────────────────────────────── */
export function aggregateHealth(rows: SubmissionLike[], gnLabel: (id: string) => string) {
  const institutionCounts = {
    govtHospitals: 0, primaryHealthcareUnits: 0, privateHospitals: 0, ayurvedicHospitals: 0,
    specialistServiceCenters: 0, mohOfficesOrCommunityHealthCenters: 0, privateMedicalLabs: 0,
    otherLabs: 0, govtPharmacies: 0, privatePharmacies: 0,
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
    privateHospitalsDirectory: capRows(flattenRows(rows, gnLabel, "health", "privateHospitalsDirectory")),
    ayurvedicInstitutions: capRows(flattenRows(rows, gnLabel, "health", "ayurvedicInstitutions")),
    traditionalPractitioners: capRows(flattenRows(rows, gnLabel, "health", "traditionalPractitioners")),
  };
}

/* ── Agriculture & Economy (economicAgriculture) ─────────────────────────── */
export function aggregateEconomicAgriculture(rows: SubmissionLike[], gnLabel: (id: string) => string) {
  const landUseMap = new Map<string, number>();
  const animalHusbandryCounts = { cattleFarming: 0, beekeeping: 0 };
  const abandonedPaddyLand = { extentHectares: 0, canBeReactivatedExtent: 0 };
  const marineFisheries = { householdCount: 0, activeFishermenCount: 0, societyCount: 0 };
  const inlandFisheries = { householdCount: 0, activeFishermenCount: 0, societyCount: 0 };
  let saltProductionYes = 0;

  for (const row of rows) {
    const a = sectionData(row, "economicAgriculture");
    if (!a) continue;
    for (const lu of a.landUse ?? []) {
      const type = (lu.landType ?? "").trim();
      if (!type) continue;
      landUseMap.set(type, (landUseMap.get(type) ?? 0) + (lu.extentHectares ?? 0));
    }
    if (a.animalHusbandryCounts) {
      animalHusbandryCounts.cattleFarming += a.animalHusbandryCounts.cattleFarming ?? 0;
      animalHusbandryCounts.beekeeping += a.animalHusbandryCounts.beekeeping ?? 0;
    }
    if (a.abandonedPaddyLand) {
      abandonedPaddyLand.extentHectares += a.abandonedPaddyLand.extentHectares ?? 0;
      abandonedPaddyLand.canBeReactivatedExtent += a.abandonedPaddyLand.canBeReactivatedExtent ?? 0;
    }
    if (a.marineFisheries) {
      marineFisheries.householdCount += a.marineFisheries.householdCount ?? 0;
      marineFisheries.activeFishermenCount += a.marineFisheries.activeFishermenCount ?? 0;
      marineFisheries.societyCount += a.marineFisheries.societyCount ?? 0;
    }
    if (a.inlandFisheries) {
      inlandFisheries.householdCount += a.inlandFisheries.householdCount ?? 0;
      inlandFisheries.activeFishermenCount += a.inlandFisheries.activeFishermenCount ?? 0;
      inlandFisheries.societyCount += a.inlandFisheries.societyCount ?? 0;
    }
    if (a.saltProductionPresent === "yes") saltProductionYes++;
  }

  const landUse = [...landUseMap.entries()].map(([landType, extentHectares]) => ({ landType, extentHectares })).sort((a, b) => b.extentHectares - a.extentHectares);

  return {
    coverage: coverage(rows, "economicAgriculture"),
    landUse,
    animalHusbandryCounts,
    abandonedPaddyLand,
    marineFisheries,
    inlandFisheries,
    saltProductionDivisionsCount: saltProductionYes,
    agriMachinery: sumFreeformCounts(rows, "economicAgriculture", "agriMachinery"),
    forestDamage: sumFreeformPresence(rows, "economicAgriculture", "forestDamage"),
    animalHusbandryDirectory: capRows(flattenRows(rows, gnLabel, "economicAgriculture", "animalHusbandryDirectory")),
    specialEconomicActivities: capRows(flattenRows(rows, gnLabel, "economicAgriculture", "specialEconomicActivities")),
    livestockFarms: capRows(flattenRows(rows, gnLabel, "economicAgriculture", "livestockFarms")),
    industries: capRows(flattenRows(rows, gnLabel, "economicAgriculture", "industries")),
    fishLandingSites: capRows(flattenRows(rows, gnLabel, "economicAgriculture", "fishLandingSites")),
    saltProductionDirectory: capRows(flattenRows(rows, gnLabel, "economicAgriculture", "saltProductionDirectory")),
    teaEstates: capRows(flattenRows(rows, gnLabel, "economicAgriculture", "teaEstates")),
  };
}

/* ── Community Organizations + Social Welfare ─────────────────────────────── */
export function aggregateCommunityWelfare(rows: SubmissionLike[], gnLabel: (id: string) => string) {
  const orgLabels = ORGANIZATION_TYPES.map((t) => ORGANIZATION_TYPE_LABELS[t]);
  const organizationCounts = sumIndexedCounts(rows, "communityOrganizations", "organizationCounts", orgLabels);

  const welfarePaymentHouseholdCounts = { rs2500: 0, rs5000: 0, rs8500: 0, rs15000: 0, noBenefit: 0 };
  const allowanceRecipientCounts = { disabilityAllowance: 0, elderlyAllowance: 0, nutritionAllowance: 0, publicAssistance: 0, sickAllowance: 0, other: 0 };

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
    for (const road of r.roadDevelopmentNeeds ?? []) totalRoadLength += road.lengthMeters ?? 0;
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
    electricitySubstations: capRows(flattenRows(rows, gnLabel, "roadInfrastructure", "electricitySubstations")),
    fuelDistributionStations: capRows(flattenRows(rows, gnLabel, "roadInfrastructure", "fuelDistributionStations")),
    hydropowerPlants: capRows(flattenRows(rows, gnLabel, "roadInfrastructure", "hydropowerPlants")),
    financialInstitutions: capRows(flattenRows(rows, gnLabel, "roadInfrastructure", "financialInstitutions")),
    industrialEstates: capRows(flattenRows(rows, gnLabel, "roadInfrastructure", "industrialEstates")),
    waterReservoirs: capRows(flattenRows(rows, gnLabel, "roadInfrastructure", "waterReservoirs")),
    notableClubsAndBars: capRows(flattenRows(rows, gnLabel, "roadInfrastructure", "notableClubsAndBars")),
  };
}

/* ── Area Profile: physicalEnvironment + religiousCultural + tourism + wasteDisaster + identification ── */
export function aggregateAreaProfile(rows: SubmissionLike[], gnLabel: (id: string) => string) {
  const religiousSiteCounts = {
    temples: { count: 0, clergyCount: 0 }, kovils: { count: 0, clergyCount: 0 },
    mosques: { count: 0, clergyCount: 0 }, churches: { count: 0, clergyCount: 0 },
  };
  let hasWasteProgramYes = 0, hasCompostSiteYes = 0;

  for (const row of rows) {
    const rc = sectionData(row, "religiousCultural");
    if (rc?.religiousSiteCounts) {
      for (const k of ["temples", "kovils", "mosques", "churches"] as const) {
        religiousSiteCounts[k].count += rc.religiousSiteCounts[k]?.count ?? 0;
        religiousSiteCounts[k].clergyCount += rc.religiousSiteCounts[k]?.clergyCount ?? 0;
      }
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
    // identification — list-only
    stateInstitutions: capRows(flattenRows(rows, gnLabel, "identification", "stateInstitutions")),
    illegalStructures: capRows(flattenRows(rows, gnLabel, "identification", "illegalStructures")),
    developmentProjects: capRows(flattenRows(rows, gnLabel, "identification", "developmentProjects")),
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
