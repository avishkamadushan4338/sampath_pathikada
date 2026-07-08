import { aggregateDemographics } from "@/lib/analytics/aggregate-demographics";
import {
  aggregateHousing, aggregateEmployment, aggregateEducation, aggregateHealth,
  aggregateEconomicAgriculture, aggregateCommunityWelfare, aggregateInfrastructure, aggregateAreaProfile,
} from "@/lib/analytics/aggregate-sections";

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

type CsvValue = string | number;
type CsvRow = Record<string, CsvValue>;

/** One flat row per GN division submission, every section's key numbers as its own column.
 *  Directory/list sections contribute a count column only — full row-level detail belongs
 *  in the Excel export's dedicated directory sheets, not this wide flat view. */
export function buildCsvRows(
  rows: SubmissionRow[],
  gnLabel: (id: string) => string,
  dsLabel: (id: string) => string
): CsvRow[] {
  return rows.map((r) => {
    const single = [r];
    const demo = aggregateDemographics(single);
    const housing = aggregateHousing(single, gnLabel);
    const employment = aggregateEmployment(single, gnLabel);
    const education = aggregateEducation(single, gnLabel);
    const health = aggregateHealth(single, gnLabel);
    const agri = aggregateEconomicAgriculture(single, gnLabel);
    const communityWelfare = aggregateCommunityWelfare(single, gnLabel);
    const infra = aggregateInfrastructure(single, gnLabel);
    const areaProfile = aggregateAreaProfile(single, gnLabel);

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
      "Housing: Electricity Access %": housing.avgElectricityAccessPercent ?? "",
      "Housing: Underserved Areas Listed": housing.underservedAreas.rows.length,
      "Housing: Community Water Projects Listed": housing.communityWaterProjects.rows.length,

      // ── Employment ──
      "Employment: Total Job Seekers": employment.totalJobSeekers,
      "Employment: Unwilling Below Qualification": employment.jobSeekersUnwillingBelowQualificationCount,
      "Employment: Active Self-Employment Sectors": employment.selfEmploymentSectors.filter((s) => s.count > 0).length,
      "Employment: Self-Employed Persons Listed": employment.selfEmployedPersons.rows.length,

      // ── Education ──
      "Education: Govt Schools": education.institutionCounts.govtSchools,
      "Education: Private/International Schools": education.institutionCounts.privateOrInternationalSchools,
      "Education: Pirivenas": education.institutionCounts.pirivenas,
      "Education: Vocational Institutes": education.institutionCounts.vocationalTrainingInstitutes,
      "Education: Preschools (Govt)": education.institutionCounts.registeredPreschoolsGovt,
      "Education: Preschools (Private)": education.institutionCounts.registeredPreschoolsPrivate,
      "Education: Teachers": education.schoolStaffAndStudents.teachers,
      "Education: Female Students": education.schoolStaffAndStudents.studentsFemale,
      "Education: Male Students": education.schoolStaffAndStudents.studentsMale,
      "Education: Out-of-School Children": education.outOfSchoolChildrenCount,
      "Education: Married/Cohabiting Minors": education.marriedOrCohabitingMinorsCount,
      "Education: Schools Requiring Attention": education.specialAttentionSchools.rows.length,

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
      "Agriculture: Cattle Farming": agri.animalHusbandryCounts.cattleFarming,
      "Agriculture: Beekeeping": agri.animalHusbandryCounts.beekeeping,
      "Agriculture: Abandoned Paddy Land (ha)": agri.abandonedPaddyLand.extentHectares,
      "Agriculture: Marine Fishing Households": agri.marineFisheries.householdCount,
      "Agriculture: Inland Fishing Households": agri.inlandFisheries.householdCount,
      "Agriculture: Salt Production Present": agri.saltProductionDivisionsCount > 0 ? "Yes" : "No",
      "Agriculture: Industries Listed": agri.industries.rows.length,
      "Agriculture: Livestock Farms Listed": agri.livestockFarms.rows.length,
      "Agriculture: Tea Estates Listed": agri.teaEstates.rows.length,

      // ── Community Organizations & Social Welfare ──
      "Community: Total Organizations": communityWelfare.organizationCounts.reduce((s, o) => s + o.count, 0),
      "Community: Organizations Listed": communityWelfare.organizationDirectory.rows.length,
      "Welfare: Households Receiving Payments": communityWelfare.welfarePaymentHouseholdCounts.rs2500 + communityWelfare.welfarePaymentHouseholdCounts.rs5000 + communityWelfare.welfarePaymentHouseholdCounts.rs8500 + communityWelfare.welfarePaymentHouseholdCounts.rs15000,
      "Welfare: Disability Allowance Recipients": communityWelfare.allowanceRecipientCounts.disabilityAllowance,
      "Welfare: Elderly Allowance Recipients": communityWelfare.allowanceRecipientCounts.elderlyAllowance,
      "Welfare: Elders' Homes Listed": communityWelfare.eldersHomes.rows.length,
      "Welfare: Children's Homes Listed": communityWelfare.childrensHomes.rows.length,

      // ── Infrastructure ──
      "Infrastructure: Has Bus Stand": infra.publicFacilities.busStand > 0 ? "Yes" : "No",
      "Infrastructure: Has Railway Station": infra.publicFacilities.railwayStation > 0 ? "Yes" : "No",
      "Infrastructure: Has Jetty": infra.publicFacilities.jetty > 0 ? "Yes" : "No",
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
      "Religious: Kovils": areaProfile.religiousSiteCounts.kovils.count,
      "Religious: Mosques": areaProfile.religiousSiteCounts.mosques.count,
      "Religious: Churches": areaProfile.religiousSiteCounts.churches.count,
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

      // ── Identification ──
      "Identification: State Institutions Listed": areaProfile.stateInstitutions.rows.length,
      "Identification: Development Projects Listed": areaProfile.developmentProjects.rows.length,
      "Identification: Illegal Structures Flagged": areaProfile.illegalStructures.rows.length,
    };

    return row;
  });
}

/** Minimal RFC 4180 CSV serializer — quotes/escapes any field containing a comma, quote, or newline. */
export function toCsvText(rows: CsvRow[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);

  function escapeCell(value: CsvValue): string {
    const s = String(value);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  const lines = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => headers.map((h) => escapeCell(row[h] ?? "")).join(",")),
  ];
  return lines.join("\r\n");
}
