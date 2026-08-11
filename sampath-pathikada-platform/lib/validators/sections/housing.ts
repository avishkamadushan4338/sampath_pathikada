import { z } from "zod";
import { yesNo, requiredCount } from "@/lib/validators/common";

/* ── §4 නිවාස තොරතුරු — Housing ────────────────────────────────────────────── */

const COMMUNITY_WATER_AUTHORITIES = ["main-ministry", "agri-ministry", "private"] as const;

// Every field in these two rows is required — once the officer adds a row via "+", it must be
// filled in completely before it can be saved; there's no "fill in some of it for now" state.
export const communityWaterProjectRowSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  functional: yesNo,
  householdsServed: requiredCount("Number of families benefiting is required"),
  authority: z.enum(COMMUNITY_WATER_AUTHORITIES, { required_error: "Ownership is required" }),
});

export const underservedAreaRowSchema = z.object({
  area: z.string().min(1, "Area name is required"),
  difficultyDescription: z.string().min(1, "Difficulty description is required"),
  households: requiredCount("Number of families is required"),
  proposal: z.string().min(1, "Proposed remedy is required"),
});

export const housingSchemaStrict = z.object({
  housingCounts: z.object({
    total: requiredCount("Total housing count is required"),
    permanent: requiredCount("Permanent housing count is required"),
    semiPermanent: requiredCount("Semi-permanent housing count is required"),
    nonPermanent: requiredCount("Non-permanent housing count is required"),
  }),
  householdsWithoutHousing: requiredCount("This count is required"),
  sanitation: z.object({
    total: requiredCount("Total housing count is required"),
    withoutSafeSanitation: requiredCount("This count is required"),
    needingAssistance: requiredCount("This count is required"),
  }),
  drinkingWaterSource: z.object({
    well: requiredCount("This count is required"),
    tubeWell: requiredCount("This count is required"),
    spring: requiredCount("This count is required"),
    pipedNational: requiredCount("This count is required"),
    pipedLocalGovt: requiredCount("This count is required"),
    pipedCommunity: requiredCount("This count is required"),
    tankRiverCanalOther: requiredCount("This count is required"),
    bottled: requiredCount("This count is required"),
    treated: requiredCount("This count is required"),
    bowser: requiredCount("This count is required"),
    other: requiredCount("This count is required"),
  }),
  underservedAreas: z.array(underservedAreaRowSchema).default([]),
  electricityAccess: z.object({
    total: requiredCount("Total housing count is required"),
    withElectricity: requiredCount("This count is required"),
    withSolar: requiredCount("This count is required"),
    withoutElectricity: requiredCount("This count is required"),
    needingAssistance: requiredCount("This count is required"),
  }),
  communityWaterProjects: z.array(communityWaterProjectRowSchema).default([]),
});

export type HousingData = z.infer<typeof housingSchemaStrict>;

/* Draft-mode reuses the strict row schemas directly — a row's required fields (e.g. `area`)
 * still fail validation if blank, surfacing a "required" error in the UI, but that no longer
 * blocks saving: SectionForm always saves the draft regardless of validation outcome, it just
 * shows the errors alongside. Only the *array itself* is optional here, so an empty/untouched
 * directory (no rows added yet) is still a valid draft. */
export const housingSchemaPartial = z.object({
  housingCounts: z
    .object({
      total: requiredCount("Total housing count is required"),
      permanent: requiredCount("Permanent housing count is required"),
      semiPermanent: requiredCount("Semi-permanent housing count is required"),
      nonPermanent: requiredCount("Non-permanent housing count is required"),
    })
    .optional(),
  householdsWithoutHousing: requiredCount("This count is required").optional(),
  sanitation: z
    .object({
      total: requiredCount("Total housing count is required"),
      withoutSafeSanitation: requiredCount("This count is required"),
      needingAssistance: requiredCount("This count is required"),
    })
    .optional(),
  drinkingWaterSource: z
    .object({
      well: requiredCount("This count is required"),
      tubeWell: requiredCount("This count is required"),
      spring: requiredCount("This count is required"),
      pipedNational: requiredCount("This count is required"),
      pipedLocalGovt: requiredCount("This count is required"),
      pipedCommunity: requiredCount("This count is required"),
      tankRiverCanalOther: requiredCount("This count is required"),
      bottled: requiredCount("This count is required"),
      treated: requiredCount("This count is required"),
      bowser: requiredCount("This count is required"),
      other: requiredCount("This count is required"),
    })
    .optional(),
  underservedAreas: z.array(underservedAreaRowSchema).optional(),
  electricityAccess: z
    .object({
      total: requiredCount("Total housing count is required"),
      withElectricity: requiredCount("This count is required"),
      withSolar: requiredCount("This count is required"),
      withoutElectricity: requiredCount("This count is required"),
      needingAssistance: requiredCount("This count is required"),
    })
    .optional(),
  communityWaterProjects: z.array(communityWaterProjectRowSchema).optional(),
});

export { COMMUNITY_WATER_AUTHORITIES };
