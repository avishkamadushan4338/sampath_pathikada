import type { SectionDictionary } from "@/lib/i18n/types";
import type { EmploymentData } from "@/lib/validators/sections/employment";

export const employmentDict: SectionDictionary<keyof EmploymentData & string> = {
  title: { en: "Employment Aspiration", si: "සේවා නියුක්තිය" },
  description: {
    en: "Job seekers by education level, self-employment sectors, and self-employed persons in the GN division.",
    si: "අධ්‍යාපන මට්ටම අනුව රැකියා අපේක්ෂකයන්, ස්වයං රැකියා ක්ෂේත්‍ර සහ ස්වයං රැකියාවල නියුතු පුද්ගලයන්.",
  },
  fields: {
    jobSeekersByEducation: {
      en: "Number of Job-Seeking Persons by Education Level",
      si: "අධ්‍යාපන මට්ටම අනුව රැකියා අපේක්ෂිත පුද්ගලයන් ගණන",
    },
    vocationalTrainingOpportunityGapCount: {
      en: "Persons Wanting Vocational Training but Not Meeting Its Required Qualifications",
      si: "වෘත්තිය පුහුණුව ලැබීමට කැමති, එහෙත් වෘත්තිය පුහුණුවට අවශ්‍ය සුදුසුකම් සපුරා නොමැති පුද්ගලයන් ගණන",
      helpEn:
        "Number of persons with informal training who need to obtain formal, certified training but do not have the opportunity to do so (due to reasons such as increasing age).",
      helpSi:
        "අවිධිමත් පුහුණුව සහිත නමුත් විධිමත් සහතික සහිත පුහුණුවක් ලබා ගැනීමට අවශ්‍යතාවය සහිත එහෙත් ඒ සඳහා අවස්ථාව හිමි නොවුන පුද්ගලයින් ගණන(වයස වැඩි වීම වැනි හේතු නිසා)",
    },
    selfEmploymentSectors: { en: "Information Related to Self-Employment", si: "ස්වයං රැකියා සම්බන්ධ තොරතුරු" },
    selfEmployedPersons: {
      en: "Information on Persons Engaged in Self-Employment",
      si: "ස්වයං රැකියාවන්හි නිරත පුද්ගල තොරතුරු",
      helpEn: "* Market: 1. Local 2. International.",
      helpSi: "*වෙළදපොළ 1-දේශිය, 2-ජාත්‍යන්තර",
    },
  },
};
