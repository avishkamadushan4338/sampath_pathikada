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
            <div className="overflow-x-auto rounded-md border border-border/70">
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
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="px-3 text-base font-semibold text-foreground">
              <Bilingual en="Number of Beneficiaries" si="ප්‍රතිලාභීන් සංඛ්‍යාව" />
            </h3>
            <div className="overflow-x-auto rounded-md border border-border/70">
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
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="px-3 text-base font-semibold text-foreground">
              <Bilingual en="Information Regarding Elders' Homes" si="වැඩිහිටි නිවාස පිළිබඳ තොරතුරු" />
            </h3>
            <div className="overflow-x-auto rounded-md border border-border/70">
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
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="px-3 text-base font-semibold text-foreground">
              <Bilingual
                en="Information Regarding Government and Voluntary Children's Homes"
                si="රාජ්‍ය හා ස්වේච්ඡා ළමා නිවාස පිළිබඳ තොරතුරු"
              />
            </h3>
            <div className="overflow-x-auto rounded-md border border-border/70">
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
            </div>
          </section>
        </div>
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
  const isSocialWelfare = section === "social-welfare";
  const [employmentGnDivision, setEmploymentGnDivision] = React.useState("all");
  const [religiousGnDivision, setReligiousGnDivision] = React.useState("all");
  const [socialWelfareGnDivision, setSocialWelfareGnDivision] = React.useState("all");
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
    : { en: "Section details", si: "සැකිලි විස්තර" };

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
    : {
        en: "This section is not available yet. Please return to the division information overview.",
        si: "මෙම කොටස තවම ලබා ගත නොහැක. කරුණාකර වසම් තොරතුරු ප්‍රස්ථාරයට ආපසු යන්න.",
      };

  const analyticsUrl = React.useMemo(() => {
    if (!isDemographics && !isEmployment && !isReligiousCultural && !isSocialWelfare) return null;
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
    return `/api/analytics?${params.toString()}`;
  }, [
    isDemographics,
    isEmployment,
    isReligiousCultural,
    isSocialWelfare,
    employmentGnDivision,
    religiousGnDivision,
    socialWelfareGnDivision,
  ]);

  const { data: analytics, error: analyticsError } = useSWR(analyticsUrl, analyticsFetcher);
  const [showTotalPopulation, setShowTotalPopulation] = React.useState(false);
  const [showGnBreakdown, setShowGnBreakdown] = React.useState(false);
  const [showReligionDistribution, setShowReligionDistribution] = React.useState(false);
  const [showEthnicityDistribution, setShowEthnicityDistribution] = React.useState(false);
  const [showForeignNationals, setShowForeignNationals] = React.useState(false);
  const [showHouseholds, setShowHouseholds] = React.useState(false);
  const [showRegisteredVoters, setShowRegisteredVoters] = React.useState(false);
  const [expandedReligionRows, setExpandedReligionRows] = React.useState<Record<string, boolean>>({});
  const gnBreakdownRef = React.useRef<HTMLDivElement | null>(null);
  const religionTableRef = React.useRef<HTMLDivElement | null>(null);
  const ethnicityTableRef = React.useRef<HTMLDivElement | null>(null);
  const foreignTableRef = React.useRef<HTMLDivElement | null>(null);
  const householdsTableRef = React.useRef<HTMLDivElement | null>(null);
  const votersTableRef = React.useRef<HTMLDivElement | null>(null);

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
                  <Bilingual en="Population Distribution by Religion" si="ධර්මය අනුව ජනගහනය" />
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
        <div className="space-y-3">
          <h2 className="font-display text-fluid-xl font-semibold text-foreground">
            <Bilingual en="Job Outlook" si="රැකියා ඉදිරි දැක්ම" />
          </h2>
          <div className="max-w-sm space-y-1">
            <p className="text-fluid-xs font-medium text-muted-foreground">
              <Bilingual en="Filter by GN Division" si="ග්‍රාම නිලධාරී වසම අනුව පෙරහන්න" />
            </p>
            <Select value={employmentGnDivision} onValueChange={setEmploymentGnDivision}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {lang === "si" ? "සියලුම ග්‍රාම නිලධාරී වසම්" : "All GN divisions"}
                </SelectItem>
                {employmentGnOptions.map((gn) => (
                  <SelectItem key={gn.id} value={gn.id}>
                    {lang === "si" ? gn.si : gn.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {analyticsError ? (
            <div className="text-sm text-destructive">Unable to load employment data.</div>
          ) : !analytics ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <>
              <div className="overflow-hidden rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>
                        <Bilingual en="Number of people seeking employment by education" si="අධ්‍යාපනය අනුව රැකියා අපේක්ෂකයන්" />
                      </TableHead>
                      <TableHead>
                        <Bilingual en="Number of Persons" si="පුද්ගලයන් සංඛ්‍යාව" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employmentEducationRows.map((row) => (
                      <TableRow key={row.en}>
                        <TableCell className="font-medium">
                          <Bilingual en={row.en} si={row.si} />
                        </TableCell>
                        <TableCell className="nums-tabular">{row.count.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <h3 className="pt-3 font-display text-fluid-lg font-semibold text-foreground">
                <Bilingual
                  en="Number of people who wish to receive vocational training but do not meet the qualifications required for vocational training"
                  si="වෘත්තීය පුහුණුව ලබා ගැනීමට කැමති නමුත් ඒ සඳහා අවශ්‍ය සුදුසුකම් සපුරා නොමැති පුද්ගලයන් සංඛ්‍යාව"
                />
              </h3>
              <div className="overflow-hidden rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead />
                      <TableHead>
                        <Bilingual en="Number of Persons" si="පුද්ගලයන් සංඛ්‍යාව" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employmentTrainingNeedRows.map((row) => (
                      <TableRow key={row.en}>
                        <TableCell className="font-medium">
                          <div className="space-y-1">
                            {row.enLines.map((enLine, index) => (
                              <div key={enLine}>
                                <Bilingual en={enLine} si={row.siLines[index] ?? row.si} />
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="nums-tabular">{row.count.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <h3 className="pt-3 font-display text-fluid-lg font-semibold text-foreground">
                <Bilingual en="Self-Employment Related Information" si="ස්වයං රැකියා ආශ්‍රිත තොරතුරු" />
              </h3>
              <div className="overflow-hidden rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>
                        <Bilingual en="Self-Employment Activity" si="ස්වයං රැකියා ක්‍රියාකාරකම" />
                      </TableHead>
                      <TableHead>
                        <Bilingual en="Number of Persons" si="පුද්ගලයන් සංඛ්‍යාව" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selfEmploymentActivityRows.map((row) => (
                      <TableRow key={row.en}>
                        <TableCell className="font-medium">
                          <Bilingual en={row.en} si={row.si} />
                        </TableCell>
                        <TableCell className="nums-tabular">{row.count.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <h3 className="pt-3 font-display text-fluid-lg font-semibold text-foreground">
                <Bilingual en="Information on Persons Engaged in Self-Employment" si="ස්වයං රැකියාවල නියුතු පුද්ගලයන් පිළිබඳ තොරතුරු" />
              </h3>
              <div className="overflow-hidden rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>
                        <Bilingual en="Self-Employment Field" si="ස්වයං රැකියා ක්ෂේත්‍රය" />
                      </TableHead>
                      <TableHead>
                        <Bilingual en="Person's Name" si="පුද්ගලයාගේ නම" />
                      </TableHead>
                      <TableHead>
                        <Bilingual en="Telephone Number" si="දුරකථන අංකය" />
                      </TableHead>
                      <TableHead>
                        <Bilingual en="Market" si="වෙළඳපොළ" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selfEmployedPersonRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                          <Bilingual en="No self-employed persons recorded for this division." si="මෙම වසම සඳහා ස්වයං රැකියාවල නියුතු පුද්ගලයන් සටහන් වී නොමැත." />
                        </TableCell>
                      </TableRow>
                    ) : (
                      selfEmployedPersonRows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{row.field || "—"}</TableCell>
                          <TableCell>{row.personName || "—"}</TableCell>
                          <TableCell className="nums-tabular">{row.telephone}</TableCell>
                          <TableCell>{row.market || "—"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      ) : isReligiousCultural ? (
        <div className="space-y-4">
          <div className="max-w-sm space-y-1">
            <p className="text-fluid-xs font-medium text-muted-foreground">
              <Bilingual en="Filter by GN Division" si="ග්‍රාම නිලධාරී වසම අනුව පෙරහන්න" />
            </p>
            <Select value={religiousGnDivision} onValueChange={setReligiousGnDivision}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {lang === "si" ? "සියලුම ග්‍රාම නිලධාරී වසම්" : "All GN divisions"}
                </SelectItem>
                {employmentGnOptions.map((gn) => (
                  <SelectItem key={gn.id} value={gn.id}>
                    {lang === "si" ? gn.si : gn.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {analyticsError ? (
            <div className="text-sm text-destructive">Unable to load religious and cultural data.</div>
          ) : !analytics ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <>
              <h3 className="pt-2 font-display text-fluid-lg font-semibold text-foreground">
                <Bilingual
                  en="Total Number of Religious Places"
                  si="ආගමික ස්ථාන මුළු සංඛ්‍යාව"
                />
              </h3>

              <div className="overflow-hidden rounded-md border border-border">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="border-r border-border px-3 py-3" rowSpan={2}>Indicator</th>
                        <th className="border-r border-border px-3 py-3">Buddhist Temples / Hermitages / Monasteries / Asapu</th>
                        <th className="border-r border-border px-3 py-3">Nunneries / Meheni Arama</th>
                        <th className="border-r border-border px-3 py-3">Mosques</th>
                        <th className="border-r border-l border-border px-3 py-3 text-center" colSpan={2}>Catholic Churches</th>
                        <th className="px-3 py-3">Hindu Kovils / Temples</th>
                      </tr>
                      <tr>
                        <th className="border-t border-r border-border px-3 py-3 text-center font-semibold">Buddhist Monks</th>
                        <th className="border-t border-r border-border px-3 py-3 text-center font-semibold">Buddhist Nuns</th>
                        <th className="border-t border-r border-border px-3 py-3 text-center font-semibold">Mawlawis</th>
                        <th className="border-t border-r border-l border-border px-3 py-3 text-center font-semibold">Priests</th>
                        <th className="border-t border-r border-border px-3 py-3 text-center font-semibold">Nuns / Sisters</th>
                        <th className="border-t border-border px-3 py-3 text-center font-semibold">Priests / Poojaris</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="border-r border-border px-3 py-3 font-medium">Number of Religious Places</td>
                        <td className="border-r border-border px-3 py-3 nums-tabular">{analytics.sections.areaProfile.religiousSiteCounts.temples.count.toLocaleString()}</td>
                        <td className="border-r border-border px-3 py-3 nums-tabular">{analytics.sections.areaProfile.religiousSiteCounts.meheniArama.count.toLocaleString()}</td>
                        <td className="border-r border-border px-3 py-3 nums-tabular">{analytics.sections.areaProfile.religiousSiteCounts.mosques.count.toLocaleString()}</td>
                        <td className="border-r border-border px-3 py-3 nums-tabular text-center" colSpan={2}>{analytics.sections.areaProfile.religiousSiteCounts.churches.count.toLocaleString()}</td>
                        <td className="px-3 py-3 nums-tabular">{analytics.sections.areaProfile.religiousSiteCounts.kovils.count.toLocaleString()}</td>
                      </tr>
                      <tr className="border-t">
                        <td className="border-r border-border px-3 py-3 font-medium">Number of Clergy / Religious Leaders</td>
                        <td className="border-r border-border px-3 py-3 nums-tabular">{analytics.sections.areaProfile.religiousSiteCounts.temples.clergyCount.toLocaleString()}</td>
                        <td className="border-r border-border px-3 py-3 nums-tabular">{analytics.sections.areaProfile.religiousSiteCounts.meheniArama.clergyCount.toLocaleString()}</td>
                        <td className="border-r border-border px-3 py-3 nums-tabular">{analytics.sections.areaProfile.religiousSiteCounts.mosques.clergyCount.toLocaleString()}</td>
                        <td className="border-r border-border px-3 py-3 nums-tabular">{analytics.sections.areaProfile.religiousSiteCounts.churches.priestsCount.toLocaleString()}</td>
                        <td className="border-r border-border px-3 py-3 nums-tabular">{analytics.sections.areaProfile.religiousSiteCounts.churches.nunsCount.toLocaleString()}</td>
                        <td className="px-3 py-3 nums-tabular">{analytics.sections.areaProfile.religiousSiteCounts.kovils.clergyCount.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <h3 className="pt-2 font-display text-fluid-lg font-semibold text-foreground">
                <Bilingual
                  en="Names of Religious Places / Sacred Sites in the Area"
                  si="ප්‍රදේශයේ ආගමික ස්ථාන / පූජනීය ස්ථානවල නම්"
                />
              </h3>

              <div className="overflow-hidden rounded-md border border-border">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="px-3 py-3">Name of Religious Place / Sacred Site</th>
                        <th className="px-3 py-3">Category / Type</th>
                        <th className="px-3 py-3">Reason for Being Special / Notable</th>
                        <th className="px-3 py-3">Used for Dhamma Schools / Pirivenas or Government Purposes?</th>
                        <th className="px-3 py-3">Describe the Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {religiousHeritageRows.length === 0 ? (
                        <tr className="border-t last:border-b">
                          <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                            No religious place / sacred site records available.
                          </td>
                        </tr>
                      ) : (
                        religiousHeritageRows.map((row, index) => (
                          <tr key={`${row.gnId}-${row.name}-${index}`} className="border-t last:border-b">
                            <td className="px-3 py-3">{row.name || "—"}</td>
                            <td className="px-3 py-3">{row.type || "—"}</td>
                            <td className="px-3 py-3">{row.significance || "—"}</td>
                            <td className="px-3 py-3">
                              {row.usedForDhammaOrGovtPurpose === "yes"
                                ? "Yes"
                                : row.usedForDhammaOrGovtPurpose === "no"
                                ? "No"
                                : "—"}
                            </td>
                            <td className="px-3 py-3">{row.taskDescription || "—"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <h3 className="pt-2 font-display text-fluid-lg font-semibold text-foreground">
                <Bilingual en="Art Academies" si="කලා අභ්‍යාස මධ්‍යස්ථාන" />
              </h3>

              <div className="overflow-hidden rounded-md border border-border">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="px-3 py-3">Name</th>
                        <th className="px-3 py-3">Registration No</th>
                        <th className="px-3 py-3">Student Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {religiousArtAcademyRows.length === 0 ? (
                        <tr className="border-t last:border-b">
                          <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                            No art academy records available.
                          </td>
                        </tr>
                      ) : (
                        religiousArtAcademyRows.map((row, index) => (
                          <tr key={`${row.gnId}-${row.name}-${index}`} className="border-t last:border-b">
                            <td className="px-3 py-3">{row.name || "—"}</td>
                            <td className="px-3 py-3">{row.registrationNumber || "—"}</td>
                            <td className="px-3 py-3 nums-tabular">{(row.studentCount ?? 0).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <h3 className="pt-2 font-display text-fluid-lg font-semibold text-foreground">
                <Bilingual en="Traditional Artists" si="සම්ප්‍රදායික කලාකරුවන්" />
              </h3>

              <div className="overflow-hidden rounded-md border border-border">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="px-3 py-3">Name</th>
                        <th className="px-3 py-3">Art Form</th>
                        <th className="px-3 py-3">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {religiousTraditionalArtistRows.length === 0 ? (
                        <tr className="border-t last:border-b">
                          <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                            No traditional artist records available.
                          </td>
                        </tr>
                      ) : (
                        religiousTraditionalArtistRows.map((row, index) => (
                          <tr key={`${row.gnId}-${row.name}-${index}`} className="border-t last:border-b">
                            <td className="px-3 py-3">{row.name || "—"}</td>
                            <td className="px-3 py-3">{row.artForm || "—"}</td>
                            <td className="px-3 py-3">{row.description || "—"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
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