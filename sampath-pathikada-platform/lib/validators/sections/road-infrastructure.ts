import { z } from "zod";
import { yesNo } from "@/lib/validators/common";

/* ── §10 ප්‍රවාහන පහසුකම් — Transport & Infrastructure ────────────────────── */
/* Folder name stays "road-infrastructure" even though it covers much more than roads. */

const HYDROPOWER_SCALES = ["mini", "major"] as const;
const FINANCIAL_INSTITUTION_TYPES = ["govt-bank", "private-bank", "cooperative-rural-bank", "samurdhi-bank"] as const;
const ROAD_SURFACE_TYPES = ["carpet", "gravel", "concrete", "interlock", "graded"] as const;
const POST_OFFICE_TYPES = ["head-post-office", "first-grade-sub-post-office", "second-grade-sub-post-office", "sub-post-office", "appointed-post-office", "postal-box-and-counter"] as const;
const SERVICE_CATEGORIES = [
  "grocery",
  "hardware-store",
  "textile-shop",
  "meat-fish-shop",
  "timber-depot",
  "electrical-shop",
  "stationery-shop",
  "construction-materials-shop",
  "jewelry-shop",
  "cosmetics-shop",
  "motor-parts-shop",
  "photography-studio",
  "vehicle-service-center",
  "salon",
  "welding-shop",
  "blacksmith",
  "tailoring-shop",
  "courier-service",
  "telecom-shop",
  "other",
] as const;
const PUBLIC_FACILITY_CATEGORIES = [
  "playground",
  "library",
  "cinema-hall",
  "auditorium",
  "gym",
  "daycare-center",
  "cemetery-crematorium",
  "cultural-center",
  "market",
  "community-hall",
  "disabled-accessible-space",
  "public-restroom",
  "public-wifi-point",
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
  priorityRank: z.coerce.number().int().min(0).default(0),
});

export const bridgeRepairRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  roadNumber: z.string().optional(),
  condition: z.string().min(1, "Condition is required"),
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
  requiredServiceFrequency: z.string().optional(),
});

export const postOfficeRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(POST_OFFICE_TYPES),
});

export const railwayCrossingGapRowSchema = z.object({
  location: z.string().min(1, "Location is required"),
  roadName: z.string().optional(),
});

export const namedFacilityRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const hydropowerPlantRowSchema = z.object({
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
  name: z.string().optional(),
});

export const licensedLiquorShopRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
});

export const roadInfrastructureSchemaStrict = z.object({
  publicFacilities: z.object({
    busStand: publicFacilityPresenceSchema,
    railwayStation: publicFacilityPresenceSchema,
    jetty: publicFacilityPresenceSchema,
    airport: publicFacilityPresenceSchema,
  }),
  roadDevelopmentNeeds: z.array(roadDevelopmentNeedRowSchema).default([]),
  bridgeRepairs: z.array(bridgeRepairRowSchema).default([]),
  newRoadBridgeNeeds: z.array(newRoadBridgeNeedRowSchema).default([]),
  noPublicTransportAreas: z.array(noPublicTransportAreaRowSchema).default([]),
  railwayCrossingGaps: z.array(railwayCrossingGapRowSchema).default([]),
  postOffices: z.array(postOfficeRowSchema).default([]),
  electricitySubstations: z.array(namedFacilityRowSchema).default([]),
  fuelDistributionStations: z.array(namedFacilityRowSchema).default([]),
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

export const roadInfrastructureSchemaPartial = z.object({
  publicFacilities: z
    .object({
      busStand: publicFacilityPresenceSchema.partial().optional(),
      railwayStation: publicFacilityPresenceSchema.partial().optional(),
      jetty: publicFacilityPresenceSchema.partial().optional(),
      airport: publicFacilityPresenceSchema.partial().optional(),
    })
    .optional(),
  roadDevelopmentNeeds: z.array(roadDevelopmentNeedRowSchema.partial()).optional(),
  bridgeRepairs: z.array(bridgeRepairRowSchema.partial()).optional(),
  newRoadBridgeNeeds: z.array(newRoadBridgeNeedRowSchema.partial()).optional(),
  noPublicTransportAreas: z.array(noPublicTransportAreaRowSchema.partial()).optional(),
  railwayCrossingGaps: z.array(railwayCrossingGapRowSchema.partial()).optional(),
  postOffices: z.array(postOfficeRowSchema.partial()).optional(),
  electricitySubstations: z.array(namedFacilityRowSchema.partial()).optional(),
  fuelDistributionStations: z.array(namedFacilityRowSchema.partial()).optional(),
  hydropowerPlants: z.array(hydropowerPlantRowSchema.partial()).optional(),
  financialInstitutions: z.array(financialInstitutionRowSchema.partial()).optional(),
  serviceEstablishments: z.array(serviceEstablishmentRowSchema.partial()).optional(),
  industrialEstates: z.array(industrialEstateRowSchema.partial()).optional(),
  waterReservoirs: z.array(waterReservoirRowSchema.partial()).optional(),
  publicFacilityCategories: z.array(publicFacilityCategoryRowSchema.partial()).optional(),
  licensedLiquorShopsPresent: yesNo.optional(),
  licensedLiquorShops: z.array(licensedLiquorShopRowSchema.partial()).optional(),
});

export { HYDROPOWER_SCALES, FINANCIAL_INSTITUTION_TYPES, ROAD_SURFACE_TYPES, POST_OFFICE_TYPES, SERVICE_CATEGORIES, PUBLIC_FACILITY_CATEGORIES };
