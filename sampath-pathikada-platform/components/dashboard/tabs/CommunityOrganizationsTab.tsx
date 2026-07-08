"use client";

import { Users2 } from "lucide-react";
import { StatCard, ChartCard, HorizontalBarChart, CoverageBadge, NAVY } from "@/components/dashboard/chart-primitives";
import { SectionDataTable } from "@/components/dashboard/SectionDataTable";
import type { CommunityWelfareAggregate } from "@/lib/analytics/aggregate-sections";

export function CommunityOrganizationsTab({ data }: { data: CommunityWelfareAggregate }) {
  const orgChart = data.organizationCounts.filter((o) => o.count > 0).slice(0, 15).map((o) => ({ label: o.en, value: o.count }));
  const totalOrgs = data.organizationCounts.reduce((s, o) => s + o.count, 0);
  const activeTypes = data.organizationCounts.filter((o) => o.count > 0).length;

  return (
    <div className="space-y-6">
      <CoverageBadge {...data.coverage.communityOrganizations} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard icon={Users2} label="Total Organizations" value={totalOrgs.toLocaleString()} sub={`Across ${activeTypes} of ${data.organizationCounts.length} tracked types`} iconBg={NAVY} />
        <StatCard icon={Users2} label="Organizations Listed" value={data.organizationDirectory.rows.length} sub="In the directory" iconBg={NAVY} />
      </div>

      <ChartCard title="Community Organizations by Type" sub="All active types" icon={Users2}>
        {orgChart.length > 0 ? <HorizontalBarChart data={orgChart} barFill={NAVY} height={360} /> : <p className="text-[12px] py-12 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>No organization data yet</p>}
      </ChartCard>

      <SectionDataTable
        title="Organization Directory"
        rows={data.organizationDirectory.rows}
        truncated={data.organizationDirectory.truncated}
        columns={[{ key: "name", label: "Name" }, { key: "type", label: "Type" }, { key: "address", label: "Address" }]}
      />
    </div>
  );
}
