import { z } from "zod";
import { yesNo } from "@/lib/validators/common";

/* ── §10 ප්‍රවාහන පහසුකම් — Transport & Infrastructure ────────────────────── */
/* Folder name stays "road-infrastructure" even though it covers much more than roads. */

const HYDROPOWER_SCALES = ["mini", "major"] as const;
const FINANCIAL_INSTITUTION_TYPES = ["govt", "private"] as const;

export const publicFacilityPresenceSchema = z.object({
  present: yesNo,
  name: z.string().optional(),
});

export const roadDevelopmentNeedRowSchema = z.object({
  roadName: z.string().min(1, "Road name is required"),
  roadNumber: z.string().optional(),
  lengthMeters: z.coerce.number().min(0).default(0),
  currentCondition: z.string().min(1, "Current condition is required"),
  priorityRank: z.coerce.number().int().min(0).default(0),
});

export const bridgeRepairRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  roadNumber: z.string().optional(),
  condition: z.string().min(1, "Condition is required"),
});

export const newRoadBridgeNeedRowSchema = z.object({
  location: z.string().min(1, "Location is required"),
  justification: z.string().min(1, "Justification is required"),
});

export const noPublicTransportAreaRowSchema = z.object({
  area: z.string().min(1, "Area is required"),
  nearestRoute: z.string().optional(),
  distanceKm: z.coerce.number().min(0).default(0),
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
  label: z.string().min(1),
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
  label: z.string().min(1),
  present: yesNo,
  name: z.string().optional(),
});

export const notableClubBarRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  address: z.string().min(1, "Address is required"),
});

const SERVICE_CATEGORIES_COUNT = 20;
const PUBLIC_FACILITY_CATEGORIES_COUNT = 13;

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
  electricitySubstations: z.array(namedFacilityRowSchema).default([]),
  fuelDistributionStations: z.array(namedFacilityRowSchema).default([]),
  hydropowerPlants: z.array(hydropowerPlantRowSchema).default([]),
  financialInstitutions: z.array(financialInstitutionRowSchema).default([]),
  serviceEstablishments: z.array(serviceEstablishmentRowSchema).length(SERVICE_CATEGORIES_COUNT),
  industrialEstates: z.array(industrialEstateRowSchema).default([]),
  waterReservoirs: z.array(waterReservoirRowSchema).default([]),
  publicFacilityCategories: z.array(publicFacilityCategoryRowSchema).length(PUBLIC_FACILITY_CATEGORIES_COUNT),
  notableClubsAndBars: z.array(notableClubBarRowSchema).default([]),
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
  electricitySubstations: z.array(namedFacilityRowSchema.partial()).optional(),
  fuelDistributionStations: z.array(namedFacilityRowSchema.partial()).optional(),
  hydropowerPlants: z.array(hydropowerPlantRowSchema.partial()).optional(),
  financialInstitutions: z.array(financialInstitutionRowSchema.partial()).optional(),
  serviceEstablishments: z.array(serviceEstablishmentRowSchema.partial()).optional(),
  industrialEstates: z.array(industrialEstateRowSchema.partial()).optional(),
  waterReservoirs: z.array(waterReservoirRowSchema.partial()).optional(),
  publicFacilityCategories: z.array(publicFacilityCategoryRowSchema.partial()).optional(),
  notableClubsAndBars: z.array(notableClubBarRowSchema.partial()).optional(),
});

export { HYDROPOWER_SCALES, FINANCIAL_INSTITUTION_TYPES, SERVICE_CATEGORIES_COUNT, PUBLIC_FACILITY_CATEGORIES_COUNT };
