"use client";

import Link from "next/link";
import { useMemo } from "react";
import useSWR from "swr";
import { MapPin, TrendingUp, Clock, Building2, Users2, Eye } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Bilingual } from "@/components/Bilingual";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DIVISIONAL_SECRETARIATS, DISTRICTS } from "@/lib/registration-data";
import { CURRENT_YEAR } from "@/lib/constants";
import { SECTION_KEYS, SECTION_ROUTES } from "@/lib/types/submission";
import { SECTION_META } from "@/lib/i18n/section-meta";
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

const NAVY = "#0E2B4E";
const GOLD = "#BC9144";

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

/* Same visual structure as the Divisional Secretariat's own "My Division Information" landing
 * page (/divisional-secretariat/graphs) — stat tiles, then a navigation card per section — kept
 * consistent so an Admin sees the identical experience, in Admin's own navy/gold chrome instead
 * of DS's. Each card links to this section's own Admin-namespaced page. */
export default function AdminDivisionInformationIndexPage() {
  const { lang } = useLanguage();
  const { user, isLoading: userLoading } = useSession();
  const { data: stats, isLoading: statsLoading, error } = useSWR(
    user?.dsDivision ? `/api/analytics?year=${CURRENT_YEAR}` : null,
    fetcher
  );

  const division = useMemo(
    () => (user?.dsDivision ? DIVISIONAL_SECRETARIATS.find((d) => d.id === user.dsDivision) : undefined),
    [user]
  );
  const district = useMemo(() => (division ? DISTRICTS.find((d) => d.id === division.districtId) : undefined), [division]);

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
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl" style={{ background: NAVY }}>
          <MapPin size={20} color="#fff" />
        </div>
        <div>
          <h1
            className="text-2xl leading-tight font-bold sm:text-3xl"
            style={{ fontFamily: "var(--font-display,'Playfair Display',serif)", color: "hsl(var(--foreground))" }}
          >
            {lang === "si" ? "වසම් තොරතුරු" : "Division Information"}
          </h1>
          <p className="mt-1 text-[13.5px]" style={{ color: "hsl(var(--muted-foreground))" }}>
            {district && division ? `${lang === "si" ? district.si : district.en} · ${lang === "si" ? division.si : division.en}` : ""}
            {" · "}
            {CURRENT_YEAR}/{(CURRENT_YEAR + 1) % 100}
          </p>
        </div>
      </div>

      {!userLoading && !user?.dsDivision && (
        <div className="rounded-2xl p-6 text-center" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
          <p className="text-[14px] font-semibold" style={{ color: "#92400e" }}>
            {lang === "si" ? "ඔබගේ ගිණුමට තවම වසමක් පවරා නොමැත." : "No division has been assigned to your account yet."}
          </p>
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="py-8 text-center text-fluid-sm text-muted-foreground">
            <Bilingual en="Couldn't load division data right now. Please try again shortly." si="දත්ත දැනට පූරණය කළ නොහැක. ටික වේලාවකින් නැවත උත්සාහ කරන්න." />
          </CardContent>
        </Card>
      )}

      {user?.dsDivision && !error && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(statsLoading || userLoading ? Array.from({ length: 4 }) : statTiles).map((s, i) => {
              const item = s as (typeof statTiles)[number] | undefined;
              return (
                <Card key={item ? item.key : i} className="card-lift">
                  {item ? (
                    <CardContent className="flex items-center gap-4 py-5">
                      <span
                        className="flex size-11 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `hsl(var(${item.colorVar}) / 0.12)`, color: `hsl(var(${item.colorVar}))` }}
                      >
                        <item.icon className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-fluid-2xl font-semibold nums-tabular text-foreground">{item.value}</p>
                        <p className={lang === "si" ? "font-si text-fluid-xs text-muted-foreground" : "font-ui text-fluid-xs text-muted-foreground"}>
                          {lang === "si" ? item.label.si : item.label.en}
                        </p>
                      </div>
                    </CardContent>
                  ) : (
                    <CardContent className="py-5">
                      <Skeleton className="h-11 w-full" />
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="flex flex-col gap-4">
            {SECTION_KEYS.map((key) => {
              const meta = SECTION_META[key];
              const Icon = meta.icon;
              return (
                <Card key={key} className="card-lift relative overflow-hidden border-border/60 py-0 shadow-md">
                  <span className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: GOLD }} aria-hidden="true" />
                  <div className="flex items-center justify-between gap-4 py-4 pr-5 pl-7">
                    <div className="flex min-w-0 items-center gap-4">
                      <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold nums-tabular text-muted-foreground"
                      >
                        {meta.number}
                      </span>
                      <span
                        className="flex size-12 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: "color-mix(in srgb, var(--chart-1) 12%, transparent)" }}
                      >
                        <Icon className="size-6" style={{ color: NAVY }} aria-hidden="true" />
                      </span>
                      <CardTitle className="font-display text-fluid-lg font-bold text-foreground sm:text-fluid-2xl">
                        <Bilingual en={meta.title.en} si={meta.title.si} />
                      </CardTitle>
                    </div>
                    <Link
                      href={`/admin/division-information/${SECTION_ROUTES[key]}`}
                      className="flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2 text-fluid-sm font-medium text-white shadow-md transition-all duration-300 hover:-translate-y-0.5"
                      style={{ background: NAVY }}
                    >
                      <Eye className="size-4" aria-hidden="true" />
                      <Bilingual en="View" si="බලන්න" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
