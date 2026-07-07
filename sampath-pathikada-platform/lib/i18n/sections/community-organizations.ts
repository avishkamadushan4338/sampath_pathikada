import type { SectionDictionary } from "@/lib/i18n/types";
import type { CommunityOrganizationsData } from "@/lib/validators/sections/community-organizations";

export const communityOrganizationsDict: SectionDictionary<keyof CommunityOrganizationsData & string> = {
  title: { en: "Community / Govt / NGO Organizations", si: "ප්‍රජාමූල, රාජ්‍ය හා රාජ්‍ය නොවන සංවිධාන" },
  description: {
    en: "Community-based, government, and non-governmental organizations active within the GN division.",
    si: "ග්‍රාම නිලධාරී වසම තුළ ක්‍රියාත්මක ප්‍රජාමූල, රාජ්‍ය හා රාජ්‍ය නොවන සංවිධාන පිළිබඳ තොරතුරු.",
  },
  fields: {
    organizationCounts: { en: "Organization Counts by Type", si: "වර්ගය අනුව සංවිධාන ගණන" },
    organizationDirectory: { en: "Organization Directory", si: "සංවිධාන නාමාවලිය" },
  },
};
