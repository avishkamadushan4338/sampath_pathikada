/* One-off script: fills the two DRAFT submissions in the galle-fg (AD) division with dummy data
 * for every section and flips them to SUBMITTED, so the Assistant Director Planning review queue
 * has something to review. Not part of the regular seed — run manually with:
 *   npx ts-node --project tsconfig.seed.json scripts/seed-ad-review-dummy.ts
 */
import { PrismaClient } from "../lib/prisma-client";

const prisma = new PrismaClient();

const housing = {
  housingCounts: { total: 120, permanent: 90, semiPermanent: 20, nonPermanent: 10 },
  householdsWithoutHousing: 3,
  sanitation: { total: 120, withoutSafeSanitation: 5, needingAssistance: 4 },
  drinkingWaterSource: {
    well: 40, tubeWell: 10, spring: 2, pipedNational: 50, pipedLocalGovt: 10,
    pipedCommunity: 5, tankRiverCanalOther: 2, bottled: 0, treated: 0, bowser: 1, other: 0,
  },
  underservedAreas: [],
  electricityAccess: { total: 120, withElectricity: 115, withSolar: 3, withoutElectricity: 2, needingAssistance: 2 },
  communityWaterProjects: [],
};

const religiousCultural = {
  religiousSiteCounts: {
    temples: { count: 3, clergyCount: 6 },
    meheniArama: { count: 0, clergyCount: 0 },
    kovils: { count: 0, clergyCount: 0 },
    mosques: { count: 0, clergyCount: 0 },
    churches: { count: 1, priestsCount: 1, nunsCount: 0 },
  },
  heritageSites: [],
  artAcademies: [],
  traditionalArtists: [],
};

const health = {
  institutionCounts: {
    govtHospitals: 0, primaryHealthcareUnits: 1, privateHospitals: 0, ayurvedicHospitals: 1,
    specialistServiceCenters: 0, mohOfficesOrCommunityHealthCenters: 1, privateMedicalLabs: 0,
    traditionalMedicineRegisteredInstitutions: 0, animalClinicCenters: 0, govtPharmacies: 0, privatePharmacies: 1,
  },
  govtHospitalsDirectory: [],
  primaryHealthcareUnitsDirectory: [],
  privateHospitalsDirectory: [],
  ayurvedicInstitutions: [],
  specialistServiceCentersDirectory: [],
  mohOfficesDirectory: [],
  traditionalMedicineInstitutionsDirectory: [],
  privateMedicalLabsDirectory: [],
  animalClinicsDirectory: [],
  traditionalPractitioners: [],
};

const LAND_USE_TYPES = [
  "forest", "paddy-cultivation", "abandoned-paddy", "agri-land-tea", "agri-land-coconut",
  "agri-land-rubber", "cinnamon", "pepper", "coffee", "vegetables", "fruits", "tuber-crops",
  "supplementary-food-crops", "inland-reservoirs", "roads-sports-homegardens", "scrub-chena-barren",
  "ornamental-nurseries", "plantation-crop-nurseries", "aquaculture-land",
];
const FLORAL_CULTIVATION_TYPES = ["floor-flower-cultivation", "greenhouse-cultivation", "beekeeping"];
const AGRI_MACHINERY_TYPES = [
  "two-wheel-tractor", "two-wheel-tractor-rotavator", "two-wheel-tractor-mouldboard-plough",
  "four-wheel-tractor", "four-wheel-tractor-rotavator", "four-wheel-tractor-hook-plough",
  "water-pump", "paddy-harvesting-machine", "paddy-threshing-machine", "combine-harvester",
  "transplanter", "power-sprayer", "hand-sprayer", "weeder", "food-drying-machine",
  "floor-flower-media-filling-machine", "floor-flower-media-boiling-machine",
  "seedling-planting-machine", "paddy-reaping-machine", "oil-mill", "rubber-mill", "paddy-mill", "other",
];
const CROP_DAMAGE_TYPES = ["elephant-conflict", "wildlife-damage", "peacock-damage", "flood-damage", "drought", "pest-disease", "other"];

