"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Users, TrendingUp, CheckCircle2, RefreshCw,
  Download, FileSpreadsheet, FileText, Table, BarChart3, Venus,
  ChevronDown, MapPin, Filter, X, Home, Vote, Globe, Accessibility, ChevronRight, Check,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList,
} from "recharts";
import { CURRENT_YEAR } from "@/lib/constants";
import { GN_DIVISIONS } from "@/lib/registration-data";
import type {
  HousingAggregate, EmploymentAggregate, EducationAggregate, HealthAggregate,
  EconomicAgricultureAggregate, CommunityWelfareAggregate, InfrastructureAggregate, AreaProfileAggregate,
} from "@/lib/analytics/aggregate-sections";
import { HousingTab } from "@/components/dashboard/tabs/HousingTab";
import { EmploymentTab } from "@/components/dashboard/tabs/EmploymentTab";
import { EducationTab } from "@/components/dashboard/tabs/EducationTab";
import { HealthTab } from "@/components/dashboard/tabs/HealthTab";
import { AgricultureEconomyTab } from "@/components/dashboard/tabs/AgricultureEconomyTab";
import { CommunityOrganizationsTab } from "@/components/dashboard/tabs/CommunityOrganizationsTab";
import { SocialWelfareTab } from "@/components/dashboard/tabs/SocialWelfareTab";
import { InfrastructureTab } from "@/components/dashboard/tabs/InfrastructureTab";
import { PhysicalEnvironmentTab } from "@/components/dashboard/tabs/PhysicalEnvironmentTab";
import { ReligiousCulturalTab } from "@/components/dashboard/tabs/ReligiousCulturalTab";
import { TourismTab } from "@/components/dashboard/tabs/TourismTab";
import { WasteManagementTab } from "@/components/dashboard/tabs/WasteManagementTab";
import { IdentificationTab } from "@/components/dashboard/tabs/IdentificationTab";

/* ─── Brand tokens ─────────────────────────────────────────────────────── */
const NAVY   = "#0E2B4E";
const GOLD   = "#BC9144";
const GOLD_D = "#915F2F";
const MAROON = "#66261E";
const GREEN  = "#2D7A51";
const ROSE   = "#B5495B";

interface SexCountTotal { female: number; male: number; total: number; }
interface CategoryBreakdownRow extends SexCountTotal { key: string; en: string; si: string; }

interface DemographicsAggregate {
  totalPopulation: number;
  female: number;
  male: number;
  femalePercentage: number | null;
  populationByAge: (SexCountTotal & { band: string; en: string; si: string })[];
  populationByEthnicity: CategoryBreakdownRow[];
  populationByReligion: CategoryBreakdownRow[];
  disabilities: CategoryBreakdownRow[];
  disabilitiesTotal: number;
  foreignNationals: SexCountTotal;
  registeredVoters: SexCountTotal;
  households: { total: number; femaleHeaded: number; displaced: number };
}

interface GnBreakdownRow {
  gnId: string;
  gnName: string;
  gnNameSi: string;
  officer: string | null;
  status: string | null;
  createdAt: string | null;
  reviewedAt: string | null;
  demographics: DemographicsAggregate | null;
}

