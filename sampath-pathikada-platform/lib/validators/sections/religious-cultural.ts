import { z } from "zod";

/* ── §7 ආගමික හා සංස්කෘතික — Religious & Cultural ─────────────────────────── */

export const religiousSiteCountSchema = z.object({
  count: z.coerce.number().int().min(0).default(0),
  clergyCount: z.coerce.number().int().min(0).default(0),
});

export const heritageSiteRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  significance: z.string().min(1, "Significance is required"),
});

export const artAcademyRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
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
    kovils: religiousSiteCountSchema,
    mosques: religiousSiteCountSchema,
    churches: religiousSiteCountSchema,
  }),
  heritageSites: z.array(heritageSiteRowSchema).default([]),
  artAcademies: z.array(artAcademyRowSchema).default([]),
  traditionalArtists: z.array(traditionalArtistRowSchema).default([]),
});

export type ReligiousCulturalData = z.infer<typeof religiousCulturalSchemaStrict>;

export const religiousCulturalSchemaPartial = z.object({
  religiousSiteCounts: z
    .object({
      temples: religiousSiteCountSchema.partial().optional(),
      kovils: religiousSiteCountSchema.partial().optional(),
      mosques: religiousSiteCountSchema.partial().optional(),
      churches: religiousSiteCountSchema.partial().optional(),
    })
    .optional(),
  heritageSites: z.array(heritageSiteRowSchema.partial()).optional(),
  artAcademies: z.array(artAcademyRowSchema.partial()).optional(),
  traditionalArtists: z.array(traditionalArtistRowSchema.partial()).optional(),
});