const economicAgriculture = {
  landUse: LAND_USE_TYPES.map((landType) => ({ landType, extentHectares: 0 })),
  animalHusbandryCounts: FLORAL_CULTIVATION_TYPES.map((type) => ({ type, count: 0 })),
  animalHusbandryDirectory: [],
  specialEconomicActivities: [],
  abandonedPaddyLand: { extentAcres: 0, canBeReactivatedExtent: 0 },
  agriMachinery: AGRI_MACHINERY_TYPES.map((type) => ({ type, count: 0 })),
  forestDamage: CROP_DAMAGE_TYPES.map((type) => ({ type, present: "no" })),
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

const TRANSPORT_FACILITY_TYPES = ["busStand", "railwayStation", "port", "airport"];
const SERVICE_CATEGORIES = [
  "retail-shop", "eating-house-tea-shop", "shoes-textiles", "meat-fish-shop",
  "hardware-household-goods", "electrical-equipment", "general-goods-shop", "construction-materials",
  "jewelry", "books-stationery", "motor-spare-parts", "beauty-salon", "vehicle-service-center",
  "salon", "vehicle-repair", "umbrella-bag-shoe-repair", "tailoring-shop", "funeral-service",
  "mobile-phone-shop", "vegetable-shop",
];
const PUBLIC_FACILITY_CATEGORIES = [
  "childrens-park", "library-reading-room", "cinema-hall", "auditorium", "public-playground",
  "gym", "daycare-center", "cemetery-crematorium", "cultural-center", "weekly-fair-market",
  "community-hall", "vidatha-center", "registered-three-wheeler-park",
];

const roadInfrastructure = {
  publicFacilities: TRANSPORT_FACILITY_TYPES.map((type) => ({ type, present: "no" })),
  roadDevelopmentNeeds: [],
  bridgeRepairs: [],
  newRoadBridgeNeeds: [],
  noPublicTransportAreas: [],
  railwayCrossingGaps: [],
  postOffices: [],
  fuelDistributionStations: [],
  solarPowerPlants: [],
  windPowerPlants: [],
  hydropowerPlants: [],
  financialInstitutions: [],
  serviceEstablishments: SERVICE_CATEGORIES.map((category) => ({ category, count: 0 })),
  industrialEstates: [],
  waterReservoirs: [],
  publicFacilityCategories: PUBLIC_FACILITY_CATEGORIES.map((category) => ({ category, present: "no", count: 0 })),
  licensedLiquorShopsPresent: "no",
  licensedLiquorShops: [],
};

const ORGANIZATION_TYPES = [
  "village-development-society", "youth-society", "sports-club", "funeral-aid-society",
  "womens-society", "elders-society", "childrens-society", "samurdhi-society",
  "friend-organization", "ngo-committee", "farmer-society", "religious-society",
  "sanasa-society", "civil-defense-committee", "prajashakthi-society",
];

const communityOrganizations = {
  organizationCounts: ORGANIZATION_TYPES.map((type) => ({ type, count: 0 })),
  villageDevelopmentSocieties: [],
  youthSocieties: [],
  sportsClubs: [],
  funeralAidSocieties: [],
  womensSocieties: [],
  eldersSocieties: [],
  childrensSocieties: [],
  samurdhiSocieties: [],
  friendOrganizations: [],
  ngoCommittees: [],
  farmerSocieties: [],
  religiousSocieties: [],
  sanasaSocieties: [],
  civilDefenseCommittees: [],
  prajashakthiSocieties: [],
  cooperativeSocieties: [],
};

const wasteDisaster = {
  hasWasteProgram: "yes",
  publicInformedOfSchedule: "yes",
  collectionFrequency: "weekly",
  collectionMethod: "mixed",
  hasCompostOrDisposalSite: "no",
};

const MISSING_SECTIONS = {
  housing,
  religiousCultural,
  health,
  economicAgriculture,
  roadInfrastructure,
  communityOrganizations,
  wasteDisaster,
};

async function main() {
  const drafts = await prisma.submission.findMany({
    where: { dsDivision: "galle-fg", status: "DRAFT" },
  });

  for (const draft of drafts) {
    const existingData = (draft.data ?? {}) as Record<string, unknown>;
    const mergedData = { ...MISSING_SECTIONS, ...existingData };

    await prisma.submission.update({
      where: { id: draft.id },
      data: {
        data: mergedData,
        status: "SUBMITTED",
        reviewStage: "AD",
        sectionReviews: {},
      },
    });

    console.log(`✅  Submitted dummy data for ${draft.gnDivision} (submission ${draft.id})`);
  }

  console.log(`🎉  Done — ${drafts.length} submission(s) updated to SUBMITTED.`);
}

main()
  .catch((e) => { console.error("❌  Failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
