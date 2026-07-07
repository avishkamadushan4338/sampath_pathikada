import type { SectionDictionary } from "@/lib/i18n/types";
import type { EducationData } from "@/lib/validators/sections/education";

export const educationDict: SectionDictionary<keyof EducationData & string> = {
  title: { en: "Education", si: "අධ්‍යාපනය" },
  description: {
    en: "Schools, preschools, tertiary institutions, and education-related facilities in the division.",
    si: "වසම තුළ පිහිටි පාසල්, පෙර පාසල්, තෘතීයික අධ්‍යාපන ආයතන සහ අධ්‍යාපන පහසුකම් පිළිබඳ තොරතුරු.",
  },
  fields: {
    institutionCounts: {
      en: "Institution Counts",
      si: "ආයතන ගණන්",
    },
    schoolCountsByType: {
      en: "School Counts by Type",
      si: "වර්ගය අනුව පාසල් ගණන්",
    },
    schoolFacilities: {
      en: "School Facilities",
      si: "පාසල් පහසුකම්",
    },
    specialAttentionSchools: {
      en: "Schools Requiring Special Attention",
      si: "විශේෂ අවධානය අවශ්‍ය පාසල්",
    },
    privateInternationalSchools: {
      en: "Private / International Schools",
      si: "පෞද්ගලික / ජාත්‍යන්තර පාසල්",
    },
    pirivenas: {
      en: "Pirivenas",
      si: "පිරිවෙන්",
    },
    vocationalInstitutes: {
      en: "Vocational Training Institutes",
      si: "වෘත්තීය පුහුණු ආයතන",
    },
    preschools: {
      en: "Preschools",
      si: "පෙර පාසල්",
    },
    dhammaEducation: {
      en: "Dhamma Education (by Religion)",
      si: "ධර්ම පාසල් අධ්‍යාපනය (ආගම අනුව)",
    },
    tertiaryInstitutions: {
      en: "Tertiary Institutions",
      si: "තෘතීයික අධ්‍යාපන ආයතන",
    },
    tuitionCenters: {
      en: "Tuition Centers",
      si: "පෞද්ගලික ඉගැන්වීම් පන්ති (ටියුෂන් මධ්‍යස්ථාන)",
    },
    outOfSchoolChildrenCount: {
      en: "Number of Out-of-School Children",
      si: "පාසැලෙන් බැහැර දරුවන් සංඛ්‍යාව",
    },
    marriedOrCohabitingMinorsCount: {
      en: "Number of Married / Cohabiting Minors",
      si: "විවාහ වූ / සමඟ ජීවත් වන අවු. 18ට අඩු අය සංඛ්‍යාව",
    },
  },
};
