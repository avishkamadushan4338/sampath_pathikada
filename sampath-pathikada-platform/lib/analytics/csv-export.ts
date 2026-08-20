import { aggregateDemographics } from "@/lib/analytics/aggregate-demographics";
import {
  aggregateHousing, aggregateEmployment, aggregateEducation, aggregateHealth,
  aggregateEconomicAgriculture, aggregateCommunityWelfare, aggregateInfrastructure, aggregateAreaProfile,
} from "@/lib/analytics/aggregate-sections";
import type { SectionKey } from "@/lib/types/submission";

interface SubmissionRow {
  gnDivision: string;
  dsDivision: string;
  district: string;
  status: string;
  createdAt: Date;
  reviewedAt: Date | null;
  data: unknown;
  submittedBy: { name: string; email: string };
}

export type CsvValue = string | number;
export type CsvRow = Record<string, CsvValue>;

/** One flat row per GN division submission, every section's key numbers as its own column.
 *  Directory/list sections contribute a count column only — full row-level detail belongs
 *  in the Excel export's dedicated directory sheets, not this wide flat view. */
export function buildCsvRows(
  rows: SubmissionRow[],
  gnLabel: (id: string) => string,
  dsLabel: (id: string) => string
): CsvRow[] {
  // CSV is an English-only document; both languages resolve to the same label so the shared
  // aggregate functions (which now tag rows bilingually for the UI) still work here unchanged.
  const gnLabelBoth = (id: string) => ({ en: gnLabel(id), si: gnLabel(id) });
  return rows.map((r) => {
    const single = [r];
    const demo = aggregateDemographics(single);
    const housing = aggregateHousing(single, gnLabelBoth);
    const employment = aggregateEmployment(single, gnLabelBoth);
    const education = aggregateEducation(single, gnLabelBoth);
    const health = aggregateHealth(single, gnLabelBoth);
    const agri = aggregateEconomicAgriculture(single, gnLabelBoth);
    const communityWelfare = aggregateCommunityWelfare(single, gnLabelBoth);
    const infra = aggregateInfrastructure(single, gnLabelBoth);
    const areaProfile = aggregateAreaProfile(single, gnLabelBoth);

    const row: CsvRow = {
      "GN Division": gnLabel(r.gnDivision),
      "DS Division": dsLabel(r.dsDivision),
      "District": r.district,
      "Officer": r.submittedBy.name,
      "Officer Email": r.submittedBy.email,
      "Status": r.status,
      "Submitted": r.createdAt.toISOString().split("T")[0],
      "Decided": r.reviewedAt ? r.reviewedAt.toISOString().split("T")[0] : "",

      // ── Demographics ──
      "Demographics: Total Population": demo.totalPopulation,
      "Demographics: Female Population": demo.female,
      "Demographics: Male Population": demo.male,
      "Demographics: Female %": demo.femalePercentage ?? "",
      "Demographics: Households": demo.households.total,
      "Demographics: Female-Headed Households": demo.households.femaleHeaded,
      "Demographics: Displaced Households": demo.households.displaced,
      "Demographics: Registered Voters": demo.registeredVoters.total,
      "Demographics: Foreign Nationals": demo.foreignNationals.total,
      "Demographics: Persons with Disabilities": demo.disabilitiesTotal,

      // ── Housing ──
      "Housing: Total Units": housing.housingCounts.total,
      "Housing: Permanent": housing.housingCounts.permanent,
      "Housing: Semi-Permanent": housing.housingCounts.semiPermanent,
      "Housing: Non-Permanent": housing.housingCounts.nonPermanent,
      "Housing: Without Proper Housing": housing.householdsWithoutHousing,
      "Housing: Without Safe Sanitation": housing.sanitation.withoutSafeSanitation,
      "Housing: With Electricity": housing.electricityAccess.withElectricity,
      "Housing: Without Electricity": housing.electricityAccess.withoutElectricity,
      "Housing: Underserved Areas Listed": housing.underservedAreas.rows.length,
      "Housing: Community Water Projects Listed": housing.communityWaterProjects.rows.length,

      // ── Employment ──
      "Employment: Total Job Seekers": employment.totalJobSeekers,
      "Employment: Vocational Training Opportunity Gap": employment.vocationalTrainingOpportunityGapCount,
      "Employment: Active Self-Employment Sectors": employment.selfEmploymentSectors.filter((s) => s.count > 0).length,
      "Employment: Self-Employed Persons Listed": employment.selfEmployedPersons.rows.length,

      // ── Education ──
      "Education: Govt Schools": education.institutionCounts.govtSchools,
      "Education: Private/International Schools": education.institutionCounts.privateOrInternationalSchools,
      "Education: Pirivenas": education.institutionCounts.pirivenas,
      "Education: Vocational Institutes": education.institutionCounts.vocationalTrainingInstitutes,
      "Education: Preschools (Govt)": education.institutionCounts.registeredPreschoolsGovt,
      "Education: Preschools (Private)": education.institutionCounts.registeredPreschoolsPrivate,
      "Education: Female Teachers": education.schoolStaffAndStudents.teachersFemale,
      "Education: Male Teachers": education.schoolStaffAndStudents.teachersMale,
      "Education: Female Students": education.schoolStaffAndStudents.studentsFemale,
      "Education: Male Students": education.schoolStaffAndStudents.studentsMale,
      "Education: Out-of-School Children": education.outOfSchoolChildren.total,
      "Education: Children in Probation/Detention": education.childrenInProbationOrDetention.total,
      "Education: Schools Requiring Attention": education.specialAttentionSchools.rows.length,
      "Education: Schools Closed (Last 5 Years)": education.closedSchools.rows.length,

      // ── Health ──
      "Health: Govt Hospitals": health.institutionCounts.govtHospitals,
      "Health: Private Hospitals": health.institutionCounts.privateHospitals,
      "Health: Ayurvedic Hospitals": health.institutionCounts.ayurvedicHospitals,
      "Health: Primary Healthcare Units": health.institutionCounts.primaryHealthcareUnits,
      "Health: Specialist Service Centers": health.institutionCounts.specialistServiceCenters,
      "Health: Govt Pharmacies": health.institutionCounts.govtPharmacies,
      "Health: Private Pharmacies": health.institutionCounts.privatePharmacies,
      "Health: Traditional Practitioners Listed": health.traditionalPractitioners.rows.length,

      // ── Agriculture & Economy ──
      "Agriculture: Land Use Categories": agri.landUse.length,
      "Agriculture: Total Land Extent (ha)": Math.round(agri.landUse.reduce((s, l) => s + l.extentHectares, 0) * 100) / 100,
      "Agriculture: Beekeeping": agri.animalHusbandryCounts.find((c) => c.en === "Beekeeping")?.count ?? 0,
      "Agriculture: Abandoned Paddy Land (acres)": agri.abandonedPaddyLand.extentAcres,
      "Agriculture: Marine Fishing Households": agri.marineFisheries.householdCount,
      "Agriculture: Inland Fishing Households": agri.inlandFisheries.householdCount,
      "Agriculture: Ice Production Present": agri.iceProductionDivisionsCount > 0 ? "Yes" : "No",
      "Agriculture: Industries Listed": agri.industries.rows.length,
      "Agriculture: Livestock Farms Listed": agri.livestockFarms.rows.length,
      "Agriculture: Tea Estates Listed": agri.teaEstates.rows.length,

      // ── Community Organizations & Social Welfare ──
      "Community: Total Organizations": communityWelfare.organizationCounts.reduce((s, o) => s + o.count, 0),
      "Community: Organizations Listed":
        communityWelfare.villageDevelopmentSocieties.rows.length +
        communityWelfare.youthSocieties.rows.length +
        communityWelfare.sportsClubs.rows.length +
        communityWelfare.funeralAidSocieties.rows.length +
        communityWelfare.womensSocieties.rows.length +
        communityWelfare.eldersSocieties.rows.length +
        communityWelfare.childrensSocieties.rows.length +
        communityWelfare.samurdhiSocieties.rows.length +
        communityWelfare.friendOrganizations.rows.length +
        communityWelfare.ngoCommittees.rows.length +
        communityWelfare.farmerSocieties.rows.length +
        communityWelfare.religiousSocieties.rows.length +
        communityWelfare.sanasaSocieties.rows.length +
        communityWelfare.civilDefenseCommittees.rows.length +
        communityWelfare.prajashakthiSocieties.rows.length,
      "Welfare: Households Receiving Payments": communityWelfare.welfarePaymentHouseholdCounts.rs2500 + communityWelfare.welfarePaymentHouseholdCounts.rs5000 + communityWelfare.welfarePaymentHouseholdCounts.rs8500 + communityWelfare.welfarePaymentHouseholdCounts.rs15000,
      "Welfare: Disability Allowance Recipients": communityWelfare.allowanceRecipientCounts.disabilityAllowance,
      "Welfare: Elderly Allowance Recipients": communityWelfare.allowanceRecipientCounts.elderlyAllowance,
      "Welfare: Elders' Homes Listed": communityWelfare.eldersHomes.rows.length,
      "Welfare: Children's Homes Listed": communityWelfare.childrensHomes.rows.length,

      // ── Infrastructure ──
      "Infrastructure: Has Bus Stand": infra.publicFacilities.busStand > 0 ? "Yes" : "No",
      "Infrastructure: Has Railway Station": infra.publicFacilities.railwayStation > 0 ? "Yes" : "No",
      "Infrastructure: Has Port": infra.publicFacilities.port > 0 ? "Yes" : "No",
      "Infrastructure: Has Airport": infra.publicFacilities.airport > 0 ? "Yes" : "No",
      "Infrastructure: Road Development Needs Listed": infra.roadDevelopmentNeeds.rows.length,
      "Infrastructure: Total Road Length Flagged (m)": infra.totalRoadDevelopmentLengthMeters,
      "Infrastructure: Bridges Requiring Repair": infra.bridgeRepairs.rows.length,
      "Infrastructure: Financial Institutions Listed": infra.financialInstitutions.rows.length,
      "Infrastructure: Industrial Estates Listed": infra.industrialEstates.rows.length,
      "Infrastructure: Hydropower Plants Listed": infra.hydropowerPlants.rows.length,

      // ── Physical Environment ──
      "Physical Env: Water Sources Listed": areaProfile.waterSources.rows.length,
      "Physical Env: Hazard Records": areaProfile.hazards.rows.length,
      "Physical Env: Sensitive Zones Listed": areaProfile.sensitiveZones.rows.length,
      "Physical Env: Safe Locations Listed": areaProfile.safeLocations.rows.length,

      // ── Religious & Cultural ──
      "Religious: Temples": areaProfile.religiousSiteCounts.temples.count,
      "Religious: Nun Hermitages": areaProfile.religiousSiteCounts.meheniArama.count,
      "Religious: Kovils": areaProfile.religiousSiteCounts.kovils.count,
      "Religious: Mosques": areaProfile.religiousSiteCounts.mosques.count,
      "Religious: Catholic Churches": areaProfile.religiousSiteCounts.churches.count,
      "Religious: Heritage Sites Listed": areaProfile.heritageSites.rows.length,
      "Religious: Traditional Artists Listed": areaProfile.traditionalArtists.rows.length,

      // ── Tourism ──
      "Tourism: Hotels Listed": areaProfile.hotelInventory.rows.reduce((s: number, x: any) => s + (x.hotelCount ?? 0), 0),
      "Tourism: Hotel Rooms": areaProfile.hotelInventory.rows.reduce((s: number, x: any) => s + (x.roomCount ?? 0), 0),
      "Tourism: Guest Accommodations Listed": areaProfile.guestAccommodations.rows.length,
      "Tourism: Other Accommodations Listed": areaProfile.otherAccommodations.rows.length,

      // ── Waste Management ──
      "Waste: Has Collection Program": areaProfile.wasteManagement.divisionsWithProgram > 0 ? "Yes" : "No",
      "Waste: Has Compost/Disposal Site": areaProfile.wasteManagement.divisionsWithCompostSite > 0 ? "Yes" : "No",

      // ── State Institutions & Land ──
      "State Institutions & Land: State Institutions Listed": areaProfile.stateInstitutions.rows.length,
      "State Institutions & Land: Development Projects Listed": areaProfile.developmentProjects.rows.length,
      "State Institutions & Land: Illegal Structures Flagged": areaProfile.illegalStructures.rows.length,
    };

    return row;
  });
}

