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
  rows: {
    // welfarePaymentHouseholdCounts
    rs2500: { en: "Rs. 2,500 - Transitional", si: "රු.2500 සංක්‍රාන්තික" },
    rs5000: { en: "Rs. 5,000 - At Risk", si: "රු.5000 අවධානමට ලක් වූ" },
    rs8500: { en: "Rs. 8,500 - Poor", si: "රු.8500 දිලිඳු" },
    rs15000: { en: "Rs. 15,000 - Extremely Poor", si: "රු.15000 අන්ත දිලිඳු" },
    totalAswesumaRecipients: { en: "Total Aswesuma Recipients", si: "අස්වැසුම ප්‍රතිලාභී මුළ" },
    // allowanceRecipientCounts
    disabilityAllowance: { en: "Disability Allowance", si: "ආබාධිත දීමනා" },
    elderlyAllowance: { en: "Elderly Allowance", si: "වැඩිහිටි දීමනා" },
    nutritionAllowance: { en: "Nutrition Stamp", si: "පෝෂණ මුද්දර" },
    publicAssistance: { en: "Public Assistance", si: "මහජන ආධාර" },
    diseaseAidWheelchair: { en: "Disease Aid - Kidney", si: "රෝගාධාර - වකුගඩු ආධාර" },
    diseaseAidCancer: { en: "Disease Aid - Cancer", si: "රෝගාධාර - පිළිකා" },
    diseaseAidThalassemia: { en: "Disease Aid - Thalassemia", si: "රෝගාධාර - තැලිසීමියා" },
    diseaseAidDiabetes: { en: "Disease Aid - Diabetes", si: "රෝගාධාර - දියවැඩියාව" },
    other: { en: "Other", si: "වෙනත්" },
    // eldersHomes / childrensHomes shared row keys
    authority: { en: "Maintaining Authority", si: "පාලනය කරනු ලබන ආයතනය" },
    phone: { en: "Phone Number", si: "දුරකථන අංකය" },
    infrastructureNeeds: { en: "Infrastructure Facility Needs", si: "යටිතල පහසුකම්වල අවශ්‍යතාව" },
    type: { en: "Type", si: "වර්ගය" },
    female: { en: "Female", si: "ගැහැණු" },
    male: { en: "Male", si: "පිරිමි" },
    // Compound overrides — same generic key means something different in each array.
    "eldersHomes.name": { en: "Elders' Home Name", si: "වැඩිහිටි නිවාසය නම" },
    "eldersHomes.capacity": { en: "Elders' Home Capacity", si: "වැඩිහිටි නිවාසයේ ධාරිතාව" },
    "eldersHomes.residentCount": { en: "Current Residents", si: "දැනට සිටින වැඩිහිටියන්" },
    "childrensHomes.name": { en: "Children's Home Name", si: "ළමා නිවාසය නම" },
    "childrensHomes.capacity": { en: "Children's Home Capacity", si: "ළමා නිවාසයේ ධාරිතාව" },
    "childrensHomes.residentCount": { en: "Current Children", si: "දැනට සිටින ළමයින්" },
  },
};
