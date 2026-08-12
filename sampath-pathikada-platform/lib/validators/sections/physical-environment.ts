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

/** `frequency`/`mitigationProposal` are only meaningful once a hazard is confirmed to have
 *  occurred — conditionally required via `superRefine` (rather than always-required) so a
 *  "no" row doesn't force the officer to describe a problem that doesn't exist here. */
export const hazardRowSchema = z
  .object({
    type: z.enum(HAZARD_TYPES),
    occurred: yesNo,
    frequency: z.string().optional(),
    mitigationProposal: z.string().optional(),
  })
  .superRefine((row, ctx) => {
    if (row.occurred !== "yes") return;
    if (!row.frequency?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["frequency"], message: "Time period is required once a hazard has occurred" });
    }
    if (!row.mitigationProposal?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mitigationProposal"],
        message: "Proposed remedial measures are required once a hazard has occurred",
      });
    }
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

/** Once the officer confirms a safe location/evacuation center has been identified, the
 *  directory below it must actually list at least one — otherwise "yes" is a claim with no
 *  backing data. Attached to both strict and partial schemas so it's enforced identically in
 *  either mode; the issue's path targets the array field so the error surfaces near the table. */
function requireSafeLocationWhenIdentified(data: { safeLocationsIdentified?: string; safeLocations?: unknown[] }, ctx: z.RefinementCtx) {
  if (data.safeLocationsIdentified === "yes" && (data.safeLocations ?? []).length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["safeLocations"],
      message: "At least one safe location is required once you've indicated one has been identified",
    });
  }
}

export const physicalEnvironmentSchemaStrict = z
  .object({
    // At least one row per checklist category, but the officer can add extra rows for the same
    // category (e.g. a second River) via "+" in the UI, so this is a floor, not an exact count.
    waterSources: z.array(waterSourceRowSchema).min(WATER_SOURCE_TYPES.length, "All water source categories must be listed"),
    sensitiveZones: z.array(sensitiveZoneRowSchema).default([]),
    naturalResources: z.array(naturalResourceRowSchema).default([]),
    // At least one row per environmental problem category, but the officer can add extra rows
    // for the same category (e.g. two separate flood incidents with different time periods) via
    // "+" in the UI, so this is a floor, not an exact count.
    hazards: z.array(hazardRowSchema).min(HAZARD_TYPES.length, "All environmental problem categories must be listed"),
    safeLocationsIdentified: yesNo,
    safeLocations: z.array(safeLocationRowSchema).default([]),
    touristSites: z.array(touristSiteRowSchema).default([]),
    proposedTouristSites: z.array(proposedTouristSiteRowSchema).default([]),
  })
  .superRefine(requireSafeLocationWhenIdentified);

export type PhysicalEnvironmentData = z.infer<typeof physicalEnvironmentSchemaStrict>;

/* Draft-mode reuses the strict row schemas directly — a row's required fields (e.g. `zoneName`)
 * still fail validation if blank, surfacing a "required" error in the UI. Required fields (and
 * the safeLocations/hazard conditional rules above) DO block saving — SectionForm only calls
 * onSaveDraft once validation passes. Only the *array itself* is optional here, so an
 * empty/untouched directory (no rows added yet) is still a valid draft — a GN division without
 * one of these can still leave it blank. */
export const physicalEnvironmentSchemaPartial = z
  .object({
    waterSources: z.array(waterSourceRowSchema).optional(),
    sensitiveZones: z.array(sensitiveZoneRowSchema).optional(),
    naturalResources: z.array(naturalResourceRowSchema).optional(),
    hazards: z.array(hazardRowSchema).optional(),
    safeLocationsIdentified: yesNo.optional(),
    safeLocations: z.array(safeLocationRowSchema).optional(),
    touristSites: z.array(touristSiteRowSchema).optional(),
    proposedTouristSites: z.array(proposedTouristSiteRowSchema).optional(),
  })
  .superRefine(requireSafeLocationWhenIdentified);

export { HAZARD_TYPES, WATER_SOURCE_TYPES };
