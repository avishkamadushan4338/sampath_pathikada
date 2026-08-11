import { z } from "zod";
import { requiredCount } from "@/lib/validators/common";

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
  count: requiredCount("Person count is required"),
});

export const selfEmploymentSectorRowSchema = z.object({
  sector: z.enum(SELF_EMPLOYMENT_SECTORS),
  count: requiredCount("Person count is required"),
});

// Every field in this row is required — once the officer adds a row via "+", it must be filled
// in completely before it can be saved; there's no "fill in some of it for now" state.
export const selfEmployedPersonRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  sector: z.string().min(1, "Sector / field is required"),
  marketplace: z.enum(MARKETPLACES, { required_error: "Marketplace is required" }),
});

export const employmentSchemaStrict = z.object({
  jobSeekersByEducation: z.array(jobSeekerRowSchema).length(5),
  vocationalTrainingOpportunityGapCount: requiredCount("This count is required"),
  selfEmploymentSectors: z.array(selfEmploymentSectorRowSchema).length(SELF_EMPLOYMENT_SECTORS.length),
  selfEmployedPersons: z.array(selfEmployedPersonRowSchema).default([]),
});

export type EmploymentData = z.infer<typeof employmentSchemaStrict>;

/* Draft-mode reuses the strict row schemas directly — a row's required fields (e.g. `name`)
 * still fail validation if blank, surfacing a "required" error in the UI. Required fields DO
 * block saving — SectionForm only calls onSaveDraft once validation passes. Only the *array
 * itself* (or a top-level scalar's own key) is optional here, so an empty/untouched directory
 * (no rows added yet) is still a valid draft. */
export const employmentSchemaPartial = z.object({
  jobSeekersByEducation: z.array(jobSeekerRowSchema).optional(),
  vocationalTrainingOpportunityGapCount: requiredCount("This count is required").optional(),
  selfEmploymentSectors: z.array(selfEmploymentSectorRowSchema).optional(),
  selfEmployedPersons: z.array(selfEmployedPersonRowSchema).optional(),
});

export { SELF_EMPLOYMENT_SECTORS, MARKETPLACES, JOB_SEEKER_EDUCATION_LEVELS };
