"use client";

import { Route, Landmark, Store, Bus, Zap } from "lucide-react";
import { StatCard, MiniStat, ChartCard, HorizontalBarChart, CoverageBadge, NAVY, GOLD, GREEN, MAROON, GOLD_D } from "@/components/dashboard/chart-primitives";
import { SectionDataTable } from "@/components/dashboard/SectionDataTable";
import type { InfrastructureAggregate } from "@/lib/analytics/aggregate-sections";

export function InfrastructureTab({ data }: { data: InfrastructureAggregate }) {
  const serviceChart = data.serviceEstablishments.filter((s) => s.count > 0).slice(0, 10).map((s) => ({ label: s.en, value: s.count }));
  const facilityChart = data.publicFacilityCategories.filter((f) => f.presentCount > 0).map((f) => ({ label: f.en, value: f.presentCount }));

  return (
    <div className="space-y-6">
      <CoverageBadge {...data.coverage} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Route} label="Road Development Needs" value={data.roadDevelopmentNeeds.rows.length} sub={`${Math.round(data.totalRoadDevelopmentLengthMeters).toLocaleString()}m total flagged`} iconBg={NAVY} />
        <StatCard icon={Landmark} label="Financial Institutions" value={data.financialInstitutions.rows.length} sub="Banks & financial services" iconBg={GOLD} />
        <StatCard icon={Bus} label="Divisions with Bus Stand" value={data.publicFacilities.busStand} sub={`${data.publicFacilities.railwayStation} with railway station`} iconBg={GREEN} />
        <StatCard icon={Zap} label="Hydropower Plants" value={data.hydropowerPlants.rows.length} sub={`${data.electricitySubstations.rows.length} substations`} iconBg={GOLD_D} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat icon={Bus} label="Jetty Present" value={data.publicFacilities.jetty} color={NAVY} />
        <MiniStat icon={Bus} label="Airport Present" value={data.publicFacilities.airport} color={GOLD_D} />
        <MiniStat icon={Store} label="Industrial Estates" value={data.industrialEstates.rows.length} color={GREEN} />
        <MiniStat icon={Route} label="Water Reservoirs" value={data.waterReservoirs.rows.length} color={MAROON} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Service Establishments" sub="Top 10 categories" icon={Store}>
          {serviceChart.length > 0 ? <HorizontalBarChart data={serviceChart} barFill={NAVY} height={280} /> : <p className="text-[12px] py-12 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>No service establishment data yet</p>}
        </ChartCard>
        <ChartCard title="Public Facility Categories" sub="Divisions reporting presence" icon={Landmark}>
          {facilityChart.length > 0 ? <HorizontalBarChart data={facilityChart} barFill={GOLD_D} height={280} /> : <p className="text-[12px] py-12 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>No facility data yet</p>}
        </ChartCard>
      </div>

      <SectionDataTable
        title="Road Development Needs"
        rows={data.roadDevelopmentNeeds.rows}
        truncated={data.roadDevelopmentNeeds.truncated}
        columns={[
          { key: "roadName", label: "Road" },
          { key: "currentCondition", label: "Condition" },
          { key: "lengthMeters", label: "Length (m)" },
          { key: "priorityRank", label: "Priority" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionDataTable title="Bridges Requiring Repair" rows={data.bridgeRepairs.rows} truncated={data.bridgeRepairs.truncated} columns={[{ key: "name", label: "Name" }, { key: "condition", label: "Condition" }]} />
        <SectionDataTable title="Financial Institutions" rows={data.financialInstitutions.rows} truncated={data.financialInstitutions.truncated} columns={[{ key: "name", label: "Name" }, { key: "type", label: "Type" }]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionDataTable title="Areas Without Public Transport" rows={data.noPublicTransportAreas.rows} truncated={data.noPublicTransportAreas.truncated} columns={[{ key: "area", label: "Area" }, { key: "distanceKm", label: "Distance (km)" }]} />
        <SectionDataTable title="Industrial Estates" rows={data.industrialEstates.rows} truncated={data.industrialEstates.truncated} columns={[{ key: "name", label: "Name" }, { key: "location", label: "Location" }]} />
        <SectionDataTable title="Notable Clubs and Bars" rows={data.notableClubsAndBars.rows} truncated={data.notableClubsAndBars.truncated} columns={[{ key: "name", label: "Name" }, { key: "type", label: "Type" }]} />
      </div>
    </div>
  );
}
