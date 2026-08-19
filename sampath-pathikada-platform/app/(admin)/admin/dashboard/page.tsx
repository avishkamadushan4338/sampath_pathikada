"use client";

import Link from "next/link";
import useSWR from "swr";
import { FileClock, UserX, Inbox, CheckCircle2, BadgeCheck, ArrowRight } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { DISTRICTS, DIVISIONAL_SECRETARIATS, GN_DIVISIONS } from "@/lib/registration-data";
import { CURRENT_YEAR } from "@/lib/constants";

const NAVY = "#0E2B4E";
const GREEN = "#2D7A51";

interface AnalyticsResponse {
  funnel: { notStarted: number; submitted: number; revisionNeeded: number; approved: number; rejected: number; draft: number };
  totalGnDivisions: number;
  notRegisteredCount: number;
  totalSubmissions: number;
}

interface ApprovedSubmissionRow {
  id: string; gnDivision: string; updatedAt: string; submittedBy: { name: string };
}

interface ApprovedSubmissionsResponse {
  data: ApprovedSubmissionRow[];
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load");
  return json as AnalyticsResponse;
};

const submissionsFetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load");
  return json as ApprovedSubmissionsResponse;
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminDashboard() {
  const { user, isLoading: userLoading } = useSession();

  const { data, isLoading: dataLoading } = useSWR(
    user?.dsDivision ? `/api/analytics?year=${CURRENT_YEAR}` : null,
    fetcher
  );

  const { data: approvedData } = useSWR(
    user?.dsDivision ? `/api/submissions?year=${CURRENT_YEAR}&status=APPROVED&limit=5` : null,
    submissionsFetcher
  );
  const recentlyApproved = approvedData?.data ?? [];
  const gnLabel = (id: string) => GN_DIVISIONS.find((g) => g.id === id)?.en ?? id;

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const division = user?.dsDivision ? DIVISIONAL_SECRETARIATS.find((d) => d.id === user.dsDivision) : undefined;
  const district = division ? DISTRICTS.find((d) => d.id === division.districtId) : undefined;

  const isLoading = userLoading || dataLoading;

  const statItems = [
    {
      label: "Pending Submissions",
      sublabel: "No officer registered, or submission not yet started",
      value: (data?.funnel.notStarted ?? 0) + (data?.funnel.draft ?? 0),
      color: "#7c2d12",
      bg: "#fff7ed",
      Icon: FileClock,
      href: "/admin/divisions?status=pending",
    },
    {
      label: "GN Divisions Without Officer",
      sublabel: "No Economic Development Officer registered yet",
      value: data?.notRegisteredCount ?? 0,
      color: "#991b1b",
      bg: "#fef2f2",
      Icon: UserX,
      href: "/admin/divisions?status=unregistered",
    },
    {
      label: "Submissions Under Review",
      sublabel: "Submitted, awaiting your Divisional Secretariat's decision",
      value: data?.funnel.submitted ?? 0,
      color: "#92400e",
      bg: "#fffbeb",
      Icon: Inbox,
      href: "/admin/divisions?status=submitted",
    },
    {
      label: "Approved by Divisional Secretariat",
      sublabel: "Reviewed and approved for this cycle",
      value: data?.funnel.approved ?? 0,
      color: "#065f46",
      bg: "#ecfdf5",
      Icon: CheckCircle2,
      href: "/admin/divisions?status=approved",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1
          className="text-2xl sm:text-3xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-display,'Playfair Display',serif)", color: "hsl(var(--foreground))" }}
        >
          Division Overview
        </h1>
        <p className="text-[13.5px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
          {today}
          {division && (
            <> · {division.en}{district && `, ${district.en} District`} · {CURRENT_YEAR}/{(CURRENT_YEAR + 1) % 100}</>
          )}
        </p>
      </div>

      {!userLoading && !user?.dsDivision && (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
        >
          <p className="text-[14px] font-semibold" style={{ color: "#92400e" }}>
            No division has been assigned to your account yet.
          </p>
          <p className="text-[12.5px] mt-1" style={{ color: "#92400e" }}>
            Please contact your Super Admin to assign a division.
          </p>
        </div>
      )}

      {user?.dsDivision && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {statItems.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="block rounded-2xl p-5 transition-shadow hover:shadow-md"
              style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: s.bg }}
                >
                  <s.Icon size={18} style={{ color: s.color }} />
                </div>
                <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {s.label}
                </p>
              </div>
              <p className="text-3xl font-bold mt-3" style={{ fontVariantNumeric: "tabular-nums", color: s.color }}>
                {isLoading ? "—" : s.value}
              </p>
              <p className="text-[12px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                {s.sublabel}
              </p>
            </Link>
          ))}
        </div>
      )}

      {user?.dsDivision && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid hsl(var(--border))" }}
          >
            <h2 className="font-bold text-[14.5px]" style={{ color: "hsl(var(--foreground))" }}>
              Recently Approved by Divisional Secretariat
            </h2>
            <Link
              href="/admin/divisions?status=approved"
              className="flex items-center gap-1 text-[12px] font-semibold hover:underline"
              style={{ color: NAVY }}
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div>
            {recentlyApproved.length === 0 && (
              <p className="text-[12.5px] px-5 py-6 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
                {dataLoading ? "Loading…" : "No submissions fully approved yet"}
              </p>
            )}
            {recentlyApproved.map((s) => (
              <div
                key={s.id}
                className="flex items-start gap-3 px-5 py-3.5"
                style={{ borderBottom: "1px solid hsl(var(--border))" }}
              >
                <span
                  className="mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `${GREEN}1a`, color: GREEN }}
                >
                  <BadgeCheck size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate" style={{ color: "hsl(var(--foreground))" }}>
                    {gnLabel(s.gnDivision)}
                  </p>
                  <p className="text-[11px] truncate" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {s.submittedBy.name}
                  </p>
                </div>
                <span className="text-[10px] shrink-0 pt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {timeAgo(s.updatedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
