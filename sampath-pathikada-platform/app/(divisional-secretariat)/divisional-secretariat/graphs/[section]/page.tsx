"use client";

import * as React from "react";
import useSWR from "swr";
import Link from "next/link";
import { ArrowLeft, ArrowUp, Globe2, Home, MapPin, Users, UserCheck, Eye } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

function TopicCard({
  icon: Icon,
  titleEn,
  titleSi,
  onClick,
  buttonLabel,
}: {
  icon: LucideIcon;
  titleEn: string;
  titleSi: string;
  onClick?: () => void;
  buttonLabel?: { en: string; si: string };
}) {
  return (
    <Card className="card-lift overflow-hidden border-border/60 shadow-md">
      <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <CardTitle className="min-w-0 font-display text-fluid-2xl font-semibold text-foreground">
            <Bilingual en={titleEn} si={titleSi} />
          </CardTitle>
        </div>
        <div className="flex items-start justify-end">
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={onClick}>
            <Eye className="size-4" />
            <Bilingual en={buttonLabel?.en ?? "View"} si={buttonLabel?.si ?? "බලන්න"} />
          </Button>
        </div>
      </CardHeader>
    </Card>
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

const COMMUNITY_ORGANIZATION_CARDS: Array<{ en: string; si: string }> = [
  {
    en: "Community, Governmental, and Non-Governmental Organizations",
    si: "ප්‍රජාමූල, රාජ්‍ය හා රාජ්‍ය නොවන සංවිධාන",
  },
  { en: "Village Development Societies", si: "ග්‍රාම සංවර්ධන සමිති" },
  { en: "Youth Clubs", si: "යෞවන සමාජ" },
  { en: "Sports Clubs", si: "ක්‍රීඩා සමාජ" },
  { en: "Funeral Welfare Societies", si: "අවමංගල්‍යාධාර හා සුභසාධක සමිති" },
  { en: "Women's Societies", si: "කාන්තා සමිති" },
  { en: "Senior Citizens' Societies", si: "වැඩිහිටි සමිති" },
  { en: "Children's Clubs", si: "ළමා සමාජ" },
  { en: "Samurdhi Societies", si: "සමෘද්ධි සමිති" },
  {
    en: 'Mithuru Organizations / Mithuru Partnerships',
    si: 'මිතුරු සංවිධාන / මිතුරු හවුල්',
  },
  { en: "Non-Governmental Organizations", si: "රාජ්‍ය නොවන සංවිධාන" },
  { en: "Farmers' Societies", si: "ගොවි සමිති" },
  { en: "Religious Societies", si: "ආගමික සමිති" },
  { en: "Sanasa (Credit/Microfinance) Society", si: "සණස (ණය / සුළු මූල්‍ය) සමිති" },
  { en: "Civil Defense Committees", si: "සිවිල් ආරක්ෂක කමිටු" },
  { en: "Community Empowerment Societies", si: "ප්‍රජා සවිබල ගැන්වීමේ සමිති" },
  {
    en: "Information Regarding Cooperative Societies Operating Within the Grama Niladhari Division",
    si: "ග්‍රාම නිලධාරී වසම තුළ ක්‍රියාත්මක සමූපකාර සමිති පිළිබඳ තොරතුරු",
  },
];

const COMMUNITY_ORGANIZATION_TABLE_ROWS: Array<{ en: string; si: string; matchEn: string[] }> = [
  {
    en: "Village Development Society",
    si: "ග්‍රාම සංවර්ධන සමිතිය",
    matchEn: ["Village Development Society"],
  },
  {
    en: "Youth Club",
    si: "යෞවන සමාජය",
    matchEn: ["Youth Society", "Youth Club"],
  },
  {
    en: "Sports Club",
    si: "ක්‍රීඩා සමාජය",
    matchEn: ["Sports Club"],
  },
  {
    en: "Funeral Welfare Society",
    si: "අවමංගල්‍යාධාර හා සුභසාධක සමිතිය",
    matchEn: ["Funeral Aid Society", "Funeral Welfare Society"],
  },
  {
    en: "Women's Society",
    si: "කාන්තා සමිතිය",
    matchEn: ["Women's Society"],
  },
  {
    en: "Senior Citizens' Society",
    si: "වැඩිහිටි සමිතිය",
    matchEn: ["Elders' Society", "Senior Citizens' Society"],
  },
  {
    en: "Children's Club",
    si: "ළමා සමාජය",
    matchEn: ["Children's Society", "Children's Club"],
  },
  {
    en: "Samurdhi Society",
    si: "සමෘද්ධි සමිතිය",
    matchEn: ["Samurdhi Society"],
  },
  {
    en: "Mithuru Organization / Mithuru Partnership",
    si: "මිතුරු සංවිධාන / මිතුරු හවුල්",
    matchEn: ["Friend Organization / Association", "Mithuru Organization / Mithuru Partnership"],
  },
  {
    en: "Non-Governmental Organization",
    si: "රාජ්‍ය නොවන සංවිධානය",
    matchEn: ["Non-Governmental Organization Committee", "Non-Governmental Organization"],
  },
  {
    en: "Farmers' Society",
    si: "ගොවි සමිතිය",
    matchEn: ["Farmer Society", "Farmers' Society"],
  },
  {
    en: "Religious Society",
    si: "ආගමික සමිතිය",
    matchEn: ["Religious Society"],
  },
  {
    en: "Sanasa (Credit/Microfinance) Society",
    si: "සණස (ණය / සුළු මූල්‍ය) සමිතිය",
    matchEn: ["SANASA Society", "Sanasa (Credit/Microfinance) Society"],
  },
  {
    en: "Civil Defense Committees",
    si: "සිවිල් ආරක්ෂක කමිටු",
    matchEn: ["Civil Defense Committee", "Civil Defense Committees"],
  },
  {
    en: "Praja Shakthi (Community Empowerment) Society",
    si: "ප්‍රජා ශක්ති (ප්‍රජා සවිබල ගැන්වීමේ) සමිතිය",
    matchEn: ["Prajashakthi Society", "Praja Shakthi (Community Empowerment) Society"],
  },
];

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
  const isSocialWelfare = section === "social-welfare";
  const isCommunityOrganizations = section === "community-organizations";
  const isTourism = section === "tourism";
  const [employmentGnDivision, setEmploymentGnDivision] = React.useState("all");
  const [religiousGnDivision, setReligiousGnDivision] = React.useState("all");
  const [socialWelfareGnDivision, setSocialWelfareGnDivision] = React.useState("all");
  const [communityOrganizationsGnDivision, setCommunityOrganizationsGnDivision] = React.useState("all");
  const [tourismGnDivision, setTourismGnDivision] = React.useState("all");
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
    : isSocialWelfare
    ? { en: "Social Welfare", si: "සමාජ සුබසාධන" }
    : isCommunityOrganizations
    ? {
        en: "Community / Govt / NGO Organizations",
        si: "ප්‍රජා / රාජ්‍ය / රාජ්‍ය නොවන සංවිධාන",
      }
    : isTourism
    ? { en: "Tourism", si: "සංචාරක" }
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
    : {
        en: "This section is not available yet. Please return to the division information overview.",
        si: "මෙම කොටස තවම ලබා ගත නොහැක. කරුණාකර වසම් තොරතුරු ප්‍රස්ථාරයට ආපසු යන්න.",
      };

  const analyticsUrl = React.useMemo(() => {
    if (!isDemographics && !isEmployment && !isReligiousCultural && !isSocialWelfare && !isCommunityOrganizations && !isTourism) return null;
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
    return `/api/analytics?${params.toString()}`;
  }, [
    isDemographics,
    isEmployment,
    isReligiousCultural,
    isSocialWelfare,
    isCommunityOrganizations,
    isTourism,
    employmentGnDivision,
    religiousGnDivision,
    socialWelfareGnDivision,
    communityOrganizationsGnDivision,
    tourismGnDivision,
  ]);

  const { data: analytics, error: analyticsError } = useSWR(analyticsUrl, analyticsFetcher);
  const [showTotalPopulation, setShowTotalPopulation] = React.useState(false);
  const [showGnBreakdown, setShowGnBreakdown] = React.useState(false);
  const [showReligionDistribution, setShowReligionDistribution] = React.useState(false);
  const [showEthnicityDistribution, setShowEthnicityDistribution] = React.useState(false);
  const [showForeignNationals, setShowForeignNationals] = React.useState(false);
  const [showHouseholds, setShowHouseholds] = React.useState(false);
  const [showRegisteredVoters, setShowRegisteredVoters] = React.useState(false);
  const [showCommunityOrganizationsTable, setShowCommunityOrganizationsTable] = React.useState(false);
  const [showVillageDevelopmentSocieties, setShowVillageDevelopmentSocieties] = React.useState(false);
  const [showYouthClubs, setShowYouthClubs] = React.useState(false);
  const [showSportsClubs, setShowSportsClubs] = React.useState(false);
  const [showFuneralWelfareSocieties, setShowFuneralWelfareSocieties] = React.useState(false);
  const [showWomensSocieties, setShowWomensSocieties] = React.useState(false);
  const [showSeniorCitizensSocieties, setShowSeniorCitizensSocieties] = React.useState(false);
  const [showChildrensClubs, setShowChildrensClubs] = React.useState(false);
  const [showSamurdhiSocieties, setShowSamurdhiSocieties] = React.useState(false);
  const [showMithuruOrganizations, setShowMithuruOrganizations] = React.useState(false);
  const [showNonGovernmentalOrganizations, setShowNonGovernmentalOrganizations] = React.useState(false);
  const [showFarmersSocieties, setShowFarmersSocieties] = React.useState(false);
  const [showReligiousSocieties, setShowReligiousSocieties] = React.useState(false);
  const [showSanasaSocieties, setShowSanasaSocieties] = React.useState(false);
  const [showCivilDefenseCommittees, setShowCivilDefenseCommittees] = React.useState(false);
  const [showPrajaShakthiSocieties, setShowPrajaShakthiSocieties] = React.useState(false);
  const [showCooperativeSocieties, setShowCooperativeSocieties] = React.useState(false);
  const [expandedReligionRows, setExpandedReligionRows] = React.useState<Record<string, boolean>>({});
  const gnBreakdownRef = React.useRef<HTMLDivElement | null>(null);
  const religionTableRef = React.useRef<HTMLDivElement | null>(null);
  const ethnicityTableRef = React.useRef<HTMLDivElement | null>(null);
  const foreignTableRef = React.useRef<HTMLDivElement | null>(null);
  const householdsTableRef = React.useRef<HTMLDivElement | null>(null);
  const votersTableRef = React.useRef<HTMLDivElement | null>(null);
  const communityOrganizationsTableRef = React.useRef<HTMLDivElement | null>(null);
  const villageDevelopmentSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const youthClubsTableRef = React.useRef<HTMLDivElement | null>(null);
  const sportsClubsTableRef = React.useRef<HTMLDivElement | null>(null);
  const funeralWelfareSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const womensSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const seniorCitizensSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const childrensClubsTableRef = React.useRef<HTMLDivElement | null>(null);
  const samurdhiSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const mithuruOrganizationsTableRef = React.useRef<HTMLDivElement | null>(null);
  const nonGovernmentalOrganizationsTableRef = React.useRef<HTMLDivElement | null>(null);
  const farmersSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const religiousSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const sanasaSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const civilDefenseCommitteesTableRef = React.useRef<HTMLDivElement | null>(null);
  const prajaShakthiSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);
  const cooperativeSocietiesTableRef = React.useRef<HTMLDivElement | null>(null);

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

  const communityOrganizationTableRows = React.useMemo(() => {
    const organizationCounts = analytics?.sections.communityWelfare.organizationCounts ?? [];
    const countByLabel = new Map(organizationCounts.map((row) => [row.en, row.count]));

    return COMMUNITY_ORGANIZATION_TABLE_ROWS.map((row) => {
      const count = row.matchEn.reduce((sum, label) => sum + (countByLabel.get(label) ?? 0), 0);
      return {
        en: row.en,
        si: row.si,
        count,
      };
    });
  }, [analytics]);

  const communityOrganizationDirectoryRows = React.useMemo(() => {
    const rows = analytics?.sections.communityWelfare.organizationDirectory.rows ?? [];
    return rows.map((row, index) => ({
      id: `${row.gnId}-${row.name}-${row.type}-${index}`,
      type: row.type,
      name: row.name ?? "",
      address: row.address ?? "",
      memberCount: row.memberCount,
      identifiedNeeds: row.identifiedNeeds,
    }));
  }, [analytics]);

  const getOrganizationRowsByType = React.useCallback(
    (type: string) => communityOrganizationDirectoryRows.filter((row) => row.type === type),
    [communityOrganizationDirectoryRows]
  );

  const villageDevelopmentSocietyRows = React.useMemo(
    () => getOrganizationRowsByType("village-development-society"),
    [getOrganizationRowsByType]
  );
  const youthClubRows = React.useMemo(
    () => getOrganizationRowsByType("youth-society"),
    [getOrganizationRowsByType]
  );
  const sportsClubRows = React.useMemo(
    () => getOrganizationRowsByType("sports-club"),
    [getOrganizationRowsByType]
  );
  const funeralWelfareSocietyRows = React.useMemo(
    () => getOrganizationRowsByType("funeral-aid-society"),
    [getOrganizationRowsByType]
  );
  const womensSocietyRows = React.useMemo(
    () => getOrganizationRowsByType("womens-society"),
    [getOrganizationRowsByType]
  );
  const seniorCitizensSocietyRows = React.useMemo(
    () => getOrganizationRowsByType("elders-society"),
    [getOrganizationRowsByType]
  );
  const childrensClubRows = React.useMemo(
    () => getOrganizationRowsByType("childrens-society"),
    [getOrganizationRowsByType]
  );
  const samurdhiSocietyRows = React.useMemo(
    () => getOrganizationRowsByType("samurdhi-society"),
    [getOrganizationRowsByType]
  );
  const mithuruOrganizationRows = React.useMemo(
    () => getOrganizationRowsByType("friend-organization"),
    [getOrganizationRowsByType]
  );
  const nonGovernmentalOrganizationRows = React.useMemo(
    () => getOrganizationRowsByType("ngo-committee"),
    [getOrganizationRowsByType]
  );
  const farmersSocietyRows = React.useMemo(
    () => getOrganizationRowsByType("farmer-society"),
    [getOrganizationRowsByType]
  );
  const religiousSocietyRows = React.useMemo(
    () => getOrganizationRowsByType("religious-society"),
    [getOrganizationRowsByType]
  );
  const sanasaSocietyRows = React.useMemo(
    () => getOrganizationRowsByType("sanasa-society"),
    [getOrganizationRowsByType]
  );
  const civilDefenseCommitteeRows = React.useMemo(
    () => getOrganizationRowsByType("civil-defense-committee"),
    [getOrganizationRowsByType]
  );
  const prajaShakthiSocietyRows = React.useMemo(
    () => getOrganizationRowsByType("prajashakthi-society"),
    [getOrganizationRowsByType]
  );

  const cooperativeSocietyRows = React.useMemo(() => {
    const rows = analytics?.sections.communityWelfare.cooperativeSocieties.rows ?? [];
    return rows.map((row, index) => ({
      id: `${row.gnId}-${row.name}-${index}`,
      name: row.name ?? "",
    }));
  }, [analytics]);

  const toggleReligionRow = (gnId: string) => {
    setExpandedReligionRows((prev) => ({ ...prev, [gnId]: !prev[gnId] }));
  };

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
      ) : isDemographics ? (
        <div className="space-y-4">
          <Card className="card-lift overflow-hidden border-border/60 shadow-md">
            <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                  <Users className="size-5" aria-hidden="true" />
                </span>
                <CardTitle className="min-w-0 font-display text-fluid-2xl font-semibold text-foreground">
                  <Bilingual en="Total Population" si="මහජන සංඛ්‍යාව" />
                </CardTitle>
              </div>
              <div className="flex items-start justify-end">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowTotalPopulation((s) => !s)}>
                  <Eye className="size-4" />
                  <Bilingual en={showTotalPopulation ? "Hide" : "View"} si={showTotalPopulation ? "සඟවන්න" : "බලන්න"} />
                </Button>
              </div>
            </CardHeader>
            {showTotalPopulation && (
              <CardContent>
                {analyticsError ? (
                  <div className="text-sm text-destructive">Unable to load demographics.</div>
                ) : !analytics ? (
                  <div className="text-sm text-muted-foreground">Loading…</div>
                ) : (
                  <div className="grid gap-3">
                    <div className="grid grid-cols-2 gap-3 rounded-md border border-border bg-muted/50 p-4 text-sm md:grid-cols-4">
                      <div>
                        <p className="text-muted-foreground">Total Population</p>
                        <p className="mt-1 text-fluid-lg font-semibold nums-tabular text-foreground">
                          {analytics.demographics.totalPopulation.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Female</p>
                        <p className="mt-1 text-fluid-lg font-semibold nums-tabular text-foreground">
                          {analytics.demographics.female.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Male</p>
                        <p className="mt-1 text-fluid-lg font-semibold nums-tabular text-foreground">
                          {analytics.demographics.male.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Households</p>
                        <p className="mt-1 text-fluid-lg font-semibold nums-tabular text-foreground">
                          {analytics.demographics.households.total.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          <Card className="card-lift overflow-hidden border-border/60 shadow-md">
            <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                  <MapPin className="size-5" aria-hidden="true" />
                </span>
                <CardTitle className="min-w-0 font-display text-fluid-2xl font-semibold text-foreground">
                  <Bilingual en="Population by Grama Niladhari Divisions" si="ග්‍රාම නිලධාරී වසම් අනුව ජනගහනය" />
                </CardTitle>
              </div>
              <div className="flex items-start justify-end">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowGnBreakdown((s) => !s)}>
                  <Eye className="size-4" />
                  <Bilingual en={showGnBreakdown ? "Hide" : "View"} si={showGnBreakdown ? "සඟවන්න" : "බලන්න"} />
                </Button>
              </div>
            </CardHeader>
            {showGnBreakdown && (
              <CardContent>
                {analyticsError ? (
                  <div className="text-sm text-destructive">Unable to load GN division totals.</div>
                ) : !analytics ? (
                  <div className="text-sm text-muted-foreground">Loading…</div>
                ) : (
                  <div className="overflow-hidden rounded-md border border-border">
                    <div ref={gnBreakdownRef} className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted/40 text-muted-foreground">
                          <tr>
                            <th className="px-3 py-3">GN Division</th>
                            <th className="px-3 py-3">Total Population</th>
                            <th className="px-3 py-3">Female</th>
                            <th className="px-3 py-3">Male</th>
                            <th className="px-3 py-3">Families</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.gnBreakdown.map((g) => {
                            const demo = g.demographics;
                            return (
                              <React.Fragment key={g.gnId}>
                                <tr className="border-t last:border-b">
                                  <td className="px-3 py-3 font-medium">{g.gnName}</td>
                                  <td className="px-3 py-3">{demo ? demo.totalPopulation.toLocaleString() : "—"}</td>
                                  <td className="px-3 py-3">{demo ? demo.female.toLocaleString() : "—"}</td>
                                  <td className="px-3 py-3">{demo ? demo.male.toLocaleString() : "—"}</td>
                                  <td className="px-3 py-3">{demo ? demo.households.total.toLocaleString() : "—"}</td>
                                </tr>
                                {demo && expandedReligionRows[g.gnId] ? (
                                  <tr className="bg-muted/10">
                                    <td className="p-0" colSpan={5}>
                                      <div className="overflow-hidden rounded-b-md border border-border bg-white dark:bg-slate-950">
                                        <div className="overflow-x-auto px-3 py-3">
                                          <table className="w-full text-left text-sm">
                                            <thead className="bg-muted/40 text-muted-foreground">
                                              <tr>
                                                <th className="px-3 py-2">Religion</th>
                                                <th className="px-3 py-2">Female</th>
                                                <th className="px-3 py-2">Male</th>
                                                <th className="px-3 py-2">Total</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {demo.populationByReligion.map((row) => (
                                                <tr key={row.key} className="border-t last:border-b">
                                                  <td className="px-3 py-2">{lang === "si" ? row.si : row.en}</td>
                                                  <td className="px-3 py-2">{row.female.toLocaleString()}</td>
                                                  <td className="px-3 py-2">{row.male.toLocaleString()}</td>
                                                  <td className="px-3 py-2">{row.total.toLocaleString()}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                ) : null}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-muted/40 text-muted-foreground">
                          <tr className="border-t">
                            <td className="px-3 py-3 font-semibold">Totals</td>
                            <td className="px-3 py-3 font-semibold">{gnTotals.totalPopulation.toLocaleString()}</td>
                            <td className="px-3 py-3 font-semibold">{gnTotals.female.toLocaleString()}</td>
                            <td className="px-3 py-3 font-semibold">{gnTotals.male.toLocaleString()}</td>
                            <td className="px-3 py-3 font-semibold">{gnTotals.families.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div className="border-t border-border/80 bg-muted/50 px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => gnBreakdownRef.current?.scrollIntoView({ behavior: "smooth" })}
                      >
                        <ArrowUp className="size-4" />
                        <Bilingual en="Back to top" si="ඉහළට" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
          <TopicCard
            icon={Globe2}
            titleEn="Population Distribution by Religion"
            titleSi="ආගම අනුව ජනගහනය"
            onClick={() => setShowReligionDistribution((value) => !value)}
            buttonLabel={{ en: showReligionDistribution ? "Hide" : "View", si: showReligionDistribution ? "සඟවන්න" : "බලන්න" }}
          />
          {showReligionDistribution && (
            <Card className="card-lift overflow-hidden border-border/60 shadow-md">
              <CardHeader>
                <CardTitle className="font-display text-fluid-xl font-semibold text-foreground">
                  <Bilingual en="Population Distribution by Religion" si="ආගම අනුව ජනගහනය" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsError ? (
                  <div className="text-sm text-destructive">Unable to load religion distribution.</div>
                ) : !analytics ? (
                  <div className="text-sm text-muted-foreground">Loading…</div>
                ) : (
                  <div className="overflow-hidden rounded-md border border-border">
                    <div ref={religionTableRef} className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted/40 text-muted-foreground">
                          <tr>
                            <th className="px-3 py-3">GN Division</th>
                            <th className="px-3 py-3">Buddhist</th>
                            <th className="px-3 py-3">Hindu</th>
                            <th className="px-3 py-3">Islam</th>
                            <th className="px-3 py-3">Roman Catholic</th>
                            <th className="px-3 py-3">Other Christians</th>
                            <th className="px-3 py-3">Other</th>
                            <th className="px-3 py-3">Collection</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.gnBreakdown.map((gn) => {
                            const demo = gn.demographics;
                            const buddhist = demo?.populationByReligion.find((row) => row.key === "buddhist")?.total ?? 0;
                            const hindu = demo?.populationByReligion.find((row) => row.key === "hindu")?.total ?? 0;
                            const islam = demo?.populationByReligion.find((row) => row.key === "islam")?.total ?? 0;
                            const catholic = demo?.populationByReligion.find((row) => row.key === "catholic")?.total ?? 0;
                            const otherChristians = demo?.populationByReligion.find((row) => row.key === "other")?.total ?? 0;
                            const collection = buddhist + hindu + islam + catholic + otherChristians;
                            const other = demo ? Math.max(0, demo.totalPopulation - collection) : 0;

                            return (
                              <tr key={gn.gnId} className="border-t last:border-b">
                                <td className="px-3 py-3 font-medium">{gn.gnName}</td>
                                <td className="px-3 py-3">{demo ? buddhist.toLocaleString() : "—"}</td>
                                <td className="px-3 py-3">{demo ? hindu.toLocaleString() : "—"}</td>
                                <td className="px-3 py-3">{demo ? islam.toLocaleString() : "—"}</td>
                                <td className="px-3 py-3">{demo ? catholic.toLocaleString() : "—"}</td>
                                <td className="px-3 py-3">{demo ? otherChristians.toLocaleString() : "—"}</td>
                                <td className="px-3 py-3">{demo ? other.toLocaleString() : "—"}</td>
                                <td className="px-3 py-3">{demo ? collection.toLocaleString() : "—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-muted/40 text-muted-foreground">
                          <tr className="border-t">
                            <td className="px-3 py-3 font-semibold">Totals</td>
                            <td className="px-3 py-3 font-semibold">{gnReligionTotals.buddhist.toLocaleString()}</td>
                            <td className="px-3 py-3 font-semibold">{gnReligionTotals.hindu.toLocaleString()}</td>
                            <td className="px-3 py-3 font-semibold">{gnReligionTotals.islam.toLocaleString()}</td>
                            <td className="px-3 py-3 font-semibold">{gnReligionTotals.catholic.toLocaleString()}</td>
                            <td className="px-3 py-3 font-semibold">{gnReligionTotals.otherChristians.toLocaleString()}</td>
                            <td className="px-3 py-3 font-semibold">{gnReligionTotals.other.toLocaleString()}</td>
                            <td className="px-3 py-3 font-semibold">{gnReligionTotals.collection.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div className="border-t border-border/80 bg-muted/50 px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => religionTableRef.current?.scrollIntoView({ behavior: "smooth" })}
                      >
                        <ArrowUp className="size-4" />
                        <Bilingual en="Back to top" si="ඉහළට" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          <TopicCard
            icon={Users}
            titleEn="Population Distribution by Ethnicity"
            titleSi="ජාතිය අනුව ජනගහනය"
            onClick={() => setShowEthnicityDistribution((value) => !value)}
            buttonLabel={{ en: showEthnicityDistribution ? "Hide" : "View", si: showEthnicityDistribution ? "සඟවන්න" : "බලන්න" }}
          />
          {showEthnicityDistribution && (
            <Card className="card-lift overflow-hidden border-border/60 shadow-md">
              <CardHeader>
                <CardTitle className="font-display text-fluid-xl font-semibold text-foreground">
                  <Bilingual en="Population Distribution by Ethnicity" si="ජාතිය අනුව ජනගහනය" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsError ? (
                  <div className="text-sm text-destructive">Unable to load ethnicity distribution.</div>
                ) : !analytics ? (
                  <div className="text-sm text-muted-foreground">Loading…</div>
                ) : (
                  <div className="overflow-hidden rounded-md border border-border">
                    <div ref={ethnicityTableRef} className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted/40 text-muted-foreground">
                          <tr>
                            <th className="px-3 py-3">GN Division</th>
                            <th className="px-3 py-3">Sinhala</th>
                            <th className="px-3 py-3">Sri Lankan Tamil</th>
                            <th className="px-3 py-3">Indian Tamil</th>
                            <th className="px-3 py-3">Sri Lankan Yonaka</th>
                            <th className="px-3 py-3">Burger</th>
                            <th className="px-3 py-3">Malay</th>
                            <th className="px-3 py-3">Other</th>
                            <th className="px-3 py-3">Collection</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.gnBreakdown.map((gn) => {
                            const demo = gn.demographics;
                            const sinhala = demo?.populationByEthnicity.find((row) => row.key === "sinhala")?.total ?? 0;
                            const sriLankanTamil = demo?.populationByEthnicity.find((row) => row.key === "tamil")?.total ?? 0;
                            const indianTamil = 0;
                            const sriLankanYonaka = demo?.populationByEthnicity.find((row) => row.key === "muslim")?.total ?? 0;
                            const burgher = demo?.populationByEthnicity.find((row) => row.key === "burgher")?.total ?? 0;
                            const malay = demo?.populationByEthnicity.find((row) => row.key === "malay")?.total ?? 0;
                            const other = demo?.populationByEthnicity.find((row) => row.key === "other")?.total ?? 0;
                            const collection = sinhala + sriLankanTamil + indianTamil + sriLankanYonaka + burgher + malay + other;

                            return (
                              <tr key={gn.gnId} className="border-t last:border-b">
                                <td className="px-3 py-3 font-medium">{gn.gnName}</td>
                                <td className="px-3 py-3">{demo ? sinhala.toLocaleString() : "—"}</td>
                                <td className="px-3 py-3">{demo ? sriLankanTamil.toLocaleString() : "—"}</td>
                                <td className="px-3 py-3">{demo ? indianTamil.toLocaleString() : "—"}</td>
                                <td className="px-3 py-3">{demo ? sriLankanYonaka.toLocaleString() : "—"}</td>
                                <td className="px-3 py-3">{demo ? burgher.toLocaleString() : "—"}</td>
                                <td className="px-3 py-3">{demo ? malay.toLocaleString() : "—"}</td>
                                <td className="px-3 py-3">{demo ? other.toLocaleString() : "—"}</td>
                                <td className="px-3 py-3">{demo ? collection.toLocaleString() : "—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-muted/40 text-muted-foreground">
                          <tr className="border-t">
                            <td className="px-3 py-3 font-semibold">Totals</td>
                            <td className="px-3 py-3 font-semibold">{gnEthnicityTotals.sinhala.toLocaleString()}</td>
                            <td className="px-3 py-3 font-semibold">{gnEthnicityTotals.sriLankanTamil.toLocaleString()}</td>
                            <td className="px-3 py-3 font-semibold">{gnEthnicityTotals.indianTamil.toLocaleString()}</td>
                            <td className="px-3 py-3 font-semibold">{gnEthnicityTotals.sriLankanYonaka.toLocaleString()}</td>
                            <td className="px-3 py-3 font-semibold">{gnEthnicityTotals.burgher.toLocaleString()}</td>
                            <td className="px-3 py-3 font-semibold">{gnEthnicityTotals.malay.toLocaleString()}</td>
                            <td className="px-3 py-3 font-semibold">{gnEthnicityTotals.other.toLocaleString()}</td>
                            <td className="px-3 py-3 font-semibold">{gnEthnicityTotals.collection.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div className="border-t border-border/80 bg-muted/50 px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => ethnicityTableRef.current?.scrollIntoView({ behavior: "smooth" })}
                      >
                        <ArrowUp className="size-4" />
                        <Bilingual en="Back to top" si="ඉහළට" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          <TopicCard
            icon={Globe2}
            titleEn="Foreign nationals in the division"
            titleSi="වසමේ විදේශ ජාතිකයන්"
            onClick={() => setShowForeignNationals((value) => !value)}
            buttonLabel={{ en: showForeignNationals ? "Hide" : "View", si: showForeignNationals ? "සඟවන්න" : "බලන්න" }}
          />
          {showForeignNationals && (
            <Card className="card-lift overflow-hidden border-border/60 shadow-md">
              <CardHeader>
                <CardTitle className="font-display text-fluid-xl font-semibold text-foreground">
                  <Bilingual en="Foreign Nationals Residing in the Division" si="වසමේ පදිංචි විදේශ ජාතිකයන්" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsError ? (
                  <div className="text-sm text-destructive">Unable to load foreign nationals data.</div>
                ) : !analytics ? (
                  <div className="text-sm text-muted-foreground">Loading…</div>
                ) : (
                  <div className="overflow-hidden rounded-md border border-border">
                    <div ref={foreignTableRef} className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted/40 text-muted-foreground">
                          <tr>
                            <th className="px-3 py-3">GN Division</th>
                            <th className="px-3 py-3">Female</th>
                            <th className="px-3 py-3">Male</th>
                            <th className="px-3 py-3">Collection</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.gnBreakdown.map((gn) => {
                            const foreign = gn.demographics?.foreignNationals;
                            return (
                              <tr key={gn.gnId} className="border-t last:border-b">
                                <td className="px-3 py-3 font-medium">{gn.gnName}</td>
                                <td className="px-3 py-3">{foreign ? foreign.female.toLocaleString() : "—"}</td>
                                <td className="px-3 py-3">{foreign ? foreign.male.toLocaleString() : "—"}</td>
                                <td className="px-3 py-3">{foreign ? foreign.total.toLocaleString() : "—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-muted/40 text-muted-foreground">
                          <tr className="border-t">
                            <td className="px-3 py-3 font-semibold">Totals</td>
                            <td className="px-3 py-3 font-semibold">{gnForeignNationalsTotals.female.toLocaleString()}</td>
                            <td className="px-3 py-3 font-semibold">{gnForeignNationalsTotals.male.toLocaleString()}</td>
                            <td className="px-3 py-3 font-semibold">{gnForeignNationalsTotals.collection.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div className="border-t border-border/80 bg-muted/50 px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => foreignTableRef.current?.scrollIntoView({ behavior: "smooth" })}
                      >
                        <ArrowUp className="size-4" />
                        <Bilingual en="Back to top" si="ඉහළට" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          <TopicCard
            icon={Home}
            titleEn="Households"
            titleSi="ගෘහස්ථයන්"
            onClick={() => setShowHouseholds((value) => !value)}
            buttonLabel={{ en: showHouseholds ? "Hide" : "View", si: showHouseholds ? "සඟවන්න" : "බලන්න" }}
          />
          {showHouseholds && (
            <Card className="card-lift overflow-hidden border-border/60 shadow-md">
              <CardHeader>
                <CardTitle className="font-display text-fluid-xl font-semibold text-foreground">
                  <Bilingual en="Households in the Division" si="වසමේ ගෘහස්ථයන්" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsError ? (
                  <div className="text-sm text-destructive">Unable to load households data.</div>
                ) : !analytics ? (
                  <div className="text-sm text-muted-foreground">Loading…</div>
                ) : (
                  <div className="overflow-hidden rounded-md border border-border">
                    <div ref={householdsTableRef} className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted/40 text-muted-foreground">
                          <tr>
                            <th className="px-3 py-3">GN Division</th>
                            <th className="px-3 py-3">Total Households</th>
                            <th className="px-3 py-3">Female-Headed Households</th>
                            <th className="px-3 py-3">Displaced Households</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.gnBreakdown.map((gn) => {
                            const households = gn.demographics?.households;
                            return (
                              <tr key={gn.gnId} className="border-t last:border-b">
                                <td className="px-3 py-3 font-medium">{gn.gnName}</td>
                                <td className="px-3 py-3">{households ? households.total.toLocaleString() : "—"}</td>
                                <td className="px-3 py-3">{households ? households.femaleHeaded.toLocaleString() : "—"}</td>
                                <td className="px-3 py-3">{households ? households.displaced.toLocaleString() : "—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-muted/40 text-muted-foreground">
                          <tr className="border-t">
                            <td className="px-3 py-3 font-semibold">Totals</td>
                            <td className="px-3 py-3 font-semibold">{gnHouseholdsTotals.totalHouseholds.toLocaleString()}</td>
                            <td className="px-3 py-3 font-semibold">{gnHouseholdsTotals.femaleHeadedHouseholds.toLocaleString()}</td>
                            <td className="px-3 py-3 font-semibold">{gnHouseholdsTotals.displacedHouseholds.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div className="border-t border-border/80 bg-muted/50 px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => householdsTableRef.current?.scrollIntoView({ behavior: "smooth" })}
                      >
                        <ArrowUp className="size-4" />
                        <Bilingual en="Back to top" si="ඉහළට" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          <TopicCard
            icon={UserCheck}
            titleEn="Registered voters"
            titleSi="රෙජිස්ටර් කර ඇති ඡන්ද දායකයින්"
            onClick={() => setShowRegisteredVoters((value) => !value)}
            buttonLabel={{ en: showRegisteredVoters ? "Hide" : "View", si: showRegisteredVoters ? "සඟවන්න" : "බලන්න" }}
          />
          {showRegisteredVoters && (
            <Card className="card-lift overflow-hidden border-border/60 shadow-md">
              <CardHeader>
                <CardTitle className="font-display text-fluid-xl font-semibold text-foreground">
                  <Bilingual en="Registered Voters in the Division" si="වසමේ ලියාපදිංචි ඡන්දදායකයන්" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsError ? (
                  <div className="text-sm text-destructive">Unable to load registered voters data.</div>
                ) : !analytics ? (
                  <div className="text-sm text-muted-foreground">Loading…</div>
                ) : (
                  <div className="overflow-hidden rounded-md border border-border">
                    <div ref={votersTableRef} className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted/40 text-muted-foreground">
                          <tr>
                            <th className="px-3 py-3">GN Division</th>
                            <th className="px-3 py-3">Female</th>
                            <th className="px-3 py-3">Male</th>
                            <th className="px-3 py-3">Collection</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.gnBreakdown.map((gn) => {
                            const voters = gn.demographics?.registeredVoters;
                            return (
                              <tr key={gn.gnId} className="border-t last:border-b">
                                <td className="px-3 py-3 font-medium">{gn.gnName}</td>
                                <td className="px-3 py-3">{voters ? voters.female.toLocaleString() : "—"}</td>
                                <td className="px-3 py-3">{voters ? voters.male.toLocaleString() : "—"}</td>
                                <td className="px-3 py-3">{voters ? voters.total.toLocaleString() : "—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-muted/40 text-muted-foreground">
                          <tr className="border-t">
                            <td className="px-3 py-3 font-semibold">Totals</td>
                            <td className="px-3 py-3 font-semibold">{gnRegisteredVotersTotals.female.toLocaleString()}</td>
                            <td className="px-3 py-3 font-semibold">{gnRegisteredVotersTotals.male.toLocaleString()}</td>
                            <td className="px-3 py-3 font-semibold">{gnRegisteredVotersTotals.total.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div className="border-t border-border/80 bg-muted/50 px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => votersTableRef.current?.scrollIntoView({ behavior: "smooth" })}
                      >
                        <ArrowUp className="size-4" />
                        <Bilingual en="Back to top" si="ඉහළට" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
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
        <div className="space-y-4">
          <div className="max-w-xs space-y-1 rounded-lg border border-border/60 bg-muted/20 p-3">
            <p className="text-sm font-medium text-foreground">
              <Bilingual en="Filter by GN Division" si="ග්‍රාම නිලධාරී වසම අනුව පෙරහන්න" />
            </p>
            <Select value={communityOrganizationsGnDivision} onValueChange={setCommunityOrganizationsGnDivision}>
              <SelectTrigger className="h-10 bg-background">
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

          <TopicCard
            icon={Users}
            titleEn={COMMUNITY_ORGANIZATION_CARDS[0]?.en ?? "Community Organizations"}
            titleSi={COMMUNITY_ORGANIZATION_CARDS[0]?.si ?? "ප්‍රජා සංවිධාන"}
            onClick={() => setShowCommunityOrganizationsTable((value) => !value)}
            buttonLabel={{ en: showCommunityOrganizationsTable ? "Hide" : "View", si: showCommunityOrganizationsTable ? "සඟවන්න" : "බලන්න" }}
          />
          {showCommunityOrganizationsTable && (
            <Card className="card-lift overflow-hidden border-border/60 shadow-md">
              <CardHeader>
                <CardTitle className="font-display text-fluid-xl font-semibold text-foreground">
                  <Bilingual
                    en="Community, Governmental, and Non-Governmental Organizations"
                    si="ප්‍රජාමූල, රාජ්‍ය හා රාජ්‍ය නොවන සංවිධාන"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsError ? (
                  <div className="text-sm text-destructive">Unable to load organization data.</div>
                ) : !analytics ? (
                  <div className="text-sm text-muted-foreground">Loading…</div>
                ) : (
                  <div className="overflow-hidden rounded-md border border-border">
                    <div ref={communityOrganizationsTableRef} className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted/40 text-muted-foreground">
                          <tr>
                            <th className="px-3 py-3">
                              <Bilingual
                                en="Society type"
                                si="සමිති වර්ගය"
                              />
                              </th>
                            <th className="px-3 py-3">
                              <Bilingual
                                en="Number of Societies"
                                si="සමිති සංඛ්‍යාව"
                              />
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {communityOrganizationTableRows.map((row) => (
                            <tr key={row.en} className="border-t last:border-b">
                              <td className="px-3 py-3 font-medium">
                                <Bilingual en={row.en} si={row.si} />
                              </td>
                              <td className="px-3 py-3 nums-tabular">{row.count.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="border-t border-border/80 bg-muted/50 px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => communityOrganizationsTableRef.current?.scrollIntoView({ behavior: "smooth" })}
                      >
                        <ArrowUp className="size-4" />
                        <Bilingual en="Back to top" si="ඉහළට" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          <TopicCard
            icon={Users}
            titleEn="Village Development Societies"
            titleSi="ග්‍රාම සංවර්ධන සමිති"
            onClick={() => setShowVillageDevelopmentSocieties((value) => !value)}
            buttonLabel={{ en: showVillageDevelopmentSocieties ? "Hide" : "View", si: showVillageDevelopmentSocieties ? "සඟවන්න" : "බලන්න" }}
          />
          {showVillageDevelopmentSocieties && (
            <CommunityOrganizationDirectoryTable
              titleEn="Village Development Societies"
              titleSi="ග්‍රාම සංවර්ධන සමිති"
              nameHeaderEn="Name of Village Development Societies"
              nameHeaderSi="ග්‍රාම සංවර්ධන සමිතියේ නම"
              rows={villageDevelopmentSocietyRows}
              tableRef={villageDevelopmentSocietiesTableRef}
              isLoading={!analytics}
              error={analyticsError}
            />
          )}

          <TopicCard
            icon={Users}
            titleEn="Youth Clubs"
            titleSi="යෞවන සමාජ"
            onClick={() => setShowYouthClubs((value) => !value)}
            buttonLabel={{ en: showYouthClubs ? "Hide" : "View", si: showYouthClubs ? "සඟවන්න" : "බලන්න" }}
          />
          {showYouthClubs && (
            <CommunityOrganizationDirectoryTable
              titleEn="Youth Clubs"
              titleSi="යෞවන සමාජ"
              nameHeaderEn="Name of Youth Clubs"
              nameHeaderSi="යෞවන සමාජයේ නම"
              rows={youthClubRows}
              tableRef={youthClubsTableRef}
              isLoading={!analytics}
              error={analyticsError}
            />
          )}

          <TopicCard
            icon={Users}
            titleEn="Sports Clubs"
            titleSi="ක්‍රීඩා සමාජ"
            onClick={() => setShowSportsClubs((value) => !value)}
            buttonLabel={{ en: showSportsClubs ? "Hide" : "View", si: showSportsClubs ? "සඟවන්න" : "බලන්න" }}
          />
          {showSportsClubs && (
            <CommunityOrganizationDirectoryTable
              titleEn="Sports Clubs"
              titleSi="ක්‍රීඩා සමාජ"
              nameHeaderEn="Name of Sports Clubs"
              nameHeaderSi="ක්‍රීඩා සමාජයේ නම"
              rows={sportsClubRows}
              tableRef={sportsClubsTableRef}
              isLoading={!analytics}
              error={analyticsError}
              showMembersAndNeeds
            />
          )}

          <TopicCard
            icon={Users}
            titleEn="Funeral Welfare Societies"
            titleSi="අවමංගල්‍යාධාර සමිති"
            onClick={() => setShowFuneralWelfareSocieties((value) => !value)}
            buttonLabel={{ en: showFuneralWelfareSocieties ? "Hide" : "View", si: showFuneralWelfareSocieties ? "සඟවන්න" : "බලන්න" }}
          />
          {showFuneralWelfareSocieties && (
            <CommunityOrganizationDirectoryTable
              titleEn="Funeral Welfare Societies"
              titleSi="අවමංගල්‍යාධාර සමිති"
              nameHeaderEn="Name of Funeral Welfare Societies"
              nameHeaderSi="අවමංගල්‍යාධාර සමිතියේ නම"
              rows={funeralWelfareSocietyRows}
              tableRef={funeralWelfareSocietiesTableRef}
              isLoading={!analytics}
              error={analyticsError}
            />
          )}

          <TopicCard
            icon={Users}
            titleEn="Women's Societies"
            titleSi="කාන්තා සමිති"
            onClick={() => setShowWomensSocieties((value) => !value)}
            buttonLabel={{ en: showWomensSocieties ? "Hide" : "View", si: showWomensSocieties ? "සඟවන්න" : "බලන්න" }}
          />
          {showWomensSocieties && (
            <CommunityOrganizationDirectoryTable
              titleEn="Women's Societies"
              titleSi="කාන්තා සමිති"
              nameHeaderEn="Name of Women's Societies"
              nameHeaderSi="කාන්තා සමිතියේ නම"
              rows={womensSocietyRows}
              tableRef={womensSocietiesTableRef}
              isLoading={!analytics}
              error={analyticsError}
            />
          )}

          <TopicCard
            icon={Users}
            titleEn="Senior Citizens' Societies"
            titleSi="වැඩිහිටි සමිති"
            onClick={() => setShowSeniorCitizensSocieties((value) => !value)}
            buttonLabel={{ en: showSeniorCitizensSocieties ? "Hide" : "View", si: showSeniorCitizensSocieties ? "සඟවන්න" : "බලන්න" }}
          />
          {showSeniorCitizensSocieties && (
            <CommunityOrganizationDirectoryTable
              titleEn="Senior Citizens' Societies"
              titleSi="වැඩිහිටි සමිති"
              nameHeaderEn="Name of Senior Citizens' Societies"
              nameHeaderSi="වැඩිහිටි සමිතියේ නම"
              rows={seniorCitizensSocietyRows}
              tableRef={seniorCitizensSocietiesTableRef}
              isLoading={!analytics}
              error={analyticsError}
            />
          )}

          <TopicCard
            icon={Users}
            titleEn="Children's Clubs"
            titleSi="ළමා සමාජ"
            onClick={() => setShowChildrensClubs((value) => !value)}
            buttonLabel={{ en: showChildrensClubs ? "Hide" : "View", si: showChildrensClubs ? "සඟවන්න" : "බලන්න" }}
          />
          {showChildrensClubs && (
            <CommunityOrganizationDirectoryTable
              titleEn="Children's Clubs"
              titleSi="ළමා සමාජ"
              nameHeaderEn="Name of Children's Clubs"
              nameHeaderSi="ළමා සමාජයේ නම"
              rows={childrensClubRows}
              tableRef={childrensClubsTableRef}
              isLoading={!analytics}
              error={analyticsError}
            />
          )}

          <TopicCard
            icon={Users}
            titleEn="Samurdhi Society"
            titleSi="සමෘද්ධි සමිතිය"
            onClick={() => setShowSamurdhiSocieties((value) => !value)}
            buttonLabel={{ en: showSamurdhiSocieties ? "Hide" : "View", si: showSamurdhiSocieties ? "සඟවන්න" : "බලන්න" }}
          />
          {showSamurdhiSocieties && (
            <CommunityOrganizationDirectoryTable
              titleEn="Samurdhi Society"
              titleSi="සමෘද්ධි සමිතිය"
              nameHeaderEn="Name of Samurdhi Societies"
              nameHeaderSi="සමෘද්ධි සමිතියේ නම"
              rows={samurdhiSocietyRows}
              tableRef={samurdhiSocietiesTableRef}
              isLoading={!analytics}
              error={analyticsError}
            />
          )}

          <TopicCard
            icon={Users}
            titleEn="Mithuru Organization / Mithuru Partnership"
            titleSi="මිතුරු සංවිධාන / මිතුරු හවුල්"
            onClick={() => setShowMithuruOrganizations((value) => !value)}
            buttonLabel={{ en: showMithuruOrganizations ? "Hide" : "View", si: showMithuruOrganizations ? "සඟවන්න" : "බලන්න" }}
          />
          {showMithuruOrganizations && (
            <CommunityOrganizationDirectoryTable
              titleEn="Mithuru Organization / Mithuru Partnership"
              titleSi="මිතුරු සංවිධාන / මිතුරු හවුල්"
              nameHeaderEn="Name of Mithuru Organizations / Mithuru Partnerships"
              nameHeaderSi="මිතුරු සංවිධානයේ නම / මිතුරු හවුල්ලේ නම"
              rows={mithuruOrganizationRows}
              tableRef={mithuruOrganizationsTableRef}
              isLoading={!analytics}
              error={analyticsError}
            />
          )}

          <TopicCard
            icon={Users}
            titleEn="Non-Governmental Organization"
            titleSi="රාජ්‍ය නොවන සංවිධානය"
            onClick={() => setShowNonGovernmentalOrganizations((value) => !value)}
            buttonLabel={{ en: showNonGovernmentalOrganizations ? "Hide" : "View", si: showNonGovernmentalOrganizations ? "සඟවන්න" : "බලන්න" }}
          />
          {showNonGovernmentalOrganizations && (
            <CommunityOrganizationDirectoryTable
              titleEn="Non-Governmental Organization"
              titleSi="රාජ්‍ය නොවන සංවිධානය"
              nameHeaderEn="Name of Non-Governmental Organizations"
              nameHeaderSi="රාජ්‍ය නොවන සංවිධානයේ නම"
              rows={nonGovernmentalOrganizationRows}
              tableRef={nonGovernmentalOrganizationsTableRef}
              isLoading={!analytics}
              error={analyticsError}
            />
          )}

          <TopicCard
            icon={Users}
            titleEn="Farmers' Society"
            titleSi="ගොවි සමිතිය"
            onClick={() => setShowFarmersSocieties((value) => !value)}
            buttonLabel={{ en: showFarmersSocieties ? "Hide" : "View", si: showFarmersSocieties ? "සඟවන්න" : "බලන්න" }}
          />
          {showFarmersSocieties && (
            <CommunityOrganizationDirectoryTable
              titleEn="Farmers' Society"
              titleSi="ගොවි සමිතිය"
              nameHeaderEn="Name of Farmers' Societies"
              nameHeaderSi="ගොවි සමිතියේ නම"
              rows={farmersSocietyRows}
              tableRef={farmersSocietiesTableRef}
              isLoading={!analytics}
              error={analyticsError}
            />
          )}

          <TopicCard
            icon={Users}
            titleEn="Religious Society"
            titleSi="ආගමික සමිතිය"
            onClick={() => setShowReligiousSocieties((value) => !value)}
            buttonLabel={{ en: showReligiousSocieties ? "Hide" : "View", si: showReligiousSocieties ? "සඟවන්න" : "බලන්න" }}
          />
          {showReligiousSocieties && (
            <CommunityOrganizationDirectoryTable
              titleEn="Religious Society"
              titleSi="ආගමික සමිතිය"
              nameHeaderEn="Name of Religious Societies"
              nameHeaderSi="ආගමික සමිතියේ නම"
              rows={religiousSocietyRows}
              tableRef={religiousSocietiesTableRef}
              isLoading={!analytics}
              error={analyticsError}
            />
          )}

          <TopicCard
            icon={Users}
            titleEn="Sanasa (Credit/Microfinance) Society"
            titleSi="සණස (ණය / සුළු මූල්‍ය) සමිතිය"
            onClick={() => setShowSanasaSocieties((value) => !value)}
            buttonLabel={{ en: showSanasaSocieties ? "Hide" : "View", si: showSanasaSocieties ? "සඟවන්න" : "බලන්න" }}
          />
          {showSanasaSocieties && (
            <CommunityOrganizationDirectoryTable
              titleEn="Sanasa (Credit/Microfinance) Society"
              titleSi="සණස (ණය / සුළු මූල්‍ය) සමිතිය"
              nameHeaderEn="Name of Sanasa Societies"
              nameHeaderSi="සණස (ණය / සුළු මූල්‍ය) සමිතියේ නම"
              rows={sanasaSocietyRows}
              tableRef={sanasaSocietiesTableRef}
              isLoading={!analytics}
              error={analyticsError}
            />
          )}

          <TopicCard
            icon={Users}
            titleEn="Civil Defense Committees"
            titleSi="සිවිල් ආරක්ෂක කමිටු"
            onClick={() => setShowCivilDefenseCommittees((value) => !value)}
            buttonLabel={{ en: showCivilDefenseCommittees ? "Hide" : "View", si: showCivilDefenseCommittees ? "සඟවන්න" : "බලන්න" }}
          />
          {showCivilDefenseCommittees && (
            <CommunityOrganizationDirectoryTable
              titleEn="Civil Defense Committees"
              titleSi="සිවිල් ආරක්ෂක කමිටු"
              nameHeaderEn="Name of Civil Defense Committees"
              nameHeaderSi="සිවිල් ආරක්ෂක කමිටු නම"
              rows={civilDefenseCommitteeRows}
              tableRef={civilDefenseCommitteesTableRef}
              isLoading={!analytics}
              error={analyticsError}
            />
          )}

          <TopicCard
            icon={Users}
            titleEn="Praja Shakthi (Community Empowerment) Society"
            titleSi="ප්‍රජා ශක්ති (ප්‍රජා සවිබල ගැන්වීමේ) සමිතිය"
            onClick={() => setShowPrajaShakthiSocieties((value) => !value)}
            buttonLabel={{ en: showPrajaShakthiSocieties ? "Hide" : "View", si: showPrajaShakthiSocieties ? "සඟවන්න" : "බලන්න" }}
          />
          {showPrajaShakthiSocieties && (
            <CommunityOrganizationDirectoryTable
              titleEn="Praja Shakthi (Community Empowerment) Society"
              titleSi="ප්‍රජා ශක්ති (ප්‍රජා සවිබල ගැන්වීමේ) සමිතිය"
              nameHeaderEn="Name of Praja Shakthi Societies"
              nameHeaderSi="ප්‍රජා ශක්ති (ප්‍රජා සවිබල ගැන්වීමේ) සමිතියේ නම"
              rows={prajaShakthiSocietyRows}
              tableRef={prajaShakthiSocietiesTableRef}
              isLoading={!analytics}
              error={analyticsError}
            />
          )}

          <TopicCard
            icon={Users}
            titleEn={COMMUNITY_ORGANIZATION_CARDS[16]?.en ?? "Cooperative Societies"}
            titleSi={COMMUNITY_ORGANIZATION_CARDS[16]?.si ?? "සමූපකාර සමිති"}
            onClick={() => setShowCooperativeSocieties((value) => !value)}
            buttonLabel={{ en: showCooperativeSocieties ? "Hide" : "View", si: showCooperativeSocieties ? "සඟවන්න" : "බලන්න" }}
          />
          {showCooperativeSocieties && (
            <CommunityOrganizationDirectoryTable
              titleEn="Information Regarding Cooperative Societies Operating Within the Grama Niladhari Division"
              titleSi="ග්‍රාම නිලධාරී වසම තුළ ක්‍රියාත්මක සමූපකාර සමිති පිළිබඳ තොරතුරු"
              nameHeaderEn="Name of Multi-Purpose Cooperative Society (MPCS)"
              nameHeaderSi="බහු කාර්ය සමූපකාර සමිතියේ (MPCS) නම"
              rows={cooperativeSocietyRows}
              tableRef={cooperativeSocietiesTableRef}
              isLoading={!analytics}
              error={analyticsError}
              showAddress={false}
            />
          )}

        </div>
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
                  <Bilingual en="GN Division Name" si="ග්‍රාම නිලධාරී වසමේ නම" />
                </TableHead>
                <TableHead>
                  <Bilingual en="GN Division Number" si="ග්‍රාම නිලධාරී වසමේ අංකය" />
                </TableHead>
                <TableHead>
                  <Bilingual en="Officer Name" si="නිලධාරීගේ නම" />
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  <Bilingual en="Phone" si="දුරකථන" />
                </TableHead>
                <TableHead className="hidden xl:table-cell">
                  <Bilingual en="Local Government Body" si="පළාත් පාලන ආයතනය" />
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  <Bilingual en="Electoral / Polling Division" si="මැතිවරණ බල ප්‍රදේශය" />
                </TableHead>
                <TableHead className="hidden xl:table-cell">
                  <Bilingual en="Farmers' Service Center" si="ගොවිජන සේවා මධ්‍යස්ථානය" />
                </TableHead>
                <TableHead className="hidden 2xl:table-cell">
                  <Bilingual en="Education Zone" si="අධ්‍යාපන කලාපය" />
                </TableHead>
                <TableHead className="hidden 2xl:table-cell">
                  <Bilingual en="Education Division" si="අධ්‍යාපන කොට්ඨාසය" />
                </TableHead>
                {showMahaweliColumn && (
                  <TableHead className="hidden 2xl:table-cell">
                    <Bilingual en="Mahaweli Zone" si="මහවැලි කොට්ඨාසය" />
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((row) => {
                const gn = GN_DIVISIONS.find((g) => g.id === row.gnDivision);
                const gnName = gn ? (lang === "si" ? gn.si : gn.en) : row.gnDivision;
                const gnNumber = row.gnDivision;

                return (
                  <TableRow key={row.id}>
                    <TableCell>{gnName}</TableCell>
                    <TableCell>{gnNumber}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{row.phone}</TableCell>
                    <TableCell className="hidden xl:table-cell">{row.localGovt ?? "—"}</TableCell>
                    <TableCell className="hidden 2xl:table-cell">{row.electoral ?? "—"}</TableCell>
                    <TableCell className="hidden 2xl:table-cell">{row.farmers ?? "—"}</TableCell>
                    <TableCell className="hidden 2xl:table-cell">{row.eduZone ?? "—"}</TableCell>
                    <TableCell className="hidden 2xl:table-cell">{row.eduDiv ?? "—"}</TableCell>
                    {showMahaweliColumn && (
                      <TableCell className="hidden 2xl:table-cell">{row.mahaweli ?? "—"}</TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}