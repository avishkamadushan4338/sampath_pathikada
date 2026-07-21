import type { SectionDictionary } from "@/lib/i18n/types";
import type { HealthData } from "@/lib/validators/sections/health";

export const healthDict: SectionDictionary<keyof HealthData & string> = {
  title: { en: "Health", si: "සෞඛ්‍යය" },
  description: {
    en: "Health institutions, hospitals, and medical practitioners serving the division.",
    si: "වසමට සේවය සපයන සෞඛ්‍ය ආයතන, රෝහල් සහ වෛද්‍ය වෘත්තිකයන් පිළිබඳ තොරතුරු.",
  },
  fields: {
    institutionCounts: {
      en: "Institution Counts",
      si: "ආයතන ගණන්",
    },
    govtHospitalsDirectory: {
      en: "Government Hospitals Directory",
      si: "රාජ්‍ය රෝහල් නාමාවලිය",
    },
    privateHospitalsDirectory: {
      en: "Private Hospitals Directory",
      si: "පෞද්ගලික රෝහල් නාමාවලිය",
    },
    ayurvedicInstitutions: {
      en: "Ayurvedic Institutions",
      si: "ආයුර්වේද ආයතන",
    },
    traditionalPractitioners: {
      en: "Traditional Medicine Practitioners",
      si: "දේශීය වෛද්‍ය ප්‍රාවීණයන්",
    },
  },
};
