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
    vocationalTrainingOpportunityGapCount: {
      en: "Persons With Informal Training Wanting Formal Vocational Certification but Never Given the Opportunity (e.g. Due to Age)",
      si: "අවිධිමත් පුහුණුව සහිත නමුත් විධිමත් සහතික සහිත පුහුණුවක් ලබා ගැනීමට අවශ්‍යතාවය සහිත එහෙත් ඒ සඳහා අවස්ථාව හිමි නොවූ පුද්ගලයින් ගණන (වයස වැඩී යාම වැනි හේතු නිසා)",
    },
    selfEmploymentSectors: { en: "Self-Employment Sectors", si: "ස්වයං රැකියා ක්ෂේත්‍ර" },
    selfEmployedPersons: { en: "Self-Employed Persons", si: "ස්වයං රැකියාවල නියුතු පුද්ගලයන්" },
  },
};
