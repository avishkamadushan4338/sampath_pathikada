import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { DIVISIONAL_SECRETARIATS, GN_DIVISIONS } from "@/lib/registration-data";
import { CURRENT_YEAR } from "@/lib/constants";
import { aggregateDemographics } from "@/lib/analytics/aggregate-demographics";
import {
  aggregateHousing, aggregateEmployment, aggregateEducation, aggregateHealth,
  aggregateEconomicAgriculture, aggregateCommunityWelfare, aggregateInfrastructure, aggregateAreaProfile,
} from "@/lib/analytics/aggregate-sections";

const ALLOWED_ROLES = ["ADMIN", "SUPER_ADMIN"];

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam) : CURRENT_YEAR;

  let dsDivisionFilter: string | null = null;
  let districtFilter: string | null = null;
  if (session.role === "ADMIN") {
    if (!session.dsDivision) {
      return NextResponse.json({ ok: false, message: "No division assigned to this account." }, { status: 403 });
    }
    dsDivisionFilter = session.dsDivision;
  } else {
    dsDivisionFilter = searchParams.get("dsDivision");
    districtFilter = searchParams.get("district");
  }

  const gnDivisionsParam = searchParams.get("gnDivisions");
  const gnDivisionFilter = gnDivisionsParam
    ? gnDivisionsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : null;

  const where: Record<string, unknown> = { year };
  if (dsDivisionFilter) where.dsDivision = dsDivisionFilter;
  else if (districtFilter) where.district = districtFilter;
  if (gnDivisionFilter && gnDivisionFilter.length > 0) where.gnDivision = { in: gnDivisionFilter };

  const rows = await prisma.submission.findMany({
    where,
    orderBy: { gnDivision: "asc" },
    select: {
      gnDivision: true, dsDivision: true, district: true, status: true,
      createdAt: true, reviewedAt: true, data: true,
      submittedBy: { select: { name: true, email: true } },
    },
  });

  const gnLabel = (id: string) => GN_DIVISIONS.find((g) => g.id === id)?.en ?? id;
  const dsLabel = (id: string) => DIVISIONAL_SECRETARIATS.find((d) => d.id === id)?.en ?? id;

  const summarySheet = rows.map((r) => {
    const demo = aggregateDemographics([r]);
    return {
      "GN Division": gnLabel(r.gnDivision),
      "DS Division": dsLabel(r.dsDivision),
      "District": r.district,
      "Officer": r.submittedBy.name,
      "Officer Email": r.submittedBy.email,
      "Status": r.status,
      "Total Population": demo.totalPopulation,
      "Female Population": demo.female,
      "Male Population": demo.male,
      "Female %": demo.femalePercentage ?? "",
      "Households": demo.households.total,
      "Female-Headed Households": demo.households.femaleHeaded,
      "Displaced Households": demo.households.displaced,
      "Registered Voters (F)": demo.registeredVoters.female,
      "Registered Voters (M)": demo.registeredVoters.male,
      "Foreign Nationals (F)": demo.foreignNationals.female,
      "Foreign Nationals (M)": demo.foreignNationals.male,
      "Persons with Disabilities": demo.disabilitiesTotal,
      "Submitted": r.createdAt.toISOString().split("T")[0],
      "Decided": r.reviewedAt ? r.reviewedAt.toISOString().split("T")[0] : "",
    };
  });

  const aggregate = aggregateDemographics(rows);
  const ethnicitySheet = aggregate.populationByEthnicity.map((e) => ({
    "Ethnicity": e.en, "Female": e.female, "Male": e.male, "Total": e.total,
  }));
  const religionSheet = aggregate.populationByReligion.map((r) => ({
    "Religion": r.en, "Female": r.female, "Male": r.male, "Total": r.total,
  }));
  const ageSheet = aggregate.populationByAge.map((a) => ({
    "Age Band": a.en, "Female": a.female, "Male": a.male, "Total": a.total,
  }));
  const disabilitySheet = aggregate.disabilities.map((d) => ({
    "Disability Type": d.en, "Female": d.female, "Male": d.male, "Total": d.total,
  }));

  const workbook = XLSX.utils.book_new();

  const summaryWs = XLSX.utils.json_to_sheet(summarySheet);
  summaryWs["!cols"] = Array(18).fill({ wch: 18 });
  XLSX.utils.book_append_sheet(workbook, summaryWs, "GN Division Summary");

  const ageWs = XLSX.utils.json_to_sheet(ageSheet);
  ageWs["!cols"] = [{ wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(workbook, ageWs, "Population by Age");

  const ethnicityWs = XLSX.utils.json_to_sheet(ethnicitySheet);
  ethnicityWs["!cols"] = [{ wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(workbook, ethnicityWs, "Population by Ethnicity");

  const religionWs = XLSX.utils.json_to_sheet(religionSheet);
  religionWs["!cols"] = [{ wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(workbook, religionWs, "Population by Religion");

  const disabilityWs = XLSX.utils.json_to_sheet(disabilitySheet);
  disabilityWs["!cols"] = [{ wch: 24 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(workbook, disabilityWs, "Disabilities");

  /* ── Additional sections: one numeric-summary sheet + directory sheets per section ── */
  function addSheet(name: string, data: Record<string, unknown>[]) {
    if (data.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(data);
    // XLSX sheet names are capped at 31 chars and can't contain \ / ? * [ ]
    XLSX.utils.book_append_sheet(workbook, ws, name.replace(/[\\/?*[\]]/g, "").slice(0, 31));
  }

  const housing = aggregateHousing(rows, gnLabel);
  addSheet("Housing Summary", [{
    "Total Units": housing.housingCounts.total, "Permanent": housing.housingCounts.permanent,
    "Semi-Permanent": housing.housingCounts.semiPermanent, "Non-Permanent": housing.housingCounts.nonPermanent,
    "Without Proper Housing": housing.householdsWithoutHousing, "Avg Electricity Access %": housing.avgElectricityAccessPercent ?? "",
  }]);
  addSheet("Housing - Underserved Areas", housing.underservedAreas.rows.map((r) => ({ "GN Division": r.gnName, "Area": r.area, "Households": r.households, "Proposal": r.proposal ?? "" })));

  const employment = aggregateEmployment(rows, gnLabel);
  addSheet("Employment - By Education", employment.jobSeekersByEducation.map((r) => ({ "Education Level": r.en, "Count": r.count })));
  addSheet("Employment - Self-Employment", employment.selfEmploymentSectors.map((r) => ({ "Sector": r.en, "Count": r.count })));
  addSheet("Employment - Directory", employment.selfEmployedPersons.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Sector": r.sector, "Phone": r.phone ?? "", "Address": r.address })));

  const education = aggregateEducation(rows, gnLabel);
  addSheet("Education Summary", [{
    "Govt Schools": education.institutionCounts.govtSchools, "Private/Intl Schools": education.institutionCounts.privateOrInternationalSchools,
    "Pirivenas": education.institutionCounts.pirivenas, "Vocational Institutes": education.institutionCounts.vocationalTrainingInstitutes,
    "Out-of-School Children": education.outOfSchoolChildrenCount, "Married/Cohabiting Minors": education.marriedOrCohabitingMinorsCount,
    "Teachers": education.schoolStaffAndStudents.teachers, "Female Students": education.schoolStaffAndStudents.studentsFemale, "Male Students": education.schoolStaffAndStudents.studentsMale,
  }]);
  addSheet("Education - School Facilities", education.schoolFacilities.rows.map((r) => ({ "GN Division": r.gnName, "School": r.schoolName, "Teachers": r.teacherCount, "Female Students": r.studentsFemale, "Male Students": r.studentsMale })));

  const health = aggregateHealth(rows, gnLabel);
  addSheet("Health Summary", [{ ...health.institutionCounts }]);
  addSheet("Health - Govt Hospitals", health.govtHospitalsDirectory.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Type": r.type, "Address": r.address })));

  const agri = aggregateEconomicAgriculture(rows, gnLabel);
  addSheet("Agriculture - Land Use", agri.landUse.map((l) => ({ "Land Type": l.landType, "Extent (ha)": l.extentHectares })));
  addSheet("Agriculture - Industries", agri.industries.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Product": r.productType, "Size": r.size, "Employees": r.employeeCount })));

  addSheet("Housing - Water Projects", housing.communityWaterProjects.rows.map((r) => ({ "GN Division": r.gnName, "Project": r.name, "Status": r.status ?? "", "Households Served": r.householdsServed ?? "", "Authority": r.authority ?? "" })));

  addSheet("Education - Special Attention", education.specialAttentionSchools.rows.map((r) => ({ "GN Division": r.gnName, "School": r.schoolName, "Reason": r.reason })));
  addSheet("Education - Preschools", education.preschools.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Type": r.facilityType, "Teachers": r.teacherCount, "Students": r.studentCount })));

  addSheet("Health - Private Hospitals", health.privateHospitalsDirectory.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Address": r.address })));
  addSheet("Health - Ayurvedic Institutions", health.ayurvedicInstitutions.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Address": r.address })));
  addSheet("Health - Traditional Practitioners", health.traditionalPractitioners.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Specialty": r.specialty, "Address": r.address })));

  addSheet("Agriculture - Fisheries Summary", [{
    "Marine Households": agri.marineFisheries.householdCount, "Marine Active Fishermen": agri.marineFisheries.activeFishermenCount, "Marine Societies": agri.marineFisheries.societyCount,
    "Inland Households": agri.inlandFisheries.householdCount, "Inland Active Fishermen": agri.inlandFisheries.activeFishermenCount, "Inland Societies": agri.inlandFisheries.societyCount,
    "Salt Production Divisions": agri.saltProductionDivisionsCount,
  }]);
  addSheet("Agriculture - Livestock Farms", agri.livestockFarms.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Animal Type": r.animalType, "Count": r.count, "Address": r.address })));
  addSheet("Agriculture - Animal Husbandry Directory", agri.animalHusbandryDirectory.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Type": r.type, "Phone": r.phone ?? "", "Address": r.address })));
  addSheet("Agriculture - Tea Estates", agri.teaEstates.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Extent (ha)": r.extentHectares, "Ownership": r.ownership })));
  addSheet("Agriculture - Fish Landing Sites", agri.fishLandingSites.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Location": r.location })));
  addSheet("Agriculture - Salt Production", agri.saltProductionDirectory.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Location": r.location })));

  const communityWelfare = aggregateCommunityWelfare(rows, gnLabel);
  addSheet("Community Organizations", communityWelfare.organizationCounts.map((o) => ({ "Type": o.en, "Count": o.count })));
  addSheet("Community - Organization Directory", communityWelfare.organizationDirectory.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Type": r.type, "Address": r.address })));
  addSheet("Social Welfare Summary", [{ ...communityWelfare.welfarePaymentHouseholdCounts, ...communityWelfare.allowanceRecipientCounts }]);
  addSheet("Social Welfare - Elders' Homes", communityWelfare.eldersHomes.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Authority": r.authority, "Residents": r.residentCount, "Address": r.address })));
  addSheet("Social Welfare - Children's Homes", communityWelfare.childrensHomes.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Authority": r.authority, "Residents": r.residentCount, "Address": r.address })));

  const infrastructure = aggregateInfrastructure(rows, gnLabel);
  addSheet("Infrastructure - Public Facilities", [{ ...infrastructure.publicFacilities }]);
  addSheet("Infrastructure - Services", infrastructure.serviceEstablishments.map((s) => ({ "Category": s.en, "Count": s.count })));
  addSheet("Infrastructure - Facility Categories", infrastructure.publicFacilityCategories.map((c) => ({ "Category": c.en, "Divisions Present": c.presentCount })));
  addSheet("Infrastructure - Roads Needed", infrastructure.roadDevelopmentNeeds.rows.map((r) => ({ "GN Division": r.gnName, "Road": r.roadName, "Condition": r.currentCondition, "Length (m)": r.lengthMeters, "Priority": r.priorityRank })));
  addSheet("Infrastructure - Bridges Repair", infrastructure.bridgeRepairs.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Condition": r.condition })));
  addSheet("Infrastructure - Financial Institutions", infrastructure.financialInstitutions.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Type": r.type })));
  addSheet("Infrastructure - Industrial Estates", infrastructure.industrialEstates.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Location": r.location })));
  addSheet("Infrastructure - Water Reservoirs", infrastructure.waterReservoirs.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name })));
  addSheet("Infrastructure - Clubs and Bars", infrastructure.notableClubsAndBars.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Type": r.type, "Address": r.address })));

  const areaProfile = aggregateAreaProfile(rows, gnLabel);
  addSheet("Physical Env - Water Sources", areaProfile.waterSources.rows.map((r) => ({ "GN Division": r.gnName, "Type": r.type, "Name": r.name })));
  addSheet("Physical Env - Hazards", areaProfile.hazards.rows.map((r) => ({ "GN Division": r.gnName, "Type": r.type, "Occurred": r.occurred, "Frequency": r.frequency ?? "" })));
  addSheet("Physical Env - Sensitive Zones", areaProfile.sensitiveZones.rows.map((r) => ({ "GN Division": r.gnName, "Zone": r.zoneName, "Significance": r.significance, "Managing Authority": r.managingAuthority })));
  addSheet("Physical Env - Safe Locations", areaProfile.safeLocations.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Address": r.address })));

  addSheet("Religious - Site Counts", [{
    "Temples": areaProfile.religiousSiteCounts.temples.count, "Temple Clergy": areaProfile.religiousSiteCounts.temples.clergyCount,
    "Kovils": areaProfile.religiousSiteCounts.kovils.count, "Kovil Clergy": areaProfile.religiousSiteCounts.kovils.clergyCount,
    "Mosques": areaProfile.religiousSiteCounts.mosques.count, "Mosque Clergy": areaProfile.religiousSiteCounts.mosques.clergyCount,
    "Churches": areaProfile.religiousSiteCounts.churches.count, "Church Clergy": areaProfile.religiousSiteCounts.churches.clergyCount,
  }]);
  addSheet("Religious - Heritage Sites", areaProfile.heritageSites.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Type": r.type, "Significance": r.significance })));
  addSheet("Religious - Art Academies", areaProfile.artAcademies.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Students": r.studentCount })));
  addSheet("Religious - Traditional Artists", areaProfile.traditionalArtists.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Art Form": r.artForm, "Description": r.description ?? "" })));

  addSheet("Tourism - Hotels", areaProfile.hotelInventory.rows.map((r) => ({ "GN Division": r.gnName, "Star Grade": r.starGrade, "Hotels": r.hotelCount, "Rooms": r.roomCount })));
  addSheet("Tourism - Guest Accommodations", areaProfile.guestAccommodations.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Type": r.type, "Rooms": r.roomCount, "Address": r.address })));
  addSheet("Tourism - Other Accommodations", areaProfile.otherAccommodations.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Type": r.type, "Address": r.address })));

  addSheet("Waste Management Summary", [{
    "Divisions with Program": areaProfile.wasteManagement.divisionsWithProgram,
    "Divisions with Compost Site": areaProfile.wasteManagement.divisionsWithCompostSite,
  }]);
  addSheet("Waste - Disposal Methods", areaProfile.wasteManagement.disposalMethodIfNoProgram.map((d) => ({ "Method": d.en, "Divisions": d.presentCount })));

  addSheet("Identification - State Institutions", areaProfile.stateInstitutions.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Address": r.address })));
  addSheet("Identification - Development Projects", areaProfile.developmentProjects.rows.map((r) => ({ "GN Division": r.gnName, "Name": r.name, "Status": r.status, "Location": r.location })));
  addSheet("Identification - Illegal Structures", areaProfile.illegalStructures.rows.map((r) => ({ "GN Division": r.gnName, "Description": r.description, "Location": r.location })));

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="division-summary-${year}.xlsx"`,
    },
  });
}
