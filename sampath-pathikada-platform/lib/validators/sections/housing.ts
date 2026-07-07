import { z } from "zod";

/* ── §4 නිවාස තොරතුරු — Housing ────────────────────────────────────────────── */

export const communityWaterProjectRowSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  status: z.string().optional(),
  householdsServed: z.coerce.number().int().min(0).optional(),
  authority: z.string().optional(),
});

export const underservedAreaRowSchema = z.object({
  area: z.string().min(1, "Area name is required"),
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
    pipedNational: z.coerce.number().int().min(0),
    pipedRural: z.coerce.number().int().min(0),
    protectedWell: z.coerce.number().int().min(0),
    unprotectedWell: z.coerce.number().int().min(0),
    tubeWell: z.coerce.number().int().min(0),
    riverCanalTank: z.coerce.number().int().min(0),
    bottledOther: z.coerce.number().int().min(0),
  }),
  underservedAreas: z.array(underservedAreaRowSchema).default([]),
  electricityAccessPercent: z.coerce.number().min(0).max(100),
  communityWaterProjects: z.array(communityWaterProjectRowSchema).default([]),
});

export type HousingData = z.infer<typeof housingSchemaStrict>;

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
      pipedNational: z.coerce.number().int().min(0).optional(),
      pipedRural: z.coerce.number().int().min(0).optional(),
      protectedWell: z.coerce.number().int().min(0).optional(),
      unprotectedWell: z.coerce.number().int().min(0).optional(),
      tubeWell: z.coerce.number().int().min(0).optional(),
      riverCanalTank: z.coerce.number().int().min(0).optional(),
      bottledOther: z.coerce.number().int().min(0).optional(),
    })
    .optional(),
  underservedAreas: z.array(underservedAreaRowSchema.partial()).optional(),
  electricityAccessPercent: z.coerce.number().min(0).max(100).optional(),
  communityWaterProjects: z.array(communityWaterProjectRowSchema.partial()).optional(),
});
