import type { AnalyticsScope } from "@/lib/analytics-scope";

/** Reads an AnalyticsScope out of URL search params (`?level=&district=&dsDivision=&gn=`) —
 *  used so Super Admin's chosen scope survives navigating from the picker page into a section
 *  drill-down page and back, without needing shared React state across two separate routes. */
export function scopeFromSearchParams(params: URLSearchParams): AnalyticsScope {
  const level = params.get("level");
  if (level === "district") {
    const districtId = params.get("district");
    if (districtId) return { level: "district", districtId };
  }
  if (level === "ds") {
    const dsDivisionId = params.get("dsDivision");
    if (dsDivisionId) return { level: "ds", dsDivisionId };
  }
  if (level === "gn") {
    const gnDivisionId = params.get("gn");
    const dsDivisionId = params.get("dsDivision");
    if (gnDivisionId && dsDivisionId) return { level: "gn", gnDivisionId, dsDivisionId };
  }
  return { level: "island" };
}

/** Inverse of scopeFromSearchParams — builds the query string for a given scope, appended to
 *  links/navigations so the destination page can read the same scope back out. */
export function scopeToSearchParams(scope: AnalyticsScope): URLSearchParams {
  const params = new URLSearchParams();
  params.set("level", scope.level);
  if (scope.level === "district") params.set("district", scope.districtId);
  if (scope.level === "ds") params.set("dsDivision", scope.dsDivisionId);
  if (scope.level === "gn") {
    params.set("gn", scope.gnDivisionId);
    params.set("dsDivision", scope.dsDivisionId);
  }
  return params;
}
