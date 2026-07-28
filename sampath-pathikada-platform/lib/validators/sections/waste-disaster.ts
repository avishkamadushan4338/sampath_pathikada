import { z } from "zod";
import { yesNo } from "@/lib/validators/common";

/* ── §14 කසළ කළමණාකරණය — Waste Management ─────────────────────────────────── */
/* Folder name stays "waste-disaster" but no disaster content belongs here — that's in physical-environment. */

const COLLECTION_FREQUENCIES = ["daily", "every-other-day", "weekly", "other"] as const;
const COLLECTION_METHODS = ["mixed", "separated"] as const;
const DISPOSAL_METHODS = ["burning", "burying", "canal-or-drain-dumping", "public-dumpsite", "other"] as const;

export const disposalMethodRowSchema = z.object({
  method: z.enum(DISPOSAL_METHODS),
  present: yesNo,
});

export const wasteDisasterSchemaStrict = z.object({
  hasWasteProgram: yesNo,
  publicInformedOfSchedule: yesNo,
  collectionFrequency: z.enum(COLLECTION_FREQUENCIES),
  collectionMethod: z.enum(COLLECTION_METHODS),
  disposalMethodIfNoProgram: z.array(disposalMethodRowSchema).length(5),
  hasCompostOrDisposalSite: yesNo,
  proposedSolutionIfNoProgram: z.string().optional(),
});

export type WasteDisasterData = z.infer<typeof wasteDisasterSchemaStrict>;

export const wasteDisasterSchemaPartial = z.object({
  hasWasteProgram: yesNo.optional(),
  publicInformedOfSchedule: yesNo.optional(),
  collectionFrequency: z.enum(COLLECTION_FREQUENCIES).optional(),
  collectionMethod: z.enum(COLLECTION_METHODS).optional(),
  disposalMethodIfNoProgram: z.array(disposalMethodRowSchema.partial()).optional(),
  hasCompostOrDisposalSite: yesNo.optional(),
  proposedSolutionIfNoProgram: z.string().optional(),
});

export { COLLECTION_FREQUENCIES, COLLECTION_METHODS, DISPOSAL_METHODS };