interface AnalyticsPayload {
  ok: boolean;
  scope: {
    role: string;
    dsDivision: { id: string; en: string; si: string } | null;
    district: { id: string; en: string; si: string } | null;
  };
  year: number;
  demographics: DemographicsAggregate;
  sections: {
    housing: HousingAggregate;
    employment: EmploymentAggregate;
    education: EducationAggregate;
    health: HealthAggregate;
    economicAgriculture: EconomicAgricultureAggregate;
    communityWelfare: CommunityWelfareAggregate;
    infrastructure: InfrastructureAggregate;
    areaProfile: AreaProfileAggregate;
  };
  funnel: { notStarted: number; submitted: number; revisionNeeded: number; approved: number; rejected: number; draft: number };
  approvalRate: number | null;
  avgDecisionDays: number | null;
  totalGnDivisions: number;
  totalSubmissions: number;
  trend: { key: string; month: string; approved: number; pending: number; rejected: number }[];
  gnBreakdown: GnBreakdownRow[];
}

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  SUBMITTED:        { bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
  APPROVED:         { bg: "#ecfdf5", color: "#065f46", border: "#a7f3d0" },
  REJECTED:         { bg: "#fff1f2", color: "#9f1239", border: "#fecdd3" },
  REVISION_NEEDED:  { bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
  DRAFT:            { bg: "#f3f4f6", color: "#374151", border: "#d1d5db" },
};

function StatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
        style={{ background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db" }}
      >
        Not submitted
      </span>
    );
  }
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, iconBg }: {
  icon: React.ElementType; label: string; value: string | number; sub: string; iconBg: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", boxShadow: "0 1px 3px rgba(14,43,78,0.06)" }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(14,43,78,0.10)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(14,43,78,0.06)")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "hsl(var(--muted-foreground))", letterSpacing: "0.1em" }}>
            {label}
          </p>
          <p className="text-3xl font-bold leading-none" style={{ fontFamily: "'DM Sans','Inter',sans-serif", fontVariantNumeric: "tabular-nums", color: "hsl(var(--foreground))" }}>
            {value}
          </p>
          <p className="text-[12px] mt-2" style={{ color: "hsl(var(--muted-foreground))" }}>{sub}</p>
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
          <Icon size={20} color="#fff" />
        </div>
      </div>
    </div>
  );
}

