import type { SectionDictionary } from "@/lib/i18n/types";
import type { StateInstitutionsLandData } from "@/lib/validators/sections/state-institutions-land";

export const stateInstitutionsLandDict: SectionDictionary<keyof StateInstitutionsLandData & string> = {
  title: { en: "State Institutions & Land", si: "රාජ්‍ය ආයතන හා ඉඩම්" },
  description: {
    en: "State institutions, unauthorized structures, and development projects on state land within the GN division.",
    si: "ග්‍රාම නිලධාරී වසම තුළ රාජ්‍ය ආයතන, නීති විරෝධී ගොඩනැගිලි සහ රජයේ ඉඩම්වල සංවර්ධන ව්‍යාපෘති.",
  },
  fields: {
    stateInstitutions: { en: "State Institutions in the Division", si: "වසම තුළ පිහිටි රාජ්‍ය ආයතන" },
    illegalStructures: {
      en: "Unauthorized Structures on Encroached State Land",
      si: "අත්‍යවශ්‍ය නොවන ලෙස ඉදිකර ඇති නීති විරෝධී ගොඩනැගිලි",
    },
    developmentProjects: {
      en: "Ongoing / New Development Projects on State Land",
      si: "රජයේ ඉඩම්වල ක්‍රියාත්මක වන/නව සංවර්ධන ව්‍යාපෘති",
    },
  },
};
