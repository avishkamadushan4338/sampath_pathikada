"use client";

import useSWR from "swr";
import { useAnalyticsScope } from "@/lib/analytics-scope-context";
import { buildAnalyticsQuery } from "@/lib/analytics-scope";
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

export interface AreaAnalytics {
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
  approvedGnDivisions: number;
  totalGnDivisions: number;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load");
  return json as AreaAnalytics;
};

/** Whole-scope aggregate (every approved GN division within the active scope — the caller's own
 *  DS division by default, or whatever `AnalyticsScopeProvider` above in the tree specifies for
 *  Super Admin's Data View) — the same /api/analytics data the "My Division Information"
 *  dashboard and DsAreaGraphs use, reused here so a GN-scoped section page can fall back to the
 *  area-wide picture when no single GN division is selected. */
export function useAreaAnalytics() {
  const scope = useAnalyticsScope();
  const { data, error, isLoading } = useSWR(
    scope ? buildAnalyticsQuery(scope, { year: CURRENT_YEAR }) : null,
    fetcher
  );

  return { data: data ?? null, isLoading, isError: !!error };
}
