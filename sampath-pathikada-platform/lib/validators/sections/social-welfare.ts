import { z } from "zod";
import { sexCountSchema } from "@/lib/validators/common";

/* ── §11 සමාජ සුබසාධන — Social Welfare ───────────────────────────────────── */

const ELDERS_HOME_AUTHORITY_TYPES = ["govt", "private"] as const;
const CHILDRENS_HOME_TYPES = ["childrens-home", "certified-school", "probation-home", "detention-home"] as const;
const CHILDRENS_HOME_AUTHORITY_TYPES = ["govt", "private"] as const;

export const eldersHomeRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  authority: z.enum(ELDERS_HOME_AUTHORITY_TYPES),
  phone: z.string().optional(),
  infrastructureNeeds: z.string().optional(),
  capacity: z.coerce.number().int().min(0).default(0),
  residentCount: sexCountSchema,
});

export const childrensHomeRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  authority: z.enum(CHILDRENS_HOME_AUTHORITY_TYPES),
  type: z.enum(CHILDRENS_HOME_TYPES),
  capacity: z.coerce.number().int().min(0).default(0),
  residentCount: sexCountSchema,
});

export const socialWelfareSchemaStrict = z.object({
  welfarePaymentHouseholdCounts: z.object({
    rs2500: z.coerce.number().int().min(0).default(0),
    rs5000: z.coerce.number().int().min(0).default(0),
    rs8500: z.coerce.number().int().min(0).default(0),
    rs15000: z.coerce.number().int().min(0).default(0),
    totalAswesumaRecipients: z.coerce.number().int().min(0).default(0),
  }),
  allowanceRecipientCounts: z.object({
    disabilityAllowance: z.coerce.number().int().min(0).default(0),
    elderlyAllowance: z.coerce.number().int().min(0).default(0),
    nutritionAllowance: z.coerce.number().int().min(0).default(0),
    publicAssistance: z.coerce.number().int().min(0).default(0),
    diseaseAidWheelchair: z.coerce.number().int().min(0).default(0),
    diseaseAidCancer: z.coerce.number().int().min(0).default(0),
    diseaseAidThalassemia: z.coerce.number().int().min(0).default(0),
    diseaseAidDiabetes: z.coerce.number().int().min(0).default(0),
    other: z.coerce.number().int().min(0).default(0),
  }),
  eldersHomes: z.array(eldersHomeRowSchema).default([]),
  childrensHomes: z.array(childrensHomeRowSchema).default([]),
});

export type SocialWelfareData = z.infer<typeof socialWelfareSchemaStrict>;

/* Draft-mode reuses the strict row schemas directly — a row's required fields (e.g. `name`)
 * still fail validation if blank, surfacing a "required" error in the UI, but that no longer
 * blocks saving: SectionForm always saves the draft regardless of validation outcome, it just
 * shows the errors alongside. Only the *array itself* is optional here, so an empty/untouched
 * directory (no rows added yet) is still a valid draft. */
export const socialWelfareSchemaPartial = z.object({
  welfarePaymentHouseholdCounts: z
    .object({
      rs2500: z.coerce.number().int().min(0).optional(),
      rs5000: z.coerce.number().int().min(0).optional(),
      rs8500: z.coerce.number().int().min(0).optional(),
      rs15000: z.coerce.number().int().min(0).optional(),
      totalAswesumaRecipients: z.coerce.number().int().min(0).optional(),
    })
    .optional(),
  allowanceRecipientCounts: z
    .object({
      disabilityAllowance: z.coerce.number().int().min(0).optional(),
      elderlyAllowance: z.coerce.number().int().min(0).optional(),
      nutritionAllowance: z.coerce.number().int().min(0).optional(),
      publicAssistance: z.coerce.number().int().min(0).optional(),
      diseaseAidWheelchair: z.coerce.number().int().min(0).optional(),
      diseaseAidCancer: z.coerce.number().int().min(0).optional(),
      diseaseAidThalassemia: z.coerce.number().int().min(0).optional(),
      diseaseAidDiabetes: z.coerce.number().int().min(0).optional(),
      other: z.coerce.number().int().min(0).optional(),
    })
    .optional(),
  eldersHomes: z.array(eldersHomeRowSchema).optional(),
  childrensHomes: z.array(childrensHomeRowSchema).optional(),
});

export { ELDERS_HOME_AUTHORITY_TYPES, CHILDRENS_HOME_TYPES, CHILDRENS_HOME_AUTHORITY_TYPES };
