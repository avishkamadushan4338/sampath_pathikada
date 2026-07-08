"use client";

import { HeartPulse, Building2, Stethoscope, Pill } from "lucide-react";
import { StatCard, MiniStat, CoverageBadge, NAVY, GOLD, GREEN, MAROON, GOLD_D } from "@/components/dashboard/chart-primitives";
import { SectionDataTable } from "@/components/dashboard/SectionDataTable";
import type { HealthAggregate } from "@/lib/analytics/aggregate-sections";

export function HealthTab({ data }: { data: HealthAggregate }) {
  const { institutionCounts } = data;
  const totalInstitutions = Object.values(institutionCounts).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6">
      <CoverageBadge {...data.coverage} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Government Hospitals" value={institutionCounts.govtHospitals.toLocaleString()} sub={`${institutionCounts.primaryHealthcareUnits} primary healthcare units`} iconBg={NAVY} />
        <StatCard icon={HeartPulse} label="Private Hospitals" value={institutionCounts.privateHospitals.toLocaleString()} sub={`${institutionCounts.ayurvedicHospitals} ayurvedic`} iconBg={GREEN} />
        <StatCard icon={Stethoscope} label="Specialist Centers" value={institutionCounts.specialistServiceCenters.toLocaleString()} sub={`${institutionCounts.mohOfficesOrCommunityHealthCenters} MOH/community centers`} iconBg={GOLD} />
        <StatCard icon={Pill} label="Pharmacies" value={(institutionCounts.govtPharmacies + institutionCounts.privatePharmacies).toLocaleString()} sub={`${institutionCounts.govtPharmacies} govt · ${institutionCounts.privatePharmacies} private`} iconBg={MAROON} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat icon={Building2} label="Total Health Institutions" value={totalInstitutions} color={NAVY} />
        <MiniStat icon={Stethoscope} label="Private Medical Labs" value={institutionCounts.privateMedicalLabs} color={GOLD_D} />
        <MiniStat icon={Stethoscope} label="Other Labs" value={institutionCounts.otherLabs} color={GREEN} />
        <MiniStat icon={HeartPulse} label="Ayurvedic Hospitals" value={institutionCounts.ayurvedicHospitals} color={MAROON} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionDataTable
          title="Government Hospitals Directory"
          rows={data.govtHospitalsDirectory.rows}
          truncated={data.govtHospitalsDirectory.truncated}
          columns={[{ key: "name", label: "Name" }, { key: "type", label: "Type" }, { key: "address", label: "Address" }]}
        />
        <SectionDataTable
          title="Private Hospitals Directory"
          rows={data.privateHospitalsDirectory.rows}
          truncated={data.privateHospitalsDirectory.truncated}
          columns={[{ key: "name", label: "Name" }, { key: "address", label: "Address" }]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionDataTable
          title="Ayurvedic Institutions"
          rows={data.ayurvedicInstitutions.rows}
          truncated={data.ayurvedicInstitutions.truncated}
          columns={[{ key: "name", label: "Name" }, { key: "address", label: "Address" }]}
        />
        <SectionDataTable
          title="Traditional Medicine Practitioners"
          rows={data.traditionalPractitioners.rows}
          truncated={data.traditionalPractitioners.truncated}
          columns={[{ key: "name", label: "Name" }, { key: "specialty", label: "Specialty" }, { key: "address", label: "Address" }]}
        />
      </div>
    </div>
  );
}
