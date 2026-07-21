import type { SectionDictionary } from "@/lib/i18n/types";
import type { PhysicalEnvironmentData } from "@/lib/validators/sections/physical-environment";

export const physicalEnvironmentDict: SectionDictionary<keyof PhysicalEnvironmentData & string> = {
  title: { en: "Physical & Environment", si: "භෞතික හා පාරිසරික තොරතුරු" },
  description: {
    en: "Water sources, environmentally sensitive zones, natural resources, hazards and tourist sites in the GN division.",
    si: "ග්‍රාම නිලධාරී වසම තුළ ජල මූලාශ්‍ර, පාරිසරික සංවේදී කලාප, ස්වාභාවික සම්පත්, ආපදා සහ සංචාරක ස්ථාන.",
  },
  fields: {
    waterSources: { en: "Water Sources", si: "ජල මූලාශ්‍ර" },
    sensitiveZones: { en: "Environmentally Sensitive Zones", si: "පාරිසරික වශයෙන් සංවේදී කලාප" },
    naturalResources: { en: "Natural Resources", si: "ස්වාභාවික සම්පත්" },
    hazards: { en: "Natural / Other Hazards", si: "ස්වාභාවික/අනෙකුත් ආපදා" },
    safeLocations: { en: "Safe Locations / Evacuation Centers", si: "ආරක්ෂිත ස්ථාන / ඉවත් කිරීමේ මධ්‍යස්ථාන" },
    touristSites: { en: "Existing Tourist Sites", si: "පවතින සංචාරක ආකර්ෂණීය ස්ථාන" },
    proposedTouristSites: { en: "Proposed Tourist Sites", si: "යෝජිත සංචාරක ආකර්ෂණීය ස්ථාන" },
  },
};
