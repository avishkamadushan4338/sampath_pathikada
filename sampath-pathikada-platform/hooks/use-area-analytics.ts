"use client";

import useSWR from "swr";
import { useSession } from "@/hooks/use-session";
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

/** Whole-division aggregate (every approved GN division in the caller's own DS division) —
 *  the same /api/analytics data the "My Division Information" dashboard and DsAreaGraphs use,
 *  reused here so a GN-scoped section page can fall back to the area-wide picture when no
 *  single GN division is selected. */
export function useAreaAnalytics() {
  const { user } = useSession();
  const { data, error, isLoading } = useSWR(
    user?.dsDivision ? `/api/analytics?year=${CURRENT_YEAR}` : null,
    fetcher
  );

  return { data: data ?? null, isLoading, isError: !!error };
}
