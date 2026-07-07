import type { SectionDictionary } from "@/lib/i18n/types";
import type { EconomicAgricultureData } from "@/lib/validators/sections/economic-agriculture";

export const economicAgricultureDict: SectionDictionary<keyof EconomicAgricultureData & string> = {
  title: { en: "Economic — Agriculture / Industry", si: "ආර්ථික — කෘෂිකාර්මික/කාර්මික" },
  description: {
    en: "Land use, agriculture, animal husbandry, fisheries, and industries in the division.",
    si: "වසම තුළ ඉඩම් භාවිතය, කෘෂිකර්මාන්තය, සත්ත්ව පාලනය, ධීවර කර්මාන්තය සහ කර්මාන්ත පිළිබඳ තොරතුරු.",
  },
  fields: {
    landUse: {
      en: "Land Use",
      si: "ඉඩම් භාවිතය",
    },
    animalHusbandryCounts: {
      en: "Animal Husbandry Counts",
      si: "සත්ත්ව පාලන ගණන්",
    },
    animalHusbandryDirectory: {
      en: "Animal Husbandry Directory",
      si: "සත්ත්ව පාලන ආයතන නාමාවලිය",
    },
    specialEconomicActivities: {
      en: "Special Economic Activities",
      si: "විශේෂ ආර්ථික ක්‍රියාකාරකම්",
    },
    abandonedPaddyLand: {
      en: "Abandoned Paddy Land",
      si: "අතහැර දැමූ කුඹුරු ඉඩම්",
    },
    agriMachinery: {
      en: "Agricultural Machinery",
      si: "කෘෂිකාර්මික යන්ත්‍රෝපකරණ",
    },
    forestDamage: {
      en: "Forest Damage",
      si: "වන විනාශය",
    },
    livestockFarms: {
      en: "Livestock Farms",
      si: "පශු සම්පත් ගොවිපොළවල්",
    },
    industries: {
      en: "Industries",
      si: "කර්මාන්ත",
    },
    marineFisheries: {
      en: "Marine Fisheries",
      si: "මුහුදු ධීවර කර්මාන්තය",
    },
    inlandFisheries: {
      en: "Inland Fisheries",
      si: "අභ්‍යන්තර ධීවර කර්මාන්තය",
    },
    fishLandingSites: {
      en: "Fish Landing Sites",
      si: "මාළු ගොඩබෑම් ස්ථාන",
    },
    saltProductionPresent: {
      en: "Salt Production Present",
      si: "ලුණු නිෂ්පාදනය පවතී ද",
    },
    saltProductionDirectory: {
      en: "Salt Production Directory",
      si: "ලුණු නිෂ්පාදන ස්ථාන නාමාවලිය",
    },
    teaEstates: {
      en: "Tea Estates",
      si: "තේ වතුවල",
    },
  },
};
