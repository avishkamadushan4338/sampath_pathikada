import { z } from "zod";
import { yesNo } from "@/lib/validators/common";

/* ── §4 නිවාස තොරතුරු — Housing ────────────────────────────────────────────── */

const COMMUNITY_WATER_AUTHORITIES = ["main-ministry", "agri-ministry", "private"] as const;

export const communityWaterProjectRowSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  functional: yesNo,
  householdsServed: z.coerce.number().int().min(0).optional(),
  authority: z.enum(COMMUNITY_WATER_AUTHORITIES).optional(),
});

export const underservedAreaRowSchema = z.object({
  area: z.string().min(1, "Area name is required"),
  difficultyDescription: z.string().min(1, "Difficulty description is required"),
  households: z.coerce.number().int().min(0).default(0),
  proposal: z.string().optional(),
});

export const housingSchemaStrict = z.object({
  housingCounts: z.object({
    total: z.coerce.number().int().min(0),
    permanent: z.coerce.number().int().min(0),
    semiPermanent: z.coerce.number().int().min(0),
    nonPermanent: z.coerce.number().int().min(0),
  }),
  householdsWithoutHousing: z.coerce.number().int().min(0),
  sanitation: z.object({
    total: z.coerce.number().int().min(0),
    withoutSafeSanitation: z.coerce.number().int().min(0),
    needingAssistance: z.coerce.number().int().min(0),
  }),
  drinkingWaterSource: z.object({
    well: z.coerce.number().int().min(0),
    tubeWell: z.coerce.number().int().min(0),
    spring: z.coerce.number().int().min(0),
    pipedNational: z.coerce.number().int().min(0),
    pipedLocalGovt: z.coerce.number().int().min(0),
    pipedCommunity: z.coerce.number().int().min(0),
    tankRiverCanalOther: z.coerce.number().int().min(0),
    bottled: z.coerce.number().int().min(0),
    treated: z.coerce.number().int().min(0),
    bowser: z.coerce.number().int().min(0),
    other: z.coerce.number().int().min(0),
  }),
  underservedAreas: z.array(underservedAreaRowSchema).default([]),
  electricityAccess: z.object({
    total: z.coerce.number().int().min(0),
    withElectricity: z.coerce.number().int().min(0),
    withSolar: z.coerce.number().int().min(0),
    withoutElectricity: z.coerce.number().int().min(0),
    needingAssistance: z.coerce.number().int().min(0),
  }),
  communityWaterProjects: z.array(communityWaterProjectRowSchema).default([]),
});

export type HousingData = z.infer<typeof housingSchemaStrict>;

/* Draft-mode row schemas built from scratch rather than `.partial()` on the strict schemas
 * above: `.partial()` only allows a field to be *missing*, it doesn't relax `min(1)`, so a row
 * added via the "Add" button (whose fields start as "") would still fail validation and
 * silently block saving. A GN division without one of these should be able to leave it blank. */
const underservedAreaRowPartialSchema = z.object({
  area: z.string().optional(),
  difficultyDescription: z.string().optional(),
  households: z.coerce.number().int().min(0).optional(),
  proposal: z.string().optional(),
});

const communityWaterProjectRowPartialSchema = z.object({
  name: z.string().optional(),
  functional: yesNo.optional(),
  householdsServed: z.coerce.number().int().min(0).optional(),
  authority: z.enum(COMMUNITY_WATER_AUTHORITIES).optional(),
});

export const housingSchemaPartial = z.object({
  housingCounts: z
    .object({
      total: z.coerce.number().int().min(0).optional(),
      permanent: z.coerce.number().int().min(0).optional(),
      semiPermanent: z.coerce.number().int().min(0).optional(),
      nonPermanent: z.coerce.number().int().min(0).optional(),
    })
    .optional(),
  householdsWithoutHousing: z.coerce.number().int().min(0).optional(),
  sanitation: z
    .object({
      total: z.coerce.number().int().min(0).optional(),
      withoutSafeSanitation: z.coerce.number().int().min(0).optional(),
      needingAssistance: z.coerce.number().int().min(0).optional(),
    })
    .optional(),
  drinkingWaterSource: z
    .object({
      well: z.coerce.number().int().min(0).optional(),
      tubeWell: z.coerce.number().int().min(0).optional(),
      spring: z.coerce.number().int().min(0).optional(),
      pipedNational: z.coerce.number().int().min(0).optional(),
      pipedLocalGovt: z.coerce.number().int().min(0).optional(),
      pipedCommunity: z.coerce.number().int().min(0).optional(),
      tankRiverCanalOther: z.coerce.number().int().min(0).optional(),
      bottled: z.coerce.number().int().min(0).optional(),
      treated: z.coerce.number().int().min(0).optional(),
      bowser: z.coerce.number().int().min(0).optional(),
      other: z.coerce.number().int().min(0).optional(),
    })
    .optional(),
  underservedAreas: z.array(underservedAreaRowPartialSchema).optional(),
  electricityAccess: z
    .object({
      total: z.coerce.number().int().min(0).optional(),
      withElectricity: z.coerce.number().int().min(0).optional(),
      withSolar: z.coerce.number().int().min(0).optional(),
      withoutElectricity: z.coerce.number().int().min(0).optional(),
      needingAssistance: z.coerce.number().int().min(0).optional(),
    })
    .optional(),
  communityWaterProjects: z.array(communityWaterProjectRowPartialSchema).optional(),
});

export { COMMUNITY_WATER_AUTHORITIES };
