"use client";

import useSWR from "swr";
import { Bilingual } from "@/components/Bilingual";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/hooks/use-session";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { CURRENT_YEAR } from "@/lib/constants";
import { DISTRICTS, DIVISIONAL_SECRETARIATS, GN_DIVISIONS } from "@/lib/registration-data";

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
  dsDivision: string | null;
  jurisdiction: string | null;
}

interface RegistrationsResponse {
  data: RegistrationRow[];
  total: number;
  page: number;
  pageSize: number;
}

interface SubmissionListRow {
  gnDivision: string;
  officerDesignation: string | null;
}

interface SubmissionsResponse {
  data: SubmissionListRow[];
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

const submissionsFetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load submissions");
  return json as SubmissionsResponse;
};

function DirectorySkeleton() {
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

/** The "Identification" section (§1) is fundamentally different from every other section: it's
 *  not survey data an officer fills in and a DS approves — it's the administrative directory of
 *  registered EDOs and the jurisdictional areas each one's GN division sits in, captured at
 *  registration time. So instead of GnScopedSectionView's "pick one GN division / approved-data"
 *  pattern, this always shows every registered EDO in the DS division as one directory table —
 *  regardless of whether that officer has submitted or been approved for the current year yet.
 *  `officerDesignation` is the one field that DOES come from this year's submission (entered
 *  as part of the Identification section an officer fills in), joined in by GN division. */
export function IdentificationDirectoryView() {
  const { user } = useSession();
  const { lang } = useLanguage();
  const showMahaweliColumn = user?.dsDivision === "hambantota-ds";

  const { data, error, isLoading } = useSWR("/api/registrations?role=gn&status=all&limit=100", fetcher);
  const { data: submissionsData } = useSWR(`/api/submissions?year=${CURRENT_YEAR}&status=all&limit=100`, submissionsFetcher);

  const designationByGn = new Map<string, string>();
  for (const row of submissionsData?.data ?? []) {
    if (row.officerDesignation) designationByGn.set(row.gnDivision, row.officerDesignation);
  }

  if (isLoading) return <DirectorySkeleton />;
  if (error || !data) {
    return (
      <Card>
        <CardContent className="text-fluid-sm text-muted-foreground">
          <Bilingual
            en="Unable to load registration details right now. Please try again shortly."
            si="ලියාපදිංචි විස්තර මෙම මොහොතේ පූරණය කළ නොහැක. ටික වේලාවකින් නැවත උත්සාහ කරන්න."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-muted/40 text-muted-foreground">
          <tr>
            <th rowSpan={2} className="border-b border-r px-3 py-3 align-middle font-semibold whitespace-nowrap">
              <Bilingual en="GN Division Name" si="ග්‍රාම නිලධාරී වසමේ නම" />
            </th>
            <th rowSpan={2} className="border-b border-r px-3 py-3 align-middle font-semibold whitespace-nowrap">
              <Bilingual en="GN Division Number" si="ග්‍රාම නිලධාරී වසම අංකය" />
            </th>
            <th colSpan={3} className="border-b border-r px-3 py-3 text-center font-semibold whitespace-nowrap">
              <Bilingual en="Information Providing Officer" si="තොරතුරු සපයන නිලධාරී" />
            </th>
            <th colSpan={showMahaweliColumn ? 8 : 7} className="border-b px-3 py-3 text-center font-semibold whitespace-nowrap">
              <Bilingual en="Administrative / Jurisdictional Areas of the GN Division" si="ග්‍රාම නිලධාරී වසමේ පරිපාලන / බල ප්‍රදේශ" />
            </th>
          </tr>
          <tr>
            <th className="border-b border-r px-3 py-3 whitespace-nowrap font-medium">
              <Bilingual en="Name" si="නම" />
            </th>
            <th className="border-b border-r px-3 py-3 whitespace-nowrap font-medium">
              <Bilingual en="Designation" si="තනතුර" />
            </th>
            <th className="border-b border-r px-3 py-3 whitespace-nowrap font-medium">
              <Bilingual en="Telephone Number" si="දුරකථන අංකය" />
            </th>
            <th className="border-b border-r px-3 py-3 whitespace-nowrap font-medium">
              <Bilingual en="District" si="දිස්ත්‍රික්කය" />
            </th>
            <th className="border-b border-r px-3 py-3 whitespace-nowrap font-medium">
              <Bilingual en="Divisional Secretariat Division" si="ප්‍රාදේශීය ලේකම් කොට්ඨාශය" />
            </th>
            <th className="border-b border-r px-3 py-3 whitespace-nowrap font-medium">
              <Bilingual en="Local Government Authority / Area" si="පළාත් පාලන ආයතනය / ප්‍රදේශය" />
            </th>
            <th className="border-b border-r px-3 py-3 whitespace-nowrap font-medium">
              <Bilingual en="Electoral Division / Electorate Area" si="මැතිවරණ බල ප්‍රදේශය" />
            </th>
            <th className="border-b border-r px-3 py-3 whitespace-nowrap font-medium">
              <Bilingual en="Agrarian Services Centre" si="ගොවි සේවා මධ්‍යස්ථානය" />
            </th>
            <th className="border-b border-r px-3 py-3 whitespace-nowrap font-medium">
              <Bilingual en="Education Zone" si="අධ්‍යාපන කලාපය" />
            </th>
            <th className={`border-b px-3 py-3 whitespace-nowrap font-medium${showMahaweliColumn ? " border-r" : ""}`}>
              <Bilingual en="Education Division" si="අධ්‍යාපන කොට්ඨාසය" />
            </th>
            {showMahaweliColumn && (
              <th className="border-b px-3 py-3 whitespace-nowrap font-medium">
                <Bilingual en="Mahaweli Zone" si="මහවැලි කොට්ඨාසය" />
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.data.map((row) => {
            const gn = GN_DIVISIONS.find((g) => g.id === row.gnDivision);
            const gnName = gn ? (lang === "si" ? gn.si : gn.en) : row.gnDivision;
            const district = DISTRICTS.find((item) => item.id === row.district);
            const districtName = district ? (lang === "si" ? district.si : district.en) : row.district;
            const dsDivision = DIVISIONAL_SECRETARIATS.find((item) => item.id === row.dsDivision);
            const dsDivisionName = dsDivision ? (lang === "si" ? dsDivision.si : dsDivision.en) : row.dsDivision;
            return (
              <tr key={row.id} className="border-t hover:bg-muted/20">
                <td className="border-r px-3 py-3 font-medium whitespace-nowrap">{gnName}</td>
                <td className="border-r px-3 py-3 whitespace-nowrap">{row.gnDivision}</td>
                <td className="border-r px-3 py-3 whitespace-nowrap">{row.name}</td>
                <td className="border-r px-3 py-3 whitespace-nowrap">{designationByGn.get(row.gnDivision) ?? "—"}</td>
                <td className="border-r px-3 py-3 whitespace-nowrap">{row.phone ?? "—"}</td>
                <td className="border-r px-3 py-3 whitespace-nowrap">{districtName ?? "—"}</td>
                <td className="border-r px-3 py-3 whitespace-nowrap">{dsDivisionName ?? "—"}</td>
                <td className="border-r px-3 py-3 whitespace-nowrap">{row.localGovt ?? "—"}</td>
                <td className="border-r px-3 py-3 whitespace-nowrap">{row.electoral ?? "—"}</td>
                <td className="border-r px-3 py-3 whitespace-nowrap">{row.farmers ?? "—"}</td>
                <td className="border-r px-3 py-3 whitespace-nowrap">{row.eduZone ?? "—"}</td>
                <td className={`px-3 py-3 whitespace-nowrap${showMahaweliColumn ? " border-r" : ""}`}>{row.eduDiv ?? "—"}</td>
                {showMahaweliColumn && <td className="px-3 py-3 whitespace-nowrap">{row.mahaweli ?? "—"}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
