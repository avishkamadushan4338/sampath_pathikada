import type { SectionDictionary } from "@/lib/i18n/types";
import type { ReligiousCulturalData } from "@/lib/validators/sections/religious-cultural";

export const religiousCulturalDict: SectionDictionary<keyof ReligiousCulturalData & string> = {
  title: { en: "Religious & Cultural", si: "ආගමික හා සංස්කෘතික" },
  description: {
    en: "Religious sites, heritage sites, and cultural / art institutions in the division.",
    si: "වසම තුළ පිහිටි ආගමික ස්ථාන, උරුම ස්ථාන සහ සංස්කෘතික / කලා ආයතන පිළිබඳ තොරතුරු.",
  },
  fields: {
    religiousSiteCounts: {
      en: "Religious Site Counts",
      si: "ආගමික ස්ථාන ගණන්",
    },
    heritageSites: {
      en: "Heritage Sites",
      si: "උරුම ස්ථාන",
    },
    artAcademies: {
      en: "Art Academies",
      si: "කලා අභ්‍යාස මධ්‍යස්ථාන",
    },
    traditionalArtists: {
      en: "Traditional Artists",
      si: "සම්ප්‍රදායික කලාකරුවන්",
    },
  },
};
