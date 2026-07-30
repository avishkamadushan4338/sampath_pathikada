"use client";

import * as React from "react";
import useSWR from "swr";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { EmploymentAggregate } from "@/lib/analytics/aggregate-sections";
import { Bilingual } from "@/components/Bilingual";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { StateInstitutionsLandView } from "@/components/analytics/StateInstitutionsLandView";
import { PhysicalEnvironmentView } from "@/components/analytics/PhysicalEnvironmentView";
import { HousingView } from "@/components/analytics/HousingView";
import { EducationView } from "@/components/analytics/EducationView";
import { HealthView } from "@/components/analytics/HealthView";
import { EconomicAgricultureView } from "@/components/analytics/EconomicAgricultureView";
import { DemographicsView } from "@/components/analytics/DemographicsView";
import { RoadInfrastructureView } from "@/components/analytics/RoadInfrastructureView";
import { ReligiousCulturalView } from "@/components/analytics/ReligiousCulturalView";

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

interface AnalyticsResponse {
  ok: true;
  sections: {
    employment: EmploymentAggregate;
  };
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
  const isHealth = section === "health";
  const isEconomicAgriculture = section === "economic-agriculture";
  const isRoadInfrastructure = section === "road-infrastructure";
  const isReligiousCultural = section === "religious-cultural";
  const [employmentGnDivision, setEmploymentGnDivision] = React.useState("all");
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
    : isHealth
    ? { en: "Health", si: "සෞඛ්‍යය" }
    : isEconomicAgriculture
    ? { en: "Economic — Agriculture / Industry", si: "ආර්ථික — කෘෂිකාර්මික/කාර්මික" }
    : isRoadInfrastructure
    ? { en: "Transport & Infrastructure Facilities", si: "ප්‍රවාහන හා යටිතල පහසුකම්" }
    : isReligiousCultural
    ? { en: "Religious & Cultural", si: "ආගමික හා සංස්කෘතික" }
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
    : isReligiousCultural
    ? {
        en: "Search or select a GN division to view its religious sites, heritage sites, art academies, and traditional artists.",
        si: "ආගමික ස්ථාන, උරුම ස්ථාන, කලා අභ්‍යාස මධ්‍යස්ථාන සහ සම්ප්‍රදායික කලාකරුවන් පිළිබඳ දත්ත බැලීමට ග්‍රාම නිලධාරී වසමක් සොයන්න හෝ තෝරන්න.",
      }
    : {
        en: "This section is not available yet. Please return to the division information overview.",
        si: "මෙම කොටස තවම ලබා ගත නොහැක. කරුණාකර වසම් තොරතුරු ප්‍රස්ථාරයට ආපසු යන්න.",
      };

  const analyticsUrl = React.useMemo(() => {
    if (!isEmployment) return null;
    const params = new URLSearchParams({ year: String(CURRENT_YEAR) });
    if (employmentGnDivision !== "all") {
      params.set("gnDivisions", employmentGnDivision);
    }
    return `/api/analytics?${params.toString()}`;
  }, [isEmployment, employmentGnDivision]);

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
      ) : isReligiousCultural ? (
        <ReligiousCulturalView />
      ) : isDemographics ? (
        <DemographicsView />
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