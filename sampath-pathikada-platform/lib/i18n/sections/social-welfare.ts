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
      en: "Households Receiving Aswesuma Welfare Payments (by amount)",
      si: "අස්වැසුම සහනාධාර බෙදී ගොස් ඇති ආකාරය (මුදල අනුව)",
    },
    allowanceRecipientCounts: {
      en: "Allowance Recipient Counts",
      si: "දීමනා ලාභීන් සංඛ්‍යාව",
    },
    eldersHomes: { en: "Elders' Homes", si: "වැඩිහිටි නිවාස" },
    childrensHomes: { en: "Children's Homes", si: "ළමා නිවාස" },
  },
};
