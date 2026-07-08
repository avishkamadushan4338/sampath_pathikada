import type { SectionKey } from "@/lib/types/submission";
import type { SectionDictionary } from "@/lib/i18n/types";
import { identificationDict } from "@/lib/i18n/sections/identification";
import { physicalEnvironmentDict } from "@/lib/i18n/sections/physical-environment";
import { demographicsDict } from "@/lib/i18n/sections/demographics";
import { housingDict } from "@/lib/i18n/sections/housing";
import { employmentDict } from "@/lib/i18n/sections/employment";
import { educationDict } from "@/lib/i18n/sections/education";
import { religiousCulturalDict } from "@/lib/i18n/sections/religious-cultural";
import { healthDict } from "@/lib/i18n/sections/health";
import { economicAgricultureDict } from "@/lib/i18n/sections/economic-agriculture";
import { roadInfrastructureDict } from "@/lib/i18n/sections/road-infrastructure";
import { socialWelfareDict } from "@/lib/i18n/sections/social-welfare";
import { communityOrganizationsDict } from "@/lib/i18n/sections/community-organizations";
import { tourismDict } from "@/lib/i18n/sections/tourism";
import { wasteDisasterDict } from "@/lib/i18n/sections/waste-disaster";

/** Every section's bilingual field dictionary, keyed by SectionKey — used by SectionDetailViewer. */
export const SECTION_DICTS: Record<SectionKey, SectionDictionary<string>> = {
  identification: identificationDict,
  physicalEnvironment: physicalEnvironmentDict,
  demographics: demographicsDict,
  housing: housingDict,
  employment: employmentDict,
  education: educationDict,
  religiousCultural: religiousCulturalDict,
  health: healthDict,
  economicAgriculture: economicAgricultureDict,
  roadInfrastructure: roadInfrastructureDict,
  socialWelfare: socialWelfareDict,
  communityOrganizations: communityOrganizationsDict,
  tourism: tourismDict,
  wasteDisaster: wasteDisasterDict,
};
