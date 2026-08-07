import type { SectionDictionary } from "@/lib/i18n/types";
import type { HousingData } from "@/lib/validators/sections/housing";

export const housingDict: SectionDictionary<keyof HousingData & string> = {
  title: { en: "Housing", si: "නිවාස තොරතුරු" },
  description: {
    en: "Housing stock, sanitation, drinking water sources, and electricity access in the GN division.",
    si: "ග්‍රාම නිලධාරී වසමේ නිවාස ප්‍රමාණය, සනීපාරක්ෂක පහසුකම්, පානීය ජල මූලාශ්‍ර සහ විදුලි පහසුකම්.",
  },
  fields: {
    housingCounts: {
      en: "Housing Information",
      si: "නිවාස තොරතුරු",
      helpEn:
        "* Houses with walls of brick, granite, cabook, or clay brick; roofs of tile, asbestos, or aluminium sheet; and floors of tile, granite, cement, terrazzo, wood, or concrete.\n** Houses with mud/clay walls, using any material for the roof and floor.\n*** Houses with walls of planks or sheets; roofs of coconut/palm leaves, thatch, or sheets; and floors of sand or clay.",
      helpSi:
        "*ගඩොල්, කළුගල්, කැබොක්, මැටි ගඩොල් යොදා බිත්ති බැඳ ඇති, වහලය සඳහා උළු, ඇස්බැස්ටෝස්, ඇලුමිනියම් තහඩු යෙදූ සහ ගෙබිම ටයිල්,ග්‍රැනයිට්,සිමෙන්ති,ටෙරෙසෝ, ලී,කොන්ක්‍රීට් යෙදූ නිවාසයි.\n** මැටි බිත්ති බැඳ ඇති, වහලය සහ ගෙබිම සඳහා ඕනෑම දුවයක් භාවිත කර ඇති නිවාසයි.\n***ලෑලි,තහඩු යොදා බිත්ති සකසා ඇති, වහලය තල්අතු,පොල් අතු,පිදුරු හෝ තහඩු යෙදූ සහ ගෙබිම සඳහා වැලි හෝ මැටි භාවිත කර ඇති නිවාසයි.",
    },
    householdsWithoutHousing: { en: "Number of Families Without Housing", si: "නිවාස නොමැති පවුල් සංඛ්‍යාව" },
    sanitation: { en: "Toilet Facility Requirement", si: "වැසිකිලි අවශ්‍යතාවය" },
    drinkingWaterSource: {
      en: "Number of Families by Main Source of Drinking Water",
      si: "පානීය ජලය ලබා ගන්නා ප්‍රධාන ප්‍රභවය අනුව පවුල් සංඛ්‍යාව",
    },
    underservedAreas: {
      en: "Areas and Number of Families with Difficulty Accessing Hygienic Drinking Water",
      si: "සෞඛ්‍යාරක්ෂිත පානීය ජලය ලබා ගැනීමට දුෂ්කරතා සහිත ප්‍රදේශ හා පවුල් සංඛ්‍යාව",
    },
    electricityAccess: { en: "Extent of Electricity Facilities", si: "විදුලි බලපහසුකම් වල ව්‍යාප්තිය" },
    communityWaterProjects: {
      en: "Information Related to Community-Based Water Projects",
      si: "ප්‍රජාමූල ජල ව්‍යාප්ති සම්බන්ධ තොරතුරු",
      helpEn: "* Ownership: 1. Main Ministry 2. Ministry of Agriculture 3. Private sector.",
      helpSi: "* අයිතිය 1.ප්‍රධාන අමාත්‍යාංශය 2.කෘෂිකර්ම අමාත්‍යාංශය 3.පුද්ගලික අංශය",
    },
  },
};
