import { z } from "zod";

/* ── §5 රැකියා අපේක්ෂාව — Employment ──────────────────────────────────────── */

const SELF_EMPLOYMENT_SECTORS = [
  "food-production",
  "confectionery-production",
  "spice-production",
  "rice-parcel-production",
  "bakery-production",
  "garment-production",
  "dressmaking",
  "doormat-production",
  "beeralu-lace-production",
  "ornamental-items-production",
  "coconut-shell-production",
  "welding-work",
  "motor-vehicle-repair",
  "bicycle-repair",
  "masonry-work",
  "carpentry",
  "electrical-appliance-repair",
  "jewelry-production",
  "concrete-block-production",
  "cinnamon-peeling",
  "fish-related-production",
  "fishing-gear-repair",
  "fish-trade",
] as const;

const MARKETPLACES = ["local", "international"] as const;

const JOB_SEEKER_EDUCATION_LEVELS = ["vocational-training", "below-ol", "ol-pass", "al-pass", "degree-and-above"] as const;

export const jobSeekerRowSchema = z.object({
  level: z.enum(JOB_SEEKER_EDUCATION_LEVELS),
  count: z.coerce.number().int().min(0).default(0),
});

export const selfEmploymentSectorRowSchema = z.object({
  sector: z.enum(SELF_EMPLOYMENT_SECTORS),
  count: z.coerce.number().int().min(0).default(0),
});

export const selfEmployedPersonRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
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

/* Draft-mode row schema built from scratch rather than `.partial()` on the strict schema
 * above: `.partial()` only allows a field to be *missing*, it doesn't relax `min(1)`, so a row
 * added via the "Add" button (whose fields start as "") would still fail validation and
 * silently block saving. */
const selfEmployedPersonRowPartialSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  sector: z.string().optional(),
  marketplace: z.enum(MARKETPLACES).optional(),
});

export const employmentSchemaPartial = z.object({
  jobSeekersByEducation: z.array(jobSeekerRowSchema.partial()).optional(),
  vocationalTrainingOpportunityGapCount: z.coerce.number().int().min(0).optional(),
  selfEmploymentSectors: z.array(selfEmploymentSectorRowSchema.partial()).optional(),
  selfEmployedPersons: z.array(selfEmployedPersonRowPartialSchema).optional(),
});

export { SELF_EMPLOYMENT_SECTORS, MARKETPLACES, JOB_SEEKER_EDUCATION_LEVELS };
