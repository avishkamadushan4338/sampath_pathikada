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

/** Fixed checklist of water source categories (§2.1 of the paper form) — the officer fills in
 *  a name (or, for the well rows, a count) against each predefined category rather than adding
 *  free-form rows. */
const WATER_SOURCE_TYPES = [
  "river",
  "reservoir",
  "springs",
  "tank",
  "streams",
  "publicWells",
  "tubeWells",
] as const;

export const waterSourceRowSchema = z.object({
  type: z.enum(WATER_SOURCE_TYPES),
  name: z.string().optional(),
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
  waterSources: z.array(waterSourceRowSchema).length(WATER_SOURCE_TYPES.length),
  sensitiveZones: z.array(sensitiveZoneRowSchema).default([]),
  naturalResources: z.array(naturalResourceRowSchema).default([]),
  hazards: z.array(hazardRowSchema).length(HAZARD_TYPES.length),
  safeLocationsIdentified: yesNo,
  safeLocations: z.array(safeLocationRowSchema).default([]),
  touristSites: z.array(touristSiteRowSchema).default([]),
  proposedTouristSites: z.array(proposedTouristSiteRowSchema).default([]),
});

export type PhysicalEnvironmentData = z.infer<typeof physicalEnvironmentSchemaStrict>;

/* Draft-mode row schemas built from scratch rather than `.partial()` on the strict schemas
 * above: `.partial()` only allows a field to be *missing*, it doesn't relax `min(1)`, so a row
 * added via the "Add" button (whose fields start as "") would still fail validation and
 * silently block saving. A GN division without one of these should be able to leave it blank. */
const sensitiveZoneRowPartialSchema = z.object({
  zoneName: z.string().optional(),
  significance: z.string().optional(),
  managingAuthority: z.string().optional(),
});

const safeLocationRowPartialSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
});

const touristSiteRowPartialSchema = z.object({
  siteName: z.string().optional(),
  reasonForAttraction: z.string().optional(),
  maintainedBy: z.string().optional(),
  frequency: z.enum(["seasonal", "year-round"]).optional(),
});

const naturalResourceRowPartialSchema = z.object({
  resource: z.string().optional(),
  utilizedForProduction: yesNo.optional(),
  notes: z.string().optional(),
});

const proposedTouristSiteRowPartialSchema = z.object({
  siteName: z.string().optional(),
  specialFeatures: z.string().optional(),
  possibleActivities: z.string().optional(),
  currentAuthority: z.string().optional(),
});

export const physicalEnvironmentSchemaPartial = z.object({
  waterSources: z.array(waterSourceRowSchema.partial()).optional(),
  sensitiveZones: z.array(sensitiveZoneRowPartialSchema).optional(),
  naturalResources: z.array(naturalResourceRowPartialSchema).optional(),
  hazards: z.array(hazardRowSchema.partial()).optional(),
  safeLocationsIdentified: yesNo.optional(),
  safeLocations: z.array(safeLocationRowPartialSchema).optional(),
  touristSites: z.array(touristSiteRowPartialSchema).optional(),
  proposedTouristSites: z.array(proposedTouristSiteRowPartialSchema).optional(),
});

export { HAZARD_TYPES, WATER_SOURCE_TYPES };
