import { z } from "zod";
import { yesNo } from "@/lib/validators/common";

/* ── §10 ප්‍රවාහන පහසුකම් — Transport & Infrastructure ────────────────────── */
/* Folder name stays "road-infrastructure" even though it covers much more than roads. */
/* Field list/order matches the official "10. යටිතල පහසුකම්" paper form exactly. */

const HYDROPOWER_SCALES = ["mini", "major"] as const;
const FINANCIAL_INSTITUTION_TYPES = ["govt-bank", "private-bank", "cooperative-rural-bank", "samurdhi-bank"] as const;
const ROAD_SURFACE_TYPES = ["carpet", "tar", "concrete", "interlock", "gravel-soil"] as const;
const POST_OFFICE_TYPES = ["head-post-office", "first-grade-sub-post-office", "second-grade-sub-post-office", "sub-post-office", "appointed-post-office", "postal-box-and-counter"] as const;
const SERVICE_CATEGORIES = [
  "retail-shop",
  "eating-house-tea-shop",
  "shoes-textiles",
  "meat-fish-shop",
  "hardware-household-goods",
  "electrical-equipment",
  "general-goods-shop",
  "construction-materials",
  "jewelry",
  "books-stationery",
  "motor-spare-parts",
  "beauty-salon",
  "vehicle-service-center",
  "salon",
  "vehicle-repair",
  "umbrella-bag-shoe-repair",
  "tailoring-shop",
  "funeral-service",
  "mobile-phone-shop",
  "vegetable-shop",
] as const;
const PUBLIC_FACILITY_CATEGORIES = [
  "childrens-park",
  "library-reading-room",
  "cinema-hall",
  "auditorium",
  "public-playground",
  "gym",
  "daycare-center",
  "cemetery-crematorium",
  "cultural-center",
  "weekly-fair-market",
  "community-hall",
  "vidatha-center",
  "registered-three-wheeler-park",
] as const;

export const publicFacilityPresenceSchema = z.object({
  present: yesNo,
  name: z.string().optional(),
});

export const roadDevelopmentNeedRowSchema = z.object({
  roadName: z.string().min(1, "Road name is required"),
  roadNumber: z.string().optional(),
  lengthMeters: z.coerce.number().min(0).default(0),
  surfaceType: z.enum(ROAD_SURFACE_TYPES).optional(),
  maintainingAuthority: z.string().optional(),
});

export const bridgeRepairRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  roadNumber: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  maintainingAuthority: z.string().optional(),
});

export const newRoadBridgeNeedRowSchema = z.object({
  location: z.string().min(1, "Location is required"),
  roadNumber: z.string().optional(),
  justification: z.string().min(1, "Justification is required"),
});

export const noPublicTransportAreaRowSchema = z.object({
  roadName: z.string().min(1, "Road name is required"),
  roadNumber: z.string().optional(),
  startPoint: z.string().optional(),
  endPoint: z.string().optional(),
  distanceKm: z.coerce.number().min(0).default(0),
  requiredBeneficiaryCount: z.coerce.number().int().min(0).default(0),
});

export const postOfficeRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(POST_OFFICE_TYPES),
});

export const railwayCrossingGapRowSchema = z.object({
  roadName: z.string().optional(),
  roadNumber: z.string().optional(),
  location: z.string().min(1, "Location is required"),
});

export const namedFacilityRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const hydropowerPlantRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  scale: z.enum(HYDROPOWER_SCALES),
});

export const solarPowerPlantRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  scale: z.enum(HYDROPOWER_SCALES),
});

export const windPowerPlantRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  scale: z.enum(HYDROPOWER_SCALES),
});

export const financialInstitutionRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(FINANCIAL_INSTITUTION_TYPES),
});

export const serviceEstablishmentRowSchema = z.object({
  category: z.enum(SERVICE_CATEGORIES),
  count: z.coerce.number().int().min(0).default(0),
});

export const industrialEstateRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
});

export const waterReservoirRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const publicFacilityCategoryRowSchema = z.object({
  category: z.enum(PUBLIC_FACILITY_CATEGORIES),
  present: yesNo,
  count: z.coerce.number().int().min(0).default(0),
  distanceToNearestIfOutsideDivision: z.string().optional(),
});

export const licensedLiquorShopRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
});

