import { z } from "zod";
import { nameAddressRowSchema, phoneSchema } from "@/lib/validators/common";

/* ── §1 හඳුනාගැනීමේ මූලික තොරතුරු — Identification basic info ────────────────── */

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

export const identificationSchemaStrict = z.object({
  gnDivisionName: z.string().min(1, "GN division name is required"),
  gnDivisionNumber: z.string().min(1, "GN division number is required"),
  officerName: z.string().min(1, "Officer name is required"),
  officerDesignation: z.string().min(1, "Designation is required"),
  officerPhone: phoneSchema,

  district: z.string().min(1, "District is required"),
  dsDivision: z.string().min(1, "Divisional Secretariat is required"),
  gnDivision: z.string().min(1, "GN division is required"),

  localGovt: z.string().min(1, "Local government body is required"),
  electoral: z.string().min(1, "Electoral / polling division is required"),
  farmers: z.string().min(1, "Farmers' service center is required"),
  eduZone: z.string().min(1, "Education zone is required"),
  eduDiv: z.string().min(1, "Education division is required"),
  mahaweli: z.string().optional(),

  stateInstitutions: z.array(stateInstitutionRowSchema).default([]),
  illegalStructures: z.array(illegalStructureRowSchema).default([]),
  developmentProjects: z.array(developmentProjectRowSchema).default([]),
});

export type IdentificationData = z.infer<typeof identificationSchemaStrict>;

/** Relaxed variant for draft saves — every field optional, rows may be partial. */
export const identificationSchemaPartial = identificationSchemaStrict.partial().extend({
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

export type IdentificationDraft = z.infer<typeof identificationSchemaPartial>;
