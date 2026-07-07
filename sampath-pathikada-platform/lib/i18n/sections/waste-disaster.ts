import type { SectionDictionary } from "@/lib/i18n/types";
import type { WasteDisasterData } from "@/lib/validators/sections/waste-disaster";

export const wasteDisasterDict: SectionDictionary<keyof WasteDisasterData & string> = {
  title: { en: "Waste Management", si: "කසළ කළමනාකරණය" },
  description: {
    en: "Solid waste collection, disposal, and composting arrangements within the GN division.",
    si: "ග්‍රාම නිලධාරී වසම තුළ ඝන අපද්‍රව්‍ය එකතු කිරීම, බැහැර කිරීම සහ කොම්පෝස්ට් කිරීමේ විධිවිධාන.",
  },
  fields: {
    hasWasteProgram: {
      en: "Is there a Waste Collection Program?",
      si: "කසළ එකතු කිරීමේ වැඩසටහනක් තිබේද?",
    },
    publicInformedOfSchedule: {
      en: "Is the Public Informed of the Collection Schedule?",
      si: "එකතු කිරීමේ කාලසටහන පිළිබඳව මහජනතාව දැනුවත් කර ඇත්ද?",
    },
    collectionFrequency: { en: "Collection Frequency", si: "එකතු කිරීමේ සංඛ්‍යාතය" },
    collectionMethod: { en: "Collection Method", si: "එකතු කිරීමේ ක්‍රමය" },
    disposalMethodIfNoProgram: {
      en: "Disposal Method (Where No Program Exists)",
      si: "බැහැර කිරීමේ ක්‍රමය (වැඩසටහනක් නොමැති අවස්ථාවලදී)",
    },
    hasCompostOrDisposalSite: {
      en: "Is there a Composting or Waste Disposal Site?",
      si: "කොම්පෝස්ට් කිරීමේ හෝ කසළ බැහැර කිරීමේ ස්ථානයක් තිබේද?",
    },
    proposedSolutionIfNoProgram: {
      en: "Proposed Solution (Where No Program Exists)",
      si: "යෝජිත විසඳුම (වැඩසටහනක් නොමැති අවස්ථාවලදී)",
    },
  },
};
