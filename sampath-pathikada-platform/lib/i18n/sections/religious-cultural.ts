import type { SectionDictionary } from "@/lib/i18n/types";
import type { ReligiousCulturalData } from "@/lib/validators/sections/religious-cultural";

export const religiousCulturalDict: SectionDictionary<keyof ReligiousCulturalData & string> = {
  title: { en: "Religious & Cultural Affairs", si: "ආගමික හා සංස්කෘතික කටයුතු" },
  description: {
    en: "Religious sites, heritage sites, and cultural / art institutions in the division.",
    si: "වසම තුළ පිහිටි ආගමික ස්ථාන, උරුම ස්ථාන සහ සංස්කෘතික / කලා ආයතන පිළිබඳ තොරතුරු.",
  },
  fields: {
    religiousSiteCounts: {
      en: "Total Number of All Religious Sites",
      si: "සියලුම ආගමික ස්ථාන සංඛ්‍යාව",
    },
    heritageSites: {
      en: "Names of Sacred Sites Among the Religious Sites in the Area",
      si: "ප්‍රදේශයේ ඇති ආගමික ස්ථානයන්හි පූජනීය ස්ථානයන්හි නම",
      helpEn:
        "The sacred sites in the area include ancient viharas, royal viharas, archaeological sites, historical sites, churches, and kovils. Note the reason if any of these hold special significance. * When noting the type: (1. Temple / Vihara) (2. Forest Hermitage) (3. Asapuwa) (4. Meditation Center) (5. Nun's Hermitage) (6. Mosque — Islamic Mosque) (7. Catholic Church) (8. Kovil) (9. Devalaya)",
      helpSi:
        "ප්‍රදේශයේ ඇති පූජනීය ස්ථාන වන පුරාණ විහාර, රජමහා විහාර, පුරාවිද්‍යාත්මක ස්ථාන, ඓතිහාසික ස්ථාන, පල්ලි, කෝවිල් නම් සහ සුවිශේෂී වැදගත්කමක් පවතිනම් එවා සුවිශේෂී වීමට හේතුව සටහන් කරන්න. *වර්ගය සටහන් කිරීමේදී දැනුවත් වන්න-( 1-පන්සල්/විහාරස්ථාන) ( 2- ආරණ්‍ය සේනාසන) (3 අසපුව) (4-භාවනා මධ්‍යස්ථාන) (5- මෙහෙනි ආරාම ) (6පල්ලි- ඉස්ලාම් පල්ලි) (7-කතෝලික පල්ලි) (8-කෝවිල්) (9- දේවාල)",
    },
    artAcademies: {
      en: "Details of Art Institutions",
      si: "කලායතන පිළිබඳ විස්තර",
    },
    traditionalArtists: {
      en: "Main Cultural Aspects Present in the Area — Artists Produced / Art Lineages",
      si: "ප්‍රදේශයෙන් පවතින ප්‍රධාන සංස්කෘතිකාංග - බිහිවූ කලාකරුවන්/කලා පරම්පරාවල්",
      helpEn: "* e.g. writers, poets, lyricists, bali thovil, puppet dance, painting artists, drumming artists, and other various cultural aspects.",
      helpSi: "* ලේඛකයන්, කවියන්, ගීතඥයන්, බලි තොවිල්, රුකඩ නැටුම්, විත්‍ර ශිල්පීන්, බෙර වාදන ශිල්පීන් ආදී විවිධ සංස්කෘතිකාංග",
    },
  },
};
