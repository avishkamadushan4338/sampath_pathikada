import { z } from "zod";
import { yesNo } from "@/lib/validators/common";

/* ── §7 ආගමික හා සංස්කෘතික — Religious & Cultural ─────────────────────────── */

const HERITAGE_SITE_TYPES = [
  "temple-vihara",
  "forest-hermitage",
  "asapuwa",
  "meditation-center",
  "nuns-hermitage",
  "mosque",
  "catholic-church",
  "kovil",
  "devalaya",
] as const;

export const religiousSiteCountSchema = z.object({
  count: z.coerce.number().int().min(0).default(0),
  clergyCount: z.coerce.number().int().min(0).default(0),
});

/** Catholic churches report two separate clergy figures instead of one generic count:
 *  පියතුමන්ලා (priests) and කන්‍යා සොයුරියන් (nuns/sisters). */
export const catholicChurchCountSchema = z.object({
  count: z.coerce.number().int().min(0).default(0),
  priestsCount: z.coerce.number().int().min(0).default(0),
  nunsCount: z.coerce.number().int().min(0).default(0),
});

/** `taskDescription` is only meaningful once the officer has confirmed the site is actually used
 *  for a Dhamma school or government purpose — conditionally required via `superRefine` (rather
 *  than always-required) so a site with that question answered "no", or not yet answered at all,
 *  doesn't force a description of a use that doesn't exist. */
export const heritageSiteRowSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(HERITAGE_SITE_TYPES),
    significance: z.string().min(1, "Significance is required"),
    usedForDhammaOrGovtPurpose: yesNo.optional(),
    taskDescription: z.string().optional(),
  })
  .superRefine((row, ctx) => {
    if (row.usedForDhammaOrGovtPurpose !== "yes") return;
    if (!row.taskDescription?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["taskDescription"],
        message: "Task description is required once you've indicated it's used for a Dhamma school or government purpose",
      });
    }
  });

export const artAcademyRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  registrationNumber: z.string().optional(),
  studentCount: z.coerce.number().int().min(0).default(0),
});

export const traditionalArtistRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  artForm: z.string().min(1, "Art form is required"),
  description: z.string().optional(),
});

export const religiousCulturalSchemaStrict = z.object({
  religiousSiteCounts: z.object({
    temples: religiousSiteCountSchema,
    meheniArama: religiousSiteCountSchema,
    kovils: religiousSiteCountSchema,
    mosques: religiousSiteCountSchema,
    churches: catholicChurchCountSchema,
  }),
  heritageSites: z.array(heritageSiteRowSchema).default([]),
  artAcademies: z.array(artAcademyRowSchema).default([]),
  traditionalArtists: z.array(traditionalArtistRowSchema).default([]),
});

export type ReligiousCulturalData = z.infer<typeof religiousCulturalSchemaStrict>;

export { HERITAGE_SITE_TYPES };

/* Draft-mode reuses the strict row schemas directly — a row's required fields (e.g. `name`, and
 * the taskDescription rule above) still fail validation if blank, surfacing a "required" error in
 * the UI. Required fields DO block saving — SectionForm only calls onSaveDraft once validation
 * passes. Only the *array itself* (or, for `religiousSiteCounts`, the nested objects) is optional
 * here, so an empty/untouched table is still a valid draft. */
export const religiousCulturalSchemaPartial = z.object({
  religiousSiteCounts: z
    .object({
      temples: religiousSiteCountSchema.optional(),
      meheniArama: religiousSiteCountSchema.optional(),
      kovils: religiousSiteCountSchema.optional(),
      mosques: religiousSiteCountSchema.optional(),
      churches: catholicChurchCountSchema.optional(),
    })
    .optional(),
  heritageSites: z.array(heritageSiteRowSchema).optional(),
  artAcademies: z.array(artAcademyRowSchema).optional(),
  traditionalArtists: z.array(traditionalArtistRowSchema).optional(),
});
