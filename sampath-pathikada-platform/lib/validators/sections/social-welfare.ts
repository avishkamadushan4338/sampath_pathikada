import { z } from "zod";

/* ── §11 සමාජ සුබසාධන — Social Welfare ───────────────────────────────────── */

const ELDERS_HOME_AUTHORITY_TYPES = ["govt", "private"] as const;
const CHILDRENS_HOME_AUTHORITY_TYPES = ["govt", "ngo", "private"] as const;

export const eldersHomeRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  authority: z.enum(ELDERS_HOME_AUTHORITY_TYPES),
  residentCount: z.coerce.number().int().min(0).default(0),
});

export const childrensHomeRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  authority: z.enum(CHILDRENS_HOME_AUTHORITY_TYPES),
  residentCount: z.coerce.number().int().min(0).default(0),
});

export const socialWelfareSchemaStrict = z.object({
  welfarePaymentHouseholdCounts: z.object({
    rs2500: z.coerce.number().int().min(0).default(0),
    rs5000: z.coerce.number().int().min(0).default(0),
    rs8500: z.coerce.number().int().min(0).default(0),
    rs15000: z.coerce.number().int().min(0).default(0),
    noBenefit: z.coerce.number().int().min(0).default(0),
  }),
  allowanceRecipientCounts: z.object({
    disabilityAllowance: z.coerce.number().int().min(0).default(0),
    elderlyAllowance: z.coerce.number().int().min(0).default(0),
    nutritionAllowance: z.coerce.number().int().min(0).default(0),
    publicAssistance: z.coerce.number().int().min(0).default(0),
    sickAllowance: z.coerce.number().int().min(0).default(0),
    other: z.coerce.number().int().min(0).default(0),
  }),
  eldersHomes: z.array(eldersHomeRowSchema).default([]),
  childrensHomes: z.array(childrensHomeRowSchema).default([]),
});

export type SocialWelfareData = z.infer<typeof socialWelfareSchemaStrict>;

export const socialWelfareSchemaPartial = z.object({
  welfarePaymentHouseholdCounts: z
    .object({
      rs2500: z.coerce.number().int().min(0).optional(),
      rs5000: z.coerce.number().int().min(0).optional(),
      rs8500: z.coerce.number().int().min(0).optional(),
      rs15000: z.coerce.number().int().min(0).optional(),
      noBenefit: z.coerce.number().int().min(0).optional(),
    })
    .optional(),
  allowanceRecipientCounts: z
    .object({
      disabilityAllowance: z.coerce.number().int().min(0).optional(),
      elderlyAllowance: z.coerce.number().int().min(0).optional(),
      nutritionAllowance: z.coerce.number().int().min(0).optional(),
      publicAssistance: z.coerce.number().int().min(0).optional(),
      sickAllowance: z.coerce.number().int().min(0).optional(),
      other: z.coerce.number().int().min(0).optional(),
    })
    .optional(),
  eldersHomes: z.array(eldersHomeRowSchema.partial()).optional(),
  childrensHomes: z.array(childrensHomeRowSchema.partial()).optional(),
});

export { ELDERS_HOME_AUTHORITY_TYPES, CHILDRENS_HOME_AUTHORITY_TYPES };
