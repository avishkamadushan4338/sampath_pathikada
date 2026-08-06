"use client";

import * as React from "react";
import useSWR from "swr";
import Link from "next/link";
import { ArrowLeft, ArrowUp } from "lucide-react";
import type { DemographicsAggregate } from "@/lib/analytics/aggregate-demographics";
import type { AreaProfileAggregate, EmploymentAggregate } from "@/lib/analytics/aggregate-sections";
import { Bilingual } from "@/components/Bilingual";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSession } from "@/hooks/use-session";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { CURRENT_YEAR } from "@/lib/constants";
import { GN_DIVISIONS } from "@/lib/registration-data";
import type { CommunityWelfareAggregate } from "@/lib/analytics/aggregate-sections";
import { StateInstitutionsLandView } from "@/components/analytics/StateInstitutionsLandView";
import { PhysicalEnvironmentView } from "@/components/analytics/PhysicalEnvironmentView";
import { HousingView } from "@/components/analytics/HousingView";
import { EducationView } from "@/components/analytics/EducationView";
import { EmploymentSectionView } from "@/components/analytics/EmploymentSectionView";
import { ReligiousCulturalSectionView } from "@/components/analytics/ReligiousCulturalSectionView";
import { TourismSectionView } from "@/components/analytics/TourismSectionView";
import { WasteDisasterSectionView } from "@/components/analytics/WasteDisasterSectionView";
import { CommunityOrganizationsSection } from "@/components/analytics/CommunityOrganizationsSection";
import { DivisionDemographicsSection } from "@/components/analytics/DivisionDemographicsSection";
import { HealthView } from "@/components/analytics/HealthView";
import { EconomicAgricultureView } from "@/components/analytics/EconomicAgricultureView";
import { RoadInfrastructureView } from "@/components/analytics/RoadInfrastructureView";

interface RegistrationRow {
  id: string;
  name: string;
  phone: string;
  gnDivision: string;
  localGovt: string | null;
  electoral: string | null;
  farmers: string | null;
  eduZone: string | null;
  eduDiv: string | null;
  mahaweli: string | null;
  district: string | null;
  divisionalSecretariat: string | null;
  jurisdiction: string | null;
}

interface RegistrationsResponse {
  data: RegistrationRow[];
  total: number;
  page: number;
  pageSize: number;
}

interface AnalyticsGnBreakdownRow {
  gnId: string;
  gnName: string;
  gnNameSi: string;
  demographics: DemographicsAggregate | null;
}

// FIXED: Use the full DemographicsAggregate type
interface AnalyticsResponse {
  ok: true;
  demographics: DemographicsAggregate;  // This includes populationByReligion and populationByEthnicity
  sections: {
    employment: EmploymentAggregate;
    areaProfile: AreaProfileAggregate;
    communityWelfare: CommunityWelfareAggregate;
  };
  gnBreakdown: AnalyticsGnBreakdownRow[];
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load");
  return json as RegistrationsResponse;
};

const analyticsFetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load analytics");
  return json as AnalyticsResponse;
};

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-1/3 rounded-full bg-muted" />
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="animate-pulse bg-muted px-4 py-5">
          <div className="h-10 rounded-md bg-muted-foreground/20" />
        </div>
      </div>
    </div>
  );
}

