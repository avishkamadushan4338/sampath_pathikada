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

/* Draft-mode reuses the strict row schemas directly — a row's required fields (e.g. `name`,
 * `buildingName`) still fail validation if blank, surfacing a "required" error in the UI, but
 * that no longer blocks saving: SectionForm always saves the draft regardless of validation
 * outcome, it just shows the errors alongside. Only the *array itself* is optional here, so a
 * GN division without any of this data can still leave these tables empty. */
export const stateInstitutionsLandSchemaPartial = z.object({
  stateInstitutions: z.array(stateInstitutionRowSchema).optional(),
  illegalStructures: z.array(illegalStructureRowSchema).optional(),
  developmentProjects: z.array(developmentProjectRowSchema).optional(),
});

export type StateInstitutionsLandDraft = z.infer<typeof stateInstitutionsLandSchemaPartial>;
