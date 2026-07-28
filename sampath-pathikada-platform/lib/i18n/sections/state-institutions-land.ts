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
      en: "Buildings on State Land Not Formally Maintained",
      si: "විධිමත් ලෙස පවත්වාගෙන යනු නොලබන රජයේ ඉඩම්වල ඉදිකර ඇති ගොඩනැගිලි",
    },
    developmentProjects: {
      en: "Abandoned / Halted Government Projects",
      si: "අතරමං වූ / නවතාදමා ඇති ව්‍යාපෘති (රජයට අයත් ඉදි කිරීම්)",
    },
  },
};
