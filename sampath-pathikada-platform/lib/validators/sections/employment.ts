import { z } from "zod";
import { nameAddressPhoneRowSchema } from "@/lib/validators/common";

/* ── §5 රැකියා අපේක්ෂාව — Employment ──────────────────────────────────────── */

const SELF_EMPLOYMENT_SECTORS = [
  "food-production",
  "confectionery-production",
  "spice-production",
  "rice-parcel-production",
  "bakery-production",
  "garment-knitwear-production",
  "dressmaking",
  "cleaning-products-production",
  "beverage-soda-production",
  "decorative-items-production",
  "coconut-shell-production",
  "masonry-work",
  "motor-vehicle-repair",
  "bicycle-repair",
  "traditional-craft-work",
  "carpentry",
  "electrical-appliance-repair",
  "jewelry-production",
  "floriculture-production",
  "cinnamon-peeling",
  "fish-related-production",
  "fishing-gear-repair",
  "fish-trade",
] as const;

const MARKETPLACES = ["local", "national", "international"] as const;

const JOB_SEEKER_EDUCATION_LEVELS = ["vocational-training", "below-ol", "ol-pass", "al-pass", "degree-and-above"] as const;

export const jobSeekerRowSchema = z.object({
  level: z.enum(JOB_SEEKER_EDUCATION_LEVELS),
  count: z.coerce.number().int().min(0).default(0),
});

export const selfEmploymentSectorRowSchema = z.object({
  sector: z.enum(SELF_EMPLOYMENT_SECTORS),
  count: z.coerce.number().int().min(0).default(0),
});

export const selfEmployedPersonRowSchema = nameAddressPhoneRowSchema.extend({
  sector: z.string().min(1, "Sector / field is required"),
  marketplace: z.enum(MARKETPLACES).optional(),
});

export const employmentSchemaStrict = z.object({
  jobSeekersByEducation: z.array(jobSeekerRowSchema).length(5),
  vocationalTrainingOpportunityGapCount: z.coerce.number().int().min(0).default(0),
  selfEmploymentSectors: z.array(selfEmploymentSectorRowSchema).length(SELF_EMPLOYMENT_SECTORS.length),
  selfEmployedPersons: z.array(selfEmployedPersonRowSchema).default([]),
});

export type EmploymentData = z.infer<typeof employmentSchemaStrict>;

export const employmentSchemaPartial = z.object({
  jobSeekersByEducation: z.array(jobSeekerRowSchema.partial()).optional(),
  vocationalTrainingOpportunityGapCount: z.coerce.number().int().min(0).optional(),
  selfEmploymentSectors: z.array(selfEmploymentSectorRowSchema.partial()).optional(),
  selfEmployedPersons: z.array(selfEmployedPersonRowSchema.partial()).optional(),
});

export { SELF_EMPLOYMENT_SECTORS, MARKETPLACES, JOB_SEEKER_EDUCATION_LEVELS };
