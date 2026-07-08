"use client";

import { Trees, ShieldAlert } from "lucide-react";
import { StatCard, MiniStat, CoverageBadge, NAVY, GOLD, GREEN, MAROON } from "@/components/dashboard/chart-primitives";
import { SectionDataTable } from "@/components/dashboard/SectionDataTable";
import type { AreaProfileAggregate } from "@/lib/analytics/aggregate-sections";

export function PhysicalEnvironmentTab({ data }: { data: AreaProfileAggregate }) {
  return (
    <div className="space-y-6">
      <CoverageBadge {...data.coverage.physicalEnvironment} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Trees} label="Water Sources" value={data.waterSources.rows.length} sub="Recorded across scoped divisions" iconBg={NAVY} />
        <StatCard icon={ShieldAlert} label="Hazard Records" value={data.hazards.rows.length} sub="Natural / other hazards logged" iconBg={MAROON} />
        <StatCard icon={Trees} label="Sensitive Zones" value={data.sensitiveZones.rows.length} sub="Environmentally sensitive areas" iconBg={GREEN} />
        <StatCard icon={ShieldAlert} label="Safe Locations" value={data.safeLocations.rows.length} sub="Evacuation / safe centers" iconBg={GOLD} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MiniStat icon={Trees} label="Natural Resources Listed" value={data.naturalResources.rows.length} color={GREEN} />
        <MiniStat icon={Trees} label="Tourist Sites (from Env. Section)" value={data.existingTouristSitesFromPhysicalEnv.rows.length} color={GOLD} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionDataTable title="Water Sources" rows={data.waterSources.rows} truncated={data.waterSources.truncated} columns={[{ key: "type", label: "Type" }, { key: "name", label: "Name" }]} />
        <SectionDataTable title="Natural Hazards" rows={data.hazards.rows} truncated={data.hazards.truncated} columns={[{ key: "type", label: "Type" }, { key: "occurred", label: "Occurred" }, { key: "frequency", label: "Frequency" }]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionDataTable title="Environmentally Sensitive Zones" rows={data.sensitiveZones.rows} truncated={data.sensitiveZones.truncated} columns={[{ key: "zoneName", label: "Zone" }, { key: "significance", label: "Significance" }, { key: "managingAuthority", label: "Managing Authority" }]} />
        <SectionDataTable title="Safe Locations / Evacuation Centers" rows={data.safeLocations.rows} truncated={data.safeLocations.truncated} columns={[{ key: "name", label: "Name" }, { key: "address", label: "Address" }]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionDataTable title="Natural Resources" rows={data.naturalResources.rows} truncated={data.naturalResources.truncated} columns={[{ key: "resource", label: "Resource" }, { key: "notes", label: "Notes" }]} />
        <SectionDataTable title="Existing Tourist Sites (Environment Section)" rows={data.existingTouristSitesFromPhysicalEnv.rows} truncated={data.existingTouristSitesFromPhysicalEnv.truncated} columns={[{ key: "siteName", label: "Site" }, { key: "reasonForAttraction", label: "Reason" }, { key: "maintainedBy", label: "Maintained By" }]} />
      </div>

      <SectionDataTable title="Proposed Tourist Sites (Environment Section)" rows={data.proposedTouristSites.rows} truncated={data.proposedTouristSites.truncated} columns={[{ key: "siteName", label: "Site" }, { key: "specialFeatures", label: "Special Features" }, { key: "possibleActivities", label: "Possible Activities" }]} />
    </div>
  );
}
