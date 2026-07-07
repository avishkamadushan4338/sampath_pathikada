import type { SectionDictionary } from "@/lib/i18n/types";
import type { IdentificationData } from "@/lib/validators/sections/identification";

export const identificationDict: SectionDictionary<keyof IdentificationData & string> = {
  title: { en: "Identification", si: "හඳුනාගැනීමේ මූලික තොරතුරු" },
  description: {
    en: "Basic identity details for your GN division and its administrative hierarchy.",
    si: "ඔබගේ ග්‍රාම නිලධාරී වසමේ මූලික තොරතුරු සහ පරිපාලන ධුරාවලිය.",
  },
  fields: {
    gnDivisionName: { en: "GN Division Name", si: "ග්‍රාම නිලධාරී වසමේ නම" },
    gnDivisionNumber: { en: "GN Division Number", si: "ග්‍රාම නිලධාරී වසමේ අංකය" },
    officerName: { en: "Officer Name", si: "නිලධාරියාගේ නම" },
    officerDesignation: { en: "Designation", si: "තනතුර" },
    officerPhone: { en: "Phone Number", si: "දුරකථන අංකය" },
    district: { en: "District", si: "දිස්ත්‍රික්කය" },
    dsDivision: { en: "Divisional Secretariat", si: "ප්‍රාදේශීය ලේකම් කොට්ඨාසය" },
    gnDivision: { en: "GN Division", si: "ග්‍රාම නිලධාරී වසම" },
    localGovt: { en: "Local Government Body", si: "පළාත් පාලන ආයතනය" },
    electoral: { en: "Electoral / Polling Division", si: "මැතිවරණ බල ප්‍රදේශය" },
    farmers: { en: "Farmers' Service Center", si: "ගොවිජන සේවා මධ්‍යස්ථානය" },
    eduZone: { en: "Education Zone", si: "අධ්‍යාපන කලාපය" },
    eduDiv: { en: "Education Division", si: "අධ්‍යාපන කොට්ඨාසය" },
    mahaweli: { en: "Mahaweli Zone", si: "මහවැලි කොට්ඨාසය" },
    stateInstitutions: { en: "State Institutions in the Division", si: "වසම තුළ පිහිටි රාජ්‍ය ආයතන" },
    illegalStructures: {
      en: "Unauthorized Structures on Encroached State Land",
      si: "අත්‍යවශ්‍ය නොවන ලෙස ඉදිකර ඇති නීති විරෝධී ගොඩනැගිලි",
    },
    developmentProjects: {
      en: "Ongoing / New Development Projects on State Land",
      si: "රජයේ ඉඩම්වල ක්‍රියාත්මක වන/නව සංවර්ධන ව්‍යාපෘති",
    },
  },
};
