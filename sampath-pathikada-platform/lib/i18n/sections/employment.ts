import type { SectionDictionary } from "@/lib/i18n/types";
import type { EmploymentData } from "@/lib/validators/sections/employment";

export const employmentDict: SectionDictionary<keyof EmploymentData & string> = {
  title: { en: "Employment", si: "රැකියා තොරතුරු" },
  description: {
    en: "Job seekers by education level, self-employment sectors, and self-employed persons in the GN division.",
    si: "අධ්‍යාපන මට්ටම අනුව රැකියා අපේක්ෂකයන්, ස්වයං රැකියා ක්ෂේත්‍ර සහ ස්වයං රැකියාවල නියුතු පුද්ගලයන්.",
  },
  fields: {
    jobSeekersByEducation: { en: "Job Seekers by Education Level", si: "අධ්‍යාපන මට්ටම අනුව රැකියා අපේක්ෂකයන්" },
    jobSeekersUnwillingBelowQualificationCount: {
      en: "Job Seekers Unwilling to Accept Jobs Below Their Qualification",
      si: "සුදුසුකම්වලට වඩා අඩු රැකියා පිළිගැනීමට අකමැති රැකියා අපේක්ෂකයන්",
    },
    selfEmploymentSectors: { en: "Self-Employment Sectors", si: "ස්වයං රැකියා ක්ෂේත්‍ර" },
    selfEmployedPersons: { en: "Self-Employed Persons", si: "ස්වයං රැකියාවල නියුතු පුද්ගලයන්" },
  },
};
