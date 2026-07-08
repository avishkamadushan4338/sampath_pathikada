"use client";

import { Landmark, Palette } from "lucide-react";
import { StatCard, MiniStat, ChartCard, DonutChart, CoverageBadge, NAVY, GOLD, GREEN, MAROON } from "@/components/dashboard/chart-primitives";
import { SectionDataTable } from "@/components/dashboard/SectionDataTable";
import type { AreaProfileAggregate } from "@/lib/analytics/aggregate-sections";

export function ReligiousCulturalTab({ data }: { data: AreaProfileAggregate }) {
  const religiousSitesData = [
    { name: "Temples", value: data.religiousSiteCounts.temples.count, color: GOLD },
    { name: "Kovils", value: data.religiousSiteCounts.kovils.count, color: MAROON },
    { name: "Mosques", value: data.religiousSiteCounts.mosques.count, color: GREEN },
    { name: "Churches", value: data.religiousSiteCounts.churches.count, color: NAVY },
  ];
  const totalSites = Object.values(data.religiousSiteCounts).reduce((s, r) => s + r.count, 0);
  const totalClergy = Object.values(data.religiousSiteCounts).reduce((s, r) => s + r.clergyCount, 0);

  return (
    <div className="space-y-6">
      <CoverageBadge {...data.coverage.religiousCultural} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Landmark} label="Religious Sites" value={totalSites} sub="Temples, kovils, mosques, churches" iconBg={GOLD} />
        <StatCard icon={Landmark} label="Clergy / Religious Leaders" value={totalClergy} sub="Across all site types" iconBg={NAVY} />
        <StatCard icon={Landmark} label="Heritage Sites" value={data.heritageSites.rows.length} sub="Historically significant locations" iconBg={GREEN} />
        <StatCard icon={Palette} label="Art Academies" value={data.artAcademies.rows.length} sub="Cultural training centers" iconBg={MAROON} />
      </div>

      <MiniStat icon={Palette} label="Traditional Artists Registered" value={data.traditionalArtists.rows.length} color={GOLD} />

      <ChartCard title="Religious Sites by Type" icon={Landmark}>
        <DonutChart data={religiousSitesData} />
      </ChartCard>

      <SectionDataTable title="Heritage Sites" rows={data.heritageSites.rows} truncated={data.heritageSites.truncated} columns={[{ key: "name", label: "Name" }, { key: "type", label: "Type" }, { key: "significance", label: "Significance" }]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionDataTable title="Art Academies" rows={data.artAcademies.rows} truncated={data.artAcademies.truncated} columns={[{ key: "name", label: "Name" }, { key: "studentCount", label: "Students" }]} />
        <SectionDataTable title="Traditional Artists" rows={data.traditionalArtists.rows} truncated={data.traditionalArtists.truncated} columns={[{ key: "name", label: "Name" }, { key: "artForm", label: "Art Form" }, { key: "description", label: "Description" }]} />
      </div>
    </div>
  );
}
