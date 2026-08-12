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

/** `publicInformedOfSchedule`, `disposalMethodIfNoProgram`, and `proposedSolutionIfNoProgram`
 *  are each only meaningful for one specific answer to `hasWasteProgram` — the field labels say
 *  so directly ("If Yes, ...", "If There Is No Systematic Arrangement, ..."). Conditionally
 *  required via `superRefine` in whichever direction `hasWasteProgram` points, rather than
 *  always requiring all three regardless of which one actually applies. */
function requireWasteProgramFollowUps(
  data: {
    hasWasteProgram?: string;
    publicInformedOfSchedule?: string;
    disposalMethodIfNoProgram?: { present?: string }[];
    proposedSolutionIfNoProgram?: string;
  },
  ctx: z.RefinementCtx
) {
  if (data.hasWasteProgram === "yes" && !data.publicInformedOfSchedule) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["publicInformedOfSchedule"],
      message: "Required once a systematic waste arrangement is confirmed",
    });
  }
  if (data.hasWasteProgram === "no") {
    if ((data.disposalMethodIfNoProgram ?? []).length !== DISPOSAL_METHODS.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["disposalMethodIfNoProgram"],
        message: "All waste disposal method categories must be listed once there's no systematic arrangement",
      });
    }
    if (!data.proposedSolutionIfNoProgram?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["proposedSolutionIfNoProgram"],
        message: "A proposed solution is required once there's no systematic arrangement",
      });
    }
  }
}

export const wasteDisasterSchemaStrict = z
  .object({
    hasWasteProgram: yesNo,
    publicInformedOfSchedule: yesNo.optional(),
    collectionFrequency: z.enum(COLLECTION_FREQUENCIES),
    collectionMethod: z.enum(COLLECTION_METHODS),
    disposalMethodIfNoProgram: z.array(disposalMethodRowSchema).optional(),
    hasCompostOrDisposalSite: yesNo,
    proposedSolutionIfNoProgram: z.string().optional(),
  })
  .superRefine(requireWasteProgramFollowUps);

export type WasteDisasterData = z.infer<typeof wasteDisasterSchemaStrict>;

/* Draft-mode reuses the strict row schema directly — a row's required fields (e.g. `method`,
 * `present`) still fail validation if blank, surfacing a "required" error in the UI. Required
 * fields (and the hasWasteProgram follow-up rules above) DO block saving — SectionForm only
 * calls onSaveDraft once validation passes. Only the *array itself* is optional here, so a draft
 * can be saved before every fixed row has been filled in. */
export const wasteDisasterSchemaPartial = z
  .object({
    hasWasteProgram: yesNo,
    publicInformedOfSchedule: yesNo.optional(),
    collectionFrequency: z.enum(COLLECTION_FREQUENCIES),
    collectionMethod: z.enum(COLLECTION_METHODS),
    disposalMethodIfNoProgram: z.array(disposalMethodRowSchema).optional(),
    hasCompostOrDisposalSite: yesNo,
    proposedSolutionIfNoProgram: z.string().optional(),
  })
  .superRefine(requireWasteProgramFollowUps);

export { COLLECTION_FREQUENCIES, COLLECTION_METHODS, DISPOSAL_METHODS };
