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
    funeralAidSocieties: { en: "Funeral & Welfare Societies", si: "අවමංගල්‍යය හා සුභසාධක සමිති" },
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
  rows: {
    typeLabel: { en: "Type", si: "වර්ගය" },
    count: { en: "Society Count", si: "සමිති සංඛ්‍යාව" },
    address: { en: "Address", si: "ලිපිනය" },
    nameAndAddress: { en: "Sports Society Name & Address", si: "ක්‍රීඩා සමාජවල නම් හා ලිපිනය" },
    memberCount: { en: "Member Count", si: "සාමාජික ගණන" },
    identifiedNeeds: { en: "Identified Needs", si: "හඳුනාගත් අවශ්‍යතා" },
    // Compound overrides — "name" is shared by every society-directory table but each has its
    // own exact label text from the entry page.
    "villageDevelopmentSocieties.name": { en: "Village Development Society Names", si: "ග්‍රාම සංවර්ධන සමිතිවල නම්" },
    "youthSocieties.name": { en: "Youth Society Names", si: "යෞවන සමාජ සමිතිවල නම්" },
    "funeralAidSocieties.name": { en: "Funeral & Welfare Society Names", si: "අවමංගල්‍යය හා සුභසාධක සමිතිවල නම්" },
    "womensSocieties.name": { en: "Women's Society Names", si: "කාන්තා සමිතිවල නම්" },
    "eldersSocieties.name": { en: "Elders' Society Names", si: "වැඩිහිටි සමිතිවල නම්" },
    "childrensSocieties.name": { en: "Children's Society Names", si: "ළමා සමාජ සමිතිවල නම්" },
    "samurdhiSocieties.name": { en: "Samurdhi Society Names", si: "සමෘද්ධි සමිතිවල නම්" },
    "friendOrganizations.name": { en: "Friend Organization / Friend Group Names", si: "මිතුරු සංවිධාන/මිතුරු හවුල් වල නම්" },
    "ngoCommittees.name": { en: "Non-Governmental Organization Names", si: "රාජ්‍ය නොවන සංවිධාන වල නම්" },
    "farmerSocieties.name": { en: "Farmer Society Names", si: "ගොවි සමිතිවල නම්" },
    "religiousSocieties.name": { en: "Religious Society Names", si: "ආගමික සමිතිවල නම්" },
    "sanasaSocieties.name": { en: "SANASA Society Names", si: "සණස සමිතිවල නම්" },
    "civilDefenseCommittees.name": { en: "Civil Defense Committee Names", si: "සිවිල් ආරක්ෂක සමිතිවල නම්" },
    "prajashakthiSocieties.name": { en: "Prajashakthi Society Names", si: "ප්‍රජාශක්ති සමිතිවල නම්" },
    "cooperativeSocieties.name": { en: "Multi-Purpose Cooperative Society Name", si: "වි.සේවා.සමූපකාර සමිතියේ නම" },
  },
};
