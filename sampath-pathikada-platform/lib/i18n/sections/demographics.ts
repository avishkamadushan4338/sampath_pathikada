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
  rows: {
    female: { en: "Female", si: "ස්ත්‍රී" },
    male: { en: "Male", si: "පුරුෂ" },
    bandLabel: { en: "Age Band", si: "වයස් කාණ්ඩය" },
    ethnicityLabel: { en: "Ethnicity", si: "ජාතිකත්වය" },
    religionLabel: { en: "Religion", si: "ආගම" },
    typeLabel: { en: "Persons with Special Needs", si: "විශේෂ අවශ්‍යතා සහිත පුද්ගලයින් සංඛ්‍යාව" },
    under18: { en: "Under 18", si: "වයස 18ට අඩු" },
    over18: { en: "18 & Over", si: "වයස 18ට වැඩි" },
    // Compound overrides — same generic key means something different in each nested object.
    "foreignNationals.female": { en: "Female Count", si: "ගැහැණු සංඛ්‍යාව" },
    "foreignNationals.male": { en: "Male Count", si: "පිරිමි සංඛ්‍යාව" },
    "households.total": { en: "Count", si: "ගණන" },
    "households.femaleHeaded": { en: "Female-Headed Families", si: "කාන්තා ගෘහමූලික පවුල් සංඛ්‍යාව" },
    "households.displaced": { en: "Families with Children in Probation Care", si: "පරිවාසගත ළමුන් සිටින පවුල් සංඛ්‍යාව" },
    "registeredVoters.electoralArea": { en: "Electoral (Voting) Power Area(s)", si: "මැතිවරණ (ඡන්ද) බල ප්‍රදේශය/ ප්‍රදේශ" },
  },
};
