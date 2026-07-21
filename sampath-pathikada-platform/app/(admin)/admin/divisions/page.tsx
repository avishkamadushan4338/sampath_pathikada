"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import {
  MapPinned, Search, User, Loader2,
  CircleDashed, UserX, FileEdit, Inbox, MessageSquareWarning, CheckCircle2, XCircle,
} from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { DIVISIONAL_SECRETARIATS, DISTRICTS } from "@/lib/registration-data";
import { CURRENT_YEAR } from "@/lib/constants";

const NAVY = "#0E2B4E";

type GnStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "REVISION_NEEDED" | null;

interface GnBreakdownRow {
  gnId: string;
  gnName: string;
  gnNameSi: string;
  officer: string | null;
  officerRegistered: boolean;
  status: GnStatus;
  createdAt: string | null;
  reviewedAt: string | null;
}

interface AnalyticsResponse {
  funnel: { notStarted: number; submitted: number; revisionNeeded: number; approved: number; rejected: number; draft: number };
  totalGnDivisions: number;
  notRegisteredCount: number;
  gnBreakdown: GnBreakdownRow[];
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Failed to load");
  return json as AnalyticsResponse;
};

const STATUS_META: Record<string, { label: string; bg: string; color: string; Icon: React.ElementType }> = {
  NO_OFFICER:       { label: "No Officer",      bg: "#fef2f2", color: "#991b1b", Icon: UserX },
  NOT_STARTED:      { label: "Not Started",     bg: "#f3f4f6", color: "#4b5563", Icon: CircleDashed },
  DRAFT:            { label: "Draft",           bg: "#fff7ed", color: "#7c2d12", Icon: FileEdit },
  SUBMITTED:        { label: "Under Review",    bg: "#fffbeb", color: "#92400e", Icon: Inbox },
  REVISION_NEEDED:  { label: "Revision Needed", bg: "#fffbeb", color: "#92400e", Icon: MessageSquareWarning },
  APPROVED:         { label: "Approved",        bg: "#ecfdf5", color: "#065f46", Icon: CheckCircle2 },
  REJECTED:         { label: "Rejected",        bg: "#fef2f2", color: "#991b1b", Icon: XCircle },
};

type FilterKey = "all" | "pending" | "unregistered" | "submitted" | "revision_needed" | "approved" | "rejected";

