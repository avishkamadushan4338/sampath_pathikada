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

export const heritageSiteRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(HERITAGE_SITE_TYPES),
  significance: z.string().min(1, "Significance is required"),
  usedForDhammaOrGovtPurpose: yesNo.optional(),
  taskDescription: z.string().optional(),
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

export const religiousCulturalSchemaPartial = z.object({
  religiousSiteCounts: z
    .object({
      temples: religiousSiteCountSchema.partial().optional(),
      meheniArama: religiousSiteCountSchema.partial().optional(),
      kovils: religiousSiteCountSchema.partial().optional(),
      mosques: religiousSiteCountSchema.partial().optional(),
      churches: catholicChurchCountSchema.partial().optional(),
    })
    .optional(),
  heritageSites: z.array(heritageSiteRowSchema.partial()).optional(),
  artAcademies: z.array(artAcademyRowSchema.partial()).optional(),
  traditionalArtists: z.array(traditionalArtistRowSchema.partial()).optional(),
});
