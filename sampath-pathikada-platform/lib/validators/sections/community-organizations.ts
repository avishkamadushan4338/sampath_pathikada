import { z } from "zod";

/* ── §12 ප්‍රජාමූල, රාජ්‍ය හා රාජ්‍ය නොවන සංවිධාන — Community/Govt/NGO Organizations ── */

const ORGANIZATION_TYPES = [
  "village-development-society",
  "youth-society",
  "sports-club",
  "funeral-aid-society",
  "womens-society",
  "elders-society",
  "childrens-society",
  "samurdhi-society",
  "friend-organization",
  "ngo-committee",
  "farmer-society",
  "religious-society",
  "sanasa-society",
  "civil-defense-committee",
  "prajashakthi-society",
] as const;

export const organizationCountRowSchema = z.object({
  type: z.enum(ORGANIZATION_TYPES),
  count: z.coerce.number().int().min(0).default(0),
});

export const organizationDirectoryRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  type: z.string().min(1, "Type is required"),
  memberCount: z.coerce.number().int().min(0).optional(),
  identifiedNeeds: z.string().optional(),
});

export const cooperativeSocietyRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
});

export const communityOrganizationsSchemaStrict = z.object({
  organizationCounts: z.array(organizationCountRowSchema).length(ORGANIZATION_TYPES.length),
  organizationDirectory: z.array(organizationDirectoryRowSchema).default([]),
  cooperativeSocieties: z.array(cooperativeSocietyRowSchema).default([]),
});

export type CommunityOrganizationsData = z.infer<typeof communityOrganizationsSchemaStrict>;

export const communityOrganizationsSchemaPartial = z.object({
  organizationCounts: z.array(organizationCountRowSchema.partial()).optional(),
  organizationDirectory: z.array(organizationDirectoryRowSchema.partial()).optional(),
  cooperativeSocieties: z.array(cooperativeSocietyRowSchema.partial()).optional(),
});

export { ORGANIZATION_TYPES };