const STATUS_FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "unregistered", label: "No Officer" },
  { key: "submitted", label: "Under Review" },
  { key: "revision_needed", label: "Revision Needed" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

function matchesFilter(row: GnBreakdownRow, filter: FilterKey) {
  switch (filter) {
    case "all":             return true;
    case "pending":         return row.status === null || row.status === "DRAFT";
    case "unregistered":    return !row.officerRegistered;
    case "submitted":       return row.status === "SUBMITTED";
    case "revision_needed": return row.status === "REVISION_NEEDED";
    case "approved":        return row.status === "APPROVED";
    case "rejected":        return row.status === "REJECTED";
  }
}

export default function AdminDivisionsPage() {
  const { user, isLoading: userLoading } = useSession();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterKey>(() => {
    const raw = searchParams.get("status");
    return STATUS_FILTERS.some((f) => f.key === raw) ? (raw as FilterKey) : "all";
  });

  const division = user?.dsDivision ? DIVISIONAL_SECRETARIATS.find((d) => d.id === user.dsDivision) : undefined;
  const district = division ? DISTRICTS.find((d) => d.id === division.districtId) : undefined;

  const { data, isLoading: dataLoading } = useSWR(
    user?.dsDivision ? `/api/analytics?year=${CURRENT_YEAR}` : null,
    fetcher
  );

  const isLoading = userLoading || dataLoading;

  const rows = useMemo(() => {
    let all = data?.gnBreakdown ?? [];
    all = all.filter((r) => matchesFilter(r, statusFilter));
    if (!search.trim()) return all;
    const q = search.trim().toLowerCase();
    return all.filter((r) =>
      r.gnName.toLowerCase().includes(q) ||
      r.gnNameSi.includes(search.trim()) ||
      (r.officer?.toLowerCase().includes(q) ?? false)
    );
  }, [data, search, statusFilter]);

  const statItems = data ? [
    { label: "Total GN Divisions", value: data.totalGnDivisions,   color: NAVY, filter: "all" as FilterKey },
    { label: "Pending",            value: data.funnel.notStarted + data.funnel.draft, color: "#7c2d12", filter: "pending" as FilterKey },
    { label: "No Officer",         value: data.notRegisteredCount, color: "#991b1b", filter: "unregistered" as FilterKey },
    { label: "Under Review",       value: data.funnel.submitted,   color: "#92400e", filter: "submitted" as FilterKey },
    { label: "Revision Needed",    value: data.funnel.revisionNeeded, color: "#92400e", filter: "revision_needed" as FilterKey },
    { label: "Approved",           value: data.funnel.approved,    color: "#065f46", filter: "approved" as FilterKey },
    { label: "Rejected",           value: data.funnel.rejected,    color: "#991b1b", filter: "rejected" as FilterKey },
  ] : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: NAVY }}>
          <MapPinned size={20} color="#fff" />
        </div>
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold leading-tight"
            style={{ fontFamily: "var(--font-display,'Playfair Display',serif)", color: "hsl(var(--foreground))" }}
          >
            {division ? division.en : "Division Summary"}
          </h1>
          <p className="text-[13.5px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            {district ? `${district.en} District · Full demographic & submission breakdown` : "Assigned division data summary"}
          </p>
        </div>
      </div>

      {!userLoading && !user?.dsDivision && (
        <div className="rounded-2xl p-6 text-center" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
          <p className="text-[14px] font-semibold" style={{ color: "#92400e" }}>No division has been assigned to your account yet.</p>
        </div>
      )}

      {user?.dsDivision && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {(isLoading ? Array.from({ length: 7 }) : statItems).map((s, i) => {
              const item = s as typeof statItems[number] | undefined;
              return (
                <button
                  key={item ? item.label : i}
                  type="button"
                  disabled={!item}
                  onClick={() => item && setStatusFilter(item.filter)}
                  className="rounded-xl p-4 text-left transition-shadow hover:shadow-md disabled:cursor-default"
                  style={{
                    background: "hsl(var(--card))",
                    border: item && statusFilter === item.filter ? `1.5px solid ${item.color}` : "1px solid hsl(var(--border))",
                  }}
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {item ? item.label : "—"}
                  </p>
                  <p
                    className="text-2xl font-bold mt-1"
                    style={{ fontVariantNumeric: "tabular-nums", color: item ? item.color : "hsl(var(--muted-foreground))" }}
                  >
                    {item ? item.value : "—"}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Filter + search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--muted-foreground))" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search GN division or officer..."
                className="w-full h-10 pl-10 pr-4 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key)}
                  className="px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-colors"
                  style={statusFilter === f.key
                    ? { background: NAVY, color: "#fff", border: "1px solid transparent" }
                    : { background: "hsl(var(--card))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* GN division list */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}>
            <div className="px-5 py-3.5" style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--muted))" }}>
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>
                GN Divisions {data && `(${rows.length} of ${data.gnBreakdown.length})`}
              </p>
            </div>
            <div className="divide-y" style={{ borderColor: "hsl(var(--border))" }}>
              {isLoading && (
                <div className="px-5 py-8 flex justify-center">
                  <Loader2 className="animate-spin" size={18} style={{ color: "hsl(var(--muted-foreground))" }} />
                </div>
              )}
              {!isLoading && rows.length === 0 && (
                <p className="px-5 py-8 text-center text-[13px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                  No GN divisions match your search.
                </p>
              )}
              {rows.map((r) => {
                const meta = STATUS_META[r.status ?? (r.officerRegistered ? "NOT_STARTED" : "NO_OFFICER")];
                return (
                  <div key={r.gnId} className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-semibold truncate" style={{ color: "hsl(var(--foreground))" }}>{r.gnName}</p>
                      <p className="text-[11.5px] mt-0.5 truncate" style={{ color: "hsl(var(--muted-foreground))" }}>{r.gnNameSi}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="hidden sm:flex items-center gap-1.5 text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                        <User size={12} />
                        <span>{r.officer ?? "No officer registered"}</span>
                      </div>
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        <meta.Icon size={11} /> {meta.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
