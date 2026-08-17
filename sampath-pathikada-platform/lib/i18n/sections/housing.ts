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
  rows: {
    total: { en: "Total Housing Count", si: "මුළු නිවාස සංඛ්‍යාව" },
    permanent: { en: "Permanent Housing Count", si: "ස්ථීර නිවාස සංඛ්‍යාව" },
    semiPermanent: { en: "Semi-Permanent Housing Count", si: "අර්ධ ස්ථීර නිවාස සංඛ්‍යාව" },
    nonPermanent: { en: "Non-Permanent Housing Count", si: "අස්ථීර නිවාස සංඛ්‍යාව" },
    withoutSafeSanitation: { en: "Houses Without Hygienic Toilet Facilities", si: "සෞඛ්‍යාරක්ෂිත වැසිකිලි පහසුකම් නොමැති නිවාස සංඛ්‍යාව" },
    well: { en: "Well", si: "ළිඳ" },
    tubeWell: { en: "Tube Well", si: "නල ළිඳ" },
    spring: { en: "Bubble / Spring", si: "බුබුළු/උල්පත" },
    pipedNational: { en: "National Water Supply Board", si: "ජාතික ජල සම්පාදන මණ්ඩලය" },
    pipedLocalGovt: { en: "Provincial Water Board Institutions", si: "පළාත් ජල පාලන ආයතන" },
    pipedCommunity: { en: "Community-Based Organizations", si: "ප්‍රජාමූල සංවිධාන" },
    tankRiverCanalOther: { en: "Tank / River / Canal / Stream / Other", si: "වැව්/ගංගා/ඇල/දොළ/වෙනත්" },
    bottled: { en: "Bottled Water", si: "බෝතල් කළ ජලය" },
    treated: { en: "Associated / Treated Water", si: "ප්‍රති ආශ්‍රිත ජලය" },
    bowser: { en: "Bowser", si: "බවුසර්" },
    other: { en: "Other", si: "වෙනත්" },
    area: { en: "Area with Difficulty", si: "දුෂ්කරතා සහිත ප්‍රදේශ" },
    difficultyDescription: { en: "The Difficulty", si: "දුෂ්කරතාවය" },
    households: { en: "Number of Families", si: "පවුල් සංඛ්‍යාව" },
    proposal: { en: "Proposed Remedy", si: "දුෂ්කරතාවයට යෝජනා කරන පිළියම" },
    withElectricity: { en: "With Electricity Facility", si: "විදුලිබල පහසුකම් සහිත" },
    withSolar: { en: "With Solar Power", si: "සූර්ය බල ශක්තිය සහිත" },
    withoutElectricity: { en: "Without Electricity Facility", si: "විදුලිබල පහසුකම් නොමැති" },
    name: { en: "Name of the Water Project", si: "ජල ව්‍යාපෘතියේ නම" },
    functional: { en: "Is It Operational? (Yes/No)", si: "ක්‍රියාත්මක තත්ත්වයේ ඇත්/නැත" },
    householdsServed: { en: "Number of Families Benefiting", si: "පහසුකම් ලබාගන්නා පවුල් සංඛ්‍යාව" },
    authority: { en: "Ownership", si: "අයිතිය" },
    // Compound overrides — same generic key means something different in each nested object.
    "sanitation.needingAssistance": { en: "Houses That Should Be Given Toilet Assistance", si: "වැසිකිලි ආධාර ලබාදිය යුතු නිවාස සංඛ්‍යාව" },
    "electricityAccess.needingAssistance": { en: "Should Be Given Electricity Assistance", si: "විදුලි ආධාර ලබාදිය යුතු" },
  },
};
