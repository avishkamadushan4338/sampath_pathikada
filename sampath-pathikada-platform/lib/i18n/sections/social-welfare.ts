import type { SectionDictionary } from "@/lib/i18n/types";
import type { SocialWelfareData } from "@/lib/validators/sections/social-welfare";

export const socialWelfareDict: SectionDictionary<keyof SocialWelfareData & string> = {
  title: { en: "Social Welfare", si: "සමාජ සුබසාධන" },
  description: {
    en: "Welfare payments, allowance recipients, and elders'/children's homes within the GN division.",
    si: "ග්‍රාම නිලධාරී වසම තුළ සුබසාධන ගෙවීම්, දීමනා ලාභීන් සහ වැඩිහිටි/ළමා නිවාස පිළිබඳ තොරතුරු.",
  },
  fields: {
    welfarePaymentHouseholdCounts: {
      en: "Manner in Which Aswesuma Benefits Have Been Distributed",
      si: "අස්වැසුම සහනාධාර බෙදී ගොස් ඇති ආකාරය",
    },
    allowanceRecipientCounts: {
      en: "Manner in Which Disability Allowance / Elderly Allowance / Other Aid Has Been Distributed",
      si: "ආබාධිත දීමනා /වැඩිහිටි දීමනා /වෙනත් ආධාර බෙදී ගොස් ඇති ආකාරය",
    },
    eldersHomes: {
      en: "Information About Elders' Homes",
      si: "වැඩිහිටි නිවාස පිළිබඳ තොරතුරු",
      helpEn: "* 1. Government Sector 2. Private Sector.",
      helpSi: "*1-රාජ්‍ය අංශය 2- පුද්ගලික අංශය",
    },
    childrensHomes: {
      en: "Information About Government and Voluntary Children's Homes",
      si: "රජයේ සහ ස්වේච්ඡා ළමා නිවාස පිළිබඳ තොරතුරු",
      helpEn: "* 1. Government Sector 2. Private Sector. ** Type: 1. Children's Home 2. Certified School 3. Reformatory Home 4. Detention Home.",
      helpSi: "*1-රාජ්‍ය අංශය 2- පුද්ගලික අංශය ** වර්ගය- 1- ළමා නිවාස. 2-සහතික කල පාසල්. 3-නිවර්තන නිවාස. 4-රැදවුම් නිවාස",
    },
  },
};
