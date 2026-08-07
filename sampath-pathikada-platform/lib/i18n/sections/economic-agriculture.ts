import type { SectionDictionary } from "@/lib/i18n/types";
import type { EconomicAgricultureData } from "@/lib/validators/sections/economic-agriculture";

export const economicAgricultureDict: SectionDictionary<keyof EconomicAgricultureData & string> = {
  title: { en: "Economic — Agriculture / Industry", si: "ආර්ථික — කෘෂිකාර්මික/කාර්මික" },
  description: {
    en: "Land use, agriculture, animal husbandry, fisheries, and industries in the division.",
    si: "වසම තුළ ඉඩම් භාවිතය, කෘෂිකර්මාන්තය, සත්ත්ව පාලනය, ධීවර කර්මාන්තය සහ කර්මාන්ත පිළිබඳ තොරතුරු.",
  },
  fields: {
    landUse: { en: "Land Use and Agricultural Information", si: "ඉඩම් පරිභෝගය හා කෘෂිකාර්මික තොරතුරු" },
    animalHusbandryCounts: {
      en: "Number of Persons Conducting Cultivation at Commercial Level",
      si: "වාණිජ මට්ටමින් වගාවන් සිදු කරන පුද්ගලයින් සංඛ්‍යාව",
    },
    animalHusbandryDirectory: {
      en: "Details of Persons Conducting Commercial-Level Cultivation",
      si: "වාණිජ මට්ටමින් වගාවන් සිදු කරන පුද්ගලයින් විස්තර",
      helpEn: "* 1. Floor Flower Cultivation 2. Protected Greenhouse Cultivation 3. Beekeeping. ** 1. Regional/Local 2. National 3. International.",
      helpSi: "*1බිම් මල් වගාව 2ආරක්ෂිත ගෘහතුල වගාව 3 මීමැසි පාලනය. **1- ප්‍රාදේශිය, 2- ජාතික ,3- ජාත්‍යන්තර",
    },
    specialEconomicActivities: {
      en: "Area-Specific / Special Economic Activities",
      si: "ප්‍රදේශයට ආවේණික / විශේෂිත ආර්ථික කටයුතු",
      helpEn:
        "* e.g. clay industry, cane industry, dairy production, jewelry production, mask production, brass industry, beeralu (lace) industry, lac industry, granite industry....",
      helpSi:
        "*(උදා:- මැටි කර්මාන්තය, වේවැල් කර්මාන්තය, කිරි නිෂ්පාදනය, රන්හාණ්ඩ නිෂ්පාදනය, වෙස්මුහුණු නිෂ්පාදනය, පිත්තල කර්මාන්තය, බීරල කර්මාන්තය, ලාක්ෂා කර්මාන්තය ,කලුගල් කර්මාන්තය....)",
    },
    abandonedPaddyLand: {
      en: "Abandoned Paddy Land Extent (Paddy Not Cultivated in the Last 5 Years) and Possible Action for This",
      si: "පුරන් කුඹුරු බිම් ප්‍රමාණය (පසුගිය අවුරුදු 5 තුල වගා නොකළ කුඹුරු) සහ ඒ සඳහා ගතහැකි ක්‍රියාමාර්ග",
    },
    agriMachinery: {
      en: "Number of Agricultural Equipment and Rice Mills Owned by Persons Engaged in Agriculture",
      si: "කෘෂිකර්මාන්තයේ යෙදෙන පුද්ගලයින් සතු කෘෂි උපකරණ හා සහල් මෝල් සංඛ්‍යාව",
    },
    forestDamage: { en: "Crop Damage Information", si: "වගා හානි පිළිබඳ තොරතුරු" },
    livestockFarms: { en: "Families Engaged in Commercial-Level Animal Husbandry", si: "වාණිජ මට්ටමින් සත්ත්ව පාලනයේ යෙදෙන පවුල් තොරතුරු" },
    industryCounts: { en: "Industry Information: Factories in the Division", si: "කර්මාන්ත තොරතුරු: කොට්ඨාසයේ පවතින කර්මාන්තශාලා" },
    industries: {
      en: "Details of Commercial-Level Industries",
      si: "වාණිජ මට්ටමින් කර්මාන්ත විස්තර",
      helpEn: "* Regional/Local, National, International.",
      helpSi: "*ප්‍රාදේශිය, ජාතික ,ජාත්‍යන්තර",
    },
    marineFisheries: { en: "Marine (Karadiya) Fisheries Industry", si: "කරදිය ධීවර කර්මාන්තය" },
    marineFisheriesSocieties: { en: "Marine Fisheries Societies in Active Status", si: "ක්‍රියාත්මක තත්ත්වයේ පවතින කරදිය ධීවර සමිති" },
    inlandFisheries: { en: "Inland (Miridiya) Fisheries Industry", si: "මිරිදිය ධීවර කර්මාන්තය" },
    inlandFisheriesSocieties: { en: "Inland Fisheries Societies in Active Status", si: "ක්‍රියාත්මක තත්ත්වයේ පවතින මිරිදිය ධීවර සමිති" },
    inlandWaterBodies: {
      en: "Tanks / Reservoirs Within the Division Used for Inland Fishing",
      si: "වසම තුළ පිහිටි මිරිදිය ධීවර කර්මාන්තය සිදු කරන වැව්/ජලාශ",
      helpEn:
        "* If water is present throughout the year mark it as Perennial, and if water is present for only a few months of the year mark it as Seasonal.",
      helpSi: "*වසර පුරාම ජලය තිබේ නම් නිතය වගයෙන් ද වසරෙන් මාස කිහිපයක් පමණක් ජලය තිබේ නම් කාලීන වගයෙන් ද සඳහන් කරන්න.",
    },
    aquacultureDirectory: { en: "Aquaculture", si: "ජල ජීවී වගාව" },
    ornamentalFishDirectory: { en: "Ornamental Fish Farming", si: "විසිතුරු මත්ස්‍ය වගාව" },
    fishLandingSitePresent: {
      en: "Are There Fish Harbors / Fish Landing Sites in the Division?",
      si: "වසම තුළ ධීවර වරායන් ,ධීවර තොටුපොළ පිහිටා තිබේද?",
    },
    fishLandingSites: {
      en: "Fish Harbors / Fish Landing Sites",
      si: "ධීවර වරායන්/ධීවර තොටුපොළ",
      helpEn: "* 1. Fish Harbor 2. Fish Landing Site. ** 1. Marine Landing Site/Harbor or 2. Inland (Freshwater) Landing Site/Harbor.",
      helpSi: "*1- ධීවර වරායන් 2-ධීවර තොටුපොළ. ** 1 කරදිය තොටුපොළ /වරාය හෝ 2 මිරිදියතොටුපොළ /වරාය",
    },
    iceProductionPresent: { en: "Are There Ice Production Factories in the Division?", si: "වසම තුළ අයිස් නිෂ්පාදනාගාර පිහිටා තිබේද?" },
    iceProductionDirectory: { en: "Ice Production Factories", si: "අයිස් නිෂ්පාදනාගාර" },
    teaEstates: {
      en: "Information About Tea Estates Located Within the Division",
      si: "වසම තුල පිහිටි තේ වතු සම්බන්ධ තොරතුරු",
      helpEn: "* 1. Government-Owned 2. Private Estate Company 3. Private.",
      helpSi: "*1-රජයට අයත් 2-පුද්ගලික වතු සමාගම 3.පුද්ගලික",
    },
  },
};
