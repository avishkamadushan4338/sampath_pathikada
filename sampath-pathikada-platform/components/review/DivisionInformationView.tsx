"use client";

import useSWR from "swr";
import { TrendingUp, Clock, Building2, Users2, LineChart, Download } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Bilingual } from "@/components/Bilingual";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DsAreaGraphs } from "@/components/analytics/DsAreaGraphs";
import { useAnalyticsScope } from "@/lib/analytics-scope-context";
import { buildAnalyticsQuery, scopeLabel, scopeDistrictId, scopeToExportQuery } from "@/lib/analytics-scope";
import { scopeToSearchParams } from "@/lib/analytics-scope-url";
import { DISTRICTS } from "@/lib/registration-data";
import { CURRENT_YEAR } from "@/lib/constants";
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

interface AnalyticsResponse {
  demographics: DemographicsAggregate;
  sections: {
    housing: HousingAggregate;
    employment: EmploymentAggregate;
    education: EducationAggregate;
    health: HealthAggregate;
    economicAgriculture: EconomicAgricultureAggregate;
    communityWelfare: CommunityWelfareAggregate;
    infrastructure: InfrastructureAggregate;
    areaProfile: AreaProfileAggregate;
  };
  approvalRate: number | null;
  avgDecisionDays: number | null;
  totalGnDivisions: number;
  totalSubmissions: number;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load");
  return json as AnalyticsResponse;
};

function GraphsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-2 h-8 w-56" />
      <Skeleton className="mb-8 h-5 w-72" />
      <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(clamp(180px,25vw,240px),1fr))] gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, en, si }: { icon: typeof LineChart; en: string; si: string }) {
  return (
    <Card>
      <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 py-12 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <p className="max-w-prose text-fluid-sm text-muted-foreground">
          <Bilingual en={en} si={si} />
        </p>
      </CardContent>
    </Card>
  );
}

export interface DivisionInformationViewProps {
  /** Route prefix for this reviewer's route group, e.g. "/divisional-secretariat" or
   *  "/assistant-director-planning" — threaded into DsAreaGraphs' section-card links. Super
   *  Admin's Data View passes "/super-admin/divisions". */
  basePath?: string;
}

export function DivisionInformationView({ basePath = "/divisional-secretariat" }: DivisionInformationViewProps) {
  const { lang } = useLanguage();
  const scope = useAnalyticsScope();
  const {
    data: stats,
    isLoading: statsLoading,
    error,
  } = useSWR(scope ? buildAnalyticsQuery(scope, { year: CURRENT_YEAR }) : null, fetcher);

  const heading = scope ? scopeLabel(scope, lang) : undefined;
  const districtId = scope ? scopeDistrictId(scope) : null;
  const district = districtId ? DISTRICTS.find((d) => d.id === districtId) : undefined;
  // For a district/DS/GN scope, the heading already names the district or a division within it —
  // only show the district as a secondary " · District" suffix when the heading itself isn't
  // already the district name (i.e. scope is more specific than "district").
  const showDistrictSuffix = district && scope?.level !== "district";

  if (statsLoading && !!scope) {
    return <GraphsSkeleton />;
  }

  const statTiles = stats
    ? [
        {
          key: "approvalRate",
          icon: TrendingUp,
          colorVar: "--status-approved",
          label: { en: "Approval Rate", si: "අනුමැති අනුපාතය" },
          value: stats.approvalRate !== null ? `${stats.approvalRate}%` : "—",
        },
        {
          key: "avgDays",
          icon: Clock,
          colorVar: "--chart-2",
          label: { en: "Avg. Days to Decision", si: "තීරණයට සාමාන්‍ය දින" },
          value: stats.avgDecisionDays !== null ? stats.avgDecisionDays.toString() : "—",
        },
        {
          key: "submissions",
          icon: Building2,
          colorVar: "--chart-1",
          label: { en: "Submissions Received", si: "ලැබුණු ඉදිරිපත් කිරීම්" },
          value: stats.totalSubmissions.toString(),
        },
        {
          key: "totalDivisions",
          icon: Users2,
          colorVar: "--status-pending",
          label: { en: "GN Divisions in Area", si: "ප්‍රදේශයේ ග්‍රාම නිලධාරී වසම්" },
          value: stats.totalGnDivisions.toString(),
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-fluid-3xl font-semibold text-primary">
            <Bilingual en="My Division Information" si="මගේ කොට්ඨාශයේ තොරතුරු" />
          </h1>
          <p className="mt-2 text-fluid-base text-muted-foreground">
            {heading && <span>{heading}</span>}
            {showDistrictSuffix && <span> · {lang === "si" ? district!.si : district!.en}</span>}
            {" · "}
            {CURRENT_YEAR}/{(CURRENT_YEAR + 1) % 100}
          </p>
        </div>
        {scope && stats && stats.totalSubmissions > 0 && (
          <Button asChild variant="outline" className="gap-1.5 shrink-0">
            <a href={scopeToExportQuery(scope, { year: CURRENT_YEAR })} download>
              <Download className="size-4" aria-hidden="true" />
              <Bilingual en="Download Summary CSV" si="සාරාංශය CSV බාගන්න" />
            </a>
          </Button>
        )}
      </div>

      {!scope ? (
        <EmptyState
          icon={Building2}
          en="No division has been assigned to your account yet. Please contact your Super Admin."
          si="ඔබගේ ගිණුමට තවම වසමක් පවරා නොමැත. කරුණාකර ඔබගේ සුපිරි පරිපාලක අමතන්න."
        />
      ) : error ? (
        <EmptyState
          icon={LineChart}
          en="Couldn't load graphs right now. Please try again shortly."
          si="ප්‍රස්ථාර දැනට පූරණය කළ නොහැක. ටික වේලාවකින් නැවත උත්සාහ කරන්න."
        />
      ) : !stats || stats.totalSubmissions === 0 ? (
        <EmptyState
          icon={LineChart}
          en="No submissions yet — charts will appear once GN divisions start submitting data."
          si="තවම ඉදිරිපත් කිරීම් නැත — ග්‍රාම නිලධාරී වසම් දත්ත ඉදිරිපත් කිරීම ආරම්භ කළ පසු ප්‍රස්ථාර දිස්වනු ඇත."
        />
      ) : (
        <>
          {/* Stat tiles */}
          <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(clamp(180px,25vw,240px),1fr))] gap-4">
            {statTiles.map(({ key, icon: Icon, colorVar, label, value }) => (
              <Card key={key} className="card-lift">
                <CardContent className="flex items-center gap-4 py-5">
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `hsl(var(${colorVar}) / 0.12)`, color: `hsl(var(${colorVar}))` }}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-fluid-2xl font-semibold nums-tabular text-foreground">{value}</p>
                    <p lang={lang} className={lang === "si" ? "font-si text-fluid-xs text-muted-foreground" : "font-ui text-fluid-xs text-muted-foreground"}>
                      {lang === "si" ? label.si : label.en}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DsAreaGraphs
            basePath={basePath}
            queryString={scope ? scopeToSearchParams(scope).toString() : undefined}
            demographics={stats.demographics}
            housing={stats.sections.housing}
            employment={stats.sections.employment}
            education={stats.sections.education}
            health={stats.sections.health}
            economicAgriculture={stats.sections.economicAgriculture}
            communityWelfare={stats.sections.communityWelfare}
            infrastructure={stats.sections.infrastructure}
            areaProfile={stats.sections.areaProfile}
          />
        </>
      )}
    </div>
  );
}
