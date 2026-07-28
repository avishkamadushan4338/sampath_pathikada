import { z } from "zod";
import { yesNo } from "@/lib/validators/common";

/* ── §2 භෞතික පාරිසරික තොරතුරු — Physical & Environmental info ───────────────── */

const HAZARD_TYPES = [
  "flood",
  "drought",
  "landslide",
  "deforestation",
  "waterSourceDepletion",
  "unauthorizedLandFilling",
  "unauthorizedWasteDisposal",
  "wildElephantConflict",
  "coastalErosion",
  "illegalSandMining",
] as const;

export const waterSourceRowSchema = z.object({
  type: z.string().min(1, "Water source type is required"),
  name: z.string().min(1, "Name is required"),
});

export const sensitiveZoneRowSchema = z.object({
  zoneName: z.string().min(1, "Zone/area name is required"),
  significance: z.string().min(1, "Significance is required"),
  managingAuthority: z.string().min(1, "Managing authority is required"),
});

export const naturalResourceRowSchema = z.object({
  resource: z.string().min(1, "Resource is required"),
  utilizedForProduction: yesNo,
  notes: z.string().optional(),
});

export const hazardRowSchema = z.object({
  type: z.enum(HAZARD_TYPES),
  occurred: yesNo,
  frequency: z.string().optional(),
  mitigationProposal: z.string().optional(),
});

export const safeLocationRowSchema = z.object({
  name: z.string().min(1, "Safe location name is required"),
  address: z.string().min(1, "Address is required"),
});

export const touristSiteRowSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  reasonForAttraction: z.string().min(1, "Reason for attraction is required"),
  maintainedBy: z.string().min(1, "Maintaining authority is required"),
  frequency: z.enum(["seasonal", "year-round"]).optional(),
});

export const proposedTouristSiteRowSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  specialFeatures: z.string().min(1, "Special features are required"),
  possibleActivities: z.string().optional(),
  currentAuthority: z.string().optional(),
});

export const physicalEnvironmentSchemaStrict = z.object({
  waterSources: z.array(waterSourceRowSchema).default([]),
  sensitiveZones: z.array(sensitiveZoneRowSchema).default([]),
  naturalResources: z.array(naturalResourceRowSchema).default([]),
  hazards: z.array(hazardRowSchema).length(HAZARD_TYPES.length),
  safeLocationsIdentified: yesNo,
  safeLocations: z.array(safeLocationRowSchema).default([]),
  touristSites: z.array(touristSiteRowSchema).default([]),
  proposedTouristSites: z.array(proposedTouristSiteRowSchema).default([]),
});

export type PhysicalEnvironmentData = z.infer<typeof physicalEnvironmentSchemaStrict>;

export const physicalEnvironmentSchemaPartial = z.object({
  waterSources: z.array(waterSourceRowSchema.partial()).optional(),
  sensitiveZones: z.array(sensitiveZoneRowSchema.partial()).optional(),
  naturalResources: z.array(naturalResourceRowSchema.partial()).optional(),
  hazards: z.array(hazardRowSchema.partial()).optional(),
  safeLocationsIdentified: yesNo.optional(),
  safeLocations: z.array(safeLocationRowSchema.partial()).optional(),
  touristSites: z.array(touristSiteRowSchema.partial()).optional(),
  proposedTouristSites: z.array(proposedTouristSiteRowSchema.partial()).optional(),
});

export { HAZARD_TYPES };
