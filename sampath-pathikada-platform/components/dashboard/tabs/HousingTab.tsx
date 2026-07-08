"use client";

import { Home, Droplets, Zap, ShieldAlert } from "lucide-react";
import { StatCard, MiniStat, ChartCard, DonutChart, CoverageBadge, NAVY, GOLD, GREEN, MAROON, GOLD_D } from "@/components/dashboard/chart-primitives";
import { SectionDataTable } from "@/components/dashboard/SectionDataTable";
import type { HousingAggregate } from "@/lib/analytics/aggregate-sections";

export function HousingTab({ data }: { data: HousingAggregate }) {
  const { housingCounts, householdsWithoutHousing, sanitation, drinkingWaterSource, avgElectricityAccessPercent } = data;

  const typeData = [
    { name: "Permanent", value: housingCounts.permanent, color: GREEN },
    { name: "Semi-Permanent", value: housingCounts.semiPermanent, color: GOLD },
    { name: "Non-Permanent", value: housingCounts.nonPermanent, color: MAROON },
  ];

  const waterData = [
    { name: "Piped (National)", value: drinkingWaterSource.pipedNational, color: NAVY },
    { name: "Piped (Rural)", value: drinkingWaterSource.pipedRural, color: GOLD },
    { name: "Protected Well", value: drinkingWaterSource.protectedWell, color: GREEN },
    { name: "Unprotected Well", value: drinkingWaterSource.unprotectedWell, color: MAROON },
    { name: "Tube Well", value: drinkingWaterSource.tubeWell, color: GOLD_D },
    { name: "River/Canal/Tank", value: drinkingWaterSource.riverCanalTank, color: "#4A7FA6" },
    { name: "Bottled/Other", value: drinkingWaterSource.bottledOther, color: "#8A8577" },
  ];

  return (
    <div className="space-y-6">
      <CoverageBadge {...data.coverage} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Home} label="Total Housing Units" value={housingCounts.total.toLocaleString()} sub={`${householdsWithoutHousing.toLocaleString()} without proper housing`} iconBg={NAVY} />
        <StatCard icon={ShieldAlert} label="Without Safe Sanitation" value={sanitation.withoutSafeSanitation.toLocaleString()} sub={`${sanitation.needingAssistance.toLocaleString()} need assistance`} iconBg={MAROON} />
        <StatCard icon={Zap} label="Avg. Electricity Access" value={avgElectricityAccessPercent !== null ? `${avgElectricityAccessPercent}%` : "—"} sub="Average across reporting divisions" iconBg={GOLD_D} />
        <StatCard icon={Droplets} label="Sanitation Coverage" value={sanitation.total.toLocaleString()} sub="Total households with sanitation data" iconBg={GREEN} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Housing Type Distribution" sub="Permanent / Semi / Non-Permanent" icon={Home}>
          <DonutChart data={typeData} />
        </ChartCard>
        <ChartCard title="Drinking Water Source" sub="Households by primary source" icon={Droplets}>
          <DonutChart data={waterData} />
        </ChartCard>
      </div>

      <SectionDataTable
        title="Areas with Inadequate Housing Facilities"
        rows={data.underservedAreas.rows}
        truncated={data.underservedAreas.truncated}
        columns={[
          { key: "area", label: "Area" },
          { key: "households", label: "Households" },
          { key: "proposal", label: "Proposal" },
        ]}
      />

      <SectionDataTable
        title="Community Drinking Water Projects"
        rows={data.communityWaterProjects.rows}
        truncated={data.communityWaterProjects.truncated}
        columns={[
          { key: "name", label: "Project Name" },
          { key: "status", label: "Status" },
          { key: "householdsServed", label: "Households Served" },
          { key: "authority", label: "Authority" },
        ]}
      />
    </div>
  );
}
