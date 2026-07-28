import type { SectionDictionary } from "@/lib/i18n/types";
import type { EconomicAgricultureData } from "@/lib/validators/sections/economic-agriculture";

export const economicAgricultureDict: SectionDictionary<keyof EconomicAgricultureData & string> = {
  title: { en: "Economic — Agriculture / Industry", si: "ආර්ථික — කෘෂිකාර්මික/කාර්මික" },
  description: {
    en: "Land use, agriculture, animal husbandry, fisheries, and industries in the division.",
    si: "වසම තුළ ඉඩම් භාවිතය, කෘෂිකර්මාන්තය, සත්ත්ව පාලනය, ධීවර කර්මාන්තය සහ කර්මාන්ත පිළිබඳ තොරතුරු.",
  },
  fields: {
    landUse: { en: "Land Use", si: "ඉඩම් භාවිතය හා කෘෂිකාර්මික තොරතුරු" },
    animalHusbandryCounts: {
      en: "Commercial Cultivation (Flowers / Greenhouse / Beekeeping)",
      si: "වාණිජ මට්ටමින් වගාවන් සිදු කරන පුද්ගලයින් සංඛ්‍යාව",
    },
    animalHusbandryDirectory: {
      en: "Commercial Cultivation Directory",
      si: "වගාවන් සිදු කරන පුද්ගලයින් විස්තර",
    },
    specialEconomicActivities: { en: "Area-Specific / Special Economic Activities", si: "ප්‍රදේශයට ආවේණික / විශේෂිත ආර්ථික කටයුතු" },
    abandonedPaddyLand: { en: "Abandoned Paddy Land (Last 5 Years)", si: "පුරන් කුඹුරු බිම් ප්‍රමාණය" },
    agriMachinery: { en: "Agricultural Machinery & Equipment", si: "කෘෂිකාර්මික උපකරණ හා යන්ත්‍රෝපකරණ" },
    forestDamage: { en: "Crop / Forest Damage", si: "වගා හානි පිළිබඳ තොරතුරු" },
    livestockFarms: { en: "Commercial Livestock Farms", si: "වාණිජ මට්ටමින් සත්ත්ව පාලනයේ යෙදෙන පවුල්" },
    industryCounts: { en: "Industry Counts", si: "කර්මාන්ත ගණන් (ගෘහස්ථ/සේවක 5ට අඩු/සේවක 5ට වැඩි)" },
    industries: { en: "Industry Directory", si: "කර්මාන්ත විස්තර" },
    marineFisheries: { en: "Marine Fisheries", si: "මුහුදු ධීවර කර්මාන්තය" },
    marineFisheriesSocieties: { en: "Marine Fisheries Societies", si: "මුහුදු ධීවර සමිති" },
    inlandFisheries: { en: "Inland Fisheries", si: "අභ්‍යන්තර ධීවර කර්මාන්තය" },
    inlandFisheriesSocieties: { en: "Inland Fisheries Societies", si: "අභ්‍යන්තර ධීවර සමිති" },
    inlandWaterBodies: { en: "Water Bodies Used for Inland Fishing", si: "අභ්‍යන්තර ධීවර කර්මාන්තය සිදුකරන වැව්/ජලාශ" },
    aquacultureDirectory: { en: "Aquaculture Directory", si: "ජලජීවී වගාව" },
    ornamentalFishDirectory: { en: "Ornamental Fish Farming Directory", si: "විසිතුරු මත්ස්‍ය වගාව" },
    fishLandingSitePresent: { en: "Fish Landing Sites / Harbors Present?", si: "ධීවර වරාය/ධීවර තොටුපොළ පිහිටා තිබේද?" },
    fishLandingSites: { en: "Fish Landing Sites / Harbors", si: "ධීවර වරාය/ධීවර තොටුපොළ විස්තර" },
    iceProductionPresent: { en: "Ice Production Factories Present?", si: "අයිස් නිෂ්පාදනාගාර පිහිටා තිබේද?" },
    iceProductionDirectory: { en: "Ice Production Factories", si: "අයිස් නිෂ්පාදනාගාර විස්තර" },
    teaEstates: { en: "Tea Estates", si: "තේ වතු පිළිබඳ විස්තර" },
  },
};
