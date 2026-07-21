import { z } from "zod";
import { phoneSchema } from "@/lib/validators/common";

/* ── §1 හඳුනාගැනීමේ මූලික තොරතුරු — Identification basic info ────────────────── */

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
});

export type IdentificationData = z.infer<typeof identificationSchemaStrict>;

/** Relaxed variant for draft saves — every field optional. */
export const identificationSchemaPartial = identificationSchemaStrict.partial();

export type IdentificationDraft = z.infer<typeof identificationSchemaPartial>;