/* Compact tile for single numbers (households, voters, foreign nationals) */
function MiniStat({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3"
      style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}1A` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] truncate" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</p>
        <p className="text-[15px] font-bold truncate" style={{ fontVariantNumeric: "tabular-nums", color: "hsl(var(--foreground))" }}>{value}</p>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 text-xs" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", boxShadow: "0 10px 30px rgba(0,0,0,0.10)" }}>
      {label && <p className="font-bold mb-1.5" style={{ color: "hsl(var(--foreground))" }}>{label}</p>}
      {payload.map((p: any) => (
        <p key={p.dataKey ?? p.name} className="capitalize" style={{ color: p.color ?? p.payload?.fill }}>
          {p.name}: <strong>{Math.abs(p.value)}</strong>
        </p>
      ))}
    </div>
  );
}

function PeriodBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="px-3.5 py-2 text-[12px] font-semibold transition-colors"
      style={{ background: active ? NAVY : "transparent", color: active ? "#fff" : "hsl(var(--muted-foreground))" }}
    >
      {label}
    </button>
  );
}

function GhostBtn({ onClick, icon: Icon, label, busy }: { onClick?: () => void; icon: React.ElementType; label: string; busy?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3.5 py-2 text-[12.5px] font-semibold rounded-xl transition-all"
      style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--muted))")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--card))")}
    >
      <Icon size={14} className={busy ? "animate-spin" : ""} /> {label}
    </button>
  );
}

interface ExportScope {
  label: string;
  queryString: string;
}

/** Export menu with an explicit scope toggle — "This GN Division" only appears when exactly
 *  one GN division is selected in the filter (otherwise there's no single unambiguous division
 *  to isolate, so only the broader scope is offered). */
function ExportMenu({ scopes }: { scopes: ExportScope[] }) {
  const [open, setOpen] = useState(false);
  const [scopeIndex, setScopeIndex] = useState(0);
  const scope = scopes[Math.min(scopeIndex, scopes.length - 1)] ?? scopes[0];

  const FORMATS = [
    { key: "excel", label: "Download Excel", icon: FileSpreadsheet, color: GREEN, path: "/api/export/excel" },
    { key: "csv", label: "Download CSV", icon: Table, color: GOLD_D, path: "/api/export/csv" },
    { key: "pdf", label: "Download PDF Summary", icon: FileText, color: MAROON, path: "/api/export/pdf" },
  ] as const;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-3.5 py-2 text-[12.5px] font-semibold rounded-xl text-white transition-all"
        style={{ background: `linear-gradient(135deg, #163B66 0%, ${NAVY} 100%)`, boxShadow: "0 2px 8px rgba(14,43,78,0.25)" }}
      >
        <Download size={14} /> Export <ChevronDown size={13} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-(--z-overlay)" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 z-(--z-popover) w-64 rounded-xl overflow-hidden"
            style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--background))", boxShadow: "0 10px 30px rgba(0,0,0,0.12)" }}
          >
            {scopes.length > 1 && (
              <div className="p-2" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                <p className="px-2 pb-1.5 text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>Scope</p>
                {scopes.map((s, i) => (
                  <button
                    key={s.label}
                    onClick={() => setScopeIndex(i)}
                    className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-left transition-colors"
                    style={{ background: scopeIndex === i ? "rgba(188,145,68,0.10)" : "transparent", color: scopeIndex === i ? GOLD_D : "hsl(var(--foreground))" }}
                  >
                    <span className="truncate">{s.label}</span>
                    {scopeIndex === i && <Check size={13} className="shrink-0" />}
                  </button>
                ))}
              </div>
            )}
            <div className="p-1">
              {FORMATS.map((f) => (
                <a
                  key={f.key}
                  href={`${f.path}?${scope.queryString}`}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[12.5px] transition-colors text-left"
                  style={{ color: "hsl(var(--foreground))" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--muted))")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  onClick={() => setOpen(false)}
                >
                  <f.icon size={13} style={{ color: f.color }} /> {f.label}
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* Searchable multi-select for GN divisions */
function GnDivisionFilter({
  options, selected, onChange,
}: { options: { id: string; en: string }[]; selected: string[]; onChange: (ids: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter((o) => o.en.toLowerCase().includes(search.toLowerCase()));
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-3.5 py-2 text-[12.5px] font-semibold rounded-xl transition-colors"
        style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
      >
        <Filter size={14} />
        {selected.length === 0 ? "All GN Divisions" : `${selected.length} GN Division${selected.length > 1 ? "s" : ""}`}
        <ChevronDown size={13} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-(--z-overlay)" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full mt-1 z-(--z-popover) w-72 rounded-xl overflow-hidden flex flex-col"
            style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--background))", boxShadow: "0 10px 30px rgba(0,0,0,0.12)", maxHeight: 340 }}
          >
            <div className="p-2 shrink-0" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search GN division..."
                className="w-full h-8 px-2.5 rounded-lg text-[12px] focus:outline-none"
                style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--input))", color: "hsl(var(--foreground))" }}
              />
            </div>
            <div className="overflow-y-auto flex-1">
              {filtered.length === 0 && (
                <p className="px-3 py-4 text-[12px] text-center" style={{ color: "hsl(var(--muted-foreground))" }}>No matches</p>
              )}
              {filtered.map((o) => (
                <label
                  key={o.id}
                  className="flex items-center gap-2 px-3 py-2 text-[12.5px] cursor-pointer transition-colors"
                  style={{ color: "hsl(var(--foreground))" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--muted))")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <input type="checkbox" checked={selected.includes(o.id)} onChange={() => toggle(o.id)} className="shrink-0" />
                  <span className="truncate">{o.en}</span>
                </label>
              ))}
            </div>
            {selected.length > 0 && (
              <div className="p-2 shrink-0" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                <button
                  onClick={() => onChange([])}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-semibold"
                  style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))" }}
                >
                  <X size={12} /> Clear selection
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "hsl(var(--muted))" }} />
        ))}
      </div>
      <div className="h-72 w-full rounded-2xl animate-pulse" style={{ background: "hsl(var(--muted))" }} />
    </div>
  );
}

