import type { SectionDictionary } from "@/lib/i18n/types";
import type { DemographicsData } from "@/lib/validators/sections/demographics";

export const demographicsDict: SectionDictionary<keyof DemographicsData & string> = {
  title: { en: "Demographics", si: "ජනගහන තොරතුරු" },
  description: {
    en: "Population by age, ethnicity, religion, disability status, and household composition.",
    si: "වයස, ජාතිකත්වය, ආගම, ආබාධිත තත්ත්වය සහ පවුල් සංයුතිය අනුව ජනගහනය.",
  },
  fields: {
    populationByAge: { en: "Population by Age Group", si: "වයස් කාණ්ඩය අනුව ජනගහනය" },
    populationByEthnicity: { en: "Population by Ethnicity", si: "ජාතිකත්වය අනුව ජනගහනය" },
    populationByReligion: { en: "Population by Religion", si: "ආගම අනුව ජනගහනය" },
    foreignNationals: { en: "Foreign Nationals Residing in the Division", si: "වසමේ පදිංචි විදේශ ජාතිකයන්" },
    households: { en: "Households", si: "ගෘහ ඒකක" },
    disabilities: { en: "Persons with Disabilities", si: "ආබාධ සහිත පුද්ගලයන්" },
    registeredVoters: { en: "Registered Voters", si: "ලියාපදිංචි ඡන්දදායකයන්" },
  },
};
