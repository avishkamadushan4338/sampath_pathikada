import { z } from "zod";
import { sexCountSchema, sexCountPartialSchema } from "@/lib/validators/common";

/* ── §3 ජනගහන තොරතුරු — Demographics ──────────────────────────────────────── */

const AGE_BANDS = ["0-4", "5-14", "15-59", "60-80", "80+"] as const;
const ETHNICITIES = ["sinhala", "tamil", "muslim", "malay", "burgher", "other"] as const;
const RELIGIONS = ["buddhist", "hindu", "islam", "catholic", "other"] as const;
const DISABILITY_TYPES = [
  "mentalIllness",
  "intellectualDisability",
  "speechImpairment",
  "hearingImpairment",
  "visualImpairment",
  "physicalMobility",
  "multipleDisability",
] as const;

export const ageSexRowSchema = z.object({ band: z.enum(AGE_BANDS), ...sexCountSchema.shape });
export const ethnicityRowSchema = z.object({ ethnicity: z.enum(ETHNICITIES), ...sexCountSchema.shape });
export const religionRowSchema = z.object({ religion: z.enum(RELIGIONS), ...sexCountSchema.shape });

export const disabilityRowSchema = z.object({
  type: z.enum(DISABILITY_TYPES),
  under18: sexCountSchema,
  over18: sexCountSchema,
});

export const demographicsSchemaStrict = z.object({
  populationByAge: z.array(ageSexRowSchema).length(AGE_BANDS.length),
  populationByEthnicity: z.array(ethnicityRowSchema).length(ETHNICITIES.length),
  populationByReligion: z.array(religionRowSchema).length(RELIGIONS.length),
  foreignNationals: z.object({ female: z.coerce.number().int().min(0), male: z.coerce.number().int().min(0) }),
  households: z.object({
    total: z.coerce.number().int().min(0),
    femaleHeaded: z.coerce.number().int().min(0),
    displaced: z.coerce.number().int().min(0),
  }),
  disabilities: z.array(disabilityRowSchema).length(DISABILITY_TYPES.length),
  registeredVoters: sexCountSchema,
});

export type DemographicsData = z.infer<typeof demographicsSchemaStrict>;

export const demographicsSchemaPartial = z.object({
  populationByAge: z.array(z.object({ band: z.enum(AGE_BANDS).optional(), ...sexCountPartialSchema.shape })).optional(),
  populationByEthnicity: z.array(z.object({ ethnicity: z.enum(ETHNICITIES).optional(), ...sexCountPartialSchema.shape })).optional(),
  populationByReligion: z.array(z.object({ religion: z.enum(RELIGIONS).optional(), ...sexCountPartialSchema.shape })).optional(),
  foreignNationals: z.object({ female: z.coerce.number().int().min(0).optional(), male: z.coerce.number().int().min(0).optional() }).optional(),
  households: z
    .object({
      total: z.coerce.number().int().min(0).optional(),
      femaleHeaded: z.coerce.number().int().min(0).optional(),
      displaced: z.coerce.number().int().min(0).optional(),
    })
    .optional(),
  disabilities: z
    .array(z.object({ type: z.enum(DISABILITY_TYPES).optional(), under18: sexCountPartialSchema.optional(), over18: sexCountPartialSchema.optional() }))
    .optional(),
  registeredVoters: sexCountPartialSchema.optional(),
});

export { AGE_BANDS, ETHNICITIES, RELIGIONS, DISABILITY_TYPES };