/* Expandable per-GN-division demographic mini-summary */
function GnDrillDownRow({ row, isExpanded, onToggle }: { row: GnBreakdownRow; isExpanded: boolean; onToggle: () => void }) {
  const d = row.demographics;
  const topEthnicity = d ? [...d.populationByEthnicity].sort((a, b) => b.total - a.total)[0] : null;
  const topReligion = d ? [...d.populationByReligion].sort((a, b) => b.total - a.total)[0] : null;

  return (
    <>
      <tr
        onClick={onToggle}
        className="cursor-pointer transition-colors"
        style={{ borderBottom: isExpanded ? "none" : "1px solid hsl(var(--border))" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--muted))")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <td className="px-5 py-3 text-[13px] font-medium" style={{ color: "hsl(var(--foreground))" }}>
          <div className="flex items-center gap-1.5">
            <ChevronRight size={13} style={{ transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform 150ms", color: "hsl(var(--muted-foreground))" }} />
            {row.gnName}
          </div>
        </td>
        <td className="px-5 py-3 text-[12.5px]" style={{ color: "hsl(var(--muted-foreground))" }}>{row.officer ?? "—"}</td>
        <td className="px-5 py-3"><StatusBadge status={row.status} /></td>
        <td className="px-5 py-3 text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
        </td>
        <td className="px-5 py-3 text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
          {row.reviewedAt ? new Date(row.reviewedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
        </td>
      </tr>
      {isExpanded && (
        <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          <td colSpan={5} className="px-5 pb-4 pt-1" style={{ background: "hsl(var(--muted)/0.4)" }}>
            {!d || d.totalPopulation === 0 ? (
              <p className="text-[12px] py-3" style={{ color: "hsl(var(--muted-foreground))" }}>No demographic data submitted for this GN division yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3">
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>Population</p>
                  <p className="text-[15px] font-bold" style={{ color: "hsl(var(--foreground))" }}>{d.totalPopulation.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>Female %</p>
                  <p className="text-[15px] font-bold" style={{ color: ROSE }}>{d.femalePercentage !== null ? `${d.femalePercentage}%` : "—"}</p>
                </div>
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>Top Ethnicity</p>
                  <p className="text-[13px] font-semibold" style={{ color: "hsl(var(--foreground))" }}>{topEthnicity && topEthnicity.total > 0 ? `${topEthnicity.en} (${topEthnicity.total})` : "—"}</p>
                </div>
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>Top Religion</p>
                  <p className="text-[13px] font-semibold" style={{ color: "hsl(var(--foreground))" }}>{topReligion && topReligion.total > 0 ? `${topReligion.en} (${topReligion.total})` : "—"}</p>
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

/** One tab per Economic Development Officer form section — 14 total, matching the EDO
 *  entry form exactly (SECTION_KEYS in lib/types/submission.ts), so Admin and Super Admin
 *  always see the identical full set with no ambiguity about what's included. */
const SECTION_TABS = [
  { key: "identification", label: "Identification" },
  { key: "physicalEnvironment", label: "Physical Environment" },
  { key: "demographics", label: "Demographics" },
  { key: "housing", label: "Housing" },
  { key: "employment", label: "Employment" },
  { key: "education", label: "Education" },
  { key: "religiousCultural", label: "Religious & Cultural" },
  { key: "health", label: "Health" },
  { key: "economicAgriculture", label: "Agriculture & Economy" },
  { key: "roadInfrastructure", label: "Infrastructure" },
  { key: "socialWelfare", label: "Social Welfare" },
  { key: "communityOrganizations", label: "Community Organizations" },
  { key: "tourism", label: "Tourism" },
  { key: "wasteDisaster", label: "Waste Management" },
] as const;
type SectionTabKey = (typeof SECTION_TABS)[number]["key"];

export function DivisionSummaryPanel({ dsDivision, district }: { dsDivision?: string; district?: string }) {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [gnFilter, setGnFilter] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payload, setPayload] = useState<AnalyticsPayload | null>(null);
  const [expandedGn, setExpandedGn] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SectionTabKey>("demographics");

  const queryString = useMemo(() => {
    const params = new URLSearchParams({ year: String(CURRENT_YEAR) });
    if (dsDivision) params.set("dsDivision", dsDivision);
    else if (district) params.set("district", district);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (gnFilter.length > 0) params.set("gnDivisions", gnFilter.join(","));
    return params.toString();
  }, [dsDivision, district, statusFilter, gnFilter]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/analytics?${queryString}`);
      const json = await res.json();
      if (json.ok) setPayload(json);
    } catch {
      // best-effort; keep previous state on transient errors
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [queryString]);

  useEffect(() => { setLoading(true); fetchData(); }, [fetchData]);

  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const gnOptions = useMemo(() => {
    if (dsDivision) return GN_DIVISIONS.filter((gn) => gn.dsId === dsDivision).map((gn) => ({ id: gn.id, en: gn.en }));
    return GN_DIVISIONS.map((gn) => ({ id: gn.id, en: gn.en }));
  }, [dsDivision]);

  /** Export scope options — "This GN Division" only appears when exactly one is selected in the filter. */
  const exportScopes = useMemo(() => {
    const wholeParams = new URLSearchParams({ year: String(CURRENT_YEAR) });
    if (dsDivision) wholeParams.set("dsDivision", dsDivision);
    else if (district) wholeParams.set("district", district);
    if (statusFilter !== "all") wholeParams.set("status", statusFilter);
    const wholeLabel = dsDivision
      ? `Entire Division${payload?.scope.dsDivision ? ` (${payload.scope.dsDivision.en})` : ""}`
      : district
        ? `Entire District${payload?.scope.district ? ` (${payload.scope.district.en})` : ""}`
        : "All Districts";

    const scopes: ExportScope[] = [{ label: wholeLabel, queryString: wholeParams.toString() }];

    if (gnFilter.length === 1) {
      const gn = gnOptions.find((g) => g.id === gnFilter[0]);
      scopes.unshift({ label: `This GN Division${gn ? ` (${gn.en})` : ""}`, queryString });
    }

    return scopes;
  }, [dsDivision, district, statusFilter, gnFilter, gnOptions, queryString, payload]);

  const funnelChartData = useMemo(() => {
    if (!payload) return [];
    const { funnel } = payload;
    return [
      { label: "Not Started",     value: funnel.notStarted,     fill: "#8A8577" },
      { label: "Submitted",       value: funnel.submitted,      fill: GOLD },
      { label: "Revision Needed", value: funnel.revisionNeeded, fill: GOLD_D },
      { label: "Approved",        value: funnel.approved,       fill: GREEN },
      { label: "Rejected",        value: funnel.rejected,       fill: MAROON },
    ];
  }, [payload]);

  const genderData = useMemo(() => {
    if (!payload) return [];
    const { female, male } = payload.demographics;
    if (female + male === 0) return [];
    return [
      { name: "Female", value: female, color: ROSE },
      { name: "Male", value: male, color: NAVY },
    ];
  }, [payload]);

  const agePyramidData = useMemo(() => {
    if (!payload) return [];
    return payload.demographics.populationByAge.map((a) => ({ band: a.en, female: a.female, male: -a.male }));
  }, [payload]);

  const ethnicityChartData = useMemo(() => {
    if (!payload) return [];
    return payload.demographics.populationByEthnicity.map((e) => ({ label: e.en, female: e.female, male: e.male }));
  }, [payload]);

  const religionData = useMemo(() => {
    if (!payload) return [];
    const colors = [GREEN, GOLD, MAROON, NAVY, "#8A8577"];
    return payload.demographics.populationByReligion
      .filter((r) => r.total > 0)
      .map((r, i) => ({ name: r.en, value: r.total, color: colors[i % colors.length] }));
  }, [payload]);

  const disabilityChartData = useMemo(() => {
    if (!payload) return [];
    return payload.demographics.disabilities
      .filter((d) => d.total > 0)
      .sort((a, b) => b.total - a.total)
      .map((d) => ({ label: d.en, value: d.total, fill: MAROON }));
  }, [payload]);

  if (loading) return <SummarySkeleton />;
  if (!payload) return <p className="text-[13px] py-8 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>Unable to load data.</p>;

  const { demographics, approvalRate, avgDecisionDays, totalGnDivisions, totalSubmissions } = payload;

  return (
    <div className="space-y-6">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[13px]" style={{ color: "hsl(var(--muted-foreground))" }}>
          <MapPin size={14} />
          {payload.scope.dsDivision ? (
            <span>
              <strong style={{ color: "hsl(var(--foreground))" }}>{payload.scope.dsDivision.en}</strong>
              {payload.scope.district ? ` · ${payload.scope.district.en} District` : ""}
            </span>
          ) : (
            <span><strong style={{ color: "hsl(var(--foreground))" }}>All Districts</strong> · Southern Province</span>
          )}
          {" · "}{payload.year}/{(payload.year + 1) % 100}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}>
            {(["7d", "30d", "90d"] as const).map((p) => (
              <PeriodBtn key={p} active={period === p} onClick={() => setPeriod(p)} label={p} />
            ))}
          </div>
          <GhostBtn icon={RefreshCw} label="Refresh" onClick={handleRefresh} busy={refreshing} />
          <ExportMenu scopes={exportScopes} />
        </div>
      </div>

      {/* Data filters — real, server-side (re-fetches on change) */}
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl p-3"
        style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
      >
        <span className="text-[11.5px] font-bold uppercase tracking-wider px-1" style={{ color: "hsl(var(--muted-foreground))" }}>Filters</span>
        <GnDivisionFilter options={gnOptions} selected={gnFilter} onChange={setGnFilter} />
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "SUBMITTED", "APPROVED", "REJECTED", "REVISION_NEEDED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold capitalize transition-colors"
              style={statusFilter === s
                ? { background: NAVY, color: "#fff" }
                : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }
              }
            >
              {s === "all" ? "All Status" : s.replace("_", " ").toLowerCase()}
            </button>
          ))}
        </div>
        {(gnFilter.length > 0 || statusFilter !== "all") && (
          <button
            onClick={() => { setGnFilter([]); setStatusFilter("all"); }}
            className="flex items-center gap-1 text-[11.5px] font-semibold ml-auto"
            style={{ color: GOLD_D }}
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        {SECTION_TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-3.5 py-2.5 text-[12.5px] font-semibold whitespace-nowrap transition-colors relative shrink-0"
              style={{ color: active ? NAVY : "hsl(var(--muted-foreground))" }}
            >
              {tab.label}
              {active && <span className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full" style={{ background: GOLD }} />}
            </button>
          );
        })}
      </div>

      {activeTab === "housing" && <HousingTab data={payload.sections.housing} />}
      {activeTab === "employment" && <EmploymentTab data={payload.sections.employment} />}
      {activeTab === "education" && <EducationTab data={payload.sections.education} />}
      {activeTab === "health" && <HealthTab data={payload.sections.health} />}
      {activeTab === "economicAgriculture" && <AgricultureEconomyTab data={payload.sections.economicAgriculture} />}
      {activeTab === "communityOrganizations" && <CommunityOrganizationsTab data={payload.sections.communityWelfare} />}
      {activeTab === "socialWelfare" && <SocialWelfareTab data={payload.sections.communityWelfare} />}
      {activeTab === "roadInfrastructure" && <InfrastructureTab data={payload.sections.infrastructure} />}
      {activeTab === "physicalEnvironment" && <PhysicalEnvironmentTab data={payload.sections.areaProfile} />}
      {activeTab === "religiousCultural" && <ReligiousCulturalTab data={payload.sections.areaProfile} />}
      {activeTab === "tourism" && <TourismTab data={payload.sections.areaProfile} />}
      {activeTab === "wasteDisaster" && <WasteManagementTab data={payload.sections.areaProfile} />}
      {activeTab === "identification" && <IdentificationTab data={payload.sections.areaProfile} />}

      {activeTab === "demographics" && <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Users} label="Total Population" value={demographics.totalPopulation.toLocaleString()}
          sub={`${demographics.households.total.toLocaleString()} households`} iconBg={NAVY}
        />
        <StatCard
          icon={Venus} label="Female Population" value={demographics.femalePercentage !== null ? `${demographics.femalePercentage}%` : "—"}
          sub={`${demographics.female.toLocaleString()} of ${demographics.totalPopulation.toLocaleString()}`} iconBg={ROSE}
        />
        <StatCard
          icon={CheckCircle2} label="Approval Rate" value={approvalRate !== null ? `${approvalRate}%` : "—"}
          sub={avgDecisionDays !== null ? `${avgDecisionDays}d avg. decision time` : "No decisions yet"} iconBg={GREEN}
        />
        <StatCard
          icon={BarChart3} label="GN Divisions Reporting" value={`${totalSubmissions}/${totalGnDivisions}`}
          sub={`${Math.max(0, totalGnDivisions - totalSubmissions)} not yet submitted`} iconBg={GOLD_D}
        />
      </div>

      {/* Compact demographic tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat icon={Home} label="Female-Headed Households" value={demographics.households.femaleHeaded.toLocaleString()} color={ROSE} />
        <MiniStat icon={Home} label="Displaced Households" value={demographics.households.displaced.toLocaleString()} color={GOLD_D} />
        <MiniStat icon={Vote} label="Registered Voters" value={demographics.registeredVoters.total.toLocaleString()} color={NAVY} />
        <MiniStat icon={Globe} label="Foreign Nationals" value={demographics.foreignNationals.total.toLocaleString()} color={GREEN} />
      </div>

      {/* Charts row 1: funnel + gender donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-[15px]" style={{ color: "hsl(var(--foreground))" }}>Submission Stage Breakdown</h2>
              <p className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>Across GN divisions in scope/filter</p>
            </div>
            <BarChart3 size={18} style={{ color: "hsl(var(--muted-foreground))" }} />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelChartData} layout="vertical" margin={{ top: 4, right: 32, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" strokeOpacity={0.7} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="label" width={110} tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={26}>
                  {funnelChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  <LabelList dataKey="value" position="right" style={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          <div className="mb-4">
            <h2 className="font-semibold text-[15px]" style={{ color: "hsl(var(--foreground))" }}>Gender Distribution</h2>
            <p className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>Total population by sex</p>
          </div>
          {genderData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                    {genderData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="mt-4 space-y-2.5">
                {genderData.map((r) => (
                  <li key={r.name} className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.color }} />
                    <span className="text-[12px] flex-1" style={{ color: "hsl(var(--muted-foreground))" }}>{r.name}</span>
                    <span className="text-[12px] font-bold" style={{ fontVariantNumeric: "tabular-nums", color: "hsl(var(--foreground))" }}>
                      {r.value.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-[12px] py-8 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>No demographic data yet</p>
          )}
        </div>
      </div>

      {/* Charts row 2: age pyramid + religion donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          <div className="mb-5">
            <h2 className="font-semibold text-[15px]" style={{ color: "hsl(var(--foreground))" }}>Population Pyramid by Age</h2>
            <p className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>Male (left) vs Female (right)</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agePyramidData} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }} stackOffset="sign">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" strokeOpacity={0.7} />
                <XAxis type="number" tickFormatter={(v) => Math.abs(v).toString()} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="band" width={80} tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} formatter={(v) => (v === "male" ? "Male" : "Female")} />
                <Bar dataKey="male" name="male" fill={NAVY} radius={[4, 0, 0, 4]} maxBarSize={20} />
                <Bar dataKey="female" name="female" fill={ROSE} radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          <div className="mb-4">
            <h2 className="font-semibold text-[15px]" style={{ color: "hsl(var(--foreground))" }}>Population by Religion</h2>
            <p className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>Total population</p>
          </div>
          {religionData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={religionData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                    {religionData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="mt-4 space-y-2">
                {religionData.map((r) => (
                  <li key={r.name} className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.color }} />
                    <span className="text-[12px] flex-1 truncate" style={{ color: "hsl(var(--muted-foreground))" }}>{r.name}</span>
                    <span className="text-[12px] font-bold" style={{ fontVariantNumeric: "tabular-nums", color: "hsl(var(--foreground))" }}>{r.value.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-[12px] py-8 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>No religion data yet</p>
          )}
        </div>
      </div>

      {/* Charts row 3: ethnicity + disabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          <div className="mb-5">
            <h2 className="font-semibold text-[15px]" style={{ color: "hsl(var(--foreground))" }}>Population by Ethnicity</h2>
            <p className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>Female vs Male</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ethnicityChartData} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.7} />
                <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="female" name="Female" fill={ROSE} radius={[4, 4, 0, 0]} maxBarSize={18} />
                <Bar dataKey="male" name="Male" fill={NAVY} radius={[4, 4, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-[15px]" style={{ color: "hsl(var(--foreground))" }}>Persons with Disabilities</h2>
              <p className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>{demographics.disabilitiesTotal.toLocaleString()} total, by type</p>
            </div>
            <Accessibility size={18} style={{ color: "hsl(var(--muted-foreground))" }} />
          </div>
          {disabilityChartData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={disabilityChartData} layout="vertical" margin={{ top: 4, right: 32, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" strokeOpacity={0.7} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="label" width={140} tick={{ fontSize: 10.5, fill: "hsl(var(--foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                  <Bar dataKey="value" fill={MAROON} radius={[0, 4, 4, 0]} maxBarSize={16}>
                    <LabelList dataKey="value" position="right" style={{ fill: "hsl(var(--foreground))", fontSize: 11, fontWeight: 600 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-[12px] py-16 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>No disability data recorded</p>
          )}
        </div>
      </div>

      {/* Trend chart */}
      <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-[15px]" style={{ color: "hsl(var(--foreground))" }}>Approval Trend</h2>
            <p className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>Last 6 months</p>
          </div>
          <TrendingUp size={18} style={{ color: "hsl(var(--muted-foreground))" }} />
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={payload.trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gApproved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={GREEN} stopOpacity={0.2} />
                <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gPending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={GOLD} stopOpacity={0.2} />
                <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.7} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
            <Area type="monotone" dataKey="approved" name="Approved" stroke={GREEN} strokeWidth={2.5} fill="url(#gApproved)" dot={{ r: 3, fill: GREEN }} />
            <Area type="monotone" dataKey="pending" name="Pending" stroke={GOLD} strokeWidth={2.5} fill="url(#gPending)" dot={{ r: 3, fill: GOLD }} />
            <Area type="monotone" dataKey="rejected" name="Rejected" stroke={MAROON} strokeWidth={2.5} fill="none" dot={{ r: 3, fill: MAROON }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* GN Division breakdown table with per-row drill-down */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
        <div className="flex items-center justify-between px-5 py-4 flex-wrap gap-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          <h2 className="font-bold text-[14.5px]" style={{ color: "hsl(var(--foreground))" }}>GN Division Breakdown</h2>
          <p className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>Click a row to view its own demographic summary</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--muted))" }}>
                {["GN Division", "Officer", "Status", "Submitted", "Decided"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payload.gnBreakdown.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-[12.5px]" style={{ color: "hsl(var(--muted-foreground))" }}>No divisions match this filter</td></tr>
              )}
              {payload.gnBreakdown.map((row) => (
                <GnDrillDownRow
                  key={row.gnId}
                  row={row}
                  isExpanded={expandedGn === row.gnId}
                  onToggle={() => setExpandedGn(expandedGn === row.gnId ? null : row.gnId)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>}
    </div>
  );
}
