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
    foreignNationals: { en: "Expatriate Population (Residents Living Abroad)", si: "විදේශගත ජනගහනය" },
    households: { en: "Number of Families", si: "මුළු පවුල් සංඛ්‍යාව" },
    disabilities: { en: "Number of Persons with Special Needs", si: "විශේෂ අවශ්‍යතා සහිත පුද්ගලයින් සංඛ්‍යාව" },
    registeredVoters: {
      en: "Number of Registered Voters",
      si: "ලියාපදිංචි ඡන්ද දායකයින් සංඛ්‍යාව",
      helpEn: "* Indicate the number of registered voters by electoral (voting) power area(s), as per the electoral roll.",
      helpSi: "*ඡන්ද නාම ලේඛනය සඳහන් පරිදි ඡන්ද බල ප්‍රදේශය/ ප්‍රදේශ අනුව ලියාපදිංචි ඡන්ද දායකයින් සංඛ්‍යාව",
    },
  },
};
