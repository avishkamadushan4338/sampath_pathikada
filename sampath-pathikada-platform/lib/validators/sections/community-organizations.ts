import { z } from "zod";
import { requiredCount } from "@/lib/validators/common";

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
  count: requiredCount("Society count is required"),
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

/* Draft-mode reuses the strict row schemas directly — a row's required fields (e.g. `name`,
 * `count`) still fail validation if blank, surfacing a "required" error in the UI. Required
 * fields DO block saving — SectionForm only calls onSaveDraft once validation passes. Only the
 * *array itself* is optional here, so an empty/untouched directory (no rows added yet) is still
 * a valid draft. */
export const communityOrganizationsSchemaPartial = z.object({
  organizationCounts: z.array(organizationCountRowSchema).optional(),
  villageDevelopmentSocieties: z.array(nameAddressRowSchema).optional(),
  youthSocieties: z.array(nameAddressRowSchema).optional(),
  sportsClubs: z.array(sportsClubRowSchema).optional(),
  funeralAidSocieties: z.array(nameAddressRowSchema).optional(),
  womensSocieties: z.array(nameAddressRowSchema).optional(),
  eldersSocieties: z.array(nameAddressRowSchema).optional(),
  childrensSocieties: z.array(nameAddressRowSchema).optional(),
  samurdhiSocieties: z.array(nameAddressRowSchema).optional(),
  friendOrganizations: z.array(nameAddressRowSchema).optional(),
  ngoCommittees: z.array(nameAddressRowSchema).optional(),
  farmerSocieties: z.array(nameAddressRowSchema).optional(),
  religiousSocieties: z.array(nameAddressRowSchema).optional(),
  sanasaSocieties: z.array(nameAddressRowSchema).optional(),
  civilDefenseCommittees: z.array(nameAddressRowSchema).optional(),
  prajashakthiSocieties: z.array(nameAddressRowSchema).optional(),
  cooperativeSocieties: z.array(cooperativeSocietyRowSchema).optional(),
});

export { ORGANIZATION_TYPES };
