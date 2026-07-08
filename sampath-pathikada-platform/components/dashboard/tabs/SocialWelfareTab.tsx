"use client";

import { HeartHandshake, Home, Baby } from "lucide-react";
import { StatCard, MiniStat, ChartCard, HorizontalBarChart, DonutChart, CoverageBadge, NAVY, GOLD, GREEN, MAROON, GOLD_D } from "@/components/dashboard/chart-primitives";
import { SectionDataTable } from "@/components/dashboard/SectionDataTable";
import type { CommunityWelfareAggregate } from "@/lib/analytics/aggregate-sections";

export function SocialWelfareTab({ data }: { data: CommunityWelfareAggregate }) {
  const welfareTierData = [
    { name: "Rs. 2500", value: data.welfarePaymentHouseholdCounts.rs2500, color: GOLD },
    { name: "Rs. 5000", value: data.welfarePaymentHouseholdCounts.rs5000, color: GREEN },
    { name: "Rs. 8500", value: data.welfarePaymentHouseholdCounts.rs8500, color: NAVY },
    { name: "Rs. 15000", value: data.welfarePaymentHouseholdCounts.rs15000, color: MAROON },
    { name: "No Benefit", value: data.welfarePaymentHouseholdCounts.noBenefit, color: "#8A8577" },
  ];

  const allowanceChart = [
    { label: "Disability", value: data.allowanceRecipientCounts.disabilityAllowance },
    { label: "Elderly", value: data.allowanceRecipientCounts.elderlyAllowance },
    { label: "Nutrition", value: data.allowanceRecipientCounts.nutritionAllowance },
    { label: "Public Assistance", value: data.allowanceRecipientCounts.publicAssistance },
    { label: "Sick", value: data.allowanceRecipientCounts.sickAllowance },
    { label: "Other", value: data.allowanceRecipientCounts.other },
  ];

  const totalWelfareHouseholds = data.welfarePaymentHouseholdCounts.rs2500 + data.welfarePaymentHouseholdCounts.rs5000 + data.welfarePaymentHouseholdCounts.rs8500 + data.welfarePaymentHouseholdCounts.rs15000;

  return (
    <div className="space-y-6">
      <CoverageBadge {...data.coverage.socialWelfare} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={HeartHandshake} label="Welfare Households" value={totalWelfareHouseholds.toLocaleString()} sub="Receiving Samurdhi/welfare payments" iconBg={GOLD} />
        <StatCard icon={Home} label="Elders' Home Residents" value={data.eldersHomes.rows.reduce((s: number, r: any) => s + (r.residentCount ?? 0), 0)} sub={`${data.eldersHomes.rows.length} homes`} iconBg={GREEN} />
        <StatCard icon={Baby} label="Children's Home Residents" value={data.childrensHomes.rows.reduce((s: number, r: any) => s + (r.residentCount ?? 0), 0)} sub={`${data.childrensHomes.rows.length} homes`} iconBg={MAROON} />
        <StatCard icon={HeartHandshake} label="Total Allowance Recipients" value={Object.values(data.allowanceRecipientCounts).reduce((s, v) => s + v, 0).toLocaleString()} sub="Across all allowance types" iconBg={NAVY} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <MiniStat icon={HeartHandshake} label="Disability Allowance" value={data.allowanceRecipientCounts.disabilityAllowance.toLocaleString()} color={MAROON} />
        <MiniStat icon={HeartHandshake} label="Elderly Allowance" value={data.allowanceRecipientCounts.elderlyAllowance.toLocaleString()} color={GOLD_D} />
        <MiniStat icon={HeartHandshake} label="Nutrition Allowance" value={data.allowanceRecipientCounts.nutritionAllowance.toLocaleString()} color={GREEN} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Welfare Payment Tiers" sub="Households by monthly amount" icon={HeartHandshake}>
          <DonutChart data={welfareTierData} />
        </ChartCard>
        <ChartCard title="Allowance Recipients" icon={HeartHandshake}>
          <HorizontalBarChart data={allowanceChart} barFill={GOLD_D} height={220} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionDataTable
          title="Elders' Homes"
          rows={data.eldersHomes.rows}
          truncated={data.eldersHomes.truncated}
          columns={[{ key: "name", label: "Name" }, { key: "authority", label: "Authority" }, { key: "residentCount", label: "Residents" }]}
        />
        <SectionDataTable
          title="Children's Homes"
          rows={data.childrensHomes.rows}
          truncated={data.childrensHomes.truncated}
          columns={[{ key: "name", label: "Name" }, { key: "authority", label: "Authority" }, { key: "residentCount", label: "Residents" }]}
        />
      </div>
    </div>
  );
}
