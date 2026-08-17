import type { SectionDictionary } from "@/lib/i18n/types";
import type { TourismData } from "@/lib/validators/sections/tourism";

export const tourismDict: SectionDictionary<keyof TourismData & string> = {
  title: { en: "Tourism", si: "සංචාරක" },
  description: {
    en: "Commercial accommodation establishments operating within the GN division — hotels, guest houses, villas, homestays, and other lodging.",
    si: "ග්‍රාම නිලධාරී වසම තුළ ක්‍රියාත්මක වාණිජ නවාතැන් ආයතන — හෝටල්, ගෙස්ට් හවුස්, විලා, හෝම්ස්ටේ සහ අනෙකුත් නවාතැන්.",
  },
  fields: {
    hotelInventory: { en: "Tourism Accommodation Distribution", si: "සංචාරක හෝටල් ව්‍යාප්තිය" },
    guestAccommodations: {
      en: "Guest Houses / Villas / Homestays",
      si: "ගෙස්ට් හවුස් / විලා / හෝම්ස්ටේ",
    },
    otherAccommodations: {
      en: "Other Accommodation Establishments",
      si: "අනෙකුත් නවාතැන් ආයතන",
    },
  },
  rows: {
    categoryLabel: { en: "Hotel Category", si: "හෝටල් වර්ග" },
    hotelCount: { en: "Number of Hotels", si: "හෝටල් සංඛ්‍යාව" },
    name: { en: "Name", si: "නම" },
    type: { en: "Type", si: "වර්ගය" },
    address: { en: "Address", si: "ලිපිනය" },
    // Compound overrides — "roomCount" is worded differently per table.
    "hotelInventory.roomCount": {
      en: "Rooms Providing Residential Facilities",
      si: "නේවාසික පහසුකම් ලබාදෙන කාමර ගණන",
    },
    "guestAccommodations.roomCount": { en: "Number of Rooms", si: "කාමර සංඛ්‍යාව" },
  },
};
