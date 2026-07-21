import type { z } from "zod";
import type { SectionKey } from "@/lib/types/submission";

import { identificationSchemaStrict, identificationSchemaPartial } from "@/lib/validators/sections/identification";
import { stateInstitutionsLandSchemaStrict, stateInstitutionsLandSchemaPartial } from "@/lib/validators/sections/state-institutions-land";
import { physicalEnvironmentSchemaStrict, physicalEnvironmentSchemaPartial } from "@/lib/validators/sections/physical-environment";
import { demographicsSchemaStrict, demographicsSchemaPartial } from "@/lib/validators/sections/demographics";
import { housingSchemaStrict, housingSchemaPartial } from "@/lib/validators/sections/housing";
import { employmentSchemaStrict, employmentSchemaPartial } from "@/lib/validators/sections/employment";
import { educationSchemaStrict, educationSchemaPartial } from "@/lib/validators/sections/education";
import { religiousCulturalSchemaStrict, religiousCulturalSchemaPartial } from "@/lib/validators/sections/religious-cultural";
import { healthSchemaStrict, healthSchemaPartial } from "@/lib/validators/sections/health";
import { economicAgricultureSchemaStrict, economicAgricultureSchemaPartial } from "@/lib/validators/sections/economic-agriculture";
import { roadInfrastructureSchemaStrict, roadInfrastructureSchemaPartial } from "@/lib/validators/sections/road-infrastructure";
import { socialWelfareSchemaStrict, socialWelfareSchemaPartial } from "@/lib/validators/sections/social-welfare";
import { communityOrganizationsSchemaStrict, communityOrganizationsSchemaPartial } from "@/lib/validators/sections/community-organizations";
import { tourismSchemaStrict, tourismSchemaPartial } from "@/lib/validators/sections/tourism";
import { wasteDisasterSchemaStrict, wasteDisasterSchemaPartial } from "@/lib/validators/sections/waste-disaster";

export const SECTION_STRICT_SCHEMAS: Record<SectionKey, z.ZodTypeAny> = {
  identification: identificationSchemaStrict,
  stateInstitutionsLand: stateInstitutionsLandSchemaStrict,
  physicalEnvironment: physicalEnvironmentSchemaStrict,
  demographics: demographicsSchemaStrict,
  housing: housingSchemaStrict,
  employment: employmentSchemaStrict,
  education: educationSchemaStrict,
  religiousCultural: religiousCulturalSchemaStrict,
  health: healthSchemaStrict,
  economicAgriculture: economicAgricultureSchemaStrict,
  roadInfrastructure: roadInfrastructureSchemaStrict,
  socialWelfare: socialWelfareSchemaStrict,
  communityOrganizations: communityOrganizationsSchemaStrict,
  tourism: tourismSchemaStrict,
  wasteDisaster: wasteDisasterSchemaStrict,
};

export const SECTION_PARTIAL_SCHEMAS: Record<SectionKey, z.ZodTypeAny> = {
  identification: identificationSchemaPartial,
  stateInstitutionsLand: stateInstitutionsLandSchemaPartial,
  physicalEnvironment: physicalEnvironmentSchemaPartial,
  demographics: demographicsSchemaPartial,
  housing: housingSchemaPartial,
  employment: employmentSchemaPartial,
  education: educationSchemaPartial,
  religiousCultural: religiousCulturalSchemaPartial,
  health: healthSchemaPartial,
  economicAgriculture: economicAgricultureSchemaPartial,
  roadInfrastructure: roadInfrastructureSchemaPartial,
  socialWelfare: socialWelfareSchemaPartial,
  communityOrganizations: communityOrganizationsSchemaPartial,
  tourism: tourismSchemaPartial,
  wasteDisaster: wasteDisasterSchemaPartial,
};

export function getSectionStrictSchema(key: SectionKey): z.ZodTypeAny {
  return SECTION_STRICT_SCHEMAS[key];
}

export function getSectionPartialSchema(key: SectionKey): z.ZodTypeAny {
  return SECTION_PARTIAL_SCHEMAS[key];
}
