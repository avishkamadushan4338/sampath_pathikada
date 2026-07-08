"use client";

import { Building, AlertTriangle, Hammer } from "lucide-react";
import { StatCard, CoverageBadge, NAVY, GOLD_D, MAROON } from "@/components/dashboard/chart-primitives";
import { SectionDataTable } from "@/components/dashboard/SectionDataTable";
import type { AreaProfileAggregate } from "@/lib/analytics/aggregate-sections";

export function IdentificationTab({ data }: { data: AreaProfileAggregate }) {
  return (
    <div className="space-y-6">
      <CoverageBadge {...data.coverage.identification} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Building} label="State Institutions" value={data.stateInstitutions.rows.length} sub="Listed within the division" iconBg={NAVY} />
        <StatCard icon={Hammer} label="Development Projects" value={data.developmentProjects.rows.length} sub="Ongoing / new on state land" iconBg={GOLD_D} />
        <StatCard icon={AlertTriangle} label="Illegal Structures Flagged" value={data.illegalStructures.rows.length} sub="On encroached state land" iconBg={MAROON} />
      </div>

      <SectionDataTable title="State Institutions in the Division" rows={data.stateInstitutions.rows} truncated={data.stateInstitutions.truncated} columns={[{ key: "name", label: "Name" }, { key: "address", label: "Address" }]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionDataTable title="Ongoing / New Development Projects" rows={data.developmentProjects.rows} truncated={data.developmentProjects.truncated} columns={[{ key: "name", label: "Name" }, { key: "status", label: "Status" }, { key: "location", label: "Location" }]} />
        <SectionDataTable title="Unauthorized Structures" rows={data.illegalStructures.rows} truncated={data.illegalStructures.truncated} columns={[{ key: "description", label: "Description" }, { key: "location", label: "Location" }]} />
      </div>
    </div>
  );
}
