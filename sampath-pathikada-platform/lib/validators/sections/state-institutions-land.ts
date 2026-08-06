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

/** Relaxed variant for draft saves — every field optional, rows may be partial.
 *  Built from scratch (not `.partial()` on the strict row schemas) because `.partial()`
 *  only allows a field to be *missing*; it doesn't relax the `min(1)` check, so a row
 *  added via the "Add" button (whose fields start as "") would still fail validation
 *  and silently block saving. A GN division without any of this data should be able to
 *  leave these tables empty. */
export const stateInstitutionRowPartialSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
});

export const illegalStructureRowPartialSchema = z.object({
  buildingName: z.string().optional(),
  purposeUsed: z.string().optional(),
  usable: yesNo.optional(),
  owningInstitution: z.string().optional(),
});

export const developmentProjectRowPartialSchema = z.object({
  projectName: z.string().optional(),
  owningInstitution: z.string().optional(),
  reasonForHalt: z.string().optional(),
  currentStatus: z.string().optional(),
});

export const stateInstitutionsLandSchemaPartial = z.object({
  stateInstitutions: z.array(stateInstitutionRowPartialSchema).optional(),
  illegalStructures: z.array(illegalStructureRowPartialSchema).optional(),
  developmentProjects: z.array(developmentProjectRowPartialSchema).optional(),
});

export type StateInstitutionsLandDraft = z.infer<typeof stateInstitutionsLandSchemaPartial>;
