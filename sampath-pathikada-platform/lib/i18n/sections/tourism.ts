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
};