function SocialWelfareTableShell({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto rounded-md border border-border/70">{children}</div>;
}

function SocialWelfareTable({
  communityWelfare,
  isLoading,
  error,
}: {
  communityWelfare: CommunityWelfareAggregate | undefined;
  isLoading: boolean;
  error: unknown;
}) {
  const { lang } = useLanguage();

  if (error) {
    return <div className="text-sm text-destructive">Unable to load social welfare data.</div>;
  }

  if (isLoading || !communityWelfare) {
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  }

  const paymentCounts = communityWelfare.welfarePaymentHouseholdCounts;
  const allowanceCounts = communityWelfare.allowanceRecipientCounts;
  const totalFamilies = paymentCounts.rs2500 + paymentCounts.rs5000 + paymentCounts.rs8500 + paymentCounts.rs15000;
  const eldersHomesRows = communityWelfare.eldersHomes.rows;
  const childrensHomesRows = communityWelfare.childrensHomes.rows;

  const authorityLabel = (authority: string | undefined) => {
    if (!authority) return "—";
    if (authority === "govt") return lang === "si" ? "රාජ්‍ය" : "Government";
    if (authority === "private") return lang === "si" ? "පෞද්ගලික" : "Private";
    return authority;
  };

  const childrensAuthorityLabel = (authority: string | undefined) => {
    if (!authority) return "—";
    if (authority === "govt") return lang === "si" ? "රාජ්‍ය" : "Government";
    if (authority === "ngo") return lang === "si" ? "ස්වේච්ඡා" : "Voluntary";
    if (authority === "private") return lang === "si" ? "පෞද්ගලික" : "Private";
    return authority;
  };

  const childrensCategoryLabel = (category: string | undefined) => {
    if (!category) return "—";
    if (category === "childrens-home") return lang === "si" ? "ළමා නිවාසය" : "Children's Home";
    if (category === "certified-school") return lang === "si" ? "සහතික කළ පාසල" : "Certified School";
    if (category === "probation-home") return lang === "si" ? "පරිවාස නිවාසය" : "Probation Home";
    if (category === "detention-home") return lang === "si" ? "රඳවා තැබීමේ නිවාසය" : "Detention Home";
    return category;
  };

  return (
    <Card className="overflow-hidden border-border/60 shadow-md">
      <CardContent className="p-0">
        <div className="space-y-10">
          <section className="space-y-2">
            <h3 className="px-3 pt-3 text-base font-semibold text-foreground">
              <Bilingual en="Number of Families" si="පවුල් සංඛ්‍යාව" />
            </h3>
            <SocialWelfareTableShell>
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-muted/20 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3 whitespace-nowrap">{lang === "si" ? "මුළු පවුල් සංඛ්‍යාව" : "Total Number of Families"}</th>
                    <th className="px-3 py-3 whitespace-nowrap">{lang === "si" ? "සංක්‍රාන්තික (රු. 2,500)" : "Transitional (Rs. 2,500)"}</th>
                    <th className="px-3 py-3 whitespace-nowrap">{lang === "si" ? "අවදානම් / අවදානමට ලක්වූ (රු. 5,000)" : "Vulnerable / At Risk (Rs. 5,000)"}</th>
                    <th className="px-3 py-3 whitespace-nowrap">{lang === "si" ? "දිළිඳු (රු. 8,500)" : "Poor (Rs. 8500)"}</th>
                    <th className="px-3 py-3 whitespace-nowrap">{lang === "si" ? "අන්ත දිළිඳු (රු. 15,000)" : "Extremely Poor (Rs. 15000)"}</th>
                    <th className="px-3 py-3 whitespace-nowrap">{lang === "si" ? "ප්‍රතිලාභීන්ගේ මුළු සංඛ්‍යාව" : "Total Number of Beneficiaries"}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-3 py-3 nums-tabular">{totalFamilies.toLocaleString()}</td>
                    <td className="px-3 py-3 nums-tabular">{paymentCounts.rs2500.toLocaleString()}</td>
                    <td className="px-3 py-3 nums-tabular">{paymentCounts.rs5000.toLocaleString()}</td>
                    <td className="px-3 py-3 nums-tabular">{paymentCounts.rs8500.toLocaleString()}</td>
                    <td className="px-3 py-3 nums-tabular">{paymentCounts.rs15000.toLocaleString()}</td>
                    <td className="px-3 py-3 nums-tabular">{paymentCounts.totalAswesumaRecipients.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </SocialWelfareTableShell>
          </section>

          <section className="space-y-2">
            <h3 className="px-3 text-base font-semibold text-foreground">
              <Bilingual en="Number of Beneficiaries" si="ප්‍රතිලාභීන් සංඛ්‍යාව" />
            </h3>
            <SocialWelfareTableShell>
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-muted/20 text-muted-foreground">
                  <tr>
                    <th rowSpan={2} className="px-3 py-3 align-middle whitespace-nowrap">
                      <Bilingual en="Disability Allowance" si="ආබාධිත දීමනාව" />
                    </th>
                    <th rowSpan={2} className="px-3 py-3 align-middle whitespace-nowrap">
                      <Bilingual en="Elderly Allowance" si="වැඩිහිටි දීමනාව" />
                    </th>
                    <th rowSpan={2} className="px-3 py-3 align-middle whitespace-nowrap">
                      <Bilingual en="Nutrition Stamps" si="පෝෂණ මුද්දර" />
                    </th>
                    <th rowSpan={2} className="px-3 py-3 align-middle whitespace-nowrap">
                      <Bilingual en="Public Assistance" si="මහජන සහන ආධාර" />
                    </th>
                    <th colSpan={4} className="px-3 py-3 text-center whitespace-nowrap">
                      <Bilingual en="Medical Relief" si="වෛද්‍ය ආධාර" />
                    </th>
                    <th rowSpan={2} className="px-3 py-3 align-middle whitespace-nowrap">
                      <Bilingual en="Other" si="වෙනත්" />
                    </th>
                  </tr>
                  <tr>
                    <th className="px-3 py-3 whitespace-nowrap">
                      <Bilingual en="Kidney Disease" si="වකුගඩු රෝග" />
                    </th>
                    <th className="px-3 py-3 whitespace-nowrap">
                      <Bilingual en="Cancer" si="පිළිකා" />
                    </th>
                    <th className="px-3 py-3 whitespace-nowrap">
                      <Bilingual en="Thalassemia" si="තැලසීමියා" />
                    </th>
                    <th className="px-3 py-3 whitespace-nowrap">
                      <Bilingual en="Diabetes" si="දියවැඩියාව" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-3 py-3 nums-tabular">{allowanceCounts.disabilityAllowance.toLocaleString()}</td>
                    <td className="px-3 py-3 nums-tabular">{allowanceCounts.elderlyAllowance.toLocaleString()}</td>
                    <td className="px-3 py-3 nums-tabular">{allowanceCounts.nutritionAllowance.toLocaleString()}</td>
                    <td className="px-3 py-3 nums-tabular">{allowanceCounts.publicAssistance.toLocaleString()}</td>
                    <td className="px-3 py-3 nums-tabular">{allowanceCounts.diseaseAidWheelchair.toLocaleString()}</td>
                    <td className="px-3 py-3 nums-tabular">{allowanceCounts.diseaseAidCancer.toLocaleString()}</td>
                    <td className="px-3 py-3 nums-tabular">{allowanceCounts.diseaseAidThalassemia.toLocaleString()}</td>
                    <td className="px-3 py-3 nums-tabular">{allowanceCounts.diseaseAidDiabetes.toLocaleString()}</td>
                    <td className="px-3 py-3 nums-tabular">{allowanceCounts.other.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </SocialWelfareTableShell>
          </section>

          <section className="space-y-2">
            <h3 className="px-3 text-base font-semibold text-foreground">
              <Bilingual en="Information Regarding Elders' Homes" si="වැඩිහිටි නිවාස පිළිබඳ තොරතුරු" />
            </h3>
            <SocialWelfareTableShell>
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-muted/20 text-muted-foreground">
                  <tr>
                    <th rowSpan={2} className="border-b px-3 py-3 align-middle whitespace-nowrap">
                      <Bilingual en="Name of Elders' Home" si="වැඩිහිටි නිවාසයේ නම" />
                    </th>
                    <th rowSpan={2} className="border-b px-3 py-3 align-middle whitespace-nowrap">
                      <Bilingual en="Address" si="ලිපිනය" />
                    </th>
                    <th rowSpan={2} className="border-b px-3 py-3 align-middle whitespace-nowrap">
                      <Bilingual en="Managing Institution" si="පාලන ආයතනය" />
                    </th>
                    <th rowSpan={2} className="border-b px-3 py-3 align-middle whitespace-nowrap">
                      <Bilingual en="Telephone Number" si="දුරකථන අංකය" />
                    </th>
                    <th rowSpan={2} className="border-b px-3 py-3 align-middle whitespace-nowrap">
                      <Bilingual en="Requirement of Infrastructure Facilities" si="යටිතල පහසුකම් අවශ්‍යතා" />
                    </th>
                    <th rowSpan={2} className="border-b px-3 py-3 align-middle whitespace-nowrap">
                      <Bilingual en="Capacity of Elders' Home" si="වැඩිහිටි නිවාස ධාරිතාව" />
                    </th>
                    <th colSpan={2} className="border-b px-3 py-3 text-center whitespace-nowrap">
                      <Bilingual en="Current Number of Resident Elders" si="දැනට සිටින වැඩිහිටියන් සංඛ්‍යාව" />
                    </th>
                  </tr>
                  <tr>
                    <th className="border-b px-3 py-3 text-center whitespace-nowrap">
                      <Bilingual en="Female" si="ස්ත්‍රී" />
                    </th>
                    <th className="border-b px-3 py-3 text-center whitespace-nowrap">
                      <Bilingual en="Male" si="පුරුෂ" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {eldersHomesRows.length === 0 ? (
                    <tr className="border-b">
                      <td className="px-3 py-3 nums-tabular text-center">0</td>
                      <td className="px-3 py-3 nums-tabular text-center">0</td>
                      <td className="px-3 py-3 nums-tabular text-center">0</td>
                      <td className="px-3 py-3 nums-tabular text-center">0</td>
                      <td className="px-3 py-3 nums-tabular text-center">0</td>
                      <td className="px-3 py-3 nums-tabular text-center">0</td>
                      <td className="px-3 py-3 nums-tabular text-center">0</td>
                      <td className="px-3 py-3 nums-tabular text-center">0</td>
                    </tr>
                  ) : (
                    eldersHomesRows.map((row, index) => (
                      <tr key={`${row.gnId}-${row.name}-${index}`} className="border-b">
                        <td className="px-3 py-3">{row.name || "—"}</td>
                        <td className="px-3 py-3">{row.address || "—"}</td>
                        <td className="px-3 py-3">{authorityLabel(row.authority)}</td>
                        <td className="px-3 py-3 nums-tabular">{row.phone || "—"}</td>
                        <td className="px-3 py-3">{row.infrastructureNeeds || "—"}</td>
                        <td className="px-3 py-3 nums-tabular">{(row.capacity ?? 0).toLocaleString()}</td>
                        <td className="px-3 py-3 nums-tabular text-center">{(row.residentCount?.female ?? 0).toLocaleString()}</td>
                        <td className="px-3 py-3 nums-tabular text-center">{(row.residentCount?.male ?? 0).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </SocialWelfareTableShell>
          </section>

          <section className="space-y-2">
            <h3 className="px-3 text-base font-semibold text-foreground">
              <Bilingual
                en="Information Regarding Government and Voluntary Children's Homes"
                si="රාජ්‍ය හා ස්වේච්ඡා ළමා නිවාස පිළිබඳ තොරතුරු"
              />
            </h3>
            <SocialWelfareTableShell>
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-muted/20 text-muted-foreground">
                  <tr>
                    <th rowSpan={2} className="border-b px-3 py-3 align-middle whitespace-nowrap">
                      <Bilingual en="Name of Children's Home" si="ළමා නිවාසයේ නම" />
                    </th>
                    <th rowSpan={2} className="border-b px-3 py-3 align-middle whitespace-nowrap">
                      <Bilingual en="Address" si="ලිපිනය" />
                    </th>
                    <th rowSpan={2} className="border-b px-3 py-3 align-middle whitespace-nowrap">
                      <Bilingual en="Managing Institution" si="පාලන ආයතනය" />
                    </th>
                    <th rowSpan={2} className="border-b px-3 py-3 align-middle whitespace-nowrap">
                      <Bilingual en="Category" si="වර්ගය" />
                    </th>
                    <th rowSpan={2} className="border-b px-3 py-3 align-middle whitespace-nowrap">
                      <Bilingual en="Capacity of Children's Home" si="ළමා නිවාස ධාරිතාව" />
                    </th>
                    <th colSpan={3} className="border-b px-3 py-3 text-center whitespace-nowrap">
                      <Bilingual en="Current Number of Resident Children" si="දැනට සිටින ළමුන් සංඛ්‍යාව" />
                    </th>
                  </tr>
                  <tr>
                    <th className="border-b px-3 py-3 text-center whitespace-nowrap">
                      <Bilingual en="Female" si="ස්ත්‍රී" />
                    </th>
                    <th className="border-b px-3 py-3 text-center whitespace-nowrap">
                      <Bilingual en="Male" si="පුරුෂ" />
                    </th>
                    <th className="border-b px-3 py-3 text-center whitespace-nowrap">
                      <Bilingual en="Total" si="එකතුව" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {childrensHomesRows.length === 0 ? (
                    <tr className="border-b">
                      <td className="px-3 py-3 nums-tabular text-center">0</td>
                      <td className="px-3 py-3 nums-tabular text-center">0</td>
                      <td className="px-3 py-3 nums-tabular text-center">0</td>
                      <td className="px-3 py-3 nums-tabular text-center">0</td>
                      <td className="px-3 py-3 nums-tabular text-center">0</td>
                      <td className="px-3 py-3 nums-tabular text-center">0</td>
                      <td className="px-3 py-3 nums-tabular text-center">0</td>
                      <td className="px-3 py-3 nums-tabular text-center">0</td>
                    </tr>
                  ) : (
                    childrensHomesRows.map((row, index) => (
                      <tr key={`${row.gnId}-${row.name}-${index}`} className="border-b">
                        <td className="px-3 py-3">{row.name || "—"}</td>
                        <td className="px-3 py-3">{row.address || "—"}</td>
                        <td className="px-3 py-3">{childrensAuthorityLabel(row.authority)}</td>
                        <td className="px-3 py-3">{childrensCategoryLabel(row.type)}</td>
                        <td className="px-3 py-3 nums-tabular">{(row.capacity ?? 0).toLocaleString()}</td>
                        <td className="px-3 py-3 nums-tabular text-center">{(row.residentCount?.female ?? 0).toLocaleString()}</td>
                        <td className="px-3 py-3 nums-tabular text-center">{(row.residentCount?.male ?? 0).toLocaleString()}</td>
                        <td className="px-3 py-3 nums-tabular text-center">{((row.residentCount?.female ?? 0) + (row.residentCount?.male ?? 0)).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </SocialWelfareTableShell>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}

interface CommunityOrganizationDirectoryRow {
  id: string;
  name: string;
  address?: string;
  memberCount?: number;
  identifiedNeeds?: string;
}

function CommunityOrganizationDirectoryTable({
  titleEn,
  titleSi,
  nameHeaderEn,
  nameHeaderSi,
  rows,
  tableRef,
  isLoading,
  error,
  showAddress = true,
  showMembersAndNeeds = false,
}: {
  titleEn: string;
  titleSi: string;
  nameHeaderEn: string;
  nameHeaderSi: string;
  rows: CommunityOrganizationDirectoryRow[];
  tableRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  error: unknown;
  showAddress?: boolean;
  showMembersAndNeeds?: boolean;
}) {
  const colSpan = (showAddress ? 2 : 1) + (showMembersAndNeeds ? 2 : 0);

  return (
    <Card className="card-lift overflow-hidden border-border/60 shadow-md">
      <CardHeader>
        <CardTitle className="font-display text-fluid-xl font-semibold text-foreground">
          <Bilingual en={titleEn} si={titleSi} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-sm text-destructive">Unable to load organization data.</div>
        ) : isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (
          <div className="overflow-hidden rounded-md border border-border">
            <div ref={tableRef} className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3">
                      <Bilingual en={nameHeaderEn} si={nameHeaderSi} />
                    </th>
                    {showAddress && (
                      <th className="px-3 py-3">
                        <Bilingual en="Address" si="ලිපිනය" />
                      </th>
                    )}
                    {showMembersAndNeeds && (
                      <>
                        <th className="px-3 py-3">
                          <Bilingual en="Number of Members" si="සාමාජික සංඛ්‍යාව" />
                        </th>
                        <th className="px-3 py-3">
                          <Bilingual en="Identified Needs" si="හඳුනාගත් අවශ්‍යතා" />
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr className="border-t last:border-b">
                      <td colSpan={colSpan} className="px-3 py-6 text-center text-muted-foreground">
                        <Bilingual en="No records available for the selected division." si="තෝරාගත් වසම සඳහා වාර්තා නොමැත." />
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id} className="border-t last:border-b">
                        <td className="px-3 py-3 font-medium">{row.name || "—"}</td>
                        {showAddress && <td className="px-3 py-3">{row.address || "—"}</td>}
                        {showMembersAndNeeds && (
                          <>
                            <td className="px-3 py-3 nums-tabular">{(row.memberCount ?? 0).toLocaleString()}</td>
                            <td className="px-3 py-3">{row.identifiedNeeds || "—"}</td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t border-border/80 bg-muted/50 px-4 py-3 text-right">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => tableRef.current?.scrollIntoView({ behavior: "smooth" })}
              >
                <ArrowUp className="size-4" />
                <Bilingual en="Back to top" si="ඉහළට" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Page({ params }: { params: Promise<{ section: string }> }) {
  const { lang } = useLanguage();
  const { user } = useSession();
  const resolvedParams = React.use(params);
  const section = resolvedParams.section;
  const isIdentification = section === "identification";
  const isDemographics = section === "demographics";
  const isEmployment = section === "employment";
  const isStateInstitutionsLand = section === "state-institutions-land";
  const isPhysicalEnvironment = section === "physical-environment";
  const isHousing = section === "housing";
  const isEducation = section === "education";
  const isReligiousCultural = section === "religious-cultural";
  const isHealth = section === "health";
  const isEconomicAgriculture = section === "economic-agriculture";
  const isRoadInfrastructure = section === "road-infrastructure";
  const isSocialWelfare = section === "social-welfare";
  const isCommunityOrganizations = section === "community-organizations";
  const isTourism = section === "tourism";
  const isWasteDisaster = section === "waste-disaster";
  const [employmentGnDivision, setEmploymentGnDivision] = React.useState("all");
  const [religiousGnDivision, setReligiousGnDivision] = React.useState("all");
  const [socialWelfareGnDivision, setSocialWelfareGnDivision] = React.useState("all");
  const [communityOrganizationsGnDivision, setCommunityOrganizationsGnDivision] = React.useState("all");
  const [tourismGnDivision, setTourismGnDivision] = React.useState("all");
  const [wasteGnDivision, setWasteGnDivision] = React.useState("all");
  const showMahaweliColumn = user?.dsDivision === "hambantota-ds";
  const { data, error, isLoading } = useSWR(
    isIdentification ? "/api/registrations?role=gn&status=all&limit=100" : null,
    fetcher
  );

  const employmentGnOptions = React.useMemo(() => {
    if (!user?.dsDivision) return [];
    return GN_DIVISIONS
      .filter((gn) => gn.dsId === user.dsDivision)
      .sort((a, b) => (lang === "si" ? a.si : a.en).localeCompare(lang === "si" ? b.si : b.en));
  }, [user?.dsDivision, lang]);

  React.useEffect(() => {
    if (employmentGnDivision === "all") return;
    const stillExists = employmentGnOptions.some((gn) => gn.id === employmentGnDivision);
    if (!stillExists) setEmploymentGnDivision("all");
  }, [employmentGnDivision, employmentGnOptions]);

  React.useEffect(() => {
    if (religiousGnDivision === "all") return;
    const stillExists = employmentGnOptions.some((gn) => gn.id === religiousGnDivision);
    if (!stillExists) setReligiousGnDivision("all");
  }, [religiousGnDivision, employmentGnOptions]);

  React.useEffect(() => {
    if (socialWelfareGnDivision === "all") return;
    const stillExists = employmentGnOptions.some((gn) => gn.id === socialWelfareGnDivision);
    if (!stillExists) setSocialWelfareGnDivision("all");
  }, [socialWelfareGnDivision, employmentGnOptions]);

  React.useEffect(() => {
    if (communityOrganizationsGnDivision === "all") return;
    const stillExists = employmentGnOptions.some((gn) => gn.id === communityOrganizationsGnDivision);
    if (!stillExists) setCommunityOrganizationsGnDivision("all");
  }, [communityOrganizationsGnDivision, employmentGnOptions]);

  React.useEffect(() => {
    if (tourismGnDivision === "all") return;
    const stillExists = employmentGnOptions.some((gn) => gn.id === tourismGnDivision);
    if (!stillExists) setTourismGnDivision("all");
  }, [tourismGnDivision, employmentGnOptions]);

  React.useEffect(() => {
    if (wasteGnDivision === "all") return;
    const stillExists = employmentGnOptions.some((gn) => gn.id === wasteGnDivision);
    if (!stillExists) setWasteGnDivision("all");
  }, [wasteGnDivision, employmentGnOptions]);

  const title = isIdentification
    ? { en: "Identification", si: "හඳුනාගැනීම" }
    : isDemographics
    ? { en: "Division Demographics Overview", si: "ජනගහන සාරාංශය" }
    : isEmployment
    ? { en: "Employment", si: "රැකියා තොරතුරු" }
    : isStateInstitutionsLand
    ? { en: "State Institutions & Land", si: "රාජ්‍ය ආයතන හා ඉඩම්" }
    : isPhysicalEnvironment
    ? { en: "Physical & Environment", si: "භෞතික හා පාරිසරික තොරතුරු" }
    : isHousing
    ? { en: "Housing", si: "නිවාස තොරතුරු" }
    : isEducation
    ? { en: "Education", si: "අධ්‍යාපනය" }
    : isReligiousCultural
    ? { en: "Religious & Cultural", si: "ආගමික හා සංස්කෘතික" }
    : isHealth
    ? { en: "Health", si: "සෞඛ්‍යය" }
    : isEconomicAgriculture
    ? { en: "Economic — Agriculture / Industry", si: "ආර්ථික — කෘෂිකාර්මික/කාර්මික" }
    : isRoadInfrastructure
    ? { en: "Transport & Infrastructure Facilities", si: "ප්‍රවාහන හා යටිතල පහසුකම්" }
    : isSocialWelfare
    ? { en: "Social Welfare", si: "සමාජ සුබසාධන" }
    : isCommunityOrganizations
    ? {
        en: "Community / Govt / NGO Organizations",
        si: "ප්‍රජා / රාජ්‍ය / රාජ්‍ය නොවන සංවිධාන",
      }
    : isTourism
    ? { en: "Tourism", si: "සංචාරක" }
    : isWasteDisaster
    ? { en: "Waste Management", si: "කසළ කළමනාකරණය" }
    : { en: "Section details", si: "අංශයේ විස්තර" };

  const description = isIdentification
    ? {
        en: "View the complete administrative directory and details for your EDOs.",
        si: "ඔබගේ EDO සඳහා පූර්ණ පරිපාලන ඩිරෙක්ටරිය සහ විස්තර දැක්වීමට මෙහි ක්ලික් කරන්න.",
      }
    : isDemographics
    ? {
        en: "Explore comprehensive demographic data, population distribution, and household metrics for your division.",
        si: "ඔබගේ වසම් සඳහා සම්පූර්ණ ජනගහන දත්ත, ජනගහන විනිවුදු සහ ගෘහස්ථ මැට්‍රික්ස් අධ්‍යයනය කරන්න.",
      }
    : isEmployment
    ? {
        en: "Review employment-related indicators collected from GN divisions in your DS area.",
        si: "ඔබගේ ප්‍රාදේශීය ලේකම් කොට්ඨාසයේ ග්‍රාම නිලධාරී වසම්වලින් එකතු කළ රැකියා දර්ශක සමාලෝචනය කරන්න.",
      }
    : isStateInstitutionsLand
    ? {
        en: "Search or select a GN division to view its state institutions, encroached-land structures, and development projects.",
        si: "රාජ්‍ය ආයතන, අත්‍යවශ්‍ය නොවන ඉදිකිරීම් සහ සංවර්ධන ව්‍යාපෘති බැලීමට ග්‍රාම නිලධාරී වසමක් සොයන්න හෝ තෝරන්න.",
      }
    : isPhysicalEnvironment
    ? {
        en: "Search or select a GN division to view its water sources, sensitive zones, natural resources, hazards, and tourist sites.",
        si: "ජල මූලාශ්‍ර, සංවේදී කලාප, ස්වාභාවික සම්පත්, ආපදා සහ සංචාරක ස්ථාන බැලීමට ග්‍රාම නිලධාරී වසමක් සොයන්න හෝ තෝරන්න.",
      }
    : isHousing
    ? {
        en: "Search or select a GN division to view its housing stock, sanitation, drinking water sources, and electricity access data.",
        si: "නිවාස ප්‍රමාණය, සනීපාරක්ෂක පහසුකම්, පානීය ජල මූලාශ්‍ර සහ විදුලි පහසුකම් දත්ත බැලීමට ග්‍රාම නිලධාරී වසමක් සොයන්න හෝ තෝරන්න.",
      }
    : isEducation
    ? {
        en: "Search or select a GN division to view its schools, preschools, tertiary institutions, and education-related facilities.",
        si: "පාසල්, පෙර පාසල්, තෘතීයික අධ්‍යාපන ආයතන සහ අධ්‍යාපන පහසුකම් දත්ත බැලීමට ග්‍රාම නිලධාරී වසමක් සොයන්න හෝ තෝරන්න.",
      }
    : isReligiousCultural
    ? {
        en: "View aggregated religious and cultural information collected across your division.",
        si: "ඔබගේ වසම පුරා එක්රැස් කළ ආගමික හා සංස්කෘතික තොරතුරු එකතුව මෙහි දැකිය හැක.",
      }
    : isHealth
    ? {
        en: "Search or select a GN division to view its hospitals, healthcare units, pharmacies, and medical practitioners.",
        si: "රෝහල්, සෞඛ්‍ය සේවා ඒකක, ඖෂධශාලා සහ වෛද්‍ය වෘත්තිකයන් පිළිබඳ දත්ත බැලීමට ග්‍රාම නිලධාරී වසමක් සොයන්න හෝ තෝරන්න.",
      }
    : isEconomicAgriculture
    ? {
        en: "Search or select a GN division to view its land use, agriculture, livestock, industries, fisheries, and tea estates.",
        si: "ඉඩම් භාවිතය, කෘෂිකර්මාන්තය, සත්ත්ව පාලනය, කර්මාන්ත, ධීවර කර්මාන්තය සහ තේ වතු පිළිබඳ දත්ත බැලීමට ග්‍රාම නිලධාරී වසමක් සොයන්න හෝ තෝරන්න.",
      }
    : isRoadInfrastructure
    ? {
        en: "Search or select a GN division to view its roads, bridges, public transport gaps, utilities, and other infrastructure facilities.",
        si: "පාරවල්, පාලම්, මහජන ප්‍රවාහන හිඩැස්, උපයෝගිතා සේවා සහ අනෙකුත් යටිතල පහසුකම් දත්ත බැලීමට ග්‍රාම නිලධාරී වසමක් සොයන්න හෝ තෝරන්න.",
      }
    : isSocialWelfare
    ? {
        en: "Review social welfare counts collected from the relevant division.",
        si: "අදාළ වසමෙන් එකතු කළ සමාජ සුබසාධන සංඛ්‍යා මෙහි පරීක්ෂා කරන්න.",
      }
    : isCommunityOrganizations
    ? {
        en: "Review community, governmental, and non-governmental organization categories captured for your division.",
        si: "ඔබගේ වසම සඳහා සටහන් කර ඇති ප්‍රජාමූල, රාජ්‍ය සහ රාජ්‍ය නොවන සංවිධාන කාණ්ඩ මෙහි පරීක්ෂා කරන්න.",
      }
    : isTourism
    ? {
        en: "View tourism accommodation counts and room capacity for the selected GN division or across all GN divisions.",
        si: "තෝරාගත් ග්‍රාම නිලධාරී වසමට හෝ සියලු වසම් සඳහා සංචාරක නවාතැන් සහ කාමර ධාරිතා සංඛ්‍යා බලන්න.",
      }
    : isWasteDisaster
    ? {
        en: "Review solid waste collection arrangements, collection frequency and method, and disposal practices across the division.",
        si: "වසම පුරා ඝන අපද්‍රව්‍ය එකතු කිරීමේ විධිවිධාන, එකතු කිරීමේ වාරගණන හා ක්‍රමවේදය, සහ බැහැර කිරීමේ පිළිවෙත් සමාලෝචනය කරන්න.",
      }
    : {
        en: "This section is not available yet. Please return to the division information overview.",
        si: "මෙම කොටස තවම ලබා ගත නොහැක. කරුණාකර වසම් තොරතුරු ප්‍රස්ථාරයට ආපසු යන්න.",
      };

  const analyticsUrl = React.useMemo(() => {
    if (!isDemographics && !isEmployment && !isReligiousCultural && !isSocialWelfare && !isCommunityOrganizations && !isTourism && !isWasteDisaster) return null;
    const params = new URLSearchParams({ year: String(CURRENT_YEAR) });
    if (isEmployment && employmentGnDivision !== "all") {
      params.set("gnDivisions", employmentGnDivision);
    }
    if (isReligiousCultural && religiousGnDivision !== "all") {
      params.set("gnDivisions", religiousGnDivision);
    }
    if (isSocialWelfare && socialWelfareGnDivision !== "all") {
      params.set("gnDivisions", socialWelfareGnDivision);
    }
    if (isCommunityOrganizations && communityOrganizationsGnDivision !== "all") {
      params.set("gnDivisions", communityOrganizationsGnDivision);
    }
    if (isTourism && tourismGnDivision !== "all") {
      params.set("gnDivisions", tourismGnDivision);
    }
    if (isWasteDisaster && wasteGnDivision !== "all") {
      params.set("gnDivisions", wasteGnDivision);
    }
    return `/api/analytics?${params.toString()}`;
  }, [
    isDemographics,
    isEmployment,
    isReligiousCultural,
    isSocialWelfare,
    isCommunityOrganizations,
    isTourism,
    isWasteDisaster,
    employmentGnDivision,
    religiousGnDivision,
    socialWelfareGnDivision,
    communityOrganizationsGnDivision,
    tourismGnDivision,
    wasteGnDivision,
  ]);

  const { data: analytics, error: analyticsError } = useSWR(analyticsUrl, analyticsFetcher);

  const employmentEducationRows = React.useMemo(() => {
    const employment = analytics?.sections.employment;

    return [
      {
        en: "Number of job seekers who have received vocational training",
        si: "වෘත්තීය පුහුණුව ලබා ඇති රැකියා අපේක්ෂකයන් සංඛ්‍යාව",
        count: employment?.jobSeekersByEducation[0]?.count ?? 0,
      },
      {
        en: "Number of job seekers with qualifications below G.C.E. O/L",
        si: "අ.පො.ස. සාමාන්‍ය පෙළට අඩු සුදුසුකම් ඇති රැකියා අපේක්ෂකයන් සංඛ්‍යාව",
        count: employment?.jobSeekersByEducation[1]?.count ?? 0,
      },
      {
        en: "Number of people seeking employment with G.C.E. O/L passes",
        si: "අ.පො.ස. සාමාන්‍ය පෙළ සමත් රැකියා අපේක්ෂකයන් සංඛ්‍යාව",
        count: employment?.jobSeekersByEducation[2]?.count ?? 0,
      },
      {
        en: "Number of people seeking employment after passing Advanced Level",
        si: "අ.පො.ස. උසස් පෙළ සමත් රැකියා අපේක්ෂකයන් සංඛ්‍යාව",
        count: employment?.jobSeekersByEducation[3]?.count ?? 0,
      },
      {
        en: "Number of job seekers with bachelor's degree or higher qualifications",
        si: "උපාධිය හෝ ඊට ඉහළ සුදුසුකම් ඇති රැකියා අපේක්ෂකයන් සංඛ්‍යාව",
        count: employment?.jobSeekersByEducation[4]?.count ?? 0,
      },
      {
        en: "Total number of persons expected to be employed",
        si: "රැකියාවට එක්වීමට අපේක්ෂිත මුළු පුද්ගලයන් සංඛ්‍යාව",
        count: employment?.totalJobSeekers ?? 0,
      },
    ];
  }, [analytics]);

  const employmentTrainingNeedRows = React.useMemo(() => {
    const employment = analytics?.sections.employment;

    return [
      {
        en: "Number of people with informal training who need to obtain formal, certified training but do not have the opportunity to do so (due to reasons such as increasing age)",
        si: "අවිධිමත් පුහුණුවක් ඇති නමුත් වයස වැඩිවීම වැනි හේතු නිසා විධිමත් සහතික ලත් පුහුණුවක් ලබා ගැනීමට අවස්ථාව නොලැබෙන පුද්ගලයන් සංඛ්‍යාව",
        enLines: [
          "Number of people with informal training who need to obtain formal, certified training",
          "but do not have the opportunity to do so (due to reasons such as increasing age)",
        ],
        siLines: [
          "විධිමත් සහතික ලත් පුහුණුවක් ලබා ගැනීමට අවශ්‍ය අවිධිමත් පුහුණුවක් ඇති පුද්ගලයන් සංඛ්‍යාව",
          "වයස වැඩිවීම වැනි හේතු නිසා එම අවස්ථාව නොලැබෙන අය",
        ],
        count: employment?.vocationalTrainingOpportunityGapCount ?? 0,
      },
    ];
  }, [analytics]);

  const selfEmploymentActivityRows = React.useMemo(() => {
    const sectors = analytics?.sections.employment.selfEmploymentSectors ?? [];
    const countByLabel = new Map(sectors.map((sector) => [sector.en, sector.count]));

    type SelfEmploymentActivityMapping = {
      en: string;
      si: string;
      sourceLabel?: string;
    };

    const directMappings: SelfEmploymentActivityMapping[] = [
      {
        en: "Food production",
        si: "ආහාර නිෂ්පාදනය",
        sourceLabel: "Food Production",
      },
      {
        en: "Sweets / Confectionery production",
        si: "රසකැවිලි / කොන්ෆෙක්ෂනරි නිෂ්පාදනය",
        sourceLabel: "Confectionery",
      },
      {
        en: "Spices / Condiments production",
        si: "කුළුබඩු / රසකාරක නිෂ්පාදනය",
      },
      {
        en: "Rice packet preparation / production",
        si: "බත් පැකට් සකස් කිරීම / නිෂ්පාදනය",
      },
      {
        en: "Bakery products / production",
        si: "බේකරි නිෂ්පාදන / නිෂ්පාදනය",
        sourceLabel: "Bakery Production",
      },
      {
        en: "Garment / Apparel manufacturing",
        si: "ඇඟලුම් / ඇපරල් නිෂ්පාදනය",
        sourceLabel: "Textile Production",
      },
      {
        en: "Dressmaking / Tailoring",
        si: "ඇඳුම් මැසීම / ටේලරින්",
        sourceLabel: "Garment Sewing",
      },
      {
        en: "Doormat production",
        si: "පාපිස්නා නිෂ්පාදනය",
      },
      {
        en: "Beeralu / Lace production",
        si: "බීරලු / ලේස් නිෂ්පාදනය",
        sourceLabel: "Knitting",
      },
      {
        en: "Handicrafts / Ornamental items production",
        si: "අත්කම් / අලංකාර භාණ්ඩ නිෂ්පාදනය",
        sourceLabel: "Decorative Items",
      },
      {
        en: "Coconut shell-based products",
        si: "පොල් කටු ආශ්‍රිත නිෂ්පාදන",
        sourceLabel: "Coconut Shell Crafts",
      },
      {
        en: "Soldering works",
        si: "පෑස්සුම් වැඩ",
      },
      {
        en: "Motor vehicle repair",
        si: "මෝටර් වාහන අලුත්වැඩියාව",
        sourceLabel: "Auto Mechanic",
      },
      {
        en: "Bicycle repair",
        si: "බයිසිකල් අලුත්වැඩියාව",
      },
      {
        en: "Masonry industry",
        si: "පෙදරේරු කර්මාන්තය",
        sourceLabel: "Masonry Work",
      },
      {
        en: "Carpentry industry",
        si: "වඩු කර්මාන්තය",
        sourceLabel: "Carpentry",
      },
      {
        en: "Electrical equipment repair",
        si: "විදුලි උපකරණ අලුත්වැඩියාව",
        sourceLabel: "Electrical Appliance Repair",
      },
      {
        en: "Jewelry manufacturing",
        si: "ස්වර්ණාභරණ නිෂ්පාදනය",
      },
      {
        en: "Concrete block production",
        si: "කොන්ක්‍රීට් බ්ලොක් නිෂ්පාදනය",
        sourceLabel: "Brick Making",
      },
      {
        en: "Cinnamon peeling",
        si: "කුරුඳු තැලීම",
      },
      {
        en: "Fish-based products (dry fish, Jaadi, etc.)",
        si: "මාළු ආශ්‍රිත නිෂ්පාදන (කරවල, ජාඩි ආදිය)",
        sourceLabel: "Seafood Processing",
      },
      {
        en: "Fishing gear repair",
        si: "ධීවර ආම්පන්න අලුත්වැඩියාව",
      },
      {
        en: "Fish selling (via vehicles)",
        si: "ජංගම රථ මගින් මාළු අලෙවිය",
        sourceLabel: "Fish Transport / Other",
      },
    ];

    const usedSourceLabels = new Set<string>();
    const rows = directMappings.map((item) => {
      if (item.sourceLabel) usedSourceLabels.add(item.sourceLabel);
      return {
        en: item.en,
        si: item.si,
        count: item.sourceLabel ? (countByLabel.get(item.sourceLabel) ?? 0) : 0,
      };
    });

    const otherCount = sectors.reduce((sum, sector) => {
      return usedSourceLabels.has(sector.en) ? sum : sum + sector.count;
    }, 0);

    rows.push({
      en: "Other",
      si: "වෙනත්",
      count: otherCount,
    });

    return rows;
  }, [analytics]);

  const selfEmployedPersonRows = React.useMemo(() => {
    const rows = analytics?.sections.employment.selfEmployedPersons.rows ?? [];
    return rows.map((row, index) => ({
      id: `${row.gnId}-${row.name}-${index}`,
      field: row.sector,
      personName: row.name,
      telephone: row.phone ?? "—",
      market: row.address,
    }));
  }, [analytics]);

  const religiousHeritageRows = React.useMemo(() => {
    const rows = analytics?.sections.areaProfile.heritageSites.rows ?? [];
    if (!user?.dsDivision) return rows;

    const allowedGnIds = new Set(
      GN_DIVISIONS.filter((gn) => gn.dsId === user.dsDivision).map((gn) => gn.id)
    );

    const dsScoped = rows.filter((row) => allowedGnIds.has(row.gnId));
    if (religiousGnDivision === "all") return dsScoped;
    return dsScoped.filter((row) => row.gnId === religiousGnDivision);
  }, [analytics, user?.dsDivision, religiousGnDivision]);

  const religiousArtAcademyRows = React.useMemo(() => {
    const rows = analytics?.sections.areaProfile.artAcademies.rows ?? [];
    if (!user?.dsDivision) return rows;

    const allowedGnIds = new Set(
      GN_DIVISIONS.filter((gn) => gn.dsId === user.dsDivision).map((gn) => gn.id)
    );

    const dsScoped = rows.filter((row) => allowedGnIds.has(row.gnId));
    if (religiousGnDivision === "all") return dsScoped;
    return dsScoped.filter((row) => row.gnId === religiousGnDivision);
  }, [analytics, user?.dsDivision, religiousGnDivision]);

  const religiousTraditionalArtistRows = React.useMemo(() => {
    const rows = analytics?.sections.areaProfile.traditionalArtists.rows ?? [];
    if (!user?.dsDivision) return rows;

    const allowedGnIds = new Set(
      GN_DIVISIONS.filter((gn) => gn.dsId === user.dsDivision).map((gn) => gn.id)
    );

    const dsScoped = rows.filter((row) => allowedGnIds.has(row.gnId));
    if (religiousGnDivision === "all") return dsScoped;
    return dsScoped.filter((row) => row.gnId === religiousGnDivision);
  }, [analytics, user?.dsDivision, religiousGnDivision]);

  const gnTotals = React.useMemo(() => {
    if (!analytics) return { totalPopulation: 0, female: 0, male: 0, families: 0 };

    return analytics.gnBreakdown.reduce(
      (acc, g) => {
        const demo = g.demographics;
        if (!demo) return acc;

        acc.totalPopulation += demo.totalPopulation;
        acc.female += demo.female;
        acc.male += demo.male;
        acc.families += demo.households.total;
        return acc;
      },
      { totalPopulation: 0, female: 0, male: 0, families: 0 }
    );
  }, [analytics]);

  const gnReligionTotals = React.useMemo(() => {
    if (!analytics) return { buddhist: 0, hindu: 0, islam: 0, catholic: 0, otherChristians: 0, other: 0, collection: 0 };

    return analytics.gnBreakdown.reduce((acc, g) => {
      const demo = g.demographics;
      if (!demo) return acc;

      const counts = demo.populationByReligion.reduce(
        (sum, row) => {
          if (row.key === "buddhist") sum.buddhist += row.total;
          if (row.key === "hindu") sum.hindu += row.total;
          if (row.key === "islam") sum.islam += row.total;
          if (row.key === "catholic") sum.catholic += row.total;
          if (row.key === "other") sum.otherChristians += row.total;
          return sum;
        },
        { buddhist: 0, hindu: 0, islam: 0, catholic: 0, otherChristians: 0 }
      );

      const collection = counts.buddhist + counts.hindu + counts.islam + counts.catholic + counts.otherChristians;
      acc.buddhist += counts.buddhist;
      acc.hindu += counts.hindu;
      acc.islam += counts.islam;
      acc.catholic += counts.catholic;
      acc.otherChristians += counts.otherChristians;
      acc.other += Math.max(0, demo.totalPopulation - collection);
      acc.collection += collection;
      return acc;
    }, {
      buddhist: 0,
      hindu: 0,
      islam: 0,
      catholic: 0,
      otherChristians: 0,
      other: 0,
      collection: 0,
    });
  }, [analytics]);

  const gnEthnicityTotals = React.useMemo(() => {
    if (!analytics) return {
      sinhala: 0,
      sriLankanTamil: 0,
      indianTamil: 0,
      sriLankanYonaka: 0,
      burgher: 0,
      malay: 0,
      other: 0,
      collection: 0,
    };

    return analytics.gnBreakdown.reduce((acc, g) => {
      const demo = g.demographics;
      if (!demo) return acc;

      const sinhala = demo.populationByEthnicity.find((row) => row.key === "sinhala")?.total ?? 0;
      const tamil = demo.populationByEthnicity.find((row) => row.key === "tamil")?.total ?? 0;
      const muslim = demo.populationByEthnicity.find((row) => row.key === "muslim")?.total ?? 0;
      const malay = demo.populationByEthnicity.find((row) => row.key === "malay")?.total ?? 0;
      const burgher = demo.populationByEthnicity.find((row) => row.key === "burgher")?.total ?? 0;
      const other = demo.populationByEthnicity.find((row) => row.key === "other")?.total ?? 0;
      const collection = sinhala + tamil + muslim + malay + burgher + other;

      acc.sinhala += sinhala;
      acc.sriLankanTamil += tamil;
      acc.indianTamil += 0;
      acc.sriLankanYonaka += muslim;
      acc.burgher += burgher;
      acc.malay += malay;
      acc.other += other;
      acc.collection += collection;
      return acc;
    }, {
      sinhala: 0,
      sriLankanTamil: 0,
      indianTamil: 0,
      sriLankanYonaka: 0,
      burgher: 0,
      malay: 0,
      other: 0,
      collection: 0,
    });
  }, [analytics]);

  const gnForeignNationalsTotals = React.useMemo(() => {
    if (!analytics) return { female: 0, male: 0, collection: 0 };

    return analytics.gnBreakdown.reduce(
      (acc, g) => {
        const foreign = g.demographics?.foreignNationals;
        if (!foreign) return acc;

        acc.female += foreign.female;
        acc.male += foreign.male;
        acc.collection += foreign.total;
        return acc;
      },
      { female: 0, male: 0, collection: 0 }
    );
  }, [analytics]);

  const gnHouseholdsTotals = React.useMemo(() => {
    if (!analytics) return { totalHouseholds: 0, femaleHeadedHouseholds: 0, displacedHouseholds: 0 };

    return analytics.gnBreakdown.reduce(
      (acc, g) => {
        const households = g.demographics?.households;
        if (!households) return acc;

        acc.totalHouseholds += households.total;
        acc.femaleHeadedHouseholds += households.femaleHeaded;
        acc.displacedHouseholds += households.displaced;
        return acc;
      },
      { totalHouseholds: 0, femaleHeadedHouseholds: 0, displacedHouseholds: 0 }
    );
  }, [analytics]);

  const gnRegisteredVotersTotals = React.useMemo(() => {
    if (!analytics) return { female: 0, male: 0, total: 0 };

    return analytics.gnBreakdown.reduce(
      (acc, g) => {
        const voters = g.demographics?.registeredVoters;
        if (!voters) return acc;

        acc.female += voters.female;
        acc.male += voters.male;
        acc.total += voters.total;
        return acc;
      },
      { female: 0, male: 0, total: 0 }
    );
  }, [analytics]);

  if (isSocialWelfare) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-fluid-3xl font-semibold text-primary">
              <Bilingual en={title.en} si={title.si} />
            </h1>
            <p className="mt-2 text-fluid-sm text-muted-foreground">
              <Bilingual en={description.en} si={description.si} />
            </p>
          </div>
          <Button asChild variant="outline" className="h-11">
            <Link href="/divisional-secretariat/graphs" className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              <Bilingual en="Back to dashboard" si="පුවරුවට ආපසු" />
            </Link>
          </Button>
        </div>

        <div className="mb-6 max-w-sm space-y-1">
          <p className="text-fluid-xs font-medium text-muted-foreground">
            <Bilingual en="Filter by GN Division" si="ග්‍රාම නිලධාරී වසම අනුව පෙරහන්න" />
          </p>
          <Select value={socialWelfareGnDivision} onValueChange={setSocialWelfareGnDivision}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{lang === "si" ? "සියලුම ග්‍රාම නිලධාරී වසම්" : "All GN divisions"}</SelectItem>
              {employmentGnOptions.map((gn) => (
                <SelectItem key={gn.id} value={gn.id}>
                  {lang === "si" ? gn.si : gn.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <SocialWelfareTable communityWelfare={analytics?.sections.communityWelfare} isLoading={isLoading} error={analyticsError} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-fluid-3xl font-semibold text-primary">
            <Bilingual en={title.en} si={title.si} />
          </h1>
          <p className="mt-2 text-fluid-sm text-muted-foreground">
            <Bilingual en={description.en} si={description.si} />
          </p>
        </div>
        <Button asChild variant="outline" className="h-11">
          <Link href="/divisional-secretariat/graphs" className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            <Bilingual en="Back to dashboard" si="පුවරුවට ආපසු" />
          </Link>
        </Button>
      </div>

      {isStateInstitutionsLand ? (
        <StateInstitutionsLandView />
      ) : isPhysicalEnvironment ? (
        <PhysicalEnvironmentView />
      ) : isHousing ? (
        <HousingView />
      ) : isEducation ? (
        <EducationView />
      ) : isHealth ? (
        <HealthView />
      ) : isEconomicAgriculture ? (
        <EconomicAgricultureView />
      ) : isRoadInfrastructure ? (
        <RoadInfrastructureView />
      ) : isDemographics ? (
        <DivisionDemographicsSection
          lang={lang}
          analytics={analytics}
          analyticsError={analyticsError}
          gnTotals={gnTotals}
          gnReligionTotals={gnReligionTotals}
          gnEthnicityTotals={gnEthnicityTotals}
          gnForeignNationalsTotals={gnForeignNationalsTotals}
          gnHouseholdsTotals={gnHouseholdsTotals}
          gnRegisteredVotersTotals={gnRegisteredVotersTotals}
        />
      ) : isEmployment ? (
        <EmploymentSectionView
          lang={lang}
          employmentGnDivision={employmentGnDivision}
          onEmploymentGnDivisionChange={setEmploymentGnDivision}
          employmentGnOptions={employmentGnOptions}
          analyticsError={analyticsError}
          hasAnalytics={!!analytics}
          employmentEducationRows={employmentEducationRows}
          employmentTrainingNeedRows={employmentTrainingNeedRows}
          selfEmploymentActivityRows={selfEmploymentActivityRows}
          selfEmployedPersonRows={selfEmployedPersonRows}
        />
      ) : isReligiousCultural ? (
        <ReligiousCulturalSectionView
          lang={lang}
          religiousGnDivision={religiousGnDivision}
          onReligiousGnDivisionChange={setReligiousGnDivision}
          employmentGnOptions={employmentGnOptions}
          analyticsError={analyticsError}
          hasAnalytics={!!analytics}
          religiousSiteCounts={analytics?.sections.areaProfile.religiousSiteCounts}
          religiousHeritageRows={religiousHeritageRows}
          religiousArtAcademyRows={religiousArtAcademyRows}
          religiousTraditionalArtistRows={religiousTraditionalArtistRows}
        />
      ) : isTourism ? (
        <TourismSectionView
          lang={lang}
          tourismGnDivision={tourismGnDivision}
          onTourismGnDivisionChange={setTourismGnDivision}
          employmentGnOptions={employmentGnOptions}
          analyticsError={analyticsError}
          areaProfile={analytics?.sections.areaProfile}
        />
      ) : isCommunityOrganizations ? (
        <CommunityOrganizationsSection
          lang={lang}
          communityOrganizationsGnDivision={communityOrganizationsGnDivision}
          onCommunityOrganizationsGnDivisionChange={setCommunityOrganizationsGnDivision}
          employmentGnOptions={employmentGnOptions}
          analyticsError={analyticsError}
          analytics={analytics}
        />
      ) : isWasteDisaster ? (
        <WasteDisasterSectionView
          lang={lang}
          wasteGnDivision={wasteGnDivision}
          onWasteGnDivisionChange={setWasteGnDivision}
          employmentGnOptions={employmentGnOptions}
          analyticsError={analyticsError}
          areaProfile={analytics?.sections.areaProfile}
        />
      ) : !isIdentification ? (
        <Card>
          <CardContent className="text-fluid-sm text-muted-foreground">
            <Bilingual
              en="This section has not been implemented yet. Choose a different area from the division overview."
              si="මෙම කොටස තවම ක්‍රියාත්මක කර නොමැත. වසම් සාරාංශයෙන් වෙනත් ප්‍රදේශයක් තෝරන්න."
            />
          </CardContent>
        </Card>
      ) : isLoading ? (
        <PageSkeleton />
      ) : error ? (
        <Card>
          <CardContent className="text-fluid-sm text-muted-foreground">
            <Bilingual
              en="Unable to load registration details right now. Please try again shortly."
              si="ලියාපදිංචි විස්තර මෙම මොහොතේ පූරණය කළ නොහැක. ටික වේලාවකින් නැවත උත්සාහ කරන්න."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>
                  <Bilingual en="Field" si="ක්ෂේත්‍රය" />
                </TableHead>
                <TableHead>
                  <Bilingual en="Detail" si="විස්තර" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((row) => {
                const gn = GN_DIVISIONS.find((g) => g.id === row.gnDivision);
                const gnName = gn ? (lang === "si" ? gn.si : gn.en) : row.gnDivision;
                const gnNumber = row.gnDivision;

                const fields = [
                  {
                    type: "regular",
                    label_en: "Name of the Grama Niladhari (GN) Division",
                    label_si: "ග්‍රාම නිලධාරී වසමේ නම",
                    value: gnName,
                  },
                  {
                    type: "regular",
                    label_en: "Grama Niladhari Division Number",
                    label_si: "ග්‍රාම නිලධාරී වසම අංකය",
                    value: gnNumber,
                  },
                  {
                    type: "header",
                    label_en: "Name of the Information Providing Officer",
                    label_si: "තොරතුරු සපයන නිලධාරීගේ නම",
                  },
                  {
                    type: "sub-item",
                    label_en: "Designation",
                    label_si: "තනතුර",
                    value: "—",
                  },
                  {
                    type: "sub-item",
                    label_en: "Telephone Number",
                    label_si: "දුරකථන අංකය",
                    value: row.phone ?? "—",
                  },
                  {
                    type: "header",
                    label_en: "Administrative / Jurisdictional Areas of the GN Division",
                    label_si: "ග්‍රාම නිලධාරී වසමේ පරිපාලන / බල ප්‍රදේශ",
                  },
                  {
                    type: "sub-item",
                    label_en: "District",
                    label_si: "දිස්ත්‍රික්කය",
                    value: row.district ?? "—",
                  },
                  {
                    type: "sub-item",
                    label_en: "Divisional Secretariat Division",
                    label_si: "ප්‍රාදේශීය ලේකම් කොට්ඨාශය",
                    value: row.divisionalSecretariat ?? "—",
                  },
                  {
                    type: "sub-item",
                    label_en: "Local Government Authority / Area",
                    label_si: "පළාත් පාලන ආයතනය / ප්‍රදේශය",
                    value: row.localGovt ?? "—",
                  },
                  {
                    type: "sub-item",
                    label_en: "Electoral Division",
                    label_si: "මැතිවරණ බල ප්‍රදේශය",
                    value: row.electoral ?? "—",
                  },
                  {
                    type: "sub-item",
                    label_en: "Agrarian Services Centre",
                    label_si: "ගොවි සේවා මධ්‍යස්ථානය",
                    value: row.farmers ?? "—",
                  },
                  {
                    type: "sub-item",
                    label_en: "Education Zone",
                    label_si: "අධ්‍යාපන කලාපය",
                    value: row.eduZone ?? "—",
                  },
                  {
                    type: "sub-item",
                    label_en: "Education Division",
                    label_si: "අධ්‍යාපන කොට්ඨාසය",
                    value: row.eduDiv ?? "—",
                  },
                ];

                if (showMahaweliColumn) {
                  fields.push({
                    type: "sub-item",
                    label_en: "Mahaweli Zone",
                    label_si: "මහවැලි කොට්ඨාසය",
                    value: row.mahaweli ?? "—",
                  });
                }

                return (
                  <React.Fragment key={row.id}>
                    {fields.map((field, index) => {
                      if (field.type === "header") {
                        return (
                          <TableRow
                            key={`${row.id}-${index}`}
                            className="bg-muted/50 hover:bg-muted/60"
                          >
                            <TableCell colSpan={2} className="font-semibold py-3">
                              <Bilingual en={field.label_en} si={field.label_si} />
                            </TableCell>
                          </TableRow>
                        );
                      }

                      if (field.type === "sub-item") {
                        return (
                          <TableRow key={`${row.id}-${index}`}>
                            <TableCell className="font-medium w-1/3 pl-8">
                              <Bilingual en={field.label_en} si={field.label_si} />
                            </TableCell>
                            <TableCell className="w-2/3">{field.value}</TableCell>
                          </TableRow>
                        );
                      }

                      return (
                        <TableRow key={`${row.id}-${index}`}>
                          <TableCell className="font-medium w-1/3">
                            <Bilingual en={field.label_en} si={field.label_si} />
                          </TableCell>
                          <TableCell className="w-2/3">{field.value}</TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}