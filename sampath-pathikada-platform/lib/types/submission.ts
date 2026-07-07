import type { IdentificationData } from "@/lib/validators/sections/identification";
import type { PhysicalEnvironmentData } from "@/lib/validators/sections/physical-environment";
import type { DemographicsData } from "@/lib/validators/sections/demographics";
import type { HousingData } from "@/lib/validators/sections/housing";
import type { EmploymentData } from "@/lib/validators/sections/employment";
import type { EducationData } from "@/lib/validators/sections/education";
import type { ReligiousCulturalData } from "@/lib/validators/sections/religious-cultural";
import type { HealthData } from "@/lib/validators/sections/health";
import type { EconomicAgricultureData } from "@/lib/validators/sections/economic-agriculture";
import type { RoadInfrastructureData } from "@/lib/validators/sections/road-infrastructure";
import type { SocialWelfareData } from "@/lib/validators/sections/social-welfare";
import type { CommunityOrganizationsData } from "@/lib/validators/sections/community-organizations";
import type { TourismData } from "@/lib/validators/sections/tourism";
import type { WasteDisasterData } from "@/lib/validators/sections/waste-disaster";

/**
 * Every key is optional because a Submission starts as an empty draft
 * (`data: {}`) and sections are filled in independently, in any order.
 */
export interface SubmissionData {
  identification?: IdentificationData;
  physicalEnvironment?: PhysicalEnvironmentData;
  demographics?: DemographicsData;
  housing?: HousingData;
  employment?: EmploymentData;
  education?: EducationData;
  religiousCultural?: ReligiousCulturalData;
  health?: HealthData;
  economicAgriculture?: EconomicAgricultureData;
  roadInfrastructure?: RoadInfrastructureData;
  socialWelfare?: SocialWelfareData;
  communityOrganizations?: CommunityOrganizationsData;
  tourism?: TourismData;
  wasteDisaster?: WasteDisasterData;
}

/** PDF numeric order — used for dashboard/sidebar ordering, not alphabetical. */
export const SECTION_KEYS = [
  "identification",
  "physicalEnvironment",
  "demographics",
  "housing",
  "employment",
  "education",
  "religiousCultural",
  "health",
  "economicAgriculture",
  "roadInfrastructure",
  "socialWelfare",
  "communityOrganizations",
  "tourism",
  "wasteDisaster",
] as const satisfies readonly (keyof SubmissionData)[];

export type SectionKey = (typeof SECTION_KEYS)[number];

/** Route slug for each section — matches the existing entry/ folder names. */
export const SECTION_ROUTES: Record<SectionKey, string> = {
  identification: "identification",
  physicalEnvironment: "physical-environment",
  demographics: "demographics",
  housing: "housing",
  employment: "employment",
  education: "education",
  religiousCultural: "religious-cultural",
  health: "health",
  economicAgriculture: "economic-agriculture",
  roadInfrastructure: "road-infrastructure",
  socialWelfare: "social-welfare",
  communityOrganizations: "community-organizations",
  tourism: "tourism",
  wasteDisaster: "waste-disaster",
};

export function isSectionKey(value: string): value is SectionKey {
  return (SECTION_KEYS as readonly string[]).includes(value);
}
