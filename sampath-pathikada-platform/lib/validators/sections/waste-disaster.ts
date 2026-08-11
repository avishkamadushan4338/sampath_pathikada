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

/* Draft-mode reuses the strict row schema directly — a row's required fields (e.g. `method`,
 * `present`) still fail validation if blank, surfacing a "required" error in the UI, but that no
 * longer blocks saving: SectionForm always saves the draft regardless of validation outcome, it
 * just shows the errors alongside. Only the *array itself* is optional here (and its `.length(5)`
 * constraint dropped), so a draft can be saved before every fixed row has been filled in. */
export const wasteDisasterSchemaPartial = z.object({
  hasWasteProgram: yesNo,
  publicInformedOfSchedule: yesNo,
  collectionFrequency: z.enum(COLLECTION_FREQUENCIES),
  collectionMethod: z.enum(COLLECTION_METHODS),
  disposalMethodIfNoProgram: z.array(disposalMethodRowSchema).optional(),
  hasCompostOrDisposalSite: yesNo,
  proposedSolutionIfNoProgram: z.string().optional(),
});

export { COLLECTION_FREQUENCIES, COLLECTION_METHODS, DISPOSAL_METHODS };
