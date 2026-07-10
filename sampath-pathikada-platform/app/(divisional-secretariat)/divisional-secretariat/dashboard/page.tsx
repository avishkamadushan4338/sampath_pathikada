"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Eye, ClipboardList, CheckCircle2, XCircle, MessageSquareWarning, Inbox, BarChart3, ArrowRight, CircleDashed, UserX } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Bilingual } from "@/components/Bilingual";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DISTRICTS, DIVISIONAL_SECRETARIATS, GN_DIVISIONS } from "@/lib/registration-data";
import { STATUS_LABEL, STATUS_BADGE_CLASS, STATUS_SORT_WEIGHT, type SubmissionStatus } from "@/lib/status-ui";
import { CURRENT_YEAR } from "@/lib/constants";

interface SubmissionListItem {
  id: string;
  year: number;
  district: string;
  dsDivision: string;
  gnDivision: string;
  status: SubmissionStatus;
  updatedAt: string;
  submittedBy: { name: string; email: string; phone: string | null };
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load");
  return json as { data: SubmissionListItem[]; total: number };
};

interface AnalyticsGnRow {
  gnId: string;
  officer: string | null;
  officerRegistered: boolean;
}

const analyticsFetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load");
  return json as { notRegisteredCount: number; gnBreakdown: AnalyticsGnRow[] };
};

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-2 h-9 w-72" />
      <Skeleton className="mb-8 h-5 w-48" />
      <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(clamp(180px,25vw,240px),1fr))] gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="mb-8 h-20 rounded-xl" />
      <Skeleton className="mb-4 h-6 w-56" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(clamp(220px,28vw,300px),1fr))] gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function DivisionalSecretariatDashboardPage() {
  const { lang } = useLanguage();
  const { user, isLoading: sessionLoading } = useSession();
  const { data, isLoading } = useSWR(`/api/submissions?year=${CURRENT_YEAR}&limit=100`, fetcher);
  const { data: analytics } = useSWR(
    user?.dsDivision ? `/api/analytics?year=${CURRENT_YEAR}` : null,
    analyticsFetcher
  );
  const [filterMode, setFilterMode] = useState<"all" | "pending" | "unregistered">("all");

  const officerInfoByGn = useMemo(() => {
    const map = new Map<string, AnalyticsGnRow>();
    for (const g of analytics?.gnBreakdown ?? []) map.set(g.gnId, g);
    return map;
  }, [analytics]);

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

  const counts = useMemo(() => {
    const rows = data?.data ?? [];
    const submitted = rows.filter((r) => r.status === "SUBMITTED").length;
    const approved = rows.filter((r) => r.status === "APPROVED").length;
    const rejected = rows.filter((r) => r.status === "REJECTED").length;
    const revisionNeeded = rows.filter((r) => r.status === "REVISION_NEEDED").length;
    // Pending = no officer registered for the GN division yet, or an officer started but never submitted (DRAFT).
    const pending = Math.max(0, gnRoster.length - (submitted + approved + rejected + revisionNeeded));
    return { submitted, approved, rejected, revisionNeeded, pending };
  }, [data, gnRoster]);

  const sortedRoster = useMemo(() => {
    const weightOf = (gnId: string) => {
      const status = submissionByGn.get(gnId)?.status;
      return status ? STATUS_SORT_WEIGHT[status] : 5;
    };
    return [...gnRoster].sort((a, b) => {
      const wa = weightOf(a.id);
      const wb = weightOf(b.id);
      if (wa !== wb) return wa - wb;
      return (lang === "si" ? a.si : a.en).localeCompare(lang === "si" ? b.si : b.en);
    });
  }, [gnRoster, submissionByGn, lang]);

  if (sessionLoading || isLoading) {
    return <DashboardSkeleton />;
  }

  const total = gnRoster.length || 1;
  const statCards: {
    key: string;
    value: number;
    label: { en: string; si: string };
    icon: typeof Inbox;
    colorVar: string;
    filterKey?: "pending" | "unregistered";
  }[] = [
    { key: "pending", value: counts.pending, label: { en: "Pending", si: "ඉදිරිපත් කර නැත" }, icon: CircleDashed, colorVar: "--muted-foreground", filterKey: "pending" },
    { key: "unregistered", value: analytics?.notRegisteredCount ?? 0, label: { en: "No Officer", si: "නිලධාරියෙක් නැත" }, icon: UserX, colorVar: "--status-rejected", filterKey: "unregistered" },
    { key: "submitted", value: counts.submitted, label: { en: "Awaiting Review", si: "සමාලෝචනය බලාපොරොත්තුවෙන්" }, icon: Inbox, colorVar: "--status-pending" },
    { key: "approved", value: counts.approved, label: STATUS_LABEL.APPROVED, icon: CheckCircle2, colorVar: "--status-approved" },
    { key: "revisionNeeded", value: counts.revisionNeeded, label: STATUS_LABEL.REVISION_NEEDED, icon: MessageSquareWarning, colorVar: "--status-pending" },
    { key: "rejected", value: counts.rejected, label: STATUS_LABEL.REJECTED, icon: XCircle, colorVar: "--status-rejected" },
  ];

  const displayedRoster = filterMode === "pending"
    ? sortedRoster.filter((gn) => {
        const s = submissionByGn.get(gn.id)?.status;
        return !s || s === "DRAFT";
      })
    : filterMode === "unregistered"
      ? sortedRoster.filter((gn) => !(officerInfoByGn.get(gn.id)?.officerRegistered ?? true))
      : sortedRoster;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-fluid-3xl font-semibold text-primary">
          {dsDivision ? (lang === "si" ? dsDivision.si : dsDivision.en) : (
            <Bilingual en="Divisional Secretariat Dashboard" si="ප්‍රාදේශීය ලේකම් පාලක පුවරුව" />
          )}
        </h1>
        <p className="mt-2 text-fluid-base text-muted-foreground">
          {district && <span>{lang === "si" ? district.si : district.en} · </span>}
          {CURRENT_YEAR}/{(CURRENT_YEAR + 1) % 100}
        </p>
      </div>

      {/* Stat row */}
      <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(clamp(180px,25vw,240px),1fr))] gap-4">
        {statCards.map(({ key, value, label, icon: Icon, colorVar, filterKey }) => {
          const clickable = !!filterKey;
          const active = clickable && filterMode === filterKey;
          const card = (
            <Card
              className={`card-lift overflow-hidden${clickable ? " cursor-pointer" : ""}${active ? " ring-2 ring-primary" : ""}`}
            >
              <CardContent className="flex flex-col gap-3 py-5">
                <div className="flex items-center gap-4">
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
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (value / total) * 100)}%`,
                      backgroundColor: `hsl(var(${colorVar}))`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          );
          return clickable ? (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => setFilterMode((m) => (m === filterKey ? "all" : filterKey!))}
              className="block text-left focus-visible:outline-none"
            >
              {card}
            </button>
          ) : (
            <div key={key}>{card}</div>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
        <Link href="/divisional-secretariat/review" className="block focus-visible:outline-none">
          <Card className="card-lift h-full border-primary/20 bg-primary/5">
            <CardContent className="flex items-center gap-4 py-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <ClipboardList className="size-5" aria-hidden="true" />
              </span>
              <div className="flex-1">
                <p className="text-fluid-base font-medium text-foreground">
                  <Bilingual en="Open Review Queue" si="සමාලෝචන පෝලිම විවෘත කරන්න" />
                </p>
                <p className="text-fluid-sm text-muted-foreground">
                  <Bilingual
                    en={`${counts.submitted} submission(s) awaiting your decision`}
                    si={`ඉදිරිපත් කිරීම් ${counts.submitted} ක් ඔබගේ තීරණය බලාපොරොත්තුවෙන්`}
                  />
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/divisional-secretariat/summary" className="block focus-visible:outline-none">
          <Card className="card-lift h-full border-accent/30 bg-accent/5">
            <CardContent className="flex items-center gap-4 py-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent-deep">
                <BarChart3 className="size-5" aria-hidden="true" />
              </span>
              <div className="flex-1">
                <p className="text-fluid-base font-medium text-foreground">
                  <Bilingual en="View Summary" si="සාරාංශය බලන්න" />
                </p>
                <p className="text-fluid-sm text-muted-foreground">
                  <Bilingual
                    en="Approval rate, turnaround time, and division breakdown"
                    si="අනුමැති අනුපාතය, ප්‍රතිචාර කාලය සහ වසම් බෙදීම"
                  />
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* GN division roster */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-fluid-lg font-semibold text-foreground">
          {filterMode === "pending" && <Bilingual en="Pending GN Divisions" si="ඉදිරිපත් කර නැති ග්‍රාම නිලධාරී වසම්" />}
          {filterMode === "unregistered" && <Bilingual en="GN Divisions Without an Officer" si="නිලධාරියෙක් නොමැති ග්‍රාම නිලධාරී වසම්" />}
          {filterMode === "all" && <Bilingual en="GN Divisions in Your Area" si="ඔබගේ ප්‍රදේශයේ ග්‍රාම නිලධාරී වසම්" />}
        </h2>
        {filterMode !== "all" && (
          <Button variant="ghost" size="sm" onClick={() => setFilterMode("all")}>
            <Bilingual en="Show all" si="සියල්ල පෙන්වන්න" />
          </Button>
        )}
      </div>

      {displayedRoster.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-24 items-center justify-center text-fluid-sm text-muted-foreground">
            {filterMode === "pending" && (
              <Bilingual en="No pending GN divisions — every division has an officer who has submitted." si="ඉදිරිපත් කර නැති ග්‍රාම නිලධාරී වසම් නැත." />
            )}
            {filterMode === "unregistered" && (
              <Bilingual en="Every GN division in your area has a registered officer." si="ඔබගේ ප්‍රදේශයේ සෑම ග්‍රාම නිලධාරී වසමකටම ලියාපදිංචි නිලධාරියෙක් සිටී." />
            )}
            {filterMode === "all" && (
              <Bilingual en="No GN divisions found for your area." si="ඔබගේ ප්‍රදේශය සඳහා ග්‍රාම නිලධාරී වසම් හමු නොවීය." />
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(clamp(220px,28vw,300px),1fr))] gap-4">
          {displayedRoster.map((gn) => {
            const submission = submissionByGn.get(gn.id);
            const colorVar = !submission
              ? "--border"
              : submission.status === "SUBMITTED" || submission.status === "REVISION_NEEDED"
                ? "--status-pending"
                : submission.status === "APPROVED"
                  ? "--status-approved"
                  : submission.status === "REJECTED"
                    ? "--status-rejected"
                    : "--muted-foreground";
            return (
              <Card
                key={gn.id}
                className="card-lift overflow-hidden border-l-4"
                style={{ borderLeftColor: `hsl(var(${colorVar}))` }}
              >
                <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
                  <CardTitle className="text-fluid-base">{lang === "si" ? gn.si : gn.en}</CardTitle>
                  {submission ? (
                    <Badge variant="outline" className={STATUS_BADGE_CLASS[submission.status]}>
                      {STATUS_LABEL[submission.status][lang]}
                    </Badge>
                  ) : officerInfoByGn.get(gn.id)?.officerRegistered ? (
                    <Badge variant="outline" className="text-muted-foreground">
                      <Bilingual en="Not submitted" si="ඉදිරිපත් කර නැත" />
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-[hsl(var(--status-rejected))]/30 bg-[hsl(var(--status-rejected))]/15 text-[hsl(var(--status-rejected))]">
                      <Bilingual en="No Officer" si="නිලධාරියෙක් නැත" />
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {submission ? (
                    <>
                      <p className="text-fluid-sm text-muted-foreground">{submission.submittedBy.name}</p>
                      <Button asChild size="sm" variant="outline" className="touch-target w-fit gap-1.5">
                        <Link href={`/divisional-secretariat/review/${submission.id}`}>
                          <Eye className="size-4" />
                          <Bilingual en="View" si="බලන්න" />
                        </Link>
                      </Button>
                    </>
                  ) : officerInfoByGn.get(gn.id)?.officerRegistered ? (
                    <p className="text-fluid-sm text-muted-foreground">
                      {officerInfoByGn.get(gn.id)?.officer && <span className="block text-foreground">{officerInfoByGn.get(gn.id)?.officer}</span>}
                      <Bilingual en="Registered — awaiting submission." si="ලියාපදිංචි කර ඇත — ඉදිරිපත් කිරීම බලාපොරොත්තුවෙන්." />
                    </p>
                  ) : (
                    <p className="text-fluid-sm text-muted-foreground">
                      <Bilingual en="No officer registered for this GN division." si="මෙම වසම සඳහා නිලධාරියෙක් ලියාපදිංචි කර නැත." />
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
