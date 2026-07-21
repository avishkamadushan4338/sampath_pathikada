import type { SectionDictionary } from "@/lib/i18n/types";
import type { HousingData } from "@/lib/validators/sections/housing";

export const housingDict: SectionDictionary<keyof HousingData & string> = {
  title: { en: "Housing", si: "නිවාස තොරතුරු" },
  description: {
    en: "Housing stock, sanitation, drinking water sources, and electricity access in the GN division.",
    si: "ග්‍රාම නිලධාරී වසමේ නිවාස ප්‍රමාණය, සනීපාරක්ෂක පහසුකම්, පානීය ජල මූලාශ්‍ර සහ විදුලි පහසුකම්.",
  },
  fields: {
    housingCounts: { en: "Housing Counts", si: "නිවාස ගණන් වශයෙන්" },
    householdsWithoutHousing: { en: "Households Without Proper Housing", si: "නිසි නිවාසයක් නොමැති ගෘහ ඒකක" },
    sanitation: { en: "Sanitation", si: "සනීපාරක්ෂක පහසුකම්" },
    drinkingWaterSource: { en: "Source of Drinking Water", si: "පානීය ජල මූලාශ්‍රය" },
    underservedAreas: { en: "Areas with Inadequate Housing Facilities", si: "ප්‍රමාණවත් නිවාස පහසුකම් නොමැති ප්‍රදේශ" },
    electricityAccessPercent: { en: "Electricity Access (%)", si: "විදුලි පහසුකම් ලැබෙන ප්‍රතිශතය (%)" },
    communityWaterProjects: { en: "Community Drinking Water Projects", si: "ප්‍රජා පානීය ජල ව්‍යාපෘති" },
  },
};
