"use client";

import { Sprout, Fish, Factory, Wheat, Anchor } from "lucide-react";
import { StatCard, MiniStat, ChartCard, HorizontalBarChart, DonutChart, CoverageBadge, NAVY, GOLD, GREEN, MAROON, GOLD_D, CHART_PALETTE } from "@/components/dashboard/chart-primitives";
import { SectionDataTable } from "@/components/dashboard/SectionDataTable";
import type { EconomicAgricultureAggregate } from "@/lib/analytics/aggregate-sections";

export function AgricultureEconomyTab({ data }: { data: EconomicAgricultureAggregate }) {
  const landUseChart = data.landUse.slice(0, 10).map((l) => ({ label: l.landType, value: Math.round(l.extentHectares) }));
  const landUseDonut = data.landUse.slice(0, 6).map((l, i) => ({ name: l.landType, value: Math.round(l.extentHectares), color: CHART_PALETTE[i % CHART_PALETTE.length] }));
  const machineryChart = data.agriMachinery.slice(0, 10).map((m) => ({ label: m.label, value: m.count }));
  const totalFishingHouseholds = data.marineFisheries.householdCount + data.inlandFisheries.householdCount;

  return (
    <div className="space-y-6">
      <CoverageBadge {...data.coverage} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Sprout} label="Land Use Categories" value={data.landUse.length} sub={`${Math.round(data.landUse.reduce((s, l) => s + l.extentHectares, 0)).toLocaleString()} ha total tracked`} iconBg={GREEN} />
        <StatCard icon={Fish} label="Fishing Households" value={totalFishingHouseholds.toLocaleString()} sub={`${data.marineFisheries.householdCount} marine · ${data.inlandFisheries.householdCount} inland`} iconBg={NAVY} />
        <StatCard icon={Factory} label="Industries" value={data.industries.rows.length} sub="Registered in scope" iconBg={GOLD_D} />
        <StatCard icon={Wheat} label="Abandoned Paddy Land" value={`${Math.round(data.abandonedPaddyLand.extentHectares)} ha`} sub={`${Math.round(data.abandonedPaddyLand.canBeReactivatedExtent)} ha reactivatable`} iconBg={MAROON} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat icon={Sprout} label="Cattle Farming" value={data.animalHusbandryCounts.cattleFarming} color={GREEN} />
        <MiniStat icon={Sprout} label="Beekeeping" value={data.animalHusbandryCounts.beekeeping} color={GOLD} />
        <MiniStat icon={Anchor} label="Active Fishermen" value={data.marineFisheries.activeFishermenCount + data.inlandFisheries.activeFishermenCount} color={NAVY} />
        <MiniStat icon={Fish} label="Divisions with Salt Production" value={data.saltProductionDivisionsCount} color={GOLD_D} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Land Use by Category" sub="Top 10, hectares" icon={Sprout}>
          {landUseChart.length > 0 ? <HorizontalBarChart data={landUseChart} barFill={GREEN} /> : <p className="text-[12px] py-12 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>No land use data yet</p>}
        </ChartCard>
        <ChartCard title="Land Use Distribution" sub="Top 6 categories" icon={Sprout}>
          <DonutChart data={landUseDonut} />
        </ChartCard>
      </div>

      <ChartCard title="Agricultural Machinery" sub="Top 10 by count" icon={Factory}>
        {machineryChart.length > 0 ? <HorizontalBarChart data={machineryChart} barFill={GOLD_D} /> : <p className="text-[12px] py-12 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>No machinery data yet</p>}
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionDataTable
          title="Industries"
          rows={data.industries.rows}
          truncated={data.industries.truncated}
          columns={[{ key: "name", label: "Name" }, { key: "productType", label: "Product" }, { key: "size", label: "Size" }, { key: "employeeCount", label: "Employees" }]}
        />
        <SectionDataTable
          title="Livestock Farms"
          rows={data.livestockFarms.rows}
          truncated={data.livestockFarms.truncated}
          columns={[{ key: "name", label: "Name" }, { key: "animalType", label: "Animal Type" }, { key: "count", label: "Count" }, { key: "address", label: "Address" }]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionDataTable
          title="Animal Husbandry Directory"
          rows={data.animalHusbandryDirectory.rows}
          truncated={data.animalHusbandryDirectory.truncated}
          columns={[{ key: "name", label: "Name" }, { key: "type", label: "Type" }, { key: "phone", label: "Phone" }, { key: "address", label: "Address" }]}
        />
        <SectionDataTable
          title="Tea Estates"
          rows={data.teaEstates.rows}
          truncated={data.teaEstates.truncated}
          columns={[{ key: "name", label: "Name" }, { key: "extentHectares", label: "Extent (ha)" }, { key: "ownership", label: "Ownership" }]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionDataTable title="Fish Landing Sites" rows={data.fishLandingSites.rows} truncated={data.fishLandingSites.truncated} columns={[{ key: "name", label: "Name" }, { key: "location", label: "Location" }]} />
        <SectionDataTable title="Salt Production Sites" rows={data.saltProductionDirectory.rows} truncated={data.saltProductionDirectory.truncated} columns={[{ key: "name", label: "Name" }, { key: "location", label: "Location" }]} />
        <SectionDataTable title="Special Economic Activities" rows={data.specialEconomicActivities.rows} truncated={data.specialEconomicActivities.truncated} columns={[{ key: "activity", label: "Activity" }, { key: "beneficiaries", label: "Beneficiaries" }]} />
      </div>
    </div>
  );
}