/** Maps each of the 15 form sections to the column-name prefix(es) `buildCsvRows` gives its
 *  columns above — used to filter the wide per-division row down to just one section's data
 *  for the section-level CSV download. `identification` has no entry: unlike the other 14, it
 *  isn't submission data at all (it's the registered-officer directory, sourced from
 *  /api/registrations — see app/api/export/csv/section/route.ts and
 *  components/analytics/IdentificationDirectoryView.tsx), so it can't be produced by filtering
 *  this function's output and is handled as its own code path instead.
 *  `communityOrganizations` and `socialWelfare` share one underlying aggregate
 *  (CommunityWelfareAggregate) but keep their own column prefixes ("Community"/"Welfare") in
 *  buildCsvRows, so each maps to just its own prefix here, not both. */
export const SECTION_CSV_PREFIXES: Partial<Record<SectionKey, string[]>> = {
  demographics: ["Demographics"],
  housing: ["Housing"],
  employment: ["Employment"],
  education: ["Education"],
  health: ["Health"],
  economicAgriculture: ["Agriculture"],
  communityOrganizations: ["Community"],
  socialWelfare: ["Welfare"],
  roadInfrastructure: ["Infrastructure"],
  physicalEnvironment: ["Physical Env"],
  religiousCultural: ["Religious"],
  tourism: ["Tourism"],
  wasteDisaster: ["Waste"],
  stateInstitutionsLand: ["State Institutions & Land"],
};

