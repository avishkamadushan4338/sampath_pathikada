"use client";

import Link from "next/link";
import {
  Landmark,
  Users,
  Home,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Wheat,
  RouteOff,
  HandHeart,
  Eye,
  type LucideIcon,
} from "lucide-react";
import { Bilingual } from "@/components/Bilingual";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NAVY, GOLD, MAROON, GREEN } from "@/components/charts/chart-primitives";
import type { DemographicsAggregate } from "@/lib/analytics/aggregate-demographics";
import type {
  HousingAggregate,
  EmploymentAggregate,
  EducationAggregate,
  HealthAggregate,
  EconomicAgricultureAggregate,
  CommunityWelfareAggregate,
  InfrastructureAggregate,
  AreaProfileAggregate,
} from "@/lib/analytics/aggregate-sections";

export interface DsAreaGraphsProps {
  demographics: DemographicsAggregate;
  housing: HousingAggregate;
  employment: EmploymentAggregate;
  education: EducationAggregate;
  health: HealthAggregate;
  economicAgriculture: EconomicAgricultureAggregate;
  communityWelfare: CommunityWelfareAggregate;
  infrastructure: InfrastructureAggregate;
  areaProfile: AreaProfileAggregate;
}

const SECTIONS: {
  key: string;
  icon: LucideIcon;
  titleEn: string;
  titleSi: string;
  accent: string;
}[] = [
  { key: "area-profile", icon: Landmark, titleEn: "Area Profile", titleSi: "ප්‍රදේශ පැතිකඩ", accent: GOLD },
  { key: "demographics", icon: Users, titleEn: "Demographics", titleSi: "ජනගහනය", accent: NAVY },
  { key: "housing", icon: Home, titleEn: "Housing", titleSi: "නිවාස", accent: GOLD },
  { key: "employment", icon: Briefcase, titleEn: "Employment", titleSi: "රැකියා", accent: GREEN },
  { key: "education", icon: GraduationCap, titleEn: "Education", titleSi: "අධ්‍යාපනය", accent: NAVY },
  { key: "health", icon: HeartPulse, titleEn: "Health", titleSi: "සෞඛ්‍යය", accent: MAROON },
  { key: "economic-agriculture", icon: Wheat, titleEn: "Economic — Agriculture / Industry", titleSi: "ආර්ථික — කෘෂිකාර්මික/කාර්මික", accent: GOLD },
  { key: "community", icon: HandHeart, titleEn: "Community / Social Welfare / Organizations", titleSi: "ප්‍රජාමූල / සමාජ සුබසාධන / සංවිධාන", accent: GREEN },
  { key: "infrastructure", icon: RouteOff, titleEn: "Transport & Infrastructure", titleSi: "ප්‍රවාහන හා යටිතල පහසුකම්", accent: NAVY },
];

/** Navigation card — icon, title, and a gold-gradient "View" pill in a single row that links
 *  out to that section's own page. The detailed breakdown for each section is being rebuilt as
 *  a dedicated page, so this card is purely a navigation entry point and renders no chart
 *  content inline. */
function SectionCard({
  icon: Icon,
  titleEn,
  titleSi,
  accent,
  href,
}: {
  icon: LucideIcon;
  titleEn: string;
  titleSi: string;
  accent: string;
  href: string;
}) {
  return (
    <Card className="card-lift relative overflow-hidden border-border/60 py-0 shadow-md">
      <span
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ backgroundColor: accent }}
        aria-hidden="true"
      />
      <div className="flex items-center justify-between gap-4 py-4 pr-5 pl-7">
        <div className="flex min-w-0 items-center gap-4">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${accent}1F`, color: accent }}
          >
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <CardTitle className="font-display text-fluid-xl font-bold text-foreground">
            <Bilingual en={titleEn} si={titleSi} />
          </CardTitle>
        </div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="shrink-0 gap-1.5 rounded-full border-0 px-5 font-medium text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:text-white hover:shadow-(--shadow-glow-accent)"
          style={{ backgroundImage: "var(--gradient-accent)" }}
        >
          <Link href={href}>
            <Eye className="size-4" />
            <Bilingual en="View" si="බලන්න" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

/** Area-wide (all GN divisions in a DS division) section index — each card links out to its
 *  own dedicated page (/divisional-secretariat/graphs/[section]) instead of rendering charts
 *  inline. Aggregate props are accepted for interface compatibility with the caller but are
 *  no longer consumed here. */
export function DsAreaGraphs(_props: DsAreaGraphsProps) {
  return (
    <div className="flex flex-col gap-6">
      {SECTIONS.map((section) => (
        <SectionCard
          key={section.key}
          icon={section.icon}
          titleEn={section.titleEn}
          titleSi={section.titleSi}
          accent={section.accent}
          href={`/divisional-secretariat/graphs/${section.key}`}
        />
      ))}
    </div>
  );
}
