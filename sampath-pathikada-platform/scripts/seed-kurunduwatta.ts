import { PrismaClient, Prisma } from "../lib/prisma-client";
import { identificationSchemaStrict } from "../lib/validators/sections/identification";
import { stateInstitutionsLandSchemaStrict } from "../lib/validators/sections/state-institutions-land";
import { physicalEnvironmentSchemaStrict } from "../lib/validators/sections/physical-environment";
import { demographicsSchemaStrict } from "../lib/validators/sections/demographics";
import { housingSchemaStrict } from "../lib/validators/sections/housing";
import { employmentSchemaStrict } from "../lib/validators/sections/employment";
import { educationSchemaStrict } from "../lib/validators/sections/education";
import { religiousCulturalSchemaStrict } from "../lib/validators/sections/religious-cultural";
import { healthSchemaStrict } from "../lib/validators/sections/health";
import { economicAgricultureSchemaStrict } from "../lib/validators/sections/economic-agriculture";
import { roadInfrastructureSchemaStrict } from "../lib/validators/sections/road-infrastructure";
import { socialWelfareSchemaStrict } from "../lib/validators/sections/social-welfare";
import { communityOrganizationsSchemaStrict } from "../lib/validators/sections/community-organizations";
import { tourismSchemaStrict } from "../lib/validators/sections/tourism";
import { wasteDisasterSchemaStrict } from "../lib/validators/sections/waste-disaster";

import { housingData, employmentData, educationData, religiousCulturalData } from "./dummy-data/kurunduwatta-batch-1";
import { healthData, economicAgricultureData, roadInfrastructureData } from "./dummy-data/kurunduwatta-batch-2";
import {
  socialWelfareData,
  communityOrganizationsData,
  tourismData,
  wasteDisasterData,
} from "./dummy-data/kurunduwatta-batch-3";

const prisma = new PrismaClient();

const SUBMISSION_ID = "cmryrbb1t000c7k5oq6r84r9d"; // Kurunduwatta, 2026
const GN_DIVISION = "3-1-39-020";
const APPROVER_USER_ID = "cmrerncz900027kcg6ndxj4gd"; // W.G. Avishka Madushan, DIVISIONAL_SECRETARIAT, galle-fg

const SECTION_KEYS = [
  "identification",
  "stateInstitutionsLand",
  "physicalEnvironment",
  "demographics",
  "housing",
  "employment",
  "education",
  "religiousCultural",
  "health",
  "economicAgriculture",
  "roadInfrastructure",
  "socialWelfare",
  "communityOrganizations",
  "tourism",
  "wasteDisaster",
] as const;

