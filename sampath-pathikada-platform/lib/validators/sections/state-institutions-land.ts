import { z } from "zod";
import { nameAddressRowSchema, yesNo } from "@/lib/validators/common";

/* ── §1.5–1.7 රාජ්‍ය ආයතන හා ඉඩම් — State Institutions & Land ──────────────────────── */

export const stateInstitutionRowSchema = nameAddressRowSchema;

export const illegalStructureRowSchema = z.object({
  buildingName: z.string().min(1, "Building name is required"),
  purposeUsed: z.string().min(1, "Purpose used for is required"),
  usable: yesNo,
  owningInstitution: z.string().min(1, "Owning institution is required"),
});

export const developmentProjectRowSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  owningInstitution: z.string().min(1, "Owning institution is required"),
  reasonForHalt: z.string().min(1, "Reason for halting is required"),
  currentStatus: z.string().min(1, "Current status is required"),
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
  developmentProjects: z.array(developmentProjectRowSchema.partial()).optional(),
});

export type StateInstitutionsLandDraft = z.infer<typeof stateInstitutionsLandSchemaPartial>;