export const roadInfrastructureSchemaStrict = z.object({
  publicFacilities: z.object({
    busStand: publicFacilityPresenceSchema,
    railwayStation: publicFacilityPresenceSchema,
    port: publicFacilityPresenceSchema,
    airport: publicFacilityPresenceSchema,
  }),
  roadDevelopmentNeeds: z.array(roadDevelopmentNeedRowSchema).default([]),
  bridgeRepairs: z.array(bridgeRepairRowSchema).default([]),
  newRoadBridgeNeeds: z.array(newRoadBridgeNeedRowSchema).default([]),
  noPublicTransportAreas: z.array(noPublicTransportAreaRowSchema).default([]),
  railwayCrossingGaps: z.array(railwayCrossingGapRowSchema).default([]),
  postOffices: z.array(postOfficeRowSchema).default([]),
  fuelDistributionStations: z.array(namedFacilityRowSchema).default([]),
  solarPowerPlants: z.array(solarPowerPlantRowSchema).default([]),
  windPowerPlants: z.array(windPowerPlantRowSchema).default([]),
  hydropowerPlants: z.array(hydropowerPlantRowSchema).default([]),
  financialInstitutions: z.array(financialInstitutionRowSchema).default([]),
  serviceEstablishments: z.array(serviceEstablishmentRowSchema).length(SERVICE_CATEGORIES.length),
  industrialEstates: z.array(industrialEstateRowSchema).default([]),
  waterReservoirs: z.array(waterReservoirRowSchema).default([]),
  publicFacilityCategories: z.array(publicFacilityCategoryRowSchema).length(PUBLIC_FACILITY_CATEGORIES.length),
  licensedLiquorShopsPresent: yesNo,
  licensedLiquorShops: z.array(licensedLiquorShopRowSchema).default([]),
});

export type RoadInfrastructureData = z.infer<typeof roadInfrastructureSchemaStrict>;

/* Draft-mode reuses the strict row schemas directly — a row's required fields (e.g. `name`)
 * still fail validation if blank, surfacing a "required" error in the UI, but that no longer
 * blocks saving: SectionForm always saves the draft regardless of validation outcome, it just
 * shows the errors alongside. Only the *array itself* (or, for `publicFacilities`, the nested
 * object) is optional here, so an empty/untouched table is still a valid draft.
 * solarPowerPlants/windPowerPlants/hydropowerPlants used to be intentionally left on plain
 * `.partial()` per an earlier instruction — that no longer applies, so they now follow the
 * same pattern as every other table below. */
export const roadInfrastructureSchemaPartial = z.object({
  publicFacilities: z
    .object({
      busStand: publicFacilityPresenceSchema.optional(),
      railwayStation: publicFacilityPresenceSchema.optional(),
      port: publicFacilityPresenceSchema.optional(),
      airport: publicFacilityPresenceSchema.optional(),
    })
    .optional(),
  roadDevelopmentNeeds: z.array(roadDevelopmentNeedRowSchema).optional(),
  bridgeRepairs: z.array(bridgeRepairRowSchema).optional(),
  newRoadBridgeNeeds: z.array(newRoadBridgeNeedRowSchema).optional(),
  noPublicTransportAreas: z.array(noPublicTransportAreaRowSchema).optional(),
  railwayCrossingGaps: z.array(railwayCrossingGapRowSchema).optional(),
  postOffices: z.array(postOfficeRowSchema).optional(),
  fuelDistributionStations: z.array(namedFacilityRowSchema).optional(),
  solarPowerPlants: z.array(solarPowerPlantRowSchema).optional(),
  windPowerPlants: z.array(windPowerPlantRowSchema).optional(),
  hydropowerPlants: z.array(hydropowerPlantRowSchema).optional(),
  financialInstitutions: z.array(financialInstitutionRowSchema).optional(),
  serviceEstablishments: z.array(serviceEstablishmentRowSchema).optional(),
  industrialEstates: z.array(industrialEstateRowSchema).optional(),
  waterReservoirs: z.array(waterReservoirRowSchema).optional(),
  publicFacilityCategories: z.array(publicFacilityCategoryRowSchema).optional(),
  licensedLiquorShopsPresent: yesNo,
  licensedLiquorShops: z.array(licensedLiquorShopRowSchema).optional(),
});

export { HYDROPOWER_SCALES, FINANCIAL_INSTITUTION_TYPES, ROAD_SURFACE_TYPES, POST_OFFICE_TYPES, SERVICE_CATEGORIES, PUBLIC_FACILITY_CATEGORIES };
