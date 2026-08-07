import { z } from "zod";

/* ── §12 ප්‍රජාමූල, රාජ්‍ය හා රාජ්‍ය නොවන සංවිධාන — Community/Govt/NGO Organizations ── */
/* Field list/order matches the official "12. ප්‍රජාමූල, රාජ්‍ය හා රාජ්‍ය නොවන සංවිධාන" paper
 * form exactly: one directory table per organization type (§12.1–§12.15), plus cooperative
 * societies (§12.16), rather than a single combined directory. */

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

export const nameAddressRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
});

export const sportsClubRowSchema = z.object({
  nameAndAddress: z.string().min(1, "Name and address is required"),
  memberCount: z.coerce.number().int().min(0).default(0),
  identifiedNeeds: z.string().optional(),
});

export const cooperativeSocietyRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const communityOrganizationsSchemaStrict = z.object({
  organizationCounts: z.array(organizationCountRowSchema).length(ORGANIZATION_TYPES.length),
  villageDevelopmentSocieties: z.array(nameAddressRowSchema).default([]),
  youthSocieties: z.array(nameAddressRowSchema).default([]),
  sportsClubs: z.array(sportsClubRowSchema).default([]),
  funeralAidSocieties: z.array(nameAddressRowSchema).default([]),
  womensSocieties: z.array(nameAddressRowSchema).default([]),
  eldersSocieties: z.array(nameAddressRowSchema).default([]),
  childrensSocieties: z.array(nameAddressRowSchema).default([]),
  samurdhiSocieties: z.array(nameAddressRowSchema).default([]),
  friendOrganizations: z.array(nameAddressRowSchema).default([]),
  ngoCommittees: z.array(nameAddressRowSchema).default([]),
  farmerSocieties: z.array(nameAddressRowSchema).default([]),
  religiousSocieties: z.array(nameAddressRowSchema).default([]),
  sanasaSocieties: z.array(nameAddressRowSchema).default([]),
  civilDefenseCommittees: z.array(nameAddressRowSchema).default([]),
  prajashakthiSocieties: z.array(nameAddressRowSchema).default([]),
  cooperativeSocieties: z.array(cooperativeSocietyRowSchema).default([]),
});

export type CommunityOrganizationsData = z.infer<typeof communityOrganizationsSchemaStrict>;

/* Draft-mode row schemas built from scratch rather than `.partial()` on the strict schemas
 * above: `.partial()` only allows a field to be *missing*, it doesn't relax `min(1)`, so a row
 * added via the "Add" button (whose fields start as "") would still fail validation and
 * silently block saving. */
const nameAddressRowPartialSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
});

const sportsClubRowPartialSchema = z.object({
  nameAndAddress: z.string().optional(),
  memberCount: z.coerce.number().int().min(0).optional(),
  identifiedNeeds: z.string().optional(),
});

const cooperativeSocietyRowPartialSchema = z.object({
  name: z.string().optional(),
});

export const communityOrganizationsSchemaPartial = z.object({
  organizationCounts: z.array(organizationCountRowSchema.partial()).optional(),
  villageDevelopmentSocieties: z.array(nameAddressRowPartialSchema).optional(),
  youthSocieties: z.array(nameAddressRowPartialSchema).optional(),
  sportsClubs: z.array(sportsClubRowPartialSchema).optional(),
  funeralAidSocieties: z.array(nameAddressRowPartialSchema).optional(),
  womensSocieties: z.array(nameAddressRowPartialSchema).optional(),
  eldersSocieties: z.array(nameAddressRowPartialSchema).optional(),
  childrensSocieties: z.array(nameAddressRowPartialSchema).optional(),
  samurdhiSocieties: z.array(nameAddressRowPartialSchema).optional(),
  friendOrganizations: z.array(nameAddressRowPartialSchema).optional(),
  ngoCommittees: z.array(nameAddressRowPartialSchema).optional(),
  farmerSocieties: z.array(nameAddressRowPartialSchema).optional(),
  religiousSocieties: z.array(nameAddressRowPartialSchema).optional(),
  sanasaSocieties: z.array(nameAddressRowPartialSchema).optional(),
  civilDefenseCommittees: z.array(nameAddressRowPartialSchema).optional(),
  prajashakthiSocieties: z.array(nameAddressRowPartialSchema).optional(),
  cooperativeSocieties: z.array(cooperativeSocietyRowPartialSchema).optional(),
});

export { ORGANIZATION_TYPES };
