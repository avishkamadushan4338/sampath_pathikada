"use client";

import { GraduationCap, School, Users, AlertTriangle } from "lucide-react";
import { StatCard, MiniStat, ChartCard, DonutChart, CoverageBadge, NAVY, GOLD, GREEN, MAROON, GOLD_D } from "@/components/dashboard/chart-primitives";
import { SectionDataTable } from "@/components/dashboard/SectionDataTable";
import type { EducationAggregate } from "@/lib/analytics/aggregate-sections";

export function EducationTab({ data }: { data: EducationAggregate }) {
  const { institutionCounts, schoolCountsByType, dhammaEducation, schoolStaffAndStudents } = data;

  const schoolTypeData = [
    { name: "National", value: schoolCountsByType.nationalSchools, color: NAVY },
    { name: "Type 1AB", value: schoolCountsByType.type1AB, color: GOLD },
    { name: "Type 1C", value: schoolCountsByType.type1C, color: GREEN },
    { name: "Type 2", value: schoolCountsByType.type2, color: MAROON },
    { name: "Type 3", value: schoolCountsByType.type3, color: GOLD_D },
  ];

  const dhammaData = [
    { name: "Buddhist", value: dhammaEducation.buddhist.schools, color: GOLD },
    { name: "Islam", value: dhammaEducation.islam.schools, color: GREEN },
    { name: "Hindu", value: dhammaEducation.hindu.schools, color: MAROON },
    { name: "Christian", value: dhammaEducation.christian.schools, color: NAVY },
  ];

  return (
    <div className="space-y-6">
      <CoverageBadge {...data.coverage} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={School} label="Government Schools" value={institutionCounts.govtSchools.toLocaleString()} sub={`${institutionCounts.privateOrInternationalSchools} private/international`} iconBg={NAVY} />
        <StatCard icon={Users} label="Teachers & Students" value={(schoolStaffAndStudents.studentsFemale + schoolStaffAndStudents.studentsMale).toLocaleString()} sub={`${schoolStaffAndStudents.teachers.toLocaleString()} teachers`} iconBg={GREEN} />
        <StatCard icon={GraduationCap} label="Preschools" value={(institutionCounts.registeredPreschoolsGovt + institutionCounts.registeredPreschoolsPrivate).toLocaleString()} sub={`${institutionCounts.registeredPreschoolsGovt} govt · ${institutionCounts.registeredPreschoolsPrivate} private`} iconBg={GOLD} />
        <StatCard icon={AlertTriangle} label="Out-of-School Children" value={data.outOfSchoolChildrenCount.toLocaleString()} sub={`${data.marriedOrCohabitingMinorsCount} married/cohabiting minors`} iconBg={MAROON} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat icon={School} label="Pirivenas" value={institutionCounts.pirivenas} color={GOLD_D} />
        <MiniStat icon={School} label="Vocational Institutes" value={institutionCounts.vocationalTrainingInstitutes} color={NAVY} />
        <MiniStat icon={Users} label="Female Students" value={schoolStaffAndStudents.studentsFemale.toLocaleString()} color="#B5495B" />
        <MiniStat icon={Users} label="Male Students" value={schoolStaffAndStudents.studentsMale.toLocaleString()} color={NAVY} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Schools by Type" icon={School}>
          <DonutChart data={schoolTypeData} />
        </ChartCard>
        <ChartCard title="Dhamma Education Schools" sub="By religion" icon={GraduationCap}>
          <DonutChart data={dhammaData} />
        </ChartCard>
      </div>

      <SectionDataTable
        title="School Facilities"
        rows={data.schoolFacilities.rows}
        truncated={data.schoolFacilities.truncated}
        columns={[
          { key: "schoolName", label: "School" },
          { key: "teacherCount", label: "Teachers" },
          { key: "studentsFemale", label: "Female Students" },
          { key: "studentsMale", label: "Male Students" },
          { key: "waterFacility", label: "Water" },
          { key: "sanitationFacility", label: "Sanitation" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionDataTable
          title="Schools Requiring Special Attention"
          rows={data.specialAttentionSchools.rows}
          truncated={data.specialAttentionSchools.truncated}
          columns={[{ key: "schoolName", label: "School" }, { key: "reason", label: "Reason" }]}
        />
        <SectionDataTable
          title="Private / International Schools"
          rows={data.privateInternationalSchools.rows}
          truncated={data.privateInternationalSchools.truncated}
          columns={[{ key: "name", label: "Name" }, { key: "teacherCount", label: "Teachers" }, { key: "studentCount", label: "Students" }]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionDataTable title="Pirivenas" rows={data.pirivenas.rows} truncated={data.pirivenas.truncated} columns={[{ key: "name", label: "Name" }, { key: "type", label: "Type" }, { key: "studentCount", label: "Students" }]} />
        <SectionDataTable title="Preschools" rows={data.preschools.rows} truncated={data.preschools.truncated} columns={[{ key: "name", label: "Name" }, { key: "facilityType", label: "Type" }, { key: "studentCount", label: "Students" }]} />
        <SectionDataTable title="Tertiary Institutions" rows={data.tertiaryInstitutions.rows} truncated={data.tertiaryInstitutions.truncated} columns={[{ key: "name", label: "Name" }, { key: "type", label: "Type" }]} />
      </div>
    </div>
  );
}
