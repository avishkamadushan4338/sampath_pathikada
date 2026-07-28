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
      en: "Schools for Special Needs Students",
      si: "විශේෂ අවශ්‍යතා ඇති අය සඳහා පිහිටුවා ඇති ඒකක සහිත පාසල්",
    },
    closedSchools: {
      en: "Schools Closed in the Last 5 Years",
      si: "පසුගිය වසර 5 ඇතුළත වැසීගිය පාසල්",
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
    dhammaEducationInstitutions: {
      en: "Dhamma Education Institutions",
      si: "දහම් අධ්‍යාපනය ලබාදෙන ආයතන",
    },
    tertiaryInstitutions: {
      en: "Tertiary Institutions",
      si: "තෘතීයික අධ්‍යාපන ආයතන",
    },
    tuitionCenters: {
      en: "Tuition Centers",
      si: "පෞද්ගලික ඉගැන්වීම් පන්ති (ටියුෂන් මධ්‍යස්ථාන)",
    },
    outOfSchoolChildren: {
      en: "Out-of-School Children (Ages 5–14)",
      si: "පාසැලෙන් බැහැර දරුවන් (අවු. 5-14)",
    },
    childrenInProbationOrDetention: {
      en: "Children in Probation / Detention Custody (Under 18)",
      si: "පරිවාසගත හෝ බන්ධනාගාරගත ළමුන් (අවු. 18ට අඩු)",
    },
  },
};
