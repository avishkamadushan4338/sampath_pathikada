import type { SectionKey } from "@/lib/types/submission";
import type { Translated } from "@/lib/i18n/types";
import {
  IdCard,
  TreePine,
  Users,
  Home,
  Briefcase,
  GraduationCap,
  Landmark,
  HeartPulse,
  Wheat,
  RouteOff,
  HandHeart,
  Building2,
  Palmtree,
  Recycle,
  type LucideIcon,
} from "lucide-react";

export interface SectionMeta {
  number: number;
  title: Translated;
  icon: LucideIcon;
}

/** Titles + icons for the sidebar/dashboard nav — full field dictionaries live in lib/i18n/sections/*.ts */
export const SECTION_META: Record<SectionKey, SectionMeta> = {
  identification: {
    number: 1,
    title: { en: "Identification", si: "හඳුනාගැනීම" },
    icon: IdCard,
  },
  physicalEnvironment: {
    number: 2,
    title: { en: "Physical & Environment", si: "භෞතික හා පාරිසරික" },
    icon: TreePine,
  },
  demographics: {
    number: 3,
    title: { en: "Demographics", si: "ජනගහනය" },
    icon: Users,
  },
  housing: {
    number: 4,
    title: { en: "Housing", si: "නිවාස" },
    icon: Home,
  },
  employment: {
    number: 5,
    title: { en: "Employment", si: "රැකියා" },
    icon: Briefcase,
  },
  education: {
    number: 6,
    title: { en: "Education", si: "අධ්‍යාපනය" },
    icon: GraduationCap,
  },
  religiousCultural: {
    number: 7,
    title: { en: "Religious & Cultural", si: "ආගමික හා සංස්කෘතික" },
    icon: Landmark,
  },
  health: {
    number: 8,
    title: { en: "Health", si: "සෞඛ්‍යය" },
    icon: HeartPulse,
  },
  economicAgriculture: {
    number: 9,
    title: { en: "Economic — Agriculture / Industry", si: "ආර්ථික — කෘෂිකාර්මික/කාර්මික" },
    icon: Wheat,
  },
  roadInfrastructure: {
    number: 10,
    title: { en: "Transport & Infrastructure", si: "ප්‍රවාහන හා යටිතල පහසුකම්" },
    icon: RouteOff,
  },
  socialWelfare: {
    number: 11,
    title: { en: "Social Welfare", si: "සමාජ සුබසාධන" },
    icon: HandHeart,
  },
  communityOrganizations: {
    number: 12,
    title: { en: "Community / Govt / NGO Organizations", si: "ප්‍රජාමූල හා සංවිධාන" },
    icon: Building2,
  },
  tourism: {
    number: 13,
    title: { en: "Tourism", si: "සංචාරක" },
    icon: Palmtree,
  },
  wasteDisaster: {
    number: 14,
    title: { en: "Waste Management", si: "කසළ කළමනාකරණය" },
    icon: Recycle,
  },
};
