import { z } from "zod";
import { yesNo } from "@/lib/validators/common";

/* ── §14 කසළ කළමණාකරණය — Waste Management ─────────────────────────────────── */
/* Folder name stays "waste-disaster" but no disaster content belongs here — that's in physical-environment. */

export const disposalMethodRowSchema = z.object({
  label: z.string().min(1),
  present: yesNo,
});

export const wasteDisasterSchemaStrict = z.object({
  hasWasteProgram: yesNo,
  publicInformedOfSchedule: yesNo,
  collectionFrequency: z.string().min(1, "Collection frequency is required"),
  collectionMethod: z.string().min(1, "Collection method is required"),
  disposalMethodIfNoProgram: z.array(disposalMethodRowSchema).length(5),
  hasCompostOrDisposalSite: yesNo,
  proposedSolutionIfNoProgram: z.string().optional(),
});

export type WasteDisasterData = z.infer<typeof wasteDisasterSchemaStrict>;

export const wasteDisasterSchemaPartial = z.object({
  hasWasteProgram: yesNo.optional(),
  publicInformedOfSchedule: yesNo.optional(),
  collectionFrequency: z.string().optional(),
  collectionMethod: z.string().optional(),
  disposalMethodIfNoProgram: z.array(disposalMethodRowSchema.partial()).optional(),
  hasCompostOrDisposalSite: yesNo.optional(),
  proposedSolutionIfNoProgram: z.string().optional(),
});
