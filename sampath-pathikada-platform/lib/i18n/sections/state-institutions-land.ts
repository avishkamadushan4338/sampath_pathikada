import type { SectionDictionary } from "@/lib/i18n/types";
import type { StateInstitutionsLandData } from "@/lib/validators/sections/state-institutions-land";

export const stateInstitutionsLandDict: SectionDictionary<keyof StateInstitutionsLandData & string> = {
  title: { en: "State Institutions & Land", si: "රාජ්‍ය ආයතන හා ඉඩම්" },
  description: {
    en: "State institutions, unauthorized structures, and development projects on state land within the GN division.",
    si: "ග්‍රාම නිලධාරී වසම තුළ රාජ්‍ය ආයතන, නීති විරෝධී ගොඩනැගිලි සහ රජයේ ඉඩම්වල සංවර්ධන ව්‍යාපෘති.",
  },
  fields: {
    stateInstitutions: {
      en: "State Institutions in the GN Division",
      si: "ග්‍රාම නිලධාරී වසම තුළ පිහිටි රාජ්‍ය ආයතන",
      helpEn:
        "* Includes: Divisional Secretariat, Samurdhi Office, Agrarian Service Centre and affiliated offices, Police Stations, Court Complexes, Water Supply Board, Pradeshiya Sabha, Urban Council, Municipal Council, Public Health Inspector Office, Ceylon Electricity Board, Government Departments, other state institutions, office complexes, Tri-Forces related institutions, Prisons, and other offices. (Schools, post offices, hospitals, ports, airports, Public Health Inspector offices, banks, and financial service institutions must not be included.)",
      helpSi:
        "*ප්‍රාදේශීය ලේකම් කාර්යාලය, සමෘද්ධි කාර්යාලය, ගොවිජන සේවා මධ්‍යස්ථානය හා ආශ්‍රිත කාර්යාල, පොලිස් ස්ථාන, අධිකරණ සංකීර්ණ, ජල සම්පාදන මණ්ඩලය, ප්‍රාදේශීය සභාව, නගර සභාව, මහ නගර සභාව, මහජන සෞඛ්‍ය පරීක්ෂක කාර්යාල, විදුලිබල මණ්ඩලය, දෙපාර්තමේන්තු, වෙනත් රාජ්‍ය ආයතන, කාර්යාල සංකීර්ණ, ත්‍රිවිධ හමුදාව සම්බන්ධ ආයතන, බන්ධනාගාර, වෙනත් කාර්යාල (පාසල්, තැපැල් කාර්යාල, රෝහල්, වරාය, ගුවන්තොටුපොළ, මහජන සෞඛ්‍ය පරීක්ෂක කාර්යාල, බැංකු හා මුල්‍ය සේවා ආයතන ඇතුළත් නොකළ යුතුය.)",
    },
    illegalStructures: {
      en: "Government-Owned Buildings Currently Not in Use (Abandoned) in the GN Division",
      si: "ග්‍රාම නිලධාරී වසම තුළ පිහිටි මේ වන විට භාවිතයට නොගන්නා (අතහැර දමා ඇති) රජයට අයත් ගොඩනැගිලි",
      helpEn: "* Indicate in this table if a building that was previously used for some purpose has since been abandoned.",
      helpSi: "*යම්කිසි කාර්යයක් සඳහා භාවිතා කරන ලද ගොඩනැගිලි මේ වගුවට අත්හැර දමා ඇත්නම් දක්වන්න",
    },
    developmentProjects: {
      en: "Stalled Development Projects in the GN Division (Government-Owned Constructions)",
      si: "ග්‍රාම නිලධාරී වසම තුළ පිහිටි අතරමං නවතා දමා ඇති ව්‍යාපෘති (රජයට අයත් ඉදිකිරීම්)",
      helpEn: "* Projects for which work was started under various development programmes but has since been halted midway.",
      helpSi: "*විවිධ සංවර්ධන වැඩසටහන් යටතේ වැඩ ආරම්භ කර අතරමං නවතාදමා ඇති ව්‍යාපෘති.",
    },
  },
  rows: {
    name: { en: "Institution Name", si: "ආයතනයේ නම" },
    address: { en: "Address", si: "ලිපිනය" },
    buildingName: { en: "Name of the Abandoned Building", si: "අත්හැර දමන ලද ගොඩනැගිල්ලේ නම" },
    purposeUsed: { en: "Purpose Used For", si: "යොදා ගත් කාර්යය" },
    usable: { en: "Usable Condition", si: "භාවිතයට ගත හැකි මට්ටමක පවතිනවාද" },
    projectName: { en: "Name of the Stalled Project(s)", si: "අතරමං නවතාදමා ඇති ව්‍යාපෘතියේ/වල නම" },
    reasonForHalt: { en: "Reason for Halting", si: "නවතාදැමීමට හේතුව" },
    currentStatus: { en: "Current Status", si: "වර්තමාන තත්වය" },
    // Compound overrides — same generic key means something different in each array.
    "illegalStructures.owningInstitution": { en: "Owning Institution", si: "ගොඩනැගිල්ල අයත් ආයතනය" },
    "developmentProjects.owningInstitution": { en: "Owning Institution", si: "ව්‍යාපෘතිය අයත් ආයතනය" },
  },
};
