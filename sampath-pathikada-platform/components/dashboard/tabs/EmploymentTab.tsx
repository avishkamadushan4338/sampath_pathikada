"use client";

import { Users, Briefcase, UserX } from "lucide-react";
import { StatCard, ChartCard, HorizontalBarChart, CoverageBadge, NAVY, GOLD, MAROON } from "@/components/dashboard/chart-primitives";
import { SectionDataTable } from "@/components/dashboard/SectionDataTable";
import type { EmploymentAggregate } from "@/lib/analytics/aggregate-sections";

export function EmploymentTab({ data }: { data: EmploymentAggregate }) {
  const educationChart = data.jobSeekersByEducation.map((r) => ({ label: r.en, value: r.count }));
  const topSectors = data.selfEmploymentSectors.filter((s) => s.count > 0).slice(0, 10).map((r) => ({ label: r.en, value: r.count }));

  return (
    <div className="space-y-6">
      <CoverageBadge {...data.coverage} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total Job Seekers" value={data.totalJobSeekers.toLocaleString()} sub="Across all education levels" iconBg={NAVY} />
        <StatCard icon={UserX} label="Unwilling Below Qualification" value={data.jobSeekersUnwillingBelowQualificationCount.toLocaleString()} sub="Won't accept jobs below their level" iconBg={MAROON} />
        <StatCard icon={Briefcase} label="Self-Employment Sectors Active" value={data.selfEmploymentSectors.filter((s) => s.count > 0).length} sub={`of ${data.selfEmploymentSectors.length} tracked sectors`} iconBg={GOLD} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Job Seekers by Education Level" icon={Users}>
          <HorizontalBarChart data={educationChart} barFill={NAVY} />
        </ChartCard>
        <ChartCard title="Top Self-Employment Sectors" sub={`Top ${topSectors.length} of ${data.selfEmploymentSectors.length}`} icon={Briefcase}>
          {topSectors.length > 0
            ? <HorizontalBarChart data={topSectors} barFill={GOLD} height={280} />
            : <p className="text-[12px] py-12 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>No self-employment data yet</p>}
        </ChartCard>
      </div>

      <SectionDataTable
        title="Self-Employed Persons Directory"
        rows={data.selfEmployedPersons.rows}
        truncated={data.selfEmployedPersons.truncated}
        columns={[
          { key: "name", label: "Name" },
          { key: "sector", label: "Sector" },
          { key: "phone", label: "Phone" },
          { key: "address", label: "Address" },
        ]}
      />
    </div>
  );
}
