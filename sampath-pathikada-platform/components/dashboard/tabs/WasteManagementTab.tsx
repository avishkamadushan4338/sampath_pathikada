"use client";

import { Trash2, Recycle } from "lucide-react";
import { StatCard, ChartCard, CoverageBadge, GREEN, MAROON } from "@/components/dashboard/chart-primitives";
import type { AreaProfileAggregate } from "@/lib/analytics/aggregate-sections";

export function WasteManagementTab({ data }: { data: AreaProfileAggregate }) {
  const { wasteManagement, coverage } = data;

  return (
    <div className="space-y-6">
      <CoverageBadge {...coverage.wasteDisaster} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard icon={Recycle} label="Divisions with Waste Program" value={wasteManagement.divisionsWithProgram} sub="Have an active collection program" iconBg={GREEN} />
        <StatCard icon={Trash2} label="Divisions with Compost/Disposal Site" value={wasteManagement.divisionsWithCompostSite} sub="Have a designated site" iconBg={MAROON} />
      </div>

      <ChartCard title="Waste Disposal Methods (Where No Program Exists)" icon={Trash2}>
        {wasteManagement.disposalMethodIfNoProgram.some((d) => d.presentCount > 0) ? (
          <ul className="space-y-2.5">
            {wasteManagement.disposalMethodIfNoProgram.map((d) => (
              <li key={d.en} className="flex items-center justify-between text-[12.5px]">
                <span style={{ color: "hsl(var(--muted-foreground))" }}>{d.en}</span>
                <span className="font-bold" style={{ color: "hsl(var(--foreground))" }}>{d.presentCount}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[12px] py-12 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>No data yet</p>
        )}
      </ChartCard>
    </div>
  );
}