function validate<T>(label: string, schema: { parse: (v: unknown) => T }, value: unknown): T {
  try {
    return schema.parse(value);
  } catch (err) {
    console.error(`\n❌  Validation failed for "${label}":`);
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

// The 4 pre-existing sections predate a schema change: `stateInstitutionsLand.illegalStructures`
// used old field names (description/location instead of buildingName/purposeUsed/usable/
// owningInstitution), and `physicalEnvironment` predates the fixed-category-checklist
// requirement (every water-source and hazard category now needs at least one row). Patched here
// rather than dropped, to keep the GN division's existing genuine entries (the canal issue) as
// part of the checklist instead of discarding them.
function patchStateInstitutionsLand(existing: Record<string, unknown>) {
  return {
    ...existing,
    illegalStructures: [
      {
        buildingName: "Old paddy store near canal reservation",
        purposeUsed: "Unauthorized storage extension into the canal reservation",
        usable: "no",
        owningInstitution: "Divisional Secretariat - Galle Four Gravets",
      },
    ],
  };
}

function patchDemographics(existing: Record<string, unknown>) {
  const disabilities = Array.isArray(existing.disabilities) ? [...(existing.disabilities as Record<string, unknown>[])] : [];
  if (!disabilities.some((d) => d.type === "paralysis")) {
    disabilities.push({ type: "paralysis", under18: { female: 0, male: 1 }, over18: { female: 2, male: 1 } });
  }

  // The pre-existing Age/Ethnicity/Religion breakdowns don't sum to the same total population —
  // a cross-field superRefine on the strict schema (added earlier this session) now catches this,
  // where a looser save-time check didn't. Reconciled onto Age's totals (the most granular
  // breakdown) by folding the shortfall into each breakdown's "other" bucket.
  const ethnicity = (existing.populationByEthnicity as Record<string, unknown>[]).map((row) =>
    row.ethnicity === "other" ? { ...row, female: (row.female as number) + 8, male: (row.male as number) + 16 } : row
  );
  const religion = (existing.populationByReligion as Record<string, unknown>[]).map((row) =>
    row.religion === "other" ? { ...row, female: (row.female as number) + 19, male: (row.male as number) + 21 } : row
  );

  return {
    ...existing,
    disabilities,
    populationByEthnicity: ethnicity,
    populationByReligion: religion,
    registeredVoters: {
      electoralArea: "Kurunduwatta",
      ...(existing.registeredVoters as Record<string, unknown>),
    },
  };
}

function patchPhysicalEnvironment(existing: Record<string, unknown>) {
  return {
    ...existing,
    safeLocationsIdentified: existing.safeLocationsIdentified ?? "no",
    waterSources: [
      { type: "streams", name: "Kurunduwatta Irrigation Canal" },
      { type: "river", name: "Gin Ganga (tributary access)" },
      { type: "reservoir", name: "" },
      { type: "springs", name: "" },
      { type: "tank", name: "" },
      { type: "publicWells", name: "12 public wells" },
      { type: "tubeWells", name: "6 tube wells" },
    ],
    hazards: [
      {
        type: "flood",
        occurred: "yes",
        frequency: "Rare — during heavy monsoon rainfall",
        mitigationProposal: "Canal wall repair and drainage channel improvement",
      },
      { type: "drought", occurred: "no" },
      { type: "landslide", occurred: "no" },
      { type: "deforestation", occurred: "no" },
      { type: "waterSourceDepletion", occurred: "no" },
      { type: "unauthorizedLandFilling", occurred: "no" },
      { type: "unauthorizedWasteDisposal", occurred: "no" },
      { type: "wildElephantConflict", occurred: "no" },
      { type: "coastalErosion", occurred: "no" },
      { type: "illegalSandMining", occurred: "no" },
    ],
  };
}

async function main() {
  const existing = await prisma.submission.findUnique({ where: { id: SUBMISSION_ID } });
  if (!existing) throw new Error(`Submission ${SUBMISSION_ID} not found.`);
  if (existing.gnDivision !== GN_DIVISION) throw new Error("gnDivision mismatch — refusing to proceed.");

  const existingData = existing.data as Record<string, unknown>;
  console.log("Existing sections already present:", Object.keys(existingData));

  // The 4 sections already saved (identification, stateInstitutionsLand, physicalEnvironment,
  // demographics) are kept as-is (demographics/identification) or patched (see above) — the
  // remaining 11 are the newly-generated dummy data.
  const data = {
    identification: validate("identification", identificationSchemaStrict, existingData.identification),
    stateInstitutionsLand: validate(
      "stateInstitutionsLand",
      stateInstitutionsLandSchemaStrict,
      patchStateInstitutionsLand(existingData.stateInstitutionsLand as Record<string, unknown>)
    ),
    physicalEnvironment: validate(
      "physicalEnvironment",
      physicalEnvironmentSchemaStrict,
      patchPhysicalEnvironment(existingData.physicalEnvironment as Record<string, unknown>)
    ),
    demographics: validate(
      "demographics",
      demographicsSchemaStrict,
      patchDemographics(existingData.demographics as Record<string, unknown>)
    ),
    housing: validate("housing", housingSchemaStrict, housingData),
    employment: validate("employment", employmentSchemaStrict, employmentData),
    education: validate("education", educationSchemaStrict, educationData),
    religiousCultural: validate("religiousCultural", religiousCulturalSchemaStrict, religiousCulturalData),
    health: validate("health", healthSchemaStrict, healthData),
    economicAgriculture: validate("economicAgriculture", economicAgricultureSchemaStrict, economicAgricultureData),
    roadInfrastructure: validate("roadInfrastructure", roadInfrastructureSchemaStrict, roadInfrastructureData),
    socialWelfare: validate("socialWelfare", socialWelfareSchemaStrict, socialWelfareData),
    communityOrganizations: validate("communityOrganizations", communityOrganizationsSchemaStrict, communityOrganizationsData),
    tourism: validate("tourism", tourismSchemaStrict, tourismData),
    wasteDisaster: validate("wasteDisaster", wasteDisasterSchemaStrict, wasteDisasterData),
  };

  console.log("✅  All 15 sections validated against their strict schemas.");

  const reviewedAt = new Date();
  const sectionReviews = Object.fromEntries(
    SECTION_KEYS.map((key) => [
      key,
      { status: "APPROVED", note: null, reviewedById: APPROVER_USER_ID, reviewedAt: reviewedAt.toISOString() },
    ])
  );

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.submission.update({
      where: { id: SUBMISSION_ID },
      data: {
        data: data as Prisma.InputJsonValue,
        sectionReviews: sectionReviews as Prisma.InputJsonValue,
        status: "APPROVED",
        rejectionNote: null,
        reviewedById: APPROVER_USER_ID,
        reviewedAt,
      },
    });

    await tx.divisionProfile.upsert({
      where: { gnDivision: GN_DIVISION },
      create: {
        district: existing.district,
        dsDivision: existing.dsDivision,
        gnDivision: GN_DIVISION,
        data: data as object,
        sourceSubmissionId: SUBMISSION_ID,
        year: existing.year,
        approvedById: APPROVER_USER_ID,
        approvedAt: reviewedAt,
      },
      update: {
        district: existing.district,
        dsDivision: existing.dsDivision,
        data: data as object,
        sourceSubmissionId: SUBMISSION_ID,
        year: existing.year,
        approvedById: APPROVER_USER_ID,
        approvedAt: reviewedAt,
      },
    });

    return result;
  });

  console.log(`🎉  Submission ${updated.id} approved and DivisionProfile upserted for ${GN_DIVISION}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
