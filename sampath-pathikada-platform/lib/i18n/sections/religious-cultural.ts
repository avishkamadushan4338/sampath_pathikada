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
        "ප්‍රදේශයේ ඇති පූජනීය ස්ථාන වන පුරාණ විහාර, රජමහා විහාර, පුරාවිද්‍යාත්මක ස්ථාන, ඓතිහාසික ස්ථාන, පල්ලි, කෝවිල් නම් සහ සුවිශේෂී වැදගත්කමක් පවතීනම් එවා සුවිශේෂී වීමට හේතුවද සටහන් කරන්න. *වර්ගය සටහන් කිරීමේදී දැනුවත් වන්න-( 1-පන්සල්/විහාරස්ථාන) ( 2- ආරණ්‍ය සේනාසන) (3 අසපුව) (4-භාවනා මධ්‍යස්ථාන) (5- මෙහෙනි ආරාම ) (6පල්ලි- ඉස්ලාම් පල්ලි) (7-කතෝලික පල්ලි) (8-කෝවිල්) (9- දේවාල)",
    },
    artAcademies: {
      en: "Details of Art Institutions",
      si: "කලායතන පිළිබඳ විස්තර",
    },
    traditionalArtists: {
      en: "Main Cultural Aspects Present in the Area — Artists Produced / Art Lineages",
      si: "ප්‍රදේශයෙන් පවතින ප්‍රධාන සංස්කෘතිකාංග - බිහිවූ කලාකරුවන්/කලා පරම්පරාවල්",
      helpEn: "* e.g. writers, poets, lyricists, bali thovil, puppet dance, painting artists, drumming artists, and other various cultural aspects.",
      helpSi: "* ලේඛකයන්, කවියන්, වියතුන්, බලි තොවිල්, රුකඩ නැටුම්, විත්‍ර ශිල්පීන්, බෙර වාදන ශිල්පීන් ආදී විවිධ සංස්කෘතිකාංග",
    },
  },
  rows: {
    // religiousSiteCounts sub-sections (temple, nun hermitage, kovil, mosque, church).
    temples: { en: "Temple / Forest Hermitage / Asapuwa", si: "පන්සල්/ආරණ්‍ය විහාරස්ථාන/අසපුව" },
    meheniArama: { en: "Nun Hermitages", si: "මෙහෙනි ආරාම" },
    kovils: { en: "Kovils", si: "කෝවිල්" },
    mosques: { en: "Mosques", si: "ඉස්ලාම් පල්ලි" },
    churches: { en: "Catholic Church", si: "කතෝලික පල්ලි" },
    count: { en: "Count", si: "ගණන" },
    priestsCount: { en: "Priests", si: "පියතුමන්ලා" },
    nunsCount: { en: "Nuns / Sisters", si: "කන්‍යා සොයුරියන්" },
    // heritageSites row.
    type: { en: "Type", si: "වර්ගය" },
    significance: { en: "Reason for Being Special", si: "සුවිශේෂී වීමට හේතු" },
    usedForDhammaOrGovtPurpose: {
      en: "Used for Dhamma School / Pirivena / Govt Purpose?",
      si: "දහම් පාසල්/පිරිවෙන් හෝ රජයේ කාර්යන් සඳහා භාවිතා කරනවාද",
    },
    taskDescription: { en: "Describe the Task", si: "එම කටයුත්ත විස්තර කරන්න" },
    // artAcademies row.
    registrationNumber: { en: "Registration No.", si: "ලියාපදිංචි අංකය" },
    studentCount: { en: "Student Count", si: "සිසුන් ගණන" },
    // traditionalArtists row.
    artForm: { en: "Famous Art Field", si: "ප්‍රසිද්ධ කලා ක්ෂේත්‍රය" },
    description: { en: "Description", si: "විස්තරය" },
    // Compound overrides — same generic key means something different in each array/object.
    "heritageSites.name": { en: "Name of Religious Site / Sacred Site", si: "ආගමික ස්ථානයන්හි /පූජනීය ස්ථානයේ නම" },
    "artAcademies.name": { en: "Name of Art Institution", si: "කලායතනයේ නම" },
    "traditionalArtists.name": { en: "Artists Produced", si: "බිහිවූ කලාකරුවන්" },
    "temples.clergyCount": { en: "Monks", si: "භික්ෂූන් වහන්සේලා" },
    "meheniArama.clergyCount": { en: "Nuns", si: "මෙහෙනීන් වහන්සේලා" },
    "kovils.clergyCount": { en: "Poojaris", si: "පූජකතුමන්ලා /පූසාරි" },
    "mosques.clergyCount": { en: "Moulavis", si: "මවුලවිතුමන්ලා" },
  },
};
