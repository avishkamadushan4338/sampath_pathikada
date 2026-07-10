import { z } from "zod";
import { nameAddressRowSchema } from "@/lib/validators/common";

/* ── §2 රාජ්‍ය ආයතන හා ඉඩම් — State Institutions & Land ──────────────────────── */

export const stateInstitutionRowSchema = nameAddressRowSchema;

export const illegalStructureRowSchema = z.object({
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
});

export const developmentProjectRowSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  status: z.enum(["ongoing", "new"]),
  location: z.string().min(1, "Location is required"),
});

export const stateInstitutionsLandSchemaStrict = z.object({
  stateInstitutions: z.array(stateInstitutionRowSchema).default([]),
  illegalStructures: z.array(illegalStructureRowSchema).default([]),
  developmentProjects: z.array(developmentProjectRowSchema).default([]),
});

export type StateInstitutionsLandData = z.infer<typeof stateInstitutionsLandSchemaStrict>;

/** Relaxed variant for draft saves — every field optional, rows may be partial. */
export const stateInstitutionsLandSchemaPartial = z.object({
  stateInstitutions: z.array(stateInstitutionRowSchema.partial()).optional(),
  illegalStructures: z.array(illegalStructureRowSchema.partial()).optional(),
  developmentProjects: z
    .array(
      z.object({
        name: z.string().optional(),
        status: z.enum(["ongoing", "new"]).optional(),
        location: z.string().optional(),
      })
    )
    .optional(),
});

export type StateInstitutionsLandDraft = z.infer<typeof stateInstitutionsLandSchemaPartial>;
