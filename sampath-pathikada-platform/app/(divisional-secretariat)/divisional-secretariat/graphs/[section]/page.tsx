"use client";

import * as React from "react";
import useSWR from "swr";
import Link from "next/link";
import { ArrowLeft, Globe2, Home, MapPin, Users, UserCheck, Eye } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Bilingual } from "@/components/Bilingual";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { GN_DIVISIONS } from "@/lib/registration-data";

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
}

interface RegistrationsResponse {
  data: RegistrationRow[];
  total: number;
  page: number;
  pageSize: number;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load");
  return json as RegistrationsResponse;
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
}: {
  icon: LucideIcon;
  titleEn: string;
  titleSi: string;
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
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="size-4" />
            <Bilingual en="View" si="බලන්න" />
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}

export default function Page({ params }: { params: Promise<{ section: string }> }) {
  const { lang } = useLanguage();
  const resolvedParams = React.use(params);
  const section = resolvedParams.section;
  const isAreaProfile = section === "area-profile";
  const isDemographics = section === "demographics";
  const { data, error, isLoading } = useSWR(
    isAreaProfile ? "/api/registrations?role=gn&status=all&limit=100" : null,
    fetcher
  );

  const title = isAreaProfile
    ? { en: "Area Profile", si: "ප්‍රදේශ පැතිකඩ" }
    : isDemographics
    ? { en: "Division Demographics Overview", si: "ජනගහන සාරාංශය" }
    : { en: "Section details", si: "සැකිලි විස්තර" };

  const description = isAreaProfile
    ? {
        en: "View the complete administrative directory and details for your EDOs.",
        si: "ඔබගේ EDO සඳහා පූර්ණ පරිපාලන ඩිරෙක්ටරිය සහ විස්තර දැක්වීමට මෙහි ක්ලික් කරන්න.",
      }
    : isDemographics
    ? {
        en: "Explore comprehensive demographic data, population distribution, and household metrics for your division.",
        si: "ඔබගේ වසම් සඳහා සම්පූර්ණ ජනගහන දත්ත, ජනගහන විනිවුදු සහ ගෘහස්ථ මැට්‍රික්ස් අධ්‍යයනය කරන්න.",
      }
    : {
        en: "This section is not available yet. Please return to the division information overview.",
        si: "මෙම කොටස තවම ලබා ගත නොහැක. කරුණාකර වසම් තොරතුරු ප්‍රස්ථාරයට ආපසු යන්න.",
      };

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
        <Button asChild variant="outline" size="sm">
          <Link href="/divisional-secretariat/graphs" className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            <Bilingual en="Back to dashboard" si="පුවරුවට ආපසු" />
          </Link>
        </Button>
      </div>

      {isDemographics ? (
        <div className="space-y-4">
          <TopicCard icon={Users} titleEn="Total Population" titleSi="මහජන සංඛ්‍යාව" />
          <TopicCard icon={MapPin} titleEn="Population by Grama Niladhari Divisions" titleSi="ග්‍රාම නිලධාරී වසම් අනුව ජනගහනය" />
          <TopicCard icon={Globe2} titleEn="Population Distribution by Religion" titleSi="ධර්මය අනුව ජනගහනය" />
          <TopicCard icon={Users} titleEn="Population Distribution by Ethnicity" titleSi="ජාතිය අනුව ජනගහනය" />
          <TopicCard icon={Globe2} titleEn="Foreign nationals in the division" titleSi="වසමේ විදේශ ජාතිකයන්" />
          <TopicCard icon={Home} titleEn="Households" titleSi="ගෘහස්ථයන්" />
          <TopicCard icon={UserCheck} titleEn="Registered voters" titleSi="රෙජිස්ටර් කර ඇති ඡන්දදාරුවන්" />
        </div>
      ) : !isAreaProfile ? (
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
