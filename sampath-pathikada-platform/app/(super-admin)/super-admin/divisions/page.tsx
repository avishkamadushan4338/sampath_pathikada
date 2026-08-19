"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Globe2, MapPinned, MapPin } from "lucide-react";
import { DISTRICTS, DIVISIONAL_SECRETARIATS, GN_DIVISIONS } from "@/lib/registration-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnalyticsScopeProvider } from "@/lib/analytics-scope-context";
import { scopeFromSearchParams, scopeToSearchParams } from "@/lib/analytics-scope-url";
import { DivisionInformationView } from "@/components/review/DivisionInformationView";

const ALL = "__all__";

export default function SuperAdminDivisionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scope = useMemo(() => scopeFromSearchParams(searchParams), [searchParams]);

  const districtId = scope.level === "island" ? ALL : scope.level === "district" ? scope.districtId : (
    // ds/gn scopes still have a district underneath them for picker purposes
    DIVISIONAL_SECRETARIATS.find((d) => d.id === (scope.level === "ds" || scope.level === "gn" ? scope.dsDivisionId : ""))?.districtId ?? ALL
  );
  const dsDivisionId = scope.level === "ds" ? scope.dsDivisionId : scope.level === "gn" ? scope.dsDivisionId : ALL;
  const gnDivisionId = scope.level === "gn" ? scope.gnDivisionId : ALL;

  const divisionsInDistrict = useMemo(
    () => (districtId === ALL ? [] : DIVISIONAL_SECRETARIATS.filter((d) => d.districtId === districtId)),
    [districtId]
  );
  const gnDivisionsInDs = useMemo(
    () => (dsDivisionId === ALL ? [] : GN_DIVISIONS.filter((gn) => gn.dsId === dsDivisionId)),
    [dsDivisionId]
  );

  const navigateToScope = useCallback(
    (next: typeof scope) => {
      router.push(`/super-admin/divisions?${scopeToSearchParams(next).toString()}`);
    },
    [router]
  );

  const onDistrictChange = (value: string) => {
    if (value === ALL) return navigateToScope({ level: "island" });
    navigateToScope({ level: "district", districtId: value });
  };

  const onDsDivisionChange = (value: string) => {
    if (value === ALL) {
      // Fall back to whichever district is selected (island if none).
      if (districtId === ALL) return navigateToScope({ level: "island" });
      return navigateToScope({ level: "district", districtId });
    }
    navigateToScope({ level: "ds", dsDivisionId: value });
  };

  const onGnDivisionChange = (value: string) => {
    if (value === ALL) {
      if (dsDivisionId === ALL) return navigateToScope({ level: "island" });
      return navigateToScope({ level: "ds", dsDivisionId });
    }
    navigateToScope({ level: "gn", gnDivisionId: value, dsDivisionId: dsDivisionId === ALL ? "" : dsDivisionId });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1
          className="text-2xl sm:text-3xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-display,'Playfair Display',serif)", color: "hsl(var(--foreground))" }}
        >
          Division Drill-Down
        </h1>
        <p className="text-[13.5px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
          Inspect the same "My Division Information" view a Divisional Secretariat sees — island-wide,
          by district, by DS division, or down to a single GN division.
        </p>
      </div>

      {/* Picker */}
      <div
        className="flex flex-col gap-3 rounded-2xl p-4 sm:flex-row"
        style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
      >
        <div className="flex flex-1 items-center gap-2">
          <Globe2 size={16} className="shrink-0 text-muted-foreground" />
          <Select value={districtId} onValueChange={onDistrictChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Districts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Districts (Southern Province)</SelectItem>
              {DISTRICTS.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.en} District
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-1 items-center gap-2">
          <MapPinned size={16} className="shrink-0 text-muted-foreground" />
          <Select value={dsDivisionId} onValueChange={onDsDivisionChange} disabled={districtId === ALL}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={districtId === ALL ? "Select a district first" : "All divisions in district"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{districtId === ALL ? "Select a district first" : "All divisions in district"}</SelectItem>
              {divisionsInDistrict.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-1 items-center gap-2">
          <MapPin size={16} className="shrink-0 text-muted-foreground" />
          <Select value={gnDivisionId} onValueChange={onGnDivisionChange} disabled={dsDivisionId === ALL}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={dsDivisionId === ALL ? "Select a division first" : "All GN divisions"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{dsDivisionId === ALL ? "Select a division first" : "All GN divisions"}</SelectItem>
              {gnDivisionsInDs.map((gn) => (
                <SelectItem key={gn.id} value={gn.id}>
                  {gn.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        <AnalyticsScopeProvider scope={scope}>
          <DivisionInformationView basePath="/super-admin/divisions" />
        </AnalyticsScopeProvider>
      </div>
    </div>
  );
}
