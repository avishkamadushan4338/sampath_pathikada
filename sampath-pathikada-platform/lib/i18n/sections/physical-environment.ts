import type { SectionDictionary } from "@/lib/i18n/types";
import type { PhysicalEnvironmentData } from "@/lib/validators/sections/physical-environment";

export const physicalEnvironmentDict: SectionDictionary<keyof PhysicalEnvironmentData & string> = {
  title: { en: "Physical & Environment", si: "භෞතික හා පාරිසරික තොරතුරු" },
  description: {
    en: "Water sources, environmentally sensitive zones, physical resources, hazards and tourist sites in the GN division.",
    si: "ග්‍රාම නිලධාරී වසම තුළ ජල මූලාශ්‍ර, පාරිසරික සංවේදී කලාප, භෞතික සම්පත්, ආපදා සහ සංචාරක ස්ථාන.",
  },
  fields: {
    waterSources: { en: "Main Water Sources in the Division", si: "කොට්ඨාසයේ තිබෙන ප්‍රධාන ජල මූලාශ්‍ර" },
    sensitiveZones: {
      en: "Environmentally Sensitive Zones / Locations",
      si: "පාරිසරික වශයෙන් සංවේදී කලාප/ස්ථාන",
      helpEn:
        "* Wetland ecosystems / zones, protected environmental areas, forests, mangroves, wildlife protected areas.",
      helpSi: "*තෙත්බිම් පරිසර පද්ධති/කලාප/සංරක්ෂිත පාරිසරික ස්ථාන/වනාන්තර/ කඩොලාන /වනජීවී සංරක්ෂිත",
    },
    naturalResources: {
      en: "Physical Resources Present in the Area",
      si: "ප්‍රදේශයේ පවතින භෞතික සම්පත්",
      helpEn: "* Indicate here any special resources uniquely identifiable in the area. E.g., graphite / clay / rock / gems.",
      helpSi: "*ප්‍රදේශවල සුවිශේෂි වශයෙන් හඳුනාගත හැකි විශේෂ සම්පත් මෙහිදී දක්වන්න. උදා- ලෙස මිනිරන්/ මැටි/ පාෂාණ/ මැණික්",
    },
    hazards: { en: "Environmental Problems & Disasters in the Area", si: "ප්‍රදේශයේ පවතින පාරිසරික ගැටළු හා ආපදාවන්" },
    safeLocationsIdentified: {
      en: "Identified Safe Location Exists? (Yes/No)",
      si: "හඳුනාගත් ආරක්ෂිත ස්ථාන ඇත/නැත",
    },
    safeLocations: {
      en: "Safe Locations / Evacuation Centers Identified During Emergency Disaster Situations",
      si: "හදිසි ආපදා අවස්ථාවකදී හඳුනාගත් ආරක්ෂිත ස්ථාන හෝ සුරක්ෂිත මධ්‍යස්ථාන",
      helpEn: "* Disasters such as landslides / floods / tsunami.",
      helpSi: "*නායයාම්/ගංවතුර/සුනාමි වැනි ආපදාවන්",
    },
    touristSites: {
      en: "Areas with Existing Tourist Attraction in the Division",
      si: "ප්‍රදේශයේ පවතින සංචාරක ආකර්ෂණය සහිත ප්‍රදේශ",
      helpEn:
        "* Tourist visitation: 1. Seasonal / Periodic 2. Year-round.\n** Government (Archaeology, Forest Conservation, Wildlife, Provincial Council, Local Government institutions) or Private.",
      helpSi: "* සංචාරකයන්ගේ පැමිණීම.1.කාලීන 2.වර්ෂය පුරා\n**රාජ්‍ය (පුරාවිද්‍යා, වන සංරක්ෂණ, වනජීවී, පළාත් සභා, පළාත් පාලන ආයතන) හෝ පුද්ගලික",
    },
    proposedTouristSites: {
      en: "Identification of New Areas with Potential to Create Tourist Attraction",
      si: "සංචාරක ආකර්ෂණය ඇතිකිරීමේ විභවතායන් සහිත නව ප්‍රදේශ හඳුනාගැනීම",
      helpEn:
        "* Government (Archaeology, Forest Conservation, Wildlife, Provincial Council, Local Government institutions) or Private.",
      helpSi: "*රාජ්‍ය (පුරාවිද්‍යා, වන සංරක්ෂණ, වනජීවී, පළාත් සභා, පළාත් පාලන ආයතන) හෝ පුද්ගලික",
    },
  },
};