/** Filters buildCsvRows' wide per-division output down to the "GN Division"/"DS Division"/
 *  "District" identity columns plus just one section's own columns — same source data and
 *  aggregation as the full export, just a narrower set of columns. Returns an empty array (not
 *  an error) for `identification`, since that section has no columns in buildCsvRows at all;
 *  callers must route identification through its own export path instead of this function. */
export function filterCsvRowsToSection(rows: CsvRow[], section: SectionKey): CsvRow[] {
  const prefixes = SECTION_CSV_PREFIXES[section];
  if (!prefixes) return [];

  const identityKeys = ["GN Division", "DS Division", "District", "Officer", "Officer Email", "Status", "Submitted", "Decided"];
  return rows.map((row) => {
    const filtered: CsvRow = {};
    for (const key of identityKeys) {
      if (key in row) filtered[key] = row[key];
    }
    for (const [key, value] of Object.entries(row)) {
      if (prefixes.some((p) => key.startsWith(`${p}: `))) filtered[key] = value;
    }
    return filtered;
  });
}

function escapeCsvCell(value: CsvValue): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Minimal RFC 4180 CSV serializer — quotes/escapes any field containing a comma, quote, or newline. */
export function toCsvText(rows: CsvRow[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);

  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => headers.map((h) => escapeCsvCell(row[h] ?? "")).join(",")),
  ];
  return lines.join("\r\n");
}

export interface CsvBlock {
  heading: string;
  rows: CsvRow[];
}

/** Serializes several independently-shaped tables into one CSV, each preceded by a blank line
 *  and a heading marker row — used where a single flat table can't represent the data (e.g. one
 *  profile's 15 sections, each with its own arbitrary set of columns). An empty block still emits
 *  its heading with a "No data recorded" placeholder row, so every expected section is visibly
 *  present in the file even when the officer left it blank. */
export function toCsvTextMultiBlock(blocks: CsvBlock[]): string {
  const parts: string[] = [];
  for (const block of blocks) {
    parts.push(`"${block.heading.replace(/"/g, '""')}"`);
    parts.push(block.rows.length > 0 ? toCsvText(block.rows) : `"No data recorded"`);
  }
  return parts.join("\r\n\r\n");
}
