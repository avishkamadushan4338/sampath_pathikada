import { z } from "zod";
import { nameAddressPhoneRowSchema } from "@/lib/validators/common";

/* ── §5 රැකියා අපේක්ෂාව — Employment ──────────────────────────────────────── */

const SELF_EMPLOYMENT_SECTORS = [
  "food-production",
  "confectionery",
  "furniture-production",
  "textile-production",
  "bakery-production",
  "knitting",
  "garment-sewing",
  "cleaning-products",
  "beverage-juice",
  "decorative-items",
  "coconut-shell-crafts",
  "masonry-work",
  "auto-mechanic",
  "footwear-repair",
  "welding-shop",
  "carpentry",
  "electrical-appliance-repair",
  "cosmetics-production",
  "floriculture",
  "brick-making",
  "seafood-processing",
  "traditional-boat-building",
  "fish-transport-other",
] as const;

export const jobSeekerRowSchema = z.object({
  label: z.string().min(1),
  count: z.coerce.number().int().min(0).default(0),
});

export const selfEmploymentSectorRowSchema = z.object({
  label: z.string().min(1),
  count: z.coerce.number().int().min(0).default(0),
});

export const selfEmployedPersonRowSchema = nameAddressPhoneRowSchema.extend({
  sector: z.string().min(1, "Sector / field is required"),
});

export const employmentSchemaStrict = z.object({
  jobSeekersByEducation: z.array(jobSeekerRowSchema).length(5),
  jobSeekersUnwillingBelowQualificationCount: z.coerce.number().int().min(0).default(0),
  selfEmploymentSectors: z.array(selfEmploymentSectorRowSchema).length(SELF_EMPLOYMENT_SECTORS.length),
  selfEmployedPersons: z.array(selfEmployedPersonRowSchema).default([]),
});

export type EmploymentData = z.infer<typeof employmentSchemaStrict>;

export const employmentSchemaPartial = z.object({
  jobSeekersByEducation: z.array(jobSeekerRowSchema.partial()).optional(),
  jobSeekersUnwillingBelowQualificationCount: z.coerce.number().int().min(0).optional(),
  selfEmploymentSectors: z.array(selfEmploymentSectorRowSchema.partial()).optional(),
  selfEmployedPersons: z.array(selfEmployedPersonRowSchema.partial()).optional(),
});

export { SELF_EMPLOYMENT_SECTORS };
