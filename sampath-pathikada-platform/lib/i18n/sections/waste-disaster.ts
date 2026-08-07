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
      en: "Is There a Systematic Arrangement for Removing / Disposing of Garbage and Solid Waste Within the GN Division?",
      si: "ග්‍රාම නිලධාරී වසම තුළ කසළ හා ඝන අපද්‍රව්‍ය ක්‍රමවත්ව ඉවත් කිරීම /බැහැර කිරීම සඳහා වැඩපිළිවෙළක් පවතිනවාද?",
    },
    publicInformedOfSchedule: {
      en: "If Yes, Has the Public Been Informed of the Waste Collection Days and Times?",
      si: "පිළිතුර ඔව් නම් අපද්‍රව්‍ය රැස්කරන දිනයන් හා වේලාවන් පිළිබඳව මහජනතාව දැනුවත් කර තිබේද?",
    },
    collectionFrequency: { en: "Waste Collection Frequency", si: "අපද්‍රව්‍ය රැස්කරන වාරගණන" },
    collectionMethod: { en: "Waste Collection Method", si: "අපද්‍රව්‍ය රැස්කරන ක්‍රමවේදය" },
    disposalMethodIfNoProgram: {
      en: "If There Is No Systematic Arrangement for Removal / Disposal, the Manner in Which Waste Is Currently Being Disposed Of",
      si: "ග්‍රාම නිලධාරී වසම තුළ කසළ හා ඝන අපද්‍රව්‍ය ක්‍රමවත්ව ඉවත් කිරීම /බැහැර කිරීම සඳහා වැඩපිළිවෙළක් නොපවතීනම් මේ වන විට කසළ බැහැර කරන ආකාරය",
    },
    hasCompostOrDisposalSite: {
      en: "Is There a Designated Place for Systematic Waste Removal / Disposal Within the GN Division?",
      si: "ග්‍රාම නිලධාරී වසම තුළ කසළ හා ඝන අපද්‍රව්‍ය ක්‍රමවත්ව ඉවත් කිරීම /බැහැර කිරීම සඳහා නිශ්චිත ස්ථානයක් තිබේද?",
    },
    proposedSolutionIfNoProgram: {
      en: "If There Is No Program for Systematic Waste Removal / Disposal, Describe the Proposed Method for It",
      si: "ග්‍රාම නිලධාරී වසම තුළ කසළ හා ඝන අපද්‍රව්‍ය ක්‍රමවත්ව ඉවත් කිරීම /බැහැර කිරීම සඳහා වැඩපිළිවෙළක් නොමැතිනම් ඒ සඳහා යෝජනා කරනු ලබන ක්‍රම වේදය දක්වන්න",
    },
  },
};
