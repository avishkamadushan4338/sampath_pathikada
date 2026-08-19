import { DISTRICTS, DIVISIONAL_SECRETARIATS, GN_DIVISIONS, type GNDivision } from "@/lib/registration-data";

/** The four scope levels Super Admin can view "My Division Information"-style analytics at.
 *  DS/AD users are always implicitly `{ level: "ds", dsDivisionId: <their own division> }` —
 *  expressed at the call site so the shared view components don't special-case those roles. */
export type AnalyticsScope =
  | { level: "island" }
  | { level: "district"; districtId: string }
  | { level: "ds"; dsDivisionId: string }
  | { level: "gn"; gnDivisionId: string; dsDivisionId: string };

/** Builds the query string `/api/analytics` expects for a given scope — the route already
 *  supports `district`, `dsDivision`, and `gnDivisions` as independent, composable filters
 *  (unscoped = island-wide), so this is purely a mapping, not new server capability. */
export function buildAnalyticsQuery(scope: AnalyticsScope, extra?: { year?: number }): string {
  const params = new URLSearchParams();
  if (extra?.year != null) params.set("year", String(extra.year));

  switch (scope.level) {
    case "district":
      params.set("district", scope.districtId);
      break;
    case "ds":
      params.set("dsDivision", scope.dsDivisionId);
      break;
    case "gn":
      params.set("dsDivision", scope.dsDivisionId);
      params.set("gnDivisions", scope.gnDivisionId);
      break;
    case "island":
    default:
      break;
  }

  return `/api/analytics?${params.toString()}`;
}

/** Same scope→query-param mapping as buildAnalyticsQuery, targeting the CSV summary export route
 *  instead — /api/export/csv accepts the identical district/dsDivision/gnDivisions/year params. */
export function scopeToExportQuery(scope: AnalyticsScope, extra?: { year?: number }): string {
  return buildAnalyticsQuery(scope, extra).replace("/api/analytics?", "/api/export/csv?");
}

/** Resolves the GN-division roster a given scope covers — used for client-side picker options
 *  and for filtering data from endpoints that aren't scope-aware themselves (e.g. the
 *  registrations directory). */
export function scopeToGnRoster(scope: AnalyticsScope): GNDivision[] {
  switch (scope.level) {
    case "island":
      return GN_DIVISIONS;
    case "district": {
      const dsIds = new Set(DIVISIONAL_SECRETARIATS.filter((d) => d.districtId === scope.districtId).map((d) => d.id));
      return GN_DIVISIONS.filter((gn) => dsIds.has(gn.dsId));
    }
    case "ds":
      return GN_DIVISIONS.filter((gn) => gn.dsId === scope.dsDivisionId);
    case "gn":
      return GN_DIVISIONS.filter((gn) => gn.id === scope.gnDivisionId);
    default:
      return [];
  }
}

/** Human-readable heading for the current scope, e.g. for the top of the Data View page. */
export function scopeLabel(scope: AnalyticsScope, lang: "en" | "si"): string {
  switch (scope.level) {
    case "island":
      return lang === "si" ? "සියලුම දිස්ත්‍රික්ක" : "All Districts";
    case "district": {
      const d = DISTRICTS.find((x) => x.id === scope.districtId);
      return d ? (lang === "si" ? d.si : d.en) : scope.districtId;
    }
    case "ds": {
      const d = DIVISIONAL_SECRETARIATS.find((x) => x.id === scope.dsDivisionId);
      return d ? (lang === "si" ? d.si : d.en) : scope.dsDivisionId;
    }
    case "gn": {
      const gn = GN_DIVISIONS.find((x) => x.id === scope.gnDivisionId);
      return gn ? (lang === "si" ? gn.si : gn.en) : scope.gnDivisionId;
    }
    default:
      return "";
  }
}

/** The district a scope's data ultimately rolls up under, if any — "island" has no single
 *  district. Used for secondary subheading text (e.g. "<DS division> · <District>"). */
export function scopeDistrictId(scope: AnalyticsScope): string | null {
  switch (scope.level) {
    case "district":
      return scope.districtId;
    case "ds": {
      const d = DIVISIONAL_SECRETARIATS.find((x) => x.id === scope.dsDivisionId);
      return d?.districtId ?? null;
    }
    case "gn": {
      const d = DIVISIONAL_SECRETARIATS.find((x) => x.id === scope.dsDivisionId);
      return d?.districtId ?? null;
    }
    default:
      return null;
  }
}
