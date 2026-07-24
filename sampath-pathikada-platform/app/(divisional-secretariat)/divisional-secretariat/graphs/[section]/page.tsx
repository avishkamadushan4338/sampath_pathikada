"use client";

import * as React from "react";
import useSWR from "swr";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Bilingual } from "@/components/Bilingual";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

export default function Page({ params }: { params: Promise<{ section: string }> }) {
  const { lang } = useLanguage();
  const resolvedParams = React.use(params);
  const section = resolvedParams.section;
  const isIdentification = section === "identification";
  const { data, error, isLoading } = useSWR(
    isIdentification ? "/api/registrations?role=gn&status=all&limit=100" : null,
    fetcher
  );

  const title = isIdentification
    ? { en: "Identification", si: "හඳුනාගැනීම" }
    : { en: "Section details", si: "සැකිලි විස්තර" };

  const description = isIdentification
    ? {
        en: "Officer name, phone number, district, DS division, GN division name/number, local government body, electoral division, farmers' service center, education zone, and education division for your EDOs.",
        si: "ඔබගේ EDO සඳහා නිලධාරී නම, දුරකථන අංකය, දිස්ත්‍රික්කය, DS වසම, GN වසමේ නාමය/අංකය, පළාත් පාලන ආයතනය, මැතිවරණ බල ප්‍රදේශය, ගොවිජන සේවා මධ්‍යස්ථානය, අධ්‍යාපන කලාපය සහ අධ්‍යාපන කොට්ඨාසය.",
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

      {!isIdentification ? (
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
