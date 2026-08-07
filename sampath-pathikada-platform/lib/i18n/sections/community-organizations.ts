import type { SectionDictionary } from "@/lib/i18n/types";
import type { CommunityOrganizationsData } from "@/lib/validators/sections/community-organizations";

export const communityOrganizationsDict: SectionDictionary<keyof CommunityOrganizationsData & string> = {
  title: { en: "Community / Govt / NGO Organizations", si: "ප්‍රජාමූල, රාජ්‍ය හා රාජ්‍ය නොවන සංවිධාන" },
  description: {
    en: "Community-based, government, and non-governmental organizations active within the GN division.",
    si: "ග්‍රාම නිලධාරී වසම තුළ ක්‍රියාත්මක ප්‍රජාමූල, රාජ්‍ය හා රාජ්‍ය නොවන සංවිධාන පිළිබඳ තොරතුරු.",
  },
  fields: {
    organizationCounts: { en: "Society Types", si: "සමිති වර්ගය" },
    villageDevelopmentSocieties: { en: "Village Development Societies", si: "ග්‍රාම සංවර්ධන සමිති" },
    youthSocieties: { en: "Youth Societies", si: "යෞවන සමාජ සමිති" },
    sportsClubs: { en: "Sports Societies", si: "ක්‍රීඩා සමාජ" },
    funeralAidSocieties: { en: "Funeral & Welfare Societies", si: "අවමංගලාය හා සුභසාධක සමිති" },
    womensSocieties: { en: "Women's Societies", si: "කාන්තා සමිති" },
    eldersSocieties: { en: "Elders' Societies", si: "වැඩිහිටි සමිති" },
    childrensSocieties: { en: "Children's Societies", si: "ළමා සමාජ" },
    samurdhiSocieties: { en: "Samurdhi Societies", si: "සමෘද්ධි සමිති" },
    friendOrganizations: { en: "Friend Organizations / Friend Groups", si: "මිතුරු සංවිධාන/මිතුරු හවුල්" },
    ngoCommittees: { en: "Non-Governmental Organizations", si: "රාජ්‍ය නොවන සංවිධාන" },
    farmerSocieties: { en: "Farmer Societies", si: "ගොවි සමිති" },
    religiousSocieties: { en: "Religious Societies", si: "ආගමික සමිති" },
    sanasaSocieties: { en: "SANASA Societies", si: "සණස සමිති" },
    civilDefenseCommittees: { en: "Civil Defense Committees", si: "සිවිල් ආරක්ෂක කමිටු" },
    prajashakthiSocieties: { en: "Prajashakthi Societies", si: "ප්‍රජාශක්ති සමිති" },
    cooperativeSocieties: {
      en: "Information About Active Cooperative Societies Within the GN Division",
      si: "ග්‍රාම නිලධාරී වසම තුල ක්‍රියාත්මක සමුපකාර සමිති පිළිබඳ තොරතුරු",
    },
  },
};
