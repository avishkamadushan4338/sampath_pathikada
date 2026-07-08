"use client";

import { useMemo } from "react";
import useSWR from "swr";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import { TrendingUp, Clock, Building2, CheckCircle2 } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Bilingual } from "@/components/Bilingual";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DISTRICTS, DIVISIONAL_SECRETARIATS, GN_DIVISIONS } from "@/lib/registration-data";
import { STATUS_LABEL, STATUS_BADGE_CLASS, type SubmissionStatus } from "@/lib/status-ui";
import { CURRENT_YEAR } from "@/lib/constants";

/* On-brand chart palette — same hex constants convention as the Super Admin dashboard. */
const NAVY = "#0E2B4E";
const GOLD = "#BC9144";
const MAROON = "#66261E";
const GREEN = "#2D7A51";

interface SubmissionListItem {
  id: string;
  year: number;
  district: string;
  dsDivision: string;
  gnDivision: string;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  submittedBy: { name: string; email: string; phone: string | null };
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load");
  return json as { data: SubmissionListItem[]; total: number };
};

function gnLabel(id: string, lang: "en" | "si") {
  const gn = GN_DIVISIONS.find((g) => g.id === id);
  return gn ? (lang === "si" ? gn.si : gn.en) : id;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: { label: string; value: number; fill: string } }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div
      className="rounded-xl p-3 text-xs"
      style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", boxShadow: "0 10px 30px rgba(0,0,0,0.10)" }}
    >
      <p className="font-semibold" style={{ color: p.fill }}>
        {p.label}: <strong>{p.value}</strong>
      </p>
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-2 h-8 w-56" />
      <Skeleton className="mb-8 h-5 w-72" />
      <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(clamp(180px,25vw,240px),1fr))] gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <Skeleton className="mb-8 h-72 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export default function SummaryPage() {
  const { lang } = useLanguage();
  const { user, isLoading: sessionLoading } = useSession();
  const { data, isLoading } = useSWR(`/api/submissions?year=${CURRENT_YEAR}&limit=100`, fetcher);

  const dsDivision = useMemo(
    () => (user?.dsDivision ? DIVISIONAL_SECRETARIATS.find((d) => d.id === user.dsDivision) : undefined),
    [user]
  );
  const district = useMemo(
    () => (dsDivision ? DISTRICTS.find((d) => d.id === dsDivision.districtId) : undefined),
    [dsDivision]
  );
  const gnRoster = useMemo(
    () => (user?.dsDivision ? GN_DIVISIONS.filter((gn) => gn.dsId === user.dsDivision) : []),
    [user]
  );
  const submissionByGn = useMemo(() => {
    const map = new Map<string, SubmissionListItem>();
    for (const s of data?.data ?? []) map.set(s.gnDivision, s);
    return map;
  }, [data]);

  const stageBreakdown = useMemo(() => {
    const rows = data?.data ?? [];
    const notStarted = gnRoster.length - rows.length;
    const counts = {
      notStarted: Math.max(0, notStarted),
      submitted: rows.filter((r) => r.status === "SUBMITTED").length,
      revisionNeeded: rows.filter((r) => r.status === "REVISION_NEEDED").length,
      approved: rows.filter((r) => r.status === "APPROVED").length,
      rejected: rows.filter((r) => r.status === "REJECTED").length,
    };
    return [
      { label: lang === "si" ? "ආරම්භ කර නැත" : "Not Started", value: counts.notStarted, fill: "#8A8577" },
      { label: STATUS_LABEL.SUBMITTED[lang], value: counts.submitted, fill: GOLD },
      { label: STATUS_LABEL.REVISION_NEEDED[lang], value: counts.revisionNeeded, fill: GOLD },
      { label: STATUS_LABEL.APPROVED[lang], value: counts.approved, fill: GREEN },
      { label: STATUS_LABEL.REJECTED[lang], value: counts.rejected, fill: MAROON },
    ];
  }, [data, gnRoster, lang]);

  const stats = useMemo(() => {
    const rows = data?.data ?? [];
    const decided = rows.filter((r) => r.status === "APPROVED" || r.status === "REJECTED");
    const approvalRate = decided.length > 0 ? Math.round((rows.filter((r) => r.status === "APPROVED").length / decided.length) * 100) : null;
    const notSubmitted = Math.max(0, gnRoster.length - rows.length);

    const decisionDurations = rows
      .filter((r) => r.reviewedAt && (r.status === "APPROVED" || r.status === "REJECTED"))
      .map((r) => (new Date(r.reviewedAt!).getTime() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const avgDays = decisionDurations.length > 0
      ? Math.round((decisionDurations.reduce((a, b) => a + b, 0) / decisionDurations.length) * 10) / 10
      : null;

    return { approvalRate, notSubmitted, avgDays, totalDivisions: gnRoster.length };
  }, [data, gnRoster]);

  if (sessionLoading || isLoading) return <SummarySkeleton />;

  const statTiles = [
    {
      key: "approvalRate",
      icon: TrendingUp,
      colorVar: "--status-approved",
      label: { en: "Approval Rate", si: "අනුමැති අනුපාතය" },
      value: stats.approvalRate !== null ? `${stats.approvalRate}%` : "—",
    },
    {
      key: "avgDays",
      icon: Clock,
      colorVar: "--chart-2",
      label: { en: "Avg. Days to Decision", si: "තීරණයට සාමාන්‍ය දින" },
      value: stats.avgDays !== null ? stats.avgDays.toString() : "—",
    },
    {
      key: "notSubmitted",
      icon: Building2,
      colorVar: "--status-pending",
      label: { en: "Not Yet Submitted", si: "තවම ඉදිරිපත් කර නැත" },
      value: stats.notSubmitted.toString(),
    },
    {
      key: "totalDivisions",
      icon: CheckCircle2,
      colorVar: "--chart-1",
      label: { en: "GN Divisions in Area", si: "ප්‍රදේශයේ ග්‍රාම නිලධාරී වසම්" },
      value: stats.totalDivisions.toString(),
    },
  ];

  const gnRows = [...gnRoster].sort((a, b) => (lang === "si" ? a.si : a.en).localeCompare(lang === "si" ? b.si : b.en));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-fluid-3xl font-semibold text-primary">
          <Bilingual en="Summary" si="සාරාංශය" />
        </h1>
        <p className="mt-2 text-fluid-base text-muted-foreground">
          {dsDivision && <span>{lang === "si" ? dsDivision.si : dsDivision.en}</span>}
          {district && <span> · {lang === "si" ? district.si : district.en}</span>}
          {" · "}{CURRENT_YEAR}/{(CURRENT_YEAR + 1) % 100}
        </p>
      </div>

      {/* Stat tiles */}
      <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(clamp(180px,25vw,240px),1fr))] gap-4">
        {statTiles.map(({ key, icon: Icon, colorVar, label, value }) => (
          <Card key={key} className="card-lift">
            <CardContent className="flex items-center gap-4 py-5">
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `hsl(var(${colorVar}) / 0.12)`, color: `hsl(var(${colorVar}))` }}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-fluid-2xl font-semibold nums-tabular text-foreground">{value}</p>
                <p lang={lang} className={lang === "si" ? "font-si text-fluid-xs text-muted-foreground" : "font-ui text-fluid-xs text-muted-foreground"}>
                  {lang === "si" ? label.si : label.en}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stage breakdown chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-fluid-lg">
            <Bilingual en="Submission Stage Breakdown" si="ඉදිරිපත් කිරීමේ අදියර අනුව බෙදීම" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageBreakdown} layout="vertical" margin={{ top: 8, right: 32, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={140}
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
                  {stageBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                  <LabelList dataKey="value" position="right" style={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Per-GN-division breakdown table — also serves as the accessible table-view fallback for the chart above */}
      <Card>
        <CardHeader>
          <CardTitle className="text-fluid-lg">
            <Bilingual en="GN Division Breakdown" si="ග්‍රාම නිලධාරී වසම් අනුව විස්තර" />
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead><Bilingual en="GN Division" si="ග්‍රාම නිලධාරී වසම" /></TableHead>
                  <TableHead><Bilingual en="Officer" si="නිලධාරී" /></TableHead>
                  <TableHead><Bilingual en="Status" si="තත්ත්වය" /></TableHead>
                  <TableHead className="hidden sm:table-cell"><Bilingual en="Submitted" si="ඉදිරිපත් කළ දිනය" /></TableHead>
                  <TableHead className="hidden sm:table-cell"><Bilingual en="Decided" si="තීරණය කළ දිනය" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gnRows.map((gn) => {
                  const submission = submissionByGn.get(gn.id);
                  return (
                    <TableRow key={gn.id}>
                      <TableCell className="font-medium text-foreground">{lang === "si" ? gn.si : gn.en}</TableCell>
                      <TableCell className="text-muted-foreground">{submission?.submittedBy.name ?? "—"}</TableCell>
                      <TableCell>
                        {submission ? (
                          <Badge variant="outline" className={STATUS_BADGE_CLASS[submission.status]}>
                            {STATUS_LABEL[submission.status][lang]}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            <Bilingual en="Not submitted" si="ඉදිරිපත් කර නැත" />
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">
                        {submission ? new Date(submission.createdAt).toLocaleDateString(lang === "si" ? "si-LK" : "en-LK", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">
                        {submission?.reviewedAt ? new Date(submission.reviewedAt).toLocaleDateString(lang === "si" ? "si-LK" : "en-LK", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
